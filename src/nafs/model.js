import {domains, skills, questions} from './bank.js';

export const STORAGE_KEY = 'hasnaa-nafs-v1';
export const questionById = new Map(questions.map(q => [q.id, q]));
export const skillById = new Map(skills.map(s => [s.id, s]));
const modes = new Set(['skill', 'mixed', 'simulation']);

export function shuffled(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createSession(mode, skillId = null, random = Math.random) {
  if (!modes.has(mode) || (mode === 'skill' && !skillById.has(skillId))) throw new Error('Unknown training');
  let pool;
  if (mode === 'skill') pool = shuffled(questions.filter(q => q.skill === skillId), random);
  else {
    // Every mixed session represents all four domains, without repeating an item.
    pool = domains.flatMap(d => shuffled(questions.filter(q => q.domain === d.id), random).slice(0, 2));
    if (mode === 'simulation') {
      const represented = new Set(pool.map(q => q.id));
      const extras = shuffled(domains, random).slice(0, 2).map(d =>
        shuffled(questions.filter(q => q.domain === d.id && !represented.has(q.id)), random)[0]);
      pool.push(...extras);
    }
    pool = shuffled(pool, random);
  }
  return {id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, mode,
    skillId: mode === 'skill' ? skillId : null, questionIds: pool.map(q => q.id), index: 0,
    records: [], finished: false, started: Date.now()};
}

export function currentQuestion(session) { return questionById.get(session.questionIds[session.index]); }
export function currentRecord(session) { return session.records[session.index]; }
export function settled(session) {
  const record = currentRecord(session), q = currentQuestion(session);
  return !!record && (record.choices.at(-1) === q.answer || record.choices.length === 2);
}
export function respond(session, choice) {
  if (session.finished || settled(session) || !Number.isInteger(choice) || choice < 0 || choice > 3) return false;
  const record = currentRecord(session) || (session.records[session.index] = {choices: []});
  if (record.choices.includes(choice)) return false;
  record.choices.push(choice);
  return true;
}
export function advance(session) {
  if (session.finished || !settled(session)) return false;
  if (session.index === session.questionIds.length - 1) session.finished = true;
  else session.index++;
  return true;
}

export function analyse(session) {
  const seen = session.questionIds.slice(0, session.records.length);
  const rows = seen.map((id, index) => {
    const q = questionById.get(id), choices = session.records[index].choices;
    return {domain: q.domain, skill: q.skill, correct: choices[0] === q.answer,
      assisted: choices.length > 1 && choices.at(-1) === q.answer};
  });
  const total = list => ({total: list.length, correct: list.filter(r => r.correct).length,
    assisted: list.filter(r => r.assisted).length});
  return {...total(rows), domains: domains.map(d => ({...d, ...total(rows.filter(r => r.domain === d.id))})),
    skills: skills.filter(s => rows.some(r => r.skill === s.id)).map(s => ({...s, ...total(rows.filter(r => r.skill === s.id))}))};
}

// Reconstruct saved attempts through the same rules. Untrusted storage cannot
// inject markup, unknown questions, impossible scores or duplicate attempts.
export function restoreSession(value) {
  if (!value || !modes.has(value.mode) || !Array.isArray(value.questionIds) || !Array.isArray(value.records)) return null;
  const ids = value.questionIds;
  if (ids.length < 1 || ids.length > 10 || new Set(ids).size !== ids.length || ids.some(id => !questionById.has(id))) return null;
  if (value.mode === 'skill' && (!skillById.has(value.skillId) || ids.some(id => questionById.get(id).skill !== value.skillId))) return null;
  if (value.records.length > ids.length || !Number.isInteger(value.index) || value.index < 0 || value.index >= ids.length) return null;
  const s = {id: typeof value.id === 'string' ? value.id.slice(0, 100) : '', mode: value.mode,
    skillId: value.mode === 'skill' ? value.skillId : null, questionIds: ids, index: 0, records: [],
    finished: false, started: Number.isFinite(value.started) && Number.isFinite(new Date(value.started).getTime()) ? value.started : 0};
  for (let i = 0; i < value.records.length; i++) {
    const choices = value.records[i]?.choices;
    if (!Array.isArray(choices) || choices.length < 1 || choices.length > 2 || s.index !== i) return null;
    for (const c of choices) if (!respond(s, c)) return null;
    if (i < value.index || value.finished) { if (!advance(s)) return null; }
  }
  return s.index === value.index && s.finished === !!value.finished ? s : null;
}

export function loadStore(storage) {
  try {
    storage ??= globalThis.localStorage;
    const data = JSON.parse(storage.getItem(STORAGE_KEY));
    return {active: restoreSession(data?.active), history: Array.isArray(data?.history)
      ? data.history.slice(-30).map(restoreSession).filter(s => s?.finished) : []};
  } catch { return {active: null, history: []}; }
}
export function saveStore(store, storage) {
  try { storage ??= globalThis.localStorage; storage.setItem(STORAGE_KEY, JSON.stringify({version: 1, active: store.active, history: store.history.slice(-30)})); return true; }
  catch { return false; }
}
