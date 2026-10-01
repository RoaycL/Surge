/* AliDNS Auto Switch. Signing helpers adapted from RoaycL/Surge AliDNSUsage. */

const API_ENDPOINT = "https://alidns.aliyuncs.com/";
const API_VERSION = "2015-01-09";
const ACTION = "DescribePdnsRequestStatistic";

const args = parseArgument(String($argument || ""));
const monthlyQuota = positiveNumber(args.quota, 10000000);
const accounts = parseAccounts(args);
const MODULES = [1, 2, 3, 4].map(slot => `AliDNS DNS Slot ${slot}`);
const FALLBACK = "AliDNS DNS Public";
const ALL_MODULES = MODULES;
const STATE_KEY = "alidns-auto-status-v1";

function parseArgument(raw) {
  return Object.fromEntries(
    raw.split("&").filter(Boolean).map((part) => {
      const index = part.indexOf("=");
      const key = index < 0 ? part : part.slice(0, index);
      const value = index < 0 ? "" : part.slice(index + 1);
      return [decodeURIComponent(key), decodeURIComponent(value)];
    }),
  );
}

function parseAccounts(values) {
  return [1, 2, 3, 4].map(slot => ({
    slot,
    name: `账号${slot}`,
    accessKeyId: String(values[`id${slot}`] || "").trim(),
    accessKeySecret: String(values[`secret${slot}`] || "").trim(),
  }));
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function monthRange() {
  // Alibaba billing month uses China time even on travelling devices.
  const china = new Date(Date.now() + 8 * 3600000);
  const endDate = china.toISOString().slice(0, 10);
  return { startDate: endDate.slice(0, 8) + "01", endDate };
}

function currentTime() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function nonce() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function isoTimestamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function percentEncode(value) {
  return encodeURIComponent(String(value))
    .replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function signedUrl(account, startDate, endDate) {
  const parameters = {
    AccessKeyId: account.accessKeyId,
    Action: ACTION,
    EndDate: endDate,
    Format: "JSON",
    Lang: "zh",
    Type: "ACCOUNT",
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: nonce(),
    SignatureVersion: "1.0",
    StartDate: startDate,
    Timestamp: isoTimestamp(),
    Version: API_VERSION,
  };

  const canonicalizedQueryString = Object.keys(parameters)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(parameters[key])}`)
    .join("&");
  const stringToSign = `GET&${percentEncode("/")}&${percentEncode(canonicalizedQueryString)}`;
  const signature = hmacSha1Base64(`${account.accessKeySecret}&`, stringToSign);
  return `${API_ENDPOINT}?Signature=${percentEncode(signature)}&${canonicalizedQueryString}`;
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    $httpClient.get({ url, timeout: 15 }, (error, response, data) => {
      if (error) return reject(new Error("网络请求失败（检查连通性或超时）"));
      const status = Number(response && response.status);
      if (status < 200 || status >= 300) {
        return reject(new Error(`HTTP ${status || "未知"}: ${extractError(data)}`));
      }
      try {
        resolve(JSON.parse(String(data || "{}")));
      } catch (_) {
        reject(new Error("阿里云返回了无法解析的数据"));
      }
    });
  });
}

function extractError(data) {
  try {
    const parsed = JSON.parse(String(data || "{}"));
    const known = {
      "InvalidAccessKeyId.NotFound": "AccessKey ID不存在或已停用",
      "InvalidAccessKeyId": "AccessKey ID无效",
      "SignatureDoesNotMatch": "签名不匹配（检查Secret是否正确）",
      "IncompleteSignature": "签名参数不完整",
      "Forbidden.RAM": "RAM权限不足",
      "Forbidden": "访问被拒绝（检查RAM权限）",
      "Unauthorized": "未获授权",
      "Forbidden.UserNotFound": "账号未开通或无法访问公共DNS",
      "InvalidTimeStamp.Expired": "请求时间过期（检查设备时间）",
      "InvalidTimestamp.Expired": "请求时间过期（检查设备时间）",
      "Throttling": "阿里云接口限流",
      "Throttling.User": "阿里云账号接口限流",
      "ServiceUnavailable": "阿里云接口暂不可用",
    };
    // Only display fixed text. Upstream Message/URL can contain credentials.
    return known[parsed.Code] || "阿里云拒绝请求（未知错误类型）";
  } catch (_) {
    return "阿里云返回非JSON错误响应";
  }
}

function sumStatistics(statistics) {
  if (!Array.isArray(statistics) || !statistics.length) throw new Error("统计数据为空，保守停用该账号");
  const count = value => {
    if (value === null || value === "" || value === undefined) throw new Error("统计字段缺失");
    const n = Number(value);
    if (!Number.isSafeInteger(n) || n < 0) throw new Error("统计数值无效");
    return n;
  };
  return statistics.reduce((total, item) => {
    const http = item.HttpCount !== undefined ? count(item.HttpCount)
      : count(item.V4HttpCount) + count(item.V6HttpCount);
    const https = item.HttpsCount !== undefined ? count(item.HttpsCount)
      : count(item.V4HttpsCount) + count(item.V6HttpsCount);
    // DohTotalCount overlaps HttpsCount; never add it again.
    return { http: total.http + http, https: total.https + https };
  }, { http: 0, https: 0 });
}

function number(value) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

async function queryAccount(account, range) {
  if (!account.accessKeyId || !account.accessKeySecret) throw new Error("未填写凭据");
  const response = await httpGet(signedUrl(account, range.startDate, range.endDate));
  if (response.Code) throw new Error(extractError(JSON.stringify(response)));
  if (!response.RequestId) throw new Error("阿里云响应缺少RequestId");
  const usage = sumStatistics(response.Data);
  usage.billable = usage.http + usage.https * 5;
  return { account, usage };
}

function displayAccountName(value) {
  const name = String(value || "").trim();
  if (/^1\d{10}$/.test(name)) return `${name.slice(0, 3)}****${name.slice(-4)}`;
  return name;
}

function compactNumber(value) {
  const numberValue = number(value);
  if (numberValue >= 100000000) return `${trim(numberValue / 100000000)}亿`;
  if (numberValue >= 10000) return `${trim(numberValue / 10000)}万`;
  return Math.round(numberValue).toLocaleString("zh-CN");
}

function usageProgress(used, quota) {
  const percentage = quota > 0 ? Math.min(Math.max(used / quota * 100, 0), 100) : 0;
  return {
    percentage: percentageNumber(percentage),
    remaining: Math.max(quota - used, 0),
  };
}

function percentageNumber(value) {
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function remainingWan(value) {
  const numberValue = number(value);
  const wan = numberValue / 10000;
  if (wan >= 1000) return wan.toFixed(0);
  if (wan >= 100) return wan.toFixed(1);
  if (wan >= 10) return wan.toFixed(2);
  return wan.toFixed(3);
}

function trim(value) {
  return Number(value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)).toString();
}

function panelDone(title, content, style = "info") {
  $done({
    title,
    content,
    icon: "cloud.fill",
    "icon-color": style === "error" ? "#ff3b30" : "#ff6a00",
  });
}

// Pure JavaScript SHA-1/HMAC implementation, so credentials never leave Surge except in signed Aliyun requests.
function hmacSha1Base64(key, message) {
  const blockSize = 64;
  let keyBytes = utf8Bytes(key);
  if (keyBytes.length > blockSize) keyBytes = sha1Bytes(keyBytes);
  while (keyBytes.length < blockSize) keyBytes.push(0);
  const outer = keyBytes.map((byte) => byte ^ 0x5c);
  const inner = keyBytes.map((byte) => byte ^ 0x36);
  return base64(sha1Bytes(outer.concat(sha1Bytes(inner.concat(utf8Bytes(message))))));
}

function utf8Bytes(value) {
  const encoded = unescape(encodeURIComponent(String(value)));
  return Array.from(encoded, (character) => character.charCodeAt(0));
}

function sha1Bytes(bytes) {
  const message = bytes.slice();
  const bitLength = message.length * 8;
  message.push(0x80);
  while (message.length % 64 !== 56) message.push(0);
  const high = Math.floor(bitLength / 0x100000000);
  const low = bitLength >>> 0;
  for (let shift = 24; shift >= 0; shift -= 8) message.push((high >>> shift) & 0xff);
  for (let shift = 24; shift >= 0; shift -= 8) message.push((low >>> shift) & 0xff);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  for (let offset = 0; offset < message.length; offset += 64) {
    const words = new Array(80);
    for (let index = 0; index < 16; index += 1) {
      const position = offset + index * 4;
      words[index] = ((message[position] << 24) | (message[position + 1] << 16) |
        (message[position + 2] << 8) | message[position + 3]) >>> 0;
    }
    for (let index = 16; index < 80; index += 1) {
      words[index] = rotateLeft(words[index - 3] ^ words[index - 8] ^ words[index - 14] ^ words[index - 16], 1);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    for (let index = 0; index < 80; index += 1) {
      let f;
      let k;
      if (index < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (index < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (index < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const temp = (rotateLeft(a, 5) + f + e + k + words[index]) >>> 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = temp;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  return [h0, h1, h2, h3, h4].flatMap((word) => [
    (word >>> 24) & 0xff,
    (word >>> 16) & 0xff,
    (word >>> 8) & 0xff,
    word & 0xff,
  ]);
}

function rotateLeft(value, bits) {
  return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

function base64(bytes) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index];
    const b = index + 1 < bytes.length ? bytes[index + 1] : 0;
    const c = index + 2 < bytes.length ? bytes[index + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;
    output += alphabet[(triple >>> 18) & 63];
    output += alphabet[(triple >>> 12) & 63];
    output += index + 1 < bytes.length ? alphabet[(triple >>> 6) & 63] : "=";
    output += index + 2 < bytes.length ? alphabet[triple & 63] : "=";
  }
  return output;
}


function api(method, body) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Surge 模块接口超时")), 4000);
    $httpAPI(method, "/v1/modules", body, result => {
      // Avoid clearTimeout: not available in every JSC runtime. $done cancels timers.
      if (!result || result.error) return reject(new Error("Surge 模块接口失败"));
      resolve(result);
    });
  });
}
function moduleState(value) {
  if (!value || !Array.isArray(value.available) || !Array.isArray(value.enabled)) {
    throw new Error("Surge 模块列表格式不受支持");
  }
  return value;
}
function chooseAccount(results, current, quota, reserve, hysteresis) {
  const usable = results.filter(item => item.ok && item.remaining > reserve)
    .sort((a, b) => b.remaining - a.remaining || a.slot - b.slot);
  if (!usable.length) return null;
  const existing = usable.find(item => MODULES[item.slot - 1] === current);
  if (existing && usable[0].remaining - existing.remaining < hysteresis) return existing;
  return usable[0];
}
async function switchModules(target, state) {
  const missing = ALL_MODULES.filter(name => !state.available.includes(name));
  if (missing.length) throw new Error(`请先安装候选模块：${missing.join("、")}`);
  const currentlyEnabled = ALL_MODULES.filter(name => state.enabled.includes(name));
  if ((target === FALLBACK && currentlyEnabled.length === 0) ||
      (currentlyEnabled.length === 1 && currentlyEnabled[0] === target)) return false;
  const changes = Object.fromEntries(ALL_MODULES.map(name => [name, name === target]));
  await api("POST", changes);
  const after = moduleState(await api("GET", {}));
  if (ALL_MODULES.some(name => after.enabled.includes(name) !== (name === target))) {
    throw new Error("模块切换后核验失败");
  }
  return true;
}
function readState() {
  try { return JSON.parse($persistentStore.read(STATE_KEY) || "null"); } catch (_) { return null; }
}
function render(state) {
  if (!state) return panelDone("AliDNS 自动选择", "尚未检查，请点击面板");
  const age = Math.floor((Date.now() - state.at) / 60000);
  const details = (state.results || []).map(item => item.ok
    ? `${item.name}：余${remainingWan(item.remaining)}万${item.remaining <= state.reserve ? "（预留停用）" : ""}`
    : `${item.name}：${item.error}`);
  const updated = new Date(state.at + 8 * 3600000).toISOString().slice(11, 16);
  return panelDone("AliDNS 自动选择", [
    `当前：${state.target === FALLBACK ? "公共 DNS" : state.target || "未核验"}`,
    ...details,
    state.error || state.reason || "",
    `检查 ${updated}（北京时间）${age >= 20 ? " · 已过期，请点击检查" : ""}`,
  ].filter(Boolean).join("\n"), state.error || age >= 20 ? "error" : "info");
}

(async () => {
  if (typeof $script !== "undefined" && $script.type === "generic" &&
      typeof $trigger !== "undefined" && $trigger === "auto-interval") {
    return render(readState());
  }
  const lockKey = "alidns-auto-lock-v1";
  const now = Date.now();
  const previousLock = Number($persistentStore.read(lockKey) || 0);
  if (now - previousLock < 60000) return render(readState());
  if (!$persistentStore.write(String(now), lockKey)) throw new Error("无法保存运行锁");
  let state;
  try {
    const reserve = positiveNumber(args.reserve, 1000000);
    const hysteresis = positiveNumber(args.hysteresis, 500000);
    if (reserve >= monthlyQuota) throw new Error("预留额度必须小于月度额度");
    state = moduleState(await api("GET", {}));
    const current = MODULES.filter(name => state.enabled.includes(name));
    const range = monthRange();
    const results = await Promise.all(accounts.map(async account => {
      try {
        const { usage } = await queryAccount(account, range);
        return { slot: account.slot, name: account.name, ok: true,
          used: usage.billable, remaining: Math.max(monthlyQuota - usage.billable, 0) };
      } catch (error) {
        // Errors here originate from fixed local messages, never upstream details.
        const reason = String(error && error.message || "查询处理异常");
        const safe = /^(HTTP \d{3}: |网络请求失败|阿里云|统计|未填写凭据|签名|AccessKey|RAM|访问被拒绝|未获授权|账号未开通|请求时间)/.test(reason)
          ? reason.slice(0, 100) : "查询处理异常";
        console.log(`[AliDNS Auto] 账号${account.slot}：${safe}`);
        return { slot: account.slot, name: account.name, ok: false,
          error: `${safe}，已排除` };
      }
    }));
    const selected = chooseAccount(results, current.length === 1 ? current[0] : null,
      monthlyQuota, reserve, hysteresis);
    const target = selected ? MODULES[selected.slot - 1] : FALLBACK;
    await switchModules(target, state);
    const status = { at: Date.now(), target, results, reserve,
      reason: selected ? "" : "无安全可用账号，使用公共 DNS" };
    $persistentStore.write(JSON.stringify(status), STATE_KEY);
    return render(status);
  } catch (error) {
    let target = null;
    // If anything fails, disable paid endpoints to use the profile public DNS.
    // Never assume this worked: verify through GET before reporting success.
    try {
      const latest = moduleState(await api("GET", {}));
      if (ALL_MODULES.every(name => latest.available.includes(name))) {
        await switchModules(FALLBACK, latest);
        target = FALLBACK;
      }
    } catch (_) { /* API failure must remain visible. */ }
    const status = { at: Date.now(), target, error: String(error.message || error) };
    $persistentStore.write(JSON.stringify(status), STATE_KEY);
    return render(status);
  } finally {
    $persistentStore.write("0", lockKey);
  }
})().catch(() => panelDone("AliDNS 自动选择", "脚本初始化失败，请检查模块参数", "error"));
