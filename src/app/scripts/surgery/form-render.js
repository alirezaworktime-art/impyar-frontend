/* ---------- form render ---------- */
const pickHTML=(attrs,max,v,lbl)=>`<span class="pick${num(v)?' on':''}" role="button" tabindex="0" data-pick="${esc(lbl||'')}"><span class="pv">${num(v)?fa(num(v)):'—'}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg><select ${attrs} tabindex="-1">${opts(max,v)}</select></span>`;
const opts=(max,v,from=1)=>`<option value="">—</option>`+Array.from({length:max-from+1},(_,i)=>i+from).map(n=>`<option value="${n}" ${String(v)===String(n)?'selected':''}>${fa(n)}</option>`).join('');
const jawLocked=(x,j)=>!!x.cnt&&!!num(AS()[x.id].jc[j]);
const EXG=['imp','aox','ovd'],IMPSECS=EXG;
/* is this jaw (U/L) used by section id in sections S? implant: teeth or total count; All on X / overdenture: the jaw's chip (or, on surgery day, its teeth) */
function jawUseOne(S,id,j){const s=S&&S[id];if(!s)return false;if(id==='imp')return !!(teethSel(s,j)||num((s.jc||{})[j]));const gi=j==='U'?'0':'1';
  return Object.keys(s.sel||{}).some(k=>s.sel[k]&&(isTooth(k)?k[0]===j:k.split(':')[0]===gi))}
const jawChip=(s,j)=>Object.keys(s.sel).some(k=>s.sel[k]&&!isTooth(k)&&k.split(':')[0]===(j==='U'?'0':'1'));
/* name of the other treatment that already holds this jaw (plan and surgery day), or '' */
function xBlock(id,j){if(SURG)return '';const S=AS();if(!S)return '';
  if(id==='crw'){if(S.aox&&jawChip(S.aox,j))return 'All on X';if(S.imp&&teethSel(S.imp,j)+num(S.imp.jc[j])>6)return 'پایه ایمپلنت (فول)';if(S.ext&&num(S.ext.jc[j]))return 'Full EXT'}
  if(id==='aox'&&S.sub&&(teethSel(S.sub,j)||num(S.sub.jc[j])))return SEC.sub.t;
  if(id==='sub'&&S.aox&&jawChip(S.aox,j))return 'All on X';return ''}
function enforceLocks(){if(SURG)return;const c=AS().crw;if(!c)return;let ch=[];['U','L'].forEach(j=>{if(!xBlock('crw',j))return;let x=false;Object.keys(c.sel).forEach(k=>{if(isTooth(k)&&k[0]===j&&c.sel[k]){delete c.sel[k];x=true}});if(num(c.jc[j])){c.jc[j]='';x=true}if(x)ch.push(j==='U'?'بالا':'پایین')});
  if(ch.length)toast('«فقط روکش» فک '+ch.join(' و ')+' پاک شد؛ این فک درمان کامل دارد.')}
function jawBlocked(id,j){const xb=xBlock(id,j);if(xb)return xb;if(!EXG.includes(id))return '';const Ss=SURG?[SURG.s,SURG.plan]:[AS()];if(Ss.some(S=>jawUseOne(S,id,j)))return '';for(const o of EXG){if(o!==id&&Ss.some(S=>jawUseOne(S,o,j)))return SEC[o].t}return ''}
/* exRefresh: base + pl9 (consultant/pl9-implant-pontic-never-same.js: implant / pontic redraw each other; also on surgery day) */
function exRefresh(sid){if(!SURG&&SEC[sid]&&(SEC[sid].cnt||sid==='aox'))reSec(sid);if(EXG.includes(sid))EXG.forEach(o=>{if(o!==sid)reSec(o)});if(!SURG){const D={imp:['crw'],aox:['crw','sub'],ext:['crw'],sub:['aox']}[sid];if(D){enforceLocks();D.forEach(o=>{if(SEC[o])reSec(o)})}}
  try { const o = sid === 'imp' ? 'pon' : sid === 'pon' ? 'imp' : ''; if (o && document.querySelector(`[data-sec="${o}"]`)) reSec(o) } catch (e) { }}
function toothBtn(sid,key,label){const bl=jawBlocked(sid,key[0]),nc=SURG&&(sid==='aox'||sid==='ovd')&&!jawChip(AS()[sid],key[0]);if(bl||nc)return `<button type="button" class="t" data-sid="${sid}" data-k="${key}" aria-pressed="false" disabled title="${bl?'در این فک '+esc(bl)+' انتخاب شده':'اول تعداد پایه‌ی این فک را بزنید'}">${label}</button>`;const lk=jawLocked(SEC[sid]||{},key[0]);const pl=SURG&&SURG.plan[sid]&&SURG.plan[sid].sel[key],hi=SURG&&sid==='imp'&&SURG.imp[key];let h=`<button type="button" class="t${pl?' pl':''}${hi?' hasimp':''}" data-sid="${sid}" data-k="${key}" aria-pressed="${!lk&&!!AS()[sid].sel[key]}"${lk?' disabled title="تعداد کل این فک انتخاب شده"':''}>${label}</button>`;
  /* + pl9 (consultant/pl9-implant-pontic-never-same.js): a tooth is either an implant or a pontic (the disabled button above never changes) */
  try { const o = sid === 'imp' ? 'pon' : sid === 'pon' ? 'imp' : ''; if (o && !/\sdisabled[\s>]/.test(h)) { const S = AS(); if (S && S[o] && S[o].sel && S[o].sel[key] && !(S[sid] && S[sid].sel && S[sid].sel[key])) h = h.replace('<button ', '<button disabled title="' + (o === 'imp' ? 'این دندان پایه‌ی ایمپلنت است' : 'این دندان پونتیک است') + '" ').replace('class="t', 'class="t pl9x') } } catch (e) { } return h}
