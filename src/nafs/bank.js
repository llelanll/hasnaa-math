// Original fifth-grade preparation items, mapped to the official 2026 outcomes.
// The sixth-grade official forms are references for reasoning and layout only.
// `answer` is a zero-based choice index; `proof` is independent audit metadata.
export const domains = [
  { id: 'numbers', title: 'الأعداد والعمليات عليها', icon: '🔢', description: 'أعداد وكسور وعمليات وتقدير' },
  { id: 'algebra', title: 'الجبر والتحليل', icon: '🧩', description: 'أنماط وعلاقات ومعادلات بسيطة' },
  { id: 'geometry', title: 'الهندسة والقياس', icon: '📐', description: 'أشكال ومواقع وقياسات' },
  { id: 'data', title: 'الإحصاء والاحتمالات', icon: '📊', description: 'بيانات وتوقعات وقراءة تمثيلات' },
];

const skill = (id, domain, title, indicator, page, section, sourceIndicator, grade5) => ({
  id, domain, title, indicator,
  source: { page, section, indicator: sourceIndicator },
  grade5,
});

export const skills = [
  skill('place-value', 'numbers', 'القيمة المنزلية والصيغة التحليلية', 'يحدد القيمة المنزلية ويكتب الأعداد في الصور القياسية والتحليلية.', 22, 'الأعداد ومجموعات الأعداد', '١، ٢ من ناتج القيمة المنزلية', 'الفصل الأول: الأعداد الكلية ضمن الملايين.'),
  skill('whole-compare', 'numbers', 'مقارنة الأعداد الكلية', 'يقارن بين الأعداد باستخدام الرموز ويرتبها.', 22, 'الأعداد ومجموعات الأعداد', '٣ من ناتج القيمة المنزلية', 'الفصل الأول: مقارنة الأعداد ضمن الملايين.'),
  skill('decimal-place', 'numbers', 'القيمة المنزلية في الكسور العشرية', 'يحدد القيمة المنزلية للأرقام في الكسور العشرية.', 22, 'الأعداد ومجموعات الأعداد', '١ من ناتج الكسور العشرية', 'الفصل الأول: الأعشار والأجزاء من مئة وألف.'),
  skill('decimal-round', 'numbers', 'تقريب الكسور العشرية', 'يقرب الكسر العشري إلى أقرب عدد كلي أو منزلة معطاة.', 22, 'الأعداد ومجموعات الأعداد', '١ من ناتج الكسور العشرية', 'الفصل الثاني: التقريب إلى منزلة محددة.'),
  skill('decimal-compare', 'numbers', 'مقارنة الكسور العشرية', 'يقارن بين الكسور العشرية ويرتبها.', 22, 'الأعداد ومجموعات الأعداد', '٣ من ناتج الكسور العشرية', 'الفصل الأول: مقارنة حتى الأجزاء من ألف.'),
  skill('fraction-model', 'numbers', 'تمثيل الكسور الاعتيادية', 'يميز الكسر الاعتيادي ويمثله باستخدام النماذج والرسوم.', 22, 'الأعداد ومجموعات الأعداد', '١ من ناتج الكسور الاعتيادية', 'الفصل السادس: جزء من كل مقسم بالتساوي.'),
  skill('fraction-equivalent', 'numbers', 'الكسور المكافئة', 'يوجد الكسور المكافئة لكسر ويكتب كسرًا في أبسط صورة.', 22, 'الأعداد ومجموعات الأعداد', '٢ من ناتج الكسور الاعتيادية', 'الفصل الثامن: توليد الكسور المكافئة.'),
  skill('fraction-compare', 'numbers', 'مقارنة الكسور الاعتيادية', 'يقارن بين الكسور والأعداد الكسرية ويرتبها.', 22, 'الأعداد ومجموعات الأعداد', '٥ من ناتج الكسور الاعتيادية', 'الفصل الثامن: مقارنة كسور موجبة.'),
  skill('fraction-calc', 'numbers', 'جمع الكسور وطرحها', 'يجمع الكسور المتشابهة وغير المتشابهة ويطرحها ويكتب الناتج في أبسط صورة.', 23, 'العمليات على الأعداد والحس العددي', '١ من ناتج عمليات الكسور الاعتيادية', 'الفصل التاسع: الجمع والطرح فقط.'),
  skill('decimal-calc', 'numbers', 'جمع الكسور العشرية وطرحها', 'يجمع الكسور العشرية حتى الجزء من ألف ويطرحها.', 23, 'العمليات على الأعداد والحس العددي', '١ من ناتج عمليات الكسور العشرية', 'الفصل الثاني: محاذاة المنازل والجمع والطرح فقط.'),
  skill('whole-operations', 'numbers', 'حل مسائل العمليات على الأعداد الكلية', 'يحل مسائل على العمليات الأربع تتضمن تطبيقات حياتية ويفسر حلها.', 22, 'العمليات على الأعداد والحس العددي', '١–٤ من ناتج عمليات الأعداد الكلية', 'الفصول الثاني والثالث والرابع: حساب في سياق قصير.'),
  skill('factors', 'numbers', 'العوامل والقاسم المشترك الأكبر', 'يوجد عوامل عدد والقاسم المشترك الأكبر ويحل مسائل عليها.', 23, 'العمليات على الأعداد والحس العددي', '١، ٤، ٥ من ناتج العوامل والمضاعفات', 'الفصل الثامن: تقسيم مجموعات متساوية.'),
  skill('multiples', 'numbers', 'المضاعفات والمضاعف المشترك الأصغر', 'يوجد مضاعفات عدد والمضاعف المشترك الأصغر ويحل مسائل عليها.', 23, 'العمليات على الأعداد والحس العددي', '٢، ٤، ٥ من ناتج العوامل والمضاعفات', 'الفصل الثامن: تزامن أحداث دورية بسيطة.'),
  skill('estimate', 'numbers', 'التقدير والحساب الذهني', 'يقدر نواتج العمليات مستخدمًا التقريب ويتحقق من معقوليتها.', 23, 'العمليات على الأعداد والحس العددي', '١، ٢، ٣، ٥ من ناتج التقدير والحساب الذهني', 'الفصول الثاني والثالث والرابع: تقريب مع تعليمات محددة.'),
  skill('number-pattern', 'algebra', 'الأنماط العددية', 'يميز الأنماط العددية المتنامية ويوسعها ويكمل العناصر المفقودة.', 24, 'الأنماط والعلاقات والدوال', '١ من ناتج الأنماط والعلاقات', 'الفصل الثالث: قاعدة جمع أو ضرب واحدة.'),
  skill('shape-pattern', 'algebra', 'الأنماط الهندسية', 'يميز الأنماط الهندسية المتنامية ويوسعها ويكمل العناصر المفقودة.', 24, 'الأنماط والعلاقات والدوال', '٢ من ناتج الأنماط والعلاقات', 'نمط مجموعات مربعات متزايدة، دون حد نوني رمزي.'),
  skill('input-output', 'algebra', 'جداول المدخلات والمخرجات', 'يكمل البيانات في جداول المدخلات والمخرجات وفق قاعدة معطاة.', 24, 'الأنماط والعلاقات والدوال', '٣، ٤ من ناتج الأنماط والعلاقات', 'الفصل الخامس: قواعد بعملية واحدة أو عمليتين بسيطتين.'),
  skill('expression', 'algebra', 'إيجاد قيمة العبارة الجبرية', 'يميز العبارة الجبرية ويوجد قيمتها باستخدام ترتيب العمليات.', 24, 'البنى الجبرية والعبارات الرياضية', '١ من ناتج العبارات الجبرية والمعادلات', 'الفصل الخامس: تعويض قيمة موجبة في عبارة قصيرة.'),
  skill('equation-add', 'algebra', 'معادلات الجمع والطرح', 'يحل المعادلة الخطية البسيطة ذات الخطوة الواحدة ذهنيًا وبالنماذج.', 24, 'البنى الجبرية والعبارات الرياضية', '٢ من ناتج العبارات الجبرية والمعادلات', 'الفصل الخامس: معادلة جمع أو طرح ذات خطوة واحدة.'),
  skill('equation-multiply', 'algebra', 'معادلات الضرب والقسمة', 'يحل المعادلة الخطية البسيطة ذات الخطوة الواحدة ويشرح حلها.', 24, 'البنى الجبرية والعبارات الرياضية', '٢، ٣ من ناتج العبارات الجبرية والمعادلات', 'الفصل الخامس: حقائق ضرب وقسمة موجبة.'),
  skill('lines', 'geometry', 'المفاهيم الهندسية والعلاقات بين المستقيمات', 'يميز القطعة المستقيمة والمستقيمات المتقاطعة والمتوازية والمتعامدة.', 24, 'الأشكال الهندسية', '١، ٣ من ناتج المفاهيم الهندسية الأولية', 'الفصل الحادي عشر: وصف خصائص مباشرة.'),
  skill('angles', 'geometry', 'تصنيف الزوايا', 'يميز الزوايا القائمة والحادة والمنفرجة والمستقيمة.', 24, 'الأشكال الهندسية', '٢ من ناتج المفاهيم الهندسية الأولية', 'الفصل الحادي عشر: تصنيف دون علاقات زوايا متقدمة.'),
  skill('polygons', 'geometry', 'خصائص المضلعات', 'يميز المضلعات والأشكال الرباعية ويصنفها وفق خصائصها.', 24, 'الأشكال الهندسية', '١، ٣ من ناتج خصائص الأشكال', 'الفصل الحادي عشر: عدد الأضلاع وخصائص أشكال مألوفة.'),
  skill('solids', 'geometry', 'عناصر المنشور والمكعب', 'يميز المنشور الثلاثي والرباعي والمكعب ويحدد أوجهه وأحرفه ورؤوسه.', 24, 'الأشكال الهندسية', '٤ من ناتج خصائص الأشكال', 'الفصل الثاني عشر: الأوجه والأحرف والرؤوس.'),
  skill('coordinates', 'geometry', 'تسمية المواقع بالأزواج المرتبة', 'يسمي مواقع النقاط في الربع الأول مستخدمًا الأزواج المرتبة.', 25, 'الإحداثيات والتحويلات الهندسية', '١ من ناتج المستوى الإحداثي والتحويلات', 'الفصل الحادي عشر: الربع الأول فقط.'),
  skill('translation', 'geometry', 'الانسحاب على الشبكة', 'يميز الانسحاب في الربع الأول ويرسم صورة شكل بانسحاب معطى.', 25, 'الإحداثيات والتحويلات الهندسية', '٢ من ناتج المستوى الإحداثي والتحويلات', 'الفصل الحادي عشر: إزاحة أفقية أو رأسية بنواتج موجبة.'),
  skill('transformations', 'geometry', 'تمييز التحويلات الهندسية', 'يميز الانسحاب والانعكاس والدوران.', 25, 'الإحداثيات والتحويلات الهندسية', '٢، ٣، ٤ من ناتج المستوى الإحداثي والتحويلات', 'الفصل الحادي عشر: وصف مرآة أو دوران أو نقل دون تغيير الحجم.'),
  skill('length', 'geometry', 'التحويل بين وحدات الطول', 'يميز العلاقات بين وحدات الطول المترية ويحول بينها.', 25, 'القياس', '١ من ناتج وحدات القياس', 'الفصل العاشر: ملم وسم وم وكلم.'),
  skill('mass-capacity', 'geometry', 'التحويل بين وحدات الكتلة والسعة', 'يميز العلاقات بين وحدات الكتلة والسعة ويحول بينها.', 25, 'القياس', '٢، ٣ من ناتج وحدات القياس', 'الفصل العاشر: كجم وجرام ولتر ومللتر.'),
  skill('time', 'geometry', 'حساب الزمن المنقضي', 'يميز العلاقات بين وحدات الزمن ويستخدمها في التحويل.', 25, 'القياس', '٤ من ناتج وحدات القياس', 'الفصل العاشر: زمن منقض بالدقائق في اليوم نفسه.'),
  skill('perimeter', 'geometry', 'محيط المستطيل والمربع', 'يستخدم صيغ المحيط للمستطيل والمربع في مسائل حياتية.', 25, 'القياس', '١، ٣ من ناتج المحيط والمساحة', 'الفصل الثاني عشر: حدود مستطيل ومربع فقط.'),
  skill('area', 'geometry', 'مساحة المستطيل والمربع', 'يحسب مساحة المستطيل والمربع ويحل مسائل حياتية عليها.', 25, 'القياس', '٢، ٣ من ناتج المحيط والمساحة', 'الفصل الثاني عشر: مربعات وحدة أو حاصل ضرب بعدين.'),
  skill('volume', 'geometry', 'حجم المنشور الرباعي', 'يستخدم صيغة حجم المنشور الرباعي القائم في حساب حجمه.', 25, 'القياس', '١، ٢، ٤ من ناتج الحجم', 'الفصل الثاني عشر: حجم فقط، دون مساحة سطحية.'),
  skill('data-read', 'data', 'قراءة التمثيلات البيانية والجداول', 'يقرأ بيانات ممثلة بالأعمدة والجداول ويفسرها.', 25, 'الإحصاء والتمثيلات البيانية', '١، ٢ من ناتج جمع البيانات وتمثيلها', 'الفصل السابع: قيم ومجاميع وفروق مباشرة.'),
  skill('mean', 'data', 'إيجاد المتوسط الحسابي وتفسيره', 'يوجد المتوسط الحسابي لمجموعة قيم ويفسره في سياقها.', 26, 'تحليل البيانات وتفسيرها', '١ من ناتج مقاييس النزعة المركزية والمدى', 'الفصل السابع: مجموع يقبل القسمة على عدد القيم.'),
  skill('median', 'data', 'إيجاد الوسيط وتفسيره', 'يوجد الوسيط لمجموعة قيم مفردة ويفسره.', 26, 'تحليل البيانات وتفسيرها', '١ من ناتج مقاييس النزعة المركزية والمدى', 'الفصل السابع: خمس قيم تتطلب ترتيبًا.'),
  skill('mode', 'data', 'إيجاد المنوال', 'يميز المنوال ويوجده لمجموعة قيم مفردة.', 26, 'تحليل البيانات وتفسيرها', '١ من ناتج مقاييس النزعة المركزية والمدى', 'الفصل السابع: منوال واحد واضح.'),
  skill('range', 'data', 'إيجاد المدى وتفسيره', 'يوجد المدى لمجموعة من القيم ويفسره.', 26, 'تحليل البيانات وتفسيرها', '١ من ناتج مقاييس النزعة المركزية والمدى', 'الفصل السابع: الفرق بين أكبر قيمة وأصغرها.'),
  skill('outcomes', 'data', 'عد نواتج التجربة العشوائية', 'يوجد نواتج تجربة عشوائية وعددها باستخدام الجداول والقوائم المنظمة.', 26, 'حساب الاحتمالات', '١ من ناتج التجربة العشوائية', 'الفصل السابع: خيار من كل مجموعتين صغيرتين.'),
  skill('probability', 'data', 'التعبير عن الاحتمال بكسر', 'يعبر عن احتمال الحادثة باستخدام الكلمات والكسور الاعتيادية.', 26, 'حساب الاحتمالات', '٢، ٣ من ناتج التجربة العشوائية', 'الفصل السابع: قطع متساوية الفرصة، دون نسب مئوية.'),
];

