/* ---------- arc5: paper file — each treatment carries its own date and performer (surgeon for implant / All on X / overdenture /
   subperiosteal, the doctor who did it for the rest); uncovering is a treatment in the left list (count, date, doctor); implants are
   priced by the brand picked for each tooth (JD → Italian, Avita → Iranian, Straumann → Swiss, any other → Korean); no tariff lines
   under the tables. On save the works are grouped into one surgery session per date (and surgeon). ---------- */
const arcG=b=>{b=String(b||'');return /root|روت/i.test(b)?'rt':/jd/i.test(b)?'it':/avita|اویتا|آویتا/i.test(b)?'ir':/stra?uman|اشترومن|استرومن/i.test(b)?'sw':'ko'};
const ARCU='__unc';
function arcMeta(id){const A=SURG.arc;A.meta=A.meta||{};if(!A.meta[id])A.meta[id]=Object.assign({dayJ:'',by:'',asst:''},A.last||{});return A.meta[id]}
function arcSecHead(x){const m=arcMeta(x.id),solo=SOLO.includes(x.id);
  const who=solo?`<input class="arcsb" data-arcsb="${x.id}" list="dlSgDoc" placeholder="جراح *" value="${esc(m.by||'')}" aria-label="جراح ${esc(x.t)}">`
    :`<select class="sgas" data-arcsa="${x.id}" aria-label="پزشک انجام‌دهنده ${esc(x.t)}"><option value="">پزشک انجام‌دهنده *</option>${ASSTS().map(n=>`<option value="${esc(n)}"${n===m.asst?' selected':''}>${esc(n)}</option>`).join('')}</select>`;
  return `<span class="arcsh"><input class="arcsd" data-arcsd="${x.id}" placeholder="۱۴۰۲/۰۳/۱۵" value="${esc(m.dayJ||'')}" aria-label="تاریخ ${esc(x.t)}" autocomplete="off">${who}</span>`}
/* asstSel: the arc5 layer (paper file → arcSecHead) is merged into surgery/form-render.js */
function arcUncHTML(){const u=SURG.arc.unc||(SURG.arc.unc={n:'',dayJ:'',by:''});
  return `<section class="card" data-sec="${ARCU}"><h2><span class="h2t">آنکاوری</span><span class="arcsh"><input class="arcsd" data-arcud placeholder="۱۴۰۲/۰۳/۱۵" value="${esc(u.dayJ||'')}" aria-label="تاریخ آنکاوری" autocomplete="off"><input class="arcsb" data-arcub list="dlSgDoc" placeholder="پزشک *" value="${esc(u.by||'')}" aria-label="پزشک آنکاوری"></span></h2>
    <label class="f" style="max-width:220px">تعداد آنکاوری<input data-arcun inputmode="numeric" placeholder="۰" value="${u.n?esc(faD(String(u.n))):''}"></label></section>`}
{const _rs=renderSurg;renderSurg=function(){const r=_rs.apply(this,arguments);if(SURG&&SURG.arc&&SURG.openSecs&&SURG.openSecs.has(ARCU))$('surgSecs').insertAdjacentHTML('afterbegin',arcUncHTML());return r}}
{const _rp=renderPick;renderPick=function(){const r=_rp.apply(this,arguments);if(SURG&&SURG.arc){const h1=$('sgPick').querySelector('.sgh');if(h1)h1.textContent='جراحی‌ها';const h3=$('sgImpW')&&$('sgImpW').querySelector('h3');if(h3)h3.textContent='ایمپلنت‌ها';const u=SURG.arc.unc||{};$('sgPick2').insertAdjacentHTML('beforeend',`<button type="button" class="chip sgc${num(u.n)?' marked':''}" data-sgsec="${ARCU}" aria-pressed="${!!(SURG.openSecs&&SURG.openSecs.has(ARCU))}">آنکاوری${num(u.n)?' ✓':''}</button>`)}return r}}
/* remembers the last date / doctor so the next treatment starts with them */
function arcSet(e){const t=e.target,d=t.dataset;if(!SURG||!SURG.arc)return;const A=SURG.arc;A.last=A.last||{};
  if(d.arcsd){arcMeta(d.arcsd).dayJ=t.value.trim();A.last.dayJ=t.value.trim()}
  else if(d.arcsb){arcMeta(d.arcsb).by=t.value.trim();A.last.by=t.value.trim()}
  else if(d.arcsa){arcMeta(d.arcsa).asst=t.value;A.last.asst=t.value}
  else if(d.arcud!==undefined){A.unc.dayJ=t.value.trim();A.last.dayJ=A.unc.dayJ}
  else if(d.arcub!==undefined){A.unc.by=t.value.trim()}
  else if(d.arcun!==undefined){A.unc.n=Math.min(40,num(toEn(t.value)));try{renderPick()}catch(x){}}
  else return;arcCostUpd()}
