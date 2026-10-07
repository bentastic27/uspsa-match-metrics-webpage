# uspsa-match-metrics-webpage

Static, no-build, no-dependency page: load a PractiScore USPSA results export and see
hit/penalty breakdowns by division and class. `index.html` (UI) + `app.js` (parse and
aggregate, no DOM). Read [README.md](README.md) for usage and the metric definitions.

## Working here

- There's no Node on the owner's Mac and no test suite. Verify by serving the folder
  (`python3 -m http.server <port>`), opening it in the browser pane, and loading a real
  export (call `load(text)` from the console, or use the file input). Check both tabs
  and the dropdown combinations.
- Real exports contain shooters' names and member numbers. Never commit one. If you
  copy one into the repo to serve it, delete it before committing.
- This repo is public and the owner's workflow here is commit and push to `main`. The
  owner's other repo (bensblasterscom) is the private one and deploys to production,
  so don't confuse the two.
- Commits end with the `Co-Authored-By: Claude ...` trailer.

## Data gotchas

- Sections are `<letter> <csv>`; `D/F/H` are headers for `E/G/I`. Map columns by header
  name, not position. Fields are unquoted and names contain bare `"`, so split on `,`
  only (a CSV parser breaks).
- PractiScore writes placeholder rows for DQ/DNF shooters (zeroed score, bogus hits);
  `parseExport` skips them and empty rows. Stage 11 in the sample was a Chrono stage with
  0 max points; stages with `Chrono` scoring or 0 max points are dropped.
- B is always 0 in current exports (B zone was removed from USPSA). It was removed from
  the UI at the owner's request. Class "B" (shooter classification) is unrelated.
- "Double Poppers" is a target count, "Total Penalty" is points. Penalties are the sum
  of the individual penalty count columns (see `PENALTY_COLS` in `app.js`).
- Blank class means unclassified and is shown as "Unclassified".

## Design decisions (the owner iterated on these; don't undo without asking)

- Division and Class dropdowns are shared across tabs. "Each" splits, "All" merges,
  a value filters. On the Stage Charts tab "Each division" is hidden, and switching to
  that tab resets it to All; the Class dropdown is disabled there.
- Charts are 100% stacked per stage (percent of A+C+D+Miss+NS+Penalties, penalties in
  the denominator), with a custom hover tooltip giving exact counts. Every zone is
  toggleable from the legend; the last visible zone can't be turned off.
- No percentages in the counts table: the owner found them misleading without the
  other hit counts. Under each chart is a table of all zones by stage, regardless of
  which zones are toggled in the chart.
- Tables have column dividers and zebra striping; light and dark themes via CSS vars.
- Title is "USPSA Match Score Breakdown"; tab buttons are "Counts by Group" and
  "Stage Charts". Footer credits "Vibe coded by Ben Healey with Claude" with links to
  this repo and https://bensblasters.com/.

## License

MIT, copyright Ben Healey (chosen so attribution must be kept; the owner doesn't mind
redistribution).
