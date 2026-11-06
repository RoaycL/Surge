"""Compare the external Surge script against both pinned, original jq programs."""
import copy
import importlib.util
import json
import random
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'JS/FKIKelee/Rewrite/Amap_remove_ads.js'
JQ = ROOT / 'JS/FKIKelee/Resources/kelee/JQLang/Amap'
URLS = {
    'updatable': 'https://m5.amap.com/ws/shield/frogserver/aocs/updatable/1?test=1',
    'search_poi_detail': 'https://info.amap.com/ws/shield/search/poi/detail?test=1',
}
RUNNER = r'''
const fs = require('fs'), vm = require('vm');
const script = fs.readFileSync(process.argv[1], 'utf8');
const cases = JSON.parse(fs.readFileSync(0, 'utf8'));
console.log(JSON.stringify(cases.map(c => {
  let result, count = 0;
  vm.runInNewContext(script, {
    $request: {url: c.url}, $response: {body: c.body},
    $done: r => { result = r; count++; }, console: {log() {}}
  }, {timeout: 1000});
  if (count !== 1) throw Error('Expected exactly one $done');
  return result.body === undefined ? c.body : result.body;
})));
'''

def normalize(v):
    # jq and JS can serialize object keys in a different order inside JSON strings.
    if isinstance(v, dict):
        return {k: normalize(x) for k, x in v.items()}
    if isinstance(v, list):
        return [normalize(x) for x in v]
    if isinstance(v, str):
        try:
            return ('JSON string', normalize(json.loads(v)))
        except ValueError:
            pass
    return v

