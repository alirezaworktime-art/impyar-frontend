
/* ---------- m36 (owner, 2026-11-16): lab cartable by referral. New workbench of our own design: counter tiles + one card per order with the path of its steps
   and one clear next action; «کارهای من» for each person; finish + hand on to the next person; send back to reception; label 90×15 mm; new-work form for
   another clinic without required fields; photo kind of the work order; our own names for the lab menu. ---------- */
const M36 = { tile: '', q: '', stwt: {}, upk: '' };
const m36Fin = s => /ارسال\s*کار\s*نهایی/.test(String((s && s.dname) || ''));
try { Object.assign(L2_FKL, { ophoto: 'عکس دستورکار', pphoto: 'عکس بیمار' }) } catch (e) { }
try { const N = { bench: 'میز کار', 'o/new': 'کار تازه', 'o/all': 'همه‌ی سفارش‌ها', 'o/renewed': 'دوباره‌کاری‌ها', 'o/active': 'سفارش‌های در جریان', 'o/done': 'سفارش‌های تمام‌شده', 'o/edited': 'سفارش‌های تغییرکرده', 'o/del': 'سفارش‌های حذف‌شده', 'o/outs': 'کارهای بیرون‌سپرده', 'd/wt': 'نوع کار', 'd/col': 'رنگ‌ها', 'd/dept': 'دپارتمان‌ها', 'd/proc': 'مسیرهای ساخت', 'd/staff': 'کارمندان', 'd/acct': 'مشتری‌ها (پزشک و کلینیک)', 'd/box': 'جعبه‌ها', 'd/plist': 'تعرفه‌ها', 'a/ledger': 'صورت‌حساب مشتری‌ها', rep: 'گزارش‌ها', set: 'تنظیمات لابراتوار', files: 'فایل‌ها' }, G = { 'سفارشات': 'سفارش‌ها', 'تعاریف': 'تنظیم‌های پایه', 'حسابداری': 'مالی' };
  L5MENU.forEach(g => { if (G[g.g]) g.g = G[g.g]; g.items.forEach(it => { if (N[it[0]]) it[1] = N[it[0]] }) }); Object.assign(L5T, N) } catch (e) { }
(function () { const _a = api; api = function (action, body) {
  try { if (action === 'labStart' && body && body.asg === undefined) { const s = document.getElementById('m36asg'), sh = document.getElementById('l2StSh'); if (s && sh && !sh.hidden && !s.closest('[hidden]')) body.asg = s.value } } catch (e) { }
  const p = _a.apply(this, arguments);
  if (action === 'labList' && p && p.then) p.then(j => { if (j && j.m36 && j.m36.stwt) M36.stwt = j.m36.stwt }).catch(() => { });
  return p } })();

/* ===== rows of the workbench ===== */
function m36Rows() { const me = L2.me || {}, out = [];
  (LB.items || []).filter(x => ['new', 'recv', 'making', 'redo'].includes(x.st) && !(x.data || {}).del).forEach(x => { const S = (x.steps || []).slice().sort((a, b) => a.idx - b.idx), d = x.data || {};
    const cur = S.filter(s => !m36Fin(s) && (s.st === 'acc' || (s.st === 'pend' && l2Av(S, s))));
    const state = x.st === 'new' || x.st === 'recv' ? 'new' : x.st === 'redo' ? 'redo' : (S.length && !cur.length ? 'ready' : (cur.some(s => s.st === 'pend' && !s.asg) ? 'ref' : 'hands'));
    const mine = me.id ? cur.filter(s => s.asg === me.id || s.acc_by === me.id) : [];
    out.push({ x, S, cur, state, mine, back: state === 'ref' && !!d.back && cur.some(s => s.id === d.back.sid && !s.asg), late: cur.some(s => { try { return l2Late(x, s) } catch (e) { return false } }), dueLate: !!x.due && x.due < tDay() }) });
  const O = { ref: 0, redo: 1, new: 2, ready: 3, hands: 4 };
  return out.sort((a, b) => (b.back - a.back) || (O[a.state] - O[b.state]) || String(a.x.due || '9').localeCompare(String(b.x.due || '9')) || (a.x.no - b.x.no)) }
const M36_F = { new: r => r.state === 'new' || r.state === 'redo', ref: r => r.state === 'ref', hands: r => r.state === 'hands', back: r => r.back, ready: r => r.state === 'ready',
  mine: r => r.mine.length > 0, m_new: r => r.mine.some(s => s.st === 'pend'), m_do: r => r.mine.some(s => s.st === 'acc'), m_late: r => r.mine.some(s => { try { return l2Late(r.x, s) } catch (e) { return false } }), all: () => true };
