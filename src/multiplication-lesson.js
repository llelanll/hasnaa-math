import {visualRoute,visualIntro,visualExamples,visualClick,patternExamples,patternIdeas} from './visual-learning.js';
import {mathHTML as eq,formatMathText as prose} from './math-direction.js';
import {getState,setState,recordLesson} from './progress.js';
import {lessonNavigation} from './chapter-progress.js';
import {mentor,lessonMentor} from './characters.js';
const ar = n => n.toLocaleString('ar-SA');
export const practice = [
 {prompt:'المستوى الأول · استعملي القيمة المنزلية',math:'٩ × ١٠ = ؟',options:[90,19,900],answer:90,hint:'١٠ آحاد تساوي عشرة واحدة. ماذا تصبح ٩ آحاد؟',explain:'تصبح ٩ عشرات، أي ٩٠.',skill:'الضرب في قوى العشرة'},
 {prompt:'المستوى الثاني · انطلقي من حقيقة أساسية',math:'٤ × ٨٠٠ = ؟',options:[320,3200,32000],answer:3200,hint:'احسبي ٤ × ٨ أولًا، ثم اجعلي الناتج مئات.',explain:'٤ × ٨ = ٣٢؛ إذن ٣٢ مئة = ٣٢٠٠.',skill:'استخدام حقيقة الضرب'},
 {prompt:'المستوى الثالث · كلا العاملين فيه أصفار',math:'٣٠ × ٦٠٠ = ؟',options:[1800,18000,180000],answer:18000,hint:'٣ × ٦ = ١٨. والعاملان يحتويان معًا على ثلاثة أصفار في نهايتيهما.',explain:'١٨ × ١٠ × ١٠٠ = ١٨٠٠٠.',skill:'ضرب مضاعفات العشرة'},
 {prompt:'المستوى الرابع · انتبهي لصفر الحقيقة الأساسية',math:'٤٠ × ٥٠ = ؟',options:[200,2000,20000],answer:2000,hint:'٤ × ٥ = ٢٠. احتفظي بصفر ٢٠، ثم اضربي في ١٠٠.',explain:'٢٠ × ١٠٠ = ٢٠٠٠. الصفر في ٢٠ جزء من الحقيقة الأساسية.',skill:'ضرب مضاعفات العشرة'}
];
export const quiz = [
 {prompt:'أكملي الناتج',math:'٢٣ × ١٠٠ = ؟',options:['٢٣٠','٢٣٠٠','٢٣٠٠٠'],answer:1,skill:'الضرب في قوى العشرة',explain:'٢٣ × ١٠٠ = ٢٣٠٠؛ تصبح كل آحاد مئة.'},
 {prompt:'استخدمي الحقيقة الأساسية: ٧ × ٤ = ٢٨',math:'٧ × ٤٠٠٠ = ؟',options:['٢٨٠٠','٢٨٠٠٠','٢٨٠٠٠٠'],answer:1,skill:'استخدام حقيقة الضرب',explain:'٢٨ ألفًا تساوي ٢٨٠٠٠.'},
 {prompt:'اختاري العدد الناقص في نمط النواتج',math:'٣ × ٦ = ١٨ ، ٣ × ٦٠ = ١٨٠ ، ٣ × ٦٠٠ = ؟',options:['١٨٠٠','١٨٠','١٨٠٠٠'],answer:0,skill:'استخدام حقيقة الضرب',explain:'كلما أصبح العامل أكبر بعشر مرات، أصبح الناتج أكبر بعشر مرات: ١٨٠٠.'},
 {prompt:'قالت ريم: ٢٠ × ٥٠ = ١٠٠. أي تفسير يصحح إجابتها؟',options:['إجابتها صحيحة','٢ × ٥ = ١٠، ثم ١٠ × ١٠٠ = ١٠٠٠','٢ × ٥ = ١٠، ثم ١٠ + ١٠٠ = ١١٠'],answer:1,skill:'ضرب مضاعفات العشرة',explain:'صفر ١٠ لا يُحذف. نضرب الحقيقة الأساسية ١٠ في ١٠٠، فيكون الناتج ١٠٠٠.'},
 {prompt:'جهزت طالبات ٦٠ حقيبة، في كل حقيبة ٣٠ خرزة. كم خرزة استخدمن؟',options:['١٨٠','٩٠','١٨٠٠'],answer:2,skill:'تطبيق الضرب في موقف حياتي',explain:'٦٠ × ٣٠ = ١٨ × ١٠٠ = ١٨٠٠ خرزة.'}
];
const steps=['👀 شوفي','🔎 مثال','🧠 جرّبي','🎮 العبي','⭐ تحدّي','نتيجتي ⭐'];
let step=0,warm=null,pi=0,done=new Set(),feedback='',qi=0,answers=Array(5).fill(null),submitted=false,gameComplete=false;
const saved=getState('multiplication-patterns')||{};
if(Number.isInteger(saved.step)&&saved.step>=0&&saved.step<6)step=saved.step;
if([16,60,600].includes(saved.warm))warm=saved.warm;
if(Number.isInteger(saved.pi)&&saved.pi>=0&&saved.pi<4)pi=saved.pi;
if(Number.isInteger(saved.qi)&&saved.qi>=0&&saved.qi<5)qi=saved.qi;
if(Array.isArray(saved.done))done=new Set(saved.done.filter(n=>Number.isInteger(n)&&n>=0&&n<4));
if(Array.isArray(saved.answers)&&saved.answers.length===5)answers=saved.answers.map(n=>Number.isInteger(n)&&n>=0&&n<3?n:null);
submitted=saved.submitted===true&&!answers.includes(null);gameComplete=saved.gameComplete===true;
if(step===5&&!submitted)step=0;
let quizRound=saved.quizRound===1?1:0;
const attempts=Array.isArray(saved.attempts)&&saved.attempts.length===4?saved.attempts.map(n=>Number.isInteger(n)&&n>=0?n:0):[0,0,0,0];
function persist(){setState('multiplication-patterns',{step,warm,pi,done:[...done],qi,answers,submitted,gameComplete,attempts,quizRound});}

