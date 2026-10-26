// Simulation-time animation. No wall-clock timers: pause and speed share the game clock.
(function(root){
 const TAU=Math.PI*2;
 const api={
 init(g){return g.motion||(g.motion={clock:0,phase:0,amount:0,velocity:0,pace:0.94+Math.random()*0.12,seed:g.bob||0,facing:g.dir||1,turn:0,idle:0})},
 move(g,dx,dy,dt,maxSpeed){
  const m=api.init(g),d=Math.hypot(dx,dy);if(d<1e-6||dt<=0)return;
  // A short ease-in; braking is bounded by the next waypoint, so corners do not overshoot.
  m.velocity+=(maxSpeed*m.pace-m.velocity)*(1-Math.exp(-dt*12));
  const step=Math.min(d,m.velocity*dt);g.x+=dx/d*step;g.y+=dy/d*step;
  m.travel=(m.travel||0)+step;const screenX=dx-dy;if(Math.abs(screenX)>1e-5)g.dir=screenX>0?1:-1;
 },
 update(g,dt,wasBath,wasHidden){
  const m=api.init(g);m.clock+=dt;
  // Only move() contributes: seat teleports and stale tx/ty never count as footsteps.
  const distance=m.travel||0;m.travel=0;m.phase=(m.phase+distance*TAU/0.8)%TAU;
  const moving=distance>1e-6&&!g.inBath&&!g.hide;
  m.amount+=(Number(moving)-m.amount)*(1-Math.exp(-dt*14));
  if(!moving&&!(g.st==='walk'&&g.path&&g.path.length))m.velocity=0;
  if(g.dir!==m.facing){m.facing=g.dir;m.turn=0.14}m.turn=Math.max(0,m.turn-dt);
  m.idle=moving?0:m.idle+dt;
  if(!!g.inBath!==wasBath||!!g.hide!==wasHidden){m.settle=0.45;m.amount=0;m.velocity=0}
  m.settle=Math.max(0,(m.settle||0)-dt);
 },
 pose(g){const m=api.init(g),p=Math.round(m.phase/(TAU/8))*(TAU/8),a=m.amount;
  return {step:Math.sin(p)*a,lift:Math.abs(Math.sin(p))*a*0.45,
   breath:Math.sin(m.clock*2+m.seed)*0.012*(1-a),
   lean:Math.sin(p)*a*0.018+Math.sin(m.clock*0.8+m.seed)*0.009*(1-a),
   turn:1-0.18*Math.sin(Math.PI*m.turn/0.14),
   settle:Math.sin((m.settle||0)/0.45*Math.PI)*0.6,
   clock:m.clock};}
 };
 if(typeof module==='object'&&module.exports)module.exports=api;else root.GuestMotion=api;
})(typeof window==='object'?window:globalThis);
