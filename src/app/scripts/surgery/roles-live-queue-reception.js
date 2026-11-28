/* ---------- roles, live queue, reception ---------- */
let ROLE='',LROLE='staff',QV='',QITEMS=[],QSEEN=null,QTIMER=null,QBUSY=false,RC_EDIT=null,RC_REOPEN=null,BACK_TO_Q=false;
const QPOLL=CF_ON?3000:5000;
const ROLE_LBL={staff:'منشی',doctor:'پزشک طرح درمان',consultant:'مشاور',surgery:'پزشک',inventory:'انباردار',lab:'لابراتوار',manager:'مدیر',accountant:'حسابدار'};
/* applyRole: base + archive/ui.js (tiles) + ux6 (ui/ux6-duplicate-unused-options-removed.js: «no user name» class). Still wrapped later by lf1, m42 and m54a. */
function applyRole(){document.body.dataset.role=ROLE||'';try{$('attBtn').hidden=!ROLE||!CF_ON}catch(e){}document.querySelectorAll('#nav [data-role]').forEach(b=>b.hidden=!b.dataset.role.split(' ').includes(ROLE)||(['tabInv','tabCal','tabPros','tabLab','tabDash','tabPday','tabWb','tabAcc','tabRx','tabFin'].includes(b.id)&&!CF_ON));$('undBtn').hidden=true;$('whoami').textContent=ROLE?(USERNAME?USERNAME+' · ':'')+(ROLE_LBL[ROLE]||'')+(SET.clinic?' · '+SET.clinic:''):'';$('qTitle').textContent=ROLE==='consultant'?'کارتابل مشاور':ROLE==='surgery'?'بیماران ارجاع‌شده برای جراحی':'بیماران در صف انتظار';
  try{renderTiles()}catch(e){}ux6Att()}
/* home: base + archive/ui.js (open the role's tile) + surgery/queue.js («صف من» tile first) + finance/oc1-surgeon-s-work-other.js (role «oclin»);
   the two tile parts run after every branch of the base. lab/lf1-lab-feedback-ir-project.js still wraps it (its roles live in a later script). */
function home(){if(ROLE==='oclin'){show('oc');const k=(TSAVE&&TSAVE.oclin)||'add';goTile(k);return}
  if(MQ_HOME[ROLE]){TILE=TSAVE[ROLE]&&TSAVE[ROLE]!=='q'&&tileList().some(t=>t.k===TSAVE[ROLE])?TSAVE[ROLE]:'q'}
  if(ROLE==='lab'){show('lab')}else if(ROLE==='accountant'){show('fin')}else if(ROLE==='manager'){show('dash')}else if(ROLE==='inventory'){show('inv');renderInv();pollInv(true)}else{if(ROLE==='staff'){show('recep');rcReset()}else show('queue');renderQ();pollQ(false);if(CF_ON&&(ROLE==='doctor'||ROLE==='consultant'))pollInv(true)}
  try{if(!TILE||!tileList().some(t=>t.k===TILE))TILE=TSAVE[ROLE]||'';goTile(TILE||(tileList()[0]||{}).k,{keep:1})}catch(e){console.error(e)}
  try{if(ROLE==='manager'){mqInit();goTile('q',{keep:1})}}catch(e){console.error(e)}}
let AC=null;function beep(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;[0,0.18].forEach((d,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=i?1046:784;g.gain.setValueAtTime(0.0001,t+d);g.gain.exponentialRampToValueAtTime(0.25,t+d+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.16);o.connect(g).connect(AC.destination);o.start(t+d);o.stop(t+d+0.17)})}catch(e){}}
function startPoll(){stopPoll();if(FS_ON){fsListen();return}QTIMER=setInterval(()=>pollQ(false),QPOLL)}
function stopPoll(){if(QTIMER)clearInterval(QTIMER);QTIMER=null;if(FS_ON)fsStopListen()}
let LAST_ACT=Date.now(),LAST_POLL=0;['pointerdown','keydown','touchstart','wheel'].forEach(e=>addEventListener(e,()=>{const idle=Date.now()-LAST_ACT>QIDLE;LAST_ACT=Date.now();if(idle)pollQ(false)},{passive:true}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ROLE)pollQ(false)});
const QIDLE=15*60*1000;
/* pollQ: base + oc1 (finance/oc1-surgeon-s-work-other.js: role «oclin» never polls). Still wrapped later by lf1. */
async function pollQ(force){if(ROLE==='oclin')return;if(ROLE==='inventory'||ROLE==='lab'||ROLE==='accountant')return;if(!ROLE||QBUSY)return;if(!force){if(document.hidden)return;if(Date.now()-LAST_ACT>QIDLE&&Date.now()-LAST_POLL<30000)return}LAST_POLL=Date.now();if(FS_ON&&FS_UNSUB.length){fsRebuild(ROLE);return}QBUSY=true;
  try{const j=await api('queue',{ver:force?'':QV,qh:force?'':QH},{prio:'poll'});if(j&&j.qh)QH=j.qh;setLive(true);applyQueue(j);if(j&&j.sv&&SV&&j.sv!==SV){SV=j.sv;api('ping',{},{prio:'bg'}).then(p=>{if(p.settings)applySettings(p.settings)}).catch(()=>{})}if(j&&j.sv)SV=j.sv}
  catch(e){if(e.message!=='aborted')setLive(false)}finally{QBUSY=false}}
