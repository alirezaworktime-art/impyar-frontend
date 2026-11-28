/* ---------- views ---------- */
function show(v){try{if(v!=='surg')sgDraftSave()}catch(e){}try{showExtra(v)}catch(e){}$('viewLogin').hidden=v!=='login';$('nav').hidden=v==='login';$('viewList').hidden=v!=='list';$('viewForm').hidden=v!=='form';$('formBar').hidden=v!=='form';$('planSw').hidden=v!=='form';
  $('viewQueue').hidden=v!=='queue';$('viewRecep').hidden=v!=='recep';$('viewSurg').hidden=v!=='surg';$('viewInv').hidden=v!=='inv';$('invAdd').hidden=v!=='inv'||ROLE!=='inventory';$('tabInv').setAttribute('aria-current',v==='inv');if(v!=='surg'){SURG=null;$('surgSecs').innerHTML=''}
  $('tabQueue').setAttribute('aria-current',v==='queue');$('tabRecep').setAttribute('aria-current',v==='recep');
  $('tabList').setAttribute('aria-current',v==='list');$('tabNew').setAttribute('aria-current',v==='form'&&!F.id);
  if(v==='queue'||v==='recep')renderQ();window.scrollTo(0,0)}
/* openForm layers merged here: ux5 (compact form reset), base, fix6b (stale-save bar). Later layers (q5, consultant/layer, m57a)
   stay wrappers in their files: boot.js can open the form at load time before those scripts run. */
function openForm(r){UXCF.all=false;F=r;CUR=1;dirty=false;PK.undo=null;renderForm();show('form');loadPhoto();try{fx6bBar()}catch(e){}}
/* consultant adds a patient photo (shown on the surgery-day page) */
function loadPhoto(){const card=$('photoCard'),img=$('fPhoto');card.hidden=!(ROLE==='consultant'&&CF_ON&&F.id);img.hidden=true;img.removeAttribute('src');$('photoDel').hidden=true;$('photoMsg').textContent='';
  if(card.hidden)return;const id=F.id;api('get',{id},{prio:'bg'}).then(j=>{if(F.id===id&&j.photo){img.src=j.photo;img.hidden=false;$('photoDel').hidden=false}}).catch(()=>{})}
function shrinkPhoto(file){return new Promise((ok,no)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{const m=640,k=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
  c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);let q=.82,d=c.toDataURL('image/jpeg',q);while(d.length>450000&&q>.4){q-=.1;d=c.toDataURL('image/jpeg',q)}ok(d)};im.onerror=()=>no(new Error('این فایل عکس نیست.'));im.src=u})}
document.addEventListener('change',async e=>{if(e.target.id!=='photoIn')return;const f=e.target.files[0];e.target.value='';if(!f||!F.id)return;const m=$('photoMsg');m.className='msg';m.textContent='در حال ذخیره‌ی عکس…';
  try{const d=await shrinkPhoto(f);await api('setPhoto',{id:F.id,photo:d},{timeout:20000});$('fPhoto').src=d;$('fPhoto').hidden=false;$('photoDel').hidden=false;m.className='msg ok';m.textContent='عکس ذخیره شد.'}catch(err){m.className='msg err';m.textContent=err.message}});
document.addEventListener('click',async e=>{if(e.target.id!=='photoDel')return;const m=$('photoMsg');try{await api('setPhoto',{id:F.id,photo:''});$('fPhoto').hidden=true;$('photoDel').hidden=true;m.className='msg ok';m.textContent='عکس حذف شد.'}catch(err){m.className='msg err';m.textContent=err.message}});
/* logout layers merged here: archive/ui (tiles reset first), base. Later layers (lf1, m42, m42d, m43b) stay wrappers: boot.js calls
   logout at load time before those scripts run, and they use their own private state. */
function logout(){TILE='';delete document.body.dataset.tile;const el=$('tiles');if(el)el.hidden=true;API.pw='';API.t='';ROLE='';USERNAME='';RQ.list.forEach(j=>{j.aborted=true;j.no(new Error('aborted'))});RQ.list=[];if(RQ.cur){RQ.cur.aborted=true;RQ.cur.ctrl&&RQ.cur.ctrl.abort()}QV='';QSEEN=null;QITEMS=[];stopPoll();saveApi();show('login');$('lg_pw').type='password';$('lgShow').checked=false;pwPrefill();$('lgUrlWrap').hidden=!!API_URL_DEFAULT||IN_GAS;$('lg_url').value=API.url||''}
/* applySettings layers merged here: base, ux6 (attendance button by account type, at the end) */
function applySettings(s){if(s)SET={...DEFAULT_SET,...s};SET.prices=SET.prices||{};try{fillRecep()}catch(e){}try{$('lgClinic').textContent=SET.clinic||'';if(ROLE)$('whoami').textContent=(USERNAME?USERNAME+' · ':'')+(ROLE_LBL[ROLE]||'')+(SET.clinic?' · '+SET.clinic:'')}catch(e){}try{localStorage.setItem('implantPlanSettings',JSON.stringify(SET))}catch(e){}
  if(F.status==='new'&&!dirty){F=blankForm();renderForm()}ux6Att()}
