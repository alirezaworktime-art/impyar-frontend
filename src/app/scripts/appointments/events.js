/* ---------- events ---------- */
document.addEventListener('click',async e=>{const t=e.target.closest('button,a');if(!t)return;
  if(t.id==='tabCal'||t.hasAttribute('data-gocal')){if(t.dataset.cmode)calSetMode(t.dataset.cmode);if(dirty&&!$('viewForm').hidden&&!t.dataset.armed){t.dataset.armed='1';alertMsg('تغییرات این فرم ذخیره نشده. برای رفتن دوباره بزنید.');setTimeout(()=>delete t.dataset.armed,4000);return}delete t.dataset.armed;dirty=false;show('cal');return}
  if(t.id==='tabPros'){if(dirty&&!$('viewForm').hidden&&!t.dataset.armed){t.dataset.armed='1';alertMsg('تغییرات این فرم ذخیره نشده. برای رفتن دوباره بزنید.');setTimeout(()=>delete t.dataset.armed,4000);return}delete t.dataset.armed;dirty=false;show('pros');return}
  if(t.id==='tabPday'){if(dirty&&!$('viewForm').hidden&&!t.dataset.armed){t.dataset.armed='1';alertMsg('تغییرات این فرم ذخیره نشده. برای رفتن دوباره بزنید.');setTimeout(()=>delete t.dataset.armed,4000);return}delete t.dataset.armed;dirty=false;show('pday');return}
  if(t.id==='tabLab'){show('lab');return}
  if(t.id==='tabDash'){show('dash');return}
  if(t.dataset.dper){DASH.per=t.dataset.dper;document.querySelectorAll('[data-dper]').forEach(b=>b.setAttribute('aria-pressed',b===t));renderDash();return}
  /* calendar */
  if(t.dataset.cday){const old=CAL.mode==='month'?jMonth(CAL.sel):[CAL.start,dAdd(CAL.start,6)];CAL.sel=t.dataset.cday;CAL.start=weekStart(CAL.sel);if(CAL.sel<old[0]||CAL.sel>old[1])loadCal();else renderCal();return}
  if(t.dataset.cmode&&!t.hasAttribute('data-gocal')){calSetMode(t.dataset.cmode);$('calList').innerHTML='<div class="empty">در حال بارگذاری…</div>';loadCal();return}
  if((t.id==='calPrev'||t.id==='calNext')&&CAL.mode==='month'){const [a,b]=jMonth(CAL.sel);CAL.sel=t.id==='calPrev'?jMonth(dAdd(a,-1))[0]:dAdd(b,1);const td=tDay();if(CAL.sel<=td&&jMonth(CAL.sel)[1]>=td)CAL.sel=td;CAL.start=weekStart(CAL.sel);$('calList').innerHTML='<div class="empty">در حال بارگذاری…</div>';loadCal();return}
  if(t.id==='calPrev'||t.id==='calNext'){CAL.start=dAdd(CAL.start,t.id==='calPrev'?-7:7);CAL.sel=CAL.start;$('calList').innerHTML='<div class="empty">در حال بارگذاری…</div>';loadCal();return}
  if(t.id==='calToday'){CAL.sel=tDay();CAL.start=weekStart(CAL.sel);loadCal();return}
  if(t.id==='calNew'){openAppt({day:CAL.sel>=tDay()?CAL.sel:''});return}
  if(t.dataset.aedit){const a=[...CAL.items,...QAPPT,...((PF&&PF.j&&PF.j.appts)||[])].find(x=>x.id===t.dataset.aedit);if(a)openAppt(Object.assign({},a,{aid:a.id}));return}
  if(t.dataset.ast){if(t.dataset.ast==='cancel'&&!t.dataset.armed){t.dataset.armed='1';t.textContent='لغو شود؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='لغو'}},4000);return}
    t.disabled=true;try{await api('apptSet',{aid:t.dataset.aid,st:t.dataset.ast});if(!$('viewCal').hidden)await loadCal();pollQ(true);if(PF&&!$('pfSheet').hidden)refreshFile()}catch(err){alertMsg(err.message)}finally{t.disabled=false}return}
  if(t.dataset.asms){api('apptSet',{aid:t.dataset.asms,sms:1},{prio:'bg'}).then(()=>{if(!$('viewCal').hidden)loadCal();pollQ(true)}).catch(()=>{});return}
  /* appointment sheet */
  if(t.dataset.apall&&AP){AP.grp='all';AP.mode='';apKindRender();return}
  if(t.dataset.apk){AP.kind=t.dataset.apk;document.querySelectorAll('[data-apk]').forEach(b=>b.setAttribute('aria-pressed',b===t));const d=$('ap_dur');if(!AP.aid)d.value=String(aDur(AP.kind));$('apOnlW').hidden=!AGRP.sg.includes(AP.kind);apConflicts();return}
  if(t.dataset.apd){$('ap_day').value=jDay(t.dataset.apd);apDayHint();if(!CAL.items.some(a=>a.day===t.dataset.apd)){api('apptList',{from:t.dataset.apd,to:t.dataset.apd},{prio:'bg'}).then(j=>{CAL.items=CAL.items.filter(a=>a.day!==t.dataset.apd).concat(j.items||[]);apConflicts()}).catch(()=>{})}return}
  if(t.dataset.appick){AP.plan=t.dataset.appick;AP.name=t.dataset.apn;AP.phone=t.dataset.app;AP.free=false;if(!AP.phone){const x=QITEMS.find(v=>v.id===AP.plan);if(x)AP.phone=x.phone||''}
    if(!AP.phone&&CF_ON)api('get',{id:AP.plan},{prio:'bg'}).then(j=>{const h=((j.data||{}).h)||{};if(AP&&AP.plan===j.id&&h.phone){AP.phone=h.phone;renderApWho()}}).catch(()=>{});renderApWho();return}
  if(t.hasAttribute('data-apfree')){const q=($('ap_q')||{}).value||'';AP.free=true;AP.plan='';AP.name=q.trim();renderApWho();return}
  if(t.id==='apChg'){AP.free=false;AP.plan='';AP.name='';AP.phone='';renderApWho();return}
  if(t.id==='apSave'){apSave(t);return}
  if(t.id==='apClose'){$('apSheet').hidden=true;return}
  if(t.dataset.tbook){const k=TASKS.find(x=>x.id===t.dataset.tbook);if(k)openAppt({plan:k.plan,name:k.name,phone:k.phone,note:pr2TaskNote(k),kind:{pfail:'rmv',repair:'rpr',uncover:'uncover',recall:'check',aexam:'check',labready:(k.info&&k.info.split('|')[1])||'tryin',suture:'suture',book:'surg',impr:'impr',reno:(APPT_K_OK.includes(k.info)?k.info:'other')}[k.kind]||'other',task:k.id,lock:1});return}
  /* prosthesis */
  if(t.dataset.prf){PR.f=t.dataset.prf;renderPros();return}
  if(t.dataset.pnext){if(t.dataset.pst==='done'&&!t.dataset.armed){t.dataset.armed='1';const o=t.textContent;t.textContent='تحویل شد؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent=o}},4000);return}prosSet(t.dataset.pnext,t.dataset.pst,'',t);return}
  if(t.id==='loOpen'){loInit(PF.j);renderFile();return}
  if(t.id==='loCancel'){LO=null;renderFile();return}
  if(t.dataset.lot){loRead();const k=t.dataset.lot;LO.teeth=LO.teeth.includes(k)?LO.teeth.filter(x=>x!==k):LO.teeth.concat(k);t.setAttribute('aria-pressed',LO.teeth.includes(k));return}
  if(t.dataset.lofor&&LO){loRead();LO.for=t.dataset.lofor;document.querySelectorAll('[data-lofor]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lofor===LO.for));return}
  if(t.dataset.lo){loRead();const g=t.dataset.lo;LO[g]=LO[g]===t.dataset.lov?'':t.dataset.lov;document.querySelectorAll(`[data-lo="${g}"]`).forEach(b=>b.setAttribute('aria-pressed',LO[g]===b.dataset.lov));return}
  if(t.id==='loSend'){loSend(t);return}
  if(t.dataset.book!==undefined&&PF){bookFromFile(t.dataset.book);return}
  /* lab */
  if(t.dataset.lbs){LB.seg=t.dataset.lbs;renderLab();return}
  if(t.dataset.lbset){if(t.dataset.lbset==='cancel'&&!t.dataset.armed){t.dataset.armed='1';t.textContent='لغو شود؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='لغو سفارش'}},4000);return}labSet(t.dataset.lid,t.dataset.lbset,'',t);return}
  if(t.dataset.lbsend){const i=document.querySelector(`[data-lbmsg="${t.dataset.lbsend}"]`);const v=(i&&i.value||'').trim();if(!v){if(i)i.focus();return}labSet(t.dataset.lbsend,'',v,t);if(i)i.value='';return}
  if(t.dataset.lbredo){const i=document.querySelector(`[data-lbmsg="${t.dataset.lbredo}"]`);const v=(i&&i.value||'').trim();if(!v){alertMsg('در کادر پیام بنویسید چه اصلاحی لازم است، بعد «برگشت به لابراتوار» را بزنید.');if(i)i.focus();return}labSet(t.dataset.lbredo,'redo',v,t);return}
  /* patient file tabs */
  if(t.dataset.pft){PF.tab=t.dataset.pft;LO=null;renderFile();return}
  if(t.dataset.pyk!==undefined){pyRead();PYF.kind=t.dataset.pyk;renderFile();if(PYF.kind==='card'&&!POSL)ensurePos().then(()=>{if(PF)renderFile()});return}
  if(t.dataset.pyp!==undefined){pyRead();PYF.part=t.dataset.pyp;renderFile();return}
  if(t.dataset.pysug){pyRead();const [k,p,a]=t.dataset.pysug.split('|');PYF.kind=k;PYF.part=p;PYF.amount=fmtInput(a);renderFile();if(k==='chq'){const d=$('py_due');if(d)d.focus()}return}
  if(t.dataset.pydq){$('py_due').value=jDay(t.dataset.pydq);pyDueHint();return}
  if(t.id==='pyAdd'){pyAdd(t);return}
  if(t.dataset.pyst){if(t.dataset.pyst==='del'&&!t.dataset.armed){t.dataset.armed='1';t.textContent='حذف شود؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='حذف'}},4000);return}
    t.disabled=true;try{await api('paySet',{pid:t.dataset.pid,st:t.dataset.pyst});toast(t.dataset.pyst==='ok'?'وصول ثبت شد.':t.dataset.pyst==='bounce'?'برگشت چک ثبت شد.':'پرداخت حذف شد.');pollQ(true);if(PF&&!$('pfSheet').hidden)refreshFile()}catch(err){alertMsg(err.message)}finally{t.disabled=false}return}
  if(t.id==='pfLink'){openLink(false);return}
  if(t.id==='plRenew'){if(!t.dataset.armed){t.dataset.armed='1';t.textContent='لینک قبلی باطل شود؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='لینک تازه'}},4000);return}delete t.dataset.armed;t.textContent='لینک تازه';openLink(true);return}
  if(t.id==='plOff'){if(!t.dataset.armed){t.dataset.armed='1';t.textContent='غیرفعال شود؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='غیرفعال کردن لینک'}},4000);return}delete t.dataset.armed;t.textContent='غیرفعال کردن لینک';
    try{await api('patLink',{id:PF.id,off:true});$('plSheet').hidden=true;toast('لینک بیمار غیرفعال شد.');PF.j.link=false;renderFile()}catch(err){$('plMsg').className='msg err';$('plMsg').textContent=err.message}return}
  if(t.id==='plCopy'){try{await navigator.clipboard.writeText($('pl_url').value);toast('لینک کپی شد.')}catch(err){$('pl_url').select()}return}
  if(t.id==='plClose'){$('plSheet').hidden=true;return}
  /* consultant */
  if(t.id==='undBtn'){openUndecided();return}
  if(t.dataset.unw){UN.why=t.dataset.unw;document.querySelectorAll('[data-unw]').forEach(b=>b.setAttribute('aria-pressed',b===t));return}
  if(t.id==='unGo'){sendUndecided(t);return}
  if(t.id==='unClose'){$('unSheet').hidden=true;return}
  if(t.id==='undAll'){UND_ALL=!UND_ALL;renderConx();return}
  if(t.dataset.undto){if(t.dataset.undto==='lost'&&!t.dataset.armed){t.dataset.armed='1';t.textContent='مطمئنید؟ دوباره بزنید';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='انصراف قطعی'}},4000);return}
    t.disabled=true;try{const ur=await api('undecidedSet',{id:t.dataset.uid,to:t.dataset.undto});toast(t.dataset.undto==='back'?(ur&&ur.to==='consult'?'طرح به کارتابل مشاور برگشت تا تأیید و امضا شود.':'بیمار به صف نوبت‌دهی جراحی رفت.'):'انصراف بیمار ثبت شد.');pollQ(true)}catch(err){alertMsg(err.message)}finally{t.disabled=false}return}
  /* signature */
  if(t.id==='sgnClear'){const c=$('sgnPad');c.getContext('2d').clearRect(0,0,c.width,c.height);SG.drawn=false;return}
  if(t.id==='sgnClose'){$('sgnSheet').hidden=true;delete F._next;if(PK.undo){const u=PK.undo;dirty=!!u._dirty;delete u._dirty;Object.assign(F,u);PK.undo=null;CUR=1;renderForm()}return}
  if(t.id==='sgnOk'||t.id==='sgnSkip'){if(t.id==='sgnOk'){if(!SG.drawn){$('sgnMsg').className='msg err';$('sgnMsg').textContent='بیمار هنوز امضا نکرده.';return}F.sign=signData()}if(ex1GuardRead()===false)return;
    $('sgnSheet').hidden=true;PK.undo=null;const b=SG.btn||$('confirmBtn');b.dataset.signed='1';try{await finalize(b)}finally{delete b.dataset.signed}return}
});
function pyRead(){const g=id=>($(id)||{}).value;['amount','note','due','no','bank','repl'].forEach(k=>{const v=g('py_'+k);if(v!==undefined)PYF[k]=v})}
function pyDueHint(){const v=$('py_due').value.trim(),iso=parseJ(v),h=$('py_dueH');h.className='dhint'+(v&&!iso?' bad':'');h.textContent=v?(iso?dayHint(iso):'تاریخ را به شکل ۱۴۰۵/۰۹/۱۵ بنویسید.'):''}
/* pyAdd: base + fix7d M7 (the payments tab checks the amount itself too; the form may be redrawn between typing and the click) */
async function pyAdd(t){const i=$('py_amount');if(i&&fx7IsBad(i)){fx7Mark(i,true);const m=$('pyMsg');if(m){m.className='msg err';m.textContent=FX7_AMT_MSG}return}
  pyRead();const m=$('pyMsg'),amount=num(PYF.amount);if(!amount){m.className='msg err';m.textContent='مبلغ را وارد کنید.';return}
  const due=PYF.kind==='chq'?parseJ(PYF.due||''):'';if(PYF.kind==='chq'&&!due){m.className='msg err';m.textContent='تاریخ سررسید چک را درست وارد کنید.';return}
  if(PYF.kind==='card'&&!PYF.pos){m.className='msg err';m.textContent='کارتخوان (یا کارت‌به‌کارت) را انتخاب کنید.';return}if(PYF.kind==='card'&&PYF.pos==='xfer'&&!PYF.acct){m.className='msg err';m.textContent='حساب مقصد کارت‌به‌کارت را انتخاب کنید.';return}if(PYF.kind==='chq'&&(!PYF.ctype||!PYF.payee)){m.className='msg err';m.textContent='نوع چک (صیادی / دیجیتال) و «در وجه» را انتخاب کنید.';return}
  t.disabled=true;if(!t.dataset.sid)t.dataset.sid=uuid();
  try{await api('payAdd',{id:PF.id,pay:{kind:PYF.kind,part:PYF.part,amount,due,no:PYF.no||'',bank:PYF.bank||'',note:((PYF.kind==='chq'&&(PYF.repl||'').trim())?'جایگزین چک شماره‌ی '+faD((PYF.repl||'').trim())+(PYF.note?' — ':''):'')+(PYF.note||''),pos:PYF.kind==='card'?posId(PYF.pos):'',acct:PYF.kind==='card'&&PYF.pos==='xfer'?PYF.acct||'':'',ctype:PYF.kind==='chq'?PYF.ctype||'':'',payee:PYF.kind==='chq'?PYF.payee||'':''},sendId:t.dataset.sid});delete t.dataset.sid;
    toast(`${PAY_K[PYF.kind]} ${fa(amount)} تومان ثبت شد.`);PYF={kind:PYF.kind,part:PYF.part,bank:PYF.kind==='chq'?PYF.bank:'',ctype:PYF.kind==='chq'?PYF.ctype:'',payee:PYF.kind==='chq'?PYF.payee:''};refreshFile();pollQ(true)}
  catch(e){m.className='msg err';m.textContent=e.message;t.disabled=false}}
document.addEventListener('input',e=>{const i=e.target;if(i.id==='ap_q'){apSearch();return}if(i.id==='ap_day'){apDayHint();return}if(i.id==='ap_time'||i.id==='ap_dur'||i.id==='ap_doc'){apConflicts();return}
  if(i.id==='py_amount'){i.value=fmtInput(i.value);return}if(i.id==='py_due'){pyDueHint();return}
  if(i.id==='lo_due'){const iso=parseJ(i.value),h=$('lo_dueH');h.className='dhint'+(i.value&&!iso?' bad':'');h.textContent=iso?dayHint(iso):'تاریخ را به شکل ۱۴۰۵/۰۸/۱۵ بنویسید.';return}
  if(i.id==='prQ'){renderPros();return}});
document.addEventListener('change',e=>{if(['ap_time','ap_dur','ap_doc'].includes(e.target.id))apConflicts()});
/* settings: extra fields */
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t||t.id!=='tabSet')return;
  $('set_docs').value=(SET.docs||[]).join('\n');$('set_surgeon').value=SET.surgeon||'';if($('set_prosdoc'))$('set_prosdoc').value=SET.prosDoc||'';$('set_assts').value=(SET.assts||[]).join('\n');$('set_cap').value=SET.cap?String(SET.cap):'';$('set_consent').value=SET.consent||DEFAULT_CONSENT;{const w=$('set_cons2');if(w){const C=Object.assign({},CONS2_DEF,SET.cons2||{});w.innerHTML='<p class="note">بندهای تکمیلی رضایت‌نامه — هر بند فقط وقتی به متن امضا اضافه می‌شود که خدمت مربوط در طرح باشد:</p>'+Object.keys(CONS2_DEF).map(k=>`<label class="f">${esc(CONS2_L[k])}<textarea data-cons2="${k}" rows="3">${esc(C[k]||'')}</textarea></label>`).join('')}}$('set_labpw').value='';$('set_mgrpw').value='';
  $('set_labpwN').textContent=SET.labPwSet?'رمز لابراتوار تعیین شده است؛ برای عوض کردن رمز تازه بنویسید.':'هنوز رمزی برای لابراتوار تعیین نشده (حداقل ۴ حرف، متفاوت با رمزهای دیگر).';
  $('set_mgrpwN').textContent=SET.mgrPwSet?'رمز مدیر تعیین شده است؛ برای عوض کردن رمز تازه بنویسید.':'هنوز رمزی برای مدیر تعیین نشده (حداقل ۴ حرف، متفاوت با رمزهای دیگر).'});

