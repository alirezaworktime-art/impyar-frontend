/* ---------- m18 (owner, 2026-11-12, from the flow audit of m17): (1) «انجام شد» on booking-type tasks opens three choices (appointment / patient is not coming + reason → «بازگشت بیماران» / follow up on another day) instead of closing the task; (2) reception sees «طرح تغییر کرده؛ منتظر تأیید مشاور» on the tasks of a plan the doctor changed after approval; (3) «بازگشت بیماران»: search by name or phone and «نمایش بیشتر» instead of the first 300 only ---------- */
const M18K = ['book', 'reno', 'impr', 'uncover', 'suture', 'labready', 'pfail', 'repair'];
let M18T = null;
function m18Sheet() { let s = $('m18Sheet'); if (s) return s; s = document.createElement('div'); s.className = 'sheet'; s.id = 'm18Sheet'; s.hidden = true;
  s.innerHTML = '<div class="in"><h3 id="m18T"></h3><p class="note">این کار با یک ضربه بسته نمی‌شود تا بیمار از فهرست‌ها گم نشود. یکی را انتخاب کنید:</p>' +
    '<div class="btns" style="flex-wrap:wrap"><span id="m18BookW"><button class="btn" type="button" id="m18Book">تعیین نوبت</button></span><button class="btn ghost" type="button" id="m18Did">بیمار آمد؛ انجام شد</button></div>' +
    '<div class="payform"><b>پیگیری در روز دیگر</b><div class="btns" style="flex-wrap:wrap">' + [[1, 'فردا'], [3, '۳ روز بعد'], [7, 'یک هفته بعد'], [14, 'دو هفته بعد'], [30, 'یک ماه بعد']].map(([d, l]) => `<button class="btn sm ghost" type="button" data-m18d="${d}">${l}</button>`).join('') + '</div></div>' +
    '<div class="payform"><b>بیمار نمی‌آید / نمی‌خواهد</b><label class="f">دلیل<input id="m18Why" maxlength="150" autocomplete="off"></label><div class="btns"><button class="btn ghost" type="button" id="m18No">ثبت؛ برود به «بازگشت بیماران»</button></div></div>' +
    '<div class="msg" id="m18Msg"></div><div class="btns"><button class="btn ghost" type="button" id="m18Close">بستن</button></div></div>';
  document.body.appendChild(s);
  s.addEventListener('click', async e => { const t = e.target.closest && e.target.closest('button'); if (!t || !M18T) return; const tk = M18T, m = $('m18Msg');
    if (t.id === 'm18Close') { s.hidden = true; return }
    if (t.id === 'm18Book') { s.hidden = true; const b = [...document.querySelectorAll('button[data-tbook]')].find(x => x.dataset.tbook === tk.id); if (b) b.click(); return }
    const by = ($('rc_asst') || {}).value || ROLE_LBL[ROLE] || '', body = t.dataset.m18d ? { id: tk.id, how: 'later', days: +t.dataset.m18d, by } : t.id === 'm18No' ? { id: tk.id, how: 'no', why: $('m18Why').value.trim(), by } : t.id === 'm18Did' ? { id: tk.id, how: 'did', by } : null; if (!body) return;
    if (body.how === 'no' && body.why.length < 3) { m.className = 'msg err'; m.textContent = 'دلیل را بنویسید.'; $('m18Why').focus(); return }
    t.disabled = true; try { const j = await api('taskDone', body); const x = TASKS.find(v => v.id === tk.id); if (x) { if (j.later) x.due = j.later; else { x.done = 1; if (body.how === 'no') x.note = 'بیمار نمی‌آید: ' + body.why } }
      s.hidden = true; renderTasks(); toast(j.later ? 'پیگیری به ' + jDay(j.later) + ' رفت.' : body.how === 'did' ? 'انجام شد.' : 'ثبت شد؛ بیمار در «بازگشت بیماران» است.'); pollQ(true) }
    catch (err) { m.className = 'msg err'; m.textContent = err.message } finally { t.disabled = false } });
  return s }
window.addEventListener('click', e => { const t = e.target.closest && e.target.closest('button[data-tdone]'); if (!t) return; const tk = TASKS.find(x => x.id === t.dataset.tdone); if (!tk || tk.done || !M18K.includes(tk.kind)) return;
  e.preventDefault(); e.stopImmediatePropagation(); M18T = tk; const s = m18Sheet(); $('m18T').textContent = (tk.name || '') + ' — ' + ((TLBL[tk.kind] || [tk.kind])[0]); $('m18Why').value = ''; $('m18Msg').textContent = '';
  $('m18Did').hidden = !(tk.kind === 'suture' || tk.kind === 'uncover'); $('m18BookW').hidden = ![...document.querySelectorAll('button[data-tbook]')].some(x => x.dataset.tbook === tk.id); s.hidden = false }, true);
/* (2) label on reception's task cards */
{ const _rt = renderTasks; renderTasks = function () { const r = _rt.apply(this, arguments);
  try { if (ROLE === 'staff') { const W = new Set((typeof QITEMS !== 'undefined' ? QITEMS : []).filter(x => (x.queue === 'consult' || x.queue === 'consulting') && x.status === 'modified').map(x => x.id)); if (W.size) { const P = new Set(TASKS.filter(t => !t.done && W.has(t.plan)).map(t => t.id));
    document.querySelectorAll('button[data-tdone]').forEach(b => { if (!P.has(b.dataset.tdone)) return; const c = b.closest('.item'), nm = c && c.querySelector('.nm'); if (nm && !c.querySelector('.m18pill')) nm.insertAdjacentHTML('beforeend', '<span class="pill settle m18pill">طرح تغییر کرده؛ منتظر تأیید مشاور</span>') }) } } } catch (e) { }
  return r } }
/* (3) win-back list: «نمایش بیشتر» button (search + paging merged into renderWb in p5-online-intake-post-op.js) */
{ document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#wbMore'); if (t) { WB.n += 300; renderWb() } }) }
