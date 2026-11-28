/* ---------- archive filters ---------- */
let LFILT='all';
const statusKey=d=>d.queue==='undecided'?'und':d.queue==='lost'?'lost':d.settle==='pending'?'settle':d.queue==='surgery'?'surg':d.queue==='surgdone'?'sdone':(d.status==='queued'||['waiting','reviewing','consult','consulting'].includes(d.queue))?'wait':d.status==='draft'?'draft':'conf';

