/* ---------- patch-flow3: روند بی‌گم‌شدگی — نیامد، نوبت‌های گذشته، پروتز بی‌نوبت، لاب دیرکرده، ترخیص ۷ روزه، رضایت‌نامه/پرداخت، بازگشت بیماران ---------- */
let QPAST=[],QPIDLE=[],QLAB=[],QLABN=[];
const PR_AK={impr:'impr',tryin:'tryin',rabt:'rabt',deliv:'deliv',lab:'tryin',heal:'uncover'};
const f3Days=d=>{const n=dDiff(tDay(),String(d||'').slice(0,10));return isFinite(n)?n:0};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pbook]');if(!t)return;openAppt({plan:t.dataset.pbook,name:t.dataset.pbn,phone:t.dataset.pbp,kind:t.dataset.pbk||'tryin',note:t.dataset.pbnote||''})});
/* clinic owes: show paid refunds etc. handled in pay3; here: labels for the new task kinds */
Object.assign(TLBL,{reno:['نیامد؛ نوبت دوباره','بیمار سر نوبت نیامد. تماس بگیرید و نوبت تازه بدهید.'],fol3:['پیگیری سوم (دو ماه بعد)','تماس بگیرید و درباره‌ی تصمیم بیمار بپرسید؛ اگر باز هم تصمیم نگرفت، به «بازگشت بیماران» می‌رود.'],impr:['نوبت قالب‌گیری','ایمپلنت‌ها با هیلینگ کار گذاشته شده و انکاوری لازم ندارند؛ برای قالب‌گیری نوبت بدهید.']});
Object.assign(TGRP,{reno:'sg',fol3:'fl',impr:'pr'});
AKL.visit='ویزیت اول';

