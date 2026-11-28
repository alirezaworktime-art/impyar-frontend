/* ---------- m13: every «leave without saving?» dialog is just «تغییرات ذخیره شوند؟» بله / نه — بله saves, نه drops the changes and the record stays as it was (owner, 2026-11-11) ---------- */
/* (m4Ask: this dialog replaced the m4 one; merged into surgery/what-unsaved-screen-now-who.js) */
/* the older «خروج بدون ذخیره» questions (paper file, archive surgery day) ask the same thing */
{ const _u = uxAsk; uxAsk = function (o) { if (!(o && o.title === 'خروج بدون ذخیره')) return _u.apply(this, arguments);
  const save = async () => { if (SURG && SURG.arc) { await arcSave($('fxaGo') || document.createElement('button')); return false } if (A6 && $('a6Save')) { await a6Save($('a6Save')); return false } return false };
  return m4Ask({ save: async () => { await save(); return true } }).then(a => a === 'drop') } }
