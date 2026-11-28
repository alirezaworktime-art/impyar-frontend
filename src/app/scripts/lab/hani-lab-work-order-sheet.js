/* ---------- hani: the lab work-order sheet («لابراتوار تخصصی حانی») replaces the lab order form; drop zone for scans;
   «توضیحات» = full white page for the tablet pen; the filled sheet goes to the lab as an image with the order ---------- */
const H9={crown:['post','PFM','Zirconia'],imp:['بیس و وکس','رزین پترن','رزین پیچ شونده','pmma','essix'],
  itype:['Implant (zirconia)','Implant (PFM)','سمان شونده','پیچ شونده','اسکروسمنت'],imat:['مونولیتیک','پرسلن']};
const H9N=[8,7,6,5,4,3,2,1];
function h9Brands(j){const imp=implantsOf(j);return [...new Set(Object.keys(imp).map(k=>imp[k].b).filter(Boolean))]}
function h9Init(j){if(!LO)return;if(LO.h9)return LO.h9;const r=fromDoc(PF.id,j.data||{}),h=r.h||{},M=(j.pros||{}).map||{},imp=implantsOf(j);
  const base=Object.keys(M).length?Object.keys(M).filter(k=>M[k]==='a'):Object.keys(imp),pon=Object.keys(M).filter(k=>M[k]==='p');
  const ses=((j.surg||{}).sessions||[]),asst=(ses.length&&ses[ses.length-1].asst)||'';
  LO.h9={doc:PROSDOC()||USERNAME||LO.doc||'',brand:h9Brands(j).join('، ')||LO.sys||'',asst,name:h.name||'',file:'',day:jDay(tDay()),shade:LO.shade||'',age:h.age||'',
    photo:'',crown:[],imp:[],itype:[],imat:[],base:base.filter(k=>isTooth(k)),pon:pon.filter(k=>isTooth(k)),draw:'',drawN:0};return LO.h9}
function h9Chart(g,sel){const row=j=>`<div class="h9row" dir="ltr">${H9N.map(n=>h9T(g,j+'R'+n,n,sel)).join('')}<b class="h9mid"></b>${H9N.slice().reverse().map(n=>h9T(g,j+'L'+n,n,sel)).join('')}</div>`;
  return `<div class="h9chart"><div class="h9ct">${g==='base'?'پایه':'پونتیک'}</div>${row('U')}<div class="h9line"></div>${row('L')}</div>`}
