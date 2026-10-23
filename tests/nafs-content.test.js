import {test} from 'node:test';
import assert from 'node:assert/strict';
import {domains, skills, questions} from '../src/nafs/bank.js';
import {mathRanges} from '../src/math-direction.js';

// These reference calculations intentionally do not import bank calculation helpers.
const clean = value => String(value).trim()
  .replace(/[٠-٩]/g, digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
  .replace(/[۰-۹]/g, digit => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
  .replace(/٫/g, '.').replace(/٬/g, '').replace(/[−–]/g, '-')
  .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '');
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const reduced = (n, d) => `${n / gcd(n, d)}/${d / gcd(n, d)}`;
function rational(value) {
  const text = clean(value).replace(/\s/g, '');
  const fraction = text.match(/^([+-]?\d+)\/(\d+)$/);
  if (fraction) return BigInt(fraction[2]) ? [BigInt(fraction[1]), BigInt(fraction[2])] : null;
  const decimal = text.match(/^([+-]?)(\d+)(?:\.(\d+))?$/);
  if (!decimal) return null;
  return [BigInt((decimal[1] === '-' ? '-' : '') + decimal[2] + (decimal[3] || '')), 10n ** BigInt((decimal[3] || '').length)];
}
function same(a, b) {
  const x = rational(a), y = rational(b);
  if (x && y) return x[0] * y[1] === y[0] * x[1];
  return clean(a).replace(/\s+/g, ' ').replace(/،/g, ',') === clean(b).replace(/\s+/g, ' ').replace(/،/g, ',');
}
function reference(proof) {
  const a = proof.args;
  switch (proof.type) {
    case 'place': { const [n, d] = rational(a.number), [m, e] = rational(a.place); const digit = n * e / (d * m) % 10n; return `${digit * m}/${e}`; }
    case 'compare': return a.a < a.b ? '<' : a.a > a.b ? '>' : '=';
    case 'decimalRound': return Math.round((a.value + Number.EPSILON) * 10 ** a.places) / 10 ** a.places;
    case 'fraction': return reduced(a.n, a.d);
    case 'equivalentFraction': return `${a.n * a.k}/${a.d * a.k}`;
    case 'fractionCompare': return a.a * a.d < a.c * a.b ? '<' : a.a * a.d > a.c * a.b ? '>' : '=';
    case 'fractionCalc': return reduced(a.a * a.d + (a.op === '+' ? 1 : -1) * a.c * a.b, a.b * a.d);
    case 'arithmetic': {
      const [n, d] = rational(a.a), [m, e] = rational(a.b);
      switch (a.op) {
        case '+': return `${n * e + m * d}/${d * e}`;
        case '-': return `${n * e - m * d}/${d * e}`;
        case '×': return `${n * m}/${d * e}`;
        case '÷': return `${n * e}/${d * m}`;
        default: throw Error(`Unknown operation: ${a.op}`);
      }
    }
    case 'gcd': { const factors = Array.from({length: Math.min(a.a, a.b)}, (_, i) => i + 1).filter(n => a.a % n === 0 && a.b % n === 0); return Math.max(...factors); }
    case 'lcm': { for (let n = Math.max(a.a, a.b); n <= a.a * a.b; n++) if (n % a.a === 0 && n % a.b === 0) return n; throw Error('LCM'); }
    case 'estimate': {
      const x = Math.floor(a.a / a.unit + 0.5) * a.unit, y = Math.floor(a.b / a.unit + 0.5) * a.unit;
      if (a.op === '+') return x + y;
      if (a.op === '-') return x - y;
      if (a.op === '×') return x * y;
      if (a.op === '÷') return x / y;
      throw Error('estimate operation');
    }
    case 'sequence': {
      for (let i = 1; i < a.values.length; i++) assert.equal(a.values[i], a.rule === 'add' ? a.values[i - 1] + a.step : a.values[i - 1] * a.step);
      return a.rule === 'add' ? a.values.at(-1) + a.step : a.values.at(-1) * a.step;
    }
    case 'gridPattern': return a.start + a.step * (a.index - 1);
    case 'function': return a.input * a.mul + a.add;
    case 'expression': return a.x * a.mul + a.add;
    case 'equation': return (a.total - a.add) / a.coefficient;
    case 'lines': return ({parallel: 'متوازيان', perpendicular: 'متعامدان', intersecting: 'متقاطعان وغير متعامدين', segment: 'قطعة مستقيمة'})[a.kind];
    case 'angle': return a.degrees < 90 ? 'حادة' : a.degrees === 90 ? 'قائمة' : a.degrees < 180 ? 'منفرجة' : 'مستقيمة';
    case 'polygon': return ({rectangle: 4, square: 4, triangle: 3, hexagon: 6})[a.kind];
    case 'solid': return ({cube: {faces: 6, edges: 12, vertices: 8}, rectangular: {faces: 6, edges: 12, vertices: 8}, triangular: {faces: 5, edges: 9, vertices: 6}})[a.kind][a.feature];
    case 'coordinate': return `(${a.x}, ${a.y})`;
    case 'translate': return `(${a.x + a.dx}, ${a.y + a.dy})`;
    case 'transform': return ({reflection: 'انعكاس', rotation: 'دوران', translation: 'انسحاب'})[a.kind];
    case 'convert': return a.value * a.factor;
    case 'elapsed': return a.end - a.start;
    case 'perimeter': return 2 * a.width + 2 * a.height;
    case 'area': return a.width * a.height;
    case 'volume': return a.width * a.height * a.depth;
    case 'dataRead': return a.op === 'sum' ? a.indices.reduce((sum, index) => sum + a.values[index], 0) : a.op === 'difference' ? Math.abs(a.values[a.indices[0]] - a.values[a.indices[1]]) : a.values[a.indices[0]];
    case 'mean': return a.values.reduce((sum, value) => sum + value, 0) / a.values.length;
    case 'median': { const sorted = a.values.toSorted((x, y) => x - y), middle = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2; }
    case 'mode': { const counts = new Map(); for (const n of a.values) counts.set(n, (counts.get(n) || 0) + 1); const sorted = [...counts].sort((x, y) => y[1] - x[1]); assert.ok(sorted[0][1] > (sorted[1]?.[1] || 0), 'mode must be unambiguous'); return sorted[0][0]; }
    case 'range': return Math.max(...a.values) - Math.min(...a.values);
    case 'outcomes': return a.a * a.b;
    case 'probability': return reduced(a.favorable, a.total);
    default: throw Error(`Missing independent calculation for ${proof.type}`);
  }
}

const titles = ['الأعداد والعمليات عليها', 'الجبر والتحليل', 'الهندسة والقياس', 'الإحصاء والاحتمالات'];
test('Nafis bank classifies every fifth-grade question under one of the four official domains', () => {
  assert.deepEqual(domains.map(domain => domain.title), titles);
  assert.equal(new Set(domains.map(domain => domain.id)).size, 4);
  assert.equal(skills.length, 40);
  assert.equal(questions.length, 160);
  assert.equal(new Set(skills.map(skill => skill.id)).size, skills.length);
  assert.equal(new Set(questions.map(question => question.id)).size, questions.length);
  for (const skill of skills) {
    assert.ok(domains.some(domain => domain.id === skill.domain), skill.id);
    assert.ok(skill.title?.length > 3, skill.id);
    assert.ok(skill.indicator?.length > 8, skill.id);
    assert.ok(skill.grade5?.length > 4, skill.id);
    assert.ok(skill.source && skill.source.page >= 22 && skill.source.page <= 26, skill.id);
    assert.ok(skill.source.section && skill.source.indicator, skill.id);
    assert.equal(questions.filter(question => question.skill === skill.id).length, 4, skill.id);
  }
  for (const question of questions) {
    const skill = skills.find(skill => skill.id === question.skill);
    assert.ok(skill, question.id);
    assert.equal(question.domain, skill.domain, question.id);
    assert.equal(question.indicator, skill.indicator, question.id);
    for (const field of ['question', 'explanation', 'hint']) assert.ok(typeof question[field] === 'string' && question[field].length > 4, `${question.id} ${field}`);
    for (const value of [question.question, question.explanation, question.hint, ...question.choices]) assert.ok(!/[0-9]/.test(value), `Visible digits stay Arabic: ${question.id}: ${value}`);
    assert.ok(question.explanation.length <= 240, question.id);
    assert.ok(question.hint.length <= 170, question.id);
    assert.equal(question.choices.length, 4, question.id);
    assert.ok(question.choices.every(choice => typeof choice === 'string' && choice.length), question.id);
    assert.equal(new Set(question.choices).size, 4, question.id);
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, question.id);
  }
});
for (const domain of ['numbers', 'algebra', 'geometry', 'data']) test(`Nafis ${domain}: all answers independently recomputed; distractors unambiguous`, () => {
  const pool = questions.filter(question => question.domain === domain);
  assert.ok(pool.length > 0);
  for (const q of pool) {
    assert.ok(q.proof?.type && q.proof.args, q.id);
    const answer = reference(q.proof);
    assert.ok(answer !== undefined, q.id);
    assert.ok(same(answer, q.proof.expected), `${q.id}: proof expected ${q.proof.expected}, independently got ${answer}`);
    assert.ok(same(answer, q.choices[q.answer]), `${q.id}: answer ${q.choices[q.answer]}, expected ${answer}`);
    assert.equal(q.choices.filter(choice => same(choice, answer)).length, 1, `${q.id}: mathematically duplicate distractor`);
    for (let i = 0; i < q.choices.length; i++) for (let j = i + 1; j < q.choices.length; j++) assert.ok(!same(q.choices[i], q.choices[j]), `${q.id}: equivalent choices`);
    if (q.proof.type === 'arithmetic' && ['×', '÷'].includes(q.proof.args.op)) assert.ok(Number.isInteger(q.proof.args.a) && Number.isInteger(q.proof.args.b), `${q.id}: exclude sixth-only decimal products/quotients`);
  }
  console.log(`${domain}: ${skills.filter(skill => skill.domain === domain).length} skills, ${pool.length} classified questions`);
});

