import json
import re
import sys
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from sync_yfamilys import IndexParser, render_module, comment_blocks, get_text, parse_index

class YFamilyTests(unittest.TestCase):
    def test_network_index_accepts_html_but_module_download_rejects_it(self):
        from unittest.mock import patch
        import io
        html = '<!DOCTYPE html><html>' + ''.join(f'<a href="/module/test{i}.module">App {i}</a>' for i in range(101)) + '</html>'
        with patch('sync_yfamilys.urlopen', return_value=io.BytesIO(html.encode())), patch('sync_yfamilys.request_slot'):
            self.assertEqual(len(parse_index(get_text('https://yfamilys.com/surge', html=True))),101)
        with patch('sync_yfamilys.urlopen', side_effect=lambda *a,**k: io.BytesIO(html.encode())), patch('sync_yfamilys.time.sleep'), patch('sync_yfamilys.request_slot'):
            with self.assertRaisesRegex(ValueError,'HTML response'):
                get_text('https://yfamilys.com/module/test.module')

    def test_rate_limit_respects_upstream_retry_after(self):
        import io
        from unittest.mock import patch
        from urllib.error import HTTPError
        from email.message import Message
        headers=Message();headers['Retry-After']='17'
        error=HTTPError('https://yfamilys.com/module/x.module',429,'Too Many Requests',headers,None)
        with patch('sync_yfamilys.urlopen', side_effect=[error,io.BytesIO(b'[Rule]\nDOMAIN,x,REJECT')]), patch('sync_yfamilys.request_slot') as slot:
            self.assertIn('[Rule]',get_text(error.url))
            self.assertIn(unittest.mock.call(cooldown=17.0),slot.call_args_list)

    def test_installed_url_stays_stable_when_source_description_changes(self):
        source='#!name=App\n#!desc=新增去广告功能\n[MITM]\nhostname=api.example.com\n'
        item={'url':'https://yfamilys.com/module/example.module','title':'App'}
        self.assertEqual(render_module(item,source)[2],'AdBlock')
        path,_,group,_=render_module({**item,'group':'Enhancement'},source)
        self.assertEqual(path,'Module/Enhancement/YFamily-example.sgmodule')
        self.assertEqual(group,'Enhancement')

    def test_index_excludes_profiles_and_deduplicates(self):
        p=IndexParser();p.feed('<a href="/module/x.module">X</a><a href="/module/x.module">Alias</a><a href="/config/a.conf">Config</a><a href="/sgmodule/p.sgmodule">Panel</a><a href="https://elsewhere.example/a.module">Other</a>')
        self.assertEqual(list(p.items),['https://yfamilys.com/module/x.module','https://yfamilys.com/sgmodule/p.sgmodule'])

    def source(self, suffix):
        manifest=json.loads((ROOT/'upstreams/yfamilys/manifest.json').read_text())['modules']
        m=next(m for m in manifest if m['url'].endswith('/'+suffix))
        return m,(ROOT/m['source']).read_text()

    def test_gddt_duplicate_script_path_is_repaired(self):
        m,s=self.source('gddt.module');_,out,_,notes=render_module(m,s)
        scripts=[l for l in out.splitlines() if l.startswith('高德地图去广告')]
        self.assertEqual(len(scripts),5)
        for line in scripts:
            self.assertEqual(line.count('script-path='),1)
            self.assertIn('pattern=^https?',line)
        self.assertTrue(any('pattern' in n for n in notes))

    def test_regex_commas_and_foreign_script_syntax(self):
        m,s=self.source('startingad.sgmodule');_,out,_,_=render_module(m,s)
        line=next(l for l in out.splitlines() if l.startswith('555Ad='))
        self.assertIn('pattern="',line)
        self.assertIn('{1,4}',line)
        line=next(l for l in out.splitlines() if l.startswith('zheye.min2='))
        self.assertIn('type=http-request',line)
        self.assertIn('requires-body=true',line)
        self.assertNotIn(' url script-',line)

    def test_youtube_response_modes_and_parameters(self):
        m,s=self.source('YouTubeAd.sgmodule');_,out,_,_=render_module(m,s)
        self.assertFalse(any(l.endswith(' reject-200') for l in out.splitlines() if not l.startswith('#')))
        self.assertEqual(out.count('status-code=200'),4)
        self.assertIn('#!arguments=脚本执行引擎:jsc',out)
        declared=out.split('#!arguments=',1)[1].splitlines()[0]
        for key in set(re.findall(r'\{\{\{([^}]+)\}\}\}',out)):self.assertIn(key+':',declared)

    def test_comments_and_stray_text(self):
        m,s=self.source('caiyun_cron.module');_,out,_,_=render_module(m,s)
        self.assertNotIn('\n2?? 打开手机设置',out)
        self.assertIn('requires-body=false',out)
        m,s=self.source('ztbl.module');_,out,_,_=render_module(m,s)
        self.assertNotIn('\nmobile.php\n',out)
        with self.assertRaises(ValueError):comment_blocks('/* unfinished')

    def test_stable_panel_names_and_fanqie_existing_address(self):
        m,s=self.source('oil.sgmodule');path,_,group,_=render_module(m,s)
        self.assertEqual(group,'Panel');self.assertIn('/Panel/YFamily-Panel-oil.',path)
        m,s=self.source('oil.module');path,_,_,_=render_module(m,s)
        self.assertNotIn('Panel-oil',path)
        m,s=self.source('fanqie.module');path,out,_,_=render_module(m,s)
        self.assertEqual(path,'Module/AdBlock/FanQieNovel.sgmodule')
        self.assertIn(r'\/track-log\/',out);self.assertNotIn(r'\/track_log\/',out)
        self.assertEqual(out.count('%APPEND%'),1)

if __name__=='__main__':unittest.main()
