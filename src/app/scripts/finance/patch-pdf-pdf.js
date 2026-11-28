/* ---------- patch-pdf: PDF کامل پرونده‌ی بیمار (همه‌ی نقش‌ها) ---------- */
const pdfIco=(id,name)=>id?`<span class="pdfi" role="button" tabindex="0" data-pdfall="${esc(id)}" data-pdfn="${esc(name||'')}" title="PDF کامل پرونده" aria-label="PDF کامل پرونده">📄</span>`:'';
const FF_AST={set:'تعیین‌شده',done:'انجام شد',noshow:'نیامد',cancel:'لغو'};
const ffCut=(s,n=60)=>{s=String(s==null?'':s).replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s};
const ffDay=d=>d?jDay(String(d).slice(0,10)):'—';
const ffTbl=(rows,cols)=>{if(!rows.length)return impTable([cols.map((c,i)=>i===0?'موردی ثبت نشده':'')],cols);const N=26,out=[];for(let i=0;i<rows.length;i+=N)out.push(impTable(rows.slice(i,i+N),cols));return out.length===1?out[0]:{h:0,parts:out,draw(){}}};
const ffGap=h=>({h,draw(){}});
const ffBreak=()=>({h:0,pageBreak:true,draw(){}});
const ffTitle=t=>Object.assign(bigTitle(t),{keep:true});
function ffStatusLines(j,r,sg){const h=r.h||{},L=[];
  const q=j.queue||'';let st='';
  if(q&&q!=='done'&&QLBL[q])st=QLBL[q][1];else if(j.status==='draft')st='پیش‌نویس';else if(j.status==='queued')st='در صف پزشک';else if(j.status==='confirmed'||j.status==='modified')st='طرح تأیید شده';else st=j.status||'—';
  if(sg.finished)st+=' · درمان جراحی تمام شده';if(j.pros&&j.pros.stage)st+=' · پروتز: '+(PSTN[j.pros.stage]||j.pros.stage);
  L.push('وضعیت فعلی: '+st);if(h.file)L.push('شماره پرونده: '+faD(h.file));{const a=(j.data||{}).arc;if(a){L.push('ورود از پرونده‌ی کاغذی (بایگانی)'+(a.day?' · اولین مراجعه '+jDay(a.day):''));if(a.other)L.push('درمان‌های دیگر (پرونده‌ی کاغذی): '+a.other);if(a.note)L.push('توضیح بایگانی: '+a.note);(a.visits||[]).forEach(v=>L.push('مراجعه '+jDay(v.day)+': '+[v.svc,v.teeth?'دندان '+v.teeth:'',v.doc,!j.nofin&&v.cost?'هزینه '+fa(v.cost):'',!j.nofin&&v.paid?'پرداخت '+fa(v.paid)+' ('+(FX2M[v.method]||'')+')':'',v.note].filter(Boolean).join(' · ')))}}
  if(j.createdAt)L.push('پذیرش: '+jt(j.createdAt)+(h.asst?' · توسط '+h.asst:''));
  if(j.jalali)L.push('تأیید طرح درمان: '+j.jalali+(j.edits?' · '+fa(j.edits)+' بار ویرایش':''));
  if(j.surgAt)L.push('ارجاع به جراحی: '+jt(j.surgAt));
  if(sg.finished&&sg.finishedAt)L.push('پایان جراحی: '+jt(sg.finishedAt));
  if(j.lost&&j.lost.at)L.push('تصمیم نگرفت ('+jt(j.lost.at)+'): '+(j.lost.r||'')+(j.lost.note?' — '+j.lost.note:''));
  if(j.lost&&j.lost.closed)L.push('انصراف قطعی ('+jt(j.lost.closed)+')'+(j.lost.cr?': '+j.lost.cr:''));
  if(h.ref)L.push('معرف: '+h.ref);if(h.note)L.push('یادداشت پذیرش: '+h.note);
  if((j.files||[]).length)L.push('پیوست‌ها: '+fa(j.files.length)+' فایل ('+j.files.map(f=>ffCut(f.name||f.kind||'',25)).slice(0,6).join('، ')+(j.files.length>6?'، …':'')+')');
  return L}
function ffPlanBlocksNP(r){const B=[];let plans=[PV(r,1)];if(r.alt&&r.alt.mode==='full'&&(r.sx||r.s2))plans=plans.concat((r.sx||[r.s2]).map((_,i)=>PV(r,i+2)));
  plans.forEach((p,i)=>{B.push(ffTitle(plans.length>1?'طرح درمان '+fa(i+1):'طرح درمان'));const L=secLines(p.s).map(l=>l.t+': '+l.d);B.push(textBlock('',L.length?L:['—']))});
  if(r.alt&&r.alt.mode==='text'&&(r.alt.text||'').trim())B.push(textBlock('طرح درمان پیشنهادی دوم',r.alt.text.split(/\n/)));return B}
