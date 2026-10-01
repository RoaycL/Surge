export function fragment(origin: string, token: string) {
  return `# 私密配置：包含设备读取令牌，请勿上传公开仓库。\n# 将各项合并到主配置的同名分区；加载后自动初始化；可点面板立即更新。\n[General]\nencrypted-dns-server = https://dns.alidns.com/dns-query\n\n[Host]\n* = script:alidns-cloud-dns\n\n[Script]\nalidns-cloud-dns = type=dns,script-path=${origin}/client/surge.js?v=20261002,argument="endpoint=${origin}/client/selection&token=${token}",timeout=10\nalidns-cloud-update = type=cron,cronexp="0 5,20,35,50 * * * *",script-path=${origin}/client/surge.js?v=20261002,argument="endpoint=${origin}/client/selection&token=${token}",timeout=10,wake-system=1\nalidns-cloud-start = type=event,event-name=engine-started,script-path=${origin}/client/surge.js?v=20261002,argument="endpoint=${origin}/client/selection&token=${token}",timeout=10\nalidns-cloud-panel = type=generic,script-path=${origin}/client/surge.js?v=20261002,argument="endpoint=${origin}/client/selection&token=${token}",timeout=10\n\n[Panel]\nAliDNS 云端选择 = script-name=alidns-cloud-panel,update-interval=900\n`;
}

export function moduleText(origin: string, token: string) {
  return (
    "#!name=AliDNS 云端额度选择\n#!desc=十五分钟读取云端选择；云端北京时间每日06/14/22点查额度，DNS 直接连接阿里；私密模块请勿分享。\n" +
    fragment(origin, token)
  );
}
export function moduleLinks(origin: string, token: string) {
  const url =
    origin + "/client/module.sgmodule?token=" + encodeURIComponent(token);
  return {
    url,
    installUrl: "surge:///install-module?url=" + encodeURIComponent(url),
  };
}
