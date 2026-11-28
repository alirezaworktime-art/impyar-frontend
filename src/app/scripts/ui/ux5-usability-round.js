/* ---------- ux5: usability round (owner, 2026-11-04) ---------- */
/* (2) one in-app confirmation dialog: uxAsk / uxConfirm / uxPrompt; l2Ask and every «دوباره بزنید» button use it */
var UXA=null;
function uxAsk(o){o=o||{};return new Promise(res=>{if(UXA){try{UXA.done(null)}catch(e){}}
  const F=o.fields||[];
  const fld=(f,i)=>f.type==='html'?f.html:`<label class="f${f.full?' full':''}">${esc(f.l||'')}${f.type==='textarea'?`<textarea data-ak="${i}" rows="3">${esc(f.v||'')}</textarea>`:f.type==='select'?`<select data-ak="${i}">${(f.opts||[]).map(([v,l])=>`<option value="${esc(v)}"${String(v)===String(f.v??'')?' selected':''}>${esc(l)}</option>`).join('')}</select>`:`<input data-ak="${i}" value="${esc(f.v??'')}"${f.type==='num'?' inputmode="numeric" dir="ltr" class="ltr"':''}${f.type==='date'?' data-jd="1" placeholder="مثلاً '+esc(jDay(tDay()))+'"':''}${f.ph?` placeholder="${esc(f.ph)}"`:''}${f.list?` list="${f.list}"`:''}>`}</label>`;
  const s=mkSheet('uxAskSh',`<h3 id="uxAskT">${esc(o.title||'تأیید')}</h3>${o.who?`<p class="uxwho">${esc(o.who)}</p>`:''}${o.msg?`<p class="uxmsg">${esc(o.msg)}</p>`:''}${F.length?`<div class="fields">${F.map(fld).join('')}</div>`:''}<div class="msg" id="uxAskM" role="alert"></div><div class="btns"><button class="btn${o.danger?' danger':''}" type="button" id="uxAskOk">${esc(o.ok||'تأیید')}</button><button class="btn ghost" type="button" id="uxAskNo">${esc(o.cancel||'انصراف')}</button></div>`);
  s.setAttribute('role','dialog');s.setAttribute('aria-modal','true');s.setAttribute('aria-labelledby','uxAskT');
  const prev=document.activeElement;s.hidden=false;
  const done=v=>{if(!UXA||UXA.s!==s)return;UXA=null;s.hidden=true;try{if(prev&&prev.isConnected&&prev.focus)prev.focus({preventScroll:true})}catch(e){}res(v)};
  UXA={s,done};
  const ok=()=>{if(!F.length){done(true);return}const out={};F.forEach((f,i)=>{const e=s.querySelector(`[data-ak="${i}"]`);if(e&&f.k)out[f.k]=f.type==='num'?toEn(e.value.trim()):e.value.trim()});
    const bad=F.find(f=>f.req&&f.k&&!out[f.k]);if(bad){const m=$('uxAskM');m.className='msg err';m.textContent=(bad.l||'این مورد')+' را بنویسید.';const e=s.querySelector(`[data-ak="${F.indexOf(bad)}"]`);if(e)e.focus();return}
    const nb=F.find(f=>f.type==='num'&&f.k&&out[f.k]!==''&&!/^-?\d+(\.\d+)?$/.test(String(out[f.k]).replace(/[,٬\s]/g,'')));if(nb){const m=$('uxAskM');m.className='msg err';m.textContent=(nb.l||'عدد')+' باید عدد باشد.';return}
    F.forEach(f=>{if(f.type==='num'&&f.k)out[f.k]=String(out[f.k]).replace(/[,٬\s]/g,'')});done(out)};
  $('uxAskOk').onclick=ok;$('uxAskNo').onclick=()=>done(null);
  s.querySelectorAll('input[data-ak]').forEach(e=>e.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&!ev.isComposing){ev.preventDefault();ok()}}));
  setTimeout(()=>{const f=s.querySelector('[data-ak]');try{(f||$('uxAskOk')).focus({preventScroll:true})}catch(e){}},30)})}
