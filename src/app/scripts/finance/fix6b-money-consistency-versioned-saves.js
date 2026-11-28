/* ---------- fix6b: money consistency, versioned saves, surgery difference choice, inventory ↔ surgery catalog ---------- */
const FX6_STALE='این پرونده در این فاصله تغییر کرده است؛ دوباره باز کنید.',FX6_SK='implantStale:';
/* A2: parts stored at confirm = what the signed texts ask for */
function fx6bParts(r,S0,P0,T){try{if(discOn(r)){const S=Math.max(0,S0-discAmt(r,S0));return {S,P:Math.max(0,T-S)}}}catch(e){}return {S:S0+P0>0?Math.round(S0*T/(S0+P0)):0,P:S0+P0>0?T-Math.round(S0*T/(S0+P0)):0}}
/* A9: the cash note says what the typed amount means (in cashNoteRender) */
/* A4: the version the form was opened with travels with every save / confirm */
function fx6bKeep(rec,ob){try{if(!rec||!rec.id||!rec.data)return;const d=Object.assign({},rec.data);delete d.sgDiff;
  localStorage.setItem(FX6_SK+rec.id,JSON.stringify({role:ROLE,at:Date.now(),d}));ldDel(rec.id);
  if(ob){try{if(PC&&PC.id===rec.id){const s=$('pcSheet');if(s)s.hidden=true;PC=null}}catch(e){}const n=OUTBOX.length;OUTBOX=OUTBOX.filter(o=>!(o.id===rec.id&&(o.kind==='consult'||o.kind==='confirm')));if(OUTBOX.length!==n){saveOutbox();try{SENDING.delete(rec.id)}catch(e){}try{obBar()}catch(e){}}}}catch(e){}}
function fx6bStaleGet(id){try{const x=JSON.parse(localStorage.getItem(FX6_SK+id)||'null');return x&&x.role===ROLE&&x.d?x:null}catch(e){return null}}
{const _a=api;api=async function(action,payload={},opt={}){try{return await _a(action,payload,opt)}catch(e){
  if(e&&e.message===FX6_STALE&&['save','toConsult','confirm','undecided'].includes(action)&&payload&&payload.record){fx6bKeep(payload.record,true);
    try{toast(FX6_STALE+' تغییرات شما روی همین دستگاه نگه داشته شد؛ پرونده را دوباره باز کنید و در صورت نیاز «بازگرداندن نسخه‌ی من» را بزنید.',true)}catch(x){}}
  throw e}}}
{const _pc=openPostConfirm;openPostConfirm=function(snap){try{if(snap&&snap.id&&fx6bStaleGet(snap.id))return}catch(e){}return _pc.apply(this,arguments)}}
/* a local draft based on an older version is not restored over the newer file: it is kept aside instead */
function fx6bBar(){let b=$('fx6Stale');if(b)b.remove();if(!F||!F.id)return;const s=fx6bStaleGet(F.id);if(!s)return;
  let when='';try{when=new Date(s.at).toLocaleString('fa-IR',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch(e){}
  b=document.createElement('div');b.id='fx6Stale';b.className='fx6stale';b.setAttribute('role','status');
  b.innerHTML='<div>تغییرات شما در این پرونده ('+esc(when)+') ثبت نشد، چون پرونده در این فاصله تغییر کرده بود. آن نسخه روی این دستگاه نگه داشته شده است.</div><div class="btns"><button class="btn sm" type="button" data-fx6st="use">بازگرداندن نسخه‌ی من</button><button class="btn sm ghost" type="button" data-fx6st="drop">دور انداختن</button></div>';
  const v=$('viewForm');if(v)v.insertBefore(b,v.firstChild)}
{const _of=openForm;openForm=function(){const x=_of.apply(this,arguments);try{fx6bBar()}catch(e){}return x}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-fx6st]');if(!t||!F||!F.id)return;const s=fx6bStaleGet(F.id);
  if(t.dataset.fx6st==='use'&&s){const cur=F,r=fromDoc(cur.id,s.d);r._v=cur._v;['status','jalali','emailStatus','pdfName','edits','surg'].forEach(k=>{if(cur[k]!==undefined)r[k]=cur[k]});F=r;CUR=1;renderForm();dirty=true;toast('نسخه‌ی شما بازگردانده شد؛ بررسی و ذخیره کنید.')}
  try{localStorage.removeItem(FX6_SK+F.id)}catch(x){}const b=$('fx6Stale');if(b)b.remove()});