class AmapTests(unittest.TestCase):
    def test_converter_emits_external_script(self):
        module = (ROOT / 'Module/FKIKelee/AdBlock/Travel/Amap_remove_ads.sgmodule').read_text()
        url = 'https://raw.githubusercontent.com/RoaycL/Surge/main/JS/FKIKelee/Rewrite/Amap_remove_ads.js'
        self.assertEqual(module.count('script-path=' + url), 2)
        self.assertEqual(module.count('http-response-jq '), 14)
        self.assertNotIn('def keep_skeleton:', module)
        self.assertNotIn('def strip_group_banner:', module)
        spec = importlib.util.spec_from_file_location('amap_converter', ROOT / 'scripts/convert_loon.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        # resource() falls back to snapshots only for missing dependencies, so
        # use the mirror as a temporary source layout for reproducibility.
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            source = Path(td)
            dest = source / 'Resource/kelee/JQLang/Amap'
            dest.mkdir(parents=True)
            for p in JQ.glob('*.jq'):
                (dest / p.name).write_text(p.read_text())
            c = converter.Converter(source)
            path = c.amap_script()
            self.assertEqual(c.files[path], SCRIPT.read_text())
            (dest / 'updatable.jq').write_text('. # changed upstream')
            with self.assertRaisesRegex(ValueError, 'review the JavaScript port'):
                converter.Converter(source).amap_script()

    def compare(self, name, bodies):
        cases = [{'url': URLS[name], 'body': json.dumps(b)} for b in bodies]
        outputs = json.loads(subprocess.run(['node', '-e', RUNNER, str(SCRIPT)],
            input=json.dumps(cases), text=True, capture_output=True, check=True).stdout)
        for i, (case, output) in enumerate(zip(cases, outputs)):
            jq = subprocess.run(['jq', '-c', '-f', str(JQ / (name + '.jq'))],
                input=case['body'], text=True, capture_output=True)
            expected = json.loads(jq.stdout) if jq.returncode == 0 and jq.stdout.strip() else bodies[i]
            with self.subTest(program=name, index=i, input=bodies[i]):
                self.assertEqual(normalize(json.loads(output)), normalize(expected))

    def test_updatable_matches_original(self):
        spec = json.loads(SCRIPT.read_text().split('const spec = ', 1)[1].split(';\n', 1)[0])
        keys = ['sportsGroupConfig', 'sportsRouteConfig', 'his_input_tip', 'navi_end',
                'engine_render', 'detail_config', 'amap_basemap_config', 'navi_cloud',
                'taxi', 'poi_folder_modules', 'favorites_info', 'container_isolation',
                'nore_rec', 'engine_eyrie', 'WIA']
        def wrapped(values):
            return {'data': {k: {'value': json.dumps(v)} for k, v in values.items()}, 'keep': 42}
        values = {k: {'keep': 7} for k in keys}
        values['amap_basemap_config'].update({k: True for k in spec['basemap']})
        values['navi_cloud'].update({k: True for k in spec['navigation']})
        values['taxi'].update({k: True for k in spec['taxi']})
        values['sportsGroupConfig']['group_banner'] = {'ad': True}
        values['sportsRouteConfig']['group_banner'] = 1
        values['his_input_tip'].update(channel_zhitiao=1, nearby_hotword={'keep': 1, 'search_detail': 1})
        values['navi_end']['operator_btns'] = [1]
        values['engine_render'].update(can_show_advert=1, advert_note_num=3)
        values['detail_config'].update(shelf_coupon_refresh=1, poiDetailScreenCacheConfig={'keep': 1})
        values['poi_folder_modules'].update(folder_modules=['ad', 'evaluateVO', 7], newFolderModules=['platformCustomerCommonModule', None])
        values['engine_eyrie']['poi_area_bubble'] = 1
        values['WIA']['orgGuideVideoConfig'] = 1
        full = wrapped(values)
        bodies = [full, {}, None, [], 3, 'text', {'data': []}, {'data': None}]
        for key in keys:
            for value in [None, False, 0, [], {}, 'bad', 'null', '[]', 'false', '3', '{}']:
                b = copy.deepcopy(full); b['data'][key]['value'] = value; bodies.append(b)
            b = copy.deepcopy(full); del b['data'][key]; bodies.append(b)
        rng = random.Random(5)
        for _ in range(25):
            b = copy.deepcopy(full)
            for k in keys:
                if rng.random() < .4: b['data'][k]['value'] = rng.choice(['bad', 'null', '{}', '[]', None])
            bodies.append(b)
        self.compare('updatable', bodies)

    def test_detail_matches_original(self):
        spec = json.loads(SCRIPT.read_text().split('const spec = ', 1)[1].split(';\n', 1)[0])
        modules = {k: {'data': {'keep': 1}} for k in spec['detail']}
        modules.update(advert={'ad': 1}, baseInfo={'data': {'user': {'userLocRgeo': 1, 'homeInfo': 2, 'companyInfo': 3, 'name': 'keep'}}},
            anchor={'data': {'items': [{'anchor': ['advert']}, {'anchor': ['baseInfo', 'advert']}, {'anchor': ['hotelRooms']}, {'anchor': []}, 5]}},
            poiDetailCommonConfig={'data': {'swipeUpPanelConfig': {'swipeUpPanelTextList': [None, {'modulesMap': ['advert']}, {'modulesMap': ['hotelRooms']}, {'keep': 1}]}}})
        full = {'data': {'modules': modules, 'regions': {'a': ['advert', 'baseInfo', 3, None, {'keep': 1}]}, 'meta': {'half_hidden_modules': ['advert', 'hotelRooms', False]}}, 'keep': 42}
        bodies = [full, {}, None, 3, [], {'data': []}, {'data': None}]
        for key in ['modules', 'regions', 'meta']:
            for value in [None, [], 3, 'bad', {}]:
                b = copy.deepcopy(full); b['data'][key] = value; bodies.append(b)
        self.compare('search_poi_detail', bodies)

    def test_non_json_and_unmatched_pass_through(self):
        cases = [{'url': URLS['updatable'], 'body': '{invalid'}, {'url': 'https://example.com/', 'body': '{}'}]
        output = json.loads(subprocess.run(['node', '-e', RUNNER, str(SCRIPT)], input=json.dumps(cases), text=True, capture_output=True, check=True).stdout)
        self.assertEqual(output, [c['body'] for c in cases])

if __name__ == '__main__':
    unittest.main()
