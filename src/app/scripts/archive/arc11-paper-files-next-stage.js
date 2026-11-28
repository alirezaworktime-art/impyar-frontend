
/* ---------- arc11: paper files — (1) next stage «آنکاوری»: 1…7 months after the last treatment; (2) «ایمپلنت مجدد» inside «پایه ایمپلنت» (which tooth was re-implanted,
   price typed by the clinic, default 0); (3) «جراحی GBR*» beside GBR ۱/۲/۳, with a count, GBR tariff ---------- */
A6CAT.splice(A6CAT.findIndex(x=>x.k==='gbr3')+1,0,{k:'gbr4',t:'جراحی GBR*',s:'R',g:'gbr',m:'n',p:()=>A6P('gbr')});
A6CAT.push({k:'reimp',t:'ایمپلنت مجدد',s:'X',m:'t',p:()=>0});
A6C.gbr4=A6CAT.find(x=>x.k==='gbr4');A6C.reimp=A6CAT.find(x=>x.k==='reimp');A6SOLO.reimp=1;
/* (2) the re-implant lines live in the «پایه ایمپلنت» card */
{const _p=a6Panel;a6Panel=function(k){if(k==='reimp')return '';let h=_p.apply(this,arguments);if(k!=='imp')return h;
  const L=A6.lines.filter(l=>l.k==='reimp');
  const box=`<div class="a11re"><h4>ایمپلنت مجدد <small>دندانی که دوباره کاشته شده؛ مبلغ را کلینیک وارد می‌کند</small></h4>${L.map((l,i)=>a6Line(l,i,L.length)).join('')}
   <div class="btns"><button type="button" class="btn sm ghost" data-a11re="1">+ ایمپلنت مجدد</button></div></div>`;
  const i=h.lastIndexOf('</section>');return i>=0?h.slice(0,i)+box+h.slice(i):h+box}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-a11re]');if(!t||!A6)return;e.preventDefault();e.stopPropagation();
  A6.op.add('imp');A6.op.add('reimp');const l=a6NewLine('reimp');A6.dirty=true;const sc=window.scrollY;a6Render();window.scrollTo(0,sc);
  const el=document.querySelector(`.a6l[data-l="${l.id}"]`);if(el)el.scrollIntoView({behavior:'smooth',block:'nearest'})},true);
/* (1) uncover: 1…7 months after the last treatment */
const a11Last=()=>A6.lines.map(l=>l.day).filter(Boolean).sort().pop()||tDay();
function a11Unc(){const i=$('a6Due');if(!i||!A6||A6.stage!=='unc')return;const lab=i.closest('label');if(!lab||$('a11M'))return;
  const last=a11Last(),cur=A6.dueJ?parseJ(A6.dueJ):'';
  const d=document.createElement('div');d.id='a11M';d.className='a11m';
  d.innerHTML=`<span>آنکاوری چند ماه بعد از آخرین درمان (${esc(jDay(last))})</span><div class="chips" role="group" aria-label="آنکاوری چند ماه بعد">${[1,2,3,4,5,6,7].map(m=>`<button type="button" class="chip" data-a11m="${m}" aria-pressed="${!!cur&&cur===mAdd(last,m)}">${fa(m)} ماه بعد</button>`).join('')}</div>`;
  lab.parentNode.insertBefore(d,lab)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-a11m]');if(!t||!A6)return;e.preventDefault();e.stopPropagation();
  const m=+t.dataset.a11m,last=a11Last();let d=mAdd(last,m);const clamp=d<tDay();if(clamp)d=tDay();
  A6.dueTouched=true;A6.dueJ=jDay(d);A6.dirty=true;const i=$('a6Due');if(i)i.value=A6.dueJ;
  const hh=$('a6DueH');if(hh)hh.textContent=clamp?`${fa(m)} ماه بعد از آخرین درمان گذشته است؛ امروز گذاشته شد. تاریخ درست را بزنید.`:`${fa(m)} ماه بعد از آخرین درمان`;
  document.querySelectorAll('[data-a11m]').forEach(b=>b.setAttribute('aria-pressed',String(b===t)))},true);
/* typing a date by hand clears the month chips */
document.addEventListener('input',e=>{if(e.target&&e.target.id==='a6Due')document.querySelectorAll('[data-a11m]').forEach(b=>b.setAttribute('aria-pressed','false'))});
