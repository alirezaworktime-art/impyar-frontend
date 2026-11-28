/* ---------- dental lab ---------- */
const LB={ver:'',items:[],seg:'new',t:null,seen:null};
const LB_SEGS=[['new','جدید',x=>x.st==='new'||x.st==='redo'],['work','در حال ساخت',x=>x.st==='recv'||x.st==='making'],['ready','ارسال‌شده',x=>x.st==='ready'],['done','تحویل‌شده',x=>x.st==='done'||x.st==='cancel']];
/* labSpecs: pros2 (impression method, redo count) + lab2 (work type and the lab progress on every order card; l2CurTxt is read first).
   The older dental-lab version was dead (the pros2 declaration replaced it). m23 still wraps it (paused-prosthesis warning). */
function labSpecs(d){const c=l2CurTxt(d||{});const S=[d.for&&LFOR[d.for]&&'ساخت: '+LFOR[d.for],d.pon&&d.pon.length&&'پونتیک: '+toothTxt(d.pon),d.type,d.mat,d.meth&&PR2.METH[d.meth]&&'قالب: '+PR2.METH[d.meth],d.abut&&'اباتمنت '+d.abut,d.ret,d.shade&&'رنگ '+d.shade,d.sys].filter(Boolean).map(v=>`<span>${esc(v)}</span>`).join('');
  return (d.redo?`<span class="p2redo">اصلاح ${fa(d.redo)}${d.redoFor?' · '+esc(pr2Lbl(d.redoFor)):''}</span>`:'')+S+(d&&d.wt?`<span>${esc(d.wt)}</span>`:'')+(c?`<span class="l2cur">${esc(c)}</span>`:'')}
function labLog(log){return (log||[]).length?`<ul class="llog">${log.slice(-6).map(g=>`<li class="${g.lab?'lab':''}"><b>${esc(g.st?LST[g.st]||g.st:'پیام')}</b>${g.note?' — '+esc(g.note):''}<small>${esc(jt(g.at))}${g.by?' · '+esc(g.by):''}</small></li>`).join('')}</ul>`:''}
function renderLab(){const n={};LB_SEGS.forEach(([k,,f])=>n[k]=LB.items.filter(f).length);
  $('lbSeg').innerHTML=LB_SEGS.map(([k,l])=>`<button type="button" data-lbs="${k}" aria-pressed="${LB.seg===k}">${l}${n[k]?' ('+fa(n[k])+')':''}</button>`).join('');
  const b=$('labBadge'),w=n.new;b.hidden=!w;b.textContent=fa(w);document.title=(w?`(${fa(w)}) `:'')+'سفارش‌های لابراتوار';
  const f=LB_SEGS.find(s=>s[0]===LB.seg)[2],td=tDay(),rows=LB.items.filter(f).sort((a,b)=>String(a.due).localeCompare(String(b.due)));
  const NX={new:[['recv','دریافت شد']],redo:[['making','شروع اصلاح']],recv:[['making','شروع ساخت']],making:[['ready','آماده شد و ارسال شد']]};
  $('lbList').innerHTML=rows.length?rows.map(x=>{const d=x.data||{},late=x.due&&x.due<td&&!['ready','done','cancel'].includes(x.st);
    return `<div class="item labcard"><div class="row1"><div><span class="nm">${esc(x.name)}</span><div class="meta">${x.age?'سن '+esc(faD(x.age))+' · ':''}${esc(d.doc||x.doc||'')}${' · ثبت '+esc(jd(x.created))}</div></div><span class="pill ${LSTC[x.st]||''}">${esc(LST[x.st]||x.st)}</span></div>
      <div class="meta">دندان‌ها: <b>${esc(toothTxt(d.teeth||[])||'—')}</b> · تحویل: <span class="${late?'late':''}">${esc(jDay(x.due)||'—')}${late?' (گذشته)':''}</span></div>
      <div class="spec">${x.ptype&&x.ptype!=='fix'?'<span>'+esc(PR2.TL[x.ptype]||'')+'</span>':''}${labSpecs(d)}</div>${d.note?`<div class="meta">${esc(d.note)}</div>`:''}${labLog(x.log)}
      <div class="acts">${(NX[x.st]||[]).map(([s,l])=>`<button class="btn sm" type="button" data-lbset="${s}" data-lid="${esc(x.id)}">${l}</button>`).join('')}</div>
      ${['done','cancel'].includes(x.st)?'':`<div class="labmsg"><input placeholder="پیام برای کلینیک (مثلاً سؤال درباره‌ی رنگ)" data-lbmsg="${esc(x.id)}"><button class="btn sm ghost" type="button" data-lbsend="${esc(x.id)}">ارسال پیام</button></div>`}</div>`}).join(''):'<div class="empty">سفارشی در این بخش نیست.</div>'}
async function labSet(lid,st,note,btn){if(btn)btn.disabled=true;try{await api('labSet',{lid,st:st||'',note:note||'',by:ROLE==='lab'?'لابراتوار':ROLE_LBL[ROLE]});if(ROLE==='lab')pollLab(true);else{if(PF&&!$('pfSheet').hidden)refreshFile();if(!$('viewPros').hidden)loadPros()}toast(st?'وضعیت سفارش: '+(LST[st]||st):'پیام ارسال شد.')}catch(e){alertMsg(e.message)}finally{if(btn)btn.disabled=false}}

