/* ---------- p5: online intake, post-op instructions/prescriptions, win-back, attendance, performance, simple accounting ---------- */
var QINT=[],RC_INTAKE='';
const mnum=v=>parseInt(toEn(v||'').replace(/[^\d]/g,''),10)||0;
const todayJ=()=>jalali(new Date(tDay()+'T12:00:00')).slash;
const arm2=(t,lbl)=>{if(t.dataset.armed==='1')return true;const o=t.textContent;t.dataset.armed='1';t.textContent=lbl||'برای تأیید دوباره بزنید';setTimeout(()=>{if(t.isConnected){t.dataset.armed='';t.textContent=o}},4000);return false};
async function copyTxt(s){try{await navigator.clipboard.writeText(s);toast('کپی شد.')}catch(e){const i=document.createElement('textarea');i.value=s;document.body.appendChild(i);i.select();try{document.execCommand('copy');toast('کپی شد.')}catch(x){alertMsg(s)}i.remove()}}

/* -- online intake form: reception sends a link, the patient fills it at home, reception admits from it -- */
function renderIntake(){const W=$('ikW');if(!W)return;const F=QINT.filter(x=>x.st==='filled'),N=QINT.filter(x=>x.st==='new');
  W.hidden=!F.length&&!N.length;$('ikN').textContent=F.length?fa(F.length):'';
  $('ikList').innerHTML=F.map(x=>{const p=x.p||{},ms=p.med?medShort(p.med):'';return `<div class="item ik"><div class="row1"><div><span class="nm">${esc(x.name||p.name||'')}</span>
    <div class="meta">${p.phone?esc(faD(p.phone))+' · ':''}پر شده ${esc(jt(x.at))}${p.ref?' · معرف: '+esc(p.ref):''}</div>${ms?`<div class="meta"><b class="late">سابقه‌ی پزشکی:</b> ${esc(ms)}</div>`:'<div class="meta">سابقه‌ی پزشکی: موردی اعلام نشده</div>'}</div>
    <div class="acts"><button class="btn sm" type="button" data-ikuse="${esc(x.tok)}">پذیرش و ارسال به پزشک</button><button class="btn sm ghost" type="button" data-ikdel="${esc(x.tok)}">حذف</button></div></div></div>`}).join('')+
    (N.length?`<p class="note">${fa(N.length)} لینک فرستاده شده و هنوز پر نشده: ${N.slice(0,10).map(x=>`<span class="ikw">${esc(x.name||'بی‌نام')} <button type="button" class="lnk" data-ikdel="${esc(x.tok)}" title="باطل کردن لینک">✕</button></span>`).join('، ')}</p>`:'')}
function ikOpen(){const s=mkSheet('ikSheet',`<h3>فرم پذیرش آنلاین برای بیمار</h3><p class="note">بیمار پیش از مراجعه مشخصات، معرف و سابقه‌ی پزشکی‌اش را پر می‌کند و رضایت‌نامه‌ی عمومی را امضا می‌کند. روز مراجعه، از فهرست «فرم‌های آنلاین» با یک دکمه پذیرش می‌شود. لینک ۱۰ روز اعتبار دارد.</p>
  <div class="fields"><label class="f">نام بیمار<input id="ik_name" autocomplete="off"></label><label class="f">موبایل<input id="ik_phone" inputmode="tel" class="ltr" autocomplete="off"></label></div>
  <div class="btns"><button class="btn" type="button" id="ikMake">ساخت لینک</button><button class="btn ghost" type="button" id="ikClose">بستن</button></div><div class="msg" id="ikMsg"></div><div id="ikOut"></div>`);s.hidden=false;setTimeout(()=>$('ik_name').focus(),60)}
async function ikMake(t){const m=$('ikMsg'),name=$('ik_name').value.trim(),phone=toEn($('ik_phone').value.trim());t.disabled=true;m.className='msg';m.textContent='در حال ساخت…';
  try{const j=await api('intakeNew',{name,phone});const url=location.origin+'/f#'+j.tok,txt=`${name?name+' عزیز، ':''}لطفاً پیش از مراجعه به ${SET.clinic||'کلینیک'}، فرم پذیرش را از این لینک پر کنید (چند دقیقه طول می‌کشد):\n${url}`;m.textContent='';
    const wa=phone?waLink(phone,txt):'',sm=phone?smsLink(phone,txt):'';
    $('ikOut').innerHTML=`<div class="diffbox"><div class="ltr" style="word-break:break-all;font-size:.85rem">${esc(url)}</div><div class="btns" style="flex-wrap:wrap;margin-top:8px"><button class="btn sm" type="button" id="ikCopy">کپی پیام و لینک</button>${wa?`<a class="btn sm ghost" target="_blank" rel="noopener" href="${esc(wa)}">واتس‌اپ</a>`:''}${sm?`<a class="btn sm ghost" href="${esc(sm)}">پیامک</a>`:''}</div></div>`;
    $('ikCopy').onclick=()=>copyTxt(txt);pollQ(true)}catch(e){m.className='msg err';m.textContent=e.message}finally{t.disabled=false}}
