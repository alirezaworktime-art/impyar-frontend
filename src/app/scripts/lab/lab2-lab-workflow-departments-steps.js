/* ---------- lab2: lab workflow — departments, steps, workbench, files, returns, printing ---------- */
const L2={me:null,defs:null,dv:'',all:false,dept:0,q:'',ord:null,ret:null,retF:{from:'',to:''},dseg:'dept',blobs:new Map()};
const L2_STL={pend:'در نوبت',acc:'در دست',done:'انجام شد',skip:'رد شد'},L2_STC={pend:'',acc:'rev',done:'done',skip:'draft'};
const L2_FKL={scan:'اسکن / قالب دیجیتال',design:'فایل طرح',photo:'عکس',other:'سایر'};
const L2_RK={client_return:'برگشت از کلینیک (اصلاح)',refresh:'برگشت به مرحله در لابراتوار',renew:'شروع دوباره'};
const l2Fdi=k=>{const q={UR:1,UL:2,LL:3,LR:4}[String(k).slice(0,2)];return q?q+String(k).slice(2):String(k)};
const l2No=v=>faD(String(v||0));
const l2Teeth=t=>(t||[]).map(l2Fdi).sort().map(fa).join(' ');
const l2Done=s=>s.st==='done'||s.st==='skip';
const l2All=x=>{const s=x.steps||[];return s.length>0&&s.every(l2Done)};
/* l2Av: base + lab6 (only the steps of the same part) */
function l2Av(steps,s){if(s&&s.part)steps=(steps||[]).filter(t=>(t.part||'')===s.part);if(s.st!=='pend')return false;for(const t of steps){if(t.idx>=s.idx)continue;if(t.grp>0&&t.grp===s.grp)continue;if(!l2Done(t))return false}return true}
const l2Mine=s=>{const me=L2.me||{};return !!me.id&&(me.sup||(s.asg?s.asg===me.id:((me.depts||[]).map(Number).includes(Number(s.dept))||(me.free||[]).map(Number).includes(Number(s.dept)))))};
const l2Dept=id=>(L2.defs&&L2.defs.depts.find(d=>d.id===Number(id)))||{flags:{}};
const l2Size=b=>b>=1e6?fa(Math.round(b/1e5)/10)+' مگابایت':fa(Math.max(1,Math.round(b/1e3)))+' کیلوبایت';
const l2Ago=iso=>{if(!iso)return '';const m=Math.max(0,Math.round((Date.now()-Date.parse(iso))/6e4));return m<60?fa(m)+' دقیقه':m<1440?fa(Math.round(m/60))+' ساعت':fa(Math.round(m/1440))+' روز'};
async function l2Defs(force){if(L2.defs&&!force&&(!L2.dv||L2.defs.v===L2.dv))return L2.defs;const j=await api('labDefs',{op:'get'});L2.defs=j;L2.dv=j.v;return j}
function l2Dots(steps){return (steps||[]).length?`<div class="l2dots" aria-hidden="true">${steps.map(s=>`<i class="${s.st}" title="${esc(s.dname+' · '+L2_STL[s.st])}"></i>`).join('')}</div>`:''}
function l2CurTxt(d){const c=d&&d.cur;if(!c||!c.t)return '';return c.all?'همه‌ی مراحل ساخت انجام شد':`مرحله‌ی ${fa(c.n+1>c.t?c.t:c.n+1)} از ${fa(c.t)}${c.d?': '+c.d:''}${c.by?' · در دست '+c.by:''}`}
/* the clinic side sees the lab progress on every order card */
(function(){const _s=labSpecs;labSpecs=function(d){const c=l2CurTxt(d||{});return _s.apply(this,arguments)+(d&&d.wt?`<span>${esc(d.wt)}</span>`:'')+(c?`<span class="l2cur">${esc(c)}</span>`:'')}})();
function l2Btn(l){return `<div class="acts" style="margin-top:6px"><button class="btn sm ghost" type="button" data-l2open="${esc(l.id)}">مراحل، فایل‌ها و اسکن${l.no?' · #'+l2No(l.no):''}</button></div>`}

