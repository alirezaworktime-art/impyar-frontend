/* ---------- fx1: file number after surgery · notes on every stage · archive of paper files ---------- */
var FXST={reg:'پذیرش',plan:'طرح درمان',cons:'مشاوره',surg:'جراحی',sut:'بخیه و ترخیص',unc:'آنکاوری',impr:'قالب‌گیری',lab:'لابراتوار',try:'امتحان پروتز',deliv:'تحویل پروتز',chk:'چکاپ و پیگیری',arc:'بایگانی (پرونده‌ی کاغذی)',other:'سایر'};
var FX_PB=['reg','plan','cons','surg','sut','unc','impr','lab','deliv'];
var FXW={staff:1,doctor:1,consultant:1,surgery:1,accountant:1};
var FX_NEXT='',FXSD={},FXARC=false,NT=null,FXPAD=null,FXA=null;
const fxCanFile=()=>ROLE==='staff'||ROLE==='consultant';
const fxBy=()=>USERNAME||(($('rc_asst')||{}).value)||ROLE_LBL[ROLE]||'';
function fxSheet(id,html){let s=$(id);if(!s){s=document.createElement('div');s.className='sheet';s.id=id;s.hidden=true;document.body.appendChild(s)}const o=s.firstElementChild,keep=!s.hidden&&o?o.scrollTop:0;s.innerHTML='<div class="in">'+html+'</div>';s.hidden=false;if(keep)s.firstElementChild.scrollTop=keep;return s}
function fxClose(id){const s=$(id);if(s)s.hidden=true}
/* queue: the next free file number */
{const _aq=applyQueue;applyQueue=function(j){if(j&&!j.same&&j.fnext!==undefined)FX_NEXT=String(j.fnext||'');return _aq(j)}}
/* ---- 1. file number ---- */
async function fxFileOpen(id,cur){let nx='';if(!cur){try{const r=await api('fxFile',{op:'next'});nx=r.next||''}catch(e){}}
  fxSheet('fxFnSheet',`<h3>شماره پرونده</h3><p class="note">شماره پرونده‌ی بیمار بعد از جراحی توسط پذیرش داده می‌شود. شماره‌ی پیشنهادی، شماره‌ی بعدی آزاد است؛ می‌توانید آن را عوض کنید. شماره‌ی تکراری پذیرفته نمی‌شود.</p>
  <label class="f">شماره پرونده<input id="fxFnIn" inputmode="numeric" maxlength="20" value="${esc(cur?faD(cur):faD(nx))}"></label><div class="msg" id="fxFnMsg"></div>
  <div class="btns"><button class="btn" type="button" id="fxFnGo" data-id="${esc(id)}" style="flex:1">ثبت شماره پرونده</button><button class="btn ghost" type="button" data-fxclose="fxFnSheet">انصراف</button></div>`);setTimeout(()=>{try{$('fxFnIn').focus();$('fxFnIn').select()}catch(e){}},60)}
async function fxFileSet(id,v,btn){if(btn)btn.disabled=true;try{const r=await api('fxFile',{op:'set',id,file:toEn(String(v||'')).trim(),by:fxBy()});toast('شماره پرونده '+faD(r.file)+' ثبت شد.');delete FXSD[id];pollQ(true);if(PF&&PF.id===id&&!$('pfSheet').hidden)refreshFile();return true}
  catch(e){const m=$('fxFnMsg');if(m&&!$('fxFnSheet').hidden){m.className='msg err';m.textContent=e.message}else alertMsg(e.message);return false}finally{if(btn)btn.disabled=false}}
function fxSdRow(x){const ok=!!x.fno,v=FXSD[x.id]!==undefined?FXSD[x.id]:faD(FX_NEXT||'');
  return `<div class="sdr${ok?' ok':''}"><span class="ck">${ok?'✓':''}</span><div class="tx">${ok?'شماره پرونده: <b>'+esc(faD(x.fno))+'</b>':'<b class="late">شماره پرونده داده نشده</b>'}<small>${ok?'':'شماره‌ی بعدی پیشنهاد شده؛ در صورت نیاز عوضش کنید. بدون شماره پرونده ترخیص ممکن نیست.'}</small></div>${ok?`<button class="btn sm ghost" type="button" data-fxfile="${esc(x.id)}" data-fxcur="${esc(x.fno)}">ویرایش</button>`:`<input class="fxsdin" data-fxsdin="${esc(x.id)}" inputmode="numeric" maxlength="20" value="${esc(v)}" aria-label="شماره پرونده"><button class="btn sm" type="button" data-fxsdset="${esc(x.id)}">ثبت</button>`}</div>`}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.fxsdin)FXSD[t.dataset.fxsdin]=t.value});