function jawCntHTML(x,j){if(x.cnt!=='jaw'&&x.cnt!=='jaws')return '';if(SURG&&!(SURG.arc&&x.id==='gbr'))return '';const s=AS()[x.id];
  if(jawBlocked(x.id,j))return `<div class="jcnt"><small>${x.cnt==='jaw'?'Full EXT':'تعداد کل'}</small><span class="pick" style="opacity:.35;cursor:not-allowed">—</span></div>`;
  if(teethSel(s,j))return `<div class="jcnt" title="شماره‌ی دندان انتخاب شده؛ تعداد کل خاموش است"><small>${x.cnt==='jaw'?'Full EXT':'تعداد کل'}</small><span class="pick off" style="opacity:.35;cursor:not-allowed">✕</span></div>`;
  const L=(x.cnt==='jaw'?'Full EXT':'تعداد کل')+' فک '+(j==='U'?'بالا':'پایین');return `<div class="jcnt"><small>${x.cnt==='jaw'?'Full EXT':'تعداد کل'}</small>${pickHTML(`data-jc="${x.id}" data-j="${j}" aria-label="${L}"`,x.jmax,s.jc[j],x.t+'، '+L)}</div>`}
function chartHTML(x){const hc=(x.cnt==='jaw'||x.cnt==='jaws')&&(!SURG||(SURG.arc&&x.id==='gbr'));let h=`<div class="chart"><div class="chart-in${hc?' hascnt':''}" style="--n:${x.n}">`;
  [['U','بالا'],['L','پایین']].forEach(([j,l])=>{let r='',lf='';for(let i=x.n;i>=1;i--)r+=toothBtn(x.id,j+'R'+i,i);for(let i=1;i<=x.n;i++)lf+=toothBtn(x.id,j+'L'+i,i);
    h+=`<div class="jaw"><span class="jlabel">${l}</span><div class="half">${r}</div><span class="mid"></span><div class="half">${lf}</div>${jawCntHTML(x,j)}</div>`});
  if(x.both&&hc){const s=AS()[x.id];h+=`<div class="jaw jboth"><span class="jlabel">مجموع دو فک</span><div class="jcnt"><small>مجموع GBR دو فک</small>${pickHTML(`data-cnt="${x.id}" aria-label="مجموع GBR دو فک"`,28,s.cnt,x.t+'، مجموع دو فک')}</div></div>`}
  return h+'<div class="sides"><span>راست بیمار</span><span>چپ بیمار</span></div></div></div>'}
function lockNote(x){if(SURG||!['crw','sub','aox'].includes(x.id))return '';const L=['U','L'].map(j=>[j,xBlock(x.id,j)]).filter(a=>a[1]);return L.length?`<p class="lockn">🔒 ${L.map(([j,r])=>`فک ${j==='U'?'بالا':'پایین'}: به خاطر «${esc(r)}» قفل است`).join(' · ')}</p>`:''}
function cntHTML(x){const s=AS()[x.id];if(SURG&&x.id==='imp')return '<p class="note">روی شماره‌ی دندان بزنید و برند و سایز فیکسچر را انتخاب کنید.</p>';
  if(x.cnt==='one')return `<div class="fields"><div class="f"><span>تعداد کل (به جای انتخاب تک‌تک دندان‌ها)</span>${pickHTML(`data-cnt="${x.id}"`,x.max,s.cnt,x.t+'، تعداد کل')}</div></div>`;
  return ''}
function chipsHTML(x){return x.groups.map((g,gi)=>{const bl=EXG.includes(x.id)&&g.single?jawBlocked(x.id,gi===0?'U':'L'):'';
  return `<div class="grp">${g.l?`<span>${g.l}${bl?` <small style="color:var(--warn)">(در این فک «${esc(bl)}» انتخاب شده)</small>`:''}</span>`:''}<div class="chips">${g.o.map(o=>{const k=gi+':'+o;return `<button type="button" class="chip" data-sid="${x.id}" data-k="${esc(k)}" data-g="${gi}" ${g.single?'data-single="1"':''} aria-pressed="${!bl&&!!AS()[x.id].sel[k]}"${bl?' disabled':''}>${o}</button>`}).join('')}</div></div>`}).join('')}
