/* ---------- inv2: inventory v2 — receipts with supplier / invoice / price / date, returns, waste, stock count, purchase orders, reports ---------- */
const I2T={in:'ورود (خرید)',out:'خروج',adj:'اصلاح / شمارش',use:'مصرف در جراحی',ret:'برگشت به تأمین‌کننده',waste:'ضایعات'};
const I2G={fix:'فیکسچر (ایمپلنت)',hc:'هیلینگ و کاور',mem:'ممبران و تگ',graft:'پیوند استخوان',sut:'نخ بخیه',oth:'سایر مواد'};
const I2BG={ir:'ایرانی',ko:'کره‌ای',it:'ایتالیایی',sw:'سوئیسی','?':'برند نامشخص','':'—'};
const I2PST={open:'باز',partial:'دریافت ناقص',received:'دریافت کامل',cancel:'لغو شده'};
const INV2={rep:'stock',per:null,f:{},fs:{},p:{},res:null,busy:false,cnt:{},cntQ:'',cntK:'',po:null,recv:null,mode:'',pick:false};
const i2Read=()=>['inventory','manager','accountant'].includes(ROLE);
const i2Write=()=>ROLE==='inventory';
const i2SupN=id=>((INV.sups||[]).find(s=>s.id===id)||{}).name||'';
const i2Lbl=it=>it?invLbl(it):'قلم حذف‌شده';
const i2Fn=s=>String(s||'report').replace(/[\\/:*?"<>|]+/g,' ').replace(/\s+/g,' ').trim();
const i2P=v=>v===null||v===undefined||v===''?'':faD(String(Math.round(Number(v)*10)/10))+'٪';
/* ---- dates: Jalali presets (week starts Saturday) ---- */
const I2PRE=[['t','امروز'],['y','دیروز'],['w','این هفته'],['pw','هفته‌ی قبل'],['m','این ماه'],['pm','ماه قبل'],['q3','سه ماه اخیر'],['q6','شش ماه اخیر'],['yr','امسال'],['py','سال قبل']];
function i2Range(k){const td=tDay(),[y,m]=jYM(),wd=(new Date(td+'T12:00:00Z').getUTCDay()+1)%7,ws=dAdd(td,-wd);
  if(k==='t')return {from:td,to:td};if(k==='y'){const d=dAdd(td,-1);return {from:d,to:d}}if(k==='w')return {from:ws,to:td};if(k==='pw')return {from:dAdd(ws,-7),to:dAdd(ws,-1)};
  if(k==='m')return {from:jmRange(y,m).from,to:td};if(k==='pm'){const r=m===1?jmRange(y-1,12):jmRange(y,m-1);return {from:r.from,to:r.to}}
  if(k==='q3')return {from:dAdd(td,-89),to:td};if(k==='q6')return {from:dAdd(td,-181),to:td};if(k==='yr')return {from:parseJ(`${y}/1/1`),to:td};
  if(k==='py')return {from:parseJ(`${y-1}/1/1`),to:dAdd(parseJ(`${y}/1/1`),-1)};return null}
function i2Months(from,to){const out=[];let [y,m]=toEn(jDay(from)).split('/').map(Number);for(let k=0;k<60;k++){const r=jmRange(y,m);if(r.from>to)break;out.push({k:r.k,from:r.from<from?from:r.from,to:r.to>to?to:r.to,l:r.l});m++;if(m>12){m=1;y++}}return out}
const i2Mon=d=>{const [y,m]=toEn(jDay(d)).split('/');return y+'-'+m};
const i2MonL=k=>{const [y,m]=k.split('-').map(Number);return FMON[m-1]+' '+fa(y).replace(/٬/g,'')};
/* ---- report catalogue ---- */
const I2F=['item','kind','b','sys','d','l'];
const I2R=[
 ['موجودی',[['stock','موجودی فعلی','none',I2F],['asof','موجودی در تاریخ','asof',I2F],['kardex','کاردکس قلم','r',['item']],['low','زیر حد سفارش و تمام‌شده','none',I2F],['stale','اقلام راکد / کم‌گردش','none',I2F,['n','mode']],['age','سن موجودی (FIFO)','none',I2F]]],
 ['گردش',[['flow','گردش دوره (همه‌ی اقلام)','r',I2F],['daily','گردش روزانه','r',I2F.concat(['type','by'])],['monthly','روند مصرف ماهانه','r',I2F],['users','فعالیت کاربران انبار','r',I2F.concat(['type','by'])]]],
 ['خرید',[['buy','خرید','r',I2F.concat(['sup','by'])],['bysup','خرید به تفکیک تأمین‌کننده','r',I2F.concat(['sup'])],['price','تغییر قیمت خرید و مقایسه‌ی تأمین‌کننده‌ها','r',I2F.concat(['sup'])],['suggest','پیشنهاد خرید','none',I2F,['n','cover']],['bud','بودجه‌ی خرید در برابر خرید واقعی','r',I2F],['po','سفارش‌های خرید باز و دیرکرد','r',['sup']],['po3','تطبیق سه‌طرفه (سفارش، رسید، فاکتور)','r',I2F.concat(['sup'])],['lead','زمان تحویل و خوش‌قولی تأمین‌کننده','r',['sup']]]],
 ['مصرف',[['bypat','مصرف به تفکیک بیمار','r',I2F.concat(['doc'])],['bybrand','مصرف به تفکیک برند / سیستم / سایز','r',I2F,['g']],['bydoc','مصرف به تفکیک پزشک','r',I2F.concat(['doc'])],['pers','مصرف به ازای هر جراحی (پزشک)','r',I2F.concat(['doc'])],['abc','ABC (پارتو)','r',I2F],['margin','هزینه‌ی مواد و سود هر بیمار','r',I2F.concat(['doc']),['mg']],['fore','پیش‌بینی نیاز از نوبت‌های جراحی','none',[],['n']],['pva','طرح در برابر مصرف واقعی','r',['doc']]]],
 ['کنترل و حسابرسی',[['value','ارزش انبار و بهای مصرف (حسابداری)','r',I2F],['kpi','داشبورد شاخص‌ها','r',I2F],['count','اختلاف شمارش و انبارگردانی','r',I2F],['waste','ضایعات و برگشت از خرید','r',I2F.concat(['sup'])],['recon','تطبیق جراحی و انبار','r',['doc']],['so','تمام‌شدن هنگام جراحی','r',I2F.concat(['doc'])],['fail','نرخ شکست ایمپلنت','r',['b','doc','sup'],['fg']]]]];
const I2D={};I2R.forEach(([g,L])=>L.forEach(([k,t,rg,f,p])=>{I2D[k]={k,t,g,rg,f,p:p||[]}}));
/* ---- filter bar ---- */
function i2Opts(list,sel,all){return `<option value="">${esc(all||'همه')}</option>`+list.map(([v,l])=>`<option value="${esc(v)}"${String(v)===String(sel)?' selected':''}>${esc(l)}</option>`).join('')}
const i2Uniq=a=>[...new Set(a.filter(Boolean).map(x=>String(x).trim()))].sort((x,y)=>parseFloat(x)-parseFloat(y)||x.localeCompare(y,'fa'));
function i2FiltHTML(d){const f=INV2.f,p=INV2.p,it=INV.items||[],H=[];
  if(d.rg==='r'||d.rg==='asof'){const r=INV2.per;H.push(`<div class="i2dates">${d.rg==='r'?`<label class="f">از<input id="i2From" inputmode="numeric" value="${esc(jDay(r.from))}"></label>`:''}<label class="f">${d.rg==='asof'?'در تاریخ (پایان روز)':'تا'}<input id="i2To" inputmode="numeric" value="${esc(jDay(r.to))}"></label>
    <span class="chips">${I2PRE.map(([k,l])=>`<button type="button" class="chip" data-i2pre="${k}" aria-pressed="${INV2.pk===k}">${l}</button>`).join('')}<button type="button" class="chip" data-i2pre="c" aria-pressed="${INV2.pk==='c'}">دلخواه از / تا</button></span></div>`)}
  const S=[];
  if(d.f.includes('item'))S.push(`<label class="f i2wide">قلم<select id="i2f_item">${i2Opts(it.slice().sort((a,b)=>i2Lbl(a).localeCompare(i2Lbl(b),'fa')).map(i=>[i.id,i2Lbl(i)]),f.item,d.k==='kardex'?'— یک قلم را انتخاب کنید —':'همه‌ی اقلام')}</select></label>`);
  if(d.f.includes('kind'))S.push(`<label class="f">گروه / نوع<select id="i2f_kind">${i2Opts([['fix','فیکسچر'],['hc','هیلینگ و کاور'],['heal','هیلینگ'],['cover','کاور'],['other','مواد مصرفی']],f.kind)}</select></label>`);
  if(d.f.includes('b'))S.push(`<label class="f">برند<select id="i2f_b">${i2Opts(i2Uniq(it.map(i=>i.b)).map(x=>[x,x]),f.b)}</select></label>`);
  if(d.f.includes('sys'))S.push(`<label class="f">سیستم<select id="i2f_sys">${i2Opts(i2Uniq(it.map(i=>i.sys)).map(x=>[x,x]),f.sys)}</select></label>`);
  if(d.f.includes('d'))S.push(`<label class="f">قطر / سایز<select id="i2f_d">${i2Opts(i2Uniq(it.map(i=>i.d)).map(x=>[x,x]),f.d)}</select></label>`);
  if(d.f.includes('l'))S.push(`<label class="f">طول<select id="i2f_l">${i2Opts(i2Uniq(it.map(i=>i.l)).map(x=>[x,x]),f.l)}</select></label>`);
  if(d.f.includes('sup'))S.push(`<label class="f">تأمین‌کننده<select id="i2f_sup">${i2Opts((INV.sups||[]).map(s=>[s.id,s.name]),f.sup)}</select></label>`);
  if(d.f.includes('doc'))S.push(`<label class="f">پزشک<input id="i2f_doc" list="i2dlDoc" value="${esc(f.doc||'')}" placeholder="همه"></label>`);
  if(d.f.includes('by'))S.push(`<label class="f">کاربر ثبت‌کننده<input id="i2f_by" list="i2dlBy" value="${esc(f.by||'')}" placeholder="همه"></label>`);
  if(d.f.includes('type'))S.push(`<label class="f">نوع حرکت<select id="i2f_type">${i2Opts(Object.entries(I2T),f.type)}</select></label>`);
  if(d.p.includes('n'))S.push(`<label class="f">${d.k==='fore'?'نوبت‌های چند روز آینده':d.k==='stale'?'بدون حرکت در چند روز':'میانگین مصرف چند روز اخیر'}<input id="i2p_n" inputmode="numeric" value="${esc(faD(p.n||(d.k==='fore'?30:90)))}"></label>`);
  if(d.p.includes('cover'))S.push(`<label class="f">موجودی برای چند روز<input id="i2p_cover" inputmode="numeric" value="${esc(faD(p.cover||60))}"></label>`);
  if(d.p.includes('mode'))S.push(`<label class="f">معیار<select id="i2p_mode">${[['use','بدون مصرف'],['any','بدون هیچ حرکتی']].map(([v,l])=>`<option value="${v}"${(p.mode||'use')===v?' selected':''}>${l}</option>`).join('')}</select></label>`);
  if(d.p.includes('g'))S.push(`<label class="f">تفکیک<select id="i2p_g">${[['b','برند'],['sys','سیستم'],['size','سایز']].map(([v,l])=>`<option value="${v}"${(p.g||'b')===v?' selected':''}>${l}</option>`).join('')}</select></label>`);
  if(d.p.includes('fg'))S.push(`<label class="f">تفکیک<select id="i2p_fg">${[['b','برند'],['sys','سیستم'],['size','قطر و طول'],['doc','پزشک'],['sup','تأمین‌کننده']].map(([v,l])=>`<option value="${v}"${(p.fg||'b')===v?' selected':''}>${l}</option>`).join('')}</select></label>`);
  if(d.p.includes('mg'))S.push(`<label class="f">تفکیک<select id="i2p_mg">${[['pat','بیمار'],['bg','برند'],['doc','پزشک'],['mon','ماه']].map(([v,l])=>`<option value="${v}"${(p.mg||'pat')===v?' selected':''}>${l}</option>`).join('')}</select></label>`);
  const docs=i2Uniq((INV.moves||[]).filter(m=>m.type==='use').map(m=>m.by)),bys=i2Uniq((INV.moves||[]).map(m=>m.by));
  return H.join('')+(S.length?`<div class="fields i2flt">${S.join('')}</div>`:'')+`<datalist id="i2dlDoc">${docs.map(x=>`<option value="${esc(x)}">`).join('')}</datalist><datalist id="i2dlBy">${bys.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`+
    `<div class="btns i2go"><button class="btn" type="button" id="i2Go">نمایش گزارش</button><span class="i2x"><button type="button" class="btn ghost sm" data-i2x="x">⬇ اکسل</button><button type="button" class="btn ghost sm" data-i2x="pdf">📄 PDF</button><button type="button" class="btn ghost sm" data-i2x="p">🖨 چاپ</button></span></div>`}
function i2FiltRead(){const d=I2D[INV2.rep],g=id=>{const e=$(id);return e?String(e.value).trim():undefined},f={};
  ['item','kind','b','sys','d','l','sup','doc','by','type'].forEach(k=>{const v=g('i2f_'+k);if(v!==undefined)f[k]=v});INV2.f=Object.assign(INV2.f,f);
  const p=INV2.p;[['n'],['cover']].forEach(([k])=>{const v=g('i2p_'+k);if(v!==undefined)p[k]=num(v)||''});['mode','g','fg','mg'].forEach(k=>{const v=g('i2p_'+k);if(v!==undefined)p[k]=v});
  if($('i2To')){const t=parseJ($('i2To').value),fr=$('i2From')?parseJ($('i2From').value):INV2.per.from;if(!t||!fr)return 'تاریخ را درست بنویسید (مثل ۱۴۰۵/۰۸/۰۱).';if(d.rg==='r'&&fr>t)return 'تاریخ «از» بعد از «تا» است.';INV2.per={from:d.rg==='r'?fr:INV2.per.from,to:t}}
  return ''}
function i2FiltSum(){const d=I2D[INV2.rep],f=INV2.f,L=[],it=k=>(INV.items||[]).find(i=>i.id===k);
  if(d.f.includes('item')&&f.item)L.push('قلم: '+i2Lbl(it(f.item)));if(d.f.includes('kind')&&f.kind)L.push('گروه: '+({fix:'فیکسچر',hc:'هیلینگ و کاور',heal:'هیلینگ',cover:'کاور',other:'مواد مصرفی'}[f.kind]||f.kind));
  [['b','برند'],['sys','سیستم'],['d','قطر / سایز'],['l','طول'],['doc','پزشک'],['by','کاربر']].forEach(([k,l])=>{if(d.f.includes(k)&&f[k])L.push(l+': '+f[k])});
  if(d.f.includes('sup')&&f.sup)L.push('تأمین‌کننده: '+i2SupN(f.sup));if(d.f.includes('type')&&f.type)L.push('نوع حرکت: '+I2T[f.type]);return L.join(' · ')||'بدون فیلتر'}
function i2RangeTxt(j){const d=I2D[INV2.rep];if(d.rg==='asof')return 'در تاریخ '+jDay(j?j.to:INV2.per.to)+' (پایان روز)';if(d.rg==='none')return 'وضعیت '+(d.k==='fore'?'نوبت‌های '+fa((j&&j.n)||INV2.p.n||30)+' روز آینده':'امروز ')+jDay(tDay());return 'از '+jDay(j?j.from:INV2.per.from)+' تا '+jDay(j?j.to:INV2.per.to)}
/* ---- view ---- */
/* i2Segs / i2Render merge three layers: inv2 (rep/cnt/po), pa9 (storekeeper tab «ifin»: i9On, i9View) and fix6b A7 (storekeeper tab «icat»: fx6bCatView). */
function i2Segs(){const r=i2Read();document.querySelectorAll('[data-iseg="rep"],[data-iseg="po"]').forEach(b=>b.hidden=!r);document.querySelectorAll('[data-iseg="cnt"]').forEach(b=>b.hidden=!i2Write());
  if((!r&&['rep','po'].includes(INV.seg))||(!i2Write()&&INV.seg==='cnt'))INV.seg='fix';
  document.querySelectorAll('[data-iseg="ifin"]').forEach(b=>b.hidden=!i9On());if(!i9On()&&INV.seg==='ifin')INV.seg='fix';
  document.querySelectorAll('[data-iseg="icat"]').forEach(b=>b.hidden=ROLE!=='inventory');if(ROLE!=='inventory'&&INV.seg==='icat')INV.seg='fix'}
function i2Render(B,force){$('invTools').hidden=true;if(INV.seg==='icat')return fx6bCatView(B,force);if(INV.seg==='ifin')return i9View(B,force);const v=INV.seg,cur=B.querySelector('[data-i2view]');if(cur&&cur.dataset.i2view===v&&!force){if(v==='cnt')i2CntDiff();return}
  if(v==='rep')return i2RepView(B);if(v==='cnt')return i2CntView(B);if(v==='po')return i2PoView(B)}
function i2RepView(B){if(!INV2.per){INV2.per=i2Range('m');INV2.pk='m'}const d=I2D[INV2.rep];
  B.innerHTML=`<div class="i2rep" data-i2view="rep"><aside class="i2nav">${I2R.map(([g,L])=>`<div class="i2grp"><b>${esc(g)}</b>${L.map(([k,t])=>`<button type="button" class="i2card" data-i2rep="${k}" aria-current="${k===INV2.rep}">${esc(t)}</button>`).join('')}</div>`).join('')}</aside>
    <section class="i2main"><label class="f i2sel">گزارش<select id="i2Sel">${I2R.map(([g,L])=>`<optgroup label="${esc(g)}">${L.map(([k,t])=>`<option value="${k}"${k===INV2.rep?' selected':''}>${esc(t)}</option>`).join('')}</optgroup>`).join('')}</select></label><div class="i2hd"><h3>${esc(d.t)}</h3><small class="note" id="i2Rng">${esc(i2RangeTxt(INV2.res&&INV2.res.kind===d.k?INV2.res:null))}</small></div><div class="i2bar">${i2FiltHTML(d)}</div><div class="msg" id="i2Msg"></div><div id="i2Out">${INV2.res&&INV2.res.kind===d.k?'':'<div class="empty">بازه و فیلترها را انتخاب کنید و «نمایش گزارش» را بزنید.</div>'}</div></section></div>`;
  if(INV2.res&&INV2.res.kind===d.k)i2Show(INV2.res)}
async function i2Run(){const d=I2D[INV2.rep],m=$('i2Msg'),e=i2FiltRead();if(e){m.className='msg err';m.textContent=e;return}
  if(d.k==='kardex'&&!INV2.f.item){m.className='msg err';m.textContent='برای کاردکس یک قلم را انتخاب کنید.';return}
  const f={};d.f.forEach(k=>{if(INV2.f[k])f[k]=INV2.f[k]});const p={};d.p.forEach(k=>{if(INV2.p[k]!==undefined&&INV2.p[k]!=='')p[k]=INV2.p[k]});
  if(d.k==='bud')p.months=i2Months(INV2.per.from,INV2.per.to).map(x=>({k:x.k,from:x.from,to:x.to}));
  m.className='msg';m.textContent='در حال ساختن گزارش…';INV2.busy=true;
  try{const j=await api('invReport',{kind:d.k,from:INV2.per.from,to:INV2.per.to,f,p},{timeout:30000});INV2.res=j;m.textContent='';i2Show(j)}
  catch(err){m.className='msg err';m.textContent=err.message}finally{INV2.busy=false}}
let I2TB=[];
/* filters are kept per report (an item chosen for the kardex does not narrow the other reports) */
function i2SetRep(k){INV2.fs[INV2.rep]=INV2.f;INV2.rep=k;INV2.f=INV2.fs[k]||(INV2.fs[k]={});i2Render($('invBody'),true)}
function i2Show(j){const d=I2D[j.kind],O=$('i2Out');if(!O)return;const r=$('i2Rng');if(r)r.textContent=i2RangeTxt(j);I2TB=[];INV2.chart=null;
  const L=j.items||{},lb=id=>i2Lbl(L[id]),T=(id,title,cols,rows,o={})=>{I2TB.push(id);return FT('i2'+id,title,cols,rows,Object.assign({cap:500},o))};
  const html=(I2V[j.kind]||(()=>''))(j,T,lb);O.innerHTML=(j.trunc?'<div class="banner">نتیجه بیش از ۳۰٬۰۰۰ حرکت داشت؛ بازه را کوتاه‌تر کنید.</div>':'')+html+(INV2.chart?i2ChartHTML(INV2.chart):'');
  const info='بازه: '+i2RangeTxt(j)+' · فیلترها: '+i2FiltSum();I2TB.forEach((id,i)=>{const x=FTD['i2'+id];if(x&&!i)x.sub=info+(x.sub?' · '+x.sub:'')})}
/* column helpers */
const cI=(lb,k='item')=>({k,l:'قلم',v:r=>lb(r[k])});
const cD=(k,l='تاریخ')=>({k,l,t:'d'});const cN=(k,l)=>({k,l,t:'n'});const cM=(k,l)=>({k,l,t:'m'});const cP=(k,l)=>({k,l,t:'p'});const cS=(k,l,v)=>({k,l,v});
const cE={k:'est',l:'ارزش',v:r=>r.est?'تخمینی':''};
const cPat=()=>({k:'name',l:'بیمار',v:r=>r.name||'—',f:r=>['manager','accountant'].includes(ROLE)&&r.ref?`<button type="button" class="lnk" data-file="${esc(r.ref)}" data-fname="${esc(r.name||'')}">${esc(r.name||'—')}</button>`:esc(r.name||'—')});
const i2Spec=s=>s?invLbl(Object.assign({kind:'fix'},s)):'';
function i2Grp(rows,key,lab,fields){const A={};rows.forEach(r=>{const k=key(r),x=A[k]||(A[k]={k,l:lab(r)});fields.forEach(([f,fn])=>{x[f]=(x[f]||0)+(fn?fn(r):(Number(r[f])||0))})});return Object.values(A)}
const I2V={};
I2V.stock=(j,T,lb)=>T('stock','موجودی فعلی',[cI(lb),cN('qty','موجودی'),cS('unit','واحد',r=>(j.items[r.item]||{}).unit||'عدد'),cN('min','حداقل'),cM('cost','میانگین بها'),cM('val','ارزش'),cE,cS('low','وضعیت',r=>r.qty<0?'کسری':r.qty===0?'تمام‌شده':r.low?'زیر حد سفارش':'موجود'),cD('last','آخرین حرکت')],j.rows.sort((a,b)=>lb(a.item).localeCompare(lb(b.item),'fa')),{sum:['qty','val'],rc:r=>r.low?'open':''});
I2V.asof=(j,T,lb)=>T('asof','موجودی در تاریخ '+jDay(j.to),[cI(lb),cN('qty','موجودی'),cM('cost','بهای واحد'),cM('val','ارزش'),cE],j.rows.sort((a,b)=>lb(a.item).localeCompare(lb(b.item),'fa')),{sum:['qty','val']});
I2V.kardex=(j,T,lb)=>{const it=Object.values(j.items)[0]||(INV.items||[]).find(i=>i.id===INV2.f.item);const R=[{day:j.from,type:'',lbl:'مانده‌ی اول دوره',bal:j.open.q,runv:j.open.v,hdr:1}].concat(j.rows,[{day:j.to,lbl:'مانده‌ی پایان دوره',bal:j.close.q,runv:j.close.v,hdr:1}]);
  return `<p class="note">کاردکس: <b>${esc(i2Lbl(it))}</b> · مانده‌ی اول دوره ${fa(j.open.q)} (${nf(j.open.v)} تومان) · مانده‌ی پایان دوره ${fa(j.close.q)} (${nf(j.close.v)} تومان)</p>`+
  T('kardex','کاردکس '+i2Lbl(it),[cD('day'),cS('type','شرح',r=>r.lbl||I2T[r.type]||r.type),cN('inq','وارده'),cN('outq','صادره'),cN('bal','مانده'),cM('cost','بهای واحد'),cM('val','ارزش حرکت'),cM('runv','ارزش مانده'),cS('party','طرف / بیمار',r=>r.sup?r.sup+(r.inv?' · فاکتور '+r.inv:''):r.refName||''),cS('by','ثبت‌کننده'),cS('note','توضیح')],R,{rc:r=>r.hdr?'tot':''})};
I2V.flow=(j,T,lb)=>{const R=j.rows.sort((a,b)=>lb(a.item).localeCompare(lb(b.item),'fa'));return T('flowq','گردش دوره — تعداد',[cI(lb),cN('oq','اول دوره'),cN('inq','خرید'),cN('useq','مصرف جراحی'),cN('outq','خروج'),cN('retq','برگشت'),cN('wasteq','ضایعات'),cN('apq','اصلاح +'),cN('amq','اصلاح −'),cN('cq','پایان دوره')],R,{sum:['oq','inq','useq','outq','retq','wasteq','apq','amq','cq']})+
  T('flowv','گردش دوره — ارزش (تومان)',[cI(lb),cM('ov','اول دوره'),cM('inv','خرید'),cM('usev','مصرف جراحی'),cM('outv','خروج'),cM('retv','برگشت'),cM('wastev','ضایعات'),cM('apv','اصلاح +'),cM('amv','اصلاح −'),cM('cv','پایان دوره')],R,{sum:['ov','inv','usev','outv','retv','wastev','apv','amv','cv']})};
I2V.buy=(j,T,lb)=>T('buy','فهرست خرید',[cD('day'),cS('supName','تأمین‌کننده',r=>r.supName||'—'),cS('inv','شماره فاکتور'),cI(lb),cN('n','تعداد'),cM('price','قیمت واحد'),cM('val','جمع ردیف'),cS('est','',r=>r.price==null?'بدون قیمت':''),cS('by','ثبت‌کننده')],j.rows,{sum:['n','val']})+
  T('buys','جمع به تفکیک تأمین‌کننده',[cS('name','تأمین‌کننده',r=>r.name||'—'),cN('invs','فاکتور'),cN('lines','ردیف'),cN('n','تعداد'),cM('val','مبلغ')],j.bySup,{sum:['invs','lines','n','val']})+
  T('buyi','جمع و سابقه‌ی قیمت به تفکیک قلم',[cI(lb),cN('n','تعداد'),cM('val','مبلغ'),cM('min','کمترین قیمت'),cM('max','بیشترین قیمت'),cM('last','آخرین قیمت'),cM('avgp','میانگین قیمت')],j.byItem,{sum:['n','val']});
I2V.bysup=(j,T)=>T('bysup','خرید به تفکیک تأمین‌کننده',[cS('name','تأمین‌کننده',r=>r.name||'بدون تأمین‌کننده'),cN('invs','فاکتور'),cN('items','قلم'),cN('lines','ردیف'),cN('n','تعداد'),cM('val','مبلغ خرید'),cN('retn','برگشتی'),cM('retv','مبلغ برگشت'),cM('net','خالص')],j.rows.sort((a,b)=>b.val-a.val),{sum:['invs','lines','n','val','retn','retv','net']});
I2V.bypat=(j,T,lb)=>T('bypatt','جمع به تفکیک بیمار',[cPat(),cN('lines','ردیف'),cN('n','تعداد'),cM('val','بهای مصرف')],j.byPat.sort((a,b)=>b.val-a.val),{sum:['lines','n','val']})+
  T('bypat','ریز مصرف در جراحی',[cD('day'),cPat()].concat(j.rows.length&&j.rows[0].nid!==undefined?[cS('nid','کد ملی',r=>faD(r.nid||''))]:[]).concat([cI(lb),cS('note','دندان',r=>invNote(r.note).replace(/<[^>]*>/g,'')),cN('n','تعداد'),cM('cost','بهای واحد'),cM('val','بها'),cE,cS('doc','پزشک')]),j.rows,{sum:['n','val']});
I2V.bybrand=(j,T)=>T('bybrand','مصرف به تفکیک '+({b:'برند',sys:'سیستم',size:'سایز'}[j.g]),[cS('k',{b:'برند',sys:'سیستم',size:'سایز'}[j.g],r=>r.k||'—'),cN('n','تعداد'),cP('shq','سهم تعداد'),cM('val','ارزش'),cP('shv','سهم ارزش'),cN('pn','تعداد دوره‌ی قبل'),cM('pval','ارزش دوره‌ی قبل'),cP('chg','تغییر ارزش')],j.rows.sort((a,b)=>b.val-a.val||b.n-a.n),{sum:['n','val','pn','pval'],sub:'دوره‌ی قبل: '+jDay(j.prev.from)+' تا '+jDay(j.prev.to)});
I2V.bydoc=(j,T)=>T('bydoct','جمع به تفکیک پزشک',[cS('doc','پزشک',r=>r.doc||'—'),cN('surg','جراحی'),cN('pats','بیمار'),cN('fix','فیکسچر'),cN('n','کل اقلام'),cM('val','بها')],j.byDoc.sort((a,b)=>b.val-a.val),{sum:['surg','pats','fix','n','val']})+
  T('bydoc','پزشک و برند',[cS('doc','پزشک',r=>r.doc||'—'),cS('b','برند / قلم'),cN('n','تعداد'),cM('val','بها')],j.rows.sort((a,b)=>String(a.doc).localeCompare(b.doc,'fa')||b.val-a.val),{sum:['n','val']});
I2V.monthly=(j,T)=>{const A={},M={};j.rows.forEach(r=>{const k=i2Mon(r.day),x=A[k+'|'+r.grp]||(A[k+'|'+r.grp]={mon:k,grp:r.grp,n:0,val:0});x.n+=r.n;x.val+=r.val;const t=M[k]||(M[k]={mon:k,n:0,val:0});t.n+=r.n;t.val+=r.val});
  const ms=i2Months(j.from,j.to).map(m=>M[m.k]||{mon:m.k,n:0,val:0});INV2.chart={title:'روند ارزش مصرف ماهانه (تومان)',bars:ms.map(m=>({l:i2MonL(m.mon),v:m.val,n:m.n}))};
  return T('montht','جمع ماهانه',[cS('mon','ماه',r=>i2MonL(r.mon)),cN('n','تعداد'),cM('val','ارزش')],ms,{sum:['n','val']})+T('monthg','ماه و گروه',[cS('mon','ماه',r=>i2MonL(r.mon)),cS('grp','گروه',r=>I2G[r.grp]||r.grp),cN('n','تعداد'),cM('val','ارزش')],Object.values(A).sort((a,b)=>a.mon.localeCompare(b.mon)),{sum:['n','val']})};
I2V.suggest=(j,T,lb)=>T('suggest','پیشنهاد خرید',[cI(lb),cN('qty','موجودی'),cN('used','مصرف '+fa(j.n)+' روز'),cS('daily','میانگین روزانه',r=>faD(r.daily)),cS('cover','روز پوشش',r=>r.cover==null?'—':fa(r.cover)),cN('min','نقطه‌ی سفارش'),cN('target','هدف ('+fa(j.cover)+' روز)'),cN('sug','پیشنهاد سفارش'),cS('supName','آخرین تأمین‌کننده'),cM('price','بهای واحد'),cM('cost','برآورد مبلغ')],j.rows.sort((a,b)=>b.sug-a.sug),{sum:['sug','cost']});
I2V.stale=(j,T,lb)=>T('stale','اقلام راکد ('+(j.mode==='any'?'بدون حرکت':'بدون مصرف')+' در '+fa(j.n)+' روز)',[cI(lb),cN('qty','موجودی'),cM('val','ارزش راکد'),cD('lastAny','آخرین حرکت'),cD('lastUse','آخرین مصرف'),cS('days','روز بدون '+(j.mode==='any'?'حرکت':'مصرف'),r=>r.days==null?'هرگز':fa(r.days))],j.rows.sort((a,b)=>b.val-a.val),{sum:['qty','val']});
I2V.low=(j,T,lb)=>T('low','زیر حد سفارش و تمام‌شده',[cI(lb),cN('qty','موجودی'),cN('min','حداقل'),cS('st','وضعیت',r=>({neg:'کسری',out:'تمام‌شده',low:'زیر حد سفارش'}[r.st])),cD('lastIn','آخرین ورود'),cS('supName','آخرین تأمین‌کننده'),cM('price','آخرین قیمت')],j.rows.sort((a,b)=>a.qty-b.qty),{rc:r=>r.st!=='low'?'late':''});
I2V.count=(j,T,lb)=>T('cnts','جلسه‌های انبارگردانی',[cD('day'),cS('by','شمارنده'),cS('note','توضیح'),cN('n','قلم شمارش‌شده'),cN('nd','قلم با اختلاف'),cM('val','ارزش اختلاف')],j.sess,{sum:['n','nd','val']})+
  T('cntr','اختلاف هر قلم',[cD('day'),cI(lb),cN('sys','موجودی سیستم'),cN('cnt','شمارش'),cN('diff','اختلاف'),cM('val','ارزش اختلاف'),cE,cS('by','شمارنده')],j.rows.filter(r=>r.diff),{sum:['diff','val']})+
  T('cnta','اصلاح‌های دستی موجودی (خارج از انبارگردانی)',[cD('day'),cI(lb),cN('delta','تغییر'),cM('val','ارزش'),cS('by','ثبت‌کننده'),cS('note','توضیح')],j.adj,{sum:['delta','val']});
I2V.waste=(j,T,lb)=>T('waste','ضایعات و برگشت از خرید',[cD('day'),cS('type','نوع',r=>I2T[r.type]),cI(lb),cN('n','تعداد'),cM('cost','بهای واحد'),cM('val','ارزش'),cS('note','دلیل / توضیح'),cS('supName','تأمین‌کننده'),cS('inv','فاکتور'),cS('by','ثبت‌کننده')],j.rows,{sum:['n','val']})+
  T('wastet','جمع به تفکیک نوع',[cS('l','نوع'),cN('n','تعداد'),cM('val','ارزش')],i2Grp(j.rows,r=>r.type,r=>I2T[r.type],[['n'],['val']]),{sum:['n','val']});
I2V.value=(j,T)=>`<div class="banner ${j.ok?'ok':''}">${j.ok?'✓ تطبیق برقرار است: اول دوره + خرید − بهای مصرف ± اصلاحات − برگشت = پایان دوره':'⚠ اختلاف در تطبیق: '+nf(j.total.diff)}${j.total.est?' · بخشی از ارزش‌ها تخمینی است (قیمت خرید ثبت نشده؛ از «بهای اقلام انبار» حسابداری)':''}</div>`+
  T('value','ارزش انبار و بهای مصرف',[cS('grp','گروه',r=>I2G[r.grp]||r.grp),cM('open','ارزش اول دوره'),cM('buy','خرید'),cM('cogs','بهای مصرف (جراحی، خروج، ضایعات)'),cM('adj','اصلاحات ±'),cM('ret','برگشت از خرید'),cM('close','ارزش پایان دوره'),cM('diff','اختلاف تطبیق'),cE],j.rows,{sum:['open','buy','cogs','adj','ret','close','diff'],land:true});
I2V.recon=(j,T,lb)=>`<p class="note">${fa(j.checked)} مورد ثبت‌شده در جلسه‌های جراحی و ${fa(j.moves)} کسر از انبار بررسی شد؛ ${j.rows.length?fa(j.rows.length)+' مغایرت':'مغایرتی نیست'}.</p>`+
  T('recon','مغایرت جراحی و انبار',[cS('st','نوع مغایرت',r=>({miss:'در جراحی ثبت شده، از انبار کسر نشده',extra:'از انبار کسر شده، در جراحی ثبت نشده',diff:'برند / سایز متفاوت'}[r.st])),cD('day'),cPat(),cS('tooth','دندان',r=>r.tooth?toothTxt([r.tooth]):''),cS('exp','ثبت در جراحی',r=>r.exp?invLbl(r.exp):'—'),cS('got','کسر از انبار',r=>r.item?lb(r.item):'—'),cS('doc','پزشک')],j.rows,{rc:()=>'late'});
I2V.users=(j,T)=>T('users','فعالیت کاربران انبار',[cS('by','کاربر',r=>r.by||'—'),cS('type','نوع حرکت',r=>I2T[r.type]),cN('cnt','تعداد ثبت'),cN('n','تعداد اقلام'),cM('val','ارزش'),cS('last','آخرین ثبت',r=>jt(r.last))],j.rows.sort((a,b)=>String(a.by).localeCompare(b.by,'fa')),{sum:['cnt','n','val']});
I2V.daily=(j,T)=>T('daily','گردش روزانه',[cD('day'),cN('cnt','تعداد حرکت'),cN('inq','تعداد ورودی'),cN('outq','تعداد خروجی'),cM('inv','ارزش ورودی'),cM('outv','ارزش خروجی'),cM('net','خالص')],j.rows.sort((a,b)=>a.day.localeCompare(b.day)),{sum:['cnt','inq','outq','inv','outv','net']});
I2V.abc=(j,T,lb)=>T('abc','تحلیل ABC بر اساس ارزش مصرف',[cN('rank','رتبه'),cI(lb),cN('n','تعداد مصرف'),cM('val','ارزش مصرف'),cP('sh','سهم'),cP('cum','سهم تجمعی'),cS('cls','گروه')],j.rows,{sum:['n','val'],sub:'A: ۸۰٪ اول ارزش · B: ۱۵٪ بعدی · C: ۵٪ آخر'})+
  T('abcs','خلاصه‌ی گروه‌ها',[cS('l','گروه'),cN('c','تعداد قلم'),cM('val','ارزش')],i2Grp(j.rows,r=>r.cls,r=>r.cls,[['c',()=>1],['val']]).sort((a,b)=>a.l.localeCompare(b.l)),{sum:['c','val']});
I2V.fail=(j,T)=>{const g=INV2.p.fg||'b',key={b:r=>r.b,sys:r=>[r.b,r.sys].filter(Boolean).join(' '),size:r=>[r.b,r.sys].filter(Boolean).join(' ')+' '+r.d+'×'+r.l,doc:r=>r.doc,sup:r=>r.supName||'نامشخص'}[g];
  const G=i2Grp(j.rows,key,key,[['placed',()=>1],['failed',r=>r.failed],['ttfs',r=>r.ttf||0]]).map(x=>Object.assign(x,{rate:x.placed?Math.round(x.failed/x.placed*1000)/10:0,ttf:x.failed?Math.round(x.ttfs/x.failed):null}));
  return `<div class="kpis"><div class="kpi"><b>${fa(j.placed)}</b><span>ایمپلنت کاشته‌شده</span></div><div class="kpi"><b>${fa(j.failed)}</b><span>شکست</span></div><div class="kpi"><b>${i2P(j.rate)}</b><span>نرخ شکست</span></div></div>`+
  T('failg','نرخ شکست به تفکیک '+({b:'برند',sys:'سیستم',size:'قطر و طول',doc:'پزشک',sup:'تأمین‌کننده'}[g]),[cS('l','گروه',r=>r.l||'—'),cN('placed','کاشته‌شده'),cN('failed','شکست'),cP('rate','نرخ شکست'),cS('ttf','میانگین روز تا شکست',r=>r.ttf==null?'—':fa(r.ttf))],G.sort((a,b)=>b.rate-a.rate),{sum:['placed','failed']})+
  T('fail','ریز ایمپلنت‌ها',[cD('day','تاریخ جراحی'),cPat(),cS('tooth','دندان',r=>toothTxt([r.tooth])),cS('sp','ایمپلنت',r=>i2Spec(r)),cS('doc','پزشک'),cS('supName','تأمین‌کننده (آخرین رسید)'),cS('failed','نتیجه',r=>r.failed?'شکست':'سالم'),cD('fday','تاریخ شکست'),cS('ttf','روز تا شکست',r=>r.ttf==null?'':fa(r.ttf))],j.rows,{rc:r=>r.failed?'late':''})};
I2V.margin=(j,T)=>{const g=INV2.p.mg||'pat',rev=j.rev,key={pat:r=>r.ref,bg:r=>r.bg,doc:r=>r.doc,mon:r=>i2Mon(r.day)}[g],lab={pat:r=>r.name,bg:r=>I2BG[r.bg]||'—',doc:r=>r.doc||'—',mon:r=>i2MonL(i2Mon(r.day))}[g];
  const G=i2Grp(j.rows,key,lab,[['pl',()=>1],['fix'],['cost']].concat(rev?[['rev'],['margin']]:[])).map(x=>rev?Object.assign(x,{pct:x.rev?Math.round(x.margin/x.rev*1000)/10:null}):x);
  const C=[cS('l',{pat:'بیمار',bg:'برند',doc:'پزشک',mon:'ماه'}[g]),cN('pl','بیمار'),cN('fix','فیکسچر'),cM('cost','هزینه‌ی مواد')].concat(rev?[cM('rev','درآمد'),cM('margin','سود ناخالص'),cP('pct','درصد سود')]:[]);
  return (rev?'':'<p class="note">ستون‌های درآمد و سود فقط برای مدیر و حسابدار نمایش داده می‌شود.</p>')+T('margin','هزینه‌ی مواد'+(rev?' و سود':'')+' به تفکیک '+{pat:'بیمار',bg:'برند',doc:'پزشک',mon:'ماه'}[g],C,G.sort((a,b)=>b.cost-a.cost),{sum:['pl','fix','cost'].concat(rev?['rev','margin']:[])})};
I2V.fore=(j,T)=>T('fore','نیاز فیکسچر برای نوبت‌های '+fa(j.n)+' روز آینده',[cS('key','برند / سایز',r=>r.spec?i2Spec(r.spec):'فیکسچر '+(I2BG[r.g]||r.g)+' (سایز در طرح نیامده)'),cN('appts','نوبت'),cN('need','نیاز'),cN('stock','موجودی'),cN('after','بعد از مصرف'),cN('short','کسری'),cD('first','اولین نوبت'),cD('risk','اولین نوبت در خطر')],j.rows.sort((a,b)=>b.short-a.short),{sum:['need','short'],rc:r=>r.short?'late':''})+
  T('foreap','نوبت‌های جراحی',[cD('day'),cS('time','ساعت',r=>faD(r.time||'')),cPat(),cS('doc','پزشک'),cN('n','ایمپلنت لازم')],j.appts,{sum:['n']});
I2V.pva=(j,T,lb)=>{const ML={count:'تعداد',brand:'برند'};const R=j.rows.map(r=>Object.assign(r,{ml:r.mis.map(x=>x.startsWith('size:')?'سایز '+toothTxt([x.slice(5)]):ML[x]).join('، ')}));
  return T('pva','طرح در برابر مصرف واقعی',[cD('day','آخرین جلسه'),cPat(),cS('doc','پزشک'),cN('pn','تعداد در طرح'),cS('pg','برند طرح',r=>I2BG[r.pg]||'—'),cN('un','تعداد مصرف‌شده'),cS('ug','برند مصرف‌شده',r=>r.ug.map(g=>I2BG[g]||g).join('، ')||'—'),cS('ml','مغایرت',r=>r.ml||'—')],R,{rc:r=>r.mis.length?'late':''})+
  T('pvad','خلاصه به تفکیک پزشک',[cS('l','پزشک',r=>r.l||'—'),cN('s','بیمار'),cN('m','با مغایرت'),cN('pn','تعداد در طرح'),cN('un','مصرف‌شده')],i2Grp(R,r=>r.doc,r=>r.doc,[['s',()=>1],['m',r=>r.mis.length?1:0],['pn'],['un']]),{sum:['s','m','pn','un']})};
I2V.kpi=(j,T,lb)=>{const c=j.cur,p=j.prev,row=(l,k,t)=>({l,c:c[k],p:p[k],t}),R=[row('گردش موجودی (بهای مصرف ÷ میانگین ارزش)','turn','x'),row('روز موجودی در انبار','doh','x'),row('بهای مصرف','cogs','m'),row('دفعات تمام‌شدن','events','n'),row('روز-قلم تمام‌شده','soDays','n'),row('دقت شمارش (٪)','acc','x'),row('ارزش موجودی (سرمایه‌ی درگیر)','tied','m'),row('ارزش اقلام کم‌گردش','slow','m')];
  const fv=(v,t)=>v===null||v===undefined?'—':t==='m'?nf(v):t==='n'?fa(v):faD(String(v));
  return T('kpi','داشبورد شاخص‌ها',[cS('l','شاخص'),cS('c','این دوره',r=>fv(r.c,r.t)),cS('p','دوره‌ی قبل',r=>fv(r.p,r.t)),cS('d','تغییر',r=>r.c==null||r.p==null||!r.p?'—':i2P((r.c-r.p)/Math.abs(r.p)*100))],R,{sub:'دوره‌ی قبل: '+jDay(p.from)+' تا '+jDay(p.to)})+
  T('kpiso','تمام‌شدن به تفکیک قلم',[cI(lb),cN('events','دفعات'),cN('days','روز تمام‌شده')],j.rows.sort((a,b)=>b.days-a.days),{sum:['events','days']})};
I2V.age=(j,T,lb)=>T('age','سن موجودی (FIFO)',[cI(lb),cN('qty','موجودی'),cN('b1','۰ تا ۳۰ روز'),cN('b2','۳۱ تا ۹۰'),cN('b3','۹۱ تا ۱۸۰'),cN('b4','بیش از ۱۸۰'),cN('nd','بدون سند ورود'),cM('val','ارزش به بهای خرید'),cD('oldest','قدیمی‌ترین ورود باقی‌مانده')],j.rows.sort((a,b)=>b.b4+b.nd-a.b4-a.nd),{sum:['qty','b1','b2','b3','b4','nd','val']});
I2V.price=(j,T,lb)=>T('price','تغییر قیمت خرید',[cI(lb),cM('first','اولین قیمت'),cM('last','آخرین قیمت'),cP('chg','تغییر'),cM('min','کمترین'),cM('max','بیشترین'),cM('avg','میانگین'),cN('n','تعداد خرید')],j.rows.sort((a,b)=>(b.chg||0)-(a.chg||0)),{})+
  T('prices','مقایسه‌ی قیمت تأمین‌کننده‌ها',[cI(lb),cS('supName','تأمین‌کننده',r=>r.supName||'—'),cM('avg','میانگین'),cM('min','کمترین'),cM('max','بیشترین'),cM('last','آخرین'),cN('lines','دفعات'),cS('best','',r=>r.best?'ارزان‌ترین':'')],j.bySup.sort((a,b)=>lb(a.item).localeCompare(lb(b.item),'fa')||a.avg-b.avg),{});
I2V.so=(j,T,lb)=>T('so','تمام‌شدن هنگام جراحی',[cD('day'),cPat(),cI(lb),cS('note','دندان',r=>invNote(r.note).replace(/<[^>]*>/g,'')),cS('doc','پزشک'),cN('qty','موجودی بعد از مصرف')],j.rows,{rc:()=>'late'});
I2V.pers=(j,T)=>T('pers','مصرف به ازای هر جراحی',[cS('doc','پزشک',r=>r.doc||'—'),cS('grp','گروه',r=>I2G[r.grp]),cN('surg','جراحی'),cN('tot','جمع'),cS('avg','میانگین در هر جراحی',r=>faD(r.avg)),cN('min','کمترین'),cN('max','بیشترین')],j.rows,{});
I2V.bud=(j,T)=>(['inventory','manager','accountant'].includes(ROLE)?i2BudForm(j):'')+T('bud','بودجه‌ی خرید در برابر خرید واقعی',[cS('month','ماه',r=>i2MonL(r.month)),cS('grp','گروه',r=>I2G[r.grp]),cM('bud','بودجه'),cM('act','خرید واقعی'),cM('var','اختلاف'),cP('pct','درصد تحقق')],j.rows,{sum:['bud','act','var'],rc:r=>r.bud&&r.act>r.bud?'late':''});
I2V.po=(j,T)=>T('po','سفارش‌های خرید',[cN('no','شماره'),cD('day','تاریخ سفارش'),cD('due','موعد تحویل'),cS('supName','تأمین‌کننده'),cS('st','وضعیت',r=>I2PST[r.st]),cN('lines','ردیف'),cN('ord','سفارش'),cN('got','دریافت'),cN('left','مانده'),cM('val','مبلغ سفارش'),cS('late','دیرکرد',r=>r.late?fa(r.late)+' روز':'')],j.rows.sort((a,b)=>b.no-a.no),{sum:['ord','got','left','val'],rc:r=>r.late?'late':r.st==='received'?'ok':''});
I2V.po3=(j,T,lb)=>T('po3','تطبیق سه‌طرفه',[cN('no','سفارش'),cS('supName','تأمین‌کننده'),cI(lb),cN('qty','تعداد سفارش'),cM('price','قیمت سفارش'),cN('got','دریافت‌شده'),cM('ip','قیمت فاکتور'),cN('dq','اختلاف تعداد'),cM('dp','اختلاف قیمت'),cS('invs','فاکتورها'),cS('st','نتیجه',r=>r.st.map(s=>({ok:'مطابق',short:'کسری دریافت',over:'بیش از سفارش',price:'قیمت متفاوت'}[s])).join('، '))],j.rows,{rc:r=>r.st[0]==='ok'?'ok':'late'});
I2V.lead=(j,T)=>T('lead','زمان تحویل تأمین‌کننده‌ها',[cS('name','تأمین‌کننده'),cN('pos','سفارش'),cN('n','دفعات دریافت'),cS('avg','میانگین روز',r=>faD(r.avg)),cN('min','کمترین'),cN('max','بیشترین'),cN('on','به‌موقع'),cP('rate','درصد به‌موقع')],j.rows,{})+
  T('leade','ریز دریافت‌ها',[cN('no','سفارش'),cS('supName','تأمین‌کننده'),cD('day','تاریخ سفارش'),cD('due','موعد'),cD('recv','دریافت'),cN('lt','روز'),cS('on','',r=>r.on?'به‌موقع':'دیر')],j.ev,{rc:r=>r.on?'':'late'});
function i2ChartHTML(c){const mx=Math.max(1,...c.bars.map(b=>b.v));return `<section class="sys i2chart"><div class="sys-h"><b>${esc(c.title)}</b></div><div class="usage">${c.bars.map(b=>`<div class="ubar"><span>${esc(b.l)}</span><i style="width:${Math.max(2,b.v/mx*100)}%"></i><b>${nf(b.v)}</b></div>`).join('')}</div></section>`}
function i2BudForm(j){const ms=i2Months(j.from,j.to);return `<div class="i2bud"><b>ثبت بودجه</b><div class="fields"><label class="f">ماه<select id="i2bMon">${ms.map(m=>`<option value="${m.k}">${esc(m.l)}</option>`).join('')}</select></label><label class="f">گروه<select id="i2bGrp">${Object.entries(I2G).map(([k,l])=>`<option value="${k}">${esc(l)}</option>`).join('')}</select></label><label class="f">مبلغ (تومان)<input id="i2bAmt" inputmode="numeric" class="mny"></label><button type="button" class="btn sm" id="i2bSave">ذخیره‌ی بودجه</button></div></div>`}
/* ---- exports: Excel (app xlsx builder), PDF (canvas pages → app jpegPDF), print (app printHTML) ---- */
function i2Title(){return I2D[INV2.rep].t}
function i2Info(){const j=INV2.res;return ['بازه: '+i2RangeTxt(j),'فیلترها: '+i2FiltSum(),'تهیه: '+(USERNAME||ROLE_LBL[ROLE]||'')+' · '+jalali(new Date()).slash+' '+new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})]}
function i2Excel(){const S=I2TB.map(id=>ftSheet('i2'+id)).filter(Boolean);if(!S.length)return false;const inf=i2Info();S.forEach(s=>{s.sub=inf.join(' · ')});xlsx(S,i2Fn(i2Title()+' '+toEn(jalali(new Date()).dash)));return true}
function i2Print(){if(!I2TB.length)return false;printHTML(ftPrintDoc(I2TB.map(id=>'i2'+id),i2Title()));return true}
function i2Fit(c,s,w,o){s=String(s??'');if(Wd(c,s,o)<=w)return s;while(s.length>1&&Wd(c,s+'…',o)>w)s=s.slice(0,-1);return s+'…'}
async function i2PdfBuild(title,info,tabs,chart){
  try{await Promise.race([Promise.all([document.fonts.load(`400 20px Vazirmatn`),document.fonts.load(`800 20px Vazirmatn`)]),new Promise(z=>setTimeout(z,1200))])}catch(e){}
  const land=tabs.some(t=>t.cols.length>7),W=land?PH:PW,H=land?PW:PH,L=M,R=W-M,pages=[];let pg,y;const bottom=H-M-40,mc=mctx();
  const start=first=>{const cv=document.createElement('canvas');cv.width=W;cv.height=H;const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,W,H);pg={cv,cx};pages.push(pg);y=M;
    if(first){const lw=drawLogo(cx,L,y-4,80);T(cx,SET.clinic||'',R,y+18,{s:24,w:800});T(cx,title,W/2,y+62,{s:34,w:800,a:'center'});y+=96;info.forEach(l=>{T(cx,l,R,y,{s:17,c:'#333'});y+=28});box(cx,L,y,R-L,2,'#0a7680');y+=16;void lw}
    else{drawLogo(cx,L,y,34);T(cx,title+(SET.clinic?' · '+SET.clinic:''),R,y+18,{s:19,w:800});y+=50}};
  start(true);
  for(const t of tabs){const fs=15,rh=30,cols=t.cols.map((c,i)=>{const num=c.t==='m'||c.t==='n'||c.t==='p',vals=t.rows.slice(0,300).map(r=>String(ftCell(c,r)));const w=Math.max(Wd(mc,c.l,{s:fs,w:800}),...vals.map(v=>Wd(mc,v,{s:fs})));return {c,num,w:Math.min(num?220:420,w+18)}});
    const tot=cols.reduce((a,x)=>a+x.w,0),sc=(R-L)/tot;cols.forEach(x=>{x.w*=sc});
    const head=()=>{let x=R;box(pg.cx,L,y,R-L,rh+6,'#e6f1f1','#999',1);cols.forEach(cc=>{T(pg.cx,i2Fit(pg.cx,cc.c.l,cc.w-8,{s:fs,w:800}),cc.num?x-cc.w+6:x-5,y+(rh+6)/2,{s:fs,w:800,a:cc.num?'left':'right'});x-=cc.w});y+=rh+6};
    if(y+80>bottom)start(false);T(pg.cx,t.title+(t.sub?' — '+t.sub:''),R,y+14,{s:19,w:800});y+=34;head();
    const sums=t.sum&&t.sum.length?t.cols.map(c=>t.sum.includes(c.k)?t.rows.reduce((a,r)=>a+(Number(c.v?c.v(r):r[c.k])||0),0):null):null;
    const rows=t.rows.map(r=>cols.map(cc=>String(ftCell(cc.c,r))));if(sums)rows.push(cols.map((cc,i)=>i===0?'جمع':sums[i]!==null?nf(sums[i]):''));
    if(!t.rows.length)rows.unshift(cols.map((cc,i)=>i===0?'موردی نیست.':''));
    rows.forEach((cells,ri)=>{if(y+rh>bottom){start(false);head()}const last=sums&&ri===rows.length-1;if(last||ri%2)box(pg.cx,L,y,R-L,rh,last?'#eeeeee':'#f8f8f8');let x=R;
      cells.forEach((v,ci)=>{const cc=cols[ci];T(pg.cx,i2Fit(pg.cx,v,cc.w-8,{s:fs,w:last?800:400}),cc.num?x-cc.w+6:x-5,y+rh/2,{s:fs,w:last?800:400,a:cc.num?'left':'right'});x-=cc.w});pg.cx.fillStyle='#ddd';pg.cx.fillRect(L,y+rh-1,R-L,1);y+=rh});y+=24}
  if(chart&&chart.bars.length){const bh=34,h=60+chart.bars.length*bh;if(y+Math.min(h,400)>bottom)start(false);T(pg.cx,chart.title,R,y+14,{s:19,w:800});y+=40;const mx=Math.max(1,...chart.bars.map(b=>b.v)),lw=220,bw=R-L-lw-200;
    chart.bars.forEach(b=>{if(y+bh>bottom)start(false);T(pg.cx,b.l,R,y+bh/2,{s:16});const w=Math.max(2,b.v/mx*bw);box(pg.cx,R-lw-w,y+6,w,bh-12,'#0a7680');T(pg.cx,nf(b.v),R-lw-w-10,y+bh/2,{s:15,a:'right'});y+=bh})}
  pages.forEach((p,i)=>T(p.cx,`صفحه ${fa(i+1)} از ${fa(pages.length)} · ${title}`,W/2,H-M+8,{s:15,c:GREY,a:'center'}));
  const urls=pages.map(p=>p.cv.toDataURL('image/jpeg',0.82));return new Blob([jpegPDF(urls.map(u=>({jpg:dataUrlBytes(u),w:W,h:H})),land)],{type:'application/pdf'})}
