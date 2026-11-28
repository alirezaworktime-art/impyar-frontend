/* ---------- arc4: paper file — uncovering and GBR by count, cost of the chosen works by the tariffs, payments only when editing;
   surgery-day treatment lists stay below the header / tiles while scrolling ---------- */
let ARC_UNC=null;
function arcUncPrice(){if(ARC_UNC!==null)return Promise.resolve(ARC_UNC);return api('finCatalog').then(j=>{const s=(j.svc||[]).find(x=>x.active!==0&&/آ?نکاوری/.test(x.name||''));ARC_UNC=s?Number(s.price)||0:0;return ARC_UNC}).catch(()=>{ARC_UNC=0;return 0})}
['click','change','input'].forEach(ev=>document.addEventListener(ev,e=>{if(SURG&&SURG.arc&&e.target.closest&&e.target.closest('#viewSurg,#impSheet'))setTimeout(()=>{if(e.target.id==='arc_unc'){const A=SURG.arc,c=A.ses[A.cur];if(c)c.uncN=Math.min(40,num(toEn(e.target.value)))}arcCostUpd()},0)}));
/* surgery-day lists: below the app bar on a phone, below the tiles on a computer */
function sgPickTop(){const v=$('viewSurg');if(!v||v.hidden)return;const ab=document.querySelector('.appbar'),Z=window.ZM?ZM():1,hb=ab?ab.getBoundingClientRect().bottom:0,mob=matchMedia('(max-width:720px)').matches;
  document.querySelectorAll('#viewSurg .sgpick').forEach(el=>{if(mob){el.style.top=Math.max(0,hb)/Z+'px';el.style.maxHeight='';return}
    const t=$('tiles'),tb=t&&!t.hidden&&t.offsetParent?t.getBoundingClientRect().bottom:0,top=Math.max(hb+8,tb+8,84*Z);el.style.top=top/Z+'px';el.style.maxHeight=Math.max(160,innerHeight-top-12)/Z+'px'})}
addEventListener('scroll',()=>requestAnimationFrame(sgPickTop),{passive:true});addEventListener('resize',sgPickTop);
{const _rs=renderSurg;renderSurg=function(){const r=_rs.apply(this,arguments);sgPickTop();return r}}

