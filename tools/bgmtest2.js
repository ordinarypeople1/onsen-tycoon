const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);await p.mouse.click(600,400);await p.waitForTimeout(2500);
for(let k=0;k<3;k++){await p.evaluate(()=>{const s=SND._bgm();const a=s.players[s.cur].a;a.currentTime=a.duration-6});await p.waitForTimeout(8000);
console.log(await p.evaluate(()=>{const s=SND._bgm();return JSON.stringify({cur:s.cur,st:s.players.map(q=>q&&{t:+q.a.currentTime.toFixed(1),paused:q.a.paused,g:+q.g.gain.value.toFixed(2)})})}))}
console.log('ERR',JSON.stringify(errs));await b.close()})();
