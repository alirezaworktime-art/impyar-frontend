/* ---------- m4: leaving with unsaved patient data asks «اطلاعات موقت پاک شود یا ذخیره شود؟» (ذخیره / پاک شود / برگشت) — plan form, paper file, surgery day, reception and the patient file (prosthesis session, lab order); a closed tab or a power cut keeps a draft on the device and the next opening offers it back ---------- */
var M4 = { by: false, busy: false };
const m4Vis = id => { const e = $(id); return !!e && !e.hidden };
function m4Sheets() { return ['rcSheet', 'pfSheet'].map(id => $(id)).filter(sh => sh && !sh.hidden && m4ShDirty(sh)) }
const M4T = new WeakSet();
document.addEventListener('input', e => { if (!e.isTrusted) return; const sh = e.target && e.target.closest && e.target.closest('#rcSheet,#pfSheet'); if (sh) M4T.add(sh) }, true);
document.addEventListener('change', e => { if (!e.isTrusted) return; const sh = e.target && e.target.closest && e.target.closest('#rcSheet,#pfSheet'); if (sh) M4T.add(sh) }, true);
function m4ShDirty(sh) { try { if (!M4T.has(sh)) return false; const s = BD.snap.get(sh); if (!s) return false; const now = bdVals(sh); for (const k in now) if (now[k] !== (s.vals[k] ?? '') && String(now[k]).trim() !== '') return true; return sh.id === 'pfSheet' && typeof LO !== 'undefined' && !!LO && !!(LO.teeth || []).length } catch (e) { return false } }
/* what is unsaved on screen now: { who, keep (device draft or real save), save(), drop() } */
function m4Dirty() {
  try { if (typeof dirty !== 'undefined' && dirty && m4Vis('viewForm') && F) return { who: (F.h && F.h.name) || F.name || '', what: 'فرم طرح درمان', save: async () => { if (F.status === 'new') F.status = 'draft'; await saveRecord(F); dirty = false; return true }, drop: () => { try { if (F.id) ldDel(F.id) } catch (e) {} dirty = false } } } catch (e) {}
  try { if (A6 && A6.dirty && m4Vis('viewArc6')) return { who: A6.name || '', what: 'پرونده‌ی جا مانده', save: async () => { const b = $('a6Save'); await a6Save(b); for (let i = 0; i < 40; i++) { if (!A6 || !m4Vis('viewArc6')) return true; if ($('a6Msg') && /err/.test($('a6Msg').className) && $('a6Msg').textContent.trim()) return false; await new Promise(r => setTimeout(r, 200)) } return !A6 }, drop: () => { m4A6Del(A6); A6.dirty = false } } } catch (e) {}
  try { if (SURG && !SURG.arc && SURG.dirty && m4Vis('viewSurg')) return { who: SURG.name || '', what: 'روز جراحی', keep: 1, save: async () => { SURG.dirty = true; sgDraftSave(); SURG.dirty = false; toast('اطلاعات این جلسه روی همین دستگاه نگه داشته شد و با باز کردن دوباره‌ی بیمار برمی‌گردد.'); return true }, drop: () => { try { localStorage.removeItem(SGDK(SURG.id)) } catch (e) {} SURG.dirty = false } } } catch (e) {}
  return null }
function m4Ask(d) { return new Promise(res => { let s = $('m4Sh'); if (!s) { s = document.createElement('div'); s.className = 'sheet'; s.id = 'm4Sh'; document.body.appendChild(s) }
  s.innerHTML = `<div class="in m4in" role="dialog" aria-modal="true" aria-labelledby="m4T"><h3 id="m4T">اطلاعات موقت پاک شود یا ذخیره شود؟</h3><p class="note">${esc(d.what || '')}${d.who ? ' — ' + esc(d.who) : ''}: تغییرهای این صفحه هنوز ذخیره نشده است.${d.keep ? ' «ذخیره» آن را روی همین دستگاه نگه می‌دارد تا با باز کردن دوباره برگردد.' : ''}</p><div class="msg" id="m4Msg" role="alert"></div>
    <div class="btns"><button type="button" class="btn" data-m4a="save">ذخیره</button><button type="button" class="btn ghost danger" data-m4a="drop">پاک شود</button><button type="button" class="btn ghost" data-m4a="back">برگشت</button></div></div>`;
  s.hidden = false; const done = v => { s.hidden = true; s.onclick = null; res(v) };
  s.onclick = async e => { const b = e.target.closest && e.target.closest('[data-m4a]'); if (e.target === s) { done('back'); return } if (!b) return; e.stopPropagation(); const a = b.dataset.m4a; if (a !== 'save') { done(a); return }
    b.disabled = true; const m = $('m4Msg'); m.className = 'msg'; m.textContent = 'در حال ذخیره…'; let ok = false; try { ok = await d.save() } catch (er) { m.className = 'msg err'; m.textContent = 'ذخیره نشد: ' + er.message; b.disabled = false; return }
    if (ok) done('save'); else { done('back'); toast('ذخیره نشد؛ پیام قرمز صفحه را ببینید و کامل کنید.', true) } };
  setTimeout(() => { const b = s.querySelector('[data-m4a="save"]'); if (b) b.focus() }, 50) }) }