/* ---- 2. notes ---- */
function fxPad(cv){const cx=cv.getContext('2d');let dn=false,last=null,dirty=false;const ink='#14213d';
  const reset=()=>{cx.fillStyle='#fff';cx.fillRect(0,0,cv.width,cv.height);dirty=false};reset();cx.lineCap='round';cx.lineJoin='round';
  const pt=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]};
  const seg=(a,b,w)=>{cx.strokeStyle=ink;cx.lineWidth=w;cx.beginPath();cx.moveTo(a[0],a[1]);cx.lineTo(b[0],b[1]);cx.stroke()};
  cv.onpointerdown=e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(x){}dn=true;last=pt(e);cx.fillStyle=ink;cx.beginPath();cx.arc(last[0],last[1],1.8,0,7);cx.fill();dirty=true};
  cv.onpointermove=e=>{if(!dn)return;e.preventDefault();const L=e.getCoalescedEvents?e.getCoalescedEvents():[e];(L.length?L:[e]).forEach(ev=>{const p=pt(ev),w=ev.pointerType==='pen'&&ev.pressure?1.6+ev.pressure*4:3.4;seg(last,p,w);last=p});dirty=true};
  cv.onpointerup=cv.onpointercancel=cv.onpointerleave=()=>{dn=false};
  return {clear:reset,dirty:()=>dirty,load(src){if(!src)return;const im=new Image();im.onload=()=>{cx.drawImage(im,0,0,cv.width,cv.height);dirty=true};im.src=src},
    data(){let u=cv.toDataURL('image/png');if(u.length>600000)u=cv.toDataURL('image/jpeg',.8);return u}}}
/* ntOpen — layers: archive/fx1 base + finance/nt2 (date automatic, writer + recipients) + plan/pk3 (the lab: stage fixed)
   + finance/layer m15 (a doctor's new note: the default writer). The added parts also run when the role may not write notes. */
async function ntOpen(plan,o={}){if(FXW[ROLE]){let stage=o.stage||'',note=o.note||null;
  if(!stage&&!note){if(PF&&PF.id===plan&&PF.j&&PF.j.ntStage)stage=PF.j.ntStage;else{try{const r=await api('fxNote',{op:'list',id:plan});stage=r.stage||''}catch(e){}}}
  if(note)stage=note.stage;NT={plan,nid:note?note.id:'',kind:note?note.kind:(o.kind||'text')};
  const opts=Object.keys(FXST).map(k=>`<option value="${k}"${k===(stage||'other')?' selected':''}>${FXST[k]}</option>`).join('');
  fxSheet('fxNtSheet',`<h3>${note?'ویرایش توضیح':'توضیح تازه'}${o.name?' · '+esc(o.name):''}</h3>
  <label class="f">مرحله<select id="fxNtSt">${opts}</select></label>
  <div class="chips" role="group" aria-label="نوع توضیح"><button class="chip" type="button" data-fxnk="text">⌨ تایپی</button><button class="chip" type="button" data-fxnk="pen">✎ با قلم</button></div>
  <label class="f" id="fxNtTxW">متن توضیح<textarea id="fxNtTx" rows="5" maxlength="4000">${esc(note&&note.kind==='text'?note.text||'':'')}</textarea></label>
  <div id="fxNtPenW" hidden><div class="sigpad fxpad"><canvas id="fxNtCv" width="1000" height="560" aria-label="محل نوشتن با قلم"></canvas><span>با قلم یا انگشت اینجا بنویسید</span></div>
   <div class="btns"><button class="btn sm ghost" type="button" id="fxNtClr">پاک کردن نوشته</button></div>
   <label class="f">توضیح کوتاه تایپی (اختیاری)<input id="fxNtCap" maxlength="300" value="${esc(note&&note.kind==='pen'?note.text||'':'')}"></label></div>
  <div class="msg" id="fxNtMsg"></div>
  <div class="btns" style="flex-wrap:wrap"><button class="btn" type="button" id="fxNtGo" style="flex:1">ذخیره</button>${note?'<button class="btn ghost danger" type="button" id="fxNtDel">حذف</button>':''}<button class="btn ghost" type="button" data-fxclose="fxNtSheet">انصراف</button></div>`);
  FXPAD=fxPad($('fxNtCv'));if(note&&note.kind==='pen')FXPAD.load(note.img);ntKind(NT.kind);setTimeout(()=>{try{if(NT.kind==='text')$('fxNtTx').focus()}catch(e){}},80)}
  try { const n = o.note || null, st = $('fxNtSt'); if (st && NT) {
    NT2 = { to: n && n.tos ? (() => { try { return JSON.parse(n.tos) } catch (e) { return [] } })() : [] };
    st.closest('label').insertAdjacentHTML('afterend', `${nt2DL()}<div class="nt2r"><label class="f">تاریخ<input value="${esc(n ? jt(n.at) : 'امروز — خودکار')}" disabled></label><label class="f">نویسنده *<input id="nt2By" list="nt2Names" maxlength="60" value="${esc(n ? (n.author || n.by || '') : '')}" placeholder="نام نویسنده" autocomplete="off"></label></div>
      <div class="grp"><span>برای (گیرنده)</span><div class="chips" role="group">${nt2To(NT2.to, 'data-nt2to')}</div></div>`) } } catch (e) { }
  try{if(ROLE==='lab'){const s=$('fxNtSt');if(s){s.value='lab';s.disabled=true}}}catch(e){}
  try { if (ROLE === 'doctor' && !(o && o.note)) { const b = $('nt2By'); if (b) b.value = 'دکتر علویکیا' } } catch (e) { }}
