// Load the classified bank and training engine only when the learner enters Nafis.
export const isNafsRoute = page => /^nafs(?:-(?:mixed|simulation|history|domain-[a-z-]+|skill-[a-z0-9-]+))?$/.test(page);
let engine, pending;
export function nafsView(page, refresh) {
  if (engine) return engine.view(page);
  if (!pending) pending = import('./view.js').then(module => { engine = module; })
    .catch(() => { pending = null; document.querySelector('[data-nafs-loading]')?.replaceChildren(Object.assign(document.createElement('p'), {textContent:'تعذر تحميل التدريب. حدّثي الصفحة للمحاولة مجددًا.'})); });
  pending.then(() => { if (engine) refresh(); });
  return '<section class="page-title" data-nafs-loading aria-live="polite"><h1>تدريب مهارات نافس</h1><p>نجهّز تدريبكِ…</p></section>';
}
export function nafsClick(event, page, refresh, go) { return engine?.click(event, page, refresh, go) || false; }
export function nafsEntry() {
  return '<section class="featured nafs-entry"><div><h2>🏆 تدريب مهارات نافس</h2><p>تدرّبي على المهارات واكتشفي مستوى إتقانك</p></div><a href="#nafs" class="primary">ابدئي التدريب ←</a></section>';
}
