# FKIKelee Loon → Surge 插件目录

来源：[RoaycL/fkikelee](https://github.com/RoaycL/fkikelee/tree/9dd6685421381eb055332b15cefa4d31f199da5a)，共 275 个插件。保留原作者署名，不覆盖仓库已有模块。

## 使用说明

- 需要 Surge iOS 5.14+ / Mac 5.9+ 原生 jq 支持；请按需安装，避免多个同 App 模块互相覆盖。
- 参数转换为 Surge 模块参数，默认值和可选值见模块参数说明；Surge 无法复刻 Loon 的开关/下拉控件。
- 默认参数 URL 编码以保留逗号、空格，适配器自动解码；手动输入含 &、引号、逗号的值也应 URL 编码。
- 节点检测通过面板手动运行，policy 参数指定 Surge 节点/策略；不支持 Loon 的节点长按菜单。
- PROXY 路由另附规则集，必须将模块注释中的 RULE-SET 行加入主配置并指定自己的策略。
- 缺失的源依赖不会以空脚本冒充；受影响功能列在备注中，其他转换部分仍可使用。
- 由 GitHub Actions 每 6 小时同步 RoaycL/fkikelee 最新提交；上游出现未审核的语法或依赖变化时停止同步，保留上一次有效版本。
- 转换及模拟测试不等于已在全部 App、账号和真实设备验证。

## DNS（1）

| 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| DNS防泄露 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/DNS/Prevent_DNS_Leaks.sgmodule) |  | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/DNS/Prevent_DNS_Leaks.list,节点选择（替换为你的代理策略）。 |

## 功能增强（20）

| 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| 1.1.1.1配置管理 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/1.1.1.1.sgmodule) |  |  |
| Apple天气增强 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/AppleWeatherEnhancer.sgmodule) | Weather.Provider、NextHour.Provider、AirQuality.Calculate.Algorithm、API.ColorfulClouds.Token、API.QWeather.Host、API.QWeather.Token、API.WAQI.Token、Storage、LogLevel |  |
| BoxJs | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/BoxJs.sgmodule) |  | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/Enhancement/BoxJs.list,节点选择（替换为你的代理策略）。 |
| Fileball网盘挂载 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/Fileball_mount.sgmodule) |  |  |
| Follow每日签到 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/FollowRSS_checkin.sgmodule) | token、cookie、cron |  |
| IPA工具箱助手 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/IPATool.sgmodule) |  |  |
| Script-Hub | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/Script-Hub.sgmodule) | ScriptHubNotify、Parser_body_max、Parser_http_timeout | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/Enhancement/Script-Hub.list,节点选择（替换为你的代理策略）。 |
| Spotify歌词增强 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/Spotify_lyrics_translation.sgmodule) |  |  |
| Sub-Store | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/Sub-Store.sgmodule) | cron | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/Enhancement/Sub-Store.list,节点选择（替换为你的代理策略）。 |
| TestFlight地区解锁 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/TestFlightRegionUnlock.sgmodule) |  | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/Enhancement/TestFlightRegionUnlock.list,节点选择（替换为你的代理策略）。 |
| VVebo时间线修复 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/VVebo_repair.sgmodule) |  |  |
| WARP节点查询 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/WARP_Node_Query.sgmodule) | policy |  |
| WPS每日签到 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/WPS_checkin.sgmodule) | CaptureCookie、AK、SK、DAY、MAX_RETRIES、CRONEXP |  |
| YouTube双语翻译 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/YouTubeSubtitlesTranslation.sgmodule) | Type、AutoCC、ShowOnly、Position |  |
| 京东比价 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/JD_Price.sgmodule) |  |  |
| 代理链路检测 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/NodeLinkCheck.sgmodule) | policy |  |
| 微信外部链接解锁 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/Weixin_external_links_unlock.sgmodule) |  |  |
| 知识星球去水印 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/UnnooQuan_remove_watermark.sgmodule) |  |  |
| 自动加入TestFlight | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/Auto_Join_TF.sgmodule) | CaptureAccountToken、RunTask、RunMonitor、TaskCron、TaskMonitor、App_ID | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/Enhancement/Auto_Join_TF.list,节点选择（替换为你的代理策略）。 |
| 节点检测工具 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/Enhancement/Node_detection_tool.sgmodule) | policy |  |

