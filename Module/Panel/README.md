# 面板

可直接安装的面板模块：

- [机场流量概况](Airport-Traffic.sgmodule)
- [机场流量概况（多机场参数版）](Airport-Traffic-Config.sgmodule)
- [VMISS 流量](VMISS-Traffic.sgmodule)
- [阿里 HTTPDNS 用量](AliDNS-Usage.sgmodule)（[使用说明](../../docs/AliDNSUsage.md)）

模块中的脚本统一引用 `JS/Panel`，安装入口也列在[仓库首页](../../README.md)的功能增强中。

原 `Panel` 目录中的历史脚本保留如下。它们是 JavaScript，不能当作 `.sgmodule` 导入；请参考脚本注释配置 `[Script]` 和 `[Panel]`。

| 脚本 | 用途 |
| --- | --- |
| [flushDNS.js](../../JS/Panel/flushDNS.js) | DNS 延迟、服务器与手动刷新 |
| [net-work-info-panel.js](../../JS/Panel/net-work-info-panel.js) | 网络信息 |
| [stream-all.js](../../JS/Panel/stream-all.js) | 流媒体检测；服务端变化可能影响结果 |
| [sub_info_panel.js](../../JS/Panel/sub_info_panel.js) | 单订阅流量信息 |
| [functionstatus.js](../../JS/Panel/functionstatus.js) | 功能状态，点击重载配置 |
| [timecard.js](../../JS/Panel/timecard.js) | 历史节日倒数；内置日期已过期，使用前自行更新 |
| [trafficstatistics.js](../../JS/Panel/trafficstatistics.js) | 接口流量统计 |

新增 yfamilys 面板也存放在本目录，文件名前缀为 `YFamily-Panel-`，完整来源和安装目录见 [yfamilys 模块目录](../../docs/yfamilys.md)。
