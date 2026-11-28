/* ---------- mgr2: management reports (manager only; counts and sums, no patient names) ---------- */
const MRS={rep:'funnel',per:null,pk:'m',f:{},p:{},res:null,docs:[],chart:null};
const MRR=[
 ['بیمار و فروش',[['funnel','مسیر بیماران (قیف تبدیل)','r',['doc','brand']],['conv','نرخ تأیید طرح به تفکیک','r',['doc','brand'],['g']],['lost','دلیل تأیید نکردن و بازگشت بیماران','r',['doc','brand']],['times','زمان بین مراحل درمان','r',['doc','brand']],['monthly','روند ماهانه‌ی کلینیک','r',['doc','brand']],['svc','خدمات طرح‌های تأییدشده','r',['doc','brand']]]],
 ['مالی',[['rev','درآمد و دریافتی ماهانه','r',['doc','brand']],['paym','روش پرداخت و کارتخوان‌ها','r',[]],['ar','طلب از بیماران و سن بدهی','none',['doc','brand']],['chq','چک‌های دریافتی به تفکیک سررسید','r',[]],['refund','برگشت وجه','r',[]],['settle','اختلاف هزینه‌ی جراحی با طرح','r',['doc','brand']],['pl','هزینه در برابر درآمد','r',[]],['svcrev','درآمد به تفکیک خدمت و پزشک','r',[]],['disc','تخفیف‌ها','r',[]]]],
 ['درمان و کیفیت',[['imp','ایمپلنت‌های کاشته‌شده','r',['doc','brand'],['ig']],['fail','نرخ شکست ایمپلنت','r',['doc'],['fg']],['prost','مدت مراحل پروتز و اصلاحات','r',['doc','brand']],['prosnow','وضعیت فعلی پروتزها','none',['doc','brand']],['lab','عملکرد لابراتوار','r',[]],['rpr','مشکلات بعد از تحویل پروتز','r',['doc','brand']]]],
 ['نوبت‌ها و پرسنل',[['appt','نوبت‌ها و نیامدن بیمار','r',['doc'],['ag']],['heat','شلوغی روزها و ساعت‌ها','r',['doc']],['task','پیگیری‌ها و تماس‌ها','r',[]],['perf','عملکرد افراد','r',[]],['att','حضور و ساعت کار','r',[]]]]];
const MRD={};MRR.forEach(([g,L])=>L.forEach(([k,t,rg,f,p])=>{MRD[k]={k,t,g,rg,f,p:p||[]}}));
const MRG={g:[['doc','پزشک'],['ref','معرف'],['city','شهر'],['brand','برند'],['age','گروه سنی'],['cby','تأییدکننده (مشاور)'],['asst','پزشک دستیار']],ig:[['mon','ماه'],['doc','جراح'],['b','برند'],['sys','سیستم'],['size','قطر و طول']],
  fg:[['b','برند'],['sys','سیستم'],['size','قطر و طول'],['doc','پزشک'],['sup','تأمین‌کننده']],ag:[['kind','نوع نوبت'],['doc','پزشک'],['wd','روز هفته'],['mon','ماه']]};