const M36_T = { new: ['کار تازه', 'هنوز دریافت و شروع نشده', 'lapis'], ref: ['منتظر ارجاع', 'باید بگویید کار پیش چه کسی برود', 'warn'], hands: ['در دست کارمندان', 'ارجاع شده و در حال انجام', 'accent'], back: ['برگشت خورده', 'کارمند با دلیل پس فرستاده', 'bad'], ready: ['آماده‌ی خروج', 'ساخت تمام شده؛ ارسال به کلینیک', 'ok'],
  mine: ['کارهای من', 'به خود شما ارجاع شده', 'accent'], m_new: ['تازه رسیده', 'هنوز شروع نکرده‌اید', 'lapis'], m_do: ['در حال انجام', 'شروع کرده‌اید', 'accent'], m_late: ['دیرکرد', 'از مهلت گذشته', 'bad'], all: ['همه', 'همه‌ی سفارش‌های باز', 'muted'] };
function m36Step(r, s) { const cur = r.cur.includes(s), back = r.back && (r.x.data.back || {}).sid === s.id;
  let c = 'w', t = 'در نوبت' + (s.asg_name ? ' · ' + s.asg_name : '');
  if (s.st === 'done') { c = 'd'; t = 'انجام شد' + (s.done_name && s.done_name !== 'سامانه' ? ' · ' + s.done_name : '') }
  else if (s.st === 'skip') { c = 'd'; t = 'رد شد' }
  else if (m36Fin(s)) { t = 'با پذیرش' }
  else if (back) { c = 'b'; t = 'برگشت خورده' }
  else if (cur && s.st === 'acc') { c = 'c'; t = 'در حال انجام · ' + (s.acc_name || s.asg_name || '') }
  else if (cur && s.asg) { c = 'c'; t = 'ارجاع به ' + (s.asg_name || '') }
  else if (cur) { c = 'n'; t = 'انجام‌دهنده تعیین نشده' }
  let out = ''; try { const o = typeof m27O === 'function' && !(s.st === 'done' || s.st === 'skip') ? m27O(r.x, s.id) : null; if (o) out = `<span class="pill wait m27o" title="${l6Esc(o.note || '')}">برون‌سپاری: ${l6Esc(o.co)}</span>` } catch (e) { }
  return `<div class="m36st m36st-${c}"><b>${fa(r.S.filter(t => (t.part || '') === (s.part || '')).indexOf(s) + 1)}. ${l6Esc(s.dname)}</b><span>${l6Esc(t)}</span>${out}</div>` }
