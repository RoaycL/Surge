// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/BabyTree/BabyTree_remove_ads.js
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
脚本引用https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/babytree.js
*/
// 2024-10-28 01:35

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (url.includes("/app_index/get_app_tab")) {
  // 底部tab
  if (obj?.data?.selected_list?.length > 0) {
    obj.data.selected_list = obj.data.selected_list.filter((i) => !["购物", "商城"]?.includes(i?.name));
  }
} else if (url.includes("/bafconfigcenter_intf/config/get")) {
  // 整体配置
  const items = [
    "pregnancy__find_group_guide_image_url", // 加入的圈子
    "pregnancy__home_left_icon", // 直播图标
    "pregnancy__home_left_icon_new", // 直播图标
    "pregnancy__home_left_icon_static", // 直播图标
    "pregnancy__video_white_list" // 宝宝视频
  ];
  if (obj?.data) {
    for (let i of items) {
      if (obj?.data?.[i]) {
        obj.data[i] = "";
      }
    }
  }
} else if (url.includes("/cms_column/get_column_list")) {
  // tab配置
  if (obj?.data?.list?.length > 0) {
    let newLists = [];
    for (let item of obj.data.list) {
      if (item?.data_source_list?.length > 0) {
        let newDatas = [];
        for (let i of item.data_source_list) {
          // 首页顶部tab
          if (i?.tab_name?.includes("精品秒杀")) {
            continue;
          } else {
            newDatas.push(i);
          }
        }
        item.data_source_list = newDatas;
      }
      if (["225", "226", "238", "239"]?.includes(item?.id)) {
        // 我的页面模块
        // 225我的福利 226banner轮播图 238美囤商城 239会员进群
        continue;
      }
      newLists.push(item);
    }
    obj.data.list = newLists;
  }
} else if (url.includes("/feeds/get_index_feeds_list")) {
  // 首页信息流
  if (obj?.data?.list?.length > 0) {
    obj.data.list = obj.data.list.filter(
      (i) => ["发表了", "提问了"]?.includes(i?.action_desc) && !i.hasOwnProperty("seeding_goods_info")
    );
  }
} else if (url.includes("/mobile_search_new/search_index")) {
  // 搜索列表
  if (obj?.data?.find_search) {
    delete obj.data.find_search; // 搜索发现
  }
} else if (url.includes("/user/get_user_info")) {
  // 我的页面
  if (obj?.data?.video_show) {
    delete obj.data.video_show; // 顶部婴儿视频
  }
}

$done({ body: JSON.stringify(obj) });
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
