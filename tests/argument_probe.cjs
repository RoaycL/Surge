// Runtime cross-check of the adapter's $argument style for every script that
// receives user parameters. The original (unwrapped) script runs with exactly
// the value the adapter would hand it, instrumented to record whether it is
// actually consumed:
//   object -> a Proxy over the parameters; the script must read a parameter key
//   json   -> a JSON string; the script must JSON.parse that string
//   query  -> an a=b&c=d string; the script must call a string method on it
// A script that never consumes the value would silently ignore every Surge
// module parameter, which is exactly the failure this test exists to catch.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const manifest = JSON.parse(fs.readFileSync('upstreams/fkikelee/manifest.json', 'utf8'));
const checked = [], failures = [], exempted = [];

// Scripts that read $argument only deep inside one route handler, after decoding
// a real protobuf/JSON body, so the generic fixtures cannot reach that code.
// Each was reviewed by hand; the pattern is the parsing code that proves the style.
// A new script that the probe cannot reach must be reviewed and listed here.
const REVIEWED = {
  'kelee/JavaScript/Bilibili/Bilibili_proto_response_kokoryh.js': ['json', /typeof \$argument=="string"\)try\{Object\.assign\(this\.argument,JSON\.parse\(\$argument\)\)/],
  'kelee/JavaScript/NeteaseCloudMusic/NeteaseCloudMusic_remove_ads.js': ['json', /D=JSON\.parse\(\$argument\)\}catch\{D=\$argument\}/],
  'kelee/JavaScript/Tieba/tieba-proto.js': ['query', /case 'string':\s*const params = Object\.fromEntries\(\$argument\.split\('&'\)/],
};

// Build one URL the script's pattern accepts, so URL-routed scripts reach their
// argument parsing. Falls back to a neutral URL for cron/generic scripts.
function sampleUrl(pattern, pick = 0) {
  if (!pattern) return 'https://example.com/';
  let s = pattern.replace(/^\(\?i\)/, '').replace(/^\^/, '').replace(/\$$/, '').replace(/https\?/g, 'https');
  s = s.replace(/\[\^[^\]]*\][+*]?/g, 'a').replace(/\[([^\]\\]|\\.)[^\]]*\][+*?]?(\{\d+(,\d*)?\})?/g, (m, c) => c.replace(/^\\/, ''));
  for (let i = 0; i < 10 && /\([^()]*\)/.test(s); i++) s = s.replace(/\((?:\?:)?([^()]*)\)([?*+]|\{\d+(,\d*)?\})?/g, (m, body, q) => { if (q === '?' || q === '*') return ''; const alts = body.split('|'); return alts[Math.min(pick, alts.length - 1)]; });
  s = s.replace(/\\d[+*]?/g, '1').replace(/\\w[+*]?/g, 'a').replace(/\.[+*]/g, 'a').replace(/(\\?.)\?/g, '').replace(/\\(.)/g, '$1');
  const url = s.startsWith('http') ? s : 'https://example.com/';
  try { return new RegExp(pattern.replace(/^\(\?i\)/, ''), 'i').test(url) ? url : 'https://example.com/'; } catch (_) { return 'https://example.com/'; }
}

// Same value shapes as scripts/loon_adapter.js.tpl builds for each style.
function argumentFor(style, defaults) {
  const typed = Object.fromEntries(Object.entries(defaults).map(([k, v]) => [k, v === 'true' ? true : v === 'false' ? false : v]));
  if (style === 'json') return JSON.stringify(typed);
  if (style === 'query') return Object.keys(typed).map(k => k + '=' + typed[k]).join('&');
  return typed;
}

// Runs inside the script's realm: record string methods / JSON.parse applied to $argument.
const PRELUDE = `(() => {
  const target = $argument, note = __fkNote;
  const parse = JSON.parse, valueOf = String.prototype.valueOf;
  JSON.parse = function (text, ...rest) { if (text === target) note('JSON.parse'); return parse.call(this, text, ...rest); };
  for (const name of Object.getOwnPropertyNames(String.prototype)) {
    const original = String.prototype[name];
    if (name === 'constructor' || name === 'valueOf' || typeof original !== 'function') continue;
    Object.defineProperty(String.prototype, name, {configurable: true, writable: true, value: function (...a) {
      if (typeof this === 'string' ? this === target : this instanceof String && valueOf.call(this) === target) note('String.' + name);
      return original.apply(this, a);
    }});
  }
})();`;