async function i2Pdf(){if(!I2TB.length)return false;const tabs=I2TB.map(id=>FTD['i2'+id]).filter(Boolean).map(d=>({title:d.title,sub:'',cols:d.cols,rows:d.rows,sum:d.sum}));
  const b=await i2PdfBuild(i2Title(),i2Info(),tabs,INV2.chart);downloadBlob(b,i2Fn(i2Title()+' '+toEn(jalali(new Date()).dash))+'.pdf');return true}
/* ---- item lists for pickers (existing items + catalog sizes not yet in stock) ---- */
function i2Cands(){const C=[],seen=new Set();(INV.items||[]).forEach(i=>{const l=i2Lbl(i);if(seen.has(l))return;seen.add(l);C.push({l,item:i.id})});
  catM().forEach(c=>{(c.d||[]).forEach(d=>(catLens(c,d)||[]).forEach(l=>{const spec={kind:'fix',b:c.b,sys:c.sys||'',d,l},lb=invLbl(spec);if(!seen.has(lb)){seen.add(lb);C.push({l:lb,spec})}}));
    (c.h||[]).forEach(h=>['heal','cover'].forEach(k=>{const spec={kind:k,b:c.b,sys:c.sys||'',d:h},lb=invLbl(spec);if(!seen.has(lb)){seen.add(lb);C.push({l:lb,spec})}}))});
  return C.sort((a,b)=>a.l.localeCompare(b.l,'fa'))}
