import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {practice,quiz} from '../src/multiplication-lesson.js';
import {questions} from '../src/questions.js';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173/hasnaa-math/';
test('lesson: warmup, hints, scoring, original game, assessment and skill review on desktop and mobile',async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{for(const width of [1280,390,320]){
 const ctx=await browser.newContext({viewport:{width,height:900}});const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto(base+'#lessons');await p.getByRole('link',{name:'ابدئي الدرس'}).click();await p.getByRole('heading',{name:'أنماط الضرب',exact:true}).waitFor();
 await p.locator('nav [data-page="home"]').click();await p.locator('nav [data-page="lessons"]').click();await p.getByRole('link',{name:'ابدئي الدرس'}).click();await p.getByRole('heading',{name:'أنماط الضرب',exact:true}).waitFor();
 const step=async n=>{await p.locator(`[data-lesson-step="${n}"]`).first().click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);};
 await p.locator('[data-warm="16"]').click();assert.match(await p.locator('[role="status"]').innerText(),/حاولي/);await p.locator('[data-warm="60"]').click();assert.match(await p.locator('[role="status"]').innerText(),/أحسنتِ/);
 await step(1);await p.locator('summary').click();assert.ok(await p.getByText('لا؛ في',{exact:false}).isVisible());await step(2);
 for(let i=0;i<4;i++){
 await p.locator('[data-hint]').click();assert.match(await p.locator('[role="status"]').innerText(),/تلميح/);
 await p.locator(`[data-practice="${practice[i].options.find(n=>n!==practice[i].answer)}"]`).click();assert.match(await p.locator('[role="status"]').innerText(),/حاولي/);
 await p.locator(`[data-practice="${practice[i].answer}"]`).click();assert.equal(await p.locator('[data-practice]:disabled').count(),3);
 if(i<3)await p.locator('[data-practice-next]').click();
 }
 assert.equal(await p.locator('.points b').innerText(),'٤٠');await p.locator('[data-practice-prev]').click();assert.equal(await p.locator('[data-practice]:disabled').count(),3);assert.equal(await p.locator('.points b').innerText(),'٤٠');
 await step(3);await p.locator('[data-lesson-game]').click();
 for(const q of questions){await p.locator(`[data-answer="${q.answer}"]`).click();await p.locator('#next').click();}
 assert.equal(await p.locator('.points b').innerText(),'١٤٠');await p.locator('[data-lesson-return]').click();assert.match(await p.locator('.lesson-content').innerText(),/السؤال ١ من ٥/);
 await p.locator('[data-quiz-next]').click();await p.locator('[data-quiz-prev]').click();
 for(let i=0;i<5;i++){await p.locator(`[data-quiz-answer="${i===4?0:quiz[i].answer}"]`).click();if(i<4)await p.locator('[data-quiz-next]').click();}
 await p.locator('[data-quiz-prev]').click();await p.locator('[data-quiz-next]').click();await p.locator('[data-quiz-submit]').click();
 assert.match(await p.locator('.score').innerText(),/٤/);assert.match(await p.locator('.skill-grid').innerText(),/أتقنتِ/);assert.match(await p.locator('.skill-grid').innerText(),/راجعي: تطبيق الضرب/);assert.equal(await p.locator('.points b').innerText(),'١٨٠');
 await step(4);await step(5);assert.equal(await p.locator('.points b').innerText(),'١٨٠');await p.locator('[data-quiz-reset]').click();
 for(let i=0;i<5;i++){await p.locator(`[data-quiz-answer="${quiz[i].answer}"]`).click();if(i<4)await p.locator('[data-quiz-next]').click();else await p.locator('[data-quiz-submit]').click();}
 assert.equal(await p.locator('.points b').innerText(),'٢٣٠');assert.match(await p.locator('.score').innerText(),/٥/);assert.ok(!(await p.locator('.skill-grid').innerText()).includes('راجعي:'));
 await p.reload();assert.equal(await p.locator('.points b').innerText(),'٢٣٠');await step(4);for(let i=0;i<4;i++)await p.locator('[data-quiz-next]').click();assert.equal(await p.locator('[data-quiz-submit]').isDisabled(),true);
 assert.deepEqual(errors,[]);await ctx.close();
 }}finally{await browser.close();}
});
