#!/usr/bin/env python3
"""Validate mirrored source integrity, generation, and optional native Surge syntax."""
import argparse
import concurrent.futures
import json
import re
import subprocess
import tempfile
from pathlib import Path
from sync_yfamilys import ROOT, GROUPS, digest, render_module

def native_text(text):
    defaults = {}
    for line in text.splitlines():
        if line.startswith('#!arguments='):
            for part in line.split('=',1)[1].split(','):
                k,_,v = part.partition(':'); defaults[k.strip()] = v.strip().strip('"')
    variables = set(re.findall(r'\{\{\{([^}]+)\}\}\}',text))
    if variables - set(defaults): raise ValueError('undeclared parameters: ' + str(variables-set(defaults)))
    text = re.sub(r'\{\{\{([^}]+)\}\}\}',lambda m: defaults[m[1]],text).replace('%APPEND% ','').replace('%INSERT% ','')
    sections = {}; sec = None
    for line in text.splitlines():
        if re.fullmatch(r'\[[^\]]+\]',line.strip()): sec=line.strip(); sections.setdefault(sec,[])
        elif sec: sections[sec].append(line)
    sections.setdefault('[Rule]',[]).append('FINAL,DIRECT')
    return '\n'.join(k+'\n'+'\n'.join(v) for k,v in sections.items())

def main():
    p=argparse.ArgumentParser();p.add_argument('--surge-cli');a=p.parse_args()
    manifest=json.loads((ROOT/'upstreams/yfamilys/manifest.json').read_text()); ms=manifest['modules']
    index=json.loads((ROOT/'upstreams/yfamilys/index.json').read_text())
    assert {m['url'] for m in ms}=={m['url'] for m in index}
    assert len(ms)==len({m['module'] for m in ms})
    files=[]
    for m in ms:
        source=(ROOT/m['source']).read_text(); output=(ROOT/m['module']).read_text()
        assert digest(source)==m['sha256'],m['url']
        dest,rendered,group,notes=render_module(m,source)
        assert (dest,rendered,group,notes)==(m['module'],output,m['group'],m['notes']),m['url']
        assert re.findall(r'^#!category=(.*)$',output,re.M)==[GROUPS[group]],m['url']
        parsed=native_text(output)
        for line in output.splitlines():
            if line.strip().startswith('#'):continue
            if re.search(r'\btype=http-(request|response)',line):
                assert re.search(r'(?:^|,)\s*pattern\s*=',line),m['url']
        files.append((m['module'],parsed))
    if a.surge_cli:
        with tempfile.TemporaryDirectory() as td:
            def check(item):
                path,text=item;f=Path(td)/Path(path).name;f.write_text(text)
                r=subprocess.run([a.surge_cli,'--check',str(f)],capture_output=True,text=True)
                return None if r.returncode==0 else {'module':path,'error':r.stdout+r.stderr}
            with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:errors=list(filter(None,pool.map(check,files)))
        if errors:print(json.dumps(errors,ensure_ascii=False,indent=2));raise SystemExit(1)
    print(f'PASS: {len(ms)} yfamilys modules, source hashes, parameters, generation' + (', native Surge syntax' if a.surge_cli else ''))

if __name__=='__main__':main()
