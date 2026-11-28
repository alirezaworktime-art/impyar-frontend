/* ---------- calc ---------- */
const isTooth=k=>/^[UL][RL]\d$/.test(k);
const teethSel=(s,j)=>Object.keys(s.sel).filter(k=>s.sel[k]&&isTooth(k)&&(!j||k[0]===j)).length;
const chipSel=s=>Object.keys(s.sel).filter(k=>s.sel[k]&&!isTooth(k)).length;
const teethQty=(s,x)=>x.cnt?['U','L'].reduce((a,j)=>a+(num(s.jc[j])||teethSel(s,j)),0)+(x.both?num(s.cnt):0):teethSel(s);
function qty(s,x){
  if(x.kind==='teeth'){
    const t=teethQty(s,x);
    return t||(x.groups&&chipSel(s)?1:0)}
  if(x.price==='implantBrand'||x.price==='aox')return Object.keys(s.sel).filter(k=>s.sel[k]).reduce((a,k)=>a+num(k.split(':')[1]),0);
  return chipSel(s)}
function tnTeeth(s,it,q){return Object.keys(s.isel).filter(z=>s.isel[z]&&z.startsWith(it.k+'n:'+q)).map(z=>z.split(':')[1]).sort()}
const RQD=['UR','UL','LR','LL'];
function itemQ(s,it,q){if(!s.isel[it.k+':'+q])return 0;return it.tn?(tnTeeth(s,it,q).length||1):it.qn?(num(s.icnt[it.k+':'+q])||1):1}
const regP=(x,it)=>x.id==='surg'&&it.type==='quad';
const qPrice=(s,it,q)=>{const v=s.ip[it.k+'@'+q];return num(v!==undefined&&v!==''?v:s.ip[it.k])};
function itemCost(x,s,it){return regP(x,it)?RQD.reduce((a,q)=>a+itemQ(s,it,q)*qPrice(s,it,q),0):itemQty(s,it)*num(s.ip[it.k])}
function itemQty(s,it){if(it.type==='count')return num(s.icnt[it.k]);const on=Object.keys(s.isel).filter(k=>s.isel[k]&&k.startsWith(it.k+':'));if(it.tn)return on.reduce((a,k)=>a+(tnTeeth(s,it,k.split(':')[1]).length||1),0);return it.qn?on.reduce((a,k)=>a+(num(s.icnt[k])||1),0):on.length}
function rowTotals(r,x){const s=r.s[x.id],q=qty(s,x),o={flat:0,brand:bz()};
  if(x.price==='unit')o.flat=q*num(s.price);
  else if(x.price==='flat')o.flat=(q||(s.text||'').trim())?num(s.price):0;
  else if(x.price==='brandUnit')BRANDS.forEach(b=>o.brand[b.k]=q*num(s.bp[b.k]));
  if(x.id==='imp'&&r.s.crw)o.pros=q*num(r.s.crw.price);
  else if(x.price==='implantBrand')BRANDS.forEach(b=>o.brand[b.k]=q*num(r.s.imp.bp[b.k]));
  if(x.price==='aox'){if(s.isel['t:long']){const on=q||chipSel(s);o.flat=on?num(s.ip.lt):0;o.pros=on?num(s.ip.lq):0;return o}o.flat=aoxCost(s);o.pros=q*num(s.price);return o}/* q3: prosthesis per base */
  if(x.prosJaw)o.pros=chipSel(s)*num(s.price);
  else if(x.price==='items')o.flat=x.items.reduce((a,it)=>a+itemCost(x,s,it),0)+(x.base?teethQty(s,x)*num(s.price):0);
  if(x.items&&x.price&&x.price!=='items')o.flat+=x.items.reduce((a,it)=>a+itemQty(s,it)*num(s.ip[it.k]),0);
  return o}
