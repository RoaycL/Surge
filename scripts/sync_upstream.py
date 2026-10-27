#!/usr/bin/env python3
"""Strict QX-to-Surge converter. Fetch/validate everything before writing outputs."""
import argparse
import hashlib
import json
import re
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
RAW = 'https://raw.githubusercontent.com/RoaycL/Surge/main/'
SOURCES = {
    'Pinduoduo': 'https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/Pinduoduo.snippet',
    'hlwxx_remove_ads': 'https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/hlwxx_remove_ads.snippet',
    'Weibo': 'https://raw.githubusercontent.com/fmz200/wool_scripts/main/QuantumultX/rewrite/weibo.snippet',
    'TxvideoAD': 'https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/TxvideoAD.snippet',
}
SCRIPT_ALLOWLIST = {
    'https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/hlwxx_remove_ads.js',
    'https://raw.githubusercontent.com/Keywos/rule/master/script/weibo_us/js/index.js',
    'https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/template/req_replace_body.js',
    'https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/weibo/weibo_ads.js',
    'https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/weibo/weibo_main.js',
    'https://raw.githubusercontent.com/zmqcherish/proxy-script/main/weibo_launch.js',
    'https://raw.githubusercontent.com/zmqcherish/proxy-script/main/weibo_main.js',
    'https://github.com/fmz200/wool_scripts/raw/main/Scripts/weibo/weibo_vip.js',
}
TX_SCRIPT = 'https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/Txvideoad.js'
ECHO_DICT = 'https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/template/reject-dict.json'


def sha(text):
    return hashlib.sha256(text.encode()).hexdigest()


class Fetcher:
    def __init__(self, offline=False):
        self.offline = offline
        self.cache = ROOT / 'work-cache'
        self.cache.mkdir(exist_ok=True)
        self.manifest = {}

    def get(self, url):
        path = self.cache / (hashlib.sha256(url.encode()).hexdigest() + '.txt')
        if self.offline:
            text = path.read_text()
        else:
            for attempt in range(3):
                try:
                    request = Request(url, headers={'User-Agent': 'RoaycL-Surge-Upstream-Sync'})
                    with urlopen(request, timeout=30) as response:
                        data = response.read(2_000_001)
                    if len(data) > 2_000_000:
                        raise ValueError('Upstream file exceeds 2 MB: ' + url)
                    text = data.decode('utf-8-sig')
                    if not text.strip():
                        raise ValueError('Empty upstream file: ' + url)
                    path.write_text(text)
                    break
                except Exception:
                    if attempt == 2:
                        raise
                    time.sleep(1 + attempt)
        self.manifest[url] = sha(text)
        return text


def jq_plan(expression):
    """Compile only the supported jq subset; never silently ignore a new filter."""
    if not (expression.startswith("'") and expression.endswith("'")):
        raise ValueError('Expected a quoted jq filter')
    expression = expression[1:-1].strip()
    match = re.fullmatch(r'del\(([^()]+)\)(.*)', expression)
    if not match:
        raise ValueError('Unsupported jq filter: ' + expression)
    paths = [p.strip() for p in match[1].split(',')]
    if not all(re.fullmatch(r'\.[A-Za-z_][\w]*(?:\.[A-Za-z_][\w]*)*', p) for p in paths):
        raise ValueError('Unsupported jq path: ' + expression)
    tail = match[2].strip()
    expected = '| if .result.bottom_tabs then .result.bottom_tabs |= map(select(.link == "index.html" or .link == "chat_list.html" or .link == "personal.html")) else . end'
    if tail and tail != expected:
        raise ValueError('Unsupported jq operation: ' + tail)
    return {'delete': [p[1:].split('.') for p in paths], 'tabs': bool(tail)}


