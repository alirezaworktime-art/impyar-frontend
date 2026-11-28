/* ---------- pros2: prosthesis day (doctor) + abutment / pontic map ---------- */
const PD={day:'t',appts:[],pros:[],loaded:false};
/* loadPday: base + appt1 (appointments/appt1-reception-one-big-button.js: the prosthesis doctor's day view shows today only the referred appointments) */
async function loadPday(){const day=PD.day==='f'?dAdd(tDay(),1):tDay();try{const [a,p]=await Promise.all([api('apptList',{from:day,to:day}),api('prosList')]);PD.appts=(a.items||[]).filter(x=>x.st!=='cancel'&&apG(x.kind)==='pr').sort(apSort);PD.pros=p.items||[];PD.loaded=true;renderPday()}catch(e){if(!PD.loaded)$('pdList').innerHTML=`<div class="empty">${esc(e.message)}</div>`}
  try{if(ROLE==='surgery'&&PD&&PD.appts){const td=tDay();PD.appts=PD.appts.filter(a=>a.day!==td||a.ref||l3Of(a.plan)||a.st==='done');renderPday()}}catch(e){}}
function pdMap(M){if(!M||!Object.keys(M).length)return '<span class="late">پایه و پونتیک هنوز ثبت نشده</span>';const A=Object.keys(M).filter(k=>M[k]==='a'),P=Object.keys(M).filter(k=>M[k]==='p');return 'پایه‌ها: '+esc(toothTxt(A)||'—')+(P.length?' · پونتیک: '+esc(toothTxt(P)):'')}
/* pdCard: base + psess (prosthesis/psess-full-read-only-file.js: name opens the prosthesis session, «جلسه‌ی پروتز» button);
   m58a (lab/m58a-prosthesis-card-file-pdf.js) still wraps this in its own file */
function pdCard(id,name,top,pr){const h=`<div class="item"><div class="row1"><div><span class="nm">${esc(name)}</span><div class="meta">${top}</div><div class="meta">${pdMap(pr&&pr.map)}</div></div>${pr?`<span class="pill rev">${esc(PSTN[pr.stage]||pr.stage||'')}</span>`:''}</div>
  <div class="acts"><button class="btn sm" type="button" data-pmap="${esc(id)}" data-pmn="${esc(name)}">🦷 پایه و پونتیک</button><button class="btn sm ghost" type="button" data-file="${esc(id)}" data-fname="${esc(name)}" data-ftab="pros">پرونده و مراحل</button></div></div>`;
  return h.replace('<span class="nm">',`<span class="nm l5nm" data-l5nm="${esc(id)}" data-l5n="${esc(name)}" title="باز کردن جلسه‌ی پروتز">`).replace('<div class="acts">',`<div class="acts">${id?`<button class="btn sm main" type="button" data-l5="${esc(id)}" data-l5n="${esc(name)}">جلسه‌ی پروتز</button>`:''}`)}
/* renderPday: base + pref (lab/pref-reception-prosthesis-doctor-lab.js: l3RenderRef) + fix6a (lab/lab7-stage-tabs-removed-cards.js: f6RenderSurg);
   each added part runs after the base, in its own try; m61a (prosthesis/m61a-prosthesis-two-buttons-every.js) still wraps this in its own file */