const uxConfirm=(msg,ok,danger,title)=>uxAsk({title:title||ok||'تأیید',msg,ok:ok||'تأیید',danger:danger===undefined?/حذف|ابطال|باطل|لغو|انصراف|برگشت|غیرفعال/.test(ok||''):danger}).then(v=>!!v);
const uxPrompt=(label,def,type,ok,title)=>uxAsk({title:title||label.replace(/[:：]\s*$/,''),fields:[{k:'v',l:label.replace(/[:：]\s*$/,''),type:type||'text',v:def==null?'':(type==='num'?faD(String(def)):String(def))}],ok:ok||'ثبت'}).then(v=>v?v.v:null);
/* Esc and a click on the dark backdrop cancel the dialog */
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&UXA){e.preventDefault();e.stopImmediatePropagation();UXA.done(null)}},true);
document.addEventListener('pointerdown',e=>{if(UXA&&e.target===UXA.s){e.stopImmediatePropagation();UXA.done(null)}},true);
document.addEventListener('click',e=>{if(UXA&&e.target===UXA.s){e.stopImmediatePropagation();e.preventDefault()}},true);
/* the lab dialogs use the same one */
l2Ask=function(title,fields,okL){return uxAsk({title,fields:(fields||[]).map(f=>Object.assign({},f)),ok:okL||'ثبت',danger:/حذف|ابطال|باطل|لغو|برگشت/.test(okL||'')})};
/* every «… دوباره بزنید» button: the second tap is replaced by the dialog */
const UXARM=/دوباره بزنید|دوباره بزن/;
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('button,[role=button],a');if(b&&!b.dataset.armed&&!b._uxGo)b._uxTxt=b.textContent.trim()},true);
function uxArmSel(b){const a=[...b.attributes].filter(x=>x.name.startsWith('data-')&&x.name!=='data-armed').map(x=>`[${x.name}="${CSS.escape(x.value)}"]`).join('');return a?b.tagName.toLowerCase()+a:''}
function uxArmWho(b){const c=b.closest('.item,.qitem,.task,.mqi,tr,.bcard,.l6card,[class*="item"],.card,li');if(!c)return '';const n=c.querySelector('.nm b,.nm,.name,[data-fname],h3,b,strong,.bnm');const t=n?n.textContent.trim().replace(/\s+/g,' '):'';return t&&t.length<60&&!/دوباره بزنید/.test(t)?t:''}
async function uxArmed(b){if(b._uxBusy)return;b._uxBusy=true;const armedTxt=b.textContent.trim(),orig=b._uxTxt||armedTxt.replace(UXARM,'').replace(/[؟?]\s*$/,'').trim(),sel=uxArmSel(b),who=uxArmWho(b);
  let q=armedTxt.replace(UXARM,'').trim();if(!q||/^(مطمئنید|مطمئن هستید)[؟?]?$/.test(q)||q.length<4)q=`«${orig}» انجام شود؟`;
  b.textContent=orig;
  const yes=await uxAsk({title:orig,who:who?('بیمار / مورد: '+who):'',msg:q,ok:orig,danger:/حذف|ابطال|باطل|لغو|انصراف|برگشت|غیرفعال/.test(orig)}).then(v=>!!v).finally(()=>{b._uxBusy=false});
  let t=b.isConnected?b:(sel?document.querySelector(sel):null);
  if(!yes){if(b.isConnected){delete b.dataset.armed;b.textContent=orig}return}
  if(!t){toast('صفحه به‌روز شد؛ دوباره بزنید.',1);return}
  t._uxGo=true;if(!t.dataset.armed)t.dataset.armed='1';if(t.disabled)t.disabled=false;try{t.click()}finally{setTimeout(()=>{t._uxGo=false},0)}}
