# Regenerates ../defaults.js from the PA-34 checklist spreadsheet:
#   python3 tools/convert_xlsx.py "PA-34-200_Checklist.xlsx" defaults.js
# Then bump VERSION in sw.js so installed iPads pick up the change.
import zipfile, re, sys, os, json, xml.etree.ElementTree as ET
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
GROUP_COLOR={'Maneuvers':'#a37800','Preflight':'#4a4f57','Start & Taxi':'#1e5bd8','Flight':'#138a4a','After Landing':'#6b3fc7','Emergency':'#c62828','Briefings':'#0f7f8a'}
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
EMER_ORDER=['Engine Failure — Memory Items',
 'Engine Failure on Takeoff — 100 MPH or Below','Engine Failure on Takeoff — 100 MPH or Above','Engine Failure in Climb — Below 80 MPH',
 'Engine Failure in Climb — Above 80 MPH',"Engine Failure — If Altitude Permits (3,500')",'Feathering Procedure','Air Start / Unfeathering','Single-Engine Fuel Management','Single-Engine Landing','Single-Engine Go Around',
 'Engine Fire — In Flight','Engine Fire — On the Ground','Emergency Descent','Manual Gear Extension',
 'Gear Unsafe Warnings','Gear-Up Landing','Overvoltage Lights — Both','Overvoltage Light — One','Alternator Off Line — Weak Battery',
 'Loss of One Alternator','Propeller Overspeed','Vacuum Failure','Pitot Static Malfunction','Open Door']

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
# The spreadsheet says the left nacelle and left wing are "same as right"; write them out in full
# so they can be read without flipping pages. The left wing also carries the squat switch,
# the stall warning detectors and the pitot static mast.
by_title={l['title']:l for l in lists}

# Bring the normal checklists in line with the Avia PA-34-200 normal checklist.
# (Done before the left side is copied from the right, so both sides get the changes.)
def insert(title, anchor, new, after=True):
    ls=by_title[title]['lines']; i=ls.index(anchor)
    ls[i+1 if after else i:i+1 if after else i]=new
def replace(title, old, new):
    ls=by_title[title]['lines']; i=ls.index(old); ls[i:i+1]=new
insert('Airplane Status','VOR Accuracy every 30 days (IFR only) ... CHECK',['Radio License (international flights only) ... CHECK'],after=False)
by_title['Right Wing']['lines'].insert(0,'General Condition ... CHECKED')
by_title['Right Engine Nacelle']['lines'][0:0]=['General Condition ... CHECK','Cowling ... OPEN']
by_title['Nose Section']['lines'].insert(0,'General Condition ... CHECKED')
# Hot and flooded starts are separate (hidden) checklists, opened with buttons from Starting Engine.
by_title['Starting Engine']['lines']+=['# Repeat for right engine','-> HOT START | POH 6-3 : Hot Start','-> FLOODED START | POH 6-4 : Flooded Start']
by_title['Before Takeoff']['lines'].insert(0,'Flight Instruments ... CHECK')
insert('Cruise','Engine Instruments ... MONITOR',['Electric Fuel Pumps ... OFF (ONE AT A TIME) — CHECK FUEL FLOW'],after=False)
by_title['Cruise']['lines'].append('-> POWER TABLE | MP / RPM — POH 8-16 : Cruise Power Settings')
replace('Cruise Climb (above 1000\' AGL)','Electric Fuel Pumps ... OFF (ALT? ONE AT A TIME) — CHECK FUEL PR',['Electric Fuel Pumps ... OFF (ONE AT A TIME) — CHECK FUEL PRESSURE'])
# Before Taxi: heading indicator checked against the compass, altimeter from the ATIS, then bugs.
replace('Before Taxi','Heading Indicator ... SET TO COMPASS',['Heading Indicator ... CHECK VS. COMPASS'])
replace('Before Taxi','Altimeter ... SET TO ATIS or APT. ELEV.',['Altimeter ... SET TO ATIS','Altitude ... BUG','Heading ... BUG'])
replace('Before Taxi','Avionics ... Checked Start Screen & DB',['Avionics ... CHECK START SCREEN & DATABASE','Flight Plan ... ENTER'])
replace('Before Taxi','RAIM ... Check in System',['RAIM ... CHECK IN SYSTEM'])
# Inside Cockpit: lights and pitot heat were switched on for the walk-around check; off again before the master.
insert('Inside Cockpit','Master Switch ... OFF',['All Light Switches, Pitot Heat ... OFF'],after=False)
# Open Door: word for word as the Avia emergency checklist.
replace('Open Door','Airspeed ... SLOW TO 100 MPH',['Slow Airspeed ... 100 MPH'])
replace('Open Door','Side Latch Open ... PULL ARMREST / LATCH',['Side Latch Open ... PULL ARMREST/LATCH'])
# Single-Engine Landing (POH 3-13): the dead engine is feathered (normally already done in the engine-failure
# flow); only the flaps wait until the field is made; final at 105 MPH. Fuel lines from Avia's single-engine fuel
# management, landing. The gear line pulses, as in GUMPS.
by_title['Single-Engine Landing']['lines']=[
    'Inoperative Engine ... FEATHERED (if not already)',
    '# Operating engine',
    'Fuel Selector Operating Engine ... ON',
    'Fuel Selector INOP Engine ... OFF',
    'Electric Fuel Pump Operating Engine ... ON',
    'Mixture Control (operating engine) ... RICH',
    'Propeller Control (operating engine) ... FULL FORWARD',
    'Landing Light ... ON',
    'Seat Belts & Switches ... CHECK',
    '# Landing',
    '^ Gear ... DOWN',
    'Flaps ... NOT UNTIL CERTAIN OF FIELD (MAX 25°)',
    'Final Approach Speed ... 105 MPH (POH 3-13)',
    '-> FEATHER | if not already : Feathering Procedure',
    '-> SE GO AROUND | only if unavoidable : Single-Engine Go Around']
