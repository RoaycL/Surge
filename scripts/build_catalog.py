#!/usr/bin/env python3
"""Build the public, three-category module catalog from the shipped files."""
import re
from pathlib import Path
from urllib.parse import quote
ROOT = Path(__file__).resolve().parents[1]
RAW = 'https://raw.githubusercontent.com/RoaycL/Surge/main/'

def metadata(text):
    return dict(re.findall(r'^#!([^=\n]+)=(.*)$', text, re.M))

def escape(s):
    return s.replace('|', '\\|').replace('\n', ' ').replace('\r', ' ')

def render():
    lines = ['# Surge', '', '自用 Surge 模块与脚本，收录原有模块和 [FKIKelee 转换模块](https://github.com/RoaycL/fkikelee)。', '',
             '点击名称获取文件地址；模块可在 Surge「模块 → 从 URL 安装」中添加。一键导入使用 Surge URL Scheme；若 GitHub 未唤起应用，请复制名称对应的地址。面板归入功能增强。', '',
             '[使用与兼容性说明](docs/fkikelee.md) · [仓库目录规范](docs/repository-layout.md) · [新旧地址对照](docs/path-migration.md) · [面板与历史脚本](Module/Panel/README.md)', '',
             '同一 App 的多个去广告版本请按需选择，避免重复启用。迁移后旧路径已删除，已有安装和配置需改用本页的新地址。', '']
    known = {p.name for p in (ROOT / 'upstreams/fkikelee/lpx').glob('*.lpx')}
    groups = [('DNS', ['DNS']), ('功能增强', ['Enhancement', 'Panel']), ('去广告', ['AdBlock'])]
    for title, folders in groups:
        modules = sorted((p for folder in folders for p in (ROOT / 'Module' / folder).glob('*.sgmodule')), key=lambda p: metadata(p.read_text()).get('name', p.stem))
        lines += [f'## {title}（{len(modules)}）', '', '| 名称 | 文件 | 一键导入 | 备注 |', '| --- | --- | --- | --- |']
        for p in modules:
            text = p.read_text(); meta = metadata(text); rel = p.relative_to(ROOT).as_posix()
            name = meta.get('name', p.stem); desc = meta.get('desc', '')
            desc = desc if len(desc) <= 90 else desc[:89] + '…'
            notes = []
            if p.stem + '.lpx' not in known: notes.append('原有模块')
            if '#!arguments=' in text: notes.append('支持模块参数')
            if '# NOTE: 主配置需添加：RULE-SET,' in text: notes.append('需配套分流规则，见文件注释')
            notes.append(desc)
            url = RAW + rel
            install = '[导入](surge:///install-module?url=' + quote(url, safe='') + ')'
            filename = p.name
            if p.stem == 'Prevent_DNS_Leaks':
                url = RAW + 'Ruleset/DNS/Prevent_DNS_Leaks.list'; filename = 'Prevent_DNS_Leaks.list'
                install = '主配置引用'
                notes = ['规则集：仅将检测网站交给指定代理策略；需手动添加 RULE-SET，不是可独立生效的模块。']
            lines.append('| [' + escape(name) + '](' + url + ') | `' + filename + '` | ' + install + ' | ' + escape('；'.join(filter(None, notes))) + ' |')
        lines.append('')
    return '\n'.join(lines).rstrip() + '\n'

def main():
    (ROOT / 'README.md').write_text(render())

if __name__ == '__main__':
    main()
