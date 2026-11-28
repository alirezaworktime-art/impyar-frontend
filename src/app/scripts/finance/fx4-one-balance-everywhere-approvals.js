/* ---------- fx4: one balance everywhere, approvals for doctor / surgery, refunds, free (waived) surgery difference ---------- */
/* money writes carry an operation id so a slow network never records them twice */
const FX4_ONCE=['settleDone','fxArc','refundPay','fx4Refund','fx4RefundCancel','fx4Allow','payAdd','fxNote','fx5SurgCancel'];
{const _a4=api;api=async function(action,payload={},opt={}){
  if(payload&&typeof payload==='object'&&FX4_ONCE.includes(action)&&!payload.sendId)payload.sendId=uuid();
  if(action==='settleDone'&&payload&&payload.id&&ROLE!=='surgery'){
    if(typeof ST!=='undefined'&&ST&&ST.k==='waive'){const a=parseInt(toEn(($('fx4_wv')||{}).value||'').replace(/[^\d]/g,''),10)||0,n=(($('fx4_wvn')||{}).value||'').trim();
      if(!a)throw new Error('مبلغ رایگان را وارد کنید.');if(n.length<3)throw new Error('دلیل رایگان بودن را بنویسید (مثلاً کاشت دوباره‌ی گارانتی).');payload.waive={amount:a,note:n}}
    /* the cost of the surgery work is counted again here from the saved sessions and the plan prices */
    if(payload.actual===undefined&&ROLE==='consultant'){try{const j=await _a4('get',{id:payload.id});const r=fromDoc(payload.id,j.data||{}),sg=j.surg||{};
      if(r&&sg.sessions&&sg.sessions.length&&!sg.arc){const pl=planTotal(r);if(Math.abs(pl-(Number(sg.planned)||0))<=1){const a0=surgActual(r,sg.sessions);payload.actual=(typeof discOn==='function'&&discOn(r))?a0-discAmt(r,a0):a0}}}catch(e){}}}
  return _a4(action,payload,opt)}}
/* the patient file uses the balance the server computes (same as debtors, creditors and the payment check) */
/* settlement: «رایگان» (waive) for a positive difference, e.g. a warranty re-implant */
ST_K.splice(3,0,['waive','رایگان (بخشودن؛ مثلاً کاشت دوباره‌ی گارانتی)']);
/* (stPays: «رایگان» returns nothing to collect — merged into pros2-surgery-difference-settlement-consultant.js) */
document.addEventListener('input',e=>{const t=e.target;if(t&&t.id==='fx4_wv'){const n=mnum(t.value);t.value=n?fa(n):''}});
/* tasks: «تأیید ادامه با پرداخت ناقص» for reception */
Object.assign(TLBL,{payok:['تأیید ادامه با پرداخت ناقص','پزشک می‌خواهد کار را ادامه دهد ولی پرداخت بیمار طبق قرار کامل نیست. با بیمار هماهنگ کنید؛ اگر ادامه مجاز است دلیل را ثبت کنید تا پزشک دوباره بزند.']});Object.assign(TGRP,{payok:'fl'});
async function fx4AllowGo(t){const id=t.dataset.fx4allow,step=t.dataset.fx4step;const reason=await fx3Ack(0,step,'پزشک می‌خواهد ادامه دهد.');if(!reason)return;t.disabled=true;
  try{const j=await api('fx4Allow',{id,step,reason});toast('ثبت شد؛ پزشک حالا می‌تواند ادامه دهد'+(j.short?' (برای مانده کار «وصول» ساخته شد).':'.'));pollQ(true)}catch(err){alertMsg(err.message)}finally{t.disabled=false}}
