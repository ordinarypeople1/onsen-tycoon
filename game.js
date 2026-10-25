'use strict';
const BUS={h:{},on(e,f){(this.h[e]=this.h[e]||[]).push(f)},emit(e,...a){for(const f of this.h[e]||[])try{f(...a)}catch(err){console.error(err)}}};
// ===== 설정 =====
const N=48,PS=16,TW=32,TH=16;           // 맵 24x24, 구역 6x6
const START_PLOT=[1,1];
const $=id=>document.getElementById(id);
const cv=$('c'),tc=$('tc'),tx=tc.getContext('2d');let cx=cv.getContext('2d');
const DEF={
 rock:{n:'바위 노천탕',tab:'bath',img:'rock',fp:4,sc:1,cost:6000,price:600,cap:5,dur:28,eff:{fatigue:-70,fun:12},wage:60,star:1,bath:1,water:'#8fe3df',appeal:12,desc:'김이 피어오르는 바위 노천탕'},
 hinoki:{n:'히노키 욕조',tab:'bath',img:'hinoki',fp:2,sc:1,cost:3500,price:450,cap:2,dur:22,eff:{fatigue:-50,fun:8},wage:35,star:1,bath:1,water:'#9fd6e6',appeal:7,desc:'편백나무 향 가득한 욕조'},
 sauna:{n:'사우나',tab:'bath',inside:1,img:'sauna',fp:2,sc:1,cost:7000,price:700,cap:3,dur:20,eff:{fatigue:-40,fun:25},wage:55,star:2,appeal:8,light:[[0.1,-0.45]],desc:'땀 빼고 나면 개운!'},
 milky:{n:'유백 대욕장',tab:'bath',img:'milky',fp:4,sc:1,cost:15000,price:1100,cap:6,dur:30,eff:{fatigue:-85,fun:15},wage:110,star:3,bath:1,water:'#f1ede0',appeal:16,desc:'우윳빛 온천수의 대욕장'},
 cave:{n:'동굴탕',tab:'bath',img:'cave',fp:4,sc:1,cost:15000,price:1100,cap:5,dur:30,eff:{fatigue:-80,fun:18},wage:90,star:3,bath:1,water:'#7fdcd6',appeal:16,light:[[0,-0.5]],desc:'바위 동굴 속 신비로운 온천'},
 foot:{n:'족욕탕',tab:'bath',img:'foot',fp:2,sc:1,cost:2500,price:250,cap:4,dur:12,eff:{fatigue:-30,fun:10},wage:20,star:1,bath:1,water:'#a6dde8',appeal:5,desc:'발만 담가도 노곤노곤'},
 fall:{n:'폭포탕',tab:'bath',img:'fall',fp:4,sc:1,cost:22000,price:1400,cap:6,dur:30,eff:{fatigue:-85,fun:25},wage:110,star:4,bath:1,water:'#86e0e6',appeal:20,desc:'쏟아지는 폭포 아래 노천탕'},
 fam:{n:'가족탕',tab:'bath',inside:1,img:'fam',fp:2,sc:1,cost:12000,price:1600,cap:4,dur:26,eff:{fatigue:-60,fun:20},wage:70,star:3,appeal:10,light:[[0.1,-0.5]],desc:'가족끼리 오붓한 전세 욕탕'},
 wine:{n:'와인탕',tab:'bath',img:'wine',fp:2,sc:1,cost:18000,price:1500,cap:3,dur:24,eff:{fatigue:-60,fun:30},wage:90,star:4,bath:1,water:'#8a1f3a',appeal:14,desc:'포도향 가득 레드 와인탕'},
 dango:{n:'당고 노점',tab:'food',img:'dango',fp:2,fph:1,sc:0.96,cost:2000,price:300,cap:2,dur:8,eff:{hunger:-30,fun:10},wage:15,star:1,appeal:4,light:[[0.2,-0.4]],desc:'달콤한 미타라시 당고'},
 sake:{n:'사케 바',tab:'food',img:'sake',fp:2,sc:1,cost:9000,price:1000,cap:3,dur:16,eff:{hunger:-20,fun:40},wage:60,star:2,appeal:8,light:[[0.15,-0.5],[-0.2,-0.4]],night:1,desc:'온천 후 한 잔의 사케'},
 tea:{n:'찻집',tab:'food',img:'tea',fp:2,sc:1,cost:6000,price:600,cap:3,dur:18,eff:{hunger:-25,fun:20},wage:40,star:2,appeal:9,light:[[0.1,-0.45]],desc:'말차와 화과자가 있는 찻집'},
 ice:{n:'빙수 가게',tab:'food',img:'ice',fp:2,fph:1,sc:0.96,cost:3500,price:450,cap:2,dur:10,eff:{hunger:-25,fun:18},wage:25,star:2,appeal:6,desc:'목욕 후 시원한 빙수'},
 ramen:{n:'라멘집',tab:'food',img:'ramen',fp:2,sc:1,cost:4000,price:900,cap:3,dur:15,eff:{hunger:-70,fun:5},wage:45,star:1,appeal:6,light:[[0.15,-0.55],[0.28,-0.3]],desc:'유자 시오 라멘이 명물'},
 teishoku:{n:'정식당',tab:'food',img:'teishoku',fp:2,sc:1,cost:9000,price:1600,cap:4,dur:20,eff:{hunger:-90,fun:10},wage:80,star:2,appeal:8,light:[[0.3,-0.35]],desc:'오늘의 유자 연어 정식'},
 izakaya:{n:'이자카야',tab:'food',img:'izakaya',fp:2,sc:1,cost:16000,price:2200,cap:5,dur:25,eff:{hunger:-50,thirst:-50,fun:40},wage:120,star:3,appeal:10,night:1,light:[[-0.1,-0.6],[0.1,-0.6],[0.3,-0.6]],desc:'밤에 북적이는 선술집'},
 milk:{n:'우유 매점',tab:'shop',img:'milk',fp:2,sc:1,cost:1500,price:250,cap:3,dur:8,eff:{thirst:-70},wage:20,star:1,appeal:4,desc:'목욕 후엔 역시 커피우유'},
 yuzu:{n:'유자차 매점',tab:'shop',img:'yuzu',fp:2,sc:1,cost:2500,price:350,cap:3,dur:8,eff:{thirst:-60,fun:8},wage:25,star:1,appeal:6,desc:'따끈한 유자차 한 잔'},
 gift:{n:'기념품 가게',tab:'shop',img:'gift',fp:2,sc:1,cost:6000,price:1500,cap:3,dur:12,eff:{fun:-0,joy:30},wage:50,star:2,appeal:7,fun:1,light:[[0.2,-0.4]],desc:'카피바라 인형이 인기'},
 shoot:{n:'사격 노점',tab:'shop',img:'shoot',fp:2,fph:1,sc:0.96,cost:3000,price:400,cap:2,dur:10,eff:{fun:45},wage:20,star:1,appeal:6,light:[[0.25,-0.45]],desc:'코르크 총으로 경품을 노려라!'},
 massage:{n:'마사지실',tab:'shop',inside:1,img:'massage',fp:2,sc:1,cost:8000,price:1200,cap:2,dur:20,eff:{fatigue:-75,fun:10},wage:70,star:2,appeal:8,light:[[-0.15,-0.45]],desc:'뭉친 어깨를 꾹꾹'},
 pingpong:{n:'탁구장',tab:'shop',img:'pingpong',fp:2,sc:1,cost:5000,price:300,cap:2,dur:14,eff:{fun:50,fatigue:10},wage:25,star:2,appeal:7,light:[[-0.15,-0.45]],desc:'온천 하면 역시 탁구!'},
 nap:{n:'수면실',tab:'shop',inside:1,img:'nap',fp:2,sc:1,cost:10000,price:800,cap:4,dur:30,eff:{fatigue:-90},wage:50,star:3,appeal:8,light:[[-0.15,-0.45]],desc:'뜨끈하게 몸 지지고 한숨 자기'},
 room:{n:'객실 별채',tab:'shop',img:'room',fp:3,sc:1,cost:12000,price:6000,cap:4,dur:0,eff:{fatigue:-100},wage:90,star:2,appeal:10,stay:1,light:[[-0.2,-0.3],[0.25,-0.3],[0,-0.55]],desc:'밤에 묵어가는 손님용 객실'},
 sakura:{tree:1,n:'벚꽃나무',tab:'deco',img:'sakura',fp:2,sc:1.12,cost:1200,beauty:8,star:1,emit:'petal',desc:'꽃잎이 흩날려요'},
 maple:{tree:1,n:'단풍나무',tab:'deco',img:'maple',fp:2,sc:1.12,cost:1200,beauty:8,star:1,emit:'leaf',desc:'붉은 잎이 떨어져요'},
 pine:{tree:1,n:'눈 내린 소나무',tab:'deco',img:'pine',fp:2,sc:1.02,cost:2000,beauty:10,star:2,emit:'snow',desc:'주변에 눈이 내려요'},
 torii:{n:'토리이',tab:'deco',img:'torii',fp:2,fph:1,sc:1.05,cost:2200,beauty:9,star:1,desc:'붉은 토리이, 신성한 입구'},
 bamboo:{n:'대나무 숲 석등',tab:'deco',img:'bamboo',fp:2,fph:1,sc:1.1,cost:1800,beauty:8,star:1,light:[[0,-0.45]],desc:'바람에 사각이는 대숲'},
 sandgarden:{n:'모래 정원',tab:'deco',img:'sandgarden',fp:2,sc:1,cost:4000,beauty:15,star:2,desc:'갈퀴로 다듬은 고요한 가레산스이'},
 bridge:{n:'붉은 아치 다리',tab:'deco',img:'bridge',fp:2,fph:1,sc:1.18,walk:1,sc:1,cost:5000,beauty:16,star:2,desc:'작은 개울 위 다이코바시'},
 waterwheel:{n:'물레방아',tab:'deco',img:'waterwheel',fp:2,sc:1,cost:6000,beauty:18,star:3,desc:'졸졸 물소리와 함께 도는 물레방아'},
 wisteria:{n:'등나무 정자',tab:'deco',img:'wisteria',fp:2,sc:1.05,cost:4500,beauty:16,star:2,desc:'보랏빛 등꽃 아래 돌벤치'},
 ema:{n:'에마 걸이',tab:'deco',img:'ema',fp:1,fph:2,sc:0.95,cost:1500,beauty:7,star:1,desc:'소원을 적은 나무패'},
 jizo:{n:'지장보살',tab:'deco',img:'jizo',fp:1,sc:0.88,cost:1200,beauty:6,star:1,desc:'빨간 모자의 지장님'},
 tanuki:{n:'너구리 상',tab:'deco',img:'tanuki',fp:1,sc:0.92,cost:1400,beauty:7,star:2,desc:'복을 부르는 너구리'},
 iris:{n:'붓꽃 화단',tab:'deco',img:'iris',fp:2,sc:0.92,cost:800,beauty:6,star:1,desc:'보랏빛 붓꽃이 한가득'},
 lanternpath:{n:'등롱 길',tab:'deco',img:'lanternpath',fp:1,fph:2,sc:0.98,cost:1600,beauty:7,star:2,walk:1,light:[[-0.32,-0.4],[0.35,-0.55]],desc:'두 개의 석등이 밝히는 돌길'},
 andon_lantern:{n:'전통 행등 (안돈)',tab:'deco',img:'andon_lantern',fp:1,sc:0.95,cost:450,beauty:6,star:1,light:[[0,-0.52,[255,210,120],1.15]],desc:'한지 너머로 따뜻한 호박빛이 번지는 목조 전통 행등'},
 takeakari:{n:'대나무 통 조명 (타케아카리)',tab:'deco',img:'takeakari',fp:1,sc:0.96,cost:680,beauty:8,star:1,light:[[0,-0.50,[255,218,115],1.25]],desc:'정교하게 타공된 대나무 통 사이로 황금빛 문양이 피어나요'},
 chochin_tower:{n:'축제 제등 기둥 (야구라 제등)',tab:'deco',img:'chochin_tower',fp:2,fph:1,sc:1.0,cost:1100,beauty:11,star:1,light:[[0,-0.68,[255,150,90],1.35],[0,-0.42,[255,208,118],1.25]],desc:'붉고 따뜻한 제등이 층층이 매달려 밤거리를 환히 밝혀요'},
 kagaribi:{n:'화톳불 화로대 (카가리비)',tab:'deco',img:'kagaribi',fp:1,sc:1.02,cost:1650,beauty:13,star:2,fire:1,light:[[0,-0.62,[255,155,60],1.4]],desc:'무쇠 삼각 화로 위에서 장작불과 불티가 타오르는 전통 화톳불'},
 floating_lanterns:{n:'유등 수반 (토로나가시)',tab:'deco',img:'floating_lanterns',fp:2,sc:1.05,cost:2600,beauty:18,star:2,light:[[-0.18,-0.50,[255,212,118],1.2],[0.18,-0.46,[255,195,105],1.2]],desc:'잔잔한 수반 위에 등불이 둥실 떠다니며 수면을 수놓아요'},
 neon_yu:{n:"온천 'ゆ' 네온 입간판",tab:'deco',img:'neon_yu',fp:2,fph:1,sc:0.95,cost:950,beauty:9,star:1,neon:1,light:[[0,-0.56,[255,95,190],1.25],[0,-0.36,[80,235,255],1.15]],desc:'핑크빛 ゆ 글자와 시안색 온천 마크가 빛나는 쇼와풍 입간판'},
 neon_izakaya:{n:'이자카야 네온 사인탑',tab:'deco',img:'neon_izakaya',fp:1,sc:1.02,cost:2100,beauty:14,star:2,neon:1,light:[[0,-0.72,[255,85,130],1.25],[0,-0.42,[80,230,255],1.2]],desc:'온천 골목의 낭만을 더하는 알록달록 복고풍 네온 사인탑'},
 neon_capy:{n:'카피바라 네온 간판',tab:'deco',img:'neon_capy',fp:2,fph:1,sc:1.0,cost:3400,beauty:20,star:3,neon:1,light:[[0,-0.56,[255,175,90],1.3],[0,-0.34,[85,235,255],1.2]],desc:'유자를 얹고 온천욕을 즐기는 카피바라가 반짝이는 시그니처 네온'},
 lantern:{n:'석등롱',tab:'deco',img:'lantern',fp:1,sc:0.95,cost:600,beauty:5,star:1,light:[[0,-0.55,[255,212,130],1.15]],desc:'밤이면 은은히 빛나요'},
 bamboo_bench:{n:'대나무 쉼터 긴의자',tab:'deco',img:'bamboo_bench',fp:2,fph:1,sc:0.95,cost:550,beauty:6,star:1,seat:1,desc:'청량한 대나무를 엮어 만든 시원한 정원 긴의자'},
 wood_bench:{n:'원목 정원 벤치',tab:'deco',img:'wood_bench',fp:2,fph:1,sc:0.95,cost:680,beauty:7,star:1,seat:1,desc:'따뜻한 편백 원목으로 짠 등받이 정원 벤치'},
 engawa_bench:{n:'붉은 모포 다실 벤치 (코시카케)',tab:'deco',img:'engawa_bench',fp:2,fph:1,sc:0.96,cost:880,beauty:9,star:1,seat:1,light:[[-0.28,-0.32,[255,196,110],0.75]],desc:'붉은 모센(모포) 위에 차와 당고를 곁들인 전통 다실 긴의자'},
 stone_bench:{n:'이끼 정원 돌벤치',tab:'deco',img:'stone_bench',fp:2,fph:1,sc:0.95,cost:1150,beauty:10,star:2,seat:1,desc:'이끼가 은은하게 내려앉은 화강암 정원 돌벤치'},
 parasol_table:{n:'파라솔 야외 테이블 의자',tab:'deco',img:'parasol_table',fp:2,sc:1.02,cost:1900,beauty:14,star:2,seat:1,light:[[0,-0.46,[255,212,128],0.85]],desc:'파라솔 그늘 아래 오붓하게 쉬어가는 야외 원목 테이블과 의자 세트'},
 rocks:{n:'정원석',tab:'deco',img:'rocks',fp:2,sc:0.92,cost:400,beauty:4,star:1,desc:'이끼 낀 정원석'},
 shishi:{set:'trad',n:'시시오도시',tab:'theme',img:'shishi',fp:1,sc:0.95,cost:1800,beauty:9,star:1,sound:'shishi',desc:'딱! 대나무 소리가 정원에 울려요'},
 nodate:{set:'trad',n:'노다테 다과석',tab:'theme',img:'nodate',fp:2,sc:0.95,cost:5000,price:500,cap:3,dur:14,eff:{thirst:-40,fun:20},wage:30,star:2,appeal:8,desc:'붉은 양산 아래 말차 한 잔'},
 pagoda:{set:'trad',n:'석탑',tab:'theme',img:'pagoda',fp:1,sc:1.15,cost:2400,beauty:10,star:2,light:[[0,-0.62]],desc:'이끼 낀 오층 석탑'},
 bamboofence:{set:'trad',n:'대나무 울타리',tab:'theme',img:'bamboofence',fp:2,fph:1,sc:0.95,cost:300,beauty:3,star:1,desc:'정갈하게 엮은 대나무'},
 cafe:{set:'modern',n:'카페 스탠드',tab:'theme',img:'cafe',fp:2,sc:0.95,cost:8000,price:700,cap:3,dur:9,eff:{thirst:-60,fun:12},wage:45,star:2,appeal:9,light:[[0.0,-0.45]],desc:'갓 내린 유자 라테'},
 lamppost:{set:'modern',n:'모던 가로등',tab:'theme',img:'lamppost',fp:1,sc:1.08,cost:900,beauty:4,star:2,light:[[0.28,-0.9]],desc:'따뜻한 전구색 가로등'},
 olive:{set:'modern',tree:1,n:'올리브 화분',tab:'theme',img:'olive',fp:1,sc:1.02,cost:1500,beauty:7,star:2,desc:'은빛 잎이 바람에 살랑'},
 lounger:{set:'modern',n:'선베드',tab:'theme',img:'lounger',fp:1,fph:2,sc:0.98,cost:1200,beauty:6,star:3,seat:1,desc:'탕 옆에서 낮잠 한숨'},
 cedar:{set:'forest',tree:1,n:'신목 삼나무',tab:'theme',img:'cedar',fp:2,sc:1.05,cost:3500,beauty:14,star:2,desc:'금줄을 두른 오래된 삼나무'},
 mushroom:{set:'forest',n:'숲 버섯',tab:'theme',img:'mushroom',fp:1,sc:0.92,cost:500,beauty:5,star:1,desc:'밤이면 반딧불이 모여요'},
 fern:{set:'forest',tree:1,n:'고사리 덤불',tab:'theme',img:'fern',fp:2,fph:1,sc:0.95,cost:400,beauty:4,star:1,desc:'촉촉한 숲의 초록'},
 birdhouse:{set:'forest',n:'새집',tab:'theme',img:'birdhouse',fp:1,sc:0.95,cost:800,beauty:5,star:2,desc:'참새가 놀러 와요'},
 snowman:{set:'season',sea:3,n:'눈사람',tab:'theme',img:'snowman',fp:1,sc:0.95,cost:700,beauty:5,star:2,desc:'겨울엔 아름다움 두 배'},
 hydrangea:{set:'season',sea:1,tree:1,n:'수국',tab:'theme',img:'hydrangea',fp:2,fph:1,sc:0.98,cost:900,beauty:6,star:2,desc:'여름엔 아름다움 두 배'},
 tsukimi:{set:'season',sea:2,n:'달맞이 상',tab:'theme',img:'tsukimi',fp:1,sc:0.95,cost:1100,beauty:6,star:3,desc:'가을엔 아름다움 두 배'},
 kadomatsu:{set:'season',sea:0,n:'카도마츠',tab:'theme',img:'kadomatsu',fp:1,sc:0.98,cost:1300,beauty:6,star:3,desc:'봄(새해)엔 아름다움 두 배'},
 banner:{photo:'banner',flutter:1,n:'사진 노보리 깃발',tab:'custom',img:null,ic:'🎏',fp:1,sc:1.05,cost:800,beauty:6,star:1,desc:'내 사진으로 만든 픽셀 깃발'},
 frame:{photo:'frame',n:'사진 액자 이젤',tab:'custom',img:null,ic:'🖼️',fp:1,sc:0.95,cost:1000,beauty:7,star:1,desc:'내 사진을 픽셀 그림으로'},
 noren:{photo:'noren',flutter:1,n:'사진 노렌 문틀',tab:'custom',img:null,ic:'🎐',fp:2,fph:1,sc:0.92,cost:1500,beauty:8,star:1,desc:'바람에 살랑이는 내 사진 노렌'},
 sign:{photo:'sign',n:'사진 간판',tab:'custom',img:null,ic:'🪧',fp:2,fph:1,sc:0.85,cost:1200,beauty:7,star:1,desc:'료칸 앞 나만의 간판'},
 gate:{n:'대문',img:'gate',fp:1,cost:0,star:9,walk:1,gate:1,light:[[-0.33,-0.42],[0.22,-0.3]],desc:'손님이 드나드는 유일한 입구'},
 path:{n:'돌길',tab:'deco',img:null,ic:'🪨',fp:1,cost:50,beauty:1,star:1,isPath:1,desc:'드래그해서 칠하세요'},
 path_wood:{n:'나무 데크길',tab:'deco',img:null,ic:'🪵',fp:1,cost:80,beauty:2,star:1,isPath:1,desc:'따뜻한 나무 데크'},
 path_gravel:{n:'자갈길',tab:'deco',img:null,ic:'⚪',fp:1,cost:30,beauty:1,star:1,isPath:1,desc:'사각사각 자갈길'},
 path_tatami:{n:'다다미 회랑',tab:'deco',img:null,ic:'🟩',fp:1,cost:150,beauty:3,star:2,isPath:1,desc:'료칸 느낌의 회랑'},
 pond:{n:'비단잉어 연못',tab:'deco',img:null,ic:'🐟',fp:3,cost:3000,beauty:14,star:1,flat:1,pond:1,desc:'잉어가 헤엄치고 연잎이 떠 있어요'},
 path_erase:{n:'길 지우기',tab:'deco',img:null,ic:'🧽',fp:1,cost:0,star:1,erase:1,desc:'드래그해서 길 제거 (50% 환불)'},
};
// ---- 3~5★ 확장: 새 그림 없이 기존 그림 재활용 ----
// 탕: like=바탕 탕(좌석·수면 모양 공유), tint=수면에 입히는 물빛, wfx=수면 효과 / 장식: from=원본 그림, recolor=색조 변형 방식
Object.assign(DEF,{
 sulfur:{n:'유황천 노천탕',tab:'bath',like:'rock',img:'sulfur',wrec:{h:78,sk:0.55,sa:0.05,vk:1.05},fp:4,sc:1,cost:13000,price:1000,cap:5,dur:30,eff:{fatigue:-80,fun:16},wage:90,star:3,bath:1,water:'#cfe0a6',tint:[206,224,150],veil:0.22,appeal:16,desc:'은은한 유황 향의 연둣빛 노천탕'},
 soda:{n:'탄산 히노키탕',tab:'bath',like:'hinoki',img:'soda',wrec:{h:188,sk:0.55,sa:0,vk:1.12},fp:2,sc:1,cost:9000,price:800,cap:2,dur:24,eff:{fatigue:-65,fun:20},wage:60,star:3,bath:1,water:'#aee6ee',tint:[160,226,240],wfx:'bubble',appeal:12,desc:'톡톡 기포가 올라오는 탄산천'},
 iron:{n:'적탕 (철분천)',tab:'bath',like:'cave',img:'iron',wrec:{h:18,sk:0.9,sa:0.15,vk:0.8},fp:4,sc:1,cost:19000,price:1300,cap:5,dur:30,eff:{fatigue:-90,fun:20},wage:120,star:4,bath:1,water:'#b8673f',tint:[184,96,58],appeal:18,light:[[0,-0.5]],desc:'철분이 녹아든 붉은빛 온천'},
 petal:{n:'꽃잎탕',tab:'bath',like:'rock',img:'petal',wrec:{h:345,sk:0.55,sa:0.06,vk:1.08},fp:4,sc:1,cost:20000,price:1400,cap:5,dur:30,eff:{fatigue:-80,fun:30},wage:110,star:4,bath:1,water:'#f3c6d2',tint:[242,176,196],wfx:'petal',appeal:20,desc:'분홍 꽃잎이 둥실 떠다니는 노천탕'},
 matcha:{n:'녹차 대욕장',tab:'bath',like:'milky',img:'matcha',wrec:{h:84,sk:1,sa:0.3,vk:0.9},fp:4,sc:1,cost:26000,price:1700,cap:6,dur:30,eff:{fatigue:-90,fun:28},wage:130,star:5,bath:1,water:'#9fc27a',tint:[150,196,110],veil:0.12,appeal:22,desc:'쌉싸름한 녹차 향이 감도는 대욕장'},
 starlight:{n:'별빛 노천탕',tab:'bath',like:'fall',img:'starlight',wrec:{h:228,sk:0.85,sa:0.15,vk:0.62},fp:4,sc:1,cost:32000,price:2000,cap:6,dur:30,eff:{fatigue:-95,fun:35},wage:140,star:5,bath:1,water:'#3a4f8f',tint:[70,92,170],wfx:'star',appeal:26,desc:'밤이면 수면에 별이 반짝이는 노천탕'},
 ginkgo:{tree:1,n:'은행나무',tab:'deco',img:'ginkgo',from:'maple',recolor:'ginkgo',fp:2,sc:1.12,cost:2400,beauty:10,star:3,emit:'gleaf',desc:'노란 은행잎이 팔랑팔랑 떨어져요'},
 ume:{tree:1,n:'매화나무',tab:'deco',img:'ume',from:'sakura',recolor:'ume',fp:2,sc:1.12,cost:2400,beauty:10,star:3,emit:'ume',desc:'하얀 매화가 소담하게 피었어요'},
 wisteria_w:{n:'흰 등나무 정자',tab:'deco',img:'wisteria_w',from:'wisteria',recolor:'white',fp:2,sc:1.05,cost:7000,beauty:20,star:4,desc:'하얀 등꽃이 늘어진 정자'},
 torii_gold:{n:'금빛 토리이',tab:'deco',img:'torii_gold',from:'torii',recolor:'gold',fp:2,fph:1,sc:1.05,cost:9000,beauty:22,star:5,desc:'노을빛을 머금은 금빛 토리이'},
});

