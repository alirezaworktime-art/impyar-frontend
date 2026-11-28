/* ---------- pos: which card reader received the money ---------- */
let POSL=null,POSP=null;
/* ensurePos: base + m28 (roles without access to the card-reader list never ask the server: an empty list) */
function ensurePos(force){try{if(!['consultant','staff','manager','accountant'].includes(ROLE)){POSL=POSL||[];return Promise.resolve(POSL)}}catch(e){}if(POSL&&!force)return Promise.resolve(POSL);if(POSP&&!force)return POSP;
  POSP=api('posList').then(j=>{POSL=j.items||[];POSP=null;return POSL}).catch(()=>{POSP=null;POSL=POSL||[];return POSL});return POSP}
const posName=id=>{const p=(POSL||[]).find(x=>x.id===id);return p?p.name:''};
const posKind=v=>v==='cash'?'cash':'card',posId=v=>v&&v!=='cash'&&v!=='xfer'?v:'';
function posChips(attr,sel,opt){opt=opt||{};const L=(POSL||[]).filter(p=>Number(p.active));
  return `<div class="chips poschips">${L.map(p=>`<button type="button" class="chip" data-${attr}="${esc(p.id)}" aria-pressed="${sel===p.id}">💳 ${esc(p.name)}</button>`).join('')}${opt.cash?`<button type="button" class="chip" data-${attr}="cash" aria-pressed="${sel==='cash'}">💵 نقد (اسکناس)</button>`:''}<button type="button" class="chip" data-${attr}="xfer" aria-pressed="${sel==='xfer'}">🏦 کارت‌به‌کارت / واریز</button></div>${POSL&&!L.length?'<p class="note">هنوز کارتخوانی تعریف نشده؛ مدیر یا حسابدار در «حسابداری» اضافه کند.</p>':''}`}
function posPick(t,attr){const v=t.dataset[attr];t.closest('.poschips').querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',b===t));return v}
function posBreak(pays){const g={};(pays||[]).filter(p=>p.kind==='card'&&p.st!=='del').forEach(p=>{const k=p.pos||'';g[k]=(g[k]||0)+(Number(p.amount)||0)});const K=Object.keys(g);if(!K.length)return '';
  return `<div class="posbrk"><b>کارتخوان‌ها:</b> ${K.sort((a,b)=>g[b]-g[a]).map(k=>`<span>${esc(k?(posName(k)||'؟'):'کارت‌به‌کارت / بدون کارتخوان')}: <b>${fa(g[k])}</b></span>`).join('')}</div>`}
function posMgrHTML(){if(!['manager','accountant'].includes(ROLE))return '';const L=POSL||[];
  return `<h3 class="pf-h">کارتخوان‌ها <small class="note">مشاور هنگام ثبت دریافت، یکی از این‌ها را انتخاب می‌کند</small></h3><div class="list">${L.map(p=>`<div class="item"><div class="row1"><span>💳 <b>${esc(p.name)}</b>${Number(p.active)?'':' <span class="pill bad">غیرفعال</span>'}</span><button class="btn sm ghost" type="button" data-posact="${esc(p.id)}" data-on="${Number(p.active)?0:1}">${Number(p.active)?'غیرفعال کن':'فعال کن'}</button></div></div>`).join('')||'<div class="empty">کارتخوانی تعریف نشده.</div>'}</div>
    <div class="fields" style="margin-top:8px"><label class="f">نام کارتخوان تازه<input id="pos_new" placeholder="مثلاً: نام صاحب حساب"></label></div><div class="btns"><button class="btn" type="button" id="posAdd">افزودن کارتخوان</button></div><div class="msg" id="posMsg"></div>`}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.dataset.pcpos!==undefined){if(PC)PC.via=posPick(t,'pcpos');return}
  if(t.dataset.pypos!==undefined){PYF.pos=posPick(t,'pypos');return}
  if(t.dataset.stpos!==undefined){if(ST)ST.pos=posPick(t,'stpos');return}
  if(t.id==='posAdd'){const m=$('posMsg'),n=$('pos_new').value.trim();if(!n){m.className='msg err';m.textContent='نام کارتخوان را بنویسید.';return}
    t.disabled=true;try{await api('posSave',{x:{name:n}});await ensurePos(true);toast('کارتخوان «'+n+'» اضافه شد.');loadAccRep()}catch(err){m.className='msg err';m.textContent=err.message;t.disabled=false}return}
  if(t.dataset.posact){t.disabled=true;try{await api('posSave',{x:{id:t.dataset.posact,active:t.dataset.on==='1'}});await ensurePos(true);loadAccRep()}catch(err){toast(err.message,1);t.disabled=false}return}
},true);

