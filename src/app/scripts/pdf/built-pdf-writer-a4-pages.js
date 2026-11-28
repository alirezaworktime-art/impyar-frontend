/* ---------- built-in PDF writer (A4 pages, one JPEG image per page; no external library) ---------- */
function dataUrlBytes(u){const b=atob(u.split(',')[1]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function bytesB64(a){let s='';for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s)}
function jpegPDF(pages,land){const enc=new TextEncoder(),parts=[],offs=[];let len=0;
  const push=x=>{const b=typeof x==='string'?enc.encode(x):x;parts.push(b);len+=b.length};
  const obj=(id,body)=>{offs[id]=len;push(id+' 0 obj\n'+body+'\nendobj\n')};
  const W=land?841.89:595.28,H=land?595.28:841.89,n=pages.length,total=2+3*n;
  push('%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  obj(2,`<< /Type /Pages /Kids [${pages.map((_,i)=>(3+3*i)+' 0 R').join(' ')}] /Count ${n} >>`);
  pages.forEach((pg,i)=>{const p=3+3*i,c=p+1,im=p+2,cs=`q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    obj(p,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${im} 0 R >> >> /Contents ${c} 0 R >>`);
    obj(c,`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
    offs[im]=len;push(`${im} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpg.length} >>\nstream\n`);push(pg.jpg);push('\nendstream\nendobj\n')});
  const x=len;let xr=`xref\n0 ${total+1}\n0000000000 65535 f \n`;for(let i=1;i<=total;i++)xr+=String(offs[i]).padStart(10,'0')+' 00000 n \n';
  push(xr+`trailer\n<< /Size ${total+1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`);
  const out=new Uint8Array(len);let o=0;parts.forEach(b=>{out.set(b,o);o+=b.length});return out}

/* buildPDF — one definition of the old layers: base + m48a (a saved, non-quote plan: its notes as extra blocks, via window.M48PB)
   + m57a (patient «می‌خواهد فکر کند»: the SMS block, via window.M57PB). Both lists are set before the pages are drawn and cleared when done. */
async function buildPDF(r,meta){
  let pb57=[];try{if(M57.think&&r&&r.h)pb57=[m57Block(r,M57.sms||'')]}catch(e){}window.M57PB=pb57;try{
  let pb48=[];try{if(r&&r.id&&r.status&&r.status!=='new'&&!(meta&&meta.quote)){const N=await m48Notes(r.id);if(N&&N.length)pb48=await m48NoteBlocks({notes:N})}}catch(e){}window.M48PB=pb48;try{
  try{await Promise.race([logoReady,new Promise(z=>setTimeout(z,1500))])}catch(e){}
  try{await Promise.race([Promise.all([document.fonts.load(`400 20px Vazirmatn`),document.fonts.load(`700 20px Vazirmatn`),document.fonts.load(`800 20px Vazirmatn`)]),new Promise(r=>setTimeout(r,1500))])}catch(e){}
  const SIGIMG=r.sign?await loadImg(r.sign):null;
  const p1=PV(r,1),blocks=[];
  {const used=SECTIONS.filter(x=>rowUsed(p1,x));(used.length?used:SECTIONS).forEach(x=>blocks.push(sectionRow(p1,x)))}
  blocks.push({h:24,draw(){}});blocks.push(totalsBlock(p1,r.alt.mode!=='none'?'طرح اول · جمع کل به تفکیک برند ایمپلنت':null));blocks.push(payBlock(p1));
  if(r.alt.mode==='full'&&(r.sx||r.s2)){(r.sx||[r.s2]).forEach((sx,i)=>{const p2=PV(r,i+2),no=fa(i+2);
    blocks.push({h:0,pageBreak:true,draw(){}});blocks.push(bigTitle('طرح درمان پیشنهادی '+no));blocks.push(tableHead());
    const used=SECTIONS.filter(x=>rowUsed(p2,x));(used.length?used:SECTIONS).forEach(x=>blocks.push(sectionRow(p2,x)));
    blocks.push({h:24,draw(){}});blocks.push(totalsBlock(p2,'طرح '+no+' · جمع کل به تفکیک برند ایمپلنت'));blocks.push(payBlock(p2))})}
  else if(r.alt.mode==='text'&&(r.alt.text||'').trim()){
    blocks.push({h:20,draw(){}});blocks.push(bigTitle('طرح درمان پیشنهادی دوم'));blocks.push(textBlock('',r.alt.text.split(/\n/)))}
  blocks.push(textBlock('',[...(r.quote&&r.quote.until?['* اعتبار این قیمت‌ها تا '+jDay(r.quote.until)+' است؛ بعد از آن قیمت‌ها به تعرفه‌ی روز محاسبه می‌شود.']:[]),'* قیمت‌های ارائه شده به صورت تقریبی می‌باشد.','* مبالغ ارائه‌شده حداکثر تا یک ماه پس از ارائه‌ی طرح درمان مورد تأیید می‌باشد.','* بیمارانی که زمان جراحی آنها از دی‌ماه سال جاری به بعد می‌باشد، پارت پروتز (روکش) به قیمت روز محاسبه می‌شود.'],{c:'#333'}));
  {const q8=q8Receipts(r);if(q8)blocks.push(q8)}try{(window.M48PB||[]).forEach(b=>blocks.push(b))}catch(e){}try{(window.M57PB||[]).forEach(b=>blocks.push(b))}catch(e){}blocks.push(signBlock(SIGIMG));
  if(CF_ON&&!(meta&&meta.quote)){blocks.push({h:0,pageBreak:true,draw(){}});blocks.push(bigTitle('رضایت‌نامه‌ی آگاهانه'));blocks.push(textBlock('',consentText(r).split(/\n/)));blocks.push({h:20,draw(){}});blocks.push(consentSign(r,SIGIMG,meta))}
  const sgS=r.surg&&(r.surg.sessions||[]).length?r.surg:null;
  if(sgS){blocks.push({h:0,pageBreak:true,draw(){}});blocks.push(bigTitle('گزارش جراحی'));surgBlocks(sgS).forEach(b=>blocks.push(b))}
  const pages=[];let pg,y;const bottom=PH-M-36;
  const start=first=>{const cv=document.createElement('canvas');cv.width=PW;cv.height=PH;const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,PW,PH);pg={cv,cx};pages.push(pg);y=M;
    const hb=first?headerBlock(r,meta):miniHeader(r,meta);hb.draw(cx,y);y+=hb.h};
  start(true);{const mb=medBlock(r);mb.draw(pg.cx,y);y+=mb.h}const th=tableHead();th.draw(pg.cx,y);y+=th.h;
  blocks.forEach(b=>{if(b.pageBreak){start(false);return}if(y+b.h>bottom){start(false);if(b.table){const t2=tableHead();t2.draw(pg.cx,y);y+=t2.h}}b.draw(pg.cx,y);y+=b.h});
  pages.forEach((p,i)=>T(p.cx,`صفحه ${fa(i+1)} از ${fa(pages.length)}`,PW/2,PH-M+6,{s:16,c:GREY,a:'center'}));
  const urls=pages.map(p=>p.cv.toDataURL('image/jpeg',0.82));
  const bytes=jpegPDF(urls.map(u=>({jpg:dataUrlBytes(u),w:PW,h:PH})));
  const blob=new Blob([bytes],{type:'application/pdf'});const b64=bytesB64(bytes);
  return {blob,b64,previews:urls}}finally{window.M48PB=null}}finally{window.M57PB=null}}

