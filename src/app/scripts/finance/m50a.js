/* ---------- m50a (owner, 2026-11-18):
   (A) «بیمار نیاز به مشاوره‌ی دندانپزشک عمومی دارد» (m48a) now makes a task for reception («وقت ویزیت دندانپزشک عمومی»): a card above «نوبت‌دهی» with «نوبت ویزیت» and «انجام شد»;
   (B) a patient who was operated before paying: the discharge card of the surgery day shows the open amount with «تعیین تکلیف مالی» (the same sheet);
       that sheet opens on the part that is still open (surgery, or both) instead of always «پروتز» after a surgery;
   (C) reception «تسویه‌ی اختلاف جراحی»: the form is like «تعیین تکلیف مالی» — cash (card reader / banknote / card-to-card with the account) and cheques
       (amount, due date, number, bank, kind, «در وجه») together; what is not received today goes to the balance of the file. ---------- */
/* (A) */
try { TLBL.gen = ['وقت ویزیت دندانپزشک عمومی', 'پزشک طرح درمان گفته بیمار نیاز به مشاوره‌ی دندانپزشک عمومی دارد؛ نوبت ویزیت بدهید.']; TGRP.gen = 'fl' } catch (e) { }
function m50Gen() { if (ROLE !== 'staff') return; const host = $('bkList'); if (!host) return; const sec = host.closest('.rsec') || host; const box = $('m50GenL'), G = (TASKS || []).filter(t => t.kind === 'gen' && !t.done);
  if (!G.length) { if (box) box.remove(); return }
  const h = `<div class="rsec" id="m50GenL"><h3 class="rsh">ویزیت دندانپزشک عمومی / ارجاع به پزشک دیگر <small>${fa(G.length)}</small></h3><div class="list">${G.map(t => `<div class="item task kg-fl m50gen"><div class="row1"><div><div class="nm">${esc(t.name || '')}</div><div class="meta">${/ارجاع به پزشک دیگر/.test(t.info || '') ? esc(t.info) : esc(TLBL.gen[0]) + (t.info ? ' — ' + esc(t.info) : '')}</div><div class="meta">${/ارجاع به پزشک دیگر/.test(t.info || '') ? 'پزشک طرح درمان بیمار را ارجاع داده است؛ با بیمار هماهنگ کنید و نوبت بدهید.' : esc(TLBL.gen[1])}</div></div><span class="pill wait">ویزیت عمومی</span></div><div class="acts">${t.phone ? `<a class="btn sm ghost" href="tel:${esc(toEn(t.phone))}">تماس ${esc(faD(t.phone))}</a>` : ''}<button class="btn sm main" type="button" data-m50ga="${esc(t.id)}">نوبت ویزیت</button><button class="btn sm ghost" type="button" data-tdone="${esc(t.id)}">انجام شد</button><button class="btn sm ghost" type="button" data-file="${esc(t.plan)}" data-fname="${esc(t.name || '')}">پرونده</button></div></div>`).join('')}</div></div>`;
  if (box) box.outerHTML = h; else sec.insertAdjacentHTML('beforebegin', h) }
{ const _r = renderTasks; renderTasks = function () { const r = _r.apply(this, arguments); try { m50Gen() } catch (e) { console.error('m50a gen', e) } return r } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-m50ga]'); if (!t) return; e.preventDefault(); const k = (TASKS || []).find(x => x.id === t.dataset.m50ga); if (!k) return; openAppt({ plan: k.plan, name: k.name, phone: k.phone || '', kind: 'other', task: k.id, note: 'ویزیت دندانپزشک عمومی' + (k.info ? ' — ' + k.info : '') }) });
/* (B) */
function m50Sd() { if (ROLE !== 'staff') return; document.querySelectorAll('#sdList .item.sdone[data-sd]').forEach(c => { const x = QITEMS.find(v => v.id === c.dataset.sd); if (!x || !(x.owe > 0) || c.querySelector('.m50owe')) return; const sdc = c.querySelector('.sdc'); if (!sdc) return;
  sdc.insertAdjacentHTML('beforeend', `<div class="sdr m50owe"><span class="ck"></span><div class="tx">مانده‌ی حساب بیمار: <b>${fa(x.owe)}</b> تومان<small>اگر بیمار بعد از جراحی پرداخت می‌کند، از همین‌جا نقد و چک‌ها را ثبت کنید.</small></div><button class="btn sm main" type="button" data-p4rest="${esc(x.id)}">تعیین تکلیف مالی</button></div>`) }) }
{ const _s = renderSd; renderSd = function () { const r = _s.apply(this, arguments); try { m50Sd() } catch (e) { console.error('m50a sd', e) } return r } }
{ const _l = pcPrevLoad; pcPrevLoad = async function () { const r = await _l.apply(this, arguments); try { if (PC && PC._o && PC.part === 'p') { const o = PC._o, cq = PC.cqParts || {}, sum = p => (o.chq || []).filter(c => c.part === p).reduce((a, c) => a + c.amount, 0);
  const rs = Math.max(0, (o.cashS || 0) - (PC.paidS || 0)) + (cq.s ? 0 : sum('s')), rp = Math.max(0, (o.cashP || 0) - (PC.paidP || 0)) + (cq.p ? 0 : sum('p')); if (rs > 0) pl11Part(rp > 0 ? 'b' : 's') } } catch (e) { } return r } }
