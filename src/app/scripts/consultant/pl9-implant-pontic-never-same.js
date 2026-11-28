/* ---------- pl9: owner 2026-11-05 — implant / pontic never on the same tooth, temporary crown in the surgery part, «n × tariff = sum» left to right,
   payment mode (all cash / instalments), deposit or treatment cash before «نتیجه‌ی مشاوره» + reception «تعیین تکلیف مالی»,
   doctor per tooth on surgery day, «اباتمنت» / «کاستومایز هیلینگ», GBR units per tooth, «بیهوشی / سدیشن», optional suture, uncover 2–7 months ---------- */
/* (2) temporary crown → surgery part; (9) anesthesia or sedation, each with its own tariff */
(function () {
  if (SEC.tmp) SEC.tmp.pros = false;
  const a = SEC.anes; if (a) { a.t = 'بیهوشی / سدیشن'; a.items = [{ k: 'ga', l: 'بیهوشی عمومی', type: 'toggle', pk: 'anes_ga' }, { k: 'sd', l: 'سدیشن', type: 'toggle', pk: 'anes_sd' }]; }
})();
/* (1) a tooth is either an implant or a pontic: merged into toothBtn and exRefresh (surgery/form-render.js) */
/* (3) every «count × tariff = sum» reads left to right */
const PL9_RE = /([۰-۹][۰-۹٬]*)(?:\s*(?:واحد|Q|فک|پایه|عدد))?\s*×\s*([۰-۹][۰-۹٬]*)(\s*=\s*<b>[^<]*<\/b>)?/g;
const pl9Ltr = h => String(h).replace(PL9_RE, (m, a, b, c) => `<bdi class="pl9m" dir="ltr">${a} × ${b}${c ? ' = ' + c.replace(/^\s*=\s*/, '') : ''}</bdi>`);
function pl9Calc() {
  if (typeof CUR !== 'undefined' && CUR === 2 && F.alt && F.alt.mode === 'text') return; const pv = { s: AS(), brand: F.brand, pay: F.pay };
  SECTIONS.forEach(x => { const el = document.getElementById('calc_' + x.id), s = pv.s[x.id]; if (!el || !s) return;
    if (x.price === 'brandUnit' || x.price === 'implantBrand') { const q = qty(s, x); if (!q) return; const rt = rowTotals(pv, x), bp = x.price === 'implantBrand' ? pv.s.imp.bp : s.bp;
      el.innerHTML = '<span class="pl9bl">' + BRANDS.map(b => `<span>${b.n}: ${fa(q)} × ${fa(num(bp[b.k]))} = <b>${fa(rt.brand[b.k])}</b></span>`).join('') + '</span>' + (rt.pros ? `<br>روکش روی پایه‌ها (پارت پروتز): ${fa(q)} × ${fa(num(pv.s.crw.price))} = <b>${fa(rt.pros)}</b>` : '') }
    if (x.id === 'anes') { const it = (x.items || []).find(i => itemQty(s, i)); el.innerHTML = it ? `${esc(it.l)}: <b>${fa(num(s.ip[it.k]))}</b>` : '' } });
  document.querySelectorAll('[id^="calc_"],[id^="pcalc_"],[id^="bcalc_"],[id^="icalc_"]').forEach(el => { const h = el.innerHTML; if (h.indexOf('×') >= 0 && h.indexOf('pl9m') < 0) el.innerHTML = pl9Ltr(h) }) }
