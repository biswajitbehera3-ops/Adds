"""Short 049 voice-over (v3 calm walkthrough script): Kokoro am_fenrir, one phrase per call with its own speed, gain and pause, so the read has
human pacing (slower on weight words, suspense pauses before reveals, codes digit by digit with exact timestamps).
Run inside the work dir; writes vo.wav + vo.json (beats, caption lines, digit marks)."""
import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
d="/tmp/claude-0/-home-user-Adds/2286a8c0-ed81-596f-88c3-0b00ce15c5a6/scratchpad/kokoro"
k=Kokoro(d+"/model.onnx", d+"/voices.npz"); V="am_fenrir"; SR=24000
W={'0':'Zero.','1':'One.','2':'Two.','3':'Three.','5':'Five.','7':'Seven.','8':'Eight.','9':'Nine.'}
def code(beat,cid,digits): return [(beat,W[c],1.0,0.16,1.0,f'{cid}_{i}',c) for i,c in enumerate(digits)]
SPF,GPF=1.04,0.9   # v3: calm, unhurried walkthrough pace (just under 2 min)
# (beat, text, speed, pause_after, gain, mark, digit)
P=[("hook","You can get a free tank in GTA 6…",0.98,0.35,1.05,None,None),
   ("hook","but only if you follow the clues the game never tells you about.",1.0,0.35,1.0,None,None),
   ("hook","Let me walk you through it, step by step.",1.0,0.6,1.0,'stepby',None),
   ("what","This is a hidden side quest.",0.98,0.3,1.0,None,None),
   ("what","An old man in Vice City doesn't believe the official story about President Joe Russo's death…",1.0,0.35,1.0,'oldman',None),
   ("what","and his clues lead you to two secret bunkers.",1.0,0.3,1.0,'bunkers',None),
   ("what","The tank is in the second one.",0.97,0.6,1.05,'second',None),
   ("step1","Step one.",0.95,0.25,1.05,'s1',None),
   ("step1","Go to the war memorial in Downtown Vice City.",1.0,0.3,1.0,'memorial',None),
   ("step1","Find the old man sitting by the wall…",1.0,0.3,1.0,None,None),
   ("step1","and ask him: what really happened?",0.98,0.6,1.0,'ask',None),
   ("step2","Step two.",0.95,0.25,1.05,'s2',None),
   ("step2","He'll send you to his apartment in Little Cuba.",1.0,0.25,1.0,None,None),
   ("step2","It's the building with Cuban flags outside.",1.0,0.35,1.0,'flags',None),
   ("step2","Inside, look at three things:",1.0,0.25,1.0,None,None),
   ("step2","a bunker blueprint,",1.0,0.2,1.0,'blueprint',None),("step2","a tape recording…",1.0,0.25,1.0,'tape',None),
   ("step2","and a photo of an island.",0.98,0.6,1.0,'island',None),
   ("code1","Step three.",0.95,0.25,1.05,'s3',None),
   ("code1","That island is Sharktooth Island.",1.0,0.3,1.0,None,None),
   ("code1","Take a boat to the north shore, and you'll find the bunker door.",1.0,0.3,1.0,'door',None),
   ("code1","The code is…",0.98,0.3,1.0,None,None)]+code("code1","c1","010317")+[
   ("joke","That's the President's birthday.",1.0,0.25,1.0,'bday',None),
   ("joke","Not exactly top secret.",0.95,0.6,1.0,None,None),
   ("alien","Step four.",0.95,0.25,1.05,'s4',None),
   ("alien","Inside, turn the power on first.",1.0,0.3,1.0,'power',None),
   ("alien","On the President's desk, there's a photo of him…",1.0,0.35,1.0,None,None),
   ("alien","meeting an alien.",0.88,0.3,1.1,'alien',None),("alien","On Mount Chiliad.",0.9,0.5,1.1,'chiliad',None),
   ("code2","Then open his safe with",1.0,0.2,1.0,None,None)]+code("code2","c2","2975")+[
   ("code2","Inside is his old pistol…",1.0,0.3,1.0,'pistol',None),
   ("code2","and a photo with one word written on the back:",1.0,0.4,1.0,'photo',None),
   ("obsess","OBSESS.",0.85,0.7,1.15,'obsess',None),
   ("code3","Step five.",0.95,0.25,1.05,'s5',None),
   ("code3","That word is your last code.",1.0,0.3,1.0,None,None),
   ("code3","Go to the forest near Big Pine, and look for a small hatch in the ground.",1.0,0.3,1.0,'forest',None),
   ("code3","The keypad is on a tree.",1.0,0.35,1.0,'tree',None),
   ("code3","Now type OBSESS the way a calculator shows letters:",1.0,0.3,1.0,'morph',None),
   ("code3","O is zero. B is eight. S is five. E is three.",0.95,0.35,1.0,'legend',None),
   ("code3","So:",1.0,0.2,1.0,None,None)]+code("code3","c3","085355")+[
   ("payoff","Step six.",0.95,0.25,1.05,'s6',None),
   ("payoff","Climb down, and bring a flashlight, because it's dark.",1.0,0.3,1.0,'flash',None),
   ("payoff","Turn the power on, crawl through the small gap into the control room…",1.0,0.3,1.0,'crawl',None),
   ("payoff","and press the big red button…",0.98,0.7,1.0,'button',None),
   ("payoff","The hangar opens,",0.92,0.3,1.1,'open',None),
   ("payoff","and the tank is yours, along with a Cold War rifle.",1.0,0.5,1.0,'yours',None),
   ("end","One last thing:",0.98,0.25,1.0,None,None),
   ("end","you can't register the tank as your own car.",1.0,0.3,1.0,'noreg',None),
   ("end","But if you lose it, just come back…",1.0,0.3,1.0,None,None),
   ("end","and the bunker gives you another one.",0.97,0.4,1.0,'forever',None)]
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
