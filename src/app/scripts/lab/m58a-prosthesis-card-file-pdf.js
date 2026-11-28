
/* ---------- m58a (2026-11-20): prosthesis card — «کار امروز» (file + PDF) and «سفارش لابراتوار» are two separate buttons ---------- */
/* 1. prosthesis-day cards: «جلسه‌ی پروتز» → «کار امروز»; + «سفارش لابراتوار» right after it */
(function(){const _p=pdCard;pdCard=function(id,name){const h=_p.apply(this,arguments);if(!id)return h;
  return h.replace('>جلسه‌ی پروتز</button>',`>کار امروز</button><button class="btn sm" type="button" data-m58lab="${esc(id)}" data-m58n="${esc(name)}">سفارش لابراتوار</button>`)}})();
/* 2. referral cards (surgery doctor): the l5 button becomes «کار امروز»; + «سفارش لابراتوار» */
(function(){const _r=l3RenderRef;l3RenderRef=function(){const r=_r.apply(this,arguments);const b=$('l3Ref');if(b)b.querySelectorAll('[data-l5]').forEach(x=>{x.textContent='کار امروز';if(x.parentNode.querySelector('[data-m58lab]'))return;
  const l=document.createElement('button');l.type='button';l.className='btn sm';l.dataset.m58lab=x.dataset.l5;l.dataset.m58n=x.dataset.l5n||'';l.dataset.aid=x.dataset.aid||'';l.textContent='سفارش لابراتوار';x.after(l);
  const n=x.parentNode.querySelector('[data-adoc]');if(n)n.textContent='انجام بدون سفارش (بدون ثبت کار)'});return r}})();
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-m58lab]');if(!t)return;e.stopImmediatePropagation();
  l3OpenLab(t.dataset.m58lab,t.dataset.m58n||'',t.dataset.aid||'')},true);
/* 3. the «کار امروز» sheet: only the work of today + note; no lab order inside */
(function(){const _r=l5Render;l5Render=function(){const r=_r.apply(this,arguments);try{
  const name=(fromDoc(PF.id,PF.j.data||{}).h||{}).name||'';$('pfTitle').textContent='کار امروز · '+name;
  const h=document.querySelector('.l5work h3');if(h)h.textContent='کار امروز';
  const s=$('l5Save');if(s)s.textContent='ثبت کار امروز';
  const w=document.querySelector('.l5work');if(w&&!w.querySelector('.m58n')){const p=document.createElement('p');p.className='note m58n';p.textContent='در پرونده و PDF پرونده ثبت می‌شود. برای سفارش لابراتوار دکمه‌ی «سفارش لابراتوار» روی کارت بیمار را بزنید.';const m=$('l5Msg');if(m)m.before(p);else w.append(p)}}catch(e){}return r}})();
/* 4. PDF of the file: full doctor notes of the prosthesis steps (the table cuts them) — in ffProsBlocks, finance/patch-pdf-pdf.js */
