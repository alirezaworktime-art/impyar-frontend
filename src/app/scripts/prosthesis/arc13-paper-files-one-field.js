
/* ---------- arc13: paper files — (1) one field «مراحل پروتز» on the left: step type, abutment/pontic teeth on the chart, «مجدد» (free), cement for «چسب مجدد»,
   one amount per session typed by hand; (2) «پایه ایمپلنت»: each session is «جدید / کاشت مجدد اول / کاشت مجدد دوم» (re-implant = free); the separate
   re-implant box (arc11/arc12) is retired — old re-implant lines open as «کاشت مجدد اول» ---------- */
const A13_TY=[['impr','قالب‌گیری'],['rscr','امتحان رزین پیچ‌شونده'],['rabt','امتحان رزین اباتمنت'],['deliv','تحویل روکش'],['cem','چسب مجدد'],['fix','اصلاح روکش'],['ng','قالب‌گیری نایت‌گارد'],['essix','قالب‌گیری Essix'],['pmma','قالب‌گیری PMMA'],['sgd','قالب‌گیری سرجیکال گاید'],['pmmail','قالب‌گیری PMMA ایمدیت لود']];
const A13_TN=Object.fromEntries(A13_TY),A13_TEETH={impr:1,rscr:1,rabt:1,deliv:1},A13_CEM={kerr:'Kerr',gc:'GC',pc:'PC'},A13_RI={0:'جدید',1:'کاشت مجدد اول',2:'کاشت مجدد دوم'};
A6CAT.splice(Math.max(0,A6CAT.findIndex(x=>x.k==='crw')),0,{k:'pros',t:'مراحل پروتز',s:'L',m:'n',p:()=>0});A6C.pros=A6CAT.find(x=>x.k==='pros');
const a13Free=l=>l.k==='pros'?!!(l.redo&&A13_TEETH[l.ty]):l.k==='imp'&&+l.ri>0;
const a13Roles=l=>{const pt=l.pt||{},a=l.teeth.filter(t=>pt[t]!=='p'),p=l.teeth.filter(t=>pt[t]==='p');return (a.length?'پایه: '+toothTxt(a):'')+(a.length&&p.length?' · ':'')+(p.length?'پونتیک: '+toothTxt(p):'')};
/* a13Lab: base + arc15 (prosthesis/arc15-notes-box-per-session.js: a «مراحل پروتز» line with a note gets « — توضیح: …»)
   + arc16 (archive/arc16-has-tariff-again-per.js: «پایه ایمپلنت» lines lose « (رایگان)»); m43d (Essix jaw) still wraps this in its own file */
function a13Lab(l){let s;if(l.k==='imp')s='پایه ایمپلنت — '+A13_RI[+l.ri||0]+' (رایگان)';
  else{s=A13_TN[l.ty]||'مراحل پروتز';if(l.redo&&A13_TEETH[l.ty])s+=' (مجدد — رایگان)';if(l.ty==='cem'&&l.cem)s+=' — '+(A13_CEM[l.cem]||'');const r=A13_TEETH[l.ty]&&l.teeth&&l.teeth.length?a13Roles(l):'';s=s+(r?' — '+r:'')}
  if(l&&l.k==='pros'&&String(l.note||'').trim())s=s+' — توضیح: '+String(l.note).trim();
  return l&&l.k==='imp'?s.replace(' (رایگان)',''):s}
/* new and opened lines */
{const _n=a6NewLine;a6NewLine=function(k){const l=_n.apply(this,arguments);if(l&&k==='pros'){l.n=1;l.ty='';l.pt={};l.redo=false;l.cem='';l.price=0}if(l&&k==='imp')l.ri=0;return l}}
{const _f=a6From;a6From=function(){const S=_f.apply(this,arguments);try{S.lines.forEach(l=>{if(l.k==='reimp'){l.k='imp';l.ri=1;l.price=0}if(l.k==='pros'){l.n=1;l.pt=l.pt||{};l.teeth=l.teeth||Object.keys(l.pt)}if(l.k==='imp')l.ri=+l.ri||0});
  if(S.lines.some(l=>l.k==='pros'))S.op.add('pros');S.op.delete('reimp')}catch(e){}return S}}
