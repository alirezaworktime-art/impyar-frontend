/* ---------- fx3: payment warning with a reason · collection tasks · consultant price quote · photos (camera / gallery / scanner, before–after) ---------- */
/* ---- 1. payment warning: the server asks for a reason; the call is repeated with it ---- */
const FX3SL={surg:'ارجاع به جراحی',dis:'ترخیص',deliv:'تحویل پروتز'};
function fx3Ack(short,step,msg){return new Promise(res=>{const s=fxSheet('fx3AckSheet',`<h3>⚠ پرداخت بیمار کامل نیست</h3>
  <p><b>${esc(FX3SL[step]||'')}</b>: ${esc(msg)}${short?` <b>${fa(short)} تومان</b> طبق قرار پرداخت هنوز دریافت یا با چک تعهد نشده.`:''}</p>
  <p class="note">اگر با وجود این ادامه می‌دهید، دلیل را بنویسید. دلیل و نام شما در تاریخچه‌ی پرونده ثبت می‌شود و برای پذیرش کار «وصول مانده» ساخته می‌شود.</p>
  <label class="f">دلیل ادامه (الزامی)<textarea id="fx3AckR" rows="3" maxlength="300" placeholder="مثلاً: بیمار فردا مانده را واریز می‌کند؛ هماهنگ با مدیر"></textarea></label><div class="msg" id="fx3AckM"></div>
  <div class="btns"><button class="btn" type="button" id="fx3AckGo" style="flex:1">ثبت دلیل و ادامه</button><button class="btn ghost" type="button" id="fx3AckNo">انصراف</button></div>`);
  const done=v=>{s.hidden=true;res(v)};$('fx3AckGo').onclick=()=>{const v=$('fx3AckR').value.trim();if(v.length<3){$('fx3AckM').className='msg err';$('fx3AckM').textContent='دلیل را بنویسید.';return}done(v)};$('fx3AckNo').onclick=()=>done('');setTimeout(()=>{try{$('fx3AckR').focus()}catch(e){}},60)})}
{const _api=api;api=async function(action,payload={},opt={}){
  if(action==='confirm'&&payload&&payload.record&&payload.record.data){try{const r=fromDoc(payload.record.id||'',payload.record.data),S0=partS(r),P0=partP(r),T=Number(payload.record.total)||planTotal(r)||0;payload.record.data.parts=fx6bParts(r,S0,P0,T)}catch(e){}}
  try{return await _api(action,payload,opt)}catch(e){const m=/^ACK\|(\d+)\|(\w+)\|([\s\S]*)$/.exec((e&&e.message)||'');if(!m)throw e;
    const reason=await fx3Ack(Number(m[1]),m[2],m[3]);if(!reason)throw new Error('انجام نشد: پرداخت بیمار کامل نیست.');
    return await _api(action,Object.assign({},payload,{payAck:reason}),opt)}}}
Object.assign(TLBL,{collect:['وصول مانده‌ی پرداخت','درمان با پرداخت ناقص ادامه یافت یا تسویه به بعد موکول شد؛ تماس بگیرید و مانده را وصول کنید.'],paylost:['تعیین تکلیف پرداختی بیمار انصرافی','بیمار انصراف داده ولی پول یا چک داده است؛ با مشاور و حسابداری درباره‌ی استرداد یا برگرداندن چک‌ها تصمیم بگیرید.']});
Object.assign(TGRP,{collect:'fl',paylost:'fl'});
/* daily form: part (surgery / prosthesis) and card reader of each payment */
function fx3PayX(p,i){const L=(POSL||[]).filter(x=>Number(x.active));if(!POSL)ensurePos().then(()=>{try{fiDraw()}catch(e){}});
  return `<label class="f">بخش<select data-fip="part" data-i="${i}"><option value="s"${(p.part||'s')==='s'?' selected':''}>جراحی</option><option value="p"${p.part==='p'?' selected':''}>پروتز</option></select></label>${p.kind==='card'&&L.length?`<label class="f">کارتخوان<select data-fip="pos" data-i="${i}"><option value="">انتخاب کنید</option>${L.map(x=>`<option value="${esc(x.id)}"${p.pos===x.id?' selected':''}>${esc(x.name)}</option>`).join('')}</select></label>`:''}`}
