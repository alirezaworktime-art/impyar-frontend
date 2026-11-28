/* ---------- ex1: استثناهای روند (تصمیم‌های مالک ۱۶ آبان) — فقط افزوده؛ محاسبه‌ها و ذخیره‌ی قبلی دست نخورده ----------
   a) ارجاع به جراح بدون برند: همان‌جا برگه‌ی برند باز می‌شود   b) مانده‌ی حساب هنگام «ادامه نمی‌دهد»: بخشیده شد / وصول شود
   c) دوره‌ی درمان تازه برای بیمار تمام‌شده   e) فیکسچر امانی/شخصی وقتی انبار صفر است   f) «فیل اولیه» با/بی کاشت دوباره، قیمت «کاشت مجدد»
   g) جایگزین چک شماره‌ی …   h) تعطیلات رسمی در تنظیمات؛ امضاکننده‌ی رضایت‌نامه (ولی/قیم) */
let RC_PREV = null;
const ex1Done = j => { try { const pr = j.pros || null, sg = j.surg || null; return !!((pr && pr.stage === 'done') || (sg && sg.finished && !pr)); } catch (e) { return false } };
/* a) brand not chosen yet → open the brand sheet right there (reception) */
{ const _a = api; api = function (action, payload) { const p = _a.apply(this, arguments); if (!(action === 'toSurgery' || action === 'sendDoc' || action === 'apptSet')) return p;
  return Promise.resolve(p).catch(async e => { if (ROLE === 'staff' && /برند ایمپلنت بیمار هنوز انتخاب نشده/.test((e && e.message) || '') && payload && payload.id) { try { const j = await _a('get', { id: payload.id }); if (j && j.data && j.data.pay && j.data.pay.blater) setTimeout(() => pl10BrandSheet(fromDoc(payload.id, j.data)), 350) } catch (x) { } } throw e }) } }
/* b) the patient does not go on, money is still owed: ask what to do, then repeat the action with the answer */
function ex1Ask(owe, name) { return new Promise(res => {
  const s = mkSheet('ex1Sh', `<h3>مانده‌ی حساب بیمار${name ? ' · ' + esc(name) : ''}</h3><p class="note">این بیمار درمان را ادامه نمی‌دهد ولی <b>${fa(owe)} تومان</b> از هزینه‌ی کارهای انجام‌شده مانده است. تکلیف این مانده چیست؟</p>
    <div class="seg" role="group"><button type="button" data-ex1m="waive" aria-pressed="true">بخشیده شد</button><button type="button" data-ex1m="collect" aria-pressed="false">وصول شود</button></div>
    <div class="fields"><label class="f" id="ex1DueW" hidden>تاریخ پیگیری وصول (شمسی)<input id="ex1_due" inputmode="numeric" placeholder="۱۴۰۵/۰۹/۱۵"></label><label class="f">دلیل / توضیح<input id="ex1_note" maxlength="300"></label></div>
    <div class="msg" id="ex1Msg"></div><div class="btns"><button class="btn" type="button" id="ex1Ok">ثبت و ادامه</button><button class="btn ghost" type="button" id="ex1X">انصراف</button></div>`);
  let mode = 'waive', done = false; s.hidden = false; const fin = v => { if (done) return; done = true; s.hidden = true; s.onclick = null; clearInterval(iv); res(v) };
  const iv = setInterval(() => { if (s.hidden) fin(null) }, 400);
  s.onclick = ev => { const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.ex1m) { mode = b.dataset.ex1m; s.querySelectorAll('[data-ex1m]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.ex1m === mode))); $('ex1DueW').hidden = mode !== 'collect'; return }
    if (b.id === 'ex1X') { fin(null); return }
    if (b.id === 'ex1Ok') { const note = $('ex1_note').value.trim(), m = $('ex1Msg'); let due = '';
      if (mode === 'collect') { due = parseJ($('ex1_due').value); if (!due) { m.className = 'msg err'; m.textContent = 'تاریخ پیگیری را به شکل ۱۴۰۵/۰۹/۱۵ بنویسید.'; return } }
      if (mode === 'waive' && !note) { m.className = 'msg err'; m.textContent = 'دلیل بخشش را بنویسید (در تاریخچه و حسابداری می‌ماند).'; return }
      fin({ mode, due, note }) } } }) }
{ const _a = api; api = function (action, payload) { const p = _a.apply(this, arguments); if (!(action === 'surgStop' || (action === 'prosAct' && payload && payload.op === 'stop'))) return p;
  return Promise.resolve(p).catch(async e => { const m = /^EX1\|(\d+)\|([\s\S]*)$/.exec((e && e.message) || ''); if (!m) throw e; const r = await ex1Ask(Number(m[1]), m[2]); if (!r) throw new Error('ثبت نشد: تکلیف مانده‌ی حساب مشخص نشد.'); return _a(action, Object.assign({}, payload, { ex1: r })) }) } }
/* c) a finished patient who comes back: a new file (course) linked to the old one */
{ const _r = rcReset; rcReset = function () { RC_PREV = null; return _r.apply(this, arguments) } }
{ const _f = renderFile; renderFile = function () { const r = _f.apply(this, arguments); try { if (!PF || !PF.j) return r; const d = PF.j.data || {}, h = d.h || {}, kv = document.querySelector('#pfSheet .pf-head .kv'); if (!kv) return r;
    const L = []; if (h.prev) L.push(`<span>دوره‌ی قبلی</span><span><button type="button" class="btn sm ghost" data-ex1open="${esc(h.prev)}">پرونده‌ی قبلی${h.prevJ ? ' (' + esc(h.prevJ) + ')' : ''}</button></span>`);
    (Array.isArray(d.next) ? d.next : []).forEach((id, i) => L.push(`<span>دوره‌ی بعدی</span><span><button type="button" class="btn sm ghost" data-ex1open="${esc(id)}">پرونده‌ی بعدی${d.next.length > 1 ? ' ' + fa(i + 1) : ''}</button></span>`));
    if (ROLE === 'staff' && ex1Done(PF.j) && !(Array.isArray(d.next) && d.next.length)) L.push(`<span>درمان تازه</span><span><button type="button" class="btn sm" data-ex1new="1">دوره‌ی درمان تازه</button></span>`);
    if (L.length) kv.insertAdjacentHTML('beforeend', L.join('')) } catch (e) { } return r } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-ex1open],[data-ex1new]'); if (!t) return; e.preventDefault(); e.stopPropagation();
  if (t.dataset.ex1open) { const id = t.dataset.ex1open; try { $('pfSheet').hidden = true } catch (x) { } openFile(id); return }
  if (t.dataset.ex1new && PF) { const h = ((PF.j || {}).data || {}).h || {}; sendToDoctor(PF.id, h.name || PF.j.name || '', h.phone || '') } }, true);
