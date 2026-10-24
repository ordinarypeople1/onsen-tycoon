const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'||m.type()=='warning')errs.push(m.text())});
 const U=process.env.U||'http://localhost:8765/index.html';
 await p.goto(U+'?notitle');await p.waitForFunction(()=>window.__ready,null,{timeout:30000});await p.waitForTimeout(1500);
 for(const [lab,f] of [['퀘스트','shot_quest.png'],['도감','shot_book.png'],['리뷰','shot_reviews.png']]){await p.evaluate(l=>[...document.querySelectorAll('#tools .tool')].find(e=>e.textContent.includes(l)).click(),lab);await p.waitForTimeout(500);await p.screenshot({path:f});await p.keyboard.press('Escape')}
 const info=await p.evaluate(()=>({ver:document.querySelector('script[src="shell.js"]')!=null,files:[...document.scripts].map(s=>s.src.split('/').pop())}));
 console.log(JSON.stringify(info),'ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
