/* ---------- fx2: archive stage filters · per-section calendars for reception · forgotten files with dated visits and payments · Jalali date picker ---------- */
/* ---- 1. archive: one filter per stage ---- */
var FX2F=[['all','همه'],['draft','پیش‌نویس'],['wait','در انتظار پزشک'],['cons','مشاوره'],['conf','تأییدشده، منتظر جراحی'],['surg','در جراحی'],['settle','منتظر تسویه'],['sdone','جراحی‌شده'],['tmp','موقت فوری'],['heal','ترمیم و آنکاوری'],['impr','قالب‌گیری'],['lab','لابراتوار'],['try','امتحان پروتز'],['deliv','منتظر تحویل'],['done','تحویل‌شده'],['stop','متوقف یا شکست'],['und','تصمیم‌نگرفته'],['lost','انصراف']];
function fx2Key(d){const q=d.queue||'',p=d.pst||'';
  if(q==='undecided')return 'und';if(q==='lost')return 'lost';if(d.settle==='pending')return 'settle';
  if(p){if(p==='done')return 'done';if(p==='deliv')return 'deliv';if(p==='lab')return 'lab';if(p==='impr')return 'impr';if(p==='heal')return 'heal';if(p==='tmpd'||p==='tmpx')return 'tmp';if(p==='fail'||p==='pause')return 'stop';return 'try'}
  if(q==='surgery'||q==='surgpart')return 'surg';if(q==='surgdone')return 'sdone';
  if(q==='consult'||q==='consulting')return 'cons';if(d.status==='queued'||q==='waiting'||q==='reviewing')return 'wait';if(d.status==='draft')return 'draft';return 'conf'}
/* renderFilt: archive-filters base replaced by fx2 (one filter per stage) */
function renderFilt(){const el=$('lFilt');if(!el)return;const n={};ARCHIVE.forEach(d=>{const k=fx2Key(d);n[k]=(n[k]||0)+1});n.all=ARCHIVE.length;if(LFILT!=='all'&&!n[LFILT])LFILT='all';
  el.innerHTML=FX2F.filter(([k])=>k==='all'||n[k]).map(([k,l])=>`<button type="button" class="chip" data-lfilt="${k}" aria-pressed="${LFILT===k}">${l} <span class="cnt">${fa(n[k]||0)}</span></button>`).join('')}
/* ---- 2. forgotten (paper) files: big button on top of the archive ---- */
/* fxArcBar: fx1 base replaced by fx2 (big button) */
function fxArcBar(){const el=$('fxArcBar');if(!el)return;const n=(ARCHIVE||[]).filter(d=>d.arc).length;
  el.innerHTML=(fxCanFile()?'<button class="btn fx2big" type="button" id="fxArcNew"><b>+ افزودن پرونده‌ی جا مانده</b><small>بیماران قبلی و پرونده‌های کاغذی — همه‌ی اطلاعات، درمان‌ها و پرداخت‌ها به تفکیک تاریخ</small></button>':'')+`<button class="chip" type="button" id="fxArcOnly" aria-pressed="${FXARC}">فقط پرونده‌های جا مانده / کاغذی (${fa(n)})</button>`}
