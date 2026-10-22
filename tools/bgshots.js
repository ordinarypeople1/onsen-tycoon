const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);await p.waitForTimeout(800);
for(const [n,h,z] of [['day',11,0.6],['dusk',18.5,0.6],['night',22,0.6],['close',14,2.5]]){await p.evaluate(([h,z])=>{__dbg.setHour(h);document.body.classList.add('zen');__dbg.focusXY(32,32,z)},[h,z]);await p.waitForTimeout(500);await p.screenshot({path:`shots/r5/bg_${n}.png`})}
console.log('ERR',JSON.stringify(errs));await b.close()})();
