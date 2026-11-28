/* ---------- oc2: «سایر کلینیک‌ها» — treatment per patient like the surgery day (tooth chart, implant per tooth, sessions, prosthesis stages), priced by the clinic's own tariff ---------- */
const OC2 = { seg: 'tr', pats: [], q: '', pat: null, v: null, f: null, cl: '', impK: '', impSid: '', m: {}, catK: '' };
const oc2PS = () => (OC.d && OC.d.ps) || [], oc2G = () => (OC.d && OC.d.g) || [];
const oc2PSN = s => (oc2PS().find(x => x[0] === s) || [s, s])[1];
const oc2Pr = (c, k) => { const s = (c.svc || []).find(v => v.k === k); return s ? (Number(s.p) || 0) : 0 };
/* seg «درمان بیمار» beside the existing ones (same bar, same style) */
/* (ocSegBar and the «tr» branch of ocRender: in finance/oc1-surgeon-s-work-other.js) */
/* ===== list of patients of the chosen clinic ===== */
/* oc2Load / oc2Open: oc2 base replaced by oc4 (cached list / patient shown first, refreshed in the background) */
async function oc2Load(){const cl=OC2.cl||(ocMine()[0]||{}).id||'';OC2.cl=cl;const key=cl+'|'+(OC2.q||'');OC2.pc=OC2.pc||{};
    if(OC2.pc[key]&&!OC2.pat){OC2.pats=OC2.pc[key];ocRender()}
    try{const j=await api('oc',{op:'pats',clinic:cl,q:OC2.q});OC2.pats=j.pats||[];OC2.pc[key]=OC2.pats}catch(e){OC2.pats=OC2.pc[key]||[]}
    if(!OC2.pat)ocRender()}
async function oc2Open(id){OC2.vc=OC2.vc||{};const c=OC2.vc[id];
    if(c){OC2.pat=c.pat;OC2.v=c;OC2.f=null;ocRender();window.scrollTo(0,0)}
    try{const j=await api('oc',{op:'pat',id});if(!j||!j.ok)throw new Error((j&&j.error)||'خطا');OC2.vc[id]=j;if(OC2.pat&&OC2.pat.id!==id&&c)return;OC2.pat=j.pat;OC2.v=j;if(!c)OC2.f=null;ocRender();if(!c)window.scrollTo(0,0)}
    catch(e){if(!c)alertMsg(e.message)}}
