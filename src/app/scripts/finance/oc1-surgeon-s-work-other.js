/* ---------- oc1: «سایر کلینیک‌ها» — the surgeon's work at other clinics (own books in rial; login «oclin», the accountant sees the same view) ---------- */
ROLE_LBL.oclin='سایر کلینیک‌ها';
try{Object.assign(TI,{add:TI.new,rep:TI.dash,pay:TI.chq,cl:TI.set,oc:'M3 21h18M5 21V8l7-5 7 5v13M10 21v-5h4v5M9 11h6'})}catch(e){}
const OC={seg:'add',d:null,busy:false,per:'m0',from:'',to:'',cl:'all',f:null,p:null,edit:{}};
const ocR=n=>fa(Math.round(Number(n)||0))+' ریال';
const ocN=v=>{const s=toEn(String(v??'')).replace(/[,\s٬،]/g,'');if(s==='')return 0;const n=Number(s);return Number.isFinite(n)?Math.round(n):NaN};
const ocCl=id=>((OC.d&&OC.d.clinics)||[]).find(c=>c.id===id)||{name:'—',svc:[]};
const ocMine=()=>{const d=OC.d;if(!d)return [];const act=d.clinics.filter(c=>c.active);return d.sel&&d.sel.length?act.filter(c=>d.sel.includes(c.id)):act};
const ocItemsTxt=it=>(it||[]).map(x=>`${x.n}${x.q>1?' ×'+fa(x.q):''}`).join('، ');
const ocNewId=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
function ocRange(per){const td=tDay();if(per==='d0')return [td,td];if(per==='d1'){const y=dAdd(td,-1);return [y,y]}if(per==='m0')return [jMonth(td)[0],td];
  if(per==='m1'){const f=jMonth(td)[0],p=jMonth(dAdd(f,-1));return [p[0],p[1]]}if(per==='m3'){let f=jMonth(td)[0];for(let i=0;i<2;i++)f=jMonth(dAdd(f,-1))[0];return [f,td]}
  if(per==='y0'){const P=jParts(td);const s=j2g(P[0],1,1);return [`${s[0]}-${String(s[1]).padStart(2,'0')}-${String(s[2]).padStart(2,'0')}`,td]}return [OC.from||jMonth(td)[0],OC.to||td]}
async function ocLoad(){if(OC.busy)return;OC.busy=true;const [f,t]=OC.seg==='rep'||OC.seg==='pay'?ocRange(OC.per):ocRange('m0');
  try{const j=await api('oc',{op:'load',from:f,to:t});OC.d=j;OC.from=j.from;OC.to=j.to;OC.at=Date.now();OC.key=f+'|'+t}catch(e){toast(e.message,1)}finally{OC.busy=false}ocRender();try{renderTiles()}catch(e){}}
TILES.oclin=()=>{const d=OC.d,td=tDay(),tw=d?d.works.filter(w=>w.day===td):[],soon=d?d.chq.filter(c=>c.due<=dAdd(td,7)).length:0;return [
  {k:'add',c:'surg',l:'ثبت کار',s:tw.length?`امروز ${fa(tw.length)} بیمار · ${fa(tw.reduce((a,w)=>a+w.amount,0)/1e6)} میلیون ریال`:'کارهای امروز در هر کلینیک',n:tw.length,oseg:'add'},
  {k:'rep',c:'plan',l:'کارکرد و درآمد',s:'روزانه، ماهانه، ریز کارها',n:0,oseg:'rep'},
  {k:'pay',c:'fin',l:'دریافتی‌ها و چک‌ها',s:soon?`${fa(soon)} چک سررسید تا یک هفته`:'انتقال، واریز، چک، نقد',n:soon,oseg:'pay'},
  {k:'cl',c:'set',l:'کلینیک‌ها و تعرفه‌ها',s:'انتخاب کلینیک‌ها، تعرفه، مانده',n:0,oseg:'cl'}]};
(function(){const _a=TILES.accountant;TILES.accountant=()=>{const L=_a(),i=L.findIndex(t=>t.k==='arch');L.splice(i<0?L.length:i,0,{k:'oc',c:'surg',l:'سایر کلینیک‌ها',s:'کارکرد و دریافتی دکتر علویکیا',n:0,oseg:'rep'});return L}})();
(function(){const _g=goTile;goTile=function(k,opt={}){const L=tileList(),t=L.find(x=>x.k===k);if(!t||!t.oseg)return _g(k,opt);
  if(dirty&&!$('viewForm').hidden)return;TILE=t.k;TSAVE[ROLE]=TILE;try{localStorage.setItem('implantTile',JSON.stringify(TSAVE))}catch(e){}document.body.dataset.tile=TILE;
  OC.seg=ROLE==='accountant'&&OC.seg&&OC.seg!=='add'?OC.seg:t.oseg;show('oc');renderTiles();if(!opt.keep)window.scrollTo(0,0);ocRender();ocLoadSoft()}})();
