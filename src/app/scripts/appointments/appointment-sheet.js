/* ---------- appointment sheet ---------- */
let AP=null;
var BK1={day:''};   // bk1: the day picked in the booking review (read once by openAppt)
function docList(){const L=(SET.docs||[]).filter(Boolean);if(!L.length&&SET.doctor)L.push(SET.doctor.split('·')[0].trim());return L}
/* kinds: in a reception booking mode (appt1: surgery / prosthesis / other) only that mode's kinds; otherwise grouped */
function apKindRender(){
  if(AP&&AP.mode&&BKM[AP.mode]){const M=BKM[AP.mode];
    $('apKind').innerHTML=`<div class="akg bkk"><div class="chips">${M.k.map(k=>`<button type="button" class="chip" data-apk="${k}" aria-pressed="${k===AP.kind}">${esc(BKL[k]||AKL[k]||k)}</button>`).join('')}</div></div><button type="button" class="btn sm ghost" data-apall="1" style="margin-top:6px">نمایش همه‌ی انواع نوبت</button>`;return}
  const G={sg:['sg','cs'],pr:['pr','cp']}[AP.grp];
  $('apKind').innerHTML=[['جراحی','sg'],['پروتز','pr'],['چکاپ جراحی','cs'],['چکاپ پروتز','cp'],['سایر','ot']].filter(([l,g])=>AP.book?g==='sg':!G||G.includes(g)).map(([l,g])=>`<div class="akg"><small>${l}</small><div class="chips">${AGRP[g].map(k=>`<button type="button" class="chip" data-apk="${k}" aria-pressed="${k===AP.kind}">${AKL[k]}</button>`).join('')}</div></div>`).join('')+(!AP.book&&G?`<button type="button" class="btn sm ghost" data-apall="1" style="margin-top:6px">نمایش همه‌ی انواع نوبت</button>`:'')}