function h9T(g,k,n,sel){return `<button type="button" class="h9t" data-h9t="${g}" data-k="${k}" aria-pressed="${sel.includes(k)}">${n}</button>`}
function h9Opt(g,v){const on=(LO.h9[g]||[]).includes(v);return `<button type="button" class="h9o" data-h9o="${g}" data-v="${esc(v)}" aria-pressed="${on}"><i></i><span dir="auto">${esc(v)}</span></button>`}
function h9Field(k,l,o){return `<label class="h9f"><span>${l}</span><input data-h9f="${k}" value="${esc(LO.h9[k]||'')}"${o||''}></label>`}
function h9HTML(j){const H=h9Init(j);
  return `<div class="h9sheet"><div class="h9hd"><div class="h9no">شماره: <b>—</b><small>(بعد از ارسال، شماره‌ی لابراتوار)</small></div><div class="h9tt">لابراتوار تخصصی حانی</div></div>
    <div class="h9grid">${h9Field('doc','نام پزشک :',' list="h9Docs"')}${h9Field('brand','برند :')}${h9Field('asst','نام دستیار :',' list="h9Assts"')}${h9Field('name','نام بیمار:')}${h9Field('file','شماره پرونده :')}${h9Field('day','تاریخ :',' inputmode="numeric"')}${h9Field('shade','رنگ کار :',' class="ltr" list="h9Shades"')}${h9Field('age','سن بیمار :',' inputmode="numeric"')}</div>
    <datalist id="h9Docs">${docList().concat([SURGEON()]).map(x=>`<option value="${esc(x)}">`).join('')}</datalist><datalist id="h9Assts">${ASSTS().map(x=>`<option value="${esc(x)}">`).join('')}</datalist><datalist id="h9Shades">${(PR2.SHADES||[]).map(x=>`<option value="${esc(x)}">`).join('')}</datalist>
    <div class="h9photo"><span>عکس دهانی :</span><button type="button" class="h9o" data-h9p="yes" aria-pressed="${H.photo==='yes'}"><i></i><span>دارد</span></button><button type="button" class="h9o" data-h9p="no" aria-pressed="${H.photo==='no'}"><i></i><span>ندارد</span></button></div>
    <div class="h9box"><span class="h9bl">روکش دندانی :</span>${H9.crown.map(v=>h9Opt('crown',v)).join('')}</div>
    <div class="h9box"><span class="h9bl">ایمپلنت :</span>${H9.imp.map(v=>h9Opt('imp',v)).join('')}</div>
    <div class="h9box h9ic"><span class="h9bl">روکش ایمپلنت :</span><div class="h9col"><b dir="ltr">Type</b>${H9.itype.map(v=>h9Opt('itype',v)).join('')}</div><div class="h9col"><b dir="ltr">material</b>${H9.imat.map(v=>h9Opt('imat',v)).join('')}</div></div>
    <div class="h9charts">${h9Chart('base',H.base)}${h9Chart('pon',H.pon)}</div>
    <div class="h9notes"><span>توضیحات :</span><button type="button" class="h9draw" id="h9Draw">${H.draw?`<img src="${H.draw}" alt="توضیحات">`:'<em>برای نوشتن با قلم تبلت بزنید</em>'}</button></div>
    <div class="h9sch"><span>تحویل از لابراتوار:</span><input id="lo_due" inputmode="numeric" value="${esc(jDay(LO.due))}"><small class="dhint" id="lo_dueH">${esc(dayHint(LO.due))}</small>
      <span>ساخت برای:</span>${Object.keys(LFOR).map(k=>`<button type="button" class="chip" data-lofor="${k}" aria-pressed="${LO.for===k}">${LFOR[k]}</button>`).join('')}
      <span>روش قالب‌گیری:</span>${Object.keys(PR2.METH||{}).map(k=>`<button type="button" class="chip" data-lometh="${k}" aria-pressed="${LO.meth===k}">${PR2.METH[k]}</button>`).join('')}</div></div>`}
/* the whole order form = the sheet + scans (drop zone) + the existing message / buttons */
(function(){const _f=loForm;loForm=function(j){const base=_f.apply(this,arguments);if(!LO)return base;
  const i=base.indexOf('<div class="grp l3files">');const tail=i>=0?base.slice(i):base.slice(base.indexOf('<div class="msg" id="loMsg"></div>'));
  const drop=`<div class="h9drop" id="h9Drop" role="button" tabindex="0" aria-label="انتخاب فایل اسکن یا عکس" data-l8d="1"><b>بارگذاری فایل اسکن / عکس</b><span>برای انتخاب فایل اینجا بزنید، یا فایل را بکشید و اینجا رها کنید</span></div>`;
  return `<div class="payform h9form">${h9HTML(j)}${drop}${tail.replace('<span>فایل اسکن و عکس (اختیاری) — STL، PLY، OBJ، ZIP، عکس، PDF</span>','<span>STL، PLY، OBJ، ZIP، عکس، PDF (اختیاری)</span>')}`}})();
