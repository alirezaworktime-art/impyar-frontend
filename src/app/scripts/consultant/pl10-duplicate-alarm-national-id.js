/* ---------- pl10: owner 2026-11-05 — duplicate alarm by national id only; All on X lower jaw = Plus only; Enter moves on in the consultant form;
   «بیمار بعداً برند را انتخاب می‌کند»; first cheque date and the cash with reception; opt 3 «۷۰٪ نقد، بقیه روز قالب‌گیری»; deposit only
   (no «نقد درمان»); POS / account names; deposit saved with the final confirmation (no sheet); referral locked until settled ---------- */
/* (1) duplicate patient = same national id */
id1Hit = function () { try { const nid = toEn(($('rc_nid') || {}).value || '').replace(/\D/g, ''); if (!nid) return null;
  const all = [...ARCHIVE.map(d => ({ id: d.id, name: d.name, nid: d.nid, phone: d.phone, jalali: d.jalali })), ...QITEMS.filter(x => !ARCHIVE.some(a => a.id === x.id)).map(x => ({ id: x.id, name: x.name, nid: x.nid, phone: x.phone }))];
  return all.find(x => x.id !== RC_EDIT && toEn(x.nid || '').replace(/\D/g, '') === nid) || null } catch (e) { return null } };
/* (2) All on X lower jaw: only Plus fixtures */
{ const _m = aoxMix; aoxMix = function (s, j) { if (j === 'L') { const N = jawN(s, j); return { N, z: 0, t: 0, n: 0, p: N } } return _m.apply(this, arguments) } }
{ const _h = aoxMixHTML; aoxMixHTML = function (x) { let h = _h.apply(this, arguments); try { const i = h.indexOf('<div class="mix"><b>فک پایین'); if (i >= 0) { const j = h.indexOf('<div class="mix">', i + 5), end = j >= 0 ? j : h.indexOf('<p class="note">', i); const blk = h.slice(i, end), k = blk.indexOf('</div>', blk.indexOf('<div class="mixr">')) + 6; h = h.slice(0, i) + blk.slice(0, k) + '<p class="note pl10lo">فک پایین فقط پایه‌ی پلاس.</p></div>' + h.slice(end) } } catch (e) { } return h } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-mx]'); if (t && /^L:/.test(t.dataset.mx)) { e.preventDefault(); e.stopImmediatePropagation() } }, true);
/* (3) consultant form: Enter confirms the field and moves to the next one */
document.addEventListener('keydown', e => { if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.altKey || e.isComposing || ROLE !== 'consultant') return; const t = e.target, R = $('viewForm'); if (!R || R.hidden || !t || !R.contains(t) || !t.matches('input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit])')) return;
  e.preventDefault(); const L = [...R.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([disabled]):not([readonly]),select:not([disabled])')].filter(x => x.offsetParent !== null); const n = L[L.indexOf(t) + 1]; if (n) { n.focus(); if (n.select && n.tagName === 'INPUT') try { n.select() } catch (x) { } } else t.blur() }, true);
/* (4) brand later: a fifth choice in the treatment total */
const pl10BL = () => !!(F && F.pay && F.pay.blater && F.brand === 'ref');
function pl10BrandBtn() { const bt = $('brandTotals'); if (!bt || ROLE === 'doctor' || !bt.querySelector('[data-brand]')) return; if (!bt.querySelector('[data-pl10bl]')) bt.insertAdjacentHTML('beforeend', `<button type="button" class="tot ref pl10bl" data-pl10bl="1" aria-pressed="false"><small>برند</small><b>بیمار بعداً انتخاب می‌کند</b><small>روز درمان به پذیرش می‌گوید</small></button>`);
  const on = pl10BL(); bt.querySelector('[data-pl10bl]').setAttribute('aria-pressed', String(on)); const rf = bt.querySelector('[data-brand="ref"]'); if (rf && on) rf.setAttribute('aria-pressed', 'false') }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pl10bl],#brandTotals [data-brand]'); if (!t || !F || !F.pay) return; if (t.dataset.pl10bl) { e.preventDefault(); e.stopImmediatePropagation(); F.brand = 'ref'; F.pay.blater = 1; touch(); recalc(); return } F.pay.blater = 0 }, true);
/* (6) opt 3 «۷۰٪ نقد، بقیه روز قالب‌گیری» — % of the whole plan before surgery, the rest cash at the impression, no cheque */
const pl10O3 = r => !!(r && r.pay && String(r.pay.opt) === '3');
const pl10Pct = r => { const v = Number(toEn(String((r && r.pay && r.pay.c3) || '')).replace(/[^\d.]/g, '')); return v > 0 && v <= 100 ? v : 70 };
const pl10Cash = (r, S, P) => Math.round((S + P) * pl10Pct(r) / 100 / 1e5) * 1e5;
let PL10_GET = {};
{ const _a = api; api = function (action, payload) { const p = _a.apply(this, arguments); if (action === 'get' && payload && payload.id) Promise.resolve(p).then(j => { try { if (j && j.data) PL10_GET[payload.id] = j } catch (e) { } }).catch(() => { }); return p } }
const pl10Done = id => { const j = PL10_GET[id]; return !!(j && j.surg && (j.surg.sessions || []).length) };
{ const _c = chqFor; chqFor = function (r) { const o = _c.apply(this, arguments); try { if (pl10O3(r)) { const C = pl10Cash(r, o.S, o.P), all = o.S + o.P, cash = pl10Done(r.id) ? all : C, cS = Math.min(o.S, cash); return Object.assign({}, o, { cash, cashS: cS, cashP: cash - cS, disc: 0, chq: [] }) } } catch (e) { } return o } }
/* (4)(5)(6)(7)(8) the payment card: opt 3 chip + %, first cheque date hidden (reception), deposit only, POS / account list */
(function () { const po = $('payOpt'); if (po && !po.querySelector('[data-opt="3"]')) po.insertAdjacentHTML('beforeend', '<button type="button" class="chip" data-opt="3">۷۰٪ نقد، بقیه روز قالب‌گیری (بدون چک)</button>');
  const cs = $('p_cs'), fl = cs && cs.closest('.fields'); if (fl && !$('p_c3')) fl.insertAdjacentHTML('afterend', '<div class="fields" id="pl10C3"><label class="f">درصد نقد قبل از جراحی (از کل طرح)<input id="p_c3" class="price" inputmode="numeric" placeholder="۷۰"></label></div><p class="note" id="pl10C3N"></p>');
  const mt = $('pl9Mt'); if (mt && !$('pl10Via')) mt.closest('.grp').insertAdjacentHTML('afterend', '<div id="pl10Via"></div>');
  const ri = $('pl9_rcv'), lb = ri && ri.closest('label'); if (lb && lb.firstChild && lb.firstChild.nodeType === 3) lb.firstChild.textContent = 'مبلغ بیعانه (تومان)' })();
function pl10Via() { const el = $('pl10Via'); if (!el || !F || !F.pay) return; const p = F.pay; let h = '';
  if (p.mt === 'pos') { h = POSL ? `<div class="f"><span>کدام کارتخوان؟ *</span>${posChips('pl10pos', p.pos || '', {}).replace(/<button[^>]*data-pl10pos="xfer"[^>]*>[^<]*<\/button>/, '')}</div>` : '<p class="note">در حال خواندن فهرست کارتخوان‌ها…</p>'; if (!POSL) ensurePos().then(() => { try { pl10Via() } catch (e) { } }) }
  else if (p.mt === 'xfer') h = `<div class="f"><span>به کدام حساب؟ *</span>${fin1Chips('pl10acct', FIN1_ACC, p.acct || '')}</div>`;
  if (el.innerHTML !== h) el.innerHTML = h }
function pl10PayUI() { if (!$('pl9Pm') || !F || !F.pay) return; const p = F.pay, o3 = String(p.opt) === '3', cash = pl9Mode() === 'cash';
  document.querySelectorAll('#payOpt [data-opt]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.opt === String(p.opt || '1'))));
  const L = id => { const x = $(id); return x && x.closest('label') }; pl9Hide(L('p_chq1'), true);
  const c3 = $('pl10C3'), c3n = $('pl10C3N'); if (c3) c3.hidden = cash || !o3; if (c3n) c3n.hidden = cash || !o3;
  if (!cash && o3) { [L('p_cs'), L('p_n1'), L('p_m2')].forEach(x => pl9Hide(x, true)); const ps = $('paySurg'), pg = ps && ps.nextElementSibling; if (pg && pg.classList.contains('grp')) pg.hidden = true; pl9Hide($('p_cp') && $('p_cp').closest('.fields'), true); pl9Hide(L('p_cash'), true);
    const ci = $('p_c3'); if (ci && document.activeElement !== ci) ci.value = p.c3 || ''; try { const T = totals({ s: AS(), brand: F.brand, pay: p }), b = effBrand(F), S = T.surg[b] || 0, P = T.pros || 0, C = pl10Cash(F, S, P); if (c3n) c3n.textContent = `${fa(pl10Pct(F))}٪ کل طرح (${fa(S + P)}) = ${fa(C)} نقد قبل از جراحی · مانده ${fa(Math.max(0, S + P - C))} نقد روز قالب‌گیری` } catch (e) { } }
  else if (!cash) { [L('p_cs'), L('p_n1'), L('p_m2')].forEach(x => pl9Hide(x, false)) }
  const rk = $('pl9Rk'); if (rk) rk.hidden = true; if (num(p.rcv) > 0 && p.rk !== 'dep') { p.rk = 'dep'; try { pl9PayUI() } catch (e) { } }
  pl10Via(); pl10BrandBtn() }
{ const _r = recalc; recalc = function () { const r = _r.apply(this, arguments); try { pl10PayUI() } catch (e) { } return r } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pl10pos],[data-pl10acct]'); if (!t || !F || !F.pay) return; e.preventDefault(); e.stopImmediatePropagation(); if (t.dataset.pl10pos !== undefined) F.pay.pos = posPick(t, 'pl10pos'); else F.pay.acct = fin1Pick(t, 'pl10acct'); touch() }, true);
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#payOpt [data-opt]'); if (!t || !F || !F.pay) return; if (t.dataset.opt === '3') { F.pay.n1 = ''; F.pay.n3 = ''; F.pay.cash = '' } else if (String(F.pay.opt) === '3') F.pay.cash = '' }, true);
/* (9) the consultant's «نتیجه‌ی مشاوره»: the method of the deposit must be complete; the deposit is saved without the collection sheet */
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-out="book"],[data-out="today"]'); if (!t || ROLE !== 'consultant' || !F || !F.pay) return; const p = F.pay; if (!(num(p.rcv) > 0)) return;
  const miss = !p.mt ? 'روش دریافت بیعانه را انتخاب کنید (اسکناس، کارتخوان یا کارت‌به‌کارت).' : p.mt === 'pos' && !p.pos ? 'کارتخوانی را که بیعانه با آن کشیده شد انتخاب کنید.' : p.mt === 'xfer' && !p.acct ? 'حسابی را که بیعانه به آن واریز شد انتخاب کنید.' : '';
  if (miss) { e.preventDefault(); e.stopImmediatePropagation(); try { $('outSheet').hidden = true } catch (x) { } toast(miss, 1); const r = $('pl9Rcv'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'center' }) } }, true);