async function sha(t){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('implant|'+t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return null}}
const AUTHC=()=>{try{return JSON.parse(localStorage.getItem('implantAuth')||'{}')}catch(e){return {}}};
function enter(j){ROLE=j.role;if(j.user!==undefined)USERNAME=j.user||'';API.role=ROLE;saveApi();if(j.settings)applySettings(j.settings);if(j.queue)applyQueue(j.queue);if(j.sender)$('cFrom').textContent=j.sender;$('lgMsg').textContent='';applyRole();home();startPoll();beep0();processOutbox()}
/* remembered passwords (per role, this device only) + the browser/phone password manager */
const PWS=()=>{try{return JSON.parse(localStorage.getItem('implantPw')||'{}')}catch(e){return {}}};
function pwPrefill(){const sv=PWS();$('lg_user').value=LROLE;$('lg_pw').value=sv[LROLE]||'';let on=true;try{on=localStorage.getItem('implantPwOn')!=='0'}catch(e){}$('lgSave').checked=on}
function pwRemember(role,pw){const sv=PWS(),on=$('lgSave').checked;if(on&&pw)sv[role]=pw;else delete sv[role];
  try{localStorage.setItem('implantPw',JSON.stringify(sv));localStorage.setItem('implantPwOn',on?'1':'0')}catch(e){}
  if(on&&pw&&window.PasswordCredential&&navigator.credentials&&!IN_APP){try{navigator.credentials.store(new PasswordCredential({id:role,password:pw,name:ROLE_LBL[role]||role})).catch(()=>{})}catch(e){}}}
async function login(){const m=$('lgMsg');m.className='msg';m.textContent='در حال ورود…';
  if(!API_URL_DEFAULT&&!IN_GAS)API.url=$('lg_url').value.trim();API.pw=$('lg_pw').value;
  // a password that worked on this device before: go straight in with the cached inbox, verify in the background
  const h=await sha(API.pw);
  if(h&&AUTHC()[LROLE]===h&&(!FS_ON||API.t)){let q=null;try{q=JSON.parse(localStorage.getItem('implantQ:'+LROLE)||'null')}catch(e){}
    pwRemember(LROLE,API.pw);enter({role:LROLE,queue:q});
    api('ping').then(j=>{if(j.role!==ROLE){logout();$('lgMsg').className='msg err';$('lgMsg').textContent=`این رمز مربوط به ورود ${ROLE_LBL[j.role]||'دیگری'} است.`;return}USERNAME=j.user||'';applySettings(j.settings);applyQueue(j.queue);if(j.sender)$('cFrom').textContent=j.sender}).catch(()=>{});return}
  try{const j=await api('ping');
    if(j.role!==LROLE){API.pw='';m.className='msg err';m.textContent=`این رمز مربوط به ورود ${ROLE_LBL[j.role]||'دیگری'} است.`;return}
    if(h){const c=AUTHC();c[j.role]=h;try{localStorage.setItem('implantAuth',JSON.stringify(c))}catch(e){}}
    pwRemember(j.role,API.pw);enter(j)}
  catch(e){m.className='msg err';m.textContent=e.message}}
function beep0(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}