/* o.mode (appt1): reception booking mode → its title and kinds; BK1.day (bk1): the day picked in the booking review */
function openAppt(o){o=o||{};if(BK1.day&&!o.day)o=Object.assign({},o,{day:BK1.day});BK1.day='';
  const td=tDay();AP=Object.assign({aid:'',plan:'',name:'',phone:'',kind:'surg',day:'',time:'',dur:0,doc:'',note:'',task:'',onl:'',book:0},o);
  if(!AP.dur)AP.dur=aDur(AP.kind);AP.grp=o.grp||(o.kind?apG(o.kind):'')||'all';
  $('apTitle').textContent=AP.aid?'جابه‌جایی / ویرایش نوبت':AP.book?'اخذ نوبت جراحی (بیمار تلفنی)':'نوبت جدید';$('ap_onl').checked=String(AP.onl)==='1';$('apOnlW').hidden=!AGRP.sg.includes(AP.kind);$('apMsg').textContent='';$('apWarn').hidden=true;
  renderApWho();
  apKindRender();
  $('ap_day').value=AP.day?jDay(AP.day):'';
  const tms=[];for(let h=7;h<=21;h++)for(const m of [0,15,30,45])tms.push(String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'));
  $('ap_time').innerHTML='<option value="">— ساعت —</option>'+tms.map(t=>`<option value="${t}"${t===AP.time?' selected':''}>${faD(t)}</option>`).join('');
  $('ap_dur').innerHTML=[15,20,30,45,60,90,120,150,180,240].map(n=>`<option value="${n}"${n===Number(AP.dur)?' selected':''}>${fa(n)} دقیقه</option>`).join('');
  const D=docList();if(AP.doc&&!D.includes(AP.doc))D.push(AP.doc);$('ap_doc').innerHTML='<option value="">—</option>'+D.map(n=>`<option${n===AP.doc||(!AP.doc&&!AP.aid&&D.length===1)?' selected':''}>${esc(n)}</option>`).join('');
  $('ap_note').value=AP.note||'';
  $('apQuick').innerHTML=[['امروز',td],['فردا',dAdd(td,1)],['پس‌فردا',dAdd(td,2)],['یک هفته بعد',dAdd(td,7)],['دو هفته بعد',dAdd(td,14)],['یک ماه بعد',mAdd(td,1)],['سه ماه بعد',mAdd(td,3)]].map(([l,d])=>`<button type="button" class="chip" data-apd="${d}">${l}</button>`).join('');
  apDayHint();$('apSheet').hidden=false;if(!AP.name)setTimeout(()=>{const q=$('ap_q');if(q)q.focus()},50);if(!listLoaded&&CF_ON)loadList();
  if(o.mode&&AP){AP.mode=o.mode;$('apTitle').textContent=BKM[o.mode].t;apKindRender()}}
function renderApWho(){const el=$('apWho');
  if(AP.name&&!AP.free){el.innerHTML=`<div class="who"><div><b>${esc(AP.name)}</b>${AP.phone?` <span class="note">${esc(faD(AP.phone))}</span>`:''}</div>${AP.aid||AP.lock?'':'<button class="btn sm ghost" type="button" id="apChg">تغییر بیمار</button>'}</div>`;return}
  if(AP.free){el.innerHTML=`<div class="fields"><label class="f">نام بیمار *<input id="ap_name" value="${esc(AP.name)}"></label><label class="f">موبایل<input id="ap_phone" class="ltr" inputmode="tel" value="${esc(AP.phone)}"></label></div><button class="btn sm ghost" type="button" id="apChg">جستجو در پرونده‌ها</button>`;return}
  el.innerHTML=`<label class="f">بیمار<input id="ap_q" placeholder="نام، کد ملی یا موبایل بیمار را بنویسید"></label><div class="qres" id="apRes"></div>`;apSearch()}
function apSearch(){const box=$('apRes');if(!box)return;const q=toEn(($('ap_q')||{}).value||'').trim().toLowerCase();
  const pool=[...QITEMS.map(x=>({id:x.id,name:x.name,nid:x.nid,phone:x.phone})),...ARCHIVE.filter(d=>!QITEMS.some(x=>x.id===d.id)).map(d=>({id:d.id,name:d.name,nid:d.nid,phone:'',st:d.status}))];
  const hits=q?pool.filter(x=>String(x.name||'').toLowerCase().includes(q)||toEn(x.nid||'').includes(q)||toEn(x.phone||'').includes(q)).slice(0,12):[];
  box.innerHTML=hits.map(x=>`<button type="button" data-appick="${esc(x.id)}" data-apn="${esc(x.name||'')}" data-app="${esc(x.phone||'')}">${esc(x.name||'بدون نام')}<small>${x.nid?'کد ملی '+esc(faD(x.nid)):''}${x.phone?' · '+esc(faD(x.phone)):''}</small></button>`).join('')+
    `<button type="button" data-apfree>${q?'بیمار بدون پرونده: '+esc($('ap_q').value):'بیمار بدون پرونده (فقط نام و موبایل)'}</button>`}
function apDayHint(){const v=$('ap_day').value.trim(),iso=parseJ(v),h=$('ap_dayH');AP.day=iso;h.className='dhint'+(v&&!iso?' bad':'');h.textContent=v?(iso?dayHint(iso):'تاریخ را به شکل ۱۴۰۵/۰۸/۱۵ بنویسید.'):'';apConflicts()}
function apConflicts(){const w=$('apWarn');if(!AP.day){w.hidden=true;return}const same=(CAL.items||[]).filter(a=>a.day===AP.day&&a.st!=='cancel'&&a.id!==AP.aid),cap=Number(SET.cap)||0,M=[];
  const sg=same.filter(a=>a.kind==='surg').length;if(AP.kind==='surg'&&cap&&sg>=cap)M.push(`ظرفیت جراحی این روز (${fa(cap)}) پر شده؛ ${fa(sg)} جراحی ثبت است.`);
  const tm=$('ap_time').value;if(tm){const toM=t=>+t.slice(0,2)*60+ +t.slice(3),s=toM(tm),e=s+Number($('ap_dur').value||0),doc=$('ap_doc').value;
    const clash=same.filter(a=>(!doc||!a.doc||a.doc===doc)&&toM(a.time)<e&&toM(a.time)+Number(a.dur||30)>s);if(clash.length)M.push('هم‌زمان با نوبت '+clash.map(a=>esc(a.name)+' ('+faD(a.time)+')').join('، '))}
  if(new Date(AP.day+'T12:00:00Z').getUTCDay()===5)M.push('این روز جمعه است.');
  w.hidden=!M.length;w.innerHTML=M.join('<br>')}
async function apSave(t){const m=$('apMsg');if(AP.free){AP.name=($('ap_name').value||'').trim();AP.phone=($('ap_phone').value||'').trim()}
  const a={plan:AP.plan,name:AP.name,phone:AP.phone,day:AP.day,time:$('ap_time').value,dur:$('ap_dur').value,kind:AP.kind,doc:$('ap_doc').value,note:$('ap_note').value.trim(),by:($('rc_asst')||{}).value||'',onl:AGRP.sg.includes(AP.kind)?($('ap_onl').checked?'1':'0'):''};
  if(!a.name&&a.plan){try{const nm=await fx7aAskName(a.plan);if(nm)a.name=AP.name=nm}catch(e){m.className='msg err';m.textContent=e.message;return}if(!a.name){m.className='msg err';m.textContent='برای گرفتن نوبت، نام بیمار لازم است؛ نام را در همین پنجره بنویسید.';return}}if(!a.name){m.className='msg err';m.textContent='بیمار را انتخاب کنید.';return}if(!a.day){m.className='msg err';m.textContent='تاریخ را درست وارد کنید.';return}if(!a.time){m.className='msg err';m.textContent='ساعت را انتخاب کنید.';return}
  t.disabled=true;m.className='msg';m.textContent='در حال ثبت…';if(!t.dataset.sid)t.dataset.sid=uuid();
  try{await api('apptSave',{appt:a,aid:AP.aid,task:AP.task,sendId:t.dataset.sid});delete t.dataset.sid;$('apSheet').hidden=true;
    toast(`نوبت ${AKL[a.kind]} ${a.name}: ${wDay(a.day)} ${jDay(a.day)} ساعت ${faD(a.time)}`);CAL.sel=a.day;CAL.start=weekStart(a.day);if(!$('viewCal').hidden)loadCal();pollQ(true);if(PF&&!$('pfSheet').hidden)refreshFile()}
  catch(e){m.className='msg err';m.textContent=e.message}finally{t.disabled=false}}

