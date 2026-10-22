const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--enable-precise-memory-info','--js-flags=--expose-gc']});const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const cdp=await p.context().newCDPSession(p);
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
await p.evaluate(()=>{const D=__dbg,S=D.S;S.yen=1e8;const g=D.gate();for(const [k,l] of [['room',5],['rock',4],['hinoki',5],['izakaya',5],['sauna',3]]){const xy=D.free(k,g.x+4,g.y+4);S.objs.push({k,x:xy[0],y:xy[1],lv:l,rot:0,price:D.DEF[k].price,uses:0,earn:0})}D.occ();for(let i=0;i<25;i++)D.spawn();
 window.__ft=[];let l=performance.now();const f=()=>{const n=performance.now();__ft.push(n-l);l=n;requestAnimationFrame(f)};f();
 const oc=document.createElement;window.__cv=0;document.createElement=function(t){if(String(t).toLowerCase()=='canvas')__cv++;return oc.call(document,t)}});
const heap=async()=>{await cdp.send('HeapProfiler.collectGarbage');return (await cdp.send('Runtime.getHeapUsage')).usedSize/1e6};
await p.waitForTimeout(1500);const h0=await heap();
const t=await p.evaluate(()=>{const D=__dbg;const os=D.S.objs.filter(o=>D.DEF[o.k].price);const tm=[];for(let i=0;i<200;i++){const o=os[i%os.length];const a=performance.now();rotateObj(o);tm.push(performance.now()-a)}tm.sort((a,b)=>a-b);return{med:tm[100],max:tm[199],cv:__cv}});
await p.waitForTimeout(3000);
const fr=await p.evaluate(()=>{const f=__ft.slice(-150).sort((a,b)=>a-b);return{p50:f[75],max:f[149],cv:__cv}});
const h1=await heap();
// 2nd batch to detect growth
await p.evaluate(()=>{const D=__dbg;const os=D.S.objs.filter(o=>D.DEF[o.k].price);for(let i=0;i<200;i++)rotateObj(os[i%os.length])});await p.waitForTimeout(2000);const h2=await heap();
console.log(JSON.stringify({rot:t,frames:fr,heapMB:[h0,h1,h2].map(x=>+x.toFixed(1)),canvases:await p.evaluate(()=>__cv)}),'ERR',JSON.stringify(errs.slice(0,3)));await b.close()})();
