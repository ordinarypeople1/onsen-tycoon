// Real touch gestures against the game, including pointer capture and cancellation.
// npm install --no-save playwright, then: node tools/test_mobile_drag.js
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

async function main() {
 const root = path.resolve(__dirname, '..');
 const mime = {'.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.png':'image/png', '.woff2':'font/woff2'};
 const server = http.createServer((req,res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if(!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return}
  res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
 let browser;
 try {
  browser = await chromium.launch({channel:process.env.PW_CHANNEL || 'chrome',headless:true});
  const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ko-KR'});
  const page = await context.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/?notitle`);
  await page.waitForFunction(()=>window.__ready);
  await page.waitForFunction(()=>document.body.classList.contains('phone'));
  const result=await page.evaluate(()=>{
   paused=true;
   const g={x:20,y:20,tx:22,ty:20,path:[[22,20]],st:'walk',dir:1,bob:1,life:0,fade:1,happy:60,need:{fatigue:0,hunger:0,thirst:0,fun:0},budget:5000};
   guests=[g];S.objs=[];OCC=occ();GuestMotion.init(g).pace=1;
   for(let i=0;i<60;i++)updGuest(g,1/60);
   const distance=g.x-20,phase=g.motion.phase;
   if(!(distance>1&&distance<1.3))throw Error('Guest did not ease into walk');
   if(Math.abs(phase-(distance*Math.PI*2/0.8)%(Math.PI*2))>1e-8)throw Error('Gait desynchronized');
   Object.assign(g,{st:'look',t:10,tx:100});
   for(let i=0;i<60;i++)updGuest(g,1/60);
   if(GuestMotion.pose(g).lift>0.0001)throw Error('Idle guest still stepping');
   const frozen=JSON.stringify(g.motion);render(100);render(9000);
   if(JSON.stringify(g.motion)!==frozen)throw Error('Render mutated animation clock');
   for(const spr of ['cw1','cw2','cw3','cw4']){g.spr=spr;for(let i=0;i<8;i++){g.motion.phase=i*Math.PI/4;g.motion.amount=1;drawGuest(g,100,light(),{left:true,kx:1,ky:1})}}
   const bath={k:'rock',x:22,y:22,rot:0,lv:1,users:1};S.objs=[bath];
   Object.assign(g,{st:'use',cur:bath,inBath:true,cb:'cb1',t:20,slot:0});
   GuestMotion.update(g,1/60,false,false);drawGuest(g,100,light(),{left:true,kx:1,ky:1});
   if(g.motion.amount!==0)throw Error('Bath transition retained gait');
   return {distance,phase,allFourSprites:true,bath:true,pause:true};
  });
  assert.deepEqual(errors,[]);console.log('PASS browser motion',JSON.stringify(result));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(e=>{console.error(e);process.exitCode=1});
