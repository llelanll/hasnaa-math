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

// Declarative candidate claims are evaluated here, separately from the authoring
// data. No executable strings, answer-index lookup or expected-value shortcut.
function calculate(node) {
  if (typeof node === 'number') { assert.ok(Number.isFinite(node)); return node; }
  if (Array.isArray(node) && node.every(value => typeof value === 'number')) return node.map(calculate);
  assert.ok(Array.isArray(node) && typeof node[0] === 'string', `Invalid calculation ${JSON.stringify(node)}`);
  const [operation, ...raw] = node;
  const values = raw.map(calculate);
  const dataset = () => values.length === 1 && Array.isArray(values[0]) ? values[0] : values;
  const number = value => { assert.equal(typeof value, 'number'); assert.ok(Number.isFinite(value)); return value; };
  const close = (a,b) => Math.abs(number(a)-number(b)) < 1e-9;
  switch (operation) {
    case 'add': return values.reduce((sum,value) => sum+number(value),0);
    case 'sub': assert.equal(values.length,2); return number(values[0])-number(values[1]);
    case 'mul': return values.reduce((product,value) => product*number(value),1);
    case 'div': assert.equal(values.length,2); assert.notEqual(number(values[1]),0); return number(values[0])/number(values[1]);
    case 'mod': assert.equal(values.length,2); assert.notEqual(number(values[1]),0); return number(values[0])%number(values[1]);
    case 'floor': assert.equal(values.length,1); return Math.floor(number(values[0]));
    case 'abs': assert.equal(values.length,1); return Math.abs(number(values[0]));
    case 'round': { assert.equal(values.length,2); const scale=10**number(values[1]); return Math.floor(number(values[0])*scale+0.5+1e-9)/scale; }
    case 'min': return Math.min(...dataset().map(number));
    case 'max': return Math.max(...dataset().map(number));
    case 'sum': return dataset().map(number).reduce((a,b)=>a+b,0);
    case 'mean': { const data=dataset().map(number); assert.ok(data.length); return data.reduce((a,b)=>a+b,0)/data.length; }
    case 'median': { const data=dataset().map(number).toSorted((a,b)=>a-b); assert.ok(data.length); const m=Math.floor(data.length/2); return data.length%2?data[m]:(data[m-1]+data[m])/2; }
    case 'mode': { const data=dataset().map(number), counts=new Map(); for(const n of data)counts.set(n,(counts.get(n)||0)+1);const list=[...counts].sort((a,b)=>b[1]-a[1]);assert.ok(list.length&&list[0][1]>(list[1]?.[1]||0),'unique mode');return list[0][0]; }
    case 'range': { const data=dataset().map(number);assert.ok(data.length);return Math.max(...data)-Math.min(...data); }
    case 'count': assert.ok(Array.isArray(values[0])&&values.length===2); return values[0].filter(value=>close(value,values[1])).length;
    case 'gcd': { const [a,b]=values.map(number);for(let n=Math.min(a,b);n>=1;n--)if(a%n===0&&b%n===0)return n;throw Error('gcd'); }
    case 'lcm': { const [a,b]=values.map(number);for(let n=Math.max(a,b);n<=a*b;n++)if(n%a===0&&n%b===0)return n;throw Error('lcm'); }
    case 'eq': assert.equal(values.length,2); return close(values[0],values[1]);
    case 'ne': assert.equal(values.length,2); return !close(values[0],values[1]);
    case 'lt': assert.equal(values.length,2); return number(values[0])<number(values[1]);
    case 'lte': assert.equal(values.length,2); return number(values[0])<=number(values[1]);
    case 'gt': assert.equal(values.length,2); return number(values[0])>number(values[1]);
    case 'gte': assert.equal(values.length,2); return number(values[0])>=number(values[1]);
    case 'and': assert.ok(values.length>=2&&values.every(value=>typeof value==='boolean')); return values.every(Boolean);
    case 'or': assert.ok(values.length>=2&&values.every(value=>typeof value==='boolean')); return values.some(Boolean);
    case 'not': assert.ok(values.length===1&&typeof values[0]==='boolean'); return !values[0];
    default: throw Error(`Unsupported independent operation ${operation}`);
  }
}
function exactCalculation(node) {
  const bigGcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b)[a,b]=[b,a%b];return a;};
  const reduce=([n,d])=>{assert.notEqual(d,0n);if(d<0n){n=-n;d=-d;}const g=bigGcd(n,d);return [n/g,d/g];};
  const add=(a,b)=>reduce([a[0]*b[1]+b[0]*a[1],a[1]*b[1]]);
  const sub=(a,b)=>reduce([a[0]*b[1]-b[0]*a[1],a[1]*b[1]]);
  const mul=(a,b)=>reduce([a[0]*b[0],a[1]*b[1]]);
  const div=(a,b)=>reduce([a[0]*b[1],a[1]*b[0]]);
  const compare=(a,b)=>a[0]*b[1]<b[0]*a[1]?-1:a[0]*b[1]>b[0]*a[1]?1:0;
  const floor=([n,d])=>[n>=0n?n/d:-((-n+d-1n)/d),1n];
  const value=tree=>{
    if(typeof tree==='number'){const r=rational(tree);assert.ok(r);return reduce(r);}
    assert.ok(Array.isArray(tree));const [op,...raw]=tree;
    const data=()=>raw.length===1&&Array.isArray(raw[0])&&raw[0].every(x=>typeof x==='number')?raw[0].map(value):raw.map(value);
    const pair=()=>{assert.equal(raw.length,2);return raw.map(value);};
    if(op==='add'||op==='sum')return data().reduce(add,[0n,1n]);
    if(op==='mul')return data().reduce(mul,[1n,1n]);
    if(op==='sub'){const[a,b]=pair();return sub(a,b);}
    if(op==='div'){const[a,b]=pair();return div(a,b);}
    if(op==='abs'){const[n,d]=value(raw[0]);return[n<0n?-n:n,d];}
    if(op==='floor')return floor(value(raw[0]));
    if(op==='round'){
      assert.equal(raw.length,2);const places=raw[1];assert.ok(Number.isInteger(places));
      const scale=places>=0?[10n**BigInt(places),1n]:[1n,10n**BigInt(-places)];
      return div(floor(add(mul(value(raw[0]),scale),[1n,2n])),scale);
    }
    if(op==='mod'){const[a,b]=pair(),q=div(a,b);return sub(a,mul(b,[q[0]/q[1],1n]));}
    if(op==='min'||op==='max'){const list=data().sort(compare);assert.ok(list.length);return op==='min'?list[0]:list.at(-1);}
    if(op==='mean'){const list=data();assert.ok(list.length);return div(list.reduce(add,[0n,1n]),[BigInt(list.length),1n]);}
    if(op==='median'){const list=data().sort(compare);assert.ok(list.length);const i=Math.floor(list.length/2);return list.length%2?list[i]:div(add(list[i-1],list[i]),[2n,1n]);}
    if(op==='mode'){const list=data(),counts=new Map();for(const x of list){const k=x.join('/');counts.set(k,(counts.get(k)||0)+1);}const sorted=[...counts].sort((a,b)=>b[1]-a[1]);assert.ok(sorted.length&&sorted[0][1]>(sorted[1]?.[1]||0));return sorted[0][0].split('/').map(BigInt);}
    if(op==='range'){const list=data().sort(compare);assert.ok(list.length);return sub(list.at(-1),list[0]);}
    if(op==='count'){assert.ok(raw.length===2&&Array.isArray(raw[0]));const target=value(raw[1]);return[BigInt(raw[0].map(value).filter(x=>compare(x,target)===0).length),1n];}
    if(op==='gcd'||op==='lcm'){const[a,b]=pair();assert.ok(a[1]===1n&&b[1]===1n);const g=bigGcd(a[0],b[0]);return[op==='gcd'?g:a[0]*b[0]/g,1n];}
    throw Error(`Unsupported exact calculation ${op}`);
  };
  return value(node).join('/');
}
function geometryReference(a) {
  const direction=(p,q)=>[q[0]-p[0],q[1]-p[1]];
  const dot=(u,v)=>u[0]*v[0]+u[1]*v[1];
  const cross=(u,v)=>u[0]*v[1]-u[1]*v[0];
  const squared=u=>dot(u,u);
  const edges=points=>points.map((p,i)=>direction(p,points[(i+1)%points.length]));
  const rightAngles=points=>{const e=edges(points);return e.filter((v,i)=>Math.abs(dot(v,e[(i+1)%e.length]))<1e-9).length;};
  const sameSides=points=>{const sizes=edges(points).map(squared);return sizes.every(n=>n===sizes[0]);};
  const angleName=degrees=>degrees<90?'حادة':degrees===90?'قائمة':degrees<180?'منفرجة':'مستقيمة';
  switch(a.task){
    case 'lineDescription': {
      const vectors={parallel:[[1,0],[2,0]],perpendicular:[[1,0],[0,1]],intersecting:[[1,0],[2,1]]}[a.kind];
      assert.ok(vectors);
      if(dot(...vectors)===0)return 'يتقاطعان بزاوية قائمة';
      if(cross(...vectors)===0)return 'لا يلتقيان مهما امتدا';
      return 'يتقاطعان بزاوية حادة';
    }
    case 'lineCounterexample': assert.equal(a.kind,'segment'); return 'له نقطتا نهاية؛ فهو قطعة مستقيمة';
    case 'angleDescription': assert.ok(a.degrees>90&&a.degrees<180);return 'فتحتها أكبر من القائمة وأصغر من المستقيمة';
    case 'angleInvariant': {
      const r=a.rotation*Math.PI/180,t=a.degrees*Math.PI/180;
      const rotate=([x,y])=>[x*Math.cos(r)-y*Math.sin(r),x*Math.sin(r)+y*Math.cos(r)];
      const u=rotate([1,0]),v=rotate([Math.cos(t),Math.sin(t)]);
      const degrees=Math.acos(Math.min(1,Math.max(-1,dot(u,v)/Math.sqrt(squared(u)*squared(v)))))*180/Math.PI;
      assert.ok(Math.abs(degrees-a.degrees)<1e-8,'rotation preserves measured angle');
      return `تبقى ${angleName(a.degrees)}؛ تدوير الورقة لا يغير فتحتها`;
    }
    case 'polygonProperty': {
      assert.equal(a.kind,'rectangle');const points=[[0,0],[3,0],[3,2],[0,2]],e=edges(points);
      assert.equal(rightAngles(points),4);assert.equal(squared(e[0]),squared(e[2]));assert.equal(squared(e[1]),squared(e[3]));
      return 'زواياه الأربع قائمة، وكل ضلعين متقابلين متساويان';
    }
    case 'polygonIdentify': {
      const candidates={مربع:[[0,0],[1,0],[1,1],[0,1]],مستطيل:[[0,0],[3,0],[3,1],[0,1]],معين:[[0,2],[3,0],[6,2],[3,4]]};
      const matches=Object.entries(candidates).filter(([,p])=>sameSides(p)===a.equalSides&&rightAngles(p)===a.rightAngles);
      assert.equal(matches.length,1);return matches[0][0];
    }
    case 'polygonCounterexample': assert.ok(sameSides(a.vertices));assert.notEqual(rightAngles(a.vertices),4);return 'ينقض قولها؛ أضلاعه متساوية لكن زواياه ليست كلها قائمة';
    case 'solidElement': {
      assert.equal(a.kind,'cube');assert.equal(a.feature,'edge');
      const front=[[0,0,0],[1,0,0],[1,1,0],[0,1,0]],side=[[1,0,0],[1,0,1],[1,1,1],[1,1,0]];
      const shared=front.filter(p=>side.some(q=>p.every((n,i)=>n===q[i])));assert.equal(shared.length,2);
      return 'الخط المشترك بين وجهين';
    }
    case 'locatePoint': {const matches=a.points.filter(p=>p.x===a.target[0]&&p.y===a.target[1]);assert.equal(matches.length,1);return 'النقطة '+matches[0].label;}
    case 'coordinateOrder': return `الموقع (${a.x}, ${a.y})؛ نكتب الأفقي أولًا`;
    case 'translationDescription': {
      assert.equal(a.dy,0);assert.ok(a.dx>0);return `زاد السيني ${a.dx} وبقي الصادي ثابتًا`;
    }
    case 'movement': {
      const dx=a.tx-a.x,dy=a.ty-a.y;assert.ok((dx===0)!==(dy===0));
      return `${Math.abs(dx||dy)} وحدات ${dx>0?'يمينًا':dx<0?'يسارًا':dy>0?'إلى أعلى':'إلى أسفل'}`;
    }
    case 'transformationInvariant': {
      const from=a.from||[[1,1],[2,1],[1,3]],to=a.to||from.map(([x,y])=>[y,6-x]);
      assert.equal(from.length,to.length);
      const lengths=edges(from).map(squared),newLengths=edges(to).map(squared);assert.deepEqual(newLengths,lengths);
      if(a.kind==='rotation')return 'شكل المضلع وحجمه';
      assert.equal(a.kind,'translation');
      const shifts=from.map((p,i)=>direction(p,to[i]));assert.ok(shifts.every(v=>v[0]===shifts[0][0]&&v[1]===shifts[0][1]));
      return 'نُقلت جميع النقاط بالمقدار والاتجاه نفسيهما دون التفاف';
    }
    default: throw Error(`Missing independent geometry review task ${a.task}`);
  }
}
function reference(proof) {
  const a = proof.args;
  switch (proof.type) {
    case 'geometryReview': return geometryReference(a);
    case 'calculation': return exactCalculation(a.expression);
    case 'statements': {
      assert.equal(a.claims.length,4);
      const matches=a.claims.filter(claim=>{const truth=calculate(claim.test);assert.equal(typeof truth,'boolean');return truth;});
      assert.equal(matches.length,1,'exactly one mathematically supported statement');
      return matches[0].text;
    }
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
    if(q.proof.type==='statements'){
      const claims=q.proof.args.claims;
      for(const choice of q.choices)assert.equal(claims.filter(claim=>same(claim.text,choice)).length,1,`${q.id}: each displayed statement has one independently checked claim`);
      const inspect=node=>{
        assert.notEqual(typeof node,'boolean',`${q.id}: a literal truth value cannot prove a choice`);
        if(!Array.isArray(node)||node.every(value=>typeof value==='number'))return;
        if(['eq','ne'].includes(node[0]))assert.notEqual(JSON.stringify(node[1]),JSON.stringify(node[2]),`${q.id}: avoid tautological candidate proofs`);
        node.slice(1).forEach(inspect);
      };
      claims.forEach(claim=>inspect(claim.test));
    }
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
      if (q.proof.type === 'volume') assert.deepEqual(v.rows[0].map(value => {
        const match=clean(value).match(/^(\d+(?:\.\d+)?)\s*(?:سم)?$/u);assert.ok(match,q.id);return Number(match[1]);
      }), [q.proof.args.width, q.proof.args.height, q.proof.args.depth], q.id);
      if(q.proof.type==='mode'&&v.headers.includes('المقاس')){
        const expanded=v.rows.flatMap(row=>Array(Number(clean(row[1]))).fill(Number(clean(row[0]))));
        assert.deepEqual(expanded.toSorted((a,b)=>a-b),q.proof.args.values.toSorted((a,b)=>a-b),q.id);
      }
      if(q.proof.coding){
        const {colors,shapes}=q.proof.coding;
        const encoded=v.rows.map(row=>{const c=colors.indexOf(row[0]),s=shapes.indexOf(row[1]);assert.ok(c>=0&&s>=0,q.id);return c*shapes.length+s;});
        const datasets=[];const inspect=node=>{if(!Array.isArray(node))return;if(node[0]==='count')datasets.push(node[1]);node.slice(1).forEach(inspect);};
        q.proof.args.claims.forEach(claim=>inspect(claim.test));assert.ok(datasets.length,q.id);
        datasets.forEach(data=>assert.deepEqual(data,encoded,q.id));
      }
      if (q.proof.type === 'outcomes') {
        if(v.headers.includes('البدائل'))assert.deepEqual(v.rows.map(row=>row[1].split('،').length),[q.proof.args.a,q.proof.args.b],q.id);
        else assert.deepEqual(v.rows[0].map(value => Number(clean(value))), [q.proof.args.a, q.proof.args.b], q.id);
      }
    }
    if (v.type === 'grid') { assert.ok(v.rows > 0 && v.cols > 0, q.id); if (q.proof.type === 'area') assert.equal(v.rows * v.cols, q.proof.args.width * q.proof.args.height, q.id); }
    if (v.type === 'shape') { if (v.width !== undefined) assert.ok(v.width > 0, q.id); if (v.height !== undefined) assert.ok(v.height > 0, q.id); if (q.proof.type === 'perimeter') assert.deepEqual([v.width, v.height], [q.proof.args.width, q.proof.args.height], q.id); if (q.proof.type === 'polygon') assert.equal(v.kind, q.proof.args.kind, q.id); }
    if (v.type === 'coordinate') {
      const points=v.points||[{x:v.x,y:v.y}];
      for(const p of points)assert.ok(p.x>=0&&p.y>=0&&p.x<=6&&p.y<=6,q.id);
      if(v.points)assert.equal(new Set(v.points.map(p=>p.label)).size,v.points.length,q.id);
      if (['coordinate', 'translate'].includes(q.proof.type)) assert.deepEqual([v.x, v.y], [q.proof.args.x, q.proof.args.y], q.id);
    }
    if (v.type === 'sequence') { assert.ok(v.values.length >= 3, q.id); if (['sequence', 'mean', 'median', 'mode', 'range'].includes(q.proof.type)) assert.deepEqual(v.values.map(value => Number(clean(value))), q.proof.args.values, q.id); }
    if(v.type==='fractions'){
      assert.ok(v.strips.length>=2,q.id);
      for(const s of v.strips)assert.ok(Number.isInteger(s.n)&&Number.isInteger(s.d)&&s.d>0&&s.n>=0&&s.n<=s.d,q.id);
    }
    if(v.type==='angle'){
      assert.ok(v.degrees>0&&v.degrees<=180,q.id);
      if(q.proof.type==='angle'||q.proof.args.degrees!==undefined)assert.equal(v.degrees,q.proof.args.degrees,q.id);
    }
    if(v.type==='lines')assert.ok(['parallel','perpendicular','intersecting','segment'].includes(v.kind),q.id);
    if(v.type==='solid'){
      assert.ok(['cube','rectangular','triangular'].includes(v.kind),q.id);
      if(q.proof.type==='solid'||q.proof.args.kind)assert.equal(v.kind,q.proof.args.kind,q.id);
      if(q.proof.type==='geometryReview'&&q.proof.args.task==='solidElement'){
        assert.equal(v.highlight,q.proof.args.feature,`${q.id}: interpreting a selected solid element requires that element to be highlighted`);
      }
    }
    if(v.type==='transformation'){
      const from=v.from||[[1,1],[2,1],[1,3]],center=v.center||[3,3],axis=v.axis??3;
      const transformed=from.map(([x,y])=>v.kind==='reflection'?[2*axis-x,y]:v.kind==='rotation'?[center[0]+y-center[1],center[1]-x+center[0]]:[x+3,y]);
      const to=v.to||transformed;
      for(const p of [...from,...to])assert.ok(p.length===2&&p.every(n=>n>=0&&n<=6),q.id);
      assert.equal(from.length,to.length,q.id);
      if(v.kind==='translation'){
        const shifts=from.map((p,i)=>to[i].map((n,j)=>n-p[j]));assert.ok(shifts.every(s=>s[0]===shifts[0][0]&&s[1]===shifts[0][1]),q.id);
      }else assert.deepEqual(to,transformed,q.id);
      if(q.proof.args.from)assert.deepEqual(from,q.proof.args.from,q.id);
      if(q.proof.args.to)assert.deepEqual(to,q.proof.args.to,q.id);
    }
    if(v.type==='layers'){
      for(const key of ['rows','cols','layers'])assert.ok(Number.isInteger(v[key])&&v[key]>0,q.id);
      if(q.proof.type==='volume')assert.deepEqual([v.cols,v.rows,v.layers],[q.proof.args.width,q.proof.args.height,q.proof.args.depth],q.id);
    }
    if(v.type==='bag'){
      assert.ok(v.counts.length>=2&&v.counts.every(c=>Number.isInteger(c.count)&&c.count>=0),q.id);
      if(q.proof.type==='probability'){
        assert.equal(v.counts.reduce((sum,c)=>sum+c.count,0),q.proof.args.total,q.id);
        const named=v.counts.filter(c=>q.question.includes(c.label));
        if(named.length===1)assert.equal(named[0].count,q.proof.args.favorable,q.id);
      }
    }
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