function m36Card(r) { const x = r.x, d = x.data || {}, me = L2.me || {}, rec = l8Rec(), sup = l5Sup(), id = l6Esc(x.id), B = [], many = r.cur.length > 1, pl = s => { const q = s.part && (d.parts || []).find(v => v.p === s.part); return q ? q.label : '' }, sfx = s => many ? ' «' + l6Esc(s.dname) + (pl(s) ? ' · ' + l6Esc(pl(s)) : '') + '»' : '';
  if (rec && (r.state === 'new' || r.state === 'redo')) B.push(`<button type="button" class="btn m36b-lapis" data-l2start="${id}">${r.state === 'redo' && r.S.length ? 'شروع اصلاح' : 'دریافت و شروع کار'}</button>`);
  if (rec && r.state === 'ready') B.push(`<button type="button" class="btn m36b-ok" data-l2send="${id}">خروج و ارسال به کلینیک</button>`, `<button type="button" class="btn ghost" data-l2lbl="${id}">چاپ برچسب</button>`);
  r.cur.forEach(s => { const a = `data-lid="${id}" data-sid="${l6Esc(s.id)}"`, mP = me.id && s.st === 'pend' && s.asg === me.id, mA = me.id && s.st === 'acc' && s.acc_by === me.id;
    if (mP) B.push(`<button type="button" class="btn m36b-lapis" data-m36="acc" ${a}>شروع کار${sfx(s)}</button>`);
    if (mA) B.push(`<button type="button" class="btn m36b-ok" data-m36="done" ${a}>پایان و فرستادن به نفر بعد${sfx(s)}</button>`);
    if (mP || mA) B.push(`<button type="button" class="btn ghost m36b-bad" data-m36="back" ${a}>برگشت به پذیرش${sfx(s)}</button>`);
    if (rec && s.st === 'pend' && !s.asg) B.push(`<button type="button" class="btn m36b-warn" data-m36="ref" ${a}>${r.back ? 'ارجاع دوباره' : 'ارجاع به انجام‌دهنده'}${sfx(s)}</button>`);
    if (sup && !mP && !mA && s.asg && s.st === 'pend') B.push(`<button type="button" class="btn ghost" data-m36="accfor" ${a}>شروع به نام ${l6Esc(s.asg_name || '')}</button>`);
    if (sup && !mA && s.st === 'acc') B.push(`<button type="button" class="btn ghost" data-m36="done" ${a}>ثبت پایان${sfx(s)}</button>`);
    if (rec && s.asg && !mP && !mA) B.push(`<button type="button" class="btn ghost" data-m36="ref" ${a}>تغییر انجام‌دهنده${sfx(s)}</button>`) });
  B.push(`<button type="button" class="btn ghost" data-l4open="${id}">برگه و فایل‌ها</button>`);
  if (rec) B.push(`<button type="button" class="btn ghost m36more" data-l6b="more" data-lid="${id}" data-sid="${l6Esc((r.cur[0] || {}).id || '')}" aria-label="کارهای بیشتر">بیشتر</button>`);
  const T = d.teeth || [], who = [d.acctName || d.clinic || '', x.doc || d.doc || ''].filter(Boolean).join(' · '), mineL = r.mine.length ? `<div class="m36mine">مرحله‌ی شما: <b>${r.mine.map(s => l6Esc(s.dname) + (pl(s) ? ' (' + l6Esc(pl(s)) + ')' : '')).join('، ')}</b>${r.mine.some(s => (l2Dept(s.dept).flags || {}).upload) ? ' · فایل لازم است' : ''}</div>` : '';
  const bk = r.back ? `<div class="m36bk"><b>برگشت از ${l6Esc(d.back.from || '')} (${l6Esc(d.back.dname || '')}):</b> ${l6Esc(d.back.text || '')}</div>` : (r.state === 'redo' && d.redoNote ? `<div class="m36bk"><b>برگشت از کلینیک:</b> ${l6Esc(d.redoNote)}</div>` : '');
  return `<article class="m36card${r.late || r.dueLate ? ' m36late' : ''}" data-m36card="${id}"><div class="m36hd"><div class="m36id"><b class="m36no tnum">#${l2No(x.no)}</b><div><div class="m36nm">${l6Esc(x.name)}${d.prio === 'urgent' ? ' <span class="pill bad">فوری</span>' : ''}${d.test ? ' <span class="pill wait">در حال تست</span>' : ''}</div>${(() => { try { const z = typeof m23Pz === 'function' ? m23Pz(d) : ''; return z ? '<div class="m23pzr">' + z + '</div>' : '' } catch (e) { return '' } })()}<div class="meta">${l6Esc(who || '—')}</div></div>
      ${T.length ? l6Cross(T) : ''}<div class="m36wt"><div>${l6Wt(x)}</div><div class="meta${r.dueLate ? ' late' : ''}">تحویل: ${l6Esc(jDay(x.due) || '—')}${d.box ? ' · جعبه ' + l6Esc(faD(d.box)) : ''}${d.shade ? ' · رنگ ' + l6Esc(d.shade) : ''}</div></div></div>
    <div class="m36acts">${B.join('')}</div></div>${mineL}${bk}${r.S.length ? [...new Set(r.S.map(s => s.part || ''))].map(pt => { const q = pt && (d.parts || []).find(v => v.p === pt); return `${q ? `<div class="m36pt"><small class="l6pt">${l6Esc(q.label)}</small> ${l6Esc(q.wt || '')}</div>` : ''}<div class="m36track">${r.S.filter(s => (s.part || '') === pt).map(s => m36Step(r, s)).join('')}</div>` }).join('') : (r.state === 'new' ? '<div class="meta">مرحله‌ها بعد از «دریافت و شروع کار» ساخته می‌شوند.</div>' : '')}</article>` }