/* surgery day: where the All on X / overdenture fixtures went */
function sgChartHTML(x){return `<p class="note">شماره‌ی دندانِ محل هر پایه را بزنید و برند و سایز را ثبت کنید.</p>`+chartHTML(Object.assign({},x,{n:x.sgt,cnt:''}))+`<p class="need" data-need="${x.id}"></p>`}
/* surgery day: plan used «total count»; the teeth have to be picked now */
function needHTML(x){return SURG&&SURG.need&&SURG.need[x.id]?`<p class="need" data-need="${x.id}"></p>`:''}
function needUpd(){if(!SURG)return;document.querySelectorAll('[data-need]').forEach(el=>{const id=el.dataset.need,x=SEC[id],s=SURG.s[id];const parts=[];let ok=true;
  ['U','L'].forEach(j=>{const want=sgWant(id,j);if(!want)return;const got=teethSel(s,j);if(got!==want)ok=false;parts.push(`فک ${j==='U'?'بالا':'پایین'}: ${fa(want)} عدد — زده‌شده ${fa(got)}`)});
  const wb=num(((SURG.need||{})[id]||{}).B);if(wb){const got=teethSel(s);if(got!==wb)ok=false;parts.push(`مجموع دو فک: ${fa(wb)} عدد — زده‌شده ${fa(got)}`)}
  el.hidden=!parts.length;el.classList.toggle('ok',ok);el.textContent=parts.length?(x.sgt?'تعداد پایه‌ها ':'در طرح «تعداد کل» آمده؛ شماره‌ی دندان‌ها را بزنید. ')+parts.join(' · '):''})}
/* how many teeth must be picked on surgery day in jaw j: total count from the plan, or the All on X / overdenture fixture count */
function sgWant(id,j){const x=SEC[id];if(x.sgt){const s=SURG.s[id];return Object.keys(s.sel).filter(k=>s.sel[k]&&!isTooth(k)&&k.split(':')[0]===(j==='U'?'0':'1')).reduce((a,k)=>a+num(k.split(':')[1]),0)}
  return num(((SURG.need||{})[id]||{})[j])}
const IQUADS=[['UR','بالا · راست بیمار'],['UL','بالا · چپ بیمار'],['LR','پایین · راست بیمار'],['LL','پایین · چپ بیمار']];
const QUADS=[['q1','بالا · راست بیمار'],['q2','بالا · چپ بیمار'],['q4','پایین · راست بیمار'],['q3','پایین · چپ بیمار']];
function quadHTML(x){const s=AS()[x.id];return `<div class="quad">${QUADS.map(([k,t])=>`<button type="button" class="qd" data-sid="${x.id}" data-k="${k}" title="${t}" aria-pressed="${!!s.sel[k]}">Q</button>`).join('')}</div><div class="sides quad-sides"><span>راست بیمار</span><span>چپ بیمار</span></div>`}
function itemsHTML(x){const s=AS()[x.id];
  return `<div class="items${x.two?' two':''}${x.three?' three':''}">${x.items.map(it=>`<div class="item-box"><b>${it.l}</b>
    ${it.type==='quad'?`<div class="quad">${IQUADS.map(([q,t])=>`<button type="button" class="qd" data-isid="${x.id}" data-ik="${it.k}:${q}" title="${t}" aria-pressed="${!!s.isel[it.k+':'+q]}">${q}</button>`).join('')}</div><div class="sides quad-sides"><span>راست بیمار</span><span>چپ بیمار</span></div>`+
      (it.qn?`<div class="qcnt">${['UR','UL','LR','LL'].filter(q=>s.isel[it.k+':'+q]).map(q=>`<div class="f"><span>تعداد ${q}</span>${pickHTML(`data-icnt="${x.id}" data-ik="${it.k}:${q}"`,it.qn,s.icnt[it.k+':'+q]||'1',it.l+'، تعداد ناحیه‌ی '+QNAME[q])}</div>`).join('')}</div>`:'')+
      (it.tn&&['UR','UL','LR','LL'].some(q=>s.isel[it.k+':'+q])?`<div class="qtn"><small>شماره‌ی دندان را بزنید</small>${['UR','UL','LR','LL'].filter(q=>s.isel[it.k+':'+q]).map(q=>{const nn=Array.from({length:it.tn},(_,i)=>i+1);if(q[1]==='R')nn.reverse();return `<div class="qtr" data-q="${q}"><b>${q}</b>${nn.map(i=>`<button type="button" class="tq" data-isid="${x.id}" data-ik="${it.k}n:${q}${i}" aria-pressed="${!!s.isel[it.k+'n:'+q+i]}">${i}</button>`).join('')}</div>`}).join('')}</div>`:'')
      :it.type==='chips'?`<div class="chips">${it.o.map(o=>`<button type="button" class="chip" data-isid="${x.id}" data-ik="${esc(it.k+':'+o)}" aria-pressed="${!!s.isel[it.k+':'+o]}"${x.excl&&s.isel[x.excl[it.k+':'+o]]?' disabled':''}>${o}</button>`).join('')}</div>`
      :`<div class="f"><span>تعداد</span>${pickHTML(`data-icnt="${x.id}" data-ik="${it.k}"`,it.max,s.icnt[it.k],x.t+'، '+it.l)}</div>`}
    ${SURG?'':regP(x,it)&&RQD.some(q=>s.isel[it.k+':'+q])?`<div class="qprice">${RQD.filter(q=>s.isel[it.k+':'+q]).map(q=>{const v=s.ip[it.k+'@'+q];return `<label class="f pz">قیمت هر دندان ${q}<small class="dr-only"> (میلیون تومان)</small><input class="price" inputmode="decimal" data-ip="${x.id}" data-ik="${it.k}@${q}" value="${esc(v!==undefined&&v!==''?v:s.ip[it.k])}"></label>`}).join('')}</div>`:`<label class="f pz">قیمت ${it.ul||(it.type==='chips'?'هر طرف':'هر واحد')}${x.id==='surg'?'<small class="dr-only"> (میلیون تومان)</small>':''}<input class="price" inputmode="decimal" data-ip="${x.id}" data-ik="${it.k}" value="${esc(s.ip[it.k])}"></label>`}
    <div class="calc" id="icalc_${x.id}_${it.k}"></div></div>`).join('')}</div>`}
