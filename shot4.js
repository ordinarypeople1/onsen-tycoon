const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
 const p=await b.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()=='error'&&errs.push(m.text()));
 await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__ready);
 await p.evaluate(()=>{__dbg.setHour(16);const g=__dbg.gate();__dbg.focus(g.x+1.5,g.y-3,3.2)});
 await p.waitForTimeout(12000);await p.screenshot({path:'shot_gate.png'});
 console.log('gate',JSON.stringify(await p.evaluate(()=>__dbg.gate())),'guests',await p.evaluate(()=>__dbg.guests().length));
 // 대문 이동: 더블클릭 → 동쪽 가장자리로
 const g0=await p.evaluate(()=>{const g=__dbg.gate();return __dbg.scr(g.x+1.5,g.y+0.5)});
 await p.mouse.dblclick(g0[0],g0[1]);await p.waitForTimeout(300);
 console.log('moving',await p.evaluate(()=>__dbg.moving&&__dbg.moving.k));
 await p.evaluate(()=>__dbg.focus(30,24,2.4));await p.waitForTimeout(200);
 const d=await p.evaluate(()=>__dbg.scr(31.5,24.5));await p.mouse.move(d[0],d[1]);await p.waitForTimeout(300);await p.screenshot({path:'shot_gate_move.png'});
 await p.mouse.click(d[0],d[1]);await p.waitForTimeout(4000);
 console.log('gate2',JSON.stringify(await p.evaluate(()=>__dbg.gate())));
 await p.screenshot({path:'shot_gate_warn.png'});
 console.log('warn',await p.evaluate(()=>document.getElementById('warn').textContent));
 console.log('ERR',JSON.stringify(errs));await b.close()})();