function ffPlanBlocks(r){const B=[];let plans=[PV(r,1)];
  if(r.alt&&r.alt.mode==='full'&&(r.sx||r.s2))plans=plans.concat((r.sx||[r.s2]).map((_,i)=>PV(r,i+2)));
  plans.forEach((p,i)=>{B.push(ffTitle(plans.length>1?'طرح درمان '+fa(i+1):'طرح درمان'));B.push(tableHead());
    const used=SECTIONS.filter(x=>rowUsed(p,x));(used.length?used:SECTIONS).forEach(x=>{const b=sectionRow(p,x);b.table=true;B.push(b)});
    B.push(ffGap(16));B.push(totalsBlock(p,plans.length>1?'طرح '+fa(i+1)+' · جمع کل به تفکیک برند ایمپلنت':null));B.push(payBlock(p))});
  if(r.alt&&r.alt.mode==='text'&&(r.alt.text||'').trim())B.push(textBlock('طرح درمان پیشنهادی دوم',r.alt.text.split(/\n/)));
  return B}
function ffFinBlocks(j,r,sg){const B=[ffTitle('مالی')];const N=payNums(j),P=(j.pays||[]).filter(p=>p.st!=='del');
  const sum=[['مبلغ نهایی طرح',money(N.total)],['دریافت‌شده',money(N.got)],['چک در انتظار سررسید',money(N.wait)],['مانده',money(Math.max(0,N.rest))]];
  if(N.bounce)sum.push(['چک برگشتی',money(N.bounce)]);if(N.rest<0)sum.push(['بستانکاری بیمار',money(-N.rest)]);
  try{if(discOn(r)){const pv=PV(r,1),T=totals(pv),S=T.surg[effBrand(r)]||0;sum.push(['تخفیف نقدی',fa(discPct(r))+'٪ · '+money(discAmt(r,S)+discAmt(r,T.pros||0))])}}catch(e){}
  B.push(impTable(sum,[['شرح',0.5],['مبلغ',0.5]]));
  if(sg.planned||sg.actual||sg.diff){const L=[];if(sg.planned)L.push('هزینه‌ی برآوردی طرح: '+money(sg.planned));if(sg.actual)L.push('هزینه‌ی واقعی جراحی: '+money(sg.actual));
    if(sg.diff)L.push('اختلاف هزینه: '+(sg.diff>0?'+':'−')+money(Math.abs(sg.diff))+(j.settle==='pending'?' · منتظر تسویه':j.settle==='done'?' · تسویه شد'+(sg.settledAt?' ('+jt(sg.settledAt)+')':'')+(sg.settleNote?' — '+sg.settleNote:''):''));
    B.push(textBlock('تسویه‌ی جراحی',L))}
  B.push(Object.assign(textBlock('دریافت‌ها و چک‌ها',[]),{keep:true}));
  const rows=P.slice().sort((a,b)=>String(a.kind==='chq'?a.due:a.at).localeCompare(String(b.kind==='chq'?b.due:b.at))).map(p=>{const s=(PAY_ST[p.st]||['',p.st])[1];
    return [p.kind==='chq'?ffDay(p.due):jd(p.at),a6PayK(p)+(p.pos&&posName(p.pos)?' · '+posName(p.pos):''),p.part==='s'?'جراحی':p.part==='p'?'پروتز':'—',fa(p.amount||0),s||'—',ffCut([p.kind==='chq'&&p.no?'شماره '+faD(p.no):'',p.bank||'',p.note||''].filter(Boolean).join(' · '),40)]});
  (j.refunds||[]).forEach(x=>rows.push([x.st==='paid'?jd(x.paidAt):jd(x.at),'استرداد به بیمار','—',fa(x.amount||0),x.st==='paid'?'پرداخت شد'+(x.method?' ('+({cash:'نقد',card:'کارت',bank:'بانک'}[x.method]||x.method)+')':''):'در انتظار پرداخت',ffCut(x.note,40)]));
  B.push(ffTbl(rows,[['تاریخ / سررسید',0.15],['نوع',0.13],['پارت',0.11],['مبلغ (تومان)',0.17],['وضعیت',0.17],['شماره · بانک · توضیح',0.27]]));
  return B}