const TABS=[['bath','♨️','탕'],['food','🍜','음식'],['shop','🏮','상점'],['deco','🌸','장식'],['theme','🎐','테마'],['custom','📷','사진']];
function fpOf(k,rot){const d=DEF[k];if(!d)return[1,1];const w=d.fp||1,h=d.fph||w;return(rot&1)?[h,w]:[w,h]}window.fpOf=fpOf;
const SETS={trad:['전통','⛩️',['shishi','nodate','pagoda','bamboofence']],modern:['모던','☕',['cafe','lamppost','olive','lounger']],forest:['숲','🌲',['cedar','mushroom','fern','birdhouse']],season:['계절','🍂',['snowman','hydrangea','tsukimi','kadomatsu']]};
const setsDone=()=>Object.keys(SETS).filter(k=>SETS[k][2].every(i=>S.objs.some(o=>o.k==i)));
const bMul=d=>d.sea!=null&&d.sea==season()?2:1;
const TIPS={bath:'탕은 손님의 피로를 풀어주고 만족도를 높여요.',food:'배고픈 손님은 식당을 찾아가요. 가격은 시설을 눌러 조절하세요.',shop:'목마른 손님은 매점으로 향하고, 밤에는 객실에 묵어가요.',deco:'장식은 주변 분위기를 바꾸고 료칸의 아름다움을 높여요.',custom:'사진을 올리면 픽셀 아트로 변환해 나만의 장식을 만들어요.',theme:'같은 테마 4종을 모두 배치하면 세트 보너스(평판 점수 +15)를 받아요.'};
const SEASONS=['봄','여름','가을','겨울'],SEMO=['🌸','🌻','🍁','❄️'],STEMP=[16,27,14,-1];
const NEEDK=['fatigue','hunger','thirst','fun'],NEEDN={fatigue:'피로',hunger:'배고픔',thirst:'목마름',fun:'재미'};
// ===== 상태 =====
let S;let paused=false;
const SLOT=(()=>{const n=+localStorage.onsenSlot||1;return n>=1&&n<=3?n:1})();const SKEY=SLOT==1?'onsen2':'onsen2_s'+SLOT;
window.READONLY=false;
function fresh(){
 const plots={};plots[START_PLOT.join(',')]=1;
 const o=[];const b=(k,x,y)=>o.push({k,x,y,lv:1,price:DEF[k].price||0,uses:0,earn:0});
 b('rock',22,21);b('lantern',21,26);b('sakura',26,22);b('maple',18,22);b('rocks',20,21);b('lantern',25,26);for(let j=25;j<32;j++)b('path',24,j);for(let i=19;i<30;i++)if(i!=24)b('path',i,28);
 return {layout:16,ryokanName:"유자향 카피바라 료칸",yen:8000,min:8*60+40,plots,objs:o,fin:{inc:0,exp:0,hist:[]},rep:55,t:Date.now(),served:0,ver:2};
}
window.fresh=fresh;
window.applyState=function(newS,ro){
 window.READONLY=!!ro;
 S=JSON.parse(JSON.stringify(newS));
 S.objs=(S.objs||[]).filter(o=>o&&DEF[o.k]);
 S.objs.forEach(o=>o.users=0);
 if(!isFinite(S.yen))S.yen=8000;
 migrateLayout();migrate();OCC=occ();ensureGate();OCC=occ();
 groundDirty=true;ghost=null;moving=null;paint=null;hideInfo();
 guests=[];parts=[];floats=[];bubbles=[];
 for(let i=0;i<5;i++)spawn();guests.forEach((g,i)=>{g.x-=i*0.3});
 if(ro)warmUp();
 const b=S.objs.find(o=>DEF[o.k].bath)||S.objs[0];
 if(b){const[bfw,bfh]=fpOf(b.k,b.rot);focus(b.x+bfw/2,b.y+bfh/2,VW>820?5.2:3.6)}
 buildTabs();buildCards();hud();
 if(window.QX&&QX.render)QX.render();
};
function load(){
 if(window.VISIT_SAVE){S=window.VISIT_SAVE;window.READONLY=true;return}
 try{const raw=localStorage[SKEY];let d=null;try{d=JSON.parse(raw||'null')}catch(e){localStorage[SKEY+'_corrupt']=raw;setTimeout(()=>toast('저장 파일이 손상되어 백업 후 새로 시작했어요'),1500)}
  if(d&&d.ver==2&&Array.isArray(d.objs)&&d.plots){S=d;d.objs=d.objs.filter(o=>o&&DEF[o.k]);if(!isFinite(S.yen))S.yen=0;
   const off=Math.min((Date.now()-d.t)/1000,8*3600);
   const hr=avgNet();const g=Math.floor(Math.max(0,hr)*(off/3600)*0.5);
   if(off>60&&g>0){S.yen+=g;setTimeout(()=>toast(`쉬는 동안 ${fmt(g)}엔 벌었어요! (${Math.floor(off/60)}분)`),800)}
   return}}catch(e){}
 S=fresh();
}
// 탭을 숨겨둔 동안: 화면 갱신이 멈춰 게임이 정지하므로, 돌아오면 껐다 켰을 때와 같은 방식(평균 순이익의 50%, 최대 8시간)으로 정산
let _hidAt=0;document.addEventListener('visibilitychange',()=>{if(window.READONLY||!S)return;if(document.hidden){_hidAt=Date.now();return}if(!_hidAt)return;
 const off=Math.min((Date.now()-_hidAt)/1000,8*3600);_hidAt=0;const g=Math.floor(Math.max(0,avgNet())*(off/3600)*0.5);
 if(off>60&&g>0){S.yen+=g;toast(`쉬는 동안 ${fmt(g)}엔 벌었어요! (${Math.floor(off/60)}분)`);save()}});
function migrateLayout(){if(S.layout==16)return;const old=Object.keys(S.plots).length-1;let ref=0;
 for(const k in S.plots)if(k!='1,1')ref+=12000;S.plots={'1,1':1};S.yen+=ref;
 for(const o of S.objs){o.x=o.x-8+20;o.y=o.y-8+20}S.layout=16;if(ref)setTimeout(()=>toast(`구역이 16×16으로 커졌어요! 추가 구역 비용 ¥${fmt(ref)} 환불`),2000)}
function migrate(){for(const o of S.objs)o.rot=(o.rot|0)&1; // 겹치거나 잠긴 땅의 건물 → 재배치 또는 환불
 const keep=[],m={};let moved=0,refund=0;const fits=(o,x,y)=>{const[fw,fh]=fpOf(o.k,o.rot);for(let i=0;i<fw;i++)for(let j=0;j<fh;j++){if(!tileOpen(x+i,y+j)||m[(x+i)+','+(y+j)])return false}return true};
 const sorted=S.objs.filter(o=>DEF[o.k]).sort((a,b)=>(DEF[b.k].bath?1:0)-(DEF[a.k].bath?1:0)||(DEF[b.k].fp*(DEF[b.k].fph||DEF[b.k].fp))-(DEF[a.k].fp*(DEF[a.k].fph||DEF[a.k].fp)));
 for(const o of sorted){if(o.k=='gate'){keep.push(o);for(const[x,y]of tilesOf(o))m[x+','+y]=1;continue}let ok=fits(o,o.x,o.y);if(!ok&&!DEF[o.k].isPath){let best=null;for(let r=1;r<10&&!best;r++)for(let dx=-r;dx<=r&&!best;dx++)for(let dy=-r;dy<=r;dy++)if(fits(o,o.x+dx,o.y+dy)){best=[o.x+dx,o.y+dy];break}
   if(best){o.x=best[0];o.y=best[1];ok=true;moved++}}
  if(ok){const[fw,fh]=fpOf(o.k,o.rot);for(let i=0;i<fw;i++)for(let j=0;j<fh;j++)m[(o.x+i)+','+(o.y+j)]=1;keep.push(o)}else{refund+=DEF[o.k].cost;S.yen+=DEF[o.k].cost}}
 S.objs=keep;if((moved||refund)&&!window.READONLY)setTimeout(()=>toast(`겹친 건물 정리: ${moved}개 이동${refund?`, ¥${fmt(refund)} 환불`:''}`),1200)}