var FX2SVC=null;
const FX2M={cash:'نقد',card:'کارت',bank:'واریز بانکی',chq:'چک'};
const fx2Num=v=>Number(toEn(String(v||'')).replace(/[^\d]/g,''))||0;
function fx2VisitRow(x,i){const dl=x.dayJ!==undefined?x.dayJ:(x.day?jDay(x.day):'');
  return `<div class="fx2v" data-fx2v="${i}">
   <label>تاریخ *<input data-v="day" placeholder="۱۴۰۲/۰۵/۱۰" value="${esc(dl)}"></label>
   <label class="w2">کار انجام‌شده<input data-v="svc" list="fx2Svcs" value="${esc(x.svc||'')}" placeholder="مثلاً جراحی ایمپلنت، تحویل روکش"></label>
   <label>دندان‌ها<input data-v="teeth" value="${esc(x.teeth||'')}" placeholder="۳۶، ۳۷"></label>
   <label>پزشک<input data-v="doc" list="fxDocs" value="${esc(x.doc||'')}"></label>
   <label>هزینه (تومان)<input data-v="cost" inputmode="numeric" value="${x.cost?esc(faD(String(x.cost))):''}"></label>
   <label>پرداختی (تومان)<input data-v="paid" inputmode="numeric" value="${x.paid?esc(faD(String(x.paid))):''}"></label>
   <label>روش پرداخت<select data-v="method">${Object.keys(FX2M).map(k=>`<option value="${k}"${k===(x.method||'cash')?' selected':''}>${FX2M[k]}</option>`).join('')}</select></label>
   <label>شماره چک / پیگیری<input data-v="no" value="${esc(x.no||'')}"></label>
   <label class="w2">توضیح<input data-v="note" value="${esc(x.note||'')}"></label>
   <button class="btn sm ghost x" type="button" data-fx2vrm="${i}" aria-label="حذف این مراجعه">✕</button></div>`}
function fx2VisitsHtml(A){const V=A.visits||[];const C=V.reduce((s,x)=>s+fx2Num(x.cost),0),P=V.reduce((s,x)=>s+fx2Num(x.paid),0);
  return `<h4 style="margin:6px 0 0">مراجعات، درمان‌ها و پرداخت‌ها به تفکیک تاریخ</h4><p class="note">هر ردیف یک روز مراجعه است. هزینه و پرداختی‌ها در پرونده‌ی بیمار و حسابداری ثبت می‌شوند (به‌عنوان مانده‌ی قبلی بیمار، نه موجودی صندوق امروز).</p>
   <datalist id="fx2Svcs">${(FX2SVC||[]).map(s=>`<option value="${esc(s)}">`).join('')}</datalist>
   <div id="fx2Vis">${V.map(fx2VisitRow).join('')||'<p class="note">مراجعه‌ای وارد نشده.</p>'}</div>
   <button class="btn sm ghost" type="button" id="fx2VAdd">+ مراجعه / پرداخت</button>
   <p class="note" id="fx2Sum">جمع هزینه ${fa(C)} · جمع پرداختی ${fa(P)} · مانده ${fa(C-P)} تومان</p>`}