/* A3: re-confirm of an operated patient — the consultant decides about the earlier surgery difference */
function fx6bSgAsk(){return new Promise(async res=>{try{
  if(ROLE!=='consultant'||!F||!F.id||!(F.status==='confirmed'||F.status==='modified')){if(F)delete F._sgd;return res(true)}
  let sg=F.surg||null;if(!sg&&CF_ON){try{const g=await api('get',{id:F.id},{timeout:8000});if(g.surg&&(g.surg.sessions||[]).length){sg=g.surg;F.surg=sg}}catch(e){}}
  const d=sg?Number(sg.diff)||0:0;if(!d){delete F._sgd;return res(true)}
  const s=mkSheet('fx6SgSheet','<h3>اختلاف هزینه‌ی جراحی قبلی</h3><p>هزینه‌ی جراحیِ انجام‌شده‌ی این بیمار <b>'+fa(Math.abs(d))+' تومان '+(d>0?'بیشتر':'کمتر')+'</b> از طرح قبلی بود'+(Number(sg.settledDiff)?' و تسویه شده است':'')+'.</p><p class="note">اگر طرح تازه همان کارهای انجام‌شده را دارد، اختلاف را صفر کنید تا دو بار حساب نشود. اگر طرح تازه فقط کارهای دیگر را دارد، اختلاف بماند.</p><div class="btns" style="flex-wrap:wrap"><button class="btn" type="button" id="fx6SgKeep" style="flex:1 1 200px">اختلاف بماند (جدا از طرح تازه)</button><button class="btn ghost" type="button" id="fx6SgZero" style="flex:1 1 200px">اختلاف صفر شود (در طرح تازه آمده)</button><button class="btn ghost" type="button" id="fx6SgNo">انصراف</button></div>');
  const done=v=>{s.hidden=true;if(v)F._sgd=v;res(!!v)};$('fx6SgKeep').onclick=()=>done('keep');$('fx6SgZero').onclick=()=>done('zero');$('fx6SgNo').onclick=()=>done('');s.hidden=false;setTimeout(()=>{try{$('fx6SgKeep').focus()}catch(e){}},60)}catch(e){res(true)}})}
{const _fz=finalize;finalize=async function(){if(busy)return;if(!(await fx6bSgAsk()))return;try{return await _fz.apply(this,arguments)}finally{if(F)delete F._sgd}}}
{const _dc=doConfirm;doConfirm=async function(){if(busy||!lastPDF)return _dc.apply(this,arguments);if(!(await fx6bSgAsk()))return;return _dc.apply(this,arguments)}}
/* A7: storekeeper — stock ↔ surgery catalog */
const ICAT={j:null,sel:{}};
(function(){const _s=i2Segs;i2Segs=function(){_s.apply(this,arguments);document.querySelectorAll('[data-iseg="icat"]').forEach(b=>b.hidden=ROLE!=='inventory');if(ROLE!=='inventory'&&INV.seg==='icat')INV.seg='fix'}})();
(function(){const _r=i2Render;i2Render=function(B,force){if(INV.seg==='icat'){$('invTools').hidden=true;return fx6bCatView(B,force)}return _r.apply(this,arguments)}})();
const fx6N=v=>toEn(String(v==null?'':v)).trim().replace(/\s+/g,' ').toLowerCase();
const fx6Num=v=>{const t=toEn(String(v==null?'':v)).trim().replace(/[\/٫,]/g,'.');const f=parseFloat(t);return isFinite(f)&&/^[\d.]+$/.test(t)?String(f):fx6N(t)};
function fx6bGroups(){const G={};((ICAT.j||{}).cat||[]).forEach(c=>{const g=c.b+'|'+c.sys,x=G[g]||(G[g]={b:c.b,sys:c.sys,d:{}});(x.d[c.d]=x.d[c.d]||[]).push(c.l)});
  Object.values(G).forEach(x=>Object.keys(x.d).forEach(d=>x.d[d].sort((a,b)=>Number(a)-Number(b))));return G}
