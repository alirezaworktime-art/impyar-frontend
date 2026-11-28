/* ---------- confirm flow ---------- */
let lastPDF=null,busy=false;const PK={btn:null};
const $=id=>document.getElementById(id);
const validEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s||'');
function safeName(s){return String(s||'').replace(/[\/\\:*?"<>|]+/g,' ').replace(/\s+/g,' ').trim()}
/* alertMsg — one definition of the old layers: m30 (outside the patient form, a message starting with «#» is information → normal toast),
   m28 (outside the patient form → red toast), base (inside the form → the editNote box). lab/m26 still swaps it for a moment while editing an account. */
function alertMsg(t){try{const f=$('viewForm');if((!f||f.hidden||f.offsetParent===null)&&/^#/.test(String(t||''))){toast(String(t));return}}catch(e){}
  try{const f=$('viewForm');if(!f||f.hidden||f.offsetParent===null){toast(String(t==null?'':t),1);return}}catch(e){}
  const b=$('editNote');b.hidden=false;b.textContent=t;b.scrollIntoView({behavior:'smooth',block:'center'})}