function save(){if(window.READONLY||!S)return;S.t=Date.now();try{localStorage[SKEY]=JSON.stringify(S);window.SAVE&&SAVE.mirror(S)}catch(e){if(!save._w){save._w=1;toast('저장 공간이 부족해요 (사진 장식을 줄여보세요)')}}}
const fmt=n=>Math.floor(n).toLocaleString('ko-KR');
function avgNet(){const h=S.fin.hist;if(!h.length)return 0;const a=h.slice(-24);return a.reduce((s,x)=>s+x,0)/a.length}
// ===== 에셋 =====
const TIERED=['rock','hinoki','sauna','milky','ramen','teishoku','izakaya','milk','yuzu','gift','room','cave','foot','fall','fam','wine','dango','sake','tea','ice','shoot','massage','pingpong','nap'];
const IMG={},VAR=new Proxy({},{get(t,k){if(typeof k!='string')return t[k];if(t[k])return t[k];if(k.includes('~m')){const src=VAR[k.replace('~m','')];if(!src)return undefined;return t[k]={base:src.base,get sil(){return src.sil},get rimL(){return src.rimR},get rimR(){return src.rimL},m:1}}if(IMG[k]){variants(k,IMG[k]);return t[k]}return undefined}}); // 지연 생성 + 좌우반전 캔버스 공유
const NAMES=[...TIERED.flatMap(n=>[1,2,3,4,5].flatMap(l=>[n+'_lv'+l])),'rock','hinoki','sauna','milky','ramen','teishoku','izakaya','milk','yuzu','gift','room','cave','foot','fall','fam','wine','dango','sake','tea','ice','shoot','massage','pingpong','nap','ema','jizo','tanuki','iris','lanternpath','sakura','maple','pine','lantern','torii','bamboo','sandgarden','bridge','waterwheel','wisteria','rocks','shishi','nodate','pagoda','bamboofence','cafe','lamppost','olive','lounger','cedar','mushroom','fern','birdhouse','snowman','hydrangea','tsukimi','kadomatsu','cb1','cb2','cb3','cb4','cw1','cw2','cw3','cw4','gate','andon_lantern','takeakari','chochin_tower','kagaribi','floating_lanterns','neon_yu','neon_izakaya','neon_capy','bamboo_bench','wood_bench','engawa_bench','stone_bench','parasol_table'];
// 색조 변형: 원본 그림의 특정 색 영역만 HSV로 바꿈 (캔버스 filter는 Safari 지원이 불확실해 픽셀 단위로 처리)
const TINTURL={};window.TINTURL=TINTURL;window.SPRURL=(src,k)=>TINTURL[k]||TINTURL[src]||'assets/'+src+'.png';
function rgb2hsv(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){h=mx==r?((g-b)/d)%6:mx==g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}return[h,mx?d/mx:0,mx]}
function hsv2rgb(h,s,v){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;const[r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return[(r+m)*255,(g+m)*255,(b+m)*255]}
const RECOLOR={
 ginkgo:(h,s,v)=>(h>=330||h<=45)&&s>0.4&&v>0.35?[42+((h+30)%360)*0.12,Math.min(1,s*0.95),Math.min(1,v*1.1)]:null,
 ume:(h,s,v)=>(h>=290||h<=20)&&s>0.06&&v>0.5?[h,s*0.22,Math.min(1,v*1.08)]:null,
 white:(h,s,v)=>h>=225&&h<=320&&s>0.12?[h,s*0.14,Math.min(1,v*1.18)]:null,
 gold:(h,s,v)=>(h>=340||h<=25)&&s>0.42?[42,Math.min(1,s*0.8+0.08),Math.min(1,v*1.15)]:null};
function recolor(src,fn){const c=mk(src.width,src.height),x=c.getContext('2d');x.drawImage(src,0,0);const id=x.getImageData(0,0,c.width,c.height),p=id.data;
 for(let i=0;i<p.length;i+=4){if(p[i+3]<10)continue;const[h,s,v]=rgb2hsv(p[i],p[i+1],p[i+2]),o=fn(h,s,v);if(!o)continue;const[r,g,b]=hsv2rgb(o[0]%360,o[1],o[2]);p[i]=r;p[i+1]=g;p[i+2]=b}x.putImageData(id,0,0);return c}
const SPRALIAS={};window.SPRALIAS=SPRALIAS;
// 물 픽셀 선택: 청록(바위·동굴·폭포·히노키) / 크림(유백) → 명암·질감은 유지하고 색만 옮김
function waterFn(like,w){const cream=like=='milky';return(h,s,v)=>{const isW=cream?(h>=25&&h<=75&&s<0.24&&v>0.76):(h>=158&&h<=208&&s>0.14&&v>0.28);if(!isW)return null;
  return[(w.h+(h-(cream?50:182))*0.3+360)%360,Math.min(1,Math.max(0,s*w.sk+w.sa)),Math.min(1,v*w.vk)]}}
function makeVariants(){const W=window.WATER||{};for(const[k,d]of Object.entries(DEF)){try{
  if(d.from&&d.recolor&&IMG[d.from]&&!IMG[d.img]){IMG[d.img]=recolor(IMG[d.from],RECOLOR[d.recolor]);TINTURL[d.img]=IMG[d.img].toDataURL()}
  if(d.like&&d.wrec&&!IMG[k+'_lv1']){const fn=waterFn(d.like,d.wrec);if(IMG[d.like])IMG[k]=recolor(IMG[d.like],fn);
   for(let l=1;l<=5;l++){const b=d.like+'_lv'+l,n=k+'_lv'+l;if(!IMG[b])continue;IMG[n]=recolor(IMG[b],fn);SPRALIAS[n]=b;if(W[b])W[n]=W[b];if(OVER[b]!=null)OVER[n]=OVER[b];if(window.LIGHTS&&LIGHTS[b])LIGHTS[n]=LIGHTS[b]}
   if(IMG[k+'_lv1'])TINTURL[k]=IMG[k+'_lv1'].toDataURL()}
 }catch(e){console.warn('[variant]',k,e)}}}
function loadImgs(){return Promise.all(NAMES.map(n=>new Promise(r=>{const i=new Image();i.onload=()=>{IMG[n]=i;r()};i.onerror=r;i.src='assets/'+n+'.png'})))}
// 멀티 레이어 스프라이트: 마스크 경로 순서대로 픽셀을 잘라 레이어로 분리 (나머지 = ground)
const roofY=(x,W,H)=>H*(0.294+0.144*x/W);
const GATE_MASKS=[
 ['roof',(g,W,H)=>{g.moveTo(0,0);g.lineTo(W,0);g.lineTo(W,roofY(W,W,H));g.lineTo(0,roofY(0,W,H));g.closePath()}],
 ['noren',(g,W,H)=>{g.moveTo(W*0.274,0);g.lineTo(W*0.64,0);g.lineTo(W*0.64,H*0.6);g.lineTo(W*0.274,H*0.6);g.closePath()}],
 ['front',(g,W,H)=>g.rect(W*0.625,0,W,H)],
 ['back',(g,W,H)=>g.rect(0,0,W*0.41,H*0.8)]];
const OVER={rock_lv5:0.5,milky_lv5:0.45,hinoki_lv5:0.55};
function splitLayers(img,masks){const W=img.width,H=img.height,rest=mk(W,H),r=rest.getContext('2d');r.drawImage(img,0,0);const out={};
 for(const[n,path]of masks){const c=mk(W,H),g=c.getContext('2d');g.drawImage(rest,0,0);g.globalCompositeOperation='destination-in';g.beginPath();path(g,W,H);g.fill();out[n]=c;
  r.globalCompositeOperation='destination-out';r.beginPath();path(r,W,H);r.fill();r.globalCompositeOperation='source-over'}
 out.ground=rest;return out}
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function gradeSprite(bx,w,h){
 const id=bx.getImageData(0,0,w,h),d=id.data;
 for(let i=0;i<d.length;i+=4){
  if(d[i+3]<12)continue;
  let r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255;
  // S-curve contrast (zero milky midtones)
  const sc=v=>{const s=v<0.5?2*v*v:1-2*(1-v)*(1-v);return v*0.74+s*0.26};
  r=sc(r);g=sc(g);b=sc(b);
  // Vibrance / saturation boost (+24%)
  const l=0.299*r+0.587*g+0.114*b;
  const sat=1.24;
  r=l+(r-l)*sat;g=l+(g-l)*sat;b=l+(b-l)*sat;
  // Split-tone: cool deep indigo-plum shadows (#2b2844) & warm butter-cream highlights (#fff1c2)
  const sh=Math.max(0,(0.46-l)/0.46),hi=Math.max(0,(l-0.54)/0.46);
  r+=hi*0.045-sh*0.045;
  g+=hi*0.025-sh*0.052;
  b-=hi*0.042-sh*0.075;
  d[i]=Math.max(0,Math.min(255,Math.round(r*255)));
  d[i+1]=Math.max(0,Math.min(255,Math.round(g*255)));
  d[i+2]=Math.max(0,Math.min(255,Math.round(b*255)));
 }
 bx.putImageData(id,0,0);
}
function variants(key,img,filter){ // 실루엣/림라이트 지연 반해상도 생성 + 해상도 상한(OOM 방지) + 레퍼런스 색감 그레이딩
 const MAX_SPR=160,sc=Math.min(1,MAX_SPR/Math.max(img.width||1,img.height||1)),w=Math.max(1,Math.round(img.width*sc)),h=Math.max(1,Math.round(img.height*sc)),base=mk(w,h),bx=base.getContext('2d');if(filter)bx.filter=filter;bx.drawImage(img,0,0,w,h);if(filter)bx.filter='none';
 gradeSprite(bx,w,h);
 const sw=Math.max(1,w>>1),sh=Math.max(1,h>>1);let _sil=null,_rimL=null,_rimR=null;
 const rim=(dx)=>{const c=mk(sw,sh),g=c.getContext('2d');g.drawImage(base,0,0,sw,sh);g.globalCompositeOperation='destination-out';g.drawImage(base,dx*0.5,1.5,sw,sh);g.globalCompositeOperation='source-in';g.fillStyle='#ffeba8';g.fillRect(0,0,sw,sh);return c};
 VAR[key]={base,get sil(){if(!_sil){_sil=mk(sw,sh);const s=_sil.getContext('2d');s.drawImage(base,0,0,sw,sh);s.globalCompositeOperation='source-in';s.fillStyle='#1e1a36';s.fillRect(0,0,sw,sh)}return _sil},get rimL(){return _rimL||(_rimL=rim(3))},get rimR(){return _rimR||(_rimR=rim(-3))}};
}
// ===== 카메라 =====
let DPR=1,VW=0,VH=0;const cam={x:0,y:0,z:3.2,tz:3.2};
let TDPR=1;function resize(){TDPR=Math.min(1.25,window.devicePixelRatio||1);DPR=window.GFX_LOW?Math.min(1,TDPR)*0.6:Math.min(TDPR,Math.sqrt(3.2e6/(innerWidth*innerHeight)))*(window.WSCALE||1);VW=innerWidth;VH=innerHeight;for(const c of[cv,tc]){const d=c===tc?TDPR:DPR;c.width=Math.round(VW*d);c.height=Math.round(VH*d);c.style.width=VW+'px';c.style.height=VH+'px'}}
const iso=(x,y)=>[(x-y)*TW/2,(x+y)*TH/2];
function toScreen(wx,wy){return[(wx*cam.z+cam.x),(wy*cam.z+cam.y)]}
function toTile(sx,sy){const wx=(sx-cam.x)/cam.z,wy=(sy-cam.y)/cam.z;return[(wy/(TH/2)+wx/(TW/2))/2,(wy/(TH/2)-wx/(TW/2))/2]}
function focus(tx_,ty_,z){if(z)cam.z=cam.tz=z;const[wx,wy]=iso(tx_,ty_);cam.x=VW*(VW>820?0.42:0.5)-wx*cam.z;cam.y=VH*(VW>820?0.5:0.33)-wy*cam.z}
const zmin=()=>Math.min(0.5,Math.min(VW/(N*TW+60),VH/(N*TH+80))*0.95);
function zoomAt(sx,sy,z){z=Math.max(zmin(),Math.min(8,z));cam.x=sx-(sx-cam.x)*z/cam.z;cam.y=sy-(sy-cam.y)*z/cam.z;cam.z=z}
// ===== 구역 =====
const plotOf=(x,y)=>[Math.floor(x/PS),Math.floor(y/PS)];
const plotOpen=(px,py)=>!!S.plots[px+','+py];
const tileOpen=(x,y)=>x>=0&&y>=0&&x<N&&y<N&&plotOpen(...plotOf(x,y));
function plotPrice(px,py){const d=Math.abs(px-START_PLOT[0])+Math.abs(py-START_PLOT[1]);return d<=1?20000:90000}
function plotAdj(px,py){return [[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>plotOpen(px+a,py+b))}
const anims={};
// ===== 지면 (오프스크린 픽셀 텍스처) =====
let ground=null,groundDirty=true;
function rng(s){return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function buildGround(){
 const W=N*TW+8,H=N*TH+40;if(!ground)ground=mk(W,H);const g=ground.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);const ox=N*TW/2+4;
 const pathMap={};S.objs.forEach(o=>{if(DEF[o.k].isPath)pathMap[o.x+','+o.y]=o.k});
 const near=new Set();for(const o of S.objs){const d=DEF[o.k],[fw,fh]=fpOf(o.k,o.rot);if(fw*fh>=4&&!d.tree&&o.k!='rocks'&&o.k!='iris'&&o.k!='floating_lanterns')for(let x=o.x-1;x<=o.x+fw;x++)for(let y=o.y-1;y<=o.y+fh;y++)near.add(x+','+y)}
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const[ix,iy]=iso(x,y);const X=ox+ix,Y=iy;
  const key=x+','+y,pk=pathMap[key],cob=!pk&&near.has(key);
  const ty=pk||(cob?1:0);
  const tmp=tileTex(ty,(x*7+y*13)%12,(x+y)%2);g.drawImage(tmp,X-TW/2,Y,TW,TH);
  if(pk){ // 오토타일: 돌길·데크길의 따뜻한 크림 하이라이트 & 인디고 그림자 단차
   const tk=pk;
   const T=[X,Y],R=[X+TW/2,Y+TH/2],B=[X,Y+TH],L=[X-TW/2,Y+TH/2];
   const ed={path:'#52465c',path_wood:'#3e2d40',path_gravel:'#685c6e',path_tatami:'#43522c'}[tk]||'#52465c';
   const hi={path:'#fff4c8',path_wood:'#f7cf92',path_gravel:'#faecc0',path_tatami:'#dce298'}[tk]||'#fff4c8';
   const sides=[[[0,-1],L,T,1],[[1,0],T,R,1],[[0,1],R,B,0],[[-1,0],B,L,0]];
   for(const[[dx,dy],a,b,sun]of sides){if(pathMap[(x+dx)+','+(y+dy)]===tk)continue;
    g.lineWidth=1.2;g.strokeStyle=ed;g.beginPath();g.moveTo(a[0],a[1]+0.7);g.lineTo(b[0],b[1]+0.7);g.stroke();
    g.lineWidth=0.8;g.strokeStyle=sun?hi:ed;g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke()}
  }
 }
 window._rivTiles=[];
 // 잔디 음영 패치: 레퍼런스 톤의 깊은 인디고-포레스트 그늘과 따뜻한 햇살 풀빛
 {const r=rng(777);g.save();g.beginPath();g.moveTo(ox,0);g.lineTo(ox+N*TW/2,N*TH/2);g.lineTo(ox,N*TH);g.lineTo(ox-N*TW/2,N*TH/2);g.clip();
  for(let i=0;i<55;i++){const tx=r()*N,ty=r()*N;const[ix,iy]=iso(tx,ty);const R=26+r()*55;const dk=r()<0.52;const gr=g.createRadialGradient(ox+ix,iy,0,ox+ix,iy,R);gr.addColorStop(0,dk?'rgba(32,48,58,0.16)':'rgba(190,214,96,0.11)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.save();g.translate(ox+ix,iy);g.scale(1,0.5);g.translate(-ox-ix,-iy);g.fillRect(ox+ix-R,iy-R,R*2,R*2);g.restore()}g.restore()}
 BUS.emit('groundCache',g,ox);
 groundDirty=false;
}
const TEX={},_tileID=new ImageData(TW*2,TH*2);
function tileTex(cob,vr,par){const key=cob+'_'+vr+'_'+par;const ty=typeof cob=='string'?cob:null;if(TEX[key])return TEX[key];const x=vr,y=vr*3+par;const r=rng(vr*928371+par*1237+(cob?99:7));
  const id=_tileID;id.data.fill(0);
  for(let py=0;py<TH*2;py++)for(let px=0;px<TW*2;px++){
   const dx=Math.abs(px+0.5-TW)/(TW),dy=Math.abs(py+0.5-TH)/(TH);if(dx+dy>1)continue;
   let c;const n=r();
   if(ty=='river'){
    // 레퍼런스 이미지의 선명한 터콰이즈-시안 강물 (#1e8ea6 -> #29bad0 -> #48d6e4)
    const g0=(py/(TH*2))*0.65+(px/(TW*2))*0.35;
    const v=n<0.18?-10:n>0.84?14:0;
    c=[Math.round(28+g0*26+v*0.5),Math.round(158+g0*44+v),Math.round(182+g0*36+v)];
    if(n>0.965)c=[168,242,236];
    else if(n<0.04)c=[22,116,142];
   }
   else if(ty=='bank'){
    // 강변 햇살 받은 크림-샌드 바위턱 & 이끼 (#f7e4ad / #78a248 / #54485e)
    const sx=Math.floor((px+py*2)/8),sy=Math.floor((px-py*2+140)/8);
    const seam=((px+py*2)%8==0)||((px-py*2+140)%8==0);
    const moss=((sx*5+sy*9+vr)%7)<2;
    if(seam)c=[76,66,88];
    else if(moss){const v=n<0.3?-12:10;c=[106+v,152+v,66+v*0.5]}
    else{const v=((sx*7+sy*13+vr)%4)*6;c=[248-v-n*8,226-v-n*9,172-v-n*10]}
   }
   else if(ty=='path'){
    // 돌길: 레퍼런스 이미지의 햇살 머금은 따뜻한 버터-크림/골드 샌드스톤 + 인디고-슬레이트 줄눈
    const sx=Math.floor((px+py*2)/8),sy=Math.floor((px-py*2+140)/8);
    const seam=((px+py*2)%8==0)||((px-py*2+140)%8==0);
    const bev=!seam&&(((px+py*2)%8==1)||((px-py*2+140)%8==1));
    const v=((sx*7+sy*13+x*3+y*5)%5)*5;
    if(seam)c=[92,80,100];
    else if(bev)c=[255,246,208];
    else c=[250-v-n*8,230-v*1.1-n*9,176-v*1.3-n*10];
   }
   else if(ty=='path_wood'){
    // 나무 데크길 & 다리: 따뜻한 허니-오크 원목 + 인디고-브라운 틈새
    const pl=Math.floor((px-py*2+200)/9);const seam=(px-py*2+200)%9==0;const v=(pl*37+vr)%4*7;
    c=seam?[68,50,64]:[222+v-n*12,166+v*0.7-n*10,102+v*0.4-n*8];if(!seam&&n>0.96)c=[246,206,142]
   }
   else if(ty=='path_gravel'){
    // 자갈길: 따뜻한 골든 크림 모래와 자갈
    const v=n<0.25?-16:n>0.82?14:0;
    c=[244+v*0.7,224+v*0.8,176+v];if(n>0.95)c=[112,98,114];else if(n<0.06)c=[255,246,212]
   }
   else if(ty=='path_tatami'){const bx=(px+py*2)%32<2||(px-py*2+256)%64<2;c=bx?[64,74,38]:[214+((px*3+py)%5)-n*8,204-n*8,136-n*6];if(!bx&&(px+py*2)%3==0)c=[c[0]-10,c[1]-10,c[2]-8]}
   else if(cob){
    // 시설 주변 마당: 회색 콘크리트 대신 따뜻한 크림 디딤돌과 생생한 이끼 잔디의 조화
    const sx=Math.floor((px+py*2)/9),sy=Math.floor((px-py*2+140)/9);
    const isStone=((sx*11+sy*7+vr)%5)<2&&((px+py*2)%9>1)&&((px-py*2+140)%9>1);
    if(isStone){const v=((sx+sy)%3)*6;c=[244-v-n*8,224-v-n*8,174-v-n*8]}
    else{const v=n<0.15?-12:n>0.85?16:0;c=[104+v*0.7,150+v*0.85,64+v*0.5]}
   }
   else{
    // 잔디: 레퍼런스 이미지의 깊고 풍부한 모스 그린 & 햇살 받은 올리브-메도우 그린 + 단풍잎 포인트
    const v=n<0.12?24:n<0.28?-14:0;
    const leaf=n>0.996,fl=n>0.992&&!leaf;
    if(leaf)c=par?[242,104,48]:[247,162,58];
    else if(fl)c=[255,242,190];
    else if(n>0.97)c=[154,192,82];
    else if(n<0.04)c=[66,104,58];
    else c=[100+v*0.75+par*3,146+v*0.85,62+v*0.45];
   }
   const i=(py*TW*2+px)*4;id.data[i]=c[0];id.data[i+1]=c[1];id.data[i+2]=c[2];id.data[i+3]=255;}
  const tmp=mk(TW*2,TH*2);tmp.getContext('2d').putImageData(id,0,0);return TEX[key]=tmp}
// ===== 오브젝트 =====
const occ=()=>{const m={};for(const o of S.objs){if(o===moving)continue;for(const[x,y]of tilesOf(o))m[x+','+y]=o}return m};
const tierOf=lv=>Math.max(1,Math.min(5,lv|0));
function skey(o){if(o.k=='gate')return o.dir=='y'?'gate_f':'gate';if(DEF[o.k].photo){const pk='pic_'+o.k+'_'+(o.pic||''),r=VAR[pk]?pk:o.k;return(o.rot&1)?r+'~m':r}const d=DEF[o.k],b=d.img,k=b+'_lv'+tierOf((o.lv||1)-(o.build&&o.build.t<0.9?1:0)),r=(d.price&&VAR[k])?k:(b||o.k);return(o.rot&1)?r+'~m':r}
const gTiles=(x,y,dir)=>dir=='x'?[[x,y],[x+1,y],[x+2,y]]:[[x,y],[x,y+1],[x,y+2]];
function tilesOf(o){if(o.k=='gate')return gTiles(o.x,o.y,o.dir);const[fw,fh]=fpOf(o.k,o.rot),t=[];for(let i=0;i<fw;i++)for(let j=0;j<fh;j++)t.push([o.x+i,o.y+j]);return t}
function gateOut(x,y,dir){const t=gTiles(x,y,dir);const cand=dir=='x'?[[0,1],[0,-1]]:[[1,0],[-1,0]];for(const[a,b]of cand)if(t.every(([u,v])=>!tileOpen(u+a,v+b)))return[a,b];return null}
function gateValid(x,y,dir){const t=gTiles(x,y,dir);if(!t.every(([u,v])=>tileOpen(u,v)&&(!OCC[u+','+v]||DEF[OCC[u+','+v].k].isPath)))return false;return !!gateOut(x,y,dir)}
function gateSpot(hx,hy){let best=null,bd=1e9;for(let dx=-5;dx<=5;dx++)for(let dy=-5;dy<=5;dy++)for(const dir of['x','y']){const x=hx+dx,y=hy+dy;if(!gateValid(x,y,dir))continue;const m=gTiles(x,y,dir)[1];const d=Math.hypot(m[0]-hx,m[1]-hy);if(d<bd){bd=d;best={x,y,dir}}}return best}
const gateObj=()=>S.objs.find(o=>o.k=='gate');
function gateInfo(){const g=gateObj();if(!g)return null;const t=gTiles(g.x,g.y,g.dir);return{m:t[1],o:gateOut(g.x,g.y,g.dir)||(g.dir=='x'?[0,1]:[1,0])}}
function ensureGate(){if(gateObj())return;OCC=occ();let sp=null,bd=1e9;for(let x=0;x<N;x++)for(let y=0;y<N;y++)for(const dir of['x','y'])if(gateValid(x,y,dir)){const m=gTiles(x,y,dir)[1];const d=Math.hypot(m[0]-24,m[1]-31.5)+(dir=='y'?0.5:0);if(d<bd){bd=d;sp={x,y,dir}}}
 if(!sp)return;placeGate(sp);const gi=gateInfo(),b=S.objs.find(o=>DEF[o.k].bath);OCC=occ();if(b){const d=doorTile(b);const p=d&&findPath(gi.m[0],gi.m[1],d[0],d[1]);if(p)for(const[px,py]of p){const x=px|0,y=py|0;if(!OCC[x+','+y])S.objs.push({k:'path',x,y,lv:1,price:0,uses:0,earn:0})}}OCC=occ();groundDirty=true}
function placeGate(sp){const t=gTiles(sp.x,sp.y,sp.dir);const set=new Set(t.map(p=>p.join(',')));S.objs=S.objs.filter(o=>!(DEF[o.k].isPath&&set.has(o.x+','+o.y)));let g=gateObj();if(!g){g={k:'gate',lv:1,price:0,uses:0,earn:0};S.objs.push(g)}g.x=sp.x;g.y=sp.y;g.dir=sp.dir}
let OCC={};let ROT=0,lastMouse=null;function syncGhostHover(){if(!ghost||!lastMouse)return;const[a,b]=toTile(lastMouse[0],lastMouse[1]),[gfw,gfh]=fpOf(ghost,moving?moving.rot:ROT);hoverT=[Math.floor(a-(gfw/2-0.5)),Math.floor(b-(gfh/2-0.5))]}
function rotateObj(o){if(!o||o.k=="gate"||DEF[o.k].isPath)return false;const old=(o.rot|0)&1,ox=o.x,oy=o.y;try{const next=old^1,[fw0,fh0]=fpOf(o.k,old),[fw1,fh1]=fpOf(o.k,next);const wasReach=(fw0!==fh0&&!moving&&DEF[o.k].price)?window.__dbg.reachOK():false;o.rot=next;if(fw0!==fh0&&!moving){const prevM=moving;moving=o;OCC=occ();const cx0=ox+fw0/2,cy0=oy+fh0/2,cands=[];for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)cands.push([dx,dy,Math.hypot((ox+dx+fw1/2)-cx0,(oy+dy+fh1/2)-cy0)]);cands.sort((a,b)=>a[2]-b[2]);let placed=false;for(const[dx,dy]of cands)if(canPlace(o.k,ox+dx,oy+dy,next)){o.x=ox+dx;o.y=oy+dy;placed=true;break}moving=prevM;if(!placed){o.rot=old;o.x=ox;o.y=oy;OCC=occ();toast("회전할 공간이 부족해요");return false}clearPaths(o.k,o.x,o.y,next)}OCC=occ();if(wasReach&&!window.__dbg.reachOK()){o.rot=old;o.x=ox;o.y=oy;OCC=occ();toast("그 방향으론 손님이 들어갈 수 없어요");return false}groundDirty=true;guests.forEach(g=>{if(g.cur===o&&g.inBath){const[a,b]=bathSlot(o,g.slot||0);g.x=a;g.y=b}if(g.target===o&&g.st=="walk"){g.target=null;g.path=[]}});if(window.SND&&SND.click)SND.click();if(INFO_O===o)showInfo(o);save();return true}catch(e){console.warn("rotate failed",e);o.rot=old;o.x=ox;o.y=oy;try{OCC=occ()}catch(_){}groundDirty=true;toast("회전하지 못했어요");return false}}
window.rotateObj=rotateObj;
function rotateGate(){const g=gateObj();if(!g)return;const cur=gateOut(g.x,g.y,g.dir);const key=d=>d[0]+','+d[1];const order=['0,1','1,0','0,-1','-1,0'];const gm=gTiles(g.x,g.y,g.dir)[1];const save_=[g.x,g.y,g.dir];const wasReach=window.__dbg.reachOK();
 S.objs.splice(S.objs.indexOf(g),1);OCC=occ();let best=null;
 for(let step=1;step<=4&&!best;step++){const want=order[(order.indexOf(key(cur))+step)%4];let bd=1e9;for(let x=0;x<N;x++)for(let y=0;y<N;y++)for(const dir of['x','y']){if(!gateValid(x,y,dir))continue;const o_=gateOut(x,y,dir);if(key(o_)!==want)continue;const m=gTiles(x,y,dir)[1];const dd=Math.hypot(m[0]-gm[0],m[1]-gm[1]);if(dd<bd){bd=dd;best={x,y,dir}}}}
 S.objs.push(g);if(!best){OCC=occ();toast('돌릴 수 있는 다른 가장자리가 없어요');return}
 placeGate(best);OCC=occ();if(wasReach&&!window.__dbg.reachOK()){placeGate({x:save_[0],y:save_[1],dir:save_[2]});OCC=occ();toast('그쪽으로는 길이 이어지지 않아요');return}
 groundDirty=true;guests.forEach(q=>{if(q.st=='walk'){q.target=null;q.path=[]}});if(window.SND&&SND.click)SND.click();save();if(INFO_O===g)requestAnimationFrame(popPlace)}
window.rotateGate=rotateGate;setTimeout(()=>{const gb=document.getElementById('ghRot');if(gb){gb.onclick=e=>{e.stopPropagation();ROT^=1;syncGhostHover();if(window.SND&&SND.click)SND.click();gb.blur()};setInterval(()=>{gb.style.display=(ghost&&ghost!='gate'&&DEF[ghost]&&!DEF[ghost].isPath&&!DEF[ghost].erase&&!moving)?'block':'none'},200)}const b=document.getElementById('mvRot');if(b)b.onclick=e=>{e.stopPropagation();if(moving)moving.k=='gate'?rotateGate():rotateObj(moving);syncGhostHover();b.blur()}},0);let moving=null,infoT=null;
function startMove(o){if(window.READONLY)return;clearTimeout(infoT);if(moving)cancelMove();hideInfo();mode=null;
 guests.forEach(g=>{if(g.cur===o)finish(g);if(g.target===o){g.target=null;g.path=[]}});
 moving=o;o._from=[o.x,o.y,o.dir,o.rot|0];ghost=o.k;OCC=occ();groundDirty=true;$('moveBar').style.display='flex';toast('놓을 곳을 눌러주세요 · R키로 회전 (Esc·우클릭 취소)')}
function dropMove(x,y){const o=moving;if(o.k=='gate'){const sp=gateSpot(x,y);if(!sp){toast('대문은 열린 땅의 가장자리에만 놓을 수 있어요');return}endMove();placeGate(sp);OCC=occ();groundDirty=true;guests.forEach(g=>{if(g.st=='walk'){g.target=null;g.path=[]}});save();return}if(!canPlace(o.k,x,y,o.rot)){toast('여기엔 놓을 수 없어요');return}clearPaths(o.k,x,y,o.rot);o.x=x;o.y=y;endMove();anims['o'+S.objs.indexOf(o)]={t:0};
 const[fw,fh]=fpOf(o.k,o.rot);for(let i=0;i<8;i++)parts.push({k:'steam',x:x+fw/2+(Math.random()-0.5)*fw,y:y+fh/2,h:0,vx:0,l:1,L:1,s:2});save()}
function cancelMove(){if(!moving)return;moving.x=moving._from[0];moving.y=moving._from[1];if(moving._from[2])moving.dir=moving._from[2];if(moving._from[3]!==undefined)moving.rot=moving._from[3];endMove()}
function endMove(){if(moving)delete moving._from;moving=null;ghost=null;OCC=occ();groundDirty=true;$('moveBar').style.display='none';guests.forEach(g=>{if(g.st=='walk'&&g.target){const t=g.target;g.target=null;g.path=[]}});buildCards()}
function canPlace(k,x,y,rot){if(k=='gate')return !!gateSpot(x,y);const r=rot!==undefined?rot:(moving?moving.rot:ROT),[fw,fh]=fpOf(k,r);for(let i=0;i<fw;i++)for(let j=0;j<fh;j++){const o=OCC[(x+i)+','+(y+j)];if(!tileOpen(x+i,y+j)||(o&&!(DEF[o.k].isPath&&!DEF[k].isPath)))return false}return true}
function clearPaths(k,x,y,rot){const r=rot!==undefined?rot:(moving?moving.rot:ROT),[fw,fh]=fpOf(k,r);S.objs=S.objs.filter(o=>!(DEF[o.k].isPath&&o.x>=x&&o.x<x+fw&&o.y>=y&&o.y<y+fh))}
function starScore(){let s=S.rep*0.5,b=0;for(const o of S.objs){const d=DEF[o.k];s+=(d.appeal||0)*(1+0.35*(o.lv-1))*0.4;b+=(d.beauty||0)*bMul(d)}s+=Math.sqrt(b)*3+Object.keys(S.plots).length*4+setsDone().length*15;return s}
const STAR_REQ=[0,0,[55,500,1],[105,1700,2],[190,5000,3],[320,9000,4]]; // [점수, 누적손님, 구역수]
let _stC={k:''};function stars(){const ck=Math.floor(S.min/10)+'|'+S.objs.length+'|'+S.served+'|'+Object.keys(S.plots).length+'|'+Math.floor(S.rep||0);if(_stC.k===ck)return _stC.v;_stC.k=ck;return _stC.v=stars_()}
function stars_(){const s=starScore(),pl=Object.keys(S.plots).length;let r=1;for(let i=2;i<=5;i++){const[q,sv,p]=STAR_REQ[i];if(s>=q&&S.served>=sv&&pl>=p)r=i;else break}return r}
function nextStarInfo(){const r=stars();if(r>=5)return null;const[q,sv,p]=STAR_REQ[r+1];return{r:r+1,score:[Math.floor(starScore()),q],served:[S.served,sv],plots:[Object.keys(S.plots).length,p]}}
function beautyAt(x,y){let b=0;for(const o of S.objs){const d=DEF[o.k];if(!d.beauty)continue;const dd=Math.hypot(o.x-x,o.y-y);if(dd<4)b+=d.beauty*bMul(d)*(1-dd/4)}return b}
// ===== 시간/조명 =====
const hour=()=>(S.min/60)%24,dayN=()=>Math.floor(S.min/1440)+1,season=()=>Math.floor((dayN()-1)/7)%4;
const KEYS=[ // h, 하늘, 주변광(곱), 밝기 (뿌연 느낌 없이 맑고 선명한 채도 + 인디고 야경)
 [0,'#141a3a',[96,110,172],0.0],[5,'#283062',[124,132,188],0.18],[6.5,'#f4ba8e',[255,240,224],0.68],[8.2,'#48bed4',[255,254,250],0.96],
 [12,'#38b8ce',[255,255,255],1],[16,'#58c4d4',[255,250,240],0.94],[18,'#f29b68',[255,228,204],0.65],[19.3,'#4e4482',[180,172,222],0.28],[21,'#1a2350',[108,120,178],0.08],[24,'#141a3a',[96,110,172],0]];
function lerp(a,b,t){return a+(b-a)*t}
function hex(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function light(){const h=hour();let i=0;while(KEYS[i+1][0]<=h)i++;const a=KEYS[i],b=KEYS[i+1],t=(h-a[0])/(b[0]-a[0]);
 const sa=hex(a[1]),sb=hex(b[1]);return{sky:sa.map((v,j)=>Math.round(lerp(v,sb[j],t))),amb:a[2].map((v,j)=>Math.round(lerp(v,b[2][j],t))),sun:lerp(a[3],b[3],t),night:1-lerp(a[3],b[3],t)}}
function sunVec(){const h=hour();const t=(h-6)/12;const el=Math.max(0.12,Math.sin(Math.PI*Math.min(1,Math.max(0,t))));const L=Math.min(2.6,0.45/el);
 return{kx:-Math.cos(Math.PI*Math.min(1,Math.max(0,t)))*L*0.9,ky:0.28+L*0.12,left:t<0.5}}
// ===== 손님 =====
let guests=[],parts=[],floats=[],bubbles=[];
const THOUGHT={
 good:['물이 정말 좋아~','몸이 사르르 녹아요','유자 향이 좋네','여기 최고예요!','벚꽃이 예뻐요','또 올게요~'],
 pricey:['너무 비싸요…','가격이 좀…','지갑이 울어요'],
 none:{fatigue:'쉴 곳이 없네…',hunger:'뭐 먹을 데 없나…',thirst:'목말라요…',fun:'좀 심심하다'},
 want:{fatigue:'온천 하고 싶다',hunger:'배고파요',thirst:'우유 마시고 싶다',fun:'구경하고 싶어요'}};
function entrance(){const s=START_PLOT;return[s[0]*PS+PS/2,s[1]*PS+PS]}
function wageNow(h){const nt=(h%24)>=23||(h%24)<6;return Math.round(S.objs.reduce((s,o)=>{const d=DEF[o.k];if(!d.wage)return s;const w=d.wage*(1+0.5*(o.lv-1))*(0.35+0.65*Math.min(1,(o.hu||0)/2));o.hu=0;return s+(nt&&!d.stay&&!d.night?w*0.3:w)},0)+S.objs.filter(o=>!DEF[o.k].isPath&&!DEF[o.k].wage).length*4)}
function capTotal(){return S.objs.reduce((a,o)=>{const d=DEF[o.k];return a+(d.cap&&!d.stay?capOf(o):0)},0)}
const TUNE=window.TUNE||{spread:1,dur:1.5,funFix:0,starK:12,fill:1.5};
// 동시 손님 상한: 12+★×starK (기존 8 → 시설이 더 북적이도록), 단 설치 정원×1.5+4를 넘지 않음
// (설치 정원에 비례하게 하면 시설을 늘릴수록 손님·매출이 함께 불어나 경제가 폭주함 — 밸런스 봇으로 확인)
function maxGuests(){const ct=capTotal();return Math.min(12+stars()*(TUNE.starK||8),Math.round(ct*1.5)+4)}
function spawnRate(){const h=hour();const f=h<6?0.05:h<9?0.5:h<12?0.7:h<15?0.6:h<17?0.8:h<21?1.15:h<23?0.5:0.15;return f*(0.12+stars()*0.06)}
function spawn(){const gi=gateInfo();if(!gi)return;const[mx,my]=gi.m,[ox,oy]=gi.o;const vip=Math.random()<0.1*stars();const c=(k)=>[mx+0.5+ox*k,my+0.5+oy*k];const s0=c(5);
 guests.push({x:s0[0]+(Math.random()-0.5)*0.3,y:s0[1],tx:s0[0],ty:s0[1],path:[c(3),c(1),c(0)],st:'walk',spr:'cw'+(1+(Math.random()*4|0)),cb:'cb'+(1+(Math.random()*4|0)),
  need:{fatigue:50+Math.random()*45,hunger:20+Math.random()*60,thirst:20+Math.random()*60,fun:20+Math.random()*50},
  budget:Math.round((2500+Math.random()*5000)*(vip?2.2:1)*(1+0.22*Math.max(0,stars()-1))),happy:60,t:0,target:null,life:0,dir:1,bob:Math.random()*6,fade:0,vip});BUS.emit('spawn',guests[guests.length-1])}
function pickTarget(g){
 const h=hour();
 if((h>=20||h<5)&&g.budget>2000){const r=S.objs.filter(o=>DEF[o.k].stay&&(o.users||0)<capOf(o));if(r.length)return pickBy(g,r,'fatigue')}
 const order=NEEDK.slice().sort((a,b)=>g.need[b]-g.need[a]);
 for(const nk of order){if(g.need[nk]<30)break;
  const c=S.objs.filter(o=>{const d=DEF[o.k];return d.eff&&!d.stay&&(d.eff[nk]<0||(nk=='fun'&&(d.fun||d.eff.fun>15)))&&!g.used?.includes(o)&&!(g.blocked&&g.blocked.has(o))});
  if(!c.length){think(g,THOUGHT.none[nk]);voice(g,nk,null);g.happy-=2;g.need[nk]-=15;continue}
  return pickBy(g,c,nk)}
 return null}
// 혼잡도: 이용 중 + 이 시설로 가는 중 + 대기 중인 손님 수. 꽉 찰 시설은 빈자리 있는 시설보다 뒤로 (모두 차면 가장 가까운 곳에서 대기)
function loadOf(o,self){let n=o.users||0;for(const x of guests)if(x!==self&&x.target===o&&!x.leaving)n++;return n}
// 시설 선택: 거리·가격 + 혼잡도(덜 붐비는 곳 선호) + 이 손님이 이미 써 본 종류는 뒤로 + 약간의 무작위 → 여러 시설을 골고루 즐김
function pickBy(g,list,nk){const sc=new Map(),kinds=g.kinds||(g.kinds=new Set());for(const o of list){const ld=loadOf(o,g),cap=capOf(o),full=ld>=cap;
  sc.set(o,dist(g,o)+o.price/300+(full?40:0)+(TUNE.spread?ld/cap*8+(kinds.has(o.k)?6:0)+Math.random()*4:0))}list.sort((a,b)=>sc.get(a)-sc.get(b));const o=list[0];
 if(Math.random()<0.25)think(g,THOUGHT.want[nk]||'');return o}
const ctr=o=>{const[fw,fh]=fpOf(o.k,o.rot);return[o.x+fw/2,o.y+fh/2]};
const dist=(g,o)=>{const[a,b]=ctr(o);return Math.hypot(a-g.x,b-g.y)};
// 말풍선: 화면 안 손님만, 불만은 동시에 1개까지, 탭(force)한 손님은 항상 표시
const NEG=new Set([...Object.values(THOUGHT.none),...THOUGHT.pricey,'자리가 없네…','길이 막혔어요…']);
function onScr(g){const[X,Y]=toScreenT(g.x,g.y);return X>-60&&X<VW+60&&Y>-90&&Y<VH+40}
function think(g,t,force){if(!t)return;(window.__thinks=window.__thinks||{})[t]=(window.__thinks[t]||0)+1;if(window.__norender&&!force)return;bubbles=bubbles.filter(b=>b.g!==g);
 if(!force&&!onScr(g))return;const neg=NEG.has(t);if(neg&&!force&&bubbles.some(b=>b.neg))return;
 if(bubbles.length>=4){let i=bubbles.findIndex(b=>!onScr(b.g));if(i<0&&force)i=bubbles.findIndex(b=>!b.force);if(i<0)return;bubbles.splice(i,1)}
 bubbles.push({g,t,l:3.2,neg,force:!!force})}
// 손님들의 한마디: 최근 24게임시간 동안의 아쉬운 점 (메모리에만 보관, 저장하지 않음)
const VOICE=[];function voice(g,k,o){VOICE.push({m:S.min,g,k,o});if(VOICE.length>5000)VOICE.splice(0,1000)}
function walkable(x,y){if(!tileOpen(x,y))return false;const o=OCC[x+','+y];return !o||!!DEF[o.k].walk||!!DEF[o.k].isPath||DEF[o.k].fp==1&&!!DEF[o.k].isPath}
function fairPrice(o){return DEF[o.k].price*(1+o.lv*0.12)}
function doorTile(o){const[fw,fh]=fpOf(o.k,o.rot);const sides=[[o.x+(fw>>1),o.y+fh],[o.x+fw,o.y+(fh>>1)],[o.x+(fw>>1),o.y-1],[o.x-1,o.y+(fh>>1)]];const r=(o.rot|0)&1;const c=[sides[r],sides[(r+1)&3],sides[(r+3)&3],sides[(r+2)&3]];for(let i=0;i<fw;i++)c.push([o.x+i,o.y+fh],[o.x+i,o.y-1]);for(let j=0;j<fh;j++)c.push([o.x+fw,o.y+j],[o.x-1,o.y+j]);
 // 대문과 이어진 칸을 우선 (시설 사이에 갇힌 구석 칸으로 내보내면 손님이 빠져나오지 못함)
 const gen=_bfsGate();if(gen){const r=c.find(([x,y])=>x>=0&&y>=0&&x<N&&y<N&&walkable(x,y)&&_rSeen[y*N+x]===gen);if(r)return r}return c.find(([x,y])=>walkable(x,y))}
function door(o){const[,fh]=fpOf(o.k,o.rot);const d=doorTile(o)||[o.x,o.y+fh];return[d[0]+0.5,d[1]+0.5]}
function heapPush(h,v){h.push(v);let i=h.length-1;while(i>0){const p=(i-1)>>1;if(h[p][0]<=h[i][0])break;[h[p],h[i]]=[h[i],h[p]];i=p}}
function heapPop(h){const top=h[0],last=h.pop();if(h.length){h[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<h.length&&h[l][0]<h[m][0])m=l;if(r<h.length&&h[r][0]<h[m][0])m=r;if(m==i)break;[h[m],h[i]]=[h[i],h[m]];i=m}}return top}
const _pDist=new Float64Array(N*N),_pFrom=new Int32Array(N*N);
// 거리 배열은 Float64: Float32면 0.6(길) 비용 누적의 반올림 오차로 꺼낸 거리가 저장값보다 커져 칸이 통째로 건너뛰어지고,
// 이어진 길도 '길이 막혔어요'로 판정됨. 탐색 상한도 지도 전체(N×N)를 덮도록 (600이면 구역 3개 이상에서 먼 시설을 놓침)
const PF_MAX=N*N*2;
function findPath(sx,sy,ex,ey){sx|=0;sy|=0;ex|=0;ey|=0;if(sx==ex&&sy==ey)return[];if(sx<0||sy<0||sx>=N||sy>=N||ex<0||ey<0||ex>=N||ey>=N)return null;
 const s0=sy*N+sx,goal=ey*N+ex;_pDist.fill(1e9);_pFrom.fill(-1);_pDist[s0]=0;const h=[[Math.abs(ex-sx)+Math.abs(ey-sy),s0]];let it=0;
 while(h.length&&it++<PF_MAX){const[,k]=heapPop(h),d=_pDist[k];if(k==goal){const p=[];let c=k,gd=0;while(c!=s0){if(c<0||gd++>N*N)return null;p.unshift([c%N+0.5,Math.floor(c/N)+0.5]);c=_pFrom[c]}return p}
  const x=k%N,y=(k/N)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=N||ny>=N)continue;if(!(nx==ex&&ny==ey)&&!walkable(nx,ny))continue;
   const o=OCC[nx+','+ny],nk=ny*N+nx,nd=d+(o&&!!DEF[o.k].isPath?0.6:1);if(nd<_pDist[nk]){_pDist[nk]=nd;_pFrom[nk]=k;heapPush(h,[nd+Math.abs(ex-nx)+Math.abs(ey-ny),nk])}}}
 return null}
// 다익스트라: 시설 풋프린트에 인접한 '도달 가능한' 칸 중 가장 가까운 곳으로
function pathToObj(g,o){const goal=new Set();for(const[x,y]of tilesOf(o))for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){if(walkable(x+dx,y+dy))goal.add((y+dy)*N+(x+dx))}
 if(!goal.size)return null;const sx=g.x|0,sy=g.y|0,s0=sy*N+sx;if(sx<0||sy<0||sx>=N||sy>=N)return null;_pDist.fill(1e9);_pFrom.fill(-1);_pDist[s0]=0;const h=[[0,s0]];let it=0;
 while(h.length&&it++<PF_MAX){const[d,k]=heapPop(h);if(d>_pDist[k])continue;if(goal.has(k)){const p=[];let c=k,gd=0;while(c!=s0){if(c<0||gd++>N*N)return null;p.unshift([c%N+0.5,Math.floor(c/N)+0.5]);c=_pFrom[c]}return p}
  const x=k%N,y=(k/N)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=N||ny>=N||!walkable(nx,ny))continue;const oc=OCC[nx+','+ny],nk=ny*N+nx,nd=d+(oc&&DEF[oc.k].isPath?0.6:1);if(nd<_pDist[nk]){_pDist[nk]=nd;_pFrom[nk]=k;heapPush(h,[nd,nk])}}}
 return null}
