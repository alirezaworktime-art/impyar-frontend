/* ---------- q8: (owner, 2026-11-10) patient PDF — (a) surgery table: brand · surgery part · cash · cheques; (b) prosthesis table: prosthesis part · cash · cheques
   (the prosthesis part is the same for every brand); (c) «مهر و امضای کلینیک» instead of the doctor's; (d) one-month validity note; (e) receipts from the patient (deposit, cash, cheques). ---------- */
/* q8Chq / q8Cash: q8 base + o3s (option 3: pct% of the surgery part, no cheques) */
function q8Chq(r,S,frac,n,opt){try{if(pl10O3(r))return S?'بدون چک — مانده تا روز قالب‌گیری':'—'}catch(e){}try{if(!S)return '—';if(discOn(r))return '—';if(String(opt)==='3')return 'بدون چک — مانده روز قالب‌گیری';const x=splitPay(S,frac,n||1);if(!x.rest)return '—';const g=[];x.am.forEach(v=>{const l=g[g.length-1];if(l&&l[0]===v)l[1]++;else g.push([v,1])});return g.map(([v,k])=>k>1?`${fa(k)} چک هر کدام ${fa(v)}`:`یک چک ${fa(v)}`).join(' و ')}catch(e){return ''}}
function q8Cash(r,S,P,which){try{if(pl10O3(r))return which==='s'?o3sCash(r,S):0}catch(e){}try{if(which==='s'){if(!S)return 0;const c=splitPay(S,fracS(r),1).c;return discOn(r)?S-discAmt(r,S):c}if(!P)return 0;const c=splitPay(P,fracP(r),1).c;return discOn(r)?P-(discAmt(r,S+P)-discAmt(r,S)):c}catch(e){return 0}}
function q8Table(title,heads,rows,colsW,bold){const rh=44,h=44+rh*(rows.length+1)+12;return {h,draw(cx,top){T(cx,title,C.R,top+20,{s:22,w:800});const y0=top+44,cols=[C.R];colsW.forEach(w=>cols.push(cols[cols.length-1]-w));cols.push(C.L);
  box(cx,C.L,y0,C.R-C.L,rh,'#e6e6e6');heads.forEach((t,i)=>T(cx,t,cols[i]-14,y0+rh/2,{s:18,w:800}));
  rows.forEach((row,i)=>{const y=y0+rh*(i+1),on=!!(bold&&bold(row,i));if(on)box(cx,C.L,y,C.R-C.L,rh,FAINT);row.cells.forEach((v,j)=>{const c=mctx();const maxW=cols[j]-cols[j+1]-24;const lines=typeof v==='string'&&v.length>22?wrap(c,v,maxW,{s:16}):[String(v)];lines.slice(0,2).forEach((ln,k)=>T(cx,ln,cols[j]-14,y+rh/2+(lines.length>1?(k?12:-10):0),{s:lines.length>1?15:(j===0?19:18),w:on?800:(j===0?700:400)}))})});
  box(cx,C.L,y0,C.R-C.L,rh*(rows.length+1),null,RULE,1.2);cols.slice(1,-1).forEach(xx=>{cx.fillStyle='#bbb';cx.fillRect(xx,y0,1,rh*(rows.length+1))})}}}
{const _t=totalsBlock;totalsBlock=function(r,title){const b0=_t.apply(this,arguments);if(!b0||!b0.h)return b0;try{const T0=totals(r),p=r.pay||{},nb=needBrand(r),eb=effBrand(r),P=T0.pros||0,n1=String(p.opt)==='1'?num(p.n1):1,n3=num(p.n3)||1;
  const brands=nb?BRANDS:[{k:eb,n:(BRANDS.find(b=>b.k===eb)||{}).n||'جمع'}];
  const rows=brands.map(b=>{const S=T0.surg[b.k]||0;return {k:b.k,cells:[b.n+(nb&&b.k===r.brand?'  (انتخاب بیمار)':''),fa(S),fa(q8Cash(r,S,P,'s')),q8Chq(r,S,fracS(r),n1,p.opt)]}});
  const t1=q8Table(title||(nb?'الف) جراحی — به تفکیک برند ایمپلنت':'الف) جراحی'),['برند ایمپلنت','جمع پارت جراحی','پرداخت نقدی','چک‌ها'],rows,[200,240,240],row=>nb&&row.k===r.brand);
  if(!P)return t1;const S0=nb?(r.brand&&r.brand!=='ref'?T0.surg[r.brand]:Math.min(...BRANDS.map(b=>T0.surg[b.k]))):T0.surg[eb]||0;
  const t2=q8Table('ب) پروتز — در همه‌ی برندها یکسان',['جمع پارت پروتز','پرداخت نقدی','چک‌ها'],[{cells:[fa(P),fa(q8Cash(r,S0,P,'p')),q8Chq(r,P,fracP(r),n3,'')]}],[300,300],null);
  return {h:t1.h+t2.h+6,draw(cx,top){t1.draw(cx,top);t2.draw(cx,top+t1.h+6)}}}catch(e){return _t.apply(this,arguments)}}}
