#!/usr/bin/env python3
"""Strict, reproducible converter for the pinned RoaycL/fkikelee Loon catalog."""
import argparse, collections, hashlib, json, re, subprocess
from pathlib import Path
from urllib.parse import quote
ROOT = Path(__file__).resolve().parents[1]
RAW = 'https://raw.githubusercontent.com/RoaycL/Surge/main/'
CATS = {'去广告': 'AdBlock', '功能增强': 'Enhancement', '节点检测': 'Diagnostics', '签到': 'CheckIn', '定时任务': 'Automation', '订阅管理': 'Subscription', 'DNS': 'DNS', '配置管理': 'Configuration', '资源转换': 'Conversion', '数据管理': 'Data', '其他': 'Other'}
AD_CATS = [('基础拦截', 'Base', '^(BlockAdvertisers|Block_HTTPDNS|Remove_ads_by_keli)$'), ('社交社区', 'Social', 'Weibo|Weixin|Wexin|RedPaper|Tieba|Zhihu|Soul|Uki|Bixin|MaiMai|PiPiXia|ZuiYou|Qbb|Cece|KOOK|DouBan|Tumblr|Pinterest|UnnooQuan|WPForum'), ('影音娱乐', 'Media', 'Video|YouTube|Spotify|Bili|Douyu|CCLive|MangoTV|Himalaya|QtingFM|CatEarFM|CosmosPodcast|KuGou|Kuwo|NeteaseCloudMusic|QQMusic|QQKSong|SodaMusic|BodianMusic|DjDuoDuo|HongKongToolbar|TubeMax|555DY|YY_Voice|YYVoice|LiveLab|DubbingShow|LZMH|MKZ|KuaiKanComic'), ('阅读资讯', 'Reading', 'Read|Reader|Dushu|ShuQi|IThome|36Kr|Caixin|FinanceNews|NeteaseNews|ifengNews|ZAKER|Huxiu|Daily|QiDian|ZongHeng|SevenCat|YiTian|Yitian'), ('购物电商', 'Shopping', 'PinDuoDuo|Taobao|JD|Dewu|FleaMarket|ZhuanZhuan|Weidian|smzdm|GuideRank|MrHema|Dingdong|PuPuMall|iMaiCai|Walmart|MeiShiJie|ShouYinTong|ShopKeeper|TmallCampus|Taopiaopiao|Damai|FerrisWheel|Pangguai'), ('出行汽车', 'Travel', 'Amap|BaiduMap|Chelaile|DiDi|Dida|Umetrip|12306|EasyBike|RoboTaxi|MotorFans|AutoHome|MaFengWo|OnTheWay|JiaKao|JiaXiao|Hanting|FlyerTea|Xiaojukeji|FC_Box|SF-Express|KuaiDi100|Cainiao'), ('金融保险', 'Finance', 'PICC|Snowball|SinaStock|Kingdee|WaCai|Wacai|QiXinBao|RiskBird|Jin10Data|Aiinquiry'), ('游戏电竞', 'Games', 'Godlike|miHoYo|KuroBBS|5EPlay|PerfectWorldEsport|Seasun|LOL_Bible|Valorant|MeiRiSaiChe|Jump'), ('教育办公', 'Education', 'FenBi|YiKaoBang|ChaoXing|ShandongSchool|YiSchool|KuaiDui|Youdao|WPS|TXDocs|GaoDing|XiaobaiPrint|Dlabel|AxWork|Wakeup|MyFriday'), ('健康生活', 'Life', 'BooHee|BabyTree|Dayima|MeetYou|Keep|RQrun|PICOOC|Yunmai|OKOK|SnailSleep|Heartide|91160|SuZhou|CSG|EasyCharge|CoolApk|Weather|Moji|TianQi|ColorfulClouds|Foodie|SnowCamera|MeiTu|Meitu|WutaCamera|KwaiVideoeditor|Meizhixiuxing|ChatCam|Taqu|YueDanBa|Yueyou|XiaChuFang|DuiTang|ChengFenMiao|LuckinCoffee')]

def ad_category(stem):
    for name, slug, pattern in AD_CATS:
        if re.search(pattern, stem, re.I):
            return (name, slug)
    return ('工具与智能设备', 'Utilities')

def js(v):
    return json.dumps(v, ensure_ascii=False, separators=(',', ':'))

def sha(s):
    return hashlib.sha256(s.encode()).hexdigest()

