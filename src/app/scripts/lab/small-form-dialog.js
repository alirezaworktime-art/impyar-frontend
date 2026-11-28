/* ---------- a small form dialog ---------- */
/* l2Ask: the in-app dialog of ux5 (uxAsk); the older own sheet was dead (ux5 replaced it). m26 still wraps it (extra account fields). */
function l2Ask(title,fields,okL){return uxAsk({title,fields:(fields||[]).map(f=>Object.assign({},f)),ok:okL||'ثبت',danger:/حذف|ابطال|باطل|لغو|برگشت/.test(okL||'')})}