function i2Sheet(){let s=$('i2Sheet');if(!s){s=document.createElement('div');s.className='sheet';s.id='i2Sheet';s.hidden=true;s.innerHTML='<div class="in" id="i2In"></div>';document.body.appendChild(s)}return s}
function i2Close(){const s=$('i2Sheet');if(s)s.hidden=true;INV2.mode='';INV2.recv=null}
const i2SupOpts=sel=>`<option value="">— بدون تأمین‌کننده —</option>`+(INV.sups||[]).filter(s=>s.act!==0||s.id===sel).map(s=>`<option value="${esc(s.id)}"${s.id===sel?' selected':''}>${esc(s.name)}</option>`).join('');
function i2Lines(){const R=INV2.recv,cand=i2Cands();return `<datalist id="i2dlItem">${cand.map(c=>`<option value="${esc(c.l)}">`).join('')}</datalist><div class="ftsc"><table class="tbl ftbl i2lines"><thead><tr><th>قلم</th><th class="num">تعداد</th><th class="num">قیمت واحد (تومان)</th><th class="num">جمع</th><th></th></tr></thead><tbody>${R.lines.map((l,i)=>`<tr><td><input data-i2l="${i}:l" list="i2dlItem" value="${esc(l.l||'')}" placeholder="جستجوی قلم" style="min-width:220px"></td><td><input data-i2l="${i}:n" inputmode="numeric" value="${esc(l.n?faD(l.n):'')}" style="min-width:60px;width:70px"></td><td><input data-i2l="${i}:p" inputmode="numeric" class="mny" value="${l.p?fa(l.p):''}" style="min-width:110px"></td><td class="num" data-i2tot="${i}">${l.n&&l.p?fa(l.n*l.p):''}</td><td><button type="button" class="btn sm ghost" data-i2ldel="${i}" aria-label="حذف ردیف">✕</button></td></tr>`).join('')}</tbody>
  <tfoot><tr><td>جمع</td><td class="num" id="i2SumN">${fa(R.lines.reduce((a,l)=>a+(l.n||0),0))}</td><td></td><td class="num" id="i2SumV">${fa(R.lines.reduce((a,l)=>a+(l.n||0)*(l.p||0),0))}</td><td></td></tr></tfoot></table></div>
  <div class="btns" style="justify-content:flex-start"><button type="button" class="btn sm ghost" id="i2LAdd">+ ردیف</button><button type="button" class="btn sm ghost" id="i2LNew">+ قلم جدید (از کاتالوگ)</button></div>`}
