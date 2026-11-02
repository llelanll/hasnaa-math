import {chapters, enrichment} from './curriculum/catalog.js';

export const MEASUREMENT_ID = 'G-7X1EY281MD';
const origin = 'https://llelanll.github.io';
const basePath = '/hasnaa-math/';
const siteTitle = 'رياضيات خامس';
const ar = value => String(value).replace(/[0-9]/g, c => '٠١٢٣٤٥٦٧٨٩'[c]);

// Only public, authored metadata. Never derive analytics from the learner's DOM,
// input, results, storage, raw hash, query string or external referrer.
const titles = new Map(Object.entries({
  home: 'الرئيسية', lessons: 'فصول الرياضيات', games: 'الألعاب التعليمية',
  quiz: 'الاختبارات القصيرة', challenges: 'التحديات والمسابقات',
  progress: 'لوحة التقدم', 'multiplication-notes': 'ملاحظات أنماط الضرب',
  'multiplication-tables': 'تدرّبي على جدول الضرب', 'table-mastery': 'إتقان جداول الضرب',
  game: 'لعبة أنماط الضرب', result: 'ختام لعبة أنماط الضرب',
  nafs: 'تدريب مهارات نافس', 'nafs-mixed': 'نافس: تدريب متنوع',
  'nafs-simulation': 'نافس: محاكاة قصيرة', 'nafs-history': 'نافس: سجل التدريب',
}));
for (const chapter of chapters) {
  const title = `الفصل ${ar(chapter.number)}: ${chapter.title}`;
  titles.set(chapter.slug, title);
  for (const lesson of chapter.lessons) titles.set(lesson.slug, `${title} | ${lesson.title}`);
}
titles.set(enrichment.slug, enrichment.title);

// Keep the Nafis question bank lazy: its public route labels alone belong here.
const nafsDomains = {
  numbers: 'الأعداد والعمليات عليها', algebra: 'الجبر والتحليل',
  geometry: 'الهندسة والقياس', data: 'الإحصاء والاحتمالات',
};
const nafsSkills = {
  'place-value': 'القيمة المنزلية والصيغة التحليلية',
  'whole-compare': 'مقارنة الأعداد الكلية',
  'decimal-place': 'القيمة المنزلية في الكسور العشرية',
  'decimal-round': 'تقريب الكسور العشرية',
  'decimal-compare': 'مقارنة الكسور العشرية',
  'fraction-model': 'تمثيل الكسور الاعتيادية',
  'fraction-equivalent': 'الكسور المكافئة',
  'fraction-compare': 'مقارنة الكسور الاعتيادية',
  'fraction-calc': 'جمع الكسور وطرحها',
  'decimal-calc': 'جمع الكسور العشرية وطرحها',
  'whole-operations': 'حل مسائل العمليات على الأعداد الكلية',
  factors: 'العوامل والقاسم المشترك الأكبر',
  multiples: 'المضاعفات والمضاعف المشترك الأصغر',
  estimate: 'التقدير والحساب الذهني',
  'number-pattern': 'الأنماط العددية', 'shape-pattern': 'الأنماط الهندسية',
  'input-output': 'جداول المدخلات والمخرجات',
  expression: 'إيجاد قيمة العبارة الجبرية',
  'equation-add': 'معادلات الجمع والطرح', 'equation-multiply': 'معادلات الضرب والقسمة',
  lines: 'المفاهيم الهندسية والعلاقات بين المستقيمات', angles: 'تصنيف الزوايا',
  polygons: 'خصائص المضلعات', solids: 'عناصر المنشور والمكعب',
  coordinates: 'تسمية المواقع بالأزواج المرتبة', translation: 'الانسحاب على الشبكة',
  transformations: 'تمييز التحويلات الهندسية', length: 'التحويل بين وحدات الطول',
  'mass-capacity': 'التحويل بين وحدات الكتلة والسعة', time: 'حساب الزمن المنقضي',
  perimeter: 'محيط المستطيل والمربع', area: 'مساحة المستطيل والمربع',
  volume: 'حجم المنشور الرباعي', 'data-read': 'قراءة التمثيلات البيانية والجداول',
  mean: 'إيجاد المتوسط الحسابي وتفسيره', median: 'إيجاد الوسيط وتفسيره',
  mode: 'إيجاد المنوال', range: 'إيجاد المدى وتفسيره',
  outcomes: 'عد نواتج التجربة العشوائية', probability: 'التعبير عن الاحتمال بكسر',
};
for (const [id, title] of Object.entries(nafsDomains)) titles.set(`nafs-domain-${id}`, `نافس: ${title}`);
for (const [id, title] of Object.entries(nafsSkills)) titles.set(`nafs-skill-${id}`, `نافس: ${title}`);

export function analyticsPage(route) {
  const title = titles.get(route);
  return title ? {route, title: `${siteTitle} | ${title}`} : null;
}

export function createAnalytics({window: browser, document: doc, enabled}) {
  let initialized = false, previous = null;
  return function trackPage(route) {
    if (!enabled || !browser || !doc || browser.location.origin !== origin ||
      ![basePath, basePath + 'index.html'].includes(browser.location.pathname)) return;
    const page = analyticsPage(route);
    if (!page || page.route === previous?.route) return;
    const location = origin + basePath + '#' + page.route;
    const fields = {page_title: page.title, page_location: location,
      page_referrer: previous ? origin + basePath + '#' + previous.route : ''};
    try {
      if (!initialized) {
        // Official Google tag queue and async loader; a single config per document.
        browser.dataLayer = browser.dataLayer || [];
        browser.gtag = browser.gtag || function () { browser.dataLayer.push(arguments); };
        browser.gtag('consent', 'default', {
          ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
        });
        browser.gtag('js', new Date());
      }
      // Global scope keeps technical metadata current; config-scoped page fields
      // would otherwise take precedence over later global updates.
      browser.gtag('set', fields);
      if (!initialized) {
        browser.gtag('config', MEASUREMENT_ID, {
          send_page_view: false, allow_google_signals: false,
          allow_ad_personalization_signals: false,
        });
        const script = doc.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
        script.referrerPolicy = 'no-referrer';
        initialized = true;
        doc.head.appendChild(script);
      }
      browser.gtag('event', 'page_view', {send_to: MEASUREMENT_ID, ...fields});
      previous = page;
    } catch {
      // An unavailable/blocked analytics tag must never interrupt a lesson.
    }
  };
}

// Development, localhost previews and regression tests never pollute live reports.
export const trackPage = createAnalytics({window: globalThis.window, document: globalThis.document,
  enabled: import.meta.env?.PROD === true});
