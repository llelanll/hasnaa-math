import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chromium} from '@playwright/test';
import {domains,skills,questions} from '../src/nafs/bank.js';

const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173/hasnaa-math/';
const launch=()=>chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
const domainTitles=new Map(domains.map(d=>[d.id,d.title]));
const skillTitles=new Map(skills.map(s=>[s.id,s.title]));
const protectedState={balance:'137',learning:JSON.stringify({version:2,lessons:{'multiplication-patterns':{completed:true,best:5}},rewards:{'legacy:patterns-game:0':true}})};

async function show(page,q){
  await page.evaluate(q=>{
    localStorage.setItem('hasnaa-nafs-v1',JSON.stringify({history:[],active:{id:'review-display-'+q.id,mode:'skill',skillId:q.skill,questionIds:[q.id],index:0,records:[],finished:false,started:1700000000000}}));
    history.replaceState(null,'','#nafs-skill-'+q.skill);
  },q);
  await page.reload();
  await page.locator(`[data-nafs-question="${q.id}"]`).waitFor();
}

// Read actual SVG/DOM geometry, not just the author's answer metadata.
async function diagram(page,q){
  if(!q.visual)return;
  const v=q.visual,root=page.locator('.nafs-visual');
  assert.equal(await root.count(),1,q.id);
  if(v.type==='fractions'){
    const strips=await root.locator('.nafs-fraction').evaluateAll(els=>els.map(el=>({count:el.querySelectorAll('i').length,filled:el.querySelectorAll('.filled').length,width:el.getBoundingClientRect().width,unknown:!!el.querySelector('b')})));
    assert.equal(strips.length,v.strips.length,q.id);
    strips.forEach((s,i)=>{assert.equal(s.count,v.strips[i].d,q.id);assert.equal(s.filled,v.strips[i].unknown?0:v.strips[i].n,q.id);assert.equal(s.unknown,!!v.strips[i].unknown,q.id);assert.ok(Math.abs(s.width-strips[0].width)<1,q.id+': equal wholes');});
  }
  if(v.type==='lines'){
    const lines=await root.locator('line').evaluateAll(els=>els.map(el=>Object.fromEntries(['x1','y1','x2','y2'].map(a=>[a,Number(el.getAttribute(a))]))));
    if(v.kind==='segment'){assert.equal(lines.length,1);assert.equal(await root.locator('circle').count(),2);assert.equal(await root.locator('line').getAttribute('marker-start'),null);}
    else{
      assert.equal(lines.length,2);const [a,b]=lines,ax=a.x2-a.x1,ay=a.y2-a.y1,bx=b.x2-b.x1,by=b.y2-b.y1;
      const cross=ax*by-ay*bx,dot=ax*bx+ay*by;
      if(v.kind==='parallel')assert.equal(cross,0,q.id);
      if(v.kind==='perpendicular'){assert.equal(dot,0,q.id);assert.equal(await root.locator('.review-right-angle').count(),1);}
      if(v.kind==='intersecting')assert.notEqual(cross,0,q.id);
      assert.equal(await root.locator('line[marker-start][marker-end]').count(),2);
    }
  }
  if(v.type==='angle'){
    const rays=await root.locator('svg>path').first().getAttribute('d');
    const [ex,ey,ox,oy,fx,fy]=rays.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g).map(Number);
    const a=[ex-ox,ey-oy],b=[fx-ox,fy-oy];
    const measured=Math.acos(Math.max(-1,Math.min(1,(a[0]*b[0]+a[1]*b[1])/(Math.hypot(...a)*Math.hypot(...b)))))*180/Math.PI;
    assert.ok(Math.abs(measured-v.degrees)<0.001,q.id+': angle rays match actual degree measure');
    const vb=await root.locator('svg').evaluate(el=>({x:el.viewBox.baseVal.x,y:el.viewBox.baseVal.y,w:el.viewBox.baseVal.width,h:el.viewBox.baseVal.height}));
    for(const [x,y]of [[ex,ey],[ox,oy],[fx,fy]])assert.ok(x>=vb.x&&x<=vb.x+vb.w&&y>=vb.y&&y<=vb.y+vb.h,q.id+': rays inside viewport');
  }
  if(v.type==='solid'){
    assert.equal(await root.locator('circle').count(),v.kind==='triangular'?6:8,q.id+': visible and hidden vertices');
    assert.equal(await root.locator('.review-hidden').count(),1);
    if(v.highlight==='edge'){
      const highlighted=root.locator('.review-highlight');assert.equal(await highlighted.count(),1);
      assert.ok(Number(await highlighted.evaluate(el=>parseFloat(getComputedStyle(el).strokeWidth)))>=4,q.id+': requested edge visibly highlighted');
    }
  }
  if(v.type==='coordinate'){
    const expected=v.points||[{x:v.x,y:v.y}];
    const circles=await root.locator('circle').evaluateAll(els=>els.map(el=>({x:Number(el.getAttribute('cx')),y:Number(el.getAttribute('cy'))})));
    assert.equal(circles.length,expected.length,q.id);
    circles.forEach((p,i)=>{assert.equal((p.x-30)/30,expected[i].x,q.id);assert.equal((210-p.y)/30,expected[i].y,q.id);});
  }
  if(v.type==='transformation'){
    const polygons=await root.locator('polygon').evaluateAll(els=>els.map(el=>[...el.points].map(p=>[(p.x-30)/30,(210-p.y)/30])));
    assert.equal(polygons.length,2,q.id);const [from,to]=polygons;
    assert.equal(from.length,to.length,q.id);
    // Check the actual plotted relationship independently of SVG string templates.
    if(v.kind==='reflection')from.forEach(([x,y],i)=>{assert.equal(to[i][0]+x,2*(v.axis??3),q.id);assert.equal(to[i][1],y,q.id);});
    else if(v.kind==='rotation'){
      const [cx,cy]=v.center||[3,3];
      from.forEach(([x,y],i)=>{const [u,w]=to[i];assert.equal((x-cx)*(u-cx)+(y-cy)*(w-cy),0,q.id+': right-angle rotation');assert.equal((x-cx)**2+(y-cy)**2,(u-cx)**2+(w-cy)**2,q.id+': fixed radius');});
    }else{
      const dx=to[0][0]-from[0][0],dy=to[0][1]-from[0][1];
      from.forEach(([x,y],i)=>{assert.equal(to[i][0]-x,dx,q.id);assert.equal(to[i][1]-y,dy,q.id);});
      assert.ok(dx!==0||dy!==0,q.id);
    }
    for(const p of [...from,...to])assert.ok(p.every(n=>n>=0&&n<=6),q.id+': transformation stays on plotted grid');
  }
  if(v.type==='layers'){
    assert.equal(await root.locator('.nafs-layer-model>.nafs-grid').count(),0);
    const grids=await root.locator('.nafs-layer-model .nafs-grid').evaluateAll(els=>els.map(el=>({cells:el.querySelectorAll('i').length,cols:Number(el.style.getPropertyValue('--cols'))})));
    assert.equal(grids.length,v.layers,q.id);grids.forEach(g=>{assert.equal(g.cells,v.rows*v.cols);assert.equal(g.cols,v.cols);});
    assert.match(await root.innerText(),/مكعب وحدة/);
  }
  if(v.type==='bag'){
    const groups=await root.locator('.nafs-bag>div>span').evaluateAll(els=>els.map(el=>({count:el.querySelectorAll('i').length,sizes:[...el.querySelectorAll('i')].map(dot=>({w:dot.getBoundingClientRect().width,h:dot.getBoundingClientRect().height}))})));
    assert.deepEqual(groups.map(g=>g.count),v.counts.map(c=>c.count),q.id);
    const dots=groups.flatMap(g=>g.sizes);dots.forEach(d=>{assert.equal(d.w,dots[0].w);assert.equal(d.h,dots[0].h);});
  }
}