let PL10_P4 = 0; window.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-p4rest]')) PL10_P4 = Date.now() }, true);
async function pl10Dep(snap) { try { const p = (snap && snap.pay) || {}, a = num(p.rcv); if (!snap || !snap.id || !(a > 0)) return; const via = p.mt === 'cash' ? 'cash' : p.mt === 'xfer' ? 'xfer' : (p.pos || '');
  const q = await api('payAdd', { id: snap.id, pid: 'dep-' + snap.id.slice(0, 36) + '-f', pay: { kind: posKind(via), pos: posId(via), acct: via === 'xfer' ? p.acct || '' : '', part: 's', amount: a, by: ROLE_LBL[ROLE], note: 'بیعانه' } });
  toast(q && q.dup ? 'بیعانه قبلاً ثبت شده بود.' : 'بیعانه‌ی ' + fa(a) + ' تومان در پرونده ثبت شد؛ مانده‌ی نقد و چک‌ها با منشی.') } catch (e) { toast('ثبت بیعانه: ' + e.message, 1) } }
/* reception: a «brand later» plan first asks the brand; then the same collection sheet with that brand's amounts */
/* pl10BrandSheet: base + m11 (8) (All on X: Iranian/Swiss chips off) + m57a (1) (title) */
function pl10BrandSheet(snap) { const pv = PV(snap, 1), T = totals(pv), id = snap.id;
  const s = mkSheet('pl10BrSh', `<h3>برند ایمپلنت بیمار · ${esc((snap.h || {}).name || '')}</h3><p class="note">مشاور «بیمار بعداً انتخاب می‌کند» زده است. برندی را که بیمار می‌گوید بزنید؛ مبلغ و نقد و چک‌ها با همان شرایط مشاور حساب می‌شود.</p>
    <div class="brand-totals pl10brs">${BRANDS.map(b => { const r2 = Object.assign({}, snap, { brand: b.k }); return `<button type="button" class="tot" data-pl10br="${b.k}"><small>${b.n}</small><b>${fa(planTotal(r2))}</b><small>نقد: ${fa(cashFor(PV(r2, 1), T.surg[b.k], T.pros))}</small></button>` }).join('')}</div>
    <div class="msg" id="pl10BrMsg"></div><div class="btns"><button class="btn ghost" type="button" id="pl10BrX">بعداً</button></div>`); s.hidden = false;
  s.onclick = async ev => { const b = ev.target.closest('button'); if (!b) return; if (b.id === 'pl10BrX') { s.hidden = true; return } const k = b.dataset.pl10br; if (!k) return; const m = $('pl10BrMsg'), r2 = Object.assign({}, snap, { brand: k }), T2 = totals(PV(r2, 1));
    b.disabled = true; m.className = 'msg'; m.textContent = 'در حال ثبت…';
    try { await api('pl10Brand', { id, brand: k, total: planTotal(r2), parts: { S: T2.surg[k] || 0, P: T2.pros || 0 }, cash: pl10O3(r2) ? pl10Cash(r2, T2.surg[k] || 0, T2.pros || 0) : null }); s.hidden = true; toast('برند ثبت شد.'); const j = await api('get', { id }); openPostConfirm(fromDoc(id, j.data || {})) }
    catch (err) { m.className = 'msg err'; m.textContent = err.message; b.disabled = false } }
  try { const S = PV(snap, 1).s; if (m11Aox(S)) { const sh = $('pl10BrSh'); if (sh) M11_NB.forEach(k => sh.querySelectorAll(`[data-pl10br="${k}"]`).forEach(b => { b.disabled = true; b.classList.add('m11off'); b.title = 'برای All on X فقط برند ایتالیایی' })) } } catch (e) { }
  try { m57Tit($('pl10BrSh')) } catch (e) { } }
{ const _o = openPostConfirm; openPostConfirm = function (snap) {
  if (ROLE === 'consultant' && Date.now() - PL10_P4 > 20000) { pl10Dep(snap); return }
  if (snap && snap.brand === 'ref' && snap.pay && snap.pay.blater && (ROLE === 'staff' || ROLE === 'consultant')) { pl10BrandSheet(snap); return }
  return _o.apply(this, arguments) } }
