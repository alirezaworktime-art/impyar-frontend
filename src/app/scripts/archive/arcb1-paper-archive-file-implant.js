/* arcb1: (owner, 2026-11-05) paper (archive) file — implant brand and size for each tooth: tapping a tooth opens a small
   window (brand → diameter → length; all three required); the tariff comes from each brand's group (Iranian / Korean /
   Italian / Swiss) and can be changed per group. On save, a mixed session is sent as one line per brand group (server
   unchanged: one tariff per line); on opening, those lines are joined again into one session. */
var ARB={p:null,last:null};
const ARB_GL={ir:'ایرانی',ko:'کره‌ای',it:'ایتالیایی',sw:'سوئیسی'},ARB_GO=['ir','ko','it','sw'];
const arbLbl=c=>c.sys?c.b+' '+c.sys:c.b;
const arbCat=b=>{b=String(b||'').trim().toLowerCase();if(!b)return null;return (catM()||[]).find(c=>arbLbl(c).toLowerCase()===b)||(catM()||[]).find(c=>String(c.b).toLowerCase()===b)||null};
const arbG=b=>{const c=arbCat(b);return c&&ARB_GL[c.g]?c.g:arcG(b)};
const arbDef=g=>{const P=((SET&&SET.prices)||{}).imp||{},bp=P.bp||{};return num(bp[g]||bp.ko)};
const arbPr=(l,g)=>+l.ri>0?(l.gp&&l.gp[g]!=null&&l.gp[g]!==''?num(l.gp[g]):0):l.gp&&l.gp[g]!=null&&l.gp[g]!==''?num(l.gp[g]):arbDef(g);
const arbGroups=l=>{const o={};(l.teeth||[]).forEach(t=>{const m=(l.imp||{})[t]||{};const g=m.b?arbG(m.b):'';(o[g]=o[g]||[]).push(t)});return o};
const arbAmt=l=>{if(typeof m15Amt==='function'){const v=m15Amt(l);if(v!=null)return v}if(!l||l.k!=='imp')return num(l&&l.n)*num(l&&l.price);let s=0;const G=arbGroups(l),fp=l.fp!=null&&l.fp!==''?num(l.fp):null;for(const g in G)s+=G[g].reduce((a,t)=>a+(fp!==null&&((l.imp||{})[t]||{}).f?fp:(g?arbPr(l,g):0)),0);return s};/* m2: «فیل اولیه» tariff */
const arbMiss=l=>(l.teeth||[]).filter(t=>{const m=(l.imp||{})[t]||{};return !m.b||!m.d||!m.l});
/* opening a file: join the per-group lines of one session (same day, doctor, suture) back into one */
{const _f=a6From;a6From=function(){const S=_f.apply(this,arguments);try{const out=[],by={};
  S.lines.forEach(l=>{if(l.k!=='imp'){out.push(l);return}l.imp=l.imp||{};(l.teeth||[]).forEach(t=>{const m=l.imp[t]=l.imp[t]||{};if(!m.b&&l.b)m.b=l.b});
    const key=String(l.id).replace(/-(ir|ko|it|sw|rt)$/,'')+'|'+[l.day,l.doc,l.sut||'',+l.ri||0].join('|'),G=arbGroups(l),gs=Object.keys(G).filter(Boolean);
    let base=by[key];if(!base){base=Object.assign({},l,{id:String(l.id).replace(/-(ir|ko|it|sw|rt)$/,''),teeth:[],imp:{},gp:{}});by[key]=base;out.push(base)}
    (l.teeth||[]).forEach(t=>{if(!base.teeth.includes(t)){base.teeth.push(t);base.imp[t]=l.imp[t]}});
    if(gs.length===1)base.gp[gs[0]]=num(l.price);base.n=base.teeth.length});
  S.lines=out}catch(e){}return S}}