/* sheet → order fields the lab system already understands */
/* h9Apply: base + voice (voice notes in the note) + lab6 (brand per tooth, typed text) */
function h9Apply(){const H=LO&&LO.h9;if(!H)return;const base=H.base.filter(isTooth),pon=H.pon.filter(isTooth),all=[...new Set(base.concat(pon))];
  LO.teeth=all;LO.all=[...new Set((LO.all||[]).concat(all))];LO.pon=pon;LO.shade=H.shade;LO.sys=H.brand;LO.doc=H.doc;
  const has=(g,v)=>(H[g]||[]).includes(v);LO.mat=has('itype','Implant (zirconia)')||has('crown','Zirconia')?'زیرکونیا':has('itype','Implant (PFM)')||has('crown','PFM')?'PFM':LO.mat;
  LO.ret=has('itype','پیچ شونده')||has('itype','اسکروسمنت')?'پیچی':has('itype','سمان شونده')?'سمانی':LO.ret;LO.type=pon.length?'بریج':all.length===1?'روکش تک':LO.type;
  const L=[['عکس دهانی',H.photo==='yes'?'دارد':H.photo==='no'?'ندارد':''],['روکش دندانی',H.crown.join('، ')],['ایمپلنت',H.imp.join('، ')],['روکش ایمپلنت',H.itype.concat(H.imat).join('، ')],['نام دستیار',H.asst],['شماره پرونده',H.file],['سن بیمار',H.age]].filter(x=>x[1]).map(x=>x[0]+': '+x[1]);
  LO.note=('برگه‌ی دستورکار — '+L.join(' · ')+(H.draw?' · توضیحات دست‌نویس در تصویر برگه':'')).slice(0,990);
  try{const n=v9Files().length;if(n&&LO&&!/توضیح صوتی/.test(LO.note))LO.note=(LO.note+' · '+fa(n)+' توضیح صوتی پیوست است').slice(0,1000)}catch(e){}
  try{const X=l6Extra(H),k=Object.keys(X.tbrand),ex=[];LO.tbrand=X.tbrand;LO.txt=X.txt;
    if(k.length){LO.sys=[...new Set(Object.values(X.tbrand))].join('، ');ex.push('برند هر دندان: '+k.map(t=>l6Fdi(t)+' '+X.tbrand[t]).join('، '))}
    if(X.txt)ex.push('توضیحات: '+X.txt);if(ex.length)LO.note=(String(LO.note||'')+' · '+ex.join(' · ')).slice(0,1000)}catch(e){}}
function h9Read(){if(!LO||!LO.h9)return;document.querySelectorAll('[data-h9f]').forEach(i=>{LO.h9[i.dataset.h9f]=i.value});const d=$('lo_due');if(d){const iso=parseJ(d.value);LO.dueTxt=d.value;LO.due=iso||''}}
/* (loRead calls h9Read + h9Apply: finance/patient-file-extra-tabs.js) */
/* the base / pontic chart is the prosthesis map: save it before the order (the server refuses an order without it) */
async function h9Map(){const H=LO&&LO.h9;if(!H||!PF)return;const M={};H.base.forEach(k=>M[k]='a');H.pon.forEach(k=>M[k]='p');if(!Object.keys(M).length)return;
  const cur=(PF.j.pros||{}).map||{};if(JSON.stringify(Object.keys(cur).sort().map(k=>k+cur[k]))===JSON.stringify(Object.keys(M).sort().map(k=>k+M[k])))return;
  const r=await api('prosMap',{id:PF.id,map:M,note:'',by:USERNAME||ROLE_LBL[ROLE]||''});if(r&&r.pros&&PF.j)PF.j.pros=Object.assign(PF.j.pros||{},{map:r.pros.map})}
