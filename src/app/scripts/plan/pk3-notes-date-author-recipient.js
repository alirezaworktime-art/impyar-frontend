
/* ---------- pk3: (1) notes (date · author · recipient) on every stage screen — reception edit sheet, plan form (doctor / consultant), surgery day,
   prosthesis session, the patient file and the lab's order card; each screen shows «+ توضیح» with the stage preset and the notes addressed to this login first.
   (2) patient images carry a stage + teeth tag (stored in the file's note as [st=…;t=…]), with a stage filter in «تصاویر». ---------- */
var PK3={cache:{},tag:{st:'',t:[]},filt:''};
const PK3_TO={doctor:['plan'],surgery:['surg','unc','pros'],consultant:['cons'],staff:['staff'],lab:['lab']};
const PK3_STAGE={doctor:'plan',consultant:'cons',surgery:'surg',staff:'reg',lab:'lab'};
if(typeof FXW!=='undefined')FXW.lab=1;
const pk3Tos=n=>{try{return JSON.parse(n.tos||'[]')}catch(e){return []}};
const pk3Mine=n=>{const T=PK3_TO[ROLE]||[];return pk3Tos(n).some(k=>T.includes(k))};
async function pk3Notes(plan,force){const c=PK3.cache[plan];if(!force&&c&&Date.now()-c.at<45000)return c.n;try{const r=await api('fxNote',{op:'list',id:plan},{prio:'bg',timeout:12000});const n=(r.notes||[]).slice();PK3.cache[plan]={n,at:Date.now(),stage:r.stage||''};return n}catch(e){return c?c.n:[]}}
function pk3Item(n,mine){let h=ntItem(n).replace('<div class="fxn">',`<div class="fxn${mine?' pk3mine':''}">`).split('data-fxnedit=').join('data-pk3ed=');if(ROLE==='lab'&&n.role!=='lab')h=h.replace(/<button class="btn sm ghost" type="button" data-pk3ed="[^"]*">ویرایش<\/button>/,'');return h}
function pk3Panel(plan,stage,o={}){if(!plan)return '';const can=typeof FXW!=='undefined'&&FXW[ROLE];
  return `<section class="pk3n" data-pk3plan="${esc(plan)}" data-pk3st="${esc(stage||'')}"><div class="pk3h"><b>توضیح‌ها${o.lab?' برای لابراتوار':''}</b><small class="note" data-pk3n></small>${can?`<button class="btn sm" type="button" data-pk3add="${esc(plan)}" data-pk3n2="${esc(o.name||'')}">+ توضیح</button>`:''}</div><div class="pk3l" data-pk3l><p class="note">در حال خواندن…</p></div></section>`}
async function pk3Fill(sec,force){const plan=sec.dataset.pk3plan;if(!plan)return;let N=await pk3Notes(plan,force);if(ROLE==='lab')N=N.filter(n=>pk3Mine(n)||n.role==='lab');if(!sec.isConnected)return;const box=sec.querySelector('[data-pk3l]'),cnt=sec.querySelector('[data-pk3n]');
  const mine=N.filter(pk3Mine).reverse(),rest=N.filter(n=>!pk3Mine(n)).reverse(),open=sec.dataset.pk3open==='1',show=open?rest:rest.slice(0,2);
  if(cnt)cnt.textContent=N.length?`${fa(N.length)} توضیح${mine.length?' · '+fa(mine.length)+' برای شما':''}`:'';
  box.innerHTML=(mine.length?`<div class="pk3mh">برای شما</div>`+mine.map(n=>pk3Item(n,true)).join(''):'')+(show.length?(mine.length?'<div class="pk3mh">سایر</div>':'')+show.map(n=>pk3Item(n,false)).join(''):'')+(rest.length>2&&!open?`<button class="btn ghost sm" type="button" data-pk3more="1" style="width:100%">نمایش همه‌ی توضیح‌ها (${fa(N.length)})</button>`:'')+(!N.length?'<p class="note">هنوز توضیحی ثبت نشده.</p>':'')}
function pk3Mount(host,plan,stage,o={},where){if(!host||!plan)return;const old=host.querySelector(':scope > .pk3n, :scope .pk3n[data-pk3plan]');if(old&&old.dataset.pk3plan===plan){old.dataset.pk3st=stage||old.dataset.pk3st;pk3Fill(old);return}if(old)old.remove();host.insertAdjacentHTML(where||'afterbegin',pk3Panel(plan,stage,o));const s=host.querySelector('.pk3n[data-pk3plan]');if(s)pk3Fill(s)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pk3add],[data-pk3more],[data-pk3ed]');if(!t)return;e.preventDefault();e.stopPropagation();const sec=t.closest('.pk3n');
  if(t.dataset.pk3more){sec.dataset.pk3open='1';pk3Fill(sec);return}
  if(t.dataset.pk3ed){const c=PK3.cache[sec.dataset.pk3plan];const n=c&&c.n.find(x=>x.id===t.dataset.pk3ed);if(n)ntOpen(sec.dataset.pk3plan,{note:n});return}
  ntOpen(t.dataset.pk3add,{stage:sec.dataset.pk3st||PK3_STAGE[ROLE]||'',name:t.dataset.pk3n2||''})},true);
