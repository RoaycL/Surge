// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/VVebo/VVebo_repair.js
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
脚本引用https://raw.githubusercontent.com/suiyuran/stash/main/scripts/fix-vvebo-user-timeline.js
*/
// 2024-02-04 22:09:40

let url = $request.url;
let hasUid = (url) => url.includes("uid");
let getUid = (url) => (hasUid(url) ? url.match(/uid=(\d+)/)[1] : undefined);
if (url.includes("remind/unread_count")) {
  $persistentStore.write(getUid(url), "uid");
  $done({});
} else if (url.includes("statuses/user_timeline")) {
  let uid = getUid(url) || $persistentStore.read("uid");
  url = url.replace("statuses/user_timeline", "profile/statuses/tab").replace("max_id", "since_id");
  url = url + `&containerid=230413${uid}_-_WEIBO_SECOND_PROFILE_WEIBO`;
  $done({ url });
} else if (url.includes("profile/statuses/tab")) {
  let data = JSON.parse($response.body);
  let statuses = data.cards
    .map((card) => (card.card_group ? card.card_group : card))
    .flat()
    .filter((card) => card.card_type === 9)
    .map((card) => card.mblog)
    .map((status) => (status.isTop ? { ...status, label: "置顶" } : status));
  let sinceId = data.cardlistInfo.since_id;
  $done({ body: JSON.stringify({ statuses, since_id: sinceId, total_number: 100 }) });
} if (url.includes("selffans")) {
  let data = JSON.parse($response.body);
  let cards = data.cards.filter((card) => card.itemid !== "INTEREST_PEOPLE2");
  $done({ body: JSON.stringify({ ...data, cards }) });
} else {
  $done({});
}
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
