// Behavior tests for the VMISS and AliDNS panel scripts (JS/Panel).
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');

async function run(file, {argument = '', trigger, request, response, http = () => ({status: 200, headers: {}, body: ''}), store = {}} = {}) {
  const notifications = [], requests = [];
  let result, calls = 0;
  const context = {
    $argument: argument, console: {log() {}},
    $done: value => { calls++; result = value; },
    $persistentStore: {read: key => store[key] ?? null, write: (value, key) => { store[key] = value; return true; }},
    $notification: {post: (...a) => notifications.push(a)},
    $httpClient: {get: (options, callback) => { requests.push(options); const r = http(options); setImmediate(() => callback(r.error || null, {status: r.status, headers: r.headers || {}}, r.body)); }},
    setTimeout, clearTimeout, URL, Date, Math, JSON, Promise,
  };
  if (trigger) context.$trigger = trigger;
  if (request) context.$request = request;
  if (response) context.$response = response;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, {timeout: 3000});
  for (let i = 0; i < 20 && !calls; i++) await new Promise(r => setImmediate(r));
  assert.equal(calls, 1, file + ' must call $done exactly once');
  return {result, notifications, requests, store};
}

(async () => {
  // ---------------- VMISS ----------------
  const V = 'JS/Panel/vmiss-traffic.js';
  const page = id => `https://app.vmiss.com/clientarea.php?action=productdetails&id=${id}`;
  const browser = {Cookie: 'WHMCSabc=sess1; cf_clearance=cf1', 'User-Agent': 'Safari/1', 'Accept-Language': 'zh-CN'};
  const json = JSON.stringify({trafficUsed: '120.5 GB', trafficTotal: 1000, flow_reset_day: 1, nextduedate: '2027-01-15'});
  const store = {};

  // A page blocked by Cloudflare or failing never becomes the saved credential.
  let r = await run(V, {argument: 'mode=capture&capture=true', store, request: {url: page(7), headers: browser}, response: {status: 403, headers: {'cf-mitigated': 'challenge'}}});
  assert.equal(store.VMISS_Traffic_Headers_v1, undefined);
  r = await run(V, {argument: 'mode=capture&capture=true', store, request: {url: page(7) + '&getJSON', headers: browser}, response: {status: 200, headers: {}}});
  assert.equal(store.VMISS_Traffic_Headers_v1, undefined, 'script-initiated JSON requests are not captures');
  r = await run(V, {argument: 'mode=capture&capture=false', store, request: {url: page(7), headers: browser}, response: {status: 200, headers: {}}});
  assert.equal(store.VMISS_Traffic_Headers_v1, undefined, 'capture can be switched off');

  // First successful page load saves the credential automatically and says so once.
  r = await run(V, {argument: 'mode=capture&capture=true', store, request: {url: page(7), headers: browser}, response: {status: 200, headers: {'Set-Cookie': 'WHMCSabc=sess2; path=/; HttpOnly'}}});
  let saved = JSON.parse(store.VMISS_Traffic_Headers_v1);
  assert.equal(saved.productId, '7');
  assert.equal(saved.headers.Cookie, 'WHMCSabc=sess2; cf_clearance=cf1', 'response Set-Cookie wins over the request cookie');
  assert.equal(saved.headers['User-Agent'], 'Safari/1');
  assert.equal(r.notifications.length, 1);
  // Later successful visits refresh silently.
  r = await run(V, {argument: 'mode=capture&capture=true', store, request: {url: 'https://app.vmiss.com/clientarea.php', headers: {...browser, Cookie: 'WHMCSabc=sess3; cf_clearance=cf2'}}, response: {status: 200, headers: {}}});
  saved = JSON.parse(store.VMISS_Traffic_Headers_v1);
  assert.equal(saved.headers.Cookie, 'WHMCSabc=sess3; cf_clearance=cf2');
  assert.equal(saved.productId, '7', 'product id survives visits to other client-area pages');
  assert.equal(r.notifications.length, 0);

  // Panel success: content, rotated session cookie absorbed, last result cached, policy honoured.
  r = await run(V, {argument: 'mode=panel&notify=true&policy=Fixed%20Node', store,
    http: () => ({status: 200, headers: {'Set-Cookie': 'WHMCSabc=sess4; path=/, other=1; Max-Age=0'}, body: json})});
  assert.match(r.result.title, /^VMISS \| 1,000 GB \| \d\d:\d\d$/);
  assert.match(r.result.content, /已用：12\.0%/);
  assert.match(r.result.content, /到期：2027\.1\.16/, 'due date is shown as official date + 1 day');
  assert.equal(r.requests[0].policy, 'Fixed Node');
  assert.equal(r.requests[0].headers.Cookie, 'WHMCSabc=sess3; cf_clearance=cf2');
  assert.equal(JSON.parse(store.VMISS_Traffic_Headers_v1).headers.Cookie, 'WHMCSabc=sess4; cf_clearance=cf2');
  assert.ok(JSON.parse(store.VMISS_Traffic_State_v1).last);

  // +1 day rolls over month and year ends (separate store: keeps the cache test below intact).
  const dateStore = {...store};
  r = await run(V, {argument: 'mode=panel', store: dateStore, http: () => ({status: 200, headers: {}, body: JSON.stringify({trafficUsed: '1', trafficTotal: 10, nextduedate: '2026-12-31'})})});
  assert.match(r.result.content, /到期：2027\.1\.1/);
  r = await run(V, {argument: 'mode=panel', store: dateStore, http: () => ({status: 200, headers: {}, body: JSON.stringify({trafficUsed: '1', trafficTotal: 10, nextduedate: '2028-02-28'})})});
  assert.match(r.result.content, /到期：2028\.2\.29/);

  // Cloudflare 403: cached data stays visible, one notification that opens the product page.
  const challenge = () => ({status: 403, headers: {'cf-mitigated': 'challenge'}, body: ''});
  r = await run(V, {argument: 'mode=panel&notify=true&policy=', store, http: challenge});
  assert.match(r.result.content, /已用：12\.0%/);
  assert.match(r.result.content, /Cloudflare 验证已过期.*打开一次 VMISS 产品页即可自动更新凭证/);
  assert.equal(r.notifications.length, 1);
  assert.equal(r.notifications[0][3].url, page(7));
  assert.equal(r.notifications[0][3].action, 'open-url');
  assert.equal(r.requests[0].policy, undefined, 'empty policy follows rules');
  r = await run(V, {argument: 'mode=keepalive&notify=true', store, http: challenge});
  assert.deepEqual(JSON.parse(JSON.stringify(r.result)), {});
  assert.equal(r.notifications.length, 0, 'no repeated notification for the same failure');
  r = await run(V, {argument: 'mode=panel&notify=true', store, http: challenge, trigger: 'auto-interval'});
  assert.equal(r.notifications.length, 0, 'automatic panel refresh does not repeat the notification');
  // A manual tap on the panel refresh button always offers the login link, even with background notifications off.
  for (const notify of ['true', 'false']) {
    r = await run(V, {argument: `mode=panel&notify=${notify}`, store, http: challenge, trigger: 'button'});
    assert.equal(r.notifications.length, 1, 'manual refresh while expired notifies every time');
    assert.equal(r.notifications[0][3].url, page(7));
    assert.match(r.notifications[0][2], /点此前往登录/);
    assert.match(r.result.content, /⚠️/);
  }

  // Opening the page again repairs it automatically and announces the recovery.
  r = await run(V, {argument: 'mode=capture&capture=true', store, request: {url: page(7), headers: {...browser, Cookie: 'WHMCSabc=sess5; cf_clearance=cf3'}}, response: {status: 200, headers: {}}});
  assert.equal(r.notifications.length, 1);
  assert.match(r.notifications[0][1], /自动更新/);
  assert.equal(JSON.parse(store.VMISS_Traffic_State_v1).invalidSince, 0);
  r = await run(V, {argument: 'mode=panel&notify=true', store, http: () => ({status: 200, headers: {}, body: json})});
  assert.doesNotMatch(r.result.content, /⚠️/);

  // Expired WHMCS session (HTML login page instead of JSON) is a credential failure too.
  r = await run(V, {argument: 'mode=panel&notify=true', store, http: () => ({status: 200, headers: {}, body: '<html>login</html>'})});
  assert.match(r.result.content, /登录会话已过期/);
  assert.equal(r.notifications.length, 1);
  // Unresolved Surge placeholders behave like defaults.
  r = await run(V, {argument: 'mode=capture&capture={{{自动更新凭证}}}', store: {}, request: {url: page(9), headers: browser}, response: {status: 200, headers: {}}});
  assert.equal(r.notifications.length, 1);
  // No credential at all.
  r = await run(V, {argument: 'mode=panel', store: {}});
  assert.match(r.result.content, /尚未获取登录凭证/);

  // ---------------- AliDNS ----------------
  const A = 'JS/Panel/alidns-usage.js';
  const accounts = [['6585-159492', 0], ['6802-876521', 60000], ['8864-159491', 839000], ['6585-896541', 392000]];
  const argument = accounts.map(([name], i) => `name${i + 1}=${name}&id${i + 1}=AK${i}&secret${i + 1}=S${i}`).join('&') + '&quota=10000000';
  r = await run(A, {argument, http: o => {
    const i = Number(new URL(o.url).searchParams.get('AccessKeyId').slice(2));
    return {status: 200, headers: {}, body: JSON.stringify({Data: [{HttpCount: accounts[i][1], HttpsCount: 0}]})};
  }});
  const lines = r.result.content.split('\n');
  // Digits become mathematical monospace digits; padding is ordinary spaces.
  // '_' marks one digit of padding (FIGURE SPACE + THIN SPACE).
  const mono = t => t.replace(/\d/g, d => String.fromCodePoint(0x1D7F6 + Number(d))).replace(/_/g, '\u2007\u2009');
  assert.deepEqual(lines, [
    mono('6585-159492  0.00%  余1000.0万'),
    mono('6802-876521  0.60%  余_994.0万'),
    mono('8864-159491  8.39%  余_916.1万'),
    mono('6585-896541  3.92%  余_960.8万'),
  ]);
  assert.equal(new Set(lines.map(l => [...l.replace(/\u2007\u2009/g, '#')].length)).size, 1, 'every column ends at the same digit position');
  assert.doesNotMatch(r.result.content, /[0-9]/, 'no proportional ASCII digits left in aligned rows');
  // Wider percentages and different name lengths are padded the same way.
  r = await run(A, {argument: 'name1=A&id1=K1&secret1=S1&name2=Long-1&id2=K2&secret2=S2', http: o => ({status: 200, headers: {},
    body: JSON.stringify({Data: [{HttpCount: o.url.includes('AccessKeyId=K1') ? 10000000 : 1234567, HttpsCount: 0}]})})});
  assert.deepEqual(r.result.content.split('\n'), [
    mono('A_____  100.00%  余__0.0万'),
    mono('Long-1  _12.35%  余876.5万'),
  ]);
  // A failed account keeps its error text and does not break alignment of the others.
  r = await run(A, {argument: 'name1=A1&id1=K1&secret1=S1&name2=B2&id2=K2&secret2=S2', http: o => o.url.includes('AccessKeyId=K1')
    ? {status: 403, headers: {}, body: '{"Message":"denied"}'} : {status: 200, headers: {}, body: '{"Data":[{"HttpCount":1}]}'}});
  assert.equal(r.result.content, 'A1：查询失败\nHTTP 403: denied\n' + mono('B2  0.00%  余1000.0万'));

  console.log('PASS: VMISS auto credential capture/refresh/notification/cache and AliDNS column alignment');
})().catch(e => { console.error(e); process.exit(1); });
