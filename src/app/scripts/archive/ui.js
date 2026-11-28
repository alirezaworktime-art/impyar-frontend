/* ---------- ui: مربع‌های بزرگ + فهرست «همین الان» برای همه‌ی نقش‌ها ---------- */
let TILE='';
const TSAVE=(()=>{try{return JSON.parse(localStorage.getItem('implantTile')||'{}')}catch(e){return {}}})();
const tOpen=(ks,h)=>TASKS.filter(t=>!t.done&&ks.includes(t.kind)&&dDiff(t.due,tDay())<=h).length;
const apToday=f=>QAPPT.filter(a=>a.st==='set'&&a.day===tDay()&&f(a.kind)).length;
const SG_K=['surg','tooth','soft'],CK_K=['chks','postop','suture','chkp','check'];
const sdItems=()=>QITEMS.filter(x=>x.sg&&x.sg.lastDay&&!x.sg.dis);/* m45b: no 60-day limit */
const TILES={
  staff:()=>[
    {k:'plan',c:'plan',l:'طرح درمان امروز',s:'ارجاع به پزشک طرح درمان',n:QITEMS.filter(x=>['waiting','reviewing','consult','consulting'].includes(x.queue)).length+QINT.filter(x=>x.st==='filled').length,view:'recep'},
    {k:'fol',c:'cons',l:'پیگیری‌ها',s:'تماس با بیماران',n:tOpen(['fol1','fol4','fol3','numb','week','pweek','collect','paylost','payok','afup'],0)+TASKS.filter(t=>!t.done&&t.kind==='book'&&t.info!=='cont'&&dDiff(tDay(),t.due)>30).length,view:'recep'},
    {k:'surg',c:'surg',l:'نوبت‌دهی',s:'نوبت‌های امروز و صف نوبت‌دهی',n:apToday(k=>SG_K.includes(k))+TASKS.filter(t=>!t.done&&t.kind==='book'&&(t.info==='cont'||dDiff(tDay(),t.due)<=30)).length,view:'recep'},
    {k:'sdone',c:'surg',l:'جراحی‌شده‌ی امروز',s:'دارو، مراقبت، تسویه، ترخیص',n:sdItems().length+QSET.length,view:'recep'},
    {k:'chk',c:'chk',l:'چکاپ و بخیه',s:'چکاپ جراحی و پروتز',n:apToday(k=>CK_K.includes(k)||(!AGRP.sg.includes(k)&&!AGRP.pr.includes(k)&&!AGRP.cs.includes(k)&&!AGRP.cp.includes(k)))+tOpen(['suture'],1)+tOpenR('chk',1),view:'recep'},
    {k:'unc',c:'chk',l:'انکاوری',s:'۳ تا ۴ ماه بعد از جراحی',n:apToday(k=>k==='uncover')+tOpen(['uncover','recall','aexam'],0)+tOpenR('unc',0),view:'recep'},
    {k:'pros',c:'pros',l:'نوبت پروتز',s:'قالب‌گیری، تست، تحویل',n:apToday(k=>AGRP.pr.includes(k))+tOpen(['labready','impr','pcall','pfail','repair'],1)+tOpenR('pros',1)+QPIDLE.length+QLAB.length,view:'recep'},
    {k:'wb',c:'arch',l:'بازگشت بیماران',s:'انصرافی‌ها، راکدها، چکاپ عقب‌افتاده',n:(typeof WB!=='undefined'&&WB.items?WB.items.length:0),tab:'tabWb'},
    {k:'arch',c:'arch',l:'بایگانی',s:'همه‌ی بیماران',n:0,tab:'tabList'}],
  doctor:()=>[
    {k:'plan',c:'plan',l:'طرح درمان امروز',s:'بیماران ارجاع‌شده از پذیرش',n:QITEMS.filter(x=>x.queue==='waiting'||x.queue==='reviewing').length,tab:'tabQueue'},
    {k:'new',c:'plan',l:'طرح درمان جدید',s:'بدون پذیرش قبلی',n:0,tab:'tabNew',act:1},
    {k:'rx',c:'chk',l:'نسخه و دستورات',s:'قالب‌های بعد از جراحی',n:0,tab:'tabRx'},
    {k:'arch',c:'arch',l:'بایگانی',s:'همه‌ی طرح‌ها',n:0,tab:'tabList'}],
  consultant:()=>[
    {k:'cons',c:'cons',l:'مشاوره',s:'بیماران منتظر مشاور',n:QITEMS.filter(x=>x.queue==='consult'||x.queue==='consulting'||x.settle==='pending').length,tab:'tabQueue'},
    {k:'set',c:'set',l:'تنظیمات',s:'تعرفه‌ها و پزشکان',n:0,tab:'tabSet',act:1},
    {k:'arch',c:'arch',l:'بایگانی',s:'همه‌ی بیماران',n:0,tab:'tabList'}],
  surgery:()=>[
    {k:'surg',c:'surg',l:'جراحی',s:'بیماران ارجاع‌شده برای جراحی',n:QITEMS.filter(x=>x.queue==='surgery').length,tab:'tabQueue'},
    {k:'chk',c:'chk',l:'ویزیت و کشیدن بخیه',s:'نوبت‌های امروز',n:apToday(k=>CK_K.includes(k)),tab:'tabQueue'},
    {k:'unc',c:'chk',l:'انکاوری',s:'نوبت‌های امروز',n:apToday(k=>k==='uncover'),tab:'tabQueue'},
    {k:'pros',c:'pros',l:'پروتز',s:'نوبت‌های امروز و مراحل',n:apToday(k=>AGRP.pr.includes(k)),tab:'tabPday'},
    {k:'cal',c:'chk',l:'تقویم',s:'نوبت‌های این هفته',n:0,tab:'tabCal'},
    {k:'arch',c:'arch',l:'بایگانی',s:'بیماران جراحی‌شده',n:0,tab:'tabList'}],
  lab:()=>[
    {k:'new',c:'lab',l:'سفارش جدید',s:'دستور کار تازه',n:LB.items.filter(x=>x.st==='new'||x.st==='redo').length,seg:'new'},
    {k:'work',c:'pros',l:'در حال ساخت',s:'دریافت‌شده',n:LB.items.filter(x=>x.st==='recv'||x.st==='making').length,seg:'work'},
    {k:'ready',c:'cons',l:'ارسال‌شده',s:'آماده و فرستاده‌شده',n:LB.items.filter(x=>x.st==='ready').length,seg:'ready'},
    {k:'done',c:'arch',l:'تحویل‌شده',s:'بسته‌شده',n:0,seg:'done'}],
  inventory:()=>[
    {k:'fix',c:'surg',l:'فیکسچرها',s:'ایمپلنت‌ها',n:0,iseg:'fix'},
    {k:'acc',c:'pros',l:'هیلینگ، کاور و مواد',s:'مصرفی',n:0,iseg:'acc'},
    {k:'log',c:'arch',l:'گردش انبار',s:'ورود و خروج',n:0,iseg:'log'},
    {k:'cnt',c:'chk',l:'انبارگردانی',s:'شمارش و اختلاف',n:0,iseg:'cnt'},
    {k:'po',c:'fin',l:'سفارش خرید',s:'سفارش، دریافت، تطبیق',n:0,iseg:'po'},
    {k:'rep',c:'plan',l:'گزارش‌ها',s:'موجودی، خرید، مصرف',n:0,iseg:'rep'},
    {k:'ifin',c:'fin',l:'خرید و بها',s:'تأمین‌کنندگان، بهای مصرف و اقلام',n:0,iseg:'ifin'},{k:'icat',c:'plan',l:'تطبیق با فهرست جراحی',s:'اقلام خارج از فهرست ایمپلنت‌ها',n:0,iseg:'icat'}],
  accountant:()=>[
    {k:'xl',c:'fin',l:'دفتر اکسل',s:'فرم ثبت، محاسبات، تعرفه‌ها، گزارش‌ها',n:0,fsec:'xform'},
    {k:'chq',c:'fin',l:'چک‌های سررسید',s:'تا یک هفته‌ی آینده',n:0,fsec:'rcv'},
    {k:'fin',c:'fin',l:'حسابداری کامل',s:'اسناد، دفاتر، گزارش‌ها',n:0,fsec:'dash'},
    {k:'inv',c:'set',l:'انبار و گزارش‌ها',s:'ارزش انبار، خرید، مصرف',n:0,iseg:'rep'},
    {k:'arch',c:'arch',l:'بایگانی',s:'همه‌ی بیماران',n:0,tab:'tabList'}],
  manager:()=>[
    {k:'dash',c:'plan',l:'داشبورد',s:'عملکرد کلینیک',n:0,tab:'tabDash'},
    {k:'mrep',c:'plan',l:'گزارش‌های مدیریتی',s:'بیمار، مالی، درمان، نوبت',n:0,tab:'tabDash'},
    {k:'fin',c:'fin',l:'حسابداری کامل',s:'اسناد و گزارش‌ها',n:0,tab:'tabFin'},
    {k:'acc',c:'fin',l:'صندوق و هزینه',s:'حسابداری ساده',n:0,tab:'tabAcc'},
    {k:'inv',c:'set',l:'انبار و گزارش‌ها',s:'موجودی، خرید، مصرف',n:0,iseg:'rep'},
    {k:'users',c:'set',l:'کاربران و حضور',s:'حساب‌ها و سابقه',n:0,tab:'tabUsers'},
    {k:'cal',c:'chk',l:'تقویم',s:'نوبت‌ها',n:0,tab:'tabCal'},
    {k:'pros',c:'pros',l:'پروتز و لابراتوار',s:'تابلوی مراحل',n:0,tab:'tabPros'},
    {k:'set',c:'set',l:'تنظیمات',s:'تعرفه‌ها، پزشکان، رضایت‌نامه',n:0,tab:'tabSet',act:1},
    {k:'arch',c:'arch',l:'بایگانی',s:'همه‌ی بیماران (فقط‌خواندنی)',n:0,tab:'tabList'}]
};
const TILE_HD={staff:{plan:'بیماران امروز برای طرح درمان',fol:'پیگیری‌ها و تماس‌ها',surg:'نوبت جراحی',sdone:'جراحی‌شده‌ی امروز',chk:'چکاپ و بخیه',unc:'انکاوری',pros:'نوبت پروتز'},
  consultant:{cons:'بیماران منتظر مشاور',chq:'چک‌های سررسید (تا یک هفته‌ی آینده)',und:'بیماران مردد (طرح تأییدنشده)'},
  surgery:{surg:'جراحی امروز',chk:'ویزیت و کشیدن بخیه — امروز',unc:'انکاوری — امروز'},doctor:{plan:'بیماران امروز برای طرح درمان'}};
