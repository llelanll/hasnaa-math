import {existsSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {questions} from '../src/questions.js';

test('ten valid distinct questions',()=>{assert.equal(questions.length,10);assert.equal(new Set(questions.map(q=>q.pattern)).size,10);for(const q of questions){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.answer));}});
test('desktop and mobile: full rounds, correction, score, retry and navigation',async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
 try {for(const width of [1280,390]){
  const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.TEST_BASE_URL || 'http://127.0.0.1:5173/hasnaa-math/');await page.getByRole('heading',{level:1}).waitFor();
  assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('[data-start="game"]').first().click();
  for(let i=0;i<10;i++){
   const correct=i%2===0;const q=questions[i];const answer=correct?q.answer:q.options.find(v=>v!==q.answer);
   await page.locator(`[data-answer="${answer}"]`).click();
   if(!correct){assert.equal(await page.locator('.answer:disabled').count(),0);assert.equal(await page.locator('.answer.correct').count(),0);assert.ok(!(await page.locator('#feedback').innerText()).includes(q.explanation));await page.locator(`[data-answer="${answer}"]`).click();}
   assert.equal(await page.locator('.answer:disabled').count(),4);
   assert.equal(await page.locator('.answer.correct').count(),1);
   assert.ok((await page.locator('#feedback').innerText()).includes(q.explanation));
   assert.equal(await page.locator(correct?'.success':'.retry').count(),1);
   await page.locator('#next').click();
  }
  assert.ok((await page.locator('.score').innerText()).includes('٥'));
  assert.equal(await page.locator('.stars').getAttribute('aria-label'),'٢ نجوم من ٣');
  assert.equal(await page.locator('.points b').innerText(),'٥٠');
  await page.getByRole('button',{name:'حاولي مرة أخرى'}).click();
  assert.ok((await page.locator('.progress-label').innerText()).includes('السؤال ١ من ١٠'));
  assert.equal(await page.locator('.answer:disabled').count(),0);
  for(const q of questions){await page.locator(`[data-answer="${q.answer}"]`).click();await page.locator('#next').click();}
  assert.equal(await page.locator('.stars').getAttribute('aria-label'),'٣ نجوم من ٣');
  assert.equal(await page.locator('.points b').innerText(),'١٠٠');
  await page.reload();assert.equal(await page.locator('.points b').innerText(),'١٠٠');
  for(const section of ['lessons','games','quiz','challenges']){await page.locator(`nav [data-page="${section}"]`).click();assert.ok(await page.locator('h1').isVisible());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
  await page.locator('[data-start="challenge"]').click();
  for(const q of questions){await page.locator(`[data-answer="${q.options.find(v=>v!==q.answer)}"]`).click();await page.locator(`[data-answer="${q.options.find(v=>v!==q.answer)}"]`).click();await page.locator('#next').click();}
  assert.equal(await page.locator('.stars').getAttribute('aria-label'),'٠ نجوم من ٣');
  assert.ok((await page.locator('.encouragement').innerText()).includes('كل محاولة'));
  assert.deepEqual(errors,[]);await context.close();
 }}finally{await browser.close();}
});
