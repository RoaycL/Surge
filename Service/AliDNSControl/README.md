# AliDNS 云端额度选择

Cloudflare 统一查询四个阿里云账号的剩余额度。Surge 从私密接口读取选择结果，再直接请求阿里 HTTPS DoH。DNS 查询不经 Cloudflare 转发。

## 使用

1. 部署后打开 Worker 的管理页面，输入管理密钥。
2. 填写四个阿里 DoH 地址及对应 RAM 只读 AccessKey ID / Secret。凭据仅在首次配置或更换时填写，后续留空保留。DNS 地址留空禁用并清除该槽位凭据。
3. 保存并检查，确认四个账号统计正常。
4. 下载私密 Surge 配置片段，将条目合并到主配置的同名分区；删除旧 AliDNS 自动切换五模块，避免冲突。已有 Host 精确映射应保留优先级。
5. 各设备加载共享主配置后，通过 engine-started 事件自动初始化，也可点面板立即更新。其后通过 cron 和面板周期更新，设备不再填写四组凭据。Apple TV 初次仍需导入完整配置，并确认对应版本支持 DNS 脚本、cron 和持久存储；未在实机 tvOS 验证。iCloud 同步的是配置，运行缓存仍在每台设备本地。

## 规则与边界

- 云端每十分钟查询一次；设备每十分钟读取，结果最长有效二十分钟。系统休眠、网络不可达或 iOS/tvOS 调度可能延迟执行，不能保证精确十分钟。
- 月度免费额度默认每账号 10,000,000 HTTP 等效次数，HTTPS 按五倍计算。必须按你的产品实际计费规则核对；预留默认 1,000,000，切换差额默认 500,000。
- 成功响应中的空统计数组按零计入；缺少字段、错误响应、请求失败均排除账号。同一账号同月保存使用量的最高值，北京时间跨月重置。
- 所有账号不足预留、统计失效或接口无法初始化时，使用公共 `https://dns.alidns.com/dns-query`。
- DNS 客户端使用 HTTPS DoH，输入的 h3 地址会转换为 https；并不强制 HTTP/3。DNS 脚本有本地运行及额外请求开销，第一次解析同时查询 A 和 AAAA，Surge 缓存最多 300 秒。不存在云端 DNS 中转，但也不能宣称完全零额外开销。
- 公共回退、内网名称和引导域名调用 Surge 标准 DNS；请保留安全的原生 DNS 设置。私有域名如 `.local`、`.lan`、`.home.arpa` 不交给自定义 DoH。单标签、反向解析、阿里 DoH 主机及控制服务主机也使用原生解析，防止循环。
- 统计存在延迟，不保证绝对不扣费。应在阿里云侧同时配置产品费用/额度控制。

## 安全

管理令牌和设备读取令牌独立。管理页面只在内存保存令牌，关闭页面重新登录。RAM 凭据用 AES-256-GCM 加密后保存到 SQLite Durable Object，主密钥保存为 Worker Secret；这属于服务端加密，Cloudflare 及拥有服务管理权限的人仍具备解密条件。

管理接口不返回 AccessKey ID 或 Secret。设备只能读所选 DNS 地址，不能管理账号；持有设备读取令牌的人可以查看当前地址，因此主配置与下载片段必须私密保存。个人 DNS 地址和账号凭据不应提交公开仓库。

### 部署

```sh
npm ci
npm install-scripts approve esbuild workerd
npm run types
npm run typecheck
npm test
npx wrangler deploy --secrets-file /absolute/private/path/secrets.json
```

秘密文件（公开仓库中只能保留以下示意，实际值用密码学随机数生成）：

```json
{
  "ADMIN_TOKEN": "a-random-management-token",
  "READ_TOKEN": "a-separate-random-reader-token",
  "CONFIG_KEY": "64-hex-characters-for-a-256-bit-key"
}
```

同一 Worker 服务管理页面、脚本和接口，无需额外 Pages 项目。一个 Durable Object 管理本家庭的四个账号；Cron Triggers 为 `*/10 * * * *`。不要丢失 CONFIG_KEY，否则不能读取已加密凭据。部署需要现有账号具有 Workers / Assets / Durable Objects / Secrets 权限。

### 验证

`npm test` 验证统计签名、空用量、最高水位、跨月、切换、防伪响应、加密和客户端 DNS wire 格式。部署后应继续检查未经授权请求返回 401、读令牌不能管理、管理接口不返回凭据，并在 Surge 实机确认首次更新和 DNS 解析。真实阿里 API 只有填写有效凭据后才能验证；单元测试不能替代账号实测。

参考：[Surge DNS 脚本](https://manual.nssurge.com/scripting/dns.html)、[Surge JavaScript API](https://manual.nssurge.com/scripting/api.html)、[Cloudflare Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)。

已完成 Mac Surge 实机脚本测试：管理选择读取成功，直接 AliDNS A/AAAA 解析成功。iPhone/tvOS 尚未实机验证；四组真实 RAM 凭据录入后的用量查询仍需验证。