/* the filled sheet as an image (A5) for the lab and the file */
/* h9Sheet: base + voice (a line about the voice notes) + lab6 (brand per tooth, typed text under the sheet) */
async function h9Sheet(){const H=LO.h9,W=1240,Hh=1754,c=document.createElement('canvas');c.width=W;c.height=Hh;const x=c.getContext('2d'),F=getComputedStyle(document.body).fontFamily||'sans-serif';
  x.fillStyle='#fff';x.fillRect(0,0,W,Hh);x.direction='rtl';x.textBaseline='middle';const G='#1f4d3a',T=(t,X,Y,s,w,col,al)=>{x.font=`${w||400} ${s||28}px ${F}`;x.fillStyle=col||'#111';x.textAlign=al||'right';x.fillText(String(t||''),X,Y)};
  const C=(X,Y,on)=>{x.beginPath();x.arc(X,Y,15,0,7);x.strokeStyle='#a08a3c';x.lineWidth=2.5;x.stroke();if(on){x.beginPath();x.arc(X,Y,9,0,7);x.fillStyle=G;x.fill()}};
  const R=(X,Y,w,h)=>{x.strokeStyle=G;x.lineWidth=3;x.beginPath();x.roundRect?x.roundRect(X,Y,w,h,18):x.rect(X,Y,w,h);x.stroke()};
  T('لابراتوار تخصصی حانی',W-70,90,64,800,G);T('Hani Dental Laboratory',70,90,30,700,'#a08a3c','left');T('شماره: '+(H.no?faD(H.no):'—'),70,140,26,400,'#9b1c1c','left');
  const fl=[['نام پزشک :',H.doc],['برند :',H.brand],['نام دستیار :',H.asst],['نام بیمار:',H.name],['شماره پرونده :',H.file],['تاریخ :',H.day],['رنگ کار :',H.shade],['سن بیمار :',H.age]];
  const mw=(t,s,w)=>{x.font=`${w||400} ${s}px ${F}`;return x.measureText(String(t||'')).width};
  fl.forEach(([l,v],i)=>{const col=i%2,row=Math.floor(i/2),X=col?W/2-30:W-70,Y=220+row*62;T(l,X,Y,30,800);T(v,X-mw(l,30,800)-18,Y,30,400,'#0b3b8c')});
  let y=480;T('عکس دهانی :',W-70,y,30,800);{let X=W-70-mw('عکس دهانی :',30,800)-40;[['دارد','yes'],['ندارد','no']].forEach(([l,k])=>{T(l,X,y,28);X-=mw(l,28)+28;C(X,y,H.photo===k);X-=60})}
  const line=(lbl,g,opts,Y)=>{R(50,Y-40,W-100,80);T(lbl,W-80,Y,30,800);const tot=opts.reduce((a,v)=>a+mw(v,26)+64,0),room=W-160-mw(lbl,30,800)-30,gap=Math.max(14,Math.min(70,(room-tot)/Math.max(1,opts.length-1)+14));let X=W-80-mw(lbl,30,800)-30;opts.forEach(v=>{T(v,X,Y,26);const w=mw(v,26);C(X-w-24,Y,(H[g]||[]).includes(v));X-=w+50+gap})};
  line('روکش دندانی :','crown',H9.crown,y+=95);line('ایمپلنت :','imp',H9.imp,y+=100);
  y+=70;R(50,y,W-100,330);T('روکش ایمپلنت :',W-80,y+40,30,800);T('Type',W-420,y+40,30,800,'#111','left');H9.itype.forEach((v,i)=>{const Y=y+95+i*46;C(W-470,Y,H.itype.includes(v));T(v,W-500,Y,27,600,'#111','right')});
  T('material',260,y+40,30,800,'#111','left');H9.imat.forEach((v,i)=>{const Y=y+95+i*46;C(140,Y,H.imat.includes(v));T(v,330,Y,27,600)});
  y+=380;const ch=(g,X0,lbl)=>{T(lbl,X0+265,y-30,28,800,g==='pon'?'#7a1f1f':G,'center');x.strokeStyle=G;x.lineWidth=5;x.beginPath();x.moveTo(X0,y+30);x.lineTo(X0+530,y+30);x.moveTo(X0+265,y-10);x.lineTo(X0+265,y+75);x.stroke();
    ['U','L'].forEach((j,ri)=>{const Y=ri?y+58:y+5;H9N.forEach((n,i)=>{const kR=j+'R'+n,kL=j+'L'+(9-H9N[i]);[[kR,X0+12+i*31,n],[kL,X0+280+i*31,9-H9N[i]]].forEach(([k,X,nn])=>{const on=H[g].includes(k);if(on){x.beginPath();x.arc(X+8,Y,15,0,7);x.strokeStyle='#0b3b8c';x.lineWidth=3;x.stroke()}T(nn,X+8,Y,24,700,on?'#0b3b8c':'#a08a3c','center')})})})};
  ch('pon',70,'پونتیک');ch('base',W-600,'پایه');
  y+=150;T('توضیحات :',W-70,y,30,800);if(H.draw){const im=new Image();await new Promise(res=>{im.onload=res;im.onerror=res;im.src=H.draw});const bw=W-140,bh=Hh-y-60,s=Math.min(bw/im.width,bh/im.height);x.drawImage(im,70+(bw-im.width*s)/2,y+20,im.width*s,im.height*s)}
  else for(let i=1;i<7;i++){x.setLineDash([4,10]);x.strokeStyle='#999';x.lineWidth=2;x.beginPath();x.moveTo(70,y+i*70);x.lineTo(W-70,y+i*70);x.stroke();x.setLineDash([])}
  let f=await new Promise(res=>c.toBlob(b=>res(new File([b],'برگه-دستورکار-'+(H.name||'بیمار').replace(/[\\/:*?"<>|]/g,'')+'.png',{type:'image/png'})),'image/png'));
  {const n=v9Files().length;if(n)try{const im=await createImageBitmap(f),c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);x.direction='rtl';x.textAlign='right';x.textBaseline='middle';
    x.font=`700 28px ${getComputedStyle(document.body).fontFamily}`;x.fillStyle='#0b3b8c';x.fillText('🎙 '+fa(n)+' توضیح صوتی همراه این سفارش',im.width-70,im.height-50);
    f=await new Promise(res=>c.toBlob(b=>res(new File([b],f.name,{type:'image/png'})),'image/png'))}catch(e){}}
  try{const H=LO&&LO.h9,X=l6Extra(H),tb=Object.keys(X.tbrand);if(!X.txt&&!tb.length)return f;
  const im=await createImageBitmap(f),W=im.width,F=getComputedStyle(document.body).fontFamily||'sans-serif',m=document.createElement('canvas').getContext('2d');m.font=`400 28px ${F}`;
  const wrap=t=>{const out=[];String(t).split('\n').forEach(p=>{let ln='';p.split(/\s+/).forEach(w=>{const tt=ln?ln+' '+w:w;if(m.measureText(tt).width>W-140&&ln){out.push(ln);ln=w}else ln=tt});out.push(ln)});return out};
  const L=[];if(tb.length)L.push(['b','برند هر دندان:'],...wrap(tb.map(k=>l6Fdi(k)+': '+X.tbrand[k]).join('   ')).map(s=>['t',s]));if(X.txt)L.push(['b','توضیحات تایپ‌شده:'],...wrap(X.txt).map(s=>['t',s]));
  const c=document.createElement('canvas');c.width=W;c.height=im.height+70+L.length*44;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,c.height);x.drawImage(im,0,0);
  x.direction='rtl';x.textAlign='right';x.textBaseline='middle';x.strokeStyle='#1f4d3a';x.lineWidth=3;x.beginPath();x.moveTo(50,im.height+12);x.lineTo(W-50,im.height+12);x.stroke();
  L.forEach(([k,s],i)=>{x.font=`${k==='b'?800:400} 28px ${F}`;x.fillStyle=k==='b'?'#111':'#0b3b8c';x.fillText(s,W-70,im.height+50+i*44)});
  return await new Promise(res=>c.toBlob(b=>res(new File([b],f.name,{type:'image/png'})),'image/png'))}catch(e){return f}}
/* send: map → order (existing flow) → the sheet image as an order file */
(function(){const _s=loSend;loSend=async function(t){try{loRead();await h9Map()}catch(e){const m=$('loMsg');if(m){m.className='msg err';m.textContent=e.message}return}
  if(LO&&LO.h9){try{const f=await h9Sheet();if(!LOF.some(x=>x.name===f.name))LOF.unshift(f)}catch(e){}}return _s.apply(this,arguments)}})();
(function(){const _s=l5Submit;l5Submit=async function(withLab,b){if(withLab&&LO&&LO.h9){try{loRead();await h9Map()}catch(e){const m=$('l5Msg');if(m){m.className='msg err';m.textContent=e.message}return}
  try{const f=await h9Sheet();LOF=LOF.filter(x=>!/^برگه-دستورکار-/.test(x.name));LOF.unshift(f)}catch(e){}}return _s.apply(this,arguments)}})();
const H9NEED='روی چارت «پایه» دندان‌های پایه را بزنید.';
(function(){const _s=loSend;loSend=async function(t){if(LO&&LO.h9){loRead();if(!LO.h9.base.length){const m=$('loMsg');if(m){m.className='msg err';m.textContent=H9NEED}return}}return _s.apply(this,arguments)}})();
(function(){const _s=l5Submit;l5Submit=async function(withLab,b){if(withLab&&LO&&LO.h9){loRead();if(!LO.h9.base.length){const m=$('l5Msg');if(m){m.className='msg err';m.textContent=H9NEED;m.scrollIntoView({block:'center'})}return}}return _s.apply(this,arguments)}})();
var H9SKIP=0;(function(){const _o=openPmap;openPmap=async function(){if(Date.now()<H9SKIP)return;return _o.apply(this,arguments)}})();
(function(){const _o=l3OpenLab;l3OpenLab=async function(){H9SKIP=Date.now()+3000;return _o.apply(this,arguments)}})();
/* sheet clicks */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-h9t],[data-h9o],[data-h9p],#h9Draw');if(!b||!LO||!LO.h9)return;e.stopPropagation();h9Read();const H=LO.h9;
  if(b.dataset.h9t){const g=b.dataset.h9t,k=b.dataset.k,o=g==='base'?'pon':'base';H[g]=H[g].includes(k)?H[g].filter(v=>v!==k):H[g].concat(k);H[o]=H[o].filter(v=>v!==k);h9Apply();renderFile();return}
  if(b.dataset.h9o){const g=b.dataset.h9o,v=b.dataset.v;H[g]=H[g].includes(v)?[]:[v];renderFile();return}
  if(b.dataset.h9p){H.photo=H.photo===b.dataset.h9p?'':b.dataset.h9p;renderFile();return}
  if(b.id==='h9Draw')h9Pad()},true);
document.addEventListener('input',e=>{if(e.target&&e.target.dataset&&e.target.dataset.h9f&&LO&&LO.h9){LO.h9[e.target.dataset.h9f]=e.target.value;if(e.target.dataset.h9f==='shade')LO.shade=e.target.value}});
/* scans: drag and drop */
document.addEventListener('dragover',e=>{const z=e.target.closest&&e.target.closest('.h9form');if(!z)return;e.preventDefault();const d=$('h9Drop');if(d)d.classList.add('on')});
document.addEventListener('dragleave',e=>{const d=$('h9Drop');if(d&&!(e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('.h9form')))d.classList.remove('on')});
document.addEventListener('drop',e=>{const z=e.target.closest&&e.target.closest('.h9form');if(!z||!e.dataTransfer)return;e.preventDefault();loRead();
  for(const f of [...e.dataTransfer.files]){if(f.size>120*1024*1024){alertMsg('حجم «'+f.name+'» بیش از ۱۲۰ مگابایت است.');continue}if(!LOF.some(x=>x.name===f.name&&x.size===f.size))LOF.push(f)}renderFile()});
/* «توضیحات»: a full white page for the pen */
function h9Pad(){const H=LO.h9;let ov=$('h9Pad');if(ov)ov.remove();ov=document.createElement('div');ov.id='h9Pad';
  ov.innerHTML=`<div class="h9pbar"><b>توضیحات دستورکار</b><span class="h9pw"><button type="button" data-h9w="2" aria-pressed="true">نازک</button><button type="button" data-h9w="4">متوسط</button><button type="button" data-h9w="8">ضخیم</button></span><span class="h9pc"><button type="button" data-h9c="#111" aria-pressed="true" style="--c:#111"></button><button type="button" data-h9c="#0b3b8c" style="--c:#0b3b8c"></button><button type="button" data-h9c="#b3261e" style="--c:#b3261e"></button></span><button type="button" class="btn sm ghost" id="h9Undo">برگشت</button><button type="button" class="btn sm ghost" id="h9Clr">پاک کردن همه</button><button type="button" class="btn sm ghost" id="h9X">انصراف</button><button type="button" class="btn sm main" id="h9Ok">ذخیره</button></div><canvas id="h9C"></canvas>`;
  document.body.appendChild(ov);const cv=$('h9C'),dpr=Math.max(1,window.devicePixelRatio||1);let W=0,Hh=0,ctx,strokes=[],cur=null,pen=false,lw=2,col='#111';
  const size=()=>{const r=cv.getBoundingClientRect();W=r.width;Hh=r.height;cv.width=W*dpr;cv.height=Hh*dpr;ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);redraw()};
  const seg=(s,a,b)=>{ctx.strokeStyle=s.c;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=s.w*(b.p?0.5+b.p:1);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()};
  const redraw=()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,W,Hh);if(base)ctx.drawImage(base,0,0,W,W*base.height/base.width);strokes.forEach(s=>{for(let i=1;i<s.p.length;i++)seg(s,s.p[i-1],s.p[i]);if(s.p.length===1){ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(s.p[0].x,s.p[0].y,s.w/2,0,7);ctx.fill()}})};
  let base=null;if(H.draw){base=new Image();base.onload=()=>redraw();base.src=H.draw}
  const pt=e=>{const r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top,p:e.pointerType==='pen'?e.pressure:0}};
  cv.addEventListener('pointerdown',e=>{if(e.pointerType==='pen')pen=true;if(pen&&e.pointerType==='touch')return;e.preventDefault();cv.setPointerCapture(e.pointerId);cur={c:col,w:lw,p:[pt(e)]};strokes.push(cur);redraw()});
  cv.addEventListener('pointermove',e=>{if(!cur)return;if(pen&&e.pointerType==='touch')return;e.preventDefault();const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];evs.forEach(v=>{const p=pt(v),l=cur.p[cur.p.length-1];cur.p.push(p);seg(cur,l,p)})});
  const end=()=>{cur=null};cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  ov.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.h9w){lw=+b.dataset.h9w;ov.querySelectorAll('[data-h9w]').forEach(x=>x.setAttribute('aria-pressed',x===b))}
    if(b.dataset.h9c){col=b.dataset.h9c;ov.querySelectorAll('[data-h9c]').forEach(x=>x.setAttribute('aria-pressed',x===b))}
    if(b.id==='h9Undo'){if(strokes.length)strokes.pop();else base=null;redraw()}
    if(b.id==='h9Clr'){strokes=[];base=null;redraw()}
    if(b.id==='h9X'){ov.remove()}
    if(b.id==='h9Ok'){const empty=!strokes.length&&!base;H.draw=empty?'':cv.toDataURL('image/png');H.drawN=strokes.length;ov.remove();renderFile()}});
  requestAnimationFrame(size);window.addEventListener('resize',size,{once:true})}
