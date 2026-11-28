/* ---------- fix7d: money (rv4 M3 settle card-to-card, M6 blank cheque count, M7 amount input, W2 refund warning) ---------- */
/* M6: a remainder with an empty cheque count is one cheque everywhere (text, schedule, suggestions) */
const fx7N1=r=>{try{const p=(r&&r.pay)||null;if(!p)return r;const z=v=>v===undefined||v===null||String(v).trim()===''||num(v)===0;if(!z(p.n1)&&!z(p.n3))return r;return Object.assign({},r,{pay:Object.assign({},p,{n1:z(p.n1)?'1':p.n1,n3:z(p.n3)?'1':p.n3})})}catch(e){return r}};
/* (payText gets fx7N1 — merged into prosthesis/calc.js) */
/* (chqFor gets fx7N1 too — merged into fin2.js) */
/* M7: money inputs take digits only (Persian digits and thousand separators are fine) */
const FX7_AMT='#py_amount,#st_amt,#rf_amt,#fx4_rfa,#fx4_wv,#pc_cash,#p_cash,#p_chq1,#p_cs,#p_cp,#p_disc,#ic_total,#ic_pre,#a6Rem,#ae_amt,#cp_amt,#uxAskSh input[data-ak][inputmode="numeric"]';
const FX7_AMT_MSG='فقط رقم بنویسید — بدون اعشار، منفی یا حرف (جداکننده‌ی هزارگان مجاز است).';
const fx7AmtBad=v=>{const s=toEn(String(v==null?'':v)).replace(/[\s,٬،'’‌٬]/g,'');return s!==''&&!/^\d+$/.test(s)};
const fx7IsBad=i=>fx7AmtBad(i.value)||i.dataset.fx7bad==='1';/* an existing formatter may already have removed the minus / dot: the mark stays until the field is edited */
const fx7Mark=(el,bad)=>{el.dataset.fx7bad=bad?'1':'';el.classList.toggle('fx7bad',bad);if(bad)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');let m=el.parentNode&&el.parentNode.querySelector(':scope > .fx7am');if(bad&&!m){m=document.createElement('small');m.className='fx7am';m.setAttribute('role','alert');m.textContent='فقط رقم — بدون اعشار، منفی یا حرف.';el.insertAdjacentElement('afterend',m)}else if(!bad&&m)m.remove()};
document.addEventListener('input',e=>{const t=e.target;if(t&&t.matches&&t.matches(FX7_AMT))fx7Mark(t,fx7AmtBad(t.value))},true);
window.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button.btn');if(!t||t.classList.contains('ghost')||t.classList.contains('chip'))return;
  const c=t.closest('.sheet,form,.card,[role=dialog]');if(!c)return;const bad=[...c.querySelectorAll(FX7_AMT)].find(i=>!i.disabled&&fx7IsBad(i));if(!bad)return;
  e.preventDefault();e.stopImmediatePropagation();fx7Mark(bad,true);try{bad.focus({preventScroll:false})}catch(x){}const m=c.querySelector('#uxAskM');if(m){m.className='msg err';m.textContent=FX7_AMT_MSG}else toast(FX7_AMT_MSG,true)},true);
/* M3: the surgery-difference settlement asks the card-to-card destination too (its render is in stRender, its check in stPays) */
window.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;const d=t.dataset;
  if(d.stacct!==undefined&&ST){ST.acct=fin1Pick(t,'stacct');const m=$('sdMsg');if(m&&/حساب مقصد/.test(m.textContent))m.textContent='';return}
  if(d.stpos!==undefined)setTimeout(()=>{if(ST)fin1Show('stacct',ST.pos==='xfer')},0)},true);
/* W2: deleting / bouncing a payment that a refund relies on asks first */
{const _a=api;api=async function(action,payload={},opt={}){try{return await _a(action,payload,opt)}catch(e){const m=/^FX7RF\|(\d+)\|([\s\S]*)$/.exec((e&&e.message)||'');if(!m||action!=='paySet')throw e;
  if(!(await uxConfirm(m[2],'ادامه',true,'این پرداخت پشتوانه‌ی استرداد است')))throw new Error('تغییری ثبت نشد.');return await _a(action,Object.assign({},payload||{},{rfAck:1}),opt)}}}
/* M7: the payments-tab amount check now lives in pyAdd itself (appointments/events.js) */

