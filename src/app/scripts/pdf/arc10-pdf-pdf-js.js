/* ---------- arc10: پرونده‌های جا مانده (درخواست مالک ۱۸ آبان) — (۱) گرافی PDF: هر صفحه در مرورگر به عکس تبدیل می‌شود (pdf.js داخل سایت)؛ (۲) جدول هزینه: یک ردیف برای هر گروه برند ایمپلنت
   با تعرفه‌ی همان گروه؛ (۳) عوض کردن پزشک جدول را فوراً تازه می‌کند؛ (۴) پزشک پونتیک/آنکاوری فقط «پزشک کلینیک»؛ (۵) توضیح برای پزشک آنکاوری / پزشک پروتز / لابراتوار در انتهای فرم،
   نمایش در پرونده، روز جراحی، جلسه‌ی پروتز و سفارش لاب؛ (۶) فهرست پزشک = تنظیمات + حسابداری، هر بار تازه؛ (۷) تعرفه‌ی آنکاوری/هیلینگ/گاید/نسج سخت در تنظیمات؛ (۸) شماره پرونده‌ی کاغذی = شماره پرونده‌ی سایت (قابل ویرایش). ---------- */
const A10T = { surg: 'جراح', unc: 'پزشک آنکاوری', pros: 'پزشک پروتز', lab: 'لابراتوار' }, A10_LOCK = { pon: 1, unc: 1 }, A10_MAXP = 30;
/* (1) PDF → page images */
let A10PDF = null;
function a10Lib() { if (!A10PDF) A10PDF = import(new URL('pdf.min.mjs', location.href).href).then(m => { m.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', location.href).href; return m }).catch(e => { A10PDF = null; throw new Error('خواننده‌ی PDF بارگذاری نشد؛ صفحه را یک بار تازه کنید.') }); return A10PDF }
const a10IsPdf = f => f && (f.type === 'application/pdf' || /\.pdf$/i.test(f.name || ''));
async function a10PdfImgs(file, max, msg) { const lib = await a10Lib(); let doc;
  try { doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise } catch (e) { throw new Error((file.name || 'PDF') + ': ' + (/password/i.test(e && e.name || '') ? 'این PDF رمز دارد؛ بدون رمز ذخیره کنید.' : 'این PDF خوانده نشد.')) }
  const N = Math.min(doc.numPages, A10_MAXP), base = String(file.name || 'گرافی').replace(/\.pdf$/i, ''), out = [];
  try { for (let i = 1; i <= N; i++) { if (msg) msg(i, N); const pg = await doc.getPage(i), v1 = pg.getViewport({ scale: 1 }), sc = Math.min(5, max / Math.max(v1.width, v1.height)), vp = pg.getViewport({ scale: sc });
      const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(vp.width)); c.height = Math.max(1, Math.round(vp.height)); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      await pg.render({ canvasContext: x, viewport: vp }).promise; const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92)); c.width = c.height = 0; pg.cleanup();
      out.push(new File([blob], `${base}${N > 1 ? ' — ص' + i : ''}.jpg`, { type: 'image/jpeg' })) } } finally { try { doc.destroy() } catch (e) { } }
  return { files: out, more: doc.numPages > N ? doc.numPages : 0 } }
async function a10Expand(files, max, msg, all) { const out = []; let more = 0;
  for (const f of files) { if (a10IsPdf(f) && (all || f.size > 1.4e6)) { const r = await a10PdfImgs(f, max, msg); out.push(...r.files); if (r.more) more = Math.max(more, r.more) } else out.push(f) }
  if (more) alertMsg(`فقط ${fa(A10_MAXP)} صفحه‌ی اول PDF (از ${fa(more)} صفحه) ذخیره شد.`);
  return out }