/* prosthesis session: patient summary = name, surgeon, surgery date, medical history, implant brand(s); the rest is the sheet */
function h9Sum(j){const r=fromDoc(PF.id,j.data||{}),h=r.h||{},ses=((j.surg||{}).sessions||[]),ms=medShort(r.med),br=h9Brands(j);
  const surgeons=[...new Set(ses.map(s=>s.by).filter(Boolean))],days=[...new Set(ses.map(s=>s.jalali||jd(s.at||s.savedAt)).filter(Boolean))];if(!days.length&&(j.surg||{}).lastDay)days.push(jDay((j.surg||{}).lastDay));
  const kv=[['نام بیمار',h.name||'—'],['پزشک جراح',surgeons.join('، ')||(h.pOnly?'جای دیگر':'—')],['تاریخ جراحی',days.join('، ')||(h.pOnly?'جای دیگر':'—')],['برند ایمپلنت',br.join('، ')||(h.pOnly?'ایمپلنت در جای دیگر':'—')]];
  return `<section class="l4info h9sum"><div class="l2info">${kv.map(([k,v])=>`<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>
    <div class="meta"><b>سابقه‌ی پزشکی:</b> ${ms?`<span class="late">${esc(ms)}</span>`:'مورد خاصی ثبت نشده'}</div></section>`}

