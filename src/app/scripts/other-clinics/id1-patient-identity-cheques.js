/* ---------- id1: patient identity + cheques (owner, 2026-11-05)
   reception: mobile required unless «موبایل ندارد»; a same-name / same-mobile patient asks «همان بیمار قبلی؟» before a new file;
   other clinics: optional phone, same name asks same / new; cheques: number + bank required (consultant sheet, file payment, instalments, settlement) ---------- */
const ID1_PH = /^09\d{9}$/;
function id1Hit() { try { const ph = toEn($('rc_phone').value).replace(/\D/g, ''), nm = $('rc_name').value.trim(), nid = toEn($('rc_nid').value).replace(/\D/g, ''); if (!nid && ph.length < 10 && nm.length < 4) return null;
  const all = [...ARCHIVE.map(d => ({ id: d.id, name: d.name, nid: d.nid, phone: d.phone, jalali: d.jalali })), ...QITEMS.filter(x => !ARCHIVE.some(a => a.id === x.id)).map(x => ({ id: x.id, name: x.name, nid: x.nid, phone: x.phone }))];
  return all.find(x => (nid && toEn(x.nid || '') === nid) || (ph.length >= 10 && toEn(x.phone || '').replace(/\D/g, '').endsWith(ph.slice(-10))) || (nm.length >= 4 && String(x.name || '').trim() === nm)) || null } catch (e) { return null } }
/* rcSend: the mobile number / duplicate national id checks are merged into surgery/roles-live-queue-reception.js */
/* ===== cheques: a number for every cheque ===== */
/* consultant / reception collection sheet: one number per cheque row */
/* (pcRender: the cheque-number column — merged into finance/fin2.js) */
document.addEventListener('input', e => { const t = e.target; if (t && t.dataset && t.dataset.pcno !== undefined && PC) { PC.nos = PC.nos || {}; PC.nos[t.dataset.pcno] = toEn(t.value).trim() } }, true);
window.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#pcSave'); if (!t || !PC || PC.dep) return; const R = pcRows(); if (!R.length) return; { const sel = $('pc_bank'); if (sel && sel.value) PC.bank = sel.value } const miss = R.map((x, i) => (PC.nos || {})[i] ? '' : String(i + 1)).filter(Boolean); const m = $('pcMsg');
  if (miss.length) { e.stopImmediatePropagation(); e.preventDefault(); m.className = 'msg err'; m.textContent = 'شماره‌ی چک ' + miss.map(fa).join('، ') + ' را بنویسید.'; const i = document.querySelector(`[data-pcno="${miss[0] - 1}"]`); if (i) i.focus(); return }
  if (!PC.bank) { e.stopImmediatePropagation(); e.preventDefault(); m.className = 'msg err'; m.textContent = 'بانک چک‌ها را انتخاب کنید.' } }, true);
{ const _a = api; api = function (action, payload) { try { if (action === 'payAdd' && payload && payload.pay && payload.pay.kind === 'chq' && PC && /^cq-/.test(String(payload.pid || ''))) { const i = (String(payload.pid).match(/[sp](\d+)$/) || [])[1]; if (i !== undefined && (PC.nos || {})[i]) payload.pay.no = PC.nos[i] } } catch (e) { } return _a.apply(this, arguments) } }
/* file › one payment: number and bank before sending */
window.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#pyAdd'); if (!t || !PYF || PYF.kind !== 'chq') return; try { pyRead() } catch (x) { } const m = $('pyMsg') || $('pfMsg'); if (!String(PYF.no || '').trim() || !String(PYF.bank || '').trim()) { e.stopImmediatePropagation(); e.preventDefault(); if (m) { m.className = 'msg err'; m.textContent = 'شماره‌ی چک و بانک را بنویسید.' } const i = $(!String(PYF.no || '').trim() ? 'py_no' : 'py_bank'); if (i) i.focus() } }, true);
/* instalment calculator: a number per cheque */
/* (icPrev / icGo cheque numbers: merged into finance/patient-file-extra-tabs.js) */
document.addEventListener('input', e => { const t = e.target; if (t && t.dataset && t.dataset.icno !== undefined) { IC.nos = IC.nos || {}; IC.nos[t.dataset.icno] = toEn(t.value).trim() } }, true);
/* settlement by cheques: number per cheque, bank required (stChq / stPays: merged into finance/pros2-surgery-difference-settlement-consultant.js) */
document.addEventListener('input', e => { const t = e.target; if (t && t.dataset && t.dataset.stno !== undefined && ST) { ST.nos = ST.nos || {}; ST.nos[t.dataset.stno] = toEn(t.value).trim() } }, true);
