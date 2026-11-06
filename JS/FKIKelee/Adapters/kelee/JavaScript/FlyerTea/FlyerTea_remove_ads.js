// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/FlyerTea/FlyerTea_remove_ads.js
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
// 2024-07-10 10:53:30
var url = $request.url;
var body = $response.body;

if (url.includes("/api/mobile/index.php?module=basicdata&type=app_onoff")) {
    var banner = JSON.parse(body);

    // 删除我的页面横幅
    delete banner.Variables.data.xinren;

    var pathsToClear = [
        // 删除发帖界面评选推广
        "goodhotel",
        "goodhotel_txt",
        "goodthread",
        "goodthread_txt",
        // 删除我的页面横幅广告
        "homeinns_already_joined",
        "homeinns_entry",
        "homeinns_entry_banner",
        "homeinns_entry_url"
    ];

    pathsToClear.forEach(function(path) {
        if (banner.Variables && banner.Variables.data && banner.Variables.data[path]) {
            banner.Variables.data[path] = {};
        }
    });

    $done({ body: JSON.stringify(banner) });
} else if (url.includes("/api/mobile/index.php?module=plugin&id=k_misign:sign")) {
    var sign_adv = JSON.parse(body);

    // 删除签到弹窗广告
    if (sign_adv.Variables && sign_adv.Variables.data && sign_adv.Variables.data.adv) {
        delete sign_adv.Variables.data.adv;
    }

    $done({ body: JSON.stringify(sign_adv) });
} else if (url.includes("/api/mobile/index.php?version=5")) {
    var section_adv = JSON.parse(body);

    // 删除会员说版块广告
    if (section_adv.Variables && section_adv.Variables.data && Array.isArray(section_adv.Variables.data)) {
        section_adv.Variables.data.forEach(function(item) {
            if (item.adv) {
                item.adv = {};
            }
        });
    }

    $done({ body: JSON.stringify(section_adv) });
} else {
    $done({ body: body });
}
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