const MRPL={g:'تفکیک',ig:'تفکیک',fg:'تفکیک',ag:'تفکیک'};
const MRBR={ir:'ایرانی',ko:'کره‌ای',it:'ایتالیایی',sw:'سوئیسی'};
const MRWD=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
const MRPK={cash:'نقد',card:'کارت',chq:'چک'};
let MRTB=[];
const mrOn=()=>ROLE==='manager'&&TILE==='mrep';
const mrPct=(a,b)=>b?Math.round(a/b*1000)/10:null;
const mrDy=v=>v===null||v===undefined||v===''?'—':faD(String(v));
const mrHM=m=>m===null||m===undefined?'—':faD(String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'));
/* mrApply layers: base + ux6 (manager «داشبورد و گزارش‌ها» in one tile: with UX6.mr on, TILE is 'mrep' while this runs and is restored
   afterwards even on an error; then the «داشبورد / گزارش‌های مدیریتی» buttons, also when the dashboard is hidden) */
function mrApply(){let sw=false,t0;if(ROLE==='manager'&&TILE==='dash'&&UX6.mr){t0=TILE;TILE='mrep';sw=true}
  try{const v=$('viewDash');if(v&&!v.hidden){const on=mrOn();let B=$('mrBody');if(!B){B=document.createElement('div');B.id='mrBody';B.hidden=true;$('dBody').after(B)}
  $('dPer').hidden=on;$('dBody').hidden=on;$('dAt').hidden=on;B.hidden=!on;const h=v.querySelector('.dhead h2');if(h)h.textContent=on?'گزارش‌های مدیریتی':'داشبورد مدیریت';if(on)mrRender()}}
  finally{if(sw)TILE=t0}
  try{ux6DashSeg()}catch(e){}}
function mrMonths(from,to){return i2Months(from,to)}
/* days → Jalali months (all months of the range, empty ones included) */
function mrByMon(rows,from,to,fields){const M={};rows.forEach(r=>{const k=i2Mon(r.day),x=M[k]||(M[k]={mon:k});fields.forEach(f=>{x[f]=(x[f]||0)+(Number(r[f])||0)})});
  return mrMonths(from,to).map(m=>Object.assign({mon:m.k},Object.fromEntries(fields.map(f=>[f,0])),M[m.k]||{}))}
const cMon=()=>({k:'mon',l:'ماه',v:r=>i2MonL(r.mon)});
function mrFiltHTML(d){const f=MRS.f,p=MRS.p,H=[];
  if(d.rg==='r'){const r=MRS.per;H.push(`<div class="i2dates"><label class="f">از<input id="mrFrom" inputmode="numeric" value="${esc(jDay(r.from))}"></label><label class="f">تا<input id="mrTo" inputmode="numeric" value="${esc(jDay(r.to))}"></label>
    <span class="chips">${I2PRE.map(([k,l])=>`<button type="button" class="chip" data-mrpre="${k}" aria-pressed="${MRS.pk===k}">${l}</button>`).join('')}<button type="button" class="chip" data-mrpre="c" aria-pressed="${MRS.pk==='c'}">دلخواه از / تا</button></span></div>`)}
  const S=[];
  if(d.f.includes('doc'))S.push(`<label class="f">پزشک<input id="mrf_doc" list="mrdlDoc" value="${esc(f.doc||'')}" placeholder="همه"></label>`);
  if(d.f.includes('brand'))S.push(`<label class="f">برند طرح<select id="mrf_brand">${i2Opts(Object.entries(MRBR),f.brand)}</select></label>`);
  d.p.forEach(k=>{const L=MRG[k];S.push(`<label class="f">${MRPL[k]}<select id="mrp_${k}">${L.map(([v,l])=>`<option value="${v}"${(p[k]||L[0][0])===v?' selected':''}>${l}</option>`).join('')}</select></label>`)});
  return H.join('')+(S.length?`<div class="fields i2flt">${S.join('')}</div>`:'')+`<datalist id="mrdlDoc">${(MRS.docs||[]).map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`+
    `<div class="btns i2go"><button class="btn" type="button" id="mrGo">نمایش گزارش</button><span class="i2x"><button type="button" class="btn ghost sm" data-mrx="x">⬇ اکسل</button><button type="button" class="btn ghost sm" data-mrx="pdf">📄 PDF</button><button type="button" class="btn ghost sm" data-mrx="p">🖨 چاپ</button></span></div>`}
function mrFiltRead(){const d=MRD[MRS.rep],g=id=>{const e=$(id);return e?String(e.value).trim():undefined};['doc','brand'].forEach(k=>{const v=g('mrf_'+k);if(v!==undefined)MRS.f[k]=v});
  d.p.forEach(k=>{const v=g('mrp_'+k);if(v!==undefined)MRS.p[k]=v});
  if($('mrTo')&&$('mrFrom')){const t=parseJ($('mrTo').value),fr=parseJ($('mrFrom').value);if(!t||!fr)return 'تاریخ را درست بنویسید (مثل ۱۴۰۵/۰۸/۰۱).';if(fr>t)return 'تاریخ «از» بعد از «تا» است.';MRS.per={from:fr,to:t}}return ''}
function mrFiltSum(){const d=MRD[MRS.rep],f=MRS.f,L=[];if(d.f.includes('doc')&&f.doc)L.push('پزشک: '+f.doc);if(d.f.includes('brand')&&f.brand)L.push('برند طرح: '+MRBR[f.brand]);
  d.p.forEach(k=>{const v=MRS.p[k]||MRG[k][0][0],x=MRG[k].find(z=>z[0]===v);if(x)L.push('تفکیک: '+x[1])});return L.join(' · ')||'بدون فیلتر'}
function mrRangeTxt(j){const d=MRD[MRS.rep];if(d.rg==='none')return 'وضعیت امروز '+jDay(tDay());return 'از '+jDay(j?j.from:MRS.per.from)+' تا '+jDay(j?j.to:MRS.per.to)}
function mrRender(){const B=$('mrBody');if(!B)return;if(!MRS.per){MRS.per=i2Range('m');MRS.pk='m'}const d=MRD[MRS.rep],has=MRS.res&&MRS.res.kind===d.k;
  B.innerHTML=`<div class="i2rep mrrep"><aside class="i2nav">${MRR.map(([g,L])=>`<div class="i2grp"><b>${esc(g)}</b>${L.map(([k,t])=>`<button type="button" class="i2card" data-mrrep="${k}" aria-current="${k===MRS.rep}">${esc(t)}</button>`).join('')}</div>`).join('')}</aside>
    <section class="i2main"><label class="f i2sel">گزارش<select id="mrSel">${MRR.map(([g,L])=>`<optgroup label="${esc(g)}">${L.map(([k,t])=>`<option value="${k}"${k===MRS.rep?' selected':''}>${esc(t)}</option>`).join('')}</optgroup>`).join('')}</select></label>
    <div class="i2hd"><h3>${esc(d.t)}</h3><small class="note" id="mrRng">${esc(mrRangeTxt(has?MRS.res:null))}</small></div><div class="i2bar mrbar">${mrFiltHTML(d)}</div><div class="msg" id="mrMsg"></div>
    <div id="mrOut">${has?'':'<div class="empty">بازه و فیلترها را انتخاب کنید و «نمایش گزارش» را بزنید.</div>'}</div><p class="note">در این گزارش‌ها نام، تلفن و کد ملی بیماران نمی‌آید؛ فقط تعداد و جمع.</p></section></div>`;
  if(has)mrShow(MRS.res)}
async function mrRun(){const d=MRD[MRS.rep],m=$('mrMsg'),e=mrFiltRead();if(e){m.className='msg err';m.textContent=e;return}
  const f={};d.f.forEach(k=>{if(MRS.f[k])f[k]=MRS.f[k]});const p={};d.p.forEach(k=>{p.g=MRS.p[k]||MRG[k][0][0]});
  m.className='msg';m.textContent='در حال ساختن گزارش…';
  try{const j=await api('mgrReport',{kind:d.k,from:MRS.per.from,to:MRS.per.to,f,p},{timeout:30000});MRS.res=j;MRS.res.g=p.g;if(j.docs)MRS.docs=j.docs;m.textContent='';mrShow(j);const dl=$('mrdlDoc');if(dl)dl.innerHTML=MRS.docs.map(x=>`<option value="${esc(x)}">`).join('')}
  catch(err){m.className='msg err';m.textContent=err.message}}
function mrSetRep(k){MRS.rep=k;mrRender()}
function mrShow(j){const O=$('mrOut');if(!O)return;const r=$('mrRng');if(r)r.textContent=mrRangeTxt(j);MRTB=[];MRS.chart=null;
  const T=(id,title,cols,rows,o={})=>{MRTB.push(id);return FT('mr'+id,title,cols,rows,Object.assign({cap:500},o))};
  O.innerHTML=(MRV[j.kind]||(()=>''))(j,T)+(MRS.chart?i2ChartHTML(MRS.chart):'');
  const info='بازه: '+mrRangeTxt(j)+' · فیلترها: '+mrFiltSum();MRTB.forEach((id,i)=>{const x=FTD['mr'+id];if(x&&!i)x.sub=info+(x.sub?' · '+x.sub:'')})}
const KP=(l,v,s)=>`<div class="kpi"><b>${v}</b><span>${esc(l)}</span>${s?`<span class="sub">${esc(s)}</span>`:''}</div>`;
const MRV={};
MRV.funnel=(j,T)=>{const n0=(j.rows[0]||{}).n||0;const R=j.rows.map((r,i)=>Object.assign({},r,{p0:mrPct(r.n,n0),pp:i?mrPct(r.n,j.rows[i-1].n):null}));MRS.chart={title:'تعداد بیماران در هر مرحله',bars:R.map(r=>({l:r.l,v:r.n}))};
  const D=j.byDoc.map(x=>Object.assign({},x,{rate:mrPct(x.conf,x.recv)})).sort((a,b)=>b.recv-a.recv);
  return T('funnel','مسیر بیماران پذیرش‌شده در این بازه',[cS('l','مرحله'),cN('n','تعداد'),cP('p0','درصد از پذیرش'),cP('pp','درصد از مرحله‌ی قبل')],R,{})+
    T('funneld','به تفکیک پزشک',[cS('doc','پزشک',r=>r.doc||'نامشخص')].concat(j.steps.map(([k,l])=>cN(k,l)),[cP('rate','نرخ تأیید')]),D,{sum:j.steps.map(s=>s[0])})};
MRV.conv=(j,T)=>{const L=(MRG.g.find(x=>x[0]===j.g)||MRG.g[0])[1];const R=j.rows.map(x=>Object.assign({},x,{r1:mrPct(x.conf,x.recv),r2:mrPct(x.conf,x.plan),avg:x.conf?Math.round(x.val/x.conf):0})).sort((a,b)=>b.recv-a.recv);
  const t=R.reduce((a,x)=>({recv:a.recv+x.recv,plan:a.plan+x.plan,conf:a.conf+x.conf,val:a.val+x.val}),{recv:0,plan:0,conf:0,val:0});
  return `<div class="kpis">${KP('پذیرش',fa(t.recv))}${KP('طرح پزشک',fa(t.plan))}${KP('تأیید',fa(t.conf))}${KP('نرخ تأیید از طرح',i2P(mrPct(t.conf,t.plan)))}${KP('ارزش تأییدشده (تومان)',nf(t.val))}</div>`+
    T('conv','نرخ تأیید به تفکیک '+L,[cS('k',L),cN('recv','پذیرش'),cN('plan','طرح پزشک'),cN('conf','تأیید'),cP('r1','تأیید از پذیرش'),cP('r2','تأیید از طرح'),cM('val','ارزش تأییدشده'),cM('avg','میانگین ارزش هر طرح'),cN('imp','ایمپلنت طرح‌شده'),cN('surg','جراحی‌شده')],R,{sum:['recv','plan','conf','val','imp','surg'],land:true})};
MRV.lost=(j,T)=>{const tot=j.rows.reduce((a,x)=>a+x.n,0),R=j.rows.map(x=>Object.assign({},x,{sh:mrPct(x.n,tot),br:mrPct(x.back,x.n)})).sort((a,b)=>b.n-a.n);
  return T('lost','بیمارانی که طرح را نپذیرفتند (ثبت در این بازه)',[cS('k','دلیل'),cN('n','بیمار'),cP('sh','سهم'),cM('val','ارزش طرح‌ها'),cN('back','برگشتند و ادامه دادند'),cP('br','نرخ بازگشت'),cM('bval','ارزش برگشتی'),cN('wait','هنوز مردد'),cN('closed','انصراف قطعی')],R,{sum:['n','val','back','bval','wait','closed']})+
    T('lostn','بیماران مردد امروز (همه‌ی زمان‌ها)',[cS('k','دلیل'),cN('n','بیمار'),cM('val','ارزش طرح‌ها')],j.now.sort((a,b)=>b.n-a.n),{sum:['n','val']})};
MRV.times=(j,T)=>{const dc=(k,l)=>({k,l,v:r=>mrDy(r[k])});
  return T('times','فاصله‌ی مراحل (روز) — بیماران پذیرش‌شده در این بازه',[cS('l','فاصله'),cN('n','تعداد بیمار'),dc('avg','میانگین'),dc('med','میانه'),dc('min','کمترین'),dc('max','بیشترین')],j.rows,{})+
    T('timesd','میانگین روز به تفکیک پزشک',[cS('doc','پزشک',r=>r.doc||'نامشخص'),cN('n','بیمار')].concat(j.metrics.map(([k,l])=>dc(k,l))),j.byDoc.sort((a,b)=>b.n-a.n),{land:true})};
MRV.monthly=(j,T)=>{const F=['recv','conf','val','first','ses','imp','pdone','got'],M=mrByMon(j.rows,j.from,j.to,F);MRS.chart={title:'ارزش طرح‌های تأییدشده در هر ماه (تومان)',bars:M.map(m=>({l:i2MonL(m.mon),v:m.val}))};
  return T('monthly','روند ماهانه',[cMon(),cN('recv','پذیرش'),cN('conf','تأیید'),cM('val','ارزش تأییدشده'),cN('first','بیمار جراحی جدید'),cN('ses','جلسه‌ی جراحی'),cN('imp','ایمپلنت'),cN('pdone','تحویل پروتز'),cM('got','دریافتی')],M,{sum:F,land:true})};
MRV.svc=(j,T)=>T('svc','خدمات در '+fa(j.plans)+' طرح تأییدشده',[cS('l','خدمت'),cN('plans','تعداد طرح'),{k:'sh',l:'سهم از طرح‌ها',t:'p',v:r=>mrPct(r.plans,j.plans)},cN('teeth','تعداد دندان / واحد')],j.rows.sort((a,b)=>b.plans-a.plans),{});
MRV.rev=(j,T)=>{const F=['conf','val','cash','card','chq','ref','chqw','bounce'],M=mrByMon(j.rows,j.from,j.to,F).map(m=>Object.assign(m,{got:m.cash+m.card+m.chq,net:m.cash+m.card+m.chq-m.ref}));
  MRS.chart={title:'دریافتی خالص ماهانه (تومان)',bars:M.map(m=>({l:i2MonL(m.mon),v:m.net}))};
  return T('rev','درآمد و دریافتی ماهانه',[cMon(),cN('conf','طرح تأییدشده'),cM('val','ارزش تأییدشده'),cM('cash','نقد'),cM('card','کارت'),cM('chq','چک وصول‌شده'),cM('got','جمع دریافتی'),cM('ref','برگشت وجه'),cM('net','خالص'),cM('chqw','چک در جریان'),cM('bounce','چک برگشتی')],M,{sum:F.concat(['got','net']),land:true,sub:'چک بر اساس تاریخ سررسید'})};
MRV.paym=(j,T)=>{const sh=L=>{const t=L.reduce((a,x)=>a+x.sum,0);return L.map(x=>Object.assign({},x,{sh:mrPct(x.sum,t)})).sort((a,b)=>b.sum-a.sum)};
  return T('paym','روش پرداخت (وصول‌شده)',[cS('k','روش',r=>MRPK[r.k]||r.k),cN('n','تعداد'),cM('sum','مبلغ'),cP('sh','سهم')],sh(j.kinds),{sum:['n','sum']})+
    T('paymp','پرداخت کارتی به تفکیک کارتخوان',[cS('k','کارتخوان'),cN('n','تعداد'),cM('sum','مبلغ'),cP('sh','سهم')],sh(j.pos),{sum:['n','sum']})+
    T('paymt','بابت',[cS('k','بابت'),cN('n','تعداد'),cM('sum','مبلغ'),cP('sh','سهم')],sh(j.parts),{sum:['n','sum']})};
MRV.ar=(j,T)=>{const t=j.rows.reduce((a,x)=>a+x.owe,0);return `<div class="kpis">${KP('طلب کل (تومان)',nf(t))}${KP('بیمار بدهکار',fa(j.rows.reduce((a,x)=>a+x.n,0)))}${KP('چک در جریان همین بیماران',nf(j.rows.reduce((a,x)=>a+x.chq,0)))}</div>`+
  T('ar','سن بدهی (از تاریخ تأیید طرح)',[cS('l','سن بدهی'),cN('n','بیمار'),cM('owe','مانده‌ی طلب'),{k:'sh',l:'سهم',t:'p',v:r=>mrPct(r.owe,t)},cM('chq','چک در جریان'),cM('tot','جمع طرح‌ها')],j.rows,{sum:['n','owe','chq','tot'],sub:'طلب = جمع طرح + اختلاف جراحی − دریافتی − چک در جریان'})+
  T('ard','طلب به تفکیک پزشک',[cS('k','پزشک'),cN('n','بیمار'),cM('owe','مانده‌ی طلب')],j.byDoc.sort((a,b)=>b.owe-a.owe),{sum:['n','owe']})};
MRV.chq=(j,T)=>{const F=['n','sum','okn','ok','waitn','wait','bouncen','bounce','latn','lat'],M=mrByMon(j.rows,j.from,j.to,F);
  return T('chq','چک‌ها به تفکیک ماه سررسید',[cMon(),cN('n','تعداد'),cM('sum','مبلغ'),cN('okn','وصول‌شده'),cM('ok','مبلغ وصول'),cN('waitn','در جریان'),cM('wait','مبلغ در جریان'),cN('bouncen','برگشتی'),cM('bounce','مبلغ برگشتی'),cN('latn','سررسیدگذشته‌ی وصول‌نشده'),cM('lat','مبلغ سررسیدگذشته')],M,{sum:F,land:true})};
MRV.refund=(j,T)=>{const F=['n','sum','paidn','paid','openn','open','days'],M=mrByMon(j.rows,j.from,j.to,F).map(m=>Object.assign(m,{avg:m.paidn?Math.round(m.days/m.paidn*10)/10:null}));
  return T('refund','برگشت وجه (درخواست در این بازه)',[cMon(),cN('n','درخواست'),cM('sum','مبلغ'),cN('paidn','پرداخت‌شده'),cM('paid','مبلغ پرداخت'),cN('openn','باز'),cM('open','مبلغ باز'),{k:'avg',l:'میانگین روز تا پرداخت',v:r=>mrDy(r.avg)}],M,{sum:['n','sum','paidn','paid','openn','open']})+
    T('refundm','روش پرداخت برگشت وجه',[cS('k','روش'),cN('n','تعداد'),cM('sum','مبلغ')],j.methods,{sum:['n','sum']})};
MRV.settle=(j,T)=>{const t=j.tot;return `<div class="kpis">${KP('جراحی پایان‌یافته',fa(t.fin))}${KP('بیشتر از طرح',fa(t.up),nf(t.upv)+' تومان')}${KP('کمتر از طرح',fa(t.dn),nf(t.dnv)+' تومان')}${KP('مطابق طرح',fa(t.same))}${KP('تسویه‌ی باز',fa(t.pend),nf(t.pendv)+' تومان')}</div>`+
  T('settle','اختلاف هزینه‌ی جراحی با طرح به تفکیک پزشک',[cS('doc','پزشک'),cN('fin','جراحی پایان‌یافته'),cN('up','بیشتر از طرح'),cM('upv','مبلغ بیشتر'),cN('dn','کمتر از طرح'),cM('dnv','مبلغ کمتر'),cN('pend','تسویه‌ی باز')],j.byDoc.sort((a,b)=>b.fin-a.fin),{sum:['fin','up','upv','dn','dnv','pend']})};
MRV.pl=(j,T)=>{const cats=j.cats.map(c=>c.k),F=['got','ref','exp','mat'].concat(cats.map(c=>'e_'+c)),M=mrByMon(j.rows,j.from,j.to,F).map(m=>Object.assign(m,{net:m.got-m.ref,cost:m.exp+m.mat,res:m.got-m.ref-m.exp-m.mat}));
  MRS.chart={title:'مانده‌ی ماهانه (دریافتی خالص − هزینه‌ها − بهای مواد)',bars:M.map(m=>({l:i2MonL(m.mon),v:m.res}))};
  return T('pl','هزینه در برابر درآمد',[cMon(),cM('got','دریافتی'),cM('ref','برگشت وجه'),cM('net','دریافتی خالص')].concat(cats.map(c=>cM('e_'+c,(typeof EXPCL!=='undefined'&&EXPCL[c])||c)),[cM('exp','جمع هزینه‌ها'),cM('mat','بهای مواد مصرفی (انبار)'),cM('res','مانده')]),M,{sum:F.concat(['net','res']),land:true,sub:'هزینه‌ها از «صندوق و هزینه»؛ بهای مواد از مصرف جراحی در انبار'})+
    T('plc','هزینه‌ها به تفکیک نوع',[cS('k','نوع',r=>(typeof EXPCL!=='undefined'&&EXPCL[r.k])||r.k),cN('n','تعداد'),cM('sum','مبلغ')],j.cats.sort((a,b)=>b.sum-a.sum),{sum:['n','sum']})};
MRV.svcrev=(j,T)=>{const R=j.rows.map(x=>Object.assign({},x,{cl:x.amt-x.fee})).sort((a,b)=>b.amt-a.amt),D=j.byDoc.map(x=>Object.assign({},x,{cl:x.amt-x.fee})).sort((a,b)=>b.amt-a.amt);
  return (R.length?'':'<div class="banner">در این بازه صورتحسابی در «حسابداری کامل» صادر نشده است.</div>')+T('svcrev','درآمد به تفکیک خدمت (صورتحساب‌ها)',[cS('k','خدمت'),cN('qty','تعداد'),cM('amt','مبلغ خدمت'),cM('fee','سهم پزشک'),cM('cl','سهم کلینیک')],R,{sum:['qty','amt','fee','cl'],sub:'قبل از تخفیف کلینیک'})+
    T('svcrevd','به تفکیک پزشک',[cS('k','پزشک'),cN('qty','تعداد خدمت'),cM('amt','مبلغ خدمت'),cM('fee','سهم پزشک'),cM('cl','سهم کلینیک')],D,{sum:['qty','amt','fee','cl']})};
MRV.disc=(j,T)=>{const F=['n','dn','total','discC','discD','parts','net'],M=mrByMon(j.rows,j.from,j.to,F).map(m=>Object.assign(m,{pc:mrPct(m.discC+m.discD,m.total)}));
  return T('disc','تخفیف‌ها (صورتحساب‌ها)',[cMon(),cN('n','صورتحساب'),cN('dn','با تخفیف'),cM('total','جمع خدمات'),cM('discC','تخفیف کلینیک'),cM('discD','تخفیف سهم پزشک'),cP('pc','درصد تخفیف'),cM('parts','قطعات'),cM('net','خالص')],M,{sum:F,land:true})};
MRV.imp=(j,T)=>{const g=j.g||'mon',L=(MRG.ig.find(x=>x[0]===g)||MRG.ig[0])[1],A={},sz=m=>[m[0],m[1]].filter(Boolean).join(' ')+' '+m[2]+'×'+m[3];
  const key={mon:(s)=>[i2Mon(s.day)],doc:s=>[s.doc||'نامشخص'],b:(s,m)=>[m[0]],sys:(s,m)=>[[m[0],m[1]].filter(Boolean).join(' ')],size:(s,m)=>[sz(m)]}[g]||(s=>[i2Mon(s.day)]);
  let ni=0;j.rows.forEach(s=>{ni+=s.imp.length;if(g==='mon'||g==='doc'){const k=key(s)[0],x=A[k]||(A[k]={k,imp:0,ses:0,pats:new Set()});x.imp+=s.imp.length;x.ses++;x.pats.add(s.pid)}
    else s.imp.forEach(m=>{const k=key(s,m)[0],x=A[k]||(A[k]={k,imp:0,ses:new Set(),pats:new Set()});x.imp++;x.ses.add(s.pid+'|'+s.day);x.pats.add(s.pid)})});
  let R=Object.values(A).map(x=>({k:x.k,imp:x.imp,ses:typeof x.ses==='number'?x.ses:x.ses.size,pats:x.pats.size}));R.forEach(x=>{x.avg=x.ses?Math.round(x.imp/x.ses*10)/10:null});
  if(g==='mon'){const M=mrMonths(j.from,j.to);R=M.map(m=>R.find(x=>x.k===m.k)||{k:m.k,imp:0,ses:0,pats:0,avg:null});MRS.chart={title:'ایمپلنت کاشته‌شده در هر ماه',bars:R.map(x=>({l:i2MonL(x.k),v:x.imp}))}}else R.sort((a,b)=>b.imp-a.imp);
  const pats=new Set(j.rows.map(s=>s.pid)).size;
  return `<div class="kpis">${KP('ایمپلنت',fa(ni))}${KP('جلسه‌ی جراحی',fa(j.rows.length))}${KP('بیمار',fa(pats))}${KP('میانگین در هر جلسه',mrDy(j.rows.length?Math.round(ni/j.rows.length*10)/10:null))}</div>`+
    T('imp','ایمپلنت به تفکیک '+L,[cS('k',L,r=>g==='mon'?i2MonL(r.k):r.k),cN('imp','ایمپلنت'),cN('ses','جلسه'),cN('pats','بیمار'),{k:'avg',l:'میانگین در هر جلسه',v:r=>mrDy(r.avg)}],R,{sum:['imp']})};
MRV.fail=(j,T)=>{const g=j.g||'b',key={b:r=>r.b,sys:r=>[r.b,r.sys].filter(Boolean).join(' '),size:r=>[r.b,r.sys].filter(Boolean).join(' ')+' '+r.d+'×'+r.l,doc:r=>r.doc||'نامشخص',sup:r=>r.supName||'نامشخص'}[g]||(r=>r.b);
  const G=i2Grp(j.rows,key,key,[['placed',()=>1],['failed'],['ttfs',r=>r.ttf||0]]).map(x=>Object.assign(x,{rate:x.placed?Math.round(x.failed/x.placed*1000)/10:0,ttf:x.failed?Math.round(x.ttfs/x.failed):null}));
  const L=(MRG.fg.find(x=>x[0]===g)||MRG.fg[0])[1];
  return `<div class="kpis">${KP('ایمپلنت کاشته‌شده',fa(j.placed))}${KP('شکست',fa(j.failed))}${KP('نرخ شکست',i2P(j.rate))}</div>`+
    T('fail','نرخ شکست به تفکیک '+L,[cS('l',L,r=>r.l||'—'),cN('placed','کاشته‌شده'),cN('failed','شکست'),cP('rate','نرخ شکست'),{k:'ttf',l:'میانگین روز تا شکست',v:r=>mrDy(r.ttf)}],G.sort((a,b)=>b.rate-a.rate||b.placed-a.placed),{sum:['placed','failed'],sub:'بر اساس تاریخ جراحی'})};
MRV.prost=(j,T)=>{const dc=(k,l)=>({k,l,v:r=>mrDy(r[k])}),C=[cN('n','تعداد'),dc('avg','میانگین روز'),dc('med','میانه'),dc('min','کمترین'),dc('max','بیشترین')];
  return T('prosts','مدت هر مرحله (مرحله‌هایی که در این بازه شروع شدند و تمام شدند)',[cS('l','مرحله')].concat(C),j.stages.sort((a,b)=>b.n-a.n),{})+
    T('prostt','کل مسیر پروتز تا تحویل (تحویل در این بازه)',[cS('l','نوع کار')].concat(C),j.types,{})+
    T('prostr','اصلاح در مرحله‌های تست',[cS('l','مرحله'),cN('pl','بیمار با اصلاح'),cN('n','دفعات اصلاح')],j.redo.sort((a,b)=>b.n-a.n),{sum:['pl','n']})};
MRV.prosnow=(j,T)=>{const tys=Object.entries(j.types||{});return `<div class="kpis">${KP('بیمار در مسیر پروتز',fa(j.rows.reduce((a,x)=>a+x.n,0)))}${KP('مشکل باز بعد از تحویل',fa(j.repairOpen||0))}</div>`+
  T('prosnow','بیماران در هر مرحله (امروز)',[cS('l','مرحله'),cN('n','بیمار'),{k:'avg',l:'میانگین روز در این مرحله',v:r=>mrDy(r.avg)},cN('d30','بیش از ۳۰ روز'),cN('d60','بیش از ۶۰ روز'),cN('d90','بیش از ۹۰ روز')].concat(tys.map(([k,l])=>cN('t_'+k,l))),j.rows.sort((a,b)=>b.n-a.n),{sum:['n','d30','d60','d90'].concat(tys.map(([k])=>'t_'+k)),land:true})};
MRV.lab=(j,T)=>{const F=['n','done','cancel','open','ready','ontime','redo','late','tsum','tn'],M=mrByMon(j.rows,j.from,j.to,F).map(m=>Object.assign(m,{op:mrPct(m.ontime,m.ready),avg:m.tn?Math.round(m.tsum/m.tn*10)/10:null})),t=j.turn||{};
  return `<div class="kpis">${KP('سفارش',fa(j.rows.reduce((a,x)=>a+x.n,0)))}${KP('میانگین روز تا آماده شدن',mrDy(t.avg))}${KP('میانه',mrDy(t.med))}${KP('دیرکرد باز امروز',fa(j.rows.reduce((a,x)=>a+x.late,0)))}</div>`+
    T('lab','سفارش‌های لابراتوار (ثبت در این بازه)',[cMon(),cN('n','سفارش'),cN('ready','آماده شد'),cN('ontime','به‌موقع'),cP('op','درصد به‌موقع'),{k:'avg',l:'میانگین روز',v:r=>mrDy(r.avg)},cN('redo','با اصلاح'),cN('done','تحویل'),cN('cancel','لغو'),cN('open','باز'),cN('late','دیرکرد باز')],M,{sum:['n','ready','ontime','redo','done','cancel','open','late'],land:true})+
    T('labk','به تفکیک نوع کار',[cS('k','نوع'),cN('n','سفارش'),cN('redo','با اصلاح'),{k:'avg',l:'میانگین روز',v:r=>mrDy(r.tn?Math.round(r.tsum/r.tn*10)/10:null)}],j.kinds.sort((a,b)=>b.n-a.n),{sum:['n','redo']})};
MRV.rpr=(j,T)=>{const n=j.rows.reduce((a,x)=>a+x.n,0);return `<div class="kpis">${KP('مشکل ثبت‌شده',fa(n))}${KP('تحویل پروتز در این بازه',fa(j.delivered))}</div>`+
  T('rpr','مشکلات بعد از تحویل (ثبت در این بازه)',[cS('k','نوع مشکل'),cN('n','تعداد'),cN('fixed','حل شد'),cN('lab','سفارش دوباره‌ی لابراتوار'),cN('open','باز'),{k:'rd',l:'میانگین روز تا رفع',v:r=>mrDy(r.rn?Math.round(r.rd/r.rn*10)/10:null)},{k:'sd',l:'میانگین روز بعد از تحویل',v:r=>mrDy(r.sn?Math.round(r.sd/r.sn):null)}],j.rows.sort((a,b)=>b.n-a.n),{sum:['n','fixed','lab','open']})};
MRV.appt=(j,T)=>{const g=j.g||'kind',L=(MRG.ag.find(x=>x[0]===g)||MRG.ag[0])[1],A={};
  const key={kind:r=>r.kind,doc:r=>r.doc||'نامشخص',wd:r=>String((new Date(r.day+'T12:00:00Z').getUTCDay()+1)%7),mon:r=>i2Mon(r.day)}[g]||(r=>r.kind);
  j.rows.forEach(r=>{const k=key(r),x=A[k]||(A[k]={k,set:0,done:0,noshow:0,cancel:0,n:0});x[r.st]=(x[r.st]||0)+r.n;x.n+=r.n});
  let R=Object.values(A).map(x=>Object.assign(x,{rate:mrPct(x.noshow,x.done+x.noshow)}));
  if(g==='mon'){R=mrMonths(j.from,j.to).map(m=>R.find(x=>x.k===m.k)||{k:m.k,set:0,done:0,noshow:0,cancel:0,n:0,rate:null})}else if(g==='wd')R.sort((a,b)=>a.k-b.k);else R.sort((a,b)=>b.n-a.n);
  const lab=r=>g==='kind'?((j.kinds||{})[r.k]||r.k||'سایر'):g==='wd'?MRWD[+r.k]:g==='mon'?i2MonL(r.k):r.k;
  const t=R.reduce((a,x)=>({d:a.d+x.done,s:a.s+x.noshow}),{d:0,s:0});
  return `<div class="kpis">${KP('نوبت',fa(R.reduce((a,x)=>a+x.n,0)))}${KP('انجام شد',fa(t.d))}${KP('نیامد',fa(t.s))}${KP('نرخ نیامدن',i2P(mrPct(t.s,t.d+t.s)))}</div>`+
    T('appt','نوبت‌ها به تفکیک '+L,[cS('k',L,lab),cN('n','کل'),cN('done','انجام شد'),cN('noshow','نیامد'),cN('cancel','لغو'),cN('set','باز / آینده'),cP('rate','نرخ نیامدن')],R,{sum:['n','done','noshow','cancel','set'],sub:'نرخ نیامدن = نیامد ÷ (انجام شد + نیامد)'})};
MRV.heat=(j,T)=>{const hs=[];for(let h=7;h<=21;h++)hs.push(h);const R=MRWD.map((l,i)=>{const x=j.rows.find(r=>+r.k===i)||{};const o={k:i,l,n:x.n||0,hx:x['h-1']||0};hs.forEach(h=>{o['h'+h]=x['h'+h]||0});let other=o.n-hs.reduce((a,h)=>a+o['h'+h],0);o.hx=other;return o});
  return T('heat','تعداد نوبت در هر روز هفته و ساعت (بدون لغوشده‌ها)',[cS('l','روز')].concat(hs.map(h=>cN('h'+h,faD(String(h)))),[cN('hx','بی‌ساعت / سایر'),cN('n','جمع')]),R,{sum:hs.map(h=>'h'+h).concat(['hx','n']),land:true})};
MRV.task=(j,T)=>{const R=j.rows.map(x=>Object.assign({},x,{op:mrPct(x.on,x.done),lagA:x.late?Math.round(x.lag/x.late*10)/10:null})).sort((a,b)=>b.n-a.n);
  return T('task','پیگیری‌ها و تماس‌ها (موعد در این بازه)',[cS('l','نوع'),cN('n','کل'),cN('done','انجام شد'),cN('on','به‌موقع'),cP('op','درصد به‌موقع'),cN('late','با تأخیر'),{k:'lagA',l:'میانگین روز تأخیر',v:r=>mrDy(r.lagA)},cN('over','عقب‌افتاده‌ی باز'),cN('open','باز (موعد نرسیده)')],R,{sum:['n','done','on','late','over','open'],land:true})};
MRV.perf=(j,T)=>T('perf','عملکرد افراد (از روی سابقه‌ی تغییرات)',[cS('k','نام'),cS('role','نقش'),cN('n','کل ثبت‌ها'),cN('recv','پذیرش'),cN('save','ذخیره‌ی طرح'),cN('plan','ارسال طرح به مشاور'),cN('conf','تأیید طرح'),cN('pay','ثبت پرداخت'),cM('paysum','مبلغ پرداخت‌ها'),cN('appt','ثبت نوبت'),cN('apd','نوبت انجام‌شده'),cN('apn','نوبت نیامده'),cN('task','پیگیری انجام‌شده'),cN('surg','جلسه‌ی جراحی'),cN('lab','سفارش لابراتوار')],j.rows.sort((a,b)=>b.n-a.n),{sum:['n','recv','save','plan','conf','pay','paysum','appt','apd','apn','task','surg','lab'],land:true});
MRV.att=(j,T)=>T('att','حضور و ساعت کار',[cS('name','نام'),cS('role','نقش'),cN('days','روز حضور'),{k:'hrs',l:'جمع ساعت',v:r=>mrDy(r.hrs)},{k:'avg',l:'میانگین ساعت در روز',v:r=>mrDy(r.avg)},{k:'inm',l:'میانگین ورود',v:r=>mrHM(r.inm)},{k:'outm',l:'میانگین خروج',v:r=>mrHM(r.outm)},cN('noout','روز بدون ثبت خروج')],j.rows.sort((a,b)=>b.days-a.days),{sum:['days']});
/* exports */
function mrInfo(){const j=MRS.res;return ['بازه: '+mrRangeTxt(j),'فیلترها: '+mrFiltSum(),'تهیه: '+(USERNAME||ROLE_LBL[ROLE]||'')+' · '+jalali(new Date()).slash+' '+new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})]}
function mrExcel(){const S=MRTB.map(id=>ftSheet('mr'+id)).filter(Boolean);if(!S.length)return;const inf=mrInfo();S.forEach(s=>{s.sub=inf.join(' · ')});xlsx(S,i2Fn(MRD[MRS.rep].t+' '+toEn(jalali(new Date()).dash)))}
function mrPrint(){if(MRTB.length)printHTML(ftPrintDoc(MRTB.map(id=>'mr'+id),MRD[MRS.rep].t))}
async function mrPdf(){if(!MRTB.length)return;const tabs=MRTB.map(id=>FTD['mr'+id]).filter(Boolean).map(d=>({title:d.title,sub:'',cols:d.cols,rows:d.rows,sum:d.sum}));const t=MRD[MRS.rep].t;
  const b=await i2PdfBuild(t,mrInfo(),tabs,MRS.chart);downloadBlob(b,i2Fn(t+' '+toEn(jalali(new Date()).dash))+'.pdf')}
