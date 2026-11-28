
/* ---------- pk1: consultant form — «تخفیف کلی» (clinic / doctor / total share, reason required) and «گاید جراحی» (amount per jaw typed by the consultant;
   default from settings «سرجیکال گاید · هر فک» when set). Both live in F.pay (gdm/gdv/gdw/gdwhy, sgdj/sgda) and flow into the totals, the cash/cheque split,
   the PDF and (server) the day's auto invoice in accounting. ---------- */
const PK1_W={c:'سهم کلینیک',d:'سهم پزشک',t:'کل (به نسبت سهم‌ها)'},PK1_J={U:'فک بالا',L:'فک پایین',B:'هر دو فک'};
var PK1={off:false};
const pk1N=v=>{const n=Number(toEn(String(v==null?'':v)).replace(/[^\d.]/g,''));return isFinite(n)?n:0};
function pk1Sgd(p){p=p||{};const j=PK1_J[p.sgdj]?p.sgdj:'';const a=Math.round(pk1N(p.sgda));if(!j||!a)return {n:0,amt:0,j:'',a:0};const n=j==='B'?2:1;return {n,amt:n*a,j,a}}
function pk1GdRaw(p){p=p||{};const v=pk1N(p.gdv);if(!v)return null;return {m:p.gdm==='p'?'p':'a',v,w:PK1_W[p.gdw]?p.gdw:'c',why:String(p.gdwhy||'').trim()}}
function pk1GdAmt(p,gross){const g=pk1GdRaw(p);if(!g||!(gross>0))return 0;return Math.min(gross,g.m==='p'?Math.round(gross*Math.min(100,g.v)/100):Math.round(g.v))}
/* totals: guide + global discount — merged into totals (prosthesis/calc.js), switched off by PK1.off */
/* the recorded sessions' actual cost: sessions priced without the file-level items, then the guide once and the surgery share of the discount once */
{const _s=surgActual;surgActual=function(rec,sessions){PK1.off=true;let t;try{t=_s.apply(this,arguments)}finally{PK1.off=false}try{const p=(rec&&rec.pay)||{};const sg=pk1Sgd(p);t+=sg.amt;const T=totals(rec);if(T.gd)t-=T.gd.dS}catch(e){}return Math.max(0,Math.round(t))}}
/* form block (consultant) */
function pk1Block(){const p=(F&&F.pay)||{},sg=pk1Sgd(p),g=pk1GdRaw(p),chip=(k,v,on,l)=>`<button type="button" class="chip" data-${k}="${v}" aria-pressed="${on}">${l}</button>`;
  return `<div class="pk1" id="pk1Box"><div class="grp"><span>گاید جراحی (اختیاری)</span><div class="chips" id="pk1Jaw">${chip('pk1j','',!PK1_J[p.sgdj],'ندارد')}${Object.keys(PK1_J).map(k=>chip('pk1j',k,p.sgdj===k,PK1_J[k])).join('')}</div></div>
    <div class="fields pk1f"${PK1_J[p.sgdj]?'':' hidden'}><label class="f">مبلغ گاید هر فک (تومان)<input id="p_sgda" class="price" inputmode="numeric" value="${esc(p.sgda||'')}" placeholder="تومان"></label><div class="calc" id="pk1SgdC">${sg.amt?`${fa(sg.n)} فک × ${fa(sg.a)} = <b>${fa(sg.amt)}</b> تومان (به پارت جراحی اضافه می‌شود)`:''}</div></div>
    <div class="grp"><span>تخفیف کلی (اختیاری)</span><div class="seg" role="group" aria-label="واحد تخفیف">${['p','a'].map(m=>`<button type="button" data-pk1m="${m}" aria-pressed="${(p.gdm||'a')===m}">${m==='p'?'درصد':'تومان'}</button>`).join('')}</div></div>
    <div class="fields pk1f"><label class="f">مقدار تخفیف (${(p.gdm||'a')==='p'?'٪':'تومان'})<input id="p_gdv" class="price" inputmode="numeric" value="${esc(p.gdv||'')}"></label><label class="f">دلیل تخفیف${g?' *':''}<input id="p_gdwhy" maxlength="200" value="${esc(p.gdwhy||'')}" placeholder="مثلاً معرف، کارمند، توافق مدیر"></label></div>
    <div class="grp"${g?'':' hidden'}><span>از سهم</span><div class="chips">${Object.keys(PK1_W).map(k=>chip('pk1w',k,(p.gdw||'c')===k,PK1_W[k])).join('')}</div></div><p class="note" id="pk1GdC"></p></div>`}
function pk1Mount(){const a=document.querySelector('#payCard p.note[data-pk1a]');if(!a||$('pk1Box'))return;a.insertAdjacentHTML('beforebegin',pk1Block())}
function pk1Refresh(){const b=$('pk1Box');if(!b||!F)return;const p=F.pay||{},keep=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#pk1Box')?document.activeElement.id:'';
  b.outerHTML=pk1Block();if(keep){const i=$(keep);if(i){i.focus();try{i.setSelectionRange(i.value.length,i.value.length)}catch(e){}}}
  try{const T=totals({s:AS(),brand:F.brand,pay:p}),c=$('pk1GdC');if(c){if(T.gd){const bn=(BRANDS.find(x=>x.k===T.gd.brand)||{}).n||'';c.innerHTML=`تخفیف کلی <b>${fa(T.gd.d)}</b> تومان از ${esc(PK1_W[T.gd.w])}${T.gd.dS&&T.gd.dP?` (پارت جراحی ${fa(T.gd.dS)} · پارت پروتز ${fa(T.gd.dP)})`:''}${bn&&needBrand(F)?' · برند '+esc(bn):''}${T.gd.why?'':' — <b class="late">دلیل تخفیف را بنویسید</b>'}`}else c.textContent=''}}catch(e){}}
