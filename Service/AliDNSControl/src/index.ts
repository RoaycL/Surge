import { fragment, moduleText, moduleLinks } from "./client-config";
import { DurableObject } from "cloudflare:workers";
import {
  DEFAULTS,
  CLOUD_CRON,
  PublicError,
  boundedJSON,
  choose,
  equal,
  queryAccount,
  reconcile,
  seal,
  selection,
  unseal,
  validateSettings,
  monthAt,
  type Settings,
  type Snapshot,
} from "./core";
export class QuotaControl extends DurableObject<Env> {
  running: Promise<void> | undefined;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS state (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
    );
  }
  get<T>(key: string): T | undefined {
    const row = this.ctx.storage.sql
      .exec<{ value: string }>("SELECT value FROM state WHERE key=?", key)
      .toArray()[0];
    return row ? JSON.parse(row.value) : undefined;
  }
  put(key: string, value: unknown) {
    this.ctx.storage.sql.exec(
      "INSERT OR REPLACE INTO state VALUES (?,?)",
      key,
      JSON.stringify(value),
    );
  }
  async settings(): Promise<Settings> {
    const s = this.get<string>("settings");
    return s ? unseal(s, this.env.CONFIG_KEY) : DEFAULTS;
  }
  async selected() {
    const state = this.get<Snapshot>("snapshot");
    return selection(
      await this.settings(),
      state?.revision === (this.get<number>("revision") || 0)
        ? state
        : undefined,
    );
  }
  async status() {
    const s = await this.settings();
    const saved = this.get<Snapshot>("snapshot");
    const state =
      saved?.revision === (this.get<number>("revision") || 0)
        ? saved
        : undefined;
    return {
      quota: s.quota,
      reserve: s.reserve,
      hysteresis: s.hysteresis,
      accounts: s.accounts.map((a, i) => ({
        name: a.name,
        dns: a.dns,
        configured: !!a.id,
        usage: state?.usage[i]?.ok ? state.usage[i].used : null,
        error: state?.usage[i]?.error || "",
        remaining: state?.usage[i]?.ok ? s.quota - state.usage[i].used : null,
      })),
      selection: selection(s, state),
    };
  }
  async save(value: unknown) {
    const revision = this.get<number>("revision") || 0;
    const s = validateSettings(value, await this.settings());
    const encrypted = await seal(s, this.env.CONFIG_KEY);
    if ((this.get<number>("revision") || 0) !== revision)
      throw new PublicError("设置已被其他操作修改，请重试");
    this.put("settings", encrypted);
    this.put("revision", revision + 1);
    if (this.running) await this.running;
    await this.refresh(true);
    return this.status();
  }
  async refresh(force = false) {
    if (this.running) return this.running;
    const previous = this.get<Snapshot>("snapshot");
    if (!force && previous && Date.now() - previous.checkedAt < 60_000) return;
    this.running = this.update().finally(() => {
      this.running = undefined;
    });
    return this.running;
  }
  async update() {
    const revision = this.get<number>("revision") || 0;
    const settings = await this.settings();
    const previous = this.get<Snapshot>("snapshot");
    const now = Date.now();
    const usage = await Promise.all(
      settings.accounts.map(async (a, i) =>
        reconcile(await queryAccount(a, fetch, now), previous?.usage[i]),
      ),
    );
    if ((this.get<number>("revision") || 0) !== revision) return;
    this.put("snapshot", {
      revision,
      checkedAt: now,
      month: monthAt(now),
      usage,
      selected: choose(usage, settings, previous?.selected ?? -1),
    } satisfies Snapshot);
  }
}
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const u = new URL(request.url);
      const control = env.CONTROL.getByName("household");
      if (u.pathname === "/health") return json({ ok: true });
      if (u.pathname === "/client/module.sgmodule") {
        if (
          request.method !== "GET" ||
          !env.READ_TOKEN ||
          !(await equal(u.searchParams.get("token") || "", env.READ_TOKEN))
        )
          return json({ error: "未授权" }, 401);
        return new Response(moduleText(env.PUBLIC_ORIGIN, env.READ_TOKEN), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "private, no-store",
            "Referrer-Policy": "no-referrer",
            "X-Robots-Tag": "noindex, nofollow",
          },
        });
      }
      if (u.pathname === "/client/selection") {
        if (
          request.method !== "GET" ||
          !env.READ_TOKEN ||
          !(await equal(
            request.headers.get("Authorization") || "",
            "Bearer " + env.READ_TOKEN,
          ))
        )
          return json({ error: "未授权" }, 401);
        const result = await control.selected();
        // Existing installed scripts accept at most twenty minutes. Keep them
        // working until the module downloads the new script version.
        if (request.headers.get("X-AliDNS-Client") !== "2")
          result.validUntil = Math.min(
            result.validUntil,
            result.serverNow + 1_200_000,
          );
        return json(result);
      }
      if (u.pathname.startsWith("/api/")) {
        if (!env.ADMIN_TOKEN || !env.CONFIG_KEY)
          return json({ error: "服务尚未初始化" }, 503);
        if (
          request.method !== "GET" &&
          request.headers.get("Origin") &&
          request.headers.get("Origin") !== u.origin
        )
          return json({ error: "来源不允许" }, 403);
        if (
          !(await equal(
            request.headers.get("Authorization") || "",
            "Bearer " + env.ADMIN_TOKEN,
          ))
        )
          return json({ error: "管理密钥无效" }, 401);
        if (u.pathname === "/api/status" && request.method === "GET")
          return json(await control.status());
        if (u.pathname === "/api/settings" && request.method === "POST") {
          return json(await control.save(await boundedJSON(request, 32_000)));
        }
        if (u.pathname === "/api/refresh" && request.method === "POST") {
          await control.refresh();
          return json(await control.status());
        }
        if (u.pathname === "/api/module-link" && request.method === "GET")
          return json(moduleLinks(env.PUBLIC_ORIGIN, env.READ_TOKEN));
        if (u.pathname === "/api/client-config" && request.method === "GET")
          return new Response(fragment(env.PUBLIC_ORIGIN, env.READ_TOKEN), {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store",
              "Content-Disposition":
                'attachment; filename="AliDNS-Cloud.private.conf"',
            },
          });
        return json({ error: "接口不存在" }, 404);
      }
      const response = await env.ASSETS.fetch(request);
      const headers = new Headers(response.headers);
      headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'",
      );
      headers.set("Referrer-Policy", "no-referrer");
      headers.set("X-Content-Type-Options", "nosniff");
      return new Response(response.body, { status: response.status, headers });
    } catch (e) {
      return json(
        { error: e instanceof PublicError ? e.message : "服务暂时不可用" },
        e instanceof PublicError ? 400 : 503,
      );
    }
  },
  async scheduled(_event: ScheduledController, env: Env) {
    if (_event.cron !== CLOUD_CRON) return;
    await env.CONTROL.getByName("household").refresh(true);
  },
} satisfies ExportedHandler<Env>;
