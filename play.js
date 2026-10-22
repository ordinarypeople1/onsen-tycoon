const {chromium}=require('playwright');
const VW=+process.env.W||1440,VH=+process.env.HH||900,P=process.env.P||'d';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:VW,height:VH},isMobile:VW<700,hasTouch:VW<700});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});
 let n=0;const shot=async nm=>{await p.waitForTimeout(500);await p.screenshot({path:`play_${P}_${String(++n).padStart(2,'0')}_${nm}.png`})};
 const tap=async(x,y)=>{const s=await p.evaluate(([x,y])=>__dbg.scr(x+0.5,y+0.5),[x,y]);if(VW<700)await p.touchscreen.tap(s[0],s[1]);else await p.mouse.click(s[0],s[1])};
 const card=async k=>{await p.evaluate(k=>{const tab={milk:3,ramen:2,sakura:4,lantern:4,path:4}[k];document.querySelector(`.tab:nth-child(${tab})`).click()},k);await p.waitForTimeout(200);await p.click(`.card[data-k=${k}]`)};
 await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__ready);await shot('title');
 await p.click('#title [data-a=cont]');await p.waitForTimeout(1500);await shot('start');
 await p.evaluate(()=>{for(let i=0;i<600;i++)__dbg.step(0.1)});await shot('after1h');
 const free=await p.evaluate(()=>{const D=__dbg;const out=[];for(let y=17;y<31;y++)for(let x=17;x<31;x++)if(D.canPlace('milk',x,y))out.push([x,y]);return out});
 const bOpen=await p.$('#bOpen');if(bOpen&&await bOpen.isVisible())await bOpen.click();
 await card('milk');await shot('ghost_milk');const m=free[Math.floor(free.length/2)];await tap(m[0],m[1]);await shot('placed_milk');
 await card('sakura');const f2=await p.evaluate(()=>{const D=__dbg;for(let y=17;y<31;y++)for(let x=17;x<31;x++)if(D.canPlace('sakura',x,y))return[x,y]});await tap(...f2);
 await card('lantern');const f3=await p.evaluate(()=>{const D=__dbg;for(let y=30;y>16;y--)for(let x=30;x>16;x--)if(D.canPlace('lantern',x,y))return[x,y]});await tap(...f3);await shot('deco');
 await p.keyboard.press('Escape');
 // 탕 클릭 → 정보창
 const rk=await p.evaluate(()=>{const o=__dbg.S.objs.find(o=>o.k=='rock');return[o.x+2,o.y+2]});await tap(...rk);await p.waitForTimeout(600);await shot('info_rock');
 await p.evaluate(()=>{const b=document.getElementById('iUp');b&&b.click()});await shot('upgraded');await p.keyboard.press('Escape');
 await p.evaluate(()=>{const q=document.querySelector('#quest button');q&&q.click()});await shot('quest_claim');
 for(const t of['재정','손님']){await p.evaluate(l=>[...document.querySelectorAll('#tools .tool')].find(e=>e.textContent.includes(l)).click(),t);await shot('modal_'+t);await p.keyboard.press('Escape')}
 await p.evaluate(()=>{for(let i=0;i<3600;i++)__dbg.step(0.1)});await p.evaluate(()=>{__dbg.S.min=Math.floor(__dbg.S.min/1440)*1440+18*60});await shot('dusk');
 await p.evaluate(()=>{__dbg.S.min+=4*60});await shot('night');await p.evaluate(()=>{__dbg.S.min+=8*60+30});await shot('morning');
 console.log('ERR',JSON.stringify(errs.slice(0,8)),n);await b.close()})();