function goTo(g,x,y){const p=findPath(g.x,g.y,x,y);if(!p){g.path=[];return false}g.path=p;return true}
// 탕별 좌석 (수면 기준 정규화 화면 좌표 u,v ∈[-1,1], 뒤→앞 순)
const SEATS={hinoki:[[-0.36,-0.22],[0.36,0.12]],sauna:[[-0.4,-0.3],[0.38,-0.28],[-0.28,0.3],[0.42,0.32]],
 rock:[[-0.1,-0.7],[0.45,-0.5],[-0.62,-0.3],[0.05,-0.18],[0.7,0.0],[-0.5,0.22],[0.3,0.35],[-0.08,0.6]],
 milky:[[0,-0.62],[-0.3,-0.32],[0.3,-0.32],[-0.6,0],[0,-0.02],[0.6,0],[-0.3,0.3],[0.3,0.3],[0,0.6],[-0.15,0.15],[0.15,-0.17],[0.45,0.15]]};
function capOf(o){const d=DEF[o.k],st=SEATS[d.like||o.k];const c=d.cap+(o.lv-1)*(d.bath&&d.fp>=4?2:1);return st?Math.min(c,st.length):c}
const FOOT_SEATS={
 1:[[0.64,0.38],[0.56,0.44],[0.48,0.50],[0.40,0.56],[0.60,0.41],[0.52,0.47],[0.44,0.53],[0.36,0.59]],
 2:[[0.58,0.53],[0.51,0.57],[0.44,0.61],[0.37,0.65],[0.55,0.55],[0.48,0.59],[0.41,0.63],[0.34,0.67]],
 3:[[0.46,0.58],[0.52,0.60],[0.58,0.62],[0.64,0.64],[0.49,0.59],[0.55,0.61],[0.61,0.63],[0.43,0.57]],
 4:[[0.46,0.58],[0.52,0.60],[0.58,0.62],[0.64,0.64],[0.49,0.59],[0.55,0.61],[0.61,0.63],[0.43,0.57]],
 5:[[0.46,0.58],[0.52,0.60],[0.58,0.62],[0.64,0.64],[0.49,0.59],[0.55,0.61],[0.61,0.63],[0.43,0.57]]
};
function bathSlot(o,i){if(o.k=='foot'){const G=objGeom(o),lv=Math.min(5,Math.max(1,o.lv||1)),fs=FOOT_SEATS[lv];let[u,v]=fs[i%fs.length];if(o.rot&1)u=1-u;const X=G.X+(u-0.5)*G.W,Y=G.Y-G.H+v*G.H;return[(X/(TW/2)+Y/(TH/2))/2,(Y/(TH/2)-X/(TW/2))/2]}
 const W=wgeo(o),st=SEATS[DEF[o.k].like||o.k];let u,v;if(st){[u,v]=st[i%st.length];if(o.rot&1)u=-u}else{const n=capOf(o),a=(i/n)*Math.PI*2+0.6;u=Math.cos(a)*0.6;v=Math.sin(a)*0.6;if(o.rot&1)u=-u}
 const sp=W.dia?0.9:0.85;const X=W.cX+u*W.rx*sp,Y=W.cY+v*W.ry*sp+2;return[(X/(TW/2)+Y/(TH/2))/2,(Y/(TH/2)-X/(TW/2))/2]}
function bathClip(o){const W=wgeo(o);const{cX,cY,rx,ry}=W;cx.beginPath();if(W.dia){cx.moveTo(cX+rx,cY);cx.lineTo(cX,cY+ry);cx.lineTo(cX-rx,cY)}else{cx.moveTo(cX+rx,cY-1);cx.ellipse(cX,cY-1,rx,ry,0,0,Math.PI)}cx.lineTo(cX-rx,cY-40);cx.lineTo(cX+rx,cY-40);cx.lineTo(cX+rx,cY);cx.closePath();cx.clip()}
function updGuest(g,dt){
 g.life+=dt;if(g.leaving&&g.path&&g.path.length<=1){g.fade=Math.max(0,g.fade-dt*1.4);if(g.fade<=0){g.dead=1;return}}else g.fade=Math.min(1,g.fade+dt*1.5);for(const k of NEEDK)g.need[k]=Math.min(100,g.need[k]+dt*(k=='fatigue'?0.2:0.9));
 const nearSeat=S.objs.some(o=>DEF[o.k]&&DEF[o.k].seat&&Math.hypot(o.x+0.5-g.x,o.y+0.5-g.y)<3.2);if(nearSeat)g.need.fatigue=Math.max(0,g.need.fatigue-dt*0.45);g.happy=Math.max(0,Math.min(100,g.happy+(beautyAt(g.x,g.y)*0.02+(nearSeat?0.10:0)-0.03)*dt));
 {const oc=OCC[(g.x|0)+','+(g.y|0)];const zt=oc&&oc.k=='gate'?3:0;g.z=(g.z||0)+(zt-(g.z||0))*Math.min(1,dt*9);if(oc&&oc.k=='gate'&&g.st=='walk')oc.sway=Math.min(0.35,(oc.sway||0)+dt*1.2)}
 if(g.st=='walk'){if(g.path&&g.path.length&&(()=>{const q=OCC[(g.path[0][0]|0)+','+(g.path[0][1]|0)];return q&&q!==g.target&&!DEF[q.k].walk&&!DEF[q.k].isPath})()){const L=g.path[g.path.length-1];if(!goTo(g,L[0]|0,L[1]|0)){g.path=[];g.tx=g.x;g.ty=g.y}}if(g.path&&g.path.length){g.tx=g.path[0][0];g.ty=g.path[0][1]}const dx=g.tx-g.x,dy=g.ty-g.y,d=Math.hypot(dx,dy);
  if(d<=0.05&&g.path&&g.path.length){g.path.shift();return}
  if(d>0.05){const sp=1.3*dt;g.x+=dx/d*Math.min(sp,d);g.y+=dy/d*Math.min(sp,d);g.dir=(dx-dy)>=0?1:-1;return}
  if(g.target){arrive(g);return}
  if(g.view){look(g);return}
  if(g.leaving){g.dead=1;return}
  if(_pb-->0)decide(g)}
 else if(g.st=='wait'){g.t-=dt;if(g.wx!=null){const dx=g.wx-g.x,dy=g.wy-g.y,d=Math.hypot(dx,dy);if(d>0.03){const sp=Math.min(d,1.1*dt);g.x+=dx/d*sp;g.y+=dy/d*sp;g.dir=(dx-dy)>=0?1:-1}}if(g.t<=0){g.wx=g.wy=null;g.st='walk';arrive(g)}}
 else if(g.st=='use'){g.waited=0;g.t-=dt;if(g.t<=0)finish(g)}
 else if(g.st=='look'){g.t-=dt;if(g.t<=0)g.st='walk'}
}
// 산책·감상: 급한 욕구가 없을 때 아직 안 본 장식(벚꽃·석등·연못·도리이 등)을 찾아가 잠시 바라봄 → 기분↑, 재미 욕구↓
// 구경 말풍선: 장식 종류별 대사, 같은 종류가 주변(반경 6칸)에 3개 이상이면 '가득' 대사, 등불은 밤·낮을 나눔
const LOOKS=[
 [/^maple/,{one:['단풍이 참 곱네요','빨갛게 물들었어요'],many:['단풍이 정말 가득해요','단풍길이 너무 예뻐요','온통 붉게 물들었네요']}],
 [/^ginkgo/,{one:['은행잎이 노랗게 물들었어요','황금빛 나무네요'],many:['노란 은행잎 길이에요','온통 황금빛이네요']}],
 [/^ume/,{one:['매화 향이 은은해요','하얀 꽃이 피었네요'],many:['매화밭이 고와요']}],
 [/^torii_gold/,{one:['금빛 토리이가 반짝여요','왠지 복이 올 것 같아요']}],
 [/^sakura/,{one:['벚꽃이 참 예뻐요','꽃잎이 흩날려요'],many:['벚꽃 터널 같아요','온통 벚꽃이네요']}],
 [/^(pine|cedar)/,{one:['솔향이 좋아요','나무가 늠름하네요'],many:['숲속에 온 것 같아요','나무 그늘이 시원해요']}],
 [/^(bamboo|bamboofence)/,{one:['대나무 소리가 좋아요','사각사각 소리가 나요'],many:['대나무 숲길이네요']}],
 [/^wisteria_w/,{one:['하얀 등꽃이 늘어졌어요','눈처럼 하얀 꽃이네요']}],
 [/^wisteria/,{one:['등나무 꽃이 늘어졌어요','보랏빛이 예뻐요']}],
 [/^(hydrangea|iris|olive|fern|tsukimi)/,{one:['꽃 색이 고와요','싱그럽네요'],many:['꽃밭이 예뻐요']}],
 [/^mushroom/,{one:['버섯이 귀여워요']}],
 [/^birdhouse/,{one:['새가 살고 있을까?']}],
 [/^(lantern|andon|takeakari|chochin|kagaribi|lanternpath|lamppost)/,{one:['석등이 운치 있네요','등이 예쁘네요'],night:['불빛이 따뜻해요','은은하니 좋네요'],many:['등불이 이어져 있어요']}],
 [/^floating/,{one:['물 위에 등이 떠 있어요'],night:['유등이 반짝여요']}],
 [/^neon/,{one:['간판이 레트로하네요'],night:['네온이 반짝반짝해요']}],
 [/^(pond)/,{one:['잉어가 헤엄쳐요','물소리가 좋아요']}],
 [/^bridge/,{one:['다리가 참 예쁘네요']}],[/^waterwheel/,{one:['물레방아가 돌아가요']}],[/^shishi/,{one:['딱— 소리가 좋아요']}],
 [/^sandgarden/,{one:['모래 무늬가 차분해요']}],[/^tanuki/,{one:['너구리 상이 귀여워요']}],
 [/^(torii|jizo|ema|pagoda)/,{one:['마음이 편안해져요','소원을 빌어볼까']}],
 [/^rocks/,{one:['이끼가 예쁘게 앉았어요','고즈넉하네요']}],
 [/(bench|parasol|lounger|nodate|cafe)/,{one:['잠깐 쉬어갈까','여기 앉으면 좋겠다']}]];
function lookLine(o){const k=o.k,pick=a=>a[Math.random()*a.length|0];for(const[re,L]of LOOKS){if(!re.test(k))continue;
  if(L.many){const[cx_,cy_]=ctr(o);let n=0;for(const q of S.objs)if(q.k.replace(/_.*$/,'')==k.replace(/_.*$/,'')&&Math.hypot(ctr(q)[0]-cx_,ctr(q)[1]-cy_)<6)n++;if(n>=3&&Math.random()<0.65)return pick(L.many)}
  if(L.night&&light().night>0.5)return pick(L.night);return pick(L.one)}return '정말 예쁘다~'}
function stroll(g){if((g.strolls||0)>=3||g.leaving)return false;const seen=g.seen||(g.seen=new Set()),c=[];
 for(const o of S.objs){const d=DEF[o.k];if(!d||!(d.beauty>0)||d.isPath||seen.has(o)||o===moving)continue;c.push([dist(g,o)+Math.random()*5-Math.min(8,d.beauty*0.25),o])}
 if(!c.length)return false;c.sort((a,b)=>a[0]-b[0]);const pick=c[Math.random()*Math.min(4,c.length)|0][1];seen.add(pick);
 const pp=pathToObj(g,pick);if(!pp)return false;g.path=pp;g.view=pick;g.strolls=(g.strolls||0)+1;return true}
function look(g){const o=g.view;g.view=null;if(!o||!S.objs.includes(o))return;const[a,b]=ctr(o);g.dir=(a-g.x)-(b-g.y)>=0?1:-1;g.st='look';g.t=2.5+Math.random()*2.5;
 const d=DEF[o.k];g.happy=Math.min(100,g.happy+Math.min(6,(d.beauty||4)*0.35));g.need.fun=Math.max(0,g.need.fun-12);if(Math.random()<0.45)think(g,lookLine(o));window.__looks=(window.__looks||0)+1}
function decide(g){
 if(g.life>220||g.budget<200||g.happy<15){leave(g);return}
 const o=pickTarget(g);
 // 시설로 가기 전에 가끔(30%, 손님당 최대 3번) 장식 하나 구경하고 가기
 if(o&&Math.random()<0.3&&stroll(g))return;
 if(!o){if(Math.random()<0.75&&stroll(g))return;if(NEEDK.every(k=>g.need[k]<35)||Math.random()<0.4){leave(g);return}
  for(let i=0;i<3;i++){const x=(g.x|0)+((Math.random()*9)|0)-4,y=(g.y|0)+((Math.random()*9)|0)-4;if(walkable(x,y)&&goTo(g,x,y))return}leave(g);return}
 const pp=pathToObj(g,o);if(pp)g.path=pp;if(!pp){if(!g.blocked)g.blocked=new Set();if(!g.blocked.size){think(g,'길이 막혔어요…');g.happy-=4}voice(g,'path',o);g.blocked.add(o);g.path=[];return}g.target=o;}
function arrive(g){g.ax=g.x;g.ay=g.y;const o=g.target;if(!o||!DEF[o.k]){g.target=null;g.st='walk';if(_pb-->0)decide(g);return}const d=DEF[o.k];g.target=null;o.users=o.users||0;
 if(!S.objs.includes(o)){decide(g);return}
 const cap=capOf(o);if(o.users>=cap){if(!g.waited){g.waited=1;(window.__thinks=window.__thinks||{})['자리가 날 때까지 기다릴게요']=(window.__thinks['자리가 날 때까지 기다릴게요']||0)+1;voice(g,'full',o);g.st='wait';g.t=5;g.target=o;const w=waitSpot(g,o);g.wx=w[0];g.wy=w[1];return}g.waited=0;think(g,'자리가 없네…');voice(g,'full',o);g.happy-=3;(g.used=g.used||[]).push(o);return}
 const fair=fairPrice(o)*(0.8+g.happy/150);
 if(o.price>g.budget){think(g,'다음에 또 올게요');leave(g);return}
 g.budget-=o.price;S.yen+=o.price;S.fin.inc+=o.price;o.earn=(o.earn||0)+o.price;o.uses=(o.uses||0)+1;o.hu=(o.hu||0)+1;S.served++;BUS.emit('pay',o,g,o.price);
 const[sx,sy]=toScreenT(...ctr(o));floats.push({x:ctr(o)[0],y:ctr(o)[1],t:'+¥'+fmt(o.price),l:1.6});
 o.users++;g.cur=o;g.st='use';g.t=d.stay?Math.max(30,((30-hour()+24)%24+7)*60/120):d.dur*(1+o.lv*0.1)*(TUNE.dur||1);(g.kinds||(g.kinds=new Set())).add(o.k);
 if(d.bath&&!d.inside){g.slot=freeSlot(o);const[a,b]=bathSlot(o,g.slot);g.x=a;g.y=b;g.inBath=true}else g.hide=true;
 const bonus=o.price<fair*0.9?8:o.price<fair*1.15?3:-3;g.happy+=bonus+o.lv*2;
 for(const k in d.eff)if(g.need[k]!=null){const e=k=='fun'&&TUNE.funFix?-Math.abs(d.eff[k]):d.eff[k];g.need[k]=Math.max(0,g.need[k]+e*(1+o.lv*0.1))}
 if(d.joy)g.happy+=d.joy*0.3;if(d.bath&&Math.random()<0.6)setTimeout(()=>think(g,THOUGHT.good[Math.random()*6|0]),1500);}
// 대기 위치: 시설에 붙은 걸을 수 있는 칸 중 현재 위치에서 가깝고(2.5칸 이내) 다른 대기 손님이 적은 곳
function waitSpot(g,o){const T=new Set(tilesOf(o).map(([x,y])=>x+','+y)),c=[];for(const[x,y]of tilesOf(o))for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(T.has(k)||!walkable(nx,ny)||c.some(p=>p.k==k))continue;const px=nx+0.5,py=ny+0.5,d=Math.hypot(px-g.x,py-g.y);if(d>2.5)continue;let crowd=0;for(const q of guests)if(q!==g&&q.st=='wait'&&Math.hypot((q.wx??q.x)-px,(q.wy??q.y)-py)<0.6)crowd++;c.push({k,px,py,s:d+crowd*3})}
 if(!c.length)return[g.x,g.y];c.sort((a,b)=>a.s-b.s);const p=c[0];return[p.px+(Math.random()-0.5)*0.4,p.py+(Math.random()-0.5)*0.4]}
function freeSlot(o){const used=guests.filter(x=>x.cur===o&&x.inBath).map(x=>x.slot);for(let i=0;i<capOf(o);i++)if(!used.includes(i))return i;return 0}
function finish(g){const o=g.cur;if(g.ax!=null){g.x=g.ax;g.y=g.ay}if(o)o.users=Math.max(0,o.users-1);(g.used=g.used||[]).push(o);if(g.used.length>3)g.used.shift();
 g.cur=null;g.hide=false;const[a,b]=door(o);g.x=a;g.y=b;g.inBath=false;g.st='walk';g.tx=g.x;g.ty=g.y;g.path=[]}
function leave(g){if(!g.leaving)BUS.emit('leave',g);g.leaving=true;g.target=null;g.view=null;if(g.st=='look')g.st='walk';const gi=gateInfo();if(!gi){g.dead=1;return}const[mx,my]=gi.m,[ox,oy]=gi.o;if(!goTo(g,mx,my))g.path=[[mx+0.5,my+0.5]];g.path.push([mx+0.5+ox*1.5,my+0.5+oy*1.5],[mx+0.5+ox*4,my+0.5+oy*4]);
 S.rep=S.rep*0.97+g.happy*0.03;if(g.happy>70&&Math.random()<0.5)think(g,'또 올게요~');}
const toScreenT=(x,y)=>{const[a,b]=iso(x,y);return toScreen(a,b)};
let SHK=0,SHKo=[0,0];
function stepBuild(dt){cam.x-=SHKo[0];cam.y-=SHKo[1];SHKo=[0,0];
 for(const o of S.objs){const b=o.build;if(!b)continue;const p=b.t;b.t+=dt/2.0;const[fw,fh]=fpOf(o.k,o.rot),f=Math.max(fw,fh),c=ctr(o);
  for(const hk of[0.12,0.3,0.48,0.66])if(p<hk&&b.t>=hk){try{SND.hammer()}catch(e){}for(let i=0;i<10;i++)parts.push({k:'dust',x:c[0]+(Math.random()-0.5)*f,y:c[1]+(Math.random()-0.5)*f,h:Math.random()*4,vh:3+Math.random()*6,l:0.9});SHK=Math.max(SHK,0.35)}
  if(p<0.9&&b.t>=0.9){anims['o'+S.objs.indexOf(o)]={t:0};upFx(o);BUS.emit('upgrade',o);SHK=1;groundDirty=true}
  if(b.t>=1.6)delete o.build}
 if(SHK>0.01){const a=SHK*SHK*3*cam.z/3;SHKo=[(Math.random()-0.5)*a,(Math.random()-0.5)*a];cam.x+=SHKo[0];cam.y+=SHKo[1];SHK*=Math.pow(0.02,dt)}else SHK=0}
function drawBuild(t){for(const o of S.objs){const b=o.build;if(!b)continue;const[fw,fh]=fpOf(o.k,o.rot),G=objGeom(o);const T=b.t;
  // 비계: 0~0.9 동안 기둥이 솟고 가로대가 걸림, 0.9 이후 빠르게 내려가며 사라짐
  const up=Math.min(1,T/0.55),dn=T>0.9?Math.min(1,(T-0.9)/0.35):0;const H=G.H*0.92*up*(1-dn),al=1-dn;if(al<=0)continue;
  const cs=[[o.x,o.y+fh],[o.x+fw,o.y+fh],[o.x+fw,o.y],[o.x,o.y]].map(([x,y])=>iso(x,y));
  cx.save();cx.globalAlpha=al;cx.lineCap='square';
  const pole=(X,Y,back)=>{cx.strokeStyle=back?'#6b4a2c':'#8a6238';cx.lineWidth=1.6;cx.beginPath();cx.moveTo(X,Y);cx.lineTo(X,Y-H);cx.stroke();cx.strokeStyle='#c49a62';cx.lineWidth=0.5;cx.beginPath();cx.moveTo(X-0.5,Y);cx.lineTo(X-0.5,Y-H);cx.stroke()};
  pole(cs[3][0],cs[3][1],1);pole(cs[2][0],cs[2][1],1);
  const nb=Math.floor(H/9);cx.strokeStyle='#7a5532';cx.lineWidth=1.1;
  for(let i=1;i<=nb;i++){const y=i*9;cx.beginPath();cx.moveTo(cs[0][0],cs[0][1]-y);cx.lineTo(cs[1][0],cs[1][1]-y);cx.lineTo(cs[2][0],cs[2][1]-y);cx.stroke();
   if(i%2){cx.strokeStyle='rgba(110,78,46,0.8)';cx.lineWidth=0.7;cx.beginPath();cx.moveTo(cs[0][0],cs[0][1]-y);cx.lineTo(cs[1][0],cs[1][1]-y+9);cx.stroke();cx.strokeStyle='#7a5532';cx.lineWidth=1.1}}
  pole(cs[0][0],cs[0][1]);pole(cs[1][0],cs[1][1]);
  // 거적(보양막) 한 장
  if(T<0.9&&up>0.6){cx.globalAlpha=al*0.55*Math.min(1,(up-0.6)/0.4);cx.fillStyle='#d8c9a6';cx.beginPath();cx.moveTo(cs[0][0],cs[0][1]-H*0.15);cx.lineTo(cs[1][0],cs[1][1]-H*0.15);cx.lineTo(cs[1][0],cs[1][1]-H*0.7);cx.lineTo(cs[0][0],cs[0][1]-H*0.7);cx.fill()}
  cx.restore();
  // 공개 순간: 빛 폭발
  if(T>0.86&&T<1.3){const k=1-Math.abs(T-0.95)/0.35;cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=Math.max(0,k);glow(G.X,G.Y-G.H*0.45,G.W*0.9,'rgba(255,230,170,0.9)');
   cx.strokeStyle=`rgba(255,240,200,${Math.max(0,k)*0.7})`;cx.lineWidth=1;cx.beginPath();for(let i=0;i<12;i++){const a=i/12*6.283+t/900,r0=G.W*0.2,r1=G.W*(0.45+0.4*(T-0.86));cx.moveTo(G.X+Math.cos(a)*r0,G.Y-G.H*0.45+Math.sin(a)*r0*0.6);cx.lineTo(G.X+Math.cos(a)*r1,G.Y-G.H*0.45+Math.sin(a)*r1*0.6)}cx.stroke();cx.restore()}}}
function upFx(o){const[fw,fh]=fpOf(o.k,o.rot),f=Math.max(fw,fh),c=ctr(o);for(let i=0;i<70;i++){const a=Math.random()*6.28,r=Math.random()*f*0.6;parts.push({k:'spark',x:c[0]+Math.cos(a)*r,y:c[1]+Math.sin(a)*r,h:Math.random()*10,vh:12+Math.random()*25,l:1.2+Math.random(),L:2})}
 for(let i=0;i<24;i++){const a=i/24*6.28;parts.push({k:'dust',x:c[0],y:c[1],vx:Math.cos(a)*f*0.9,vy:Math.sin(a)*f*0.9,h:1,l:0.9,L:0.9})}}
// ===== 파티클 =====
function emit(dt){if(parts.length>(window.GFX_LOW?140:600))return;if(window.GFX_LOW)dt*=0.5;
 for(const o of S.objs){const d=DEF[o.k];const[cx_,cy_]=ctr(o);
  if(d.bath&&Math.random()<dt*(4+DEF[o.k].fp)){const a=Math.random()*6.28,r=Math.random()*d.fp*0.3;parts.push({k:'steam',x:cx_+Math.cos(a)*r,y:cy_+Math.sin(a)*r,h:0,vx:(Math.random()-0.5)*0.1,l:3+Math.random()*2,L:5,s:3+Math.random()*4})}
  if(o.k=='sauna'&&Math.random()<dt*1.5)parts.push({k:'steam',x:o.x+1.6,y:o.y+0.4,h:40,vx:0.05,l:3,L:3,s:3});
  if(d.emit&&Math.random()<dt*2.2){parts.push({k:d.emit,x:o.x+0.5+(Math.random()-0.5)*4,y:o.y+0.5+(Math.random()-0.5)*4,h:30+Math.random()*25,vx:0,l:6,L:6,ph:Math.random()*6})}
  if(d.fire&&Math.random()<dt*4.5){parts.push({k:'spark',x:cx_+(Math.random()-0.5)*0.28,y:cy_+(Math.random()-0.5)*0.28,h:12+Math.random()*6,vh:10+Math.random()*16,l:0.7+Math.random()*0.5,L:1.2})}}
 if(season()==3&&Math.random()<dt*6){const r=rng(Date.now()|0);parts.push({k:'snow',x:Math.random()*N,y:Math.random()*N,h:60,l:8,L:8,ph:Math.random()*6})}
}
function updParts(dt){for(const o of S.objs)if(o.sway)o.sway=Math.max(0,o.sway-dt*0.35);for(const p of parts){p.l-=dt;if(p.k=='spark'){p.h+=p.vh*dt;p.vh*=0.96;continue}if(p.k=='dust'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=0.92;p.vy*=0.92;continue}if(p.k=='steam'){p.h+=dt*9;p.x+=(p.vx+(window.WIND||0)*0.12)*dt;p.y-=(window.WIND||0)*0.06*dt;p.s+=dt*1.1}else{if(p.h>0){p.h-=dt*(p.k=='snow'?6:8);p.ph+=dt*2;p.x+=Math.sin(p.ph)*dt*0.25+dt*0.12}else{p.h=0;p.l=Math.min(p.l,1.5)}}}
 parts=parts.filter(p=>p.l>0);if(parts.length>900)parts.splice(0,parts.length-900);floats.forEach(f=>f.l-=dt);floats=floats.filter(f=>f.l>0);bubbles.forEach(b=>b.l-=dt);bubbles=bubbles.filter(b=>b.l>0&&!b.g.dead&&!b.g.hide);
 for(const k in anims){anims[k].t+=dt;if(anims[k].t>1.6)delete anims[k]}}
// ===== 렌더 =====
let ghost=null,hoverT=null,mode=null;
// Esc·우클릭 공통 취소: 이동 취소 → 아니면 건설·철거·칠하기 모드와 열린 창 닫기
function escCancel(){$('toast').style.display='none';if(moving){cancelMove();return}paint=null;paintCursor=null;ghost=null;mode=null;$('tDel').classList.remove('on');$('info').style.display='none';$('modal').style.display='none';buildCards()}
function offscreen(X,Y,W,h){const z=cam.z,sx=X*z+cam.x,sy=Y*z+cam.y;return sx+W*z<0||sx-W*z>VW||sy<0||sy-h*z>VH}
function drawSprite(key,o,X,Y,W,lt,sv,alpha){ // X,Y: 바닥 중앙(월드), W: 폭(월드)
 const v=VAR[key];if(!v)return;const h=W*v.base.height/v.base.width;if(offscreen(X,Y,W,h))return h;
 if(o&&(o===window.HOVER||o===INFO_O)&&!ghost&&!moving&&key===skey(o)){const wl=whiteSil(key.replace('~m',''),v);const q=1.1/cam.z+0.25;if(v.m){cx.save();cx.translate(X*2,0);cx.scale(-1,1)}cx.globalAlpha=o===INFO_O?0.95:0.7;for(const[dx,dy]of[[-q,0],[q,0],[0,-q],[0,q]])cx.drawImage(wl,X-W/2+dx,Y-h+dy,W,h);if(v.m)cx.restore()}
 if(v.m){cx.save();cx.translate(X*2,0);cx.scale(-1,1)}cx.globalAlpha=alpha??1;cx.drawImage(v.base,X-W/2,Y-h,W,h);
 if(lt.sun>0.15){cx.globalAlpha=(alpha??1)*lt.sun*0.68;cx.drawImage(sv.left?v.rimL:v.rimR,X-W/2,Y-h,W,h)}
 if(v.m)cx.restore();cx.globalAlpha=1;return h}
