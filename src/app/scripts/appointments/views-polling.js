/* ---------- views + polling ---------- */
let VTIMER=null;
/* showExtra: base + oc1 (viewOc) + lf1 (viewLf; that section is created by lf1, so before it loads $('viewLf') is null) */
function showExtra(v){['cal','pros','lab','dash','pday','users','wb','acc','rx','fin'].forEach(k=>{const el=$('view'+k[0].toUpperCase()+k.slice(1));if(el)el.hidden=v!==k});
  [['tabCal','cal'],['tabPros','pros'],['tabLab','lab'],['tabDash','dash'],['tabPday','pday'],['tabUsers','users'],['tabWb','wb'],['tabAcc','acc'],['tabRx','rx'],['tabFin','fin']].forEach(([t,k])=>$(t).setAttribute('aria-current',v===k));
  clearInterval(VTIMER);VTIMER=null;
  if(v==='cal'){loadCal();VTIMER=setInterval(()=>{if(!document.hidden)loadCal()},30000)}
  if(v==='pros'){loadPros();VTIMER=setInterval(()=>{if(!document.hidden)loadPros()},20000)}
  if(v==='pday'){loadPday();VTIMER=setInterval(()=>{if(!document.hidden)loadPday()},30000)}
  if(v==='users'){UA.edit=null;loadUsers();loadAttPerf()}
  if(v==='wb')loadWb();
  if(v==='acc')accInit();
  if(v==='rx')loadRx();
  if(v==='fin')loadFin();
  if(v==='lab'){pollLab(true);VTIMER=setInterval(()=>pollLab(false),8000)}
  if(v==='dash'){loadDash();try{mrApply()}catch(e){}}
  const elOc=$('viewOc');if(elOc)elOc.hidden=v!=='oc';
  const elLf=$('viewLf');if(elLf)elLf.hidden=v!=='lf'}
let RTAB=(()=>{try{return localStorage.getItem('implantRTab')||'ex'}catch(e){return 'ex'}})(),RAD='t',RAF={sg:'all',pr:'all'},CKM='',CKD='t',CKF='all';
const raDayISO=x=>x==='f'?dAdd(tDay(),1):tDay();
const apSort=(a,b)=>(a.time||'99').localeCompare(b.time||'99');
function apFilterSec(A,keys,fsel,fEl,lEl,emp){const cnt={};A.forEach(a=>cnt[a.kind]=(cnt[a.kind]||0)+1);
  $(fEl).innerHTML=[['all','همه',A.length],...keys.filter(k=>k!=='tryin'&&k!=='postop'&&k!=='check'||cnt[k]).map(k=>[k,AFL[k]||AKL[k],cnt[k]||0])].map(([k,l,n])=>`<button type="button" class="chip" data-raf="${fEl}:${k}" aria-pressed="${fsel===k}">${esc(l)} <b>${fa(n)}</b></button>`).join('');
  const V=fsel==='all'?A:A.filter(a=>a.kind===fsel);$(lEl).dataset.n=A.length;$(lEl).innerHTML=V.length?V.map(a=>apptCard(Object.assign({},a))).join(''):`<div class="empty">${emp}</div>`}
let SECC=(()=>{try{return JSON.parse(localStorage.getItem('implantSecC')||'{}')}catch(e){return {}}})();
/* tidySecs: base + archive/ui (tileEmpty also runs for non-staff roles; its errors are swallowed) */
function tidySecs(){if(ROLE==='staff')document.querySelectorAll('#viewRecep .rpane, #rAll').forEach(pn=>{let vis=0;pn.querySelectorAll('.rsec').forEach(sec=>{const L=sec.querySelector('.list');if(!L||sec.dataset.tile==='plan'||!sec.dataset.tile)return;const k=L.id,n=L.dataset.n!==undefined?+L.dataset.n:L.querySelectorAll(':scope>.item').length;
    const has=n||!!L.querySelector('[data-tall]');sec.hidden=!has;if(has)vis++;sec.classList.toggle('col',!!SECC[k]);const h=sec.querySelector('.rsh');if(h){h.dataset.sec=k;let b=h.querySelector('.rsc');if(!b){b=document.createElement('b');b.className='rsc';h.appendChild(b)}b.textContent=fa(n)}});
    let em=pn.querySelector('.rpEmpty');if(!em){em=document.createElement('div');em.className='empty rpEmpty';em.textContent='در این بخش فعلاً کاری نیست.';pn.appendChild(em)}em.hidden=!!vis||pn.dataset.rpane==='ex'||pn.id==='rAll'});
  try{tileEmpty()}catch(e){}}
