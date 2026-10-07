# USPSA Match Score Breakdown

A static, JavaScript-only page that turns a PractiScore results export for a USPSA
match into an accuracy breakdown: A, C, D, Miss, No Shoot and penalty counts by
division and class, per stage and for the match total.

Everything runs in your browser. The export is read locally and never uploaded.

## Using it

Open `index.html` (or serve the folder from any static host) and drop in the match's
PractiScore results export (`.txt`). To run it locally:

```bash
python3 -m http.server 8000
```

then browse to <http://localhost:8000/>. There is no build step and no dependencies.

The **Division** and **Class** dropdowns at the top apply to both tabs. Each can be
combined ("All"), split ("Each"), or narrowed to one value.

- **Counts by Group**: one row per group (division, class, or division / class),
  with totals or averages per shooter-stage. Pick a stage as the scope, or the match
  total. Click a column header to sort; export to CSV.
- **Stage Charts**: one 100% stacked bar per stage, first for all classes combined,
  then one chart per class. Hover a color for the exact count. Untick zones in the
  legend to hide them and rescale. Under each chart is a stage table with the counts
  for every zone. "Each division" isn't available here; pick a division or all.

## What the numbers mean

- A, C, D, Miss and No Shoot are the hit counts from the export. B isn't a scoring
  zone in current USPSA rules, so it isn't shown.
- **Penalties** = Procedural + Double Popper Miss + Late Shot + Extra Shot +
  Extra Hit + Additional Penalty (counts, not points). Misses and No Shoots are
  separate columns. The export's "Double Poppers" column is a target count and
  "Total Penalty" is points, so neither is used.
- "Avg per shooter-stage" divides by the number of shooter-stage scores in the row.
- DQ/DNF shooters and scores with nothing recorded are excluded (PractiScore writes
  placeholder rows for them). Chrono and other zero-point stages are ignored.

## Export format

The file is several CSVs in one, each line prefixed with a section letter and a space.
`D`, `F` and `H` are header rows for the competitor (`E`), stage (`G`) and score (`I`)
rows. Scores link to competitors by comp number. `$INFO` lines carry the match name
and date. Fields aren't quoted, so names can contain bare quotes; lines are split on
commas only.

## Files

- `index.html`: the UI, rendering and styles.
- `app.js`: parsing and aggregation (no DOM access).

## License

MIT, see [LICENSE](LICENSE). Keep the copyright notice when you reuse or redistribute it.

Vibe coded by Ben Healey with Claude. Also see <https://bensblasters.com/>.
