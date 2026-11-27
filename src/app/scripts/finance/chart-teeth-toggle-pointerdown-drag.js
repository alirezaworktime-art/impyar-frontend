/* ---------- m10: full-flow check fixes (owner, 2026-11-11) — (1) surgery «قلم پزشک»: tapping a tooth already chosen (e.g. from the plan) with another doctor's pen now gives it to that doctor instead of dropping it · (2) cheques printed from «تعیین تکلیف مالی» carry the chosen «در وجه» · (3) first cheque date defaults to one month from today; the lab work-order sheet takes the file number · (4) «تعیین تکلیف مالی پروتز» on try-in / delivery appointment cards · (5) «پزشک این جلسه» in every prosthesis session (share goes to him/her; default = last pick) · (6) prosthesis sections («فقط روکش»، «روکش موقت») are not pre-ticked on the surgery day ---------- */
/* 1 — chart teeth toggle on pointerdown (drag-select), so the pen works there too */
let M10SW = null;
const m10Pt = e => { const t = e.target.closest && e.target.closest('#surgSecs .chart .t[data-sid]'); if (!t || t.disabled) return null; const id = t.dataset.sid, k = t.dataset.k; return (id && k && m9On(id)) ? { t, id, k } : null };
window.addEventListener('pointerdown', e => { try { if (!SURG || e.button > 0) return; const o = m10Pt(e); if (!o) return; const pen = m9Pen(); if (!pen) return;
  if (m9Sel(o.id, o.k) && m9Who(o.id, o.k) !== pen) { e.preventDefault(); e.stopImmediatePropagation(); M10SW = { t: o.t, at: Date.now() }; m9Set(o.id, o.k, pen); SURG.dirty = true; reSec(o.id) } } catch (x) { } }, true);
['pointerup', 'pointercancel'].forEach(ev => window.addEventListener(ev, () => { try { if (!SURG || typeof DRAG === 'undefined' || !DRAG || !m9On(DRAG.sid)) return; const id = DRAG.sid, P = (DRAG.path || []).slice(), pen = m9Pen(); if (!pen || !P.length) return;
  setTimeout(() => { try { P.forEach(k => m9Set(id, k, m9Sel(id, k) ? pen : '')); reSec(id) } catch (x) { } }, 0) } catch (x) { } }, true));
window.addEventListener('click', e => { try { if (!SURG) return; const t = e.target.closest && e.target.closest('button'); if (!t) return;
  if (M10SW && Date.now() - M10SW.at < 900 && (t === M10SW.t || (t.dataset.sid && t.dataset.sid === M10SW.t.dataset.sid && t.dataset.k === M10SW.t.dataset.k))) { e.preventDefault(); e.stopImmediatePropagation(); M10SW = null; return }
  if (t.dataset.m9pen !== undefined || t.disabled || !t.closest('#surgSecs')) return;
  const id = t.dataset.sid || t.dataset.isid, k = t.dataset.k || t.dataset.ik; if (!id || !k || !m9On(id)) return; const pen = m9Pen(); if (!pen) return;
  if (t.dataset.isid && m9Sel(id, k) && m9Who(id, k) !== pen) { e.preventDefault(); e.stopImmediatePropagation(); m9Set(id, k, pen); SURG.dirty = true; reSec(id) } } catch (x) { } }, true);
