// 쇼케이스 료칸으로 60초 트레일러 녹화 (새벽→밤). 사용: node trailer.js → trailer_raw.webm
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const W=+process.env.W||1920,H=+process.env.HH||1080;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},recordVideo:{dir:'/tmp/vid',size:{width:W,height:H}}});const p=await ctx.newPage();
await p.goto('http://localhost:8765/index.html?notitle#showcase');await p.waitForFunction(()=>window.__ready);
await p.evaluate(()=>{for(let i=0;i<300;i++)__dbg.step(0.1);AMB.setZen(true,true);const st=document.createElement('style');st.textContent='#toast,#fps,#zenHint,#visitBar{display:none!important}';document.head.appendChild(st)});
const T=+process.env.T||66;const t0=Date.now();
while(Date.now()-t0<T*1000){const k=(Date.now()-t0)/(T*1000);await p.evaluate(k=>{const S=__dbg.S;S.min=Math.floor(S.min/1440)*1440+(5.2+k*18)*60},k);await p.waitForTimeout(150)}
const v=p.video();await ctx.close();fs.copyFileSync(await v.path(),'trailer_raw.webm');await b.close()})();
