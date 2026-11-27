/* ---------- lab4 (owner, 2026-10-28): lab cartable = 4 stage tabs (the prosthesis doctor picks the stage), «آماده و ارسال»,
   floating «+ کار جدید» (Hani sheet + stage, site patient or another clinic) and «جست‌وجو»; internal steps hidden ---------- */
Object.keys(LFOR).forEach(k=>{if(!['tryin','rabt','deliv'].includes(k))delete LFOR[k]});LFOR.tryin='رزین پیچ‌شونده';LFOR.rabt='رزین اباتمنت';LFOR.deliv='کار نهایی';LFOR.abut='اباتمنت';
const L4T=[['tryin','رزین پیچ‌شونده'],['rabt','رزین اباتمنت'],['deliv','کار نهایی'],['abut','اباتمنت']];
const l4F=x=>{const f=(x.data||{}).for;return f==='rabt'||f==='deliv'||f==='abut'?f:'tryin'};
const l4Act=x=>['new','recv','making','redo'].includes(x.st);
const l4Lbl=k=>(L4T.find(t=>t[0]===k)||[,''])[1];
const l4Num=v=>String(v||'').replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c));
var L4N=null;
TILES.lab=()=>L4T.map(([k,l],i)=>({k:'s_'+k,c:['lab','surg','cons','pros'][i],l,s:'کارهای این مرحله',n:LB.items.filter(x=>l4Act(x)&&l4F(x)===k).length,seg:'s_'+k}));
TCOUNT.lab=L4T.map(t=>'s_'+t[0]);
/* l4Card: base + lab5 (badges, «ویرایش») + lab7 (no «ویرایش» for plain staff) */
function l4Card(x){const d=x.data||{};let h=l2Card(x);
  h=h.replace('<div class="meta">دندان‌ها:',`<div class="meta l4st">مرحله: <b>${esc(l4Lbl(l4F(x)))}</b>${d.clinic?' · کلینیک <b>'+esc(d.clinic)+'</b>':''}</div><div class="meta">دندان‌ها:`);
  h=h.replace('class="item labcard l2c','class="item labcard l4c l2c');const b=l5Badges(x);if(b)h=h.replace('<div class="meta l4st">',`<div class="l5bds">${b}</div><div class="meta l4st">`);
  h=h.replace('<button class="btn sm ghost" type="button" data-l2prt=',`<button class="btn sm ghost" type="button" data-l5edit="${esc(x.id)}">ویرایش</button><button class="btn sm ghost" type="button" data-l2prt=`);
  return l7Rec()?h:h.replace(/<button class="btn sm ghost" type="button" data-l5edit="[^"]*">ویرایش<\/button>/,'')}
function l4Fab(){let f=$('l4Fab');if(!f){f=document.createElement('div');f.id='l4Fab';f.innerHTML='<button type="button" class="btn main" data-l4new>＋ کار جدید</button><button type="button" class="btn" data-l4find>جست‌وجو</button>';document.body.appendChild(f)}
  f.hidden=ROLE!=='lab'||$('viewLab').hidden}
renderLab=function(){if(ROLE!=='lab')return;if(!/^s_/.test(LB.seg)||!l4Lbl(LB.seg.slice(2)))LB.seg='s_tryin';const k=LB.seg.slice(2);
  const nw=LB.items.filter(x=>x.st==='new'||x.st==='redo').length,b=$('labBadge');if(b){b.hidden=!nw;b.textContent=fa(nw)}document.title=(nw?`(${fa(nw)}) `:'')+'سفارش‌های لابراتوار';
  try{renderTiles()}catch(e){}l4Fab();
  const rows=LB.items.filter(x=>l4Act(x)&&l4F(x)===k).sort((a,b)=>((b.st==='redo')-(a.st==='redo'))||(((b.data||{}).prio==='urgent')-((a.data||{}).prio==='urgent'))||String(a.due).localeCompare(String(b.due)));
  $('lbList').innerHTML=`<h3 class="pf-h l4h">${esc(l4Lbl(k))} <small class="meta">${rows.length?fa(rows.length)+' کار':''}</small></h3>`+(rows.length?rows.map(l4Card).join(''):'<div class="empty">کاری در این مرحله نیست.</div>')};
/* order sheet: Hani steps stay; show the stage and clinic */
(function(){const _r=l2Render;l2Render=function(){const r=_r.apply(this,arguments);try{const box=$('l2In'),o=L2.ord.order,d=o.data||{};const p=box&&box.querySelector('.l2info');
  if(p&&!box.querySelector('.l4st'))p.insertAdjacentHTML('beforebegin',`<div class="meta l4st">مرحله: <b>${esc(l4Lbl(l4F(o)))}</b>${d.clinic?' · کلینیک <b>'+esc(d.clinic)+'</b>':''}</div>`)}catch(e){}return r}})();
/* «دریافت و شروع کار» in the «رزین پیچ‌شونده» tab: the short resin process is preselected */
const L4RS=990001;
async function l4Ready(lid,t){if(!t.dataset.armed){t.dataset.armed='1';const o=t.textContent;t.textContent='دوباره بزنید تا ارسال شود';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent=o}},4000);return}
  t.disabled=true;try{await api('labSet',{lid,st:'ready',by:USERNAME||'لابراتوار'});toast('کار آماده شد و به کلینیک ارسال شد.');const s=$('l2Sheet');if(s&&!s.hidden&&L2.ord&&L2.ord.id===lid){s.hidden=true;L2.ord=null}const q=$('l4sSheet');if(q&&!q.hidden)l4Find(true);pollLab(true)}
  catch(e){alertMsg(e.message);t.disabled=false}}