/* home for «oclin»: merged into surgery/roles-live-queue-reception.js */
/* pollQ for «oclin»: merged into surgery/roles-live-queue-reception.js */
/* ocSegBar: oc1 base, replaced by oc2 (the «درمان بیمار» tab; the other clinic's own order for oclin) */
function ocSegBar () { if (ROLE !== 'accountant' && ROLE !== 'oclin') return ''; const segs = ROLE === 'accountant' ? [['rep', 'کارکرد و درآمد'], ['pay', 'دریافتی‌ها و چک‌ها'], ['add', 'ثبت کار'], ['tr', 'درمان بیمار'], ['cl', 'کلینیک‌ها و تعرفه‌ها']] : [['add', 'ثبت کار'], ['tr', 'درمان بیمار'], ['rep', 'کارکرد و درآمد'], ['pay', 'دریافتی‌ها و چک‌ها'], ['cl', 'کلینیک‌ها و تعرفه‌ها']]; return `<div class="seg oc-seg" role="tablist">${segs.map(([k, l]) => `<button type="button" data-ocseg="${k}" aria-pressed="${OC.seg === k}">${l}</button>`).join('')}</div>` }
/* ocRender: oc1 base + oc2 (tab «tr»: the patient treatment page) + oc2 (tab «cl»: fixed tariff rows, after every draw — also when nothing was drawn). oc3 keeps its own layer. */
function ocRender(){(()=>{const el=$('ocRoot');if(!el||$('viewOc').hidden)return;const d=OC.d;
  if (d && OC.seg === 'tr' && !(ROLE === 'oclin' && (!d.sel || !d.sel.length))) { el.innerHTML = ocSegBar() + oc2HTML(); oc2Post(); return }
  if(!d){el.innerHTML=ocSegBar()+'<div class="card"><p class="note">در حال بارگذاری…</p></div>';return}
  if(ROLE==='oclin'&&(!d.sel||!d.sel.length)){el.innerHTML=ocPickHTML(true);return}
  const H={add:ocAddHTML,rep:ocRepHTML,pay:ocPayHTML,cl:ocClHTML}[OC.seg]||ocAddHTML;el.innerHTML=ocSegBar()+H();if(OC.seg==='add')ocSum()})();
  try { if (OC.seg === 'cl') oc2FixRows() } catch (e) { } }
function ocPickHTML(first){const d=OC.d,sel=new Set(d.sel||[]);return `<div class="card oc-pick"><h2>${first?'به بخش «سایر کلینیک‌ها» خوش آمدید':'کلینیک‌های من'}</h2>
  <p class="note">کلینیک‌هایی را که در آن‌ها کار می‌کنید انتخاب کنید. موقع ثبت کار فقط همین‌ها نشان داده می‌شوند و تعرفه‌ی هر کلینیک خودکار حساب می‌شود. بعداً از «کلینیک‌ها و تعرفه‌ها» عوض می‌شود.</p>
  <div class="oc-cards">${d.clinics.filter(c=>c.active).map(c=>`<button type="button" class="oc-cc" data-ocpick="${esc(c.id)}" aria-pressed="${sel.has(c.id)||(first&&!d.sel)}"><b>${esc(c.name)}</b><small>${c.svc.some(s=>s.p)?fa(c.svc.filter(s=>s.p).length)+' خدمت با تعرفه':'تعرفه هنوز ثبت نشده'}</small></button>`).join('')}</div>
  <div class="btns"><button class="btn" type="button" id="ocPickSave">${first?'ادامه':'ذخیره‌ی انتخاب'}</button></div><div class="msg" id="ocPickMsg"></div></div>`}
/* ---- ثبت کار ---- */
function ocFormNew(keep){const mine=ocMine();let last='';try{last=localStorage.getItem('implantOcCl')||''}catch(e){}
  const cl=keep&&OC.f&&mine.some(c=>c.id===OC.f.clinic)?OC.f.clinic:(mine.some(c=>c.id===last)?last:(mine[0]||{}).id||'');
  OC.f={id:'',clinic:cl,day:keep&&OC.f?OC.f.day:tDay(),patient:'',q:{},x:[],note:''}}
function ocAddHTML(){if(!OC.f)ocFormNew();const f=OC.f,mine=ocMine(),c=ocCl(f.clinic),td=tDay();
  if(!mine.length)return `<div class="card"><p class="note">هیچ کلینیک فعالی انتخاب نشده است.</p><button class="btn" type="button" data-ocseg="cl">انتخاب کلینیک‌ها</button></div>`;
  const tw=OC.d.works.filter(w=>w.day===f.day);
  return `<div class="card oc-add"><h2>${f.id?'ویرایش کار ثبت‌شده':'ثبت کار'}</h2>
  <div class="oc-lbl">کلینیک</div><div class="oc-chips">${mine.map(m=>`<button type="button" class="chip" data-occl="${esc(m.id)}" aria-pressed="${m.id===f.clinic}">${esc(m.name)}</button>`).join('')}</div>
  <div class="fields"><label class="f">تاریخ<input id="oc_day" data-jd inputmode="numeric" value="${esc(jDay(f.day))}"></label>
   <label class="f">نام بیمار (اختیاری)<input id="oc_pat" value="${esc(f.patient)}" autocomplete="off" enterkeyhint="next"></label></div>
  <div class="oc-chips oc-qday"><button type="button" class="chip" data-ocday="${td}" aria-pressed="${f.day===td}">امروز</button><button type="button" class="chip" data-ocday="${dAdd(td,-1)}" aria-pressed="${f.day===dAdd(td,-1)}">دیروز</button></div>
  <div class="oc-lbl">کارهای انجام‌شده <small>تعرفه‌ی ${esc(c.name)}</small></div>
  <div class="oc-svc">${c.svc.map(s=>{const q=f.q[s.k]||0;return `<div class="oc-row${q?' on':''}"><div class="oc-sn"><b>${esc(s.n)}</b><small>${s.p?ocR(s.p):'<span class="oc-warn">تعرفه ثبت نشده</span>'}</small></div>
    <div class="oc-step"><button type="button" data-ocq="${esc(s.k)}" data-d="-1" aria-label="کم کردن ${esc(s.n)}"${q?'':' disabled'}>−</button><output>${fa(q)}</output><button type="button" data-ocq="${esc(s.k)}" data-d="1" aria-label="اضافه کردن ${esc(s.n)}">+</button></div></div>`}).join('')}
   ${f.x.map((x,i)=>`<div class="oc-row on oc-x"><input data-ocx="${i}" data-f="n" placeholder="نام کار (مثلاً زایگوما)" value="${esc(x.n)}"><input data-ocx="${i}" data-f="p" inputmode="numeric" placeholder="مبلغ هر واحد (ریال)" value="${x.p?esc(fa(x.p)):''}">
    <div class="oc-step"><button type="button" data-ocxq="${i}" data-d="-1" aria-label="کم کردن">−</button><output>${fa(x.q)}</output><button type="button" data-ocxq="${i}" data-d="1" aria-label="اضافه کردن">+</button></div></div>`).join('')}
   <button class="btn ghost sm" type="button" id="ocAddX">+ کار دیگر (خارج از تعرفه)</button></div>
  <label class="f">توضیح (اختیاری)<input id="oc_note" value="${esc(f.note)}"></label>
  <div class="oc-bar"><div><small>جمع این بیمار</small><b id="ocSum">—</b></div><div class="btns">${f.id?'<button class="btn ghost" type="button" id="ocCancel">انصراف</button>':''}<button class="btn" type="button" id="ocSave">${f.id?'ذخیره‌ی تغییر':'ثبت کار'}</button></div></div>
  <div class="msg" id="ocMsg"></div></div>
  <div class="card"><h3>کارهای ${f.day===td?'امروز':esc(jDay(f.day))} <small class="note">${fa(tw.length)} مورد · ${ocR(tw.reduce((a,w)=>a+w.amount,0))}</small></h3>${tw.length?ocWorkList(tw):'<p class="note">هنوز کاری برای این روز ثبت نشده است.</p>'}</div>`}
