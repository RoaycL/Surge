// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/MotorFans/MotorFans_remove_ads.js
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
// Loon 响应体修改脚本模板
// 适用于 Loon 的 HTTP 响应脚本

(() => {
    // 快速失败检查
    if (!$response?.body) return $done({});

    let body;
    try {
        body = JSON.parse($response.body);
    } catch (e) {
        console.log(`JSON解析失败: ${e.message}`);
        return $done({});
    }

    let modified = false;

    // 预定义过滤类型（避免重复创建数组）
    const UNWANTED_TAB_TYPES = new Set([2, 3]);

    // 命中关键字即移除对应字段（区分大小写）
    const REMOVED_KEYWORDS = [
        "_ad_",
        "splash",
        "adPatch",
        "AdFree",
        "adFeed",
        "AdTime",
        "AdAlert",
        "AdConfig",
        "cancelInspire",
        "financeAvoidChannel",
        "_popup_",
        "HomeKingKong",
        "MyWalletConfig",
        "insurance_product_url",
        "insurance_order_url",
    ];

    // 服务端 data 为空/null 时兜底为 3 个 Tab，避免客户端继续使用旧缓存
    const FALLBACK_TITLES = {
        0: "首页",
        1: "玩圈",
        4: "我的",
    };
    const FALLBACK_TAB_TYPES = [0, 1, 4];

    const fallbackTab = (type, light) => {
        const index = type === 4 ? 5 : type + 1;
        return {
            titleColor: light ? "#333333" : "#C7C9D0",
            imageUrl: light
                ? `https://imgs3.58moto.com/img/app/${index}@3x.png`
                : `https://imgs3.58moto.com/img/icon2/black_${index}@3x.png`,
            type,
            title: FALLBACK_TITLES[type],
            selectedImageUrl: light
                ? `https://imgs3.58moto.com/img/app/${index}_s@3x.png`
                : `https://imgs3.58moto.com/img/icon2/black_${index}_s@3x.png`,
            selectedTitleColor: light ? "#111111" : "#C7C9D0",
        };
    };

    const getFallbackData = () => ({
        dymaicTabBar: FALLBACK_TAB_TYPES.map((type) => fallbackTab(type, true)),
        blackDymaicTabBar: FALLBACK_TAB_TYPES.map((type) => fallbackTab(type, false)),
    });

    const shouldRemoveTab = (item) => {
        const type = item?.type;
        return UNWANTED_TAB_TYPES.has(type) || UNWANTED_TAB_TYPES.has(Number(type));
    };

    const shouldRemoveField = (key) => {
        return REMOVED_KEYWORDS.some((keyword) => key.includes(keyword));
    };

    // 递归移除命名字段
    const cleanFields = (node) => {
        if (Array.isArray(node)) {
            node.forEach(cleanFields);
            return;
        }
        if (!node || typeof node !== "object") return;

        for (const key of Object.keys(node)) {
            if (shouldRemoveField(key)) {
                delete node[key];
                modified = true;
            } else {
                cleanFields(node[key]);
            }
        }
    };

    // API路径处理映射
    const processData = () => {
        let dataPath = body?.data;
        if (dataPath === null || dataPath === undefined) {
            body.data = JSON.stringify(getFallbackData());
            modified = true;
            return;
        }

        if (typeof dataPath === "string") {
            try {
                dataPath = JSON.parse(dataPath);
            } catch (e) {
                console.log(`data JSON解析失败: ${e.message}`);
                return;
            }
        }
        if (typeof dataPath !== "object" || dataPath === null) return;

        // 数组过滤优化
        for (const tabKey of ["dymaicTabBar", "blackDymaicTabBar"]) {
            const items = dataPath[tabKey];
            if (!Array.isArray(items) || items.length === 0) continue;

            const filteredItems = items.filter((item) => !shouldRemoveTab(item));
            if (filteredItems.length !== items.length) {
                dataPath[tabKey] = filteredItems;
                modified = true;
            }
        }

        // 移除命名字段
        cleanFields(dataPath);

        // data 原本是字符串时同步写回
        if (typeof body.data === "string") {
            body.data = JSON.stringify(dataPath);
        }
    };

    // 返回结果
    processData();
    $done(modified ? { body: JSON.stringify(body) } : {});
})();
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
