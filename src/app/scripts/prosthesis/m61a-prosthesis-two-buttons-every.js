
/* ---------- m61a (owner, 2026-11-23): prosthesis — two buttons on every patient card: «ادامه درمان» (design B: on the tooth chart) and «سفارش لابراتوار».
   «ادامه درمان»: a stage for every implant tooth; today's work on the chosen teeth (prosSess); failure with 4 choices; the next step (→ reception);
   the doctor from the login, the assistant optional. Nothing is mandatory. ---------- */
const M61W={impr:'قالب‌گیری',rabt:'تست اباتمنت',frame:'تست فریم',tryin:'تست رزین',deliv:'تحویل روکش',other:'سایر'};
const M61R={ok:'تأیید شد',fix:'نیاز به اصلاح',redo:'تکرار شود'};
const M61F={surg:['ارجاع به جراح برای معاینه','پروتز منتظر می‌ماند؛ منشی نوبت معاینه می‌دهد؛ جراح تصمیم می‌گیرد.'],stop:['توقف پروتز تا کاشت دوباره','کل پروتز می‌ایستد تا ایمپلنت دوباره گذاشته شود.'],pon:['به جایش پونتیک و ادامه','این دندان در طرح پونتیک می‌شود؛ بقیه ادامه می‌دهند.'],wo:['بدون این دندان ادامه','این دندان از پروتز خارج می‌شود؛ بقیه ادامه می‌دهند.']};
const M61N={impr:'قالب‌گیری',rabt:'تست اباتمنت',frame:'تست فریم',tryin:'تست رزین',deliv:'تحویل روکش',chk:'چکاپ'};
const M61D={7:'۱ هفته',14:'۲ هفته',21:'۳ هفته',30:'۱ ماه',90:'۳ ماه'};
const M61NX={impr:'tryin',rabt:'tryin',frame:'tryin',tryin:'deliv',deliv:'chk'};
let M61=null;
const m61Path=pr=>{const P=[];(PR2.PATH[pr2T(pr)]||PR2.PATH.fix).forEach(s=>{if(!P.includes(s))P.push(s)});return P};
const m61Gone=pr=>{const g=new Set();((pr&&pr.fails)||[]).filter(f=>f&&f.cont&&!f.end).forEach(f=>(f.teeth||[]).forEach(k=>g.add(k)));return g};
function m61State(id,name,j){const pr=j.pros||{},imp=Object.keys(implantsOf(j)).filter(isTooth),gone=m61Gone(pr),live=imp.filter(k=>!gone.has(k)),ts={};
  live.forEach(k=>ts[k]=(pr.ts&&pr.ts[k])||pr.stage);
  return {id,name,j,pr,imp,live,gone,ts,ts0:Object.assign({},ts),sel:'',wt:live.slice(),work:'',res:'ok',ev:'none',prob:'',note:'',ft:[],fo:'',rem:'',mon:'3',asst:'',nx:'',days:14,day:'',dec:'',busy:false}}
function m61Ch(o,cur,g,cl){return Object.keys(o).map(k=>`<button type="button" class="chip${cl?' '+cl:''}" data-m61g="${g}" data-v="${esc(k)}" aria-pressed="${Array.isArray(cur)?cur.includes(k):String(cur)===String(k)}">${o[k]}</button>`).join('')}
function m61Chart(){const S=M61,map=(S.pr.map||{}),T=k=>{const im=S.imp.includes(k),po=map[k]==='p',g=S.gone.has(k),f=S.ft.includes(k);
    return `<button type="button" class="m61t${im&&!g?' im':''}${po&&(!im||g)?' po':''}${g&&!po?' fl':''}${f&&!g?' fx':''}${S.sel===k?' sel':''}" ${im&&!g?`data-m61t="${k}"`:''} title="${esc(toothTxt([k]))}">${fa(Number(k[2]))}</button>`};
  const row=j=>{let r='';for(let i=8;i>=1;i--)r+=T(j+'R'+i);r+='<span class="m61md"></span>';for(let i=1;i<=8;i++)r+=T(j+'L'+i);return `<div class="m61jw">${r}</div>`};
  return `<div class="m61ch">${row('U')}${row('L')}</div><div class="m61lg"><i class="im"></i>ایمپلنت<i class="po"></i>پونتیک<i class="fx"></i>فیل (امروز)<i class="fl"></i>از پروتز خارج</div>`}