/* radiographs in the paper-file form: every PDF becomes images (zoom works); patient-file images: only PDFs too big to keep */
/* (a9Add: merged into finance/arc9-opg-cbct.js) */
{ const _u = imgUpload; imgUpload = async function (files) { let F; try { F = await a10Expand(files, 2200, (i, n) => { const m = $('imgMsg'); if (m) { m.className = 'note'; m.textContent = `تبدیل PDF: صفحه‌ی ${fa(i)} از ${fa(n)}…` } }, false) } catch (e) { alertMsg(e.message); return } return _u.call(this, F) } }
/* (2) cost table: one row per implant brand group, at that group's tariff */
const a10Rows = l => { if (l.k !== 'imp') return [{ lab: a6Lab(l) + (l.k === 'sgd' ? ' (' + A9.scan[l.scan || 'U'] + ')' : '') + (l.teeth && l.teeth.length ? ' — ' + toothTxt(l.teeth) : ''), n: num(l.n), p: num(l.price), a: a8Base(l) }];
  const G = arbGroups(l), ks = Object.keys(G).sort((a, b) => (ARB_GO.indexOf(a) + 1 || 99) - (ARB_GO.indexOf(b) + 1 || 99));
  if (!ks.length) return [{ lab: a6Lab(l), n: 0, p: 0, a: 0 }];
  return ks.map(g => { const t = G[g], br = [...new Set(t.map(k => ((l.imp || {})[k] || {}).b).filter(Boolean))], p = g ? arbPr(l, g) : 0;
    return { lab: a6Lab(l) + ' — ' + (g ? (ARB_GL[g] || g) : 'بدون برند') + (br.length ? ' (' + br.join('، ') + ')' : '') + ' — ' + toothTxt(t), n: t.length, p, a: t.length * p } }) };
a6TabHTML = function (C) { const rows = A6.lines.slice().sort((a, b) => String(a.day).localeCompare(String(b.day))).flatMap(l => a10Rows(l).map(r => `<tr><td>${esc(l.dayJ || '')}</td><td>${esc(r.lab)}</td><td>${esc(l.doc || '')}</td><td>${fa(r.n)} × ${fa(r.p)}</td><td>${fa(r.a)}</td></tr>`)).join('');
  return `<table class="a6ct a9ct"><thead><tr><th>تاریخ</th><th>شرح درمان</th><th>نام پزشک</th><th>تعداد × تعرفه</th><th>مبلغ کل</th></tr></thead><tbody>${rows || '<tr><td colspan="5">هنوز درمانی وارد نشده.</td></tr>'}</tbody><tfoot><tr><td colspan="4">هزینه‌ی کل</td><td>${fa(C.cost)}</td></tr></tfoot></table>` };
/* (3) a doctor change refreshes the table at once */
['change', 'input'].forEach(ev => document.addEventListener(ev, e => { const t = e.target; if (t && t.matches && t.matches('#a6Root [data-a6f="doc"]')) setTimeout(() => { try { a6MoneyLite() } catch (x) { } }, 0) }));
/* (4) pontic + uncover: «پزشک کلینیک» only */
{ const _n = a6NewLine; a6NewLine = function (k) { const l = _n.apply(this, arguments); if (l && A10_LOCK[k]) l.doc = ARC_DOC; return l } }
{ const _l = a6Line; a6Line = function (l) { if (l && A10_LOCK[l.k]) l.doc = ARC_DOC; let h = _l.apply(this, arguments); if (!l || !A10_LOCK[l.k]) return h;
  try { h = h.replace(/<select data-a6f="doc"[^>]*>[\s\S]*?<\/select>/, `<select data-a6f="doc" data-l="${l.id}" disabled title="فقط پزشک کلینیک"><option selected>${esc(ARC_DOC)}</option></select>`) } catch (e) { } return h } }
