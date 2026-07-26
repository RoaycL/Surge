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

function done(title, content) {
  $done({
    title,
    content,
    icon: "airplane.circle",
    "icon-color": "#007aff",
  });
}

function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
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
  if (["0", "永久", "终身", "lifetime", "permanent", "never"].includes(raw.toLowerCase())) return "永久";
  if (/^\d+$/.test(raw)) {
    const date = new Date(Number(raw) * 1000);
    return Number.isNaN(date.getTime()) ? "" : formatDate(date);
  }
  const match = raw.match(/(\d{4})[-/.]([01]?\d)[-/.]([0-3]?\d)/);
  return match ? `${match[1]}-${String(match[2]).padStart(2, "0")}-${String(match[3]).padStart(2, "0")}` : "";
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatExpire(value) {
  const date = dateOnly(value);
  if (!date) return "";
  if (date === "永久") return "到期：永久";
  const match = date.match(/(\d{4})-(\d{2})-(\d{2})/);
  return match ? `到期：${Number(match[1])}.${Number(match[2])}.${Number(match[3])}` : `到期：${date}`;
}

function percent(used, total) {
  return total > 0 ? `${(Math.round((used / total) * 10000) / 100).toFixed(1)}%` : "0.0%";
}

function resetInfo(resetDay) {
  const day = Number.parseInt(resetDay, 10);
  if (!Number.isInteger(day) || day < 1 || day > 31) return "";
  const now = new Date();
  const makeDate = (year, month) => new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()));
  let target = makeDate(now.getFullYear(), now.getMonth());
  if (target.getTime() <= now.getTime()) target = makeDate(now.getFullYear(), now.getMonth() + 1);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

function requestSubscription(url, method, userAgent) {
  return new Promise((resolve, reject) => {
    const request = {
      url,
      headers: {
        "User-Agent": userAgent,
        Accept: "*/*",
      },
      timeout: 12,
    };
    $httpClient[method](request, (error, response) => {
      if (error) return reject(new Error(error));
      const status = Number(response?.status || 0);
      const key = Object.keys(response?.headers || {}).find((name) => name.toLowerCase() === "subscription-userinfo");
      resolve({ status, header: key ? response.headers[key] : "" });
    });
  });
}

function parseSubscriptionInfo(header) {
  const data = Object.fromEntries(
    String(header || "").match(/\w+=\d+(?:\.\d+)?/g)?.map((item) => {
      const [name, value] = item.split("=");
      return [name, Number(value)];
    }) || [],
  );
  return Number.isFinite(data.total) ? data : null;
}

async function getSubscriptionInfo(url) {
  // 部分机场会拒绝 HEAD 或 Surge UA，因此按兼容性顺序自动重试。
  const attempts = [
    ["head", "Quantumult%20X"],
    ["head", "Clash"],
    ["get", "Quantumult%20X"],
    ["get", "Clash"],
  ];
  let lastStatus = 0;
  for (const [method, userAgent] of attempts) {
    try {
      const result = await requestSubscription(url, method, userAgent);
      lastStatus = result.status || lastStatus;
      const info = parseSubscriptionInfo(result.header);
      if (info) return info;
    } catch (error) {
      console.log(`[Airport Traffic] ${method.toUpperCase()} ${userAgent}: ${error.message}`);
    }
  }
  if (lastStatus && (lastStatus < 200 || lastStatus >= 400)) {
    throw new Error(`请求失败（HTTP ${lastStatus}），机场可能限制了请求方式或 User-Agent`);
  }
  throw new Error("订阅响应未返回有效流量信息，请确认该订阅支持 subscription-userinfo 响应头");
}

(async () => {
  const title = args.title || "机场流量";
  const url = String(args.url || "").trim();
  if (!url) return done(title, "请在模块参数中填写订阅链接", "info");

  const info = await getSubscriptionInfo(url);
  const used = Math.max(0, (info.upload || 0) + (info.download || 0));
  const total = info.total;
  const remaining = Math.max(0, total - used);
  const content = [`已用：${percent(used, total)} \t|  剩余：${bytesToSize(remaining)}`];

  const resetDays = resetInfo(args.reset_day);
  const expire = args.expire === "false" ? "" : formatExpire(args.expire || info.expire);
  if (resetDays && expire) {
    content.push(`重置：${resetDays}天 \t|  ${expire}`);
  } else if (resetDays) {
    content.push(`重置：${resetDays}天`);
  } else if (expire) {
    content.push(expire);
  }
  done(`${title} | ${bytesToSize(total)} | ${currentTime()}`, content.join("\n"));
})().catch((error) => {
  console.log(`[Airport Traffic] ${error.message}`);
  done(args.title || "机场流量", `更新失败：${error.message}`, "error");
});
