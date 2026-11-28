/* ---------- lab7 (owner, 2026-11-03): 4 stage tabs removed (cards get a stage filter); fixes from the lab sweep ---------- */
var L7={stage:'all'};
(function(){const _r=renderLab;renderLab=function(){const r=_r.apply(this,arguments);try{if(ROLE!=='lab'||L5.sec!=='bench'||L6.bv!=='cards')return r;const L=$('lbList');if(!L)return r;
  const rows=LB.items.filter(x=>l4Act(x)&&(L7.stage==='all'||l4F(x)===L7.stage)).sort((a,b)=>((b.st==='redo')-(a.st==='redo'))||(((b.data||{}).prio==='urgent')-((a.data||{}).prio==='urgent'))||String(a.due).localeCompare(String(b.due)));
  const cnt=k=>LB.items.filter(x=>l4Act(x)&&(k==='all'||l4F(x)===k)).length;
  L.innerHTML=l6BenchSeg()+`<div class="l7st"><label class="f">مرحله<select id="l7stage"><option value="all">همه‌ی مراحل (${fa(cnt('all'))})</option>${L4T.map(([k,l])=>`<option value="${k}"${L7.stage===k?' selected':''}>${esc(l)} (${fa(cnt(k))})</option>`).join('')}</select></label><small class="meta">${rows.length?fa(rows.length)+' کار':''}</small></div>`+(rows.length?rows.map(l4Card).join(''):'<div class="empty">کاری در این مرحله نیست.</div>')}catch(e){}return r}})();
document.addEventListener('change',e=>{if(e.target&&e.target.id==='l7stage'){L7.stage=e.target.value;renderLab()}});
/* W4: the lateness of a waiting step counts only its own part */
function l2Late(x,s){const f=l2Dept(s.dept).flags||{},now=Date.now(),pt=s.part||'';
  if(s.st==='pend'){const lim=(+f.acceptMin||0)*6e4+(+f.acceptDay||0)*864e5;if(!lim)return false;const prev=(x.steps||[]).filter(t=>t.idx<s.idx&&(t.part||'')===pt&&t.done_at&&!(t.grp&&t.grp===s.grp)).map(t=>t.done_at).sort().pop()||(x.data||{}).startAt||x.upd;return prev&&now-Date.parse(prev)>lim}
  if(s.st==='acc'){const lim=(+f.doneMin||0)*6e4+(+f.doneDay||0)*864e5;return !!lim&&s.acc_at&&now-Date.parse(s.acc_at)>lim}return false}
/* A3: actions plain staff cannot do are not shown */
const l7Rec=()=>{const me=L2.me||{};return l5Sup()||!!me.recep};
function l7Trim(root){if(!root||l7Rec())return;root.querySelectorAll('[data-l5edit],[data-l6a="renew"],[data-l6a="renewall"],[data-l6a="reproc"],[data-l6a="test"],[data-l6a="finish"]').forEach(b=>b.remove())}

document.addEventListener('keydown',e=>{const t=e.target;if((e.key==='Enter'||e.key===' ')&&t&&t.dataset&&t.dataset.fx2sel&&t.classList.contains('fx2d')){e.preventDefault();t.click()}});
/* fix6a: prosthesis path in the owner's order; after an approved test the order form opens for the next piece */
(function(){const F=['heal','impr','lab','tryin','rabt','frame','deliv','done'];PR2.PATH.fix.splice(0,PR2.PATH.fix.length,...F);PR2.PATH.tmp1.splice(0,PR2.PATH.tmp1.length,'tmpd',...F)})();
const F6_DEFSKIP={fix:['frame'],tmp1:['frame']};
async function f6OpenOrder(id){try{if(!PF||PF.id!==id||$('pfSheet').hidden){await openFile(id,'','pros');if(!PF||PF.id!==id)return}else{const j=await api('get',{id},{timeout:12000});if(!PF||PF.id!==id)return;PF.j=j}
  PF.tab='pros';LO=null;LOF=[];loInit(PF.j);renderFile();setTimeout(()=>{const f=$('loSend');if(f){const p=f.closest('.payform');(p||f).scrollIntoView({behavior:'smooth',block:'start'})}},80);toast('سفارش مرحله‌ی بعد را برای لابراتوار ثبت کنید.')}catch(e){}}
