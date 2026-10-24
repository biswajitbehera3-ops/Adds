import re, sys
src = open(sys.argv[1]).read()
style = re.search(r'<style>(.*?)</style>', src, re.S).group(1)
svg = re.search(r'(<svg width="0" height="0".*?</svg>)', src, re.S).group(1)
home = re.search(r'(<div class="phone">.*?<div class="homebar"></div>\s*</div></div>)', src, re.S).group(1)

status = re.search(r'(<div class="status">.*?</div>)', home, re.S).group(1)
glows = '<div class="glow g1"></div><div class="glow g2"></div><div class="glow g3"></div><div class="glow g4"></div><div class="glow g5"></div><div class="glow g6"></div><div class="lines"></div><div class="grain"></div>'

def dock(active, label, icon):
    tabs = {
      'home': '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
      'live': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M5 12a7 7 0 0 1 14 0M2 12a10 10 0 0 1 20 0"/></svg>',
      'earn': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
      'staff': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/></svg>',
      'cust': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    }
    out = []
    for k in ['live','earn','staff','cust']:
        if k == active:
            out.append(f'<div class="tab on">{tabs[k]}{label}</div>')
        else:
            out.append(f'<div class="tab">{tabs[k]}</div>')
    return '<div class="dock glass bright">' + ''.join(out) + '</div><div class="homebar"></div>'

bars = [("Thu",4200),("Fri",5600),("Sat",9100),("Sun",10400),("Mon",3900),("Tue",0),("Wed",6800)]
mx = 10400
barhtml = ''.join(
  f'<div class="bcol"><div class="bar{" on" if d=="Wed" else ""}{" off" if v==0 else ""}" style="height:{max(6, int(v/mx*118))}px"></div><span>{d}</span></div>'
  for d,v in bars)

earn = f'''<div class="phone side"><div class="screen">{glows}
<div class="content">{status}
<div class="scroll">
  <div class="top"><div class="logo"><img src="LOGO" alt=""></div><div class="top-right"><div class="round glass"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/></svg></div><div class="avatar">SB</div></div></div>
  <div class="hello" style="font-size:24px">Earnings, <b>this week</b></div>
  <div class="date">Owner · Thu 15 – Wed 21 Oct</div>
  <div class="seg glass"><span class="s on">Today</span><span class="s">7 days</span><span class="s">Month</span></div>
  <div class="big glass bright">
    <div class="label2">Today so far</div>
    <div class="bignum">₹6,800 <em>+12% vs last Wed</em></div>
    <div class="bars">{barhtml}</div>
  </div>
  <div class="sec"><h3>Stylists today</h3><a href="#">All</a></div>
  <div class="list glass">
    <div class="li"><div class="av a1">IK</div><div class="t"><b>Imran Khan</b><span>4 customers · Chair 1</span></div><div class="amt">₹1,350</div></div>
    <div class="li"><div class="av a2">SU</div><div class="t"><b>Sunita</b><span>3 customers · Chair 2</span></div><div class="amt">₹2,900</div></div>
    <div class="li"><div class="av a3">RA</div><div class="t"><b>Rakesh</b><span>2 customers · Chair 3</span></div><div class="amt">₹2,550</div></div>
  </div>
</div></div>
{dock('earn','Earnings','')}
</div></div>'''

bill = f'''<div class="phone side"><div class="screen">{glows}
<div class="content">{status}
<div class="scroll">
  <div class="top"><div class="round glass"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></div><div style="color:#FFF7F0;font-weight:800;font-size:18px">Collect</div><div class="round glass"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></div></div>
  <div class="cust glass">
    <div class="av big a2">AR</div>
    <div class="t"><b>Aditya Rao</b><span>Returning · ••••• •5028</span></div>
    <div class="wal"><small>Wallet</small><b>₹4,850</b></div>
  </div>
  <div class="receipt glass bright">
    <div class="rl"><span>Hair colour</span><b>₹1,200</b></div>
    <div class="rl"><span>Keratin touch-up <i class="ok">owner approved</i></span><b>₹800</b></div>
    <div class="dash"></div>
    <div class="rl tot"><span>Total</span><b>₹2,000</b></div>
  </div>
  <div class="opt glass">
    <div class="t"><b>Pay from wallet</b><span>₹2,000 of ₹4,850</span></div>
    <div class="switch"><i></i></div>
  </div>
  <div class="opt glass">
    <div class="t"><b>Number confirmed</b><span>WhatsApp code · ••••• •5028</span></div>
    <div class="tick">✓</div>
  </div>
  <div class="collect">Collect ₹2,000</div>
  <div class="left">Customer left without a service</div>
</div></div>
</div></div>'''

