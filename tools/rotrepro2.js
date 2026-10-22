const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' @'+(e.stack||'').split('\n').slice(1,3).join('|')));
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
await p.evaluate(()=>{window.__fr=0;const f=()=>{__fr++;requestAnimationFrame(f)};f()});
const FAC=['rock','hinoki','milky','sauna','ramen','teishoku','izakaya','yuzu','gift','room'];
for(const k of FAC)for(let l=1;l<=5;l++)for(let r=0;r<4;r++){
 await p.evaluate(([k,l,r])=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate'||D.DEF[o.k].isPath);const g=D.gate();const xy=D.free(k,g.x+3,g.y+3);const o={k,x:xy[0],y:xy[1],lv:l,rot:r,price:D.DEF[k].price,uses:0,earn:0};S.objs.push(o);D.occ();for(let i=0;i<4;i++)D.spawn();D.focusXY(o.x,o.y,2)},[k,l,r]);
 const f0=await p.evaluate(()=>__fr);await p.waitForTimeout(250);
 const f1=await Promise.race([p.evaluate(()=>__fr),new Promise(r=>setTimeout(()=>r(-1),6000))]);
 if(f1<0||f1-f0<3){console.log('FREEZE',k,l,r,f1-f0);process.exit(0)}}
console.log('render ok ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
