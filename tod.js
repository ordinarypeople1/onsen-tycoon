const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:960,height:600}});await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
 await p.evaluate(()=>{document.body.classList.add('zen');for(let i=0;i<300;i++)__dbg.step(0.1);const o=__dbg.S.objs.find(o=>o.k=='rock');__dbg.focusXY(o.x+2,o.y+2,4)});
 const H=[6,8.5,12,15.5,17.5,19,21.5,2];for(const h of H){await p.evaluate(h=>{__dbg.S.min=Math.floor(__dbg.S.min/1440)*1440+h*60},h);await p.waitForTimeout(900);await p.screenshot({path:`/tmp/tod_${h}.png`})}
 await b.close()})();
