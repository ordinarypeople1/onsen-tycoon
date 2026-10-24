const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'||m.type()=='warning')errs.push(m.text())});
 await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__ready);await p.waitForTimeout(2500);await p.screenshot({path:'shot_title.png'});
 await p.click('#title [data-a=set]');await p.waitForTimeout(400);await p.screenshot({path:'shot_settings.png'});await p.keyboard.press('Escape');await p.waitForTimeout(300);
 await p.click('#title [data-a=cont]');await p.waitForTimeout(1200);await p.keyboard.press('Escape');await p.waitForTimeout(400);await p.screenshot({path:'shot_pause.png'});
 await p.click('#ovPause [data-a=slots]');await p.waitForTimeout(400);await p.screenshot({path:'shot_slots.png'});await p.keyboard.press('Escape');await p.click('#ovPause [data-a=cred]');await p.waitForTimeout(400);await p.screenshot({path:'shot_credits.png'});
 await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.waitForTimeout(500);const st=await p.evaluate(()=>[paused,SHELL.inTitle,document.querySelectorAll('.ovl').length]);
 const p2=await b.newPage({viewport:{width:390,height:844}});await p2.goto('http://localhost:8765/index.html');await p2.waitForFunction(()=>window.__ready);await p2.waitForTimeout(2000);await p2.screenshot({path:'shot_title_m.png'});
 console.log(JSON.stringify(st),'ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
