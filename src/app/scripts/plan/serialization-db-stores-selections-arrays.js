/* ---------- serialization (db stores selections as arrays) ---------- */
const onKeys=m=>Object.keys(m||{}).filter(k=>m[k]);
function secDoc(S){const s={};SECTIONS.forEach(x=>{const v=S[x.id];s[x.id]={lock:1,lock2:1,sp:(v.sp||[]).filter(r=>r&&(r.k||r.b||r.d||r.l)).map(r=>({k:r.k||'',b:r.b||'',d:r.d||'',l:r.l||''})),sel:onKeys(v.sel),text:v.text,price:v.price,bp:{...v.bp},cnt:v.cnt,jc:{...v.jc},ip:{...v.ip},isel:onKeys(v.isel),icnt:{...v.icnt}}});return s}
const asArr=a=>Array.isArray(a)?a:(a&&typeof a==='object'?onKeys(a):[]);
function secFrom(d){const S=blankSections();SECTIONS.forEach(x=>{let v=(d||{})[x.id];if(!v||typeof v!=='object')return;v=Object.assign({},v,{sel:asArr(v.sel),isel:asArr(v.isel)});const t=S[x.id];
  (v.sel||[]).forEach(k=>t.sel[k]=true);t.text=v.text||'';t.price=v.price||(x.base&&!v.lock?t.price:'');Object.assign(t.bp,v.bp||{});t.cnt=v.cnt||'';Object.assign(t.jc,v.jc||{});
  Object.assign(t.ip,v.ip||{});(v.isel||[]).forEach(k=>t.isel[k]=true);Object.assign(t.icnt,v.icnt||{});t.sp=Array.isArray(v.sp)?v.sp.map(r=>({k:r.k||'',b:r.b||'',d:r.d||'',l:r.l||''})):[];
  if(x.id==='vip'&&!v.lock2){const qs=new Set();(v.sel||[]).forEach(k=>{if(isTooth(k))qs.add(k.slice(0,2))});['U','L'].forEach(j=>{if(num((v.jc||{})[j]))[j+'R',j+'L'].forEach(q=>qs.add(q))});
    if(qs.size){if(num((v.icnt||{}).cgf))qs.forEach(q=>t.isel['cgf:'+q]=true);if(num((v.icnt||{}).mem))qs.forEach(q=>t.isel['mem:'+q]=true)}
    t.sel={};t.jc={U:'',L:''};t.icnt={}}
  if(x.id==='alv')(v.sel||[]).forEach(k=>{const m={'½ فک راست بالا':'q1','½ فک چپ بالا':'q2','½ فک چپ پایین':'q3','½ فک راست پایین':'q4'}[k.split(':')[1]];if(m){delete t.sel[k];t.sel[m]=true}});
  if(x.id==='surg'&&!(v.isel||[]).length)(v.sel||[]).forEach(k=>{const o=k.split(':')[1];if(o)t.isel['w:'+o]=true});
  if(x.id==='surg'){t.sel={};const QM={'بالا راست':'UR','بالا چپ':'UL','پایین راست':'LR','پایین چپ':'LL'};Object.keys(t.isel).forEach(k=>{const [ik,o]=k.split(':');if(QM[o]){const on=t.isel[k];delete t.isel[k];if(on)t.isel[ik+':'+QM[o]]=true}})}
  const clrJ=j=>Object.keys(t.sel).forEach(k=>{if(isTooth(k)&&(!j||k[0]===j))delete t.sel[k]});
  if(x.cnt==='jaws'&&!x.both&&num(t.cnt)&&!num(t.jc.U)&&!num(t.jc.L)){const n=num(t.cnt);t.jc.U=String(Math.min(x.jmax,n));t.jc.L=n>x.jmax?String(Math.min(x.jmax,n-x.jmax)):'';clrJ('')}
  if(x.cnt&&!x.both)t.cnt='';
  if(x.cnt)['U','L'].forEach(j=>{if(num(t.jc[j])){if(x.cnt==='jaws'&&!v.lock)t.jc[j]=String(Math.min(x.jmax,num(t.jc[j])+teethSel(t,j)));clrJ(j)}});
  if(x.excl)Object.keys(x.excl).forEach(k=>{if(t.isel[k]&&t.isel[x.excl[k]]&&k[0]==='c')t.isel[k]=false})});return S}
/* toDoc layers: base + fx3 (price quote) + fix6b (version _v, surgery difference sgDiff) + q7 (archived plans «طرح‌های دیگر» in alts) */
function toDoc(r){const o={h:{...r.h},med:medNorm(r.med),s:secDoc(r.s),s2:r.alt.mode==='full'&&r.sx&&r.sx[0]?secDoc(r.sx[0]):null,sx:r.alt.mode==='full'&&r.sx?r.sx.map(secDoc):[],alt:{...r.alt},brand:r.brand,pay:{...r.pay},status:r.status==='new'?'draft':r.status};
  ['jalali','confirmedAt','pdfName','emailStatus','emailTo','emailError','emailedAt','edits','createdAt','note'].forEach(k=>{if(r[k]!==undefined)o[k]=r[k]});
  if(r&&r.quote)o.quote=r.quote;
  if(r&&typeof r._v==='string')o._v=r._v;if(r&&r._sgd)o.sgDiff=r._sgd;
  try{if(r&&r.alts&&r.alts.plans)o.alts=Object.assign({},r.alts,{plans:r.alts.plans.map(p=>({no:p.no,s:secDoc(p.s)}))})}catch(e){}
  return o}
