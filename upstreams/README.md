# 上游同步与转换

由 `.github/workflows/sync-upstream.yml` 每 6 小时检查一次，也可在 Actions 中手动运行。定时任务可能被 GitHub 延迟；公开仓库长期无活动时，GitHub 也可能停用定时任务。

| 模块 | 来源 | 更新方式 |
| --- | --- | --- |
| 拼多多 | ZenmoFeiShi/Qx/Pinduoduo.snippet | 自动抓取，保留 jq 表达式，使用原生 Body Rewrite / Map Local |
| 黑料净化 | ZenmoFeiShi/Qx/hlwxx_remove_ads.snippet | 自动抓取规则及关联脚本 |
| 微博 | fmz200/wool_scripts/QuantumultX/rewrite/weibo.snippet | 自动抓取规则及关联脚本，保留 UA 条件及规则顺序 |
| 腾讯视频 | ZenmoFeiShi/Qx/TxvideoAD.snippet | 自动抓取，按已知二进制接口适配；不代表已解决开屏漏拦截 |
| 番茄小说 | 用户提供的 `FanQieNovel.plugin` 快照 | 静态，不跟踪上游 |

上游作者的署名保留在模块和脚本内。`lock.json` 记录规则和脚本的 SHA-256。未变化时不产生提交。脚本内容已包含在生成的 JS 中，Surge 使用本仓库地址，因此脚本变更也会被检查。

转换器只支持明确实现过的语法：遇到新动作、新脚本 URL、带 UA 条件但不支持的 jq 操作或腾讯视频接口变化，会终止本次同步。拼多多的无 UA 条件 jq 表达式直接保留，并用 jq 检查语法。下载失败、语法检查或测试失败也不会提交生成内容，线上保持上一次有效版本。失败可在 Actions 页面查看；通知由个人 GitHub Actions 通知设置控制。

微博将 URL 和 User-Agent 条件放进分发脚本，避免 Surge 只运行第一条匹配脚本时丢失 UA 条件。每个阶段保持源文件规则顺序；同一阶段第一条匹配的正文操作生效。微博的带 UA 条件 jq 仍使用受限的 JS 适配，以保留条件和优先顺序。

拼多多不使用 JS：5 条 `jsonjq-response-body` 原样保留表达式并改成 `[Body Rewrite] http-response-jq`，`reject-dict` 使用 `[Map Local]` 返回 200 和 `{}`，其余域名及 IP 拒绝保留。需要 Surge iOS 5.14.0+ / Mac 5.9.0+。非 JSON 正文、超出原生正文改写大小限制等情况遵循 Surge 自身行为；模拟测试不能替代设备验证。已移除旧的 `JS/Pinduoduo.surge.js`，后续自动同步也不会重新生成它。

模块启用后仍需在设备上启用 MITM、安装并信任证书；拼多多还需启用 Rewrite。这些步骤不适用于仅含域名拒绝的番茄小说。Surge 客户端也需要更新远程模块和脚本资源，GitHub 更新本身不会强制手机立即刷新缓存。避免同时启用重复覆盖同一接口的模块。

## 本地验证

需要 Python 3、Node.js 和 jq。自动任务使用 Ubuntu runner 预装的这些工具。

```sh
python3 scripts/sync_upstream.py
python3 -m unittest discover -s tests -p 'test_converter.py'
node tests/upstream_runtime.cjs
```

`--offline` 仅供维护者在明确预填充缓存后重现转换，不会在在线下载失败时自动使用缓存。`work-cache/`、Python 缓存不提交。测试覆盖转换行为与主要分流；不能代替 iPhone、App 当前版本和真实广告响应的验证。