test('Nafis diagrams and tables preserve source quantities and non-negative geometry', () => {
  let visualCount = 0;
  for (const q of questions) {
    const v = q.visual;
    if (!v) continue;
    visualCount++;
    if (v.type === 'bars') {
      assert.equal(v.labels.length, v.values.length, q.id);
      assert.ok(v.values.every(n => Number.isFinite(n) && n >= 0), q.id);
      if (['dataRead', 'mean', 'median', 'mode', 'range'].includes(q.proof.type)) assert.deepEqual(v.values, q.proof.args.values, q.id);
    }
    if (v.type === 'fraction') { assert.ok(v.d > 0 && v.n >= 0 && v.n <= v.d, q.id); if (['fraction', 'equivalentFraction'].includes(q.proof.type)) { assert.equal(v.n, q.proof.args.n, q.id); assert.equal(v.d, q.proof.args.d, q.id); } if (q.proof.type === 'probability') { assert.equal(v.n, q.proof.args.favorable, q.id); assert.equal(v.d, q.proof.args.total, q.id); } }
    if (v.type === 'table') {
      assert.ok(v.headers.length >= 2 && v.rows.length > 0, q.id); assert.ok(v.rows.every(row => row.length === v.headers.length), q.id);
      if (q.proof.type === 'function') for (const row of v.rows.filter(row => row[1] !== '؟')) assert.equal(Number(clean(row[1])), Number(clean(row[0])) * q.proof.args.mul + q.proof.args.add, q.id);
      if (q.proof.type === 'gridPattern') for (const row of v.rows) assert.equal(row[1].length, q.proof.args.start + (Number(clean(row[0])) - 1) * q.proof.args.step, q.id);
      if (q.proof.type === 'volume') assert.deepEqual(v.rows[0].map(value => Number(clean(value))), [q.proof.args.width, q.proof.args.height, q.proof.args.depth], q.id);
      if (q.proof.type === 'outcomes') assert.deepEqual(v.rows[0].map(value => Number(clean(value))), [q.proof.args.a, q.proof.args.b], q.id);
    }
    if (v.type === 'grid') { assert.ok(v.rows > 0 && v.cols > 0, q.id); if (q.proof.type === 'area') assert.equal(v.rows * v.cols, q.proof.args.width * q.proof.args.height, q.id); }
    if (v.type === 'shape') { if (v.width !== undefined) assert.ok(v.width > 0, q.id); if (v.height !== undefined) assert.ok(v.height > 0, q.id); if (q.proof.type === 'perimeter') assert.deepEqual([v.width, v.height], [q.proof.args.width, q.proof.args.height], q.id); if (q.proof.type === 'polygon') assert.equal(v.kind, q.proof.args.kind, q.id); }
    if (v.type === 'coordinate') { assert.ok(v.x >= 0 && v.y >= 0 && v.x <= 10 && v.y <= 10, q.id); if (['coordinate', 'translate'].includes(q.proof.type)) assert.deepEqual([v.x, v.y], [q.proof.args.x, q.proof.args.y], q.id); }
    if (v.type === 'sequence') { assert.ok(v.values.length >= 3, q.id); if (['sequence', 'mean', 'median', 'mode', 'range'].includes(q.proof.type)) assert.deepEqual(v.values.map(value => Number(clean(value))), q.proof.args.values, q.id); }
  }
  assert.ok(visualCount >= 40, `Visual-first requires meaningful diagrams: ${visualCount}`);
});

