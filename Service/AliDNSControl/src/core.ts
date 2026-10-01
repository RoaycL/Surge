export const FALLBACK = "https://dns.alidns.com/dns-query";
export const INTERVAL = 900_000;
// UTC 06/14/22 are the same set as Beijing 06/14/22, rotated by eight hours.
export const CLOUD_CRON = "0 6,14,22 * * *";
export const MAX_AGE = 30_600_000; // eight hours plus a thirty-minute grace window
export interface Account {
  name: string;
  dns: string;
  id: string;
  secret: string;
}
export interface Settings {
  accounts: Account[];
  quota: number;
  reserve: number;
  hysteresis: number;
}
export interface Usage {
  identity: string;
  month: string;
  used: number;
  ok: boolean;
  error?: string;
}
export interface Snapshot {
  revision: number;
  checkedAt: number;
  month: string;
  selected: number;
  usage: Usage[];
}
export const DEFAULTS: Settings = {
  accounts: Array.from({ length: 4 }, (_, i) => ({
    name: `账号 ${i + 1}`,
    dns: "",
    id: "",
    secret: "",
  })),
  quota: 10_000_000,
  reserve: 1_000_000,
  hysteresis: 500_000,
};
export class PublicError extends Error {}
export function monthAt(now: number) {
  return new Date(now + 8 * 3600_000).toISOString().slice(0, 7);
}
export function dnsURL(raw: string) {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new PublicError("DNS 地址格式无效");
  }
  if (
    !["https:", "h3:"].includes(u.protocol) ||
    !u.hostname.endsWith(".alidns.com") ||
    u.pathname !== "/dns-query" ||
    u.username ||
    u.password ||
    u.search ||
    u.hash ||
    (u.port && u.port !== "443")
  )
    throw new PublicError("请填写阿里云的完整 DoH 地址");
  return u.href;
}
export function validateSettings(value: unknown, old = DEFAULTS): Settings {
  if (!value || typeof value !== "object")
    throw new PublicError("设置格式无效");
  const v = value as Record<string, unknown>;
  for (const k of ["quota", "reserve", "hysteresis"])
    if (
      typeof v[k] !== "number" ||
      !Number.isSafeInteger(v[k]) ||
      Number(v[k]) < 0 ||
      Number(v[k]) > 1e12
    )
      throw new PublicError("额度参数无效");
  const quota = v.quota as number,
    reserve = v.reserve as number,
    hysteresis = v.hysteresis as number;
  if (!quota || reserve >= quota)
    throw new PublicError("预留额度须小于月度额度");
  if (!Array.isArray(v.accounts) || v.accounts.length !== 4)
    throw new PublicError("需要四个账号槽位");
  const accounts = v.accounts.map((item: unknown, i: number) => {
    if (!item || typeof item !== "object")
      throw new PublicError("账号格式无效");
    const a = item as Record<string, unknown>;
    for (const k of ["name", "dns", "id", "secret"])
      if (typeof a[k] !== "string" || String(a[k]).length > 2048)
        throw new PublicError("账号参数格式无效");
    const name = String(a.name).trim().slice(0, 40) || `账号 ${i + 1}`;
    const dns = String(a.dns).trim();
    if (!dns) return { name, dns: "", id: "", secret: "" };
    const id = String(a.id).trim() || old.accounts[i].id;
    const secret =
      String(a.secret).trim() ||
      (id === old.accounts[i].id ? old.accounts[i].secret : "");
    if (!id || !secret)
      throw new PublicError(`账号 ${i + 1} 缺少 RAM 只读凭据`);
    return { name, dns: dnsURL(dns), id, secret };
  });
  return { accounts, quota, reserve, hysteresis };
}
export function choose(usage: Usage[], settings: Settings, current: number) {
  const usable = usage
    .map((u, i) => ({ u, i }))
    .filter(({ u }) => u.ok && settings.quota - u.used > settings.reserve)
    .sort((a, b) => a.u.used - b.u.used || a.i - b.i);
  if (!usable.length) return -1;
  const existing = usable.find(({ i }) => i === current);
  if (existing && existing.u.used - usable[0].u.used < settings.hysteresis)
    return current;
  return usable[0].i;
}
function count(value: unknown): number {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    (typeof value === "string" && !/^\d+$/.test(value))
  )
    throw new PublicError("统计字段缺失");
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  if (!Number.isSafeInteger(n) || n < 0) throw new PublicError("统计数值无效");
  return n;
}
export function sumData(value: unknown) {
  if (!Array.isArray(value)) throw new PublicError("统计数据格式无效");
  let total = 0;
  for (const row of value) {
    if (!row || typeof row !== "object")
      throw new PublicError("统计数据格式无效");
    const r = row as Record<string, unknown>;
    for (const [kind, factor] of [
      ["HttpCount", 1],
      ["HttpsCount", 5],
    ] as const) {
      const n =
        r[kind] !== undefined
          ? count(r[kind])
          : count(r["V4" + kind]) + count(r["V6" + kind]);
      total += n * factor;
    }
  }
  if (!Number.isSafeInteger(total)) throw new PublicError("统计数值超出范围");
  return total;
}
export function reconcile(current: Usage, previous?: Usage) {
  return previous &&
    previous.identity === current.identity &&
    previous.month === current.month
    ? { ...current, used: Math.max(current.used, previous.used) }
    : current;
}
const encoder = new TextEncoder();
export function b64(bytes: Uint8Array) {
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
}
export function unb64(value: string) {
  return Uint8Array.from(atob(value), (s) => s.charCodeAt(0));
}
export async function digest(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(value)),
  );
}
export async function identity(a: Account) {
  return b64(await digest(a.id + "\0" + a.dns));
}
export async function equal(a: string, b: string) {
  const x = await digest(a),
    y = await digest(b);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}
