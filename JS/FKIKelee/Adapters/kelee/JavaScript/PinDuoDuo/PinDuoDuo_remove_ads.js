// Surge adapter. Original source: https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JavaScript/PinDuoDuo/PinDuoDuo_remove_ads.js
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
https://t.me/ibilibili
2026-07-11 20:05:34
*/
let body = $response.body || "";

const oldChunk = "https://pfile.pddpic.com/mdkd/mdkd/_next/static/chunks/9410-b8806e870a26db7d.js";
const newChunk = "https://kelee.one/Resource/JavaScript/PinDuoDuo/9410-b8806e870a26db7d.js";

function replaceAllText(text, from, to) {
  let pos = text.indexOf(from);
  while (pos !== -1) {
    text = text.slice(0, pos) + to + text.slice(pos + from.length);
    pos = text.indexOf(from, pos + to.length);
  }
  return text;
}

function removeGifContainer(html) {
  const marker = "index_gif-container";
  let pos = html.indexOf(marker);

  while (pos !== -1) {
    const open = html.lastIndexOf("<div", pos);
    if (open === -1) break;

    let i = open;
    let depth = 0;
    let end = -1;

    while (i < html.length) {
      const nextOpen = html.indexOf("<div", i);
      const nextClose = html.indexOf("</div>", i);
      if (nextClose === -1) break;

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        i = nextOpen + 4;
      } else {
        depth--;
        i = nextClose + 6;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }

    if (end === -1) break;

    html = html.slice(0, open) + html.slice(end);
    pos = html.indexOf(marker, open);
  }

  return html;
}

function trimNextData(html) {
  const idNeedle = 'id="__NEXT_DATA__"';
  const idPos = html.indexOf(idNeedle);
  if (idPos === -1) return html;

  const tagStart = html.lastIndexOf("<script", idPos);
  if (tagStart === -1) return html;

  const contentStart = html.indexOf(">", tagStart);
  if (contentStart === -1) return html;

  const tagEnd = html.indexOf("</script>", contentStart);
  if (tagEnd === -1) return html;

  const jsonText = html.slice(contentStart + 1, tagEnd);

  try {
    const data = JSON.parse(jsonText);
    const serverData = data &&
      data.props &&
      data.props.pageProps &&
      data.props.pageProps.serverData;

    if (Array.isArray(serverData)) {
      data.props.pageProps.serverData = serverData.filter(item =>
        item &&
        (item.key === "fastBindCMobilePreCheck" ||
         item.key === "queryStationPackageInfo")
      );
    }

    return html.slice(0, contentStart + 1) +
      JSON.stringify(data) +
      html.slice(tagEnd);
  } catch (e) {
    return html;
  }
}

body = replaceAllText(body, oldChunk, newChunk);
body = removeGifContainer(body);
body = trimNextData(body);

$done({ body });
})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);
})();
