import importlib.util
import re
import sys
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from fanqie import CANONICAL, UPSTREAM, convert_fanqie, sections

class FanQieTests(unittest.TestCase):
    def test_upstream_only_and_reproducible(self):
        source = (ROOT / 'upstreams/FanQieNovel.plugin').read_text(encoding='utf-8-sig')
        output = convert_fanqie(source)
        self.assertEqual(output, (ROOT / CANONICAL).read_text())
        parsed = sections(output)
        self.assertEqual(len(parsed['[Rule]']), 30)
        self.assertEqual(len(set(parsed['[Rule]'])), 30)
        self.assertEqual(len(parsed['[URL Rewrite]']), 14)
        self.assertNotIn('可莉', output)
        self.assertNotIn('DOMAIN,log3-applog.fqnovel.com,REJECT', output)
        self.assertIn('#!author=zqzess', output)
        self.assertIn('#!category=去广告', output)
        self.assertNotIn('[Script]', output)

    def test_all_upstream_rules_preserved(self):
        source = sections((ROOT / 'upstreams/FanQieNovel.plugin').read_text(encoding='utf-8-sig'))
        result = sections((ROOT / CANONICAL).read_text())['[Rule]']
        for line in source['[Rule]']:
            fields = [x.strip() for x in line.split(',')]
            if fields[0] == 'DOMAIN' and '*' in fields[1]: fields[0] = 'DOMAIN-WILDCARD'
            self.assertIn(','.join(fields), result)
        for domain in ['p6-ad-sign.byteimg.com', 'p9-ad-sign.byteimg.com']:
            self.assertLess(result.index('DOMAIN,' + domain + ',REJECT'), result.index('DOMAIN-SUFFIX,byteimg.com,DIRECT'))

    def test_rewrite_examples(self):
        parsed = sections((ROOT / CANONICAL).read_text())
        patterns = [re.compile(l.rsplit(' _ reject', 1)[0]) for l in parsed['[URL Rewrite]']]
        for url in ['https://ads.pangolin-sdk-toutiao.com/api/ad/union/sdk/get_ads/',
                    'https://p3.byteimg.com/tos-cn-i-1yzifmftcy/test-jpeg.jpeg',
                    'https://gurd.snssdk.com/src/server/v3/package',
                    'https://i.snssdk.com/api/ad/example']:
            self.assertTrue(any(p.search(url) for p in patterns), url)
        self.assertFalse(any(p.search('https://normal.byteimg.com/cover/book.jpeg') for p in patterns))
        hosts = parsed['[MITM]'][0]
        self.assertIn('%APPEND%', hosts)
        for host in ['*.snssdk.com', '*.byteimg.com', '*.pstatp.com', '*.pangolin-sdk-toutiao.com', '*.pglstatp-toutiao.com']:
            self.assertIn(host, hosts)

    def test_independent_sources_and_live_updates(self):
        spec = importlib.util.spec_from_file_location('sync_fanqie', ROOT / 'scripts/sync_upstream.py')
        sync = importlib.util.module_from_spec(spec); spec.loader.exec_module(sync)
        self.assertEqual(sync.SOURCES['FanQieNovel'], UPSTREAM)
        snapshot = (ROOT / 'upstreams/FanQieNovel.plugin').read_text()
        self.assertEqual(sync.convert_fanqie(snapshot), (ROOT / CANONICAL).read_text())
        spec = importlib.util.spec_from_file_location('loon_fanqie', ROOT / 'scripts/convert_loon.py')
        loon = importlib.util.module_from_spec(spec); spec.loader.exec_module(loon)
        c = loon.Converter(ROOT / 'upstreams/fkikelee')
        c.source_sha = 'test'
        c.convert(ROOT / 'upstreams/fkikelee/lpx/DragonRead_remove_ads.lpx')
        self.assertEqual(c.entries[0]['module'], 'Module/AdBlock/DragonRead_remove_ads.sgmodule')
        self.assertNotIn(CANONICAL, c.files)
        keli = c.files['Module/AdBlock/DragonRead_remove_ads.sgmodule']
        self.assertIn('（可莉）', keli)
        self.assertNotIn('[URL Rewrite]', keli)
        self.assertIn('DOMAIN, log3-applog.fqnovel.com, REJECT', keli)
        self.assertTrue((ROOT / 'Module/AdBlock/DragonRead_remove_ads.sgmodule').exists())
        self.assertFalse((ROOT / 'upstreams/FanQieNovel.yfamilys.plugin').exists())
        updated = snapshot + '\n[Rule]\nDOMAIN,new-ad.example,REJECT\n'
        self.assertIn('DOMAIN,new-ad.example,REJECT', sync.convert_fanqie(updated))

    def test_unreviewed_actions_fail(self):
        for bad in ['[Rule]', '[MITM]\nhostname=x', '[Script]\nx = bad', '[Rule]\nDOMAIN,x,PROXY', '[URL Rewrite]\n^https://x http://bad 302']:
            with self.assertRaises(ValueError): convert_fanqie(bad)

if __name__ == '__main__': unittest.main()
