import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, cv2
FS=int(sys.argv[1]); SP=int(sys.argv[2])
W,H=2160,3840
src=Image.open('/tmp/claude-0/-home-user-Adds/2286a8c0-ed81-596f-88c3-0b00ce15c5a6/images/11.jpg').convert('RGB')
Y0=200; bg=src.crop((0,Y0,736,Y0+1308)).resize((W,H),Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,50,2))
s=W/736; WL=int((700-Y0)*s)
a=np.asarray(bg).astype(np.float32)/255
Y=np.arange(H)[:,None,None]; X=np.arange(W)[None,:,None]
def softlight(a,g): return np.where(g<0.5, 2*a*g+a*a*(1-2*g), 1-2*(1-a)*(1-g))
t=np.clip(np.arange(H)/WL,0,1)
stops=[(0,(0.40,0.27,0.72)),(0.45,(0.92,0.42,0.68)),(0.8,(1.0,0.56,0.48)),(1,(1.0,0.74,0.42))]
g=np.stack([np.interp(t,[p for p,_ in stops],[c[i] for _,c in stops]) for i in range(3)],1)[:,None,:]
ksky=np.clip((WL+80-Y)/260,0,1)*0.78; a=a*(1-ksky)+softlight(a,g)*ksky
tw=np.clip((Y-WL)/900,0,1); refl=np.array([1.0,0.62,0.62])*(1-tw)+np.array([0.35,0.75,0.80])*tw
kw=np.clip(1-(Y-WL)/900,0,1)*(Y>=WL-40)*0.38; a=a*(1-kw)+softlight(a,refl)*kw
lum=a.mean(2,keepdims=True); a=a+(np.array([0.10,0.02,0.14])*(1-lum)**2*0.35)+(np.array([0.06,0.03,-0.02])*lum**2*0.6)
sx,sy=330*s,(490-Y0)*s; r=np.sqrt((X-sx)**2+(Y-sy)**2)
a=1-(1-a)*(1-np.exp(-(r/520)**2)*np.array([0.55,0.42,0.30]))
img=Image.fromarray((a.clip(0,1)*255).astype(np.uint8))
hi=img.point(lambda v: max(0,v-170)*3).filter(ImageFilter.GaussianBlur(40))
a=1-(1-np.asarray(img).astype(np.float32)/255)*(1-np.asarray(hi).astype(np.float32)/255*0.35)
r2=np.sqrt(((X-W/2)/(W/2))**2*0.7+((Y-H/2)/(H/2))**2); a=a*(1-0.28*np.clip((r2-0.7)/0.6,0,1)**1.6)
a=a+np.random.default_rng(4).normal(0,0.012,(H,W,1))
base=cv2.cvtColor((a.clip(0,1)*255).astype(np.uint8),cv2.COLOR_RGB2BGR)
small=cv2.resize(base,(W//2,H//2),interpolation=cv2.INTER_AREA)
sm=cv2.bilateralFilter(cv2.edgePreservingFilter(small,flags=1,sigma_s=70,sigma_r=0.35),9,40,40)
Z=sm.reshape(-1,3).astype(np.float32); crit=(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,10,1.0)
_,_,cen=cv2.kmeans(Z[::7],28,None,crit,2,cv2.KMEANS_PP_CENTERS)
q=cen[((Z[:,None,:]-cen[None])**2).sum(2).argmin(1)].reshape(sm.shape)
illu=sm.astype(np.float32)*0.45+q*0.55
e=cv2.GaussianBlur(cv2.Canny(cv2.cvtColor(sm,cv2.COLOR_BGR2GRAY),90,200).astype(np.float32)/255,(3,3),0)[...,None]
illu=illu*(1-e*0.5)+np.array([60,40,30])*e*0.5
hsv=cv2.cvtColor(illu.clip(0,255).astype(np.uint8),cv2.COLOR_BGR2HSV).astype(np.float32)
hsv[...,1]=np.clip(hsv[...,1]*1.18,0,255); hsv[...,2]=np.clip(hsv[...,2]*1.06+6,0,255)
illu=cv2.cvtColor(hsv.astype(np.uint8),cv2.COLOR_HSV2BGR).astype(np.float32)
lum=illu.mean(2,keepdims=True)/255; illu=illu+np.array([30,-5,25])*(1-lum)**3*0.6
illu=cv2.resize(illu.clip(0,255).astype(np.uint8),(W,H),interpolation=cv2.INTER_CUBIC).astype(np.float32)
y=np.arange(H)[:,None,None]; m=np.clip((y-(WL-60))/240,0,1)
out=base.astype(np.float32)*(1-m)+illu*m
shade=np.clip((y-(H-1100))/700,0,1)**1.3*0.62
out=out*(1-shade)+np.array([60,30,10])*shade
img=Image.fromarray(cv2.cvtColor(out.clip(0,255).astype(np.uint8),cv2.COLOR_BGR2RGB))
F='/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf'
f=ImageFont.truetype(F,FS); txt='KAI CENAT SWIMS WITH SHARKS'
d=ImageDraw.Draw(img); widths=[d.textlength(c,font=f) for c in txt]; tw_=sum(widths)+SP*(len(txt)-1)
x0=(W-tw_)/2; y0=H-560
def draw(dr,fill,stroke=0,sf=None):
    xx=x0
    for c,wc in zip(txt,widths):
        dr.text((xx,y0),c,font=f,fill=fill,stroke_width=stroke,stroke_fill=sf); xx+=wc+SP
glow=Image.new('L',(W,H),0); draw(ImageDraw.Draw(glow),255,10,255)
img.paste(Image.new('RGB',(W,H),(255,140,170)),(0,0),glow.filter(ImageFilter.GaussianBlur(30)).point(lambda v:int(v*0.6)))
draw(d,(255,250,245),9,(15,20,40))
print('text width',tw_,'of',W)
img.save('/home/user/Adds/production/kai/thumb-sharks-v6-9x16-4k.jpg',quality=95)
img.resize((1080,1920),Image.LANCZOS).save('/home/user/Adds/production/kai/thumb-sharks-v6-9x16-1080.jpg',quality=95)
img.resize((540,960)).save('shv6.jpg')
