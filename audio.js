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
  const g=ac.createGain();g.gain.value=0.055;const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=0.13;lg.gain.value=0.035;lfo.connect(lg);lg.connect(g.gain);
  src.connect(lp);lp.connect(g);g.connect(ambB);src.start();lfo.start();amb=g;
  // 풍경(風鈴)
  (function chime(){if(!ac)return;const sc=[1318.5,1568,1760,2093,2349.3,2637];const n=1+(Math.random()*3|0);for(let i=0;i<n;i++){const f=sc[Math.random()*sc.length|0];tone(f,'sine',2.4,0.022,i*0.12,ambB);tone(f*2.76,'sine',0.8,0.008,i*0.12,ambB)}setTimeout(chime,4000+Math.random()*7000)})()}
 // BGM: 6곡 플레이리스트(캐논풍 3곡 → 기존 3곡, 반복), 3초 크로스페이드, 2곡째부터는 필요할 때 로드
 const TRACKS=['assets/bgm/canon1.mp3','assets/bgm/canon2.mp3','assets/bgm/canon3.mp3','assets/bgm/track1.mp3','assets/bgm/track2.mp3','assets/bgm/track3.mp3'],XF=3;let cur=-1,players=[];
 function player(i){if(players[i])return players[i];const a=new Audio();a.preload=i==0?'auto':'none';a.src=TRACKS[i];a.crossOrigin='anonymous';let node=null,g=ac.createGain();g.gain.value=0;g.connect(bgB);
  try{node=ac.createMediaElementSource(a);node.connect(g)}catch(e){}return players[i]={a,g,fading:false}}
 function playTrack(i){const p=player(i);const t=ac.currentTime;p.fading=false;p.a.currentTime=0;p.g.gain.cancelScheduledValues(t);p.g.gain.setValueAtTime(0.0001,t);p.g.gain.linearRampToValueAtTime(0.55,t+XF);
  const pr=p.a.play();if(pr&&pr.catch)pr.catch(()=>{});const prev=players[cur];if(prev&&prev!==p){prev.g.gain.cancelScheduledValues(t);prev.g.gain.setValueAtTime(prev.g.gain.value,t);prev.g.gain.linearRampToValueAtTime(0.0001,t+XF);const pa=prev.a;setTimeout(()=>pa.pause(),XF*1000+200)}cur=i}
 function startBgm(){bgmOn=true;playTrack(0);setInterval(()=>{if(!ac||cur<0)return;const p=players[cur];const a=p.a;if(!a.duration||isNaN(a.duration))return;const left=a.duration-a.currentTime;const nx=(cur+1)%TRACKS.length;
   if(left<25){const q=player(nx);if(q.a.preload=='none'){q.a.preload='auto';q.a.load()}}
   if((left<=XF||a.ended)&&!p.fading){p.fading=true;playTrack(nx)}},250)}
 api.init=init;
 api.coin=()=>{if(!ac)return;tone(1318,'square',0.06,0.03);tone(1975,'square',0.12,0.025,0.05)};
 api.build=()=>{if(!ac)return;tone(110,'sine',0.25,0.15);tone(70,'triangle',0.3,0.1,0.02);for(let i=0;i<4;i++)tone(1500+i*300,'sine',0.15,0.02,0.08+i*0.04)};
 api.upgrade=()=>{if(!ac)return;[523,659,784,1046,1318].forEach((f,i)=>tone(f,'triangle',0.35,0.05,i*0.07))};
 api.boom=()=>{if(!ac)return;const t=ac.currentTime,src=ac.createBufferSource();src.buffer=api._nb||(api._nb=noiseBuf(1));const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(900,t);lp.frequency.exponentialRampToValueAtTime(120,t+0.6);const g=ac.createGain();src.connect(lp);lp.connect(g);g.connect(sfx);env(g,t,0.01,0.8,0.25);src.start(t);src.stop(t+0.9);tone(60,'sine',0.5,0.12)};
 api.hammer=()=>{if(!ac)return;tone(196,'square',0.05,0.05);tone(98,'triangle',0.09,0.08,0.005)};
 api.tok=()=>{if(!ac)return;tone(520,'triangle',0.09,0.12,0,ambB);tone(260,'sine',0.14,0.08,0.005,ambB);tone(780,'triangle',0.05,0.04,0.25,ambB)};
 api.squeak=()=>{if(!ac)return;tone(1400,'sine',0.08,0.04);tone(1900,'sine',0.07,0.03,0.06)};
 api.click=()=>{if(!ac)return;tone(880,'sine',0.04,0.03)};
 api.quest=()=>{if(!ac)return;[784,988,1175,1568].forEach((f,i)=>{tone(f,'sine',1.2,0.05,i*0.09);tone(f*2,'sine',0.5,0.01,i*0.09)})};
 api.unlock=()=>{if(!ac)return;[392,523,659,784,1046].forEach((f,i)=>tone(f,'triangle',0.6,0.06,i*0.1))};
 api.toggle=()=>{muted=!muted;localStorage.onsenMute=muted?'1':'0';applyVol();return muted};
 api.muted=()=>muted;api._bgm=()=>({cur,players});api.applyVol=applyVol;api.suspend=on=>{if(ac)on?ac.suspend():ac.resume()};document.addEventListener('visibilitychange',()=>{if(!ac)return;const p=players[cur];if(document.hidden){ac.suspend();if(p)p.a.pause()}else{ac.resume();if(p&&bgmOn){const r=p.a.play();if(r&&r.catch)r.catch(()=>{})}}});
 return api})();
addEventListener('pointerdown',()=>SND.init(),{once:false,capture:true});
