# Builds ../airports-us.js: the runways (pair:length_ft) of every open US airport, for the taxi keypad
# and the takeoff distance available.
# Source: OurAirports (public domain) - https://davidmegginson.github.io/ourairports-data/
#   python3 tools/build_runways.py airports.csv runways.csv airport-frequencies.csv airports-us.js
# Then bump VERSION in sw.js so installed iPads pick up the new file.
import csv, json, re, sys

airports_csv, runways_csv, freqs_csv, out = sys.argv[1:5]
KEEP_TYPES = {'small_airport', 'medium_airport', 'large_airport'}
RWY = re.compile(r'^0*(\d{1,2})([LCR]?)$')   # "06L" -> ("6", "L"); skips H1, 18W, N, etc.

idents, info = {}, {}
with open(airports_csv, newline='', encoding='utf-8') as f:
    for a in csv.DictReader(f):
        if a['iso_country'] == 'US' and a['type'] in KEEP_TYPES:
            idents[a['ident']] = a.get('icao_code') or a.get('gps_code') or a['ident']
            info[a['ident']] = a

runways, paved = {}, set()
PAVED = re.compile(r'(?i)^(asp|asph|con|conc|pem|bit|paved|ac)')
with open(runways_csv, newline='', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        ident = r['airport_ident']
        if ident not in idents or r['closed'] == '1':
            continue
        if PAVED.match(r['surface'] or '') and r['length_ft'] and float(r['length_ft']) >= 2000:
            paved.add(ident)
        le, he = RWY.match(r['le_ident'] or ''), RWY.match(r['he_ident'] or '')
        if not le or not he:
            continue
        ends = sorted([le.groups(), he.groups()], key=lambda g: int(g[0]))
        pair = ends[0][0] + ends[0][1] + '/' + ends[1][0] + ends[1][1]
        length = int(float(r['length_ft'])) if r['length_ft'] else 0
        key = idents[ident]
        entry = pair + (':' + str(length) if length else '')   # "6/24:4677" (feet)
        if not any(e.split(':')[0] == pair for e in runways.setdefault(key, [])):
            runways[key].append(entry)

# Weather broadcast for each airport: ATIS if it has one, else AWOS / ASOS.
WX_PREF = ['ATIS', 'D-ATIS', 'AWOS', 'ASOS', 'AWOS-3', 'AWOS-3P', 'AWOS-3PT', 'AWOS-1', 'AWOS-2', 'ASOS/AWOS']
weather, has_wx = {}, set()
with open(freqs_csv, newline='', encoding='utf-8') as f:
    for q in csv.DictReader(f):
        ident = q['airport_ident']; kind = (q['type'] or '').upper()
        if ident not in idents or kind not in WX_PREF or not q['frequency_mhz']:
            continue
        mhz = ('%.3f' % float(q['frequency_mhz'])).rstrip('0')
        mhz = mhz + '0' if mhz.endswith('.') else mhz            # 123 -> 123.0, 124.075 stays
        label = 'ATIS' if 'ATIS' in kind else 'ASOS' if kind == 'ASOS' else 'AWOS'
        key = idents[ident]
        has_wx.add(ident)
        rank = WX_PREF.index(kind)
        if key not in weather or rank < weather[key][0]:
            weather[key] = (rank, label, [mhz])
        elif rank == weather[key][0] and mhz not in weather[key][2]:
            weather[key][2].append(mhz)          # e.g. separate arrival / departure ATIS

for k in runways:
    runways[k].sort(key=lambda p: (int(re.match(r'\d+', p).group()), p))
with open(out, 'w', encoding='utf-8') as f:
    f.write('// Runways of open US airports, from OurAirports (public domain). Built by tools/build_runways.py.\n')
    f.write('const AIRPORT_RUNWAYS = ')
    json.dump(runways, f, separators=(',', ':'), sort_keys=True)
    f.write(';\nconst AIRPORT_WX = ')
    # up to two frequencies, voice-band (118-137 MHz) first, VOR-broadcast ATIS after
    wx = {k: v[1] + ' ' + ' / '.join(sorted(v[2], key=lambda m: (not 118 <= float(m) < 137, float(m)))[:2]) for k, v in weather.items()}
    json.dump(wx, f, separators=(',', ':'), sort_keys=True)
    # Positions for the "nearest airport" buttons: airports with a weather frequency, a paved
    # runway of 2,000 ft or more, or a medium/large airport (keeps private grass strips out).
    pos = {idents[i]: [round(float(info[i]['latitude_deg']), 3), round(float(info[i]['longitude_deg']), 3)]
           for i in idents if idents[i] in runways and (i in paved or i in has_wx or info[i]['type'] != 'small_airport')
           and info[i]['latitude_deg'] and info[i]['longitude_deg']}
    f.write(';\nconst AIRPORT_POS = ')
    json.dump(pos, f, separators=(',', ':'), sort_keys=True)
    f.write(';\n')
print(len(runways), 'airports')
