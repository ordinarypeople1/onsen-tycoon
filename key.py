# 범용 크로마키: 모서리 배경색 기준 거리 + despill + 다운스케일 + 팔레트 양자화
import sys,numpy as np
from PIL import Image
from scipy import ndimage
def key(src,dst,size,colors=48):
    im=np.array(Image.open(src).convert('RGB')).astype(int)
    bg=np.median(np.concatenate([im[:8,:8].reshape(-1,3),im[-8:,-8:].reshape(-1,3),im[:8,-8:].reshape(-1,3)]),0)
    d=np.sqrt(((im-bg)**2).sum(-1))
    m=d>110
    m=ndimage.binary_opening(m,iterations=2);lab,n=ndimage.label(m)
    if n:sz=ndimage.sum(m,lab,range(1,n+1));m=np.isin(lab,np.where(sz>500)[0]+1)
    m=ndimage.binary_fill_holes(m)
    edge=m&~ndimage.binary_erosion(m,iterations=3)
    out=im.copy().astype(float)
    # despill: 가장자리에서 배경색 성분 제거
    sp=(out[...,0]>out[...,1]+40)&(out[...,2]>out[...,1]+20)&edge
    out[sp,0]=out[sp,1]+(out[sp,0]-out[sp,1])*0.35;out[sp,2]=out[sp,1]+(out[sp,2]-out[sp,1])*0.35
    a=np.dstack([np.clip(out,0,255).astype(np.uint8),(m*255).astype(np.uint8)])
    img=Image.fromarray(a,'RGBA');bb=img.getbbox();img=img.crop(bb)
    w=size;h=round(img.height*w/img.width);img=img.resize((w,h),Image.BOX)
    al=np.array(img)[...,3];rgb=img.convert('RGB').quantize(colors,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
    o=np.dstack([np.array(rgb),np.where(al>128,255,0).astype(np.uint8)])
    Image.fromarray(o,'RGBA').save(dst)
if __name__=='__main__':key(sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]) if len(sys.argv)>4 else 48)
def sheet(src,names,scale=2,colors=40):
    im=np.array(Image.open(src).convert('RGB')).astype(int)
    bg=np.median(np.concatenate([im[:8,:8].reshape(-1,3),im[-8:,-8:].reshape(-1,3),im[:8,-8:].reshape(-1,3),im[-8:,:8].reshape(-1,3)]),0)
    d=np.sqrt(((im-bg)**2).sum(-1));m=d>105;m=ndimage.binary_opening(m,iterations=1)
    lab,n=ndimage.label(ndimage.binary_dilation(m,iterations=14))
    objs=[(s,i+1) for i,s in enumerate(ndimage.find_objects(lab)) if (s[0].stop-s[0].start)*(s[1].stop-s[1].start)>4000]
    objs.sort(key=lambda o:o[0][1].start);print(src,len(objs))
    for (sl,i),nm in zip(objs,names):
        mm=m[sl]&(lab[sl]==i);dd=d[sl];mm=ndimage.binary_fill_holes(mm);bgc=ndimage.binary_opening(dd<70,iterations=1);mm=mm&~bgc
        sub=im[sl].astype(float).copy()
        edge=mm&~ndimage.binary_erosion(mm,iterations=3)
        sp=edge&(sub[...,0]>sub[...,1]+50)&(sub[...,2]>sub[...,1]+30)
        g=sub[...,1];sub[sp,0]=g[sp]+(sub[sp,0]-g[sp])*0.3;sub[sp,2]=g[sp]+(sub[sp,2]-g[sp])*0.3
        img=Image.fromarray(np.dstack([np.clip(sub,0,255).astype(np.uint8),(mm*255).astype(np.uint8)]),'RGBA')
        img=img.crop(img.getbbox());w,h=img.size;img=img.resize((max(1,round(w/scale)),max(1,round(h/scale))),Image.BOX)
        a=np.array(img);al=a[...,3]>140
        rgb=Image.fromarray(a[...,:3]).quantize(colors,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
        # 고립 픽셀 정리: 알파 1px 섬 제거
        al=ndimage.binary_opening(al,structure=np.ones((2,2)))|ndimage.binary_erosion(al)
        Image.fromarray(np.dstack([np.array(rgb),(al*255).astype(np.uint8)]),'RGBA').save('assets/'+nm+'.png');print(nm,img.size)