const NEWQ={doctor:'waiting',consultant:'consult',surgery:'surgery'};
let SV='';
let TASKS=[],TASK_ALL={fu:false,fp:false,uc:false,nb:false,lr:false,bo:false};
const TLBL={book:['نوبت جراحی','بیمار طرح را پذیرفته؛ برای جراحی نوبت بدهید.'],fol1:['پیگیری یک هفته بعد','تماس بگیرید و بپرسید برای جراحی تصمیم گرفته یا نه.'],fol4:['پیگیری چهار هفته بعد','تماس بگیرید و بپرسید برای جراحی تصمیم گرفته یا نه.'],numb:['چک بی‌حسی (یک روز بعد از جراحی)','تماس بگیرید و بپرسید هنوز بی‌حس است یا نه.'],week:['چک عادی (یک هفته بعد)','تماس بگیرید و حال عمومی بیمار را بپرسید.'],suture:['نوبت کشیدن بخیه (دو هفته بعد)','برای کشیدن بخیه نوبت بدهید.'],uncover:['نوبت آنکاوری','برای آنکاوری ایمپلنت‌ها نوبت بدهید.'],pweek:['تماس یک هفته بعد از تحویل پروتز','تماس بگیرید و بپرسید پروتز راحت است و درد، لقی یا گیر کردن غذا ندارد.'],labready:['کار لابراتوار آماده است','برای امتحان یا تحویل پروتز نوبت بدهید.'],recall:['چکاپ دوره‌ای ایمپلنت','برای معاینه و جرم‌گیری دوره‌ای نوبت بدهید.'],fol1:['پیگیری طرح (یک هفته بعد)','تماس بگیرید و درباره‌ی تصمیم بیمار بپرسید.'],fol4:['پیگیری طرح (چهار هفته بعد)','تماس بگیرید و درباره‌ی تصمیم بیمار بپرسید.']};
let TDV='',TDT=0;const tDay=(d)=>{try{if(!d){const n=Date.now();if(n-TDT<1000)return TDV;TDT=n;return TDV=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(n))}return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}catch(e){return new Date().toISOString().slice(0,10)}};
const dDiff=(a,b)=>Math.round((Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/864e5);
function dueLbl(due){const n=dDiff(due,tDay());const j=jalali(new Date(due+'T12:00:00Z')).slash;return n===0?'امروز':n===1?'فردا':n<0?`${fa(-n)} روز گذشته (${j})`:`${j} (${fa(n)} روز دیگر)`}
function renderTasks(){if(ROLE!=='staff')return;try{renderSetl()}catch(e){}const today=tDay();const one=(t,uc)=>{const L=t.kind==='uncover'&&!t.done&&t.note==='تعیین انکاوری'?['تعیین انکاوری','ایمپلنت با کاور بسته شده ولی نوبت آنکاوری زده نشده؛ با جراح هماهنگ کنید و نوبت آنکاوری بدهید.']:t.kind==='book'&&t.info==='reimp'?['کاشت دوباره‌ی ایمپلنت'+(/^کاشت دوباره — /.test(t.note||'')&&!t.done?' — '+String(t.note).slice(14):''),'ایمپلنت شکست‌خورده؛ برای کاشت دوباره نوبت جراحی بدهید.']:t.kind==='book'&&t.info==='tnd'?['جراحی امروز انجام نشد','بیمار «جراحی امروز» داشت ولی جراحی نشد؛ تماس بگیرید و نوبت جراحی بدهید.']:t.kind==='book'&&t.info==='cont'?['ادامه‌ی جراحی','جراحی این بیمار ناتمام مانده؛ برای جلسه‌ی بعد نوبت بدهید.']:t.kind==='book'&&dDiff(today,t.due)>30?['بیش از ۳۰ روز نوبت جراحی نگرفته','تماس بگیرید؛ یا نوبت بدهید یا انصرافش را ثبت کنید.']:((t.kind==='payok'?[TLBL.payok[0]+' · '+(FX3SL[t.info]||''),TLBL.payok[1]]:t.kind==='collect'&&t.info?[TLBL.collect[0],'دلیل ادامه‌ی درمان: '+t.info+' — مانده را وصول کنید.']:TLBL[t.kind]||[t.kind,''])),n=dDiff(t.due,today),late=!t.done&&n<0;
    return `<div class="item task kg-${TGRP[t.kind]||'fl'}${t.done?' done':''}${late?' late':''}${t.kind==='book'&&t.info==='cont'?' cont':''}"><div class="row1"><div><div class="nm">${esc(t.name||'')}</div><div class="meta">${esc(L[0])}${uc&&t.info&&t.kind==='uncover'?' — '+esc(t.info.split(',').map(k=>toothTxt([k])).join('، ')):''}</div><div class="meta">${t.done?'انجام شد':esc(L[1])}</div></div>
      <span class="pill ${t.done?'done':late?'settle':n===0?'wait':''}">${dueLbl(t.due)}</span></div>
      <div class="acts">${t.phone?`<a class="btn sm ghost" href="tel:${esc(toEn(t.phone))}">تماس ${esc(faD(t.phone))}</a>`:''}${!t.done&&(t.kind==='fol1'||t.kind==='fol4'||t.kind==='fol3')?`<button class="btn sm" data-undto="back" data-uid="${esc(t.plan)}" type="button">پذیرفت؛ نوبت جراحی</button><button class="btn sm ghost" data-undto="lost" data-uid="${esc(t.plan)}" type="button">انصراف قطعی</button>`:''}${!t.done&&t.kind==='book'&&t.owe>0&&ROLE==='staff'?`<b class="late pl9owe">پرداخت پارت جراحی کامل نیست: ${fa(t.owe)} تومان مانده</b><button class="btn sm main" type="button" data-p4rest="${esc(t.plan||'')}">تعیین تکلیف مالی</button>`:''}${!t.done&&t.kind==='book'&&t.info!=='cont'&&t.info!=='reimp'?`<button class="btn sm ghost" data-booklost="${esc(t.plan)}" data-tid="${esc(t.id)}" type="button">انصراف داد؛ بایگانی</button>`:''}${!t.done&&t.kind==='pcall'?pr2CallBtns(t):''}${!t.done&&ROLE==='staff'&&['numb','week','pweek','afup'].includes(t.kind)?`<button class="btn sm ghost" data-bk1v="${esc(t.id)}" type="button">نوبت ویزیت</button>`:''}${!t.done&&['uncover','recall','labready','suture','book','reno','impr','pfail','repair','aexam'].includes(t.kind)&&CF_ON?`<button class="btn sm" data-tbook="${esc(t.id)}" type="button">تعیین نوبت</button>`:''}${!t.done&&t.kind==='payok'&&ROLE==='staff'?`<button class="btn sm main" type="button" data-fx4allow="${esc(t.plan||'')}" data-fx4step="${esc(t.info||'')}">تأیید ادامه با ثبت دلیل</button>`:''}${!t.done&&ROLE==='staff'?`<button data-ux6plan="1" class="btn sm ghost" data-todoc="${esc(t.plan||'')}" data-tdn="${esc(t.name||'')}" data-tdp="${esc(t.phone||'')}" type="button">طرح درمان دوباره</button>`:''}${t.done?(t.note==='انصراف؛ نوبت نگرفت'?`<button class="btn sm ghost" data-bkundo="${esc(t.plan)}" type="button">برگرداندن انصراف</button>`:t.note==='انصراف قطعی'?'':`<button class="btn sm ghost" data-tundo="${esc(t.id)}" type="button">برگرداندن</button>`):t.kind==='pcall'?'':`<button class="btn sm" data-tdone="${esc(t.id)}" type="button">انجام شد</button>`}${moreMenu((t.phone&&waLink(t.phone)?`<a class="btn sm ghost" target="_blank" rel="noopener" href="${waLink(t.phone,msgFor(t.kind,t.name))}">واتس‌اپ</a><a class="btn sm ghost" href="${smsLink(t.phone,msgFor(t.kind,t.name))}">پیامک</a>`:'')+`<button class="btn sm ghost" data-file="${esc(t.plan)}" data-fname="${esc(t.name||'')}" type="button">پرونده</button>`)}</div></div>`};
  const list=(el,arr,horizon,key,uc)=>{const dn=arr.filter(t=>t.done),op=arr.filter(t=>!t.done),sh=op.filter(t=>TASK_ALL[key]||dDiff(t.due,today)<=horizon),show=sh.concat(TASK_DONE[key]?dn:[]),more=op.length-sh.length;
    const cap8=TCAP[key]||30,sh8=show.slice(0,cap8);$(el).innerHTML=(sh8.length?sh8.map(t=>one(t,uc)).join(''):'<div class="empty">فعلاً موردی نیست.</div>')+capBtn('t:'+key,show.length,cap8)+(more?`<button class="btn sm ghost" data-tall="${key}" type="button">نمایش ${fa(more)} مورد بعدی</button>`:'')+(dn.length&&!TASK_DONE[key]?`<button class="btn sm ghost" data-tdall="${key}" type="button">${fa(dn.length)} مورد انجام‌شده‌ی امروز</button>`:'')};
  const FOLK=['fol1','fol4','book'];const NBK=['suture','labready'];list('bkList',TASKS.filter(t=>t.kind==='book'&&(t.info==='cont'||dDiff(today,t.due)<=30)),3650,'bk',false);list('bkOld',TASKS.filter(t=>t.kind==='book'&&t.info!=='cont'&&dDiff(today,t.due)>30),3650,'bo',false);list('nbList',TASKS.filter(t=>t.kind==='suture'||renoGrp(t)==='chk'),1,'nb',false);list('lrList',TASKS.filter(t=>t.kind==='labready'||t.kind==='impr'||['pcall','pfail','repair'].includes(t.kind)||renoGrp(t)==='pros'),1,'lr',false);list('flList',TASKS.filter(t=>t.kind==='fol1'||t.kind==='fol4'||t.kind==='fol3'),0,'fl',false);list('fuList',TASKS.filter(t=>t.kind==='numb'||t.kind==='week'||t.kind==='afup'),0,'fu',false);list('fpList',TASKS.filter(t=>t.kind==='pweek'),0,'fp',false);list('fxColList',TASKS.filter(t=>t.kind==='collect'||t.kind==='paylost'||t.kind==='payok'),0,'fc',false);list('ucList',TASKS.filter(t=>t.kind==='uncover'||t.kind==='recall'||t.kind==='aexam'||renoGrp(t)==='unc'),0,'uc',true);try{renderRecepBar();tidySecs()}catch(e){}}
document.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;
  if(t.dataset.tall){TASK_ALL[t.dataset.tall]=true;renderTasks();return}
  if(t.dataset.tdall){TASK_DONE[t.dataset.tdall]=true;renderTasks();return}
  if(t.dataset.booklost){if(!t.dataset.armed){t.dataset.armed='1';t.textContent='انصراف ثبت شود؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='انصراف داد؛ بایگانی'}},4000);return}t.disabled=true;try{await api('bookLost',{id:t.dataset.booklost,by:$('rc_asst').value||''});toast('انصراف ثبت شد.');pollQ(true)}catch(err){toast(err.message);t.disabled=false}return}
  if(t.dataset.tdone||t.dataset.tundo){t.disabled=true;try{await api('taskDone',{id:t.dataset.tdone||t.dataset.tundo,undo:!!t.dataset.tundo,by:$('rc_asst').value||''});const x=TASKS.find(v=>v.id===(t.dataset.tdone||t.dataset.tundo));if(x)x.done=t.dataset.tdone?1:0;renderTasks();pollQ(true)}catch(err){toast(err.message)}finally{t.disabled=false}}});
function applyQueue(j){if(!j||j.same||!j.items)return;if(Array.isArray(j.settle))QSET=j.settle;if(Array.isArray(j.intake)){QINT=j.intake;try{renderIntake()}catch(e){}}if(j.tasks){TASKS=j.tasks;try{renderTasks()}catch(e){}}if(ROLE==='staff'&&!listLoaded&&CF_ON&&Date.now()-(window._llAt||0)>60000){window._llAt=Date.now();loadList().catch(()=>{})}if(j.chq)QCHQ=j.chq;if(j.rfd)QRFD=j.rfd;if(j.past)QPAST=j.past;if(j.pidle)QPIDLE=j.pidle;if(j.labNeed)QLABN=j.labNeed;if(j.prosDec)QPDEC=j.prosDec;if(j.labLate)QLAB=j.labLate;if(j.und)QUND=j.und;if(j.appts)QAPPT=j.appts;QV=j.ver;try{localStorage.setItem('implantQ:'+ROLE,JSON.stringify({ver:j.ver,items:j.items}))}catch(e){}const prev=QSEEN;QITEMS=j.items;
  const fresh=prev?QITEMS.filter(x=>x.queue===NEWQ[ROLE]&&!prev.has(x.id)).map(x=>x.id):[];
  QSEEN=new Set(QITEMS.map(x=>x.id));
  if(NEWQ[ROLE]&&fresh.length){beep();fresh.forEach(id=>FRESH.add(id));setTimeout(()=>{fresh.forEach(id=>FRESH.delete(id));renderQ()},15000)}
  renderQ()}
const FRESH=new Set();
function setLive(ok){['qLive','rLive'].forEach(id=>{const el=$(id);el.classList.toggle('off',!ok);el.textContent=ok?'زنده':'اتصال قطع است؛ دوباره تلاش می‌شود…'})}
const qTime=iso=>{try{return new Date(iso).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})}catch(e){return ''}};
const QLBL={waiting:['wait','منتظر پزشک'],reviewing:['rev','نزد پزشک'],consult:['wait','منتظر مشاور'],consulting:['rev','نزد مشاور'],done:['done','ثبت شد'],surgery:['surg','در جراحی'],surgdone:['done','جراحی انجام شد'],surgpart:['surg','جراحی ناتمام'],undecided:['wait','تصمیم نگرفته'],lost:['fail','انصراف داد']};
function waitPill(x){const q=x.queue;if(!((q==='waiting'&&ROLE!=='consultant')||(q==='consult'&&ROLE==='consultant')))return '';const at=q==='consult'?(x.consultAt||x.queuedAt):x.queuedAt;if(!at)return '';const m=Math.max(0,Math.round((Date.now()-Date.parse(at))/60000));return `<span class="wt${m>=40?' w2':m>=20?' w1':''}">⏱ ${m<1?'همین الان':m<60?fa(m)+' دقیقه':m<1440?fa(Math.floor(m/60))+' ساعت'+(m%60?' و '+fa(m%60)+' دقیقه':''):fa(Math.floor(m/1440))+' روز'}</span>`}
setInterval(()=>{try{if((ROLE==='doctor'||ROLE==='consultant')&&!$('viewQueue').hidden&&!document.hidden)renderQ()}catch(e){}},60000);
function qPill(x){if(ROLE==='consultant'&&x.settle==='pending'){const d=x.surg&&((x.surg.diff||0)-(x.surg.settledDiff||0))||0;return `<span class="pill settle">تسویه اختلاف ${d>0?'+':'−'}${fa(Math.abs(d))}</span>`}
  const l=QLBL[x.queue]||['draft',x.queue];return `<span class="pill ${l[0]}">${l[1]}</span>`}