let _wsilC=null,_wsilK='';function whiteSil(key,v){if(_wsilK===key&&_wsilC)return _wsilC;const w=Math.max(1,v.base.width>>1),h=Math.max(1,v.base.height>>1),c=_wsilC||(_wsilC=document.createElement('canvas'));c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(v.base,0,0,w,h);g.globalCompositeOperation='source-in';g.fillStyle='#fff6d8';g.fillRect(0,0,w,h);_wsilK=key;return c}
function drawShadow(key,X,Y,W,lt,sv,str){const v=VAR[key];if(!v||lt.sun<0.1)return;const h=W*v.base.height/v.base.width;if(offscreen(X,Y+h,W*2,h*2))return;
 cx.save();cx.globalAlpha=(0.19*lt.sun+0.05*(1-lt.sun))*(str||1);cx.translate(X,Y);cx.transform(1,0,-sv.kx,sv.ky,0,0);if(v.m)cx.scale(-1,1);cx.drawImage(v.sil,-W/2,-h,W,h);cx.restore()}
// ===== 블롭 스프라이트 캐시 (프레임당 그라디언트 생성 제거) =====
let BLOB={},_bN=0;function blob(rgb){if(BLOB[rgb])return BLOB[rgb];if(++_bN>300){BLOB={};_bN=0}const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,`rgba(${rgb},1)`);gr.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=gr;g.fillRect(0,0,64,64);return BLOB[rgb]=c}
let _gc={},_gcN=0;function parseC(c){let v=_gc[c];if(v)return v;if(++_gcN>3000){_gc={};_gcN=0}const m=c.match(/rgba?\(([^)]+)\)/);const p=m[1].split(',').map(x=>x.trim());v=_gc[c]=[p.slice(0,3).join(','),p[3]!=null?+p[3]:1];return v}
function ao(X,Y,rx,ry,a){const pa=cx.globalAlpha;cx.globalAlpha=pa*a*0.62;cx.drawImage(blob('28,24,52'),X-rx,Y-ry,rx*2,ry*2);cx.globalAlpha=pa;return;const g=cx.createRadialGradient(X,Y,0,X,Y,rx);g.addColorStop(0,`rgba(40,30,20,${a})`);g.addColorStop(1,'rgba(40,30,20,0)');cx.save();cx.translate(X,Y);cx.scale(1,ry/rx);cx.translate(-X,-Y);cx.fillStyle=g;cx.fillRect(X-rx,Y-rx,rx*2,rx*2);cx.restore()}
function objGeom(o){if(o.k=='gate'){const w=o.dir=='x'?3:1,h=o.dir=='x'?1:3;const[cX,cY]=iso(o.x+w/2,o.y+h/2);const sY=iso(o.x+w,o.y+h)[1];const W=(w+h)*TW/2*1.05;const v=VAR[skey(o)];const H=v?W*v.base.height/v.base.width:W;return{X:cX,Y:sY+1,cY,W,H}}
 const d=DEF[o.k],[fw,fh]=fpOf(o.k,o.rot);const[cX,cY]=iso(o.x+fw/2,o.y+fh/2);const sY=iso(o.x+fw,o.y+fh)[1];const W=(fw+fh)*TW/2*(d.sc||1);const v=VAR[skey(o)];const H=v?W*v.base.height/v.base.width:W;return{X:cX,Y:sY+(fw==1&&fh==1?-1:0.5),cY,W,H}}
function render(t){
 const lt=light(),sv=sunVec(),z=cam.z;
 cx.setTransform(DPR,0,0,DPR,0,0);cx.imageSmoothingEnabled=false;
 const sg=cx.createLinearGradient(0,0,0,VH);const sk=lt.sky;sg.addColorStop(0,`rgb(${sk})`);sg.addColorStop(1,`rgb(${sk.map(v=>Math.min(255,v+25))})`);cx.fillStyle=sg;cx.fillRect(0,0,VW,VH);
 drawBackdrop(lt);
 // 원경 숲
 cx.setTransform(DPR*z,0,0,DPR*z,DPR*cam.x,DPR*cam.y);
 if(groundDirty)buildGround();
 drawForest(lt);
 cx.drawImage(ground,-N*TW/2-4,0,ground.width,ground.height);
 // 잠긴 구역
 drawPlots(t,lt);
 // 건설 모드 그리드 + 열린 구역 테두리
 drawGrid();
 BUS.emit('ground',t,lt);
 if(paint){const{t}=paintPlan();const er=DEF[ghost].erase;cx.fillStyle=er?'rgba(240,110,100,0.5)':'rgba(140,230,140,0.5)';for(const[x,y]of t){const[X,Y]=iso(x,y);cx.beginPath();cx.moveTo(X,Y);cx.lineTo(X+16,Y+8);cx.lineTo(X,Y+16);cx.lineTo(X-16,Y+8);cx.fill()}}
 // 그림자 + 오브젝트 + 손님 정렬
 const list=[];
 for(const o of S.objs){if(DEF[o.k].pond&&o!==moving){list.push({x0:o.x,y0:o.y,x1:o.x+3,y1:o.y+3,o,part:'pondrim'});continue}if(!!DEF[o.k].isPath||DEF[o.k].flat||o===moving)continue;const t=tilesOf(o),l=t[t.length-1];
  if(o.k=='gate'){list.push({x0:t[0][0],y0:t[0][1],x1:t[0][0]+1,y1:t[0][1]+1,o,part:'back'});list.push({x0:l[0],y0:l[1],x1:l[0]+1,y1:l[1]+1,o,part:'front'});continue}
  list.push({x0:o.x,y0:o.y,x1:l[0]+1,y1:l[1]+1,o})}
 for(const g of guests)if(!g.hide&&!g.inBath)list.push({x0:g.x-0.15,y0:g.y-0.15,x1:g.x+0.15,y1:g.y+0.15,g});
 list.forEach(a=>a.z=a.x1+a.y1);
 const cmp=(a,b)=>{if(a.x1<=b.x0+1e-3&&!(b.x1<=a.x0))return a.y0>=b.y1?1:-1;if(b.x1<=a.x0+1e-3)return b.y0>=a.y1?-1:1;if(a.y1<=b.y0+1e-3)return -1;if(b.y1<=a.y0+1e-3)return 1;return a.z-b.z};
 // 삽입 정렬(위상 근사)
 const ov=(a,b)=>a.x0<b.x1+2&&b.x0<a.x1+2&&a.y0<b.y1+2&&b.y0<a.y1+2;
 const OB=list.filter(a=>!a.g).sort((p,q)=>p.z-q.z),GS=list.filter(a=>a.g).sort((p,q)=>p.z-q.z);
 // 오브젝트: 겹치는 쌍만 비교하는 위상 정렬 (z 우선)
 const n=OB.length,indeg=new Array(n).fill(0),adj=OB.map(()=>[]);for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){if(!ov(OB[a],OB[b]))continue;const c=cmp(OB[a],OB[b]);if(c<0){adj[a].push(b);indeg[b]++}else if(c>0){adj[b].push(a);indeg[a]++}}
 const sorted=[],done=new Array(n).fill(false);for(let k=0;k<n;k++){let pick=-1;for(let a=0;a<n;a++)if(!done[a]&&indeg[a]==0){pick=a;break}if(pick<0)for(let a=0;a<n;a++)if(!done[a]){pick=a;break}done[pick]=true;sorted.push(OB[pick]);for(const b of adj[pick])indeg[b]--}
 // 손님: 반드시 앞서야 하는 마지막 오브젝트 뒤에 삽입
 for(const g of GS){let i=0;for(let j=0;j<sorted.length;j++){const o=sorted[j];if(o.g){if(o.z<=g.z)i=Math.max(i,j+1);continue}if(ov(o,g)&&cmp(o,g)<0)i=j+1;else if(!ov(o,g)&&o.z<=g.z)i=Math.max(i,j+1)}
  for(let j=i-1;j>=0;j--){const o=sorted[j];if(!o.g&&ov(o,g)&&cmp(o,g)>0){i=j}}sorted.splice(i,0,g)}
 list.length=0;list.push(...sorted);window._order=list.filter(it=>it.o&&(!it.part||it.part=='pondrim')).map(it=>it.o);
 // 건설 중 커서가 건물 뒤에 가려지면 그 건물만 반투명 (손님이 지나갈 때는 반투명하지 않음)
 const hidden=new Set();if(hoverT&&ghost)for(const it of list){if(!it.o)continue;const o=it.o,G=objGeom(o);
  const pts=[iso(hoverT[0]+0.5,hoverT[1]+0.5)];
  if(pts.some(([X,Y])=>Math.abs(X-G.X)<G.W*0.42&&Y<G.Y-6&&Y>G.Y-G.H*0.9))hidden.add(o)}
 for(const it of list)if(it.o&&it.part!='front'){const o=it.o,G=objGeom(o),key=skey(o);if(o.k=='gate'){drawSprite(key+'_ground',o,G.X,G.Y,G.W,lt,sv,1)}ao(G.X,G.cY,G.W*0.5,G.W*0.25,0.3);drawShadow(key,G.X,G.Y,G.W,lt,sv,DEF[o.k].bath?0.4:1)}
 for(const it of list){
  if(it.part=='pondrim'){if(window.drawPondRim)drawPondRim(it.o);continue}if(it.part){const o=it.o,G=objGeom(o);drawSprite(skey(o)+'_'+it.part,o,G.X,G.Y,G.W,lt,sv,1)}
  else if(it.o){const o=it.o,d=DEF[o.k],G=objGeom(o);const an=anims['o'+S.objs.indexOf(o)];const pop=an?Math.min(1,an.t*3):1;
   const Wp=G.W*(0.7+0.3*easeOut(pop));const fade=hidden.has(o)&&!d.bath&&(d.fp>1||(d.fph||1)>1)&&!window.READONLY&&!document.body.classList.contains('zen');const sw_=(d.tree||d.flutter)?(Math.sin(t/1100+o.x*1.7+o.y)*0.018+(window.WIND||0)*0.025+(o.sway||0)*Math.sin(t/110)*0.25):0;if(sw_){cx.save();cx.translate(G.X,G.Y);cx.transform(1,0,-sw_,1,0,0);cx.translate(-G.X,-G.Y)}drawSprite(skey(o),o,G.X,G.Y,Wp,lt,sv,pop*(fade?0.5:1));if(sw_)cx.restore();
   if(d.bath){drawWater(o,G,t,lt);cx.save();if(o.k!='foot')bathClip(o);guests.filter(g=>g.inBath&&g.cur===o).sort((a,b)=>a.x+a.y-b.x-b.y).forEach(g=>drawGuest(g,t,lt,sv));cx.restore();const ov=skey(o)+'_over';if(VAR[ov]&&guests.some(g=>g.inBath&&g.cur===o))drawSprite(ov,o,G.X,G.Y,Wp,lt,sv,pop)}
   if(o.lv>1){for(let i=0;i<o.lv-1;i++){cx.fillStyle='#f6cf5a';cx.fillRect(G.X-8+i*4,G.Y+1,3,3)}}}
  else drawGuest(it.g,t,lt,sv);}
 // 대문 지붕·노렌 (항상 손님 위) + 노렌 흔들림
 for(const o of S.objs){if(o.k!='gate'||o===moving)continue;const G=objGeom(o),k=skey(o);drawSprite(k+'_roof',o,G.X,G.Y,G.W,lt,sv,1);
  const sw=Math.sin(t/140)*(o.sway||0);const top=G.Y-G.H*0.66;cx.save();cx.translate(G.X,top);cx.transform(1,0,sw*(o.dir=='y'?-1:1),1,0,0);cx.translate(-G.X,-top);drawSprite(k+'_noren',o,G.X,G.Y,G.W,lt,sv,1);cx.restore()}
 // 파티클
 let _fs='';const FS=c=>{if(c!==_fs){cx.fillStyle=c;_fs=c}};const _sb=blob('255,255,255');const _vb=cx.getTransform(),_iv=_vb.inverse(),_m=60,_q=[_iv.transformPoint({x:-_m,y:-_m}),_iv.transformPoint({x:cv.width+_m,y:cv.height+_m})];
 for(const p of parts){const[X,Y]=iso(p.x,p.y);if(X<_q[0].x||X>_q[1].x||Y-p.h<_q[0].y-40||Y-p.h>_q[1].y)continue;const a=Math.min(1,p.l/p.L*2)*(p.k=='steam'?1:1);
  if(p.k=='steam'){cx.globalAlpha=(0.13+0.04*lt.sun)*Math.min(1,p.l)*(1-0.35*lt.night);const r=p.s*0.85;cx.drawImage(_sb,X-r,Y-p.h-r,r*2,r*2)}
  else if(p.k=='spark'){cx.globalAlpha=Math.min(1,p.l);const tw=(Math.sin(t/60+p.x*9)+1)/2;FS(tw>0.5?'#fff6c0':'#ffd65a');cx.fillRect(X-1,Y-p.h-1,2,2);if(tw>0.6){cx.fillRect(X-3,Y-p.h-0.4,6,0.8);cx.fillRect(X-0.4,Y-p.h-3,0.8,6)}}
  else if(p.k=='dust'){cx.globalAlpha=0.5*p.l;FS('#e8dcc0');cx.beginPath();cx.arc(X,Y,2+(0.9-p.l)*4,0,6.283);cx.fill()}
  else{cx.globalAlpha=Math.min(1,p.l);FS(p.k=='petal'?'#ffc6d9':p.k=='leaf'?(p.ph%2<1?'#e8643a':'#f0a03a'):p.k=='gleaf'?(p.ph%2<1?'#f2c94c':'#e3ad2a'):p.k=='ume'?'#fff6f8':'#ffffff');const w=p.k=='snow'?1:Math.abs(Math.sin(p.ph))*1.5+0.6;cx.fillRect(X,Y-p.h,w,1)}}
 cx.globalAlpha=1;drawBuild(t);BUS.emit('over',t,lt,sv);
 // 빛줄기 (낮) – 김 사이로
 if(lt.sun>0.2&&!window.GFX_LOW){cx.save();cx.globalCompositeOperation='screen';for(const o of S.objs){if(!DEF[o.k].bath)continue;const G=objGeom(o);
   for(let i=0;i<3;i++){const ox=G.X-G.W*0.35+i*G.W*0.3+Math.sin(t/3000+i)*4;const a=(0.07+0.04*Math.sin(t/1700+i*2))*lt.sun;
    const gr=cx.createLinearGradient(ox-40,G.cY-90,ox,G.cY);gr.addColorStop(0,'rgba(255,246,214,0)');gr.addColorStop(0.6,`rgba(255,246,214,${a})`);gr.addColorStop(1,'rgba(255,246,214,0)');
    cx.fillStyle=gr;cx.beginPath();cx.moveTo(ox-50+sv.kx*10,G.cY-100);cx.lineTo(ox-38+sv.kx*10,G.cY-100);cx.lineTo(ox+8,G.cY+4);cx.lineTo(ox-4,G.cY+4);cx.fill()}}cx.restore()}
 // 고스트
 if(ghost=='gate'&&hoverT){const sp=gateSpot(hoverT[0],hoverT[1]);const t=sp?gTiles(sp.x,sp.y,sp.dir):[hoverT];cx.fillStyle=sp?'rgba(140,230,140,0.5)':'rgba(240,110,100,0.5)';for(const[x,y]of t){const[X,Y]=iso(x,y);cx.beginPath();cx.moveTo(X,Y);cx.lineTo(X+16,Y+8);cx.lineTo(X,Y+16);cx.lineTo(X-16,Y+8);cx.fill()}if(sp){const o={k:'gate',...sp};const G=objGeom(o);drawSprite(skey(o),o,G.X,G.Y,G.W,lt,sv,0.65)}}
 else if(ghost&&hoverT){const r=moving?moving.rot:ROT;const ok=canPlace(ghost,hoverT[0],hoverT[1],r);const[fw,fh]=fpOf(ghost,r);cx.fillStyle=ok?'rgba(140,230,140,0.45)':'rgba(240,110,100,0.45)';
  for(let i=0;i<fw;i++)for(let j=0;j<fh;j++){const[X,Y]=iso(hoverT[0]+i,hoverT[1]+j);cx.beginPath();cx.moveTo(X,Y);cx.lineTo(X+16,Y+8);cx.lineTo(X,Y+16);cx.lineTo(X-16,Y+8);cx.fill()}
  const[p0,p1,p2,p3]=[[hoverT[0],hoverT[1]],[hoverT[0]+fw,hoverT[1]],[hoverT[0]+fw,hoverT[1]+fh],[hoverT[0],hoverT[1]+fh]].map(([x,y])=>iso(x,y));
  cx.strokeStyle=ok?'rgba(210,255,195,0.95)':'rgba(255,165,155,0.95)';cx.lineWidth=1.2;cx.beginPath();cx.moveTo(...p0);cx.lineTo(...p1);cx.lineTo(...p2);cx.lineTo(...p3);cx.closePath();cx.stroke();
  if(DEF[ghost].img||VAR[ghost]){const o={k:ghost,x:hoverT[0],y:hoverT[1],lv:moving?moving.lv:1,rot:r};const G=objGeom(o);drawSprite(skey(o),o,G.X,G.Y,G.W,lt,sv,0.65)}}
 // 조명: 주변광 곱하기
 cx.setTransform(DPR,0,0,DPR,0,0);if(Math.min(...lt.amb)<250){cx.globalCompositeOperation='multiply';cx.fillStyle=`rgb(${lt.amb})`;cx.fillRect(0,0,VW,VH)}
 // 따뜻한 햇살 그라디언트
 cx.globalCompositeOperation='screen';if(lt.sun>0.1){cx.drawImage(sunTex(sv.left,Math.round(lt.sun*24)/24,VW/VH),0,0,VW,VH)}
 // 점광원 (밤): 시설별 내장 조명 — 스프라이트 발광맵(등롱·창) + 바닥 빛웅덩이 + 탕 수중등
 if(lt.night>0.1)nightLights(t,lt,z);
 cx.globalCompositeOperation='source-over';
 BUS.emit('screen',t,lt);cx.globalCompositeOperation='source-over';cx.globalAlpha=1;
 drawText(t,lt);
}
function drawGrid(){const P=N/PS;
 if(ghost||mode=='del'){cx.lineWidth=0.6;cx.strokeStyle='rgba(255,255,255,0.55)';cx.beginPath();
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!tileOpen(x,y))continue;const[X,Y]=iso(x,y);cx.moveTo(X,Y);cx.lineTo(X+16,Y+8);cx.lineTo(X,Y+16);cx.lineTo(X-16,Y+8);cx.closePath()}cx.stroke();
  cx.fillStyle='rgba(240,90,80,0.22)';for(const k in OCC){const[x,y]=k.split(',').map(Number);if(DEF[OCC[k].k].isPath)continue;const[X,Y]=iso(x,y);cx.beginPath();cx.moveTo(X,Y);cx.lineTo(X+16,Y+8);cx.lineTo(X,Y+16);cx.lineTo(X-16,Y+8);cx.fill()}}
 if((ghost||mode=='del')&&window._unreach&&_unreach.length){cx.fillStyle='rgba(255,150,70,0.30)';for(const[x,y]of _unreach){const[X,Y]=iso(x,y);cx.beginPath();cx.moveTo(X,Y);cx.lineTo(X+16,Y+8);cx.lineTo(X,Y+16);cx.lineTo(X-16,Y+8);cx.fill()}}
 cx.save();cx.setLineDash([3,2]);cx.lineWidth=1;cx.strokeStyle='rgba(255,248,220,0.8)';cx.beginPath();
 for(let py=0;py<P;py++)for(let px=0;px<P;px++){if(!plotOpen(px,py))continue;const x0=px*PS,y0=py*PS;
  const E=[[[x0,y0],[x0+PS,y0],!plotOpen(px,py-1)],[[x0+PS,y0],[x0+PS,y0+PS],!plotOpen(px+1,py)],[[x0+PS,y0+PS],[x0,y0+PS],!plotOpen(px,py+1)],[[x0,y0+PS],[x0,y0],!plotOpen(px-1,py)]];
  for(const[a,b,on]of E)if(on){cx.moveTo(...iso(...a));cx.lineTo(...iso(...b))}}cx.stroke();cx.restore()}
const easeOut=t=>1-Math.pow(1-t,3);
const EMI={},LMI={};let _emiS=null;function emiOf(key){if(key in EMI)return EMI[key];const mir=key.includes('~m'),bk=key.replace('~m','');const L=(window.LIGHTS||{})[bk];if(!L)return EMI[key]=null;if(mir){const b=emiOf(bk);return b?EMI[key]={c:b.c,m:1,pts:b.pts.map(([x,y,w])=>[1-x,y,w])}:null}
 let im=LMI[bk];if(!im){im=LMI[bk]=new Image();im.src='assets/lights/'+(SPRALIAS[bk]||bk)+'.png'}if(!im.complete||!im.naturalWidth)return null;
 const sc=Math.min(1,112/Math.max(im.naturalWidth,im.naturalHeight,1)),W=Math.max(1,Math.round(im.naturalWidth*sc)),H=Math.max(1,Math.round(im.naturalHeight*sc)),c=mk(W,H),g=c.getContext('2d');
 // 번짐: 공용 스크래치 캔버스 축소-확대 소프트 글로우 + 원본
 const sw=Math.max(1,W>>2),sh=Math.max(1,H>>2),s2=_emiS||(_emiS=mk(sw,sh));s2.width=sw;s2.height=sh;const g2=s2.getContext('2d');g2.drawImage(im,0,0,sw,sh);g.imageSmoothingEnabled=true;g.globalAlpha=0.5;g.drawImage(s2,0,0,W,H);g.globalAlpha=1;g.drawImage(im,0,0,W,H);delete LMI[bk];
 return EMI[key]={c,pts:L.map(([x,y,w])=>[x,y,w])}}
function nightLights(t,lt,z){const k0=Math.min(1,(lt.night-0.1)/0.5),k=k0*k0*(3-2*k0);const low=window.GFX_LOW;GLK.k=k;
 for(const o of S.objs){const d=DEF[o.k];if(d.isPath||o===moving)continue;const G=objGeom(o);const[sx,sy]=toScreen(G.X,G.Y);const[gx,gy]=toScreen(G.X,G.cY);if(sx<-G.W*z-180||sx>VW+G.W*z+180||sy<-180||sy-G.H*z>VH+180)continue;
  const lv=o.lv||1,key=skey(o),ph=(o.x*7.1+o.y*3.3),flip=o.rot&1,[fw,fh]=fpOf(o.k,o.rot);
  // 켜지는 순서를 시설마다 살짝 다르게 (해질녘에 하나씩 점등)
  const on=Math.max(0,Math.min(1,(k-((ph*0.37)%1)*0.22)/0.78));if(on<=0)continue;
  const fl=0.93+0.045*Math.sin(t/170+ph)+0.025*Math.sin(t/53+ph*3);
  const e=o.k=='gate'?null:emiOf(key);
  if(e){const x0=sx-G.W/2*z,y0=sy-G.H*z;cx.globalCompositeOperation='lighter';cx.globalAlpha=Math.min(1,(0.78+0.2*k)*on*fl);if(e.m){cx.save();cx.translate(sx*2,0);cx.scale(-1,1)}cx.drawImage(e.c,x0,y0,G.W*z,G.H*z);if(e.m)cx.restore();
   if(!d.light){cx.globalCompositeOperation='screen';cx.globalAlpha=1;
    if(!low){cx.save();cx.translate(gx,gy+2*z);cx.scale(1,0.50);glow(0,0,(44+Math.max(fw,fh)*12+lv*3)*z,`rgba(255,192,110,${0.15*on*fl})`);cx.restore()}
    const nP=low?1:Math.min(e.pts.length,2+Math.floor(lv/2));for(let i=0;i<nP;i++){const[u,v]=e.pts[i];const X=x0+u*G.W*z,Y=y0+v*G.H*z,f2=fl+0.04*Math.sin(t/90+i*2.1+ph);
     cx.globalAlpha=1;glow(X,Y,(15+lv*1.8)*z,`rgba(255,202,124,${0.22*on*f2})`);
     if(!low&&i<2){cx.save();cx.translate(X,sy-1*z);cx.scale(1,0.48);glow(0,0,(30+lv*3)*z,`rgba(255,184,102,${0.14*on*f2})`);cx.restore()}}}}
  if(d.light){
   // 조명 주변 바닥 타일을 은은하고 또렷하게 비추는 지면 조명 풀 (뿌연 빛번짐 억제)
   const pt0=d.light[0],col0=pt0[2]||[255,208,128],rm0=Math.max(...d.light.map(p=>p[3]||1.15)),span=Math.max(fw,fh);
   const f0=d.fire?(0.85+0.10*Math.sin(t/52+ph)+0.07*Math.cos(t/29+ph*2)):d.neon?(0.94+0.06*Math.sin(t/115+ph)):fl;
   cx.globalCompositeOperation='screen';cx.globalAlpha=1;
   cx.save();cx.translate(gx,gy+2*z);cx.scale(1,0.52);
   glow(0,0,(58*rm0+(span-1)*14)*z,`rgba(${col0[0]},${col0[1]},${col0[2]},${0.19*on*f0})`);
   glow(0,0,(32*rm0+(span-1)*8)*z,`rgba(255,226,162,${0.15*on*f0})`);
   cx.restore();
   for(let i=0;i<d.light.length;i++){const pt=d.light[i],lx=flip?-pt[0]:pt[0],ly=pt[1],col=pt[2]||[255,212,134],rm=pt[3]||1.15;
    const[X,Y]=toScreen(G.X+lx*G.W,G.Y+ly*G.H);
    const f2=d.fire?(0.85+0.10*Math.sin(t/52+ph+i)+0.07*Math.cos(t/29+ph*2)):d.neon?(0.94+0.06*Math.sin(t/115+ph+i)):fl;
    cx.globalCompositeOperation='screen';cx.globalAlpha=1;
    glow(X,Y,25*rm*z,`rgba(${col[0]},${col[1]},${col[2]},${0.20*on*f2})`);
    if(i===0||span>1||d.light.length<=3){cx.save();cx.translate(X,sy+1*z);cx.scale(1,0.50);glow(0,0,42*rm*z,`rgba(${col[0]},${col[1]},${col[2]},${0.16*on*f2})`);cx.restore()}
    cx.globalCompositeOperation='lighter';
    glow(X,Y,8.5*rm*z,`rgba(${col[0]},${col[1]},${col[2]},${0.34*on*f2})`);
    if(!e)glow(X,Y,3.4*rm*z,`rgba(255,246,220,${0.64*on*f2})`)}}
  // 탕: 수중등 + 가장자리 등 (레벨에 따라 늘어남)
  if(d.bath&&!d.inside){const W=wgeo(o);const[X,Y]=toScreen(W.cX,W.cY);cx.globalCompositeOperation='screen';cx.globalAlpha=1;cx.save();cx.translate(X,Y);cx.scale(1,W.ry/W.rx);
    glow(0,0,W.rx*z*1.32,`rgba(120,225,218,${0.20*on*fl})`);glow(0,W.rx*0.22*z,W.rx*z*0.88,`rgba(255,212,146,${(0.15+0.03*lv)*on*fl})`);cx.restore();
   cx.globalCompositeOperation='lighter';const nE=low?0:Math.min(8,lv*2-1);for(let i=0;i<nE;i++){const a=Math.PI*(0.15+0.7*(i+0.5)/nE);const ex=X+Math.cos(a)*W.rx*z*0.98,ey=Y+Math.sin(a)*W.ry*z*0.98+1*z,f3=fl+0.06*Math.sin(t/120+i);
    glow(ex,ey,3.8*z,`rgba(255,232,180,${0.58*on*f3})`);glow(ex,ey-W.ry*0.3*z,11*z,`rgba(255,194,122,${0.14*on*f3})`)}}
  // 가게 앞 길가 등 (Lv2·Lv4에서 추가)
  if(d.price&&!d.bath&&!low){const n=lv>=4?2:lv>=2?1:0;for(let i=0;i<n;i++){const s_=i?1:-1;const X=sx+s_*G.W*0.46*z,Y=sy-2*z;cx.globalAlpha=1;
    cx.globalCompositeOperation='lighter';glow(X,Y-5*z,3.5*z,`rgba(255,236,190,${0.68*on*fl})`);
    cx.globalCompositeOperation='screen';glow(X,Y-5*z,18*z,`rgba(255,194,114,${0.18*on*fl})`);cx.save();cx.translate(X,Y);cx.scale(1,0.48);glow(0,0,30*z,`rgba(255,178,98,${0.15*on*fl})`);cx.restore()}}}
 cx.globalAlpha=1;BUS.emit('nightlight',t,lt,k,z);GLK.k=0}