/* one session line */
{const _l=a6Line;a6Line=function(l){let h=_l.apply(this,arguments);if(!l||(l.k!=='pros'&&l.k!=='imp'))return h;try{
  if(l.k==='imp'){const ri=+l.ri||0;
    const ch=`<div class="a13ri"><span>این جلسه</span><div class="chips" role="radiogroup" aria-label="جدید یا کاشت مجدد">${[0,1,2].map(v=>`<button type="button" class="chip" role="radio" data-a13ri="${v}" data-l="${l.id}" aria-pressed="${ri===v}" aria-checked="${ri===v}">${A13_RI[v]}</button>`).join('')}</div>${ri?'<small>کاشت مجدد رایگان است؛ مبلغ این جلسه صفر.</small>':''}</div>`;
    h=h.replace('<div class="a6g2">',ch+'<div class="a6g2">');if(ri)h=h.replace('<div class="a6l" data-l=','<div class="a6l a13free" data-l=');return h}
  const tt=!!A13_TEETH[l.ty],free=a13Free(l);
  const top=`<div class="a13top"><label class="f">نوع کار *<select data-a13ty="${l.id}"><option value="">انتخاب کنید</option>${A13_TY.map(([k,n])=>`<option value="${k}"${l.ty===k?' selected':''}>${n}</option>`).join('')}</select></label>
    ${tt?`<div class="a13g"><span>مجدد بوده؟</span><div class="chips"><button type="button" class="chip" data-a13redo="0" data-l="${l.id}" aria-pressed="${!l.redo}">نه</button><button type="button" class="chip" data-a13redo="1" data-l="${l.id}" aria-pressed="${!!l.redo}">بله، ${esc(A13_TN[l.ty])} مجدد (رایگان)</button></div></div>`:''}
    ${l.ty==='cem'?`<div class="a13g"><span>نوع چسب *</span><div class="chips">${Object.keys(A13_CEM).map(k=>`<button type="button" class="chip" data-a13cem="${k}" data-l="${l.id}" aria-pressed="${l.cem===k}">${A13_CEM[k]}</button>`).join('')}</div></div>`:''}</div>`;
  h=h.replace('<div class="a6g2">',top+'<div class="a6g2">');
  h=h.replace('<div class="a6l" data-l=',`<div class="a6l a13p${tt?'':' a13nt'}${free?' a13free':''}" data-l=`);
  h=h.replace('تعرفه‌ی هر واحد (تومان)','مبلغ این جلسه (تومان)');
  if(free)h=h.replace(`data-a6f="price" data-l="${l.id}"`,`data-a6f="price" data-l="${l.id}" disabled`);
  if(tt)h=h.replace('<div class="a6sut">',`<div class="a13ch"><p class="note">روی دندان بزنید: یک بار = <b class="a13ka">پایه</b> · دو بار = <b class="a13kp">پونتیک</b> · سه بار = برداشتن${l.teeth.length?' — '+esc(a13Roles(l)):''}</p>${a6Teeth(l)}</div><div class="a6sut">`)}catch(e){}return h}}
{const _r=a6Render;a6Render=function(){const r=_r.apply(this,arguments);try{(A6&&A6.lines||[]).filter(l=>l.k==='pros').forEach(l=>{const pt=l.pt||{};document.querySelectorAll(`.a13ch [data-a6t][data-l="${l.id}"]`).forEach(b=>{const t=b.dataset.a6t,on=l.teeth.includes(t);b.classList.toggle('a13pa',on&&pt[t]!=='p');b.classList.toggle('a13pp',on&&pt[t]==='p');b.title=on?(pt[t]==='p'?'پونتیک':'پایه'):''})})}catch(e){}return r}}
const a13Re=()=>{const sc=window.scrollY;a6Render();window.scrollTo(0,sc)};
window.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('button');if(!t||!A6)return;const d=t.dataset;
  if(d.a6t){const l=a6L(d.l);if(!l||l.k!=='pros')return;e.preventDefault();e.stopImmediatePropagation();const k=d.a6t;l.pt=l.pt||{};
    if(!l.teeth.includes(k)){l.teeth.push(k);l.pt[k]='a'}else if(l.pt[k]!=='p')l.pt[k]='p';else{l.teeth=l.teeth.filter(x=>x!==k);delete l.pt[k]}l.n=1;A6.dirty=true;a13Re();return}
  if(d.a13ri!==undefined){const l=a6L(d.l);if(!l)return;e.preventDefault();e.stopImmediatePropagation();l.ri=+d.a13ri;A6.dirty=true;a13Re();try{a6MoneyLite()}catch(x){}return}
  if(d.a13redo!==undefined){const l=a6L(d.l);if(!l)return;e.preventDefault();e.stopImmediatePropagation();l.redo=d.a13redo==='1';if(l.redo){l.p0=l.price;l.price=0}else if(l.p0!=null){l.price=l.p0;delete l.p0}A6.dirty=true;a13Re();try{a6MoneyLite()}catch(x){}return}
  if(d.a13cem){const l=a6L(d.l);if(!l)return;e.preventDefault();e.stopImmediatePropagation();l.cem=d.a13cem;A6.dirty=true;a13Re();return}},true);
