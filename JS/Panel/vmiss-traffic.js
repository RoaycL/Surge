/* VMISS Traffic Panel for Surge — vnstat edition
 *
 * VMISS's client area now answers every non-browser request with a Cloudflare
 * challenge, so this panel no longer talks to VMISS. Each user runs the small
 * vnstat API from Service/vmiss-traffic on their own VPS and fills its address
 * and token into the module parameters.
 *
 * Arguments (all from module parameters):
 *   url     API address, e.g. http://1.2.3.4:8890/traffic
 *   token   value of VMISS_TOKEN in /etc/vmiss-traffic.env
 *   total   monthly allowance in GB
 *   due     optional due date as VMISS shows it (YYYY-MM-DD, in the tz zone)
 *   showtz  UTC offset the due date is displayed in (default 8, Beijing)
 *   reset   day of month the allowance resets (1-31, default 23)
 *   tz      UTC offset in whole hours of that reset (default -5)
 *   title   panel title prefix
 *   policy  optional Surge policy for the request
 */

const CACHE_KEY = "VMISS_Traffic_vnstat_v1";
const GB = 1024 ** 3;

const args = Object.fromEntries(
  String(typeof $argument === "string" ? $argument : "")
    .split("&")
    .filter(Boolean)
    .map((part) => {
      const index = part.indexOf("=");
      const decode = (value) => { try { return decodeURIComponent(value); } catch (_) { return value; } };
      return [decode(index < 0 ? part : part.slice(0, index)), decode(index < 0 ? "" : part.slice(index + 1)).trim()];
    })
    // An unresolved {{{placeholder}}} means the parameter was never set.
    .filter(([, value]) => value && !value.startsWith("{{{")),
);

function hhmm(time) {
  const date = new Date(time);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function displayNumber(value) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// VMISS's due date is a day in its own zone (tz); the service runs until that day
// ends. Show the calendar day of that moment in the display zone (UTC+8 by
// default), e.g. 2026-11-23 23:59:59 UTC-5 is 2026-11-24 12:59:59 UTC+8 -> 2026.11.24.
function dueDate(value, tz, showTz) {
  const match = String(value || "").match(/(\d{4})[-/.]([01]?\d)[-/.]([0-3]?\d)/);
  if (!match) return "";
  const end = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + 1) - tz * 3600000 - 1;
  const shown = new Date(end + showTz * 3600000);
  return `${shown.getUTCFullYear()}.${shown.getUTCMonth() + 1}.${shown.getUTCDate()}`;
}

function offset(value, fallback) {
  const number = Number(value);
  return value !== undefined && Number.isInteger(number) ? number : fallback;
}

function readCache() {
  try { return JSON.parse($persistentStore.read(CACHE_KEY) || "null"); } catch (_) { return null; }
}

// The server counts traffic; when the period starts is this module's choice.
function apiUrl() {
  const query = `reset_day=${encodeURIComponent(args.reset || "23")}&utc_offset=${encodeURIComponent(args.tz || "-5")}`;
  return `${args.url}${args.url.includes("?") ? "&" : "?"}${query}`;
}

function request() {
  const options = { url: apiUrl(), headers: { "X-Token": args.token, Accept: "application/json" }, timeout: 10 };
  if (args.policy) options.policy = args.policy;
  return new Promise((resolve, reject) => {
    $httpClient.get(options, (error, response, data) => {
      if (error) return reject(new Error(`连接失败：${error}`));
      const status = Number(response?.status ?? response?.statusCode);
      if (status === 401) return reject(new Error("访问密钥错误"));
      if (status === 404) return reject(new Error("接口地址错误（应以 /traffic 结尾）"));
      let body;
      try { body = JSON.parse(String(data || "")); } catch (_) { return reject(new Error(`接口返回异常（HTTP ${status}）`)); }
      if (status !== 200) return reject(new Error(body?.error ? `接口错误：${body.error}` : `接口返回 HTTP ${status}`));
      resolve(body);
    });
  });
}