/* tileList — layers: archive/ui base + surgery/queue (the home tile first for the MQ_HOME roles) */
function tileList(){const f=TILES[ROLE],L=f?f():[];if(!MQ_HOME[ROLE])return L;const n=ROLE==='manager'?0:mqItems().length;return [{k:'q',c:'q',l:ROLE==='manager'?'تابلو':'صف من',s:'',n,tab:'tabQueue',view:ROLE==='staff'?'recep':undefined}].concat(L)}
/* renderTiles — layers: reception/patch-ux (the icon tiles; replaced the first archive/ui version) + reception/patch-walk (renderPi)
   + ui/ux5 (uxTileSync) + ui/ttl1 (app-bar title; signed out: only clean the sign-in page). TCOUNT and tIco live in reception/patch-ux. */
function renderTiles(){if(!ROLE){ttlLoginClean();return}
  let el=$('tiles');if(!el){el=document.createElement('div');el.id='tiles';el.className='hts';const w=document.querySelector('.wrap');if(w)w.insertBefore(el,w.firstChild);else el=null}
  if(el){const L=tileList(),C=TCOUNT[ROLE]||[];el.dataset.n=L.length;el.hidden=!ROLE||!L.length||TILE_HIDE;
  el.innerHTML=L.map(t=>{const counted=C.includes(t.k),zero=counted&&!t.n;
    return `<button type="button" class="htile x tc-${t.c}${zero?' zero':''}${t.k==='q'?' hq':''}" data-tile="${t.k}" aria-current="${TILE===t.k}" title="${esc(t.s||'')}"><span class="hi">${tIco(t.k)}</span><span class="hn">${t.n?fa(t.n):counted?'—':''}</span><span class="hl">${esc(t.l)}</span><span class="hs">${esc(t.s||'')}</span></button>`}).join('');
  tileHead()}
  try{renderPi()}catch(e){}
  try{uxTileSync()}catch(e){}
  ttlSet()}