const GLK={k:0}; // 밤 조명 패스 보정(k=밤 정도): 화면을 뿌옇게 하는 넓은 번짐은 줄이고, 조명 주변 빛웅덩이·불빛 중심은 키움
function glow(X,Y,r,c){const[rgb,a]=parseC(c);const pa=cx.globalAlpha;let f=1;if(GLK.k){const op=cx.globalCompositeOperation,rz=r/Math.max(0.5,cam.z);f=op=='lighter'?1+0.5*GLK.k:op=='screen'?(rz>48?1-0.45*GLK.k:1+0.3*GLK.k):1}cx.globalAlpha=Math.min(1,pa*a*f);cx.drawImage(blob(rgb),X-r,Y-r,r*2,r*2);cx.globalAlpha=pa;return;const g=cx.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(X-r,Y-r,r*2,r*2)}
let FOREST=null;// ===== 원경: 계곡·숲·강 회화 배경 (화면 공간 1장, 줌/이동 시차, 시간대·계절 색조) =====
const BG=new Image();BG.src='assets/bg/valley.jpg';const SEA_T=['rgba(255,190,210,0.10)',null,'rgba(230,120,40,0.16)','rgba(235,242,255,0.38)'];
function drawBackdrop(lt){if(!BG.complete||!BG.naturalWidth)return;const iw=BG.naturalWidth,ih=BG.naturalHeight;
 const [mx,my]=iso(N/2,N/2);const sx=mx*cam.z+cam.x,sy=my*cam.z+cam.y;const zk=1+Math.log2(Math.max(0.3,cam.z/zmin()))*0.05;
 const sc=Math.max(VW/iw,VH/ih)*1.25*zk,w=iw*sc,h=ih*sc;const px=(sx-VW/2)*0.18,py=(sy-VH/2)*0.18;
 cx.imageSmoothingEnabled=true;cx.drawImage(BG,VW/2-w/2+px,VH*0.46-h/2+py,w,h);cx.imageSmoothingEnabled=false;
 const se=SEA_T[season()];if(se){cx.fillStyle=se;cx.fillRect(0,0,VW,VH)}
 cx.globalCompositeOperation='multiply';cx.fillStyle=`rgba(${lt.sky},0.32)`;cx.fillRect(0,0,VW,VH);cx.globalCompositeOperation='source-over';
 if(lt.night>0.05){cx.fillStyle=`rgba(12,18,44,${Math.min(0.38,lt.night*0.38)})`;cx.fillRect(0,0,VW,VH)}
}
function drawForest(lt){if(!FOREST){const x0=-60*TW/2,y0=-160,W=(N+12)*TW,H=(N+8)*TH/2+200;const c=mk(W,H),g=c.getContext('2d');g.translate(-x0,-y0);const _cx=cx;cx=g;drawForest_();cx=_cx;FOREST={c,x0,y0,W,H}}cx.drawImage(FOREST.c,FOREST.x0,FOREST.y0,FOREST.W,FOREST.H)}
function drawForest_(){const r=rng(42);for(let i=0;i<180;i++){const side=i%2;const k=r()*N;const x=side?-1.5-r()*3.5:k,y=side?k:-1.5-r()*3.5;const[X,Y]=iso(x,y);const h=18+r()*18;const aut=r()<0.42;
  // 깊은 인디고-플럼 나무 그림자 및 줄기 (#28243c)
  cx.fillStyle='rgba(34,30,56,0.55)';cx.beginPath();cx.ellipse(X+2,Y+1,8,3.8,0,0,6.283);cx.fill();
  cx.fillStyle='#2d2740';cx.fillRect(X-1.5,Y-5,3,5);
  if(aut){
   // 레퍼런스 이미지의 선명한 주홍·산호·호박색 단풍나무 군락
   cx.fillStyle='#8c242b';cx.beginPath();cx.arc(X+1.5,Y-h*0.48,7.5,0,6.283);cx.fill();
   cx.fillStyle=r()<0.5?'#e85228':'#d63828';cx.beginPath();cx.arc(X-1,Y-h*0.58,7,0,6.283);cx.fill();
   cx.fillStyle='#f79d38';cx.beginPath();cx.arc(X-2.5,Y-h*0.66,4.5,0,6.283);cx.fill();
  }else{
   // 깊은 청록 그림자와 따뜻한 올리브 하이라이트의 삼나무/소나무
   cx.fillStyle='#2b4a3e';cx.beginPath();cx.moveTo(X,Y-h);cx.lineTo(X+9.5,Y);cx.lineTo(X-9.5,Y);cx.fill();
   cx.fillStyle=`rgb(${68+r()*24|0},${122+r()*28|0},${56+r()*16|0})`;cx.beginPath();cx.moveTo(X,Y-h);cx.lineTo(X+2,Y);cx.lineTo(X-9.5,Y);cx.fill();
   cx.fillStyle='rgba(166,204,84,0.55)';cx.beginPath();cx.moveTo(X,Y-h);cx.lineTo(X-3,Y-h*0.2);cx.lineTo(X-8.5,Y-h*0.1);cx.fill();
  }}}
const WGEO={milky:{ins:0.7,lift:12}};
function wgeo(o){const d=DEF[o.k],f=d.fp,w=WGEO[d.like||o.k];const sk0=skey(o),e0=(window.WATER||{})[sk0.replace('~m','')],e=e0&&sk0.includes('~m')?{...e0,cx:1-e0.cx}:e0;
 if(e){const G=objGeom(o);const cX=G.X+(e.cx-0.5)*G.W,cY=G.Y-G.H+e.cy*G.H;const dia=(d.like||o.k)=='milky',s=dia?1.5:1;return{d,f,cX,cY,rx:e.rx*G.W*s,ry:e.ry*G.H*s,dia}}
 const[cX,cY0]=iso(o.x+f/2,o.y+f/2);if(w){const k=f/2-w.ins;return{d,f,cX,cY:cY0-w.lift,rx:k*TW,ry:k*TH,dia:1}}return{d,f,cX,cY:cY0,rx:f*TW*0.25,ry:f*TH*0.25,dia:0}}
function wpath(W){cx.beginPath();if(W.dia){cx.moveTo(W.cX,W.cY-W.ry);cx.lineTo(W.cX+W.rx,W.cY);cx.lineTo(W.cX,W.cY+W.ry);cx.lineTo(W.cX-W.rx,W.cY);cx.closePath()}else cx.ellipse(W.cX,W.cY-1,W.rx,W.ry,0,0,6.283)}
function drawMilky(W,t,lt){const{cX,cY,rx,ry}=W;const sk=lt.sky,n=lt.night,su=lt.sun;
 const mix=(a,b,k)=>a.map((v,i)=>Math.round(v*(1-k)+b[i]*k));const base=mix([226,224,212],sk,0.08),deep=mix([112,170,172],sk,0.15);
 const g=cx.createLinearGradient(cX,cY-ry,cX,cY+ry);g.addColorStop(0,`rgba(${deep},0.85)`);g.addColorStop(0.5,`rgba(${base},0.8)`);g.addColorStop(1,`rgba(${mix(base,[255,255,255],0.35)},0.82)`);cx.fillStyle=g;cx.fill();
 // 은은하게 흐르는 우윳빛 구름
 const B=blob('255,253,245');const PH=t/(ry*2.4*90)*6.283;for(let i=0;i<7;i++){const a=PH*(i%3==0?1:0)+Math.sin(PH+i)*0.35+i*0.9,r=0.55+0.3*Math.sin(i*2.1);const X=cX+Math.cos(a*(i%2?1:-1)+i)*rx*0.45*r,Y=cY+Math.sin(a*1.3+i*1.7)*ry*0.45*r;cx.globalAlpha=0.32+0.15*Math.sin(PH+i);cx.drawImage(B,X-rx*0.32,Y-ry*0.32,rx*0.64,ry*0.64)}
 cx.globalAlpha=1;
 // 하늘빛 반사 (새벽·저녁·밤에도 물이 빛을 머금도록)
 {const sl=mix(sk,n>0.5?[170,190,255]:[255,240,214],0.55),k=0.28*(1-su*0.75);const rg=cx.createLinearGradient(cX-rx*0.3,cY-ry,cX+rx*0.3,cY+ry);rg.addColorStop(0,`rgba(${sl},${k})`);rg.addColorStop(0.5,`rgba(${sl},${k*0.25})`);rg.addColorStop(1,`rgba(${sl},${k*0.6})`);cx.globalCompositeOperation='screen';cx.fillStyle=rg;cx.fillRect(cX-rx,cY-ry,rx*2,ry*2)}
 // 비스듬한 물비늘 띠 (등각 축 방향)
 cx.globalCompositeOperation='screen';for(let i=0;i<5;i++){const u=((PH/6.283+i/5)%1)*2-1;const X=cX+u*rx,Y=cY-u*ry*0.0;cx.strokeStyle=`rgba(255,250,235,${(0.10+0.10*su)*(1-Math.abs(u))})`;cx.lineWidth=1.2;cx.beginPath();cx.moveTo(X-rx*0.5,Y-ry*0.5+u*ry*0.5);cx.lineTo(X+rx*0.5,Y+ry*0.5+u*ry*0.5);cx.stroke()}
 // 반짝임
 for(let i=0;i<9;i++){const q=(PH*(1+i%2)+i*2.3)%6.283,v=Math.max(0,Math.sin(q*2))**6;if(v<0.05)continue;const a=i*1.7,rr=0.25+0.5*((i*0.37)%1);cx.fillStyle=`rgba(255,255,245,${v*(0.5+0.4*su)})`;cx.fillRect(cX+Math.cos(a)*rx*rr*0.7-1,cY+Math.sin(a)*ry*rr*0.7,2.2,0.7)}
 cx.globalCompositeOperation='source-over';
 // 안쪽 벽 그림자 (뒤쪽 두 변)
 cx.strokeStyle=`rgba(80,70,60,${0.28-0.1*n})`;cx.lineWidth=2.2;cx.beginPath();cx.moveTo(cX-rx,cY);cx.lineTo(cX,cY-ry);cx.lineTo(cX+rx,cY);cx.stroke();
 cx.strokeStyle='rgba(255,255,255,0.35)';cx.lineWidth=0.7;cx.beginPath();cx.moveTo(cX-rx+3,cY+1);cx.lineTo(cX,cY-ry+2.2);cx.lineTo(cX+rx-3,cY+1);cx.stroke();
}
function drawWater_(o,G,t,lt){if(o.k=='foot')return;const W=wgeo(o);const{d,f,cX,cY,rx,ry}=W;
 const irx=rx*0.72,iry=ry*0.72;
 cx.save();cx.beginPath();cx.ellipse(cX,cY-1,irx,iry,0,0,6.283);cx.clip();
 // 스프라이트 자체 픽셀아트 수면을 가리지 않도록 불투명 원형 그라디언트는 생략하고 은은한 물비늘·반짝임만 추가
 cx.globalCompositeOperation='screen';
 for(let i=0;i<3;i++){const y=cY-iry+((t/95+i*iry*0.65)%(iry*2.2));cx.fillStyle=o.k=='wine'?`rgba(255,190,210,${0.10+0.06*lt.sun})`:`rgba(195,252,246,${0.11+0.07*lt.sun})`;cx.fillRect(cX-irx*0.7,y,irx*1.4,0.6)}
 const r=rng(Math.floor(t/240)+o.x*31);for(let i=0;i<7;i++){const a=r()*6.28,rr=Math.sqrt(r())*0.85;cx.fillStyle=`rgba(248,255,225,${0.45+0.35*lt.sun})`;cx.fillRect(cX+Math.cos(a)*irx*rr,cY+Math.sin(a)*iry*rr,1.1,0.65)}
 cx.globalCompositeOperation='source-over';cx.restore()}