function fx2VisitsRead(){return [...document.querySelectorAll('#fxArcSheet .fx2v')].map(r=>{const v=k=>(r.querySelector('[data-v="'+k+'"]')||{}).value||'';
  return {dayJ:v('day').trim(),day:parseJ(v('day')),svc:v('svc').trim(),teeth:v('teeth').trim(),doc:v('doc').trim(),cost:fx2Num(v('cost')),paid:fx2Num(v('paid')),method:v('method')||'cash',no:v('no').trim(),note:v('note').trim()}})}
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#fx2Vis'))return;const el=$('fx2Sum');if(!el)return;const V=fx2VisitsRead(),C=V.reduce((s,x)=>s+x.cost,0),P=V.reduce((s,x)=>s+x.paid,0);el.textContent=`جمع هزینه ${fa(C)} · جمع پرداختی ${fa(P)} · مانده ${fa(C-P)} تومان`});
/* ---- 3. reception: each section has its own week / month calendar ---- */
var FX2CV=(()=>{try{return JSON.parse(localStorage.getItem('implantFx2Cv')||'{}')}catch(e){return {}}})(),FX2A={};
const FX2T={plan:{ap:a=>a.kind==='visit'||kGrp(a.kind)==='ot',tk:[]},fol:{ap:()=>false,tk:['fol1','fol4','fol3','numb','week','pweek']},surg:{ap:a=>SG_K.includes(a.kind),tk:['book']},sdone:{ap:a=>SG_K.includes(a.kind)&&a.st==='done',tk:[]},chk:{ap:a=>kGrp(a.kind)==='ck',tk:['suture']},unc:{ap:a=>a.kind==='uncover',tk:['uncover','recall']},pros:{ap:a=>kGrp(a.kind)==='pr',tk:['labready','impr','pcall','pfail','repair']},/* cv3: */bkd:{ap:()=>true,tk:[]}};
const fx2Range=(m,anc)=>m==='month'?jMonth(anc):[weekStart(anc),dAdd(weekStart(anc),6)];
async function fx2Appts(from,to){const k=from+'|'+to,c=FX2A[k];if(c&&Date.now()-c.t<30000)return c.items;try{const j=await api('apptList',{from,to});FX2A={[k]:{t:Date.now(),items:j.items||[]}};return j.items||[]}catch(e){return c?c.items:[]}}
/* cv2: */function cv2Panel(st,m,from,to,A,T){const s=st.sel;if(!s||s<from||s>to)return '';
  const L=A.filter(a=>a.day===s).sort((x,y)=>(x.time||'99')<(y.time||'99')?-1:1),K=T.filter(t=>t.due===s);
  const stl=a=>a.st==='done'?'<span class="cv2s dn">انجام شد</span>':a.st==='noshow'?'<span class="cv2s ns">نیامد</span>':'<span class="cv2s">در انتظار</span>';
  const nm=(id,n)=>id?`<button type="button" class="nm" data-file="${esc(id)}" data-fname="${esc(n||'')}">${esc(n||'—')}</button>`:`<b>${esc(n||'—')}</b>`;
  const rows=L.map(a=>`<div class="cv2r"><span class="tm">${a.time?faD(a.time):'—'}</span><span>${nm(a.plan,a.name)}<br><small>${esc(AKL[a.kind]||a.kind||'')}${a.note?' · '+esc(a.note):''}</small></span>${stl(a)}${a.phone?`<a class="ph" href="tel:${esc(a.phone)}">${faD(a.phone)}</a>`:'<span></span>'}</div>`).join('');
  const tks=K.map(t=>`<div class="cv2r"><span class="tm">کار</span><span>${nm(t.plan,t.name)}<br><small>${esc((TLBL[t.kind]||[t.kind])[0])}</small></span><span></span><span></span></div>`).join('');
  return `<div class="cv2p" id="cv2P"><div class="cv2h"><b>${esc(wDayS(s))} ${esc(jDay(s))}</b><small>${fa(L.length)} نوبت${K.length?' · '+fa(K.length)+' کار':''}</small>${m==='month'?`<button type="button" class="btn sm ghost" data-fx2day="${s}">هفته‌ی این روز</button>`:''}${ROLE==='staff'&&s>=tDay()?`<button type="button" class="btn sm" data-bk1day="${s}">+ نوبت در این روز</button>`:''}<button type="button" class="btn sm ghost x" data-fx2sel="" aria-label="بستن">✕</button></div>${rows||tks?rows+tks:'<div class="empty">برای این روز نوبتی در این بخش ثبت نشده است.</div>'}</div>`}