function aoxTypeHTML(x){const s=AS()[x.id],L=!!s.isel['t:long'];return `<div class="grp aot"><span>نوع All on X</span><div class="chips"><button type="button" class="chip" data-aot="" aria-pressed="${!L}">کلاسیک</button><button type="button" class="chip" data-aot="long" aria-pressed="${L}">لانگ</button></div></div>`}
const MXT=[['z','زایگوما','mz'],['t','تریگوئید','mt'],['n','نازال','mn']];
const jawN=(s,j)=>Object.keys(s.sel).filter(k=>s.sel[k]&&!isTooth(k)&&k.split(':')[0]===(j==='U'?'0':'1')).reduce((a,k)=>a+num(k.split(':')[1]),0);
/* aoxMix: base + pl10 (consultant/pl10-duplicate-alarm-national-id.js: All on X lower jaw = Plus only) */
function aoxMix(s,j){if (j === 'L') { const N = jawN(s, j); return { N, z: 0, t: 0, n: 0, p: N } }const N=jawN(s,j),o={N,z:0,t:0,n:0};let left=N;MXT.forEach(([k])=>{const v=Math.min(left,num(s.icnt['mx:'+j+':'+k]));o[k]=v;left-=v});o.p=left;return o}
function aoxCost(s){return ['U','L'].reduce((a,j)=>{const m=aoxMix(s,j);return a+m.p*num(s.ip.cb)+MXT.reduce((b,[k,,pk])=>b+m[k]*num(s.ip[pk]),0)},0)}
function aoxMixTxt(s,j){const m=aoxMix(s,j);if(!m.N)return '';return [m.p?fa(m.p)+' پلاس':''].concat(MXT.map(([k,l])=>m[k]?fa(m[k])+' '+l:'')).filter(Boolean).join('، ')}
/* aoxMixHTML: base + pl10 (consultant/pl10-duplicate-alarm-national-id.js: the lower jaw box shows only Plus and a note; no change for the '' early return) */
function aoxMixHTML(x){const s=AS()[x.id];const J=['U','L'].filter(j=>jawN(s,j));if(!J.length)return '';
  let h=`<div class="mixw">${J.map(j=>{const m=aoxMix(s,j);return `<div class="mix"><b>فک ${j==='U'?'بالا':'پایین'} · ${fa(m.N)} پایه</b><div class="mixr"><span>پلاس</span><span class="mxv">${fa(m.p)}</span></div>${MXT.map(([k,l])=>`<div class="mixr"><span>${l}</span><span class="mxc"><button type="button" class="btn sm ghost" data-mx="${j}:${k}:-1"${m[k]?'':' disabled'} aria-label="کم کردن ${l}">−</button><span class="mxv">${fa(m[k])}</span><button type="button" class="btn sm ghost" data-mx="${j}:${k}:1"${m.p?'':' disabled'} aria-label="افزودن ${l}">+</button></span></div>`).join('')}</div>`}).join('')}<p class="note">هر پایه‌ای که زایگوما، تریگوئید یا نازال نباشد «پلاس» حساب می‌شود.</p></div>`;
  try { const i = h.indexOf('<div class="mix"><b>فک پایین'); if (i >= 0) { const j = h.indexOf('<div class="mix">', i + 5), end = j >= 0 ? j : h.indexOf('<p class="note">', i); const blk = h.slice(i, end), k = blk.indexOf('</div>', blk.indexOf('<div class="mixr">')) + 6; h = h.slice(0, i) + blk.slice(0, k) + '<p class="note pl10lo">فک پایین فقط پایه‌ی پلاس.</p></div>' + h.slice(end) } } catch (e) { } return h}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-mx]');if(!t||t.disabled)return;const [j,k,d]=t.dataset.mx.split(':'),s=AS().aox,m=aoxMix(s,j),v=m[k]+Number(d);if(v<0||(Number(d)>0&&!m.p))return;s.icnt['mx:'+j+':'+k]=String(v);reSec('aox');touch();recalc()});
