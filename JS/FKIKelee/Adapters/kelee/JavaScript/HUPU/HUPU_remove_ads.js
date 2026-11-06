// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/HUPU/HUPU_remove_ads.js
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
脚本引用https://raw.githubusercontent.com/ZenmoFeiShi/Qx/main/HP.js
*/
// 2024-06-14 11:04
const url = $request.url;
let obj = JSON.parse($response.body);

if (url.includes("/buffer/hotList")) {
    delete obj.result.topBanner;
}

if (url.includes("/mang/preview/banners")) {
    delete obj.data;
}

if (url.includes("/bbsallapi/lego/data")) {
    obj.data.cards.forEach(card => { 
        if (card.code === "multiIcon") {
            const titlesToRemove = ["个性换肤", "专家预测", "邀请好友", "版主中心", "JRs战术板", "草稿箱", "58同城"];
            if (card.components && card.components.length > 0) {
                card.components = card.components.filter(component => {
                    return !(component.data && titlesToRemove.includes(component.data.title));
                });
            }
        }
    });
}

if (obj.data && obj.data.cards) {
    obj.data.cards = obj.data.cards.filter(card => {
        if (card.components && card.components.length > 0) {
            return !card.components.some(component => component.data && component.data.title === "我的应用");
        }
        return true;
    });
}

if (url.includes("/bplapi/user/v1/more")) {
    if (obj.result && obj.result.vipInfo && obj.result.vipInfo.textInfo) {
        delete obj.result.vipInfo.textInfo;
    }
    if (obj.result && obj.result.vipInfo) {
        delete obj.result.vipInfo;
    }
}

$done({ body: JSON.stringify(obj) });
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