function m61FailBox(){const S=M61;return `<div class="m61red"><b>فیل ایمپلنت — ${esc(toothTxt(S.ft))}</b>
  <div class="m61op">${Object.keys(M61F).map(k=>`<button type="button" data-m61g="fo" data-v="${k}" aria-pressed="${S.fo===k}"><b>${M61F[k][0]}</b><small>${M61F[k][1]}</small></button>`).join('')}</div>
  ${S.fo&&S.fo!=='surg'?`<div><b class="m61s">ایمپلنت امروز برداشته شد؟</b><div class="chips">${m61Ch({y:'بله',n:'نه، هنوز در دهان است'},S.rem,'rem')}</div></div>${S.rem==='y'&&S.fo!=='wo'?`<div><span class="note">کاشت دوباره چند ماه بعد؟</span><div class="chips">${m61Ch({2:'۲ ماه',3:'۳ ماه',4:'۴ ماه',6:'۶ ماه'},S.mon,'mon')}</div></div>`:''}`:''}
  ${S.fo==='surg'?'<p class="note">منشی نوبت معاینه می‌دهد؛ جراح «مشکلی ندارد»، توقف، پونتیک یا بدون دندان را می‌زند و بیمار به پروتز برمی‌گردد.</p>':''}</div>`}
function m61Next(){const S=M61;if(S.ft.length&&(S.fo==='surg'||S.fo==='stop'))return `<span class="pill wait">${S.fo==='surg'?'منتظر معاینه‌ی جراح':'منتظر کاشت دوباره'} — مرحله‌ی بعد بعداً</span>`;
  return `<div class="chips">${m61Ch(M61N,S.nx,'nx')}</div>${S.nx?`<div class="chips">${m61Ch(M61D,S.day?'':S.days,'days')}<input id="m61day" class="m61in" placeholder="تاریخ دلخواه ۱۴۰۵/۰۹/۱۵" value="${esc(S.day?jd(S.day+'T12:00:00Z'):'')}"></div>`:''}`}
function m61Hold(){const S=M61,h=S.pr.hold;return `<div class="m61red"><b>منتظر معاینه‌ی جراح — ${esc(toothTxt(h.teeth||[]))}</b><p class="note">ارجاع ${esc(jt(h.at))}${h.by?' · '+esc(h.by):''}${h.note?' — '+esc(h.note):''}</p>
  <b class="m61s">نظر جراح</b><div class="m61op">${Object.entries({ok:['مشکلی ندارد، ادامه','پروتز از همان مرحله ادامه می‌دهد.'],stop:M61F.stop,pon:M61F.pon,wo:M61F.wo}).map(([k,v])=>`<button type="button" data-m61g="dec" data-v="${k}" aria-pressed="${S.dec===k}"><b>${v[0]}</b><small>${v[1]}</small></button>`).join('')}</div>
  ${S.dec&&S.dec!=='ok'?`<div><b class="m61s">ایمپلنت امروز برداشته شد؟</b><div class="chips">${m61Ch({y:'بله',n:'نه'},S.rem,'rem')}</div></div>${S.rem==='y'&&S.dec!=='wo'?`<div class="chips">${m61Ch({2:'۲ ماه',3:'۳ ماه',4:'۴ ماه',6:'۶ ماه'},S.mon,'mon')}</div>`:''}`:''}
  <textarea id="m61note" placeholder="توضیح (اختیاری)">${esc(S.note)}</textarea></div>`}
