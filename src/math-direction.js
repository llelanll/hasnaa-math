// One shared bidi boundary for mathematical notation. Never reverse strings,
// substitute digits, or apply an LTR override to Arabic prose.
const number=String.raw`[+−-]?[0-9٠-٩۰-۹]+(?:[٫.٬][0-9٠-٩۰-۹]+)*`;
const variable=String.raw`(?<![\p{L}\p{M}])[a-zA-Zسصعنمك](?![\p{L}\p{M}])`;
const base=String.raw`(?:${number}|${variable}|[¼½¾⅐-⅞؟?□…]|\.\.\.)`;
const operator=String.raw`[+−\-–×÷*/⁄=≠≈<>≤≥^:،,؛;→←↔⇒⇐↦□]`;
const expression=atom=>String.raw`${atom}(?:[ \t]*${operator}[ \t]*${atom})*`;
const atom=String.raw`(?:[([{][ \t]*)*${base}(?:[ \t]*[)\]}])*`;
const source=String.raw`${expression(atom)}(?:[ \t]*(?:…|\.\.\.))?`;
const runs=()=>new RegExp(source,'gu');
const significant=/[+−\-–×÷*/⁄=≠≈<>≤≥^:،,؛;→←↔⇒⇐↦□()[\]{}¼½¾⅐-⅞]/u;
export function mathRanges(text){return [...text.matchAll(runs())].filter(m=>significant.test(m[0])).map(m=>({start:m.index,end:m.index+m[0].length,text:m[0]}));}
export function isMathNotation(text){const trimmed=text.trim();const match=new RegExp(`^(?:${source})$`,'u');return match.test(trimmed);}
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const boundary=(text,emphasis=false)=>`<bdi class="math-content${emphasis?' equation':''}" dir="ltr">${escape(text)}</bdi>`;
export function formatMathText(text){text=String(text);if(isMathNotation(text))return boundary(text,true);let result='',position=0;for(const r of mathRanges(text)){result+=escape(text.slice(position,r.start))+boundary(r.text,true);position=r.end;}return result+escape(text.slice(position));}
export function mathHTML(text){text=String(text);return isMathNotation(text)?boundary(text,true):`<span dir="rtl">${formatMathText(text)}</span>`;}
export function isolateMath(root){
 // Normalize legacy helpers to the same class, preserving their visual styling.
 for(const el of root.querySelectorAll('.equation')){el.classList.add('math-content');el.setAttribute('dir','ltr');}
 for(const el of root.querySelectorAll('.pattern,.math,.score,.fact-list button,.table-visual h2')){if(isMathNotation(el.textContent)){el.classList.add('math-content');el.setAttribute('dir','ltr');}}
 for(const el of root.querySelectorAll('math,[data-math]')){el.classList.add('math-content');el.setAttribute('dir','ltr');}
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){return node.parentElement?.closest('.math-content,script,style,textarea,input,svg,math,[contenteditable="true"]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){const text=node.nodeValue,ranges=mathRanges(text);if(!ranges.length)continue;const fragment=document.createDocumentFragment();let position=0;for(const r of ranges){fragment.append(document.createTextNode(text.slice(position,r.start)));const span=document.createElement('bdi');span.className='math-content';span.dir='ltr';span.textContent=r.text;fragment.append(span);position=r.end;}fragment.append(document.createTextNode(text.slice(position)));node.replaceWith(fragment);}
}

export function observeMath(root){
 const options={childList:true,characterData:true,subtree:true};
 const observer=new MutationObserver(()=>{observer.disconnect();try{isolateMath(root);}finally{observer.observe(root,options);}});
 observer.observe(root,options);return observer;
}