function ntKind(k){NT.kind=k;document.querySelectorAll('[data-fxnk]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fxnk===k)));$('fxNtTxW').hidden=k!=='text';$('fxNtPenW').hidden=k!=='pen'}
async function ntSave(btn){if(!NT)return;const m=$('fxNtMsg'),stage=$('fxNtSt').value,b={op:NT.nid?'edit':'add',id:NT.plan,nid:NT.nid,stage,kind:NT.kind,by:fxBy()};
  if(NT.kind==='text'){b.text=$('fxNtTx').value.trim();if(!b.text){m.className='msg err';m.textContent='متن توضیح خالی است.';return}}
  else{if(!FXPAD||!FXPAD.dirty()){m.className='msg err';m.textContent='چیزی با قلم نوشته نشده.';return}b.img=FXPAD.data();b.text=$('fxNtCap').value.trim()}
  btn.disabled=true;try{await api('fxNote',b,{timeout:20000});fxClose('fxNtSheet');toast(NT.nid?'توضیح ویرایش شد.':'توضیح ثبت شد.');const p=NT.plan;NT=null;if(PF&&PF.id===p&&!$('pfSheet').hidden)refreshFile()}
  catch(e){m.className='msg err';m.textContent=e.message}finally{btn.disabled=false}}
async function ntDel(btn){if(!NT||!NT.nid)return;if(!btn.dataset.armed){btn.dataset.armed='1';btn.textContent='برای حذف دوباره بزنید';setTimeout(()=>{if(btn.isConnected){delete btn.dataset.armed;btn.textContent='حذف'}},4000);return}
  btn.disabled=true;try{await api('fxNote',{op:'del',id:NT.plan,nid:NT.nid,by:fxBy()});fxClose('fxNtSheet');toast('توضیح حذف شد.');const p=NT.plan;NT=null;if(PF&&PF.id===p)refreshFile()}catch(e){$('fxNtMsg').className='msg err';$('fxNtMsg').textContent=e.message;btn.disabled=false}}
/* ntItem — finance/nt2 (writer and recipients) replaced the first archive/fx1 version */
function ntItem(n) { const can = FXW[ROLE]; let to = []; try { to = JSON.parse(n.tos || '[]') } catch (e) { }
  return `<div class="fxn"><div class="fxn-h"><b>${esc(FXST[n.stage] || 'سایر')}</b><small>${esc(jt(n.at))} · نویسنده: ${esc(n.author || n.by || ROLE_LBL[n.role] || '')}${to.length ? ' · برای ' + esc(to.map(k => A10T[k] || k).join('، ')) : ''}${n.upd ? ' · ویرایش ' + esc(jt(n.upd)) + (n.updBy ? ' (' + esc(n.updBy) + ')' : '') : ''}</small>${can ? `<button class="btn sm ghost" type="button" data-fxnedit="${esc(n.id)}">ویرایش</button>` : ''}</div>${n.kind === 'pen' && n.img ? `<img class="fxn-img" src="${esc(n.img)}" alt="نوشته‌ی دستی ${esc(FXST[n.stage] || '')}">` : ''}${n.text ? `<p>${esc(n.text)}</p>` : ''}</div>` }
function ntSection(id,j){const N=(j.notes||[]).slice().reverse(),all=PF&&PF.ntAll,show=all?N:N.slice(0,3);
  return `<section class="fxnotes" aria-label="توضیحات"><div class="fxn-top"><h3 class="pf-h">توضیحات${N.length?' <small>('+fa(N.length)+')</small>':''}</h3>${FXW[ROLE]?`<button class="btn sm" type="button" data-ntadd="${esc(id)}">+ توضیح</button>`:''}</div>
   ${N.length?show.map(ntItem).join(''):'<p class="note">هنوز توضیحی ثبت نشده.'+(FXW[ROLE]?' برای هر مرحله (روی نام مرحله در نوار بالا بزنید) می‌توانید تایپی یا با قلم توضیح بنویسید.':'')+'</p>'}
   ${N.length>3&&!all?`<button class="btn ghost sm" type="button" data-ntall="1" style="width:100%;margin-top:6px">نمایش همه‌ی توضیحات (${fa(N.length)})</button>`:''}</section>`}
async function ntPdfBlocks(j){const N=j.notes||[];if(!N.length)return [];const out=[ffTitle('توضیحات پرونده')];
  for(const n of N){const hd=jt(n.at)+' · '+(FXST[n.stage]||'سایر')+' · '+(n.by||ROLE_LBL[n.role]||'')+(n.upd?' · ویرایش‌شده '+jt(n.upd):'');
    if(n.kind==='pen'&&n.img){const im=await new Promise(z=>{const i=new Image();i.onload=()=>z(i);i.onerror=()=>z(null);i.src=n.img});
      if(im){const w=Math.min(C.R-C.L-20,760),h=Math.round(w*im.height/im.width);out.push({h:h+56,keep:true,draw(cx,top){T(cx,hd,C.R,top+18,{s:18,w:700,c:'#333'});cx.drawImage(im,C.R-w,top+38,w,h);box(cx,C.R-w,top+38,w,h,null,'#bbb',1)}})}
      else out.push(textBlock(hd,['(نوشته‌ی دستی نمایش داده نشد)']));
      if(n.text)out.push(textBlock('',String(n.text).split('\n')))}
    else out.push(textBlock(hd,String(n.text||'').split('\n')))}
  return out}
/* ---- 3. archive of paper files ---- */
const FX_PSL={impr:'قالب‌گیری',lab:'ساخت پروتز در لابراتوار',rabt:'امتحان اباتمنت',frame:'امتحان فریم',jig:'تست جیگ',bite:'ثبت بایت',tryin:'امتحان پروتز',deliv:'تحویل پروتز'};
const FX_TY={fix:'تک‌واحد و بریج',aox:'All-on-X',ovd:'اوردنچر',tmp1:'روکش موقت فوری تک‌واحد'};
const FX_PATH={fix:['heal','impr','lab','rabt','frame','tryin','deliv'],tmp1:['tmpd','heal','impr','lab','rabt','frame','tryin','deliv'],aox:['tmpx','heal','impr','jig','lab','frame','tryin','deliv'],ovd:['heal','impr','lab','bite','tryin','deliv']};
function fxStOpts(t,cur){const P=FX_PATH[t]||FX_PATH.fix,O=[];if(P.includes('heal')){O.push(['unc','منتظر آنکاوری']);O.push(['imprw','منتظر قالب‌گیری'])}
  P.filter(s=>s!=='heal'&&s!=='tmpd'&&s!=='tmpx').forEach(s=>{if(!O.some(o=>o[0]===s))O.push([s,'مرحله‌ی «'+(FX_PSL[s]||s)+'»'])});
  return O.map(([k,l])=>`<option value="${k}"${k===cur?' selected':''}>${esc(l)}</option>`).join('')}
const fxFdi=k=>{const m=/^(UR|UL|LL|LR)([1-8])/.exec(k||'');return m?String({UR:1,UL:2,LL:3,LR:4}[m[1]]*10+Number(m[2])):''};
const fxKey=v=>{const n=Number(toEn(String(v||'')).replace(/\D/g,''));const q=Math.floor(n/10),i=n%10;return q>=1&&q<=4&&i>=1&&i<=8?({1:'UR',2:'UL',3:'LL',4:'LR'}[q])+i:''};
function fxImpRow(x,i){const dl=x.dayJ!==undefined?x.dayJ:(x.day?jDay(x.day):''),tv=x.tRaw!==undefined?x.tRaw:faD(fxFdi(x.t));return `<div class="fximp" data-fxi="${i}"><label>دندان<input data-k="t" inputmode="numeric" maxlength="2" placeholder="۳۶" value="${esc(tv)}"></label>
  <label>برند<input data-k="b" list="fxBrands" value="${esc(x.b||'')}"></label><label>قطر<input data-k="d" inputmode="decimal" value="${esc(x.d||'')}"></label><label>طول<input data-k="l" inputmode="decimal" value="${esc(x.l||'')}"></label>
  <label>تاریخ جراحی<input data-k="day" placeholder="۱۴۰۲/۰۵/۱۰" value="${esc(dl)}"></label><label>جراح<input data-k="by" list="fxDocs" value="${esc(x.by||'')}"></label><button class="btn sm ghost x" type="button" data-fxirm="${i}" aria-label="حذف این ایمپلنت">✕</button></div>`}
function fxArcRead(){const g=id=>($(id)||{}).value||'';const A=FXA;A.name=g('fxa_name').trim();A.phone=toEn(g('fxa_phone')).trim();A.nid=toEn(g('fxa_nid')).trim();A.age=toEn(g('fxa_age')).trim();A.city=g('fxa_city').trim();A.doc=g('fxa_doc').trim();A.file=toEn(g('fxa_file')).trim();A.dayJ=g('fxa_day').trim();A.other=g('fxa_other');A.note=g('fxa_note');A.type=g('fxa_type')||A.type||'fix';A.stage=g('fxa_stage')||A.stage;A.dueJ=g('fxa_due').trim();
  A.imps=[...document.querySelectorAll('#fxArcSheet .fximp')].map(r=>{const v=k=>(r.querySelector('[data-k="'+k+'"]')||{}).value||'';return {t:fxKey(v('t')),tRaw:v('t'),b:v('b').trim(),d:toEn(v('d')).trim(),l:toEn(v('l')).trim(),dayJ:v('day').trim(),day:parseJ(v('day')),by:v('by').trim()}});A.visits=fx2VisitsRead();return A}
/* fxArcRender: base + arc3 (archive surgery-day page) */
function fxArcRender(){if(SURG&&SURG.arc)return arcRender();const A=FXA,br=[...new Set((SET.catalog||[]).map(c=>c.b).filter(Boolean))],docs=SET.docs||[];
  fxSheet('fxArcSheet',`<h3>${A.id?'ویرایش اطلاعات پرونده‌ی جا مانده':'افزودن پرونده‌ی جا مانده (بیماران قبلی / پرونده‌ی کاغذی)'}</h3>
  <p class="note">برای بیماران قبلی که پرونده‌ی کاغذی دارند. اگر درمانشان تمام نشده (مثلاً روکش را تحویل نگرفته‌اند) «باز» را بزنید تا از همان مرحله در سایت ادامه دهند. بعد از ذخیره، اسکن یا عکس پرونده‌ی کاغذی را در بخش «تصاویر» پرونده اضافه کنید.</p>
  <datalist id="fxBrands">${br.map(b=>`<option value="${esc(b)}">`).join('')}</datalist><datalist id="fxDocs">${docs.map(b=>`<option value="${esc(b)}">`).join('')}</datalist>
  <div class="grid2" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">
   <label class="f">نام و نام خانوادگی *<input id="fxa_name" value="${esc(A.name||'')}"></label><label class="f">شماره پرونده‌ی کاغذی<input id="fxa_file" maxlength="20" value="${esc(faD(A.file||''))}"></label>
   <label class="f">موبایل<input id="fxa_phone" inputmode="tel" value="${esc(faD(A.phone||''))}"></label><label class="f">کد ملی<input id="fxa_nid" inputmode="numeric" value="${esc(faD(A.nid||''))}"></label>
   <label class="f">سن<input id="fxa_age" inputmode="numeric" value="${esc(faD(A.age||''))}"></label><label class="f">شهر<input id="fxa_city" value="${esc(A.city||'')}"></label>
   <label class="f">پزشک<input id="fxa_doc" list="fxDocs" value="${esc(A.doc||'')}"></label><label class="f">تاریخ اولین مراجعه<input id="fxa_day" placeholder="۱۴۰۲/۰۳/۱۵" value="${esc(A.dayJ||'')}"></label></div>
  <h4 style="margin:6px 0 0">ایمپلنت‌های کاشته‌شده</h4><div id="fxImps">${(A.imps||[]).map(fxImpRow).join('')||'<p class="note">ایمپلنتی وارد نشده.</p>'}</div>
  <button class="btn sm ghost" type="button" id="fxImpAdd">+ ایمپلنت</button>
  ${fx2VisitsHtml(A)}
  <label class="f">درمان‌های دیگر انجام‌شده (پیوند استخوان، سینوس، کشیدن، روکش و …)<textarea id="fxa_other" rows="3" maxlength="2000">${esc(A.other||'')}</textarea></label>
  <label class="f">توضیحات<textarea id="fxa_note" rows="3" maxlength="3000">${esc(A.note||'')}</textarea></label>
  ${A.id?'':`<div class="grp"><span>وضعیت پرونده</span><div class="chips" role="group"><button class="chip" type="button" data-fxaopen="0" aria-pressed="${!A.open}">بسته — درمان تمام شده</button><button class="chip" type="button" data-fxaopen="1" aria-pressed="${!!A.open}">باز — ادامه‌ی درمان</button></div></div>
  <div id="fxaOpenW"${A.open?'':' hidden'} style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">
   <label class="f">نوع پروتز<select id="fxa_type">${Object.keys(FX_TY).map(k=>`<option value="${k}"${k===(A.type||'fix')?' selected':''}>${FX_TY[k]}</option>`).join('')}</select></label>
   <label class="f">مرحله‌ی فعلی<select id="fxa_stage">${fxStOpts(A.type||'fix',A.stage||'imprw')}</select></label>
   <label class="f">تاریخ پیگیری / نوبت (برای آنکاوری یا قالب)<input id="fxa_due" placeholder="امروز" value="${esc(A.dueJ||'')}"></label></div>`}
  <div class="msg" id="fxaMsg"></div>
  <div class="btns"><button class="btn" type="button" id="fxaGo" style="flex:1">${A.id?'ذخیره‌ی تغییرات':'ثبت در بایگانی'}</button><button class="btn ghost" type="button" data-fxclose="fxArcSheet">انصراف</button></div>`)}
/* fxArcOpen: base + arc3 (surgery-day page) + arc6 (replaced by the a6 editor) */
function fxArcOpen(j){a6Open(j)}
/* fxArcSave: base + arc3 (archive surgery-day page) */
async function fxArcSave(btn){if(SURG&&SURG.arc)return arcSave(btn);const A=fxArcRead(),m=$('fxaMsg'),err=t=>{m.className='msg err';m.textContent=t};
  if(!A.name)return err('نام بیمار را بنویسید.');
  const bad=A.imps.find(x=>(x.tRaw||x.b||x.d||x.l||x.dayJ)&&!x.t);if(bad)return err('شماره‌ی دندان «'+(bad.tRaw||'خالی')+'» درست نیست؛ شماره‌ی دو رقمی بین‌المللی بنویسید (مثلاً ۳۶).');
  const bd=A.imps.find(x=>x.dayJ&&!x.day);if(bd)return err('تاریخ «'+bd.dayJ+'» درست نیست؛ مثل ۱۴۰۲/۰۵/۱۰ بنویسید.');
  const day=A.dayJ?parseJ(A.dayJ):'';if(A.dayJ&&!day)return err('تاریخ اولین مراجعه درست نیست.');const due=A.dueJ?parseJ(A.dueJ):'';if(A.dueJ&&!due)return err('تاریخ پیگیری درست نیست.');const bv=(A.visits||[]).find(x=>(x.dayJ||x.svc||x.cost||x.paid||x.note||x.teeth)&&!x.day);if(bv)return err('تاریخ هر مراجعه را درست وارد کنید'+(bv.dayJ?' («'+bv.dayJ+'»)':'')+'.');if((A.visits||[]).some(x=>x.day&&x.day>tDay()))return err('تاریخ مراجعه نمی‌تواند بعد از امروز باشد.');
  const arc={name:A.name,phone:A.phone,nid:A.nid,age:A.age,city:A.city,doc:A.doc,file:A.file,day,other:A.other,note:A.note,open:!!A.open,type:A.type,stage:A.stage,due,
    visits:(A.visits||[]).filter(x=>x.day).map(x=>({day:x.day,svc:x.svc,teeth:x.teeth,doc:x.doc,cost:x.cost,paid:x.paid,method:x.method,no:x.no,note:x.note})),imps:A.imps.filter(x=>x.t).map(x=>{const c=(SET.catalog||[]).find(c=>c.b===x.b);return {t:x.t,b:x.b,sys:c?c.sys||'':'',g:c?c.g||'':'',d:x.d,l:x.l,day:x.day,by:x.by}})};
  btn.disabled=true;try{const r=await api('fxArc',{id:A.id||'',arc,by:fxBy()},{timeout:20000});fxClose('fxArcSheet');toast(A.id?'اطلاعات بایگانی ذخیره شد.':'پرونده‌ی کاغذی ثبت شد؛ اسکن پرونده را در «تصاویر» اضافه کنید.');
    FXA=null;try{loadList()}catch(e){}pollQ(true);openFile(r.id,arc.name,A.id?'tl':'img')}catch(e){err(e.message)}finally{btn.disabled=false}}
{const _rl=renderList;renderList=function(){try{fxArcBar()}catch(e){}if(!FXARC)return _rl();const all=ARCHIVE;ARCHIVE=all.filter(d=>d.arc);try{return _rl()}finally{ARCHIVE=all}}}
/* fxArcInfo — layers: archive/fx1 (older paper files) + archive/arc6 (v6 paper files) + ui/m30 (sub-stage and re-implant months, before the table).
   h = the box html; the v6 branch has its own h (= d.h) inside its block. */
function fxArcInfo(id,j){let h=(()=>{const d=j.data||{},a=d.arc;
  if(a&&a.v6){const h=d.h||{},mo=a6Money0()&&a.cost!=null,can=['staff','consultant','accountant'].includes(ROLE);
  const L=(a.lines||[]).slice().sort((x,y)=>String(x.day).localeCompare(String(y.day)));
  return `<div class="fxarcinfo a6info"><b>پرونده‌ی کاغذی (بایگانی)</b>${h.pfile?' · شماره‌ی کاغذی '+esc(faD(h.pfile)):''}${a.day?' · اولین درمان '+esc(jDay(a.day)):''}
   <table class="fx2vt"><thead><tr><th>تاریخ</th><th>درمان</th><th>دندان / تعداد</th><th>پزشک</th>${mo?'<th>تعرفه</th><th>مبلغ</th>':''}</tr></thead><tbody>${L.map(l=>`<tr><td>${esc(jDay(l.day))}</td><td>${esc(a6Lab(l))}${l.k==='imp'||l.k==='sub'||l.k==='reimp'?arbBr(l,1):''}</td><td>${l.teeth&&l.teeth.length?esc(toothTxt(l.teeth)):fa(l.n)}</td><td>${esc(l.doc||'')}</td>${mo?`<td>${fa(l.price||0)}</td><td>${fa(l.amt||0)}</td>`:''}</tr>`).join('')}</tbody>
   ${mo?`<tfoot><tr><td colspan="5">هزینه‌ی کل${a.dc||a.dd?' · تخفیف کلینیک '+fa(a.dc)+' / پزشک '+fa(a.dd)+' · پس از تخفیف '+fa(a.net):''}${a.imp?' · تسویه‌ی قبلی طبق پرونده '+fa(a.imp):''}${a.settled?' · حساب تسویه است':''}</td><td>${fa(a.cost)}</td></tr></tfoot>`:''}</table>
   ${(L.find(l=>l.sut)||{}).sut?'<p>بخیه: '+esc(A6SUT[(L.find(l=>l.sut)||{}).sut]||'')+'</p>':''}${a.other?'<p>درمان‌های دیگر: '+esc(a.other)+'</p>':''}${a.note?'<p>توضیح: '+esc(a.note)+'</p>':''}
   <small>ثبت ${esc(jt(a.at))}${a.by?' · '+esc(a.by):''}${a.upd?' · ویرایش '+esc(jt(a.upd))+(a.updBy?' · '+esc(a.updBy):''):''}</small>${can?` <button class="btn sm ghost" type="button" data-fxarced="${esc(id)}">ویرایش پرونده‌ی جا مانده</button>`:''}</div>`}
  if(!a)return '';const I=(a.imps||[]).map(x=>toothTxt([x.t])+' '+[x.b,x.d&&x.l?x.d+'×'+x.l:'',x.day?jDay(x.day):'',x.by].filter(Boolean).join(' · '));
  return `<div class="fxarcinfo"><b>پرونده‌ی کاغذی (بایگانی)</b>${(d.h||{}).file?' · شماره '+esc(faD(d.h.file)):''}${a.day?' · اولین مراجعه '+esc(jDay(a.day)):''}
   ${I.length?'<p>ایمپلنت‌ها: '+esc(I.join(' | '))+'</p>':''}${a.other?'<p>درمان‌های دیگر: '+esc(a.other)+'</p>':''}${a.note?'<p>توضیح: '+esc(a.note)+'</p>':''}${(a.visits||[]).length?(()=>{const mo=['staff','consultant','manager','accountant'].includes(ROLE),V=a.visits;return `<table class="fx2vt"><thead><tr><th>تاریخ</th><th>کار انجام‌شده</th><th>دندان</th><th>پزشک</th>${mo?'<th>هزینه</th><th>پرداختی</th>':''}</tr></thead><tbody>${V.map(v=>`<tr><td>${esc(jDay(v.day))}</td><td>${esc(v.svc||'')}${v.note?' — '+esc(v.note):''}</td><td>${esc(v.teeth||'')}</td><td>${esc(v.doc||'')}</td>${mo?`<td>${v.cost?fa(v.cost):''}</td><td>${v.paid?fa(v.paid)+' ('+esc(FX2M[v.method]||'')+')':''}</td>`:''}</tr>`).join('')}</tbody>${mo?`<tfoot><tr><td colspan="4">جمع · مانده ${fa(V.reduce((s,v)=>s+(v.cost||0)-(v.paid||0),0))}</td><td>${fa(V.reduce((s,v)=>s+(v.cost||0),0))}</td><td>${fa(V.reduce((s,v)=>s+(v.paid||0),0))}</td></tr></tfoot>`:''}</table>`})():''}
   <small>ثبت ${esc(jt(a.at))}${a.by?' · '+esc(a.by):''}${a.upd?' · ویرایش '+esc(jt(a.upd)):''}</small>${fxCanFile()?` <button class="btn sm ghost" type="button" data-fxarced="${esc(id)}">ویرایش اطلاعات بایگانی</button>`:''}</div>`})();
  try{const a=((j||{}).data||{}).arc||{},sb=a.sub,X=[];
  if(sb&&M29_SUB[sb.k])X.push('مرحله‌ی بعد (فرعی): '+M29_SUB[sb.k]+' — '+jDay(sb.due));
  (a.lines||[]).forEach(l=>{if(l&&l.k==='ifail'&&l.rm)X.push('فیلد شدن ایمپلنت '+toothTxt(l.teeth||[])+': کاشت مجدد '+fa(l.rm)+' ماه بعد'+(l.rmDue?' ('+jDay(l.rmDue)+')':''))});
  if(X.length&&typeof h==='string'){const i=h.indexOf('<table');const box=`<div class="m30sub">${X.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;h=i>=0?h.slice(0,i)+box+h.slice(i):h+box}}catch(e){}return h}
/* ---- patient file: file number, notes section, path-bar note buttons, archive box ---- */
{const _rf=renderFile;renderFile=function(){_rf();try{fxAfterFile()}catch(e){console.error('fx1',e)}}}
function fxAfterFile(){if(!PF||!PF.j)return;const {id,j}=PF,h=(j.data||{}).h||{},B=$('pfBody');if(!B)return;
  const kv=B.querySelector('.pf-head .kv');if(kv&&!kv.querySelector('[data-fxrow]')){const a=document.createElement('span');a.textContent='شماره پرونده';a.dataset.fxrow='1';const b=document.createElement('span');
    b.innerHTML=(h.file?'<b>'+esc(faD(h.file))+'</b>':'<span class="fxmiss">داده نشده</span>')+(fxCanFile()?` <button class="btn sm ghost" type="button" data-fxfile="${esc(id)}" data-fxcur="${esc(h.file||'')}">${h.file?'ویرایش':'ثبت شماره'}</button>`:'');kv.prepend(b);kv.prepend(a)}
  const pb=B.querySelector('.pbar');if(pb){const N=j.notes||[];pb.querySelectorAll('.ps').forEach((s,i)=>{const k=FX_PB[i];if(!k)return;const n=N.filter(x=>x.stage===k).length;
      if(FXW[ROLE]){s.dataset.ntst=k;s.title='توضیح برای مرحله‌ی '+FXST[k];s.setAttribute('role','button');s.tabIndex=0}if(n){const b=s.querySelector('b');if(b&&!b.querySelector('.ntc'))b.insertAdjacentHTML('beforeend','<em class="ntc">'+fa(n)+'</em>')}});
    pb.insertAdjacentHTML('afterend',fxArcInfo(id,j)+ntSection(id,j))}}
/* clicks */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-fxclose],[data-fxfile],#fxFnGo,[data-fxsdset],[data-ntadd],[data-fxnedit],[data-ntall],[data-fxnk],#fxNtGo,#fxNtDel,#fxNtClr,.pbar .ps[data-ntst],#fxArcNew,#fxArcOnly,[data-fxarced],#fxImpAdd,[data-fxirm],[data-fxaopen],#fxaGo');if(!t)return;
  e.preventDefault();e.stopPropagation();const d=t.dataset;
  if(d.fxclose){fxClose(d.fxclose);return}
  if(d.fxfile!==undefined&&t.hasAttribute('data-fxfile')){fxFileOpen(d.fxfile,d.fxcur||'');return}
  if(t.id==='fxFnGo'){fxFileSet(d.id,$('fxFnIn').value,t).then(ok=>{if(ok)fxClose('fxFnSheet')});return}
  if(d.fxsdset){const i=document.querySelector('[data-fxsdin="'+CSS.escape(d.fxsdset)+'"]');fxFileSet(d.fxsdset,i?i.value:'',t);return}
  if(d.ntadd){ntOpen(d.ntadd,{name:d.ntn||''});return}
  if(d.fxnedit){const n=((PF&&PF.j&&PF.j.notes)||[]).find(x=>x.id===d.fxnedit);if(n)ntOpen(PF.id,{note:n});return}
  if(d.ntall){PF.ntAll=true;renderFile();return}
  if(d.fxnk){ntKind(d.fxnk);return}
  if(t.id==='fxNtGo'){ntSave(t);return}if(t.id==='fxNtDel'){ntDel(t);return}if(t.id==='fxNtClr'){if(FXPAD)FXPAD.clear();return}
  if(d.ntst&&PF){ntOpen(PF.id,{stage:d.ntst});return}
  if(t.id==='fxArcNew'){fxArcOpen(null);return}
  if(t.id==='fxArcOnly'){FXARC=!FXARC;renderList();return}
  if(d.fxarced){if(PF&&PF.j&&PF.id===d.fxarced)fxArcOpen(PF.j);return}
  if(t.id==='fxImpAdd'){fxArcRead();FXA.imps.push({});fxArcRender();return}
  if(d.fxirm!==undefined&&t.hasAttribute('data-fxirm')){fxArcRead();FXA.imps.splice(Number(d.fxirm),1);fxArcRender();return}
  if(d.fxaopen!==undefined&&t.hasAttribute('data-fxaopen')){fxArcRead();FXA.open=d.fxaopen==='1';fxArcRender();return}
  if(t.id==='fxaGo'){fxArcSave(t);return}},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target.closest&&e.target.closest('.pbar .ps[data-ntst]');if(!t||!PF)return;e.preventDefault();ntOpen(PF.id,{stage:t.dataset.ntst})});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.id==='fxa_type'&&FXA){fxArcRead();FXA.stage='';fxArcRender()}});

