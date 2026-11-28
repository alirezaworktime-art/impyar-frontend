
/* ---------- m28 (owner, 2026-11-13, full-site test): three fixes. (1) error messages raised outside the patient form were written into a hidden box and never seen (about 70 places in the lab cartable, inventory, other-clinics…) — they now show as a red toast; (2) roles without access to the card-reader list no longer ask the server for it on every patient file ---------- */
/* (1) alertMsg: the red toast outside the patient form is now part of the single definition in pdf/confirm-flow.js */
/* (2) is in ensurePos, finance/pos-which-card-reader-received.js */
/* (3) the searchable dropdown stayed open after its tab was redrawn (live refresh or another tab); picking from it then did nothing and threw */
const m28SS=()=>{try{if(L8.ss&&(!L8.ss.sel.isConnected||!L8.ss.b.isConnected))l8SSClose()}catch(e){}};
{const _r=renderLab;renderLab=function(){const r=_r.apply(this,arguments);try{m28SS();Promise.resolve(r).then(()=>{m28SS();setTimeout(m28SS,300)})}catch(e){}return r}}
document.addEventListener('click',e=>{try{if(L8.ss&&e.target.closest&&e.target.closest('#l8ssP')&&!L8.ss.sel.isConnected){e.preventDefault();e.stopPropagation();l8SSClose()}}catch(x){}},true);
