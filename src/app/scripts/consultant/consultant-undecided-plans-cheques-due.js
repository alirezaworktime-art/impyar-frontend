/* ---------- consultant: undecided plans, cheques due ---------- */
let UN={why:''},UND_ALL=false;
function renderConx(){const w=$('conxW');w.hidden=ROLE!=='consultant'||!CF_ON;if(w.hidden)return;const td=tDay();
  $('chqList').innerHTML=QCHQ.length?QCHQ.map(c=>{const n=dDiff(c.due,td);return `<div class="item"><div class="row1"><div><span class="nm">${esc(c.name)}</span><div class="meta">چک ${fa(c.amount)} تومان${c.no?' · شماره '+esc(faD(c.no)):''}${c.bank?' · '+esc(c.bank):''}</div></div><span class="pill ${c.st==='bounce'?'settle':n<0?'settle':n===0?'wait':''}">${c.st==='bounce'?'برگشت خورده':dueLbl(c.due)}</span></div>
    <div class="acts"><button class="btn sm ghost" type="button" data-chqp="${esc(c.id)}">🖨 چاپ چک</button><button class="btn sm" type="button" data-pyst="ok" data-pid="${esc(c.id)}">وصول شد</button>${c.st==='wait'?`<button class="btn sm ghost" type="button" data-pyst="bounce" data-pid="${esc(c.id)}">برگشت خورد</button>`:''}<button class="btn sm ghost" type="button" data-file="${esc(c.plan)}" data-fname="${esc(c.name)}" data-ftab="pay">پرونده</button></div></div>`}).join(''):'<div class="empty">چکی در ۷ روز آینده سررسید ندارد.</div>';
  const und=Object.fromEntries(QUND.map(u=>[u.id,u])),T=TASKS.filter(t=>!t.done&&(t.kind==='fol1'||t.kind==='fol4')),due=T.filter(t=>dDiff(t.due,td)<=0);
  const card=(u,t)=>{const L=u.lost||{};return `<div class="item${t&&dDiff(t.due,td)<0?' late':''}"><div class="row1"><div><span class="nm">${esc(u.name)}</span><div class="meta">${L.r?'دلیل: '+esc(L.r):''}${L.note?' — '+esc(L.note):''}${u.total?' · طرح '+fa(u.total)+' تومان':''}</div><div class="meta">${t?(t.kind==='fol1'?'پیگیری یک هفته بعد':'پیگیری چهار هفته بعد'):'تصمیم‌نگرفته از '+esc(jd(L.at))}</div></div>${t?`<span class="pill ${dDiff(t.due,td)<0?'settle':'wait'}">${dueLbl(t.due)}</span>`:''}</div>
    <div class="acts">${u.phone?`<a class="btn sm ghost" href="tel:${esc(toEn(u.phone))}">تماس</a>${waLink(u.phone)?`<a class="btn sm ghost" target="_blank" rel="noopener" href="${waLink(u.phone,msgFor('fol',u.name))}">واتس‌اپ</a>`:''}`:''}
      ${t?`<button class="btn sm ghost" type="button" data-tdone="${esc(t.id)}">پیگیری شد</button>`:''}<button class="btn sm" type="button" data-undto="back" data-uid="${esc(u.id)}">بیمار برگشت؛ به کارتابل</button><button class="btn sm ghost" type="button" data-undto="lost" data-uid="${esc(u.id)}">انصراف قطعی</button><button class="btn sm ghost" type="button" data-file="${esc(u.id)}" data-fname="${esc(u.name)}">پرونده</button></div></div>`};
  const rows=UND_ALL?QUND.map(u=>card(u,T.find(t=>t.plan===u.id&&dDiff(t.due,td)<=0))):due.filter(t=>und[t.plan]).map(t=>card(und[t.plan],t));
  $('folList').innerHTML=rows.length?rows.join(''):`<div class="empty">${QUND.length?'امروز پیگیری‌ای سررسید نشده.':'طرح تأییدنشده‌ای در انتظار نیست. اگر بیمار تصمیم نگرفت، در فرم «تصمیم نگرفت» را بزنید.'}</div>`;
  const b=$('undAll');b.hidden=!QUND.length;b.textContent=UND_ALL?'فقط پیگیری‌های امروز':`همه‌ی تصمیم‌نگرفته‌ها (${fa(QUND.length)})`}
