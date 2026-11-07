import importlib.util
import subprocess
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('converter', Path(__file__).parents[1] / 'scripts/sync_upstream.py')
converter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(converter)


class ConverterTests(unittest.TestCase):
    def test_unknown_action_fails(self):
        with self.assertRaises(ValueError):
            converter.parse_qx('^https://test url unsupported-new-action\nhostname = test')

    def test_new_script_needs_review(self):
        with self.assertRaises(ValueError):
            converter.parse_qx('^https://test url script-response-body https://example.com/new.js\nhostname = test')

    def test_unknown_jq_fails(self):
        for expr in ["'del(.a) | .b = 1'", "'del(.items[] | select(.ad))'", "'del(.a); system(\"bad\")'"]:
            with self.assertRaises(ValueError):
                converter.jq_plan(expr)

    def test_rule_only_loo_format_is_strict(self):
        with self.assertRaises(ValueError):
            converter.convert_fanqie('[Rule]\nDOMAIN,test,REJECT\n[Script]\nx = new-script')

    def test_ua_order_and_exclusions_preserved(self):
        text = (converter.ROOT / 'upstreams/Weibo.snippet').read_text()
        _, _, routes, _ = converter.parse_qx(text)
        self.assertEqual(routes[0]['ua'], 'WeiboOverseas')
        self.assertEqual(routes[0]['action'], 'echo-response')

    def test_pdd_preserves_native_jq_without_javascript(self):
        source = (converter.ROOT / 'tests/fixtures/Pinduoduo-native-jq.snippet').read_text()
        outputs = converter.convert_pdd(source)
        self.assertEqual(list(outputs), ['Module/AdBlock/Pinduoduo.sgmodule'])
        module = outputs['Module/AdBlock/Pinduoduo.sgmodule']
        self.assertNotIn('[Script]', module)
        _, _, routes, _ = converter.parse_qx(source)
        jq_routes = [r for r in routes if r['action'] == 'jsonjq-response-body']
        self.assertEqual(len(jq_routes), 5)
        for route in jq_routes:
            self.assertIn('http-response-jq ' + route['pattern'] + ' ' + route['arg'], module)
        self.assertEqual(module.count('data-type=text data="{}" status-code=200'), sum(r['action'] == 'reject-dict' for r in routes))
        converter.validate(outputs)

    def test_pdd_reviewed_script_is_bundled_and_validated(self):
        source = '^https://api\\.pinduoduo\\.com/api/alexa/homepage/hub url script-response-body ' + converter.PDD_SCRIPT + '\nhostname = api.pinduoduo.com'
        class Fetch:
            def get(self, url):
                if url != converter.PDD_SCRIPT:
                    raise AssertionError(url)
                return '$done({body: $response.body});'
        outputs = converter.convert('Pinduoduo', source, Fetch())
        self.assertIn('JS/Pinduoduo.surge.js', outputs)
        self.assertIn('type=http-response', outputs['Module/AdBlock/Pinduoduo.sgmodule'])
        self.assertIn('script-path=' + converter.RAW + 'JS/Pinduoduo.surge.js', outputs['Module/AdBlock/Pinduoduo.sgmodule'])
        converter.validate(outputs)

    def test_pdd_script_changes_require_review(self):
        for action, url in [
            ('script-request-body', converter.PDD_SCRIPT),
            ('script-response-body', converter.TX_SCRIPT),
            ('script-response-body', 'https://example.com/new.js'),
        ]:
            with self.assertRaises(ValueError):
                converter.convert_pdd('^https://test url ' + action + ' ' + url + '\nhostname = test', object())

    def test_pdd_binary_script_requires_adapter(self):
        class Fetch:
            def get(self, url):
                return '$done({body: $response.bodyBytes});'
        with self.assertRaisesRegex(ValueError, 'binary script'):
            converter.convert_pdd('^https://test url script-response-body ' + converter.PDD_SCRIPT + '\nhostname = test', Fetch())

    def test_native_jq_accepts_more_than_js_subset_and_rejects_invalid_syntax(self):
        good = "^https://test url jsonjq-response-body 'del(.a) | .b = 1'\nhostname = test"
        converter.validate(converter.convert_pdd(good))
        bad = "^https://test url jsonjq-response-body 'del('()'\nhostname = test"
        with self.assertRaises(ValueError):
            converter.convert_pdd(bad)
        with self.assertRaises(subprocess.CalledProcessError):
            converter.validate(converter.convert_pdd("^https://test url jsonjq-response-body 'del('\nhostname = test"))

    def test_pdd_new_conditional_action_requires_review(self):
        with self.assertRaises(ValueError):
            converter.convert_pdd("^https://test SomeUA url-and-header jsonjq-response-body 'del(.a)'\nhostname = test")

    def test_jq_without_ua_is_native_not_silently_skipped(self):
        # Regression: a UA-less jq route got no compiled plan and passed through at runtime.
        source = ("^https://a\\.test/x WeiboOverseas url-and-header jsonjq-response-body 'del(.data.banner)'\n"
                  "^https://b\\.test/feed url jsonjq-response-body 'del(.items[] | select(.category == \"group\"))'\n"
                  "hostname = a.test, b.test")
        outputs = converter.convert_scripted('Weibo', source, object())
        module = outputs['Module/AdBlock/Weibo.sgmodule']
        self.assertIn('[Body Rewrite]', module)
        self.assertIn("http-response-jq ^https://b\\.test/feed 'del(.items[] | select(.category == \"group\"))'", module)
        self.assertNotIn('b\\.test/feed', outputs['JS/Weibo.surge.js'])
        self.assertIn('"plan"', outputs['JS/Weibo.surge.js'])
        converter.validate(outputs)

    def test_native_only_snippet_has_no_js_bundle(self):
        outputs = converter.convert_scripted('Weibo', "^https://b\\.test/x url jsonjq-response-body 'del(.a)'\nhostname = b.test", object())
        self.assertEqual(list(outputs), ['Module/AdBlock/Weibo.sgmodule'])
        self.assertNotIn('[Script]', outputs['Module/AdBlock/Weibo.sgmodule'])

    def test_upstream_date_is_preserved(self):
        meta, *_ = converter.parse_qx("#!name=x\n#!update = 2026-10-02\n^https://t url reject-dict\nhostname = t")
        self.assertIn('#!date=2026-10-02', meta)
        meta, *_ = converter.parse_qx("#!name=x\n#!date=2026-10-02 13:57:49\n#!update = 2026-01-01\n^https://t url reject-dict\nhostname = t")
        self.assertEqual([m for m in meta if 'date' in m], ['#!date=2026-10-02 13:57:49'])
        for name in converter.SOURCES:
            output = (converter.ROOT / f'Module/AdBlock/{name}.sgmodule').read_text()
            if name == 'FanQieNovel':
                import re
                source = (converter.ROOT / 'upstreams/FanQieNovel.plugin').read_text()
                expected = [m.strip() for m in re.findall(r'^#!date=(.*)$', source, re.M) if m.strip()]
                self.assertEqual(re.findall(r'^#!date=(.*)$', output, re.M), expected)
            else:
                self.assertRegex(output, r'(?m)^#!date=\S')


if __name__ == '__main__':
    unittest.main()