/* the implant session: per-tooth brand/size chips and one tariff box per brand group */
{const _l=a6Line;a6Line=function(l){let h=_l.apply(this,arguments);if(l.k!=='imp')return h;try{
  h=h.replace(/<label class="f">برند<input data-a6f="b"[^>]*><\/label>/,'');
  h=h.replace(/<div class="a6dl">[\s\S]*?<\/span><\/div>/,'');
  const miss=arbMiss(l),G=arbGroups(l),money=a6Money0();
  const chips=l.teeth.length?`<div class="arbl">${l.teeth.map(t=>{const m=(l.imp||{})[t]||{},ok=m.b&&m.d&&m.l;return `<button type="button" class="arbc${ok?'':' bad'}" data-arbt="${t}" data-l="${l.id}"><b>${esc(toothTxt([t]))}</b> ${ok?esc(m.b)+' · '+faD(String(m.d))+'×'+faD(String(m.l)):'برند و سایز را بزنید'}</button>`}).join('')}</div>`:'';
  const pr=money?`<div class="arbp">${Object.keys(G).filter(Boolean).sort((a,b)=>ARB_GO.indexOf(a)-ARB_GO.indexOf(b)).map(g=>{const p=arbPr(l,g),d=arbDef(g);return `<label class="f">تعرفه‌ی ایمپلنت ${ARB_GL[g]} (هر عدد، تومان)<input data-arbgp="${g}" data-l="${l.id}" inputmode="numeric" class="price" value="${esc(fmtInput(String(p)))}"><small class="a6def">${fa(G[g].length)} عدد = <b data-arbga="${l.id}-${g}">${fa(G[g].length*p)}</b>${p!==d?' · پیش‌فرض '+fa(d)+' <button type="button" class="lnk" data-arbdef="'+g+'" data-l="'+l.id+'">برگرداندن</button>':''}</small></label>`}).join('')}<div class="a6amt"><span>مبلغ</span><b data-arbamt="${l.id}">${fa(arbAmt(l))}</b></div></div>`:'';
  h=h.replace(/<label class="f">تعرفه‌ی هر واحد \(تومان\)[\s\S]*?<\/b><\/div>/,'');
  h=h.replace('<div class="a6sut">',`${chips}${miss.length&&l.teeth.length?'<p class="note arbm">برای '+fa(miss.length)+' دندان برند و سایز ثبت نشده؛ روی آن بزنید.</p>':''}${pr}<div class="a6sut">`);
  h=h.replace('دندان‌ها را بزنید','روی هر دندان بزنید و برند و سایزش را انتخاب کنید')}catch(e){}return h}}
/* the small window */
/* arbOpen — layers: archive/arcb1 base + prosthesis/m2 (m3: the initial-failure state of the tooth); inventory/m44b still wraps it */
function arbOpen(l,t){const m=(l.imp||{})[t]||{},last=ARB.last||{};const b=m.b||last.b||'';const c=arbCat(b);
  ARB.p={lid:l.id,t,had:l.teeth.includes(t),b,c,d:m.d||'',len:m.l||'',ob:c||!b?'':b};arbDraw();
  try { if (ARB.p) { ARB.p.f = m3F(l, t); ARB.p.orig = (l.imp || {})[t]; ARB.p.m3 = 1; arbDraw() } } catch (e) {}}
/* arbDraw — layers: archive/arcb1 base + prosthesis/m2 (m3: success / initial failure) + inventory/m44b (second fixture after a failure).
   Both added rows need ARB.p, so the early return without it covers them too. */
function arbDraw(){const P=ARB.p;if(!P)return;const C=catM()||[],c=P.c,chip=(on,attr,txt)=>`<button type="button" class="chip" ${attr} aria-pressed="${!!on}">${esc(txt)}</button>`;
  const br=ARB_GO.concat(['']).map(g=>{const L=C.filter(x=>(ARB_GL[x.g]?x.g:'')===g);if(!L.length)return '';return `<div class="arbg"><span>${g?ARB_GL[g]:'سایر'}</span><div class="chips">${L.map(x=>chip(c===x,`data-arbb="${esc(arbLbl(x))}"`,arbLbl(x))).join('')}</div></div>`}).join('');
  const ds=c?c.d:[],ls=c?(catLens(c,P.d)||[]):[];
  const dRow=`<div class="arbg"><span>قطر</span><div class="chips">${ds.map(d=>chip(P.d===d,`data-arbd="${esc(d)}"`,faD(String(d)))).join('')}<input class="arbi" data-arbdi="1" inputmode="decimal" placeholder="سایر" value="${esc(ds.includes(P.d)?'':P.d)}" aria-label="قطر دیگر"></div></div>`;
  const lRow=`<div class="arbg"><span>طول</span><div class="chips">${ls.map(x=>chip(P.len===x,`data-arbl="${esc(x)}"`,faD(String(x)))).join('')}<input class="arbi" data-arbli="1" inputmode="decimal" placeholder="سایر" value="${esc(ls.includes(P.len)?'':P.len)}" aria-label="طول دیگر"></div></div>`;
  const s=mkSheet('arbSh',`<h3>دندان ${esc(toothTxt([P.t]))} — برند و سایز ایمپلنت</h3>${br}<div class="arbg"><span>برند دیگر</span><div class="chips"><input class="arbi w" data-arbbi="1" placeholder="نام برند" value="${esc(P.ob)}"></div></div>
    ${dRow}${lRow}<p class="note">${P.b?'برند: <b>'+esc(P.b)+'</b> · گروه '+(ARB_GL[arbG(P.b)]||'')+' · تعرفه '+fa(arbDef(arbG(P.b)))+' تومان':'برند را انتخاب کنید.'}</p><div class="msg" id="arbMsg" role="alert"></div>
    <div class="btns"><button type="button" class="btn" id="arbOk">ثبت</button>${P.had?'<button type="button" class="btn ghost danger" id="arbDel">برداشتن این دندان</button>':''}<button type="button" class="btn ghost" id="arbNo">انصراف</button></div>`);
  s.hidden=false;s.setAttribute('role','dialog');s.setAttribute('aria-modal','true');
  try { const s = $('arbSh'), P = ARB.p; if (s && P && !s.querySelector('[data-m3f]')) { const m = s.querySelector('#arbMsg');
    if (m) m.insertAdjacentHTML('beforebegin', `<div class="arbg m3row"><span>وضعیت</span><div class="chips"><button type="button" class="chip" data-m3f="0" aria-pressed="${!P.f}">کاشت موفق</button><button type="button" class="chip" data-m3f="1" aria-pressed="${!!P.f}">فیل اولیه</button></div></div>`) } } catch (e) {}
  try{const s=$('arbSh'),P=ARB.p;if(s&&P&&P.m44l&&!s.querySelector('#m44bRow')){const m=s.querySelector('#arbMsg');
    if(m)m.insertAdjacentHTML('beforebegin',`<div class="arbg m44brow" id="m44bRow"${P.f?'':' hidden'}><span>بعد از فیل، روی همین دندان دوباره کاشته شد؟</span><div class="chips"><button type="button" class="chip" data-m44b="0" aria-pressed="${!P.m44}">نه</button><button type="button" class="chip" data-m44b="1" aria-pressed="${!!P.m44}">بله، فیکسچر دوم کاشته شد</button></div><small class="note">با «ثبت»، پنجره‌ی برند و سایز فیکسچر دوم باز می‌شود؛ فیکسچر دوم ردیف جدا با تعرفه‌ی خودش می‌شود.</small></div>`)}}catch(e){}}