/* qMeta: base + arc6 R8 (archive/arc6-paper-archive-file-editor.js: why the consultant sent the plan back) */
function qMeta(x){const s=[x.age?'سن '+faD(x.age):'',x.city?x.city:'',x.phone?faD(x.phone):'',x.nid?'کد ملی '+faD(x.nid):'',ROLE==='surgery'?'در جراحی از ساعت '+qTime(x.surgAt):'پذیرش '+qTime(x.queuedAt),ROLE==='surgery'&&x.surgN?fa(x.surgN)+' جلسه ثبت شده':'',x.asst&&ROLE!=='surgery'?'توسط '+x.asst:''].filter(Boolean).map(esc).join(' · ');return x&&x.back?s+` · <b class="fx7bk">${esc('↩ برگشت از مشاور: '+x.back)}</b>`:s}
function renderSurgQ(){const now=QITEMS.filter(x=>x.queue==='surgery'),wait=QITEMS.filter(x=>x.wait&&x.queue!=='surgery');
  const card=(x,i,w)=>`<button type="button" class="qitem${FRESH.has(x.id)?' fresh':''}" data-qopen="${esc(x.id)}">
      <div class="row1"><div>${i!=null?`<span class="qn">${fa(i+1)}</span>`:''}<span class="nm">${esc(x.name)}</span></div>${w?`<span class="pill">${x.jalali?'تأیید '+esc(x.jalali):'تأییدشده'}</span>`:qPill(x)}</div>
      <div class="meta">${w?[x.age?'سن '+faD(x.age):'',x.phone?faD(x.phone):'',x.nid?'کد ملی '+faD(x.nid):'',x.surgN?fa(x.surgN)+' جلسه ثبت شده':''].filter(Boolean).map(esc).join('، '):qMeta(x)}</div>${medShort(x.med)?`<div class="qwarn">⚠ ${esc(medShort(x.med))}</div>`:''}${!w&&x.note?`<div class="nt">${esc(x.note)}</div>`:''}</button>`;
  $('qList').innerHTML=now.length?now.map((x,i)=>`<div class="fx7sq">${card(x,i,false)}<div class="fx7sqa"><button class="btn sm ghost" type="button" data-fx5sc="${esc(x.id)}">امروز جراحی نشد</button></div></div>`).join(''):'<div class="empty">بیماری برای جراحی ارجاع نشده. منشی بیمار را با «ارجاع به جراح» می‌فرستد.</div>';
  $('qWaitW').hidden=!wait.length;const q=toEn($('qS').value.trim()).toLowerCase();
  const rows=wait.filter(x=>!q||String(x.name||'').toLowerCase().includes(q)||toEn(x.nid||'').includes(q)||toEn(x.phone||'').includes(q)).sort((a,b)=>String(b.doneAt||'').localeCompare(String(a.doneAt||'')));
  $('qWait').innerHTML=rows.length?rows.slice(0,q?60:30).map(x=>card(x,null,true)).join('')+(rows.length>(q?60:30)?`<p class="note">${fa(rows.length-(q?60:30))} بیمار دیگر؛ برای پیدا کردن، نام را جستجو کنید.</p>`:''):'<div class="empty">بیماری با این مشخصات پیدا نشد.</div>'}