/* search */
let L4Q={q:'',t:null,n:0};
function l4Search(){const s=mkSheet('l4sSheet',`<h3>جست‌وجوی کار</h3><label class="f">نام بیمار یا شماره کار<input id="l4q" autocomplete="off" placeholder="مثلاً رضایی یا ۱۰۰۲" value="${esc(L4Q.q)}"></label><div class="list" id="l4sRes"></div><div class="btns"><button class="btn ghost" type="button" id="l4sX">بستن</button></div>`);
  s.hidden=false;$('l4sX').onclick=()=>{s.hidden=true};const i=$('l4q');i.oninput=()=>{L4Q.q=i.value;clearTimeout(L4Q.t);L4Q.t=setTimeout(()=>l4Find(),300)};setTimeout(()=>i.focus(),50);l4Find()}
async function l4Find(){const box=$('l4sRes');if(!box)return;const q=l4Num(L4Q.q).trim(),n=++L4Q.n;if(!q){box.innerHTML='<div class="empty">نام بیمار یا شماره‌ی کار را بنویسید.</div>';return}
  try{const j=await api('lab4Find',{q});if(n!==L4Q.n)return;box.innerHTML=(j.items||[]).length?j.items.map(l4Card).join('').replace(/data-l2open=/g,'data-l4open='):'<div class="empty">کاری پیدا نشد.</div>'}catch(e){box.innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
/* new work */
/* l4New: base + lab5, lab8 (load the lab5 data, then draw again) */
function l4New(){LOF=[];L4N={pid:'',mode:'site',pq:'',res:[],clinic:'',n:0,t:null};
  LO={teeth:[],all:[],pon:[],type:'',mat:'',abut:'',ret:'',shade:'',meth:'',sys:'',doc:'',note:'',due:dAdd(tDay(),10),for:'',F:L4T.map(t=>t[0])};
  LO.h9={doc:'',brand:'',asst:'',name:'',file:'',day:jDay(tDay()),shade:'',age:'',photo:'',crown:[],imp:[],itype:[],imat:[],base:[],pon:[],draw:'',drawN:0};
  const s=mkSheet('l4nSheet','<h3>ایجاد کار جدید</h3><div id="l4nBody"></div><div class="msg" id="l4nMsg"></div><div class="btns"><button class="btn" type="button" id="l4nSave">ثبت کار</button><button class="btn ghost" type="button" id="l4nX">انصراف</button></div>');
  s.classList.add('l4nsheet');s.hidden=false;$('l4nX').onclick=()=>{s.hidden=true;L4N=null;LO=null;LOF=[]};$('l4nSave').onclick=e=>l4Save(e.currentTarget);l4nRender();
  l5Boot().then(()=>{if(L4N)l4nRender()}).catch(()=>{});l5Boot(true).then(()=>{if(L4N)l4nRender()}).catch(()=>{})}
function l4nRead(){if(!L4N)return;const c=$('l4cl');if(c)L4N.clinic=c.value;const q=$('l4pq');if(q)L4N.pq=q.value}
function l4nPats(){if(!L4N||!L4N.res.length)return L4N&&L4N.pq.trim().length>1?'<div class="meta">بیماری با این نام پیدا نشد.</div>':'';return L4N.res.map((p,i)=>`<button type="button" class="btn sm ghost l4pp" data-l4pick="${i}">${esc(p.name)}${p.age?' · '+esc(faD(p.age)):''}${p.doc?' · '+esc(p.doc):''}</button>`).join('')}
/* l4nRender: base + lab5 (طرف حساب select) + lab8 (l8L4n: centers and doctors) + m36 (another clinic: stage beside the impression method, photo kind) */
function l4nRender(fresh){try { if (L4N && LO && L4N.mode === 'ext' && !L4N.m36m) { L4N.m36m = 1; if (!LO.meth) LO.meth = 'scan' } } catch (e) { }
  form:{const body=$('l4nBody');if(!body||!L4N||!LO)break form;l4nRead();if(!fresh)try{h9Read()}catch(e){}const sc=body.closest('.in'),top=sc?sc.scrollTop:0,N=L4N,H=LO.h9;
  const pat=N.mode==='site'?(N.pid?`<div class="l4pick"><b>${esc(H.name)}</b> <small class="meta">بیمار پرونده‌دار سایت</small> <button type="button" class="btn sm ghost" data-l4unpick>تغییر بیمار</button></div>`
      :`<input id="l4pq" autocomplete="off" placeholder="نام یا کد ملی بیمار را بنویسید" value="${esc(N.pq)}"><div class="l4pr" id="l4pr">${l4nPats()}</div>`)
    :`<label class="f">نام کلینیک<input id="l4cl" value="${esc(N.clinic)}" placeholder="مثلاً کلینیک ارکیده"></label><small class="note">نام بیمار و پزشک را در برگه‌ی پایین بنویسید.</small>`;
  let sheet=h9HTML({data:{},pros:{},surg:{}}).replace(/<span>ساخت برای:<\/span>[\s\S]*?(?=<span>روش قالب‌گیری:)/,'');
  const files=`<div class="h9drop" id="h9Drop" role="button" tabindex="0" aria-label="انتخاب فایل اسکن یا عکس" data-l8d="1"><b>بارگذاری فایل اسکن / عکس</b><span>برای انتخاب فایل اینجا بزنید، یا فایل را بکشید و اینجا رها کنید</span></div><div class="grp l3files"><span>STL، PLY، OBJ، ZIP، عکس، PDF (اختیاری)</span><label class="btn sm ghost" style="width:fit-content">📎 انتخاب فایل یا عکس<input type="file" id="lo_files" multiple hidden accept=".stl,.ply,.obj,.zip,.rar,.7z,.dcm,.3oxz,.constructioninfo,.jpg,.jpeg,.jfif,.png,.webp,.heic,.heif,.gif,.bmp,.tif,.tiff,.pdf,.mp4,.mov"></label>${LOF.length?`<ul class="l3fl">${LOF.map((f,i)=>`<li><span dir="ltr">${esc(f.name)}</span> <small>${l2Size(f.size)}</small><button class="btn sm ghost" type="button" data-lofx="${i}" aria-label="حذف">×</button></li>`).join('')}</ul>`:''}</div>`;
  body.innerHTML=`<div class="grp l4stage"><span>مرحله‌ی کار <small class="note">(کار در همین تب می‌نشیند)</small></span><div class="chips">${L4T.map(([k,l])=>`<button type="button" class="chip" data-lofor="${k}" aria-pressed="${LO.for===k}">${l}</button>`).join('')}</div></div>
    <div class="grp"><span>بیمار</span><div class="seg l4mode"><button type="button" data-l4m="site" aria-pressed="${N.mode==='site'}">بیمار پرونده‌دار سایت</button><button type="button" data-l4m="ext" aria-pressed="${N.mode==='ext'}">بیمار کلینیک دیگر</button></div>${pat}</div>
    <div class="payform h9form">${sheet}${files}</div>`;
  const q=$('l4pq');if(q)q.oninput=()=>{N.pq=q.value;clearTimeout(N.t);N.t=setTimeout(async()=>{const n=++N.n,v=l4Num(N.pq).trim();if(v.length<2){N.res=[];const r=$('l4pr');if(r)r.innerHTML='';return}
    try{const j=await api('lab4Pats',{q:v});if(n!==N.n||!L4N)return;N.res=j.items||[];const r=$('l4pr');if(r)r.innerHTML=l4nPats()}catch(e){}},300)};
  if(sc)sc.scrollTop=top}
  try{if(L4N&&ROLE==='lab'){const body=$('l4nBody');if(body&&!body.querySelector('#l5nac')){
  const g=body.querySelector('.l4mode');if(g)g.closest('.grp').insertAdjacentHTML('afterend',`<div class="grp"><span>طرف حساب</span><select id="l5nac"><option value="">${L4N.mode==='site'?'— طرف حساب کلینیک خودمان —':'— انتخاب طرف حساب —'}</option>${l5AcctOpts(L4N.acct||'')}</select></div>`);
  const s=$('l5nac');if(s)s.onchange=()=>{L4N.acct=s.value;const a=l5Acct(s.value);const c=$('l4cl');if(a&&c&&!c.value)c.value=a.clinic||a.name}}}}catch(e){}
  try{if(L4N&&ROLE==='lab')l8L4n()}catch(e){console.error('lab8 l4n',e)}
  try { const body = $('l4nBody'); if (!body || !L4N || !LO) return; const ext = L4N.mode === 'ext', form = body.querySelector('.h9form');
    const st = body.querySelector('.l4stage'), mt = form && [...form.querySelectorAll('span')].find(s => /روش قالب‌گیری/.test(s.textContent));
    if (st && mt && mt.parentElement && !form.contains(st)) { const lab = st.querySelector('span'); if (lab) lab.innerHTML = 'مرحله‌ی کار:'; st.classList.add('m36stage'); mt.parentElement.insertAdjacentElement('beforebegin', st) }
    const due = form && form.querySelector('#lo_due'), sch = due && due.closest('.h9sch'); if (sch) sch.hidden = ext;
    body.querySelectorAll('[data-lometh]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lometh === LO.meth));
    const fl = body.querySelector('.l3files'); if (fl && !body.querySelector('#m36pk')) { const k = L4N.m36pk || 'ophoto'; fl.insertAdjacentHTML('afterend', `<div class="grp" id="m36pk"><span>عکس‌هایی که بارگذاری می‌کنید چه هستند؟</span><div class="seg"><button type="button" data-m36pk="ophoto" aria-pressed="${k === 'ophoto'}">عکس دستورکار</button><button type="button" data-m36pk="pphoto" aria-pressed="${k === 'pphoto'}">عکس بیمار</button></div></div>`) }
    if (ext) { const n = body.querySelector('.l4mode ~ small.note, .l4mode ~ .note'); const c = $('l4cl'); if (c && !body.querySelector('#m36free')) c.closest('label').insertAdjacentHTML('afterend', '<small class="note" id="m36free">هیچ خانه‌ای الزامی نیست؛ هر چه دارید پر کنید.</small>') }
  } catch (e) { console.error('m36 l4n', e) }}
(function(){const _rf=renderFile;renderFile=function(){const s=$('l4nSheet');if(L4N&&s&&!s.hidden){l4nRender();return}return _rf.apply(this,arguments)}})();
function l4Pick(p){const H=LO.h9,M=p.map||{},K=Object.keys(M);L4N.pid=p.id;H.name=p.name||'';H.age=p.age||'';if(p.doc&&!H.doc)H.doc=p.doc;if(p.brand)H.brand=p.brand;
  H.base=(K.length?K.filter(k=>M[k]==='a'):(p.imp||[])).filter(isTooth);H.pon=K.filter(k=>M[k]==='p').filter(isTooth);try{h9Apply()}catch(e){}l4nRender(true)}
/* l4Save: base + lab5 (طرف حساب, required colour) + lab7 (the cards view follows the new work's stage) + lab8 (l8Check) + m36 (another clinic: m36SaveExt; photo kind while uploading) */
async function l4Save(b){if(L4N&&LO&&L4N.mode==='ext')return m36SaveExt(b);M36.upk=(L4N&&L4N.m36pk)||'ophoto';
  try{if(L4N&&LO&&!l8Check('l4nMsg'))return;const seg=LB.seg;
  save:{const S=(L5.boot||{}).set||{};if(L4N){const s=$('l5nac');if(s)L4N.acct=s.value;if(L4N.mode==='ext'&&L4N.acct&&!String(L4N.clinic||'').trim()){const a=l5Acct(L4N.acct),c=$('l4cl');if(a&&c){c.value=a.clinic||a.name}}}
  if(Number(S.color_required)&&LO&&LO.h9){try{h9Read()}catch(e){}if(!String(LO.h9.shade||'').trim()){const m=$('l4nMsg');if(m){m.className='msg err';m.textContent='رنگ کار را انتخاب کنید (در تنظیمات الزامی است).'}break save}}
  const m=$('l4nMsg'),err=t=>{m.className='msg err';m.textContent=t;m.scrollIntoView({block:'center'})};if(!L4N||!LO)break save;
  if(V9&&V9.on){err('اول ضبط صدا را تمام کنید.');break save}
  l4nRead();try{h9Read();h9Apply()}catch(e){}const H=LO.h9,N=L4N;
  if(!LFOR[LO.for]||!l4Lbl(LO.for)){err('مرحله‌ی کار را انتخاب کنید.');break save}
  if(N.mode==='site'&&!N.pid){err('بیمار را جست‌وجو و انتخاب کنید، یا «بیمار کلینیک دیگر» را بزنید.');break save}
  if(N.mode==='ext'){if(!String(H.name||'').trim()){err('نام بیمار را در برگه بنویسید.');break save}if(!String(N.clinic||'').trim()){err('نام کلینیک را بنویسید.');break save}}
  if(!LO.due){err('تاریخ تحویل را درست وارد کنید.');break save}
  if(!LO.teeth.length&&!H.draw&&!v9Files().length){err('دندان‌ها (پایه/پونتیک) را روی برگه بزنید یا توضیح بنویسید.');break save}
  b.disabled=true;if(!b.dataset.sid)b.dataset.sid=uuid();if(!b.dataset.lid)b.dataset.lid=uuid();const lid=b.dataset.lid,f0=LO.for;
  let files=LOF.slice();try{const sh=await h9Sheet();files.unshift(sh)}catch(e){}files=files.concat(v9Files());
  m.className='msg';m.textContent='در حال ثبت…';
  try{const r=await api('lab4New',{id:N.mode==='site'?N.pid:'',name:H.name,clinic:N.mode==='ext'?N.clinic:'',lid,due:LO.due,sendId:b.dataset.sid,
      order:{for:LO.for,meth:LO.meth,teeth:LO.teeth,pon:(LO.pon||[]).filter(k=>LO.teeth.includes(k)),type:LO.type,mat:LO.mat,abut:LO.abut,ret:LO.ret,shade:LO.shade,sys:LO.sys,doc:LO.doc||H.doc,note:LO.note,by:USERNAME||'لابراتوار'}});
    let bad='';for(let i=0;i<files.length;i++){const f=files[i];try{await l2Upload(lid,f,/\.(jpe?g|png|webp|heic)$/i.test(f.name)?'photo':'scan',q=>{m.textContent=`بارگذاری فایل ${fa(i+1)} از ${fa(files.length)}: ${f.name} — ${fa(Math.round(q*100))}٪`})}catch(e){bad=f.name+': '+e.message;break}}
    $('l4nSheet').hidden=true;L4N=null;LO=null;LOF=[];LB.seg='s_'+f0;TILE='s_'+f0;
    if(bad)alertMsg('کار ثبت شد ولی بارگذاری فایل کامل نشد ('+bad+'). از «جزئیات و فایل‌ها» دوباره بگذارید.');
    toast(`کار #${l2No(r.no)} در تب «${l4Lbl(f0)}» ثبت شد.`);pollLab(true)}
  catch(e){err(e.message);b.disabled=false}}
  try{if(LB.seg!==seg&&/^s_/.test(LB.seg)&&L7.stage!=='all')L7.stage=LB.seg.slice(2)}catch(e){}}finally{M36.upk=''}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-l4new],[data-l4find],[data-l4ready],[data-l4open],[data-l4m],[data-l4pick],[data-l4unpick]');if(!t)return;
  if(t.hasAttribute('data-l4new')){l4New();return}
  if(t.hasAttribute('data-l4find')){l4Search();return}
  if(t.dataset.l4ready){e.stopPropagation();l4Ready(t.dataset.l4ready,t);return}
  if(t.dataset.l4open){const q=$('l4sSheet');if(q)q.hidden=true;l2Open(t.dataset.l4open);return}
  if(!L4N)return;
  if(t.dataset.l4m){l4nRead();L4N.mode=t.dataset.l4m;l4nRender();return}
  if(t.dataset.l4pick!==undefined){const p=L4N.res[Number(t.dataset.l4pick)];if(p)l4Pick(p);return}
  if(t.hasAttribute('data-l4unpick')){L4N.pid='';L4N.res=[];L4N.pq='';LO.h9.name='';LO.h9.age='';LO.h9.base=[];LO.h9.pon=[];l4nRender(true);return}});
/* the prosthesis doctor must pick the stage */
(function(){const _i=loInit;loInit=function(){const r=_i.apply(this,arguments);try{if(LO)LO.for=''}catch(e){}return r};
  const _s=loSend;loSend=async function(t){if(LO&&!LFOR[LO.for]){const m=$('loMsg');if(m){m.className='msg err';m.textContent='«ساخت برای» را انتخاب کنید: رزین پیچ‌شونده، رزین اباتمنت، کار نهایی یا اباتمنت.'}return}return _s.apply(this,arguments)};
  const _l=l5Submit;l5Submit=async function(withLab,b){if(withLab&&LO&&!LFOR[LO.for]){const m=$('l5Msg');if(m){m.className='msg err';m.textContent='در برگه‌ی دستورکار «ساخت برای» را انتخاب کنید: رزین پیچ‌شونده، رزین اباتمنت، کار نهایی یا اباتمنت.';m.scrollIntoView({block:'center'})}return}return _l.apply(this,arguments)}})();

