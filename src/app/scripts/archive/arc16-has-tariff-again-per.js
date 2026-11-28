
/* ---------- arc16: «کاشت مجدد اول/دوم» has a tariff again — per implant, one box per brand group, default 0 (arc13 made it always free) ---------- */
{const _l=a6Line;a6Line=function(l){let h=_l.apply(this,arguments);if(!l||l.k!=='imp'||!(+l.ri>0))return h;try{
  h=h.replace('<div class="a6l a13free" data-l=','<div class="a6l" data-l=');
  h=h.replace('<small>کاشت مجدد رایگان است؛ مبلغ این جلسه صفر.</small>','<small>تعرفه‌ی هر ایمپلنت کاشت مجدد را پایین وارد کنید (پیش‌فرض صفر).</small>');
  h=h.replace(/ · پیش‌فرض [^<]*<button type="button" class="lnk" data-arbdef="[^"]*" data-l="[^"]*">برگرداندن<\/button>/g,'');
  h=h.replace(/تعرفه‌ی ایمپلنت ([^<(]+?) \(هر عدد، تومان\)/g,'تعرفه‌ی کاشت مجدد $1 (هر عدد، تومان)')}catch(e){}return h}}