function renderPday(){const P={};PD.pros.forEach(x=>P[x.id]=x);document.querySelectorAll('[data-pdd]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.pdd===PD.day));
  $('pdList').innerHTML=PD.appts.length?PD.appts.map(a=>pdCard(a.plan||'',a.name,`<b>${a.time?esc(faD(a.time)):'بدون ساعت'}</b> · ${esc(AKL[a.kind]||a.kind)}${a.doc?' · '+esc(a.doc):''}`,P[a.plan])).join(''):`<div class="empty">${PD.day==='f'?'فردا':'امروز'} نوبت پروتزی ثبت نشده.</div>`;
  const q=toEn(($('pdQ')||{}).value||'').trim().toLowerCase(),inA=new Set(PD.appts.map(a=>a.plan)),R=PD.pros.filter(x=>x.stage!=='done'&&!inA.has(x.id)&&(!q||String(x.name||'').toLowerCase().includes(q)));
  $('pdAll').innerHTML=R.length?R.slice(0,60).map(x=>pdCard(x.id,x.name,x.doc?esc(x.doc):'',x)).join(''):'<div class="empty">بیماری نیست.</div>';
  try{l3RenderRef()}catch(e){}
  try{f6RenderSurg()}catch(e){}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pdd]');if(!t)return;PD.day=t.dataset.pdd;loadPday()});
document.addEventListener('input',e=>{if(e.target&&e.target.id==='pdQ')renderPday()});
let PM=null;
const PM_N={'':'','a':'پایه','p':'پونتیک'};
function pmChart(){const row=j=>{let r='',l='';for(let i=8;i>=1;i--)r+=pmBtn(j+'R'+i,i);for(let i=1;i<=8;i++)l+=pmBtn(j+'L'+i,i);return `<div class="jw"><div class="hf">${r}</div><span class="md"></span><div class="hf">${l}</div></div>`};
  return `<div class="pmap">${row('U')}${row('L')}<div class="sides"><span>راست بیمار</span><span>چپ بیمار</span></div></div>`}
function pmBtn(k,i){const v=PM.map[k]||'';return `<button type="button" class="pm-t${PM.imp[k]?' imp':''}" data-pmk="${k}" data-v="${v}" title="${esc(toothTxt([k]))}">${fa(i)}<small>${PM_N[v]||'&nbsp;'}</small></button>`}
/* openPmap: base + hani (lab/hani-lab-work-order-sheet.js: no chart within 3 s after l3OpenLab, H9SKIP);
   m58b (lab/m58b-prosthesis-card-no-field.js) still wraps this in its own file */
async function openPmap(id,name){if(Date.now()<H9SKIP)return;
  if(!id){alertMsg('این نوبت به پرونده‌ای وصل نیست.');return}let j;try{j=await api('get',{id})}catch(e){alertMsg(e.message);return}
  const imp=implantsOf(j),pr=j.pros||{},M=Object.assign({},pr.map||{});if(!Object.keys(M).length)Object.keys(imp).forEach(k=>M[k]='a');
  if(!name){try{name=fromDoc(id,j.data||{}).h.name||''}catch(e){}}PM={id,name,map:M,imp};
  const s=mkSheet('pmSheet',`<h3>پایه و پونتیک · ${esc(name||'')}</h3><p class="note">روی هر دندان بزنید: یک بار «پایه»، دو بار «پونتیک»، سه بار پاک. دندان‌هایی که در جراحی ایمپلنت گرفته‌اند خط‌دار هستند${Object.keys(imp).length?' ('+esc(toothTxt(Object.keys(imp)))+')':''}.</p>
    <div id="pmChart">${pmChart()}</div><div class="pmleg"><span><i class="kdot" style="background:var(--accent)"></i>پایه</span><span><i class="kdot" style="background:var(--warn)"></i>پونتیک</span></div><p class="note" id="pmSum"></p>
    <label class="f">توضیح برای پرونده و لابراتوار (اختیاری)<input id="pm_note" value="${esc(pr.mapNote||'')}"></label><div class="msg" id="pmMsg"></div>
    <div class="btns"><button class="btn" type="button" id="pmSave" style="flex:1">ثبت</button><button class="btn ghost" type="button" id="pmClose">بستن</button></div>`);
  pmSum();s.hidden=false}
function pmSum(){const M=PM.map,A=Object.keys(M).filter(k=>M[k]==='a'),P=Object.keys(M).filter(k=>M[k]==='p');$('pmSum').innerHTML=`پایه‌ها: <b>${esc(toothTxt(A)||'—')}</b> · پونتیک: <b>${esc(toothTxt(P)||'—')}</b> · مجموع واحدها: ${fa(A.length+P.length)}`}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.dataset.pmap!==undefined){openPmap(t.dataset.pmap,t.dataset.pmn||(PF&&PF.id===t.dataset.pmap?PF.name:''));return}
  if(t.dataset.pmk&&PM){const k=t.dataset.pmk,v=PM.map[k]||'',nx=v===''?'a':v==='a'?'p':'';if(nx)PM.map[k]=nx;else delete PM.map[k];t.dataset.v=nx;t.querySelector('small').innerHTML=PM_N[nx]||'&nbsp;';pmSum();return}
  if(t.id==='pmClose'){$('pmSheet').hidden=true;return}
  if(t.id==='pmSave'&&PM){t.disabled=true;try{await api('prosMap',{id:PM.id,map:PM.map,note:$('pm_note').value.trim(),by:ROLE_LBL[ROLE]||''});$('pmSheet').hidden=true;toast('پایه و پونتیک ثبت شد.');if(!$('viewPday').hidden)loadPday();if(PF&&!$('pfSheet').hidden)refreshFile();if(!$('viewPros').hidden)loadPros()}catch(err){$('pmMsg').className='msg err';$('pmMsg').textContent=err.message}finally{t.disabled=false}return}
  if(t.dataset.prept){const c=t.closest('.prrep').querySelector('.chips');c.hidden=!c.hidden;return}
  if(t.dataset.prep&&PF){prosSet(PF.id,t.dataset.prep,'تکرار مرحله',t,1);return}});

