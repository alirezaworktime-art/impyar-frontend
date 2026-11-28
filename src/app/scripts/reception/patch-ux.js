/* ---------- patch-ux: مربع‌های تازه، نوار مسیر بیمار، جست‌وجو با دکمه‌ی کار، برگرداندن، یک‌ضرب‌ها، صدا، وضعیت ذخیره، راهنما، فرم پذیرش ---------- */
/* 1. tiles */
const TI={q:'M4 6h16M4 12h16M4 18h10',plan:'M9 4h6l1 2h3v14H5V6h3zM9 12h6M9 16h4',fol:'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',surg:'M4 20 14 10M14 10l3-3 3 3-3 3zM4 20l2-6 4 4z',sdone:'M5 12l4 4 10-10',chk:'M12 3v6M9 6h6M5 13a7 7 0 0 0 14 0M12 20v-1',unc:'M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z',pros:'M7 4c-2 0-3 2-3 5 0 4 2 11 4 11s2-5 4-5 2 5 4 5 4-7 4-11c0-3-1-5-3-5-2 0-3 1-5 1S9 4 7 4z',wb:'M4 12a8 8 0 1 0 3-6M4 4v4h4',arch:'M4 5h16v4H4zM5 9v10h14V9M10 13h4',new:'M12 5v14M5 12h14',rx:'M7 4h6a4 4 0 0 1 0 8H7zM7 12v8M12 12l6 8M18 12l-6 8',cons:'M4 5h16v10H9l-5 4z',chq:'M3 7h18v10H3zM7 12h6M16 12h2',und:'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM10 10a2 2 0 1 1 3 2c-1 .5-1 1-1 2M12 17h.01',acc:'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5',inv:'M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8',cal:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',set:'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 12h2M18 12h2M12 4v2M12 18v2',dash:'M4 20V10M10 20V4M16 20v-7M22 20H2',fin:'M12 3v18M17 7H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6',users:'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a6 6 0 0 1 12 0M16 4a4 4 0 0 1 0 7M22 21a6 6 0 0 0-4-6',work:'M14 7l3-3 3 3-3 3zM4 20l9-9',ready:'M3 7h13v10H3zM16 10h3l2 3v4h-5M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',done:'M5 12l4 4 10-10',fix:'M12 3v18M8 6h8M8 10h8M9 14h6M10 18h4',log:'M4 6h16M4 12h16M4 18h16'};
const TCOUNT={staff:['plan','fol','surg','sdone','chk','unc','pros','wb'],doctor:['plan'],consultant:['cons','chq'],surgery:['surg','chk','unc','pros'],lab:['new','work','ready']};
const tIco=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${TI[k]||TI.arch}"/></svg>`;
renderTiles=function(){let el=$('tiles');if(!el){el=document.createElement('div');el.id='tiles';el.className='hts';const w=document.querySelector('.wrap');if(!w)return;w.insertBefore(el,w.firstChild)}
  const L=tileList(),C=TCOUNT[ROLE]||[];el.dataset.n=L.length;el.hidden=!ROLE||!L.length||TILE_HIDE;
  el.innerHTML=L.map(t=>{const counted=C.includes(t.k),zero=counted&&!t.n;
    return `<button type="button" class="htile x tc-${t.c}${zero?' zero':''}${t.k==='q'?' hq':''}" data-tile="${t.k}" aria-current="${TILE===t.k}" title="${esc(t.s||'')}"><span class="hi">${tIco(t.k)}</span><span class="hn">${t.n?fa(t.n):counted?'—':''}</span><span class="hl">${esc(t.l)}</span><span class="hs">${esc(t.s||'')}</span></button>`}).join('');
  tileHead()};
/* 2. patient path bar */
function pathBar(j){const sg=j.surg||{},ses=sg.sessions||[],pr=j.pros||{},log=pr.log||[],ap=j.appts||[],td=tDay();
  const lg=k=>{const g=log.filter(x=>x.k===k);return g.length?g[g.length-1].at:''};const apDone=ks=>{const a=ap.filter(x=>ks.includes(x.kind)&&x.st==='done').sort((a,b)=>a.day<b.day?1:-1)[0];return a?a.day+'T12:00:00Z':''};
  const S=[['پذیرش',j.createdAt],['طرح درمان',j.consultAt||((j.status==='confirmed'||j.status==='modified')?j.doneAt:'')],['مشاوره',(j.status==='confirmed'||j.status==='modified')?(j.doneAt||j.updatedAt):''],['جراحی',ses.length?(ses[0].savedAt||ses[0].at):''],['بخیه',apDone(['suture'])],['انکاوری',apDone(['uncover'])||lg('impr')],['قالب',lg('impr')],['لابراتوار',lg('lab')||lg('tryin')],['تحویل',pr.stage==='done'?lg('done'):'']];
  let cur=S.length;for(let i=0;i<S.length;i++){if(!S[i][1]){cur=i;break}}
  const lost=j.queue==='lost'||j.queue==='undecided';
  return `<div class="pbar${lost?' lost':''}">${S.map(([l,d],i)=>`<span class="ps${d?' ok':''}${i===cur?' cur':''}"><i></i><b>${l}</b><small>${d?esc(jd(d)):i===cur?(lost?(j.queue==='lost'?'انصراف':'مردد'):'مرحله‌ی بعدی'):''}</small></span>`).join('')}</div>`}
/* 3. undo toast */
function toastUndo(text,undo){const el=$('toast');el.innerHTML='';el.className='toast';const s=document.createElement('span');s.textContent=text;el.appendChild(s);
  if(undo){const b=document.createElement('button');b.type='button';b.className='tundo';b.textContent='برگرداندن';b.onclick=async()=>{b.disabled=true;try{await undo();el.hidden=true;toast('برگردانده شد.')}catch(e){toast(e.message,1)}};el.appendChild(b)}
  el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>el.hidden=true,6500)}
