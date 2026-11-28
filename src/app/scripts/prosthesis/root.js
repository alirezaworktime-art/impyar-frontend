/* ---------- m22 (owner, 2026-11-13): (1) implant «Root» = a fifth price group (default 21,000,000) · (2) «تحویل مجدد روکش نهایی» in the prosthesis session and in the paper file, «بستن هیلینگ مجدد» in the paper file — amount optional · (3) «واگذاری پروتز به پزشک دیگر» in the prosthesis file · (4) lab order: a second open order for the same step asks first ---------- */
/* 1: Root */
try { M11_NB.push('rt') } catch (e) { }
try { Object.assign(GRP, { root: 'rt', Root: 'rt', ROOT: 'rt', 'روت': 'rt', 'رووت': 'rt', rt: 'rt' }); GRPN.rt = 'Root' } catch (e) { }
try { I2BG.rt = 'Root' } catch (e) { } try { MRBR.rt = 'Root' } catch (e) { } try { ARB_GL.rt = 'Root'; if (!ARB_GO.includes('rt')) ARB_GO.push('rt') } catch (e) { }
/* 2: second delivery of the final crown — prosthesis session */
const M22_D2 = 'تحویل مجدد روکش نهایی';
try { if (!PK4_TN.deliv2) { PK4_TY.push(['deliv2', M22_D2]); PK4_TN.deliv2 = M22_D2; PK4_TEETH.deliv2 = 1; L5W.deliv2 = M22_D2 } } catch (e) { }
const m22NoRedo = h => String(h).replace(/<div class="(?:grp|a13g)"><span>مجدد بوده؟<\/span><div class="chips">[\s\S]*?<\/div><\/div>/, '');
/* 2: paper file — «تحویل مجدد روکش نهایی» among «مراحل پروتز», «بستن هیلینگ مجدد» beside «بستن هیلینگ» */
try { if (!A13_TN.deliv2) { const i = A13_TY.findIndex(x => x[0] === 'deliv'); A13_TY.splice(i < 0 ? A13_TY.length : i + 1, 0, ['deliv2', M22_D2]); A13_TN.deliv2 = M22_D2; A13_TEETH.deliv2 = 1 } } catch (e) { }
try { if (!A6C.heal2) { const i = A6CAT.findIndex(x => x.k === 'heal'), e = { k: 'heal2', t: 'بستن هیلینگ مجدد', s: i >= 0 ? A6CAT[i].s : 'R', m: 'n', p: () => 0 }; A6CAT.splice(i < 0 ? A6CAT.length : i + 1, 0, e); A6C.heal2 = e } } catch (e) { }
{ const _l = a6Line; a6Line = function (l) { try { if (l && l.k === 'pros' && l.ty === 'deliv2') l.redo = false } catch (e) { } let h = _l.apply(this, arguments); try { if (l && l.k === 'pros' && l.ty === 'deliv2') { h = m22NoRedo(h) } if (l && l.k === 'heal2') h = h.replace('<div class="a6g2">', '<p class="note">هیلینگ بیمار باز شده و دوباره بسته شد. مبلغ اختیاری است (پیش‌فرض صفر).</p><div class="a6g2">') } catch (e) { } return h } }
/* 3: hand the prosthesis over to another doctor */
const m22Doc = j => { const pr = (j && j.pros) || {}; return (pr.pdoc && pr.pdoc.name) || ((j && j.data && j.data.h) || (j && j.h) || {}).doc || '' };
{ const _p = pfPros; pfPros = function (j, r) { let h = _p.apply(this, arguments); try { const pr = j && j.pros; if (pr && pr.stage) { const d = m22Doc(j), pd = pr.pdoc;
  h = `<div class="m22doc"><span>پزشک پروتز: <b>${esc(d || '—')}</b>${pd ? ` <small>(واگذار شده از ${esc(pd.from || '—')} · ${esc(jd(pd.at))}${pd.note ? ' · ' + esc(pd.note) : ''})</small>` : ''}</span>${canPros() ? '<button class="btn sm ghost" type="button" data-m22doc="1">واگذاری به پزشک دیگر</button>' : ''}</div>` + h } } catch (e) { } return h } }
