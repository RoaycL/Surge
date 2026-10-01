const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const source = fs.readFileSync(__dirname + '/alidns-auto.js', 'utf8');
const ids = [1,2,3,4];
const names = ids.map(slot => 'AliDNS DNS Slot '+slot);
const isPublic = r => r.active.length === 0 && r.panel.content.includes('公共 DNS');
async function run({usage=[0,0,0,0], enabled=[], argument, missing=false, postFail=false, dataBad=false, empty=false, noKeys=false, auto=false, apiCode, httpStatus=200}={}) {
 const store = {}, posts=[];
 let active = enabled.slice(), done;
 const completion = new Promise(resolve => done=resolve);
 const ctx = vm.createContext({console, Date, $argument: argument ?? (noKeys ? '' : ids.map((_,i)=>`id${i+1}=test${i}&secret${i+1}=dummy`).join('&')),
  $script:{type:'generic'}, $trigger:auto?'auto-interval':'button',
  setTimeout:()=>0,
  $persistentStore:{read:k=>store[k]||null,write:(v,k)=>(store[k]=v,true)},
  $done:done,
  $httpClient:{get:(opts,cb)=>{
    const slot=Number(new URL(opts.url).searchParams.get('AccessKeyId').slice(-1));
    if (usage[slot]===null) return cb('network error containing private URL and Secret',null,null);
    if (apiCode) return cb(null,{status:httpStatus},JSON.stringify({Code:apiCode,Message:'DO_NOT_SHOW_SECRET',RequestId:'mock'}));
    cb(null,{status:200},JSON.stringify({RequestId:'mock',Data:empty?[]:[dataBad?{}:{HttpCount:0,HttpsCount:usage[slot],DohTotalCount:usage[slot]}]}));
  }},
  $httpAPI:(method,path,body,cb)=>{
    if(method==='GET') return cb({available:missing?names.slice(1):names,enabled:active});
    posts.push(body);
    if(postFail) return cb({error:'mock failure'});
    active=active.filter(n=>!Object.hasOwn(body,n)).concat(Object.keys(body).filter(k=>body[k])); cb({});
  }});
 vm.runInContext(source,ctx);
 const panel=await completion;
 return {ctx,panel,posts,active,store};
}
(async()=>{
 let count=0;
 const check=(v)=>{assert(v);count++;};
 let r=await run({usage:[1000000,200000,500000,800000]});
 check(r.active[0]===names[1] && r.active.length===1);
 r=await run({usage:[100000,120000,500000,800000],enabled:[names[1]]});
 check(r.active[0]===names[1] && r.posts.length===0);
 r=await run({usage:[100000,220000,500000,800000],enabled:[names[1]]});
 check(r.active[0]===names[0]);
 r=await run({usage:[1800000,1800000,1800000,1800000],enabled:[names[0]]});
 check(isPublic(r));
 r=await run({usage:[null,500000,600000,700000],enabled:[names[0]]});
 check(r.active[0]===names[1]);
 r=await run({usage:[null,null,null,null],enabled:[names[0],names[1]]});
 check(isPublic(r));
 r=await run({noKeys:true,enabled:[names[0]]});check(isPublic(r));
 r=await run({missing:true});check(r.posts.length===0 && r.panel.content.includes('请先安装'));
 r=await run({postFail:true,enabled:[names[0]],usage:[1000000,0,500000,700000]});check(r.panel.content.includes('未核验'));
 r=await run({dataBad:true});check(isPublic(r));
 r=await run({empty:true});check(isPublic(r));
 r=await run({enabled:[names[0],names[1]]});check(r.active.length===1);
 r=await run({auto:true});check(r.posts.length===0);
 r=await run({argument:'reserve=10000000'});check(r.panel.content.includes('预留额度必须'));
 const actual=vm.runInContext('hmacSha1Base64("test&", "GET&%2F&hello")',r.ctx);
 check(actual===crypto.createHmac('sha1','test&').update('GET&%2F&hello').digest('base64'));
 check(vm.runInContext('sumStatistics([{HttpCount:2,HttpsCount:3,DohTotalCount:3}]).https',r.ctx)===3);
 // China billing boundary: UTC Sep 30 16:01 is China Oct 1.
 vm.runInContext('Date.now = () => 1790784060000',r.ctx);
 const range=vm.runInContext('monthRange()',r.ctx);
 check(range.startDate==='2026-10-01' && range.endDate==='2026-10-01');
 r=await run({apiCode:'SignatureDoesNotMatch',httpStatus:403});
 check(r.panel.content.includes('签名不匹配') && !r.panel.content.includes('DO_NOT_SHOW_SECRET'));
 check(isPublic(r));
 r=await run({apiCode:'Forbidden.RAM',httpStatus:403});check(r.panel.content.includes('RAM权限不足'));
 r=await run({apiCode:'InvalidAccessKeyId.NotFound',httpStatus:404});check(r.panel.content.includes('AccessKey ID不存在'));
 r=await run({apiCode:'UnrecognizedCodeContainsSecret',httpStatus:400});
 check(r.panel.content.includes('未知错误类型') && !r.panel.content.includes('UnrecognizedCodeContainsSecret'));
 r=await run({apiCode:'SignatureDoesNotMatch'});check(r.panel.content.includes('签名不匹配'));
 r=await run({usage:[null,null,null,null]});
 check(r.panel.content.includes('网络请求失败') && !r.panel.content.includes('private URL'));
 r=await run({empty:true});check(r.panel.content.includes('统计数据为空'));
 r=await run({dataBad:true});check(r.panel.content.includes('统计字段缺失'));
 const controller=fs.readFileSync(__dirname+'/AliDNS-Auto-Switch.sgmodule','utf8');
 for (const slot of ids) {
   const module=fs.readFileSync(__dirname+`/AliDNS-DNS-Slot${slot}.sgmodule`,'utf8');
   check(module.includes(`#!name=AliDNS DNS Slot ${slot}`));
   check(module.includes('#!arguments=dns:""'));
   check(module.includes('encrypted-dns-server = {{{dns}}}'));
   check(module.replace('{{{dns}}}', 'h3://test.example/dns-query').includes('encrypted-dns-server = h3://test.example/dns-query'));
   check(controller.includes(`id${slot}:"",secret${slot}:""`));
 }
 console.log(`${count} checks passed`);
})().catch(e=>{console.error(e);process.exitCode=1});
