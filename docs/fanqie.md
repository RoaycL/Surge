# 番茄小说去广告

唯一来源：[zqzess / yfamilys 插件](https://yfamilys.com/plugin/fanqienovel.plugin)。不再使用或合并可莉的番茄规则，FKIKelee 同步也明确排除 `DragonRead_remove_ads`。

模块安装地址：

https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/FanQieNovel.sgmodule

## 自动更新

`Sync upstream Surge modules` 每 6 小时下载上游原文，转换、校验通过后提交模块和 README。也可在 GitHub Actions 手动运行该工作流。下载失败或出现不支持的语法时停止发布，保留上一次有效模块。

原文快照：`upstreams/FanQieNovel.plugin`；来源 URL 和内容 SHA-256：`upstreams/lock.json`。转换器：`scripts/fanqie.py`。这些文件不代表多个可安装版本，仓库只提供一个番茄小说 `.sgmodule`。

## Surge 适配

当前上游有 31 条分流规则，其中 1 条重复；转换后保留 30 条规则及 14 条 URL 重写。保留上游的 byteimg 直连例外、关键词与 IP 拦截，不添加其他来源的规则。

两条含 `*` 的 DOMAIN 改为 DOMAIN-WILDCARD；修正部分正则域名点号转义；MITM 修正不完整的源域名模式，追加源 HTTPS 重写所需的 snssdk、byteimg 域名，并使用 `%APPEND%` 保留主配置的域名。

HTTPS 重写需要启用 MITM，并安装、信任证书。上游的字节系广域拦截可能影响其他字节系 App；其注明用途未知的 motor 接口拦截按原文保留。以上为语法及匹配检查，尚未在真实 App 中验收所有广告位。
