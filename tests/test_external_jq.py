"""Differential acceptance tests for each external jq JavaScript port."""
import copy
import importlib.util
import json
import random
import subprocess
import tempfile
import unittest
from pathlib import Path
from test_amap import RUNNER

ROOT = Path(__file__).resolve().parents[1]
JQ = ROOT / 'JS/FKIKelee/Resources/kelee/JQLang'
PORTS = ['smzdm/home_smzdm_remove_ads.jq', 'Bilibili/tab_Bilibili_remove_ads.jq',
         'Bilibili/mine_Bilibili_remove_ads.jq', 'Reddit/Reddit_remove_ads.jq']

def script(rel):
    return ROOT / 'JS/FKIKelee/Rewrite' / rel.replace('/', '-').replace('.jq', '.js')

class ExternalJQTests(unittest.TestCase):
    def compare(self, rel, bodies):
        cases = [{'url': 'https://example.com/', 'body': json.dumps(b, ensure_ascii=False)} for b in bodies]
        output = json.loads(subprocess.run(['node', '-e', RUNNER, str(script(rel))],
            input=json.dumps(cases), text=True, capture_output=True, check=True).stdout)
        for i, (case, actual) in enumerate(zip(cases, output)):
            jq = subprocess.run(['jq', '-c', '-f', str(JQ / rel)], input=case['body'], text=True, capture_output=True)
            expected = json.loads(jq.stdout) if jq.returncode == 0 and jq.stdout.strip() else bodies[i]
            with self.subTest(program=rel, index=i, body=bodies[i]):
                self.assertEqual(json.loads(actual), expected)

    def test_smzdm(self):
        content = [{'ad_campaign_id': 'ad'}, {'tag': ' '}, {'tag': ''}, {'model_type': 'ads'},
                   {'article_channel_type': 'questionnaire'}, {'article_channel_type': 'article'},
                   None, 3, 'text', [], {}, {'ad_campaign_id': 5}, {'tag': False}]
        components = [{'zz_type': k, 'zz_content': copy.deepcopy(content), 'keep': 3} for k in ['list', 'filter', 'circular_banner', 'ad', None]]
        components += [{'zz_type': 'list'}, {'zz_type': 'circular_banner', 'zz_content': {'circular_banner_option': {}, 'keep': 1}}]
        full = {'data': {'component': components, 'theme': {'ad': 1}, 'keep': 7}, 'keep': 4}
        bodies = [full, {}, None, [], 1, {'data': {'component': { 'z': {'zz_type': 'filter'}, 'a': {'zz_type': 'list'} }}}]
        for value in [None, False, 3, 'text', [], {}, components]:
            bodies.append({'data': {'component': value, 'theme': 5}})
            bodies.append({'data': {'component': [{'zz_type': 'list', 'zz_content': value}]}})
            bodies.append({'data': {'component': [value]}})
        rng = random.Random(17)
        for _ in range(50):
            bodies.append({'data': {'component': [{'zz_type': rng.choice(['list', 'filter', 'ad']), 'zz_content': rng.sample(content, 5)} for _ in range(3)]}})
        self.compare(PORTS[0], bodies)

    def test_bilibili(self):
        values = [None, False, True, 0, 1, '', 'text', [], {}, {'status': 0}, {'status': 1}, {'status': '0'}]
        bodies = [{}, None, [], 3, 'text'] + [{'data': v, 'keep': 7} for v in values]
        menus = ['sections_v2', 'ipad_sections', 'ipad_upper_sections', 'ipad_recommend_sections', 'ipad_more_sections']
        for value in values:
            data = {k: value for k in menus}
            data.update(vip=value, vip_type=0, answer=1, live_tip=1, vip_section={}, vip_section_v2={}, modular_vip_section={}, keep=7)
            bodies.append({'data': data, 'keep': 4})
        for menu in menus:
            for value in values:
                bodies.append({'data': {menu: value, 'vip': {'status': 0, 'keep': 1}}})
        for rel in PORTS[1:3]:
            self.compare(rel, bodies)

    def test_reddit(self):
        entries = [{'__typename': 'AdPost'}, {'node': {'adPayload': {}}},
                   {'node': {'cells': [{'__typename': 'AdMetadataCell'}]}},
                   {'node': {'cells': [{'isAdPost': True}, {'keep': 1}]}},
                   {'node': {'cells': [None, 7, {'isAdPost': False}]}},
                   {'isNsfw': True, 'isNsfwMediaBlocked': True, 'isNsfwContentShown': False, 'commentsPageAds': [1], 'keep': 7},
                   {'__typename': 'Post', 'node': {'adPayload': None}}, None, False, 1, 'text', []]
        bodies = entries + [{'data': {'edges': entries, 'map': {str(i): v for i, v in enumerate(entries)}}}]
        rng = random.Random(31)
        for _ in range(70):
            bodies.append({'data': {'edges': rng.sample(entries, 8), 'commentsPageAds': [1], 'nested': {'post': rng.choice(entries)}}})
        self.compare(PORTS[3], bodies)

    def test_pass_through_and_single_completion(self):
        cases = [{'url': 'https://example.com', 'body': '{invalid'}]
        for rel in PORTS:
            output = json.loads(subprocess.run(['node', '-e', RUNNER, str(script(rel))], input=json.dumps(cases), text=True, capture_output=True, check=True).stdout)
            self.assertEqual(output, ['{invalid'])

    def test_reproducibility_and_source_drift(self):
        s = importlib.util.spec_from_file_location('external_converter', ROOT / 'scripts/convert_loon.py')
        c = importlib.util.module_from_spec(s); s.loader.exec_module(c)
        with tempfile.TemporaryDirectory() as td:
            source = Path(td)
            for rel in PORTS:
                dest = source / 'Resource/kelee/JQLang' / rel
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_text((JQ / rel).read_text())
            conv = c.Converter(source)
            for rel in PORTS:
                url = 'https://raw.githubusercontent.com/fkingikelee/fkikelee/main/Resource/kelee/JQLang/' + rel
                path = conv.external_jq_script(url)
                self.assertEqual(conv.files[path], script(rel).read_text())
                dest = source / 'Resource/kelee/JQLang' / rel
                dest.write_text('. # changed source')
                with self.assertRaisesRegex(ValueError, 'review the JavaScript port'):
                    conv.external_jq_script(url)

if __name__ == '__main__':
    unittest.main()