(function(){const _g=goTile;goTile=function(){const r=_g.apply(this,arguments);try{if(ROLE==='manager')mrApply()}catch(e){}return r}})();
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t||!t.closest('#mrBody'))return;
  if(t.dataset.mrrep){mrFiltRead();mrSetRep(t.dataset.mrrep);return}
  if(t.dataset.mrpre){const k=t.dataset.mrpre;MRS.pk=k;if(k!=='c'){mrFiltRead();MRS.per=i2Range(k);mrRender();mrRun()}else{document.querySelectorAll('[data-mrpre]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mrpre==='c'));const f=$('mrFrom');if(f)f.focus()}return}
  if(t.id==='mrGo'){mrRun();return}
  if(t.dataset.mrx){if(!MRS.res||MRS.res.kind!==MRS.rep){toast('اول «نمایش گزارش» را بزنید.',1);return}const k=t.dataset.mrx;t.disabled=true;try{if(k==='x')mrExcel();else if(k==='p')mrPrint();else await mrPdf()}catch(err){toast('خروجی ساخته نشد: '+err.message,1)}finally{t.disabled=false}}});
document.addEventListener('input',e=>{const t=e.target;if(t&&(t.id==='mrFrom'||t.id==='mrTo')){MRS.pk='c';document.querySelectorAll('[data-mrpre]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mrpre==='c'))}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.closest&&e.target.closest('.mrbar')){e.preventDefault();mrRun()}});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='mrSel'){mrFiltRead();mrSetRep(e.target.value)}});