document.addEventListener('change',e=>{const s=e.target;if(!s||!s.dataset||!s.dataset.a13ty||!A6)return;const l=a6L(s.dataset.a13ty);if(!l)return;l.ty=s.value;
  if(!A13_TEETH[l.ty]&&l.redo){l.redo=false;if(l.p0!=null){l.price=l.p0;delete l.p0}}if(l.ty!=='cem')l.cem='';A6.dirty=true;a13Re()});
/* save: checks, and the new fields go to the server */
{const _s=a6Save;a6Save=async function(btn){try{const m=$('a6Msg'),bad=(t,l)=>{m.className='msg err';m.textContent=t;const n=document.querySelector(`.a6l[data-l="${l.id}"]`);if(n)n.scrollIntoView({behavior:'smooth',block:'center'})};
  for(const l of (A6&&A6.lines||[])){if(l.k!=='pros')continue;if(!A13_TN[l.ty])return bad('مراحل پروتز: نوع کار را انتخاب کنید.',l);
    if(A13_TEETH[l.ty]&&!l.teeth.length)return bad('مراحل پروتز ('+A13_TN[l.ty]+'): شماره‌ی پایه و پونتیک را روی شکل دندان‌ها بزنید.',l);
    if(l.ty==='cem'&&!A13_CEM[l.cem])return bad('مراحل پروتز (چسب مجدد): نوع چسب را انتخاب کنید.',l)}}catch(e){}return _s.apply(this,arguments)}}
{const _a=api;api=function(action,payload,opt){try{if(action==='fxArc'&&payload&&payload.arc&&payload.arc.v6&&A6)(payload.arc.lines||[]).forEach(x=>{const l=A6.lines.find(y=>y.id===x.id);if(!l)return;
  if(x.k==='imp'){x.ri=+l.ri||0;if(x.ri)x.price=0}
  if(x.k==='pros'){x.ty=l.ty;x.cem=l.cem||'';x.redo=!!(l.redo&&A13_TEETH[l.ty]);x.teeth=A13_TEETH[l.ty]?l.teeth.slice():[];x.pt=Object.fromEntries(x.teeth.map(t=>[t,(l.pt||{})[t]==='p'?'p':'a']));x.n=1;if(x.redo)x.price=0}})}catch(e){}return _a.apply(this,arguments)}}
