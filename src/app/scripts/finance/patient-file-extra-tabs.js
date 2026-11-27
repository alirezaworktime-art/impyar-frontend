/* ---------- patient file: extra tabs ---------- */
function refreshFile(){if(!PF)return;const {id}=PF;api('get',{id},{timeout:12000}).then(j=>{if(PF&&PF.id===id){PF.j=j;renderFile()}}).catch(()=>{})}
/* pfTabs: base + m42b («همه‌ی توضیح‌ها» tab) */
function pfTabs(j){const was=PF&&PF.tab;if(was==='cm')PF.tab='tl';const T=[['tl','سیر درمان'],['hist','تاریخچه'+(PF&&PF.ev?' <small id="pfEvN">'+fa(PF.ev.length)+'</small>':' <small id="pfEvN"></small>')]];if(seesMoney()&&CF_ON)T.push(['pay','پرداخت‌ها']);if(CF_ON&&(j.pros||j.status==='confirmed'||j.status==='modified'))T.push(['pros','پروتز و لابراتوار']);if(CF_ON)T.push(['ap','نوبت‌ها']);if(ROLE!=='lab'&&ROLE!=='inventory')T.push(['img','تصاویر'+((j.files||[]).length?' ('+fa(j.files.length)+')':'')]);
  if(!T.some(t=>t[0]===PF.tab))PF.tab='tl';let h=T.length>1?`<div class="seg pftabs" role="group" aria-label="بخش پرونده" style="margin:12px 0">${T.map(([k,l])=>`<button type="button" data-pft="${k}" aria-pressed="${PF.tab===k}">${l}</button>`).join('')}</div>`:'';if(was==='cm')PF.tab='cm';
  try{let n=0;try{n=cmList(j).length}catch(e){}const btn=`<button type="button" data-pft="cm" aria-pressed="${was==='cm'}">همه‌ی توضیح‌ها${n?' <small>'+fa(n)+'</small>':''}</button>`;
    if(!h)h=`<div class="seg pftabs" role="group" aria-label="بخش پرونده" style="margin:12px 0"><button type="button" data-pft="tl" aria-pressed="${was!=='cm'}">سیر درمان</button>${btn}</div>`;
    else{if(was==='cm')h=h.replace('data-pft="tl" aria-pressed="true"','data-pft="tl" aria-pressed="false"');const i=h.lastIndexOf('</div>');h=h.slice(0,i)+btn+h.slice(i)}}catch(e){console.error('m42b tabs',e)}
  return h}
/* pfTabHTML: base + m42b (cm) */
function pfTabHTML(tab,j,r){if(tab==='cm'){try{return cmHTML(j)}catch(e){return `<div class="empty">${esc(e.message)}</div>`}}try{if(tab==='hist')return pfHist(j);if(tab==='pay')return pfPays(j,r);if(tab==='pros')return pfPros(j,r);if(tab==='ap')return pfAppts(j);if(tab==='img')return pfImgs(j)}catch(e){return `<div class="empty">${esc(e.message)}</div>`}return ''}
/* payments */
/* payNums: base + fx4 (the balance the server computes) */
function payNums(j){if(j&&j.bal&&typeof j.bal==='object'){const b=j.bal;return {total:b.total,got:b.paid,wait:b.wait,bounce:b.bounce,rest:b.rest,credit:b.credit,rfOpen:b.rfOpen,waived:b.waived}}const P=j.pays||[],sg=j.surg||{},sum=f=>P.filter(f).reduce((a,p)=>a+(Number(p.amount)||0),0);
  const total=(Number(j.total)||0)+(j.settle&&sg.diff?Number(sg.diff):0),got=sum(p=>p.st==='ok')-(j.refunds||[]).filter(x=>x.st==='paid').reduce((a,x)=>a+(Number(x.amount)||0),0),wait=sum(p=>p.kind==='chq'&&p.st==='wait'),bounce=sum(p=>p.st==='bounce');return {total,got,wait,bounce,rest:total-got-wait}}
/* paySugs: base + o3s (option 3: two rows for the rest, no cheque) */
function paySugs(r){try{if(pl10O3(r)){const T=totals(PV(r,1)),b=effBrand(r),S=T.surg[b]||0,P=T.pros||0,C=o3sCash(r,S);return [['cash','s',C,`نقد قبل از جراحی (${fa(pl10Pct(r))}٪ پارت جراحی)`],['cash','s',Math.max(0,S-C),'مانده‌ی پارت جراحی — تا روز قالب‌گیری'],['cash','p',P,'پارت پروتز — تا روز قالب‌گیری']].filter(s=>s[2]>0)}}catch(e){}
  const out=[];try{const pv=PV(r,1),T=totals(pv),b=effBrand(r),S=T.surg[b],P=T.pros;
  if(S){const n=r.pay.opt==='1'?num(r.pay.n1)||1:1,x=splitPay(S,fracS(r),n);out.push(['cash','s',discOn(r)?S-discAmt(r,S):x.c,discOn(r)?'نقد جراحی با تخفیف':'پیش‌پرداخت نقد جراحی']);if(x.rest)out.push(['chq','s',x.per,n>1?'هر چک جراحی':'چک جراحی'])}
  if(P){const n=num(r.pay.n3)||1,x=splitPay(P,fracP(r),n);out.push(['cash','p',discOn(r)?P-(discAmt(r,S+P)-discAmt(r,S)):x.c,discOn(r)?'نقد پروتز با تخفیف':'پیش‌پرداخت نقد پروتز']);if(x.rest)out.push(['chq','p',x.per,n>1?'هر چک پروتز':'چک پروتز'])}}catch(e){}return out.filter(s=>s[2]>0)}
