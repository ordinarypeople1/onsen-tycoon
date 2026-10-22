const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:720},recordVideo:{dir:'/tmp/vid',size:{width:1280,height:720}}});const p=await ctx.newPage();
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
const src=fs.readFileSync('sim.js','utf8');const code=src.match(/p\.evaluate\((async\(\{HOURS,BOT\}\)=>\{[\s\S]*?\}),\{HOURS,BOT\}\)/)[1];
await p.evaluate(`(${code})({HOURS:+${process.env.H||160},BOT:'smart'})`);
await p.evaluate(()=>{window.__norender=0;window.__dbg.S.min=Math.floor(__dbg.S.min/1440)*1440+5.5*60;for(let i=0;i<200;i++)__dbg.step(0.1);AMB.setZen(true,true);document.querySelectorAll('#toast,#fps,#zenHint').forEach(e=>e.style.display='none')});
// 60s: run game time fast-forward dawn→night (~19h of game time)
const T=+process.env.T||60;const t0=Date.now();
while(Date.now()-t0<T*1000){const k=(Date.now()-t0)/(T*1000);await p.evaluate(k=>{const S=__dbg.S;S.min=Math.floor(S.min/1440)*1440+(5.5+k*18.5)*60;document.querySelectorAll('#toast,#zenHint').forEach(e=>e.style.display='none')},k);await p.waitForTimeout(200)}
const v=p.video();await ctx.close();fs.copyFileSync(await v.path(),'trailer_raw.webm');await b.close()})();