/* renderQ: base + archive/ui.js (tiles, reception / surgery side cards) + surgery/queue.js («صف من» home tile); both added parts run after
   every branch of the base (the surgery and «a:» branches used to return early). finance/save-every-cheque-needs-amount.js still wraps it (window.renderQ). */
function renderQ(){try{renderKpi()}catch(e){}try{renderConx();renderSurgAppts();renderRecepAppts()}catch(e){console.error(e)}
  if(ROLE==='surgery'){const b=$('qBadge'),w=QITEMS.filter(x=>x.queue==='surgery').length;b.hidden=!w;b.textContent=fa(w);renderSurgQ();document.title=(w?`(${fa(w)}) `:'')+'کارتابل جراحی · طرح درمان ایمپلنت'}else{
  $('qWaitW').hidden=true;
  const active=QITEMS.filter(x=>x.queue!=='done'&&!SENDING.has(x.id));
  const b=$('qBadge');const w=QITEMS.filter(x=>x.queue===NEWQ[ROLE]&&!SENDING.has(x.id)).length;b.hidden=!w;b.textContent=fa(w);
  if(ROLE!=='staff'){
    $('qList').innerHTML=active.length?active.map((x,i)=>`<button type="button" class="qitem${FRESH.has(x.id)?' fresh':''}" data-qopen="${esc(x.id)}">
      <div class="row1"><div><span class="qn">${fa(i+1)}</span><span class="nm">${esc(x.name)}</span>${pdfIco(x.id,x.name)}</div><span class="qpw">${waitPill(x)}${qPill(x)}</span></div>
      <div class="meta">${qMeta(x)}</div>${medShort(x.med)?`<div class="qwarn">⚠ ${esc(medShort(x.med))}</div>`:''}${x.note?`<div class="nt">${esc(x.note)}</div>`:''}</button>`).join(''):(ROLE==='consultant'?'<div class="empty">طرح درمانی منتظر مشاور نیست.</div>':ROLE==='surgery'?'<div class="empty">بیماری برای جراحی فرستاده نشده.</div>':'<div class="empty">بیماری در صف انتظار نیست.</div>');
    document.title=(w?`(${fa(w)}) `:'')+'کارتابل '+ROLE_LBL[ROLE]+' · طرح درمان ایمپلنت'}
  else{
    const td=tDay(),OWN=QITEMS.filter(rOwn),OTH=QITEMS.filter(x=>!rOwn(x)),G=[['all','همه',OWN.length]],qs={},as={},os={};OWN.forEach(x=>{const k=(x.queue==='reviewing'?'waiting':x.queue)||'none';qs[k]=(qs[k]||0)+1});OTH.forEach(x=>{const k=x.queue||'none';os[k]=(os[k]||0)+1});
    Object.keys(QLBL).concat(Object.keys(qs).filter(k=>!QLBL[k])).forEach(k=>{if(qs[k])G.push(['q:'+k,(QLBL[k]||[0,'سایر'])[1],qs[k]])});
    const TA=[];
    if(!G.some(g=>g[0]===RQF))RQF='all';
    $('rChips').innerHTML=G.map(([k,l,n])=>`<button type="button" class="chip" data-rqf="${k}" aria-pressed="${RQF===k}">${esc(l)} <b>${fa(n)}</b></button>`).join('')+(Object.keys(os).length?`<span class="chip static">در مراحل دیگر: ${Object.keys(os).map(k=>(QLBL[k]||[0,'سایر'])[1]+' '+fa(os[k])).join(' · ')}</span>`:'');
    if(RQF.startsWith('a:')){const A=TA.filter(a=>a.kind===RQF.slice(2)).sort((a,b)=>(a.time||'99').localeCompare(b.time||'99'));$('rList').innerHTML=A.map(a=>apptCard(Object.assign({},a))).join('')||'<div class="empty">موردی نیست.</div>'}else{
    const QV=RQF==='all'?OWN:OWN.filter(x=>((x.queue==='reviewing'?'waiting':x.queue)||'none')===RQF.slice(2));
    $('rList').innerHTML=QV.length?QV.map((x,i)=>`<div class="item"><div class="row1"><div><span class="qn">${fa(i+1)}</span><span class="nm">${esc(x.name)}</span>${pdfIco(x.id,x.name)}
      <div class="meta">${qMeta(x)}</div>${x.note?`<div class="meta">${esc(x.note)}</div>`:''}</div>${qPill(x)}</div>
      ${['waiting','reviewing','consult','consulting'].includes(x.queue)?`<div class="acts">${x.queue==='waiting'?`<button class="btn sm ghost" data-qedit="${esc(x.id)}" type="button">ویرایش</button><button class="btn sm ghost" data-qdel="${esc(x.id)}" type="button">حذف از صف</button>`:''}<button class="btn sm ghost" data-fx7left="${esc(x.id)}" type="button">بیمار رفت</button></div>`:''}</div>`).join(''):'<div class="empty">امروز بیماری در مرحله‌ی طرح درمان نیست. بیماران جراحی‌شده و صف نوبت‌دهی در کاشی‌های خودشان هستند.</div>'}}}
  try{renderTiles();if(ROLE==='staff')renderSd();if(ROLE==='surgery')renderSurgAppts2();tileEmpty()}catch(e){console.error(e)}
  try{mqInit();if(document.body.dataset.tile==='q')renderMyQ();renderTiles()}catch(e){console.error(e)}}
