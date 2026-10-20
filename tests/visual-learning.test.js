import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chromium} from '@playwright/test';
import {chapterThree} from '../src/chapter-three-data.js';
import {patternExamples,patternIdeas} from '../src/visual-learning.js';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173/hasnaa-math/';
for(const width of [1280,390,320])test(`visual activities, keyboard, persistence and compact screens at ${width}px`,async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{const ctx=await b.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const lessons=[{slug:'multiplication-patterns',examples:patternExamples,paragraphs:patternIdeas},...chapterThree];
 for(const l of lessons){await p.goto(base+'#'+l.slug);const attr=l.slug==='multiplication-patterns'?'data-lesson-step':'data-ch-step';await p.locator(`[${attr}="0"]`).first().click();await p.locator('[data-visual="page"][data-value="0"]').click();
 assert.equal(await p.locator('.visual-route button').count(),4);assert.equal(await p.locator('.visual-scene').count(),1);
 const click=async(a,n)=>p.locator(`[data-visual="${a}"]${n===undefined?'':`[data-value="${n}"]`}`).first().click();
 if(l.slug==='multiplication-patterns'){for(const value of ['٤٢٠','٤٢٠٠','٤٢٠٠٠']){await click('cycle');assert.ok((await p.locator('.visual-scene .pattern').innerText()).includes(value));}}
 if(l.slug==='distributive-property'){await click('cycle');assert.equal(await p.locator('.interactive-array i').count(),42);assert.match(await p.locator('.pattern').innerText(),/٣٠ \+ ١٢ = ٤٢/);}
 if(l.slug==='estimating-products'){await click('pick',50);assert.match(await p.locator('.scene-feedback').innerText(),/فكري/);assert.equal(await p.locator('.visual-scene .pattern').count(),0);await click('pick',50);assert.match(await p.locator('.scene-feedback').innerText(),/يبعد ٢/);await click('pick',60);assert.match(await p.locator('.pattern').innerText(),/١٢٠٠/);}
 if(l.slug==='multiply-one-digit'){await click('cycle');assert.match(await p.locator('.carry-box').innerText(),/٤ عشرات \+ ٢ آحاد/);assert.match(await p.locator('.pattern').innerText(),/٢٨٢/);}
 if(l.slug==='draw-a-picture'){for(let i=0;i<4;i++)await click('gap',i);assert.equal(await p.locator('.gap-choice.active').count(),4);assert.match(await p.locator('.pattern').innerText(),/٤ × ٣ = ١٢/);await click('gap',0);assert.match(await p.locator('.pattern').innerText(),/٣ × ٣ = ٩/);}
 if(l.slug==='multiply-two-digits'){await click('reveal',1);assert.match(await p.locator('.partial-pieces').innerText(),/٨٦/);await click('reveal',2);assert.match(await p.locator('.visual-scene').innerText(),/٥١٦/);}
 if(l.slug==='multiplication-properties'){assert.equal(await p.locator('.interactive-array i').count(),12);await p.locator('[data-visual="cycle"]').focus();await p.keyboard.press('Enter');assert.match(await p.locator('.pattern').innerText(),/٤ × ٣ = ١٢/);assert.equal(await p.locator('.interactive-array i').count(),12);}
 if(l.slug==='choose-a-strategy'){await click('order',2);assert.equal(await p.locator('.strategy-path span').count(),0);assert.match(await p.locator('.scene-feedback').innerText(),/فكري/);for(let i=0;i<4;i++)await click('order',i);assert.deepEqual(await p.locator('.strategy-path span').allTextContents(),['أفهم ✓','أخطط ✓','أحل ✓','أتحقق ✓']);}
 const before=await p.locator('.visual-scene').innerText();await p.reload();assert.equal(await p.locator('.visual-scene').innerText(),before);assert.equal(await p.locator('.points b').innerText(),'٠');
 await click('page',2);for(let i=0;i<l.paragraphs.length;i++){assert.equal(await p.locator('.idea-card p').innerText(),l.paragraphs[i]);await click('cycle');}
 await p.locator(`[${attr}="1"]`).first().click();for(let i=0;i<l.examples.length;i++){await click('example',i);for(let j=0;j<l.examples[i].steps.length;j++){assert.equal(await p.locator('.solution-focus').innerText(),l.examples[i].steps[j]);if(j<l.examples[i].steps.length-1)await click('next');}await click('back');assert.equal(await p.locator('.solution-focus').innerText(),l.examples[i].steps.at(-2));}
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,l.slug);assert.equal(await p.locator('audio,video').count(),0);
 }
 assert.deepEqual(errors,[]);await ctx.close();}finally{await b.close();}
});
