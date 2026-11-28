/* ---------- background send queue: the doctor never waits for upload/email ---------- */
let OUTBOX=[],OB_RUN=false,OB_TIMER=null;const SENDING=new Set();
try{OUTBOX=JSON.parse(localStorage.getItem('implantOutbox')||'[]')||[]}catch(e){OUTBOX=[]}
OUTBOX.forEach(o=>o.id&&SENDING.add(o.id));
function saveOutbox(){try{localStorage.setItem('implantOutbox',JSON.stringify(OUTBOX))}catch(e){}}
function obBar(){const el=$('obBar'),n=OUTBOX.filter(o=>(o.role||'doctor')===ROLE&&o.kind!=='pdf').length;if(!n){el.hidden=true;return}
  const err=OUTBOX.find(o=>o.err&&o.kind!=='pdf'&&(o.role||'doctor')===ROLE);el.hidden=false;el.className='obbar'+(err?' err':'');
  el.textContent=err?`ارسال ${fa(n)} طرح درمان انجام نشد؛ خودکار دوباره تلاش می‌شود…`:`در حال ارسال ${fa(n)} طرح درمان در پس‌زمینه…`}
/* toast — base + ux8 (while a live «برگرداندن» undo button shows, a plain message goes to a second line and keeps the button).
   lab/m23 still wraps it (it reads M23_E0, a let of a later script). */
function toast(t,bad){const el=$('toast');const live=el&&el._ux8u&&el._ux8u>Date.now()&&!el.hidden&&el.querySelector('.tundo:not(:disabled)');
  if(live){let s=el.querySelector('.ux8m');if(!s){s=document.createElement('div');s.className='ux8m';el.appendChild(s)}s.textContent=t;s.classList.toggle('err',!!bad);return}
  el.textContent=t;el.className='toast'+(bad?' err':'');el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>el.hidden=true,6000)}
async function processOutbox(){processPdf();const mine=()=>OUTBOX.filter(o=>(o.role||'doctor')===ROLE&&o.kind!=='pdf');
  if(OB_RUN||!ROLE||!mine().length)return obBar();OB_RUN=true;clearTimeout(OB_TIMER);
  try{while(mine().length){const o=mine()[0];obBar();
      try{if(!o.sid)o.sid=uuid();o.payload.sendId=o.sid;const j=await api(o.kind==='consult'?'toConsult':'confirm',CF_ON&&o.kind==='confirm'?Object.assign({},o.payload,{pdf:undefined}):o.payload,{prio:'bg',timeout:o.kind==='confirm'&&!CF_ON?30000:10000,tries:2});OUTBOX=OUTBOX.filter(v=>v!==o);if((FS_ON||CF_ON)&&o.kind==='confirm'&&o.payload.pdf){OUTBOX.push({kind:'pdf',pid:o.id||j.id,role:o.role,name:o.name,at:Date.now(),payload:Object.assign({},o.payload,{record:Object.assign({},o.payload.record,{id:o.id||j.id})})});processPdf()}saveOutbox();if(o.id){SENDING.delete(o.id);const l=ldGet(o.id);if(!l||(l.updatedAt||'')<=((o.payload.record||{}).data||{}).updatedAt)ldDel(o.id)}
        if(o.kind==='consult')toast(`${o.name} به کارتابل مشاور رسید.`);
        else if(!j.emailStatus)toast(FS_ON||CF_ON?`طرح درمان ${o.name} ثبت شد.`:`طرح درمان ${o.name} ثبت و در Drive ذخیره شد.`);else if(j.emailStatus==='sent')toast(`طرح درمان ${o.name} ثبت و ایمیل شد.`);else toast(`طرح درمان ${o.name} ثبت شد ولی ایمیل نرفت: ${j.emailError||''} (از بایگانی دوباره بفرستید)`,true);
        if(!$('viewList').hidden)loadList();pollQ(true)}
      catch(e){if(!API.pw)break;o.err=e.message||'خطا';o.tries=(o.tries||0)+1;saveOutbox();obBar();OB_TIMER=setTimeout(processOutbox,15000);break}}}
  finally{OB_RUN=false;obBar()}}
/* PDF copy to Google Drive (slow, Apps Script): its own runner so it never delays anything else */
let PDF_RUN=false,PDF_TIMER=null;
async function processPdf(){if(PDF_RUN||!ROLE)return;const mine=()=>OUTBOX.filter(o=>o.kind==='pdf'&&(o.role||'doctor')===ROLE);if(!mine().length)return;PDF_RUN=true;clearTimeout(PDF_TIMER);
  try{while(mine().length){const o=mine()[0];
    try{if(!o.sid)o.sid=uuid();o.payload.sendId=o.sid;const j=await api('gasConfirm',o.payload,{prio:'bg',timeout:60000,tries:1});
      OUTBOX=OUTBOX.filter(v=>v!==o);saveOutbox();if(CF_ON&&j&&o.pid){api('setFile',{id:o.pid,fileId:String(j.fileUrl||''),emailStatus:j.emailStatus||'',emailError:j.emailError||''},{prio:'bg'}).catch(()=>{})}else if(j&&j.id&&o.pid&&FS_ON){fbReady().then(({F})=>F.updateDoc(pRef(o.pid),{fileId:String(j.fileUrl||'')})).catch(()=>{})}}
    catch(e){if(!API.pw)break;o.err=e.message;o.tries=(o.tries||0)+1;saveOutbox();PDF_TIMER=setTimeout(processPdf,30000);break}}}
  finally{PDF_RUN=false}}
