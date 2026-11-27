
/* ---------- m31 (owner, 2026-11-16, before the surgery part goes live): surgery sheet — (1) a «فیل اولیه» entry in the treatment list: tap it, tap the tooth, and the implant window opens
   (brand / size like «پایه ایمپلنت») with the reason «فیل اولیه» already chosen; (2) «سایر درمان‌ها»: free name + amount rows of the session (session.oth), added to the actual cost ---------- */
const m31Fails=()=>{try{return Object.keys(SURG.s.imp.sel||{}).filter(k=>SURG.s.imp.sel[k]&&isTooth(k)&&(SURG.imp[k]||{}).rs==='fail').sort()}catch(e){return []}};
const m31OthList=()=>((SURG&&SURG.oth)||[]).map(o=>({t:String(o.t||'').trim(),amt:num(o.amt||'')})).filter(o=>o.t||o.amt);
const m31OthAny=()=>m31OthList().some(o=>o.t);
const M31K=id=>'implantSurgOth:'+id;
function m31Keep(){try{if(!SURG)return;const L=(SURG.oth||[]).filter(o=>String(o.t||'').trim()||String(o.amt||'').trim());if(L.length)localStorage.setItem(M31K(SURG.id),JSON.stringify({d:jalali(new Date()).slash,oth:L}));else localStorage.removeItem(M31K(SURG.id))}catch(e){}}
function m31PfCard(){const F=m31Fails(),tb=(k,n)=>{const j=k[0],blk=(()=>{try{return jawBlocked('imp',j)}catch(e){return ''}})(),on=F.includes(k),other=!on&&!!SURG.s.imp.sel[k];
    return `<button type="button" class="t${other?' pl':''}" data-m31t="${k}" aria-pressed="${on}"${blk&&!on?' disabled title="'+esc(blk)+'"':''}>${n}</button>`};
  const half=(q,rev)=>(rev?[7,6,5,4,3,2,1]:[1,2,3,4,5,6,7]).map(n=>tb(q+n,n)).join('');
  return `<section class="card m31c" id="m31Pf" data-kind="surg"><h2><span class="h2t">فیل اولیه</span><span class="sgdoc">ایمپلنتی که همین جلسه فیل شد</span></h2><p class="note">دندان را بزنید؛ پنجره‌ی برند و سایز مثل «پایه ایمپلنت» باز می‌شود و دلیل «فیل اولیه» انتخاب شده است. همان‌جا بگویید فیکسچر دوم کاشته شد یا برداشته شد.</p>
  <div class="chart"><div class="chart-in" style="--n:7"><div class="jaw"><span class="jlabel">بالا</span><div class="half">${half('UR',1)}</div><span class="mid"></span><div class="half">${half('UL',0)}</div></div><div class="jaw"><span class="jlabel">پایین</span><div class="half">${half('LR',1)}</div><span class="mid"></span><div class="half">${half('LL',0)}</div></div></div></div>
  <div class="m31fl">${F.length?F.map(k=>`<button type="button" class="btn sm ghost" data-m31t="${k}">${esc(toothTxt([k]))} — ${esc(impTxt(SURG.imp[k])||'')}${esc((typeof ex1ImpTag==='function'&&ex1ImpTag(SURG.imp[k]))||'')}</button>`).join(''):'<span class="note">هنوز ایمپلنتی با «فیل اولیه» ثبت نشده.</span>'}</div></section>`}