/* totals: base + pk1 (plan/pk1-consultant-form-clinic-doctor.js, skipped while PK1.off): the guide added to the surgery part of every brand;
   the global discount taken off the surgery / prosthesis parts (percent per part; a toman amount split by the selected brand's parts).
   PK1 exists only once the pk1 script has run; before that (e.g. renderForm in core/boot.js and the later scripts' load) totals is the bare base, as before */
function totals(r){const surg=bz();let pros=0;
  SECTIONS.forEach(x=>{const t=rowTotals(r,x);pros+=t.pros||0;if(x.pros)pros+=t.flat;else BRANDS.forEach(b=>surg[b.k]+=t.flat+t.brand[b.k])});
  const T={surg,pros};if(typeof PK1==='undefined'||PK1.off)return T;try{const p=(r&&r.pay)||{};const sg=pk1Sgd(p);if(sg.amt){BRANDS.forEach(b=>{T.surg[b.k]+=sg.amt});T.sgd=sg}
  const g=pk1GdRaw(p);if(g){let bk=r.brand&&r.brand!=='ref'&&T.surg[r.brand]!==undefined?r.brand:BRANDS.reduce((a,b)=>T.surg[b.k]<T.surg[a]?b.k:a,'ir');
    const S=T.surg[bk]||0,P=T.pros||0,d=pk1GdAmt(p,S+P),dS=g.m==='p'?Math.min(S,Math.round(S*Math.min(100,g.v)/100)):(S+P?Math.round(d*S/(S+P)):0),dP=Math.min(P,d-dS);
    T.gd={d,dS,dP,w:g.w,why:g.why,brand:bk};BRANDS.forEach(b=>{const s=T.surg[b.k];T.surg[b.k]=Math.max(0,s-(g.m==='p'?Math.min(s,Math.round(s*Math.min(100,g.v)/100)):dS))});T.pros=Math.max(0,P-dP)}}catch(e){}return T}
const MIL=1e6,rnd=v=>v>=MIL?Math.round(v/MIL)*MIL:Math.round(v);
function splitPay(T,pct,n){const c=Math.min(T,pct>1?Math.round(pct):pct>=1?T:rnd(T*pct)),rest=T-c;n=Math.max(1,n||1);const u=rest>=1e5*n?1e5:1,base=Math.floor(rest/n/u)*u,am=Array.from({length:n},()=>base);let left=rest-base*n;const k=Math.min(n,Math.floor(left/u));for(let i=0;i<k;i++)am[i]+=u;left-=k*u;am[0]+=left;return {c,rest,n,per:am[0],last:am[n-1],am}}
const pctS=r=>{const C=cashTot(r);if(C!==null){const S=partS(r);return S?Math.min(100,Math.min(S,C)/S*100):100}const v=num(r.pay.cs);return r.pay.cs!==undefined&&String(r.pay.cs).trim()!==''?Math.min(100,v):(r.pay.opt==='1'?30:50)};
const pctP=r=>{const C=cashTot(r);if(C!==null){const S=partS(r),P=partP(r),cP=Math.min(P,Math.max(0,C-Math.min(S,C)));return P?Math.min(100,cP/P*100):100}const v=num(r.pay.cp);return r.pay.cp!==undefined&&String(r.pay.cp).trim()!==''?Math.min(100,v):30};
/* cashFor: base + option 3 (pl10O3): o3s (finance/o3s-option-agreed-default-surgery.js: pct% of the surgery part) first,
   pl10 (consultant/pl10-duplicate-alarm-national-id.js: pct% of the whole plan) only if o3s fails; each is a no-op until its script has loaded */
function cashFor(r,S,P){try{if(pl10O3(r))return o3sCash(r,S)}catch(e){}
  try { if (pl10O3(r)) return pl10Cash(r, S, P) } catch (e) { }
  const c=splitPay(S,fracS(r),1).c+splitPay(P,fracP(r),1).c;return discOn(r)?c-discAmt(r,S+P):c}
