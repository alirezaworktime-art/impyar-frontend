
/* ---------- lf1: «تعامل لابراتوار و پزشک» (the lab-feedback.ir project inside the implant site) — doctor (user «doctor») reports which work of which clinic for which
   patient has a problem; the lab (user «lab») answers with the root cause; the manager sees everything (read only) and sets the two passwords ---------- */
const LF={d:null,at:0,busy:false,seg:'',open:'',f:null,img:{},q:'',fc:'',fp:'',fs:'',bk:'clinic'};
const LF_ROLES={lfdoc:1,lflab:1};
Object.assign(ROLE_LBL,{lf:'تعامل لابراتوار و پزشک',lfdoc:'پزشک — تعامل با لابراتوار',lflab:'لابراتوار — تعامل با پزشک'});
const LF_ST={lab:'در دست لابراتوار',doc:'منتظر پاسخ پزشک',closed:'خاتمه‌یافته'};
const LF_SLA={normal:48,urgent:24};
const lfLate=c=>c.st==='lab'&&(Date.now()-new Date(c.labSince||c.at).getTime())>LF_SLA[c.pri==='urgent'?'urgent':'normal']*3600e3;
const lfUnread=c=>{if(!LF_ROLES[ROLE])return false;const s=(c.seen||{})[ROLE];const last=(c.thread||[])[c.thread.length-1];return !!last&&last.role!==ROLE&&(!s||s<c.upd)};
const lfCases=()=>(LF.d&&LF.d.cases)||[];
const lfL=()=>(LF.d&&LF.d.lists)||{clinics:[],parts:[],issues:[],causes:[],outcomes:[]};
/* ===== view, login tile, username ===== */
(function(){const o=$('viewOc'),s=document.createElement('section');s.id='viewLf';s.className='wrap';s.style.padding='0';s.hidden=true;s.innerHTML='<div id="lfRoot" class="lf"></div>';if(o&&o.parentNode)o.parentNode.insertBefore(s,o.nextSibling);else document.body.appendChild(s)})();
(function(){const oc=document.querySelector('[data-lrole="oclin"]');if(!oc)return;const b=document.createElement('button');b.type='button';b.className='role';b.dataset.lrole='lf';b.setAttribute('aria-pressed','false');
  b.innerHTML='<span class="ri"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 8h10M7 12h6"/><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span><b>ورود تعامل لابراتوار و پزشک</b><small>کار مشکل‌دار: کدام کلینیک، کدام بیمار</small>';
  oc.parentNode.insertBefore(b,oc.nextSibling);
  const pl=$('lgPwLbl')&&$('lgPwLbl').closest('label');if(pl){const w=document.createElement('label');w.className='f';w.id='lfUserW';w.hidden=true;w.innerHTML='نام کاربری<input id="lf_user" class="ltr" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="doctor یا lab">';pl.parentNode.insertBefore(w,pl)}})();
function lfLgUi(){const on=LROLE==='lf',w=$('lfUserW');if(!w)return;w.hidden=!on;if(on){let u='';try{u=localStorage.getItem('implantLfU')||''}catch(e){}if(!$('lf_user').value)$('lf_user').value=u;if(!$('lf_user').value)$('lf_user').focus()}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-lrole]');if(t)setTimeout(lfLgUi,0)});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#lgGo');if(!t||LROLE!=='lf')return;e.preventDefault();e.stopImmediatePropagation();lfLogin()},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||LROLE!=='lf'||!e.target||!['lg_pw','lf_user'].includes(e.target.id))return;e.preventDefault();e.stopImmediatePropagation();if(e.target.id==='lf_user')$('lg_pw').focus();else lfLogin()},true);
async function lfLogin(){const m=$('lgMsg'),u=$('lf_user').value.trim().toLowerCase(),pw=$('lg_pw').value;
  if(u!=='doctor'&&u!=='lab'){m.className='msg err';m.textContent='نام کاربری را درست بنویسید (doctor یا lab).';$('lf_user').focus();return}
  if(!pw){m.className='msg err';m.textContent='رمز عبور را بنویسید.';$('lg_pw').focus();return}
  m.className='msg';m.textContent='در حال ورود…';API.pw='lf|'+u+'|'+pw;
  try{const j=await api('ping');if(j.role!==(u==='lab'?'lflab':'lfdoc')){API.pw='';saveApi();m.className='msg err';m.textContent='نام کاربری یا رمز عبور اشتباه است.';return}
    pwRemember('lf',pw);try{localStorage.setItem('implantLfU',u)}catch(e){}LF.d=null;LF.open='';enter(j)}
  catch(e){API.pw='';saveApi();LROLE='lf';lfLgUi();m.className='msg err';m.textContent=/رمز عبور اشتباه/.test(e.message)?'نام کاربری یا رمز عبور اشتباه است.':e.message}}