let TILE_HIDE=false;
/* tileHead — layers: archive/ui base + appointments/appt1 (staff: the big booking buttons) + archive/fx2 (staff: list / week / month switch) */
function tileHead(){const L=tileList(),t=L.find(x=>x.k===TILE);document.querySelectorAll('.tilehd').forEach(h=>h.remove());
  const H=t&&(TILE_HD[ROLE]||{})[TILE],host=H&&(ROLE==='staff'?$('rAll'):$('viewQueue'));
  if(host){const acts={staff:{surg:'<button class="btn sm" type="button" data-rfab="book">+ اخذ نوبت جراحی</button>',chk:'<button class="btn sm" type="button" data-tnew="chks">+ نوبت چکاپ</button>',unc:'<button class="btn sm" type="button" data-tnew="uncover">+ نوبت انکاوری</button>',pros:'<button class="btn sm" type="button" data-tnew="impr">+ نوبت پروتز</button>'}}[ROLE]||{};
  const h=document.createElement('div');h.className='tilehd tc-'+t.c;h.innerHTML=`<h2><i></i>${esc(H)}${t.n?` <span class="tnow">(${fa(t.n)} مورد)</span>`:''}</h2><div class="acts">${acts[TILE]||''}</div>`;host.insertBefore(h,host.firstChild)}
  if(ROLE==='staff'){const h=document.querySelector('.tilehd');if(h){
  if(TILE==='surg'){const a=h.querySelector('.acts');if(a)a.innerHTML='<button class="btn main bkbig" type="button" data-rfab="book">📅 نوبت‌دهی</button>'}
  if(TILE==='bkd'){const a=h.querySelector('.acts');if(a)a.innerHTML='<button class="btn sm" type="button" data-rfab="book">📅 نوبت‌دهی</button><button class="btn sm ghost" type="button" data-bkdre="1">به‌روزرسانی</button>'}}}
  try{fx2Head()}catch(e){console.error('fx2',e)}}