/* e, f) surgery day: loan fixture when the store is empty; early failure with / without a second fixture; re-implant pricing */
const EX1_IMP = { loan: false, rep: 1 };
function ex1ImpUI() { const st = $('impStock'); if (!st) return; let w = $('ex1LoanW'); if (!w) { st.insertAdjacentHTML('afterend', `<label class="pwshow" id="ex1LoanW" hidden><input type="checkbox" id="ex1_loan"> از انبار کلینیک نیست (فیکسچر امانی یا شخصی پزشک؛ از موجودی کم نمی‌شود)</label><div id="ex1RepW" class="ex1rep" hidden><small>فیل اولیه: همان جلسه دوباره کاشته شد؟</small><div class="seg" role="group"><button type="button" data-ex1rep="1" aria-pressed="true">بله، فیکسچر دوم کاشته شد</button><button type="button" data-ex1rep="0" aria-pressed="false">نه، برداشته شد (بدون انکاوری)</button></div></div>`); w = $('ex1LoanW') }
  const empty = !st.hidden && /موجود نیست/.test(st.textContent || ''); w.hidden = !empty && !EX1_IMP.loan; $('ex1_loan').checked = !!EX1_IMP.loan; if (!empty && !EX1_IMP.loan) $('ex1_loan').checked = false;
  $('ex1RepW').hidden = IMPRS !== 'fail'; ex1Bind(); document.querySelectorAll('#ex1RepW [data-ex1rep]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.ex1rep) === Number(EX1_IMP.rep)))) }
{ const _o = openImp; openImp = function (k, sid) { const r = _o.apply(this, arguments); try { const m = (SURG && SURG.imp[k]) || {}; EX1_IMP.loan = m.src === 'loan'; EX1_IMP.rep = m.rep === undefined ? 1 : Number(m.rep); ex1ImpUI() } catch (e) { } return r } }
/* impStock → ex1ImpUI(): merged into surgery/surgery-day.js */
{ const _x = xlRsBtns; xlRsBtns = function () { const r = _x.apply(this, arguments); try { ex1ImpUI() } catch (e) { } return r } }
function ex1Bind() { document.querySelectorAll('#ex1RepW [data-ex1rep]').forEach(b => { b.onclick = () => { EX1_IMP.rep = Number(b.dataset.ex1rep); ex1ImpUI() } }) }
document.addEventListener('change', e => { if (e.target && e.target.id === 'ex1_loan') EX1_IMP.loan = e.target.checked });
{ const _v = impSave; impSave = function () { const r = _v.apply(this, arguments); try { if (SURG && $('impSheet').hidden && SURG.imp[IMPK]) { const m = SURG.imp[IMPK]; if (EX1_IMP.loan) m.src = 'loan'; else delete m.src; if (m.rs === 'fail') m.rep = EX1_IMP.rep ? 1 : 0; else delete m.rep; renderImps() } } catch (e) { } return r } }
const ex1ImpTag = m => (m && m.rs === 'fail' ? (Number(m.rep) ? ' · فیکسچر دوم کاشته شد' : ' · برداشته شد، کاشت دوباره بعداً') : '') + (m && m.src === 'loan' ? ' · امانی/شخصی' : '');
{ const _r = renderImps; renderImps = function () { const r = _r.apply(this, arguments); try { document.querySelectorAll('#sgImps [data-impedit]').forEach(b => { const m = SURG && SURG.imp[b.dataset.impedit]; const t = ex1ImpTag(m); if (t && m && m.b && m.d && m.l) b.insertAdjacentHTML('beforeend', '<small class="ex1tag">' + esc(t) + '</small>') }) } catch (e) { } return r } }
/* re-implant (کاشت مجدد) after a failure: the fixture is free, the consumables of that tooth are half price (owner's rule) */
function ex1Adj(rec, sessions) { const b = effBrand(rec), P = rec.s; let adj = 0;
  (sessions || []).forEach(ss => { const S = secFrom(ss.s || {}), im = ss.imp || {}; const redo = Object.keys(im).filter(k => im[k] && im[k].rs === 'redo' && isTooth(k) && S.imp && S.imp.sel[k]);
    redo.forEach(k => { const g = im[k].g || b; adj += num(P.imp.bp[g] || P.imp.bp[b]); if (P.crw) adj += num(P.crw.price);
      if (S.gbr && S.gbr.sel[k]) adj += 0.5 * num(P.gbr.price) * Math.max(1, num((S.gbr.icnt || {})['gn:' + k])); });
    if (redo.length && S.vip && P.vip) { const qs = new Set(redo.map(k => k.slice(0, 2))); (SEC.vip.items || []).forEach(it => { qs.forEach(q => { const key = it.k + ':' + q; if (S.vip.isel && S.vip.isel[key]) adj += 0.5 * num(P.vip.ip[it.k]) * (num((S.vip.icnt || {})[key]) || 1) }) }) } });
  return Math.round(adj) }
/* (surgActual − ex1Adj: merged into surgery/surgery-day.js) */
/* g) replacing a returned / exchanged cheque: the number of the old cheque goes into the note (shown in lists and Excel) */
/* h) who signs the consent: the patient, or a guardian with name and relation */
function ex1GuardRead() { if (!F) return; const g = document.querySelector('#sgnSheet [data-ex1g="1"]'); const on = g && g.getAttribute('aria-pressed') === 'true';
  if (!on) { delete F.h.guard; return true } const name = ($('ex1_gname') || {}).value || '', rel = ($('ex1_grel') || {}).value || '';
  if (!name.trim()) { $('sgnMsg').className = 'msg err'; $('sgnMsg').textContent = 'نام ولی / قیم را بنویسید.'; return false }
  F.h.guard = { name: name.trim().slice(0, 80), rel: rel.trim().slice(0, 40) }; return true }
function ex1GuardBind() { document.querySelectorAll('#sgnSheet [data-ex1g]').forEach(t => { t.onclick = () => { document.querySelectorAll('#sgnSheet [data-ex1g]').forEach(b => b.setAttribute('aria-pressed', String(b === t))); const w = $('ex1GW'); if (w) w.hidden = t.dataset.ex1g !== '1' } }) }
{ const _o = openSign; openSign = function () { const r = _o.apply(this, arguments); try { ex1GuardBind(); const g = F && F.h && F.h.guard; document.querySelectorAll('#sgnSheet [data-ex1g]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.ex1g === '1') === !!g))); const w = $('ex1GW'); if (w) { w.hidden = !g; $('ex1_gname').value = g ? g.name || '' : ''; $('ex1_grel').value = g ? g.rel || '' : '' } } catch (e) { } return r } }
{ const _c = consentSign; consentSign = function (r, sig, meta) { const o = _c.apply(this, arguments); const g = r && r.h && r.h.guard; if (!g || !g.name) return o;
  return { h: o.h + 34, draw(cx, top) { T(cx, 'امضاکننده: ولی / قیم بیمار — ' + g.name + (g.rel ? ' (' + g.rel + ')' : ''), C.R, top + 24, { s: 19, w: 700 }); o.draw(cx, top + 34) } } } }
