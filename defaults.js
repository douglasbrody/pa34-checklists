// Generated from "PA-34-200_Checklist v2026 10 12.xlsx". Edit in the app, or regenerate.
const DEFAULTS_VERSION = 40;
const DEFAULTS = [
 {
  "title": "Airplane Status",
  "group": "Preflight",
  "color": "#4a4f57",
  "text": "@EMERGENCY Emergency\nBaggage Door ... OPEN\nAirworthiness & Registration Certificates ... CHECK\nBaggage Door, Windows, Seats ... CLOSE, CLEAN, EMPTY & SECURE\nOperating Limitations, W&B & CG ... CHECK\nRadio License (international flights only) ... CHECK\nVOR Accuracy every 30 days (IFR only) ... CHECK\nELT (battery/expiration date) ... CHECK\nCompass Deviation Card & Fluid ... CHECK"
 },
 {
  "title": "Inside Cockpit",
  "group": "Preflight",
  "color": "#4a4f57",
  "text": "@EMERGENCY Emergency\n* HOBBS/TACH Times ... {times.out}\nAlternate Static Source ... CLOSED\nParking Brake ... SET\nAvionics Master Switch ... OFF\nElectrical Switches ... OFF\nLanding Gear Handle ... DOWN\nMixture Controls ... IDLE/CUTOFF\nIgnition Switches ... OFF\nCowl Flaps ... OPEN\nTrim Indicators ... NEUTRAL\nFuel Selectors ... ON\nMaster Switch ... ON\nLanding Gear Lights ... 3 GREEN\nFlaps ... DOWN\nFuel Quantity ... ADEQUATE + RESERVE\nAll Light Switches, Pitot Heat ... ON\nStrobe, Nav, Landing, Beacon Lights ... CHECK\nPitot Heat ... WARM\nOutboard Stall Detector (0°–10° flaps) ... HORN SOUNDS\nInboard Stall Detector (25°–40° flaps) ... HORN SOUNDS\nAll Light Switches, Pitot Heat ... OFF\nMaster Switch ... OFF\nCross Feeds ... DRAINED"
 },
 {
  "title": "Right Wing",
  "group": "Preflight",
  "color": "#4a4f57",
  "text": "@EMERGENCY Emergency\nGeneral Condition ... CHECKED\nFlaps ... NO DAMAGE / CHECK HINGES\nAileron Travel ... NO DAMAGE / CHECK HINGES\nWingtip ... NO DAMAGE\nNav, Strobe Lights ... NO DAMAGE\nLeading Edge ... NO DAMAGE\nFuel Quantity ... VISUAL CHECK; FUEL CAP SECURED\nFuel Sump Drains ... DRAINED\nFuel Vents & Fresh Air Inlet ... UNOBSTRUCTED\nMain Gear ... NO FLUID LEAKS\nBrakes ... NO EXCESSIVE WEAR\nStrut ... 3.5\" EXPOSED (static load)\nTire Pressure/Wear ... 53 PSI / CHECKED"
 },
 {
  "title": "Right Engine Nacelle",
  "group": "Preflight",
  "color": "#4a4f57",
  "text": "@EMERGENCY Emergency\nGeneral Condition ... CHECK\nCowling ... OPEN\nEngine Compartment ... CHECK FOR LEAKS\nOil Quantity ... 6–8 QTS\nCowling ... CLOSE & SECURE\nLanding Gear Mirror ... NO DAMAGE\nCowl Flaps ... NO DAMAGE / CHECK HINGES\nPropeller & Spinner ... NO DAMAGE / LEAKS\nGovernor ... NO LEAKS\nAir Vent ... UNOBSTRUCTED\nGas Sump ... DRAINED"
 },
 {
  "title": "Nose Section",
  "group": "Preflight",
  "color": "#4a4f57",
  "text": "@EMERGENCY Emergency\nGeneral Condition ... CHECKED\nNose Gear ... NO FLUID LEAKS\nStrut ... 2.5\" EXPOSED (static load)\nTire Pressure/Wear ... 31 PSI / CHECKED\nBattery Drains ... UNOBSTRUCTED\nLanding Lights ... NO DAMAGE\nExternal Power Source Plug ... CHECKED\nBrake Fluid (nose compartment) ... ADEQUATE LEVEL\nForward Baggage Door ... LOCKED\nWindshield ... NO DAMAGE / CLEAN\nChocks ... REMOVED"
 },
 {
  "title": "Left Engine Nacelle",
  "group": "Preflight",
  "color": "#4a4f57",
  "text": "@EMERGENCY Emergency\nGeneral Condition ... CHECK\nCowling ... OPEN\nEngine Compartment ... CHECK FOR LEAKS\nOil Quantity ... 6–8 QTS\nCowling ... CLOSE & SECURE\nLanding Gear Mirror ... NO DAMAGE\nCowl Flaps ... NO DAMAGE / CHECK HINGES\nPropeller & Spinner ... NO DAMAGE / LEAKS\nGovernor ... NO LEAKS\nAir Vent ... UNOBSTRUCTED\nGas Sump ... DRAINED"
 },
 {
  "title": "Left Wing",
  "group": "Preflight",
  "color": "#4a4f57",
  "text": "@EMERGENCY Emergency\nGeneral Condition ... CHECKED\nFlaps ... NO DAMAGE / CHECK HINGES\nAileron Travel ... NO DAMAGE / CHECK HINGES\nWingtip ... NO DAMAGE\nNav, Strobe Lights ... NO DAMAGE\nLeading Edge ... NO DAMAGE\nStall Warning Detectors (inboard & outboard) ... NO DAMAGE / FREE MOVEMENT\nPitot Static Mast ... UNOBSTRUCTED\nFuel Quantity ... VISUAL CHECK; FUEL CAP SECURED\nFuel Sump Drains ... DRAINED\nFuel Vents & Fresh Air Inlet ... UNOBSTRUCTED\nMain Gear ... NO FLUID LEAKS\nSquat Switch ... CHECKED / NO DAMAGE\nBrakes ... NO EXCESSIVE WEAR\nStrut ... 3.5\" EXPOSED (static load)\nTire Pressure/Wear ... 53 PSI / CHECKED"
 },
 {
  "title": "Empennage",
  "group": "Preflight",
  "color": "#4a4f57",
  "text": "@EMERGENCY Emergency\nRear Door ... LOCKED\nLeft Static Vents ... UNOBSTRUCTED\nDorsal Fin Air Scoop ... UNOBSTRUCTED\nVertical Stabilizer ... NO DAMAGE / CHECK HINGES\nHorizontal Stabilator ... FREEDOM OF MOTION\nTail Tie Down ... UNTIE\nTrim Tabs ... NO DAMAGE / CHECK HINGES\nRotating Beacon/Navigation Lights ... NO DAMAGE\nRight Static Vent ... UNOBSTRUCTED"
 },
 {
  "title": "Before Starting Engine",
  "group": "Start & Taxi",
  "color": "#1e5bd8",
  "text": "@EMERGENCY Engine Fire — On the Ground\nSeats ... ADJUSTED\nSeat Belts and Shoulder Harness ... FASTENED\nParking Brake ... SET\nCircuit Breakers ... IN\nRadio Master Switch ... OFF\nAlternate Air ... OFF\nCowl Flaps ... OPEN\n* Passenger Briefing ... COMPLETE"
 },
 {
  "title": "Passenger Briefing",
  "group": "Start & Taxi",
  "color": "#1e5bd8",
  "text": "@EMERGENCY Engine Fire — On the Ground\n# S — Seat belts & shoulder harness\nFasten / unfasten ... DEMONSTRATE\nWorn for ... TAXI, TAKEOFF, LANDING — AND KEEP ON\nFront seats ... SHOULDER HARNESS (INERTIA REEL)\n# A — Air vents\nOverhead fresh-air vents ... TWIST RIM: CW LESS · CCW MORE\n# F — Fire extinguisher & Follow instructions\nFire extinguisher ... SEAT BEHIND PILOT\nSmoking ... NONE\n# E — Exits, Emergencies & Equipment\nExits ... FRONT CABIN DOOR · REAR DOOR (L)\nLatches ... UPPER + SIDE — SHOW BOTH\nUpper latch ... ENGAGED BEFORE FLIGHT\nRight front seat ... CATCH ON TOP — SLIDES FWD\nDoor opens in flight ... NOISY, NOT DANGEROUS — WE RETURN & LAND\nIn an emergency I will tell you what is happening and what to do. Stay belted until the airplane has stopped.\nEvacuation ... UNLATCH WHEN TOLD, EXIT, MOVE WELL AWAY\nHeadsets / intercom ... VOLUME & MIC CHECK\n# T — Traffic & Talking\nTraffic ... POINT IT OUT — CLOCK POSITION\nQuiet cockpit ... TAXI · TAKEOFF · LANDING · ATC\nControls, switches, pedals ... HANDS AND FEET CLEAR\nExpect ... STALL HORN · GEAR HORN · SIMULATED ENGINE FAILURES\nA propeller may be feathered (stopped) on purpose at altitude. The airplane is designed to fly on one engine.\n# Y — Your questions\nFeeling unwell or worried? ... TELL ME ANY TIME\nQuestions? ... BEFORE WE START ENGINES"
 },
 {
  "title": "Starting Engine",
  "group": "Start & Taxi",
  "color": "#1e5bd8",
  "text": "@EMERGENCY Engine Fire — On the Ground\nFuel Selectors ... ON\nMixture Controls ... IDLE/CUTOFF\nPropeller Controls ... FULL FORWARD\nThrottle Controls ... 1/2\" OPEN\nMaster Switch ... ON\nBeacon ... ON\nIgnition Switches (all) ... ON\n# Start left engine, then right engine\nElectric Fuel Pump ... ON\nMixture Control ... RICH / CHECK FUEL FLOW, THEN CUTOFF (priming)\nElectric Fuel Pump ... OFF\nPropeller ... CLEAR\nStarter ... ENGAGED\nMixture Control ... ADVANCE AS ENGINE STARTS\nThrottle ... ADJUST (1000 RPM)\nOil Pressure ... RISING (within 30 seconds)\nFuel Pressure ... CHECK\nAlternator ... ON / CHARGING\nVacuum Gauge ... 4.5\"–5.2\" Hg\n# Repeat for right engine\n-> HOT START | POH 6-3 : Hot Start\n-> FLOODED START | POH 6-4 : Flooded Start"
 },
 {
  "title": "Hot Start",
  "group": "Start & Taxi",
  "color": "#1e5bd8",
  "text": "@EMERGENCY Engine Fire — On the Ground\n@HIDDEN\nMixture Controls ... IDLE CUT-OFF\nThrottle Controls ... OPEN 1/2 INCH\nPropeller Controls ... FORWARD\nMaster Switch ... ON\nIgnition Switches ... ON\nElectric Fuel Pumps ... OFF (NO PRIMING)\n# Each engine (left, then right)\nPropeller ... CLEAR\nStarter ... ENGAGE\nMixture Control ... ADVANCE AS ENGINE STARTS\nIf an engine does not start this way (no priming), use the normal starting procedure, which includes priming.\n-> NORMAL START | Starting Engine : Starting Engine"
 },
 {
  "title": "Flooded Start",
  "group": "Start & Taxi",
  "color": "#1e5bd8",
  "text": "@EMERGENCY Engine Fire — On the Ground\n@HIDDEN\nMixture Control ... IDLE CUT-OFF\nThrottle Control ... FULL FORWARD\nPropeller Control ... FORWARD\nMaster Switch ... ON\nIgnition Switches ... ON\nElectric Fuel Pump ... OFF\nPropeller ... CLEAR\nStarter ... ENGAGE\nWhen Engine Fires ... RETARD THROTTLE, ADVANCE MIXTURE SLOWLY\n! Limit cranking to 30-second periods. If the engine does not start, let the starter cool for several minutes.\n-> NORMAL START | Starting Engine : Starting Engine"
 },
 {
  "title": "Before Taxi",
  "group": "Start & Taxi",
  "color": "#1e5bd8",
  "text": "@EMERGENCY Engine Fire — On the Ground\nLeft Fuel Selector ... X-FEED\nRadio Master ... ON\nAvionics ... CHECK START SCREEN & DATABASE\nFlight Plan ... ENTER\nRAIM ... CHECK IN SYSTEM\nEngine Instruments ... CHECKED\nHeading Indicator ... CHECK VS. COMPASS\nATIS ... OBTAIN\nWind & Runway ... {dep.sum}\nAltimeter ... SET TO ATIS\nAltitude ... BUG\nHeading ... BUG\nLights ... AS REQUIRED\nLeft Fuel Selector ... ON\nRight Fuel Selector ... X-FEED"
 },
 {
  "title": "Taxi",
  "group": "Start & Taxi",
  "color": "#1e5bd8",
  "text": "@EMERGENCY Engine Fire — On the Ground\nTaxi Area ... CLEAR\nParking Brake ... RELEASE\nThrottle Control ... ADVANCE UNTIL MOVING\nThrottle ... IDLE\nBrakes ... CHECK\nCompass ... SWINGING FREELY\nHeading Indicator & Turn Coordinator ... MOVEMENT IN PROPER DIRECTION\nArtificial Horizon ... LEVEL / NO MOVEMENT"
 },
 {
  "title": "Engine Run-up",
  "group": "Start & Taxi",
  "color": "#1e5bd8",
  "text": "@EMERGENCY Engine Fire — On the Ground\nParking Brake ... SET\nFuel Selectors ... ON\nMixture Controls ... RICH\nPropeller Controls ... FULL FORWARD\n# Run-up left engine, then right engine\nThrottle Control ... 1500 RPM\nPropeller Control ... FULL BACK–FULL FORWARD, 3 TIMES\nRPM drop, MAP increase / oil pressure drop / no oil coming out from propeller governor.\nThrottle Control ... 2000 RPM\nPropeller Control ... 1800 RPM\nThrottle Control ... 25\" MP\nGovernor ... RPM STAND BY\nPropeller Control ... FULL FORWARD\nThrottle Control ... 2000 RPM\nAlternate Air ... ON/OFF — CHECK RPM DROP\nMagnetos (one at a time) ... OFF/ON (norm 100 drop, max 175, diff 50)\nAlternator (one at a time) ... OFF\nOvervoltage Relay Light (one at a time) ... PRESS / ILLUMINATED\nAlternator (one at a time) ... ON / CHARGING\nVacuum Gauge ... 4.5\"–5.2\" Hg\nThrottle ... IDLE (650–700 RPM), THEN 1000 RPM\nEngine Gauges ... IN GREEN\n# Repeat for opposite engine\nFlight Controls/Flaps ... FREE / FULL TRAVEL\nTrims ... SET"
 },
 {
  "title": "Before Takeoff",
  "group": "Start & Taxi",
  "color": "#1e5bd8",
  "text": "@EMERGENCY Takeoff & Climb Eng. Fail\nFlight Instruments ... CHECK\nFlight Instruments/Nav Aids ... CHECKED / SET\nCowl Flaps ... OPEN\nAlternate Air ... OFF\nFuel Selectors ... ON\nMixture Controls ... RICH\nPropeller Controls ... FULL FORWARD\nQuadrant Friction ... ADJUSTED\nElectric Fuel Pumps ... ON\nPitot Heat ... AS REQUIRED\nStrobe, Landing, Recognition Lights ... ON\nNavigation Lights ... NIGHT ONLY\nElevator Trim ... SET FOR T/O\nRudder Trim ... SET\nWing Flaps ... SET (0°, OR 25° FOR SHORTEST ROLL)\nPanel Lights ... AS NEEDED\nDoors, Storm Window ... LOCKED, CLOSED\nSeat Belts & Back ... SECURE & ERECT\nTransponder ... ALT\n* Crew Briefing ... COMPLETED"
 },
 {
  "title": "Crew Takeoff Briefing",
  "group": "Start & Taxi",
  "color": "#1e5bd8",
  "text": "@EMERGENCY Takeoff & Climb Eng. Fail\n# Today\nRunway available ... {tora}\nWind (head / cross) ... {dep.hw}\nTakeoff distance over 50 ft ... {tob.todist}\nAccelerate-stop distance ... {tob.asd}\nSingle-engine rate of climb ... {tob.seroc}\nSingle-engine service ceiling ... {secl}\n# Speeds (MPH CAS)\nVr (short: 80 flaps 0° · 70 flaps 25°) ... 80–85\nVx / Vy ... 90 / 105\nVmc — red radial ... 80\nVyse — blue radial ... 105\n# If an engine fails\nOn the runway, below 100 MPH ... CLOSE BOTH — STOP\nAirborne, gear down, runway left ... CLOSE BOTH — LAND\nAirborne below Vmc 80 ... REDUCE GOOD ENG. · NOSE DOWN\nGear up ... CONTROL · CONFIGURE · CLIMB\n# Gear up — memory items\nAirspeed ... 105 MPH (BLUE LINE)\nMixtures / props / throttles ... FULL FORWARD\nGear / flaps · fuel pumps ... UP · ON\nIdentify · verify ... DEAD FOOT · RETARD THROTTLE\nProp — inop engine ... FEATHER\nBank ... 5° TOWARD GOOD ENGINE\nChecklist ... AT 400 FT AGL\nCannot climb ... HOLD 105 — LAND AHEAD\nSimulated failures ... THROTTLE ONLY, SLOWLY"
 },
 {
  "title": "Short-Field Takeoff",
  "group": "Flight",
  "color": "#138a4a",
  "text": "@EMERGENCY Takeoff & Climb Eng. Fail\n@HIDDEN\n# POH 6-7\nFlaps 0° ... ROTATE 75–80 · 85 AT 50 FT\nFlaps / Trim ... 0° / T/O RANGE\nFuel Pumps · Mixtures · Props ... ON · RICH (LEAN AT HIGH DA) · FULL FWD\nPosition ... MAX RUNWAY, CENTERLINE\nBrakes ... HOLD\nThrottles ... FULL — 2700 RPM, GAUGES GREEN\nBrakes ... RELEASE\nAirspeed Indicator ... ALIVE\nClimb Over Obstacle ... Vx 90 MPH\nGear ... UP — NO RUNWAY REMAINS\nThen ... Vy 105 MPH\n-> TAKEOFF | normal takeoff : Takeoff\n-> CLIMB CHECK | 500' AGL : Climb Check (500' AGL)"
 },
 {
  "title": "Takeoff",
  "group": "Flight",
  "color": "#138a4a",
  "text": "@EMERGENCY Takeoff & Climb Eng. Fail\nMixture Controls ... RICH\nPropeller Controls ... HIGH RPM\nElectric Fuel Pumps ... ON\nLanding Light ... ON\nContact Tower ... PATTERN / VFR / IFR\nParking Brake ... RELEASE / TAXI–HOLD SHORT\nCompass (compare against RWY heading) ... CHECKED\nThrottle Controls ... FULL RPM / CHECK ENGINE GAUGES\nRotate ... 80–85 MPH\nGear Up ... POSITIVE RATE\nVx or Vy ... 90 / 105 MPH\n-> SHORT FIELD | POH 6-7 : Short-Field Takeoff"
 },
 {
  "title": "Climb Check (500' AGL)",
  "group": "Flight",
  "color": "#138a4a",
  "text": "@EMERGENCY Engine Failure in Climb — Above 80 MPH\nClimb Speed ... 105 MPH\nGear/Flaps ... UP\nLanding Lights ... OFF\nEngine Instruments ... MONITOR"
 },
 {
  "title": "Cruise Climb (above 1000' AGL)",
  "group": "Flight",
  "color": "#138a4a",
  "text": "@EMERGENCY Engine Failure in Climb — Above 80 MPH\nClimb Speed ... 120 MPH\nManifold Pressure/RPM ... 25\" Hg / 2500 RPM\nCowl Flaps ... AS REQUIRED\nElectric Fuel Pumps ... OFF (ONE AT A TIME) — CHECK FUEL PRESSURE\nEngine Instruments ... MONITOR"
 },
 {
  "title": "Cruise",
  "group": "Flight",
  "color": "#138a4a",
  "text": "@EMERGENCY Engine Failure — Memory Items\nManifold Pressure/RPM ... SET (according to table)\nMixture Controls ... ADJUST (EGT)\nCowl Flaps ... AS REQUIRED\nElectric Fuel Pumps ... OFF (ONE AT A TIME) — CHECK FUEL FLOW\nEngine Instruments ... MONITOR\n-> POWER TABLE | MP / RPM — POH 8-16 : Cruise Power Settings"
 },
 {
  "title": "Cruise Power Settings",
  "group": "Flight",
  "color": "#138a4a",
  "text": "@EMERGENCY Engine Failure — Memory Items\n@HIDDEN\n| Press. alt | Std °F | 55% 2100 | 55% 2400 | 65% 2100 | 65% 2400 | 75% 2400 |\n| SL | 59 | 22.9 | 20.4 | 25.9 | 22.9 | 25.5 |\n| 1,000 | 55 | 22.7 | 20.2 | 25.6 | 22.7 | 25.2 |\n| 2,000 | 52 | 22.4 | 20.0 | 25.4 | 22.5 | 25.0 |\n| 3,000 | 48 | 22.2 | 19.8 | 25.1 | 22.2 | 24.7 |\n| 4,000 | 45 | 21.9 | 19.5 | 24.8 | 22.0 | 24.4 |\n| 5,000 | 41 | 21.7 | 19.3 | FT | 21.7 | FT |\n| 6,000 | 38 | 21.4 | 19.1 | — | 21.5 | — |\n| 7,000 | 34 | 21.2 | 18.9 | — | 21.3 | — |\n| 8,000 | 31 | 21.0 | 18.7 | — | 21.0 | — |\n| 9,000 | 27 | FT | 18.5 | — | FT | — |\n| 10,000 | 23 | — | 18.3 | — | — | — |\n| 11,000 | 19 | — | 18.1 | — | — | — |\n| 12,000 | 16 | — | 17.8 | — | — | — |\n| 13,000 | 12 | — | 17.6 | — | — | — |\n| 14,000 | 9 | — | FT | — | — | — |\n! MP (in Hg): ±0.16\" per 10°F from standard temperature — add above standard, subtract below. FT = full throttle.\n-> BACK TO CRUISE | Cruise : Cruise"
 },
 {
  "title": "Descent",
  "group": "Flight",
  "color": "#138a4a",
  "text": "@EMERGENCY Engine Failure — Memory Items\nManifold Pressure ... AS NEEDED\nMixture Controls ... ENRICH WITH DESCENT\nCowl Flaps ... CLOSED\nFlight Instruments ... SET\nATIS ... OBTAIN\nWind & Runway ... {arr.sum}"
 },
 {
  "title": "Approach / GUMPS",
  "group": "Flight",
  "color": "#138a4a",
  "text": "@EMERGENCY Single-Engine Landing\nSpeed ... 110 DWD·100 BASE·90 FIN\nBrakes ... PRESSURE CHECK\nStrobe Lights ... ON\nNavigation Lights ... NIGHT ONLY\nLanding Light ... ON\nPitot Heat ... AS REQUIRED\nFlaps ... NOTCH 1 · OEI MAX 25°\n# GUMPS\nG — Fuel Selectors & Pumps ... ON\n^ U — Gear ... 3 GREENS · MIRROR\nM — Mixture Controls ... FULL RICH\nP — Props ... FULL FORWARD\nS — Seat Belt & Switches ... CHECK\n-> GO AROUND | if needed : Go Around\n-> SHORT FIELD | full flaps · 87 MPH : Short-Field Landing\n-> SE LANDING | one engine · 105 MPH : Single-Engine Landing"
 },
 {
  "title": "Short-Field Landing",
  "group": "Flight",
  "color": "#138a4a",
  "text": "@EMERGENCY Single-Engine Landing\n@HIDDEN\nSpeed ... 87 MPH · FULL FLAPS\n# GUMPS\nG — Fuel Selectors & Pumps ... ON\n^ U — Gear ... 3 GREENS · MIRROR\nM — Mixture Controls ... FULL RICH\nP — Props ... FULL FORWARD\nS — Seat Belt & Switches ... CHECK\n# Short field — POH 6-11\nAim Point ... SELECTED\nThrottles ... IDLE BEFORE TOUCHDOWN\nTouchdown ... MAINS FIRST, MIN. FLOAT\nAfter Touchdown ... FLAPS UP\nBack Pressure · Brakes ... APPLY · MAXIMUM\n! Maximum crosswind component for landing: 15 MPH (POH 6-11).\n-> GO AROUND | if needed : Go Around\n-> AFTER LANDING | after touchdown : After Landing"
 },
 {
  "title": "Go Around",
  "group": "Flight",
  "color": "#138a4a",
  "text": "@EMERGENCY Engine Failure — Memory Items\n@BRANCH\nThrottle Controls ... FULL FORWARD\nPitch Up ... 10°–12°\nFlaps ... RETRACT TO 25°\nLanding Gear ... UP — RETRACT (+ rate of climb on VSI)\nFlaps (below 125 MPH) ... RETRACT\nCowl Flaps ... ADJUST\n-> APPROACH | back to Approach / GUMPS : Approach / GUMPS\n-> CLIMB CHECK | 500' AGL : Climb Check (500' AGL)"
 },
 {
  "title": "After Landing",
  "group": "After Landing",
  "color": "#6b3fc7",
  "text": "@EMERGENCY Engine Fire — On the Ground\nClear Runway ... PAST HOLD SHORT LINES\nFlaps ... UP\nCowl Flaps ... OPEN\nFuel Pumps ... OFF\nPitot Heat ... OFF\nStrobe Lights ... OFF\nNavigation Lights ... AS REQUIRED\nLanding Lights ... OFF\nRecognition Lights ... OFF\nContact Ground or UNICOM ... TAXI"
 },
 {
  "title": "Engine Shut-down",
  "group": "After Landing",
  "color": "#6b3fc7",
  "text": "@EMERGENCY Engine Fire — On the Ground\nRadio Master ... OFF\nThrottle Controls ... IDLE\nMixture Controls ... IDLE/CUTOFF\nIgnition Switches ... OFF\nBeacon ... OFF\nMaster Switch ... OFF\nAlternators ... OFF\nParking Brake ... OFF\n* HOBBS/TACH Times ... {times.in}\nControls ... SECURED\nAircraft ... TIED DOWN"
 },
 {
  "title": "Engine Failure — Memory Items",
  "group": "Emergency",
  "color": "#c62828",
  "text": "@SUBTITLE P – D – D – D | Performance · Drag · Determine · Decide\nMaintain Direction and Airspeed ... BLUE LINE / 105 MPH\nMixture Controls ... RICH\nPropeller Controls ... FULL FORWARD\nThrottle Controls ... FULL FORWARD\nLanding Gear ... UP\nFlaps ... UP\nFuel Pumps ... ON\nIdentify INOP Engine ... DEAD FOOT, DEAD ENGINE\nVerify INOP Engine ... RETARD THROTTLE TO VERIFY\n-> FIX | Restore power (if altitude permits) : Engine Failure — If Altitude Permits (3,500')\n-> FEATHER | Feathering procedure : Feathering Procedure"
 },
 {
  "title": "Engine Failure on Takeoff — 100 MPH or Below",
  "group": "Emergency/Takeoff & Climb Eng. Fail",
  "color": "#c62828",
  "text": "@ATIS DEP\n# If engine failure occurs during takeoff roll below 100 MPH\nThrottle Controls ... CLOSE BOTH — STOP STRAIGHT\n# If inadequate runway remains to stop\nThrottle Controls ... CLOSED\nBrakes ... APPLY MAX BRAKING\nMaster Switch ... OFF\nFuel Selectors ... OFF\nContinue straight, turning to avoid obstacles as necessary."
 },
 {
  "title": "Engine Failure on Takeoff — 100 MPH or Above",
  "group": "Emergency/Takeoff & Climb Eng. Fail",
  "color": "#c62828",
  "text": "@ATIS DEP\nEngine failure occurs during ground roll or after lift-off with gear down and 100 MPH attained:\n# If adequate runway remains to stop\nClose both throttles immediately; land if airborne; stop straight ahead.\n# If inadequate runway remains to stop\nAbort or continue based on: weight / density altitude, obstructions, weather, competency.\n# If decision is made to continue\nMaintain Heading and Airspeed ... 93 or 105 MPH\nRetract Landing Gear ... WHEN CLIMB IS ESTABLISHED\nFeather Inoperative Engine ... SEE FEATHERING PROCEDURE\n-> FEATHER | Feathering procedure : Feathering Procedure"
 },
 {
  "title": "Engine Failure in Climb — Below 80 MPH",
  "group": "Emergency/Takeoff & Climb Eng. Fail",
  "color": "#c62828",
  "text": "@ATIS DEP\nPower on Operative Engine ... REDUCE, MAINTAIN DIRECTIONAL CONTROL\nNose ... LOWER TO ATTAIN Vyse 105 MPH\nInoperative Engine ... FEATHER\n-> FEATHER | Feathering procedure : Feathering Procedure"
 },
 {
  "title": "Engine Failure in Climb — Above 80 MPH",
  "group": "Emergency/Takeoff & Climb Eng. Fail",
  "color": "#c62828",
  "text": "@ATIS DEP\nDirectional Control ... MAINTAIN\nMinimum Airspeed ... MAINTAIN Vyse 105 MPH\nInoperative Engine ... FEATHER\n-> FEATHER | Feathering procedure : Feathering Procedure"
 },
 {
  "title": "Engine Failure — If Altitude Permits (3,500')",
  "group": "Emergency/Engine Failure",
  "color": "#c62828",
  "text": "Mixture INOP Engine ... AS REQUIRED\nElectric Fuel Pump INOP Engine ... ON\nFuel Selector INOP Engine ... X-FEED\nMagnetos INOP Engine ... LEFT OR RIGHT ONLY\nAlternate Air INOP Engine ... CHECK ON\n-> FEATHER | If the engine doesn't start : Feathering Procedure"
 },
 {
  "title": "Feathering Procedure",
  "group": "Emergency/Engine Failure",
  "color": "#c62828",
  "text": "Propeller INOP Engine ... FEATHER (BFR 800 RPM)\nMixture INOP Engine ... IDLE CUT OFF\nTrim ... AS REQUIRED\nMaintain ... 5° BANK TOWARD GOOD ENGINE\nAdjust Airspeed and Power ... AS NEEDED\nFuel Pump INOP Engine ... OFF\nMagnetos INOP Engine ... OFF\nCowl Flaps INOP Engine ... CLOSE\nAlternator INOP Engine ... OFF\nElectrical Load ... REDUCE BELOW 50 AMPS\nFuel Selector INOP Engine ... OFF\nFuel Pump Operating Engine ... OFF\n-> SINGLE ENGINE | operations : Single Engine Operations\n-> AIR START | unfeather / restart : Air Start / Unfeathering"
 },
 {
  "title": "Air Start / Unfeathering",
  "group": "Emergency/Engine Failure",
  "color": "#c62828",
  "text": "Fuel Selector INOP Engine ... ON\nFuel Pump INOP Engine ... OFF\nThrottle Controls ... OPEN 1/4 INCH\nPropeller Controls ... FULL FORWARD\nMixture Controls ... RICH\nMagnetos ... ON\nStarter ... ENGAGE TILL PROP WINDMILLS\nThrottle ... REDUCE TILL ENGINE IS WARM\nSet Zero Thrust ... SET MAP / 2000 RPM\nAlternator ... ON\nCowl Flaps ... OPEN WHEN ENGINE IS WARM\nIf the engine does not start, prime with Fuel Pump INOP Engine ON 3 sec, then repeat the steps above."
 },
 {
  "title": "Single-Engine Fuel Management",
  "group": "Emergency/Single Engine Operations",
  "color": "#c62828",
  "text": "# Cruising — using fuel from the tank on the same side as the operating engine\nFuel Selector Operating Engine ... ON\nFuel Selector INOP Engine ... OFF\nElectric Fuel Pumps ... OFF\nIn case of an engine-driven pump failure, electric fuel pump on operating engine side ON.\n# X-Feed operation — using fuel from the tank on the side opposite the operating engine\nFuel Selector Operating Engine ... X-FEED\nFuel Selector INOP Engine ... OFF\nElectric Fuel Pumps ... OFF\nIn case of an engine-driven pump failure, electric fuel pump on operating engine side ON.\n# Landing\nFuel Selector Operating Engine ... ON\nFuel Selector INOP Engine ... OFF\nElectric Fuel Pump Operating Engine ... ON"
 },
 {
  "title": "Single-Engine Landing",
  "group": "Emergency/Single Engine Operations",
  "color": "#c62828",
  "text": "Inoperative Engine ... FEATHERED (if not already)\n# Operating engine\nFuel Selector Operating Engine ... ON\nFuel Selector INOP Engine ... OFF\nElectric Fuel Pump Operating Engine ... ON\nMixture Control (operating engine) ... RICH\nPropeller Control (operating engine) ... FULL FORWARD\nLanding Light ... ON\nSeat Belts & Switches ... CHECK\n# Landing\n^ Gear ... DOWN\nFlaps ... NOT UNTIL CERTAIN OF FIELD (MAX 25°)\nFinal Approach Speed ... 105 MPH (POH 3-13)\n-> FEATHER | if not already : Feathering Procedure\n-> SE GO AROUND | only if unavoidable : Single-Engine Go Around"
 },
 {
  "title": "Single-Engine Go Around",
  "group": "Emergency/Single Engine Operations",
  "color": "#c62828",
  "text": "Avoided if at all possible. If a single-engine go-around cannot be avoided, proceed as follows:\nMixture Controls ... RICH\nPropeller Controls ... FULL FWD\nThrottle Controls ... FULL FWD\nFlaps ... UP\nLanding Gear ... UP\nAirspeed ... Vyse 105 MPH\nTrim ... SET\nCowl Flap ... AS REQUIRED"
 },
 {
  "title": "Engine Fire — In Flight",
  "group": "Emergency/Fire & Descent",
  "color": "#c62828",
  "text": "Fuel Selector (affected engine) ... OFF\nThrottle Control (affected engine) ... CLOSE\nPropeller Control (affected engine) ... FEATHER\nMixture Control (affected engine) ... IDLE CUT OFF\nHeater ... OFF\nDefroster ... OFF\nCowl Flaps ... OPEN\nLand immediately if terrain permits."
 },
 {
  "title": "Engine Fire — On the Ground",
  "group": "Emergency/Fire & Descent",
  "color": "#c62828",
  "text": "# If engine has not started\nMixture ... IDLE CUT OFF\nThrottle ... FULL OPEN\nStarter ... ENGAGE\nThis is an attempt to pull the fire into the engine.\n# If the engine has started, keep it running to pull the fire into the engine. If external fire extinguishing is to be applied:\nFuel Selectors ... OFF\nMixture Controls ... IDLE CUT OFF\nEVACUATE."
 },
 {
  "title": "Emergency Descent",
  "group": "Emergency/Fire & Descent",
  "color": "#c62828",
  "text": "Throttle Controls ... CLOSE\nPropeller Controls ... FULL FWD\nMixture Controls ... AS REQUIRED\nLanding Gear ... DOWN\nAirspeed ... 140 MPH (120 Demo)\nCowl Flaps ... CLOSE"
 },
 {
  "title": "Manual Gear Extension",
  "group": "Emergency/Landing Gear",
  "color": "#c62828",
  "text": "# Check the following before extending the gear manually\nCircuit Breakers ... CHECK / IN\nMaster Switch ... ON\nAlternators ... CHECK / ON\nNavigation Lights ... OFF (DAYTIME)\n# To extend: reposition the clip downward clear of the knob, then\nAirspeed ... REDUCE TO 100 MPH\nGear Selector Switch ... GEAR DOWN, LOCKED POSITION\nEmergency Extension Knob ... PULL\nLanding Gear Indicator Lights ... CHECK 3 GREENS\nLeave emergency gear extension knob OUT."
 },
 {
  "title": "Gear Unsafe Warnings",
  "group": "Emergency/Landing Gear",
  "color": "#c62828",
  "text": "Red light indicates gear is in transit. Recycle the gear if the red light continues to illuminate.\nRed light illuminates when horn sounds. Horn sounds when MAP drops to 14\" in either or both engines and gear is up, or when gear selector is set UP with airplane on ground."
 },
 {
  "title": "Gear-Up Landing",
  "group": "Emergency/Landing Gear",
  "color": "#c62828",
  "text": "Approach ... NORMAL AIRSPEED\nFlaps ... UP\nThrottle Controls ... CLOSE BEFORE TOUCHDOWN\nMaster Switch ... OFF\nMagnetos ... OFF\nFuel Selectors ... OFF\nContact surface at minimum airspeed."
 },
 {
  "title": "Overvoltage Lights — Both",
  "group": "Emergency/Electrical",
  "color": "#c62828",
  "text": "All Electrical Load ... OFF\nMaster Switch ... ON\nAlternators ... OFF / EXTINGUISH LIGHTS\nAlternators ... ON, ONE AT A TIME\nDetermine the alternator with the least output (amperes) and leave its switch on.\nElectrical Equipment ... ON, MAX 50 AMPS"
 },
 {
  "title": "Overvoltage Light — One",
  "group": "Emergency/Electrical",
  "color": "#c62828",
  "text": "All Electrical Load ... OFF\nMaster Switch ... ON\nAlternator Associated with Light ... OFF\nAlternator Associated with Light ... ON — IF MORE THAN 50 AMPS, OFF\nElectrical Equipment ... NO MORE THAN 50 AMPS"
 },
 {
  "title": "Alternator Off Line — Weak Battery",
  "group": "Emergency/Electrical",
  "color": "#c62828",
  "text": "Circuit Breakers ... CHECK / RESET IF TRIPPED\nElectrical Load ... REDUCE\nAlternator Switch (operative) ... ON\nMaster Switch (short period) ... OFF\nMaster Switch ... ON\n# If no output indicated on the ammeter\nMaster Switch (longer period) ... OFF\nMaster Switch ... ON\nIf power is established, reduce electrical load not to exceed 50 amperes."
 },
 {
  "title": "Loss of One Alternator",
  "group": "Emergency/Electrical",
  "color": "#c62828",
  "text": "Electrical Load ... REDUCE TO 50 AMPS\nCircuit Breakers ... CHECK / RESET IF TRIPPED\nCycle INOP Alternator Switch ... OFF / ON\n# If alternator fails to reset\nAlternator ... OFF\nElectrical Load ... REDUCE\n! WARNING: Compass error may exceed 10° with both alternators inoperative."
 },
 {
  "title": "Propeller Overspeed",
  "group": "Emergency/Prop · Vacuum · Pitot · Door",
  "color": "#c62828",
  "text": "Throttle Controls ... CLOSE\nAirspeed ... 105 MPH\nPropeller Controls ... BACK TO LOW RPM\nSlowly increase throttle until propeller governor is engaged.\nSlowly increase propeller and throttle to the desired power setting.\nContinue at reduced speed and power and land.\n! NOTE: If throttle retarded below 15–20 in MP above 105 MPH, propeller may overspeed again upon applying power."
 },
 {
  "title": "Vacuum Failure",
  "group": "Emergency/Prop · Vacuum · Pitot · Door",
  "color": "#c62828",
  "text": "RPM ... INCREASE TO 2700\nAltitude ... DESCEND TO MAINTAIN 4.5 in Hg\nUse turn indicator (electric) to monitor the direction indicator and attitude indicator performance."
 },
 {
  "title": "Pitot Static Malfunction",
  "group": "Emergency/Prop · Vacuum · Pitot · Door",
  "color": "#c62828",
  "text": "Pitot Heat ... ON\nAlternate Static Source ... OPEN\nStatic Drain ... CHECK"
 },
 {
  "title": "Open Door",
  "group": "Emergency/Prop · Vacuum · Pitot · Door",
  "color": "#c62828",
  "text": "Slow Airspeed ... 100 MPH\nCabin Vents ... CLOSE\nStorm Window ... OPEN\nUpper Latch Open ... LATCH\nSide Latch Open ... PULL ARMREST/LATCH\nUpper/Side Latch Open ... UNLATCH"
 },
 {
  "title": "Pre-Maneuver Checklist",
  "group": "Maneuvers",
  "color": "#a37800",
  "text": "@EMERGENCY Engine Failure — Memory Items\nAltitude ... ≥ 3,000 FT AGL (Vmc DEMO ≥ 3,500)\nLanding Site ... IDENTIFIED\nSeat Belts / Loose Items ... SECURE\nFuel Selectors ... ON\nElectric Fuel Pumps ... ON\nMixtures ... RICH\nPropellers ... FULL FORWARD\nCowl Flaps ... AS REQUIRED\nEngine Gauges ... IN THE GREEN\nClearing Turns ... COMPLETE\nEntry Heading / Altitude ... NOTED / BUGGED"
 },
 {
  "title": "Steep Turns",
  "group": "Maneuvers",
  "color": "#a37800",
  "text": "@EMERGENCY Engine Failure — Memory Items\nGear / Flaps ... UP / UP\nAirspeed ... ≤ 133 MPH (AT OR BELOW Va)\nEntry Heading / Landmark ... NOTED\nRoll In ... COORDINATED, 45° BANK\nBack Pressure / Power ... HOLD ALTITUDE / ADD AS REQ\nTurn ... 360° — ROLL OUT ON ENTRY HEADING\nReverse ... OPPOSITE DIRECTION\n# Tolerances\nAltitude · Airspeed ... ± 100 FT · ± 11 MPH (10 KT)\nBank · Rollout Heading ... ± 5° · ± 10°\n! Engine quits in the turn: WINGS LEVEL · REDUCE POWER · then MEMORY ITEMS"
 },
 {
  "title": "Slow Flight",
  "group": "Maneuvers",
  "color": "#a37800",
  "text": "@EMERGENCY Engine Failure — Memory Items\n# Entry\nThrottles ... REDUCE\nGear / Flaps ... AS SPECIFIED (GEAR ≤ 150 · FLAPS ≤ 125)\nPitch ... HOLD ALTITUDE AS SPEED DECAYS\nAirspeed ... JUST ABOVE STALL WARNING\nPower / Trim ... HOLD ALTITUDE / AS REQUIRED\n# Maneuver\nLevel, Turns, Climbs, Descents ... NO STALL WARNING\nCoordination ... BALL CENTERED\n# Recovery\nThrottles ... FULL FORWARD\nFlaps ... RETRACT IN STAGES (≤ 125)\nGear (if down) ... UP — POSITIVE RATE"
 },
 {
  "title": "Power-Off Stall",
  "group": "Maneuvers",
  "color": "#a37800",
  "text": "@EMERGENCY Engine Failure — Memory Items\n# Entry (landing configuration)\nThrottles ... REDUCE\nGear ... DOWN — 3 GREEN (≤ 150)\nFlaps ... AS SPECIFIED (≤ 125)\nStabilized Descent ... THEN THROTTLES IDLE\nPitch ... SMOOTHLY UP — RECOVER AT FULL STALL\n# Recovery\nPitch · Wings ... REDUCE AOA · LEVEL\nThrottles ... FULL FORWARD\nFlaps ... 40° → 25°\nPositive Rate ... GEAR UP\nFlaps (below 125 MPH) ... RETRACT\nAirspeed ... Vx 90 / Vy 105"
 },
 {
  "title": "Power-On Stall",
  "group": "Maneuvers",
  "color": "#a37800",
  "text": "@EMERGENCY Engine Failure — Memory Items\n# Entry (takeoff / departure configuration)\nGear / Flaps ... AS SPECIFIED (T/O = UP / UP)\nPower ... ≥ 65% (4,000 FT: 22.0\" @ 2400)\nPitch ... T/O ATTITUDE, THEN TO STALL\nCoordination ... BALL CENTERED\nCues ... ANNOUNCE — RECOVER AT FULL STALL\n# Recovery\nPitch · Wings ... REDUCE AOA · LEVEL\nThrottles ... FULL FORWARD\nAirspeed ... Vx 90 / Vy 105\nGear / Flaps (if extended) ... UP — POSITIVE RATE"
 },
 {
  "title": "Vmc Demo — Setup",
  "group": "Maneuvers",
  "color": "#a37800",
  "text": "@EMERGENCY Engine Failure — Memory Items\nAltitude ... ≥ 3,500 FT AGL\nGear / Flaps ... UP / UP\nCowl Flaps ... OPEN\nStabilator Trim ... TAKEOFF RANGE\nMixtures / Propellers ... RICH / FULL FORWARD\nAirspeed ... ≥ 105 MPH BEFORE POWER CUT\nThrottle — Engine to Fail ... IDLE, SLOWLY\nProp — Engine to Fail ... WINDMILLING — NO FEATHER\nThrottle — Operating Engine ... FULL\nRudder / Bank ... TOWARD GOOD ENGINE / ≤ 5°\nPitch / Airspeed ... SE CLIMB ATTITUDE ≈ 116 MPH\n! Expect the gear warning horn (gear up, MP below 14\")."
 },
 {
  "title": "Vmc Demo — Recover",
  "group": "Maneuvers",
  "color": "#a37800",
  "text": "@EMERGENCY Engine Failure — Memory Items\n# Maneuver\nPitch ... RAISE SLOWLY — ≈ 1 MPH / SEC\nRudder ... INCREASE — HOLD HEADING\nRed Line ... 80 MPH\n# Recover at the first of\nLoss of directional control · stall horn · buffet\n# Recovery\nThrottle — Operating Engine ... REDUCE IMMEDIATELY\nPitch ... LOWER — REDUCE AOA\nHeading ... WITHIN 20° OF ENTRY\nThrottle — Operating Engine ... ADVANCE SMOOTHLY\nAirspeed ... Vyse 105\nBoth Throttles ... SYMMETRICAL POWER\n! Spin: BOTH THROTTLES IDLE · FULL OPPOSITE RUDDER · WHEEL FORWARD · AILERONS NEUTRAL"
 },
 {
  "title": "One Engine Inoperative Approach",
  "group": "Maneuvers",
  "color": "#a37800",
  "text": "@EMERGENCY Engine Failure — Memory Items\n# POH 3-13\nInoperative Engine ... FEATHERED\nAltitude & Airspeed ... EXTRA — LAND THE FIRST TIME\nGear ... DOWN — 3 GREENS, 1 IN THE MIRROR\nFlaps ... NOT UNTIL CERTAIN OF FIELD (MAX 25°)\nFinal Approach Speed ... 105 MPH\nRudder Trim ... ADJUST AS POWER CHANGES\n! Single-engine go-around only if unavoidable.\n-> FEATHER | Feathering procedure : Feathering Procedure\n-> SE GO AROUND | if unavoidable : Single-Engine Go Around"
 }
];
