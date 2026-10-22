const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
for(const [w,h,tag] of [[1440,900,''],[390,844,'_m']]){
 const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:tag?2:1});
 p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>m.type()=='error'&&errs.push(tag+' '+m.text()));
 await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__ready);
 await p.evaluate(()=>{const S=__dbg.S;S.yen=50000;const add=(k,x,y)=>S.objs.push({k,x,y,lv:1,price:({ramen:900,yuzu:350,hinoki:450,room:6000})[k]||0,uses:0,earn:0,users:0});
  add('yuzu',8,8);add('ramen',13,12);add('hinoki',8,11);add('maple',13,8);add('lantern',15,12);add('pine',8,14);
  __dbg.setHour(10);__dbg.refresh();for(let i=0;i<8;i++)__dbg.spawn()});
 await p.evaluate(()=>{location.hash='x'});
 await p.waitForTimeout(9000);await p.screenshot({path:`shot_day${tag}.png`});
 await p.evaluate(()=>__dbg.setHour(21));await p.waitForTimeout(3000);await p.screenshot({path:`shot_night${tag}.png`});
 await p.evaluate(()=>{__dbg.setHour(17.6);__dbg.cam.tz=1.1});await p.waitForTimeout(2500);await p.screenshot({path:`shot_wide${tag}.png`});
}
console.log('ERR',JSON.stringify(errs));await b.close()})();