/* ===== role plumbing (same pattern as «سایر کلینیک‌ها») ===== */
(function(){const _a=applyRole;applyRole=function(){_a.apply(this,arguments);if(LF_ROLES[ROLE]){try{$('attBtn').hidden=true}catch(e){}}}})();
(function(){const _s=showExtra;showExtra=function(v){_s(v);const el=$('viewLf');if(el)el.hidden=v!=='lf'}})();
(function(){const _h=home;home=function(){if(!LF_ROLES[ROLE])return _h.apply(this,arguments);show('lf');goTile((TSAVE&&TSAVE[ROLE])||'')}})();
(function(){const _p=pollQ;pollQ=function(f){if(LF_ROLES[ROLE]){if(f||Date.now()-LF.at>25000)lfLoad(true);return Promise.resolve()}return _p.apply(this,arguments)}})();
(function(){const _l=logout;logout=function(){LF.d=null;LF.open='';LF.f=null;LF.img={};const r=_l.apply(this,arguments);try{lfLgUi()}catch(e){}return r}})();
TILES.lfdoc=()=>{const C=lfCases();return [
  {k:'lfnew',c:'surg',l:'ثبت مشکل تازه',s:'کار کدام کلینیک و کدام بیمار مشکل دارد',n:0,lseg:'new'},
  {k:'lfrep',c:'cons',l:'پاسخ‌های لابراتوار',s:'منتظر پاسخ شما',n:C.filter(c=>c.st==='doc').length,lseg:'rep'},
  {k:'lfver',c:'chk',l:'منتظر تأیید شما',s:'لابراتوار خاتمه داده؛ رضایت یا نارضایتی',n:C.filter(c=>c.st==='closed'&&!c.verdict).length,lseg:'ver'},
  {k:'lflab',c:'lab',l:'در دست لابراتوار',s:'ارسال‌شده و منتظر لابراتوار',n:C.filter(c=>c.st==='lab').length,lseg:'lab'},
  {k:'lfall',c:'arch',l:'همه‌ی پرونده‌ها',s:'جستجو، گزارش و خروجی اکسل',n:0,lseg:'all'}]};
TILES.lflab=()=>{const C=lfCases(),q=C.filter(c=>c.st==='lab');return [
  {k:'lfq',c:'surg',l:'صف لابراتوار',s:q.length?`${fa(q.filter(c=>c.pri==='urgent').length)} فوری · ${fa(q.filter(lfLate).length)} عقب‌افتاده`:'مشکل‌های رسیده از پزشک',n:q.length,lseg:'q'},
  {k:'lfdoc',c:'cons',l:'نزد پزشک',s:'پاسخ داده‌اید؛ منتظر پزشک',n:C.filter(c=>c.st==='doc').length,lseg:'doc'},
  {k:'lfdone',c:'fin',l:'خاتمه‌یافته',s:'با نتیجه و رضایت پزشک',n:C.filter(c=>c.st==='closed').length,lseg:'done'},
  {k:'lfall',c:'arch',l:'همه‌ی پرونده‌ها',s:'جستجو، گزارش و خروجی اکسل',n:0,lseg:'all'}]};
try{const _t=TILES.manager;TILES.manager=()=>_t().concat([{k:'lfm',c:'lab',l:'تعامل لابراتوار و پزشک',s:'مشکل کارهای لابراتوار (فقط دیدن)',n:0,lseg:'all'}])}catch(e){}
(function(){const _g=goTile;goTile=function(k,opt={}){const L=tileList(),t=L.find(x=>x.k===k)||(LF_ROLES[ROLE]?L[0]:null);if(!t||!t.lseg)return _g.apply(this,arguments);
  if(typeof dirty!=='undefined'&&dirty&&!$('viewForm').hidden)return;TILE=t.k;TSAVE[ROLE]=TILE;try{localStorage.setItem('implantTile',JSON.stringify(TSAVE))}catch(e){}document.body.dataset.tile=TILE;
  LF.seg=t.lseg;LF.open='';show('lf');renderTiles();if(!opt.keep)window.scrollTo(0,0);lfRender();lfLoad(!!LF.d)}})();
async function lfLoad(soft){if(LF.busy)return;if(soft&&LF.d&&Date.now()-LF.at<4000)return;LF.busy=true;
  try{const j=await api('lf',{op:'list'},{prio:soft?'poll':''});LF.d=j;LF.at=Date.now()}catch(e){if(!soft)toast(e.message,1)}finally{LF.busy=false}
  try{renderTiles()}catch(e){}lfRender(true)}
