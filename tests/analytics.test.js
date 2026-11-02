import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
import {MEASUREMENT_ID,analyticsPage,createAnalytics} from '../src/analytics.js';
import {chapters,enrichment} from '../src/curriculum/catalog.js';
import {domains,skills,questions} from '../src/nafs/bank.js';

const published='https://llelanll.github.io/hasnaa-math/';
const marker='private-learner-value';
const commandList=browser=>Array.from(browser.dataLayer||[],item=>Array.from(item));
const visits=browser=>commandList(browser).filter(c=>c[0]==='event'&&c[1]==='page_view');

function fakeBrowser(url=published){
  const scripts=[],browser={location:new URL(url)};
  Object.defineProperty(browser,'localStorage',{get(){throw new Error('Analytics must not read learning storage');}});
  const doc={createElement:tag=>({tagName:tag}),head:{appendChild:el=>{scripts.push(el);return el;}}};
  for(const key of ['title','referrer','body'])Object.defineProperty(doc,key,{get(){throw new Error('Analytics must use authored route metadata');}});
  return{browser,doc,scripts};
}

test('Analytics labels cover every existing chapter, lesson and classified Nafis route without accepting arbitrary data',()=>{
  assert.equal(MEASUREMENT_ID,'G-7X1EY281MD');
  for(const chapter of chapters){
    assert.ok(analyticsPage(chapter.slug)?.title.includes(chapter.title),chapter.slug);
    for(const lesson of chapter.lessons)assert.ok(analyticsPage(lesson.slug)?.title.includes(lesson.title),lesson.slug);
  }
  assert.ok(analyticsPage(enrichment.slug)?.title.includes(enrichment.title));
  for(const domain of domains)assert.ok(analyticsPage('nafs-domain-'+domain.id)?.title.includes(domain.title),domain.id);
  for(const skill of skills)assert.ok(analyticsPage('nafs-skill-'+skill.id)?.title.includes(skill.title),skill.id);
  for(const route of ['home','lessons','games','quiz','challenges','progress','multiplication-tables','table-mastery','game','result','nafs','nafs-mixed','nafs-simulation','nafs-history']){
    const page=analyticsPage(route);assert.equal(page.route,route);assert.match(page.title,/[\u0600-\u06ff]/u);
  }
  for(const route of [undefined,null,'',marker,'home?answer='+marker,'nafs-skill-'+marker,'nafs-domain-'+marker,'c1-l99','__proto__'])assert.equal(analyticsPage(route),null,String(route));
});

test('official Google tag is configured once; first visit and real route changes are counted once with safe metadata',()=>{
  const{browser,doc,scripts}=fakeBrowser(published+'?student='+marker+'&answer='+marker+'#'+marker);
  const track=createAnalytics({window:browser,document:doc,enabled:true});
  track(marker);assert.equal(scripts.length,0,'unrecognized routes never initialize tracking');
  track('nafs-simulation');track('nafs-simulation');track('nafs-simulation');
  assert.equal(scripts.length,1);
  assert.equal(scripts[0].src,'https://www.googletagmanager.com/gtag/js?id=G-7X1EY281MD');
  assert.equal(scripts[0].async,true);assert.equal(scripts[0].referrerPolicy,'no-referrer');
  let commands=commandList(browser);
  assert.equal(commands.filter(c=>c[0]==='js').length,1);
  const configs=commands.filter(c=>c[0]==='config');assert.equal(configs.length,1);
  assert.equal(configs[0][1],MEASUREMENT_ID);assert.equal(configs[0][2].send_page_view,false);
  assert.equal(configs[0][2].allow_google_signals,false);assert.equal(configs[0][2].allow_ad_personalization_signals,false);
  assert.ok(commands.findIndex(c=>c[0]==='set')<commands.findIndex(c=>c[0]==='config'),'safe page metadata is set before the configuration can emit technical events');
  for(const key of ['page_title','page_location','page_referrer'])assert.equal(Object.hasOwn(configs[0][2],key),false,'config-scoped metadata must not override later route updates');
  assert.equal(visits(browser).length,1,'re-renders and same-route navigation do not add visits');
  assert.equal(visits(browser)[0][2].page_location,published+'#nafs-simulation');
  assert.equal(visits(browser)[0][2].page_referrer,'');
  track('c3-private-'+marker);track('nafs');track('nafs');track('nafs-simulation');
  const sent=visits(browser);assert.equal(sent.length,3,'A to B to A is three real views');
  assert.equal(sent[1][2].page_referrer,published+'#nafs-simulation');
  assert.equal(sent[2][2].page_referrer,published+'#nafs');
  for(const c of sent){
    assert.equal(c[2].send_to,MEASUREMENT_ID);
    assert.deepEqual(Object.keys(c[2]).sort(),['page_location','page_referrer','page_title','send_to']);
  }
  commands=commandList(browser);
  assert.equal(commands.filter(c=>c[0]==='config').length,1);assert.equal(scripts.length,1);
  assert.equal(JSON.stringify(commands).includes(marker),false,'raw query/hash, learner data and referrer never enter the queue');
  assert.deepEqual(commands.filter(c=>c[0]==='event').map(c=>c[1]),['page_view','page_view','page_view'],'no answer, score or reward events');
});

