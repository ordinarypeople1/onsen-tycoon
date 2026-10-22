const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error')errs.push(m.text())});
const req=[];p.on('request',r=>{if(r.url().includes('bgm'))req.push(r.url().split('/').pop())});
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
console.log('before click',JSON.stringify(req));await p.mouse.click(600,400);await p.waitForTimeout(3000);
const st=await p.evaluate(()=>[...document.querySelectorAll('audio')].length);
const t=await p.evaluate(()=>{const a=[...document.getElementsByTagName('audio')];return 1});
console.log('after click',JSON.stringify(req),'ERR',JSON.stringify(errs));await b.close()})();
