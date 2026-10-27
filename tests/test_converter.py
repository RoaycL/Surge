import importlib.util
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


if __name__ == '__main__':
    unittest.main()
