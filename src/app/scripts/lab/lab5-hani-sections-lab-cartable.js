/* ---------- lab5 (owner, 2026-10-30): Hani sections in the lab cartable — side menu: میز کار، سفارشات، تعاریف، حسابداری (دفتر معین فاکتورها)،
   گزارشات جامع، تنظیمات عمومی، مدیریت فایل; order edit; file / tooth-count change notices ---------- */
var L5={sec:'bench',mine:0,boot:null,list:{},led:{},rep:null,fm:{},seenNf:null,notified:{},open:{}};
const L5MENU=[
  {g:'',items:[['bench','میز کار']]},
  {g:'سفارشات',items:[['o/new','ثبت سفارش جدید'],['o/all','لیست سفارشات'],['o/renewed','سفارشات تجدیدشده (اصلاحی)'],['o/active','سفارشات در حال انجام'],['o/done','سفارشات تکمیل‌شده'],['o/edited','سفارشات ویرایش‌شده']]},
  {g:'تعاریف',sup:1,items:[['d/wt','قطعه‌ها (نوع کار)'],['d/col','رنگ‌ها'],['d/dept','دپارتمان‌ها'],['d/proc','پروسه‌های کاری'],['d/staff','کارمندان'],['d/acct','طرف حساب'],['d/box','جعبه‌ها'],['d/plist','لیست‌های قیمت']]},
  {g:'حسابداری',sup:1,items:[['a/ledger','دفتر معین فاکتورها']]},
  {g:'',sup:1,items:[['rep','گزارشات جامع'],['set','تنظیمات عمومی سایت']]},
  {g:'',items:[['files','مدیریت فایل']]}];
