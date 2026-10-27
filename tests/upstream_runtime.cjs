const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');

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

// Run the actual filters emitted into Surge's native Body Rewrite section with jq.
function runPdd(url, {body}) {
  const lines = fs.readFileSync('Module/Pinduoduo.sgmodule', 'utf8').split('\n');
  const filters = lines.filter(line => line.startsWith('http-response-jq '));
  const found = filters.map(line => line.match(/^http-response-jq (\S+) '(.*)'$/)).filter(Boolean).find(m => new RegExp(m[1]).test(url));
  assert.ok(found, 'Expected a native jq rule for ' + url);
  return {body: execFileSync('jq', ['-c', found[2]], {input: body, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']}).trim()};
}
let r = runPdd('https://api.pinduoduo.com/api/alexa/homepage/hub', {
  body: JSON.stringify({result: {icon_set: [1], search_bar_hot_query: 'ad', dy_module: {irregular_banner_dy: 1, recommend_fresh_info: 2, keep: 3}, bottom_tabs: [{link: 'index.html'}, {link: 'ad.html'}, {link: 'chat_list.html'}, {link: 'personal.html'}]}, keep: 9}),
});
let value = JSON.parse(r.body);
assert.equal(value.keep, 9);
assert.equal(value.result.dy_module.keep, 3);
assert.equal('icon_set' in value.result, false);
assert.deepEqual(value.result.bottom_tabs.map(x => x.link), ['index.html', 'chat_list.html', 'personal.html']);
for (const [url, body, expected] of [
  ['/search', {expansion: 1, goods: [1]}, {goods: [1]}],
  ['/api/philo/personal/hub', {monthly_card_entrance: 1, personal_center_style_v2_vo: 2, icon_set: {icons: [1], top_personal_icons: [2], keep: 3}}, {icon_set: {keep: 3}}],
  ['/api/oak/integration/render', {bottom_section_list: [1], ui: {bottom_section: 1, live_section: {float_info: 2, keep: 3}}}, {ui: {live_section: {keep: 3}}}],
  ['/api/caterham/v3/query/order_detail_group', {data: {goods_list: [1], keep: 2}}, {data: {keep: 2}}],
]) {
  r = runPdd('https://api.pinduoduo.com' + url, {body: JSON.stringify(body)});
  assert.deepEqual(JSON.parse(r.body), expected);
}
assert.throws(() => runPdd('https://api.pinduoduo.com/search', {body: 'invalid-json'}));

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
console.log('PASS: PDD jq parity, UA routing, Weibo main/splash/scripts, HLW HTML/header/rejects, Tencent binary splash adapter.');
