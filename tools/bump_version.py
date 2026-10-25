# 배포 캐시 무효화: index.html이 불러오는 로컬 스크립트·스타일 주소에 ?v=<버전>을 붙이거나 갱신
# GitHub Pages는 파일을 10분간 캐시해서, 버전이 없으면 배포 직후 새 index.html과 예전 game.js가 섞여 실행될 수 있음
# 배포 전 레포 루트에서 실행: python3 tools/bump_version.py
import re,time
p='index.html';s=open(p,encoding='utf-8').read()
v=time.strftime('%Y%m%d%H%M')
s2=re.sub(r'((?:src|href)="(?!https?:|//|#|data:)[^"?]+\.(?:js|css))(?:\?v=[0-9]+)?"',lambda m:f'{m.group(1)}?v={v}"',s)
open(p,'w',encoding='utf-8').write(s2);print('version',v,'refs',len(re.findall(r'\?v='+v,s2)))
