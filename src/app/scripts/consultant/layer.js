/* ---------- m11: owner requests 2026-11-11 — (1) pontics on the surgery day always under the surgeon · (2) overdenture prosthesis 45,000,000 per jaw (consultant form + paper file) · (3) CBCT not green until chosen · (4) consultant sees only the treatments the doctor chose; «درمان‌های انتخاب نشده در طرح درمان» shows the rest · (5) uncover 500,000 × every implant, charged in the surgery part · (6) consultant: «برند و طرح: ارجاع به پذیرش» chosen by default · (8) All on X → ایرانی/کره‌ای/سوئیسی disabled (consultant, reception) · (9) PDF: «قیمت روکش‌ها به قیمت روز محاسبه خواهند شد.» under the prosthesis table · (10) consultant can set «فقط پایه ایمپلنت» / «فقط پروتز» · (11) paper file «بستن هیلینگ» = 0 for the patient ---------- */
/* 1 */
try { if (!SOLO.includes('pon')) SOLO.push('pon') } catch (e) { }
/* 2 + 5 + 6: fill defaults on plans that are not confirmed yet */
const M11_OVD = 45000000, M11_UNC = 500000, M11_UX = ['imp', 'aox', 'ovd'];
try { SEC.ovd.prosJaw = true; SEC.ovd.def = String(M11_OVD) } catch (e) { }
const m11P = (k, d) => { try { return num(((SET.prices || {})[k] || {}).price) || d } catch (e) { return d } };
const m11Open = r => !!r && !['confirmed', 'modified'].includes(r.status);
function m11Prep(r) { if (!m11Open(r)) return; r.pay = r.pay || {};
  if (r.pay.unc === undefined || r.pay.unc === '') r.pay.unc = m11P('arc_unc', M11_UNC);
  [r.s].concat(r.sx || []).forEach(S => { const o = S && S.ovd; if (o && !num(o.price)) o.price = fmtInput(m11P('ovd', M11_OVD)) });
  if (ROLE === 'consultant' && r.brand === 'ref' && r.pay.blater === undefined) { r.pay.blater = 1; r.pay.plater = (r.alt && r.alt.mode !== 'none') ? 1 : 0 } }
let M11_SHOW = false;
{ const _o = openForm; openForm = function (r) { try { m11Prep(r) } catch (e) { } M11_SHOW = false; return _o.apply(this, arguments) } }
try { const c = A6CAT.find(x => x.k === 'ovd'); if (c) c.p = () => A6P('ovd') || M11_OVD } catch (e) { }
/* 11 */
try { const c = A6CAT.find(x => x.k === 'heal'); if (c) c.p = () => 0 } catch (e) { }
/* 5: uncover in the surgery part of every implant row */
const m11Unc = (r, x) => { try { if (!r || !r.pay || !M11_UX.includes(x.id)) return 0; const u = num(r.pay.unc); if (!u) return 0; const s = r.s && r.s[x.id]; return s ? qty(s, x) * u : 0 } catch (e) { return 0 } };
{ const _r = rowTotals; rowTotals = function (r, x) { const o = _r.apply(this, arguments); try { const v = m11Unc(r, x); if (v) { if (x.price === 'brandUnit' || x.price === 'implantBrand') BRANDS.forEach(b => o.brand[b.k] = (o.brand[b.k] || 0) + v); else o.flat = (o.flat || 0) + v } } catch (e) { } return o } }
const m11UncTxt = (r, x) => { const v = m11Unc(r, x); return v ? `آنکاوری (پارت جراحی): ${fa(qty(r.s[x.id], x))} × ${fa(num(r.pay.unc))} = ${fa(v)}` : '' };
{ const _p = priceLines; priceLines = function (r, x) { const L = _p.apply(this, arguments); try { const t = m11UncTxt(r, x); if (t && Array.isArray(L)) L.unshift({ t, c: '#444', s: 16 }) } catch (e) { } return L } }
/* 9 */
{ const _t = totalsBlock; totalsBlock = function (r) { const b = _t.apply(this, arguments); try { if (b && totals(r).pros > 0) { const h0 = b.h, d0 = b.draw; return { h: h0 + 34, draw(cx, top) { d0.call(this, cx, top); T(cx, 'قیمت روکش‌ها به قیمت روز محاسبه خواهند شد.', C.R, top + h0 + 14, { s: 18, w: 700 }) } } } } catch (e) { } return b } }
/* 4: consultant — only the chosen treatments */
/* m11Vis: base + m48a (3) (m48More after every call, also after an early exit) */
function m11Vis(init) { vis: { if (ROLE !== 'consultant' || SURG || !F) break vis; const S = AS(), pv = { s: S, brand: 'ko', pay: {} }; const cards = [...document.querySelectorAll('#viewForm [data-sec]')]; if (!cards.length) break vis;
  const used = c => { try { return !!rowUsed(pv, SEC[c.dataset.sec]) } catch (e) { return true } };
  if (init) cards.forEach(c => c.classList.toggle('m11hide', !used(c)));
  else cards.forEach(c => { if (used(c)) c.classList.remove('m11hide') });
  const hid = cards.filter(c => c.classList.contains('m11hide')), any = cards.some(used);
  if (!any) { cards.forEach(c => c.classList.remove('m11hide')); const b0 = $('m11More'); if (b0) b0.remove(); break vis }
  const last = cards[cards.length - 1]; let b = $('m11More');
  if (!hid.length && !M11_SHOW) { if (b) b.remove(); break vis }
  if (!b) { last.insertAdjacentHTML('afterend', '<div class="btns" id="m11More"><button type="button" class="btn sm ghost" data-m11more="1"></button></div>'); b = $('m11More') }
  document.querySelectorAll('#viewForm .m11hide').forEach(c => c.classList.toggle('m11show', M11_SHOW));
  b.querySelector('button').textContent = M11_SHOW ? 'پنهان کردن درمان‌های انتخاب نشده' : 'درمان‌های انتخاب نشده در طرح درمان' }
  try { m48More() } catch (e) { } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-m11more]'); if (!t) return; e.preventDefault(); M11_SHOW = !M11_SHOW; m11Vis(false) });