function m61Draw(){const S=M61,b=$('m61Body');if(!S||!b)return;const pr=S.pr,P=m61Path(pr),ls=pr.lastSess,nx=pr.nxt;
  let h=`<div class="m61hd"><div><b>${esc(S.name)}</b> <span class="pill rev">${esc(pr.hold?'منتظر معاینه‌ی جراح':(PSTN[pr.stage]||pr.stage||''))}</span></div><div class="note">${esc(PR2.TL[pr2T(pr)]||'')}${ls?` · جلسه‌ی قبل ${esc(jd(ls.at))}: ${esc(L5_W_FA(ls.work))}${ls.by?' ('+esc(ls.by)+')':''}`:''}${nx?` · مرحله‌ی بعدِ ثبت‌شده: ${esc(M61N[nx.st]||nx.st)} ${esc(jd(nx.day+'T12:00:00Z'))}`:''}</div></div>`;
  if(pr.hold){b.innerHTML=h+m61Hold();$('m61Save').textContent='ثبت نظر جراح';return}
  if(['fail','pause','done'].includes(pr.stage)){b.innerHTML=h+`<p class="note">${pr.stage==='fail'?'شکست ایمپلنت ثبت شده؛ بعد از کاشت دوباره ادامه می‌دهد.':pr.stage==='pause'?'درمان پروتز متوقف است؛ از پرونده «ادامه‌ی درمان» را بزنید.':'پروتز تحویل شده؛ برای مشکل بعد از تحویل از پرونده استفاده کنید.'}</p>`;$('m61Save').hidden=true;return}
  $('m61Save').hidden=false;$('m61Save').textContent='ثبت ادامه درمان';
  const pill=k=>{const f=S.ft.includes(k);return `<span class="pill${f?' bad':''}">${esc(toothTxt([k]))}: ${f?'فیل':esc(PSTN[S.ts[k]]||S.ts[k])}</span>`};
  h+=`<div class="m61c"><div class="m61q">روی هر ایمپلنت بزنید <small>مرحله، کار امروز، فیل</small></div><div class="chips">${S.live.map(pill).join('')}${[...S.gone].map(k=>`<span class="pill">${esc(toothTxt([k]))}: ${(S.pr.map||{})[k]==='p'?'فیل — پونتیک شد':'فیل — از پروتز خارج'}</span>`).join('')}</div>${m61Chart()}`;
  if(S.sel){const k=S.sel;h+=`<div class="m61p"><div class="m61q">${esc(toothTxt([k]))} <small>مرحله</small></div><div class="chips">${P.map(s=>`<button type="button" class="chip" data-m61st="${s}" aria-pressed="${S.ts[k]===s}">${esc(PSTN[s]||s)}</button>`).join('')}</div>
    <div class="chips"><button type="button" class="chip" data-m61g="wt" data-v="${k}" aria-pressed="${S.wt.includes(k)}">کار امروز روی این دندان</button><button type="button" class="chip bad" data-m61g="ft" data-v="${k}" aria-pressed="${S.ft.includes(k)}">فیل ایمپلنت</button></div></div>`}
  if(S.ft.length)h+=m61FailBox();
  h+=`</div><div class="m61c"><div class="m61q">امروز <small>${S.wt.length?'برای '+esc(toothTxt(S.wt)):'دندانی انتخاب نشده'}</small></div><div class="chips">${m61Ch(M61W,S.work,'work')}</div>${S.work?`<div class="chips">${m61Ch(M61R,S.res,'res')}</div>`:''}
    <div class="chips">${m61Ch({none:'اتفاق خاصی نیفتاد',prob:'مشکل دیگر (پیچ، شکستگی، درد…)'},S.ev,'ev')}</div>${S.ev==='prob'?`<textarea id="m61prob" placeholder="مشکل">${esc(S.prob)}</textarea>`:''}
    <textarea id="m61note" placeholder="توضیح (اختیاری) — در پرونده و PDF ثبت می‌شود">${esc(S.note)}</textarea></div>
    <div class="m61c"><div class="m61q">مرحله‌ی بعد</div>${m61Next()}<div class="m61q">دستیار <small>اختیاری · پزشک: ${esc(USERNAME||'')}</small></div><div class="chips">${m61Ch(Object.fromEntries(ASSTS().filter(n=>n!=='پزشک کلینیک').map(n=>[n,esc(n)])),S.asst,'asst')}</div></div>`;
  b.innerHTML=h}