document.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;
  if(t.dataset.lrole){LROLE=t.dataset.lrole;document.querySelectorAll('[data-lrole]').forEach(b=>b.setAttribute('aria-pressed',b===t));$('lgPwLbl').textContent='رمز ورود '+(ROLE_LBL[LROLE]||'');pwPrefill();$('lg_pw').focus();return}
  if(t.id==='tabOut'){if(dirty&&!t.dataset.armed){t.dataset.armed='1';alertMsg('تغییرات این فرم ذخیره نشده. برای خروج دوباره بزنید.');setTimeout(()=>delete t.dataset.armed,4000);return}delete t.dataset.armed;logout();return}
  if(t.id==='tabQueue'){if(dirty&&!t.dataset.armed){t.dataset.armed='1';alertMsg('تغییرات این فرم ذخیره نشده. برای رفتن به کارتابل دوباره بزنید.');setTimeout(()=>delete t.dataset.armed,4000);return}
    delete t.dataset.armed;dirty=false;show('queue');pollQ(true);return}
  if(t.id==='tabRecep'){show('recep');pollQ(true);return}
  if(t.dataset.qopen){qOpen(t);return}
  if(t.id==='rcSend'){rcSend(t);return}
  if(t.id==='rcCancel'){rcReset();$('rcMsg').textContent='';$('rcSheet').hidden=true;return}
  if(t.dataset.qedit){rcEdit(t.dataset.qedit);return}
  if(t.dataset.qdel){if(!t.dataset.armed){t.dataset.armed='1';t.textContent='مطمئنید؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='حذف از صف'}},4000);return}
    t.disabled=true;try{await api('queueDelete',{id:t.dataset.qdel});if(RC_EDIT===t.dataset.qdel)rcReset();pollQ(true)}catch(err){$('rcMsg').className='msg err';$('rcMsg').textContent=err.message;t.disabled=false}return}
  if(t.id==='tabList'){if(dirty&&!t.dataset.armed){t.dataset.armed='1';alertMsg('تغییرات این فرم ذخیره نشده. برای رفتن به بایگانی دوباره بزنید.');setTimeout(()=>delete t.dataset.armed,4000);return}
    delete t.dataset.armed;show('list');loadList();return}
  if(t.id==='tabNew'){openForm(blankForm());return}
  if(t.id==='tabSet'){$('set_recep').value=(SET.recep||[]).join('\n');try{$('set_hol').value=(SET.holidays||[]).map(d=>jDay(d+'T12:00:00Z')).join('\n')}catch(e){}$('setPriceW').hidden=ROLE==='doctor';$('set_invpw').value='';$('set_invpwN').textContent=SET.invPwSet?'رمز انباردار تعیین شده است. برای عوض کردنش رمز تازه را بنویسید؛ خالی بماند عوض نمی‌شود.':'هنوز رمزی برای انباردار تعیین نشده. یک رمز (حداقل ۴ حرف، متفاوت با رمزهای دیگر) بنویسید و ذخیره کنید.';$('set_surgpw').value='';$('set_surgpwN').textContent=SET.surgPwSet?'رمز دستیار جراحی تعیین شده است. برای عوض کردنش رمز تازه را بنویسید؛ خالی بماند عوض نمی‌شود.':'هنوز رمزی برای دستیار جراحی تعیین نشده. یک رمز (حداقل ۴ حرف، متفاوت با رمزهای دیگر) بنویسید و ذخیره کنید.';$('set_cat').value=catToText(SET.catalog||[]);$('set_to').value=SET.recipient||'';$('set_clinic').value=SET.clinic||'';$('set_doctor').value=SET.doctor||'';$('set_phone').value=SET.phone||'';renderPriceSettings();$('sMsg').textContent='';$('sSheet').hidden=false;return}
  if(t.id==='sClose'){$('sSheet').hidden=true;return}
  if(t.id==='sOut'){$('sSheet').hidden=true;logout();return}
  if(t.id==='sSave'){const to=$('set_to').value.trim(),m=$('sMsg');
    if(to&&!validEmail(to)){m.className='msg err';m.textContent='ایمیل گیرنده درست نیست.';return}
    const s={recipient:to,clinic:$('set_clinic').value.trim(),doctor:$('set_doctor').value.trim(),phone:$('set_phone').value.trim(),prices:readPriceSettings(),recep:$('set_recep').value.split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,30),holidays:$('set_hol').value.split(/\n+/).map(x=>parseJ(x.trim())).filter(Boolean).slice(0,60)};
    const cat=catFromText($('set_cat').value);if(cat.err){m.className='msg err';m.textContent=cat.err;return}const s2=Object.assign({},s,{catalog:cat.list});s2.docs=$('set_docs').value.split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,30);s2.surgeon=$('set_surgeon').value.trim();{const o={};document.querySelectorAll('[data-cons2]').forEach(t=>{o[t.dataset.cons2]=t.value.trim()});s2.cons2=o}s2.prosDoc=($('set_prosdoc')||{value:''}).value.trim();s2.assts=$('set_assts').value.split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,20);s2.cap=$('set_cap').value.trim();s2.consent=$('set_consent').value.trim()===DEFAULT_CONSENT.trim()?'':$('set_consent').value.trim();const lpw=$('set_labpw').value;if(lpw)s2.labPw=lpw;const mpw=$('set_mgrpw').value;if(mpw)s2.mgrPw=mpw;
    t.disabled=true;try{const j=await api('settings',{settings:CF_ON?s2:s});applySettings(j.settings||s);$('set_surgpw').value='';$('set_invpw').value='';$('set_labpw').value='';$('set_mgrpw').value='';if(FS_ON||CF_ON)api('gasSettings',{settings:s},{prio:'bg'}).catch(()=>{});m.className='msg ok';m.textContent='ذخیره شد. روی هر دو لپ‌تاپ اعمال می‌شود.'}
    catch(err){m.className='msg err';m.textContent='ذخیره نشد: '+err.message}finally{t.disabled=false}return}
  if(t.id==='saveBtn'){
    t.disabled=true;try{if(F.status==='new')F.status='draft';await saveRecord(F);t.textContent='ذخیره شد';setTimeout(()=>t.textContent='ذخیره پیش‌نویس',1600)}catch(err){alertMsg('ذخیره نشد: '+err.message)}finally{t.disabled=false}return}
  if(t.dataset.pick){const n=Number(t.dataset.pick),b=PK.btn;PK.undo={s:F.s,s2:F.s2,sx:F.sx,alt:F.alt,status:F.status,_dirty:dirty};if(n>=2){if(F.alt.mode!=='full'||!F.sx||!F.sx[n-2]){$('pkMsg').className='msg err';$('pkMsg').textContent='این طرح فقط توضیحی است؛ پزشک باید آن را به‌صورت طرح کامل (جای طرح ۱) بنویسد.';return}F.s=F.sx[n-2]}
    q7Archive(n);CUR=1;touch();renderForm();$('pkSheet').hidden=true;if(b){b.dataset.picked='1';b.click();delete b.dataset.picked}return}
  if(t.id==='pkClose'){$('pkSheet').hidden=true;delete F._next;return}
  if(t.id==='confirmBtn'&&ROLE==='consultant'&&CF_ON&&!F._next&&!(F.status==='confirmed'||F.status==='modified')){$('outSheet').hidden=false;return}
  if(t.id==='outClose'){$('outSheet').hidden=true;return}
  if(t.dataset.out){const o=t.dataset.out;$('outSheet').hidden=true;if(o==='lost'||o==='think'){openUndecided(o==='lost'?'lost':'');return}F._next=o;$('confirmBtn').click();return}
  if(t.id==='confirmBtn'&&ROLE!=='doctor'&&F.alt&&F.alt.mode!=='none'&&!t.dataset.picked&&!t.dataset.signed){PK.btn=t;$('pkMsg').textContent='';pkRender();$('pkSheet').hidden=false;return}
  if(t.id==='confirmBtn'){if(ROLE==='doctor')sendToConsult(t);else if(ROLE==='consultant'&&CF_ON&&!t.dataset.signed)openSign(t);else finalize(t);return}
  if(t.id==='cGo'){doConfirm();return}
  if(t.id==='cDl'){if(lastPDF)downloadBlob(lastPDF.blob,lastPDF.name);return}
  if(t.id==='cPrint'){if(lastPDF)openForPrint(lastPDF.blob);return}
  if(t.id==='cClose'){$('cSheet').hidden=true;if(BACK_TO_Q&&ROLE==='doctor'){BACK_TO_Q=false;show('queue');pollQ(true)}return}
  if(t.dataset.open){t.disabled=true;try{openForm(await fetchRecord(t.dataset.open))}catch(err){alertMsg('باز نشد: '+err.message)}finally{t.disabled=false}return}
  if(t.dataset.pdf){t.disabled=true;const old=t.textContent;t.textContent='در حال ساخت…';
    try{const r=await fetchRecord(t.dataset.pdf);const p=await buildPDF(r,{jalali:r.jalali});downloadBlob(p.blob,r.pdfName||(safeName(r.h.name)+'.pdf'))}
    catch(err){alertMsg('PDF ساخته نشد: '+err.message)}finally{t.disabled=false;t.textContent=old}return}
  if(t.dataset.resend){if(!t.dataset.armed){t.dataset.armed='1';t.textContent='ارسال به '+(SET.recipient||'؟')+'؟ دوباره بزنید';setTimeout(()=>{if(t.dataset.armed){delete t.dataset.armed;t.textContent='ارسال دوباره'}},4000);return}
    delete t.dataset.armed;if(!validEmail(SET.recipient)){alertMsg('ایمیل گیرنده تعیین نشده.');return}
    t.disabled=true;t.textContent='در حال ارسال…';
    try{const r=await fetchRecord(t.dataset.resend);const j=await api('resend',{id:r.id,mail:mailFor(r)});t.textContent=j.emailStatus==='sent'?'ارسال شد':'ارسال نشد';if(CF_ON)await api('setFile',{id:r.id,emailStatus:j.emailStatus||'',emailError:j.emailError||''},{prio:'bg'}).catch(()=>{})}
    catch(err){t.textContent='ارسال نشد';alertMsg(err.message)}finally{t.disabled=false;loadList()}return}
  if(SURG&&IMPSECS.includes(t.dataset.sid)&&isTooth(t.dataset.k||'')){if(!t.disabled)openImp(t.dataset.k,t.dataset.sid);return}
  if(t.classList.contains('t')&&Date.now()-DRAGCLICK<700)return;
  if(t.dataset.sid&&t.dataset.k){if(t.disabled)return;const s=AS()[t.dataset.sid],k=t.dataset.k,on=!s.sel[k];
    if(t.dataset.single){Object.keys(s.sel).forEach(o=>{if(!isTooth(o)&&o.split(':')[0]===t.dataset.g)s.sel[o]=false});document.querySelectorAll(`.chip[data-sid="${t.dataset.sid}"][data-g="${t.dataset.g}"]`).forEach(c=>c.setAttribute('aria-pressed','false'))}
    s.sel[k]=on;t.setAttribute('aria-pressed',on);
    if(SURG&&SEC[t.dataset.sid].sgt&&!isTooth(k)){const j=t.dataset.g==='0'?'U':'L';if(!jawChip(s,j))Object.keys(s.sel).forEach(o=>{if(isTooth(o)&&o[0]===j){delete s.sel[o];delete SURG.imp[o]}});reSec(t.dataset.sid);renderImps()}
    touch();recalc();exRefresh(t.dataset.sid);return}
  if(t.dataset.aot!==undefined){const sx=AS().aox;if(t.dataset.aot)sx.isel['t:long']=true;else delete sx.isel['t:long'];reSec('aox');touch();recalc();return}
  if(t.dataset.cmode!==undefined){const sx=AS().cbct;if(t.dataset.cmode){sx.isel['m:ct']=true;['q1','q2','q3','q4'].forEach(q=>sx.sel[q]=true)}else if(sx.isel['m:ct']){delete sx.isel['m:ct'];['q1','q2','q3','q4'].forEach(q=>sx.sel[q]=false)}reSec('cbct');touch();recalc();return}
  if(t.hasAttribute('data-spadd')){const sx=AS().imp;sx.sp=sx.sp||[];sx.sp.push({k:'',b:'',d:'',l:''});reSec('imp');touch();const r=document.querySelectorAll('[data-sec="imp"] .sp-row');if(r.length)r[r.length-1].querySelector('select').focus();return}
  if(t.dataset.spdel){AS().imp.sp.splice(Number(t.dataset.spdel),1);reSec('imp');touch();return}
  if(t.dataset.isid){if(t.disabled)return;const x=SEC[t.dataset.isid],s=AS()[t.dataset.isid],k=t.dataset.ik,on=!s.isel[k];s.isel[k]=on;t.setAttribute('aria-pressed',on);
    if(x.id==='cbct'&&on&&(k==='z:1'||k==='zs:1')){const o=k==='z:1'?'zs:1':'z:1';delete s.isel[o];const ob=document.querySelector(`[data-isid="cbct"][data-ik="${o}"]`);if(ob)ob.setAttribute('aria-pressed','false')}
    const ti=(x.items||[]).find(it=>it.tn&&k.startsWith(it.k+':'));if(ti){if(!on){const q=k.split(':')[1];Object.keys(s.isel).forEach(z=>{if(z.startsWith(ti.k+'n:'+q))delete s.isel[z]})}reSec(x.id);touch();return}
    const tq=(x.items||[]).find(it=>it.tn&&k.startsWith(it.k+'n:'));if(tq){const q=k.split(':')[1].slice(0,2);if(on&&!s.isel[tq.k+':'+q])s.isel[tq.k+':'+q]=true;touch();recalc();return}
    const qi=(x.items||[]).find(it=>it.qn&&k.startsWith(it.k+':'));if(qi){if(on&&!num(s.icnt[k]))s.icnt[k]='1';if(!on)delete s.icnt[k];reSec(x.id);touch();return}
    if((x.items||[]).some(it=>regP(x,it)&&k.startsWith(it.k+':'))){reSec(x.id);touch();return}
    if(x.excl&&x.excl[k]){const o=x.excl[k];if(on)s.isel[o]=false;const ob=document.querySelector(`[data-isid="${x.id}"][data-ik="${o}"]`);if(ob){ob.disabled=on;if(on)ob.setAttribute('aria-pressed','false')}}touch();recalc();return}
  if(t.dataset.plan){CUR=Number(t.dataset.plan);renderForm();window.scrollTo(0,0);return}
  if(t.id==='altAdd'){if(F.alt.mode==='full'){F.sx=F.sx||[];F.sx.push(planCopy(F.s));F.s2=F.sx[0];CUR=F.sx.length+1;touch();renderForm();window.scrollTo(0,0);return}$('aSheet').hidden=false;return}
  if(t.dataset.alt){$('aSheet').hidden=true;F.alt.mode=t.dataset.alt;if(F.alt.mode==='full'){F.sx=[planCopy(F.s)];F.s2=F.sx[0]}CUR=2;touch();renderForm();window.scrollTo(0,0);return}
  if(t.id==='aClose'){$('aSheet').hidden=true;return}
  if(t.id==='altDel'){if(!t.dataset.armed){t.dataset.armed='1';t.textContent='مطمئنید؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='حذف این طرح'}},4000);return}
    if(F.alt.mode==='full'&&F.sx&&F.sx.length>1){F.sx.splice(CUR-2,1);F.s2=F.sx[0];CUR=1;touch();renderForm();return}
    F.alt={mode:'none',text:''};F.s2=null;F.sx=[];CUR=1;touch();renderForm();return}
  if(t.dataset.brand){F.brand=t.dataset.brand;touch();recalc();return}
  if(t.dataset.opt){F.pay.opt=t.dataset.opt;touch();recalc();return}
});
['cSheet','sSheet','aSheet'].forEach(id=>$(id).addEventListener('click',e=>{if(e.target.id===id&&!busy)e.target.hidden=true}));
$('q').addEventListener('input',renderList);$('qS').addEventListener('input',()=>{if(ROLE==='surgery')renderSurgQ()});
$('lgForm').addEventListener('submit',e=>{e.preventDefault();login()});
$('lgSave').addEventListener('change',e=>{try{localStorage.setItem('implantPwOn',e.target.checked?'1':'0')}catch(x){}if(!e.target.checked){const sv=PWS();delete sv[LROLE];try{localStorage.setItem('implantPw',JSON.stringify(sv))}catch(x){}}});
pwPrefill();
renderMed('rc');
$('lgShow').addEventListener('change',e=>{$('lg_pw').type=e.target.checked?'text':'password'});
/* medical-history yes/no, details, other */
document.addEventListener('click',e=>{const b=e.target.closest('[data-mhb]');if(!b)return;const bx=b.closest('[data-medbox]');if(!bx)return;const box=bx.dataset.medbox,m=medOf(box);if(m.y.hba){delete m.y.hba;delete m.t.hba}else m.y.hba=1;if(box==='f')dirty=true;renderMed(box)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-ms]');if(!b)return;const bx=b.closest('[data-medbox]');if(!bx)return;const box=bx.dataset.medbox,m=medOf(box),k=b.dataset.ms,v=b.dataset.msv;
  m.t[k]=m.t[k]===v?'':v;if(box==='f')dirty=true;bx.querySelectorAll(`[data-ms="${k}"]`).forEach(c=>c.setAttribute('aria-pressed',m.t[k]===c.dataset.msv))});
