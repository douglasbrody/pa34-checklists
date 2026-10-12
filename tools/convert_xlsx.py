# Regenerates ../defaults.js from the PA-34 checklist spreadsheet:
#   python3 tools/convert_xlsx.py "PA-34-200_Checklist.xlsx" defaults.js
# Then bump VERSION in sw.js so installed iPads pick up the change.
import zipfile, re, sys, json, xml.etree.ElementTree as ET
src, out = sys.argv[1], sys.argv[2]
ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
z=zipfile.ZipFile(src)
ss=[''.join(t.text or '' for t in si.iter('{%s}t'%ns['m'])) for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',ns)]
st=ET.fromstring(z.read('xl/styles.xml'))
fills=st.find('m:fills',ns).findall('m:fill',ns)
def fillc(i):
    pf=fills[i].find('m:patternFill',ns)
    if pf is None or pf.get('patternType') in (None,'none'): return ''
    fg=pf.find('m:fgColor',ns); return (fg.get('rgb') or 't'+fg.get('theme','')) if fg is not None else ''
xfs=st.find('m:cellXfs',ns).findall('m:xf',ns)
wb=ET.fromstring(z.read('xl/workbook.xml'))
rmap={r.get('Id'):r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}

GROUP_BY_SHEET={'Outside and Prestart':'Preflight','Engine Start Taxi Runup':'Start & Taxi','Basic Flight':'Flight',
  'After Landing and Shutdown':'After Landing','Emergencies 1':'Emergency','Emergencies 2':'Emergency','Emergencies 3':'Emergency'}
GROUP_COLOR={'Preflight':'#4a4f57','Start & Taxi':'#1e5bd8','Flight':'#138a4a','After Landing':'#6b3fc7','Emergency':'#c62828','Briefings':'#0f7f8a'}
TITLES={
 'PREFLIGHT INSPECTION — AIRPLANE STATUS':'Airplane Status','PREFLIGHT INSPECTION — INSIDE COCKPIT':'Inside Cockpit',
 'PREFLIGHT INSPECTION — RIGHT WING':'Right Wing','PREFLIGHT INSPECTION — RIGHT ENGINE NACELLE':'Right Engine Nacelle',
 'PREFLIGHT INSPECTION — NOSE SECTION':'Nose Section','PREFLIGHT INSPECTION — LEFT ENGINE NACELLE':'Left Engine Nacelle',
 'PREFLIGHT INSPECTION — LEFT WING':'Left Wing','PREFLIGHT INSPECTION — EMPENNAGE':'Empennage',
 'BEFORE STARTING ENGINE':'Before Starting Engine','STARTING ENGINE':'Starting Engine','BEFORE TAXI':'Before Taxi','TAXI':'Taxi',
 'ENGINE RUN-UP':'Engine Run-up','BEFORE TAKEOFF':'Before Takeoff','TAKEOFF':'Takeoff',"CLIMB CHECK (500' AGL)":"Climb Check (500' AGL)",
 "CRUISE CLIMB (ABOVE 1000' AGL)":"Cruise Climb (above 1000' AGL)",'CRUISE':'Cruise','DESCENT':'Descent','APPROACH / GUMPS':'Approach / GUMPS',
 'GO AROUND':'Go Around','AFTER LANDING CHECK':'After Landing','ENGINE SHUT-DOWN':'Engine Shut-down',
 'ENGINE FAILURE (FEATHERING PROCEDURE) — MEMORY ITEMS':'Engine Failure — Memory Items',
 "ACTUAL ENGINE FAILURE / IF ALTITUDE PERMITS (3'500')":"Engine Failure — If Altitude Permits (3,500')",
 "FEATHERING PROCEDURE / IF ENGINE DOESN'T START":"Feathering Procedure",
 'AIR START / UNFEATHERING PROCEDURES':'Air Start / Unfeathering','EMERGENCY DESCENT':'Emergency Descent',
 'ENGINE FAILURE DURING TAKEOFF (100 MPH OR BELOW)':'Engine Failure on Takeoff — 100 MPH or Below',
 'ENGINE FAILURE DURING TAKEOFF (100 MPH OR ABOVE)':'Engine Failure on Takeoff — 100 MPH or Above',
 'ENGINE FAILURE DURING CLIMB (BELOW 80 MPH)':'Engine Failure in Climb — Below 80 MPH',
 'ENGINE FAILURE DURING CLIMB (ABOVE 80 MPH)':'Engine Failure in Climb — Above 80 MPH',
 'FUEL MANAGEMENT DURING SINGLE-ENGINE OPERATION':'Single-Engine Fuel Management',
 'SINGLE-ENGINE LANDING':'Single-Engine Landing','SINGLE-ENGINE GO AROUND':'Single-Engine Go Around',
 'MANUAL EXTENSION OF LANDING GEAR':'Manual Gear Extension','LANDING GEAR UNSAFE WARNINGS':'Gear Unsafe Warnings',
 'GEAR-UP LANDING':'Gear-Up Landing','OVERVOLTAGE LIGHTS (BOTH) ILLUMINATE':'Overvoltage Lights — Both',
 'OVERVOLTAGE LIGHT (ONE) ILLUMINATES':'Overvoltage Light — One',
 'ALTERNATOR OFF LINE — WEAK BATTERY OR EXCESSIVE RESTART CRANKING':'Alternator Off Line — Weak Battery',
 'LOSS OF OUTPUT FROM ONE ALTERNATOR':'Loss of One Alternator','VACUUM SYSTEM FAILURES':'Vacuum Failure',
 'PITOT STATIC SYSTEM MALFUNCTION':'Pitot Static Malfunction','OPEN DOOR':'Open Door',
 'ENGINE FIRE ON THE GROUND':'Engine Fire — On the Ground','ENGINE FIRE IN FLIGHT':'Engine Fire — In Flight',
 'PROPELLER OVERSPEED':'Propeller Overspeed'}
# Emergency tiles are ordered so the engine-failure flows chain together with the Next tile.
EMER_ORDER=['Engine Failure — Memory Items',"Engine Failure — If Altitude Permits (3,500')",'Feathering Procedure','Air Start / Unfeathering',
 'Engine Failure on Takeoff — 100 MPH or Below','Engine Failure on Takeoff — 100 MPH or Above','Engine Failure in Climb — Below 80 MPH',
 'Engine Failure in Climb — Above 80 MPH','Single-Engine Fuel Management','Single-Engine Landing','Single-Engine Go Around',
 'Engine Fire — In Flight','Engine Fire — On the Ground','Emergency Descent','Propeller Overspeed','Manual Gear Extension',
 'Gear Unsafe Warnings','Gear-Up Landing','Overvoltage Lights — Both','Overvoltage Light — One','Alternator Off Line — Weak Battery',
 'Loss of One Alternator','Vacuum Failure','Pitot Static Malfunction','Open Door']

lists=[]
for s in wb.find('m:sheets',ns):
    name=s.get('name'); group=GROUP_BY_SHEET.get(name)
    if not group: continue
    tgt='xl/'+rmap[s.get('{%s}id'%ns['r'])].lstrip('/').removeprefix('xl/')
    sh=ET.fromstring(z.read(tgt))
    cells={}
    for c in sh.iter('{%s}c'%ns['m']):
        v=c.find('m:v',ns)
        if v is None: continue
        val=ss[int(v.text)] if c.get('t')=='s' else v.text
        cells[c.get('r')]=(val, fillc(int(xfs[int(c.get('s',0))].get('fillId',0))))
    maxr=max(int(re.sub(r'\D','',k)) for k in cells)
    for lc,rc in (('B','C'),('H','I')):
        cur=None
        for r in range(1,maxr+1):
            if lc+str(r) not in cells: continue
            raw,fill=cells[lc+str(r)]; resp=cells.get(rc+str(r),(None,''))[0]
            txt=re.sub(r'\s+',' ',raw).strip()
            if fill in ('t3','FFC00000'):
                title=TITLES[txt]
                g='Start & Taxi' if title=='Before Starting Engine' else group
                cur={'title':title,'group':g,'lines':[]}; lists.append(cur); continue
            if raw.startswith('  ') and not resp:   # wrapped continuation of previous note
                cur['lines'][-1]+=' '+txt; continue
            txt=re.sub(r'\s*\(memory\)','',txt)
            if fill=='FFF2F2F2': cur['lines'].append('# '+txt)
            elif resp:
                line=f"{txt} ... {re.sub(r'\s+',' ',resp).strip()}"
                cur['lines'].append(('* ' if fill=='FFFFFF00' else '')+line)
            elif re.match(r'(WARNING|NOTE)\b',txt): cur['lines'].append('! '+txt)
            else: cur['lines'].append(txt)

# Emergency Descent appears twice (Emergencies 1 and 3); keep the first, which includes the demo speed.
seen=set(); dedup=[]
for l in lists:
    k=(l['group'],l['title'])
    if k in seen: continue
    seen.add(k); dedup.append(l)
lists=dedup
emer=sorted([l for l in lists if l['group']=='Emergency'], key=lambda l: EMER_ORDER.index(l['title']))
normal=[l for l in lists if l['group']!='Emergency']

PAX="""# S — Seat belts & shoulder harness
Fasten / unfasten ... DEMONSTRATE
Worn for ... TAXI, TAKEOFF, LANDING — AND KEEP ON
Front seats ... SHOULDER HARNESS (INERTIA REEL)
Empty seats ... BELTS SNUGLY FASTENED
# A — Air vents & Action in an emergency
Overhead fresh-air vents ... TWIST RIM: CW LESS · CCW MORE
In an emergency I will tell you what is happening and what to do. Stay belted until the airplane has stopped.
# F — Fire extinguisher & Follow instructions
Fire extinguisher ... SEAT BEHIND PILOT
Smoking ... NONE
# E — Exits & Equipment
Exits ... FRONT CABIN DOOR · REAR DOOR (L)
Latches ... UPPER + SIDE — SHOW BOTH
Upper latch ... ENGAGED BEFORE FLIGHT
Right front seat ... CATCH ON TOP — SLIDES FWD
Door opens in flight ... NOISY, NOT DANGEROUS — WE RETURN & LAND
Evacuation ... UNLATCH WHEN TOLD, EXIT, MOVE WELL AWAY
Headsets / intercom ... VOLUME & MIC CHECK
Baggage ... SECURED — NOTHING HEAVY ON SHELF
# T — Traffic & Talking
Traffic ... POINT IT OUT — CLOCK POSITION
Quiet cockpit ... TAXI · TAKEOFF · LANDING · ATC
Controls, switches, pedals ... HANDS AND FEET CLEAR
Expect ... STALL HORN · GEAR HORN · SIMULATED ENGINE FAILURES
A propeller may be feathered (stopped) on purpose at altitude. The airplane is designed to fly on one engine.
# Y — Your questions
Feeling unwell or worried? ... TELL ME ANY TIME
Questions? ... BEFORE WE START ENGINES"""

CREW="""# Today
Runway / length ... ____ / ____ FT
Density altitude ... ____ FT
Takeoff weight (max 4,200) ... ____ LB
Takeoff distance over 50 ft ... ____ FT
Accelerate-stop distance ... ____ FT
Single-engine rate of climb ... ____ FPM
Single-engine service ceiling ... ____ FT
# Speeds (MPH CAS)
Vr (short: 75 flaps 0° · 70 flaps 25°) ... 80–85
Vx / Vy ... 90 / 105
Vmc — red radial ... 80
Vyse — blue radial ... 105
# If an engine fails
On the runway, below 100 MPH ... CLOSE BOTH — STOP
Airborne, gear down, runway left ... CLOSE BOTH — LAND
Airborne below Vmc 80 ... REDUCE GOOD ENG. · NOSE DOWN
Gear up ... CONTROL · CONFIGURE · CLIMB
# Gear up — memory items
Airspeed ... 105 MPH (BLUE LINE)
Mixtures / props / throttles ... FULL FORWARD
Flaps / gear · fuel pumps ... UP · ON
Identify · verify ... DEAD FOOT · RETARD THROTTLE
Prop — inop engine ... FEATHER
Bank ... 5° TOWARD GOOD ENGINE
Checklist ... AT 400 FT AGL
Cannot climb ... HOLD 105 — LAND AHEAD
Simulated failures ... THROTTLE ONLY, SLOWLY"""

out_lists=[]
def add(title, group, text): out_lists.append({'title':title,'group':group,'color':GROUP_COLOR[group],'text':text})
for l in normal:
    add(l['title'], l['group'], '\n'.join(l['lines']))
    if l['title']=='Before Starting Engine': add('Passenger Briefing','Start & Taxi',PAX)
    if l['title']=='Before Takeoff': add('Crew Takeoff Briefing','Start & Taxi',CREW)
for l in emer: add(l['title'], 'Emergency', '\n'.join(l['lines']))
open(out,'w').write('// Generated from "PA-34-200_Checklist v2026 10 12.xlsx". Edit in the app, or regenerate.\nconst DEFAULTS = '+json.dumps(out_lists,ensure_ascii=False,indent=1)+';\n')
for l in out_lists: print(f"{l['group']:14} {l['title']:50} {len([x for x in l['text'].splitlines() if x.strip()])} lines")
