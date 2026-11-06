// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/Baidu_input_method/Baidu_input_method_remove_ads.js
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
脚本引用https://raw.githubusercontent.com/Keywos/rule/main/JS/bdsrf.js
*/
const okk = JSON.parse($response.body);
if (/imrobot\/v1\/pub\/relation\/get_robot_list/.test($request.url)) {
  okk.data.robot_info.forEach((robot) => {
robot.friend_bg_img = `https://raw.githubusercontent.com/Keywos/rule/main/mocks/bd/robot${Math.floor(Math.random() * 12) + 1}.jpg`;});
} else if (/v5\/custom_page\/layout/.test($request.url)) {
  const keyi=["\u529f\u80fd\u5165\u53e3","\u8868\u60c5\u56fe\u6807iOSan","\u4e00\u4e22\u513f\u989c\u6587\u5b57\u6807\u9898\u680f-iOSan","\u6d3b\u52a8\u4e2d\u5fc3\u6807\u9898\u680fiOS","\u5b57\u4f53banner",];
  const keys = ["\u5b57\u4f53banner", "\u6d3b\u52a8\u4e2d\u5fc3\u6807\u9898\u680fiOS"];
  if (okk.data.page_layout_content && Array.isArray(okk.data.page_layout_content)) {
    okk.data.page_layout_content = okk.data.page_layout_content.filter(
      ({ module_desc }) => keyi.includes(module_desc));}
  if (okk.data.page_data_content && Array.isArray(okk.data.page_data_content)) {
    okk.data.page_data_content = okk.data.page_data_content.filter(
      ({ module_desc }) => keyi.includes(module_desc) && !keys.some((keyword) => module_desc.includes(keyword)));}
} else if (/v5\/custom_page\/getdata/.test($request.url)) {
  if (okk.data && Array.isArray(okk.data)) {
    okk.data.forEach((item) => {if (item.items) {item.items = [];}});}
}$done({ body: JSON.stringify(okk) });

})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
