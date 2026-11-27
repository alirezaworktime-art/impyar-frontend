/* ---------- list of the lab cartable ---------- */
const L2_SEG={new:x=>x.st==='new'||x.st==='redo'||x.st==='recv'||(x.st==='making'&&!(x.steps||[]).length),work:x=>x.st==='making'&&(x.steps||[]).length>0&&!l2All(x),send:x=>x.st==='making'&&l2All(x),ready:x=>x.st==='ready',done:x=>x.st==='done'||x.st==='cancel'};
function l2BenchItems(){const me=L2.me||{},out=[];
  LB.items.filter(x=>x.st==='making').forEach(x=>(x.steps||[]).forEach(s=>{const av=s.st==='acc'||l2Av(x.steps,s);if(!av)return;
    const mine=l2Mine(s);if(!mine&&!(me.sup&&L2.all)&&me.id)return;if(L2.dept&&Number(s.dept)!==L2.dept)return;out.push({x,s,mine})}));
  return out.sort((a,b)=>((b.s.st==='acc'&&b.s.acc_by===me.id)-(a.s.st==='acc'&&a.s.acc_by===me.id))||(((b.x.data||{}).prio==='urgent')-((a.x.data||{}).prio==='urgent'))||String(a.x.due||'9').localeCompare(String(b.x.due||'9')))}
const l2Cnt=()=>({new:LB.items.filter(L2_SEG.new).length,bench:l2BenchItems().filter(i=>i.mine).length,work:LB.items.filter(L2_SEG.work).length,send:LB.items.filter(L2_SEG.send).length,ready:LB.items.filter(L2_SEG.ready).length});
TILES.lab=()=>{const n=l2Cnt(),me=L2.me||{},T=[
  {k:'new',c:'lab',l:'سفارش تازه',s:'دریافت و شروع کار / اصلاح',n:n.new,seg:'new'},
  {k:'bench',c:'surg',l:'میز کار من',s:'مراحل نوبت دپارتمان من',n:n.bench,seg:'bench'},
  {k:'work',c:'pros',l:'در حال ساخت',s:'پیشرفت مراحل',n:n.work,seg:'work'},
  {k:'send',c:'cons',l:'آماده‌ی ارسال',s:'همه‌ی مراحل انجام شد',n:n.send,seg:'send'},
  {k:'ready',c:'chk',l:'ارسال‌شده',s:'در کلینیک',n:n.ready,seg:'ready'},
  {k:'done',c:'arch',l:'تحویل‌شده',s:'بسته‌شده',n:0,seg:'done'},
  {k:'ret',c:'fol',l:'برگشتی‌ها',s:'اصلاح‌ها به تفکیک طراح',n:0,seg:'ret'}];
  if(me.sup)T.push({k:'defs',c:'plan',l:'تعریف‌ها',s:'دپارتمان، پروسه، نوع کار',n:0,seg:'defs'});return T};
TCOUNT.lab=['new','bench','work','send'];
function l2Card(x){const d=x.data||{},td=tDay(),late=x.due&&x.due<td&&!['ready','done','cancel'].includes(x.st),me=L2.me||{},rec=me.recep||me.sup;
  const cur=l2CurTxt(d),pill=x.st==='making'&&l2All(x)?'<span class="pill done">آماده‌ی ارسال</span>':`<span class="pill ${LSTC[x.st]||''}">${esc(LST[x.st]||x.st)}</span>`;
  let act='';
  if(L2_SEG.new(x)&&rec)act=`<button class="btn sm main" type="button" data-l2start="${esc(x.id)}">${x.st==='redo'&&(x.steps||[]).length?'شروع اصلاح':'دریافت و شروع کار'}</button>`;
  if(L2_SEG.send(x)&&rec)act=`<button class="btn sm main" type="button" data-l2send="${esc(x.id)}">ارسال به کلینیک</button>`;
  return `<div class="item labcard l2c${d.prio==='urgent'?' l2u':''}"><div class="row1"><div><span class="nm">${esc(x.name)}</span> <span class="meta tnum">#${l2No(x.no)}</span><div class="meta">${x.age?'سن '+esc(faD(x.age))+' · ':''}${esc(d.doc||x.doc||'')} · ثبت ${esc(jd(x.created))}</div></div>${pill}</div>
    <div class="meta">دندان‌ها: <b>${esc(l2Teeth(d.teeth)||'—')}</b>${d.box?' · جعبه '+esc(faD(d.box)):''} · تحویل: <span class="${late?'late':''}">${esc(jDay(x.due)||'—')}${late?' (گذشته)':''}</span>${d.redo?` · <b class="late">اصلاح ${fa(d.redo)}</b>`:''}</div>
    <div class="spec">${x.ptype&&x.ptype!=='fix'&&PR2.TL[x.ptype]?'<span>'+esc(PR2.TL[x.ptype])+'</span>':''}${labSpecs(d)}</div>
    ${l2Dots(x.steps)}${d.note?`<div class="meta">${esc(d.note)}</div>`:''}${d.redoNote&&x.st==='redo'?`<div class="meta late">اصلاح: ${esc(d.redoNote)}</div>`:''}
    <div class="acts">${act}<button class="btn sm ghost" type="button" data-l2open="${esc(x.id)}">جزئیات و فایل‌ها</button><button class="btn sm ghost" type="button" data-l2prt="${esc(x.id)}">برگه</button><button class="btn sm ghost" type="button" data-l2lbl="${esc(x.id)}">برچسب</button></div>
    ${['done','cancel'].includes(x.st)?'':`<div class="labmsg"><input placeholder="پیام برای کلینیک (مثلاً سؤال درباره‌ی رنگ)" data-lbmsg="${esc(x.id)}"><button class="btn sm ghost" type="button" data-lbsend="${esc(x.id)}">ارسال پیام</button></div>`}</div>`}
