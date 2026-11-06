# FKIKelee Loon → Surge 插件目录

来源：[RoaycL/fkikelee](https://github.com/RoaycL/fkikelee/tree/9dd6685421381eb055332b15cefa4d31f199da5a)，共 275 个插件。保留原作者署名，不覆盖仓库已有模块。

## 使用说明

- 需要 Surge iOS 5.14+ / Mac 5.9+ 原生 jq 支持；请按需安装，避免多个同 App 模块互相覆盖。
- 参数转换为 Surge 模块参数，默认值和可选值见模块参数说明；Surge 无法复刻 Loon 的开关/下拉控件。
- 默认参数 URL 编码以保留逗号、空格，适配器自动解码；手动输入含 &、引号、逗号的值也应 URL 编码。
- 节点检测通过面板手动运行，policy 参数指定 Surge 节点/策略；不支持 Loon 的节点长按菜单。
- PROXY 路由另附规则集，必须将模块注释中的 RULE-SET 行加入主配置并指定自己的策略。
- 缺失的源依赖不会以空脚本冒充；受影响功能列在备注中，其他转换部分仍可使用。
- 转换及模拟测试不等于已在全部 App、账号和真实设备验证。

## 去广告（254）

| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| 健康生活 / B612咔叽去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/SnowCamera_remove_ads.sgmodule) |  |  |
| 健康生活 / Foodie去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/Foodie_remove_ads.sgmodule) |  |  |
| 健康生活 / Keep去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/Keep_remove_ads.sgmodule) |  |  |
| 健康生活 / OKOK去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/OKOK_remove_ads.sgmodule) |  |  |
| 健康生活 / PICOOC去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/PICOOC_remove_ads.sgmodule) |  |  |
| 健康生活 / RQrun去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/RQrun_remove_ads.sgmodule) |  |  |
| 健康生活 / e充电去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/EasyCharge_remove_ads.sgmodule) |  |  |
| 健康生活 / 下厨房去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/XiaChuFang_remove_ads.sgmodule) |  |  |
| 健康生活 / 中国天气去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/WeatherChina_remove_ads.sgmodule) |  |  |
| 健康生活 / 他趣去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/Taqu_remove_ads.sgmodule) |  |  |
| 健康生活 / 健康160去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/91160_remove_ads.sgmodule) |  |  |
| 健康生活 / 南网在线去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/CSG_remove_ads.sgmodule) |  |  |
| 健康生活 / 堆糖去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/DuiTang_remove_ads.sgmodule) |  |  |
| 健康生活 / 墨迹天气去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/MojiWeather_remove_ads.sgmodule) |  |  |
| 健康生活 / 大姨妈月经期助手去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/Dayima_remove_ads.sgmodule) |  |  |
| 健康生活 / 天气通去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/TianQiTong_remove_ads.sgmodule) |  |  |
| 健康生活 / 好轻去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/YunmaiScale_remove_ads.sgmodule) |  |  |
| 健康生活 / 宝宝树孕育去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/BabyTree_remove_ads.sgmodule) |  |  |
| 健康生活 / 小睡眠去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/HeartideBrainWave_remove_ads.sgmodule) |  |  |
| 健康生活 / 彩云天气去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/ColorfulClouds_remove_ads.sgmodule) |  |  |
| 健康生活 / 成分喵去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/ChengFenMiao_remove_ads.sgmodule) |  |  |
| 健康生活 / 无他相机去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/WutaCamera_remove_ads.sgmodule) |  |  |
| 健康生活 / 智慧苏州去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/SuZhouCitizenCard_remove_ads.sgmodule) |  |  |
| 健康生活 / 瑞幸咖啡去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/LuckinCoffee_remove_ads.sgmodule) |  |  |
| 健康生活 / 省钱快报去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/YueDanBa_remove_ads.sgmodule) |  |  |
| 健康生活 / 看家王去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/ChatCam_remove_ads.sgmodule) |  |  |
| 健康生活 / 美丽修行去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/Meizhixiuxing_remove_ads.sgmodule) |  |  |
| 健康生活 / 美图秀秀去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/MeiTu_remove_ads.sgmodule) |  |  |
| 健康生活 / 美柚去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/MeetYou_remove_ads.sgmodule) |  |  |
| 健康生活 / 美颜相机去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/MeituMYXJ_remove_ads.sgmodule) |  |  |
| 健康生活 / 薄荷健康去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/BooHee_remove_ads.sgmodule) |  |  |
| 健康生活 / 蜗牛睡眠去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/SnailSleep_remove_ads.sgmodule) |  |  |
| 健康生活 / 酷安去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/CoolApk_remove_ads.sgmodule) |  |  |
| 健康生活 / 阅友去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Life/Yueyou_remove_ads.sgmodule) |  |  |
| 出行汽车 / 12306去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/12306_remove_ads.sgmodule) |  |  |
| 出行汽车 / 丰巢去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/FC_Box_remove_ads.sgmodule) |  |  |
| 出行汽车 / 华住会去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/HantingHotels_remove_ads.sgmodule) |  |  |
| 出行汽车 / 哈罗去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/EasyBike_remove_ads.sgmodule) |  | 缺失上游依赖，此项未启用：https://kelee.one/Resource/JavaScript/EasyBike/mobileconfig-gateway.js |
| 出行汽车 / 小桔充电去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/XiaojukejiCharge_remove_ads.sgmodule) |  |  |
| 出行汽车 / 快递100去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/KuaiDi100_remove_ads.sgmodule) |  |  |
| 出行汽车 / 摩托范去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/MotorFans_remove_ads.sgmodule) |  |  |
| 出行汽车 / 汽车之家去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/AutoHome_remove_ads.sgmodule) |  |  |
| 出行汽车 / 滴滴去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/DiDi_remove_ads.sgmodule) |  |  |
| 出行汽车 / 滴答出行去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/DidaPincheTaxi_remove_ads.sgmodule) |  |  |
| 出行汽车 / 百度地图去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/BaiduMap_remove_ads.sgmodule) |  |  |
| 出行汽车 / 航旅纵横去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/Umetrip_remove_ads.sgmodule) |  |  |
| 出行汽车 / 菜鸟去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/Cainiao_remove_ads.sgmodule) |  |  |
| 出行汽车 / 萝卜快跑去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/RoboTaxi_remove_ads.sgmodule) |  |  |
| 出行汽车 / 行者户外去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/OnTheWay_remove_ads.sgmodule) |  |  |
| 出行汽车 / 车来了去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/Chelaile_remove_ads.sgmodule) |  |  |
| 出行汽车 / 顺丰速运去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/SF-Express_remove_ads.sgmodule) |  | 上游顺丰模拟响应 JSON 已截断，此条无效规则未启用。 |
| 出行汽车 / 飞客去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/FlyerTea_remove_ads.sgmodule) |  |  |
| 出行汽车 / 马蜂窝去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/MaFengWo_remove_ads.sgmodule) |  |  |
| 出行汽车 / 驾校一点通去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/JiaXiaoDrive_remove_ads.sgmodule) |  |  |
| 出行汽车 / 驾考宝典去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/JiaKaoBaoDian_remove_ads.sgmodule) |  |  |
| 出行汽车 / 高德地图去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Travel/Amap_remove_ads.sgmodule) |  |  |
| 基础拦截 / HTTPDNS拦截器 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Base/Block_HTTPDNS.sgmodule) |  |  |
| 基础拦截 / 可莉广告过滤器 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Base/Remove_ads_by_keli.sgmodule) |  |  |
| 基础拦截 / 广告平台拦截器 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Base/BlockAdvertisers.sgmodule) |  |  |
| 工具与智能设备 / 123云盘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/123NetWorkDisk_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 360摄像机去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/360SmartCamera_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 360智慧生活去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/SafetyHome_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / DREAME去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/DREAME_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / ECOVACS HOME去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/EcovacsHome_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / Google搜索重定向 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/Google.sgmodule) |  |  |
| 工具与智能设备 / Line去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/Line_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / QQ链接解锁 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/QQ_Redirect.sgmodule) |  |  |
| 工具与智能设备 / Reddit去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/Reddit_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / ReelShort去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/ReelShort_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / Roborock去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/Roborock_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / Sofascore去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/Sofascore_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / Telegram重定向 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/TelegramRedirect.sgmodule) | app |  |
| 工具与智能设备 / TeraBox去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/TeraBox_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 一刻相册去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/BaiduPhoto_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 两步路户外助手去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/2bulu_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 中华万年历去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/EtouchEcalendar_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 中国移动云盘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/mobileClouds_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 乐播投屏去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/TV_Assistant_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 云鲸智能去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/NarwelRobots_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 创维智慧云去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/SkyworthDigitalPicamera_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 前程无忧去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/51Job_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 口袋壁纸去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/ShoujiDesk_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 向日葵去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/OraySunlogin_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 图怪兽去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/TuGuaiShou_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 多屏互动去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/TCLnScreen_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 天天跳绳去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/CrazyRope_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 夸克去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/QuarkBrowser_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 夸克扫描王去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/QuarkScanking_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 小米音箱去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/XiaomiSpeaker_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 小蚕霸王餐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/XiaoCan_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 小黑盒去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/XiaoHeiHe_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 微脉圈去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/Weimai_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 快手去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/KuaiShou_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 快捷搜索 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/QuickSearch.sgmodule) |  |  |
| 工具与智能设备 / 慧生活798去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/SmartLife_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 数字心动去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/DigitalHeartbeat_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 智联招聘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/ZhiLianZhaoPin_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 最美壁纸去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/iWallBiZhi_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 比特球云盘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/BitqiuPan_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 百度文库去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/BaiduWenku_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 百度网盘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/BaiduNetDisk_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 百度网页去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/BaiduSearchWebpage_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 百度翻译去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/BaiduTranslate_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 百度输入法去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/Baidu_input_method_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 直播吧去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/Zhibo8_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 磁力宅播放器去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/XFuse_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 网易邮箱大师去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/MailMaster_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 萌娘百科去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/MoeGirlWiki_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 虎扑去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/HUPU_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 触站去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/Chuzhan_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 贝壳找房去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/Beike_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 迅雷去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/XunLei_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 酷狗铃声去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/KGRing_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 阿里云盘去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/AliYunDrive_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 香港抖音去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/HKDouYin_remove_ads.sgmodule) |  |  |
| 工具与智能设备 / 马克水印相机去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Utilities/marki_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 555电影去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/555DY_remove_ads.sgmodule) |  |  |
| 影音娱乐 / CC直播去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/CCLive_remove_ads.sgmodule) |  |  |
| 影音娱乐 / DJ多多去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/DjDuoDuo_remove_ads.sgmodule) |  |  |
| 影音娱乐 / Hong Kong Toolbar去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/HongKongToolbar_remove_ads.sgmodule) |  |  |
| 影音娱乐 / QQ音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/QQMusic_remove_ads.sgmodule) |  |  |
| 影音娱乐 / Spotify去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/Spotify_remove_ads.sgmodule) | tab、useractivity |  |
| 影音娱乐 / TubeMax去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/TubeMax_remove_ads.sgmodule) |  | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/FKIKelee/AdBlock/Media/TubeMax_remove_ads.list,节点选择（替换为你的代理策略）。 |
| 影音娱乐 / YY去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/YY_Voice_remove_ads.sgmodule) |  |  |
| 影音娱乐 / YY语音去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/YYVoiceTool_remove_ads.sgmodule) |  |  |
| 影音娱乐 / YouTube去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/YouTube_remove_ads.sgmodule) | blockUpload、blockShorts、blockImmersive、captionLang、debug |  |
| 影音娱乐 / 优酷视频去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/YouKu_Video_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 全民K歌去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/QQKSong_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 哔哩哔哩去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/Bilibili_remove_ads.sgmodule) | displayUpList、purifyComment、optimizeRequest、sponsorBlock、logLevel | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/FKIKelee/AdBlock/Media/Bilibili_remove_ads.list,节点选择（替换为你的代理策略）。 |
| 影音娱乐 / 哔哩哔哩漫画去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/BiliComic_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 喜马拉雅去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/Himalaya_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 小宇宙去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/CosmosPodcast_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 快影去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/KwaiVideoeditor_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 快看漫画去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/KuaiKanComic_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 斗鱼去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/Douyu_remove_ads.sgmodule) |  | 修复上游误放在 Rule 段的重定向。 |
| 影音娱乐 / 汽水音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/SodaMusic_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 波点音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/BodianMusic_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 海雀去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/AlcidaeVideo_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 漫客栈去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/MKZ_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 爱奇艺去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/iQiYi_Video_remove_ads.sgmodule) |  | 上游空 jq 转为无操作，保留原响应。 |
| 影音娱乐 / 猫耳FM去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/CatEarFM_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 纷玩岛去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/LiveLab_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 网易云音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/NeteaseCloudMusic_remove_ads.sgmodule) | MY、DT、FX、PRGG、PRRK、PRDRD、PRSCVPT、PRST、PRRR、HMPR、PRMST、PRCN |  |
| 影音娱乐 / 联掌门户去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/LZMH_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 腾讯视频去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/Tencent_Video_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 芒果TV去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/MangoTV_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 萤石云视频去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/VideoGo_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 蜻蜓FM去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/QtingFM_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 配音秀去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/DubbingShow_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 酷我音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/Kuwo_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 酷狗概念版去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/KuGouYouth_remove_ads.sgmodule) |  |  |
| 影音娱乐 / 酷狗音乐去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Media/KuGou_remove_ads.sgmodule) |  | 修复上游酷狗 jq 无法编译的递归过滤表达式。 |
| 教育办公 / Dlabel云标签去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/Dlabel_remove_ads.sgmodule) |  |  |
| 教育办公 / WakeUp课程表去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/WakeupSchedule_remove_ads.sgmodule) |  |  |
| 教育办公 / 医考帮去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/YiKaoBang_remove_ads.sgmodule) |  |  |
| 教育办公 / 学习通去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/ChaoXingStudy_remove_ads.sgmodule) |  |  |
| 教育办公 / 小白智慧打印去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/XiaobaiPrint_remove_ads.sgmodule) |  |  |
| 教育办公 / 快对去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/KuaiDuiZuoYe_remove_ads.sgmodule) |  |  |
| 教育办公 / 排班日历去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/AxWorkSchedule_remove_ads.sgmodule) |  |  |
| 教育办公 / 易校园去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/YiSchool_remove_ads.sgmodule) |  |  |
| 教育办公 / 有道云笔记去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/YoudaoNote_remove_ads.sgmodule) |  |  |
| 教育办公 / 有道翻译官去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/YoudaoTrans_remove_ads.sgmodule) |  |  |
| 教育办公 / 稿定设计去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/GaoDing_remove_ads.sgmodule) |  |  |
| 教育办公 / 粉笔去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/FenBi_remove_ads.sgmodule) |  |  |
| 教育办公 / 网易有道词典去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/YoudaoDict_remove_ads.sgmodule) |  | 修复上游裸域名规则为 DOMAIN REJECT。 |
| 教育办公 / 腾讯文档去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/TXDocs_remove_ads.sgmodule) |  |  |
| 教育办公 / 超级课程表去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/MyFriday_remove_ads.sgmodule) |  |  |
| 教育办公 / 金山文档去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/WPS_Documents_remove_ads.sgmodule) |  |  |
| 教育办公 / 闪动校园去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Education/ShandongSchool_remove_ads.sgmodule) |  |  |
| 游戏电竞 / 5EPlay去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Games/5EPlay_remove_ads.sgmodule) |  |  |
| 游戏电竞 / Jump去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Games/Jump_remove_ads.sgmodule) |  |  |
| 游戏电竞 / 剑网三无界去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Games/SeasunJX3_remove_ads.sgmodule) |  |  |
| 游戏电竞 / 完美世界电竞去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Games/PerfectWorldEsport_remove_ads.sgmodule) |  |  |
| 游戏电竞 / 库街区去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Games/KuroBBS_remove_ads.sgmodule) |  |  |
| 游戏电竞 / 掌上无畏契约去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Games/ValorantBible_remove_ads.sgmodule) |  |  |
| 游戏电竞 / 掌上英雄联盟去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Games/LOL_Bible_remove_ads.sgmodule) |  |  |
| 游戏电竞 / 每日赛车去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Games/MeiRiSaiChe_remove_ads.sgmodule) |  |  |
| 游戏电竞 / 米游社去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Games/miHoYoBBS_remove_ads.sgmodule) |  |  |
| 游戏电竞 / 网易大神去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Games/NetEaseGodlike_remove_ads.sgmodule) |  |  |
| 社交社区 / KOOK去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/KOOK_remove_ads.sgmodule) |  |  |
| 社交社区 / Pinterest去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Pinterest_remove_ads.sgmodule) |  |  |
| 社交社区 / Soul去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Soul_remove_ads.sgmodule) |  |  |
| 社交社区 / Tumblr去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Tumblr_remove_ads.sgmodule) |  |  |
| 社交社区 / Uki去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Uki_remove_ads.sgmodule) |  |  |
| 社交社区 / 亲宝宝去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Qbb_remove_ads.sgmodule) |  |  |
| 社交社区 / 威锋去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/WPForum_remove_ads.sgmodule) |  |  |
| 社交社区 / 小红书去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/RedPaper_remove_ads.sgmodule) |  |  |
| 社交社区 / 微信公众号去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Weixin_Official_Accounts_remove_ads.sgmodule) |  |  |
| 社交社区 / 微信小程序去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/WexinMiniPrograms_Remove_ads.sgmodule) |  |  |
| 社交社区 / 微博去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Weibo_remove_ads.sgmodule) |  |  |
| 社交社区 / 微博轻享版去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Weibo_intl_remove_ads.sgmodule) |  |  |
| 社交社区 / 最右去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/ZuiYou_remove_ads.sgmodule) |  |  |
| 社交社区 / 比心去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Bixin_remove_ads.sgmodule) |  |  |
| 社交社区 / 测测去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Cece_remove_ads.sgmodule) |  |  |
| 社交社区 / 百度贴吧去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Tieba_remove_ads.sgmodule) | per_filter_video_thread |  |
| 社交社区 / 皮皮虾去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/PiPiXia_remove_ads.sgmodule) |  |  |
| 社交社区 / 知乎去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/Zhihu_remove_ads.sgmodule) |  |  |
| 社交社区 / 脉脉去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/MaiMai_remove_ads.sgmodule) |  |  |
| 社交社区 / 豆瓣去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/DouBan_remove_ads.sgmodule) |  |  |
| 社交社区 / 豆瓣阅读去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Social/DoubanRead_remove_ads.sgmodule) |  |  |
| 购物电商 / 京东去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/JD_remove_ads.sgmodule) |  |  |
| 购物电商 / 京东外卖去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/JDWaimai_remove_ads.sgmodule) |  |  |
| 购物电商 / 什么值得买去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/smzdm_remove_ads.sgmodule) |  | 修复上游 jq 中无效的非空白正则转义。 |
| 购物电商 / 叮咚买菜去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/DingdongMaicai_remove_ads.sgmodule) |  |  |
| 购物电商 / 大麦去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/Damai_remove_ads.sgmodule) |  |  |
| 购物电商 / 天猫校园去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/TmallCampus_remove_ads.sgmodule) |  |  |
| 购物电商 / 小店掌柜去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/ShopKeeperAdmin_remove_ads.sgmodule) |  |  |
| 购物电商 / 小象超市去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/iMaiCai_remove_ads.sgmodule) |  |  |
| 购物电商 / 得物去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/Dewu_remove_ads.sgmodule) |  |  |
| 购物电商 / 微店去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/Weidian_remove_ads.sgmodule) |  |  |
| 购物电商 / 拼多多去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/PinDuoDuo_remove_ads.sgmodule) |  |  |
| 购物电商 / 摩天轮去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/FerrisWheel_remove_ads.sgmodule) |  |  |
| 购物电商 / 收银通商户端去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/ShouYinTongMerchant_remove_ads.sgmodule) |  |  |
| 购物电商 / 朴朴超市去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/PuPuMall_remove_ads.sgmodule) |  |  |
| 购物电商 / 沃尔玛去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/Walmart_remove_ads.sgmodule) |  |  |
| 购物电商 / 淘宝去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/Taobao_remove_ads.sgmodule) |  |  |
| 购物电商 / 淘票票去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/Taopiaopiao_remove_ads.sgmodule) |  |  |
| 购物电商 / 盒马去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/MrHema_remove_ads.sgmodule) |  |  |
| 购物电商 / 盖得排行去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/GuideRank_remove_ads.sgmodule) |  |  |
| 购物电商 / 美食杰去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/MeiShiJie_remove_ads.sgmodule) |  |  |
| 购物电商 / 胖乖生活去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/PangguaiLife_remove_ads.sgmodule) |  |  |
| 购物电商 / 转转去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/ZhuanZhuan_remove_ads.sgmodule) |  |  |
| 购物电商 / 闲鱼去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/FleaMarket_remove_ads.sgmodule) |  |  |
| 购物电商 / 飞猪旅行去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Shopping/TaobaoTravel_remove_ads.sgmodule) |  |  |
| 金融保险 / 中国人保去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Finance/PICC_Insurance_remove_ads.sgmodule) |  |  |
| 金融保险 / 启信宝去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Finance/QiXinBao_remove_ads.sgmodule) |  |  |
| 金融保险 / 挖财记账去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Finance/WaCaiJiZhang_remove_ads.sgmodule) |  |  |
| 金融保险 / 挖财记账去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Finance/Wacai_remove_ads.sgmodule) |  |  |
| 金融保险 / 新浪财经去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Finance/SinaStock_remove_ads.sgmodule) |  |  |
| 金融保险 / 爱企查去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Finance/Aiinquiry_remove_ads.sgmodule) |  |  |
| 金融保险 / 金十数据去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Finance/Jin10Data_remove_ads.sgmodule) |  |  |
| 金融保险 / 随手记去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Finance/KingdeeMyMoney_remove_ads.sgmodule) |  |  |
| 金融保险 / 雪球去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Finance/Snowball_remove_ads.sgmodule) |  |  |
| 金融保险 / 风鸟去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Finance/RiskBird_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 36氪去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/36Kr_remove_ads.sgmodule) |  |  |
| 阅读资讯 / IT之家去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/IThome_remove_ads.sgmodule) | removePinnedArticles、removeAllBanners |  |
| 阅读资讯 / ZAKER去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/ZAKER_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 一甜相机去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/Yitian_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 七猫小说去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/SevenCat_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 书旗小说去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/ShuQiCenterReader_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 凤凰新闻去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/ifengNews_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 华尔街见闻去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/FinanceNews_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 天气预报去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/iReaderCityWeather_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 小喵看书去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/MiaoRead_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 帆书去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/KebidaDushu_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 得间小说去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/iReaderDejian_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 掌阅去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/iReader_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 推栏去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/Daily_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 番茄小说去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/DragonRead_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 纵横小说去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/ZongHeng_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 网易新闻去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/NeteaseNews_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 虎嗅去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/Huxiu_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 财新去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/CaixinMedia_remove_ads.sgmodule) |  |  |
| 阅读资讯 / 起点读书去广告 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/AdBlock/Reading/QiDian_remove_ads.sgmodule) |  |  |