async function fx2CalRender(){const host=$('rAll'),box=$('fx2Cal');if(!box||!host)return;const k=TILE,st=FX2CV[k]||{},m=st.m;if(!m||m==='list'||!FX2T[k])return;
  const anc=st.a||tDay(),[from,to]=fx2Range(m,anc),def=FX2T[k],A=(await fx2Appts(from,to)).filter(a=>a.st!=='cancel'&&def.ap(a)),T=(TASKS||[]).filter(t=>!t.done&&def.tk.includes(t.kind)&&t.due>=from&&t.due<=to);
  if(!$('fx2Cal')||TILE!==k)return;
  const by={};A.forEach(a=>(by[a.day]=by[a.day]||[]).push({t:a.time||'',h:`${a.time?faD(a.time)+' ':''}${esc(a.name||'')} · ${esc(AKL[a.kind]||a.kind)}`,id:a.plan,n:a.name,c:'k-'+kGrp(a.kind)+(a.st==='done'?' dn':a.st==='noshow'?' ns':'')}));
  T.forEach(t=>(by[t.due]=by[t.due]||[]).push({t:'99',h:`${esc(t.name||'')} · ${esc((TLBL[t.kind]||[t.kind])[0])}`,id:t.plan,n:t.name,c:'tk'}));
  Object.values(by).forEach(L=>L.sort((x,y)=>x.t<y.t?-1:1));
  const it=x=>`<button type="button" class="fx2i ${x.c}"${x.id?` data-file="${esc(x.id)}" data-fname="${esc(x.n||'')}"`:''}>${x.h}</button>`,td=tDay();
  const day=(d,max)=>{const L=by[d]||[],sh=max?L.slice(0,max):L;return `<div class="fx2d${d===td?' td':''}${d<from||d>to?' out':''}${d===st.sel?' sel':''}"${d>=from&&d<=to?` data-fx2sel="${d}" role="button" tabindex="0" title="لیست بیماران این روز"`:''}><div class="fx2dh"><b>${fa(jParts(d)[2])}</b>${m==='week'?` <small>${esc(wDayS(d))}</small>`:''}${L.length?` <em>${fa(L.length)}</em>`:''}</div>${sh.map(it).join('')}${max&&L.length>max?`<small class="more">+${fa(L.length-max)}</small>`:''}</div>`};
  const P=jParts(anc),title=m==='month'?JMN[P[1]-1]+' '+faD(String(P[0])):'هفته‌ی '+jDay(from)+' تا '+jDay(to);
  let grid='';if(m==='week'){const D=[];for(let i=0;i<7;i++)D.push(dAdd(from,i));grid=`<div class="fx2g wk">${D.map(d=>day(d,0)).join('')}</div>`}
  else{const s0=weekStart(from),D=[];for(let d=s0;d<=to||D.length%7;d=dAdd(d,1))D.push(d);grid=`<div class="fx2wh">${['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'].map(x=>`<span>${x}</span>`).join('')}</div><div class="fx2g mo">${D.map(d=>day(d,3)).join('')}</div>`}
  box.innerHTML=`<div class="fx2nav"><button class="btn sm ghost" type="button" data-fx2nav="-1" aria-label="قبلی">‹ قبلی</button><b>${esc(title)}</b><button class="btn sm ghost" type="button" data-fx2nav="1" aria-label="بعدی">بعدی ›</button><button class="btn sm ghost" type="button" data-fx2nav="0">امروز</button><small>${fa(A.length)} نوبت${T.length?' · '+fa(T.length)+' کار':''}</small></div>${grid}${cv2Panel(st,m,from,to,A,T)}${def.tk.length&&to>dAdd(td,60)?'<p class="note">کارهای بیشتر از ۶۰ روز بعد اینجا نمی‌آیند.</p>':''}`}
{const _th=tileHead;tileHead=function(){_th();try{fx2Head()}catch(e){console.error('fx2',e)}}}
function fx2Head(){const host=$('rAll');document.body.removeAttribute('data-fx2cal');const old=$('fx2Cal');if(old)old.remove();if(ROLE!=='staff'||!host||!FX2T[TILE])return;
  const h=host.querySelector('.tilehd');if(!h)return;const m=(FX2CV[TILE]||{}).m||'list',a=h.querySelector('.acts');
  if(a&&!a.querySelector('.fx2cv'))a.insertAdjacentHTML('afterbegin',`<span class="seg fx2cv" role="group" aria-label="نمایش">${[['list','فهرست'],['week','هفته'],['month','ماه']].map(([k,l])=>`<button type="button" data-fx2cv="${k}" aria-pressed="${m===k}">${l}</button>`).join('')}</span>`);
  /* cv1: */if(a)a.querySelectorAll('[data-fx2cv]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fx2cv===m)));
  if(m==='list')return;document.body.dataset.fx2cal='1';const c=document.createElement('div');c.id='fx2Cal';c.className='fx2cal';c.innerHTML='<div class="empty">در حال بارگذاری تقویم…</div>';h.after(c);fx2CalRender()}
function fx2Set(o){FX2CV[TILE]=Object.assign({},FX2CV[TILE]||{},o);try{localStorage.setItem('implantFx2Cv',JSON.stringify(FX2CV))}catch(e){}fx2Head()}
/* ---- 4. Jalali date picker on every date field ---- */
var FX2DP=null;
const fx2IsDate=el=>el&&el.tagName==='INPUT'&&(el.id==='rc_date'||el.dataset.jd!==undefined||el.dataset.v==='day'||/^[۰-۹0-9]{4}\/[۰-۹0-9]{2}\/[۰-۹0-9]{2}$/.test(((el.getAttribute('placeholder')||'').replace(/^مثلاً\s*/,'')).trim()));
function fx2DpClose(){if(FX2DP&&FX2DP.el)FX2DP.el.remove();FX2DP=null}
/* fx2DpOpen: base + arc6 (opens at the last date used, also when already open) */
function fx2DpOpen(inp){const cur=parseJ(inp.value||'');if(!(FX2DP&&FX2DP.inp===inp)){fx2DpClose();const el=document.createElement('div');el.className='fx2dp';el.setAttribute('role','dialog');el.setAttribute('aria-label','انتخاب تاریخ');document.body.appendChild(el);FX2DP={inp,el,anc:cur||tDay(),sel:cur};fx2DpDraw();fx2DpPlace()}
  try{if(FX2DP&&FX2DP.inp===inp&&!parseJ(inp.value||'')&&inp.dataset.anc&&/^\d{4}-\d{2}-\d{2}$/.test(inp.dataset.anc)){FX2DP.anc=inp.dataset.anc;fx2DpDraw();fx2DpPlace()}}catch(e){}}
function fx2DpPlace(){if(!FX2DP)return;const r=FX2DP.inp.getBoundingClientRect(),el=FX2DP.el,Z=(window.ZM?ZM():1),w=(el.offsetWidth||290)*Z,h=(el.offsetHeight||320)*Z;let top=r.bottom+6,left=r.right-w;if(left<6)left=6;if(left+w>innerWidth-6)left=innerWidth-w-6;if(top+h>innerHeight-6&&r.top-h-6>6)top=r.top-h-6;el.style.top=(top+scrollY)/Z+'px';el.style.left=(left+scrollX)/Z+'px'}
function fx2DpDraw(){const S=FX2DP,[f,t]=jMonth(S.anc),P=jParts(S.anc),td=tDay(),s0=weekStart(f),D=[];for(let d=s0;d<=t||D.length%7;d=dAdd(d,1))D.push(d);
  S.el.innerHTML=`<div class="fx2dpn"><button type="button" data-dpn="1" aria-label="ماه بعد">‹</button><b>${JMN[P[1]-1]} ${faD(String(P[0]))}</b><button type="button" data-dpn="-1" aria-label="ماه قبل">›</button></div>
   <div class="fx2dpy"><button type="button" data-dpy="-1">سال قبل</button><button type="button" data-dpt="1">امروز</button><button type="button" data-dpy="1">سال بعد</button></div>
   <div class="fx2dpw">${['ش','ی','د','س','چ','پ','ج'].map(x=>`<span>${x}</span>`).join('')}</div>
   <div class="fx2dpg">${D.map(d=>d<f||d>t?'<span></span>':`<button type="button" data-dpd="${d}" class="${d===td?'td ':''}${d===S.sel?'sel':''}" aria-label="${esc(jDay(d))}">${fa(jParts(d)[2])}</button>`).join('')}</div>`}
function fx2DpPick(d){const S=FX2DP;if(!S)return;S.inp.value=jDay(d);S.inp.dispatchEvent(new Event('input',{bubbles:true}));S.inp.dispatchEvent(new Event('change',{bubbles:true}));fx2DpClose()}
const fx2JAdd=(d,mo)=>{const P=jParts(d);let y=P[0],m=P[1]+mo;while(m>12){m-=12;y++}while(m<1){m+=12;y--}return parseJ(y+'/'+m+'/1')||d};
document.addEventListener('focusin',e=>{const t=e.target;if(fx2IsDate(t))fx2DpOpen(t)});
document.addEventListener('click',e=>{const t=e.target;if(fx2IsDate(t)){fx2DpOpen(t);return}if(!FX2DP)return;const b=t.closest&&t.closest('.fx2dp button');
  if(b){e.preventDefault();e.stopPropagation();const d=b.dataset;if(d.dpd){fx2DpPick(d.dpd);return}if(d.dpn){FX2DP.anc=fx2JAdd(FX2DP.anc,Number(d.dpn));fx2DpDraw();return}if(d.dpy){FX2DP.anc=fx2JAdd(FX2DP.anc,12*Number(d.dpy));fx2DpDraw();return}if(d.dpt){FX2DP.anc=tDay();fx2DpDraw();return}return}
  if(!(t.closest&&t.closest('.fx2dp')))fx2DpClose()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&FX2DP){e.preventDefault();e.stopImmediatePropagation();fx2DpClose()}},true);