const hexKey = (value: string) => {
  if (!/^[0-9a-f]{64}$/i.test(value))
    throw new Error("Invalid configuration key");
  return Uint8Array.from(value.match(/../g)!, (s) => parseInt(s, 16));
};
export async function seal(value: Settings, key: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const k = await crypto.subtle.importKey(
    "raw",
    hexKey(key),
    "AES-GCM",
    false,
    ["encrypt"],
  );
  const data = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData: encoder.encode("alidns-settings-v1"),
    },
    k,
    encoder.encode(JSON.stringify(value)),
  );
  return "v1." + b64(iv) + "." + b64(new Uint8Array(data));
}
export async function unseal(value: string, key: string): Promise<Settings> {
  const [v, iv, data] = value.split(".");
  if (v !== "v1" || !iv || !data) throw new Error("Invalid sealed data");
  const k = await crypto.subtle.importKey(
    "raw",
    hexKey(key),
    "AES-GCM",
    false,
    ["decrypt"],
  );
  const plain = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: unb64(iv),
      additionalData: encoder.encode("alidns-settings-v1"),
    },
    k,
    unb64(data),
  );
  return JSON.parse(new TextDecoder().decode(plain)) as Settings;
}
export function percent(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );
}
export async function signedURL(
  a: Account,
  now = Date.now(),
  nonce = crypto.randomUUID(),
) {
  const day = new Date(now + 8 * 3600_000).toISOString().slice(0, 10);
  const p: Record<string, string> = {
    AccessKeyId: a.id,
    Action: "DescribePdnsRequestStatistic",
    EndDate: day,
    Format: "JSON",
    Lang: "zh",
    Type: "ACCOUNT",
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: nonce,
    SignatureVersion: "1.0",
    StartDate: day.slice(0, 8) + "01",
    Timestamp: new Date(now).toISOString().replace(/\.\d{3}Z$/, "Z"),
    Version: "2015-01-09",
  };
  const q = Object.keys(p)
    .sort()
    .map((k) => percent(k) + "=" + percent(p[k]))
    .join("&");
  const k = await crypto.subtle.importKey(
    "raw",
    encoder.encode(a.secret + "&"),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    k,
    encoder.encode("GET&%2F&" + percent(q)),
  );
  return (
    "https://alidns.aliyuncs.com/?Signature=" +
    percent(b64(new Uint8Array(signature))) +
    "&" +
    q
  );
}
export async function boundedJSON(
  response: Response | Request,
  max = 2_000_000,
): Promise<unknown> {
  if (!response.body) throw new PublicError("接口返回空响应");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > max) throw new PublicError("接口响应过大");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const all = new Uint8Array(length);
  let off = 0;
  for (const chunk of chunks) {
    all.set(chunk, off);
    off += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(all));
  } catch {
    throw new PublicError("接口响应无法解析");
  }
}
export async function queryAccount(
  a: Account,
  fetcher: typeof fetch = fetch,
  now = Date.now(),
): Promise<Usage> {
  const result: Usage = {
    identity: await identity(a),
    month: monthAt(now),
    used: 0,
    ok: false,
  };
  if (!a.dns || !a.id || !a.secret) return { ...result, error: "未配置" };
  try {
    const response = await fetcher(await signedURL(a, now), {
      signal: AbortSignal.timeout(15_000),
      redirect: "manual",
    });
    const data = (await boundedJSON(response)) as {
      Code?: string;
      RequestId?: string;
      Data?: unknown;
    };
    if (response.status !== 200 || data.Code) {
      const code = data.Code;
      throw new PublicError(
        code === "SignatureDoesNotMatch"
          ? "签名不匹配"
          : code === "InvalidAccessKeyId.NotFound"
            ? "AccessKey 无效"
            : ["Forbidden.RAM", "Forbidden", "Unauthorized"].includes(
                  code || "",
                )
              ? "RAM 权限不足"
              : "阿里云拒绝请求",
      );
    }
    if (!data.RequestId) throw new PublicError("响应缺少 RequestId");
    return { ...result, ok: true, used: sumData(data.Data) };
  } catch (e) {
    return {
      ...result,
      error: e instanceof PublicError ? e.message : "网络请求失败",
    };
  }
}
export function selection(
  settings: Settings,
  state: Snapshot | undefined,
  now = Date.now(),
) {
  const valid =
    !!state &&
    state.month === monthAt(now) &&
    state.checkedAt <= now + 60_000 &&
    now - state.checkedAt < MAX_AGE;
  const i = valid ? choose(state!.usage, settings, state!.selected) : -1;
  const url =
    i >= 0 ? settings.accounts[i].dns.replace(/^h3:/, "https:") : FALLBACK;
  return {
    url,
    slot: i < 0 ? null : i + 1,
    name: i < 0 ? "公共 DNS" : settings.accounts[i].name,
    checkedAt: state?.checkedAt || 0,
    serverNow: now,
    validUntil: valid
      ? Math.min(state!.checkedAt + MAX_AGE, nextMonthAt(now))
      : now + INTERVAL,
    reason: !valid
      ? "选择结果尚未生成或已过期"
      : i < 0
        ? "没有安全可用账号"
        : "按剩余额度选择",
  };
}

export function nextMonthAt(now: number) {
  const china = new Date(now + 8 * 3600_000);
  return (
    Date.UTC(china.getUTCFullYear(), china.getUTCMonth() + 1, 1) - 8 * 3600_000
  );
}
