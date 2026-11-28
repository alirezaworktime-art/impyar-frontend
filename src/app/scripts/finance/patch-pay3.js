/* ---------- patch-pay3: جمع نقد دریافتی + تاریخ اولین چک در فرم مشاور؛ استرداد به بیمار از راه حسابداری ---------- */
const cashTot=r=>{const p=(r&&r.pay)||{};const v=String(p.cash===undefined||p.cash===null?'':p.cash).trim();if(v==='')return null;const C=num(v);/* fix6b: the discounted total typed = 100% cash */try{const G=partS(r)+partP(r),d=discPct(r);if(d>0&&G>0&&C<G&&C>=G-rnd(G*d/100))return G}catch(e){}return C};
const partS=r=>{try{const T=totals(r);return T.surg[effBrand(r)]||0}catch(e){return 0}};
const partP=r=>{try{return totals(r).pros||0}catch(e){return 0}};
/* the cash is taken from the surgery part first; what is left goes to the prosthesis part */
function cashParts(r){const C=cashTot(r);if(C===null)return null;const S=partS(r),P=partP(r),cS=Math.min(S,C),cP=Math.min(P,Math.max(0,C-cS));return {C,S,P,cS,cP,extra:Math.max(0,C-cS-cP)}}
const fracS=r=>{const c=cashParts(r);if(!c)return pctS(r)/100;return c.cS<=1?0:c.cS};
const fracP=r=>{const c=cashParts(r);if(!c)return pctP(r)/100;return c.cP<=1?0:c.cP};
function chqDates(r,n){const iso=parseJ(((r&&r.pay)||{}).chq1||'');if(!iso)return [];const out=[];for(let i=0;i<n;i++)out.push(jAddM(iso,i));return out}
/* cashNoteRender: patch-pay3 base + fix6b A9 (100% cash with discount) + o3s (option 3: no note) */
function cashNoteRender(){const el=$('cashNote');try{if(F&&F.pay&&String(F.pay.opt)==='3'){if(el)el.innerHTML='';return}}catch(e){}if(!el)return;const cp=cashParts(F),p=F.pay||{},L=[];
  if(cp){L.push(`نقد ${fa(cp.C)} تومان: پارت جراحی ${fa(cp.cS)} (${fa(pctS(F))}٪)${cp.P?' · پارت پروتز '+fa(cp.cP)+' ('+fa(pctP(F))+'٪)':''}${cp.extra?' · <b>'+fa(cp.extra)+' تومان بیشتر از جمع طرح</b>':''}`);
    const a=$('p_cs'),b=$('p_cp');if(a)a.value=String(Math.round(pctS(F)));if(b)b.value=String(Math.round(pctP(F)))}
  const iso=parseJ(p.chq1||'');if(String(p.chq1||'').trim()&&!iso)L.push('<b>تاریخ اولین چک درست نیست (مثال: ۱۴۰۵/۰۹/۰۱).</b>');
  else if(iso){try{const c=chqFor(F),n=c.chq.length;if(n){const D=chqDates(F,n);L.push(`سررسید ${fa(n)} چک: `+D.map((d,i)=>`${jDay(d)} (${fa(c.chq[i].amount)})`).join('، '))}}catch(e){}}
  el.innerHTML=L.join('<br>');el.hidden=!L.length;
  try{const p=F.pay||{},raw=String(p.cash==null?'':p.cash).trim();
  if(raw!==''&&discOn(F)){const C=num(raw),net=planTotal(F),G=partS(F)+partP(F),ex=C-net;el.hidden=false;el.innerHTML='نقد '+fa(C)+' تومان = <b>۱۰۰٪ نقد با '+fa(discPct(F))+'٪ تخفیف</b> (جمع طرح '+fa(G)+' تومان، با تخفیف '+fa(net)+' تومان)'+(ex>0?' · <b>'+fa(ex)+' تومان بیشتر از جمع با تخفیف</b>':'')}}catch(e){}}