/* fromDoc layers merged here: base + fx3 (price quote) + fix6b (version _v). Later wrappers stay where they are (pl11, q7, m43a, m43d):
   boot (processOutbox → api('confirm') → fx3) can call fromDoc while the page loads, before those later scripts have run. */
function fromDoc(id,d){const r=blankForm();r.id=id;Object.assign(r.h,d.h||{});r.med=medNorm(d.med);r.brand=d.brand||(d.s?'ko':'ref');Object.assign(r.pay,d.pay||{});r.status=d.status||'draft';
  r.s=secFrom(d.s);r.alt=Object.assign({mode:'none',text:''},d.alt||{});r.sx=r.alt.mode==='full'?(Array.isArray(d.sx)&&d.sx.length?d.sx:(d.s2?[d.s2]:[])).map(secFrom):[];r.s2=r.sx[0]||null;if(r.alt.mode==='full'&&!r.sx.length)r.alt.mode='none';
  ['jalali','confirmedAt','pdfName','emailStatus','emailTo','emailError','emailedAt','edits','createdAt','note'].forEach(k=>{if(d[k]!==undefined)r[k]=d[k]});
  if(d&&d.quote)r.quote=d.quote;
  if(d&&typeof d._v==='string')r._v=d._v;
  return r}
/* local safety copy of the open patient (survives reloads, flaky internet, re-opening) */
const uuid=()=>(crypto.randomUUID?crypto.randomUUID():'x'+Date.now()+Math.random().toString(16).slice(2));
const LD='implantDraft:';
function ldSave(){if(!F||!F.id||!dirty||$('viewForm').hidden)return;try{const d=toDoc(F);d.updatedAt=new Date().toISOString();localStorage.setItem(LD+F.id,JSON.stringify({role:ROLE,d}))}catch(e){}}
function ldGet(id){try{const x=JSON.parse(localStorage.getItem(LD+id)||'null');return x&&x.role===ROLE?x.d:null}catch(e){return null}}
function ldDel(id){try{localStorage.removeItem(LD+id)}catch(e){}}
setInterval(ldSave,1500);addEventListener('pagehide',ldSave);document.addEventListener('visibilitychange',ldSave);
function planEmpty(r){const has=S=>S&&Object.values(S).some(v=>Object.values(v.sel||{}).some(Boolean)||num(v.cnt)||(v.text||'').trim()||(v.jc&&(num(v.jc.U)||num(v.jc.L)))||Object.values(v.icnt||{}).some(x=>num(x))||Object.values(v.isel||{}).some(Boolean));
  return !has(r.s)&&!(r.alt.mode==='full'&&(r.sx||[]).some(has))&&!(r.alt.mode==='text'&&(r.alt.text||'').trim())}
/* prefer the newest of: server copy, unsent outbox copy, local safety copy
   (layers: base + fix6b — a local draft based on an older version is kept aside first, not restored over the newer file) */
function newestDoc(id,serverDoc){try{const l=ldGet(id);if(l&&serverDoc&&typeof l._v==='string'&&typeof serverDoc._v==='string'&&l._v!==serverDoc._v)fx6bKeep({id,data:l},false)}catch(e){}
  let best=serverDoc,bt=serverDoc&&serverDoc.updatedAt||'';
  OUTBOX.filter(o=>o.id===id&&o.payload&&o.payload.record).forEach(o=>{const d=o.payload.record.data;if(d&&(d.updatedAt||'')>bt){best=d;bt=d.updatedAt}});
  const l=ldGet(id);if(l&&(l.updatedAt||'')>bt){best=l;bt=l.updatedAt}
  return best===serverDoc?null:best}
const BRAND_SEC=['imp','ovd'];
const needBrand=r=>[PV(r,1)].concat(r.alt&&r.alt.mode==='full'?(r.sx||(r.s2?[r.s2]:[])).map((s,i)=>PV(r,i+2)):[]).some(p=>BRAND_SEC.some(id=>rowUsed(p,SEC[id])));
const effBrand=r=>r.brand&&r.brand!=='ref'?r.brand:(()=>{const T0=totals(r);return BRANDS.reduce((a,b)=>T0.surg[b.k]<T0.surg[a]?b.k:a,'ir')})();
const planTotal=r=>{const T0=totals(PV(r,1)),g=(r.brand==='ref'?Math.min(...BRANDS.map(b=>T0.surg[b.k])):T0.surg[r.brand])+T0.pros;let d=0;try{d=discAmt(r,g)}catch(e){}return g-d};
/* layers: base + fix6b (the version the server returns travels with the form and its queue item) */
async function saveRecord(r){const d=toDoc(r);d.updatedAt=new Date().toISOString();
  const j=await api('save',{record:{id:r.id,data:d,name:(r.h.name||'').trim(),nid:r.h.nid||'',status:d.status,total:planTotal(r)}});
  r.id=j.id;dirty=false;ldDel(r.id);const q=QITEMS.find(v=>v.id===r.id);if(q){if(q.status==='queued')q.status='draft';q.data=d}
  try{if(j&&typeof j.ver==='string'){r._v=j.ver;const q=QITEMS.find(v=>v.id===r.id);if(q&&q.data)q.data._v=j.ver}}catch(e){}
  return j}

