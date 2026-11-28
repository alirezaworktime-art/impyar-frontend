/* ---------- patch-walk: کاشی‌های پذیرش = فهرست‌ها؛ نوبت جراحی فقط با ارجاع؛ برگرداندن انصراف ---------- */
window.TASK_DONE = {};
/* a «نیامد» re-booking task belongs to the tile of its appointment kind */
const renoGrp = t => t.kind === 'reno' ? (AGRP.pr.includes(t.info) ? 'pros' : t.info === 'uncover' ? 'unc' : 'chk') : '';
const tOpenR = (g, h) => TASKS.filter(t => !t.done && renoGrp(t) === g && dDiff(t.due, tDay()) <= h).length;
/* reception «طرح درمان امروز»: only patients before/at consultation */
const rOwn = x => ['waiting', 'reviewing', 'consult', 'consulting'].includes(x.queue || '');
/* prosthesis tile: idle stages and late lab work (same rows the tile counts) */
/* renderPi — patch-walk base + prosthesis/psess (today's prosthesis sessions: l5RenderStaff) + lab/lab7 (lab orders not sent: f6RenderStaff); both extras run on every call, errors ignored */
function renderPi() { const L = $('piList'); if (L && ROLE === 'staff') { const R = [];
  (QPIDLE || []).forEach(x => R.push({ name: x.name, phone: x.phone, why: x.stage === 'lab' ? `قالب گرفته شده؛ ${fa(x.days)} روز است سفارش لابراتوار ثبت نشده — به پزشک پروتز یادآوری کنید` : `${fa(x.days)} روز در مرحله‌ی «${esc(PSTN[x.stage] || x.stage)}» بدون نوبت`,
    act: (x.stage === 'lab' ? '' : `<button class="btn sm" type="button" data-pbook="${esc(x.id)}" data-pbn="${esc(x.name)}" data-pbp="${esc(x.phone || '')}" data-pbk="${PR_AK[x.stage] || 'tryin'}">تعیین نوبت ${esc(AKL[PR_AK[x.stage]] || '')}</button>`) + fileBtn(x.id, x.name, 'pros') }));
  (QLAB || []).forEach(l => R.push({ name: l.name, why: `کار لابراتوار ${fa(f3Days(l.due))} روز از موعد گذشته · ${esc(LST[l.st] || l.st)}`, act: fileBtn(l.plan, l.name, 'pros') }));
  L.dataset.n = R.length;
  L.innerHTML = R.length ? R.map(r => `<div class="item task kg-pr"><div class="row1"><div><div class="nm">${esc(r.name || '')}</div><div class="meta">${r.why}</div></div></div><div class="acts">${r.phone ? tel(r.phone) : ''}${r.act}</div></div>`).join('') : '<div class="empty">موردی نیست.</div>'; }
  try { l5RenderStaff(); } catch (e) { } try { f6RenderStaff(); } catch (e) { } }
/* «برگرداندن انصراف» on a booking task that was closed by bookLost */
document.addEventListener('click', async e => { const t = e.target.closest && e.target.closest('button[data-bkundo]'); if (!t || t.disabled) return; e.preventDefault(); e.stopImmediatePropagation();
  t.disabled = true; try { await api('bookUndo', { id: t.dataset.bkundo }); toast('انصراف برگردانده شد؛ بیمار دوباره در صف نوبت‌دهی است.'); pollQ(true); } catch (err) { toast(err.message); } finally { t.disabled = false; } }, true);
/* after a referral from a card, refresh the open file / calendar too */
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('button[data-tosurg]'); if (!t) return; setTimeout(() => { try { if (PF && !$('pfSheet').hidden) refreshFile(); } catch (x) { } try { if (!$('viewCal').hidden) loadCal(); } catch (x) { } }, 1200); });

/* ---- sec6: the doctor sees settings read-only (only the prescription template, in «نسخه‌ها», is editable by the doctor) ---- */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t||t.id!=='tabSet')return;
  const sh=$('sSheet');if(!sh)return;const ro=ROLE==='doctor';
  sh.querySelectorAll('input,textarea,select').forEach(i=>{i.disabled=ro});
  ['set_surgpw','set_invpw','set_labpw','set_mgrpw'].forEach(id=>{const i=$(id);if(!i)return;const h8=ro||id!=='set_mgrpw';const l=i.closest('label');if(l)l.hidden=h8;const n=$(id+'N');if(n)n.hidden=h8});
  const sv=$('sSave');if(sv)sv.hidden=ro;
  let n=$('sRoNote');if(!n){n=document.createElement('p');n.id='sRoNote';n.className='msg';sh.querySelector('.in h3').after(n)}
  n.hidden=!ro;n.textContent=ro?'تنظیمات برای پزشک فقط خواندنی است. قالب نسخه و دستورات بعد از جراحی را از بخش «نسخه‌ها» ویرایش کنید.':''});