const SUNT={};function sunTex(left,sun,ar){const k=left+'|'+sun+'|'+ar.toFixed(2);if(SUNT.k===k)return SUNT.c;const H=180,W=Math.round(H*ar),c=SUNT.c||document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const gr=g.createRadialGradient(left?W*0.05:W*0.95,-H*0.15,0,left?W*0.05:W*0.95,-H*0.15,H*0.55);gr.addColorStop(0,`rgba(255,240,195,${0.08*sun})`);gr.addColorStop(1,'rgba(255,240,195,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);SUNT.k=k;SUNT.c=c;return c}
function drawWater(o,G,t,lt){if(o.k=='foot')return;const W=wgeo(o);const{cX,cY,rx,ry}=W;
 cx.save();drawWater_(o,G,t,lt);cx.beginPath();cx.ellipse(cX,cY-1,rx*0.72,ry*0.72,0,0,6.283);cx.clip();const d=DEF[o.k];if(d.tint)tintWater(o,d,cX,cY,rx*0.72,ry*0.72,t,lt);BUS.emit('water',o,cX,cY,rx*0.72,ry*0.72,t,lt);cx.restore()}
// 확장 탕 수면 효과: 우윳빛 막·기포·꽃잎·별 (물빛 자체는 불러올 때 그림에서 바꿈 → makeVariants)
function tintWater(o,d,cX,cY,rx,ry,t,lt){
 if(d.veil){cx.globalCompositeOperation='screen';cx.globalAlpha=d.veil;cx.fillStyle='rgb(250,248,232)';cx.fillRect(cX-rx,cY-ry-2,rx*2,ry*2+4)}
 cx.globalCompositeOperation='source-over';cx.globalAlpha=1;const R=rng(o.x*97+o.y*13);
 if(d.wfx=='bubble'){for(let i=0;i<14;i++){const ph=((t/1600+R())%1),a=R()*6.28,rr=Math.sqrt(R())*0.8;const X=cX+Math.cos(a)*rx*rr,Y=cY+Math.sin(a)*ry*rr-ph*3;cx.globalAlpha=0.75*(1-ph);cx.strokeStyle='#f4fdff';cx.lineWidth=0.5;cx.beginPath();cx.arc(X,Y,0.6+ph*0.7,0,6.283);cx.stroke()}}
 else if(d.wfx=='petal'){for(let i=0;i<12;i++){const a=R()*6.28+t/9000*(R()<0.5?1:-1),rr=0.25+R()*0.6;const X=cX+Math.cos(a)*rx*rr,Y=cY+Math.sin(a)*ry*rr;cx.globalAlpha=0.9;cx.fillStyle=i%3?'#ffd3df':'#fff1f4';cx.fillRect(X-1,Y-0.5,2,1.2)}}
 else if(d.wfx=='star'){const nn=0.35+0.65*lt.night;for(let i=0;i<16;i++){const a=R()*6.28,rr=Math.sqrt(R())*0.85,tw=Math.max(0,Math.sin(t/(500+R()*700)+i*1.7));const X=cX+Math.cos(a)*rx*rr,Y=cY+Math.sin(a)*ry*rr;cx.globalAlpha=nn*tw;cx.fillStyle='#fffbe6';cx.fillRect(X-0.5,Y-0.5,1,1);if(tw>0.85){cx.fillRect(X-1.6,Y-0.15,3.2,0.3);cx.fillRect(X-0.15,Y-1.6,0.3,3.2)}}}
 cx.globalAlpha=1}
function drawGuest(g,t,lt,sv){if(g.inBath&&g.cur&&g.cur.k=='foot'){
  const o=g.cur;[g.x,g.y]=bathSlot(o,g.slot||0);const[X,Y]=iso(g.x,g.y);
  if(g.vip||g.reg){cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=g.vip?0.35:0.28;cx.drawImage(blob(g.vip?'255,215,90':'140,200,255'),X-12,Y-18,24,24);cx.globalAlpha=1;cx.restore()}
  const v=VAR[g.spr];if(!v)return;
  const lv=o.lv||1,dir=(lv<=2)?((o.rot&1)?1:-1):((o.rot&1)?1:-1);
  const W=13,h=W*v.base.height/v.base.width*0.85,bob=Math.sin(t/520+g.bob)*0.35-(g.hz||0)*0.4;
  const fx=X+dir*2.4,fy=Y-0.6+bob*0.4;
  ao(X-dir*1.2,Y-1.2,4.2,1.8,0.20);
  cx.save();cx.translate(X,Y-bob);cx.scale(dir,1);
  cx.drawImage(v.base,-W/2,-h,W,h);
  if(lt.sun>0.15){cx.globalAlpha=0.38*lt.sun;cx.drawImage(sv.left?v.rimL:v.rimR,-W/2,-h,W,h);cx.globalAlpha=1}
  if(g.slot%3==1){cx.fillStyle='#f6c431';cx.beginPath();cx.arc(0.5,-h+1.2,1.6,0,6.283);cx.fill();cx.fillStyle='#58a832';cx.fillRect(0.2,-h-0.6,0.9,0.7)}
  else{cx.fillStyle='#faf6ec';cx.fillRect(-2.4,-h+0.4,4.8,1.6);cx.fillStyle='#d8cbb8';cx.fillRect(-2.4,-h+1.6,4.8,0.5)}
  cx.restore();
  const ph=((t/750+g.bob)%1);
  cx.strokeStyle=`rgba(205,252,255,${0.62*(1-ph*0.5)})`;cx.lineWidth=0.65;
  cx.beginPath();cx.ellipse(fx,fy,3.2+ph*2.2,1.3+ph*0.9,0,0,6.283);cx.stroke();
  cx.fillStyle='rgba(235,255,255,0.78)';
  const kick=Math.sin(t/240+g.bob*2.1);
  if(kick>0.2){cx.fillRect(fx+dir*1.8,fy-1.6-kick*1.4,0.9,0.9);cx.fillRect(fx-dir*0.8,fy-1.2-kick*1.0,0.7,0.7)}
  return}
 const[X,Y]=iso(g.x,g.y);if(g.vip||g.reg){cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=g.vip?0.35:0.28;cx.drawImage(blob(g.vip?'255,215,90':'140,200,255'),X-12,Y-18,24,24);cx.globalAlpha=1;cx.restore()}
 if(g.inBath){const v=VAR[g.cb];if(!v)return;const W=17,h=W*v.base.height/v.base.width,bob=Math.sin(t/600+g.bob)*0.4-(g.hz||0)*0.5,ch=h*0.8;
  cx.drawImage(v.base,0,0,v.base.width,v.base.height*0.8,X-W/2,Y-ch+2+bob,W,ch);
  cx.fillStyle='rgba(180,240,240,0.55)';cx.beginPath();cx.ellipse(X,Y+2+bob,W*0.55,1.6,0,0,6.283);cx.fill();
  if(g.slot%3==1){const yx=X+W*0.7,yy=Y+2+Math.sin(t/700+g.bob)*0.6;cx.fillStyle='#f6c431';cx.beginPath();cx.arc(yx,yy,1.6,0,6.283);cx.fill();cx.fillStyle='#fff3a0';cx.fillRect(yx-0.8,yy-1,0.8,0.6)}
  return}
 const v=VAR[g.spr];if(!v)return;const W=14,h=W*v.base.height/v.base.width;const moving=Math.hypot(g.tx-g.x,g.ty-g.y)>0.05;const bob=(moving?Math.abs(Math.sin(t/120+g.bob))*1.2:0)+(g.z||0)+(g.hz||0);
 cx.globalAlpha=g.fade;ao(X,Y,5,2.2,0.22);
 if(lt.sun>0.1){cx.save();cx.globalAlpha=0.15*lt.sun*g.fade;cx.translate(X,Y);cx.transform(1,0,-sv.kx,sv.ky,0,0);if(v.m)cx.scale(-1,1);cx.drawImage(v.sil,-W/2,-h,W,h);cx.restore()}
 cx.globalAlpha=g.fade;cx.save();cx.translate(X,Y-bob);cx.scale(g.dir,1);cx.drawImage(v.base,-W/2,-h,W,h);if(lt.sun>0.15){cx.globalAlpha=0.45*lt.sun*g.fade;cx.drawImage(sv.left?v.rimL:v.rimR,-W/2,-h,W,h)}cx.restore();cx.globalAlpha=1}
// 잠긴 구역: 안개, 로프 울타리, 가격 표지판
function drawPlots(t,lt){const P=N/PS;window._signs=[];
 for(let py=0;py<P;py++)for(let px=0;px<P;px++){const k=px+','+py,open=plotOpen(px,py);const an=anims['p'+k];
  let fog=open?0:1;if(an)fog=1-easeOut(Math.min(1,an.t));if(fog<=0)continue;
  const x0=px*PS,y0=py*PS;const c=[iso(x0,y0),iso(x0+PS,y0),iso(x0+PS,y0+PS),iso(x0,y0+PS)];
  cx.beginPath();cx.moveTo(...c[0]);c.slice(1).forEach(p=>cx.lineTo(...p));cx.closePath();
  cx.save();cx.clip();cx.fillStyle=`rgba(28,26,52,${0.12*fog})`;cx.fill();cx.restore();
  if(!open&&plotAdj(px,py)){ // 로프 울타리
   const T=[[x0,y0],[x0+PS,y0],[x0+PS,y0+PS],[x0,y0+PS]];const gi=gateInfo();const gm=gi?[gi.m[0]+0.5+gi.o[0]*0.5,gi.m[1]+0.5+gi.o[1]*0.5]:null;const NS=8;
   cx.strokeStyle='#c9a46a';cx.lineWidth=0.7;for(let e=0;e<4;e++){const A=T[e],B=T[(e+1)%4];const P=k=>[lerp(A[0],B[0],k/NS),lerp(A[1],B[1],k/NS)];const skip=k=>{if(!gm)return false;const p=P(k+0.5);return Math.hypot(p[0]-gm[0],p[1]-gm[1])<1.7};
    for(let k=0;k<=NS;k++){if(skip(k)&&skip(k-1))continue;const[X,Y]=iso(...P(k));cx.fillStyle='#7a5432';cx.fillRect(X-0.8,Y-6,1.6,6);cx.fillStyle='#a07448';cx.fillRect(X-0.8,Y-6,0.8,6)}
    cx.beginPath();for(let k=0;k<NS;k++){if(skip(k))continue;const[X1,Y1]=iso(...P(k)),[X2,Y2]=iso(...P(k+1));cx.moveTo(X1,Y1-5);cx.quadraticCurveTo((X1+X2)/2,(Y1+Y2)/2-3,X2,Y2-5)}cx.stroke()}
   const[sX,sY]=iso(x0+PS/2,y0+PS/2);cx.fillStyle='#6b4a2b';cx.fillRect(sX-1,sY-10,2,10);
   window._signs.push({px,py,X:sX,Y:sY-16,price:plotPrice(px,py)})}}}
function drawText(t,lt){ // 고해상도 텍스트 레이어
 tx.setTransform(TDPR,0,0,TDPR,0,0);tx.clearRect(0,0,VW,VH);tx.textAlign='center';tx.textBaseline='middle';
 for(const s of (document.body.classList.contains('zen')||window.READONLY)?[]:window._signs||[]){const[X,Y]=toScreen(s.X,s.Y);const fs=Math.max(9,Math.min(15,3.2*cam.z));tx.font=`700 ${fs}px Pretendard`;const t_='¥'+fmt(s.price);const isz=fs>12?32:16;const w=tx.measureText(t_).width+22+isz;tx.fillStyle='#f7efdc';tx.strokeStyle='#6b4024';tx.lineWidth=2;rr(tx,X-w/2,Y-fs,w,fs*2,5);tx.fill();tx.stroke();if(window.ICURL){const im=LOCKIMG||(LOCKIMG=Object.assign(new Image(),{src:ICURL('lock')}));tx.imageSmoothingEnabled=false;tx.drawImage(im,Math.round(X-w/2+6),Math.round(Y-isz/2),isz,isz)}tx.fillStyle='#2b1d14';tx.fillText(t_,X+isz/2+2,Y+1);}
 const ZN=document.body.classList.contains('zen');for(const f of ZN?[]:floats){const[X,Y]=toScreenT(f.x,f.y);const a=Math.min(1,f.l);tx.globalAlpha=a;tx.font='800 15px Pretendard';tx.lineWidth=3;tx.strokeStyle='#6b4310';const yy=Y-40-(1.6-f.l)*30;tx.strokeText(f.t,X,yy);tx.fillStyle='#ffd65a';tx.fillText(f.t,X,yy)}
 tx.globalAlpha=1;
 if(paint&&paintCursor){const{t,cost}=paintPlan();const s_=(DEF[ghost].erase?'환불 ':'')+`${t.length}칸 · ¥${fmt(Math.abs(cost))}`;tx.font='700 14px Pretendard';const w=tx.measureText(s_).width+20;tx.fillStyle='rgba(74,51,32,0.92)';rr(tx,paintCursor[0]+14,paintCursor[1]-34,w,26,8);tx.fill();tx.fillStyle='#fff';tx.textAlign='left';tx.fillText(s_,paintCursor[0]+24,paintCursor[1]-21);tx.textAlign='center'}
 // 만석 팻말(D3)·기다리는 손님 머리 위 김 아이콘(D5)
 if(!ZN&&window.ICURL){const st_=icImg('steam');tx.imageSmoothingEnabled=false;
  for(const o of S.objs){const d=DEF[o.k];if(!d.bath||o===moving||(o.users||0)<capOf(o))continue;const G=objGeom(o);let[X,Y]=toScreen(G.X,G.Y-G.H*0.82);Y=Math.max(18,Y);
   const fs=Math.max(10,Math.min(13,2.6*cam.z));tx.font=`700 ${fs}px Pretendard`;const isz=16,w=tx.measureText('만석').width+isz+16;
   tx.fillStyle='#f7efdc';tx.strokeStyle='#6b4024';tx.lineWidth=2;rr(tx,X-w/2,Y-fs+1,w,fs*2-2,5);tx.fill();tx.stroke();
   if(st_.complete)tx.drawImage(st_,Math.round(X-w/2+5),Math.round(Y-isz/2),isz,isz);tx.fillStyle='#2b1d14';tx.fillText('만석',X+isz/2+1,Y+1)}
  if(st_.complete){const isz=cam.z>=2.5?32:16;for(const g of guests){if(g.st!='wait'||g.hide||g.inBath||bubbles.some(b=>b.g===g))continue;const[X0,Y0]=toScreenT(g.x,g.y);const Y=Y0-26*cam.z-isz/2-2+Math.sin(t/260+g.bob)*2;
   tx.globalAlpha=0.95;tx.drawImage(st_,Math.round(X0-isz/2),Math.round(Y-isz/2),isz,isz);tx.globalAlpha=1}}}
 BUS.emit('text',tx);
 const placed=[];for(const b of ZN?[]:bubbles){const g=b.g;const[X0,Y0]=toScreenT(g.x,g.y);let Y=Y0-(g.inBath?14:26)*cam.z-8;tx.font='600 13px Pretendard';const w=tx.measureText(b.t).width+16;
  for(let k=0;k<6;k++){const hit=placed.find(p=>Math.abs(p[0]-X0)<(p[2]+w)/2+4&&Math.abs(p[1]-Y)<28);if(!hit)break;Y=hit[1]-30}placed.push([X0,Y,w]);
  tx.globalAlpha=Math.min(1,b.l*2);tx.fillStyle='rgba(255,252,244,0.96)';tx.strokeStyle='#b89366';tx.lineWidth=1.5;rr(tx,X0-w/2,Y-13,w,24,10);tx.fill();tx.stroke();
  tx.beginPath();tx.moveTo(X0-4,Y+11);tx.lineTo(X0,Y+17);tx.lineTo(X0+4,Y+11);tx.fill();tx.fillStyle='#4a3320';tx.fillText(b.t,X0,Y);tx.globalAlpha=1}}
const ICIMG={};function icImg(n){return ICIMG[n]||(ICIMG[n]=Object.assign(new Image(),{src:window.ICURL?ICURL(n):''}))}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
// ===== UI =====
let tab='bath',speed=1;
function toast(m){if(window.__warm)return;const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(t.h);t.h=setTimeout(()=>t.style.display='none',2600)}
function buildTabs(){$('tabs').innerHTML=TABS.map(([k,i,n])=>`<div class="tab ${k==tab?'on':''}" data-k="${k}">${n}</div>`).join('');
 document.querySelectorAll('.tab').forEach(e=>e.onclick=()=>{tab=e.dataset.k;buildTabs();buildCards();$('tip').textContent=TIPS[tab]});buildCards()}
const SUBCATS={
 bath:[
  ['bath_basic','기본·실내 온천탕','bath',['foot','hinoki','sauna','fam']],
  ['bath_nature','자연·노천 온천탕','steam',['rock','cave','fall','sulfur','iron','starlight']],
  ['bath_special','이색·특수 온천탕','sakura',['milky','wine','soda','petal','matcha']]
 ],
 food:[
  ['food_snack','간식·노점·찻집','food',['dango','ice','tea']],
  ['food_meal','식당·주점','lantern',['ramen','sake','teishoku','izakaya']]
 ],
 shop:[
  ['shop_stall','매점·노점·기념품','gift',['milk','yuzu','shoot','gift']],
  ['shop_rest','휴식·오락·숙박 시설','home',['pingpong','massage','room','nap']]
 ],
 deco:[
  ['deco_bench','벤치·의자·쉼터','bench',['bamboo_bench','wood_bench','engawa_bench','stone_bench','parasol_table','lounger']],
  ['deco_light','일본 전통 조명','andon',['andon_lantern','takeakari','chochin_tower','lantern','bamboo','kagaribi','floating_lanterns','lanternpath']],
  ['deco_neon','온천·레트로 네온 간판','neon',['neon_yu','neon_izakaya','neon_capy']],
  ['deco_path','길·다리','bridge',['path_erase','path_gravel','path','path_wood','path_tatami','bridge']],
  ['deco_garden','정원·수경 장식','pond',['rocks','iris','pond','sandgarden','wisteria','waterwheel','wisteria_w']],
  ['deco_statue','전통 조형물','gate',['jizo','ema','torii','tanuki','torii_gold']],
  ['deco_tree','계절 나무','tree',['sakura','maple','pine','ginkgo','ume']]
 ],
 theme:[
  ['theme_trad','전통 세트','gate',['shishi','nodate','pagoda','bamboofence'],'trad'],
  ['theme_modern','모던 세트','food',['cafe','lamppost','olive','lounger'],'modern'],
  ['theme_forest','숲 세트','zen',['cedar','mushroom','fern','birdhouse'],'forest'],
  ['theme_season','계절 세트','star',['snowman','hydrangea','tsukimi','kadomatsu'],'season']
 ],
 custom:[
  ['custom_hang','현수막·노렌 장식','photo',['banner','noren']],
  ['custom_board','액자·입간판 장식','scroll',['frame','sign']]
 ]
};
function sortSubItems(items,st){
 return items.slice().sort(([,a],[,b])=>{
  const sa=a.star||1,sb=b.star||1,la=sa>st?1:0,lb=sb>st?1:0;
  if(la!==lb)return la-lb;
  if(sa!==sb)return sa-sb;
  return(a.cost||0)-(b.cost||0);
 });
}
function buildCards(){_stC.k='';const st=stars();
 const card=([k,d])=>{const fw=d.fp||1,fh=d.fph||fw,fpBadge=d.erase?'':`<span class="fpb">${fw}×${fh}</span>`,src=d.img?(TIERED.includes(d.img)?d.img+'_lv1':d.img):null;return`<div class="card ${ghost==k?'sel':''} ${(d.star||1)>st?'lock':''}" data-k="${k}" data-need="${d.star}★ 필요" title="${d.desc} (${fw}×${fh}칸)">${fpBadge}${src?`<img src="${SPRURL(src,k)}" style="${d.filter?'filter:'+d.filter:''}">`:`<div class="c-thumb" style="height:56px;display:flex;align-items:center;justify-content:center;font-size:30px">${d.ic||'🪨'}</div>`}<b>${d.n}</b><span class="p">${d.erase?'50% 환불':d.isPath?'¥'+fmt(d.cost)+'/칸':'¥'+fmt(d.cost)}</span></div>`};
 const done=setsDone(),subs=SUBCATS[tab]||[],seen=new Set();
 const blocks=subs.map(([id,title,icKey,keys,sk])=>{
  const raw=keys.filter(k=>DEF[k]).map(k=>{seen.add(k);return[k,DEF[k]]});
  if(!raw.length)return'';
  const sorted=sortSubItems(raw,st),openCnt=sorted.filter(([,d])=>(d.star||1)<=st).length;
  if(sk&&SETS[sk]){const has=done.includes(sk);const cnt=SETS[sk][2].filter(i=>S.objs.some(o=>o.k==i)).length;
   return`<div class="sethd" data-sub="${id}"><b>${title}</b><span class="subcnt">${has?'세트 완성':`${cnt}/4 · 3종 배치 시 평판+15`}</span></div>`+sorted.map(card).join('')}
  return`<div class="sethd" data-sub="${id}"><b>${title}</b><span class="subcnt">건설 가능 ${openCnt}/${sorted.length}</span></div>`+sorted.map(card).join('');
 });
 const rest=sortSubItems(Object.entries(DEF).filter(([k,d])=>d.tab==tab&&!seen.has(k)),st);
 if(rest.length)blocks.push(`<div class="sethd" data-sub="etc"><b>기타</b><span class="subcnt">건설 가능 ${rest.filter(([,d])=>(d.star||1)<=st).length}/${rest.length}</span></div>`+rest.map(card).join(''));
 $('cards').innerHTML=blocks.join('');if(window.ICFIX)ICFIX($('cards'));
 document.querySelectorAll('.card').forEach(e=>e.onclick=()=>{const k=e.dataset.k;if(moving)cancelMove();if(DEF[k].star>stars())return toast(`료칸 등급 ${DEF[k].star}★ 에서 해금돼요`);ghost=ghost==k?null:k;mode=null;$('tDel').classList.remove('on');buildCards();if(ghost)toast(DEF[ghost].isPath||DEF[ghost].erase?'드래그해서 칠하세요 · Shift+드래그 = 사각형 (Esc 취소)':'놓을 곳을 눌러주세요 (Esc 취소)')})}
let lastStars=0;
function hud(){const lt=light();$('yen').textContent=fmt(S.yen);const n=S.fin.hist.length?avgNet():(S.fin._h||0);$('ihr').textContent=(n>=0?'+':'')+fmt(n)+' ¥/시';
 const h=hour(),m=Math.floor(S.min%60);$('time').textContent=`${h<12?'오전':'오후'} ${String(Math.floor(h%12)||12).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
 $('dayn').textContent='Day '+dayN();$('season').textContent=SEASONS[season()];
 $('temp').textContent=`· ${STEMP[season()]+Math.round(Math.sin((h-9)/24*6.28)*4)}°C · 손님 ${guests.length}명`;
 const s=stars();$('stars').innerHTML='★'.repeat(s)+'<span class="st-off">'+'★'.repeat(5-s)+'</span>';if(s!=lastStars){if(lastStars&&s>lastStars)toast(`🎉 료칸 등급 ${s}★ 달성! 새 시설이 해금됐어요`);lastStars=s;buildCards()}
 if(document.activeElement!==$('zs'))$('zs').value=cam.z;}
function placeInfo_old(){const el=$('info'),q=$('quest');if(innerWidth>700){const r=q&&getComputedStyle(q).display!='none'&&q.offsetHeight?q.getBoundingClientRect():null;el.style.top=(r&&r.left<280?Math.round(r.bottom+8):70)+'px';el.style.maxHeight=`calc(100vh - ${parseInt(el.style.top)+150}px)`;el.style.overflow='auto'}else{el.style.top='';el.style.maxHeight=''}}
// ===== 정확한 클릭 판정: 스프라이트 알파 + 풋프린트 + 여유 패딩, 깊이상 맨 위 우선 =====
const AM={};let _amC=null;function amask(key){if(key.includes('~m')){const b=amask(key.replace('~m',''));if(!b)return null;if(!b.mi){const w=b.w,h=b.h,m=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)m[y*w+x]=b.m[y*w+w-1-x];b.mi={w,h,m}}return b.mi}if(AM[key])return AM[key];const v=VAR[key];if(!v)return null;const w=Math.min(128,v.base.width),h=Math.max(1,Math.round(w*v.base.height/v.base.width));const c=_amC||(_amC=document.createElement('canvas'));c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(v.base,0,0,w,h);const d=g.getImageData(0,0,w,h).data,m=new Uint8Array(w*h);for(let i=0;i<w*h;i++)m[i]=d[i*4+3]>60?1:0;return AM[key]={w,h,m}}
let _coarse=matchMedia('(pointer:coarse)').matches;
function pickObj(sx,sy){const wx=(sx-cam.x)/cam.z,wy=(sy-cam.y)/cam.z;const padS=_coarse?12:5,pad=padS/cam.z;const[tx_,ty_]=toTile(sx,sy);
 const ord=window._order||S.objs;for(let i=ord.length-1;i>=0;i--){const o=ord[i];if(!o||DEF[o.k].isPath)continue;const G=objGeom(o);const x0=G.X-G.W/2,y0=G.Y-G.H;
  if(wx<x0-pad||wx>x0+G.W+pad||wy<y0-pad||wy>G.Y+pad){continue}
  const mk=amask(skey(o));if(mk){const u=(wx-x0)/G.W*mk.w,v=(wy-y0)/G.H*mk.h,r=Math.max(1,Math.ceil(pad/G.W*mk.w));let hit=false;
   for(let dy=-r;dy<=r&&!hit;dy++)for(let dx=-r;dx<=r;dx++){const px=Math.floor(u+dx),py=Math.floor(v+dy);if(px>=0&&py>=0&&px<mk.w&&py<mk.h&&mk.m[py*mk.w+px]){hit=true;break}}if(hit)return o}
  for(const[a,b]of tilesOf(o))if(tx_>=a-0.15&&tx_<a+1.15&&ty_>=b-0.15&&ty_<b+1.15)return o}
 const t=OCC[Math.floor(tx_)+','+Math.floor(ty_)];return t&&!DEF[t.k].isPath?t:t}
// ===== 오브젝트 팝오버 메뉴 =====
let INFO_O=null,POPSEC=null,LOCKIMG=null;
function popPlace(){const el=$('info');if(!INFO_O||el.style.display=='none')return;const o=INFO_O;if(!S.objs.includes(o)){el.style.display='none';INFO_O=null;return}const G=objGeom(o);
 const[ax,ay]=toScreen(G.X,G.Y-G.H*0.92),[bx,by]=toScreen(G.X,G.Y);const w=el.offsetWidth,h=el.offsetHeight;let x=ax-w/2,y=ay-h-12,below=false;
 if(y<64){y=by+10;below=true}if(y+h>VH-8)y=Math.max(64,VH-8-h);x=Math.max(8,Math.min(VW-w-8,x));el.style.left=x+'px';el.style.top=y+'px';el.classList.toggle('below',below);el.style.setProperty('--ax',Math.max(14,Math.min(w-14,ax-x))+'px')}
BUS.on('frame',popPlace);
function showInfo(o){const el=$('info');if(INFO_O!==o)POPSEC=null;INFO_O=o;el.classList.add('pop');el.style.right='auto';el.style.bottom='auto';el.style.maxHeight='';el.style.display='block';
 if(o.k=='gate'){el.innerHTML=`<div class="ph"><b>대문</b><button class="px" id="iCl">✕</button></div><div class="pdesc">손님이 드나드는 유일한 입구예요. 열린 땅 가장자리로 이동만 할 수 있어요.</div><div class="pacts"><button class="pa" id="iMove"><i>이동</i></button><button class="pa" id="iRot"><i>회전</i></button></div>`;$('iMove').onclick=()=>startMove(o);$('iRot').onclick=e=>{e.stopPropagation();rotateGate()};$('iCl').onclick=()=>hideInfo();requestAnimationFrame(popPlace);return}
 const d=DEF[o.k];const up=Math.round(d.cost*Math.pow(1.7,o.lv));const users=guests.filter(g=>g.cur===o).length;
 const gauge=d.price?(()=>{const fr=fairPrice(o),r=o.price/fr;const [c,t]=r<0.9?["#5f9e5a","저렴 · 손님 만족 ↑"]:r<1.15?["#3f6aa0","적정가"]:r<1.4?["#c98a2c","조금 비쌈 · 만족 ↓"]:["#c0442e","비쌈 · 만족 ↓"];const pos=Math.max(0,Math.min(100,(r-0.6)/1.0*100));return `<div class="pfb"><div class="pbar"><i style="left:${pos}%;background:${c}"></i></div><small style="color:${c}">${t}</small><small style="opacity:.7"> · 추천 ¥${fmt(Math.round(fr*1.1/10)*10)}</small></div>`})():'';
 const stars='◆'.repeat(o.lv)+'◇'.repeat(5-o.lv);
 el.innerHTML=`<div class="ph"><b>${d.n}</b><span class="lv" title="Lv.${o.lv}">${d.price?`Lv.${o.lv}`:''}</span><button class="px" id="iCl" aria-label="닫기">✕</button></div>
 <div class="pq">${d.price?`<span>요금 ¥${fmt(o.price)}</span><span>이용 ${users}/${capOf(o)}</span>`:`<span>아름다움 +${d.beauty}</span>`}</div>
 <div class="pacts"><button class="pa${POPSEC=='info'?' on':''}" data-s="info"><i>정보</i></button>${o.lv<5&&d.price?`<button class="pa up" id="iUp"><i>업그레이드<small>¥${fmt(up)}</small></i></button>`:''}<button class="pa" id="iMove"><i>이동</i></button><button class="pa" id="iRot"><i>회전</i></button>${d.price?`<button class="pa${POPSEC=='price'?' on':''}" data-s="price"><i>가격</i></button>`:''}<button class="pa del" id="iDel"><i>철거</i></button></div>
 <div class="psec" data-sec="info" ${POPSEC=='info'?'':'hidden'}><div class="pdesc">${d.desc}</div>${d.price?`<div class="row"><span>이용 중</span><b>${users}/${capOf(o)}</b></div><div class="row"><span>누적 이용</span><b>${o.uses||0}회</b></div><div class="row"><span>누적 매출</span><b>¥${fmt(o.earn||0)}</b></div><div class="row"><span>직원 급여</span><b>¥${fmt(d.wage*(1+0.5*(o.lv-1)))}/시</b></div>`:`<div class="row"><span>아름다움</span><b>+${d.beauty}</b></div>`}<div class="row"><span>철거 환급</span><b>¥${fmt(Math.floor(d.cost*0.4))}</b></div></div>
 ${d.price?`<div class="psec" data-sec="price" ${POPSEC=='price'?'':'hidden'}><div class="row"><span>이용 요금</span><b>¥${fmt(o.price)}</b></div>${gauge}<div class="prow"><button class="b g" data-p="-0.1">−10%</button><button class="b g" data-p="0.1">+10%</button><button class="b g" data-p="0">기본</button><button class="b g" data-p="rec">추천가</button></div></div>`:''}`;
 el.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{POPSEC=POPSEC==b.dataset.s?null:b.dataset.s;showInfo(o)});
 el.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{if(b.dataset.p=='rec'){o.price=Math.round(fairPrice(o)*1.1/10)*10;o.rej=0;showInfo(o);return}const p=+b.dataset.p;o.price=p==0?d.price:Math.max(50,Math.round(o.price*(1+p)/10)*10);showInfo(o)});
 if($('iUp'))$('iUp').onclick=()=>{if(S.yen<up)return toast('엔이 부족해요');S.yen-=up;S.fin.exp+=up;o.lv++;o.build={t:0,h:0};hideInfo();toast(`${d.n} Lv.${o.lv}!`);showInfo(o);save()};
 $('iDel').onclick=()=>{const b=$('iDel');if(!b.classList.contains('confirm')){b.classList.add('confirm');b.querySelector('i').textContent='한번 더';return}remove(o)};$('iMove').onclick=()=>{hideInfo();startMove(o)};$('iRot').onclick=e=>{e.stopPropagation();rotateObj(o)};$('iCl').onclick=()=>hideInfo();BUS.emit('info',o,el);requestAnimationFrame(popPlace)}
function hideInfo(){$('info').style.display='none';INFO_O=null}
function remove(o){if(window.READONLY)return;if(o.k=='gate')return toast('대문은 철거할 수 없어요. 이동만 가능해요');if(S.objs.length<=1)return;S.yen+=Math.floor(DEF[o.k].cost*0.4);guests.forEach(g=>{if(g.cur===o)finish(g);if(g.target===o)g.target=null});S.objs.splice(S.objs.indexOf(o),1);OCC=occ();groundDirty=true;$('info').style.display='none';save()}
function modalFin(){const m=$('modal');const up=S.objs.filter(o=>!DEF[o.k].isPath&&!DEF[o.k].wage).length*4,wages=S.objs.reduce((a,o)=>a+(DEF[o.k].wage||0)*(1+0.5*(o.lv-1)),0);
 const rows=S.objs.filter(o=>DEF[o.k].price).sort((a,b)=>(b.earn||0)-(a.earn||0)).slice(0,8).map(o=>`<div class="row"><span>${DEF[o.k].n} Lv.${o.lv}</span><b>¥${fmt(o.earn||0)}</b></div>`).join('');
 m.innerHTML=`<h3>재정 현황</h3><div class="row"><span>보유 자금</span><b>¥${fmt(S.yen)}</b></div><div class="row"><span>평균 순이익</span><b>¥${fmt(avgNet())}/시</b></div><div class="row"><span>오늘 수입</span><b>¥${fmt(S.fin.inc)}</b></div><div class="row"><span>오늘 지출</span><b>¥${fmt(S.fin.exp)}</b></div>
 <div class="row"><span>직원 급여</span><b>¥${fmt(wages)}/시</b></div><div class="row"><span>시설 유지비</span><b>¥${fmt(up)}/시</b></div><h3 style="margin-top:10px">시설별 매출</h3>${rows}<div style="text-align:right"><button class="b" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;m.style.display='block'}
function modalRank(){const m=$('modal');const st=stars(),sc=Math.floor(starScore()),pl=Object.keys(S.plots).length,sv=S.served||0,rep=Math.round(S.rep||0);
 let ap=0,bt=0;for(const o of S.objs){const d=DEF[o.k];if(!d)continue;ap+=(d.appeal||0)*(1+0.35*((o.lv||1)-1))*0.4;bt+=(d.beauty||0)*bMul(d)}
 const repPt=Math.round((S.rep||0)*0.5),apPt=Math.round(ap),btPt=Math.round(Math.sqrt(bt)*3),plPt=pl*4,setPt=setsDone().length*15;
 const reqRow=(label,cur,req,unit,color)=>{const ok=cur>=req,pct=Math.min(100,Math.round(cur/Math.max(1,req)*100));
  return`<div class="rk-req"><div class="row"><span>${label}</span><span><b>${fmt(cur)}${unit}</b> / ${fmt(req)}${unit} <span class="rk-badge ${ok?'ok':'go'}">${ok?'✓ 달성':`미달 (${fmt(req-cur)}${unit} 남음)`}</span></span></div><div class="bar"><i style="width:${pct}%;background:${ok?'#5fa855':color}"></i></div></div>`};
 let nextHtml='';
 if(st<5){const[rq,rsv,rpl]=STAR_REQ[st+1];
  nextHtml=`<div class="rk-next"><div style="font-weight:800;font-size:14px;margin-bottom:4px">다음 등급 (${st+1}★ ${['','동네 온천','인기 온천','명소 료칸','전통 명문 료칸','전설의 카피바라 료칸'][st+1]}) 승급 조건</div>
   ${reqRow('종합 명성 점수 (평판·매력·조경)',sc,rq,'점','#e0a92e')}
   <div style="font-size:11px;color:var(--txt-sec);margin:-2px 0 5px">↳ 현재 명성 구성: 평판(${rep}) <b>+${repPt}점</b> · 시설 매력 <b>+${apPt}점</b> · 조경 아름다움 <b>+${btPt}점</b> · 구역·세트 <b>+${plPt+setPt}점</b></div>
   ${reqRow('누적 이용 손님 수',sv,rsv,'회','#5a8fd9')}
   ${reqRow('열린 구역 수 (확장 구역)',pl,rpl,'구역','#8a9a6a')}
  </div>`;
 }else{
  nextHtml=`<div class="rk-next"><div style="font-weight:800;font-size:14px;color:var(--jade)">최고 등급 (5★ 전설의 카피바라 료칸) 달성 완료!</div><div style="font-size:12px;color:var(--txt-sec);margin-top:3px">모든 시설과 장식이 해금되었어요. 명성 점수 <b>${fmt(sc)}점</b> · 누적 손님 <b>${fmt(sv)}회</b> · 열린 구역 <b>${pl}구역</b></div></div>`;
 }
 const rankNames=['','1★ 시작의 온천','2★ 인기 온천 료칸','3★ 명소 온천 료칸','4★ 전통 명문 료칸','5★ 전설의 카피바라 료칸'];
 const chip=([k,d])=>{const src=d.img?(TIERED.includes(d.img)?d.img+'_lv1':d.img):null;return`<span class="rk-chip">${src?`<img src="${SPRURL(src,k)}" alt="">`:`${d.ic||'🌸'}`}<span>${d.n}</span></span>`};
 const rankCards=[1,2,3,4,5].map(r=>{
  const done=r<=st,isNext=r===st+1;
  const[rq,rsv,rpl]=STAR_REQ[r]||[0,0,1];
  const cond=r===1?'기본 시작 등급 (초기 해금)':`조건: 명성 <b>${fmt(rq)}점</b> 이상 · 누적 손님 <b>${fmt(rsv)}회</b> 이상 · 열린 구역 <b>${rpl}곳</b> 이상`;
  const unlocks=Object.entries(DEF).filter(([k,d])=>d.tab&&!d.erase&&(d.star||1)===r);
  const badge=done?`<span class="rk-badge ok">✓ 달성 완료</span>`:isNext?`<span class="rk-badge go">진행 중</span>`:`<span class="rk-badge lock">잠김</span>`;
  return`<div class="rk-box ${r===st?'cur':isNext?'next':done?'done':''}">
   <div class="rk-hd"><b>${rankNames[r]}</b>${badge}</div>
   <div class="rk-cond">${cond}</div>
   <div class="rk-items">${unlocks.length?unlocks.map(chip).join(''):'<span style="font-size:11px;color:var(--txt-sec)">모든 상위 시설을 자유롭게 운영하고 최고 명성을 누려보세요!</span>'}</div>
  </div>`;
 }).join('');
 m.innerHTML=`<h3>료칸 등급 · 승급 조건</h3>
  <div class="rk-cur">
   <div><span style="font-size:12px;color:var(--txt-sec)">현재 료칸 등급</span><br><b class="stars">${'★'.repeat(st)}<span style="color:rgba(255,255,255,0.2)">${'★'.repeat(5-st)}</span></b> <b>(${st}성 료칸)</b></div>
   <div style="text-align:right;font-size:12px">명성 점수 <b>${fmt(sc)}점</b> <small>(평판 ${rep})</small><br>누적 손님 <b>${fmt(sv)}회</b> · 구역 <b>${pl}곳</b></div>
  </div>
  ${nextHtml}
  <h3 style="margin-top:12px;font-size:13px">등급별 승급 조건 및 해금 시설 (1★ ~ 5★)</h3>
  <div class="rk-list">${rankCards}</div>
  <div class="rk-tip">
   <b>등급 올리는 법:</b> 다양한 온천탕·식당·상점을 짓고 업그레이드하면 <b>시설 매력</b>과 <b>누적 손님</b>이 빠르게 늘어나요. 적정 가격을 유지해 <b>평판</b>을 높이고, 벤치·조명·나무 장식과 테마 세트(4종)를 배치해 <b>명성 점수</b>를 올린 뒤, 잠긴 구역의 표지판을 눌러 <b>구역을 확장</b>하세요!
  </div>
  <div style="text-align:right;margin-top:6px"><button class="b" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;
 m.style.display='block';if(window.ICFIX)ICFIX(m)}
window.modalRank=modalRank;
const VTXT={full:o=>`${DEF[o.k].n}에 자리가 더 있으면 좋겠어요`,path:o=>`${DEF[o.k].n}에 가는 길이 이어지면 좋겠어요`,fatigue:()=>'쉴 수 있는 탕이 더 있으면 좋겠어요',hunger:()=>'먹을 곳이 있으면 좋겠어요',thirst:()=>'마실 것을 파는 곳이 있으면 좋겠어요',fun:()=>'구경할 거리가 더 있으면 좋겠어요'};
const VTAB={fatigue:'bath',hunger:'food',thirst:'shop',fun:'deco'};
function voices(){const since=S.min-1440,m=new Map();for(const v of VOICE){if(v.m<since||!VTXT[v.k])continue;if(v.o&&!S.objs.includes(v.o))continue;const key=v.k+'|'+(v.o?S.objs.indexOf(v.o):'');let e=m.get(key);if(!e)m.set(key,e={k:v.k,o:v.o,gs:new Set()});e.gs.add(v.g)}
 return[...m.values()].map(e=>({k:e.k,o:e.o,n:e.gs.size})).sort((a,b)=>b.n-a.n).slice(0,3)}
function openBuildTab(k){if($('build').style.display=='none')$('bOpen').onclick();if(k){tab=k;buildTabs();buildCards();$('tip').textContent=TIPS[tab]||''}}
function modalGuest(){const m=$('modal');const vs=voices();const n=guests.length||1;const avg=k=>guests.reduce((s,g)=>s+g.need[k],0)/n;const hp=guests.reduce((s,g)=>s+g.happy,0)/n;
 const bar=(l,v,c)=>`<div class="row" style="border:0"><span>${l}</span><b>${Math.round(v)}</b></div><div class="bar"><i style="width:${v}%;background:${c}"></i></div>`;
 m.innerHTML=`<h3>손님 · 만족도</h3><div class="row"><span>현재 손님</span><b>${guests.length}명</b></div><div class="row"><span>누적 이용</span><b>${fmt(S.served)}회</b></div>${bar('평판',S.rep,'#e0a92e')}${bar('현재 손님 기분',guests.length?hp:0,'#7fbf6a')}
 <h3 style="margin-top:8px">손님들의 한마디</h3>${vs.length?vs.map((v,i)=>`<button class="b g" data-v="${i}" style="display:flex;width:100%;justify-content:space-between;gap:8px;margin:3px 0;text-align:left"><span>${VTXT[v.k](v.o)}</span><b>${v.n}명</b></button>`).join(''):'<div class="row" style="border:0"><span>손님들이 모두 편안해 보여요</span></div>'}
 <h3 style="margin-top:8px">평균 욕구 (높을수록 필요)</h3>${NEEDK.map(k=>bar(NEEDN[k],guests.length?avg(k):0,'#d98a5a')).join('')}
 <div style="font-size:12px;color:var(--txt-sec)">팁: 욕구에 맞는 시설이 없으면 기분이 떨어져요. 장식 근처를 걸으면 기분이 좋아져요.</div><div style="text-align:right"><button class="b" onclick="this.closest('.panel').style.display='none'">닫기</button></div>`;m.style.display='block';
 m.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{const v=vs[+b.dataset.v];m.style.display='none';if(v.o&&S.objs.includes(v.o)){const c=ctr(v.o);focus(c[0],c[1],Math.max(cam.z,2.5));showInfo(v.o)}else openBuildTab(VTAB[v.k])})}
// ===== 입력 =====
const ptrs=new Map();let drag=null,pinch=null,lp=null,lastTap={};
function onTap(sx,sy){const[fx,fy]=toTile(sx,sy);const x=Math.floor(fx),y=Math.floor(fy);
 for(const s of window._signs||[]){const[X,Y]=toScreen(s.X,s.Y);if(Math.abs(sx-X)<16*cam.z/1.5+10&&Math.abs(sy-Y)<10*cam.z/1.5+8){unlock(s);return}}
 if(!ghost&&!moving&&window.AMB&&AMB.tap(fx,fy,sx,sy))return;
 if(ghost){if(!canPlace(ghost,x,y))return toast(tileOpen(x,y)?'여기엔 지을 수 없어요':'잠긴 구역이에요. 표지판을 눌러 열어주세요');const d=DEF[ghost];if(S.yen<d.cost)return toast('엔이 부족해요');
  S.yen-=d.cost;S.fin.exp+=d.cost;S.objs.push({k:ghost,x,y,lv:1,rot:DEF[ghost].isPath?0:ROT,price:d.price||0,uses:0,earn:0});anims['o'+(S.objs.length-1)]={t:0};OCC=occ();groundDirty=true;
  const[fw,fh]=fpOf(ghost,ROT);for(let i=0;i<10;i++)parts.push({k:'steam',x:x+fw/2+(Math.random()-0.5)*fw,y:y+fh/2+(Math.random()-0.5)*fh,h:0,vx:0,l:1,L:1,s:2});if(ghost=='path'){}else if(!ev.shift){ghost=null;buildCards()}save();return}
 const o=pickObj(sx,sy);if(o&&!DEF[o.k].isPath){if(mode=='del'){remove(o);return}clearTimeout(infoT);infoT=setTimeout(()=>{if(!moving)showInfo(o)},230)}else hideInfo()}
function unlock(s){const k=s.px+','+s.py;if(S.yen<s.price)return toast(`구역 확장에 ¥${fmt(s.price)} 필요해요`);S.yen-=s.price;S.fin.exp+=s.price;S.plots[k]=1;groundDirty=true;BUS.emit('unlock',k);anims['p'+k]={t:0};toast('🎉 새 구역이 열렸어요!');
 for(let i=0;i<40;i++)parts.push({k:'petal',x:s.px*PS+Math.random()*PS,y:s.py*PS+Math.random()*PS,h:20+Math.random()*30,l:3,L:3,ph:Math.random()*6});save()}
const ev={shift:false};
function initInput(){
 cv.addEventListener('pointerdown',e=>{lastMouse=[e.clientX,e.clientY];if(ghost&&DEF[ghost].fp==1&&(DEF[ghost].isPath||DEF[ghost].erase)&&e.button!=2){const[a,b]=toTile(e.clientX,e.clientY);paint={x0:a|0,y0:b|0,x1:a|0,y1:b|0,area:e.shiftKey};return}ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY});clearTimeout(lp);if(e.pointerType!='mouse'&&!moving&&!ghost){const sx=e.clientX,sy=e.clientY;lp=setTimeout(()=>{if(drag&&!drag.m&&ptrs.size==1){const o=pickObj(sx,sy);if(o&&!DEF[o.k].isPath){drag.lp=true;startMove(o)}}},550)}ev.shift=e.shiftKey;if(ptrs.size==1)drag={x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y,m:false};else{const p=[...ptrs.values()];pinch={d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),z:cam.z,mx:(p[0].x+p[1].x)/2,my:(p[0].y+p[1].y)/2,zooming:false};drag=null}});
 let rcT=0;
 cv.addEventListener('pointermove',e=>{if(e.button==2&&paint){escCancel();return}lastMouse=[e.clientX,e.clientY];if(e.pointerType=='mouse'&&!ptrs.size){const h=ghost||moving?null:pickObj(e.clientX,e.clientY);window.HOVER=h&&!DEF[h.k].isPath?h:null;cv.style.cursor=window.HOVER?'pointer':''}const[a,b]=toTile(e.clientX,e.clientY);if(paint){paint.x1=a|0;paint.y1=b|0;paint.area=paint.area||e.shiftKey;paintCursor=[e.clientX,e.clientY]}const[gfw,gfh]=ghost?fpOf(ghost,moving?moving.rot:ROT):[1,1];hoverT=[Math.floor(a-(ghost?gfw/2-0.5:0)),Math.floor(b-(ghost?gfh/2-0.5:0))];if(!ptrs.has(e.pointerId))return;const prevP=ptrs.get(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:prevP.sx,sy:prevP.sy});
  if(pinch&&ptrs.size==2){const p=[...ptrs.values()],mx=(p[0].x+p[1].x)/2,my=(p[0].y+p[1].y)/2,nd=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),v0x=p[0].x-p[0].sx,v0y=p[0].y-p[0].sy,v1x=p[1].x-p[1].sx,v1y=p[1].y-p[1].sy,opp=(v0x*v1x+v0y*v1y)<-40&&Math.hypot(v0x,v0y)>12&&Math.hypot(v1x,v1y)>12;homeAnim=null;cam.x+=mx-pinch.mx;cam.y+=my-pinch.my;pinch.mx=mx;pinch.my=my;if(pinch.zooming||(opp&&Math.abs(nd-pinch.d)>24)){if(!pinch.zooming){pinch.zooming=true;pinch.d=nd;pinch.z=cam.z}zoomAt(mx,my,pinch.z*nd/pinch.d);cam.tz=cam.z}syncGhostHover()}
  else if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>6){drag.m=true;clearTimeout(lp)}if(drag.m){cam.x=drag.cx+dx;cam.y=drag.cy+dy}}});
 cv.addEventListener('pointerup',e=>{clearTimeout(lp);if(e.button==2){rcT=performance.now();if(!(drag&&drag.m))escCancel();ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;drag=null;return}if(paint){applyPaint();paint=null;return}if(drag&&drag.lp){ptrs.delete(e.pointerId);drag=null;return}
  if(drag&&!drag.m&&!moving&&!ghost&&mode!='del'){const now=performance.now();const o=pickObj(e.clientX,e.clientY);
   if(o&&lastTap.o===o&&now-lastTap.t<400){lastTap={};ptrs.delete(e.pointerId);drag=null;startMove(o);return}lastTap={o,t:now}}
  if(drag&&!drag.m&&ptrs.size==1){if(ghost){const[a,b]=toTile(e.clientX,e.clientY),[gfw,gfh]=fpOf(ghost,moving?moving.rot:ROT);hoverT=[Math.floor(a-(gfw/2-0.5)),Math.floor(b-(gfh/2-0.5))];placeAt()}else onTap(e.clientX,e.clientY)}ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;drag=null});
 cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);drag=null;pinch=null});
 cv.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){zoomTarget=[e.clientX,e.clientY];const f=Math.abs(e.deltaY)<40?Math.exp(-e.deltaY*0.012):(e.deltaY<0?1.15:1/1.15);cam.tz=Math.max(zmin(),Math.min(8,cam.tz*f))}else{homeAnim=null;const m=e.deltaMode==1?16:e.deltaMode==2?100:1;cam.x-=e.deltaX*m;cam.y-=e.deltaY*m;syncGhostHover()}},{passive:false});
 // 우클릭 메뉴 이벤트: Windows는 버튼을 뗀 뒤(위 pointerup에서 이미 처리), macOS는 누를 때 옴 → 직전에 처리했으면 건너뜀
 cv.addEventListener('contextmenu',e=>{e.preventDefault();if(performance.now()-rcT<400)return;escCancel()});
 const objAt=(sx,sy)=>{const o=pickObj(sx,sy);return o&&!DEF[o.k].isPath?o:null};
 cv.addEventListener('dblclick',e=>{if(moving||ghost&&!moving)return;const o=objAt(e.clientX,e.clientY);if(o)startMove(o)});
 $('mvCancel').onclick=cancelMove;
 addEventListener('keydown',e=>{const ae=document.activeElement||{},inText=ae.tagName=='TEXTAREA'||(ae.tagName=='INPUT'&&!/^(range|button|checkbox|radio)$/.test(ae.type||''));if((e.code=='KeyR'||e.key=='r'||e.key=='R'||e.key=='ㄱ'||e.key=='ㅃ')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!inText){if(e.repeat)return;e.preventDefault();if(moving){moving.k=='gate'?rotateGate():rotateObj(moving);syncGhostHover()}else if(ghost){if(ghost=='gate')rotateGate();else if(DEF[ghost]&&!DEF[ghost].isPath&&!DEF[ghost].erase){ROT^=1;syncGhostHover();if(window.SND&&SND.click)SND.click()}}else{const tObj=(INFO_O&&S.objs.includes(INFO_O))?INFO_O:(infoT&&lastTap.o&&S.objs.includes(lastTap.o))?lastTap.o:(window.HOVER&&S.objs.includes(window.HOVER))?window.HOVER:(lastMouse?objAt(lastMouse[0],lastMouse[1]):(hoverT?OCC[hoverT[0]+','+hoverT[1]]:null));if(tObj&&!DEF[tObj.k].isPath){tObj.k=='gate'?rotateGate():rotateObj(tObj)}}return}if(e.key=='Escape')escCancel()});
 $('zs').min=zmin().toFixed(2);$('zs').oninput=e=>{zoomTarget=null;cam.tz=+e.target.value};$('zIn').onclick=()=>{zoomTarget=null;cam.tz=Math.min(8,cam.tz*1.3)};$('zOut').onclick=()=>{zoomTarget=null;cam.tz=Math.max(zmin(),cam.tz/1.3)};
 $('zHome').onclick=()=>{const b=S.objs.find(o=>DEF[o.k].bath)||S.objs[0];homeAnim={t:0,from:{...cam},to:b}};
 $('tFin').onclick=modalFin;$('tGuest').onclick=modalGuest;if($('bRank'))$('bRank').onclick=modalRank;if($('stars'))$('stars').onclick=modalRank;
 $('tDel').onclick=()=>{mode=mode=='del'?null:'del';ghost=null;$('tDel').classList.toggle('on',mode=='del');buildCards();if(mode)toast('철거할 시설을 눌러주세요 (40% 환불)')};
 $('bSpeed').onclick=()=>{speed=speed==1?3:speed==3?10:1;$('bSpeed').textContent=speed+'x'};
 $('bClose').onclick=()=>{$('build').classList.add('hide');$('build').style.display='none';$('bOpen').style.display='flex';$('tools').classList.add('low')};
 $('bOpen').onclick=()=>{$('build').classList.remove('hide');$('build').style.display='';$('bOpen').style.display='none';$('tools').classList.remove('low')};
}
let paint=null,paintCursor=null;
function paintTiles(p){const out=[];if(p.area){for(let x=Math.min(p.x0,p.x1);x<=Math.max(p.x0,p.x1);x++)for(let y=Math.min(p.y0,p.y1);y<=Math.max(p.y0,p.y1);y++)out.push([x,y]);return out}
 const sx=Math.sign(p.x1-p.x0)||1;for(let x=p.x0;;x+=sx){out.push([x,p.y0]);if(x==p.x1)break}
 if(p.y1!=p.y0){const sy=Math.sign(p.y1-p.y0);for(let y=p.y0+sy;;y+=sy){out.push([p.x1,y]);if(y==p.y1)break}}return out}
function paintPlan(){const k=ghost,er=DEF[k].erase;const t=paintTiles(paint).filter(([x,y])=>{if(!tileOpen(x,y))return false;const o=OCC[x+','+y];return er?(o&&DEF[o.k].isPath):(!o||(DEF[o.k].isPath&&o.k!=k))});
 return{t,cost:er?-t.reduce((s,[x,y])=>s+Math.floor(DEF[OCC[x+','+y].k].cost/2),0):t.length*DEF[k].cost}}
function applyPaint(){const k=ghost,{t,cost}=paintPlan();if(!t.length)return;if(cost>S.yen)return toast(`엔이 부족해요 (¥${fmt(cost)} 필요)`);
 const set=new Set(t.map(p=>p.join(',')));S.objs=S.objs.filter(o=>!(DEF[o.k].isPath&&set.has(o.x+','+o.y)));
 if(!DEF[k].erase)for(const[x,y]of t)S.objs.push({k,x,y,lv:1,price:0,uses:0,earn:0});S.yen-=cost;if(cost>0)S.fin.exp+=cost;if(!DEF[k].erase)BUS.emit('paint',k,t.length);
 for(const[x,y]of t.slice(0,30))parts.push({k:'dust',x:x+0.5,y:y+0.5,vx:(Math.random()-0.5),vy:(Math.random()-0.5),h:1,l:0.6,L:0.6});
 OCC=occ();groundDirty=true;guests.forEach(g=>{if(g.st=='walk'&&g.target){const tg=g.target;const d=doorTile(tg);if(d)goTo(g,d[0],d[1])}});toast(DEF[k].erase?`길 ${t.length}칸 제거 (+¥${fmt(-cost)})`:`${DEF[k].n} ${t.length}칸 · ¥${fmt(cost)}`);save()}
function placeAt(){const[x,y]=hoverT;const[sx,sy]=toScreenT(x+0.5,y+0.5);onTapPlace(x,y)}
function onTapPlace(x,y){if(window.READONLY)return;if(moving)return dropMove(x,y);if(!canPlace(ghost,x,y))return toast(tileOpen(x,y)?'여기엔 지을 수 없어요':'잠긴 구역이에요. 표지판을 눌러 열어주세요');const d=DEF[ghost];if(S.yen<d.cost)return toast('엔이 부족해요');
 S.yen-=d.cost;S.fin.exp+=d.cost;clearPaths(ghost,x,y);S.objs.push({k:ghost,x,y,lv:1,rot:DEF[ghost].isPath?0:ROT,price:d.price||0,uses:0,earn:0});BUS.emit('build',S.objs[S.objs.length-1]);anims['o'+(S.objs.length-1)]={t:0};OCC=occ();groundDirty=true;
 const[fw,fh]=fpOf(ghost,ROT);for(let i=0;i<10;i++)parts.push({k:'steam',x:x+fw/2+(Math.random()-0.5)*fw,y:y+fh/2+(Math.random()-0.5)*fh,h:0,vx:0,l:1,L:1,s:2});
 if(ghost!='path'&&!ev.shift){ghost=null;buildCards()}save()}
let zoomTarget=null,homeAnim=null;
// ===== 루프 =====
let last=0,acc=0,hourAcc=0,saveAcc=0;
// 인기 시설 알림: 10게임분마다 만석 여부 기록(최근 3시간), 매시 확인해 하루 1번만 부드럽게 안내
const POPS=new WeakMap();let popDay=-1;
function samplePop(){for(const o of S.objs){const d=DEF[o.k];if(!d.price||!d.cap||d.stay)continue;let a=POPS.get(o);if(!a)POPS.set(o,a=[]);a.push((o.users||0)>=capOf(o)?1:0);if(a.length>18)a.shift()}}
function josa(w,a,b){const c=w.charCodeAt(w.length-1);return(c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28)?a:b}
function popCheck(){if(window.READONLY)return;const day=Math.floor(S.min/1440);if(day===popDay)return;let best=null,br=0;
 for(const o of S.objs){const a=POPS.get(o);if(!a||a.length<12)continue;const r=a.reduce((s,x)=>s+x,0)/a.length;if(r>br){br=r;best=o}}
 if(!best||br<0.4)return;popDay=day;const d=DEF[best.k],n=d.n;window.__pops=(window.__pops||0)+1;
 toast(`${n}${josa(n,'이','가')} 인기 만점이에요! ${best.lv<5?'업그레이드하면':'하나 더 지으면'} 더 많은 손님이 ${d.bath?'쉴':'들를'} 수 있어요`)}
// 방문·쇼케이스: 들어가자마자 손님들이 이미 탕·상점·산책을 즐기고 있도록 렌더 없이 미리 진행
// (최소 게임 1.5시간, 손님이 최대치의 75%가 될 때까지 최대 6시간) — 시각·잔고·손님 수·평판·재정 표시는 원래 값으로 되돌림
function warmUp(){const keep={min:S.min,yen:S.yen,served:S.served,rep:S.rep,fin:JSON.stringify(S.fin||{}),meta:S.meta?JSON.stringify(S.meta):null},nr=window.__norender;
 window.__warm=1;window.__norender=1;const target=Math.max(6,Math.round(maxGuests()*0.75));
 try{for(let i=0;i<1800&&(i<450||guests.length<target);i++)step(0.1)}catch(e){console.warn('[warm]',e)}
 S.min=keep.min;S.yen=keep.yen;S.served=keep.served;S.rep=keep.rep;S.fin=JSON.parse(keep.fin);if(keep.meta)S.meta=JSON.parse(keep.meta);
 floats=[];bubbles=[];window.__norender=nr;window.__warm=0}
function step(dt){if(_pb<=0)_pb=2;
 const gm=dt*2; // 실시간 1초 = 게임 2분
 const prevH=Math.floor(S.min/60);S.min+=gm;const nowH=Math.floor(S.min/60);
 if(Math.floor(S.min/10)!=Math.floor((S.min-gm)/10))samplePop();
 if(nowH!=prevH){popCheck();const wages=wageNow(nowH);const pay=Math.min(wages,Math.max(0,S.yen)),unpaid=wages-pay;S.yen-=pay;if(unpaid>0){if(!S._wt||S.min-S._wt>600){S._wt=S.min;toast('잔고가 조금 부족해요. 손님을 맞이하면 금방 채워져요')}}BUS.emit('hour',nowH);if(nowH%24==0)BUS.emit('day',Math.floor(nowH/24)+1);S.fin.exp+=pay;
  S.fin.hist.push((S.fin._h||0)-wages);S.fin._h=0;if(S.fin.hist.length>48)S.fin.hist.shift();if(nowH%24==0){S.fin.inc=0;S.fin.exp=0}}
 const before=S.yen;
 {const mg=maxGuests(),fill=1+(TUNE.fill||0)*Math.max(0,1-guests.length/mg); // 빈자리가 많을수록 손님이 조금 더 빨리 들어옴
  if(Math.random()<dt*spawnRate()*3*fill&&guests.length<mg)spawn()}
 for(const g of guests)updGuest(g,dt);guests=guests.filter(g=>!g.dead);
 emit(dt);updParts(dt);
 const earned=Math.max(0,S.yen-before);S.fin._h=(S.fin._h||0)+earned;
}
let warnAcc=0,frameN=0;
const _rSeen=new Uint32Array(N*N),_rQ=new Int16Array(N*N);let _rGen=1;
function _bfsGate(){const gi=gateInfo();if(!gi)return 0;const gen=++_rGen,[gx,gy]=gi.m;if(gx<0||gy<0||gx>=N||gy>=N)return gen;
 let h=0,t=0;const s0=gy*N+gx;_rSeen[s0]=gen;_rQ[t++]=s0;
 while(h<t){const c=_rQ[h++],cx=c%N,cy=(c/N)|0;
  if(cx+1<N){const n=c+1;if(_rSeen[n]!==gen&&walkable(cx+1,cy)){_rSeen[n]=gen;_rQ[t++]=n}}
  if(cx>0){const n=c-1;if(_rSeen[n]!==gen&&walkable(cx-1,cy)){_rSeen[n]=gen;_rQ[t++]=n}}
  if(cy+1<N){const n=c+N;if(_rSeen[n]!==gen&&walkable(cx,cy+1)){_rSeen[n]=gen;_rQ[t++]=n}}
  if(cy>0){const n=c-N;if(_rSeen[n]!==gen&&walkable(cx,cy-1)){_rSeen[n]=gen;_rQ[t++]=n}}}
 return gen}
function _objReach(o,gen){for(const[x,y]of tilesOf(o)){if((x+1<N&&_rSeen[y*N+x+1]===gen)||(x>0&&_rSeen[y*N+x-1]===gen)||((y+1)<N&&_rSeen[(y+1)*N+x]===gen)||(y>0&&_rSeen[(y-1)*N+x]===gen))return true}return false}
function checkReach(){const w=$('warn');const gen=_bfsGate();if(!gen){w.style.display='none';return}
 const bad=S.objs.filter(o=>DEF[o.k].price&&o!==moving&&!_objReach(o,gen));
 window._unreach=null;if(bad.length){const a=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(tileOpen(x,y)&&walkable(x,y)&&_rSeen[y*N+x]!==gen)a.push([x,y]);window._unreach=a}
 if(bad.length){w.textContent='⚠️ 대문에서 갈 수 없는 시설: '+[...new Set(bad.map(o=>DEF[o.k].n))].join(', ');w.style.display='block'}else w.style.display='none'}
let _ferr=0,_pb=8;function frame(now){_pb=8;try{frame_(now)}catch(e){if(_ferr++<5)console.error('frame error',e);if(window.DIAG&&_ferr<50)DIAG.log('frame',e.message,{stack:(e.stack||'').slice(0,600)})}requestAnimationFrame(frame)}
function frame_(now){warnAcc+=1;if(warnAcc%90==1)checkReach();const dt=Math.min(0.1,(now-last)/1000||0);last=now;
 if(!paused&&!window.READONLY)for(let i=0;i<speed;i++)step(dt);else if(window.READONLY&&!paused)step(dt);
 if(Math.abs(cam.tz-cam.z)>0.001){const z=cam.z+(cam.tz-cam.z)*Math.min(1,dt*10);const p=zoomTarget||[VW/2,VH/2];zoomAt(p[0],p[1],z)}
 if(homeAnim){homeAnim.t+=dt/0.9;const k=easeOut(Math.min(1,homeAnim.t));const[fw,fh]=homeAnim.to.k?fpOf(homeAnim.to.k,homeAnim.to.rot):[1,1];const save_=cam.z;
  const z=lerp(homeAnim.from.z,VW>820?5.2:3.6,k);cam.z=z;cam.tz=z;const[wx,wy]=iso(homeAnim.to.x+fw/2,homeAnim.to.y+fh/2);const tx_=VW*(VW>820?0.42:0.5)-wx*z,ty_=VH*(VW>820?0.5:0.33)-wy*z;
  cam.x=lerp(homeAnim.from.x,tx_,k);cam.y=lerp(homeAnim.from.y,ty_,k);if(homeAnim.t>=1)homeAnim=null}
 stepBuild(dt);BUS.emit('frame',dt,now);if(!window.__norender&&(!window.GFX_LOW||!window.FPS30||(frameN++&1)==0)){render(now);hud()}saveAcc+=dt;if(saveAcc>5){saveAcc=0;save()}}
async function boot(){resize();addEventListener('resize',resize);if(window.VISIT_PROMISE){try{window.VISIT_SAVE=await window.VISIT_PROMISE}catch(e){window.VISIT_SAVE=null;setTimeout(()=>toast('방문 링크가 올바르지 않아요'),1200)}}load();S.objs.forEach(o=>o.users=0);migrateLayout();migrate();OCC=occ();ensureGate();OCC=occ();
 await Promise.all([loadImgs(),Promise.race([Promise.all([document.fonts.load('700 14px Pretendard',window.FONT_GLYPHS||'가'),document.fonts.ready]).catch(e=>console.warn('[font]',e)),new Promise(r=>setTimeout(r,4000))])]); // 폰트 조각 일부가 실패하거나 느려도 시스템 폰트로 시작
 makeVariants();
 if(IMG.gate){variants('gate',IMG.gate);const flip=src=>{const c=mk(src.width,src.height),g=c.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(src,0,0);return c};const gf=flip(IMG.gate);variants('gate_f',gf);gf.width=gf.height=0;
  const L=splitLayers(IMG.gate,GATE_MASKS);for(const n in L){variants('gate_'+n,L[n]);const fn=flip(L[n]);variants('gate_f_'+n,fn);fn.width=fn.height=0;L[n].width=L[n].height=0}}
 for(const k in OVER){if(!IMG[k])continue;const L=splitLayers(IMG[k],[['over',(g,W,H)=>g.rect(0,0,W,H*OVER[k])]]);variants(k+'_over',L.over);for(const n in L)L[n].width=L[n].height=0}
 const b=S.objs.find(o=>DEF[o.k].bath)||S.objs[0];const[bfw,bfh]=fpOf(b.k,b.rot);focus(b.x+bfw/2,b.y+bfh/2,VW>820?5.2:3.6);
 for(let i=0;i<5;i++)spawn();guests.forEach((g,i)=>{g.x-=i*0.3});
 if(window.READONLY)warmUp();
 buildTabs();initInput();window.__ready=true;requestAnimationFrame(t=>{last=t;frame(t)})}
// 시설 표시용 키 매핑 (milk는 yuzu 이미지에 필터)
const _drawSprite=drawSprite;
boot();
// 테스트 훅
window.__dbg={capOf,bathSlot,focusXY:(x,y,z)=>focus(x,y,z),cam,maxG:()=>maxGuests(),reachOK(){const gen=_bfsGate();if(!gen)return true;return S.objs.filter(o=>DEF[o.k].price).every(o=>_objReach(o,gen))},step:dt=>step(dt),stars:()=>stars(),DEF,canPlace,emit:(...a)=>BUS.emit(...a),plotPrice,occ:()=>{OCC=occ();groundDirty=true},ensureGate(){ensureGate()},gate:()=>gateObj(),checkReach,clearGhost(){ghost=null;buildCards()},upFx(o){upFx(o)},setPaint(k,x0,y0,x1,y1,area){ghost=k;paint={x0,y0,x1,y1,area};applyPaint();paint=null},free(k,x0,y0){for(let r=1;r<8;r++)for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)if(canPlace(k,x0+dx,y0+dy))return[x0+dx,y0+dy]},scr:(x,y)=>toScreenT(x,y),mig(){migrate();OCC=occ();groundDirty=true},get moving(){return moving},get ghost(){return ghost},setGhost(k){ghost=k;buildCards()},get rot(){return ROT},setRot(r){ROT=r&1;syncGhostHover()},get infoO(){return INFO_O},showInfo,hideInfo,startMove,cancelMove,pickObj,skey,VAR,IMG,refresh(){OCC=occ();groundDirty=true},get S(){return S},setHour(h){S.min=Math.floor(S.min/1440)*1440+h*60},spawn,guests:()=>guests,focus,cam};