function ikUse(tok){const x=QINT.find(v=>v.tok===tok);if(!x||!x.p)return;rcReset();const p=x.p;
  ['name','nid','phone','age','city','ref'].forEach(k=>{if(p[k])$('rc_'+k).value=p[k]});$('rc_note').value=p.note||'';RC_MED=medNorm(p.med);renderMed('rc');RC_INTAKE=tok;
  $('rcTitle').textContent='پذیرش از فرم آنلاین';$('rcCancel').hidden=false;$('rcMsg').className='msg';$('rcMsg').textContent='مشخصات و سابقه‌ی پزشکی از فرم بیمار آمده؛ بررسی کنید، پذیرنده را انتخاب کنید و بفرستید. امضای رضایت‌نامه در «تصاویر» پرونده ذخیره می‌شود.';$('rcSheet').hidden=false}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.id==='ikNew'){ikOpen();return}
  if(t.id==='ikClose'){$('ikSheet').hidden=true;return}
  if(t.id==='ikMake'){ikMake(t);return}
  if(t.dataset.ikuse){ikUse(t.dataset.ikuse);return}
  if(t.dataset.ikdel){if(!arm2(t,t.classList.contains('lnk')?'؟':'برای حذف دوباره بزنید'))return;t.disabled=true;try{await api('intakeDel',{tok:t.dataset.ikdel});QINT=QINT.filter(x=>x.tok!==t.dataset.ikdel);renderIntake();pollQ(true)}catch(err){toast(err.message,1)}return}});