const fx6Lbl=(b,sys,d,l)=>[b,sys].filter(Boolean).join(' ')+(d||l?' · '+[d,l].filter(Boolean).join(' × '):'');
function fx6bGuess(it,G){const ks=Object.keys(G);let g=ks.find(k=>fx6N(G[k].b)===fx6N(it.b)&&fx6N(G[k].sys)===fx6N(it.sys))||ks.find(k=>fx6N(G[k].b)===fx6N(it.b))||'';let d='',l='';
  if(g){d=Object.keys(G[g].d).find(x=>fx6Num(x)===fx6Num(it.d))||'';if(d)l=G[g].d[d].find(x=>fx6Num(x)===fx6Num(it.l))||''}return {g,d,l}}
function fx6bSelHTML(id,G){const s=ICAT.sel[id]||{},g=G[s.g],ds=g?Object.keys(g.d).sort((a,b)=>Number(a)-Number(b)):[],ls=g&&s.d&&g.d[s.d]?g.d[s.d]:[];
  const o=(v,t,on)=>'<option value="'+esc(v)+'"'+(on?' selected':'')+'>'+esc(t)+'</option>';
  return '<label>برند و سیستم<select data-fx6s="g" data-id="'+esc(id)+'">'+o('','انتخاب کنید',!s.g)+Object.keys(G).sort().map(k=>o(k,fx6Lbl(G[k].b,G[k].sys),k===s.g)).join('')+'</select></label>'
    +'<label>قطر<select data-fx6s="d" data-id="'+esc(id)+'"'+(g?'':' disabled')+'>'+o('','—',!s.d)+ds.map(v=>o(v,v,v===s.d)).join('')+'</select></label>'
    +'<label>طول<select data-fx6s="l" data-id="'+esc(id)+'"'+(s.d?'':' disabled')+'>'+o('','—',!s.l)+ls.map(v=>o(v,v,v===s.l)).join('')+'</select></label>'}
