/* ---------- m1: «مالی» — one page for the manager and the accountant: period chips, four cards (receipts · patient debts · doctors' shares · profit), a table per card with Excel / print. The old finance tiles (حسابداری کامل، صندوق و هزینه، داشبورد / گزارش‌های مدیریتی، دفتر اکسل، چک‌ها) fold under «بیشتر ▾». ---------- */
const M1 = { pk: 'm', per: null, sec: 'rcv', d: null, busy: false, more: false };
const M1_PRE = [['t', 'امروز'], ['w', 'این هفته'], ['m', 'این ماه'], ['pm', 'ماه قبل'], ['q3', 'سه ماه اخیر'], ['yr', 'امسال'], ['c', 'دلخواه']];
const M1_HIDE = { manager: ['dash', 'mrep', 'fin', 'acc'], accountant: ['xl', 'chq', 'fin'] };
const M1_KIND = { cash: 'نقد', card: 'کارتخوان', chq: 'چک', arc: 'پرونده‌ی کاغذی', bank: 'بانک' };
const m1Cat = k => { try { const e = EXPC.find(x => x[0] === k); if (e) return e[1] } catch (e) {} return k || '' };
(function () { const s = document.createElement('section'); s.id = 'viewM1'; s.className = 'wrap'; s.style.padding = '0'; s.hidden = true; s.innerHTML = '<div id="m1Root" class="m1"></div>'; const o = $('viewInv'); if (o && o.parentNode) o.parentNode.insertBefore(s, o.nextSibling); else document.body.appendChild(s); })();
{ const _s = show; show = function (v) { const r = _s.apply(this, arguments); const el = $('viewM1'); if (el) el.hidden = v !== 'm1'; return r } }
for (const role of ['manager', 'accountant']) { const _t = TILES[role]; if (!_t) continue; TILES[role] = () => { let L = _t(); const H = M1_HIDE[role];
  if (!M1.more && H.includes(TSAVE[role] || '')) M1.more = true;
  const T = { k: 'm1', c: 'fin', l: 'مالی', s: 'دریافتی، بدهی بیماران، سهم پزشکان، سود', n: 0, m1: 1 };
  const i = L.findIndex(t => H.includes(t.k)); const hid = L.filter(t => H.includes(t.k)); L = L.filter(t => !H.includes(t.k)); L.splice(i < 0 ? 0 : Math.min(i, L.length), 0, T);
  if (hid.length) { if (M1.more) L = L.concat(hid); L.push({ k: 'm1more', c: 'set', l: M1.more ? 'کمتر ▴' : 'بیشتر ▾', s: M1.more ? 'پنهان کردن بخش‌های پیشرفته' : hid.map(t => t.l).join('، '), n: 0, m1more: 1 }); }
  return L } }
{ const _g = goTile; goTile = function (k, opt = {}) { const t = tileList().find(x => x.k === k); if (!t) return _g.apply(this, arguments);
  if (t.m1more) { M1.more = !M1.more; renderTiles(); return }
  if (!t.m1) return _g.apply(this, arguments);
  if (typeof dirty !== 'undefined' && dirty && !$('viewForm').hidden) return;
  TILE = 'm1'; TSAVE[ROLE] = TILE; try { localStorage.setItem('implantTile', JSON.stringify(TSAVE)) } catch (e) {} document.body.dataset.tile = TILE;
  show('m1'); renderTiles(); if (!opt.keep) window.scrollTo(0, 0); m1Render(); m1Load() } }
