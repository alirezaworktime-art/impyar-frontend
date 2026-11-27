/* ---------- arc6: paper (archive) file editor — every treatment with its own sessions (date, doctor, teeth / count, tariff, suture),
   levels ۱/۲/۳, uncovering on the right list and «بستن هیلینگ» on the left, panels stay open, discount (clinic + doctor share),
   earlier payments with method (cash / card-to-card / POS / cheque), «حساب تسویه است» / «مانده‌ی بدهی طبق پرونده», paper file number,
   duplicate warnings, no silent change of the total; PDF of a paper file; dated payments in «مالی بیماران» ---------- */
const A6CAT=[
 {k:'ext',t:'کشیدن دندان',s:'R',m:'t',p:()=>A6P('ext')},
 {k:'imp',t:'پایه ایمپلنت',s:'R',m:'t',p:l=>A6PB(l&&l.b)},
 {k:'gbr1',t:'جراحی GBR ۱',s:'R',g:'gbr',m:'n',p:()=>A6P('gbr')},{k:'gbr2',t:'جراحی GBR ۲',s:'R',g:'gbr',m:'n',p:()=>A6P('gbr')},{k:'gbr3',t:'جراحی GBR ۳',s:'R',g:'gbr',m:'n',p:()=>A6P('gbr')},
 {k:'sino1',t:'سینوس لیفت باز ۱',s:'R',g:'sin',m:'n',p:()=>A6P('sin_o')},{k:'sino2',t:'سینوس لیفت باز ۲',s:'R',g:'sin',m:'n',p:()=>A6P('sin_o')},
 {k:'sinc1',t:'سینوس لیفت بسته ۱',s:'R',g:'sin',m:'n',p:()=>A6P('sin_c')},{k:'sinc2',t:'سینوس لیفت بسته ۲',s:'R',g:'sin',m:'n',p:()=>A6P('sin_c')},
 {k:'alv1',t:'آلوئولوپلاستی ۱',s:'R',g:'alv',m:'n',p:()=>A6P('alv')},{k:'alv2',t:'آلوئولوپلاستی ۲',s:'R',g:'alv',m:'n',p:()=>A6P('alv')},{k:'alv3',t:'آلوئولوپلاستی ۳',s:'R',g:'alv',m:'n',p:()=>A6P('alv')},
 {k:'hard1',t:'جراحی نسج سخت ۱',s:'R',g:'hard',m:'n',p:()=>A6P('hard')},{k:'hard2',t:'جراحی نسج سخت ۲',s:'R',g:'hard',m:'n',p:()=>A6P('hard')},{k:'hard3',t:'جراحی نسج سخت ۳',s:'R',g:'hard',m:'n',p:()=>A6P('hard')},
 {k:'tn1',t:'جراحی دندان نهفته ۱',s:'R',g:'tn',m:'n',p:()=>A6P('surg_w')||A6P('surg_c')},{k:'tn2',t:'جراحی دندان نهفته ۲',s:'R',g:'tn',m:'n',p:()=>A6P('surg_w')||A6P('surg_c')},{k:'tn3',t:'جراحی دندان نهفته ۳',s:'R',g:'tn',m:'n',p:()=>A6P('surg_w')||A6P('surg_c')},
 {k:'pon',t:'پایه پونتیک',s:'R',m:'t',p:()=>A6P('pon')},
 {k:'sub',t:'ایمپلنت ساب‌پریوستئال',s:'R',m:'t',p:()=>A6P('sub')},
 {k:'aox',t:'All on X',s:'R',m:'n',u:'فک',p:()=>A6P('aox')||19000000},
 {k:'vip',t:'جراحی VIP / GBR',s:'R',m:'n',p:()=>A6P('vip_cgf')},
 {k:'ram',t:'پیوند استخوان بلاک راموس',s:'R',m:'t',p:()=>A6P('ram')},
 {k:'ovd',t:'اوردنچر',s:'R',m:'n',u:'فک',p:()=>A6P('ovd')},
 {k:'unc',t:'آنکاوری',s:'R',m:'n',p:()=>A6P('arc_unc')||500000},
 {k:'crw',t:'فقط روکش',s:'L',m:'t',p:()=>A6P('crw')},
 {k:'fgg',t:'FGG و وستیبولوپلاستی',s:'L',m:'n',p:()=>A6P('fgg')},
 {k:'tmp',t:'روکش موقت',s:'L',m:'t',p:()=>A6P('tmp')},
 {k:'cbct',t:'CT scan',s:'L',m:'n',p:()=>A6P('cbct')},
 {k:'anes',t:'زمان بیهوشی',s:'L',m:'n',p:()=>A6P('anes')},
 {k:'heal',t:'بستن هیلینگ',s:'L',m:'n',p:()=>A6P('arc_heal')||160000},
 {k:'oth',t:'سایر درمان‌ها',s:'L',m:'n',p:()=>0}];
const A6G={gbr:'جراحی GBR',sin:'سینوس لیفت',alv:'آلوئولوپلاستی',hard:'جراحی نسج سخت',tn:'جراحی دندان نهفته'};
const A6C=Object.fromEntries(A6CAT.map(x=>[x.k,x]));
const A6SOLO={imp:1,aox:1,ovd:1,sub:1};
const A6M={cash:'نقد',xfer:'کارت به کارت',pos:'کارتخوان',chq:'چک'};
const A6SUT={no:'بخیه ندارد',abs:'بخیه‌ی جذبی',non:'بخیه‌ی غیرجذبی'};
const A6P=k=>{const P=(SET&&SET.prices)||{};return num((P[k]||{}).price)};
const A6PB=b=>{const P=((SET&&SET.prices)||{}).imp||{},g=b?arcG(b):'ko';return num((P.bp||{})[g]||(P.bp||{}).ko)};
let A6=null,A6D=null,A6PD='',A6PDV='';
const a6Id=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const a6Day=at=>at?tDay(new Date(at)):'';/* arc8: a text date */
const a6Lab=l=>l.k==='pros'||(l.k==='imp'&&+l.ri>0)?a13Lab(l):l.k==='oth'?(l.txt||'سایر'):(A6C[l.k]||{}).t||l.k;
const a6Amt=l=>num(l.n)*num(l.price);
function a6Meta(){if(A6D)return Promise.resolve(A6D);return api('arc6Meta').then(j=>{A6D=(j.docs||[]).filter(Boolean);return A6D}).catch(()=>{A6D=null;return arcDocs()})}
function a6Docs(cur){const L=[...new Set([...(A6D&&A6D.length?A6D:arcDocs()),ARC_DOC])];if(cur&&!L.includes(cur))L.push(cur);return L}
/* lines of an older paper file (arc3–arc5 sessions + fx2 visits), priced with the tariffs stored in each session */
const A6MAP={ext:'ext',imp:'imp',gbr:'gbr1',alv:'alv1',pon:'pon',surg:'tn1',sub:'sub',aox:'aox',vip:'vip',crw:'crw',ram:'ram',ovd:'ovd',fgg:'fgg',tmp:'tmp',cbct:'cbct',anes:'anes'};
function a6Legacy(j){const d=j.data||{},a=d.arc||{},sg=j.surg||{},L=[];
  (sg.sessions||[]).filter(x=>x&&x.arc).forEach(x=>{const day=String(x.at||'').slice(0,10),S=secFrom(x.s||{});
    SECTIONS.forEach(sec=>{const pv={s:S,brand:'ko',pay:{}};if(!rowUsed(pv,sec))return;const v=S[sec.id],doc=SOLO.includes(sec.id)?(x.by||''):((x.sa||{})[sec.id]||x.asst||x.by||'');
      const teeth=Object.keys(v.sel).filter(k=>v.sel[k]&&isTooth(k)),jc=num(v.jc.U)+num(v.jc.L);
      if(sec.id==='imp'){const G={};teeth.forEach(t=>{const m=(x.imp||{})[t]||{},g=m.b?arcG(m.b):(m.g||'ko');(G[g]=G[g]||{t:[],b:m.b||''}).t.push(t)});
        Object.keys(G).forEach(g=>{const pr=num(v.bp[g])||A6PB(G[g].b);L.push({id:a6Id('l'),k:'imp',day,doc,teeth:G[g].t,n:G[g].t.length,price:pr,b:G[g].b,imp:Object.fromEntries(G[g].t.map(t=>{const m=(x.imp||{})[t]||{};return [t,{d:m.d||'',l:m.l||''}]}))})});
        if(jc)L.push({id:a6Id('l'),k:'imp',day,doc,teeth:[],n:jc,price:num(v.bp.ko)||A6PB(''),b:''});return}
      if(sec.id==='sin'){Object.keys(v.isel).filter(k=>v.isel[k]).forEach(k=>{const o=k[0]==='o';L.push({id:a6Id('l'),k:o?'sino1':'sinc1',day,doc,teeth:[],n:1,price:num(v.ip[o?'o':'c'])||A6P(o?'sin_o':'sin_c')})});return}
      const S1=blankSections();S1[sec.id]=v;let amt=0;try{const T=totals({s:S1,brand:'ko',pay:{}});amt=(T.surg.ko||0)+(T.pros||0)}catch(e){}
      let n=teeth.length+jc;if(!n)n=num(v.cnt)+Object.values(v.icnt||{}).reduce((s,c)=>s+num(c),0)+Object.keys(v.isel||{}).filter(k=>v.isel[k]).length;n=Math.max(1,n);
      const k=A6MAP[sec.id]||'oth';L.push({id:a6Id('l'),k,day,doc,teeth:A6C[k]&&A6C[k].m==='t'?teeth:[],n,price:Math.round(amt/n),txt:k==='oth'?sec.t:''})});
    if(num(x.uncN))L.push({id:a6Id('l'),k:'unc',day,doc:x.by||'',teeth:[],n:num(x.uncN),price:A6C.unc.p()})});
  (a.visits||[]).filter(v=>v&&v.cost).forEach(v=>L.push({id:a6Id('l'),k:'oth',day:v.day,doc:v.doc||ARC_DOC,teeth:[],n:1,price:num(v.cost),txt:v.svc||'مراجعه',note:v.teeth?'دندان '+v.teeth:''}));
  return L}