let RQF='all';
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-rqf]');if(!t)return;RQF=t.dataset.rqf;renderQ()});
const RCF=['name','nid','date','phone','age','asst','city','ref','note'];
function fillRecep(v){const el=$('rc_asst');if(!el)return;const L=(SET.recep||[]).filter(Boolean);const cur=v!==undefined?v:el.value;
  el.innerHTML=`<option value="">${L.length?'— انتخاب پذیرنده —':'— فهرست پذیرنده‌ها در تنظیمات وارد نشده —'}</option>`+L.map(n=>`<option${n===cur?' selected':''}>${esc(n)}</option>`).join('')+(cur&&!L.includes(cur)?`<option selected>${esc(cur)}</option>`:'');
  if(!cur){let last='';try{last=localStorage.getItem('implantRecep')||''}catch(e){}if(L.includes(last))el.value=last}}
/* rcReset: base + ponly (prosthesis/ponly-prosthesis-only-patients-abutment.js: clear «فقط پروتز»). Still wrapped later by pl11 and ex1. */
function rcReset(){RC_EDIT=null;RC_REOPEN=null;RC_INTAKE='';fillRecep();RC_MED=blankMed();renderMed('rc');const keep=$('rc_asst').value;RCF.forEach(k=>$('rc_'+k).value='');$('rc_asst').value=keep;$('rc_date').value=jalali(new Date()).slash;
  $('rcTitle').textContent='پذیرش بیمار';$('rcSend').textContent='ارسال به کارتابل پزشک';$('rcCancel').hidden=true;
  const c=$('rc_ponly');if(c)c.checked=false}
