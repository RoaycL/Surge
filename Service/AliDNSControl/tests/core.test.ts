import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  DEFAULTS,
  choose,
  sumData,
  reconcile,
  monthAt,
  validateSettings,
  seal,
  unseal,
  queryAccount,
  signedURL,
  percent,
  selection,
  MAX_AGE,
} from "../src/core.ts";
const a = {
  name: "test",
  dns: "https://example.alidns.com/dns-query",
  id: "test-id",
  secret: "test-secret",
};
const s = { ...DEFAULTS, accounts: [a, a, a, a] };
const now = Date.parse("2026-10-01T00:00:00Z");
const u = (used: number, ok = true) => ({
  identity: "i",
  month: "2026-10",
  used,
  ok,
});
test("empty successful statistics are zero; missing fields rejected", () => {
  assert.equal(sumData([]), 0);
  assert.equal(sumData([{ HttpCount: 2, HttpsCount: 3 }]), 17);
  assert.equal(
    sumData([
      { V4HttpCount: 2, V6HttpCount: 1, V4HttpsCount: 2, V6HttpsCount: 1 },
    ]),
    18,
  );
  assert.throws(() => sumData([{ HttpCount: 1 }]));
  assert.throws(() => sumData(null));
  assert.throws(() => sumData([{ HttpCount: -1, HttpsCount: 0 }]));
});
test("same-month high water retained, new month resets", () => {
  assert.equal(reconcile(u(0), u(12)).used, 12);
  assert.equal(reconcile({ ...u(0), month: "2026-11" }, u(12)).used, 0);
  assert.equal(monthAt(Date.parse("2026-09-30T16:00:00Z")), "2026-10");
});
test("quota reserve and hysteresis", () => {
  assert.equal(choose([u(9000000), u(0), u(10, false), u(3000000)], s, 0), 1);
  assert.equal(choose([u(1000), u(0), u(10, false), u(3000000)], s, 0), 0);
  assert.equal(
    choose([u(9000000), u(9000000), u(9000000), u(9000000)], s, 0),
    -1,
  );
});
test("credentials retained only for same identity and DNS validated", () => {
  const v = {
    ...s,
    accounts: s.accounts.map((x) => ({ ...x, id: "", secret: "" })),
  };
  assert.equal(validateSettings(v, s).accounts[0].secret, a.secret);
  assert.throws(() =>
    validateSettings(
      { ...v, accounts: [{ ...a, id: "other", secret: "" }, a, a, a] },
      s,
    ),
  );
  assert.throws(() =>
    validateSettings({
      ...s,
      accounts: [{ ...a, dns: "https://evil.example/dns-query" }, a, a, a],
    }),
  );
  assert.equal(
    validateSettings({ ...v, accounts: [{ ...a, dns: "" }, a, a, a] }, s)
      .accounts[0].secret,
    "",
  );
});
test("AES encrypted storage round trip and wrong key rejection", async () => {
  const key = "11".repeat(32),
    encrypted = await seal(s, key);
  assert(!encrypted.includes(a.secret));
  assert(!encrypted.includes(a.dns));
  assert.deepEqual(await unseal(encrypted, key), s);
  await assert.rejects(unseal(encrypted, "22".repeat(32)));
});
test("Aliyun signature independently verified", async () => {
  const url = new URL(await signedURL(a, now, "test-nonce"));
  const signature = url.searchParams.get("Signature");
  url.searchParams.delete("Signature");
  const q = Array.from(url.searchParams)
    .sort(([x], [y]) => x.localeCompare(y))
    .map(([k, v]) => percent(k) + "=" + percent(v))
    .join("&");
  assert.equal(
    signature,
    createHmac("sha1", a.secret + "&")
      .update("GET&%2F&" + percent(q))
      .digest("base64"),
  );
});
test("upstream successful zero and sanitized failures", async () => {
  const mock =
    (v: any, status = 200) =>
    async () =>
      new Response(JSON.stringify(v), { status });
  assert.equal(
    (
      await queryAccount(
        a,
        mock({ RequestId: "test", Data: [] }) as typeof fetch,
        now,
      )
    ).used,
    0,
  );
  assert(
    (
      await queryAccount(
        a,
        mock({ RequestId: "test", Data: [] }) as typeof fetch,
        now,
      )
    ).ok,
  );
  const bad = await queryAccount(
    a,
    mock({ Code: "Unknown", Message: a.secret }, 403) as typeof fetch,
    now,
  );
  assert(!bad.ok);
  assert(!bad.error?.includes(a.secret));
  assert(!(await queryAccount(a, mock({ Data: [] }) as typeof fetch, now)).ok);
});
test("stale and month rollover fall back to public DNS", () => {
  const state = {
    revision: 1,
    checkedAt: now,
    month: "2026-10",
    selected: 0,
    usage: [u(0), u(5), u(9), u(12)],
  };
  assert.equal(selection(s, state, now).url, a.dns);
  assert.equal(selection(s, state, now + MAX_AGE).slot, null);
  assert.equal(selection(s, { ...state, month: "2026-09" }, now).slot, null);
});
