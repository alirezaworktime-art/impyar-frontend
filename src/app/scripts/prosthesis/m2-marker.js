/* ---------- m2: (marker) ---------- */
/* ---------- m2: paper files — «All on X» and «اوردنچر» get the tooth chart with brand + size per base (same window as «پایه ایمپلنت») and two prices: implants (per brand group, like «پایه ایمپلنت») + prosthesis (All on X: per base; overdenture: per jaw). The implants travel as a hidden companion «پایه ایمپلنت» line (id = parent id + 'x'), so stock, implant sessions and doctors' shares work as before. Under the patient details: «کامل / فقط ایمپلنت / فقط پروتز» with the rules of the main form. ---------- */
const M2_AX = { aox: 1, ovd: 1 };
const M2_ONLY = { '': 'کامل (ایمپلنت و پروتز)', i: 'فقط ایمپلنت', p: 'فقط پروتز (ایمپلنت در جای دیگر)' };
const M2_NO_I = { pros: 1, crw: 1, tmp: 1 };   /* «فقط ایمپلنت»: no prosthesis work */
const M2_NO_P = { ext: 1, ext2: 1, ext3: 1, imp: 1, gbr1: 1, gbr2: 1, gbr3: 1, gbr4: 1, sino1: 1, sino2: 1, sinc1: 1, sinc2: 1, alv1: 1, alv2: 1, alv3: 1, hard1: 1, hard2: 1, hard3: 1, tn1: 1, tn2: 1, tn3: 1, sgd: 1, sub: 1, vip: 1, ram: 1, unc: 1, fgg: 1, reimp: 1 }; /* «فقط پروتز»: no surgery */
const M2_ST_I = ['sut', 'unc', 'impw'], M2_ST_P0 = ['sut', 'unc', 'impw'];
const m2Cid = p => String(p.id).slice(0, 30) + 'x';
const m2Only = () => (A6 && A6.only) || '';
const m2Units = l => !l.teeth || !l.teeth.length ? num(l.n) : l.k === 'ovd' ? (new Set(l.teeth.map(t => t.slice(0, 1))).size || 1) : l.teeth.length;
const m2ImpAmt = l => m2Only() === 'p' ? 0 : arbAmt(Object.assign({}, l, { k: 'imp' }));
try { A6C.aox.m = 't'; A6C.ovd.m = 't'; A6C.aox.u = 'پایه'; A6C.ovd.u = 'فک' } catch (e) {}
/* keep the companions in step with their parent (same teeth / imp / gp objects) */
function m2Sync() { if (!A6) return; const S = A6, only = m2Only();
  S.lines = S.lines.filter(l => !(l.ax && !S.lines.some(p => p.id === l.ax && M2_AX[p.k])));
  for (const p of S.lines.filter(l => M2_AX[l.k])) { p.imp = p.imp || {}; p.gp = p.gp || {};
    if (p.teeth && p.teeth.length) p.n = m2Units(p);
    if (only === 'i') { if (!p.m2i) { p.pp = num(p.price); p.m2i = 1 } p.price = 0 } else if (p.m2i) { p.price = p.pp || A6C[p.k].p(p) || 0; delete p.pp; delete p.m2i }
    let c = S.lines.find(l => l.ax === p.id);
    if (only === 'p' || !p.teeth || !p.teeth.length) { if (c) S.lines = S.lines.filter(l => l !== c); continue }
    if (!c) { c = { id: m2Cid(p), k: 'imp', ax: p.id, ri: 0, txt: '', b: '' }; S.lines.push(c) }
    Object.assign(c, { day: p.day, dayJ: p.dayJ, doc: p.doc, sut: p.sut, teeth: p.teeth, imp: p.imp, gp: p.gp, fp: p.fp, n: p.teeth.length, price: 0 }); } }
