/* VMISS Traffic Panel for Surge — automatic credential refresh edition
 *
 * mode=capture  (http-response on app.vmiss.com client area pages)
 *   Saves the browser's Cookie/User-Agent only from a page that loaded
 *   successfully (HTTP 200, no Cloudflare challenge), so a good credential is
 *   never replaced by a failing one. No manual switch is needed.
 * mode=panel    (generic panel) / mode=keepalive (cron)
 *   Queries traffic, merges Set-Cookie from the response to keep the WHMCS
 *   session current, caches the last good result and, when the credential
 *   fails, shows the cached data plus one notification that opens the product
 *   page — opening it refreshes the credential automatically.
 */

const BASE = "https://app.vmiss.com";
const STORE_KEY = "VMISS_Traffic_Headers_v1";
const STATE_KEY = "VMISS_Traffic_State_v1";
const args = Object.fromEntries(
  String(typeof $argument === "string" ? $argument : "")
    .split("&")
    .filter(Boolean)
    .map((part) => {
      const index = part.indexOf("=");
      const decode = (value) => { try { return decodeURIComponent(value); } catch (_) { return value; } };
      return [decode(index < 0 ? part : part.slice(0, index)), decode(index < 0 ? "" : part.slice(index + 1))];
    }),
);

function enabled(value, fallback = true) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw || raw.startsWith("{{{")) return fallback;
  return ["true", "1", "yes", "on"].includes(raw);
}

function readJson(key) {
  try {
    return JSON.parse($persistentStore.read(key) || "null");
  } catch (_) {
    return null;
  }
}

function writeJson(key, value) {
  return $persistentStore.write(JSON.stringify(value), key);
}

function header(headers, name) {
  const key = Object.keys(headers || {}).find((item) => item.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : undefined;
}

function hhmm(time) {
  const date = new Date(time);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function displayNumber(value) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatDate(value) {
  const match = String(value || "").trim().match(/(\d{4})[-/.]([01]?\d)[-/.]([0-3]?\d)/);
  return match ? `${Number(match[1])}.${Number(match[2])}.${Number(match[3])}` : "";
}

function findDueDate(value) {
  if (!value) return "";
  if (typeof value === "object") {
    const preferredKeys = [
      "nextduedate", "next_due_date", "nextDueDate", "due_date", "dueDate",
      "expiry", "expiry_date", "expiration", "expiration_date", "expire",
    ];
    for (const key of preferredKeys) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const date = formatDate(value[key]);
        if (date) return date;
      }
    }
    for (const item of Object.values(value)) {
      const date = findDueDate(item);
      if (date) return date;
    }
    return "";
  }
  return formatDate(value);
}

function findDueDateInHtml(html) {
  const source = String(html || "");
  const direct = source.match(/(?:nextduedate|next_due_date|nextDueDate)[^\d]{0,120}(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/i);
  if (direct) return formatDate(direct[1]);
  const text = source
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ");
  const labelled = text.match(/(?:Next Due Date|下次付款日期|下次到期日期|续费日期|到期日期|到期时间)[^\d]{0,80}(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/i);
  return labelled ? formatDate(labelled[1]) : "";
}

function nextResetInfo(resetTime, resetDay) {
  const now = new Date();
  let target = null;
  const raw = String(resetTime || "").trim();
  const match = raw.match(/(\d{4})[-/]([01]?\d)[-/]([0-3]?\d)/);
  if (match) {
    target = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  } else if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) target = parsed;
  }
  if (!target && resetDay !== undefined && resetDay !== null && resetDay !== "" && Number.isFinite(Number(resetDay))) {
    const day = Math.max(1, Math.floor(Number(resetDay)));
    const makeDate = (year, month) => new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()));
    target = makeDate(now.getFullYear(), now.getMonth());
    if (target.getTime() <= now.getTime()) target = makeDate(now.getFullYear(), now.getMonth() + 1);
  }
  if (!target || Number.isNaN(target.getTime())) return null;
  if (target.getTime() <= now.getTime() && raw) return null;
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

// ---- cookies -------------------------------------------------------------

function parseCookie(cookie) {
  const map = new Map();
  for (const item of String(cookie || "").split(";")) {
    const pair = item.trim();
    const index = pair.indexOf("=");
    if (index > 0) map.set(pair.slice(0, index), pair.slice(index + 1));
  }
  return map;
}

function serializeCookie(map) {
  return [...map].map(([name, value]) => `${name}=${value}`).join("; ");
}

