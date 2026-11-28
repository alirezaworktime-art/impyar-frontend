// Phase 2 safety check: a name that only exists INSIDE a closure (IIFE or block) of one file must not be used by another file
// that does not declare it itself — the old patch layers often kept helpers private, and moving code between files can turn a
// working call into a ReferenceError that a try/catch then hides (an empty list instead of an error).
//   node tools/scope-check.mjs            report suspects in the current src/
// Small tokenizer: tracks brace depth and skips strings, template literals (with ${…}), comments and regular expressions.
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..'), SRC = path.join(root, 'src');
const page = JSON.parse(fs.readFileSync(path.join(SRC, 'app', 'page.json'), 'utf8'));
const files = page.parts.filter(p => p.file && p.file.endsWith('.js')).map(p => p.file);
const KW = new Set('break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield await async of null true false undefined NaN Infinity arguments'.split(' '));
function scan(src) {
  const top = new Set(), local = new Set(), uses = new Map(); let depth = 0, i = 0, prev = '', prevTok = '';
  const regexOk = () => !prev || /[(,=:[!&|?{};+\-*%<>~^]/.test(prev) || ['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'yield', 'await'].includes(prevTok);
  const stack = [];   // template literal nesting: depth at which ${ was opened
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i = src.indexOf('*/', i + 2); i = i < 0 ? src.length : i + 2; continue; }
    if (c === '"' || c === "'") { i++; while (i < src.length && src[i] !== c) { if (src[i] === '\\') i++; i++; } i++; prev = 'x'; prevTok = ''; continue; }
    if (c === '`' || (c === '}' && stack.length && stack[stack.length - 1] === depth)) {
      if (c === '}') stack.pop(); i++;
      while (i < src.length && src[i] !== '`') { if (src[i] === '\\') { i += 2; continue; } if (src[i] === '$' && src[i + 1] === '{') { stack.push(depth); i += 2; break; } i++; }
      if (src[i] === '`') i++; prev = 'x'; prevTok = ''; continue; }
    if (c === '/' && regexOk()) { i++; let cls = false; while (i < src.length && (src[i] !== '/' || cls)) { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; else if (src[i] === '\n') break; i++; } i++; while (/[a-z]/i.test(src[i] || '')) i++; prev = 'x'; prevTok = ''; continue; }
    if (c === '{') { depth++; prev = c; prevTok = ''; i++; continue; }
    if (c === '}') { depth--; prev = c; prevTok = ''; i++; continue; }
    if (/[A-Za-z_$]/.test(c)) { let j = i; while (/[\w$]/.test(src[j] || '')) j++; const w = src.slice(i, j);
      const isProp = prev === '.' || (/^\s*:/.test(src.slice(j, j + 3)) && /[{,]/.test(prev) && depth > 0);
      if (['function', 'const', 'let', 'var', 'class'].includes(prevTok) && !KW.has(w)) { (depth === 0 ? top : local).add(w); }
      else if (!isProp && !KW.has(w)) uses.set(w, (uses.get(w) || 0) + 1);
      prevTok = w; prev = 'w'; i = j; continue; }
    if (!/\s/.test(c)) { prev = c; prevTok = c === ',' && ['const', 'let', 'var'].includes(prevTok) ? prevTok : ''; }
    i++;
  }
  return { top, local, uses };
}
const S = Object.fromEntries(files.map(f => [f, scan(fs.readFileSync(path.join(SRC, f), 'utf8'))]));
const globals = new Set(); for (const f of files) S[f].top.forEach(n => globals.add(n));
// names assigned as globals without a declaration (x = …, window.x = …) also exist globally
for (const f of files) { const s = fs.readFileSync(path.join(SRC, f), 'utf8'); for (const m of s.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)) globals.add(m[1]); }
const browser = new Set('window document console localStorage sessionStorage navigator location history fetch setTimeout clearTimeout setInterval clearInterval requestAnimationFrame cancelAnimationFrame Promise Object Array String Number Boolean Math JSON Date RegExp Error Map Set WeakMap Symbol URL URLSearchParams Blob File FileReader FormData Headers Request Response Image Intl TextEncoder TextDecoder crypto performance alert confirm prompt getComputedStyle MutationObserver ResizeObserver IntersectionObserver CustomEvent Event KeyboardEvent HTMLElement Node NodeFilter AbortController structuredClone atob btoa encodeURIComponent decodeURIComponent escape unescape parseInt parseFloat isFinite isNaN queueMicrotask indexedDB caches self globalThis screen matchMedia open print innerWidth innerHeight scrollTo scrollY devicePixelRatio Uint8Array ArrayBuffer DataView Proxy Reflect BigInt pdfjsLib e'.split(' '));
let n = 0;
for (const f of files) for (const name of S[f].local) {
  if (globals.has(name) || browser.has(name) || name.length < 2) continue;
  for (const g of files) { if (g === f) continue; const u = S[g].uses.get(name); if (!u || S[g].local.has(name) || S[g].top.has(name)) continue;
    n++; console.log(`SUSPECT ${name}: local in ${f.replace('app/scripts/', '')}, used ${u}× in ${g.replace('app/scripts/', '')} which does not declare it`); }
}
console.log(`${n} suspect(s)`); process.exit(n ? 1 : 0);
