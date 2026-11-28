/* ---------- m6: the Jalali calendar opens on every date field (report from/to, accounting, inventory, lab, manager reports, …) + «پاک کردن» in the calendar ---------- */
const M6_ID = new Set(['ae_day','ap_from','ap_to','ar_from','ar_to','by_day','fi_day','fxa_due','gs_lockDay','h_date','i2Day','i2From','i2To','i9From','i9To','ic_first','ivDay','l2rf','l2rt','l5lf','l5lt','l5rf','l5rt','l5to','l6flf','l6flt','l6ft','l6mf','l6mt','l8eFrom','l8eTo','lo_due','m1From','m1To','mrFrom','mrTo','mv_day','p2_until','pr_day','py_day','vf_day','xf_day']);
const m6LblTxt = el => { const L = el.closest && el.closest('label'); if (!L) return ''; let t = ''; L.childNodes.forEach(n => { if (n.nodeType === 3) t += n.textContent }); return t.replace(/\s+/g, ' ').trim() };
function m6IsDate(el) {
  if (!el || el.tagName !== 'INPUT' || el.disabled || el.dataset.jd !== undefined || el.dataset.nojd !== undefined) return false;
  const ty = (el.getAttribute('type') || 'text').toLowerCase(); if (!['text', 'search', 'tel', ''].includes(ty)) return false;
  if (M6_ID.has(el.id) || el.dataset.pf === 'from' || el.dataset.pf === 'to') return true;
  const t = m6LblTxt(el); return /تاریخ|سررسید/.test(t) || /^(از|تا)\s*\*?$/.test(t);
}
const m6Mark = e => { const t = e.target; if (m6IsDate(t)) t.dataset.jd = '1' };
window.addEventListener('pointerdown', m6Mark, true);
window.addEventListener('focusin', m6Mark, true);
window.addEventListener('mousedown', m6Mark, true);
/* «پاک کردن» next to «امروز» */
window.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('.fx2dp button[data-dpc]'); if (!b || !FX2DP) return; e.preventDefault(); e.stopImmediatePropagation(); const i = FX2DP.inp; i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); fx2DpClose() }, true);
