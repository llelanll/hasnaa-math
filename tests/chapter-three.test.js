import {copySteps} from '../src/short-copy.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {chapterThree} from '../src/chapter-three-data.js';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173/hasnaa-math/';

test('chapter content has seven complete lessons and verified arithmetic samples',()=>{
 assert.equal(chapterThree.length,7);assert.equal(new Set(chapterThree.map(l=>l.slug)).size,7);
 for(const l of chapterThree){assert.ok(l.goals.length>=3);assert.ok(l.examples.length>=3);assert.ok(l.examples.every(e=>e.steps.length>=3));assert.equal(l.practice.length,4);assert.equal(l.game.length,3);assert.equal(l.quiz.length,5);for(const q of [l.warm,...l.practice,...l.game,...l.quiz]){assert.ok(q.answer>=0&&q.answer<q.options.length);assert.equal(new Set(q.options).size,q.options.length);assert.ok(q.explain);}}
 const parse=s=>Number(s.replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
 const answer=(slug,type,index)=>{const l=chapterThree.find(l=>l.slug===slug),q=l[type][index];return parse(q.options[q.answer]);};
 assert.equal(answer('distributive-property','practice',2),4*23);
 assert.equal(answer('estimating-products','game',1),Math.round(41/10)*10*Math.round(29/10)*10);
 assert.equal(answer('multiply-one-digit','practice',1),48*4);
 assert.equal(answer('multiply-two-digits','practice',2),56*13);
 assert.equal(answer('multiply-two-digits','practice',3),181*18);
 assert.equal(answer('multiplication-properties','quiz',4),13*2*10);
});
for(const width of [1280,390,320])test(`chapter three at ${width}px: all lesson interactions, feedback, scores, retry, routing and overflow`,async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{for(const l of chapterThree){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const noOverflow=async()=>assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${l.slug} at ${width}`);
  await p.goto(base+'#'+l.slug);await p.getByRole('heading',{name:l.title,exact:true,level:1}).waitFor();assert.equal(await p.locator('html').getAttribute('dir'),'rtl');
  const step=async n=>{await p.locator(`[data-ch-step="${n}"]`).first().click();await noOverflow();};
  assert.equal(await p.locator('[data-ch-step="5"]').isDisabled(),true);await noOverflow();
  await p.locator('[data-visual="page"][data-value="1"]').click();await p.locator(`[data-ch-warm="${(l.warm.answer+1)%3}"]`).click();assert.match(await p.locator('.live-feedback').innerText(),/حاولي/);await p.locator(`[data-ch-warm="${l.warm.answer}"]`).click();assert.match(await p.locator('.live-feedback').innerText(),/أحسنتِ/);
  await step(1);
  for(let i=0;i<l.examples.length;i++){await p.locator(`[data-visual="example"][data-value="${i}"]`).first().click();for(let j=1;j<l.examples[i].steps.flatMap(copySteps).length;j++)await p.locator('[data-visual="next"]').click();assert.equal(await p.locator('.example-complete').count(),1);assert.equal(await p.locator('.solution-focus').innerText(),l.examples[i].steps.flatMap(copySteps).at(-1));}
  await noOverflow();
  await step(2);
  for(let i=0;i<4;i++){
   await p.locator('[data-ch-hint]').click();assert.match(await p.locator('.live-feedback').innerText(),/تلميح/);
   await p.locator(`[data-ch-practice="${(l.practice[i].answer+1)%3}"]`).click();assert.match(await p.locator('.live-feedback').innerText(),/حاولي/);
   await p.locator(`[data-ch-practice="${l.practice[i].answer}"]`).click();assert.equal(await p.locator('[data-ch-practice]:disabled').count(),3);await noOverflow();if(i<3)await p.locator('[data-ch-practice-next]').click();
  }
  assert.equal(await p.locator('.points b').innerText(),'٤٠');await p.locator('[data-ch-practice-prev]').click();assert.equal(await p.locator('[data-ch-practice]:disabled').count(),3);assert.equal(await p.locator('.points b').innerText(),'٤٠');
  await step(3);for(let i=0;i<3;i++){const n=i===0?(l.game[i].answer+1)%3:l.game[i].answer;await p.locator(`[data-ch-game="${n}"]`).click();if(i===0){assert.equal(await p.locator('[data-ch-game]:disabled').count(),0);assert.equal(await p.locator('[data-ch-game].correct').count(),0);await p.locator(`[data-ch-game="${n}"]`).click();}assert.equal(await p.locator('[data-ch-game]:disabled').count(),3);assert.equal(await p.locator('[data-ch-game].correct').count(),1);await noOverflow();await p.locator('[data-ch-game-next]').click();}
  assert.equal(await p.locator('.points b').innerText(),'٦٠');await step(4);
  await p.locator('[data-ch-quiz-jump="4"]').click();assert.equal(await p.locator('[data-ch-submit]').isDisabled(),true);await p.locator('[data-ch-quiz-jump="0"]').click();
  for(let i=0;i<5;i++){const n=i===4?(l.quiz[i].answer+1)%3:l.quiz[i].answer;await p.locator(`[data-ch-quiz="${n}"]`).click();assert.equal(await p.locator('[data-ch-quiz][aria-pressed="true"]').count(),1);assert.equal(await p.locator('[data-ch-quiz].correct').count(),0);await noOverflow();if(i<4)await p.locator('[data-ch-quiz-next]').click();}
  await p.locator('[data-ch-quiz-prev]').click();await p.locator('[data-ch-quiz-next]').click();await p.locator('[data-ch-submit]').click();assert.equal(await p.locator('.score').count(),0);await p.locator(`[data-ch-quiz="${(l.quiz[4].answer+1)%3}"]`).click();await p.locator('[data-ch-submit]').click();
  assert.match(await p.locator('.score').innerText(),/٤/);assert.ok(await p.locator('.skill-review').count()>0);assert.equal(await p.locator('.points b').innerText(),'١٠٠');await noOverflow();await step(4);await step(5);assert.equal(await p.locator('.points b').innerText(),'١٠٠');
  await p.locator('nav [data-page="lessons"]').click();assert.equal(await p.locator('.chapter-card').count(),8);await noOverflow();await p.locator(`.chapter-card[href="#${l.slug}"]`).click();assert.match(await p.locator('.score').innerText(),/٤/);
  await p.locator('[data-ch-quiz-reset]').click();for(let i=0;i<5;i++){await p.locator(`[data-ch-quiz="${l.quiz[i].answer}"]`).click();if(i<4)await p.locator('[data-ch-quiz-next]').click();else await p.locator('[data-ch-submit]').click();}
  assert.equal(await p.locator('.skill-review').count(),0);assert.equal(await p.locator('.points b').innerText(),'١٥٠');
  await step(3);await p.locator('[data-ch-game-reset]').click();for(let i=0;i<3;i++){await p.locator(`[data-ch-game="${l.game[i].answer}"]`).click();await p.locator('[data-ch-game-next]').click();}assert.equal(await p.locator('.points b').innerText(),'١٨٠');
  await p.reload();assert.equal(await p.locator('.points b').innerText(),'١٨٠');assert.equal(await p.locator('[data-ch-step="5"]').isDisabled(),false);await noOverflow();
  assert.deepEqual(errors,[],l.slug);console.log(`verified ${l.slug} ${width}px`);await ctx.close();
 }}finally{await browser.close();}
});
