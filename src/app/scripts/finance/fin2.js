/* ---------- fin2: تخفیف نقدی، ثبت نقد و چک بعد از ثبت نهایی، طرح‌های نامحدود، چک‌های سررسید ---------- */
const DISC_DEF=5;
function discPct(r){const p=r.pay||{};const v=p.disc===undefined||String(p.disc).trim()===''?DISC_DEF:Math.min(100,Math.max(0,num(p.disc)));return v}
function discOn(r){try{const T=totals(PV(r,1));return discPct(r)>0&&pctS(r)>=100&&(!T.pros||pctP(r)>=100)}catch(e){return false}}
const discAmt=(r,T)=>discOn(r)?rnd(T*discPct(r)/100):0;
/* cheques and cash that follow from the plan's payment terms (same split as the patient-file cheque sheet) */
/* chqFor: fin2 base + fix7d M6 (a blank cheque count is one cheque: fx7N1) + pl10 (option 3, whole plan) + o3s (option 3: pct% of the
   surgery part in cash before surgery, no cheques), in that order. */
function chqFor(r0){const r=fx7N1(r0),pv=PV(r,1),T=totals(pv),b=effBrand(r),S=T.surg[b]||0,P=T.pros||0,p=r.pay||{},out=[];
  if(S){if(p.opt==='1'){const n=num(p.n1);if(n){const x=splitPay(S,fracS(r),n);for(let i=0;i<n;i++)if(x.am[i]>0)out.push({part:'s',amount:x.am[i]})}}else{const x=splitPay(S,fracS(r),1);if(x.rest)out.push({part:'s',amount:x.rest})}}
  if(P){const n=num(p.n3);if(n){const x=splitPay(P,fracP(r),n);for(let i=0;i<n;i++)if(x.am[i]>0)out.push({part:'p',amount:x.am[i]})}}
  const cS=splitPay(S,fracS(r),1).c,cP=splitPay(P,fracP(r),1).c,disc=discOn(r)?discAmt(r,S+P):0,dS=discOn(r)?discAmt(r,S):0;
  let o={S,P,cash:cS+cP-disc,cashS:cS-dS,cashP:cP-(disc-dS),disc,chq:out};
  /* pl10 (consultant/pl10-duplicate-alarm-national-id.js): option 3 = pct% of the whole plan; o3s below replaces it, but pl10 alone still applies
     while o3s's script is not loaded yet (or if it throws) — exactly as the old layers */
  try { if (pl10O3(r0)) { const C = pl10Cash(r0, o.S, o.P), all = o.S + o.P, cash = pl10Done(r0.id) ? all : C, cS = Math.min(o.S, cash); o = Object.assign({}, o, { cash, cashS: cS, cashP: cash - cS, disc: 0, chq: [] }) } } catch (e) { }
  try{if(pl10O3(r0)){const C=Math.min(o.S,o3sCash(r0,o.S));return Object.assign({},o,{cash:C,cashS:C,cashP:0,disc:0,chq:[]})}}catch(e){}return o}
const BANKS=['ملی','ملت','صادرات','تجارت','سپه','رفاه','کشاورزی','مسکن','پاسارگاد','پارسیان','سامان','اقتصاد نوین','شهر','آینده','دی','سینا','قرض‌الحسنه رسالت','سایر'];
let PC=null;
function openPostConfirm(snap){if(!snap||!snap.id)return;const c=chqFor(snap);PC={id:snap.id,name:(snap.h||{}).name||'',cash:c.cash,cashS:c.cashS,cashP:c.cashP,chq:c.chq,first:(snap.pay||{}).chq1||'',bank:CPS.get('bank',''),rcash:c.cash,printed:false,k:Date.now().toString(36)};
  const s=mkSheet('pcSheet',`<h3>دریافت نقد و چک‌ها · ${esc(PC.name)}</h3><p class="note">${c.disc?`۱۰۰٪ نقد با ${fa(discPct(snap))}٪ تخفیف (${fa(c.disc)} تومان). `:''}نقد مورد انتظار: <b>${fa(c.cash)}</b> تومان${c.chq.length?` · ${fa(c.chq.length)} چک ماهانه به مبلغ ${fa(c.chq.reduce((a,x)=>a+x.amount,0))} تومان`:''}</p>
    <div class="fields"><label class="f">نقد دریافتی امروز (تومان)<input id="pc_cash" inputmode="numeric" value="${fa(c.cash)}" class="price"></label>${c.chq.length?`<label class="f">تاریخ اولین چک<input id="pc_first" inputmode="numeric" placeholder="۱۴۰۵/۰۹/۰۱" value="${esc(PC.first)}"></label><label class="f">بانک<select id="pc_bank">${BANKS.map(b=>`<option${b===PC.bank?' selected':''}>${b}</option>`).join('')}</select></label>`:''}</div>
    <div class="f" style="margin-top:8px"><span>مبلغ نقد با کدام کارتخوان دریافت شد؟</span><div id="pcPos">${posChips('pcpos',PC.via,{cash:1})}</div></div>
    <div id="pcList"></div><div class="msg" id="pcMsg"></div>
    <div class="btns" style="flex-wrap:wrap"><button class="btn" type="button" id="pcSave">ثبت دریافت‌ها در پرونده</button>${c.chq.length?'<button class="btn ghost" type="button" id="pcPrint">🖨 چاپ چک‌ها</button>':''}<button class="btn ghost" type="button" id="pcClose">بعداً</button></div>`);
  pcRender();s.hidden=false;pcPrevLoad();ensurePos().then(()=>{if(PC&&$('pcPos'))$('pcPos').innerHTML=posChips('pcpos',PC.via,{cash:1})})}
