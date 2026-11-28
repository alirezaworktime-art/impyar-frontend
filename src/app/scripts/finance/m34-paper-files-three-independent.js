
/* ---------- m34 (owner, 2026-11-16): paper files — «پایه ایمپلنت»: «جدید / کاشت مجدد اول / کاشت مجدد دوم» are three independent tabs of one session
   (each tab = its own line: teeth, brand/size, tariff, date, doctor); a new tab takes date and doctor from the tab it was opened from.
   Lines of one session share l.grp (kept on the server). ---------- */
const m34G = l => l.grp || l.id;
const m34Sib = l => A6.lines.filter(x => x.k === 'imp' && !x.ax && m34G(x) === m34G(l));
let M34A = {}; /* active tab per group */
const m34Act = l => { const g = m34G(l), sib = m34Sib(l); let a = M34A[g]; if (a == null || !sib.some(x => (+x.ri || 0) === a)) a = +(sib[0] || l).ri || 0; return a };
{ const _l = a6Line; a6Line = function (l) { let h = _l.apply(this, arguments); if (!l || l.k !== 'imp' || l.ax || !A6) return h;
  try { const sib = m34Sib(l), act = m34Act(l), mine = +l.ri || 0;
    const cnt = v => { const x = sib.find(s => (+s.ri || 0) === v); return x && x.teeth && x.teeth.length ? ' (' + fa(x.teeth.length) + ')' : '' };
    h = h.replace(/(<button type="button" class="chip" role="radio" data-a13ri="(\d)" data-l="[^"]*" aria-pressed=")(true|false)(" aria-checked=")(true|false)(">)([^<]*)(<\/button>)/g,
      (m, a, v, p1, b, p2, c, t, e) => (a + (+v === act) + b + (+v === act) + c + t + cnt(+v) + e).replace('data-a13ri=', 'data-m34ri='));
    h = h.replace('<div class="a13ri"><span>این جلسه</span>', '<div class="a13ri"><span>این جلسه (هر کدام جدا)</span>');
    { const gs = [...new Set(A6.lines.filter(x => x.k === 'imp' && !x.ax).map(m34G))], gi = gs.indexOf(m34G(l));
      h = h.replace(/<div class="a6lh"><b>[^<]*<\/b>/, '<div class="a6lh"><b>' + (gs.length > 1 ? 'جلسه‌ی ' + fa(gi + 1) : 'جلسه') + ' · ' + esc(A13_RI[mine] || '') + '</b>');
      if (sib.length > 1) h = h.replace(/(data-a6del="[^"]*">)حذف این جلسه(<\/button>)/, '$1حذف «' + esc(A13_RI[mine] || '') + '»$2') }
    if (mine !== act) h = h.replace(/^(\s*)<div class="a6l/, '$1<div hidden class="m34off a6l'); } catch (e) {}
  return h } }
window.addEventListener('click', e => { const t = e.target && e.target.closest && e.target.closest('[data-m34ri]'); if (!t || !A6) return; const l = a6L(t.dataset.l); if (!l || l.k !== 'imp') return;
  e.preventDefault(); e.stopImmediatePropagation(); const v = +t.dataset.m34ri, g = m34G(l), sib = m34Sib(l);
  let x = sib.find(s => (+s.ri || 0) === v);
  if (!x) { const cur = sib.find(s => (+s.ri || 0) === m34Act(l)) || l;
    if (sib.length === 1 && !(cur.teeth || []).length) { cur.ri = v; x = cur }   /* an empty session just changes its kind */
    else { x = a6NewLine('imp'); A6.lines.splice(A6.lines.indexOf(x), 1); A6.lines.splice(A6.lines.indexOf(sib[sib.length - 1]) + 1, 0, x);
      Object.assign(x, { ri: v, grp: g, day: cur.day || '', dayJ: cur.dayJ || '', doc: cur.doc || '', teeth: [], imp: {}, n: 0, b: '' }); x.price = v ? 0 : (A6C.imp.p(x) || 0);
      if (!l.grp) sib.forEach(s => { s.grp = g }) } }
  M34A[g] = v; A6.dirty = true; const sc = window.scrollY; a6Render(); window.scrollTo(0, sc); try { a6MoneyLite() } catch (x2) {} }, true);
/* save: an empty tab next to a filled one is dropped; the error for an empty tab opens that tab */
{ const _s = a6Save; a6Save = function () { try { if (A6) { const G = {}; A6.lines.filter(x => x.k === 'imp' && !x.ax).forEach(x => (G[m34G(x)] = G[m34G(x)] || []).push(x));
    for (const g of Object.keys(G)) { const L = G[g]; if (L.length > 1 && L.some(x => (x.teeth || []).length)) { const drop = L.filter(x => !(x.teeth || []).length); if (drop.length) { A6.lines = A6.lines.filter(x => !drop.includes(x)); if (drop.some(x => (+x.ri || 0) === M34A[g])) delete M34A[g] } }
      const empty = (G[g] || []).find(x => A6.lines.includes(x) && !(x.teeth || []).length); if (empty) M34A[g] = +empty.ri || 0 }
    a6Render() } } catch (e) {} return _s.apply(this, arguments) } }
{ const _f = a6From; a6From = function () { M34A = {}; return _f.apply(this, arguments) } }
/* every line keeps its group on the way to the server */
{ const _a = api; api = function (action, payload) { try { if (action === 'fxArc' && payload && payload.arc && payload.arc.v6 && A6) (payload.arc.lines || []).forEach(x => { if (x.k !== 'imp') return; const l = A6.lines.find(y => y.id === x.id); if (l && l.grp) x.grp = l.grp }) } catch (e) {} return _a.apply(this, arguments) } }
/* the side list counts sessions, not tabs */
{ const _b = a6ListBtns; a6ListBtns = function () { if (!A6) return _b.apply(this, arguments); const keep = A6.lines, seen = new Set();
  A6.lines = keep.filter(l => { if (l.k !== 'imp' || l.ax) return true; const g = m34G(l); if (seen.has(g)) return false; seen.add(g); return true });
  try { return _b.apply(this, arguments) } finally { A6.lines = keep } } }
