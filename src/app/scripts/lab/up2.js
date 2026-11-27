/* ---------- up2: بارگذاری فایل (درخواست مالک ۱۸ آبان) — (۱) خطای بارگذاری فایل لاب دیگر پنهان نمی‌ماند: فراخوان خطا را می‌گیرد و «بارگذاری شد» فقط وقتی همه رسیدند؛
   (۲) اسکن داخل دهانی (STL، PLY، OBJ، ZIP، RAR، 7Z، DCM تا ۱۲۰ مگ) در «تصاویر» پرونده: بارگذاری تکه‌تکه، فهرست، نمایش سه‌بعدی، دانلود، حذف؛
   (۳) در دستور کار لابراتوار اسکن‌های پرونده تیک می‌خورند و بدون بارگذاری دوباره به سفارش می‌روند. ---------- */
const UP2_RX = /\.(stl|ply|obj|zip|rar|7z|dcm|3oxz|constructioninfo)$/i, UP2_ACC = '.stl,.ply,.obj,.zip,.rar,.7z,.dcm,.3oxz,.constructioninfo';
const UP2 = { c: {}, busy: '', sel: new Set() };
/* (1) a failed file is no longer hidden (l2Upload throws it, see order-sheet-steps-files-returns.js); l2UpFiles reports every failed file */
l2UpFiles = async function (lid, files) { const M = $('l2upM'), k = $('l2fk') ? $('l2fk').value : 'other'; let ok = 0; const bad = [];
  for (const f of files) { try { await l2Upload(lid, f, k, p => { if (M) M.textContent = f.name + ' — ' + fa(Math.round(p * 100)) + '٪' }); ok++ } catch (e) { bad.push(f.name + ': ' + e.message) } }
  if (M) M.textContent = ''; if (ok) toast(fa(ok) + ' فایل بارگذاری شد.'); if (bad.length) alertMsg('بارگذاری نشد:\n' + bad.join('\n')); l2Load(lid, true); if (ROLE === 'lab') pollLab(true) };