function evaluate(text) {
  const s = clean(text).replace(/×/g, '*').replace(/[÷⁄]/g, '/').replace(/\s/g, ''); let at = 0;
  function atom() { if (s[at] === '(') { at++; const n = expr(); if (s[at++] !== ')') throw Error('parenthesis'); return n; } let sign = 1; if (s[at] === '-') { sign = -1; at++; } const m = s.slice(at).match(/^\d+(?:\.\d+)?/); if (!m) throw Error('atom'); at += m[0].length; return sign * Number(m[0]); }
  function term() { let n = atom(); while (s[at] === '*' || s[at] === '/') { const op = s[at++], v = atom(); n = op === '*' ? n * v : n / v; } return n; }
  function expr() { let n = term(); while (s[at] === '+' || s[at] === '-') { const op = s[at++], v = term(); n = op === '+' ? n + v : n - v; } return n; }
  const n = expr(); if (at !== s.length) throw Error('tail'); return n;
}
test('Nafis every explicit numeric equality in feedback is arithmetically true', () => {
  let verified = 0;
  for (const q of questions) for (const text of [q.explanation, q.hint]) for (const range of mathRanges(text)) {
    if (!range.text.includes('=') || /[\p{L}؟?□،,:؛;<>≤≥≈→←]/u.test(range.text)) continue;
    let values; try { values = range.text.split('=').map(evaluate); } catch { continue; }
    for (let i = 1; i < values.length; i++) { assert.ok(Math.abs(values[i] - values[0]) < 1e-9, `${q.id}: ${range.text}`); verified++; }
  }
  assert.ok(verified >= 20, `Expected instructional numeric steps: ${verified}`);
  console.log(`Nafis checked feedback equalities: ${verified}`);
});
