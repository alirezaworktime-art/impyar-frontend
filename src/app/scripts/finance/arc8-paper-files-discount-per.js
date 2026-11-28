/* ---------- arc8: paper files — discount per treatment (clinic / doctor / total; % or amount), Enter moves to the next field,
   no «پزشک پرونده», past payment dates kept on edit, next-stage box on edit, extraction 1/2/3, «نسج سخت» hidden ---------- */
/* (5) extraction 1/2/3 in one group; hard tissue no longer offered (old lines still open) */
(function () {
  const i = A6CAT.findIndex(x => x.k === 'ext'); if (i >= 0) { const e = A6CAT[i]; e.t = 'کشیدن دندان ۱'; e.g = 'extg'; /* group key ≠ treatment key 'ext' */
    const mk = n => ({ k: 'ext' + n, t: 'کشیدن دندان ' + ['', '۱', '۲', '۳'][n], s: 'R', g: 'extg', m: 't', p: e.p });
    A6CAT.splice(i + 1, 0, mk(2), mk(3)); A6C.ext2 = A6CAT[i + 1]; A6C.ext3 = A6CAT[i + 2]; }
  A6G.extg = 'کشیدن دندان';
  A6CAT.forEach(x => { if (x.g === 'hard') x.hid = 1 });
})();
{ const _b = a6ListBtns; a6ListBtns = function (side) { const keep = A6CAT.slice(); try { const used = new Set((A6 && A6.lines || []).map(l => l.k)); for (let i = A6CAT.length - 1; i >= 0; i--) if (A6CAT[i].hid && !used.has(A6CAT[i].k)) A6CAT.splice(i, 1); return _b.apply(this, arguments) } finally { A6CAT.length = 0; keep.forEach(x => A6CAT.push(x)) } } }
/* (1) discount per treatment line */
const A8_K = [['c', 'تخفیف سهم کلینیک'], ['d', 'تخفیف سهم پزشک'], ['t', 'تخفیف کل']];
const a8Base = l => (typeof arbAmt === 'function' ? arbAmt(l) : a6Amt(l));
const a8V = (p, base) => { if (!p || p.v === '' || p.v == null) return 0; const v = Number(toEn(String(p.v)).replace(/[^\d.]/g, '')) || 0; return p.m === 'p' ? Math.round(base * Math.min(100, v) / 100) : Math.round(v) };
/* total, when given, is the whole discount of the line; the doctor share stays as typed and the clinic takes the rest */
function a8Line(l) { const base = a8Base(l), ds = l.ds || {}; const d = Math.min(base, a8V(ds.d, base)); let c, t = a8V(ds.t, base); if (t) { t = Math.min(base, t); c = Math.max(0, t - d) } else { c = Math.min(base - d, a8V(ds.c, base)); t = c + d } return { base, c, d, t } }
const a8Any = () => (A6 && A6.lines || []).some(l => l.ds && ['c', 'd', 't'].some(k => l.ds[k] && String(l.ds[k].v || '') !== '' && Number(toEn(String(l.ds[k].v)).replace(/[^\d.]/g, ''))));
/* a8Sync: arc8 base + arc9 (6) (the whole-file discount is added to the clinic share) */
function a8Sync() { if (A6 && a8Any()) { let c = 0, d = 0; A6.lines.forEach(l => { const r = a8Line(l); c += r.c; d += r.d }); A6.disc = { c: { m: 'a', v: String(c) }, d: { m: 'a', v: String(d) } } }
  try { const g = a9GdAmt(); if (g) { if (!a8Any()) { let d = 0; A6.lines.forEach(l => { d += a8Line(l).d }); A6.disc = { c: { m: 'a', v: String(g) }, d: { m: 'a', v: String(d) } } } else A6.disc.c = { m: 'a', v: String(num(A6.disc.c.v) + g) } } } catch (e) { } }
