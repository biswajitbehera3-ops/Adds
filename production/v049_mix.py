"""Short 049 audio: Fenrir VO over a synthesized tense/military bed (no licensed music). Keypad beep on every spoken
digit, padlock clunk when a code completes, typewriter clicks on OBSESS, alien sting, hangar impact, music dropouts
before each code and the reveal, clean 1.1 s fade. Usage: python3 v049_mix.py <workdir>"""
import sys, json, numpy as np, soundfile as sf
WD=sys.argv[1]; vo,SR=sf.read(f'{WD}/vo.wav'); meta=json.load(open(f'{WD}/vo.json')); M=meta['marks']
N=int((meta['beats'][-1]['end']+1.2)*SR); t=np.arange(N)/SR; bed=np.zeros(N); sfx=np.zeros(N); rng=np.random.default_rng(7)
def add(buf,sig,at,g=1.0):
    i=max(int(at*SR),0); j=min(N,i+len(sig))
    if j>i: buf[i:j]+=g*sig[:j-i]
f=lambda m:440*2**((m-69)/12); BPM=100; bt=60/BPM
chords=[[45,52,57],[41,48,53],[43,50,55],[40,47,52]]   # Am F G Em: tense, cinematic
for bar in range(int(t[-1]/(4*bt))+1):
    b0=bar*4*bt; ch=chords[bar%4]
    for m in ch:
        n=int(4*bt*SR); x=np.arange(n)/SR
        add(bed,0.045*(np.sin(2*np.pi*f(m)*x)+0.4*np.sin(2*np.pi*f(m)*2.01*x))*np.minimum(x/0.4,1)*np.minimum((4*bt-x)/0.4,1),b0)
    for k in range(8):                                   # pulsing low ostinato (military drive)
        n=int(0.22*SR); x=np.arange(n)/SR; m=ch[0]-12
        add(bed,0.11*np.sign(np.sin(2*np.pi*f(m)*x))*np.exp(-x/0.07)*0.6,b0+k*bt/2)
    for k in range(4):                                   # kick + snare-ish hit on 2 and 4
        n=int(0.3*SR); x=np.arange(n)/SR
        add(bed,0.38*np.sin(2*np.pi*(45+80*np.exp(-x/0.025))*x)*np.exp(-x/0.13),b0+k*bt)
        if k%2: add(bed,0.07*rng.standard_normal(int(0.12*SR))*np.exp(-np.arange(int(0.12*SR))/SR/0.04),b0+k*bt)
def beep(at,fr=1320,g=0.16):
    n=int(0.09*SR); x=np.arange(n)/SR; add(sfx,g*np.sin(2*np.pi*fr*x)*np.exp(-x/0.05),at)
def clunk(at,g=0.5):
    n=int(0.35*SR); x=np.arange(n)/SR
    add(sfx,g*(np.sin(2*np.pi*90*x)*np.exp(-x/0.06)+0.4*rng.standard_normal(n)*np.exp(-x/0.015)),at)
def click(at,g=0.12):
    n=int(0.03*SR); add(sfx,g*rng.standard_normal(n)*np.exp(-np.arange(n)/SR/0.006),at)
def sting(at,g=0.18):
    n=int(1.2*SR); x=np.arange(n)/SR; fm=600+300*np.sin(2*np.pi*6*x)
    add(sfx,g*np.sin(2*np.pi*np.cumsum(fm)/SR)*np.minimum(x/0.1,1)*np.exp(-x/0.6),at)
def impact(at,g=0.8):
    n=int(1.5*SR); x=np.arange(n)/SR; w=np.convolve(rng.standard_normal(n),np.ones(60)/60,'same')
    add(sfx,g*(np.sin(2*np.pi*(38+60*np.exp(-x/0.05))*x)*np.exp(-x/0.5)+0.5*w/np.abs(w).max()*np.exp(-x/0.25)),at)
def whoosh(at,g=0.18):
    n=int(0.45*SR); x=np.arange(n)/SR; w=np.convolve(rng.standard_normal(n),np.ones(25)/25,'same'); add(sfx,g*w*np.sin(np.pi*x/0.45)**2,at-0.3)
for b in meta['beats'][1:]: whoosh(b['start'])
for ln in meta['lines']:
    if ln['digit'] is not None: beep(ln['s']+0.02,1250+60*int(ln['digit']))
for cid,last in [('c1',5),('c2',3),('c3',5)]: clunk(M[f'{cid}_{last}']+0.35)
for i in range(6): click(M['obsess']+i*0.09)
sting(M['alien']-0.05); impact(M['open']); clunk(M['tank1'],0.35)
FIRE=meta['lines'][1]['s']; impact(FIRE,0.9)                        # cannon shot in the hook
def rumble(at,dur,g):
    n=int(dur*SR); x=np.arange(n)/SR; w=np.convolve(rng.standard_normal(n),np.ones(300)/300,'same')
    add(sfx,g*(0.5*np.sin(2*np.pi*42*x)*(1+0.3*np.sin(2*np.pi*9*x))+0.6*w/np.abs(w).max())*np.minimum(x/0.15,1)*np.minimum((dur-x)/0.3,1),at)
rumble(0.0,1.1,0.35); whoosh(3.0,0.3); rumble(M['open']+0.05,1.2,0.4)              # tank engine on drive-in and roll-in
duck_music=np.ones(N)
for key in ['c1_0','c2_0','c3_0','open']:                # half-second music dropout before reveals
    a=int((M[key]-0.5)*SR); b=int(M[key]*SR); duck_music[a:b]=np.minimum(duck_music[a:b],0.15)
duck_music=np.convolve(duck_music,np.ones(800)/800,'same')
v=np.zeros(N); v[:len(vo)]=vo
act=np.convolve(np.abs(v)>0.02,np.ones(int(0.25*SR))/int(0.25*SR),'same')
m=bed*duck_music*(1-0.55*np.clip(act*3,0,1))*0.85+sfx+v
m[-int(1.1*SR):]*=np.linspace(1,0,int(1.1*SR))
m=m/np.abs(m).max()*0.92; sf.write(f'{WD}/mix.wav',m.astype(np.float32),SR); print('mix',round(N/SR,2))