const digits = text => String(text).replace(/\d/g, n => '٠١٢٣٤٥٦٧٨٩'[Number(n)]).replace(/\./g, '٫');
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const reduced = (n, d) => { const g = gcd(n, d); return `${n / g}/${d / g}`; };
const definitions = new Map(skills.map(s => [s.id, s]));
export const questions = [];
function add(id, i, data) {
  const s = definitions.get(id);
  const choices = [data.correct, ...data.distractors].map(digits);
  const answer = (skills.indexOf(s) + i) % 4;
  const correct = choices.shift();
  choices.splice(answer, 0, correct);
  if (choices.length !== 4 || new Set(choices).size !== 4) throw new Error(`Invalid choices: ${id}-${i}`);
  questions.push({
    id: `${id}-${i + 1}`, domain: s.domain, skill: s.id, indicator: s.indicator,
    question: digits(data.question), choices, answer,
    explanation: digits(data.explanation), hint: digits(data.hint),
    ...(data.visual ? { visual: data.visual } : {}),
    proof: { ...data.proof, expected: String(data.correct) },
  });
}

// Number operations and sense: a mix of place reasoning, models and contexts.
[[36425,1000],[58216,100],[74683,10],[21854,10000]].forEach(([number,place],i)=>{
  const value = Math.floor(number/place)%10*place;
  add('place-value',i,{question:`ما قيمة الرقم ${Math.floor(number/place)%10} في العدد ${number}؟`,correct:value,distractors:[value/10,value*10,value+place],hint:'حددي منزلة الرقم قبل كتابة قيمته.',explanation:`الرقم في منزلة قيمتها ${place}، لذلك قيمته ${value}.`,proof:{type:'place',args:{number,place}}});
});
[[48215,48125],[35070,35700],[628400,628400],[71980,71098]].forEach(([a,b],i)=>{
  const result=a>b?'>':a<b?'<':'=';
  add('whole-compare',i,{question:`اختاري الرمز الصحيح: ${a} □ ${b}`,correct:result,distractors:['>','<','=','لا يمكن المقارنة'].filter(x=>x!==result),hint:'ابدئي من أكبر منزلة؛ أول اختلاف يحسم المقارنة.',explanation:result==='='?'الأرقام متساوية في جميع المنازل.':`بالمقارنة من اليسار نجد أن ${a} ${result} ${b}.`,proof:{type:'compare',args:{a,b}}});
});
[[7.426,100],[18.537,10],[3.684,1000],[25.163,100]].forEach(([number,den],i)=>{
  const digit=Math.floor(number*den+1e-8)%10,value=digit/den;
  add('decimal-place',i,{question:`ما قيمة الرقم ${digit} في العدد ${number}؟`,correct:value,distractors:[Number((value*10).toFixed(6)),Number((value/10).toFixed(6)),Number((value*100).toFixed(6))],hint:'انظري كم منزلة يقع الرقم بعد الفاصلة.',explanation:`هذه منزلة ${den===10?'الأعشار':den===100?'الأجزاء من مئة':'الأجزاء من ألف'}؛ قيمة الرقم ${value}.`,proof:{type:'place',args:{number,place:1/den}}});
});
[[12.764,1],[8.346,2],[5.482,0],[26.153,1]].forEach(([value,places],i)=>{
  const scale=10**places,result=Math.round(value*scale)/scale;
  add('decimal-round',i,{question:`قرّبي ${value} إلى أقرب ${places===0?'عدد كلي':places===1?'جزء من عشرة':'جزء من مئة'}.`,correct:result,distractors:[result+1/scale,result-1/scale,value],hint:'انظري إلى الرقم الذي يلي المنزلة المطلوبة مباشرة.',explanation:`ننظر إلى الرقم التالي ثم نقرب؛ الناتج ${result}.`,proof:{type:'decimalRound',args:{value,places}}});
});
[[3.48,3.408],[7.205,7.25],[5.6,5.600],[0.91,0.901]].forEach(([a,b],i)=>{
  const result=a>b?'>':a<b?'<':'=';
  add('decimal-compare',i,{question:`اختاري الرمز الصحيح: ${a} □ ${b}`,correct:result,distractors:['>','<','=','لا يمكن المقارنة'].filter(x=>x!==result),hint:'أضيفي أصفارًا يمين الكسر حتى تتساوى المنازل.',explanation:`بعد محاذاة المنازل: ${a} ${result} ${b}.`,proof:{type:'compare',args:{a,b}}});
});
[[3,8],[2,5],[5,6],[3,10]].forEach(([n,d],i)=>add('fraction-model',i,{question:'ما الكسر الذي يمثل الأجزاء المظللة من الشريط؟',correct:`${n}/${d}`,distractors:[`${n-1}/${d}`,`${n}/${d+1}`,`${n+1}/${d}`],hint:'البسط للأجزاء المظللة، والمقام لجميع الأجزاء المتساوية.',explanation:`ظُلل ${n} من ${d} أجزاء؛ الكسر ${n}/${d}.`,visual:{type:'fraction',n,d},proof:{type:'fraction',args:{n,d}}}));
[[1,3,3],[2,5,2],[3,4,3],[2,7,4]].forEach(([n,d,k],i)=>add('fraction-equivalent',i,{question:`أي كسر يكافئ ${n}/${d}؟`,correct:`${n*k}/${d*k}`,distractors:[`${n*k-1}/${d*k}`,`${n*k}/${d*k+1}`,`${n*k+1}/${d*k}`],hint:'للحفاظ على القيمة، اضربي البسط والمقام في العدد نفسه.',explanation:`ضربنا البسط والمقام في ${k}؛ ${n}/${d} = ${n*k}/${d*k}.`,visual:{type:'fraction',n,d},proof:{type:'equivalentFraction',args:{n,d,k}}}));
[[2,3,3,4],[3,5,1,2],[4,6,2,3],[5,8,3,4]].forEach(([a,b,c,d],i)=>{
  const result=a*d>c*b?'>':a*d<c*b?'<':'=';
  add('fraction-compare',i,{question:`اختاري الرمز الصحيح: ${a}/${b} □ ${c}/${d}`,correct:result,distractors:['>','<','=','لا يمكن المقارنة'].filter(x=>x!==result),hint:'مثلي الكسرين بأجزاء لها الحجم نفسه، أو وحدي المقامين.',explanation:`بمقارنة حاصلَي الضرب: ${a*d} و${c*b} نجد ${a}/${b} ${result} ${c}/${d}.`,proof:{type:'fractionCompare',args:{a,b,c,d}}});
});
[[1,4,1,2,'+'],[5,6,1,3,'-'],[2,5,1,10,'+'],[7,8,1,4,'-']].forEach(([a,b,c,d,op],i)=>{
  const n=a*d+(op==='+'?1:-1)*c*b,den=b*d,result=reduced(n,den);
  add('fraction-calc',i,{question:`أوجدي الناتج في أبسط صورة: ${a}/${b} ${op} ${c}/${d}`,correct:result,distractors:[reduced(n+1,den),reduced(n-1,den),reduced(n+2,den)],hint:'وحدي المقامين أولًا، ثم اجمعي أو اطرحي البسطين.',explanation:`بعد توحيد المقامين وإجراء ${op==='+'?'الجمع':'الطرح'} نبسط الناتج إلى ${result}.`,proof:{type:'fractionCalc',args:{a,b,c,d,op}}});
});
[[7.45,2.8,'+'],[12.6,4.75,'-'],[3.275,1.125,'+'],[9.8,3.465,'-']].forEach(([a,b,op],i)=>{
  const result=Number((op==='+'?a+b:a-b).toFixed(3));
  add('decimal-calc',i,{question:`أوجدي الناتج: ${a} ${op} ${b}`,correct:result,distractors:[Number((result+0.1).toFixed(3)),Number((result-1).toFixed(3)),Number((result+1).toFixed(3))],hint:'حاذي الفاصلتين، وأكملي المنازل الخالية بأصفار.',explanation:`بعد محاذاة الفواصل نحصل على ${a} ${op} ${b} = ${result}.`,proof:{type:'arithmetic',args:{a,b,op}}});
});
[
  [145,278,'+','جمعت سارة 145 غطاءً، وجمعت ريم 278 غطاءً. كم غطاءً جمعتا؟'],
  [920,365,'-','في المكتبة 920 بطاقة. وُزعت 365 بطاقة. كم بطاقة بقيت؟'],
  [24,16,'×','في كل صندوق 24 قلمًا. كم قلمًا في 16 صندوقًا؟'],
  [432,12,'÷','وُزعت 432 بذرة بالتساوي على 12 حوضًا. كم بذرة لكل حوض؟'],
].forEach(([a,b,op,question],i)=>{
  const result=op==='+'?a+b:op==='-'?a-b:op==='×'?a*b:a/b;
  add('whole-operations',i,{question,correct:result,distractors:[result+10,result-10,result+1],hint:'حددي هل نحتاج جمعًا أو طرحًا أو مجموعات متساوية.',explanation:`العملية المناسبة: ${a} ${op} ${b} = ${result}.`,proof:{type:'arithmetic',args:{a,b,op}}});
});
[[18,24],[20,30],[16,40],[21,35]].forEach(([a,b],i)=>{
  const result=gcd(a,b);
  add('factors',i,{question:`مع جود ${a} خرزة بيضاء و${b} خرزة زرقاء. ما أكبر عدد من الأساور المتماثلة يمكن صنعه باستخدام الخرز كله؟`,correct:result,distractors:[result+1,result-1,a+b],hint:'ابحثي عن أكبر عدد يقسم الكميتين دون باقٍ.',explanation:`أكبر قاسم مشترك بين ${a} و${b} هو ${result}؛ نصنع ${result} أساور متماثلة.`,proof:{type:'gcd',args:{a,b}}});
});
[[4,6],[6,9],[5,8],[3,7]].forEach(([a,b],i)=>{
  const result=a*b/gcd(a,b);
  add('multiples',i,{question:`تضيء إشارة كل ${a} دقائق وأخرى كل ${b} دقائق. أضاءتا معًا الآن؛ بعد كم دقيقة تضيئان معًا لأول مرة؟`,correct:result,distractors:[a+b,result+a,result+1],hint:'اكتبي مضاعفات العددين وابحثي عن أول مضاعف مشترك موجب.',explanation:`أصغر مضاعف مشترك بين ${a} و${b} هو ${result} دقيقة.`,proof:{type:'lcm',args:{a,b}}});
});
[[48,23,10,'×'],[312,487,100,'+'],[794,218,100,'-'],[63,28,10,'×']].forEach(([a,b,unit,op],i)=>{
  const x=Math.round(a/unit)*unit,y=Math.round(b/unit)*unit,result=op==='×'?x*y:op==='+'?x+y:x-y;
  add('estimate',i,{question:`قدري ${a} ${op} ${b} بتقريب كل عدد إلى أقرب ${unit}.`,correct:result,distractors:[result+unit,result-unit,result+2*unit],hint:'قربي كل عدد أولًا، ثم أجري العملية على العددين المقربين.',explanation:`نقرب إلى ${x} و${y}، ثم ${x} ${op} ${y} = ${result}.`,proof:{type:'estimate',args:{a,b,unit,op}}});
});

