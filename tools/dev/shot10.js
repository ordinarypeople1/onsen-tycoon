const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'||m.type()=='warning')errs.push(m.text())});
 await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
 await p.evaluate(()=>{const S=__dbg.S;S.yen=123456;S.objs.push({k:'cedar',x:20,y:19,lv:1,price:0,uses:0,earn:0});__dbg.occ()});
 await p.keyboard.press('Escape');await p.waitForTimeout(300);await p.click('#ovPause [data-a=share]');await p.waitForTimeout(800);await p.screenshot({path:'shot_share.png'});
 const link=await p.$eval('#shL',e=>e.value);const code=await p.$eval('#shC',e=>e.value);
 // 방문 (새 컨텍스트 = 다른 사람)
 const c2=await b.newContext({viewport:{width:1440,height:900}});const v=await c2.newPage();v.on('pageerror',e=>errs.push('V:'+e.message));
 await v.goto(link.replace(/^https?:\/\/[^/]+/,'http://localhost:8765'));await v.waitForFunction(()=>window.__ready);await v.waitForTimeout(1500);
 const vs=await v.evaluate(()=>({ro:READONLY,yen:__dbg.S.yen,cedar:__dbg.S.objs.some(o=>o.k=='cedar'),stored:!!localStorage.onsen2,bar:!!document.getElementById('visitBar')}));await v.screenshot({path:'shot_visit.png'});
 // 가져오기 (새 컨텍스트)
 const c3=await b.newContext({viewport:{width:1000,height:800}});const q=await c3.newPage();await q.goto('http://localhost:8765/index.html?notitle');await q.waitForFunction(()=>window.__ready);q.on('dialog',d=>d.accept());
 await q.keyboard.press('Escape');await q.click('#ovPause [data-a=share]');await q.fill('#shI',code);await q.click('#shGo');await q.waitForTimeout(1500);await q.waitForFunction(()=>window.__ready);const iy=await q.evaluate(()=>__dbg.S.yen);
 console.log(JSON.stringify({len:link.length,vs,iy}),'ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