// Surge may fold several Set-Cookie headers into one comma-joined string.
function setCookies(headers) {
  const raw = header(headers, "Set-Cookie");
  const values = Array.isArray(raw) ? raw : raw ? String(raw).split(/,(?=\s*[^;,=\s]+=)/) : [];
  return values.map((value) => {
    const [pair, ...attributes] = value.split(";");
    const index = pair.indexOf("=");
    const attrs = attributes.join(";").toLowerCase();
    const expires = attrs.match(/expires=([^;]+)/);
    const removed = /max-age=\s*(0|-\d+)/.test(attrs) || /=\s*deleted$/.test(pair.trim()) ||
      (expires && Date.parse(expires[1]) < Date.now());
    return index > 0 ? { name: pair.slice(0, index).trim(), value: pair.slice(index + 1).trim(), removed } : null;
  }).filter(Boolean);
}

function mergeCookies(cookie, updates) {
  const map = parseCookie(cookie);
  for (const update of updates) {
    if (update.removed) map.delete(update.name);
    else map.set(update.name, update.value);
  }
  return serializeCookie(map);
}

function productIdFrom(url) {
  const match = String(url || "").match(/[?&]id=(\d+)/);
  return match ? match[1] : "";
}

// ---- capture -------------------------------------------------------------

function capture() {
  if (!enabled(args.capture)) return $done({});
  const url = String($request.url || "");
  const status = Number($response.status ?? $response.statusCode);
  // Only a page the browser actually loaded proves the credential is valid.
  if (/[?&]getJSON\b/.test(url) || status !== 200 || header($response.headers, "cf-mitigated")) return $done({});

  const requestHeaders = $request.headers || {};
  const incoming = header(requestHeaders, "Cookie");
  if (!incoming) return $done({});

  const previous = readJson(STORE_KEY) || {};
  const cookie = mergeCookies(mergeCookies(previous.headers?.Cookie, [...parseCookie(incoming)].map(([name, value]) => ({ name, value }))),
    setCookies($response.headers));
  const saved = {
    headers: {
      ...(previous.headers || {}),
      Cookie: cookie,
      "User-Agent": header(requestHeaders, "User-Agent") || previous.headers?.["User-Agent"] || "Mozilla/5.0",
      "Accept-Language": header(requestHeaders, "Accept-Language") || previous.headers?.["Accept-Language"] || "zh-CN,zh;q=0.9",
    },
    productId: productIdFrom(url) || previous.productId || "",
    capturedAt: Date.now(),
  };
  if (!writeJson(STORE_KEY, saved)) {
    $notification.post("VMISS 流量", "凭证保存失败", "Surge 持久化存储写入失败");
    return $done({});
  }
  const state = readJson(STATE_KEY) || {};
  // Notify only when this capture repairs a failure or is the very first one.
  if (state.invalidSince || !previous.headers?.Cookie) {
    $notification.post("VMISS 流量", "登录凭证已自动更新", saved.productId ? `产品 ${saved.productId}，面板将恢复刷新` : "请打开一次产品详情页以记录产品 ID");
  }
  writeJson(STATE_KEY, { ...state, invalidSince: 0, notifiedAt: 0 });
  $done({});
}

// ---- panel / keepalive ---------------------------------------------------

class CredentialError extends Error {}

function httpGet(options) {
  if (args.policy && !String(args.policy).startsWith("{{{")) options.policy = args.policy;
  return new Promise((resolve, reject) => {
    $httpClient.get(options, (error, response, data) => {
      if (error) return reject(new Error(String(error)));
      resolve({ response: response || {}, data: String(data || "") });
    });
  });
}

function requestHeaders(saved, productId, accept) {
  return {
    Accept: accept,
    "User-Agent": saved.headers["User-Agent"] || "Mozilla/5.0",
    "Accept-Language": saved.headers["Accept-Language"] || "zh-CN,zh;q=0.9",
    Referer: `${BASE}/clientarea.php?action=productdetails&id=${encodeURIComponent(productId)}`,
    Cookie: saved.headers.Cookie,
  };
}

// Keep the stored session current with whatever the server rotated.
function absorbCookies(saved, response) {
  const updates = setCookies(response.headers);
  if (!updates.length) return;
  saved.headers.Cookie = mergeCookies(saved.headers.Cookie, updates);
  writeJson(STORE_KEY, saved);
}