/* payText: base (on fx7N1(rIn): fix7d, finance/fix7d-money-rv4-m3-settle.js — an empty cheque count is one cheque)
   + pl10 (consultant/pl10-duplicate-alarm-national-id.js: option 3 = pct% of the whole plan) + o3s (finance/o3s-option-agreed-default-surgery.js:
   option 3 = pct% of the surgery part; wins over pl10). pl10 and o3s read the caller's rIn; each is a no-op until its script has loaded (caught ReferenceError) */
function payText(rIn,brand){const r=fx7N1(rIn),T=totals(r),b=brand||effBrand(r),S=T.surg[b],p=r.pay,out={surg:'',pros:''},ps=pctS(r),pp=pctP(r);
  if(discOn(r)){const d=discPct(r);if(S)out.surg=`۱۰۰٪ نقد با ${fa(d)}٪ تخفیف: ${fa(S-discAmt(r,S))} (به جای ${fa(S)})`;if(T.pros)out.pros=`۱۰۰٪ نقد با ${fa(d)}٪ تخفیف: ${fa(T.pros-(discAmt(r,S+T.pros)-discAmt(r,S)))} (به جای ${fa(T.pros)})`}
  else{const chk=x=>{const g=[];(x.am||[x.per]).forEach(v=>{const l=g[g.length-1];if(l&&l[0]===v)l[1]++;else g.push([v,1])});return g.length===1?`هر چک ${fa(g[0][0])}`:g.map(([v,k])=>k>1?`${fa(k)} چک هر کدام ${fa(v)}`:`یک چک ${fa(v)}`).join(' و ')};
  if(S){if(p.opt==='1'){const n=num(p.n1),x=splitPay(S,fracS(r),n);out.surg=`${fa(ps)}٪ نقد: ${fa(x.c)}`+(n&&x.rest?` · مانده در ${fa(n)} فقره چک به فواصل یک‌ماهه، ${chk(x)}`:x.rest?` · مانده: ${fa(x.rest)}`:'')}
    else{const m=num(p.m2),x=splitPay(S,fracS(r),1);out.surg=`${fa(ps)}٪ نقد: ${fa(x.c)}`+(x.rest?` · مانده در یک فقره چک ${fa(x.rest)}`:'')+(m?` برای ${fa(m)} ماه بعد از تاریخ جراحی`:'')}}
  if(T.pros){const n=num(p.n3),x=splitPay(T.pros,fracP(r),n);out.pros=`${fa(pp)}٪ نقد: ${fa(x.c)}`+(n&&x.rest?` · مانده در ${fa(n)} فقره چک به فواصل یک‌ماهه، ${chk(x)}`:x.rest?` · مانده: ${fa(x.rest)}`:'')}}
  let o=out;
  try { if (pl10O3(rIn)) { const T = totals(rIn), b = brand || effBrand(rIn), S = T.surg[b] || 0, P = T.pros || 0, C = pl10Cash(rIn, S, P); o = { surg: `${fa(pl10Pct(rIn))}٪ کل طرح نقد قبل از جراحی: ${fa(C)}`, pros: `مانده ${fa(Math.max(0, S + P - C))} نقد روز قالب‌گیری (بدون چک)` } } } catch (e) { }
  try{if(pl10O3(rIn)){const T=totals(rIn),b=brand||effBrand(rIn),S=T.surg[b]||0,P=T.pros||0,C=o3sCash(rIn,S);return {surg:`${fa(pl10Pct(rIn))}٪ پارت جراحی نقد قبل از جراحی: ${fa(C)}`,pros:o3sRest(S,P,C)}}}catch(e){}return o}
function rowUsed(r,x){const s=r.s[x.id];return !!(qty(s,x)||teethSel(s)||(x.cnt&&(num(s.jc.U)||num(s.jc.L)))||s.text||(x.items&&x.items.some(it=>itemQty(s,it))))}