l6BenchSeg = function () { return '' };
l6BenchHTML = function () { const R = m36Rows(), me = L2.me || {}, rec = l8Rec(), anyMine = R.some(M36_F.mine);
  const K = rec ? ['new', 'ref', 'hands', 'back', 'ready'].concat(anyMine ? ['mine'] : []) : ['m_new', 'm_do', 'm_late'];
  const n = k => R.filter(M36_F[k]).length;
  if (!K.includes(M36.tile) && M36.tile !== 'all') M36.tile = '';
  const tile = M36.tile || (rec ? (['ref', 'new', 'ready', 'hands'].find(k => n(k)) || 'ref') : 'mine_all');
  const q = toEn(String(M36.q || '').trim()).toLowerCase();
  const base = rec ? R : R.filter(M36_F.mine);
  let P = q ? R.filter(r => toEn([l2No(r.x.no), r.x.no, r.x.name, (r.x.data || {}).acctName, (r.x.data || {}).clinic, r.x.doc, (r.x.data || {}).doc, (r.x.data || {}).box].join(' ')).toLowerCase().includes(q)) : (tile === 'mine_all' ? base : R.filter(M36_F[tile] || (() => true)));
  const ttl = q ? 'نتیجه‌ی جست‌وجو' : tile === 'mine_all' ? 'همه‌ی کارهای من' : (M36_T[tile] || [''])[0];
  const tiles = K.map(k => { const [l, s, c] = M36_T[k], on = !q && tile === k; return `<button type="button" class="m36tile m36c-${c}${on ? ' on' : ''}" data-m36tile="${k}" aria-pressed="${on}"><span class="m36n">${fa(n(k))}</span><span class="m36l">${l}</span><span class="m36s">${s}</span></button>` }).join('');
  const head = `<div class="m36top"><div>${rec ? '' : '<h2 class="m36h">کارهای من</h2>'}<div class="meta">${rec ? 'هر سفارش یک کارت؛ دکمه‌ی رنگی کار بعدی را می‌گوید.' : l6Esc(me.name || '') + ' · فقط کارهایی که به شما ارجاع شده'}</div></div>
    <div class="m36tools"><input id="m36q" value="${l6Esc(M36.q || '')}" placeholder="جست‌وجو: شماره سفارش یا نام بیمار" aria-label="جست‌وجوی سفارش">${rec ? `<button type="button" class="btn" data-l5sec="o/new">+ کار تازه</button>` : ''}</div></div>`;
  const warn = me.id ? '' : '<div class="qwarn">با رمز مشترک لابراتوار وارد شده‌اید. هر مرحله باید به یک کارمند ارجاع شود؛ با این حساب می‌توانید به نام او شروع و پایان را ثبت کنید.</div>';
  return `<div class="m36">${head}${warn}<div class="m36tiles">${tiles}</div><h3 class="m36sec">${l6Esc(ttl)} <span class="meta">— ${fa(P.length)} سفارش</span>${!q && tile !== 'all' && rec ? ` <button type="button" class="btn sm ghost" data-m36tile="all">نمایش همه</button>` : ''}</h3>${P.slice(0, 200).map(m36Card).join('') || '<div class="empty m36empty">موردی نیست.</div>'}</div>` };
(function () { const _r = renderLab; renderLab = function () { try { const on = ROLE === 'lab' && L5.sec === 'bench'; if (on) L6.bv = 'tbl'; document.body.classList.toggle('m36bench', !!on) } catch (e) { } return _r.apply(this, arguments) } })();
document.addEventListener('input', e => { const t = e.target; if (t && t.id === 'm36q') { M36.q = t.value; clearTimeout(M36.qt); M36.qt = setTimeout(() => { try { if (L5.sec === 'bench') renderLab() } catch (x) { } }, 300) } });

/* ===== actions ===== */
function m36Find(lid, sid) { let x = (LB.items || []).find(i => i.id === lid); if ((!x || !(x.steps || []).some(v => v.id === sid)) && L2.ord && L2.ord.order && L2.ord.order.id === lid) x = Object.assign({}, L2.ord.order, { steps: L2.ord.steps || [] }); const S = x ? (x.steps || []).slice().sort((a, b) => a.idx - b.idx) : [], s = S.find(v => v.id === sid); return { x, S, s } }
function m36StaffOpts(D, dept) { const S = (D.staff || []).filter(u => u.active), dep = Number(dept), A = S.filter(u => (u.depts || []).map(Number).includes(dep)), O = S.filter(u => !A.includes(u)); return { A, O, opts: A.map(u => [u.id, u.name + ' · همین دپارتمان']).concat(O.map(u => [u.id, u.name])) } }
async function m36Ref(lid, sid) { const { x, s } = m36Find(lid, sid); if (!s) return; let D; try { D = await l2Defs() } catch (e) { D = { staff: [] } }
  const o = m36StaffOpts(D, s.dept); if (!o.opts.length) { alertMsg('هنوز کارمند فعالی تعریف نشده. اول در «کارمندان» حساب بسازید.'); return }
  const bk = (x.data || {}).back, r = await l2Ask(`ارجاع «${s.dname}» — #${l2No(x.no)} ${x.name}`, [{ type: 'html', html: `<p class="note full">${bk && bk.sid === s.id ? 'برگشت از ' + esc(bk.from || '') + ': ' + esc(bk.text || '') + '<br>' : ''}کار در «کارهای من» همین فرد می‌نشیند و فقط او می‌تواند این مرحله را انجام دهد.</p>` }, { k: 'uid', l: 'انجام‌دهنده', type: 'select', full: 1, v: s.asg || (o.A.length === 1 ? o.A[0].id : ''), opts: [['', '— انتخاب کنید —']].concat(o.opts) }], 'ارجاع'); if (!r) return;
  if (!r.uid) { alertMsg('انجام‌دهنده را انتخاب کنید.'); return }
  await api('labStep', { lid, sid, op: 'assign', uid: r.uid }); l6Done('ارجاع شد.') }