function L5_W_FA(w){return ({impr:'قالب‌گیری',rscr:'تست رزین',rabt:'تست اباتمنت',deliv:'تحویل روکش',other:'سایر'})[w]||w||''}
function m61Read(){const S=M61;if(!S)return;const n=$('m61note');if(n)S.note=n.value;const p=$('m61prob');if(p)S.prob=p.value;const d=$('m61day');if(d){const v=parseJ(d.value);S.day=v||'';}}
async function m61Open(id,name){let s=$('m61Sheet');if(!s){s=document.createElement('div');s.className='sheet';s.id='m61Sheet';s.hidden=true;
    s.innerHTML='<div class="in"><h3>ادامه درمان</h3><div id="m61Body"><div class="empty">در حال بارگذاری…</div></div><div class="msg" id="m61Msg"></div><div class="btns"><button class="btn" type="button" id="m61Save" style="flex:1">ثبت ادامه درمان</button><button class="btn ghost" type="button" data-m61x>بستن</button></div></div>';document.body.append(s)}
  $('m61Body').innerHTML='<div class="empty">در حال بارگذاری…</div>';$('m61Msg').textContent='';s.hidden=false;M61=null;
  try{const j=await api('get',{id});M61=m61State(id,name||((fromDoc(id,j.data||{}).h||{}).name)||'',j);m61Draw()}catch(e){$('m61Body').innerHTML='<div class="empty">'+esc(e.message)+'</div>'}}