function goTile(k,opt={}){const L=tileList(),t=L.find(x=>x.k===k)||L[0];if(!t)return;if(t.act){const b=$(t.tab);if(b)b.click();return}if(dirty&&!$('viewForm').hidden&&t.tab){$(t.tab).click();if(dirty&&!$('viewForm').hidden)return}TILE=t.k;TSAVE[ROLE]=TILE;try{localStorage.setItem('implantTile',JSON.stringify(TSAVE))}catch(e){}
  document.body.dataset.tile=TILE;
  if(t.view==='recep'){if($('viewRecep').hidden){show('recep');pollQ(true)}else renderQ()}
  else if(t.tab){const b=$(t.tab);if(b&&b.getAttribute('aria-current')!=='true')b.click()}
  else if(t.seg){if($('viewLab').hidden)$('tabLab').click();LB.seg=t.seg;try{renderLab()}catch(e){}}
  else if(t.iseg){if($('viewInv').hidden)$('tabInv').click();INV.seg=t.iseg;try{renderInv()}catch(e){}}
  else if(t.fsec){FIN.sec=t.fsec;FIN.due7=t.k==='chq';if($('viewFin').hidden)$('tabFin').click();else finRender()}
  renderTiles();tileEmpty();if(!opt.keep)window.scrollTo(0,0)}
function tileEmpty(){const host=ROLE==='staff'?$('rAll'):null;document.querySelectorAll('.tileEmpty').forEach(x=>x.remove());if(!host||!TILE||TILE==='q')return;
  const vis=[...host.querySelectorAll('[data-tile~="'+TILE+'"]')].filter(s=>!s.hidden&&s.querySelector('.list')&&getComputedStyle(s).display!=='none').length;
  if(!vis){const d=document.createElement('div');d.className='empty tileEmpty';d.textContent='در این بخش فعلاً کاری نیست.';host.appendChild(d)}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-tile].htile');if(t){goTile(t.dataset.tile);return}
  const n=e.target.closest&&e.target.closest('[data-tnew]');if(n&&ROLE==='staff'){openAppt({kind:n.dataset.tnew,grp:'all'});return}});
/* wrap the existing navigation so the tiles stay in sync */
/* applyRole: the tiles layer is merged into surgery/roles-live-queue-reception.js */
/* home: the tiles layer is merged into surgery/roles-live-queue-reception.js */
const _show=show;show=function(v){_show(v);try{TILE_HIDE=v==='login';const el=$('tiles');if(el)el.hidden=TILE_HIDE||!ROLE;if(v==='login'){TILE='';delete document.body.dataset.tile}
  if(v==='queue'||v==='recep'){const L=tileList(),want=v==='recep'?(x=>x.view==='recep'):(x=>x.tab==='tabQueue'),cur=L.find(x=>x.k===TILE);if(!cur||!want(cur)){const t=L.find(want);if(t){TILE=t.k;document.body.dataset.tile=TILE;renderTiles();tileEmpty()}}}}catch(e){}};
