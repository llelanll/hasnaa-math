import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chromium} from '@playwright/test';
import {domains, skills, questions} from '../src/nafs/bank.js';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173/hasnaa-math/';
const bank = new Map(questions.map(q => [q.id, q]));
const ar = n => Number(n).toLocaleString('ar-SA', {useGrouping:false});
const balance = '137';
const learning = JSON.stringify({version:2,
  lessons:{'multiplication-patterns':{completed:true,last:3,best:5,total:5,attempts:2,updated:1700000000000}},
  states:{'curriculum:c1-l1':{stage:2}},
  facts:{'7:8':{correct:2,wrong:1,first:2}},
  tables:{'7':{last:90,best:100,attempts:3,mode:'practice'}},
  rewards:{'table:7:8':true,'legacy:patterns-game:0':true}});
const launch = () => chromium.launch({executablePath:process.env.CHROMIUM_PATH ||
  (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args:['--no-sandbox']});

async function unchanged(page) {
  const state = await page.evaluate(() => ({balance:localStorage.getItem('hasnaa-points'),
    learning:localStorage.getItem('hasnaa-learning-v2')}));
  assert.deepEqual(state, {balance,learning}, 'Nafis never writes the point balance or existing learning/reward store');
}
async function question(page) {
  await page.locator('[data-nafs-question]').waitFor();
  const q = bank.get(await page.locator('[data-nafs-question]').getAttribute('data-nafs-question'));
  assert.ok(q, 'visible question exists in the classified bank');
  assert.equal(await page.locator('[data-nafs-answer]').count(), 4);
  const classification = await page.locator('.nafs-classification').innerText();
  assert.ok(classification.includes('المجال:'));
  assert.ok(classification.includes('المهارة:'));
  assert.ok(classification.includes(domains.find(d => d.id === q.domain).title));
  assert.ok(classification.includes(skills.find(s => s.id === q.skill).title));
  assert.equal(await page.locator('.points,.stars,.earned').count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  return q;
}
async function answer(page, q, kind = 'correct') {
  const wrong = [0,1,2,3].filter(i => i !== q.answer);
  if (kind !== 'correct') {
    await page.locator(`[data-nafs-answer="${wrong[0]}"]`).click();
    assert.equal(await page.locator('[data-nafs-next]').count(), 0);
    assert.equal(await page.locator('.nafs-choices .correct').count(), 0);
    assert.equal(await page.locator('[data-nafs-answer]:disabled').count(), 1);
    assert.match(await page.locator('.nafs-feedback').innerText(), /مرة ثانية/);
    assert.equal(await page.locator('.nafs-feedback p').innerText(), q.hint);
    assert.notEqual(await page.locator('.nafs-feedback p').innerText(), q.explanation);
  }
  await page.locator(`[data-nafs-answer="${kind === 'wrong' ? wrong[1] : q.answer}"]`).click();
  await page.locator('[data-nafs-next]').waitFor();
  assert.equal(await page.locator('[data-nafs-answer]:disabled').count(), 4);
  assert.equal(await page.locator('.nafs-choices .correct').count(), 1);
  assert.equal(await page.locator('.nafs-feedback p').innerText(), q.explanation);
  await unchanged(page);
}
async function next(page) { await page.locator('[data-nafs-next]').click(); }
async function result(page, correct, total) {
  await page.locator('.nafs-result').waitFor();
  assert.equal(await page.locator('.nafs-result>h2').innerText(), `نتيجتكِ: ${ar(correct)} من ${ar(total)}`);
  assert.equal(await page.locator('.points,.stars,.earned').count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.match(await page.locator('footer').innerText(), /جميع الحقوق محفوظة للأستاذة حسناء الحارثي/);
  await unchanged(page);
}

for (const width of [1280,390]) test(`Nafis at ${width}px: classification, second chances, diagnosis, targeted retraining, all modes and independent durable storage`, async () => {
  const browser = await launch();
  try {
    const context = await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
    await context.addInitScript(({balance,learning}) => {
      if (localStorage.getItem('hasnaa-points') === null) {
        localStorage.setItem('hasnaa-points',balance);
        localStorage.setItem('hasnaa-learning-v2',learning);
      }
    }, {balance,learning});
    const page = await context.newPage(), errors = [], requests = [];
    page.on('request', r => requests.push(r.url()));
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(base + '#home');
    await page.locator('.hero').waitFor();
    const bankRequest = url => /\/assets\/view-|\/src\/nafs\/(?:view|bank)\.js/.test(url);
    assert.ok(!requests.some(bankRequest), 'Nafis bank stays unloaded on home');
    assert.equal(await page.locator('.home-side-character').count(), 2);
    assert.equal(await page.locator('nav [data-page="nafs"]').count(), 1);
    await page.locator('.nafs-entry a[href="#nafs"]').click();
    await page.locator('.nafs-domains').waitFor();
    assert.ok(requests.some(bankRequest), 'Nafis code loads on entry');
    assert.equal(await page.locator('.nafs-domains>a').count(), 4);
    await unchanged(page);
    const skill = skills[0];
    await page.locator(`a[href="#nafs-domain-${skill.domain}"]`).click();
    await page.locator('.nafs-skills').waitFor();
    assert.equal(await page.locator('.nafs-skills>a').count(), skills.filter(s => s.domain === skill.domain).length);
    await page.locator(`a[href="#nafs-skill-${skill.id}"]`).click();
    let q = await question(page);
    const firstId = q.id, wrong = [0,1,2,3].find(i => i !== q.answer);
    await page.locator(`[data-nafs-answer="${wrong}"]`).click();
    await page.reload();
    q = await question(page);
    assert.equal(q.id, firstId, 'refresh preserves the same question and the first mistake');
    assert.equal(await page.locator(`[data-nafs-answer="${wrong}"]`).isDisabled(), true);
    assert.equal(await page.locator('[data-nafs-next]').count(), 0);
    assert.equal(await page.locator('.nafs-feedback p').innerText(), q.hint);
    await page.locator(`[data-nafs-answer="${q.answer}"]`).click();
    await next(page);
    await answer(page, await question(page)); await next(page);
    await answer(page, await question(page), 'wrong'); await next(page);
    await answer(page, await question(page)); await next(page);
    await result(page,2,4);
    assert.match(await page.locator('.nafs-result>p').first().innerText(), /بعد التلميح في ١/);
    assert.match(await page.locator('.nafs-analysis').innerText(), /٥٠٪/);
    const completedId = await page.evaluate(() => JSON.parse(localStorage.getItem('hasnaa-nafs-v1')).active.id);
    await page.locator(`[data-nafs-retrain="${skill.id}"]`).click();
    q = await question(page);
    assert.equal(q.skill, skill.id);
    const newSession = await page.evaluate(() => JSON.parse(localStorage.getItem('hasnaa-nafs-v1')).active);
    assert.notEqual(newSession.id, completedId, 'targeted practice is a fresh session');
    assert.equal(newSession.index,0); assert.equal(newSession.records.length,0);
    for (let i = 0; i < 4; i++) { const item = await question(page); assert.equal(item.skill,skill.id); await answer(page,item); await next(page); }
    await result(page,4,4);
    assert.equal(await page.locator('[data-nafs-retrain]').count(),0);

    await page.goto(base + '#nafs-mixed');
    const mixed = new Set();
    for (let i = 0; i < 8; i++) { const item = await question(page); mixed.add(item.domain); await answer(page,item); await next(page); }
    assert.equal(mixed.size,4); await result(page,8,8);
    await page.goto(base + '#nafs-simulation');
    const simulation = new Set(), questionIds = new Set();
    for (let i = 0; i < 10; i++) {
      const item = await question(page); simulation.add(item.domain); questionIds.add(item.id);
      await answer(page,item,i % 2 ? 'assisted' : 'correct'); await next(page);
    }
    assert.equal(simulation.size,4); assert.equal(questionIds.size,10);
    await result(page,5,10);
    assert.match(await page.locator('.nafs-result>p').first().innerText(), /بعد التلميح في ٥/);
    assert.equal(await page.locator('.nafs-analysis>section').count(),4);
    assert.ok(await page.locator('[data-nafs-retrain]').count() > 0);
    await page.reload(); await result(page,5,10);
    await page.goto(base + '#nafs-history');
    await page.locator('.nafs-history').waitFor();
    assert.equal(await page.locator('[data-nafs-history]').count(),4);
    await page.reload(); await page.locator('.nafs-history').waitFor();
    assert.equal(await page.locator('[data-nafs-history]').count(),4);
    await page.locator('[data-nafs-history]').first().click(); await result(page,5,10);
    await page.goto(base + '#home'); await page.locator('.hero').waitFor();
    assert.equal(await page.locator('.points b').innerText(),'١٣٧');
    await unchanged(page);
    assert.equal(await page.locator('audio,video').count(),0);
    assert.deepEqual(errors,[]);
    await context.close();
  } finally { await browser.close(); }
});

test('Nafis visuals at 320px and navigation at 1024px: Arabic digits, expression glyph order, scale and RTL', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({viewport:{width:320,height:900},reducedMotion:'reduce'}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const ids = new Set();
    for (const type of ['sequence','coordinate','fraction','table','bars','shape','grid']) {
      const q = questions.find(item => item.visual?.type === type);
      if (q) ids.add(q.id);
    }
    for (const q of questions.filter(item => item.visual?.type === 'bars')) ids.add(q.id);
    for (const q of questions.filter(item => /[×÷=<>]/u.test(item.question)).slice(0,5)) ids.add(q.id);
    for (const id of ids) {
      const q = bank.get(id);
      await page.goto(base + '#nafs'); await page.locator('.nafs-domains').waitFor();
      // A valid saved one-item practice lets the UI audit the exact authored visual,
      // including a question that a shuffled session might not otherwise select.
      await page.evaluate(q => {localStorage.setItem('hasnaa-nafs-v1',JSON.stringify({history:[],active:{
        id:'visual-audit-'+q.id,mode:'skill',skillId:q.skill,questionIds:[q.id],index:0,records:[],finished:false,started:1700000000000
      }}));history.replaceState(null,'','#nafs-skill-'+q.skill);}, q);
      await page.reload();
      const shown = await question(page);
      assert.equal(shown.id,id);
      if (q.visual) assert.equal(await page.locator('.nafs-visual').count(),1);
      if (q.visual?.type === 'bars') {
        const geometry = await page.locator('.nafs-bar-chart').evaluate(el => ({
          ticks:[...el.querySelectorAll('.nafs-axis span')].map(span => {
            const r=span.getBoundingClientRect();
            return {value:Number(span.textContent.replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c))),y:r.top+r.height/2};
          }),
          bars:[...el.querySelectorAll('.nafs-bars i')].map(bar => {
            const r=bar.getBoundingClientRect();return {bottom:r.bottom,height:r.height};
          })
        }));
        const maximum=Math.max(...q.visual.values,1),scale=maximum<=10?1:Math.ceil(maximum/5),top=Math.ceil(maximum/scale)*scale;
        const baseline=geometry.bars[0].bottom;
        for(const tick of geometry.ticks)assert.ok(Math.abs(tick.y-(baseline-tick.value/top*120))<1.5,`axis value ${tick.value} aligns with the bar scale`);
        for(const [index,bar]of geometry.bars.entries()){
          assert.ok(Math.abs(bar.bottom-baseline)<1,'bars share a zero baseline');
          assert.ok(Math.abs(bar.height-q.visual.values[index]/top*120)<1,'bar length represents its quantity');
        }
      }
      assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
      assert.equal(/[0-9]/u.test(await page.locator('.nafs-question').innerText()),false,'visible numbers remain Arabic');
      const bad = await page.locator('.nafs-question .math-content').evaluateAll(els => els.flatMap(el => {
        if (getComputedStyle(el).direction !== 'ltr') return [el.textContent];
        const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),positions=[];let node;
        while(node=walker.nextNode())for(let i=0;i<node.length;i++) {
          if(/\s/u.test(node.textContent[i]))continue;
          const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);
          const r=range.getBoundingClientRect();if(r.width>0)positions.push({x:r.left,y:r.top});
        }
        return positions.every((r,i)=>!i||r.y>positions[i-1].y+2||(Math.abs(r.y-positions[i-1].y)<3&&r.x>=positions[i-1].x-1)) ? [] : [el.textContent];
      }));
      assert.deepEqual(bad,[],id);
    }
    await page.setViewportSize({width:1024,height:900});
    await page.goto(base + '#home'); await page.locator('.hero').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
    assert.equal(await page.locator('nav [data-page]').count(),7);
    assert.equal(await page.locator('nav').evaluate(el => {const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}),true);
    assert.deepEqual(errors,[]);
  } finally { await browser.close(); }
});
