
/* ---------- pk2: surgery day — «کاشت مجدد» is «اول» or «دوم» and has a typed tariff per implant (default 0, owner's choice, same rule as the paper file / arc16);
   the consumables of that tooth stay at half price (ex1). Stored on the implant: m.ri (1|2), m.rp (toman). Accounting: service «کاشت مجدد» at the typed tariff (server). ---------- */
var PK2={ri:1,rp:''};
const PK2_RI={1:'کاشت مجدد اول',2:'کاشت مجدد دوم'};
const pk2N=v=>{const n=Math.round(Number(toEn(String(v==null?'':v)).replace(/[^\d.]/g,'')));return isFinite(n)&&n>0?n:0};
function pk2UI(){const w=$('pk2W');if(!w)return;w.hidden=IMPRS!=='redo';w.querySelectorAll('[data-pk2ri]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.pk2ri)===Number(PK2.ri))));const i=$('pk2_rp');if(i&&document.activeElement!==i)i.value=PK2.rp?fmtInput(String(PK2.rp)):''}
/* (xlRsBtns also redraws pk2UI: merged into finance/xl-implant-reason-per-fixture.js) */
{const _o=openImp;openImp=function(k,sid){const r=_o.apply(this,arguments);try{const m=(SURG&&SURG.imp[k])||{};PK2.ri=Number(m.ri)===2?2:1;PK2.rp=pk2N(m.rp)||'';pk2UI()}catch(e){}return r}}
{const _v=impSave;impSave=function(){const r=_v.apply(this,arguments);try{if(SURG&&$('impSheet').hidden&&SURG.imp[IMPK]){const m=SURG.imp[IMPK];if(m.rs==='redo'){m.ri=PK2.ri===2?2:1;m.rp=pk2N(PK2.rp)}else{delete m.ri;delete m.rp}renderImps()}}catch(e){}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#pk2W [data-pk2ri]');if(!b)return;e.preventDefault();PK2.ri=Number(b.dataset.pk2ri)===2?2:1;pk2UI()},true);
document.addEventListener('input',e=>{const i=e.target;if(!i||i.id!=='pk2_rp')return;const v=fmtInput(i.value);if(v!==i.value)i.value=v;PK2.rp=pk2N(i.value)||''},true);
const pk2Tag=m=>m&&m.rs==='redo'?' · '+(PK2_RI[Number(m.ri)]||PK2_RI[1])+' · تعرفه '+fa(pk2N(m.rp))+' تومان':'';
{const _r=renderImps;renderImps=function(){const r=_r.apply(this,arguments);try{document.querySelectorAll('#sgImps [data-impedit]').forEach(b=>{const m=SURG&&SURG.imp[b.dataset.impedit];const t=pk2Tag(m);if(t&&m&&m.b&&m.d&&m.l&&!b.querySelector('.pk2tag'))b.insertAdjacentHTML('beforeend','<small class="ex1tag pk2tag">'+esc(t)+'</small>')})}catch(e){}return r}}
/* price: ex1 took the whole fixture off; the typed tariff comes back (consumables of the tooth stay at half) */
/* (the subtraction itself is in ex1Adj, finance/ex1.js) */
/* the file and the surgery-day list: the label of a re-implant */