/* ===== render ===== */
function lfRender(soft){const el=$('lfRoot');if(!el||$('viewLf').hidden)return;
  if(soft){const a=document.activeElement;if(LF.seg==='new'||LF.open||(a&&el.contains(a)&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)))return}
  if(!LF.d){el.innerHTML='<div class="card"><p class="note">در حال بارگذاری…</p></div>';return}
  if(LF.open){const c=lfCases().find(x=>x.id===LF.open);if(c){el.innerHTML=lfDetailHTML(c);lfImgFill();return}LF.open=''}
  el.innerHTML=LF.seg==='new'&&ROLE==='lfdoc'?lfFormHTML():lfListHTML();if(LF.seg==='new')lfTeethPaint()}
const LF_SEGT={rep:'پاسخ‌های لابراتوار — منتظر پاسخ شما',ver:'منتظر تأیید شما',lab:'در دست لابراتوار',q:'صف لابراتوار',doc:'نزد پزشک',done:'خاتمه‌یافته',all:'همه‌ی پرونده‌ها'};
function lfSegList(){const C=lfCases(),s=LF.seg;
  if(s==='rep'||s==='doc')return C.filter(c=>c.st==='doc');if(s==='ver')return C.filter(c=>c.st==='closed'&&!c.verdict);
  if(s==='lab'||s==='q')return C.filter(c=>c.st==='lab').sort((a,b)=>(b.pri==='urgent')-(a.pri==='urgent')||String(a.labSince).localeCompare(String(b.labSince)));
  if(s==='done')return C.filter(c=>c.st==='closed');
  const q=toEn(LF.q||'').trim();return C.filter(c=>(!LF.fc||c.clinic===LF.fc)&&(!LF.fp||c.part===LF.fp)&&(!LF.fs||c.st===LF.fs)&&(!q||[c.patient,c.clinic,c.part,c.issue,String(c.no),c.desc].some(v=>toEn(String(v||'')).includes(q))))}
const lfOpt=(L,v,all)=>`<option value="">${all}</option>`+L.map(x=>`<option${x===v?' selected':''}>${esc(x)}</option>`).join('');
function lfRow(c){const late=lfLate(c),un=lfUnread(c);
  return `<button type="button" class="lfrow${un?' un':''}" data-lfopen="${esc(c.id)}"><span class="lfno">${fa(c.no)}</span>
   <span class="lfmain"><b>${esc(c.patient)}</b> <small>${esc(c.clinic)}</small><span class="lfsub">${esc(c.part)} · ${esc(c.issue)} · دندان ${fa((c.teeth||[]).join('، '))}</span></span>
   <span class="lftags">${c.pri==='urgent'?'<i class="lft u">فوری</i>':''}${late?'<i class="lft l">عقب‌افتاده</i>':''}${un?'<i class="lft n">تازه</i>':''}<i class="lft s-${c.st}">${esc(LF_ST[c.st]||'')}${c.st==='closed'&&c.verdict==='ok'?' · تأیید پزشک':''}</i><small>${esc(jt(c.upd))}</small></span></button>`}
function lfListHTML(){const L=lfSegList(),all=LF.seg==='all',ls=lfL();
  let h=`<div class="card lfcard"><div class="lfhd"><h2>${esc(LF_SEGT[LF.seg]||'')}${L.length?` <small>(${fa(L.length)})</small>`:''}</h2>${ROLE==='lfdoc'&&LF.seg!=='new'?'<button class="btn sm" type="button" data-lfgo="lfnew">+ ثبت مشکل تازه</button>':''}</div>`;
  if(all)h+=`<div class="fields lff"><label class="f">جستجو<input id="lfQ" value="${esc(LF.q)}" placeholder="نام بیمار، شماره، توضیح…" autocomplete="off"></label>
    <label class="f">کلینیک<select id="lfFc">${lfOpt(ls.clinics,LF.fc,'همه')}</select></label><label class="f">نوع کار<select id="lfFp">${lfOpt(ls.parts,LF.fp,'همه')}</select></label>
    <label class="f">وضعیت<select id="lfFs"><option value="">همه</option>${Object.keys(LF_ST).map(k=>`<option value="${k}"${k===LF.fs?' selected':''}>${LF_ST[k]}</option>`).join('')}</select></label></div>
    <div class="btns"><button class="btn sm ghost" type="button" id="lfXl"${L.length?'':' disabled'}>خروجی اکسل همین فهرست</button>${LF.q||LF.fc||LF.fp||LF.fs?'<button class="btn sm ghost" type="button" id="lfClr">پاک کردن فیلترها</button>':''}</div>`;
  h+=L.length?`<div class="lflist" id="lfList">${L.map(lfRow).join('')}</div>`:`<p class="empty">${all&&(LF.q||LF.fc||LF.fp||LF.fs)?'پرونده‌ای با این فیلترها نیست.':'موردی نیست.'}</p>`;
  h+='</div>';if(all)h+=lfReportHTML(L);return h}
