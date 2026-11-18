import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
d="/tmp/claude-0/-home-user-Adds/2286a8c0-ed81-596f-88c3-0b00ce15c5a6/scratchpad/kokoro"
k=Kokoro(d+"/model.onnx", d+"/voices.npz")
V=sys.argv[1]
# (beat, text, speed, pause_after) — phrase-level performance: fast + punchy on hype, slower on reveals, real pauses
P=[
 ("hook","You're playing GTA 6 tonight!",1.12,0.18),
 ("hook","But before you do...",1.0,0.35),
 ("hook","you'll want to hear what the critics said.",1.05,0.45),
 ("score","Ninety nine. On Metacritic.",0.92,0.35),
 ("score","And a perfect ten... from IGN!",1.0,0.5),
 ("looks","And honestly? You can see why.",1.0,0.3),
 ("looks","The water.",0.9,0.2),("looks","The storms.",0.9,0.2),("looks","Even the hair...",0.9,0.15),("looks","looks real.",0.95,0.4),
 ("quote1","One fan literally typed...",1.05,0.25),("quote1","Is this real life?!",1.0,0.6),
 ("turn","But here's the thing.",1.0,0.25),("turn","The best surprises are in the small stuff.",1.0,0.5),
 ("book","Pick up a book...",1.0,0.2),("book","and you can actually open it, and read the pages!",1.08,0.3),("book","It's one of twenty-seven to collect.",1.0,0.5),
 ("steal","Steal something?",1.05,0.25),("steal","The cash doesn't hit your pocket.",1.0,0.3),("steal","You drop the goods at a lockup...",1.0,0.2),("steal","and you get paid later.",0.95,0.5),
 ("gps","Get in a car...",1.0,0.2),("gps","and the GPS talks you through every single turn.",1.05,0.55),
 ("fp","Now, the one thing that's missing?",1.0,0.35),("fp","A full first-person mode.",0.92,0.3),("fp","At launch, you only go first person when you aim.",1.05,0.5),
 ("fps","And the critics' only real complaint?",1.0,0.3),("fps","Thirty frames per second.",0.9,0.45),
 ("quote2","One fan summed it up perfectly...",1.05,0.25),("quote2","Bad F P S... but looks good though!",1.0,0.6),
 ("close","See you at midnight!",1.05,0.3),("close","Which one are you checking first?",1.0,0.4),
]
SR=24000; out=[np.zeros(int(0.12*SR),np.float32)]; t=0.12; marks={}
for b,txt,sp,gap in P:
    s,sr=k.create(txt, voice=V, speed=sp, lang="en-us" if V.startswith("a") else "en-gb")
    s=s.astype(np.float32); st=t; t+=len(s)/SR+gap
    m=marks.setdefault(b,{"beat":b,"start":round(st,2),"text":""}); m["end"]=round(t-gap,2); m["text"]+=txt+" "
    out+=[s,np.zeros(int(gap*SR),np.float32)]
a=np.concatenate(out); a=a/np.abs(a).max()*0.89
sf.write(f"perf_{V}.wav",a,SR); json.dump(list(marks.values()),open(f"perf_{V}.json","w"),indent=1)
print(V, round(len(a)/SR,1))
