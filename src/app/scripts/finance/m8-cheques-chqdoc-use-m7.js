/* ---------- m8: the cheques of «تعیین تکلیف مالی» (برگه‌ی چک‌های طرح، چاپ چندتایی chqDoc) use the m7 layout of the clinic's Mehr Iran cheque too ---------- */
/* chqDoc: m8 (replaces the pros2 version) + m10 (2) (the «در وجه» chosen in the collection sheet, with its national id only when it is the saved payee) */
function chqDoc(list) {
  const pe = m10Payee(), u = CPS.get('unit', 'r'), to = pe ? pe : CPS.get('to', SET.clinic || ''), nid = pe ? (CPS.get('to', '') === pe ? CPS.get('nid', '') : '') : CPS.get('nid', ''), dx = parseFloat(CPS.get('dx', '0')) || 0, dy = parseFloat(CPS.get('dy', '0')) || 0;
  const pages = (list || []).map(x => { const o = { iso: x.due, to, nid, u, v: u === 'r' ? (Number(x.amount) || 0) * 10 : (Number(x.amount) || 0), dx, dy }, h = m7Html(o, false); return '<div class="pg">' + h.replace(/^[\s\S]*<body>/, '').replace(/<\/body>[\s\S]*$/, '') + '</div>' });
  const h0 = m7Html({ iso: tDay(), to, nid, u, v: 1, dx, dy }, false), st = /<style>([\s\S]*?)<\/style>/.exec(h0)[1].replace('html,body{margin:0;width:175mm;height:80mm;overflow:hidden}', 'html,body{margin:0;width:175mm}').replace('body{position:relative;', 'body{');
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>چک</title><style>${st}
.pg{position:relative;width:175mm;height:80mm;overflow:hidden;page-break-after:always;break-after:page}.pg:last-child{page-break-after:auto;break-after:auto}</style></head><body>${pages.join('')}</body></html>`
}
