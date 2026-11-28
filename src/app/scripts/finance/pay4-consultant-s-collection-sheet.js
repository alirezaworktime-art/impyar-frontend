/* ---------- pay4: «فقط بیعانه» in the consultant's collection sheet; the rest is collected later by the consultant from the patient file, as before ---------- */
/* p4Mode: pay4 base + fin1 (cheque kind / payee box follows the mode) */
function p4Mode(dep){if(PC){PC.dep=!!dep;document.querySelectorAll('#p4Mode .chip').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.p4mode==='dep'?PC.dep:!PC.dep)));
  const ci=$('pc_cash'),lb=ci&&ci.closest('label');if(lb&&lb.firstChild&&lb.firstChild.nodeType===3)lb.firstChild.textContent=PC.dep?'مبلغ بیعانه (تومان)':'نقد دریافتی امروز (تومان)';
  if(PC.dep){PC.p4keep=PC.rcash;PC.rcash=0;if(ci){ci.value='';ci.placeholder='مبلغ بیعانه';setTimeout(()=>{try{ci.focus()}catch(e){}},50)}}else if(PC.p4keep!==undefined){PC.rcash=PC.p4keep;if(ci)ci.value=PC.rcash?fa(PC.rcash):'۰'}
  ['pc_first','pc_bank'].forEach(id=>{const x=$(id),l=x&&x.closest('label');if(l)l.hidden=PC.dep});['pcList','pcPrint','pcPrev'].forEach(id=>{const x=$(id);if(x)x.hidden=PC.dep});
  const sv=$('pcSave');if(sv)sv.textContent=PC.dep?'ثبت بیعانه':'ثبت دریافت‌ها در پرونده';const m=$('pcMsg');if(m){m.className='msg';m.textContent=PC.dep?'بیعانه به حساب پارت جراحی ثبت می‌شود؛ مانده‌ی نقد و چک‌ها را بعداً از «پرداخت‌ها»ی پرونده‌ی بیمار بگیرید.':''}}
  const c=$('fin1PcChq');if(c)c.hidden=!!dep||!(PC&&PC.chq&&PC.chq.length)}
(function(){const _o=openPostConfirm;openPostConfirm=function(snap){const r=_o.apply(this,arguments);try{if(PC){PC.dep=false;const f=$('pcSheet').querySelector('.fields');if(f&&!$('p4Mode'))f.insertAdjacentHTML('beforebegin','<div class="chips" id="p4Mode" style="margin:6px 0"><button type="button" class="chip" data-p4mode="full" aria-pressed="true">دریافت کامل</button><button type="button" class="chip" data-p4mode="dep" aria-pressed="false">فقط بیعانه</button></div>')}}catch(e){}return r}})();
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.dataset.p4mode&&PC){e.stopImmediatePropagation();p4Mode(t.dataset.p4mode==='dep');return}
  if(t.dataset.p4rest){e.stopImmediatePropagation();const id=t.dataset.p4rest;t.disabled=true;try{const j=await api('get',{id});openPostConfirm(fromDoc(id,j.data||{}))}catch(err){toast(err.message,1)}finally{t.disabled=false}return}
  if(t.id==='pcSave'&&PC&&PC.dep){e.stopImmediatePropagation();const m=$('pcMsg'),a=num(($('pc_cash')||{}).value);
    if(!a){m.className='msg err';m.textContent='مبلغ بیعانه را بنویسید.';return}if(!PC.via){m.className='msg err';m.textContent='مشخص کنید بیعانه با کدام کارتخوان (یا اسکناس / کارت‌به‌کارت) دریافت شد.';return}
    t.disabled=true;try{const q=await api('payAdd',{id:PC.id,pid:'dep-'+PC.id.slice(0,36)+'-'+PC.k,pay:{kind:posKind(PC.via),pos:posId(PC.via),part:'s',amount:a,by:ROLE_LBL[ROLE],note:'بیعانه',acct:PC.via==='xfer'?PC.acct||'':''}});
      m.className='msg ok';m.textContent=(q&&q.dup?'این بیعانه قبلاً ثبت شده بود.':'بیعانه‌ی '+fa(a)+' تومان در پرونده ثبت شد.');toast(m.textContent);setTimeout(()=>{if($('pcSheet'))$('pcSheet').hidden=true;PC=null},800)}
    catch(err){m.className='msg err';m.textContent=err.message;t.disabled=false}return}},true);

