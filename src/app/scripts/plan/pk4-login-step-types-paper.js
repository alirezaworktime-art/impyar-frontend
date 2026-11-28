
/* ---------- pk4: «جلسه‌ی پروتز» (login «پزشک») = the 12 step types of the paper file («مراحل پروتز», arc13/arc14): type, abutment / pontic teeth on the chart,
   «مجدد» (free), cement brand for «چسب مجدد», an amount for accounting (empty = the accounting catalog tariff), note, optional lab order. Replaces the old 5-chip list. ---------- */
const PK4_TY=[['impr','قالب‌گیری ایمپلنت'],['crimpr','قالب‌گیری روکش دندانی'],['rscr','امتحان رزین پیچ‌شونده'],['rabt','امتحان رزین اباتمنت'],['deliv','تحویل روکش'],['cem','چسب مجدد'],['fix','اصلاح روکش'],['ng','قالب‌گیری نایت‌گارد'],['essix','قالب‌گیری Essix'],['pmma','قالب‌گیری PMMA'],['sgd','قالب‌گیری سرجیکال گاید'],['pmmail','قالب‌گیری PMMA ایمدیت لود']];
const PK4_TN=Object.fromEntries(PK4_TY),PK4_TEETH={impr:1,crimpr:1,rscr:1,rabt:1,deliv:1},PK4_CEM={kerr:'Kerr',gc:'GC',pc:'PC'};
const PK4_Q=[['UR',[8,7,6,5,4,3,2,1]],['UL',[1,2,3,4,5,6,7,8]],['LR',[8,7,6,5,4,3,2,1]],['LL',[1,2,3,4,5,6,7,8]]];
Object.keys(L5W).forEach(k=>delete L5W[k]);PK4_TY.forEach(([k,n])=>L5W[k]=n);
const pk4N=v=>{const n=Math.round(Number(toEn(String(v==null?'':v)).replace(/[^\d.]/g,'')));return isFinite(n)&&n>0?n:0};
const pk4Roles=pt=>{const a=Object.keys(pt).filter(t=>pt[t]==='a'),p=Object.keys(pt).filter(t=>pt[t]==='p');return (a.length?'پایه: '+toothTxt(a):'')+(a.length&&p.length?' · ':'')+(p.length?'پونتیک: '+toothTxt(p):'')};
function pk4Reset(){if(!L5)return;L5.pt={};L5.redo=false;L5.cem='';L5.amt='';L5.pk4=1;try{const m=l4Map(PF&&PF.j);Object.keys(m||{}).forEach(k=>{if(m[k]==='a'||m[k]==='p')L5.pt[k]=m[k]})}catch(e){}}
function pk4Block(){const s=L5,w=s.work;if(!w)return '';const tt=!!PK4_TEETH[w],free=tt&&s.redo;
  let h='<div class="pk4b">';
  if(tt)h+=`<div class="pk4ch"><p class="note">روی دندان بزنید: یک بار = <b class="a13ka">پایه</b> · دو بار = <b class="a13kp">پونتیک</b> · سه بار = برداشتن${Object.keys(s.pt).length?' — '+esc(pk4Roles(s.pt)):''}</p><div class="pk4teeth">${PK4_Q.map(([q,L])=>`<div class="pk4q"><small>${QNAME[q]}</small>${L.map(n=>{const k=q+n,r=s.pt[k]||'';return `<button type="button" class="t${r==='a'?' a13pa':r==='p'?' a13pp':''}" data-pk4t="${k}" aria-pressed="${!!r}">${fa(n)}</button>`}).join('')}</div>`).join('')}</div>
    <div class="grp"><span>مجدد بوده؟</span><div class="chips"><button type="button" class="chip" data-pk4redo="0" aria-pressed="${!s.redo}">نه</button><button type="button" class="chip" data-pk4redo="1" aria-pressed="${!!s.redo}">بله، ${esc(PK4_TN[w])} مجدد (رایگان)</button></div></div></div>`;
  if(w==='cem')h+=`<div class="grp"><span>نوع چسب *</span><div class="chips">${Object.keys(PK4_CEM).map(k=>`<button type="button" class="chip" data-pk4cem="${k}" aria-pressed="${s.cem===k}">${PK4_CEM[k]}</button>`).join('')}</div></div>`;
  h+=`<label class="f">مبلغ این جلسه برای حسابداری (تومان) — خالی = تعرفه‌ی فهرست حسابداری<input id="pk4_amt" class="price" inputmode="numeric" value="${free?'۰':esc(s.amt?fmtInput(String(s.amt)):'')}"${free?' disabled':''} placeholder="تومان"></label>${free?'<p class="note">مرحله‌ی مجدد رایگان است؛ مبلغ صفر.</p>':''}</div>`;return h}