function ffSurgBlocks(j,sg){const B=[ffTitle('جراحی‌ها')];surgBlocks(sg).forEach(b=>B.push(b));
  if(sg.dis){B.push(textBlock('ترخیص',['ترخیص در '+jt(sg.dis.at)+(sg.dis.by?' توسط '+sg.dis.by:'')+(sg.dis.care?' · آموزش مراقبت داده شد':'')+(sg.dis.note?' — '+sg.dis.note:'')]))}
  if(sg.rxAt)B.push(textBlock('',['نسخه و دستورات بعد از جراحی چاپ شد: '+jt(sg.rxAt)]));
  return B}
function ffVisitBlocks(j,td){const AP=(j.appts||[]).filter(a=>a.st!=='cancel'),LK=new Set((j.appts||[]).map(a=>a.task).filter(Boolean)),TK=(j.tasks||[]).filter(t=>!LK.has(t.id));
  const past=AP.filter(a=>!AGRP.pr.includes(a.kind)&&!AGRP.sg.includes(a.kind)&&(a.st==='done'||a.st==='noshow'||a.day<td)).map(a=>({d:a.day+' '+(a.time||''),row:[jDay(a.day)+(a.time?' '+faD(a.time):''),AKL[a.kind]||a.kind,a.doc||'—',FF_AST[a.st]||a.st||'—',ffCut(a.note,40)]}));
  const unc=AP.filter(a=>a.kind==='uncover'&&(a.st==='done'||a.st==='noshow'||a.day<td)).map(a=>({d:a.day+' '+(a.time||''),row:[jDay(a.day)+(a.time?' '+faD(a.time):''),AKL[a.kind],a.doc||'—',FF_AST[a.st]||a.st||'—',ffCut(a.note,40)]}));
  const tk=TK.filter(t=>t.done&&['numb','week','suture','uncover','recall','fol1','fol4','pweek'].includes(t.kind)).map(t=>({d:(t.doneAt||t.due||'').slice(0,10),row:[jd(t.doneAt)||ffDay(t.due),(TLBL[t.kind]||[t.kind])[0],'—','انجام شد',ffCut(t.note,40)]}));
  const rows=past.concat(unc,tk).sort((a,b)=>a.d.localeCompare(b.d)).map(x=>x.row);
  return [ffTitle('بخیه، چکاپ، آنکاوری و پیگیری‌ها'),ffTbl(rows,[['تاریخ',0.18],['مورد',0.26],['پزشک',0.18],['نتیجه',0.14],['توضیح',0.24]])]}
/* ffProsBlocks: base + m58a (full long notes of the steps) + m61a (ادامه درمان: tooth stages, surgeon holds, next step).
   The early return [] needs no extra part: both added parts read j.pros, which is empty there. */