function m31OthCard(){const L=SURG.oth&&SURG.oth.length?SURG.oth:(SURG.oth=[{t:'',amt:''}]);
  return `<section class="card m31c" id="m31Oth" data-kind="surg"><h2><span class="h2t">سایر درمان‌ها</span><span class="sgdoc">کاری که در فهرست نیست</span></h2><p class="note">نام درمان و مبلغ آن را بنویسید. مبلغ به «هزینه‌ی کارهای انجام‌شده» اضافه می‌شود؛ اگر رایگان است مبلغ را خالی بگذارید.</p>
  ${L.map((o,i)=>`<div class="m31or"><input data-m31on="${i}" maxlength="80" placeholder="نام درمان" value="${esc(o.t||'')}" aria-label="نام درمان ${fa(i+1)}"><input data-m31oa="${i}" inputmode="numeric" class="price" placeholder="مبلغ (تومان)" value="${esc(o.amt?fmtInput(String(num(o.amt))):'')}" aria-label="مبلغ ${fa(i+1)}"><button type="button" class="btn sm ghost" data-m31ox="${i}" aria-label="حذف ردیف ${fa(i+1)}">×</button></div>`).join('')}
  <div class="acts"><button type="button" class="btn sm ghost" data-m31oadd="1"${L.length>=20?' disabled':''}>+ ردیف دیگر</button><span class="note" id="m31OSum">${m31OthSum()}</span></div></section>`}
const m31OthSum=()=>{const s=m31OthList().reduce((a,o)=>a+o.amt,0);return s?'جمع: '+fa(s)+' تومان':''};
function m31Cards(){try{if(!SURG)return;const W=$('surgSecs');if(!W)return;W.querySelectorAll('.m31c').forEach(e=>e.remove());if(SURG.m31pf)W.insertAdjacentHTML('afterbegin',m31PfCard());if(SURG.m31oth)W.insertAdjacentHTML('beforeend',m31OthCard())}catch(e){}}
function m31Chips(){try{if(!SURG)return;const A=$('sgPick'),B=$('sgPick2');if(!A||!B)return;document.querySelectorAll('#sgPick [data-m31pf],#sgPick2 [data-m31pf],#sgPick2 [data-m31oth]').forEach(e=>e.remove());
  const nf=m31Fails().length,pf=`<button type="button" class="chip sgc${nf?' marked':''}" data-m31pf="1" aria-pressed="${!!SURG.m31pf}">فیل اولیه${nf?' ✓':''}</button>`,imp=document.querySelector('#sgPick [data-sgsec="imp"],#sgPick2 [data-sgsec="imp"]');
  if(imp)imp.insertAdjacentHTML('afterend',pf);else B.insertAdjacentHTML('beforeend',pf);
  B.insertAdjacentHTML('beforeend',`<button type="button" class="chip sgc${m31OthAny()?' marked':''}" data-m31oth="1" aria-pressed="${!!SURG.m31oth}">سایر درمان‌ها${m31OthAny()?' ✓':''}</button>`)}catch(e){}}
{const _p=renderPick;renderPick=function(){const r=_p.apply(this,arguments);m31Chips();return r}}
{const _r=renderSurg;renderSurg=function(){const r=_r.apply(this,arguments);m31Cards();return r}}
{const _i=renderImps;renderImps=function(){const r=_i.apply(this,arguments);try{if(SURG&&SURG.m31pf){const e=$('m31Pf');if(e)e.outerHTML=m31PfCard();else m31Cards()}}catch(e){}return r}}
{const _o=openSurg;openSurg=function(x){const r=_o.apply(this,arguments);try{if(SURG){SURG.oth=[];const d=JSON.parse(localStorage.getItem(M31K(SURG.id))||'null');if(d&&d.d===jalali(new Date()).slash&&Array.isArray(d.oth)){SURG.oth=d.oth.slice(0,20).map(o=>({t:String(o.t||''),amt:String(o.amt||'')}));SURG.m31oth=SURG.oth.length>0}renderSurg()}}catch(e){}return r}}
document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('[data-m31pf],[data-m31oth],[data-m31t],[data-m31ox],[data-m31oadd]');if(!t||!SURG||t.disabled)return;
  if(t.dataset.m31pf){SURG.m31pf=!SURG.m31pf;renderSurg();const c=$('m31Pf');if(c)c.scrollIntoView({behavior:'smooth',block:'center'});return}
  if(t.dataset.m31oth){SURG.m31oth=!SURG.m31oth;renderSurg();const c=$('m31Oth');if(c){c.scrollIntoView({behavior:'smooth',block:'center'});const f=c.querySelector('[data-m31on]');if(f&&!f.value)try{f.focus({preventScroll:true})}catch(x){}}return}
  if(t.dataset.m31t){const k=t.dataset.m31t;openImp(k,'imp');try{IMPRS='fail';xlRsBtns();if(typeof ex1ImpUI==='function')ex1ImpUI()}catch(x){}return}
  if(t.dataset.m31ox){SURG.oth.splice(Number(t.dataset.m31ox),1);SURG.dirty=true;m31Keep();m31Cards();m31Chips();return}
  if(t.dataset.m31oadd){if(SURG.oth.length<20)SURG.oth.push({t:'',amt:''});m31Cards();const I=document.querySelectorAll('#m31Oth [data-m31on]');if(I.length)I[I.length-1].focus();return}});