const AST_L={done:'انجام شد',noshow:'نیامد',cancel:'نوبت لغو شد'};
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button[data-ast]');if(!t||t.disabled)return;e.preventDefault();e.stopImmediatePropagation();
  const aid=t.dataset.aid,st=t.dataset.ast;t.disabled=true;
  try{const rj=await api('apptSet',{aid,st});toastUndo(AST_L[st]||'ثبت شد',async()=>{if(rj&&rj.ev)await api('evUndo',{eid:rj.ev,by:($('rc_asst')||{}).value||ROLE_LBL[ROLE]||''});else await api('apptSet',{aid,st:'set'});pollQ(true);if(PF&&!$('pfSheet').hidden)refreshFile();try{if(!$('viewCal').hidden)loadCal()}catch(x){}});
    try{if(!$('viewCal').hidden)await loadCal()}catch(x){}pollQ(true);if(PF&&!$('pfSheet').hidden)refreshFile()}catch(err){alertMsg(err.message)}finally{t.disabled=false}},true);
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button[data-booklost]');if(!t||t.disabled)return;e.preventDefault();e.stopImmediatePropagation();
  const id=t.dataset.booklost;t.disabled=true;
  try{await api('bookLost',{id,by:($('rc_asst')||{}).value||ROLE_LBL[ROLE]});toastUndo('انصراف ثبت شد و به بایگانی رفت.',async()=>{await api('bookUndo',{id});pollQ(true)});pollQ(true)}catch(err){alertMsg(err.message)}finally{t.disabled=false}},true);
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button[data-tdone]');if(!t||t.disabled)return;e.preventDefault();e.stopImmediatePropagation();
  const id=t.dataset.tdone;t.disabled=true;
  try{await api('taskDone',{id,by:($('rc_asst')||{}).value||ROLE_LBL[ROLE]});const x=(typeof TASKS!=='undefined'?TASKS:[]).find(v=>v.id===id);if(x){x.done=1;try{renderTasks()}catch(y){}}toastUndo('انجام شد.',async()=>{await api('taskDone',{id,undo:1});if(x){x.done=0;try{renderTasks()}catch(y){}}pollQ(true)});pollQ(true)}catch(err){alertMsg(err.message)}finally{t.disabled=false}},true);