def parse_qx(text):
    rules, routes, hosts, metadata = [], [], [], []
    for num, raw in enumerate(text.splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith('//'):
            continue
        if line.startswith('#!'):
            if re.match(r'#!(?:name|desc|author|icon|homepage)\s*=', line):
                metadata.append(line)
            continue
        if line.startswith('#'):
            continue
        if line.startswith('hostname'):
            hosts.extend(h.strip() for h in line.split('=', 1)[1].split(',') if h.strip())
            continue
        match = re.fullmatch(r'(host|host-suffix|ip-cidr),\s*([^,]+),\s*reject', line, re.I)
        if match:
            kind = {'host': 'DOMAIN', 'host-suffix': 'DOMAIN-SUFFIX', 'ip-cidr': 'IP-CIDR'}[match[1].lower()]
            rules.append(f'{kind},{match[2].strip()},REJECT' + (',no-resolve' if kind == 'IP-CIDR' else ''))
            continue
        match = re.fullmatch(r'(\S+)\s+(?:(\S+)\s+url-and-header|url)\s+(\S+)(?:\s+(.*))?', line)
        if not match:
            raise ValueError(f'Unsupported QX syntax on line {num}: {line}')
        pattern, ua, action, arg = match.groups()
        # QX escapes slash as if in a JS literal; normalize for RegExp(string).
        pattern = pattern.replace(r'\/', '/')
        if ',' in pattern or '\n' in pattern:
            raise ValueError('Pattern needs Surge escaping review')
        route = {'pattern': pattern, 'ua': ua or '', 'action': action, 'arg': arg or ''}
        if action == 'jsonjq-response-body':
            route['plan'] = jq_plan(arg or '')
        elif action in ('script-request-body', 'script-response-body'):
            if arg not in SCRIPT_ALLOWLIST and arg != TX_SCRIPT:
                raise ValueError('New script dependency needs compatibility review: ' + str(arg))
        elif action == 'request-header':
            if arg != r'(\r\n)Accept-Encoding:.+(\r\n) request-header $1Accept-Encoding: identity$2':
                raise ValueError('Unsupported header rewrite: ' + str(arg))
        elif action == 'echo-response':
            if arg != 'text/html echo-response ' + ECHO_DICT:
                raise ValueError('Unsupported echo response: ' + str(arg))
        elif action not in ('reject', 'reject-dict'):
            raise ValueError('Unsupported QX action: ' + action)
        routes.append(route)
    if not routes or not hosts:
        raise ValueError('Upstream has no routes/hostname; review before publishing')
    return metadata, rules, routes, list(dict.fromkeys(hosts))


RUNTIME = r'''
function applyPlan(body, plan) {
  const obj = JSON.parse(body);
  for (const path of plan.delete) {
    let node = obj;
    for (let i = 0; i < path.length - 1; i++) node = node == null ? null : node[path[i]];
    if (node !== null && typeof node === 'object') delete node[path[path.length - 1]];
  }
  if (plan.tabs && obj.result && obj.result.bottom_tabs) {
    if (!Array.isArray(obj.result.bottom_tabs)) throw new Error('bottom_tabs is not an array');
    obj.result.bottom_tabs = obj.result.bottom_tabs.filter(x => x && ['index.html', 'chat_list.html', 'personal.html'].includes(x.link));
  }
  return JSON.stringify(obj);
}
const responsePhase = typeof $response !== 'undefined' && $response !== null;
const headers = $request.headers || {};
const uaKey = Object.keys(headers).find(k => k.toLowerCase() === 'user-agent');
const userAgent = headers[uaKey] || '';
let finished = false;
function finish(value) { if (!finished) { finished = true; $done(value || {}); } }
try {
  let newHeaders;
  for (const route of routes) {
    const isResponse = route.action === 'jsonjq-response-body' || route.action === 'script-response-body';
    if (responsePhase !== isResponse) continue;
    if (!new RegExp(route.pattern).test($request.url) || (route.ua && !new RegExp(route.ua).test(userAgent))) continue;
    if (route.action === 'request-header') {
      newHeaders = Object.assign({}, headers);
      for (const key of Object.keys(newHeaders)) if (key.toLowerCase() === 'accept-encoding') delete newHeaders[key];
      newHeaders['Accept-Encoding'] = 'identity';
      continue;
    }
    if (route.action === 'reject' || route.action === 'reject-dict' || route.action === 'echo-response') {
      const dict = route.action !== 'reject';
      finish({response: {status: dict ? 200 : 404, headers: {'Content-Type': route.action === 'echo-response' ? 'text/html' : dict ? 'application/json' : 'text/plain'}, body: dict ? '{}' : ''}});
    } else if (route.action === 'jsonjq-response-body') {
      finish({body: applyPlan($response.body, route.plan)});
    } else {
      handlers[route.handler]($request, responsePhase ? $response : undefined, finish);
    }
    return;
  }
  finish(newHeaders ? {headers: newHeaders} : {});
} catch (error) {
  console.log('upstream-adapter: ' + String(error));
  finish({});
}
})();
'''


def convert(name, text, fetch):
    metadata, rules, routes, hosts = parse_qx(text)
    handlers = []
    indexes = {}
    if any(route['action'] == 'echo-response' for route in routes):
        if json.loads(fetch.get(ECHO_DICT)) != {}:
            raise ValueError('Echo response template changed; review semantics')
    for route in routes:
        if route['action'].startswith('script-'):
            url = route['arg']
            if url not in indexes:
                source = fetch.get(url)
                # These vendored scripts support Surge natively. New QX-only APIs require review.
                if re.search(r'\$(?:request|response)\.bodyBytes', source):
                    raise ValueError('New binary script requires an explicit adapter: ' + url)
                indexes[url] = len(handlers)
                handlers.append('// Source: ' + url + '\nfunction($request, $response, $done) {\n' + source + '\n}')
            route['handler'] = indexes[url]
    bundle = '// Generated by scripts/sync_upstream.py; edit the converter, not this file.\n'
    bundle += '// Upstream: ' + SOURCES[name] + '\n(function() {\nconst handlers = [\n' + ',\n'.join(handlers) + '\n];\n'
    bundle += 'const routes = ' + json.dumps(routes, ensure_ascii=False) + ';\n' + RUNTIME
    module = '\n'.join(metadata) + '\n# Converted from: ' + SOURCES[name] + '\n# Generated automatically; upstream authors retain attribution.\n'
    if rules:
        module += '\n[Rule]\n' + '\n'.join(rules) + '\n'
    module += '\n[Script]\n'
    for phase in ('request', 'response'):
        group = [r for r in routes if (r['action'] in ('script-response-body', 'jsonjq-response-body')) == (phase == 'response')]
        if not group:
            continue
        patterns = list(dict.fromkeys(r['pattern'] for r in group))
        pattern = '|'.join('(?:' + p + ')' for p in patterns)
        needs_body = phase == 'response' or any(r['action'] == 'script-request-body' for r in group)
        module += f'{name}-{phase} = type=http-{phase}, pattern={pattern}, requires-body={str(needs_body).lower()}, max-size=2097152, script-path={RAW}JS/{name}.surge.js, timeout=15\n'
    module += '\n[MITM]\nhostname = %APPEND% ' + ', '.join(hosts) + '\n'
    return {f'Module/{name}.sgmodule': module, f'JS/{name}.surge.js': bundle}


def convert_tx(text, fetch):
    metadata, rules, routes, hosts = parse_qx(text)
    if len(routes) != 5 or any(r['arg'] != TX_SCRIPT for r in routes):
        raise ValueError('Tencent Video routing changed; review binary/text modes')
    source = fetch.get(TX_SCRIPT)
    if source.count('$request.bodyBytes') != 1 or source.count('$response.bodyBytes') != 1 or source.count('{ bodyBytes: toBuf(r) }') != 2:
        raise ValueError('Tencent Video script API changed; review adapter')
    source = source.replace('$request.bodyBytes', '$request.body').replace('$response.bodyBytes', '$response.body').replace('{ bodyBytes: toBuf(r) }', '{ body: r }')
    module = '\n'.join(metadata) + '\n# Converted from: ' + SOURCES['TxvideoAD'] + '\n\n[Rule]\n' + '\n'.join(rules) + '\n\n[Script]\n'
    for i, route in enumerate(routes):
        phase = 'request' if route['action'] == 'script-request-body' else 'response'
        binary = 'rdelivery' not in route['pattern']
        module += f'TxvideoAD-{i} = type=http-{phase}, pattern={route["pattern"]}, requires-body=true, binary-body-mode={str(binary).lower()}, max-size=1048576, script-path={RAW}JS/Txvideoad.surge.js, timeout=10\n'
    module += '\n[MITM]\nhostname = %APPEND% ' + ', '.join(hosts) + '\n'
    return {'Module/TxvideoAD.sgmodule': module, 'JS/Txvideoad.surge.js': '// Original: TG@ZenMoFiShi; source: ' + TX_SCRIPT + '\n// Surge body API adaptation.\n' + source}


def convert_fanqie(text):
    out = []
    section = ''
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith('#'):
            if line.startswith(('#!loon_version', '#!openUrl')):
                continue
            out.append(line.replace('#!tag=', '#!category='))
        elif line == '[Rule]':
            section = line
            out.append(line)
        elif section == '[Rule]' and re.fullmatch(r'DOMAIN,[A-Za-z0-9_.-]+,REJECT', line):
            out.append(line)
        else:
            raise ValueError('Unsupported FanQie syntax: ' + line)
    if not any(s.startswith('DOMAIN,') for s in out):
        raise ValueError('FanQie has no rules')
    return '\n'.join(out).rstrip() + '\n'


def validate(outputs):
    with tempfile.TemporaryDirectory() as temp:
        for path, content in outputs.items():
            if path.endswith('.js'):
                p = Path(temp) / Path(path).name
                p.write_text(content)
                subprocess.run(['node', '--check', str(p)], check=True, capture_output=True)
        # Validate URL regexes with JavaScript, which is also used by the dispatcher.
        patterns = []
        for path, content in outputs.items():
            if path.endswith('.sgmodule'):
                patterns.extend(re.findall(r'pattern=(.*?), requires-body=', content))
        subprocess.run(['node', '-e', 'JSON.parse(require("fs").readFileSync(0,"utf8")).forEach(p=>new RegExp(p))'], input=json.dumps(patterns), text=True, check=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--offline', action='store_true', help='Use an explicitly prefilled local cache; never fall back to it on network failure')
    args = parser.parse_args()
    fetch = Fetcher(args.offline)
    outputs = {}
    for name, url in SOURCES.items():
        text = fetch.get(url)
        outputs['upstreams/' + name + '.snippet'] = text
        outputs.update(convert_tx(text, fetch) if name == 'TxvideoAD' else convert(name, text, fetch))
    # Until a canonical upstream URL is supplied, keep the user's pasted FanQie snapshot.
    snapshot = (ROOT / 'upstreams/FanQieNovel.plugin').read_text()
    outputs['Module/FanQieNovel.sgmodule'] = convert_fanqie(snapshot)
    outputs['upstreams/lock.json'] = json.dumps({'sha256': fetch.manifest, 'static_sources': ['upstreams/FanQieNovel.plugin']}, indent=2, ensure_ascii=False) + '\n'
    validate(outputs)
    changed = []
    for name, content in outputs.items():
        path = ROOT / name
        if not path.exists() or path.read_text() != content:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
            changed.append(name)
    print(json.dumps({'changed': changed, 'sources_checked': len(fetch.manifest)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
