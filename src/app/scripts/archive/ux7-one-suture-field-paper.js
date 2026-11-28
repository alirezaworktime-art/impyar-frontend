/* ux7: one suture field for the paper file */
(function(){const SUTOF=S=>(S&&S.lines||[]).map(l=>l.sut).find(Boolean)||'';
{const _f=a6From;a6From=function(){const r=_f.apply(this,arguments);try{r.sut=SUTOF(r)}catch(e){}return r}}
{const _s=a6Save;a6Save=function(){try{if(A6)A6.lines.forEach(l=>{l.sut=A6.sut||''})}catch(e){}return _s.apply(this,arguments)}}
document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('[data-a6sutf]');if(!t||!A6)return;e.preventDefault();e.stopPropagation();const v=t.dataset.a6sutf;A6.sut=A6.sut===v?'':v;A6.lines.forEach(l=>{l.sut=A6.sut});A6.dirty=true;
  t.closest('.chips').querySelectorAll('[data-a6sutf]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.a6sutf===A6.sut)))},true);
window.UX7_SUT=S=>`<div class="grp a6sutf"><span>بخیه (برای کل پرونده)</span><div class="chips" role="group">${['no','abs','non'].map(s=>`<button type="button" class="chip" data-a6sutf="${s}" aria-pressed="${S.sut===s}">${A6SUT[s]}</button>`).join('')}</div></div>`;
})();