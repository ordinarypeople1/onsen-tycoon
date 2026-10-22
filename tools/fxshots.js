const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error')errs.push(m.text())});
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
await p.evaluate(()=>{__dbg.S.yen=1e8;__dbg.setHour(21.5)});
await p.click('#tFx');await p.waitForTimeout(300);await p.screenshot({path:'shots/r5/fx_menu.png'});
await p.evaluate(()=>{document.getElementById('modal').style.display='none';const s=__dbg.stars;__dbg.stars=()=>5;['fw_show','lanterns','fireflies'].forEach(k=>FX.trigger(k))});
await p.waitForTimeout(6000);await p.screenshot({path:'shots/r5/fx_night.png'});
await p.evaluate(()=>{__dbg.setHour(13);['sakura','rainbow','parade'].forEach(k=>FX.trigger(k))});await p.waitForTimeout(7000);await p.screenshot({path:'shots/r5/fx_day.png'});
await p.evaluate(()=>{__dbg.setHour(23);FX.trigger('aurora');FX.trigger('snow')});await p.waitForTimeout(6000);await p.screenshot({path:'shots/r5/fx_aurora.png'});
// 스트레스: 쿨다운 무시하고 300회
const st=await p.evaluate(async()=>{for(let i=0;i<300;i++){const ks=Object.keys(FX.list);FX.list[ks[i%ks.length]].run()}await new Promise(r=>setTimeout(r,3000));const a=FX.stats();return a});
const fr=await p.evaluate(()=>new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r(n/2)};f()}));
console.log(JSON.stringify(st),'fps',fr,'ERR',JSON.stringify(errs));await b.close()})();
