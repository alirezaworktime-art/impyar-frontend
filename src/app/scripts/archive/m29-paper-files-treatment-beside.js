
/* ---------- m29 (owner, 2026-11-14): paper files («پرونده‌ی جا مانده») — (1) treatment «فیلد شدن ایمپلنت» beside «پایه ایمپلنت», with «کاشت مجدد N ماه بعد» (a reception task
   on that date); (2) «معاینه» and «پیگیری» as the patient's next step (sub-stages with a date; the main stage is not changed); (3) reception finds a paper file by name,
   file number or national id (quick search and archive) and continues it with «ادامه‌ی درمان» ---------- */
(function(){try{if(A6C.ifail)return;const i=A6CAT.findIndex(x=>x.k==='imp'),e={k:'ifail',t:'فیلد شدن ایمپلنت',s:'R',m:'t',p:()=>0};A6CAT.splice(i>=0?i+1:A6CAT.length,0,e);A6C.ifail=e}catch(e){}})();
try{TLBL.aexam=['معاینه (پرونده‌ی جا مانده)','برای معاینه‌ی بیمار نوبت بدهید.'];TLBL.afup=['پیگیری (پرونده‌ی جا مانده)','با بیمار تماس بگیرید و پیگیری کنید.'];TGRP.aexam='sg';TGRP.afup='fl'}catch(e){}
const M29_RM=[1,2,3,4,5,6,7,8,9,10,11,12,18,24],M29_SUB={exam:'معاینه',fup:'پیگیری'};
/* what was placed on that tooth before the failure (from the «پایه ایمپلنت» lines of this file) */
function m29Was(l){try{return (l.teeth||[]).map(t=>{const c=A6.lines.filter(x=>(x.k==='imp'||x.k==='sub'||x.k==='reimp')&&x.id!==l.id&&(x.teeth||[]).includes(t)&&x.day&&(!l.day||x.day<=l.day)).sort((p,q)=>String(q.day).localeCompare(String(p.day)))[0];if(!c)return '';const m=(c.imp||{})[t]||{},b=m.b||c.b||'';return toothTxt([t])+': '+(b||'برند نامشخص')+(m.d||m.l?' '+faD(String(m.d||'؟'))+'×'+faD(String(m.l||'؟')):'')+' (کاشت '+jDay(c.day)+')'}).filter(Boolean).join(' · ')}catch(e){return ''}}
const m29Due=l=>{try{if(!l.rm||!l.day)return '';let d=mAdd(l.day,Number(l.rm));if(d<tDay())d=tDay();return 'در '+jDay(d)+' در کارتابل منشی «کاشت دوباره‌ی ایمپلنت — نوبت جراحی بدهید» می‌آید.'}catch(e){return ''}};
{const _l=a6Line;a6Line=function(l){let h=_l.apply(this,arguments);if(!l||l.k!=='ifail')return h;try{
  const rm=`<label class="f m29rm">کاشت مجدد<select data-m29rm="${l.id}"><option value="">بدون نوبت خودکار</option>${M29_RM.map(n=>`<option value="${n}"${Number(l.rm)===n?' selected':''}>${fa(n)} ماه بعد</option>`).join('')}</select><small class="a6def" data-m29h="${l.id}">${esc(m29Due(l))}</small></label>`;
  h=h.replace(/<label class="f">تعرفه‌ی هر واحد[\s\S]*?<\/label><div class="a6amt">[\s\S]*?<\/div>/,rm);
  h=h.replace(/<div class="a6sut">[\s\S]*?<\/div><\/div>/,'');
  const i=h.indexOf('<div class="a8ds"');if(i>=0)h=h.slice(0,i)+'</div>';
  const w=m29Was(l);h=h.replace(/<p class="note a6tn">[\s\S]*?<\/p>/,`<p class="note a6tn">${l.teeth.length?'ایمپلنت شکست‌خورده: '+esc(toothTxt(l.teeth))+(w?'<br><span class="m29was">'+esc(w)+'</span>':''):'دندانِ ایمپلنتی که شکست خورده را بزنید'} · بدون هزینه</p>`)}catch(e){}return h}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.m29rm||!A6)return;const l=A6.lines.find(x=>x.id===t.dataset.m29rm);if(!l)return;l.rm=t.value;A6.dirty=true;const s=document.querySelector(`[data-m29h="${l.id}"]`);if(s)s.textContent=m29Due(l)});
/* the next step: two sub-stages */
{const _f=a6From;a6From=function(j){const S=_f.apply(this,arguments);try{const sb=((((j||{}).data||{}).arc)||{}).sub;if(sb&&M29_SUB[sb.k]){S.open=true;S.stage=sb.k;S.dueJ=jDay(sb.due);S.dueTouched=true;S.m29due0=sb.due}}catch(e){}return S}}
{const _s=a6Save;a6Save=async function(btn,ack){try{const S=A6;if(S){S.m29due=undefined;if(S.open&&M29_SUB[S.stage]){const m=$('a6Msg'),nm=M29_SUB[S.stage],due=parseJ(S.dueJ||''),bad=t=>{m.className='msg err';m.textContent=t;const n=$('a6Due');if(n){n.scrollIntoView({behavior:'smooth',block:'center'});try{n.focus({preventScroll:true})}catch(x){}}};
  if(!due)return bad('تاریخ '+nm+' را درست بزنید.');if(due<tDay()&&due!==S.m29due0)return bad('تاریخ '+nm+' نمی‌تواند گذشته باشد.');S.m29due=due}}}catch(e){}return _s.apply(this,arguments)}}
{const _a=api;api=function(action,payload,opt){try{if(action==='fxArc'&&payload&&payload.arc&&payload.arc.v6&&A6){(payload.arc.lines||[]).forEach(x=>{if(x.k!=='ifail')return;const l=A6.lines.find(y=>y.id===x.id);if(l){x.rm=l.rm||'';x.price=0}});
  if(payload.arc.open&&M29_SUB[payload.arc.stage]&&A6.m29due)payload.arc.due=A6.m29due}}catch(e){}return _a.apply(this,arguments)}}
/* (3) continue a paper file from the quick search and the archive */
document.addEventListener('click',async e=>{const t=e.target&&e.target.closest&&e.target.closest('[data-m29arc]');if(!t||t.disabled)return;e.preventDefault();e.stopImmediatePropagation();t.disabled=true;
  try{const j=await api('get',{id:t.dataset.m29arc},{timeout:12000});if(j&&j.data&&j.data.arc){if(!j.id)j.id=t.dataset.m29arc;fxArcOpen(j)}else toast('این پرونده از پرونده‌های جا مانده نیست.',1)}catch(err){toast('باز نشد: '+err.message,1)}finally{t.disabled=false}},true);
{const _p=a6Panel;a6Panel=function(k){let h=_p.apply(this,arguments);try{if(k==='ifail')h=h.replace(/(<h3>[^<]*<small>)[^<]*(<\/small>)/,'$1بدون هزینه؛ برای کاشت مجدد می‌توانید نوبت خودکار بگذارید$2')}catch(e){}return h}}
