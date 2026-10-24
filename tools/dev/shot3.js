const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
 const p=await b.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()=='error'&&errs.push(m.text()));
 await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
 await p.evaluate(()=>{const S=__dbg.S;S.yen=900000;S.objs=[];const add=(k,x,y,lv)=>S.objs.push({k,x,y,lv,price:600,uses:0,earn:0,users:0});
  add('rock',17,17,1);add('rock',22,17,3);add('rock',27,17,5);add('milky',17,23,1);add('milky',22,23,3);add('milky',27,23,5);
  __dbg.refresh();__dbg.ensureGate();__dbg.setHour(10);
  __dbg.setPaint('path',16,21,31,21);__dbg.setPaint('path_wood',16,22,31,22,false);__dbg.setPaint('path_gravel',21,16,21,30);__dbg.setPaint('path_tatami',26,27,31,29,true);__dbg.setPaint('path',16,28,24,30,false);
  __dbg.setPaint('path_erase',18,22,19,22);
  __dbg.focus(24,23,1.9);__dbg.clearGhost()});
 await p.waitForTimeout(5000);await p.screenshot({path:'shot_tiers.png'});await p.evaluate(()=>__dbg.focus(22,25,3.4));await p.waitForTimeout(500);await p.screenshot({path:'shot_paths.png'});
 // 업그레이드 연출
 await p.evaluate(()=>{const o=__dbg.S.objs.find(o=>o.k=='rock'&&o.lv==1);__dbg.focus(19,19,4);__dbg.upFx(o)});await p.waitForTimeout(350);await p.screenshot({path:'shot_upfx.png'});
 // 드래그 페인트 (마우스)
 await p.evaluate(()=>{__dbg.focus(24,30,3);document.querySelectorAll('.tab')[3].click()});await p.waitForTimeout(200);
 await p.evaluate(()=>[...document.querySelectorAll('.card')].find(c=>c.dataset.k=='path_wood').click());
 const a=await p.evaluate(()=>__dbg.scr(17.5,31.5)),z=await p.evaluate(()=>__dbg.scr(23.5,26.5));
 await p.mouse.move(a[0],a[1]);await p.mouse.down();await p.mouse.move((a[0]+z[0])/2,(a[1]+z[1])/2,{steps:5});await p.mouse.move(z[0],z[1],{steps:5});await p.screenshot({path:'shot_paint.png'});await p.mouse.up();
 console.log('wood tiles',await p.evaluate(()=>__dbg.S.objs.filter(o=>o.k=='path_wood').length));
 console.log('ERR',JSON.stringify(errs));await b.close()})();
