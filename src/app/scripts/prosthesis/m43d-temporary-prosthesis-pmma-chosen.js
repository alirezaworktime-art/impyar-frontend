/* ---------- m43d (owner, 2026-11-17): temporary prosthesis — PMMA is chosen tooth by tooth, Essix and denture by jaw (upper / lower), each × its own
   tariff. The manager defines the tariffs in «تنظیمات»; the consultant can change them for one patient.
   (1) plan form «روکش موقت»: teeth = PMMA × price, «Essix — فک» and «دنچر — فک» chips × price per jaw (new forms; a plan that already has a
       temporary row keeps the old single price);
   (2) paper files: treatments «روکش موقت PMMA» (teeth), «روکش موقت Essix» and «روکش موقت دنچر» (jaw);
   (3) paper files «مراحل پروتز»: PMMA steps ask for the teeth, the Essix step for the jaw; every step has a default amount from the tariffs
       (per tooth / per jaw / per session) that can be typed over. ---------- */
(function(){
const JW={U:'فک بالا',L:'فک پایین',B:'هر دو فک'},JO=['بالا','پایین'],LRM='‎';
const PRT=k=>{try{return num((((SET&&SET.prices)||{})[k]||{}).price)}catch(e){return 0}};
try{A13_TEETH.pmma=1;A13_TEETH.pmmail=1}catch(e){}
try{M2_NO_I.esx=1;M2_NO_I.dnt=1}catch(e){}
try{['روکش موقت Essix','روکش موقت دنچر'].forEach(n=>{if(typeof M14_MAP!=='undefined'&&!M14_MAP.includes(n))M14_MAP.push(n)})}catch(e){}

/* ===== tariffs in the manager's settings ===== */
const stepU=k=>A13_TEETH[k]?'هر دندان':k==='essix'?'هر فک':'هر جلسه';
{const _r=renderPriceSettings;renderPriceSettings=function(){const r=_r.apply(this,arguments);try{const w=$('set_prices'),P=SET.prices||{};if(w&&!w.querySelector('[data-tp="tmp_es"]')){
  const inp=(k,l)=>`<div class="grp"><span>${l}</span><input class="price" inputmode="numeric" data-tp="${k}" value="${esc(fmtInput((P[k]||{}).price||''))}"></div>`;
  const t=w.querySelector('[data-tp="tmp"]'),g=t&&t.closest('.grp');
  if(g){const sp=g.querySelector('span');if(sp)sp.textContent='روکش موقت PMMA · هر واحد (پروتز)';g.insertAdjacentHTML('afterend',inp('tmp_es','روکش موقت Essix · هر فک (پروتز)')+inp('tmp_dn','روکش موقت دنچر · هر فک (پروتز)'))}
  w.insertAdjacentHTML('beforeend','<h4 class="a10ph">مراحل پروتز در پرونده‌ی جا مانده — پیش‌فرض مبلغ</h4>'+A13_TY.map(([k,n])=>inp('pr_'+k,esc(n)+' · '+stepU(k))).join(''))}}catch(e){console.error('m43d set',e)}return r}}

/* ===== (1) plan form ===== */
const T=SEC.tmp;
try{if(T&&T.groups&&T.groups.length===1)T.groups.push({l:'Essix — فک',o:JO.slice()},{l:'دنچر — فک',o:JO.slice()})}catch(e){}
const NEWM=s=>!!(s&&s.ip&&s.ip.m43d);
const jw=(s,g)=>JO.filter(o=>s.sel[g+':'+o]).length;
function tcalc(s){const pm=teethQty(s,T),es=jw(s,1),dn=jw(s,2),pp=num(s.price),pe=num(s.ip.es),pd=num(s.ip.dn);return {pm,es,dn,pp,pe,pd,sum:pm*pp+es*pe+dn*pd}}
function sync(s){const c=tcalc(s);s.sel['0:PMMA']=c.pm>0;s.sel['0:Essix']=c.es>0;s.sel['0:دنچر']=c.dn>0;return c}
const used=v=>{if(!v||typeof v!=='object')return false;const sel=Array.isArray(v.sel)?v.sel:Object.keys(v.sel||{}).filter(k=>v.sel[k]);return sel.length>0||num((v.jc||{}).U)>0||num((v.jc||{}).L)>0||num(v.cnt)>0};
const mark=s=>{try{if(s&&s.tmp&&s.tmp.ip){s.tmp.ip.m43d='1';if(!s.tmp.ip.es)s.tmp.ip.es=fmtInput(String(PRT('tmp_es')||''));if(!s.tmp.ip.dn)s.tmp.ip.dn=fmtInput(String(PRT('tmp_dn')||''))}}catch(e){}};
{const _b=blankSections;blankSections=function(){const S=_b.apply(this,arguments);mark(S);return S}}
/* a stored plan keeps its own mark; a stored plan without the mark stays on the old single price */
{const _f=secFrom;secFrom=function(d){const S=_f.apply(this,arguments);try{const v=d&&d.tmp;if(v&&typeof v==='object'&&!(v.ip&&v.ip.m43d)){S.tmp.ip.m43d='';S.tmp.ip.es='';S.tmp.ip.dn=''}}catch(e){}return S}}
/* a plan that is not finally approved and has nothing in «روکش موقت» yet moves to the new way */
{const _d=fromDoc;fromDoc=function(id,d){const r=_d.apply(this,arguments);try{if(r&&r.status!=='confirmed'&&r.status!=='modified')[r.s,r.s2].concat(r.sx||[]).forEach(S=>{if(S&&S.tmp&&!NEWM(S.tmp)&&!used(S.tmp))mark(S)})}catch(e){}return r}}
/* «سایر کلینیک‌ها»: that form has no prices and keeps the plain «نوع» choice */
try{if(typeof oc3Mount==='function'){const _m=oc3Mount;oc3Mount=function(){const f=_m.apply(this,arguments);try{if(f&&f.s&&f.s.tmp&&f.s.tmp.ip){f.s.tmp.ip.m43d='';f.s.tmp.ip.es='';f.s.tmp.ip.dn=''}}catch(e){}return f}}}catch(e){}
{const _r=rowTotals;rowTotals=function(r,x){const o=_r.apply(this,arguments);try{if(x&&x.id==='tmp'&&r&&r.s&&NEWM(r.s.tmp)){const c=sync(r.s.tmp);o.flat=c.sum;o.m43d=c}}catch(e){console.error('m43d',e)}return o}}
{const _c=chipsHTML;chipsHTML=function(x){try{if(x&&x.id==='tmp'&&x.groups&&x.groups.length===3){const s=AS().tmp;
    if(!NEWM(s))return _c.call(this,Object.assign({},x,{groups:[x.groups[0]]}));
    const h=_c.apply(this,arguments),i=h.indexOf('<div class="grp">',5);return '<p class="note">PMMA: دندان‌ها را روی شکل بزنید (دندان‌به‌دندان). Essix و دنچر: فک را انتخاب کنید.</p>'+(i>0?h.slice(i):h)}}catch(e){console.error('m43d chips',e)}return _c.apply(this,arguments)}}
{const _p=priceHTML;priceHTML=function(x){let h=_p.apply(this,arguments);try{if(x&&x.id==='tmp'&&h&&!SURG){const s=AS().tmp;if(NEWM(s)){
    h=h.replace('قیمت هر واحد','قیمت PMMA هر واحد');
    h='<div class="m43dp">'+h+`<label class="f">قیمت Essix هر فک<input class="price" inputmode="numeric" data-ip="tmp" data-ik="es" value="${esc(s.ip.es||'')}"></label><label class="f">قیمت دنچر هر فک<input class="price" inputmode="numeric" data-ip="tmp" data-ik="dn" value="${esc(s.ip.dn||'')}"></label></div><div class="calc" id="m43dCalc"></div>`}}}catch(e){console.error('m43d price',e)}return h}}
const parts=c=>[[c.pm,c.pp,'PMMA','واحد'],[c.es,c.pe,'Essix','فک'],[c.dn,c.pd,'دنچر','فک']].filter(a=>a[0]>0);
{const _c=pl9Calc;pl9Calc=function(){const out=_c.apply(this,arguments);try{const el=document.getElementById('m43dCalc');if(el&&typeof AS==='function'){const s=AS().tmp;if(NEWM(s)){const c=tcalc(s),P=parts(c);
    el.innerHTML=P.length?P.map(a=>`${a[2]}: <bdi class="pl9m" dir="ltr">${fa(a[0])} × ${fa(a[1])}</bdi> = <b>${fa(a[0]*a[1])}</b>`).join(' · ')+(P.length>1?` · جمع <b>${fa(c.sum)}</b>`:''):''}}}catch(e){console.error('m43d calc',e)}return out}}
{const _p=priceLines;priceLines=function(r,x){let L=_p.apply(this,arguments);try{if(x&&x.id==='tmp'&&r&&r.s&&NEWM(r.s.tmp)){const c=sync(r.s.tmp),P=parts(c);L=[];
    P.forEach(a=>{if(a[1])L.push({t:`${a[2]}: ${LRM}${fa(a[0])} ${a[3]} × ${fa(a[1])}`,c:'#444',s:17})});if(c.sum)L.push({t:fa(c.sum),b:1});
    try{const cx=mctx(),W=C.priceW-28;L.forEach(o=>{let z=o.s||20;while(z>10&&Wd(cx,o.t,{s:z,w:o.b?800:400})>W)z--;o.s=z})}catch(e){}}}catch(e){console.error('m43d pdf',e)}return L}}
/* PDF: a plan on the old price shows only the old «نوع» line */
{const _s=sectionRow;sectionRow=function(r,x){try{if(x&&x.id==='tmp'&&x.groups&&x.groups.length===3&&r&&r.s&&!NEWM(r.s.tmp))return _s.call(this,r,Object.assign({},x,{groups:[x.groups[0]]}))}catch(e){}return _s.apply(this,arguments)}}

/* ===== (2) paper files: PMMA / Essix / denture as treatments ===== */
try{if(!A6C.esx){const i=A6CAT.findIndex(x=>x.k==='tmp'),t=A6CAT[i];if(t)t.t='روکش موقت PMMA';const side=t?t.s:'L';
  const e1={k:'esx',t:'روکش موقت Essix',s:side,m:'n',u:'فک',p:()=>A6P('tmp_es')},e2={k:'dnt',t:'روکش موقت دنچر',s:side,m:'n',u:'فک',p:()=>A6P('tmp_dn')};
  A6CAT.splice(i>=0?i+1:A6CAT.length,0,e1,e2);A6C.esx=e1;A6C.dnt=e2}}catch(e){console.error('m43d cat',e)}
const isJ=l=>l&&(l.k==='esx'||l.k==='dnt');
const jn=l=>l.scan==='B'?2:1;
/* ===== (3) «مراحل پروتز»: default amount of a step ===== */
const stepN=l=>A13_TEETH[l.ty]?(l.teeth||[]).length:l.ty==='essix'?(l.scan==='B'?2:l.scan?1:0):1;
const stepDef=l=>{if(!l||!l.ty||l.redo)return 0;return PRT('pr_'+l.ty)*stepN(l)};
try{A6C.pros.p=l=>stepDef(l)}catch(e){}
{const _f=a6From;a6From=function(){const S=_f.apply(this,arguments);try{(S.lines||[]).forEach(l=>{if(isJ(l)){l.scan=JW[l.scan]?l.scan:(num(l.n)>=2?'B':'U');l.n=jn(l)}if(l.k==='pros')l.pm=1})}catch(e){}return S}}
const chips=(l,v)=>`<div class="chips" role="group">${['U','L','B'].map(s=>`<button type="button" class="chip" data-m43scan="${s}" data-l="${l.id}" aria-pressed="${v===s}">${JW[s]}</button>`).join('')}</div>`;
{const _l=a6Line;a6Line=function(l){let h=_l.apply(this,arguments);try{
  if(isJ(l))h=h.replace(/<label class="f a6n">[\s\S]*?<\/label>/,`<div class="grp m43jw"><span>کدام فک * — مبلغ برای ${fa(jn(l))} فک</span>${chips(l,l.scan||'U')}</div>`).replace('تعرفه‌ی هر واحد (تومان)','تعرفه‌ی هر فک (تومان)');
  else if(l&&l.k==='pros'&&l.ty==='essix')h=h.replace('<div class="a6sut">',`<div class="grp m43jw"><span>Essix برای کدام فک${l.m43new?' *':''}</span>${chips(l,l.scan||'')}</div><div class="a6sut">`)}catch(e){console.error('m43d line',e)}return h}}
{const _p=a6Panel;a6Panel=function(k){let h=_p.apply(this,arguments);try{if(k==='esx'||k==='dnt')h=h.replace(' برای هر واحد</small>',' برای هر فک</small>');if(k==='pros')h=h.replace(/ <small>تعرفه [^<]*<\/small>/,' <small>مبلغ پیش‌فرض هر مرحله از تعرفه‌های مدیر می‌آید و قابل تغییر است</small>')}catch(e){}return h}}
/* a new step follows the tariff until an amount is typed */
function fill(){(A6&&A6.lines||[]).forEach(l=>{if(l.k!=='pros'||l.pm||l.redo)return;const d=stepDef(l);if(d>0||l.pa){l.price=d;l.pa=d}})}
{const _r=a6Render;a6Render=function(){try{fill()}catch(e){}return _r.apply(this,arguments)}}
const re=()=>{const sc=window.scrollY;a6Render();window.scrollTo(0,sc)};
window.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('button');if(!t||!A6)return;const d=t.dataset;
  if(d.m43scan){const l=a6L(d.l);if(!l)return;e.preventDefault();e.stopImmediatePropagation();l.scan=(l.k==='pros'&&l.scan===d.m43scan&&!l.m43new)?'':d.m43scan;if(isJ(l))l.n=jn(l);A6.dirty=true;re();return}
  if(d.a6defp){const l=a6L(d.a6defp);if(l&&l.k==='pros'){l.pm=0;l.pa=1}}},true);