const LF_BK={clinic:['کلینیک',c=>c.clinic],part:['نوع کار',c=>c.part],issue:['نوع ایراد',c=>c.issue],cause:['علت اصلی (لابراتوار)',c=>c.cause],outcome:['نتیجه',c=>c.outcome]};
function lfReportHTML(L){if(!L.length)return '';const f=LF_BK[LF.bk]||LF_BK.clinic,m={};L.forEach(c=>{const k=f[1](c)||'— ثبت نشده';m[k]=(m[k]||0)+1});
  const R=Object.entries(m).sort((a,b)=>b[1]-a[1]),mx=R[0][1],open=L.filter(c=>c.st!=='closed').length,late=L.filter(lfLate).length,ok=L.filter(c=>c.verdict==='ok').length;
  return `<div class="card lfcard"><h3>گزارش</h3><div class="lfkp"><span><b>${fa(L.length)}</b>پرونده</span><span><b>${fa(open)}</b>باز</span><span><b>${fa(late)}</b>عقب‌افتاده</span><span><b>${fa(ok)}</b>تأیید پزشک</span></div>
   <div class="chips" role="group" aria-label="تفکیک بر اساس">${Object.keys(LF_BK).map(k=>`<button class="chip" type="button" data-lfbk="${k}" aria-pressed="${k===LF.bk}">${LF_BK[k][0]}</button>`).join('')}</div>
   <div class="lfbars">${R.map(([k,n])=>`<div class="lfbar"><span>${esc(k)}</span><i style="width:${Math.max(4,Math.round(n/mx*100))}%"></i><b>${fa(n)}</b></div>`).join('')}</div></div>`}
function lfXl(){const L=lfSegList();const head=['شماره','تاریخ ثبت','کلینیک','بیمار','نوع کار','نوع ایراد','دندان‌ها','اولویت','وضعیت','علت اصلی','نتیجه','تأیید پزشک','آخرین تغییر','توضیح پزشک'];
  const rows=L.map(c=>[c.no,jt(c.at),c.clinic,c.patient,c.part,c.issue,(c.teeth||[]).join('، '),c.pri==='urgent'?'فوری':'عادی',LF_ST[c.st]||'',c.cause||'',c.outcome||'',c.verdict==='ok'?'بله':'',jt(c.upd),c.desc||'']);
  xlsx([{title:'تعامل لابراتوار و پزشک',sub:'تهیه‌شده '+jt(new Date().toISOString()),head,rows}],'lab-feedback-'+tDay()+'.xlsx')}