function a8LineHTML(l) {
  if (!a6Money0()) return ''; const ds = l.ds || {}, r = a8Line(l);
  return `<div class="a8ds" data-a8l="${l.id}">${A8_K.map(([k, lb]) => { const p = ds[k] || { m: 'a', v: '' }; return `<div class="a8r"><span>${lb}</span><div class="seg" role="group"><button type="button" data-a8m="${k}" data-l="${l.id}" data-m="p" aria-pressed="${p.m === 'p'}">درصد</button><button type="button" data-a8m="${k}" data-l="${l.id}" data-m="a" aria-pressed="${p.m !== 'p'}">مبلغ</button></div><input data-a8v="${k}" data-l="${l.id}" inputmode="numeric" value="${esc(p.v === '' || p.v == null ? '' : p.m === 'p' ? faD(String(p.v)) : fmtInput(String(p.v)))}" placeholder="${p.m === 'p' ? '٪' : 'تومان'}" aria-label="${lb}"><b data-a8o="${k}-${l.id}">${fa(r[k])}</b></div>` }).join('')}<div class="a8r a8net"><span>پس از تخفیف</span><b data-a8o="n-${l.id}">${fa(r.base - r.t)}</b></div></div>`
}
{ const _l = a6Line; a6Line = function (l) { let h = _l.apply(this, arguments); try { const blk = a8LineHTML(l); if (blk) { const i = h.lastIndexOf('</div>'); h = h.slice(0, i) + blk + h.slice(i) } } catch (e) { } return h } }
function a8Paint(lid) { const l = A6 && A6.lines.find(x => x.id === lid); if (!l) return; const r = a8Line(l); [['c', r.c], ['d', r.d], ['t', r.t], ['n', r.base - r.t]].forEach(([k, v]) => { const b = document.querySelector(`[data-a8o="${k}-${CSS.escape(lid)}"]`); if (b) b.textContent = fa(v) }); try { a6MoneyUpd() } catch (e) { } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-a8m]'); if (!t || !A6) return; e.preventDefault(); e.stopPropagation(); const l = A6.lines.find(x => x.id === t.dataset.l); if (!l) return; l.ds = l.ds || {}; const k = t.dataset.a8m; l.ds[k] = { m: t.dataset.m, v: '' }; A6.dirty = true; t.closest('.seg').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === t))); const i = t.closest('.a8r').querySelector('input'); if (i) { i.value = ''; i.placeholder = t.dataset.m === 'p' ? '٪' : 'تومان'; i.focus() } a8Paint(l.id) }, true);
document.addEventListener('input', e => { const i = e.target; if (!i || !i.dataset || !i.dataset.a8v || !A6) return; const l = A6.lines.find(x => x.id === i.dataset.l); if (!l) return; l.ds = l.ds || {}; const k = i.dataset.a8v, m = (l.ds[k] || {}).m || 'a'; if (m === 'a') { const v = toEn(i.value).replace(/[^\d]/g, ''); i.value = v ? fmtInput(v) : ''; l.ds[k] = { m, v } } else { l.ds[k] = { m, v: toEn(i.value).replace(/[^\d.]/g, '') } } A6.dirty = true; a8Paint(l.id) }, true);
/* the per-line discount goes with the save; the file-level discount is their sum */
{ const _a = api; api = function (action, payload) { try { if (action === 'fxArc' && payload && payload.arc && payload.arc.v6 && A6) { a8Sync(); const by = {}; A6.lines.forEach(l => by[l.id] = l.ds); (payload.arc.lines || []).forEach(x => { const base = String(x.id || '').replace(/-(ir|ko|it|sw|rt)$/, ''); if (by[base] && !x.ds) x.ds = by[base] }); if (a8Any()) payload.arc.disc = { c: { m: 'a', v: A6.disc.c.v }, d: { m: 'a', v: A6.disc.d.v } } } } catch (e) { } return _a.apply(this, arguments) } }
/* (3) no «پزشک پرونده»: the file doctor is the doctor of the first treatment */
{ const _s = a6Save; a6Save = function () { try { if (A6) { const f = A6.lines.slice().sort((a, b) => String(a.day).localeCompare(String(b.day)))[0]; A6.doc = (f && f.doc) || A6.doc || '' } } catch (e) { } return _s.apply(this, arguments) } }
/* (2) Enter moves to the next field (textarea keeps Enter; buttons and selects keep their own Enter) */
document.addEventListener('keydown', e => { if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.altKey || e.isComposing) return; const t = e.target, R = document.getElementById('a6Root'); if (!R || !t || !R.contains(t) || !t.matches('input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit])')) return;
  e.preventDefault(); const F = [...R.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([disabled]):not([readonly]),select:not([disabled]),textarea:not([disabled])')].filter(x => x.offsetParent !== null); const i = F.indexOf(t); const n = F[i + 1]; if (n) { n.focus(); if (n.select && n.tagName === 'INPUT') try { n.select() } catch (x) { } } else { const s = document.getElementById('a6Save'); if (s) s.focus() } }, true);
