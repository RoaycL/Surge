// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/JD/JD_remove_ads.js
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
脚本引用https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/jingdong.js
*/
// 2024-01-23 09:50

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (url.includes("functionId=deliverLayer") || url.includes("functionId=orderTrackBusiness")) {
  // 物流页面
  if (obj?.bannerInfo) {
    // 收货时寄快递享八折 享受条件苛刻 故移除
    delete obj.bannerInfo;
  }
  if (obj?.floors?.length > 0) {
    // 运费八折
    obj.floors = obj.floors.filter((i) => !["banner", "jdDeliveryBanner"]?.includes(i?.mId));
  }
} else if (url.includes("functionId=getTabHomeInfo")) {
  // 新品页面
  if (obj?.result?.iconInfo) {
    // 新品页 悬浮动图
    delete obj.result.iconInfo;
  }
  if (obj?.result?.roofTop) {
    // 新品页 下拉二楼
    delete obj.result.roofTop;
  }
} else if (url.includes("functionId=myOrderInfo")) {
  // 订单页面
  if (obj?.floors?.length > 0) {
    let newFloors = [];
    for (let floor of obj.floors) {
      if (["bannerFloor", "bpDynamicFloor", "plusFloor"]?.includes(floor?.mId)) {
        // bannerFloor满意度评分 bpDynamicFloor专属权益 plusFloor开通会员
        continue;
      } else {
        if (floor?.mId === "virtualServiceCenter") {
          // 服务中心
          if (floor?.data?.virtualServiceCenters?.length > 0) {
            let newItems = [];
            for (let item of floor.data.virtualServiceCenters) {
              if (item?.serviceList?.length > 0) {
                let newCards = [];
                for (let card of item.serviceList) {
                  if (card?.serviceTitle === "精选特惠") {
                    continue;
                  }
                  newCards.push(card);
                }
                item.serviceList = newCards;
              }
              newItems.push(item);
            }
            floor.data.virtualServiceCenters = newItems;
          }
        }
        if (floor?.mId === "customerServiceFloor") {
          // 客户服务
          if (floor?.data?.moreText) {
            // 点此获得更多服务
            delete floor.data.moreIcon;
            delete floor.data.moreIcon_dark;
            floor.data.moreText = " ";
          }
        }
        newFloors.push(floor);
      }
    }
    obj.floors = newFloors;
  }
} else if (url.includes("functionId=personinfoBusiness")) {
  // 个人页面
  if (obj?.floors?.length > 0) {
    let newFloors = [];
    for (let floor of obj.floors) {
      const items = [
        "bigSaleFloor", // 双十一
        "buyOften", // 常买常逛
        // "iconToolFloor", // 底部工具栏
        // "keyToolsFloor", // 浏览记录
        "newAttentionCard", // 关注的频道
        "newBigSaleFloor", // 双十一
        "newStyleAttentionCard", // 新版关注的频道
        // "newWalletIdFloor", // 我的钱包
        "newsFloor", // 京东快讯
        "noticeFloor", // 顶部横幅
        // "orderIdFloor", // 我的订单
        "recommendfloor" // 我的推荐
      ];
      if (items?.includes(floor?.mId)) {
        continue;
      } else {
        if (floor?.mId === "basefloorinfo") {
          // 弹窗
          if (floor?.data?.commonPopup) {
            delete floor.data.commonPopup;
          }
          // 弹窗
          if (floor?.data?.commonPopup_dynamic) {
            delete floor.data.commonPopup_dynamic;
          }
          // 底部会员续费横幅
          if (floor?.data?.commonTips?.length > 0) {
            floor.data.commonTips = [];
          }
          // 弹窗
          if (floor?.data?.commonWindows?.length > 0) {
            floor.data.commonWindows = [];
          }
          // 右下角动图
          if (floor?.data?.floatLayer) {
            delete floor.data.floatLayer;
          }
        } else if (floor?.mId === "iconToolFloor") {
          // 底部工具栏
          if (floor?.data?.nodes?.length > 0) {
            const sortLists = [
              "applezhushou", // apple助手 1-1-1
              "lingjindouxin", // 签到领豆 1-1-2
              "dongdongnongchangxin", // 京东农场 1-1-3
              "chongwangwang", // 宠汪汪 1-1-4
              "kehufuwu", // 客户服务 1-2-1
              "xianzhiguanjia", // 闲置换钱 1-2-2
              "wenyisheng", // 问医生 1-2-3
              "jijianfuwu", // 寄件服务 1-2-5
              "zhuanzuanhongbao", // 天天赚红包 2-2-1
              "huanletaojin" // 欢乐淘金 2-2-2
            ];
            let node = floor.data.nodes;
            if (node?.[0]?.length > 0) {
              // 第一组十个
              node[0] = node[0]
                .filter((i) => sortLists?.includes(i?.functionId))
                .sort((a, b) => sortLists.indexOf(a?.functionId) - sortLists.indexOf(b?.functionId));
            }
            if (node?.[1]?.length > 0) {
              // 第二组四个
              node[1] = node[1]
                .filter((i) => sortLists?.includes(i?.functionId))
                .sort((a, b) => sortLists.indexOf(a?.functionId) - sortLists.indexOf(b?.functionId));
            }
          }
        } else if (floor?.mId === "orderIdFloor") {
          if (floor?.data?.commentRemindInfo?.infos?.length > 0) {
            // 发布评价的提醒
            floor.data.commentRemindInfo.infos = [];
          }
        } else if (floor?.mId === "userinfo") {
          // 个人页 顶部背景图
          // if (floor?.data?.bgImgInfo?.bgImg) {
          //   delete floor.data.bgImgInfo.bgImg;
          // }
          // 开通plus会员卡片
          if (floor?.data?.newPlusBlackCard) {
            delete floor.data.newPlusBlackCard;
          }
        }
        newFloors.push(floor);
      }
    }
    obj.floors = newFloors;
  }
} else if (url.includes("functionId=start")) {
  // 开屏广告
  if (obj?.images?.length > 0) {
    obj.images = [];
  }
  if (obj?.showTimesDaily) {
    obj.showTimesDaily = 0;
  }
} else if (url.includes("functionId=welcomeHome")) {
  // 首页配置
  if (obj?.floorList?.length > 0) {
    const delItems = [
      "bottomXview", // 底部悬浮通栏推广
      "float", // 悬浮推广小圆图
      "photoCeiling", // 顶部通栏动图推广
      // "recommend", // 为你推荐
      "ruleFloat", // 资质与规则
      "searchIcon", // 右上角消费券
      "topRotate", // 左上角logo
      "tabBarAtmosphere" // 底部悬浮通栏推广
    ];
    // 首页 图层列表
    obj.floorList = obj.floorList.filter((i) => !delItems?.includes(i?.type));
  }
  // 首页 顶部背景图
  // if (obj?.topBgImgBig) {
  //   delete obj.topBgImgBig;
  // }
  // 首页 下拉二楼
  if (obj?.webViewFloorList?.length > 0) {
    obj.webViewFloorList = [];
  }
}

$done({ body: JSON.stringify(obj) });
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
