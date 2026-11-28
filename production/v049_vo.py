"""Short 049 voice-over: Kokoro am_fenrir, one phrase per call with its own speed, gain and pause, so the read has
human pacing (slower on weight words, suspense pauses before reveals, codes digit by digit with exact timestamps).
Run inside the work dir; writes vo.wav + vo.json (beats, caption lines, digit marks)."""
import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
d="/tmp/claude-0/-home-user-Adds/2286a8c0-ed81-596f-88c3-0b00ce15c5a6/scratchpad/kokoro"
k=Kokoro(d+"/model.onnx", d+"/voices.npz"); V="am_fenrir"; SR=24000
W={'0':'Zero.','1':'One.','2':'Two.','3':'Three.','5':'Five.','7':'Seven.','8':'Eight.','9':'Nine.'}
def code(beat,cid,digits): return [(beat,W[c],1.05,0.07,1.0,f'{cid}_{i}',c) for i,c in enumerate(digits)]
SPF,GPF=1.12,0.7   # global pace: a little faster, shorter pauses (keeps the relative expression)
# (beat, text, speed, pause_after, gain, mark, digit)
P=[("hook","If you want the free tank in GTA 6,",1.0,0.12,1.0,None,None),
   ("hook","stop guessing.",0.92,0.35,1.08,None,None),
   ("hook","The last code isn't even a number…",0.98,0.4,1.0,None,None),
   ("hook","but you'll have all three before this ends.",1.05,0.45,1.0,None,None),
   ("promise","Four stops.",0.95,0.18,1.0,'stop4',None),("promise","Three codes.",0.95,0.18,1.0,'codes3',None),
   ("promise","One tank.",0.88,0.45,1.1,'tank1',None),
   ("steps","The old man at the downtown war memorial sends you to Little Cuba.",1.07,0.25,1.0,'cuba',None),
   ("steps","In his apartment…",1.0,0.3,1.0,None,None),("steps","a photo of an island.",1.0,0.35,1.0,'island',None),
   ("code1","Sharktooth Island.",1.0,0.25,1.0,None,None)]+code("code1","c1","010317")+[
   ("punch","The President's birthday.",1.0,0.25,1.0,'bday',None),
   ("punch","Great security, Mister President.",0.95,0.45,1.0,None,None),
   ("alien","Check his desk…",1.0,0.35,1.0,None,None),("alien","the President,",0.98,0.12,1.0,None,None),
   ("alien","meeting an alien.",0.88,0.3,1.1,'alien',None),("alien","On Mount Chiliad.",0.88,0.45,1.1,'chiliad',None),
   ("code2","His safe:",1.0,0.2,1.0,None,None)]+code("code2","c2","2975")+[
   ("code2","Inside, a photo with one word on the back…",1.02,0.55,1.0,'photo',None),
   ("obsess","OBSESS.",0.85,0.4,1.15,'obsess',None),("obsess","Told you it wasn't a number.",1.02,0.35,1.0,None,None),
   ("code3","Big Pine forest, keypad on a tree.",1.05,0.2,1.0,'forest',None),
   ("code3","Type OBSESS like a calculator screen:",1.05,0.2,1.0,'morph',None)]+code("code3","c3","085355")+[
   ("payoff","Hit the big red button…",1.0,0.65,1.0,'button',None),
   ("payoff","and the hangar opens.",0.92,0.5,1.1,'open',None),
   ("end","Lose it, and the bunker gives you another one.",1.05,0.25,1.0,None,None),
   ("end","Free tanks forever.",0.95,0.3,1.0,'forever',None),
   ("end","Thanks, Mister President.",0.95,0.3,1.0,None,None)]
out=[np.zeros(int(0.12*SR),np.float32)]; t=0.12; beats={}; lines=[]; marks={}
for b,txt,sp,gap,g,mk,dg in P:
    gap=gap*GPF; s,_=k.create(txt,voice=V,speed=min(sp*SPF,1.4),lang="en-us"); s=s.astype(np.float32)*g
    f=int(0.008*SR); s[:f]*=np.linspace(0,1,f); s[-f:]*=np.linspace(1,0,f)
    st=t; t+=len(s)/SR; lines.append(dict(beat=b,s=round(st,3),e=round(t,3),t=txt,digit=dg,mark=mk))
    if mk: marks[mk]=round(st,3)
    t+=gap; bb=beats.setdefault(b,{"beat":b,"start":round(st,3)}); bb["end"]=round(t,3)
    out+=[s,np.zeros(int(gap*SR),np.float32)]
bl=list(beats.values()); bl[0]["start"]=0.0
for i in range(len(bl)-1): bl[i]["end"]=bl[i+1]["start"]
a=np.concatenate(out); a=a/np.abs(a).max()*0.9; sf.write("vo.wav",a,SR)
json.dump(dict(beats=bl,lines=lines,marks=marks),open("vo.json","w"),indent=1)
print(round(len(a)/SR,2)); [print(b['beat'],b['start'],b['end']) for b in bl]
