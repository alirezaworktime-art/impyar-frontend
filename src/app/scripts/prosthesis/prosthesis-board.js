/* ---------- prosthesis board ---------- */
const PR={items:[],f:'all',loaded:false,t:0,m:(()=>{try{return localStorage.getItem('implantPrMode')||'b'}catch(e){return 'b'}})()};
/* prBoardCard, prosCard, renderPros: one definition each in pros2-prosthesis-workflow-v2-work.js (the base versions here were always replaced) */
async function loadPros(){try{const j=await api('prosList');PR.items=j.items||[];PR.loaded=true;$('prLive').classList.remove('off');renderPros()}catch(e){$('prLive').classList.add('off');if(!PR.loaded)$('prList').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
const NEXT_ST={heal:'impr',deliv:'done'};
const NEXT_LBL={heal:'آنکاوری انجام شد؛ آماده‌ی قالب‌گیری',tryin:'تست رزین انجام شد؛ دستور کار بعدی',rabt:'تست رزین اباتمنت انجام شد؛ دستور کار روکش نهایی',deliv:'روکش نهایی تحویل بیمار شد'};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-prm]');if(!t)return;PR.m=t.dataset.prm;try{localStorage.setItem('implantPrMode',PR.m)}catch(x){}renderPros()});
async function prosSet(id,stage,note,btn,rep){if(btn)btn.disabled=true;try{await api('prosSet',{id,stage,rep:rep?1:0,note:note||'',by:($('rc_asst')||{}).value||ROLE_LBL[ROLE]});toast('مرحله ثبت شد: '+(PSTN[stage]||stage));if(!$('viewPros').hidden)loadPros();if(PF&&!$('pfSheet').hidden)refreshFile();pollQ(true)}catch(e){alertMsg(e.message)}finally{if(btn)btn.disabled=false}}