/* totals card: two extra rows */
function pk1Rows(){const el=$('t_all');if(!el||!F)return;const row=el.closest('.rowline');if(!row)return;let g=$('pk1RowG'),d=$('pk1RowD');
  if(!g){row.insertAdjacentHTML('beforebegin',`<div class="rowline pk1row" id="pk1RowG" hidden><span>گاید جراحی</span><span id="pk1RowGv"></span></div><div class="rowline pk1row" id="pk1RowD" hidden><span>تخفیف کلی</span><span id="pk1RowDv"></span></div>`);g=$('pk1RowG');d=$('pk1RowD')}
  try{const T=totals({s:AS(),brand:F.brand,pay:F.pay});g.hidden=!T.sgd;if(T.sgd)$('pk1RowGv').textContent=fa(T.sgd.amt)+' (در پارت جراحی)';d.hidden=!T.gd;if(T.gd)$('pk1RowDv').textContent='− '+fa(T.gd.d)+' · '+PK1_W[T.gd.w]}catch(e){}}
{const _r=recalc;recalc=function(){const r=_r.apply(this,arguments);try{if(F&&F.pay){const T=totals({s:AS(),brand:F.brand,pay:F.pay});F.pay.gdAmt=T.gd?String(T.gd.d):'';F.pay.gdS=T.gd?String(T.gd.dS):'';F.pay.gdP=T.gd?String(T.gd.dP):'';F.pay.sgdAmt=T.sgd?String(T.sgd.amt):''}pk1Rows();pk1Refresh()}catch(e){}return r}}
{const _f=renderForm;renderForm=function(){const r=_f.apply(this,arguments);try{pk1Mount();pk1Refresh();pk1Rows()}catch(e){}return r}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pk1j],[data-pk1m],[data-pk1w]');if(!t||!F||!F.pay)return;e.preventDefault();const p=F.pay;
  if(t.dataset.pk1j!==undefined){p.sgdj=t.dataset.pk1j;if(!p.sgdj)p.sgda='';else if(!pk1N(p.sgda)){const d=A6P('arc_sgd');if(d)p.sgda=String(d)}}
  else if(t.dataset.pk1m){p.gdm=t.dataset.pk1m}else{p.gdw=t.dataset.pk1w}
  touch();recalc();if(t.dataset.pk1j&&!pk1N(p.sgda))setTimeout(()=>{try{$('p_sgda').focus()}catch(e){}},30)},true);
/* reason required before the final confirmation */
{const _z=finalize;finalize=async function(t){try{if(F&&F.pay&&pk1GdRaw(F.pay)&&!String(F.pay.gdwhy||'').trim()){alertMsg('برای تخفیف کلی، «دلیل تخفیف» را بنویسید.');const i=$('p_gdwhy');if(i){i.focus();i.scrollIntoView({behavior:'smooth',block:'center'})}return}}catch(e){}return _z.apply(this,arguments)}}
/* PDF: the guide and the discount under «شرایط پرداخت» */
{const _p=payBlock;payBlock=function(r){const b=_p.apply(this,arguments);try{const T=totals(r),L=[];if(T.sgd)L.push(`گاید جراحی: ${PK1_J[T.sgd.j]} — ${fa(T.sgd.n)} × ${fa(T.sgd.a)} = ${fa(T.sgd.amt)} تومان (در پارت جراحی منظور شده)`);
  if(T.gd)L.push(`تخفیف کلی: ${fa(T.gd.d)} تومان از ${PK1_W[T.gd.w]}${T.gd.dS&&T.gd.dP?` (پارت جراحی ${fa(T.gd.dS)} · پارت پروتز ${fa(T.gd.dP)})`:''}${T.gd.why?' — دلیل: '+T.gd.why:''} (در مبالغ بالا کسر شده)`);
  if(!L.length)return b;const e=textBlock('',L);return {h:b.h+e.h,keep:b.keep,draw(cx,top){b.draw(cx,top);e.draw(cx,top+b.h)}}}catch(e){return b}}}
/* patient file summary (consultant / reception): one line */
{const _s=typeof pSumRender==='function'?pSumRender:null;if(_s)pSumRender=function(){const r=_s.apply(this,arguments);try{const T=totals({s:AS(),brand:F.brand,pay:F.pay});const el=document.querySelector('#pSum .pk1s');if(el)el.remove();if(T.gd||T.sgd){const box=$('pSum');if(box)box.insertAdjacentHTML('beforeend',`<div class="pk1s meta">${T.sgd?'گاید جراحی '+fa(T.sgd.amt)+' تومان':''}${T.sgd&&T.gd?' · ':''}${T.gd?'تخفیف کلی '+fa(T.gd.d)+' تومان ('+esc(PK1_W[T.gd.w])+')':''}</div>`)}}catch(e){}return r}}
/* thousands separators while typing (toman boxes) */
document.addEventListener('input',e=>{const i=e.target;if(!i||!F||!F.pay)return;if(i.id==='p_sgda'||(i.id==='p_gdv'&&(F.pay.gdm||'a')!=='p')){try{const v=fmtInput(i.value);if(v!==i.value)i.value=v}catch(x){}}},true);