test('Analytics is inactive on previews and unrelated hosts, and analytics failures cannot interrupt the application',()=>{
  for(const [url,enabled]of [[published,false],['http://localhost:4173/hasnaa-math/',true],['https://example.test/hasnaa-math/',true],['https://llelanll.github.io/other-project/',true]]){
    const{browser,doc,scripts}=fakeBrowser(url);const track=createAnalytics({window:browser,document:doc,enabled});
    track('home');track('nafs');assert.equal(scripts.length,0);assert.equal(browser.dataLayer,undefined);
  }
  assert.doesNotThrow(()=>createAnalytics({enabled:true})('home'));
  const{browser,doc}=fakeBrowser();browser.gtag=()=>{throw new Error('Blocked Analytics');};
  const track=createAnalytics({window:browser,document:doc,enabled:true});
  assert.doesNotThrow(()=>track('home'));assert.doesNotThrow(()=>track('nafs'));
});

const launch=()=>chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
const dist=fileURLToPath(new URL('../dist/',import.meta.url));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.webp':'image/webp','.svg':'image/svg+xml'};

async function productionContext(browser,width,{blocked=false}={}){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),tagRequests=[],otherRequests=[];
  // Serve this production build locally under the deployed origin. No collector
  // receives test traffic; this checks our integration and queue, not Google's service.
  await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin==='https://www.googletagmanager.com'&&url.pathname==='/gtag/js'){
      tagRequests.push({url:request.url(),headers:request.headers()});
      if(blocked)return route.abort('blockedbyclient');
      return route.fulfill({contentType:'text/javascript',body:'window.__analyticsTagLoads=(window.__analyticsTagLoads||0)+1;'});
    }
    if(url.origin==='https://llelanll.github.io'&&url.pathname.startsWith('/hasnaa-math/')){
      const relative=decodeURIComponent(url.pathname.slice('/hasnaa-math/'.length))||'index.html';
      const file=resolve(dist,relative);
      if(file.startsWith(resolve(dist)+sep)&&existsSync(file))return route.fulfill({path:file,contentType:mime[extname(file)]||'application/octet-stream'});
    }
    otherRequests.push(request.url());return route.abort();
  });
  return{context,tagRequests,otherRequests};
}
const pageVisits=page=>page.evaluate(()=>Array.from(window.dataLayer||[],item=>Array.from(item)).filter(c=>c[0]==='event'&&c[1]==='page_view'));
const visitLocations=async page=>(await pageVisits(page)).map(c=>c[2].page_location);
const shown=async(page,selector)=>{await page.locator(selector).first().waitFor();};