# Takeoff: contact the tower first.
tk=by_title['Takeoff']['lines']; tk.insert(0, tk.pop(tk.index('Contact Tower ... PATTERN / VFR / IFR')))
tk.append('-> SHORT FIELD | POH 6-7 : Short-Field Takeoff')
# v39 (pilot): line-up items first, then the tower; gear up on a positive rate.
tk[0:0]=['Mixture Controls ... RICH', 'Propeller Controls ... HIGH RPM', 'Electric Fuel Pumps ... ON', 'Landing Light ... ON']
tk[tk.index('Gear Up ... NO RWY REMAINS')]='Gear Up ... POSITIVE RATE'
# Engine fire on the ground: keep the reason (AVIA) for keeping a started engine running.
replace('Engine Fire — On the Ground','# If engine has started, continue operating. If external fire extinguishing is to be applied:',
    ['# If the engine has started, keep it running to pull the fire into the engine. If external fire extinguishing is to be applied:'])
replace('Engine Run-up','Throttle ... IDLE (650–700 RPM), Then 1000 RPM',['Throttle ... IDLE (650–700 RPM), THEN 1000 RPM'])
# The right wing has no gear limit switches (the left wing has the squat switch, added below).
by_title['Right Wing']['lines'].remove('Limit Switches ... CHECKED / NO DAMAGE')
# Wording fixes.
replace('Air Start / Unfeathering',"If engine does'nt start, prime w/ Fuel Pump INOP Engine ON 3 sec, then repeat the steps above.",
    ['If the engine does not start, prime with Fuel Pump INOP Engine ON 3 sec, then repeat the steps above.'])
replace('Vacuum Failure','RPM ... INCREASE 2700',['RPM ... INCREASE TO 2700'])
replace('Before Takeoff','Trims ... ELEVATOR T/O, RUDDER AS REQUIRED',['Elevator Trim ... SET FOR T/O','Rudder Trim ... SET'])
# Before Takeoff: the POH pre-takeoff check sets the wing flaps (the run-up only checks their travel).
insert('Before Takeoff','Rudder Trim ... SET',['Wing Flaps ... SET (0°, OR 25° FOR SHORTEST ROLL)'])
# Approach: speeds first, the pre-landing items, first notch of flaps, then GUMPS (the gear line pulses).
by_title['Approach / GUMPS']['lines']=[
    'Speed ... 110 DWD·100 BASE·90 FIN',
    'Brakes ... PRESSURE CHECK',
    'Strobe Lights ... ON',
    'Navigation Lights ... NIGHT ONLY',
    'Landing Light ... ON',
    'Pitot Heat ... AS REQUIRED',
    'Flaps ... NOTCH 1 · OEI MAX 25°',
    '# GUMPS',
    'G — Fuel Selectors & Pumps ... ON',
    '^ U — Gear ... 3 GREENS · MIRROR',
    'M — Mixture Controls ... FULL RICH',
    'P — Props ... FULL FORWARD',
    'S — Seat Belt & Switches ... CHECK',
    '-> GO AROUND | if needed : Go Around',
    '-> SHORT FIELD | full flaps · 87 MPH : Short-Field Landing',
    '-> SE LANDING | one engine · 105 MPH : Single-Engine Landing']
