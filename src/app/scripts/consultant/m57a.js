/* ---------- m57a (owner, 2026-11-20):
   (1) All on X may also be Korean: the consultant / reception brand chips and the surgery day no longer force Italian (price unchanged);
   (2) the PDF of a patient who wants to think («بیمار می‌خواهد فکر کند») tells them to text «<name> مایل به درمان <n> واحد ایمپلنت در یزد
       می‌باشم.» to the number the manager sets in settings (kv m57sms);
   (3) the consultant keeps up to 5 patients open in a bar above the form and moves between them; unsaved changes stay (the device draft of
       every patient is kept and comes back when the patient is opened again). ---------- */
/* (1) */
try { const i = M11_NB.indexOf('ko'); if (i >= 0) M11_NB.splice(i, 1) } catch (e) { }
const M57_AT = 'برای All on X فقط برند ایتالیایی یا کره‌ای';
const m57Tit = root => { try { (root || document).querySelectorAll('.m11off').forEach(b => { if (b.title) b.title = M57_AT }) } catch (e) { } };
/* m57Tit runs at the end of m11Brands (layer.js) and pl10BrandSheet (pl10) */
/* (2) */
const M57 = { think: false, sms: null, tabs: [] };
async function m57SmsNo(force) { if (M57.sms !== null && !force) return M57.sms; try { const j = await api('m57Sms', { op: 'get' }, { prio: 'bg', timeout: 10000 }); M57.sms = String(j.v || '') } catch (e) { if (M57.sms === null) M57.sms = '' } return M57.sms }
function m57Units(R) { try { return M11_UX.reduce((a, k) => a + (R && R.s && R.s[k] && SEC[k] ? qty(R.s[k], SEC[k]) : 0), 0) } catch (e) { return 0 } }
function m57Block(R, no) { const nm = String((R && R.h && R.h.name) || '').trim(), n = m57Units(R);
  const txt = `${nm} مایل به درمان ${n ? fa(n) + ' واحد ایمپلنت ' : ''}در یزد می‌باشم.`;
  return textBlock('برای شروع درمان', [no ? `هر وقت تصمیم به انجام درمان گرفتید، متن زیر را به شماره‌ی ${faD(no)} پیامک کنید:` : 'هر وقت تصمیم به انجام درمان گرفتید، متن زیر را برای کلینیک پیامک کنید:', '«' + txt + '»']) }
{ const _s = sendUndecided; sendUndecided = async function () { M57.think = !(UN && UN.mode === 'lost'); try { if (M57.think) await m57SmsNo(true) } catch (e) { } try { return await _s.apply(this, arguments) } finally { M57.think = false } } }
/* buildPDF: the SMS block (window.M57PB) is now part of the single definition in pdf/built-pdf-writer-a4-pages.js */
/* settings: the number (manager) */
function m57SetMount() { const p = $('set_phone'); if (!p || $('m57sms')) return; const l = p.closest('label'); (l || p).insertAdjacentHTML('afterend', '<label class="f">شماره‌ی پیامک برای اعلام آمادگی درمان (در PDF بیمارِ «می‌خواهد فکر کند»)<input id="m57sms" inputmode="numeric" class="ltr" placeholder="09xxxxxxxxx" maxlength="15"></label>') }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#tabSet'); if (!t) return; setTimeout(async () => { try { m57SetMount(); const i = $('m57sms'); if (!i) return; i.dataset.v = await m57SmsNo(true); i.value = i.dataset.v } catch (x) { } }, 50) });
/* (3) tabs of open patients (consultant) */
const M57_K = 'm57tabs:', M57_MAX = 5;
const m57Load = () => { try { const a = JSON.parse(sessionStorage.getItem(M57_K + ROLE) || '[]'); M57.tabs = Array.isArray(a) ? a.filter(x => x && x.id).slice(0, M57_MAX) : [] } catch (e) { M57.tabs = [] } };
const m57Keep = () => { try { sessionStorage.setItem(M57_K + ROLE, JSON.stringify(M57.tabs)) } catch (e) { } };
const m57Draft = id => { try { return !!localStorage.getItem(LD + id) } catch (e) { return false } };
function m57Bar() { let b = $('m57Bar'); const on = ROLE === 'consultant' && M57.tabs.length && (!$('viewForm').hidden || !$('viewQueue').hidden);
  if (!on) { if (b) b.hidden = true; return } if (!b) { const nav = $('nav'); if (!nav) return; nav.insertAdjacentHTML('afterend', '<div class="m57bar" id="m57Bar" role="tablist" aria-label="بیماران باز"></div>'); b = $('m57Bar') }
  const cur = !$('viewForm').hidden && F && F.id ? F.id : '';
  b.innerHTML = M57.tabs.map(t => `<span class="m57t${t.id === cur ? ' on' : ''}"><button type="button" role="tab" aria-selected="${t.id === cur}" data-m57o="${esc(t.id)}">${esc(t.name || 'بیمار')}${m57Draft(t.id) && t.id !== cur ? ' <i class="m57d" title="تغییرات ذخیره‌نشده">●</i>' : ''}</button><button type="button" class="m57x" data-m57c="${esc(t.id)}" aria-label="بستن ${esc(t.name || '')}">×</button></span>`).join('') + `<button type="button" class="m57q" data-m57q="1">${$('viewQueue').hidden ? '+ بیمار دیگر' : 'کارتابل'}</button>`;
  b.hidden = false }
