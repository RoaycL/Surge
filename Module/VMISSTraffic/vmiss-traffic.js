/* VMISS Traffic Panel for Surge — Cookie capture edition */

const BASE = "https://app.vmiss.com";
const STORE_KEY = "VMISS_Traffic_Headers_v1";
const args = Object.fromEntries(
  String($argument || "")
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

function displayNumber(value) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function nextResetInfo(resetTime, resetDay) {
  const now = new Date();
  let target = null;
  const raw = String(resetTime || "").trim();

  // 面板仅显示重置日期，统一按当天零点计算剩余天数。
  const match = raw.match(/(\d{4})[-/]([01]?\d)[-/]([0-3]?\d)/);
  if (match) {
    target = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  } else if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) target = parsed;
  }

  // 接口未给出完整日期时，按每月重置日推算下一次重置。
  if (!target && Number.isFinite(Number(resetDay))) {
    const day = Math.max(1, Math.floor(Number(resetDay)));
    const makeDate = (year, month) => new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()));
    target = makeDate(now.getFullYear(), now.getMonth());
    if (target.getTime() <= now.getTime()) target = makeDate(now.getFullYear(), now.getMonth() + 1);
  }

  if (!target || Number.isNaN(target.getTime())) return null;
  if (target.getTime() <= now.getTime() && raw) return null;
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

function httpGet(options) {
  return new Promise((resolve, reject) => {
    $httpClient.get(options, (error, response, data) => {
      if (error) return reject(new Error(error));
      resolve({ response, data: String(data || "") });
    });
  });
}

function pickHeaders(headers) {
  const wanted = ["Cookie", "User-Agent", "Accept", "Accept-Language", "Referer"];
  const picked = {};
  for (const key of Object.keys(headers || {})) {
    const canonical = wanted.find((item) => item.toLowerCase() === key.toLowerCase());
    if (canonical && headers[key]) picked[canonical] = headers[key];
  }
  return picked;
}

function capturedProductId(url) {
  try {
    return new URL(url).searchParams.get("id") || "";
  } catch (_) {
    return "";
  }
}

if (typeof $request !== "undefined") {
  const headers = pickHeaders($request.headers || {});
  if (!headers.Cookie) {
    $notification.post("VMISS 流量", "凭证抓取失败", "未发现登录 Cookie，请确认已登录 VMISS 后重新打开产品详情页");
  } else {
    const productId = capturedProductId($request.url);
    const saved = {
      headers,
      productId,
      capturedAt: Date.now(),
    };
    if ($persistentStore.write(JSON.stringify(saved), STORE_KEY)) {
      $notification.post("VMISS 流量", "登录凭证已更新", `已保存产品 ${productId || "未知"} 的会话凭证`);
    } else {
      $notification.post("VMISS 流量", "凭证保存失败", "Surge 持久化存储写入失败");
    }
  }
  $done({});
} else {
  (async () => {
    let saved;
    try {
      saved = JSON.parse($persistentStore.read(STORE_KEY) || "null");
    } catch (_) {
      throw new Error("已保存的登录凭证损坏，请重新打开 VMISS 产品页面");
    }
    if (!saved?.headers?.Cookie) {
      throw new Error("尚未抓取登录凭证：请在开启 Surge 的设备浏览器中登录 VMISS 并打开产品详情页一次");
    }

    const productId = args.product_id || saved.productId;
    if (!productId) throw new Error("请填写 product_id，或重新打开一次 VMISS 产品详情页");

    const result = await httpGet({
      url: `${BASE}/clientarea.php?action=productdetails&id=${encodeURIComponent(productId)}&getJSON`,
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent": saved.headers["User-Agent"] || "Mozilla/5.0",
        "Accept-Language": saved.headers["Accept-Language"] || "zh-CN,zh;q=0.9",
        Referer: `${BASE}/clientarea.php?action=productdetails&id=${encodeURIComponent(productId)}`,
        Cookie: saved.headers.Cookie,
      },
      timeout: 12,
    });

    if (result.response.status !== 200) {
      throw new Error(`请求失败（HTTP ${result.response.status}），请重新打开 VMISS 产品页面更新凭证`);
    }
    let data;
    try {
      data = JSON.parse(result.data);
    } catch (_) {
      throw new Error("会话可能已过期，请重新打开 VMISS 产品页面更新凭证");
    }

    const used = Number.parseFloat(String(data.trafficUsed || "").replace(/[^0-9.]/g, ""));
    const total = Number(data.trafficTotal);
    if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0) {
      throw new Error("未取得有效流量数据，请重新打开 VMISS 产品页面更新凭证");
    }

    const remaining = Math.max(total - used, 0);
    const percent = Math.min((used / total) * 100, 100);
    const resetDays = nextResetInfo(data.flow_reset_time, data.flow_reset_day);
    const content = [`已用：${percent.toFixed(1)}% \t|  剩余：${displayNumber(remaining)} GB`];
    if (resetDays !== null) content.push(`重置：${resetDays}天`);
    done(
      `VMISS | ${displayNumber(total)} GB | ${currentTime()}`,
      content.join("\n"),
    );
  })().catch((error) => {
    console.log(`[VMISS Traffic] ${error.message}`);
    done("VMISS 流量", `更新失败：${error.message}`, "error");
  });
}
