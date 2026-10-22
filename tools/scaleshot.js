// 소형 설치물 실제 게임 축척 확인 (확대, 손님 포함)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
await p.evaluate(()=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate');
 const ks=['dango','ice','shoot','ema','jizo','tanuki','iris','lanternpath','lantern','torii','ramen','sake'];let x=6,y=6;
 for(const k of ks){const f=D.DEF[k].fp;S.objs.push({k,x,y,lv:1,rot:0,price:D.DEF[k].price||0,uses:0,earn:0,pic:''});x+=f+1;if(x>18){x=6;y+=3}}
 D.occ();D.setHour(12);D.focusXY(12,8,2.2)});
await p.waitForTimeout(6000);await p.screenshot({path:'shots/r5/scale_small.png'});console.log('ERR',JSON.stringify(errs));await b.close()})();
