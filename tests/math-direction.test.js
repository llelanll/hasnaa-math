import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {existsSync} from 'node:fs';
import {mathRanges,mathHTML,formatMathText} from '../src/math-direction.js';
import {questions} from '../src/questions.js';
import {chapterThree} from '../src/chapter-three-data.js';
import {quiz,practice} from '../src/multiplication-lesson.js';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173/hasnaa-math/';
const cases=['٢، ٤، ٨، ١٦، …','٣، ٦، …، ٢٤، ٣٠','٢٣ − ٧ = ١٦','٢٤ ÷ ٦ = ٤','٦ × (١٠ + ١٥) = ٦٠ + ٩٠ = ١٥٠','(٣، ٥)','(-٣، ٥)','٣/٤ + ١/٤ = ١','٣⁄٤','½ + ¼ = ¾','٢ → ٤ → ٨','٤ ← ٨ ← ١٢','س + ٣ = ٧','[٢، ٥]','٢٫٥ × ٤ = ١٠'];
function stripped(html){return html.replace(/<[^>]*>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");}
test('shared math formatter preserves source digits, signs, Arabic prose and all existing content',()=>{
 for(const text of cases){assert.deepEqual(mathRanges(text).map(r=>r.text),[text],text);assert.equal(stripped(mathHTML(text)),text);assert.match(mathHTML(text),/math-content/);}
 const prose='قالت سارة: ٢٠ − ٧ = ١٣، ثم تابعي الحل.';assert.equal(stripped(formatMathText(prose)),prose);assert.ok(!formatMathText(prose).startsWith('<bdi'));assert.deepEqual(mathRanges('أحسنتِ يا بطلة، استمري في المحاولة.'),[]);
 const strings=questions.flatMap(q=>[q.prompt,q.pattern,q.explanation]);for(const l of chapterThree){strings.push(...l.paragraphs,...l.examples.flatMap(e=>e.steps),...[l.warm,...l.practice,...l.game,...l.quiz].flatMap(q=>[q.prompt,q.math||'',q.hint,q.explain,...q.options]));}strings.push(...[...practice,...quiz].flatMap(q=>[q.prompt,q.math||'',q.explain,q.hint||'']));for(const text of strings.filter(x=>typeof x==='string'))assert.equal(stripped(formatMathText(text)),text);
});
// Geometry, rather than DOM order or screenshots alone, catches actual bidi regressions.
async function ordered(p,selector){return p.locator(selector).evaluateAll(els=>els.every(el=>{const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;const positions=[];while(n=walker.nextNode()){for(let i=0;i<n.length;i++){if(/\s/u.test(n.textContent[i]))continue;const range=document.createRange();range.setStart(n,i);range.setEnd(n,i+1);const r=range.getBoundingClientRect();if(r.width>0)positions.push({x:r.left,y:r.top});}}return positions.every((r,i)=>!i||r.y>positions[i-1].y+2||(Math.abs(r.y-positions[i-1].y)<3&&r.x>=positions[i-1].x-1));}));}
for(const width of [1280,390,320])test(`math geometry at ${width}px: live game, future notation, inline steps and all chapter content`,async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{const ctx=await b.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'#games');await p.locator('[data-start="game"]').click();
 for(const q of questions){assert.equal(await p.locator('.pattern').textContent(),q.pattern);assert.equal(await ordered(p,'.pattern'),true,q.pattern);assert.equal(await p.locator('.pattern').getAttribute('dir'),'ltr');await p.locator(`[data-answer="${q.answer}"]`).click();assert.equal(await ordered(p,'#feedback .math-content'),true);await p.locator('#next').click();}
 // Prove the geometry assertion would catch the reported original failure.
 await p.evaluate(()=>{const block=document.createElement('section');block.id='math-fixtures';block.dir='rtl';document.querySelector('#app main').append(block);});
 await p.locator('#math-fixtures').evaluate((el,values)=>{for(const text of values){const row=document.createElement('p');row.className='math-fixture';row.textContent='احسبي '+text+' ثم تابعي.';el.append(row);}const label=document.createElement('p');label.id='arabic-prose';label.textContent='مرحبا بالطالبة المجتهدة';el.append(label);const score=document.createElement('div');score.className='score';score.innerHTML='٣ <small>/ ٥</small>';el.append(score);const math=document.createElementNS('http://www.w3.org/1998/Math/MathML','math');math.innerHTML='<mfrac><mn>٣</mn><mn>٤</mn></mfrac>';el.append(math);},cases);
 await p.locator('#math-fixtures .math-content').first().waitFor();assert.equal(await p.locator('.math-fixture .math-content').count(),cases.length);assert.equal(await ordered(p,'.math-fixture .math-content'),true);assert.equal(await p.locator('#arabic-prose').evaluate(el=>getComputedStyle(el).direction),'rtl');assert.equal(await p.locator('#math-fixtures .score').getAttribute('dir'),'ltr');assert.equal(await p.locator('#math-fixtures math').getAttribute('dir'),'ltr');
 const style=await p.addStyleTag({content:'#math-fixtures .math-content{direction:rtl!important;unicode-bidi:normal!important}'});assert.equal(await ordered(p,'.math-fixture:first-child .math-content'),false);await style.evaluate(el=>el.remove());assert.equal(await ordered(p,'.math-fixture .math-content'),true);
 // Every existing authored question/example is rendered through the same production pipeline.
 const content=questions.flatMap(q=>[q.prompt,q.pattern,q.explanation]);for(const l of chapterThree)content.push(...l.paragraphs,...l.examples.flatMap(e=>e.steps),...[l.warm,...l.practice,...l.game,...l.quiz].flatMap(q=>[q.prompt,q.math||'',q.hint,q.explain,...q.options]));
 await p.locator('#math-fixtures').evaluate((el,strings)=>{el.replaceChildren();for(const text of strings){const row=document.createElement('p');row.className='audit-row';row.dir='rtl';row.textContent=text;el.append(row);}},content);await p.waitForFunction(()=>document.querySelectorAll('#math-fixtures .math-content').length>200);assert.equal(await ordered(p,'#math-fixtures .math-content'),true);
 for(const l of [{slug:'multiplication-patterns',title:'أنماط الضرب'},...chapterThree]){await p.goto(base+'#'+l.slug);await p.getByRole('heading',{level:1,name:l.title,exact:true}).waitFor();for(const step of [0,1,2,3,4]){await p.locator(`[${l.slug==='multiplication-patterns'?'data-lesson-step':'data-ch-step'}="${step}"]`).first().click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,l.slug);assert.equal(await ordered(p,'.lesson-content .math-content'),true,l.slug);}}
 assert.equal(await p.locator('html').getAttribute('dir'),'rtl');assert.deepEqual(errors,[]);await ctx.close();
 }finally{await b.close();}
});