/* 10: consultant — «کامل / فقط پایه ایمپلنت / فقط پروتز» */
function m11Mode() { if (ROLE !== 'consultant' || SURG || !F || !F.h) { const x = $('m11Mode'); if (x) x.remove(); return } let w = $('m11Mode'); const sn = $('staffNote');
  if (!w) { if (!sn) return; sn.insertAdjacentHTML('afterend', '<div class="chips m11mode" id="m11Mode"></div>'); w = $('m11Mode') }
  const m = F.h.iOnly ? 'i' : F.h.pOnly ? 'p' : '';
  w.innerHTML = '<span class="sgh">نوع درمان:</span>' + [['', 'کامل (ایمپلنت + پروتز)'], ['i', 'فقط پایه ایمپلنت'], ['p', 'فقط پروتز']].map(([k, l]) => `<button type="button" class="chip" data-m11m="${k}" aria-pressed="${k === m}">${l}</button>`).join('') }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-m11m]'); if (!t || !F || !F.h || ROLE !== 'consultant') return; e.preventDefault(); const m = t.dataset.m11m;
  F.h.iOnly = m === 'i' ? 1 : 0; F.h.pOnly = m === 'p' ? 1 : 0; if (m) F.h.oOnly = 0; touch(); try { pl11Form() } catch (x) { } recalc(); m11Mode(); try { pSumRender() } catch (x) { } });
{ const _r = renderForm; renderForm = function () { const r = _r.apply(this, arguments); try { m11Mode(); m11Vis(true) } catch (e) { } return r } }
/* 8: All on X → only Italian */
const m11Aox = S => { try { const s = S && S.aox; return !!(s && (qty(s, SEC.aox) || chipSel(s))) } catch (e) { return false } };
const M11_NB = ['ir', 'ko', 'sw'];
/* m11Brands: base + m57a (1) (m57Tit after every call, also after an early exit) */
function m11Brands() { br: { if (!['consultant', 'staff'].includes(ROLE) || SURG || !F) break br; const bt = $('brandTotals'); if (!bt) break br; const on = m11Aox(AS());
  M11_NB.forEach(k => bt.querySelectorAll(`[data-brand="${k}"]`).forEach(b => { b.disabled = on; b.classList.toggle('m11off', on); if (on) b.title = 'برای All on X فقط برند ایتالیایی'; else b.removeAttribute('title') })) }
  try { m57Tit($('brandTotals')) } catch (e) { } }
{ const _r = recalc; recalc = function () { const r = _r.apply(this, arguments); try { m11Brands(); m11Vis(false);
  if (!SURG && F) M11_UX.forEach(id => { const el = document.getElementById('calc_' + id); if (!el) return; el.querySelectorAll('.m11unc').forEach(z => z.remove()); const t = m11UncTxt({ s: AS(), pay: F.pay }, SEC[id]); if (t) el.insertAdjacentHTML('beforeend', `<div class="m11unc">${esc(t)}</div>`) }) } catch (e) { } return r } }