function ocSum(){const f=OC.f,c=ocCl(f.clinic),el=$('ocSum');if(!el)return;let s=0,z=false;for(const v of c.svc){const q=f.q[v.k]||0;if(q){s+=q*(v.p||0);if(!v.p)z=true}}for(const x of f.x){const p=ocN(x.p);if(x.q&&p>0)s+=x.q*p}el.textContent=ocR(s)+(z?' (بعضی کارها تعرفه ندارند)':'')}
function ocWorkList(L){return `<div class="oc-list">${L.map(w=>`<div class="oc-it"><div><b>${esc(w.patient||'بدون نام')}</b> <small>${esc(ocCl(w.clinic).name)} · ${esc(jDay(w.day))}</small><div class="oc-sub">${esc(ocItemsTxt(w.items))}${w.note?' · '+esc(w.note):''}</div></div>
  <div class="oc-amt">${ocR(w.amount)}<span><button type="button" class="lnk" data-ocedit="${esc(w.id)}">ویرایش</button><button type="button" class="lnk bad" data-ocdel="${esc(w.id)}" data-t="work">حذف</button></span></div></div>`).join('')}</div>`}
async function ocSave(){const f=OC.f,c=ocCl(f.clinic),m=$('ocMsg');f.patient=$('oc_pat').value.trim();f.note=$('oc_note').value.trim();const day=parseJ($('oc_day').value);
  if(!day){m.className='msg err';m.textContent='تاریخ درست نیست (مثلاً ۱۴۰۵/۰۸/۱۳).';return}f.day=day;
  const items=c.svc.filter(s=>f.q[s.k]).map(s=>({k:s.k,q:f.q[s.k]}));
  for(const x of f.x){if(!x.q)continue;const p=ocN(x.p);if(!x.n.trim()){m.className='msg err';m.textContent='نام «کار دیگر» را بنویسید.';return}if(!(p>0)){m.className='msg err';m.textContent=`مبلغ «${x.n}» را بنویسید.`;return}items.push({k:'x',n:x.n.trim(),p,q:x.q})}
  if(!items.length){m.className='msg err';m.textContent='دست‌کم یک کار را با دکمه‌ی + بزنید.';return}
  const b=$('ocSave');b.disabled=true;try{const id=f.id||ocNewId('w');const j=await api('oc',{op:'work',w:{id,clinic:f.clinic,day,patient:f.patient,note:f.note,items}});
    try{localStorage.setItem('implantOcCl',f.clinic)}catch(e){}toast((f.id?'ذخیره شد':'ثبت شد')+': '+ocR(j.amount)+(j.zero?' — بعضی کارها تعرفه ندارند':''));ocFormNew(true);await ocLoad();try{$('oc_pat').focus()}catch(e){}}
  catch(e){m.className='msg err';m.textContent=e.message}finally{if($('ocSave'))$('ocSave').disabled=false}}
/* ---- کارکرد و درآمد ---- */
function ocFilt(L){return OC.cl==='all'?L:L.filter(x=>x.clinic===OC.cl)}
function ocCols(W){const m=new Map();for(const w of W)for(const it of w.items){const k=it.k==='x'?'x':it.n;if(!m.has(k))m.set(k,it.k==='x'?'کار دیگر':it.n)}return [...m.entries()]}
function ocQty(w,k){return w.items.filter(it=>(it.k==='x'?'x':it.n)===k).reduce((a,it)=>a+it.q,0)}
function ocPerBar(){return `<div class="oc-chips">${[['d0','امروز'],['d1','دیروز'],['m0','این ماه'],['m1','ماه قبل'],['m3','سه ماه اخیر'],['y0','امسال'],['cu','بازه‌ی دلخواه']].map(([k,l])=>`<button type="button" class="chip" data-ocper="${k}" aria-pressed="${OC.per===k}">${l}</button>`).join('')}</div>
  ${OC.per==='cu'?`<div class="fields oc-cu"><label class="f">از<input id="oc_from" data-jd inputmode="numeric" value="${esc(jDay(OC.from))}"></label><label class="f">تا<input id="oc_to" data-jd inputmode="numeric" value="${esc(jDay(OC.to))}"></label><div class="btns"><button class="btn sm" type="button" id="ocGo">نمایش</button></div></div>`:''}
  <div class="oc-chips"><button type="button" class="chip" data-occf="all" aria-pressed="${OC.cl==='all'}">همه‌ی کلینیک‌ها</button>${OC.d.clinics.filter(c=>c.active||OC.d.works.some(w=>w.clinic===c.id)).map(c=>`<button type="button" class="chip" data-occf="${esc(c.id)}" aria-pressed="${OC.cl===c.id}">${esc(c.name)}</button>`).join('')}</div>`}