/* -- post-op instructions + prescriptions: templates edited by doctor/consultant, given by the surgery assistant on surgery day -- */
const RX={tpl:null,edit:null};
const rxKL={post:'دستور بعد از جراحی',rx:'نسخه'};
async function loadRx(){try{const j=await api('rxGet');RX.tpl=j.tpl;RX.edit=JSON.parse(JSON.stringify(j.tpl.items||[]));renderRx()}catch(e){$('rxEd').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
function renderRx(){const T=RX.tpl||{},E=RX.edit||[];
  $('rxSt').innerHTML=T.approved?`<span class="pill done">تأیید پزشک</span> <span class="note">آخرین ذخیره ${T.at?esc(jt(T.at)):''}${T.by?' · '+esc(T.by):''}</span>`:`<span class="pill wait">در انتظار تأیید پزشک</span> <span class="note">تا پزشک قالب‌ها را بازبینی و ذخیره نکند، دستیار جراحی نمی‌تواند آن‌ها را چاپ کند.${ROLE==='consultant'?' (ذخیره با ورود مشاور، تأیید پزشک را برمی‌دارد.)':''}</span>`;
  $('rxEd').innerHTML=E.map((x,i)=>`<div class="card rxc"><div class="fields"><label class="f">عنوان<input data-rxf="title" data-rxi="${i}" value="${esc(x.title)}"></label><label class="f">نوع<select data-rxf="kind" data-rxi="${i}"><option value="post"${x.kind==='post'?' selected':''}>دستور بعد از جراحی</option><option value="rx"${x.kind==='rx'?' selected':''}>نسخه (دارو)</option></select></label></div>
    <label class="f full">متن <small class="note">${x.kind==='rx'?'هر دارو در یک خط: نام دارو — دوز — دفعات — مدت':'هر دستور در یک خط'}</small><textarea rows="${Math.min(12,Math.max(4,(x.text||'').split('\n').length+1))}" data-rxf="text" data-rxi="${i}">${esc(x.text)}</textarea></label>
    <div class="btns"><button class="btn sm ghost danger" type="button" data-rxdel="${i}">حذف این قالب</button></div></div>`).join('')||'<div class="empty">قالبی نیست؛ یکی اضافه کنید.</div>'}
function rxDoc(name,items){const ph=SET.phone?esc(faD(SET.phone)):'',d=todayJ();
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${esc(name)}</title><style>@page{size:A5;margin:12mm}body{font-family:Vazirmatn,Tahoma,sans-serif;color:#111;font-size:12.5px;line-height:1.9}
  .hd{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #0a7680;padding-bottom:6px;margin-bottom:10px}.hd b{font-size:15px;color:#0a7680}.hd small{color:#555}
  h2{font-size:13.5px;margin:12px 0 4px;color:#0a7680}ol,ul{margin:0;padding-inline-start:20px}.rx li{font-weight:700}.ft{margin-top:18px;border-top:1px solid #ccc;padding-top:6px;color:#555;font-size:11px;display:flex;justify-content:space-between}.sg{margin-top:26px;text-align:left}</style></head><body>
  <div class="hd"><div><b>${esc(SET.clinic||'')}</b><br><small>${esc(SET.doctor||'')}</small></div><div><small>تاریخ: ${esc(d)}</small><br><small>بیمار: <b>${esc(name)}</b></small></div></div>
  ${items.map(x=>`<h2>${x.kind==='rx'?'℞ ':''}${esc(x.title)}</h2><${x.kind==='rx'?'ol class="rx"':'ul'}>${String(x.text||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>`<li>${esc(l)}</li>`).join('')}</${x.kind==='rx'?'ol':'ul'}>`).join('')}
  ${items.some(x=>x.kind==='rx')?'<div class="sg">مهر و امضای پزشک</div>':''}<div class="ft"><span>${ph?'تلفن کلینیک: '+ph:''}</span><span>در صورت خونریزی شدید، تب یا تورم رو به افزایش تماس بگیرید.</span></div></body></html>`}
async function rxOpen(pid,name){const s=mkSheet('rxSheet',`<h3>دستور بعد از جراحی و نسخه · ${esc(name||'')}</h3><div id="rxPick"><div class="empty">در حال بارگذاری…</div></div><div class="msg" id="rxMsg"></div>
  <div class="btns" style="flex-wrap:wrap"><button class="btn" type="button" id="rxGo">ثبت در پرونده و چاپ</button><button class="btn ghost" type="button" id="rxClose">بستن</button></div>`);s.hidden=false;RX.give={pid,name};
  try{const j=await api('rxGet');RX.tpl=j.tpl;const T=j.tpl;
    $('rxPick').innerHTML=(T.approved?'':'<div class="msg err">پزشک هنوز قالب‌ها را تأیید نکرده؛ از پزشک بخواهید یک بار بخش «نسخه‌ها» را بازبینی و ذخیره کند.</div>')+
      (T.items||[]).map(x=>`<label class="agree rxp"><input type="checkbox" data-rxpick="${esc(x.id)}"${T.approved&&(x.kind==='rx'||/ایمپلنت/.test(x.title))?' checked':''}${T.approved?'':' disabled'}> <span><b>${esc(x.title)}</b> <small class="note">${esc(rxKL[x.kind])}</small></span></label>`).join('');
    $('rxGo').disabled=!T.approved}catch(e){$('rxPick').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.id==='tabRx'){if(dirty&&!$('viewForm').hidden){alertMsg('اول فرم را ذخیره کنید.');return}show('rx');return}
  if(t.id==='rxAdd'){RX.edit.push({id:'',kind:'post',title:'',text:''});renderRx();return}
  if(t.dataset.rxdel!==undefined){if(!arm2(t))return;RX.edit.splice(+t.dataset.rxdel,1);renderRx();return}
  if(t.id==='rxSave'){const m=$('rxSMsg');t.disabled=true;try{const j=await api('rxSave',{items:RX.edit});RX.tpl=j.tpl;RX.edit=JSON.parse(JSON.stringify(j.tpl.items));renderRx();m.className='msg ok';m.textContent=j.tpl.approved?'ذخیره و تأیید شد؛ دستیار جراحی از روز جراحی می‌تواند چاپ کند.':'ذخیره شد؛ برای استفاده باید پزشک تأیید کند.'}catch(err){m.className='msg err';m.textContent=err.message}finally{t.disabled=false}return}
  if(t.id==='rxReset'){if(!arm2(t))return;RX.edit=JSON.parse(JSON.stringify((RX.tpl&&RX.tpl.items)||[]));renderRx();return}
  if(t.id==='sdRx'&&SD){rxOpen(SD.pid||SD.rec.id,SD.rec.h&&SD.rec.h.name);return}
  if(t.id==='rxClose'){$('rxSheet').hidden=true;return}
  if(t.id==='rxGo'&&RX.give){const m=$('rxMsg'),ids=[...document.querySelectorAll('[data-rxpick]:checked')].map(i=>i.dataset.rxpick);if(!ids.length){m.className='msg err';m.textContent='دست‌کم یک مورد را انتخاب کنید.';return}
    t.disabled=true;try{const j=await api('rxGive',{id:RX.give.pid,ids});printHTML(rxDoc(RX.give.name||'',j.items));m.className='msg ok';m.textContent='در پرونده ثبت شد و به پرینتر رفت. بیمار در لینک پرونده‌اش هم آن را می‌بیند.'}catch(err){m.className='msg err';m.textContent=err.message}finally{t.disabled=false}return}});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.rxf&&RX.edit){const x=RX.edit[+t.dataset.rxi];if(x)x[t.dataset.rxf]=t.value}});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.rxf==='kind'&&RX.edit){const x=RX.edit[+t.dataset.rxi];if(x){x.kind=t.value;renderRx()}}});

/* -- win-back: patients who drifted away -- */
const WB={items:[],k:'all',n:300,q:''};
const WBK={lost:['تصمیم نگرفت یا انصراف','wait'],nosurg:['طرح را پذیرفت، جراحی نشد','surg'],recall:['چکاپ دوره‌ای عقب افتاده','rev'],pros:['پروتز نیمه‌کاره مانده','mod']};
function wbMsg(x){const n=x.name||'',c=SET.clinic||'کلینیک',p=SET.phone?' '+faD(SET.phone):'';
  return x.kind==='lost'?`سلام ${n} عزیز، از ${c} پیام می‌دهیم. اگر هنوز درباره‌ی درمان ایمپلنت سؤال یا نگرانی دارید، خوشحال می‌شویم دوباره در خدمتتان باشیم.${p}`
    :x.kind==='nosurg'?`سلام ${n} عزیز، طرح درمان ایمپلنت شما در ${c} آماده است. برای گرفتن نوبت جراحی با ما تماس بگیرید.${p}`
    :x.kind==='recall'?`سلام ${n} عزیز، زمان چکاپ دوره‌ای ایمپلنت‌های شما در ${c} رسیده است. برای گرفتن نوبت با ما تماس بگیرید.${p}`
    :`سلام ${n} عزیز، برای ادامه‌ی مرحله‌ی پروتز ایمپلنت‌ها در ${c} منتظر شما هستیم. برای گرفتن نوبت با ما تماس بگیرید.${p}`}
async function loadWb(){try{const j=await api('winback');WB.items=j.items||[];renderWb()}catch(e){$('wbList').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
/* renderWb: base (p5 win-back list, now the inner wbDraw) + m18 (3) (search box + page-by-page «نمایش بیشتر») */
function renderWb(){function wbDraw(){const A=WB.items,cnt={};A.forEach(x=>cnt[x.kind]=(cnt[x.kind]||0)+1);
  $('wbF').innerHTML=[['all','همه',A.length],...Object.keys(WBK).map(k=>[k,WBK[k][0],cnt[k]||0])].map(([k,l,n])=>`<button type="button" class="chip" data-wbk="${k}" aria-pressed="${WB.k===k}">${esc(l)} <b>${fa(n)}</b></button>`).join('');
  const V=WB.k==='all'?A:A.filter(x=>x.kind===WB.k);
  $('wbList').innerHTML=V.length?V.slice(0,300).map((x,i)=>{const tx=wbMsg(x),wa=x.phone?waLink(x.phone,tx):'',sm=x.phone?smsLink(x.phone,tx):'';
    return `<div class="item"><div class="row1"><div><span class="nm">${esc(x.name)}</span> <span class="pill ${WBK[x.kind][1]}">${esc(WBK[x.kind][0])}</span>
      <div class="meta">${x.phone?esc(faD(x.phone))+' · ':''}${x.since?'از '+esc(x.since.length>10?jd(x.since):jDay(x.since)):''}${x.info?' · '+esc(x.kind==='pros'?(PSTN[x.info]||x.info):x.info):''}</div></div>
      <div class="acts">${x.phone?`<a class="btn sm" href="tel:${esc(String(x.phone).replace(/[^\d+]/g,''))}">تماس</a>`:''}${wa?`<a class="btn sm ghost" target="_blank" rel="noopener" href="${esc(wa)}">واتس‌اپ</a>`:''}${sm?`<a class="btn sm ghost" href="${esc(sm)}">پیامک</a>`:''}
      <button class="btn sm ghost" type="button" data-wbfile="${esc(x.id)}" data-wbn="${esc(x.name)}">پرونده</button><button class="btn sm ghost" type="button" data-wbsn="${esc(x.id)}" data-wbkind="${x.kind}" data-days="30">یک ماه بعد</button><button class="btn sm ghost" type="button" data-wbsn="${esc(x.id)}" data-wbkind="${x.kind}" data-days="3650">دیگر پیگیری نشود</button></div></div></div>`}).join('')+(V.length>300?`<p class="note">${fa(V.length-300)} مورد دیگر هم هست.</p>`:''):'<div class="empty">موردی نیست.</div>'}
  const all = WB.items; try { let q = $('wbQ'); if (!q) { $('wbList').insertAdjacentHTML('beforebegin', '<input id="wbQ" type="search" placeholder="جستجوی نام یا موبایل" autocomplete="off">'); q = $('wbQ'); q.addEventListener('input', () => { WB.q = q.value.trim(); WB.n = 300; renderWb() }) }
      const k = toEn(WB.q || '').replace(/\s+/g, ''), V0 = WB.q ? all.filter(x => String(x.name || '').includes(WB.q) || (k && toEn(String(x.phone || '')).includes(k))) : all, V = WB.k === 'all' ? V0 : V0.filter(x => x.kind === WB.k);
      if (V.length <= 300) { WB.items = V0; wbDraw(); WB.items = all; return }
      /* long list: draw it page by page with the original card of each row */
      const cut = V.slice(0, WB.n); WB.items = cut; const k0 = WB.k; WB.k = 'all'; wbDraw(); WB.k = k0; WB.items = V0; const cnt = {}; V0.forEach(x => cnt[x.kind] = (cnt[x.kind] || 0) + 1);
      $('wbF').innerHTML = [['all', 'همه', V0.length], ...Object.keys(WBK).map(z => [z, WBK[z][0], cnt[z] || 0])].map(([z, l, n]) => `<button type="button" class="chip" data-wbk="${z}" aria-pressed="${WB.k === z}">${esc(l)} <b>${fa(n)}</b></button>`).join('');
      WB.items = all; if (V.length > WB.n) $('wbList').insertAdjacentHTML('beforeend', `<div class="btns"><button class="btn ghost" type="button" id="wbMore">نمایش ${fa(Math.min(300, V.length - WB.n))} مورد بعدی (از ${fa(V.length - WB.n)} مورد مانده)</button></div>`) }
    catch (e) { WB.items = all; wbDraw() } }
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.id==='tabWb'){if(dirty&&!$('viewForm').hidden){alertMsg('اول فرم را ذخیره کنید.');return}show('wb');return}
  if(t.dataset.wbk){WB.k=t.dataset.wbk;renderWb();return}
  if(t.dataset.wbfile){openFile(t.dataset.wbfile,t.dataset.wbn);return}
  if(t.dataset.wbsn){if(t.dataset.days==='3650'&&!arm2(t))return;t.disabled=true;try{await api('wbSnooze',{id:t.dataset.wbsn,kind:t.dataset.wbkind,days:+t.dataset.days});WB.items=WB.items.filter(x=>!(x.id===t.dataset.wbsn&&x.kind===t.dataset.wbkind));renderWb();toast(t.dataset.days==='30'?'یک ماه دیگر دوباره در فهرست می‌آید.':'از فهرست برداشته شد.')}catch(err){toast(err.message,1);t.disabled=false}return}});

/* -- attendance: personal accounts, only from the clinic internet -- */
async function attOpen(){const s=mkSheet('attSheet',`<h3>حضور و غیاب${USERNAME?' · '+esc(USERNAME):''}</h3><div id="attB"><div class="empty">در حال بارگذاری…</div></div><div class="msg" id="attMsg"></div>${ROLE==='manager'?'<div id="attIpB"></div>':''}<div class="btns"><button class="btn ghost" type="button" id="attClose">بستن</button></div>`);s.hidden=false;attLoad()}
async function attLoad(){try{const j=await api('attMe'),B=$('attB');if(!B)return;let h='';
    if(!j.personal)h='<p class="note">ثبت ورود و خروج با حساب شخصی است. مدیر در بخش «کاربران» برای شما حساب می‌سازد؛ بعد با همان نقش و رمز شخصی خودتان وارد شوید.</p>';
    else{const R=j.rows||[],open=R.find(r=>!r.outAt);h=R.length?`<div class="list">${R.map(r=>`<div class="item"><div class="row1"><span>ورود <b>${esc(tmF(r.inAt))}</b></span><span>${r.outAt?'خروج <b>'+esc(tmF(r.outAt))+'</b> · '+esc(hrs(r)):'<span class="pill done">حاضر</span>'}</span></div></div>`).join('')}</div>`:'<p class="note">امروز هنوز ورودی ثبت نکرده‌اید.</p>';
      h+=!j.set?'<p class="msg err">مدیر هنوز اینترنت کلینیک را ثبت نکرده است.</p>':!j.inside?'<p class="msg err">این دستگاه به اینترنت (وای‌فای) کلینیک وصل نیست؛ ثبت فقط داخل کلینیک ممکن است.</p>':
        `<div class="btns"><button class="btn" type="button" data-attm="${open?'out':'in'}">${open?'ثبت خروج':'ثبت ورود'}</button></div>`}
    B.innerHTML=h;if(ROLE==='manager')attIpLoad()}catch(e){$('attB').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
const tmF=iso=>{try{return new Date(iso).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tehran'})}catch(e){return ''}};
const mins=r=>r.outAt?Math.max(0,Math.round((Date.parse(r.outAt)-Date.parse(r.inAt))/6e4)):0;
const hm=m=>fa(Math.floor(m/60))+':'+faD(String(m%60).padStart(2,'0'));
const hrs=r=>hm(mins(r))+' ساعت';
async function attIpLoad(op,k){try{const j=await api('attIps',op?{op,k,label:op==='add'?'اینترنت کلینیک':''}:{});const B=$('attIpB');if(!B)return;
  B.innerHTML=`<h3 class="pf-h">اینترنت کلینیک</h3><p class="note">از یک دستگاه که به وای‌فای کلینیک وصل است «ثبت اینترنت همین دستگاه» را بزنید. اگر کلینیک چند اینترنت دارد، از هر کدام یک بار. اگر شرکت اینترنت آدرس را عوض کند، دوباره ثبت کنید.</p>
   <div class="list">${(j.ips||[]).map(x=>`<div class="item"><div class="row1"><span class="ltr">${esc(x.k)}${x.k===j.mine?' <span class="pill done">همین دستگاه</span>':''}</span><button class="btn sm ghost" type="button" data-attipdel="${esc(x.k)}">حذف</button></div></div>`).join('')||'<div class="empty">هنوز ثبت نشده.</div>'}</div>
   <div class="btns"><button class="btn sm" type="button" id="attIpAdd"${(j.ips||[]).some(x=>x.k===j.mine)?' disabled':''}>ثبت اینترنت همین دستگاه به‌عنوان اینترنت کلینیک</button></div>`}catch(e){toast(e.message,1)}}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.id==='attBtn'){attOpen();return}
  if(t.id==='attClose'){$('attSheet').hidden=true;return}
  if(t.dataset.attm){const m=$('attMsg');t.disabled=true;try{await api('attMark',{type:t.dataset.attm});m.className='msg ok';m.textContent=t.dataset.attm==='in'?'ورود ثبت شد.':'خروج ثبت شد.';attLoad()}catch(err){m.className='msg err';m.textContent=err.message;t.disabled=false}return}
  if(t.id==='attIpAdd'){t.disabled=true;await attIpLoad('add');attLoad();return}
  if(t.dataset.attipdel){if(!arm2(t))return;await attIpLoad('del',t.dataset.attipdel);return}});

/* -- manager: attendance report + performance per person -- */
const ATP={from:'',to:''};
async function loadAttPerf(){const W=$('apW');if(!W)return;const p={};const f=parseJ(ATP.from),to=parseJ(ATP.to);if(f)p.from=f;if(to)p.to=to;
  $('apAtt').innerHTML=$('apPerf').innerHTML='<div class="empty">در حال بارگذاری…</div>';
  try{const [a,pf]=await Promise.all([api('attReport',p),api('perf',p)]);
    $('apRange').textContent='از '+jDay(a.from)+' تا '+jDay(a.to);
    const by={};(a.rows||[]).forEach(r=>{const x=by[r.uid]=by[r.uid]||{name:r.name,role:r.role,days:new Set(),m:0,open:0,rows:[]};x.days.add(r.day);x.m+=mins(r);if(!r.outAt)x.open++;x.rows.push(r)});
    const P=Object.values(by).sort((x,y)=>y.m-x.m);
    $('apAtt').innerHTML=P.length?`<table class="tbl"><thead><tr><th>نام</th><th>روز حضور</th><th>جمع ساعت</th><th>میانگین روزانه</th><th>خروج ثبت‌نشده</th></tr></thead><tbody>${P.map(x=>`<tr><td><b>${esc(x.name)}</b><br><small class="note">${esc(ROLE_LBL[x.role]||x.role)}</small></td><td>${fa(x.days.size)}</td><td>${hm(x.m)}</td><td>${hm(Math.round(x.m/Math.max(1,x.days.size)))}</td><td>${x.open?'<b class="late">'+fa(x.open)+'</b>':'—'}</td></tr>`).join('')}</tbody></table>
      <details style="margin-top:8px"><summary>جزئیات روزبه‌روز</summary><div class="list">${(a.rows||[]).slice().reverse().map(r=>`<div class="item"><div class="row1"><span><b>${esc(r.name)}</b> · ${esc(jDay(r.day))}</span><span>${esc(tmF(r.inAt))} تا ${r.outAt?esc(tmF(r.outAt))+' · '+esc(hrs(r)):'<b class="late">بدون خروج</b>'}</span></div></div>`).join('')}</div></details>`:'<div class="empty">در این بازه ورودی ثبت نشده. هر نفر با حساب شخصی، از اینترنت کلینیک، دکمه‌ی ⏱ بالای صفحه را می‌زند.</div>';
    const pp=pf.people||[],mx=Math.max(1,...pp.map(x=>x.n));
    $('apPerf').innerHTML=(pp.length?`<div class="hbars">${pp.map(x=>{const top=Object.entries(x.acts).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k,n])=>(ACT_L[k]||k)+' '+fa(n)).join('، ');
        return `<div class="pfr"><div class="hbar"><span><b>${esc(x.name)}</b><br><small class="note">${esc(ROLE_LBL[x.role]||x.role)}</small></span><span class="tr"><i style="width:${Math.round(x.n*100/mx)}%"></i></span><span class="v">${fa(x.n)} کار</span></div>
          <div class="note">${esc(top)}${x.pay?' · پرداخت ثبت‌شده '+money(x.pay):''}${x.ap?' · نوبت انجام‌شده '+fa(x.ap.done)+(x.ap.noshow?'، نیامده '+fa(x.ap.noshow):''):''}</div></div>`}).join('')}</div>`:'<div class="empty">در این بازه کاری ثبت نشده.</div>')+
      ((pf.docs||[]).length?`<h3 class="pf-h">پزشکان (طرح‌های ساخته‌شده در این بازه)</h3><table class="tbl"><thead><tr><th>پزشک</th><th>طرح</th><th>پذیرفته‌شده</th><th>درصد پذیرش</th><th>مبلغ پذیرفته‌شده</th></tr></thead><tbody>${pf.docs.map(d=>`<tr><td>${esc(d.doc)}</td><td>${fa(d.plans)}</td><td>${fa(d.conf)}</td><td>${fa(Math.round(d.conf*100/Math.max(1,d.plans)))}٪</td><td>${money(d.value)}</td></tr>`).join('')}</tbody></table>`:'')+
      '<p class="note">شمار کارها از سابقه‌ی تغییرات می‌آید (هر ثبت، پرداخت، نوبت و…). کارهای با رمز مشترک جدا نمایش داده می‌شود؛ برای سنجش دقیق هر نفر، همه با حساب شخصی کار کنند.</p>'}
  catch(e){$('apAtt').innerHTML=`<div class="empty">${esc(e.message)}</div>`;$('apPerf').innerHTML=''}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;if(t.id==='apGo'){ATP.from=$('ap_from').value.trim();ATP.to=$('ap_to').value.trim();loadAttPerf()}});

/* -- simple accounting: expenses, daily cash close, income/expense report, debtors -- */
const EXPC=[['salary','حقوق و دستمزد'],['rent','اجاره'],['supply','مواد مصرفی'],['lab','لابراتوار'],['implant','ایمپلنت و قطعات'],['ads','تبلیغات'],['bills','قبوض و شارژ'],['equip','تجهیزات و تعمیرات'],['other','سایر']],EXPCL=Object.fromEntries(EXPC);
const PAYM={cash:'نقد',card:'کارت',bank:'واریز بانکی',chq:'چک'};
const ACC={day:'',from:'',to:''};
function accInit(){if(!$('ac_day').value)$('ac_day').value=todayJ();if(!$('ae_day').value)$('ae_day').value=todayJ();$('ae_cat').innerHTML=EXPC.map(([k,l])=>`<option value="${k}">${l}</option>`).join('');loadCash();loadAccRep()}
async function loadCash(){const day=parseJ($('ac_day').value.trim())||tDay();
  try{await ensurePos();const j=await api('cashDay',{day}),c=j.closed;ACC.cash=j;
    $('acBox').innerHTML=`<div class="kpis"><div class="kpi"><b>${fa(j.cashIn)}</b><span>دریافت نقدی</span></div><div class="kpi"><b>${fa(j.cardIn)}</b><span>کارتخوان</span></div><div class="kpi"><b>${fa(j.chqSum)}</b><span>${fa(j.chqN)} چک دریافتی</span></div><div class="kpi"><b>${fa(j.cashOut)}</b><span>هزینه‌ی نقدی</span></div></div>
      ${posBreak(j.pays)}<div class="diffbox" style="margin-top:10px">نقد مورد انتظار در صندوق: <b>${money(j.expected)}</b>${c?`<br>صندوق بسته شد: شمرده‌شده <b>${money(c.counted)}</b> · ${c.diff===0?'<b>بدون اختلاف</b>':c.diff>0?'<b>'+money(c.diff)+' بیشتر</b>':'<b class="late">'+money(-c.diff)+' کمتر</b>'} · ${esc(c.by||'')} ${esc(jt(c.at))}${c.note?' · «'+esc(c.note)+'»':''}`:''}</div>
      <div class="fields" style="margin-top:8px"><label class="f">نقد شمرده‌شده‌ی صندوق (تومان)<input id="ac_cnt" inputmode="numeric" value="${c?fa(c.counted):''}"></label><label class="f">توضیح<input id="ac_note" value="${c?esc(c.note||''):''}"></label></div>
      ${ROLE==='manager'?'':c&&ROLE!=='accountant'?'<p class="note">صندوق این روز بسته شده است؛ بستن دوباره فقط با ورود حسابدار ممکن است.</p>':`<div class="btns"><button class="btn" type="button" id="acClose">${c?'بستن دوباره‌ی صندوق':'بستن صندوق این روز'}</button></div>`}<div class="msg" id="acMsg"></div>
      <h3 class="pf-h">دریافت‌های این روز <small class="note">${fa(j.pays.length)}</small></h3><div class="list">${j.pays.map(p=>`<div class="item"><div class="row1"><span><b>${esc(p.name||'')}</b> · ${esc(PAYM[p.kind]||p.kind)}${p.pos?' · '+esc(posName(p.pos)||'؟'):''}${p.st==='del'?' <span class="pill bad">حذف‌شده</span>':''}</span><span>${money(p.amount)} <small class="note">${esc(tmF(p.at))}${p.by?' · '+esc(p.by):''}</small></span></div></div>`).join('')||'<div class="empty">دریافتی ثبت نشده.</div>'}</div>
      <h3 class="pf-h">هزینه‌های این روز</h3><div class="list">${j.exps.map(x=>`<div class="item"><div class="row1"><span><b>${esc(EXPCL[x.cat]||x.cat)}</b> · ${esc(PAYM[x.pay]||x.pay)}${x.note?' · '+esc(x.note):''}<br><small class="note">${esc(x.by||'')}</small></span><span>${money(x.amount)} <button class="btn sm ghost" type="button" data-expdel="${esc(x.id)}">حذف</button></span></div></div>`).join('')||'<div class="empty">هزینه‌ای ثبت نشده.</div>'}</div>`}
  catch(e){$('acBox').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
async function loadAccRep(){const p={},f=parseJ($('ar_from').value.trim()),to=parseJ($('ar_to').value.trim());if(f)p.from=f;if(to)p.to=to;
  try{await ensurePos();const j=await api('accReport',p),I=j.inc,ex=Object.values(j.exp).reduce((a,b)=>a+b,0),got=I.cash+I.card+I.chq;
    $('arBox').innerHTML=`<p class="note">از ${esc(jDay(j.from))} تا ${esc(jDay(j.to))}</p><div class="kpis"><div class="kpi"><b>${fa(got)}</b><span>درآمد وصول‌شده</span></div><div class="kpi"><b>${fa(ex)}</b><span>هزینه‌ها</span></div><div class="kpi"><b class="${got-ex<0?'late':''}">${fa(got-ex)}</b><span>مانده (درآمد − هزینه)</span></div><div class="kpi"><b>${fa(I.chqWait)}</b><span>چک‌های سررسید این بازه، وصول‌نشده</span></div></div>
      <table class="tbl" style="margin-top:10px"><tbody><tr><td>نقد</td><td>${money(I.cash)}</td></tr><tr><td>کارتخوان</td><td>${money(I.card)}</td></tr>${(j.byPos||[]).map(b=>`<tr><td>&nbsp;&nbsp;↳ ${esc(b.id?(posName(b.id)||'؟'):'کارت‌به‌کارت / بدون کارتخوان')} <small class="note">${fa(b.n)} دریافت</small></td><td>${money(b.s)}</td></tr>`).join('')}<tr><td>چک وصول‌شده</td><td>${money(I.chq)}</td></tr>${I.chqBounce?`<tr><td><b class="late">چک برگشتی</b></td><td>${money(I.chqBounce)}</td></tr>`:''}
      ${EXPC.filter(([k])=>j.exp[k]).map(([k,l])=>`<tr><td>هزینه: ${l}</td><td>${money(j.exp[k])}</td></tr>`).join('')}${j.exp.refund?`<tr><td>استرداد به بیماران</td><td>${money(j.exp.refund)}</td></tr>`:''}</tbody></table>
      <h3 class="pf-h">بدهکاران (پرداخت را شروع کرده‌اند و مانده دارند) <small class="note">جمع ${money(j.debtSum)}</small></h3>
      <div class="list">${j.debt.map(d=>`<div class="item"><div class="row1"><div><span class="nm">${esc(d.name)}</span><div class="meta">کل ${money(d.total)} · پرداخت ${money(d.paid)}${d.wait?' · چک در راه '+money(d.wait):''}${d.phone?' · '+esc(faD(d.phone)):''}</div></div><div class="acts"><b>${money(d.rest)}</b><button class="btn sm ghost" type="button" data-wbfile="${esc(d.id)}" data-wbn="${esc(d.name)}">پرونده</button></div></div></div>`).join('')||'<div class="empty">بدهکاری نیست.</div>'}</div>`+fx4CredHTML(j)+posMgrHTML()}
  catch(e){$('arBox').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.id==='tabAcc'){if(dirty&&!$('viewForm').hidden){alertMsg('اول فرم را ذخیره کنید.');return}show('acc');return}
  if(t.id==='acGo'){loadCash();return}
  if(t.id==='arGo'){loadAccRep();return}
  if(t.id==='acClose'){const m=$('acMsg'),day=parseJ($('ac_day').value.trim())||tDay();if(!$('ac_cnt').value.trim()){m.className='msg err';m.textContent='نقد شمرده‌شده را بنویسید (اگر صفر است، ۰).';return}
    t.disabled=true;try{const j=await api('cashClose',{day,counted:mnum($('ac_cnt').value),note:$('ac_note').value});toast(j.diff===0?'صندوق بدون اختلاف بسته شد.':'صندوق بسته شد؛ اختلاف '+money(Math.abs(j.diff))+(j.diff>0?' بیشتر':' کمتر'),j.diff<0);loadCash()}catch(err){m.className='msg err';m.textContent=err.message;t.disabled=false}return}
  if(t.id==='aeAdd'){const m=$('aeMsg'),day=parseJ($('ae_day').value.trim());if(!day){m.className='msg err';m.textContent='تاریخ را درست بنویسید (مثل ۱۴۰۵/۰۸/۰۱).';return}
    t.disabled=true;try{await api('expAdd',{sendId:uuid(),e:{day,cat:$('ae_cat').value,amount:mnum($('ae_amt').value),pay:$('ae_pay').value,note:$('ae_note').value}});m.className='msg ok';m.textContent='هزینه ثبت شد.';$('ae_amt').value='';$('ae_note').value='';loadCash();loadAccRep()}catch(err){m.className='msg err';m.textContent=err.message}finally{t.disabled=false}return}
  if(t.dataset.expdel){if(!arm2(t))return;t.disabled=true;try{await api('expDel',{eid:t.dataset.expdel});loadCash();loadAccRep()}catch(err){toast(err.message,1)}return}});
document.addEventListener('input',e=>{const t=e.target;if(t&&(t.id==='ae_amt'||t.id==='ac_cnt')){const n=mnum(t.value);t.value=n?fa(n):''}});