/* pcRows: fin2 base + m12 (editable cheque amounts / due dates, kept in PC.m12) */
function pcRows(){const iso=parseJ(PC.first||''),R=PC.chq.map((x,i)=>Object.assign({},x,{due:iso?jAddM(iso,i):'',i}));
  try{const st=m12St();if(!st)return R;if(!st.L)st.L=R.map(x=>({o:x,part:x.part||'s',amount:Number(x.amount)||0,dt:'',man:false}));const iso0=parseJ(PC.first||'');
  return st.L.map((x,i)=>Object.assign({},x.o,{part:x.part,amount:x.amount,due:x.man?(parseJ(x.dt)||''):(iso0?jAddM(iso0,i):''),i}))}catch(e){return R}}
/* pcRender: fin2 base, replaced by id1 (a cheque-number column) + m12 (save-every-cheque: editable amounts / due dates, add / remove cheques, total check) */
function pcRender () { const R = pcRows(), PN = { s: 'جراحی', p: 'پروتز' }; PC.nos = PC.nos || {}; $('pcList').innerHTML = R.length ? `<table class="cqt"><thead><tr><th>#</th><th>بخش</th><th>مبلغ (تومان)</th><th>سررسید</th><th>شماره چک *</th></tr></thead><tbody>${R.map((x, i) => `<tr><td>${fa(i + 1)}</td><td>${PN[x.part]}</td><td><b>${fa(x.amount)}</b></td><td>${x.due ? esc(jDay(x.due)) : '—'}</td><td><input class="id1no" data-pcno="${i}" inputmode="numeric" value="${esc(PC.nos[i] || '')}" aria-label="شماره چک ${fa(i + 1)}"></td></tr>`).join('')}</tbody></table>` : '';
  /* m12 */
  try { const st = m12St(), box = $('pcList'); if (!st || !box) return; const R = pcRows(), tb = box.querySelector('table.cqt');
  if (tb) { const hr = tb.querySelector('thead tr'); if (hr && !hr.querySelector('.m12h')) hr.insertAdjacentHTML('beforeend', '<th class="m12h"></th>');
    tb.querySelectorAll('tbody tr').forEach((tr, i) => { const x = R[i]; if (!x) return; const td = tr.children; if (td[2]) td[2].innerHTML = `<input class="price m12a" data-m12a="${i}" inputmode="numeric" value="${fa(x.amount)}" aria-label="مبلغ چک ${fa(i + 1)}">`;
      if (td[3]) td[3].innerHTML = `<input class="m12d" data-m12d="${i}" inputmode="numeric" placeholder="۱۴۰۵/۰۹/۰۱" value="${x.due ? esc(jDay(x.due)) : esc(st.L[i].dt || '')}" aria-label="سررسید چک ${fa(i + 1)}">`;
      tr.insertAdjacentHTML('beforeend', `<td><button type="button" class="btn sm ghost m12x" data-m12x="${i}" title="حذف این چک">✕</button></td>`) }) }
  if (st.L.length) { try { if (!$('pc_first')) { const f = $('pcSheet').querySelector('.fields'); if (f) f.insertAdjacentHTML('beforeend', `<label class="f">تاریخ اولین چک<input id="pc_first" inputmode="numeric" placeholder="۱۴۰۵/۰۹/۰۱" value="${esc(PC.first || '')}"></label><label class="f">بانک<select id="pc_bank">${BANKS.map(b => `<option${b === PC.bank ? ' selected' : ''}>${b}</option>`).join('')}</select></label>`) }
    if (!$('fin1PcChq') && ROLE !== 'consultant') box.insertAdjacentHTML('beforebegin', `<div id="fin1PcChq">${fin1ChqHTML('pc', PC)}</div>`) } catch (e) { } }
  const parts = [...new Set(st.L.map(x => x.part))]; if (!parts.length) parts.push('s'); const PN = { s: 'جراحی', p: 'پروتز' };
  box.insertAdjacentHTML('beforeend', `<div class="btns m12add">${parts.map(p => `<button type="button" class="btn sm ghost" data-m12add="${p}">+ افزودن چک${parts.length > 1 ? ' ' + PN[p] : ''}</button>`).join('')}</div><div id="m12Sum" class="m12sum"></div>`); m12SumUI() } catch (e) { console.error('m12', e) } }