function a6From(j){const d=j?j.data||{}:{},h=d.h||{},a=d.arc||{},v6=!!a.v6;
  const S={id:j?j.id:'',j,v6,legacy:!!j&&!v6,name:h.name||'',phone:h.phone||'',nid:h.nid||'',age:h.age||'',city:h.city||'',doc:h.doc||'',pfile:h.pfile||(j&&!v6?'':''),
    other:a.other||'',note:a.note||'',lines:[],disc:{c:{m:'a',v:''},d:{m:'a',v:''}},settled:!!a.settled,rem:a.rem==null?'':String(a.rem),pays:[],op:new Set(),last:{},
    open:false,type:'fix',stage:'imprw',dueJ:'',dueTouched:false,dirty:false,warn:''};
  if(v6){S.lines=(a.lines||[]).map(l=>Object.assign({},l,{teeth:[...(l.teeth||[])],imp:JSON.parse(JSON.stringify(l.imp||{})),b:(Object.values(l.imp||{})[0]||{}).b||''}));if(a.disc)S.disc=JSON.parse(JSON.stringify(a.disc))}
  else if(j){S.lines=a6Legacy(j);const old=d.fx4c?num(a.vt):num(j.total),sum=S.lines.reduce((s,l)=>s+a6Amt(l),0);
    if(old>sum){S.lines.push({id:a6Id('l'),k:'oth',day:S.lines.map(l=>l.day).sort()[0]||a.day||tDay(),doc:ARC_DOC,teeth:[],n:1,price:old-sum,txt:'تفاوت با جمع ثبت‌شده‌ی قبلی'});S.warn='جمع درمان‌ها با تعرفه‌های ذخیره‌شده '+fa(sum)+' بود و جمع ثبت‌شده‌ی قبلی '+fa(old)+'؛ برای این‌که مبلغ بیمار عوض نشود ردیف «تفاوت با جمع ثبت‌شده‌ی قبلی» اضافه شد. اگر لازم نیست حذفش کنید.'}
    else if(old<sum){S.disc.c={m:'a',v:String(sum-old)};S.warn='جمع درمان‌ها با تعرفه‌های ذخیره‌شده '+fa(sum)+' شد ولی جمع ثبت‌شده‌ی قبلی '+fa(old)+' است؛ اختلاف ('+fa(sum-old)+') به‌عنوان تخفیف سهم کلینیک گذاشته شد. اگر درست نیست اصلاح کنید.'}
    if(h.file&&!S.pfile)S.pfile='';}
  S.lines.forEach(l=>{l.dayJ=l.day?jDay(l.day):'';S.op.add(A6C[l.k]&&A6C[l.k].g||l.k);S.op.add(l.k)});
  S.pays=(j&&j.pays||[]).filter(p=>p.kind==='arc'&&p.st!=='del').map(p=>{const b=String(p.bank||''),m=p.meth||(b==='کارت'?'pos':b==='واریز بانکی'?'xfer':b==='چک'?'chq':'cash');
    return {id:p.id,day:a6Day(p.at),dayJ:jDay(a6Day(p.at)),amount:String(p.amount||''),meth:m,pos:p.pos||'',acct:m==='xfer'&&FIN1_ACC.includes(b)?b:'',bank:m==='chq'?b:'',no:p.no||'',due:p.due||'',dueJ:p.due?jDay(p.due):'',note:a6NoteOf(p.note)}});
  return S}
const a6NoteOf=n=>{n=String(n||'');const m=/^پرداخت قبلی \([^)]*\)(?: — (.*))?$/.exec(n);return m?(m[1]||''):n};
function a6Open(j){Promise.all([a6Meta(),ensurePos()]).catch(()=>{}).then(()=>{A6=a6From(j);A6.back=['list','queue','recep'].find(v=>{const el=$('view'+v[0].toUpperCase()+v.slice(1));return el&&!el.hidden})||'list';
  const pf=$('pfSheet');if(pf&&!pf.hidden)pf.hidden=true;show('arc6');a6Render();window.scrollTo(0,0)})}
{const _s=show;show=function(v){const r=_s.apply(this,arguments);const el=$('viewArc6');if(el)el.hidden=v!=='arc6';return r}}
{const _t=ttlNow;ttlNow=function(){const el=$('viewArc6');if(el&&!el.hidden)return 'پرونده‌ی جا مانده';return _t.apply(this,arguments)}}
/* reception: a clear entry in its own tiles */
{const _t=TILES.staff;TILES.staff=()=>{const L=_t(),i=L.findIndex(t=>t.k==='arch'),T={k:'arcp',c:'arch',l:'+ پرونده‌ی جا مانده',s:'ورود پرونده‌ی کاغذی بیماران قبلی',n:0,a6:1};if(i<0)L.push(T);else L.splice(i,0,T);return L}}
{const _g=goTile;goTile=function(k,opt){const t=tileList().find(x=>x.k===k);if(t&&t.a6){fxArcOpen(null);return}
  const v=$('viewArc6');if(A6&&A6.dirty&&v&&!v.hidden){uxAsk({title:'خروج بدون ذخیره',msg:'اطلاعاتی که در پرونده‌ی جا مانده وارد کرده‌اید ذخیره نمی‌شود.',ok:'خروج',danger:true}).then(y=>{if(y){A6=null;_g(k,opt)}});return}
  return _g.apply(this,arguments)}}
/* ---- render ---- */
function a6ListBtns(side){const out=[],seen={};A6CAT.filter(x=>x.s===side).forEach(x=>{const key=x.g||x.k;if(seen[key])return;seen[key]=1;
  const n=A6.lines.filter(l=>(A6C[l.k].g||l.k)===key).length;out.push(`<button type="button" class="chip a6b${n?' marked':''}" data-a6k="${key}" aria-pressed="${A6.op.has(key)}">${esc(x.g?A6G[x.g]:x.t)}${n?' ✓'+(n>1?fa(n):''):''}</button>`)});return out.join('')}
function a6Teeth(l){const q=(p,o)=>`<div class="a6q"><span>${p==='UR'?'بالا راست':p==='UL'?'بالا چپ':p==='LR'?'پایین راست':'پایین چپ'}</span><div>${o.map(i=>{const t=p+i,on=l.teeth.includes(t);return `<button type="button" class="a6t" data-a6t="${t}" data-l="${l.id}" aria-pressed="${on}">${i}</button>`}).join('')}</div></div>`;
  const R=[8,7,6,5,4,3,2,1],F=[1,2,3,4,5,6,7,8];return `<div class="a6tc" dir="ltr">${q('UR',R)}${q('UL',F)}${q('LR',R)}${q('LL',F)}</div>`}
