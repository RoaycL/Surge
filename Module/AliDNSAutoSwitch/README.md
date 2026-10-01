# 阿里 DNS 自动选择（五模块）

四个账号共享候选池，使用 Surge 原生 HTTP/3 DNS。每10分钟查询账号额度，启用剩余量最多的候选；剩余额度低于安全线、查询失败时排除该账号；所有账号不可用时关闭四个候选，回到主配置公共 DNS。

## 安装

**先备份主配置**，将原有按设备指定的账号 DNS 设置替换为下面一条，供所有平台兜底：

```ini
[General]
encrypted-dns-server = https://dns.alidns.com/dns-query
```

请只替换 DNS 行，保留主配置其他设置。关闭其他覆盖 `encrypted-dns-server` 的模块。

分别添加下面五个模块，四个 DNS 候选先保持关闭：

- [AliDNS-Auto-Switch.sgmodule](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AliDNSAutoSwitch/AliDNS-Auto-Switch.sgmodule)
- [AliDNS-DNS-Slot1.sgmodule](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AliDNSAutoSwitch/AliDNS-DNS-Slot1.sgmodule)
- [AliDNS-DNS-Slot2.sgmodule](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AliDNSAutoSwitch/AliDNS-DNS-Slot2.sgmodule)
- [AliDNS-DNS-Slot3.sgmodule](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AliDNSAutoSwitch/AliDNS-DNS-Slot3.sgmodule)
- [AliDNS-DNS-Slot4.sgmodule](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AliDNSAutoSwitch/AliDNS-DNS-Slot4.sgmodule)

调度模块使用远程脚本，无需手动复制 JavaScript 文件。四个候选模块分别提供 `dns` 参数，默认空白。先在本机填写每个账号的完整DNS地址，例如 `h3://your-endpoint.example/dns-query`；请勿直接启用未填写地址的候选。

启用 `AliDNS Auto Switch` 前填写四组 RAM 只读凭据，必须与候选模块账号一致：

| 参数 | 对应地址 |
|---|---|
| id1 / secret1 | AliDNS DNS Slot 1 的 dns 参数 |
| id2 / secret2 | AliDNS DNS Slot 2 的 dns 参数 |
| id3 / secret3 | AliDNS DNS Slot 3 的 dns 参数 |
| id4 / secret4 | AliDNS DNS Slot 4 的 dns 参数 |

仅需 `pubdns:DescribePdnsRequestStatistic` 权限，不使用主账号高权限密钥，也不使用 DNS 客户端接入密钥。凭据通过 Surge 参数保存；脚本仅向阿里云发送签名请求。不要上传带凭据的配置或导出的模块实例。仓库中的凭据及DNS地址默认值全部为空。候选模块名称、文件名和脚本只使用Slot序号，不包含私人端点标识。参数可能随Surge配置导出或设备部署传输，因此不要公开带参数的实例。

启用调度模块后点击面板立即检查，核对额度与阿里云控制台一致，并确认仅有一个账号候选启用。所有候选关闭代表回到主配置的公共 DNS；如果主配置仍保留账号 DNS，此时并不能避免使用账号额度。

## 从固定地址版本迁移

先关闭旧调度模块以及旧的四个账号候选，确认主配置是公共DNS；再移除旧候选，安装上述Slot版本并填写dns参数。更新调度模块和远程脚本，确认槽位与凭据一一对应后再启用。不要同时保留启用中的旧候选，否则它们可能覆盖公共DNS兜底。

当前分支已移除硬编码地址，但旧版本Git历史与外部缓存可能仍含有这些地址；本次修改没有重写历史。

## 规则

- 默认每个账号月度额度 `quota=10000000`，单位为 HTTP 等价量。
- 用量为 HTTP + HTTPS×5；DoH 包含在 HTTPS 中，不重复添加 `DohTotalCount`。
- 默认 `reserve=1000000`，剩余100万及以下停止选择该账号。
- 默认 `hysteresis=500000`：新账号比当前多出至少50万才切换；当前账号查询失败或到安全线时不受此限制。
- 月度范围按北京时间计算，包括本月1日至今天。
- 空统计、缺失/无效计数、接口失败和凭据缺失都保守排除，不视为零用量。
- 切换后重新读取候选模块启停状态；不关闭已有连接，不清空 DNS 缓存。
- 面板自动刷新只显示最近结果，点击面板立即检查；自动检查由cron执行。
- 各设备独立调度；模块启用状态不自动同步。特定域名的 `[Host]` DNS映射仍可能优先于全局DNS。

## Apple TV

tvOS无法读取iCloud Drive，需要在iPhone Surge的“更多 → Surge tvOS”部署配置。部署时包含公共DNS主配置、五个模块和填写好的参数（四个dns地址及四组只读凭据）。脚本使用远程HTTPS地址，并指定JSC引擎（tvOS支持的引擎）。

配置部署与日常切换是两件事：部署到位并验证之后，Apple TV本机运行定时脚本，无需每次选择账号都重新部署。脚本文件通过远程资源下载；修改模块声明或凭据后需要重新部署。

部署后在iPhone远程控制器中检查Apple TV的脚本/日志/模块状态：手动触发检查，再跨过下一次10分钟时点确认定时执行；确认查询失败时四个候选全部关闭。首次启动可能尚未下载外部资源，需要确认脚本下载成功。

## 验证与限制

本地模拟检查覆盖额度排序、差值门槛、预留阈值、账号失败、缺少模块、模块接口错误、异常/空统计、多候选纠正、无凭据、面板显示、HMAC签名和北京时间跨月。运行：

```sh
node Module/AliDNSAutoSwitch/test.cjs
```

真实账号查询、Surge实际模块切换及iOS/tvOS定时执行需要部署后验证。本机此前控制接口返回503，尚未完成真实切换验证。

本方案降低超额风险，不能保证绝对零扣费：云端统计可能延迟、多设备同时消耗同一账号、睡眠或网络问题可能中断调度。`wake-system`仅有iOS官方支持说明，不能当作tvOS准时执行保证。旧候选不会自行到期；高流量场景需要提高预留值。

## 回退

关闭调度和四个候选后保留公共DNS。若要恢复原先按设备使用固定账号的设置，关闭上述模块并恢复主配置备份。

## 参考

- [原额度面板](../AliDNSUsage/README.md)
- [Surge模块](https://manual.nssurge.com/profile/module.html)
- [Surge控制接口](https://manual.nssurge.com/tools/http-api.html)
- [Surge tvOS部署](https://kb.nssurge.com/surge-knowledge-base/guidelines/tvos)
- [统计接口](https://help.aliyun.com/zh/dns/api-alidns-2015-01-09-describepdnsrequeststatistic)
- [计费口径](https://help.aliyun.com/zh/dns/httpdns-product-billing/)
