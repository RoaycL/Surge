// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/12306/12306_remove_ads.js
(function(){
const fkRaw=typeof $argument==='string'?$argument:'';const fkOpts={};
for(const p of fkRaw.split('&')){const i=p.indexOf('=');if(i<0)continue;let v=p.slice(i+1);try{v=decodeURIComponent(v);}catch(_){}if(v==='true')v=true;else if(v==='false')v=false;fkOpts[p.slice(0,i)]=v;}
const fkNativeDone=$done;if(fkOpts.__enable===false){fkNativeDone({});return;}
const fkPolicy=fkOpts.__policy||'DIRECT';delete fkOpts.__enable;delete fkOpts.__policy;
// Legacy plugin controls used persistent storage. Seed only when a module
// setting changes, so scripts can still update/remove IDs between cron runs.
for(const k of Object.keys(fkOpts)){if(!k.startsWith('__store_'))continue;const dest=k.slice(8),value=String(fkOpts[k]),seed='FKIKelee.parameter.'+dest;if(value&&$persistentStore.read(seed)!==value){$persistentStore.write(value,dest);$persistentStore.write(value,seed);}delete fkOpts[k];}
const fkStyle="query";const fkArg=fkStyle==='object'?fkOpts:fkStyle==='json'?JSON.stringify(fkOpts):Object.keys(fkOpts).map(k=>k+'='+fkOpts[k]).join('&');
globalThis.$argument=fkArg;
const fkReq=typeof $request==='undefined'?undefined:$request;const fkRes=typeof $response==='undefined'?undefined:$response;
if(fkReq&&fkReq.body instanceof Uint8Array)fkReq.bodyBytes=fkReq.body;
if(fkRes){if(fkRes.body instanceof Uint8Array)fkRes.bodyBytes=fkRes.body;if(fkRes.status===undefined)fkRes.status=fkRes.statusCode;}
let fkFinished=false;
function fkDone(r){if(fkFinished)return;fkFinished=true;r=r||{};if(r.bodyBytes!==undefined){r.body=r.bodyBytes;delete r.bodyBytes;}if(r.status!==undefined&&fkRes){r.status=Number(String(r.status).match(/\d{3}/)?.[0]||r.status);}if(!fkReq&&r.htmlMessage){r.content=String(r.htmlMessage).replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'');delete r.htmlMessage;}fkNativeDone(r);}
const fkEnv=Object.assign({},typeof $environment==='object'?$environment:{},{params:{node:fkPolicy,nodeInfo:{name:fkPolicy}}});
const fkNativeHTTP=$httpClient;const fkHTTP={};for(const method of ['get','post','put','delete','head','patch','options'])if(fkNativeHTTP[method])fkHTTP[method]=function(o,cb){if(o&&typeof o==='object'&&o.node){o=Object.assign({},o,{policy:o.node});delete o.node;}return fkNativeHTTP[method](o,cb);};

(function($argument,$done,$request,$response,$environment,$httpClient){
/*
引用地址https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/header.js
*/
// 2024-11-24 18:15

const url = $request.url;
const header = $request.headers;
const contype = header["content-type"];
const headopt = header["operation-type"];

if (url.includes("/mobile.12306.cn/otsmobile/app/mgs/")) {
  // 12306页面内容
  const list12306 = [
    // "com.cars.otsmobile.bangbangSafe.deciveInfo", // 设备序列号
    // "com.cars.otsmobile.checkLoginStatus", // 登录信息
    // "com.cars.otsmobile.city",
    // "com.cars.otsmobile.initCountry",
    // "com.cars.otsmobile.initNewSysCache",
    // "com.cars.otsmobile.initProvince",
    "com.cars.otsmobile.integration.activityBanner", // 活动横幅
    "com.cars.otsmobile.memberInfo.getMemberQa", // 铁路会员 常见问题
    // "com.cars.otsmobile.memberInfo.integrationHomeInit", // 铁路会员 会员信息
    // "com.cars.otsmobile.newHomePage.getWeatherByStationCode", // 天气信息
    "com.cars.otsmobile.newHomePage.initData", // 热门资讯
    "com.cars.otsmobile.newHomePageBussData", // 商品信息流
    // "com.cars.otsmobile.newHomePageRefresh",
    "com.cars.otsmobile.paySuccBuss.bussEntryShow" // 商业推广
    // "com.cars.otsmobile.travelPage.initData", // 出行服务
  ];
  if (list12306?.includes(headopt)) {
    $done();
  } else {
    $done({});
  }
} else if (url.includes("/mobilepaas.abchina.com.cn:441/mgw")) {
  // 中国农业银行开屏广告
  const listbankabc = [
    "com.bankabc.recommendcenter.homepage.gethpadverinfo",
    "com.abchina.mbank.common.homepage.getStartParam"
  ];
  if (listbankabc?.includes(headopt)) {
    $done();
  } else {
    $done({});
  }
} else if (url.includes("/sec.sginput.qq.com/q")) {
  // 搜狗输入法候选词推广
  if (contype === "application/octet-stream") {
    $done();
  } else {
    $done({});
  }
} else {
  $done({});
}

})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