/* arbClose — layers: archive/arcb1 base + prosthesis/m2 (m3: keep the initial-failure mark of a changed tooth); inventory/m44b still wraps it */
function arbClose(){try { const P = ARB.p; if (P && P.m3) { const l = a6L(P.lid), m = l && l.imp && l.imp[P.t]; if (m && m !== P.orig) { if (P.f) m.f = 1; else delete m.f } } } catch (e) {}
  const s=$('arbSh');if(s)s.hidden=true;ARB.p=null}
function arbRe(){const sc=window.scrollY;a6Render();window.scrollTo(0,sc)}
window.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('button');if(!t||!A6)return;const d=t.dataset;
  if(d.a6t||d.arbt){const l=a6L(d.l);if(!l||l.k!=='imp')return;e.preventDefault();e.stopImmediatePropagation();arbOpen(l,d.a6t||d.arbt);return}
  if(d.arbdef){const l=a6L(d.l);if(!l)return;e.preventDefault();e.stopImmediatePropagation();l.gp=l.gp||{};delete l.gp[d.arbdef];A6.dirty=true;arbRe();return}
  if(!t.closest('#arbSh'))return;const P=ARB.p;if(!P)return;e.preventDefault();e.stopImmediatePropagation();
  if(d.arbb!==undefined){P.b=d.arbb;P.c=arbCat(P.b);P.ob='';const c=P.c;if(c&&P.d&&!c.d.includes(P.d)){P.d='';P.len=''}if(c&&P.len&&!(catLens(c,P.d)||[]).includes(P.len))P.len='';arbDraw();return}
  if(d.arbd!==undefined){P.d=d.arbd;if(P.c&&P.len&&!(catLens(P.c,P.d)||[]).includes(P.len))P.len='';arbDraw();return}
  if(d.arbl!==undefined){P.len=d.arbl;arbDraw();return}
  if(t.id==='arbNo'){arbClose();return}
  const l=a6L(P.lid);if(!l){arbClose();return}
  if(t.id==='arbDel'){l.teeth=l.teeth.filter(x=>x!==P.t);if(l.imp)delete l.imp[P.t];l.n=l.teeth.length;A6.dirty=true;arbClose();arbRe();return}
  if(t.id==='arbOk'){const m=$('arbMsg'),bad=x=>{m.className='msg err';m.textContent=x};const dd=toEn(String(P.d||'')).trim(),ll=toEn(String(P.len||'')).trim();
    if(!P.b)return bad('برند را انتخاب کنید.');if(!/^\d+(\.\d+)?$/.test(dd))return bad('قطر را انتخاب کنید یا درست بنویسید (مثل ۴.۵).');if(!/^\d+(\.\d+)?$/.test(ll))return bad('طول را انتخاب کنید یا درست بنویسید (مثل ۱۰).');
    l.imp=l.imp||{};l.imp[P.t]={b:P.b,d:dd,l:ll};if(!l.teeth.includes(P.t))l.teeth.push(P.t);l.n=l.teeth.length;ARB.last={b:P.b};A6.dirty=true;arbClose();arbRe();return}},true);
