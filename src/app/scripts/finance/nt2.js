/* ---------- nt2: توضیح با تاریخ، نویسنده و گیرنده (درخواست مالک ۱۸ آبان) — پرونده‌ی جا مانده: تاریخ، نویسنده و گیرنده همه دستی (اجباری)؛
   توضیح مرحله‌ها (طرح درمان، جراحی و…): تاریخ خودکار، نویسنده (اجباری) و گیرنده دستی. گیرنده‌ها: جراح، پزشک آنکاوری، پزشک پروتز، لابراتوار، پزشک طرح درمان، مشاور، منشی. ---------- */
['plan', 'cons', 'staff'].forEach(k => { A10T[k] = { plan: 'پزشک طرح درمان', cons: 'مشاور', staff: 'منشی' }[k] });
function nt2Names() { const L = [], seen = new Set(), add = d => { d = String(d || '').trim(); if (d && !seen.has(d)) { seen.add(d); L.push(d) } }; try { (A6D || []).forEach(add) } catch (e) { } try { arcDocs().forEach(add) } catch (e) { } try { (SET.assts || []).forEach(add) } catch (e) { } add(USERNAME); return L }
const nt2DL = () => `<datalist id="nt2Names">${nt2Names().map(n => `<option value="${esc(n)}">`).join('')}</datalist>`;
const nt2To = (to, attr) => Object.keys(A10T).map(k => `<button type="button" class="chip" ${attr}="${k}" aria-pressed="${(to || []).includes(k)}">${A10T[k]}</button>`).join('');
const nt2Day = d => d ? jDay(d) : '';
/* paper file: each note has date + writer + recipients, all by hand */
a10Clean = function (M) { return (M || []).map(m => ({ t: String(m.t || '').trim(), to: (m.to || []).filter(k => A10T[k]), day: m.day || '', dayJ: m.dayJ != null ? m.dayJ : nt2Day(m.day), by: String(m.by || '').trim() })).filter(m => m.t) };
ARC10_MSG = function () { if (!A6) return ''; const M = A6.msgs = A6.msgs && A6.msgs.length ? A6.msgs : [{ t: '', to: [], dayJ: '', by: '' }];
  return `<div class="grp a10m" id="a10Msg"><span>توضیحات (تاریخ، نویسنده و گیرنده)</span>${nt2DL()}${M.map((m, i) => `<div class="a10i"><div class="nt2r"><label class="f">تاریخ *<input data-a10d="${i}" value="${esc(m.dayJ != null ? m.dayJ : nt2Day(m.day))}" placeholder="مثلاً ${esc(jDay(tDay()))}" autocomplete="off"></label><label class="f">نویسنده *<input data-a10b="${i}" list="nt2Names" value="${esc(m.by || '')}" placeholder="نام نویسنده" maxlength="60" autocomplete="off"></label></div>
    <textarea data-a10t="${i}" rows="2" maxlength="1000" placeholder="متن توضیح…">${esc(m.t || '')}</textarea>
    <div class="chips" role="group" aria-label="برای کدام بخش"><small class="nt2l">برای:</small>${Object.keys(A10T).map(k => `<button type="button" class="chip" data-a10to="${k}" data-a10i="${i}" aria-pressed="${(m.to || []).includes(k)}">${A10T[k]}</button>`).join('')}${M.length > 1 ? `<button type="button" class="chip a10x" data-a10x="${i}">حذف</button>` : ''}</div></div>`).join('')}
    <div class="btns"><button type="button" class="btn sm ghost" id="a10Add">+ توضیح دیگر</button></div></div>` };
document.addEventListener('input', e => { const t = e.target; if (!t || !t.dataset || !A6 || !A6.msgs) return; if (t.dataset.a10d != null) { const m = A6.msgs[+t.dataset.a10d]; if (m) { m.dayJ = t.value.trim(); m.day = parseJ(m.dayJ) || ''; A6.dirty = true } } if (t.dataset.a10b != null) { const m = A6.msgs[+t.dataset.a10b]; if (m) { m.by = t.value; A6.dirty = true } } }, true);
/* (the fxArc note check is in the api layer below, after NT2) */
a10Box = function (M, keys, cls) { const L = a10Clean(M).filter(m => m.to.some(k => keys.includes(k))); if (!L.length) return '';
  return `<div class="a10box ${cls || ''}" role="note"><b>توضیح پرونده‌ی کاغذی</b>${L.map(m => `<div><small>${m.day ? esc(jDay(m.day)) + ' · ' : ''}${m.by ? 'نویسنده: ' + esc(m.by) + ' · ' : ''}برای ${m.to.map(k => A10T[k]).join('، ')}</small><p>${esc(m.t)}</p></div>`).join('')}</div>` };