new MutationObserver(ms=>{for(const m of ms){const b=m.target;if(!b||!b.dataset||!b.dataset.armed||b._uxGo||b._uxBusy)continue;if(!UXARM.test(b.textContent)){continue}uxArmed(b)}}).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['data-armed']});
/* some handlers set data-armed before the text; check again when the text changes */
new MutationObserver(ms=>{for(const m of ms){const b=m.target&&(m.target.nodeType===1?m.target:m.target.parentElement);const btn=b&&b.closest&&b.closest('[data-armed]');if(btn&&!btn._uxGo&&!btn._uxBusy&&UXARM.test(btn.textContent))uxArmed(btn)}}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});

/* A3: an empty admission or a wrong-looking mobile number asks first (both stay optional — owner rule pa7) */
/* rcSend: this check is merged into surgery/roles-live-queue-reception.js */
document.addEventListener('input',e=>{const t=e.target;if(!t||t.id!=='rc_phone')return;const ph=toEn(t.value||'').replace(/[\s\-()]/g,'');let m=$('ux2PhW');if(!m){m=document.createElement('small');m.id='ux2PhW';m.className='ux2w';t.insertAdjacentElement('afterend',m)}
  m.textContent=ph&&ph.length>=2&&!/^(\+98|0098|98)?0?9\d{0,9}$/.test(ph)?'شماره‌ی موبایل باید با ۰۹ شروع شود.':ph.length>11&&/^09/.test(ph)?'شماره‌ی موبایل بیشتر از ۱۱ رقم است.':'';t.setAttribute('aria-invalid',m.textContent?'true':'false')});

/* A8: Persian names for every action in «عملکرد هر نفر» and the change log */
Object.assign(ACT_L,{cin:'ورود امانی',cset:'تسویه با تأمین‌کننده',consign:'امانی',loan:'امانت',loanret:'برگشت امانت',assets:'دارایی‌ها',assetSave:'ثبت دارایی',assetLog:'سابقه‌ی دارایی',assetEvent:'رویداد دارایی',kits:'کیت‌ها',kitSave:'ثبت کیت',kitOut:'خروج کیت',kitIn:'برگشت کیت',kitlog:'سابقه‌ی کیت',genNew:'ساخت داده',gen:'ساخت داده',chart:'نمودار',bookLost:'انصراف از نوبت',bookUndo:'برگرداندن انصراف',surgStop:'توقف درمان',discharge:'ترخیص',refundPay:'پرداخت استرداد',prosAct:'مرحله‌ی پروتز',lab4New:'سفارش لابراتوار',sendDoc:'ارسال به پزشک',apptRef:'ارجاع نوبت به پزشک',evUndo:'برگرداندن تغییر',fxFile:'پرونده‌ی جا مانده',fxNote:'توضیح پرونده',fxArc:'پرونده‌ی جا مانده',finSync:'همگام‌سازی حسابداری',finCatalog:'فهرست حسابداری',finCatSave:'تنظیمات حسابداری',finSuggest:'پیشنهاد صورتحساب',finInvSave:'ثبت صورتحساب',finInvVoid:'ابطال صورتحساب',finInvList:'فهرست صورتحساب‌ها',finMove:'دریافت / پرداخت',finChqo:'چک صادره',finChqoList:'چک‌های صادره',finDocVoid:'ابطال سند',finRec:'تطبیق بانکی',finJournal:'دفتر روزنامه',finTrial:'تراز',finLedger:'دفتر کل',finParties:'اشخاص',finPayee:'ذی‌نفع',finStatements:'صورت‌های مالی',finDash:'داشبورد مالی',finProfit:'سود',finXl:'دفتر اکسل',finXlForm:'فرم ثبت اکسل',finXlWork:'دفتر اکسل',finXlSheet:'برگه‌ی اکسل',finBudget:'بودجه',finTax:'مالیات و بیمه',finPayroll:'حقوق',finPayrollSave:'ثبت حقوق',ping:'ورود',invGet:'انبار',invFin:'خرید و بها',invReport:'گزارش انبار',mgrReport:'گزارش مدیریتی',invRecv:'رسید انبار',invCount:'انبارگردانی',invSup:'تأمین‌کننده',invBudget:'بودجه‌ی خرید',invPo:'سفارش خرید',inv3:'انبار (ورود، خروج، امانت)',list:'بایگانی',get:'دیدن پرونده',pdfFull:'PDF کامل پرونده',queue:'صف',fx5SurgCancel:'لغو جلسه‌ی جراحی',refundList:'استردادها',fx4Allow:'اجازه‌ی ادامه',fx4Refund:'استرداد',fx4RefundCancel:'لغو استرداد',posList:'کارتخوان‌ها',posSave:'ثبت کارتخوان',events:'تاریخچه',fileGet:'دیدن تصویر',userList:'کاربران',auditList:'سابقه‌ی تغییرات',prosList:'پروتزها',lab4Pats:'بیماران لابراتوار',lab4Find:'جست‌وجوی لابراتوار',lab5:'کار لابراتوار',labList:'سفارش‌های لابراتوار',labOrder:'سفارش لابراتوار',labRet:'برگشت کار لابراتوار',apptList:'نوبت‌ها',stats:'داشبورد',rxGet:'نسخه',winback:'بازگشت بیماران',attMe:'حضور',attReport:'گزارش حضور',perf:'عملکرد',cashDay:'صندوق روز',accReport:'گزارش حسابداری'});


