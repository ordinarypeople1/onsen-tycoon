# 생성 이미지 → 게임 스프라이트: 배경 플러드필 제거, 크롭, 픽셀 격자로 축소, 기존 레벨 스프라이트 팔레트로 양자화, 외곽선 정리
import sys,numpy as np
from PIL import Image,ImageFilter
from collections import deque
src,dst,width,refs=sys.argv[1],sys.argv[2],int(sys.argv[3]),sys.argv[4:]
im=Image.open(src).convert('RGB');a=np.asarray(im).astype(int);H,W,_=a.shape
bg=np.median(np.concatenate([a[0],a[-1],a[:,0],a[:,-1]]),0)
d=np.sqrt(((a-bg)**2).sum(-1));cand=d<70
mask=np.zeros((H,W),bool);q=deque()
for x in range(W):
  for y in (0,H-1):
    if cand[y,x]:mask[y,x]=1;q.append((y,x))
for y in range(H):
  for x in (0,W-1):
    if cand[y,x] and not mask[y,x]:mask[y,x]=1;q.append((y,x))
while q:
  y,x=q.popleft()
  for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
    ny,nx=y+dy,x+dx
    if 0<=ny<H and 0<=nx<W and cand[ny,nx] and not mask[ny,nx]:mask[ny,nx]=1;q.append((ny,nx))
# 테두리와 이어지지 않은 내부 배경(울타리 사이로 보이는 배경)도 제거: 배경색에 가까운 큰 덩어리
from scipy import ndimage
import os
lab,nl=ndimage.label(d<55)
if nl and not os.environ.get('NOINT'):
  sz=ndimage.sum(np.ones_like(d),lab,range(1,nl+1))
  for i,z in enumerate(sz):
    if z>H*W*0.0015: mask|=lab==(i+1)
alpha=(~mask).astype(np.uint8)*255
rgba=np.dstack([a.astype(np.uint8),alpha]);img=Image.fromarray(rgba,'RGBA')
bb=img.getbbox();img=img.crop(bb)
h=round(img.height*width/img.width)
# 축소: 색은 박스 필터, 알파는 임계
small=img.resize((width,h),Image.BOX)
sa=np.asarray(small).copy();al=sa[...,3]
# 가장자리 배경 번짐 제거: 배경색 쪽으로 물든 반투명 픽셀 제거
sa[...,3]=np.where(al>150,255,0)
# 팔레트: 참조 스프라이트들에서 추출
pix=[]
for r in refs:
  ra=np.asarray(Image.open(r).convert('RGBA'));pix.append(ra[ra[...,3]>200][:,:3])
pix=np.concatenate(pix)
palimg=Image.fromarray(pix[np.random.default_rng(0).choice(len(pix),min(len(pix),60000),replace=False)].reshape(-1,1,3).astype(np.uint8),'RGB').quantize(56,method=Image.MEDIANCUT)
rgb=Image.fromarray(sa[...,:3],'RGB').quantize(palette=palimg,dither=Image.NONE).convert('RGB')
out=np.dstack([np.asarray(rgb),sa[...,3]])
# 외곽선: 불투명 영역 바깥 1px 에 이웃 중 가장 어두운 색보다 더 어둡게 먹선
A=out[...,3]>0
edge=np.zeros_like(A)
edge[1:-1,1:-1]=A[1:-1,1:-1]&~(A[:-2,1:-1]&A[2:,1:-1]&A[1:-1,:-2]&A[1:-1,2:])
o=out.astype(int);ink=np.array([43,29,20])
o[edge,:3]=(o[edge,:3]*0.45+ink*0.55).astype(int)
Image.fromarray(o.astype(np.uint8),'RGBA').save(dst)
print(dst,width,h)
