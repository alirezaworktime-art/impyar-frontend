/* ---------- arc3: a forgotten (paper) file is entered on the surgery-day page: patient data on top, then one or more
   dated surgery sessions (each with the surgery-day treatment tables, implants, surgeon and assistants); costs / earlier
   payments and the file status stay at the bottom ---------- */
const ARC_DOC='پزشک کلینیک';
let ARCT=null; // where the surgery-day team box lives normally
function arcSes0(c){return {dayJ:'',by:c?c.by||'':'',asst:c?c.asst||'':'',sa:{},sa2:{},st:{},s:blankSections(),imp:{}}}
/* arcStash: base + arc4 (uncovering count) */
function arcStash(){const A=SURG&&SURG.arc;if(!A)return;const c=A.ses[A.cur];if(!c)return;
  Object.assign(c,{s:SURG.s,imp:SURG.imp,asst:SURG.asst,sa:SURG.sa,sa2:SURG.sa2,st:SURG.st,by:$('sg_by').value.trim(),dayJ:$('arc_day').value.trim()});if($('arc_unc'))c.uncN=Math.min(40,num(toEn($('arc_unc').value)))}
function arcLoad(i){const A=SURG.arc;A.cur=Math.max(0,Math.min(i,A.ses.length-1));const c=A.ses[A.cur];
  Object.assign(SURG,{s:c.s,imp:c.imp,asst:c.asst||'',sa:c.sa||{},sa2:c.sa2||{},st:c.st||{}});SURG.openSecs=new Set();
  $('sg_by').value=c.by||'';$('arc_day').value=c.dayJ||'';$('sgArcMsg').textContent='';renderAsst();arcBar();renderSurg()}
/* arcBar: base + arc4 (uncovering count, cost box) */
function arcBar(){const A=SURG&&SURG.arc;if(A){
  $('arcSesBar').innerHTML=A.ses.map((c,i)=>{const pv={s:c.s,brand:'ko',pay:{}},n=SECTIONS.filter(x=>rowUsed(pv,x)).length;
    return `<button type="button" class="chip" data-arcses="${i}" aria-pressed="${i===A.cur}">جلسه‌ی ${fa(i+1)}${c.dayJ?' · '+esc(faD(c.dayJ)):''}${n?' ✓':''}</button>`}).join('')+
    `<button type="button" class="chip arcadd" id="arcSesAdd">+ جلسه‌ی جراحی دیگر</button>`;
  $('arcSesDel').hidden=A.ses.length<2;$('arcSesDel').textContent='حذف جلسه‌ی '+fa(A.cur+1);delete $('arcSesDel').dataset.sure;
  $('arcSesT').textContent='جلسه‌ی '+fa(A.cur+1)+' از '+fa(A.ses.length)}
  try{const c=A&&A.ses[A.cur];if(c&&$('arc_unc')&&document.activeElement!==$('arc_unc'))$('arc_unc').value=num(c.uncN)?faD(String(num(c.uncN))):''}catch(e){}arcCostUpd()}
function arcDocs(){return [...new Set([...(SET.docs||[]),SURGEON(),...ASSTS(),ARC_DOC].filter(Boolean))]}
function arcUndo(){const V=$('viewSurg');if(!V||!V.classList.contains('arcm'))return;V.classList.remove('arcm');
  const tm=$('arcTeam')&&$('arcTeam').querySelector('.sgteam');if(tm&&ARCT)ARCT.appendChild(tm);
  ['sgArcPat','sgArcSes','arcBot','fxArcSheet'].forEach(id=>{const el=$(id);if(el)el.hidden=true});$('sgArcPat').innerHTML='';
  const c=$('sgImpW').closest('section');if(c)c.hidden=false;const asp=document.querySelector('#viewSurg .sgteam .grp>span');if(asp)asp.textContent='پزشک دستیار امروز *'}