async function m36Back(lid, sid) { const { x, s } = m36Find(lid, sid); if (!s) return;
  const r = await l2Ask(`برگشت «${s.dname}» به پذیرش — #${l2No(x.no)}`, [{ type: 'html', html: '<p class="note full">کار از «کارهای من» شما برداشته می‌شود و با همین دلیل به میز کار پذیرش برمی‌گردد تا دوباره ارجاع شود.</p>' }, { k: 'text', l: 'دلیل برگشت', type: 'textarea', full: 1, req: 1 }], 'برگشت به پذیرش'); if (!r) return;
  if (!String(r.text || '').trim()) { alertMsg('دلیل برگشت را بنویسید.'); return }
  await api('labStep', { lid, sid, op: 'back', text: r.text }); l6Done('کار به پذیرش برگشت.') }
async function m36Done(lid, sid) { const { x, S, s } = m36Find(lid, sid); if (!s) return; let D; try { D = await l2Defs() } catch (e) { D = { staff: [] } }
  const f = l2Dept(s.dept).flags || {}, p = l6Pt(x, s), tot = Math.max(1, ((p ? p.teeth : (x.data || {}).teeth) || []).length), dc = Number(s.dc) || 0;
  const nx = S.find(t => t.idx > s.idx && (t.part || '') === (s.part || '') && t.st === 'pend' && !m36Fin(t) && !(t.grp && t.grp === s.grp));
  let nxH = '<p class="note">این آخرین مرحله‌ی ساخت است؛ سفارش به «آماده‌ی خروج» پذیرش می‌رود.</p>';
  if (nx && nx.asg) nxH = `<p class="note">مرحله‌ی بعد «${esc(nx.dname)}» از قبل به <b>${esc(nx.asg_name || '')}</b> ارجاع شده است.</p>`;
  else if (nx) { const o = m36StaffOpts(D, nx.dept); nxH = `<label class="f full">مرحله‌ی بعد «${esc(nx.dname)}» پیش چه کسی برود؟<select id="m36nx">${o.A.length === 1 ? '' : '<option value="">پذیرش تعیین کند</option>'}${o.opts.map(([v, l]) => `<option value="${esc(v)}"${o.A.length === 1 && o.A[0].id === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}${o.A.length === 1 ? '<option value="">پذیرش تعیین کند</option>' : ''}</select><small class="note">اگر دپارتمان بعدی فقط یک نفر دارد، خودکار انتخاب می‌شود.</small></label>` }
  const sh = mkSheet('m36DoneSh', `<h3>پایان «${esc(s.dname)}» — #${l2No(x.no)} ${esc(x.name)}</h3><div class="fields">
    <label class="f full">۱. فایل این مرحله ${f.upload ? '<b class="late">(لازم است)</b>' : '(اختیاری)'}<input type="file" id="m36file" accept=".stl,.ply,.obj,.zip,.rar,.7z,.dcm,.3oxz,.constructioninfo,.jpg,.jpeg,.jfif,.png,.webp,.heic,.heif,.gif,.bmp,.tif,.tiff,.pdf,.mp4,.mov,.html,.htm"></label>
    <div class="full">۲. ${nxH}</div><label class="f full">۳. یادداشت برای نفر بعد (اختیاری)<input id="m36note"></label></div>
    <div class="msg" id="m36DoneM"></div><div class="btns"><button class="btn m36b-ok" type="button" id="m36DoneOk">ثبت پایان و ارسال</button><button class="btn ghost" type="button" id="m36DoneNo">انصراف</button></div>`);
  sh.style.zIndex = 66; sh.hidden = false; $('m36DoneNo').onclick = () => sh.hidden = true;
  $('m36DoneOk').onclick = async () => { const b = $('m36DoneOk'), m = $('m36DoneM'), fl = $('m36file').files[0]; b.disabled = true; m.className = 'msg'; m.textContent = 'در حال ثبت…';
    try { if (fl) await l2Upload(lid, fl, 'design', q => { m.textContent = 'بارگذاری فایل — ' + fa(Math.round(q * 100)) + '٪' });
      const j = await api('lab5', { op: 'perf', lid, sid, n: Math.max(1, tot - dc), day: '', note: $('m36note').value.trim(), next: ($('m36nx') || {}).value || '' });
      sh.hidden = true; l6Done(j.all ? 'مرحله تمام شد؛ سفارش آماده‌ی خروج است.' : 'مرحله تمام شد و به نفر بعد رفت.') }
    catch (e) { m.className = 'msg err'; m.textContent = e.message; b.disabled = false } } }
document.addEventListener('click', async e => { const t = e.target.closest && e.target.closest('[data-m36],[data-m36tile]'); if (!t) return;
  if (t.dataset.m36tile) { M36.tile = t.dataset.m36tile; M36.q = ''; renderLab(); return }
  const lid = t.dataset.lid, sid = t.dataset.sid, op = t.dataset.m36; if (t.disabled) return;
  try { if (op === 'ref') await m36Ref(lid, sid); else if (op === 'back') await m36Back(lid, sid); else if (op === 'done') await m36Done(lid, sid);
    else if (op === 'acc') { t.disabled = true; await api('labStep', { lid, sid, op: 'accept' }); l6Done('کار شروع شد.') }
    else if (op === 'accfor') { const { s } = m36Find(lid, sid); if (!s) return; t.disabled = true; await api('lab5', { op: 'acceptFor', lid, sid, uid: s.asg }); l6Done('به نام ' + (s.asg_name || '') + ' شروع شد.') } }
  catch (x) { t.disabled = false; alertMsg(x.message) } });


/* ===== label 90 × 15 mm ===== */
l2Label = async function (lid) { let J; try { J = await l2PrintData(lid) } catch (e) { alertMsg(e.message); return } const o = J.order, d = o.data || {}, P = (d.parts || []).length ? d.parts : [{ label: '', teeth: d.teeth || [] }];
  const acct = d.acctName || ((l5Acct(d.acct) || {}).name) || d.clinic || '', doc = d.doc || o.doc || '', ff = getComputedStyle(document.body).fontFamily || 'Tahoma,sans-serif';
  const one = p => `<div class="lb"><div class="bx"><span>جعبه</span><b>${esc(d.box ? faD(d.box) : '—')}</b></div><div class="c1"><b>${esc(o.name || '—')}</b><span>${esc([doc, acct && acct !== doc ? acct : ''].filter(Boolean).join(' · ') || '—')}</span></div><div class="c2"><b class="t">${esc(l2Teeth(p.teeth) || '—')}</b><span>${esc([p.label, d.shade ? 'رنگ ' + d.shade : ''].filter(Boolean).join(' · ') || ' ')}</span></div><div class="c3"><b>#${l2No(o.no)}</b><span>${esc(jDay(o.due) || '')}</span></div></div>`;
  const css = `@page{size:90mm 15mm;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff}body{font-family:${ff};color:#000}.lb{width:90mm;height:15mm;overflow:hidden;display:flex;align-items:stretch;page-break-after:always;break-after:page}.lb:last-child{page-break-after:auto;break-after:auto}.bx{flex:0 0 13mm;background:#000;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}.bx span{font-size:5.5pt}.bx b{font-size:15pt;line-height:1}.c1,.c2,.c3{display:flex;flex-direction:column;justify-content:center;padding:0 1.6mm;min-width:0;border-inline-start:.3mm solid #000}.c1{flex:1 1 0}.c2{flex:0 0 27mm}.c3{flex:0 0 15mm;text-align:center}.lb b{font-size:9.5pt;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lb span{font-size:6.5pt;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.t{direction:ltr;unicode-bidi:isolate}`;
  const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>برچسب ${l2No(o.no)}</title><style>${css}</style></head><body>${P.map(one).join('')}</body></html>`;
  const sh = mkSheet('l8LbSh', `<h3>پیش‌نمایش برچسب — #${l2No(o.no)} ${esc(o.name)}</h3><p class="note">اندازه‌ی ۹ × ۱٫۵ سانتی‌متر${P.length > 1 ? ' · ' + fa(P.length) + ' برچسب (هر بخش یکی)' : ''}. در پنجره‌ی چاپ، کاغذ برچسب ۹۰×۱۵ میلی‌متر و حاشیه «هیچ» را انتخاب کنید.</p><div class="l8lbw"><iframe class="l8lbf" title="پیش‌نمایش برچسب"></iframe></div><div class="btns"><button class="btn" type="button" id="l8LbP">چاپ برچسب</button><button class="btn ghost" type="button" id="l8LbX">بستن</button></div>`);
  sh.style.zIndex = 68; sh.hidden = false; const f = sh.querySelector('.l8lbf'), w = sh.querySelector('.l8lbw'), mm = 96 / 25.4, box = Math.max(200, (sh.querySelector('.in').clientWidth || 600) - 40), sc = Math.min(1.8, box / (90 * mm));
  f.style.width = (90 * mm) + 'px'; f.style.height = (15 * mm * P.length) + 'px'; f.style.transform = `scale(${sc})`; w.style.width = (90 * mm * sc) + 'px'; w.style.height = (15 * mm * P.length * sc) + 'px'; f.srcdoc = html; M36.labelHtml = html;
  $('l8LbX').onclick = () => sh.hidden = true; $('l8LbP').onclick = () => printHTML(html) };

/* ===== «ایجاد کار جدید» ===== */
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-m36pk]'); if (!t || !L4N) return; L4N.m36pk = t.dataset.m36pk; document.querySelectorAll('[data-m36pk]').forEach(b => b.setAttribute('aria-pressed', b === t)) });
async function m36SaveExt(b) { const m = $('l4nMsg'), err = t => { m.className = 'msg err'; m.textContent = t; m.scrollIntoView({ block: 'center' }) };
  if (typeof V9 !== 'undefined' && V9 && V9.on) return err('اول ضبط صدا را تمام کنید.');
  l4nRead(); try { h9Read(); h9Apply() } catch (e) { } const H = LO.h9, N = L4N; try { const s = $('l5nac'); if (s) N.acct = s.value } catch (e) { }
  if (!LFOR[LO.for] || !l4Lbl(LO.for)) LO.for = 'tryin';
  b.disabled = true; if (!b.dataset.sid) b.dataset.sid = uuid(); if (!b.dataset.lid) b.dataset.lid = uuid(); const lid = b.dataset.lid, f0 = LO.for;
  let files = LOF.slice(); try { if ((LO.teeth || []).length || H.draw || String(H.name || '').trim()) { const sh = await h9Sheet(); sh.m36sheet = 1; files.unshift(sh) } } catch (e) { } try { files = files.concat(v9Files()) } catch (e) { }
  m.className = 'msg'; m.textContent = 'در حال ثبت…';
  try { const r = await api('lab4New', { id: '', name: H.name || '', clinic: N.clinic || '', lid, sendId: b.dataset.sid,
      order: { for: LO.for, meth: LO.meth, teeth: LO.teeth || [], pon: (LO.pon || []).filter(k => (LO.teeth || []).includes(k)), type: LO.type, mat: LO.mat, abut: LO.abut, ret: LO.ret, shade: LO.shade, sys: LO.sys, doc: LO.doc || H.doc, note: LO.note, by: USERNAME || 'لابراتوار' } });
    let bad = ''; const pk = N.m36pk || 'ophoto';
    for (let i = 0; i < files.length; i++) { const f = files[i], img = /\.(jpe?g|jfif|png|webp|heic|heif|gif|bmp|tiff?)$/i.test(f.name); try { await l2Upload(lid, f, f.m36sheet ? 'ophoto' : img ? pk : 'scan', q => { m.textContent = `بارگذاری فایل ${fa(i + 1)} از ${fa(files.length)}: ${f.name} — ${fa(Math.round(q * 100))}٪` }) } catch (e) { bad = f.name + ': ' + e.message; break } }
    $('l4nSheet').hidden = true; L4N = null; LO = null; LOF = []; LB.seg = 's_' + f0; TILE = 's_' + f0;
    if (bad) alertMsg('کار ثبت شد ولی بارگذاری فایل کامل نشد (' + bad + '). از «برگه و فایل‌ها» دوباره بگذارید.');
    toast(`کار #${l2No(r.no)} ثبت شد.`); pollLab(true) }
  catch (e) { err(e.message); b.disabled = false } }