const L5T={bench:'میز کار','o/all':'لیست سفارشات','o/renewed':'سفارشات تجدیدشده (اصلاحی)','o/active':'سفارشات در حال انجام','o/done':'سفارشات تکمیل‌شده','o/edited':'سفارشات ویرایش‌شده','d/wt':'قطعه‌ها (نوع کار)','d/col':'رنگ‌ها','d/dept':'دپارتمان‌ها','d/proc':'پروسه‌های کاری','d/staff':'کارمندان','d/acct':'طرف حساب','d/box':'جعبه‌ها','d/plist':'لیست‌های قیمت','a/ledger':'دفتر معین فاکتورها',rep:'گزارشات جامع',set:'تنظیمات عمومی سایت',files:'مدیریت فایل'};
const l5Sup=()=>!!((L2.me||{}).sup||((L5.boot||{}).me||{}).sup);
const l5N=v=>Number(toEn(String(v??'')).replace(/[,،٬\s]/g,''))||0;
const l5M=n=>fa(Math.round(Number(n)||0))+' '+esc(((L5.boot||{}).set||{}).currency||'ریال');
const l5Unit={tooth:'دندان',jaw:'فک',item:'عدد'};
const l5Acct=id=>((L5.boot||{}).accts||[]).find(a=>a.id===id);
const l5AcctOpts=(sel,all)=>((L5.boot||{}).accts||[]).filter(a=>a.active||a.id===sel||all).map(a=>`<option value="${esc(a.id)}"${a.id===sel?' selected':''}>${esc(a.name)}${a.clinic?' — '+esc(a.clinic):''}</option>`).join('');
const l5JDate=iso=>iso?jDay(iso):'';
const l5Csv=(name,rows)=>{const s='﻿'+rows.map(r=>r.map(c=>{const v=String(c??'');const v2=/^[=+\-@\t\r]/.test(v)?"'"+v:v;return /[",\n]/.test(v2)?'"'+v2.replace(/"/g,'""')+'"':v2}).join(',')).join('\n');downloadBlob(new Blob([s],{type:'text/csv;charset=utf-8'}),name+'.csv')};
async function l5Boot(force){if(L5.boot&&!force)return L5.boot;L5.boot=await api('lab5',{op:'boot'});return L5.boot}
/* side menu */
function l5Nav(){let n=$('l5Nav');const v=$('viewLab');if(!v)return;if(!n){n=document.createElement('nav');n.id='l5Nav';n.setAttribute('aria-label','منوی لابراتوار');v.insertBefore(n,v.firstChild)}
  const sup=l5Sup(),cur=L5.sec,cnt={bench:LB.items.filter(x=>['new','recv','making','redo'].includes(x.st)).length,'o/active':LB.items.filter(x=>['recv','making'].includes(x.st)).length,'o/renewed':LB.items.filter(x=>x.st==='redo').length};
  const wide=matchMedia('(min-width:1000px)').matches,open=wide||L5.navOpen;
  document.body.classList.toggle('l5navo',!wide&&!!open);const _nb=n.querySelector('.l5navb'),_st=_nb?_nb.scrollTop:0;n.innerHTML=`<button type="button" class="l5navt" id="l5NavT" aria-expanded="${open}">☰ منوی لابراتوار <small>${esc(L5T[cur]||'')}</small></button><div class="l5navb"${open?'':' hidden'}>${L5MENU.filter(g=>!g.sup||sup).map(g=>`<div class="l5g">${g.g?`<div class="l5gh">${esc(g.g)}</div>`:''}${g.items.map(([k,l])=>`<button type="button" class="l5it" data-l5sec="${k}" aria-current="${cur===k}">${esc(l)}${cnt[k]?`<span class="l5c">${fa(cnt[k])}</span>`:''}</button>`).join('')}</div>`).join('')}</div>`;const _nb2=n.querySelector('.l5navb');if(_nb2&&_st)_nb2.scrollTop=_st}
/* l5Go: base + lab6 (the ledger opens on the accounts list) */
function l5Go(k){if(k==='a/ledger')L6.mo={v:'accts'};if(k==='o/new'){l4New();return}L5.sec=k;L5.navOpen=false;if(k==='bench'){try{goTile(TILE&&/^s_/.test(TILE)?TILE:'s_tryin')}catch(e){}}renderLab();try{if(!matchMedia('(min-width:1000px)').matches)window.scrollTo({top:0})}catch(e){}}
/* notices: new files and changed tooth counts */
function l5Notices(){if(ROLE!=='lab')return;let S=L5.seenNf;if(!S){try{S=JSON.parse(localStorage.getItem('l5nf')||'null')}catch(e){S=null}
    if(!S){S={};LB.items.forEach(x=>S[x.id]=x.nf||0);try{localStorage.setItem('l5nf',JSON.stringify(S))}catch(e){}}L5.seenNf=S}
  const fresh=[];LB.items.forEach(x=>{if(S[x.id]===undefined){S[x.id]=x.nf||0;return}const k=x.id+':'+(x.nf||0),c=(x.data||{}).cntChange;
    if((x.nf||0)>S[x.id]&&!L5.notified[k]){L5.notified[k]=1;fresh.push(`فایل تازه برای #${l2No(x.no)} ${x.name}`)}
    if(c&&!c.seen&&!L5.notified[x.id+':c'+c.at]){L5.notified[x.id+':c'+c.at]=1;fresh.push(`تعداد دندان #${l2No(x.no)} ${x.name}: ${fa(c.from)} ← ${fa(c.to)}`)}});
  if(fresh.length){try{beep()}catch(e){}toast(fresh.slice(0,2).join(' · ')+(fresh.length>2?` (+${fa(fresh.length-2)})`:''))}}
function l5Badges(x){const S=L5.seenNf||{},d=x.data||{},c=d.cntChange,nf=(x.nf||0)-(S[x.id]??(x.nf||0));
  return (nf>0?`<span class="l5bd">فایل تازه +${fa(nf)}</span>`:'')+(c&&!c.seen?`<span class="l5bd warn">تعداد دندان: ${fa(c.from)} ← ${fa(c.to)}</span>`:'')+((Number(d.edits)||0)>0?`<span class="l5bd soft">ویرایش‌شده</span>`:'')}
function l5Seen(lid){const x=LB.items.find(i=>i.id===lid);if(L5.seenNf&&x){L5.seenNf[lid]=x.nf||0;try{localStorage.setItem('l5nf',JSON.stringify(L5.seenNf))}catch(e){}}
  const c=x&&(x.data||{}).cntChange;if(c&&!c.seen){c.seen=1;api('lab5',{op:'seen',lid}).catch(()=>{})}}
/* download with the work's name: «شماره-بیمار-نام فایل» */
l2Dl=async function(fid,b){const f=l2File(fid);if(!f)return;const o=(L2.ord&&L2.ord.order)||{};if(b)b.disabled=true;
  try{const bl=await l2Fetch(f,p=>{if(b)b.textContent=fa(Math.round(p*100))+'٪'});downloadBlob(bl,l5DlName(o.no,o.name,f.name))}catch(e){alertMsg(e.message)}finally{if(b){b.disabled=false;b.textContent='دانلود'}}};
const l5DlName=(no,pn,fn)=>[no?String(no):'',String(pn||'').replace(/[\\/:*?"<>|]/g,'').trim(),fn].filter(Boolean).join('-');
/* main render */
(function(){const _r=renderLab;renderLab=function(){if(ROLE!=='lab')return _r.apply(this,arguments);
  l5Notices();l5Nav();const h=document.querySelector('#viewLab .qhead h2');if(h)h.textContent=L5T[L5.sec]||'سفارش‌های لابراتوار';
  const tiles=$('tiles');document.body.dataset.l5=L5.sec==='bench'?'bench':'sec';
  if(L5.sec==='bench'){_r.apply(this,arguments);const L=$('lbList');L.insertAdjacentHTML('afterbegin',`<div class="seg l5mine" role="group" aria-label="نمایش میز کار"><button type="button" data-l5mine="0" aria-pressed="${!L5.mine}">کارهای این مرحله</button><button type="button" data-l5mine="1" aria-pressed="${!!L5.mine}">نوبت من (دپارتمان‌ها)</button></div>`);
    if(L5.mine){const t=L.querySelector('.l5mine').outerHTML;L.innerHTML=t+l2Bench()}return}
  try{renderTiles()}catch(e){}l4Fab();const L=$('lbList'),s=L5.sec;
  if(s.startsWith('o/'))return l5Orders(L,s.slice(2));
  if(s==='d/wt'||s==='d/col'||s==='d/dept'||s==='d/proc'){L2.dseg={'d/wt':'wt','d/col':'col','d/dept':'dept','d/proc':'proc'}[s];return l2DefsView(L)}
  if(s==='d/staff')return l5Staff(L);if(s==='d/acct')return l5Accts(L);if(s==='d/box')return l5Boxes(L);if(s==='d/plist')return l5Plists(L);
  if(s==='a/ledger')return l5Ledger(L);if(s==='rep')return l5Report(L);if(s==='set')return l5Settings(L);if(s==='files')return l5Files(L)}})();
/* edit order */
const l5FdiKey=n=>{n=String(n);const q=n[0],t=n[1];return {1:'UR',2:'UL',3:'LL',4:'LR'}[q]&&/[1-8]/.test(t)?{1:'UR',2:'UL',3:'LL',4:'LR'}[q]+t:''};
/* invoice */
async function l5InvOpen(id,lid){let j;try{j=await api('lab5',{op:'invGet',id:id||'',lid:lid||''})}catch(e){alertMsg(e.message);return}const I=j.inv,S=j.set||{},sup=l5Sup();let lines=I.lines.map(x=>Object.assign({},x));
  const s=mkSheet('l5InvSh','');s.style.zIndex=66;
  const draw=()=>{const sum=lines.reduce((a,x)=>a+Math.round(l5N(x.q)*l5N(x.p)),0);
    s.querySelector('.in').innerHTML=`<div class="l5inv" id="l5InvP"><div class="row1"><h3 style="margin:0">فاکتور ${fa(I.no)}${I.st==='void'?' <span class="pill late">باطل</span>':''}</h3><div class="meta">${esc(S.lab_name||'')}${S.phone1?' · '+esc(faD(S.phone1)):''}</div></div>
      <div class="l2info"><div><small>طرف حساب</small><b>${esc(I.aname||'—')}</b></div><div><small>سفارش</small><b>${l2No(I.lno)} · ${esc(I.lname||'')}</b></div><div><small>نوع کار</small><b>${esc((I.ldata||{}).wt||'—')}</b></div><div><small>تاریخ</small><b>${esc(jDay(I.day))}</b></div></div>
      <div class="l5tw"><table class="tbl"><thead><tr><th>شرح</th><th>تعداد</th><th>فی</th><th>مبلغ</th>${sup?'<th></th>':''}</tr></thead><tbody>${lines.map((x,i)=>sup&&I.st!=='void'?`<tr><td><input data-l5li="${i}" data-f="t" value="${esc(x.t)}"></td><td><input data-l5li="${i}" data-f="q" inputmode="numeric" value="${esc(fa(x.q))}" style="width:5em"> ${esc(l5Unit[x.u]||'')}</td><td><input data-l5li="${i}" data-f="p" inputmode="numeric" value="${esc(fa(x.p))}" style="width:9em"></td><td>${l5M(Math.round(l5N(x.q)*l5N(x.p)))}</td><td><button type="button" class="btn sm ghost danger" data-l5lx="${i}">×</button></td></tr>`:`<tr><td>${esc(x.t)}</td><td>${fa(x.q)} ${esc(l5Unit[x.u]||'')}</td><td>${l5M(x.p)}</td><td>${l5M(x.amt)}</td></tr>`).join('')||`<tr><td colspan="5" class="meta">${esc(I.note||'ردیفی ندارد')}</td></tr>`}</tbody></table></div>
      ${sup&&I.st!=='void'?'<div class="acts"><button type="button" class="btn sm ghost" id="l5lAdd">＋ ردیف</button></div>':''}
      <div class="l5sum"><div>جمع: <b>${l5M(sum)}</b></div><div>تخفیف: ${sup&&I.st!=='void'?`<input id="l5disc" inputmode="numeric" value="${esc(fa(I.disc||0))}" style="width:9em">`:l5M(I.disc)}</div><div>ارزش افزوده (${fa(S.vat||0)}٪): ${l5M(I.vat)}</div><div>مبلغ قابل پرداخت: <b>${l5M(I.total)}</b></div></div>
      ${sup&&I.st!=='void'?`<label class="f full">یادداشت<input id="l5inote" value="${esc(I.note||'')}"></label>`:''}</div>
      <div class="msg" id="l5InvM"></div><div class="btns">${sup&&I.st!=='void'?'<button type="button" class="btn" id="l5iSave">ذخیره</button><button type="button" class="btn ghost" id="l5iRe">محاسبه‌ی دوباره از لیست قیمت</button>':''}<button type="button" class="btn ghost" id="l5iPrt">چاپ</button>${sup&&I.st!=='void'?'<button type="button" class="btn ghost danger" id="l5iVoid">باطل کردن</button>':''}<button type="button" class="btn ghost" id="l5iX">بستن</button></div>`;};
  const sync=()=>s.querySelectorAll('[data-l5li]').forEach(e=>{const x=lines[+e.dataset.l5li];x[e.dataset.f]=e.dataset.f==='t'?e.value:l5N(e.value)});
  s.onclick=async e=>{const b=e.target.closest('button');if(!b)return;sync();const m=$('l5InvM');
    if(b.id==='l5iX'){s.hidden=true;return}if(b.id==='l5lAdd'){lines.push({t:'',q:1,u:'item',p:0});draw();return}if(b.dataset.l5lx!==undefined){lines.splice(+b.dataset.l5lx,1);draw();return}
    if(b.id==='l5iPrt'){const w=window.open('','_blank');if(!w){alertMsg('پنجره‌ی چاپ باز نشد.');return}w.document.write(`<html dir="rtl"><head><meta charset="utf-8"><title>فاکتور ${I.no}</title><style>body{font-family:Vazirmatn,Tahoma,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #999;padding:6px}input{border:0;font:inherit}.btns,.msg,button{display:none}</style></head><body>${$('l5InvP').outerHTML}</body></html>`);w.document.close();setTimeout(()=>w.print(),300);return}
    try{if(b.id==='l5iSave'){await api('lab5',{op:'invSet',id:I.id,lines,disc:l5N(($('l5disc')||{}).value),note:($('l5inote')||{}).value||''});toast('فاکتور ذخیره شد.')}
      else if(b.id==='l5iRe'){await api('lab5',{op:'inv',lid:I.lab,force:1});toast('از لیست قیمت دوباره محاسبه شد.')}
      else if(b.id==='l5iVoid'){if(!b.dataset.armed){b.dataset.armed=1;b.textContent='دوباره بزنید تا باطل شود';return}await api('lab5',{op:'invSet',id:I.id,void:1});toast('فاکتور باطل شد.');s.hidden=true;l5Refresh();return}
      const k=await api('lab5',{op:'invGet',id:I.id});Object.assign(I,k.inv);lines=I.lines.map(x=>Object.assign({},x));draw();l5Refresh()}catch(x){m.className='msg err';m.textContent=x.message}};
  draw();s.hidden=false}
function l5Refresh(){if(ROLE==='lab'&&!$('viewLab').hidden&&L5.sec!=='bench')renderLab()}
/* definitions: staff */
async function l5Staff(L){let D;try{D=await l2Defs(true)}catch(e){L.innerHTML=`<div class="empty">${esc(e.message)}</div>`;return}const dn=id=>(D.depts.find(d=>d.id===Number(id))||{}).name||'؟';
  const S=D.staff.slice().sort((a,b)=>(b.active-a.active)||a.name.localeCompare(b.name,'fa'));
  L.innerHTML=`<div class="acts"><button type="button" class="btn sm main" data-l5st="">＋ کارمند تازه</button><input type="search" id="l5sq" placeholder="جست‌وجوی نام یا دپارتمان"></div><div class="list" id="l5sl">${S.map(s=>`<div class="item${s.active?'':' off'}" data-l5sn="${esc(s.name+' '+s.depts.map(dn).join(' '))}"><div class="row1"><div><b>${esc(s.name)}</b><div class="meta">${[s.sup&&'سرپرست',s.recep&&'پذیرش',s.designer&&'طراح'].filter(Boolean).join(' · ')||'کارمند'}${s.hp?'':' · <b class="late">بدون رمز</b>'}${s.active?'':' · غیرفعال'}</div><div class="meta">${s.depts.length?s.depts.map(dn).map(esc).join('، '):'بدون دپارتمان'}</div></div><button type="button" class="btn sm ghost" data-l5st="${esc(s.id)}">ویرایش</button></div></div>`).join('')}</div>`;
  $('l5sq').oninput=e=>{const q=e.target.value.trim();L.querySelectorAll('[data-l5sn]').forEach(i=>i.hidden=!!q&&!i.dataset.l5sn.includes(q))}}
async function l5StaffEdit(id){const D=await l2Defs(),s=D.staff.find(x=>x.id===id)||{depts:[],active:1};const dep=new Set(s.depts.map(Number));
  const sh=mkSheet('l5StSh',`<h3>${s.id?'ویرایش کارمند':'کارمند تازه'}</h3><div class="fields"><label class="f">نام<input id="l5sn" value="${esc(s.name||'')}"></label><label class="f">رمز ورود${s.id?' (خالی = بدون تغییر)':''}<input id="l5sp" type="password" autocomplete="new-password"></label>
    <label class="f">وضعیت<select id="l5sa"><option value="1"${s.active?' selected':''}>فعال</option><option value="0"${s.active?'':' selected'}>غیرفعال</option></select></label></div>
    <div class="grp"><span>نقش</span><div class="chips"><label class="chk"><input type="checkbox" id="l5s_sup"${s.sup?' checked':''}> سرپرست</label><label class="chk"><input type="checkbox" id="l5s_rec"${s.recep?' checked':''}> پذیرش</label><label class="chk"><input type="checkbox" id="l5s_des"${s.designer?' checked':''}> طراح</label></div></div>
    <div class="grp"><span>دپارتمان‌های مجاز</span><div class="l5dps">${D.depts.filter(d=>d.active||dep.has(d.id)).map(d=>`<label class="chk"><input type="checkbox" data-l5sd="${d.id}"${dep.has(d.id)?' checked':''}> ${esc(d.name)}</label>`).join('')}</div></div>
    <p class="note">برای ورود کارمند رمز لازم است (دست‌کم ۸ حرف یا رقم). بدون رمز فقط غیرفعال ذخیره می‌شود.</p><div class="msg" id="l5sM"></div><div class="btns"><button type="button" class="btn" id="l5sOk">ذخیره</button><button type="button" class="btn ghost" id="l5sX">انصراف</button></div>`);
  sh.style.zIndex=66;sh.hidden=false;$('l5sX').onclick=()=>sh.hidden=true;
  $('l5sOk').onclick=async()=>{const m=$('l5sM'),b=$('l5sOk');b.disabled=true;try{await api('lab5',{op:'staffSave',x:{id:s.id||'',name:$('l5sn').value,pw:$('l5sp').value,active:$('l5sa').value==='1'?1:0,sup:$('l5s_sup').checked,recep:$('l5s_rec').checked,designer:$('l5s_des').checked,depts:[...sh.querySelectorAll('[data-l5sd]:checked')].map(e=>Number(e.dataset.l5sd))}});sh.hidden=true;toast('ذخیره شد.');await l2Defs(true);renderLab()}catch(e){m.className='msg err';m.textContent=e.message}finally{b.disabled=false}}}
/* definitions: accounts */
/* definitions: boxes */
async function l5BoxEdit(no){const B=L5.boot,b=B.boxes.find(x=>x.no===no);if(!b)return;
  const r=await l2Ask('جعبه‌ی '+fa(no)+(b.used?' — سفارش #'+fa(b.used):''),[{k:'note',l:'یادداشت',v:b.note||'',full:1},{k:'active',l:'وضعیت',type:'select',v:'1',opts:[['1','فعال'],['0','حذف از فهرست']]}],'ذخیره');if(!r)return;
  try{await api('lab5',r.active==='0'?{op:'boxDel',no}:{op:'boxSave',no,note:r.note});renderLab()}catch(e){alertMsg(e.message)}}
/* definitions: price lists */
async function l5Plists(L){await l5Boot(true).catch(()=>{});const B=L5.boot;if(!B)return;const used=id=>B.accts.filter(a=>a.plist===id).map(a=>a.name);
  L.innerHTML=`<div class="acts"><button type="button" class="btn sm main" data-l5pl="">＋ لیست قیمت تازه</button></div><div class="list">${B.plists.map(p=>`<div class="item"><div class="row1"><div><b>${esc(p.name)}</b><div class="meta">${fa(p.items.length)} ردیف · ${esc(p.cur)}${used(p.id).length?' · '+esc(used(p.id).join('، ')):''}</div></div><button type="button" class="btn sm ghost" data-l5pl="${p.id}">ویرایش</button></div></div>`).join('')}</div>`}
async function l5PlistEdit(id){const B=await l5Boot();let D;try{D=await l2Defs()}catch(e){D={wts:[]}}const p=B.plists.find(x=>x.id===Number(id))||{name:'',cur:'ریال',items:[]};let items=p.items.map(i=>Object.assign({},i,{w:(i.w||[]).slice()}));
  const sh=mkSheet('l5PlSh','');sh.style.zIndex=66;const wn=id=>(D.wts.find(w=>w.id===id)||{}).name||('#'+id);
  const draw=()=>{sh.querySelector('.in').innerHTML=`<h3>${p.id?'ویرایش لیست قیمت':'لیست قیمت تازه'}</h3><div class="fields"><label class="f">نام<input id="l5pn" value="${esc(p.name)}"></label><label class="f">واحد پول<select id="l5pc"><option${p.cur==='ریال'?' selected':''}>ریال</option><option${p.cur==='تومان'?' selected':''}>تومان</option></select></label></div>
    <div class="l5tw"><table class="tbl"><thead><tr><th>شرح</th><th>واحد</th><th>قیمت</th><th>پایه</th><th>نوع کارها</th><th></th></tr></thead><tbody>${items.map((i,k)=>`<tr><td><input data-pi="${k}" data-f="n" value="${esc(i.n)}"><input data-pi="${k}" data-f="v" value="${esc(i.v||'')}" placeholder="توضیح" style="margin-top:4px"></td><td><select data-pi="${k}" data-f="u">${Object.entries(l5Unit).map(([u,l])=>`<option value="${u}"${i.u===u?' selected':''}>${l}</option>`).join('')}</select></td><td><input data-pi="${k}" data-f="p" inputmode="numeric" value="${esc(fa(i.p))}" style="width:9em"></td><td><input data-pi="${k}" data-f="b" inputmode="numeric" value="${esc(fa(i.b||0))}" style="width:7em"></td>
      <td><div class="meta">${(i.w||[]).map(w=>`<span class="l5bd soft">${esc(wn(w))} <button type="button" class="l5x" data-pwx="${k}:${w}">×</button></span>`).join('')||'—'}</div><select data-pwa="${k}"><option value="">＋ نوع کار</option>${D.wts.filter(w=>!(i.w||[]).includes(w.id)).map(w=>`<option value="${w.id}">${esc(w.name)}</option>`).join('')}</select></td><td><button type="button" class="btn sm ghost danger" data-pix="${k}">×</button></td></tr>`).join('')}</tbody></table></div>
    <div class="acts"><button type="button" class="btn sm ghost" id="l5pAdd">＋ ردیف</button></div><div class="msg" id="l5pM"></div><div class="btns"><button type="button" class="btn" id="l5pOk">ذخیره</button><button type="button" class="btn ghost" id="l5pX">انصراف</button></div>`};
  const sync=()=>{sh.querySelectorAll('[data-pi]').forEach(e=>{const i=items[+e.dataset.pi],f=e.dataset.f;i[f]=f==='p'||f==='b'?l5N(e.value):e.value});p.name=$('l5pn').value;p.cur=$('l5pc').value};
  sh.onchange=e=>{const s=e.target.closest('[data-pwa]');if(!s||!s.value)return;sync();items[+s.dataset.pwa].w.push(Number(s.value));draw()};
  sh.onclick=async e=>{const b=e.target.closest('button');if(!b)return;sync();
    if(b.id==='l5pX'){sh.hidden=true;return}if(b.id==='l5pAdd'){items.push({n:'',v:'',u:'tooth',p:0,b:0,w:[]});draw();return}
    if(b.dataset.pix!==undefined){items.splice(+b.dataset.pix,1);draw();return}if(b.dataset.pwx){const [k,w]=b.dataset.pwx.split(':').map(Number);items[k].w=items[k].w.filter(x=>x!==w);draw();return}
    if(b.id==='l5pOk'){try{await api('lab5',{op:'plistSave',x:{id:p.id||'',name:p.name,cur:p.cur,items}});sh.hidden=true;toast('ذخیره شد.');await l5Boot(true);renderLab()}catch(x){$('l5pM').className='msg err';$('l5pM').textContent=x.message}}};
  draw();sh.hidden=false}
/* accounting: «دفتر معین فاکتورها» */
/* comprehensive reports */
async function l5Report(L){const F=L5.repF=L5.repF||{};
  L.innerHTML=`<div class="l5fb"><label class="f">از تاریخ<input id="l5rf" inputmode="numeric" value="${esc(l5JDate(F.from||dAdd(tDay(),-30)))}"></label><label class="f">تا تاریخ<input id="l5rt" inputmode="numeric" value="${esc(l5JDate(F.to||tDay()))}"></label><button type="button" class="btn sm main" id="l5rgo">نمایش</button><button type="button" class="btn sm ghost" id="l5rxl">اکسل</button></div><div id="l5rb"><div class="empty">در حال بارگذاری…</div></div>`;
  const tbl=(t,cols,rows)=>`<h3 class="pf-h">${t}</h3><div class="l5tw"><table class="tbl l5t"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${cols.length}" class="meta">موردی نیست.</td></tr>`}</tbody></table></div>`;
  const mins=m=>m==null?'—':m<120?fa(m)+' دقیقه':m<2880?fa(Math.round(m/60))+' ساعت':fa(Math.round(m/1440))+' روز';
  const run=async()=>{F.from=parseJ($('l5rf').value)||'';F.to=parseJ($('l5rt').value)||'';const box=$('l5rb');try{const j=L5.rep=await api('lab5',{op:'report',from:F.from,to:F.to});
    box.innerHTML=`<div class="l5kpi">${[['سفارش ثبت‌شده',fa(j.n)],['فاکتور صادرشده',fa(j.invN)+' · '+l5M(j.invSum)],['دریافتی',fa(j.payN)+' · '+l5M(j.paySum)],['اصلاحیه / برگشتی',fa(j.rets)],['کارهای باز الان',fa(j.open)],['باز و دیرشده',fa(j.lateOpen)]].map(([l,v])=>`<div><small>${l}</small><b>${v}</b></div>`).join('')}</div>
      <div class="meta">وضعیت سفارش‌های این بازه: ${Object.entries(j.bySt).map(([k,n])=>esc(LST[k]||k)+' '+fa(n)).join(' · ')||'—'}</div>
      ${tbl('به تفکیک نوع کار',['نوع کار','تعداد','واحد','دیرکرد','اصلاحی','مبلغ فاکتور'],j.byWt.map(x=>[esc(x.k),fa(x.n),fa(x.units),fa(x.late),fa(x.redo),l5M(x.amt)]))}
      ${tbl('به تفکیک طرف حساب',['طرف حساب','تعداد','واحد','دیرکرد','اصلاحی','مبلغ فاکتور'],j.byAc.map(x=>[esc(x.k),fa(x.n),fa(x.units),fa(x.late),fa(x.redo),l5M(x.amt)]))}
      ${tbl('مراحل انجام‌شده به تفکیک دپارتمان',['دپارتمان','تعداد','میانگین زمان انجام'],j.byDept.map(x=>[esc(x.k),fa(x.n),mins(x.avg)]))}
      ${tbl('مراحل انجام‌شده به تفکیک کارمند',['کارمند','تعداد','میانگین زمان انجام'],j.byStaff.map(x=>[esc(x.k),fa(x.n),mins(x.avg)]))}
      ${tbl('اصلاحیه‌ها و برگشتی‌ها',['دپارتمان / طراح','تعداد'],j.byRet.map(x=>[esc(x.k),fa(x.n)]))}`}catch(e){box.innerHTML=`<div class="empty">${esc(e.message)}</div>`}};
  $('l5rgo').onclick=run;$('l5rxl').onclick=()=>{const j=L5.rep;if(!j)return;const R=[['گزارش جامع',jDay(j.from)+' تا '+jDay(j.to)],[],['نوع کار','تعداد','واحد','دیرکرد','اصلاحی','مبلغ']].concat(j.byWt.map(x=>[x.k,x.n,x.units,x.late,x.redo,x.amt])).concat([[],['طرف حساب','تعداد','واحد','دیرکرد','اصلاحی','مبلغ']]).concat(j.byAc.map(x=>[x.k,x.n,x.units,x.late,x.redo,x.amt])).concat([[],['دپارتمان','تعداد','میانگین دقیقه']]).concat(j.byDept.map(x=>[x.k,x.n,x.avg??''])).concat([[],['کارمند','تعداد','میانگین دقیقه']]).concat(j.byStaff.map(x=>[x.k,x.n,x.avg??''])).concat([[],['اصلاحیه','تعداد']]).concat(j.byRet.map(x=>[x.k,x.n]));l5Csv('گزارش-جامع',R)};run()}
/* general settings */
const L5SET=[['مشخصات لابراتوار',[['lab_name','نام لابراتوار'],['phone1','تلفن ۱','ltr'],['phone2','تلفن ۲','ltr'],['address','آدرس'],['national_id','شناسه ملی','ltr'],['economic_code','کد اقتصادی','ltr'],['work_start','شروع ساعت کاری','time'],['work_end','پایان ساعت کاری','time']]],
  ['فاکتور و مالی',[['currency','واحد پول',[['ریال','ریال'],['تومان','تومان']]],['vat','ارزش افزوده (درصد)','num'],['auto_invoice','صدور خودکار فاکتور بعد از «ارسال به کلینیک»',[['1','بله'],['0','خیر']]],['def_acct','طرف حساب سفارش‌های کلینیک خودمان','acct']]],
  ['فرم سفارش',[['color_required','ثبت رنگ در سفارش الزامی باشد',[['0','خیر'],['1','بله']]],['box_required','شماره جعبه هنگام شروع کار الزامی باشد',[['0','خیر'],['1','بله']]]]]];
async function l5Settings(L){await l5Boot(true).catch(()=>{});const S=(L5.boot||{}).set||{};
  L.innerHTML=L5SET.map(([g,F])=>`<section class="card l5set"><h3 class="pf-h">${g}</h3><div class="fields">${F.map(([k,l,t])=>`<label class="f${k==='address'||k==='def_acct'?' full':''}">${l}${Array.isArray(t)?`<select data-l5s="${k}">${t.map(([v,x])=>`<option value="${v}"${String(S[k])===v?' selected':''}>${x}</option>`).join('')}</select>`:t==='acct'?`<select data-l5s="${k}"><option value="">—</option>${l5AcctOpts(S[k])}</select>`:`<input data-l5s="${k}"${t==='ltr'?' class="ltr"':''}${t==='time'?' type="time"':''}${t==='num'?' inputmode="numeric"':''} value="${esc(t==='num'?fa(S[k]??''):S[k]??'')}">`}</label>`).join('')}</div></section>`).join('')+`<div class="msg" id="l5setM"></div><div class="btns"><button type="button" class="btn" id="l5setOk">ذخیره‌ی تنظیمات</button></div>`;
  $('l5setOk').onclick=async()=>{const x={};L.querySelectorAll('[data-l5s]').forEach(e=>{const k=e.dataset.l5s;x[k]=['vat','auto_invoice','color_required','box_required'].includes(k)?l5N(e.value):e.value});try{await api('lab5',{op:'setSave',x});toast('تنظیمات ذخیره شد.');await l5Boot(true)}catch(e){const m=$('l5setM');m.className='msg err';m.textContent=e.message}}}
/* file management */
const L5K={scan:'اسکن',photo:'عکس',design:'طرح',other:'سایر'};
async function l5Files(L){const F=L5.fm;const MB=b=>fa((b/1048576).toFixed(1))+' MB';
  L.innerHTML=`<div class="l5fb"><input type="search" id="l5fq" placeholder="نام فایل، بیمار یا شماره سفارش" value="${esc(F.q||'')}"><label class="f">نوع<select id="l5fk"><option value="">همه</option>${Object.entries(L5K).map(([k,l])=>`<option value="${k}"${F.kind===k?' selected':''}>${l}</option>`).join('')}</select></label><button type="button" class="btn sm main" id="l5fgo">نمایش</button>${l5Sup()?'<button type="button" class="btn sm ghost danger" id="l5fdel">حذف انتخاب‌شده‌ها</button>':''}</div><div id="l5fb"><div class="empty">در حال بارگذاری…</div></div>`;
  const run=async more=>{F.q=$('l5fq').value;F.kind=$('l5fk').value;if(!more){F.page=0}const my=F.seq=(F.seq||0)+1,box=$('l5fb');
    try{const j=await api('lab5',{op:'files',q:F.q,kind:F.kind,page:F.page});if(my!==F.seq||!box.isConnected)return;F.files=more?(F.files||[]).concat(j.files):j.files;
      box.innerHTML=`<div class="l5kpi">${[['همه‌ی فایل‌ها',fa(j.total)+' · '+MB(j.size)]].concat(j.kinds.map(k=>[L5K[k.kind]||k.kind,fa(k.n)+' · '+MB(k.s)])).map(([l,v])=>`<div><small>${l}</small><b>${v}</b></div>`).join('')}</div>
        <div class="l5tw"><table class="tbl l5t"><thead><tr>${l5Sup()?'<th><input type="checkbox" id="l5fall" aria-label="انتخاب همه"></th>':''}<th>نام فایل (نام دانلود)</th><th>نوع</th><th>حجم</th><th>سفارش</th><th>مرحله‌ی فعلی کار</th><th>بارگذاری</th><th></th></tr></thead><tbody>${F.files.map(f=>`<tr>${l5Sup()?`<td><input type="checkbox" class="l5fs" value="${esc(f.id)}"></td>`:''}<td class="ltr small">${esc(l5DlName(f.no,f.pname,f.name))}</td><td>${L5K[f.kind]||esc(f.kind)}</td><td>${MB(f.size||0)}</td><td><button type="button" class="btn sm ghost" data-l4open="${esc(f.lab)}">#${l2No(f.no)} · ${esc(f.pname||'')}</button></td><td><b>${esc(f.cur||'—')}</b></td><td class="meta">${esc(jd(f.at))}${f.by?' · '+esc(f.by):''}</td><td><button type="button" class="btn sm ghost" data-l5fdl="${esc(f.id)}">دانلود</button></td></tr>`).join('')||'<tr><td colspan="8" class="meta">فایلی پیدا نشد.</td></tr>'}</tbody></table></div>${F.files.length<j.total?`<div class="acts"><button type="button" class="btn sm ghost" id="l5fmore">بیشتر</button></div>`:''}`;
      const m=$('l5fmore');if(m)m.onclick=()=>{F.page++;run(true)};const a=$('l5fall');if(a)a.onchange=e=>box.querySelectorAll('.l5fs').forEach(c=>c.checked=e.target.checked)}catch(e){box.innerHTML=`<div class="empty">${esc(e.message)}</div>`}};
  $('l5fgo').onclick=()=>run();$('l5fq').onkeydown=e=>{if(e.key==='Enter')run()};
  const d=$('l5fdel');if(d)d.onclick=async()=>{const ids=[...L.querySelectorAll('.l5fs:checked')].map(c=>c.value);if(!ids.length){toast('فایلی انتخاب نشده.');return}if(!d.dataset.armed){d.dataset.armed=1;d.textContent=fa(ids.length)+' فایل حذف شود؟ دوباره بزنید';setTimeout(()=>{if(d.isConnected){delete d.dataset.armed;d.textContent='حذف انتخاب‌شده‌ها'}},4000);return}
    try{const j=await api('lab5',{op:'fileDel',ids});toast(fa(j.n)+' فایل از فهرست برداشته شد.');delete d.dataset.armed;d.textContent='حذف انتخاب‌شده‌ها';run()}catch(e){alertMsg(e.message)}};run()}
async function l5FileDl(fid,b){const f=(L5.fm.files||[]).find(x=>x.id===fid);if(!f)return;b.disabled=true;
  try{const j=await api('labOrder',{lid:f.lab}),m=(j.files||[]).find(x=>x.id===fid);if(!m)throw new Error('فایل پیدا نشد.');const bl=await l2Fetch(m,p=>{b.textContent=fa(Math.round(p*100))+'٪'});downloadBlob(bl,l5DlName(f.no,f.pname,f.name))}catch(e){alertMsg(e.message)}finally{b.disabled=false;b.textContent='دانلود'}}
/* new order: account + colour rule */
(function(){const _a=api;api=function(action,body){if(action==='lab4New'&&L4N&&L4N.acct&&body&&!body.acct)body.acct=L4N.acct;if(action==='labStart'&&body&&Number(((L5.boot||{}).set||{}).box_required)&&!body.from&&!String(body.box||'').trim())return Promise.reject(new Error('شماره جعبه را بنویسید (در تنظیمات الزامی است).'));return _a.apply(this,arguments)}})();
/* clicks */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-l5sec],#l5NavT,[data-l5mine],[data-l5edit],[data-l5inv],[data-l5mkinv],[data-l5st],[data-l5ac],[data-l5led],[data-l5box],[data-l5pl],[data-l5pd],[data-l5fdl]');if(!t)return;
  if(t.id==='l5NavT'){L5.navOpen=!L5.navOpen;l5Nav();return}
  if(t.dataset.l5sec){l5Go(t.dataset.l5sec);return}
  if(t.dataset.l5mine!==undefined){L5.mine=t.dataset.l5mine==='1'?1:0;renderLab();return}
  if(t.dataset.l5edit){e.stopPropagation();l5EditOpen(t.dataset.l5edit);return}
  if(t.dataset.l5inv){l5InvOpen(t.dataset.l5inv);return}
  if(t.dataset.l5mkinv){t.disabled=true;api('lab5',{op:'inv',lid:t.dataset.l5mkinv}).then(j=>{l5InvOpen(j.id);l5Refresh()}).catch(x=>{alertMsg(x.message);t.disabled=false});return}
  if(t.dataset.l5st!==undefined){l5StaffEdit(t.dataset.l5st);return}
  if(t.dataset.l5ac!==undefined){l5AcctEdit(t.dataset.l5ac);return}
  if(t.dataset.l5led){L5.led.acct=t.dataset.l5led;if(L5.sec==='a/ledger')renderLab();else l5Go('a/ledger');return}
  if(t.dataset.l5box){l5BoxEdit(t.dataset.l5box);return}
  if(t.dataset.l5pl!==undefined){l5PlistEdit(t.dataset.l5pl);return}
  if(t.dataset.l5pd){if(!t.dataset.armed){t.dataset.armed=1;t.textContent='دوباره بزنید';return}api('lab5',{op:'payDel',id:t.dataset.l5pd}).then(()=>{toast('دریافتی حذف شد.');renderLab()}).catch(x=>alertMsg(x.message));return}
  if(t.dataset.l5fdl){l5FileDl(t.dataset.l5fdl,t);return}});
window.addEventListener('resize',()=>{if(ROLE==='lab'&&$('l5Nav'))l5Nav()});