function a6Line(l,i,n){const c=A6C[l.k],money=a6Money0(),doc=a6Docs(l.doc);
  const who=`<label class="f">${A6SOLO[l.k]?'جراح':'پزشک انجام‌دهنده'} *<select data-a6f="doc" data-l="${l.id}"><option value="">انتخاب کنید</option>${doc.map(d=>`<option${d===l.doc?' selected':''}>${esc(d)}</option>`).join('')}</select></label>`;
  const cnt=c.m==='t'?`<p class="note a6tn">${l.teeth.length?'دندان‌ها: '+esc(toothTxt(l.teeth))+' · تعداد '+fa(l.teeth.length):'دندان‌ها را بزنید'}</p>`:`<label class="f a6n">تعداد${c.u?' ('+c.u+')':''} *<input data-a6f="n" data-l="${l.id}" inputmode="numeric" value="${esc(l.n?faD(String(l.n)):'')}" placeholder="۰"></label>`;
  const imp=l.k==='imp'||l.k==='sub'||l.k==='reimp'?`<label class="f">برند<input data-a6f="b" data-l="${l.id}" list="a6Br" value="${esc(l.b||'')}" placeholder="مثلاً JD یا Avita"></label>`:'';
  const dl=(l.k==='imp'||l.k==='sub'||l.k==='reimp')&&l.teeth.length?`<div class="a6dl">${l.teeth.map(t=>{const m=(l.imp||{})[t]||{};return `<span><b>${esc(toothTxt([t]))}</b><input data-a6f="d" data-t="${t}" data-l="${l.id}" inputmode="decimal" placeholder="قطر" value="${esc(m.d||'')}" aria-label="قطر ${esc(t)}"><input data-a6f="ll" data-t="${t}" data-l="${l.id}" inputmode="decimal" placeholder="طول" value="${esc(m.l||'')}" aria-label="طول ${esc(t)}"></span>`}).join('')}</div>`:'';
  return `<div class="a6l" data-l="${l.id}"><div class="a6lh"><b>${n>1?'جلسه‌ی '+fa(i+1):'جلسه'}</b>${n>1||A6.lines.filter(x=>x.k===l.k).length>1?`<button type="button" class="btn sm ghost danger" data-a6del="${l.id}">حذف این جلسه</button>`:`<button type="button" class="btn sm ghost danger" data-a6del="${l.id}">حذف</button>`}</div>
   <div class="a6g2">${l.k==='oth'?`<label class="f">نام درمان *<input data-a6f="txt" data-l="${l.id}" value="${esc(l.txt||'')}"></label>`:''}<label class="f">تاریخ *<input data-a6f="dayJ" data-l="${l.id}" data-jd="1" data-anc="${esc(A6.last.day||'')}" placeholder="۱۴۰۲/۰۳/۱۵" value="${esc(l.dayJ||'')}" autocomplete="off"></label>${who}${imp}${cnt}
   ${money?`<label class="f">تعرفه‌ی هر واحد (تومان)<input data-a6f="price" data-l="${l.id}" inputmode="numeric" class="price" value="${esc(l.price?fmtInput(String(l.price)):'0')}"><small class="a6def">پیش‌فرض ${fa(c.p(l)||0)}${num(l.price)!==(c.p(l)||0)?' · <button type="button" class="lnk" data-a6defp="'+l.id+'">برگرداندن</button>':''}</small></label><div class="a6amt"><span>مبلغ</span><b data-a6amt="${l.id}">${fa(a6Amt(l))}</b></div>`:''}</div>
   ${c.m==='t'?a6Teeth(l):''}${dl}
   <div class="a6sut"><span>بخیه</span><div class="chips">${['no','abs','non'].map(s=>`<button type="button" class="chip" data-a6sut="${s}" data-l="${l.id}" aria-pressed="${l.sut===s}">${A6SUT[s]}</button>`).join('')}</div></div></div>`}
function a6Panel(k){const c=A6C[k],L=A6.lines.filter(l=>l.k===k);
  return `<section class="card a6p" data-a6p="${k}"><h3>${esc(c.t)} <small>تعرفه ${fa(c.p({})||0)} تومان${c.m==='t'?' برای هر دندان':' برای هر واحد'}</small></h3>${L.map((l,i)=>a6Line(l,i,L.length)).join('')}
   <div class="btns"><button type="button" class="btn sm ghost" data-a6add="${k}">+ جلسه‌ی دیگر (تاریخ یا پزشک دیگر)</button></div></section>`}
function a6Group(g){const K=A6CAT.filter(x=>x.g===g);
  return `<section class="card a6p a6grp" data-a6p="${g}"><h3>${esc(A6G[g])}</h3><div class="chips" role="group" aria-label="${esc(A6G[g])}">${K.map(x=>{const n=A6.lines.filter(l=>l.k===x.k).length;return `<button type="button" class="chip" data-a6lv="${x.k}" aria-pressed="${A6.op.has(x.k)}">${esc(x.t)}${n?' ✓':''}</button>`}).join('')}</div>
   ${K.filter(x=>A6.op.has(x.k)).map(x=>a6Panel(x.k)).join('')}</section>`}
const a6Money0=()=>['staff','consultant','accountant','manager'].includes(ROLE);
function a6Calc(){const S=A6,cost=S.lines.reduce((s,l)=>s+a6Amt(l),0),pa=p=>{const v=p.m==='p'?Math.round(cost*Math.min(100,Number(toEn(String(p.v)).replace(/[^\d.]/g,''))||0)/100):num(p.v);return v};
  const dc=pa(S.disc.c),dd=pa(S.disc.d),net=cost-dc-dd,j=S.j||{},rf=(j.refunds||[]).filter(x=>x.st==='paid').reduce((a,x)=>a+num(x.amount),0);
  const other=(j.pays||[]).filter(p=>p.kind!=='arc'&&p.st!=='del').reduce((a,p)=>a+(p.st==='ok'||(p.kind==='chq'&&p.st==='wait')?num(p.amount):0),0);
  const arcP=S.pays.reduce((a,p)=>a+num(p.amount),0),paid=arcP+other-rf,rem=S.rem===''?null:num(S.rem),imp=S.settled?Math.max(0,net-paid):rem!=null?Math.max(0,net-paid-rem):0;
  return {cost,dc,dd,net,arcP,other,paid,imp,bal:net-imp-paid}}
function a6MoneyHTML(){const C=a6Calc(),S=A6,dm=(w)=>{const p=S.disc[w];return `<div class="a6dr"><span>${w==='c'?'تخفیف سهم کلینیک':'تخفیف سهم پزشک'}</span><div class="seg" role="group"><button type="button" data-a6dm="${w}" data-m="p" aria-pressed="${p.m==='p'}">درصد</button><button type="button" data-a6dm="${w}" data-m="a" aria-pressed="${p.m!=='p'}">مبلغ</button></div><input data-a6dv="${w}" inputmode="numeric" value="${esc(p.v===''||p.v==null?'':p.m==='p'?faD(String(p.v)):fmtInput(String(p.v)))}" placeholder="${p.m==='p'?'٪':'تومان'}" aria-label="${w==='c'?'تخفیف سهم کلینیک':'تخفیف سهم پزشک'}"><b>${fa(w==='c'?C.dc:C.dd)}</b></div>`};
  return `<h2>هزینه‌ها، تخفیف و پرداخت‌ها</h2>${S.warn?`<div class="banner info">${esc(S.warn)}</div>`:''}
   <div id="a6Tab">${a6TabHTML(C)}</div>${ARC9_GD()}
   <div class="a6disc">${dm('c')}${dm('d')}<div class="a6dr a6dt"><span>تخفیف کل</span><b>${fa(C.dc+C.dd)}</b></div></div>
   <div class="a6sum"><span>هزینه پس از تخفیف</span><b>${fa(C.net)} تومان</b></div>
   <h3>پرداخت‌های قبلی (با تاریخ)</h3><p class="note">پرداخت‌هایی که قبل از امروز انجام شده. این پرداخت‌ها در صندوق امروز نمی‌آیند. پرداخت امروز را در «مالی بیماران» ثبت کنید.</p>
   <div id="a6Pays">${S.pays.map(a6PayRow).join('')||'<p class="note">پرداختی وارد نشده.</p>'}</div>
   <div class="btns"><button type="button" class="btn sm ghost" id="a6PAdd">+ پرداخت قبلی</button></div>
   ${C.other?`<p class="note">پرداخت‌های ثبت‌شده در سایت برای این بیمار: ${fa(C.other)} تومان</p>`:''}
   <div class="a6bal"><label class="a6ck"><input type="checkbox" id="a6Set"${S.settled?' checked':''}> حساب تسویه است (مانده صفر)</label>
    <label class="f">مانده‌ی بدهی طبق پرونده (تومان)<input id="a6Rem" inputmode="numeric" class="price" value="${esc(S.rem===''?'':fmtInput(S.rem))}" placeholder="خالی = حساب از روی هزینه و پرداخت‌ها"${S.settled?' disabled':''}></label></div>
   <div class="a6sum"><span>جمع پرداخت‌ها</span><b>${fa(C.paid)}</b></div><div class="a6sum imp"${C.imp?'':' hidden'}><span>تسویه‌ی قبلی طبق پرونده</span><b>${fa(C.imp)}</b></div>
   <div class="a6sum big${C.bal>0?' warn':''}"><span>مانده‌ی بیمار</span><b>${fa(Math.max(0,C.bal))} تومان${C.bal<0?' · بستانکار '+fa(-C.bal):''}</b></div>`}
