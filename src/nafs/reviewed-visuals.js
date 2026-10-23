// Geometry is drawn from the same quantities used in each question.
// No external images, scripts or animation are needed.
export function additionalVisual(v, {ar, esc}) {
  const svg = (body, label, viewBox='0 0 300 180', cls='') => `<svg class="nafs-review-svg ${cls}" viewBox="${viewBox}" role="img" aria-label="${esc(label)}">${body}</svg>`;
  const text = (x,y,value,cls='') => `<text x="${x}" y="${y}" class="${cls}">${esc(value)}</text>`;
  const point = ([x,y]) => [30+x*30,210-y*30];
  const polygon = (points,cls) => `<polygon class="${cls}" points="${points.map(p=>point(p).join(',')).join(' ')}"/>`;
  const grid = () => `<path class="review-grid" d="${Array.from({length:7},(_,i)=>`M${30+i*30} 30V210 M30 ${30+i*30}H210`).join(' ')}"/><path class="review-axes" d="M30 20V210H220"/>${Array.from({length:7},(_,i)=>text(30+i*30,229,ar(i))+(i?text(16,214-i*30,ar(i)):'')).join('')}${text(231,212,'س')}${text(30,14,'ص')}`;
  if (v.type === 'fractions') {
    return `<div class="nafs-multiple-fractions">${v.strips.map(s=>`<div><strong>${esc(s.label||'')}</strong><div class="nafs-fraction ${s.unknown?'nafs-pending-fraction':''}" role="img" aria-label="${s.unknown?'مقياس من '+ar(s.d)+' أجزاء لم يسجل المقدار عليه بعد':ar(s.n)+' من '+ar(s.d)+' أجزاء متساوية'}"><div>${Array.from({length:s.d},(_,i)=>`<i class="${!s.unknown&&i<s.n?'filled':''}"></i>`).join('')}</div>${s.unknown?'<b aria-hidden="true">؟</b>':''}</div></div>`).join('')}</div>`;
  }
  if (v.type === 'lines') {
    const arrow='<defs><marker id="nafs-line-tip" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6" class="review-arrow"/></marker></defs>';
    const line=(x1,y1,x2,y2,ends=true)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${ends?' marker-start="url(#nafs-line-tip)" marker-end="url(#nafs-line-tip)"':''}/>`;
    const body=v.kind==='parallel'?line(45,50,255,50)+line(45,125,255,125):v.kind==='perpendicular'?line(45,90,255,90)+line(150,25,150,155)+'<path class="review-right-angle" d="M150 73H167V90"/>':v.kind==='segment'?line(55,90,245,90,false)+'<circle cx="55" cy="90" r="4"/><circle cx="245" cy="90" r="4"/>'+text(55,115,'أ')+text(245,115,'ب'):line(45,125,255,45)+line(45,90,255,90);
    return svg(arrow+body,v.label||'رسم للعلاقة بين خطين');
  }
  if (v.type === 'angle') {
    const degrees=v.degrees,theta=degrees*Math.PI/180,ox=150,oy=150,r=36;
    const end=[ox+130*Math.cos(theta),oy-130*Math.sin(theta)];
    const arcEnd=[ox+r*Math.cos(theta),oy-r*Math.sin(theta)];
    return svg(`<path d="M${end.join(' ')} L${ox} ${oy} L280 ${oy}"/><path class="review-angle-arc" d="M${ox+r} ${oy} A${r} ${r} 0 0 0 ${arcEnd.join(' ')}"/>${v.showMeasure?text(ox+60*Math.cos(theta/2),oy-60*Math.sin(theta/2),ar(degrees)+'°'):''}`,'زاوية مرسومة بقياس '+ar(degrees)+' درجة','0 0 300 190');
  }
  if (v.type === 'solid') {
    if (v.kind === 'triangular') {
      return svg('<polygon class="review-front" points="55,145 180,145 115,45"/><polygon class="review-side" points="180,145 235,120 170,20 115,45"/><path d="M55 145L180 145L115 45Z M180 145L235 120L170 20L115 45 M115 45L170 20"/><path class="review-hidden" d="M55 145L110 120L235 120 M110 120L170 20"/>'+[[55,145],[180,145],[115,45],[110,120],[235,120],[170,20]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.5"/>`).join(''),'منشور ثلاثي مع أحرف مخفية متقطعة');
    }
    const x=v.kind==='cube'?80:45,y=60,w=v.kind==='cube'?100:150,h=v.kind==='cube'?100:80,dx=45,dy=-30;
    const points=[[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x+dx,y+dy],[x+w+dx,y+dy],[x+w+dx,y+h+dy],[x+dx,y+h+dy]];
    const poly=ids=>ids.map(i=>points[i].join(',')).join(' '),edge=(a,b)=>`M${points[a].join(' ')}L${points[b].join(' ')}`;
    return svg(`<polygon class="review-front" points="${poly([0,1,2,3])}"/><polygon class="review-top" points="${poly([0,4,5,1])}"/><polygon class="review-side" points="${poly([1,5,6,2])}"/><path d="${[[0,1],[1,2],[2,3],[3,0],[0,4],[4,5],[5,1],[5,6],[6,2]].map(([a,b])=>edge(a,b)).join(' ')}"/><path class="review-hidden" d="${[[4,7],[7,6],[7,3]].map(([a,b])=>edge(a,b)).join(' ')}"/>${v.highlight==='edge'?`<path class="review-highlight" d="${edge(0,1)}"/>`:''}${points.map(([px,py])=>`<circle cx="${px}" cy="${py}" r="2.5"/>`).join('')}`,v.kind==='cube'?'مكعب مع أحرف مخفية متقطعة':'منشور رباعي مع أحرف مخفية متقطعة','0 0 300 195');
  }
  if (v.type === 'coordinate' && v.points) {
    return svg(grid()+v.points.map(p=>{const [x,y]=point([p.x,p.y]);return `<circle cx="${x}" cy="${y}" r="4.5"/>`+text(x+10,y-9,p.label||'أ');}).join(''),'شبكة إحداثية مع نقاط مسماة','0 0 245 245','nafs-review-coordinate');
  }
  if (v.type === 'transformation') {
    const from=v.from||[[1,1],[2,1],[1,3]],center=v.center||[3,3],axis=v.axis??3;
    const to=v.to||from.map(([x,y])=>v.kind==='reflection'?[2*axis-x,y]:v.kind==='rotation'?[center[0]+y-center[1],center[1]-x+center[0]]:[x+3,y]);
    let extra='';
    if(v.kind==='reflection'){const x=point([axis,0])[0];extra=`<path class="review-mirror" d="M${x} 25V210"/>`;}
    if(v.kind==='rotation'){const [x,y]=point(center);extra=`<circle class="review-center" cx="${x}" cy="${y}" r="4"/>`+text(x+12,y-9,'م');}
    return svg(grid()+extra+polygon(from,'review-original')+polygon(to,'review-image'),'الشكل الأصلي وصورته على شبكة إحداثية','0 0 245 245','nafs-review-coordinate')+'<div class="nafs-visual-key"><span>الشكل الأصلي</span><span>الصورة</span></div>';
  }
  if (v.type === 'layers') {
    return `<div class="nafs-layer-model">${Array.from({length:v.layers},(_,i)=>`<div><small>الطبقة ${ar(i+1)}</small><div class="nafs-grid" style="--cols:${v.cols}">${'<i></i>'.repeat(v.rows*v.cols)}</div></div>`).join('')}</div><small>كل مربع يمثل مكعب وحدة من الطبقة</small>`;
  }
  if (v.type === 'bag') {
    const total=v.counts.reduce((sum,c)=>sum+c.count,0);
    return `<div class="nafs-bag" role="img" aria-label="${esc(v.counts.map(c=>`${c.label}: ${ar(c.count)}`).join('، '))}"><div>${v.counts.map(c=>`<span style="--piece:${c.color}">${'<i></i>'.repeat(c.count)}</span>`).join('')}</div></div><div class="nafs-bag-key">${v.counts.map(c=>`<span><i style="background:${c.color}"></i>${esc(c.label)}: ${ar(c.count)}</span>`).join('')}</div><small>الكل: ${ar(total)} قطع متساوية الفرصة</small>`;
  }
  return null;
}