/* 4. one tap: prescription + discharge */
let RX_DIS='';
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button[data-sdall]');if(!t)return;RX_DIS=t.dataset.sdall;rxOpen(t.dataset.sdall,t.dataset.sdn)},true);
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#rxGo');if(!t||!RX_DIS||!RX.give||RX.give.pid!==RX_DIS)return;const pid=RX_DIS;
  setTimeout(async function wait(n=0){const m=$('rxMsg');if(m&&m.classList.contains('ok')){try{const c=SDC[pid]||{};await api('discharge',{id:pid,care:true,note:c.note||'',by:($('rc_asst')||{}).value||''});$('rxSheet').hidden=true;RX_DIS='';delete SDC[pid];toast('نسخه چاپ شد و بیمار ترخیص شد.');pollQ(true)}catch(err){toast(err.message,1)}return}
    if(m&&m.classList.contains('err'))return;if(n<40)setTimeout(()=>wait(n+1),250)},300)});
/* 5. tomorrow's reminders on one sheet */
function remSheet(){const td=tDay(),tm=QAPPT.filter(a=>a.day===dAdd(td,1)&&a.st==='set'&&a.time).sort((a,b)=>a.time<b.time?-1:1);
  const nums=tm.filter(a=>a.phone).map(a=>toEn(a.phone));
  const s=mkSheet('remSheet',`<h3>یادآوری نوبت‌های فردا <small class="muted">(${fa(tm.length)} نوبت)</small></h3><p class="note">روی هر ردیف بزنید تا پیامک همان بیمار با متن آماده باز شود؛ بعد از برگشتن، ردیف سبز می‌شود.</p>
    <div class="list" id="remL">${tm.map(a=>{const sms=a.phone?smsLink(a.phone,apptMsg(a)):'';return `<div class="rmrow${a.sms?' ok':''}"><span class="tm">${faD(a.time)}</span><span class="nm">${esc(a.name)}<small>${esc(AKL[a.kind]||'')}</small></span>${sms?`<a class="btn sm${a.sms?' ghost':''}" href="${sms}" data-asms="${esc(a.id)}">${a.sms?'دوباره':'پیامک'}</a>`:'<span class="pill settle">بدون شماره</span>'}</div>`}).join('')||'<div class="empty">برای فردا نوبتی نیست.</div>'}</div>
    <div class="btns" style="flex-wrap:wrap">${nums.length?`<button class="btn ghost" type="button" id="remCopy">کپی همه‌ی شماره‌ها</button><button class="btn ghost" type="button" id="remAll">علامت «فرستاده شد» برای همه</button>`:''}<button class="btn ghost" type="button" id="remClose">بستن</button></div>`);
  s.hidden=false;s.dataset.nums=nums.join(',')}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.hasAttribute('data-remgo')){e.preventDefault();e.stopImmediatePropagation();remSheet();return}
  if(t.id==='remClose'){$('remSheet').hidden=true;return}
  if(t.id==='remCopy'){try{await navigator.clipboard.writeText($('remSheet').dataset.nums.split(',').join('\n'));toast('شماره‌ها کپی شد.')}catch(x){toast('کپی ممکن نشد.',1)}return}
  if(t.id==='remAll'){t.disabled=true;const td=tDay(),tm=QAPPT.filter(a=>a.day===dAdd(td,1)&&a.st==='set'&&a.time&&!a.sms&&a.phone);for(const a of tm){try{await api('apptSet',{aid:a.id,sms:1})}catch(x){}}toast('همه علامت خوردند.');pollQ(true);$('remSheet').hidden=true}},true);
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('#remL a[data-asms]');if(a){const r=a.closest('.rmrow');if(r)r.classList.add('ok')}});
/* 6. sound + browser notification when new work arrives */
let MQ_N=-1;const SND=()=>{try{return localStorage.getItem('implantSnd')!=='0'}catch(e){return true}};
function mqNotify(n){if(MQ_N>=0&&n>MQ_N&&SND()){try{beep()}catch(e){}try{if(document.hidden&&'Notification' in window&&Notification.permission==='granted')new Notification('طرح درمان ایمپلنت',{body:'کار تازه در صف شما ('+fa(n)+')',tag:'implant-q'})}catch(e){}}MQ_N=n}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#sndBtn');if(!t)return;const on=!SND();try{localStorage.setItem('implantSnd',on?'1':'0')}catch(x){}
  if(on&&'Notification' in window&&Notification.permission==='default'){try{Notification.requestPermission()}catch(x){}}t.textContent=on?'🔔':'🔕';t.title=on?'صدای کار تازه روشن است':'صدای کار تازه خاموش است';if(on)try{beep()}catch(x){}});
