const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'||m.type()=='warning')errs.push(m.text())});
 await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
 const r=await p.evaluate(()=>{const D=__dbg,S=D.S;S.yen=1e6;S.served=6000;S.rep=90;const ks=['shishi','nodate','pagoda','bamboofence','cafe','lamppost','olive','lounger','cedar','mushroom','fern','birdhouse','snowman','hydrangea','tsukimi','kadomatsu'];let n=0;
  for(const k of ks){let ok=false;for(let y=17;y<31&&!ok;y++)for(let x=17;x<31&&!ok;x++)if(D.canPlace(k,x,y)){S.objs.push({k,x,y,lv:1,price:D.DEF[k].price||0,uses:0,earn:0,users:0});D.occ();D.emit('build',S.objs[S.objs.length-1]);ok=true;n++}}
  D.focusXY(24,24,3.2);return [n,D.stars()]});
await p.evaluate(()=>{document.querySelector('.tab:nth-child(5)').click()});await p.waitForTimeout(1500);await p.screenshot({path:'shot_theme.png'});
 await p.evaluate(()=>{__dbg.S.min=Math.floor(__dbg.S.min/1440)*1440+20*60+30});await p.waitForTimeout(1200);await p.screenshot({path:'shot_theme_night.png'});
 console.log(JSON.stringify(r),'ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
