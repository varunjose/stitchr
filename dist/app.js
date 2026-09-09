(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const examples = {
    kitchen: {idea:'“I want to sell fresh meals online and manage my kitchen in one place.”', needs:['Ordering','Payments','Customer data','Notifications'],brand:'Bloom Kitchen',customer:'bloom kitchen.',name:'The everyday bowl',description:'Roasted greens, grains & a little goodness.',badge:'Fresh. Local. Made for you.',category:'TODAY’S SPECIAL',detail:'Ready in 20 min',amount:28,count:48,revenue:1284,customers:36,action:'Place sample order',unit:'Orders',activity:'Recent orders',caption:'Browse. Order. Pay. Track.',item:'Everyday bowl',rows:[['#1048 · Maya','Everyday bowl','Preparing'],['#1047 · James','Garden bowl','Ready'],['#1046 · Alex','Lunch bundle','Delivered']]},
    store: {idea:'“I want an online store with checkout, customer records, and order tracking.”',needs:['Product catalog','Checkout','Customers','Order tracking'],brand:'Form & Field',customer:'form & field.',name:'The everyday tote',description:'Considered essentials. Made to go with you.',badge:'Less, but better.',category:'THE DAILY COLLECTION',detail:'Ships in 2 days',amount:64,count:32,revenue:2460,customers:27,action:'Buy sample item',unit:'Orders',activity:'Recent orders',caption:'Discover. Buy. Pay. Track.',item:'Everyday tote',rows:[['#2032 · Maya','Everyday tote','Packing'],['#2031 · James','Canvas bag','Shipped'],['#2030 · Alex','Everyday tote','Delivered']]},
    service: {idea:'“I want clients to book my studio, pay online, and receive automatic reminders.”',needs:['Booking','Payments','Client records','Reminders'],brand:'Studio North',customer:'studio north.',name:'Your next great idea',description:'A focused creative session, just for you.',badge:'Make space to create.',category:'BOOK A STUDIO SESSION',detail:'60-minute session',amount:150,count:12,revenue:1800,customers:10,action:'Book sample session',unit:'Bookings',activity:'Recent bookings',caption:'Explore. Book. Pay. Get reminders.',item:'Creative session',rows:[['#3012 · Maya','Creative session','Confirmed'],['#3011 · James','Brand session','Confirmed'],['#3010 · Alex','Consultation','Completed']]}
  };
  let current='kitchen', token=0, running=false;
  const counts={};
  const format=(n)=>'$'+n.toLocaleString('en-US');
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=preference.matches;
  function rows(items){$('#order-list').replaceChildren(...items.map((data)=>{const row=document.createElement('div');row.className='order-row'; data.forEach((value,i)=>{const el=document.createElement(i===2?'b':'span');el.textContent=value;row.append(el);});return row;}));}
  function choose(key){token++;running=false;current=key;const c=examples[key];const n=counts[key] ||= {count:c.count,revenue:c.revenue,customers:c.customers};
    $$('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===key)));
    const values={'#idea':c.idea,'#customer-brand':c.customer,'#dashboard-brand':c.brand,'#product-name':c.name,'#product-description':c.description,'#product-badge':c.badge,'#product-category':c.category,'#product-detail':c.detail,'#price':format(c.amount)+'.00','#count-label':c.unit,'#count':n.count,'#revenue':format(n.revenue),'#customers':n.customers,'#activity-title':c.activity};Object.entries(values).forEach(([s,v])=>$(s).textContent=v);
    $('#needs').replaceChildren(...c.needs.map(v=>{const s=document.createElement('span');s.textContent=v;return s;}));
    $('#product-visual').className='product-visual '+key;$('.customer .output-caption').textContent=c.caption;
    const button=$('#sample-order');button.disabled=false;button.replaceChildren(document.createTextNode(c.action+' '),Object.assign(document.createElement('span'),{textContent:'↗'}));
    $('#order-status').textContent='Try it. Watch the dashboard update.';$$('.workflow span').forEach(s=>s.classList.remove('active'));rows(c.rows);drawPath();updateThread();
  }
  $$('[data-case]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.case)));
  $('#sample-order').addEventListener('click',async()=>{if(running)return;running=true;const run=++token,c=examples[current];$('#sample-order').disabled=true;
    const messages=['Customer action received…','Sample payment confirmed.','Customer and order data synced.','Team notified. Dashboard updated.'];
    for(let i=0;i<4;i++){if(run!==token)return;$('#flow-'+i).classList.add('active');$('#order-status').textContent=messages[i];if(!paused)await new Promise(r=>setTimeout(r,650));}
    if(run!==token)return;const n=counts[current];n.count++;n.revenue+=c.amount;n.customers++;$('#count').textContent=n.count;$('#revenue').textContent=format(n.revenue);$('#customers').textContent=n.customers;rows([['Just now · You',c.item,'Confirmed'],...c.rows.slice(0,2)]);$('#order-list').firstElementChild.classList.add('new');$('#order-status').textContent='Done — your sample '+(current==='service'?'booking':'order')+' is in the dashboard.';$('#sample-order').disabled=false;running=false;
  });
  const grid=$('#stack-grid'),thread=$('#thread'),guide=$('#thread-guide'),needle=$('#needle');
  let length=0,progress=0,targetProgress=0,raf=0,lastStitchTime=0,toolStops=[],productVisible=false,celebrated=false,stitchStarted=false;
  function celebrate(){if(progress<.999||!productVisible||celebrated)return;celebrated=true;$('.outputs').classList.add('product-complete');}
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{productVisible=entries[0].isIntersecting;celebrate();},{threshold:.25}).observe($('.outputs'));
  function drawPath(){
    const box=grid.getBoundingClientRect(),columns=window.innerWidth<=720?2:3;
    const cards=$$('.tool').map((el,index)=>{const r=el.getBoundingClientRect();return{index,x:r.left-box.left,y:r.top-box.top,w:r.width,h:r.height};});
    const order=[];for(let row=0;row<cards.length/columns;row++){const group=cards.slice(row*columns,(row+1)*columns);if(row%2)group.reverse();order.push(...group);}
    let d='';toolStops=[];
    order.forEach((c,i)=>{
      const x=c.x+c.w*.5,y=c.y+3;
      if(!i)d=`M ${x-30} ${y-22} C ${x-15} ${y-22} ${x-12} ${y-5} ${x-8} ${y}`;
      else {const prev=order[i-1],px=prev.x+prev.w*.5,py=prev.y+3;
        if(Math.abs(py-y)<5)d+=` C ${px+35} ${py-25} ${x-35} ${y-25} ${x-8} ${y}`;
        else {const edge=i/columns%2===1?box.width+8:-8;d+=` C ${edge} ${py-20} ${edge} ${y-24} ${x-8} ${y}`;}
      }
      // A small loop dips through each card edge before moving to the next tool.
      d+=` C ${x+7} ${y+14} ${x+15} ${y-10} ${x} ${y-11} C ${x-12} ${y-12} ${x-9} ${y+8} ${x+9} ${y+2}`;
      thread.setAttribute('d',d);toolStops.push({index:c.index,distance:thread.getTotalLength()});
    });
    guide.setAttribute('d',d);length=thread.getTotalLength();thread.style.strokeDasharray=String(length);paint(progress);
  }
  function paint(p){
    progress=p;thread.style.strokeDashoffset=String(length*(1-p));
    const distance=length*p,at=thread.getPointAtLength(distance),next=thread.getPointAtLength(Math.min(length,distance+1)),prev=thread.getPointAtLength(Math.max(0,distance-1));
    const angle=Math.atan2(next.y-prev.y,next.x-prev.x)*180/Math.PI;
    needle.setAttribute('transform',`translate(${at.x} ${at.y}) rotate(${angle})`);needle.style.opacity=p>0&&p<1?'1':'0';
    toolStops.forEach(stop=>$$('.tool')[stop.index].classList.toggle('stitched',distance>=stop.distance-2));
    if(p<.15){celebrated=false;$('.outputs').classList.remove('product-complete');}celebrate();
  }
  function updateThread(){
    const rect=grid.getBoundingClientRect();
    if(!stitchStarted&&rect.top<innerHeight*.8&&rect.bottom>0)stitchStarted=true;
    targetProgress=paused||stitchStarted?1:0;
    if(paused){if(raf)cancelAnimationFrame(raf);raf=0;paint(1);return;}requestUpdate();
  }
  $('#replay-stitch').addEventListener('click',()=>{if(raf)cancelAnimationFrame(raf);raf=0;lastStitchTime=0;celebrated=false;$('.outputs').classList.remove('product-complete');stitchStarted=true;paint(0);updateThread();});
  function animateStitch(now){
    raf=0;const dt=Math.min(lastStitchTime?(now-lastStitchTime)/1000:1/60,.04);lastStitchTime=now;
    const diff=targetProgress-progress;
    const step=Math.sign(diff)*Math.min(Math.abs(diff)*(1-Math.exp(-dt*7)),dt*.17);
    paint(Math.abs(diff)<.0004?targetProgress:progress+step);
    if(Math.abs(targetProgress-progress)>.0001)raf=requestAnimationFrame(animateStitch);else lastStitchTime=0;
  }
  function requestUpdate(){if(!raf)raf=requestAnimationFrame(animateStitch);}
  window.addEventListener('scroll',updateThread,{passive:true});window.addEventListener('resize',()=>{drawPath();updateThread();});
  function setMotion(value){paused=value;document.documentElement.classList.toggle('motion-paused',value);$('#motion-toggle').setAttribute('aria-pressed',String(value));$('#motion-toggle').textContent=value?'Resume motion':'Pause motion';updateThread();}
  $('#motion-toggle').addEventListener('click',()=>setMotion(!paused));preference.addEventListener('change',e=>setMotion(e.matches));
  // Original canvas effect inspired by Antigravity's orbiting particle field.
  const canvas=$('#particle-field'),ctx=canvas.getContext('2d');
  let fieldFrame=0,visible=true,w=0,h=0,last=0,time=0;
  const pointer={x:0,y:0},target={x:0,y:0};
  const particles=Array.from({length:window.innerWidth<721?360:850},(_,i)=>({angle:i*2.399963,radius:.72+Math.random()*.5,depth:Math.random(),speed:.15+Math.random()*.3,size:.5+Math.random()*.8}));
  function sizeField(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);renderField();}
  function renderField(){ctx.clearRect(0,0,w,h);pointer.x+=(target.x-pointer.x)*.035;pointer.y+=(target.y-pointer.y)*.035;
    for(const p of particles){const a=p.angle+time*p.speed*.11;const wave=Math.sin(a*3+time*.25)*.035;const rx=w*.43*(p.radius+wave),ry=h*.43*(p.radius+wave);const x=w/2+Math.cos(a)*rx+pointer.x*p.depth*12;const y=h*.49+Math.sin(a)*ry+Math.sin(a*2+time*.2)*h*.055+pointer.y*p.depth*9;const fade=Math.min(1,Math.abs(x-w/2)/(w*.27)+Math.abs(y-h*.47)/(h*.4));ctx.globalAlpha=(.16+p.depth*.38)*fade;ctx.fillStyle=p.depth>.68?'#ffa75c':'#f2eee4';ctx.beginPath();ctx.arc(x,y,p.size,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
  function tickField(stamp){fieldFrame=0;if(paused||!visible||document.hidden)return;if(stamp-last>32){time+=Math.min((stamp-last)/1000,.05);last=stamp;renderField();}fieldFrame=requestAnimationFrame(tickField);}
  function syncField(){if(fieldFrame)cancelAnimationFrame(fieldFrame);fieldFrame=0;if(!paused&&visible&&!document.hidden){last=performance.now();fieldFrame=requestAnimationFrame(tickField);}else renderField();}
  $('.hero').addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();target.x=(e.clientX-r.left)/r.width*2-1;target.y=(e.clientY-r.top)/r.height*2-1;},{passive:true});
  $('.hero').addEventListener('pointerleave',()=>{target.x=0;target.y=0;});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncField();}).observe(canvas);
  document.addEventListener('visibilitychange',syncField);window.addEventListener('resize',sizeField);
  $('#motion-toggle').addEventListener('click',syncField);preference.addEventListener('change',syncField);
  sizeField();syncField();
  choose('kitchen');setMotion(paused);if('ResizeObserver'in window)new ResizeObserver(()=>{drawPath();updateThread();}).observe(grid);
})();
