import {existsSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {allFacts,makeQuestion,buildQueue,normalizeNumber} from '../src/times-tables.js';
import {recordFact} from '../src/progress.js';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173/hasnaa-math/';
const ar=n=>n.toLocaleString('ar-SA');
const numeric=s=>s.replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/؟/g,'?');
async function respond(p,wrong=false){const label=await p.locator('.table-round h2').innerText();const q=numeric(await p.locator('.table-round h2 .equation').innerText());const nums=q.match(/\d+|\?/g);let answer;if(label.includes('هل العبارة'))answer=Number(nums[0])*Number(nums[1])===Number(nums[2])?'true':'false';else if(nums[1]==='?')answer=Number(nums[2])/Number(nums[0]);else answer=Number(nums[0])*Number(nums[1]);if(wrong)answer=typeof answer==='string'?(answer==='true'?'false':'true'):answer+1;
 if(await p.locator('#table-answer-input').count()){await p.locator('#table-answer-input').fill(ar(answer).replace(/٬/g,''));await p.locator('#table-answer-form button').click();}else if(await p.locator(`[data-table-answer="${answer}"]`).count())await p.locator(`[data-table-answer="${answer}"]`).click();else await p.locator('[data-table-answer]').filter({hasNotText:String(answer)}).first().click();return answer;}