document.addEventListener('click',e=>{const b=e.target.closest('[data-mk]');if(!b)return;const box=b.closest('[data-medbox]').dataset.medbox,m=medOf(box),k=b.dataset.mk;
  const on=b.dataset.mv==='1';if(!!m.y[k]===on)return;if(on)m.y[k]=1;else{delete m.y[k];delete m.t[k];if(k==='diab'){delete m.y.hba;delete m.t.hba}}if(box==='f')dirty=true;renderMed(box);if(on&&box&&MED_Q.some(q=>q[0]===k)){const i=document.querySelector(`#${box==='rc'?'rcMed':'fMed'} [data-mt="${k}"]`);if(i)i.focus()}});
document.addEventListener('input',e=>{const t=e.target,bx=t.closest&&t.closest('[data-medbox]');if(!bx)return;const m=medOf(bx.dataset.medbox);
  if(t.dataset.mt)m.t[t.dataset.mt]=t.value;else if(t.hasAttribute('data-mo'))m.other=t.value;else return;if(bx.dataset.medbox==='f')dirty=true;e.stopPropagation()},true);
document.addEventListener('input',e=>{const i=e.target;if(i.dataset.tp){i.value=fmtInput(i.value);return}if(i.closest('#sSheet')||i.closest('#viewLogin')||i.closest('#viewRecep')||i.closest('#viewInv')||i.closest('#invSheet')||i.closest('#invMvSheet')||i.id==='q')return;
  if(i.dataset.h){F.h[i.dataset.h]=i.value;touch();recalc();return}
  if(i.id==='altText'){F.alt.text=i.value;touch();return}
  if(i.dataset.tx){AS()[i.dataset.tx].text=i.value;touch();recalc();return}
  if(i.dataset.ip&&isMil(i)){AS()[i.dataset.ip].ip[i.dataset.ik]=milVal(i.value);touch();recalc();return}
  if(i.dataset.ip){i.value=fmtInput(i.value);AS()[i.dataset.ip].ip[i.dataset.ik]=i.value;touch();recalc();return}
  if(i.dataset.pr||i.dataset.bp){i.value=fmtInput(i.value);if(i.dataset.pr)AS()[i.dataset.pr].price=i.value;else AS()[i.dataset.bp].bp[i.dataset.b]=i.value;touch();recalc();return}
  if(i.id==='p_cash'){i.value=fmtInput(i.value);F.pay.cash=i.value;touch();recalc();return}
  if(i.id==='p_cs'||i.id==='p_cp'){F.pay.cash='';const c=$('p_cash');if(c)c.value=''}
  if(i.id&&i.id.startsWith('p_')){F.pay[i.id.slice(2)]=i.value;touch();recalc()}});
