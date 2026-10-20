import {ar,fraction,equivalent} from './math.js';
export const symbols=['<','>','='];
export function item({prompt,math='',value,skill,hint,steps,proof,scene={},choices,rule='value'}){
 const answer=typeof value==='number'?ar(value):String(value);
 if(!choices){if(typeof value==='number'){choices=[answer,ar(value+1),ar(value===0?2:Math.max(0,value-1))];}else if(/^\d+\/\d+$/.test(value)){const [n,d]=value.split('/').map(Number);choices=[value,fraction(n+1,d),fraction(n,d+1)];}else choices=[answer,'اختيار آخر','لا يمكن تحديده'];}
 choices=[answer,...choices.filter(c=>!equivalent(c,answer))];choices=[...new Set(choices)];
 let offset=2;while(choices.length<3){const candidate=typeof value==='number'?ar(value+offset++):'راجعي المعطيات '+ar(offset++);if(!choices.some(c=>equivalent(candidate,c)))choices.push(candidate);}
 const shown=choices.slice(0,3).map(c=>String(c).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]));
 return {prompt,math,answer:answer.replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),value,choices:shown,skill,hint,steps,rule,proof:{...proof,expected:value},scene};
}
export function makeLesson(meta,{kind,idea,goals,game='match',make}){
 const cases=Array.from({length:16},(_,i)=>make(i));
 return {...meta,kind,idea,goals,game,warm:cases[0],examples:cases.slice(1,4),practice:cases.slice(4,8),cards:cases.slice(8,11),quiz:cases.slice(11,16)};
}
export const calcSteps=(start,middle,end)=>[start,middle,end];
export const relation=(a,b)=>a<b?'<':a>b?'>':'=';
