'use strict';
// ===== 절차적 사운드 (WebAudio) =====
const SND=(()=>{let ac=null,master=null,amb=null,bgmOn=false,muted=localStorage.onsenMute==='1';const api={};let sfx=null,bgB=null,ambB=null;
 const V=()=>{try{return Object.assign({master:0.8,bgm:0.6,sfx:0.8,amb:0.8},JSON.parse(localStorage.onsenSet||'{}').vol||{})}catch(e){return{master:0.8,bgm:0.6,sfx:0.8,amb:0.8}}};
 function applyVol(){if(!ac)return;const v=V();master.gain.value=muted?0:v.master;sfx.gain.value=v.sfx;bgB.gain.value=v.bgm;ambB.gain.value=v.amb}
 function init(){if(ac)return;try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return}
  master=ac.createGain();master.connect(ac.destination);sfx=ac.createGain();sfx.connect(master);bgB=ac.createGain();bgB.connect(master);ambB=ac.createGain();ambB.connect(master);applyVol();startAmbient();startBgm()}
 function env(g,t,a,d,peak){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d)}
 function tone(f,type,dur,vol,when=0,dest=sfx){if(!ac)return;const t=ac.currentTime+when,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.connect(g);g.connect(dest);env(g,t,0.005,dur,vol);o.start(t);o.stop(t+dur+0.05);return o}
 function noiseBuf(sec){const b=ac.createBuffer(1,ac.sampleRate*sec,ac.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){last=(last+0.02*(Math.random()*2-1))/1.02;d[i]=last*3.5}return b}
 function startAmbient(){ // 물소리: 브라운 노이즈 + 저역통과 + LFO
  const src=ac.createBufferSource();src.buffer=noiseBuf(4);src.loop=true;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;
  const g=ac.createGain();g.gain.value=0.09;const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=0.13;lg.gain.value=0.035;lfo.connect(lg);lg.connect(g.gain);
  src.connect(lp);lp.connect(g);g.connect(ambB);src.start();lfo.start();amb=g;
  // 풍경(風鈴)
  (function chime(){if(!ac)return;const sc=[1318.5,1568,1760,2093,2349.3,2637];const n=1+(Math.random()*3|0);for(let i=0;i<n;i++){const f=sc[Math.random()*sc.length|0];tone(f,'sine',2.4,0.035,i*0.12,ambB);tone(f*2.76,'sine',0.8,0.008,i*0.12,ambB)}setTimeout(chime,4000+Math.random()*7000)})()}
 function startBgm(){ // 고토 느낌 펜타토닉 플럭
  const sc=[293.66,349.23,392,440,523.25,587.33,698.46];let i=3;bgmOn=true;
  const bg=ac.createGain();bg.gain.value=0.5;bg.connect(bgB);
  function pluck(f,when,v){const t=ac.currentTime+when;const o=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(f*6,t);lp.frequency.exponentialRampToValueAtTime(f*1.2,t+0.8);
   o.type='triangle';o2.type='sawtooth';o.frequency.value=f;o2.frequency.value=f*1.003;const g2=ac.createGain();g2.gain.value=0.25;o.connect(g);o2.connect(g2);g2.connect(g);g.connect(lp);lp.connect(bg);env(g,t,0.004,1.6,v);o.start(t);o2.start(t);o.stop(t+1.8);o2.stop(t+1.8)}
  (function step(){if(!ac)return;const r=Math.random();if(r<0.75){i=Math.max(0,Math.min(sc.length-1,i+[-2,-1,-1,1,1,2][Math.random()*6|0]));pluck(sc[i],0,0.05);if(Math.random()<0.25)pluck(sc[Math.max(0,i-2)]/2,0.02,0.03)}
   setTimeout(step,[650,650,1300,975][Math.random()*4|0])})();
  (function drone(){if(!ac)return;pluck(146.83,0,0.03);pluck(220,0.05,0.02);setTimeout(drone,5200)})()}
 api.init=init;
 api.coin=()=>{if(!ac)return;tone(1318,'square',0.06,0.03);tone(1975,'square',0.12,0.025,0.05)};
 api.build=()=>{if(!ac)return;tone(110,'sine',0.25,0.15);tone(70,'triangle',0.3,0.1,0.02);for(let i=0;i<4;i++)tone(1500+i*300,'sine',0.15,0.02,0.08+i*0.04)};
 api.upgrade=()=>{if(!ac)return;[523,659,784,1046,1318].forEach((f,i)=>tone(f,'triangle',0.35,0.05,i*0.07))};
 api.squeak=()=>{if(!ac)return;tone(1400,'sine',0.08,0.04);tone(1900,'sine',0.07,0.03,0.06)};
 api.click=()=>{if(!ac)return;tone(880,'sine',0.04,0.03)};
 api.quest=()=>{if(!ac)return;[784,988,1175,1568].forEach((f,i)=>{tone(f,'sine',1.2,0.05,i*0.09);tone(f*2,'sine',0.5,0.01,i*0.09)})};
 api.unlock=()=>{if(!ac)return;[392,523,659,784,1046].forEach((f,i)=>tone(f,'triangle',0.6,0.06,i*0.1))};
 api.toggle=()=>{muted=!muted;localStorage.onsenMute=muted?'1':'0';applyVol();return muted};
 api.muted=()=>muted;api.applyVol=applyVol;api.suspend=on=>{if(ac)on?ac.suspend():ac.resume()};
 return api})();
addEventListener('pointerdown',()=>SND.init(),{once:false,capture:true});
