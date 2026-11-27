/* ---------- q5: «سرجیکال گاید» at the end of the treatment-plan form (doctor / consultant): jaw (none / upper / lower / both) + optional teeth + note, kept in F.h.sgd.
   The consultant's guide box (pk1) is pre-filled with the doctor's jaw choice; reception sees it in the patient file and the surgeon on the surgery-day page. ---------- */
const Q5_J={U:'فک بالا',L:'فک پایین',B:'هر دو فک'};
function q5Get(){if(!F.h.sgd||typeof F.h.sgd!=='object')F.h.sgd={j:'',t:[],note:''};const g=F.h.sgd;if(!Array.isArray(g.t))g.t=[];return g}
function q5Txt(h){const g=h&&h.sgd;if(!g||!Q5_J[g.j])return '';return Q5_J[g.j]+(g.t&&g.t.length?' · دندان‌ها: '+g.t.join('، '):'')+(g.note?' · '+g.note:'')}
function q5Can(){return ROLE==='doctor'||ROLE==='consultant'}
function q5Block(){const g=q5Get(),ro=!q5Can(),on=j=>g.j==='B'||g.j===j,chip=(v,l)=>`<button type="button" class="chip" data-q5j="${v}" aria-pressed="${(g.j||'')===v}"${ro?' disabled':''}>${l}</button>`;
  const row=j=>`<div class="q5row">${[7,6,5,4,3,2,1].map(n=>`<button type="button" class="q5t" data-q5t="${j}R${n}" aria-pressed="${g.t.includes(j+'R'+n)}"${ro||!on(j)?' disabled':''}>${n}</button>`).join('')}<span class="q5mid"></span>${[1,2,3,4,5,6,7].map(n=>`<button type="button" class="q5t" data-q5t="${j}L${n}" aria-pressed="${g.t.includes(j+'L'+n)}"${ro||!on(j)?' disabled':''}>${n}</button>`).join('')}</div>`;
  return `<section class="card" id="q5Card"><h2>سرجیکال گاید <span class="tag">برای روز جراحی</span></h2><p class="note">اگر برای جراحی گاید لازم است، فک را انتخاب کنید و در صورت نیاز دندان‌ها را مشخص کنید؛ مبلغ گاید را مشاور در «شرایط پرداخت» می‌نویسد.</p>
    <div class="chips">${chip('','ندارد')}${Object.keys(Q5_J).map(k=>chip(k,Q5_J[k])).join('')}</div>
    <div${Q5_J[g.j]?'':' hidden'}><div class="q5chart">${row('U')}${row('L')}<div class="q5sides"><span>راست بیمار</span><span>چپ بیمار</span></div></div>
    <label class="f" style="margin-top:8px">توضیح گاید (اختیاری)<input id="q5Note" maxlength="200" value="${esc(g.note||'')}" placeholder="مثلاً گاید دو فک با اسکن CBCT"${ro?' disabled':''}></label></div>
    <p class="note q5sum">${q5Txt(F.h)?'<b class="q5kv">'+esc(q5Txt(F.h))+'</b>':''}</p></section>`}
function q5Mount(){try{if(!F||!F.h||(typeof SURG!=='undefined'&&SURG))return;const tc=$('totalsCard');if(!tc)return;const old=$('q5Card');if(old)old.outerHTML=q5Block();else tc.insertAdjacentHTML('beforebegin',q5Block())}catch(e){}}
{const _r=renderForm;renderForm=function(){const r=_r.apply(this,arguments);q5Mount();return r}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-q5j],[data-q5t]');if(!t||!F||!F.h||t.disabled)return;e.preventDefault();const g=q5Get();
  if(t.dataset.q5j!==undefined){g.j=Q5_J[t.dataset.q5j]?t.dataset.q5j:'';g.t=g.t.filter(k=>g.j==='B'||k[0]===g.j);if(!g.j){g.t=[];g.note=''}
    if(ROLE==='consultant'&&F.pay){F.pay.sgdj=g.j;if(g.j&&!(Number(toEn(String(F.pay.sgda||''))))){const d=A6P('arc_sgd');if(d)F.pay.sgda=String(d)}if(!g.j)F.pay.sgda=''}}
  else{const k=t.dataset.q5t;const i=g.t.indexOf(k);if(i>=0)g.t.splice(i,1);else g.t.push(k)}
  touch();q5Mount();try{recalc()}catch(x){}},true);
document.addEventListener('input',e=>{if(e.target&&e.target.id==='q5Note'&&F&&F.h){q5Get().note=e.target.value.slice(0,200);touch();const s=document.querySelector('#q5Card .q5sum');if(s)s.innerHTML=q5Txt(F.h)?'<b class="q5kv">'+esc(q5Txt(F.h))+'</b>':''}});
/* consultant: the doctor's jaw choice pre-fills the guide box in «شرایط پرداخت» (pk1) once */
{const _o=openForm;openForm=function(){const r=_o.apply(this,arguments);try{if(ROLE==='consultant'&&F&&F.h&&F.pay){const g=F.h.sgd;if(g&&Q5_J[g.j]&&!F.pay.sgdj){F.pay.sgdj=g.j;if(!(Number(toEn(String(F.pay.sgda||''))))){const d=A6P('arc_sgd');if(d)F.pay.sgda=String(d)}recalc()}}}catch(e){}return r}}
/* patient file head + surgery-day meta */
{const _f=renderFile;renderFile=function(){const r=_f.apply(this,arguments);try{const h=fromDoc(PF.id,PF.j.data||{}).h,t=q5Txt(h),kv=document.querySelector('#pfBody .pf-head .kv');if(t&&kv&&!kv.querySelector('[data-q5]'))kv.insertAdjacentHTML('beforeend',`<span data-q5="1">سرجیکال گاید</span><span class="q5kv">${esc(t)}</span>`)}catch(e){}return r}}
{const _s=openSurg;openSurg=function(x){const r=_s.apply(this,arguments);try{const h=((x&&x.data)||{}).h||{},t=q5Txt(h),m=$('sgMeta');if(t&&m&&!/سرجیکال گاید/.test(m.textContent))m.textContent+=(m.textContent?' · ':'')+'سرجیکال گاید: '+t}catch(e){}return r}}
