/* Airport Traffic Panel for Surge — supports five independently configured subscriptions. */

// url 被放在参数末尾，因此原始订阅链接中的 & 不会被误拆为模块参数。
const rawArgument = String($argument || "");
const urlMarker = "&url=";
const urlIndex = rawArgument.indexOf(urlMarker);
const optionArgument = urlIndex < 0 ? rawArgument : rawArgument.slice(0, urlIndex);
const args = Object.fromEntries(
  optionArgument
    .split("&")
    .filter(Boolean)
    .map((part) => {
      const index = part.indexOf("=");
      return [
        decodeURIComponent(index < 0 ? part : part.slice(0, index)),
        decodeURIComponent(index < 0 ? "" : part.slice(index + 1)),
      ];
    }),
);
args.url = urlIndex < 0 ? "" : decodeURIComponent(rawArgument.slice(urlIndex + urlMarker.length));

function done(title, content, style) {
  $done({ title, content, ...(style ? { style } : {}) });
}

function bytesToSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "--";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(2)} ${units[index]}`;
}

function dateOnly(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d+$/.test(raw)) {
    const date = new Date(Number(raw) * 1000);
    return Number.isNaN(date.getTime()) ? "" : formatDate(date);
  }
  const match = raw.match(/(\d{4})[-/]([01]?\d)[-/]([0-3]?\d)/);
  return match ? `${match[1]}-${String(match[2]).padStart(2, "0")}-${String(match[3]).padStart(2, "0")}` : "";
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function resetInfo(resetDay) {
  const day = Number.parseInt(resetDay, 10);
  if (!Number.isInteger(day) || day < 1 || day > 31) return "";
  const now = new Date();
  const makeDate = (year, month) => new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()));
  let target = makeDate(now.getFullYear(), now.getMonth());
  if (target.getTime() <= now.getTime()) target = makeDate(now.getFullYear(), now.getMonth() + 1);
  const days = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
  return `${formatDate(target)}（${days} 天后）`;
}

function getSubscriptionInfo(url) {
  return new Promise((resolve, reject) => {
    $httpClient.head({ url, headers: { "User-Agent": "Surge iOS" }, timeout: 12 }, (error, response) => {
      if (error) return reject(new Error(error));
      if (!response || response.status !== 200) return reject(new Error(`请求失败（HTTP ${response?.status || "未知"}）`));
      const key = Object.keys(response.headers || {}).find((name) => name.toLowerCase() === "subscription-userinfo");
      if (!key) return reject(new Error("订阅响应未返回流量信息"));
      const data = Object.fromEntries(
        String(response.headers[key]).match(/\w+=\d+(?:\.\d+)?/g)?.map((item) => {
          const [name, value] = item.split("=");
          return [name, Number(value)];
        }) || [],
      );
      if (!Number.isFinite(data.total)) return reject(new Error("订阅流量信息无效"));
      resolve(data);
    });
  });
}

(async () => {
  const title = args.title || "机场流量";
  const enabled = String(args.enabled ?? "true").trim().toLowerCase() !== "false";
  if (!enabled) return done(title, "已禁用", "info");
  const url = String(args.url || "").trim();
  if (!url) return done(title, "请在模块参数中填写订阅链接", "info");

  const info = await getSubscriptionInfo(url);
  const used = Math.max(0, (info.upload || 0) + (info.download || 0));
  const total = info.total;
  const remaining = Math.max(0, total - used);
  const percent = total > 0 ? Math.min(used / total * 100, 100) : 0;
  const style = percent >= 90 ? "error" : percent >= 75 ? "alert" : "good";
  const content = [
    `已用：${bytesToSize(used)} / ${bytesToSize(total)}（${percent.toFixed(1)}%）`,
    `剩余：${bytesToSize(remaining)}`,
  ];

  const reset = resetInfo(args.reset_day);
  if (reset) content.push(`重置：${reset}`);
  const expire = args.expire === "false" ? "" : dateOnly(args.expire || info.expire);
  if (expire) content.push(`到期：${expire}`);
  done(title, content.join("\n"), style);
})().catch((error) => {
  console.log(`[Airport Traffic] ${error.message}`);
  done(args.title || "机场流量", `更新失败：${error.message}`, "error");
});
