/* ---------- pref: reception → prosthesis doctor → lab order with scans → lab ---------- */
var QPREF=[],L3={plan:'',aid:''},LOF=[],L3SEEN=null;
const l3K=k=>AGRP.pr.includes(k)||AGRP.cp.includes(k)||k==='rpr';
const l3Of=id=>QPREF.find(p=>p.id===id);
(function(){const _a=applyQueue;applyQueue=function(j){if(j&&!j.same&&j.items){QPREF=Array.isArray(j.pref)?j.pref:[];
    if(ROLE==='surgery'){const ids=new Set(QPREF.map(p=>p.id));if(L3SEEN&&QPREF.some(p=>!L3SEEN.has(p.id))){try{beep()}catch(e){}toast('بیمار تازه برای پروتز ارجاع شد.')}L3SEEN=ids}}
  const r=_a.apply(this,arguments);try{if(ROLE==='surgery'&&$('viewPday')&&!$('viewPday').hidden)l3RenderRef();renderTiles()}catch(e){}return r}})();
/* reception: in the patient file (the button on today's appointments is apRefBtn, appointments/appt1) */
(function(){const _p=pfPros;pfPros=function(j,r){let h=_p.apply(this,arguments);
  if(ROLE==='staff'&&CF_ON&&PF){const p=l3Of(PF.id);h=`<div class="l3bar">${p?`<span class="pill rev">امروز نزد پزشک پروتز ارجاع شده${p.by?' · '+esc(p.by):''}</span><button class="btn sm ghost" type="button" data-l3clr="${esc(PF.id)}">لغو ارجاع</button>`:`<button class="btn sm main" type="button" data-l3ref="${esc(PF.id)}">ارجاع به پزشک پروتز</button><small class="note">بیمار بالای کارتابل «پروتز» پزشک می‌آید؛ پزشک دستور کار و اسکن را برای لابراتوار می‌فرستد.</small>`}</div>`+h}
  return h}})();
async function l3Ref(id,aid,b){if(b)b.disabled=true;try{await api('prosRef',{id,aid:aid||'',op:'set',by:USERNAME||ROLE_LBL[ROLE]});toast('به پزشک پروتز ارجاع شد.');await pollQ(true);if(PF&&PF.id===id&&!$('pfSheet').hidden)renderFile()}catch(e){alertMsg(e.message);toast(e.message,1)}finally{if(b)b.disabled=false}}
async function l3Clr(id,b){if(b)b.disabled=true;try{await api('prosRef',{id,op:'clear'});toast('ارجاع برداشته شد.');await pollQ(true);if(PF&&PF.id===id&&!$('pfSheet').hidden)renderFile();if(ROLE==='surgery')l3RenderRef()}catch(e){alertMsg(e.message)}finally{if(b)b.disabled=false}}
/* prosthesis doctor: referred patients on top of «پروتز» */
function l3RenderRef(){const v=$('viewPday');if(!v||ROLE!=='surgery')return;let b=$('l3Ref');if(!b){b=document.createElement('div');b.id='l3Ref';const q=v.querySelector('.qhead');q.after(b)}
  b.innerHTML=QPREF.length?`<div class="qhead"><h2>ارجاع‌شده از پذیرش <small class="note">${fa(QPREF.length)} بیمار</small></h2></div><div class="list">${QPREF.map(p=>`<div class="item l3it"><div class="row1"><div><span class="nm">${esc(p.name)}</span><div class="meta">ارجاع ${esc(jt(p.at).split(' ').pop()||'')}${p.by?' · '+esc(p.by):''}${p.kind?' · نوبت '+esc(AKL[p.kind]||p.kind):' · بدون نوبت'}${p.stage?' · مرحله: '+esc(PSTN[p.stage]||p.stage):''}</div></div><span class="pill wait">منتظر پزشک</span></div>
    <div class="acts"><button class="btn sm main" type="button" data-l3lab="${esc(p.id)}" data-l3n="${esc(p.name)}" data-aid="${esc(p.aid)}">دستور کار و ارجاع به لابراتوار</button><button class="btn sm ghost" type="button" data-file="${esc(p.id)}" data-fname="${esc(p.name)}" data-ftab="pros">پرونده</button>${p.aid?`<button class="btn sm ghost" type="button" data-adoc="${esc(p.aid)}" data-adn="${esc(p.name)}" data-adp="${esc(p.id)}" data-adk="${esc(p.kind)}">ثبت انجام بدون سفارش</button>`:''}<button class="btn sm ghost" type="button" data-l3clr="${esc(p.id)}">پایان ارجاع</button></div></div>`).join('')}</div>`:'';b.hidden=!QPREF.length}
(function(){const _t=TILES.surgery;TILES.surgery=()=>_t().map(t=>t.k==='pros'?Object.assign({},t,{n:(t.n||0)+QPREF.length,s:QPREF.length?fa(QPREF.length)+' بیمار ارجاع‌شده':t.s}):t)})();
async function l3OpenLab(id,name,aid){L3={plan:id,aid:aid||''};LOF=[];await openFile(id,name,'pros');if(!PF||PF.id!==id)return;const pr=PF.j.pros;
  if(!pr){toast('مرحله‌ی پروتز این بیمار شروع نشده؛ در پرونده «شروع از قالب‌گیری» را بزنید.',1);return}
  if(['pause','fail','done'].includes(pr.stage)){toast(pr.stage==='done'?'پروتز این بیمار تحویل شده؛ برای ترمیم از «ثبت مشکل بعد از تحویل» استفاده کنید.':pr.stage==='pause'?'درمان پروتز متوقف است؛ اول «ادامه‌ی درمان» را بزنید.':'شکست ایمپلنت ثبت شده است.',1);return}
  if(!LO)loInit(PF.j);renderFile();setTimeout(()=>{const f=$('lo_files')||$('loSend');if(f)f.closest('.payform').scrollIntoView({behavior:'smooth',block:'start'})},80)}