function ffProsBlocks(j,td){const pr=j.pros,labs=j.labs||[],AP=(j.appts||[]).filter(a=>a.st!=='cancel'&&AGRP.pr.includes(a.kind)&&(a.st==='done'||a.st==='noshow'||a.day<td));
  if(!pr&&!labs.length&&!AP.length)return [];
  const B=[ffTitle('پروتز و لابراتوار')];
  if(pr){const L=['مرحله‌ی فعلی: '+(PSTN[pr.stage]||pr.stage||'—')];if(pr.ready)L.push('زمان تقریبی آنکاوری / قالب‌گیری: '+ffDay(pr.ready));
    if(pr.map&&Object.keys(pr.map).length){const M=pr.map,A=Object.keys(M).filter(k=>M[k]==='a'),P=Object.keys(M).filter(k=>M[k]==='p');L.push('پایه‌ها: '+(toothTxt(A)||'—')+(P.length?' · پونتیک: '+toothTxt(P):'')+(pr.mapBy?' · ثبت '+pr.mapBy:''))}
    B.push(textBlock('',L));
    const lg=(pr.log||[]).map(g=>[jt(g.at),(PSTN[g.k]||g.k)+(g.rep?' (تکرار)':''),g.by||'—',ffCut(g.note,50)]);
    if(lg.length){B.push(Object.assign(textBlock('مراحل ثبت‌شده',[]),{keep:true}));B.push(ffTbl(lg,[['تاریخ',0.22],['مرحله',0.3],['ثبت‌کننده',0.18],['توضیح',0.3]]))}}
  if(labs.length){B.push(Object.assign(textBlock('سفارش‌های لابراتوار',[]),{keep:true}));
    B.push(ffTbl(labs.map(l=>{const d=l.data||{};return [jd(l.created),d.for&&LFOR[d.for]?LFOR[d.for]:[d.type,d.mat].filter(Boolean).join(' ')||'—',LST[l.st]||l.st,ffDay(l.due),ffCut([d.sys,d.shade&&'رنگ '+d.shade,d.note].filter(Boolean).join(' · '),40)]}),[['سفارش',0.16],['برای ساخت',0.26],['وضعیت',0.2],['سررسید',0.14],['توضیح',0.24]]))}
  if(AP.length){B.push(Object.assign(textBlock('نوبت‌های پروتز',[]),{keep:true}));B.push(ffTbl(AP.map(a=>[jDay(a.day)+(a.time?' '+faD(a.time):''),AKL[a.kind]||a.kind,a.doc||'—',FF_AST[a.st]||a.st||'—',ffCut(a.note,40)]),[['تاریخ',0.18],['مورد',0.26],['پزشک',0.18],['نتیجه',0.14],['توضیح',0.24]]))}
  /* m58a */
  try{const lg=((j.pros||{}).log||[]).filter(g=>String(g.note||'').replace(/\s+/g,' ').trim().length>50);
  if(lg.length)B.push(textBlock('توضیح کامل مراحل',lg.map(g=>jt(g.at)+' · '+(PSTN[g.k]||g.k)+': '+String(g.note).replace(/\s+/g,' ').trim())))}catch(e){}
  /* m61a */
  try{const pr=j.pros||{},L=[];
  if(pr.ts&&Object.keys(pr.ts).length)L.push('مرحله‌ی دندان‌ها: '+Object.keys(pr.ts).map(k=>toothTxt([k])+' '+(PSTN[pr.ts[k]]||pr.ts[k])).join('، '));
  if(pr.hold)L.push('منتظر معاینه‌ی جراح — '+toothTxt(pr.hold.teeth||[]));
  (pr.holds||[]).forEach(h=>L.push('معاینه‌ی جراح '+jd(h.end)+' ('+(h.decBy||'')+'): '+({ok:'مشکلی ندارد',stop:'توقف تا کاشت دوباره',pon:'پونتیک',wo:'بدون دندان'}[h.dec]||h.dec)+' — '+toothTxt(h.teeth||[])));
  if(pr.nxt)L.push('مرحله‌ی بعد: '+(M61N[pr.nxt.st]||pr.nxt.st)+' — '+jd(pr.nxt.day+'T12:00:00Z'));
  if(L.length)B.push(textBlock('ادامه درمان',L))}catch(e){}
  return B}
function ffFutureBlocks(j,td){const LK=new Set((j.appts||[]).map(a=>a.task).filter(Boolean));const AP=(j.appts||[]).filter(a=>a.st==='set'&&a.day>=td).map(a=>({d:a.day+' '+(a.time||'99'),row:[jDay(a.day)+(a.time?' '+faD(a.time):''),'نوبت '+(AKL[a.kind]||a.kind),a.doc||'—',a.sms?'یادآوری رفت':'—',ffCut(a.note,40)]}));
  const TK=(j.tasks||[]).filter(t=>!t.done&&!LK.has(t.id)).map(t=>({d:t.due+' 00',row:[ffDay(t.due),t.kind==='book'&&t.info==='cont'?'ادامه‌ی جراحی؛ نوبت جلسه‌ی بعد':(TLBL[t.kind]||[t.kind])[0],'—',dDiff(t.due,td)<0?'عقب‌افتاده':'برنامه‌ریزی‌شده',ffCut(t.note,40)]}));
  const rows=AP.concat(TK).sort((a,b)=>a.d.localeCompare(b.d)).map(x=>x.row);
  return [ffTitle('نوبت‌ها و کارهای آینده'),ffTbl(rows,[['تاریخ',0.18],['مورد',0.3],['پزشک',0.16],['وضعیت',0.14],['توضیح',0.22]])]}
