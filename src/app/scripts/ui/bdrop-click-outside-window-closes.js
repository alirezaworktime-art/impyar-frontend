/* ---------- bdrop: click outside a window closes it like «بستن»; typed text is kept as a temporary draft ---------- */
const BD={snap:new WeakMap(),drafts:new Map(),down:null,lo:new Map()};
const bdFields=sh=>[...sh.querySelectorAll('input,textarea,select')].filter(e=>!['file','password','hidden','button','submit'].includes(e.type)&&!e.disabled&&!e.closest('[hidden]'));
const bdKey=(e,i)=>e.id||e.name||(e.dataset&&Object.keys(e.dataset).map(k=>k+'='+e.dataset[k]).join('&'))||('#'+i);
const bdVal=e=>e.type==='checkbox'||e.type==='radio'?(e.checked?'1':''):String(e.value);
const bdHead=sh=>{const h=sh.querySelector('h2,h3');return sh.id+'|'+(h?h.textContent.trim().slice(0,80):'')+(sh.id==='pfSheet'&&typeof PF!=='undefined'&&PF?'|'+PF.id:'')};
function bdVals(sh){const o={};bdFields(sh).forEach((e,i)=>o[bdKey(e,i)]=bdVal(e));return o}
/* bdOpened — merged patch layers: bdrop (base, below) + m4 (surgery/what-unsaved-screen-now-who.js, first part).
   m4: opening rcSheet / pfSheet, the kept or live device text of the last 3 hours comes back into BD.drafts (the bdrop part restores it).
   M4T / m4Get / m4Put live in that later file; before it has run the m4 part fails at M4T and is swallowed, as when that layer was not there yet. */
function bdOpened(sh){try { if (['rcSheet', 'pfSheet'].includes(sh.id)) { M4T.delete(sh); const head = bdHead(sh), K = m4Get('kept'), L = m4Get('live'), x = BD.drafts.get(head) || K[head] || L[head];
      if (x && Date.now() - x.at < 3 * 3600e3) { const cur = bdVals(sh); for (const k in x.v || {}) if (cur[k] === '' || cur[k] === undefined) x.v[k].from = cur[k] || ''; BD.drafts.set(head, x) } delete K[head]; delete L[head]; m4Put('kept', K); m4Put('live', L) } } catch (e) {}
  BD.snap.set(sh,{vals:bdVals(sh),head:bdHead(sh)});const k=bdHead(sh),d=BD.drafts.get(k);if(!d)return;BD.drafts.delete(k);if(Date.now()-d.at>3*3600e3)return;
  let n=0;bdFields(sh).forEach((e,i)=>{const c=d.v[bdKey(e,i)];if(!c||bdVal(e)!==c.from)return;if(e.type==='checkbox'||e.type==='radio')e.checked=c.to==='1';else e.value=c.to;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));n++});
  if(n)toast('متنی که قبلاً در این پنجره نوشته بودید برگردانده شد.')}
function bdClose(sh){if(sh.id==='cSheet'&&typeof busy!=='undefined'&&busy)return;const B=[...sh.querySelectorAll('button')].filter(x=>!x.disabled&&!x.hidden&&x.offsetParent!==null),b=B.find(x=>/(Close|Cancel|No)$/.test(x.id))||B.find(x=>/^(بستن|انصراف|بازگشت)/.test((x.textContent||'').trim()));if(b)b.click();if(!sh.hidden)sh.hidden=true}
function bdSaveDraft(sh){const s=BD.snap.get(sh);if(!s)return false;const now=bdVals(sh),v={};let n=0;
  for(const k in now)if(now[k]!==(s.vals[k]??'')&&String(now[k]).trim()!==''){v[k]={from:s.vals[k]??'',to:now[k]};n++}
  if(sh.id==='pfSheet'&&typeof PF!=='undefined'&&PF&&typeof LO!=='undefined'&&LO){try{loRead()}catch(e){}BD.lo.set(PF.id,{LO,LOF:(typeof LOF!=='undefined'?LOF.slice():[]),at:Date.now()});n++}
  if(n)BD.drafts.set(s.head,{v,at:Date.now()});return n>0}
new MutationObserver(M=>M.forEach(m=>{const sh=m.target;if(!sh.classList||!sh.classList.contains('sheet'))return;if(!sh.hidden&&m.oldValue!==null)setTimeout(()=>{if(!sh.hidden)bdOpened(sh)},80)})).observe(document.body,{attributes:true,attributeFilter:['hidden'],attributeOldValue:true,subtree:true});
document.addEventListener('pointerdown',e=>{BD.down=e.target&&e.target.classList&&e.target.classList.contains('sheet')?e.target:null},true);
document.addEventListener('click',e=>{const sh=e.target;if(!sh||!sh.classList||!sh.classList.contains('sheet')||sh.hidden||BD.down!==sh)return;BD.down=null;
  const kept=bdSaveDraft(sh);bdClose(sh);if(kept)toast('پنجره بسته شد؛ نوشته‌ها موقت نگه داشته شد و با باز کردن دوباره برمی‌گردد.')});
/* the lab order form inside the patient file */
/* (its restore when the file opens: in openFile, finance/patient-file-timeline.js) */

