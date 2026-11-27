/* ---------- psess: «جلسه‌ی پروتز» — full read-only file for the prosthesis doctor + work of this session + lab order ---------- */
const L5W={impr:'قالب‌گیری',rscr:'امتحان رزین پیچ‌شونده',rabt:'امتحان رزین اباتمنت',deliv:'تحویل روکش',other:'سایر'};
var L5=null,QPSESS=[];
async function l5Open(id,name,aid){LOF=[];await openFile(id,name,'pros');if(!PF||PF.id!==id)return;
  if(!PF.j.pros){toast('مرحله‌ی پروتز این بیمار شروع نشده؛ در پرونده «شروع از قالب‌گیری» را بزنید.',1);return}
  L5={id,aid:aid||'',work:'',res:'',note:''};PF.sess=L5;const st=PF.j.pros.stage;L5.work=['heal','tmpd','impr','lab'].includes(st)?'impr':st==='deliv'?'deliv':PR2.TEST&&PR2.TEST.includes(st)?(st==='rabt'?'rabt':'rscr'):'';
  LO=null;renderFile();try{$('pfSheet').querySelector('.in').scrollTop=0}catch(e){}}
function l5Read(){if(!L5)return;const n=$('ps_note');if(n)L5.note=n.value;try{if(LO)loRead()}catch(e){}}
function l5Render(){const {j}=PF,s=L5,name=(fromDoc(PF.id,j.data||{}).h||{}).name||'';$('pfTitle').textContent='جلسه‌ی پروتز · '+name;
  const stg=j.pros?(PSTN[j.pros.stage]||pr2Lbl(j.pros.stage,pr2T(j.pros))||j.pros.stage):'';
  let w=`<section class="l5work"><h3>کار این جلسه</h3><div class="meta">مرحله‌ی فعلی: <b>${esc(stg)}</b></div>
    <div class="chips">${Object.keys(L5W).map(k=>`<button type="button" class="chip" data-l5w="${k}" aria-pressed="${s.work===k}">${L5W[k]}</button>`).join('')}</div>`;
  if(s.work==='rscr'||s.work==='rabt')w+=`<div class="grp"><span>نتیجه‌ی امتحان</span><div class="chips"><button type="button" class="chip" data-l5r="ok" aria-pressed="${s.res==='ok'}">تأیید — مرحله‌ی بعد</button><button type="button" class="chip" data-l5r="redo" aria-pressed="${s.res==='redo'}">اصلاح — برگشت به لابراتوار</button></div></div>`;
  w+=`<label class="f full">توضیح پزشک${s.work==='other'||s.res==='redo'?' (لازم)':' (اختیاری)'}<textarea id="ps_note" rows="2">${esc(s.note||'')}</textarea></label>`;
  if(false){if(!LO)loInit(j);let lf='';try{lf=loForm(j)}catch(e){lf=''}lf=lf.replace(/<div class="btns"><button class="btn" type="button" id="loSend">[\s\S]*?<\/div><\/div>$/,'</div>');w+=lf+'<p class="note">سفارش لابراتوار اختیاری است؛ با «ثبت جلسه بدون سفارش» پرونده به کارتابل منشی می‌رود و بعداً از پرونده سفارش ثبت می‌شود.</p>'}
  w+=`<div class="msg" id="l5Msg"></div></section>`;
  $('pfBody').innerHTML=`<p class="l5ro">پرونده فقط برای دیدن است؛ مشخصات و کارهای انجام‌شده از این صفحه تغییر نمی‌کند.</p>`+h9Sum(j)+w;
  const A=[];if(false)A.push(`<button class="btn main" type="button" id="l5Lab">ثبت جلسه و ارجاع به لابراتوار</button><button class="btn ghost" type="button" id="l5Save">ثبت جلسه بدون سفارش</button>`);else A.push(`<button class="btn main" type="button" id="l5Save">ثبت جلسه</button>`);
  A.push(`<button class="btn ghost sm" type="button" id="l5Full">پرونده‌ی کامل</button><button class="btn ghost sm" id="pfClose" type="button">بستن</button>`);$('pfActs').innerHTML=A.join('')}
