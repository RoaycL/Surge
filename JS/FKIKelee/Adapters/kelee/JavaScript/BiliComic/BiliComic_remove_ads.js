// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/BiliComic/BiliComic_remove_ads.js
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
// 2024-07-19 09:51:31
const url = $request.url;
var newBody = {}

const processResponse = (regex, filterFunc) => {
    if (regex.test(url)) {
        let obj = JSON.parse($response.body);
        console.log($response.body)
        filterFunc(obj);
        console.log(JSON.stringify(obj))
        newBody = { body: JSON.stringify(obj) }
    }
};

const filterNewcomerAndMall = obj => {
    if (obj.data && obj.data.home_type) {
        obj.data.home_type = obj.data.home_type.filter(item => item.name !== "新人" && item.name !== "新作"); // 首页标签
    }
    if (obj.data && obj.data.home_feed) {
        obj.data.home_feed = obj.data.home_feed.filter(item => item.name !== "商城"); // 首页标签
    }
};

const filterNoTraffic = obj => {
    if (obj.data && obj.data.confs) {
        obj.data.confs = obj.data.confs.filter(item => item.title !== "漫画商城" && item.title !== "超漫俱乐部" && item.title !== "看漫免流量"); // 我的页面
    }
};

// const filterNovelBanners = obj => {
//     if (obj.data && obj.data.banners) {
//         delete obj.data.banners; // 小说列表横幅 - 删除会导致小说列表为空
//     }
// };

processResponse(/\/twirp\/comic\.v\d\.Comic\/GetClassPageAllTabs/, filterNewcomerAndMall);
processResponse(/\/twirp\/user\.v\d\.User\/UCenterConf/, filterNoTraffic);
// processResponse(/\/twirp\/novel\.v\d\.Home\/Home/, filterNovelBanners);

$done(newBody);
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