function i2LineSum(){const R=INV2.recv;if(!R)return;R.lines.forEach((l,i)=>{const e=document.querySelector(`[data-i2tot="${i}"]`);if(e)e.textContent=l.n&&l.p?fa(l.n*l.p):''});const a=$('i2SumN'),b=$('i2SumV');if(a)a.textContent=fa(R.lines.reduce((x,l)=>x+(l.n||0),0));if(b)b.textContent=fa(R.lines.reduce((x,l)=>x+(l.n||0)*(l.p||0),0))}
/* receipt (multi-line invoice) and purchase order — same line editor */
function i2OpenRecv(pre){const by=(()=>{try{return localStorage.getItem('implantInvBy')||''}catch(e){return ''}})();INV2.mode=pre&&pre.mode==='po'?'po':'recv';
  INV2.recv=Object.assign({sup:'',inv:'',day:tDay(),due:'',note:'',by,po:'',lines:[{}]},pre||{});i2RecvDraw()}
function i2RecvDraw(){const R=INV2.recv,po=INV2.mode==='po',s=i2Sheet();
  $('i2In').innerHTML=`<h3>${po?'سفارش خرید جدید':R.po?'رسید خرید از سفارش شماره '+fa(R.poNo||0):'رسید خرید (ورود کالا)'}</h3>
   <div class="fields"><label class="f">تأمین‌کننده<select id="i2Sup"${R.po?' disabled':''}>${i2SupOpts(R.sup)}</select></label><div class="f" style="justify-content:flex-end"><button type="button" class="btn sm ghost" id="i2SupNew">+ تأمین‌کننده‌ی جدید</button></div></div>
   <div class="fields" id="i2SupW" hidden><label class="f">نام تأمین‌کننده<input id="i2SupName"></label><label class="f">تلفن<input id="i2SupPh" class="ltr" inputmode="tel"></label><div class="f" style="justify-content:flex-end"><button type="button" class="btn sm" id="i2SupSave">افزودن</button></div></div>
   <div class="fields">${po?'':`<label class="f">شماره فاکتور<input id="i2Inv" value="${esc(R.inv)}" maxlength="40"></label>`}<label class="f">${po?'تاریخ سفارش':'تاریخ رسید (تا ۳۰ روز قبل)'}<input id="i2Day" inputmode="numeric" value="${esc(jDay(R.day))}"></label>${po?`<label class="f">موعد تحویل<input id="i2Due" inputmode="numeric" value="${esc(R.due?jDay(R.due):'')}" placeholder="مثلاً ۱۴۰۵/۰۹/۱۰"></label>`:''}</div>
   ${i2Lines()}
   <div class="banner" id="i2Warn" hidden></div>
   <div class="fields"><label class="f">توضیح<input id="i2Note" value="${esc(R.note)}"></label><label class="f">ثبت‌کننده<input id="i2By" value="${esc(R.by)}"></label></div>
   <div class="msg" id="i2RMsg"></div>
   <div class="btns"><button class="btn" type="button" id="i2RSave" style="flex:1">${po?'ثبت سفارش':'ثبت رسید'}</button><button class="btn ghost" type="button" id="i2RClose">بستن</button></div>`;s.hidden=false}