function aoxHTML(x){const s=AS()[x.id],L=!!s.isel['t:long'];
  if(L)return aoxTypeHTML(x)+`<div class="fields dr"><label class="f full">توضیحات All on X لانگ<input data-aoxn value="${esc(s.ip.ln||'')}" placeholder="مثلاً نوع پایه‌ها، ناحیه، …"></label>
      ${SURG?'':`<label class="f">قیمت پایه‌ها (کل<span class="dr-only">، میلیون تومان</span>)<input class="price mil" inputmode="decimal" data-ip="aox" data-ik="lt" value="${esc(s.ip.lt)}"></label><label class="f">قیمت پروتز روی پایه‌ها (کل<span class="dr-only">، میلیون تومان</span>)<input class="price mil" inputmode="decimal" data-ip="aox" data-ik="lq" value="${esc(s.ip.lq)}"></label>`}</div><div class="calc dr" id="pcalc_aox"></div>`;
  return aoxTypeHTML(x)+(SURG?'':aoxMixHTML(x)+`<div class="fields pz"><label class="f">قیمت هر پایه پلاس<input class="price" inputmode="numeric" data-ip="aox" data-ik="cb" value="${esc(s.ip.cb)}"></label>${MXT.map(([k,l,pk])=>`<label class="f">قیمت هر پایه ${l}<input class="price" inputmode="numeric" data-ip="aox" data-ik="${pk}" value="${esc(s.ip[pk]||'')}"></label>`).join('')}
      <label class="f">پروتز هر پایه (کلاسیک)<input id="pr_aox" class="price" inputmode="numeric" data-pr="aox" value="${esc(s.price)}"></label></div><div class="calc" id="pcalc_aox"></div>`)}
const CTTXT='سی‌تی اسکن صورت و سینوس دو جهت بدون کنتراست';
function cbctHTML(x){const s=AS()[x.id],ct=!!s.isel['m:ct'],sp=!!(s.isel['zx:1']||s.isel['z:1']||s.isel['zs:1']);
  return `<div class="chips"><button type="button" class="chip" data-cmode="" aria-pressed="${!ct}">CBCT</button><button type="button" class="chip" data-cmode="ct" aria-pressed="${ct}">CT scan</button>
    <label class="pwshow" style="margin-inline-start:auto"><input type="checkbox" data-cspec ${sp?'checked':''}> خاص</label></div>`+(ct?`<p class="ctx">${CTTXT}</p>`:'')+
    (sp?`<div class="item-box"><div class="chips"><button type="button" class="chip" data-isid="cbct" data-ik="zs:1" aria-pressed="${!!s.isel['zs:1']}">CBCT ساب‌پریوستئال</button><button type="button" class="chip" data-isid="cbct" data-ik="z:1" aria-pressed="${!!s.isel['z:1']}">CBCT زایگوما، تریگوئید و نازال</button></div></div>`:'')}
function spHTML(x){const s=AS()[x.id],rows=s.sp||[];if(SURG&&!rows.length)return '';const cat=SET.catalog||[];
  const teeth=[];['UR','UL','LR','LL'].forEach(q=>{for(let i=1;i<=7;i++)teeth.push(q+i)});const selT=teeth.filter(k=>s.sel[k]);
  const opt=v=>`<option value="">ناحیه / دندان</option>`+(selT.length?`<optgroup label="دندان‌های انتخاب‌شده">${selT.map(k=>`<option value="${k}" ${v===k?'selected':''}>${esc(toothTxt([k]))}</option>`).join('')}</optgroup>`:'')+
    `<optgroup label="ناحیه">${['UR','UL','LR','LL'].map(q=>`<option value="${q}" ${v===q?'selected':''}>${QNAME[q]}</option>`).join('')}</optgroup><optgroup label="همه‌ی دندان‌ها">${teeth.filter(k=>!s.sel[k]).map(k=>`<option value="${k}" ${v===k?'selected':''}>${esc(toothTxt([k]))}</option>`).join('')}</optgroup>`;
  return `<div class="sp"><div class="sp-h"><b>موارد خاص</b>${SURG?'':`<button type="button" class="btn sm ghost" data-spadd>+ افزودن مورد خاص</button>`}</div>`+
    (rows.length?rows.map((r,i)=>`<div class="sp-row"><select data-sp="${i}" data-spf="k">${opt(r.k)}</select><input data-sp="${i}" data-spf="b" list="spBrands" placeholder="برند و سیستم" value="${esc(r.b)}"><input data-sp="${i}" data-spf="d" class="ltr" inputmode="decimal" placeholder="قطر Ø" value="${esc(r.d)}"><input data-sp="${i}" data-spf="l" class="ltr" inputmode="decimal" placeholder="طول" value="${esc(r.l)}">${SURG?'':`<button type="button" class="btn sm danger" data-spdel="${i}" aria-label="حذف">×</button>`}</div>`).join('')
      :'<p class="note">برای برند، قطر یا طول خاص در یک ناحیه، «افزودن مورد خاص» را بزنید.</p>')+
    `<datalist id="spBrands">${cat.map(c=>`<option value="${esc(c.b+(c.sys?' '+c.sys:''))}">`).join('')}</datalist></div>`}
