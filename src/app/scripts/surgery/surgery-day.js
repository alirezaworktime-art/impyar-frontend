/* ---------- surgery day ---------- */
const QNAME={UR:'بالا راست',UL:'بالا چپ',LR:'پایین راست',LL:'پایین چپ'};
const QDN={q1:'بالا راست',q2:'بالا چپ',q3:'پایین چپ',q4:'پایین راست'};
const GRP={'ایرانی':'ir','کره‌ای':'ko','کره ای':'ko','کره اي':'ko','کره':'ko','ایتالیایی':'it','ایتالیا':'it','سوئیسی':'sw','سوییسی':'sw','سوئیس':'sw',ir:'ir',ko:'ko',it:'it',sw:'sw'};
const GRPN={ir:'ایرانی',ko:'کره‌ای',it:'ایتالیایی',sw:'سوئیسی'};
function catToText(c){return (c||[]).map(x=>[GRPN[x.g]||'',x.b,x.sys,(x.d||[]).join(', '),(x.l||[]).join(', '),(x.h||[]).join(', ')].join(' | ').replace(/( \| )+$/,'')).join('\n')}
function catFromText(t){const list=[];const nums=v=>String(v||'').split(/[,،\s]+/).map(x=>toEn(x).replace(/[^\d.×x*]/g,'')).filter(Boolean);let err='';
  String(t||'').split('\n').map(l=>l.trim()).filter(Boolean).forEach((l,i)=>{const f=l.split(/\s*[|｜]\s*/);const g=GRP[(f[0]||'').trim()];
    if(f.length<3){err=err||`سطر ${fa(i+1)}: حداقل «گروه | برند | سیستم» لازم است.`;return}if(!g){err=err||`سطر ${fa(i+1)}: گروه قیمتی باید ایرانی، کره‌ای، ایتالیایی، سوئیسی یا Root باشد.`;return}
    list.push({g,b:f[1].trim(),sys:(f[2]||'').trim(),d:nums(f[3]),l:nums(f[4]),h:String(f[5]||'').split(/[,،]+/).map(x=>toEn(x).trim()).filter(Boolean)})});
  return err?{err}:{list}}
const toothTxt=keys=>{const g={};keys.forEach(k=>{(g[k.slice(0,2)]=g[k.slice(0,2)]||[]).push(Number(k[2]))});return ['UR','UL','LR','LL'].filter(q=>g[q]).map(q=>QNAME[q]+': '+g[q].sort((a,b)=>a-b).map(fa).join('، ')).join(' · ')};
/* one line per used section: what is in it (teeth, counts, options) — used for the plan summary, sessions and the surgery report */
function secDesc(S,x){const s=S[x.id];if(!s)return '';const p=[];const on=Object.keys(s.sel).filter(k=>s.sel[k]);
  const th=on.filter(isTooth);if(th.length)p.push(toothTxt(th));
  if(x.cnt)[['U','فک بالا'],['L','فک پایین']].forEach(([j,l])=>{if(num(s.jc[j]))p.push(`${x.cnt==='jaw'?'Full EXT':'تعداد کل'} ${l}: ${fa(num(s.jc[j]))}`)});if(x.both&&num(s.cnt))p.push(`مجموع دو فک: ${fa(num(s.cnt))}`);
  const ch=on.filter(k=>!isTooth(k));if(ch.length)p.push(ch.map(k=>QDN[k]||(x.groups&&x.groups[k.split(':')[0]]&&x.groups[k.split(':')[0]].l?x.groups[k.split(':')[0]].l+' '+k.split(':')[1]:k.split(':').slice(1).join(':')||k)).join('، '));
  if(x.price==='aox'&&p.length){p.push(s.isel['t:long']?'لانگ':'کلاسیک');if(!s.isel['t:long'])['U','L'].forEach(j=>{const m=aoxMix(s,j);if(m.N&&m.p!==m.N)p.push(`فک ${j==='U'?'بالا':'پایین'}: ${aoxMixTxt(s,j)}`)});if(s.isel['t:long']&&(s.ip.ln||'').trim())p.push('توضیحات: '+s.ip.ln.trim())}
  (s.sp||[]).forEach(r=>{if(r.k||r.b)p.push('مورد خاص '+(r.k?(isTooth(r.k)?toothTxt([r.k]):QNAME[r.k]||r.k):'')+' '+[r.b,r.d?'Ø'+r.d:'',r.l?'L'+r.l:''].filter(Boolean).join(' '))});
  (x.items||[]).forEach(it=>{const q=itemQty(s,it);if(!q)return;if(it.type==='toggle'){p.push(it.l);return}if(it.tn){p.push(`${it.l}: `+Object.keys(s.isel).filter(k=>s.isel[k]&&k.startsWith(it.k+':')).map(k=>{const q=k.split(':')[1],tt=tnTeeth(s,it,q);return tt.length?toothTxt(tt):q}).join('، '));return}if(it.qn){p.push(`${it.l}: `+Object.keys(s.isel).filter(k=>s.isel[k]&&k.startsWith(it.k+':')).map(k=>k.split(':')[1]+' ('+fa(num(s.icnt[k])||1)+' عدد)').join('، '));return}if(it.type==='count')p.push(`${it.l}: ${fa(q)}`);else p.push(`${it.l}: ${Object.keys(s.isel).filter(k=>s.isel[k]&&k.startsWith(it.k+':')).map(k=>k.split(':')[1]).join('، ')}`)});
  if((s.text||'').trim()&&x.text)p.push(`${x.text}: ${s.text.trim()}`);
  if(x.id==='cbct'&&p.length)p.unshift(s.isel['m:ct']?CTTXT:'CBCT');
  return p.join(' — ')}