/* (6) doctor list: the settings list + the accounting doctors, same name written two ways shown once (accounting spelling wins); fetched again on every open */
const a10Nm = s => String(s || '').replace(/[‌\s.]/g, '').replace(/^(دکتر|د)/, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
a6Docs = function (cur) { const L = [], seen = new Set(), add = d => { d = String(d || '').trim(); const k = a10Nm(d); if (!d || seen.has(k)) return; seen.add(k); L.push(d) };
  (A6D || []).forEach(add); arcDocs().forEach(add); add(ARC_DOC); if (cur && !L.includes(cur)) L.push(cur); return L };
{ const _o = a6Open; a6Open = function () { A6D = null; return _o.apply(this, arguments) } }
/* (5) notes for the next departments, at the end of the form */
function a10Clean(M) { return (M || []).map(m => ({ t: String(m.t || '').trim(), to: (m.to || []).filter(k => A10T[k]) })).filter(m => m.t) }
function ARC10_MSG() { if (!A6) return ''; const M = A6.msgs = A6.msgs && A6.msgs.length ? A6.msgs : [{ t: '', to: [] }];
  return `<div class="grp a10m" id="a10Msg"><span>توضیح برای بخش بعدی (جراح، پزشک آنکاوری، پزشک پروتز یا لابراتوار)</span>${M.map((m, i) => `<div class="a10i"><textarea data-a10t="${i}" rows="2" maxlength="1000" placeholder="متن توضیح…">${esc(m.t || '')}</textarea>
    <div class="chips" role="group" aria-label="برای کدام بخش">${Object.keys(A10T).map(k => `<button type="button" class="chip" data-a10to="${k}" data-a10i="${i}" aria-pressed="${(m.to || []).includes(k)}">${A10T[k]}</button>`).join('')}${M.length > 1 ? `<button type="button" class="chip a10x" data-a10x="${i}">حذف</button>` : ''}</div></div>`).join('')}
    <div class="btns"><button type="button" class="btn sm ghost" id="a10Add">+ توضیح دیگر</button></div></div>` }
function a10Mount() { const ta = document.querySelector('#a6Root [data-a6h="note"]'), sec = ta && ta.closest('section'); if (!sec) return; const o = $('a10Msg'); if (o) o.remove(); sec.insertAdjacentHTML('beforeend', ARC10_MSG()) }
{ const _r = a6Render; a6Render = function () { const r = _r.apply(this, arguments); try { a10Mount() } catch (e) { } return r } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-a10to],[data-a10x],#a10Add'); if (!t || !A6) return; e.preventDefault(); e.stopPropagation(); A6.dirty = true;
  if (t.id === 'a10Add') { A6.msgs.push({ t: '', to: [] }); a10Mount(); const n = document.querySelector(`[data-a10t="${A6.msgs.length - 1}"]`); if (n) n.focus(); return }
  if (t.dataset.a10x) { A6.msgs.splice(Number(t.dataset.a10x), 1); a10Mount(); return }
  const m = A6.msgs[Number(t.dataset.a10i)]; if (!m) return; const k = t.dataset.a10to; m.to = (m.to || []).includes(k) ? m.to.filter(x => x !== k) : (m.to || []).concat(k); t.setAttribute('aria-pressed', String(m.to.includes(k))) }, true);
document.addEventListener('input', e => { const t = e.target; if (!t || !t.dataset || t.dataset.a10t == null || !A6) return; const m = A6.msgs[Number(t.dataset.a10t)]; if (m) { m.t = t.value; A6.dirty = true } }, true);
{ const _f = a6From; a6From = function (j) { const S = _f.apply(this, arguments); try { const a = ((j || {}).data || {}).arc || {}; S.msgs = a10Clean(a.msgs); const hh = ((j || {}).data || {}).h || {}; if (!S.pfile && hh.file) S.pfile = String(hh.file); /* (8) the site file number shows (and is edited) in the paper-number box */ S.lines.forEach(l => { if (A10_LOCK[l.k]) l.doc = ARC_DOC }) } catch (e) { } return S } }
{ const _a = api; api = function (action, payload) {
  if (action === 'fxArc' && payload && payload.arc && payload.arc.v6 && A6) { const bad = (A6.msgs || []).find(m => String(m.t || '').trim() && !(m.to || []).length);
    if (bad) { const n = document.querySelector(`[data-a10t="${A6.msgs.indexOf(bad)}"]`); if (n) n.scrollIntoView({ block: 'center' }); return Promise.reject(new Error('برای هر توضیح بزنید برای کدام بخش است (جراح، پزشک آنکاوری، پزشک پروتز یا لابراتوار).')) }
    payload.arc.msgs = a10Clean(A6.msgs); (payload.arc.lines || []).forEach(x => { if (A10_LOCK[x.k]) x.doc = ARC_DOC }) }
  return _a.apply(this, arguments) } }
