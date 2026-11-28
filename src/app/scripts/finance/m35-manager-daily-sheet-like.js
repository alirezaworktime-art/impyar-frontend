
/* ---------- m35 (owner, 2026-11-16): manager «گزارش پزشکان» (daily sheet like the clinic's Excel, work in detail, per doctor with the amount to pay),
   drug tracking code at discharge, per-level paper-file tariffs. ---------- */
const DR = { pk: 't', per: null, tab: 'day', doc: '', d: null, busy: false, map: null };
const DR_ORDER = ['GBR 1', 'GBR 2', 'اصلاحیه', 'آلوئولوپلاستی', 'آنکاوری', 'بستن هیلینگ', 'پوینتیک', 'تحویل پایه', 'چسب مجدد', 'خرید ژل', 'سدیشن 1', 'سینوس باز 1', 'سینوس بسته', 'کشیدن بخیه', 'متفرقه', 'معاینه', 'نسج سخت 1', 'هزینه جراحی ایتالیایی', 'هزینه جراحی کره ای', 'هزینه هلینگ', 'قالبگیری پایه', 'قالبگیری پوینتیک', 'نسج سخت 2', 'امتحان رزین', 'وضعیت بخیه', 'دندان عقل', 'دندان نهفته', 'ممبران'];
const DR_CLIN = 'کلینیک';
const drKey = n => normN(String(n || '').replace(/^\s*(د|دکتر)\s*[.\-]?\s*/, ''));
(function () { const s = document.createElement('section'); s.id = 'viewDr'; s.className = 'wrap'; s.style.padding = '0'; s.hidden = true; s.innerHTML = '<div id="drRoot" class="m1 drw"></div>'; const o = $('viewM1') || $('viewInv'); if (o && o.parentNode) o.parentNode.insertBefore(s, o.nextSibling); else document.body.appendChild(s); })();
{ const _s = show; show = function (v) { const r = _s.apply(this, arguments); const el = $('viewDr'); if (el) el.hidden = v !== 'dr'; return r } }
{ const _t = ttlNow; ttlNow = function () { const el = $('viewDr'); if (el && !el.hidden) return 'گزارش پزشکان'; return _t.apply(this, arguments) } }
{ const _t = TILES.manager; if (_t) TILES.manager = () => { const L = _t(); const i = L.findIndex(t => t.k === 'm1'); L.splice(i < 0 ? 0 : i + 1, 0, { k: 'dr', c: 'fin', l: 'گزارش پزشکان', s: 'کارکرد روزانه، کارکرد به ریز، تجمیعی و قابل پرداخت هر پزشک', n: 0, dr: 1 }); return L } }
{ const _g = goTile; goTile = function (k, opt = {}) { const t = (tileList() || []).find(x => x.k === k); if (!t || !t.dr) return _g.apply(this, arguments);
  if (typeof dirty !== 'undefined' && dirty && !$('viewForm').hidden) return;
  TILE = 'dr'; TSAVE[ROLE] = TILE; try { localStorage.setItem('implantTile', JSON.stringify(TSAVE)) } catch (e) {} document.body.dataset.tile = TILE;
  show('dr'); renderTiles(); if (!opt.keep) window.scrollTo(0, 0); drRender(); drLoad() } }