/* opening: take the companions out before the older steps join «پایه ایمپلنت» sessions, then fold them into their parent */
{ const _f = a6From; a6From = function (j) { const a = j && j.data && j.data.arc; let comp = [];
  if (a && a.v6 && Array.isArray(a.lines)) { const P = a.lines.filter(l => M2_AX[l.k]).map(l => m2Cid(l));
    comp = a.lines.filter(l => l.k === 'imp' && P.includes(String(l.id).replace(/-(ir|ko|it|sw|rt|xx|k\d{1,2})$/, ''))); }
  const keep = a ? a.lines : null; if (comp.length) a.lines = keep.filter(l => !comp.includes(l));
  let S; try { S = _f.apply(this, arguments) } finally { if (comp.length) a.lines = keep }
  try { S.only = (a && ['i', 'p'].includes(a.only)) ? a.only : '';
    for (const p of S.lines.filter(l => M2_AX[l.k])) { p.imp = p.imp || {}; p.gp = p.gp || {}; const cid = m2Cid(p);
      for (const c of comp.filter(l => String(l.id).replace(/-(ir|ko|it|sw|rt|xx|k\d{1,2})$/, '') === cid)) {
        (c.teeth || []).forEach(t => { if (!p.teeth.includes(t)) p.teeth.push(t); const m = (c.imp || {})[t]; if (m && m.b) p.imp[t] = { b: m.b, d: m.d || '', l: m.l || '' } });
        const gs = [...new Set((c.teeth || []).map(t => ((c.imp || {})[t] || {}).b).filter(Boolean).map(arbG))]; if (gs.length === 1) p.gp[gs[0]] = num(c.price); if (c.fp != null && c.fp !== '') p.fp = num(c.fp);
        (c.teeth || []).forEach(t => { const m = (c.imp || {})[t]; if (m && m.f && p.imp[t]) p.imp[t].f = 1 }); } }
  } catch (e) {}
  return S } }
{ const _r = a6Render; a6Render = function () { try { m2Sync() } catch (e) {} const r = _r.apply(this, arguments);
  try { const R = $('a6Root'), g = R && R.querySelector('section.card .a6g2'); if (g && !R.querySelector('.m2only')) { const o = m2Only();
      g.insertAdjacentHTML('afterend', `<div class="grp m2only"><span>نوع درمان بیمار</span><div class="chips" role="radiogroup" aria-label="نوع درمان">${Object.entries(M2_ONLY).map(([k, t]) => `<button type="button" class="chip" role="radio" data-m2only="${k}" aria-pressed="${o === k}" aria-checked="${o === k}">${t}</button>`).join('')}</div>${o === 'i' ? '<small class="note">بخش‌های پروتز (مراحل پروتز، روکش، روکش موقت، سهم پروتز All on X و اوردنچر) بسته است و مرحله‌ها تا آنکاوری است.</small>' : o === 'p' ? '<small class="note">بخش‌های جراحی بسته است؛ برند و سایز ایمپلنت اختیاری است، از انبار کم نمی‌شود و مرحله‌ها از قالب‌گیری است.</small>' : ''}</div>`) } } catch (e) {}
  return r } }
/* the treatment list: rules of the chosen kind */
{ const _b = a6ListBtns; a6ListBtns = function () { if (!A6 || !A6.lines.some(l => l.ax)) return _b.apply(this, arguments); const keep = A6.lines; A6.lines = keep.filter(l => !l.ax); try { return _b.apply(this, arguments) } finally { A6.lines = keep } } }
{ const _b = a6ListBtns; a6ListBtns = function () { const o = m2Only(), N = o === 'i' ? M2_NO_I : o === 'p' ? M2_NO_P : null; if (!N) return _b.apply(this, arguments);
  const was = A6CAT.map(x => x.hid); A6CAT.forEach(x => { if (N[x.k]) x.hid = 1 }); try { return _b.apply(this, arguments) } finally { A6CAT.forEach((x, i) => { x.hid = was[i] }) } } }
/* stage choices */
{ const _o = a6StOpts; a6StOpts = function () { let h = _o.apply(this, arguments); const o = m2Only(); if (!o) return h;
  const d = document.createElement('select'); d.innerHTML = h; [...d.options].forEach(x => { const ok = o === 'i' ? M2_ST_I.includes(x.value) : !M2_ST_P0.includes(x.value); if (!ok) x.remove() });
  if (A6 && ![...d.options].some(x => x.value === A6.stage) && d.options[0]) { A6.stage = d.options[0].value; A6.type = (typeof A7_TYPE !== 'undefined' && A7_TYPE[A6.stage]) || 'fix' }
  [...d.options].forEach(x => { x.selected = A6 && x.value === A6.stage; if (x.selected) x.setAttribute('selected', ''); else x.removeAttribute('selected') }); return d.innerHTML } }
