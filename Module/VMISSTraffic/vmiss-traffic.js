/* VMISS Traffic Panel for Surge */

const BASE = "https://app.vmiss.com";
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
const username = args.username || "";
const password = args.password || "";
const productId = args.product_id || "";

function done(title, content, style) {
  $done({ title, content, ...(style ? { style } : {}) });
}

function request(options) {
  return new Promise((resolve, reject) => {
    $httpClient[options.method || "get"](options, (error, response, data) => {
      if (error) return reject(new Error(error));
      resolve({ response, data: String(data || "") });
    });
  });
}

function cookieHeader(headers) {
  const raw = headers["set-cookie"] || headers["Set-Cookie"] || [];
  const values = Array.isArray(raw) ? raw : [raw];
  return values
    .map((value) => String(value).split(";")[0])
    .filter(Boolean)
    .join("; ");
}

function displayNumber(value) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

(async () => {
  if (!username || !password || !productId) {
    throw new Error("请在模块参数中填写 username、password 和 product_id");
  }

  const loginPage = await request({
    url: `${BASE}/login`,
    headers: { "User-Agent": "Surge VMISS Panel" },
    timeout: 12,
  });
  const tokenMatch = loginPage.data.match(/name=["']token["']\s+value=["']([^"']+)["']/i);
  if (!tokenMatch) throw new Error("无法取得 VMISS 登录令牌");

  const cookies = cookieHeader(loginPage.response.headers || {});
  const login = await request({
    method: "post",
    url: `${BASE}/login`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Surge VMISS Panel",
      ...(cookies ? { Cookie: cookies } : {}),
    },
    body: [
      `token=${encodeURIComponent(tokenMatch[1])}`,
      `username=${encodeURIComponent(username)}`,
      `password=${encodeURIComponent(password)}`,
      "rememberme=on",
    ].join("&"),
    timeout: 12,
  });

  const sessionCookies = [cookies, cookieHeader(login.response.headers || {})]
    .filter(Boolean)
    .join("; ");
  if (!sessionCookies || /Login Details Incorrect/i.test(login.data)) {
    throw new Error("VMISS 登录失败，请检查账号或密码");
  }

  const usage = await request({
    url: `${BASE}/clientarea.php?action=productdetails&id=${encodeURIComponent(productId)}&getJSON`,
    headers: {
      Accept: "application/json",
      "User-Agent": "Surge VMISS Panel",
      Cookie: sessionCookies,
    },
    timeout: 12,
  });

  const data = JSON.parse(usage.data);
  const used = Number.parseFloat(data.trafficUsed);
  const total = Number(data.trafficTotal);
  if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0) {
    throw new Error("未取得有效流量数据");
  }

  const remaining = Math.max(total - used, 0);
  const percent = Math.min((used / total) * 100, 100);
  const style = percent >= 90 ? "error" : percent >= 75 ? "alert" : "good";
  done(
    "VMISS 流量",
    `已用 ${displayNumber(used)} GB / ${displayNumber(total)} GB (${percent.toFixed(1)}%)\n剩余 ${displayNumber(remaining)} GB\n重置：${data.flow_reset_time || `每月 ${data.flow_reset_day} 日`}`,
    style,
  );
})().catch((error) => {
  console.log(`[VMISS Traffic] ${error.message}`);
  done("VMISS 流量", `更新失败：${error.message}`, "error");
});
