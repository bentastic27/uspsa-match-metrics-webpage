# uspsa-match-metrics-webpage

Static, JavaScript-only page that breaks a USPSA match's accuracy (A, C, D, Miss,
No Shoot, penalties) down by division and class, per stage and for the match total.

Open `index.html` in a browser and load a PractiScore results export (`.txt`). Nothing
is uploaded; parsing happens locally. Serve it from any static host, or locally with
`python3 -m http.server`.

Export format: sections are one letter plus a CSV row. D/F/H are header rows for the
competitor (E), stage (G) and score (I) rows; scores link to competitors by comp number.
DQ/DNF shooters, empty scores and chrono stages are excluded.