async function m61Save(btn){const S=M61;if(!S||S.busy)return;m61Read();const m=$('m61Msg'),by=USERNAME||ROLE_LBL[ROLE]||'پزشک',pr=S.pr;S.busy=true;btn.disabled=true;m.className='msg';m.textContent='در حال ثبت…';
  const done=[];
  try{
    if(pr.hold){if(!S.dec)throw new Error('نظر جراح را انتخاب کنید.');await api('m61',{op:'dec',id:S.id,dec:S.dec,removed:S.rem==='y',months:S.rem==='y'?S.mon:'',note:S.note,by});done.push('نظر جراح ثبت شد')}
    else{
      const teeth=S.wt.filter(k=>!S.ft.includes(k)),asst=S.asst?'دستیار: '+S.asst:'';
      const note=[teeth.length&&S.work?'دندان '+toothTxt(teeth):'',S.ev==='prob'&&S.prob?'مشکل: '+S.prob:'',S.note,asst].filter(Boolean).join(' — ');
      let stage=pr.stage;
      if(S.work||S.ev==='prob'||S.note){const w=S.work==='tryin'?'rscr':S.work==='frame'?'other':S.work||'other',res=S.res==='ok'?'ok':'redo';
        const nt=note||(S.work==='frame'?'تست فریم':w==='other'?'سایر':'')||(res==='redo'?(S.res==='redo'?'تکرار شود':'نیاز به اصلاح'):'');
        const pt={};Object.keys(pr.map||{}).forEach(k=>{if(pr.map[k]==='p')pt[k]='p'});(teeth.length?teeth:S.live).forEach(k=>pt[k]='a');
        const r=await api('prosSess',{id:S.id,pt,aid:(L3&&L3.plan===S.id&&L3.aid)||'',work:w,ty:w==='impr'?'impr':undefined,result:['rscr','rabt'].includes(w)||S.work==='frame'?res:'',note:(S.work==='frame'?'تست فریم — ':'')+nt,by,sendId:uuid()});
        if(r&&r.stage)stage=r.stage;done.push('جلسه در پرونده ثبت شد')}
      if(S.ft.length&&S.fo){const fb={id:S.id,teeth:S.ft,note:S.note||'',by,removed:S.rem==='y',months:S.rem==='y'?S.mon:''};
        if(S.fo==='surg')await api('m61',{op:'hold',id:S.id,teeth:S.ft,note:S.note||'',by});
        else if(S.fo==='stop')await api('prosAct',Object.assign({op:'fail'},fb));
        else{await api('prosAct',Object.assign({op:'fail',cont:1},fb));if(S.fo==='pon')await api('m61',{op:'pon',id:S.id,teeth:S.ft,by})}
        done.push('فیل ایمپلنت: '+M61F[S.fo][0])}
      else if(S.ft.length&&!S.fo)throw new Error('برای فیل ایمپلنت یکی از چهار راه را انتخاب کنید یا «فیل ایمپلنت» را بردارید.');
      /* stages: the worked teeth take the new stage; the others keep theirs; the doctor's own changes win */
      const ts={};S.live.filter(k=>!S.ft.includes(k)).forEach(k=>{let v=S.ts0[k];if(S.work&&teeth.includes(k)&&stage!==pr.stage)v=stage;if(S.ts[k]!==S.ts0[k])v=S.ts[k];ts[k]=v});
      if(Object.keys(ts).length){await api('m61',{op:'ts',id:S.id,ts,by})}
      if(S.nx&&!(S.ft.length&&(S.fo==='surg'||S.fo==='stop'))){await api('m61',{op:'next',id:S.id,st:S.nx,days:S.day?'':S.days,day:S.day||'',by});done.push('مرحله‌ی بعد: '+M61N[S.nx]+' (برای منشی)')}
    }
    $('m61Sheet').hidden=true;toast(done.length?done.join(' · '):'چیزی برای ثبت نبود.');try{if(l3Of(S.id))await api('prosRef',{id:S.id,op:'clear'})}catch(e){}
    pollQ(true);try{if(!$('viewPday').hidden)loadPday();if(!$('viewPros').hidden)loadPros()}catch(e){}try{if(PF&&PF.id===S.id&&!$('pfSheet').hidden)refreshFile()}catch(e){}
  }catch(e){m.className='msg err';m.textContent=e.message}finally{S.busy=false;btn.disabled=false}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-m61],[data-m61g],[data-m61t],[data-m61st],[data-m61x],#m61Save,[data-m61hold]');if(!t)return;const d=t.dataset;
  if(d.m61!==undefined||d.m61hold!==undefined){e.stopImmediatePropagation();m61Open(d.m61||d.m61hold,d.m61n||'');return}
  if(d.m61x!==undefined){$('m61Sheet').hidden=true;return}
  if(t.id==='m61Save'){m61Save(t);return}
  const S=M61;if(!S)return;m61Read();
  if(d.m61t){S.sel=S.sel===d.m61t?'':d.m61t}
  else if(d.m61st){if(S.sel)S.ts[S.sel]=d.m61st}
  else if(d.m61g){const g=d.m61g,v=d.v;
    if(Array.isArray(S[g]))S[g]=S[g].includes(v)?S[g].filter(x=>x!==v):S[g].concat(v);
    else if(g==='days'){S.days=Number(v);S.day=''}
    else S[g]=String(S[g])===v&&!['ev'].includes(g)?'':v;
    if(g==='ft'){S.wt=S.wt.filter(x=>!S.ft.includes(x));if(!S.ft.length){S.fo='';S.rem=''}}
    if(g==='work'&&S.work&&M61NX[S.work]&&!S.nx)S.nx=M61NX[S.work];
    if(g==='res'&&S.res&&S.res!=='ok'&&S.work&&M61N[S.work])S.nx=S.work}
  const sc=document.querySelector('#m61Sheet .in'),y=sc?sc.scrollTop:0;m61Draw();if(sc)sc.scrollTop=y},true);
