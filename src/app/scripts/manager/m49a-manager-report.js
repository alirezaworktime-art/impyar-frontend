/* ---------- m49a (owner, 2026-11-18): manager report «ایمپلنت‌های مصرفی» —
   (1) three columns «کاشت موفق / کاشت مجدد / فیل اولیه» (from the surgery session of each fixture; server sends rs per row);
   (2) a table by brand beside the table by size; a tap on a brand or a size lists the files that got it in the chosen period, each with a «پرونده» button;
   (3) the period above the tables: a new period chosen while the report was still loading was dropped (the tables kept the old dates) — now the last request wins,
       and choosing a date in «از / تا» loads without pressing «نمایش». ---------- */
M1.ibr = '';
const M49_RS = { new: 'کاشت موفق', redo: 'کاشت مجدد', fail: 'فیل اولیه' };
const m49K = r => r.rs === 'fail' ? 'fail' : r.rs === 'redo' ? 'redo' : 'ok';
/* (m1Load: the last request wins — in finance/inventory-manager-accountant-only-two.js) */
document.addEventListener('change', e => { const t = e.target; if (!t || (t.id !== 'm1From' && t.id !== 'm1To')) return; try { const f = parseJ($('m1From').value), o = parseJ($('m1To').value); if (!f || !o || f > o) return; const p = M1.per || {}; if (p.from === f && p.to === o) return; M1.per = { from: f, to: o }; M1.pk = 'c'; m1Load() } catch (x) { } });
/* (m1Sec «ایمپلنت‌های مصرفی»: in finance/inventory-manager-accountant-only-two.js) */
/* (m1Render: brand rows — in finance/inventory-manager-accountant-only-two.js) */
const m49Go = () => { m1Render(); const x = document.querySelector('[data-ft="m5imp"]'); if (x) x.scrollIntoView({ behavior: 'smooth', block: 'start' }) };
document.addEventListener('change', e => { if (e.target && e.target.id === 'm49Br') { M1.ibr = e.target.value; M1.isz = ''; m1Render() } });
document.addEventListener('click', e => { const t = e.target && e.target.closest ? e.target : null; if (!t) return; if (t.closest('#m49Clr')) { M1.ibr = ''; M1.isz = ''; m1Render(); return } const tr = t.closest('tr.m5pick[data-m49b]'); if (!tr) return; e.stopImmediatePropagation(); M1.ibr = tr.dataset.m49b === M1.ibr ? '' : tr.dataset.m49b; M1.isz = ''; m49Go() }, true);
