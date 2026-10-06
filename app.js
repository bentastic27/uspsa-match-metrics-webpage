'use strict';

const CLASS_ORDER = ['GM', 'M', 'A', 'B', 'C', 'D', 'U', 'X', 'Unclassified'];
const ZONES = ['A', 'C', 'D', 'M', 'NS', 'PEN'];
const ZONE_LABEL = { A: 'A', C: 'C', D: 'D', M: 'Miss', NS: 'No Shoot', PEN: 'Penalties' };
// Penalty count = these columns summed. Misses/No Shoots are their own columns;
// "Double Poppers" is a target count and "Total Penalty" is points, so neither is used.
const PENALTY_COLS = ['Procedural', 'Double Popper Miss', 'Late Shot', 'Extra Shot', 'Extra Hit', 'Additional Penalty'];

// Sections are one letter + space + CSV; D/F/H are header rows for E/G/I.
// PractiScore doesn't quote fields (names can hold bare quotes), so split naively.
function parseExport(text) {
  const info = {};
  const header = {};
  const rows = { E: [], G: [], I: [] };
  const pair = { E: 'D', G: 'F', I: 'H' };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('$INFO ')) {
      const i = line.indexOf(':');
      if (i > 0) info[line.slice(6, i).trim()] = line.slice(i + 1).trim();
      continue;
    }
    if (line[1] !== ' ') continue;
    const sec = line[0];
    const fields = line.slice(2).split(',');
    if (sec === 'D' || sec === 'F' || sec === 'H') header[sec] = fields;
    else if (rows[sec]) rows[sec].push(fields);
  }
  for (const s of Object.keys(pair)) {
    if (!header[pair[s]]) throw new Error('Missing section ' + pair[s] + ' (is this a PractiScore results export?)');
  }
  const toObj = (sec, fields) => {
    const h = header[pair[sec]], o = {};
    h.forEach((k, i) => { o[k] = fields[i] === undefined ? '' : fields[i]; });
    return o;
  };

  const comps = new Map();
  for (const f of rows.E) {
    const o = toObj('E', f);
    comps.set(o.Comp, {
      id: o.Comp,
      name: (o.FirstName + ' ' + o.LastName).trim(),
      division: o.Division || 'Unknown',
      cls: o.Class || 'Unclassified',
    });
  }

  // Chrono and other zero-point stages carry no hits.
  const stages = [];
  const stageKey = (gun, n) => gun + '|' + n;
  for (const f of rows.G) {
    const o = toObj('G', f);
    if (o.ScoringType === 'Chrono' || !(Number(o['Maximum Points']) > 0)) continue;
    stages.push({ key: stageKey(o.Guntype, o.Number), num: Number(o.Number), gun: o.Guntype, name: o.Stage_name });
  }
  const stageByKey = new Map(stages.map(s => [s.key, s]));

  // DQ'd/DNF shooters have placeholder rows (zeroed score, bogus hits); skip them
  // along with anything with no hits recorded.
  const entries = [];
  let skipped = 0;
  for (const f of rows.I) {
    const o = toObj('I', f);
    const st = stageByKey.get(stageKey(o.Gun, o.Stage));
    const comp = comps.get(o.Comp);
    if (!st || !comp) continue;
    const e = { comp, stage: st };
    for (const z of ZONES) if (z !== 'PEN') e[z] = Number(o[z === 'M' ? 'Miss' : z === 'NS' ? 'No Shoot' : z]) || 0;
    e.PEN = PENALTY_COLS.reduce((n, c) => n + (Number(o[c]) || 0), 0);
    if (o.DQ === 'Yes' || o.DNF === 'Yes' || (e.A + e.C + e.D + e.M + e.NS === 0)) { skipped++; continue; }
    entries.push(e);
  }
  return {
    name: info['Match name'] || 'Match', date: info['Match date'] || '',
    comps: [...comps.values()], stages, entries, skipped,
  };
}

function aggregate(list) {
  const t = { n: 0, shooters: new Set(), A: 0, C: 0, D: 0, M: 0, NS: 0, PEN: 0 };
  for (const e of list) {
    t.n++; t.shooters.add(e.comp.id);
    for (const z of ZONES) t[z] += e[z];
  }
  t.shooterCount = t.shooters.size;
    return t;
}

function groupBy(list, keyFn) {
  const m = new Map();
  for (const e of list) {
    const k = keyFn(e.comp);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(e);
  }
  return m;
}

const classRank = c => { const i = CLASS_ORDER.indexOf(c); return i < 0 ? 99 : i; };
const divisionRank = (a, b) => a.localeCompare(b);

if (typeof module !== 'undefined') module.exports = { parseExport, aggregate, groupBy, ZONES, CLASS_ORDER, classRank };