let PYF={kind:'cash',part:'s'};
function pfPays(j,r){const N=payNums(j),P=(j.pays||[]).filter(p=>p.st!=='del'),ed=ROLE==='consultant'||ROLE==='accountant'||ROLE==='staff',td=tDay();let pt={};try{pt=payText(PV(r,1),effBrand(r))}catch(e){}
  const k=(l,v,c)=>`<div class="kpi mini${c?' '+c:''}"><b>${fa(v)}<small class="cur">تومان</small></b><span>${l}</span></div>`;
  let dsc=0;try{const T0=totals(PV(r,1)),gross=(r.brand==='ref'?Math.min(...BRANDS.map(b=>T0.surg[b.k])):T0.surg[r.brand])+T0.pros;dsc=discAmt(r,gross)}catch(e){}
  let h=`<div class="paysum">${k(dsc?'مبلغ کل طرح (پس از تخفیف)':'مبلغ کل طرح',N.total)}${dsc?k('تخفیف نقدی '+fa(discPct(r))+'٪',dsc):''}${k('دریافت‌شده',N.got)}${k('چک در جریان',N.wait)}${k('مانده',Math.max(0,N.rest),N.rest>0?'warn':'')}</div>`;
  if(N.bounce)h+=`<div class="banner">چک برگشتی: ${money(N.bounce)}</div>`;if(N.rest<0)h+=`<div class="banner info">بیمار ${money(-N.rest)} بستانکار است (دریافتی‌ها بیشتر از مبلغ نهایی طرح).</div>`;
  if(pt.surg||pt.pros)h+=`<p class="note">شرایط پرداخت طرح: ${pt.surg?'جراحی — '+esc(pt.surg):''}${pt.pros?'<br>پروتز — '+esc(pt.pros):''}</p>`;
  h+=P.length?P.map(p=>{const s=PAY_ST[p.st]||['',p.st],late=p.kind==='chq'&&p.st==='wait'&&p.due&&p.due<td;
    return `<div class="prow"><div><span class="amt">${fa(p.amount)}</span> <span class="note">${PAY_K[p.kind]||p.kind}${p.part?' · '+(p.part==='s'?'پارت جراحی':'پارت پروتز'):''}</span>
      <div class="meta">${p.kind==='chq'?`سررسید <span class="${late?'late':''}">${esc(jDay(p.due))}</span>${p.no?' · شماره '+esc(faD(p.no)):''}${p.bank?' · '+esc(p.bank):''}`:'ثبت '+esc(jd(p.at))+(p.pos?' · کارتخوان '+esc(posName(p.pos)||'؟'):'')}${p.note?' · '+esc(p.note):''}</div></div>
      <div class="acts"><span class="pill ${s[0]}">${s[1]}${late?' (گذشته)':''}</span>${ed&&p.kind==='chq'&&p.st!=='ok'?`<button class="btn sm" type="button" data-pyst="ok" data-pid="${esc(p.id)}">وصول شد</button>`:''}${ed&&p.kind==='chq'&&p.st==='wait'?`<button class="btn sm ghost" type="button" data-pyst="bounce" data-pid="${esc(p.id)}">برگشت خورد</button>`:''}${ed&&p.kind==='chq'?`<button class="btn sm ghost" type="button" data-chqp="${esc(p.id)}">🖨 چاپ چک</button>`:''}${ed?`<button class="btn sm ghost danger" type="button" data-pyst="del" data-pid="${esc(p.id)}">حذف</button>`:''}</div></div>`}).join(''):'<div class="empty">هنوز پرداختی ثبت نشده.</div>';
  (j.refunds||[]).forEach(x=>{h+=`<div class="prow"><div><span class="amt">${fa(x.amount)}</span> <span class="note">استرداد به بیمار</span><div class="meta">${x.st==='paid'?'پرداخت شد '+esc(jt(x.paidAt))+' · '+(RF_M[x.method]||'')+(x.paidBy?' · '+esc(x.paidBy):''):'ثبت '+esc(jt(x.at))+(x.by?' · '+esc(x.by):'')}${x.note?' · '+esc(x.note):''}</div></div><div class="acts">${x.st==='paid'?'<span class="pill done">پرداخت شد</span>':(ROLE==='consultant'||ROLE==='accountant')?rfBtns(x.id):'<span class="pill wait">در انتظار پرداخت</span>'}</div></div>`});
  if(ed&&P.some(p=>p.kind==='chq'))h+=`<div class="btns"><button class="btn sm ghost" type="button" data-chqr>🖨 چاپ رسید چک‌های بیمار</button><button class="btn sm ghost" type="button" data-chqp="">🖨 چاپ چک تازه</button></div>`;
  if((ROLE==='consultant'||ROLE==='staff')&&(r.status==='confirmed'||r.status==='modified')&&N.rest>0)h+=`<div class="btns"><button class="btn sm main" type="button" data-p4rest="${esc(j.id||r.id||'')}">${ROLE==='staff'?'تعیین تکلیف مالی':'دریافت مانده‌ی نقد و چک‌ها'}</button></div>`;
  h+=`<div class="btns"><button class="btn sm" type="button" data-chqplan="1">🖨 چک‌های این بیمار (مبلغ و تاریخ خودکار)</button></div>`;
  if(ed){const sug=paySugs(r),td=tDay();
    h+=`<div class="payform"><b>ثبت پرداخت تازه</b>
      ${sug.length?`<div class="chips">${sug.map(s=>`<button type="button" class="chip" data-pysug="${s[0]}|${s[1]}|${s[2]}">${s[3]}: ${fa(s[2])}</button>`).join('')}</div>`:''}
      <div class="seg" role="group" aria-label="نوع پرداخت">${Object.keys(PAY_K).map(x=>`<button type="button" data-pyk="${x}" aria-pressed="${PYF.kind===x}">${PAY_K[x]}</button>`).join('')}</div>
      ${PYF.kind==='card'?`<div class="f"><span>کدام کارتخوان؟</span>${posChips('pypos',PYF.pos,{})}</div>`+fin1AcctHTML('pyacct',PYF.pos==='xfer',PYF.acct):''}
      <div class="seg" role="group" aria-label="بابت">${[['s','پارت جراحی'],['p','پارت پروتز'],['','سایر']].map(([x,l])=>`<button type="button" data-pyp="${x}" aria-pressed="${PYF.part===x}">${l}</button>`).join('')}</div>
      <div class="fields"><label class="f">مبلغ (تومان)<input id="py_amount" class="price" inputmode="numeric" value="${esc(PYF.amount||'')}"></label><label class="f">توضیح<input id="py_note" value="${esc(PYF.note||'')}"></label></div>
      <div id="pyChq" ${PYF.kind==='chq'?'':'hidden'}><div class="fields"><label class="f">تاریخ سررسید (شمسی)<input id="py_due" inputmode="numeric" placeholder="۱۴۰۵/۰۹/۱۵" value="${esc(PYF.due||'')}"><small class="dhint" id="py_dueH"></small></label><label class="f">شماره چک<input id="py_no" inputmode="numeric" value="${esc(PYF.no||'')}"></label><label class="f">بانک<input id="py_bank" value="${esc(PYF.bank||'')}"></label></div><div class="fields"><label class="f">جایگزین چک شماره‌ی … (فقط برای چک برگشتی یا تعویض‌شده)<input id="py_repl" inputmode="numeric" value="${esc(PYF.repl||'')}"></label></div>
        ${fin1ChqHTML('py',PYF)}<div class="chips">${[1,2,3,4,5,6].map(n=>`<button type="button" class="chip" data-pydq="${mAdd(td,n)}">${fa(n)} ماه بعد</button>`).join('')}</div></div>
      <div class="msg" id="pyMsg"></div><div class="btns"><button class="btn" type="button" id="pyAdd">ثبت پرداخت</button></div></div>`;
    h+=icHTML(Math.max(0,N.rest-N.wait))}
  return h}
