import {existsSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {chapterThree} from '../src/chapter-three-data.js';
import {quiz} from '../src/multiplication-lesson.js';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173/hasnaa-math/';
const list=[{slug:'multiplication-patterns',quiz},...chapterThree];
for(const width of [1280,320])test(`progress at ${width}px: eight lessons, last and best scores, navigation, reload and restored browser`,async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{const ctx=await b.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});await ctx.addInitScript(()=>{if(!localStorage.getItem('hasnaa-points'))localStorage.setItem('hasnaa-points','73');});const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(let n=0;n<list.length;n++){
  const l=list[n],old=n===0;await p.goto(base+'#'+l.slug);await p.locator('h1').waitFor();assert.equal(await p.locator('.lesson-navigation').getByRole('link',{name:'الدرس السابق'}).count(),n===0?0:1);assert.equal(await p.locator('.lesson-navigation').getByRole('link',{name:'الدرس التالي'}).count(),n===7?0:1);
  await p.locator(old?'[data-lesson-step="4"]':'[data-ch-step="4"]').first().click();for(let i=0;i<5;i++){await p.locator(`[${old?'data-quiz-answer':'data-ch-quiz'}="${l.quiz[i].answer}"]`).click();if(i<4)await p.locator(old?'[data-quiz-next]':'[data-ch-quiz-next]').click();else await p.locator(old?'[data-quiz-submit]':'[data-ch-submit]').click();}
  assert.equal(await p.locator('.skill-grid').count(),1);const record=await p.evaluate(slug=>JSON.parse(localStorage.getItem('hasnaa-learning-v2')).lessons[slug],l.slug);assert.equal(record.last,5);assert.equal(record.best,5);assert.equal(record.completed,true);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await p.reload();assert.match(await p.locator('.score').innerText(),/٥/);const imgs=p.locator('.mentor img');for(let i=0;i<await imgs.count();i++){await imgs.nth(i).scrollIntoViewIfNeeded();await p.waitForFunction(el=>el.complete&&el.naturalWidth>0,await imgs.nth(i).elementHandle());}
 }
 // A lower second result changes last, retains the best and chapter completion.
 const l=list[1];await p.goto(base+'#'+l.slug);await p.locator('[data-ch-step="4"]').first().click();await p.locator('[data-ch-quiz-reset]').click();for(let i=0;i<5;i++){const a=i<2?l.quiz[i].answer:(l.quiz[i].answer+1)%3;await p.locator(`[data-ch-quiz="${a}"]`).click();if(i<4)await p.locator('[data-ch-quiz-next]').click();else await p.locator('[data-ch-submit]').click();}assert.equal(await p.locator('.score').count(),0);
 for(let i=2;i<5;i++){await p.locator(`[data-ch-quiz="${(l.quiz[i].answer+1)%3}"]`).click();if(i<4)await p.locator('[data-ch-quiz-next]').click();else await p.locator('[data-ch-submit]').click();}
 const r=await p.evaluate(()=>JSON.parse(localStorage.getItem('hasnaa-learning-v2')).lessons['distributive-property']);assert.equal(r.last,2);assert.equal(r.best,5);assert.equal(r.attempts,2);
 await p.goto(base+'#chapter-three');assert.equal(await p.locator('.chapter-card').count(),8);assert.match(await p.locator('.chapter-meter').innerText(),/أنجزتِ ٨ من ٨/);assert.equal(await p.locator('[role="progressbar"]').getAttribute('aria-valuenow'),'8');
 await p.goto(base+'#progress');assert.match(await p.locator('h1').innerText(),/لوحة التقدم/);assert.equal(await p.evaluate(()=>Number(localStorage.getItem('hasnaa-points'))),473);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const saved=await ctx.storageState();const reopened=await b.newContext({storageState:saved,viewport:{width,height:1000}});const rpage=await reopened.newPage();await rpage.goto(base+'#progress');assert.match(await rpage.locator('[data-chapter="3"] .chapter-meter').innerText(),/أنجزتِ ٨ من ٨/);assert.equal(await rpage.evaluate(()=>Number(localStorage.getItem('hasnaa-points'))),473);await reopened.close();assert.deepEqual(errors,[]);await ctx.close();
 }finally{await b.close();}
});
