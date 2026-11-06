#!/usr/bin/env python3
"""Check the public catalog, path migration, local references and custom assets."""
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import unquote, urlsplit
from build_catalog import render

ROOT = Path(__file__).resolve().parents[1]
RAW = 'https://raw.githubusercontent.com/RoaycL/Surge/main/'

def main():
    migration = json.loads((ROOT / 'docs/path-migration.json').read_text())['paths']
    for old, new in migration.items():
        assert not (ROOT / old).exists(), ('obsolete path exists', old)
        assert (ROOT / new).is_file(), ('migration target missing', new)
    assert (ROOT / 'README.md').read_text() == render(), 'Run scripts/build_catalog.py'
    assert re.findall(r'^## (.+?)（', render(), re.M) == ['DNS', '功能增强', '去广告']
    modules = list((ROOT / 'Module').rglob('*.sgmodule'))
    assert all(p.parent.name in ['DNS', 'Enhancement', 'AdBlock', 'Panel'] for p in modules)
    categories = {'DNS': 'DNS', 'Enhancement': '功能增强', 'AdBlock': '去广告', 'Panel': 'Panel'}
    for p in modules:
        assert re.findall(r'^#!category=(.*)$', p.read_text(), re.M) == [categories[p.parent.name]], ('incorrect category', str(p))
        # Surge only reads metadata (incl. #!arguments) from the leading #! block.
        lines = p.read_text().splitlines()
        end = next((i for i, l in enumerate(lines) if not l.startswith('#!')), len(lines))
        assert not any(l.startswith('#!') for l in lines[end:]), ('#! metadata after header block', str(p))
    own_urls = 0
    for folder in ['Module', 'JS/DNS', 'JS/Panel', 'docs']:
        for p in (ROOT / folder).rglob('*'):
            if not p.is_file() or p.name.startswith('path-migration'): continue
            if p.suffix not in ['.sgmodule', '.js', '.md']: continue
            text = p.read_text()
            for url in re.findall(re.escape(RAW) + r'''[^\s"'<>`,)|]+''', text):
                target = ROOT / unquote(urlsplit(url).path.split('/main/', 1)[1])
                assert target.is_file(), (str(p.relative_to(ROOT)), url)
                own_urls += 1
            if p.suffix == '.md':
                for link in re.findall(r'\]\(([^)]+)\)', text):
                    if ':' in link or link.startswith('#'): continue
                    target = p.parent / unquote(link.split('#', 1)[0])
                    assert target.exists(), (str(p.relative_to(ROOT)), link)
    for p in list((ROOT / 'JS/DNS').glob('*.js')) + list((ROOT / 'JS/Panel').glob('*.js')):
        subprocess.run(['node', '--check', str(p)], check=True, capture_output=True)
    print(f'PASS: {len(modules)} modules, {len(migration)} migrated paths, {own_urls} repository URL references, catalog and local Markdown links')

if __name__ == '__main__':
    main()