function a6TabHTML(C){const rows=A6.lines.slice().sort((a,b)=>String(a.day).localeCompare(String(b.day))).map(l=>`<tr><td>${esc(a6Lab(l))}</td><td>${esc(l.dayJ||'')}</td><td>${fa(num(l.n))} × ${fa(num(l.price))}</td><td>${fa(a6Amt(l))}</td></tr>`).join('');
  return `<table class="a6ct"><thead><tr><th>درمان</th><th>تاریخ</th><th>تعداد × تعرفه</th><th>مبلغ (تومان)</th></tr></thead><tbody>${rows||'<tr><td colspan="4">هنوز درمانی وارد نشده.</td></tr>'}</tbody><tfoot><tr><td colspan="3">هزینه‌ی کل</td><td>${fa(C.cost)}</td></tr></tfoot></table>`}
function a6PayRow(p){const pos=(POSL||[]).filter(x=>Number(x.active)||x.id===p.pos);
  return `<div class="a6pr" data-p="${p.id}"><label class="f">تاریخ *<input data-a6pf="dayJ" data-p="${p.id}" data-jd="1" data-anc="${esc(A6.last.day||'')}" placeholder="۱۴۰۲/۰۳/۱۵" value="${esc(p.dayJ||'')}" autocomplete="off"></label>
   <label class="f">مبلغ (تومان) *<input data-a6pf="amount" data-p="${p.id}" inputmode="numeric" class="price" value="${esc(p.amount?fmtInput(p.amount):'')}"></label>
   <div class="f a6pm"><span>روش پرداخت</span><div class="chips">${Object.keys(A6M).map(m=>`<button type="button" class="chip" data-a6pm="${m}" data-p="${p.id}" aria-pressed="${p.meth===m}">${A6M[m]}</button>`).join('')}</div></div>
   ${p.meth==='xfer'?`<label class="f">به کدام حساب *<select data-a6pf="acct" data-p="${p.id}"><option value="">انتخاب کنید</option>${FIN1_ACC.map(a=>`<option${a===p.acct?' selected':''}>${esc(a)}</option>`).join('')}</select></label>`:''}
   ${p.meth==='pos'?`<label class="f">کدام کارتخوان *<select data-a6pf="pos" data-p="${p.id}"><option value="">انتخاب کنید</option>${pos.map(x=>`<option value="${esc(x.id)}"${x.id===p.pos?' selected':''}>${esc(x.name)}</option>`).join('')}</select></label>`:''}
   ${p.meth==='chq'?`<label class="f">شماره چک<input data-a6pf="no" data-p="${p.id}" inputmode="numeric" value="${esc(p.no||'')}"></label><label class="f">سررسید<input data-a6pf="dueJ" data-p="${p.id}" data-jd="1" placeholder="۱۴۰۲/۰۵/۱۰" value="${esc(p.dueJ||'')}" autocomplete="off"></label><label class="f">بانک<input data-a6pf="bank" data-p="${p.id}" value="${esc(p.bank||'')}"></label>`:''}
   <label class="f">توضیح<input data-a6pf="note" data-p="${p.id}" value="${esc(p.note||'')}"></label><button type="button" class="btn sm ghost danger" data-a6pdel="${p.id}">حذف</button></div>`}
function a6StOpts(){let o=fxStOpts(A6.type,A6.stage);const P=FX_PATH[A6.type]||FX_PATH.fix;if(P.includes('heal'))o=o.replace('<option value="imprw"',`<option value="sut"${A6.stage==='sut'?' selected':''}>منتظر کشیدن بخیه</option><option value="imprw"`);return o}
function a6DueDef(){const last=A6.lines.map(l=>l.day).filter(Boolean).sort().pop()||tDay(),st=A6.stage,ko=A6.lines.some(l=>l.k==='imp'&&arcG(l.b)==='ko');
  if(!['unc','imprw','sut'].includes(st))return {d:'',clamp:false};let d=st==='sut'?dAdd(last,14):mAdd(last,st==='unc'&&ko?4:3);const clamp=d<tDay();if(clamp)d=tDay();return {d,clamp}}
function a6Render(){const R=$('a6Root');if(!R||!A6)return;const S=A6,keys=[];
  A6CAT.forEach(x=>{const key=x.g||x.k;if(!keys.includes(key)&&S.op.has(key))keys.push(key)});
  const docs=a6Docs(S.doc),mo=a6Money0(),cat=[...new Set((SET.catalog||[]).map(c=>c.b).filter(Boolean))];
  R.innerHTML=`<datalist id="a6Br">${cat.map(b=>`<option value="${esc(b)}">`).join('')}</datalist>
  <div class="a6w"><nav class="a6lst a6r" aria-label="جراحی‌ها"><b class="a6lh2">جراحی‌ها</b>${a6ListBtns('R')}</nav>
  <div class="a6main">
   <section class="card"><h2>${S.id?'ویرایش پرونده‌ی جا مانده':'افزودن پرونده‌ی جا مانده (بیماران قبلی / پرونده‌ی کاغذی)'}</h2>
    <p class="note">هر درمان را از فهرست کنار صفحه باز کنید؛ هر درمان می‌تواند چند جلسه با تاریخ و پزشک خودش داشته باشد. بعد از ذخیره، اسکن پرونده‌ی کاغذی را در «تصاویر» اضافه کنید.</p>
    <div class="a6g2"><label class="f">نام و نام خانوادگی *<input data-a6h="name" value="${esc(S.name)}"></label><label class="f">شماره پرونده‌ی کاغذی<input data-a6h="pfile" maxlength="20" value="${esc(faD(S.pfile||''))}"><small class="a6def">همین شماره، شماره پرونده‌ی سایت می‌شود؛ تکراری قبول نمی‌شود.</small></label>
     <label class="f">موبایل<input data-a6h="phone" inputmode="tel" value="${esc(faD(S.phone))}"></label><label class="f">کد ملی<input data-a6h="nid" inputmode="numeric" value="${esc(faD(S.nid))}"></label>
     <label class="f">سن<input data-a6h="age" inputmode="numeric" value="${esc(faD(S.age))}"></label><label class="f">شهر<input data-a6h="city" value="${esc(S.city)}"></label>
     </div>${ARC9_XR()}
    ${S.legacy?'<div class="banner info">این پرونده با فرم قبلی ثبت شده بود؛ درمان‌ها با تاریخ و تعرفه‌ی همان زمان به فهرست تازه آمده‌اند. پیش از ذخیره بررسی کنید.</div>':''}</section>
   <div id="a6Secs">${keys.map(k=>A6G[k]?a6Group(k):a6Panel(k)).join('')||'<section class="card"><p class="note">هنوز درمانی باز نشده. از فهرست «جراحی‌ها» (راست) یا «سایر» (چپ) درمان را بزنید.</p></section>'}</div>
   ${mo?`<section class="card" id="a6Money">${a6MoneyHTML()}</section>`:''}
   <section class="card"><label class="f">توضیحات<textarea data-a6h="note" rows="2" maxlength="3000">${esc(S.note)}</textarea></label>
    ${UX7_SUT(S)}
    ${`<div class="grp"><span>وضعیت پرونده</span><div class="chips" role="group"><button class="chip" type="button" data-a6open="0" aria-pressed="${!S.open}">بسته — درمان تمام شده</button><button class="chip" type="button" data-a6open="1" aria-pressed="${!!S.open}">باز — بیمار منتظر مرحله‌ی بعد است</button></div></div>
    ${S.open?`<div class="a6g2">
     <label class="f">بیمار در انتظار چه مرحله‌ای است<select id="a6Stage">${a6StOpts()}</select></label>
     ${['unc','imprw','sut','impw','exam','fup'].includes(S.stage)?`<label class="f">${S.stage==='exam'?'تاریخ معاینه':'تاریخ پیگیری'} *<input id="a6Due" data-jd="1" placeholder="۱۴۰۵/۰۹/۱۰" value="${esc(S.dueJ)}" autocomplete="off"><small class="a6def" id="a6DueH"></small></label>`:'<p class="note">برای این مرحله کار پیگیری ساخته نمی‌شود؛ بیمار در فهرست «پروتز بی‌نوبت» منشی می‌آید.</p>'}</div>`:''}`}
    <div class="msg" id="a6Msg" role="alert"></div>
    <div class="btns"><button class="btn" type="button" id="a6Save">${S.id?'ذخیره‌ی تغییرات':'ثبت پرونده در بایگانی'}</button><button class="btn ghost" type="button" id="a6Cancel">انصراف</button></div></section>
  </div>
  <nav class="a6lst a6lft" aria-label="پروتز و سایر"><b class="a6lh2">پروتز و سایر</b>${a6ListBtns('L')}</nav></div>`;
  a6DueUpd()}