/* the doctor types prices in millions: «7» or «7.5» means 7,000,000 / 7,500,000 */
const isMil=i=>ROLE==='doctor'&&(i.classList.contains('mil')||!!i.closest('[data-sec="surg"]'));
function milVal(v){const t=toEn(v).replace(/[,٬\s]/g,'').replace(/[\/٫]/g,'.');const f=parseFloat(t);if(!isFinite(f)||f<=0)return '';return fmtInput(String(Math.round(f<1000?f*MIL:f)))}
document.addEventListener('focusin',e=>{const i=e.target;if(i.tagName==='INPUT'&&i.dataset&&i.dataset.ip&&isMil(i)&&num(i.value)){const n=num(i.value);if(n%1e5===0&&n>=MIL)i.value=String(n/MIL)}});
document.addEventListener('focusout',e=>{const i=e.target;if(i.tagName==='INPUT'&&i.dataset&&i.dataset.ip&&isMil(i))i.value=milVal(i.value)});
document.addEventListener('input',e=>{const i=e.target;if(i.hasAttribute&&i.hasAttribute('data-aoxn')){AS().aox.ip.ln=i.value;touch();e.stopPropagation()}},true);
/* drag across tooth numbers to select (or clear) a run of teeth */
let DRAG=null,DRAGCLICK=0;
function dragSet(k,v){AS()[DRAG.sid].sel[k]=v;document.querySelectorAll(`.chart .t[data-sid="${DRAG.sid}"][data-k="${k}"]`).forEach(x=>x.setAttribute('aria-pressed',v))} function dragApply(b){const k=b.dataset.k;if(!DRAG||b.disabled||b.dataset.sid!==DRAG.sid)return;const P=DRAG.path,i=P.indexOf(k);if(i>=0&&i===P.length-1)return;if(i>=0){while(P.length-1>i){const x=P.pop();dragSet(x,DRAG.orig[x])}}else{P.push(k);DRAG.orig[k]=!!AS()[DRAG.sid].sel[k];dragSet(k,DRAG.on)}touch();recalc()}
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.chart .t[data-sid]');if(!b||b.disabled||e.button>0)return;if(SURG&&IMPSECS.includes(b.dataset.sid))return;
  DRAG={sid:b.dataset.sid,on:b.getAttribute('aria-pressed')!=='true',path:[],orig:{}};dragApply(b);DRAGCLICK=Date.now()});
