/* ---------- confirm flow ---------- */
let lastPDF=null,busy=false;const PK={btn:null};
const $=id=>document.getElementById(id);
const validEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s||'');
function safeName(s){return String(s||'').replace(/[\/\\:*?"<>|]+/g,' ').replace(/\s+/g,' ').trim()}
function alertMsg(t){const b=$('editNote');b.hidden=false;b.textContent=t;b.scrollIntoView({behavior:'smooth',block:'center'})}