document.addEventListener('focusout',e=>{if(FX2DP&&e.target===FX2DP.inp)setTimeout(()=>{if(FX2DP&&document.activeElement!==FX2DP.inp&&!FX2DP.el.contains(document.activeElement)&&!FX2DP.el.matches(':hover'))fx2DpClose()},200)});
addEventListener('resize',()=>fx2DpPlace());addEventListener('scroll',()=>fx2DpPlace(),true);
/* clicks */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-fx2cv],[data-fx2nav],[data-fx2day],#fx2VAdd,[data-fx2vrm],[data-fx2sel]');if(!t)return;if(t.dataset.fx2sel!==undefined&&t.dataset.fx2sel&&e.target.closest('.fx2i,a'))return;e.preventDefault();e.stopPropagation();const d=t.dataset;
  if(d.fx2cv){fx2Set({m:d.fx2cv});return}
  if(d.fx2nav!==undefined){const st=FX2CV[TILE]||{},n=Number(d.fx2nav),a=st.a||tDay();fx2Set({a:n===0?tDay():st.m==='month'?fx2JAdd(a,n):dAdd(a,7*n)});return}
  if(d.fx2day){fx2Set({m:'week',a:d.fx2day,sel:d.fx2day});return}
  if(d.fx2sel!==undefined){const cur=(FX2CV[TILE]||{}).sel;fx2Set({sel:d.fx2sel&&d.fx2sel!==cur?d.fx2sel:''});if(d.fx2sel&&d.fx2sel!==cur)setTimeout(()=>{const p=$('cv2P');if(p)p.scrollIntoView({behavior:'smooth',block:'nearest'})},80);return}
  if(t.id==='fx2VAdd'){fxArcRead();FXA.visits=(FXA.visits||[]).concat([{}]);fxArcRender();return}
  if(d.fx2vrm!==undefined){fxArcRead();FXA.visits.splice(Number(d.fx2vrm),1);fxArcRender();return}},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const t=e.target.closest&&e.target.closest('[data-fx2day]');if(t){e.preventDefault();fx2Set({m:'week',a:t.dataset.fx2day})}});
Object.assign(PAY_K,{arc:'پرداخت قبلی (پرونده‌ی کاغذی)'});try{Object.assign(PAYM,{arc:'پرداخت قبلی'});Object.assign(MRPK,{arc:'قبلی'})}catch(e){}