function i2RecvRead(){const R=INV2.recv;if(!R)return;if($('i2Sup'))R.sup=$('i2Sup').value;if($('i2Inv'))R.inv=$('i2Inv').value.trim();if($('i2Note'))R.note=$('i2Note').value.trim();if($('i2By'))R.by=$('i2By').value.trim();
  if($('i2Day'))R.dayTxt=$('i2Day').value.trim();if($('i2Due'))R.dueTxt=$('i2Due').value.trim()}
async function i2RecvSave(t,again){const R=INV2.recv,m=$('i2RMsg'),po=INV2.mode==='po';i2RecvRead();const day=parseJ(R.dayTxt||'');
  if(!day){m.className='msg err';m.textContent='تاریخ را درست بنویسید (مثل ۱۴۰۵/۰۸/۰۱).';return}
  const due=po&&R.dueTxt?parseJ(R.dueTxt):'';if(po&&R.dueTxt&&!due){m.className='msg err';m.textContent='موعد تحویل را درست بنویسید.';return}
  const cand=i2Cands(),L=[];for(const [i,l] of R.lines.entries()){if(!l.l&&!l.n&&!l.p&&!l.item&&!l.spec)continue;const c=l.item||l.spec?l:cand.find(x=>x.l===l.l);
    if(!c||!(c.item||c.spec)){m.className='msg err';m.textContent=`ردیف ${fa(i+1)}: قلم را از فهرست انتخاب کنید یا «+ قلم جدید» را بزنید.`;return}
    if(!(l.n>0)){m.className='msg err';m.textContent=`ردیف ${fa(i+1)}: تعداد را وارد کنید.`;return}L.push(Object.assign(c.item?{item:c.item}:{spec:c.spec},{n:l.n,price:l.p||''}))}
  if(!L.length){m.className='msg err';m.textContent='حداقل یک ردیف وارد کنید.';return}
  if(po&&!R.sup){m.className='msg err';m.textContent='تأمین‌کننده را انتخاب کنید.';return}
  const noP=L.filter(x=>!x.price).length;if(!po&&noP&&!R.okNoPrice){R.okNoPrice=1;const w=$('i2Warn');w.hidden=false;w.textContent=`قیمت ${fa(noP)} ردیف وارد نشده؛ ارزش انبار برای این ردیف‌ها از میانگین قبلی یا تخمینی حساب می‌شود. برای ثبت بدون قیمت دوباره «ثبت رسید» را بزنید.`;return}
  try{localStorage.setItem('implantInvBy',R.by)}catch(e){}
  t.disabled=true;m.className='msg';m.textContent='در حال ثبت…';R.sid=R.sid||uuid();
  try{if(po){const j=await api('invPo',{op:'new',po:{sup:R.sup,day,due,note:R.note,lines:L},by:R.by,sendId:R.sid},{timeout:15000,tries:2});toast('سفارش خرید شماره '+fa(j.no)+' ثبت شد.');i2Close();INV2.po=null;await pollInv(true);if(INV.seg==='po')i2Render($('invBody'),true)}
    else{const j=await api('invRecv',{r:{sup:R.sup,inv:R.inv,day,note:R.note,po:R.po||'',lines:L,again:again?1:0},by:R.by,sendId:R.sid+(again?'a':'')},{timeout:15000,tries:2});toast(`رسید ثبت شد: ${fa(j.n)} ردیف، ${fa(j.total)} تومان.`);i2Close();INV2.po=null;await pollInv(true);if(INV.seg==='po')i2Render($('invBody'),true)}}
  catch(e){m.className='msg err';m.textContent=e.message;if(/قبلاً ثبت شده/.test(e.message)){m.innerHTML=esc(e.message)+' <button type="button" class="btn sm" id="i2Again">ثبت دوباره</button>'}}finally{t.disabled=false}}
