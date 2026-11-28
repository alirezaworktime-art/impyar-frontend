/* ---------- a18: path bar of paper files — stages before the chosen «مرحله‌ی فعلی» and the paper lines (آنکاوری) count as done; the «مرحله‌ی بعدی» marker follows the chosen stage ---------- */
{ const _pb = pathBar; const A18_R = { sut: 0, unc: 1, heal: 1, imprw: 2, impr: 2, lab: 3, rabt: 3, frame: 3, jig: 3, bite: 3, tryin: 3, deliv: 4, done: 5 };
  pathBar = function (j) { const html = _pb.apply(this, arguments); try {
    const a = j && j.data && j.data.arc; if (!a) return html;
    const pr = j.pros || {}, sg = j.surg || {}, ses = sg.sessions || [], ap = j.appts || [], log = pr.log || [];
    const closed = a.open === false || pr.stage === 'done'; const st = closed ? 'done' : (a.stage && A18_R[a.stage] !== undefined ? a.stage : (pr.stage || ''));
    const rank = A18_R[st]; if (rank === undefined) return html;
    const lines = Array.isArray(a.lines) ? a.lines : [], lday = k => { const d = lines.filter(l => l && l.k === k && l.day).map(l => l.day).sort().pop(); return d ? d + 'T12:00:00Z' : '' };
    const lg = k => { const g = log.filter(x => x.k === k); return g.length ? g[g.length - 1].at : '' };
    const apDone = ks => { const x = ap.filter(y => ks.includes(y.kind) && y.st === 'done').sort((p, q) => p.day < q.day ? 1 : -1)[0]; return x ? x.day + 'T12:00:00Z' : '' };
    const ent = a.at || j.createdAt || '', first = lines.map(l => l && l.day).filter(Boolean).sort()[0]; const surgD = first ? first + 'T12:00:00Z' : (ses.length ? (ses[0].savedAt || ses[0].at) : '');
    const dn = (need, own) => own || (rank > need ? (lday('unc') && need >= 1 ? lday('unc') : ent) : '');
    const S = [['پذیرش', j.createdAt || ent], ['طرح درمان', ent], ['مشاوره', ent], ['جراحی', surgD || ent],
      ['بخیه', dn(0, apDone(['suture']))], ['انکاوری', lday('unc') || apDone(['uncover']) || (rank > 1 ? ent : '')], ['قالب', lg('impr') || (rank > 2 ? ent : '')], ['لابراتوار', lg('lab') || lg('tryin') || (rank > 3 ? ent : '')], ['تحویل', closed ? (lg('done') || ent) : '']];
    let cur = S.length; for (let i = 0; i < S.length; i++) { if (!S[i][1]) { cur = i; break } }
    const lost = j.queue === 'lost' || j.queue === 'undecided';
    return `<div class="pbar${lost ? ' lost' : ''}">${S.map(([l, d], i) => `<span class="ps${d ? ' ok' : ''}${i === cur ? ' cur' : ''}"><i></i><b>${l}</b><small>${d ? esc(jd(d)) : i === cur ? (lost ? (j.queue === 'lost' ? 'انصراف' : 'مردد') : 'مرحله‌ی بعدی') : ''}</small></span>`).join('')}</div>`;
  } catch (e) { return html } } }
