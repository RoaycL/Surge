# 番茄小说去广告

唯一安装地址：

https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/FanQieNovel.sgmodule

仓库仅提供上述一个番茄小说模块。旧的 `DragonRead_remove_ads.sgmodule` 已删除；已有用户请停用或移除旧模块，再更新当前模块。HTTPS 请求重写需要启用 MITM，并安装、信任 Surge 证书。

## 来源与处理

- 可莉的原有 `FanQieNovel.plugin` 快照与 FKIKelee 的 `DragonRead_remove_ads.lpx`：两者原先都是相同的 34 条域名拦截，合并时去重。
- zqzess 的 [yfamilys 插件](https://yfamilys.com/plugin/fanqienovel.plugin)：保留原始快照，合并其域名/IP/关键词拦截、byteimg 直连例外及 14 条 URL 拦截。
- 共 62 条去重后的分流规则和 14 条 URL 重写；没有 JavaScript。条数增加不代表实测效果更好。
- 将两条带 `*` 的 DOMAIN 规则改为 Surge 的 DOMAIN-WILDCARD；修正部分域名正则的未转义点号；MITM 按 HTTPS 重写实际涉及的 5 类域名补齐，使用 `%APPEND%`。
- 保留来源的 `zijieapi` 关键词和 `bytedance.com`、`bytegoofy.com`、`byteorge.com` 等广域拦截，因此也可能影响抖音、今日头条等其他字节系 App。模块不具备 iOS 按 App 隔离这些规则的能力。
- 第三方原文中标注用途未知的 motor 接口拦截也按本次“汇总”要求保留；它不一定只影响番茄小说。

`FanQieNovel.plugin` 和 yfamilys 文件按已审核快照使用，不自动追踪该站点；FKIKelee 的番茄输入仍随原有同步流程更新。两条生成流程共用 `scripts/merge_fanqie.py`，不会重新生成独立的 DragonRead 模块，也不会把当前模块覆盖回旧的纯域名版。

已验证语法、规则去重、匹配样例和生成一致性；未在真实番茄小说版本中验收所有广告位。原始快照及署名保留在 `upstreams/`。
