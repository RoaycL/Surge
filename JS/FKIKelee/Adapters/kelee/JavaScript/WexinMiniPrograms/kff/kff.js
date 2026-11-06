// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/WexinMiniPrograms/kff/kff.js
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
let obj = JSON.parse($response.body);
obj.data.config = JSON.stringify(JSON.parse(obj.data.config).filter(item => !item.id.includes("13502ede-f5fd-4d5c-90f5-f2454a30fda0")));
obj.data.config = JSON.stringify(JSON.parse(obj.data.config).filter(item => !item.id.includes("c1caaf62-e91d-4040-b533-dab39c0fec13")));
obj.data.config = JSON.stringify(JSON.parse(obj.data.config).filter(item => !item.id.includes("cc9d17ec-3ac5-494b-b82e-8d3c72c243d4")));
obj.data.config = JSON.stringify(JSON.parse(obj.data.config).filter(item => !item.id.includes("7bef8fe9-0daf-46b3-a2b0-dd9fba49423f")));
obj.data.config = JSON.stringify(JSON.parse(obj.data.config).filter(item => !item.id.includes("ff7e1263-d8d2-4f09-9947-d8c43c77bb10")));
obj.data.config = JSON.stringify(JSON.parse(obj.data.config).filter(item => !item.id.includes("874197b4-fe93-4a80-a555-8df1bc7e8211")));
obj.data.config = JSON.stringify(JSON.parse(obj.data.config).filter(item => !item.id.includes("0ba6a615-b7e9-48aa-afe7-329635385f2c")));
obj.data.config = JSON.stringify(JSON.parse(obj.data.config).filter(item => !item.id.includes("a11b0e7d-a162-4802-ac71-21d98e8adddf")));
$done({body: JSON.stringify(obj)});
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
