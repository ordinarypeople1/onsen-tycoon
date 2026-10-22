// Lv1-5 시트, 4방향 시트, 밤 조명, 연못 스크린샷
const {chromium}=require('playwright');const O='shots/r5/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error')errs.push(m.text())});
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);
const FAC=['rock','hinoki','milky','sauna','ramen','teishoku','izakaya','yuzu','gift','room'];
const setup=async(fn,arg)=>p.evaluate(fn,arg);
// 레벨 시트: 시설 하나씩 Lv1..5 한 줄
for(const k of FAC){await setup(([k])=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate');D.guests().length=0;const f=D.DEF[k].fp;for(let l=1;l<=5;l++)S.objs.push({k,x:10+l*(f+2),y:30-l*(f+2)+ (f+2)*3,lv:l,rot:0,price:D.DEF[k].price,uses:0,earn:0});D.occ();document.body.classList.add('zen');D.setHour(13);const c=S.objs[3];const ff=f;D.focusXY(c.x+ff/2,c.y+ff/2,f>=4?1.9:f==3?2.3:2.8)},[k]);
 await p.waitForTimeout(700);await p.screenshot({path:O+`lv_${k}.png`})}
// 회전 시트
for(const k of FAC){await setup(([k])=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate');const f=D.DEF[k].fp;for(let r=0;r<4;r++)S.objs.push({k,x:12+r*(f+2),y:30-r*(f+2)+(f+2)*2,lv:3,rot:r,price:D.DEF[k].price,uses:0,earn:0});D.occ();D.setHour(13);const c=S.objs[2];D.focusXY(c.x+f/2,c.y+f/2,f>=4?2.2:f==3?2.6:3.2)},[k]);
 await p.waitForTimeout(500);await p.screenshot({path:O+`rot_${k}.png`})}
// 밤: 레벨 시트 몇 개 + 쇼케이스
for(const k of ['rock','izakaya','room','ramen']){await setup(([k])=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate');const f=D.DEF[k].fp;for(let l=1;l<=5;l++)S.objs.push({k,x:10+l*(f+2),y:30-l*(f+2)+(f+2)*3,lv:l,rot:0,price:D.DEF[k].price,uses:0,earn:0});S.objs.push({k:'pond',x:14,y:34,lv:1,rot:0,price:0,uses:0,earn:0});D.occ();D.setHour(21.5);const c=S.objs[3];D.focusXY(c.x+f/2,c.y+f/2,f>=4?1.9:f==3?2.3:2.8)},[k]);
 await p.waitForTimeout(800);await p.screenshot({path:O+`night_${k}.png`})}
// 해질녘 점등
await setup(()=>{__dbg.setHour(18.7)});await p.waitForTimeout(600);await p.screenshot({path:O+'dusk_room.png'});
// 연못 클로즈업 낮/밤
for(const h of[10,21]){await setup(h=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate');S.objs.push({k:'pond',x:20,y:20,lv:1,rot:0,price:0,uses:0,earn:0},{k:'lantern',x:23,y:21,lv:1,rot:0,price:0,uses:0,earn:0},{k:'maple',x:19,y:18,lv:1,rot:0,price:0,uses:0,earn:0});D.occ();D.setHour(h);D.focusXY(21.5,21.5,6)},h);await p.waitForTimeout(700);await p.screenshot({path:O+`pond_${h}.png`})}
// 업그레이드 연출 프레임
await setup(()=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate');S.objs.push({k:'izakaya',x:20,y:20,lv:2,rot:0,price:2200,uses:0,earn:0});D.occ();D.setHour(14);D.focusXY(21,21,5);const o=S.objs[S.objs.length-1];o.lv++;o.build={t:0}});
for(const ms of[500,1200,1950,2600]){await p.waitForTimeout(ms==500?500:ms-[500,1200,1950,2600][[500,1200,1950,2600].indexOf(ms)-1]);await p.screenshot({path:O+`upseq_${ms}.png`})}
// 연못 테두리 가림: 연못 뒤(북쪽)에 선 손님
await setup(()=>{const D=__dbg,S=D.S;S.objs=S.objs.filter(o=>o.k=='gate');D.guests().length=0;S.objs.push({k:'pond',x:20,y:20,lv:1,rot:0,price:0,uses:0,earn:0});D.occ();D.setHour(11);for(let i=0;i<3;i++){D.spawn();const g=D.guests()[D.guests().length-1];g.x=20.5+i;g.y=19.6;g.tx=g.x;g.ty=g.y;g.path=[];g.st='wait';g.t=1e9}D.focusXY(21.5,21,7)});
await p.waitForTimeout(600);await p.screenshot({path:O+'pond_rim_occlusion.png'});
// 대문 회전
for(let i=0;i<4;i++){await setup(()=>{const D=__dbg;D.S.objs=D.S.objs.filter(o=>o.k=='gate'||D.DEF[o.k].isPath);D.occ();rotateGate();const g=D.gate();D.focusXY(g.x+1,g.y+1,3)});await p.waitForTimeout(400);await p.screenshot({path:O+`gate_rot_${i}.png`})}
console.log('ERR',JSON.stringify(errs));await b.close()})();