/* (2) scans in the patient file */
async function up2Put(pid, file, onp) { if (!UP2_RX.test(file.name)) throw new Error('نوع فایل اسکن نیست'); if (file.size > 120 * 1024 * 1024) throw new Error('حجم بیش از ۱۲۰ مگابایت است');
  let buf = new Uint8Array(await file.arrayBuffer()), gz = 0;
  if (window.CompressionStream && !/\.(zip|rar|7z)$/i.test(file.name)) { try { const z = new Uint8Array(await new Response(new Blob([buf]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()); if (z.length < buf.length * 0.92) { buf = z; gz = 1 } } catch (e) { } }
  const CH = 1050000, n = Math.max(1, Math.ceil(buf.length / CH)); const b = await api('labFile', { op: 'begin', pid, kind: 'scan', name: file.name, size: file.size, gz, n, by: USERNAME || ROLE_LBL[ROLE] });
  for (let i = 0; i < n; i++) { const d = await l2B64(buf.subarray(i * CH, (i + 1) * CH)); let ok = false, err = null; for (let t = 0; t < 3 && !ok; t++) { try { await api('labFile', { op: 'chunk', fid: b.id, i, d }, { timeout: 120000 }); ok = true } catch (e) { err = e; await new Promise(r => setTimeout(r, 1500)) } } if (!ok) throw err; if (onp) onp((i + 1) / n) } }
async function up2Load(pid, force) { const c = UP2.c[pid]; if (!force && c && Date.now() - c.at < 20000) return c.files; const j = await api('labFile', { op: 'plist', pid }, { prio: 'bg' }); UP2.c[pid] = { at: Date.now(), files: (j.files || []).filter(f => f.done) }; return UP2.c[pid].files }
const up2Sz = b => b >= 1048576 ? fa(Math.round(b / 104857.6) / 10) + ' مگ' : fa(Math.max(1, Math.round(b / 1024))) + ' ک';
function up2HTML(pid) { const c = UP2.c[pid], F = c ? c.files : null, can = ROLE !== 'manager' && ROLE !== 'lab';
  return `<div class="grp up2" id="up2Box"><span>اسکن داخل دهانی (STL، PLY، OBJ، ZIP، RAR، 7Z، DCM — تا ۱۲۰ مگ)</span>
    ${F == null ? '<div class="note">در حال بارگذاری فهرست…</div>' : F.length ? `<div class="list">${F.map(f => `<div class="item up2f"><div class="pinfo"><b dir="ltr">${esc(f.name)}</b><div class="meta">${up2Sz(f.size)} · ${esc(jd(f.at))}${f.by ? ' · ' + esc(f.by) : ''}</div></div><div class="acts">${/\.(stl|ply)$/i.test(f.name) ? `<button type="button" class="btn sm main" data-up2v="${esc(f.id)}">نمایش سه‌بعدی</button>` : ''}<button type="button" class="btn sm ghost" data-up2d="${esc(f.id)}">دانلود</button>${can ? `<button type="button" class="btn sm ghost danger" data-up2x="${esc(f.id)}">حذف</button>` : ''}</div></div>`).join('')}</div>${F.filter(f => /\.(stl|ply)$/i.test(f.name)).length > 1 ? `<div class="acts"><button type="button" class="btn sm ghost" data-up2v="all">نمایش همه با هم</button></div>` : ''}` : '<div class="note">هنوز اسکنی گذاشته نشده.</div>'}
    ${can ? `<div class="btns"><label class="btn ghost${UP2.busy ? ' disabled' : ''}">🦷 افزودن فایل اسکن<input type="file" id="up2In" multiple hidden accept="${UP2_ACC}"${UP2.busy ? ' disabled' : ''}></label><span class="note" id="up2Msg">${esc(UP2.busy || '')}</span></div>` : ''}</div>` }
function up2Mount() { const d = $('fx3Drop'); if (!d || !PF || !PF.id || !d.closest('#pfSheet')) return; const o = $('up2Box'); if (o) o.remove(); let at = d; const nx = d.nextElementSibling; if (nx && nx.classList.contains('note')) at = nx; at.insertAdjacentHTML('afterend', up2HTML(PF.id));
  ['imgIn', 'imgScan'].forEach(k => { const i = $(k); if (i && !/\.stl/.test(i.accept)) i.accept += ',' + UP2_ACC });
  const pid = PF.id, c = UP2.c[pid]; if (!c || Date.now() - c.at > 20000) up2Load(pid).then(() => { if (PF && PF.id === pid && $('up2Box')) $('up2Box').outerHTML = up2HTML(pid) }).catch(() => { }) }
async function up2Upload(files) { if (!PF || !PF.id) return; const pid = PF.id, ok = [], bad = [];
  for (let i = 0; i < files.length; i++) { const f = files[i]; try { await up2Put(pid, f, p => { UP2.busy = `${f.name} — ${fa(Math.round(p * 100))}٪ (${fa(i + 1)} از ${fa(files.length)})`; const m = $('up2Msg'); if (m) m.textContent = UP2.busy }); ok.push(f.name) } catch (e) { bad.push(f.name + ': ' + e.message) } }
  UP2.busy = ''; try { await up2Load(pid, true) } catch (e) { } if (PF && PF.id === pid && $('up2Box')) $('up2Box').outerHTML = up2HTML(pid);
  if (ok.length) toast(fa(ok.length) + ' فایل اسکن در پرونده ثبت شد.'); if (bad.length) alertMsg('بارگذاری نشد:\n' + bad.join('\n')) }
{ const _f = renderFile; renderFile = function () { const r = _f.apply(this, arguments); try { up2Mount() } catch (e) { } return r } }
/* the photo inputs and the drop box send scans here, pictures/PDF to «تصاویر» as before */
{ const _u = imgUpload; imgUpload = async function (files) { const S = [...files].filter(f => UP2_RX.test(f.name)), R = [...files].filter(f => !UP2_RX.test(f.name)); if (S.length) await up2Upload(S); if (R.length) return _u.call(this, R) } }
document.addEventListener('change', e => { const t = e.target; if (t && t.id === 'up2In' && t.files && t.files.length && !UP2.busy) { const F = [...t.files]; t.value = ''; up2Upload(F) } });
const up2F = id => { for (const k in UP2.c) { const f = UP2.c[k].files.find(x => x.id === id); if (f) return f } return null };
document.addEventListener('click', async e => { const t = e.target.closest && e.target.closest('[data-up2v],[data-up2d],[data-up2x]'); if (!t) return; e.preventDefault(); e.stopPropagation(); const d = t.dataset;
  if (d.up2v) { const L = (UP2.c[PF.id] || { files: [] }).files.filter(f => /\.(stl|ply)$/i.test(f.name) && (d.up2v === 'all' || f.id === d.up2v)); if (L.length) openViewer(L.map(f => ({ id: f.id, name: f.name, label: 'اسکن پرونده', get: async onp => (await l2Fetch(f, onp)).arrayBuffer() })), 'اسکن‌های پرونده'); return }
  if (d.up2d) { const f = up2F(d.up2d); if (!f) return; t.disabled = true; try { downloadBlob(await l2Fetch(f, p => { t.textContent = fa(Math.round(p * 100)) + '٪' }), f.name) } catch (x) { alertMsg(x.message) } finally { t.disabled = false; t.textContent = 'دانلود' } return }
  if (d.up2x) { const f = up2F(d.up2x); if (!f || !(await uxConfirm('فایل «' + f.name + '» از پرونده حذف شود؟'))) return; try { await api('labFile', { op: 'del', fid: f.id }); await up2Load(PF.id, true); $('up2Box').outerHTML = up2HTML(PF.id); toast('حذف شد.') } catch (x) { alertMsg(x.message) } } }, true);
/* (3) the lab work order: tick the file's scans; they go to the order after it is made */
{ const _f = loForm; loForm = function (j) { let h = _f.apply(this, arguments); try { const pid = PF && PF.id, F = pid && UP2.c[pid] ? UP2.c[pid].files : [];
    if (pid && !UP2.c[pid]) up2Load(pid).then(f => { if (f.length && PF && PF.id === pid && LO) { try { loRead() } catch (x) { } renderFile() } }).catch(() => { });
    if (F.length) h = h.replace('<div class="msg" id="loMsg"></div>', `<div class="grp up2pick"><span>اسکن‌های پرونده برای این سفارش (بدون بارگذاری دوباره)</span><div class="chips">${F.map(f => `<button type="button" class="chip" data-up2a="${esc(f.id)}" aria-pressed="${UP2.sel.has(f.id)}" dir="ltr">${esc(f.name)}</button>`).join('')}</div></div><div class="msg" id="loMsg"></div>`) } catch (e) { } return h } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-up2a]'); if (!t) return; e.preventDefault(); e.stopPropagation(); const id = t.dataset.up2a; if (UP2.sel.has(id)) UP2.sel.delete(id); else UP2.sel.add(id); t.setAttribute('aria-pressed', String(UP2.sel.has(id))) }, true);
{ const _a = api; api = function (action, payload) { const p = _a.apply(this, arguments);
  if ((action === 'labNew' || action === 'prosSess') && payload && payload.order && payload.lid && UP2.sel.size) { const sel = [...UP2.sel], lid = payload.lid;
    return Promise.resolve(p).then(async r => { if (r && r.ok !== false) { UP2.sel.clear(); const bad = []; for (const fid of sel) { try { await _a('labFile', { op: 'attach', fid, lid }) } catch (e) { const f = up2F(fid); bad.push((f ? f.name : '') + ': ' + e.message) } } if (bad.length) alertMsg('این اسکن‌ها به سفارش نرفتند:\n' + bad.join('\n')) } return r }) }
  return p } }
{ const _o = openFile; openFile = function () { UP2.sel.clear(); return _o.apply(this, arguments) } }