/* the text block under the tables keeps only what the tables do not show (other-brand prepayment, cheque dates, guide, global discount) */
{const _p0=payBlock;payBlock=function(r){const b0=_p0.apply(this,arguments);if(!b0||!b0.h)return b0;const L=[];try{if(needBrand(r))L.push(`برای سایر برندها هم پیش‌پرداخت: ${fa(pctS(r))}٪ پارت جراحی + ${fa(pctP(r))}٪ پارت پروتز (ستون پرداخت نقدی).`);{const d=payBlockDates(r);if(d)L.push(d)}
  const T=totals(r);if(T.sgd)L.push(`گاید جراحی: ${PK1_J[T.sgd.j]} — ${fa(T.sgd.n)} × ${fa(T.sgd.a)} = ${fa(T.sgd.amt)} تومان (در پارت جراحی منظور شده)`);
  if(T.gd)L.push(`تخفیف کلی: ${fa(T.gd.d)} تومان از ${PK1_W[T.gd.w]}${T.gd.dS&&T.gd.dP?` (پارت جراحی ${fa(T.gd.dS)} · پارت پروتز ${fa(T.gd.dP)})`:''}${T.gd.why?' — دلیل: '+T.gd.why:''} (در مبالغ بالا کسر شده)`)}catch(e){}
  if(!L.length)return {h:0,draw(){}};return textBlock('شرایط پرداخت',L)}}
/* receipts: the payments recorded in the file (archive PDF) or the deposit taken at the consultation */
function q8Receipts(r){try{if(typeof OC3!=='undefined'&&OC3&&OC3.pdf)return null;const P=(r.pays||[]).filter(p=>p&&p.st!=='del'&&Number(p.amount)>0);const L=[];
  if(P.length){const sum=f=>P.filter(f).reduce((a,p)=>a+(Number(p.amount)||0),0);const dep=sum(p=>p.kind!=='chq'&&/بیعانه/.test(p.note||'')),cash=sum(p=>p.kind!=='chq'&&!/بیعانه/.test(p.note||'')),ok=sum(p=>p.kind==='chq'&&p.st==='ok'),wait=sum(p=>p.kind==='chq'&&p.st==='wait'),bn=sum(p=>p.kind==='chq'&&p.st==='bounce');
    if(dep)L.push('بیعانه: '+fa(dep)+' تومان');if(cash)L.push('نقد / کارتخوان / واریز: '+fa(cash)+' تومان');if(ok)L.push('چک‌های وصول‌شده: '+fa(ok)+' تومان');if(wait)L.push('چک‌های در جریان: '+fa(wait)+' تومان'+(()=>{const d=P.filter(p=>p.kind==='chq'&&p.st==='wait'&&p.due).map(p=>jDay(p.due));return d.length?' (سررسید: '+d.join('، ')+')':''})());if(bn)L.push('چک برگشتی: '+fa(bn)+' تومان');
    L.push('جمع دریافتی: '+fa(dep+cash+ok)+' تومان'+(wait?' + '+fa(wait)+' چک در جریان':''))}
  else{const rcv=num((r.pay||{}).rcv);if(rcv>0)L.push('بیعانه‌ی روز مشاوره: '+fa(rcv)+' تومان'+((r.pay||{}).via?' ('+({cash:'اسکناس',pos:'کارتخوان',xfer:'کارت‌به‌کارت / واریز'})[r.pay.via]+')':''))}
  if(!L.length)return null;return textBlock('دریافتی‌ها از بیمار',L)}catch(e){return null}}
/* fetchRecord (payments): merged into surgery/archive.js */
