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
  // ---------------- VMISS (vnstat API) ----------------
  const V = 'JS/Panel/vmiss-traffic.js';
  const GiB = 1024 ** 3;
  const day = 86400000;
  const api = (used, resetInDays = 3.2) => () => ({status: 200, headers: {}, body: JSON.stringify({used: used * GiB, nextReset: new Date(Date.now() + resetInDays * day).toISOString()})});
  const params = (extra = '') => 'url=http://1.2.3.4:8890/traffic&token=T0k&total=500&reset={{{重置日}}}&tz={{{重置时区}}}&showtz={{{显示时区}}}&title={{{标题}}}&policy={{{请求策略}}}' + extra;
  const store = {};
  // Display text without the alignment machinery: monospace digits -> ASCII, padding removed.
  const plain = t => t.replace(/[\u{1D7F6}-\u{1D7FF}]/gu, d => String(d.codePointAt(0) - 0x1D7F6)).replace(/[\u2007\u2009\u200a]/g, '');
  // Same width model as the script (1/100 em); the "|" columns must start at the same offset.
  const W = {mono: 70.7, '.': 21.48, '%': 80.81, cjk: 94.36, '\u2007': 60.45, '\u2009': 10.25, '\u200a': 5.13};
  const width = t => [...t].reduce((sum, c) => sum + (/[\u{1D7F6}-\u{1D7FF}]/u.test(c) ? W.mono : /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/.test(c) ? W.cjk : W[c] ?? 60.45), 0);
  const aligned = content => {
    const lefts = content.split('\n').filter(l => l.includes('  |  ')).map(l => width(l.split('  |  ')[0]));
    assert.ok(lefts.length === 2 && Math.abs(lefts[0] - lefts[1]) <= 2.6, `separators misaligned: ${lefts}`);
  };

  let r = await run(V, {argument: params(), store, http: api(113.61)});
  assert.match(r.result.title, /^VMISS \| 500 GB \| \d\d:\d\d$/);
  assert.match(plain(r.result.content), /^已用：22\.7%  \|  剩余：386\.39 GB\n重置：4天后  \|  到期：\d{4}\.\d{1,2}\.\d{1,2}$/);
  assert.doesNotMatch(r.result.content, /[0-9]%|[0-9]天/, 'numbers in the aligned column use monospace digits');
  assert.equal(r.requests[0].url, 'http://1.2.3.4:8890/traffic?reset_day=23&utc_offset=-5', 'defaults: 23rd, UTC-5');
  assert.equal(r.requests[0].headers['X-Token'], 'T0k');
  assert.equal(r.requests[0].policy, undefined, 'unset policy follows rules');
  assert.equal(r.notifications.length, 0);

  r = await run(V, {argument: params().replace('{{{标题}}}', 'TRI').replace('{{{请求策略}}}', 'Fixed%20Node'), store: {}, http: api(600)});
  assert.match(r.result.title, /^TRI \| 500 GB/);
  assert.match(plain(r.result.content), /^已用：100\.0%  \|  剩余：0 GB\n重置：4天后  \|  到期：\S+\n⚠️ 流量已经用完了，只能等重置了$/);
  aligned(r.result.content);
  for (const used of [0.5, 49.9, 113.61, 499]) {
    for (const reset of [0.5, 9.2, 29.9]) aligned((await run(V, {argument: params(), store: {}, http: api(used, reset)})).result.content);
  }
  assert.equal(r.requests[0].policy, 'Fixed Node');
  // 到期 is the next reset (from the API) shown as a date in the display zone.
  const dueShown = async (nextReset, extra = '') => (await run(V, {argument: params(extra), store: {}, http: () => ({status: 200, headers: {},
    body: JSON.stringify({used: GiB, periodStart: '2026-10-23T00:00:00-05:00', nextReset})})})).result.content.match(/到期：(\S+)/)[1];
  assert.equal(await dueShown('2026-11-23T00:00:00-05:00'), '2026.11.23', '11-23 00:00 UTC-5 is 11-23 13:00 UTC+8');
  assert.equal(await dueShown('2026-11-23T00:00:00+08:00'), '2026.11.23');
  assert.equal(await dueShown('2026-12-31T20:00:00-05:00'), '2027.1.1');
  assert.equal(await dueShown('2026-11-23T00:00:00-05:00', '&showtz=-5'), '2026.11.23');
  assert.equal(await dueShown('2026-11-23T00:00:00-05:00', '&showtz=-12'), '2026.11.22');
  r = await run(V, {argument: params().replace('{{{重置日}}}', '1').replace('{{{重置时区}}}', '8'), store: {}, http: api(1)});
  assert.equal(r.requests[0].url, 'http://1.2.3.4:8890/traffic?reset_day=1&utc_offset=8', 'reset day and zone come from module parameters');
  r = await run(V, {argument: params(), store: {}, http: () => ({status: 404, headers: {}, body: '{"error":"not found"}'})});
  assert.match(r.result.content, /接口地址错误/);

  // Forecast at this period's average pace, in coarse words only.
  const paced = (usedGiB, elapsedDays, resetInDays) => () => ({status: 200, headers: {}, body: JSON.stringify({used: usedGiB * GiB,
    periodStart: new Date(Date.now() - elapsedDays * day).toISOString(), nextReset: new Date(Date.now() + resetInDays * day).toISOString()})});
  const advice = async (http, extra = '') => (await run(V, {argument: params(extra), store: {}, http})).result.content.split('\n')[2];
  assert.equal(await advice(paced(100, 20, 10)), '照现在的速度，用到重置还绰绰有余', 'projected 150/500 = 30%');
  assert.equal(await advice(paced(240, 20, 10)), '照现在的速度，撑到重置没问题', 'projected 72%');
  assert.equal(await advice(paced(320, 20, 10)), '照现在的速度，差不多刚好够用到重置', 'projected 96%');
  assert.equal(await advice(paced(450, 20, 10)), '⚠️ 照现在的速度，重置前就会用完，省着点用', 'projected 135%');
  assert.equal(await advice(paced(600, 20, 10)), '⚠️ 流量已经用完了，只能等重置了');
  assert.equal(await advice(paced(10, 2 / 24, 29)), undefined, 'no forecast in the first hours of a period');

  // Failures keep the last good numbers visible with the reason.
  r = await run(V, {argument: params(), store, http: () => ({status: 401, headers: {}, body: '{"error":"unauthorized"}'})});
  assert.match(plain(r.result.content), /已用：22\.7%[\s\S]*⚠️ 访问密钥错误/);
  r = await run(V, {argument: params(), store, http: () => ({error: 'timeout'})});
  assert.match(r.result.content, /⚠️ 连接失败：timeout/);
  r = await run(V, {argument: params(), store: {}, http: () => ({status: 500, headers: {}, body: '{"error":"vnstat missing"}'})});
  assert.equal(r.result.content, '更新失败：接口错误：vnstat missing');

  // Missing parameters explain what to fill in, without any request.
  r = await run(V, {argument: 'url={{{接口地址}}}&token={{{访问密钥}}}&total=500'});
  assert.match(r.result.content, /填写接口地址和访问密钥/);
  assert.equal(r.requests.length, 0);
  r = await run(V, {argument: 'url=http://x/traffic&token=t&total={{{总流量}}}'});
  assert.match(r.result.content, /填写总流量/);

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
    mono('A_____  \u2008100%  余__0.0万'),
    mono('Long-1  12.3%  余876.5万'),
  ]);
  // Percentages of 10% or more drop to one decimal, so every row keeps three digits.
  r = await run(A, {argument: 'name1=A1&id1=K1&secret1=S1&name2=B2&id2=K2&secret2=S2&name3=C3&id3=K3&secret3=S3', http: o => ({status: 200, headers: {},
    body: JSON.stringify({Data: [{HttpCount: {K1: 71000, K2: 1080000, K3: 999600}[new URL(o.url).searchParams.get('AccessKeyId')], HttpsCount: 0}]})})});
  assert.deepEqual(r.result.content.split('\n'), [mono('A1  0.71%  余992.9万'), mono('B2  10.8%  余892.0万'), mono('C3  10.0%  余900.0万')]);
  // A failed account keeps its error text and does not break alignment of the others.
  r = await run(A, {argument: 'name1=A1&id1=K1&secret1=S1&name2=B2&id2=K2&secret2=S2', http: o => o.url.includes('AccessKeyId=K1')
    ? {status: 403, headers: {}, body: '{"Message":"denied"}'} : {status: 200, headers: {}, body: '{"Data":[{"HttpCount":1}]}'}});
  assert.equal(r.result.content, 'A1：查询失败\nHTTP 403: denied\n' + mono('B2  0.00%  余1000.0万'));

  console.log('PASS: VMISS vnstat panel and AliDNS column alignment');
})().catch(e => { console.error(e); process.exit(1); });
