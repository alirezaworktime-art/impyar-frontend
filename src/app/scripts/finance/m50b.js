/* ---------- m50b (owner, 2026-11-18):
   (1) reception «تعیین تکلیف مالی»: the patient may change the way of payment there — «نقدی کامل با ۵٪ تخفیف» or back to «طبق طرح مشاور».
       The plan total, the two parts and the terms are stored again (server action m50PayMode); the consultant's terms are kept (pay.m50o) so that they can come back;
   (2) surgery day: «پزشک کلینیک» is in the list of assistant doctors (page anchor in ASSTS); the server already counts it without a doctor share;
   (3) plan form: «ارجاع به پزشک دیگر» with the name of the doctor typed (h.rdoc, h.rdocN) in the card of m48a; banner in the form and in the patient file;
       reception gets the same kind of task as for the general-dentist visit (server). ---------- */
const M50_K = ['cs', 'cp', 'cash', 'n1', 'n3', 'disc', 'opt', 'mode'];
const m50Cash = r => { const p = Object.assign({}, r.pay || {}); p.cs = '100'; p.cp = '100'; p.cash = ''; p.n1 = ''; p.n3 = ''; p.mode = 'cash'; if (!(num(p.disc) > 0)) p.disc = String(DISC_DEF); if (String(p.opt) === '3') p.opt = '2'; return p };
const m50Clone = (r, pay) => Object.assign({}, r, { pay });
const m50Nums = r => { const T = totals(PV(r, 1)), b = effBrand(r); return { total: planTotal(r), S: T.surg[b] || 0, P: T.pros || 0 } };
function m50PmMount(snap) { if (ROLE !== 'staff' || !PC || !snap || !snap.pay) return; const sh = $('pcSheet'); if (!sh || $('m50Pm')) return; const h3 = sh.querySelector('h3'); if (!h3) return;
  PC.m50r = snap; const cashOn = !!snap.pay.m50o, own = !cashOn && (() => { try { return discOn(snap) } catch (e) { return false } })();
  let note = ''; try { if (cashOn) note = `نقدی کامل با ${fa(discPct(snap))}٪ تخفیف — جمع طرح ${fa(planTotal(snap))} تومان.`; else if (own) note = 'طرح مشاور خودش ۱۰۰٪ نقد با تخفیف است.'; else { const n = m50Nums(m50Clone(snap, m50Cash(snap))); note = `اگر بیمار همه را نقد بدهد: ${fa(n.total)} تومان به‌جای ${fa(planTotal(snap))} تومان.` } } catch (e) { }
  h3.insertAdjacentHTML('afterend', `<div class="m50pm" id="m50Pm"><span>روش پرداخت بیمار</span><div class="chips"><button type="button" class="chip" data-m50pm="plan" aria-pressed="${!cashOn}">طبق طرح مشاور</button><button type="button" class="chip" data-m50pm="cash" aria-pressed="${cashOn}"${own ? ' disabled' : ''}>نقدی کامل با ۵٪ تخفیف</button></div><small id="m50PmN">${esc(note)}</small></div>`) }
{ const _o = openPostConfirm; openPostConfirm = function (snap) { const r = _o.apply(this, arguments); try { m50PmMount(snap) } catch (e) { console.error('m50b', e) } return r } }
window.addEventListener('click', async e => { const t = e.target.closest && e.target.closest('[data-m50pm]'); if (!t || !PC || !PC.m50r) return; e.preventDefault(); e.stopImmediatePropagation(); if (t.disabled) return;
  const r = PC.m50r, id = PC.id, mode = t.dataset.m50pm, cashOn = !!r.pay.m50o; if ((mode === 'cash') === cashOn) return;
  let r2; if (mode === 'cash') r2 = m50Clone(r, m50Cash(r)); else { const p = Object.assign({}, r.pay), k0 = r.pay.m50o || {}; M50_K.forEach(k => { if (k0[k] !== undefined) p[k] = k0[k]; else delete p[k] }); delete p.m50o; r2 = m50Clone(r, p) }
  const n = m50Nums(r2), old = planTotal(r);
  const y = await uxAsk({ title: mode === 'cash' ? 'نقدی کامل با تخفیف' : 'برگشت به شرایط طرح مشاور', msg: mode === 'cash' ? `جمع طرح از ${fa(old)} به ${fa(n.total)} تومان می‌شود (${fa(discPct(r2))}٪ تخفیف پرداخت نقدی) و چکی در کار نیست؛ بیمار باید همه را نقد بدهد.` : `تخفیف نقدی برداشته می‌شود و جمع طرح از ${fa(old)} به ${fa(n.total)} تومان برمی‌گردد؛ نقد و چک‌ها طبق شرایط مشاور.`, ok: 'ثبت', no: 'انصراف' });
  if (!y) return; t.disabled = true;
  try { await api('m50PayMode', { id, mode, total: n.total, parts: { S: n.S, P: n.P }, by: (($('rc_asst') || {}).value || ROLE_LBL[ROLE]) }); toast(mode === 'cash' ? 'روش پرداخت: نقدی کامل با تخفیف.' : 'روش پرداخت: طبق طرح مشاور.');
    try { delete PL10_GET[id] } catch (x) { } const j = await api('get', { id }); openPostConfirm(fromDoc(id, j.data || {})); if (PF && PF.id === id && !$('pfSheet').hidden) refreshFile(); pollQ(true) }
  catch (err) { const m = $('pcMsg'); if (m) { m.className = 'msg err'; m.textContent = err.message } else toast(err.message, 1); t.disabled = false } }, true);
/* (3) */
const M50_RT = 'ارجاع به پزشک دیگر';
/* m48GenMount: the «ارجاع به پزشک دیگر» part is in its single definition (consultant/m48a-page-only.js) */
document.addEventListener('change', e => { const t = e.target; if (!t || t.id !== 'm50RdC' || !F || !F.h || !m48GenCan()) return; if (t.checked) F.h.rdoc = 1; else { delete F.h.rdoc; delete F.h.rdocN } touch(); m48GenMount(); if (t.checked) setTimeout(() => { try { $('m50RdN').focus() } catch (x) { } }, 30) });
document.addEventListener('input', e => { const t = e.target; if (!t || t.id !== 'm50RdN' || !F || !F.h || !m48GenCan()) return; F.h.rdocN = t.value.slice(0, 80); touch(); const s = document.querySelector('#m50RdB .m50rn'); if (s) s.textContent = F.h.rdocN });
/* m48File: the «ارجاع به پزشک دیگر» banner is in its single definition (consultant/m48a-page-only.js) */