/* item sheet: receipt details for «ورود», supplier for «برگشت», reason for «ضایعات» */
function i2IvX(i){const x=$('ivX');if(!x)return;const t=INV.mvType,P=!!INV.price;
  if(P&&i&&i.avg!=null){const st=$('ivState');if(st&&!st.dataset.i2)st.textContent+=' · میانگین بها '+fa(i.avg)+' تومان · ارزش '+fa(Math.round(i.avg*(Number(i.qty)||0)))}
  if(t==='in'){x.hidden=false;x.innerHTML=`<label class="f">تأمین‌کننده<select id="ivSup">${i2SupOpts('')}</select></label><label class="f">شماره فاکتور<input id="ivInv" maxlength="40"></label><label class="f">قیمت واحد (تومان)<input id="ivPrice" class="mny" inputmode="numeric"></label><label class="f">تاریخ رسید<input id="ivDay" inputmode="numeric" value="${esc(jDay(tDay()))}"></label>`}
  else if(t==='ret'){x.hidden=false;x.innerHTML=`<label class="f">تأمین‌کننده<select id="ivSup">${i2SupOpts('')}</select></label><label class="f">شماره فاکتور برگشت<input id="ivInv" maxlength="40"></label>`}
  else{x.hidden=true;x.innerHTML=''}
  const nl=$('ivNLbl');if(nl&&t==='ret')nl.textContent='تعداد برگشتی';if(nl&&t==='waste')nl.textContent='تعداد ضایعات';const no=$('ivNote');if(no)no.placeholder=t==='waste'?'دلیل ضایعات (الزامی): شکسته، آلوده، تاریخ گذشته…':'توضیح'}
