/* ---------- m55a (owner, 2026-11-18): «موارد خاص» of the implant row in the plan form — the doctor picks the kind of implant from a list:
   روت، اشترومن، زایگوما، نازال، تریگوئید (diameter and length stay). Each special implant is priced with its own tariff and the other implants of
   the row with the plan's brand: روت and اشترومن with the Root / Swiss tariff of the implant row (m43a), زایگوما / نازال / تریگوئید with their own
   tariffs (settings «پایه ایمپلنت · زایگوما / نازال / تریگوئید»; empty = the All on X tariff of the same kind). The three tariffs are stored in
   the plan (imp.ip.spz / spn / spt) and can be changed for one patient in the box. Approved plans keep their price (same rule as m43a). ---------- */
const M55_T = [['روت', 'rt'], ['اشترومن', 'sw'], ['زایگوما', 'z'], ['نازال', 'n'], ['تریگوئید', 't']];
const M55_ZN = { z: 'زایگوما', n: 'نازال', t: 'تریگوئید' }, M55_PK = { z: 'aox_z', n: 'aox_n', t: 'aox_t' };
const m55Ty = b => { b = String(b || ''); return /زایگوما|zygoma/i.test(b) ? 'z' : /نازال|nasal/i.test(b) ? 'n' : /تریگوئید|پتریگوئید|pteryg/i.test(b) ? 't' : /root|روت/i.test(b) ? 'rt' : /stra?uman|اشترومن|استرومن/i.test(b) ? 'sw' : '' };
const m55Def = k => { const P = (SET && SET.prices) || {}; return fmtInput((P['sp_' + k] || {}).price || (P[M55_PK[k]] || {}).price || (((P.imp || {}).bp || {}).it) || '') };
/* {n, by:{z:n}, sum} — the zygoma / nasal / pterygoid rows that change the price (one per selected tooth; the first known row of a tooth counts) */
function m55Mix(s) { const o = { n: 0, by: {}, sum: 0 }; try { if (!s || !s.ip || !s.ip.m43) return o; const seen = {};
  (s.sp || []).forEach(r => { if (!r || !r.k || !isTooth(r.k) || !s.sel || !s.sel[r.k] || seen[r.k]) return; const ty = m55Ty(r.b); if (!ty) return;
    if (ty === 'rt' || ty === 'sw') { if (num(s.bp[ty])) seen[r.k] = 1; return }
    const p = num(s.ip['sp' + ty]); if (!p) return; seen[r.k] = 1; o.n++; o.by[ty] = (o.by[ty] || 0) + 1; o.sum += p }) } catch (e) { } return o }
{ const _b = blankSections; blankSections = function () { const S = _b.apply(this, arguments); try { ['z', 'n', 't'].forEach(k => { S.imp.ip['sp' + k] = m55Def(k) }) } catch (e) { } return S } }
{ const _f = secFrom; secFrom = function (d) { const S = _f.apply(this, arguments); try { const ip = (d && d.imp && d.imp.ip) || {}; ['z', 'n', 't'].forEach(k => { if (ip['sp' + k] !== undefined && ip['sp' + k] !== '') S.imp.ip['sp' + k] = fmtInput(ip['sp' + k]) }) } catch (e) { } return S } }
{ const _r = rowTotals; rowTotals = function (r, x) { const o = _r.apply(this, arguments); try { if (x && x.id === 'imp' && x.price === 'brandUnit' && r && r.s && r.s.imp) { const s = r.s.imp, M = m55Mix(s);
  if (M.n) { BRANDS.forEach(b => { o.brand[b.k] += M.sum - M.n * num(s.bp[b.k]) }); o.m55 = M } } } catch (e) { console.error('m55a', e) } return o } }
const m55Parts = (s, rt) => { const L = []; try { const GN = g => { const b = BRANDS.find(x => x.k === g); return b ? b.n : g };
  Object.keys((rt.m43 || {}).by || {}).forEach(g => L.push(`${GN(g)} ${fa(rt.m43.by[g])} × ${fa(num(s.bp[g]))}`));
  Object.keys((rt.m55 || {}).by || {}).forEach(k => L.push(`${M55_ZN[k]} ${fa(rt.m55.by[k])} × ${fa(num(s.ip['sp' + k]))}`)) } catch (e) { } return L };
