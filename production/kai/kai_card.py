# "Vice Sunset Card" layout: framed facecam card on top (Typical Gamer-style square card), new Vice City sunset vibe.
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
D='live/mon_kaicenat/'; OUT='/home/user/Adds/production/kai/'
ANTON='/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf'
W,H=1080,1920
PLUM=(30,12,34); APRICOT=(247,181,133); SALMON=(241,172,156); ROSE=(228,161,163); MAUVE=(193,149,176); PINK=(255,92,170)
CAM=(30,236,200,346)   # tighter on Kai
def vgrad(w,h,stops):
    g=Image.new('RGB',(1,h))
    for y in range(h):
        t=y/(h-1)
        for (t0,c0),(t1,c1) in zip(stops,stops[1:]):
            if t0<=t<=t1:
                k=(t-t0)/(t1-t0); g.putpixel((0,y),tuple(int(c0[i]+(c1[i]-c0[i])*k) for i in range(3))); break
    return g.resize((w,h))
def hgrad(w,h,c0,c1):
    g=Image.new('RGB',(w,1))
    for x in range(w): k=x/(w-1); g.putpixel((x,0),tuple(int(c0[i]+(c1[i]-c0[i])*k) for i in range(3)))
    return g.resize((w,h))
def rmask(w,h,r):
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),radius=r,fill=255); return m
def frame(i,cx,cap):
    f=Image.open(f'{D}f_{i:04d}.jpg').convert('RGB')
    out=vgrad(W,H,[(0,(22,8,30)),(0.32,(58,22,52)),(0.55,PLUM),(1,(14,6,20))])
    # --- gameplay panel (edge to edge), y 640..1720
    gy,gh=760,1160; y0,y1=28,478; gw=int((y1-y0)*W/gh); x0=max(215,min(905-gw,cx-gw//2))
    g=f.crop((x0,y0,x0+gw,y1)).resize((W,gh),Image.LANCZOS); out.paste(g,(0,gy))
    for yy in (gy-3,): out.paste(hgrad(W,4,APRICOT,PINK),(0,yy))
    # --- facecam card
    cw,ch=900,int(900*(CAM[3]-CAM[1])/(CAM[2]-CAM[0])); cx0=(W-cw)//2; cy0=70; R=46
    cam=f.crop(CAM).resize((cw,ch),Image.LANCZOS)
    # glow: gradient ring blurred (glow only, the video itself stays sharp)
    pad=60; glow=Image.new('RGB',(cw+2*pad,ch+2*pad),(0,0,0)); gm=Image.new('L',glow.size,0)
    ImageDraw.Draw(gm).rounded_rectangle((pad-8,pad-8,pad+cw+8,pad+ch+8),radius=R+8,outline=255,width=16)
    gm=gm.filter(ImageFilter.GaussianBlur(22))
    col=hgrad(glow.size[0],glow.size[1],APRICOT,PINK)
    out.paste(col,(cx0-pad,cy0-pad),gm.point(lambda v:min(255,int(v*1.6))))
    # gradient border ring
    ring=Image.new('L',(cw+16,ch+16),0); ImageDraw.Draw(ring).rounded_rectangle((0,0,cw+15,ch+15),radius=R+8,fill=255)
    out.paste(hgrad(cw+16,ch+16,APRICOT,PINK),(cx0-8,cy0-8),ring)
    out.paste(cam,(cx0,cy0),rmask(cw,ch,R))
    d=ImageDraw.Draw(out)
    # --- caption (only text): white Anton, dark outline, at the seam
    if cap:
        fnt=ImageFont.truetype(ANTON,104); tw=d.textlength(cap,font=fnt); ty=gy-70
        sh=Image.new('L',(W,H),0); ImageDraw.Draw(sh).text(((W-tw)/2,ty),cap,font=fnt,fill=255,stroke_width=10,stroke_fill=255)
        out.paste(Image.new('RGB',(W,H),PINK),(0,0),sh.filter(ImageFilter.GaussianBlur(18)).point(lambda v:int(v*0.8)))
        d.text(((W-tw)/2,ty),cap,font=fnt,fill='white',stroke_width=9,stroke_fill=(20,6,24))
    return out
shots=[(186,500,'BRO'),(189,470,'*FLIPS*'),(191,480,'NAH'),(193,470,'IT LANDED')]
# NOTE: 'BRO' / 'NAH' / 'IT LANDED' are placeholders for where his real words go; real captions come from his audio.
ims=[frame(*s) for s in shots]
ims[1].save(OUT+'mock-card-1080x1920.jpg',quality=92)
pw,ph=360,640; strip=Image.new('RGB',(4*pw+5*40,ph+120),(18,18,22)); sd=ImageDraw.Draw(strip)
lab=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf',26)
for k,(im,t) in enumerate(zip(ims,['0:00 driving','0:03 the flip','0:05 it rolls','0:07 lands, keeps going'])):
    x=40+k*(pw+40); strip.paste(im.resize((pw,ph),Image.LANCZOS),(x,40))
    sd.rounded_rectangle((x-6,34,x+pw+6,40+ph+6),radius=28,outline=(90,90,100),width=6); sd.text((x+10,ph+60),t,font=lab,fill=(220,220,230))
strip.save(OUT+'mock-card-strip.jpg',quality=90)