# Go Around is a branch: it has a tile, but Next on Approach leads to After Landing.
by_title['Go Around']['lines']=['@BRANCH']+by_title['Go Around']['lines']+['-> APPROACH | back to Approach / GUMPS : Approach / GUMPS',
    "-> CLIMB CHECK | 500' AGL : Climb Check (500' AGL)"]
by_title['Left Engine Nacelle']['lines']=list(by_title['Right Engine Nacelle']['lines'])
rw=by_title['Right Wing']['lines']
lw=[]
for line in rw:
    lw.append(line)
    if line.startswith('Leading Edge'):
        lw.append('Stall Warning Detectors (inboard & outboard) ... NO DAMAGE / FREE MOVEMENT')
        lw.append('Pitot Static Mast ... UNOBSTRUCTED')
    if line.startswith('Main Gear'):
        lw.append('Squat Switch ... CHECKED / NO DAMAGE')
by_title['Left Wing']['lines']=lw

# The spreadsheet's single-engine fuel management LANDING section ends with three lines copied
# from Go Around (gear up, flaps retract, cowl flaps). The Avia PA-34-200 emergency checklist
# ends that section at the electric fuel pump, so drop the copied lines.
# Memory items follow the Avia PA-34-200 emergency checklist, one control per line,
# and end with a decision: try to restore power, or feather.
by_title['Engine Failure — Memory Items']['lines'] = [
    '@SUBTITLE P – D – D – D | Performance · Drag · Determine · Decide',
    'Maintain Direction and Airspeed ... BLUE LINE / 105 MPH',
    'Mixture Controls ... RICH',
    'Propeller Controls ... FULL FORWARD',
    'Throttle Controls ... FULL FORWARD',
    'Landing Gear ... UP',
    'Flaps ... UP',
    'Fuel Pumps ... ON',
    'Identify INOP Engine ... DEAD FOOT, DEAD ENGINE',
    'Verify INOP Engine ... RETARD THROTTLE TO VERIFY',
    "-> FIX | Restore power (if altitude permits) : Engine Failure — If Altitude Permits (3,500')",
    "-> FEATHER | Feathering procedure : Feathering Procedure"]
by_title["Engine Failure — If Altitude Permits (3,500')"]['lines'] += [
    "-> FEATHER | If the engine doesn't start : Feathering Procedure"]
# After feathering: the single-engine checklists (a group) and the restart.
by_title['Feathering Procedure']['lines'] += [
    '-> SINGLE ENGINE | operations : Single Engine Operations',
    '-> AIR START | unfeather / restart : Air Start / Unfeathering']
# Takeoff and climb failures: always show the departure ATIS line (you may land back on the runway),
# and the ones that end in feathering get a FEATHER button.
for t in ['Engine Failure on Takeoff — 100 MPH or Below','Engine Failure on Takeoff — 100 MPH or Above',
          'Engine Failure in Climb — Below 80 MPH','Engine Failure in Climb — Above 80 MPH']:
    by_title[t]['lines'].insert(0,'@ATIS DEP')
    if t!='Engine Failure on Takeoff — 100 MPH or Below':
        by_title[t]['lines'].append('-> FEATHER | Feathering procedure : Feathering Procedure')
# After the ATIS, the wind and runway (tap to enter them) give the crosswind / headwind: departure before taxi,
# arrival in the descent.
insert('Before Taxi','ATIS ... OBTAIN',['Wind & Runway ... {dep.sum}'])
insert('Descent','ATIS ... OBTAIN',['Wind & Runway ... {arr.sum}'])
# Hobbs / tach lines: tap to record left & right tach and Hobbs (start, then shutdown with time flown).
# Start times are read once seated: the line moves from Airplane Status to the top of Inside Cockpit (v38).
by_title['Airplane Status']['lines'].remove('* HOBBS/TACH Times ... RECORDED')
by_title['Inside Cockpit']['lines'].insert(0,'* HOBBS/TACH Times ... {times.out}')
replace('Engine Shut-down','HOBBS/TACH Times ... RECORDED',['* HOBBS/TACH Times ... {times.in}'])
fm=by_title['Single-Engine Fuel Management']['lines']
fm[:]=fm[:fm.index('Electric Fuel Pump Operating Engine ... ON')+1]