/* ===== new case (doctor) ===== */
const LF_UP=[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28],LF_LO=[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
const lfBlank=()=>({clinic:'',patient:'',part:'',issue:'',pri:'normal',teeth:[],desc:'',ship:false,images:[]});
const lfChips=(name,L,v)=>`<div class="chips" role="radiogroup" data-lfch="${name}">${L.map(x=>`<button class="chip" type="button" role="radio" data-lfc="${esc(x)}" aria-pressed="${x===v}" aria-checked="${x===v}">${esc(x)}</button>`).join('')}</div>`;
function lfFormHTML(){const f=LF.f||(LF.f=lfBlank()),ls=lfL();
  return `<div class="card lfcard"><div class="lfhd"><h2>ثبت مشکل تازه</h2><small>${esc(USERNAME||'')}</small></div>
   <div class="lfq"><span>کلینیک</span>${lfChips('clinic',ls.clinics,f.clinic)}</div>
   <div class="fields"><label class="f">نام بیمار<input id="lfPat" maxlength="120" value="${esc(f.patient)}" autocomplete="off"></label></div>
   <div class="lfq"><span>نوع کار</span>${lfChips('part',ls.parts,f.part)}</div>
   <div class="lfq"><span>نوع ایراد</span>${lfChips('issue',ls.issues,f.issue)}</div>
   <div class="lfq"><span>شماره‌ی دندان (FDI)</span><div class="lfteeth" id="lfTeeth"><div>${LF_UP.map(n=>`<button type="button" data-lft="${n}">${fa(n)}</button>`).join('')}</div><div>${LF_LO.map(n=>`<button type="button" data-lft="${n}">${fa(n)}</button>`).join('')}</div></div>
    <div class="btns lftq"><button class="btn sm ghost" type="button" data-lftq="up">کل فک بالا</button><button class="btn sm ghost" type="button" data-lftq="lo">کل فک پایین</button><button class="btn sm ghost" type="button" data-lftq="clr">پاک کردن</button></div></div>
   <div class="lfq"><span>اولویت</span>${lfChips('pri',['عادی','فوری'],f.pri==='urgent'?'فوری':'عادی')}</div>
   <div class="fields"><label class="f">توضیح ایراد<textarea id="lfDesc" rows="4" maxlength="4000">${esc(f.desc)}</textarea></label></div>
   <label class="pwshow"><input type="checkbox" id="lfShip"${f.ship?' checked':''}> کار فیزیکی هم به لابراتوار فرستاده می‌شود</label>
   ${lfPicsHTML('f',f.images)}
   <div class="msg" id="lfFMsg"></div>
   <div class="btns"><button class="btn" type="button" id="lfSend" style="flex:1">ارسال به لابراتوار</button><button class="btn ghost" type="button" id="lfReset">شروع از نو</button></div></div>`}
function lfTeethPaint(){const f=LF.f;if(!f)return;document.querySelectorAll('[data-lft]').forEach(b=>b.setAttribute('aria-pressed',String(f.teeth.includes(+b.dataset.lft))))}
const lfPicsHTML=(w,L)=>`<div class="lfpics" data-lfpw="${w}">${(L||[]).map((d,i)=>`<span class="lfpic"><img src="${d}" alt="عکس ${fa(i+1)}"><button type="button" class="lfpx" data-lfpx="${w}:${i}" aria-label="حذف عکس ${fa(i+1)}">×</button></span>`).join('')}
  ${(L||[]).length<6?`<label class="btn sm ghost lfpadd">افزودن عکس<input type="file" accept="image/*" multiple data-lfpin="${w}" hidden></label>`:''}</div>`;
/* photos are shrunk on the phone (long side 1600 px, jpeg) before they are sent */
function lfShrink(file){return new Promise((ok,no)=>{if(!/^image\//.test(file.type||'')){no(new Error('فقط عکس قابل افزودن است.'));return}const u=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{const k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);
    let q=.82,d=c.toDataURL('image/jpeg',q);while(d.length>1000000&&q>.4){q-=.12;d=c.toDataURL('image/jpeg',q)}ok(d)};im.onerror=()=>{URL.revokeObjectURL(u);no(new Error('این عکس باز نشد.'))};im.src=u})}
/* ===== one case ===== */
const LF_WHO={lfdoc:'پزشک',lflab:'لابراتوار'};
function lfDetailHTML(c){const ls=lfL(),me=ROLE,late=lfLate(c);
  const info=[['کلینیک',c.clinic],['بیمار',c.patient],['نوع کار',c.part],['نوع ایراد',c.issue],['دندان‌ها',fa((c.teeth||[]).join('، '))],['پزشک',c.doctor],['تاریخ ثبت',jt(c.at)],['اولویت',c.pri==='urgent'?'فوری':'عادی'],
    ['کار فیزیکی',c.shipped?'فرستاده شد '+jt(c.shipped.at)+(c.received?' · دریافت شد '+jt(c.received.at):' · هنوز دریافت نشده'):'فرستاده نشده']];
  let h=`<div class="card lfcard"><div class="lfhd"><button class="btn sm ghost" type="button" id="lfBack">→ بازگشت</button><h2>پرونده‌ی ${fa(c.no)} — ${esc(c.patient)}</h2>
   <span class="lftags">${c.pri==='urgent'?'<i class="lft u">فوری</i>':''}${late?'<i class="lft l">عقب‌افتاده</i>':''}<i class="lft s-${c.st}">${esc(LF_ST[c.st]||'')}${c.verdict==='ok'?' · تأیید پزشک':''}</i></span></div>
   <dl class="lfinfo">${info.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v||'—')}</dd></div>`).join('')}</dl>
   <div class="btns">${me==='lfdoc'&&!c.shipped&&c.st!=='closed'?`<button class="btn sm ghost" type="button" data-lfship="shipped">ثبت ارسال کار فیزیکی</button>`:''}${me==='lflab'&&c.shipped&&!c.received&&c.st!=='closed'?`<button class="btn sm ghost" type="button" data-lfship="received">ثبت دریافت کار فیزیکی</button>`:''}<button class="btn sm ghost" type="button" id="lfCopy">کپی خلاصه</button></div></div>
   <div class="card lfcard"><h3>تاریخچه‌ی پرونده</h3><ol class="lfth">${(c.thread||[]).map(e=>`<li class="lfe r-${e.role}"><div class="lfeh"><b>${esc(e.by||LF_WHO[e.role]||'')}</b><small>${esc(jt(e.at))}</small></div><div class="lfea">${esc(e.act||'')}</div>
     ${e.cause?`<div class="lfem">علت اصلی: <b>${esc(e.cause)}</b>${e.outcome?' · نتیجه: <b>'+esc(e.outcome)+'</b>':''}</div>`:''}${e.text?`<p>${esc(e.text)}</p>`:''}
     ${(e.images||[]).length?`<div class="lfpics">${e.images.map(id=>`<button type="button" class="lfpic" data-lfzoom="${esc(id)}"><img data-lfimg="${esc(id)}" alt="عکس پیوست"></button>`).join('')}</div>`:''}</li>`).join('')}</ol></div>`;
  return h+lfActHTML(c,ls)}
function lfActHTML(c,ls){const me=ROLE,a=LF.a&&LF.a.id===c.id?LF.a:(LF.a={id:c.id,text:'',cause:'',outcome:'',images:[]});
  const tx=(l,ph)=>`<div class="fields"><label class="f">${l}<textarea id="lfAt" rows="3" maxlength="4000" placeholder="${ph||''}">${esc(a.text)}</textarea></label></div>${lfPicsHTML('a',a.images)}<div class="msg" id="lfAMsg"></div>`;
  if(me==='lflab'&&c.st==='lab')return `<div class="card lfcard lfact"><h3>پاسخ لابراتوار</h3>
    <div class="lfq"><span>علت اصلی ایراد</span>${lfChips('cause',ls.causes,a.cause)}</div>
    <div class="lfq"><span>نتیجه (فقط برای خاتمه‌ی پرونده)</span>${lfChips('outcome',ls.outcomes,a.outcome)}</div>${tx('متن پاسخ','چه شد و چه می‌کنید؛ برای «خاتمه» اختیاری')}
    <div class="btns"><button class="btn" type="button" data-lfact="toDoc" style="flex:1">ارسال پاسخ به پزشک</button><button class="btn ghost" type="button" data-lfact="close">خاتمه‌ی پرونده</button></div></div>`;
  if(me==='lfdoc'&&c.st==='doc')return `<div class="card lfcard lfact"><h3>پاسخ شما به لابراتوار</h3>${tx('متن پاسخ')}<div class="btns"><button class="btn" type="button" data-lfact="toLab" style="flex:1">ارسال دوباره به لابراتوار</button></div></div>`;
  if(me==='lfdoc'&&c.st==='closed'&&!c.verdict)return `<div class="card lfcard lfact"><h3>لابراتوار پرونده را خاتمه داد — نظر شما</h3>${tx('توضیح (برای نارضایتی لازم است)')}
    <div class="btns"><button class="btn" type="button" data-lfact="ok" style="flex:1">رضایت — تأیید نهایی</button><button class="btn ghost danger" type="button" data-lfact="nok">نارضایتی — بازگشت به لابراتوار</button></div></div>`;
  const why=c.st==='closed'?(c.verdict==='ok'?'این پرونده با تأیید پزشک بسته شده است.':'منتظر تأیید پزشک است.'):c.st==='lab'?'پرونده در دست لابراتوار است.':'پرونده منتظر پاسخ پزشک است.';
  return `<div class="card lfcard"><p class="note">${why}</p></div>`}
function lfImgFill(){document.querySelectorAll('img[data-lfimg]').forEach(async im=>{const id=im.dataset.lfimg;if(im.src)return;if(LF.img[id]){im.src=LF.img[id];return}
  try{const r=await api('lf',{op:'img',id},{prio:'bg'});LF.img[id]=r.d;document.querySelectorAll(`img[data-lfimg="${id}"]`).forEach(x=>x.src=r.d)}catch(e){im.alt='عکس باز نشد'}})}
function lfSummary(c){return [`پرونده‌ی ${c.no} — ${LF_ST[c.st]||''}`,`کلینیک: ${c.clinic}`,`بیمار: ${c.patient}`,`نوع کار: ${c.part} · ایراد: ${c.issue}`,`دندان‌ها: ${(c.teeth||[]).join('، ')}`,`توضیح: ${c.desc||''}`].join('\n')}
/* ===== events ===== */
function lfOpen(id){LF.open=id;lfRender();window.scrollTo(0,0);const c=lfCases().find(x=>x.id===id);if(c&&lfUnread(c)){c.seen=Object.assign({},c.seen||{},{[ROLE]:new Date().toISOString()});api('lf',{op:'seen',id},{prio:'bg'}).catch(()=>{});try{renderTiles()}catch(e){}}}
document.addEventListener('click',async e=>{const root=$('lfRoot');if(!root||!root.contains(e.target))return;const t=e.target.closest('button');if(!t)return;
  if(t.dataset.lfopen){lfOpen(t.dataset.lfopen);return}
  if(t.id==='lfBack'){LF.open='';lfRender();return}
  if(t.dataset.lfgo){goTile(t.dataset.lfgo);return}
  if(t.dataset.lfbk){LF.bk=t.dataset.lfbk;lfRender();return}
  if(t.id==='lfClr'){LF.q=LF.fc=LF.fp=LF.fs='';lfRender();return}
  if(t.id==='lfXl'){try{lfXl()}catch(err){toast(err.message,1)}return}
  if(t.dataset.lfc!==undefined){const g=t.closest('[data-lfch]').dataset.lfch,v=t.dataset.lfc;
    if(LF.open){const a=LF.a;a[g]=a[g]===v?'':v}else{const f=LF.f;if(g==='pri')f.pri=v==='فوری'?'urgent':'normal';else f[g]=v}
    t.closest('[data-lfch]').querySelectorAll('[data-lfc]').forEach(b=>{const on=b===t&&!(LF.open&&!LF.a[g]);b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-checked',String(on))});return}
  if(t.dataset.lft){const n=+t.dataset.lft,f=LF.f;f.teeth=f.teeth.includes(n)?f.teeth.filter(x=>x!==n):f.teeth.concat(n);lfTeethPaint();return}
  if(t.dataset.lftq){const f=LF.f,q=t.dataset.lftq;f.teeth=q==='clr'?[]:[...new Set(f.teeth.concat(q==='up'?LF_UP:LF_LO))];lfTeethPaint();return}
  if(t.dataset.lfpx){const [w,i]=t.dataset.lfpx.split(':'),o=w==='f'?LF.f:LF.a;o.images.splice(+i,1);lfPicsRe(w);return}
  if(t.dataset.lfzoom){const d=LF.img[t.dataset.lfzoom];if(!d)return;const s=fxSheet('lfZoom',`<img class="lfbig" src="${d}" alt="عکس پیوست"><div class="btns"><button class="btn ghost" type="button" data-fxclose="lfZoom" onclick="fxClose('lfZoom')">بستن</button></div>`);s.classList.add('lfzs');return}
  if(t.id==='lfCopy'){const c=lfCases().find(x=>x.id===LF.open);if(!c)return;try{await navigator.clipboard.writeText(lfSummary(c));toast('خلاصه کپی شد.')}catch(err){toast('کپی نشد؛ مرورگر اجازه نداد.',1)}return}
  if(t.id==='lfReset'){if(!t.dataset.armed){t.dataset.armed='1';t.textContent='مطمئنید؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='شروع از نو'}},4000);return}LF.f=lfBlank();lfRender();return}
  if(t.id==='lfSend'){lfSendNew(t);return}
  if(t.dataset.lfship){const id=LF.open;t.disabled=true;try{await api('lf',{op:'ship',id,field:t.dataset.lfship});await lfLoad();toast(t.dataset.lfship==='shipped'?'ارسال کار فیزیکی ثبت شد.':'دریافت کار فیزیکی ثبت شد.')}catch(err){toast(err.message,1);t.disabled=false}return}
  if(t.dataset.lfact){lfDoAct(t);return}
});
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.id)return;
  if(t.id==='lfPat'&&LF.f)LF.f.patient=t.value;else if(t.id==='lfDesc'&&LF.f)LF.f.desc=t.value;else if(t.id==='lfAt'&&LF.a)LF.a.text=t.value;
  else if(t.id==='lfQ'){LF.q=t.value;clearTimeout(LF.qt);LF.qt=setTimeout(()=>{const p=t.selectionStart;lfRender();const n=$('lfQ');if(n){n.focus();try{n.setSelectionRange(p,p)}catch(err){}}},250)}});
document.addEventListener('change',async e=>{const t=e.target;if(!t)return;
  if(t.id==='lfShip'&&LF.f){LF.f.ship=t.checked;return}
  if(t.id==='lfFc'||t.id==='lfFp'||t.id==='lfFs'){LF[t.id==='lfFc'?'fc':t.id==='lfFp'?'fp':'fs']=t.value;lfRender();return}
  if(t.dataset&&t.dataset.lfpin){const w=t.dataset.lfpin,o=w==='f'?LF.f:LF.a;if(!o)return;const files=[...t.files];t.value='';
    for(const f of files){if(o.images.length>=6){toast('حداکثر ۶ عکس در هر پیام.',1);break}try{o.images.push(await lfShrink(f))}catch(err){toast(err.message,1)}}lfPicsRe(w)}});
function lfPicsRe(w){const o=w==='f'?LF.f:LF.a,el=document.querySelector(`[data-lfpw="${w}"]`);if(!el||!o)return;const d=document.createElement('div');d.innerHTML=lfPicsHTML(w,o.images);el.replaceWith(d.firstElementChild)}
async function lfSendNew(btn){const f=LF.f,m=$('lfFMsg'),bad=t=>{m.className='msg err';m.textContent=t};
  if(!f.clinic)return bad('کلینیک را انتخاب کنید.');if(!f.patient.trim())return bad('نام بیمار را بنویسید.');if(!f.part)return bad('نوع کار را انتخاب کنید.');if(!f.issue)return bad('نوع ایراد را انتخاب کنید.');
  if(!f.teeth.length)return bad('دست‌کم یک دندان را انتخاب کنید.');if(!f.desc.trim())return bad('توضیح ایراد را بنویسید.');
  btn.disabled=true;m.className='msg';m.textContent=f.images.length?'در حال ارسال عکس‌ها…':'در حال ارسال…';
  try{const r=await api('lf',Object.assign({op:'new'},f));LF.f=lfBlank();toast(`پرونده‌ی ${fa(r.no)} به لابراتوار فرستاده شد.`);await lfLoad();goTile('lflab')}
  catch(err){bad(err.message)}finally{if(btn.isConnected)btn.disabled=false}}
async function lfDoAct(btn){const k=btn.dataset.lfact,a=LF.a,m=$('lfAMsg'),bad=t=>{m.className='msg err';m.textContent=t};if(!a)return;
  if(ROLE==='lflab'&&!a.cause)return bad('علت اصلی ایراد را انتخاب کنید.');if(k==='close'&&!a.outcome)return bad('برای خاتمه، نتیجه را انتخاب کنید.');
  if(!a.text.trim()&&k!=='close'&&k!=='ok')return bad(k==='nok'?'دلیل نارضایتی را بنویسید.':'متن پاسخ را بنویسید.');
  if((k==='close'||k==='nok')&&!btn.dataset.armed){btn.dataset.armed='1';const o=btn.textContent;btn.textContent='مطمئنید؟ دوباره بزنید';setTimeout(()=>{if(btn.isConnected){delete btn.dataset.armed;btn.textContent=o}},4000);return}
  btn.disabled=true;m.className='msg';m.textContent='در حال ثبت…';
  try{await api('lf',{op:'act',id:a.id,k,text:a.text,cause:a.cause,outcome:a.outcome,images:a.images});LF.a=null;
    toast({toDoc:'پاسخ برای پزشک فرستاده شد.',close:'پرونده خاتمه یافت.',toLab:'پاسخ برای لابراتوار فرستاده شد.',ok:'پرونده با رضایت شما بسته شد.',nok:'پرونده به لابراتوار برگشت.'}[k]);await lfLoad()}
  catch(err){bad(err.message);if(btn.isConnected)btn.disabled=false}}
/* ===== manager: the two passwords, in «کاربران» beside the other shared passwords ===== */
(function(){const m=$('uaRoleMsg');if(!m)return;const d=document.createElement('div');d.className='lfpw';
  d.innerHTML=`<div class="fields"><label class="f">رمز تازه‌ی تعامل لابراتوار و پزشک — نام کاربری doctor (حداقل ۴ حرف)<input id="ua_lfdoc" type="password" autocomplete="new-password"></label></div><div class="btns"><button class="btn" type="button" data-lfpwset="doctor" data-rpin2="ua_lfdoc">ثبت رمز تازه‌ی doctor</button></div>
   <div class="fields"><label class="f">رمز تازه‌ی تعامل لابراتوار و پزشک — نام کاربری lab (حداقل ۴ حرف)<input id="ua_lflab" type="password" autocomplete="new-password"></label></div><div class="btns"><button class="btn" type="button" data-lfpwset="lab" data-rpin2="ua_lflab">ثبت رمز تازه‌ی lab</button></div>`;
  m.parentNode.insertBefore(d,m)})();
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('[data-lfpwset]');if(!t)return;const who=t.dataset.lfpwset,i=$(t.dataset.rpin2),m=$('uaRoleMsg'),v=i?i.value:'';
  if(v.length<4){m.className='msg err';m.textContent=`رمز ${who} حداقل ۴ حرف باشد.`;return}
  t.disabled=true;try{await api('lfPw',{who,pw:v});i.value='';m.className='msg ok';m.textContent=`رمز ${who} در تعامل لابراتوار و پزشک عوض شد؛ رمز قبلی از همین حالا کار نمی‌کند.`}catch(err){m.className='msg err';m.textContent=err.message}finally{t.disabled=false}});
/* a reload while signed in as doctor/lab: the boot ran before this script, so open the section now */
if(LF_ROLES[ROLE]){try{applyRole();home()}catch(e){}}
