/* ---------- m42b (owner, 2026-11-17): patient file — (1) «سیر درمان» shows the treatment-plan step as soon as a plan was written (it was
   missing until the consultant's final approval, e.g. for undecided patients in reception's follow-up); (2) a tab «همه‌ی توضیح‌ها»: every comment
   of the file in one list (who, when, which part), for every role; money comments only for the manager, the consultant and reception. ---------- */
(function(){
const FIN=()=>['manager','consultant','staff'].includes(ROLE);
const T=v=>String(v==null?'':v).trim();
const secT=k=>{try{const x=SECTIONS.find(s=>s.id===k);return x?x.t:k}catch(e){return k}};
function cmList(j){const out=[],d=j.data||{},h=d.h||{},add=(at,sec,by,text,fin)=>{text=T(text);if(!text)return;out.push({at:at||'',sec,by:T(by),text,fin:!!fin})};
  try{(j.notes||[]).forEach(n=>add(n.at,(typeof FXST==='object'&&FXST[n.stage])||'سایر',n.by,(n.kind==='pen'?'(نوشته‌ی دستی) ':'')+T(n.text)||(n.kind==='pen'?'(نوشته‌ی دستی)':''),false))}catch(e){}
  const planAt=j.queuedAt||j.createdAt;
  add(planAt,'طرح درمان',h.doc,d.note);
  try{Object.keys(d.s||{}).forEach(k=>add(planAt,'طرح درمان · '+secT(k),h.doc,(d.s[k]||{}).text))}catch(e){}
  if(d.alt&&d.alt.mode==='text')add(planAt,'طرح درمان · طرح دوم',h.doc,d.alt.text);
  if(h.sgd)add(planAt,'طرح درمان · سرجیکال گاید',h.doc,h.sgd.note);
  if(d.arc)add(d.arc.at||j.createdAt,'پرونده‌ی کاغذی',d.arc.by,d.arc.note);
  if(d.pay)add(j.doneAt||j.updatedAt,'مشاوره · شرایط پرداخت','',d.pay.note,true);
  if(j.lost&&j.lost.at)add(j.lost.at,'مشاوره · بیمار تصمیم نگرفت',j.lost.by,[T(j.lost.r),T(j.lost.note)].filter(Boolean).join(' — '));
  if(j.lost&&j.lost.closed)add(j.lost.closed,'انصراف قطعی','',j.lost.cr);
  const sg=j.surg||{};
  (sg.sessions||[]).forEach(ss=>{const sec='جراحی · جلسه‌ی '+fa(ss.n||0),who=ss.asst||ss.by;add(ss.at,sec,who,ss.note);try{Object.keys(ss.s||{}).forEach(k=>add(ss.at,sec+' · '+secT(k),who,(ss.s[k]||{}).text))}catch(e){}});
  add(sg.settledAt||sg.finishedAt,'تسویه‌ی جراحی','',sg.settleNote,true);
  if(j.pros)(j.pros.log||[]).forEach(g=>add(g.at,'پروتز · '+((typeof PSTN==='object'&&PSTN[g.k])||g.k||''),g.by,g.note));
  (j.appts||[]).forEach(a=>{if(a.by==='خودکار'||a.st==='cancel'&&!T(a.note))return;add(a.created||(a.day?a.day+'T08:00:00Z':''),'نوبت · '+((typeof AKL==='object'&&AKL[a.kind])||''),a.by,a.note)});
  (j.tasks||[]).forEach(t=>{if(/^نوبت داده شد:/.test(T(t.note)))return;add(t.doneAt||(t.due?t.due+'T08:00:00Z':''),'پیگیری · '+((typeof TLBL==='object'&&TLBL[t.kind]&&TLBL[t.kind][0])||t.kind||''),t.by,t.note)});
  (j.labs||[]).forEach(l=>{const dd=l.data||{},no=l.no?' '+faD(String(l.no)):'';add(l.created,'لابراتوار · دستور کار'+no,l.by||dd.by,dd.note);(l.log||[]).forEach(g=>add(g.at,'لابراتوار'+no,g.by,g.note,/تومان|مبلغ|قیمت|فاکتور|صورت.?حساب|تعرفه/.test(T(g.note))))});
  (j.pays||[]).forEach(p=>{if(p.st==='del')return;add(p.at,'مالی · پرداخت',p.by,p.note,true)});
  (j.refunds||[]).forEach(x=>add(x.at||x.paidAt,'مالی · استرداد',x.by,x.note,true));
  const fin=FIN(),L=out.filter(x=>fin||!x.fin);L.sort((a,b)=>String(b.at).localeCompare(String(a.at)));return L}
function cmHTML(j){const L=cmList(j);
  return `<h3 class="pf-h">همه‌ی توضیح‌ها</h3><p class="note">هر توضیحی که در طرح، مشاوره، جراحی، پروتز، نوبت‌ها، پیگیری‌ها و لابراتوار برای این بیمار نوشته شده — تازه‌ترین بالا.${FIN()?' توضیح‌های مالی فقط برای مدیر، مشاور و پذیرش دیده می‌شود.':''}</p>`+
    (L.length?`<div class="m42bl">${L.map(x=>`<div class="m42bc${x.fin?' fin':''}"><div class="m42bh"><b>${esc(x.sec)}</b><small>${esc(x.at?jt(x.at):'')}${x.by?' · '+esc(x.by):''}</small></div><p>${esc(x.text)}</p></div>`).join('')}</div>`:'<div class="empty">برای این بیمار توضیحی نوشته نشده است.</div>')}
{const _t=pfTabs;pfTabs=function(j){const was=PF&&PF.tab;if(was==='cm')PF.tab='tl';let h=_t.apply(this,arguments);if(was==='cm')PF.tab='cm';
  try{let n=0;try{n=cmList(j).length}catch(e){}const btn=`<button type="button" data-pft="cm" aria-pressed="${was==='cm'}">همه‌ی توضیح‌ها${n?' <small>'+fa(n)+'</small>':''}</button>`;
    if(!h)h=`<div class="seg pftabs" role="group" aria-label="بخش پرونده" style="margin:12px 0"><button type="button" data-pft="tl" aria-pressed="${was!=='cm'}">سیر درمان</button>${btn}</div>`;
    else{if(was==='cm')h=h.replace('data-pft="tl" aria-pressed="true"','data-pft="tl" aria-pressed="false"');const i=h.lastIndexOf('</div>');h=h.slice(0,i)+btn+h.slice(i)}}catch(e){console.error('m42b tabs',e)}
  return h}}
{const _h=pfTabHTML;pfTabHTML=function(tab,j,r){if(tab==='cm'){try{return cmHTML(j)}catch(e){return `<div class="empty">${esc(e.message)}</div>`}}return _h.apply(this,arguments)}}
/* the treatment-plan step in «سیر درمان» before the final approval */
const hasPlan=j=>{try{if(['consult','consulting','undecided'].includes(j.queue))return true;if(j.queue!=='lost')return false;const r=fromDoc(j.id||(PF&&PF.id)||'',j.data||{});return !/طرحی ثبت نشده/.test(planViewHTML(r.s))}catch(e){return false}};
const planAt=j=>{let at=j.updatedAt||j.queuedAt||j.createdAt;if(j.lost&&j.lost.at&&String(at)>String(j.lost.at))at=j.lost.at;if(String(at)<String(j.createdAt||''))at=j.createdAt;return at};
/* the path bar on top of the file: «طرح درمان» is done once the plan was given to the patient (it stayed empty until the final approval) */
{const _pb=pathBar;pathBar=function(j){try{if(j&&!j.consultAt&&!(j.status==='confirmed'||j.status==='modified')&&hasPlan(j))return _pb.call(this,Object.assign({},j,{consultAt:planAt(j)}))}catch(e){console.error('m42b bar',e)}return _pb.apply(this,arguments)}}

{const _r=renderFile;renderFile=function(){const out=_r.apply(this,arguments);try{if(PF&&PF.j&&(PF.tab||'tl')==='tl'){const j=PF.j,box=document.querySelector('#pfBody .tl');
    if(box&&!j.jalali&&!box.querySelector('.m42bp')){const r=fromDoc(PF.id,j.data||{}),h=r.h||{};
      if(hasPlan(j)){const price=FIN()||ROLE==='accountant';const at=planAt(j);
        const st=j.queue==='undecided'?'مشاوره شد؛ بیمار هنوز تصمیم نگرفته':j.queue==='lost'?'بیمار انصراف داد':['consult','consulting'].includes(j.queue)?'در انتظار مشاوره':'هنوز تأیید نهایی نشده';
        const el=document.createElement('div');el.className='tl-i m42bp';el.innerHTML=`<i></i><div><b>طرح درمان نوشته شد</b><small>${esc(jt(at))}</small><p>${esc([h.doc?'پزشک: '+h.doc:'',price&&Number(j.total)?'جمع '+fa(Number(j.total))+' تومان':'',st].filter(Boolean).join(' · '))}</p></div>`;
        const first=[...box.querySelectorAll('.tl-i')].find(x=>(x.querySelector('b')||{}).textContent==='پذیرش');if(first)first.after(el);else box.prepend(el)}}}}catch(e){console.error('m42b tl',e)}return out}}
window.m42b={cmList};
})();
