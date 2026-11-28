/* ---------- m9: (1) VIP/GBR/CGF quadrants and sinus «راست/چپ» back to the chart's view: patient's right on the LEFT of the screen (q1 reverted) · (2) surgery day «قلم پزشک»: one doctor row at the top of the treatments, tap the doctor, then tap teeth/areas on the chart → that unit is his/hers (badge with his initial); the per-section assistant menu, «+» second assistant and the separate «پزشک هر دندان» row are gone. Implants / All on X / overdenture / subperiosteal stay with the surgeon ---------- */
const M9C = ['#0f766e', '#b45309', '#7c3aed', '#be123c', '#1d4ed8', '#4d7c0f', '#0e7490'];
const m9Docs = () => PL9D();
const m9Col = n => { const i = m9Docs().indexOf(n); return M9C[(i < 0 ? 6 : i) % M9C.length] };
const m9Ini = n => (String(n || '').replace(/^(دکتر|د\.)\s*/, '').trim()[0] || '?');
const m9On = id => !!(SURG && !SURG.arc && !SOLO.includes(id) && SEC[id]);
const m9A1 = id => SURG.sa[id] || SURG.asst || '';
const m9Who = (id, k) => (((SURG.pl9st || {})[id] || {})[k]) || m9A1(id);
const m9Pen = () => SURG.m9pen || SURG.asst || '';
function m9Set(id, k, who) { const a1 = m9A1(id); SURG.pl9st = SURG.pl9st || {}; const m = SURG.pl9st[id] = SURG.pl9st[id] || {}; if (!who || who === a1) delete m[k]; else m[k] = who; SURG.st = SURG.st || {}; SURG.st[id] = m }
const m9Sel = (id, k) => { const s = SURG && SURG.s && SURG.s[id]; return !!(s && ((s.sel && s.sel[k]) || (s.isel && s.isel[k]))) };
/* no per-section assistant menu / «+» on the surgery day: merged into asstSel (surgery/form-render.js) */
/* the separate «پزشک هر دندان» row → one short line «کدام پزشک کدام دندان»: merged into p5SplitHTML (surgery/pa5-assistant-per-tooth-non.js) */
/* badge on every chosen tooth / area */
{ const _s = sectionHTML; sectionHTML = function (x) { let h = _s.apply(this, arguments); try { if (!x || !m9On(x.id)) return h;
  h = h.replace(/(<button\b[^>]*>)([\s\S]*?)(<\/button>)/g, (m, o, inner, c) => { const sid = /data-(?:sid|isid)="([^"]+)"/.exec(o), k = /data-(?:k|ik)="([^"]+)"/.exec(o); if (!sid || !k || sid[1] !== x.id || !/aria-pressed="true"/.test(o) || / disabled[\s>=]/.test(o)) return m;
    const n = m9Who(x.id, k[1]); if (!n) return m; const col = m9Col(n); return o.replace(/class="/, 'class="m9w ').replace(/^<button\b/, `<button style="--c:${col}"`).replace(/title="[^"]*"/, '') .replace(/>$/, ` title="${esc(n)}">`) + inner + `<i class="m9d">${esc(m9Ini(n))}</i>` + c }) } catch (e) { } return h } }
/* the pen row on top of the open treatments */
function m9Bar() { const box = $('surgSecs'); if (!box || !SURG) return; const old = $('m9Pen'); if (old) old.remove(); if (SURG.arc || !SURG.asst) return;
  const any = SURG_SECS().some(x => SURG.openSecs && SURG.openSecs.has(x.id) && m9On(x.id)); if (!any) return; const p = m9Pen();
  box.insertAdjacentHTML('afterbegin', `<div class="m9pen" id="m9Pen"><small>قلم پزشک: پزشک را بزنید، بعد دندان‌ها/ناحیه‌هایی را که او انجام داد روی نمودار بزنید (پیش‌فرض: ${esc(SURG.asst)})</small><div class="chips">${m9Docs().map(n => `<button type="button" class="chip" data-m9pen="${esc(n)}" style="--c:${m9Col(n)}" aria-pressed="${n === p}"><i></i>${esc(n)}</button>`).join('')}</div></div>`) }
{ const _r = renderSurg; renderSurg = function () { const r = _r.apply(this, arguments); try { m9Bar() } catch (e) { } return r } }
{ const _r = reSec; reSec = function (id) { const r = _r.apply(this, arguments); try { if (SURG && !$('m9Pen')) m9Bar() } catch (e) { } return r } }
document.addEventListener('click', e => { if (!SURG) return; const t = e.target.closest && e.target.closest('button'); if (!t) return;
  if (t.dataset.m9pen) { e.preventDefault(); e.stopImmediatePropagation(); SURG.m9pen = t.dataset.m9pen; document.querySelectorAll('[data-m9pen]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m9pen === SURG.m9pen))); return }
  if (!t.closest('#surgSecs') || t.disabled) return; const id = t.dataset.sid || t.dataset.isid, k = t.dataset.k || t.dataset.ik; if (!id || !k || !m9On(id)) return; const pen = m9Pen(); if (!pen) return;
  if (m9Sel(id, k) && m9Who(id, k) !== pen) { e.preventDefault(); e.stopImmediatePropagation(); m9Set(id, k, pen); SURG.dirty = true; reSec(id); return }
  setTimeout(() => { try { if (!SURG) return; if (m9Sel(id, k)) m9Set(id, k, pen); else m9Set(id, k, ''); reSec(id) } catch (x) { } }, 0) }, true);