function priceHTML(x){const s=AS()[x.id];if(SURG)return '';if(x.price==='aox')return '';
  if(x.price==='brandUnit')return `<div class="grp"><span>قیمت هر واحد به تفکیک برند</span><div class="brands">${BRANDS.map(b=>`<label class="f">${b.n}<input id="bp_${x.id}_${b.k}" class="price" inputmode="numeric" data-bp="${x.id}" data-b="${b.k}" value="${esc(s.bp[b.k])}"><small class="q2sum" data-q2s="${x.id}" data-q2b="${b.k}"></small></label>`).join('')}</div></div>`;
  if(x.price==='implantBrand')return '<p class="note">هزینه: تعداد پایه‌ی انتخاب‌شده × تعرفه‌ی پایه ایمپلنت هر برند (از بخش «پایه ایمپلنت»).</p>'+
    (x.prosJaw?`<label class="f">پروتز هر فک (به پارت پروتز اضافه می‌شود)<input id="pr_${x.id}" class="price" inputmode="numeric" data-pr="${x.id}" value="${esc(s.price)}"></label><div class="calc" id="pcalc_${x.id}"></div>`:'');
  if(!x.price||x.price==='items')return '';
  return `<label class="f">${x.price==='unit'?'قیمت '+(x.ul||'هر واحد'):'قیمت'}<input id="pr_${x.id}" class="price" inputmode="numeric" data-pr="${x.id}" value="${esc(s.price)}"></label>`}
const SURGEON=()=>SET.surgeon||'دکتر علویکیا',ASSTS=()=>{const L=(SET.assts&&SET.assts.length?SET.assts:['دکتر صادقی','دکتر اکبرپور','دکتر باصری']);return !L.includes('پزشک کلینیک')?L.concat(['پزشک کلینیک']):L};
const SOLO=['imp','ovd','aox','sub'];
/* asstSel: base + arc5 (archive/arc5-paper-file-each-treatment.js: a paper file gets its date / performer head) + m9 (surgery/no-per-section-assistant-menu.js: no per-section menu on the surgery day) */
function asstSel(x){if (x && m9On(x.id)) return '';if(SURG&&SURG.arc)return arcSecHead(x);if(!SURG)return '';if(SOLO.includes(x.id))return `<span class="sgdoc">جراح: ${esc(SURG.arc?($('sg_by').value.trim()||'—'):SURGEON())}</span>`;if(!SURG.asst)return '';const v=SURG.sa[x.id]||SURG.asst,v2=SURG.sa2[x.id];
  const opts=(cur,lbl)=>ASSTS().map(n=>`<option value="${esc(n)}" ${n===cur?'selected':''}>${lbl}${esc(n)}</option>`).join('');
  return `<span class="sgasw"><select class="sgas" data-sgasst="${x.id}" title="پزشک دستیار این بخش">${opts(v,'دستیار: ')}</select>${v2!==undefined?`<select class="sgas" data-sgasst2="${x.id}" title="دستیار دوم"><option value="">✕ حذف دستیار دوم</option>${opts(v2,'دستیار ۲: ')}</select>`:`<button type="button" class="sgadd" data-sga2="${x.id}" title="افزودن دستیار دوم">+</button>`}</span>`}
function renderAsst(){$('sgAsst').innerHTML=ASSTS().map(n=>`<button type="button" class="chip" data-sgas="${esc(n)}" aria-pressed="${SURG&&SURG.asst===n}">${esc(n)}</button>`).join('')}
function sectionHTML(x){const s=AS()[x.id];
  const tag=x.pros?'<span class="tag p">پروتز</span>':(x.price?'<span class="tag">جراحی</span>':'');const wide=x.kind==='teeth'||(x.kind==='items'&&x.n);
  return `<section class="card" data-sec="${x.id}" data-kind="${x.pros?'pros':x.price?'surg':'info'}"${wide?' data-wide':''}><h2><span class="h2t">${x.t}</span>${SURG?asstSel(x):tag}</h2>${lockNote(x)}${x.kind==='teeth'?chartHTML(x)+(x.groups?chipsHTML(x):'')+cntHTML(x)+needHTML(x):x.kind==='chips'?(x.price==='aox'?'<p class="note">برند ایتالیایی یا کره‌ای.</p>':'')+chipsHTML(x)+(x.price==='aox'?aoxHTML(x):'')+(SURG&&x.sgt?sgChartHTML(x):''):x.kind==='items'?(x.n?chartHTML(x)+cntHTML(x):'')+(x.base&&!SURG?`<label class="f">قیمت جراحی هر واحد<input id="pr_${x.id}" class="price" inputmode="numeric" data-pr="${x.id}" value="${esc(s.price)}"></label><div class="calc" id="bcalc_${x.id}"></div>`:'')+itemsHTML(x):x.kind==='quad'?quadHTML(x)+(x.id==='cbct'?cbctHTML(x):''):''}${x.id==='imp'?spHTML(x):''}
    ${x.text?`<label class="f">${x.text}<input id="tx_${x.id}" data-tx="${x.id}" value="${esc(s.text)}"></label>`:''}
    ${priceHTML(x)}<div class="calc" id="calc_${x.id}"></div></section>`}
