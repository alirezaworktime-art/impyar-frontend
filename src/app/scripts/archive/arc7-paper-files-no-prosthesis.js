/* arc7: paper files — no prosthesis type, one stage list; archive edit opens the paper editor; path bar «مرحله‌ی بعدی» */
const A7_ST=[['sut','منتظر کشیدن بخیه'],['unc','منتظر آنکاوری'],['imprw','منتظر قالب‌گیری'],['lab','مرحله‌ی «ساخت پروتز در لابراتوار»'],['rabt','مرحله‌ی «امتحان اباتمنت»'],['frame','مرحله‌ی «امتحان فریم»'],['jig','مرحله‌ی «تست جیگ»'],['bite','مرحله‌ی «ثبت بایت»'],['tryin','مرحله‌ی «امتحان پروتز»'],['deliv','مرحله‌ی «تحویل پروتز»']];
const A7_TYPE={jig:'aox',bite:'ovd'};
/* the type is chosen for the stage (jig → All-on-X, bite → overdenture, else single/bridge) so the server's path check passes */
/* reopen restores the saved open-flag and stage (arc6 reset them to closed / imprw on every open) */
{const _f=a6From;a6From=function(j){const r=_f.apply(this,arguments);try{const a=(j&&j.data&&j.data.arc)||{};if(a.v6){if(a.open!==undefined)r.open=!!a.open;if(a.stage&&A7_ST.some(x=>x[0]===a.stage))r.stage=a.stage}r.type=A7_TYPE[r.stage]||'fix'}catch(e){}return r}}
document.addEventListener('change',e=>{const i=e.target;if(i&&i.id==='a6Stage'&&A6){A6.type=A7_TYPE[i.value]||'fix'}},true);
{const _s=a6Save;a6Save=function(){try{if(A6)A6.type=A7_TYPE[A6.stage]||'fix'}catch(e){}return _s.apply(this,arguments)}}
/* archive row: paper file → paper editor */
document.addEventListener('click',async e=>{const t=e.target&&e.target.closest&&e.target.closest('button[data-open][data-a7arc]');if(!t||t.disabled)return;e.preventDefault();e.stopImmediatePropagation();
  t.disabled=true;try{const j=await api('get',{id:t.dataset.open},{timeout:12000});if(j&&j.data&&j.data.arc)fxArcOpen(j);else openForm(await fetchRecord(t.dataset.open))}catch(err){alertMsg('باز نشد: '+err.message)}finally{t.disabled=false}},true);