extra_css = '''
  body { padding: 0; display: block; min-height: 0; background: #3a2822; }
  .scene { position: relative; width: 1920px; height: 1080px; overflow: hidden;
    background:
      radial-gradient(45% 55% at 50% 42%, rgba(255,214,186,.38) 0%, rgba(255,214,186,0) 70%),
      radial-gradient(35% 45% at 12% 85%, rgba(200,130,95,.45) 0%, rgba(200,130,95,0) 70%),
      radial-gradient(35% 45% at 90% 15%, rgba(230,170,125,.40) 0%, rgba(230,170,125,0) 70%),
      linear-gradient(150deg, #8C6B5C 0%, #5E4338 45%, #2F201B 100%); }
  .orb { position: absolute; border-radius: 50%; filter: blur(70px); }
  .o1 { width: 520px; height: 520px; left: 640px; top: 160px; background: rgba(255, 200, 160, .35); }
  .o2 { width: 380px; height: 380px; left: 80px; top: 600px; background: rgba(214, 140, 96, .45); }
  .o3 { width: 420px; height: 420px; right: 60px; top: -80px; background: rgba(240, 186, 140, .4); }
  .sgrain { position: absolute; inset: 0; opacity: .10; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
  .slot { position: absolute; top: 50%; }
  .slot.c { left: 50%; transform: translate(-50%, -50%) scale(1.08); z-index: 3; }
  .slot.l { left: 340px; transform: translate(-50%, -46%) scale(.9) rotate(-4deg); z-index: 2; filter: saturate(.95); }
  .slot.r { left: 1580px; transform: translate(-50%, -46%) scale(.9) rotate(4deg); z-index: 2; filter: saturate(.95); }
  .phone.side .screen { background: linear-gradient(175deg, #9C7867 0%, #7D5A4C 34%, #5E4136 70%, #3F2A23 100%); }

  .seg { margin-top: 16px; display: flex; gap: 4px; padding: 5px; border-radius: 22px; }
  .seg .s { flex: 1; height: 36px; border-radius: 18px; display: grid; place-items: center; color: var(--cream); font-weight: 700; font-size: 13px; position: relative; z-index: 3; }
  .seg .s.on { background: var(--ink); }
  .big { margin-top: 14px; border-radius: 28px; padding: 16px; text-align: left; color: var(--ink); }
  .label2 { font-size: 13px; font-weight: 700; color: var(--ink-2); }
  .bignum { margin-top: 4px; font-size: 32px; font-weight: 800; letter-spacing: -.6px; }
  .bignum em { font-style: normal; font-size: 12px; font-weight: 700; color: #2F7A4E; margin-left: 6px; letter-spacing: 0; }
  .bars { margin-top: 14px; display: flex; align-items: flex-end; justify-content: space-between; height: 140px; }
  .bcol { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 34px; }
  .bcol span { font-size: 11px; font-weight: 700; color: var(--ink-2); }
  .bar { width: 30px; border-radius: 12px; background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.55)); box-shadow: inset 0 1px 0 #fff, 0 4px 10px rgba(28,14,8,.12); }
  .bar.on { background: linear-gradient(180deg, #3A2A20, #24170F); }
  .bar.off { background: rgba(36,23,15,.12); box-shadow: none; }
  .list { border-radius: 26px; padding: 6px 14px; text-align: left; color: var(--cream); }
  .li { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.12); position: relative; z-index: 3; }
  .li:last-child { border-bottom: 0; }
  .li .t { flex: 1; } .li .t b { display: block; font-size: 14px; } .li .t span { font-size: 12px; color: var(--cream-2); font-weight: 600; }
  .li .amt { font-weight: 800; font-size: 15px; }
  .av { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 13px; color: var(--cream); box-shadow: 0 0 0 2px rgba(255,255,255,.6); }
  .av.big { width: 52px; height: 52px; font-size: 16px; }
  .a1 { background: radial-gradient(circle at 30% 25%, #E9B48C, #9C6040 70%); }
  .a2 { background: radial-gradient(circle at 30% 25%, #D9A9A0, #8A5048 70%); }
  .a3 { background: radial-gradient(circle at 30% 25%, #CDB08E, #7C5E3E 70%); }
  .cust { margin-top: 20px; border-radius: 26px; padding: 14px; display: flex; align-items: center; gap: 12px; text-align: left; color: var(--cream); }
  .cust > * { position: relative; z-index: 3; }
  .cust .t { flex: 1; } .cust .t b { display: block; font-size: 17px; } .cust .t span { font-size: 12px; color: var(--cream-2); font-weight: 600; }
  .wal { text-align: right; } .wal small { display: block; font-size: 11px; color: var(--cream-2); font-weight: 700; } .wal b { font-size: 17px; }
  .receipt { margin-top: 12px; border-radius: 26px; padding: 16px; color: var(--ink); text-align: left; }
  .rl { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; font-size: 14px; font-weight: 600; position: relative; z-index: 3; }
  .rl b { font-weight: 800; }
  .ok { font-style: normal; font-size: 10px; font-weight: 800; color: #2F7A4E; background: rgba(47,122,78,.12); padding: 3px 7px; border-radius: 8px; margin-left: 4px; }
  .dash { border-top: 1.5px dashed rgba(36,23,15,.25); margin: 6px 0; }
  .rl.tot { font-size: 18px; } .rl.tot b { font-size: 22px; }
  .opt { margin-top: 10px; border-radius: 22px; padding: 12px 14px; display: flex; align-items: center; text-align: left; color: var(--cream); }
  .opt > * { position: relative; z-index: 3; }
  .opt .t { flex: 1; } .opt .t b { display: block; font-size: 14px; } .opt .t span { font-size: 12px; color: var(--cream-2); font-weight: 600; }
  .switch { width: 52px; height: 30px; border-radius: 15px; background: var(--ink); position: relative; } .switch i { position: absolute; right: 3px; top: 3px; width: 24px; height: 24px; border-radius: 50%; background: radial-gradient(circle at 30% 25%, #F2C29C, #C27F51 75%); }
  .tick { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: #7FD8A2; color: #0f3a22; font-weight: 900; }
  .collect { margin-top: 16px; height: 58px; border-radius: 29px; background: var(--ink); color: var(--cream); display: grid; place-items: center; font-weight: 800; font-size: 17px; box-shadow: 0 12px 26px rgba(28,14,8,.4); }
  .left { margin-top: 14px; text-align: center; color: var(--cream-2); font-size: 13px; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }

  .float { position: absolute; z-index: 4; border-radius: 24px; padding: 14px 18px; display: flex; align-items: center; gap: 12px; color: var(--cream); font-weight: 700; }
  .float > * { position: relative; z-index: 3; }
  .float .ic { width: 40px; height: 40px; border-radius: 14px; display: grid; place-items: center; color: var(--ink); background: linear-gradient(150deg, rgba(255,255,255,.95), rgba(255,255,255,.7)); font-weight: 900; }
  .float b { display: block; font-size: 15px; } .float span { font-size: 12px; color: var(--cream-2); font-weight: 600; }
  .f1 { left: 430px; top: 70px; transform: rotate(-3deg); }
  .f2 { left: 1180px; top: 860px; transform: rotate(2deg); }
  .f3 { left: 1230px; top: 150px; transform: rotate(3deg); padding: 10px 16px; }
'''

floats = '''
<div class="float glass f1"><div class="ic">₹</div><div><b>Imran collected ₹450</b><span>Karan Mehta · Chair 1 · just now</span></div></div>
<div class="float glass f2"><div class="ic">✓</div><div><b>Cash matches the drawer</b><span>₹2,400 counted · 8:52 PM</span></div></div>
<div class="float glass f3"><span style="width:8px;height:8px;border-radius:50%;background:#7FD8A2;box-shadow:0 0 10px #7FD8A2;display:inline-block"></span><b style="font-size:13px">LIVE · 3 chairs busy</b></div>
'''

html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Salon app · liquid glass</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap">
<style>{style}{extra_css}</style></head><body>
{svg}
<div class="scene"><div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div><div class="sgrain"></div>
<div class="slot l">{earn}</div>
<div class="slot c">{home}</div>
<div class="slot r">{bill}</div>
{floats}
</div></body></html>'''
html = html.replace('LOGO', '../../assets/brand/logo-clean.png')
open(sys.argv[2], 'w').write(html)
