// 모든 탕 × Lv1/3/5 에 정원만큼 손님을 앉혀 스크린샷 → bath_seats.png
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
for(const lv of [1,2,3,4,5]){
 await p.evaluate(lv=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate'||D.DEF[o.k].isPath);D.guests().length=0;D.occ();
  const pos={rock:[18,17],milky:[24,17],hinoki:[19,24],sauna:[25,24]};
  for(const k in pos){const[x,y]=pos[k];S.objs.push({k,x,y,lv,price:D.DEF[k].price,uses:0,earn:0,users:0})}D.occ();
  for(const o of S.objs.filter(o=>D.DEF[o.k].bath&&!D.DEF[o.k].inside)){const n=D.capOf?D.capOf(o):4;for(let i=0;i<n;i++){D.spawn();const g=D.guests()[D.guests().length-1];g.cur=o;g.st='use';g.t=1e9;g.slot=i;const[a,c]=D.bathSlot(o,i);g.x=a;g.y=c;g.inBath=true;g.hide=false;g.fade=1;o.users=(o.users||0)+1}}
  document.body.classList.add('zen');S.min=Math.floor(S.min/1440)*1440+11*60;D.focusXY(24,22,4.2)},lv);
 await p.waitForTimeout(1500);await p.screenshot({path:`/tmp/bs_${lv}.png`})}
console.log('ERR',errs);await b.close()})();
