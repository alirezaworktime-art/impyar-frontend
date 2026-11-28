/* ---------- m51a (owner, 2026-11-18): paper files — a repeated file number or national id is announced while it is typed (a red box under the header
   and one alarm per value), not only at «ذخیره». The checks at saving stay. ---------- */
const M51 = { t: 0, seq: 0, told: {} };
function m51Box() { let b = $('m51Dup'); if (b) return b; const i = document.querySelector('[data-a6h="pfile"],#fxa_file'); const g = i && (i.closest('.a6g2') || i.closest('.fields')); if (!g) return null; g.insertAdjacentHTML('afterend', '<div class="m51dup" id="m51Dup" hidden role="alert"></div>'); return $('m51Dup') }
function m51Vals() { const f = document.querySelector('[data-a6h="pfile"],#fxa_file'), n = document.querySelector('[data-a6h="nid"],#fxa_nid'); if (!f && !n) return null; return { file: f ? toEn(f.value).trim() : '', nid: n ? toEn(n.value).replace(/\D/g, '') : '', id: (typeof A6 !== 'undefined' && A6 && A6.id) || '' } }
async function m51Check() { const v = m51Vals(); if (!v) return; const my = ++M51.seq, box = m51Box(); if (!box) return;
  if (!v.file && v.nid.length < 8) { box.hidden = true; box.innerHTML = ''; return }
  const key = v.file + '|' + v.nid + '|' + v.id; let r; if (M51.key === key && M51.res) r = M51.res; else { try { r = await api('m51Dup', v, { prio: 'bg', timeout: 12000 }) } catch (e) { return } if (my !== M51.seq) return; M51.key = key; M51.res = r }
  const L = []; if (r.file) L.push({ k: 'f:' + v.file, h: `شماره پرونده‌ی <b>${esc(faD(v.file))}</b> قبلاً برای «${esc(r.file.name || 'بیمار دیگر')}» ثبت شده است.`, id: r.file.id, name: r.file.name });
  (r.nid || []).forEach(x => L.push({ k: 'n:' + v.nid + ':' + x.id, h: `کد ملی <b>${esc(faD(v.nid))}</b> قبلاً برای «${esc(x.name || 'بیمار دیگر')}»${x.f ? ' (پرونده ' + esc(faD(x.f)) + ')' : ''} ثبت شده است.`, id: x.id, name: x.name }));
  if (!L.length) { box.hidden = true; box.innerHTML = ''; return }
  box.innerHTML = '<b>⚠ تکراری</b>' + L.map(x => `<div class="m51r"><span>${x.h}</span>${x.id ? `<button type="button" class="btn sm ghost" data-file="${esc(x.id)}" data-fname="${esc(x.name || '')}">پرونده</button>` : ''}</div>`).join(''); box.hidden = false;
  const fresh = L.filter(x => !M51.told[x.k]); if (fresh.length) { fresh.forEach(x => { M51.told[x.k] = 1 }); try { toast('تکراری: ' + fresh.map(x => x.h.replace(/<[^>]+>/g, '')).join(' · '), 1) } catch (e) { } try { box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) } catch (e) { } } }
const m51Later = ms => { clearTimeout(M51.t); M51.t = setTimeout(() => { m51Check().catch(() => { }) }, ms) };
document.addEventListener('input', e => { const t = e.target; if (!t || !t.matches) return; if (t.matches('[data-a6h="pfile"],[data-a6h="nid"],#fxa_file,#fxa_nid')) m51Later(450) });
document.addEventListener('change', e => { const t = e.target; if (!t || !t.matches) return; if (t.matches('[data-a6h="pfile"],[data-a6h="nid"],#fxa_file,#fxa_nid')) m51Later(50) });
{ const _r = a6Render; a6Render = function () { const r = _r.apply(this, arguments); try { if (!$('m51Dup') && M51.res && (M51.res.file || (M51.res.nid || []).length)) m51Later(30) } catch (e) { } return r } }
