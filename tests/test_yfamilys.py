import json
import re
import sys
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from sync_yfamilys import IndexParser, render_module, comment_blocks

class YFamilyTests(unittest.TestCase):
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
