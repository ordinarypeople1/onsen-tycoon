const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
for(const [w,h,tag] of [[1440,900,''],[390,844,'_m']]){
 const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:tag?2:1});
 p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>m.type()=='error'&&errs.push(tag+' '+m.text()));
 await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
 await p.evaluate(()=>{const S=__dbg.S;S.yen=50000;const add=(k,x,y)=>S.objs.push({k,x,y,lv:1,price:({ramen:900,yuzu:350,hinoki:450,room:6000})[k]||0,uses:0,earn:0,users:0});
  add('yuzu',18,23);add('ramen',27,24);add('hinoki',19,19);add('maple',27,20);add('pine',20,25);add('rocks',28,27);add('room',25,17);
  __dbg.setHour(10);__dbg.refresh();__dbg.mig();for(let i=0;i<8;i++)__dbg.spawn()});
 await p.evaluate(()=>{location.hash='x'});
 await p.waitForTimeout(9000);await p.screenshot({path:`shot_day${tag}.png`});await p.evaluate(()=>document.querySelector('.card').click());await p.mouse.move(w*0.35,h*0.6);await p.waitForTimeout(600);await p.screenshot({path:`shot_build${tag}.png`});await p.keyboard.press('Escape');
 // 이동 모드 테스트: 라멘집 더블클릭 → 이동 → 드롭
 await p.evaluate(()=>{__dbg.focus(28,25)});await p.waitForTimeout(200);const pos=await p.evaluate(()=>{const o=__dbg.S.objs.find(o=>o.k=='ramen');const f=2;return __dbg.scr(o.x+1,o.y+1)});
 await p.mouse.dblclick(pos[0],pos[1]);await p.waitForTimeout(300);const mv=await p.evaluate(()=>!!__dbg.moving);
 const dst=await p.evaluate(()=>{const f=__dbg.free('ramen',27,26);return __dbg.scr(f[0]+1,f[1]+1)});await p.mouse.move(dst[0],dst[1]);await p.waitForTimeout(400);await p.screenshot({path:`shot_move${tag}.png`});
 await p.mouse.click(dst[0],dst[1]);await p.waitForTimeout(300);
 const after=await p.evaluate(()=>{const o=__dbg.S.objs.find(o=>o.k=='ramen');return [o.x,o.y,!!__dbg.moving,JSON.parse(localStorage.onsen2).objs.find(o=>o.k=='ramen').x]});
 console.log(tag,'move',mv,after);
 await p.evaluate(()=>__dbg.setHour(21));await p.waitForTimeout(3000);await p.screenshot({path:`shot_night${tag}.png`});
 await p.evaluate(()=>{__dbg.setHour(17.6);__dbg.cam.tz=1.1});await p.waitForTimeout(2500);await p.screenshot({path:`shot_wide${tag}.png`});
}
console.log('ERR',JSON.stringify(errs));await b.close()})();