function a6DueUpd(){const i=$('a6Due');if(!i||!A6)return;if(!A6.dueTouched){const x=a6DueDef();A6.dueJ=x.d?jDay(x.d):'';i.value=A6.dueJ;const hh=$('a6DueH');if(hh)hh.textContent=x.clamp?'تاریخ پیش‌فرض (از آخرین درمان) گذشته بود؛ امروز گذاشته شد. تاریخ درست را بزنید.':'پیش‌فرض از تاریخ آخرین درمان'}}
function a6MoneyUpd(){const m=$('a6Money');if(!m||!A6)return;const f=document.activeElement,fid=f&&f.closest&&f.closest('#a6Money')?(f.dataset.a6dv?'[data-a6dv="'+f.dataset.a6dv+'"]':f.id?'#'+f.id:f.dataset.a6pf?`[data-a6pf="${f.dataset.a6pf}"][data-p="${f.dataset.p}"]`:''):'',ss=fid&&f.selectionStart;
  m.innerHTML=a6MoneyHTML();if(fid){const n=m.querySelector(fid);if(n){n.focus();try{n.setSelectionRange(n.value.length,n.value.length)}catch(e){}}}}
const a6L=id=>A6.lines.find(l=>l.id===id),a6Pp=id=>A6.pays.find(p=>p.id===id);
function a6NewLine(k){const c=A6C[k],last=A6.lines.filter(l=>l.k===k).pop()||{};const l={id:a6Id('l'),k,dayJ:A6.last.dayJ||'',day:A6.last.day||'',doc:last.doc||A6.last.doc||'',teeth:[],n:c.m==='t'?0:'',price:0,sut:'',txt:'',imp:{},b:last.b||''};l.price=c.p(l)||0;A6.lines.push(l);return l}
/* ---- events ---- */
document.addEventListener('click',e=>{const R=$('a6Root');if(!A6||!R||!R.contains(e.target))return;const t=e.target.closest('button');if(!t)return;const d=t.dataset;
  if(d.a6k){const k=d.a6k;if(A6.op.has(k))A6.op.delete(k);else{A6.op.add(k);if(!A6G[k]&&!A6.lines.some(l=>l.k===k)){a6NewLine(k);A6.dirty=true}}a6Render();if(A6.op.has(k)){const s=R.querySelector(`[data-a6p="${k}"]`);if(s)s.scrollIntoView({behavior:'smooth',block:'nearest'})}return}
  if(d.a6lv){const k=d.a6lv;if(A6.op.has(k))A6.op.delete(k);else{A6.op.add(k);if(!A6.lines.some(l=>l.k===k)){a6NewLine(k);A6.dirty=true}}a6Render();return}
  if(d.a6add){const l=a6NewLine(d.a6add);A6.dirty=true;a6Render();const n=R.querySelector(`[data-a6f="dayJ"][data-l="${l.id}"]`);if(n)n.scrollIntoView({block:'center'});return}
  if(d.a6del){const l=a6L(d.a6del);if(!l)return;uxAsk({title:'حذف '+a6Lab(l),msg:'این جلسه'+(l.dayJ?' ('+l.dayJ+')':'')+' از پرونده حذف می‌شود.',ok:'حذف',danger:true}).then(y=>{if(!y||!A6)return;A6.lines=A6.lines.filter(x=>x!==l);A6.dirty=true;a6Render()});return}
  if(d.a6t){const l=a6L(d.l);if(!l)return;const i=l.teeth.indexOf(d.a6t);if(i>=0)l.teeth.splice(i,1);else l.teeth.push(d.a6t);l.n=l.k==='sgd'?a9Jaws(l):l.teeth.length;A6.dirty=true;const sc=window.scrollY;a6Render();window.scrollTo(0,sc);return}
  if(d.a6sut){const l=a6L(d.l);if(!l)return;l.sut=l.sut===d.a6sut?'':d.a6sut;A6.dirty=true;t.closest('.chips').querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',b.dataset.a6sut===l.sut));return}
  if(d.a6defp){const l=a6L(d.a6defp);if(!l)return;l.price=A6C[l.k].p(l)||0;A6.dirty=true;const sc=window.scrollY;a6Render();window.scrollTo(0,sc);return}
  if(d.a6dm){A6.disc[d.a6dm]={m:d.m,v:''};A6.dirty=true;a6MoneyUpd();return}
  if(t.id==='a6PAdd'){const p={id:a6Id('a6p-'),dayJ:'',day:'',amount:'',meth:'cash',pos:'',acct:'',bank:'',no:'',due:'',dueJ:'',note:'',nw:1};A6.pays.push(p);A6.dirty=true;a6MoneyUpd();const n=document.querySelector(`[data-a6pf="dayJ"][data-p="${p.id}"]`);if(n)n.scrollIntoView({block:'center'});return}
  if(d.a6pdel){const p=a6Pp(d.a6pdel);if(!p)return;uxAsk({title:'حذف پرداخت',msg:'پرداخت '+fa(num(p.amount))+' تومان'+(p.dayJ?' ('+p.dayJ+')':'')+' حذف می‌شود.',ok:'حذف',danger:true}).then(y=>{if(!y||!A6)return;A6.pays=A6.pays.filter(x=>x!==p);A6.dirty=true;a6MoneyUpd()});return}
  if(d.a6pm){const p=a6Pp(d.p);if(!p)return;p.meth=d.a6pm;p.ed=1;A6.dirty=true;a6MoneyUpd();return}
  if(d.a6open!==undefined){A6.open=d.a6open==='1';A6.dirty=true;a6Render();return}
  if(t.id==='a6Cancel'){const go=()=>{const b=A6&&A6.back||'list',j=A6&&A6.j;A6=null;show(b);if(b==='list')try{renderList()}catch(x){}if(j&&j.id)openFile(j.id,(j.data&&j.data.h||{}).name||'','tl')};if(!A6.dirty){go();return}uxAsk({title:'خروج بدون ذخیره',msg:'اطلاعاتی که در این صفحه وارد کرده‌اید ذخیره نمی‌شود.',ok:'خروج',danger:true}).then(y=>{if(y)go()});return}
  if(t.id==='a6Save'){a6Save(t);return}});
function a6Input(e){const R=$('a6Root'),i=e.target;if(!A6||!R||!R.contains(i))return;const d=i.dataset;
  if(d.a6h){A6[d.a6h]=i.value.trim();A6.dirty=true;return}
  if(d.a6f){const l=a6L(d.l);if(!l)return;A6.dirty=true;const f=d.a6f;
    if(f==='dayJ'){l.dayJ=i.value.trim();l.day=parseJ(l.dayJ)||'';if(l.day){A6.last.day=l.day;A6.last.dayJ=l.dayJ}a6DueUpd()}
    else if(f==='doc'){l.doc=i.value;A6.last.doc=l.doc}
    else if(f==='n'){l.n=num(i.value)}
    else if(f==='price'){if(e.type==='input')i.value=fmtInput(i.value);l.price=num(i.value)}
    else if(f==='b'){l.b=i.value.trim();Object.keys(l.imp||{}).forEach(t=>l.imp[t].b=l.b);if(!l.pTouched){l.price=A6C[l.k].p(l)||0;const pi=document.querySelector(`[data-a6f="price"][data-l="${l.id}"]`);if(pi){pi.value=fmtInput(String(l.price));const df=pi.parentNode.querySelector('.a6def');if(df)df.textContent='پیش‌فرض '+fa(l.price)}}}
    else if(f==='d'||f==='ll'){l.imp=l.imp||{};const m=l.imp[d.t]=l.imp[d.t]||{};m[f==='d'?'d':'l']=toEn(i.value.trim())}
    else if(f==='txt'){l.txt=i.value.trim()}
    if(f==='price')l.pTouched=1;
    const a=document.querySelector(`[data-a6amt="${l.id}"]`);if(a)a.textContent=fa(a6Amt(l));if(['n','price','dayJ','b','txt'].includes(f))a6MoneyLite();return}
  if(d.a6pf){const p=a6Pp(d.p);if(!p)return;A6.dirty=true;p.ed=1;const f=d.a6pf;if(f==='amount'&&e.type==='input')i.value=fmtInput(i.value);p[f]=f==='amount'?String(num(i.value)):i.value.trim();if(f==='dayJ'){p.day=parseJ(p.dayJ)||'';if(p.day){A6.last.day=p.day;A6.last.dayJ=p.dayJ}}if(f==='dueJ')p.due=parseJ(p.dueJ)||'';a6MoneyLite();return}
  if(d.a6dv){const w=d.a6dv,p=A6.disc[w];if(p.m!=='p'&&e.type==='input')i.value=fmtInput(i.value);p.v=p.m==='p'?toEn(i.value).replace(/[^\d.]/g,''):String(num(i.value));A6.dirty=true;a6MoneyLite();return}
  if(i.id==='a6Set'){if(e.type!=='change')return;A6.settled=i.checked;if(i.checked)A6.rem='';A6.dirty=true;const r=$('a6Rem');if(r){r.disabled=i.checked;if(i.checked)r.value=''}a6MoneyLite();return}
  if(i.id==='a6Rem'){if(e.type==='input')i.value=fmtInput(i.value);A6.rem=i.value.trim()===''?'':String(num(i.value));A6.dirty=true;a6MoneyLite();return}
  if(i.id==='a6Type'){A6.type=i.value;const s=$('a6Stage');if(s)s.innerHTML=a6StOpts();A6.stage=s?s.value:A6.stage;A6.dirty=true;if(e.type==='change')a6Render();return}
  if(i.id==='a6Stage'){A6.stage=i.value;A6.dirty=true;if(e.type==='change')a6Render();return}
  if(i.id==='a6Due'){A6.dueJ=i.value.trim();A6.dueTouched=true;A6.dirty=true;return}}
/* light refresh of the money summary while typing (keeps the focused field) */
function a6MoneyLite(){const m=$('a6Money');if(!m)return;const C=a6Calc();m.querySelectorAll('.a6sum b,.a6dr b').forEach(()=>{});
  const tb=$('a6Tab');if(tb)tb.innerHTML=a6TabHTML(C);
  const dr=m.querySelectorAll('.a6disc .a6dr b');if(dr[0])dr[0].textContent=fa(C.dc);if(dr[1])dr[1].textContent=fa(C.dd);if(dr[2])dr[2].textContent=fa(C.dc+C.dd);
  const sm=m.querySelectorAll('.a6sum b');if(sm[0])sm[0].textContent=fa(C.net)+' تومان';if(sm[1])sm[1].textContent=fa(C.paid);const im=m.querySelector('.a6sum.imp b');if(im){im.textContent=fa(C.imp);im.parentNode.hidden=!C.imp}const big=m.querySelector('.a6sum.big b');if(big)big.textContent=fa(Math.max(0,C.bal))+' تومان'+(C.bal<0?' · بستانکار '+fa(-C.bal):'')}
document.addEventListener('input',a6Input);document.addEventListener('change',a6Input);
/* ---- save ---- */
async function a6Save(btn,ack){const S=A6,m=$('a6Msg'),td=tDay();ack=ack||{};
  const err=(t,sel)=>{m.className='msg err';m.textContent=t;if(sel){const n=document.querySelector(sel);if(n){n.scrollIntoView({behavior:'smooth',block:'center'});try{n.focus({preventScroll:true})}catch(x){}}}};
  if(!S.name)return err('نام بیمار را بنویسید.','[data-a6h="name"]');
  for(const l of S.lines){const c=A6C[l.k],L=a6Lab(l)+': ',q=`[data-l="${l.id}"]`;
    if(!S.op.has(l.k)||(c.g&&!S.op.has(c.g))){S.op.add(c.g||l.k);S.op.add(l.k);a6Render()}
    if(l.k==='oth'&&!l.txt)return err(L+'نام درمان را بنویسید.',`[data-a6f="txt"]${q}`);
    if(!l.day)return err(L+(l.dayJ?'تاریخ «'+l.dayJ+'» درست نیست؛ مثل ۱۴۰۲/۰۳/۱۵ بنویسید.':'تاریخ را بزنید.'),`[data-a6f="dayJ"]${q}`);
    if(l.day>td)return err(L+'تاریخ نمی‌تواند بعد از امروز باشد.',`[data-a6f="dayJ"]${q}`);
    if(!l.doc)return err(L+'پزشک را انتخاب کنید؛ اگر معلوم نیست «'+ARC_DOC+'».',`[data-a6f="doc"]${q}`);
    if(!num(l.n))return err(L+(c.m==='t'?'دندان‌ها را بزنید.':'تعداد را بنویسید.'),c.m==='t'?`.a6l${q}`:`[data-a6f="n"]${q}`)}
  const C=a6Calc();if(C.dc+C.dd>C.cost)return err('جمع تخفیف از هزینه‌ی کل بیشتر است.','#a6Money');
  if(S.settled&&S.rem!=='')return err('«حساب تسویه است» و «مانده‌ی بدهی طبق پرونده» با هم نمی‌شوند.','#a6Rem');
  for(const p of S.pays){const q=`[data-p="${p.id}"]`;if(!num(p.amount))return err('مبلغ پرداخت را بنویسید.',`[data-a6pf="amount"]${q}`);if(!p.day)return err('تاریخ پرداخت را درست بزنید.',`[data-a6pf="dayJ"]${q}`);
    if(p.day>=td)return err('پرداخت این بخش باید قبل از امروز باشد؛ پرداخت امروز را در «مالی بیماران» ثبت کنید.',`[data-a6pf="dayJ"]${q}`);
    if((p.nw||p.ed)&&p.meth==='xfer'&&!p.acct)return err('حساب مقصد کارت‌به‌کارت را انتخاب کنید.',`[data-a6pf="acct"]${q}`);if((p.nw||p.ed)&&p.meth==='pos'&&!p.pos)return err('کارتخوان را انتخاب کنید.',`[data-a6pf="pos"]${q}`)}
  let due='';if(!S.id&&S.open&&['unc','imprw','sut','impw'].includes(S.stage)){due=parseJ(S.dueJ||'');if(!due)return err('تاریخ پیگیری را درست بزنید.','#a6Due');if(due<td)return err('تاریخ پیگیری نمی‌تواند گذشته باشد.','#a6Due')}
  const arc={v6:1,name:S.name,phone:S.phone,nid:S.nid,age:S.age,city:S.city,doc:S.doc,pfile:S.pfile,other:S.other,note:S.note,
    lines:S.lines.map(l=>({id:l.id,k:l.k,day:l.day,doc:l.doc,teeth:l.teeth,n:num(l.n),price:num(l.price),sut:l.sut||'',txt:l.txt||'',note:l.note||'',imp:(l.k==='imp'||l.k==='sub'||l.k==='reimp')?Object.fromEntries(l.teeth.map(t=>[t,{b:l.b||'',d:((l.imp||{})[t]||{}).d||'',l:((l.imp||{})[t]||{}).l||''}])):{}})),
    disc:{c:{m:S.disc.c.m,v:S.disc.c.v||0},d:{m:S.disc.d.m,v:S.disc.d.v||0}},settled:S.settled,rem:S.rem,
    pays:S.pays.map(p=>({id:p.id,day:p.day,amount:num(p.amount),meth:p.meth,pos:p.pos,acct:p.acct,bank:p.bank,no:p.no,due:p.due,note:p.note})),
    open:S.open,type:S.type,stage:S.stage,due};
  m.className='msg';m.textContent='در حال ذخیره…';btn.disabled=true;
  try{const r=await api('fxArc',Object.assign({id:S.id||'',arc,by:fxBy(),sendId:uuid()},ack),{timeout:30000});
    toast(S.id?'اطلاعات پرونده‌ی جا مانده ذخیره شد.':'پرونده‌ی جا مانده ثبت شد؛ اسکن پرونده را در «تصاویر» اضافه کنید.');
    const ed=!!S.id,b=S.back||'list';A6=null;show(b);try{loadList()}catch(x){}pollQ(true);openFile(r.id,arc.name,ed?'tl':'img')}
  catch(x){const s=String(x.message||'');btn.disabled=false;m.textContent='';
    if(s.startsWith('A6DUP|')){if(await uxAsk({title:'بیمار مشابه',msg:'بیمار با همین نام، موبایل یا کد ملی قبلاً ثبت شده است: '+s.slice(6)+'. اگر همان بیمار است، از بایگانی همان پرونده را باز کنید. باز هم پرونده‌ی تازه ثبت شود؟',ok:'بله، پرونده‌ی تازه',cancel:'نه'}))return a6Save(btn,Object.assign(ack,{ackDup:1}));return}
    if(s.startsWith('A6FILE|')){const p=s.split('|');if(await uxAsk({title:'شماره پرونده‌ی تکراری',msg:'شماره پرونده‌ی کاغذی '+faD(p[1])+' قبلاً برای «'+(p[2]||'بیمار دیگر')+'» ثبت شده است. باز هم ثبت شود؟',ok:'بله، ثبت شود',cancel:'نه، اصلاح می‌کنم'}))return a6Save(btn,Object.assign(ack,{ackFile:1}));return}
    if(s.startsWith('A6TOT|')){const p=s.split('|');if(await uxAsk({title:'تغییر مبلغ بیمار',msg:'با این تغییرها هزینه‌ی خالص بیمار از '+fa(num(p[1]))+' به '+fa(num(p[2]))+' تومان تغییر می‌کند. ذخیره شود؟',ok:'بله، ذخیره شود',cancel:'نه'}))return a6Save(btn,Object.assign(ack,{ackTotal:num(p[2])}));return}
    m.className='msg err';m.textContent=s}}
/* ---- patient file: the paper-file box ---- */
{const _i=fxArcInfo;fxArcInfo=function(id,j){const d=j.data||{},a=d.arc;if(!a||!a.v6)return _i.apply(this,arguments);const h=d.h||{},mo=a6Money0()&&a.cost!=null,can=['staff','consultant','accountant'].includes(ROLE);
  const L=(a.lines||[]).slice().sort((x,y)=>String(x.day).localeCompare(String(y.day)));
  return `<div class="fxarcinfo a6info"><b>پرونده‌ی کاغذی (بایگانی)</b>${h.pfile?' · شماره‌ی کاغذی '+esc(faD(h.pfile)):''}${a.day?' · اولین درمان '+esc(jDay(a.day)):''}
   <table class="fx2vt"><thead><tr><th>تاریخ</th><th>درمان</th><th>دندان / تعداد</th><th>پزشک</th>${mo?'<th>تعرفه</th><th>مبلغ</th>':''}</tr></thead><tbody>${L.map(l=>`<tr><td>${esc(jDay(l.day))}</td><td>${esc(a6Lab(l))}${l.k==='imp'||l.k==='sub'||l.k==='reimp'?arbBr(l,1):''}</td><td>${l.teeth&&l.teeth.length?esc(toothTxt(l.teeth)):fa(l.n)}</td><td>${esc(l.doc||'')}</td>${mo?`<td>${fa(l.price||0)}</td><td>${fa(l.amt||0)}</td>`:''}</tr>`).join('')}</tbody>
   ${mo?`<tfoot><tr><td colspan="5">هزینه‌ی کل${a.dc||a.dd?' · تخفیف کلینیک '+fa(a.dc)+' / پزشک '+fa(a.dd)+' · پس از تخفیف '+fa(a.net):''}${a.imp?' · تسویه‌ی قبلی طبق پرونده '+fa(a.imp):''}${a.settled?' · حساب تسویه است':''}</td><td>${fa(a.cost)}</td></tr></tfoot>`:''}</table>
   ${(L.find(l=>l.sut)||{}).sut?'<p>بخیه: '+esc(A6SUT[(L.find(l=>l.sut)||{}).sut]||'')+'</p>':''}${a.other?'<p>درمان‌های دیگر: '+esc(a.other)+'</p>':''}${a.note?'<p>توضیح: '+esc(a.note)+'</p>':''}
   <small>ثبت ${esc(jt(a.at))}${a.by?' · '+esc(a.by):''}${a.upd?' · ویرایش '+esc(jt(a.upd))+(a.updBy?' · '+esc(a.updBy):''):''}</small>${can?` <button class="btn sm ghost" type="button" data-fxarced="${esc(id)}">ویرایش پرونده‌ی جا مانده</button>`:''}</div>`}}
/* the accountant edits the money of a paper file from its file too */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-fxarced]');if(!t||ROLE!=='accountant')return;e.preventDefault();e.stopPropagation();if(PF&&PF.j&&PF.id===t.dataset.fxarced)fxArcOpen(PF.j)},true);
/* ---- «مالی بیماران» / payments tab: payment date (an earlier date is an earlier payment, not today's cash box) ---- */
{const _p=pfPays;pfPays=function(j,r){let h=_p.apply(this,arguments);if(h.includes('id="pyMsg"')&&!h.includes('id="py_day"'))h=h.replace('<div class="msg" id="pyMsg"></div>',`<div class="fields"><label class="f">تاریخ پرداخت<input id="py_day" data-jd="1" placeholder="${esc(jDay(tDay()))}" value="${esc(A6PDV||jDay(tDay()))}" autocomplete="off"><small class="dhint">امروز = صندوق امروز. تاریخ گذشته = پرداخت قبلی (در صندوق امروز نمی‌آید).</small></label></div><div class="msg" id="pyMsg"></div>`);return h}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#pyAdd');if(!t)return;const i=$('py_day');A6PD='';if(!i)return;const v=i.value.trim(),d=v?parseJ(v):tDay(),m=$('pyMsg');
  if(!d||d>tDay()){e.preventDefault();e.stopImmediatePropagation();if(m){m.className='msg err';m.textContent=!d?'تاریخ پرداخت درست نیست.':'تاریخ پرداخت نمی‌تواند بعد از امروز باشد.'}return}if(d<tDay()){A6PD=d;setTimeout(()=>{A6PD=''},0)}},true);
