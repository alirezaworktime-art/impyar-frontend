/* ---------- ux6: (owner, 2026-11-04): duplicate / unused options removed ---------- */
var UX6={pay:{},mr:false};
/* (2) «⏱ حضور» only for a personal account; the manager keeps it (clinic internet setup lives in that sheet) */
function ux6Att(){try{document.body.classList.toggle('ux6nouser',!!ROLE&&!USERNAME&&ROLE!=='manager')}catch(e){}}
/* (applyRole → ux6Att(): merged into surgery/roles-live-queue-reception.js) */
{const _as=applySettings;applySettings=function(){const r=_as.apply(this,arguments);ux6Att();return r}}
/* (4) tiles: no «مالی بیماران» (= بایگانی), no reception «بازگشت بیماران»; «نوبت‌های داده‌شده» becomes the calendar tile;
   manager «داشبورد» + «گزارش‌های مدیریتی» in one tile */
{const _s=TILES.staff;TILES.staff=()=>_s().filter(t=>t.k!=='pay'&&t.k!=='wb').map(t=>t.k==='bkd'?Object.assign({},t,{l:'تقویم نوبت‌ها',s:'فهرست روزها، هفته و ماه'}):t)}
{const _c=TILES.consultant;TILES.consultant=()=>_c().filter(t=>t.k!=='pay')}
{const _m=TILES.manager;TILES.manager=()=>_m().filter(t=>t.k!=='mrep').map(t=>t.k==='dash'?Object.assign({},t,{l:'داشبورد و گزارش‌ها',s:'عملکرد کلینیک و گزارش‌های مدیریتی'}):t)}
try{TILE_HD.staff.bkd='تقویم نوبت‌ها'}catch(e){}
function ux6DashSeg(){const v=$('viewDash');if(!v||ROLE!=='manager')return;const hd=v.querySelector('.dhead');if(!hd)return;let s=$('ux6DSeg');
  if(!s){s=document.createElement('div');s.id='ux6DSeg';s.className='seg ux6dseg';s.setAttribute('role','group');s.setAttribute('aria-label','بخش');s.innerHTML='<button type="button" data-ux6d="0">داشبورد</button><button type="button" data-ux6d="1">گزارش‌های مدیریتی</button>';hd.after(s)}
  s.querySelectorAll('[data-ux6d]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.ux6d==='1')===UX6.mr)))}
{const _ma=mrApply;mrApply=function(){let r;if(ROLE==='manager'&&TILE==='dash'&&UX6.mr){const t0=TILE;TILE='mrep';try{r=_ma.apply(this,arguments)}finally{TILE=t0}}else r=_ma.apply(this,arguments);try{ux6DashSeg()}catch(e){}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ux6d]');if(!b)return;UX6.mr=b.dataset.ux6d==='1';mrApply();window.scrollTo(0,0)});
/* manager «صندوق و هزینه»: the debtors list is in «حسابداری کامل» and «گزارش‌های مدیریتی» */
(function(){const B=$('arBox');if(!B)return;new MutationObserver(()=>{B.querySelectorAll('h3.pf-h').forEach(h=>{if(/^بدهکاران \(پرداخت/.test(h.textContent.trim())){const n=h.nextElementSibling;if(n&&n.classList.contains('list'))n.remove();h.remove()}})}).observe(B,{childList:true})})();
/* (3) reception «کارهای الان»: only in «صف من», without the late-appointment rows that «صف من» already lists */
{const _rn=renderNow;renderNow=function(){const r=_rn.apply(this,arguments);try{const el=$('rNow');if(el&&!el.hidden){el.querySelectorAll('.rn').forEach(x=>{if(x.querySelector('[data-ast]'))x.remove()});
  const n=el.querySelectorAll('.rn').length;if(!n){el.hidden=true;el.innerHTML=''}else{const b=el.querySelector('.rnh b');if(b)b.textContent=fa(n);const m=el.querySelector('[data-nowall]');if(m&&n<=4&&!NOW_ALL)m.remove()}}}catch(e){}return r}}
/* booking tiles: one time control — امروز | فردا | هفته | ماه; the calendar tile keeps فهرست | هفته | ماه + «تقویم کامل» */
const UX6_AT={surg:1,chk:1,unc:1,pros:1};
function ux6Cv(){if(ROLE!=='staff')return;const h=$('rAll')&&$('rAll').querySelector('.tilehd');if(!h)return;const a=h.querySelector('.acts');if(!a)return;
  if(UX6_AT[TILE]){const cv=a.querySelector('.fx2cv');if(!cv)return;const m=(FX2CV[TILE]||{}).m||'list',L=cv.querySelector('[data-fx2cv="list"]:not([data-ux6rad])');
    if(L)L.outerHTML='<button type="button" data-fx2cv="list" data-ux6rad="t">امروز</button><button type="button" data-fx2cv="list" data-ux6rad="f">فردا</button>';
    cv.querySelectorAll('[data-fx2cv]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ux6rad?(m==='list'&&RAD===b.dataset.ux6rad):b.dataset.fx2cv===m)))}
  if(TILE==='bkd'&&!a.querySelector('[data-ux6cal]'))a.insertAdjacentHTML('beforeend','<button class="btn sm ghost" type="button" data-gocal data-cmode="week" data-ux6cal="1">تقویم کامل</button>')}
{const _fh=fx2Head;fx2Head=function(){const r=_fh.apply(this,arguments);try{ux6Cv()}catch(e){}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ux6rad]');if(!b||ROLE!=='staff')return;RAD=b.dataset.ux6rad;try{renderRecepAppts()}catch(x){}},true);
/* «طرح درمان دوباره» (appointment cards, follow-ups): straight to the plan doctor; the general «ارجاع به پزشک…» keeps the purpose picker */
window.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-ux6plan][data-todoc]');if(!t)return;e.preventDefault();e.stopImmediatePropagation();sendToDoctor(t.dataset.todoc,t.dataset.tdn,t.dataset.tdp)},true);
/* file › payments: one entry «＋ دریافت پرداخت» (one payment / several monthly cheques / cheques of the plan / consultant's balance) */
function ux6PayWrap(h,j,r){const i=h.indexOf('<div class="payform">');if(i<0)return h;const id=(j&&j.id)||(r&&r.id)||(PF&&PF.id)||'';
  let head=h.slice(0,i);const form=h.slice(i);const cut=re=>{const m=head.match(re);if(!m)return '';head=head.replace(m[0],'');return m[0].replace(/^<div class="btns">/,'').replace(/<\/div>$/,'')};
  const plan=cut(/<div class="btns"><button class="btn sm" type="button" data-chqplan="1">[^<]*<\/button><\/div>/),rest=cut(/<div class="btns"><button class="btn sm main" type="button" data-p4rest="[^"]*">[^<]*<\/button><\/div>/);
  const k=form.indexOf('<details class="instc"'),one=k<0?form:form.slice(0,k),multi=k<0?'':form.slice(k).replace('<details class="instc"','<details class="instc" open');
  const S=UX6.pay[id]||{};if(!S.open)return head+'<div class="btns ux6pbtn"><button class="btn main" type="button" data-ux6pay="open">＋ دریافت پرداخت</button></div>';
  const m=S.m==='multi'&&multi?'multi':'one';
  return head+`<section class="ux6pbox" aria-label="دریافت پرداخت"><div class="ux6ph"><b>دریافت پرداخت</b><button class="btn sm ghost" type="button" data-ux6pay="close">بستن</button></div>
    <div class="seg ux6pseg" role="group" aria-label="نوع دریافت"><button type="button" data-ux6pm="one" aria-pressed="${m==='one'}">یک پرداخت (نقد، کارت یا چک)</button>${multi?`<button type="button" data-ux6pm="multi" aria-pressed="${m==='multi'}">چند چک ماهانه</button>`:''}</div>
    ${rest||plan?`<div class="btns ux6pact">${rest}${plan}</div>`:''}${m==='one'?one:multi}</section>`}
{const _pp=pfPays;pfPays=function(j,r){let h=_pp.apply(this,arguments);try{h=ux6PayWrap(h,j,r)}catch(e){console.error('ux6 pay',e)}return h}}
{const _of=openFile;openFile=function(id,name,tab){if(tab==='pay'&&id)UX6.pay[id]=Object.assign({},UX6.pay[id],{open:true});return _of.apply(this,arguments)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ux6pay],[data-ux6pm]');if(!b||!PF)return;const id=PF.id;try{if($('py_amount'))pyRead()}catch(x){}
  const S=UX6.pay[id]=Object.assign({},UX6.pay[id]);if(b.dataset.ux6pay)S.open=b.dataset.ux6pay==='open';else S.m=b.dataset.ux6pm;if(S.m==='multi')IC.open=true;renderFile()});
/* surgeon's file: «شروع مرحله‌ی پروتز» only after surgery, for a prosthesis-only patient or a paper file */
{const _pr=pfPros;pfPros=function(j,r){const h=_pr.apply(this,arguments);try{if(ROLE==='surgery'&&j&&!j.pros){const d=j.data||{},hh=d.h||{},ses=(j.surg&&j.surg.sessions)||[];
  if(!(Number(j.surgN)>0||ses.length||hh.pOnly||j.pOnly||j.arc||d.arc))return h.replace(/<div class="btns"><button class="btn" type="button" data-pnext=[\s\S]*<\/div>$/,'')}}catch(e){}return h}}
/* the reception form lives in the reception view: open it there when «طرح درمان دوباره» is used from the archive */
/* (sendToDoctor: merged into surgery/roles-live-queue-reception.js) */