/* reception: send any patient to the doctor's inbox (existing plan is reopened; plan in surgery → new plan) */
/* sendToDoctor: base + ux6 (ui/ux6-duplicate-unused-options-removed.js: open the reception tile first) + ux8 (ui/ux8-error-prevention-confirm-irreversible.js:
   a half-filled admission form asks before it is cleared); run order: ux8 question, ux6 tile, base */
async function sendToDoctor(pid,name,phone){try{if(ROLE==='staff'&&!RC_EDIT&&((($('rc_name')||{}).value||'').trim()||(($('rc_phone')||{}).value||'').trim())){const ok=await uxAsk({title:'فرم پذیرش نیمه‌کاره',msg:'فرم پذیرش «'+($('rc_name').value.trim()||$('rc_phone').value.trim())+'» هنوز ارسال نشده و پاک می‌شود. ادامه می‌دهید؟',ok:'بله، پاک شود',cancel:'نه، برگرد',danger:true});if(!ok)return}}catch(e){}
  try{if(ROLE==='staff'&&$('viewRecep').hidden)goTile('plan')}catch(e){}
  if(ROLE!=='staff')return;rcReset();let note='';
  if(pid){try{const j=await api('get',{id:pid},{timeout:12000});const q=j.queue||'',d=j.data||{},h=d.h||{};
      if(['waiting','reviewing','consult','consulting'].includes(q)){toast((h.name||name||'این بیمار')+' همین الان در کارتابل است.');return}
      RCF.forEach(k=>{if(!['asst','date','note'].includes(k)&&h[k]!=null)$('rc_'+k).value=h[k]});if(!$('rc_name').value)$('rc_name').value=name||'';
      RC_MED=medNorm(d.med);renderMed('rc');
      if(ex1Done(j)&&(j.status==='confirmed'||j.status==='modified')){RC_PREV=pid;RC_REOPEN=null;note='درمان قبلی این بیمار تمام شده است؛ پرونده‌ی تازه (دوره‌ی درمان تازه) با همان مشخصات ساخته و به پرونده‌ی قبلی لینک می‌شود.'}else if(q==='surgery'||q==='surgdone'||q==='surgpart')note='طرح قبلی این بیمار در مرحله‌ی جراحی است؛ یک طرح درمان تازه ساخته می‌شود.';
      else{RC_REOPEN=pid;note=(j.status==='confirmed'||j.status==='modified')?'طرح قبلی بیمار برای پزشک باز می‌شود و بعد از ویرایش دوباره به مشاور می‌رود.':'همان پرونده‌ی قبلی برای پزشک باز می‌شود.'}}
    catch(e){toast(e.message||'خطا');return}}
  else{$('rc_name').value=name||'';$('rc_phone').value=phone||''}
  try{$('pfSheet').hidden=true}catch(e){}
  $('rcTitle').textContent=RC_REOPEN?'ارسال دوباره به کارتابل پزشک':'ارسال به کارتابل پزشک';$('rcSend').textContent='ارسال به کارتابل پزشک';$('rcCancel').hidden=false;
  $('rcMsg').className='msg';$('rcMsg').textContent=note;$('rcSheet').hidden=false}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-todoc]');if(!t)return;e.preventDefault();e.stopPropagation();sdOpen(t.dataset.todoc,t.dataset.tdn,t.dataset.tdp)},true);