function enqueue(job){if(job.id)OUTBOX=OUTBOX.filter(o=>!(o.id===job.id&&o.kind===job.kind));OUTBOX.push(Object.assign({role:ROLE,at:Date.now()},job));if(job.id)SENDING.add(job.id);saveOutbox();processOutbox()}
/* leaveForm — base + m48a (removes the «درمان‌های انتخاب‌نشده» bar button) + m57a (closes the patient's tab in the consultant's open-patients bar) */
function leaveForm(msg){const id=F&&F.id;try{const x=$('m48BarMore');if(x)x.remove()}catch(e){}
  toast(msg);if(F.id)ldDel(F.id);dirty=false;F=blankForm();CUR=1;renderForm();show('queue');renderQ();
  try{if(id){m57Drop(id);m57Bar()}}catch(e){}}
/* doctor: treatment plan goes to the consultant's inbox (background, no waiting) */
function sendToConsult(t){
  if(planEmpty(F)&&!t.dataset.armed){t.dataset.armed='1';alertMsg('هیچ درمانی در طرح انتخاب نشده است. اگر درست است، دوباره «ارسال به مشاور» را بزنید.');setTimeout(()=>delete t.dataset.armed,5000);return}delete t.dataset.armed;
  const d=toDoc(F);d.updatedAt=new Date().toISOString();const name=F.h.name.trim();
  enqueue({kind:'consult',id:F.id,name,payload:{record:{id:F.id,data:d,name,nid:F.h.nid||'',status:'draft',total:planTotal(F)}}});
  leaveForm(`طرح درمان ${name} برای مشاور فرستاده شد.`)}
/* consultant: final approval → PDF downloads on this device now; Drive + email in the background */
/* finalize — one definition of the old layers, run in this order:
   dep1 (editing a confirmed plan: a changed deposit (بیعانه) is corrected on the server first; stops on a missing method or a failed correction),
   pk1 (a total discount needs its reason), fix6b A3 (an operated patient: the consultant decides about the earlier surgery difference; F._sgd is
   cleared afterwards), then the base (PDF on this device now, Drive + email in the background). */
async function finalize(t){
  try{const ed=CF_ON&&F&&F.id&&(F.status==='confirmed'||F.status==='modified')&&['consultant','manager','staff'].includes(ROLE)&&F.pay&&String(F.pay.rcv==null?'':F.pay.rcv).trim()!=='';
    if(ed){const g=await api('get',{id:F.id},{timeout:10000});const prev=num(((g&&g.data&&g.data.pay)||{}).rcv),now=num(F.pay.rcv);
      if(prev!==now){const p=F.pay,via=p.mt==='cash'?'cash':p.mt==='xfer'?'xfer':(p.pos||'');
        if(now>prev&&!via){alertMsg('روش دریافت بیعانه (اسکناس / کارتخوان / واریز) را انتخاب کنید.');return}
        const q=await api('depEdit',{id:F.id,amount:now,pay:{kind:posKind(via||'cash'),pos:posId(via||'cash'),acct:via==='xfer'?p.acct||'':'',by:ROLE_LBL[ROLE]},sendId:uuid()});
        if(!q||q.ok===false){alertMsg('بیعانه اصلاح نشد: '+((q&&q.error)||'خطای نامعلوم'));return}
        try{const g2=await api('get',{id:F.id});if(g2&&Array.isArray(g2.pays))F.pays=g2.pays}catch(e){}
        if(!q.same)toast('بیعانه از '+fa(q.from)+' به '+fa(q.to)+' تومان اصلاح شد.')}}}
  catch(e){alertMsg('اصلاح بیعانه: '+(e&&e.message||e));return}
  try{if(F&&F.pay&&pk1GdRaw(F.pay)&&!String(F.pay.gdwhy||'').trim()){alertMsg('برای تخفیف کلی، «دلیل تخفیف» را بنویسید.');const i=$('p_gdwhy');if(i){i.focus();i.scrollIntoView({behavior:'smooth',block:'center'})}return}}catch(e){}
  if(busy)return;if(!(await fx6bSgAsk()))return;
  try{if(busy)return;
  if(F.brand==='ref'&&needBrand(F)&&!(F.pay&&F.pay.blater)){alertMsg('برند ایمپلنت انتخاب نشده (ارجاع به مشاور). اول در «جمع کل درمان» برند بیمار را انتخاب کنید.');const bt=$('brandTotals');if(bt)bt.scrollIntoView({behavior:'smooth',block:'center'});return}
  busy=true;const old=t.textContent;t.disabled=true;t.textContent='در حال ساخت PDF…';
  try{const j=jalali(new Date()),fname=`${safeName(F.h.name||'بیمار')} - ${j.dash}.pdf`;
    const wasConfirmed=F.status==='confirmed'||F.status==='modified';
    if(CF_ON&&F.id&&wasConfirmed&&!F.surg){try{const g=await api('get',{id:F.id},{timeout:8000});if(g.surg&&(g.surg.sessions||[]).length)F.surg=g.surg}catch(e){}}
    F.status='confirmed';F.jalali=j.slash;F.pdfName=fname;if(wasConfirmed)F.edits=(F.edits||0)+1;
    const pdf=await buildPDF(F,{jalali:j.slash});downloadBlob(pdf.blob,fname);
    const d=toDoc(F);d.updatedAt=new Date().toISOString();const name=F.h.name.trim();
    enqueue({kind:'confirm',id:F.id,name,payload:{record:{id:F.id,data:d,name,nid:F.h.nid||'',status:'confirmed',total:planTotal(F),jalali:F.jalali},pdf:pdf.b64,fileName:fname,mail:mailFor(F),sign:F.sign||'',next:F._next||''}});
    const nx=F._next,snapF=wasConfirmed?null:F;delete F._next;leaveForm(nx==='book'?`طرح ${name} ثبت شد و به صف نوبت‌دهی پذیرش رفت.`:nx==='today'?`طرح ${name} ثبت شد؛ نوبت امروز با عنوان «جراحی خارج نوبت» در کارتابل پذیرش قرار گرفت.`:`PDF ${name} دانلود شد؛ ذخیره در پس‌زمینه انجام می‌شود.`);if(ROLE==='consultant'&&CF_ON&&snapF)setTimeout(()=>{try{openPostConfirm(snapF)}catch(e){console.error(e)}},300)}
  catch(e){alertMsg('ساخت PDF ناموفق بود: '+(e&&e.message||e))}
  finally{busy=false;t.disabled=false;t.textContent=old}}finally{if(F)delete F._sgd}}
