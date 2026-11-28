/* ---------- voice: «توضیحات صوتی» in the work-order sheet — recorded in the app, sent with the order, played in the lab ---------- */
const V9EXT=/\.(webm|ogg|oga|m4a|mp3|wav|aac)$/i;var V9=null;
function v9Mime(){const C=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus','audio/ogg'];try{for(const c of C)if(window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(c))return c}catch(e){}return ''}
const v9Ext=m=>/mp4|aac|m4a/.test(m)?'m4a':/ogg/.test(m)?'ogg':'webm';
const v9T=s=>{s=Math.max(0,Math.round(s));return fa(Math.floor(s/60))+':'+String(s%60).padStart(2,'0').replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])};
function v9HTML(){const H=LO.h9,L=H.voice||[],rec=V9&&V9.on;
  return `<div class="v9"><div class="v9hd"><span>توضیحات صوتی :</span>${window.MediaRecorder?`<button type="button" class="btn sm ${rec?'danger':'main'}" id="v9Rec">${rec?'■ پایان ضبط':'🎙 ضبط صدا'}</button>${rec?`<b class="v9t" id="v9Tm">${v9T((Date.now()-V9.t0)/1000)}</b><i class="v9dot"></i>`:''}`:'<small class="note">این مرورگر ضبط صدا ندارد.</small>'}</div>
    ${L.length?`<ul class="v9l">${L.map((v,i)=>`<li><audio controls preload="metadata" src="${v.url}"></audio><small>${v9T(v.sec)}</small><button type="button" class="btn sm ghost" data-v9x="${i}" aria-label="حذف">×</button></li>`).join('')}</ul>`:''}</div>`}
(function(){const _h=h9HTML;h9HTML=function(j){const h=_h.apply(this,arguments);return h.replace('<div class="h9sch">',v9HTML()+'<div class="h9sch">')}})();
async function v9Start(){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){alertMsg('دسترسی به میکروفون در این مرورگر ممکن نیست.');return}
  let st;try{st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})}catch(e){alertMsg('اجازه‌ی میکروفون داده نشد. در تنظیمات مرورگر، میکروفون را برای این سایت مجاز کنید.');return}
  const mime=v9Mime();let mr;try{mr=mime?new MediaRecorder(st,{mimeType:mime,audioBitsPerSecond:48000}):new MediaRecorder(st)}catch(e){st.getTracks().forEach(t=>t.stop());alertMsg('ضبط صدا شروع نشد: '+e.message);return}
  const ch=[];V9={on:true,t0:Date.now(),mr,st,ch,tick:setInterval(()=>{const e=$('v9Tm');if(e&&V9)e.textContent=v9T((Date.now()-V9.t0)/1000);if(V9&&Date.now()-V9.t0>5*60*1000)v9Stop()},500)};
  mr.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data)};
  mr.onstop=()=>{const sec=(Date.now()-V9.t0)/1000,type=mr.mimeType||mime||'audio/webm';clearInterval(V9.tick);st.getTracks().forEach(t=>t.stop());V9=null;
    if(ch.length&&LO&&LO.h9){const b=new Blob(ch,{type}),H=LO.h9;H.voice=H.voice||[];const n=H.voice.length+1;
      const f=new File([b],`توضیح-صوتی-${n}-${(H.name||'بیمار').replace(/[\\/:*?"<>|]/g,'')}.${v9Ext(type)}`,{type});H.voice.push({file:f,url:URL.createObjectURL(b),sec})}
    renderFile()};
  mr.start(1000);renderFile()}
function v9Stop(){if(V9&&V9.mr&&V9.mr.state!=='inactive')V9.mr.stop()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#v9Rec,[data-v9x]');if(!b||!LO||!LO.h9)return;e.stopPropagation();h9Read();
  if(b.id==='v9Rec'){if(V9&&V9.on)v9Stop();else v9Start();return}
  if(b.dataset.v9x!==undefined){const i=+b.dataset.v9x,v=LO.h9.voice[i];if(v)try{URL.revokeObjectURL(v.url)}catch(e){}LO.h9.voice.splice(i,1);renderFile()}},true);
/* stop a recording if the sheet closes; voice files go with the order (kind «other») */
(function(){const _r=renderFile;renderFile=function(){if(V9&&V9.on&&!document.getElementById('v9Rec')&&!(LO&&LO.h9))v9Stop();return _r.apply(this,arguments)}})();
function v9Files(){return ((LO&&LO.h9&&LO.h9.voice)||[]).map(v=>v.file)}
(function(){const _s=loSend;loSend=async function(t){if(V9&&V9.on){alertMsg('اول ضبط صدا را تمام کنید.');return}if(LO&&LO.h9){const V=v9Files();LOF=LOF.filter(f=>!V9EXT.test(f.name)).concat(V)}return _s.apply(this,arguments)}})();
(function(){const _s=l5Submit;l5Submit=async function(withLab,b){if(V9&&V9.on){alertMsg('اول ضبط صدا را تمام کنید.');return}if(withLab&&LO&&LO.h9){const V=v9Files();LOF=LOF.filter(f=>!V9EXT.test(f.name)).concat(V)}return _s.apply(this,arguments)}})();
/* the sheet image says a voice note is attached */
/* lab / file view: play voice notes */
async function v9Play(fid){const f=l2File(fid);if(!f)return;try{const bl=await l2Fetch(f),u=URL.createObjectURL(bl);const s=mkSheet('v9Sh',`<h3 dir="ltr">${esc(f.name)}</h3><audio controls autoplay src="${u}" style="width:100%"></audio><div class="btns"><button class="btn ghost" type="button" id="v9ShX">بستن</button></div>`);s.style.zIndex=70;s.hidden=false;
  $('v9ShX').onclick=()=>{const a=s.querySelector('audio');if(a)a.pause();s.hidden=true;URL.revokeObjectURL(u)}}catch(e){alertMsg(e.message)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-l2aud]');if(!b)return;e.stopPropagation();v9Play(b.dataset.l2aud)},true);