document.addEventListener('click',e=>{const h=e.target.closest&&e.target.closest('.rsec>.rsh[data-sec]');if(!h||e.target.closest('button,a'))return;const k=h.dataset.sec;SECC[k]=!SECC[k];if(!SECC[k])delete SECC[k];try{localStorage.setItem('implantSecC',JSON.stringify(SECC))}catch(x){}h.parentNode.classList.toggle('col',!!SECC[k])});
/* renderRecepAppts: base + appt1 (refresh the booked-appointments tile) */
function renderRecepAppts(){if(ROLE==='staff'&&$('raSg')){const day=raDayISO(RAD),dl=RAD==='t'?'امروز':'فردا',A=QAPPT.filter(a=>a.st==='set'&&a.day===day).sort(apSort);
  document.querySelectorAll('[data-rad]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.rad===RAD));
  apFilterSec(A.filter(a=>SG_K.includes(a.kind)),SG_K,RAF.sg,'raSgF','raSg',dl+' نوبت جراحی ثبت نشده.');
  if($('raCk'))apFilterSec(A.filter(a=>CK_K.includes(a.kind)),CK_K,RAF.ck||'all','raCkF','raCk',dl+' نوبت چکاپ یا بخیه ثبت نشده.');
  if($('raUnc')){const U=A.filter(a=>a.kind==='uncover');$('raUnc').dataset.n=U.length;$('raUnc').innerHTML=U.length?U.map(a=>apptCard(Object.assign({},a))).join(''):`<div class="empty">${dl} نوبت انکاوری ثبت نشده.</div>`}
  apFilterSec(A.filter(a=>AGRP.pr.includes(a.kind)),AGRP.pr,RAF.pr,'raPrF','raPr',dl+' نوبت پروتز ثبت نشده.');
  const O=A.filter(a=>!AGRP.sg.includes(a.kind)&&!AGRP.pr.includes(a.kind)&&!AGRP.cs.includes(a.kind)&&!AGRP.cp.includes(a.kind));$('raOt').innerHTML=O.map(a=>apptCard(Object.assign({},a))).join('');
  $('raOt').dataset.n=O.length;renderRecepBar();tidySecs();if(!$('ckSheet').hidden)renderCk()}
  try{if(ROLE==='staff'&&TILE==='bkd'){bkdLoad();bkdRender()}}catch(e){console.error(e)}}
function renderRecepBar(){if(ROLE!=='staff'||!$('rTabs'))return;const td=tDay(),T=QAPPT.filter(a=>a.st==='set'&&a.day===td),open=(ks,h)=>TASKS.filter(t=>!t.done&&ks.includes(t.kind)&&dDiff(t.due,td)<=h).length;
  const N={ex:QITEMS.filter(staffOwn).length,ap:T.filter(a=>!AGRP.cs.includes(a.kind)&&!AGRP.cp.includes(a.kind)).length,bk:open(['book'],3650)+open(['suture','labready'],1)+open(['uncover','recall'],0),fl:open(['fol1','fol4'],0)+open(['numb','week','pweek'],0)+QSET.length+TASKS.filter(t=>!t.done&&t.kind==='book'&&t.info!=='cont'&&dDiff(td,t.due)>30).length};
  Object.keys(N).forEach(k=>{const b=$('rtN_'+k);if(b){b.textContent=N[k]?fa(N[k]):'';b.hidden=!N[k]}});
  ['cs','cp'].forEach(g=>{const n=T.filter(a=>AGRP[g].includes(a.kind)).length,b=$('rfN_'+g);b.textContent=n?fa(n):'';b.hidden=!n});
  if(!document.querySelector('[data-rpane="'+RTAB+'"]'))RTAB='ex';
  document.querySelectorAll('[data-rtab]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.rtab===RTAB));document.querySelectorAll('[data-rpane]').forEach(p=>p.hidden=p.dataset.rpane!==RTAB);
  renderNow()}
let NOW_ALL=false;
function tehNow(){try{const p={};new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tehran',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).forEach(x=>p[x.type]=x.value);return (+p.hour)*60+(+p.minute)}catch(e){const d=new Date();return d.getHours()*60+d.getMinutes()}}
/* renderNow: base + ux6 (3) (only in «صف من», without the late-appointment rows that «صف من» already lists) */
function renderNow(){const el=$('rNow');if(!el)return;const td=tDay(),now=tehNow(),R=[],mins=iso=>Math.round((Date.now()-Date.parse(iso))/60000);
  QITEMS.forEach(x=>{if((x.queue==='waiting'||x.queue==='consult')&&x.queuedAt){const m=mins(x.queuedAt);if(m>=20)R.push({w:m>=40?2:1,o:-m,t:`<b>${esc(x.name)}</b> — ${fa(m)} دقیقه ${x.queue==='waiting'?'منتظر پزشک':'منتظر مشاور'}`,a:`<button class="btn sm ghost" type="button" data-rtab="ex">دیدن صف</button>`})}});
  const here=new Set(QITEMS.map(x=>x.id));
  QAPPT.filter(a=>a.day===td&&a.st==='set').forEach(a=>{const g=kGrp(a.kind);
    if(!a.time){R.push({w:1,o:0,t:`ساعت نوبت <b>${esc(a.name)}</b> (${esc(AKL[a.kind]||'')}) تعیین نشده`,a:`<button class="btn sm" type="button" data-aedit="${esc(a.id)}">تعیین ساعت</button>`});return}
    const late=now-(+a.time.slice(0,2)*60+ +a.time.slice(3));if(late>=15&&!(a.plan&&here.has(a.plan)))R.push({w:late>=40?2:1,o:-late,t:`<span class="kdot k-${g}"></span>نوبت ${esc(faD(a.time))} <b>${esc(a.name)}</b> (${esc(AKL[a.kind]||'')}) — ${fa(late)} دقیقه گذشته، هنوز نیامده`,a:`${a.phone?`<a class="btn sm ghost" href="tel:${esc(toEn(a.phone))}">تماس</a>`:''}<button class="btn sm ghost" type="button" data-ast="done" data-aid="${esc(a.id)}">آمد / انجام شد</button><button class="btn sm ghost" type="button" data-ast="noshow" data-aid="${esc(a.id)}">نیامد</button>`})});
  const od=k=>TASKS.filter(t=>!t.done&&k.includes(t.kind)&&dDiff(t.due,td)<0).length,o1=od(['fol1','fol4','numb','week','pweek']),o2=od(['book','suture','labready','uncover','recall']);
  if(o1)R.push({w:2,o:1,t:`<b>${fa(o1)}</b> پیگیری عقب‌افتاده`,a:`<button class="btn sm" type="button" data-rtab="fl">رفتن به پیگیری‌ها</button>`});
  if(o2)R.push({w:1,o:2,t:`<b>${fa(o2)}</b> نوبت‌دهی عقب‌افتاده`,a:`<button class="btn sm" type="button" data-rtab="bk">رفتن به نوبت‌دهی</button>`});
  const tm=QAPPT.filter(a=>a.day===dAdd(td,1)&&a.st==='set'),un=tm.filter(a=>!a.sms&&a.phone);
  if(un.length)R.push({w:1,o:3,t:`فردا ${fa(tm.length)} نوبت؛ <b>${fa(un.length)} پیامک یادآوری</b> فرستاده نشده`,a:`<button class="btn sm" type="button" data-remgo>فرستادن یادآوری‌ها</button>`});
  R.sort((a,b)=>b.w-a.w||a.o-b.o);el.hidden=false;
  if(!R.length)el.innerHTML='<div class="rnh ok">✓ کار فوری ندارید</div>';/* (ux6 below then hides the box: no .rn rows) */
  else{const V=NOW_ALL?R:R.slice(0,4);
  el.innerHTML=`<div class="rnh">کارهای الان <b>${fa(R.length)}</b></div>${V.map(r=>`<div class="rn${r.w>1?' bad':''}"><div class="tx">${r.t}</div><div class="acts">${r.a}</div></div>`).join('')}${R.length>4?`<button class="btn sm ghost" type="button" data-nowall>${NOW_ALL?'کمتر':'نمایش '+fa(R.length-4)+' مورد دیگر'}</button>`:''}`}
  /* ux6 (3): drop the late-appointment rows, recount, hide when empty */
  try{if(!el.hidden){el.querySelectorAll('.rn').forEach(x=>{if(x.querySelector('[data-ast]'))x.remove()});
  const n=el.querySelectorAll('.rn').length;if(!n){el.hidden=true;el.innerHTML=''}else{const b=el.querySelector('.rnh b');if(b)b.textContent=fa(n);const m=el.querySelector('[data-nowall]');if(m&&n<=4&&!NOW_ALL)m.remove()}}}catch(e){}}
setInterval(()=>{try{if(ROLE==='staff'&&!$('viewRecep').hidden&&!document.hidden)renderNow()}catch(e){}},60000);
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-nowall]');if(t){NOW_ALL=!NOW_ALL;renderNow()}});
function renderCk(){const g=CKM,day=raDayISO(CKD),A=QAPPT.filter(a=>a.st!=='cancel'&&a.day===day&&AGRP[g].includes(a.kind)).sort(apSort);
  $('ckTitle').textContent=(g==='cs'?'چکاپ جراحی':'چکاپ پروتز')+' — '+(CKD==='t'?'امروز':'فردا');document.querySelectorAll('[data-ckd]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ckd===CKD));
  apFilterSec(A,AGRP[g],CKF,'ckF','ckList',(CKD==='t'?'امروز':'فردا')+' چکاپی ثبت نشده.');$('ckNew').textContent='＋ ثبت نوبت '+(g==='cs'?'چکاپ جراحی':'چکاپ پروتز')}
function rSearch(){const box=$('rSRes'),q=toEn($('rS').value||'').trim().toLowerCase();if(!q){box.innerHTML='';return}
  const seen=new Set(),pool=[...QITEMS.map(x=>{const m29=ARCHIVE.find(d=>d.id===x.id)||{};return {id:x.id,name:x.name,nid:x.nid,phone:x.phone,q:x.queue,fno:m29.fno,arc:m29.arc}}),...ARCHIVE.map(d=>({id:d.id,name:d.name,nid:d.nid,phone:d.phone||'',st:d.status,fno:d.fno,arc:d.arc}))].filter(x=>x.id&&!seen.has(x.id)&&seen.add(x.id));
  const hits=pool.filter(x=>String(x.name||'').toLowerCase().includes(q)||toEn(x.nid||'').includes(q)||toEn(x.phone||'').includes(q)||(x.fno!=null&&x.fno!==''&&toEn(String(x.fno)).toLowerCase().includes(q))).slice(0,8);
  const ap=QAPPT.filter(a=>!a.plan&&(String(a.name||'').toLowerCase().includes(q)||toEn(a.phone||'').includes(q))).slice(0,4);
  box.innerHTML=hits.map(x=>`<div class="qrow"><button type="button" data-file="${esc(x.id)}" data-fname="${esc(x.name||'')}">${esc(x.name||'بدون نام')}<small>${x.q&&QLBL[x.q]?'امروز: '+QLBL[x.q][1]+' · ':''}${x.fno!=null&&x.fno!==''?'پرونده '+esc(faD(String(x.fno)))+' · ':''}${x.arc?'کاغذی · ':''}${x.nid?'کد ملی '+esc(faD(x.nid)):''}${x.phone?' · '+esc(faD(x.phone)):''}</small></button><span class="qacts">${x.arc&&['staff','consultant'].includes(ROLE)?`<button class="qdoc m29go" type="button" data-m29arc="${esc(x.id)}">ادامه‌ی درمان</button>`:''}<button class="qdoc" data-todoc="${esc(x.id)}" data-tdn="${esc(x.name||'')}" data-tdp="${esc(x.phone||'')}" type="button">ارجاع به پزشک…</button><button class="qdoc" type="button" data-qsappt="${esc(x.id)}" data-qsn="${esc(x.name||'')}" data-qsp="${esc(x.phone||'')}">نوبت</button>${x.phone?`<a class="qdoc" href="tel:${esc(toEn(x.phone))}">تماس</a>`:''}<button class="qdoc" type="button" data-pdfall="${esc(x.id)}" data-pdfn="${esc(x.name||'')}">PDF</button></span></div>`).join('')+
    ap.map(a=>`<div class="qrow"><button type="button" data-aedit="${esc(a.id)}">${esc(a.name)}<small>بدون پرونده · نوبت ${esc(AKL[a.kind]||'')} ${esc(jDay(a.day))}</small></button><button class="qdoc" data-todoc="${esc('')}" data-tdn="${esc(a.name||'')}" data-tdp="${esc(a.phone||'')}" type="button">ارجاع به پزشک…</button></div>`).join('')||'<div class="empty">بیماری پیدا نشد.</div>'}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='rS')rSearch()});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t||ROLE!=='staff')return;
  if(t.dataset.rtab){goTile({ex:'plan',ap:'surg',bk:'surg',fl:'fol'}[t.dataset.rtab]||'plan');return}
  if(t.dataset.rad){RAD=t.dataset.rad;renderRecepAppts();return}
  if(t.dataset.raf){const [el,k]=t.dataset.raf.split(':');if(el==='raSgF')RAF.sg=k;else if(el==='raPrF')RAF.pr=k;else if(el==='raCkF')RAF.ck=k;else CKF=k;if(el==='ckF')renderCk();else renderRecepAppts();return}
  if(t.dataset.ckd){CKD=t.dataset.ckd;CKF='all';renderCk();return}
  if(t.hasAttribute('data-remgo')){RAD='f';goTile('surg');return}
  if(t.dataset.rfab==='rc'){$('rcSheet').hidden=false;setTimeout(()=>{if(!RC_EDIT)$('rc_name').focus()},60);return}
  if(t.dataset.rfab==='book'){bkModeOpen();return}
  if(t.dataset.rfab==='cs'||t.dataset.rfab==='cp'){CKM=t.dataset.rfab;CKD='t';CKF='all';renderCk();$('ckSheet').hidden=false;return}
  if(t.id==='ckClose'){$('ckSheet').hidden=true;return}
  if(t.id==='ckNew'){openAppt({kind:CKF!=='all'?CKF:CKM==='cs'?'chks':'chkp',day:raDayISO(CKD)});return}
  if(t.id==='rcClose'){$('rcSheet').hidden=true;return}
  if(t.closest('#rSRes')){$('rS').value='';$('rSRes').innerHTML=''}},true);
function renderSurgAppts(){const el=$('qAppt');if(!el)return;if(ROLE!=='surgery'||!QAPPT.length){el.innerHTML='';return}
  el.innerHTML=`<div class="qhead"><h2>نوبت‌های جراحی امروز</h2></div><div class="list">${QAPPT.slice().sort((a,b)=>a.time<b.time?-1:1).map(a=>{const x=QITEMS.find(v=>v.id===a.plan);
    return `<div class="item appt st-${a.st}"><div class="row1"><div><span class="tm">${faD(a.time)}</span><span class="nm">${esc(a.name)}</span><div class="meta">${a.doc?esc(a.doc):''}${a.note?' · '+esc(a.note):''}</div></div>${a.st==='done'?'<span class="pill done">انجام شد</span>':''}</div>
      <div class="acts">${x?`<button class="btn sm" type="button" data-qopen="${esc(x.id)}">${x.queue==='surgery'?'ادامه‌ی ثبت جراحی':'شروع ثبت جراحی'}</button>`:''}${a.plan?`<button class="btn sm ghost" type="button" data-file="${esc(a.plan)}" data-fname="${esc(a.name)}">پرونده</button>`:''}</div></div>`}).join('')}</div>`}

