/* ---------- p4: patient images / radiographs ---------- */
const IMK=[['opg','OPG (پانورکس)'],['cbct','CBCT'],['pre','گرافی / عکس قبل از جراحی'],['intra','عکس داخل دهان'],['post','گرافی / عکس بعد از جراحی'],['doc','مدارک و فرم‌ها'],['other','سایر']],IMKL=Object.fromEntries(IMK);
let IMG={kind:'opg',busy:false},IMV=null;
const canImg=()=>ROLE==='staff'||ROLE==='consultant';
/* pfImgs — base + pk3 (stage / tooth tags: the tag picker before the upload buttons, a stage filter, a label on each tagged image) */
function pfImgs(j){const F=j.files||[];let h='';
  if(canImg())h+=`<div class="payform"><b>افزودن عکس، رادیوگرافی یا مدرک</b><div class="chips" style="margin:8px 0">${IMK.map(([k,l])=>`<button type="button" class="chip" data-imk="${k}" aria-pressed="${IMG.kind===k}">${l}</button>`).join('')}</div>
    <div class="fx3up"><label class="btn${IMG.busy?' disabled':''}">📷 عکس با دوربین<input type="file" id="imgCam" accept="image/*" capture="environment" hidden${IMG.busy?' disabled':''}></label><label class="btn ghost${IMG.busy?' disabled':''}">🖼 از گالری یا فایل<input type="file" id="imgIn" accept="image/*,application/pdf" multiple hidden${IMG.busy?' disabled':''}></label><label class="btn ghost${IMG.busy?' disabled':''}">🖨 از اسکنر<input type="file" id="imgScan" accept="image/*,application/pdf" multiple hidden${IMG.busy?' disabled':''}></label></div><div class="fx3drop" id="fx3Drop">فایل اسکن‌شده یا عکس را اینجا بکشید و رها کنید</div><p class="note">اسکنر: عکس یا برگه را با برنامه‌ی اسکنر کامپیوتر به‌صورت JPG یا PDF اسکن کنید، بعد «از اسکنر» را بزنید و فایل را از پوشه‌ی اسکن انتخاب کنید (یا همین‌جا بکشید). در آیفون، «از گالری یا فایل» ← «اسکن اسناد» هم کار می‌کند.</p><p class="note" id="imgMsg">${IMG.busy?esc(IMG.busy):'عکس‌ها خودکار کوچک می‌شوند تا سریع باز شوند. PDF تا حدود ۱٫۴ مگابایت.'}</p></div>`;
  if(!F.length)h+='<div class="empty">هنوز عکس یا مدرکی برای این بیمار ثبت نشده.</div>';
  else{h+=fx3Cmp(F);
  h+=q6Groups(F);} /* q6: grouped before / after surgery, delete per file */
  /* pk3 */
  try{const F2=j.files||[];
  if(canImg())h=h.replace('<div class="fx3up">',pk3TagUI(j)+'<div class="fx3up">');
  const sts=[...new Set(F2.map(f=>pk3Tag(f).st).filter(Boolean))];
  if(sts.length){const ch=`<div class="chips pk3filt"><button type="button" class="chip" data-pk3f="" aria-pressed="${!PK3.filt}">همه</button>${sts.map(k=>`<button type="button" class="chip" data-pk3f="${k}" aria-pressed="${PK3.filt===k}">${FXST[k]||k}</button>`).join('')}</div>`;const i=h.indexOf('<h3 class="pf-h">');h=i>=0?h.slice(0,i)+ch+h.slice(i):h+ch}
  F2.forEach(f=>{const t=pk3Tag(f);if(!t.st&&!t.t.length)return;const tx=pk3TagTxt(t);h=h.replace(`data-imv="${esc(f.id)}" title="${esc(f.name||'')}">`,`data-imv="${esc(f.id)}" title="${esc(f.name||'')}" data-pk3st="${t.st}"${PK3.filt&&t.st!==PK3.filt?' hidden':''}><small class="pk3lbl">${esc(tx)}</small>`)});
  if(PK3.filt)F2.forEach(f=>{const t=pk3Tag(f);if(!t.st&&!PK3.filt)return;if(!t.st)h=h.replace(`data-imv="${esc(f.id)}" title="${esc(f.name||'')}">`,`data-imv="${esc(f.id)}" title="${esc(f.name||'')}" hidden>`)})}catch(e){}return h}