function renderForm(){
  if(CUR>=2&&!(CUR===2&&F.alt.mode==='text')&&!(F.alt.mode==='full'&&F.sx&&F.sx[CUR-2]))CUR=1;
  const textOnly=CUR===2&&F.alt.mode==='text';
  const head=CUR>=2?`<section class="card plan2"><h2>طرح درمان پیشنهادی ${fa(CUR)}<button type="button" class="btn sm ghost" id="altDel">حذف این طرح</button></h2>
      ${textOnly?`<label class="f">توضیحات طرح دوم<textarea id="altText" rows="7" placeholder="شرح طرح درمان پیشنهادی دوم…">${esc(F.alt.text)}</textarea></label>`
        :'<p class="note">این طرح از روی طرح ۱ کپی شده و بخش‌های ایمپلنت آن خالی است؛ نوع ایمپلنت یا جایگزین (اوردنچر، All on X، …) را مشخص کنید. در PDF بعد از طرح‌های قبلی می‌آید.</p>'}</section>`:'';
  document.getElementById('sections').innerHTML=head+(textOnly?'':SECTIONS.map(sectionHTML).join(''));
  document.getElementById('totalsCard').hidden=textOnly;
  if(!F.h.doc||F.h.doc==='دکتر سید مجتبی علویکیا')F.h.doc=MAIN_DOC;HDOC_O=F.h.doc!==MAIN_DOC;
  document.querySelectorAll('[data-h]').forEach(i=>i.value=F.h[i.dataset.h]||'');hdocSync();try{pSumRender()}catch(e){}
  ['n1','m2','n3','cs','cp','disc','cash','chq1'].forEach(k=>document.getElementById('p_'+k).value=F.pay[k]||'');
  const en=document.getElementById('editNote');
  if(F.status==='confirmed'||F.status==='modified'){en.hidden=false;en.textContent=`این فرم در ${F.jalali||''} ثبت شده است. اگر چیزی را عوض کنید و دوباره «ثبت نهایی» بزنید، PDF تازه ساخته و دوباره ایمیل می‌شود.`}else en.hidden=true;
  document.getElementById('confirmBtn').textContent=ROLE==='doctor'?'ارسال به مشاور':ROLE==='consultant'&&CF_ON&&!(F.status==='confirmed'||F.status==='modified')?'نتیجه‌ی مشاوره':(F.status==='confirmed'||F.status==='modified')?'تأیید ویرایش و دانلود PDF':'تأیید نهایی و دانلود PDF';
  document.getElementById('payCard').hidden=ROLE==='doctor';
  renderMed('f');const sn=document.getElementById('staffNote');sn.hidden=!F.note;sn.textContent=F.note?'توضیحات پذیرش: '+F.note:'';
  renderPlanSw();recalc()}
function renderPlanSw(){const m=F.alt.mode;
  const N=m==='full'?(F.sx||[]).length:0;
  document.getElementById('planSw').innerHTML=`<button type="button" class="ps" data-plan="1" aria-pressed="${CUR===1}">طرح ۱</button>`+
    (m==='none'?`<button type="button" class="ps add" id="altAdd">+ طرح دوم</button>`:m==='text'?`<button type="button" class="ps" data-plan="2" aria-pressed="${CUR===2}">طرح ۲ (توضیحات)</button>`:Array.from({length:N},(_,i)=>`<button type="button" class="ps" data-plan="${i+2}" aria-pressed="${CUR===i+2}">طرح ${fa(i+2)}</button>`).join('')+((ROLE==='doctor'||ROLE==='consultant')?`<button type="button" class="ps add" id="altAdd">+ طرح دیگر</button>`:''))}
