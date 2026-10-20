import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {existsSync} from 'node:fs';
import {copySteps,shortCopy} from '../src/short-copy.js';
import {mathRanges,isMathNotation} from '../src/math-direction.js';
import {chapterThree} from '../src/chapter-three-data.js';
import {patternExamples,patternIdeas} from '../src/visual-learning.js';
const texts=[...patternIdeas,...patternExamples.flatMap(e=>e.steps),...chapterThree.flatMap(l=>[...l.paragraphs,...l.examples.flatMap(e=>e.steps),...[l.warm,...l.practice,...l.game,...l.quiz].flatMap(q=>[q.hint,q.explain])])];
test('short explanations preserve every word, digit and indivisible math expression',()=>{
 for(const text of texts.filter(Boolean)){const steps=copySteps(text);assert.equal(steps.join('').replace(/\s/gu,''),text.replace(/\s/gu,''));assert.ok(steps.every(Boolean));for(const r of mathRanges(text))assert.ok(steps.some(s=>s.includes(r.text)),r.text);}
});
for(const width of [320,390,1280])test(`short-copy controls and two-line explanations at ${width}px`,async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{const p=await b.newPage({viewport:{width,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto((process.env.TEST_BASE_URL||'http://127.0.0.1:5173/hasnaa-math/')+'#estimating-products');await p.locator('h1').waitFor();
 const sample='قرّبي العاملين أولًا. اضربي العددين القريبين. التقدير قريب وليس دقيقًا.';
 await p.locator('.lesson-content').evaluate((el,html)=>el.innerHTML=html,`<p class="feedback">${shortCopy(sample)}</p>`);
 const parts=copySteps(sample);for(let i=0;i<parts.length;i++){assert.equal(await p.locator('.short-copy-body').innerText(),parts[i]);if(i<parts.length-1)await p.locator(`[data-copy-index="${i+1}"]`).click();}await p.locator(`[data-copy-index="${parts.length-2}"]`).click();assert.equal(await p.locator('.short-copy-body').innerText(),parts.at(-2));assert.equal(await p.locator('.points b').innerText(),'٠');
 // Measure actual font/layout; never hide overflow or clamp away learning content.
 await p.locator('.lesson-content').evaluate((el,parts)=>{el.replaceChildren();for(const text of parts){const p=document.createElement('p');p.className='feedback';const span=document.createElement('span');span.className='short-copy-body';span.textContent=text;p.append(span);el.append(p);}},texts.flatMap(copySteps).filter(s=>!isMathNotation(s)));
 await p.evaluate(()=>document.fonts.ready);
 const long=await p.locator('.short-copy-body').evaluateAll(els=>els.filter(el=>el.getBoundingClientRect().height>2*parseFloat(getComputedStyle(el).lineHeight)+2).map(el=>el.textContent));assert.deepEqual(long,[]);
 await p.locator('.lesson-content').evaluate((el,parts)=>{el.replaceChildren();for(const text of parts){const step=document.createElement('div');step.className='solution-focus';step.textContent=text;el.append(step);}},[...patternExamples,...chapterThree.flatMap(l=>l.examples)].flatMap(e=>e.steps.flatMap(copySteps)));
 const tallSteps=await p.locator('.solution-focus').evaluateAll(els=>els.flatMap(el=>{const range=document.createRange();range.selectNodeContents(el);const tops=[];for(const rect of range.getClientRects())if(!tops.some(y=>Math.abs(y-rect.top)<5))tops.push(rect.top);return tops.length>2?[el.textContent]:[];}));assert.deepEqual(tallSteps,[]);assert.deepEqual(errors,[]);await p.close();}finally{await b.close();}
});
