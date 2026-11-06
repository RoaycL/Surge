import importlib.util
import re
import sys
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from merge_fanqie import CANONICAL, merge_fanqie, sections

class FanQieMergeTests(unittest.TestCase):
    def test_generated_output_and_single_module(self):
        base = (ROOT / 'upstreams/FanQieNovel.plugin').read_text()
        output = merge_fanqie(base)
        self.assertEqual(output, (ROOT / CANONICAL).read_text())
        self.assertFalse((ROOT / 'Module/AdBlock/DragonRead_remove_ads.sgmodule').exists())
        parsed = sections(output)
        self.assertEqual(len(parsed['[Rule]']), 62)
        self.assertEqual(len(set(parsed['[Rule]'])), 62)
        self.assertEqual(len(parsed['[URL Rewrite]']), 14)
        self.assertNotIn('[Script]', output)
        self.assertIn('#!category=去广告', output)

    def test_no_source_rules_lost_and_direct_exception_order(self):
        output = sections((ROOT / CANONICAL).read_text())['[Rule]']
        for p in [ROOT / 'upstreams/FanQieNovel.plugin', ROOT / 'upstreams/fkikelee/lpx/DragonRead_remove_ads.lpx', ROOT / 'upstreams/FanQieNovel.yfamilys.plugin']:
            for line in sections(p.read_text(encoding='utf-8-sig'))['[Rule]']:
                fields = [s.strip() for s in line.split(',')]
                if fields[0] == 'DOMAIN' and '*' in fields[1]: fields[0] = 'DOMAIN-WILDCARD'
                self.assertIn(','.join(fields), output)
        for domain in ['p6-ad-sign.byteimg.com', 'p9-ad-sign.byteimg.com']:
            self.assertLess(output.index('DOMAIN,' + domain + ',REJECT'), output.index('DOMAIN-SUFFIX,byteimg.com,DIRECT'))

    def test_rewrite_examples_and_mitm_coverage(self):
        output = sections((ROOT / CANONICAL).read_text())
        patterns = [re.compile(line.rsplit(' _ reject', 1)[0]) for line in output['[URL Rewrite]']]
        samples = ['https://ads.pangolin-sdk-toutiao.com/api/ad/union/sdk/get_ads/',
                   'https://s1.pstatp.com/obj/ad-app-package/foo',
                   'https://gurd.snssdk.com/src/server/v3/package',
                   'https://p3.byteimg.com/tos-cn-i-1yzifmftcy/test-jpeg.jpeg',
                   'https://i.snssdk.com/api/ad/example']
        for url in samples: self.assertTrue(any(p.search(url) for p in patterns), url)
        self.assertFalse(any(p.search('https://normal.byteimg.com/cover/book.jpeg') for p in patterns))
        hosts = output['[MITM]'][0]
        for h in ['*.pangolin-sdk-toutiao.com', '*.pglstatp-toutiao.com', '*.pstatp.com', '*.snssdk.com', '*.byteimg.com']:
            self.assertIn(h, hosts)
        self.assertIn('%APPEND%', hosts)

    def test_both_generators_use_same_builder(self):
        base = (ROOT / 'upstreams/FanQieNovel.plugin').read_text()
        spec = importlib.util.spec_from_file_location('fanqie_sync', ROOT / 'scripts/sync_upstream.py')
        sync = importlib.util.module_from_spec(spec); spec.loader.exec_module(sync)
        self.assertEqual(sync.convert_fanqie(base), (ROOT / CANONICAL).read_text())
        spec = importlib.util.spec_from_file_location('fanqie_loon', ROOT / 'scripts/convert_loon.py')
        loon = importlib.util.module_from_spec(spec); spec.loader.exec_module(loon)
        c = loon.Converter(ROOT / 'upstreams/fkikelee'); c.source_sha = 'test'
        c.convert(ROOT / 'upstreams/fkikelee/lpx/DragonRead_remove_ads.lpx')
        self.assertEqual(c.files[CANONICAL], (ROOT / CANONICAL).read_text())
        self.assertEqual(c.entries[0]['module'], CANONICAL)

    def test_unreviewed_actions_fail(self):
        for bad in ['[Script]\nx = bad', '[Rule]\nDOMAIN,x,PROXY', '[URL Rewrite]\n^https://x http://bad 302']:
            with self.assertRaises(ValueError): merge_fanqie(bad)

if __name__ == '__main__': unittest.main()