function oc2HTML() {
  const mine = ocMine(); if (!mine.length) return `<div class="card"><p class="note">هیچ کلینیک فعالی انتخاب نشده است.</p><button class="btn" type="button" data-ocseg="cl">انتخاب کلینیک‌ها</button></div>`;
  if (OC2.pat) return oc2PatHTML();
  if (OC2.f) return oc2SesHTML();
  const c = ocCl(OC2.cl);
  return `<div class="card"><h2>درمان بیمار — ${esc(c.name)}</h2>
  <div class="oc-lbl">کلینیک</div><div class="oc-chips">${mine.map(m => `<button type="button" class="chip" data-oc2cl="${esc(m.id)}" aria-pressed="${m.id === OC2.cl}">${esc(m.name)}</button>`).join('')}</div>
  <div class="fields"><label class="f">جست‌وجوی بیمار<input id="oc2q" type="search" value="${esc(OC2.q)}" placeholder="نام بیمار"></label></div>
  <div class="btns"><button class="btn main" type="button" id="oc2New">+ جلسه‌ی تازه (بیمار جدید یا قبلی)</button></div>
  <div class="oc-list oc2-pats">${OC2.pats.length ? OC2.pats.map(p => `<button type="button" class="oc2-pat" data-oc2pat="${esc(p.id)}"><b>${esc(p.name)}</b><small>${fa(p.ns)} جلسه${p.stage ? ' · پروتز: ' + esc(oc2PSN(p.stage)) : ''}</small></button>`).join('') : '<div class="empty">بیماری ثبت نشده. با «جلسه‌ی تازه» اولین بیمار را ثبت کنید.</div>'}</div></div>`
}
/* ===== session form: tooth chart (same classes as the surgery day) + implant sheet + services ===== */
/* oc2NewSes: oc2 base (session form) replaced by oc3 (name only → patient page with three tabs) and id1 (optional phone + same-name question) */
function oc2NewSes() { const c = ocCl(OC2.cl); const s = mkSheet('oc3NewSh', `<h3>بیمار جدید — ${esc(c.name)}</h3><div class="fields"><label class="f">نام و نام خانوادگی *<input id="oc3nm" list="oc2names"><datalist id="oc2names">${OC2.pats.map(p => `<option value="${esc(p.name)}">`).join('')}</datalist></label><label class="f">موبایل یا شماره‌ی پرونده (اختیاری)<input id="oc3ph" inputmode="tel" class="ltr"></label></div><div class="msg" id="oc3nmMsg"></div><div class="btns"><button class="btn main" type="button" id="oc3nmOk">ادامه</button><button class="btn ghost" type="button" id="oc3nmX">انصراف</button></div>`); s.hidden = false; setTimeout(() => { try { $('oc3nm').focus() } catch (x) { } }, 50);
  const go = async (b, pick, same) => { const nm = $('oc3nm').value.trim(), m = $('oc3nmMsg'); if (!nm) { m.className = 'msg err'; m.textContent = 'نام بیمار را بنویسید.'; return } b.disabled = true;
    try { const r = await api('oc', { op: 'patNew', clinic: OC2.cl, name: nm, phone: ($('oc3ph') || {}).value || '', pick: pick || '', same: same || '' }); const d = r.dup; if (d && d.length) { b.disabled = false; m.className = 'msg warn'; m.innerHTML = `بیماری با همین نام هست: ${d.map(x => `<b>${esc(x.name)}</b>${x.phone ? ' (' + esc(faD(x.phone)) + ')' : ''}`).join('، ')}. همان بیمار است؟ <span class="btns" style="display:inline-flex;gap:6px"><button class="btn sm" type="button" data-id1same="${esc(d[0].id)}">بله، همان بیمار</button><button class="btn sm ghost" type="button" data-id1new="1">نه، بیمار جدید</button></span>`; return } s.hidden = true; oc3Unmount(); OC3.tab = 'plan'; await oc2Open(r.id) }
    catch (err) { b.disabled = false; m.className = 'msg err'; m.textContent = err.message } };
  s.onclick = ev => { const b = ev.target.closest('button'); if (!b) return; if (b.id === 'oc3nmX') { s.hidden = true; return } if (b.id === 'oc3nmOk') go(b, '', ''); else if (b.dataset.id1same) go(b, 'same', b.dataset.id1same); else if (b.dataset.id1new) go(b, 'new', '') } }