/* fix6a: «سفارش لاب ثبت نشده» — reception (prosthesis tile) and the doctor («پروتز») */
let QF6=[];
{const _a=applyQueue;applyQueue=function(j){if(j&&!j.same&&j.items){QF6=Array.isArray(j.f6no)?j.f6no:[];if(Array.isArray(j.pidle)&&QF6.length){const ids=new Set(QF6.map(x=>x.id));j.pidle=j.pidle.filter(x=>!(x.stage==='lab'&&ids.has(x.id)))}}const r=_a.apply(this,arguments);try{f6RenderStaff();f6RenderSurg()}catch(e){}return r}}
function f6Row(x,act){return `<div class="item task kg-pr"><div class="row1"><div><div class="nm">${esc(x.name||'')}</div><div class="meta">${pr2LabNeedWhy(x)}${x.days?' · '+fa(x.days)+' روز':''}</div></div><span class="pill wait">سفارش لاب ثبت نشده</span></div><div class="acts">${act}</div></div>`}
function f6RenderStaff(){if(ROLE!=='staff')return;const pi=$('piList');if(!pi)return;const sec=pi.closest('.rsec');if(!sec)return;let b=$('f6Sec');
  if(!b){b=document.createElement('div');b.className='rsec';b.dataset.tile='pros';b.id='f6Sec';b.innerHTML='<h3 class="rsh k-pr">سفارش لاب ثبت نشده</h3><p class="note">مرحله‌ی قبل تأیید شده ولی سفارش مرحله‌ی بعد به لابراتوار نرفته است؛ به پزشک پروتز یادآوری کنید.</p><div class="list" id="f6List"></div>';sec.parentNode.insertBefore(b,sec)}
  $('f6List').innerHTML=QF6.length?QF6.map(x=>f6Row(x,(x.phone?tel(x.phone):'')+fileBtn(x.id,x.name,'pros'))).join(''):'<div class="empty">موردی نیست.</div>'}
function f6RenderSurg(){if(ROLE!=='surgery')return;const pd=$('pdList');if(!pd)return;let b=$('f6SecS');
  if(!b){b=document.createElement('div');b.id='f6SecS';pd.parentNode.insertBefore(b,pd)}
  b.hidden=!QLABN.length;b.innerHTML=QLABN.length?`<div class="qhead"><h2>سفارش لاب ثبت نشده <small class="note">${fa(QLABN.length)} بیمار</small></h2></div><div class="list">${QLABN.map(x=>f6Row(x,`<button class="btn sm main" type="button" data-l3lab="${esc(x.id)}" data-l3n="${esc(x.name||'')}" data-aid="">ثبت سفارش لابراتوار</button><button class="btn sm ghost" type="button" data-file="${esc(x.id)}" data-fname="${esc(x.name||'')}" data-ftab="pros">پرونده</button>`)).join('')}</div>`:''}
/* (f6RenderStaff is called from renderPi in reception/patch-walk.js) */
{const _t=TILES.staff;TILES.staff=()=>_t().map(t=>t.k==='pros'?Object.assign({},t,{n:(t.n||0)+QF6.length}):t)}
{const _t=TILES.surgery;TILES.surgery=()=>_t().map(t=>t.k==='pros'?Object.assign({},t,{n:(t.n||0)+QLABN.length,s:QLABN.length&&!(t.n)?fa(QLABN.length)+' سفارش لاب ثبت نشده':t.s}):t)}
/* fix6a: «تحویل شد» while the lab is still making an order asks first */
function f6Confirm(msg){return new Promise(res=>{const s=fxSheet('f6LabSheet',`<h3>⚠ کار لابراتوار هنوز تمام نشده</h3><p>${esc(msg)}</p><p class="note">اگر کار نهایی واقعاً تحویل بیمار شده، «بله، تحویل شد» را بزنید. در غیر این صورت «انصراف» را بزنید تا لابراتوار کار را تمام کند.</p><div class="btns"><button class="btn" type="button" id="f6LabGo" style="flex:1">بله، تحویل شد</button><button class="btn ghost" type="button" id="f6LabNo">انصراف</button></div>`);
  const done=v=>{s.hidden=true;res(v)};$('f6LabGo').onclick=()=>done(true);$('f6LabNo').onclick=()=>done(false)})}
{const _f6=api;api=async function(action,payload={},opt={}){try{return await _f6(action,payload,opt)}catch(e){const m=/^F6LAB\|(\d+)\|([\s\S]*)$/.exec((e&&e.message)||'');if(!m)throw e;
  if(!(await f6Confirm(m[2])))throw new Error('تحویل ثبت نشد؛ کار لابراتوار هنوز باز است.');return await _f6(action,Object.assign({},payload||{},{labAck:1}),opt)}}}
/* fix6a: the order form is pre-filled with the next piece after a test is decided (the first order after an impression is still picked by the doctor) */
{const _i=loInit;loInit=function(j){const r=_i.apply(this,arguments);try{const pr=(j&&j.pros)||{};if(LO&&!LO.for&&pr.stage==='lab'&&pr.after&&LFOR[pr.after])LO.for=pr.after}catch(e){}return r}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-l5r]');if(!t||typeof L5==='undefined'||!L5||!LO||!PF||!PF.j)return;setTimeout(()=>{try{const pr=PF.j.pros||{};let f='';if(t.dataset.l5r==='ok'){const n=pr2Next(pr2T(pr),pr.stage);f=n&&n.st==='lab'&&LFOR[n.for]?n.for:''}else if(t.dataset.l5r==='redo'&&LFOR[pr.stage])f=pr.stage;if(f&&LO.for!==f){LO.for=f;renderFile()}}catch(x){}},0)});