/* after a note is saved / edited / deleted: refresh every panel of that plan */
{const _a=api;api=function(action,payload){const r=_a.apply(this,arguments);try{if(action==='fxNote'&&payload&&['add','edit','del'].includes(payload.op)&&r&&r.then)r.then(()=>{delete PK3.cache[payload.id];document.querySelectorAll(`.pk3n[data-pk3plan="${payload.id}"]`).forEach(s=>pk3Fill(s,true))}).catch(()=>{})}catch(e){}return r}}
/* (a) plan form: doctor / consultant */
{const _f=renderForm;renderForm=function(){const r=_f.apply(this,arguments);try{const pc=$('pCard');if(pc&&F&&F.id&&['doctor','consultant'].includes(ROLE))pk3Mount(pc.parentElement,F.id,PK3_STAGE[ROLE],{name:(F.h||{}).name||''},pc.nextSibling?'afterbegin':'beforeend');
  if(pc&&F&&F.id){const s=pc.parentElement.querySelector('.pk3n');if(s&&s.previousElementSibling!==pc)pc.insertAdjacentElement('afterend',s)}}catch(e){}return r}}
/* (b) surgery day */
{const _o=openSurg;openSurg=function(x){const r=_o.apply(this,arguments);try{const m=$('sgMed');if(m&&x&&x.id){const old=document.querySelector('#sgMed ~ .pk3n');if(old)old.remove();m.insertAdjacentHTML('afterend',pk3Panel(x.id,'surg',{name:x.name||''}));pk3Fill(document.querySelector('#sgMed ~ .pk3n'))}}catch(e){}return r}}
/* (c) prosthesis session («جلسه‌ی پروتز») + the «پزشک» login's file: the notes block near the top */
{const _l=typeof l5Render==='function'?l5Render:null;if(_l)l5Render=function(){const r=_l.apply(this,arguments);try{const b=$('pfBody');if(b&&PF&&PF.id){const st=PF.j&&PF.j.ntStage||'impr';const ro=b.querySelector('.l5ro');b.insertAdjacentHTML(ro?'afterbegin':'afterbegin',pk3Panel(PF.id,st,{name:$('pfTitle').textContent.replace(/^.*·\s*/,'')}));if(ro)ro.insertAdjacentElement('afterend',b.querySelector('.pk3n'));pk3Fill(b.querySelector('.pk3n'))}}catch(e){}return r}}
/* (d) reception: editing a queued patient */
/* rcEdit notes panel: merged into surgery/roles-live-queue-reception.js */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#rcClose,#rcCancel,#rcSend');if(!t)return;setTimeout(()=>{const old=document.querySelector('#rcSheet .pk3n');if(old&&!RC_EDIT)old.remove()},400)});
/* (e) the lab: notes addressed to the lab ride with the order list (server) → a badge in the work table; the order detail shows the panel; «+ توضیح» = stage «لابراتوار» */
{const _h=typeof l6BenchHTML==='function'?l6BenchHTML:null;if(_h)l6BenchHTML=function(){let h=_h.apply(this,arguments);try{(LB.items||[]).forEach(x=>{const N=Array.isArray(x.notes)?x.notes:[];if(!N.length)return;const k=`<td class="tnum"><b>${l2No(x.no)}</b></td>`;if(h.includes(k))h=h.split(k).join(`<td class="tnum"><b>${l2No(x.no)}</b><div class="l5bds"><span class="pill wait pk3bd" title="${esc(N[0].text||'')}">📝 توضیح برای لاب (${fa(N.length)})</span></div></td>`)})}catch(e){}return h}}
{const _b=typeof l5Badges==='function'?l5Badges:null;if(_b)l5Badges=function(x){let h=_b.apply(this,arguments)||'';try{const N=Array.isArray(x&&x.notes)?x.notes:[];if(N.length)h+=`<span class="pill wait pk3bd" title="${esc(N[0].text||'')}">📝 توضیح برای لاب (${fa(N.length)})</span>`}catch(e){}return h}}
{const _r=typeof l2Render==='function'?l2Render:null;if(_r)l2Render=function(){const r=_r.apply(this,arguments);try{const o=L2&&L2.ord&&L2.ord.order;const box=$('l2In');if(o&&o.plan&&box){const old=box.querySelector('.pk3n');if(old)old.remove();const row=box.querySelector('.row1');(row||box).insertAdjacentHTML(row?'afterend':'afterbegin',pk3Panel(o.plan,'lab',{name:o.name||'',lab:ROLE==='lab'}));pk3Fill(box.querySelector('.pk3n'))}}catch(e){}return r}}
/* the lab's note sheet: stage fixed, recipients default = doctor of the work */
{const _n=ntOpen;ntOpen=async function(plan,o){const r=await _n.apply(this,arguments);try{if(ROLE==='lab'){const s=$('fxNtSt');if(s){s.value='lab';s.disabled=true}}}catch(e){}return r}}
/* ---------- (2) image tags ---------- */
const PK3_Q=[['UR',[8,7,6,5,4,3,2,1]],['UL',[1,2,3,4,5,6,7,8]],['LR',[8,7,6,5,4,3,2,1]],['LL',[1,2,3,4,5,6,7,8]]];
const pk3Tag=f=>{const m=/\[st=([a-z]*);t=([A-Z0-9,]*)\]/.exec(String(f&&f.note||''));return m?{st:m[1],t:m[2]?m[2].split(','):[]}:{st:'',t:[]}};
const pk3TagStr=t=>t&&(t.st||(t.t||[]).length)?`[st=${t.st||''};t=${(t.t||[]).join(',')}]`:'';
const pk3TagTxt=t=>[t.st?FXST[t.st]||'':'',t.t&&t.t.length?toothTxt(t.t):''].filter(Boolean).join(' · ');
function pk3TagUI(j){if(!PK3.tag.st)PK3.tag.st=(j&&j.ntStage)||'';const st=PK3.tag.st;
  return `<div class="pk3tag"><div class="fields"><label class="f">مرحله‌ی این تصویر (اختیاری)<select id="pk3St">${Object.keys(FXST).map(k=>`<option value="${k}"${k===st?' selected':''}>${FXST[k]}</option>`).join('')}</select></label><div class="f"><span>دندان (اختیاری)</span><div class="pk3teeth">${PK3_Q.map(([q,L])=>`<div class="pk3q"><small>${QNAME[q]}</small>${L.map(n=>`<button type="button" class="t" data-pk3t="${q}${n}" aria-pressed="${PK3.tag.t.includes(q+n)}">${fa(n)}</button>`).join('')}</div>`).join('')}</div></div></div></div>`}
{const _i=pfImgs;pfImgs=function(j){let h=_i.apply(this,arguments);try{const F2=j.files||[];
  if(canImg())h=h.replace('<div class="fx3up">',pk3TagUI(j)+'<div class="fx3up">');
  const sts=[...new Set(F2.map(f=>pk3Tag(f).st).filter(Boolean))];
  if(sts.length){const ch=`<div class="chips pk3filt"><button type="button" class="chip" data-pk3f="" aria-pressed="${!PK3.filt}">همه</button>${sts.map(k=>`<button type="button" class="chip" data-pk3f="${k}" aria-pressed="${PK3.filt===k}">${FXST[k]||k}</button>`).join('')}</div>`;const i=h.indexOf('<h3 class="pf-h">');h=i>=0?h.slice(0,i)+ch+h.slice(i):h+ch}
  F2.forEach(f=>{const t=pk3Tag(f);if(!t.st&&!t.t.length)return;const tx=pk3TagTxt(t);h=h.replace(`data-imv="${esc(f.id)}" title="${esc(f.name||'')}">`,`data-imv="${esc(f.id)}" title="${esc(f.name||'')}" data-pk3st="${t.st}"${PK3.filt&&t.st!==PK3.filt?' hidden':''}><small class="pk3lbl">${esc(tx)}</small>`)});
  if(PK3.filt)F2.forEach(f=>{const t=pk3Tag(f);if(!t.st&&!PK3.filt)return;if(!t.st)h=h.replace(`data-imv="${esc(f.id)}" title="${esc(f.name||'')}">`,`data-imv="${esc(f.id)}" title="${esc(f.name||'')}" hidden>`)})}catch(e){}return h}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pk3t],[data-pk3f]');if(!t)return;e.preventDefault();e.stopPropagation();
  if(t.dataset.pk3t){const k=t.dataset.pk3t,i=PK3.tag.t.indexOf(k);if(i>=0)PK3.tag.t.splice(i,1);else PK3.tag.t.push(k);t.setAttribute('aria-pressed',String(i<0));return}
  PK3.filt=t.dataset.pk3f||'';if(PF&&!$('pfSheet').hidden)renderFile()},true);
document.addEventListener('change',e=>{if(e.target&&e.target.id==='pk3St')PK3.tag.st=e.target.value},true);
{const _a=api;api=function(action,payload){try{if(action==='fileAdd'&&payload&&payload.file&&PF&&payload.id===PF.id){const tg=pk3TagStr(PK3.tag);if(tg)payload.file.note=(tg+' '+String(payload.file.note||'')).trim()}}catch(e){}return _a.apply(this,arguments)}}
{const _o=openFile;openFile=async function(){PK3.tag={st:'',t:[]};PK3.filt='';return _o.apply(this,arguments)}}