async function query() {
  const saved = readJson(STORE_KEY);
  if (!saved?.headers?.Cookie) throw new CredentialError("尚未获取登录凭证：在开启 Surge 的设备上登录 VMISS 并打开一次产品详情页");
  const productId = args.product_id && !args.product_id.startsWith("{{{") ? args.product_id : saved.productId;
  if (!productId) throw new CredentialError("未记录产品 ID：请打开一次 VMISS 产品详情页");

  const result = await httpGet({
    url: `${BASE}/clientarea.php?action=productdetails&id=${encodeURIComponent(productId)}&getJSON`,
    headers: requestHeaders(saved, productId, "application/json, text/plain, */*"),
    timeout: 12,
  });
  const status = Number(result.response.status ?? result.response.statusCode);
  if (status === 403 && header(result.response.headers, "cf-mitigated")) {
    throw new CredentialError("Cloudflare 验证已过期（多因出口 IP 变化）");
  }
  if (status !== 200) throw new CredentialError(`请求失败（HTTP ${status}）`);
  let data;
  try {
    data = JSON.parse(result.data);
  } catch (_) {
    throw new CredentialError("登录会话已过期");
  }
  absorbCookies(saved, result.response);

  const used = Number.parseFloat(String(data.trafficUsed || "").replace(/[^0-9.]/g, ""));
  const total = Number(data.trafficTotal);
  if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0) throw new CredentialError("未取得有效流量数据");

  const remaining = Math.max(total - used, 0);
  const percent = Math.min((used / total) * 100, 100);
  const resetDays = nextResetInfo(data.flow_reset_time, data.flow_reset_day);
  let dueDate = findDueDate(data);
  if (!dueDate) {
    try {
      const details = await httpGet({
        url: `${BASE}/clientarea.php?action=productdetails&id=${encodeURIComponent(productId)}`,
        headers: requestHeaders(saved, productId, "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
        timeout: 12,
      });
      if (Number(details.response.status ?? details.response.statusCode) === 200) dueDate = findDueDateInHtml(details.data);
    } catch (error) {
      console.log(`[VMISS Traffic] Due date lookup failed: ${error.message}`);
    }
  }

  const content = [`已用：${percent.toFixed(1)}% \t|  剩余：${displayNumber(remaining)} GB`];
  if (resetDays !== null && dueDate) content.push(`重置：${resetDays}天后 \t|  到期：${dueDate}`);
  else if (resetDays !== null) content.push(`重置：${resetDays}天后`);
  else if (dueDate) content.push(`到期：${dueDate}`);
  return { productId, total, content: content.join("\n"), at: Date.now() };
}

function panel(title, content, error) {
  $done({ title, content, icon: "server.rack", "icon-color": error ? "#ff9500" : "#007aff" });
}

async function refresh(keepalive) {
  const state = readJson(STATE_KEY) || {};
  try {
    const result = await query();
    writeJson(STATE_KEY, { ...state, invalidSince: 0, notifiedAt: 0, last: result });
    if (keepalive) return $done({});
    panel(`VMISS | ${displayNumber(result.total)} GB | ${hhmm(result.at)}`, result.content);
  } catch (error) {
    console.log(`[VMISS Traffic] ${error.message}`);
    const credential = error instanceof CredentialError;
    const next = { ...state };
    if (credential) {
      next.invalidSince = state.invalidSince || Date.now();
      // One notification per failure; tapping it opens the page that refreshes the credential.
      if (!state.notifiedAt && enabled(args.notify)) {
        const productId = readJson(STORE_KEY)?.productId;
        $notification.post("VMISS 流量", "登录凭证已失效", `${error.message}。点此打开产品页，凭证会自动更新`,
          { action: "open-url", url: `${BASE}/clientarea.php${productId ? `?action=productdetails&id=${productId}` : ""}` });
        next.notifiedAt = Date.now();
      }
      writeJson(STATE_KEY, next);
    }
    if (keepalive) return $done({});
    const hint = credential ? "打开一次 VMISS 产品页即可自动更新凭证" : error.message;
    if (state.last) {
      panel(`VMISS | ${displayNumber(state.last.total)} GB | ${hhmm(state.last.at)}`, `${state.last.content}\n⚠️ ${credential ? error.message + "，" : ""}${hint}`, true);
    } else {
      panel("VMISS 流量", `更新失败：${credential ? error.message + "，" : ""}${hint}`, true);
    }
  }
}

if (args.mode === "capture" && typeof $response !== "undefined") capture();
else if (args.mode === "capture") $done({});
else refresh(args.mode === "keepalive");