/* doConfirm — base + fix6b A3 (when not busy and a PDF is ready: first the earlier-surgery-difference question; cancel stops here) */
async function doConfirm(){if(busy||!lastPDF)return;if(!(await fx6bSgAsk()))return;if(busy||!lastPDF)return;if(F.brand==='ref'&&needBrand(F)&&!(F.pay&&F.pay.blater)){alertMsg('اول برند بیمار را انتخاب کنید.');return}busy=true;
  try{const wasConfirmed=F.status==='confirmed'||F.status==='modified';
    F.status='confirmed';F.jalali=lastPDF.jalali.slash;F.pdfName=lastPDF.name;if(wasConfirmed)F.edits=(F.edits||0)+1;
    const d=toDoc(F);d.updatedAt=new Date().toISOString();
    const payload={record:{id:F.id,data:d,name:F.h.name.trim(),nid:F.h.nid||'',status:'confirmed',total:planTotal(F),jalali:F.jalali},pdf:lastPDF.b64,fileName:lastPDF.name,mail:mailFor(F)};
    if(F.id)OUTBOX=OUTBOX.filter(o=>o.id!==F.id);
    OUTBOX.push({id:F.id,name:F.h.name.trim(),payload,at:Date.now()});
    if(F.id)SENDING.add(F.id);
    saveOutbox();dirty=false;lastPDF=null;$('cSheet').hidden=true;
    toast(`طرح درمان ${F.h.name.trim()} در صف ارسال قرار گرفت.`);const snap=F;
    F=blankForm();CUR=1;renderForm();
    if(ROLE==='doctor'){show('queue');renderQ()}else show('list');
    processOutbox();if(ROLE==='consultant'&&CF_ON)setTimeout(()=>{try{openPostConfirm(snap)}catch(e){console.error(e)}},300)}
  finally{busy=false}}
/* inside the Android app the page hands files to the app (WebView cannot save blob links itself) */
const IN_APP=!!(window.ImplantApp&&window.ImplantApp.saveFile);
function blobB64(blob){return new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>ok(String(fr.result).split(',')[1]||'');fr.onerror=no;fr.readAsDataURL(blob)})}
function downloadBlob(blob,name){if(IN_APP){blobB64(blob).then(b=>window.ImplantApp.saveFile(b,name,blob.type||'application/pdf')).catch(()=>alertMsg('ذخیره‌ی فایل ممکن نشد.'));return}
  const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000)}
function openForPrint(blob){if(IN_APP){downloadBlob(blob,'plan.pdf');return}const u=URL.createObjectURL(blob);const w=window.open(u,'_blank');if(!w)downloadBlob(blob,'plan.pdf');setTimeout(()=>URL.revokeObjectURL(u),120000)}

