#!/usr/bin/env python3
"""Validate catalog coverage, local dependencies, JS, jq and optional Surge syntax."""
import argparse, concurrent.futures, json, re, subprocess, tempfile
from pathlib import Path
from urllib.parse import unquote
ROOT = Path(__file__).resolve().parents[1]
RAW = 'https://raw.githubusercontent.com/RoaycL/Surge/main/'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--surge-cli')
    a = ap.parse_args()
    manifest = json.loads((ROOT / 'upstreams/fkikelee/manifest.json').read_text())
    modules = manifest['modules']
    assert len(modules) == 275
    assert len({m['id'] for m in modules}) == len(modules)
    assert set((m['source'] for m in modules)) == set(('lpx/' + p.name for p in (ROOT / 'upstreams/fkikelee/lpx').glob('*.lpx')))
    programs = set()
    scripts = set()
    native = []
    errors = []
    for m in modules:
        text = (ROOT / m['module']).read_text()
        assert '[Argument]' not in text
        for url in re.findall('(?:script-path=|RULE-SET,)(https://[^,\\s]+)', text):
            assert url.startswith(RAW), (m['id'], url)
            assert (ROOT / url[len(RAW):]).is_file(), (m['id'], url)
            if url.endswith('.js'):
                scripts.add(url[len(RAW):])
        for l in text.splitlines():
            if l.startswith('http-response-jq '):
                assert l.endswith("'"), (m['id'], l)
                programs.add(l[l.index(" '") + 2:-1])
        defaults = {re.sub('[^A-Za-z0-9_]', '_', k): v for k, v in m['parameters'].items()}
        text = re.sub('\\{\\{\\{(\\w+)\\}\\}\\}', lambda x: str(defaults[x[1]]).lower() if isinstance(defaults[x[1]], bool) else str(defaults[x[1]]), text)
        assert '{{{' not in text, m['id']
        if a.surge_cli:
            text = text.replace('%APPEND% ', '').replace('%INSERT% ', '')
            sections = {}
            sec = None
            for l in text.splitlines():
                if l.startswith('['):
                    sec = l
                    sections[sec] = []
                elif sec:
                    sections[sec].append(l)
            sections.setdefault('[Rule]', []).append('FINAL,DIRECT')
            native.append((m['id'], '\n'.join((k + '\n' + '\n'.join(v) for k, v in sections.items()))))
    for resource in manifest['resources'].values():
        p = ROOT / resource['path']
        assert p.is_file()
        if p.suffix == '.js':
            scripts.add(resource['path'])

    def check_js(p):
        r = subprocess.run(['node', '--check', str(ROOT / p)], capture_output=True, text=True)
        return None if r.returncode == 0 else (p, r.stderr[-1000:])

    def check_jq(p):
        r = subprocess.run(['jq', '-n', 'if false then (' + p + ') else empty end'], capture_output=True, text=True)
        return None if r.returncode == 0 else (p[:140], r.stderr[-500:])
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        errors.extend(filter(None, pool.map(check_js, sorted(scripts))))
        errors.extend(filter(None, pool.map(check_jq, sorted(programs))))
    if a.surge_cli:
        with tempfile.TemporaryDirectory() as td:

            def check_native(item):
                name, text = item
                p = Path(td) / (name + '.conf')
                p.write_text(text)
                r = subprocess.run([a.surge_cli, '--check', str(p)], capture_output=True, text=True)
                return None if r.returncode == 0 else (name, r.stdout + r.stderr)
            with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
                errors.extend(filter(None, pool.map(check_native, native)))
    if errors:
        print(json.dumps(errors, ensure_ascii=False, indent=2))
        raise SystemExit(1)
    print(f'PASS: {len(modules)} modules, {len(scripts)} JS dependencies, {len(programs)} unique jq programs' + (f', {len(native)} native Surge profile checks' if a.surge_cli else ''))
if __name__ == '__main__':
    main()