emer=sorted([l for l in lists if l['group']=='Emergency'], key=lambda l: EMER_ORDER.index(l['title']))
normal=[l for l in lists if l['group']!='Emergency']

PAX="""# S — Seat belts & shoulder harness
Fasten / unfasten ... DEMONSTRATE
Worn for ... TAXI, TAKEOFF, LANDING — AND KEEP ON
Front seats ... SHOULDER HARNESS (INERTIA REEL)
# A — Air vents
Overhead fresh-air vents ... TWIST RIM: CW LESS · CCW MORE
# F — Fire extinguisher & Follow instructions
Fire extinguisher ... SEAT BEHIND PILOT
Smoking ... NONE
# E — Exits, Emergencies & Equipment
Exits ... FRONT CABIN DOOR · REAR DOOR (L)
Latches ... UPPER + SIDE — SHOW BOTH
Upper latch ... ENGAGED BEFORE FLIGHT
Right front seat ... CATCH ON TOP — SLIDES FWD
Door opens in flight ... NOISY, NOT DANGEROUS — WE RETURN & LAND
In an emergency I will tell you what is happening and what to do. Stay belted until the airplane has stopped.
Evacuation ... UNLATCH WHEN TOLD, EXIT, MOVE WELL AWAY
Headsets / intercom ... VOLUME & MIC CHECK
# T — Traffic & Talking
Traffic ... POINT IT OUT — CLOCK POSITION
Quiet cockpit ... TAXI · TAKEOFF · LANDING · ATC
Controls, switches, pedals ... HANDS AND FEET CLEAR
Expect ... STALL HORN · GEAR HORN · SIMULATED ENGINE FAILURES
A propeller may be feathered (stopped) on purpose at altitude. The airplane is designed to fly on one engine.
# Y — Your questions
Feeling unwell or worried? ... TELL ME ANY TIME
Questions? ... BEFORE WE START ENGINES"""

# The {tokens} show values entered on the ATIS & Takeoff Data screen; tapping the line enters them.
CREW="""# Today
Runway available ... {tora}
Wind (head / cross) ... {dep.hw}
Takeoff distance over 50 ft ... {tob.todist}
Accelerate-stop distance ... {tob.asd}
Single-engine rate of climb ... {tob.seroc}
Single-engine service ceiling ... {secl}
# Speeds (MPH CAS)
Vr (short: 80 flaps 0° · 70 flaps 25°) ... 80–85
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
Gear / flaps · fuel pumps ... UP · ON
Identify · verify ... DEAD FOOT · RETARD THROTTLE
Prop — inop engine ... FEATHER
Bank ... 5° TOWARD GOOD ENGINE
Checklist ... AT 400 FT AGL
Cannot climb ... HOLD 105 — LAND AHEAD
Simulated failures ... THROTTLE ONLY, SLOWLY"""

