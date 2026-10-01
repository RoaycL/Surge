"use strict";
let token = "",
  state;
const $ = (s) => document.querySelector(s),
  notice = (s) => {
    $("#notice").textContent = s;
  };
async function api(path, method = "GET", body) {
  const response = await fetch("/api/" + path, {
    method,
    headers: {
      Authorization: "Bearer " + token,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!response.ok) {
    let e = await response.json();
    throw Error(e.error || "请求失败");
  }
  return response;
}
function render(s, forms = true) {
  state = s;
  $("#chosen").textContent = s.selection.name;
  $("#checked").textContent = s.selection.checkedAt
    ? "最近检查 " + new Date(s.selection.checkedAt).toLocaleString()
    : "尚未检查";
  if (!forms) return;
  $("#accounts").replaceChildren();
  s.accounts.forEach((a, i) => {
    const card = document.createElement("div");
    card.className = "card";
    const heading = document.createElement("h2");
    heading.textContent = "0" + (i + 1) + " · " + a.name;
    card.append(heading);
    const usage = document.createElement("div");
    usage.className = "usage";
    usage.textContent =
      a.remaining === null
        ? "等待统计"
        : Math.max(0, a.remaining).toLocaleString();
    card.append(usage);
    const caption = document.createElement("p");
    caption.textContent = a.error || "剩余免费额度（HTTP 等效）";
    card.append(caption);
    const meter = document.createElement("div");
    meter.className = "meter";
    const fill = document.createElement("span");
    fill.style.width =
      (a.remaining === null
        ? 0
        : Math.min(100, Math.max(0, (a.remaining / s.quota) * 100))) + "%";
    meter.append(fill);
    card.append(meter);
    [
      ["name", "显示名称", "text", a.name],
      ["dns", "阿里 DoH 地址", "url", a.dns],
      ["id", "RAM AccessKey ID", "password", ""],
      ["secret", "RAM AccessKey Secret", "password", ""],
    ].forEach(([name, label, type, value]) => {
      const l = document.createElement("label");
      l.textContent = label;
      const input = document.createElement("input");
      input.name = name + "-" + i;
      input.type = type;
      input.value = value;
      input.autocomplete = "off";
      if (name === "id" || name === "secret")
        input.placeholder = a.configured
          ? "已保存，留空保留"
          : "仅填写只读凭据";
      l.append(input);
      card.append(l);
    });
    $("#accounts").append(card);
  });
  ["quota", "reserve", "hysteresis"].forEach(
    (k) => ($('#settings [name="' + k + '"]').value = s[k]),
  );
}
async function busy(fn) {
  document.querySelectorAll("button").forEach((b) => (b.disabled = true));
  try {
    await fn();
  } catch (e) {
    notice(e.message);
  } finally {
    document.querySelectorAll("button").forEach((b) => (b.disabled = false));
  }
}
$("#login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  busy(async () => {
    token = $("#token").value;
    render(await (await api("status")).json());
    $("#token").value = "";
    $("#login").hidden = true;
    $("#console").hidden = false;
    notice("已登录");
  });
});
$("#settings").addEventListener("submit", (e) => {
  e.preventDefault();
  busy(async () => {
    const f = new FormData(e.target),
      v = {
        accounts: Array.from({ length: 4 }, (_, i) =>
          Object.fromEntries(
            ["name", "dns", "id", "secret"].map((k) => [k, f.get(k + "-" + i)]),
          ),
        ),
      };
    ["quota", "reserve", "hysteresis"].forEach(
      (k) => (v[k] = Number(f.get(k))),
    );
    render(await (await api("settings", "POST", v)).json());
    notice("已保存并检查");
  });
});
$("#refresh").onclick = () =>
  busy(async () => {
    render(await (await api("refresh", "POST")).json());
    notice("检查完成；一分钟内重复点击使用已有结果");
  });
$("#download").onclick = () =>
  busy(async () => {
    const blob = await (await api("client-config")).blob(),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "AliDNS-Cloud.private.conf";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notice("配置含私密令牌，请勿公开分享");
  });
$("#logout").onclick = () => {
  token = "";
  state = null;
  $("#module-url").value = "";
  $("#module-install").removeAttribute("href");
  $("#module-output").hidden = true;
  $("#accounts").replaceChildren();
  $("#console").hidden = true;
  $("#login").hidden = false;
  notice("已退出");
};

$("#module-link").onclick = () =>
  busy(async () => {
    const links = await (await api("module-link")).json();
    $("#module-url").value = links.url;
    $("#module-install").href = links.installUrl;
    $("#module-output").hidden = false;
    try {
      await navigator.clipboard.writeText(links.url);
      notice("远程模块地址已复制，可在 Surge 中安装；请勿分享");
    } catch {
      notice("模块地址已生成，请复制下方地址");
    }
  });
