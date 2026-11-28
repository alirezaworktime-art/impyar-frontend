/* ---------- o3s (owner, 2026-11-27): option 3 = the agreed % (default 70) of the SURGERY part as cash before surgery; the rest (rest of the surgery part + prosthesis) has no cheque and is paid any time, any amount, until the impression day ---------- */
const o3sCash=(r,S)=>Math.round((Number(S)||0)*pl10Pct(r)/100/1e5)*1e5;
const o3sRest=(S,P,C)=>`مانده ${fa(Math.max(0,S+P-C))} بدون چک، هر زمان و هر مبلغ تا روز قالب‌گیری`;
/* reception's collection sheet + everything that reads chqFor: before and after surgery only pct% of the surgery part is asked */
/* (chqFor: merged into finance/fin2.js) */
/* (cashFor and payText: merged into prosthesis/calc.js) */
/* the consultant's form: the % field and its note */
/* pl10PayUI: the % field label and note are set in its single definition (consultant/pl10-duplicate-alarm-national-id.js) */
/* patient PDF: cash column = pct% of the surgery part, nothing in the prosthesis column, no cheques (in q8Cash / q8Chq); the «other brands» line */
{const _b=payBlock;payBlock=function(r){if(!(r&&pl10O3(r)))return _b.apply(this,arguments);const _tb=textBlock;textBlock=function(t,L){try{if(Array.isArray(L))L=L.map(l=>typeof l==='string'&&/^برای سایر برندها هم پیش‌پرداخت/.test(l)?`برای سایر برندها هم: ${fa(pl10Pct(r))}٪ پارت جراحی نقد قبل از جراحی (ستون پرداخت نقدی)؛ بقیه بدون چک تا روز قالب‌گیری.`:l)}catch(e){}return _tb.call(this,t,L)};try{return _b.apply(this,arguments)}finally{textBlock=_tb}}}
/* reception: suggested payments (two rows for the rest: surgery part s, prosthesis part p) and no cheque plan — in paySugs and chqGen */
