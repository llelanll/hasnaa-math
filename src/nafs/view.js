import {domains, skills, questions} from './bank.js';
import {skillById, createSession, currentQuestion, currentRecord,
  settled, respond, advance, analyse, loadStore, saveStore} from './model.js';
import {formatMathText} from '../math-direction.js';
import {mentor} from '../characters.js';

const ar = n => Number(n).toLocaleString('ar-SA', {useGrouping: false, maximumFractionDigits: 2});
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// A comparison sign on its own also needs isolation: RTL can mirror its glyph.
const fmt = text => /^[<>≤≥=≠]$/.test(String(text).trim())
  ? `<bdi class="math-content" dir="ltr">${esc(text)}</bdi>` : formatMathText(text);
const visualText = text => String(text).replace(/[0-9]/g, c => '٠١٢٣٤٥٦٧٨٩'[c]);
const domainById = new Map(domains.map(d => [d.id, d]));
let store = loadStore(), storageWarning = false;
const routeFor = s => s.mode === 'skill' ? `nafs-skill-${s.skillId}` : `nafs-${s.mode}`;
const modeName = mode => ({skill:'تدريب حسب المهارة',mixed:'تدريب متنوع',simulation:'محاكاة قصيرة'}[mode]);
const pct = row => row.total ? ar(Math.round(row.correct / row.total * 100)) + '٪' : 'لم تُقَس';
function save() { storageWarning = !saveStore(store); }
function start(mode, id) { store.active = createSession(mode, id); save(); }
function head(title, sub = '') {
  return `<section class="page-title"><span class="eyebrow">تدريب وتشخيص · مناسب للصف الخامس</span><h1 tabindex="-1">${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ''}</section>`;
}
const back = '<a class="text-button" href="#nafs">← ركن نافس</a>';

function landing() {
  return `${head('🏆 تدريب مهارات نافس','تدرّبي على المهارات واكتشفي مستوى إتقانك')}
  <div class="nafs-note">تدريب مستقل دون نقاط أو مكافآت. اختاري مهارة أو جولة متنوعة.</div>
  <div class="nafs-modes"><a class="primary" href="#nafs-mixed">تدريب متنوع · ٨ أسئلة</a><a class="secondary" href="#nafs-simulation">محاكاة قصيرة · ١٠ أسئلة</a><a class="text-button" href="#nafs-history">نتائجكِ السابقة</a></div>
  <section aria-labelledby="nafs-domains-title"><h2 id="nafs-domains-title">تدريب حسب المهارة</h2><div class="nafs-domains">${domains.map(d => `<a class="chapter-card" href="#nafs-domain-${d.id}"><span class="nafs-domain-icon" aria-hidden="true">${esc(d.icon)}</span><h2>${esc(d.title)}</h2><p>${esc(d.description)}</p><small>${ar(skills.filter(s => s.domain === d.id).length)} مهارة ←</small></a>`).join('')}</div></section>
  ${store.active && !store.active.finished ? `<a class="secondary nafs-resume" href="#${routeFor(store.active)}">تابعي تدريبكِ · السؤال ${ar(store.active.index + 1)}</a>` : ''}
  <p class="local-note">أسئلة أصلية تسترشد بوثيقة نواتج التعلم ٢٠٢٦. هذا تدريب تعليمي، وليس اختبار نافس الرسمي.</p>`;
}
function domainPage(id) {
  const d = domainById.get(id);
  if (!d) return `${head('اختاري مجال التدريب')}${back}`;
  return `${back}${head(d.title,'اختاري مهارة لتبدئي جولة قصيرة.')}<div class="nafs-skills">${skills.filter(s => s.domain === id).map(s => `<a class="chapter-card" href="#nafs-skill-${s.id}"><h2>${esc(s.title)}</h2><small>${ar(questions.filter(q => q.skill === s.id).length)} أسئلة · ابدئي ←</small></a>`).join('')}</div>`;
}

