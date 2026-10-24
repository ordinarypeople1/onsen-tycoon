const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'||m.type()=='warning')errs.push(m.text())});
 await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
 await p.evaluate(()=>{__dbg.S.yen=1e5;document.querySelector('.tab:nth-child(6)').click()});
 const kinds=['banner','frame','noren','sign'];const spots=[[20,26],[22,26],[24,27],[27,26]];
 for(let i=0;i<4;i++){await p.evaluate(k=>new Promise(r=>{const im=new Image();im.onload=()=>{PHOTO.editor(k,im);r()};im.src=k=='sign'?'shot_day.png':'assets/src/emblem.jpg'}),kinds[i]);await p.waitForTimeout(500);
  if(i==0)await p.screenshot({path:'shot_photo_editor.png'});
  await p.click('#pxOk');await p.waitForTimeout(300);const[x,y]=spots[i];await p.evaluate(([x,y])=>{const D=__dbg;const[sx,sy]=D.scr(x+0.5,y+0.5);window.__s=[sx,sy]},[x,y]).catch(()=>{});
  const s=await p.evaluate(([x,y])=>{const k=__dbg;return k.scr?k.scr(x+0.5,y+0.5):null},[x,y]);if(s)await p.mouse.click(s[0],s[1]);await p.waitForTimeout(300)}
 const st=await p.evaluate(()=>({pics:Object.keys(__dbg.S.pics||{}).length,objs:__dbg.S.objs.filter(o=>o.pic).map(o=>o.k+':'+o.x+','+o.y),len:JSON.stringify(__dbg.S.pics).length}));
 await p.evaluate(()=>__dbg.focusXY(23.5,26,5));await p.waitForTimeout(800);await p.screenshot({path:'shot_photo_deco.png'});
 await p.reload();await p.waitForFunction(()=>window.__ready);await p.waitForTimeout(800);const st2=await p.evaluate(()=>__dbg.S.objs.filter(o=>o.pic).length);
 console.log(JSON.stringify(st),st2,'ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