# Hidden checklists (no tile, not in Next/Previous), opened with buttons from the normal checklists.
HOT="""@HIDDEN
Mixture Controls ... IDLE CUT-OFF
Throttle Controls ... OPEN 1/2 INCH
Propeller Controls ... FORWARD
Master Switch ... ON
Ignition Switches ... ON
Electric Fuel Pumps ... OFF (NO PRIMING)
# Each engine (left, then right)
Propeller ... CLEAR
Starter ... ENGAGE
Mixture Control ... ADVANCE AS ENGINE STARTS
If an engine does not start this way (no priming), use the normal starting procedure, which includes priming.
-> NORMAL START | Starting Engine : Starting Engine"""
FLOODED="""@HIDDEN
Mixture Control ... IDLE CUT-OFF
Throttle Control ... FULL FORWARD
Propeller Control ... FORWARD
Master Switch ... ON
Ignition Switches ... ON
Electric Fuel Pump ... OFF
Propeller ... CLEAR
Starter ... ENGAGE
When Engine Fires ... RETARD THROTTLE, ADVANCE MIXTURE SLOWLY
! Limit cranking to 30-second periods. If the engine does not start, let the starter cool for several minutes.
-> NORMAL START | Starting Engine : Starting Engine"""
POWER="""@HIDDEN
| Press. alt | Std °F | 55% 2100 | 55% 2400 | 65% 2100 | 65% 2400 | 75% 2400 |
| SL | 59 | 22.9 | 20.4 | 25.9 | 22.9 | 25.5 |
| 1,000 | 55 | 22.7 | 20.2 | 25.6 | 22.7 | 25.2 |
| 2,000 | 52 | 22.4 | 20.0 | 25.4 | 22.5 | 25.0 |
| 3,000 | 48 | 22.2 | 19.8 | 25.1 | 22.2 | 24.7 |
| 4,000 | 45 | 21.9 | 19.5 | 24.8 | 22.0 | 24.4 |
| 5,000 | 41 | 21.7 | 19.3 | FT | 21.7 | FT |
| 6,000 | 38 | 21.4 | 19.1 | — | 21.5 | — |
| 7,000 | 34 | 21.2 | 18.9 | — | 21.3 | — |
| 8,000 | 31 | 21.0 | 18.7 | — | 21.0 | — |
| 9,000 | 27 | FT | 18.5 | — | FT | — |
| 10,000 | 23 | — | 18.3 | — | — | — |
| 11,000 | 19 | — | 18.1 | — | — | — |
| 12,000 | 16 | — | 17.8 | — | — | — |
| 13,000 | 12 | — | 17.6 | — | — | — |
| 14,000 | 9 | — | FT | — | — | — |
! MP (in Hg): ±0.16" per 10°F from standard temperature — add above standard, subtract below. FT = full throttle.
-> BACK TO CRUISE | Cruise : Cruise"""

SFTO="""@HIDDEN
# POH 6-7
Flaps 0° ... ROTATE 80 · 85 AT 50 FT
Flaps 25° ... ROTATE 70 · 80 AT 50 FT
Flaps / Trim ... 0°: T/O RANGE · 25°: SLIGHTLY NOSE UP
Fuel Pumps · Mixtures · Props ... ON · RICH (LEAN AT HIGH DA) · FULL FWD
Position ... MAX RUNWAY, CENTERLINE
Brakes ... HOLD
Throttles ... FULL — 2700 RPM, GAUGES GREEN
Brakes ... RELEASE
Airspeed Indicator ... ALIVE
Climb Over Obstacle ... Vx 90 MPH
Gear ... UP — NO RUNWAY REMAINS
Then ... Vy 105 MPH
Flaps (if 25°) ... UP ≤ 125 MPH, POSITIVE RATE
! Flaps 25° is momentarily below Vmc 80 — engine failure: RETARD GOOD THROTTLE, NOSE DOWN. Don't hold it on the runway (wheelbarrowing).
-> TAKEOFF | normal takeoff : Takeoff
-> CLIMB CHECK | 500' AGL : Climb Check (500' AGL)"""
SFLDG="""@HIDDEN
Speed ... 87 MPH · FULL FLAPS
# GUMPS
G — Fuel Selectors & Pumps ... ON
^ U — Gear ... 3 GREENS · MIRROR
M — Mixture Controls ... FULL RICH
P — Props ... FULL FORWARD
S — Seat Belt & Switches ... CHECK
# Short field — POH 6-11
Aim Point ... SELECTED
Throttles ... IDLE BEFORE TOUCHDOWN
Touchdown ... MAINS FIRST, MIN. FLOAT
After Touchdown ... FLAPS UP
Back Pressure · Brakes ... APPLY · MAXIMUM
! Maximum crosswind component for landing: 15 MPH (POH 6-11).
-> GO AROUND | if needed : Go Around
-> AFTER LANDING | after touchdown : After Landing"""