function ocBalTable(){const B=OC.d.bal.filter(b=>OC.cl==='all'||b.id===OC.cl).filter(b=>b.ob||b.work||b.paid||ocCl(b.id).active);const T=k=>B.reduce((a,b)=>a+b[k],0);
  return `<div class="oc-tw"><table class="tbl oc-t"><thead><tr><th>کلینیک</th><th>مانده‌ی اول دوره</th><th>کل کارکرد</th><th>کل دریافتی</th><th>چک در انتظار</th><th>مانده‌ی طلب</th></tr></thead><tbody>${B.map(b=>`<tr><td><b>${esc(ocCl(b.id).name)}</b></td><td>${fa(b.ob)}</td><td>${fa(b.work)}</td><td>${fa(b.paid)}</td><td>${fa(b.wait)}</td><td class="${b.bal<0?'oc-neg':'oc-pos'}"><b>${fa(b.bal)}</b></td></tr>`).join('')}</tbody>
  ${B.length>1?`<tfoot><tr><th>جمع</th><th>${fa(T('ob'))}</th><th>${fa(T('work'))}</th><th>${fa(T('paid'))}</th><th>${fa(T('wait'))}</th><th>${fa(T('bal'))}</th></tr></tfoot>`:''}</table></div><p class="note">مبالغ به ریال. مانده = مانده‌ی اول دوره + کارکرد − دریافتی (چک برگشتی دریافتی حساب نمی‌شود؛ چک در انتظار دریافتی حساب می‌شود و جدا هم نشان داده شده).</p>`}
function ocAgg(W,P,keyOf){const m=new Map();const g=k=>{if(!m.has(k))m.set(k,{k,W:[],amt:0,rcv:0});return m.get(k)};for(const w of W){const x=g(keyOf(w));x.W.push(w);x.amt+=w.amount}for(const p of P){if(p.kind==='chq'&&p.cst==='back')continue;g(keyOf(p)).rcv+=p.amount}return [...m.values()].sort((a,b)=>a.k<b.k?1:-1)}
const ocMonthKey=r=>{const P=jParts(r.day);return P[0]+'-'+String(P[1]).padStart(2,'0')};
const ocMonthLbl=k=>{const [y,mo]=k.split('-');return JMN[+mo-1]+' '+faD(y)};
function ocRepHTML(){const W=ocFilt(OC.d.works),P=ocFilt(OC.d.pays),cols=ocCols(W),amt=W.reduce((a,w)=>a+w.amount,0),rcv=P.filter(p=>!(p.kind==='chq'&&p.cst==='back')).reduce((a,p)=>a+p.amount,0);
  const B=OC.d.bal.filter(b=>OC.cl==='all'||b.id===OC.cl),bal=B.reduce((a,b)=>a+b.bal,0),wait=B.reduce((a,b)=>a+b.wait,0),pats=W.length;
  const M=ocAgg(W,P,ocMonthKey),D=ocAgg(W,P,r=>r.day);
  const head=`<th>تعداد بیمار</th>${cols.map(([,l])=>`<th>${esc(l)}</th>`).join('')}<th>کارکرد</th><th>دریافتی</th>`;
  const cells=x=>`<td>${fa(x.W.length)}</td>${cols.map(([k])=>`<td>${fa(x.W.reduce((a,w)=>a+ocQty(w,k),0))||''}</td>`).join('')}<td><b>${fa(x.amt)}</b></td><td>${x.rcv?fa(x.rcv):''}</td>`;
  return `<div class="card"><h2>کارکرد و درآمد <small class="note">${esc(jDay(OC.from))} تا ${esc(jDay(OC.to))}</small></h2>${ocPerBar()}
  <div class="kpis oc-k"><div class="kpi"><small>کارکرد در این بازه</small><b>${ocR(amt)}</b><small>${fa(pats)} بیمار</small></div><div class="kpi"><small>دریافتی در این بازه</small><b>${ocR(rcv)}</b></div>
   <div class="kpi"><small>مانده‌ی طلب (تا امروز)</small><b class="${bal<0?'oc-neg':'oc-pos'}">${ocR(bal)}</b></div><div class="kpi"><small>چک در انتظار وصول</small><b>${ocR(wait)}</b></div></div>
  <div class="btns"><button class="btn ghost sm" type="button" id="ocXls">⬇ اکسل</button></div></div>
  <div class="card"><h3>مانده‌ی هر کلینیک</h3>${ocBalTable()}</div>
  <div class="card"><h3>ماهانه</h3>${M.length?`<div class="oc-tw"><table class="tbl oc-t"><thead><tr><th>ماه</th>${head}</tr></thead><tbody>${M.map(x=>`<tr><td><b>${esc(ocMonthLbl(x.k))}</b></td>${cells(x)}</tr>`).join('')}</tbody></table></div>`:'<p class="note">در این بازه چیزی ثبت نشده است.</p>'}</div>
  <div class="card"><h3>روزانه</h3>${D.length?`<div class="oc-tw"><table class="tbl oc-t"><thead><tr><th>روز</th>${head}</tr></thead><tbody>${D.map(x=>`<tr><td><b>${esc(jDay(x.k))}</b></td>${cells(x)}</tr>`).join('')}</tbody></table></div>`:'<p class="note">در این بازه چیزی ثبت نشده است.</p>'}</div>
  <div class="card"><h3>ریز کارها <small class="note">${fa(W.length)} مورد</small></h3>${W.length?ocWorkList(W):'<p class="note">در این بازه کاری ثبت نشده است.</p>'}</div>`}
