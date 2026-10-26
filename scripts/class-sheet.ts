// Builds a PRIVATE printable class sheet (logins + unlock codes) from class/names.txt.
// Output: class/class-sheet.html. The class/ folder is git-ignored: never publish it.
// Run: npm run class-sheet
import { readFileSync, writeFileSync } from 'node:fs';
import { STAGES, loginCode, normaliseName, stageCode } from '../src/lib/codes';
import { CLASS_CODE } from '../src/data/config';

const names = readFileSync('class/names.txt', 'utf8').split('\n').map((n) => n.trim()).filter(Boolean);
const seen = new Map<string, string>();
for (const n of names) {
  const k = normaliseName(n);
  if (seen.has(k)) throw new Error(`"${n}" and "${seen.get(k)}" would get the same codes. Add a surname initial to one of them.`);
  seen.set(k, n);
}
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

const rows = names
  .map((n) => `<tr><td class="n">${esc(n)}</td><td class="pw">${loginCode(n)}</td>${STAGES.map((_, i) => `<td>${stageCode(n, i)}</td>`).join('')}</tr>`)
  .join('');

const cards = names
  .map(
    (n) => `<div class="card"><div class="t">BEND IT QUEST · K07</div><div class="nm">${esc(n)}</div>
<div class="lg">Name: <b>${esc(n)}</b> &nbsp; Password: <b class="pw">${loginCode(n)}</b></div>
<p class="hint">Log in in Jess's room. Chapter 1 is open straight away. Keep this card secret. Your unlock codes come from your teacher.</p></div>`,
  )
  .join('');

const strips = STAGES.map(
  (st, i) => `<h2>Code ${i + 1}: ${st.label}</h2><div class="strips">${names
    .map((n) => `<div class="strip"><b>${esc(n)}</b> · Code ${i + 1} (${st.label}): <span class="pw">${stageCode(n, i)}</span></div>`)
    .join('')}</div>`,
).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Bend It Quest – Class sheet (CONFIDENTIAL)</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:24px}
h1{margin:0 0 4px}h2{margin:28px 0 8px;font-size:16px}
.warn{background:#fff3cd;border:1px solid #e0b100;padding:8px 12px;border-radius:6px;font-size:13px}
table{border-collapse:collapse;width:100%;font-size:13px;margin-top:12px}
th,td{border:1px solid #999;padding:5px 7px;text-align:center}th{background:#eee}td.n{text-align:left;font-weight:bold}
.pw,td{font-family:'Courier New',monospace;font-weight:bold;letter-spacing:.08em}td.n{font-family:Arial}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.card{border:2px dashed #555;border-radius:8px;padding:10px 12px;break-inside:avoid}
.card .t{font-size:10px;letter-spacing:.2em;color:#666}.card .nm{font-size:20px;font-weight:bold;margin:2px 0 6px}
.card .lg{font-size:14px}.card .hint{font-size:11px;color:#555;margin:6px 0 0}
.strips{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.strip{border:1px dashed #777;padding:6px 8px;font-size:12px;break-inside:avoid}
.page{break-before:page}
@media print{.warn{display:none}}
</style></head><body>
<h1>Bend It Quest · Class sheet</h1>
<div>K07 · ${names.length} students · teacher copy · CONFIDENTIAL</div>
<p class="warn">Do not upload or share this page. It is generated locally and is not part of the public app. Names are entered exactly as on the cards (capitals and spaces don't matter).</p>
<h2>Class code for everyone (login + Chapter 1): <span class="pw">${CLASS_CODE}</span></h2><p>Students log in with their first name exactly as below + the class code. From Code 1 (Chapters 2–5) everything is personal.</p><h2>Overview</h2>
<table><tr><th>Name</th><th>Login password</th>${STAGES.map((st, i) => `<th>Code ${i + 1}<br><small>${st.label}</small></th>`).join('')}</tr>${rows}</table>
<div class="page"><h2>Login cards (cut out, one per student)</h2><div class="cards">${cards}</div></div>
<div class="page"><h2>Unlock-code strips (cut out and hand out one stage at a time)</h2>${strips}</div>
</body></html>`;

writeFileSync('class/class-sheet.html', html);
const csv = ['Name,Login password,' + STAGES.map((st, i) => `Code ${i + 1} (${st.label})`).join(',')]
  .concat(names.map((n) => [n, loginCode(n), ...STAGES.map((_, i) => stageCode(n, i))].join(',')))
  .join('\n');
writeFileSync('class/class-codes.csv', csv);
console.log(csv);