let IC={open:false,total:'',pre:'',n:'6',gap:1,first:'',bank:'',part:'s'};
function jmAdd(iso,n){const p=jParts(iso);let y=p[0],m=p[1]+n;while(m>12){m-=12;y++}while(m<1){m+=12;y--}const key=(a,b,c)=>a*600+b*40+c;let d=dAdd(iso,Math.round(n*30.44));
  for(let i=0;i<40;i++){const q=jParts(d);if(q[0]===y&&q[1]===m&&(q[2]===p[2]||(q[2]<p[2]&&jParts(dAdd(d,1))[1]!==m)))return d;d=dAdd(d,key(q[0],q[1],q[2])<key(y,m,p[2])?1:-1)}return d}
function icPlan(){const tot=num(IC.total),pre=num(IC.pre),n=Math.max(1,Math.min(36,parseInt(toEn(IC.n),10)||1)),rest=tot-pre,first=parseJ(IC.first||'');if(!tot||rest<=0||!first)return {rows:[],rest,n};
  const unit=100000,base=Math.floor(rest/n/unit)*unit||Math.floor(rest/n),rows=[];for(let i=0;i<n;i++)rows.push({due:jmAdd(first,i*IC.gap),amount:i===0?rest-base*(n-1):base});return {rows,rest,n}}
