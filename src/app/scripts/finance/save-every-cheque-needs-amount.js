/* ---------- m12: «تعیین تکلیف مالی» — cheque amounts and due dates are editable, cheques can be added or removed; a total different from the cheque part warns but is saved, and the patient card shows «مغایرت» until the file is settled (owner, 2026-11-11) ---------- */
const m12St = () => { if (!PC) return null; if (!PC.m12 || PC.m12.src !== PC.chq) PC.m12 = { src: PC.chq, E: (PC.chq || []).reduce((a, x) => a + (Number(x.amount) || 0), 0), L: null }; return PC.m12 };
/* the edited cheque rows come out of pcRows (fin2) */
const m12Sum = () => { const st = m12St(); if (!st || !st.L) return { s: 0, E: 0, d: 0 }; const s = st.L.reduce((a, x) => a + (Number(x.amount) || 0), 0); return { s, E: st.E, d: s - st.E } };
function m12SumUI() { const el = $('m12Sum'); if (!el) return; const { s, E, d } = m12Sum(); el.className = 'm12sum' + (d ? ' warn' : '');
  el.innerHTML = `جمع چک‌ها: <b>${fa(s)}</b> تومان · مبلغ چکی طرح: <b>${fa(E)}</b> تومان` + (d ? `<br>⚠ ${d > 0 ? 'جمع چک‌ها ' + fa(d) + ' تومان بیشتر از مانده است' : 'جمع چک‌ها ' + fa(-d) + ' تومان کمتر از مانده است'}؛ ثبت می‌شود ولی تا تسویه روی کارت بیمار «مغایرت» نشان داده می‌شود.` : '') }
/* (pcRender: editable cheque rows — merged into fin2.js) */
document.addEventListener('input', e => { const t = e.target, st = PC && m12St(); if (!t || !st || !st.L || !t.dataset) return;
  if (t.dataset.m12a !== undefined) { const x = st.L[+t.dataset.m12a]; if (x) { x.amount = num(t.value); m12SumUI() } }
  else if (t.dataset.m12d !== undefined) { const x = st.L[+t.dataset.m12d]; if (x) { x.dt = t.value; x.man = !!String(t.value).trim() } } }, true);
document.addEventListener('focusout', e => { const t = e.target; if (t && t.dataset && t.dataset.m12a !== undefined && PC) { try { t.value = fa(num(t.value)) } catch (x) { } } }, true);
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-m12x],[data-m12add]'); if (!t || !PC) return; const st = m12St(); if (!st || !st.L) return; e.preventDefault(); e.stopImmediatePropagation();
  if (t.dataset.m12x !== undefined) { const i = +t.dataset.m12x; st.L.splice(i, 1); if (PC.nos) { const n = {}; Object.keys(PC.nos).forEach(k => { const j = +k; if (j < i) n[j] = PC.nos[k]; else if (j > i) n[j - 1] = PC.nos[k] }); PC.nos = n } }
  else { const p = t.dataset.m12add, last = [...st.L].reverse().find(x => x.part === p) || st.L[st.L.length - 1]; st.L.push({ o: last ? last.o : { part: p }, part: p, amount: last ? last.amount : 0, dt: '', man: false }) }
  pcRender() }, true);
/* save: every cheque needs an amount; a mismatch is saved with a mark */
window.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#pcSave'); if (!t || !PC) return; const st = m12St(); if (!st || !st.L) return; const m = $('pcMsg');
  const bad = pcRows().findIndex(x => !(Number(x.amount) > 0)); if (bad >= 0) { e.preventDefault(); e.stopImmediatePropagation(); if (m) { m.className = 'msg err'; m.textContent = `مبلغ چک ${fa(bad + 1)} را بنویسید (یا آن چک را حذف کنید).` } return }
  const d = m12Sum().d; PC.m12d = d; if (d) toast('جمع چک‌ها با مانده یکی نیست؛ ثبت می‌شود و روی کارت بیمار «مغایرت» نمایش داده می‌شود.', true) }, true);
{ const _a = api; api = function (action, payload) { try { if (action === 'payAdd' && PC && PC.m12d && payload && payload.id === PC.id && payload.pay && payload.pay.kind === 'chq' && !/مغایرت/.test(payload.pay.note || '')) payload.pay.note = (payload.pay.note || '') + ' (مغایرت)' } catch (e) { } return _a.apply(this, arguments) } }
/* the patient card */


/* every reception card of that patient (tasks, appointments, lists) and the patient file */
let M12 = {};
{ const _a = applyQueue; applyQueue = function (j) { try { if (j && Array.isArray(j.items)) M12 = j.m12 || {} } catch (e) { } const r = _a.apply(this, arguments); m12Deco(); return r } }
const m12Pill = v => `<span class="pill m12p" title="جمع چک‌ها و پرداخت‌ها با مبلغ طرح یکی نیست">⚠ مغایرت ${v > 0 ? 'مانده' : 'اضافه'} ${fa(Math.abs(v))}</span>`;
let M12_T = 0;
function m12Deco() { clearTimeout(M12_T); M12_T = setTimeout(() => { try { const K = Object.keys(M12 || {}); if (!K.length) return; const S = new Set(K);
  document.querySelectorAll('.item, .qitem').forEach(it => { if (it.querySelector('.m12p')) return; let id = '';
    for (const el of [it, ...it.querySelectorAll('*')]) { for (const a of el.attributes) { if (a.name.startsWith('data-') && S.has(a.value)) { id = a.value; break } } if (id) break }
    if (!id) return; const r1 = it.querySelector('.row1') || it; r1.insertAdjacentHTML('beforeend', m12Pill(M12[id])) }) } catch (e) { } }, 30) }
['renderQ', 'renderTasks'].forEach(n => { try { const f = window[n]; if (typeof f === 'function') window[n] = function () { const r = f.apply(this, arguments); m12Deco(); return r } } catch (e) { } });
/* (pfPays: the «مغایرت» banner — merged into patient-file-extra-tabs.js) */