function m57Add() { if (ROLE !== 'consultant' || !F || !F.id) return; m57Load(); const nm = String((F.h && F.h.name) || '').trim(), i = M57.tabs.findIndex(t => t.id === F.id);
  if (i >= 0) M57.tabs[i].name = nm || M57.tabs[i].name; else { M57.tabs.push({ id: F.id, name: nm }); if (M57.tabs.length > M57_MAX) { const j = M57.tabs.findIndex(t => t.id !== F.id); M57.tabs.splice(j, 1) } } m57Keep() }
function m57Drop(id) { m57Load(); M57.tabs = M57.tabs.filter(t => t.id !== id); m57Keep() }
{ const _o = openForm; openForm = function () { try { if (ROLE === 'consultant' && F && F.id && dirty) ldSave() } catch (e) { } const r = _o.apply(this, arguments); try { m57Add(); m57Bar() } catch (e) { } return r } }
/* leaveForm: closing the patient's tab is now part of the single definition in pdf/background-send-queue-doctor-never.js */
{ const _s = show; show = function (v) { try { if (ROLE === 'consultant' && v !== 'form' && F && F.id && dirty && !$('viewForm').hidden) ldSave() } catch (e) { } const r = _s.apply(this, arguments); try { m57Load(); m57Bar() } catch (e) { } return r } }
async function m57Open(id) { if (F && F.id === id && !$('viewForm').hidden) return; try { if (F && F.id && dirty) ldSave() } catch (e) { }
  const x = (typeof QITEMS !== 'undefined' ? QITEMS : []).find(v => v.id === id);
  if (x && ['consult', 'consulting'].includes(x.queue)) { const fake = { disabled: false, dataset: { qopen: id }, classList: { add() { }, remove() { } } }; await qOpen(fake); return }
  try { const j = await api('get', { id }); const sd = j.data || {}, nd = newestDoc(id, sd), r = fromDoc(id, nd || sd); ['status', 'jalali', 'emailStatus', 'pdfName', 'edits'].forEach(k => { if (j[k] !== undefined && j[k] !== '' && j[k] !== null) r[k] = j[k] });
    openForm(r); if (nd) { dirty = true; toast('آخرین تغییراتِ ذخیره‌نشده‌ی این بیمار روی این دستگاه بازیابی شد.') } } catch (e) { toast(e.message, 1) } }
document.addEventListener('click', async e => { const t = e.target.closest && e.target.closest('[data-m57o],[data-m57c],[data-m57q]'); if (!t) return; e.preventDefault(); e.stopImmediatePropagation();
  if (t.dataset.m57q) { show('queue'); return }
  if (t.dataset.m57c) { const id = t.dataset.m57c, open = !$('viewForm').hidden && F && F.id === id;
    if (m57Draft(id) || (open && dirty)) { const y = await uxConfirm('تغییرات ذخیره‌نشده‌ی این بیمار روی این دستگاه می‌ماند و با باز کردن دوباره‌اش برمی‌گردد. از نوار برداشته شود؟', 'بله', false, 'بستن'); if (!y) return }
    if (open && dirty) ldSave(); m57Drop(id); if (open) show('queue'); else m57Bar(); return }
  t.disabled = true; try { await m57Open(t.dataset.m57o) } finally { t.disabled = false; m57Bar() } }, true);
{ const _a = api; api = async function (action, payload) { const r = await _a.apply(this, arguments);
  try { if (action === 'settings' && ROLE === 'manager') { const i = $('m57sms'); if (i && i.value.trim() !== (i.dataset.v || '')) { const j = await _a('m57Sms', { op: 'set', v: i.value.trim() }); i.dataset.v = j.v || ''; i.value = j.v || ''; M57.sms = j.v || '' } } } catch (e) { toast('شماره‌ی پیامک ذخیره نشد: ' + e.message, 1) }
  return r } }
