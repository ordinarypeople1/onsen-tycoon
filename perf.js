const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
 const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:+process.env.R||4});
 await p.evaluate(()=>{__dbg.S.min=Math.floor(__dbg.S.min/1440)*1440+21*60});
 const m=async()=>p.evaluate(()=>new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r(n/3)};requestAnimationFrame(f)}));
 const a=await m();await p.waitForTimeout(6000);const low=await p.evaluate(()=>window.GFX_LOW);const c=await m();console.log('fps',a.toFixed(1),'autoLow',low,'after',c.toFixed(1));await b.close()})();
