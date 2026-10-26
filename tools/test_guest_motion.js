const assert=require('node:assert/strict');
const M=require('../guest-motion');
const guest=()=>({x:0,y:0,dir:1,bob:1,st:'walk',path:[[10,0]]});
function travel(g,n,dt){for(let i=0;i<n;i++){M.move(g,10-g.x,-g.y,dt,1.3);M.update(g,dt,false,false)}}
const a=guest(),b=guest();M.init(a).pace=1;M.init(b).pace=1;travel(a,60,1/60);travel(b,600,1/600);
assert.ok(Math.abs(a.x-b.x)<0.012,'frame-rate independent acceleration');
assert.ok(Math.abs(a.motion.phase-(a.x*Math.PI*2/0.8)%(Math.PI*2))<1e-8,'gait follows actual distance');
const idle=guest();idle.tx=100;M.update(idle,1,false,false);assert.equal(idle.motion.phase,0);assert.equal(M.pose(idle).lift,0,'stale destination cannot trigger walking');
a.path=[];for(let i=0;i<60;i++)M.update(a,1/60,false,false);assert.ok(a.motion.amount<1e-5);assert.equal(a.motion.velocity,0);
const bath=guest();M.init(bath);bath.x=50;bath.y=20;bath.inBath=true;M.update(bath,.016,false,false);assert.equal(bath.motion.phase,0,'seat teleport cannot trigger footsteps');assert.ok(M.pose(bath).settle>0);
const before=JSON.stringify(M.pose(bath));assert.equal(JSON.stringify(M.pose(bath)),before,'rendering does not advance animation');
const turn=guest();M.init(turn);M.move(turn,-1,0,.016,1.3);M.update(turn,.016,false,false);assert.ok(M.pose(turn).turn<1);assert.equal(turn.dir,-1);assert.ok(turn.x>=-1);
const one=guest(),fast=guest();M.init(one).pace=1;M.init(fast).pace=1;travel(one,180,1/60);for(let i=0;i<60;i++)travel(fast,3,1/60);assert.equal(one.x,fast.x);assert.equal(one.motion.phase,fast.motion.phase,'3x simulation advances the same gait');
console.log('PASS motion: distance, frame rate, stale target, stop, teleport, pause, turning, speed');
