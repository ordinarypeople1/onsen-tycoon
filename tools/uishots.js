// 새 UI·팝오버·호버 확인 + 남은 이모지 검사
const {chromium}=require('playwright');const O='shots/r5/';
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:1440,height:900,n:'desk'},{width:390,height:844,n:'mob',isMobile:true,hasTouch:true}]){
const p=await b.newPage({viewport:{width:vp.width,height:vp.height},isMobile:!!vp.isMobile,hasTouch:!!vp.hasTouch});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error')errs.push(m.text())});
await p.goto('http://localhost:8765/index.html?notitle');await p.waitForFunction(()=>window.__ready);await p.waitForTimeout(800);
await p.evaluate(()=>{__dbg.setHour(15)});
await p.screenshot({path:O+`ui_${vp.n}.png`});
// 빌드 패널 열기
const bt=await p.$('#tBuild')||await p.$('[data-t="build"]');if(bt){await bt.click().catch(()=>{});await p.waitForTimeout(500);await p.screenshot({path:O+`ui_build_${vp.n}.png`});await p.keyboard.press('Escape')}
// 건물 위치 클릭 → 팝오버
const pos=await p.evaluate(()=>{const S=__dbg.S;const o=S.objs.find(o=>__dbg.DEF[o.k].bath);const f=__dbg.DEF[o.k].fp;return __dbg.scr(o.x+f/2,o.y+f/2)});
await p.mouse.move(pos[0],pos[1]-10);await p.waitForTimeout(300);await p.screenshot({path:O+`ui_hover_${vp.n}.png`});
if(vp.hasTouch)await p.touchscreen.tap(pos[0],pos[1]-10);else await p.mouse.click(pos[0],pos[1]-10);await p.waitForTimeout(600);
await p.screenshot({path:O+`ui_popover_${vp.n}.png`});
const r=await p.evaluate(()=>{const re=/\p{Extended_Pictographic}/u;const bad=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const t=n.textContent;if(re.test(t)&&n.parentElement&&n.parentElement.offsetParent!==null)bad.push(t.trim().slice(0,30))}
 const inf=document.getElementById('info');return{bad,pop:inf&&getComputedStyle(inf).display!='none'?inf.className:'none',left:document.querySelector('#panelL,.leftpanel')?'exists':'none'}});
console.log(vp.n,JSON.stringify(r));await p.close()}
console.log('ERR',JSON.stringify(errs));await b.close()})();