/* PDF: the same left-to-right line, shrunk to fit the price column */
const PL9_LRM = '‎', pl9N = s => Number(toEn(String(s)).replace(/[^\d]/g, '')) || 0;
const PL9_UNIT = ['واحد', 'Q', 'فک', 'پایه', 'عدد'];
function pl9PL(r, x, L) {
  if (!L || !L.length) return L; const s = r.s[x.id], out = [];
  const RX = /^(.*?)([۰-۹][۰-۹٬]*)(?:\s+([^\s×۰-۹]+))?\s*×\s*([۰-۹][۰-۹٬]*)\s*$/;
  if (x.price === 'brandUnit' || x.price === 'implantBrand') { const q = qty(s, x), rt = rowTotals(r, x), bp = x.price === 'implantBrand' ? r.s.imp.bp : s.bp;
    L.forEach(o => { if (q && o.t === `${fa(q)} ${x.price === 'implantBrand' ? 'پایه' : 'واحد'}`) return; const b = BRANDS.find(b => o.t === `${b.n}: ${fa(rt.brand[b.k])}`); if (b && q) { out.push(Object.assign({}, o, { t: `${b.n}: ${PL9_LRM}${fa(q)} × ${fa(num(bp[b.k]))} = ${fa(rt.brand[b.k])}` })); return } out.push(o) }); L = out.splice(0) }
  const mul = []; L.forEach((o, i) => { const m = RX.exec(o.t || ''); if (!m) { out.push(o); return } const a = pl9N(m[2]), b = pl9N(m[4]), w = m[3] && !PL9_UNIT.includes(m[3]) ? m[3] + ': ' : '';
    const pre = (m[1] || '') + w; const n = Object.assign({}, o, { t: `${pre}${PL9_LRM}${m[2]} × ${m[4]} = ${fa(a * b)}`, pl9p: a * b }); out.push(n); mul.push(n) });
  /* one multiplication: the separate total line under it is the same number */
  if (mul.length === 1) { const n = mul[0], i = out.indexOf(n), nx = out[i + 1]; if (nx && (pl9N(nx.t) === n.pl9p) && (/^=\s/.test(nx.t) || nx.b) && !/[^\d۰-۹٬,=\s]/.test(nx.t)) { out.splice(i + 1, 1); if (nx.b) { n.b = 1; n.c = nx.c; } } }
  const c = mctx(), W = C.priceW - 28; out.forEach(o => { delete o.pl9p; let z = o.s || 20; while (z > 12 && Wd(c, o.t, { s: z, w: o.b ? 800 : 400 }) > W) z--; o.s = z });
  return out }
{ const _p = priceLines; priceLines = function (r, x) { const L = _p.apply(this, arguments); try { if (x.id === 'anes') { const s = r.s[x.id], it = (x.items || []).find(i => itemQty(s, i)); if (it) { const v = rowTotals(r, x).flat; return v ? [{ t: it.l, c: '#444', s: 17 }, { t: fa(v), b: 1 }] : L } } return pl9PL(r, x, L) } catch (e) { return L } } }
/* (9) anesthesia / sedation: the chosen option's own tariff replaces the old single price */
{ const _r = rowTotals; rowTotals = function (r, x) { const o = _r.apply(this, arguments); try { if (x && x.id === 'anes') { const s = r.s[x.id], it = (x.items || []).find(i => itemQty(s, i)); if (it) o.flat = num(s.ip[it.k]) } } catch (e) { } return o } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pl9an]'); if (!t) return; e.preventDefault(); const s = AS().anes; if (!s) return; const k = t.dataset.pl9an, was = !!s.isel[k + ':on'];
  Object.keys(s.isel).forEach(z => { if (/^(ga|sd):/.test(z)) delete s.isel[z] }); if (!was) s.isel[k + ':on'] = true; if (SURG) SURG.dirty = true; else touch(); reSec('anes') }, true);
/* (8) surgery day: GBR units per tooth (s.icnt['gn:UR4']; default 1) */
{ const _q = qty; qty = function (s, x) { const n = _q.apply(this, arguments); try { if (x && x.id === 'gbr' && s && s.icnt) { let e = 0; Object.keys(s.sel || {}).forEach(k => { if (s.sel[k] && isTooth(k)) { const c = num(s.icnt['gn:' + k]); if (c > 1) e += c - 1 } }); return n + e } } catch (e) { } return n } }
function pl9GbrHTML() { if (!SURG || SURG.arc) return ''; const s = SURG.s.gbr; if (!s) return ''; const T = Object.keys(s.sel || {}).filter(k => s.sel[k] && isTooth(k)).sort(); if (!T.length) return '';
  return `<div class="pl9gn"><small>تعداد GBR استفاده‌شده روی هر دندان</small>${T.map(k => { const n = Math.max(1, num(s.icnt['gn:' + k])); return `<span class="pl9g"><b>${esc(toothTxt([k]))}</b><button type="button" data-pl9g="${k}|-1" aria-label="کمتر"${n <= 1 ? ' disabled' : ''}>−</button><b class="n">${fa(n)}</b><button type="button" data-pl9g="${k}|1" aria-label="بیشتر">+</button></span>` }).join('')}</div>` }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pl9g]'); if (!t || !SURG) return; e.preventDefault(); e.stopPropagation(); const [k, d] = t.dataset.pl9g.split('|'), s = SURG.s.gbr; s.icnt = s.icnt || {};
  const n = Math.max(1, Math.min(20, Math.max(1, num(s.icnt['gn:' + k])) + Number(d))); if (n > 1) s.icnt['gn:' + k] = String(n); else delete s.icnt['gn:' + k]; SURG.dirty = true; reSec('gbr') }, true);