/* renderQ: the tiles layer is merged into surgery/roles-live-queue-reception.js */
/* logout layer (tiles reset before logout): merged into logout in manager/views.js */
/* staff: flatten the reception panes into one column and tag every section with its tile */
function tileInitStaff(){const v=$('viewRecep');if(!v||$('rAll'))return;
  const all=document.createElement('div');all.id='rAll';$('rTabs').insertAdjacentElement('afterend',all);
  const sec=(tiles,...nodes)=>{const w=document.createElement('div');w.className='rsec';w.dataset.tile=tiles;nodes.forEach(n=>n&&w.appendChild(n));all.appendChild(w);return w};
  const ex=v.querySelector('[data-rpane="ex"]');const wx=sec('plan');while(ex.firstChild)wx.appendChild(ex.firstChild);wx.querySelector('h2').textContent='بیماران طرح درمان امروز';
  const ap=v.querySelector('[data-rpane="ap"]');sec('surg chk unc pros',ap.querySelector('.qhead'));
  const S=id=>{const L=$(id);return L&&L.closest('.rsec')};
  const tag=(id,tiles)=>{const s=S(id);if(s){s.dataset.tile=tiles;all.appendChild(s)}};
  tag('raSg','surg');
  {const s=document.createElement('div');s.className='rsec';s.dataset.tile='bkd';s.innerHTML='<h3 class="rsh k-ck">نوبت‌های داده‌شده</h3><p class="note">نوبت‌های روزهای آینده به تفکیک روز و نوع کار. در روز نوبت، بیمار را با دکمه‌ی ارجاع به کارتابل پزشک بفرستید.</p><div class="rqf" id="bkdF"></div><div class="list" id="bkdList"><div data-tall hidden></div><div class="empty">در حال بارگذاری…</div></div>';all.appendChild(s)}
  const ck=document.createElement('div');ck.className='rsec';ck.dataset.tile='chk';ck.innerHTML='<h3 class="rsh k-ck">نوبت‌های چکاپ و بخیه</h3><div class="rqf" id="raCkF"></div><div class="list" id="raCk"></div>';all.appendChild(ck);
  const un=document.createElement('div');un.className='rsec';un.dataset.tile='unc';un.innerHTML='<h3 class="rsh k-sg">نوبت‌های انکاوری</h3><div class="list" id="raUnc"></div>';all.appendChild(un);
  tag('raPr','pros');tag('raOt','chk');
  const sd=document.createElement('div');sd.className='rsec';sd.dataset.tile='sdone';sd.innerHTML='<h3 class="rsh k-sg">ترخیص بیماران جراحی‌شده</h3><p class="note">برای هر بیمار نسخه و دستورات را چاپ کنید، تسویه و نوبت بعدی را بررسی کنید و «ترخیص» را بزنید.</p><div class="list" id="sdList"><div class="empty">موردی نیست.</div></div>';all.appendChild(sd);
  tag('setlList','sdone');tag('bkList','surg');tag('nbList','chk');
  const lr=document.createElement('div');lr.className='rsec';lr.dataset.tile='pros';lr.innerHTML='<h3 class="rsh k-pr">کار لابراتوار آماده است؛ نوبت تست یا تحویل</h3><div class="list" id="lrList"><div class="empty">موردی نیست.</div></div>';all.appendChild(lr);const pi=document.createElement('div');pi.className='rsec';pi.dataset.tile='pros';pi.innerHTML='<h3 class="rsh k-pr">پروتز بی‌نوبت و کار لابراتوار دیرکرده</h3><div class="list" id="piList"><div class="empty">موردی نیست.</div></div>';all.appendChild(pi);
  tag('ucList','unc');tag('bkOld','fol');tag('flList','fol');tag('fuList','fol');tag('fpList','fol');tag('fxColList','fol');
  v.querySelectorAll('.rpane').forEach(p=>p.remove());
  const nb=S('nbList');if(nb){nb.querySelector('.rsh').textContent='نوبت کشیدن بخیه'}}
