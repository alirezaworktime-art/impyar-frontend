/* ---------- m48a (owner, 2026-11-18) — page only:
   (1) money boxes get thousands separators while typing (also when a digit is edited in the middle); «نقد دریافتی امروز», the payment amount and the cheque amounts of
       «تعیین تکلیف مالی» also show the amount in words (میلیون / هزار) under the box;
   (2) plan form: «بیمار نیاز به مشاوره‌ی دندانپزشک عمومی دارد» (F.h.gen, note F.h.genN) — a banner for the consultant in the form and for everyone in the patient file;
   (3) consultant: the button «درمان‌های انتخاب نشده در طرح درمان» is large and coloured, and is also in the floating bar at the bottom;
   (5) the file comments (typed and pen) are printed in «PDF طرح» and in the PDF of paper files; pen comments show their image in «همه‌ی توضیح‌ها», which can be printed;
   (7) bug: after an error in «ثبت نهایی» (brand not chosen …) the next press skipped the four «نتیجه‌ی مشاوره» choices and used the old one. ---------- */
/* (1) */
const m48Grp=v=>toEn(String(v)).replace(/[^\d]/g,'').replace(/^0+(?=\d)/,'').replace(/\B(?=(\d{3})+(?!\d))/g,',');
function m48Words(n){n=Math.floor(Number(n)||0);if(n<1000)return n?fa(n)+' تومان':'';const P=[];const b=Math.floor(n/1e9),m=Math.floor(n%1e9/1e6),k=Math.floor(n%1e6/1e3),r=n%1e3;if(b)P.push(fa(b)+' میلیارد');if(m)P.push(fa(m)+' میلیون');if(k)P.push(fa(k)+' هزار');if(r)P.push(fa(r));return P.join(' و ')+' تومان'}
const m48IsMoney=i=>!!i&&i.tagName==='INPUT'&&i.matches&&i.matches('input.price,input.mny,#pc_cash,#py_amount,[data-m12a]')&&!i.readOnly&&!i.disabled;
const m48HasW=i=>i.matches('#pc_cash,#py_amount,[data-m12a],#pl9_rcv');
function m48Hint(i){try{if(!i||!m48HasW(i))return;let w=i.nextElementSibling;if(!w||!w.classList||!w.classList.contains('m48w')){w=document.createElement('small');w.className='m48w';i.insertAdjacentElement('afterend',w)}w.textContent=m48Words(num(i.value))}catch(e){}}
document.addEventListener('input',e=>{const i=e.target;if(!m48IsMoney(i))return;try{const raw=i.value,en=toEn(raw);
  if(!/[.\/٫%]/.test(en)&&en.replace(/[^\d]/g,'').length>=4){const f=m48Grp(raw);if(f!==raw){let pos=null;try{pos=i.selectionStart}catch(x){}const right=pos==null?0:toEn(raw.slice(pos)).replace(/[^\d]/g,'').length;i.value=f;
      if(pos!=null&&document.activeElement===i){let c=f.length,d=0;while(c>0&&d<right){c--;if(/\d/.test(f[c]))d++}try{i.setSelectionRange(c,c)}catch(x){}}}}
  m48Hint(i)}catch(x){}});
document.addEventListener('focusin',e=>{const i=e.target;if(m48IsMoney(i))m48Hint(i)});
{const _o=openPostConfirm;openPostConfirm=function(){const r=_o.apply(this,arguments);try{setTimeout(()=>{m48Hint($('pc_cash'));document.querySelectorAll('#pcSheet [data-m12a]').forEach(m48Hint)},60)}catch(e){}return r}}
/* (7) a real press on the button always asks the result again */
window.addEventListener('click',e=>{try{if(!e.isTrusted||!e.target.closest||!e.target.closest('#confirmBtn'))return;if(ROLE!=='consultant'||!F||!F._next)return;const open=id=>{const s=$(id);return !!s&&!s.hidden};if(open('pkSheet')||open('sgnSheet'))return;delete F._next}catch(x){}},true);
/* (3) m48More runs at the end of m11Vis (consultant/layer.js) */
function m48More(){const b=$('m11More'),bar=document.querySelector('#formBar .btns');let x=$('m48BarMore');
  if(!b||ROLE!=='consultant'||(typeof SURG!=='undefined'&&SURG)){if(x)x.remove();return}
  const bt=b.querySelector('button');if(bt){bt.className='m48more';bt.dataset.on=M11_SHOW?'1':'0'}
  if(!bar)return;if(!x){bar.insertAdjacentHTML('afterbegin','<button class="btn" id="m48BarMore" type="button" data-m11more="1"></button>');x=$('m48BarMore')}
  x.textContent=M11_SHOW?'پنهان کردن انتخاب‌نشده‌ها':'درمان‌های انتخاب‌نشده'}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#m48BarMore');if(!t)return;setTimeout(()=>{try{if(!M11_SHOW)return;const c=document.querySelector('#viewForm .m11hide.m11show');if(c)c.scrollIntoView({block:'start',behavior:'smooth'})}catch(x){}},60)});
