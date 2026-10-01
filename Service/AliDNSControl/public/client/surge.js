/* AliDNS cloud selector. No account credentials. DNS goes directly to AliDNS. */
var args = {};
String(typeof $argument === "string" ? $argument : "")
  .split("&")
  .forEach(function (p) {
    var i = p.indexOf("=");
    if (i > 0) args[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1));
  });
var KEY =
    "alidns-cloud-" + String(args.endpoint || "").replace(/[^a-z0-9.-]/gi, "_"),
  FALLBACK = "https://dns.alidns.com/dns-query";
function read() {
  try {
    return JSON.parse($persistentStore.read(KEY) || "null");
  } catch (e) {
    return null;
  }
}
function safeURL(s) {
  return (
    typeof s === "string" &&
    /^https:\/\/[a-z0-9-]+\.alidns\.com\/dns-query$/.test(s)
  );
}
function http(options) {
  return new Promise(function (resolve, reject) {
    $httpClient.get(options, function (e, r, b) {
      if (e || !r || r.status !== 200) reject(new Error("request failed"));
      else resolve(b);
    });
  });
}
async function update() {
  if (
    !/^https:\/\/[a-z0-9.-]+\/client\/selection$/.test(args.endpoint || "") ||
    !args.token
  )
    throw new Error("configuration missing");
  var p = JSON.parse(
    await http({
      url: args.endpoint,
      headers: {
        Authorization: "Bearer " + args.token,
        "X-AliDNS-Client": "2",
      },
      timeout: 6,
      "auto-redirect": false,
    }),
  );
  var ttl = p.validUntil - p.serverNow;
  if (!safeURL(p.url) || !Number.isFinite(ttl) || ttl <= 0 || ttl > 30600000)
    throw new Error("invalid selection");
  var v = {
    url: p.url,
    name: String(p.name || "DNS").slice(0, 40),
    expires: Date.now() + ttl,
  };
  $persistentStore.write(JSON.stringify(v), KEY);
  return v;
}
function wire(domain, type, id) {
  var labels = domain.split("."),
    b = [id >> 8, id & 255, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0];
  labels.forEach(function (label) {
    if (!/^[a-z0-9_-]{1,63}$/i.test(label)) throw new Error("invalid name");
    b.push(label.length);
    for (var i = 0; i < label.length; i++) b.push(label.charCodeAt(i));
  });
  b.push(0, 0, type, 0, 1);
  return new Uint8Array(b);
}
function encode(b) {
  var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    s = "";
  for (var i = 0; i < b.length; i += 3) {
    var v = (b[i] << 16) | ((b[i + 1] || 0) << 8) | (b[i + 2] || 0);
    s += a[(v >>> 18) & 63] + a[(v >>> 12) & 63];
    if (i + 1 < b.length) s += a[(v >>> 6) & 63];
    if (i + 2 < b.length) s += a[v & 63];
  }
  return s;
}
function parse(input, domain, type, id) {
  var b = input instanceof Uint8Array ? input : new Uint8Array(input),
    n = b.length;
  function u16(p) {
    if (p + 2 > n) throw Error("truncated");
    return b[p] * 256 + b[p + 1];
  }
  function name(pos) {
    var parts = [],
      end = -1,
      seen = {},
      steps = 0;
    while (true) {
      if (pos >= n || steps++ > 128 || seen[pos]) throw Error("bad name");
      seen[pos] = true;
      var k = b[pos++];
      if (!k) break;
      if ((k & 192) === 192) {
        if (pos >= n) throw Error("bad pointer");
        if (end < 0) end = pos + 1;
        pos = (k & 63) * 256 + b[pos];
        continue;
      }
      if (k > 63 || pos + k > n) throw Error("bad label");
      var s = "";
      for (var j = 0; j < k; j++) s += String.fromCharCode(b[pos++]);
      parts.push(s.toLowerCase());
    }
    return { value: parts.join("."), end: end < 0 ? pos : end };
  }
  if (
    n < 12 ||
    u16(0) !== id ||
    !(b[2] & 128) ||
    b[2] & 2 ||
    (b[3] & 15) > 3 ||
    u16(4) !== 1
  )
    throw Error("invalid DNS response");
  var q = name(12),
    p = q.end;
  if (q.value !== domain.toLowerCase() || u16(p) !== type || u16(p + 2) !== 1)
    throw Error("wrong question");
  p += 4;
  if ((b[3] & 15) !== 0) return { addresses: [], ttl: 0 };
  var records = [];
  for (var i = 0; i < u16(6); i++) {
    var owner = name(p);
    p = owner.end;
    var t = u16(p),
      cl = u16(p + 2);
    if (p + 10 > n) throw Error("truncated RR");
    var ttl =
        b[p + 4] * 16777216 + b[p + 5] * 65536 + b[p + 6] * 256 + b[p + 7],
      length = u16(p + 8);
    p += 10;
    if (p + length > n) throw Error("truncated RR");
    var value = "";
    if (t === 5) {
      var target = name(p);
      if (target.end > p + length) throw Error("bad CNAME");
      value = target.value;
    } else if (t === 1 && length === 4)
      value = Array.from(b.slice(p, p + 4)).join(".");
    else if (t === 28 && length === 16) {
      var groups = [];
      for (var k = 0; k < 16; k += 2) groups.push(u16(p + k).toString(16));
      value = groups.join(":");
    }
    if (cl === 1)
      records.push({ owner: owner.value, type: t, value: value, ttl: ttl });
    p += length;
  }
  var current = domain.toLowerCase(),
    minimum = 300,
    visited = {};
  for (var step = 0; step < 16; step++) {
    if (visited[current]) throw Error("CNAME loop");
    visited[current] = true;
    var addresses = records.filter(function (r) {
      return r.owner === current && r.type === type && r.value;
    });
    if (addresses.length) {
      addresses.forEach(function (r) {
        minimum = Math.min(minimum, r.ttl);
      });
      return {
        addresses: addresses.map(function (r) {
          return r.value;
        }),
        ttl: minimum,
      };
    }
    var cname = records.find(function (r) {
      return r.owner === current && r.type === 5;
    });
    if (!cname) return { addresses: [], ttl: 0 };
    minimum = Math.min(minimum, cname.ttl);
    current = cname.value;
  }
  throw Error("CNAME chain too long");
}
async function dns(domain) {
  domain = domain.toLowerCase().replace(/\.$/, "");
  var cloud = (args.endpoint || "").split("/")[2];
  if (
    domain.indexOf(".") < 0 ||
    /(^|\.)(local|lan|sgponte|home\.arpa|in-addr\.arpa|ip6\.arpa)$/.test(
      domain,
    ) ||
    /(^|\.)alidns\.com$/.test(domain) ||
    domain === cloud
  )
    return {};
  var cache = read(),
    url =
      cache && cache.expires > Date.now() && safeURL(cache.url)
        ? cache.url
        : FALLBACK;
  var results = await Promise.all(
    [1, 28].map(async function (type) {
      var id = Math.floor(Math.random() * 65536),
        query = wire(domain, type, id);
      var body = await http({
        url: url + "?dns=" + encode(query),
        headers: { Accept: "application/dns-message" },
        "binary-mode": true,
        timeout: 4,
        "auto-redirect": false,
      });
      return parse(body, domain, type, id);
    }),
  );
  var addresses = results[0].addresses.concat(results[1].addresses);
  return addresses.length
    ? {
        addresses: addresses,
        ttl: Math.min.apply(
          null,
          results
            .filter(function (r) {
              return r.addresses.length;
            })
            .map(function (r) {
              return r.ttl;
            }),
        ),
      }
    : {};
}
(async function () {
  if (typeof $domain === "string") {
    try {
      $done(await dns($domain));
    } catch (e) {
      $done({});
    }
    return;
  }
  var v = read(),
    message = "";
  try {
    v = await update();
  } catch (e) {
    message = "更新失败；有效缓存继续使用，过期回退公共 DNS";
  }
  if (
    typeof $script !== "undefined" &&
    ($script.type === "cron" || $script.type === "event")
  ) {
    $done();
    return;
  }
  $done({
    title: "AliDNS 云端选择",
    content:
      (v && v.expires > Date.now() ? v.name : "公共 DNS") +
      "\n" +
      (message || "云端每日 06/14/22 点 · 设备每十五分钟读取"),
    icon: "network",
    "icon-color": "#5b87e8",
  });
})();
