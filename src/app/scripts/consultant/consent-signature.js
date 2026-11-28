/* ---------- consent + signature ---------- */
const DEFAULT_CONSENT=`اینجانب {name} با آگاهی کامل و با رضایت شخصی، انجام طرح درمان ایمپلنت و درمان‌های همراه آن را که توسط پزشک معالج در {clinic} برایم توضیح داده شده است، می‌پذیرم.
۱. روش درمان، مراحل، مدت تقریبی درمان و گزینه‌های درمانی جایگزین برای من توضیح داده شد و فرصت پرسیدن سؤال داشتم.
۲. می‌دانم که مانند هر جراحی دیگری، عوارضی مانند درد، تورم، کبودی، خونریزی، عفونت، بی‌حسی موقت یا در موارد نادر طولانی لب و چانه، درگیری سینوس و عدم جوش خوردن یا از دست رفتن ایمپلنت ممکن است رخ دهد و در این صورت درمان تکمیلی لازم می‌شود.
۳. سابقه‌ی پزشکی، داروهای مصرفی و حساسیت‌های خود را به‌طور کامل و صحیح اعلام کرده‌ام و مسئولیت اعلام نکردن آن‌ها با خودم است.
۴. متعهد می‌شوم دستورات بهداشتی و دارویی پزشک را رعایت کنم، در نوبت‌های کنترل حاضر شوم و از استعمال دخانیات در دوره‌ی درمان پرهیز کنم.
۵. هزینه‌ها و شرایط پرداخت که در این طرح درمان نوشته شده است را مطالعه کرده و می‌پذیرم. قیمت‌ها تقریبی است و تغییر طرح درمان می‌تواند هزینه را تغییر دهد.`;
const consentText=r=>(SET.consent||DEFAULT_CONSENT).replace(/\{name\}/g,(r.h.name||'').trim()||'……………').replace(/\{clinic\}/g,SET.clinic||'کلینیک')+cons2Text(r);
const SG={drawn:false,btn:null};
/* openSign = base + the ex1 (h) layer (finance/ex1.js: guardian chips of the consent sheet), which also runs when the sheet is skipped and the
   plan goes straight to finalize; ex1GuardBind lives in finance/ex1.js and its errors are swallowed as before */
function openSign(t){if(!(F.h.name||'').trim()||(F.brand==='ref'&&needBrand(F)&&!(F.pay&&F.pay.blater))){finalize(t)}else{SG.btn=t;SG.drawn=false;$('sgnTxt').textContent=consentText(F);$('sgnMsg').textContent='';
  const c=$('sgnPad'),cx=c.getContext('2d');cx.clearRect(0,0,c.width,c.height);$('sgnSkip').textContent=F.sign?'ادامه با امضای قبلی':'ثبت نهایی بدون امضا';$('sgnSheet').hidden=false}
  /* ex1 (h) */
  try { ex1GuardBind(); const g = F && F.h && F.h.guard; document.querySelectorAll('#sgnSheet [data-ex1g]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.ex1g === '1') === !!g))); const w = $('ex1GW'); if (w) { w.hidden = !g; $('ex1_gname').value = g ? g.name || '' : ''; $('ex1_grel').value = g ? g.rel || '' : '' } } catch (e) { } }
(function(){const c=$('sgnPad');if(!c)return;const cx=c.getContext('2d');let on=false,last=null;
  const pt=e=>{const r=c.getBoundingClientRect();return [(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
  c.addEventListener('pointerdown',e=>{on=true;last=pt(e);c.setPointerCapture(e.pointerId);e.preventDefault()});
  c.addEventListener('pointermove',e=>{if(!on)return;const p=pt(e);cx.strokeStyle='#0b1f4a';cx.lineWidth=4.2;cx.lineCap='round';cx.lineJoin='round';cx.beginPath();cx.moveTo(last[0],last[1]);cx.lineTo(p[0],p[1]);cx.stroke();last=p;SG.drawn=true;e.preventDefault()});
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>c.addEventListener(ev,()=>{on=false}))})();
function signData(){const c=$('sgnPad'),o=document.createElement('canvas');o.width=600;o.height=200;const x=o.getContext('2d');x.drawImage(c,0,0,600,200);return o.toDataURL('image/png')}
const loadImg=src=>new Promise(ok=>{if(!src)return ok(null);const im=new Image();im.onload=()=>ok(im);im.onerror=()=>ok(null);im.src=src});

