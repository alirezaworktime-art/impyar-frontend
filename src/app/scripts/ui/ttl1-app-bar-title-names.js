/* ---------- ttl1: the app-bar title names the section the user is in (not always «طرح درمان ایمپلنت») ---------- */
function ttlNow(){if(!ROLE||!$('viewLogin').hidden)return 'طرح درمان ایمپلنت';
  const vs=$('viewSurg');if(vs&&!vs.hidden)return SURG&&SURG.arc?'بایگانی · پرونده‌ی جا مانده':'روز جراحی';
  const vf=$('viewForm');if(vf&&!vf.hidden)return 'طرح درمان';
  let t=null;try{t=tileList().find(x=>x.k===TILE)}catch(e){}
  return t?t.l:(ROLE_LBL&&ROLE_LBL[ROLE]?'کارتابل '+ROLE_LBL[ROLE]:'طرح درمان ایمپلنت')}
function ttlSet(){const el=document.querySelector('.appbar .brand h1');if(!el)return;const v=ttlNow();if(el.textContent!==v)el.textContent=v}
setInterval(ttlSet,1500);
/* ttl1: a field with a suggestion list (doctor, city, service…) shows the whole list again when tapped: the current value
   moves to the placeholder while the field is focused and comes back if nothing new is typed or picked */
document.addEventListener('focusin',e=>{const i=e.target;if(!i||i.tagName!=='INPUT'||!i.getAttribute('list')||!i.value||i.readOnly||i.disabled)return;
  i.dataset.dlPrev=i.value;i.dataset.dlPh=i.getAttribute('placeholder')||'';i.setAttribute('placeholder',i.value);i.value=''});
document.addEventListener('focusout',e=>{const i=e.target;if(!i||i.tagName!=='INPUT'||i.dataset.dlPrev===undefined)return;
  if(!i.value.trim())i.value=i.dataset.dlPrev;if(i.dataset.dlPh)i.setAttribute('placeholder',i.dataset.dlPh);else i.removeAttribute('placeholder');delete i.dataset.dlPrev;delete i.dataset.dlPh});
/* ttl1: after «خروج» nothing of the last login stays on the sign-in page (tiles, «همه‌ی بخش‌ها», name, attendance) */
function ttlLoginClean(){['tiles','ux2TT','attBtn','nav'].forEach(id=>{const el=$(id);if(el)el.hidden=true});const w=$('whoami');if(w)w.textContent='';document.querySelectorAll('.tilehd').forEach(x=>x.remove());try{TILE='';UX2.role=''}catch(e){}ttlSet()}
/* ttl1's two show layers in one: after every view change the title is refreshed (next tick); on the sign-in view the last login is cleared */
{const _sh=show;show=function(v){const r=_sh.apply(this,arguments);setTimeout(ttlSet,0);if(v==='login')ttlLoginClean();return r}}

