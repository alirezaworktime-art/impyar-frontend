
/* ---------- m33 (owner, 2026-11-16): (1) paper files: clearer «بیمار مشابه» question (who was found, file no., last digits of mobile, what matched);
   (2) manager archive: «حذف کامل پرونده» (30-day trash, «پرونده‌های حذف‌شده» with «بازگردانی»). ---------- */

let M33T = null;
const m33Day = s => { try { return jDay(String(s || '').slice(0, 10)) } catch (e) { return '' } };
{ const _r = renderFile; renderFile = function () { const r = _r.apply(this, arguments);
  try { if (ROLE === 'manager' && PF && PF.id && !(PF.sess)) { const A = $('pfActs'); if (A && !A.querySelector('[data-m33del]')) { const c = A.querySelector('#pfClose'); const b = document.createElement('button'); b.type = 'button'; b.className = 'btn sm ghost danger'; b.dataset.m33del = PF.id; b.textContent = 'حذف کامل پرونده'; A.insertBefore(b, c || null) } } } catch (e) {}
  return r } }
async function m33Del(id, btn) {
  if (btn) btn.disabled = true;
  try { const j = await api('m1Rep', { op: 'ptInfo', id }); const I = j.info || {};
    const y = await uxAsk({ title: 'حذف کامل پرونده', danger: true, ok: 'حذف کامل', cancel: 'انصراف',
      msg: `پرونده‌ی «${j.name || ''}»${j.file ? ' (پرونده ' + faD(j.file) + ')' : ''} با همه‌ی اطلاعاتش از همه‌ی کارتابل‌ها برداشته می‌شود${(I.txt || []).length ? ' (' + I.txt.map(t => faD(t)).join('، ') + ')' : ''}${I.pays ? '؛ جمع پرداخت‌ها ' + fa(I.pays) + ' تومان از گزارش‌های مالی هم کم می‌شود' : ''}. تا ${fa(30)} روز در «پرونده‌های حذف‌شده» می‌ماند و می‌شود برگرداند.` });
    if (!y) return;
    const r = await api('m1Rep', { op: 'ptDel', id, by: fxBy() });
    toast('پرونده‌ی «' + (r.name || '') + '» حذف شد. برای برگرداندن: بایگانی ← پرونده‌های حذف‌شده.');
    try { $('pfSheet').hidden = true; PF = null } catch (e) {}
    try { ARCHIVE = ARCHIVE.filter(d => d.id !== id); renderList() } catch (e) {}
    try { loadList() } catch (e) {} try { pollQ(true) } catch (e) {} m33Bar(true) }
  catch (e) { toast(e.message || 'حذف انجام نشد.', true) } finally { if (btn && btn.isConnected) btn.disabled = false } }
async function m33Bar(force) { if (ROLE !== 'manager') return; const bar = $('fxArcBar'); if (!bar) return;
  try { if (force || !M33T) { const j = await api('m1Rep', { op: 'ptTrash' }); M33T = j.items || [] } } catch (e) { return }
  let el = $('m33Bar'); if (!el) { el = document.createElement('div'); el.id = 'm33Bar'; el.className = 'm33bar'; bar.insertAdjacentElement('afterend', el) }
  el.hidden = !M33T.length; el.innerHTML = M33T.length ? `<button type="button" class="btn sm ghost" data-m33trash="1">پرونده‌های حذف‌شده (${fa(M33T.length)})</button>` : '' }
function m33Trash() { const L = M33T || [];
  const s = mkSheet('m33Sh', `<h3>پرونده‌های حذف‌شده</h3><p class="note">هر پرونده ${fa(30)} روز بعد از حذف برای همیشه پاک می‌شود.</p>
    <div class="m33list">${L.length ? L.map(x => `<div class="m33row"><div><b>${esc(x.name || 'بی‌نام')}</b>${x.file ? ' · پرونده ' + esc(faD(x.file)) : ''}<small>حذف ${esc(m33Day(x.at))} · ${esc(x.by || '')}${(x.info && x.info.txt || []).length ? ' · ' + esc(x.info.txt.map(t => faD(t)).join('، ')) : ''}</small></div><button type="button" class="btn sm" data-m33rest="${esc(x.id)}">بازگردانی</button></div>`).join('') : '<p class="empty">پرونده‌ی حذف‌شده‌ای نیست.</p>'}</div>
    <div class="msg" id="m33Msg"></div><div class="btns"><button type="button" class="btn ghost" data-m33x="1">بستن</button></div>`);
  s.hidden = false }
async function m33Rest(tid, btn) { const x = (M33T || []).find(r => r.id === tid); if (!x) return;
  const y = await uxAsk({ title: 'بازگردانی پرونده', ok: 'بازگردانی', cancel: 'انصراف', msg: `پرونده‌ی «${x.name || ''}» با همه‌ی اطلاعاتش به بایگانی و کارتابل‌ها برمی‌گردد${x.info && x.info.stock ? ' و ' + fa(x.info.stock) + ' فیکسچر دوباره از انبار کم می‌شود' : ''}.` });
  if (!y) return; if (btn) btn.disabled = true; const m = $('m33Msg');
  try { const r = await api('m1Rep', { op: 'ptRest', tid, by: fxBy() }); toast('پرونده‌ی «' + (r.name || '') + '» برگردانده شد.');
    await m33Bar(true); m33Trash(); try { loadList() } catch (e) {} try { pollQ(true) } catch (e) {} }
  catch (e) { if (m) { m.className = 'msg err'; m.textContent = e.message } } finally { if (btn && btn.isConnected) btn.disabled = false } }
document.addEventListener('click', e => { const t = e.target && e.target.closest && e.target.closest('[data-m33del],[data-m33trash],[data-m33rest],[data-m33x]'); if (!t) return; e.preventDefault(); e.stopPropagation(); const d = t.dataset;
  if (d.m33del) m33Del(d.m33del, t); else if (d.m33trash) m33Bar(true).then(m33Trash); else if (d.m33rest) m33Rest(d.m33rest, t); else if (d.m33x) { const s = $('m33Sh'); if (s) s.hidden = true } }, true);
{ const _l = renderList; renderList = function () { const r = _l.apply(this, arguments); try { if (ROLE === 'manager') m33Bar(false) } catch (e) {} return r } }
