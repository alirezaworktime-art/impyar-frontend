/* ---------- fin1: card-to-card destination account, cheque kind (صیادی / دیجیتال) and payee, consultant takes only the deposit,
   «مالی بیماران» tile (search a patient → his payments) ---------- */
const FIN1_ACC=['K10','K700','K797','نگارین','ربی طب','مائده سادات','حسین علویکیا']; /* q10 */
const FIN1_PAYEE=['مجتبی سادات‌الحسینی','مریم بیرجندی','ربابه کاظمی','سید مجتبی علویکیا','مائده سادات','مبینا سادات','نگارین',['*','سایر']];
const FIN1_CT=[['sayad','صیادی'],['digi','دیجیتال']];
const fin1Chips=(attr,L,sel)=>`<div class="chips">${L.map(x=>{const [v,l]=Array.isArray(x)?x:[x,x];return `<button type="button" class="chip" data-${attr}="${esc(v)}" aria-pressed="${sel===v}">${esc(l)}</button>`}).join('')}</div>`;
function fin1AcctHTML(attr,show,sel){return `<div class="f fin1w" data-fin1w="${attr}"${show?'':' hidden'}><span>به کدام حساب کارت‌به‌کارت / واریز شد؟ *</span>${fin1Chips(attr,FIN1_ACC,sel)}</div>`}
function fin1ChqHTML(pre,o){return `<div class="f fin1w"><span>نوع چک *</span>${fin1Chips(pre+'ct',FIN1_CT,o.ctype)}</div><div class="f fin1w"><span>در وجه *</span>${fin1Chips(pre+'pe',FIN1_PAYEE,o.payee)}</div>`}
function fin1Pick(t,attr){t.closest('.chips').querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',b===t));return t.dataset[attr]}
const fin1Show=(attr,on)=>{const w=document.querySelector(`[data-fin1w="${attr}"]`);if(w)w.hidden=!on};
window.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;const d=t.dataset;
  if(d.pyacct!==undefined){PYF.acct=fin1Pick(t,'pyacct');return}
  if(d.pyct!==undefined){PYF.ctype=fin1Pick(t,'pyct');return}
  if(d.pype!==undefined){PYF.payee=fin1Pick(t,'pype');return}
  if(d.pcacct!==undefined&&PC){PC.acct=fin1Pick(t,'pcacct');return}
  if(d.pcct!==undefined&&PC){PC.ctype=fin1Pick(t,'pcct');return}
  if(d.pcpe!==undefined&&PC){PC.payee=fin1Pick(t,'pcpe');return}
  if(d.pypos!==undefined)setTimeout(()=>fin1Show('pyacct',PYF.pos==='xfer'),0);
  if(d.pcpos!==undefined)setTimeout(()=>fin1Show('pcacct',PC&&PC.via==='xfer'),0);
  /* «مالی بیماران»: a patient picked from the list opens on his payments */
  if(d.file!==undefined&&TILE==='pay'&&['staff','consultant'].includes(ROLE)&&t.closest('#viewList')){e.preventDefault();e.stopImmediatePropagation();openFile(d.file,d.fname,'pay');return}},true);
/* consultant: the collection sheet after confirmation takes only the deposit (reception collects the rest) */
{const _o=openPostConfirm;openPostConfirm=function(){const r=_o.apply(this,arguments);try{if(PC){PC.acct='';PC.ctype='';PC.payee='';
  const pp=$('pcPos');if(pp&&!document.querySelector('[data-fin1w="pcacct"]'))pp.insertAdjacentHTML('afterend',fin1AcctHTML('pcacct',PC.via==='xfer',''));
  const pl=$('pcList');if(pl&&PC.chq&&PC.chq.length&&!$('fin1PcChq'))pl.insertAdjacentHTML('beforebegin',`<div id="fin1PcChq">${fin1ChqHTML('pc',PC)}</div>`);
  if(ROLE==='consultant'){p4Mode(true);const b=document.querySelector('#p4Mode [data-p4mode="full"]');if(b)b.hidden=true;const c=$('fin1PcChq');if(c)c.hidden=true;
    const m=$('pcMsg');if(m){m.className='msg';m.textContent='مبلغ بیعانه و روش دریافت را مشخص کنید، بعد «ثبت بیعانه» را بزنید. بقیه‌ی پول را پذیرش دریافت می‌کند.'}}}}catch(e){}return r}}
/* the deposit / full collection need the account (card-to-card) and the cheque kind and payee */
window.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#pcSave');if(!t||!PC)return;const m=$('pcMsg'),bad=x=>{e.preventDefault();e.stopImmediatePropagation();m.className='msg err';m.textContent=x};
  const cash=PC.dep?num(($('pc_cash')||{}).value):PC.rcash;
  if(PC.dep&&!cash)return bad('مبلغ بیعانه را بنویسید.');
  if(cash>0&&!PC.via)return bad(PC.dep?'مشخص کنید بیعانه با کدام کارتخوان، اسکناس یا کارت‌به‌کارت دریافت شد.':'مشخص کنید مبلغ نقد با کدام کارتخوان، اسکناس یا کارت‌به‌کارت دریافت شد.');
  if(cash>0&&PC.via==='xfer'&&!PC.acct)return bad('حساب مقصد کارت‌به‌کارت را انتخاب کنید.');
  if(!PC.dep&&PC.chq&&PC.chq.length&&(!PC.ctype||!PC.payee))return bad('نوع چک (صیادی / دیجیتال) و «در وجه» را انتخاب کنید.')},true);
/* «مالی بیماران» tile for reception and the consultant */
['staff','consultant'].forEach(r=>{const f=TILES[r];if(!f)return;TILES[r]=()=>{const L=f(),i=L.findIndex(x=>x.k==='arch'),T={k:'pay',c:'fin',l:'مالی بیماران',s:'پرداخت، کارتخوان، کارت‌به‌کارت، چک',n:0,tab:'tabList'};if(i<0)L.push(T);else L.splice(i,0,T);return L}});
try{TILE_HD.staff.pay='مالی بیماران — نام بیمار را جستجو کنید و «پرونده» را بزنید تا پرداخت‌هایش باز شود';(TILE_HD.consultant=TILE_HD.consultant||{}).pay=TILE_HD.staff.pay}catch(e){}