function secLines(S){return SECTIONS.filter(x=>rowUsed({s:S,brand:'ko',pay:{}},x)).map(x=>({t:x.t,d:secDesc(S,x)||'—'}))}
const impTxt=m=>m?[m.b,m.sys].filter(Boolean).join(' ')+(m.d||m.l?` · ${m.d?'Ø'+m.d:''}${m.d&&m.l?' × ':''}${m.l?'L'+m.l:''}`:'')+(m.ht?` · ${({heal:'اباتمنت',chl:'کاستومایز هیلینگ'}[m.ht]||'کاور')}${m.hs?' '+m.hs:''}`:'')+(m.rs&&m.rs!=='new'?' · '+XL_RS[m.rs]:''):'';
/* what is still left of the plan after the sessions already recorded */
function remainingS(planS,sessions){const R=secFrom(secDoc(planS));const done=(sessions||[]).map(ss=>secFrom(ss.s||{}));
  SECTIONS.forEach(x=>{const r=R[x.id];done.forEach(D=>{const d=D[x.id];
      Object.keys(d.sel).forEach(k=>{if(d.sel[k])delete r.sel[k]});Object.keys(d.isel).forEach(k=>{if(d.isel[k])delete r.isel[k]});
      if(x.cnt)['U','L'].forEach(j=>{const n=num(r.jc[j]);if(n){const left=Math.max(0,n-num(d.jc[j])-teethSel(d,j));r.jc[j]=left?String(left):''}});
      if(x.both&&num(r.cnt)){const left=Math.max(0,num(r.cnt)-num(d.cnt)-Math.max(0,teethSel(d)-num(r.jc.U)-num(r.jc.L)));r.cnt=left?String(left):''}
      Object.keys(d.icnt).forEach(k=>{if(num(r.icnt[k])){const left=Math.max(0,num(r.icnt[k])-num(d.icnt[k]));r.icnt[k]=left?String(left):''}});
      if((d.text||'').trim())r.text=''});
    if(done.length&&x.kind==='none')r.text='';
    (x.items||[]).forEach(it=>{Object.keys(r.isel).forEach(k=>{if(it.tn&&r.isel[k]&&k.startsWith(it.k+'n:'))r.isel[it.k+':'+k.split(':')[1].slice(0,2)]=true});
      if(it.qn)Object.keys(r.icnt).forEach(k=>{if(k.startsWith(it.k+':')&&num(r.icnt[k]))r.isel[k]=true})})});
  return R}
function sessionStart(planS,sessions){const R=remainingS(planS,sessions),need={};
  SECTIONS.forEach(x=>{if(!x.cnt)return;const r=R[x.id];['U','L'].forEach(j=>{const n=num(r.jc[j]);if(n){(need[x.id]=need[x.id]||{})[j]=n}});if(x.both&&num(r.cnt))(need[x.id]=need[x.id]||{}).B=num(r.cnt);r.jc={U:'',L:''};r.cnt=''});
  return {R,need}}
/* actual cost of the recorded sessions: plan tariffs and the patient's brand; each implant priced by its own brand's group */
function surgActual(rec,sessions){const b=effBrand(rec),P=rec.s;let tot=0;
  (sessions||[]).forEach(ss=>{const S=secFrom(ss.s||{});SECTIONS.forEach(x=>{S[x.id].price=P[x.id].price;S[x.id].bp={...P[x.id].bp};S[x.id].ip={...P[x.id].ip}});
    const T=totals({s:S,brand:b,pay:rec.pay});let t=T.surg[b]+T.pros;
    const impRow=rowTotals({s:S,brand:b},SEC.imp).brand[b];let imp=0;const im=ss.imp||{};
    Object.keys(S.imp.sel).filter(k=>S.imp.sel[k]&&isTooth(k)).forEach(k=>{const g=(im[k]&&im[k].g)||b;imp+=num(P.imp.bp[g]||P.imp.bp[b])});
    ['U','L'].forEach(j=>imp+=num(S.imp.jc[j])*num(P.imp.bp[b]));
    tot+=t-impRow+imp});
  return tot}