/* (C) */
let M50 = null;
function m50Row(c, i) { return `<div class="m50cq" data-m50i="${i}"><label class="f">مبلغ چک ${fa(i + 1)} (تومان)<input class="price" inputmode="numeric" data-m50ca="${i}" value="${c.amount ? fmtInput(String(c.amount)) : ''}"></label><label class="f">سررسید<input inputmode="numeric" data-m50cd="${i}" placeholder="۱۴۰۵/۰۹/۰۱" value="${esc(c.due || '')}"></label><label class="f">شماره چک *<input inputmode="numeric" data-m50cn="${i}" value="${esc(c.no || '')}"></label><button type="button" class="btn sm ghost danger" data-m50cx="${i}" aria-label="حذف چک ${fa(i + 1)}">×</button></div>` }
function m50Draw() { const w = $('m50Chq'); if (!w || !M50) return; w.innerHTML = M50.chq.map(m50Row).join(''); const x = $('m50ChqX'); if (x) x.hidden = !M50.chq.length; m50Sum() }
function m50Sum() { const s = $('m50Sum'); if (!s || !M50) return; const a = num(($('m50Cash') || {}).value), b = M50.chq.reduce((t, c) => t + (Number(c.amount) || 0), 0), tot = a + b, rest = M50.d - tot;
  s.className = tot > M50.d ? 'msg err' : 'note'; s.textContent = `نقد ${fa(a)} + چک ${fa(b)} = ${fa(tot)} تومان از ${fa(M50.d)} تومان اختلاف` + (tot > M50.d ? ' — از اختلاف بیشتر است.' : rest > 0 ? ` · ${fa(rest)} تومان به مانده‌ی پرونده اضافه می‌شود.` : ' · کامل.');
  const b2 = $('sdSettle'); if (b2) b2.textContent = tot > 0 ? 'ثبت تسویه و دریافت' : 'ثبت تسویه بدون دریافت (به مانده اضافه شود)' }
function m50Mount() { const f = $('stForm'); if (!f || !ST || !(ST.d > 0)) return; try { ensurePos() } catch (e) { } M50 = { d: ST.d, via: '', acct: '', ctype: '', payee: '', bank: (typeof CPS !== 'undefined' && CPS.get('bank', '')) || '', chq: [] };
  f.outerHTML = `<div class="payform" id="m50F"><b>دریافت اختلاف حساب: ${fa(M50.d)} تومان</b><p class="note">مثل «تعیین تکلیف مالی»: نقد و چک را با هم می‌شود ثبت کرد. هرچه امروز دریافت نشود به مانده‌ی پرونده اضافه می‌شود.</p>
    <div class="fields"><label class="f">نقد دریافتی امروز (تومان)<input id="m50Cash" class="price" inputmode="numeric" value="${fmtInput(String(M50.d))}"></label></div>
    <div class="f" style="margin-top:8px"><span>مبلغ نقد با کدام کارتخوان دریافت شد؟</span><div id="m50Pos">${posChips('m50pos', '', { cash: 1 })}</div></div>${fin1AcctHTML('m50acct', false, '')}
    <div class="grp" style="margin-top:10px"><span>چک‌ها</span></div><div id="m50Chq"></div><div class="btns"><button type="button" class="btn sm ghost" id="m50AddC">+ چک</button></div>
    <div id="m50ChqX" hidden><div class="fields"><label class="f">بانک *<select id="m50Bank">${BANKS.map(b => `<option${b === M50.bank ? ' selected' : ''}>${b}</option>`).join('')}</select></label></div>${fin1ChqHTML('m50', M50)}<label class="f" id="m50PeW" hidden>نام گیرنده‌ی چک *<input id="m50PeO" maxlength="60"></label></div>
    <p class="note" id="m50Sum"></p></div>`;
  if (!M50.bank) M50.bank = ($('m50Bank') || {}).value || ''; m50Draw(); try { m48Hint($('m50Cash')) } catch (e) { }
  ensurePos().then(() => { if (M50 && $('m50Pos')) $('m50Pos').innerHTML = posChips('m50pos', M50.via, { cash: 1 }) }).catch(() => { }) }