/* the «پایه ایمپلنت» panel never shows the companions */
{ const _p = a6Panel; a6Panel = function (k) { if (k !== 'imp' || !A6) return _p.apply(this, arguments); const keep = A6.lines; const own = keep.filter(l => !l.ax);
  if (!own.some(l => l.k === 'imp' || l.k === 'reimp')) return ''; A6.lines = own; try { return _p.apply(this, arguments) } finally { A6.lines = keep } } }
{ const _p = a6Panel; a6Panel = function (k) { let h = _p.apply(this, arguments); if (!M2_AX[k]) return h;
  return h.replace(/(<h3>[^<]*<small>)[^<]*(<\/small>)/, `$1تعرفه‌ی پروتز ${fa((A6C[k].p({}) || 0))} تومان ${k === 'aox' ? 'برای هر پایه' : 'برای هر فک'} + ایمپلنت‌ها با تعرفه‌ی برندشان$2`) } }
/* one All on X / overdenture session */
{ const _l = a6Line; a6Line = function (l) { if (!l || !M2_AX[l.k]) return _l.apply(this, arguments); try { m2Sync() } catch (e) {} let h = _l.apply(this, arguments); try {
  const o = m2Only(), money = a6Money0(), G = arbGroups(l), miss = o === 'p' ? [] : arbMiss(l), u = m2Units(l), uL = l.k === 'aox' ? 'پایه' : 'فک';
  h = h.replace(/<p class="note a6tn">[\s\S]*?<\/p>/, `<p class="note a6tn">${l.teeth.length ? 'پایه‌ها: ' + esc(toothTxt(l.teeth)) + ' · ' + fa(l.teeth.length) + ' ایمپلنت' + (l.k === 'ovd' ? ' · ' + fa(u) + ' فک' : '') : 'دندان‌های پایه را بزنید'}</p>`);
  const chips = l.teeth.length && o !== 'p' ? `<div class="arbl">${l.teeth.map(t => { const m = (l.imp || {})[t] || {}, ok = m.b && m.d && m.l; return `<button type="button" class="arbc${ok ? '' : ' bad'}" data-arbt="${t}" data-l="${l.id}"><b>${esc(toothTxt([t]))}</b> ${ok ? esc(m.b) + ' · ' + faD(String(m.d)) + '×' + faD(String(m.l)) : 'برند و سایز را بزنید'}</button>` }).join('')}</div>${miss.length ? '<p class="note arbm">برای ' + fa(miss.length) + ' پایه برند و سایز ثبت نشده؛ روی آن بزنید.</p>' : ''}` : '';
  const ip = money && o !== 'p' ? Object.keys(G).filter(Boolean).sort((a, b) => ARB_GO.indexOf(a) - ARB_GO.indexOf(b)).map(g => { const p = arbPr(l, g), d = arbDef(g); return `<label class="f">تعرفه‌ی ایمپلنت ${ARB_GL[g]} (هر عدد، تومان)<input data-arbgp="${g}" data-l="${l.id}" inputmode="numeric" class="price" value="${esc(fmtInput(String(p)))}"><small class="a6def">${fa(G[g].length)} عدد = <b data-arbga="${l.id}-${g}">${fa(G[g].length * p)}</b>${p !== d ? ' · پیش‌فرض ' + fa(d) + ' <button type="button" class="lnk" data-arbdef="' + g + '" data-l="' + l.id + '">برگرداندن</button>' : ''}</small></label>` }).join('') : '';
  if (o === 'i') h = h.replace(/<label class="f">تعرفه‌ی هر واحد \(تومان\)[\s\S]*?<\/b><\/div>/, '');
  else h = h.replace('تعرفه‌ی هر واحد (تومان)', 'تعرفه‌ی پروتز هر ' + uL + ' (تومان)').replace(/(<div class="a6amt"><span>)مبلغ(<\/span>)/, '$1پروتز (' + fa(u) + ' ' + uL + ')$2');
  const tot = money ? `<div class="m2tot"><span>ایمپلنت‌ها <b data-m2ia="${l.id}">${fa(m2ImpAmt(l))}</b></span><span>پروتز <b data-m2pa="${l.id}">${fa(o === 'i' ? 0 : a6Amt(l))}</b></span><span>مبلغ این جلسه <b data-m2ta="${l.id}">${fa(m2ImpAmt(l) + (o === 'i' ? 0 : a6Amt(l)))}</b></span></div>` : '';
  h = h.replace('<div class="a6sut">', `${chips}${ip ? '<div class="arbp">' + ip + '</div>' : ''}${tot}<div class="a6sut">`);
  } catch (e) {} return h } }
function m2Tot() { if (!A6) return; for (const l of A6.lines.filter(x => M2_AX[x.k])) { const o = m2Only(), i = m2ImpAmt(l), p = o === 'i' ? 0 : a6Amt(l);
  const s = (k, v) => { const e = document.querySelector(`[data-${k}="${l.id}"]`); if (e) e.textContent = fa(v) }; s('m2ia', i); s('m2pa', p); s('m2ta', i + p) } }
