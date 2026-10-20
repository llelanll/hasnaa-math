import {mathRanges,formatMathText as prose,isolateMath} from './math-direction.js';
// Short reading beats; mathematical expressions remain indivisible source tokens.
export function copySteps(text){
 const tokens=[];let at=0;
 for(const r of mathRanges(text)){tokens.push(...text.slice(at,r.start).match(/\s+|\S+/gu)||[],r.text);at=r.end;}
 tokens.push(...text.slice(at).match(/\s+|\S+/gu)||[]);
 const parts=[];let part='';
 for(const token of tokens){if(part.trim()&&(part+token).trim().length>36){parts.push(part.trim());part='';}part+=token;if(/[.؛!]\s*$/u.test(token)){parts.push(part.trim());part='';}}
 if(part.trim())parts.push(part.trim());return parts.length?parts:[''];
}
function contents(text,index){const parts=copySteps(text);return `<span class="short-copy-body">${prose(parts[index])}</span>${parts.length>1?`<span class="short-copy-controls">${index?`<button class="text-button" data-copy-index="${index-1}" aria-label="الجزء السابق">→</button>`:''}<small>${(index+1).toLocaleString('ar-SA')} / ${parts.length.toLocaleString('ar-SA')}</small>${index<parts.length-1?`<button class="text-button" data-copy-index="${index+1}">تابعي 👆</button>`:''}</span>`:''}`;}
export function shortCopy(text){return `<span class="short-copy" data-copy-text="${encodeURIComponent(text).replace(/'/g,'%27')}">${contents(text,0)}</span>`;}
export function shortCopyClick(e){const el=e.target.closest('[data-copy-index]');if(!el)return false;const root=el.closest('[data-copy-text]'),text=decodeURIComponent(root.dataset.copyText),index=Number(el.dataset.copyIndex);root.innerHTML=contents(text,index);isolateMath(root);const next=root.querySelector('[data-copy-index]');if(next)next.focus({preventScroll:true});return true;}