(function(){const _r=renderFile;renderFile=function(){if(PF&&PF.sess&&L5&&PF.sess===L5){try{l5Render()}catch(e){console.error(e);PF.sess=null;return _r.apply(this,arguments)}return}return _r.apply(this,arguments)}})();
(function(){const _o=openFile;openFile=async function(){L5=null;return _o.apply(this,arguments)}})();
async function l5Submit(withLab,b){l5Read();const m=$('l5Msg'),s=L5,j=PF.j,err=t=>{m.className='msg err';m.textContent=t;m.scrollIntoView({block:'center'})};
  if(!s.work)return err('کار این جلسه را انتخاب کنید.');if((s.work==='rscr'||s.work==='rabt')&&!s.res)return err('نتیجه‌ی امتحان را بزنید.');if((s.work==='other'||s.res==='redo')&&!String(s.note).trim())return err('توضیح را بنویسید.');
  const p={id:PF.id,aid:s.aid,work:s.work,result:s.res,note:s.note,by:USERNAME||ROLE_LBL[ROLE]};
  if(s.work==='impr'&&LO)p.imp={meth:LO.meth,shade:LO.shade,abut:LO.abut,ret:LO.ret};
  if(withLab){if(!l4HasA(j))return err('اول «تعیین پایه و پونتیک» را بزنید.');if(!LO.due)return err('تاریخ تحویل را درست وارد کنید.');if(!LO.teeth.length)return err('دندان‌های سفارش را انتخاب کنید.');
    p.lid=uuid();p.due=LO.due;p.order={for:LO.for,meth:LO.meth,teeth:LO.teeth,pon:(LO.pon||[]).filter(k=>LO.teeth.includes(k)),type:LO.type,mat:LO.mat,abut:LO.abut,ret:LO.ret,shade:LO.shade,sys:LO.sys,doc:LO.doc,note:LO.note}}
  if(!b.dataset.sid)b.dataset.sid=uuid();p.sendId=b.dataset.sid;
  b.disabled=true;m.className='msg';m.textContent='در حال ثبت…';const files=withLab?LOF.slice():[];
  try{const r=await api('prosSess',p);let bad='';
    for(let i=0;i<files.length;i++){const f=files[i];try{await l2Upload(r.lid,f,/\.(jpe?g|png|webp|heic)$/i.test(f.name)?'photo':'scan',q=>{m.textContent=`بارگذاری فایل ${fa(i+1)} از ${fa(files.length)}: ${f.name} — ${fa(Math.round(q*100))}٪`})}catch(e){bad=f.name+': '+e.message;break}}
    LO=null;LOF=[];const nm=$('pfTitle').textContent;L5=null;PF.sess=null;$('pfSheet').hidden=true;
    if(bad)alertMsg('جلسه ثبت شد و سفارش به لابراتوار رفت، ولی بارگذاری فایل کامل نشد ('+bad+'). از «مراحل، فایل‌ها و اسکن» دوباره بگذارید.');
    toast(withLab?`جلسه ثبت شد و سفارش${files.length?' با '+fa(files.length)+' فایل':''} به لابراتوار رفت.`:(r.msg||'جلسه ثبت شد؛ پرونده به کارتابل منشی رفت.'));
    pollQ(true);try{if(!$('viewPday').hidden)loadPday()}catch(e){}}
  catch(e){err(e.message)}finally{b.disabled=false}}