function ocXls(){const W=ocFilt(OC.d.works),P=ocFilt(OC.d.pays),cols=ocCols(W),rng=jDay(OC.from)+' تا '+jDay(OC.to),cl=OC.cl==='all'?'همه‌ی کلینیک‌ها':ocCl(OC.cl).name,sub=cl+' · '+rng+' · مبالغ به ریال';
  const row=(lbl,x)=>[lbl,x.W.length,...cols.map(([k])=>x.W.reduce((a,w)=>a+ocQty(w,k),0)),x.amt,x.rcv],hd=['تعداد بیمار',...cols.map(([,l])=>l),'کارکرد','دریافتی'];
  const B=OC.d.bal.filter(b=>OC.cl==='all'||b.id===OC.cl);
  xlsx([{name:'مانده',title:'مانده‌ی هر کلینیک (تا امروز)',sub:'مبالغ به ریال',head:['کلینیک','مانده‌ی اول دوره','کل کارکرد','کل دریافتی','چک در انتظار','مانده‌ی طلب'],rows:B.map(b=>[ocCl(b.id).name,b.ob,b.work,b.paid,b.wait,b.bal])},
    {name:'ماهانه',title:'کارکرد ماهانه',sub,head:['ماه',...hd],rows:ocAgg(W,P,ocMonthKey).map(x=>row(ocMonthLbl(x.k),x))},
    {name:'روزانه',title:'کارکرد روزانه',sub,head:['روز',...hd],rows:ocAgg(W,P,r=>r.day).map(x=>row(jDay(x.k),x))},
    {name:'ریز کارها',title:'ریز کارها',sub,head:['تاریخ','کلینیک','بیمار','کارها','مبلغ','توضیح'],rows:W.map(w=>[jDay(w.day),ocCl(w.clinic).name,w.patient||'',ocItemsTxt(w.items),w.amount,w.note||''])},
    {name:'دریافتی‌ها',title:'دریافتی‌ها',sub,head:['تاریخ','کلینیک','نوع','مبلغ','سررسید چک','شماره چک','بانک','وضعیت چک','توضیح'],rows:P.map(p=>[jDay(p.day),ocCl(p.clinic).name,OC.d.kinds[p.kind]||p.kind,p.amount,p.due?jDay(p.due):'',p.no||'',p.bank||'',p.kind==='chq'?({wait:'در انتظار',ok:'وصول شد',back:'برگشتی'}[p.cst||'wait']):'',p.note||''])}],
    'سایر-کلینیک‌ها-'+toEn(jDay(OC.from)).replace(/\//g,'-')+'.xlsx')}
/* ---- دریافتی‌ها ---- */
function ocPayNew(){const mine=ocMine();OC.p={id:'',clinic:(OC.p&&OC.p.clinic)||(OC.cl!=='all'?OC.cl:((mine[0]||{}).id||'')),day:tDay(),kind:'tr',amount:'',due:'',no:'',bank:'',note:''}}
function ocPayHTML(){if(!OC.p)ocPayNew();const p=OC.p,d=OC.d,td=tDay(),P=ocFilt(d.pays),C=ocFilt(d.chq);
  return `<div class="card oc-add"><h2>${p.id?'ویرایش دریافتی':'ثبت دریافتی'}</h2>
  <div class="oc-lbl">از کلینیک</div><div class="oc-chips">${d.clinics.filter(c=>c.active).map(c=>`<button type="button" class="chip" data-ocpcl="${esc(c.id)}" aria-pressed="${c.id===p.clinic}">${esc(c.name)}</button>`).join('')}</div>
  <div class="oc-lbl">نوع</div><div class="oc-chips">${Object.entries(d.kinds).map(([k,l])=>`<button type="button" class="chip" data-ocpk="${k}" aria-pressed="${p.kind===k}">${esc(l)}</button>`).join('')}</div>
  <div class="fields"><label class="f">مبلغ (ریال)<input id="ocp_amt" inputmode="numeric" value="${p.amount?esc(fa(p.amount)):''}" placeholder="مثلاً ۲٬۰۰۰٬۰۰۰٬۰۰۰"><small class="oc-hint" id="ocp_hint"></small></label><label class="f">تاریخ دریافت<input id="ocp_day" data-jd inputmode="numeric" value="${esc(jDay(p.day))}"></label></div>
  ${p.kind==='chq'?`<div class="fields"><label class="f">سررسید چک<input id="ocp_due" data-jd inputmode="numeric" value="${p.due?esc(jDay(p.due)):''}" placeholder="۱۴۰۵/۰۹/۰۱"></label><label class="f">شماره چک<input id="ocp_no" inputmode="numeric" value="${esc(p.no)}"></label><label class="f">بانک<input id="ocp_bank" value="${esc(p.bank)}"></label></div>`:''}
  <label class="f">توضیح (اختیاری)<input id="ocp_note" value="${esc(p.note)}"></label>
  <div class="btns">${p.id?'<button class="btn ghost" type="button" id="ocpCancel">انصراف</button>':''}<button class="btn" type="button" id="ocpSave">${p.id?'ذخیره‌ی تغییر':'ثبت دریافتی'}</button></div><div class="msg" id="ocpMsg"></div></div>
  <div class="card"><h3>چک‌های در انتظار وصول <small class="note">${fa(C.length)} چک · ${ocR(C.reduce((a,c)=>a+c.amount,0))}</small></h3>${C.length?`<div class="oc-list">${C.map(c=>{const late=c.due<td,soon=!late&&c.due<=dAdd(td,7);return `<div class="oc-it${late?' late':soon?' soon':''}"><div><b>${esc(ocCl(c.clinic).name)}</b> <small>سررسید ${esc(jDay(c.due))}${late?' · گذشته':soon?' · این هفته':''}</small>${c.no||c.bank||c.note?`<div class="oc-sub">${[c.no?'شماره '+esc(faD(c.no)):'',esc(c.bank||''),esc(c.note||'')].filter(Boolean).join(' · ')}</div>`:''}</div>
   <div class="oc-amt">${ocR(c.amount)}<span><button type="button" class="lnk" data-occhq="${esc(c.id)}" data-st="ok">وصول شد</button><button type="button" class="lnk bad" data-occhq="${esc(c.id)}" data-st="back">برگشت خورد</button></span></div></div>`}).join('')}</div>`:'<p class="note">چک در انتظاری نیست.</p>'}</div>
  <div class="card"><h3>دریافتی‌ها <small class="note">${esc(jDay(OC.from))} تا ${esc(jDay(OC.to))}</small></h3>${ocPerBar()}${P.length?`<div class="oc-list">${P.map(x=>`<div class="oc-it${x.cst==='back'?' off':''}"><div><b>${esc(ocCl(x.clinic).name)}</b> <small>${esc(jDay(x.day))} · ${esc(d.kinds[x.kind]||x.kind)}${x.kind==='chq'?' · سررسید '+esc(jDay(x.due))+' · '+({wait:'در انتظار',ok:'وصول شد',back:'برگشتی'}[x.cst||'wait']):''}</small>${x.note?`<div class="oc-sub">${esc(x.note)}</div>`:''}</div>
   <div class="oc-amt">${ocR(x.amount)}<span>${x.kind==='chq'&&x.cst&&x.cst!=='wait'?`<button type="button" class="lnk" data-occhq="${esc(x.id)}" data-st="wait">برگشت به در انتظار</button>`:''}<button type="button" class="lnk" data-ocpedit="${esc(x.id)}">ویرایش</button><button type="button" class="lnk bad" data-ocdel="${esc(x.id)}" data-t="pay">حذف</button></span></div></div>`).join('')}</div>`:'<p class="note">در این بازه دریافتی ثبت نشده است.</p>'}</div>`}
async function ocPaySave(){const p=OC.p,m=$('ocpMsg');const amt=ocN($('ocp_amt').value),day=parseJ($('ocp_day').value);
  if(!(amt>0)){m.className='msg err';m.textContent='مبلغ را بنویسید.';return}if(!day){m.className='msg err';m.textContent='تاریخ درست نیست.';return}
  let due='',no='',bank='';if(p.kind==='chq'){due=parseJ($('ocp_due').value);no=$('ocp_no').value.trim();bank=$('ocp_bank').value.trim();if(!due){m.className='msg err';m.textContent='سررسید چک را بنویسید.';return}}
  const b=$('ocpSave');b.disabled=true;try{await api('oc',{op:'pay',p:{id:p.id||ocNewId('p'),clinic:p.clinic,day,kind:p.kind,amount:amt,due,no,bank,note:$('ocp_note').value.trim()}});toast((p.id?'ذخیره شد: ':'ثبت شد: ')+ocR(amt));OC.p=null;await ocLoad()}
  catch(e){m.className='msg err';m.textContent=e.message}finally{if($('ocpSave'))$('ocpSave').disabled=false}}
/* ---- کلینیک‌ها و تعرفه‌ها ---- */
function ocClHTML(){const d=OC.d;return ocSegHide()+ocPickHTML(false)+d.clinics.map(c=>{const e=OC.edit[c.id];const S=e?e.svc:c.svc;
  return `<div class="card oc-clc${c.active?'':' off'}" data-ocid="${esc(c.id)}"><div class="oc-clh"><h3>${esc(c.name)}${c.active?'':' <small class="note">(غیرفعال)</small>'}</h3>${e?'':`<button class="btn ghost sm" type="button" data-ocedcl="${esc(c.id)}">ویرایش تعرفه و مانده</button>`}</div>
   ${e?`<div class="fields"><label class="f">نام کلینیک<input data-occf2="name" value="${esc(e.name)}"></label><label class="f">مانده‌ی اول دوره (ریال؛ طلب از کلینیک)<input data-occf2="ob" inputmode="numeric" value="${esc(fa(e.ob||0))}"></label><label class="f">تاریخ مانده<input data-occf2="obDay" data-jd inputmode="numeric" value="${e.obDay?esc(jDay(e.obDay)):''}"></label></div>
   <div class="oc-svc">${S.map((s,i)=>`<div class="oc-row on"><input data-ocsv="${i}" data-f="n" value="${esc(s.n)}" aria-label="نام خدمت"><input data-ocsv="${i}" data-f="p" inputmode="numeric" value="${s.p?esc(fa(s.p)):''}" placeholder="تعرفه (ریال)" aria-label="تعرفه‌ی ${esc(s.n)}"><button type="button" class="lnk bad" data-ocsvdel="${i}">حذف</button></div>`).join('')}
    <button class="btn ghost sm" type="button" data-ocsvadd="${esc(c.id)}">+ خدمت</button></div>
   <label class="oc-act"><input type="checkbox" data-occf2="active"${e.active?' checked':''}> فعال (در ثبت کار نشان داده شود)</label>
   <div class="btns"><button class="btn ghost" type="button" data-occancel="${esc(c.id)}">انصراف</button><button class="btn" type="button" data-ocsavecl="${esc(c.id)}">ذخیره</button></div><div class="msg" data-ocmsg="${esc(c.id)}"></div>`
   :`<div class="oc-tariff">${c.svc.map(s=>`<span><b>${esc(s.n)}</b> ${s.p?fa(s.p):'<i class="oc-warn">بدون تعرفه</i>'}</span>`).join('')}</div><p class="note">مانده‌ی اول دوره: ${ocR(c.ob)}${c.obDay?' (از '+esc(jDay(c.obDay))+')':''}</p>`}</div>`}).join('')+
  `<div class="card"><div class="btns"><button class="btn ghost" type="button" id="ocNewCl">+ کلینیک تازه</button></div></div>`}
function ocSegHide(){return ocSegBar()}
function ocEdRead(id){const card=document.querySelector(`.oc-clc[data-ocid="${CSS.escape(id)}"]`),e=OC.edit[id];if(!card||!e)return;card.querySelectorAll('[data-ocsv]').forEach(i=>{const s=e.svc[+i.dataset.ocsv];if(s)s[i.dataset.f]=i.dataset.f==='p'?i.value:i.value});
  card.querySelectorAll('[data-occf2]').forEach(i=>{const k=i.dataset.occf2;e[k]=k==='active'?i.checked:i.value})}
/* ---- events ---- */
document.addEventListener('click',async ev=>{const t=ev.target.closest&&ev.target.closest('#viewOc button, #viewOc [data-ocpick]');if(!t)return;const d=OC.d;
  if(t.dataset.ocseg){OC.seg=t.dataset.ocseg;ocRender();if(t.dataset.ocseg==='rep'||t.dataset.ocseg==='pay')ocLoadSoft();return}
  if(t.dataset.ocpick){const on=t.getAttribute('aria-pressed')!=='true';t.setAttribute('aria-pressed',on);return}
  if(t.id==='ocPickSave'){const ids=[...document.querySelectorAll('#viewOc [data-ocpick][aria-pressed="true"]')].map(b=>b.dataset.ocpick),m=$('ocPickMsg');t.disabled=true;
    try{const j=await api('oc',{op:'sel',ids});d.sel=j.sel;OC.f=null;toast('کلینیک‌های شما ذخیره شد.');if(OC.seg==='cl'&&ROLE==='oclin'&&!ev.target.closest('.oc-clc'))ocRender();else ocRender()}catch(e){m.className='msg err';m.textContent=e.message}finally{t.disabled=false}return}
  if(t.dataset.occl){OC.f.clinic=t.dataset.occl;OC.f.q={};ocRender();return}
  if(t.dataset.ocday){OC.f.day=t.dataset.ocday;OC.f.patient=$('oc_pat').value;OC.f.note=$('oc_note').value;ocRender();return}
  if(t.dataset.ocq){const k=t.dataset.ocq;OC.f.patient=$('oc_pat').value;OC.f.note=$('oc_note').value;OC.f.q[k]=Math.max(0,Math.min(99,(OC.f.q[k]||0)+Number(t.dataset.d)));const row=t.closest('.oc-row');row.querySelector('output').textContent=fa(OC.f.q[k]);row.classList.toggle('on',!!OC.f.q[k]);row.querySelector('[data-d="-1"]').disabled=!OC.f.q[k];ocSum();return}
  if(t.dataset.ocxq!==undefined){const x=OC.f.x[+t.dataset.ocxq];x.q=Math.max(0,Math.min(99,x.q+Number(t.dataset.d)));t.closest('.oc-row').querySelector('output').textContent=fa(x.q);ocSum();return}
  if(t.id==='ocAddX'){OC.f.patient=$('oc_pat').value;OC.f.note=$('oc_note').value;OC.f.x.push({n:'',p:'',q:1});ocRender();const L=document.querySelectorAll('#viewOc [data-ocx][data-f="n"]');if(L.length)L[L.length-1].focus();return}
  if(t.id==='ocSave'){ocSave();return}
  if(t.id==='ocCancel'){ocFormNew(true);ocRender();return}
  if(t.dataset.ocedit){const w=d.works.find(x=>x.id===t.dataset.ocedit);if(!w)return;const c=ocCl(w.clinic);OC.seg='add';OC.f={id:w.id,clinic:w.clinic,day:w.day,patient:w.patient||'',note:w.note||'',q:Object.fromEntries(w.items.filter(i=>i.k!=='x'&&c.svc.some(s=>s.k===i.k)).map(i=>[i.k,i.q])),x:w.items.filter(i=>i.k==='x').map(i=>({n:i.n,p:i.p,q:i.q}))};
    if(ROLE==='oclin'){TILE='add';renderTiles()}ocRender();window.scrollTo(0,0);return}
  if(t.dataset.ocdel){const id=t.dataset.ocdel,tp=t.dataset.t;t.disabled=true;try{await api('oc',{op:'del',t:tp,id});await ocLoad();toastUndo(tp==='pay'?'دریافتی حذف شد.':'کار حذف شد.',async()=>{await api('oc',{op:'undel',t:tp,id});await ocLoad()})}catch(e){toast(e.message,1);t.disabled=false}return}
  if(t.dataset.ocper){OC.per=t.dataset.ocper;if(OC.per!=='cu')ocLoad();else ocRender();return}
  if(t.id==='ocGo'){const f=parseJ($('oc_from').value),to=parseJ($('oc_to').value);if(!f||!to||f>to){toast('بازه‌ی تاریخ درست نیست.',1);return}OC.from=f;OC.to=to;ocLoad();return}
  if(t.dataset.occf){OC.cl=t.dataset.occf;ocRender();return}
  if(t.id==='ocXls'){ocXls();return}
  if(t.dataset.ocpcl){OC.p.clinic=t.dataset.ocpcl;ocPayKeep();ocRender();return}
  if(t.dataset.ocpk){OC.p.kind=t.dataset.ocpk;ocPayKeep();ocRender();return}
  if(t.id==='ocpSave'){ocPaySave();return}
  if(t.id==='ocpCancel'){OC.p=null;ocRender();return}
  if(t.dataset.ocpedit){const x=d.pays.find(p=>p.id===t.dataset.ocpedit);if(!x)return;OC.p={id:x.id,clinic:x.clinic,day:x.day,kind:x.kind,amount:x.amount,due:x.due||'',no:x.no||'',bank:x.bank||'',note:x.note||''};ocRender();window.scrollTo(0,0);return}
  if(t.dataset.occhq){t.disabled=true;try{await api('oc',{op:'chq',id:t.dataset.occhq,cst:t.dataset.st});toast({ok:'چک وصول شد.',back:'چک برگشتی ثبت شد؛ مبلغ دوباره به طلب اضافه شد.',wait:'چک به «در انتظار» برگشت.'}[t.dataset.st]);await ocLoad()}catch(e){toast(e.message,1);t.disabled=false}return}
  if(t.dataset.ocedcl){const c=d.clinics.find(x=>x.id===t.dataset.ocedcl);OC.edit[c.id]={name:c.name,ob:c.ob,obDay:c.obDay||'',active:!!c.active,svc:c.svc.map(s=>({k:s.k,n:s.n,p:s.p}))};ocRender();return}
  if(t.dataset.occancel){delete OC.edit[t.dataset.occancel];ocRender();return}
  if(t.dataset.ocsvadd){ocEdRead(t.dataset.ocsvadd);OC.edit[t.dataset.ocsvadd].svc.push({k:'',n:'',p:''});ocRender();return}
  if(t.dataset.ocsvdel!==undefined){const id=t.closest('.oc-clc').dataset.ocid;ocEdRead(id);OC.edit[id].svc.splice(+t.dataset.ocsvdel,1);ocRender();return}
  if(t.dataset.ocsavecl){const id=t.dataset.ocsavecl,m=document.querySelector(`[data-ocmsg="${CSS.escape(id)}"]`);ocEdRead(id);const e=OC.edit[id];const obDay=e.obDay?parseJ(e.obDay):'';
    if(e.obDay&&!obDay){m.className='msg err';m.textContent='تاریخ مانده درست نیست.';return}
    const svc=e.svc.filter(s=>String(s.n||'').trim()).map(s=>({k:s.k,n:String(s.n).trim(),p:ocN(s.p)}));if(svc.some(s=>!Number.isFinite(s.p)||s.p<0)){m.className='msg err';m.textContent='تعرفه‌ها را فقط با عدد بنویسید.';return}
    const ob=ocN(e.ob);if(!Number.isFinite(ob)){m.className='msg err';m.textContent='مانده‌ی اول دوره را با عدد بنویسید.';return}
    t.disabled=true;try{await api('oc',{op:'clinic',c:{id:id.startsWith('new')?'':id,name:e.name,ob,obDay,active:e.active?1:0,svc}});delete OC.edit[id];toast('ذخیره شد.');await ocLoad()}catch(er){m.className='msg err';m.textContent=er.message;t.disabled=false}return}
  if(t.id==='ocNewCl'){const id='new'+Date.now();d.clinics.push({id,name:'',ord:999,active:1,svc:OC_SVC_DEF(),ob:0,obDay:''});OC.edit[id]={name:'',ob:0,obDay:'',active:true,svc:OC_SVC_DEF()};ocRender();const el=document.querySelector(`.oc-clc[data-ocid="${id}"] [data-occf2="name"]`);if(el){el.focus();el.scrollIntoView({block:'center'})}return}
});
const OC_SVC_DEF=()=>[['imp','IMP'],['gbr','GBR'],['hard','نسج سخت'],['ext','ext عقل'],['ridge','ریج اسپلیت'],['open','OPEN'],['close','CLOSE']].map(([k,n])=>({k,n,p:''}));
function ocPayKeep(){const p=OC.p;if(!p||!$('ocp_amt'))return;p.amount=ocN($('ocp_amt').value)||'';p.day=parseJ($('ocp_day').value)||p.day;p.note=$('ocp_note').value;if($('ocp_due')){p.due=parseJ($('ocp_due').value)||'';p.no=$('ocp_no').value;p.bank=$('ocp_bank').value}}
document.addEventListener('input',e=>{const t=e.target;if(!t.closest||!t.closest('#viewOc'))return;
  if(t.dataset.ocx!==undefined){const x=OC.f.x[+t.dataset.ocx];if(x){x[t.dataset.f]=t.dataset.f==='p'?ocN(t.value)||'':t.value;ocSum()}}
  if(t.id==='ocp_amt'){const n=ocN(t.value),h=$('ocp_hint');if(h)h.textContent=n>0?ocR(n)+(n>=1e7?' = '+fa(n/1e7)+' میلیون تومان':''):''}
  if(t.inputMode==='numeric'&&!t.dataset.jd&&t.id!=='ocp_no'){const n=ocN(t.value);if(Number.isFinite(n)&&n>0){const pos=t.value.length-t.selectionStart;t.value=fa(n);try{t.setSelectionRange(t.value.length-pos,t.value.length-pos)}catch(x){}}}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||!e.target.closest||!e.target.closest('#viewOc')||e.target.tagName!=='INPUT')return;if(e.target.id==='oc_pat'||e.target.id==='oc_note'){e.preventDefault();ocSave()}else if(e.target.closest('.oc-add')&&$('ocpSave')){e.preventDefault();ocPaySave()}});