function i2IvRead(){const o={},g=id=>$(id)?$(id).value.trim():'';if(INV.mvType==='in'||INV.mvType==='ret'){o.sup=g('ivSup');o.inv=g('ivInv')}
  if(INV.mvType==='in'){o.price=g('ivPrice')?mnum(g('ivPrice')):'';const d=g('ivDay');o.day=d?(parseJ(d)||'bad'):''}return o}
/* stock count session */
function i2CntRows(){const q=toEn(INV2.cntQ||'').toLowerCase(),k=INV2.cntK;return (INV.items||[]).filter(i=>(!k||(k==='hc'?i.kind==='heal'||i.kind==='cover':i.kind===k))&&(!q||toEn(i2Lbl(i)).toLowerCase().includes(q))).sort((a,b)=>i2Lbl(a).localeCompare(i2Lbl(b),'fa'))}
function i2CntView(B){if(!i2Write()){B.innerHTML='<div class="empty">انبارگردانی فقط با ورود انباردار ممکن است.</div>';return}
  const R=i2CntRows();B.innerHTML=`<section class="sys i2cnt" data-i2view="cnt"><div class="sys-h"><b>انبارگردانی</b><span class="tot" id="i2CntN"></span></div>
   <p class="note">تعداد شمارش‌شده‌ی هر قلم را بنویسید؛ قلم‌های خالی شمارش نمی‌شوند. اختلاف‌ها با «اصلاح / شمارش» و شماره‌ی این انبارگردانی ثبت می‌شود.</p>
   <div class="invtools"><div class="search"><input id="i2CntQ" placeholder="جستجوی قلم" value="${esc(INV2.cntQ||'')}"></div><span class="chips">${[['','همه'],['fix','فیکسچر'],['hc','هیلینگ و کاور'],['other','مواد']].map(([k,l])=>`<button type="button" class="chip" data-i2ck="${k}" aria-pressed="${INV2.cntK===k}">${l}</button>`).join('')}</span></div>
   <div class="ftsc"><table class="tbl ftbl"><thead><tr><th>قلم</th><th class="num">موجودی سیستم</th><th class="num">شمارش</th><th class="num">اختلاف</th></tr></thead><tbody>${R.map(i=>`<tr><td>${esc(i2Lbl(i))}</td><td class="num">${fa(Number(i.qty)||0)}</td><td><input data-i2c="${esc(i.id)}" inputmode="numeric" value="${INV2.cnt[i.id]!==undefined?faD(INV2.cnt[i.id]):''}" style="width:80px;min-width:60px"></td><td class="num" data-i2cd="${esc(i.id)}"></td></tr>`).join('')||'<tr><td colspan="4" class="empty">قلمی نیست.</td></tr>'}</tbody></table></div>
   <div class="fields"><label class="f">توضیح<input id="i2CntNote" placeholder="مثلاً: انبارگردانی پایان ماه"></label><label class="f">شمارنده<input id="i2CntBy" value="${esc((()=>{try{return localStorage.getItem('implantInvBy')||''}catch(e){return ''}})())}"></label></div>
   <div class="msg" id="i2CntMsg"></div><div class="btns"><button class="btn" type="button" id="i2CntSave" style="flex:1">ثبت انبارگردانی</button><button class="btn ghost" type="button" id="i2CntClr">پاک کردن شمارش‌ها</button></div></section>`;i2CntDiff()}
function i2CntDiff(){let n=0,d=0;Object.keys(INV2.cnt).forEach(id=>{const i=(INV.items||[]).find(x=>x.id===id);if(!i)return;n++;const df=INV2.cnt[id]-(Number(i.qty)||0);if(df)d++;const e=document.querySelector(`[data-i2cd="${CSS.escape(id)}"]`);if(e){e.textContent=df?(df>0?'+':'−')+fa(Math.abs(df)):'✓';e.className='num '+(df?'i2bad':'i2ok')}});
  const e=$('i2CntN');if(e)e.textContent=fa(n)+' قلم شمارش شده'+(d?' · '+fa(d)+' اختلاف':'');const b=$('i2CntSave');if(b)b.textContent=n?`ثبت انبارگردانی (${fa(n)} قلم)`:'ثبت انبارگردانی'}
async function i2CntSave(t){const m=$('i2CntMsg'),L=Object.keys(INV2.cnt).map(id=>({item:id,n:INV2.cnt[id]}));if(!L.length){m.className='msg err';m.textContent='هیچ قلمی شمارش نشده است.';return}
  const by=$('i2CntBy').value.trim();try{if(by)localStorage.setItem('implantInvBy',by)}catch(e){}t.disabled=true;m.className='msg';m.textContent='در حال ثبت…';
  try{const j=await api('invCount',{c:{note:$('i2CntNote').value.trim(),lines:L},by,sendId:INV2.cntSid||(INV2.cntSid=uuid())},{timeout:20000,tries:2});INV2.cnt={};INV2.cntSid='';toast(`انبارگردانی ثبت شد: ${fa(j.n)} قلم، ${fa(j.diff)} اختلاف.`);await pollInv(true);i2Render($('invBody'),true)}
  catch(e){m.className='msg err';m.textContent=e.message}finally{t.disabled=false}}