# Maneuvers (behind a small button on the home screen). Speeds MPH CAS, from the POH and the
# checkride maneuver sheets: the big items only.
MANEUVERS=[
('Pre-Maneuver Checklist',"""Altitude ... ≥ 3,000 FT AGL (Vmc DEMO ≥ 3,500)
Landing Site ... IDENTIFIED
Seat Belts / Loose Items ... SECURE
Fuel Selectors ... ON
Electric Fuel Pumps ... ON
Mixtures ... RICH
Propellers ... FULL FORWARD
Cowl Flaps ... AS REQUIRED
Engine Gauges ... IN THE GREEN
Clearing Turns ... COMPLETE
Entry Heading / Altitude ... NOTED / BUGGED"""),
('Steep Turns',"""Gear / Flaps ... UP / UP
Airspeed ... ≤ 133 MPH (AT OR BELOW Va)
Entry Heading / Landmark ... NOTED
Roll In ... COORDINATED, 45° BANK
Back Pressure / Power ... HOLD ALTITUDE / ADD AS REQ
Turn ... 360° — ROLL OUT ON ENTRY HEADING
Reverse ... OPPOSITE DIRECTION
# Tolerances
Altitude · Airspeed ... ± 100 FT · ± 11 MPH (10 KT)
Bank · Rollout Heading ... ± 5° · ± 10°
! Engine quits in the turn: WINGS LEVEL · REDUCE POWER · then MEMORY ITEMS"""),
('Slow Flight',"""# Entry
Throttles ... REDUCE
Gear / Flaps ... AS SPECIFIED (GEAR ≤ 150 · FLAPS ≤ 125)
Pitch ... HOLD ALTITUDE AS SPEED DECAYS
Airspeed ... JUST ABOVE STALL WARNING
Power / Trim ... HOLD ALTITUDE / AS REQUIRED
# Maneuver
Level, Turns, Climbs, Descents ... NO STALL WARNING
Coordination ... BALL CENTERED
# Recovery
Throttles ... FULL FORWARD
Flaps ... RETRACT IN STAGES (≤ 125)
Gear (if down) ... UP — POSITIVE RATE"""),
('Power-Off Stall',"""# Entry (landing configuration)
Throttles ... REDUCE
Gear ... DOWN — 3 GREEN (≤ 150)
Flaps ... AS SPECIFIED (≤ 125)
Stabilized Descent ... THEN THROTTLES IDLE
Pitch ... SMOOTHLY UP — RECOVER AT FULL STALL
# Recovery
Pitch · Wings ... REDUCE AOA · LEVEL
Throttles ... FULL FORWARD
Flaps ... 40° → 25°
Positive Rate ... GEAR UP
Flaps (below 125 MPH) ... RETRACT
Airspeed ... Vx 90 / Vy 105"""),
('Power-On Stall',"""# Entry (takeoff / departure configuration)
Gear / Flaps ... AS SPECIFIED (T/O = UP / UP)
Power ... ≥ 65% (4,000 FT: 22.0" @ 2400)
Pitch ... T/O ATTITUDE, THEN TO STALL
Coordination ... BALL CENTERED
Cues ... ANNOUNCE — RECOVER AT FULL STALL
# Recovery
Pitch · Wings ... REDUCE AOA · LEVEL
Throttles ... FULL FORWARD
Airspeed ... Vx 90 / Vy 105
Gear / Flaps (if extended) ... UP — POSITIVE RATE"""),
('Vmc Demo — Setup',"""Altitude ... ≥ 3,500 FT AGL
Gear / Flaps ... UP / UP
Cowl Flaps ... OPEN
Stabilator Trim ... TAKEOFF RANGE
Mixtures / Propellers ... RICH / FULL FORWARD
Airspeed ... ≥ 105 MPH BEFORE POWER CUT
Throttle — Engine to Fail ... IDLE, SLOWLY
Prop — Engine to Fail ... WINDMILLING — NO FEATHER
Throttle — Operating Engine ... FULL
Rudder / Bank ... TOWARD GOOD ENGINE / ≤ 5°
Pitch / Airspeed ... SE CLIMB ATTITUDE ≈ 116 MPH
! Expect the gear warning horn (gear up, MP below 14")."""),
('Vmc Demo — Recover',"""# Maneuver
Pitch ... RAISE SLOWLY — ≈ 1 MPH / SEC
Rudder ... INCREASE — HOLD HEADING
Red Line ... 80 MPH
# Recover at the first of
Loss of directional control · stall horn · buffet
# Recovery
Throttle — Operating Engine ... REDUCE IMMEDIATELY
Pitch ... LOWER — REDUCE AOA
Heading ... WITHIN 20° OF ENTRY
Throttle — Operating Engine ... ADVANCE SMOOTHLY
Airspeed ... Vyse 105
Both Throttles ... SYMMETRICAL POWER
! Spin: BOTH THROTTLES IDLE · FULL OPPOSITE RUDDER · WHEEL FORWARD · AILERONS NEUTRAL"""),
('One Engine Inoperative Approach',"""# POH 3-13
Inoperative Engine ... FEATHERED
Altitude & Airspeed ... EXTRA — LAND THE FIRST TIME
Gear ... DOWN — 3 GREENS, 1 IN THE MIRROR
Flaps ... NOT UNTIL CERTAIN OF FIELD (MAX 25°)
Final Approach Speed ... 105 MPH
Rudder Trim ... ADJUST AS POWER CHANGES
! Single-engine go-around only if unavoidable.
-> FEATHER | Feathering procedure : Feathering Procedure
-> SE GO AROUND | if unavoidable : Single-Engine Go Around"""),
]