function l2Bench(){const me=L2.me||{},B=l2BenchItems(),D=(L2.defs&&L2.defs.depts)||[];
  const mineD=me.sup&&L2.all?[...new Set(LB.items.flatMap(x=>(x.steps||[]).map(s=>Number(s.dept))))]:(me.depts||[]).map(Number);
  const cnt={};l2BenchItems().forEach(i=>cnt[i.s.dept]=(cnt[i.s.dept]||0)+1);
  let h=`<div class="l2bar">${me.id?'':'<div class="qwarn" style="flex-basis:100%">با رمز مشترک لابراتوار وارد شده‌اید؛ برای پذیرش و تکمیل مراحل، هر کارمند با حساب شخصی خودش وارد شود.</div>'}
    <div class="chips" id="l2Depts"><button type="button" class="chip" data-l2dept="0" aria-pressed="${!L2.dept}">همه</button>${D.filter(d=>mineD.includes(d.id)||cnt[d.id]).map(d=>`<button type="button" class="chip" data-l2dept="${d.id}" aria-pressed="${L2.dept===d.id}">${esc(d.name)}${cnt[d.id]?' ('+fa(cnt[d.id])+')':''}</button>`).join('')}</div>
    ${me.sup?`<label class="chk"><input type="checkbox" id="l2All"${L2.all?' checked':''}> همه‌ی دپارتمان‌ها</label>`:''}<input type="search" id="l2Q" placeholder="جست‌وجو: بیمار، شماره، نوع کار" value="${esc(L2.q)}"></div>`;
  const q=toEn(L2.q).toLowerCase(),R=B.filter(({x,s})=>!q||[x.name,String(x.no),(x.data||{}).wt,s.dname,(x.data||{}).doc].join(' ').toLowerCase().includes(q));
  if(!R.length)return h+'<div class="empty">کاری در نوبت شما نیست. وقتی مرحله‌ی قبلیِ یک سفارش تمام شود، اینجا می‌آید.</div>';
  return h+R.map(({x,s,mine})=>{const d=x.data||{},late=l2Late(x,s),dp=l2Dept(s.dept),f=dp.flags||{},mineAcc=s.st==='acc'&&(s.acc_by===me.id||me.sup);
    const b=mine&&s.st==='pend'?`<button class="btn sm main" type="button" data-l2step="accept" data-lid="${esc(x.id)}" data-sid="${esc(s.id)}">${f.single?'پذیرش و تکمیل':'پذیرش'}</button>${f.single?'':`<button class="btn sm" type="button" data-l2step="quick" data-lid="${esc(x.id)}" data-sid="${esc(s.id)}">انجام شد</button>`}`:mine&&mineAcc?`<button class="btn sm main" type="button" data-l2step="done" data-lid="${esc(x.id)}" data-sid="${esc(s.id)}">تکمیل</button>`:'';
    return `<div class="item l2w${late?' l2late':''}${d.prio==='urgent'?' l2u':''}"><div class="row1"><div><span class="nm">${esc(x.name)}</span> <span class="meta tnum">#${l2No(x.no)}</span> <span class="pill ${L2_STC[s.st]}">${esc(s.dname)}</span>${f.upload?' <span class="pill wait">فایل لازم</span>':''}${f.test?' <span class="pill wait">تست لازم</span>':''}</div><div class="acts">${b}<button class="btn sm ghost" type="button" data-l2open="${esc(x.id)}">جزئیات</button></div></div>
      <div class="meta">${esc(d.wt||'')}${d.wt?' · ':''}دندان ${esc(l2Teeth(d.teeth)||'—')}${d.shade?' · رنگ '+esc(d.shade):''}${d.box?' · جعبه '+esc(faD(d.box)):''} · تحویل ${esc(jDay(x.due)||'—')}${d.prio==='urgent'?' · <b class="late">فوری</b>':''}</div>
      <div class="meta">${s.st==='acc'?'در دست '+esc(s.acc_name||'')+' · '+l2Ago(s.acc_at):'در نوبت'}${s.asg_name?' · ارجاع به '+esc(s.asg_name):''} · مرحله‌ی ${fa(s.idx+1)} از ${fa((x.steps||[]).length)}${late?' · <b class="late">دیرکرد</b>':''}</div>${l2Dots(x.steps)}</div>`}).join('')}
