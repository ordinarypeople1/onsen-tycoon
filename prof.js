const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
 await p.evaluate(()=>{__dbg.S.min=Math.floor(__dbg.S.min/1440)*1440+21*60});await p.waitForTimeout(1000);
 const r=await p.evaluate(()=>{const T={};const wrap=(name,obj,key)=>{const f=obj[key];obj[key]=function(...a){const t=performance.now();const r=f.apply(this,a);T[name]=(T[name]||0)+performance.now()-t;return r}};
  for(const n of['render','drawForest','drawPlots','drawGrid','drawText','drawWater','drawGuest','drawSprite','drawShadow','ao','hud','step','glow','buildGround'])if(typeof window[n]=='function')wrap(n,window,n);
  for(const e of['ground','over','screen','frame','water'])if(BUS.h[e])BUS.h[e]=BUS.h[e].map((f,i)=>{const nm=e+i;return(...a)=>{const t=performance.now();f(...a);T[nm]=(T[nm]||0)+performance.now()-t}});
  return new Promise(res=>setTimeout(()=>res(Object.fromEntries(Object.entries(T).map(([k,v])=>[k,+(v/120).toFixed(2)]).sort((a,b)=>b[1]-a[1]))),2000))});
 console.log(JSON.stringify(r));await b.close()})();
