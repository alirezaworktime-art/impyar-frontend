/* ---------- xl: implant reason per fixture + the clinic's Excel reports in accounting ---------- */
var IMPRS='new';
const XL_RS={new:'جديد',redo:'کاشت مجدد',fail:'فيل اوليه'};
/* xlRsBtns: base + ex1 (loan fixture / early failure rows: ex1ImpUI) + pk2 (re-implant first / second and its tariff: pk2UI) */
function xlRsBtns(){document.querySelectorAll('#impSheet [data-rs]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.rs===IMPRS));try{ex1ImpUI()}catch(e){}try{pk2UI()}catch(e){}}
FREND.xl=async B=>{const p=FIN.per.xl||(FIN.per.xl=perRange('m'));const j=await api('finXl',p);const sub=perSub('xl');
  const mcols=[{k:'svc',l:'نام خدمت'}].concat(j.docs.map(d=>({k:'d:'+d,l:d,t:'m',v:r=>r.c[d]||''})),[{k:'tot',l:'جمع',t:'m'}]);
  B.innerHTML=`${perHTML('xl')}<p class="note">همان چهار گزارش اکسل کلینیک (ماکرو sabt): «مبلغ کل» = تعداد × تعرفه‌ی پزشک (سهم پزشک) از صورتحساب‌های ثبت‌شده؛ فیکسچرها و آرشیو از جلسه‌های جراحی ثبت‌شده در این بازه. برای «کاشت مجدد» و «فيل اوليه» سهم پزشک صفر است.</p>
   <div class="btns"><button class="btn sm ghost" type="button" data-fx="x:xlM,xlD,xlF,xlS,xlA">⬇ اکسل همه (۵ شیت)</button><button class="btn sm ghost" type="button" data-fx="p:xlM,xlD">🖨 چاپ گزارش پزشکان</button></div>
   <section class="card">${FT('xlM','گزارش پزشکان و خدمات',mcols,j.matrix,{sum:mcols.slice(1).map(c=>c.k),sub,land:1,empty:'در این بازه صورتحسابی ثبت نشده.'})}</section>
   <section class="card">${FT('xlD','دستمزد پزشکان تخصصی',[{k:'doc',l:'نام پزشک'},{k:'pats',l:'بیمار',t:'n'},{k:'rows',l:'تعداد ردیف خدمت',t:'n'},{k:'n',l:'تعداد',t:'n'},{k:'fee',l:'جمع مبلغ کل (سهم پزشک)',t:'m'},{k:'amt',l:'صورت حساب بیمار',t:'m'}],j.perDoc,{sum:['pats','rows','n','fee','amt'],sub})}</section>
   <div class="fcols"><section class="card">${FT('xlF','گزارش تعداد فیکسچر',[{k:'brand',l:'برند'},{k:'size',l:'سایز فیکسچر'},{k:'n',l:'تعداد',t:'n'},{k:'new',l:'جديد',t:'n'},{k:'redo',l:'کاشت مجدد',t:'n'},{k:'fail',l:'فيل اوليه',t:'n'}],j.fixtures,{sum:['n','new','redo','fail'],sub,empty:'در این بازه فیکسچری ثبت نشده.'})}</section>
   <section class="card">${FT('xlS','تعداد فیکسچر بر اساس سایز',[{k:'size',l:'سایز فیکسچر'},{k:'n',l:'تعداد',t:'n'}],j.sizes,{sum:['n'],sub})}</section></div>
   <section class="card">${FT('xlA','آرشيو ايمپلنت',[{k:'day',l:'تاریخ',t:'d'},{k:'name',l:'نام بیمار'},{k:'nid',l:'کد ملی'},{k:'phone',l:'موبایل'},{k:'doc',l:'نام پزشک'},{k:'kind',l:'نوع جراحی'},{k:'tooth',l:'شماره دندان',v:r=>toothTxt([r.tooth])},{k:'rs',l:'دليل جراحي'},{k:'brand',l:'برند'},{k:'size',l:'سایز فیکسچر'},{k:'note',l:'توضيحات'}],j.arch,{sub,land:1,empty:'در این بازه فیکسچری ثبت نشده.'})}</section>`};

