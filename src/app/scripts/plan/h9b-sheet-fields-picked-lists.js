/* ---------- h9b: sheet fields are picked from lists (doctor, brand, assistant, shade); one choice per section;
   the sheet opens for every work of the prosthesis session ---------- */
var H9COL=null;
async function h9Colors(){if(H9COL)return H9COL;try{const d=await api('labDefs',{},{timeout:8000});H9COL=[...new Set((d.colors||[]).map(x=>String(x).trim()).filter(Boolean))]}catch(e){}
  if(!H9COL||!H9COL.length)H9COL=['A1','A2','A3','A3.5','A4','B1','B2','B3','B4','C1','C2','C3','C4','D2','D3','D4','BL1','BL2','BL3','BL4'];try{if(LO&&LO.h9&&PF&&!$('pfSheet').hidden)renderFile()}catch(e){}return H9COL}
function h9Opts(k){const H=LO.h9,uniq=a=>[...new Set(a.map(x=>String(x||'').trim()).filter(Boolean))];
  if(k==='doc')return uniq([PROSDOC(),USERNAME].concat(docList(),[SURGEON()]));
  if(k==='brand'){let cat=[];try{cat=(SET.catalog||[]).map(c=>c.b)}catch(e){}return uniq((PF&&PF.j?h9Brands(PF.j):[]).concat(cat))}
  if(k==='asst')return uniq(ASSTS());
  if(k==='shade'){if(!H9COL)h9Colors();return uniq((H9COL||[]).concat(PR2.SHADES||[]))}
  return []}
document.addEventListener('change',e=>{const s=e.target;if(s&&s.tagName==='SELECT'&&s.dataset&&s.dataset.h9f&&LO&&LO.h9){LO.h9[s.dataset.h9f]=s.value;if(s.dataset.h9f==='shade')LO.shade=s.value;if(s.dataset.h9f==='brand')LO.sys=s.value;if(s.dataset.h9f==='doc')LO.doc=s.value}});