out_lists=[]
def add(title, group, text): out_lists.append({'title':title,'group':group,'color':GROUP_COLOR[group],'text':text})
for l in normal:
    add(l['title'], l['group'], '\n'.join(l['lines']))
    if l['title']=='Before Starting Engine': add('Passenger Briefing','Start & Taxi',PAX)
    if l['title']=='Starting Engine': add('Hot Start','Start & Taxi',HOT); add('Flooded Start','Start & Taxi',FLOODED)
    if l['title']=='Before Takeoff': add('Crew Takeoff Briefing','Start & Taxi',CREW); add('Short-Field Takeoff','Flight',SFTO)
    if l['title']=='Approach / GUMPS': add('Short-Field Landing','Flight',SFLDG)
    if l['title']=='Cruise': add('Cruise Power Settings','Flight',POWER)
# Emergency checklists are split into categories (shown as a second tile screen).
# Memory Items stays at the top level so it is one tap from the Emergency screen.
EMER_CAT={
 'Engine Failure — Memory Items':'',
 "Engine Failure — If Altitude Permits (3,500')":'Engine Failure','Feathering Procedure':'Engine Failure','Air Start / Unfeathering':'Engine Failure',
 'Engine Failure on Takeoff — 100 MPH or Below':'Takeoff & Climb Eng. Fail','Engine Failure on Takeoff — 100 MPH or Above':'Takeoff & Climb Eng. Fail',
 'Engine Failure in Climb — Below 80 MPH':'Takeoff & Climb Eng. Fail','Engine Failure in Climb — Above 80 MPH':'Takeoff & Climb Eng. Fail',
 'Single-Engine Fuel Management':'Single Engine Operations','Single-Engine Landing':'Single Engine Operations','Single-Engine Go Around':'Single Engine Operations',
 'Engine Fire — In Flight':'Fire & Descent','Engine Fire — On the Ground':'Fire & Descent','Emergency Descent':'Fire & Descent',
 'Manual Gear Extension':'Landing Gear','Gear Unsafe Warnings':'Landing Gear','Gear-Up Landing':'Landing Gear',
 'Overvoltage Lights — Both':'Electrical','Overvoltage Light — One':'Electrical','Alternator Off Line — Weak Battery':'Electrical','Loss of One Alternator':'Electrical',
 'Propeller Overspeed':'Prop · Vacuum · Pitot · Door',
 'Vacuum Failure':'Prop · Vacuum · Pitot · Door','Pitot Static Malfunction':'Prop · Vacuum · Pitot · Door','Open Door':'Prop · Vacuum · Pitot · Door'}
for l in emer:
    cat=EMER_CAT[l['title']]
    out_lists.append({'title':l['title'],'group':'Emergency'+('/'+cat if cat else ''),'color':GROUP_COLOR['Emergency'],'text':'\n'.join(l['lines'])})
for title, text in MANEUVERS: add(title, 'Maneuvers', text)
# EMERGENCY button target by phase of flight (tools/emergency_targets.json: checklist title -> emergency checklist or group).
EMAP=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'emergency_targets.json')))
for l in out_lists:
    if l['title'] in EMAP: l['text']='@EMERGENCY '+EMAP[l['title']]+'\n'+l['text']
# Bump DEFAULTS_VERSION whenever the checklist content changes; unedited iPads then update automatically.
DEFAULTS_VERSION=39
open(out,'w').write('// Generated from "PA-34-200_Checklist v2026 10 12.xlsx". Edit in the app, or regenerate.\n'
  +f'const DEFAULTS_VERSION = {DEFAULTS_VERSION};\nconst DEFAULTS = '+json.dumps(out_lists,ensure_ascii=False,indent=1)+';\n')
for l in out_lists: print(f"{l['group']:14} {l['title']:50} {len([x for x in l['text'].splitlines() if x.strip()])} lines")
