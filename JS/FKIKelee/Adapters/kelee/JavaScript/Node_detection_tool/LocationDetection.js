// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/Node_detection_tool/LocationDetection.js
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
/* 测试 api
 * 地理位置查询
 * 感谢并修改自https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/geo_location.js
 * 脚本功能：检查节点的地理位置
 * 原作者：XIAO_KOP
*/

// $environment.params with input params
console.log($environment.params);
var url = "http://ip-api.com/json/";

/**
 * build 411 版本后 添加$environment.params.nodeInfo对象，表示简单的节点信息
 * 注意：由于安全限制，nodeInfo对象中仅有一下信息
 {
    address = "example.com";
    name = "节点名称";
    port = 12443;
    tls = 1;
    type = Vmess;
}
 */
var inputParams = $environment.params;
var nodeName = inputParams.node;

/**
 * node: Specify network activity on this node
 */
var requestParams = {
    "url":url,
    "node":nodeName
}

var message = ""
const paras = ["query","as","org","isp","countryCode","city","lon","lat"];
const paran = ["远端IP地址","远端IP ASN","ASN所属机构","远端ISP","远端IP地区","远端IP城市","远端经度","远端纬度"];

$httpClient.get(requestParams, (error, response, data) => {
    if (error) {
        message = "</br></br>🔴 查询超时"
        message = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: bold;">` + message + `</p>`
        $done({"title": "  地理位置查询", "htmlMessage": message});
    } else {
        console.log(data);
        message = data ? json2info(data, paras) : "";
        $done({"title": "  地理位置查询", "htmlMessage": message});
    }
})

function json2info(cnt, paras) {
    var res = "-------------------------------";
    cnt = JSON.parse(cnt);
    console.log(cnt);
    for (i = 0;i < paras.length; i ++) {
        cnt[paras[i]] = paras[i] == "countryCode" ? cnt[paras[i]] + " ⟦" + flags.get(cnt[paras[i]].toUpperCase()) + "⟧" : cnt[paras[i]];
        res = cnt[paras[i]] ? res + "</br><b>" + "<font  color=>" + paran[i] + "</font> : " + "</b>"+ "<font  color=>" + cnt[paras[i]] + "</font></br>" : res;
    }
    res = res + "-------------------------------" + "</br>" + "<font color=#6959CD>" + "<b>节点</b> ➟ " + $environment.params.node + "</font>";
    res = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + res + `</p>`;
    return res;
}

