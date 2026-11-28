/* ---------- m44b (owner, 2026-11-17): paper files — a tooth marked «فیل اولیه» can also carry the implant that was placed after it: the second fixture
   is its own row of «پایه ایمپلنت» (same date and doctor, same tooth) with its own brand, size and tariff. In the tooth window, with «فیل اولیه»,
   «بله، فیکسچر دوم کاشته شد» makes that row and opens the window for the second fixture. Both fixtures leave the store (the server already
   counts a tooth that is in two rows twice). ---------- */
(function(){
const same=(a,b)=>a.day===b.day&&a.doc===b.doc;
/* the row that holds the fixture placed after the failed one of row l, tooth t */
const comp=(l,t)=>(A6&&A6.lines||[]).find(x=>x!==l&&x.k==='imp'&&same(x,l)&&!(+x.ri>0)&&((x.teeth||[]).includes(t)||x.m44of===t+'|'+l.id)&&!(((x.imp||{})[t]||{}).f))||null;
/* teeth of row l that are the second fixture of a failed tooth in another row */
const twins=l=>(l.teeth||[]).filter(t=>!(((l.imp||{})[t]||{}).f)&&(A6.lines||[]).some(x=>x!==l&&x.k==='imp'&&same(x,l)&&(((x.imp||{})[t]||{}).f)));
{const _o=arbOpen;arbOpen=function(l,t){const r=_o.apply(this,arguments);try{if(ARB.p&&l&&l.k==='imp'){ARB.p.m44=!!(m3F(l,t)&&comp(l,t));ARB.p.m44l=1;arbDraw()}}catch(e){console.error('m44b open',e)}return r}}
const pick=e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-m44b],[data-m3f]');if(!b||!ARB.p)return false;
  if(b.dataset.m3f!==undefined){const w=$('m44bRow');if(w)w.hidden=b.dataset.m3f!=='1';return false}
  e.preventDefault();ARB.p.m44=b.dataset.m44b==='1';b.closest('.chips').querySelectorAll('[data-m44b]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));return true};
document.addEventListener('pointerdown',pick,true);
document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')pick(e)},true);
{const _c=arbClose;arbClose=function(){const P=ARB.p,l=P&&A6?a6L(P.lid):null,before=l&&l.imp?l.imp[P.t]:null,saved=!!(l&&before&&before!==P.orig&&(l.teeth||[]).includes(P.t));
  const r=_c.apply(this,arguments);
  try{if(l&&l.m44of&&!(l.teeth||[]).length){A6.lines=A6.lines.filter(x=>x!==l);setTimeout(()=>{try{arbRe()}catch(e){}},0)}   /* second fixture cancelled */
    else if(saved&&P.m44l&&P.f&&P.m44&&!comp(l,P.t)){setTimeout(()=>{try{const c=a6NewLine('imp');Object.assign(c,{day:l.day,dayJ:l.dayJ,doc:l.doc,sut:l.sut||'',teeth:[],imp:{},n:0,m44of:P.t+'|'+l.id});
        if(l.fp==null||l.fp==='')l.fp=0;   /* the failed fixture is not charged unless a tariff is typed */
        A6.dirty=true;arbRe();arbOpen(c,P.t);const h=$('arbSh')&&$('arbSh').querySelector('h3');if(h)h.textContent='فیکسچر دوم — '+h.textContent}catch(e){console.error('m44b second',e)}},0)}}catch(e){console.error('m44b close',e)}
  return r}}
{const _l=a6Line;a6Line=function(l){let h=_l.apply(this,arguments);try{if(l&&l.k==='imp'&&A6){const T=twins(l);
    if(T.length)h=h.replace('<div class="a6g2">',`<p class="note m44bn">فیکسچر دوم پس از «فیل اولیه»: ${esc(toothTxt(T))} — فیکسچرِ فیل‌شده در جلسه‌ی دیگرِ همین تاریخ ثبت است.</p><div class="a6g2">`);
    (l.teeth||[]).filter(t=>m3F(l,t)&&comp(l,t)).forEach(t=>{h=h.replace(new RegExp(`(<button type="button" class="arbc[^"]*" data-arbt="${t}" data-l="${l.id}">[\\s\\S]*?)</button>`),'$1 <i class="m3f">+ فیکسچر دوم</i></button>')})}}catch(e){}return h}}
window.m44b={comp,twins};
})();
