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
  const cdp = await context.newCDPSession(page);
  const send = (type,points=[])=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id=1])=>({x,y,id}))});
  const down=p=>send('touchStart',[p]), move=p=>send('touchMove',[p]), up=()=>send('touchEnd');
  const state=()=>page.evaluate(()=>({objs:S.objs.map(o=>({k:o.k,x:o.x,y:o.y,rot:o.rot||0})),yen:S.yen,exp:S.fin.exp,cam:{x:cam.x,y:cam.y,z:cam.z},moving:!!moving,ghost,hover:hoverT,ptrs:ptrs.size}));
  const reset=async(k='lantern',rot=0)=>{
   await page.evaluate(({k,rot})=>{
    escCancel();paused=true;homeAnim=null;window.READONLY=false;
    S.objs=[{k,x:23,y:23,rot,lv:1,price:DEF[k].price||0,uses:0,earn:0}];
    S.yen=100000;S.fin.exp=0;guests=[];OCC=occ();groundDirty=true;lastTap={};lastMouse=null;hoverT=null;
    focus(24,24,2.4);cam.y+=100;
    $('build').style.display='none';$('bOpen').style.display='flex';$('info').style.display='none';
   },{k,rot});
   await page.waitForTimeout(100);
  };
  const screen=(x,y)=>page.evaluate(([x,y])=>toScreenT(x,y),[x,y]);
  const grab=()=>page.evaluate(()=>{
   const o=S.objs[0],g=objGeom(o);
   for(const f of [.45,.25,.7,.9])for(const dx of [0,-.2,.2]){
    const p=toScreen(g.X+g.W*dx,g.Y-g.H*f);
    if(pickObj(...p)===o&&document.elementFromPoint(...p)===cv)return p;
   }
   throw Error('No visible grab point');
  });
  const delta=async(p,dx,dy)=>{
   const [a,b]=await screen(0,0),[x,y]=await screen(dx,dy);return[p[0]+x-a,p[1]+y-b];
  };
  const tap=async p=>{await down(p);await up()};
  const hold=async p=>{await down(p);await page.waitForTimeout(550)}; // 기존 시설은 꾹 눌러야 이동 모드
  const test=async(name,fn)=>{await fn();assert.equal((await state()).ptrs,0,'pointer leaked');console.log('PASS',name)};

  await test('new building follows finger, drops once and charges once',async()=>{
   await reset();await page.evaluate(()=>__dbg.setGhost('milk'));
   const p=await screen(21,24),q=await screen(25,24),before=await state();
   await down(p);await move(q);
   const preview=await state();assert.deepEqual(preview.cam,before.cam);assert.equal(preview.objs.length,1);assert.notDeepEqual(preview.hover,before.hover);
   await up();const after=await state();assert.equal(after.objs.length,2);assert.equal(after.ghost,null);
   const cost=await page.evaluate(()=>DEF.milk.cost);assert.equal(before.yen-after.yen,cost);assert.equal(after.exp,cost);
  });
  await test('existing tall object drags without a jump or camera pan',async()=>{
   await reset('sakura');const p=await grab(),q=await delta(p,2,1),before=await state();
   await hold(p);await move(q);const preview=await state();
   assert.deepEqual(preview.hover,[25,24]);assert.deepEqual(preview.cam,before.cam);assert.deepEqual(preview.objs,before.objs);
   if(process.env.DRAG_SHOT_DIR){fs.mkdirSync(process.env.DRAG_SHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.DRAG_SHOT_DIR,'mobile-drag-preview.png')})}
   await up();const after=await state();assert.deepEqual([after.objs[0].x,after.objs[0].y],[25,24]);assert.equal(after.yen,before.yen);assert.equal(after.moving,false);
  });
  await test('rotated rectangular building keeps its rotation and grabbed point',async()=>{
   await reset('milk',1);const p=await grab(),q=await delta(p,1,2);
   await hold(p);await move(q);assert.deepEqual((await state()).hover,[24,25]);await up();
   const o=(await state()).objs[0];assert.deepEqual([o.x,o.y,o.rot],[24,25,1]);
  });
  await test('blocked drop keeps the original object and allows retry',async()=>{
   await reset();await page.evaluate(()=>{S.objs.push({k:'lantern',x:25,y:24,lv:1});OCC=occ();groundDirty=true});
   const p=await grab(),q=await delta(p,2,1);await hold(p);await move(q);await up();
   const invalid=await state();assert.deepEqual([invalid.objs[0].x,invalid.objs[0].y],[23,23]);assert.equal(invalid.moving,true);
   await page.evaluate(()=>cancelMove());assert.equal((await state()).moving,false);
  });
  await test('dragging empty ground still pans the map',async()=>{
   await reset();const p=await screen(21,25),before=await state();await down(p);await move([p[0]+35,p[1]+25]);await up();
   const after=await state();assert.deepEqual(after.objs,before.objs);assert.equal(Math.round(after.cam.x-before.cam.x),35);assert.equal(Math.round(after.cam.y-before.cam.y),25);
  });
  await test('short tap still opens object information',async()=>{
   await reset();await tap(await grab());await page.waitForTimeout(280);
   assert.equal(await page.locator('#info').isVisible(),true);assert.equal((await state()).moving,false);
  });
  await test('long press can continue straight into drag and drop',async()=>{
   await reset();const p=await grab();await down(p);await page.waitForTimeout(600);assert.equal((await state()).moving,true);
   await move(await delta(p,2,1));await up();assert.deepEqual((await state()).objs.map(o=>[o.x,o.y]),[[25,24]]);
  });
  await test('stationary long press keeps move mode, next tap places it',async()=>{
   await reset();await down(await grab());await page.waitForTimeout(600);await up();assert.equal((await state()).moving,true);
   await tap(await screen(26.5,24.5));const after=await state();assert.equal(after.moving,false);assert.deepEqual([after.objs[0].x,after.objs[0].y],[26,24]);
  });
  await test('touch cancellation restores original object',async()=>{
   await reset();const before=await state(),p=await grab();await down(p);await move(await delta(p,2,1));await send('touchCancel');
   const after=await state();assert.deepEqual(after.objs,before.objs);assert.equal(after.moving,false);
  });
  await test('dropping over the toolbar never places or charges',async()=>{
   await reset();const before=await state(),p=await grab();const b=await page.locator('#bOpen').boundingBox();
   await down(p);await move([b.x+b.width/2,b.y+b.height/2]);await up();const after=await state();assert.deepEqual(after.objs,before.objs);assert.equal(after.moving,false);assert.equal(after.yen,before.yen);
  });
  await test('second finger cancels object drag and leaves pinch available',async()=>{
   await reset();const p=await grab(),q=await delta(p,1,1),before=await state();await hold(p);await move(q);
   await send('touchStart',[[...q,1],[q[0]+60,q[1]+20,2]]);assert.equal((await state()).moving,false);
   await send('touchMove',[[q[0]-35,q[1],1],[q[0]+95,q[1]+20,2]]);
   await send('touchMove',[[q[0]-55,q[1],1],[q[0]+115,q[1]+20,2]]);await up();
   const after=await state();assert.deepEqual(after.objs,before.objs);assert.ok(after.cam.z>before.cam.z);
  });
  await test('pinch during new placement never builds accidentally',async()=>{
   await reset();await page.evaluate(()=>__dbg.setGhost('milk'));const before=await state(),p=await screen(25,24);
   await down(p);await send('touchStart',[[...p,1],[p[0]+50,p[1]+20,2]]);await up();
   const after=await state();assert.equal(after.objs.length,before.objs.length);assert.equal(after.yen,before.yen);assert.equal(after.ghost,'milk');
  });
  await test('path painting survives pointer capture and clears on cancellation',async()=>{
   await reset();await page.evaluate(()=>__dbg.setGhost('path'));await down(await screen(25.5,24.5));await move(await screen(27.5,24.5));await up();assert.equal((await state()).objs.filter(o=>o.k==='path').length,3);
   const before=await state();await down(await screen(25.5,26.5));await move(await screen(27.5,26.5));await send('touchCancel');assert.deepEqual((await state()).objs,before.objs);
  });
  await test('read-only visit cannot drag another player’s object',async()=>{
   await reset();await page.evaluate(()=>window.READONLY=true);const p=await grab(),before=await state();await down(p);await move(await delta(p,2,1));await up();assert.deepEqual((await state()).objs,before.objs);
  });
  await test('desktop tap placement and map panning still work',async()=>{
   await reset();await page.evaluate(()=>__dbg.setGhost('milk'));const p=await screen(25,24);await page.mouse.click(...p);assert.equal((await state()).objs.length,2);
   const before=await state(),q=await screen(21,25);await page.mouse.move(...q);await page.mouse.down();await page.mouse.move(q[0]+30,q[1]+20);await page.mouse.up();assert.notDeepEqual((await state()).cam,before.cam);
  });
  assert.deepEqual(errors,[],'browser errors');console.log('ALL MOBILE DRAG TESTS PASSED');
 } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(e=>{console.error(e);process.exitCode=1});
