# Layout v3: gameplay full-screen 9:16 background + rounded Kai camera card on top (Vice Sunset border). Caption = only text.
from PIL import Image, ImageDraw, ImageFont, ImageFilter
D='live/mon_kaicenat/'; OUT='/home/user/Adds/production/kai/'
ANTON='/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf'
W,H=1080,1920; APRICOT=(247,181,133); PINK=(255,92,170)
CAM=(40,236,192,346)                 # tight on Kai inside the stream's facecam box
Y0,Y1=18,478                         # keep the game image above the mission/subtitle text
SHARP=ImageFilter.UnsharpMask(radius=2,percent=120,threshold=2)
def hgrad(w,h,c0,c1):
    g=Image.new('RGB',(w,1))
    for x in range(w): k=x/(w-1); g.putpixel((x,0),tuple(int(c0[i]+(c1[i]-c0[i])*k) for i in range(3)))
    return g.resize((w,h))
def rmask(w,h,r):
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),radius=r,fill=255); return m
import random
def frame_fx(img):
    import numpy as np
    a=np.asarray(img).astype(np.float32)/255
    yy,xx=np.mgrid[0:H,0:W]; nx=(xx-W/2)/(W/2); ny=(yy-H/2)/(H/2)
    r=np.sqrt(nx**2*0.85+ny**2)                       # 1) gentle vignette: only the outer edge darkens
    vig=1-0.38*np.clip((r-0.75)/0.6,0,1)**1.5
    a*=vig[...,None]
    top=np.clip(1-yy/380,0,1)[...,None]*0.16          # 2) faint sunset tint at top (apricot) and bottom (pink)
    bot=np.clip((yy-(H-460))/460,0,1)[...,None]*0.20
    a=a*(1-top)+np.array(APRICOT)/255*top
    a=a*(1-bot)+np.array(PINK)/255*bot
    rng=np.random.default_rng(7); a+=rng.normal(0,0.018,(H,W,1))   # 3) light film grain
    img=Image.fromarray((np.clip(a,0,1)*255).astype(np.uint8))
    # 4) thin inset rounded frame, apricot→pink, with a faint glow
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).rounded_rectangle((24,24,W-25,H-25),radius=58,outline=255,width=4)
    grad=Image.new('RGB',(1,H)); [grad.putpixel((0,y),tuple(int(APRICOT[i]+(PINK[i]-APRICOT[i])*y/(H-1)) for i in range(3))) for y in range(H)]
    grad=grad.resize((W,H)); img.paste(grad,(0,0),m.filter(ImageFilter.GaussianBlur(9)).point(lambda x:min(255,x*2))); img.paste(grad,(0,0),m)
    # 5) round the outer corners (outside the frame → plum)
    c=Image.new('L',(W,H),0); ImageDraw.Draw(c).rounded_rectangle((0,0,W-1,H-1),radius=70,fill=255)
    return Image.composite(img,Image.new('RGB',(W,H),(22,6,26)),c)
def frame(i,cx,cap):
    f=Image.open(f'{D}f_{i:04d}.jpg').convert('RGB')
    s=H/(Y1-Y0); sw=round(W/s); x0=max(215,min(905-sw,cx-sw//2))
    out=f.crop((x0,Y0,x0+sw,Y1)).resize((W,H),Image.LANCZOS).filter(SHARP)
    out=frame_fx(out)
    cw=470; ch=round(cw*(CAM[3]-CAM[1])/(CAM[2]-CAM[0])); cx0=48; cy0=80; R=34
    cam=f.crop(CAM).resize((cw,ch),Image.LANCZOS).filter(SHARP)
    pad=50; gm=Image.new('L',(cw+2*pad,ch+2*pad),0)
    ImageDraw.Draw(gm).rounded_rectangle((pad-8,pad-8,pad+cw+8,pad+ch+8),radius=R+8,outline=255,width=12)
    gm=gm.filter(ImageFilter.GaussianBlur(16)).point(lambda v:min(255,int(v*1.7)))
    out.paste(hgrad(*gm.size,APRICOT,PINK),(cx0-pad,cy0-pad),gm)                 # glow halo only
    out.paste(hgrad(cw+16,ch+16,APRICOT,PINK),(cx0-8,cy0-8),rmask(cw+16,ch+16,R+8))  # border
    out.paste(cam,(cx0,cy0),rmask(cw,ch,R))
    if cap:
        d=ImageDraw.Draw(out); fnt=ImageFont.truetype(ANTON,104); tw=d.textlength(cap,font=fnt); ty=1460
        m=Image.new('L',(W,H),0); ImageDraw.Draw(m).text(((W-tw)/2,ty),cap,font=fnt,fill=255,stroke_width=12,stroke_fill=255)
        out.paste(Image.new('RGB',(W,H),PINK),(0,0),m.filter(ImageFilter.GaussianBlur(18)).point(lambda v:int(v*0.75)))
        d.text(((W-tw)/2,ty),cap,font=fnt,fill='white',stroke_width=9,stroke_fill=(20,6,24))
    return out
shots=[(186,500,'BRO'),(189,470,'*FLIPS*'),(190,520,'NAH'),(193,470,'IT LANDED')]   # captions = placeholders for his real words
ims=[frame(*s) for s in shots]
ims[1].save(OUT+'mock-full-1080x1920.jpg',quality=93)
pw,ph=360,640; strip=Image.new('RGB',(4*pw+5*40,ph+120),(18,18,22)); sd=ImageDraw.Draw(strip)
lab=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf',26)
for k,(im,t) in enumerate(zip(ims,['0:00 driving','0:03 the flip','0:05 it rolls','0:07 lands, keeps going'])):
    x=40+k*(pw+40); strip.paste(im.resize((pw,ph),Image.LANCZOS),(x,40))
    sd.rounded_rectangle((x-6,34,x+pw+6,40+ph+6),radius=28,outline=(90,90,100),width=6); sd.text((x+10,ph+60),t,font=lab,fill=(220,220,230))
strip.save(OUT+'mock-full-strip.jpg',quality=90)
