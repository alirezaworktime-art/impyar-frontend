/* ---------- appt1 (owner, 2026-10-30): reception «نوبت‌دهی» — one big button, two modes (surgery / prosthesis), a «نوبت‌های داده‌شده» tile
   (by day, then by kind) and per-kind referral to the doctor («ارجاع جهت آنکاوری»، «ارجاع برای قالب‌گیری» …). The doctor sees only referred appointments. ---------- */
const BKM={sg:{t:'نوبت‌دهی برای جراحی',k:['surg','uncover','chks','suture'],d:'surg'},pr:{t:'نوبت‌دهی برای پروتز',k:['impr','rscr','rabt','deliv','pother'],d:'impr'}};
const BKL={surg:'نوبت جراحی',uncover:'نوبت آنکاوری',chks:'چکاپ',suture:'کشیدن بخیه',impr:'قالب‌گیری',rscr:'امتحان رزین پیچ‌شونده',rabt:'امتحان رزین اباتمنت',deliv:'تحویل کار نهایی',pother:'سایر'};
var BKD={items:[],ver:null,at:0,f:'all',busy:0};
function bkModeOpen(){const s=mkSheet('bkmSheet',`<h3>نوبت‌دهی</h3><p class="note">نوبت برای چه کاری است؟</p><div class="bkm"><button type="button" class="bkmb sg" data-bkm="sg"><b>نوبت‌دهی برای جراحی</b><small>نوبت جراحی · نوبت آنکاوری · چکاپ · کشیدن بخیه</small></button><button type="button" class="bkmb pr" data-bkm="pr"><b>نوبت‌دهی برای پروتز</b><small>قالب‌گیری · امتحان رزین پیچ‌شونده · امتحان رزین اباتمنت · تحویل کار نهایی · سایر</small></button><button type="button" class="bkmb ot" data-bkm="ot"><b>نوبت‌دهی ویزیت و سایر</b><small>ویزیت · پیگیری بعد از جراحی · چکاپ دوره‌ای · چکاپ پروتز · ترمیم پیچ · برداشتن ایمپلنت · دندان نهفته · بافت نرم</small></button></div><div class="btns"><button type="button" class="btn ghost" id="bkmX">بستن</button></div>`);s.hidden=false}
function bkOpen(m){const M=BKM[m];if(!M)return;$('bkmSheet').hidden=true;openAppt({kind:M.d,mode:m,grp:m})}
/* the referral button on an appointment (reception, on the day of the appointment) */
const bkRefLbl=k=>AGRP.pr.includes(k)||AGRP.cp.includes(k)||k==='rpr'?'ارجاع برای '+(BKL[k]||AKL[k]||k):'ارجاع جهت '+(k==='chks'?'چکاپ':BKL[k]||AKL[k]||k);
function apRefBtn(a,st,n){if(ROLE!=='staff'||!CF_ON||st!=='set'||n>0||SG_K.includes(a.kind)||a.kind==='visit'||a.kind==='other')return '';
  if(a.ref)return `<span class="pill rev">ارجاع شد${a.refBy?' · '+esc(a.refBy):''}</span><button class="btn sm ghost" type="button" data-apref="${esc(a.id)}" data-apop="clear" data-plan="${esc(a.plan||'')}">لغو ارجاع</button>`;
  return `<button class="btn sm main" type="button" data-apref="${esc(a.id)}" data-apop="set" data-plan="${esc(a.plan||'')}">${esc(bkRefLbl(a.kind))}</button>`}
async function apRef(aid,op,plan,b){if(b)b.disabled=true;try{await api('apptRef',{aid,op,id:plan||'',by:USERNAME||ROLE_LBL[ROLE]});toast(op==='clear'?'ارجاع برداشته شد.':'به پزشک ارجاع شد.');BKD.ver=null;await pollQ(true);if(PF&&!$('pfSheet').hidden)refreshFile()}catch(e){alertMsg(e.message)}finally{if(b)b.disabled=false}}
/* «نوبت‌های داده‌شده»: upcoming appointments by day, then by kind */
const bkdG=k=>SG_K.includes(k)||k==='uncover'||AGRP.cs.includes(k)?'sg':AGRP.pr.includes(k)||AGRP.cp.includes(k)||k==='rpr'?'pr':'ot';
async function bkdLoad(force){if(ROLE!=='staff'||BKD.busy)return;if(!force&&BKD.ver===QV&&Date.now()-BKD.at<60000)return;BKD.busy=1;const td=tDay();
  try{const j=await api('apptList',{from:td,to:dAdd(td,90)});BKD.items=(j.items||[]).filter(a=>a.st==='set');BKD.ver=QV;BKD.at=Date.now();bkdRender()}catch(e){}finally{BKD.busy=0}}
