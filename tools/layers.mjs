// Phase 2 helper: for every name the app defines more than once (a later file wraps or replaces an earlier one), list each
// definition in run order. Reads src/app/page.json. Prints a summary, or one name in detail.
//   node tools/layers.mjs                 names defined 2+ times, most layers first
//   node tools/layers.mjs <name>          every definition of <name>: run position, file, line, kind
//   node tools/layers.mjs --feature <f>   names whose definitions touch scripts/<f>/
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..'), SRC = path.join(root, 'src');
const page = JSON.parse(fs.readFileSync(path.join(SRC, 'app', 'page.json'), 'utf8'));
const files = page.parts.map((p, i) => ({ i, f: p.file })).filter(x => x.f && x.f.endsWith('.js'));
const ID = '[A-Za-z_$][\\w$]*';
const pats = [
  ['function', new RegExp(`(?:^|[^.\\w$])(?:async\\s+)?function\\s*\\*?\\s*(${ID})\\s*\\(`, 'g')],
  ['assign', new RegExp(`(?:^|[;{}(,\\s])(${ID})\\s*=\\s*(?:async\\s+)?(?:function\\b|\\([^()]*\\)\\s*=>|${ID}\\s*=>)`, 'g')],
  ['const', new RegExp(`(?:const|let|var)\\s+(${ID})\\s*=\\s*(?:async\\s+)?(?:function\\b|\\([^()]*\\)\\s*=>|${ID}\\s*=>)`, 'g')],
];
const defs = {};
for (const { i, f } of files) {
  const s = fs.readFileSync(path.join(SRC, f), 'utf8'), lines = s.split('\n');
  lines.forEach((ln, k) => { for (const [kind, re] of pats) { re.lastIndex = 0; let m;
    while ((m = re.exec(ln))) { const n = m[1]; if (/^(if|for|while|switch|catch|return|function)$/.test(n)) continue;
      const before = ln.slice(0, m.index + m[0].indexOf(n)); if (kind === 'assign' && /(?:const|let|var)\s*$/.test(before)) continue;
      (defs[n] = defs[n] || []).push({ pos: i, file: f.replace(/^app\/scripts\//, ''), line: k + 1, kind, wraps: kind !== 'function' && new RegExp(`_\\w*\\s*=\\s*${n.replace(/\$/g, '\\$')}\\b`).test(lines.slice(Math.max(0, k - 1), k + 1).join('\n')) }); } } });
}
const a = process.argv.slice(2);
if (a[0] === "--json") { console.log(JSON.stringify(Object.fromEntries(Object.entries(defs).filter(([, v]) => v.length > 1)))); process.exit(0); }
if (a[0] && a[0] !== '--feature') { const L = defs[a[0]] || []; console.log(`${a[0]}: ${L.length} definition(s)`); L.forEach(d => console.log(`  #${d.pos} ${d.file}:${d.line} ${d.kind}${d.wraps ? ' (wraps previous)' : ''}`)); process.exit(0); }
let L = Object.entries(defs).filter(([, v]) => v.length > 1);
if (a[0] === '--feature') L = L.filter(([, v]) => v.some(d => d.file.startsWith(a[1] + '/')));
L.sort((x, y) => y[1].length - x[1].length);
console.log(`${L.length} names defined more than once (${L.reduce((s, [, v]) => s + v.length - 1, 0)} extra layers)`);
for (const [n, v] of L) console.log(`${String(v.length).padStart(3)}  ${n.padEnd(22)} ${[...new Set(v.map(d => d.file.split('/')[0]))].join(',')}`);