/* (5) surgery day: doctor per tooth — pick the doctor, then tap the teeth he / she did (default: the section's assistant) */
const PL9D = () => { const L = ASSTS().slice(), s = SURGEON(); if (s && !L.includes(s)) L.push(s); return L };
/* sectionHTML, the three pl9 layers in one wrapper (run order kept): (5) keep the per-tooth doctors across a redraw (before + after the call),
   (9) anesthesia / sedation chips and prices (only x.id 'anes'), (8) GBR units per tooth on surgery day (only x.id 'gbr' with SURG) */
{ const _s = sectionHTML; sectionHTML = function (x) { try { if (SURG) { SURG.pl9st = SURG.pl9st || {}; if (SURG.st && SURG.st[x.id] && !SURG.pl9st[x.id]) SURG.pl9st[x.id] = Object.assign({}, SURG.st[x.id]) } } catch (e) { }
  let h = _s.apply(this, arguments);
  /* (9) */ try { if (x.id === 'anes') { const s = AS()[x.id]; const on = k => !!Object.keys(s.isel || {}).some(z => s.isel[z] && z.startsWith(k + ':'));
      const ch = `<div class="chips pl9an" role="group" aria-label="نوع">${x.items.map(it => `<button type="button" class="chip" data-pl9an="${it.k}" aria-pressed="${on(it.k)}">${it.l}</button>`).join('')}</div>`;
      const pr = SURG ? '' : `<div class="fields">${x.items.map(it => `<label class="f">قیمت ${it.l}<input class="price" inputmode="numeric" data-ip="anes" data-ik="${it.k}" value="${esc(s.ip[it.k] || '')}"></label>`).join('')}</div>`;
      h = h.replace('</h2>', '</h2>' + ch); if (!SURG) { h = h.replace(/<label class="f">قیمت<input id="pr_anes"[^>]*><\/label>/, m0 => (num(s.price) && !x.items.some(it => on(it.k))) ? m0 : ''); const i = h.lastIndexOf('<div class="calc" id="calc_anes">'); if (i >= 0) h = h.slice(0, i) + pr + h.slice(i) } } } catch (e) { }
  /* (8) */ try { if (x.id === 'gbr' && SURG) { const g = pl9GbrHTML(); if (g) { const i = h.lastIndexOf('<div class="calc" id="calc_gbr">'); h = i >= 0 ? h.slice(0, i) + g + h.slice(i) : h.replace('</section>', g + '</section>') } } } catch (e) { }
  /* (5) */ try { if (SURG && SURG.pl9st && SURG.pl9st[x.id]) { SURG.st = SURG.st || {}; SURG.st[x.id] = SURG.pl9st[x.id] } } catch (e) { } return h } }
/* p5SplitHTML and p5St of (5): merged into surgery/pa5-assistant-per-tooth-non.js */
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('button'); if (!t || !SURG) return;
  if (t.dataset.pl9b) { e.stopImmediatePropagation(); const id = t.dataset.pl9b; SURG.pl9b = SURG.pl9b || {}; SURG.pl9b[id] = SURG.pl9b[id] === t.dataset.n ? '' : t.dataset.n; reSec(id); return }
  const set = (id, k, B) => { const a1 = SURG.sa[id] || SURG.asst || ''; SURG.pl9st = SURG.pl9st || {}; const m = SURG.pl9st[id] = SURG.pl9st[id] || {}; if (B === a1) delete m[k]; else m[k] = B; SURG.st = SURG.st || {}; SURG.st[id] = m };
  if (t.dataset.pl9u) { e.stopImmediatePropagation(); const [id, k] = t.dataset.pl9u.split('|'), B = (SURG.pl9b || {})[id]; if (!B) { toast('اول پزشک را از ردیف بالا بزنید.'); return } const a1 = SURG.sa[id] || SURG.asst || '', cur = ((SURG.pl9st || {})[id] || {})[k] || a1; set(id, k, cur === B ? a1 : B); SURG.dirty = true; reSec(id); return }
  if (t.dataset.pl9all) { e.stopImmediatePropagation(); const id = t.dataset.pl9all, B = (SURG.pl9b || {})[id]; if (!B) return; p5Units(SURG.s[id]).forEach(k => set(id, k, B)); SURG.dirty = true; reSec(id); return } }, true);