function bkdCount(){const td=tDay();return BKD.at?BKD.items.length:QAPPT.filter(a=>a.st==='set'&&a.day>=td).length}
function bkdRender(){const L=$('bkdList');if(!L)return;const td=tDay(),A=BKD.items.filter(a=>BKD.f==='all'||bkdG(a.kind)===BKD.f),cnt={all:BKD.items.length,sg:0,pr:0,ot:0};BKD.items.forEach(a=>cnt[bkdG(a.kind)]++);
  $('bkdF').innerHTML=[['all','همه'],['sg','جراحی'],['pr','پروتز'],['ot','سایر']].filter(([k])=>k==='all'||cnt[k]).map(([k,l])=>`<button type="button" class="chip" data-bkdf="${k}" aria-pressed="${BKD.f===k}">${l} <b>${fa(cnt[k])}</b></button>`).join('');
  const days={};A.forEach(a=>(days[a.day]=days[a.day]||[]).push(a));/* perf2: booked appointments render the first 7 days */const D0=Object.keys(days).sort(),D=BKD.all?D0:D0.slice(0,7);L.dataset.n=BKD.items.length;
  L.innerHTML='<div data-tall hidden></div>'+(D.length?D.map(d=>{const R=days[d].sort(apSort),K={};R.forEach(a=>(K[a.kind]=K[a.kind]||[]).push(a));const n=dDiff(d,td),lbl=n===0?'امروز':n===1?'فردا':n===2?'پس‌فردا':'';
    return `<div class="bkday${n===0?' today':''}"><div class="bkdh"><b>${esc(wDay(d))} ${esc(jDay(d))}</b>${lbl?` <span class="pill ${n===0?'rev':''}">${lbl}</span>`:''}<small>${fa(R.length)} نوبت</small></div>${Object.keys(K).map(k=>`<div class="bkkind"><div class="bkkh kp-${kGrp(k)}">${esc(BKL[k]||AKL[k]||k)} <b>${fa(K[k].length)}</b></div>${K[k].map(a=>apptCard(Object.assign({},a))).join('')}</div>`).join('')}</div>`}).join('')+(D0.length>D.length?`<button class="btn ghost" type="button" style="width:100%;margin-top:8px" onclick="BKD.all=1;bkdRender()">نمایش ${fa(D0.length-D.length)} روز دیگر</button>`:''):`<div class="empty">${BKD.at?'نوبتی برای روزهای آینده ثبت نشده.':'در حال بارگذاری…'}</div>`)}
(function(){const _t=TILES.staff;TILES.staff=()=>{const L=_t();const i=L.findIndex(t=>t.k==='surg');L.splice(i+1,0,{k:'bkd',c:'chk',l:'نوبت‌های داده‌شده',s:'به تفکیک روز و نوع کار',n:bkdCount(),view:'recep'});return L}})();
TILE_HD.staff.surg='نوبت‌دهی';TILE_HD.staff.bkd='نوبت‌های داده‌شده (روزهای آینده)';
(function(){const _g=goTile;goTile=function(k){const r=_g.apply(this,arguments);try{if(ROLE==='staff'&&TILE==='bkd'){bkdLoad(true);bkdRender()}}catch(e){}return r}})();
/* the prosthesis doctor's day view: today only the referred appointments */
(function(){const _l=loadPday;loadPday=async function(){const r=await _l.apply(this,arguments);try{if(ROLE==='surgery'&&PD&&PD.appts){const td=tDay();PD.appts=PD.appts.filter(a=>a.day!==td||a.ref||l3Of(a.plan)||a.st==='done');renderPday()}}catch(e){}return r}})();
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-bkm],#bkmX,[data-apref],[data-bkdf],[data-bkdre]');if(!t)return;
  if(t.dataset.bkm){bkOpen(t.dataset.bkm);return}
  if(t.id==='bkmX'){$('bkmSheet').hidden=true;return}
  if(t.dataset.apref){e.stopPropagation();apRef(t.dataset.apref,t.dataset.apop,t.dataset.plan,t);return}
  if(t.dataset.bkdf){BKD.f=t.dataset.bkdf;bkdRender();return}
  if(t.dataset.bkdre){bkdLoad(true);return}},true);