def norm(s):
    return s.replace('\\\\', '\\')

def key(s):
    return re.sub('[^A-Za-z0-9_]', '_', s)

def quoted(s):
    return '"' + s.replace('"', '\\"') + '"'

def split(s):
    out = []
    start = 0
    depth = 0
    string = False
    regex = False
    esc = False
    for i, c in enumerate(s):
        if esc:
            esc = False
            continue
        if string or regex:
            if c == '\\':
                esc = True
            elif string and c == '"':
                string = False
            elif regex and c == '/':
                regex = False
        elif c == '"':
            string = True
        elif c == '/' and (not s[start:i].strip()):
            regex = True
        elif c in '[{(':
            depth += 1
        elif c in ']})':
            depth -= 1
        elif c == ',' and depth == 0:
            out.append(s[start:i].strip())
            start = i + 1
    if s[start:].strip():
        out.append(s[start:].strip())
    return out

def literal(s):
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        if s.startswith(('"', '[')):
            return json.loads(re.sub('\\\\(?![\\"\\\\/bfnrtu])', '\\\\\\\\', s))
        m = re.fullmatch('/(.*)/([igmsuy]*)', s)
        if m:
            return {'regex': m[1].replace('\\/', '/'), 'flags': m[2]}
        raise ValueError('Unsupported literal ' + s[:150])

def cond(s):
    m = re.fullmatch('(request|response) if \\$\\{url\\} ~= /(.*)/([a-z]*)(?: as (\\w+))?', s)
    if not m:
        raise ValueError('Unsupported condition ' + s)
    phase, pat, flags, _ = m.groups()
    return (phase, pat.replace('\\/', '/'), flags)

def pat(p, f=''):
    if set(f) - set('ims'):
        raise ValueError('Unsupported flags ' + f)
    return ('(?' + f + ')' if f else '') + p.replace(' ', '\\x20')

def path(s):
    out = []
    # Loon accepts a JSONPath root marker; it is not an object key.
    i = 1 if s == '$' or s.startswith(('$.', '$[')) else 0
    while i < len(s):
        if s[i] == '.':
            i += 1
            continue
        if s[i] == '[':
            if i + 1 < len(s) and s[i + 1] == '"':
                value, n = json.JSONDecoder().raw_decode(s[i + 1:])
                i += n + 1
                if i >= len(s) or s[i] != ']':
                    raise ValueError('Invalid quoted path ' + s)
                out.append(value)
                i += 1
            else:
                m = re.match('\\[(\\d+)\\]', s[i:])
                if not m:
                    raise ValueError('Invalid array path ' + s)
                out.append(int(m[1]))
                i += len(m[0])
        else:
            m = re.match('[^.\\[\\]]+', s[i:])
            if not m:
                raise ValueError('Invalid JSON path ' + s)
            out.append(m[0])
            i += len(m[0])
    if not out:
        raise ValueError('Empty JSON path')
    return out

def compact(s):
    out = []
    string = esc = comment = False
    for c in s:
        if comment:
            if c == '\n':
                comment = False
                out.append(' ')
            continue
        if esc:
            out.append(c)
            esc = False
            continue
        if string and c == '\\':
            out.append(c)
            esc = True
            continue
        if c == '"':
            string = not string
        if not string and c == '#':
            comment = True
            continue
        out.append(' ' if c in '\r\n\t' else c)
    return ''.join(out).strip()

