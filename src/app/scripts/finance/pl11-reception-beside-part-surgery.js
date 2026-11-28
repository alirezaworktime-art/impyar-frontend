/* ---------- pl11: owner 2026-11-05 — reception «فقط ایمپلنت» / «فقط اوردنچر» beside «فقط پروتز»; «تعیین تکلیف مالی» by part (surgery / prosthesis / both) ---------- */
(function () { const p = $('rc_ponly'), lb = p && p.closest('label'); if (!lb || $('rc_ionly')) return;
  lb.insertAdjacentHTML('afterend', '<label class="chk full rcponly"><input type="checkbox" id="rc_ionly"> فقط ایمپلنت — پروتز در جای دیگر انجام می‌شود</label><label class="chk full rcponly"><input type="checkbox" id="rc_oonly"> فقط اوردنچر</label>') })();
const PL11_K = ['rc_ponly', 'rc_ionly', 'rc_oonly'];
document.addEventListener('change', e => { const t = e.target; if (!t || !PL11_K.includes(t.id) || !t.checked) return; PL11_K.forEach(id => { if (id !== t.id && $(id)) $(id).checked = false }) }, true);
{ const _a = api; api = function (action, payload) { try { if (['queueAdd', 'queueUpdate', 'queueReopen'].includes(action) && payload && payload.patient && $('rc_ionly') && ROLE === 'staff') { payload.patient.iOnly = $('rc_ionly').checked ? 1 : 0; payload.patient.oOnly = $('rc_oonly').checked ? 1 : 0 } } catch (e) { } return _a.apply(this, arguments) } }
/* rcEdit «فقط ایمپلنت» / «سایر»: merged into surgery/roles-live-queue-reception.js */
{ const _r = rcReset; rcReset = function () { const r = _r.apply(this, arguments); try { ['rc_ionly', 'rc_oonly'].forEach(id => { if ($(id)) $(id).checked = false }) } catch (e) { } return r } }
/* «فقط ایمپلنت»: no prosthesis part in the plan (crowns on implants, crowns, All on X / overdenture prosthesis) */
const pl11Mark = (S, on) => { if (S && typeof S === 'object') try { Object.defineProperty(S, '_io', { value: !!on, enumerable: false, configurable: true, writable: true }) } catch (e) { } };
const pl11MarkAll = r => { if (!r || !r.h) return; const on = !!r.h.iOnly; pl11Mark(r.s, on); (r.sx || []).forEach(s => pl11Mark(s, on)); if (r.s2) pl11Mark(r.s2, on) };
{ const _f = fromDoc; fromDoc = function () { const r = _f.apply(this, arguments); try { pl11MarkAll(r) } catch (e) { } return r } }
let PL11_IOG = false;
{ const _r = rowTotals; rowTotals = function (r, x) { const o = _r.apply(this, arguments); try { if ((r && r.s && r.s._io) || PL11_IOG) { o.pros = 0; if (x && x.pros) o.flat = 0 } } catch (e) { } return o } }
/* (surgActual: the PL11_IOG flag around the base is merged into surgery/surgery-day.js) */
/* tag + «فقط اوردنچر» layout in the plan form */
let PL11_SHOW = false;
function pl11Form() { if (!F || !F.h) return; pl11MarkAll(F); const io = !!F.h.iOnly, oo = !!F.h.oOnly, sn = $('staffNote'); let t = $('pl11Tag');
  if (!io && !oo) { if (t) t.remove(); document.querySelectorAll('.pl11hide').forEach(c => c.classList.remove('pl11hide')); const b = $('pl11More'); if (b) b.remove(); return }
  if (!t && sn) { sn.insertAdjacentHTML('afterend', '<div class="banner info" id="pl11Tag"></div>'); t = $('pl11Tag') } if (t) t.textContent = io ? 'فقط ایمپلنت — پروتز در جای دیگر انجام می‌شود؛ پارت پروتز در این طرح حساب نمی‌شود.' : 'فقط اوردنچر — بخش اوردنچر بالای فرم است.';
  if (oo && !SURG) { const ov = document.querySelector('[data-sec="ovd"]'); if (!ov) return; const par = ov.parentElement, first = par.querySelector('[data-sec]'); if (first && first !== ov) par.insertBefore(ov, first);
    par.querySelectorAll(':scope > [data-sec]').forEach(c => { if (c.dataset.sec !== 'ovd') c.classList.toggle('pl11hide', !PL11_SHOW) });
    let b = $('pl11More'); if (!b) { ov.insertAdjacentHTML('afterend', '<div class="btns" id="pl11More"><button type="button" class="btn sm ghost" data-pl11more="1"></button></div>'); b = $('pl11More') } b.querySelector('button').textContent = PL11_SHOW ? 'پنهان کردن بقیه‌ی بخش‌ها' : 'نمایش بقیه‌ی بخش‌ها' } }
{ const _r = renderForm; renderForm = function () { const r = _r.apply(this, arguments); try { pl11Form() } catch (e) { } return r } }
{ const _r = recalc; recalc = function () { try { if (F && F.h) pl11MarkAll(F) } catch (e) { } return _r.apply(this, arguments) } }
{ const _s = reSec; reSec = function () { const r = _s.apply(this, arguments); try { pl11Form() } catch (e) { } return r } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pl11more]'); if (!t) return; e.preventDefault(); PL11_SHOW = !PL11_SHOW; pl11Form() }, true);
/* «تعیین تکلیف مالی» by part — default by stage: before surgery = surgery part, after surgery (impression) = prosthesis part */
function pl11Part(k) { if (!PC || !PC._o) return; const o = PC._o, pS = PC.paidS || 0, pP = PC.paidP || 0, cq = PC.cqParts || {}; PC.part = k;
  if (k === 's') { PC.cashS = o.cashS; PC.cashP = 0; PC.cash = o.cashS; PC.rcash = Math.max(0, o.cashS - pS) }
  else if (k === 'p') { PC.cashS = 0; PC.cashP = o.cashP; PC.cash = o.cashP; PC.rcash = Math.max(0, o.cashP - pP) }
  else { PC.cashS = o.cashS; PC.cashP = o.cashP; PC.cash = o.cash; PC.rcash = Math.max(0, o.cash - pS - pP) }
  PC.chq = o.chq.filter(c => (k === 'b' || c.part === k) && !cq[c.part]);
  document.querySelectorAll('#pl11Pt [data-pl11pt]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pl11pt === k)));
  const ci = $('pc_cash'); if (ci && !PC.dep) ci.value = PC.rcash ? fa(PC.rcash) : '۰'; try { pcRender() } catch (e) { }
  const fl = $('pc_first'), lb = fl && fl.closest('label'); if (lb) lb.hidden = !PC.chq.length || !!PC.dep; const bk = $('pc_bank'), lb2 = bk && bk.closest('label'); if (lb2) lb2.hidden = !PC.chq.length || !!PC.dep;
  document.querySelectorAll('#pcSheet p.note').forEach(x => { if (x.id !== 'pl11Note' && /نقد مورد انتظار/.test(x.textContent)) x.hidden = true }); const n = $('pl11Note'); if (n) n.innerHTML = `پارت ${({ s: 'جراحی', p: 'پروتز', b: 'جراحی و پروتز' })[k]}: نقد مانده <b>${fa(PC.rcash)}</b> تومان${PC.chq.length ? ` · ${fa(PC.chq.length)} چک به مبلغ ${fa(PC.chq.reduce((a, x) => a + x.amount, 0))} تومان` : ''}${Object.keys(cq).length ? ' · چک‌های ' + Object.keys(cq).map(p => p === 's' ? 'جراحی' : 'پروتز').join(' و ') + ' قبلاً ثبت شده' : ''}` }
{ const _l = pcPrevLoad; pcPrevLoad = async function () { const id = PC && PC.id; if (PC) PC._o = { cash: PC.cash, cashS: PC.cashS, cashP: PC.cashP, chq: (PC.chq || []).slice() }; await _l.apply(this, arguments); try { if (!PC || PC.id !== id) return;
  let j = PL10_GET[id]; if (!j) { j = await api('get', { id }); if (!PC || PC.id !== id) return }
  const P = (j.pays || []).filter(p => p.st !== 'del'); PC.paidS = P.filter(p => p.kind !== 'chq' && p.part !== 'p').reduce((a, p) => a + (Number(p.amount) || 0), 0); PC.paidP = P.filter(p => p.kind !== 'chq' && p.part === 'p').reduce((a, p) => a + (Number(p.amount) || 0), 0); PC.cqParts = {}; P.filter(p => p.kind === 'chq').forEach(p => { PC.cqParts[p.part === 'p' ? 'p' : 's'] = 1 });
  const sh = $('pcSheet'); if (!sh || $('pl11Pt')) return; const h3 = sh.querySelector('h3'); if (!h3) return;
  h3.insertAdjacentHTML('afterend', '<div class="seg pl11pt" id="pl11Pt" role="group" aria-label="کدام پارت"><button type="button" data-pl11pt="s">پارت جراحی</button><button type="button" data-pl11pt="p">پارت پروتز</button><button type="button" data-pl11pt="b">هر دو</button></div><p class="note" id="pl11Note"></p>');
  pl11Part(((j.surg || {}).sessions || []).length ? 'p' : 's') } catch (e) { } } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pl11pt]'); if (!t || !PC) return; e.preventDefault(); e.stopImmediatePropagation(); pl11Part(t.dataset.pl11pt) }, true);