## 功能增强（9）

| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| Apple天气增强 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Enhancement/AppleWeatherEnhancer.sgmodule) | Weather.Provider、NextHour.Provider、AirQuality.Calculate.Algorithm、API.ColorfulClouds.Token、API.QWeather.Host、API.QWeather.Token、API.WAQI.Token、Storage、LogLevel |  |
| Fileball网盘挂载 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Enhancement/Fileball_mount.sgmodule) |  |  |
| IPA工具箱助手 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Enhancement/IPATool.sgmodule) |  |  |
| Spotify歌词增强 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Enhancement/Spotify_lyrics_translation.sgmodule) |  |  |
| TestFlight地区解锁 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Enhancement/TestFlightRegionUnlock.sgmodule) |  | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/FKIKelee/Enhancement/TestFlightRegionUnlock.list,节点选择（替换为你的代理策略）。 |
| VVebo时间线修复 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Enhancement/VVebo_repair.sgmodule) |  |  |
| YouTube双语翻译 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Enhancement/YouTubeSubtitlesTranslation.sgmodule) | Type、AutoCC、ShowOnly、Position |  |
| 京东比价 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Enhancement/JD_Price.sgmodule) |  |  |
| 微信外部链接解锁 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Enhancement/Weixin_external_links_unlock.sgmodule) |  |  |