class Converter:

    def __init__(self, source):
        self.source = source
        self.files = {}
        self.resources = {}
        self.adapters = {}
        self.entries = []

    def put(self, p, s):
        self.files[p] = s

    def resource(self, url):
        i = url.find('/Resource/')
        if i < 0:
            raise ValueError('Non-vendored dependency ' + url)
        rel = url[i + 1:]
        f = self.source / rel
        if not f.exists():
            f = ROOT / 'upstreams/fkikelee/extra' / rel
        if not f.exists():
            raise FileNotFoundError(url)
        s = f.read_text()
        p = 'JS/FKIKelee/Resources/' + rel[len('Resource/'):]
        self.put(p, s)
        self.resources[url] = {'path': p, 'sha256': sha(s)}
        return (s, p)

    def adapter(self, url):
        if url in self.adapters:
            return self.adapters[url]
        text, p = self.resource(url)
        p = p.replace('/Resources/', '/Adapters/')
        style = 'object' if re.search('\\$argument(?:\\?\\.|\\.)(token|cookie|removeAllBanners|removePinnedArticles)', text) else 'json' if 'JSON.parse($argument)' in text else 'query'
        wrapper = (ROOT / 'scripts/loon_adapter.js.tpl').read_text().replace('__STYLE__', js(style)).replace('__SOURCE__', url)
        self.put(p, wrapper + '\n(function($argument,$done,$request,$response,$environment,$httpClient){\n' + text + '\n})(fkArg,fkDone,fkReq,fkRes,fkEnv,fkHTTP);\n})();\n')
        self.adapters[url] = p
        return p

    def convert(self, f):
        source = f.read_text()
        sections = collections.defaultdict(list)
        meta = {}
        sec = ''
        for no, l in enumerate(source.splitlines(), 1):
            l = l.strip()
            if l.startswith('#!'):
                if '=' in l:
                    k, v = l[2:].split('=', 1)
                    meta[k.strip()] = v.strip()
            elif l.startswith('['):
                sec = l.lower()
            elif l and (not l.startswith(('#', '//'))):
                sections[sec].append((no, norm(l)))
        tag = meta.get('tag', '其他').split(',')[0].strip()
        cat = CATS.get(tag, 'Other')
        stem = f.stem
        name = meta['name']
        sub, slug = ad_category(stem) if tag == '去广告' else ('', '')
        folder = cat + ('/' + slug if slug else '')
        out = collections.defaultdict(list)
        notes = []
        params = {}
        help = []
        for _, l in sections['[argument]']:
            k, v = l.split('=', 1)
            k = k.strip()
            tokens = split(v)
            default = literal(tokens[1]) if len(tokens) > 1 else ''
            if k.lower() in ['taskcron', 'taskmonitor']:
                default = default.replace('?', '*')
            params[k] = default
            help.append(k + '=' + str(default) + '；' + ','.join(tokens[2:]))
        if cat == 'Diagnostics':
            params['policy'] = 'DIRECT'
            help.append('policy：Surge 节点/策略名称，替代 Loon 长按节点。')
        stored = {}
        if stem == 'Auto_Join_TF':
            params['App_ID'] = ''
            stored['App_ID'] = 'App_ID'
            help.append('App_ID：TestFlight ID，可用逗号分隔；修改后同步到原脚本存储，脚本自动移除已加入 ID 的行为保留。')
        if stem == 'Script-Hub':
            params.update({'ScriptHubNotify': '跟随链接', 'Parser_body_max': '', 'Parser_http_timeout': '20'})
            stored = {'ScriptHubNotify': 'ScriptHub通知', 'Parser_body_max': 'Parser_body_max', 'Parser_http_timeout': 'Parser_http_timeout'}
            help += ['ScriptHubNotify：开启通知 / 关闭通知 / 跟随链接', 'Parser_body_max：最大响应体参数，留空使用上游默认值', 'Parser_http_timeout：请求超时秒数，默认20']
        proxy = []
        for _, l in sections['[rule]']:
            if l == 'ad-sdk-config.youdao.com':
                l = 'DOMAIN,ad-sdk-config.youdao.com,REJECT'
                notes.append('修复上游裸域名规则为 DOMAIN REJECT。')
            if l.startswith('^') and ' 307 ' in l:
                p, v = l.split(' 307 ', 1)
                out['URL Rewrite'].append(p + ' ' + v + ' 307')
                notes.append('修复上游误放在 Rule 段的重定向。')
                continue
            if re.search(',\\s*REJECT-IMG\\s*$', l):
                l = re.sub('REJECT-IMG\\s*$', 'REJECT-TINYGIF', l)
            if re.search(',\\s*REJECT-DICT\\s*$', l):
                m = re.fullmatch('URL-REGEX,\\s*(.*),\\s*REJECT-DICT', l)
                if not m:
                    raise ValueError('Non-URL REJECT-DICT needs review ' + l)
                v = m[1].strip()
                v = literal(v) if v.startswith('"') else v
                out['Map Local'].append(v + ' data-type=text data="{}" status-code=200 header="Content-Type:application/json"')
                continue
            if re.search(',\\s*PROXY\\s*$', l):
                proxy.append(re.sub(',\\s*PROXY\\s*$', '', l))
            else:
                out['Rule'].append(l)
        if proxy:
            p = f'Ruleset/FKIKelee/{folder}/{stem}.list'
            self.put(p, '# ' + name + '\n' + '\n'.join(proxy) + '\n')
            notes.append('主配置需添加：RULE-SET,' + RAW + p + ',节点选择（替换为你的代理策略）。')
        for _, l in sections['[general]']:
            if l.startswith('real-ip='):
                out['General'].append('always-real-ip = %APPEND% ' + l.split('=', 1)[1])
            else:
                raise ValueError('Unsupported General ' + l)
        for _, l in sections['[mitm]']:
            if not l.startswith('hostname='):
                raise ValueError(l)
            out['MITM'].append('hostname = %APPEND% ' + l.split('=', 1)[1])
        runtime = {'request': [], 'response': []}
        for no, l in sections['[rewrite]']:
            a, b = l.split(' then ', 1)
            phase, p, flags = cond(a)
            np = pat(p, flags)
            m = re.fullmatch('([\\w.]+)\\((.*)\\)', b)
            if not m:
                raise ValueError(f'{f}:{no}: invalid action ' + b)
            op, arg = m.groups()
            try:
                args = [literal(v) for v in split(arg)]
            except (ValueError, json.JSONDecodeError):
                if stem == 'SF-Express_remove_ads' and op == 'response.body.mock':
                    notes.append('上游顺丰模拟响应 JSON 已截断，此条无效规则未启用。')
                    continue
                raise
            if op.startswith('response.json.'):
                if op.endswith('jq_file'):
                    program, _ = self.resource(args[0])
                    program = compact(program)
                elif op.endswith('.jq'):
                    program = args[0]
                elif op.endswith('.delete'):
                    paths = args[0] if isinstance(args[0], list) else [args[0]]
                    program = 'reduce ' + js([path(p) for p in paths]) + '[] as $p (.; delpaths([$p]))'
                elif op.endswith('.replace'):
                    paths = args[0] if isinstance(args[0], list) else [args[0]]
                    values = args[1] if isinstance(args[0], list) else [args[1]]
                    if len(paths) != len(values):
                        raise ValueError('Mismatched JSON replacement arrays')
                    program = ' | '.join(('(if try (getpath(' + js(path(p)[:-1]) + ') | has(' + js(path(p)[-1]) + ')) catch false then setpath(' + js(path(p)) + ';' + js(v) + ') else . end)' for p, v in zip(paths, values)))
                else:
                    raise ValueError('Unsupported JSON ' + op)
                if not program.strip():
                    program = '.'
                    notes.append('上游空 jq 转为无操作，保留原响应。')
                if stem == 'smzdm_remove_ads' and 'ad_campaign_name' in program:
                    program = program.replace('test("\\S")', 'test("\\\\S")')
                    notes.append('修复上游 jq 中无效的非空白正则转义。')
                if stem == 'KuGou_remove_ads' and 'def namesToRemove:' in program:
                    program = 'def namesToRemove:["AI帮唱","长相思2","K歌","小说","游戏"]; def clean: if type=="object" then with_entries(select(.value | if type=="object" then ((.name // "") | IN(namesToRemove[]) | not) else true end)) | map_values(clean) elif type=="array" then map(clean) else . end; clean'
                    notes.append('修复上游酷狗 jq 无法编译的递归过滤表达式。')
                out['Body Rewrite'].append('http-response-jq ' + np + " '" + program + "'")
            elif op in ['reject', 'reject_dict', 'reject_img']:
                if op == 'reject_img':
                    out['Rule'].append('URL-REGEX,' + quoted(np) + ',REJECT-TINYGIF')
                else:
                    code = args[0] if args else 404
                    body = '{}' if op == 'reject_dict' else ''
                    ctype = 'application/json' if op == 'reject_dict' else 'text/plain'
                    out['Map Local'].append(np + ' data-type=text data=' + quoted(body) + ' status-code=' + str(code) + ' header="Content-Type:' + ctype + '"')
            elif op == 'redirect':
                out['URL Rewrite'].append(np + ' ' + re.sub('\\$\\{urlMatch\\.(\\d+)\\}', '$\\1', args[1]) + ' ' + str(args[0]))
            elif op == 'url.replace':
                runtime[phase].append({'pattern': p, 'flags': flags, 'op': op, 'args': args})
            elif op in ['response.body.mock', 'response.body.replace', 'request.body.replace', 'request.header.replace', 'response.header.add']:
                runtime[phase].append({'pattern': p, 'flags': flags, 'op': op, 'args': args})
            elif op == 'response.body.mock_file':
                try:
                    s, _ = self.resource(args[1])
                    runtime[phase].append({'pattern': p, 'flags': flags, 'op': 'response.body.mock', 'args': [args[0], s] + args[2:]})
                except FileNotFoundError:
                    notes.append('缺失上游依赖，此项未启用：' + args[1])
            else:
                raise ValueError(f'{f}:{no}: unsupported ' + op)
        for phase, routes in runtime.items():
            if not routes:
                continue
            rp = f'JS/FKIKelee/Rewrite/{stem}-{phase}.js'
            self.put(rp, (ROOT / 'scripts/loon_rewrite.js.tpl').read_text().replace('__ROUTES__', js(routes)))
            pattern = '|'.join(('(?:' + pat(r['pattern'], r['flags']) + ')' for r in routes))
            out['Script'].append(f'fk-{stem}-rewrite-{phase} = type=http-{phase}, pattern={quoted(pattern)}, requires-body=true, max-size=4194304, script-path={RAW + rp}, timeout=10')
        for num, (no, l) in enumerate(sections['[script]']):
            left, right = l.split(' then ', 1)
            m = re.fullmatch('script\\((.*)\\) with (.*)', right)
            if not m:
                raise ValueError(f'{f}:{no}: invalid script ' + l)
            a, opts = m.groups()
            aa = split(a)
            url = literal(aa[0])
            arg = aa[1] if len(aa) > 1 else None
            options = dict(((k.strip(), v.strip()) for k, v in (x.split('=', 1) for x in split(opts))))
            if left.startswith('cron '):
                phase = 'cron'
                cron = left[5:]
            elif left == 'generic':
                phase = 'generic'
                cron = None
            else:
                phase, p, flags = cond(left)
                phase = 'http-' + phase
                cron = None
            if 'CommonScript/replace-body.js' in url:
                v = literal(arg)
                regex, repl = v.split('->', 1)
                rp = f'JS/FKIKelee/Rewrite/{stem}-replace-body.js'
                self.put(rp, (ROOT / 'scripts/loon_rewrite.js.tpl').read_text().replace('__ROUTES__', js([{'pattern': p, 'flags': flags, 'op': 'request.body.replace', 'args': [{'regex': regex, 'flags': 'g'}, repl]}])))
            else:
                try:
                    rp = self.adapter(url)
                except FileNotFoundError:
                    notes.append('缺失上游依赖，此项未启用：' + url)
                    continue
            sk = f'fk-{stem}-{num}'
            parts = ['type=' + phase]
            if phase.startswith('http-'):
                parts.append('pattern=' + quoted(pat(p, flags)))
            if phase == 'cron':
                parts.append('cronexp=' + quoted(re.sub('\\$\\{([^}]+)\\}', lambda m: '{{{' + key(m[1]) + '}}}', cron)))
            if options.get('requires_body') == 'true':
                parts += ['requires-body=true', 'max-size=4194304']
            if options.get('binary_body_mode') == 'true':
                parts += ['binary-body-mode=true']
            parts += ['script-path=' + RAW + rp, 'timeout=' + options.get('timeout', '15')]
            sent = []
            if arg:
                if arg.startswith('{'):
                    sent.extend((k + '={{{' + key(k) + '}}}' for k in re.findall('\\$\\{([^}]+)\\}', arg)))
                elif 'CommonScript/replace-body.js' not in url:
                    raise ValueError('Unknown script argument ' + arg)
            if options.get('enable'):
                sent.append('__enable=' + re.sub('\\$\\{([^}]+)\\}', lambda m: '{{{' + key(m[1]) + '}}}', options['enable']))
            if cat == 'Diagnostics':
                sent.append('__policy={{{policy}}}')
            sent.extend(('__store_' + dest + '={{{' + key(k) + '}}}' for k, dest in stored.items()))
            if sent:
                parts.append('argument=' + quoted('&'.join(sent)))
            out['Script'].append(sk + ' = ' + ', '.join(parts))
            if phase == 'generic':
                out['Panel'].append(name + '-' + str(num) + ' = script-name=' + sk + ',update-interval=-1')
        desc = meta.get('desc', '')
        if stem == 'EasyBike_remove_ads':
            desc = '【缺失主体脚本：去广告功能未启用，仅保留MitM设置】' + desc
        elif any('截断' in n for n in notes):
            desc = '【部分功能受限：上游一条无效响应未启用】' + desc
        headers = ['#!name=' + name, '#!desc=' + desc, '#!author=' + meta.get('author', ''), '#!category=FKIKelee · ' + tag + (' · ' + sub if sub else ''), '#!homepage=https://github.com/RoaycL/Surge/tree/main/Module/FKIKelee', '#!icon=' + meta.get('icon', ''), '# Source: https://github.com/RoaycL/fkikelee/blob/' + self.source_sha + '/lpx/' + f.name, '# Generated by scripts/convert_loon.py; original authors retain attribution.']
        if params:
            headers += ['#!arguments=' + ','.join((key(k) + ':' + quote(str(v).lower() if isinstance(v, bool) else str(v), safe=' */?') for k, v in params.items())), '#!arguments-desc=' + ' | '.join(help)]
        headers += ['# NOTE: ' + s for s in dict.fromkeys(notes)]
        text = '\n'.join(headers) + '\n' + ''.join(('\n[' + s + ']\n' + '\n'.join(v) + '\n' for s, v in out.items() if v))
        dest = f'Module/FKIKelee/{folder}/{stem}.sgmodule'
        self.put(dest, text)
        self.put('upstreams/fkikelee/lpx/' + f.name, source)
        self.entries.append(dict(id=stem, name=name, category=tag, subcategory=sub, module=dest, source='lpx/' + f.name, source_sha256=sha(source), parameters=params, notes=list(dict.fromkeys(notes)), rules=len(sections['[rule]']), rewrites=len(sections['[rewrite]']), scripts=len(sections['[script]'])))

    def run(self):
        self.source_sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=self.source, text=True).strip()
        for f in sorted((self.source / 'lpx').glob('*.lpx')):
            try:
                self.convert(f)
            except Exception as e:
                raise ValueError(str(f) + ': ' + str(e)) from e
        self.put('upstreams/fkikelee/manifest.json', json.dumps(dict(source_repository='RoaycL/fkikelee', source_commit=self.source_sha, modules=self.entries, resources=self.resources), ensure_ascii=False, indent=2) + '\n')
        ls = ['# FKIKelee Loon → Surge 插件目录', '', f'来源：[RoaycL/fkikelee](https://github.com/RoaycL/fkikelee/tree/{self.source_sha})，共 {len(self.entries)} 个插件。保留原作者署名，不覆盖仓库已有模块。', '', '## 使用说明', '', '- 需要 Surge iOS 5.14+ / Mac 5.9+ 原生 jq 支持；请按需安装，避免多个同 App 模块互相覆盖。', '- 参数转换为 Surge 模块参数，默认值和可选值见模块参数说明；Surge 无法复刻 Loon 的开关/下拉控件。', '- 默认参数 URL 编码以保留逗号、空格，适配器自动解码；手动输入含 &、引号、逗号的值也应 URL 编码。', '- 节点检测通过面板手动运行，policy 参数指定 Surge 节点/策略；不支持 Loon 的节点长按菜单。', '- PROXY 路由另附规则集，必须将模块注释中的 RULE-SET 行加入主配置并指定自己的策略。', '- 缺失的源依赖不会以空脚本冒充；受影响功能列在备注中，其他转换部分仍可使用。', '- 转换及模拟测试不等于已在全部 App、账号和真实设备验证。', '']
        for tag in CATS:
            entries = [e for e in self.entries if e['category'] == tag]
            if not entries:
                continue
            ls += ['## ' + tag + f'（{len(entries)}）', '', '| 分类 / 插件 | 安装 | 参数 | 差异 / 配套操作 |', '| --- | --- | --- | --- |']
            entries.sort(key=lambda e: (e['subcategory'], e['name']))
            for e in entries:
                esc = lambda v: str(v).replace('|', '\\|').replace('\n', ' ')
                ls += ['| ' + esc((e['subcategory'] + ' / ' if e['subcategory'] else '') + e['name']) + ' | [模块](' + RAW + e['module'] + ') | ' + esc('、'.join(e['parameters'])) + ' | ' + esc('；'.join(e['notes'])) + ' |']
            ls += ['']
        self.put('Module/FKIKelee/README.md', '\n'.join(ls) + '\n')
        for p, s in self.files.items():
            f = ROOT / p
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_text(s)
        print(js(dict(modules=len(self.entries), categories=dict(collections.Counter((e['category'] for e in self.entries))), resources=len(self.resources), adapters=len(self.adapters), notes=[(e['id'], e['notes']) for e in self.entries if e['notes']])))
if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--source', type=Path, required=True)
    Converter(ap.parse_args().source).run()
