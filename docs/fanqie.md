# 番茄小说去广告

保留两个独立版本，首页和模块名称均标明来源。请选择其中一个启用，避免两套规则叠加后难以排查问题。

| 版本 | 模块 | 上游 | 当前处理方式 | 自动同步 |
| --- | --- | --- | --- | --- |
| 可莉 | [DragonRead_remove_ads.sgmodule](../Module/AdBlock/DragonRead_remove_ads.sgmodule) | [RoaycL/fkikelee](https://github.com/RoaycL/fkikelee/blob/main/lpx/DragonRead_remove_ads.lpx) | 34 条精准域名拦截，无脚本、无 MITM | `Sync FKIKelee Loon modules`，每 6 小时 |
| yfamilys / zqzess | [FanQieNovel.sgmodule](../Module/AdBlock/FanQieNovel.sgmodule) | [yfamilys](https://yfamilys.com/plugin/fanqienovel.plugin) | 30 条去重分流规则、14 条 URL 重写，需要 MITM | `Sync upstream Surge modules`，每 6 小时 |

## 安装地址

可莉版：

https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DragonRead_remove_ads.sgmodule

yfamilys 版（地址保持不变）：

https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/FanQieNovel.sgmodule

## 更新与兼容性

两版分别从各自上游转换，不合并规则、不相互覆盖；在 GitHub Actions 中也可手动运行对应工作流。下载或转换失败时停止发布，保留上一次有效模块。

可莉版的来源快照及版本记录在 `upstreams/fkikelee/`，使用 `scripts/convert_loon.py` 转换。

yfamilys 原文快照为 `upstreams/FanQieNovel.plugin`，来源 URL 和 SHA-256 记录在 `upstreams/lock.json`，使用 `scripts/fanqie.py` 转换。该版将含 `*` 的 DOMAIN 改为 DOMAIN-WILDCARD，修正部分正则域名点号和不完整 MITM 模式，补齐 HTTPS 重写所需的 snssdk、byteimg 域名。

yfamilys 版需要启用 MITM 并安装、信任证书；其广域字节系规则可能影响其他 App。以上检查不等于已在所有番茄小说版本实测。