function drPer() { if (!DR.per) { DR.per = i2Range(DR.pk) || i2Range('t') } return DR.per }
async function drLoad() { if (DR.busy) return; DR.busy = true; const p = drPer(); try { DR.d = await api('m1Rep', { op: 'drRep', from: p.from, to: p.to }) } catch (e) { DR.d = { error: e.message } } finally { DR.busy = false } drRender() }
const drSub = () => { const d = DR.d || {}; return d.from === d.to ? jDay(d.from) : jDay(d.from) + ' تا ' + jDay(d.to) };
function drDocs(rows) { const S = new Set(); rows.forEach(r => S.add(r.clinic ? DR_CLIN : (r.doc || 'نامشخص'))); return [...S].sort((a, b) => drKey(a).localeCompare(drKey(b), 'fa')) }
function drHead() { const p = drPer(), c = DR.pk === 'c', d = DR.d || {}, docs = d.rows ? drDocs(d.rows).filter(x => x !== DR_CLIN) : [];
  const T = [['day', 'گزارش روزانه'], ['det', 'کارکرد به ریز'], ['sum', 'تجمیعی و قابل پرداخت']];
  return `<div class="card m1top"><div class="m1per"><span class="chips">${M1_PRE.map(([k, l]) => `<button type="button" class="chip" data-drpre="${k}" aria-pressed="${DR.pk === k}">${l}</button>`).join('')}</span>
    <div class="m1dates"${c ? '' : ' hidden'}><label class="f">از<input id="drFrom" data-jd inputmode="numeric" value="${esc(jDay(p.from))}"></label><label class="f">تا<input id="drTo" data-jd inputmode="numeric" value="${esc(jDay(p.to))}"></label><button class="btn sm" type="button" id="drGo">نمایش</button></div></div>
    <div class="drbar"><span class="chips" role="tablist">${T.map(([k, l]) => `<button type="button" class="chip" role="tab" data-drtab="${k}" aria-pressed="${DR.tab === k}">${l}</button>`).join('')}</span>
    ${DR.tab !== 'day' ? `<label class="f drdoc">پزشک<select id="drDoc"><option value="">همه‌ی پزشکان</option>${docs.map(x => `<option${x === DR.doc ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></label>` : ''}
    <span class="btns" style="margin:0"><button type="button" class="btn sm ghost" data-drfee="1">تعرفه‌ی پزشکان و خدمات</button><button type="button" class="btn sm ghost" data-drmap="1">جدول تطبیق خدمات</button></span></div></div>` }
function drWarn(d) { const L = []; if ((d.skip || []).length) L.push(`<p class="note">خدمت‌های پرونده‌ی جا مانده که به هیچ خدمت حسابداری وصل نیستند و در گزارش نیامدند: ${d.skip.map(x => esc(x.k) + ' ×' + fa(x.n)).join('، ')} — از «جدول تطبیق خدمات» یا «سهم پزشکان (تعرفه‌ی پزشکان)» در حسابداری وصلشان کنید.</p>`);
  const nf0 = d.rows.filter(r => !r.clinic && r.note && !/بدون سهم \(/.test(r.note)); if (nf0.length) L.push(`<p class="msg err">${fa(nf0.length)} ردیف سهم پزشک ندارند (پزشک پیدا نشد یا تعرفه‌ی سهمش ثبت نشده)؛ در «کارکرد به ریز» ستون «توضیح» را ببینید.</p>`);
  if (d.cut) L.push('<p class="msg err">بیش از ۳۰٬۰۰۰ ردیف؛ بازه را کوتاه‌تر کنید.</p>'); return L.join('') }
function drDay(d) { const rows = d.rows, docs = drDocs(rows), M = {};
  rows.forEach(r => { const c = r.clinic ? DR_CLIN : (r.doc || 'نامشخص'); const x = M[r.svc] || (M[r.svc] = { svc: r.svc, c: {}, tot: 0 }); x.c[c] = (x.c[c] || 0) + r.qty; x.tot += r.qty });
  const ord = s => { const i = DR_ORDER.findIndex(x => normN(x) === normN(s)); return i < 0 ? 999 : i };
  const R = Object.values(M).filter(x => x.tot).sort((a, b) => ord(a.svc) - ord(b.svc) || a.svc.localeCompare(b.svc, 'fa'));
  const cols = [{ k: 'svc', l: 'نام خدمت' }].concat(docs.map(n => ({ k: 'c:' + n, l: n, t: 'n', v: r => r.c[n] || '' })), [{ k: 'tot', l: 'جمع کل', t: 'n' }]);
  return `<div class="card"><div class="drttl"><b>گزارش عملکرد پزشکان بخش تخصصی کلینیک شهید رهنمون یزد</b><span>تاریخ: ${esc(drSub())}</span><button type="button" class="btn sm ghost" data-drprint="1">🖨 چاپ مثل فایل اکسل</button></div>
    ${FT('drDayT', 'گزارش پزشکان و خدمات', cols, R, { sum: cols.slice(1).map(c => c.k), sub: drSub(), land: 1, cap: 500, empty: 'در این بازه کاری ثبت نشده.' })}<p class="note">عدد هر خانه = تعداد واحد (دندان / فیکسچر / بسته). ستون «کلینیک» = قطعه و ماده‌ی بدون سهم پزشک. منبع: پرونده‌های جا مانده و صورتحساب‌های روز (برگه‌ی جراحی، مراحل پروتز، «کار امروز»).</p></div>` }
function drPrint() { const d = DR.d; if (!d || !d.rows) return; const rows = d.rows, docs = drDocs(rows), M = {};
  rows.forEach(r => { const c = r.clinic ? DR_CLIN : (r.doc || 'نامشخص'); const x = M[r.svc] || (M[r.svc] = { svc: r.svc, c: {}, tot: 0 }); x.c[c] = (x.c[c] || 0) + r.qty; x.tot += r.qty });
  const ord = s => { const i = DR_ORDER.findIndex(x => normN(x) === normN(s)); return i < 0 ? 999 : i }; const R = Object.values(M).filter(x => x.tot).sort((a, b) => ord(a.svc) - ord(b.svc) || a.svc.localeCompare(b.svc, 'fa'));
  const tc = n => R.reduce((a, r) => a + (r.c[n] || 0), 0), all = R.reduce((a, r) => a + r.tot, 0), v = x => x ? fa(x) : '';
  const html = `<div class="ttl"><span class="y">گزارش عملکرد پزشکان بخش تخصصی کلینیک شهید رهنمون یزد</span></div><table><thead><tr><th class="h">تاریخ</th><th class="h">${esc(drSub())}</th>${docs.slice(1).map(() => '<th class="e"></th>').join('')}<th class="e"></th></tr>
    <tr><th class="h">گزارش پزشکان و خدمات</th><th class="h">نام پزشکان</th>${docs.slice(1).map(() => '<th class="e"></th>').join('')}<th class="e"></th></tr>
    <tr><th class="h">نام خدمت</th>${docs.map(n => `<th>${esc(n)}</th>`).join('')}<th>جمع کل</th></tr></thead>
    <tbody>${R.map(r => `<tr><td class="s">${esc(r.svc)}</td>${docs.map(n => `<td>${v(r.c[n])}</td>`).join('')}<td>${v(r.tot)}</td></tr>`).join('')}</tbody>
    <tfoot><tr><td class="s">جمع کل</td>${docs.map(n => `<td>${v(tc(n))}</td>`).join('')}<td>${v(all)}</td></tr></tfoot></table>`;
  const w = window.open('', '_blank'); if (!w) { toast('پنجره‌ی چاپ باز نشد؛ اجازه‌ی پنجره‌ی تازه را بدهید.', 1); return }
  w.document.write(`<!doctype html><html dir="rtl" lang="fa"><head><meta charset="utf-8"><title>گزارش پزشکان ${esc(drSub())}</title><style>@page{size:A4 portrait;margin:12mm}body{font-family:Vazirmatn,Tahoma,sans-serif;color:#000;font-size:12px}
    .ttl{margin:0 0 6px}.y{background:#ff0;font-weight:700;font-size:14px;padding:2px 6px}table{border-collapse:collapse;width:auto;min-width:70%}th,td{border:1px solid #000;padding:3px 8px;text-align:center;font-weight:700}th.h{background:#d9e1f2}th.e{border:0}td.s{text-align:center;background:#fff}tfoot td{background:#d9e1f2}</style></head><body>${html}<script>setTimeout(function(){window.print()},300)<\/script></body></html>`); w.document.close() }
const drCol = { day: { k: 'day', l: 'تاریخ', t: 'd' }, pat: { k: 'pat', l: 'بیمار' }, file: { k: 'file', l: 'پرونده', v: r => faD(r.file || '') }, svc: { k: 'svc', l: 'خدمت' }, qty: { k: 'qty', l: 'تعداد', t: 'n' }, doc: { k: 'doc', l: 'پزشک', v: r => r.clinic ? DR_CLIN + (r.doc ? ' (' + r.doc + ')' : '') : r.doc || 'نامشخص' },
  amt: { k: 'amt', l: 'مبلغ خدمت', t: 'm' }, dC: { k: 'dC', l: 'تخفیف سهم کلینیک', t: 'm' }, dT: { k: 'dT', l: 'تخفیف کل', t: 'm' }, dD: { k: 'dD', l: 'تخفیف سهم پزشک', t: 'm' }, net: { k: 'net', l: 'مبلغ گرفته‌شده از بیمار', t: 'm' },
  fee: { k: 'fee', l: 'سهم پزشک', t: 'm' }, ded: { k: 'ded', l: 'کسر از سهم پزشک', t: 'm' }, pay: { k: 'pay', l: 'قابل پرداخت به پزشک', t: 'm' }, note: { k: 'note', l: 'توضیح', v: r => (r.src === 'arc' ? 'پرونده‌ی جا مانده' : 'صورتحساب ' + faD(String(r.no || ''))) + (r.note ? ' — ' + r.note : '') } };
const drRowsF = () => { const d = DR.d; return !DR.doc ? d.rows : d.rows.filter(r => DR.doc === DR_CLIN ? r.clinic : !r.clinic && r.doc === DR.doc) };
function drDet(d) { const R = drRowsF(), C = ['day', 'pat', 'file', 'svc', 'qty', 'doc', 'amt', 'dC', 'dT', 'dD', 'net', 'fee', 'ded', 'pay', 'note'].map(k => drCol[k]);
  return `<div class="card">${FT('drDetT', 'کارکرد پزشکان به ریز' + (DR.doc ? ' — ' + DR.doc : ''), C, R, { sum: ['qty', 'amt', 'dC', 'dT', 'dD', 'net', 'fee', 'ded', 'pay'], sub: drSub(), land: 1, cap: 800 })}
    <p class="note">کسر از سهم پزشک = تخفیف سهم پزشک (۱۰۰٪) + نصف تخفیف کل؛ تخفیف سهم کلینیک از سهم پزشک کم نمی‌شود. تخفیف کلِ پرونده به نسبت مبلغ هر خدمت پخش شده است.</p></div>` }
function drSum(d) { const R = drRowsF().filter(r => !r.clinic), by = {}, A = {};
  R.forEach(r => { const k = r.doc || 'نامشخص'; const x = by[k] || (by[k] = { doc: k, n: 0, qty: 0, amt: 0, net: 0, dT: 0, dD: 0, fee: 0, ded: 0, pay: 0 }); ['qty', 'amt', 'net', 'dT', 'dD', 'fee', 'ded', 'pay'].forEach(f => x[f] += r[f] || 0); x.n++;
    const g = r.doc + '|' + r.day + '|' + r.svc, y = A[g] || (A[g] = { doc: k, day: r.day, svc: r.svc, qty: 0, net: 0, dT: 0, dD: 0, fee: 0, ded: 0, pay: 0 }); ['qty', 'net', 'dT', 'dD', 'fee', 'ded', 'pay'].forEach(f => y[f] += r[f] || 0) });
  const D = Object.values(by).sort((a, b) => b.pay - a.pay), G = Object.values(A).sort((a, b) => drKey(a.doc).localeCompare(drKey(b.doc), 'fa') || (a.day < b.day ? -1 : a.day > b.day ? 1 : a.svc.localeCompare(b.svc, 'fa')));
  const one = DR.doc && DR.doc !== DR_CLIN ? D[0] : null;
  return `${one ? `<div class="kpis"><div class="kpi"><span>قابل پرداخت به ${esc(one.doc)}</span><b>${money(one.pay)}</b><span>سهم ${nf(one.fee)} − کسر ${nf(one.ded)}</span></div><div class="kpi"><span>مبلغ گرفته‌شده از بیمار</span><b>${money(one.net)}</b><span>${fa(one.qty)} واحد خدمت</span></div></div>` : ''}
   <div class="card">${FT('drSumG', 'کارکرد تجمیعی' + (DR.doc ? ' — ' + DR.doc : ' هر پزشک'), [{ k: 'doc', l: 'پزشک' }, drCol.day, drCol.svc, drCol.qty, drCol.net, drCol.fee, drCol.dT, drCol.dD, drCol.ded, drCol.pay], G, { sum: ['qty', 'net', 'fee', 'dT', 'dD', 'ded', 'pay'], sub: drSub(), land: 1, cap: 800 })}</div>
   <div class="card">${FT('drSumD', 'قابل پرداخت به هر پزشک', [{ k: 'doc', l: 'پزشک' }, { k: 'n', l: 'ردیف خدمت', t: 'n' }, drCol.qty, drCol.net, drCol.fee, drCol.dT, drCol.dD, drCol.ded, drCol.pay], D, { sum: ['n', 'qty', 'net', 'fee', 'dT', 'dD', 'ded', 'pay'], sub: drSub() })}
   <p class="note">سهم پزشک از «سهم پزشکان (تعرفه‌ی پزشکان)» در حسابداری. قابل پرداخت = سهم پزشک − تخفیف سهم پزشک − نصف تخفیف کل.</p></div>` }
function drRender() { const el = $('drRoot'); if (!el || $('viewDr').hidden) return; const d = DR.d;
  const body = !d ? '<div class="card"><p class="note">در حال بارگذاری…</p></div>' : !d.ok ? `<div class="card"><p class="msg err">${esc(d.error || 'خطا')}</p></div>` : `<div class="card drw0">${drWarn(d)}</div>` + (DR.tab === 'det' ? drDet(d) : DR.tab === 'sum' ? drSum(d) : drDay(d));
  el.innerHTML = drHead() + body.replace('<div class="card drw0"></div>', '') }
async function drMapOpen() { let j; try { j = await api('m1Rep', { op: 'drMap' }) } catch (e) { toast(e.message, 1); return } DR.map = j;
  const lbl = k => (A6C[k] && (A6C[k].l || A6C[k].t)) || k;
  const s = mkSheet('drMapSh', `<h3>جدول تطبیق خدمات</h3><p class="note">هر خدمت پرونده‌ی جا مانده در گزارش با کدام خدمت حسابداری (ردیف گزارش روزانه) شمرده شود. ایمپلنت به برند، کاشت مجدد و مراحل پروتز خودکارند.</p>
    <div class="drmap">${j.keys.map(k => `<label class="f">${esc(lbl(k))}<select data-drmk="${esc(k)}">${j.svcs.map(n => `<option${n === j.map[k] ? ' selected' : ''}>${esc(n)}</option>`).join('')}${j.svcs.includes(j.map[k]) ? '' : `<option selected>${esc(j.map[k])}</option>`}</select><small class="note">پیش‌فرض: ${esc(j.def[k] || '')}</small></label>`).join('')}</div>
    <div class="msg" id="drMapMsg"></div><div class="btns"><button type="button" class="btn" id="drMapOk">ذخیره</button><button type="button" class="btn ghost" data-drmapx="1">بستن</button></div>`); s.hidden = false }
document.addEventListener('click', async e => { const t = e.target && e.target.closest && e.target.closest('[data-drpre],[data-drtab],#drGo,[data-drprint],[data-drmap],[data-drmapx],#drMapOk,[data-drfee]'); if (!t) return;
  if (t.dataset.drfee) { try { M1.more = true; FIN.sec = 'set'; FIN.stab = 'fee' } catch (x) {} goTile('fin'); return }
  if (t.dataset.drpre) { const k = t.dataset.drpre; DR.pk = k; if (k !== 'c') { DR.per = i2Range(k); drRender(); drLoad() } else drRender(); return }
  if (t.dataset.drtab) { DR.tab = t.dataset.drtab; drRender(); return }
  if (t.id === 'drGo') { const f = parseJ($('drFrom').value), o = parseJ($('drTo').value); if (!f || !o || f > o) { toast('تاریخ‌ها را درست بنویسید.', 1); return } DR.per = { from: f, to: o }; DR.pk = 'c'; drRender(); drLoad(); return }
  if (t.dataset.drprint) { drPrint(); return }
  if (t.dataset.drmap) { drMapOpen(); return }
  if (t.dataset.drmapx) { const s = $('drMapSh'); if (s) s.hidden = true; return }
  if (t.id === 'drMapOk') { const map = {}; document.querySelectorAll('#drMapSh [data-drmk]').forEach(s => map[s.dataset.drmk] = s.value); t.disabled = true;
    try { await api('m1Rep', { op: 'drMapSave', map }); $('drMapSh').hidden = true; toast('جدول تطبیق ذخیره شد.'); drLoad() } catch (err) { const m = $('drMapMsg'); m.className = 'msg err'; m.textContent = err.message } finally { t.disabled = false } } });
document.addEventListener('change', e => { if (e.target && e.target.id === 'drDoc') { DR.doc = e.target.value; drRender() } });

/* ---- drug tracking code at discharge (one code for the whole prescription; optional) ---- */
{ const _r = renderSd; renderSd = function () { const r = _r.apply(this, arguments); try { document.querySelectorAll('#sdList [data-sd]').forEach(it => { if (it.querySelector('[data-sdrxc]')) return; const id = it.dataset.sd, n = it.querySelector('[data-sdnote]'); if (!n) return;
  const lb = document.createElement('label'); lb.className = 'f full'; lb.innerHTML = `کد رهگیری دارو (اختیاری)<input data-sdrxc="${esc(id)}" inputmode="numeric" maxlength="60" value="${esc((SDC[id] || {}).rxc || '')}" placeholder="کد رهگیری نسخه">`; n.closest('label').insertAdjacentElement('afterend', lb) }) } catch (e) {} return r } }
document.addEventListener('input', e => { const t = e.target; if (t && t.dataset && t.dataset.sdrxc) SDC[t.dataset.sdrxc] = Object.assign(SDC[t.dataset.sdrxc] || {}, { rxc: toEn(t.value) }) });
{ const _a = api; api = function (action, payload) { try { if (action === 'discharge' && payload && payload.id && !payload.rxcOnly && !payload.rxc) { const c = (SDC[payload.id] || {}).rxc; if (c) payload.rxc = c } } catch (e) {} return _a.apply(this, arguments) } }
{ const _f = renderFile; renderFile = function () { const r = _f.apply(this, arguments);
  try { const sg = PF && PF.j && PF.j.surg, dis = sg && sg.dis; const A = $('pfActs'); if (!dis || !A || document.getElementById('m35Rx')) return r;
    const can = ROLE === 'staff' || ROLE === 'manager' || ROLE === 'surgery';
    const box = document.createElement('div'); box.id = 'm35Rx'; box.className = 'm35rx'; box.innerHTML = `<span>ترخیص ${esc(jDay(String(dis.at || '').slice(0, 10)))}${dis.by ? ' · ' + esc(dis.by) : ''} — کد رهگیری دارو: <b>${dis.rxc ? esc(faD(dis.rxc)) : '—'}</b></span>${can ? '<button type="button" class="btn sm ghost" data-m35rx="1">' + (dis.rxc ? 'ویرایش کد' : 'ثبت کد') + '</button>' : ''}`;
    A.insertAdjacentElement('beforebegin', box) } catch (e) {} return r } }
document.addEventListener('click', async e => { const t = e.target && e.target.closest && e.target.closest('[data-m35rx]'); if (!t || !PF || !PF.j) return; e.preventDefault();
  const dis = (PF.j.surg || {}).dis || {}; const v = await uxAsk({ title: 'کد رهگیری دارو', ok: 'ثبت', cancel: 'انصراف', fields: [{ k: 'c', l: 'کد رهگیری نسخه', v: dis.rxc || '' }] }); if (!v) return;
  try { const r = ROLE === 'manager' ? await api('m1Rep', { op: 'drRxc', id: PF.id, rxc: toEn(v.c || '') }) : await api('discharge', { id: PF.id, rxcOnly: 1, rxc: toEn(v.c || '') }); PF.j.surg.dis.rxc = r.rxc; toast('کد رهگیری دارو ثبت شد.'); const b = $('m35Rx'); if (b) b.remove(); renderFile() } catch (err) { toast(err.message, 1) } });

/* ---- tariffs: each level of a paper-file treatment has its own tariff (empty = the base tariff of that treatment) ---- */
const M35_TP = [['ext2', 'کشیدن دندان ۲', 'ext'], ['ext3', 'کشیدن دندان ۳', 'ext'], ['gbr2', 'جراحی GBR ۲', 'gbr'], ['gbr3', 'جراحی GBR ۳', 'gbr'], ['sino2', 'سینوس لیفت باز ۲', 'sin_o'], ['sinc2', 'سینوس لیفت بسته ۲', 'sin_c'], ['alv2', 'آلوئولوپلاستی ۲', 'alv'], ['alv3', 'آلوئولوپلاستی ۳', 'alv'], ['hard2', 'جراحی نسج سخت ۲', 'hard'], ['hard3', 'جراحی نسج سخت ۳', 'hard'], ['tn2', 'جراحی دندان نهفته ۲', ''], ['tn3', 'جراحی دندان نهفته ۳', '']];
const m35K = k => 'lv_' + k.replace(/[23]$/, d => d === '2' ? 'b' : 'c'); /* the server keeps price keys of letters only */
try { M35_TP.forEach(([k]) => { const c = A6C[k]; if (!c || c.__m35) return; const p0 = c.p; c.p = function (l) { const v = A6P(m35K(k)); return v || p0.apply(this, arguments) }; c.__m35 = 1 }) } catch (e) {}
