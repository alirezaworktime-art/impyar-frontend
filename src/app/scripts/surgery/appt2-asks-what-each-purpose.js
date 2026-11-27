/* ---------- appt2 (owner, 2026-10-30): «ارسال به پزشک» asks what for; each purpose lands in the matching doctor section ---------- */
const SD_P=[['plan','طرح درمان','کارتابل پزشک طرح درمان'],['surg','جراحی','پزشک — بخش جراحی'],['uncover','آنکاوری','پزشک — بخش انکاوری'],['suture','کشیدن بخیه','پزشک — ویزیت و کشیدن بخیه'],['chks','ویزیت / چکاپ بعد از جراحی','پزشک — ویزیت و کشیدن بخیه'],['impr','قالب‌گیری','پزشک پروتز'],['rscr','امتحان رزین پیچ‌شونده','پزشک پروتز'],['rabt','امتحان رزین اباتمنت','پزشک پروتز'],['deliv','تحویل کار نهایی','پزشک پروتز'],['chkp','چکاپ پروتز','پزشک پروتز']];
var SDR=null;
function sdOpen(pid,name,phone){SDR={pid:pid||'',name:name||'',phone:phone||''};
  const s=mkSheet('sdSheet',`<h3>ارجاع به پزشک${name?' · '+esc(name):''}</h3><p class="note">برای چه کاری؟ بیمار در همان بخشِ کارتابل پزشک می‌نشیند.</p><div class="sdp">${SD_P.map(([k,l,w])=>`<button type="button" class="sdpb kp-${k==='plan'?'plan':kGrp(k)}" data-sdp="${k}"${k==='surg'&&!pid?' disabled':''}><b>${esc(l)}</b><small>${esc(w)}</small></button>`).join('')}</div><div class="msg" id="sdMsg"></div><div class="btns"><button type="button" class="btn ghost" id="sdX">بستن</button></div>`);s.hidden=false}
async function sdGo(k,b){if(!SDR)return;const m=$('sdMsg');if(k==='plan'){$('sdSheet').hidden=true;sendToDoctor(SDR.pid,SDR.name,SDR.phone);return}
  b.disabled=true;m.className='msg';m.textContent='در حال ارسال…';
  try{const j=await api('sendDoc',{id:SDR.pid,kind:k,name:SDR.name,phone:SDR.phone,by:USERNAME||ROLE_LBL[ROLE]});$('sdSheet').hidden=true;const L=SD_P.find(x=>x[0]===k)||[];toast((k==='surg'?'به جراح ارجاع شد.':'به پزشک ارجاع شد: '+L[1])+(j.made?' (نوبت امروز ساخته شد)':''));BKD.ver=null;await pollQ(true);if(PF&&!$('pfSheet').hidden)refreshFile()}
  catch(e){m.className='msg err';m.textContent=e.message;b.disabled=false}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-sdp],#sdX');if(!t)return;if(t.id==='sdX'){$('sdSheet').hidden=true;return}sdGo(t.dataset.sdp,t)},true);

/* ---- perf1: capped work lists + unchanged-queue skip ---- */
let QH='',SDCAP=30,SD_TOT=0,SD_ON=false,MQCAP=30,MQ_TOT=0,MQ_ON=false;const TCAP={};
const capBtn=(k,tot,cap)=>tot>cap?`<button class="btn sm ghost capmore" type="button" data-capmore="${k}">نمایش ${fa(Math.min(30,tot-cap))} مورد دیگر (${fa(tot-cap)} مانده)</button>`:'';
{const _rs=renderSd;renderSd=function(){SD_TOT=0;try{return _rs.apply(this,arguments)}finally{const L=$('sdList');if(L&&SD_TOT>SDCAP&&!L.querySelector('.capmore')){L.dataset.n=SD_TOT;L.insertAdjacentHTML('beforeend',capBtn('sd',SD_TOT,SDCAP))}}};}
{
 const _rm=renderMyQ;renderMyQ=function(){MQ_ON=true;MQ_TOT=0;try{return _rm.apply(this,arguments)}finally{MQ_ON=false;const el=$('myq');if(el&&MQ_TOT>MQCAP&&!el.querySelector('.capmore')){const s=el.querySelector('.mqsep');const b=document.createElement('div');b.innerHTML=capBtn('mq',MQ_TOT,MQCAP);if(s)el.insertBefore(b.firstChild,s);else el.appendChild(b.firstChild)}}};}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-capmore]');if(!b)return;const k=b.dataset.capmore;
  if(k==='sd'){SDCAP+=30;renderSd()}else if(k==='mq'){MQCAP+=30;renderMyQ()}else if(k.startsWith('t:')){const t=k.slice(2);TCAP[t]=(TCAP[t]||30)+30;renderTasks()}});

