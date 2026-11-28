/* ---------- archive ---------- */
function statusPill(d){if(d.queue&&d.queue!=='done'&&QLBL[d.queue])return qPill(d);if(d.status==='queued')return '<span class="pill wait">در صف پزشک</span>';
  if(d.status==='draft')return '<span class="pill draft">پیش‌نویس</span>';
  if(d.status==='modified')return '<span class="pill mod">ویرایش ثبت‌نشده</span>';
  if(d.emailStatus==='sent')return '<span class="pill sent">ثبت و ایمیل شد</span>';
  if(d.emailStatus==='failed')return '<span class="pill fail">ایمیل نرفت</span>';
  return '<span class="pill mod">ثبت شد</span>'}
let listLoaded=false;
let LPAGE=150,LKEY='';document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-lmore]');if(!t)return;LPAGE+=300;renderList()});
function renderList(){const q=toEn($('q').value.trim()).toLowerCase();const el=$('list');
  if(!listLoaded){el.innerHTML='<div class="empty">در حال بارگذاری بایگانی…</div>';return}
  if(!ARCHIVE.length){el.innerHTML='<div class="empty">هنوز فرمی ثبت نشده. از «فرم جدید» اولین طرح درمان را پر کنید.</div>';return}
  renderFilt();const rows=ARCHIVE.filter(d=>(LFILT==='all'||fx2Key(d)===LFILT)&&(!q||(String(d.name||'').toLowerCase().includes(q)||toEn(d.nid||'').includes(q)||(d.fno!=null&&d.fno!==''&&toEn(String(d.fno)).toLowerCase().includes(q)))));
  if(!rows.length){el.innerHTML='<div class="empty">نتیجه‌ای پیدا نشد.</div>';return}
  const lk=q+'|'+LFILT;if(lk!==LKEY){LKEY=lk;LPAGE=150}const more=rows.length-LPAGE;
  el.innerHTML=rows.slice(0,LPAGE).map(d=>`<div class="item"><div class="row1"><div><div class="nm">${esc(d.name||'بدون نام')}${pdfIco(d.id,d.name)}</div>
    <div class="meta">${d.fno!=null&&d.fno!==''?'پرونده '+esc(faD(String(d.fno)))+' · ':''}${d.arc?'<b class="fxarc-tag">کاغذی</b> · ':''}${d.nid?'کد ملی '+esc(faD(d.nid))+' · ':''}${d.jalali?(d.arc?'':'تأیید ')+esc(d.jalali):'ثبت نشده'}${ROLE==='surgery'||ROLE==='doctor'?'':' · جمع '+fa(Number(d.total)||0)}${Number(d.surgN)?' · '+fa(Number(d.surgN))+' جلسه جراحی':''}${d.settle==='pending'?' · <b style="color:var(--warn)">منتظر تسویه</b>':''}</div>
    ${d.emailStatus==='failed'&&d.emailError?`<div class="meta" style="color:var(--bad)">${esc(d.emailError)}</div>`:''}</div>${statusPill(d)}</div>
    <div class="acts"><button class="btn sm${ROLE==='staff'||ROLE==='surgery'?'':' ghost'}" data-file="${esc(d.id)}" data-fname="${esc(d.name||'')}" type="button">پرونده</button>${d.arc&&ROLE==='staff'?`<button class="btn sm main" data-m29arc="${esc(d.id)}" type="button">ادامه‌ی درمان</button>`:''}${ROLE!=='staff'&&ROLE!=='surgery'&&ROLE!=='manager'&&ROLE!=='accountant'?`<button class="btn sm" data-open="${esc(d.id)}"${d.arc?' data-a7arc="1"':''} type="button">${d.arc?'ویرایش پرونده‌ی جا مانده':'باز کردن / ویرایش'}</button>`:''}
    ${d.status!=='draft'&&d.status!=='queued'&&ROLE!=='surgery'?`<button class="btn sm ghost" data-pdf="${esc(d.id)}" type="button">PDF</button>${ROLE!=='staff'&&ROLE!=='manager'?`<button class="btn sm ghost" data-resend="${esc(d.id)}" type="button">ارسال دوباره</button>`:''}`:''}
    ${CF_ON&&ROLE!=='surgery'&&ROLE!=='manager'&&ROLE!=='accountant'&&(d.status==='confirmed'||d.status==='modified')&&d.queue!=='surgery'&&d.queue!=='lost'?`<button class="btn sm ghost" data-tosurg="${esc(d.id)}" type="button">${Number(d.surgN)?'ارسال دوباره به جراحی':'ارسال به جراحی'}</button>`:''}
    ${Number(d.surgN)?`<button class="btn sm ghost" data-srep="${esc(d.id)}" type="button">گزارش جراحی</button><button class="btn sm ghost" data-scard="${esc(d.id)}" type="button">کارت ایمپلنت</button>`:''}
    ${d.settle==='pending'&&ROLE==='consultant'?`<button class="btn sm" data-settle="${esc(d.id)}" type="button">تسویه اختلاف</button>`:''}</div></div>`).join('')+(more>0?`<button class="btn ghost" type="button" data-lmore="1" style="width:100%;margin-top:8px">نمایش ${fa(Math.min(300,more))} پرونده‌ی دیگر (${fa(more)} مانده) — یا نام را جستجو کنید</button>`:'')}
async function loadList(){try{const j=await api('list');ARCHIVE=j.items||[];listLoaded=true;if(!$('viewList').hidden)renderList()}
  catch(e){$('list').innerHTML=`<div class="empty">بایگانی بارگذاری نشد: ${esc(e.message)}</div>`}}
/* fetchRecord: base + q8 (finance/q8-patient-pdf-surgery-table.js: the payments, read with a second «get» as before) */
async function fetchRecord(id){const j=await api('get',{id});const r=fromDoc(id,j.data||{});if(j.surg)r.surg=j.surg;if(j.sign)r.sign=j.sign;
  ['status','jalali','emailStatus','emailError','pdfName','edits'].forEach(k=>{if(j[k]!==undefined&&j[k]!=='')r[k]=j[k]});
  try{const j=await api('get',{id});if(j&&Array.isArray(j.pays))r.pays=j.pays}catch(e){}return r}