async function probe(source, style, defaults, url, binary) {
  const seen = new Set();
  const note = name => seen.add(name);
  let arg = argumentFor(style, defaults);
  if (style === 'object') {
    arg = new Proxy(arg, {
      get(target, prop) { if (typeof prop !== 'symbol') note(prop); return target[prop]; },
      has(target, prop) { note(String(prop)); return prop in target; },
      ownKeys(target) { note('<keys>'); return Reflect.ownKeys(target); },
    });
  }
  const noop = () => {};
  const http = {};
  for (const m of ['get', 'post', 'put', 'delete', 'head', 'patch']) http[m] = noop;
  const context = vm.createContext({
    $argument: arg, __fkNote: note, $done: noop, console: {log: noop, error: noop, warn: noop, info: noop, debug: noop},
    $request: {url, method: 'GET', headers: {}, body: binary ? new Uint8Array(0) : ''},
    $response: {status: 200, statusCode: 200, headers: {}, body: binary ? new Uint8Array(5) : '{}'},
    $environment: {'surge-version': '6.0', 'surge-build': '3000', language: 'zh-Hans'},
    $persistentStore: {read: () => null, write: () => true}, $notification: {post: noop}, $httpClient: http,
    $script: {name: 'probe', startTime: Date.now(), type: 'http-response'}, $utils: {},
    setTimeout: noop, clearTimeout: noop, setInterval: noop, clearInterval: noop,
    Uint8Array, TextEncoder, TextDecoder, URL, URLSearchParams,
  });
  if (style !== 'object') vm.runInContext(PRELUDE, context);
  try { vm.runInContext(source, context, {timeout: 3000}); } catch (_) { /* minimal fixtures; only $argument use matters */ }
  for (let i = 0; i < 20; i++) await new Promise(r => setImmediate(r));  // async bundles read $argument later
  return seen;
}

// Script promises may reject on the minimal fixtures; only $argument use matters.
process.on('unhandledRejection', () => {});
(async () => {
  for (const m of manifest.modules) {
    const text = fs.readFileSync(m.module, 'utf8');
    for (const line of text.split('\n')) {
      const path = line.match(/script-path=\S+?\/(JS\/FKIKelee\/Adapters\/\S+?),/);
      const argument = line.match(/argument="([^"]*)"/);
      if (!path || !argument) continue;
      const keys = argument[1].split('&').map(p => p.split('=')[0]).filter(k => !k.startsWith('__'));
      if (!keys.length) continue;
      const style = JSON.parse(fs.readFileSync(path[1], 'utf8').match(/const fkStyle=("\w+")/)[1]);
      const source = fs.readFileSync(path[1].replace('/Adapters/', '/Resources/'), 'utf8');
      const defaults = Object.fromEntries(keys.map(k => [k, String(m.parameters[k] ?? m.parameters[k.replace(/_/g, '.')] ?? '')]));
      const pattern = (line.match(/pattern="((?:[^"\\]|\\.)*)"/) || [])[1];
      // Routers often read parameters only on some paths: try several matching URLs.
      const urls = [...new Set(Array.from({length: 12}, (_, i) => sampleUrl(pattern && pattern.replace(/\\"/g, '"'), i)))];
      const seen = new Set();
      for (const url of urls) {
        for (const s of await probe(source, style, defaults, url, line.includes('binary-body-mode=true'))) seen.add(s);
      }
      const where = `${m.id} ${path[1]} (${style})`;
      const ok = style === 'object' ? keys.some(k => seen.has(k)) || seen.has('<keys>')
        : style === 'json' ? seen.has('JSON.parse')
        // A query string handed to JSON.parse means the script really expects JSON.
        : [...seen].some(s => s.startsWith('String.')) && !seen.has('JSON.parse');
      const reviewed = REVIEWED[path[1].split('/Adapters/')[1]];
      if (!ok && reviewed) {
        if (reviewed[0] !== style || !reviewed[1].test(source)) failures.push(where + ': reviewed exemption no longer matches the script; review again');
        exempted.push(m.id);
      } else if (!ok) failures.push(where + ': the script never consumed the $argument value the adapter passes');
      checked.push(m.id + ':' + style);
    }
  }
  assert.deepEqual(failures, []);
  assert.ok(checked.length >= 10, 'expected the parameterised scripts to be probed');
  console.log(`PASS: $argument style checked for ${checked.length} parameterised script entries (${checked.length - exempted.length} at runtime, ${exempted.length} by reviewed exemption)`);
})().catch(e => { console.error(e.message); process.exit(1); });
