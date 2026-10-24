const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
 const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await p.evaluate(()=>{__dbg.S.min=Math.floor(__dbg.S.min/1440)*1440+21*60});
 await cdp.send('Profiler.enable');await cdp.send('Profiler.start');await p.waitForTimeout(4000);const {profile}=await cdp.send('Profiler.stop');
 const self={};const dt=profile.timeDeltas;const byId={};profile.nodes.forEach(n=>byId[n.id]=n);profile.samples.forEach((id,i)=>{const n=byId[id];const k=n.callFrame.functionName+' '+n.callFrame.url.split('/').pop()+':'+n.callFrame.lineNumber;self[k]=(self[k]||0)+(dt[i]||0)});
 const tot=Object.values(self).reduce((a,b)=>a+b,0);console.log(Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([k,v])=>(v/tot*100).toFixed(1)+'% '+k).join('\n'));await b.close()})();
