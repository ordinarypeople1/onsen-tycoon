// 모든 설치물 rot0 접촉 시트 (게임 내 렌더, Lv1 / Lv5)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1800,height:1100}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
for(const lv of [1,3,5]){const n=await p.evaluate(lv=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate');D.guests().length=0;for(const k in S.plots)delete S.plots[k];for(let a=0;a<4;a++)for(let c=0;c<4;c++)S.plots[a+','+c]=1;
 const ks=Object.keys(D.DEF).filter(k=>{const d=D.DEF[k];return !d.isPath&&!d.erase&&k!='gate'&&(lv==1||d.price)});let x=2,y=2,row=0;
 for(const k of ks){const f=D.DEF[k].fp;if(x+f>60){x=2;y+=row+2;row=0}S.objs.push({k,x,y,lv,rot:0,price:D.DEF[k].price||0,uses:0,earn:0,pic:''});x+=f+2;row=Math.max(row,f)}
 D.occ();document.body.classList.add('zen');D.setHour(12);D.focusXY(31,y/2+2,Math.min(1.7,1100/((y+6)*32)));return ks.length},lv);
 await p.waitForTimeout(900);await p.screenshot({path:`shots/r5/contact_rot0_lv${lv}.png`});console.log(lv,n)}
console.log('ERR',JSON.stringify(errs));await b.close()})();