async function layout(page,q){
  const state=await page.locator('.nafs-question').evaluate(el=>{
    const math=[...el.querySelectorAll('.math-content')];
    const backwards=math.flatMap(m=>{
      if(getComputedStyle(m).direction!=='ltr')return[m.textContent];
      const walker=document.createTreeWalker(m,NodeFilter.SHOW_TEXT),positions=[];let node;
      while(node=walker.nextNode())for(let i=0;i<node.length;i++){
        if(/\s/u.test(node.textContent[i]))continue;
        const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const r=range.getBoundingClientRect();
        if(r.width>0)positions.push({x:r.left,y:r.top});
      }
      return positions.every((r,i)=>!i||r.y>positions[i-1].y+2||(Math.abs(r.y-positions[i-1].y)<3&&r.x>=positions[i-1].x-1))?[]:[m.textContent];
    });
    return{classification:el.querySelector('.nafs-classification').innerText,answers:el.querySelectorAll('[data-nafs-answer]').length,text:el.innerText,rtl:document.documentElement.dir,overflow:document.documentElement.scrollWidth>innerWidth,backwards,correct:el.querySelectorAll('.correct').length,balance:localStorage.getItem('hasnaa-points'),learning:localStorage.getItem('hasnaa-learning-v2')};
  });
  assert.ok(state.classification.includes(domainTitles.get(q.domain)),q.id);
  assert.ok(state.classification.includes(skillTitles.get(q.skill)),q.id);
  assert.equal(state.answers,4,q.id);assert.equal(state.rtl,'rtl');assert.equal(state.overflow,false,q.id);
  assert.equal(/[0-9]/u.test(state.text),false,q.id+': visible Arabic digits');assert.deepEqual(state.backwards,[],q.id+': ordered mathematical glyphs');
  assert.equal(state.balance,protectedState.balance);assert.equal(state.learning,protectedState.learning);return state;
}