function table(v) {
  return `<div class="nafs-table-wrap"><table class="nafs-table"><thead><tr>${v.headers.map(x => `<th scope="col">${fmt(visualText(x))}</th>`).join('')}</tr></thead><tbody>${v.rows.map(row => `<tr>${row.map(x => `<td>${fmt(visualText(x))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export function visual(v) {
  if (!v) return '';
  let content = '';
  if (v.type === 'table') content = table(v);
  else if (v.type === 'sequence') content = `<div class="nafs-sequence math-content" dir="ltr">${v.values.map(x => `<span>${esc(visualText(x))}</span>`).join('<span aria-hidden="true">،</span>')}</div>`;
  else if (v.type === 'fraction') content = `<div class="nafs-fraction" role="img" aria-label="${ar(v.n)} أجزاء مظللة من ${ar(v.d)}"><div>${Array.from({length:v.d}, (_,i) => `<i class="${i < v.n ? 'filled' : ''}"></i>`).join('')}</div></div>`;
  else if (v.type === 'grid') content = `<div class="nafs-grid" style="--cols:${v.cols}" role="img" aria-label="${ar(v.rows)} صفوف، في كل صف ${ar(v.cols)} مربعات">${'<i></i>'.repeat(v.rows * v.cols)}</div>`;
  else if (v.type === 'bars') {
    const max = Math.max(...v.values, 1), scale = max <= 10 ? 1 : Math.ceil(max / 5), top = Math.ceil(max / scale) * scale;
    content = `<div class="nafs-bar-chart" role="img" aria-label="${esc(v.labels.map((x,i) => `${x}: ${ar(v.values[i])}`).join('، '))}"><div class="nafs-axis">${Array.from({length:top / scale + 1},(_,i) => `<span style="top:${i * scale / top * 100}%">${ar(top - i * scale)}</span>`).join('')}</div><div class="nafs-bars">${v.values.map((n,i) => `<div><span>${ar(n)}</span><i style="height:${n / top * 120}px"></i><b>${esc(v.labels[i])}</b></div>`).join('')}</div></div>`;
  } else if (v.type === 'coordinate') {
    content = `<svg class="nafs-coordinate" viewBox="0 0 240 240" role="img" aria-label="شبكة إحداثية، النقطة أ معروضة عليها"><path d="${Array.from({length:7},(_,i) => `M${30+i*30} 30V210 M30 ${30+i*30}H210`).join(' ')}" class="grid-lines"/><path d="M30 20V210H220" class="axes"/>${Array.from({length:7},(_,i) => `<text x="${30+i*30}" y="228">${ar(i)}</text>${i ? `<text x="16" y="${214-i*30}">${ar(i)}</text>` : ''}`).join('')}<text x="229" y="211">س</text><text x="30" y="15">ص</text><circle cx="${30+v.x*30}" cy="${210-v.y*30}" r="5"/><text x="${40+v.x*30}" y="${200-v.y*30}">أ</text></svg>`;
  } else if (v.type === 'shape') {
    // Dimensions are labels, not encoded by screen size. Keep them outside the shape.
    const shapes = {rectangle:'<rect x="45" y="40" width="170" height="90"/>',square:'<rect x="70" y="30" width="110" height="110"/>',triangle:'<polygon points="125,25 40,140 215,140"/>',parallelogram:'<polygon points="80,35 220,35 180,135 40,135"/>',trapezoid:'<polygon points="85,35 175,35 225,135 35,135"/>',rhombus:'<polygon points="125,20 220,80 125,140 30,80"/>',hexagon:'<polygon points="70,25 180,25 230,80 180,135 70,135 20,80"/>'};
    content = `<svg viewBox="0 0 260 175" class="nafs-shape" role="img" aria-label="${esc(v.label || 'شكل هندسي')}">${shapes[v.kind] || shapes.rectangle}${v.width != null ? `<text x="130" y="165">${esc(visualText(v.width))}</text>` : ''}${v.height != null ? `<text x="20" y="90">${esc(visualText(v.height))}</text>` : ''}</svg>`;
  }
  return content ? `<div class="nafs-visual">${content}</div>` : '';
}

function training(session) {
  const q = currentQuestion(session), record = currentRecord(session), d = domainById.get(q.domain), s = skillById.get(q.skill);
  const done = settled(session), attempted = record?.choices || [], correct = attempted.at(-1) === q.answer;
  let feedback = '';
  if (attempted.length && !done) feedback = `<div class="feedback retry" role="status"><strong>قريبة جدًا! جرّبي مرة ثانية 💜</strong><p>${fmt(q.hint)}</p></div>`;
  else if (done) feedback = `<div class="feedback ${correct ? 'success' : 'retry'}" role="status"><strong>${correct ? 'أحسنتِ! اكتشفتِ الفكرة' : 'نتعلّم من المحاولة معًا 💜'}</strong><p>${fmt(q.explanation)}</p></div>`;
  return `${back}<section class="nafs-question question-panel" data-nafs-question="${q.id}">
    <div class="progress-label"><span>${modeName(session.mode)}</span><span>السؤال ${ar(session.index + 1)} من ${ar(session.questionIds.length)}</span></div>
    <progress class="nafs-progress" max="${session.questionIds.length}" value="${session.index}" aria-label="التقدم في الجولة"></progress>
    <dl class="nafs-classification"><div><dt>المجال:</dt><dd>${esc(d.title)}</dd></div><div><dt>المهارة:</dt><dd>${esc(s.title)}</dd></div></dl>
    <h1 class="nafs-prompt" tabindex="-1">${fmt(q.question)}</h1>${visual(q.visual)}
    <div class="nafs-choices">${q.choices.map((choice,i) => `<button class="answer ${done && i === q.answer ? 'correct' : attempted.includes(i) ? 'wrong' : ''}" data-nafs-answer="${i}" ${done || attempted.includes(i) ? 'disabled' : ''}><span class="nafs-choice-letter">${['أ','ب','ج','د'][i]}</span><span>${fmt(choice)}</span></button>`).join('')}</div>
    <div class="nafs-feedback" tabindex="-1" aria-live="polite">${feedback}</div>${done ? `<button class="primary" data-nafs-next>${session.index === session.questionIds.length - 1 ? 'شاهدي نتيجتكِ' : 'السؤال التالي'} ←</button>` : ''}
    <p class="local-note">النتيجة من المحاولة الأولى. المحاولة الثانية فرصة للتعلّم.</p></section>`;
}

function result(session) {
  const a = analyse(session);
  return `${back}${head('أحسنتِ إكمال التدريب!')}<section class="nafs-result question-panel"><h2>نتيجتكِ: ${ar(a.correct)} من ${ar(a.total)}</h2><p>إجابات صحيحة من المحاولة الأولى${a.assisted ? ` · نجحتِ بعد التلميح في ${ar(a.assisted)}` : ''}</p>
    <p class="nafs-note">هذا تشخيص لهذه الجولة فقط؛ جربي مهارات أخرى لتتعرفي إلى مستواكِ أكثر.</p>
    <div class="nafs-analysis">${a.domains.filter(d => d.total).map(d => `<section><h3>${esc(d.title)} <span>${pct(d)}</span></h3><p class="nafs-sample">${ar(d.correct)} من ${ar(d.total)} من المحاولة الأولى</p><ul>${a.skills.filter(s => s.domain === d.id).map(s => `<li><div><span>${s.correct === s.total ? '✓' : '△'}</span> <strong>${esc(s.title)}</strong><small>${s.correct === s.total ? 'متقنة في هذه الجولة' : 'تحتاج تدريبًا'} · ${ar(s.correct)} من ${ar(s.total)}</small></div>${s.correct < s.total ? `<button class="secondary" data-nafs-retrain="${s.id}">تدرّبي على هذه المهارة</button>` : ''}</li>`).join('')}</ul></section>`).join('')}</div>
    <div class="nafs-modes"><button class="primary" data-nafs-restart>جولة جديدة</button><a class="secondary" href="#nafs-history">نتائجكِ السابقة</a></div></section>${mentor('closing','كل محاولة تعلّمكِ فكرة جديدة 💜')}`;
}

function history() {
  return `${back}${head('نتائجكِ السابقة','محفوظة على هذا الجهاز، ومستقلة عن رصيد الموقع.')}<div class="nafs-history">${store.history.length ? [...store.history].reverse().map(s => {const a = analyse(s); return `<article class="chapter-card"><h2>${s.mode === 'skill' ? esc(skillById.get(s.skillId).title) : modeName(s.mode)}</h2><p>${new Date(s.started).toLocaleDateString('ar-SA',{calendar:'gregory',timeZone:'Asia/Riyadh'})}</p><strong>${ar(a.correct)} من ${ar(a.total)}</strong><button class="secondary" data-nafs-history="${esc(s.id)}">شاهدي التشخيص</button></article>`;}).join('') : '<p>ابدئي جولة لتظهر نتائجكِ هنا.</p>'}</div>`;
}
export function view(page) {
  let content;
  if (page === 'nafs') content = landing();
  else if (page === 'nafs-history') content = history();
  else if (page.startsWith('nafs-domain-')) content = domainPage(page.slice(12));
  else {
    const mode = page === 'nafs-mixed' ? 'mixed' : page === 'nafs-simulation' ? 'simulation' : 'skill';
    const id = mode === 'skill' ? page.slice(11) : null;
    if (mode === 'skill' && !skillById.has(id)) return `<div class="nafs">${head('اختاري مهارة التدريب')}${back}</div>`;
    if (!store.active || routeFor(store.active) !== page) start(mode, id);
    content = store.active.finished ? result(store.active) : training(store.active);
  }
  return `<div class="nafs">${storageWarning ? '<p role="status" class="nafs-note">يمكنكِ التدريب، لكن تعذر حفظ النتيجة على هذا الجهاز.</p>' : ''}${content}</div>`;
}
export function click(event, page, refresh, go) {
  const button = event.target.closest('[data-nafs-answer],[data-nafs-next],[data-nafs-retrain],[data-nafs-restart],[data-nafs-history]');
  if (!button) return false;
  if (button.hasAttribute('data-nafs-answer')) {
    if (!store.active || routeFor(store.active) !== page || !respond(store.active, Number(button.dataset.nafsAnswer))) return true;
    save(); refresh();
    document.querySelector(settled(store.active) ? '.nafs-feedback' : '.nafs-choices button:not(:disabled)')?.focus({preventScroll:true});
    document.querySelector('.nafs-feedback')?.scrollIntoView({block:'nearest',behavior:'instant'});
  } else if (button.hasAttribute('data-nafs-next')) {
    if (store.active && advance(store.active)) {
      if (store.active.finished && !store.history.some(s => s.id === store.active.id)) store.history.push(structuredClone(store.active));
      store.history = store.history.slice(-30); save(); refresh();
      document.querySelector('.nafs h1')?.focus({preventScroll:true});
      window.scrollTo({top:0,behavior:'instant'});
    }
  } else if (button.hasAttribute('data-nafs-retrain')) {
    if (!skillById.has(button.dataset.nafsRetrain)) return true;
    start('skill', button.dataset.nafsRetrain); go(routeFor(store.active));
  } else if (button.hasAttribute('data-nafs-restart')) {
    start(store.active.mode, store.active.skillId); refresh();
  } else {
    const saved = store.history.find(s => s.id === button.dataset.nafsHistory);
    if (saved) { store.active = structuredClone(saved); save(); go(routeFor(store.active)); }
  }
  return true;
}
