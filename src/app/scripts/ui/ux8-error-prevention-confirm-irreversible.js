/* ux8: (owner, 2026-11-05) error prevention — confirm irreversible one-tap actions, safer undo toast, money / date accuracy,
   stable ids on retry (no duplicates), warning before typed data is lost. Client only. */
var UX8={ok:new WeakSet(),dirty:false,sid:{},cashDay:''};
const ux8Who=t=>{try{if(t.closest('#pfSheet')&&PF&&PF.j)return((PF.j.data||{}).h||{}).name||PF.j.name||'';const c=t.closest('.item,.qitem,.apc,.mqi,.card,tr,li');const b=c&&c.querySelector('.row1 b,.nm,b');return b?b.textContent.trim().replace(/\s+/g,' ').slice(0,50):''}catch(e){return ''}};
/* (1) confirmations: runs before every other click handler (window, capture); after «بله» the same click is replayed */
const UX8_ASK=[
  {s:'button[data-ast="cancel"]',t:'لغو نوبت',m:'نوبت این بیمار لغو شود؟',ok:'بله، لغو شود'},
  {s:'button[data-ast="noshow"]',t:'بیمار نیامد',m:'برای این نوبت «نیامد» ثبت شود؟ برای بیمار کار پیگیری ساخته می‌شود.',ok:'بله، نیامد'},
  {s:'button[data-booklost]',t:'انصراف بیمار',m:'بیمار «انصراف داد» ثبت و به بایگانی برود؟ نوبت‌های جراحی آینده‌اش لغو می‌شود.',ok:'بله، انصراف داد'},
  {s:'[data-sdgo]',t:'ترخیص بیمار',m:'بیمار ترخیص شود؟',ok:'بله، ترخیص',danger:false},
  {s:'button[data-pyst="bounce"]',t:'برگشت چک',m:'این چک «برگشت خورد» ثبت شود؟ مبلغ دوباره بدهی بیمار می‌شود.',ok:'بله، برگشت خورد'},
  {s:'button[data-frc$=":bounce"]',t:'برگشت چک',m:'این چک «برگشت خورد» ثبت شود؟ مبلغ دوباره بدهی بیمار می‌شود و سند می‌خورد.',ok:'بله، برگشت خورد'},
  {s:'button[data-frc$=":ok"]',t:'وصول چک',m:'وصول این چک ثبت شود و به بانک برود؟',ok:'بله، وصول شد',danger:false},
  {s:'button[data-p2op="stop"]',t:'ادامه نمی‌دهد',m:'ثبت شود که بیمار درمان پروتز را ادامه نمی‌دهد؟ بیمار به «بازگشت بیماران» می‌رود.',ok:'بله، ادامه نمی‌دهد'},
  {s:'button[data-p2op="skip"]',t:'رد شدن از مرحله',m:'از این مرحله‌ی پروتز رد شوید؟',ok:'بله، رد شو',danger:false},
  {s:'#photoDel',t:'حذف عکس بیمار',m:'عکس بیمار حذف شود؟',ok:'بله، حذف شود'},
  {s:'button[data-uact]',t:'غیرفعال کردن کاربر',m:'این کاربر غیرفعال شود؟ دیگر نمی‌تواند وارد شود.',ok:'بله، غیرفعال شود',when:t=>{try{const u=UA.users.find(x=>x.id===t.dataset.uact);return !!(u&&u.active)}catch(e){return false}}},
  {s:'#tabOut',t:'خروج',m:'',ok:'خروج',when:t=>{try{const o=(OUTBOX||[]).filter(x=>!x.role||x.role===ROLE).length;t._ux8m=o?fa(o)+' مورد هنوز به سرور نرسیده و تا ورود دوباره‌ی همین نقش روی همین دستگاه ارسال نمی‌شود. خارج می‌شوید؟':(UX8.dirty?'چیزهایی که نوشته‌اید هنوز ثبت نشده و پاک می‌شود. خارج می‌شوید؟':'');return !!t._ux8m}catch(e){return false}}}
];
window.addEventListener('click',async e=>{const el=e.target&&e.target.closest&&e.target;if(!el)return;let hit=null,t=null;
  for(const a of UX8_ASK){const x=el.closest(a.s);if(x&&!x.disabled&&(!a.when||a.when(x))){hit=a;t=x;break}}
  if(!hit)return;if(UX8.ok.has(t)){UX8.ok.delete(t);return}
  if(t._ux8block){e.preventDefault();e.stopImmediatePropagation();t._ux8block=0;return}
  e.preventDefault();e.stopImmediatePropagation();
  const who=ux8Who(t);const yes=await uxAsk({title:hit.t,who:who?('بیمار: '+who):'',msg:t._ux8m||hit.m,ok:hit.ok,cancel:'نه، برگرد',danger:hit.danger!==false});
  if(yes){UX8.ok.add(t);if(t.id==='tabOut'){UX8.dirty=false;try{dirty=false}catch(x){}}t.click()}},true);