/* A16: «ذخیره شد» only for a few seconds after something was really saved */
var UX_NP={last:'',until:0};
function netPill(){const p=$('netPill');if(!p||!ROLE)return;const n=(typeof OUTBOX!=='undefined'?OUTBOX.filter(o=>(o.role||'doctor')===ROLE).length:0);
  let c='ok',t='';if(!navigator.onLine){c='bad';t='بدون اینترنت'}else if(n){c='warn';t='در حال ارسال '+fa(n)}else if(typeof dirty!=='undefined'&&dirty&&!$('viewForm').hidden){c='warn';t='تغییر ذخیره‌نشده'}
  if(c==='ok'){if(UX_NP.last==='warn')UX_NP.until=Date.now()+4000;if(Date.now()<UX_NP.until)t='ذخیره شد'}
  UX_NP.last=c;p.className='netp '+c;p.textContent=t}

/* A14: every field has a name for screen readers; scroll boxes can be reached with the keyboard */
function uxLabelAll(root){try{(root||document).querySelectorAll('input:not([type=hidden]):not([aria-label]):not([aria-labelledby]),select:not([aria-label]):not([aria-labelledby]),textarea:not([aria-label]):not([aria-labelledby])').forEach(e=>{
    if(e.id&&document.querySelector(`label[for="${CSS.escape(e.id)}"]`))return;if(e.closest('label'))return;
    let n=e.getAttribute('placeholder')||e.getAttribute('title')||'';
    if(!n){const td=e.closest('td,th');if(td){const tr=td.parentElement,tb=td.closest('table');const i=[...tr.children].indexOf(td);const th=tb&&tb.tHead&&tb.tHead.rows[0]&&tb.tHead.rows[0].children[i];const rn=tr.querySelector('td:first-child');n=((th&&th.textContent.trim())||'')+(rn&&rn!==td&&rn.textContent.trim()?' — '+rn.textContent.trim().slice(0,30):'')}}
    if(!n){const f=e.closest('.f,.fld,.field');const s=f&&f.querySelector('span,small,b');if(s)n=s.textContent.trim()}
    if(!n){const p=e.previousElementSibling;if(p&&/^(SPAN|SMALL|B|LABEL)$/.test(p.tagName))n=p.textContent.trim()}
    if(!n)n=e.dataset&&Object.keys(e.dataset).length?'ورودی':'';if(n)e.setAttribute('aria-label',n.replace(/\s+/g,' ').slice(0,80))});
  (root||document).querySelectorAll('.ftsc,#sgnTxt,.l5tw').forEach(e=>{if(!e.hasAttribute('tabindex'))e.setAttribute('tabindex','0')});
  (root||document).querySelectorAll('[role="tablist"]').forEach(t=>{if(t.querySelector(':scope>button[aria-pressed]'))t.setAttribute('role','group')});
  (root||document).querySelectorAll('[data-pick][tabindex="-1"]').forEach(e=>{if(e.closest('button')&&e.closest('button')!==e)e.removeAttribute('tabindex')});
  (root||document).querySelectorAll('button [tabindex]:not([data-pick]),button [role=button]:not([data-pick])').forEach(e=>{e.removeAttribute('tabindex');if(e.getAttribute('role')==='button')e.removeAttribute('role');e.setAttribute('aria-hidden','true')})}catch(err){}}