/* ---- cons2: extra consent clauses chosen by the plan ---- */
const CONS2_DEF={
 ext:'کشیدن دندان‌ها: به اطلاع من رسیده که به نظر پزشک معالج دندان‌های تعیین‌شده در این طرح قابلیت نگهداری ندارند. با علم به این موضوع، رضایت کامل خود را از کشیدن این دندان‌ها اعلام می‌دارم.',
 nerve:'جراحی نزدیک به عصب: به اطلاع من رسیده که جراحی دندان‌های تعیین‌شده نیاز به جراحی دارد و احتمال آسیب دیدن عصب و بی‌حسی موقت یا دائمی لب، چانه و فک وجود دارد. با علم به این عوارض، رضایت کامل خود را از انجام این جراحی اعلام می‌دارم.',
 sed:'درمان تحت بیهوشی یا آرام‌بخشی: به اطلاع من رسیده که درمان نیاز به بیهوشی یا آرام‌بخشی (سدیشن) دارد و کادر درمان اطلاعات کافی در خصوص آن و عوارض احتمالی‌اش را در اختیار من گذاشته‌اند. بدین وسیله رضایت کامل خود را از انجام بیهوشی یا آرام‌بخشی اعلام می‌دارم.',
 minor:'بیمار زیر ۱۸ سال است. اینجانب ……………………… به عنوان ولی یا قیم قانونی بیمار، این رضایت‌نامه را خوانده و با آگاهی کامل امضا می‌کنم.'};
const CONS2_L={ext:'کشیدن دندان‌ها (کشیدن کامل یا ۸ دندان و بیشتر)',nerve:'جراحی نزدیک به عصب (دندان نهفته یا تیک «نزدیک به عصب»)',sed:'بیهوشی یا سدیشن (بخش «زمان بیهوشی»)',minor:'ولی یا قیم برای بیمار زیر ۱۸ سال'};
function cons2Keys(r){const S=(r&&r.s)||{},K=[];const sel=x=>x&&x.sel?x.sel:{};
  const ext=S.ext||{};const nExt=Object.keys(sel(ext)).filter(k=>sel(ext)[k]).length,jc=ext.jc||{};
  if(nExt>=8||num(jc.U)>=8||num(jc.L)>=8||(num(jc.U)&&num(jc.L)))K.push('ext');
  const sg=S.surg||{},cs=S.cons||{};
  const isel=sg.isel||{};if(Object.keys(sel(sg)).some(k=>sel(sg)[k])||Object.keys(isel).some(k=>isel[k])||Object.keys(sel(cs)).some(k=>sel(cs)[k]&&/عصب/.test(k)))K.push('nerve');
  const an=S.anes||{};if((an.text&&String(an.text).trim())||num(an.cnt))K.push('sed');
  const age=num((r&&r.h&&r.h.age)||'');if(age&&age<18)K.push('minor');
  return K}
function cons2Text(r){const C=Object.assign({},CONS2_DEF,SET.cons2||{});const K=cons2Keys(r).filter(k=>C[k]);if(!K.length)return '';
  return '\n\nبندهای تکمیلی:\n'+K.map((k,i)=>(i+1)+'. '+C[k]).join('\n')}

