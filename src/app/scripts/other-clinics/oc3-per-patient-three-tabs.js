/* ---------- oc3: «سایر کلینیک‌ها» — per patient three tabs: «طرح درمان» (our plan sections, no tariff, PDF with the clinic's own name),
   «انجام کار» (the clinic's services on the plan-form cards, tariff of the clinic editable per session; one implant tariff per clinic),
   «پروتز» (prosthesis sections + the stages). No appointments, no inventory, no follow-ups. ---------- */
const OC3 = { tab: 'plan', f: null, mode: '', pr: {}, kf: null };
const oc3Secs = () => (OC.d && OC.d.secs) || [], oc3Pros = () => (OC.d && OC.d.pros) || [];
const oc3Svc = c => (c.svc || []).filter(s => !/^(ps_|bp_)/.test(s.k));
const oc3SvcOf = (c, kind) => oc3Svc(c).filter(s => kind === 'pros' ? oc3Pros().includes(s.sec) : !oc3Pros().includes(s.sec));
const oc3Qty = (x, s) => x.kind === 'items' || x.id === 'anes' ? (x.items || []).reduce((a, it) => a + itemQty(s, it), 0) : qty(s, x);
/* the plan-form globals point at the open oc3 form while a tab form is on screen */
function oc3Mount(secs) { if (!OC3.kf) OC3.kf = F; const f = blankForm(); f.s = secFrom(secs || {}); f.brand = 'ko'; F = f; CUR = 1; SURG = null; try { dirty = false } catch (e) { } return f }
function oc3Unmount() { if (OC3.kf) { F = OC3.kf; OC3.kf = null } OC3.mode = ''; OC3.f = null; try { dirty = false } catch (e) { } }
/* ===== patient page: header + tabs ===== */
function oc2PatHTML() {
  const v = OC2.v, p = v.pat, c = ocCl(p.clinic);
  const T = [['plan', 'طرح درمان'], ['work', 'انجام کار'], ['pros', 'پروتز']];
  return `<div class="card"><div class="oc2-h"><button class="btn sm ghost" type="button" id="oc2Back">→ فهرست</button><h2>${esc(p.name)} <small>${esc(c.name)}</small></h2></div>
  <div class="seg oc3-tabs" role="tablist">${T.map(([k, l]) => `<button type="button" role="tab" data-oc3tab="${k}" aria-pressed="${OC3.tab === k}">${l}</button>`).join('')}</div>
  <div class="oc2-kpi"><div><small>کارها</small><b>${fa(v.ses.filter(s => s.kind !== 'pros').length)}</b></div><div><small>پروتز</small><b>${fa(v.ses.filter(s => s.kind === 'pros').length)}${v.stage ? ' · ' + esc(oc2PSN(v.stage)) : ''}</b></div><div><small>جمع</small><b>${ocR(v.total)}</b></div><div><small>طرح</small><b>${v.plan ? 'ثبت شده' : '—'}</b></div></div>
  <div id="oc3Body">${OC3.tab === 'plan' ? oc3PlanHTML() : oc3TabHTML(OC3.tab)}</div></div>`
}
/* the plan summary (teeth marked in the plan) shown on top of the work / prosthesis tabs */
function oc3PlanSum() { const pl = OC2.v && OC2.v.plan; if (!pl || !Object.keys(pl.s || {}).length) return '<p class="note">برای این بیمار طرح درمان ثبت نشده است.</p>'; const S = secFrom(pl.s); return `<div class="oc3-plan-sum"><b>طرح درمان:</b> ${secLines(S).map(l => `<span><i>${esc(l.t)}:</i> ${esc(l.d)}</span>`).join('')}</div>` }
/* ===== «طرح درمان»: all the plan sections, no price ===== */
function oc3PlanHTML() {
  const v = OC2.v, pl = v.plan; if (OC3.mode !== 'plan') { OC3.mode = 'plan'; OC3.f = oc3Mount(pl ? pl.s : {}); OC3.f.note = pl ? pl.note || '' : '' }
  return `<p class="note">طرح پیشنهادی برای تحویل به ${esc(ocCl(v.pat.clinic).name)} — بدون تعرفه. درمان‌ها را مثل فرم طرح درمان علامت بزنید.</p>
  <div class="oc3f oc3-plan" id="oc3Form">${SECTIONS.map(x => sectionHTML(x)).join('')}</div>
  <div class="fields"><label class="f">توضیح<input id="oc3note" maxlength="400" value="${esc(OC3.f.note || '')}"></label></div>
  <div class="msg" id="oc2Msg" role="alert"></div>
  <div class="btns"><button class="btn main" type="button" id="oc3PlanSave">ذخیره‌ی طرح درمان</button><button class="btn ghost" type="button" id="oc3PlanPdf"${pl ? '' : ' disabled title="اول طرح را ذخیره کنید"'}>PDF برای کلینیک</button></div>`
}
/* ===== «انجام کار» / «پروتز»: list of sessions + form on the clinic's services ===== */
function oc3TabHTML(kind) {
  const v = OC2.v, c = ocCl(v.pat.clinic), L = v.ses.filter(s => (s.kind || 'work') === kind);
  if (OC3.f && OC3.mode === kind) return oc3FormHTML(kind);
  const lbl = kind === 'pros' ? 'پروتز' : 'کار';
  return oc3PlanSum() + `<div class="oc-lbl">${kind === 'pros' ? 'جلسه‌های پروتز' : 'کارهای انجام‌شده'}</div>${L.length ? L.map(s => `<div class="oc-it oc2-ses"><div><b>جلسه ${fa(s.n)}</b> · ${esc(jDay(s.day))}${s.last ? ' · <span class="pill ok">آخرین جلسه</span>' : ''}<br><small>${(s.items || []).map(i => esc(i.n) + ' × ' + fa(i.q)).join('، ')}${s.note ? ' · ' + esc(s.note) : ''}</small></div><div class="oc-amt">${ocR(s.amount)}</div><div class="oc-act"><button class="btn sm ghost" type="button" data-oc3ed="${esc(s.id)}">ویرایش</button><button class="btn sm ghost danger" type="button" data-oc2sdel="${esc(s.id)}">حذف</button></div></div>`).join('') : `<div class="empty">هنوز ${lbl}ی ثبت نشده.</div>`}
  <div class="btns"><button class="btn" type="button" data-oc3new="${kind}">+ ثبت ${lbl} جدید</button></div>` + (kind === 'pros' ? oc3StagesHTML(v, c) : '') + '<div class="msg" id="oc2Msg" role="alert"></div>'
}
function oc3StagesHTML(v, c) {
  const PS = oc2PS(), ci = PS.findIndex(s => s[0] === v.stage), nxt = v.next;
  return `<div class="oc-lbl">مراحل پروتز</div><div class="stepper oc2-st">${PS.map(([k, l], i) => `<span class="ps${i <= ci ? ' ok' : ''}${i === ci + 1 ? ' cur' : ''}"><i></i><b>${esc(l)}</b><small>${i <= ci ? esc(jDay((v.pros.find(r => r.stage === k) || {}).day || '')) : i === ci + 1 ? 'مرحله‌ی بعدی' : ''}</small></span>`).join('')}</div>
  ${v.pros.length ? `<div class="oc-list">${v.pros.map((r, i) => `<div class="oc-it"><div><b>${esc(oc2PSN(r.stage))}</b> · ${esc(jDay(r.day))}${r.note ? '<br><small>' + esc(r.note) + '</small>' : ''}</div><div class="oc-amt">${r.amount ? ocR(r.amount) : '—'}</div>${i === v.pros.length - 1 ? `<div class="oc-act"><button class="btn sm ghost danger" type="button" data-oc2pdel="${esc(r.id)}">برداشتن</button></div>` : ''}</div>`).join('')}</div>` : ''}
  ${nxt ? `<div class="fields oc2-pf"><label class="f">تاریخ<input id="oc2pday" data-jd inputmode="numeric" value="${esc(jDay(tDay()))}"></label><label class="f">توضیح<input id="oc2pnote" maxlength="300"></label></div><div class="btns"><button class="btn main" type="button" id="oc2ProsGo" data-stage="${esc(nxt)}">ثبت «${esc(oc2PSN(nxt))}»${nxt !== 'done' && !oc2Pr(c, 'ps_' + nxt) ? ' <small>(تعرفه صفر)</small>' : nxt !== 'done' ? ' — ' + ocR(oc2Pr(c, 'ps_' + nxt)) : ''}</button></div>` : '<p class="note">پروتز تحویل شده است.</p>'}`
}
function oc3New(kind, ses) { const v = OC2.v; OC3.mode = kind; OC3.pr = {}; const f = oc3Mount(ses ? ses.s : {}); f.id = ses ? ses.id : ''; f.day = ses ? ses.day : tDay(); f.note = ses ? ses.note || '' : ''; f.last = !!(ses && ses.last); f.q = {}; (ses ? ses.items : []).forEach(i => { OC3.pr[i.k] = i.p; if (!i.sec) f.q[i.k] = i.q }); OC3.f = f; ocRender(); window.scrollTo(0, 0) }
function oc3Cards(kind) { const c = ocCl(OC2.v.pat.clinic); return oc3SvcOf(c, kind).filter(s => s.sec && SEC[s.sec]) }
function oc3Price(s) { return OC3.pr[s.k] !== undefined ? Number(OC3.pr[s.k]) || 0 : Number(s.p) || 0 }
function oc3Lines(kind) { const f = OC3.f, c = ocCl(OC2.v.pat.clinic), out = []; oc3SvcOf(c, kind).forEach(s => { const x = SEC[s.sec]; const q = x ? oc3Qty(x, f.s[x.id]) : (f.q[s.k] || 0); if (q) out.push({ k: s.k, n: s.n, q, p: oc3Price(s), sec: s.sec || '' }) }); return out }
function oc3LineHTML(s, x) { const q = oc3Qty(x, OC3.f.s[x.id]), p = oc3Price(s); return `<div class="oc3-line" data-oc3l="${esc(s.k)}"><span class="oc3-sn">${esc(s.n)}</span><label class="f oc3-pf">تعرفه (ریال)<input class="price" inputmode="numeric" data-oc3p="${esc(s.k)}" value="${p ? esc(fa(p)) : ''}" placeholder="۰"></label><b class="pl9m" dir="ltr">${fa(q)} × ${fa(p)} = ${fa(q * p)}</b>${!p ? '<i class="oc-warn">تعرفه صفر</i>' : ''}</div>` }
{ const _s = sectionHTML; sectionHTML = function (x) { let h = _s.apply(this, arguments); try { if (OC3.mode && OC3.f && (OC3.mode === 'work' || OC3.mode === 'pros')) { const s = oc3Cards(OC3.mode).find(v => v.sec === x.id); if (s) { h = h.replace('<span class="h2t">' + x.t + '</span>', '<span class="h2t">' + esc(s.n) + ' <small class="note">(' + x.t + ')</small></span>'); const i = h.lastIndexOf('</section>'); h = h.slice(0, i) + oc3LineHTML(s, x) + h.slice(i) } /* teeth of the plan show faintly */ const pl = OC2.v && OC2.v.plan && OC2.v.plan.s && OC2.v.plan.s[x.id]; if (pl) (pl.sel || []).forEach(k => { h = h.replace(`class="t" data-sid="${x.id}" data-k="${k}"`, `class="t pl" data-sid="${x.id}" data-k="${k}"`) }) } } catch (e) { } return h } }
function oc3FormHTML(kind) {
  const f = OC3.f, c = ocCl(OC2.v.pat.clinic), cards = oc3Cards(kind), cnt = oc3SvcOf(c, kind).filter(s => !s.sec);
  const sum = oc3Lines(kind).reduce((a, l) => a + l.q * l.p, 0);
  return `<div class="oc2-h"><button class="btn sm ghost" type="button" id="oc3Back">→ برگشت</button><h3>${f.id ? 'ویرایش' : 'ثبت'} ${kind === 'pros' ? 'پروتز' : 'کار'} <small>${esc(c.name)}</small></h3></div>` + oc3PlanSum() +
  `<div class="fields"><label class="f">تاریخ<input id="oc3day" data-jd inputmode="numeric" value="${esc(jDay(f.day))}"></label></div>
  ${cards.length ? `<div class="oc3f" id="oc3Form">${cards.map(s => sectionHTML(SEC[s.sec])).join('')}</div>` : `<p class="oc-warn">برای ${esc(c.name)} خدمتی با «بخش» ${kind === 'pros' ? 'پروتز' : 'جراحی'} تعریف نشده؛ در «کلینیک‌ها و تعرفه‌ها» برای هر خدمت بخش را انتخاب کنید.</p>`}
  ${cnt.length ? `<div class="oc-lbl">خدمات شمارشی</div><div class="oc-svc oc2-svc">${cnt.map(s => { const q = f.q[s.k] || 0; return `<div class="oc-row${q ? ' on' : ''}"><div class="oc-sn"><b>${esc(s.n)}</b><small>${ocR(oc3Price(s))}</small></div><div class="oc-cc"><button type="button" class="oc-k" data-oc3q="${esc(s.k)}" data-d="-1" aria-label="کمتر">−</button><b>${fa(q)}</b><button type="button" class="oc-k" data-oc3q="${esc(s.k)}" data-d="1" aria-label="بیشتر">+</button></div></div>` }).join('')}</div>` : ''}
  <div class="fields"><label class="f">توضیح<input id="oc3note" maxlength="400" value="${esc(f.note || '')}"></label></div>
  ${kind === 'work' ? `<label class="chk"><input type="checkbox" id="oc3last" ${f.last ? 'checked' : ''}> این آخرین جلسه است (پایان جراحی)</label>` : ''}
  <div class="oc-sub">جمع این جلسه: <b id="oc3Sum">${ocR(sum)}</b></div>
  <div class="msg" id="oc2Msg" role="alert"></div>
  <div class="btns"><button class="btn main" type="button" id="oc3Save">ثبت</button><button class="btn ghost" type="button" id="oc3Back2">انصراف</button></div>`
}
function oc3Paint() { if (!OC3.f || !(OC3.mode === 'work' || OC3.mode === 'pros')) return; const c = ocCl(OC2.v.pat.clinic); oc3Cards(OC3.mode).forEach(s => { const x = SEC[s.sec], el = document.querySelector(`[data-oc3l="${CSS.escape(s.k)}"]`); if (!el || !x) return; const q = oc3Qty(x, OC3.f.s[x.id]), p = oc3Price(s); el.querySelector('b.pl9m').textContent = `${fa(q)} × ${fa(p)} = ${fa(q * p)}`; const w = el.querySelector('i.oc-warn'); if (w && p) w.remove() }); const sm = $('oc3Sum'); if (sm) sm.textContent = ocR(oc3Lines(OC3.mode).reduce((a, l) => a + l.q * l.p, 0)); void c }
{ const _r = recalc; recalc = function () { const r = _r.apply(this, arguments); try { oc3Paint() } catch (e) { } return r } }
function oc3Read() { const f = OC3.f; if (!f) return; const dy = $('oc3day'), nt = $('oc3note'), ls = $('oc3last'); if (dy) { const v = parseJ(dy.value.trim()); if (v) f.day = v } if (nt) f.note = nt.value; if (ls) f.last = ls.checked }
/* ===== PDF of the plan for the clinic: our plan layout, the clinic's name in the header, no prices / payment / consent ===== */
{ const _t = totalsBlock; totalsBlock = function () { if (OC3.pdf) return { h: 0, draw() { } }; return _t.apply(this, arguments) } }
{ const _p = payBlock; payBlock = function () { if (OC3.pdf) return { h: 0, draw() { } }; return _p.apply(this, arguments) } }
{ const _x = textBlock; textBlock = function (t, lines) { if (OC3.pdf && Array.isArray(lines) && lines.some(l => /^\* قیمت/.test(String(l)))) return { h: 0, draw() { } }; return _x.apply(this, arguments) } }
async function oc3Pdf() {
  const v = OC2.v, c = ocCl(v.pat.clinic), pl = v.plan; if (!pl) return; const r = blankForm(); r.s = secFrom(pl.s); r.brand = 'ko'; r.h = Object.assign(r.h, { name: v.pat.name, date: jalali(new Date()).slash, doc: '' });
  const keep = SET.clinic; OC3.pdf = true; SET.clinic = c.name; try { const o = await buildPDF(r, { title: 'طرح درمان ایمپلنت', quote: true, dateLine: 'تاریخ: ' + jalali(new Date()).slash }); openForPrint(o.blob) } catch (e) { alertMsg(e.message) } finally { SET.clinic = keep; OC3.pdf = false }
}
/* ===== events ===== */
document.addEventListener('click', async e => {
  const t = e.target.closest && e.target.closest('[data-oc3tab],[data-oc3new],[data-oc3ed],#oc3Back,#oc3Back2,#oc3Save,#oc3PlanSave,#oc3PlanPdf,[data-oc3q]'); if (!t || !$('viewOc') || $('viewOc').hidden) return;
  const d = t.dataset, dirtyF = () => OC3.f && (oc3Lines(OC3.mode).length || Object.keys(secDoc(OC3.f.s)).some(k => (OC3.f.s[k] && Object.values(OC3.f.s[k].sel).some(Boolean))));
  if (d.oc3tab) { e.stopImmediatePropagation(); if (OC3.f && OC3.mode !== 'plan' && dirtyF() && !(await uxConfirm('این جلسه ثبت نشده و پاک می‌شود. تب عوض شود؟', 'بله', true, 'جلسه‌ی ثبت‌نشده'))) return; oc3Unmount(); OC3.tab = d.oc3tab; ocRender(); return }
  if (d.oc3new) { oc3New(d.oc3new, null); return }
  if (d.oc3ed) { const s = OC2.v.ses.find(x => x.id === d.oc3ed); if (s) oc3New(s.kind || 'work', s); return }
  if (t.id === 'oc3Back' || t.id === 'oc3Back2') { if (dirtyF() && !(await uxConfirm('این جلسه ثبت نشده و پاک می‌شود. برگردید؟', 'بله، برگرد', true, 'جلسه‌ی ثبت‌نشده'))) return; const k = OC3.mode; oc3Unmount(); OC3.tab = k; ocRender(); return }
  if (d.oc3q && OC3.f) { const q = Math.max(0, Math.min(999, (OC3.f.q[d.oc3q] || 0) + Number(d.d))); OC3.f.q[d.oc3q] = q; oc3Read(); ocRender(); return }
  if (t.id === 'oc3PlanSave') { const m = $('oc2Msg'); oc3Read(); t.disabled = true; try { const r = await api('oc', { op: 'plan3', x: { clinic: OC2.v.pat.clinic, pat: OC2.v.pat.id, s: secDoc(OC3.f.s), note: ($('oc3note') || {}).value || '' } }); toast('طرح درمان ذخیره شد' + (r.n ? ' (' + fa(r.n) + ' بخش)' : ' (خالی)') + '.'); try { dirty = false } catch (x) { } const j = await api('oc', { op: 'pat', id: OC2.v.pat.id }); OC2.v = j; oc3Unmount(); ocRender() } catch (err) { m.className = 'msg err'; m.textContent = err.message; t.disabled = false } return }
  if (t.id === 'oc3PlanPdf') { t.disabled = true; try { await oc3Pdf() } finally { t.disabled = false } return }
  if (t.id === 'oc3Save') { const m = $('oc2Msg'); oc3Read(); const f = OC3.f, items = oc3Lines(OC3.mode); if (!items.length) { m.className = 'msg err'; m.textContent = 'دست‌کم یک کار علامت بزنید.'; return } if (!f.sid) f.sid = ocNewId('s'); t.disabled = true; m.className = 'msg'; m.textContent = 'در حال ثبت…';
    try { const r = await api('oc', { op: 'ses3', s: { id: f.id || f.sid, clinic: OC2.v.pat.clinic, pat: OC2.v.pat.id, day: f.day, kind: OC3.mode, s: secDoc(f.s), items: items.map(i => ({ k: i.k, q: i.q, p: i.p })), last: f.last, note: f.note } }); toast('جلسه‌ی ' + fa(r.n) + ' ثبت شد — ' + ocR(r.amount) + (r.zero && r.zero.length ? ' (تعرفه‌ی ' + r.zero.join('، ') + ' صفر است)' : '')); const k = OC3.mode; oc3Unmount(); OC3.tab = k; OC.d = null; await ocLoad(); await oc2Open(OC2.pat.id) }
    catch (err) { m.className = 'msg err'; m.textContent = err.message; t.disabled = false } return }
}, true);
document.addEventListener('input', e => { const i = e.target; if (!i || !OC3.f) return; if (i.dataset && i.dataset.oc3p !== undefined) { const v = toEn(i.value).replace(/[^\d]/g, ''); i.value = v ? fmtInput(v) : ''; OC3.pr[i.dataset.oc3p] = Number(v) || 0; oc3Paint(); return } if (['oc3day', 'oc3note', 'oc3last'].includes(i.id)) oc3Read() }, true);
/* leaving the «سایر کلینیک‌ها» view or the patient page restores the plan-form globals */
{ const _r = ocRender; ocRender = function () { if (OC3.f && (!OC2.pat || OC.seg !== 'tr')) oc3Unmount(); return _r.apply(this, arguments) } }
/* ===== tariff editor: each service gets a «بخش» (the plan section it is marked on); the per-group implant rows are gone ===== */
const OC3_SECL = () => [['', 'شمارشی (بدون نمودار)']].concat(oc3Secs().map(id => [id, (SEC[id] || {}).t || id]));
function oc3SecSel() { document.querySelectorAll('.oc-clc').forEach(card => { const id = card.dataset.ocid, e = OC.edit[id]; if (!e) return; card.querySelectorAll('[data-ocsv][data-f="n"]').forEach(i => { const s = e.svc[+i.dataset.ocsv]; if (!s) return; if (s.sec === undefined) { const o = (ocCl(id).svc || []).find(v => v.k === s.k); s.sec = o ? o.sec || '' : '' } const row = i.closest('.oc-row'); if (!row || row.querySelector('[data-f="sec"]')) return; if (s.k === 'imp') { s.sec = 'imp'; i.readOnly = true; i.title = 'ردیف ثابت — فقط تعرفه را عوض کنید'; const del = row.querySelector('[data-ocsvdel]'); if (del) del.remove(); row.dataset.fixed = '1'; return } if (/^ps_/.test(s.k)) return; const sel = document.createElement('select'); sel.dataset.ocsv = i.dataset.ocsv; sel.dataset.f = 'sec'; sel.className = 'oc3-sec'; sel.setAttribute('aria-label', 'بخش ' + s.n); sel.innerHTML = OC3_SECL().map(([k, l]) => `<option value="${k}"${(s.sec || '') === k ? ' selected' : ''}>${esc(l)}</option>`).join(''); i.after(sel) }) }) }
{ const _r = ocRender; ocRender = function () { const r = _r.apply(this, arguments); try { if (OC.seg === 'cl') oc3SecSel() } catch (e) { } return r } }
document.addEventListener('change', e => { const s = e.target; if (s && s.dataset && s.dataset.f === 'sec' && s.dataset.ocsv !== undefined) { const card = s.closest('.oc-clc'), ed = card && OC.edit[card.dataset.ocid]; if (ed && ed.svc[+s.dataset.ocsv]) ed.svc[+s.dataset.ocsv].sec = s.value } }, true);