document.addEventListener('input',e=>{const i=e.target;if(!i||!i.dataset||!A6)return;const d=i.dataset,P=ARB.p;
  if(d.arbgp){const l=a6L(d.l);if(!l)return;if(e.type==='input')i.value=fmtInput(i.value);l.gp=l.gp||{};l.gp[d.arbgp]=num(i.value);A6.dirty=true;const G=arbGroups(l);const x=document.querySelector(`[data-arbga="${l.id}-${d.arbgp}"]`);if(x)x.textContent=fa((G[d.arbgp]||[]).length*num(i.value));const a=document.querySelector(`[data-arbamt="${l.id}"]`);if(a)a.textContent=fa(arbAmt(l));try{a6MoneyLite()}catch(x){}return}
  if(!P)return;if(d.arbbi){P.ob=i.value.trim();P.b=P.ob;P.c=arbCat(P.b);const n=$('arbSh').querySelector('.note');if(n)n.innerHTML=P.b?'برند: <b>'+esc(P.b)+'</b> · گروه '+(ARB_GL[arbG(P.b)]||'')+' · تعرفه '+fa(arbDef(arbG(P.b)))+' تومان':'برند را انتخاب کنید.';$('arbSh').querySelectorAll('[data-arbb]').forEach(b=>b.setAttribute('aria-pressed','false'));return}
  if(d.arbdi){P.d=toEn(i.value.trim());$('arbSh').querySelectorAll('[data-arbd]').forEach(b=>b.setAttribute('aria-pressed','false'));return}
  if(d.arbli){P.len=toEn(i.value.trim());$('arbSh').querySelectorAll('[data-arbl]').forEach(b=>b.setAttribute('aria-pressed','false'));return}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ARB.p){arbClose()}});
/* save: every implant tooth needs brand and size; a mixed session goes to the server as one line per brand group */
{const _s=a6Save;a6Save=async function(btn){try{for(const l of (A6&&A6.lines||[])){if(l.k!=='imp')continue;const miss=arbMiss(l);if(miss.length){const m=$('a6Msg');m.className='msg err';m.textContent='پایه ایمپلنت: برای دندان '+toothTxt(miss)+' برند، قطر و طول را انتخاب کنید (روی دندان بزنید).';const n=document.querySelector(`[data-arbt="${miss[0]}"][data-l="${l.id}"]`);if(n)n.scrollIntoView({behavior:'smooth',block:'center'});return}}}catch(e){}return _s.apply(this,arguments)}}
{const _a=api;api=function(action,payload,opt){try{if(action==='fxArc'&&payload&&payload.arc&&payload.arc.v6&&A6){const out=[];
  for(const x of payload.arc.lines||[]){const l=x.k==='imp'&&A6.lines.find(y=>y.id===x.id);if(!l){out.push(x);continue}
    const G=arbGroups(l),gs=Object.keys(G).sort((a,b)=>ARB_GO.indexOf(a)-ARB_GO.indexOf(b));
    gs.forEach((g,i)=>{const T=G[g];out.push(Object.assign({},x,{id:i===0?x.id:(String(x.id).slice(0,36)+'-'+(g||'xx')),teeth:T,n:T.length,price:g?arbPr(l,g):0,imp:Object.fromEntries(T.map(t=>{const m=(l.imp||{})[t]||{};return [t,Object.assign({b:m.b||'',d:m.d||'',l:m.l||''},m.f?{f:1}:{})]}))}))})}
  payload.arc.lines=out}}catch(e){}return _a.apply(this,arguments)}}
/* file box and PDF: every tooth with its own brand and size */
/* arbBr — layers: archive/arcb1 base + prosthesis/m2 (m3: the initial failures); r = the base text (empty without brands) */
function arbBr(l,html){const I=l.imp||{},T=(l.teeth||[]).filter(t=>I[t]&&I[t].b);if(!T.length)return '';const s=T.map(t=>toothTxt([t])+' '+I[t].b+(I[t].d&&I[t].l?' '+faD(String(I[t].d))+'×'+faD(String(I[t].l)):'')).join('، ');const r=html?' ('+esc(s)+')':' ('+s+')';
  try { const F = (l.teeth || []).filter(t => m3F(l, t)); if (!F.length || !r) return r; const add = ' — فیل اولیه: ' + toothTxt(F); return html ? r.replace(/\)$/, esc(add) + ')') : r.replace(/\)$/, add + ')') } catch (e) { return r }}