document.addEventListener('input',e=>{const i=e.target;if(!i||!i.dataset||!SURG||!SURG.oth)return;
  if(i.dataset.m31on!==undefined){const o=SURG.oth[Number(i.dataset.m31on)];if(o){o.t=i.value;SURG.dirty=true;m31Keep();m31Chips()}}
  else if(i.dataset.m31oa!==undefined){const o=SURG.oth[Number(i.dataset.m31oa)];if(o){const n=num(i.value);o.amt=n?String(n):'';i.value=n?fmtInput(String(n)):'';SURG.dirty=true;m31Keep();const s=$('m31OSum');if(s)s.textContent=m31OthSum();m31Chips()}}});
/* the session, the review and the money */
{const _s=surgSave;surgSave=function(t){const m=$('sgMsg');try{if(SURG){const bad=m31OthList().find(o=>!o.t);if(bad){m.className='msg err';m.textContent='در «سایر درمان‌ها» برای مبلغ '+fa(bad.amt)+' نام درمان نوشته نشده است.';SURG.m31oth=true;renderSurg();const c=$('m31Oth');if(c)c.scrollIntoView({behavior:'smooth',block:'center'});return}}}catch(e){}
  const r=_s.apply(this,arguments);try{if(SURG&&SGP&&SGP.ses){const L=m31OthList().filter(o=>o.t);if(L.length){SGP.ses.oth=L;const b=$('srBody');if(b)b.insertAdjacentHTML('beforeend',`<h4 style="margin:6px 0 2px">سایر درمان‌ها</h4><ul class="rvl">${L.map(o=>`<li><b>${esc(o.t)}</b>${o.amt?' — '+fa(o.amt)+' تومان':' — بدون مبلغ'}</li>`).join('')}</ul>`)}else delete SGP.ses.oth}}catch(e){}return r}}
const m31SesOth=ss=>(ss&&Array.isArray(ss.oth)?ss.oth:[]).reduce((a,o)=>a+(Number(o&&o.amt)||0),0);
{const _a=surgActual;surgActual=function(rec,sessions){let v=_a.apply(this,arguments);try{(sessions||[]).forEach(ss=>{v+=m31SesOth(ss)})}catch(e){}return v}}
{const _a=api;api=function(action,payload){const p=_a.apply(this,arguments);try{if(action==='surgSave'&&payload&&payload.id){const id=payload.id;Promise.resolve(p).then(()=>{try{localStorage.removeItem(M31K(id))}catch(e){}}).catch(()=>{})}}catch(e){}return p}}
{const _d=openDone;openDone=function(rec,sg,settle){const r=_d.apply(this,arguments);try{const L=[];(sg.sessions||[]).forEach(ss=>(Array.isArray(ss.oth)?ss.oth:[]).forEach(o=>L.push(`<li>جلسه‌ی ${fa(ss.n||0)}: <b>${esc(o.t)}</b>${o.amt?' — '+fa(o.amt)+' تومان':''}</li>`)));const b=$('sdBody');if(L.length&&b&&!b.querySelector('.m31d'))b.insertAdjacentHTML('beforeend',`<div class="m31d"><h4 style="margin:8px 0 2px">سایر درمان‌ها</h4><ul class="rvl">${L.join('')}</ul></div>`)}catch(e){}return r}}