/* A2 / A4 / A5 / A18 / A19 / A20: one quiet pass over the text that is shown
   «·» next to Persian digits looks like a zero → «،»; raw amounts get separators; Gregorian dates become Jalali;
   «… دقیقه گذشته» above 90 minutes becomes hours / days; one spelling for آنکاوری / امتحان رزین / جست‌وجو; negative numbers read −۴ */
const UXW=[[/انکاوری/g,'آنکاوری'],[/آآنکاوری/g,'آنکاوری'],[/تست رزین/g,'امتحان رزین'],[/جستجو/g,'جست‌وجو']];
const uxFaN=s=>fa(Number(String(s).replace(/[^\d]/g,'')));
function uxTxt(s){if(!s||!/[·\d\-−انکتسج]/.test(s))return s;let o=s;
  if(o.includes('·'))o=o.replace(/\s*·\s*/g,'، ').replace(/(،\s*){2,}/g,'، ');
  if(/\d/.test(o)){o=o.replace(/\b(\d{4,})(\s*(?:تومان|ریال))/g,(m,n,u)=>uxFaN(n)+u);o=o.replace(/\b(20\d\d)-(\d\d)-(\d\d)\b/g,(m)=>{try{return jDay(m)}catch(e){return m}})}
  if(o.includes('دقیقه گذشته'))o=o.replace(/([۰-۹\d٬,]+)\s*دقیقه گذشته/g,(m,n)=>{const v=Number(toEn(n).replace(/[^\d]/g,''));if(!(v>=90))return m;return v>=2880?fa(Math.round(v/1440))+' روز گذشته':fa(Math.round(v/60))+' ساعت گذشته'});
  if(o.includes('‎−'))o=o.replace(/‎−([۰-۹][۰-۹٬]*)/g,'⁦−$1⁩');
  for(const [a,b] of UXW)if(a.test(o)){a.lastIndex=0;o=o.replace(a,b)}
  return o}
const UXSKIP='SCRIPT,STYLE,TEXTAREA,INPUT,SELECT,CODE,PRE';
function uxFixText(root){if(!root)return;if(root.nodeType===3){const p=root.parentElement;if(!p||p.closest(UXSKIP)||p.isContentEditable)return;const v=root.nodeValue,n=uxTxt(v);if(n!==v){let w=n;if(/^، /.test(w)&&!root.previousSibling&&(!p.previousSibling||p.previousSibling.nodeType===3&&!p.previousSibling.nodeValue.trim()))w=w.slice(2);root.nodeValue=w}return}
  if(root.nodeType!==1||root.closest&&root.closest(UXSKIP)&&root.tagName!=='SELECT')return;
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const L=[];for(let n;n=tw.nextNode();)L.push(n);L.forEach(uxFixText);
  root.querySelectorAll&&root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(e=>{['placeholder','title','aria-label'].forEach(a=>{const v=e.getAttribute(a);if(v){const n=uxTxt(v);if(n!==v)e.setAttribute(a,n)}})})}
let UXQ=new Set(),UXR=0;
function uxFlush(){UXR=0;const Q=[...UXQ];UXQ.clear();for(const n of Q){if(n.isConnected){uxFixText(n);if(n.nodeType===1)uxLabelAll(n)}}}
new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData'){UXQ.add(m.target)}else m.addedNodes.forEach(n=>{if(n.nodeType===1||n.nodeType===3)UXQ.add(n)})}if(UXQ.size&&!UXR)UXR=requestAnimationFrame(uxFlush)}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
document.addEventListener('DOMContentLoaded',()=>{uxFixText(document.body);uxLabelAll(document)});