/* the form: count × tariff, the special ones apart */
{ const _c = pl9Calc; pl9Calc = function () { const out = _c.apply(this, arguments); try { const el = document.getElementById('calc_imp'); if (el && typeof AS === 'function') { const S = AS(), s = S && S.imp; if (!s) return out;
  const pv = { s: S, brand: F.brand, pay: F.pay }, x = SEC.imp, rt = rowTotals(pv, x); if (!rt.m55) return out;
  const q = qty(s, x), N = rt.m55.n + ((rt.m43 || {}).n || 0), sum = rt.m55.sum + ((rt.m43 || {}).sum || 0);
  el.innerHTML = '<span class="pl9bl">' + BRANDS.map(b => `<span>${b.n}: <bdi class="pl9m" dir="ltr">${fa(Math.max(0, q - N))} × ${fa(num(s.bp[b.k]))}</bdi> + خاص = <b>${fa(rt.brand[b.k])}</b></span>`).join('') + '</span>' +
    `<br><span class="m43sp">موارد خاص با تعرفه‌ی خودشان: <bdi dir="ltr">${esc(m55Parts(s, rt).join(' + '))}</bdi> = <b>${fa(sum)}</b></span>` + (rt.pros ? `<br>روکش روی پایه‌ها (پارت پروتز): <bdi class="pl9m" dir="ltr">${fa(q)} × ${fa(num(S.crw.price))}</bdi> = <b>${fa(rt.pros)}</b>` : '') } } catch (e) { console.error('m55a calc', e) } return out } }
/* the PDF price column */
{ const _p = priceLines; priceLines = function (r, x) { let L = _p.apply(this, arguments); try { if (x && x.id === 'imp' && Array.isArray(L) && r && r.s && r.s.imp) { const s = r.s.imp, rt = rowTotals(r, x); if (!rt.m55) return L;
  const q = qty(s, x), N = rt.m55.n + ((rt.m43 || {}).n || 0), LRM = '‎'; let last = -1;
  L = L.filter(o => !(typeof o.t === 'string' && o.t.startsWith('خاص: '))).map((o, i) => { const b = BRANDS.find(b => typeof o.t === 'string' && o.t.startsWith(b.n + ': ')); if (!b) return o; return Object.assign({}, o, { t: `${b.n}: ${LRM}${fa(Math.max(0, q - N))} × ${fa(num(s.bp[b.k]))} + خاص = ${fa(rt.brand[b.k])}`, _b: 1 }) });
  L.forEach((o, i) => { if (o._b) last = i });
  if (last >= 0) { L.splice(last + 1, 0, ...m55Parts(s, rt).map(t => ({ t: 'خاص: ' + LRM + t, c: '#444', s: 16 }))); try { const c = mctx(), W = C.priceW - 28; L.forEach(o => { let z = o.s || 20; while (z > 10 && Wd(c, o.t, { s: z, w: o.b ? 800 : 400 }) > W) z--; o.s = z }) } catch (e) { } }
  L.forEach(o => delete o._b) } } catch (e) { console.error('m55a pdf', e) } return L } }
