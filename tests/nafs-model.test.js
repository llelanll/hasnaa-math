import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {domains, skills} from '../src/nafs/bank.js';
import {STORAGE_KEY, createSession, currentQuestion, respond, advance, settled, analyse,
  restoreSession, loadStore, saveStore, questionById} from '../src/nafs/model.js';

test('all queue modes have exact lengths, unique questions and balanced coverage', () => {
  for (let i = 0; i < 100; i++) for (const mode of ['mixed', 'simulation']) {
    const s = createSession(mode);
    assert.equal(s.questionIds.length, mode === 'mixed' ? 8 : 10);
    assert.equal(new Set(s.questionIds).size, s.questionIds.length);
    for (const d of domains) {
      const count = s.questionIds.filter(id => questionById.get(id).domain === d.id).length;
      assert.ok(count >= 2 && count <= 3);
    }
  }
  for (const skill of skills) {
    const s = createSession('skill', skill.id);
    assert.equal(s.questionIds.length, 4);
    assert.ok(s.questionIds.every(id => questionById.get(id).skill === skill.id));
  }
  assert.throws(() => createSession('skill', 'missing'));
});

test('first-attempt diagnosis differs from assisted learning; no skipping or repeated answers', () => {
  const s = createSession('skill', skills[0].id), q = () => currentQuestion(s);
  assert.equal(advance(s), false);
  assert.equal(respond(s, -1), false);
  assert.equal(respond(s, (q().answer + 1) % 4), true);
  assert.equal(settled(s), false);
  assert.equal(respond(s, (q().answer + 1) % 4), false);
  assert.equal(advance(s), false);
  assert.equal(respond(s, q().answer), true);
  assert.equal(respond(s, q().answer), false);
  assert.equal(advance(s), true);
  respond(s, q().answer); advance(s);
  respond(s, (q().answer + 1) % 4); respond(s, (q().answer + 2) % 4); advance(s);
  respond(s, (q().answer + 1) % 4); respond(s, q().answer); advance(s);
  assert.equal(s.finished, true);
  assert.equal(advance(s), false);
  assert.equal(respond(s, q().answer), false);
  const a = analyse(s);
  assert.equal(a.total, 4); assert.equal(a.correct, 1); assert.equal(a.assisted, 2);
  assert.equal(a.skills.length, 1); assert.equal(a.skills[0].correct, 1);
});

test('all intermediate attempts and final results reconstruct exactly after reload', () => {
  const s = createSession('simulation');
  assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(s))), s);
  for (let i = 0; i < 10; i++) {
    const q = currentQuestion(s);
    respond(s, (q.answer + 1) % 4);
    assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(s))), s);
    respond(s, q.answer);
    assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(s))), s);
    advance(s);
    assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(s))), s);
  }
  assert.equal(restoreSession({...s, questionIds:['unknown']}), null);
  assert.equal(restoreSession({...s, questionIds:[s.questionIds[0],s.questionIds[0]]}), null);
  assert.equal(restoreSession({...s, records:[{choices:[4]}]}), null);
  assert.equal(restoreSession({...s, index:99}), null);
  const unfinished = createSession('mixed');
  assert.equal(restoreSession({...unfinished, finished:true}), null);
});

test('local diagnostic storage writes only its own key and tolerates damaged or unavailable storage', () => {
  const values = new Map([['hasnaa-points','137'],['hasnaa-learning-v2','preserved']]);
  const storage = {getItem:key => values.get(key), setItem:(key,value) => values.set(key,value)};
  const s = createSession('skill', skills[0].id);
  while (!s.finished) { respond(s, currentQuestion(s).answer); advance(s); }
  assert.equal(saveStore({active:s,history:Array(35).fill(s)},storage), true);
  const restored = loadStore(storage);
  assert.deepEqual(restored.active,s); assert.equal(restored.history.length,30);
  assert.equal(values.get('hasnaa-points'),'137'); assert.equal(values.get('hasnaa-learning-v2'),'preserved');
  assert.deepEqual([...values.keys()].sort(),[STORAGE_KEY,'hasnaa-learning-v2','hasnaa-points'].sort());
  values.set(STORAGE_KEY,'broken'); assert.deepEqual(loadStore(storage),{active:null,history:[]});
  const blocked = {getItem(){throw new Error('blocked');},setItem(){throw new Error('full');}};
  assert.deepEqual(loadStore(blocked),{active:null,history:[]});
  assert.equal(saveStore({active:s,history:[]},blocked),false);
  for (const file of ['bank.js','index.js','model.js','view.js']) {
    const text = readFileSync(new URL('../src/nafs/'+file,import.meta.url),'utf8');
    assert.ok(!/from\s*['"][^'"]*(?:progress|times-tables|chapter-three)/.test(text));
    assert.ok(!/addPoints|awardPoints|recordFact|recordLesson/.test(text));
  }
});