function m22DocSheet() { if (!PF || !PF.j) return; const cur = m22Doc(PF.j); let L = []; try { L = arcDocs() } catch (e) { L = (SET.docs || []).slice() } L = [...new Set(L.filter(x => x && x !== cur && x !== (typeof ARC_DOC !== 'undefined' ? ARC_DOC : '')))];
  fxSheet('m22DocSh', `<h3>واگذاری ادامه‌ی پروتز به پزشک دیگر</h3><p class="note">بیمار: <b>${esc(PF.name || '')}</b> · پزشک فعلی پروتز: <b>${esc(cur || '—')}</b>. جلسه‌ها و مرحله‌های قبلی به نام پزشک قبلی می‌ماند؛ از این به بعد بیمار در فهرست پروتز با نام پزشک تازه دیده می‌شود.</p>
  <label class="f">پزشک تازه *<select id="m22DocSel"><option value="">انتخاب کنید</option>${L.map(n => `<option>${esc(n)}</option>`).join('')}<option value="__o">پزشک دیگر (نام را بنویسید)</option></select></label>
  <label class="f" id="m22DocOW" hidden>نام پزشک<input id="m22DocO" maxlength="80"></label>
  <label class="f">دلیل واگذاری *<input id="m22DocWhy" maxlength="200" placeholder="مثلاً مرخصی پزشک، درخواست بیمار"></label>
  <div class="msg" id="m22DocMsg"></div><div class="btns"><button class="btn" type="button" id="m22DocGo">ثبت واگذاری</button><button class="btn ghost" type="button" id="m22DocNo">انصراف</button></div>`) }
document.addEventListener('change', e => { const t = e.target; if (t && t.id === 'm22DocSel') { const w = $('m22DocOW'); if (w) w.hidden = t.value !== '__o' } });
document.addEventListener('click', async e => { const t = e.target.closest && e.target.closest('button'); if (!t) return;
  if (t.dataset.m22doc) { e.preventDefault(); m22DocSheet(); return }
  if (t.id === 'm22DocNo') { fxClose('m22DocSh'); return }
  if (t.id === 'm22DocGo') { const m = $('m22DocMsg'), sel = $('m22DocSel').value, doc = (sel === '__o' ? $('m22DocO').value : sel).trim(), why = $('m22DocWhy').value.trim(); const err = x => { m.className = 'msg err'; m.textContent = x };
    if (doc.length < 2) return err('پزشک تازه را انتخاب کنید.'); if (why.length < 3) return err('دلیل واگذاری را بنویسید.');
    t.disabled = true; try { const r = await api('prosAct', { id: PF.id, op: 'doc', doc, note: why, by: (typeof USERNAME !== 'undefined' && USERNAME) || ROLE_LBL[ROLE] }); fxClose('m22DocSh'); toast(r && r.evt ? r.evt[0] : 'واگذاری ثبت شد.'); try { if (PF && !$('pfSheet').hidden) refreshFile() } catch (z) { } try { if (!$('viewPros').hidden) loadPros() } catch (z) { } try { pollQ(true) } catch (z) { } }
    catch (x) { err(x.message || 'ثبت نشد.') } finally { t.disabled = false } } });
/* 4: a second open lab order for the same step asks first */
{ const _a = api; api = async function (action, payload = {}, opt = {}) { try { return await _a(action, payload, opt) } catch (e) { const m = action === 'labNew' ? /^DUP2\|([^|]*)\|([\s\S]*)$/.exec((e && e.message) || '') : null; if (!m) throw e;
  const ok = await uxAsk({ title: 'سفارش باز در لابراتوار', msg: m[2], ok: 'بله، سفارش دیگری ثبت شود', cancel: 'نه، ثبت نشود' }); if (!ok) throw new Error('سفارش تازه ثبت نشد؛ سفارش شماره‌ی ' + m[1] + ' هنوز باز است.');
  return await _a(action, Object.assign({}, payload || {}, { dup2: 1 }), opt) } } }
