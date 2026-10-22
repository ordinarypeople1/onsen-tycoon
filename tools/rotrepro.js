const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
const FAC=['rock','hinoki','milky','sauna','ramen','teishoku','izakaya','yuzu','gift','room'];
for(const k of FAC)for(let l=1;l<=5;l++){
 const r=await Promise.race([p.evaluate(([k,l])=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate'||D.DEF[o.k].isPath);const g=D.gate();const xy=D.free(k,g.x+3,g.y+3)||[20,20];const o={k,x:xy[0],y:xy[1],lv:l,rot:0,price:D.DEF[k].price,uses:0,earn:0};S.objs.push(o);D.occ();for(let i=0;i<6;i++)D.spawn();const t0=performance.now();for(let i=0;i<8;i++){rotateObj(o);D.step(0.1)}
 // move mode + popover
 return {ms:performance.now()-t0,rot:o.rot}},[k,l]),new Promise(r=>setTimeout(()=>r('TIMEOUT'),8000))]);
 if(r=='TIMEOUT'||r.ms>500){console.log('HANG',k,l,r);break}}
// UI paths: click popover rotate on a room while guests use it
await p.evaluate(()=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate'||D.DEF[o.k].isPath);const g=D.gate();const xy=D.free('room',g.x+2,g.y+2);S.objs.push({k:'room',x:xy[0],y:xy[1],lv:3,rot:0,price:500,uses:0,earn:0});D.occ();for(let i=0;i<10;i++)D.spawn()});
for(let s=0;s<40;s++){const ok=await Promise.race([p.evaluate(()=>{const D=__dbg;const o=D.S.objs.find(o=>o.k=='room');for(let i=0;i<20;i++)D.step(0.2);rotateObj(o);return 1}),new Promise(r=>setTimeout(()=>r(0),8000))]);if(!ok){console.log('HANG room loop',s);break}}
await p.waitForTimeout(1500);const alive=await Promise.race([p.evaluate(()=>1),new Promise(r=>setTimeout(()=>r(0),5000))]);
console.log('alive',alive,'ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