document.addEventListener('input',e=>{if(e.target&&e.target.id==='py_day')A6PDV=e.target.value.trim()});
{const _a=api;api=function(action,payload){if(action==='payAdd'&&A6PD&&payload&&payload.pay&&typeof payload.pay==='object'){payload.pay.day=A6PD;A6PD='';A6PDV=''}return _a.apply(this,arguments)}}
/* payment kind with the card reader's name in the PDF table */
const a6PayK=p=>p.kind==='arc'&&p.meth?'پرداخت قبلی · '+(A6M[p.meth]||''):(PAY_K[p.kind]||p.kind||'—');
/* ---- PDF of a paper file: patient, performed treatments, costs (with discount), payments ---- */
{const _f=fullFilePDF;fullFilePDF=async function(j){try{await ensurePos()}catch(e){}const a=((j&&j.data)||{}).arc;if(!a||!a.v6)return _f.apply(this,arguments);return a6Pdf(j)}}
async function a6Pdf(j){
  try{await Promise.race([logoReady,new Promise(z=>setTimeout(z,1500))])}catch(e){}
  try{await Promise.race([Promise.all([document.fonts.load(`400 20px Vazirmatn`),document.fonts.load(`700 20px Vazirmatn`),document.fonts.load(`800 20px Vazirmatn`)]),new Promise(z=>setTimeout(z,1500))])}catch(e){}
  const r=fromDoc(j.id,j.data||{}),a=j.data.arc,h=j.data.h||{},now=jalali(new Date()),fin=!j.nofin&&a.cost!=null;
  const meta={title:'پرونده‌ی بیمار (بایگانی کاغذی)',dateLine:'تاریخ گزارش: '+now.slash+(h.pfile?' · شماره‌ی پرونده‌ی کاغذی: '+faD(h.pfile):'')};
  const B=[],L=(a.lines||[]).slice().sort((x,y)=>String(x.day).localeCompare(String(y.day)));
B.push(ffTitle('درمان‌های انجام‌شده'));
  B.push(ffTbl(L.map(l=>{const b=l.k==='imp'||l.k==='sub'||l.k==='reimp'?arbBr(l):'';const lab=a6Lab(l)+b+(l.k==='sgd'?' ('+(A9.scan[l.scan||'U'])+')':'')+(l.teeth&&l.teeth.length&&l.k!=='imp'?' — '+toothTxt(l.teeth):'');return [jDay(l.day),lab,l.doc||''].concat(fin?[fa(l.n)+' × '+fa(l.price||0),fa(l.amt||0)]:[fa(l.n)])}),
    fin?[['تاریخ',0.12],['شرح درمان',0.4],['نام پزشک',0.18],['تعداد × تعرفه',0.17],['مبلغ کل',0.13]]:[['تاریخ',0.15],['شرح درمان',0.5],['نام پزشک',0.22],['تعداد',0.13]]));
  if(L.some(l=>l.sut)||a.other||a.note)B.push(textBlock('',[L.find(l=>l.sut)?'بخیه: '+(A6SUT[L.find(l=>l.sut).sut]||''):'',a.other?'درمان‌های دیگر: '+a.other:'',a.note?'توضیح: '+a.note:''].filter(Boolean)));
  if(fin){const P=(j.pays||[]).filter(p=>p.st!=='del'),paid=P.filter(p=>p.st==='ok'||(p.kind==='chq'&&p.st==='wait')).reduce((s,p)=>s+num(p.amount),0)-(j.refunds||[]).filter(x=>x.st==='paid').reduce((s,x)=>s+num(x.amount),0);
    const sum=[['هزینه‌ی کل',money(a.cost||0)]];if(a.dc)sum.push(['تخفیف سهم کلینیک',money(a.dc)]);if(a.dd)sum.push(['تخفیف سهم پزشک',money(a.dd)]);if(a.dc||a.dd)sum.push(['هزینه پس از تخفیف',money(a.net||0)]);
    if(a.imp)sum.push(['تسویه‌ی قبلی طبق پرونده',money(a.imp)]);sum.push(['جمع پرداخت‌ها',money(paid)]);const bal=(Number(j.total)||0)-paid;sum.push([bal<0?'بستانکاری بیمار':'مانده',money(Math.abs(bal))]);
    B.push(ffGap(16));B.push(ffTitle('هزینه‌ها'));B.push(impTable(sum,[['شرح',0.5],['مبلغ',0.5]]));
    if(P.length){B.push(ffGap(16));B.push(ffTitle('پرداخت‌ها'));B.push(ffTbl(P.slice().sort((x,y)=>String(x.at).localeCompare(String(y.at))).map(p=>[jd(p.at),a6PayK(p)+(p.pos&&posName(p.pos)?' · '+posName(p.pos):''),fa(p.amount||0),ffCut([p.kind==='chq'&&p.no?'شماره '+faD(p.no):'',p.kind==='chq'&&p.due?'سررسید '+ffDay(p.due):'',p.bank||'',a6NoteOf(p.note)].filter(Boolean).join(' · '),46)]),[['تاریخ',0.16],['نوع دریافت',0.3],['مبلغ (تومان)',0.18],['توضیح',0.36]]))}}
  try{(await m48NoteBlocks(j)).forEach(b=>B.push(b))}catch(e){}
  const flat=[];B.forEach(b=>{if(b.parts)b.parts.forEach(x=>flat.push(x));else flat.push(b)});
  const pages=[];let pg,y;const bottom=PH-M-36;
  const start=first=>{const cv=document.createElement('canvas');cv.width=PW;cv.height=PH;const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,PW,PH);pg={cv,cx};pages.push(pg);y=M;const hb=first?headerBlock(r,meta):miniHeader(r,meta);hb.draw(cx,y);y+=hb.h};
  start(true);
  flat.forEach((b,i)=>{if(b.pageBreak){if(y>bottom-500)start(false);return}const nx=flat[i+1];if(b.keep&&nx&&y+b.h+Math.min(nx.h,160)>bottom)start(false);if(y+b.h>bottom){start(false);if(b.table){const t2=tableHead();t2.draw(pg.cx,y);y+=t2.h}}b.draw(pg.cx,y);y+=b.h});
  pages.forEach((p,i)=>T(p.cx,`صفحه ${fa(i+1)} از ${fa(pages.length)} · ${r.h.name||''}`,PW/2,PH-M+6,{s:16,c:GREY,a:'center'}));
  const urls=pages.map(p=>p.cv.toDataURL('image/jpeg',0.82));
  return new Blob([jpegPDF(urls.map(u=>({jpg:dataUrlBytes(u),w:PW,h:PH})))],{type:'application/pdf'})}
