// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/CaixinMedia/CaixinMedia_remove_ads.js
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
脚本引用 https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/break/caixin.js
*/
// 2024-07-16 20:00

var url = $request.url;
const isQuanX = typeof $task !== "undefined";

if (url.includes("/gg.caixin.com/s")) {
  // 开屏广告
  let body = $response.body;
  if (body === undefined) {
    $done({});
  } else {
    body = body
      .replace(/"showfrequency":\d+/g, '"showfrequency":0')
      .replace(/"showintval":\d+/g, '"showintval":0')
      .replace(/"showcycle":\d+/g, '"showcycle":604800')
      .replace(/"intval":\d+/g, '"intval":0')
      .replace(/"sday":"[^"]*"/g, '"sday":"2090-12-31 00:00:00"')
      .replace(/"eday":"[^"]*"/g, '"eday":"2090-12-31 23:59:59"')
      .replace(/"banner":/g, "ban0:");
    $done({ body });
  }
} else {
  if (!$response) $done({});
  if (!$response.body) $done({});
  let obj = JSON.parse($response.body);
  if (url.includes("/api/dataplus/columns")) {
    // 首页-数据通
    const items = ["buttonColor", "buttonText", "buyUrl", "descText"];
    if (obj?.data?.length > 0) {
      for (let item of obj.data) {
        for (let i of items) {
          delete item[i];
        }
      }
    }
  } else if (url.includes("/articlev5/")) {
    // 文章底部-相关阅读
    if (obj?.data?.relatarticle?.length > 0) {
      obj.data.relatarticle = [];
    }
  } else if (url.includes("/caixinapp/appinfo")) {
    // 文章详情页
    if (obj?.data?.articlePromotionList?.length > 0) {
      // 文章底部推广图
      obj.data.articlePromotionList = [];
    }
  } else if (url.includes("/channelv5/list")) {
    // 首页-顶部分类列表
    delete obj.data.ios_ad_513;
    delete obj.data.android_ad_513;
  } else if (url.includes("/fm/index/list")) {
    // 首页-财新fm
    const items = ["androidAdList", "headlines", "iosAdList"];
    if (obj?.data) {
      for (let i of items) {
        if (obj?.data?.[i]?.length > 0) {
          obj.data[i] = [];
        }
      }
    }
  } else if (url.includes("/index_page_v5")) {
    // 首页-信息流
    delete obj.data.ios_ad_513;
    delete obj.data.android_ad_513;
    if (obj?.data?.list?.length > 0) {
      obj.data.list = obj.data.list.filter((i) => !["金融我闻", "财新数据通"]?.includes(i?.channel_name));
    }
  } else if (url.includes("/search/getkeyword")) {
    // 搜索框填充词
    if (obj?.data?.keys?.length > 0) {
      obj.data.keys = [];
    }
  }
  $done({ body: JSON.stringify(obj) });
}
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