/* undo toast: 10 s, and a plain message no longer wipes a live «برگرداندن» button (it goes to a second line) */
{const _tu=toastUndo;toastUndo=function(text,undo){const r=_tu.apply(this,arguments);const el=$('toast');clearTimeout(el._t);el._ux8u=Date.now()+10000;el._t=setTimeout(()=>{el.hidden=true;el._ux8u=0},10000);return r}}
{const _t=toast;toast=function(t,bad){const el=$('toast');const live=el&&el._ux8u&&el._ux8u>Date.now()&&!el.hidden&&el.querySelector('.tundo:not(:disabled)');
  if(!live)return _t.apply(this,arguments);let s=el.querySelector('.ux8m');if(!s){s=document.createElement('div');s.className='ux8m';el.appendChild(s)}s.textContent=t;s.classList.toggle('err',!!bad)}}
/* (2) accuracy: Jalali years outside 1350–1430 are not dates (a Gregorian 2026/11/04 or a typo like 140/8/1) */
{const _p=parseJ;parseJ=function(s){const r=_p.apply(this,arguments);if(!r)return r;const y=+String(r).slice(0,4);if(y&&(y<1971||y>2052))return '';return r}}
/* more money fields take digits only (same check and message as the fx7 ones) */
const UX8_AMT='#py_amt,#mv_amt,#by_amt,#by_vat,#xf_amt,#xf_fee,#ac_cnt,#p2_months,[data-vl="dr"],[data-vl="cr"]';
document.addEventListener('input',e=>{const t=e.target;if(t&&t.matches&&t.matches(UX8_AMT))fx7Mark(t,fx7AmtBad(t.value))},true);
window.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button.btn,button[id$="Go"],button[data-mvgo]');if(!t||t.classList.contains('ghost')||t.classList.contains('chip'))return;
  const c=t.closest('.sheet,form,.card,[role=dialog]');if(!c)return;const bad=[...c.querySelectorAll(UX8_AMT)].find(i=>!i.disabled&&i.offsetParent&&fx7AmtBad(i.value));if(!bad)return;
  e.preventDefault();e.stopImmediatePropagation();fx7Mark(bad,true);try{bad.focus()}catch(x){}toast(FX7_AMT_MSG,true)},true);
/* the cash box closes only the day whose totals are on the screen, and asks with expected vs counted */
{const _lc=loadCash;loadCash=function(){try{const v=$('ac_day').value.trim();UX8.cashDay=v?parseJ(v):tDay()}catch(e){}return _lc.apply(this,arguments)}}
UX8_ASK.push({s:'#acClose',t:'بستن صندوق',m:'',ok:'بله، صندوق بسته شود',danger:false,when:t=>{const m=$('acMsg'),v=$('ac_day').value.trim(),d=v?parseJ(v):tDay();
  if(v&&!d){m.className='msg err';m.textContent='تاریخ صندوق درست نیست (مثل ۱۴۰۵/۰۸/۱۵).';t._ux8block=1;return true}
  if(UX8.cashDay&&d!==UX8.cashDay){m.className='msg err';m.textContent='تاریخ عوض شده؛ اول «نمایش» را بزنید تا جمع همان روز دیده شود، بعد ببندید.';t._ux8block=1;return true}
  t._ux8block=0;t._ux8m='صندوق روز '+jDay(d)+' بسته شود؟ نقد شمرده‌شده: '+money(mnum($('ac_cnt').value))+'. بعد از بستن فقط حسابدار می‌تواند دوباره ببندد.';return true}});
