import importlib.util
import json
import re
import subprocess
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('loon_converter', ROOT / 'scripts/convert_loon.py')
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)
M = json.loads((ROOT / 'upstreams/fkikelee/manifest.json').read_text())
MODULES = {m['id']: m for m in M['modules']}

def module(name):
    return (ROOT / MODULES[name]['module']).read_text()

def jq_for(name, url, body):
    for line in module(name).splitlines():
        if not line.startswith('http-response-jq '):
            continue
        pattern, program = line[len('http-response-jq '):].split(" '", 1)
        if re.search(pattern, url):
            r = subprocess.run(['jq', '-c', program[:-1]], input=json.dumps(body), text=True, capture_output=True, check=True)
            return json.loads(r.stdout)
    raise AssertionError('No jq rule matches ' + url)

class LoonTests(unittest.TestCase):

    def test_argument_style_detection(self):
        cases = {'$argument.foo': 'object', '$argument?.foo': 'object', '$argument["foo"]': 'object',
                 '$argument["split"]("&")': 'query', '$argument.split("&")': 'query',
                 'typeof $argument=="string"?a:$argument.x': 'query', 'JSON.parse($argument)': 'json',
                 'f($argument)': 'unknown', 'x': 'none'}
        for text, style in cases.items():
            self.assertEqual(c.argument_style(text), style, text)

    def test_unknown_argument_style_with_user_parameters_fails(self):
        conv = c.Converter(ROOT)
        conv.source_sha = 'test'
        conv.styles['https://x/Resource/a.js'] = 'unknown'
        conv.adapter = lambda url: 'JS/FKIKelee/Adapters/a.js'
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / 'T.lpx'
            f.write_text('#!name=T\n[Argument]\nk = input, "1", tag=K, desc=D\n[Script]\n'
                         'cron "0 1 * * *" then script("https://x/Resource/a.js", {${k}}) with tag="t"\n')
            with self.assertRaisesRegex(ValueError, 'cannot tell how the script reads'):
                conv.convert(f)

    def test_redirect_alias_and_parameters(self):
        # Loon `as item` captures and ${param} must become $N and {{{param}}}.
        text = module('TelegramRedirect')
        self.assertIn('^https://t\\.me/\\+([A-Za-z0-9_-]+)/?$ {{{app}}}://join?invite=$1 307', text)
        self.assertNotIn('${', text)
        self.assertIn('#!arguments=app:tg', text)

    def test_upstream_date_is_preserved(self):
        for m in M['modules']:
            src = (ROOT / 'upstreams/fkikelee' / m['source']).read_text()
            date = re.search(r'^#!date=(.*)$', src, re.M)
            out = re.findall(r'^#!date=(.*)$', module(m['id']), re.M)
            self.assertEqual(out, [date[1].strip()] if date and date[1].strip() else [], m['id'])

    def test_every_source_is_accounted_for(self):
        self.assertEqual(len(MODULES), len(list((ROOT / 'upstreams/fkikelee/lpx').glob('*.lpx'))))
        self.assertEqual(len(MODULES), len(M['modules']))
        self.assertEqual({m['source'] for m in M['modules']}, {'lpx/' + p.name for p in (ROOT / 'upstreams/fkikelee/lpx').glob('*.lpx')})

    def test_url_regex_unescaping_and_flags(self):
        phase, p, flags = c.cond(c.norm('response if ${url} ~= /^https:\\\\/\\\\/api\\\\.example\\\\.com\\\\/v1\\\\?/i'))
        self.assertEqual(phase, 'response')
        self.assertEqual(p, '^https://api\\.example\\.com/v1\\?')
        self.assertEqual(flags, 'i')

    def test_quoted_and_array_json_paths(self):
        self.assertEqual(c.path('data.resp_map["/a.b/c"].items[2].name'), ['data', 'resp_map', '/a.b/c', 'items', 2, 'name'])
        with self.assertRaises(ValueError):
            c.path('data[bad]')

    def test_rooted_json_paths_and_amap_deletion(self):
        self.assertEqual(c.path('$.data.shadingWords'), ['data', 'shadingWords'])
        self.assertEqual(c.path('$["data"].items[0]'), ['data', 'items', 0])
        self.assertEqual(c.path('data["$"].value'), ['data', '$', 'value'])
        result = jq_for('Amap_remove_ads', 'https://m5.amap.com/ws/shield/scene/recommend?test=1',
                        {'data': {'shadingWords': {'ad': 1}, 'keep': 2}})
        self.assertEqual(result, {'data': {'keep': 2}})

    def test_miyoushe_deep_quoted_paths(self):
        data = {'data': {'resp_map': {'/teenager/api/info': {}, '/apihub/api/getAppConfig': {'data': {'get_app_config_response': {'config': {'is_show_teenager_mode_btn': 1, 'teenager_popup_freq_type': 1, 'keep': 3}}}}}}, 'keep': 9}
        result = jq_for('miHoYoBBS_remove_ads', 'https://bbs-api.miyoushe.com/apihub/api/getAppStartupData', data)
        self.assertNotIn('/teenager/api/info', result['data']['resp_map'])
        self.assertEqual(result['data']['resp_map']['/apihub/api/getAppConfig']['data']['get_app_config_response']['config'], {'keep': 3})
        self.assertEqual(result['keep'], 9)

    def test_json_replace_preserves_types_and_existing_null(self):
        url = 'https://bbs-api-ab.miyoushe.com/teenager/api/info'
        result = jq_for('miHoYoBBS_remove_ads', url, {'data': {'is_enabled': None, 'is_teenager': True, 'is_force': 1, 'keep': 4}})
        self.assertEqual(result, {'data': {'is_enabled': False, 'is_teenager': False, 'is_force': False, 'keep': 4}})
        self.assertEqual(jq_for('miHoYoBBS_remove_ads', url, {'keep': 1}), {'keep': 1})

    def test_all_parameters_have_declarations_and_defaults(self):
        count = 0
        for m in M['modules']:
            text = module(m['id'])
            declared = {c.key(k) for k in m['parameters']}
            self.assertLessEqual(set(re.findall('\\{\\{\\{(\\w+)\\}\\}\\}', text)), declared, m['id'])
            count += len(declared)
        self.assertGreaterEqual(count, 60)
        self.assertEqual(MODULES['IThome_remove_ads']['parameters']['removeAllBanners'], False)
        self.assertIn('App_ID', MODULES['Auto_Join_TF']['parameters'])
        self.assertIn('ScriptHubNotify', MODULES['Script-Hub']['parameters'])

    def test_proxy_routes_are_not_replaced_with_direct(self):
        m = module('Prevent_DNS_Leaks')
        self.assertNotIn(',PROXY', m)
        self.assertNotIn(',DIRECT', m)
        rules = ROOT / 'Ruleset/DNS/Prevent_DNS_Leaks.list'
        self.assertIn('dnsleaktest.com', rules.read_text())

    def test_missing_dependencies_are_visible(self):
        self.assertTrue(any(('缺失' in n for n in MODULES['EasyBike_remove_ads']['notes'])))
        self.assertNotIn('mobileconfig-gateway.js', '\n'.join((l for l in module('EasyBike_remove_ads').splitlines() if l.startswith('fk-'))))

    def test_upstream_jq_repairs(self):
        data = {'keep': {'value': 1}, 'ad': {'name': 'AI帮唱'}, 'nested': [{'ad': {'name': '游戏'}, 'keep': 7}]}
        self.assertEqual(jq_for('KuGou_remove_ads', 'https://gateway.kugou.com/ocean/v1/tab/list_v2', data), {'keep': {'value': 1}, 'nested': [{'keep': 7}]})

    def test_unsupported_conditions_and_literals_fail(self):
        with self.assertRaises(ValueError):
            c.cond('request if ${enabled} then anything')
        with self.assertRaises(ValueError):
            c.literal('execute(untrusted)')
if __name__ == '__main__':
    unittest.main()
