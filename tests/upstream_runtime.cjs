const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

function run(module, url, {ua = '', body, requestBody} = {}) {
  let result, calls = 0;
  const context = {
    $request: {url, headers: {'User-Agent': ua, 'Accept-Encoding': 'gzip'}, body: requestBody},
    $done: value => { calls++; result = value; },
    $environment: {'surge-version': 'test'},
    $persistentStore: {read: () => null, write: () => true},
    console: {log() {}},
    setTimeout, clearTimeout,
  };
  if (body !== undefined) context.$response = {body};
  vm.runInNewContext(fs.readFileSync(`JS/${module}.surge.js`, 'utf8'), context, {timeout: 2000});
  assert.equal(calls, 1, `${module}: must call $done once`);
  return JSON.parse(JSON.stringify(result));
}

// Exercise the generated module's URL routing and actual reviewed upstream script.
function runPdd(url, body) {
  const module = fs.readFileSync('Module/AdBlock/Pinduoduo.sgmodule', 'utf8');
  const pattern = module.match(/pattern=(.*?), requires-body=true/);
  assert.ok(pattern && new RegExp(pattern[1]).test(url), 'Expected a response script for ' + url);
  return run('Pinduoduo', url, {body});
}
const tabs = [{link: 'index.html?x=1'}, {link: 'ad.html'}, {link: 'chat_list.html#chat'}, {link: 'personal.html'}];
let r, value;
for (const path of ['/api/alexa/homepage/hub?x=1', '/api/alexa/homepage/hub/refresh?x=1']) {
  r = runPdd('https://api.pinduoduo.com' + path, JSON.stringify({result: {
    bottom_tabs: tabs, buffer_bottom_tabs: tabs, keep: {nested: [1, 2]},
  }, keep: 9}));
  value = JSON.parse(r.body);
  assert.equal(value.keep, 9);
  assert.deepEqual(value.result.keep, {nested: [1, 2]});
  for (const key of ['bottom_tabs', 'buffer_bottom_tabs']) {
    assert.deepEqual(value.result[key].map(x => x.link), ['index.html?x=1', 'chat_list.html#chat', 'personal.html']);
  }
}
for (const path of ['/api/aquarius/hungary/global/homepage', '/api/flow/hungary/window/global/popup']) {
  r = runPdd('https://api.pinduoduo.com' + path, '{"list":[{"ad":true}],"keep":2}');
  assert.deepEqual(JSON.parse(r.body), {list: [], keep: 2});
}
const gather = 'https://api.pinduoduo.com/api/growth/nagato/app/index/gather';
r = runPdd(gather, '{"newer_index_banner":{"ad":1},"push_banner":{"valid_data":true},"keep":3}');
assert.deepEqual(JSON.parse(r.body), {newer_index_banner: {valid_data: false}, push_banner: {valid_data: false}, keep: 3});
for (const body of ['invalid-json', '{"keep":1}', '{"push_banner":{"valid_data":false},"keep":2}']) {
  assert.equal(runPdd(gather, body).body, body, 'Malformed or unchanged responses pass through');
}
const onlyAds = '{"result":{"bottom_tabs":[{"link":"ad.html"}]}}';
assert.equal(runPdd('https://api.pinduoduo.com/api/alexa/homepage/hub?x=1', onlyAds).body, onlyAds, 'Never empty the navigation when no supported tabs remain');
assert.deepEqual(run('Pinduoduo', 'https://api.pinduoduo.com/unrelated', {body: '{"list":[1]}'}), {});

