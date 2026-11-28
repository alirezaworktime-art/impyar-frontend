/* ---------- oc4: «سایر کلینیک‌ها» روی لینک کند — (۱) جابه‌جایی مربع‌ها داده‌ی تازه (کمتر از ۴۵ ثانیه) را دوباره از سرور نمی‌گیرد؛
   (۲) فهرست بیماران و پرونده‌ی بیمار اول از حافظه نشان داده می‌شوند و در پس‌زمینه تازه می‌شوند؛ (۳) نوار باریک «در حال دریافت» بالای بخش.
   هیچ محاسبه یا ذخیره‌ای عوض نشده؛ هر ثبت همان ocLoad/oc2Open کامل را صدا می‌زند. ---------- */
function ocLoadSoft(){const [f,t]=OC.seg==='rep'||OC.seg==='pay'?ocRange(OC.per):ocRange('m0');
  if(OC.d&&OC.key===f+'|'+t&&OC.at&&Date.now()-OC.at<45000){ocRender();try{renderTiles()}catch(e){}return}
  return ocLoad()}
/* api, «oc» requests only (oc4, two layers in one): the busy mark on #ocRoot while a request runs; the patient-page cache (op pat) and clearing the caches after a change */
{ const _a=api,N={n:0};api=function(action,payload){const p=_a.apply(this,arguments);if(action!=='oc')return p;
    const r=document.getElementById('ocRoot');if(r){N.n++;r.classList.add('oc-wait')}
    const q=Promise.resolve(p).finally(()=>{const r2=document.getElementById('ocRoot');if(--N.n<=0){N.n=0;r2&&r2.classList.remove('oc-wait')}});
    if(action==='oc'&&payload&&payload.op==='pat'&&OC2.vc)Promise.resolve(q).then(j=>{if(j&&j.ok&&j.pat)OC2.vc[j.pat.id]=j}).catch(()=>{});
    if(action==='oc'&&payload&&payload.op&&/^(ses3|session|pros|prosDel|sesDel|plan3|patNew)$/.test(payload.op)){OC2.pc={};if(OC2.vc)Promise.resolve(q).then(()=>{OC2.vc={}}).catch(()=>{})}
    return q} }