/* navigation: tiles, top tabs, logout, «انصراف» of the paper file */
const m4Nav = t => t && (t.matches('#tiles .htile[data-tile]') && !t.matches('[data-tile="m1more"]') || /^tab[A-Z]/.test(t.id || '') || t.id === 'a6Cancel' || t.hasAttribute('data-gocal'));
window.addEventListener('click', async e => { if (M4.by) return; const t = e.target && e.target.closest && e.target.closest('button,a'); if (!m4Nav(t)) return;
  const d = m4Dirty(); if (!d) return; e.preventDefault(); e.stopImmediatePropagation(); if (M4.busy) return; M4.busy = true;
  try { const a = await m4Ask(d); if (a === 'back') return; if (a === 'drop') d.drop(); M4.by = true; try { t.click() } finally { M4.by = false } } finally { M4.busy = false } }, true);
/* patient-file / reception windows: closing with typed text asks the same question */
async function m4ShAsk(sh, go) { if (M4.busy) return; M4.busy = true; try { const head = (sh.querySelector('h2,h3') || {}).textContent || '';
    const a = await m4Ask({ what: head.trim().slice(0, 60) || 'پنجره', who: '', keep: 1, save: async () => { bdSaveDraft(sh); m4BdPersist(); M4T.delete(sh); return true } });
    if (a === 'back') return; if (a === 'drop') { try { const S0 = BD.snap.get(sh); BD.drafts.delete(S0.head); bdFields(sh).forEach((el, i) => { const k = bdKey(el, i); if (!(k in S0.vals)) return; if (el.type === 'checkbox' || el.type === 'radio') el.checked = S0.vals[k] === '1'; else el.value = S0.vals[k]; el.dispatchEvent(new Event('input', { bubbles: true })) }) } catch (x) {} try { if (sh.id === 'pfSheet' && typeof PF !== 'undefined' && PF) BD.lo.delete(PF.id) } catch (x) {} M4T.delete(sh); m4BdPersist(); const L = m4Get('live'); try { delete L[BD.snap.get(sh).head] } catch (x) {} m4Put('live', L) }
    M4.by = true; try { go() } finally { M4.by = false } } finally { M4.busy = false } }
window.addEventListener('click', e => { if (M4.by) return; const t = e.target; if (!t || !t.closest) return;
  const sh = t.classList && t.classList.contains('sheet') ? t : null, btn = !sh && t.closest('button'), host = sh || (btn && btn.closest('.sheet'));
  if (!host || !['rcSheet', 'pfSheet'].includes(host.id) || host.hidden) return;
  if (btn) { const close = /(Close|Cancel)$/.test(btn.id || '') || /^(بستن|انصراف)$/.test((btn.textContent || '').trim()); if (!close) return }
  else if (BD.down !== sh) return;
  if (!m4ShDirty(host)) return; e.preventDefault(); e.stopImmediatePropagation();
  m4ShAsk(host, () => { if (btn) btn.click(); else { bdClose(host) } }) }, true);