## 去广告（254）

| 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| 12306去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/12306_remove_ads.sgmodule) |  |  |
| 123云盘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/123NetWorkDisk_remove_ads.sgmodule) |  |  |
| 360摄像机去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/360SmartCamera_remove_ads.sgmodule) |  |  |
| 360智慧生活去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/SafetyHome_remove_ads.sgmodule) |  |  |
| 36氪去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/36Kr_remove_ads.sgmodule) |  |  |
| 555电影去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/555DY_remove_ads.sgmodule) |  |  |
| 5EPlay去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/5EPlay_remove_ads.sgmodule) |  |  |
| B612咔叽去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/SnowCamera_remove_ads.sgmodule) |  |  |
| CC直播去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/CCLive_remove_ads.sgmodule) |  |  |
| DJ多多去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DjDuoDuo_remove_ads.sgmodule) |  |  |
| DREAME去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DREAME_remove_ads.sgmodule) |  |  |
| Dlabel云标签去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Dlabel_remove_ads.sgmodule) |  |  |
| ECOVACS HOME去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/EcovacsHome_remove_ads.sgmodule) |  |  |
| Foodie去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Foodie_remove_ads.sgmodule) |  |  |
| Google搜索重定向 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Google.sgmodule) |  |  |
| HTTPDNS拦截器 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Block_HTTPDNS.sgmodule) |  |  |
| Hong Kong Toolbar去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/HongKongToolbar_remove_ads.sgmodule) |  |  |
| IT之家去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/IThome_remove_ads.sgmodule) | removePinnedArticles、removeAllBanners |  |
| Jump去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Jump_remove_ads.sgmodule) |  |  |
| KOOK去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KOOK_remove_ads.sgmodule) |  |  |
| Keep去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Keep_remove_ads.sgmodule) |  |  |
| Line去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Line_remove_ads.sgmodule) |  |  |
| OKOK去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/OKOK_remove_ads.sgmodule) |  |  |
| PICOOC去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/PICOOC_remove_ads.sgmodule) |  |  |
| Pinterest去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Pinterest_remove_ads.sgmodule) |  |  |
| QQ链接解锁 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/QQ_Redirect.sgmodule) |  |  |
| QQ音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/QQMusic_remove_ads.sgmodule) |  |  |
| RQrun去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/RQrun_remove_ads.sgmodule) |  |  |
| Reddit去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Reddit_remove_ads.sgmodule) |  |  |
| ReelShort去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ReelShort_remove_ads.sgmodule) |  |  |
| Roborock去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Roborock_remove_ads.sgmodule) |  |  |
| Sofascore去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Sofascore_remove_ads.sgmodule) |  |  |
| Soul去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Soul_remove_ads.sgmodule) |  |  |
| Spotify去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Spotify_remove_ads.sgmodule) | tab、useractivity |  |
| Telegram重定向 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/TelegramRedirect.sgmodule) | app |  |
| TeraBox去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/TeraBox_remove_ads.sgmodule) |  |  |
| TubeMax去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/TubeMax_remove_ads.sgmodule) |  | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/AdBlock/TubeMax_remove_ads.list,节点选择（替换为你的代理策略）。 |
| Tumblr去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Tumblr_remove_ads.sgmodule) |  |  |
| Uki去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Uki_remove_ads.sgmodule) |  |  |
| WakeUp课程表去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/WakeupSchedule_remove_ads.sgmodule) |  |  |
| YY去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/YY_Voice_remove_ads.sgmodule) |  |  |
| YY语音去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/YYVoiceTool_remove_ads.sgmodule) |  |  |
| YouTube去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/YouTube_remove_ads.sgmodule) | blockUpload、blockShorts、blockImmersive、captionLang、debug |  |
| ZAKER去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ZAKER_remove_ads.sgmodule) |  |  |
| e充电去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/EasyCharge_remove_ads.sgmodule) |  |  |
| 一刻相册去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BaiduPhoto_remove_ads.sgmodule) |  |  |
| 一甜相机去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Yitian_remove_ads.sgmodule) |  |  |
| 七猫小说去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/SevenCat_remove_ads.sgmodule) |  |  |
| 下厨房去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/XiaChuFang_remove_ads.sgmodule) |  |  |
| 两步路户外助手去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/2bulu_remove_ads.sgmodule) |  |  |
| 中华万年历去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/EtouchEcalendar_remove_ads.sgmodule) |  |  |
| 中国人保去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/PICC_Insurance_remove_ads.sgmodule) |  |  |
| 中国天气去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/WeatherChina_remove_ads.sgmodule) |  |  |
| 中国移动云盘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/mobileClouds_remove_ads.sgmodule) |  |  |
| 丰巢去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/FC_Box_remove_ads.sgmodule) |  |  |
| 乐播投屏去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/TV_Assistant_remove_ads.sgmodule) |  |  |
| 书旗小说去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ShuQiCenterReader_remove_ads.sgmodule) |  |  |
| 云鲸智能去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/NarwelRobots_remove_ads.sgmodule) |  |  |
| 京东去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/JD_remove_ads.sgmodule) |  |  |
| 京东外卖去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/JDWaimai_remove_ads.sgmodule) |  |  |
| 亲宝宝去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Qbb_remove_ads.sgmodule) |  |  |
| 什么值得买去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/smzdm_remove_ads.sgmodule) |  | 修复上游 jq 中无效的非空白正则转义。 |
| 他趣去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Taqu_remove_ads.sgmodule) |  |  |
| 优酷视频去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/YouKu_Video_remove_ads.sgmodule) |  |  |
| 健康160去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/91160_remove_ads.sgmodule) |  |  |
| 全民K歌去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/QQKSong_remove_ads.sgmodule) |  |  |
| 凤凰新闻去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ifengNews_remove_ads.sgmodule) |  |  |
| 创维智慧云去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/SkyworthDigitalPicamera_remove_ads.sgmodule) |  |  |
| 前程无忧去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/51Job_remove_ads.sgmodule) |  |  |
| 剑网三无界去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/SeasunJX3_remove_ads.sgmodule) |  |  |
| 医考帮去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/YiKaoBang_remove_ads.sgmodule) |  |  |
| 华住会去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/HantingHotels_remove_ads.sgmodule) |  |  |
| 华尔街见闻去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/FinanceNews_remove_ads.sgmodule) |  |  |
| 南网在线去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/CSG_remove_ads.sgmodule) |  |  |
| 口袋壁纸去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ShoujiDesk_remove_ads.sgmodule) |  |  |
| 叮咚买菜去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DingdongMaicai_remove_ads.sgmodule) |  |  |
| 可莉广告过滤器 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Remove_ads_by_keli.sgmodule) |  |  |
| 向日葵去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/OraySunlogin_remove_ads.sgmodule) |  |  |
| 启信宝去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/QiXinBao_remove_ads.sgmodule) |  |  |
| 哈罗去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/EasyBike_remove_ads.sgmodule) |  | 缺失上游依赖，此项未启用：https://kelee.one/Resource/JavaScript/EasyBike/mobileconfig-gateway.js |
| 哔哩哔哩去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Bilibili_remove_ads.sgmodule) | displayUpList、purifyComment、optimizeRequest、sponsorBlock、logLevel | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/AdBlock/Bilibili_remove_ads.list,节点选择（替换为你的代理策略）。 |
| 哔哩哔哩漫画去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BiliComic_remove_ads.sgmodule) |  |  |
| 喜马拉雅去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Himalaya_remove_ads.sgmodule) |  |  |
| 图怪兽去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/TuGuaiShou_remove_ads.sgmodule) |  |  |
| 堆糖去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DuiTang_remove_ads.sgmodule) |  |  |
| 墨迹天气去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MojiWeather_remove_ads.sgmodule) |  |  |
| 多屏互动去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/TCLnScreen_remove_ads.sgmodule) |  |  |
| 大姨妈月经期助手去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Dayima_remove_ads.sgmodule) |  |  |
| 大麦去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Damai_remove_ads.sgmodule) |  |  |
| 天天跳绳去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/CrazyRope_remove_ads.sgmodule) |  |  |
| 天气通去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/TianQiTong_remove_ads.sgmodule) |  |  |
| 天气预报去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/iReaderCityWeather_remove_ads.sgmodule) |  |  |
| 天猫校园去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/TmallCampus_remove_ads.sgmodule) |  |  |
| 夸克去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/QuarkBrowser_remove_ads.sgmodule) |  |  |
| 夸克扫描王去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/QuarkScanking_remove_ads.sgmodule) |  |  |
| 好轻去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/YunmaiScale_remove_ads.sgmodule) |  |  |
| 威锋去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/WPForum_remove_ads.sgmodule) |  |  |
| 学习通去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ChaoXingStudy_remove_ads.sgmodule) |  |  |
| 完美世界电竞去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/PerfectWorldEsport_remove_ads.sgmodule) |  |  |
| 宝宝树孕育去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BabyTree_remove_ads.sgmodule) |  |  |
| 小喵看书去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MiaoRead_remove_ads.sgmodule) |  |  |
| 小宇宙去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/CosmosPodcast_remove_ads.sgmodule) |  |  |
| 小店掌柜去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ShopKeeperAdmin_remove_ads.sgmodule) |  |  |
| 小桔充电去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/XiaojukejiCharge_remove_ads.sgmodule) |  |  |
| 小白智慧打印去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/XiaobaiPrint_remove_ads.sgmodule) |  |  |
| 小睡眠去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/HeartideBrainWave_remove_ads.sgmodule) |  |  |
| 小米音箱去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/XiaomiSpeaker_remove_ads.sgmodule) |  |  |
| 小红书去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/RedPaper_remove_ads.sgmodule) |  |  |
| 小蚕霸王餐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/XiaoCan_remove_ads.sgmodule) |  |  |
| 小象超市去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/iMaiCai_remove_ads.sgmodule) |  |  |
| 小黑盒去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/XiaoHeiHe_remove_ads.sgmodule) |  |  |
| 帆书去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KebidaDushu_remove_ads.sgmodule) |  |  |
| 广告平台拦截器 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BlockAdvertisers.sgmodule) |  |  |
| 库街区去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KuroBBS_remove_ads.sgmodule) |  |  |
| 彩云天气去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ColorfulClouds_remove_ads.sgmodule) |  |  |
| 得物去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Dewu_remove_ads.sgmodule) |  |  |
| 得间小说去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/iReaderDejian_remove_ads.sgmodule) |  |  |
| 微信公众号去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Weixin_Official_Accounts_remove_ads.sgmodule) |  |  |
| 微信小程序去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/WexinMiniPrograms_Remove_ads.sgmodule) |  |  |
| 微博去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Weibo_remove_ads.sgmodule) |  |  |
| 微博轻享版去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Weibo_intl_remove_ads.sgmodule) |  |  |
| 微店去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Weidian_remove_ads.sgmodule) |  |  |
| 微脉圈去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Weimai_remove_ads.sgmodule) |  |  |
| 快对去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KuaiDuiZuoYe_remove_ads.sgmodule) |  |  |
| 快影去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KwaiVideoeditor_remove_ads.sgmodule) |  |  |
| 快手去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KuaiShou_remove_ads.sgmodule) |  |  |
| 快捷搜索 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/QuickSearch.sgmodule) |  |  |
| 快看漫画去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KuaiKanComic_remove_ads.sgmodule) |  |  |
| 快递100去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KuaiDi100_remove_ads.sgmodule) |  |  |
| 慧生活798去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/SmartLife_remove_ads.sgmodule) |  |  |
| 成分喵去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ChengFenMiao_remove_ads.sgmodule) |  |  |
| 拼多多去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/PinDuoDuo_remove_ads.sgmodule) |  |  |
| 挖财记账去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/WaCaiJiZhang_remove_ads.sgmodule) |  |  |
| 挖财记账去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Wacai_remove_ads.sgmodule) |  |  |
| 掌上无畏契约去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ValorantBible_remove_ads.sgmodule) |  |  |
| 掌上英雄联盟去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/LOL_Bible_remove_ads.sgmodule) |  |  |
| 掌阅去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/iReader_remove_ads.sgmodule) |  |  |
| 排班日历去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/AxWorkSchedule_remove_ads.sgmodule) |  |  |
| 推栏去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Daily_remove_ads.sgmodule) |  |  |
| 摩天轮去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/FerrisWheel_remove_ads.sgmodule) |  |  |
| 摩托范去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MotorFans_remove_ads.sgmodule) |  |  |
| 收银通商户端去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ShouYinTongMerchant_remove_ads.sgmodule) |  |  |
| 数字心动去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DigitalHeartbeat_remove_ads.sgmodule) |  |  |
| 斗鱼去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Douyu_remove_ads.sgmodule) |  | 修复上游误放在 Rule 段的重定向。 |
| 新浪财经去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/SinaStock_remove_ads.sgmodule) |  |  |
| 无他相机去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/WutaCamera_remove_ads.sgmodule) |  |  |
| 易校园去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/YiSchool_remove_ads.sgmodule) |  |  |
| 智慧苏州去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/SuZhouCitizenCard_remove_ads.sgmodule) |  |  |
| 智联招聘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ZhiLianZhaoPin_remove_ads.sgmodule) |  |  |
| 最右去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ZuiYou_remove_ads.sgmodule) |  |  |
| 最美壁纸去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/iWallBiZhi_remove_ads.sgmodule) |  |  |
| 有道云笔记去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/YoudaoNote_remove_ads.sgmodule) |  |  |
| 有道翻译官去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/YoudaoTrans_remove_ads.sgmodule) |  |  |
| 朴朴超市去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/PuPuMall_remove_ads.sgmodule) |  |  |
| 每日赛车去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MeiRiSaiChe_remove_ads.sgmodule) |  |  |
| 比心去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Bixin_remove_ads.sgmodule) |  |  |
| 比特球云盘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BitqiuPan_remove_ads.sgmodule) |  |  |
| 汽水音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/SodaMusic_remove_ads.sgmodule) |  |  |
| 汽车之家去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/AutoHome_remove_ads.sgmodule) |  |  |
| 沃尔玛去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Walmart_remove_ads.sgmodule) |  |  |
| 波点音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BodianMusic_remove_ads.sgmodule) |  |  |
| 测测去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Cece_remove_ads.sgmodule) |  |  |
| 海雀去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/AlcidaeVideo_remove_ads.sgmodule) |  |  |
| 淘宝去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Taobao_remove_ads.sgmodule) |  |  |
| 淘票票去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Taopiaopiao_remove_ads.sgmodule) |  |  |
| 滴滴去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DiDi_remove_ads.sgmodule) |  |  |
| 滴答出行去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DidaPincheTaxi_remove_ads.sgmodule) |  |  |
| 漫客栈去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MKZ_remove_ads.sgmodule) |  |  |
| 爱企查去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Aiinquiry_remove_ads.sgmodule) |  |  |
| 爱奇艺去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/iQiYi_Video_remove_ads.sgmodule) |  | 上游空 jq 转为无操作，保留原响应。 |
| 猫耳FM去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/CatEarFM_remove_ads.sgmodule) |  |  |
| 瑞幸咖啡去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/LuckinCoffee_remove_ads.sgmodule) |  |  |
| 番茄小说去广告（可莉） | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DragonRead_remove_ads.sgmodule) |  |  |
| 百度地图去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BaiduMap_remove_ads.sgmodule) |  |  |
| 百度文库去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BaiduWenku_remove_ads.sgmodule) |  |  |
| 百度网盘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BaiduNetDisk_remove_ads.sgmodule) |  |  |
| 百度网页去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BaiduSearchWebpage_remove_ads.sgmodule) |  |  |
| 百度翻译去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BaiduTranslate_remove_ads.sgmodule) |  |  |
| 百度贴吧去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Tieba_remove_ads.sgmodule) | per_filter_video_thread |  |
| 百度输入法去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Baidu_input_method_remove_ads.sgmodule) |  |  |
| 皮皮虾去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/PiPiXia_remove_ads.sgmodule) |  |  |
| 盒马去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MrHema_remove_ads.sgmodule) |  |  |
| 盖得排行去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/GuideRank_remove_ads.sgmodule) |  |  |
| 直播吧去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Zhibo8_remove_ads.sgmodule) |  |  |
| 省钱快报去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/YueDanBa_remove_ads.sgmodule) |  |  |
| 看家王去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ChatCam_remove_ads.sgmodule) |  |  |
| 知乎去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Zhihu_remove_ads.sgmodule) |  |  |
| 磁力宅播放器去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/XFuse_remove_ads.sgmodule) |  |  |
| 稿定设计去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/GaoDing_remove_ads.sgmodule) |  |  |
| 米游社去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/miHoYoBBS_remove_ads.sgmodule) |  |  |
| 粉笔去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/FenBi_remove_ads.sgmodule) |  |  |
| 纵横小说去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ZongHeng_remove_ads.sgmodule) |  |  |
| 纷玩岛去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/LiveLab_remove_ads.sgmodule) |  |  |
| 网易云音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/NeteaseCloudMusic_remove_ads.sgmodule) | MY、DT、FX、PRGG、PRRK、PRDRD、PRSCVPT、PRST、PRRR、HMPR、PRMST、PRCN |  |
| 网易大神去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/NetEaseGodlike_remove_ads.sgmodule) |  |  |
| 网易新闻去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/NeteaseNews_remove_ads.sgmodule) |  |  |
| 网易有道词典去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/YoudaoDict_remove_ads.sgmodule) |  | 修复上游裸域名规则为 DOMAIN REJECT。 |
| 网易邮箱大师去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MailMaster_remove_ads.sgmodule) |  |  |
| 美丽修行去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Meizhixiuxing_remove_ads.sgmodule) |  |  |
| 美图秀秀去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MeiTu_remove_ads.sgmodule) |  |  |
| 美柚去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MeetYou_remove_ads.sgmodule) |  |  |
| 美颜相机去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MeituMYXJ_remove_ads.sgmodule) |  |  |
| 美食杰去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MeiShiJie_remove_ads.sgmodule) |  |  |
| 联掌门户去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/LZMH_remove_ads.sgmodule) |  |  |
| 胖乖生活去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/PangguaiLife_remove_ads.sgmodule) |  |  |
| 脉脉去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MaiMai_remove_ads.sgmodule) |  |  |
| 腾讯文档去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/TXDocs_remove_ads.sgmodule) |  |  |
| 腾讯视频去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Tencent_Video_remove_ads.sgmodule) |  |  |
| 航旅纵横去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Umetrip_remove_ads.sgmodule) |  |  |
| 芒果TV去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MangoTV_remove_ads.sgmodule) |  |  |
| 菜鸟去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Cainiao_remove_ads.sgmodule) |  |  |
| 萌娘百科去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MoeGirlWiki_remove_ads.sgmodule) |  |  |
| 萝卜快跑去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/RoboTaxi_remove_ads.sgmodule) |  |  |
| 萤石云视频去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/VideoGo_remove_ads.sgmodule) |  |  |
| 薄荷健康去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/BooHee_remove_ads.sgmodule) |  |  |
| 虎嗅去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Huxiu_remove_ads.sgmodule) |  |  |
| 虎扑去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/HUPU_remove_ads.sgmodule) |  |  |
| 蜗牛睡眠去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/SnailSleep_remove_ads.sgmodule) |  |  |
| 蜻蜓FM去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/QtingFM_remove_ads.sgmodule) |  |  |
| 行者户外去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/OnTheWay_remove_ads.sgmodule) |  |  |
| 触站去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Chuzhan_remove_ads.sgmodule) |  |  |
| 豆瓣去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DouBan_remove_ads.sgmodule) |  |  |
| 豆瓣阅读去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DoubanRead_remove_ads.sgmodule) |  |  |
| 贝壳找房去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Beike_remove_ads.sgmodule) |  |  |
| 财新去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/CaixinMedia_remove_ads.sgmodule) |  |  |
| 起点读书去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/QiDian_remove_ads.sgmodule) |  |  |
| 超级课程表去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MyFriday_remove_ads.sgmodule) |  |  |
| 车来了去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Chelaile_remove_ads.sgmodule) |  |  |
| 转转去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ZhuanZhuan_remove_ads.sgmodule) |  |  |
| 迅雷去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/XunLei_remove_ads.sgmodule) |  |  |
| 配音秀去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/DubbingShow_remove_ads.sgmodule) |  |  |
| 酷安去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/CoolApk_remove_ads.sgmodule) |  |  |
| 酷我音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Kuwo_remove_ads.sgmodule) |  |  |
| 酷狗概念版去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KuGouYouth_remove_ads.sgmodule) |  |  |
| 酷狗铃声去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KGRing_remove_ads.sgmodule) |  |  |
| 酷狗音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KuGou_remove_ads.sgmodule) |  | 修复上游酷狗 jq 无法编译的递归过滤表达式。 |
| 金十数据去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Jin10Data_remove_ads.sgmodule) |  |  |
| 金山文档去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/WPS_Documents_remove_ads.sgmodule) |  |  |
| 闪动校园去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/ShandongSchool_remove_ads.sgmodule) |  |  |
| 闲鱼去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/FleaMarket_remove_ads.sgmodule) |  |  |
| 阅友去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Yueyou_remove_ads.sgmodule) |  |  |
| 阿里云盘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/AliYunDrive_remove_ads.sgmodule) |  |  |
| 随手记去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/KingdeeMyMoney_remove_ads.sgmodule) |  |  |
| 雪球去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Snowball_remove_ads.sgmodule) |  |  |
| 顺丰速运去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/SF-Express_remove_ads.sgmodule) |  | 上游顺丰模拟响应 JSON 已截断，此条无效规则未启用。 |
| 风鸟去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/RiskBird_remove_ads.sgmodule) |  |  |
| 飞客去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/FlyerTea_remove_ads.sgmodule) |  |  |
| 飞猪旅行去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/TaobaoTravel_remove_ads.sgmodule) |  |  |
| 香港抖音去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/HKDouYin_remove_ads.sgmodule) |  |  |
| 马克水印相机去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/marki_remove_ads.sgmodule) |  |  |
| 马蜂窝去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/MaFengWo_remove_ads.sgmodule) |  |  |
| 驾校一点通去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/JiaXiaoDrive_remove_ads.sgmodule) |  |  |
| 驾考宝典去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/JiaKaoBaoDian_remove_ads.sgmodule) |  |  |
| 高德地图去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AdBlock/Amap_remove_ads.sgmodule) |  |  |