for(const width of [390,1280])test(`all 160 reviewed Nafis questions at ${width}px: visible classification, feedback, figures, mathematics and protected progress`,async()=>{
  const browser=await launch();
  try{
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto(base+'#nafs');await page.locator('.nafs-domains').waitFor();
    await page.evaluate(state=>{localStorage.setItem('hasnaa-points',state.balance);localStorage.setItem('hasnaa-learning-v2',state.learning);},protectedState);
    for(const q of questions){
      await show(page,q);const state=await layout(page,q);assert.equal(state.correct,0,q.id+': no answer disclosed before attempt');
      await diagram(page,q);
      const wrong=[0,1,2,3].find(i=>i!==q.answer);
      await page.locator(`[data-nafs-answer="${wrong}"]`).click();
      assert.equal(await page.locator('.nafs-feedback p').innerText(),q.hint,q.id);
      assert.equal(await page.locator('.nafs-choices .correct').count(),0,q.id+': first mistake gives only a hint');
      await page.locator(`[data-nafs-answer="${q.answer}"]`).click();
      assert.equal(await page.locator('.nafs-feedback p').innerText(),q.explanation,q.id);
      assert.equal(await page.locator('.nafs-choices .correct').count(),1,q.id);
      await layout(page,q);
    }
    assert.deepEqual(errors,[]);assert.equal(await page.locator('audio,video').count(),0);
  }finally{await browser.close();}
});

test('long reviewed choices and enriched figures remain usable at 320px',async()=>{
  const browser=await launch();
  try{
    const page=await browser.newPage({viewport:{width:320,height:960},reducedMotion:'reduce'});
    await page.goto(base+'#nafs');await page.locator('.nafs-domains').waitFor();
    await page.evaluate(state=>{localStorage.setItem('hasnaa-points',state.balance);localStorage.setItem('hasnaa-learning-v2',state.learning);},protectedState);
    const ids=new Set(questions.filter(q=>q.choices.some(c=>c.length>38)).map(q=>q.id));
    for(const type of ['fractions','lines','angle','solid','transformation','layers','bag']){const q=questions.find(q=>q.visual?.type===type);if(q)ids.add(q.id);}
    for(const id of ids){const q=questions.find(q=>q.id===id);await show(page,q);await layout(page,q);await diagram(page,q);}
  }finally{await browser.close();}
});
