# 仓库目录规范

首页仅分 DNS、功能增强、去广告三个目录，不再按来源或 App 类型细分。面板在首页的功能增强中展示。

| 目录 | 内容 |
| --- | --- |
| `Module/DNS/` | DNS 配置模块 |
| `Module/Enhancement/` | 功能增强、签到、检测与配置工具模块 |
| `Module/AdBlock/` | 去广告模块，含原有转换版本 |
| `Module/Panel/` | 面板模块与历史面板脚本索引 |
| `JS/` | 模块引用的 JavaScript；`JS/DNS` 和 `JS/Panel` 存放自用脚本；`JS/FKIKelee` 保留转换资源的来源关系 |
| `Ruleset/` | 所有规则集；DNS、功能增强、去广告分流规则分别存入对应目录；Emby 规则位于本目录 |
| `Service/` | 独立服务项目及其部署文件 |
| `docs/` | 使用说明、兼容性说明、迁移清单 |
| `scripts/` | 转换、目录生成与校验工具 |
| `tests/` | 回归测试和样例 |
| `upstreams/` | 原始输入快照、来源版本及资源摘要，不手改快照 |

## 维护

- 新增模块放入上述功能目录，脚本和规则集分别放入 `JS`、`Ruleset`，使用本仓库的完整 raw 地址引用。
- 原始脚本和 jq 快照保留署名及校验摘要；转换产物中的路径由生成器维护，避免重新生成后恢复旧路径。
- 更新模块后运行 `python3 scripts/build_catalog.py` 刷新首页；首页不手工维护重复表格。
- FKIKelee 转换使用 `python3 scripts/convert_loon.py --source <源仓库>`，同时生成模块、兼容性说明和首页；`.github/workflows/sync-fkikelee.yml` 每 6 小时拉取 RoaycL/fkikelee 最新提交自动转换，上游删除的插件会同时删除对应输出。
- 旧 QX/Loon 转换继续由 `scripts/sync_upstream.py` 和对应 GitHub Actions 维护，输出到 `Module/AdBlock`。
- 脚本参数的传递格式（对象 / JSON / 查询字符串）由 `argument_style` 按脚本读取 `$argument` 的方式判定；带用户参数但无法判定时停止同步。`tests/argument_probe.cjs` 用转换器选定的格式实际运行每个带参数的原脚本，确认参数确实被读取；少数只在特定接口深处读取参数的脚本列入人工审核名单。
- 所有检查集中在 `scripts/run_checks.sh`，三个 workflow 共用；在装有 Surge Mac 的机器上设置 `SURGE_CLI=/Applications/Surge.app/Contents/Applications/surge-cli` 可额外用 Surge 自身解析器检查每个模块。
- 历史面板脚本只迁移路径，未冒充已实测的新模块。节日倒数脚本内置的是 2022–2024 年数据，需要自行维护日期。

2026-11-06 的迁移按用户选择彻底删除旧路径，不提供兼容副本；完整对应关系见[迁移清单](path-migration.md)。

## yfamilys 同步

页面原生模块按功能放在原有目录内，文件名前缀 `YFamily-`，面板使用 `YFamily-Panel-`；番茄沿用 `FanQieNovel.sgmodule`。来源目录、原文快照与摘要保存在 `upstreams/yfamilys`。通过 `scripts/sync_yfamilys.py` 同步，`scripts/validate_yfamilys.py` 校验；第三方脚本仍引用原地址。