export function completeLessonGame(){gameComplete=true;step=4;persist();}
export function lessonView(){
 const sections=[understand,examples,training,play,assessment,review];
 return `<section class="page-title"><span class="eyebrow">الفصل الثالث · الضرب · الدرس الأول</span><h1>أنماط الضرب</h1></section>${lessonNavigation('multiplication-patterns')}${visualRoute('data-lesson-step',step,submitted)}<section class="lesson-content visual-lesson" aria-label="${steps[step]}">${step===2&&done.has(pi)?mentor('cheer','أحسنتِ! ثابري على هذا التقدّم.'):lessonMentor(step)}${sections[step]()}</section><div class="lesson-controls">${step>0?`<button class="secondary" data-lesson-step="${step===2?0:step-1}">→ السابق</button>`:''}${step<4?`<button class="primary" data-lesson-step="${step===0?2:step+1}">${steps[step===0?2:step+1]} ←</button>`:''}</div><p class="local-note">⭐ نقاطكِ وتقدّمكِ محفوظان على هذا الجهاز.</p>`;
}
const patternLesson={slug:'multiplication-patterns',paragraphs:patternIdeas,goals:['تضربين في ١٠ و١٠٠ و١٠٠٠.','تستخدمين حقيقة الضرب لأعداد أكبر.','تفسرين الأصفار بالقيمة المنزلية.'],examples:patternExamples};
function understand(){return visualIntro(patternLesson,`<h2>٦ مجموعات من عشرة</h2><div class="dot-groups" aria-label="ست مجموعات، كل مجموعة عشر نقاط">${Array.from({length:6},()=>'<span>●●●●●<br>●●●●●</span>').join('')}</div><div class="lesson-options">${[16,60,600].map(n=>`<button class="answer" data-warm="${n}" ${warm===60?'disabled':''}>${ar(n)}</button>`).join('')}</div><div role="status" aria-live="polite">${warm===null?'':warm===60?'<p class="feedback success">أحسنتِ! ٦ × ١٠ = ٦٠</p>':'<p class="feedback retry">حاولي مجددًا: عدّي بالعشرات.</p>'}</div>`);}
function examples(){return visualExamples(patternLesson);}
function training(){const q=practice[pi];return `<span class="eyebrow">أتدرّب · السؤال ${ar(pi+1)} من ٤</span><h2>${q.prompt}</h2><div class="pattern">${eq(q.math)}</div><div class="lesson-options">${q.options.map(n=>`<button class="answer" data-practice="${n}" ${done.has(pi)?'disabled':''}>${ar(n)}</button>`).join('')}</div><div role="status" aria-live="polite">${feedback}</div><button class="text-button" data-hint>أحتاج تلميحًا ✧</button><div class="lesson-controls">${pi>0?'<button class="secondary" data-practice-prev>التدريب السابق</button>':''}${done.has(pi)?pi<3?'<button class="primary" data-practice-next>التدريب التالي ←</button>':'<p class="feedback success">أكملتِ التدريب! أنتِ مستعدة للعبة 🌟</p>':''}</div>`;}
function play(){return `<div class="lesson-game"><span class="big-icon">🎮</span><h2>لعبة أنماط الضرب</h2><p>١٠ أسئلة · أنماط وتضاعف · نجوم ⭐</p>${gameComplete?'<p class="feedback success">أكملتِ اللعبة في تقدّمكِ المحفوظ! يمكنكِ اللعب مجددًا أو متابعة الاختبار.</p>':''}<button class="primary" data-lesson-game>ابدئي اللعبة ←</button></div>`;}
function assessment(){if(submitted)return `<h2>أكملتِ اختباركِ 🌟</h2><p>نتيجتكِ ومراجعة مهاراتكِ جاهزتان.</p><button class="primary" data-lesson-step="5">أراجع نتيجتي ←</button><button class="secondary" data-quiz-reset>أعيد الاختبار</button>`;const q=quiz[qi];return `<span class="eyebrow">أختبر نفسي · السؤال ${ar(qi+1)} من ٥</span><h2>${q.prompt}</h2>${q.math?`<div class="pattern">${eq(q.math)}</div>`:''}${quizRound===1?'<p class="feedback retry">لديكِ فرصة ثانية يا بطلة. استعملي الحقيقة الأساسية، ثم افحصي قيمة الأرقام والأصفار في كل عامل.</p>':''}<div class="quiz-options">${q.options.map((s,i)=>`<button class="answer ${answers[qi]===i?'selected':''}" aria-pressed="${answers[qi]===i}" data-quiz-answer="${i}">${s}</button>`).join('')}</div><p role="status">أجبتِ عن ${ar(answers.filter(a=>a!==null).length)} من ٥ أسئلة.</p><div class="lesson-controls">${qi>0?'<button class="secondary" data-quiz-prev>السؤال السابق</button>':''}${qi<4?'<button class="primary" data-quiz-next>السؤال التالي ←</button>':`<button class="primary" data-quiz-submit ${answers.includes(null)?'disabled':''}>تسليم الاختبار</button>`}</div>`;}
function review(){const count=quiz.filter((q,i)=>answers[i]===q.answer).length;const skills=[...new Set(quiz.map(q=>q.skill))];return `<span class="eyebrow">أراجع نتيجتي · احتفلي بما تعلمتِه</span><h2>${count===5?'مبدعة يا بطلة!':'أحسنتِ المحاولة، واصلي التقدّم 💜'}</h2><div class="score">${ar(count)} <small>/ ٥</small></div><p>أضفتِ ${ar(count*10)} نقطة في هذا الاختبار.</p><div class="skill-grid">${skills.map(s=>{const qs=quiz.map((q,i)=>({q,i})).filter(x=>x.q.skill===s);const good=qs.every(x=>answers[x.i]===x.q.answer);return `<article class="lesson-inset"><h3>${good?'✓ أتقنتِ':'✧ راجعي'}: ${s}</h3></article>`;}).join('')}</div><h3>إجاباتكِ خطوة بخطوة</h3>${quiz.map((q,i)=>`<details class="lesson-inset"><summary>${ar(i+1)} · ${answers[i]===q.answer?'إجابة صحيحة ✓':'فرصة للتعلّم ✧'}</summary><p>${q.prompt}</p><p>إجابتكِ: ${q.options[answers[i]]} · الإجابة الصحيحة: ${q.options[q.answer]}</p><p>${q.explain}</p></details>`).join('')}<button class="primary" data-lesson-step="1">أراجع الأمثلة</button><button class="secondary" data-quiz-reset>أحاول اختبارًا جديدًا</button>`;}
export function lessonClick(e,{refresh,award,startGame}){
 if(visualClick(e,'multiplication-patterns',refresh))return true;
 const el=e.target.closest('[data-lesson-step],[data-warm],[data-practice],[data-hint],[data-practice-prev],[data-practice-next],[data-lesson-game],[data-quiz-answer],[data-quiz-prev],[data-quiz-next],[data-quiz-submit],[data-quiz-reset]');if(!el)return false;
 const d=el.dataset;
 if('lessonStep'in d){const n=Number(d.lessonStep);if(n>=0&&n<=5&&(n!==5||submitted))step=n;}
 if('warm'in d)warm=Number(d.warm);
 if('practice'in d&&!done.has(pi)){const q=practice[pi];if(Number(d.practice)===q.answer){done.add(pi);award(10);feedback=`<p class="feedback success">أحسنتِ! ${q.explain} أضفتِ ١٠ نقاط ⭐</p>`;}else {attempts[pi]++;feedback=`<p class="feedback retry">${attempts[pi]===1?'حاولي مجددًا يا بطلة. '+q.hint:'لنشرحها معًا: '+q.explain}</p>`;}}
 if('hint'in d)feedback=`<p class="feedback retry">تلميح: ${practice[pi].hint}</p>`;
 if('practicePrev'in d){pi=Math.max(0,pi-1);feedback='';}
 if('practiceNext'in d&&done.has(pi)){pi=Math.min(3,pi+1);feedback='';}
 if('lessonGame'in d){startGame();return true;}
 if('quizAnswer'in d&&!submitted)answers[qi]=Number(d.quizAnswer);
 if('quizPrev'in d)qi=Math.max(0,qi-1);
 if('quizNext'in d)qi=Math.min(4,qi+1);
 if('quizSubmit'in d&&!submitted&&!answers.includes(null)){const wrong=quiz.map((q,i)=>answers[i]!==q.answer?i:-1).filter(i=>i>=0);if(quizRound===0&&wrong.length){quizRound=1;wrong.forEach(i=>answers[i]=null);qi=wrong[0];}else {submitted=true;const count=quiz.filter((q,i)=>answers[i]===q.answer).length;recordLesson('multiplication-patterns',count);award(count*10);step=5;}}
 if('quizReset'in d){answers=Array(5).fill(null);submitted=false;quizRound=0;qi=0;step=4;}
 persist();refresh();return true;
}
