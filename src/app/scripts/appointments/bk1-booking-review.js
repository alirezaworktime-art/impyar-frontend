/* bk1: booking review */
BKM.ot={t:'نوبت‌دهی ویزیت و سایر',k:['other','postop','check','chkp','rpr','rmv','tooth','soft'],d:'other'};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-bk1day],[data-bk1v],#bkmX');if(!t)return;
  if(t.id==='bkmX'){BK1.day='';return}
  if(t.dataset.bk1day){e.preventDefault();e.stopPropagation();BK1.day=t.dataset.bk1day;bkModeOpen();return}
  if(t.dataset.bk1v){e.preventDefault();e.stopPropagation();const k=(TASKS||[]).find(x=>x.id===t.dataset.bk1v);if(!k)return;
    openAppt({plan:k.plan,name:k.name,phone:k.phone,kind:k.kind==='pweek'?'chkp':'postop',note:'از تماس پیگیری: '+((TLBL[k.kind]||[k.kind])[0]),lock:1})}},true);