/* staff: the surgery-day discharge list */
let SDNX_C=null,SDNX_T=null;const SDNX=()=>{if(SDNX_T!==TASKS){SDNX_T=TASKS;SDNX_C=new Set(TASKS.filter(t=>!t.done&&(t.kind==='suture'||t.kind==='week')).map(t=>t.plan))}return SDNX_C};
/* renderSd — layers: archive/ui base + surgery/appt2 (row cap and its «more» button); finance/m35 and finance/m50a still wrap it */
function renderSd(){SD_TOT=0;try{const L=$('sdList');if(!L)return;const ae=document.activeElement;if(ae&&L.contains(ae)&&ae.dataset&&(ae.dataset.sdnote||ae.dataset.fxsdin))return;const R0=sdItems(),td=tDay();L.dataset.n=R0.length;SD_TOT=R0.length;const R=R0.slice(0,SDCAP);
  L.innerHTML=R.length?R.map(x=>{const sg=x.sg||{},rx=!!sg.rxAt&&tDay(new Date(sg.rxAt))>=(sg.lastDay||td),st=x.settle==='pending',nx=SDNX().has(x.id),cont=x.queue==='surgpart',care=!!(SDC[x.id]||{}).care;
    const row=(ok,tx,sub,act)=>`<div class="sdr${ok?' ok':''}"><span class="ck">${ok?'✓':''}</span><div class="tx">${tx}${sub?`<small>${sub}</small>`:''}</div>${act||''}</div>`;
    return `<div class="item sdone" data-sd="${esc(x.id)}"><div class="row1"><div><span class="nm">${esc(x.name)}</span><div class="meta">${x.phone?esc(faD(x.phone))+' · ':''}${fa(x.surgN||0)} جلسه · ${cont?'<b class="late">جراحی ناتمام؛ جلسه‌ی بعد لازم است</b>':'پایان درمان جراحی'}</div></div><span class="pill ${cont?'cont':'done'}">${cont?'ادامه دارد':'جراحی انجام شد'}</span></div>
      <div class="sdc">
      ${row(rx,'نسخه و دستورات بعد از جراحی چاپ و تحویل شد',rx?'':'از قالب پزشک، داروها را تیک بزنید و چاپ کنید.',`<button class="btn sm${rx?' ghost':''}" type="button" data-sdrx="${esc(x.id)}" data-sdn="${esc(x.name)}">${rx?'چاپ دوباره':'چاپ نسخه'}</button>`)}
      ${row(care,'مراقبت‌ها شفاهی توضیح داده شد',`<label class="pwshow" style="margin:0"><input type="checkbox" data-sdcare="${esc(x.id)}"${care?' checked':''}> توضیح دادم</label>`)}
      ${row(!st,st?'تسویه‌ی اختلاف هزینه مانده است':'حساب جراحی تسویه است',st?'در روز جراحی کاری بیشتر یا کمتر از طرح انجام شده.':'',st?`<button class="btn sm" type="button" data-settle="${esc(x.id)}">تعیین تکلیف</button>`:'')}
      ${row(nx||cont,cont?'جلسه‌ی بعدی جراحی: در «نوبت جراحی» نوبت بدهید':nx?'نوبت چکاپ و کشیدن بخیه ساخته شد':'نوبت چکاپ یا بخیه ثبت نشده',nx&&!cont?'ساعتش را از «چکاپ و بخیه» در روز موعد تعیین کنید.':'',!nx&&!cont?`<button class="btn sm" type="button" data-sdbk="${esc(x.id)}" data-sdn="${esc(x.name)}" data-sdp="${esc(x.phone||'')}">+ نوبت بخیه</button>`:'')}
      </div>
      ${fxSdRow(x)}
      <label class="f full">توضیحات ترخیص<input data-sdnote="${esc(x.id)}" value="${esc((SDC[x.id]||{}).note||'')}" placeholder="مثلاً: همراه دارد، داروها تحویل شد"></label>
      <div class="acts">${rx?`<button class="btn" type="button" data-sdgo="${esc(x.id)}"${(care&&!st&&x.fno)?'':' disabled'}>ترخیص</button>`:`<button class="btn" type="button" data-sdall="${esc(x.id)}" data-sdn="${esc(x.name)}"${(care&&!st&&x.fno)?'':' disabled'}>چاپ نسخه و ترخیص</button>`}${x.phone?`<a class="btn sm ghost" href="tel:${esc(toEn(x.phone))}">تماس</a>`:''}<button class="btn sm ghost" type="button" data-file="${esc(x.id)}" data-fname="${esc(x.name)}">پرونده</button></div></div>`}).join(''):'<div class="empty">امروز بیماری جراحی نشده.</div>';
  try{tidySecs()}catch(e){}}finally{const L=$('sdList');if(L&&SD_TOT>SDCAP&&!L.querySelector('.capmore')){L.dataset.n=SD_TOT;L.insertAdjacentHTML('beforeend',capBtn('sd',SD_TOT,SDCAP))}}}