// UA-specific short circuits must not affect unrelated clients.
const overseas = 'WeiboOverseas/6.3.8';
const domestic = 'Weibo/83823';
const coopen = 'https://weibointl.api.weibo.cn/portal.php?a=get_coopen_ads';
assert.equal(run('Weibo', coopen, {ua: overseas}).response.body, '{}');
assert.deepEqual(run('Weibo', coopen, {ua: 'Safari'}), {});
assert.equal(run('Weibo', 'https://api.weibo.cn/2/push/info?x=1', {ua: domestic}).response.status, 200);
assert.deepEqual(run('Weibo', 'https://api.weibo.cn/2/push/info?x=1', {ua: 'Safari'}), {});
r = run('Weibo', 'https://weibointl.api.weibo.cn/portal.php?a=trends&x=1', {ua: overseas, body: '{"data":{"banner":[1],"keep":2}}'});
assert.deepEqual(JSON.parse(r.body), {data: {keep: 2}});
r = run('Weibo', 'https://sdkapp.uve.weibo.com/interface/sdk/sdkad.php', {ua: domestic, body: '{"ads":[1],"show_push_splash_ad":true}OK'});
assert.deepEqual(JSON.parse(r.body.slice(0, -2)).ads, []);
r = run('Weibo', 'https://sdkapp.uve.weibo.com/interface/sdk/sdkad.php', {ua: overseas, body: '{"ads":[1],"show_push_splash_ad":true}OK'});
assert.equal(JSON.parse(r.body.slice(0, -2)).show_push_splash_ad, false);
r = run('Weibo', 'https://new.vip.weibo.cn/aj/appicon/list', {ua: domestic, body: '{"data":{"list":[{"cardType":"1","tag":"x"}]}}'});
assert.deepEqual(JSON.parse(r.body).data.list, [{cardType: '2', tag: ''}]);
r = run('Weibo', 'https://api.weibo.cn/2/statuses/repost_timeline', {ua: domestic, body: '{"reposts":[{"id":1,"is_ad":1},{"id":2}],"hot_reposts":[]}'});
assert.deepEqual(JSON.parse(r.body).reposts, [{id: 2}]);

// Header rewrite remains narrowly scoped; static/api paths are excluded.
r = run('hlwxx_remove_ads', 'https://hlwxx.com/article/123');
assert.equal(r.headers['Accept-Encoding'], 'identity');
assert.deepEqual(run('hlwxx_remove_ads', 'https://hlwxx.com/api/test'), {});
assert.equal(run('hlwxx_remove_ads', 'https://97baoliao.com/storage/static/popup-feed.json').response.body, '{}');
assert.equal(run('hlwxx_remove_ads', 'https://stats.kwvprfcr.xyz/a').response.status, 404);
r = run('hlwxx_remove_ads', 'https://hlwxx.com/article/123', {body: '<html><head></head><body><div class="bottom-ads">advert</div><p>article</p></body></html>'});
assert.match(r.body, /<p>article<\/p>/);
assert.doesNotMatch(r.body, /<div class="bottom-ads">advert/);
assert.deepEqual(run('hlwxx_remove_ads', 'https://hlwxx.com/article/123', {body: '{"keep":1}'}), {});

// Tencent binary API adapter: both known splash calls change, unrelated calls pass through.
for (const call of ['GetSplashPreload', 'GetSplashRealtimePoll', 'GetUnrelatedData']) {
  const name = '/trpc.business_splash.ad_ssp_splash.splashService/' + call;
  const header = Buffer.concat([Buffer.from([58, Buffer.byteLength(name)]), Buffer.from(name)]);
  const frame = Buffer.alloc(16 + header.length);
  frame[0] = 9; frame[1] = 48;
  frame.writeUInt32BE(frame.length, 4);
  frame.writeUInt16BE(header.length, 8);
  header.copy(frame, 16);
  r = run('Txvideoad', 'https://i.video.qq.com/', {requestBody: new Uint8Array(frame)});
  if (call === 'GetUnrelatedData') assert.deepEqual(r, {});
  else {
    const bytes = Buffer.from(Object.values(r.body));
    assert.equal(bytes.length, frame.length);
    assert.notDeepEqual(bytes, frame);
  }
}
assert.equal(run('Txvideoad', 'https://rdelivery.qq.com/v1/sdkconfig/get', {body: '{"tab_gray":true}'}).body, '{"tab_gray":false}');
console.log('PASS: PDD script routing/tabs/popups/banners/pass-through, UA routing, Weibo main/splash/scripts, HLW HTML/header/rejects, Tencent binary splash adapter.');