/* 2 — m10Payee is read by chqDoc (m8) */
function m10Payee() { if (!PC || !PC.payee) return ''; if (PC.payee !== '*') return PC.payee; const i = document.querySelector('#pcSheet input.q10other'); return i ? i.value.trim() : '' }
/* 3 */
let M10PP = 0;
{ const _o = openPostConfirm; openPostConfirm = function () { const r = _o.apply(this, arguments); try { if (PC && !PC.first && PC.chq && PC.chq.length) { PC.first = jDay(jAddM(tDay(), 1)); const i = $('pc_first'); if (i) i.value = PC.first; pcRender() }
  if (PC && Date.now() - M10PP < 4000) { M10PP = 0; setTimeout(() => { const b = document.querySelector('#pcSheet [data-pl11pt="p"]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click() }, 60) } } catch (e) { } return r } }
{ const _i = h9Init; h9Init = function (j) { const fresh = !(LO && LO.h9); const r = _i.apply(this, arguments); try { if (fresh && r && !r.file && PF) { const h = (fromDoc(PF.id, (j && j.data) || {}).h) || {}; r.file = String(h.file || h.pfile || '') } } catch (e) { } return r } }
/* 4 */
window.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-m10pp]')) M10PP = Date.now() }, true);
{ const _a = apptCard; apptCard = function (a) { let h = _a.apply(this, arguments); try { if (a && a.owe > 0 && a.oweP && ROLE === 'staff' && a.plan && (a.st || 'set') === 'set' && ['tryin', 'rscr', 'rabt', 'deliv'].includes(a.kind) && h.indexOf('data-p4rest') < 0)
  h = h.replace('<div class="acts">', `<div class="acts"><button class="btn sm main" type="button" data-p4rest="${esc(a.plan)}" data-m10pp="1">تعیین تکلیف مالی پروتز (${fa(a.owe)} مانده)</button>`) } catch (e) { } return h } }
/* 5 */
let M10D = '';
const m10Docs = () => f7cDocs();
function m10DocPick() { const L = m10Docs(); if (M10D && L.includes(M10D)) return M10D; let v = ''; try { v = localStorage.getItem('implantM10PDoc') || '' } catch (e) { } M10D = L.includes(v) ? v : (L.includes(PROSDOC()) ? PROSDOC() : (L[0] || '')); return M10D }
function m10DocBar() { const sh = $('pfSheet'); if (!sh || sh.hidden) return; const w = sh.querySelector('[data-l5w]'); if (!w || sh.querySelector('#m10Doc')) return; const box = w.closest('.chips') || w.parentElement; const cur = m10DocPick();
  box.insertAdjacentHTML('afterend', `<div class="m10doc" id="m10Doc"><span>پزشک این جلسه (سهم پزشک به نام او ثبت می‌شود)</span><div class="chips">${m10Docs().map(n => `<button type="button" class="chip" data-m10doc="${esc(n)}" aria-pressed="${n === cur}">${esc(n)}</button>`).join('')}</div></div>`) }
try { new MutationObserver(() => { try { m10DocBar() } catch (e) { } }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] }) } catch (e) { }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-m10doc]'); if (!t) return; e.preventDefault(); e.stopImmediatePropagation(); M10D = t.dataset.m10doc; try { localStorage.setItem('implantM10PDoc', M10D) } catch (x) { } document.querySelectorAll('[data-m10doc]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m10doc === M10D))) }, true);
{ const _api = api; api = function (act, body) { try { if (act === 'prosSess' && body && $('m10Doc')) { const d = m10DocPick(); if (d) body.by = d } } catch (e) { } return _api.apply(this, arguments) } }
/* 6 */
{ const _s = openSurg; openSurg = function () { const r = _s.apply(this, arguments); try { if (SURG && !SURG.arc) { let ch = 0; SECTIONS.filter(x => x.pros).forEach(x => { const s = SURG.s && SURG.s[x.id]; if (!s) return;
  ['sel', 'isel'].forEach(f => { if (s[f] && typeof s[f] === 'object') Object.keys(s[f]).forEach(k => { if (s[f][k]) { s[f][k] = false; ch = 1 } }) }); if (s.jc) { if (s.jc.U || s.jc.L) ch = 1; s.jc = { U: '', L: '' } } if (s.cnt) { s.cnt = ''; ch = 1 }
  if (SURG.need) delete SURG.need[x.id]; if (SURG.openSecs) SURG.openSecs.delete(x.id) }); if (ch) renderSurg() } } catch (e) { } return r } }
