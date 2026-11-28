/* ---------- m5: (marker) ---------- */
/* ---------- m5: «مالی ← سهم پزشکان» — the detail per doctor: pick a doctor (or tap a row of «جمع سهم هر پزشک») → his services table, a per-service summary, Excel / print; «اکسل همه به تفکیک پزشک» (one sheet each) and «چاپ همه» (one page each) ---------- */
M1.doc = '';
const m5Rows = (d, n) => d.docs.rows.filter(r => (r.doc || '—') === n);
const m5Svc = rows => { const o = {}; rows.forEach(r => { const k = r.svc || '—', x = o[k] || (o[k] = { svc: k, qty: 0, amt: 0, fee: 0 }); x.qty += Number(r.qty) || 0; x.amt += Number(r.amt) || 0; x.fee += Number(r.fee) || 0 }); return Object.values(o).sort((a, b) => b.fee - a.fee) };
const M5_COLS = [{ k: 'day', l: 'تاریخ', t: 'd' }, { k: 'pat', l: 'بیمار' }, { k: 'file', l: 'پرونده' }, { k: 'svc', l: 'خدمت' }, { k: 'qty', l: 'تعداد', t: 'n' }, { k: 'amt', l: 'مبلغ خدمت', t: 'm' }, { k: 'fee', l: 'سهم', t: 'm' }, { k: 'note', l: 'توضیح' }];
const M5_SCOLS = [{ k: 'svc', l: 'خدمت' }, { k: 'qty', l: 'تعداد', t: 'n' }, { k: 'amt', l: 'مبلغ خدمات', t: 'm' }, { k: 'fee', l: 'سهم', t: 'm' }];
const m5Id = n => 'm5d' + Array.from(String(n)).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36);
/* (m1Sec «سهم پزشکان»: doctor picker and one doctor's detail — in finance/inventory-manager-accountant-only-two.js) */
/* the all-doctors summary rows open that doctor */
/* (m1Render: these rows open that doctor — in finance/inventory-manager-accountant-only-two.js) */
document.addEventListener('change', e => { if (e.target && e.target.id === 'm5Doc') { M1.doc = e.target.value; m1Render() } });
document.addEventListener('click', e => { const tr = e.target && e.target.closest && e.target.closest('tr.m5pick'); if (tr) { M1.doc = tr.dataset.m5n; m1Render(); const x = document.querySelector('.m5one'); if (x) x.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
  const b = e.target && e.target.closest && e.target.closest('#m5AllX,#m5AllP'); if (!b || !M1.d || !M1.d.ok) return; const d = M1.d, sub = `${jDay(d.from)} تا ${jDay(d.to)}`, ids = [];
  d.docs.by.forEach(x => { const id = m5Id(x.name), R = m5Rows(d, x.name); FT(id + 's', 'سهم ' + x.name + ' به تفکیک خدمت — جمع ' + nf(x.fee), M5_SCOLS, m5Svc(R), { sum: ['qty', 'amt', 'fee'], sub }); FT(id, 'ریز سهم ' + x.name, M5_COLS, R, { sum: ['amt', 'fee'], sub, land: 1 }); ids.push(id + 's', id) });
  if (!ids.length) { toast('در این بازه سهمی نیست.', 1); return }
  if (b.id === 'm5AllX') { const S = d.docs.by.map(x => { const id = m5Id(x.name), a = ftSheet(id + 's'), c = ftSheet(id); a.rows = a.rows.concat([[]], [c.head], c.rows); if (c.foot) a.rows.push(c.foot); a.name = String(x.name).replace(/[\\\/?*\[\]:]/g, ' ').slice(0, 30) || 'پزشک'; return a });
    xlsx(S, 'سهم-پزشکان-' + toEn(jDay(d.from)).replace(/\//g, '-') + '-تا-' + toEn(jDay(d.to)).replace(/\//g, '-')); return }
  let html = ftPrintDoc(ids, 'سهم پزشکان به تفکیک — ' + sub), k = 0; html = html.replace('</style>', 'h2.m5brk{page-break-before:always}</style>').replace(/<h2>(سهم [^<]* به تفکیک خدمت)/g, (m, t) => (k++ ? '<h2 class="m5brk">' : '<h2>') + t);
  printHTML(html) });
document.addEventListener('keydown', e => { const tr = e.target && e.target.closest && e.target.closest('tr.m5pick'); if (tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tr.click() } });
/* ---- «ایمپلنت‌های مصرفی»: a fifth card — which sizes went to which patients / file numbers in the period ---- */
M1.isz = '';
const m5Sz = r => [r.b, r.sys].filter(Boolean).join(' ') + (r.d ? ' ' + faD(String(r.d)) + (r.l ? '×' + faD(String(r.l)) : '') : '');
/* (m1Cards: the fifth card — in finance/inventory-manager-accountant-only-two.js) */
/* (m1Sec «ایمپلنت‌های مصرفی»: replaced by m49a, in finance/inventory-manager-accountant-only-two.js) */
/* (m1Render: size rows — in finance/inventory-manager-accountant-only-two.js) */
document.addEventListener('change', e => { if (e.target && e.target.id === 'm5Sz') { M1.isz = e.target.value; m1Render() } });
document.addEventListener('click', e => { const tr = e.target && e.target.closest && e.target.closest('tr.m5pick[data-m5s]'); if (!tr) return; e.stopImmediatePropagation(); M1.isz = tr.dataset.m5s; m1Render(); const x = document.querySelector('[data-ft="m5imp"]'); if (x) x.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, true);