function m1Per() { if (!M1.per) { M1.per = i2Range('m'); M1.pk = 'm' } return M1.per }
/* m1Load: base, replaced by m49a: the last request wins (an older answer that comes later is dropped) */
let m1Seq = 0;
async function m1Load() { const my = ++m1Seq, p = m1Per(); M1.busy = true; try { const j = await api('m1Rep', { from: p.from, to: p.to }); if (my !== m1Seq) return; M1.d = j } catch (e) { if (my !== m1Seq) return; M1.d = { error: e.message } } finally { if (my === m1Seq) M1.busy = false } m1Render() }
function m1Head() { const p = m1Per(), c = M1.pk === 'c';
  return `<div class="card m1top"><div class="m1per"><span class="chips">${M1_PRE.map(([k, l]) => `<button type="button" class="chip" data-m1pre="${k}" aria-pressed="${M1.pk === k}">${l}</button>`).join('')}</span>
    <div class="m1dates"${c ? '' : ' hidden'}><label class="f">از<input id="m1From" inputmode="numeric" value="${esc(jDay(p.from))}"></label><label class="f">تا<input id="m1To" inputmode="numeric" value="${esc(jDay(p.to))}"></label><button type="button" class="btn sm" id="m1Go">نمایش</button></div>
    <small class="note">بازه: ${esc(jDay(p.from))} تا ${esc(jDay(p.to))}</small></div>
    <div class="m1links">${ROLE === 'manager' ? '<button type="button" class="btn sm ghost" data-m1go="acc">ثبت هزینه / صندوق</button><button type="button" class="btn sm ghost" data-m1go="dash">داشبورد</button>' : '<button type="button" class="btn sm ghost" data-m1go="xl">دفتر اکسل</button><button type="button" class="btn sm ghost" data-m1go="chq">چک‌های سررسید</button>'}<button type="button" class="btn sm ghost" data-m1go="fin">حسابداری کامل</button></div></div>` }
/* m1Cards: base + m5 (fifth card) */
function m1Cards() { const d = M1.d || {}, ok = d && d.ok, v = x => ok ? nf(x) : '—';
  const C = [['rcv', 'دریافتی از بیماران', ok ? d.rcv.total : 0, ok ? `نقد ${nf(d.rcv.by.cash)} · کارت ${nf(d.rcv.by.card)} · چک ${nf(d.rcv.by.chq)}` : 'در حال بارگذاری…'],
    ['debt', 'بدهی بیماران (تا امروز)', ok ? d.debt.total : 0, ok ? `${fa(d.debt.n)} بیمار` : ''],
    ['docs', 'سهم پزشکان', ok ? d.docs.total : 0, ok ? `${fa(d.docs.by.length)} پزشک / همکار` : ''],
    ['pl', 'سود', ok ? d.profit : 0, ok ? `هزینه‌ها ${nf(d.exp.total)} · مواد ${nf(d.mat.total)}` : '']];
  const h = `<div class="kpis m1k">${C.map(([k, l, n, s]) => `<button type="button" class="kpi${k === 'pl' && ok && n < 0 ? ' out' : ''}" data-m1sec="${k}" aria-pressed="${M1.sec === k}"><span>${l}</span><b>${v(n)}</b><span>${esc(s)}</span></button>`).join('')}</div>`;
  /* m5: a fifth card «ایمپلنت‌های مصرفی» */
  { const d = M1.d || {}, ok = d && d.ok && d.imp;
  return h.replace(/<\/div>$/, `<button type="button" class="kpi" data-m1sec="imp" aria-pressed="${M1.sec === 'imp'}"><span>ایمپلنت‌های مصرفی</span><b>${ok ? fa(d.imp.n) : '—'}</b><span>${ok ? 'به تفکیک سایز و بیمار' : ''}</span></button></div>`) } }