/* refunds: a refund for a creditor (lost patient, plan confirmed again for less, over-payment) and cancelling an open refund */
async function fx4RefundGo(t){const id=t.dataset.fx4rf,max=Number(t.dataset.fx4max)||0,nm=t.dataset.fx4n||'';
  const s=fxSheet('fx4RfSheet',`<h3>ثبت استرداد · ${esc(nm)}</h3><p class="note">بستانکاری قابل استرداد: <b>${fa(max)}</b> تومان. بعد از ثبت، حسابدار پرداخت را انجام می‌دهد.</p>
  <div class="fields"><label class="f">مبلغ (تومان)<input id="fx4_rfa" inputmode="numeric" value="${fa(max)}"></label><label class="f">علت (الزامی)<input id="fx4_rfn" maxlength="300" placeholder="مثلاً: انصراف بیمار؛ پیش‌پرداخت برگشت داده شود"></label></div><div class="msg" id="fx4RfM"></div>
  <div class="btns"><button class="btn" type="button" id="fx4RfGo" style="flex:1">ثبت استرداد</button><button class="btn ghost" type="button" id="fx4RfNo">انصراف</button></div>`);
  $('fx4RfNo').onclick=()=>{s.hidden=true};$('fx4_rfa').oninput=e=>{const n=mnum(e.target.value);e.target.value=n?fa(n):''};
  $('fx4RfGo').onclick=async()=>{const b=$('fx4RfGo'),m=$('fx4RfM');b.disabled=true;try{await api('fx4Refund',{id,amount:mnum($('fx4_rfa').value),note:$('fx4_rfn').value.trim()});s.hidden=true;toast('استرداد ثبت شد؛ در فهرست استردادهای حسابدار است.');try{loadAccRep()}catch(e){}if(PF&&!$('pfSheet').hidden)refreshFile()}catch(err){m.className='msg err';m.textContent=err.message}finally{b.disabled=false}}}
async function fx4RfCancel(t){const note=await new Promise(res=>{const s=fxSheet('fx4RcSheet',`<h3>لغو استرداد</h3><p class="note">فقط استردادی که هنوز پرداخت نشده لغو می‌شود.</p><label class="f">علت لغو (الزامی)<input id="fx4_rcn" maxlength="300"></label><div class="msg" id="fx4RcM"></div><div class="btns"><button class="btn" type="button" id="fx4RcGo" style="flex:1">لغو استرداد</button><button class="btn ghost" type="button" id="fx4RcNo">بستن</button></div>`);
  $('fx4RcNo').onclick=()=>{s.hidden=true;res('')};$('fx4RcGo').onclick=()=>{const v=$('fx4_rcn').value.trim();if(v.length<3){$('fx4RcM').className='msg err';$('fx4RcM').textContent='علت را بنویسید.';return}s.hidden=true;res(v)}});
  if(!note)return;t.disabled=true;try{await api('fx4RefundCancel',{rid:t.dataset.fx4rfc,note});toast('استرداد لغو شد.');pollQ(true);try{const c=$('rfdCard');if(c){const j=await api('refundList');c.innerHTML=rfdHTML(j.items||[])}}catch(e){}if(PF&&!$('pfSheet').hidden)refreshFile()}catch(err){alertMsg(err.message)}finally{t.disabled=false}}
function fx4CredHTML(j){const L=j.cred||[];if(ROLE==='staff')return '';return `<h3 class="pf-h">بستانکاران (بیشتر از هزینه‌ی درمان پرداخته‌اند یا انصراف داده‌اند) <small class="note">جمع ${money(j.credSum||0)}</small></h3>
  <div class="list">${L.map(d=>`<div class="item"><div class="row1"><div><span class="nm">${esc(d.name)}</span><div class="meta">${d.q==='lost'?'انصراف · ':''}هزینه ${money(d.total)} · پرداخت ${money(d.paid)}${d.rfOpen?' · استرداد باز '+money(d.rfOpen):''}${d.phone?' · '+esc(faD(d.phone)):''}</div></div><div class="acts"><b>${money(d.credit)}</b>${['consultant','accountant'].includes(ROLE)?`<button class="btn sm" type="button" data-fx4rf="${esc(d.id)}" data-fx4max="${d.credit}" data-fx4n="${esc(d.name)}">ثبت استرداد</button>`:''}<button class="btn sm ghost" type="button" data-wbfile="${esc(d.id)}" data-wbn="${esc(d.name)}">پرونده</button></div></div></div>`).join('')||'<div class="empty">بستانکاری نیست.</div>'}</div>`}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-fx4allow],[data-fx4rf],[data-fx4rfc]');if(!t)return;e.preventDefault();
  if(t.dataset.fx4allow!==undefined)fx4AllowGo(t);else if(t.dataset.fx4rf)fx4RefundGo(t);else fx4RfCancel(t)});
