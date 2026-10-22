// 장시간 소크 테스트: 모바일 뷰포트 + CPU 4x 스로틀 + x10 속도 + 무작위 조작, 1분마다 자원 계측
const {chromium}=require('playwright');const MIN=+process.env.MIN||120;const URL=process.env.URL||'http://localhost:8765/index.html?notitle';
(async()=>{const b=await chromium.launch({args:['--enable-precise-memory-info','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&errs.length<200)errs.push(m.text())});p.on('crash',()=>{console.log('PAGE CRASH');process.exit(2)});
const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await p.goto(URL);await p.waitForFunction(()=>window.__ready,null,{timeout:120000});await p.mouse.click(200,400);
await p.evaluate(()=>{const D=__dbg,S=D.S;S.yen=1e9;speed=10;window.__acts={};
 const KS=Object.keys(D.DEF).filter(k=>{const d=D.DEF[k];return d.cost&&!d.isPath&&!d.erase&&k!='gate'});
 window.__act=()=>{const r=Math.random(),fs=S.objs.filter(o=>!D.DEF[o.k].isPath&&o.k!='gate');let a;try{
  if(r<0.25||fs.length<6){a='build';const k=KS[Math.random()*KS.length|0];const g=D.gate();const xy=D.free(k,g.x+((Math.random()*20)|0)-10,g.y+((Math.random()*20)|0)-10);if(xy){const o={k,x:xy[0],y:xy[1],lv:1,rot:Math.random()*2|0,price:D.DEF[k].price||0,uses:0,earn:0};S.objs.push(o);D.occ();if(!D.reachOK()){S.objs.pop();D.occ()}else D.emit('build',o)}}
  else if(r<0.4){a='rotate';rotateObj(fs[Math.random()*fs.length|0])}
  else if(r<0.5){a='move';const o=fs[Math.random()*fs.length|0];startMove(o);const xy=D.free(o.k,o.x+3,o.y+2);if(xy)dropMove(xy[0],xy[1]);else cancelMove()}
  else if(r<0.62){a='upgrade';const o=fs.find(o=>D.DEF[o.k].price&&o.lv<5);if(o){o.lv++;o.build={t:0};D.emit('upgrade',o)}}
  else if(r<0.7){a='demolish';if(fs.length>12)remove(fs[Math.random()*fs.length|0])}
  else if(r<0.76){a='zen';document.body.classList.toggle('zen')}
  else if(r<0.8){a='photo';const b=document.getElementById('tPhoto')||document.querySelector('[data-t=photo]');b&&b.click();setTimeout(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'})),300)}
  else if(r<0.88){a='hour';D.setHour(Math.random()*24)}
  else if(r<0.94){a='info';const o=fs[Math.random()*fs.length|0];o&&showInfo&&showInfo(o)}
  else {a='pan';__dbg.focusXY(10+Math.random()*30,10+Math.random()*30,0.6+Math.random()*4)}
 }catch(e){a='ERR:'+a+':'+e.message}__acts[a]=(__acts[a]||0)+1};
 setInterval(()=>{for(let i=0;i<3;i++)__act()},1000)});
const m=async()=>p.evaluate(()=>{const s=DIAG.stats();const au=SND._bgm?SND._bgm():null;return{...s,parts:typeof parts!='undefined'?parts.length:null,audioEls:document.getElementsByTagName('audio').length+(au?au.players.filter(Boolean).length:0),served:__dbg.S.stats?__dbg.S.stats.served:null,longFrames:s.long}});
const t0=Date.now();const rows=[];
for(let i=0;;i++){const r=await Promise.race([m(),new Promise(r=>setTimeout(()=>r('HANG'),60000))]);const min=((Date.now()-t0)/60000).toFixed(1);console.log(min,JSON.stringify(r));rows.push(r);if(r=='HANG'){console.log('HANG detected');break}
 if(Date.now()-t0>MIN*60000)break;await p.waitForTimeout(60000)}
console.log('acts',JSON.stringify(await p.evaluate(()=>__acts)));console.log('diag',await p.evaluate(()=>JSON.stringify(JSON.parse(DIAG.text()).log.filter(x=>x.type!='stats'&&x.type!='boot').slice(-20))));
console.log('ERR',errs.length,JSON.stringify([...new Set(errs)].slice(0,15)));await b.close()})();
