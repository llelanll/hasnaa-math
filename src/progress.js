// Browser-only learning records. Old point balances are preserved.
export const STORAGE_KEY='hasnaa-learning-v2';
const empty=()=>({version:2,lessons:{},states:{},facts:{},tables:{},rewards:{}});
function load(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(x&&x.version===2)return {...empty(),...x,lessons:x.lessons&&typeof x.lessons==='object'?x.lessons:{},states:x.states&&typeof x.states==='object'?x.states:{},facts:x.facts&&typeof x.facts==='object'?x.facts:{},tables:x.tables&&typeof x.tables==='object'?x.tables:{},rewards:x.rewards&&typeof x.rewards==='object'?x.rewards:{}};}catch{}return empty();}
let data=load();
let volatilePoints=0;
export function saveProgress(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch{}}
export function getPoints(){try{const n=Number(localStorage.getItem('hasnaa-points'));return Number.isFinite(n)&&n>=0?Math.floor(n):0;}catch{return volatilePoints;}}
export function addPoints(n,key){if(!Number.isFinite(n)||n<=0)return 0;const latest=key?load():null;if(key&&(data.rewards[key]||latest.rewards[key]))return 0;if(key)data.rewards={...latest.rewards,...data.rewards,[key]:true};const value=getPoints()+n;volatilePoints=value;try{localStorage.setItem('hasnaa-points',String(value));}catch{}saveProgress();return n;}
export function recordLesson(slug,score,total=5){const previous=data.lessons[slug]||{};data.lessons[slug]={completed:true,last:score,best:Math.max(previous.best||0,score),total,attempts:(previous.attempts||0)+1,updated:Date.now()};saveProgress();}
export function lessonRecord(slug){const r=data.lessons[slug];return r&&Number.isFinite(r.last)&&Number.isFinite(r.best)&&r.last>=0&&r.best>=0&&r.last<=5&&r.best<=5?r:null;}
export function getState(key){return data.states[key]||null;}
export function setState(key,value){data.states[key]=value;saveProgress();}
export function factKey(a,b){return `${a}:${b}`;}
export function factRecord(a,b){const r=data.facts[factKey(a,b)]||{};return Object.fromEntries(['correct','wrong','first'].map(k=>[k,Number.isFinite(r[k])&&r[k]>=0?Math.floor(r[k]):0]));}
export function recordFact(a,b,correct,firstTry){const key=factKey(a,b),old=factRecord(a,b);data.facts[key]={correct:old.correct+(correct?1:0),wrong:old.wrong+(correct?0:1),first:old.first+(correct&&firstTry?1:0)};saveProgress();}
export function recordTable(table,score,total,mode){const key=String(table),old=data.tables[key]||{};const percent=Math.round(score/total*100);data.tables[key]={last:percent,best:Math.max(old.best||0,percent),attempts:(old.attempts||0)+1,mode};saveProgress();}
export function tableRecord(table){const r=data.tables[String(table)];return r&&Number.isFinite(r.best)&&Number.isFinite(r.last)&&Number.isFinite(r.attempts)?r:{last:0,best:0,attempts:0};}
export function mastery(table){let mastered=0,seen=0;for(let b=0;b<=10;b++){const f=factRecord(table,b);if(f.first>=2)mastered++;if(f.correct+f.wrong>0)seen++;}return {mastered,seen,percent:Math.round(mastered/11*100),stars:mastered===11?3:mastered>=6?2:mastered>0?1:0};}
