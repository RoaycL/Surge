const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const source = fs.readFileSync("public/client/surge.js", "utf8");
function context() {
  const c = {
    setTimeout,
    clearTimeout,
    Uint8Array,
    Date,
    Math,
    Number,
    Promise,
    JSON,
    Array,
    Error,
    String,
    decodeURIComponent,
    $argument: "endpoint=https://test.workers.dev/client/selection&token=test",
    $domain: "host.local",
    $persistentStore: { read: () => null, write: () => true },
    $httpClient: {
      get() {
        throw Error("unexpected HTTP");
      },
    },
    $done() {},
  };
  vm.createContext(c);
  vm.runInContext(source, c);
  return c;
}
function response(c, type, id, ttl = 120) {
  const q = Array.from(c.wire("example.com", type, id));
  q[2] = 0x81;
  q[3] = 0x80;
  q[7] = 1;
  const data =
    type === 1
      ? [1, 2, 3, 4]
      : [32, 1, 13, 184, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  return new Uint8Array(
    q.concat([192, 12, 0, type, 0, 1, 0, 0, 0, ttl, 0, data.length], data),
  );
}
test("wire IPv4 and IPv6 decode, TTL, transaction validation", () => {
  const c = context();
  assert.equal(
    c.parse(response(c, 1, 123), "example.com", 1, 123).addresses[0],
    "1.2.3.4",
  );
  assert.equal(
    c.parse(response(c, 28, 123), "example.com", 28, 123).addresses[0],
    "2001:db8:0:0:0:0:0:1",
  );
  assert.equal(c.parse(response(c, 1, 123, 0), "example.com", 1, 123).ttl, 0);
  assert.throws(() => c.parse(response(c, 1, 123), "example.com", 1, 124));
  assert.throws(() => c.parse(new Uint8Array([0]), "example.com", 1, 123));
});
test("private and bootstrap names use native DNS without cloud calls", async () => {
  const c = context();
  for (const d of [
    "printer.local",
    "appletv4k.sgponte",
    "nas.lan",
    "test.home.arpa",
    "dns.alidns.com",
    "test.workers.dev",
  ])
    assert.equal(Object.keys(await c.dns(d)).length, 0);
});
test("direct DNS goes only to selected AliDNS; binary body response", async () => {
  const c = context();
  c.$persistentStore.read = () =>
    JSON.stringify({
      url: "https://example.alidns.com/dns-query",
      expires: Date.now() + 10000,
    });
  let calls = [];
  c.$httpClient.get = (o, cb) => {
    calls.push(o.url);
    const raw = new Uint8Array(
      Buffer.from(o.url.split("?dns=")[1], "base64url"),
    );
    const id = raw[0] * 256 + raw[1],
      type = raw[raw.length - 3];
    cb(null, { status: 200 }, response(c, type, id));
  };
  const r = await c.dns("example.com");
  assert.equal(r.addresses.length, 2);
  assert.equal(calls.length, 2);
  assert(calls.every((x) => x.startsWith("https://example.alidns.com/")));
});
test("expired cache uses public DoH; failed update does not extend cache", async () => {
  const c = context();
  let stored = JSON.stringify({
      url: "https://example.alidns.com/dns-query",
      expires: 0,
    }),
    calls = [];
  c.$persistentStore.read = () => stored;
  c.$persistentStore.write = (s) => {
    stored = s;
  };
  c.$httpClient.get = (o, cb) => {
    calls.push(o.url);
    cb("fail", null, null);
  };
  assert.equal(Object.keys(await c.dns("example.com")).length, 0);
  assert(calls.every((x) => x.startsWith("https://dns.alidns.com/")));
  await assert.rejects(c.update());
  assert.equal(JSON.parse(stored).expires, 0);
});
test("compressed CNAME chain respects lowest TTL", () => {
  const c = context(),
    q = Array.from(c.wire("example.com", 1, 456));
  q[2] = 129;
  q[3] = 128;
  q[7] = 2;
  const alias = [5, ...Buffer.from("alias"), 192, 12];
  const rr1 = [192, 12, 0, 5, 0, 1, 0, 0, 0, 30, 0, alias.length, ...alias];
  const rr2 = [...alias, 0, 1, 0, 1, 0, 0, 0, 120, 0, 4, 8, 8, 8, 8];
  const r = c.parse(
    new Uint8Array([...q, ...rr1, ...rr2]),
    "example.com",
    1,
    456,
  );
  assert.equal(r.addresses[0], "8.8.8.8");
  assert.equal(r.ttl, 30);
});
test("pointer loop and truncated records are rejected", () => {
  const c = context(),
    b = response(c, 1, 123);
  b[12] = 192;
  b[13] = 12;
  assert.throws(() => c.parse(b, "example.com", 1, 123));
  assert.throws(() =>
    c.parse(response(c, 1, 123).slice(0, -1), "example.com", 1, 123),
  );
});
test("negative DNS response never returns injected address", () => {
  const c = context(),
    b = response(c, 1, 123);
  b[3] = 131;
  assert.equal(c.parse(b, "example.com", 1, 123).addresses.length, 0);
});

test("new client accepts eight-hour selection and identifies protocol version", async () => {
  const c = context();
  let saved, headers;
  c.$persistentStore.write = (s) => {
    saved = JSON.parse(s);
    return true;
  };
  c.$httpClient.get = (o, cb) => {
    headers = o.headers;
    cb(
      null,
      { status: 200 },
      JSON.stringify({
        url: "https://example.alidns.com/dns-query",
        name: "test",
        serverNow: 100,
        validUntil: 100 + 8 * 3600000,
      }),
    );
  };
  await c.update();
  assert.equal(headers["X-AliDNS-Client"], "2");
  assert(saved.expires > Date.now() + 7.9 * 3600000);
  c.$httpClient.get = (o, cb) =>
    cb(
      null,
      { status: 200 },
      JSON.stringify({
        url: "https://example.alidns.com/dns-query",
        serverNow: 0,
        validUntil: 9 * 3600000,
      }),
    );
  await assert.rejects(c.update());
});

test("panel shows active DNS, zero quota, account errors and expired fallback", () => {
  const c = context();
  const v = {
    url: "https://example.alidns.com/dns-query",
    name: "主账号",
    slot: 1,
    expires: Date.now() + 10000,
    checkedAt: Date.now(),
    syncedAt: Date.now(),
    statisticsFresh: true,
    quota: 10000000,
    reserve: 1000000,
    accounts: [
      { name: "主账号", configured: true, remaining: 0 },
      {
        name: "备用",
        configured: true,
        remaining: null,
        error: "网络请求失败",
      },
      { name: "空槽", configured: false, remaining: null },
    ],
  };
  let p = c.panel(v, "");
  assert(p.content.includes(v.url));
  assert(p.content.includes("● 主账号：0 / 1000.00 万（0.0%）"));
  assert(p.content.includes("备用：网络请求失败"));
  assert(p.content.includes("空槽：未配置"));
  v.expires = 0;
  p = c.panel(v, "更新失败");
  assert(p.title.includes("公共 DNS"));
  assert(p.content.includes("https://dns.alidns.com/dns-query"));
  assert(!p.content.includes(v.url));
  assert(p.content.includes("旧统计"));
  assert(p.content.includes("更新失败"));
});

test("one failed family keeps the other answer; grace skips slow family", async () => {
  const c = context();
  c.$httpClient.get = (o, cb) => {
    const raw = new Uint8Array(
      Buffer.from(o.url.split("?dns=")[1], "base64url"),
    );
    const id = raw[0] * 256 + raw[1],
      type = raw[raw.length - 3];
    if (type === 28) cb("failure", null, null);
    else cb(null, { status: 200 }, response(c, type, id));
  };
  assert.equal((await c.dns("example.com")).addresses[0], "1.2.3.4");
  let pending;
  c.$httpClient.get = (o, cb) => {
    const raw = new Uint8Array(
      Buffer.from(o.url.split("?dns=")[1], "base64url"),
    );
    const id = raw[0] * 256 + raw[1],
      type = raw[raw.length - 3];
    if (type === 28)
      pending = () => cb(null, { status: 200 }, response(c, type, id));
    else cb(null, { status: 200 }, response(c, type, id));
  };
  const r = await c.dns("example.com");
  assert.equal(r.addresses.length, 1);
  pending();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(r.addresses.length, 1);
});