document.addEventListener('pointermove',e=>{if(!DRAG)return;if(e.pointerType==='mouse'&&!(e.buttons&1)){const s0=DRAG.sid;DRAG=null;DRAGCLICK=Date.now();exRefresh(s0);return}const el=document.elementFromPoint(e.clientX,e.clientY),b=el&&el.closest&&el.closest('.chart .t[data-sid]');if(b)dragApply(b)});
['pointerup','pointercancel'].forEach(ev=>document.addEventListener(ev,e=>{if(DRAG){if(e.type==='pointercancel'&&DRAG.path.length===1)dragSet(DRAG.path[0],DRAG.orig[DRAG.path[0]]);DRAGCLICK=Date.now();const sid=DRAG.sid;DRAG=null;exRefresh(sid);if(e.type==='pointercancel'){touch();recalc()}}}));
function reSec(id){const el=document.querySelector(`[data-sec="${id}"]`);if(el)el.outerHTML=sectionHTML(SEC[id]);recalc()}
document.addEventListener('change',e=>{const i=e.target;if(i.hasAttribute&&i.hasAttribute('data-cspec')){const sx=AS().cbct;if(i.checked)sx.isel['zx:1']=true;else{delete sx.isel['zx:1'];delete sx.isel['z:1'];delete sx.isel['zs:1']}reSec('cbct');touch();return}
  if(i.dataset&&i.dataset.sp!==undefined&&i.tagName==='SELECT'){const r=AS().imp.sp[Number(i.dataset.sp)];if(r){r[i.dataset.spf]=i.value;touch()}return}});