/* ---- calendar: quick year / month, opens at the last date used, no phone keyboard ---- */
{const _d=fx2DpDraw;fx2DpDraw=function(){_d.apply(this,arguments);const S=FX2DP;if(!S||!S.el)return;const P=jParts(S.anc),Y=jParts(tDay())[0],ys=[];for(let y=Y;y>=Y-40;y--)ys.push(y);
  const bar=document.createElement('div');bar.className='fx2dps';bar.innerHTML=`<select data-dpys aria-label="سال">${ys.map(y=>`<option value="${y}"${y===P[0]?' selected':''}>${faD(String(y))}</option>`).join('')}</select><select data-dpms aria-label="ماه">${JMN.map((n,i)=>`<option value="${i+1}"${i+1===P[1]?' selected':''}>${n}</option>`).join('')}</select>${S.inp&&S.inp.readOnly&&S.inp.dataset.a6ro?'<button type="button" data-dpkb="1">تایپ تاریخ</button>':''}`;
  S.el.insertBefore(bar,S.el.firstChild)}}
document.addEventListener('change',e=>{const t=e.target;if(!FX2DP||!t.closest||!t.closest('.fx2dp'))return;const s=FX2DP.el;const y=Number(s.querySelector('[data-dpys]').value),m=Number(s.querySelector('[data-dpms]').value);const d=parseJ(y+'/'+m+'/1');if(d){FX2DP.anc=d;fx2DpDraw();fx2DpPlace()}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.fx2dp [data-dpkb]');if(!b||!FX2DP)return;e.preventDefault();e.stopImmediatePropagation();const i=FX2DP.inp;i.readOnly=false;i.removeAttribute('inputmode');delete i.dataset.a6ro;fx2DpClose();i.focus()},true);
document.addEventListener('pointerdown',e=>{const t=e.target;if(e.pointerType!=='touch'||!fx2IsDate(t)||t.dataset.a6ro!==undefined||document.activeElement===t)return;t.readOnly=true;t.setAttribute('inputmode','none');t.dataset.a6ro='1'},true);
document.addEventListener('focusout',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.a6ro)setTimeout(()=>{if(document.activeElement!==t&&!FX2DP){t.readOnly=false;t.removeAttribute('inputmode');delete t.dataset.a6ro}},400)});