function payBlockDates(r){try{const iso=parseJ(((r&&r.pay)||{}).chq1||'');if(!iso)return '';const n=chqFor(r).chq.length;if(!n)return '';return 'سررسید چک‌ها: '+chqDates(r,n).map(d=>jDay(d)).join('، ')}catch(e){return ''}}
/* ---- surgery-difference settlement when the clinic owes the patient ---- */
function rfFormHTML(c){return `<div class="payform" id="stForm"><b>تعیین تکلیف ${fa(c)} تومان بستانکاری بیمار</b><div class="chips" id="stKind" style="margin-top:6px"><button type="button" class="chip" data-stk="refund" aria-pressed="false">پرداخت به بیمار (ارجاع به حسابداری)</button><button type="button" class="chip" data-stk="reduce" aria-pressed="false">از مانده / چک‌های بعدی کم شود</button></div><div id="stF" style="margin-top:8px"></div></div>`}
function stRefund(){if(!ST||!(ST.d<0)||!$('stForm'))return null;const m=$('sdMsg'),err=x=>{m.className='msg err';m.textContent=x;return false};
  if(!ST.k)return err('نحوه‌ی تسویه‌ی بستانکاری را انتخاب کنید.');if(ST.k!=='refund')return null;
  const a=parseInt(toEn(($('rf_amt')||{}).value||'').replace(/[^\d]/g,''),10)||0;if(!a)return err('مبلغ قابل پرداخت به بیمار را وارد کنید.');if(a>-ST.d)return err('مبلغ از بستانکاری بیمار بیشتر است.');
  return {amount:a,note:(($('rf_note')||{}).value||'').trim()}}
const RF_M={cash:'نقد',card:'کارت',bank:'واریز بانکی'};
const rfBtns=id=>Object.keys(RF_M).map(k=>`<button class="btn sm${k==='cash'?' main':' ghost'}" type="button" data-rfpay="${esc(id)}" data-rfm="${k}">پرداخت ${RF_M[k]}</button>`).join('')+(['consultant','accountant'].includes(ROLE)?`<button class="btn sm ghost" type="button" data-fx4rfc="${esc(id)}">لغو استرداد</button>`:'');
function rfdHTML(items){const open=items.filter(x=>x.st==='open'),paid=items.filter(x=>x.st==='paid');
  return `<h3>بدهی کلینیک به بیماران (استرداد)</h3>${open.length?open.map(x=>`<div class="prow"><div><span class="amt">${fa(x.amount)}</span> <span class="note">${esc(x.name)}</span><div class="meta">ثبت ${esc(jt(x.at))}${x.by?' · '+esc(x.by):''}${x.note?' · '+esc(x.note):''}</div></div><div class="acts">${ROLE==='manager'?'<span class="pill wait">در انتظار پرداخت</span>':rfBtns(x.id)}</div></div>`).join(''):'<p class="note">موردی در انتظار پرداخت نیست.</p>'}${paid.length?`<details><summary class="note">پرداخت‌شده‌های اخیر (${fa(paid.length)})</summary>${paid.map(x=>`<div class="prow"><div><span class="amt">${fa(x.amount)}</span> <span class="note">${esc(x.name)}</span><div class="meta">پرداخت ${esc(jt(x.paidAt))} · ${RF_M[x.method]||x.method||''}${x.paidBy?' · '+esc(x.paidBy):''}</div></div></div>`).join('')}</details>`:''}`}
let QRFD=[];
async function rfPay(t){const id=t.dataset.rfpay,m=t.dataset.rfm;if(!await uxConfirm('پرداخت '+(RF_M[m]||m)+' به بیمار ثبت شود؟','ثبت پرداخت به بیمار',false,'استرداد به بیمار'))return;t.disabled=true;
  try{await api('refundPay',{rid:id,method:m,by:ROLE_LBL[ROLE]});toast('پرداخت به بیمار ثبت شد.');QRFD=QRFD.filter(x=>x.id!==id);try{renderMyQ()}catch(e){}
    const c=$('rfdCard');if(c){try{const j=await api('refundList');c.innerHTML=rfdHTML(j.items||[])}catch(e){}}if(PF&&!$('pfSheet').hidden)refreshFile();pollQ(true)}
  catch(err){alertMsg(err.message)}finally{t.disabled=false}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-rfpay]');if(t)rfPay(t)});
if(typeof FREND!=='undefined'&&FREND.rcv){const _rcv0=FREND.rcv;FREND.rcv=async B=>{await _rcv0(B);try{const j=await api('refundList');const el=document.createElement('section');el.className='card';el.id='rfdCard';el.innerHTML=rfdHTML(j.items||[]);B.prepend(el)}catch(e){}}}