document.addEventListener('input',e=>{const i=e.target;if(i.dataset&&i.dataset.sp!==undefined&&i.tagName==='INPUT'){const r=AS().imp.sp[Number(i.dataset.sp)];if(r){r[i.dataset.spf]=i.dataset.spf==='b'?i.value:toEn(i.value);touch()}e.stopPropagation()}},true);
document.addEventListener('change',e=>{const i=e.target;if(i.tagName!=='SELECT')return;if(i.dataset.sp!==undefined)return;{const pk=i.closest('.pick');if(pk){pk.querySelector('.pv').textContent=num(i.value)?fa(num(i.value)):'—';pk.classList.toggle('on',!!num(i.value))}}
  if(i.dataset.cnt){AS()[i.dataset.cnt].cnt=i.value}else if(i.dataset.jc){const sid=i.dataset.jc,j=i.dataset.j,sc=AS()[sid];sc.jc[j]=i.value;
    if(SEC[sid].cnt){const lk=!!num(i.value);if(lk)Object.keys(sc.sel).forEach(k=>{if(isTooth(k)&&k[0]===j)delete sc.sel[k]});
      document.querySelectorAll(`.t[data-sid="${sid}"][data-k^="${j}"]`).forEach(b=>{b.disabled=lk;if(lk){b.setAttribute('aria-pressed','false');b.title='تعداد کل این فک انتخاب شده'}else b.removeAttribute('title')})}}else if(i.dataset.icnt){AS()[i.dataset.icnt].icnt[i.dataset.ik]=i.value}else return;
  touch();recalc();if(i.dataset.jc)exRefresh(i.dataset.jc)});