/* ---- 2. price quote: brand later, validity date, prices refreshed when the patient returns ---- */
const FX3QW='استعلام قیمت؛ برند را بعداً انتخاب می‌کند';UN_WHY.unshift(FX3QW);
{const _su=sendUndecided;sendUndecided=async function(t){if(UN&&UN.why===FX3QW){const u=parseJ(($('fx3_until')||{}).value||'');F.quote={at:tDay(),until:u&&u>=tDay()?u:dAdd(tDay(),30)}}return _su(t)}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-unw]');if(!t)return;setTimeout(()=>{const q=t.dataset.unw===FX3QW;['fx3QW','fx3QB'].forEach(id=>{const el=$(id);if(el)el.hidden=!q});const i=$('fx3_until');if(q&&i&&!i.value)i.value=jDay(dAdd(tDay(),30))},0)});
async function fx3QuotePdf(btn){btn.disabled=true;try{const u=parseJ(($('fx3_until')||{}).value||'')||dAdd(tDay(),30),r=Object.assign({},F,{quote:{at:tDay(),until:u},brand:'ref'});const p=await buildPDF(r,{jalali:jalali(new Date()).slash,title:'استعلام قیمت ایمپلنت',quote:1});downloadBlob(p.blob,safeName(F.h.name||'بیمار')+' - استعلام قیمت.pdf');toast('PDF استعلام قیمت ساخته شد.')}catch(e){alertMsg('PDF ساخته نشد: '+e.message)}finally{btn.disabled=false}}
function fx3Refresh(){const B=blankSections(),doS=s=>{if(!s)return;Object.keys(B).forEach(id=>{const b=B[id],x=s[id];if(!x)return;x.price=b.price;x.bp=Object.assign({},b.bp);x.ip=Object.assign({},x.ip||{},b.ip)})};
  doS(F.s);(F.sx||[]).forEach(doS);F.quote=Object.assign({},F.quote||{},{upd:tDay()});dirty=true;renderForm();toast('قیمت‌ها با تعرفه‌ی امروز به‌روز شد؛ برند را انتخاب و ثبت کنید.')}
{const _rf=renderForm;renderForm=function(){const r=_rf.apply(this,arguments);try{fx3QBanner()}catch(e){}return r}}
function fx3QBanner(){const v=$('viewForm');if(!v)return;const old=$('fx3Ban');if(old)old.remove();const q=F&&F.quote;if(!q||!q.at||F.status==='confirmed'||!['consultant','doctor'].includes(ROLE))return;
  const exp=q.until&&q.until<tDay(),b=document.createElement('div');b.id='fx3Ban';b.className='qwarn fx3ban'+(exp?' exp':'');
  b.innerHTML=`<b>استعلام قیمت ${esc(jDay(q.at))}</b> · اعتبار تا ${esc(jDay(q.until||''))}${exp?' — <b>اعتبار تمام شده</b>':''}${q.upd?` · قیمت‌ها ${esc(jDay(q.upd))} به‌روز شد`:''}<button class="btn sm" type="button" id="fx3Ref">به‌روزرسانی قیمت‌ها با تعرفه‌ی امروز</button>`;v.insertBefore(b,v.firstChild)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#fx3Ref,#fx3QPdf');if(!t)return;e.preventDefault();if(t.id==='fx3Ref')fx3Refresh();else fx3QuotePdf(t)});
/* ---- 3. photos: camera / gallery or file / scanner, drag and drop, before–after side by side ---- */
document.addEventListener('change',e=>{const t=e.target;if(t&&(t.id==='imgCam'||t.id==='imgScan')&&t.files&&t.files.length&&!IMG.busy){const F2=[...t.files];t.value='';imgUpload(F2)}});
document.addEventListener('dragover',e=>{const d=e.target.closest&&e.target.closest('#fx3Drop');if(!d)return;e.preventDefault();d.classList.add('on')});
document.addEventListener('dragleave',e=>{const d=e.target.closest&&e.target.closest('#fx3Drop');if(d)d.classList.remove('on')});
document.addEventListener('drop',e=>{const d=e.target.closest&&e.target.closest('#fx3Drop');if(!d)return;e.preventDefault();d.classList.remove('on');const F2=[...(e.dataTransfer&&e.dataTransfer.files||[])];if(F2.length&&!IMG.busy)imgUpload(F2)});
const fx3Pair=F=>{const P=(F||[]).filter(f=>f.kind==='pre'&&f.mime!=='application/pdf').sort((a,b)=>a.at<b.at?-1:1),Q=(F||[]).filter(f=>f.kind==='post'&&f.mime!=='application/pdf').sort((a,b)=>a.at<b.at?1:-1);return P.length&&Q.length?[P,Q]:null};
function fx3Cmp(F){const pq=fx3Pair(F);if(!pq)return '';const [P,Q]=pq,a=P[0],b=Q[0];
  const fig=(f,l)=>`<figure><button type="button" class="imth" data-imv="${esc(f.id)}" title="${esc(f.name||'')}">${f.thumb?`<img src="${esc(f.thumb)}" alt="${l}">`:''}</button><figcaption>${l} · ${esc(jd(f.at))}</figcaption></figure>`;
  return `<h3 class="pf-h">مقایسه‌ی قبل و بعد از درمان</h3><div class="fx3cmp">${fig(a,'قبل')}${fig(b,'بعد')}</div>${P.length+Q.length>2?'<p class="note">اولین عکس «قبل» و آخرین عکس «بعد» کنار هم آمده‌اند؛ بقیه پایین‌تر.</p>':''}`}
async function fx3CmpPdf(j){const pq=fx3Pair(j.files);if(!pq)return [];try{const g=async f=>{const r=await api('fileGet',{fid:f.id});const im=await new Promise(z=>{const i=new Image();i.onload=()=>z(i);i.onerror=()=>z(null);i.src='data:'+r.file.mime+';base64,'+r.file.data});return im};
  const [a,b]=await Promise.all([g(pq[0][0]),g(pq[1][0])]);if(!a||!b)return [];const w=Math.floor((C.R-C.L-30)/2),ha=w*a.height/a.width,hb=w*b.height/b.width,h=Math.min(Math.max(ha,hb),700),da=pq[0][0].at,db=pq[1][0].at;
  return [ffTitle('مقایسه‌ی قبل و بعد از درمان'),{h:h+50,keep:true,draw(cx,top){[[a,C.R-w,'قبل · '+jd(da)],[b,C.L,'بعد · '+jd(db)]].forEach(([im,x,l])=>{const s=Math.min(w/im.width,h/im.height),iw=im.width*s,ih=im.height*s;cx.drawImage(im,x+(w-iw)/2,top+6,iw,ih);box(cx,x,top+6,w,h,null,'#bbb',1);T(cx,l,x+w/2,top+h+28,{s:18,w:700,a:'center'})})}}]}catch(e){return []}}
/* ---- consultant: the settings sheet also opens for the manager ---- */
/* ---- consultant: only «مشاوره», «تنظیمات», «بایگانی» (no «صف من») ---- */
delete MQ_HOME.consultant;
try{if(HINTS&&HINTS.consultant)HINTS.consultant=['بیماران منتظر مشاوره و تسویه‌ی اختلاف هزینه در «مشاوره» هستند؛ همه‌ی بیماران در «بایگانی».','در فرم طرح، «جمع نقد دریافتی» و «تاریخ اولین چک» را بنویسید؛ چک‌ها خودکار حساب می‌شوند.']}catch(e){}