function icHTML(rest){if(!IC.total&&rest)IC.total=rest.toLocaleString('en-US');if(!IC.first)IC.first=jDay(jmAdd(tDay(),1));const P=icPlan();
  return `<details class="instc"${IC.open?' open':''}><summary>🧮 ماشین‌حساب اقساط — چند چک با یک کلیک</summary>
    <div class="fields"><label class="f">مبلغ کل (تومان)<input id="ic_total" class="price" inputmode="numeric" value="${esc(IC.total)}"></label><label class="f">پیش‌پرداخت (تومان)<input id="ic_pre" class="price" inputmode="numeric" value="${esc(IC.pre)}"></label>
    <label class="f">تعداد چک<input id="ic_n" inputmode="numeric" value="${esc(IC.n)}"></label><label class="f">سررسید اولین چک (شمسی)<input id="ic_first" inputmode="numeric" value="${esc(IC.first)}"></label><label class="f">بانک<input id="ic_bank" value="${esc(IC.bank)}"></label></div>
    <div class="seg"><button type="button" data-icg="1" aria-pressed="${IC.gap===1}">هر ماه</button><button type="button" data-icg="2" aria-pressed="${IC.gap===2}">هر دو ماه</button><button type="button" data-icg="3" aria-pressed="${IC.gap===3}">هر سه ماه</button></div>
    <div class="seg"><button type="button" data-icp="s" aria-pressed="${IC.part==='s'}">پارت جراحی</button><button type="button" data-icp="p" aria-pressed="${IC.part==='p'}">پارت پروتز</button><button type="button" data-icp="" aria-pressed="${IC.part===''}">سایر</button></div>
    <div id="icPrev">${icPrev(P)}</div>
    <p class="note">پیش‌پرداخت را جداگانه با «ثبت پرداخت تازه» ثبت کنید. شماره‌ی هر چک را بعداً می‌توانید در توضیح بنویسید.</p>
    <div class="msg" id="icMsg"></div><div class="btns"><button class="btn" type="button" id="icGo"${P.rows.length?'':' disabled'}>ثبت ${fa(P.rows.length||0)} چک</button></div></details>`}
function icPrev(P){if(!P.rows.length)return `<div class="empty">${P.rest<=0&&num(IC.total)?'پیش‌پرداخت از مبلغ کل بیشتر است.':'مبلغ و تاریخ را وارد کنید.'}</div>`;
  return `<div class="ictab">${P.rows.map((r,i)=>`<div><span>${fa(i+1)}</span><span>${esc(wDay(r.due))} ${esc(jDay(r.due))}</span><b>${fa(r.amount)}</b></div>`).join('')}<div class="tot"><span></span><span>جمع ${fa(P.rows.length)} چک</span><b>${fa(P.rest)}</b></div></div>`}
function icRead(){[['total','ic_total'],['pre','ic_pre'],['n','ic_n'],['first','ic_first'],['bank','ic_bank']].forEach(([k,id])=>{const e=$(id);if(e)IC[k]=e.value})}
function icRefresh(){icRead();const P=icPlan();$('icPrev').innerHTML=icPrev(P);const b=$('icGo');b.disabled=!P.rows.length;b.textContent=`ثبت ${fa(P.rows.length||0)} چک`}
async function icGo(t){icRead();const P=icPlan(),m=$('icMsg');if(!P.rows.length)return;t.disabled=true;let ok=0;
  try{for(const r of P.rows){m.className='msg';m.textContent=`در حال ثبت چک ${fa(ok+1)} از ${fa(P.rows.length)}…`;await api('payAdd',{id:PF.id,pay:{kind:'chq',part:IC.part,amount:r.amount,due:r.due,no:'',bank:IC.bank||'',note:`قسط ${fa(ok+1)} از ${fa(P.rows.length)}`},sendId:uuid()});ok++}
    toast(`${fa(ok)} چک ثبت شد.`);IC={open:false,total:'',pre:'',n:'6',gap:1,first:'',bank:'',part:IC.part};refreshFile();pollQ(true)}
  catch(e){m.className='msg err';m.textContent=(ok?`${fa(ok)} چک ثبت شد؛ `:'')+e.message;t.disabled=false;if(ok)refreshFile()}}
document.addEventListener('input',e=>{const i=e.target;if(!i.id||!i.id.startsWith('ic_'))return;if(i.id==='ic_total'||i.id==='ic_pre')i.value=fmtInput(i.value);icRefresh()});
document.addEventListener('toggle',e=>{if(e.target.classList&&e.target.classList.contains('instc'))IC.open=e.target.open},true);
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;if(t.dataset.icg){IC.gap=+t.dataset.icg;t.parentNode.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b===t));icRefresh();return}
  if(t.dataset.icp!==undefined){IC.part=t.dataset.icp;t.parentNode.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b===t));return}if(t.id==='icGo'){icGo(t)}});