function openSurg(x){const d=x.data||{};const rec=fromDoc(x.id,d);if(!rec.h.name)Object.assign(rec.h,{name:x.name,nid:x.nid,phone:x.phone,age:x.age});
  const sg=x.surg||{sessions:[]},prev=sg.sessions||[];
  F=blankForm();const st0=sessionStart(rec.s,prev);SURG={id:x.id,rec,prev,plan:rec.s,s:st0.R,need:st0.need,imp:{},sid:uuid(),asst:'',sa:{},sa2:{},st:{},unc:3,uncT:false};
  try{const a=JSON.parse(localStorage.getItem('implantAsst')||'{}');if(a.d===jalali(new Date()).slash&&ASSTS().includes(a.n))SURG.asst=a.n}catch(e){}
  $('sgName').textContent=(rec.h.name||'')+` · جلسه‌ی ${fa(prev.length+1)} جراحی · ${jalali(new Date()).slash}`;
  $('sgMeta').textContent=[rec.h.nid?'کد ملی '+faD(rec.h.nid):'',rec.h.age?'سن '+faD(rec.h.age):'',rec.h.phone?faD(rec.h.phone):'',rec.brand&&rec.brand!=='ref'?'برند طرح: '+BRANDS.find(b=>b.k===rec.brand).n:'',rec.jalali?'تأیید طرح '+rec.jalali:''].filter(Boolean).join(' · ');
  const ms=medShort(rec.med);$('sgMed').hidden=!ms;$('sgMed').textContent=ms?'⚠ '+ms:'';
  $('sgPlan').innerHTML=planViewHTML(rec.s);
  const ph=$('sgPhoto');ph.hidden=true;ph.removeAttribute('src');if(x.photo){ph.src=x.photo;ph.hidden=false}else if(CF_ON)api('get',{id:x.id},{prio:'bg'}).then(j=>{if(j.photo&&SURG&&SURG.id===x.id){ph.src=j.photo;ph.hidden=false}}).catch(()=>{});
  document.querySelectorAll('[data-fu]').forEach(c=>c.checked=true);
  const nd=Object.keys(SURG.need);
  $('sgPrev').innerHTML=nd.length?`<p class="note">این موارد در طرح با «تعداد کل» آمده‌اند؛ امروز شماره‌ی دندان‌ها را بزنید: ${nd.map(id=>esc(SEC[id].t)+' ('+['U','L'].filter(j=>SURG.need[id][j]).map(j=>(j==='U'?'بالا ':'پایین ')+fa(SURG.need[id][j])).concat(SURG.need[id].B?['مجموع دو فک '+fa(SURG.need[id].B)]:[]).join('، ')+')').join('؛ ')}</p>`:'';
  $('dlSgDoc').innerHTML=(SET.docs||[]).map(d=>`<option value="${esc(d)}">`).join('');$('sg_fin').checked=false;if($('sg_tmp'))$('sg_tmp').checked=false;$('sgMsg').textContent='';$('sg_by').value=SURGEON();renderAsst();$('sg_unc').checked=false;$('sgUncM').hidden=true;document.querySelectorAll('[data-unc]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.unc==='3'));
  sgDraftLoad();$('sections').innerHTML='';renderSurg();show('surg');if(CF_ON)pollInv(true);SURG&&(SURG.open=true)}
/* surgery-day draft: kept in this browser until the session is saved, restored on reopen the same day */
const SGDK=id=>'implantSurgDraft:'+id;
function sgDraftSave(){if(!SURG||SURG.arc||!SURG.dirty||$('viewSurg').hidden)return;try{localStorage.setItem(SGDK(SURG.id),JSON.stringify({d:jalali(new Date()).slash,n:SURG.prev.length,s:secDoc(SURG.s),imp:SURG.imp,asst:SURG.asst,sa:SURG.sa,sa2:SURG.sa2,st:SURG.st,unc:SURG.unc,uncT:SURG.uncT,uc:$('sg_unc').checked,off:[...document.querySelectorAll('[data-fu]')].filter(c=>!c.checked).map(c=>c.dataset.fu),by:$('sg_by').value}))}catch(e){}}
function sgDraftLoad(){let dr=null;try{dr=JSON.parse(localStorage.getItem(SGDK(SURG.id))||'null')}catch(e){}
  if(!dr)return;if(dr.d!==jalali(new Date()).slash||dr.n!==SURG.prev.length){try{localStorage.removeItem(SGDK(SURG.id))}catch(e){}return}
  SURG.s=secFrom(dr.s||{});SURG.imp=dr.imp||{};if(dr.asst)SURG.asst=dr.asst;SURG.sa=dr.sa||{};SURG.sa2=dr.sa2||{};SURG.st=dr.st||{};SURG.unc=dr.unc||3;SURG.uncT=!!dr.uncT;SURG.dirty=true;
  if(SURG.uncT){$('sg_unc').checked=!!dr.uc;$('sgUncM').hidden=!dr.uc}document.querySelectorAll('[data-unc]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.unc)===SURG.unc));
  document.querySelectorAll('[data-fu]').forEach(c=>c.checked=c.disabled||!(dr.off||[]).includes(c.dataset.fu));if(dr.by)$('sg_by').value=dr.by;renderAsst();
  toast('کارهای علامت‌خورده‌ی قبلی این جلسه (ذخیره‌نشده) بازیابی شد.')}
setInterval(sgDraftSave,3000);
try{new IntersectionObserver(es=>{$('sgGo').hidden=es[0].isIntersecting}).observe($('sgSave'))}catch(e){}
document.addEventListener('click',e=>{if(SURG&&e.target.closest&&e.target.closest('#viewSurg,#impSheet'))SURG.dirty=true},true);
document.addEventListener('change',e=>{if(SURG&&e.target.closest&&e.target.closest('#viewSurg,#impSheet'))SURG.dirty=true},true);
const SURG_SECS=()=>SECTIONS.filter(x=>(x.price||x.kind!=='none')&&x.id!=='cons'&&!(x.id==='crw'&&SURG&&!SURG.arc));
function renderSurg(){if(!SURG)return;SURG.openSecs=SURG.openSecs||new Set();renderPick();
  $('surgSecs').innerHTML=SURG_SECS().filter(x=>SURG.openSecs.has(x.id)).map(sectionHTML).join('');renderImps()}
/* small treatment picker: open only the tables you need */
function renderPick(){if(!SURG)return;const P=SURG.plan,S=SURG.s,pv={brand:'ko',pay:{}};
  const L=SURG_SECS().filter(x=>!(EXG.includes(x.id)&&jawBlocked(x.id,'U')&&jawBlocked(x.id,'L'))).map(x=>({x,p:rowUsed(Object.assign({s:P},pv),x)}));
  const btn=({x,p})=>{const on=rowUsed(Object.assign({s:S},pv),x);
    return `<button type="button" class="chip sgc${p?' inplan':''}${on?' marked':''}" data-sgsec="${x.id}" aria-pressed="${SURG.openSecs.has(x.id)}">${x.t}${on?' ✓':''}</button>`};
  const AX=o=>o.x.pros||['cbct','anes','fgg'].includes(o.x.id),A=SURG.arc?L.filter(o=>!AX(o)):L.filter(o=>o.p),B=SURG.arc?L.filter(AX):L.filter(o=>!o.p);
  $('sgPick').innerHTML=(SURG.arc?'<span class="sgh">جراحی‌های این جلسه</span>':'<span class="sgh">درمان‌های طرح</span>')+(A.length?A.map(btn).join(''):'<span class="sgh">—</span>');
  $('sgPick2').innerHTML=(SURG.arc?'<span class="sgh">پروتز و سایر</span>':'<span class="sgh">خارج از طرح</span>')+B.map(btn).join('')}
function planViewHTML(S){const pv={s:S,brand:'ko',pay:{}};const used=SECTIONS.filter(x=>rowUsed(pv,x));if(!used.length)return '<p class="note">طرحی ثبت نشده.</p>';
  return used.map(x=>{const st=S[x.id];let mc='';
    if(x.kind==='teeth'||x.n){const row=j=>{let r='';for(let i=x.n;i>=1;i--)r+=`<i class="${st.sel[j+'R'+i]?'on':''}">${i}</i>`;r+='<b></b>';for(let i=1;i<=x.n;i++)r+=`<i class="${st.sel[j+'L'+i]?'on':''}">${i}</i>`;return `<div class="mr">${r}</div>`};
      if(Object.keys(st.sel).some(k=>st.sel[k]&&isTooth(k)))mc=`<div class="mc">${row('U')}${row('L')}</div>`}
    return `<div class="pv-card" data-kind="${x.pros?'pros':'surg'}"><h3>${x.t}</h3>${mc}<p>${esc(secDesc(S,x)||'—')}</p></div>`}).join('')}
/* every fixture of this session: implant, All on X and overdenture teeth */
function impKeys(){return IMPSECS.flatMap(id=>Object.keys(SURG.s[id].sel).filter(k=>SURG.s[id].sel[k]&&isTooth(k)).sort().map(k=>({k,id})))}
function renderImps(){if(!SURG)return;try{renderPick()}catch(e){}const keys=impKeys();
  $('sgImpW').hidden=!keys.length;
  if(!SURG.uncT){const cov=keys.some(({k})=>SURG.imp[k]&&SURG.imp[k].ht==='cover');$('sg_unc').checked=cov;$('sgUncM').hidden=!cov}
  $('sgImps').innerHTML=keys.length?keys.map(({k,id})=>{const m=SURG.imp[k];return `<button type="button" data-impedit="${k}" data-impsid="${id}">${esc(toothTxt([k]))}${id!=='imp'?' ('+esc(SEC[id].t)+')':''} — ${m&&m.b&&m.d&&m.l?esc(impTxt(m)):'<span class="miss">برند و سایز ثبت نشده؛ بزنید</span>'}</button>`}).join(''):'<p class="note">ایمپلنتی برای این جلسه علامت نخورده. در بخش «پایه ایمپلنت»، All on X یا اوردنچر روی شماره‌ی دندان بزنید.</p>';
  IMPSECS.forEach(id=>{const s=SURG.s[id];document.querySelectorAll(`#surgSecs .t[data-sid="${id}"]`).forEach(b=>{b.classList.toggle('hasimp',!!SURG.imp[b.dataset.k]);b.setAttribute('aria-pressed',!!s.sel[b.dataset.k])})});needUpd()}
let IMPK=null,IMPH='',IMPSID='imp';
function catOpts(){return catM().map((c,i)=>`<option value="${i}">${esc(c.b+(c.sys?' · '+c.sys:''))}${GRPN[c.g]?' ('+GRPN[c.g]+')':''}</option>`).join('')}
function impSync(){const ci=$('imp_cat').value,c=catM()[ci];const man=!c;$('impManW').hidden=!man;
  const sel=(S,I,vals,v)=>{const has=c&&vals&&vals.length;S.hidden=!has;I.hidden=!!has;if(has){S.innerHTML='<option value="">—</option>'+vals.map(x=>`<option ${String(v)===String(x)?'selected':''}>${esc(x)}</option>`).join('')+'<option value="__">سایر…</option>';if(v&&!vals.includes(v)){S.value='__';I.hidden=false}}const bx=$(S.id+'C');if(bx){bx.hidden=!has;bx.innerHTML=has?vals.map(x=>`<button type="button" class="chip rc" data-rcs="${S.id}" data-v="${esc(x)}" aria-pressed="${S.value===String(x)}">${esc(x)}</button>`).join('')+`<button type="button" class="chip rc" data-rcs="${S.id}" data-v="__" aria-pressed="${S.value==='__'}" style="font-size:.72rem">سایر</button>`:''}};
  sel($('imp_dS'),$('imp_d'),c&&c.d,$('imp_d').value);const dv=impVal($('imp_dS'),$('imp_d')),LL=catLens(c,dv);if(c&&LL&&$('imp_l').value&&!LL.includes($('imp_l').value))$('imp_l').value='';sel($('imp_lS'),$('imp_l'),LL,$('imp_l').value);sel($('imp_hS'),$('imp_hs'),c&&c.h,$('imp_hs').value);impStock()}
function impStock(){const el=$('impStock');if(!el)return;const ci=$('imp_cat').value,c=catM()[ci];const b=c?c.b:$('imp_b').value,sys=c?c.sys:$('imp_sys').value,d=impVal($('imp_dS'),$('imp_d')),l=impVal($('imp_lS'),$('imp_l'));
  if(!INV.loaded||!b||!d||!l){el.hidden=true;return}const i=INV.items.find(x=>x.kind==='fix'&&sysKey(x.b,x.sys)===sysKey(b,sys)&&nk(x.d)===nk(d)&&nk(x.l)===nk(l));const q=i?Number(i.qty)||0:0;
  el.hidden=false;el.style.color=q>0?'':'var(--bad)';el.textContent=q>0?`موجودی انبار برای این سایز: ${fa(q)} عدد (با ثبت جلسه یکی کم می‌شود)`:'این سایز در انبار موجود نیست؛ با ثبت جلسه موجودی منفی می‌شود و انباردار باخبر می‌شود.'}
function openImp(k,sid){IMPK=k;IMPSID=sid||'imp';const m=Object.assign({},SURG.imp[k]||{});const cat=catM();
  /* default brand: the plan's brand group (All on X is always Italian); the last brand picked in this session if it is in that group */
  if(!m.b){const g=IMPSID==='aox'?(SURG.rec.brand==='ko'?'ko':'it'):(GRPN[SURG.rec.brand]?SURG.rec.brand:'');const lc=cat[SURG.lastCat];
    const plus=g==='it'&&cat.find(c=>sysKey(c.b,c.sys)==='jd|plus');
    if(plus){m.b=plus.b;m.sys=plus.sys}else if(lc&&(!g||lc.g===g)){m.b=lc.b;m.sys=lc.sys}else if(g){const c=cat.find(c=>c.g===g);if(c){m.b=c.b;m.sys=c.sys}else if(!cat.length)m.b=GRPN[g]}}
  $('impTitle').textContent='ایمپلنت · '+toothTxt([k]);$('impMsg').textContent='';
  $('imp_cat').innerHTML=(cat.length?'<option value="">— انتخاب کنید —</option>'+catOpts():'')+'<option value="m">سایر (نوشتن دستی)</option>';
  const ci=cat.findIndex(c=>c.b===m.b&&c.sys===m.sys);$('imp_cat').value=ci>=0?String(ci):(m.b?'m':(cat.length?'':'m'));$('impCatW').hidden=false;
  $('imp_b').value=m.b||'';$('imp_sys').value=m.sys||'';$('imp_d').value=m.d||'';$('imp_l').value=m.l||'';$('imp_hs').value=m.hs||'';IMPH=m.ht!==undefined?m.ht:'cover';IMPRS=XL_RS[m.rs]?m.rs:'new';xlRsBtns();
  document.querySelectorAll('#impSheet [data-ht]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ht===IMPH));
  impSync();$('impDel').hidden=!SURG.s[IMPSID].sel[k];$('impSheet').hidden=false}
function impVal(S,I){return S.hidden||S.value==='__'?toEn(I.value).trim():S.value}
function impSave(){const ci=$('imp_cat').value,c=catM()[ci];
  const m={b:c?c.b:$('imp_b').value.trim(),sys:c?c.sys:$('imp_sys').value.trim(),g:c?c.g:'',d:impVal($('imp_dS'),$('imp_d')),l:impVal($('imp_lS'),$('imp_l')),ht:IMPH,hs:'',rs:IMPRS||'new'};
  if(!m.b){$('impMsg').className='msg err';$('impMsg').textContent='برند را انتخاب کنید.';return}
  if(!m.d||!m.l){$('impMsg').className='msg err';$('impMsg').textContent='قطر و طول فیکسچر را وارد کنید.';return}
  if(c)SURG.lastCat=Number(ci);
  SURG.imp[IMPK]=m;SURG.s[IMPSID].sel[IMPK]=true;$('impSheet').hidden=true;if(IMPSID!=='imp')reSec(IMPSID);renderImps();exRefresh(IMPSID)}
function impDel(){delete SURG.imp[IMPK];SURG.s[IMPSID].sel[IMPK]=false;$('impSheet').hidden=true;if(IMPSID!=='imp')reSec(IMPSID);renderImps();exRefresh(IMPSID)}
/* surgery day: check the session, show it for one review, then save */
let SGP=null;
function surgSave(t){if(!SURG)return;const m=$('sgMsg');m.className='msg err';
  const by=$('sg_by').value.trim();if(!by){m.textContent='نام جراح را بنویسید.';$('sg_by').focus();return}
  const needA=SECTIONS.some(x=>!SOLO.includes(x.id)&&rowUsed({s:SURG.s,brand:'ko',pay:{}},x));
  if(needA&&!SURG.asst){m.textContent='پزشک دستیار امروز را از بالای صفحه انتخاب کنید.';$('sgAsst').scrollIntoView({behavior:'smooth',block:'center'});return}
  const keys=impKeys(),sel=keys.map(o=>o.k);
  const miss=sel.filter(k=>!(SURG.imp[k]&&SURG.imp[k].b&&SURG.imp[k].d&&SURG.imp[k].l));
  if(miss.length){m.textContent='برند و سایز ایمپلنتِ این دندان‌ها ثبت نشده: '+toothTxt(miss);return}
  /* tooth counts: plan «total count» and All on X / overdenture fixtures must match the teeth picked */
  const bad=[];SECTIONS.forEach(x=>{const st=SURG.s[x.id];['U','L'].forEach(j=>{const want=sgWant(x.id,j),got=teethSel(st,j),jl=j==='U'?'فک بالا':'فک پایین';
    if(x.sgt){if(want!==got)bad.push(`${x.t} ${jl}: ${fa(want)} پایه، ولی ${fa(got)} دندان زده شده`)}
    else if(want&&got>want)bad.push(`${x.t} ${jl}: در طرح ${fa(want)} عدد، ولی ${fa(got)} دندان زده شده`)})});
  if(bad.length){m.innerHTML='تعداد دندان‌ها با طرح نمی‌خواند:<br>'+bad.map(esc).join('<br>');return}
  const used=SECTIONS.some(x=>rowUsed({s:SURG.s,brand:'ko',pay:{}},x));
  if(!used&&!(typeof m31OthAny==='function'&&m31OthAny())){m.textContent='هیچ کاری برای این جلسه علامت نخورده. از فهرست‌های کناری درمان انجام‌شده را باز کنید و علامت بزنید.';return}
  m.textContent='';
  const imp={};sel.forEach(k=>imp[k]=SURG.imp[k]);
  const fu=[...document.querySelectorAll('[data-fu]')].filter(c=>c.checked).map(c=>c.dataset.fu);
  const usedX=SECTIONS.filter(x=>rowUsed({s:SURG.s,brand:'ko',pay:{}},x)),sa={},sa2={};usedX.forEach(x=>{if(SOLO.includes(x.id))return;if(SURG.sa[x.id]&&SURG.sa[x.id]!==SURG.asst)sa[x.id]=SURG.sa[x.id];if(SURG.sa2[x.id])sa2[x.id]=SURG.sa2[x.id]});
  const unc=$('sg_unc').checked?SURG.unc:0;
  const ses={fu,n:SURG.prev.length+1,at:new Date().toISOString(),jalali:jalali(new Date()).slash,by,asst:needA?SURG.asst:'',sa,sa2,st:p5St(usedX),unc,tmp:($('sg_tmp')&&$('sg_tmp').checked)?1:0,note:'',s:secDoc(SURG.s),imp};
  const fin=$('sg_fin').checked,all=SURG.prev.concat([ses]);
  const left=fin?secLines(remainingS(SURG.plan,all)):[];
  SGP={ses,fin,all};
  const FUN={numb:'فردا: چک بی‌حسی',week:'یک هفته بعد: چکاپ',suture:'دو هفته بعد: کشیدن بخیه'};
  $('srBody').innerHTML=`<p class="note"><b>${esc(SURG.rec.h.name||'')}</b> · جلسه‌ی ${fa(ses.n)} · ${esc(ses.jalali)} · جراح: ${esc(by)}${needA?' · دستیار: '+esc(SURG.asst):''}</p>`+
    `<h4 style="margin:6px 0 2px">کارهای این جلسه</h4><ul class="rvl">${usedX.map(x=>`<li><b>${esc(x.t)}:</b> ${esc(secDesc(SURG.s,x)||'—')}${SOLO.includes(x.id)?` <i>(جراح: ${esc(by)})</i>`:` <i>(دستیار: ${esc(p5WhoTxt({s:SURG.s,sa,sa2,st:p5St(usedX),asst:SURG.asst,by},x)||[sa[x.id]||SURG.asst,sa2[x.id]].filter(Boolean).join('، '))})</i>`}</li>`).join('')}</ul>`+
    (keys.length?`<h4 style="margin:6px 0 2px">ایمپلنت‌ها (${fa(keys.length)} عدد)</h4><ul class="rvl">${keys.map(({k,id})=>`<li>${esc(toothTxt([k]))}${id!=='imp'?' ('+esc(SEC[id].t)+')':''} — ${esc(impTxt(SURG.imp[k]))}</li>`).join('')}</ul>`:'')+
    `<h4 style="margin:6px 0 2px">پیگیری‌ها</h4><p class="note" style="margin:0">${fu.length||unc?fu.map(k=>FUN[k]).concat(unc?[(unc===4?'چهار':'سه')+' ماه بعد: آنکاوری']:[]).join('، '):'بدون پیگیری'}</p>`+
    (!unc&&keys.some(({k})=>SURG.imp[k].ht==='cover')?`<div class="banner" style="margin-top:6px"><span class="rvbad">ایمپلنت با کاور اسکرو ثبت شده ولی نوبت آنکاوری زده نشده.</span></div>`:'')+
    (fin?`<p class="note" style="margin-top:8px"><b>این آخرین جلسه است؛ درمان جراحی بسته می‌شود.</b></p>`+(left.length?`<div class="banner" style="margin-top:6px"><span class="rvbad">این موارد طرح هنوز انجام نشده:</span><ul class="rvl">${left.map(l=>`<li>${esc(l.t)}: ${esc(l.d)}</li>`).join('')}</ul>اگر عمداً انجام نمی‌شوند تأیید کنید؛ وگرنه «این آخرین جلسه است» را بردارید.</div>`:''):'');
  $('srOk').textContent=fin&&left.length?'با وجود موارد باقی‌مانده، ثبت و پایان جراحی':'تأیید و ثبت جلسه';
  $('srMsg').textContent='';$('sgRev').hidden=false}
async function surgCommit(t){if(!SURG||!SGP)return;const m=$('srMsg');const {ses,fin,all}=SGP;
  const a0=surgActual(SURG.rec,all),actual=(typeof discOn==='function'&&discOn(SURG.rec))?a0-discAmt(SURG.rec,a0):a0,planned=planTotal(SURG.rec);
  t.disabled=true;m.className='msg';m.textContent='در حال ثبت…';
  try{await api('surgSave',{id:SURG.id,session:ses,finish:fin,actual,planned,brand:SURG.rec.brand,sendId:SURG.sid},{timeout:12000,tries:3});
    try{localStorage.removeItem(SGDK(SURG.id))}catch(e){}SURG.dirty=false;
    const RXID=SURG.id,rec=SURG.rec,sg={sessions:all,finished:fin,actual,planned,diff:actual-planned};SGP=null;$('sgRev').hidden=true;
    toast(fin?`جراحی ${rec.h.name} ثبت شد و درمان جراحی به پایان رسید.`:`جلسه‌ی ${fa(all.length)} جراحی ${rec.h.name} ثبت شد.`);
    show('queue');pollQ(true);if(fin){openDone(rec,sg,false);SD.pid=RXID}}
  catch(e){m.className='msg err';m.textContent=e.message}finally{t.disabled=false}}

/* finished surgery: downloads (assistant) and settlement (consultant) */
let SD=null;
function openDone(rec,sg,settle){SD={rec,sg};const d=(sg.actual||0)-(sg.planned||0)-(sg.settledDiff||0);
  $('sdTitle').textContent=(settle?'تسویه‌ی اختلاف · ':'جراحی ثبت شد · ')+(rec.h.name||'');
  const imps=[];(sg.sessions||[]).forEach(ss=>Object.keys(ss.imp||{}).forEach(k=>imps.push(toothTxt([k])+' — '+impTxt(ss.imp[k]))));
  $('sdBody').innerHTML=(settle?`<div class="diffbox">هزینه‌ی اعلام‌شده: <b>${fa(sg.planned||0)}</b> تومان<br>هزینه‌ی کارهای انجام‌شده: <b>${fa(sg.actual||0)}</b> تومان<br>${sg.settledDiff?'قبلاً تسویه‌شده: <b>'+fa(sg.settledDiff)+'</b> تومان<br>':''}${d>0?`بیمار باید <b>${fa(d)}</b> تومان بیشتر بپردازد.`:d<0?`<b>${fa(-d)}</b> تومان کمتر از مبلغ اعلام‌شده است؛ بیمار بستانکار است.`:'اختلافی نیست.'}</div>`+(d>0?stFormHTML(d):d<0?rfFormHTML(-d):''):
      `<p class="note">${fa((sg.sessions||[]).length)} جلسه ثبت شد. ${d?'اختلاف هزینه با طرح برای تسویه به کارتابل مشاور رفت.':''}</p>`)+
    (settle?(sg.sessions||[]).map(ss=>{const ll=secLines(secFrom(ss.s||{}));return `<p class="note"><b>جلسه ${fa(ss.n||0)} · ${esc(ss.jalali||'')}</b><br>${ll.map(l=>esc(l.t+': '+l.d)).join('<br>')}</p>`}).join(''):'')+
    (imps.length?`<p class="note"><b>ایمپلنت‌ها:</b><br>${imps.map(esc).join('<br>')}</p>`:'');
  $('sdSettle').textContent=d>0?'ثبت تسویه':'تأیید تسویه';ST={k:'',d,n:1,first:'',bank:''};stRender();
  $('sdRx').hidden=!!settle||!CF_ON||(ROLE!=='surgery'&&ROLE!=='doctor');$('sdSettle').hidden=!settle;$('sdNoteW').hidden=!settle;$('sd_note').value='';$('sdMsg').textContent='';$('sgDone').hidden=false}
function openSettle(x){const rec=fromDoc(x.id,x.data||{});if(!rec.h.name)rec.h.name=x.name;openDone(rec,x.surg||{},true)}
async function surgRecord(id){const j=await api('get',{id});const r=fromDoc(id,j.data||{});['status','jalali'].forEach(k=>{if(j[k])r[k]=j[k]});return {r,sg:j.surg||{sessions:[]},settle:j.settle}}

/* PDFs: surgery report and the patient's implant card */
async function docPDF(r,meta,blocks,withMed){
  try{await Promise.race([logoReady,new Promise(z=>setTimeout(z,1500))])}catch(e){}
  try{await Promise.race([Promise.all([document.fonts.load(`400 20px Vazirmatn`),document.fonts.load(`800 20px Vazirmatn`)]),new Promise(z=>setTimeout(z,1500))])}catch(e){}
  const pages=[];let pg,y;const bottom=PH-M-36;
  const start=first=>{const cv=document.createElement('canvas');cv.width=PW;cv.height=PH;const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,PW,PH);pg={cv,cx};pages.push(pg);y=M;
    const hb=first?headerBlock(r,meta):miniHeader(r,meta);hb.draw(cx,y);y+=hb.h};
  start(true);if(withMed){const mb=medBlock(r);mb.draw(pg.cx,y);y+=mb.h}
  blocks.forEach(b=>{if(y+b.h>bottom)start(false);b.draw(pg.cx,y);y+=b.h});
  pages.forEach((p,i)=>T(p.cx,`صفحه ${fa(i+1)} از ${fa(pages.length)}`,PW/2,PH-M+6,{s:16,c:GREY,a:'center'}));
  const urls=pages.map(p=>p.cv.toDataURL('image/jpeg',0.82));const bytes=jpegPDF(urls.map(u=>({jpg:dataUrlBytes(u),w:PW,h:PH})));
  return new Blob([bytes],{type:'application/pdf'})}
function impTable(rows,cols0){const rh=44,cols=cols0||[['دندان',0.22],['برند و سیستم',0.34],['قطر × طول',0.2],['کاور / هیلینگ',0.24]],W=C.R-C.L,h=rh*(rows.length+1)+16;
  return {h,draw(cx,top){let x=C.R;box(cx,C.L,top,W,rh,'#e6e6e6',RULE,1.2);
    cols.forEach(([t,f])=>{T(cx,t,x-12,top+rh/2,{s:18,w:800});x-=W*f});
    rows.forEach((rw,i)=>{const yy=top+rh*(i+1);box(cx,C.L,yy,W,rh,i%2?FAINT:null,'#bbb',1);let xx=C.R;rw.forEach((v,ci)=>{const w=W*cols[ci][1];let fs=19;while(Wd(cx,v,{s:fs})>w-20&&fs>12)fs--;T(cx,v,xx-12,yy+rh/2,{s:fs});xx-=w})})}}}
const impRows=im=>Object.keys(im||{}).sort().map(k=>{const m=im[k];return [toothTxt([k]),[m.b,m.sys].filter(Boolean).join(' '),(m.d?'Ø'+m.d:'')+(m.d&&m.l?' × ':'')+(m.l?m.l:''),m.ht?(({heal:'اباتمنت',chl:'کاستومایز هیلینگ'}[m.ht]||'کاور'))+(m.hs?' '+m.hs:''):'—']});
/* surgBlocks: base + m31 (other treatments of every session) */
function surgBlocks(sg){const blocks=[];
  (sg.sessions||[]).forEach(ss=>{blocks.push(bigTitle(`جلسه‌ی ${fa(ss.n||0)} جراحی — ${ss.jalali||jd(ss.at||ss.savedAt)||''}`));
    const S0=secFrom(ss.s||{}),ll=SECTIONS.filter(x=>rowUsed({s:S0,brand:'ko',pay:{}},x)).map(x=>{const who=SOLO.includes(x.id)?(ss.by||SURGEON()):((ss.sa||{})[x.id]||ss.asst||ss.by||'');const w2=(ss.sa2||{})[x.id];return [x.t,secDesc(S0,x)||'—',(SOLO.includes(x.id)?'':p5WhoTxt(Object.assign({},ss,{s:S0}),x))||who+(w2?' و '+w2:'')]});
    blocks.push(textBlock('کارهای انجام‌شده',[]));blocks.push(impTable(ll.length?ll:[['—','—','—']],[['کار',0.3],['شرح',0.4],['پزشک انجام‌دهنده',0.3]]));
    const rows=impRows(ss.imp);if(rows.length){blocks.push(textBlock('ایمپلنت‌ها',[]));blocks.push(impTable(rows))}
    const o=[];if(ss.note)o.push('توضیحات: '+ss.note);if(ss.by)o.push('جراح: '+ss.by);if(ss.asst)o.push('دستیار: '+ss.asst);Object.keys(ss.sa||{}).forEach(id=>{if(SEC[id])o.push('دستیار '+SEC[id].t+': '+ss.sa[id])});Object.keys(ss.sa2||{}).forEach(id=>{if(SEC[id])o.push('دستیار دوم '+SEC[id].t+': '+ss.sa2[id])});Object.keys(ss.st||{}).forEach(id=>{if(SEC[id])o.push('تفکیک '+SEC[id].t+': '+p5WhoTxt(Object.assign({},ss,{s:S0}),SEC[id]))});if(o.length)blocks.push(textBlock('',o))});
  if(sg.finished)blocks.push(textBlock('',['درمان جراحی به پایان رسید.']));
  /* m31: «سایر درمان‌ها» of every session */
  try{const L=[];((sg||{}).sessions||[]).forEach(ss=>(Array.isArray(ss.oth)?ss.oth:[]).forEach(o=>L.push(`جلسه‌ی ${fa(ss.n||0)}: ${o.t}${o.amt?' — '+fa(o.amt)+' تومان':''}`)));if(L.length&&Array.isArray(blocks))blocks.push(textBlock('سایر درمان‌ها',L))}catch(e){}
  return blocks}
async function surgReportPDF(r,sg){const blocks=surgBlocks(sg);
  blocks.push(signBlock());
  return docPDF(r,{title:'گزارش جراحی ایمپلنت',dateLine:'تاریخ آخرین جلسه: '+(((sg.sessions||[]).slice(-1)[0]||{}).jalali||'')},blocks,true)}
async function implantCardPDF(r,sg){const rows=[];(sg.sessions||[]).forEach(ss=>impRows(ss.imp).forEach(rw=>rows.push(rw)));
  const blocks=[textBlock('ایمپلنت‌های کاشته‌شده',rows.length?[]:['ایمپلنتی ثبت نشده است.'])];if(rows.length)blocks.push(impTable(rows));
  blocks.push(textBlock('',['تاریخ جلسه‌ها: '+(sg.sessions||[]).map(ss=>ss.jalali).filter(Boolean).join('، '),'این کارت را نگه دارید و در هر مراجعه به دندانپزشک همراه داشته باشید.']));
  return docPDF(r,{title:'کارت ایمپلنت بیمار',dateLine:'کلینیک: '+(SET.clinic||'')},blocks,false)}
async function surgDownload(kind,r,sg){const b=kind==='card'?await implantCardPDF(r,sg):await surgReportPDF(r,sg);downloadBlob(b,safeName(r.h.name||'بیمار')+(kind==='card'?' - کارت ایمپلنت.pdf':' - گزارش جراحی.pdf'))}

document.addEventListener('click',e=>{if(SURG&&e.target.closest&&e.target.closest('#surgSecs'))setTimeout(renderPick,0)});
document.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;
  if(t.dataset.sgsec){const id=t.dataset.sgsec;if(SURG.openSecs.has(id))SURG.openSecs.delete(id);else SURG.openSecs=new Set([id]);renderSurg();if(SURG.openSecs.has(id)){const el=document.querySelector(`#surgSecs [data-sec="${id}"]`);if(el)el.scrollIntoView({behavior:'smooth',block:'nearest'})}return}
  if(t.dataset.impedit){openImp(t.dataset.impedit,t.dataset.impsid);return}
  if(t.dataset.sgas&&SURG){SURG.asst=t.dataset.sgas;try{localStorage.setItem('implantAsst',JSON.stringify({d:jalali(new Date()).slash,n:SURG.asst}))}catch(e){}renderAsst();renderSurg();return}
  if(t.dataset.sga2&&SURG){const id=t.dataset.sga2;SURG.sa2[id]=ASSTS().find(n=>n!==(SURG.sa[id]||SURG.asst))||ASSTS()[0];reSec(id);return}
  if(t.dataset.unc&&SURG){SURG.unc=Number(t.dataset.unc);document.querySelectorAll('[data-unc]').forEach(b=>b.setAttribute('aria-pressed',b===t));return}
  if(t.dataset.rcs){const S=$(t.dataset.rcs);S.value=t.dataset.v;S.dispatchEvent(new Event('change',{bubbles:true}));t.parentNode.querySelectorAll('.rc').forEach(b=>b.setAttribute('aria-pressed',b===t));return}
  if(t.id==='srOk'){surgCommit(t);return}if(t.id==='srBack'){$('sgRev').hidden=true;return}
  if(t.dataset.rs){IMPRS=t.dataset.rs;xlRsBtns();return}if(t.dataset.ht){IMPH=IMPH===t.dataset.ht?'':t.dataset.ht;document.querySelectorAll('#impSheet [data-ht]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ht===IMPH));return}
  if(t.id==='impOk'){impSave();return}if(t.id==='impDel'){impDel();return}if(t.id==='impClose'){$('impSheet').hidden=true;return}
  if(t.id==='sgSave'||t.id==='sgGo'){surgSave(t);if($('sgRev').hidden&&$('sgMsg').textContent)$('sgMsg').scrollIntoView({behavior:'smooth',block:'center'});return}if(t.id==='sgBack'){show('queue');return}
  if(t.id==='sdClose'){$('sgDone').hidden=true;return}
  if(t.id==='sdRep'||t.id==='sdCard'){if(!SD)return;t.disabled=true;try{await surgDownload(t.id==='sdCard'?'card':'rep',SD.rec,SD.sg)}catch(err){$('sdMsg').className='msg err';$('sdMsg').textContent=err.message}finally{t.disabled=false}return}
  if(t.id==='sdSettle'){if(!SD)return;t.disabled=true;try{const pays=stPays();if(pays===null)return;const rf=stRefund();if(rf===false)return;await api('settleDone',{id:SD.rec.id,refund:rf,note:$('sd_note').value.trim(),pays,by:ROLE==='staff'?(($('rc_asst')||{}).value||ROLE_LBL[ROLE]):ROLE_LBL[ROLE]});$('sgDone').hidden=true;toast('تسویه ثبت شد'+(pays.length?' و پرداخت در پرونده نشست.':'.'));if(PF&&!$('pfSheet').hidden)refreshFile();pollQ(true);if(!$('viewList').hidden)loadList()}catch(err){$('sdMsg').className='msg err';$('sdMsg').textContent=err.message}finally{t.disabled=false}return}
  if(t.dataset.tosurg){t.disabled=true;try{await api('toSurgery',{id:t.dataset.tosurg});toast('به کارتابل جراحی فرستاده شد.');loadList();pollQ(true)}catch(err){toast(err.message)}finally{t.disabled=false}return}
  if(t.dataset.srep||t.dataset.scard||t.dataset.settle){const id=t.dataset.srep||t.dataset.scard||t.dataset.settle;t.disabled=true;
    try{const o=await surgRecord(id);if(t.dataset.settle)openDone(o.r,o.sg,true);else await surgDownload(t.dataset.scard?'card':'rep',o.r,o.sg)}catch(err){alertMsg(err.message)}finally{t.disabled=false}return}});
document.addEventListener('change',e=>{if(SURG&&e.target.dataset&&e.target.dataset.sgasst2){const id=e.target.dataset.sgasst2;if(!e.target.value)delete SURG.sa2[id];else SURG.sa2[id]=e.target.value;if(!e.target.value)reSec(id);return}
  if(SURG&&e.target.dataset&&e.target.dataset.sgasst){const id=e.target.dataset.sgasst;if(e.target.value===SURG.asst)delete SURG.sa[id];else SURG.sa[id]=e.target.value;return}
  if(SURG&&e.target.id==='sg_unc'){SURG.uncT=true;$('sgUncM').hidden=!e.target.checked;return}});
document.addEventListener('change',e=>{if(e.target.id==='imp_dS'&&e.target.value!=='__')setTimeout(impSync,0);if(e.target.id==='in_dS'&&e.target.value!=='__')setTimeout(invNewSync,0)});
document.addEventListener('change',e=>{if(['imp_dS','imp_lS'].includes(e.target.id))impStock();if(e.target.id==='imp_cat'){impSync();return}
  if(['imp_dS','imp_lS','imp_hS'].includes(e.target.id)){const I=$(e.target.id.replace('S','').replace('imp_h','imp_hs'));if(e.target.value==='__'){I.hidden=false;I.value='';I.focus()}else{I.hidden=true;I.value=e.target.value}}});