/* 7. save / connection status */
function netPill(){const p=$('netPill');if(!p||!ROLE)return;const n=(typeof OUTBOX!=='undefined'?OUTBOX.filter(o=>(o.role||'doctor')===ROLE).length:0);
  let c='ok',t='ذخیره شد';if(!navigator.onLine){c='bad';t='بدون اینترنت'}else if(n){c='warn';t='در حال ارسال '+fa(n)}else if(typeof dirty!=='undefined'&&dirty&&!$('viewForm').hidden){c='warn';t='تغییر ذخیره‌نشده'}
  p.className='netp '+c;p.textContent=t}
setInterval(netPill,1500);window.addEventListener('online',netPill);window.addEventListener('offline',netPill);
/* 8. first-run hints */
const HINTS={staff:['«صف من» یعنی کارهایی که الان با شماست؛ هر سطر یک دکمه‌ی اصلی دارد.','مربع‌های بالا بخش‌ها هستند؛ عددشان یعنی چند کار منتظر است.','با جست‌وجوی بالای صفحه هر بیمار را پیدا کنید و همان‌جا نوبت، تماس یا PDF بگیرید.'],
  doctor:['بیمارانی که پذیرش فرستاده اینجا هستند؛ «نوشتن طرح» را بزنید.','بعد از پایان طرح، «ارسال به مشاور» بیمار را به صف مشاور می‌برد.'],
  consultant:['بیماران منتظر مشاوره، تسویه‌ها، چک‌های سررسید و استردادها همه در «صف من» است.','در فرم طرح، «جمع نقد دریافتی» و «تاریخ اولین چک» را بنویسید؛ چک‌ها خودکار حساب می‌شوند.'],
  surgery:['بیمار ارجاع‌شده برای جراحی اینجا می‌آید؛ «ثبت جراحی» را بزنید.','چکاپ، انکاوری و نوبت‌های پروتز امروز هم زیر همین صف است.']};
function hintHTML(){const H=HINTS[ROLE];if(!H)return '';try{if(localStorage.getItem('implantHint:'+ROLE))return ''}catch(e){return ''}
  return `<div class="hintc"><b>راهنمای سریع</b><ul>${H.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><button class="btn sm" type="button" id="hintOk">متوجه شدم</button></div>`}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#hintOk');if(!t)return;try{localStorage.setItem('implantHint:'+ROLE,'1')}catch(x){}const c=t.closest('.hintc');if(c)c.remove()});
/* renderMyQ: this layer (count notice, sound button, quick hint) is merged into surgery/queue.js */
/* 9. reception form: live ✓/✗ (the previous-file banner already exists: rcDupCheck) */
function rcLive(){const ni=$('rc_nid'),ph=$('rc_phone');if(!ni||!ph)return;
  const nv=toEn(ni.value).replace(/\D/g,''),pv=toEn(ph.value).replace(/\D/g,'');
  const nidOk=nv.length===10&&(()=>{let s=0;for(let i=0;i<9;i++)s+=+nv[i]*(10-i);const r=s%11;return +nv[9]===(r<2?r:11-r)})();
  ni.classList.remove('vok','vbad');void nidOk;
  const phOk=/^09\d{9}$/.test(pv);ph.classList.toggle('vok',phOk);ph.classList.remove('vbad');
}
document.addEventListener('input',e=>{if(e.target&&(e.target.id==='rc_nid'||e.target.id==='rc_phone'))rcLive()});

document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-qsappt]');if(t)openAppt({plan:t.dataset.qsappt,name:t.dataset.qsn,phone:t.dataset.qsp,kind:'other'})});
