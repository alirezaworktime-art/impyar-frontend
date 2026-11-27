/* ---------- pros2: cheques of this patient, amounts and dates from the file ---------- */
let CQ=null;
/* chqGen: pros2 base + o3s (option 3: no cheque plan) */
function chqGen(){const j=PF.j||{},r=fromDoc(PF.id,j.data||{}),pv=PV(r,1),T=totals(pv),b=effBrand(r),S=T.surg[b]||0,P=T.pros||0,p=r.pay||{},out=[];
  if(S){if(p.opt==='1'){const n=num(p.n1);if(n){const x=splitPay(S,fracS(r),n);for(let i=0;i<n;i++)if(x.am[i]>0)out.push({part:'s',amount:x.am[i]})}}else{const x=splitPay(S,fracS(r),1);if(x.rest)out.push({part:'s',amount:x.rest})}}
  if(P){const n=num(p.n3);if(n){const x=splitPay(P,fracP(r),n);for(let i=0;i<n;i++)if(x.am[i]>0)out.push({part:'p',amount:x.am[i]})}}
  try{if(r&&pl10O3(r))return {r,out:[]}}catch(e){}return {r,out}}
function openChqPlan(){if(!PF||!PF.j)return;const {r,out}=chqGen(),rec=(PF.j.pays||[]).filter(p=>p.kind==='chq').sort((a,b)=>(a.due||'').localeCompare(b.due||''));
  const has=pt=>rec.some(p=>p.part===pt&&!/تسویه/.test(p.note||''));CQ={name:(r.h||{}).name||'',rec,gen:{s:has('s')?[]:out.filter(x=>x.part==='s'),p:has('p')?[]:out.filter(x=>x.part==='p')},first:{s:'',p:''}};
  mkSheet('cqSheet',`<h3>چک‌های ${esc(CQ.name)}</h3><p class="note">مبلغ‌ها از شرایط پرداخت طرح و چک‌های ثبت‌شده در پرونده می‌آید. برای چک‌هایی که هنوز ثبت نشده‌اند فقط تاریخ چک اول را بنویسید؛ بقیه ماهانه حساب می‌شود. «در وجه»، کد ملی و جابه‌جایی چاپ از تنظیمات «چاپ چک» همین دستگاه خوانده می‌شود.</p><div id="cqBody"></div><div class="msg" id="cqMsg"></div>
    <div class="btns" style="flex-wrap:wrap"><button class="btn" type="button" id="cqAll" style="flex:1">🖨 چاپ همه</button>${ROLE==='consultant'?'<button class="btn ghost" type="button" id="cqReg">ثبت چک‌های تازه در پرونده</button>':''}<button class="btn ghost" type="button" id="cqClose">بستن</button></div>`);
  cqRender();$('cqSheet').hidden=false}
function cqRows(){const R=CQ.rec.map(p=>({amount:Number(p.amount)||0,due:p.due,part:p.part,rec:1,no:p.no}));['s','p'].forEach(pt=>{const iso=parseJ(CQ.first[pt]||'');CQ.gen[pt].forEach((x,i)=>R.push({amount:x.amount,due:iso?jAddM(iso,i):'',part:pt,rec:0,i}))});return R}
function cqRender(){const R=cqRows(),PN={s:'جراحی',p:'پروتز','':''},row=(x,ix)=>`<tr><td>${fa(ix+1)}</td><td>${PN[x.part]||''}</td><td><b>${fa(x.amount)}</b></td><td>${x.due?esc(jDay(x.due)):'—'}</td><td>${x.rec?'ثبت‌شده':'تازه'}</td><td><button class="btn sm ghost" type="button" data-cqp="${ix}"${x.due?'':' disabled'}>🖨</button></td></tr>`;
  let h='';['s','p'].forEach(pt=>{if(CQ.gen[pt].length)h+=`<label class="f">سررسید چک اول ${PN[pt]} (${fa(CQ.gen[pt].length)} چک تازه)<input data-cqf="${pt}" inputmode="numeric" placeholder="۱۴۰۵/۰۹/۰۱" value="${esc(CQ.first[pt])}"></label>`});
  h+=R.length?`<table class="cqt"><thead><tr><th>#</th><th>بخش</th><th>مبلغ (تومان)</th><th>سررسید</th><th></th><th></th></tr></thead><tbody>${R.map(row).join('')}</tbody></table><p class="note">جمع: <b>${fa(R.reduce((a,x)=>a+x.amount,0))}</b> تومان در ${fa(R.length)} چک</p>`:'<div class="empty">طبق شرایط پرداخت طرح چکی لازم نیست و چکی هم ثبت نشده.</div>';
  $('cqBody').innerHTML=h;const fi=document.activeElement;}
function cqPrint(list){const m=$('cqMsg');if(!CPS.get('to',SET.clinic||'')){m.className='msg err';m.textContent='یک بار از «چاپ چک» عادی «در وجه» را تنظیم کنید.';return}
  if(!list.length||list.some(x=>!x.due)){m.className='msg err';m.textContent='سررسید چک اول را برای چک‌های تازه بنویسید.';return}
  printHTML(chqDoc(list,CQ.name?'طرح درمان '+CQ.name:''));m.className='msg ok';m.textContent=`${fa(list.length)} چک به پرینتر فرستاده شد.`}
async function cqRegister(t){const m=$('cqMsg'),N=cqRows().filter(x=>!x.rec);if(!N.length){m.className='msg err';m.textContent='چک تازه‌ای برای ثبت نیست.';return}if(N.some(x=>!x.due)){m.className='msg err';m.textContent='سررسید چک اول را بنویسید.';return}
  t.disabled=true;try{for(const x of N)await api('payAdd',{id:PF.id,pid:'cq-'+PF.id.slice(0,36)+'-'+x.part+x.i,pay:{kind:'chq',part:x.part,amount:x.amount,due:x.due,by:ROLE_LBL[ROLE],note:'از شرایط پرداخت طرح'}});
    m.className='msg ok';m.textContent=`${fa(N.length)} چک در پرونده ثبت شد.`;refreshFile();setTimeout(()=>{if(PF&&PF.j)openChqPlan()},900)}catch(e){m.className='msg err';m.textContent=e.message}finally{t.disabled=false}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.dataset.chqplan){openChqPlan();return}if(!CQ)return;
  if(t.id==='cqClose'){$('cqSheet').hidden=true;return}
  if(t.id==='cqAll'){cqPrint(cqRows());return}
  if(t.dataset.cqp!==undefined){const x=cqRows()[+t.dataset.cqp];if(x)cqPrint([x]);return}
  if(t.id==='cqReg'){cqRegister(t);return}});
document.addEventListener('input',e=>{const t=e.target;if(!CQ||!t||!t.dataset||!t.dataset.cqf)return;CQ.first[t.dataset.cqf]=t.value;const pos=t.selectionStart,k=t.dataset.cqf;cqRender();const n=document.querySelector(`[data-cqf="${k}"]`);if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}});

var USERNAME='';