/* the box: the kind is picked from the list */
spHTML = function (x) { const s = AS()[x.id], rows = s.sp || []; if (SURG && !rows.length) return '';
  const teeth = []; ['UR', 'UL', 'LR', 'LL'].forEach(q => { for (let i = 1; i <= 7; i++) teeth.push(q + i) }); const selT = teeth.filter(k => s.sel[k]);
  const opt = v => `<option value="">دندان</option>` + (selT.length ? `<optgroup label="دندان‌های انتخاب‌شده">${selT.map(k => `<option value="${k}" ${v === k ? 'selected' : ''}>${esc(toothTxt([k]))}</option>`).join('')}</optgroup>` : '') +
    `<optgroup label="ناحیه">${['UR', 'UL', 'LR', 'LL'].map(q => `<option value="${q}" ${v === q ? 'selected' : ''}>${QNAME[q]}</option>`).join('')}</optgroup><optgroup label="همه‌ی دندان‌ها">${teeth.filter(k => !s.sel[k]).map(k => `<option value="${k}" ${v === k ? 'selected' : ''}>${esc(toothTxt([k]))}</option>`).join('')}</optgroup>`;
  const kind = v => { const known = M55_T.some(([l]) => l === v); return `<option value="">نوع ایمپلنت</option>` + M55_T.map(([l]) => `<option value="${l}" ${v === l ? 'selected' : ''}>${l}</option>`).join('') + (v && !known ? `<option value="${esc(v)}" selected>${esc(v)}</option>` : '') };
  const used = ['z', 'n', 't'].filter(k => rows.some(r => m55Ty(r.b) === k));
  return `<div class="sp"><div class="sp-h"><b>موارد خاص</b>${SURG ? '' : `<button type="button" class="btn sm ghost" data-spadd>+ افزودن مورد خاص</button>`}</div>` +
    (rows.length ? rows.map((r, i) => `<div class="sp-row"><select data-sp="${i}" data-spf="k">${opt(r.k)}</select><select data-sp="${i}" data-spf="b" class="m55k">${kind(r.b)}</select><input data-sp="${i}" data-spf="d" class="ltr" inputmode="decimal" placeholder="قطر Ø" value="${esc(r.d)}"><input data-sp="${i}" data-spf="l" class="ltr" inputmode="decimal" placeholder="طول" value="${esc(r.l)}">${SURG ? '' : `<button type="button" class="btn sm danger" data-spdel="${i}" aria-label="حذف">×</button>`}</div>`).join('')
      : '<p class="note">برای ایمپلنت روت، اشترومن، زایگوما، نازال یا تریگوئید روی یک دندان، «افزودن مورد خاص» را بزنید. دندان باید در «پایه ایمپلنت» هم انتخاب شده باشد.</p>') +
    (used.length && !SURG ? `<div class="m55p"><span>تعرفه‌ی هر پایه:</span>${used.map(k => `<label class="f">${M55_ZN[k]}<input class="price" inputmode="numeric" data-m55p="${k}" value="${esc(s.ip['sp' + k] || '')}"></label>`).join('')}</div>` : '') + '</div>' };
document.addEventListener('change', e => { const i = e.target; if (!i || !i.matches || !i.matches('select[data-sp][data-spf="b"],select[data-sp][data-spf="k"]')) return; setTimeout(() => { try { const z = ['z', 'n', 't'], s = AS().imp, had = !!document.querySelector('[data-sec="imp"] .m55p'), need = (s.sp || []).some(r => z.includes(m55Ty(r.b)));
  if (had !== need || need) reSec('imp'); else recalc() } catch (x) { } }, 0) });
document.addEventListener('input', e => { const i = e.target; if (!i || !i.dataset || !i.dataset.m55p) return; try { const s = AS().imp; s.ip['sp' + i.dataset.m55p] = i.value; touch(); recalc() } catch (x) { } });
/* settings: the three tariffs */
{ const _r = renderPriceSettings; renderPriceSettings = function () { const r = _r.apply(this, arguments); try { const el = $('set_prices'), P = SET.prices || {}; if (el && !el.querySelector('[data-tp="sp_z"]')) {
  const h = ['z', 'n', 't'].map(k => `<div class="grp"><span>پایه ایمپلنت · ${M55_ZN[k]} (موارد خاص) · هر واحد</span><input class="price" inputmode="numeric" data-tp="sp_${k}" value="${esc(fmtInput((P['sp_' + k] || {}).price || ''))}" placeholder="خالی = تعرفه‌ی All on X ${M55_ZN[k]}"></div>`).join('');
  const n = el.querySelector('.note'); if (n) n.insertAdjacentHTML('beforebegin', h); else el.insertAdjacentHTML('beforeend', h) } } catch (e) { console.error('m55a set', e) } return r } }
/* surgery day: an implant placed on a tooth that the plan marks as زایگوما / نازال / تریگوئید is priced with that tariff (not the brand of the fixture),
   so the surgery amount equals the plan and no false difference is made */
/* (surgActual: this layer is merged into surgery/surgery-day.js) */