async function imgPrep(file){
  if(file.type==='application/pdf'){if(file.size>1.4e6)throw new Error(file.name+': فایل PDF بزرگ‌تر از ۱٫۴ مگابایت است.');
    const d=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=()=>rej(new Error('خواندن فایل ممکن نشد.'));r.readAsDataURL(file)});return {mime:'application/pdf',data:d,thumb:''}}
  if(!/^image\//.test(file.type||''))throw new Error((file.name||'فایل')+': فقط عکس یا PDF قابل ثبت است.');
  let bmp;try{bmp=await createImageBitmap(file)}catch(e){throw new Error((file.name||'عکس')+': این نوع عکس خوانده نشد. لطفاً عکس را با فرمت JPG بفرستید.')}
  const draw=(max,q)=>{const s=Math.min(1,max/Math.max(bmp.width,bmp.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(bmp.width*s));c.height=Math.max(1,Math.round(bmp.height*s));const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(bmp,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q)};
  let d=draw(2200,0.85);if(d.length>1.85e6)d=draw(1800,0.75);if(d.length>1.85e6)d=draw(1400,0.7);
  return {mime:'image/jpeg',data:d.split(',')[1],thumb:draw(260,0.7)}}
/* imgUpload — one definition of the old layers: up2 (3D scan / archive files go to the scan box, the rest continues here),
   arc10 (a PDF too big to keep becomes page images), then the base upload. */
async function imgUpload(files){{const S=[...files].filter(f=>UP2_RX.test(f.name)),R=[...files].filter(f=>!UP2_RX.test(f.name));if(S.length)await up2Upload(S);if(!R.length)return;files=R}
  {let F;try{F=await a10Expand(files,2200,(i,n)=>{const m=$('imgMsg');if(m){m.className='note';m.textContent=`تبدیل PDF: صفحه‌ی ${fa(i)} از ${fa(n)}…`}},false)}catch(e){alertMsg(e.message);return}files=F}
  if(!PF||!files.length)return;const id=PF.id,errs=[];let ok=0;
  for(let i=0;i<files.length;i++){IMG.busy=`در حال ارسال ${fa(i+1)} از ${fa(files.length)}…`;const m=$('imgMsg');if(m){m.className='note';m.textContent=IMG.busy}
    try{const p=await imgPrep(files[i]);await api('fileAdd',{id,sendId:uuid(),file:{kind:IMG.kind,name:files[i].name||'',mime:p.mime,data:p.data,thumb:p.thumb}},{timeout:90000});ok++}catch(e){errs.push(e.message)}}
  IMG.busy=false;if(ok)toast(fa(ok)+' فایل در پرونده ثبت شد.');if(errs.length)alertMsg(errs.join('\n'));if(PF&&PF.id===id)refreshFile()}
async function imgView(fid){IMV={fid};const s=mkSheet('imgSheet',`<h3 id="imvT">در حال باز کردن…</h3><div id="imvB" class="imvb"><div class="empty">در حال بارگذاری…</div></div><div class="msg" id="imvMsg"></div>
  <div class="btns" style="flex-wrap:wrap"><a class="btn ghost" id="imvDl" href="#" download>دانلود</a>${canImg()?'<button class="btn ghost danger" type="button" id="imvDel">حذف از پرونده</button>':''}<button class="btn ghost" type="button" id="imvClose">بستن</button></div>`);s.hidden=false;
  try{const j=await api('fileGet',{fid},{timeout:90000}),f=j.file;if(!IMV||IMV.fid!==fid)return;
    $('imvT').textContent=(IMKL[f.kind]||'فایل')+' · '+jd(f.at)+(f.by?' · '+f.by:'');const nm=(f.name||'file').replace(/[\\/:*?"<>|]/g,'_');
    if(f.mime==='application/pdf'){const b=new Blob([Uint8Array.from(atob(f.data),c=>c.charCodeAt(0))],{type:'application/pdf'}),u=URL.createObjectURL(b);IMV.url=u;
      $('imvB').innerHTML=`<iframe src="${u}" title="PDF" style="width:100%;height:calc(70vh / var(--zm,1));border:0;border-radius:10px;background:#fff"></iframe>`;$('imvDl').href=u;$('imvDl').download=/\.pdf$/i.test(nm)?nm:nm+'.pdf'}
    else{const u='data:'+f.mime+';base64,'+f.data;$('imvB').innerHTML=`<img src="${u}" alt="" style="max-width:100%;height:auto;display:block;margin:auto;border-radius:10px">`;$('imvDl').href=u;$('imvDl').download=nm.replace(/\.[a-z0-9]+$/i,'')+'.jpg'}}
  catch(e){$('imvB').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
function imvClose(){const s=$('imgSheet');if(s)s.hidden=true;if(IMV&&IMV.url)URL.revokeObjectURL(IMV.url);IMV=null}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('button,a');if(!t)return;
  if(t.dataset.imk){IMG.kind=t.dataset.imk;document.querySelectorAll('[data-imk]').forEach(b=>b.setAttribute('aria-pressed',b===t));return}
  if(t.dataset.imv){imgView(t.dataset.imv);return}
  if(t.id==='imvClose'){imvClose();return}
  if(t.id==='imvDel'&&IMV){if(t.dataset.armed!=='1'){t.dataset.armed='1';t.textContent='برای حذف دوباره بزنید';setTimeout(()=>{if(t.isConnected){t.dataset.armed='';t.textContent='حذف از پرونده'}},4000);return}
    t.disabled=true;try{await api('fileDel',{fid:IMV.fid});imvClose();toast('فایل از پرونده حذف شد.');refreshFile()}catch(err){$('imvMsg').className='msg err';$('imvMsg').textContent=err.message;t.disabled=false}return}});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.id==='imgIn'&&t.files&&t.files.length&&!IMG.busy){const F=[...t.files];t.value='';imgUpload(F)}});

