// 키보드·마우스 기기 여부: 단축키 안내(R·Esc·Ctrl+V 등)는 이 경우에만 표시
window.KBD=!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform())&&matchMedia('(hover:hover) and (pointer:fine)').matches;
// 앱(Capacitor)에서만 동작하는 보정. 웹에서는 아무 것도 하지 않음
(()=>{
 const C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
 const P=C.Plugins||{};const plat=C.getPlatform();
 document.documentElement.classList.add('native','native-'+plat);
 // 초대 링크는 앱 내부 주소 대신 웹 주소로
 window.WEB_BASE='https://ordinarypeople1.github.io/onsen-tycoon/';
 const safe=(f)=>{try{const r=f();if(r&&r.catch)r.catch(()=>{})}catch(e){}};

 // ---- 세이브 백업: iOS는 웹 저장소가 정리될 수 있어 앱 저장소(Preferences)에도 보관 ----
 const KEYS=()=>Object.keys(localStorage).filter(k=>/^onsen/.test(k));
 const backup=()=>{if(!P.Preferences)return;const o={};for(const k of KEYS())o[k]=localStorage[k];safe(()=>P.Preferences.set({key:'ls',value:JSON.stringify(o)}))};
 if(P.Preferences&&!localStorage.onsen2){P.Preferences.get({key:'ls'}).then(r=>{if(!r||!r.value)return;const o=JSON.parse(r.value);if(!o.onsen2||localStorage.onsen2)return;for(const k in o)localStorage[k]=o[k];location.reload()}).catch(()=>{})}
 setInterval(backup,30000);

 // ---- 햅틱: 퀘스트 보상 수령·시설 업그레이드 완료 때만 ----
 const H=P.Haptics;
 const tap=(style)=>H&&safe(()=>H.impact({style}));
 const hook=()=>{if(typeof BUS=='undefined'||!window.__ready)return setTimeout(hook,200);
  BUS.on('upgrade',()=>{tap('HEAVY');setTimeout(()=>tap('LIGHT'),120)});
  BUS.on('reward',()=>{tap('MEDIUM');setTimeout(()=>tap('LIGHT'),120)})};
 hook();

 // ---- 앱 생명주기: 백그라운드로 가면 저장·백업, 소리 정지 ----
 if(P.App){
  P.App.addListener('appStateChange',({isActive})=>{if(!isActive){safe(()=>window.save&&save());backup();window.SND&&SND.suspend&&SND.suspend(true)}else{window.SND&&SND.suspend&&SND.suspend(false)}});
  // Android 뒤로가기: 열린 창 닫기 → 건설/이동 취소 → 일시정지 → 앱 최소화
  P.App.addListener('backButton',()=>{
   const shellTop=[...document.querySelectorAll('.ovl.on')].pop();
   const vis=id=>{const e=document.getElementById(id);return e&&getComputedStyle(e).display!='none'};
   if(shellTop&&shellTop.id=='ovPause'){P.App.minimizeApp();return}
   if(window.SHELL&&SHELL.inTitle&&!shellTop){P.App.minimizeApp();return}
   const tools=document.getElementById('tools');if(tools&&tools.classList.contains('open')){document.getElementById('tMenu').click();return}
   if(vis('build')&&!vis('modal')&&!vis('info')&&!shellTop){document.getElementById('bClose').click();return}
   window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}))});
 }
 // ---- 상태바 숨김, 준비되면 스플래시 닫기 ----
 if(P.StatusBar)safe(()=>P.StatusBar.hide());
 const sp=()=>{if(window.__ready){P.SplashScreen&&safe(()=>P.SplashScreen.hide({fadeOutDuration:300}))}else setTimeout(sp,100)};sp();
})();