function recalc(){if(SURG)setTimeout(needUpd,0);const pv={s:AS(),brand:F.brand,pay:F.pay};
  SECTIONS.forEach(x=>{const el=document.getElementById('calc_'+x.id);if(!el)return;const s=pv.s[x.id],q=qty(s,x);try{el.closest('.card').classList.toggle('used',!!rowUsed({s:pv.s,brand:'ko',pay:{}},x))}catch(e){}
    if(x.price==='unit'&&q)el.innerHTML=`${fa(q)} ${x.kind==='quad'?'Q':'واحد'} × ${fa(num(s.price))} = <b>${fa(q*num(s.price))}</b>`;
    else if(x.price==='aox'){}
    else if((x.price==='brandUnit'||x.price==='implantBrand')&&q){const rt=rowTotals(pv,x),t=rt.brand;el.innerHTML=`${fa(q)} ${x.price==='implantBrand'?'پایه':'واحد'} · `+BRANDS.map(b=>`${b.n} <b>${fa(t[b.k])}</b>`).join(' · ')+(rt.pros?`<br>روکش روی پایه‌ها (پارت پروتز): ${fa(q)} × ${fa(num(pv.s.crw.price))} = <b>${fa(rt.pros)}</b>`:'')}
    else if(x.kind==='teeth')el.textContent=q?`${fa(q)} واحد`:'';else el.textContent='';
    if(x.price==='aox'){const t=rowTotals(pv,x),L=!!s.isel['t:long'],e3=document.getElementById('pcalc_'+x.id),j=chipSel(s);
      if(L){el.innerHTML='';if(e3)e3.innerHTML=(t.flat||t.pros)?`پایه‌ها <b>${fa(t.flat)}</b> · پروتز <b>${fa(t.pros||0)}</b>`:(q||j?'قیمت لانگ را بنویسید.':'')}
      else{el.innerHTML=q?['U','L'].map(j=>aoxMixTxt(s,j)).filter(Boolean).join(' | ')+` = <b>${fa(t.flat)}</b>`:'';if(e3)e3.innerHTML=j?`پروتز: ${fa(q)} پایه × ${fa(num(s.price))} = <b>${fa(t.pros)}</b>`:''}}
    else if(x.prosJaw){const e3=document.getElementById('pcalc_'+x.id),j=chipSel(s);if(e3)e3.innerHTML=j?`پروتز: ${fa(j)} فک × ${fa(num(s.price))} = <b>${fa(j*num(s.price))}</b>`:''}
    if(x.base){const e4=document.getElementById('bcalc_'+x.id),bq=teethQty(s,x);if(e4)e4.innerHTML=bq?`${fa(bq)} واحد × ${fa(num(s.price))} = <b>${fa(bq*num(s.price))}</b>`:''}
    (x.items||[]).forEach(it=>{const e2=document.getElementById(`icalc_${x.id}_${it.k}`);if(!e2)return;if(regP(x,it)){const P=RQD.filter(q=>itemQ(s,it,q));e2.innerHTML=P.length?P.map(q=>`${q}: ${fa(itemQ(s,it,q))} × ${fa(qPrice(s,it,q))}`).join(' · ')+` = <b>${fa(itemCost(x,s,it))}</b>`:'';return}const iq=itemQty(s,it),u=num(s.ip[it.k]);e2.innerHTML=iq?`${fa(iq)} × ${fa(u)} = <b>${fa(iq*u)}</b>`:''})});
  if(!(CUR===2&&F.alt.mode==='text')){
    const T=totals(pv),b=F.brand,REF=b==='ref',bn=REF?'ارجاع به مشاور':BRANDS.find(x=>x.k===b).n,mn=Math.min(...BRANDS.map(x=>T.surg[x.k])),mx=Math.max(...BRANDS.map(x=>T.surg[x.k])),rng=(a,c)=>a===c?fa(a):fa(a)+' تا '+fa(c);
    document.getElementById('totTitle').textContent=CUR>=2?'جمع کل طرح '+fa(CUR):'جمع کل درمان';
    const NB=needBrand(F);document.querySelector('#totalsCard .note').hidden=!NB;
    document.getElementById('brandTotals').innerHTML=!NB?`<div class="tot ref" style="cursor:default"><small>جمع کل</small><b>${fa(mn+T.pros)}</b><small>نقد: ${fa(cashFor(pv,mn,T.pros))} · برای این طرح انتخاب برند لازم نیست</small></div>`:BRANDS.map(x=>`<button type="button" class="tot" data-brand="${x.k}" aria-pressed="${x.k===b}"><small>${x.n}</small><b>${fa(T.surg[x.k]+T.pros)}</b><small>نقد: ${fa(cashFor(pv,T.surg[x.k],T.pros))}</small></button>`).join('')+`<button type="button" class="tot ref" data-brand="ref" aria-pressed="${REF}"><small>انتخاب برند</small><b>ارجاع به مشاور</b><small>مشاور برند را انتخاب می‌کند</small></button>`;
    const bn2=NB?' · '+bn:'';
    document.getElementById('t_surg').textContent=(REF?rng(mn,mx):fa(T.surg[b]))+bn2;
    document.getElementById('t_pros').textContent=fa(T.pros);
    document.getElementById('t_all').textContent=REF?rng(mn+T.pros,mx+T.pros):fa(T.surg[b]+T.pros);
    document.getElementById('barTotal').textContent=(REF?rng(mn+T.pros,mx+T.pros):fa(T.surg[b]+T.pros))+' تومان';
    document.getElementById('barLbl').textContent=(CUR>=2?'طرح '+fa(CUR)+' · ':'')+'جمع کل'+bn2;
    const pt=payText(pv);document.getElementById('paySurg').textContent=pt.surg;document.getElementById('payPros').textContent=pt.pros}
  try{cashNoteRender()}catch(e){}
  const p=F.pay;document.querySelectorAll('#payOpt .chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.opt===p.opt));$('p_cs').placeholder=fa(p.opt==='1'?30:50);
  document.getElementById('lblN1').hidden=p.opt!=='1';document.getElementById('lblM2').hidden=p.opt!=='2';
  try{localStorage.setItem('implantPlanDraft',JSON.stringify(F))}catch(e){}}
const MAIN_DOC='دکتر علویکیا';/* doc1: name */let HDOC_O=false;
function hdocSync(){const i=$('h_doc');if(!i)return;i.hidden=!HDOC_O;document.querySelectorAll('[data-hdoc]').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.hdoc==='o')===HDOC_O))}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-hdoc]');if(!b)return;HDOC_O=b.dataset.hdoc==='o';F.h.doc=HDOC_O?'':MAIN_DOC;$('h_doc').value=F.h.doc;hdocSync();touch();if(HDOC_O)$('h_doc').focus()});
const touch=()=>{dirty=true;if(F.status==='confirmed')F.status='modified'};