/* entry points: referral card, prosthesis-day cards, patient name */
(function(){const _p=pdCard;pdCard=function(id,name){return _p.apply(this,arguments).replace('<span class="nm">',`<span class="nm l5nm" data-l5nm="${esc(id)}" data-l5n="${esc(name)}" title="باز کردن جلسه‌ی پروتز">`).replace('<div class="acts">',`<div class="acts">${id?`<button class="btn sm main" type="button" data-l5="${esc(id)}" data-l5n="${esc(name)}">جلسه‌ی پروتز</button>`:''}`)}})();
(function(){const _r=l3RenderRef;l3RenderRef=function(){const r=_r.apply(this,arguments);const b=$('l3Ref');if(b){b.querySelectorAll('[data-l3lab]').forEach(x=>{x.dataset.l5=x.dataset.l3lab;x.dataset.l5n=x.dataset.l3n;delete x.dataset.l3lab;x.textContent='شروع جلسه‌ی پروتز'});b.querySelectorAll('.l3it .nm').forEach((s,i)=>{const p=QPREF[i];if(p){s.classList.add('l5nm');s.dataset.l5nm=p.id;s.dataset.l5n=p.name;s.dataset.aid=p.aid}})}return r}})();
document.addEventListener('click',e=>{const nmEl=e.target.closest&&e.target.closest('[data-l5nm]');if(nmEl&&ROLE&&['surgery','doctor'].includes(ROLE)){l5Open(nmEl.dataset.l5nm,nmEl.dataset.l5n,nmEl.dataset.aid||'');return}
  const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.dataset.l5){e.stopImmediatePropagation();l5Open(t.dataset.l5,t.dataset.l5n,t.dataset.aid||'');return}
  if(!L5||!PF||PF.sess!==L5)return;
  if(t.dataset.l5w){l5Read();L5.work=t.dataset.l5w;L5.res='';renderFile();return}
  if(t.dataset.l5r){l5Read();L5.res=t.dataset.l5r;renderFile();return}
  if(t.id==='l5Lab'){l5Submit(true,t);return}
  if(t.id==='l5Save'){l5Submit(false,t);return}
  if(t.id==='l5Full'){l5Read();PF.sess=null;L5=null;PF.tab='pros';renderFile();return}},true);
document.addEventListener('input',e=>{if(e.target&&e.target.id==='ps_note'&&L5)L5.note=e.target.value});
/* reception: today's prosthesis sessions */
(function(){const _a=applyQueue;applyQueue=function(j){if(j&&!j.same&&j.items)QPSESS=Array.isArray(j.psess)?j.psess:[];return _a.apply(this,arguments)}})();
function l5RenderStaff(){if(ROLE!=='staff')return;const pi=$('piList');if(!pi)return;const sec=pi.closest('.rsec');if(!sec)return;let b=$('l5Sec');
  if(!b){b=document.createElement('div');b.className='rsec';b.dataset.tile='pros';b.id='l5Sec';b.innerHTML='<h3 class="rsh k-pr">جلسه‌های پروتز امروز</h3><div class="list" id="l5List"></div>';sec.parentNode.insertBefore(b,sec)}
  const L=$('l5List');b.hidden=!QPSESS.length;L.innerHTML=QPSESS.map(x=>{const lab=x.lid?(x.lno?`سفارش لابراتوار #${faD(x.lno)} رفت`:'سفارش لابراتوار رفت'):x.work==='impr'?'<b class="late">سفارش لابراتوار ثبت نشد</b>':'';
    return `<div class="item"><div class="row1"><div><span class="nm">${esc(x.name)}</span><div class="meta"><b>${esc(L5W[x.work]||x.work||'')}${x.res?(x.res==='ok'?' — تأیید':' — اصلاح'):''}</b> انجام شد${x.by?' · '+esc(x.by):''}${lab?' · '+lab:''}</div>${x.note?`<div class="meta">${esc(x.note)}</div>`:''}</div>${x.next?'<span class="pill done">نوبت بعدی دارد</span>':x.stage==='done'?'<span class="pill done">تحویل شد</span>':'<span class="pill wait">نوبت بعدی لازم</span>'}</div>
      <div class="acts"><button class="btn sm${x.next?' ghost':' main'}" type="button" data-file="${esc(x.id)}" data-fname="${esc(x.name)}" data-ftab="pros">پرونده و نوبت بعدی</button></div></div>`}).join('')}
(function(){const _r=renderPi;renderPi=function(){const r=_r.apply(this,arguments);try{l5RenderStaff()}catch(e){}return r}})();

