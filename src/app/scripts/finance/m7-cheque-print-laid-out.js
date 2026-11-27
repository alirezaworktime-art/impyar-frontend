/* ---------- m7: cheque print laid out for the clinic's cheque (بانک مهر ایران، صیادی ۱۷۵×۸۰ میلی‌متر): تاریخ (عدد + حروف)، مبلغ به حروف (ریال)، در وجه، کد ملی، مبلغ به عدد (ریال) + «چاپ آزمایشی» with the field boxes ---------- */
/* positions in mm from the cheque's left / top edge (measured on the owner's photo); [left, top, width, align] */
const M7_F = { day: [108, 15.5, 32, 'c'], dayW: [70, 21, 66, 'r'], amtW: [20, 32.5, 110, 'r'], to: [92, 41.5, 72, 'r'], nid: [38, 40.5, 34, 'c'], amt: [12, 56.5, 57, 'r'] };
function m7Html(o, test) {
  const E = x => esc(String(x == null ? '' : x)), dx = o.dx || 0, dy = o.dy || 0;
  const box = (k, html, cls) => { const [l, t, w, al] = M7_F[k]; return `<div class="t ${cls || ''}" style="left:${(l - dx).toFixed(1)}mm;top:${(t + dy).toFixed(1)}mm;width:${w}mm;text-align:${al === 'c' ? 'center' : al === 'l' ? 'left' : 'right'}">${html}</div>` };
  const fr = test ? `<div class="fr" style="left:${(-dx).toFixed(1)}mm;top:${dy.toFixed(1)}mm"></div>` : '';
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>چک</title><style>@page{size:175mm 80mm;margin:0}html,body{margin:0;width:175mm;height:80mm;overflow:hidden}body{position:relative;font-family:Vazirmatn,Tahoma,sans-serif;font-size:11.5pt;color:#000}
.t{position:absolute;height:6mm;line-height:6mm;white-space:nowrap;overflow:hidden;font-weight:700}.n{direction:ltr;unicode-bidi:isolate;letter-spacing:.6mm}.big{font-size:13pt}
.fr{position:absolute;width:175mm;height:80mm;box-sizing:border-box;border:.3mm dashed #888}${test ? '.t{outline:.25mm dashed #c00}' : ''}</style></head><body>${fr}
${box('day', `<span class="n">${E(faD(toEn(jDay(o.iso))))}</span>`)}${box('dayW', E(jDateWords(o.iso)))}
${box('amtW', E(numWords(o.v)) + (o.u === 't' ? ' تومان' : ''))}${box('to', E(o.to))}${o.nid ? box('nid', `<span class="n">${E(faD(toEn(o.nid)))}</span>`) : ''}
${box('amt', `<span class="n big">${E(fa(o.v))}</span>`)}</body></html>`
}
function m7Read(test) {
  const m = $('cpMsg'), a = parseInt(toEn($('cp_amt').value).replace(/[^\d]/g, ''), 10) || (test ? 8000000 : 0), iso = parseJ($('cp_day').value.trim()) || (test ? tDay() : ''), to = $('cp_to').value.trim() || (test ? 'سید محمد علوی کیا' : '');
  if (!a) { m.className = 'msg err'; m.textContent = 'مبلغ را وارد کنید.'; return null } if (!iso) { m.className = 'msg err'; m.textContent = 'تاریخ را درست وارد کنید.'; return null } if (!to) { m.className = 'msg err'; m.textContent = '«در وجه» را بنویسید.'; return null }
  const u = CP.unit || 'r', o = { iso, to, u, v: u === 'r' ? a * 10 : a, nid: $('cp_nid').value.trim() || (test ? '0011758244' : ''), dx: parseFloat(toEn($('cp_dx').value)) || 0, dy: parseFloat(toEn($('cp_dy').value)) || 0 };
  CPS.set('dx', String(o.dx)); CPS.set('dy', String(o.dy)); CPS.set('unit', u); if (!test) { CPS.set('to', to); CPS.set('nid', $('cp_nid').value.trim()) }
  return o
}
/* printChq: m7 (replaces the first version of the patient file tabs) */
function printChq() { const o = m7Read(false); if (!o) return; printHTML(m7Html(o, false)); const m = $('cpMsg'); m.className = 'msg ok'; m.textContent = 'به پرینتر فرستاده شد. در پنجره‌ی چاپ اندازه را «۱۰۰٪ / Actual size» بگذارید.' }
document.addEventListener('click', e => { if (!e.target || e.target.id !== 'cpTest') return; const o = m7Read(true); if (!o) return; printHTML(m7Html(o, true)); const m = $('cpMsg'); m.className = 'msg ok'; m.textContent = 'برگه‌ی آزمایشی فرستاده شد: آن را روی چک بگذارید و جلوی نور ببینید؛ اگر جابه‌جا بود، «جابه‌جایی» را تنظیم کنید.' });