/* rcEdit: base + ponly («فقط پروتز») + pl11 (finance/pl11-reception-beside-part-surgery.js: «فقط ایمپلنت» / «سایر») + pk3 (plan/pk3-notes-date-author-recipient.js:
   notes panel); the three added parts also run when the patient is not in the queue */
function rcEdit(id){const x=QITEMS.find(v=>v.id===id);if(x){RC_EDIT=id;RC_REOPEN=null;RC_MED=medNorm(x.med);renderMed('rc');fillRecep(x.asst||'');RCF.forEach(k=>{if(k!=='asst')$('rc_'+k).value=x[k]||''});
  $('rcTitle').textContent='ویرایش بیمار در صف';$('rcSend').textContent='ذخیره‌ی تغییرات';$('rcCancel').hidden=false;$('rcMsg').textContent='';$('rcSheet').hidden=false}
  {const x=QITEMS.find(v=>v.id===id),c=$('rc_ponly');if(c)c.checked=!!(x&&x.pOnly)}
  try { const x = QITEMS.find(v => v.id === id) || {}; if ($('rc_ionly')) $('rc_ionly').checked = !!x.iOnly; if ($('rc_oonly')) $('rc_oonly').checked = !!x.oOnly } catch (e) { }
  try{const m=$('rcMsg');const old=document.querySelector('#rcSheet .pk3n');if(old)old.remove();if(m&&RC_EDIT===id){m.insertAdjacentHTML('beforebegin',pk3Panel(id,'reg',{name:($('rc_name')||{}).value||''}));pk3Fill(document.querySelector('#rcSheet .pk3n'))}}catch(e){}}
/* rcSend: base + id1 (other-clinics/id1-patient-identity-cheques.js: mobile number required unless «موبایل ندارد», duplicate national id → the old file)
   + ux5 A3 (ui/ux5-usability-round.js: an empty or odd-looking admission asks first); run order: id1, ux5, base */
async function rcSend(t){{
  const m = $('rcMsg'), ph = toEn(($('rc_phone') || {}).value || '').replace(/\D/g, ''), np = $('rc_nophone') && $('rc_nophone').checked;
  if (!np && !ID1_PH.test(ph)) { m.className = 'msg err'; m.textContent = 'شماره موبایل بیمار را وارد کنید (۰۹ و ۹ رقم)؛ اگر موبایل ندارد، «موبایل ندارد» را بزنید.'; try { $('rc_phone').focus() } catch (e) { } return }
  if (!RC_EDIT && !RC_REOPEN) { const h = id1Hit(); if (h) { const same = await uxAsk({ title: 'کد ملی تکراری', msg: `«${h.name}»${h.phone ? ' · ' + faD(h.phone) : ''}${h.jalali ? ' · تأیید ' + h.jalali : ''} قبلاً پرونده دارد. همان بیمار است؟`, ok: 'بله، همان بیمار (پرونده‌ی قبلی)', cancel: 'نه، بیمار جدید' });
    if (same) { const nm = $('rc_name').value.trim(), p2 = $('rc_phone').value; await sendToDoctor(h.id, h.name || nm, h.phone || p2); const mm = $('rcMsg'); if (mm) { mm.className = 'msg'; mm.textContent = (mm.textContent ? mm.textContent + ' ' : '') + 'پرونده‌ی قبلی باز شد؛ دوباره «ارسال» را بزنید.' } return } } } }
  try{if(t&&!t._uxOk){const nm=($('rc_name')&&$('rc_name').value||'').trim(),ph=toEn(($('rc_phone')&&$('rc_phone').value)||'').replace(/[\s\-()]/g,'');
  if(!nm&&!ph){const ok=await uxConfirm('نام و شماره‌ی موبایل خالی است. بیمار بدون نام و بدون شماره به کارتابل پزشک فرستاده شود؟','ارسال بدون نام',false,'بیمار بدون نام');if(!ok){$('rc_name').focus();return}}
  else if(ph&&!/^(\+98|0098|98)?0?9\d{9}$/.test(ph)){const ok=await uxConfirm('شماره‌ی موبایل «'+faD(ph)+'» درست به نظر نمی‌رسد (باید ۱۱ رقم و با ۰۹ شروع شود). با همین شماره ثبت شود؟','ثبت با همین شماره',false,'شماره‌ی موبایل');if(!ok){$('rc_phone').focus();return}}}}catch(e){}
  const m=$('rcMsg'),p={};RCF.forEach(k=>p[k]=$('rc_'+k).value.trim());p.med=medNorm(RC_MED);p.pOnly=$('rc_ponly')&&$('rc_ponly').checked?1:0;p.nophone=$('rc_nophone')&&$('rc_nophone').checked?1:0;
  if((SET.recep||[]).length&&!p.asst){m.className='msg err';m.textContent='پذیرنده را انتخاب کنید.';return}try{if(p.asst)localStorage.setItem('implantRecep',p.asst)}catch(e){}
  t.disabled=true;m.className='msg';m.textContent='در حال ارسال…';
  try{if(RC_EDIT)await api('queueUpdate',{id:RC_EDIT,patient:p});else if(RC_REOPEN)await api('queueReopen',{id:RC_REOPEN,patient:p});else{if(!t.dataset.nid)t.dataset.nid=uuid();await api('queueAdd',{id:t.dataset.nid,patient:Object.assign({},p,{prev:RC_PREV||''}),intake:RC_INTAKE||''});RC_PREV=null;delete t.dataset.nid;RC_INTAKE=''}
    m.className='msg ok';m.textContent=RC_EDIT?'تغییرات ذخیره شد.':`${p.name||'بیمار بدون نام'} به کارتابل پزشک رفت.`;toast(m.textContent);m.textContent='';rcReset();$('rcSheet').hidden=true;RTAB='ex';renderRecepBar();pollQ(true)}
  catch(e){m.className='msg err';m.textContent=e.message}finally{t.disabled=false}}