function oc2Tooth(k) { const m = OC2.f.imp[k]; return `<button type="button" class="t${m ? ' on' : ''}" data-oc2t="${k}" aria-pressed="${!!m}" title="${m ? esc(GRPN[m.g] + (m.b ? ' ' + m.b : '') + (m.d ? ' ' + m.d + '×' + m.l : '')) : ''}">${fa(k.slice(2))}${m ? `<i class="oc2-dot g-${m.g}"></i>` : ''}</button>` }
function oc2Chart() { let h = '<div class="chart"><div class="chart-in" style="--n:8">'; [['U', 'بالا'], ['L', 'پایین']].forEach(([j, l]) => { let r = '', lf = ''; for (let i = 8; i >= 1; i--) r += oc2Tooth(j + 'R' + i); for (let i = 1; i <= 8; i++) lf += oc2Tooth(j + 'L' + i); h += `<div class="jaw"><span class="jlabel">${l}</span><div class="half">${r}</div><span class="mid"></span><div class="half">${lf}</div></div>` }); return h + '<div class="sides"><span>راست بیمار</span><span>چپ بیمار</span></div></div></div>' }
function oc2SesAmt() { const f = OC2.f, c = ocCl(f.clinic); let a = 0; Object.keys(f.imp).forEach(k => a += oc2Pr(c, 'bp_' + f.imp[k].g)); (c.svc || []).filter(s => !s.fixed).forEach(s => a += (f.q[s.k] || 0) * (Number(s.p) || 0)); return a }
function oc2SesHTML() {
  const f = OC2.f, c = ocCl(f.clinic), svc = (c.svc || []).filter(s => !s.fixed && !/^imp$/i.test(s.k) && !/^(imp|implant|ایمپلنت)$/i.test(String(s.n || '').trim())), imps = Object.keys(f.imp).sort();
  const zero = [...new Set(imps.map(k => f.imp[k].g).filter(g => !oc2Pr(c, 'bp_' + g)))];
  return `<div class="card oc-add"><div class="oc2-h"><button class="btn sm ghost" type="button" id="oc2SesBack">→ برگشت</button><h2>${f.id ? 'ویرایش جلسه' : 'جلسه‌ی تازه'} <small>${esc(c.name)}</small></h2></div>
  <div class="fields"><label class="f">بیمار${f.pat ? '' : ' *'}<input id="oc2name" value="${esc(f.name)}" ${f.pat ? 'readonly' : 'placeholder="نام و نام خانوادگی"'} list="oc2names"><datalist id="oc2names">${OC2.pats.map(p => `<option value="${esc(p.name)}">`).join('')}</datalist></label><label class="f">تاریخ<input id="oc2day" data-jd inputmode="numeric" value="${esc(jDay(f.day))}"></label></div>
  <div class="oc-lbl">ایمپلنت — روی دندان بزنید</div>${oc2Chart()}
  ${imps.length ? `<div class="oc2-teeth">${imps.map(k => `<span class="oc2-t" data-oc2t="${k}"><b>${esc(k)}</b> ${esc(GRPN[f.imp[k].g] || '')}${f.imp[k].b ? ' · ' + esc(f.imp[k].b) : ''}${f.imp[k].d ? ' · ' + esc(f.imp[k].d) + '×' + esc(f.imp[k].l) : ''} <small>${ocR(oc2Pr(c, 'bp_' + f.imp[k].g))}</small></span>`).join('')}</div>` : ''}
  ${zero.length ? `<p class="oc-warn">تعرفه‌ی ایمپلنت ${zero.map(g => GRPN[g]).join('، ')} برای ${esc(c.name)} صفر است؛ در «کلینیک‌ها و تعرفه‌ها» پر کنید.</p>` : ''}
  <div class="oc-lbl">کارهای دیگر این جلسه <small class="note">(ایمپلنت از روی دندان‌ها حساب می‌شود)</small></div><div class="oc-svc oc2-svc">${svc.map(s => { const q = f.q[s.k] || 0; return `<div class="oc-row${q ? ' on' : ''}"><div class="oc-sn"><b>${esc(s.n)}</b><small>${ocR(s.p)}</small></div><div class="oc-cc"><button type="button" class="oc-k" data-oc2q="${esc(s.k)}" data-d="-1" aria-label="کمتر">−</button><b>${fa(q)}</b><button type="button" class="oc-k" data-oc2q="${esc(s.k)}" data-d="1" aria-label="بیشتر">+</button></div></div>` }).join('') || '<div class="empty">این کلینیک خدمت تعریف‌شده ندارد.</div>'}</div>
  <div class="fields"><label class="f">توضیح<input id="oc2note" maxlength="400" value="${esc(f.note)}"></label></div>
  <label class="chk"><input type="checkbox" id="oc2last" ${f.last ? 'checked' : ''}> این آخرین جلسه است (پایان جراحی)</label>
  <div class="oc-sub">جمع این جلسه: <b id="oc2Sum">${ocR(oc2SesAmt())}</b></div>
  <div class="msg" id="oc2Msg" role="alert"></div>
  <div class="btns"><button class="btn main" type="button" id="oc2SesSave">ثبت جلسه</button><button class="btn ghost" type="button" id="oc2SesBack2">انصراف</button></div></div>`
}
/* ===== implant sheet for one tooth: brand group → brand (clinic catalog) → diameter / length chips, like the surgery day ===== */
function oc2ImpSheet(k, keep) {
  /* a redraw after a chip click keeps the choices made so far (OC2.m); only the first open seeds from the saved tooth */
  OC2.impK = k; const f = OC2.f, m = keep && OC2.m ? OC2.m : Object.assign({ g: '', b: '', d: '', l: '' }, f.imp[k] || {}); OC2.m = m;
  const cat = (OC.d.catalog || []), G = oc2G(), bl = cat.filter(x => x.g === m.g), cur = bl.find(x => x.b === m.b) || bl[0] || null;
  if (cur && !m.b) m.b = cur.b;
  const ds = cur ? [...new Set(cur.d || [])] : [], ls = cur ? [...new Set((cur.dl && cur.dl[m.d]) || cur.l || [])] : [];
  const chips = (arr, key, val) => arr.map(x => `<button type="button" class="chip" data-oc2m="${key}" data-v="${esc(x)}" aria-pressed="${String(x) === String(val)}">${esc(String(x))}</button>`).join('') + `<button type="button" class="chip" data-oc2m="${key}" data-v="__other" aria-pressed="false">سایر</button>`;
  const s = mkSheet('oc2ImpSh', `<h3>ایمپلنت دندان ${esc(k)}</h3>
   <div class="grp"><span>گروه برند *</span><div class="chips">${G.map(([g, n]) => `<button type="button" class="chip" data-oc2m="g" data-v="${g}" aria-pressed="${g === m.g}">${esc(n)}</button>`).join('')}</div></div>
   ${m.g ? `<div class="grp"><span>برند</span><div class="chips">${bl.length ? bl.map(x => `<button type="button" class="chip" data-oc2m="b" data-v="${esc(x.b)}" aria-pressed="${x.b === m.b}">${esc(x.b)}${x.sys ? ' · ' + esc(x.sys) : ''}</button>`).join('') : '<small class="note">برندی در فهرست این گروه نیست؛ دستی بنویسید.</small>'}<input class="oc2-oth" data-oc2oth="b" placeholder="برند دیگر" value="${bl.some(x => x.b === m.b) ? '' : esc(m.b)}"></div></div>
   <div class="grp"><span>قطر</span><div class="chips rcs">${chips(ds, 'd', m.d)}</div><input class="oc2-oth ltr" data-oc2oth="d" inputmode="decimal" placeholder="قطر" value="${ds.map(String).includes(String(m.d)) ? '' : esc(m.d)}"></div>
   <div class="grp"><span>طول</span><div class="chips rcs">${chips(ls, 'l', m.l)}</div><input class="oc2-oth ltr" data-oc2oth="l" inputmode="decimal" placeholder="طول" value="${ls.map(String).includes(String(m.l)) ? '' : esc(m.l)}"></div>` : ''}
   <div class="msg" id="oc2ImpMsg" role="alert"></div>
   <div class="btns"><button class="btn main" type="button" id="oc2ImpOk">ثبت</button>${f.imp[k] ? '<button class="btn ghost danger" type="button" id="oc2ImpRm">برداشتن این دندان</button>' : ''}<button class="btn ghost" type="button" id="oc2ImpX">انصراف</button></div>`);
  s.hidden = false;
}
function oc2ImpRedraw() { const sh = $('oc2ImpSh'); if (sh && !sh.hidden) oc2ImpSheet(OC2.impK, true) }
/* ===== post-render + events ===== */
function oc2Post() { const q = $('oc2q'); if (q) q.oninput = e => { OC2.q = e.target.value.trim(); clearTimeout(OC2._t); OC2._t = setTimeout(oc2Load, 250) } }
document.addEventListener('click', async e => {
  const t = e.target.closest && e.target.closest('[data-ocseg="tr"],[data-oc2cl],[data-oc2pat],#oc2New,#oc2Back,#oc2SesNew,#oc2SesBack,#oc2SesBack2,[data-oc2t],[data-oc2q],#oc2SesSave,[data-oc2sed],[data-oc2sdel],#oc2ProsGo,[data-oc2pdel],[data-oc2m],#oc2ImpOk,#oc2ImpRm,#oc2ImpX'); if (!t) return;
  const d = t.dataset;
  if (d.ocseg === 'tr') { OC.seg = 'tr'; OC2.pat = null; OC2.f = null; e.stopImmediatePropagation(); await oc2Load(); return }
  if (d.oc2cl) { OC2.cl = d.oc2cl; OC2.pat = null; OC2.f = null; await oc2Load(); return }
  if (d.oc2pat) { await oc2Open(d.oc2pat); return }
  if (t.id === 'oc2New') { oc2NewSes(null); return }
  if (t.id === 'oc2Back') { OC2.pat = null; OC2.v = null; await oc2Load(); return }
  if (t.id === 'oc2SesNew') { if (OC2.v && OC2.v.last && !(await uxConfirm('برای این بیمار «آخرین جلسه» ثبت شده. جلسه‌ی دیگری اضافه شود؟', 'بله، اضافه شود', false, 'جلسه‌ی تازه'))) return; oc2NewSes(OC2.pat); return }
  if (t.id === 'oc2SesBack' || t.id === 'oc2SesBack2') { if (OC2.f && (Object.keys(OC2.f.imp).length || Object.values(OC2.f.q).some(Boolean)) && !(await uxConfirm('این جلسه ثبت نشده و پاک می‌شود. برگردید؟', 'بله، برگرد', true, 'جلسه‌ی ثبت‌نشده'))) return; OC2.f = null; if (OC2.pat) await oc2Open(OC2.pat.id); else ocRender(); return }
  if (d.oc2t !== undefined && OC2.f && !t.closest('.sheet')) { oc2ImpSheet(d.oc2t); return }
  if (d.oc2q && OC2.f) { const q = Math.max(0, Math.min(999, (OC2.f.q[d.oc2q] || 0) + Number(d.d))); OC2.f.q[d.oc2q] = q; oc2Read(); ocRender(); return }
  if (d.oc2m !== undefined) { const m = OC2.m, key = d.oc2m, v = d.v; if (v === '__other') { const i = document.querySelector(`[data-oc2oth="${key}"]`); if (i) i.focus(); return } if (key === 'g') { m.g = v; m.b = ''; m.d = ''; m.l = '' } else if (key === 'b') { m.b = v; m.d = ''; m.l = '' } else if (key === 'd') { m.d = v; m.l = '' } else m[key] = v; oc2ImpRedraw(); return }
  if (t.id === 'oc2ImpOk') { const m = OC2.m; document.querySelectorAll('#oc2ImpSh [data-oc2oth]').forEach(i => { if (i.value.trim()) m[i.dataset.oc2oth] = i.value.trim() }); const msg = $('oc2ImpMsg'); if (!m.g) { msg.className = 'msg err'; msg.textContent = 'گروه برند را انتخاب کنید.'; return } OC2.f.imp[OC2.impK] = { g: m.g, b: m.b || '', d: m.d || '', l: m.l || '' }; $('oc2ImpSh').hidden = true; oc2Read(); ocRender(); return }
  if (t.id === 'oc2ImpRm') { delete OC2.f.imp[OC2.impK]; $('oc2ImpSh').hidden = true; oc2Read(); ocRender(); return }
  if (t.id === 'oc2ImpX') { $('oc2ImpSh').hidden = true; return }
  if (t.id === 'oc2SesSave') { await oc2SesSave(t); return }
  if (d.oc2sed) { const s = OC2.v.ses.find(x => x.id === d.oc2sed); if (!s) return; OC2.f = { id: s.id, pat: OC2.pat.id, name: OC2.pat.name, clinic: s.clinic, day: s.day, imp: JSON.parse(JSON.stringify(s.imp)), q: Object.fromEntries(s.items.map(i => [i.k, i.q])), last: !!s.last, note: s.note || '' }; ocRender(); return }
  if (d.oc2sdel) { if (!(await uxConfirm('این جلسه و مبلغش از کارکرد حذف شود؟', 'بله، حذف شود', true, 'حذف جلسه'))) return; try { await api('oc', { op: 'sesDel', id: d.oc2sdel }); toast('جلسه حذف شد.'); OC.d = null; await ocLoad(); await oc2Open(OC2.pat.id) } catch (err) { alertMsg(err.message) } return }
  if (t.id === 'oc2ProsGo') { t.disabled = true; const m = $('oc2Msg'); try { const r = await api('oc', { op: 'pros', x: { pat: OC2.pat.id, stage: d.stage, day: parseJ(($('oc2pday') || {}).value || '') || tDay(), note: ($('oc2pnote') || {}).value || '' } }); toast('مرحله ثبت شد.' + (r.zero ? ' (تعرفه‌ی این مرحله صفر است)' : '')); OC.d = null; await ocLoad(); await oc2Open(OC2.pat.id) } catch (err) { m.className = 'msg err'; m.textContent = err.message; t.disabled = false } return }
  if (d.oc2pdel) { if (!(await uxConfirm('آخرین مرحله‌ی پروتز برداشته شود؟', 'بله، بردار', true, 'برداشتن مرحله'))) return; try { await api('oc', { op: 'prosDel', id: d.oc2pdel }); OC.d = null; await ocLoad(); await oc2Open(OC2.pat.id) } catch (err) { alertMsg(err.message) } return }
}, true);
function oc2Read() { const f = OC2.f; if (!f) return; const n = $('oc2name'), dy = $('oc2day'), nt = $('oc2note'), ls = $('oc2last'); if (n && !f.pat) f.name = n.value; if (dy) { const v = parseJ(dy.value.trim()); if (v) f.day = v } if (nt) f.note = nt.value; if (ls) f.last = ls.checked }
document.addEventListener('input', e => { const i = e.target; if (!OC2.f || !i || !i.id) return; if (['oc2name', 'oc2day', 'oc2note'].includes(i.id)) oc2Read(); if (i.id === 'oc2last') oc2Read() }, true);
async function oc2SesSave(bt) {
  oc2Read(); const f = OC2.f, m = $('oc2Msg'); if (!f.pat && !f.name.trim()) { m.className = 'msg err'; m.textContent = 'نام بیمار را بنویسید.'; return }
  if (!Object.keys(f.imp).length && !Object.values(f.q).some(Boolean)) { m.className = 'msg err'; m.textContent = 'دست‌کم یک دندان ایمپلنت یا یک خدمت ثبت کنید.'; return }
  const c = ocCl(f.clinic); if (!f.sid) f.sid = ocNewId('s');
  bt.disabled = true; m.className = 'msg'; m.textContent = 'در حال ثبت…';
  try { const r = await api('oc', { op: 'session', s: { id: f.id || f.sid, clinic: f.clinic, pat: f.pat, name: f.name, day: f.day, imp: f.imp, items: Object.entries(f.q).filter(([, q]) => q).map(([k, q]) => ({ k, q })), last: f.last, note: f.note } });
    toast('جلسه‌ی ' + fa(r.n) + ' ثبت شد — ' + ocR(r.amount) + (r.zero && r.zero.length ? ' (تعرفه‌ی ' + r.zero.join('، ') + ' صفر است)' : '')); OC2.f = null; OC.d = null; await ocLoad(); await oc2Open(r.pat) }
  catch (err) { m.className = 'msg err'; m.textContent = err.message; bt.disabled = false }
}
/* ===== tariff form: the fixed rows (brand groups + prosthesis stages) are shown but their name is not editable ===== */
/* fixed tariff rows (brand groups / prosthesis stages): name read-only, no delete; the price stays editable */
function oc2FixRows(){document.querySelectorAll('.oc-clc').forEach(card=>{const id=card.dataset.ocid,e=OC.edit[id];const svc=e?e.svc:(ocCl(id).svc||[]);card.querySelectorAll('[data-ocsv][data-f="n"]').forEach(i=>{const s=svc[+i.dataset.ocsv];if(!s||!/^(bp_|ps_)/.test(s.k))return;i.readOnly=true;i.title='ردیف ثابت — فقط تعرفه را عوض کنید';const row=i.closest('div');if(row){row.dataset.fixed='1';const del=row.querySelector('[data-ocsvdel]');if(del)del.remove()}})})}
/* (oc2FixRows runs at the end of ocRender, finance/oc1-surgeon-s-work-other.js) */

