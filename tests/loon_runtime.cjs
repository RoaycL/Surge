const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const manifest=JSON.parse(fs.readFileSync('upstreams/fkikelee/manifest.json','utf8'));
const modules=new Map(manifest.modules.map(m=>[m.id,m]));
const normalize=x=>JSON.parse(JSON.stringify(x));
function evaluate(code,{url='https://example.com',body,argument='',generic=false,store={}}={}){
 let result,calls=0;const requests=[],pending=[];
 const context={Uint8Array,$argument:argument,$environment:{'surge-version':'6.10'},$persistentStore:{read:k=>store[k]??null,write:(v,k)=>(store[k]=v,true)},$httpClient:{get:(o,cb)=>{requests.push(o);pending.push(()=>cb(null,{status:200},'{"status":"success","query":"1.2.3.4","countryCode":"US","country":"Test","regionName":"Region","city":"City","isp":"ISP"}'));}},$done:x=>{calls++;result=x;},console:{log(){}},setTimeout,clearTimeout};
 if(!generic)context.$request={url,headers:{Host:'example.com',MethodName:'abcGetBannerList'}};
 if(body!==undefined)context.$response={body,status:200,statusCode:200,headers:{}};
 vm.runInNewContext(code,context,{timeout:3000});
 for(const callback of pending)callback();
 assert.equal(calls,1);return {result,requests,store};
}
function file(suffix){const p=[...new Set(Object.values(manifest.resources).map(r=>r.path))].find(p=>p.endsWith(suffix));assert.ok(p,suffix);return fs.readFileSync(p.replace('/Resources/','/Adapters/'),'utf8');}
function custom(style,source){return fs.readFileSync('scripts/loon_adapter.js.tpl','utf8').replace('__STYLE__',JSON.stringify(style)).replace('__SOURCE__','test')+'\n(function($argument,$done,$request,$response,$environment,$httpClient){'+source+'})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);})();';}
// Surge module text parameters become typed Loon script arguments.
let code=file('IThome/IThome_remove_ads.js');
const input={data:{list:[{feedType:10002,id:1},{feedType:10003,id:2},{feedType:1,id:3},{feedType:10004,id:4}]}};
let r=evaluate(code,{body:JSON.stringify(input),argument:'removeAllBanners=false&removePinnedArticles=false'});
assert.deepEqual(JSON.parse(r.result.body).data.list.map(x=>x.id),[1,2,3]);
r=evaluate(code,{body:JSON.stringify(input),argument:'removeAllBanners=true&removePinnedArticles=true'});
assert.deepEqual(JSON.parse(r.result.body).data.list.map(x=>x.id),[3]);
// URL-encoded opaque tokens keep their embedded separators.
r=evaluate(custom('object','$done({body:JSON.stringify($argument)})'),{argument:'cookie=a%3Db%26c%3Dd&token=abc%2Cdef'});
assert.deepEqual(JSON.parse(r.result.body),{cookie:'a=b&c=d',token:'abc,def'});
r=evaluate(custom('json','$done({body:JSON.stringify(JSON.parse($argument))})'),{argument:'tab=false&useractivity=true'});
assert.deepEqual(JSON.parse(r.result.body),{tab:false,useractivity:true});
// Disabled scripts perform no HTTP activity or persistent writes.
r=evaluate(custom('object','throw new Error("must not execute")'),{argument:'__enable=false&__store_App_ID=secret'});
assert.deepEqual(normalize(r.result),{});assert.deepEqual(r.store,{});assert.equal(r.requests.length,0);
// A module control seeds the legacy store once; script mutations survive next run.
const store={};code=custom('query','$done({body:$persistentStore.read("App_ID")})');
r=evaluate(code,{argument:'__store_App_ID=A%2CB',store});assert.equal(r.result.body,'A,B');store.App_ID='B';
r=evaluate(code,{argument:'__store_App_ID=A%2CB',store});assert.equal(r.result.body,'B');
r=evaluate(code,{argument:'__store_App_ID=C',store});assert.equal(r.result.body,'C');
// Binary input/output uses native Surge body, with a compatibility bodyBytes alias.
r=evaluate(custom('query','$done({bodyBytes:$response.bodyBytes});$done({});'),{body:new Uint8Array([1,2,3])});
assert.ok(r.result.body instanceof Uint8Array);assert.deepEqual([...r.result.body],[1,2,3]);
// Node long-press context maps to a user-selected Surge policy and a plain panel.
r=evaluate(custom('query','$httpClient.get({url:"https://example.com",node:$environment.params.node},()=>{$done({title:"Node",htmlMessage:"<b>ok</b><br>done"})})'),{generic:true,argument:'__policy=My%20Proxy'});
assert.equal(r.requests[0].policy,'My Proxy');assert.equal(r.requests[0].node,undefined);assert.equal(r.result.content,'ok\ndone');
r=evaluate(file('Node_detection_tool/LocationDetection.js'),{generic:true,argument:'__policy=TestProxy'});
assert.equal(r.requests[0].policy,'TestProxy');assert.ok(r.result.title);
// Original simple script behavior survives wrapping.
r=evaluate(file('BooHee/BooHee_remove_ads.js'),{url:'https://api.boohee.com/meta-interface/v1/index/plaza-flow?x=1',body:'{"data":{"contents":[{"type":4},{"type":1}]}}'});
assert.deepEqual(JSON.parse(r.result.body),{data:{contents:[{type:1}]}});
// Non-jq actions: retain request URL rewrite semantics and capture groups.
code=fs.readFileSync('JS/FKIKelee/Rewrite/Spotify_remove_ads-request.js','utf8');
r=evaluate(code,{url:'https://spclient.wg.spotify.com/artistview/v1/artist/abc&platform=iphone'});
assert.equal(r.result.url,'https://spclient.wg.spotify.com/artistview/v1/artist/abc&platform=ipad');
code=fs.readFileSync('JS/FKIKelee/Rewrite/Tencent_Video_remove_ads-replace-body.js','utf8');
// Request-body rewrites need a request body, not a response body.
let result;const context={$request:{url:'https://vv.video.qq.com/getvinfo',body:'&sppreviewtype=1&foo=2&spsrt=1'},$done:x=>result=x,console:{log(){}}};vm.runInNewContext(code,context);
assert.equal(result.body,'&sppreviewtype=0&foo=2&spsrt=0');
console.log('PASS: FKIKelee typed parameters, legacy controls, disabled scripts, binary bodies, generic/policy bridge, source-script behavior and URL/body rewrites.');
