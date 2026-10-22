const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' @'+(e.stack||'').split('\n').slice(1,4).join('|')));
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
await p.evaluate(()=>{window.__fr=0;const f=()=>{__fr++;requestAnimationFrame(f)};f()});
for(const k of ['room','rock','hinoki','sauna','izakaya'])for(let l=1;l<=5;l++){
 const pt=await p.evaluate(([k,l])=>{const D=__dbg,S=D.S;S.yen=1e7;S.objs=S.objs.filter(o=>o.k=='gate'||D.DEF[o.k].isPath);const g=D.gate();const xy=D.free(k,g.x+3,g.y+3);const o={k,x:xy[0],y:xy[1],lv:l,rot:0,price:D.DEF[k].price,uses:0,earn:0};S.objs.push(o);D.occ();for(let i=0;i<12;i++)D.spawn();for(let i=0;i<100;i++)D.step(0.1);const f=D.DEF[k].fp;D.focusXY(o.x+f/2,o.y+f/2,3);return D.scr(o.x+f/2,o.y+f/2)},[k,l]);
 for(let i=0;i<6;i++){await p.mouse.move(pt[0]+i,pt[1]-20);await p.mouse.click(pt[0],pt[1]-20);await p.waitForTimeout(120);let ok=false;try{await p.click('#iRot',{timeout:1500});ok=true}catch(e){}if(ok){}
  else {await p.keyboard.press('r')}await p.waitForTimeout(150);
  const f0=await p.evaluate(()=>__fr);await p.waitForTimeout(200);const f1=await Promise.race([p.evaluate(()=>__fr),new Promise(r=>setTimeout(()=>r(-1),5000))]);
  if(f1<0||f1-f0<3){console.log('FREEZE',k,l,i,f1-f0,JSON.stringify(errs));process.exit(0)}}
 // move mode rotate
 await p.evaluate(()=>{const o=__dbg.S.objs[__dbg.S.objs.length-1];startMove&&0});
}
console.log('ok ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