renderLab=function(){if(ROLE!=='lab')return;const n=l2Cnt(),me=L2.me||{};
  const S=[['new','سفارش تازه',n.new],['bench','میز کار من',n.bench],['work','در حال ساخت',n.work],['send','آماده‌ی ارسال',n.send],['ready','ارسال‌شده',n.ready],['done','تحویل‌شده',0],['ret','برگشتی‌ها',0]].concat(me.sup?[['defs','تعریف‌ها',0]]:[]);
  if(!S.some(s=>s[0]===LB.seg))LB.seg='new';
  $('lbSeg').innerHTML=S.map(([k,l,c])=>`<button type="button" data-lbs="${k}" aria-pressed="${LB.seg===k}">${l}${c?' ('+fa(c)+')':''}</button>`).join('');
  const b=$('labBadge');if(b){b.hidden=!n.new;b.textContent=fa(n.new)}document.title=(n.new?`(${fa(n.new)}) `:'')+'سفارش‌های لابراتوار';
  const L=$('lbList');try{renderTiles()}catch(e){}
  if(LB.seg==='bench'){L.innerHTML=l2Bench();return}
  if(LB.seg==='ret'){l2RetView(L);return}
  if(LB.seg==='defs'){l2DefsView(L);return}
  const rows=LB.items.filter(L2_SEG[LB.seg]||L2_SEG.new).sort((a,b)=>(((b.data||{}).prio==='urgent')-((a.data||{}).prio==='urgent'))||String(a.due).localeCompare(String(b.due)));
  L.innerHTML=rows.length?rows.map(l2Card).join(''):'<div class="empty">سفارشی در این بخش نیست.</div>'};
/* pollLab: lab2 list (replaces the dental-lab base) + lab5 (boots the lab5 data after the list poll; a parallel request would cancel the first poll) + lab6 (bench stats) */
async function pollLab(force){if(!(ROLE!=='lab'||document.hidden&&!force)){
  try{const j=await api('labList',{ver:force?'':LB.ver},{prio:'poll'});$('lbLive').classList.remove('off');$('lbLive').textContent='زنده';
    if(j.me)L2.me=j.me;if(j.dv&&(!L2.defs||L2.defs.v!==j.dv)){L2.dv=j.dv;await l2Defs(true).catch(()=>{})}
    if(!j.same){LB.ver=j.ver;const prev=LB.seen;LB.items=j.items||[];LB.seen=new Set(LB.items.map(x=>x.id+':'+x.st));
    if(prev&&LB.items.some(x=>(x.st==='new'||x.st==='redo')&&!prev.has(x.id+':'+x.st)))beep();
    const fo=document.activeElement;if(!(fo&&fo.id==='l2Q'))renderLab();
    if(L2.ord&&$('l2Sheet')&&!$('l2Sheet').hidden)l2Load(L2.ord.id,true)}}
  catch(e){if(e.message!=='aborted'){$('lbLive').classList.add('off');$('lbLive').textContent='اتصال قطع است؛ دوباره تلاش می‌شود…'}}}
  if(ROLE==='lab'&&!L5.boot&&!L5.booting){L5.booting=1;l5Boot().then(()=>{L5.booting=0;l5Nav()}).catch(()=>{L5.booting=0})}
  try{if(ROLE==='lab'&&L5.sec==='bench'&&L6.bv==='tbl'&&!L6.statsBusy){L6.statsBusy=1;l6Stats().finally(()=>{L6.statsBusy=0})}}catch(e){}}