/* m1Sec: base + m5 («سهم پزشکان»: one doctor's detail) + m49a («ایمپلنت‌های مصرفی»). m5 also had an «ایمپلنت‌های مصرفی» layer; m49a always answered that tab before it, so it is not repeated. */
function m1Sec() { const d = M1.d; if (!d) return '<div class="card"><p class="note">در حال بارگذاری…</p></div>'; if (!d.ok) return `<div class="card"><p class="msg err">${esc(d.error || 'خطا')}</p></div>`;
  /* m49a: «ایمپلنت‌های مصرفی» by brand and size, the files of the chosen ones (it replaced the first version of m5) */
  if (M1.sec === 'imp') {
  const I = d.imp || { rows: [] }, sub = `${jDay(d.from)} تا ${jDay(d.to)}`;
  const agg = (rows, keyf) => { const S = {}; rows.forEach(r => { const k = keyf(r) || '—', x = S[k] || (S[k] = { k, b: r.b, d: r.d, l: r.l, n: 0, ok: 0, redo: 0, fail: 0, p: new Set() }); x.n += r.n; x[m49K(r)] += r.n; x.p.add(r.id || (r.pat + '|' + r.file)) }); return Object.values(S).map(x => { x.pc = x.p.size; return x }) };
  const brands = agg(I.rows, r => r.b).sort((a, b) => String(a.k).localeCompare(String(b.k), 'fa'));
  if (M1.ibr && !brands.some(x => x.k === M1.ibr)) M1.ibr = '';
  const RB = M1.ibr ? I.rows.filter(r => (r.b || '—') === M1.ibr) : I.rows;
  const sizes = agg(RB, m5Sz).sort((a, b) => String(a.b).localeCompare(String(b.b), 'fa') || (parseFloat(a.d) || 0) - (parseFloat(b.d) || 0) || (parseFloat(a.l) || 0) - (parseFloat(b.l) || 0));
  if (M1.isz && !sizes.some(x => x.k === M1.isz)) M1.isz = '';
  const R = M1.isz ? RB.filter(r => (m5Sz(r) || '—') === M1.isz) : RB;
  const C3 = [{ k: 'n', l: 'تعداد', t: 'n' }, { k: 'ok', l: 'کاشت موفق', t: 'n' }, { k: 'redo', l: 'کاشت مجدد', t: 'n' }, { k: 'fail', l: 'فیل اولیه', t: 'n' }, { k: 'pc', l: 'تعداد بیمار', t: 'n' }], S3 = ['n', 'ok', 'redo', 'fail'];
  const flt = [M1.ibr ? 'برند ' + M1.ibr : '', M1.isz ? 'سایز ' + M1.isz : ''].filter(Boolean).join(' · ');
  return `<div class="card"><h3>ایمپلنت‌های مصرفی</h3>${I.err ? '<p class="msg err">خواندن مصرف انبار ممکن نشد.</p>' : ''}<p class="note">هر فیکسچری که در این بازه در جراحی یا پرونده‌ی کاغذی از انبار کم شده؛ برگشتی‌ها کم شده‌اند. روی یک برند یا یک سایز بزنید تا پرونده‌هایی که همان را گرفته‌اند پایین بیایند.</p>
    ${FT('m49br', 'به تفکیک برند', [{ k: 'k', l: 'برند' }].concat(C3), brands, { sum: S3, sub })}
    ${FT('m5isz', 'به تفکیک سایز' + (M1.ibr ? ' — ' + M1.ibr : ''), [{ k: 'k', l: 'برند / سیستم / قطر×طول' }].concat(C3), sizes, { sum: S3, sub })}
    <div class="m5bar m49bar"><label class="f">برند<select id="m49Br"><option value="">همه‌ی برندها</option>${brands.map(x => `<option value="${esc(x.k)}"${x.k === M1.ibr ? ' selected' : ''}>${esc(x.k)} (${fa(x.n)})</option>`).join('')}</select></label><label class="f">سایز<select id="m5Sz"><option value="">همه‌ی سایزها</option>${sizes.map(x => `<option value="${esc(x.k)}"${x.k === M1.isz ? ' selected' : ''}>${esc(x.k)} (${fa(x.n)})</option>`).join('')}</select></label>${flt ? `<button type="button" class="btn sm ghost" id="m49Clr">نمایش همه</button>` : ''}</div>
    ${FT('m5imp', 'پرونده‌ها و ایمپلنت‌های مصرفی' + (flt ? ' — ' + flt : ''), [{ k: 'day', l: 'تاریخ', t: 'd' }, { k: 'pat', l: 'بیمار' }, { k: 'file', l: 'شماره پرونده' }, { k: 'tooth', l: 'دندان', v: r => r.tooth ? toothTxt([r.tooth]) : '' }, { k: 'b', l: 'برند' }, { k: 'sys', l: 'سیستم' }, { k: 'd', l: 'قطر', v: r => r.d ? faD(String(r.d)) : '' }, { k: 'l', l: 'طول', v: r => r.l ? faD(String(r.l)) : '' }, { k: 'n', l: 'تعداد', t: 'n' }, { k: 'rs', l: 'نوع', v: r => M49_RS[r.rs] || M49_RS.new }, { k: 'paper', l: 'توضیح', v: r => [r.paper ? 'پرونده‌ی کاغذی' : '', r.second ? 'فیکسچر دوم بعد از فیل اولیه' : ''].filter(Boolean).join('، ') }], R, { sum: ['n'], sub, cap: 1000, land: 1, act: r => r.id ? `<button type="button" class="btn sm ghost" data-file="${esc(r.id)}" data-fname="${esc(r.pat || '')}">پرونده</button>` : '' })}</div>` }
  const sub = `${jDay(d.from)} تا ${jDay(d.to)}`;
  if (M1.sec === 'rcv') return `<div class="card"><h3>دریافتی‌ها</h3><div class="kv"><span>نقد</span><span>${money(d.rcv.by.cash)}</span><span>کارتخوان</span><span>${money(d.rcv.by.card)}</span><span>چک وصول‌شده (به سررسید)</span><span>${money(d.rcv.by.chq)}</span>${d.rcv.by.arc ? `<span>پرداخت‌های پرونده‌ی کاغذی</span><span>${money(d.rcv.by.arc)}</span>` : ''}<span><b>جمع دریافتی</b></span><span><b>${money(d.rcv.total)}</b></span>${d.rcv.wait ? `<span>چک‌های در انتظار وصول (سررسید در بازه)</span><span>${money(d.rcv.wait)}</span>` : ''}${d.rcv.bounce ? `<span>چک برگشتی</span><span>${money(d.rcv.bounce)}</span>` : ''}</div>
    ${FT('m1rcv', 'ریز دریافتی‌ها', [{ k: 'day', l: 'تاریخ', t: 'd' }, { k: 'name', l: 'بیمار' }, { k: 'kind', l: 'نوع', v: r => (M1_KIND[r.kind] || r.kind) + (r.kind === 'chq' ? (r.st === 'ok' ? ' (وصول)' : r.st === 'bounce' ? ' (برگشتی)' : ' (در انتظار)') : '') }, { k: 'no', l: 'شماره / بانک', v: r => [r.no, r.bank].filter(Boolean).join(' — ') }, { k: 'amount', l: 'مبلغ', t: 'm' }, { k: 'by', l: 'ثبت' }], d.rcv.rows, { sum: ['amount'], sub, cap: 500 })}</div>`;
  if (M1.sec === 'debt') return `<div class="card"><h3>بدهی بیماران</h3><p class="note">مانده‌ی بیمارانی که درمانشان شروع شده (تا امروز؛ وابسته به بازه نیست).</p>
    ${FT('m1debt', 'بدهی بیماران', [{ k: 'name', l: 'بیمار' }, { k: 'total', l: 'کل درمان', t: 'm' }, { k: 'paid', l: 'پرداخت‌شده', t: 'm' }, { k: 'wait', l: 'چک در انتظار', t: 'm' }, { k: 'rest', l: 'مانده', t: 'm' }], d.debt.rows, { sum: ['total', 'paid', 'wait', 'rest'], sub: 'تا ' + jDay(d.to), cap: 500 })}</div>`;
  if (M1.sec === 'docs') { /* m5: pick one doctor (his services, Excel / print), Excel / print of all doctors */
  const names = d.docs.by.map(x => x.name); if (M1.doc && !names.includes(M1.doc)) M1.doc = '';
  const bar = `<div class="m5bar"><label class="f">ریز سهم<select id="m5Doc"><option value="">همه‌ی پزشکان و همکاران</option>${names.map(n => `<option value="${esc(n)}"${n === M1.doc ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
    <button type="button" class="btn sm ghost" id="m5AllX">⬇ اکسل همه به تفکیک پزشک</button><button type="button" class="btn sm ghost" id="m5AllP">🖨 چاپ همه (هر پزشک یک صفحه)</button></div>`;
  let h = `<div class="card"><h3>سهم پزشکان و همکاران</h3>${d.docs.arcSkip && d.docs.arcSkip.length ? `<p class="note">خدمت‌های پرونده‌ی کاغذی که در جدول تعرفه‌ی پزشکان نیستند (بی‌سهم؛ با افزودن خدمت هم‌نام و تعرفه در «تعرفه‌ی پزشکان» محاسبه می‌شوند): ${d.docs.arcSkip.map(x => esc(x.k) + " ×" + fa(x.n)).join("، ")}</p>` : ""}${d.docs.unmatched || d.docs.zero ? `<p class="msg err">${d.docs.unmatched ? fa(d.docs.unmatched) + ' خدمت بدون پزشک مشخص' : ''}${d.docs.unmatched && d.docs.zero ? ' · ' : ''}${d.docs.zero ? fa(d.docs.zero) + ' خدمت بدون تعرفه‌ی سهم برای پزشکش' : ''} — در جدول ریز با توضیح مشخص شده‌اند؛ تعرفه‌ها در «حسابداری کامل ← تعرفه‌ی پزشکان».</p>` : ''}
    ${FT('m1docs', 'جمع سهم هر پزشک', [{ k: 'name', l: 'پزشک / همکار' }, { k: 'n', l: 'تعداد خدمت', t: 'n' }, { k: 'fee', l: 'سهم', t: 'm' }], d.docs.by, { sum: ['fee'], sub })}
    ${FT('m1docr', 'ریز خدمات و سهم', [{ k: 'day', l: 'تاریخ', t: 'd' }, { k: 'pat', l: 'بیمار' }, { k: 'svc', l: 'خدمت' }, { k: 'qty', l: 'تعداد', t: 'n' }, { k: 'amt', l: 'مبلغ خدمت', t: 'm' }, { k: 'doc', l: 'پزشک' }, { k: 'fee', l: 'سهم', t: 'm' }, { k: 'note', l: 'توضیح' }], d.docs.rows, { sum: ['amt', 'fee'], sub, cap: 500, land: 1 })}</div>`;
  h = h.replace('<h3>سهم پزشکان و همکاران</h3>', '<h3>سهم پزشکان و همکاران</h3>' + bar);
  if (!M1.doc) return h;
  const R = m5Rows(d, M1.doc), S = m5Svc(R), tot = R.reduce((a, r) => a + (Number(r.fee) || 0), 0);
  const one = `<div class="m5one"><div class="kv"><span>پزشک / همکار</span><span><b>${esc(M1.doc)}</b></span><span>بازه</span><span>${esc(sub)}</span><span>تعداد خدمت</span><span>${fa(R.length)}</span><span>جمع سهم</span><span><b>${money(tot)}</b></span></div>
    ${FT('m5svc', 'سهم ' + M1.doc + ' به تفکیک خدمت', M5_SCOLS, S, { sum: ['qty', 'amt', 'fee'], sub })}
    ${FT('m5det', 'ریز سهم ' + M1.doc, M5_COLS, R, { sum: ['amt', 'fee'], sub, cap: 1000, land: 1 })}
    <div class="btns"><button type="button" class="btn sm ghost" data-fx="x:m5svc,m5det">⬇ اکسل این پزشک (دو برگه)</button><button type="button" class="btn sm ghost" data-fx="p:m5svc,m5det">🖨 چاپ صورت‌حساب این پزشک</button></div></div>`;
  /* the detail of one doctor replaces the all-doctors detail table */
  return h.replace(/<div class="ftw" data-ft="m1docr">[\s\S]*$/, one + '</div>') }
  return `<div class="card"><h3>هزینه‌ها و سود</h3><div class="kv"><span>دریافتی از بیماران</span><span>${money(d.rcv.total)}</span><span>− سهم پزشکان</span><span>${money(d.docs.total)}</span><span>− هزینه‌ها</span><span>${money(d.exp.total)}</span><span>− بهای ایمپلنت و مواد مصرف‌شده</span><span>${money(d.mat.total)}${d.mat.noCost ? ` <small class="note">(${fa(d.mat.noCost)} قلم بدون قیمت خرید)</small>` : ''}</span><span><b>= سود</b></span><span><b class="${d.profit < 0 ? 'bad' : ''}">${money(d.profit)}</b></span></div>
    ${FT('m1exp', 'هزینه‌ها به تفکیک', [{ k: 'cat', l: 'دسته', v: r => m1Cat(r.cat) }, { k: 'amount', l: 'مبلغ', t: 'm' }], d.exp.by, { sum: ['amount'], sub })}
    ${FT('m1expr', 'ریز هزینه‌ها', [{ k: 'day', l: 'تاریخ', t: 'd' }, { k: 'cat', l: 'دسته', v: r => m1Cat(r.cat) }, { k: 'note', l: 'شرح' }, { k: 'pay', l: 'پرداخت', v: r => M1_KIND[r.pay] || r.pay }, { k: 'amount', l: 'مبلغ', t: 'm' }, { k: 'by', l: 'ثبت' }], d.exp.rows, { sum: ['amount'], sub, cap: 500 })}
    ${FT('m1mat', 'ایمپلنت و مواد مصرف‌شده', [{ k: 'day', l: 'تاریخ', t: 'd' }, { k: 'item', l: 'قلم' }, { k: 'pat', l: 'بیمار' }, { k: 'n', l: 'تعداد', t: 'n' }, { k: 'cost', l: 'بها', t: 'm' }], d.mat.rows, { sum: ['n', 'cost'], sub, cap: 500 })}</div>` }
/* m1Render: base + m5 (rows of «جمع سهم هر پزشک» open that doctor; rows of «به تفکیک سایز» pick a size) + m49a (brand rows, the chosen brand / size marked).
   The three added passes run after every draw, also when nothing was drawn (so the draw has no early return). */
function m1Render() { { const el = $('m1Root'); if (el && !$('viewM1').hidden) el.innerHTML = m1Head() + m1Cards() + m1Sec() }
  try { if (M1.sec === 'docs' && M1.d && M1.d.ok) { const t = document.querySelector('[data-ft="m1docs"] tbody'); if (t) [...t.querySelectorAll('tr')].forEach(tr => { const td = tr.querySelector('td'); if (!td) return; const n = td.textContent.trim(); if (!M1.d.docs.by.some(x => x.name === n)) return; tr.classList.add('m5pick'); tr.dataset.m5n = n; tr.title = 'ریز سهم ' + n; tr.setAttribute('tabindex', '0') }) } } catch (e) {}
  try { if (M1.sec === 'imp') document.querySelectorAll('[data-ft="m5isz"] tbody tr').forEach(tr => { const td = tr.querySelector('td'); if (!td || !td.textContent.trim() || tr.querySelector('.empty')) return; tr.classList.add('m5pick'); tr.dataset.m5s = td.textContent.trim(); tr.setAttribute('tabindex', '0') }) } catch (e) {}
  try { if (M1.sec === 'imp') { document.querySelectorAll('[data-ft="m49br"] tbody tr').forEach(tr => { const td = tr.querySelector('td'); if (!td || !td.textContent.trim() || tr.querySelector('.empty')) return; tr.classList.add('m5pick'); tr.dataset.m49b = td.textContent.trim(); tr.setAttribute('tabindex', '0'); if (tr.dataset.m49b === M1.ibr) tr.classList.add('m49on') }); document.querySelectorAll('[data-ft="m5isz"] tbody tr[data-m5s]').forEach(tr => { if (tr.dataset.m5s === M1.isz) tr.classList.add('m49on') }) } } catch (e) { } }
document.addEventListener('click', e => { const t = e.target && e.target.closest && e.target.closest('[data-m1pre],[data-m1sec],[data-m1go],#m1Go'); if (!t) return;
  if (t.dataset.m1pre) { const k = t.dataset.m1pre; M1.pk = k; if (k !== 'c') { M1.per = i2Range(k); m1Render(); m1Load() } else m1Render(); return }
  if (t.dataset.m1sec) { M1.sec = t.dataset.m1sec; m1Render(); return }
  if (t.dataset.m1go) { M1.more = true; goTile(t.dataset.m1go); return }
  if (t.id === 'm1Go') { const f = parseJ($('m1From').value), o = parseJ($('m1To').value); if (!f || !o || f > o) { toast('تاریخ‌ها را درست بنویسید.', 1); return } M1.per = { from: f, to: o }; M1.pk = 'c'; m1Render(); m1Load() } });
/* ---- inventory for the manager / accountant: only «گزارش‌ها» and the two stock tabs; the report select (duplicate of the side list) and the duplicate reports go ---- */
const M1_IDUP = ['users', 'bysup', 'pers', 'kpi'];
{ const _r = i2RepView; i2RepView = function (B) { const r = _r.apply(this, arguments); try { if (ROLE === 'manager' || ROLE === 'accountant') { const s = B.querySelector('.i2sel'); if (s) s.remove(); M1_IDUP.forEach(k => { const b = B.querySelector(`.i2card[data-i2rep="${k}"]`); if (b) b.remove() }) } } catch (e) {} return r } }