/* the cards: only «ادامه درمان» + «سفارش لابراتوار»; the name opens the file */
function m61Acts(root){(root||document).querySelectorAll('#pdList .item, #pdAll .item, #l3Ref .l3it, #m61Hl .item').forEach(it=>{const a=it.querySelector('.acts');if(!a||a.dataset.m61d)return;
  const src=a.querySelector('[data-pmap],[data-l3lab],[data-l5],[data-m58lab],[data-file]');if(!src)return;const id=src.dataset.pmap||src.dataset.l3lab||src.dataset.l5||src.dataset.m58lab||src.dataset.file,nm=src.dataset.pmn||src.dataset.l3n||src.dataset.m58n||src.dataset.fname||(it.querySelector('.nm')||{}).textContent||'',aid=(a.querySelector('[data-aid]')||{dataset:{}}).dataset.aid||'';
  if(!id)return;a.dataset.m61d='1';a.innerHTML=`<button class="btn sm" type="button" data-m61="${esc(id)}" data-m61n="${esc(nm)}">ادامه درمان</button><button class="btn sm ghost" type="button" data-m58lab="${esc(id)}" data-m58n="${esc(nm)}" data-aid="${esc(aid)}">سفارش لابراتوار</button>`;
  const n=it.querySelector('.nm');if(n&&!n.dataset.file){n.dataset.file=id;n.dataset.fname=nm;n.dataset.ftab='pros';n.classList.add('m61nm');n.setAttribute('role','button');n.title='پرونده'}})}
(function(){const _r=renderPday;renderPday=function(){const r=_r.apply(this,arguments);try{m61HoldList();m61Acts($('viewPday'))}catch(e){console.error('m61 cards',e)}return r}})();
(function(){const _r=l3RenderRef;l3RenderRef=function(){const r=_r.apply(this,arguments);try{m61Acts($('viewPday'))}catch(e){}return r}})();
/* surgeon: patients waiting for the examination */
function m61HoldList(){const v=$('viewPday');if(!v)return;let b=$('m61Hl');const L=(PD.pros||[]).filter(x=>x.hold);if(!b){b=document.createElement('div');b.id='m61Hl';const q=v.querySelector('.qhead');if(q)q.after(b);else v.prepend(b)}
  b.hidden=!L.length;b.innerHTML=L.length?`<div class="qhead"><h2>منتظر معاینه‌ی جراح <small class="note">${fa(L.length)} بیمار</small></h2></div><div class="list">${L.map(x=>`<div class="item"><div class="row1"><div><span class="nm">${esc(x.name)}</span><div class="meta">مشکل ایمپلنت ${esc(toothTxt(x.hold.teeth||[]))}${x.hold.by?' · ارجاع '+esc(x.hold.by):''}</div></div><span class="pill wait">منتظر جراح</span></div><div class="acts" data-m61d="1"><button class="btn sm" type="button" data-m61hold="${esc(x.id)}" data-m61n="${esc(x.name)}">معاینه و نظر جراح</button></div></div>`).join('')}</div>`:''}
/* lab order while waiting for the surgeon */
window.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-m58lab]');if(!t)return;const x=(PD.pros||[]).find(p=>p.id===t.dataset.m58lab);if(x&&x.hold){e.stopImmediatePropagation();e.preventDefault();toast('این بیمار منتظر معاینه‌ی جراح است؛ بعد از نظر جراح سفارش بدهید.',1)}},true);
/* PDF of the file: the stage of every tooth, the next step, the surgeon — in ffProsBlocks, finance/patch-pdf-pdf.js */