// Algebra: reveal rules and relationships without sixth-grade symbolic work.
[[[3,6,12,24],'multiply',2],[[7,12,17,22],'add',5],[[2,6,18,54],'multiply',3],[[40,34,28,22],'add',-6]].forEach(([values,rule,step],i)=>{
  const last=values.at(-1),result=rule==='add'?last+step:last*step;
  add('number-pattern',i,{question:'ما العدد التالي في النمط؟',correct:result,distractors:[result+1,result-1,result+Math.abs(step)],hint:'قارني حدين متتاليين وحددي ما يتكرر في الانتقال.',explanation:rule==='multiply'?`نضرب في ${step} كل مرة؛ التالي ${result}.`:step>0?`نضيف ${step} كل مرة؛ التالي ${result}.`:`نطرح ${Math.abs(step)} كل مرة؛ التالي ${result}.`,visual:{type:'sequence',values:values.map(digits)},proof:{type:'sequence',args:{values,rule,step}}});
});
[[2,2,4],[3,3,4],[1,2,5],[4,2,4]].forEach(([start,step,index],i)=>{
  const result=start+(index-1)*step,values=Array.from({length:3},(_,k)=>start+k*step);
  add('shape-pattern',i,{question:`يزداد عدد المربعات بالقدر نفسه. كم مربعًا في الشكل رقم ${index}؟`,correct:result,distractors:[result+1,result-1,result+step],hint:'احسبي كم مربعًا نضيف في كل انتقال، ثم تابعي النمط.',explanation:`نبدأ بـ${start} ونضيف ${step} كل مرة؛ الشكل رقم ${index} فيه ${result} مربعات.`,visual:{type:'table',headers:['رقم الشكل','عدد المربعات'],rows:values.map((n,k)=>[digits(k+1),'■'.repeat(n)])},proof:{type:'gridPattern',args:{start,step,index}}});
});
[[3,2,1],[5,3,0],[4,1,6],[6,2,3]].forEach(([input,mul,addend],i)=>{
  const result=input*mul+addend;
  add('input-output',i,{question:`قاعدة الجدول: اضربي في ${mul} ثم أضيفي ${addend}. ما المخرج للمدخل ${input}؟`,correct:result,distractors:[result+1,result-1,result+mul+1],hint:'طبقي القاعدة بالترتيب على المدخل المطلوب.',explanation:`${input} × ${mul} + ${addend} = ${result}.`,visual:{type:'table',headers:['المدخل','المخرج'],rows:[[digits(1),digits(mul+addend)],[digits(2),digits(2*mul+addend)],[digits(input),'؟']]},proof:{type:'function',args:{input,mul,add:addend}}});
});
[[4,3,2],[5,2,7],[6,4,1],[3,5,4]].forEach(([x,mul,addend],i)=>{
  const result=x*mul+addend;
  add('expression',i,{question:`إذا كانت س = ${x}، فما قيمة ${mul} × س + ${addend}؟`,correct:result,distractors:[result+1,result-1,mul*(x+addend)],hint:'استبدلي س بقيمتها، ثم ابدئي بالضرب.',explanation:`نعوض س بـ${x}: ${mul} × ${x} + ${addend} = ${result}.`,proof:{type:'expression',args:{x,mul,add:addend}}});
});
[[8,21],[7,19],[-6,12],[-9,15]].forEach(([addend,total],i)=>{
  const result=total-addend,op=addend<0?'-':'+',shown=Math.abs(addend);
  add('equation-add',i,{question:`ما قيمة س؟ س ${op} ${shown} = ${total}`,correct:result,distractors:[result+1,result-1,total+addend+2],hint:'استخدمي العملية العكسية ليبقى س وحده.',explanation:`نستخدم ${addend<0?'الجمع':'الطرح'} في الطرفين؛ س = ${result}.`,proof:{type:'equation',args:{coefficient:1,add:addend,total}}});
});
[[4,0,28],[6,0,54],[0.2,0,3],[0.25,0,4]].forEach(([coefficient,addend,total],i)=>{
  const result=(total-addend)/coefficient,divide=coefficient<1,divisor=1/coefficient;
  add('equation-multiply',i,{question:divide?`ما قيمة س؟ س ÷ ${divisor} = ${total}`:`ما قيمة س؟ ${coefficient} × س = ${total}`,correct:result,distractors:[result+1,result-1,result+2],hint:'استخدمي حقيقة الضرب والقسمة المرتبطة بالمعادلة.',explanation:divide?`نضرب الطرفين في ${divisor}؛ س = ${result}.`:`نقسم الطرفين على ${coefficient}؛ س = ${result}.`,proof:{type:'equation',args:{coefficient,add:addend,total}}});
});

