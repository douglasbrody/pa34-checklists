# Builds ../airports-us.js: the runways of every open US airport, for the taxi keypad.
# Source: OurAirports (public domain) - https://davidmegginson.github.io/ourairports-data/
#   python3 tools/build_runways.py airports.csv runways.csv airports-us.js
# Then bump VERSION in sw.js so installed iPads pick up the new file.
import csv, json, re, sys

airports_csv, runways_csv, out = sys.argv[1:4]
KEEP_TYPES = {'small_airport', 'medium_airport', 'large_airport'}
RWY = re.compile(r'^0*(\d{1,2})([LCR]?)$')   # "06L" -> ("6", "L"); skips H1, 18W, N, etc.

idents = {}
with open(airports_csv, newline='', encoding='utf-8') as f:
    for a in csv.DictReader(f):
        if a['iso_country'] == 'US' and a['type'] in KEEP_TYPES:
            idents[a['ident']] = a.get('icao_code') or a.get('gps_code') or a['ident']

runways = {}
with open(runways_csv, newline='', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        ident = r['airport_ident']
        if ident not in idents or r['closed'] == '1':
            continue
        le, he = RWY.match(r['le_ident'] or ''), RWY.match(r['he_ident'] or '')
        if not le or not he:
            continue
        ends = sorted([le.groups(), he.groups()], key=lambda g: int(g[0]))
        pair = ends[0][0] + ends[0][1] + '/' + ends[1][0] + ends[1][1]
        key = idents[ident]
        if pair not in runways.setdefault(key, []):
            runways[key].append(pair)

for k in runways:
    runways[k].sort(key=lambda p: (int(re.match(r'\d+', p).group()), p))
with open(out, 'w', encoding='utf-8') as f:
    f.write('// Runways of open US airports, from OurAirports (public domain). Built by tools/build_runways.py.\n')
    f.write('const AIRPORT_RUNWAYS = ')
    json.dump(runways, f, separators=(',', ':'), sort_keys=True)
    f.write(';\n')
print(len(runways), 'airports')