## 节点检测（3）

| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| WARP节点查询 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Diagnostics/WARP_Node_Query.sgmodule) | policy |  |
| 代理链路检测 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Diagnostics/NodeLinkCheck.sgmodule) | policy |  |
| 节点检测工具 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Diagnostics/Node_detection_tool.sgmodule) | policy |  |

## 签到（2）

| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| Follow每日签到 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/CheckIn/FollowRSS_checkin.sgmodule) | token、cookie、cron |  |
| WPS每日签到 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/CheckIn/WPS_checkin.sgmodule) | CaptureCookie、AK、SK、DAY、MAX_RETRIES、CRONEXP |  |

## 定时任务（1）

| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| 自动加入TestFlight | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Automation/Auto_Join_TF.sgmodule) | CaptureAccountToken、RunTask、RunMonitor、TaskCron、TaskMonitor、App_ID | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/FKIKelee/Automation/Auto_Join_TF.list,节点选择（替换为你的代理策略）。 |

## 订阅管理（1）

| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| Sub-Store | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Subscription/Sub-Store.sgmodule) | cron | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/FKIKelee/Subscription/Sub-Store.list,节点选择（替换为你的代理策略）。 |

## DNS（1）

| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| DNS防泄露 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/DNS/Prevent_DNS_Leaks.sgmodule) |  | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/FKIKelee/DNS/Prevent_DNS_Leaks.list,节点选择（替换为你的代理策略）。 |

## 配置管理（1）

| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| 1.1.1.1配置管理 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Configuration/1.1.1.1.sgmodule) |  |  |

## 资源转换（1）

| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| Script-Hub | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Conversion/Script-Hub.sgmodule) | ScriptHubNotify、Parser_body_max、Parser_http_timeout | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/FKIKelee/Conversion/Script-Hub.list,节点选择（替换为你的代理策略）。 |

## 数据管理（1）

| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| BoxJs | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Data/BoxJs.sgmodule) |  | 主配置需添加：RULE-SET,https://raw.githubusercontent.com/RoaycL/Surge/main/Ruleset/FKIKelee/Data/BoxJs.list,节点选择（替换为你的代理策略）。 |

## 其他（1）

| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |
| --- | --- | --- | --- |
| 知识星球去水印 | [模块](https://raw.githubusercontent.com/RoaycL/Surge/main/Module/FKIKelee/Other/UnnooQuan_remove_watermark.sgmodule) |  |  |