/* the window drafts live on the device (3 hours): kept ones (BD.drafts) and the live text of an open window, so a closed tab keeps it too */
const M4BD = 'implantM4Bd:', m4K = w => M4BD + w + ':' + ROLE;
const m4Get = w => { try { return JSON.parse(localStorage.getItem(m4K(w)) || '{}') || {} } catch (e) { return {} } }, m4Put = (w, o) => { try { localStorage.setItem(m4K(w), JSON.stringify(o)) } catch (e) {} };
function m4BdPersist() { const o = {}; BD.drafts.forEach((v, k) => { if (Date.now() - v.at < 3 * 3600e3) o[k] = v }); m4Put('kept', o) }
function m4Live(sh) { try { const s = BD.snap.get(sh); if (!s) return; const L = m4Get('live'); if (!m4ShDirty(sh)) { if (L[s.head]) { delete L[s.head]; m4Put('live', L) } return }
  const now = bdVals(sh), v = {}; for (const k in now) if (now[k] !== (s.vals[k] ?? '') && String(now[k]).trim() !== '') v[k] = { from: s.vals[k] ?? '', to: now[k] }; L[s.head] = { v, at: Date.now() }; m4Put('live', L) } catch (e) {} }
setInterval(() => { try { if (ROLE) ['rcSheet', 'pfSheet'].forEach(id => { const sh = $(id); if (sh && !sh.hidden) m4Live(sh) }) } catch (e) {} }, 4000);
addEventListener('pagehide', () => { try { ['rcSheet', 'pfSheet'].forEach(id => { const sh = $(id); if (sh && !sh.hidden) m4Live(sh) }) } catch (e) {} });
/* opening a window: kept or live text of the last 3 hours comes back (the older step restores it) */
{ const _o = bdOpened; bdOpened = function (sh) { try { if (['rcSheet', 'pfSheet'].includes(sh.id)) { M4T.delete(sh); const head = bdHead(sh), K = m4Get('kept'), L = m4Get('live'), x = BD.drafts.get(head) || K[head] || L[head];
      if (x && Date.now() - x.at < 3 * 3600e3) { const cur = bdVals(sh); for (const k in x.v || {}) if (cur[k] === '' || cur[k] === undefined) x.v[k].from = cur[k] || ''; BD.drafts.set(head, x) } delete K[head]; delete L[head]; m4Put('kept', K); m4Put('live', L) } } catch (e) {} return _o.apply(this, arguments) } }
/* a window closed after its work was sent: no draft stays behind */
new MutationObserver(M => M.forEach(m => { const sh = m.target; if (!sh || !['rcSheet', 'pfSheet'].includes(sh.id) || !sh.hidden || m.oldValue !== null) return; try { const s = BD.snap.get(sh); if (!s) return; const L = m4Get('live'); if (L[s.head]) { delete L[s.head]; m4Put('live', L) } if (BD.drafts.has(s.head)) m4BdPersist() } catch (e) {} })).observe(document.body, { attributes: true, attributeFilter: ['hidden'], attributeOldValue: true, subtree: true });
/* paper file: device draft every few seconds; the next opening offers it back */
const M4A6 = 'implantM4A6:', m4A6Key = S => M4A6 + ROLE + ':' + ((S && S.id) || 'new');
function m4A6Del(S) { try { localStorage.removeItem(m4A6Key(S)) } catch (e) {} }
function m4A6Save() { try { if (!A6 || !A6.dirty || !m4Vis('viewArc6')) return; const o = {}; for (const k of Object.keys(A6)) { if (k === 'j' || k === 'back') continue; const v = A6[k]; o[k] = v instanceof Set ? { __set: [...v] } : v }
    localStorage.setItem(m4A6Key(A6), JSON.stringify({ at: Date.now(), when: jalali(new Date()).slash, s: o })) } catch (e) {} }
setInterval(m4A6Save, 3000); addEventListener('pagehide', m4A6Save); document.addEventListener('visibilitychange', m4A6Save);
{ const _s = a6Save; a6Save = async function () { const S = A6; const r = await _s.apply(this, arguments); try { if (S && (!A6 || A6 !== S || !m4Vis('viewArc6'))) m4A6Del(S) } catch (e) {} return r } }
/* a closed tab or reload: the browser's own warning when something is unsaved */
window.addEventListener('beforeunload', e => { try { m4A6Save(); if ((A6 && A6.dirty && m4Vis('viewArc6')) || (SURG && !SURG.arc && SURG.dirty && m4Vis('viewSurg')) || m4Sheets().length) { e.preventDefault(); e.returnValue = '' } } catch (x) {} });