function arcExit(reopen){const A=SURG&&SURG.arc,b=(A&&A.back)||'list';FXA=null;show(b);if(b==='list')try{renderList()}catch(e){}if(reopen&&A&&A.file)openFile(A.file,A.name,'tl')}
/* patient data on top, money and status at the bottom (the old sheet's fields, so reading and saving stay the same) */
/* arcRender: base + arc4 (cost box; a new file hides the payments) */
function arcRender(){const A=FXA,docs=arcDocs();
  $('sgArcPat').innerHTML=`<p class="note">برای بیماران قبلی که پرونده‌ی کاغذی دارند: مشخصات بیمار، و پایین‌تر هر جلسه‌ی جراحی با تاریخ خودش (مثل صفحه‌ی روز جراحی). بعد از ذخیره، اسکن یا عکس پرونده‌ی کاغذی را در بخش «تصاویر» پرونده اضافه کنید.</p>
  <datalist id="fxDocs">${docs.map(b=>`<option value="${esc(b)}">`).join('')}</datalist>
  <div class="arcg">
   <label class="f">نام و نام خانوادگی *<input id="fxa_name" value="${esc(A.name||'')}"></label><label class="f">شماره پرونده‌ی کاغذی<input id="fxa_file" maxlength="20" value="${esc(faD(A.file||''))}"></label>
   <label class="f">موبایل<input id="fxa_phone" inputmode="tel" value="${esc(faD(A.phone||''))}"></label><label class="f">کد ملی<input id="fxa_nid" inputmode="numeric" value="${esc(faD(A.nid||''))}"></label>
   <label class="f">سن<input id="fxa_age" inputmode="numeric" value="${esc(faD(A.age||''))}"></label><label class="f">شهر<input id="fxa_city" value="${esc(A.city||'')}"></label>
   <label class="f">پزشک پرونده<input id="fxa_doc" list="fxDocs" value="${esc(A.doc||'')}"></label><label class="f">تاریخ اولین مراجعه<input id="fxa_day" placeholder="۱۴۰۲/۰۳/۱۵" value="${esc(A.dayJ||'')}"></label></div>`;
  fxSheet('fxArcSheet',`<h2>هزینه‌ها، پرداخت‌های قبلی و وضعیت پرونده</h2>
  ${fx2VisitsHtml(A)}
  <label class="f">درمان‌های دیگر (اگر در جلسه‌های بالا نیامده)<textarea id="fxa_other" rows="2" maxlength="2000">${esc(A.other||'')}</textarea></label>
  <label class="f">توضیحات<textarea id="fxa_note" rows="2" maxlength="3000">${esc(A.note||'')}</textarea></label>
  ${A.id?'':`<div class="grp"><span>وضعیت پرونده</span><div class="chips" role="group"><button class="chip" type="button" data-fxaopen="0" aria-pressed="${!A.open}">بسته — درمان تمام شده</button><button class="chip" type="button" data-fxaopen="1" aria-pressed="${!!A.open}">باز — ادامه‌ی درمان</button></div></div>
  <div id="fxaOpenW" class="arcg"${A.open?'':' hidden'}>
   <label class="f">نوع پروتز<select id="fxa_type">${Object.keys(FX_TY).map(k=>`<option value="${k}"${k===(A.type||'fix')?' selected':''}>${FX_TY[k]}</option>`).join('')}</select></label>
   <label class="f">مرحله‌ی فعلی<select id="fxa_stage">${fxStOpts(A.type||'fix',A.stage||'imprw')}</select></label>
   <label class="f">تاریخ پیگیری / نوبت (برای آنکاوری یا قالب)<input id="fxa_due" placeholder="امروز" value="${esc(A.dueJ||'')}"></label></div>`}
  <div class="msg" id="fxaMsg"></div>
  <div class="btns"><button class="btn" type="button" id="fxaGo">${A.id?'ذخیره‌ی تغییرات':'ثبت پرونده در بایگانی'}</button><button class="btn ghost" type="button" id="arcCancel">انصراف</button></div>`);
  try{const s=$('fxArcSheet'),i=s&&s.firstElementChild;if(i&&!$('arcCost'))i.insertAdjacentHTML('afterbegin','<div id="arcCost" class="arccost"></div>');
  if(FXA&&!FXA.id){const v=$('fx2Vis');if(v){const box=[v.previousElementSibling,v.previousElementSibling&&v.previousElementSibling.previousElementSibling,v.previousElementSibling&&v.previousElementSibling.previousElementSibling&&v.previousElementSibling.previousElementSibling.previousElementSibling].filter(Boolean);
    box.concat([v,$('fx2VAdd'),$('fx2Sum')]).forEach(el=>{if(el&&el.tagName!=='DATALIST')el.hidden=true})}const hh=i&&i.querySelector('h2');if(hh)hh.textContent='وضعیت پرونده'}}catch(e){}
  arcUncPrice().then(arcCostUpd);arcCostUpd()}
{const _sh=show;show=function(v){if(v!=='surg'||(SURG&&!SURG.arc))arcUndo();return _sh.apply(this,arguments)}}
{const _ri=renderImps;renderImps=function(){const r=_ri.apply(this,arguments);if(SURG&&SURG.arc){const c=$('sgImpW').closest('section');if(c)c.hidden=$('sgImpW').hidden}return r}}
/* fixtures the All on X / overdenture count asks for in jaw j of sections S */
const arcAsk=o=>typeof uxAsk==='function'?uxAsk(o):Promise.resolve(window.confirm(o.msg||o.title));
const arcWant=(S,id,j)=>Object.keys(S[id].sel).filter(k=>S[id].sel[k]&&!isTooth(k)&&k.split(':')[0]===(j==='U'?'0':'1')).reduce((a,k)=>a+num(k.split(':')[1]),0);
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t||!SURG||!SURG.arc)return;const d=t.dataset;
  const stop=()=>{e.preventDefault();e.stopPropagation();['sgArcMsg','fxaMsg'].forEach(k=>{const el=$(k);if(el&&el.classList.contains('err'))el.textContent=''})};
  if(d.arcses!==undefined){stop();arcStash();arcLoad(Number(d.arcses));return}
  if(t.id==='arcSesAdd'){stop();arcStash();const A=SURG.arc;A.ses.push(arcSes0(A.ses[A.cur]));arcLoad(A.ses.length-1);$('arc_day').focus();return}
  if(t.id==='arcSesDel'){stop();const A=SURG.arc,n=A.cur;arcAsk({title:'حذف جلسه‌ی '+fa(n+1),msg:'کارها و ایمپلنت‌های این جلسه از این فرم پاک می‌شود.',ok:'حذف جلسه',danger:true}).then(y=>{if(!y||!SURG||SURG.arc!==A)return;A.ses.splice(n,1);arcLoad(Math.max(0,n-1))});return}
  if(d.arcby!==undefined){stop();$('sg_by').value=ARC_DOC;arcStash();renderSurg();return}
  if(d.sgas!==undefined){stop();SURG.asst=d.sgas;renderAsst();renderSurg();return} /* the archive never changes «today's assistant» of the real surgery day */
  if(t.id==='arcCancel'){stop();const A=SURG.arc;arcAsk({title:'خروج بدون ذخیره',msg:'اطلاعاتی که در این صفحه وارد کرده‌اید ذخیره نمی‌شود.',ok:'خروج',danger:true}).then(y=>{if(y&&SURG&&SURG.arc===A)arcExit(true)});return}},true);
document.addEventListener('input',e=>{if(!SURG||!SURG.arc)return;if(e.target.id==='arc_day'){arcStash();arcBar()}});
document.addEventListener('change',e=>{if(!SURG||!SURG.arc)return;if(e.target.id==='arc_day'){arcStash();arcBar()}if(e.target.id==='sg_by'){arcStash();renderSurg()}});