/* cheque printing */
function numWords(n){n=Math.floor(Math.abs(+n||0));if(!n)return 'صفر';const O=['','یک','دو','سه','چهار','پنج','شش','هفت','هشت','نه'],T=['ده','یازده','دوازده','سیزده','چهارده','پانزده','شانزده','هفده','هجده','نوزده'],D=['','','بیست','سی','چهل','پنجاه','شصت','هفتاد','هشتاد','نود'],H=['','یکصد','دویست','سیصد','چهارصد','پانصد','ششصد','هفتصد','هشتصد','نهصد'],S=['','هزار','میلیون','میلیارد','هزار میلیارد'];
  const three=x=>{const h=Math.floor(x/100),r=x%100,p=[];if(h)p.push(H[h]);if(r>=10&&r<20)p.push(T[r-10]);else{const d=Math.floor(r/10),o=r%10;if(d)p.push(D[d]);if(o)p.push(O[o])}return p.join(' و ')};
  const parts=[];let i=0;while(n>0){const c=n%1000;if(c)parts.unshift(three(c)+(S[i]?' '+S[i]:''));n=Math.floor(n/1000);i++}return parts.join(' و ')}
function ordWords(n){const w=numWords(n);return n===1?'یکم':w.endsWith('سه')?w.slice(0,-2)+'سوم':w.endsWith('سی')?w+'‌ام':w+'م'}
function jDateWords(iso){const p=toEn(jDay(iso)).split('/').map(Number);return `${ordWords(p[2])} ${JMN[p[1]-1]} ${numWords(p[0])}`}
const CPS={get(k,d){try{const v=localStorage.getItem('implantChq_'+k);return v===null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('implantChq_'+k,v)}catch(e){}}};
let CP={unit:'r'};
function openChq(o={}){CP=Object.assign({unit:CPS.get('unit','r')},o);$('cp_to').value=o.to||CPS.get('to',SET.clinic||'');$('cp_nid').value=CPS.get('nid','');$('cp_amt').value=o.amount?fa(o.amount):'';$('cp_day').value=o.due?jDay(o.due):'';$('cp_for').value=o.for||'';
  $('cp_dx').value=CPS.get('dx','0');$('cp_dy').value=CPS.get('dy','0');$('cpMsg').textContent='';cpHints();$('cpSheet').hidden=false}
function cpHints(){const a=parseInt(toEn($('cp_amt').value).replace(/[^\d]/g,''),10)||0,u=CP.unit||'r',v=u==='r'?a*10:a;
  $('cp_amtH').textContent=a?`روی چک: ${numWords(v)} ${u==='r'?'ریال':'تومان'}`:'';const iso=parseJ($('cp_day').value.trim());$('cp_dayH').textContent=iso?jDateWords(iso):'';
  document.querySelectorAll('[data-cpu]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.cpu===u))}
function printHTML(html){const f=document.createElement('iframe');f.style.cssText='position:fixed;width:0;height:0;border:0;left:-9999px';document.body.appendChild(f);const d=f.contentDocument;d.open();d.write(html);d.close();
  setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){alertMsg('چاپ در این دستگاه پشتیبانی نمی‌شود؛ از کامپیوتر چاپ کنید.')}setTimeout(()=>f.remove(),60000)},400)}
