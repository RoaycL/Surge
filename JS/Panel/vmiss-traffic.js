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
 *   due     optional due date shown as-is (YYYY-MM-DD)
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

function formatDate(value) {
  const match = String(value || "").match(/(\d{4})[-/.]([01]?\d)[-/.]([0-3]?\d)/);
  return match ? `${Number(match[1])}.${Number(match[2])}.${Number(match[3])}` : "";
}

function readCache() {
  try { return JSON.parse($persistentStore.read(CACHE_KEY) || "null"); } catch (_) { return null; }
}

function request() {
  const options = { url: args.url, headers: { "X-Token": args.token, Accept: "application/json" }, timeout: 10 };
  if (args.policy) options.policy = args.policy;
  return new Promise((resolve, reject) => {
    $httpClient.get(options, (error, response, data) => {
      if (error) return reject(new Error(`连接失败：${error}`));
      const status = Number(response?.status ?? response?.statusCode);
      if (status === 401) return reject(new Error("访问密钥错误"));
      let body;
      try { body = JSON.parse(String(data || "")); } catch (_) { return reject(new Error(`接口返回异常（HTTP ${status}）`)); }
      if (status !== 200) return reject(new Error(body?.error ? `接口错误：${body.error}` : `接口返回 HTTP ${status}`));
      resolve(body);
    });
  });
}

function render(data, total, now) {
  const used = Number(data.used) / GB;
  if (!Number.isFinite(used)) throw new Error("接口数据无效");
  const percent = Math.min((used / total) * 100, 100);
  const remaining = Math.max(total - used, 0);
  const resetAt = Date.parse(data.nextReset);
  const resetDays = Number.isFinite(resetAt) ? Math.max(0, Math.ceil((resetAt - now) / 86400000)) : null;
  const due = formatDate(args.due);
  const lines = [`已用：${percent.toFixed(1)}% \t|  剩余：${displayNumber(remaining)} GB`];
  if (resetDays !== null && due) lines.push(`重置：${resetDays}天后 \t|  到期：${due}`);
  else if (resetDays !== null) lines.push(`重置：${resetDays}天后`);
  else if (due) lines.push(`到期：${due}`);
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