/* api guard: dates typed but not understood, tiny payments, past appointments / lab dates; stable ids for a retry after an error */
const UX8_RAW={rcv:'mv_day',buy:'by_day',xfer:'xf_day'};
const ux8Bad=msg=>{const e=new Error(msg);e.ux8=1;return e};
const ux8Fp=(a,p)=>{try{const q=Object.assign({},p);delete q.sendId;return a+'|'+JSON.stringify(q)}catch(e){return ''}};
const UX8_WR=/Add|Save|Set|New|Move|Close|Recv|Count|Del|Ref|confirm|toConsult|discharge|surg|queue|undecided|settle|refund|fx|lab|pros|appt|pay|file|book|rx|inv|fin|cash|exp|intake|user/;
const UX8_RD=/^(ping|list|get|queue|stats|events|apptList|prosList|labList|invGet|finGet|finInvList|cashDay|accReport|mgrReport|invReport|refundList|posList|rxGet|fileGet|pdfFull|patLink|arc6Meta|lab5|undecided)$/;
{const _a=api;api=async function(action,payload,opt){payload=payload||{};
  if(action==='finMove'&&payload.m){const m=payload.m,id=UX8_RAW[m.t],raw=id?(($(id)||{}).value||'').trim():m.t==='voucher'?String((typeof FIN!=='undefined'&&FIN.vday)||'').trim():'';if(raw&&!m.day)throw ux8Bad('تاریخ را درست بنویسید (مثل ۱۴۰۵/۰۸/۱۵).')}
  if(action==='finPayrollSave'){const raw=(($('pr_day')||{}).value||'').trim();if(raw&&!payload.day)throw ux8Bad('تاریخ سند حقوق را درست بنویسید.')}
  if(action==='payAdd'&&payload.pay&&!payload._ux8){const n=Number(payload.pay.amount)||0;if(n>0&&n<100000){const ok=await uxAsk({title:'مبلغ کم است',msg:'مبلغ '+money(n)+' است. مبلغ‌ها به تومان‌اند (نه میلیون). درست است؟',ok:'بله، همین مبلغ',cancel:'نه، اصلاح می‌کنم'});if(!ok)throw ux8Bad('ثبت نشد؛ مبلغ را اصلاح کنید.')}}
  if(action==='payAdd'&&payload.pay&&payload.pay.kind==='chq'&&!payload.pid&&/^قسط /.test(String(payload.pay.note||''))&&PF&&payload.id===PF.id)payload.pid=('ic-'+payload.id+'-'+payload.pay.due+'-'+payload.pay.amount).slice(0,60);
  if(action==='apptSave'&&payload.appt&&!payload.aid&&!payload._ux8){const d=payload.appt.day;if(d&&d<tDay()){const ok=await uxAsk({title:'تاریخ گذشته',msg:'تاریخ این نوبت ('+jDay(d)+') گذشته است. نوبت با همین تاریخ ثبت شود؟',ok:'بله، ثبت شود',cancel:'نه، اصلاح می‌کنم'});if(!ok)throw ux8Bad('ثبت نشد؛ تاریخ را اصلاح کنید.')}}
  if((action==='labNew'||action==='lab4New')&&payload.order&&!payload._ux8){const d=payload.order.due;if(d&&d<tDay()){const ok=await uxAsk({title:'تاریخ تحویل گذشته',msg:'تاریخ تحویل لابراتوار ('+jDay(d)+') گذشته است. همین ثبت شود؟',ok:'بله',cancel:'نه، اصلاح می‌کنم'});if(!ok)throw ux8Bad('ثبت نشد؛ تاریخ تحویل را اصلاح کنید.')}}
  let fp='';if(['finMove','expAdd','invMove'].includes(action)&&payload.sendId){fp=ux8Fp(action,payload);const old=UX8.sid[fp];if(old&&old.t>Date.now()-15*60000)payload.sendId=old.id;else UX8.sid[fp]={id:payload.sendId,t:Date.now()}}
  try{const r=await _a.call(this,action,payload,opt);if(fp)delete UX8.sid[fp];if(!UX8_RD.test(action)&&UX8_WR.test(action))UX8.dirty=false;return r}catch(e){throw e}}}
/* errors raised above show in the usual place: the callers already catch and show e.message */
/* (4) typed data is not lost: warn before closing / reloading the page, and before «طرح درمان دوباره» clears a half-typed admission */
const UX8_F=/^(rc_|mv_|by_|xf_|py_|ae_|ac_|lo_|vf|pr_|ic_|ap_|st_|rf_|pc_|p2_|inv|ir_|ex_)/;
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.matches||!t.matches('input,textarea,select')||t.type==='search'||t.type==='checkbox'&&!t.closest('.sheet'))return;
  if(t.closest('#uxAskSh,#lgSheet,.lgbox,#login'))return;if(/جست|search|filter|فیلتر/i.test((t.placeholder||'')+(t.id||'')+(t.className||'')))return;
  if(t.closest('.sheet:not([hidden])')||UX8_F.test(t.id||'')||t.closest('#viewFin,#viewInv,#viewLab,#viewAcc,#viewArc6'))UX8.dirty=true},true);
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.sheet .btn.ghost,[id$="Cancel"],[id$="Close"]:not(#acClose)');if(t&&/انصراف|بستن|بی‌خیال|لغو/.test(t.textContent||''))setTimeout(()=>{if(!document.querySelector('.sheet:not([hidden]):not(#uxAskSh)'))UX8.dirty=false},0)},true);
window.addEventListener('beforeunload',e=>{if(UX8.dirty&&ROLE){e.preventDefault();e.returnValue=''}});
/* (sendToDoctor: the half-filled form question is merged into surgery/roles-live-queue-reception.js) */