/* (1) tiles fold into a strip after a section is chosen; a tap on the open section (or «همه‌ی بخش‌ها») unfolds them */
const UX2={tc:false,role:''};
function uxTileSync(){if(UX2.role!==ROLE){UX2.role=ROLE;UX2.tc=false}const el=$('tiles');const on=!!(UX2.tc&&ROLE&&el&&!el.hidden&&TILE);document.body.classList.toggle('ux2tc',on);
  if(el){el.querySelectorAll('.htile').forEach(b=>{const l=(b.querySelector('.hl,.tl')||{}).textContent||'',n=(b.querySelector('.hn,.tn')||{}).textContent||'';b.setAttribute('aria-label',l+(n&&n!=='—'?' ('+n+')':''));if(on)b.title=l+(n&&n!=='—'?' — '+n+' مورد':'')});
    let tt=$('ux2TT');if(!tt){tt=document.createElement('button');tt.type='button';tt.id='ux2TT';tt.textContent='همه‌ی بخش‌ها ▾';tt.setAttribute('aria-expanded','false')}if(tt.parentElement!==el)el.appendChild(tt)}}
(function(){const _r=renderTiles;renderTiles=function(){const r=_r.apply(this,arguments);try{uxTileSync()}catch(e){}return r}})();
document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('#tiles [data-tile],#ux2TT');if(!t)return;
  if(t.id==='ux2TT'||(document.body.classList.contains('ux2tc')&&t.dataset.tile===TILE)){e.preventDefault();e.stopImmediatePropagation();UX2.tc=false;uxTileSync();return}
  UX2.tc=true;setTimeout(uxTileSync,0)},true);

/* (3) compact plan form for the plan doctor and the consultant: used sections open, the rest are one-line headers */
const UXCF={all:false};
function uxFormSync(){const on=false;/* ux7: plan form fully open */document.body.classList.toggle('ux2cf',on);const sec=$('sections');if(!sec)return;
  let bar=$('ux2FormAll');if(!bar){bar=document.createElement('div');bar.id='ux2FormAll';bar.innerHTML='<span>بخش‌های بی‌استفاده جمع شده‌اند؛ روی نام هر بخش بزنید تا باز شود.</span><button type="button" data-ux2fa="1">نمایش همه‌ی بخش‌ها</button>';sec.parentElement.insertBefore(bar,sec)}
  sec.querySelectorAll(':scope>.card[data-sec]>h2').forEach(h=>{if(!h.querySelector('.ux2fold')){const s=document.createElement('span');s.className='ux2fold';s.setAttribute('aria-hidden','true');h.appendChild(s)}const c=h.parentElement,open=c.classList.contains('used')||c.classList.contains('ux2open');if(on){h.setAttribute('role','button');h.tabIndex=0;h.setAttribute('aria-expanded',open?'true':'false')}else{h.removeAttribute('role');h.removeAttribute('tabindex');h.removeAttribute('aria-expanded')}})}
(function(){const _f=renderForm;renderForm=function(){const r=_f.apply(this,arguments);try{uxFormSync()}catch(e){}return r};const _c=recalc;recalc=function(){const r=_c.apply(this,arguments);try{if(document.body.classList.contains('ux2cf'))uxFormSync()}catch(e){}return r}})();
(function(){const _o=openForm;openForm=function(){UXCF.all=false;return _o.apply(this,arguments)}})();
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;if(t.closest('[data-ux2fa]')){UXCF.all=true;uxFormSync();return}
  if(!document.body.classList.contains('ux2cf'))return;const h=t.closest('#sections>.card[data-sec]>h2');const c=h?h.parentElement:t.closest('#sections>.card[data-sec]:not(.used):not(.ux2open)');if(!c)return;
  if(h&&t.closest('select,input,button:not(.ux2fold),a'))return;
  if(c.classList.contains('used')&&h)return;
  e.preventDefault();c.classList.toggle('ux2open',!c.classList.contains('ux2open')||!h);uxFormSync();if(c.classList.contains('ux2open'))try{c.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(x){}},true);
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.matches&&e.target.matches('body.ux2cf #sections>.card[data-sec]>h2')){e.preventDefault();e.target.click()}});