for(const width of [1280,390])test(`Analytics production integration at ${width}px: deep links, hash/button navigation, retries and back/forward`,async()=>{
  assert.ok(existsSync(resolve(dist,'index.html')),'Build the production site before browser regressions');
  const browser=await launch();
  try{
    const{context,tagRequests,otherRequests}=await productionContext(browser,width),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    await page.goto(published+'?student='+marker+'#nafs-simulation');await shown(page,'[data-nafs-question]');
    assert.deepEqual(await visitLocations(page),[published+'#nafs-simulation'],'a deep link is the initial visit, not an extra home visit');
    const id=await page.locator('[data-nafs-question]').getAttribute('data-nafs-question'),q=questions.find(item=>item.id===id);
    const wrong=[0,1,2,3].find(i=>i!==q.answer);
    await page.locator(`[data-nafs-answer="${wrong}"]`).click();
    await page.locator(`[data-nafs-answer="${q.answer}"]`).click();await page.locator('[data-nafs-next]').click();await shown(page,'[data-nafs-question]');
    assert.equal((await pageVisits(page)).length,1,'answers, hints and the next question are not page views');
    await page.locator('a[href="#nafs"]').first().click();await shown(page,'.nafs-domains');
    await page.locator('nav [data-page="nafs"]').click();await shown(page,'.nafs-domains');
    assert.equal((await pageVisits(page)).length,2,'same route via navigation button is deduplicated');
    await page.locator('a[href="#nafs-mixed"]').click();await shown(page,'[data-nafs-question]');
    await page.goBack();await shown(page,'.nafs-domains');
    await page.goForward();await shown(page,'[data-nafs-question]');
    assert.deepEqual(await visitLocations(page),['nafs-simulation','nafs','nafs-mixed','nafs','nafs-mixed'].map(route=>published+'#'+route));
    await page.locator('nav [data-page="lessons"]').click();await shown(page,'.curriculum-index');
    await page.locator('a[href="#chapter-three"]').click();await shown(page,'.chapter-cards');
    await page.locator('a[href="#multiply-two-digits"]').click();await shown(page,'.visual-lesson');
    const count=(await pageVisits(page)).length;
    await page.evaluate(()=>dispatchEvent(new HashChangeEvent('hashchange')));
    assert.equal((await pageVisits(page)).length,count,'duplicate hash notifications never double count');
    assert.ok((await pageVisits(page)).at(-1)[2].page_title.includes('الضرب في عدد من رقمين'));
    await page.evaluate(value=>{location.hash='nafs-skill-'+value;},marker);await shown(page,'.nafs');
    assert.equal((await pageVisits(page)).length,count,'unrecognized metadata cannot be sent through a permissive UI route');
    const queued=await page.evaluate(()=>JSON.stringify(Array.from(window.dataLayer||[],item=>Array.from(item))));
    assert.equal(queued.includes(marker),false);assert.equal(tagRequests.length,1);assert.equal(await page.evaluate(()=>window.__analyticsTagLoads),1);
    assert.equal(new URL(tagRequests[0].url).searchParams.get('id'),MEASUREMENT_ID);
    assert.equal(tagRequests[0].headers.referer,undefined,'Google script request cannot leak the raw page query in its referrer');
    assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.match(await page.locator('footer').innerText(),/جميع الحقوق محفوظة للأستاذة حسناء الحارثي/);
    assert.deepEqual(errors,[]);assert.deepEqual(otherRequests,[]);await context.close();
  }finally{await browser.close();}
});

test('blocking the Google tag leaves lessons and ordinary navigation fully usable',async()=>{
  const browser=await launch();
  try{
    const{context,tagRequests,otherRequests}=await productionContext(browser,390,{blocked:true}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(published+'#c1-l1');await shown(page,'.curriculum-lesson');
    await page.locator('nav [data-page="games"]').click();await shown(page,'[data-start="game"]');
    await page.locator('[data-start="game"]').click();await shown(page,'.answers');
    await page.locator('.answer').first().click();assert.ok(await page.locator('#feedback').innerText());
    assert.equal(tagRequests.length,1);assert.deepEqual(otherRequests,[]);assert.deepEqual(errors,[]);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await context.close();
  }finally{await browser.close();}
});