document.addEventListener('input', () => { try { if (A6 && !$('viewArc6').hidden) m2Tot() } catch (e) {} });
/* teeth: brand + size window (not for «فقط پروتز»), chips of the kind */
window.addEventListener('click', e => { const t = e.target && e.target.closest && e.target.closest('button'); if (!t || !A6) return; const d = t.dataset;
  if (d.m2only !== undefined) { e.preventDefault(); A6.only = d.m2only; A6.dirty = true; m2Sync(); const sc = window.scrollY; a6Render(); window.scrollTo(0, sc); return }
  if (d.a6t || d.arbt) { const l = a6L(d.l); if (!l || !M2_AX[l.k]) return; if (m2Only() === 'p') { if (d.arbt) { e.preventDefault(); e.stopImmediatePropagation() } return } e.preventDefault(); e.stopImmediatePropagation(); arbOpen(l, d.a6t || d.arbt) } }, true);
/* save: rules of the kind; every base has brand and size (unless «فقط پروتز») */
{ const _s = a6Save; a6Save = function (btn) { try { m2Sync(); const S = A6, o = m2Only(), m = $('a6Msg'), err = (t, sel) => { m.className = 'msg err'; m.textContent = t; const n = sel && document.querySelector(sel); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' }) };
    if (o) { const N = o === 'i' ? M2_NO_I : M2_NO_P, bad = S.lines.filter(l => !l.ax && N[l.k]); if (bad.length) return err(M2_ONLY[o] + ': «' + a6Lab(bad[0]) + '» در این نوع درمان نیست؛ آن را حذف کنید یا نوع درمان را عوض کنید.', `.a6l[data-l="${bad[0].id}"]`) }
    for (const l of S.lines.filter(x => M2_AX[x.k])) { if (!l.teeth.length && !num(l.n)) return err(a6Lab(l) + ': دندان‌های پایه را بزنید.', `.a6l[data-l="${l.id}"]`);
      if (o !== 'p') { const miss = arbMiss(l); if (miss.length) return err(a6Lab(l) + ': برای پایه‌ی ' + toothTxt(miss) + ' برند، قطر و طول را انتخاب کنید (روی دندان بزنید).', `[data-arbt="${miss[0]}"][data-l="${l.id}"]`) } } } catch (e) {}
  return _s.apply(this, arguments) } }
/* (fxArc lines of All on X / overdenture: in the api layer further down) */
/* ---- «فیل اولیه» (owner 2026-11-10): per tooth, in the brand / size window of «پایه ایمپلنت», All on X and overdenture; its tariff is a box of the session (default = the brand tariff) ---- */
const m3F = (l, t) => !!(((l && l.imp) || {})[t] || {}).f;
const m3Nf = l => (l.teeth || []).filter(t => m3F(l, t)).length;
{ const _o = arbOpen; arbOpen = function (l, t) { const r = _o.apply(this, arguments); try { if (ARB.p) { ARB.p.f = m3F(l, t); ARB.p.orig = (l.imp || {})[t]; ARB.p.m3 = 1; arbDraw() } } catch (e) {} return r } }
{ const _d = arbDraw; arbDraw = function () { const r = _d.apply(this, arguments); try { const s = $('arbSh'), P = ARB.p; if (s && P && !s.querySelector('[data-m3f]')) { const m = s.querySelector('#arbMsg');
    if (m) m.insertAdjacentHTML('beforebegin', `<div class="arbg m3row"><span>وضعیت</span><div class="chips"><button type="button" class="chip" data-m3f="0" aria-pressed="${!P.f}">کاشت موفق</button><button type="button" class="chip" data-m3f="1" aria-pressed="${!!P.f}">فیل اولیه</button></div></div>`) } } catch (e) {} return r } }
document.addEventListener('pointerdown', e => { const b = e.target && e.target.closest && e.target.closest('[data-m3f]'); if (!b || !ARB.p) return; e.preventDefault(); ARB.p.f = b.dataset.m3f === '1'; b.closest('.chips').querySelectorAll('[data-m3f]').forEach(x => x.setAttribute('aria-pressed', String(x === b))) }, true);
document.addEventListener('keydown', e => { const b = e.target && e.target.closest && e.target.closest('[data-m3f]'); if (!b || !ARB.p || (e.key !== 'Enter' && e.key !== ' ')) return; e.preventDefault(); ARB.p.f = b.dataset.m3f === '1'; b.closest('.chips').querySelectorAll('[data-m3f]').forEach(x => x.setAttribute('aria-pressed', String(x === b))) }, true);
{ const _c = arbClose; arbClose = function () { try { const P = ARB.p; if (P && P.m3) { const l = a6L(P.lid), m = l && l.imp && l.imp[P.t]; if (m && m !== P.orig) { if (P.f) m.f = 1; else delete m.f } } } catch (e) {} return _c.apply(this, arguments) } }
/* tooth buttons say «فیل اولیه»; a tariff box for the failed ones */
{ const _l = a6Line; a6Line = function (l) { let h = _l.apply(this, arguments); if (!l || !(l.k === 'imp' || M2_AX[l.k])) return h; try {
  (l.teeth || []).filter(t => m3F(l, t)).forEach(t => { h = h.replace(new RegExp(`(<button type="button" class="arbc[^"]*" data-arbt="${t}" data-l="${l.id}">[\\s\\S]*?)</button>`), '$1 <i class="m3f">فیل اولیه</i></button>') });
  const nf = m3Nf(l); if (nf && a6Money0() && !(M2_AX[l.k] && m2Only() === 'p')) { const box = `<label class="f m3fp">تعرفه‌ی ایمپلنت فیل اولیه (هر عدد، تومان)<input data-m3fp="${l.id}" inputmode="numeric" class="price" placeholder="مثل تعرفه‌ی برند" value="${l.fp != null && l.fp !== '' ? (+l.fp === 0 ? '0' : esc(fmtInput(String(l.fp)))) : ''}"><small class="a6def">${fa(nf)} عدد فیل اولیه${l.fp != null && l.fp !== '' ? '' : ' — خالی = همان تعرفه‌ی برند'}</small></label>`;
    if (h.includes('<div class="a6amt"><span>مبلغ</span><b data-arbamt')) h = h.replace('<div class="a6amt"><span>مبلغ</span><b data-arbamt', box + '<div class="a6amt"><span>مبلغ</span><b data-arbamt'); else h = h.replace('<div class="m2tot">', box + '<div class="m2tot">') } } catch (e) {} return h } }
document.addEventListener('input', e => { const i = e.target; if (!i || !i.dataset || !i.dataset.m3fp || !A6) return; const l = a6L(i.dataset.m3fp); if (!l) return; const raw = toEn(i.value).replace(/[^\d]/g, ''); l.fp = raw === '' ? '' : Number(raw); i.value = raw === '' ? '' : +raw === 0 ? '0' : fmtInput(i.value); A6.dirty = true;
  try { m2Sync() } catch (x) {} const a = document.querySelector(`[data-arbamt="${l.id}"]`); if (a) a.textContent = fa(arbAmt(l)); try { m2Tot() } catch (x) {} try { a6MoneyLite() } catch (x) {} });
/* file box and PDF */
{ const _b = arbBr; arbBr = function (l, html) { const s = _b.apply(this, arguments); try { const F = (l.teeth || []).filter(t => m3F(l, t)); if (!F.length || !s) return s; const add = ' — فیل اولیه: ' + toothTxt(F); return html ? s.replace(/\)$/, esc(add) + ')') : s.replace(/\)$/, add + ')') } catch (e) { return s } } }
/* api, fxArc of a paper file only (m2, two layers in one): first the failed-implant tariff (fp) goes with its line, then the session «only» flag and the All on X / overdenture lines (teeth, implants, units, price) */
{ const _a = api; api = function (action, payload) { try { if (action === 'fxArc' && payload && payload.arc && payload.arc.v6 && A6) payload.arc.lines = (payload.arc.lines || []).map(x => { const l = A6.lines.find(y => y.id === x.id); return l && l.fp != null && l.fp !== '' && m3Nf(l) ? Object.assign({}, x, { fp: l.fp }) : x }) } catch (e) {}
  try { if (action === 'fxArc' && payload && payload.arc && payload.arc.v6 && A6) { payload.arc.only = m2Only();
    payload.arc.lines = (payload.arc.lines || []).map(x => { const l = M2_AX[x.k] && A6.lines.find(y => y.id === x.id); if (!l) return x;
      return Object.assign({}, x, { teeth: l.teeth.slice(), imp: Object.fromEntries(l.teeth.map(t => { const m = (l.imp || {})[t] || {}; return [t, Object.assign({ b: m.b || '', d: m.d || '', l: m.l || '' }, m.f ? { f: 1 } : {})] })), jn: m2Units(l), price: m2Only() === 'i' ? 0 : x.price }) }) } } catch (e) {} return _a.apply(this, arguments) } }
