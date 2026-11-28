/* ---------- ponly: prosthesis-only patients, abutment/pontic required in the lab order, full patient info for the prosthesis doctor ---------- */
const l4Map=j=>(j&&j.pros&&j.pros.map)||{};
const l4HasA=j=>Object.values(l4Map(j)).includes('a');
/* reception */
/* rcReset / rcEdit «فقط پروتز»: merged into surgery/roles-live-queue-reception.js */
/* prosthesis doctor: patient info + abutment/pontic on top of the lab order */
function l4Info(j){const r=fromDoc(PF.id,j.data||{}),h=r.h||{},imp=implantsOf(j),ms=medShort(r.med);let lines=[];try{lines=secLines(r.s||{})}catch(e){}
  const kv=[['نام',h.name],['سن',h.age&&faD(h.age)],['موبایل',h.phone&&faD(h.phone)],['پزشک طرح',h.doc],['پذیرش',h.date]].filter(x=>x[1]);
  return `<section class="l4info"><div class="row1"><b>اطلاعات بیمار</b>${h.pOnly?'<span class="pill wait">فقط پروتز · ایمپلنت در جای دیگر</span>':''}</div>
    <div class="l2info">${kv.map(([k,v])=>`<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>
    <div class="meta"><b>سابقه‌ی پزشکی:</b> ${ms?`<span class="late">${esc(ms)}</span>`:'مورد خاصی ثبت نشده'}${r.note?' · '+esc(r.note):''}</div>
    ${lines.length?`<div class="meta"><b>طرح تأییدشده:</b> ${lines.map(l=>esc(l.t)+(l.d&&l.d!=='—'?' ('+esc(l.d)+')':'')).join(' · ')}</div>`:''}
    <div class="meta"><b>ایمپلنت‌ها:</b> ${Object.keys(imp).length?Object.keys(imp).map(k=>esc(toothTxt([k]))+' '+esc(impTxt(imp[k]))).join('؛ '):h.pOnly?'در جای دیگر کاشته شده؛ برند و سیستم را در «سیستم ایمپلنت» بنویسید':'در جلسات جراحی ثبت نشده'}</div></section>`}
(function(){const _p=pfPros;pfPros=function(j,r){const h=_p.apply(this,arguments);return LO&&canLab()&&j.pros?l4Info(j)+h:h}})();
(function(){const _f=loForm;loForm=function(j){const M=l4Map(j),K=Object.keys(M);
    if(K.length){LO.all=K;LO.pon=K.filter(k=>M[k]==='p');if(!LO.teeth.length||LO.teeth.some(k=>!K.includes(k)))LO.teeth=K.slice()}else{LO.all=[];LO.teeth=[];LO.pon=[]}
    let h=_f.apply(this,arguments);const A=K.filter(k=>M[k]==='a'),P=K.filter(k=>M[k]==='p');
    const blk=`<div class="l4map${A.length?'':' l4need'}"><div><b>پایه و پونتیک</b> <small class="note">(اجباری؛ پزشک روی چارت دندان تعیین می‌کند)</small><div class="meta">${A.length?'پایه‌ها: <b>'+esc(toothTxt(A))+'</b>'+(P.length?' · پونتیک: <b>'+esc(toothTxt(P))+'</b>':''):'<b class="late">هنوز تعیین نشده</b>'}</div></div><button class="btn sm${A.length?' ghost':' main'}" type="button" data-pmap="${esc(PF.id)}" data-pmn="${esc((fromDoc(PF.id,j.data||{}).h||{}).name||'')}">🦷 ${A.length?'ویرایش پایه و پونتیک':'تعیین پایه و پونتیک'}</button></div>`;
    h=h.replace('<div class="grp"><span>دندان‌ها',blk+'<div class="grp"><span>دندان‌های این سفارش').replace(' (ایمپلنتی در جلسات جراحی ثبت نشده؛ در توضیح بنویسید)',' (اول پایه و پونتیک را تعیین کنید)');return h}})();
(function(){const _s=loSend;loSend=async function(t){if(PF&&!l4HasA(PF.j)){const m=$('loMsg');if(m){m.className='msg err';m.textContent='اول «تعیین پایه و پونتیک» را بزنید و پایه‌ها را روی چارت دندان مشخص کنید.'}return}return _s.apply(this,arguments)}})();
(function(){const _o=l3OpenLab;l3OpenLab=async function(id){const r=await _o.apply(this,arguments);try{if(PF&&PF.id===id&&LO&&PF.j.pros&&!l4HasA(PF.j))setTimeout(()=>openPmap(id,(fromDoc(id,PF.j.data||{}).h||{}).name||''),300)}catch(e){}return r}})();

