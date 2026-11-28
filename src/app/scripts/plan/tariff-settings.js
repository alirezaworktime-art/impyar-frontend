/* ---------- tariff settings ---------- */
const unitLbl=x=>x.ul?' · '+x.ul:(x.price==='unit'||x.price==='brandUnit'?' · هر واحد':'');
/* renderPriceSettings layers: base + pl9 + arc10 + m14 + m35 + m43d + m55a (each added part has its own try, as the wrappers had) */
function renderPriceSettings(){const P=SET.prices||{};const inp=(k,v,b)=>`<input class="price" inputmode="numeric" data-tp="${k}" ${b?`data-tb="${b}"`:''} value="${esc(fmtInput(v))}">`;
  $('set_prices').innerHTML=SECTIONS.filter(x=>x.price&&(x.price!=='implantBrand'||x.prosJaw)).map(x=>{const t=P[x.id]||{},bp=t.bp||{};
    if(x.price==='aox'){const ib=((P.imp||{}).bp||{}).it;return `<div class="grp"><span>All on X کلاسیک · پروتز هر پایه</span>${inp(x.id,t.price||x.def)}</div>`+x.xp.map(it=>`<div class="grp"><span>${it.l}</span>${inp(it.pk,(P[it.pk]||{}).price||it.def||ib)}</div>`).join('')}
    if(x.prosJaw)return `<div class="grp"><span>${x.t} · پروتز هر فک</span>${inp(x.id,t.price||x.def)}</div>`;
    if(x.price==='items')return (x.base?`<div class="grp"><span>${x.t} · قیمت جراحی هر واحد</span>${inp(x.id,t.price||x.def)}</div>`:'')+x.items.map(it=>`<div class="grp"><span>${x.t===it.l?'':x.t+' · '}${it.l} · ${it.ul||(it.type==='chips'?'هر طرف':'هر واحد')}</span>${inp(it.pk,(P[it.pk]||{}).price||it.def)}</div>`).join('');
    const extra=(x.items||[]).map(it=>`<div class="grp"><span>${it.l}</span>${inp(it.pk,(P[it.pk]||{}).price)}</div>`).join('');
    if(x.items)return `<div class="grp"><span>${x.t}${unitLbl(x)}</span>${inp(x.id,t.price)}</div>`+extra;
    const inner=x.price==='brandUnit'?`<div class="brands">${BRANDS.map(b=>`<label class="f">${b.n}${inp(x.id,bp[b.k]||(x.id==='imp'&&b.k==='rt'?'21000000':''),b.k)}</label>`).join('')}</div>`:inp(x.id,t.price);
    return `<div class="grp"><span>${x.t}${unitLbl(x)}${x.pros?' (پروتز)':''}</span>${inner}</div>`}).join('')+'<p class="note">اوردنچر از تعرفه‌ی «پایه ایمپلنت» هر برند حساب می‌شود.</p>';
  /* pl9: no anaesthesia tariff box here */
  try { const i = document.querySelector('#set_prices [data-tp="anes"]'); const g = i && i.closest('.grp'); if (g) g.remove() } catch (e) { }
  /* arc10: tariffs of the paper-file form (A10_TP) */
  try { const w = $('set_prices'), P = SET.prices || {}; if (w && !w.querySelector('[data-tp="arc_unc"]')) w.insertAdjacentHTML('beforeend', `<h4 class="a10ph">پرونده‌ی جا مانده</h4>` + A10_TP.map(([k, l, d]) => `<div class="grp"><span>${l}</span><input class="price" inputmode="numeric" data-tp="${k}" value="${esc(fmtInput((P[k] || {}).price || (d ? String(d) : '')))}"></div>`).join('')) } catch (e) { }
  /* m14: CT scan and anaesthesia (paper file) tariffs */
  try { const w = $('set_prices'), P = SET.prices || {}; if (w) {
  [['cbct', 'CT scan / CBCT · هر مورد'], ['anes', 'زمان بیهوشی · پرونده‌ی کاغذی']].forEach(([k, l]) => { if (w.querySelector(`[data-tp="${k}"]`)) return; w.insertAdjacentHTML('beforeend', `<div class="grp"><span>${l}</span><input class="price" inputmode="numeric" data-tp="${k}" value="${esc(fmtInput((P[k] || {}).price || ''))}"></div>`) }) } } catch (e) { }
  /* m35: a separate tariff for each level of a paper-file treatment (M35_TP) */
  try { const w = $('set_prices'), P = SET.prices || {}; if (w && !w.querySelector('[data-tp^="lv_"]'))
  w.insertAdjacentHTML('beforeend', `<h4 class="a10ph">پرونده‌ی جا مانده — تعرفه‌ی جدای هر سطح (خالی = همان تعرفه‌ی پایه)</h4>` + M35_TP.map(([k, l]) => `<div class="grp"><span>${l}</span><input class="price" inputmode="numeric" data-tp="${m35K(k)}" value="${esc(fmtInput((P[m35K(k)] || {}).price || ''))}" placeholder="همان پایه"></div>`).join('')) } catch (e) {}
  /* m43d: temporary prosthesis PMMA / Essix / denture and the default amounts of the prosthesis steps */
  try{const stepU=k=>A13_TEETH[k]?'هر دندان':k==='essix'?'هر فک':'هر جلسه';const w=$('set_prices'),P=SET.prices||{};if(w&&!w.querySelector('[data-tp="tmp_es"]')){
  const inp=(k,l)=>`<div class="grp"><span>${l}</span><input class="price" inputmode="numeric" data-tp="${k}" value="${esc(fmtInput((P[k]||{}).price||''))}"></div>`;
  const t=w.querySelector('[data-tp="tmp"]'),g=t&&t.closest('.grp');
  if(g){const sp=g.querySelector('span');if(sp)sp.textContent='روکش موقت PMMA · هر واحد (پروتز)';g.insertAdjacentHTML('afterend',inp('tmp_es','روکش موقت Essix · هر فک (پروتز)')+inp('tmp_dn','روکش موقت دنچر · هر فک (پروتز)'))}
  w.insertAdjacentHTML('beforeend','<h4 class="a10ph">مراحل پروتز در پرونده‌ی جا مانده — پیش‌فرض مبلغ</h4>'+A13_TY.map(([k,n])=>inp('pr_'+k,esc(n)+' · '+stepU(k))).join(''))}}catch(e){console.error('m43d set',e)}
  /* m55a: the three «موارد خاص» implant tariffs */
  try { const el = $('set_prices'), P = SET.prices || {}; if (el && !el.querySelector('[data-tp="sp_z"]')) {
  const h = ['z', 'n', 't'].map(k => `<div class="grp"><span>پایه ایمپلنت · ${M55_ZN[k]} (موارد خاص) · هر واحد</span><input class="price" inputmode="numeric" data-tp="sp_${k}" value="${esc(fmtInput((P['sp_' + k] || {}).price || ''))}" placeholder="خالی = تعرفه‌ی All on X ${M55_ZN[k]}"></div>`).join('');
  const n = el.querySelector('.note'); if (n) n.insertAdjacentHTML('beforebegin', h); else el.insertAdjacentHTML('beforeend', h) } } catch (e) { console.error('m55a set', e) }}
function readPriceSettings(){const P={};document.querySelectorAll('#set_prices [data-tp]').forEach(i=>{const id=i.dataset.tp;P[id]=P[id]||{price:'',bp:{}};
  if(i.dataset.tb)P[id].bp[i.dataset.tb]=String(num(i.value)||'');else P[id].price=String(num(i.value)||'')});return P}

