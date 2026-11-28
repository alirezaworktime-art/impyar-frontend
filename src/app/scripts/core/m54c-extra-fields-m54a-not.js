/* ---------- m54c (owner, 2026-11-18): the extra fields of m54a are not needed — taken away: the «مشخصات تکمیلی» card and sheet (patient file and
   reception form), the medical alerts (file and surgery day), cheque owner / warranty / satisfaction / complaint, and «ثبت تکمیلی جراحی».
   What stays from m54a: «بستن پرونده» (the card now shows only the closed banner and the close / open button), the result of follow-up calls,
   and the automatic tasks. ---------- */
/* (m54Card: this version replaced the m54a one in finance/m54a-second-audit.js) */
function m54Mounts() { try { ['m54Rc', 'm54SgW', 'm54SgSh', 'm54Sh'].forEach(id => { const n = $(id); if (n) n.remove() }); const b = $('m54SgB'); if (b) { const w = b.closest('.btns'); (w || b).remove() } M54.pend = null; M54.sx = null } catch (e) { } }
m54Mounts();