/* (openDone: M50 reset + m50Mount merged into surgery/surgery-day.js) */
window.addEventListener('click', e => { const t = e.target.closest && e.target.closest('button'); if (!t || !M50 || !$('m50F')) return; const d = t.dataset;
  if (d.m50pos !== undefined) { M50.via = posPick(t, 'm50pos'); fin1Show('m50acct', M50.via === 'xfer'); return }
  if (d.m50acct !== undefined) { M50.acct = fin1Pick(t, 'm50acct'); return }
  if (d.m50ct !== undefined) { M50.ctype = fin1Pick(t, 'm50ct'); return }
  if (d.m50pe !== undefined) { M50.payee = fin1Pick(t, 'm50pe'); const w = $('m50PeW'); if (w) w.hidden = M50.payee !== '*'; return }
  if (t.id === 'm50AddC') { e.preventDefault(); const cash = num(($('m50Cash') || {}).value), used = M50.chq.reduce((a, c) => a + (Number(c.amount) || 0), 0); let amt = Math.max(0, M50.d - cash - used);
    if (!amt && !M50.chq.length && cash >= M50.d) { amt = M50.d; const ci = $('m50Cash'); if (ci) { ci.value = '0'; try { m48Hint(ci) } catch (x) { } } }
    const last = M50.chq[M50.chq.length - 1], iso = last && parseJ(last.due || ''); M50.chq.push({ amount: amt, due: iso ? jDay(jAddM(iso, 1)) : '', no: '' }); m50Draw(); return }
  if (d.m50cx !== undefined) { e.preventDefault(); M50.chq.splice(+d.m50cx, 1); m50Draw(); return } }, true);
document.addEventListener('input', e => { const t = e.target; if (!t || !M50 || !$('m50F')) return; const d = t.dataset || {};
  if (d.m50ca !== undefined) { const c = M50.chq[+d.m50ca]; if (c) c.amount = num(t.value); m50Sum(); return }
  if (d.m50cd !== undefined) { const c = M50.chq[+d.m50cd]; if (c) c.due = t.value; return }
  if (d.m50cn !== undefined) { const c = M50.chq[+d.m50cn]; if (c) c.no = t.value; return }
  if (t.id === 'm50Cash') m50Sum() });
document.addEventListener('change', e => { const t = e.target; if (!t || !M50) return; if (t.id === 'm50Bank') { M50.bank = t.value; try { CPS.set('bank', t.value) } catch (x) { } } const d = t.dataset || {}; if (d.m50cd !== undefined) { const c = M50.chq[+d.m50cd]; if (c) c.due = t.value } });
window.addEventListener('click', async e => { const t = e.target.closest && e.target.closest('#sdSettle'); if (!t || !M50 || !$('m50F') || !SD) return; e.preventDefault(); e.stopImmediatePropagation();
  const m = $('sdMsg'), bad = x => { m.className = 'msg err'; m.textContent = x; try { m.scrollIntoView({ block: 'center' }) } catch (z) { } };
  const cash = num(($('m50Cash') || {}).value), pays = [], NT = 'تسویه‌ی اختلاف جراحی';
  if (cash > 0) { if (!M50.via) return bad('مشخص کنید مبلغ نقد با کدام کارتخوان، اسکناس یا کارت‌به‌کارت دریافت شد.'); if (M50.via === 'xfer' && !M50.acct) return bad('حساب مقصد کارت‌به‌کارت را انتخاب کنید.');
    pays.push({ kind: posKind(M50.via), amount: cash, pos: posId(M50.via), acct: M50.via === 'xfer' ? M50.acct : '', note: NT }) }
  if (M50.chq.length) { const pe = M50.payee === '*' ? (($('m50PeO') || {}).value || '').trim() : M50.payee; if (!M50.ctype || !pe) return bad('نوع چک (صیادی / دیجیتال) و «در وجه» را انتخاب کنید.'); if (!M50.bank) return bad('بانک چک را انتخاب کنید.');
    for (let i = 0; i < M50.chq.length; i++) { const c = M50.chq[i], due = parseJ(c.due || ''); if (!(Number(c.amount) > 0)) return bad('مبلغ چک ' + fa(i + 1) + ' را بنویسید.'); if (!due) return bad('سررسید چک ' + fa(i + 1) + ' را درست بنویسید (مثلاً ۱۴۰۵/۰۹/۰۱).'); if (!String(c.no || '').trim()) return bad('شماره‌ی چک ' + fa(i + 1) + ' را بنویسید.');
      pays.push({ kind: 'chq', amount: Number(c.amount), due, no: toEn(String(c.no)).trim(), bank: M50.bank, ctype: M50.ctype, payee: pe, note: NT }) } }
  if (pays.reduce((a, p) => a + p.amount, 0) > M50.d) return bad('جمع مبلغ‌ها از اختلاف بیشتر است.');
  t.disabled = true; try { await api('settleDone', { id: SD.rec.id, refund: null, note: ($('sd_note') || {}).value ? $('sd_note').value.trim() : '', pays, by: (($('rc_asst') || {}).value || ROLE_LBL[ROLE]) });
    $('sgDone').hidden = true; M50 = null; toast('تسویه ثبت شد' + (pays.length ? ' و پرداخت در پرونده نشست.' : '؛ مبلغ به مانده‌ی پرونده اضافه شد.')); if (PF && !$('pfSheet').hidden) refreshFile(); pollQ(true); if (!$('viewList').hidden) loadList() }
  catch (err) { bad(err.message) } finally { t.disabled = false } }, true);
