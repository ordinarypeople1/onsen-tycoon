const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const p=await b.newPage({viewport:{width:1000,height:700}});
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()=='error'&&errs.push(m.text()));
 await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__ready);
 await p.evaluate(()=>{__dbg.setHour(15);__dbg.guests().length=0;const g=__dbg.gate();__dbg.focus(g.x+1.5,g.y-0.5,5);document.querySelectorAll('#top,#tools').forEach(e=>e.style.display='none');document.getElementById('build').style.display='none';document.getElementById('quest').style.display='none';__dbg.spawn()});
 for(let i=0;i<8;i++){await p.waitForTimeout(380);await p.screenshot({path:`/tmp/f${i}.png`,clip:{x:180,y:80,width:400,height:440}})}
 console.log('ERR',JSON.stringify(errs));await b.close()})();