// Geometry and measurement: real measures, simple networks and first quadrant.
const lineNames={parallel:'متوازيان',perpendicular:'متعامدان',intersecting:'متقاطعان وغير متعامدين',segment:'قطعة مستقيمة'};
[
  ['parallel','مستقيمان في المستوى نفسه، لا يلتقيان مهما امتدا. ما وصفهما؟'],
  ['perpendicular','التقى مستقيمان وصنعا زاوية قائمة. ما وصفهما؟'],
  ['intersecting','التقى مستقيمان وصنعا زاوية حادة. ما وصفهما؟'],
  ['segment','جزء مستقيم له نقطتا نهاية. ما اسمه؟'],
].forEach(([kind,question],i)=>add('lines',i,{question,correct:lineNames[kind],distractors:Object.values(lineNames).filter(x=>x!==lineNames[kind]),hint:'راجعي الالتقاء ووجود زاوية قائمة أو نقطتي نهاية.',explanation:kind==='segment'?'القطعة المستقيمة لها بداية ونهاية.':kind==='parallel'?'المتوازيان لا يلتقيان في المستوى نفسه.':kind==='perpendicular'?'المتعامدان يصنعان زاوية قائمة.':'قد يتقاطع مستقيمان دون صنع زاوية قائمة.',proof:{type:'lines',args:{kind}}}));
[35,90,125,180].forEach((degrees,i)=>{
  const correct=degrees<90?'حادة':degrees===90?'قائمة':degrees<180?'منفرجة':'مستقيمة';
  add('angles',i,{question:`ما نوع زاوية قياسها ${degrees} درجة؟`,correct,distractors:['حادة','قائمة','منفرجة','مستقيمة'].filter(x=>x!==correct),hint:'قارني القياس بـ٩٠ درجة وبـ١٨٠ درجة.',explanation:degrees<90?'الحادة أصغر من الزاوية القائمة.':degrees===90?'قياس الزاوية القائمة ٩٠ درجة.':degrees<180?'المنفرجة أكبر من القائمة وأصغر من المستقيمة.':'الزاوية المستقيمة قياسها ١٨٠ درجة.',proof:{type:'angle',args:{degrees}}});
});
[['rectangle',4,'مستطيل'],['triangle',3,'مثلث'],['hexagon',6,'سداسي'],['square',4,'مربع']].forEach(([kind,count,label],i)=>add('polygons',i,{question:`كم ضلعًا للشكل ${label}؟`,correct:count,distractors:[count+1,count-1,count+2],hint:'عدي القطع المستقيمة التي تحيط بالشكل.',explanation:`للشكل ${label} ${count} أضلاع.`,visual:{type:'shape',kind},proof:{type:'polygon',args:{kind}}}));
[['cube','faces',6,'المكعب','الأوجه'],['rectangular','vertices',8,'المنشور الرباعي','الرؤوس'],['triangular','faces',5,'المنشور الثلاثي','الأوجه'],['cube','edges',12,'المكعب','الأحرف']].forEach(([kind,feature,count,label,featureLabel],i)=>add('solids',i,{question:`كم عدد ${featureLabel} في ${label}؟`,correct:count,distractors:[count+1,count-1,count+2],hint:'الوجه سطح، والحرف التقاء وجهين، والرأس التقاء أحرف.',explanation:`عدد ${featureLabel} في ${label} هو ${count}.`,proof:{type:'solid',args:{kind,feature}}}));
[[2,5],[6,3],[1,4],[5,2]].forEach(([x,y],i)=>add('coordinates',i,{question:'ما الزوج المرتب للنقطة المرسومة؟',correct:`(${x}, ${y})`,distractors:[`(${y}, ${x})`,`(${x+1}, ${y})`,`(${x}, ${y+1})`],hint:'اقرئي الموقع الأفقي أولًا، ثم الموقع الرأسي.',explanation:`ننتقل ${x} أفقيًا ثم ${y} رأسيًا؛ الزوج (${x}, ${y}).`,visual:{type:'coordinate',x,y},proof:{type:'coordinate',args:{x,y}}}));
[[2,3,2,0],[4,2,0,3],[5,5,-2,0],[3,6,0,-2]].forEach(([x,y,dx,dy],i)=>{
  const tx=x+dx,ty=y+dy,direction=dx>0?'يمينًا':dx<0?'يسارًا':dy>0?'إلى أعلى':'إلى أسفل',amount=Math.abs(dx||dy);
  add('translation',i,{question:`انسحبت النقطة (${x}, ${y}) بمقدار ${amount} وحدات ${direction}. ما موقعها الجديد؟`,correct:`(${tx}, ${ty})`,distractors:[`(${tx+1}, ${ty})`,`(${tx}, ${ty+1})`,`(${x}, ${y})`],hint:'غيّري الإحداثي الذي يوافق اتجاه الحركة فقط.',explanation:`نحرك ${amount} وحدات ${direction}؛ الموقع الجديد (${tx}, ${ty}).`,visual:{type:'coordinate',x,y},proof:{type:'translate',args:{x,y,dx,dy}}});
});
const transformNames={reflection:'انعكاس',rotation:'دوران',translation:'انسحاب'};
[
  ['reflection','ظهرت صورة الشكل كما في مرآة، وعلى البعد نفسه من خط المرآة. ما التحويل؟'],
  ['rotation','دار الشكل ربع دورة حول نقطة ثابتة دون أن يتغير حجمه. ما التحويل؟'],
  ['translation','انتقل الشكل ثلاث وحدات إلى اليمين دون أن يلتف. ما التحويل؟'],
  ['reflection','انقلب اتجاه سهم إلى صورة مرآته حول خط رأسي. ما التحويل؟'],
].forEach(([kind,question],i)=>add('transformations',i,{question,correct:transformNames[kind],distractors:[...Object.values(transformNames).filter(x=>x!==transformNames[kind]),'تغيير الحجم'],hint:'هل نقلنا الشكل، أم أدرناه حول نقطة، أم عكسناه حول خط؟',explanation:kind==='reflection'?'صورة المرآة تنتج عن الانعكاس.':kind==='rotation'?'الالتفاف حول نقطة ثابتة هو دوران.':'النقل في اتجاه واحد دون التفاف هو انسحاب.',proof:{type:'transform',args:{kind}}}));
[[3,100,'متر','سنتمتر'],[7,10,'سنتمترات','ملمتر'],[4,1000,'كيلومترات','متر'],[250,0.01,'سنتمترًا','متر']].forEach(([value,factor,from,to],i)=>{
  const result=value*factor;
  add('length',i,{question:`حولي ${value} ${from} إلى ${to}.`,correct:result,distractors:[result+1,result*10,result/10],hint:'عند التحويل لوحدة أصغر يزداد العدد، ولأكبر يقل.',explanation:`${factor>=1?'نضرب في':'نقسم على'} ${factor>=1?factor:1/factor}: ${value} ${factor>=1?'×':'÷'} ${factor>=1?factor:1/factor} = ${result} ${to}.`,proof:{type:'convert',args:{value,factor}}});
});
[[2,1000,'لتر','مللتر'],[3,1000,'كيلوجرامات','جرام'],[4500,0.001,'مللتر','لتر'],[7500,0.001,'جرام','كيلوجرام']].forEach(([value,factor,from,to],i)=>{
  const result=value*factor;
  add('mass-capacity',i,{question:`حولي ${value} ${from} إلى ${to}.`,correct:result,distractors:[result+1,result*10,result/10],hint:'اللتر ألف مللتر، والكيلوجرام ألف جرام.',explanation:`${factor>1?'نضرب في':'نقسم على'} 1000؛ الناتج ${result} ${to}.`,proof:{type:'convert',args:{value,factor}}});
});
[[9*60+20,10*60+5],[11*60+35,12*60+15],[14*60+10,14*60+55],[7*60+45,9*60]].forEach(([start,end],i)=>{
  const clock=n=>`${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`,result=end-start;
  add('time',i,{question:`بدأ نشاط الساعة ${clock(start)} وانتهى الساعة ${clock(end)} في اليوم نفسه. كم دقيقة استغرق؟`,correct:result,distractors:[result+10,result-10,result+5],hint:'احسبي إلى رأس الساعة، ثم أكملي حتى وقت النهاية.',explanation:`الفرق بين وقتي البداية والنهاية هو ${result} دقيقة.`,proof:{type:'elapsed',args:{start,end}}});
});
[[8,3],[6,6],[12,5],[9,4]].forEach(([width,height],i)=>{
  const result=2*(width+height);
  add('perimeter',i,{question:`حديقة مستطيلة طولها ${width} م وعرضها ${height} م. ما طول السياج حولها؟`,correct:result,distractors:[width*height,width+height,result+1],hint:'المحيط يجمع أطوال الحدود الأربعة.',explanation:`المحيط = 2 × (${width} + ${height}) = ${result} م.`,visual:{type:'shape',kind:'rectangle',width,height},proof:{type:'perimeter',args:{width,height}}});
});
[[7,4],[5,5],[8,3],[9,6]].forEach(([width,height],i)=>{
  const result=width*height;
  add('area',i,{question:`تغطي المربعات أرضية مستطيلة: ${width} أعمدة و${height} صفوف. ما المساحة بوحدات مربعة؟`,correct:result,distractors:[2*(width+height),result+width,result+1],hint:'احسبي عدد مربعات الصف، ثم عدد الصفوف.',explanation:`المساحة = ${width} × ${height} = ${result} وحدة مربعة.`,visual:{type:'grid',rows:height,cols:width},proof:{type:'area',args:{width,height}}});
});
[[4,3,2],[5,2,3],[3,3,3],[6,2,2]].forEach(([width,height,depth],i)=>{
  const result=width*height*depth;
  add('volume',i,{question:`علبة أبعادها ${width} سم و${height} سم و${depth} سم. ما حجمها بالسنتمتر المكعب؟`,correct:result,distractors:[width*height,result+depth,result+1],hint:'احسبي مكعبات الطبقة، ثم اضربي في عدد الطبقات.',explanation:`الحجم = ${width} × ${height} × ${depth} = ${result} سم³.`,visual:{type:'table',headers:['الطول','العرض','الارتفاع'],rows:[[digits(width),digits(height),digits(depth)]]},proof:{type:'volume',args:{width,height,depth}}});
});