document.addEventListener('input',e=>{const i=e.target;if(!i||!i.dataset||i.dataset.a6f!=='price'||!A6)return;const l=a6L(i.dataset.l);if(l&&l.k==='pros')l.pm=1},true);
{const _lb=a13Lab;a13Lab=function(l){let s=_lb.apply(this,arguments);try{if(l&&l.k==='pros'&&l.ty==='essix'&&JW[l.scan])s+=' — '+JW[l.scan]}catch(e){}return s}}
{const _s=a6Save;a6Save=async function(btn){try{const m=$('a6Msg');for(const l of (A6&&A6.lines||[])){if(l.k==='pros'&&l.ty==='essix'&&l.m43new&&!JW[l.scan]){m.className='msg err';m.textContent='مراحل پروتز (قالب‌گیری Essix): فک را انتخاب کنید.';const n=document.querySelector(`.a6l[data-l="${l.id}"]`);if(n)n.scrollIntoView({behavior:'smooth',block:'center'});return}}}catch(e){}return _s.apply(this,arguments)}}
{const _a=api;api=function(action,payload,opt){try{if(action==='fxArc'&&payload&&payload.arc&&payload.arc.v6&&A6)(payload.arc.lines||[]).forEach(x=>{const l=A6.lines.find(y=>y.id===x.id);if(!l)return;
  if(isJ(l)){x.scan=l.scan||'U';x.n=jn(l);x.teeth=[]}else if(l.k==='pros'&&l.ty==='essix'&&JW[l.scan])x.scan=l.scan})}catch(e){}return _a.apply(this,arguments)}}
window.m43d={tcalc,NEWM,stepDef};
})();
