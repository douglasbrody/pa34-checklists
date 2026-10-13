# PA-34-200 Checklists

Offline checklist viewer for iPad (also iPhone and desktop). Big tiles, text that resizes to fit the screen, Day / Night / Red modes.

**Install:** open https://douglasbrody.github.io/pa34-checklists/ in Safari on the iPad → Share → **Add to Home Screen** → open it once from the icon while online. After that it works in airplane mode (Edit shows "offline ready").

**Features:** normal, emergency and maneuver checklists; wind & runway entry for departure and arrival, shown as crosswind / headwind on the checklists; takeoff data for the crew briefing; Hobbs / tach times; a scan reminder on emergency checklists.

**Checklist text format** (Edit › a checklist): `Item ... RESPONSE`, `# Section`, `! Caution`, `* highlighted`, `^ pulsing`, `| table | row |`, `{dep.sum}`-style flight-data tokens, `-> LABEL | subtitle : Checklist title` buttons, and `@HIDDEN`, `@BRANCH`, `@ATIS DEP` directives.

**Updating:** edit checklists in the app (Edit button), or regenerate `defaults.js` from the spreadsheet with `tools/convert_xlsx.py` (bump `DEFAULTS_VERSION` and add the previous version's signature to `KNOWN_SIGS`); then bump `VERSION` in `sw.js`.
