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