/* purchase orders */
async function i2PoView(B){B.innerHTML=`<section class="sys" data-i2view="po"><div class="sys-h"><b>سفارش‌های خرید</b>${i2Write()?'<button type="button" class="btn sm" id="i2PoNew">+ سفارش خرید جدید</button>':''}</div><div id="i2PoL"><div class="empty">در حال بارگذاری…</div></div></section>`;
  try{const j=INV2.po||(INV2.po=await api('invPo',{op:'list'}));const td=tDay(),L=j.items||[];
    $('i2PoL').innerHTML=L.length?`<div class="ftsc"><table class="tbl ftbl"><thead><tr><th class="num">شماره</th><th>تاریخ</th><th>موعد</th><th>تأمین‌کننده</th><th>وضعیت</th><th></th></tr></thead><tbody>${L.map(p=>{const late=(p.st==='open'||p.st==='partial')&&p.due&&p.due<td;
      return `<tr class="${late?'late':p.st==='received'?'ok':''}"><td class="num">${fa(p.no)}</td><td>${esc(jDay(p.day))}</td><td>${esc(p.due?jDay(p.due):'—')}${late?' (دیرکرد)':''}</td><td>${esc(i2SupN(p.sup))}</td><td>${esc(I2PST[p.st]||p.st)}</td><td class="acts"><button type="button" class="btn sm ghost" data-i2po="v:${esc(p.id)}">جزئیات / چاپ</button>${i2Write()&&(p.st==='open'||p.st==='partial')?`<button type="button" class="btn sm" data-i2po="r:${esc(p.id)}">دریافت کالا</button><button type="button" class="btn sm ghost" data-i2po="c:${esc(p.id)}">لغو</button>`:''}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">سفارش خریدی ثبت نشده.</div>'}
  catch(e){$('i2PoL').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
function i2PoDoc(j){const p=j.po,sup=(INV.sups||[]).find(s=>s.id===p.sup)||{},L=j.lines,it=id=>(INV.items||[]).find(i=>i.id===id);
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>سفارش خرید ${esc(p.no)}</title><style>@page{size:A4;margin:14mm}body{font-family:Vazirmatn,Tahoma,sans-serif;color:#111;font-size:12px}.hd{display:flex;justify-content:space-between;border-bottom:2px solid #0a7680;padding-bottom:6px;margin-bottom:10px}h1{font-size:18px;margin:0;color:#0a7680}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #bbb;padding:5px 7px;text-align:right}th{background:#e6f1f1}td.n{text-align:left}.sg{display:flex;justify-content:space-around;margin-top:40px}.sg div{border-top:1px solid #999;padding-top:4px;min-width:150px;text-align:center}</style></head><body>
   <div class="hd"><div><h1>سفارش خرید شماره ${fa(p.no)}</h1><div>${esc(SET.clinic||'')}</div></div><div>تاریخ سفارش: ${esc(jDay(p.day))}<br>موعد تحویل: ${esc(p.due?jDay(p.due):'—')}</div></div>
   <div>تأمین‌کننده: <b>${esc(sup.name||'')}</b>${sup.phone?' · تلفن: '+esc(faD(sup.phone)):''}</div>${p.note?`<div>توضیح: ${esc(p.note)}</div>`:''}
   <table><thead><tr><th>ردیف</th><th>شرح کالا</th><th>تعداد</th><th>قیمت واحد (تومان)</th><th>جمع (تومان)</th></tr></thead><tbody>${L.map((l,i)=>`<tr><td class="n">${fa(i+1)}</td><td>${esc(i2Lbl(it(l.item)))}</td><td class="n">${fa(l.qty)}</td><td class="n">${l.price?fa(l.price):'—'}</td><td class="n">${l.price?fa(l.price*l.qty):'—'}</td></tr>`).join('')}</tbody>
   <tfoot><tr><td></td><td><b>جمع</b></td><td class="n"><b>${fa(L.reduce((a,l)=>a+l.qty,0))}</b></td><td></td><td class="n"><b>${fa(L.reduce((a,l)=>a+l.qty*(l.price||0),0))}</b></td></tr></tfoot></table>
   <div class="sg"><div>سفارش‌دهنده: ${esc(p.by||'')}</div><div>تأیید مدیر</div><div>تأمین‌کننده</div></div></body></html>`}
async function i2PoShow(id){const j=await api('invPo',{op:'get',id}),p=j.po,it=x=>(INV.items||[]).find(i=>i.id===x),s=i2Sheet();INV2.mode='pov';INV2.poCur=j;
  $('i2In').innerHTML=`<h3>سفارش خرید شماره ${fa(p.no)} · ${esc(I2PST[p.st]||p.st)}</h3><p class="note">${esc(i2SupN(p.sup))} · تاریخ ${esc(jDay(p.day))}${p.due?' · موعد '+esc(jDay(p.due)):''}${p.note?' · '+esc(p.note):''}</p>
   <div class="ftsc"><table class="tbl ftbl"><thead><tr><th>قلم</th><th class="num">سفارش</th><th class="num">دریافت‌شده</th><th class="num">قیمت</th></tr></thead><tbody>${j.lines.map(l=>`<tr><td>${esc(i2Lbl(it(l.item)))}</td><td class="num">${fa(l.qty)}</td><td class="num">${fa(l.got)}</td><td class="num">${l.price?fa(l.price):'—'}</td></tr>`).join('')}</tbody></table></div>
   <div class="btns"><button class="btn" type="button" id="i2PoPrint">🖨 چاپ</button><button class="btn ghost" type="button" id="i2PoPdf">📄 PDF</button><button class="btn ghost" type="button" id="i2RClose">بستن</button></div>`;s.hidden=false}
async function i2PoPdf(){const j=INV2.poCur;if(!j)return;const p=j.po,it=x=>(INV.items||[]).find(i=>i.id===x),sup=(INV.sups||[]).find(s=>s.id===p.sup)||{};
  const tab={title:'اقلام سفارش',cols:[{k:'i',l:'ردیف',t:'n'},{k:'l',l:'شرح کالا'},{k:'qty',l:'تعداد',t:'n'},{k:'price',l:'قیمت واحد',t:'m'},{k:'tot',l:'جمع',t:'m'}],rows:j.lines.map((l,i)=>({i:i+1,l:i2Lbl(it(l.item)),qty:l.qty,price:l.price||0,tot:(l.price||0)*l.qty})),sum:['qty','tot']};
  const b=await i2PdfBuild('سفارش خرید شماره '+fa(p.no),['تأمین‌کننده: '+(sup.name||'')+(sup.phone?' · '+faD(sup.phone):''),'تاریخ سفارش: '+jDay(p.day)+(p.due?' · موعد تحویل: '+jDay(p.due):''),'سفارش‌دهنده: '+(p.by||USERNAME||'')],[tab]);downloadBlob(b,i2Fn('سفارش خرید '+p.no)+'.pdf')}
/* ---- events ---- */
document.addEventListener('click',e=>{if(!INV2.pick)return;const t=e.target.closest&&e.target.closest('#inSave,#inClose');if(!t)return;e.stopImmediatePropagation();e.preventDefault();
  if(t.id==='inClose'){INV2.pick=false;$('invMvSheet').hidden=true;$('inSave').textContent='ثبت ورود';return}
  const m=$('inMsg'),k=INV.kind,c=catM()[$('in_cat').value],pv=(S,I)=>S.hidden?toEn(I.value).trim():S.value;
  const spec={kind:k,b:c?c.b:$('in_b').value.trim(),sys:c?c.sys:$('in_sys').value.trim(),d:k==='fix'?pv($('in_dS'),$('in_d')):pv($('in_hS'),$('in_hs')),l:pv($('in_lS'),$('in_l')),name:$('in_name').value.trim(),unit:$('in_unit').value.trim()};
  const err=k==='other'?(!spec.name&&'نام قلم را بنویسید.'):(!spec.b?'برند را انتخاب کنید.':k==='fix'&&(!spec.d||!spec.l)?'قطر و طول فیکسچر را انتخاب کنید.':k!=='fix'&&!spec.d?'سایز را وارد کنید.':'');
  if(err){m.className='msg err';m.textContent=err;return}const n=parseInt(toEn($('in_n').value),10)||1;
  const R=INV2.recv;if(R){i2RecvRead();const ex=R.lines.findIndex(l=>!l.l&&!l.item&&!l.spec);const ln={l:invLbl(spec),spec,n};if(ex>=0)R.lines[ex]=ln;else R.lines.push(ln);}
  INV2.pick=false;$('invMvSheet').hidden=true;$('inSave').textContent='ثبت ورود';$('i2Sheet').hidden=false;i2RecvDraw()},true);
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.dataset.i2rep){i2SetRep(t.dataset.i2rep);return}
  if(t.dataset.i2pre){const k=t.dataset.i2pre;INV2.pk=k;if(k!=='c'){i2FiltRead();INV2.per=Object.assign(INV2.per||{},i2Range(k));i2Render($('invBody'),true);i2Run()}else{document.querySelectorAll('[data-i2pre]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.i2pre==='c'));const f=$('i2From')||$('i2To');if(f)f.focus()}return}
  if(t.id==='i2Go'){i2Run();return}
  if(t.dataset.i2x){if(!INV2.res||INV2.res.kind!==INV2.rep){toast('اول «نمایش گزارش» را بزنید.',1);return}const k=t.dataset.i2x;t.disabled=true;try{if(k==='x')i2Excel();else if(k==='p')i2Print();else await i2Pdf()}catch(err){toast('خروجی ساخته نشد: '+err.message,1)}finally{t.disabled=false}return}
  if(t.id==='i2bSave'){const a=mnum($('i2bAmt').value);t.disabled=true;try{await api('invBudget',{rows:[{month:$('i2bMon').value,grp:$('i2bGrp').value,amount:a}]});toast('بودجه ذخیره شد.');i2Run()}catch(err){toast(err.message,1)}finally{t.disabled=false}return}
  if(t.id==='i2LAdd'){i2RecvRead();INV2.recv.lines.push({});i2RecvDraw();return}
  if(t.dataset.i2ldel!==undefined){i2RecvRead();INV2.recv.lines.splice(+t.dataset.i2ldel,1);if(!INV2.recv.lines.length)INV2.recv.lines.push({});i2RecvDraw();return}
  if(t.id==='i2LNew'){i2RecvRead();INV2.pick=true;$('i2Sheet').hidden=true;openInvNew();$('inSave').textContent='افزودن به '+(INV2.mode==='po'?'سفارش':'رسید');return}
  if(t.id==='i2SupNew'){$('i2SupW').hidden=!$('i2SupW').hidden;if(!$('i2SupW').hidden)$('i2SupName').focus();return}
  if(t.id==='i2SupSave'){const name=$('i2SupName').value.trim(),m=$('i2RMsg');if(!name){m.className='msg err';m.textContent='نام تأمین‌کننده را بنویسید.';return}t.disabled=true;
    try{const j=await api('invSup',{s:{name,phone:$('i2SupPh').value.trim()}});await pollInv(true);i2RecvRead();INV2.recv.sup=j.id;i2RecvDraw();toast('تأمین‌کننده اضافه شد.')}catch(err){m.className='msg err';m.textContent=err.message}finally{t.disabled=false}return}
  if(t.id==='i2RSave'){i2RecvSave(t,false);return}if(t.id==='i2Again'){i2RecvSave($('i2RSave'),true);return}if(t.id==='i2RClose'){i2Close();return}
  if(t.dataset.i2ck!==undefined){INV2.cntK=t.dataset.i2ck;i2Render($('invBody'),true);return}
  if(t.id==='i2CntSave'){i2CntSave(t);return}if(t.id==='i2CntClr'){INV2.cnt={};i2Render($('invBody'),true);return}
  if(t.id==='i2PoNew'){i2OpenRecv({mode:'po'});return}
  if(t.id==='i2PoPrint'){if(INV2.poCur)printHTML(i2PoDoc(INV2.poCur));return}if(t.id==='i2PoPdf'){t.disabled=true;try{await i2PoPdf()}finally{t.disabled=false}return}
  if(t.dataset.i2po){const [k,id]=t.dataset.i2po.split(':');
    if(k==='v'){try{await i2PoShow(id)}catch(err){toast(err.message,1)}return}
    if(k==='c'){if(!t.dataset.armed){t.dataset.armed='1';t.textContent='لغو؟ دوباره بزنید';setTimeout(()=>{delete t.dataset.armed;t.textContent='لغو'},4000);return}try{await api('invPo',{op:'cancel',id});toast('سفارش لغو شد.');INV2.po=null;i2Render($('invBody'),true)}catch(err){toast(err.message,1)}return}
    if(k==='r'){try{const j=await api('invPo',{op:'get',id}),it=x=>(INV.items||[]).find(i=>i.id===x);const lines=j.lines.filter(l=>l.qty>l.got).map(l=>({l:i2Lbl(it(l.item)),item:l.item,n:l.qty-l.got,p:l.price||0}));
      i2OpenRecv({po:j.po.id,poNo:j.po.no,sup:j.po.sup,lines:lines.length?lines:[{}]})}catch(err){toast(err.message,1)}return}}});
document.addEventListener('input',e=>{const t=e.target;
  if(t.dataset&&t.dataset.i2l){const [i,k]=t.dataset.i2l.split(':'),l=INV2.recv&&INV2.recv.lines[+i];if(!l)return;if(k==='l'){l.l=t.value;delete l.item;delete l.spec}else if(k==='n')l.n=num(t.value);else{l.p=mnum(t.value);t.value=l.p?fa(l.p):''}i2LineSum();return}
  if(t.dataset&&t.dataset.i2c){const v=toEn(t.value).trim();if(v==='')delete INV2.cnt[t.dataset.i2c];else{const n=parseInt(v.replace(/[^\d]/g,''),10);if(isFinite(n))INV2.cnt[t.dataset.i2c]=n}i2CntDiff();return}
  if(t.id==='i2CntQ'){INV2.cntQ=t.value;const pos=t.selectionStart;i2Render($('invBody'),true);const q=$('i2CntQ');if(q){q.focus();try{q.setSelectionRange(pos,pos)}catch(err){}}return}
  if(t.id==='i2bAmt'||t.id==='ivPrice'){const n=mnum(t.value);t.value=n?fa(n):''}
  if(t.id==='i2From'||t.id==='i2To'){INV2.pk='c';document.querySelectorAll('[data-i2pre]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.i2pre==='c'))}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.closest&&e.target.closest('.i2bar')){e.preventDefault();i2Run()}});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='i2Sel')i2SetRep(e.target.value)});