async function fx6bCatView(B,force){if(!ICAT.j||force){B.innerHTML='<div class="empty">در حال بارگذاری…</div>';try{ICAT.j=await api('invCat',{op:'list'});ICAT.sel={}}catch(e){B.innerHTML='<div class="msg err">'+esc(e.message)+'</div>';return}}fx6bCatDraw(B)}
function fx6bCatDraw(B){B=B||$('invBody');if(!B||!ICAT.j)return;const j=ICAT.j,G=fx6bGroups();
  (j.orphans||[]).forEach(it=>{if(!ICAT.sel[it.id])ICAT.sel[it.id]=fx6bGuess(it,G)});
  const units=(j.orphans||[]).reduce((a,x)=>a+(Number(x.qty)||0),0);
  const row=it=>'<div class="fx6it" data-fx6it="'+esc(it.id)+'"><div class="fx6nm"><b>'+esc(fx6Lbl(it.b,it.sys,it.d,it.l))+'</b><small>موجودی: '+fa(Number(it.qty)||0)+'</small></div><div class="fx6sel">'+fx6bSelHTML(it.id,G)+'</div><div class="fx6btn"><button class="btn sm" type="button" data-fx6map="'+esc(it.id)+'">تطبیق</button><button class="btn sm ghost" type="button" data-fx6out="'+esc(it.id)+'">خارج از فهرست</button></div></div>';
  const miss={};(j.missing||[]).forEach(c=>{const k=fx6Lbl(c.b,c.sys);(miss[k]=miss[k]||[]).push(c.d+'×'+c.l)});
  const M=ICAT.msg||{c:'',t:''};B.innerHTML='<div data-i2view="icat" class="fx6cat"><div class="msg'+(M.c?' '+M.c:'')+'" id="fx6CatMsg" role="status">'+esc(M.t)+'</div>'
    +'<section class="card"><h3>اقلام انبار که در فهرست جراحی نیستند ('+fa((j.orphans||[]).length)+' قلم، '+fa(units)+' عدد)</h3><p class="note">جراحی فقط اقلامی را از انبار کم می‌کند که برند، سیستم، قطر و طولشان با «فهرست ایمپلنت‌ها»ی تنظیمات یکی باشد. برای هر قلم ترکیب درست فهرست را انتخاب و «تطبیق» را بزنید؛ اگر همان ترکیب در انبار قلم دیگری دارد، دو قلم یکی می‌شوند. اقلامی را که در جراحی مصرف نمی‌شوند «خارج از فهرست» بزنید.</p>'
    +((j.orphans||[]).length?(j.orphans||[]).map(row).join(''):'<div class="empty">همه‌ی اقلام دارای موجودی با فهرست جراحی یکی هستند.</div>')+'<div class="btns"><button class="btn sm ghost" type="button" data-fx6ref="1">تازه کردن</button></div></section>'
    +((j.neg||[]).length?'<section class="card"><h3>اقلام فهرست با موجودی منفی</h3><p class="note">این اقلام را جراحی ساخته و از آن کم کرده، چون در انبار قلمی با همین نام نبود. معمولاً همان کالا با نام دیگری در انبار هست؛ آن قلم را در بخش بالا با همین ترکیب تطبیق دهید.</p><div class="fx6miss">'+(j.neg||[]).map(x=>esc(fx6Lbl(x.b,x.sys,x.d,x.l))+' ('+fa(Number(x.qty)||0)+')').join('، ')+'</div></section>':'')
    +((j.out||[]).length?'<section class="card"><h3>خارج از فهرست جراحی ('+fa(j.out.length)+')</h3>'+(j.out||[]).map(it=>'<div class="fx6it"><div class="fx6nm"><b>'+esc(fx6Lbl(it.b,it.sys,it.d,it.l))+'</b><small>موجودی: '+fa(Number(it.qty)||0)+'</small></div><div class="fx6btn"><button class="btn sm ghost" type="button" data-fx6in="'+esc(it.id)+'">برگرداندن به بررسی</button></div></div>').join('')+'</section>':'')
    +'<section class="card"><details><summary>ترکیب‌های فهرست جراحی که هنوز قلم انبار ندارند ('+fa((j.missing||[]).length)+')</summary><p class="note">با اولین جراحی، قلمی با موجودی منفی ساخته می‌شود. اگر این کالا را دارید، ورود انبار را با همین ترکیب ثبت کنید یا قلم موجود را تطبیق دهید.</p>'+Object.keys(miss).sort().map(k=>'<p class="fx6miss"><b>'+esc(k)+':</b> '+esc(miss[k].join('، '))+'</p>').join('')+'</details></section></div>'}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.fx6s)return;const id=t.dataset.id,s=ICAT.sel[id]||(ICAT.sel[id]={g:'',d:'',l:''});
  if(t.dataset.fx6s==='g'){s.g=t.value;s.d='';s.l=''}else if(t.dataset.fx6s==='d'){s.d=t.value;s.l=''}else s.l=t.value;
  const box=t.closest('.fx6sel');if(box){box.innerHTML=fx6bSelHTML(id,fx6bGroups());const n=box.querySelector('[data-fx6s="'+(t.dataset.fx6s==='g'?'d':'l')+'"]');if(n&&!n.disabled&&t.dataset.fx6s!=='l')try{n.focus()}catch(x){}}});
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('[data-fx6map],[data-fx6out],[data-fx6in],[data-fx6ref]');if(!t||!ICAT.j)return;const m=$('fx6CatMsg');
  ICAT.msg=null;if(t.dataset.fx6ref){fx6bCatView($('invBody'),true);return}
  const id=t.dataset.fx6map||t.dataset.fx6out||t.dataset.fx6in;let body;
  if(t.dataset.fx6map){const s=ICAT.sel[id]||{},g=fx6bGroups()[s.g];if(!g||!s.d||!s.l){ICAT.msg={c:'err',t:'برند و سیستم، قطر و طول را انتخاب کنید.'};if(m){m.className='msg err';m.textContent=ICAT.msg.t}return}body={op:'map',item:id,b:g.b,sys:g.sys,d:s.d,l:s.l}}
  else body={op:'out',item:id,on:t.dataset.fx6out?1:0};
  t.disabled=true;try{const r=await api('invCat',Object.assign(body,{by:ROLE_LBL[ROLE]}));ICAT.msg={c:'ok',t:body.op==='map'?(r.merged?'قلم با قلم موجود همان ترکیب یکی شد.':'قلم با فهرست جراحی تطبیق داده شد.'):(body.on?'قلم خارج از فهرست جراحی علامت خورد.':'قلم به فهرست بررسی برگشت.')};ICAT.j=null;await fx6bCatView($('invBody'),true);try{pollInv(true)}catch(x){}}
  catch(err){ICAT.msg={c:'err',t:err.message};if(m){m.className='msg err';m.textContent=err.message}t.disabled=false}});

