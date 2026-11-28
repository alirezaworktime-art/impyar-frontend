/* ---------- pa9: «خرید و بهای انبار» in the storekeeper's cartable ---------- */
const I9={tab:'buy',from:null,to:null,res:{}};
const i9On=()=>ROLE==='inventory';
function i9Rng(){if(!I9.from){const td=tDay();I9.to=td;I9.from=dAdd(td,-30)}return {from:I9.from,to:I9.to}}
function i9T(cols,rows,sum){if(!rows.length)return '<div class="empty">موردی در این بازه نیست.</div>';
  const S={};(sum||[]).forEach(k=>S[k]=rows.reduce((a,r)=>a+(Number(r[k])||0),0));
  return `<div class="ftsc"><table class="tbl ftbl"><thead><tr>${cols.map(c=>`<th>${esc(c.l)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td${c.m?' class="num"':''}>${c.m?fa(Number(r[c.k])||0):c.d?esc(jDay(r[c.k])):esc(r[c.k]==null?'':String(r[c.k]))}</td>`).join('')}</tr>`).join('')}</tbody>${sum?`<tfoot><tr>${cols.map((c,i)=>`<td${c.m?' class="num"':''}><b>${i===0?'جمع':S[c.k]!==undefined?fa(S[c.k]):''}</b></td>`).join('')}</tr></tfoot>`:''}</table></div>`}
async function i9View(B,force){const T=[['buy','خریدها و تأمین‌کنندگان'],['cost','بهای مصرف هر بیمار'],['items','بهای اقلام انبار']],r=i9Rng();
  B.innerHTML=`<div data-i2view="ifin"><div class="seg" role="group" aria-label="خرید و بها">${T.map(([k,l])=>`<button type="button" data-i9tab="${k}" aria-pressed="${I9.tab===k}">${l}</button>`).join('')}</div>
    ${I9.tab!=='items'?`<div class="fields i9per"><label class="f">از<input id="i9From" inputmode="numeric" value="${esc(jDay(r.from))}"></label><label class="f">تا<input id="i9To" inputmode="numeric" value="${esc(jDay(r.to))}"></label><div class="btns"><button class="btn sm" type="button" id="i9Go">نمایش</button></div></div>`:''}
    <div class="msg" id="i9Msg"></div><div id="i9Out"><div class="empty">در حال بارگذاری…</div></div></div>`;
  await i9Load()}
async function i9Load(){const O=$('i9Out');if(!O)return;const r=i9Rng();
  try{if(I9.tab==='buy'){const j=await api('invFin',{op:'buy',from:r.from,to:r.to});
      O.innerHTML=`<section class="card"><h3>خریدهای ثبت‌شده در حسابداری</h3>${i9T([{k:'no',l:'سند'},{k:'day',l:'تاریخ',d:1},{k:'pname',l:'تأمین‌کننده'},{k:'desc',l:'شرح / فاکتور'},{k:'amount',l:'مبلغ',m:1}],j.buys,['amount'])}</section>
        <section class="card"><h3>مانده‌ی تأمین‌کنندگان (تا امروز)</h3>${i9T([{k:'pname',l:'تأمین‌کننده'},{k:'buy',l:'خرید',m:1},{k:'paid',l:'پرداخت',m:1},{k:'owe',l:'بدهی ما',m:1},{k:'last',l:'آخرین گردش',d:1}],j.vendors,['buy','paid','owe'])}</section>`}
    else if(I9.tab==='cost'){const j=await api('invFin',{op:'cost',from:r.from,to:r.to});
      O.innerHTML=`<p class="note">مصرف انبار هر بیمار × «بهای اقلام انبار».</p><section class="card">${i9T([{k:'name',l:'بیمار'},{k:'docs',l:'پزشکان'},{k:'imp',l:'ایمپلنت و قطعات (بهای مصرف)',m:1}],j.rows,['imp'])}</section>`}
    else{const j=await api('invFin',{op:'items'}),KN={fix:'فیکسچر',heal:'هیلینگ',cover:'کاور',abut:'اباتمنت',other:'سایر'};
      const R=j.kinds.map(x=>{const k=x.kind+':'+(x.b||'');return {k,l:(KN[x.kind]||x.kind)+' '+(x.b||''),c:(j.costs.find(c=>c.k===k)||{}).cost||0}});
      O.innerHTML=`<p class="note">بهای خرید هر واحد؛ در گزارش «بهای مصرف هر بیمار» و «سود هر بیمار» حسابداری به کار می‌رود.</p><div class="ftsc"><table class="tbl ftbl"><thead><tr><th>قلم</th><th>بهای هر واحد (تومان)</th></tr></thead><tbody>${R.map(r=>`<tr><td>${esc(r.l)}</td><td><input class="mny" inputmode="numeric" data-i9cost="${esc(r.k)}" value="${r.c?fa(r.c):''}"></td></tr>`).join('')||'<tr><td colspan="2" class="empty">اقلام انبار هنوز ثبت نشده.</td></tr>'}</tbody></table></div>${R.length?'<div class="btns"><button class="btn" type="button" id="i9Save">ذخیره</button></div>':''}`}
  }catch(e){O.innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('[data-i9tab],#i9Go,#i9Save');if(!t||!i9On())return;const m=$('i9Msg');
  if(t.dataset.i9tab){I9.tab=t.dataset.i9tab;i9View($('invBody'),true);return}
  if(t.id==='i9Go'){const f=parseJ(($('i9From').value||'').trim()),to=parseJ(($('i9To').value||'').trim());if(!f||!to||f>to){if(m){m.className='msg err';m.textContent='تاریخ را درست بنویسید (مثل ۱۴۰۵/۰۸/۰۱).'}return}I9.from=f;I9.to=to;if(m){m.className='msg';m.textContent=''}await i9Load();return}
  if(t.id==='i9Save'){const rows=[...document.querySelectorAll('[data-i9cost]')].map(i=>({k:i.dataset.i9cost,cost:mvv(i.value)}));t.disabled=true;try{const j=await api('invFin',{op:'costSave',rows});if(m){m.className='msg ok';m.textContent='بهای '+fa(j.n)+' قلم ذخیره شد.'}toast('ذخیره شد.')}catch(err){if(m){m.className='msg err';m.textContent=err.message}}finally{t.disabled=false}}});

