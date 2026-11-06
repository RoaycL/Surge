// Generated Loon rewrite compatibility handler.
(function(){const routes=[{"pattern":"^https?://testflight\\.apple\\.com/v\\d/accounts/.+?/install$","flags":"i","op":"request.body.replace","args":[{"regex":"\"storefrontId\"\\x20:\\x20\"\\d{6}-\\d{2},\\d{2}\",","flags":""},"\"storefrontId\":\"143441-19,29\","]}];const responsePhase=typeof $response!=='undefined';const target=responsePhase?$response:$request;
try{let result={};for(const r of routes){const match=new RegExp(r.pattern,r.flags).exec($request.url);if(!match)continue;const a=r.args,op=r.op;
if(op.endsWith('.body.mock')){result.body=a[1];if(a[2]!==undefined)result.status=a[2];result.headers=Object.assign({},target.headers,{'Content-Type':a[0]==='json'?'application/json':'text/plain'});}
else if(op.endsWith('.body.replace')){result.body=String(result.body??target.body??'').replace(new RegExp(a[0].regex,a[0].flags),a[1]);}
else if(op.endsWith('.header.replace')){result.headers=Object.assign({},result.headers||target.headers);const k=Object.keys(result.headers).find(k=>k.toLowerCase()===a[0].toLowerCase());if(k)result.headers[k]=String(result.headers[k]).replace(new RegExp(a[1].regex,a[1].flags),a[2]);}
else if(op.endsWith('.header.add')){result.headers=Object.assign({},result.headers||target.headers,{[a[0]]:a[1]});}
else if(op==='url.replace'){result.url=a[0].replace(/\$\{urlMatch\.(\d+)\}/g,(_,n)=>match[Number(n)]||'');result.headers=Object.assign({},result.headers||target.headers);for(const k of Object.keys(result.headers))if(k.toLowerCase()==='host')result.headers[k]=result.url.match(/^https?:\/\/([^/]+)/)[1];}
}$done(result);}catch(e){console.log('FKIKelee rewrite: '+e);$done({});}})();