test('all 121 products, four question types, zero-safe missing factors, normalization and adaptive priorities',()=>{
 assert.equal(allFacts.length,121);assert.equal(new Set(allFacts.map(f=>`${f.a}:${f.b}`)).size,121);
 for(let a=0;a<=10;a++)for(let b=0;b<=10;b++){const f=allFacts.find(f=>f.a===a&&f.b===b);assert.equal(f.product,Array(a).fill(b).reduce((x,y)=>x+y,0));for(let i=0;i<4;i++){const q=makeQuestion(f,i,()=>0.7);if(q.kind==='choice'){assert.ok(q.options.includes(a*b));assert.equal(new Set(q.options).size,4);}if(q.kind==='write')assert.equal(q.answer,a*b);if(q.kind==='missing'){assert.notEqual(a,0);assert.equal(a*q.answer,a*b);}if(q.kind==='boolean')assert.equal(q.answer,String(a*b===q.shown));}}
 assert.equal(normalizeNumber(''),null);assert.equal(normalizeNumber('٠'),0);assert.equal(normalizeNumber('١٠٠'),100);assert.equal(normalizeNumber('۱۲'),12);assert.equal(normalizeNumber('١.٥'),null);
 for(let i=0;i<20;i++)recordFact(7,8,false,false);assert.deepEqual([buildQueue(null,()=>0.5)[0].a,buildQueue(null,()=>0.5)[0].b],[7,8]);
 for(let a=0;a<=10;a++){const q=buildQueue(a);assert.equal(q.length,11);assert.equal(new Set(q.map(f=>f.b)).size,11);assert.ok(q.every(f=>f.a===a));}
});
for(const width of [1280,390])test(`tables at ${width}px: every fact, modes, second chances, durable rewards, mastery and timer`,async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{const ctx=await b.newContext({viewport:{width,height:950},reducedMotion:'reduce'});const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto(base+'#home');await p.getByRole('link',{name:'تدرّبي على جدول الضرب'}).click();assert.equal(await p.locator('[data-table-select]').count(),12);
 const noOverflow=async()=>assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 for(let a=0;a<=10;a++){
  await p.locator(`[data-table-select="${a}"]`).click();assert.equal(await p.locator('[data-table-fact]').count(),11);await p.locator(`[data-table-fact="${a}:10"]`).click();assert.equal(await p.locator('.fact-array i').count(),a*10);await noOverflow();
  await p.locator('[data-table-mode="practice"]').click();await p.locator('[data-table-start="practice"]').click();
  for(let i=0;i<11;i++){await respond(p);await noOverflow();await p.locator('[data-table-next]').click();}
  assert.match(await p.locator('.result .score').innerText(),/١١/);assert.equal(await p.evaluate(()=>Number(localStorage.getItem('hasnaa-points'))),(a+1)*110);await p.locator('[data-table-back]').click();console.log(`verified table ${a} at ${width}px`);
 }
 // Replaying the same eleven facts increases mastery, never the points.
 await p.locator('[data-table-select="0"]').click();await p.locator('[data-table-mode="practice"]').click();await p.locator('[data-table-start="practice"]').click();for(let i=0;i<11;i++){await respond(p);await p.locator('[data-table-next]').click();}assert.equal(await p.evaluate(()=>Number(localStorage.getItem('hasnaa-points'))),1210);
 await p.getByRole('link',{name:'شاهدي الإتقان'}).click();await p.getByRole('heading',{level:1,name:'إتقان جداول الضرب',exact:true}).waitFor();assert.equal(await p.locator('[data-table-select]').count(),11);assert.match(await p.locator('[data-table-select="0"]').innerText(),/١٠٠/);assert.match(await p.locator('[data-table-select="0"] .table-stars').getAttribute('aria-label'),/٣ نجوم/);
 const saved=await ctx.storageState();const reopened=await b.newContext({viewport:{width,height:950},storageState:saved});const r=await reopened.newPage();await r.goto(base+'#table-mastery');assert.match(await r.locator('[data-table-select="0"]').innerText(),/١٠٠/);assert.equal(await r.evaluate(()=>Number(localStorage.getItem('hasnaa-points'))),1210);await reopened.close();
 await p.goto(base+'#multiplication-tables');await p.locator('[data-table-select="mixed"]').click();assert.equal(await p.locator('[data-table-fact]').count(),121);await p.locator('[data-table-mode="practice"]').click();await p.locator('[data-table-start="practice"]').click();
 // First error does not reveal an explanation, lock options, or advance.
 await respond(p,true);assert.equal(await p.locator('[data-table-next]').count(),0);assert.match(await p.locator('.table-feedback').innerText(),/محاولة ثانية/);assert.ok(!(await p.locator('.table-feedback').innerText()).includes('إذن'));
 await respond(p,true);assert.equal(await p.locator('[data-table-next]').count(),1);assert.match(await p.locator('.table-feedback').innerText(),/إذن/);await p.locator('[data-table-next]').click();
 for(let i=1;i<22;i++){await respond(p);await p.locator('[data-table-next]').click();}assert.match(await p.locator('.result .score').innerText(),/٢١/);assert.equal(await p.evaluate(()=>Number(localStorage.getItem('hasnaa-points'))),1210);
 await p.clock.install();await p.locator('[data-table-mode="speed"]').click();await p.locator('[data-table-start="speed"]').click();assert.match(await p.locator('#speed-timer').innerText(),/٦٠/);await respond(p);await p.locator('[data-table-next]').click();await p.clock.fastForward(61000);await p.locator('.result').waitFor();assert.match(await p.locator('.result .score').innerText(),/١/);await noOverflow();
 assert.equal(await p.evaluate(()=>Number(localStorage.getItem('hasnaa-points'))),1210);assert.deepEqual(errors,[]);await ctx.close();
 }finally{await b.close();}
});

test('fact rewards read the durable ledger before crediting another open tab',async()=>{
 const {addPoints,getPoints,STORAGE_KEY}=await import('../src/progress.js');
 const storage=new Map([['hasnaa-points','73']]);globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))};
 try{assert.equal(addPoints(10,'first-fact'),10);assert.equal(getPoints(),83);assert.equal(addPoints(10,'first-fact'),0);
 const saved=JSON.parse(storage.get(STORAGE_KEY));saved.rewards['other-tab-fact']=true;storage.set(STORAGE_KEY,JSON.stringify(saved));storage.set('hasnaa-points','93');assert.equal(addPoints(10,'other-tab-fact'),0);assert.equal(getPoints(),93);
 }finally{delete globalThis.localStorage;}
});