// Data reasoning: interpret the representation, not just a bare calculation.
[
  [[6,9,4],'sum',[0,1],'كم كتابًا قرأت مجموعتا سارة وريم معًا؟'],
  [[8,5,11],'difference',[2,1],'بكم يزيد عدد كتب مجموعة ليان على مجموعة ريم؟'],
  [[7,12,10],'value',[1],'كم كتابًا قرأت مجموعة ريم؟'],
  [[9,6,8],'sum',[0,1,2],'كم كتابًا قرأت المجموعات كلها؟'],
].forEach(([values,op,indices,question],i)=>{
  const result=op==='value'?values[indices[0]]:op==='difference'?values[indices[0]]-values[indices[1]]:indices.reduce((s,k)=>s+values[k],0);
  add('data-read',i,{question,correct:result,distractors:[result+1,result-1,result+3],hint:'حددي الأعمدة المطلوبة، ثم اقرئي قيمها بدقة.',explanation:`${op==='value'?'نقرأ قيمة العمود مباشرة':op==='difference'?'نطرح القيمتين المطلوبتين':'نجمع قيم المجموعات المطلوبة'}؛ الناتج ${result} كتابًا.`,visual:{type:'bars',labels:['سارة','ريم','ليان'],values},proof:{type:'dataRead',args:{values,op,indices}}});
});
[[6,8,10],[5,9,10],[4,6,8,10],[7,7,10,12]].forEach((values,i)=>{
  const result=values.reduce((a,b)=>a+b,0)/values.length;
  add('mean',i,{question:'هذه أعداد بطاقات جمعتها مجموعات. ما المتوسط الحسابي لعدد البطاقات؟',correct:result,distractors:[result+1,result-1,result+2],hint:'اجمعي القيم ثم اقسمي المجموع على عددها.',explanation:`مجموع القيم ${values.reduce((a,b)=>a+b,0)}، وعددها ${values.length}؛ المتوسط ${result}.`,visual:{type:'sequence',values:values.map(digits)},proof:{type:'mean',args:{values}}});
});
[[9,3,7,11,5],[12,6,8,14,10],[4,10,6,2,8],[15,7,13,9,11]].forEach((values,i)=>{
  const sorted=[...values].sort((a,b)=>a-b),result=sorted[2];
  add('median',i,{question:'هذه أعداد صفحات قرأتها خمس طالبات. ما الوسيط لهذه البيانات؟',correct:result,distractors:[result+1,result-1,Math.max(...values)],hint:'رتبي القيم تصاعديًا، ثم اختاري القيمة الوسطى.',explanation:`بعد الترتيب: ${sorted.join('، ')}. القيمة الثالثة ${result} هي الوسيط.`,visual:{type:'sequence',values:values.map(digits)},proof:{type:'median',args:{values}}});
});
[[4,6,4,7,4],[8,5,8,6,8],[3,9,9,7,9],[6,2,6,4,6]].forEach((values,i)=>{
  const result=values.find(x=>values.filter(y=>y===x).length===3);
  add('mode',i,{question:'هذه أعداد ملصقات لدى خمس طالبات. ما المنوال؟',correct:result,distractors:[result+1,result-1,result+2],hint:'ابحثي عن القيمة الأكثر تكرارًا.',explanation:`القيمة ${result} تكررت ثلاث مرات، أكثر من بقية القيم؛ فهي المنوال.`,visual:{type:'sequence',values:values.map(digits)},proof:{type:'mode',args:{values}}});
});
[[12,8,19,11,15],[6,14,9,4,11],[20,16,23,18,21],[5,12,8,15,10]].forEach((values,i)=>{
  const result=Math.max(...values)-Math.min(...values);
  add('range',i,{question:'هذه أزمنة إنهاء نشاط بالدقائق. ما المدى؟',correct:result,distractors:[result+1,result-1,result+2],hint:'اطرحي أصغر قيمة من أكبر قيمة.',explanation:`المدى = ${Math.max(...values)} - ${Math.min(...values)} = ${result} دقائق.`,visual:{type:'sequence',values:values.map(digits)},proof:{type:'range',args:{values}}});
});
[[2,3],[3,3],[2,4],[3,4]].forEach(([a,b],i)=>{
  const result=a*b;
  add('outcomes',i,{question:`تختار دانا بطاقة واحدة من ${a} ألوان، وملصقًا واحدًا من ${b} أشكال. كم اختيارًا مختلفًا ممكنًا؟`,correct:result,distractors:[result+1,result-1,result+2],hint:'لكل لون جميع الأشكال؛ عدي مجموعة الخيارات لكل لون.',explanation:`لكل واحد من ${a} ألوان توجد ${b} أشكال؛ عدد النواتج ${a} × ${b} = ${result}.`,visual:{type:'table',headers:['ألوان البطاقات','أشكال الملصقات'],rows:[[digits(a),digits(b)]]},proof:{type:'outcomes',args:{a,b}}});
});
[[3,8],[2,5],[4,6],[3,10]].forEach(([favorable,total],i)=>{
  const result=reduced(favorable,total);
  add('probability',i,{question:`كيس فيه ${total} قطع متماثلة، منها ${favorable} حمراء. ما احتمال سحب قطعة حمراء؟`,correct:result,distractors:[reduced(favorable-1,total),reduced(favorable+1,total),reduced(favorable,total+1)],hint:'عدي القطع الحمراء، وضعي عددها فوق عدد جميع القطع.',explanation:`الاحتمال = عدد القطع الحمراء ÷ عدد القطع كلها = ${favorable}/${total} = ${result}.`,visual:{type:'fraction',n:favorable,d:total},proof:{type:'probability',args:{favorable,total}}});
});
