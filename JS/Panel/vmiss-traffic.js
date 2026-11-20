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
 *   showtz  UTC offset the reset date is displayed in (default 8, Beijing)
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

// The day this period's allowance runs out (the next reset) in the display zone,
// e.g. 2026-11-23 00:00 UTC-5 is 2026-11-23 13:00 UTC+8 -> 2026.11.23.
function resetDate(resetAt, showTz) {
  const shown = new Date(resetAt + showTz * 3600000);
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

// Forecast at this period's average pace: how comfortably the allowance lasts
// until the reset. Deliberately coarse; no times or daily numbers.
function forecast(used, total, startAt, resetAt, now) {
  if (used >= total) return "⚠️ 流量已经用完了，只能等重置了";
  if (!Number.isFinite(startAt) || !Number.isFinite(resetAt) || resetAt <= now) return "";
  const elapsed = now - startAt;
  if (elapsed < 6 * 3600000 || used <= 0) return "";  // too early in the period to judge the pace
  const projected = (used + (used / elapsed) * (resetAt - now)) / total;
  if (projected <= 0.5) return "照现在的速度，用到重置还绰绰有余";
  if (projected <= 0.8) return "照现在的速度，撑到重置没问题";
  if (projected <= 1) return "照现在的速度，差不多刚好够用到重置";
  return "⚠️ 照现在的速度，重置前就会用完，省着点用";
}

// Surge panels use a proportional font, so the "|" columns are aligned by
// width. Digits become mathematical monospace digits (one fixed width); other
// glyph widths are in 1/100 em of the panel font. The monospace digit equals
// FIGURE SPACE + THIN SPACE, as measured on device for the AliDNS panel.
const MONO_DIGITS = ["𝟶", "𝟷", "𝟸", "𝟹", "𝟺", "𝟻", "𝟼", "𝟽", "𝟾", "𝟿"];
const WIDTH = { mono: 70.7, ".": 21.48, "%": 80.81, cjk: 94.36, figure: 60.45, thin: 10.25, hair: 5.13 };

function mono(value) {
  return String(value).replace(/\d/g, (digit) => MONO_DIGITS[digit]);
}

function textWidth(text) {
  let width = 0;
  for (const char of text) {
    if (MONO_DIGITS.includes(char)) width += WIDTH.mono;
    else if (/[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/.test(char)) width += WIDTH.cjk;
    else width += WIDTH[char] ?? WIDTH.figure;
  }
  return width;
}

// Pad with figure / thin / hair spaces to the nearest hair space (~1/20 em).
function spaces(width) {
  let rest = Math.max(width, 0), out = "";
  for (const [char, size] of [["\u2007", WIDTH.figure], ["\u2009", WIDTH.thin], ["\u200a", WIDTH.hair]]) {
    const count = size === WIDTH.hair ? Math.round(rest / size) : Math.floor(rest / size);
    out += char.repeat(count);
    rest -= count * size;
  }
  return out;
}

function columns(rows) {
  const width = Math.max(...rows.map(([left]) => textWidth(left)));
  return rows.map(([left, right]) => right ? `${left}${spaces(width - textWidth(left))}  |  ${right}` : left);
}

function render(data, total, now) {
  const used = Number(data.used) / GB;
  if (!Number.isFinite(used)) throw new Error("接口数据无效");
  const percent = Math.min((used / total) * 100, 100);
  const remaining = Math.max(total - used, 0);
  const resetAt = Date.parse(data.nextReset);
  const resetDays = Number.isFinite(resetAt) ? Math.max(0, Math.ceil((resetAt - now) / 86400000)) : null;
  const rows = [[`已用：${mono(percent.toFixed(1))}%`, `剩余：${displayNumber(remaining)} GB`]];
  if (resetDays !== null) rows.push([`重置：${mono(resetDays)}天后`, `到期：${resetDate(resetAt, offset(args.showtz, 8))}`]);
  const lines = columns(rows);
  const advice = forecast(used, total, Date.parse(data.periodStart), resetAt, now);
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