/* big number picker for «تعداد کل» */
let NP=null;
function openPick(pk){const sel=pk.querySelector('select');if(!sel||sel.disabled)return;NP=sel;
  const vals=[...sel.options].map(o=>o.value).filter(Boolean),cur=sel.value;const sec=pk.closest('[data-kind]');
  $('npTitle').textContent=pk.dataset.pick||'تعداد';$('npSub').textContent=sel.dataset.jc?'با انتخاب تعداد کل، دندان‌های همین فک قفل می‌شوند.':'';
  $('npGrid').className='npick'+(sec&&sec.dataset.kind==='pros'?' pros':'');
  $('npGrid').innerHTML=vals.map(v=>`<button type="button" data-npv="${v}" aria-pressed="${v===cur}">${fa(v)}</button>`).join('');
  $('npClear').hidden=!cur;$('npSheet').hidden=false;const b=$('npGrid').querySelector('[aria-pressed="true"]')||$('npGrid').firstChild;b&&b.focus({preventScroll:true})}
function setPick(v){if(!NP)return;NP.value=v;NP.dispatchEvent(new Event('change',{bubbles:true}));NP=null;$('npSheet').hidden=true}
document.addEventListener('click',e=>{const pk=e.target.closest('[data-pick]');if(pk){e.preventDefault();openPick(pk);return}
  const nb=e.target.closest('[data-npv]');if(nb){setPick(nb.dataset.npv);return}
  if(e.target.id==='npClear'){setPick('');return}if(e.target.id==='npClose'||e.target.id==='npSheet'){NP=null;$('npSheet').hidden=true}});
document.addEventListener('keydown',e=>{const pk=e.target.closest&&e.target.closest('[data-pick]');if(pk&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openPick(pk)}
  if(e.key==='Escape'){document.querySelectorAll('.sheet:not([hidden])').forEach(x=>{if(x.id==='npSheet'||x.id==='impSheet'||x.id==='invSheet'||x.id==='invMvSheet'||x.id==='i2Sheet'){x.hidden=true;if(x.id==='invMvSheet'&&INV2.pick){INV2.pick=false;$('inSave').textContent='ثبت ورود'}}})}});
window.addEventListener('beforeunload',e=>{if(dirty||OUTBOX.length){e.preventDefault();e.returnValue=''}});

