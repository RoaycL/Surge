// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/KuaiKanComic/KuaiKanComic_remove_ads.js
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
// 2024-07-19 05:14:35
const url = $request.url;
const body = $response.body;

if (!body) $done({});

let obj;
try {
    obj = JSON.parse(body);
} catch (e) {
    console.error("JSON解析错误:", e);
    $done({});
}

const regexTabList = /\/v\d\/ironman\/discovery_v\d\/tab_list_v\d/; // 首页 - 热门 - 顶部标签
const regexConfigs = /\/v\d\/graph\/homepage\/comicVideo\/v\d\/configs/; // 社区 - 发现 - 顶部标签
const regexUnifiedFeed = /\/v\d\/graph\/unified_feed$/; // 社区 - 广场轮播图、作者说 - 商品推广

const targetTitles = ["KK评委", "2024新漫报到", "VIP"]; // 首页 - 热门 - 顶部标签
const targetDescs = ["超级漫画节", "在kk当评委", "屈臣氏·KKCOS大赏", "KK朋友圈", "KK运势"]; // 社区 - 发现 - 顶部标签

function removeObjectsWith(obj, key, targets) {
    if (Array.isArray(obj)) {
        return obj.filter(item => !item[key] || !targets.includes(item[key]));
    } else if (typeof obj === 'object' && obj !== null) {
        for (let k in obj) {
            if (obj[k] && typeof obj[k] === 'object') {
                if (obj[k][key] && targets.includes(obj[k][key])) {
                    delete obj[k];
                } else {
                    obj[k] = removeObjectsWith(obj[k], key, targets);
                }
            }
        }
    }
    return obj;
}

function processUnifiedFeed(obj) {
    if (obj.data && obj.data.universalModels) {
        obj.data.universalModels.forEach(model => {
            if (model.loopBanner) {
                delete model.loopBanner; // 社区 - 广场轮播图
            }
            if (model.post && model.post.promotions && model.post.promotions[0] && model.post.promotions[0].type === 4) {
                delete model.post.promotions; // 社区 - 作者说 - 商品推广
            }
        });
    }
    return obj;
}

if (regexTabList.test(url)) {
    obj = removeObjectsWith(obj, 'title', targetTitles);
}

if (regexConfigs.test(url)) {
    obj = removeObjectsWith(obj, 'desc', targetDescs);
}

// 修改广告参数
if (url.includes("/ironman/comic/recommend")) {
    const keysToDelete = [
        "operation_float_ball",
        "topic_goods",
        "total_coupon",
        "share_comics_page_lottery"
    ];
    keysToDelete.forEach(key => delete obj.data[key]);
}

if (regexUnifiedFeed.test(url)) {
    obj = processUnifiedFeed(obj);
}

$done({ body: JSON.stringify(obj) });

})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
