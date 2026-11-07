#!/usr/bin/env python3
"""Mirror native Surge modules listed by yfamilys, with explicit syntax repairs."""
import argparse
import concurrent.futures
import hashlib
import json
import re
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
INDEX = 'https://yfamilys.com/surge'
SNAPSHOT = ROOT / 'upstreams/yfamilys'
GROUPS = {'DNS': 'DNS', 'Enhancement': '功能增强', 'AdBlock': '去广告', 'Panel': 'Panel'}

def digest(s): return hashlib.sha256(s.encode()).hexdigest()

def get_text(url):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={'User-Agent': 'RoaycL-Surge-Upstream-Sync'}), timeout=25) as response:
                data = response.read(4_000_001)
            if len(data) > 4_000_000: raise ValueError('source exceeds 4 MB')
            text = data.decode('utf-8-sig').replace('\r\n', '\n').replace('\r', '\n')
            if not text.strip() or text.lstrip().lower().startswith(('<!doctype', '<html')):
                raise ValueError('empty or HTML response')
            return text
        except Exception:
            if attempt == 2: raise
            time.sleep(attempt + 1)

class IndexParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.href = ''; self.label = ''; self.items = {}
    def handle_starttag(self, tag, attrs):
        if tag == 'a': self.href = dict(attrs).get('href', ''); self.label = ''
    def handle_data(self, data):
        if self.href: self.label += data
    def handle_endtag(self, tag):
        if tag != 'a' or not self.href: return
        url = urljoin(INDEX, self.href); p = urlsplit(url)
        if p.scheme == 'https' and p.netloc == 'yfamilys.com' and p.path.endswith(('.module', '.sgmodule')):
            self.items.setdefault(url, {'url': url, 'title': self.label.strip()})
        self.href = ''

def parse_index(text):
    p = IndexParser(); p.feed(text)
    if len(p.items) < 100: raise ValueError('suspiciously incomplete upstream index')
    return list(p.items.values())

def comment_blocks(text):
    lines = []; inside = False
    for line in text.splitlines():
        if line.strip().startswith('/*'): inside = True
        if inside:
            lines.append('# ' + line)
            if '*/' in line: inside = False
        else: lines.append(line)
    if inside: raise ValueError('unterminated comment block')
    return '\n'.join(lines) + '\n'

def render_module(item, source):
    source = source.lstrip('\ufeff').replace('\r\n', '\n').replace('\r', '\n')
    notes = []; text = comment_blocks(source)
    if re.search(r'(?m)^\s*/\*', source): notes.append('将 C 风格说明注释改为 Surge 行注释。')
    meta = dict((k.strip(), v.strip()) for k,v in re.findall(r'^#!\s*([^=\n]+)\s*=\s*(.*)$', text, re.M))
    sections = re.findall(r'^\[([^\]]+)\]\s*$', text, re.M)
    allowed = {'Rule','Script','Panel','MITM','MitM','URL Rewrite','Map Local','Body Rewrite','Header Rewrite','General'}
    if not sections or set(sections) - allowed: raise ValueError('unreviewed module sections: ' + str(sections))
    name = meta.get('name') or item['title'].removeprefix('🎨面板·')
    label = name + ' ' + meta.get('desc','') + ' ' + item['title']
    group = 'Panel' if 'Panel' in sections or item['title'].startswith('🎨') else 'DNS' if re.search(r'(?m)^\s*(?:encrypted-)?dns-server\s*=',text) else 'AdBlock' if re.search(r'广告|去开屏|NoAD|AdBlock',label,re.I) else 'Enhancement'
    stem = Path(urlsplit(item['url']).path).stem
    if not re.fullmatch(r'[A-Za-z0-9_.-]+',stem): raise ValueError('unsafe source filename')
    dest = f'Module/{group}/YFamily-' + ('Panel-' if group == 'Panel' else '') + stem + '.sgmodule'
    if item['url'] == 'https://yfamilys.com/module/fanqie.module':
        from fanqie import CANONICAL, convert_fanqie
        return CANONICAL, convert_fanqie(source), 'AdBlock', ['沿用已有番茄模块地址；切换原生 Surge 上游。']
    body = []; sec = ''; maps = []
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith('#!'): continue
        if re.fullmatch(r'\[[^\]]+\]',stripped):
            sec = stripped.strip('[]'); body.append('[' + ('MITM' if sec == 'MitM' else sec) + ']'); continue
        if not stripped or stripped.startswith(('#',';','//')): body.append(line); continue
        if sec == 'Script':
            mixed = re.fullmatch(r'([^=]+)=type=http-response,pattern=(.+?) url script-(request|response)-(body|header) (https?://\S+)',line)
            if mixed:
                name0, pattern, phase, mode, url = mixed.groups()
                line = name0 + '=type=http-' + phase + ',pattern=' + pattern + ',requires-body=' + ('true' if mode == 'body' else 'false') + ',script-path=' + url
                notes.append('将混入 Script 段的 QX 声明转换为 Surge；外部脚本 API 仍需实测。')
            repaired = re.sub(r'script-path=(\^https?.*?)(?=,\s*[\w-]+=)', r'pattern=\1', line)
            if repaired != line: notes.append('将误写的正则 script-path 修复为 pattern。')
            line = repaired.replace('require-body=', 'requires-body=')
            match = re.search(r'(?<![\w-])pattern\s*=\s*(.*?)(?=,\s*[\w-]+\s*=|$)', line)
            if match and ',' in match[1] and not match[1].startswith(('"',"'")):
                line = line[:match.start(1)] + '"' + match[1].replace('"','\\"') + '"' + line[match.end(1):]
                notes.append('为含逗号的正则添加引号。')
            if stripped == 'mobile.php':
                body.append('# Upstream stray text: mobile.php'); notes.append('注释误入 Script 段的 mobile.php 文本。'); continue
        if sec == 'URL Rewrite':
            if '-302$1$3' in line and line.endswith('-302$1$3'):
                line = line[:-len('-302$1$3')] + ' $1$3 302'; notes.append('修复丢失分隔符的重定向规则。')
            match = re.fullmatch(r'(.+?)\s+\S+\s+reject-(200|dict)', line)
            if match:
                value = '{}' if match[2] == 'dict' else ''
                maps.append(match[1] + ' data-type=text data="' + value + '" status-code=200')
                notes.append('将 reject-200/reject-dict 转为等价 Map Local 响应。'); continue
        if sec == 'Rule':
            line = re.sub(r'^DOMAIN,(?=[^,]*[?*\[])','DOMAIN-WILDCARD,',line)
        if sec in ['MITM','MitM'] and re.match(r'\s*hostname\s*=',line):
            key, value = line.split('=',1); value = value.strip()
            line = 'hostname = ' + (value if value.startswith(('%APPEND%','%INSERT%')) else '%APPEND% ' + value)
        body.append(line)
    if maps: body += ['','[Map Local]'] + maps
    if stem == 'YouTubeAd':
        meta.setdefault('arguments', '脚本执行引擎:jsc,歌词翻译语言:zh-Hans,字幕翻译语言:zh-Hans,屏蔽上传按钮:false,屏蔽选段按钮:false,启用调试模式:false')
        notes.append('补齐源文件缺少的脚本引擎、语言与开关参数默认值。')
    name = name if name.endswith('（yfamilys）') else name + '（yfamilys）'
    meta['name'] = name; meta['category'] = GROUPS[group]
    header = [f'#!{k}={v}' for k,v in meta.items()]
    header += ['# Source: ' + item['url'], '# Generated by scripts/sync_yfamilys.py; original authors retain attribution.']
    notes = list(dict.fromkeys(notes))
    header += ['# NOTE: ' + n for n in notes]
    return dest, '\n'.join(header) + '\n\n' + '\n'.join(l.rstrip() for l in body).strip() + '\n', group, notes