var flags = new Map([[ "AC" , "🇦🇨" ] ,["AE","🇦🇪"], [ "AF" , "🇦🇫" ] , [ "AI" , "🇦🇮" ] , [ "AL" , "🇦🇱" ] , [ "AM" , "🇦🇲" ] , [ "AQ" , "🇦🇶" ] , [ "AR" , "🇦🇷" ] , [ "AS" , "🇦🇸" ] , [ "AT" , "🇦🇹" ] , [ "AU" , "🇦🇺" ] , [ "AW" , "🇦🇼" ] , [ "AX" , "🇦🇽" ] , [ "AZ" , "🇦🇿" ] , ["BA", "🇧🇦"], [ "BB" , "🇧🇧" ] , [ "BD" , "🇧🇩" ] , [ "BE" , "🇧🇪" ] , [ "BF" , "🇧🇫" ] , [ "BG" , "🇧🇬" ] , [ "BH" , "🇧🇭" ] , [ "BI" , "🇧🇮" ] , [ "BJ" , "🇧🇯" ] , [ "BM" , "🇧🇲" ] , [ "BN" , "🇧🇳" ] , [ "BO" , "🇧🇴" ] , [ "BR" , "🇧🇷" ] , [ "BS" , "🇧🇸" ] , [ "BT" , "🇧🇹" ] , [ "BV" , "🇧🇻" ] , [ "BW" , "🇧🇼" ] , [ "BY" , "🇧🇾" ] , [ "BZ" , "🇧🇿" ] , [ "CA" , "🇨🇦" ] , [ "CF" , "🇨🇫" ] , [ "CH" , "🇨🇭" ] , [ "CK" , "🇨🇰" ] , [ "CL" , "🇨🇱" ] , [ "CM" , "🇨🇲" ] , [ "CN" , "🇨🇳" ] , [ "CO" , "🇨🇴" ] , [ "CP" , "🇨🇵" ] , [ "CR" , "🇨🇷" ] , [ "CU" , "🇨🇺" ] , [ "CV" , "🇨🇻" ] , [ "CW" , "🇨🇼" ] , [ "CX" , "🇨🇽" ] , [ "CY" , "🇨🇾" ] , [ "CZ" , "🇨🇿" ] , [ "DE" , "🇩🇪" ] , [ "DG" , "🇩🇬" ] , [ "DJ" , "🇩🇯" ] , [ "DK" , "🇩🇰" ] , [ "DM" , "🇩🇲" ] , [ "DO" , "🇩🇴" ] , [ "DZ" , "🇩🇿" ] , [ "EA" , "🇪🇦" ] , [ "EC" , "🇪🇨" ] , [ "EE" , "🇪🇪" ] , [ "EG" , "🇪🇬" ] , [ "EH" , "🇪🇭" ] , [ "ER" , "🇪🇷" ] , [ "ES" , "🇪🇸" ] , [ "ET" , "🇪🇹" ] , [ "EU" , "🇪🇺" ] , [ "FI" , "🇫🇮" ] , [ "FJ" , "🇫🇯" ] , [ "FK" , "🇫🇰" ] , [ "FM" , "🇫🇲" ] , [ "FO" , "🇫🇴" ] , [ "FR" , "🇫🇷" ] , [ "GA" , "🇬🇦" ] , [ "GB" , "🇬🇧" ] , [ "HK" , "🇭🇰" ] ,["HU","🇭🇺"], [ "ID" , "🇮🇩" ] , [ "IE" , "🇮🇪" ] , [ "IL" , "🇮🇱" ] , [ "IM" , "🇮🇲" ] , [ "IN" , "🇮🇳" ] , [ "IS" , "🇮🇸" ] , [ "IT" , "🇮🇹" ] , [ "JP" , "🇯🇵" ] , [ "KR" , "🇰🇷" ] , [ "LU" , "🇱🇺" ] , [ "MO" , "🇲🇴" ] , [ "MX" , "🇲🇽" ] , [ "MY" , "🇲🇾" ] , [ "NL" , "🇳🇱" ] , [ "PH" , "🇵🇭" ] , [ "RO" , "🇷🇴" ] , [ "RS" , "🇷🇸" ] , [ "RU" , "🇷🇺" ] , [ "RW" , "🇷🇼" ] , [ "SA" , "🇸🇦" ] , [ "SB" , "🇸🇧" ] , [ "SC" , "🇸🇨" ] , [ "SD" , "🇸🇩" ] , [ "SE" , "🇸🇪" ] , [ "SG" , "🇸🇬" ] , [ "TH" , "🇹🇭" ] , [ "TN" , "🇹🇳" ] , [ "TO" , "🇹🇴" ] , [ "TR" , "🇹🇷" ] , [ "TV" , "🇹🇻" ] , [ "TW" , "🇨🇳" ] , [ "UK" , "🇬🇧" ] , [ "UM" , "🇺🇲" ] , [ "US" , "🇺🇸" ] , [ "UY" , "🇺🇾" ] , [ "UZ" , "🇺🇿" ] , [ "VA" , "🇻🇦" ] , [ "VE" , "🇻🇪" ] , [ "VG" , "🇻🇬" ] , [ "VI" , "🇻🇮" ] , [ "VN" , "🇻🇳" ] , [ "ZA" , "🇿🇦"]])
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