/* ===== «برگه و فایل‌ها»: the step table follows the same rules as the workbench ===== */
(function () { const _r = l2Render; l2Render = function () { const r = _r.apply(this, arguments);
  try { const J = L2.ord, box = $('l2In'); if (!J || !box || ROLE !== 'lab') return r; const o = J.order, d = o.data || {}, me = L2.me || {}, rec = l8Rec(), sup = l5Sup(), S = (J.steps || []).slice().sort((a, b) => a.idx - b.idx), id = esc(o.id);
    const tb = box.querySelector('table.l2st'); if (!tb) return r; const rows = [...tb.querySelectorAll('tbody tr')]; if (rows.length !== S.length) return r;
    S.forEach((s, i) => { const tr = rows[i], acts = tr.querySelector('.acts'); if (!acts) return; const a = `data-lid="${id}" data-sid="${esc(s.id)}"`, av = s.st === 'pend' && l2Av(S, s) && o.st === 'making', cur = av || s.st === 'acc', B = [], fin = m36Fin(s);
      const mP = me.id && av && s.asg === me.id, mA = me.id && s.st === 'acc' && s.acc_by === me.id;
      if (!fin && o.st === 'making') {
        if (mP) B.push(`<button class="btn sm main" type="button" data-m36="acc" ${a}>شروع کار</button>`);
        if (mA) B.push(`<button class="btn sm main" type="button" data-m36="done" ${a}>پایان و فرستادن به نفر بعد</button>`);
        if (mP || mA) B.push(`<button class="btn sm ghost" type="button" data-m36="back" ${a}>برگشت به پذیرش</button>`);
        if (sup && !mP && av && s.asg) B.push(`<button class="btn sm ghost" type="button" data-m36="accfor" ${a}>شروع به نام ${esc(s.asg_name || '')}</button>`);
        if (sup && !mA && s.st === 'acc') B.push(`<button class="btn sm ghost" type="button" data-m36="done" ${a}>ثبت پایان</button>`);
        if (rec && !l2Done(s)) B.push(`<button class="btn sm ${cur && !s.asg ? 'main' : 'ghost'}" type="button" data-m36="ref" ${a}>${s.asg ? 'تغییر انجام‌دهنده' : 'ارجاع'}</button>`);
        if (mP || mA || sup) B.push(`<button class="btn sm ghost" type="button" data-l2step="note" ${a}>یادداشت</button>`);
        if (sup && !l2Done(s)) B.push(`<button class="btn sm ghost" type="button" data-l2step="skip" ${a}>رد شدن</button>`);
        if (sup && s.st !== 'pend') B.push(`<button class="btn sm ghost danger" type="button" data-l2step="reopen" ${a}>باز کردن دوباره از این مرحله</button>`) }
      const keep = [...acts.querySelectorAll('[data-l8dc]')].map(x => x.outerHTML).join('');
      acts.innerHTML = B.join('') + keep;
      const pill = tr.querySelector('td:nth-child(3) .pill'); if (pill && s.st === 'pend') { if (fin) pill.textContent = 'با پذیرش'; else if (av && !s.asg) { pill.textContent = 'منتظر ارجاع'; pill.className = 'pill wait' } else if (av) pill.textContent = 'ارجاع به ' + (s.asg_name || '') } });
    if (d.back && !box.querySelector('.m36bk')) { const h3 = [...box.querySelectorAll('h3')].find(h => /مراحل ساخت/.test(h.textContent)); if (h3) h3.insertAdjacentHTML('afterend', `<div class="m36bk"><b>برگشت از ${esc(d.back.from || '')} (${esc(d.back.dname || '')}):</b> ${esc(d.back.text || '')}</div>`) }
  } catch (e) { console.error('m36 sheet', e) } return r } })();

