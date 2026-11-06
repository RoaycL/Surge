// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/Chelaile/Chelaile_remove_ads.js
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
https://t.me/ibilibili
2026-07-04 19:20:23
*/

(() => {
    if (!$response?.body) return $done({});

    const PREFIX = "**YGKJ";
    const SUFFIX = "YGKJ##";

    let rawBody = $response.body;
    let jsonText = rawBody;

    const hasWrapper = rawBody.startsWith(PREFIX) && rawBody.endsWith(SUFFIX);

    if (hasWrapper) {
        jsonText = rawBody.slice(PREFIX.length, rawBody.length - SUFFIX.length);
    }

    let body;
    try {
        body = JSON.parse(jsonText);
    } catch (e) {
        console.log(`JSON解析失败: ${e.message}`);
        return $done({});
    }

    const data = body?.jsonr?.data;
    if (!data || typeof data !== "object") {
        return $done({});
    }

    let modified = false;

    const deleteKeys = [
        "newYear",
        "splashGray",
        "enableSplashGray",
        "splashAdType",
        "splashCloseTime",
        "sadt",
        "dynamicSplashTime",
        "splashCoverBar",
        "splashSkipShowType",
        "skipPopType",
        "skipPopTime",
        "skipStopDis",
        "adPopExhibitTime",
        "isAdPopExhibit",
        "adStrategy",
        "adConfigTriggerDelayTime",
        "adNeedAnimate",
        "needFetchInterstitialAd",
        "intersitialAdPre",
        "nativeAdFetchType",
        "preloadAds",
        "searchAdPos",
        "searchPageAdType",
        "searchPageAdAnimation",
        "showTopSearchAd",
        "feedAdClickSlipRegionType",
        "feedAdClickSlipShowType",
        "feedInfoSource",
        "feedBackCutType",
        "feedBackShakeType",
        "expressAdDelayRefreshTime",
        "disableAdAutoRefresh",
        "reportAdNumLimit",
        "shakeLeve",
        "bdCloseDownloadDisplay",
        "bdShowSplashDialog",
        "sat",
        "ldrAdAnimal",
        "newKuaishouPicUrl",
        "newKuaishouShowType",
        "newKuaishouHigh",
        "newKuaishouFeedId",
        "kuaishouFeedId",
        "showKSVideoHeader",
        "ttSplashUsePhonePixel",
        "supportMiniGame",
        "welfareColor",
        "welfareAllPage",
        "welfareUrl",
        "welfareSignUrl",
        "oneLoginType",
        "oneLoginPopType",
        "oneLoginCheck",
        "douyinLoginType",
        "appInstallExhibitInterval",
        "aiSpeakKeywords",
        "aiSpeakTime",
        "aiSpeakPreTime",
        "aiSpeakAfterTime",
        "voiceSearchMode",
        "favGrayForAI",
        "scanCodeTipType",
        "blacklistDomains",
        "appBackupDomains",
        "useHttpDns",
        "weatherGrayFlag"
    ];

    for (const key of deleteKeys) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            delete data[key];
            modified = true;
        }
    }

    if (!modified) {
        return $done({});
    }

    const result = JSON.stringify(body);
    const finalBody = hasWrapper ? `${PREFIX}${result}${SUFFIX}` : result;

    $done({ body: finalBody });
})();
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