/* where the notes show */
function a10Box(M, keys, cls) { const L = a10Clean(M).filter(m => m.to.some(k => keys.includes(k))); if (!L.length) return '';
  return `<div class="a10box ${cls || ''}" role="note"><b>توضیح پرونده‌ی کاغذی</b>${L.map(m => `<div><small>برای ${m.to.map(k => A10T[k]).join('، ')}</small><p>${esc(m.t)}</p></div>`).join('')}</div>` }
const a10Of = d => (((d || {}).arc || {}).msgs) || [];
{ const _f = renderFile; renderFile = function () { const r = _f.apply(this, arguments); try { if (!PF || !PF.j) return r; const sh = $('pfSheet'); if (!sh) return r; sh.querySelectorAll('.a10box').forEach(x => x.remove()); const M = a10Of(PF.j.data);
    const l5 = sh.querySelector('.l5work'); if (l5) { const b = a10Box(M, ['pros', 'lab']); if (b) l5.insertAdjacentHTML('beforebegin', b) } else { const hd = sh.querySelector('.pf-head'), b = a10Box(M, Object.keys(A10T)); if (hd && b) hd.insertAdjacentHTML('afterend', b) } } catch (e) { } return r } }
{ const _o = openSurg; openSurg = function (x) { const r = _o.apply(this, arguments); try { const o = $('sgA10'); if (o) o.remove(); const put = d => { const b = a10Box(a10Of(d), ['surg', 'unc']); if (b && SURG && SURG.id === x.id) $('sgMed').insertAdjacentHTML('beforebegin', b.replace('class="a10box ', 'id="sgA10" class="a10box ')) };
    const d = x.data || {}; if (d.arc) put(d); else if ((d.h || {}).arc) api('get', { id: x.id }, { prio: 'bg' }).then(j => put(j.data)).catch(() => { }) } catch (e) { } return r } }
{ const _r = l2Render; l2Render = function () { const r = _r.apply(this, arguments); try { const J = L2.ord, o = J && J.order, M = o && o.arcMsg; const w = $('l2In'); if (w && M && M.length) { const b = a10Box(M.map(t => ({ t, to: ['lab'] })), ['lab']), c = w.querySelector('.labcard'); if (b && c && !w.querySelector('.a10box')) c.insertAdjacentHTML('afterend', b) } } catch (e) { } return r } }
/* (7) settings: tariffs the paper-file form uses that had no box (values kept with the other prices) */
const A10_TP = [['arc_unc', 'آنکاوری · هر واحد', 500000], ['arc_heal', 'بستن هیلینگ · هر واحد', 160000], ['arc_sgd', 'سرجیکال گاید · هر فک', 0], ['hard', 'جراحی نسج سخت · هر واحد', 0]];
{ const _r = renderPriceSettings; renderPriceSettings = function () { const r = _r.apply(this, arguments); try { const w = $('set_prices'), P = SET.prices || {}; if (w && !w.querySelector('[data-tp="arc_unc"]')) w.insertAdjacentHTML('beforeend', `<h4 class="a10ph">پرونده‌ی جا مانده</h4>` + A10_TP.map(([k, l, d]) => `<div class="grp"><span>${l}</span><input class="price" inputmode="numeric" data-tp="${k}" value="${esc(fmtInput((P[k] || {}).price || (d ? String(d) : '')))}"></div>`).join('')) } catch (e) { } return r } }