/* ---- fix7a: patient journey (reception «بیمار رفت», consultant «برگشت به پزشک طرح درمان», nameless booking, surgery-booking warnings) ---- */
async function fx7aAskName(id,msg){const v=await uxAsk({title:'نام بیمار',msg:msg||'این بیمار نام ندارد. برای گرفتن نوبت، نام بیمار لازم است؛ نام در پرونده هم ثبت می‌شود.',fields:[{k:'name',l:'نام و نام خانوادگی بیمار',req:true}],ok:'ثبت نام در پرونده'});
  if(!v||!v.name)return '';const j=await api('fx7aName',{id,name:v.name});toast('نام بیمار در پرونده ثبت شد.');return (j&&j.name)||v.name}
{const _api7=api;api=async function(action,payload={},opt={}){
  try{return await _api7(action,payload,opt)}catch(e){const s=(e&&e.message)||'';
    let m=/^NONAME\|([^|]+)\|([\s\S]*)$/.exec(s);
    if(m){const nm=await fx7aAskName(m[1],m[2]);if(!nm)throw new Error('برای گرفتن نوبت، نام بیمار لازم است.');const p=Object.assign({},payload);if(p.appt&&typeof p.appt==='object')p.appt=Object.assign({},p.appt,{name:nm});else p.name=nm;return await api(action,p,opt)}
    m=/^FORCE\|([\s\S]*)$/.exec(s);
    if(m){const go=await uxConfirm(m[1],'بله، نوبت ثبت شود',false,'هشدار نوبت جراحی');if(!go)throw new Error('نوبت ثبت نشد.');return await _api7(action,Object.assign({},payload,{force:1}),opt)}
    throw e}}}
/* R8: the plan doctor sees why the consultant sent the plan back */
{const _qm7=qMeta;qMeta=function(x){const s=_qm7(x);return x&&x.back?s+` · <b class="fx7bk">${esc('↩ برگشت از مشاور: '+x.back)}</b>`:s}}
/* R4: reception «بیمار رفت» on a patient in the plan doctor's / consultant's cartable */
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('[data-fx7left]');if(!t)return;e.preventDefault();e.stopPropagation();
  const id=t.dataset.fx7left,x=(typeof QITEMS!=='undefined'?QITEMS:[]).find(v=>v.id===id)||{},where=['consult','consulting'].includes(x.queue)?'کارتابل مشاور':'کارتابل پزشک طرح درمان';
  const v=await uxAsk({title:'بیمار رفت',who:x.name||'',msg:'بیمار از '+where+' برداشته می‌شود و به «پیگیری مردد» می‌رود؛ فردا در «پیگیری‌ها» با او تماس بگیرید.',fields:[{k:'note',l:'توضیح (اختیاری)',type:'textarea',full:1}],ok:'ثبت «بیمار رفت»'});
  if(!v)return;t.disabled=true;try{await api('fx7aLeft',{id,note:v.note||'',by:USERNAME||ROLE_LBL[ROLE]});toast('ثبت شد؛ بیمار به پیگیری مردد رفت.');await pollQ(true)}catch(err){toast(err.message,true)}finally{t.disabled=false}},true);
/* R8: consultant «برگشت به پزشک طرح درمان» (required note) */
function fx7aBackShow(){const b=$('fx7Back');if(!b)return;let on=false;try{const x=ROLE==='consultant'&&F&&F.id?(QITEMS||[]).find(v=>v.id===F.id):null;on=!!x&&['consult','consulting'].includes(x.queue)}catch(e){}b.hidden=!on}
{const _rf7=renderForm;renderForm=function(){const r=_rf7.apply(this,arguments);try{fx7aBackShow()}catch(e){}return r}}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('#fx7Back');if(!t)return;e.preventDefault();e.stopPropagation();if(!F||!F.id)return;
  const v=await uxAsk({title:'برگشت به پزشک طرح درمان',who:(F.h&&F.h.name)||'',msg:'طرح به کارتابل پزشک طرح درمان برمی‌گردد و توضیح شما روی کارت بیمار دیده می‌شود.'+(dirty?' تغییرهای ذخیره‌نشده‌ی این فرم ثبت نمی‌شود.':''),fields:[{k:'note',l:'توضیح برای پزشک طرح درمان (الزامی)',type:'textarea',req:true,full:1}],ok:'برگرداندن به پزشک'});
  if(!v||!v.note)return;if(v.note.trim().length<3){toast('توضیح را کامل‌تر بنویسید.',true);return}
  t.disabled=true;try{await api('fx7aBack',{id:F.id,note:v.note,by:USERNAME||ROLE_LBL[ROLE]});leaveForm('طرح به پزشک طرح درمان برگشت.');pollQ(true)}catch(err){toast(err.message,true)}finally{t.disabled=false}},true);