/* leaveForm: removing the bar button is now part of the single definition in pdf/background-send-queue-doctor-never.js */
/* (2) */
const M48_GT='بیمار نیاز به مشاوره‌ی دندانپزشک عمومی دارد';
function m48GenCan(){return ROLE==='doctor'||ROLE==='consultant'}
function m48GenMount(){try{const old=$('m48Gen'),ob=$('m48GenB');if(!F||!F.h||(typeof SURG!=='undefined'&&SURG)){if(old)old.remove();if(ob)ob.remove();return}
  const on=!!F.h.gen,ro=!m48GenCan(),h=`<section class="card" id="m48Gen"><h2>مشاوره‌ی عمومی <span class="tag">دندانپزشک عمومی</span></h2><label class="chk full"><input type="checkbox" id="m48GenC"${on?' checked':''}${ro?' disabled':''}> ${M48_GT}</label><p class="note">با زدن این گزینه، مشاور و پذیرش می‌بینند که باید برای بیمار وقت ویزیت با دندانپزشک عمومی گذاشته شود.</p><label class="f"${on?'':' hidden'}>برای چه کاری؟ (اختیاری)<input id="m48GenN" maxlength="200" value="${esc(F.h.genN||'')}" placeholder="مثلاً ترمیم، عصب‌کشی، جرم‌گیری"${ro?' disabled':''}></label></section>`;
  const tc=$('q5Card')||$('totalsCard');if(old)old.outerHTML=h;else if(tc)tc.insertAdjacentHTML('beforebegin',h);
  const sn=$('staffNote');if(on){const t=`<div class="m48genb" id="m48GenB">⚠ ${M48_GT}${ROLE==='consultant'?'<small>به پذیرش بگویید وقت ویزیت با دندانپزشک عمومی بدهد.</small>':''}<small class="m48gn">${esc(F.h.genN||'')}</small></div>`;if(ob)ob.outerHTML=t;else if(sn)sn.insertAdjacentHTML('afterend',t)}else if(ob)ob.remove()}catch(e){console.error('m48a gen',e)}}
{const _r=renderForm;renderForm=function(){const r=_r.apply(this,arguments);m48GenMount();return r}}
document.addEventListener('change',e=>{const t=e.target;if(!t||t.id!=='m48GenC'||!F||!F.h||!m48GenCan())return;if(t.checked)F.h.gen=1;else{delete F.h.gen;delete F.h.genN}touch();m48GenMount()});
document.addEventListener('input',e=>{const t=e.target;if(!t||t.id!=='m48GenN'||!F||!F.h||!m48GenCan())return;F.h.genN=t.value.slice(0,200);touch();const s=document.querySelector('#m48GenB .m48gn');if(s)s.textContent=F.h.genN});
/* file: banner + comments tab (5) */
{const _f=renderFile;renderFile=function(){const r=_f.apply(this,arguments);try{m48File()}catch(e){console.error('m48a file',e)}return r}}
function m48File(){if(!PF||!PF.j||PF.sess)return;const B=$('pfBody');if(!B)return;const j=PF.j,h=(j.data||{}).h||{};
  if(h.gen&&!B.querySelector('.m48genb')){B.insertAdjacentHTML('afterbegin',`<div class="m48genb">⚠ ${M48_GT}${ROLE==='staff'?'<small>یک نوبت «ویزیت» با دندانپزشک عمومی برای بیمار بگذارید.</small>':''}${h.genN?'<small>'+esc(h.genN)+'</small>':''}</div>`)}
  const L=B.querySelector('.m42bl');if(!L)return;
  const pens=(j.notes||[]).filter(n=>n.kind==='pen'&&n.img),used=new Set();
  L.querySelectorAll('.m42bc').forEach(c=>{const p=c.querySelector('p'),sm=c.querySelector('small');if(!p||!/^\(نوشته‌ی دستی\)/.test(p.textContent||'')||c.querySelector('img'))return;const n=pens.find(n=>!used.has(n.id)&&sm&&(sm.textContent||'').indexOf(jt(n.at))===0);if(!n)return;used.add(n.id);const im=document.createElement('img');im.className='fxn-img';im.alt='نوشته‌ی دستی';im.src=n.img;c.appendChild(im)});
  if(!B.querySelector('#m48CmPrint'))L.insertAdjacentHTML('beforebegin','<div class="btns m48cmp"><button class="btn sm" type="button" id="m48CmPrint">🖨 چاپ همه‌ی توضیح‌ها</button></div>')}
const M48_PCSS='body{font-family:Vazirmatn,Tahoma,sans-serif;font-size:12pt;color:#111;margin:14mm}h1{font-size:15pt;margin:0 0 4mm}.m42bc{border:1px solid #999;border-radius:6px;padding:3mm 4mm;margin:0 0 3mm;break-inside:avoid}.m42bh{display:flex;justify-content:space-between;gap:6mm;font-size:10.5pt}.m42bh small{color:#444}p{margin:2mm 0 0;white-space:pre-wrap}img{max-width:100%;margin-top:2mm;border:1px solid #bbb}';
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#m48CmPrint');if(!t||!PF||!PF.j)return;e.preventDefault();const L=document.querySelector('#pfBody .m42bl');if(!L)return;const h=(PF.j.data||{}).h||{};
  printHTML(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>توضیح‌های پرونده</title><style>${M48_PCSS}</style></head><body><h1>توضیح‌های پرونده‌ی ${esc(h.name||'بیمار')}${h.file?' · شماره پرونده '+esc(faD(String(h.file))):''}</h1>${L.innerHTML}</body></html>`)},true);
/* (5) PDFs */
async function m48Notes(id){try{if(PF&&PF.id===id&&PF.j&&Array.isArray(PF.j.notes))return PF.j.notes;return await pk3Notes(id,true)}catch(e){return []}}
async function m48NoteBlocks(j){try{const nb=await ntPdfBlocks(j||{});return nb.length?[ffGap(16)].concat(nb):[]}catch(e){return []}}
/* buildPDF: the notes blocks (window.M48PB) are now part of the single definition in pdf/built-pdf-writer-a4-pages.js */