document.addEventListener('input',arcSet);document.addEventListener('change',arcSet);
/* cost: each treatment by its tariff, each implant by its own brand's tariff, uncovering by the accounting service */
function arcSecCost(id,c){const P=blankSections(),S=blankSections(),src=c.s[id],t=S[id];
  Object.assign(t,JSON.parse(JSON.stringify(src)),{price:P[id].price,bp:{...P[id].bp},ip:{...P[id].ip}});
  if(IMPSECS.includes(id)&&id==='imp'){let v=0;Object.keys(t.sel).filter(k=>t.sel[k]&&isTooth(k)).forEach(k=>{const g=arcG((c.imp[k]||{}).b);v+=num(P.imp.bp[g]||P.imp.bp.ko)});['U','L'].forEach(j=>v+=num(t.jc[j])*num(P.imp.bp.ko));return v}
  const b=id==='aox'?'it':(()=>{const k=Object.keys(t.sel).find(k=>t.sel[k]&&isTooth(k)&&c.imp[k]&&c.imp[k].b);return k?arcG(c.imp[k].b):'ko'})();
  const T=totals({s:S,brand:b,pay:{}});return T.surg[b]+T.pros}
/* arcCostAll, arcCostUpd: arc4 base replaced by arc5 */
function arcCostAll(){const A=SURG&&SURG.arc;if(!A)return {rows:[],tot:0};const c=A.ses[0],pv={s:c.s,brand:'ko',pay:{}},rows=[];
  SECTIONS.forEach(x=>{if(!rowUsed(pv,x))return;const m=(A.meta||{})[x.id]||{};rows.push({t:x.t,d:m.dayJ,v:arcSecCost(x.id,c)})});
  const u=A.unc||{};if(num(u.n))rows.push({t:'آنکاوری '+fa(num(u.n))+' عدد'+(ARC_UNC?' × '+fa(ARC_UNC):' (تعرفه‌ی آنکاوری در خدمات حسابداری تعریف نشده)'),d:u.dayJ,v:num(u.n)*(ARC_UNC||0)});
  return {rows,tot:rows.reduce((a,r)=>a+r.v,0)}}
function arcCostUpd(){const el=$('arcCost');if(!el||!SURG||!SURG.arc)return;const {rows,tot}=arcCostAll();
  el.innerHTML=`<h3>هزینه‌ی کل بیمار (بر اساس تعرفه‌ها و کارهای انتخاب‌شده)</h3>${rows.length?`<table class="arcct"><tbody>${rows.map(r=>`<tr><td>${esc(r.t)}${r.d?' · '+esc(faD(r.d)):''}</td><td>${fa(r.v)}</td></tr>`).join('')}</tbody><tfoot><tr><td>جمع کل</td><td>${fa(tot)} تومان</td></tr></tfoot></table>`:'<p class="note">هنوز کاری علامت نخورده.</p>'}
  <p class="note">${FXA&&FXA.id?'پرداخت‌ها را پایین همین صفحه یا در «مالی بیماران» اصلاح کنید.':'پرداخت‌های بیمار را بعد از ثبت، در «مالی بیماران» یا با «ویرایش» همین پرونده وارد کنید.'}</p>`}