const SDC={};
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.sdcare){SDC[t.dataset.sdcare]=Object.assign(SDC[t.dataset.sdcare]||{},{care:t.checked});renderSd()}});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.sdnote)SDC[t.dataset.sdnote]=Object.assign(SDC[t.dataset.sdnote]||{},{note:t.value})});
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t||ROLE!=='staff')return;
  if(t.dataset.sdrx){rxOpen(t.dataset.sdrx,t.dataset.sdn);return}
  if(t.dataset.sdbk){openAppt({plan:t.dataset.sdbk,name:t.dataset.sdn,phone:t.dataset.sdp,kind:'suture',day:dAdd(tDay(),10),lock:1});return}
  if(t.dataset.sdgo){t.disabled=true;try{const c=SDC[t.dataset.sdgo]||{};await api('discharge',{id:t.dataset.sdgo,care:!!c.care,note:c.note||'',by:$('rc_asst').value||''});toast('بیمار ترخیص شد.');delete SDC[t.dataset.sdgo];pollQ(true)}catch(err){toast(err.message);t.disabled=false}return}});
/* (the refresh after a printed prescription is merged into rxOpen in reception/p5-online-intake-post-op.js) */
/* surgery role («پزشک»): today's checkups and uncoverings, recorded with the doctor who did them */
function renderSurgAppts2(){const el=$('qAppt');if(!el||ROLE!=='surgery')return;
  const A=QAPPT.filter(a=>a.day===tDay()&&a.st==='set').sort((a,b)=>(a.time||'99')<(b.time||'99')?-1:1);
  const card=(a,sg)=>{const x=QITEMS.find(v=>v.id===a.plan);return `<div class="item appt st-${a.st} kg-${kGrp(a.kind)}"><div class="row1"><div><span class="tm">${a.time?faD(a.time):'بدون ساعت'}</span><span class="nm">${esc(a.name)}</span><div class="meta">${esc(AKL[a.kind]||a.kind)}${a.doc?' · '+esc(a.doc):''}${a.note?' · '+esc(a.note):''}</div></div>${a.st==='done'?'<span class="pill done">انجام شد'+(a.doc?' · '+esc(a.doc):'')+'</span>':a.st==='noshow'?'<span class="pill settle">نیامد</span>':''}</div>
    <div class="acts">${sg?(x?`<button class="btn sm" type="button" data-qopen="${esc(x.id)}">${x.queue==='surgery'?'ادامه‌ی ثبت جراحی':'شروع ثبت جراحی'}</button>`:'<span class="note">منتظر ارجاع پذیرش</span>'):a.st==='set'?`<button class="btn sm" type="button" data-adoc="${esc(a.id)}" data-adn="${esc(a.name)}" data-adp="${esc(a.plan||'')}" data-adk="${esc(a.kind||'')}">ثبت انجام</button><button class="btn sm ghost" type="button" data-ast="noshow" data-aid="${esc(a.id)}">نیامد</button>`:''}${a.plan?`<button class="btn sm ghost" type="button" data-file="${esc(a.plan)}" data-fname="${esc(a.name)}">پرونده</button>`:''}</div></div>`};
  const blk=(tile,ttl,L,sg,emp)=>`<div data-tile="${tile}"><div class="qhead"><h2>${ttl}</h2></div><div class="list">${L.length?L.map(a=>card(a,sg)).join(''):`<div class="empty">${emp}</div>`}</div></div>`;
  el.innerHTML=blk('surg','نوبت‌های جراحی امروز',A.filter(a=>SG_K.includes(a.kind)),true,'امروز نوبت جراحی ثبت نشده.')+blk('chk','ویزیت و کشیدن بخیه',A.filter(a=>CK_K.includes(a.kind)),false,'امروز بیماری برای چکاپ یا بخیه ارجاع نشده.')+blk('unc','انکاوری',A.filter(a=>a.kind==='uncover'),false,'امروز بیماری برای انکاوری ارجاع نشده.')}