document.addEventListener('input',e=>{const t=e.target;if(!PC||!t)return;if(t.id==='pc_first'){PC.first=t.value;const pos=t.selectionStart;pcRender();try{t.setSelectionRange(pos,pos)}catch(x){}}else if(t.id==='pc_cash')PC.rcash=num(t.value);else if(t.id==='pc_bank'){PC.bank=t.value;CPS.set('bank',t.value)}});
document.addEventListener('change',e=>{const t=e.target;if(PC&&t&&t.id==='pc_bank'){PC.bank=t.value;CPS.set('bank',t.value)}});
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button');if(!t||!PC)return;
  if(t.id==='pcClose'){$('pcSheet').hidden=true;PC=null;return}
  if(t.id==='pcPrint'){const R=pcRows(),m=$('pcMsg');if(R.some(x=>!x.due)){m.className='msg err';m.textContent='تاریخ اولین چک را بنویسید.';return}if(!CPS.get('to',SET.clinic||'')){m.className='msg err';m.textContent='یک بار از «چاپ چک» در پرونده‌ی بیمار «در وجه» را تنظیم کنید.';return}printHTML(chqDoc(R,'طرح درمان '+PC.name));m.className='msg ok';m.textContent=`${fa(R.length)} چک به پرینتر فرستاده شد.`;PC.printed=true;return}
  if(t.id==='pcSave'){const m=$('pcMsg'),R=pcRows();if(PC.rcash>0&&!PC.via){m.className='msg err';m.textContent='مشخص کنید مبلغ نقد با کدام کارتخوان (یا اسکناس / کارت‌به‌کارت) دریافت شد.';return}if(R.length&&R.some(x=>!x.due)){m.className='msg err';m.textContent='تاریخ اولین چک را بنویسید.';return}
    t.disabled=true;try{let n=0,dn=0;if(PC.rcash>0){const tot=Math.max(1,PC.cashS+PC.cashP),aS=PC.cashP>0?Math.min(PC.rcash,Math.max(0,PC.cashS))/* fix7d B2: surgery first */:PC.rcash,aP=PC.rcash-aS;if(aS>0){const q=await api('payAdd',{id:PC.id,pid:'pc-'+PC.id.slice(0,36)+(PC.again?'-'+PC.k:'')+'-cash-s',pay:{kind:posKind(PC.via),pos:posId(PC.via),acct:PC.via==='xfer'?PC.acct||'':'',part:'s',amount:aS,by:ROLE_LBL[ROLE],note:'نقد روز ثبت نهایی'}});q&&q.dup?dn++:n++}if(aP>0){const q=await api('payAdd',{id:PC.id,pid:'pc-'+PC.id.slice(0,36)+(PC.again?'-'+PC.k:'')+'-cash-p',pay:{kind:posKind(PC.via),pos:posId(PC.via),acct:PC.via==='xfer'?PC.acct||'':'',part:'p',amount:aP,by:ROLE_LBL[ROLE],note:'نقد روز ثبت نهایی (پروتز)'}});q&&q.dup?dn++:n++}}
      for(const x of R){const q=await api('payAdd',{id:PC.id,pid:'cq-'+PC.id.slice(0,36)+'-'+x.part+x.i,pay:{kind:'chq',part:x.part,amount:x.amount,due:x.due,bank:PC.bank||'',ctype:PC.ctype||'',payee:PC.payee||'',by:ROLE_LBL[ROLE],note:'از شرایط پرداخت طرح'}});q&&q.dup?dn++:n++}
      m.className=dn?'msg warn':'msg ok';m.textContent=`${fa(n)} دریافت در پرونده ثبت شد.`+(dn?` ${fa(dn)} مورد قبلاً ثبت شده بود و تکرار نشد.`:'');toast(m.textContent);$('pcSave').disabled=true;if(!R.length){setTimeout(()=>{$('pcSheet').hidden=true;PC=null},800)}}
    catch(err){m.className='msg err';m.textContent=err.message;t.disabled=false}}});
/* unlimited plans: plan n (n>=2) lives in F.sx[n-2]; the first extra plan is still stored as s2 for older code */
function planCopy(S){const n=secFrom(secDoc(S)),B=blankSections();['imp','sub','aox','ovd','crw','pon'].forEach(id=>{if(B[id]){n[id]=B[id]}});return n}
/* pkRender: fin2 base + q7 (the consultant also gets «پذیرش روز جراحی انتخاب می‌کند») */
function pkRender(){const b=$('pkSheet').querySelector('.btns');if(!b)return;const n=F.alt.mode==='full'?(F.sx||[]).length+1:2;let h='';for(let i=1;i<=n;i++)h+=`<button class="btn" data-pick="${i}" type="button">طرح ${fa(i)}</button>`;b.innerHTML=h+'<button class="btn ghost" id="pkClose" type="button">انصراف</button>';
  try{if(ROLE==='consultant'){const b=$('pkSheet').querySelector('.btns');if(b&&!b.querySelector('#q7Later'))b.insertAdjacentHTML('afterbegin','<button class="btn ghost" id="q7Later" type="button">پذیرش روز جراحی انتخاب می‌کند</button>')}}catch(e){}}


