// Amap jq-to-JavaScript port. Original logic: 可莉 and upstream contributors.
// Generated from pinned jq snapshots by scripts/convert_loon.py.
// No network requests: Surge downloads and caches this script through script-path.
(function () {
  "use strict";
  const spec = __AMAP_SPEC__;
  const removed = {};
  const obj = v => v !== null && typeof v === "object" && !Array.isArray(v);
  const has = (v, k) => Object.prototype.hasOwnProperty.call(v, k);
  function get(v, path) {
    for (const k of path) {
      if (v == null) return null;
      if (!obj(v)) throw new Error("Unexpected JSON path shape");
      v = has(v, k) ? v[k] : null;
    }
    return v;
  }
  function update(v, path, f) {
    const value = f(get(v, path));
    if (value === removed) {
      const parent = get(v, path.slice(0, -1));
      if (obj(parent)) delete parent[path[path.length - 1]];
      return v;
    }
    if (v == null) v = {};
    let p = v;
    for (const k of path.slice(0, -1)) {
      if (!obj(p)) throw new Error("Unexpected JSON path shape");
      if (p[k] == null) p[k] = {};
      p = p[k];
    }
    if (!obj(p)) throw new Error("Unexpected JSON path shape");
    p[path[path.length - 1]] = value;
    return v;
  }
  function drop(v, keys) { for (const k of keys) delete v[k]; return v; }
  function parse(raw) {
    if (typeof raw !== "string") throw new Error("Expected a JSON string");
    return JSON.parse(raw);
  }
  function optional(raw) { try { return parse(raw); } catch (_) { return null; } }
  function updatable(body) {
    function at(key, f, guarded) {
      const path = ["data", key, "value"];
      if (guarded && typeof get(body, path) !== "string") return;
      body = update(body, path, f);
    }
    function inner(key, f, guarded, invalidDeletes) {
      at(key, raw => {
        let value;
        try { value = parse(raw); } catch (_) { return invalidDeletes ? removed : raw; }
        return obj(value) ? f(value, raw) : raw;
      }, guarded);
    }
    for (const key of ["sportsGroupConfig", "sportsRouteConfig"])
      inner(key, (v, raw) => has(v, "group_banner") ? JSON.stringify(drop(v, ["group_banner"])) : raw, true, false);
    inner("his_input_tip", v => {
      drop(v, ["channel_zhitiao"]);
      v.his_recommend_bangdan = 0;
      v = update(v, ["nearby_hotword", "search_detail"], () => 0);
      return JSON.stringify(v);
    }, false, true);
    inner("navi_end", (v, raw) => has(v, "operator_btns") ? JSON.stringify(drop(v, ["operator_btns"])) : raw, true, false);
    inner("engine_render", v => JSON.stringify(drop(v, ["can_show_advert", "advert_note_num"])), true, false);
    inner("detail_config", v => {
      drop(v, ["shelf_coupon_refresh"]);
      v.isGoodsShelfPerfV2 = 0; v.NearbySearchOptimization = 0;
      v = update(v, ["poiDetailScreenCacheConfig", "secondScreenAnchorModule"], () => "");
      v = update(v, ["poiDetailScreenCacheOtherConfig", "secondScreenAnchorModule"], () => "");
      return JSON.stringify(v);
    }, false, true);
    inner("amap_basemap_config", v => JSON.stringify(drop(v, spec.basemap)), true, false);
    inner("navi_cloud", v => {
      drop(v, spec.navigation);
      v.end_auto_foot_explore = 0; v.ExtremelyRecommendCount = 0;
      return JSON.stringify(v);
    }, false, true);
    at("taxi", raw => {
      let v;
      try { v = parse(raw); } catch (_) { return removed; }
      if (v === null) return "null";
      if (!obj(v)) return raw;
      drop(v, spec.taxi);
      for (const k of ["recommend_point_optimization", "recommend_point_service_overview", "end_point_optimization", "hitch_way_point_nav_default"]) v[k] = 0;
      return JSON.stringify(v);
    });
    inner("poi_folder_modules", (v, raw) => {
      const before = JSON.stringify(v);
      for (const k of ["folder_modules", "newFolderModules"])
        if (Array.isArray(v[k])) v[k] = v[k].filter(x => spec.shelf.includes(x));
      return JSON.stringify(v) === before ? raw : JSON.stringify(v);
    }, true, false);
    inner("favorites_info", v => { v.nearby_picture_on = 0; v.nearby_picture_distance = 0; return JSON.stringify(v); }, false, true);
    inner("container_isolation", v => { v.nearby_feed_poi_card_v2_multi_img = 0; return JSON.stringify(v); }, false, true);
    inner("nore_rec", v => { v.recommend = 0; return JSON.stringify(v); }, false, true);
    inner("engine_eyrie", v => JSON.stringify(drop(v, ["poi_area_bubble"])), false, true);
    inner("WIA", (v, raw) => has(v, "orgGuideVideoConfig") ? JSON.stringify(drop(v, ["orgGuideVideoConfig"])) : raw, true, false);
    return body;
  }
  function detail(body) {
    const data = get(body, ["data"]);
    if (!obj(data)) return body;
    const keep = x => typeof x === "string" && spec.detail.includes(x);
    const refs = a => Array.isArray(a) ? a.filter(x => typeof x !== "string" || keep(x)) : a;
    if (obj(data.regions)) for (const k of Object.keys(data.regions)) data.regions[k] = refs(data.regions[k]);
    if (obj(data.modules)) for (const k of Object.keys(data.modules)) if (!keep(k)) delete data.modules[k];
    function guarded(path, type, f) {
      // jq's at() guard treats intermediate scalars as a missing path.
      let v = data;
      for (const k of path) v = obj(v) && has(v, k) ? v[k] : null;
      if ((type === "array" && Array.isArray(v)) || (type === "object" && obj(v))) update(data, path, f);
    }
    guarded(["meta", "half_hidden_modules"], "array", refs);
    guarded(["modules", "baseInfo", "data", "user"], "object", v => drop(v, ["userLocRgeo", "homeInfo", "companyInfo"]));
    guarded(["modules", "anchor", "data", "items"], "array", a => a.filter(x => obj(x) && Array.isArray(x.anchor) && x.anchor.some(keep)));
    guarded(["modules", "poiDetailCommonConfig", "data", "swipeUpPanelConfig", "swipeUpPanelTextList"], "array",
      a => a.filter(x => !obj(x) || !Array.isArray(x.modulesMap) || x.modulesMap.some(keep)));
    return body;
  }
  try {
    const url = $request.url;
    let body = JSON.parse($response.body);
    if (/^https:\/\/m5\.amap\.com\/ws\/shield\/frogserver\/aocs\/updatable\/1\?/i.test(url)) body = updatable(body);
    else if (/^https:\/\/info\.amap\.com\/ws\/shield\/search\/poi\/detail\?/i.test(url)) body = detail(body);
    else { $done({}); return; }
    $done({ body: JSON.stringify(body) });
  } catch (e) {
    console.log("[FKIKelee Amap] Kept original response: " + e.message);
    $done({});
  }
})();