let ADOC=null;
/* docPick — layers: archive/ui base + surgery/q6 (uncover / visit: the patient's radiographs and photos above the message) */
function docPick(aid,name){ADOC={aid};const docs=[SURGEON(),...ASSTS()].filter((v,i,a)=>v&&a.indexOf(v)===i);
  const s=mkSheet('dpkSheet',`<div class="dpk"><h3>ثبت انجام · ${esc(name||'')}</h3><p class="note">کدام پزشک این کار را انجام داد؟</p><div class="chips">${docs.map(d=>`<button type="button" class="chip" data-dpk="${esc(d)}">${esc(d)}</button>`).join('')}</div><label class="f">پزشک دیگر<input id="dpk_other" placeholder="نام پزشک"></label><div class="msg" id="dpkMsg"></div>
    <div class="btns"><button class="btn" type="button" id="dpkGo">ثبت</button><button class="btn ghost" type="button" id="dpkClose">بستن</button></div></div>`);s.hidden=false;
  try{const a=(typeof QAPPT!=='undefined'?QAPPT:[]).find(v=>v.id===aid);const pid=a&&a.plan;const s=$('dpkSheet');if(pid&&s){q6Files(pid).then(files=>{const m=$('dpkMsg');if(m&&!s.hidden&&!s.querySelector('.q6strip'))m.insertAdjacentHTML('beforebegin',q6StripHTML(files,pid))})}}catch(e){}}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
  if(t.dataset.adoc){docPick(t.dataset.adoc,t.dataset.adn);p5DocFail(t.dataset.adp,t.dataset.adk);return}
  if(t.dataset.dpk){document.querySelectorAll('[data-dpk]').forEach(b=>b.setAttribute('aria-pressed',b===t));$('dpk_other').value='';return}
  if(t.id==='dpkClose'){$('dpkSheet').hidden=true;return}
  if(t.id==='dpkGo'&&ADOC){const sel=document.querySelector('[data-dpk][aria-pressed="true"]'),doc=($('dpk_other').value||'').trim()||(sel?sel.dataset.dpk:'');if(!doc){$('dpkMsg').className='msg err';$('dpkMsg').textContent='پزشک را انتخاب کنید.';return}
    t.disabled=true;try{await api('apptSet',Object.assign({aid:ADOC.aid,st:'done',doc},P5.kind==='uncover'&&P5.plan?{unc:P5.unc}:{}));await p5FailGo(doc);$('dpkSheet').hidden=true;toast('ثبت شد: '+doc);pollQ(true)}catch(err){$('dpkMsg').className='msg err';$('dpkMsg').textContent=err.message}finally{t.disabled=false}}});
/* consultant and surgery: tag the sections of the queue view */
function tileInitQueue(){const v=$('viewQueue');if(!v||v.dataset.tiled)return;v.dataset.tiled='1';
  const wrap=(ids,tile)=>{const first=$(ids[0]);if(!first)return;const w=document.createElement('div');w.dataset.tile=tile;first.parentNode.insertBefore(w,first);ids.forEach(id=>{const n=$(id);if(n)w.appendChild(n)})};
  const qh=v.querySelector('.qhead');const w=document.createElement('div');w.dataset.tile='cons plan surg';qh.parentNode.insertBefore(w,qh);w.appendChild(qh);w.appendChild($('qList'));w.insertBefore($('kpiStrip'),qh);$('qAppt').dataset.tile='surg chk unc';$('qWaitW').dataset.tile='surg';
  const cx=$('conxW');cx.dataset.tile='chq und';const H=[...cx.querySelectorAll(':scope>.qhead')];const w1=document.createElement('div');w1.dataset.tile='chq';cx.insertBefore(w1,H[0]);w1.appendChild(H[0]);w1.appendChild($('chqList'));const w2=document.createElement('div');w2.dataset.tile='und';cx.appendChild(w2);w2.appendChild(H[1]);w2.appendChild($('folList'))}
try{tileInitStaff();tileInitQueue()}catch(e){console.error(e)}