function openUndecided(mode){UN={why:'',mode:mode||''};const L=UN.mode==='lost';$('unTitle').textContent=L?'بیمار پشیمان شد و رفت':'بیمار می‌خواهد فکر کند';$('unNote').textContent=L?'طرح ذخیره و انصراف بیمار ثبت می‌شود.':'طرح ذخیره می‌شود و از کارتابل بیرون می‌رود. یک هفته و چهار هفته‌ی بعد در «پیگیری‌ها»ی پذیرش یادآوری می‌شود تا با بیمار تماس بگیرند.';$('unGo').textContent=L?'ثبت انصراف':'ثبت و پیگیری بعداً';$('unWhy').innerHTML=UN_WHY.map(w=>`<button type="button" class="chip" data-unw="${w}" aria-pressed="false">${w}</button>`).join('');$('un_note').value='';$('unMsg').textContent='';$('unSheet').hidden=false}
/* sendUndecided = one definition of its former patch layers, in their run order (outermost first):
   m57a (consultant/m57a.js): M57.think is on while saving, so buildPDF adds the SMS block to the «think» PDF;
   m17 (pdf/not-saved-no-pdf.js): after a successful save the plan PDF downloads (not when the save did not happen);
   fx3 (finance/fx3-payment-warning-reason-collection.js): the reason «استعلام قیمت» stores F.quote before the save;
   base: the save itself. M57, m57SmsNo and FX3QW come from those files and are read only when the button is clicked.
   The m57a and m17 parts run only once their file has run (flags M57_SU, M17_SU set where their layer used to be installed). */
async function sendUndecided(t){
  const m57 = typeof M57_SU !== 'undefined', m17 = typeof M17_SU !== 'undefined';
  /* m57a */
  if (m57) { M57.think = !(UN && UN.mode === 'lost'); try { if (M57.think) await m57SmsNo(true) } catch (e) { } }
  try {
    /* m17: what the plan was before the save */
    const F0 = F, nm = String((F0 && F0.h && F0.h.name) || '').trim();
    /* fx3 */
    if(UN&&UN.why===FX3QW){const u=parseJ(($('fx3_until')||{}).value||'');F.quote={at:tDay(),until:u&&u>=tDay()?u:dAdd(tDay(),30)}}
    /* base */
    const m=$('unMsg');if(!UN.why){m.className='msg err';m.textContent='دلیل را انتخاب کنید.'}else{t.disabled=true;if(!t.dataset.sid)t.dataset.sid=uuid();
  try{const d=toDoc(F);d.updatedAt=new Date().toISOString();const name=F.h.name.trim();
    const uj=await api('undecided',{record:{id:F.id,data:d,name,nid:F.h.nid||'',status:'draft',total:planTotal(F)},reason:UN.why,note:$('un_note').value.trim(),sendId:t.dataset.sid});delete t.dataset.sid;
    if(UN.mode==='lost')await api('undecidedSet',{id:uj.id||F.id,to:'lost',reason:UN.why,note:$('un_note').value.trim()});
    $('unSheet').hidden=true;leaveForm(UN.mode==='lost'?`انصراف ${name} ثبت شد.`:`${name}: در «پیگیری‌ها»ی پذیرش، یک هفته و چهار هفته‌ی بعد یادآوری می‌شود.`);pollQ(true)}
  catch(e){m.className='msg err';m.textContent=e.message}finally{t.disabled=false}}
    /* m17: PDF only when the plan was saved and left (also runs after the «choose a reason» message, where it does nothing) */
    if (m17) try { if (F === F0 || !nm || !$('unSheet').hidden) return; /* not saved: no PDF */
      const j = jalali(new Date()), fname = `${safeName(nm)} - ${j.dash}.pdf`, R = Object.assign({}, F0, { jalali: j.slash, pdfName: fname });
      const pdf = await buildPDF(R, { jalali: j.slash }); downloadBlob(pdf.blob, fname) }
    catch (e) { alertMsg('ثبت انجام شد ولی PDF ساخته نشد: ' + (e && e.message || e)) }
  } finally { if (m57) M57.think = false } }

