/* ---------- appointments: calendar ---------- */
const CAL={start:'',sel:'',items:[],loaded:false,mode:(()=>{try{return localStorage.getItem('implantCalMode')==='month'?'month':'week'}catch(e){return 'week'}})()};
const jParts=d=>toEn(jDay(d)).split('/').map(Number);
function jMonth(d){const m=jParts(d)[1];let a=d,b=d;for(let i=0;i<32&&jParts(dAdd(a,-1))[1]===m;i++)a=dAdd(a,-1);for(let i=0;i<32&&jParts(dAdd(b,1))[1]===m;i++)b=dAdd(b,1);return [a,b]}
function calSetMode(m){CAL.mode=m==='month'?'month':'week';try{localStorage.setItem('implantCalMode',CAL.mode)}catch(e){}if(!CAL.sel)CAL.sel=tDay();CAL.start=weekStart(CAL.sel)}
const weekStart=d=>{const g=new Date(d+'T12:00:00Z').getUTCDay();return dAdd(d,-((g+1)%7))};
async function loadCal(){if(!CAL.start){CAL.sel=tDay();CAL.start=weekStart(CAL.sel)}const td=tDay(),R0=CAL.mode==='month'?jMonth(CAL.sel):[CAL.start,dAdd(CAL.start,6)],from=R0[0]<td?R0[0]:td,end=R0[1],to=end>dAdd(td,1)?end:dAdd(td,1);
  try{const j=await api('apptList',{from,to});CAL.items=j.items||[];CAL.loaded=true;renderCal()}catch(e){if(e.message!=='aborted')$('calList').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
function apptMsg(a){const c=SET.clinic||'کلینیک';return `${a.name?a.name+' عزیز':'بیمار عزیز'}، سلام. یادآوری نوبت ${AKL[a.kind]||'ویزیت'} شما در ${c}: ${wDay(a.day)} ${jDay(a.day)}${a.time?' ساعت '+faD(a.time):''}.${SET.phone?' هماهنگی: '+SET.phone:''}`}
/* apptCard: base + pl10 (opt 3: remaining 30 % on the impression card) + chart-teeth §4 (prosthesis remainder on try-in/abutment/delivery cards) */
function apptCard(a,o={}){const n=dDiff(a.day,tDay()),st=a.st||'set',can=canAppt();
  const stp=st==='done'?'<span class="pill done">انجام شد</span>':st==='cancel'?'<span class="pill">لغو شد</span>':st==='noshow'?'<span class="pill settle">نیامد</span>':a.sms?'<span class="pill done">یادآوری رفت</span>':'';
  const sms=a.phone&&smsLink(a.phone,apptMsg(a));
  let h=`<div class="item appt st-${st} kg-${kGrp(a.kind)}">${a.note==='جراحی خارج نوبت'?'<div class="xnob">جراحی خارج نوبت</div>':''}<div class="row1"><div><span class="tm">${a.time?faD(a.time):'بدون ساعت'}</span><span class="nm">${esc(a.name)}</span>
    <div class="meta">${!a.time&&a.st==='set'&&can?'<b class="late">ساعت را تعیین کنید</b> · ':''}${a.by==='خودکار'?'ثبت خودکار از روز جراحی · ':''}${o.date?esc(wDay(a.day)+' '+jDay(a.day))+' · ':''}${a.dur?fa(a.dur)+' دقیقه':''}${a.doc?' · '+esc(a.doc):''}${a.phone?' · '+esc(faD(a.phone)):''}</div>${a.note?`<div class="meta">${esc(a.note)}</div>`:''}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><span class="pill kp-${kGrp(a.kind)}">${esc(AKL[a.kind]||a.kind)}</span>${a.onl==='1'?'<span class="pill done">طرح آنلاین دارد</span>':a.onl==='0'?'<span class="pill">بدون طرح آنلاین</span>':''}${stp}</div></div>
    <div class="acts">${st==='set'&&sms&&n>=0&&n<=2?`<a class="btn sm${a.sms?' ghost':''}" href="${sms}" data-asms="${esc(a.id)}">${a.sms?'پیامک دوباره':'پیامک یادآوری'}</a>`:''}${a.phone?`<a class="btn sm ghost" href="tel:${esc(toEn(a.phone))}">تماس</a>`:''}
      ${st==='set'&&(can||ROLE==='surgery')&&n<=0&&!(a.plan&&SG_K.includes(a.kind))?`<button class="btn sm" data-ast="done" data-aid="${esc(a.id)}" type="button">انجام شد</button>`:''}${st==='set'&&can&&a.plan&&SG_K.includes(a.kind)&&n<=0?`<button class="btn sm" data-tosurg="${esc(a.plan)}" type="button">ارجاع به جراح</button>`:''}${a.owe>0&&ROLE==='staff'&&a.plan&&st==='set'&&SG_K.includes(a.kind)?`<button class="btn sm main" type="button" data-p4rest="${esc(a.plan)}">تعیین تکلیف مالی (${fa(a.owe)} مانده)</button>`:''}${apRefBtn(a,st,n)}${st!=='cancel'&&ROLE==='staff'?`<button data-ux6plan="1" class="btn sm ghost" data-todoc="${esc(a.plan||'')}" data-tdn="${esc(a.name||'')}" data-tdp="${esc(a.phone||'')}" type="button">طرح درمان دوباره</button>`:''}
      ${moreMenu((st==='set'&&can&&n<=0?`<button class="btn sm ghost" data-ast="noshow" data-aid="${esc(a.id)}" type="button">نیامد</button>`:'')
      +(st==='set'&&can?`<button class="btn sm ghost" data-aedit="${esc(a.id)}" type="button">جابه‌جایی / ویرایش</button><button class="btn sm ghost danger" data-ast="cancel" data-aid="${esc(a.id)}" type="button">لغو نوبت</button>`:'')
      +(st!=='set'&&can?`<button class="btn sm ghost" data-ast="set" data-aid="${esc(a.id)}" type="button">برگرداندن</button>`:'')
      +(a.plan&&!o.nofile?`<button class="btn sm ghost" data-file="${esc(a.plan)}" data-fname="${esc(a.name)}" type="button">پرونده</button>`:''))}</div></div>`;
  /* pl10: the remaining 30 % (option 3) shows on the impression appointment card for reception */
  try { if (a && a.owe > 0 && a.kind === 'impr' && ROLE === 'staff' && a.plan && (a.st || 'set') === 'set' && h.indexOf('data-p4rest') < 0) h = h.replace('<div class="acts">', `<div class="acts"><button class="btn sm main" type="button" data-p4rest="${esc(a.plan)}">تعیین تکلیف مالی (${fa(a.owe)} مانده)</button>`) } catch (e) { }
  /* chart-teeth §4: the prosthesis remainder on try-in / resin / abutment / delivery cards (data-m10pp is read by chart-teeth's click listener) */
  try { if (a && a.owe > 0 && a.oweP && ROLE === 'staff' && a.plan && (a.st || 'set') === 'set' && ['tryin', 'rscr', 'rabt', 'deliv'].includes(a.kind) && h.indexOf('data-p4rest') < 0)
  h = h.replace('<div class="acts">', `<div class="acts"><button class="btn sm main" type="button" data-p4rest="${esc(a.plan)}" data-m10pp="1">تعیین تکلیف مالی پروتز (${fa(a.owe)} مانده)</button>`) } catch (e) { }
  return h}
function moreMenu(h){return h?`<details class="more"><summary class="btn sm ghost">⋯ بیشتر</summary><div class="menu">${h}</div></details>`:''}
document.addEventListener('click',e=>{const d=e.target.closest&&e.target.closest('details.more');document.querySelectorAll('details.more[open]').forEach(x=>{if(x!==d)x.open=false});if(d&&e.target.closest('.menu'))setTimeout(()=>{d.open=false},0)});
function renderCal(){const td=tDay(),cap=Number(SET.cap)||0,days=[...Array(7)].map((_,i)=>dAdd(CAL.start,i));
  $('calNew').hidden=!canAppt();
  const jS=d=>{const p=toEn(jDay(d)).split('/').map(Number);return faD(String(p[2]))+' '+JMN[p[1]-1]};$('calRange').textContent=`${jS(days[0])} تا ${jS(days[6])}`;
  const MO=CAL.mode==='month';document.querySelectorAll('.calmode [data-cmode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.cmode===CAL.mode));
  $('calPrev').textContent=MO?'→ ماه قبل':'→ هفته‌ی قبل';$('calNext').textContent=MO?'ماه بعد ←':'هفته‌ی بعد ←';$('calDays').hidden=MO;$('calMonth').hidden=!MO;
  if(MO){const [a,b]=jMonth(CAL.sel),jp=jParts(a),lead=dDiff(a,weekStart(a)),cells=[];$('calRange').textContent=`${JMN[jp[1]-1]} ${faD(String(jp[0]))}`;
    for(let i=0;i<lead;i++)cells.push('<span class="mc0"></span>');
    for(let d=a;d<=b;d=dAdd(d,1)){const its=CAL.items.filter(x=>x.day===d&&x.st!=='cancel'),sg=its.filter(x=>x.kind==='surg').length;
      cells.push(`<button type="button" class="mday${d===td?' today':''}${new Date(d+'T12:00:00Z').getUTCDay()===5?' fri':''}${d<td?' past':''}${its.length?' has':''}" data-cday="${d}" aria-pressed="${d===CAL.sel}"><b>${faD(String(jParts(d)[2]))}</b>${its.length?`<span class="dots">${kDots(its)}</span><span class="n">${fa(its.length)}<i> نوبت</i></span>`:''}${sg?`<span class="cap${cap&&sg>=cap?' full':''}"><i>جراحی </i>${fa(sg)}${cap?'/'+fa(cap):''}</span>`:''}</button>`)}
    $('calMonth').innerHTML='<div class="mhd">'+['ش','ی','د','س','چ','پ','ج'].map(x=>`<span>${x}</span>`).join('')+'</div><div class="mgr">'+cells.join('')+'</div>'}
  $('calDays').innerHTML=days.map(d=>{const its=CAL.items.filter(a=>a.day===d&&a.st!=='cancel'),sg=its.filter(a=>a.kind==='surg').length,p=d.split('-');
    return `<button type="button" class="day${d===td?' today':''}${new Date(d+'T12:00:00Z').getUTCDay()===5?' fri':''}" data-cday="${d}" aria-pressed="${d===CAL.sel}"><small>${esc(wDayS(d))}</small><b>${faD(String(+toEn(jDay(d)).split('/')[2]))}</b><span class="n">${its.length?fa(its.length)+' نوبت':'—'}</span>${its.length?`<span class="dots">${kDots(its)}</span>`:''}${sg?`<span class="cap${cap&&sg>=cap?' full':''}">جراحی ${fa(sg)}${cap?'/'+fa(cap):''}</span>`:''}</button>`}).join('');
  const list=CAL.items.filter(a=>a.day===CAL.sel).sort((a,b)=>a.time<b.time?-1:1);
  $('calDayT').textContent=`${wDay(CAL.sel)} ${jDay(CAL.sel)}`+(CAL.sel===td?' (امروز)':CAL.sel===dAdd(td,1)?' (فردا)':'');
  $('calList').innerHTML=list.length?list.map(a=>apptCard(a)).join(''):`<div class="empty">برای این روز نوبتی ثبت نشده.${canAppt()?' با «+ نوبت جدید» ثبت کنید.':''}</div>`;
  const tm=CAL.items.filter(a=>a.day===dAdd(td,1)&&a.st==='set'),un=tm.filter(a=>!a.sms&&a.phone);const rb=$('calRem');
  rb.hidden=!(canAppt()&&tm.length);if(!rb.hidden)rb.innerHTML=`فردا ${fa(tm.length)} نوبت دارید${un.length?`؛ <b>${fa(un.length)} یادآوری هنوز فرستاده نشده</b>`:'؛ یادآوری همه فرستاده شده'}. <button class="btn sm ghost" type="button" data-cday="${dAdd(td,1)}">نمایش فردا</button>`}

