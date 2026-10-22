const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('http://localhost:'+(process.argv[2]||8765)+'/index.html?notitle');await p.waitForFunction(()=>window.__ready);
console.log(await p.evaluate(()=>{const D=__dbg,S=D.S;const g=D.gate();for(let i=0;i<25;i++)D.spawn();const gs=D.guests();for(let i=0;i<100;i++)D.step(0.1);
 // force all walking guests to re-decide (what rotateObj/endMove did)
 const a=performance.now();gs.forEach(q=>{q.st='walk';q.target=null;q.path=[];q.tx=q.x;q.ty=q.y});D.step(0.1);const one=performance.now()-a;
 const b2=performance.now();for(let i=0;i<20;i++)findPath(g.x,g.y,1,1);return JSON.stringify({allRepathMs:one.toFixed(1),failFindPath20Ms:(performance.now()-b2).toFixed(1)})}));await b.close()})();