def write(path, text):
    p = ROOT / path; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(text)

def sync(offline=False):
    if offline:
        items = json.loads((SNAPSHOT / 'index.json').read_text())
    else: items = parse_index(get_text(INDEX))
    old_path = SNAPSHOT / 'manifest.json'
    old = json.loads(old_path.read_text()) if old_path.exists() else {'modules':[]}
    results = []
    def load(item):
        rel = 'upstreams/yfamilys/sources/' + urlsplit(item['url']).path.strip('/').replace('/','-')
        if offline: text = (ROOT / rel).read_text()
        else: text = get_text(item['url'])
        dest, rendered, group, notes = render_module(item,text)
        dependencies = list(dict.fromkeys(re.findall(r'script-path\s*=\s*(https?://[^,\s]+)',rendered)))
        return {**item, 'source':rel,'sha256':digest(text),'module':dest,'group':group,'notes':notes,'dependencies':dependencies}, text, rendered
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for i, result in enumerate(pool.map(load,items),1):
            results.append(result)
            if i%50==0: print(f'Prepared {i}/{len(items)} modules',flush=True)
    paths = [m['module'] for m,_,_ in results]
    if len(set(paths)) != len(paths): raise ValueError('module output filename collision')
    # No writes until every source has downloaded and rendered successfully.
    for m, source, rendered in results:
        write(m['source'],source); write(m['module'],rendered)
    managed = set(paths) | {m['source'] for m,_,_ in results}
    for m in old['modules']:
        for path in [m['module'],m['source']]:
            if path not in managed and (ROOT/path).is_file(): (ROOT/path).unlink()
    write('upstreams/yfamilys/index.json',json.dumps(items,ensure_ascii=False,indent=2)+'\n')
    manifest = {'index':INDEX,'modules':[m for m,_,_ in results]}
    write('upstreams/yfamilys/manifest.json',json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    lines = ['# yfamilys 模块目录','','来源：[Surge 页面]('+INDEX+')。按 URL 去重，模块与面板共 '+str(len(items))+' 个；不包含页面的两份完整配置。', '', '模块保留原作者署名，添加来源标识和分类；外部脚本继续使用原链接。原文快照、SHA-256、脚本依赖及适配说明记录在 `upstreams/yfamilys/manifest.json`。', '', '`Sync yfamilys Surge modules` 每 6 小时读取页面并同步全部模块；任一下载或适配失败即停止发布，保留上一次有效版本。也可在 Actions 手动运行。', '', '融合版与同类单 App 模块请择一使用，避免重复的脚本标识和规则覆盖。', '', '语法通过不代表第三方脚本仍可下载，也不代表各 App 功能已实测；账户、订阅、定位等参数须按模块说明自行填写。同一 App 的不同来源模块不要重复启用。', '', '| 名称 | 模块 | 适配说明 |','| --- | --- | --- |']
    for m,_,_ in results:
        esc=lambda s:s.replace('|','\\|').replace('\n',' ')
        lines.append('| ['+esc(m['title'])+']('+m['url']+') | ['+Path(m['module']).name+'](../'+m['module']+') | '+esc('；'.join(m['notes']))+' |')
    write('docs/yfamilys.md','\n'.join(lines)+'\n')
    from build_catalog import main as catalog
    catalog()
    print('PASS: synchronized',len(items),'yfamilys modules')

if __name__ == '__main__':
    p=argparse.ArgumentParser();p.add_argument('--offline',action='store_true');a=p.parse_args();sync(a.offline)
