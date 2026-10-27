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
        source = (converter.ROOT / 'upstreams/Pinduoduo.snippet').read_text()
        outputs = converter.convert_pdd(source)
        self.assertEqual(list(outputs), ['Module/Pinduoduo.sgmodule'])
        module = outputs['Module/Pinduoduo.sgmodule']
        self.assertNotIn('[Script]', module)
        _, _, routes, _ = converter.parse_qx(source)
        jq_routes = [r for r in routes if r['action'] == 'jsonjq-response-body']
        self.assertEqual(len(jq_routes), 5)
        for route in jq_routes:
            self.assertIn('http-response-jq ' + route['pattern'] + ' ' + route['arg'], module)
        self.assertEqual(module.count('data-type=text data="{}" status-code=200'), sum(r['action'] == 'reject-dict' for r in routes))
        converter.validate(outputs)

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


if __name__ == '__main__':
    unittest.main()
