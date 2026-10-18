// PERFCHART: reads digitized POH performance charts and draws the reading path (red lines) on the chart image.
// ES2018, no dependencies. One global object.
//
// CHART SCHEMA (all curve points are in CHART UNITS, not pixels):
// {
//   id: '8-5', page: '8-5', title: 'Takeoff distance over 50 ft obstacle', conditions: 'Flaps 0°, ... (as printed)',
//   kind: 'distance' | 'climb',
//   img: 'charts/8-5.jpg', w: <image width px>, h: <image height px>,
//   unit: 'ft' (distance) | 'fpm' (climb),
//   factor: (optional) multiplier applied to the raw reading so the chart reproduces the POH's printed example
//           exactly or errs to the safe side (>1 for distances, <1 for climb rates); factorNote explains it
//   example: { oatF, pa, weight, wind, answer }            // distance kind, as printed on the chart
//            { da, weight, answer, speed }                 // climb kind
//   panels (distance kind):
//     temp:   { cal, x:[°F min, °F max], y:[out min, out max],
//               curves: [{ pa: 0, pts: [[°F, out], ...] }, { pa: 2000, pts: [...] }, ...] }   // pressure-altitude curves
//     weight: { cal, x:[lb min, lb max], y:[...], ref: <lb where the guide lines start, e.g. 4200>,
//               guides: [[[lb, out], ...], ...] }          // each guide line, from ref toward lighter weights
//     wind:   { cal, x:[MPH min, MPH max] (negative = tailwind, only if the chart has tailwind lines), y:[...], ref: 0,
//               guides: [[[mph, out], ...], ...] }
//   panels (cruise kind = true airspeed, range kind): main: { cal, x:[MPH or statute miles], y:[DA], lines: [{ power: 65,
//               reserve: true|false (range only), pts: [[x, DA], ...] }], limits: [{ label, pts }] (cruise: full-throttle lines) }
//   panels (climb kind):
//     main:  { cal, x:[fpm min, fpm max], y:[DA min, DA max], lines: [{ weight: 4200, pts: [[fpm, DA], ...] }, ...] }
//     speed: (optional) { cal, x:[MPH min, MPH max], y:[DA min, DA max], lines: [{ weight: 4200 (or omitted), pts: [[mph, DA], ...] }] }
//   cal: calibration points [[ux, uy, px, py], ...] (at least 3, ideally 4+ grid intersections spread over the panel):
//        unit coordinates (ux, uy) and the matching image pixel (px, py). An affine fit maps units <-> pixels, which
//        absorbs the slight rotation / shear of the scan.
// }
//
// SAFETY RULES (distance charts: longer is the safe side; climb charts: lower is the safe side)
// - Between two guide lines the reading keeps its proportion between them (as the POH examples are drawn).
// - Beyond the outermost guide line the reading is extended, and the longest of three extensions is used
//   (straight-line from the two nearest guides, proportional to the nearest guide, parallel to the nearest guide).
//   Never longer than with no correction at all. More than EXTEND_MAX guide spacings above the top line: no answer.
// - A guide line that runs off the bottom of the chart is taken to continue along the bottom edge (safe side).
//   A guide line that just stops short is continued like its neighbour (the higher of parallel / proportional).
// - An answer below the bottom of the scale is given as the bottom of the scale; above the top: no answer.
// - Colder than the chart, lower pressure altitude, lighter weight or more headwind than the chart: read at the
//   chart's edge (safe side). Hotter, higher, heavier, or any tailwind the chart has no lines for: no answer.
var PERFCHART = (function () {
  'use strict';
  var EXTEND_MAX = 1.5, EXTEND_NOTE = 0.5, W_TOL = 0.01;
  function solve3(A, b) {   // 3x3 linear solve (Cramer)
    function det(m) { return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]); }
    var D = det(A), out = [];
    for (var k = 0; k < 3; k++) { var M = A.map(function (r, i) { return r.map(function (v, j) { return j === k ? b[i] : v; }); }); out.push(det(M) / D); }
    return out;
  }
  // least-squares affine: px = a*ux + b*uy + c, py = d*ux + e*uy + f
  function fit(cal) {
    var S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bx = [0, 0, 0], by = [0, 0, 0];
    cal.forEach(function (p) {
      var v = [p[0], p[1], 1];
      for (var i = 0; i < 3; i++) { for (var j = 0; j < 3; j++) S[i][j] += v[i] * v[j]; bx[i] += v[i] * p[2]; by[i] += v[i] * p[3]; }
    });
    var X = solve3(S, bx), Y = solve3(S, by);
    return { a: X[0], b: X[1], c: X[2], d: Y[0], e: Y[1], f: Y[2] };
  }
  function tf(panel) { if (!panel._T) panel._T = fit(panel.cal); return panel._T; }
  function toPx(panel, ux, uy) { var T = tf(panel); return [T.a * ux + T.b * uy + T.c, T.d * ux + T.e * uy + T.f]; }
  function calError(panel) {   // worst calibration residual in pixels
    return Math.max.apply(null, panel.cal.map(function (p) { var q = toPx(panel, p[0], p[1]); return Math.hypot(q[0] - p[2], q[1] - p[3]); }));
  }
  var otherEnd = function (panel, ref) { return Math.abs(ref - panel.x[0]) < Math.abs(ref - panel.x[1]) ? panel.x[1] : panel.x[0]; };
  var num = function (v) { return typeof v === 'number' && isFinite(v); };
  var lo = function (r) { return Math.min(r[0], r[1]); }, hi = function (r) { return Math.max(r[0], r[1]); };
  // y on a polyline at x (points in any x order); null outside its x range
  function yAt(pts, x) {
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], l = Math.min(a[0], b[0]), h = Math.max(a[0], b[0]);
      if (x >= l - 1e-9 && x <= h + 1e-9) return a[0] === b[0] ? Math.max(a[1], b[1]) : a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
    }
    return null;
  }
  // x on a polyline at y (for climb lines, which are given as [fpm, DA]); null outside its y range
  function xAt(pts, y) { return yAt(pts.map(function (p) { return [p[1], p[0]]; }), y); }

  // A guide line of a weight or wind panel: where it ends, and whether it ran off the bottom of the chart.
  function guide(panel, pts) {
    var xRef = panel.ref, a = pts[0], b = pts[pts.length - 1];
    var far = Math.abs(a[0] - xRef) > Math.abs(b[0] - xRef) ? a : b, floor = lo(panel.y);
    return { pts: pts, xRef: xRef, y0: yAt(pts, xRef), far: far[0], yFar: far[1], floor: floor, onFloor: Math.abs(far[1] - floor) <= 0.01 * (hi(panel.y) - floor) };
  }
  // y of a guide line at x. Past the end of a line that ran off the bottom: the bottom edge (the real line is lower).
  // Past the end of a line that just stops short: continued like its neighbour (the higher of parallel / proportional).
  function gy(g, x) {
    var y = yAt(g.pts, x);
    if (y !== null || (x - g.far) * (g.far - g.xRef) <= 0) return y;
    if (g.onFloor) return g.floor;
    if (!g.ext) return null;
    var yn = gy(g.ext, x), yne = gy(g.ext, g.far);
    if (yn === null || yne === null) return null;
    return Math.max(g.yFar + yn - yne, yne > 0 ? g.yFar * yn / yne : -Infinity);
  }
  // Follow the guide lines from (ref, y0) to x. s = how far outside the guide lines, in guide spacings (0 = between).
  function through(G, y0, x, xRef) {
    if (G.length < 2) return null;
    var i = 0;
    while (i < G.length - 2 && y0 > G[i + 1].y0) i++;
    var A = G[i], B = G[i + 1], t = (y0 - A.y0) / (B.y0 - A.y0);
    var s = t < 0 ? -t : t > 1 ? t - 1 : 0, N = t < 0 ? A : B;
    function at(xx) {
      var ya = gy(A, xx), yb = gy(B, xx);
      if (ya === null || yb === null) return null;
      var y = ya + t * (yb - ya);
      if (s > 0) {   // outside the lines: the longest of straight-line, proportional and parallel extension ...
        var yn = gy(N, xx);
        y = Math.max(y, yn * y0 / N.y0, y0 + yn - N.y0);
        if (yn <= N.y0) y = Math.min(y, y0);   // ... but never longer than with no correction (lighter / more headwind is never longer)
      }
      return y;
    }
    var y = at(x);
    if (y === null) return null;
    var path = [];
    for (var k = 0; k <= 24; k++) { var xx = xRef + (x - xRef) * k / 24, yy = at(xx); if (yy !== null) path.push([xx, yy]); }
    return { y: y, path: path, s: s, above: t > 1 };
  }
  function follow(panel, y0, x) {
    var xRef = panel.ref, xEnd = otherEnd(panel, xRef), span = Math.abs(panel.x[1] - panel.x[0]);
    if (Math.abs(x - xRef) < 1e-9) return { y: y0, path: [[xRef, y0]], s: 0 };   // no correction to apply
    var all = panel.guides.map(function (pts) { return guide(panel, pts); }).filter(function (g) { return g.y0 !== null; });
    all.sort(function (p, q) { return p.y0 - q.y0; });
    var reach = function (g) { return Math.abs(g.far - xRef); };
    all.forEach(function (g, i) {   // a line that stops short of the chart edge (not at the bottom) borrows its neighbour's shape
      if (g.onFloor || Math.abs(g.far - xEnd) <= 0.01 * span) return;
      for (var d = 1; d < all.length && !g.ext; d++) [all[i - d], all[i + d]].forEach(function (n) { if (!g.ext && n && reach(n) > reach(g) + 1e-9) g.ext = n; });
    });
    var r = through(all, y0, x, xRef);
    if (r === null) r = through(all.filter(function (g) { return gy(g, x) !== null; }), y0, x, xRef);   // last resort: only the lines that reach x
    return r;
  }
  var tick = function (panel) { return lo(panel.y) + 0.04 * (hi(panel.y) - lo(panel.y)); };   // an input mark is at least this tall
  function fail(r, note) { r.outOfRange = true; r.value = null; r.raw = null; r.notes.push(note); return r; }

  // DISTANCE charts: temperature -> pressure altitude -> weight -> wind -> distance
  function readDistance(c, inp) {
    var P = c.panels, T = P.temp, W = P.weight, V = P.wind, notes = [];
    var r = { chart: c.id, value: null, raw: null, notes: notes, outOfRange: false, segs: [] };
    if (!inp || !num(inp.oatF) || !num(inp.pa) || !num(inp.weight) || !(inp.wind === undefined || inp.wind === null || num(inp.wind))) return fail(r, 'missing or invalid input');
    var oat = inp.oatF;
    if (oat > hi(T.x) + 1e-9) return fail(r, 'temperature above the chart (' + hi(T.x) + '\u00a0°F)');
    if (oat < lo(T.x)) { notes.push('colder than the chart: read at ' + lo(T.x) + ' °F (safe side)'); oat = lo(T.x); }
    var curves = T.curves.slice().sort(function (a, b) { return a.pa - b.pa; });
    var pa = inp.pa;
    if (pa > curves[curves.length - 1].pa + 1e-9) return fail(r, 'pressure altitude above the chart (' + curves[curves.length - 1].pa + ' ft)');
    if (pa < curves[0].pa) { notes.push('pressure altitude below the chart: read at ' + curves[0].pa + ' ft (safe side)'); pa = curves[0].pa; }
    var i = 0; while (i < curves.length - 2 && pa > curves[i + 1].pa) i++;
    var cb = curves[i + 1] || curves[i], ya = yAt(curves[i].pts, oat), yb = yAt(cb.pts, oat);
    if (ya === null || yb === null) {
      var gone = ya === null ? curves[i] : cb, end = gone.pts.reduce(function (m, q) { return q[0] > m ? q[0] : m; }, -Infinity);
      return fail(r, 'the ' + gone.pa + ' ft line leaves the top of the chart above ' + Math.floor(end) + ' °F: no answer' + (cb !== curves[i] ? ' between ' + curves[i].pa + ' and ' + cb.pa + ' ft' : '') + ' at this temperature');
    }
    var t = cb === curves[i] ? 0 : (pa - curves[i].pa) / (cb.pa - curves[i].pa);
    var y1 = ya + t * (yb - ya);
    // weight: heavier than the chart = no answer; lighter than the chart = read at the lightest charted weight
    var wMin = lo(W.x), wMax = Math.max(hi(W.x), W.ref), wt = inp.weight;
    if (wt > wMax + W_TOL) return fail(r, 'weight above the chart (' + wMax + ' lb)');
    if (wt > wMax) wt = wMax;
    if (wt < wMin) { notes.push('lighter than the chart: read at ' + wMin + ' lb (safe side)'); wt = wMin; }
    var fw = follow(W, y1, wt);
    if (!fw) return fail(r, 'the weight guide lines do not cover this reading');
    if (fw.s > EXTEND_MAX && fw.above) return fail(r, 'too far above the weight guide lines');
    if (fw.s > EXTEND_NOTE) notes.push('weight guide lines extended (safe side)');
    var wy = fw.y, wFloor = lo(W.y), atFloor = false;
    if (wy > hi(W.y) + 1e-9) return fail(r, 'above the top of the chart');
    if (wy <= wFloor + 1e-6) { wy = wFloor; atFloor = true; }
    fw.path = fw.path.map(function (p) { return [p[0], Math.max(p[1], wFloor)]; });   // the drawing never leaves the chart
    // wind: headwind beyond the chart = use the chart's largest headwind; tailwind is never extrapolated
    var vMin = lo(V.x), vMax = hi(V.x), wind = inp.wind || 0;
    if (wind < vMin - 1e-9) return fail(r, vMin >= 0 ? 'tailwind: this chart has no tailwind lines' : 'tailwind beyond the chart');
    if (wind > vMax) { notes.push('headwind above the chart: read at ' + vMax + ' MPH (safe side)'); wind = vMax; }
    var fv = follow(V, wy, wind);
    if (!fv) return fail(r, 'the wind guide lines do not cover this reading');
    if (fv.s > EXTEND_MAX && fv.above) return fail(r, 'too far above the wind guide lines');
    if (fv.s > EXTEND_NOTE) notes.push('wind guide lines extended (safe side)');
    var vy = fv.y, vFloor = lo(V.y);
    if (vy > hi(V.y) + 1e-9) return fail(r, 'above the top of the chart');
    if (vy <= vFloor + 1e-6) { vy = vFloor; atFloor = true; }
    fv.path = fv.path.map(function (p) { return [p[0], Math.max(p[1], vFloor)]; });
    if (atFloor) notes.push('at the bottom of the chart (' + vFloor + ' ft): no further credit (safe side)');
    r.chartValue = vy;
    r.raw = vy * (c.factor > 1 ? c.factor : 1);
    r.value = Math.ceil(r.raw / 10 - 1e-9) * 10;   // distances rounded up
    r.inputs = { oatF: inp.oatF, pa: inp.pa, weight: inp.weight, wind: inp.wind || 0, usedOatF: oat, usedPa: pa, usedWeight: wt, usedWind: wind };
    // drawing path (units per panel) — the lines a pilot draws by hand
    r.segs = [
      { panel: 'temp', kind: 'input', pts: [[oat, T.y[0]], [oat, y1]] },                              // temperature
      { panel: 'temp', kind: 'path', pts: [[oat, y1], [T.x[1], y1]] },                                // pressure altitude
      { bridge: [['temp', T.x[1], y1], ['weight', W.ref, y1]] },
      { panel: 'weight', kind: 'path', pts: fw.path },                                                // weight guide
      { panel: 'weight', kind: 'input', pts: [[wt, W.y[0]], [wt, Math.max(wy, tick(W))]] },
      { panel: 'weight', kind: 'path', pts: [[wt, wy], [otherEnd(W, W.ref), wy]] },
      { bridge: [['weight', otherEnd(W, W.ref), wy], ['wind', V.ref, wy]] },
      { panel: 'wind', kind: 'path', pts: fv.path },                                                  // wind guide
      { panel: 'wind', kind: 'input', pts: [[wind, V.y[0]], [wind, Math.max(vy, tick(V))]] },
      { panel: 'wind', kind: 'path', pts: [[wind, vy], [otherEnd(V, V.ref), vy]] }                    // to the scale
    ];
    r.answerAt = ['wind', otherEnd(V, V.ref), vy];
    r.mid = { y1: y1, wy: wy, vy: vy };   // the values between panels, for the labels
    return r;
  }

  // CLIMB charts: density altitude + weight -> rate of climb (and best-rate speed).
  // Interpolates between the two weight lines that bracket the weight; null where either has run off the chart.
  function rocAt(main, da, weight) {
    var L = main.lines.slice().sort(function (a, b) { return a.weight - b.weight; });
    if (L.length === 1) return xAt(L[0].pts, da);
    for (var k = 0; k < L.length; k++) if (Math.abs(L[k].weight - weight) < 0.5) return xAt(L[k].pts, da);
    var i = 0; while (i < L.length - 2 && weight > L[i + 1].weight) i++;
    var a = xAt(L[i].pts, da), b = xAt(L[i + 1].pts, da);
    if (a === null || b === null) return null;
    return a + (b - a) * (weight - L[i].weight) / (L[i + 1].weight - L[i].weight);
  }
  // a climb line that ends on the low-rate (left) edge of the chart: above that altitude it cannot climb
  function endsLow(main, l) {
    var top = l.pts.reduce(function (m, p) { return p[1] > m[1] ? p : m; }, l.pts[0]);
    return Math.abs(top[0] - lo(main.x)) <= 0.01 * (hi(main.x) - lo(main.x)) ? top[1] : null;
  }
  function climbWeight(M, w, notes) {
    var ws = M.lines.map(function (l) { return l.weight; }), wMin = Math.min.apply(null, ws), wMax = Math.max.apply(null, ws);
    if (w > wMax + W_TOL) return null;
    if (w > wMax) return wMax;
    if (w < wMin) { if (notes) notes.push('lighter than the chart: read at ' + wMin + ' lb (safe side)'); return wMin; }
    return w;
  }
  function readClimb(c, inp) {
    var M = c.panels.main, notes = [], r = { chart: c.id, value: null, raw: null, notes: notes, outOfRange: false, segs: [] };
    if (!inp || !num(inp.da) || !num(inp.weight)) return fail(r, 'missing or invalid input');
    var wt = climbWeight(M, inp.weight, notes);
    if (wt === null) return fail(r, 'weight above the chart');
    var da = inp.da;
    if (da < lo(M.y)) { notes.push('density altitude below the chart: read at ' + lo(M.y) + ' ft (safe side)'); da = lo(M.y); }
    r.inputs = { da: inp.da, weight: inp.weight, usedDa: da, usedWeight: wt };
    var x = rocAt(M, da, wt);
    if (x === null) {
      // the weight lines have run off the low-rate edge: no climb if the lighter of the two is also at or below zero there
      var L = M.lines.slice().sort(function (a, b) { return a.weight - b.weight; }), j = 0;
      while (j < L.length - 2 && wt > L[j + 1].weight) j++;
      var light = L[j], lv = xAt(light.pts, da), le = endsLow(M, light);
      var allLow = M.lines.every(function (l) { var e = endsLow(M, l); return e !== null && da > e; });
      if (allLow || (lv !== null && lv <= 0) || (lv === null && le !== null && da > le)) {
        r.noClimb = true; fail(r, 'cannot climb at this density altitude and weight');
        if (da <= hi(M.y)) r.segs = [{ panel: 'main', kind: 'input', pts: [[M.x[0], da], [M.x[1], da]] }];   // the altitude line, meeting no weight line
        return r;
      }
      return fail(r, da > hi(M.y) ? 'density altitude above the chart' : 'beyond the end of the chart lines');
    }
    r.chartValue = x;
    r.raw = x * (c.factor > 0 && c.factor < 1 ? c.factor : 1);
    r.value = Math.floor(r.raw / 10 + 1e-9) * 10;   // climb rates rounded down
    if (r.raw <= 0) { r.noClimb = true; notes.push('cannot climb at this density altitude and weight'); }
    r.segs = [
      { panel: 'main', kind: 'input', pts: [[M.x[0], da], [x, da]] },     // density altitude across to the weight line
      { panel: 'main', kind: 'path', pts: [[x, da], [x, M.y[0]]] }       // down to the rate-of-climb scale
    ];
    r.answerAt = ['main', x, M.y[0]];
    var S = c.panels.speed;
    if (S && S.lines && S.lines.length) {
      var sl = S.lines.length > 1 && S.lines[0].weight ? S.lines.slice().sort(function (a, b) { return a.weight - b.weight; }) : [S.lines[0]];
      var sx;
      if (sl.length > 1) {
        var sw = Math.max(sl[0].weight, Math.min(sl[sl.length - 1].weight, wt));
        var j = 0; while (j < sl.length - 2 && sw > sl[j + 1].weight) j++;
        var p = xAt(sl[j].pts, da), q = xAt(sl[j + 1].pts, da);
        sx = (p === null || q === null) ? null : p + (q - p) * (sw - sl[j].weight) / (sl[j + 1].weight - sl[j].weight);
      } else sx = xAt(sl[0].pts, da);
      if (sx !== null) {
        r.speed = Math.round(sx);
        r.segs.push({ panel: 'main', kind: 'path', pts: [[x, da], [M.x[1], da]] });
        r.segs.push({ bridge: [['main', M.x[1], da], ['speed', S.x[0], da]] });
        r.segs.push({ panel: 'speed', kind: 'path', pts: [[S.x[0], da], [sx, da], [sx, S.y[0]]] });
      }
    }
    return r;
  }
  // service ceiling: the density altitude where the rate of climb falls to `fpm` (50 for single-engine)
  function ceiling(c, weight, fpm) {
    var M = c.panels.main;
    if (!num(weight) || !num(fpm)) return { value: null, note: 'missing or invalid input' };
    var wt = climbWeight(M, weight, null);
    if (wt === null) return { value: null, note: 'weight above the chart' };
    var wNote = wt > weight ? 'lighter than the chart: read at ' + wt + ' lb (safe side)' : '';
    var k = c.factor > 0 && c.factor < 1 ? c.factor : 1;
    var f = function (da) { var x = rocAt(M, da, wt); return x === null ? null : x * k - fpm; };
    var a = lo(M.y), b = hi(M.y), step = (b - a) / 400, first = null, last = null;
    for (var d = a; d <= b + 1e-9; d += step) { var v = f(d); if (v !== null) { if (first === null) first = d; last = d; if (v <= 0) break; } }
    if (first === null) return { value: null, note: 'outside the chart' };
    var flo = f(first), fhi = f(last);
    if (flo <= 0) return { value: null, note: 'below ' + fpm + ' fpm at the bottom of the chart' };
    if (fhi > 0) return { value: Math.floor(last / 100) * 100, note: last < b - step / 2 ? 'the chart lines end here: the ceiling is higher' : 'above the top of the chart', atTop: true };
    var l = Math.max(first, last - step), h = last;
    for (var n = 0; n < 60; n++) { var m = (l + h) / 2, fm = f(m); if (fm !== null && fm > 0) l = m; else h = m; }
    return { value: Math.floor(l / 100) * 100, raw: l, usedWeight: wt, note: wNote };   // ceilings rounded down
  }
  // CRUISE (true airspeed) and RANGE charts: one line per power setting (and, on the range chart, with / without the
  // reserve); read across at the density altitude. A power is not available above the top of its line (full throttle).
  function readPower(c, inp) {
    var M = c.panels.main, notes = [], r = { chart: c.id, value: null, raw: null, notes: notes, outOfRange: false, segs: [] };
    if (!inp || !num(inp.da) || !num(inp.power)) return fail(r, 'missing or invalid input');
    var ln = M.lines.filter(function (l) { return +l.power === +inp.power && !!l.reserve === !!inp.reserve; })[0];
    if (!ln) return fail(r, 'no ' + inp.power + ' % line on this chart');
    var pts = ln.pts.slice().sort(function (a, b) { return a[1] - b[1]; }), da = inp.da, bottom = pts[0][1], top = pts[pts.length - 1][1], x;
    r.inputs = { da: inp.da, power: +inp.power, reserve: !!inp.reserve, usedDa: Math.max(da, lo(M.y)) };   // drawn no lower than the chart's bottom
    if (da > top + 1e-6) {
      r.unavailable = true; fail(r, inp.power + ' % is not available above ' + th(Math.floor(top / 100) * 100) + ' ft density altitude (full throttle)');
      if (da <= hi(M.y)) r.segs = [{ panel: 'main', kind: 'input', pts: [[M.x[0], da], [M.x[1], da]] }];   // the altitude line, above the end of the power line
      return r;
    }
    var startsHigh = bottom > lo(M.y) + 1, leaves = 'the ' + inp.power + ' % line starts at ' + th(Math.round(bottom / 100) * 100) + ' ft (' + Math.round(pts[0][0]) + (c.kind === 'range' ? ' mi' : ' MPH') + ')';
    if (da < bottom) {   // below where the line starts: its lowest (straight) segment carried on, at most 2,000 ft
      if (bottom - da > 2000 || pts.length < 2) { r.below = true; return fail(r, startsHigh ? leaves + ': off the chart below that' : 'density altitude below the chart'); }
      var a = pts[0], b = pts[1]; x = a[0] + (b[0] - a[0]) * (da - a[1]) / (b[1] - a[1]);
      notes.push('line carried below ' + (bottom > 0 ? th(bottom) + '\u00a0ft' : 'sea level'));
    } else x = xAt(pts, da);
    if (x === null) return fail(r, 'outside the chart');
    if (x < lo(M.x) - 1e-9) { r.below = true; return fail(r, startsHigh ? leaves + ': off the chart below that' : 'below the chart (under ' + lo(M.x) + (c.kind === 'range' ? ' mi' : ' MPH') + ')'); }
    r.chartValue = x; r.raw = x;
    r.value = c.kind === 'range' ? Math.floor(x / 10 + 1e-9) * 10 : Math.floor(x + 1e-9);   // rounded down
    var dd = r.inputs.usedDa;
    r.segs = [{ panel: 'main', kind: 'input', pts: [[M.x[0], dd], [x, dd]] }, { panel: 'main', kind: 'path', pts: [[x, dd], [x, M.y[0]]] }];
    r.answerAt = ['main', x, M.y[0]];
    return r;
  }
  function read(c, inp) { if (!c || !c.panels) return { chart: c && c.id, value: null, raw: null, notes: ['not a chart'], outOfRange: true, segs: [] }; return c.kind === 'climb' ? readClimb(c, inp) : c.kind === 'cruise' || c.kind === 'range' ? readPower(c, inp) : readDistance(c, inp); }

  // ---------- Drawing ----------
  // The reading is drawn either over the POH scan (overlay, image pixels) or on a clean redraw of the same traced
  // lines (draw). Both use the same reading path and the same labels; only the units -> drawing mapping differs.
  var th = function (v) { var n = Math.round(v); return (n < 0 ? '−' : '') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
  var xmlText = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var f1 = function (v) { return (+v).toFixed(1); };
  var degC = function (f) { var c = Math.round((f - 32) / 1.8 * 10) / 10; return (c < 0 ? '−' : '') + Math.abs(c); };
  function pathSvg(c, r, map, extra) {
    var out = [];
    var pt = function (pn, ux, uy) { var q = map(pn, ux, uy); return f1(q[0]) + ',' + f1(q[1]); };
    (r.segs || []).concat(extra || []).forEach(function (s) {
      if (s.bridge) { out.push('<polyline points="' + pt(s.bridge[0][0], s.bridge[0][1], s.bridge[0][2]) + ' ' + pt(s.bridge[1][0], s.bridge[1][1], s.bridge[1][2]) + '" class="pc-path"/>'); return; }
      if (!s.pts || s.pts.length < 2) return;
      out.push('<polyline points="' + s.pts.map(function (p) { return pt(s.panel, p[0], p[1]); }).join(' ') + '" class="' + (s.kind === 'input' ? 'pc-input' : s.kind === 'ceil' ? 'pc-ceil' : 'pc-path') + '"/>');
    });
    if (r.answerAt) { var a = map(r.answerAt[0], r.answerAt[1], r.answerAt[2]); out.push('<circle cx="' + f1(a[0]) + '" cy="' + f1(a[1]) + '" r="' + f1(c._sw * 2.2) + '" class="pc-dot"/>'); }
    return out.join('');
  }
  // a red tag with a number: anchor 'start' | 'middle' | 'end' at (x, y = vertical centre), kept inside
  // [minX, maxX] and [minY, maxY] (its panel), so it never covers the axis numbers outside the panel
  function tag(x, y, text, o) {
    var fs = o.fs, w = text.length * fs * 0.6 + fs * 0.9;
    if (o.minX !== undefined && o.maxX !== undefined && w > o.maxX - o.minX) { fs *= (o.maxX - o.minX) / w; w = o.maxX - o.minX; }   // a narrow panel: a smaller tag
    var h = fs * 1.45, x0 = o.anchor === 'end' ? x - w : o.anchor === 'middle' ? x - w / 2 : x;
    if (o.minX !== undefined && x0 < o.minX) x0 = o.minX;
    if (o.maxX !== undefined && x0 + w > o.maxX) x0 = o.maxX - w;
    return { x0: x0, w: w, y: y, h: h, dir: o.dir || -1, minY: o.minY, maxY: o.maxY,
      svg: function (yy) { return '<g class="' + (o.cls || 'pc-tag') + '"><rect x="' + f1(x0) + '" y="' + f1(yy - h / 2) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + f1(h / 3) + '"/><text x="' + f1(x0 + w / 2) + '" y="' + f1(yy + fs * 0.36) + '" text-anchor="middle" font-size="' + f1(fs) + '">' + xmlText(text) + '</text></g>'; } };
  }
  // place the tags in order; a tag that would overlap one already placed moves up (or down) past it
  function resolve(tags, obstacles) {
    var placed = (obstacles || []).slice();   // printed labels inside the panels and the red altitude line: tags keep off them too
    var clampY = function (t, y) { if (t.minY !== undefined) y = Math.max(y, t.minY + t.h / 2 + 2); if (t.maxY !== undefined) y = Math.min(y, t.maxY - t.h / 2 - 2); return y; };
    var hitAt = function (t, y) { for (var i = 0; i < placed.length; i++) { var p = placed[i]; if (t.x0 < p.x0 + p.w + 3 && p.x0 < t.x0 + t.w + 3 && Math.abs(y - p.y) < (t.h + p.h) / 2 + 3) return p; } return null; };
    var search = function (t, dir) {   // walk past whatever is in the way; null if it runs into the panel edge still blocked
      var y = clampY(t, t.y);
      for (var n = 0; n < 30; n++) {
        var p = hitAt(t, y); if (!p) return y;
        var ny = clampY(t, dir < 0 ? p.y - (t.h + p.h) / 2 - 4 : p.y + (t.h + p.h) / 2 + 4);
        if (Math.abs(ny - y) < 0.5) return null; y = ny;
      }
      return null;
    };
    tags.forEach(function (t) {   // fixed tags (the inputs, placed first) only move if they would overlap each other
      var up = search(t, -1), down = search(t, 1), y0 = clampY(t, t.y);
      var best = up === null ? down : down === null ? up : (Math.abs(up - y0) <= Math.abs(down - y0) + (t.dir < 0 ? 0.5 : -0.5) ? up : down);
      t.y = best === null ? y0 : best;
      placed.push(t);
    });
    return placed.filter(function (t) { return t.svg; }).map(function (t) { return t.svg(t.y); }).join('');
  }
  // labels for the inputs, the values between panels and the answer, all inside the panels
  function labels(c, r, map, opts) {
    var P = c.panels, fs = c._fs, fixed = [], moving = [], lineBoxes = [], inp = r.inputs;
    if (!inp) return '';
    var bounds = function (pn) {
      var p = P[pn], a = map(pn, p.x[0], lo(p.y)), b = map(pn, p.x[1], hi(p.y));
      return { minX: Math.min(a[0], b[0]) + fs * 0.15, maxX: Math.max(a[0], b[0]) - fs * 0.15, minY: Math.min(a[1], b[1]), maxY: Math.max(a[1], b[1]) };
    };
    var opt = function (pn, extra) { return Object.assign(bounds(pn), { fs: fs }, extra); };
    if (c.kind !== 'climb' && c.kind !== 'cruise' && c.kind !== 'range') {   // distance charts
      var W = P.weight, V = P.wind, m = r.mid || {};
      var foot = function (pn, ux) { var q = map(pn, ux, lo(P[pn].y)); return [q[0], q[1] - fs * 1.2]; };
      var b = foot('temp', inp.usedOatF); fixed.push(tag(b[0], b[1], degC(inp.oatF) + ' °C · ' + th(inp.oatF) + ' °F', opt('temp', { anchor: 'middle' })));
      b = foot('weight', inp.usedWeight); fixed.push(tag(b[0], b[1], th(inp.weight) + ' LB', opt('weight', { anchor: 'middle' })));
      b = foot('wind', inp.usedWind); fixed.push(tag(b[0], b[1], (inp.wind < 0 ? 'TW ' : '') + (Math.round(Math.abs(inp.wind) * 10) / 10) + ' MPH', opt('wind', { anchor: 'middle' })));
      if (m.y1 !== undefined) {
        var q = map('temp', inp.usedOatF, m.y1), pa = 'PA ' + (inp.pa === 0 ? 'SL' : th(inp.pa)), bt = bounds('temp');
        moving.push(tag(q[0] - fs * 0.5, q[1] - fs * 1.1, pa, opt('temp', { anchor: q[0] - (pa.length * fs * 0.6 + fs) > bt.minX ? 'end' : 'start' })));
        if (m.wy !== undefined) { var e1 = map('weight', W.ref, m.y1); moving.push(tag(e1[0] + fs * 0.3, e1[1] - fs * 1.05, th(m.y1), opt('weight', { fs: fs * 0.82, anchor: 'start', cls: 'pc-tag pc-mid' }))); }
        if (m.vy !== undefined) { var e2 = map('wind', V.ref, m.wy); moving.push(tag(e2[0] + fs * 0.3, e2[1] - fs * 1.05, th(m.wy), opt('wind', { fs: fs * 0.82, anchor: 'start', cls: 'pc-tag pc-mid' }))); }
      }
      if (r.answerAt && r.value !== null) {   // the answer: inside the last panel, just above the end of the red line
        var a = map(r.answerAt[0], r.answerAt[1], r.answerAt[2]);
        moving.push(tag(a[0] - fs * 0.5, a[1] - fs * 1.15, th(r.value) + ' FT', opt('wind', { fs: fs * 1.15, anchor: 'end', cls: 'pc-tag pc-ans' })));
      }
    } else if (c.kind === 'cruise' || c.kind === 'range') {
      var Mp = P.main, mlp = bounds('main').minX, dp = map('main', Mp.x[0], inp.usedDa), dEndp = r.answerAt ? map('main', r.chartValue, inp.usedDa)[0] : bounds('main').maxX;
      lineBoxes.push({ x0: mlp, w: dEndp - mlp, y: dp[1], h: c._sw * 2 });
      fixed.push(tag(mlp + fs * 0.25, dp[1] - fs * 1.05, 'DA ' + th(inp.da), opt('main', { anchor: 'start' })));
      if (r.answerAt && r.value !== null) {
        var botp = map('main', r.chartValue, lo(Mp.y)), wp = map('main', r.chartValue, inp.usedDa);
        fixed.push(tag(botp[0], botp[1] - fs * 1.2, th(r.value) + (c.kind === 'range' ? ' SM' : ' MPH'), opt('main', { fs: fs * 1.1, anchor: 'middle', cls: 'pc-tag pc-ans' })));
        moving.push(tag(wp[0] + fs * 0.6, wp[1] - fs * 1.1, inp.power + '%' + (inp.reserve ? ' · RESERVE' : ''), opt('main', { anchor: 'start' })));
      }
    } else {
      var M = P.main, S = P.speed, ml = bounds('main').minX;
      var d = map('main', M.x[0], inp.usedDa), dEnd = r.answerAt ? map('main', r.chartValue, inp.usedDa)[0] : bounds('main').maxX;
      lineBoxes.push({ x0: ml, w: dEnd - ml, y: d[1], h: c._sw * 2 });   // the red altitude line
      fixed.push(tag(ml + fs * 0.25, d[1] - fs * 1.05, 'DA ' + th(inp.da), opt('main', { anchor: 'start' })));
      if (r.noClimb && !r.answerAt) { var nb = map('main', (M.x[0] + M.x[1]) / 2, lo(M.y)); fixed.push(tag(nb[0], nb[1] - fs * 1.2, 'NO CLIMB', opt('main', { fs: fs * 1.1, anchor: 'middle', cls: 'pc-tag pc-ans' }))); }
      if (r.answerAt && r.value !== null) {
        var bot = map('main', r.chartValue, lo(M.y)), w = map('main', r.chartValue, inp.usedDa);
        fixed.push(tag(bot[0], bot[1] - fs * 1.2, r.noClimb ? 'NO CLIMB' : th(r.value) + ' FPM', opt('main', { fs: fs * 1.1, anchor: 'middle', cls: 'pc-tag pc-ans' })));
        if (S && r.speed) { var sp = map('speed', r.speed, lo(S.y)); fixed.push(tag(sp[0], sp[1] - fs * 1.2, r.speed + ' MPH', opt('speed', { anchor: 'middle' }))); }
        moving.push(tag(w[0] + fs * 0.6, w[1] - fs * 1.1, th(inp.weight) + ' LB', opt('main', { anchor: 'start' })));
      }
      if (opts.ceiling && opts.ceiling.raw) { var cy = map('main', M.x[0], opts.ceiling.raw); moving.push(tag(ml + fs * 0.25, cy[1] - fs * 1.05, 'SE CEILING ' + th(opts.ceiling.value), opt('main', { fs: fs * 0.9, anchor: 'start', cls: 'pc-tag pc-ceiltag' }))); }
    }
    fixed.forEach(function (t) { t.fixed = true; });
    return resolve(fixed.concat(moving), (opts._obstacles || []).concat(lineBoxes));
  }
  function ceilSegs(c, opts) {
    if (c.kind !== 'climb' || !opts.ceiling || !opts.ceiling.raw) return [];
    var M = c.panels.main, x50 = (opts.ceiling.fpm || 50) / (c.factor > 0 && c.factor < 1 ? c.factor : 1);
    return [{ panel: 'main', kind: 'ceil', pts: [[x50, lo(M.y)], [x50, opts.ceiling.raw], [M.x[0], opts.ceiling.raw]] }];
  }
  function styleSvg(sw) {
    return '<style>.pc-path,.pc-input,.pc-ceil{fill:none;stroke:#d40000;stroke-linecap:round;stroke-linejoin:round;stroke-width:' + f1(sw) + '}.pc-input{stroke-dasharray:' + f1(sw * 3) + ' ' + f1(sw * 2) + '}.pc-ceil{stroke-dasharray:0 ' + f1(sw * 2.2) + ';stroke-width:' + f1(sw * 1.3) + '}.pc-dot{fill:#d40000}' +
      '.pc-tag rect{fill:#d40000}.pc-tag text{fill:#fff;font-family:-apple-system,Helvetica,Arial,sans-serif;font-weight:800}.pc-mid rect{fill:#fff;stroke:#d40000;stroke-width:' + f1(sw * 0.6) + '}.pc-mid text{fill:#d40000}.pc-ceiltag rect{fill:#7a0000}</style>';
  }
  // SVG overlay in image pixels (viewBox = image size), red lines and labels; place it over the chart image
  function overlay(c, r, opts) {
    opts = opts || {};
    c._sw = opts.stroke || Math.max(3, c.w / 400); c._fs = c.w / 52;
    var map = function (pn, ux, uy) { return toPx(c.panels[pn], ux, uy); };
    return '<svg class="pc-svg" viewBox="0 0 ' + c.w + ' ' + c.h + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + styleSvg(c._sw) +
      pathSvg(c, r, map, ceilSegs(c, opts)) + (opts.labels === false ? '' : labels(c, r, map, opts)) + '</svg>';
  }

  // Clean redraw: the panels straightened (same sizes and places as on the POH page), the printed grid, the traced
  // pressure-altitude curves, guide lines and climb lines, and the reading. Colours come from the page (CSS variables).
  function layout(c) {
    if (c._L) return c._L;
    var P = c.panels, names = c.kind === 'climb' ? ['main', 'speed'] : c.kind === 'cruise' || c.kind === 'range' ? ['main'] : ['temp', 'weight', 'wind'], base = P[names[0]], box = {};
    names.forEach(function (n) {
      var p = P[n]; if (!p) return;
      var a = toPx(p, p.x[0], lo(p.y)), b = toPx(p, p.x[1], lo(p.y));
      box[n] = { left: Math.min(a[0], b[0]), right: Math.max(a[0], b[0]), xl: a[0] < b[0] ? p.x[0] : p.x[1], xr: a[0] < b[0] ? p.x[1] : p.x[0] };
    });
    for (var i = 1; i < names.length; i++) {   // neighbouring panels share a border
      var A = box[names[i - 1]], B = box[names[i]];
      if (A && B && Math.abs(B.left - A.right) < 60) { var mid = (A.right + B.left) / 2; A.right = mid; B.left = mid; }
    }
    var y0 = lo(base.y), y1 = hi(base.y), bottom = toPx(base, base.x[0], y0)[1], top = toPx(base, base.x[0], y1)[1];
    var L = { names: names.filter(function (n) { return box[n]; }), box: box, bottom: bottom, top: top };
    L.Y = function (uy) { return bottom - (uy - y0) / (y1 - y0) * (bottom - top); };
    L.map = function (pn, ux, uy) { var bx = box[pn]; return [bx.left + (ux - bx.xl) / (bx.xr - bx.xl) * (bx.right - bx.left), L.Y(uy)]; };
    c._L = L; return L;
  }
  function steps(a, b, st) { var out = []; for (var v = Math.ceil(a / st - 1e-9) * st; v <= b + 1e-9; v += st) out.push(Math.round(v * 1e6) / 1e6); return out; }
  function grid(c, pn) {
    var p = c.panels[pn], xa = lo(p.x), xb = hi(p.x), ya = lo(c.kind === 'climb' ? c.panels.main.y : p.y), yb = hi(p.y), span = yb - ya, g = {};
    if (pn === 'temp') { g.xs = steps(xa, xb, 10); g.xl = steps(xa, xb, 20); }
    else if (pn === 'weight') { g.xs = steps(xa, xb, 200); g.xl = g.xs.filter(function (w) { return Math.abs((p.ref - w) % 400) < 1e-6; }); }
    else if (pn === 'wind') { g.xs = steps(xa, xb, 5); g.xl = steps(xa, xb, 10); }
    else if (pn === 'speed') { g.xs = steps(xa, xb, 2); g.xl = steps(xa, xb, 10); }
    else if (c.kind === 'cruise') { g.xs = steps(xa, xb, 5); g.xl = steps(xa, xb, 10); }
    else if (c.kind === 'range') { g.xs = steps(xa, xb, 50); g.xl = steps(xa, xb, 100); }
    else { var st = xb - xa > 1000 ? 100 : 50; g.xs = steps(xa, xb, st); g.xl = steps(xa, xb, st * 2); }
    var ys = span > 6000 ? 1000 : span > 1500 ? 200 : span > 1000 ? 100 : 50, yl = span > 6000 ? 2000 : span > 1500 ? 400 : span > 1000 ? 200 : 100;
    g.ys = steps(ya, yb, ys); g.yl = g.ys.filter(function (v) { return Math.abs((v - ya) % yl) < 1e-6; });
    return g;
  }
  var TITLE = { temp: 'OUTSIDE AIR TEMPERATURE — °F', weight: 'GROSS WEIGHT — LB', wind: 'HEADWIND — MPH', main: 'RATE OF CLIMB — FT/MIN', speed: 'BEST RATE — MPH' };
  function draw(c, r, opts) {
    opts = opts || {};
    var L = layout(c), P = c.panels, map = L.map, out = [], obstacles = [], fs = c.w / 52, climb = c.kind !== 'distance';   // DA up the left side
    c._sw = Math.max(3, c.w / 330); c._fs = fs;
    var line = function (pts, pn, cls) { return '<polyline class="' + cls + '" points="' + pts.map(function (q) { var v = map(pn, q[0], q[1]); return f1(v[0]) + ',' + f1(v[1]); }).join(' ') + '"/>'; };
    var text = function (x, y, t, cls, anchor, rot) { return '<text class="' + cls + '" x="' + f1(x) + '" y="' + f1(y) + '" text-anchor="' + (anchor || 'middle') + '"' + (rot ? ' transform="rotate(' + rot + ' ' + f1(x) + ' ' + f1(y) + ')"' : '') + ' font-size="' + f1(fs * (cls === 'pc-ttl' ? 0.82 : 0.9)) + '">' + xmlText(t) + '</text>'; };
    var minX = Infinity, maxX = -Infinity;
    L.names.forEach(function (pn) {
      var p = P[pn], bx = L.box[pn], g = grid(c, pn), yTop = L.Y(hi(p.y)), yBot = L.Y(lo(climb ? P.main.y : p.y));
      minX = Math.min(minX, bx.left); maxX = Math.max(maxX, bx.right);
      var cid = 'pcc-' + String(c.id).replace(/\W/g, '') + '-' + pn, inner = [];
      out.push('<clipPath id="' + cid + '"><rect x="' + f1(bx.left) + '" y="' + f1(yTop) + '" width="' + f1(bx.right - bx.left) + '" height="' + f1(yBot - yTop) + '"/></clipPath>');
      out.push('<rect class="pc-bg" x="' + f1(bx.left) + '" y="' + f1(yTop) + '" width="' + f1(bx.right - bx.left) + '" height="' + f1(yBot - yTop) + '"/>');
      g.xs.forEach(function (v) { var x = map(pn, v, 0)[0]; out.push('<line class="pc-grid" x1="' + f1(x) + '" y1="' + f1(yTop) + '" x2="' + f1(x) + '" y2="' + f1(yBot) + '"/>'); });
      g.ys.forEach(function (v) { if (v > hi(p.y) + 1e-9) return; var y = L.Y(v); out.push('<line class="pc-grid" x1="' + f1(bx.left) + '" y1="' + f1(y) + '" x2="' + f1(bx.right) + '" y2="' + f1(y) + '"/>'); });
      var last = pn === L.names[L.names.length - 1], first = pn === L.names[0];
      g.xl.forEach(function (v) {
        var x = map(pn, v, 0)[0];
        if (climb ? (!first && Math.abs(x - bx.left) < fs * 1.5) : (!last && Math.abs(x - bx.right) < fs)) return;   // one number per shared border, as printed
        out.push(text(x, yBot + fs * 1.05, th(v), 'pc-tick'));
      });
      out.push(text((bx.left + bx.right) / 2, yBot + fs * (climb ? 2.25 : 3.3), pn === 'main' && c.kind === 'cruise' ? 'TRUE AIRSPEED — MPH' : pn === 'main' && c.kind === 'range' ? 'RANGE — STATUTE MILES' : TITLE[pn], 'pc-ttl'));
      if (pn === 'temp') [-10, 0, 10, 20, 30].forEach(function (cv) {   // °C under the °F scale: a tick every 10 °C, a number every 20 °C (room for them)
        var x = map(pn, cv * 1.8 + 32, 0)[0]; out.push('<line class="pc-frame" x1="' + f1(x) + '" y1="' + f1(yBot) + '" x2="' + f1(x) + '" y2="' + f1(yBot + fs * 0.3) + '"/>');
        if (cv % 20) out.push(text(x, yBot + fs * 2.1, (cv < 0 ? '−' : '') + Math.abs(cv) + ' °C', 'pc-tick pc-c'));
      });
      if (pn === 'temp') {
        p.curves.forEach(function (cv) {
          inner.push(line(cv.pts, pn, 'pc-curve'));
          var y0 = yAt(cv.pts, lo(p.x)); if (y0 !== null) out.push(text(bx.left - fs * 0.35, L.Y(y0) + fs * 0.32, cv.pa === 0 ? 'SL' : th(cv.pa), 'pc-tick pc-strong', 'end'));
        });
        out.push(text(bx.left - fs * 0.35, yTop - fs * 0.5, 'PA (FT)', 'pc-ttl', 'end'));
      }
      if (pn === 'weight' || pn === 'wind') p.guides.forEach(function (gd) { inner.push(line(gd, pn, 'pc-guide')); });
      var rotLabel = function (pts, frac, lab, cls, below) {   // a label along a line, kept clear of by the tags
        var k = Math.min(pts.length - 2, Math.max(0, Math.floor(pts.length * frac))), a = map(pn, pts[k][0], pts[k][1]), b = map(pn, pts[k + 1][0], pts[k + 1][1]);
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
        var rad = ang * Math.PI / 180, nx = Math.sin(rad), ny = -Math.cos(rad), d = (below ? -1 : 1) * fs * 0.62;   // off the line, square to it
        var lx = mx + nx * d, ly = my + ny * d; out.push(text(lx, ly + fs * 0.32, lab, cls + ' pc-lab', 'middle', ang.toFixed(1)));
        var tw = lab.length * fs * 0.52, bw = Math.abs(tw * Math.cos(rad)) + Math.abs(fs * Math.sin(rad)), bh = Math.abs(tw * Math.sin(rad)) + Math.abs(fs * Math.cos(rad));
        obstacles.push({ x0: lx - bw / 2, w: bw, y: ly, h: bh });
      };
      if (pn === 'main' && (c.kind === 'cruise' || c.kind === 'range')) {
        var srt = function (pts) { return pts.slice().sort(function (a, b) { return a[1] - b[1]; }); };
        (p.limits || []).forEach(function (l) { inner.push(line(srt(l.pts), pn, 'pc-guide pc-dash')); rotLabel(srt(l.pts), 0.45, l.label, 'pc-tick', true); });
        p.lines.forEach(function (l) {
          var pts = srt(l.pts); inner.push(line(pts, pn, 'pc-curve' + (l.reserve ? ' pc-dash' : '')));
          rotLabel(pts, l.reserve ? 0.75 : 0.55, l.power + '%' + (l.reserve ? ' RES' : ''), 'pc-tick pc-strong', false);
        });
        g.yl.forEach(function (v) { if (v <= hi(p.y)) out.push(text(bx.left - fs * 0.35, L.Y(v) + (v > lo(p.y) ? fs * 0.32 : -fs * 0.15), th(v), 'pc-tick', 'end')); });
        out.push(text(bx.left - fs * 3.3, (yTop + yBot) / 2, 'DENSITY ALTITUDE — FT', 'pc-ttl', 'middle', -90));
      }
      if (pn === 'main' && c.kind === 'climb') {
        p.lines.forEach(function (l) {
          inner.push(line(l.pts, pn, 'pc-curve'));
          var k = Math.floor(l.pts.length * 0.45), a = map(pn, l.pts[k][0], l.pts[k][1]), b = map(pn, l.pts[Math.min(k + 1, l.pts.length - 1)][0], l.pts[Math.min(k + 1, l.pts.length - 1)][1]);
          var ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
          out.push(text(a[0], a[1] - fs * 0.45, th(l.weight) + ' LB', 'pc-tick pc-strong', 'middle', ang.toFixed(1)));
          var tw = (th(l.weight) + ' LB').length * fs * 0.52, rad = ang * Math.PI / 180, bw = Math.abs(tw * Math.cos(rad)) + Math.abs(fs * Math.sin(rad)), bh = Math.abs(tw * Math.sin(rad)) + Math.abs(fs * Math.cos(rad));
          obstacles.push({ x0: a[0] - bw / 2, w: bw, y: a[1] - fs * 0.45 - fs * 0.3, h: bh });
        });
        (p.extraLines || []).forEach(function (l) {
          inner.push(line(l.pts, pn, 'pc-guide pc-dash'));
          var k = Math.floor(l.pts.length * 0.62), a = map(pn, l.pts[k][0], l.pts[k][1]), b = map(pn, l.pts[k + 1][0], l.pts[k + 1][1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
          if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
          var lab = 'GEAR DOWN ' + th(l.weight) + ' LB'; out.push(text(a[0], a[1] + fs * 1.0, lab, 'pc-tick', 'middle', ang.toFixed(1)));
          var tw = lab.length * fs * 0.52, rad = ang * Math.PI / 180, bw = Math.abs(tw * Math.cos(rad)) + Math.abs(fs * Math.sin(rad)), bh = Math.abs(tw * Math.sin(rad)) + Math.abs(fs * Math.cos(rad));
          obstacles.push({ x0: a[0] - bw / 2, w: bw, y: a[1] + fs * 0.7, h: bh });
        });
        g.yl.forEach(function (v) { if (v <= hi(p.y)) out.push(text(bx.left - fs * 0.35, L.Y(v) + (v > lo(p.y) ? fs * 0.32 : -fs * 0.15), th(v), 'pc-tick', 'end')); });
        out.push(text(bx.left - fs * 3.3, (yTop + yBot) / 2, 'DENSITY ALTITUDE — FT', 'pc-ttl', 'middle', -90));
      }
      if (pn === 'speed') {
        var seen = {};
        p.lines.forEach(function (l) {
          inner.push(line(l.pts, pn, 'pc-guide pc-speed'));
          var key = JSON.stringify(l.pts); if (!l.weight) return;
          seen[key] = seen[key] ? seen[key] + ' & ' + l.weight : String(l.weight);
        });
        var drop = 0;
        Object.keys(seen).forEach(function (key) {
          var pts = JSON.parse(key), t = pts.reduce(function (m, q) { return q[1] > m[1] ? q : m; }, pts[0]), lab = seen[key].split(' & ').map(th).join(' & ') + ' LB', len = lab.length * fs * 0.52;
          var e = map(pn, t[0], t[1]), y = e[1] + fs * 0.4 + drop + len, xx = map(pn, xAt(pts, L.Y.inv ? 0 : t[1]) || t[0], t[1])[0];
          out.push(text(xx + fs * 0.35, y, lab, 'pc-tick', 'start', -90)); obstacles.push({ x0: xx - fs * 0.6, w: fs * 1.2, y: y - len / 2, h: len });
          drop += len + fs * 0.8;
        });
      }
      out.push('<g clip-path="url(#' + cid + ')">' + inner.join('') + '</g>');
      out.push('<rect class="pc-frame" x="' + f1(bx.left) + '" y="' + f1(yTop) + '" width="' + f1(bx.right - bx.left) + '" height="' + f1(yBot - yTop) + '"/>');
    });
    if (!climb) {   // distance scale on the right, as printed
      var V = P.wind, gv = grid(c, 'wind'), xr = L.box.wind.right;
      gv.yl.forEach(function (v) { out.push(text(xr + fs * 0.35, L.Y(v) + (v > lo(V.y) ? fs * 0.32 : -fs * 0.15), th(v), 'pc-tick', 'start')); });   // every scale number is always shown
      out.push(text(xr - fs * 0.3, L.top - fs * 0.55, c.yTitle || 'DISTANCE — FT', 'pc-ttl', 'end'));
    }
    var x0 = minX - fs * (climb ? 4.6 : 3.4), x1 = maxX + fs * (climb ? 2.2 : 3.6), y0 = L.top - fs * 1.6, y1 = L.bottom + fs * (climb ? 3.2 : 4.2);
    return '<svg class="pc-clean" viewBox="' + [x0, y0, x1 - x0, y1 - y0].map(f1).join(' ') + '" role="img" aria-label="' + xmlText(c.title || 'POH chart') + '">' +
      '<style>.pc-bg{fill:var(--card,#fff)}.pc-grid{stroke:var(--line,#ccc);stroke-width:' + f1(c.w / 900) + '}.pc-frame{fill:none;stroke:var(--fg,#000);stroke-width:' + f1(c.w / 500) + '}' +
      '.pc-curve{fill:none;stroke:var(--fg,#000);stroke-width:' + f1(c.w / 420) + ';stroke-linejoin:round}.pc-guide{fill:none;stroke:var(--fg,#000);stroke-opacity:.5;stroke-width:' + f1(c.w / 650) + '}.pc-dash{stroke-dasharray:' + f1(c.w / 120) + ' ' + f1(c.w / 200) + '}.pc-speed{stroke-opacity:.8;stroke-width:' + f1(c.w / 520) + '}' +
      '.pc-tick,.pc-ttl{fill:var(--muted,#555);font-family:-apple-system,Helvetica,Arial,sans-serif;font-weight:650}.pc-strong{fill:var(--fg,#000);font-weight:800}.pc-c{font-style:italic}.pc-lab{paint-order:stroke;stroke:var(--card,#fff);stroke-width:' + f1(fs * 0.22) + 'px;stroke-linejoin:round}.pc-ttl{font-weight:800;letter-spacing:.02em}</style>' +
      styleSvg(c._sw) + out.join('') + pathSvg(c, r || {}, map, ceilSegs(c, opts)) + (r ? labels(c, r, map, Object.assign({}, opts, { _obstacles: obstacles })) : '') + '</svg>';
  }
  // density altitude (ft) from pressure altitude (ft) and OAT (°C): standard approximation
  function densityAltitude(pa, oatC) { return pa + 120 * (oatC - (15 - 1.98 * pa / 1000)); }
  return { read: read, readDistance: readDistance, readClimb: readClimb, ceiling: ceiling, overlay: overlay, draw: draw, layout: layout, toPx: toPx, calError: calError, densityAltitude: densityAltitude, fit: fit, yAt: yAt, xAt: xAt, rocAt: rocAt };
})();
