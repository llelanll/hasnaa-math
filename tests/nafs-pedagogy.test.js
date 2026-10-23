import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {domains,skills,questions} from '../src/nafs/bank.js';
import {createSession,questionById} from '../src/nafs/model.js';

const baseline=JSON.parse(readFileSync(new URL('../docs/nafs-review-before.json',import.meta.url),'utf8'));
const before=new Map(baseline.questions.map(q=>[q.id,q]));
const levels=['direct','understanding','application','reasoning'];
const visible=q=>Object.fromEntries(['question','choices','answer','explanation','hint','visual'].filter(key=>q[key]!==undefined).map(key=>[key,q[key]]));
const normalize=text=>String(text).normalize('NFC').replace(/[\u064B-\u065F\u0670]/g,'').replace(/\s+/g,' ').trim();
const instruction=text=>normalize(text).replace(/[0-9٠-٩۰-۹]+(?:[٫.,/][0-9٠-٩۰-۹]+)*/g,'#');

test('Nafis review preserves the four domains, forty skills, item identities and historical answer positions',()=>{
  assert.deepEqual(domains,baseline.domains);
  assert.deepEqual(skills,baseline.skills);
  assert.equal(questions.length,160);
  assert.deepEqual(questions.map(q=>q.id).toSorted(),[...before.keys()].toSorted());
  for(const q of questions){
    const old=before.get(q.id);
    assert.equal(q.skill,old.skill,q.id);
    assert.equal(q.domain,old.domain,q.id);
    assert.equal(q.answer,old.answer,`${q.id}: prior diagnostic records keep their meaning`);
  }
});

test('all 160 items have an explicit educational review and truthful change classification',()=>{
  const counts={unchanged:0,reworded:0,replaced:0};
  for(const q of questions){
    assert.ok(levels.includes(q.cognitiveLevel),q.id);
    assert.ok(q.review&&Object.hasOwn(counts,q.review.status),q.id);
    assert.ok(q.review.reason?.length>=12,`${q.id}: reason for pedagogical decision`);
    assert.ok(q.review.cognitiveRationale?.length>=12,`${q.id}: actual thinking demand`);
    assert.ok(Array.isArray(q.review.distractorRationales)&&q.review.distractorRationales.length===3,`${q.id}: three anticipated misconceptions`);
    assert.ok(q.review.distractorRationales.every(reason=>typeof reason==='string'&&reason.length>=7),q.id);
    counts[q.review.status]++;
    const identical=JSON.stringify(visible(q))===JSON.stringify(visible(before.get(q.id)));
    assert.equal(identical,q.review.status==='unchanged',`${q.id}: unchanged/revised report must match actual learner-facing content`);
  }
  assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),160);
  console.log(`Educational change audit: ${JSON.stringify(counts)}`);
});

test('every skill contains genuinely different task wording and all four thinking levels',()=>{
  const global=new Set();
  for(const skill of skills){
    const pool=questions.filter(q=>q.skill===skill.id);
    assert.equal(pool.length,4,skill.id);
    assert.deepEqual(pool.map(q=>q.cognitiveLevel).toSorted(),levels.toSorted(),skill.id);
    assert.ok(new Set(pool.map(q=>instruction(q.question))).size>=3,`${skill.id}: changing only numerals cannot create cognitive diversity`);
    for(const q of pool){
      const signature=JSON.stringify([normalize(q.question),q.visual||null,q.choices]);
      assert.ok(!global.has(signature),`${q.id}: exact repeated learner-facing question`);
      global.add(signature);
      const correct=normalize(q.choices[q.answer]);
      if(correct.length>=5) assert.ok(!normalize(q.hint).includes(correct),`${q.id}: hint must not quote the correct option`);
    }
  }
});

test('short simulations balance domains and reasoning levels across many deterministic random streams',()=>{
  for(let seed=1;seed<=200;seed++){
    let state=seed;
    const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/2**32);
    const session=createSession('simulation',null,random);
    const selected=session.questionIds.map(id=>questionById.get(id));
    assert.equal(selected.length,10);
    assert.equal(new Set(session.questionIds).size,10);
    for(const domain of domains){const count=selected.filter(q=>q.domain===domain.id).length;assert.ok(count>=2&&count<=3,`${domain.id}: ${count}`);}
    for(const level of levels){const count=selected.filter(q=>q.cognitiveLevel===level).length;assert.ok(count>=2&&count<=3,`${level}: ${count}`);}
    assert.ok(selected.filter(q=>q.cognitiveLevel==='direct').length<=3,'direct recall cannot dominate a simulation');
  }
});
