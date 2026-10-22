const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('requestfailed',r=>errs.push('FAIL '+r.url()));p.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});
 await p.goto('https://ordinarypeople1.github.io/onsen-tycoon/');await p.waitForFunction(()=>window.__ready,null,{timeout:60000});await p.waitForTimeout(3000);await p.screenshot({path:'shot_live_title.png'});
 await p.click('#title [data-a=cont]');await p.waitForTimeout(2000);await p.screenshot({path:'shot_live_game.png'});
 console.log('ERR',JSON.stringify(errs));await b.close()})();