/* (10) uncover 2–7 months; default 3, Korean 4 until the assistant picks one */
const pl9G = m => { if (!m) return ''; if (m.g) return m.g; const c = (SET.catalog || []).find(c => c.b === m.b); if (c && c.g) return c.g; const b = String(m.b || ''); return /root|روت/i.test(b) ? 'rt' : /jd/i.test(b) ? 'it' : /avita|اویتا|آویتا/i.test(b) ? 'ir' : /stra?uman|اشترومن|استرومن/i.test(b) ? 'sw' : 'ko' };
function pl9UncPaint() { document.querySelectorAll('[data-unc]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.unc) === Number(SURG && SURG.unc)))) }
{ const _r = renderImps; renderImps = function () { const r = _r.apply(this, arguments); try { if (SURG && !SURG.arc && !SURG.pl9um) { const ko = Object.values(SURG.imp || {}).some(m => m && m.ht === 'cover' && pl9G(m) === 'ko'); SURG.unc = ko ? 4 : 3; pl9UncPaint() } } catch (e) { } return r } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-unc]'); if (t && SURG) SURG.pl9um = true }, true);
/* (4) payment: «نقد کامل» (amount, method, cash discount) or «اقساط» (cash % and cheques per part); (6) what was received today: deposit or treatment cash */
(function () {
  const pc = $('payCard'); if (!pc || $('pl9Pm')) return; const h = pc.querySelector('h2');
  h.insertAdjacentHTML('afterend', `<div class="seg pl9pm" id="pl9Pm" role="group" aria-label="روش پرداخت"><button type="button" data-pl9pm="cash" aria-pressed="false">نقد کامل</button><button type="button" data-pl9pm="inst" aria-pressed="false">اقساط (نقد + چک)</button></div><div id="pl9Cash" class="fields" hidden></div>`);
  const d = $('p_disc'); if (d) { const lb = d.closest('label'), fl = lb.parentElement; $('pl9Cash').appendChild(lb); if (fl && !fl.children.length) fl.remove(); const dn = $('discNote'); if (dn) $('pl9Cash').after(dn) }
  $('pl9Cash').insertAdjacentHTML('beforeend', '<div class="pl9net" id="pl9Net"></div>');
  const at = pc.querySelector('.btns') || null;
  const blk = `<div class="pl9rcv" id="pl9Rcv"><div class="grp"><span>دریافت امروز از بیمار (قبل از «نتیجه‌ی مشاوره»)</span></div><div class="fields"><label class="f">مبلغ دریافتی امروز (تومان)<input id="pl9_rcv" class="price" inputmode="numeric" placeholder="۰"></label></div>
    <div class="chips" id="pl9Rk" role="group" aria-label="نوع دریافت"><button type="button" class="chip" data-pl9rk="dep" aria-pressed="false">بیعانه</button><button type="button" class="chip" data-pl9rk="cash" aria-pressed="false">نقد درمان</button></div>
    <div class="grp"><span>روش دریافت</span><div class="chips" id="pl9Mt" role="group" aria-label="روش دریافت"><button type="button" class="chip" data-pl9mt="cash" aria-pressed="false">💵 اسکناس</button><button type="button" class="chip" data-pl9mt="pos" aria-pressed="false">💳 کارتخوان</button><button type="button" class="chip" data-pl9mt="xfer" aria-pressed="false">🏦 کارت‌به‌کارت / واریز</button></div></div><p class="note" id="pl9RcvNote"></p></div>`;
  if (at) at.insertAdjacentHTML('beforebegin', blk); else pc.insertAdjacentHTML('beforeend', blk);
})();
const pl9Mode = () => { const p = F.pay || {}; return p.mode === 'cash' || p.mode === 'inst' ? p.mode : (String(p.cs) === '100' && String(p.cp) === '100' ? 'cash' : 'inst') };
const pl9Hide = (el, on) => { if (el) el.hidden = !!on };
function pl9PayUI() {
  if (!$('pl9Pm') || !F || !F.pay) return; const m = pl9Mode(), p = F.pay, cash = m === 'cash';
  document.querySelectorAll('[data-pl9pm]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pl9pm === m)));
  const L = id => { const x = $(id); return x && x.closest('label') };
  pl9Hide(L('p_cash'), cash || !num(p.cash)); pl9Hide(L('p_chq1'), cash); pl9Hide($('payOpt') && $('payOpt').closest('.grp'), cash); pl9Hide($('p_cs') && $('p_cs').closest('.fields'), cash);
  const ps = $('paySurg'), pg = ps && ps.nextElementSibling; if (pg && pg.classList.contains('grp')) pl9Hide(pg, cash); pl9Hide($('p_cp') && $('p_cp').closest('.fields'), cash);
  pl9Hide($('fx6CashHint'), cash); pl9Hide($('pl9Cash'), !cash); const dn = $('discNote'); if (dn && !cash) dn.hidden = true;
  if (cash) { try { const c = chqFor(F); $('pl9Net').innerHTML = `مبلغ نقد${c.disc ? ' پس از تخفیف' : ''}: <b>${fa(c.cash)}</b> تومان${c.disc ? ` (تخفیف ${fa(c.disc)})` : ''}` } catch (e) { } }
  const ri = $('pl9_rcv'); if (ri && document.activeElement !== ri) ri.value = p.rcv ? fmtInput(p.rcv) : '';
  document.querySelectorAll('[data-pl9rk]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pl9rk === p.rk)));
  document.querySelectorAll('[data-pl9mt]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pl9mt === p.mt)));
  const n = $('pl9RcvNote'); if (n) { let t = ''; try { const c = chqFor(F), a = num(p.rcv); if (a && p.rk === 'dep') t = `مانده‌ی نقد (${fa(Math.max(0, c.cash - a))} تومان)${c.chq.length ? ' و چک‌ها' : ''} را منشی روزی که نوبت جراحی می‌دهد در «تعیین تکلیف مالی» می‌گیرد.`; else if (a && p.rk === 'cash' && a < c.cash) t = `${fa(c.cash - a)} تومان کمتر از نقد طرح است؛ مانده را منشی در «تعیین تکلیف مالی» می‌گیرد.` } catch (e) { } n.textContent = t; n.hidden = !t } }
{ const _r = recalc; recalc = function () { const r = _r.apply(this, arguments); try { pl9Calc() } catch (e) { } try { pl9PayUI() } catch (e) { } return r } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pl9pm],[data-pl9rk],[data-pl9mt]'); if (!t || !F || !F.pay) return; e.preventDefault(); const p = F.pay;
  if (t.dataset.pl9pm) { const m = t.dataset.pl9pm; p.mode = m; const set = (k, v) => { p[k] = v; const i = $('p_' + k); if (i) i.value = v }; if (m === 'cash') { set('cs', '100'); set('cp', '100'); set('cash', ''); set('n1', ''); set('n3', ''); setTimeout(() => { const d = $('p_disc'); if (d) try { d.focus() } catch (x) { } }, 30) } else { if (String(p.cs) === '100') set('cs', ''); if (String(p.cp) === '100') set('cp', '') } }
  else if (t.dataset.pl9rk) p.rk = p.rk === t.dataset.pl9rk ? '' : t.dataset.pl9rk; else p.mt = p.mt === t.dataset.pl9mt ? '' : t.dataset.pl9mt;
  touch(); recalc() }, true);
document.addEventListener('input', e => { const i = e.target; if (!i || i.id !== 'pl9_rcv' || !F || !F.pay) return; const v = toEn(i.value).replace(/[^\d]/g, ''); i.value = v ? fmtInput(v) : ''; F.pay.rcv = v; touch(); try { pl9PayUI() } catch (x) { } }, true);
/* after the final confirmation the collection sheet starts from what the consultant wrote; for reception it is «تعیین تکلیف مالی» */
{ const _o = openPostConfirm; openPostConfirm = function (snap) { const r = _o.apply(this, arguments); try { if (PC && $('pcSheet') && !$('pcSheet').hidden) { const h = $('pcSheet').querySelector('h3');
      if (ROLE === 'staff') { if (h) h.textContent = 'تعیین تکلیف مالی · ' + PC.name }
      else { const p = (snap && snap.pay) || {}, a = num(p.rcv); if (a > 0 && (p.rk === 'dep' || p.rk === 'cash')) { if (p.rk === 'dep') p4Mode(true); else PC.rcash = a; const ci = $('pc_cash'); if (ci) ci.value = fa(a); if (p.mt === 'cash' || p.mt === 'xfer') { PC.via = p.mt; const pp = $('pcPos'); if (pp) pp.innerHTML = posChips('pcpos', PC.via, { cash: 1 }) } } } } } catch (e) { } return r } }
