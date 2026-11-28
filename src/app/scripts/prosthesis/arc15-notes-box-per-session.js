
/* ---------- arc15: «مراحل پروتز» — a notes box per session (up to 1000 characters), shown in the form, the file table and the PDF ---------- */
{const _l=a6Line;a6Line=function(l){let h=_l.apply(this,arguments);if(!l||l.k!=='pros')return h;try{
  h=h.replace('<div class="a6sut">',`<div class="fields a15n"><label class="f">توضیحات<textarea data-a15n="${l.id}" rows="2" maxlength="1000" placeholder="اختیاری">${esc(l.note||'')}</textarea></label></div><div class="a6sut">`)}catch(e){}return h}}
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.a15n||!A6)return;const l=a6L(t.dataset.a15n);if(!l)return;l.note=t.value.slice(0,1000);A6.dirty=true});