// A moment as the user's clock shows it: 今天/明天/后天 or M.D, plus HH:MM.
function when(time, now, showTz) {
  const local = (t) => new Date(t + showTz * 3600000);
  const at = local(time), today = local(now);
  const days = Math.round((Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()) -
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) / 86400000);
  const day = ["今天", "明天", "后天"][days] || `${at.getUTCMonth() + 1}.${at.getUTCDate()}`;
  return `${day} ${String(at.getUTCHours()).padStart(2, "0")}:${String(at.getUTCMinutes()).padStart(2, "0")}`;
}

// Forecast at this period's average pace: will the allowance last until the reset?
function forecast(used, total, startAt, resetAt, now, showTz) {
  if (!Number.isFinite(startAt) || !Number.isFinite(resetAt) || resetAt <= now) return "";
  const remaining = total - used;
  if (remaining <= 0) return `⚠️ 流量已用完，${when(resetAt, now, showTz)} 重置后恢复`;
  const elapsed = now - startAt;
  if (elapsed < 6 * 3600000 || used <= 0) return "";  // too early in the period to judge the pace
  const rate = used / elapsed;
  const daily = remaining / ((resetAt - now) / 86400000);
  const runOutAt = now + remaining / rate;
  if (runOutAt < resetAt) {
    return `⚠️ 照此速度，${when(runOutAt, now, showTz)} 用完，建议每天 ≤ ${displayNumber(daily)} GB`;
  }
  const projected = Math.round(((used + rate * (resetAt - now)) / total) * 100);
  return `照此速度，重置前约用 ${projected}%，每天可用 ${displayNumber(daily)} GB`;
}

function render(data, total, now) {
  const used = Number(data.used) / GB;
  if (!Number.isFinite(used)) throw new Error("接口数据无效");
  const percent = Math.min((used / total) * 100, 100);
  const remaining = Math.max(total - used, 0);
  const resetAt = Date.parse(data.nextReset);
  const resetDays = Number.isFinite(resetAt) ? Math.max(0, Math.ceil((resetAt - now) / 86400000)) : null;
  const due = dueDate(args.due, offset(args.tz, -5), offset(args.showtz, 8));
  const lines = [`已用：${percent.toFixed(1)}% \t|  剩余：${displayNumber(remaining)} GB`];
  if (resetDays !== null && due) lines.push(`重置：${resetDays}天后 \t|  到期：${due}`);
  else if (resetDays !== null) lines.push(`重置：${resetDays}天后`);
  else if (due) lines.push(`到期：${due}`);
  const advice = forecast(used, total, Date.parse(data.periodStart), resetAt, now, offset(args.showtz, 8));
  if (advice) lines.push(advice);
  return lines.join("\n");
}

function panel(title, content, error) {
  $done({ title, content, icon: "server.rack", "icon-color": error ? "#ff9500" : "#007aff" });
}

(async () => {
  const name = args.title || "VMISS";
  const total = Number(args.total);
  if (!args.url || !args.token) return panel(`${name} 流量`, "请在模块参数中填写接口地址和访问密钥（部署方法见仓库 Service/vmiss-traffic）", true);
  if (!(total > 0)) return panel(`${name} 流量`, "请在模块参数中填写总流量（GB）", true);
  try {
    const now = Date.now();
    const content = render(await request(), total, now);
    $persistentStore.write(JSON.stringify({ content, at: now }), CACHE_KEY);
    panel(`${name} | ${displayNumber(total)} GB | ${hhmm(now)}`, content);
  } catch (error) {
    console.log(`[VMISS Traffic] ${error.message}`);
    const cache = readCache();
    if (cache) panel(`${name} | ${displayNumber(total)} GB | ${hhmm(cache.at)}`, `${cache.content}\n⚠️ ${error.message}`, true);
    else panel(`${name} 流量`, `更新失败：${error.message}`, true);
  }
})();