function printChqReceipt(){if(!PF||!PF.j)return;const r=fromDoc(PF.id,PF.j.data||{}),h=r.h||{},C=(PF.j.pays||[]).filter(p=>p.kind==='chq').sort((a,b)=>(a.due||'').localeCompare(b.due||'')),tot=C.reduce((x,p)=>x+(Number(p.amount)||0),0);
  if(!C.length){alertMsg('چکی برای این بیمار ثبت نشده.');return}const E=x=>esc(String(x??''));
  printHTML(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>رسید چک‌ها</title><style>@page{size:A5;margin:12mm}body{font-family:Vazirmatn,Tahoma,sans-serif;font-size:10.5pt;color:#000}h1{font-size:14pt;margin:0 0 2mm;text-align:center}.sub{text-align:center;margin:0 0 6mm;color:#333}table{width:100%;border-collapse:collapse;margin:4mm 0}th,td{border:1px solid #555;padding:2mm;text-align:center}th{background:#eee}.tot{font-weight:700}.sig{display:flex;justify-content:space-between;margin-top:16mm}.sig div{width:45%;border-top:1px solid #000;padding-top:2mm;text-align:center}</style></head><body>
<h1>${E(SET.clinic||'کلینیک')}</h1><p class="sub">رسید دریافت چک — تاریخ ${E(faD(toEn(jDay(tDay()))))}</p>
<p>بیمار: <b>${E(h.name||'')}</b>${h.nid?' — کد ملی '+E(faD(h.nid)):''}${h.phone?' — موبایل '+E(faD(h.phone)):''}</p>
<table><thead><tr><th>ردیف</th><th>شماره چک</th><th>بانک</th><th>سررسید</th><th>مبلغ (تومان)</th><th>وضعیت</th></tr></thead><tbody>${C.map((p,i)=>`<tr><td>${fa(i+1)}</td><td>${E(faD(p.no||'—'))}</td><td>${E(p.bank||'—')}</td><td>${E(faD(toEn(jDay(p.due))))}</td><td>${fa(p.amount)}</td><td>${E((PAY_ST[p.st]||['',p.st||''])[1])}</td></tr>`).join('')}
<tr class="tot"><td colspan="4">جمع (${fa(C.length)} چک)</td><td colspan="2">${fa(tot)}</td></tr></tbody></table>
<p>جمع به حروف: <b>${E(numWords(tot))} تومان</b></p><div class="sig"><div>امضای بیمار</div><div>امضای مشاور / کلینیک</div></div></body></html>`)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.id==='cpOpen'){openChq();return}
  if(t.dataset.chqp!==undefined){const id=t.dataset.chqp,P=[...QCHQ,...((PF&&PF.j&&PF.j.pays)||[])].find(x=>x.id===id);let nm='';try{nm=P&&P.name||(PF?fromDoc(PF.id,PF.j.data||{}).h.name:'')}catch(x){}openChq(P?{amount:P.amount,due:P.due,for:nm?'طرح درمان '+nm:''}:{for:nm?'طرح درمان '+nm:''});return}
  if(t.hasAttribute('data-chqr')){printChqReceipt();return}
  if(t.dataset.cpu){CP.unit=t.dataset.cpu;cpHints();return}
  if(t.id==='cpGo'){printChq();return}
  if(t.id==='cpClose'){$('cpSheet').hidden=true;return}});
document.addEventListener('input',e=>{if(e.target&&(e.target.id==='cp_amt'||e.target.id==='cp_day'))cpHints()});
/* prosthesis + lab */
let LO=null;
function implantsOf(j){const out={};((j.surg||{}).sessions||[]).forEach(s=>Object.keys(s.imp||{}).forEach(k=>out[k]=s.imp[k]));return out}
function pfPros(j,r){const pr=j.pros,st=pr?pr.stage:'',idx=PST.findIndex(s=>s[0]===st),labs=j.labs||[],open=labs.filter(l=>!['done','cancel'].includes(l.st)),ed=canPros();let h='';
  if(!pr)return `<p class="note">مرحله‌ی پروتز این بیمار هنوز شروع نشده. بعد از ثبت آخرین جلسه‌ی جراحی (با ایمپلنت) خودکار شروع می‌شود.</p>${ed?`<div class="btns"><button class="btn" type="button" data-pnext="${esc(PF.id)}" data-pst="heal">شروع مرحله‌ی پروتز</button><button class="btn ghost" type="button" data-pnext="${esc(PF.id)}" data-pst="impr">شروع از قالب‌گیری</button></div>`:''}`;
  const cnt={};(pr.log||[]).forEach(g=>cnt[g.k]=(cnt[g.k]||0)+1);
  h+=`<div class="stepper5">${PST.slice(0,6).map((s,i)=>`<span class="${s[0]===st?'on':(i<idx||st==='done')?'past':''}">${s[1]}${cnt[s[0]]>1?' ×'+fa(cnt[s[0]]):''}</span>`).join('')}</div>`;
  if(pr.map&&Object.keys(pr.map).length){const M=pr.map,A=Object.keys(M).filter(k=>M[k]==='a'),P=Object.keys(M).filter(k=>M[k]==='p');h+=`<p class="note">پایه‌ها: <b>${esc(toothTxt(A)||'—')}</b>${P.length?' · پونتیک: <b>'+esc(toothTxt(P))+'</b>':''}${pr.mapBy?' · ثبت '+esc(pr.mapBy):''}${pr.mapNote?'<br>'+esc(pr.mapNote):''}</p>`}
  if(st==='done')h+=`<div class="banner info">پروتز تحویل شد. چکاپ دوره‌ای در کارتابل پذیرش زمان‌بندی شده است.</div>`;
  if(st==='heal'&&pr.ready)h+=`<p class="note">زمان تقریبی آنکاوری / قالب‌گیری: <b>${esc(jDay(pr.ready))}</b> (${esc(dayHint(pr.ready))})</p>`;
  const B=[];const bk=(kind,l)=>canAppt()?`<button class="btn sm ghost" type="button" data-book="${kind}">${l}</button>`:'';
  if(ed){if(st==='heal'){B.push(`<button class="btn sm" type="button" data-pnext="${esc(PF.id)}" data-pst="impr">${NEXT_LBL.heal}</button>`);B.push(bk('uncover','نوبت آنکاوری'))}
    if(st==='impr'){if(canLab())B.push(`<button class="btn sm" type="button" id="loOpen">ثبت دستور کار لابراتوار</button>`);B.push(bk('impr','نوبت قالب‌گیری'))}
    if(st==='lab')B.push(`<span class="note">منتظر لابراتوار…</span>`);
    if(st==='tryin'){if(canLab())B.push(`<button class="btn sm" type="button" id="loOpen">${NEXT_LBL.tryin}</button>`);B.push(bk('tryin','نوبت تست رزین'))}
    if(st==='rabt'){if(canLab())B.push(`<button class="btn sm" type="button" id="loOpen">${NEXT_LBL.rabt}</button>`);B.push(bk('rabt','نوبت تست رزین اباتمنت'))}
    if(st==='deliv'){B.push(`<button class="btn sm" type="button" data-pnext="${esc(PF.id)}" data-pst="done">${NEXT_LBL.deliv}</button>`);B.push(bk('deliv','نوبت تحویل روکش'))}}
  if(B.length)h+=`<div class="btns" style="flex-wrap:wrap">${B.join('')}</div>`;
  if(ed){const R=PST.slice(0,st==='done'?6:idx+1);h+=`<div class="prrep"><div class="btns" style="flex-wrap:wrap"><button class="btn sm ghost" type="button" data-pmap="${esc(PF.id)}" data-pmn="">🦷 پایه و پونتیک</button>${R.length?'<button class="btn sm ghost" type="button" data-prept="1">↺ تکرار یک مرحله</button>':''}</div><div class="chips" hidden style="margin-top:6px">${R.map(s=>`<button type="button" class="chip" data-prep="${s[0]}">${s[0]===st?'تکرار همین مرحله: ':'برگشت به: '}${esc(s[1])}${cnt[s[0]]?' (بار '+ordWords(cnt[s[0]]+1)+')':''}</button>`).join('')}</div></div>`}
  if(LO&&canLab()&&st!=='done')h+=loForm(j);
  if(labs.length){h+=`<h3 class="pf-h">سفارش‌های لابراتوار</h3>`+labs.slice().reverse().map(l=>{const d=l.data||{},late=l.due&&l.due<tDay()&&!['ready','done','cancel'].includes(l.st),op=!['done','cancel'].includes(l.st);
    return `<div class="lorder"><div class="row1"><b>${esc(toothTxt(d.teeth||[])||'سفارش')}</b><span class="pill ${LSTC[l.st]||''}">${esc(LST[l.st]||l.st)}</span></div>
      <div class="labcard"><div class="spec">${labSpecs(d)}</div>${l2Btn(l)}</div><div class="meta">ثبت ${esc(jd(l.created))} · تحویل <span class="${late?'late':''}">${esc(jDay(l.due)||'—')}</span>${d.by?' · '+esc(d.by):''}</div>${d.note?`<div class="meta">${esc(d.note)}</div>`:''}${labLog(l.log)}
      ${op&&ROLE!=='manager'?`<div class="labmsg"><input placeholder="پیام یا توضیح برای لابراتوار" data-lbmsg="${esc(l.id)}"><button class="btn sm ghost" type="button" data-lbsend="${esc(l.id)}">ارسال</button></div>`:''}
      ${ed&&l.st==='ready'?`<div class="acts" style="margin-top:8px"><button class="btn sm ghost" type="button" data-lbredo="${esc(l.id)}">برگشت به لابراتوار برای اصلاح</button></div>`:''}
      ${ed&&(l.st==='new')?`<div class="acts" style="margin-top:8px"><button class="btn sm ghost danger" type="button" data-lbset="cancel" data-lid="${esc(l.id)}">لغو سفارش</button></div>`:''}</div>`}).join('')}
  if((pr.log||[]).length)h+=`<h3 class="pf-h">سابقه‌ی مراحل</h3><ul class="llog">${pr.log.slice().reverse().map(g=>`<li><b>${esc(PSTN[g.k]||g.k)}${g.rep?' — تکرار':''}</b>${g.note?' — '+esc(g.note):''}<small>${esc(jt(g.at))}${g.by?' · '+esc(g.by):''}</small></li>`).join('')}</ul>`;
  return h}
const LO_OPT={type:['روکش تک','بریج','اوردنچر','All-on-X','موقت'],mat:['زیرکونیا','PFM','E.max','PMMA'],abut:['استوک','کاستوم','مولتی‌یونیت','Ti-base'],ret:['پیچی','سمانی']};
function loInit(j){const imp=implantsOf(j),teeth=Object.keys(imp),sys=[...new Set(teeth.map(k=>[imp[k].b,imp[k].sys].filter(Boolean).join(' ')).filter(Boolean))].join('، ');
  const r=fromDoc(PF.id,j.data||{}),st0=((j.pros||{}).stage)||'impr';LO={teeth,all:teeth.slice(),type:teeth.length>1?'':'روکش تک',mat:'زیرکونیا',abut:'',ret:'پیچی',shade:'',sys,doc:PROSDOC()||r.h.doc||docList()[0]||'',note:'',due:dAdd(tDay(),10),for:LFOR_DEF[st0]||'tryin'};
  const M=(j.pros||{}).map;if(M&&Object.keys(M).length){LO.all=Object.keys(M);LO.teeth=LO.all.slice();LO.pon=LO.all.filter(k=>M[k]==='p');if(LO.pon.length)LO.type='بریج'}}
function loForm(j){const o=LO,ch=(g,l)=>`<div class="grp"><span>${l}</span><div class="chips">${LO_OPT[g].map(v=>`<button type="button" class="chip" data-lo="${g}" data-lov="${esc(v)}" aria-pressed="${o[g]===v}">${esc(v)}</button>`).join('')}</div></div>`;
  return `<div class="payform"><b>دستور کار تازه برای لابراتوار</b>
    <div class="grp"><span>این دستور کار برای ساخت</span><div class="chips">${Object.keys(LFOR).map(k=>`<button type="button" class="chip" data-lofor="${k}" aria-pressed="${o.for===k}">${LFOR[k]}</button>`).join('')}</div><small class="note">بعد از «آماده» شدن کار در لابراتوار، بیمار به همین مرحله می‌رود. به نظر پزشک پروتز می‌شود مستقیم روکش نهایی ساخت.</small></div>
    <div class="grp"><span>دندان‌ها${o.all.length?'':' (ایمپلنتی در جلسات جراحی ثبت نشده؛ در توضیح بنویسید)'}</span><div class="chips">${o.all.map(k=>`<button type="button" class="chip" data-lot="${k}" aria-pressed="${o.teeth.includes(k)}">${esc(toothTxt([k]))}${(o.pon||[]).includes(k)?' · پونتیک':''}</button>`).join('')}</div></div>
    ${ch('type','نوع کار')}${ch('mat','جنس')}${ch('abut','اباتمنت')}${ch('ret','نوع اتصال')}
    <div class="fields"><label class="f">رنگ (Shade)<input id="lo_shade" class="ltr" placeholder="A2" value="${esc(o.shade)}"></label><label class="f">سیستم ایمپلنت<input id="lo_sys" value="${esc(o.sys)}"></label>
      <label class="f">تاریخ تحویل از لابراتوار<input id="lo_due" inputmode="numeric" value="${esc(jDay(o.due))}"><small class="dhint" id="lo_dueH">${esc(dayHint(o.due))}</small></label><label class="f">پزشک<input id="lo_doc" value="${esc(o.doc)}"></label></div>
    <label class="f">توضیح برای لابراتوار<textarea id="lo_note" rows="2">${esc(o.note)}</textarea></label>
    <div class="msg" id="loMsg"></div><div class="btns"><button class="btn" type="button" id="loSend">ارسال سفارش به لابراتوار</button><button class="btn ghost" type="button" id="loCancel">انصراف</button></div></div>`}
function loRead(){if(!LO)return;const g=id=>($(id)||{}).value;['shade','sys','doc','note'].forEach(k=>{const v=g('lo_'+k);if(v!==undefined)LO[k]=v});const d=g('lo_due');if(d!==undefined){const iso=parseJ(d);LO.dueTxt=d;if(iso)LO.due=iso;else LO.due=''}}
async function loSend(t){loRead();const m=$('loMsg');if(!LO.due){m.className='msg err';m.textContent='تاریخ تحویل را درست وارد کنید.';return}if(!LO.teeth.length&&!LO.note.trim()){m.className='msg err';m.textContent='دندان‌ها را انتخاب کنید یا در توضیح بنویسید.';return}
  t.disabled=true;if(!t.dataset.sid)t.dataset.sid=uuid();
  try{await api('labNew',{id:PF.id,order:{for:LO.for,teeth:LO.teeth,pon:(LO.pon||[]).filter(k=>LO.teeth.includes(k)),type:LO.type,mat:LO.mat,abut:LO.abut,ret:LO.ret,shade:LO.shade,sys:LO.sys,doc:LO.doc,note:LO.note,by:ROLE_LBL[ROLE]},due:LO.due,sendId:t.dataset.sid});LO=null;toast('سفارش به لابراتوار رفت.');refreshFile();if(!$('viewPros').hidden)loadPros()}
  catch(e){m.className='msg err';m.textContent=e.message;t.disabled=false}}
/* appointments in the file */
function pfAppts(j){const A=(j.appts||[]).slice().sort((a,b)=>(b.day+b.time).localeCompare(a.day+a.time)),td=tDay(),C=a=>apptCard(a,{date:1,nofile:1});
  const part=(L,ttl,g,bk,bl)=>{const up=L.filter(a=>a.day>=td&&a.st==='set').reverse(),past=L.filter(a=>!(a.day>=td&&a.st==='set'));if(!L.length&&!bk)return '';
    return `<h3 class="pf-h"><span class="kdot k-${g}"></span>${ttl}</h3>`+(bk&&canAppt()?`<div class="btns"><button class="btn sm ghost" type="button" data-book="${bk}">${bl}</button></div>`:'')+
      (up.length?up.map(C).join(''):'<div class="empty">نوبت آینده‌ای ثبت نشده.</div>')+(past.length?`<div class="note" style="margin:8px 0 4px">گذشته</div>`+past.map(C).join(''):'')};
  return part(A.filter(a=>apG(a.kind)==='sg'),'نوبت‌های جراحی','sg','surg','+ نوبت جراحی تازه')+part(A.filter(a=>apG(a.kind)==='pr'),'نوبت‌های پروتز','pr','impr','+ نوبت پروتز تازه')+part(A.filter(a=>!apG(a.kind)),'سایر نوبت‌ها','ot','','')}
function bookFromFile(kind){const j=PF.j||{},h=((j.data||{}).h)||{};openAppt({plan:PF.id,name:h.name||'',phone:h.phone||'',kind:kind||'surg',lock:1,grp:kind?'':'all'})}