const pk4Ex=s=>[s.pt&&Object.keys(s.pt).length?pk4Roles(s.pt):'',s.redo?(s.re2?'بار دوم به بعد':'مجدد (رایگان)'):'',s.cem?'چسب '+(PK4_CEM[s.cem]||s.cem):'',s.amt?'مبلغ '+fa(s.amt)+' تومان':''].filter(Boolean).join(' · ');
function pk4Prev(j){const S=Array.isArray((j.pros||{}).sess)?j.pros.sess:[];if(!S.length)return '';return `<div class="l5sec pk4h"><b>جلسه‌های پروتز قبلی</b><ul>${S.slice().reverse().slice(0,8).map(s=>`<li><b>${esc(L5W[s.work]||s.work)}${s.res?(s.res==='ok'?' — تأیید':' — اصلاح'):''}</b><small>${esc(jd(s.at))}${s.by?' · '+esc(s.by):''}</small>${s.ty&&pk4Ex(s)?`<div class="meta pk4x">${esc(pk4Ex(s))}</div>`:''}${s.note?'<div>'+esc(s.note)+'</div>':''}</li>`).join('')}</ul></div>`}
{const _r=l5Render;l5Render=function(){const r=_r.apply(this,arguments);try{if(!L5)return r;if(!L5.pk4)pk4Reset();const w=document.querySelector('#pfBody .l5work');if(!w)return r;const ch=w.querySelector('.chips');if(ch&&!w.querySelector('.pk4b'))ch.insertAdjacentHTML('afterend',pk4Block());if(!document.querySelector('#pfBody .pk4h')){const pv=pk4Prev(PF.j);if(pv)w.insertAdjacentHTML('beforebegin',pv)}}catch(e){}return r}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pk4t],[data-pk4redo],[data-pk4cem]');if(!t||!L5||!PF||PF.sess!==L5)return;e.preventDefault();e.stopImmediatePropagation();l5Read();
  if(t.dataset.pk4t){const k=t.dataset.pk4t,r=L5.pt[k]||'';if(!r)L5.pt[k]='a';else if(r==='a')L5.pt[k]='p';else delete L5.pt[k]}
  else if(t.dataset.pk4redo!==undefined){L5.redo=t.dataset.pk4redo==='1';if(L5.redo)L5.amt=''}else L5.cem=t.dataset.pk4cem;
  renderFile()},true);
document.addEventListener('input',e=>{const i=e.target;if(!i||i.id!=='pk4_amt'||!L5)return;const v=fmtInput(i.value);if(v!==i.value)i.value=v;L5.amt=pk4N(i.value)||''},true);
/* a new work type: the redo / cement choices start over (teeth stay) */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-l5w]');if(!t||!L5||!PF||PF.sess!==L5)return;L5.redo=false;L5.cem='';L5.amt='';setTimeout(()=>{try{if(L5&&PF&&PF.sess===L5)renderFile()}catch(x){}},0)},true);
/* checks + the extra fields go with the session */
{const _s=l5Submit;l5Submit=async function(withLab,b){try{l5Read();const s=L5,m=$('l5Msg'),err=t=>{m.className='msg err';m.textContent=t;m.scrollIntoView({block:'center'})};
  if(s&&s.work){if(PK4_TEETH[s.work]&&!Object.keys(s.pt||{}).length)return err('دندان‌های پایه / پونتیک این جلسه را روی شکل بزنید.');if(s.work==='cem'&&!s.cem)return err('نوع چسب را انتخاب کنید (Kerr / GC / PC).');
    if(withLab&&PF&&PF.j&&PF.j.pros&&!l4HasA(PF.j)&&Object.values(s.pt||{}).includes('a'))PF.j.pros.map=Object.assign({},s.pt)}}catch(e){}return _s.apply(this,arguments)}}
{const _a=api;api=function(action,payload){try{if(action==='prosSess'&&payload&&L5&&PF&&PF.sess===L5){payload.ty=L5.work;payload.pt=Object.assign({},L5.pt||{});payload.redo=!!L5.redo&&!!PK4_TEETH[L5.work];payload.cem=L5.work==='cem'?L5.cem:'';payload.amt=L5.redo?0:(pk4N(L5.amt)||'')}}catch(e){}return _a.apply(this,arguments)}}
/* the lab order after the session no longer needs a separate «تعیین پایه و پونتیک» when the teeth were marked here (the server stores the map from the session) */
