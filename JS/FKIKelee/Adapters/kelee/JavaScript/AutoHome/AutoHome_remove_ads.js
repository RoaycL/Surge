// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/AutoHome/AutoHome_remove_ads.js
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
// 2024-07-17 18:20:06
let url = $request.url;
try {
    let obj = JSON.parse($response.body);

    // 删除首页 - 左上角以旧换新
    if (/\/news_v\d+(?:\.\d+){2}\/news\/homenavigation/.test(url)) {
        delete obj.result.leftops;
    }

    // 删除社区广场 - 广告轮播图
    if (/\/club_v\d+(?:\.\d+){2}\/club\/index\/businessv\d+/.test(url)) {
        delete obj.result.bannerlist;
    }

    // 删除选车 - 直播浮窗
    if (url.includes("/carstreaming/selectcarportal/reclist")) {
        delete obj.result.liveinfo;
    }
    
    // 删除我的页面 - 移除添加我的爱车领券
    if (/\/platform\/carserver\/carcard\/mycardv\d+/.test(url)) {
      delete obj.result.nocartext;
  }

    // 删除我的页面 - 热门活动
    if (/\/platform\/carserver\/carcard\/cards/.test(url)) {
      delete obj.result.list[0];
  }

    // 遍历关键词删除
    function removeItemsWithKeywords(objc, keyword) {
        var otherlist = objc["result"]["otherlist"]
        if (Array.isArray(otherlist)) {
          otherlist = otherlist.filter(function(ol) {
            var lists = ol["list"]
            if (Array.isArray(lists)) {
              for (let index in lists) {
                var item = lists[index]
                if (item["title"] === keyword) {
                  return false
                }
              }
            }
            return true
          });
        }
        objc["result"]["otherlist"] = otherlist
        return objc
    }

    // 选车 - 新车报价页面直播内容
    if (url.includes("/carstreaming/selectcarportal/seriestopwithtagscard")) {
        obj = removeItemsWithKeywords(obj, "直播中");
        obj = removeItemsWithKeywords(obj, "报价中");
    }

    // 删除二手车 - 竖版轮播图
    if (/\/apic\/v\d+\/gethomepagefeed/.test(url)) {
        obj = removeItemsWithKeywords(obj, "车抵贷");
    }

    // 精简精选服务、全部服务
    if (/\/platform\/carserver\/((usercenter\/getservicecards)|(carcard\/allcard))/.test(url)) {
        obj = removeItemsWithKeywords(obj, "低息借钱");
        obj = removeItemsWithKeywords(obj, "分期购车");
        obj = removeItemsWithKeywords(obj, "车主贷");
        obj = removeItemsWithKeywords(obj, "测贷款额度");
        obj = removeItemsWithKeywords(obj, "测贷款额");
    }

    console.log(JSON.stringify(obj))
    $done({ body: JSON.stringify(obj) });
} catch (e) {
    console.error(e);
    $done({ body: $response.body });
}
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