/* fullFilePDF: base + arc6 (card readers loaded first; a paper file (arc.v6) gets its own PDF, a6Pdf) */
async function fullFilePDF(j){try{await ensurePos()}catch(e){}const a=((j&&j.data)||{}).arc;if(a&&a.v6)return a6Pdf(j);
  try{await Promise.race([logoReady,new Promise(z=>setTimeout(z,1500))])}catch(e){}
  try{await Promise.race([Promise.all([document.fonts.load(`400 20px Vazirmatn`),document.fonts.load(`700 20px Vazirmatn`),document.fonts.load(`800 20px Vazirmatn`)]),new Promise(z=>setTimeout(z,1500))])}catch(e){}
  const r=fromDoc(j.id,j.data||{});if(j.surg)r.surg=j.surg;const sg=j.surg||{},td=tDay(),now=jalali(new Date());
  const meta={title:'پرونده‌ی کامل بیمار',dateLine:'تاریخ گزارش: '+now.slash+(j.jalali?' · تأیید طرح: '+j.jalali:'')};
  const blocks=[];
  blocks.push(ffTitle('وضعیت پرونده'));blocks.push(textBlock('',ffStatusLines(j,r,sg)));
  if(j.status!=='draft'&&j.status!=='queued'||(r.s&&SECTIONS.some(x=>rowUsed(PV(r,1),x)))){blocks.push(ffGap(20));(j.nofin?ffPlanBlocksNP(r):ffPlanBlocks(r)).forEach(b=>blocks.push(b))}
  if(!j.nofin){blocks.push(ffGap(20));ffFinBlocks(j,r,sg).forEach(b=>blocks.push(b))}
  if((sg.sessions||[]).length){blocks.push(ffBreak());ffSurgBlocks(j,sg).forEach(b=>blocks.push(b))}
  {const nb=await ntPdfBlocks(j);if(nb.length){blocks.push(ffGap(20));nb.forEach(b=>blocks.push(b))}}
  {const cb=await fx3CmpPdf(j);if(cb.length){blocks.push(ffGap(20));cb.forEach(b=>blocks.push(b))}}
  blocks.push(ffGap(20));ffVisitBlocks(j,td).forEach(b=>blocks.push(b));
  const pb=ffProsBlocks(j,td);if(pb.length){blocks.push(ffGap(20));pb.forEach(b=>blocks.push(b))}
  blocks.push(ffGap(20));ffFutureBlocks(j,td).forEach(b=>blocks.push(b));
  const flat=[];blocks.forEach(b=>{if(b.parts)b.parts.forEach(x=>flat.push(x));else flat.push(b)});
  const pages=[];let pg,y;const bottom=PH-M-36;
  const start=first=>{const cv=document.createElement('canvas');cv.width=PW;cv.height=PH;const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,PW,PH);pg={cv,cx};pages.push(pg);y=M;
    const hb=first?headerBlock(r,meta):miniHeader(r,meta);hb.draw(cx,y);y+=hb.h};
  start(true);{const mb=medBlock(r);mb.draw(pg.cx,y);y+=mb.h+10}
  flat.forEach((b,i)=>{if(b.pageBreak){if(y>bottom-500)start(false);return}const nx=flat[i+1];if(b.keep&&nx&&y+b.h+Math.min(nx.h,160)>bottom)start(false);if(y+b.h>bottom){start(false);if(b.table){const t2=tableHead();t2.draw(pg.cx,y);y+=t2.h}}b.draw(pg.cx,y);y+=b.h});
  pages.forEach((p,i)=>T(p.cx,`صفحه ${fa(i+1)} از ${fa(pages.length)} · ${r.h.name||''}`,PW/2,PH-M+6,{s:16,c:GREY,a:'center'}));
  const urls=pages.map(p=>p.cv.toDataURL('image/jpeg',0.82));
  const bytes=jpegPDF(urls.map(u=>({jpg:dataUrlBytes(u),w:PW,h:PH})));
  return new Blob([bytes],{type:'application/pdf'})}
async function pdfAllGo(t){if(t.classList.contains('busy'))return;t.classList.add('busy');const isBtn=t.tagName==='BUTTON',old=t.textContent;if(isBtn)t.textContent='در حال ساخت…';
  try{const j=await api('pdfFull',{id:t.dataset.pdfall},{timeout:15000});if(!j||!j.ok)throw new Error((j&&j.error)||'خطا');
    const b=await fullFilePDF(j);const nm=((j.data||{}).h||{}).name||t.dataset.pdfn||'بیمار';downloadBlob(b,safeName(nm)+' - پرونده کامل - '+jalali(new Date()).dash+'.pdf');try{toast('PDF پرونده ساخته شد')}catch(e){}}
  catch(err){alertMsg('PDF پرونده ساخته نشد: '+(err&&err.message||err))}
  finally{t.classList.remove('busy');if(isBtn)t.textContent=old}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pdfall]');if(!t)return;e.preventDefault();e.stopPropagation();pdfAllGo(t)},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target.closest&&e.target.closest('.pdfi[data-pdfall]');if(!t)return;e.preventDefault();e.stopPropagation();pdfAllGo(t)},true);