/* stage notes: date automatic, writer + recipients by hand */
let NT2 = null;
{ const _o = ntOpen; ntOpen = async function (plan, o = {}) { const r = await _o.apply(this, arguments); try { const n = o.note || null, st = $('fxNtSt'); if (!st || !NT) return r;
    NT2 = { to: n && n.tos ? (() => { try { return JSON.parse(n.tos) } catch (e) { return [] } })() : [] };
    st.closest('label').insertAdjacentHTML('afterend', `${nt2DL()}<div class="nt2r"><label class="f">تاریخ<input value="${esc(n ? jt(n.at) : 'امروز — خودکار')}" disabled></label><label class="f">نویسنده *<input id="nt2By" list="nt2Names" maxlength="60" value="${esc(n ? (n.author || n.by || '') : '')}" placeholder="نام نویسنده" autocomplete="off"></label></div>
      <div class="grp"><span>برای (گیرنده)</span><div class="chips" role="group">${nt2To(NT2.to, 'data-nt2to')}</div></div>`) } catch (e) { } return r } }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-nt2to]'); if (!t || !NT2) return; e.preventDefault(); e.stopPropagation(); const k = t.dataset.nt2to; NT2.to = NT2.to.includes(k) ? NT2.to.filter(x => x !== k) : NT2.to.concat(k); t.setAttribute('aria-pressed', String(NT2.to.includes(k))) }, true);
/* api (nt2, two layers in one; each acts on its own action only): fxNote add / edit carries the writer and the recipients (the writer is required);
   fxArc of a paper file: every note needs a valid date (not after today) and a writer */
{ const _a = api; api = function (action, payload) {
  if (action === 'fxNote' && payload && (payload.op === 'add' || payload.op === 'edit')) { const b = $('nt2By'); payload.author = b ? b.value.trim() : (payload.author || ''); payload.to = NT2 ? NT2.to.slice() : (payload.to || []);
    if (!payload.author) { if (b) b.focus(); return Promise.reject(new Error('نویسنده‌ی توضیح را بنویسید.')) } }
  if (action === 'fxArc' && payload && payload.arc && payload.arc.v6 && A6 && A6.msgs) {
    const i = A6.msgs.findIndex(m => String(m.t || '').trim() && (!m.day || m.day > tDay() || !String(m.by || '').trim()));
    if (i >= 0) { const m = A6.msgs[i], q = !m.day || m.day > tDay() ? `[data-a10d="${i}"]` : `[data-a10b="${i}"]`, n = document.querySelector(q); if (n) { n.scrollIntoView({ block: 'center' }); try { n.focus() } catch (e) { } }
      return Promise.reject(new Error(!m.day ? 'تاریخ توضیح را درست بنویسید (مثل ' + jDay(tDay()) + ').' : m.day > tDay() ? 'تاریخ توضیح نمی‌تواند بعد از امروز باشد.' : 'نویسنده‌ی توضیح را بنویسید.')) }
  }
  return _a.apply(this, arguments) } }
ntItem = function (n) { const can = FXW[ROLE]; let to = []; try { to = JSON.parse(n.tos || '[]') } catch (e) { }
  return `<div class="fxn"><div class="fxn-h"><b>${esc(FXST[n.stage] || 'سایر')}</b><small>${esc(jt(n.at))} · نویسنده: ${esc(n.author || n.by || ROLE_LBL[n.role] || '')}${to.length ? ' · برای ' + esc(to.map(k => A10T[k] || k).join('، ')) : ''}${n.upd ? ' · ویرایش ' + esc(jt(n.upd)) + (n.updBy ? ' (' + esc(n.updBy) + ')' : '') : ''}</small>${can ? `<button class="btn sm ghost" type="button" data-fxnedit="${esc(n.id)}">ویرایش</button>` : ''}</div>${n.kind === 'pen' && n.img ? `<img class="fxn-img" src="${esc(n.img)}" alt="نوشته‌ی دستی ${esc(FXST[n.stage] || '')}">` : ''}${n.text ? `<p>${esc(n.text)}</p>` : ''}</div>` };