async function qOpen(t){if(t.disabled)return;const id=t.dataset.qopen,x=QITEMS.find(v=>v.id===id);
  if(ROLE==='surgery'&&x){if(x.data){openSurg(x);return}
    t.disabled=true;t.classList.add('loading');try{const j=await api('get',{id});openSurg(Object.assign({},x,{data:j.data||{},surg:j.surg||{sessions:[]},jalali:j.jalali||x.jalali}))}catch(e){if(e.message!=='aborted')alert0(e.message)}finally{t.disabled=false;t.classList.remove('loading')}return}
  if(ROLE==='consultant'&&x&&x.settle==='pending'&&x.queue==='surgdone'){openSettle(x);return}
  const docName=()=>SET.doctor?SET.doctor.split('·')[0].trim():'';
  const meta=(r,j)=>{['status','jalali','emailStatus','pdfName','edits'].forEach(k=>{if(j&&j[k]!==undefined&&j[k]!==''&&j[k]!==null)r[k]=j[k]});if(!r.h.doc)r.h.doc=docName();return r};
  const mark=()=>{if(x){if(ROLE==='doctor'&&x.queue==='waiting')x.queue='reviewing';if(ROLE==='consultant'&&x.queue==='consult')x.queue='consulting'}
    api('queueOpen',{id},{prio:'bg'}).then(()=>pollQ(true)).catch(()=>{})};
  const loc=newestDoc(id,null);
  // the inbox already carries the plan (or a newer copy is on this device): open at once, tell the server in the background
  if(x&&(x.data||loc)){const nd=newestDoc(id,x.data||null),d=nd||x.data||{},r=fromDoc(id,d),isLoc=!!(nd&&loc&&nd.updatedAt===loc.updatedAt);
    if(!r.h.name)Object.assign(r.h,{name:x.name,nid:x.nid,date:x.date||r.h.date,phone:x.phone,age:x.age,asst:x.asst,city:x.city||'',ref:x.ref||''});
    if(!r.note&&x.note)r.note=x.note;if(x.med&&!Object.keys(r.med.y).length)r.med=medNorm(x.med);
    if(r.status==='queued')r.status='draft';
    meta(r,x);openForm(r);if(isLoc){dirty=true;toast('آخرین تغییراتِ ذخیره‌نشده‌ی این بیمار روی این دستگاه بازیابی شد.')}
    mark();return}
  if(ROLE==='doctor'&&x&&x.status==='queued'){ // nothing saved yet: open instantly from the inbox data
    const r=blankForm();r.id=id;r.status='draft';Object.assign(r.h,{name:x.name,nid:x.nid,date:x.date||r.h.date,phone:x.phone,age:x.age,asst:x.asst,city:x.city||'',ref:x.ref||'',doc:docName()});r.note=x.note;r.med=medNorm(x.med);
    openForm(r);mark();return}
  t.disabled=true;t.classList.add('loading');
  try{const j=await api('queueOpen',{id});const sd=j.data||{},nd=newestDoc(id,sd);const r=meta(fromDoc(id,nd||sd),j);
    openForm(r);if(nd){dirty=true;toast('آخرین تغییراتِ ذخیره‌نشده‌ی این بیمار روی این دستگاه بازیابی شد.')}pollQ(true)}
  catch(e){if(e.message!=='aborted')alert0(e.message)}finally{t.disabled=false;t.classList.remove('loading')}}
function alert0(t){const el=$('qList');el.insertAdjacentHTML('afterbegin',`<div class="banner">${esc(t)}</div>`)}