/* save: one session per date (and surgeon); arcSave: arc3 base replaced by arc5 */
async function arcSave(btn){const A=fxArcRead(),m=$('fxaMsg'),err=(t,id)=>{m.className='msg err';m.textContent=t;if(id){const s=document.querySelector(`#surgSecs [data-sec="${id}"]`);if(!s&&SURG.openSecs){SURG.openSecs=new Set([id]);renderSurg()}const s2=document.querySelector(`#surgSecs [data-sec="${id}"]`);if(s2)s2.scrollIntoView({behavior:'smooth',block:'center'})}};
  if(!A.name){err('نام بیمار را بنویسید.');$('fxa_name').focus();return}
  const day=A.dayJ?parseJ(A.dayJ):'';if(A.dayJ&&!day)return err('تاریخ اولین مراجعه درست نیست.');const due=A.dueJ?parseJ(A.dueJ):'';if(A.dueJ&&!due)return err('تاریخ پیگیری درست نیست.');
  const bv=(A.visits||[]).find(x=>(x.dayJ||x.svc||x.cost||x.paid||x.note||x.teeth)&&!x.day);if(bv)return err('تاریخ هر مراجعه را درست وارد کنید.');
  const Z=SURG.arc,c=Z.ses[0],pv={s:c.s,brand:'ko',pay:{}},used=SECTIONS.filter(x=>rowUsed(pv,x)),G={},imps=[];
  for(const x of used){const mt=arcMeta(x.id),dd=parseJ(mt.dayJ||''),solo=SOLO.includes(x.id),who=solo?mt.by:mt.asst;
    if(!dd)return err(x.t+': '+(mt.dayJ?'تاریخ «'+mt.dayJ+'» درست نیست؛ مثل ۱۴۰۲/۰۳/۱۵ بنویسید.':'تاریخ را بنویسید.'),x.id);if(dd>tDay())return err(x.t+': تاریخ نمی‌تواند بعد از امروز باشد.',x.id);
    if(!who)return err(x.t+': '+(solo?'جراح':'پزشک انجام‌دهنده')+' را بنویسید؛ اگر معلوم نیست «'+ARC_DOC+'».',x.id);
    if(x.sgt){const bad=['U','L'].filter(j=>arcWant(c.s,x.id,j)!==teethSel(c.s[x.id],j));if(bad.length)return err(x.t+': تعداد پایه با دندان‌های زده‌شده نمی‌خواند.',x.id)}
    const key=dd+'|'+(solo?mt.by:'');(G[key]=G[key]||{day:dd,by:solo?mt.by:'',ids:[]}).ids.push({x,who})}
  const u=Z.unc||{};let uKey='';if(num(u.n)){const dd=parseJ(u.dayJ||'');if(!dd)return err('آنکاوری: تاریخ را درست بنویسید.',ARCU);if(dd>tDay())return err('آنکاوری: تاریخ نمی‌تواند بعد از امروز باشد.',ARCU);if(!u.by)return err('آنکاوری: پزشک را بنویسید؛ اگر معلوم نیست «'+ARC_DOC+'».',ARCU);uKey=Object.keys(G).find(k=>G[k].day===dd)||(dd+'|');if(!G[uKey])G[uKey]={day:dd,by:'',ids:[]};G[uKey].unc=num(u.n);G[uKey].uby=u.by}
  /* non-surgeon treatments of a day go with that day's first surgeon group */
  Object.keys(G).forEach(k=>{const g=G[k];if(g.by)return;const o=Object.keys(G).find(k2=>k2!==k&&G[k2].day===g.day&&G[k2].by);if(o){G[o].ids.push(...g.ids);if(g.unc){G[o].unc=g.unc;G[o].uby=g.uby}delete G[k]}});
  const ses=Object.keys(G).sort().map(k=>{const g=G[k],S=blankSections(),imp={},sa={};let asst='';
    g.ids.forEach(({x,who})=>{S[x.id]=c.s[x.id];if(!SOLO.includes(x.id)){if(!asst)asst=who;else if(who!==asst)sa[x.id]=who}
      if(IMPSECS.includes(x.id))Object.keys(c.s[x.id].sel).filter(k2=>c.s[x.id].sel[k2]&&isTooth(k2)).forEach(k2=>{const v=Object.assign({b:'',sys:'',g:'',d:'',l:'',ht:'',hs:'',rs:'new',note:'پرونده‌ی کاغذی'},c.imp[k2]||{});v.g=v.b?arcG(v.b):v.g;imp[k2]=v;imps.push({t:k2,b:v.b,sys:v.sys||'',g:v.g||'',d:v.d||'',l:v.l||'',day:g.day,by:g.by||asst})})});
    return {day:g.day,by:g.by||asst||g.uby||ARC_DOC,asst,sa,sa2:{},st:{},s:secDoc(S),imp,uncN:g.unc||0}});
  m.textContent='';
  const arc={name:A.name,phone:A.phone,nid:A.nid,age:A.age,city:A.city,doc:A.doc,file:A.file,day,other:A.other,note:A.note,open:!!A.open,type:A.type,stage:A.stage,due,ses,imps,cost:arcCostAll().tot,
    visits:(A.visits||[]).filter(x=>x.day).map(x=>({day:x.day,svc:x.svc,teeth:x.teeth,doc:x.doc,cost:x.cost,paid:x.paid,method:x.method,no:x.no,note:x.note}))};
  btn.disabled=true;try{const r=await api('fxArc',{id:A.id||'',arc,by:fxBy()},{timeout:25000});const ed=!!A.id;
    toast(ed?'اطلاعات بایگانی ذخیره شد.':'پرونده‌ی جا مانده ثبت شد؛ اسکن پرونده را در «تصاویر» اضافه کنید.');arcExit();try{loadList()}catch(e){}pollQ(true);openFile(r.id,arc.name,ed?'tl':'img')}
  catch(e){m.className='msg err';m.textContent=e.message}finally{btn.disabled=false}}

/* ttl2: the tiles strip has a display rule that beat its «hidden» attribute, so it stayed on the sign-in page after «خروج» */
{const _sh=show;show=function(v){const r=_sh.apply(this,arguments);document.body.classList.toggle('ttlout',v==='login');if(v==='login')document.body.classList.remove('ux2tc');return r}}
try{if(!ROLE||!$('viewLogin').hidden)document.body.classList.add('ttlout')}catch(e){}