/* the lab order form: scans + one button */
(function(){const _f=loForm;loForm=function(j){let h=_f.apply(this,arguments);
  const files=`<div class="grp l3files"><span>فایل اسکن و عکس (اختیاری) — STL، PLY، OBJ، ZIP، عکس، PDF</span><label class="btn sm ghost" style="width:fit-content">📎 انتخاب فایل یا عکس<input type="file" id="lo_files" multiple hidden accept=".webm,.ogg,.m4a,.mp3,.wav,.aac,.stl,.ply,.obj,.zip,.rar,.7z,.dcm,.3oxz,.constructioninfo,.jpg,.jpeg,.jfif,.png,.webp,.heic,.heif,.gif,.bmp,.tif,.tiff,.pdf,.mp4,.mov"></label>${LOF.length?`<ul class="l3fl">${LOF.map((f,i)=>`<li><span dir="ltr">${esc(f.name)}</span> <small>${l2Size(f.size)}</small><button class="btn sm ghost" type="button" data-lofx="${i}" aria-label="حذف">×</button></li>`).join('')}</ul>`:''}</div>`;
  h=h.replace('<div class="msg" id="loMsg"></div>',files+'<div class="msg" id="loMsg"></div>').replace('>ارسال سفارش به لابراتوار</button>','>ارجاع به لابراتوار</button>');return h}})();
document.addEventListener('change',e=>{if(e.target&&e.target.id==='lo_files'){loRead();const F=[...e.target.files];for(const f of F){if(f.size>120*1024*1024){alertMsg('حجم «'+f.name+'» بیش از ۱۲۰ مگابایت است.');continue}LOF.push(f)}renderFile()}});
loSend=async function(t){loRead();const m=$('loMsg');if(!LO.due){m.className='msg err';m.textContent='تاریخ تحویل را درست وارد کنید.';return}if(!LO.teeth.length&&!LO.note.trim()){m.className='msg err';m.textContent='دندان‌ها را انتخاب کنید یا در توضیح بنویسید.';return}
  t.disabled=true;if(!t.dataset.sid)t.dataset.sid=uuid();if(!t.dataset.lid)t.dataset.lid=uuid();const pid=PF.id,lid=t.dataset.lid,files=LOF.slice(),doc=LO.doc;
  try{await api('labNew',{id:pid,lid,order:{for:LO.for,meth:LO.meth,teeth:LO.teeth,pon:(LO.pon||[]).filter(k=>LO.teeth.includes(k)),type:LO.type,mat:LO.mat,abut:LO.abut,ret:LO.ret,shade:LO.shade,sys:LO.sys,doc:LO.doc,note:LO.note,by:USERNAME||ROLE_LBL[ROLE]},due:LO.due,sendId:t.dataset.sid})}
  catch(e){m.className='msg err';m.textContent=e.message;t.disabled=false;return}
  let bad='';for(let i=0;i<files.length;i++){const f=files[i];try{await l2Upload(lid,f,/\.(jpe?g|png|webp|heic)$/i.test(f.name)?'photo':'scan',p=>{m.className='msg';m.textContent=`بارگذاری فایل ${fa(i+1)} از ${fa(files.length)}: ${f.name} — ${fa(Math.round(p*100))}٪`})}catch(e){bad=f.name+': '+e.message;break}}
  const ap=L3.plan===pid&&L3.aid?L3.aid:((PF.j.appts||[]).find(a=>a.day===tDay()&&a.st==='set'&&l3K(a.kind))||{}).id;
  if(ap&&ROLE==='surgery'){try{await api('apptSet',{aid:ap,st:'done',doc:USERNAME||doc||''})}catch(e){}}
  try{if(l3Of(pid))await api('prosRef',{id:pid,op:'clear'})}catch(e){}
  LO=null;LOF=[];L3={plan:'',aid:''};
  if(bad){alertMsg('سفارش به لابراتوار رفت ولی بارگذاری فایل کامل نشد ('+bad+'). از «مراحل، فایل‌ها و اسکن» در همین پرونده دوباره بگذارید.');toast('سفارش رفت؛ فایل کامل نشد.',1)}
  else toast(files.length?`سفارش با ${fa(files.length)} فایل به لابراتوار رفت.`:'سفارش به لابراتوار رفت.');
  refreshFile();pollQ(true);try{if(!$('viewPros').hidden)loadPros();if(!$('viewPday').hidden)loadPday()}catch(e){}};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.dataset.l3ref){l3Ref(t.dataset.l3ref,t.dataset.aid,t);return}
  if(t.dataset.l3clr){if(t.dataset.armed!=='1'){t.dataset.armed='1';const o=t.textContent;t.textContent='مطمئنید؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent=o}},4000);return}l3Clr(t.dataset.l3clr,t);return}
  if(t.dataset.l3lab){l3OpenLab(t.dataset.l3lab,t.dataset.l3n,t.dataset.aid);return}
  if(t.dataset.lofx!==undefined){loRead();LOF.splice(Number(t.dataset.lofx),1);renderFile();return}},true);