/* (10) reception sheet title; the consultant / manager can allow a referral without settlement (with a reason) */
{ const _p = pfPays; pfPays = function (j, r) { let h = _p.apply(this, arguments); try { if ((ROLE === 'consultant' || ROLE === 'manager') && r && (r.status === 'confirmed' || r.status === 'modified') && payNums(j).rest > 0) h += `<div class="btns pl10al"><button class="btn sm ghost" type="button" data-pl10allow="${esc(j.id || r.id || '')}">اجازه‌ی ارجاع به جراح بدون تسویه…</button></div>` } catch (e) { } return h } }
document.addEventListener('click', async e => { const t = e.target.closest && e.target.closest('[data-pl10allow]'); if (!t) return; e.preventDefault(); e.stopImmediatePropagation();
  const v = await uxAsk({ title: 'اجازه‌ی ارجاع بدون تسویه', msg: 'منشی می‌تواند بیمار را با پرداخت ناقص به جراح ارجاع دهد. دلیل در تاریخچه ثبت می‌شود.', fields: [{ k: 'reason', l: 'دلیل', req: 1, full: 1 }], ok: 'اجازه بده' }); if (!v || !v.reason) return;
  t.disabled = true; try { const r = await api('fx4Allow', { id: t.dataset.pl10allow, step: 'surg', reason: v.reason, sendId: uuid() }); toast('اجازه ثبت شد' + (r && r.short ? ' (' + fa(r.short) + ' تومان مانده)' : '') + '.') } catch (err) { toast(err.message, 1) } finally { t.disabled = false } }, true);
/* opt 3: the remaining 30 % shows on the impression appointment card for reception */
{ const _a = apptCard; apptCard = function (a) { let h = _a.apply(this, arguments); try { if (a && a.owe > 0 && a.kind === 'impr' && ROLE === 'staff' && a.plan && (a.st || 'set') === 'set' && h.indexOf('data-p4rest') < 0) h = h.replace('<div class="acts">', `<div class="acts"><button class="btn sm main" type="button" data-p4rest="${esc(a.plan)}">تعیین تکلیف مالی (${fa(a.owe)} مانده)</button>`) } catch (e) { } return h } }
