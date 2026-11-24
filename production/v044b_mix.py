"""Short 044 v2 audio (loop ending, no fade-out): Fenrir VO over a synthesized tropical bed (no licensed music), whooshes on beat changes,
coin dings on the treasure items, an underwater rumble on the shark warning. Usage: python3 v044b_mix.py <workdir>"""
import sys, json, numpy as np, soundfile as sf
WD=sys.argv[1]; vo,SR=sf.read(f'{WD}/vo.wav'); meta=json.load(open(f'{WD}/vo.json'))
N=int((json.load(open(f'{WD}/vo.json'))['beats'][-1]['end']+0.6)*SR)+1; t=np.arange(N)/SR; bed=np.zeros(N); rng=np.random.default_rng(4)
BPM=104; beat=60/BPM
def env(n,a,d): x=np.arange(n)/SR; return np.minimum(x/a,1)*np.exp(-x/d)
def add(sig,at,g=1.0):
    i=max(int(at*SR),0); j=min(N,i+len(sig))
    if j>i: bed[i:j]+=g*sig[:j-i]
chords=[[57,61,64],[54,57,61],[50,54,57],[52,56,59]]   # A  F#m  D  E
f=lambda m:440*2**((m-69)/12)
for bar in range(int(t[-1]/(4*beat))+1):
    ch=chords[bar%4]; b0=bar*4*beat
    for m in ch:                                     # warm pad
        n=int(4*beat*SR); x=np.arange(n)/SR
        add(0.05*np.sin(2*np.pi*f(m)*x)*np.minimum(x/0.3,1)*np.minimum((4*beat-x)/0.3,1),b0)
    for k in range(8):                               # marimba-ish pluck arpeggio
        m=ch[[0,1,2,1,0,2,1,2][k]]+12; n=int(0.35*SR); x=np.arange(n)/SR
        add(0.07*(np.sin(2*np.pi*f(m)*x)+0.3*np.sin(2*np.pi*f(m)*4*x))*np.exp(-x/0.09),b0+k*beat/2)
    for k in range(4):                               # soft kick + shaker
        n=int(0.25*SR); x=np.arange(n)/SR
        add(0.35*np.sin(2*np.pi*(50+70*np.exp(-x/0.03))*x)*np.exp(-x/0.12),b0+k*beat)
        add(0.03*rng.standard_normal(int(0.05*SR))*env(int(0.05*SR),0.002,0.015),b0+k*beat+beat/2)
def whoosh(at,g=0.25):
    n=int(0.5*SR); x=np.arange(n)/SR; w=rng.standard_normal(n); w=np.convolve(w,np.ones(30)/30,'same')
    add(g*w*np.sin(np.pi*x/0.5)**2,at-0.35)
def ding(at,g=0.22):
    n=int(0.6*SR); x=np.arange(n)/SR
    add(g*(np.sin(2*np.pi*1975*x)+0.6*np.sin(2*np.pi*2637*x))*np.exp(-x/0.15),at)
def rumble(at,dur,g=0.5):
    n=int(dur*SR); x=np.arange(n)/SR; w=rng.standard_normal(n); w=np.convolve(w,np.ones(400)/400,'same')
    add(g*w/np.abs(w).max()*np.sin(np.pi*x/dur)+0.25*g*np.sin(2*np.pi*40*x)*np.sin(np.pi*x/dur),at)
B={b['beat']:b for b in meta['beats']}
for b in meta['beats'][1:]: whoosh(b['start'])
P=B['payoff']['start']
ding(P,0.3); ding(P+1.0,0.3); ding(P+1.6,0.35); ding(P+4.6); ding(P+5.6); ding(B['sell']['start']+0.2)
rumble(B['shark']['start']-0.1,2.6); rumble(5.9,1.3,0.35)
v=np.zeros(N); v[:len(vo)]=vo
act=np.convolve(np.abs(v)>0.02,np.ones(int(0.25*SR))/int(0.25*SR),'same')
duck=1-0.55*np.clip(act*3,0,1)                        # bed sits under the voice
m=bed*duck*0.8+v*1.0; m[-int(0.04*SR):]*=np.linspace(1,0,int(0.04*SR))   # tiny de-click only: the end loops
m=m/np.abs(m).max()*0.92; sf.write(f'{WD}/mix.wav',m.astype(np.float32),SR); print('mix',round(N/SR,2))