/* ===== «همه‌ی سفارش‌ها»: our own column names and order ===== */
try { const N = { row: 'ردیف', no: 'شماره', name: 'بیمار', acct: 'مشتری', doc: 'پزشک', wt: 'نوع کار', teeth: 'دندان‌ها', dept: 'مرحله‌ی فعلی', st: 'وضعیت', due: 'تحویل', enter: 'ورود', box: 'جعبه', color: 'رنگ', stage: 'مرحله‌ی کار', inv: 'صورت‌حساب', act: 'کارها', code: 'کد مشتری', wo: 'شماره دستورکار', note: 'توضیح', created: 'ثبت در سایت', last: 'آخرین مرحله‌ی انجام‌شده', time: 'مدت', file: 'شماره پرونده', sys: 'سیستم ایمپلنت' },
    O = ['row', 'no', 'name', 'acct', 'doc', 'wt', 'teeth', 'dept', 'st', 'due', 'enter', 'box', 'color', 'stage', 'inv', 'code', 'wo', 'note', 'created', 'last', 'time', 'file', 'sys', 'act'];
  L6C.forEach(c => { if (N[c[0]]) c[1] = N[c[0]] }); L6C.sort((a, b) => { const i = O.indexOf(a[0]), j = O.indexOf(b[0]); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j) }) } catch (e) { console.error('m36 cols', e) }
