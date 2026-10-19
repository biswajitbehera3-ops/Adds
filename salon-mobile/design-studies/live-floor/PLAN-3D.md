# Live floor in 3D (three.js): build plan

Status: **waiting for the user's confirmation. Nothing is built yet.**
Request (19 Oct): rebuild the owner's Live dashboard with three.js, salon looking like the Higgsfield
render (Image 2), with a lady at the reception desk, the waiting area opposite the reception counter,
and people who walk like real humans.

## 1. What changes from the current page
| | Now (`final-live-floor.html`) | 3D version |
|---|---|---|
| Salon | One flat AI picture | Real 3D room built in three.js, same look: cream plaster walls, brass trim, 3 arched mirrors with glowing halos, marble counters, cognac leather chairs on brass bases, herringbone oak floor, brass pendant lamps, plants, brass screens, wash basin |
| People | 2-frame cut-outs sliding along a path | Rigged 3D people playing **motion-captured** walk and idle animations; feet planted, hips and arms moving naturally |
| Camera | Fixed picture | Same isometric angle as Image 2; tap a chair to glide in, tap again to return; gentle drag to look around |
| Labels | Placed on the picture | Pinned to the 3D chairs, so they stay in place as the camera moves |

The bottom half of the screen (Today total, chair cards, waiting list, bottom bar) stays as approved.

## 2. New floor plan
```
                 back wall: art, shelf, wash basin in the corner
      ┌───────────────────────────────────────────────┐
      │ wash basin          brass screen               │
 left │                                                 │ right wall:
 wall │                        [chair 1] [chair 2] [chair 3]   arched mirrors
      │  RECEPTION DESK                                 │ + marble counters
 DOOR ▯  (lady seated behind it, facing the walkway)   │
      │        ← walkway from the door →                │
      │  WAITING AREA facing the desk:                  │
      │  sofa + armchair + side table + plant           │
      └───────────────────────────────────────────────┘
                 front edge (cut away, camera side)
```
- **Reception**: fluted marble desk with brass top, bell, tablet, pampas vase. **Receptionist (woman)** sits behind it on a stool; she types, looks up and nods when someone checks in.
- **Waiting area**: directly opposite the desk across the walkway, facing it. The front railing planter from Image 2 is removed to make room.
- Stations and wash basin stay where they are in Image 2.

## 3. People
| Who | Model | Motion |
|---|---|---|
| Receptionist (woman) | Female model | Seated; typing, head turns to customers |
| 3 stylists | Male + female models, black aprons | Standing idle (mocap) + working arm motion (scissors / dryer / trimmer) |
| Seated customers (Karan, Priya) | Male + female, cream capes | Seated pose, small head movements |
| Walkers (Dev, Neha, Rahul) | Male + female | Mocap walk; speed matched to stride so feet don't slide; smooth turns; ease in and out of stops; sit-down and stand-up transitions at chair 3 and the sofa |
| Waiting (2) | Male + female | Seated on the sofa; phone / magazine idle |

Variety comes from clothing colours, hair shapes (bun, long hair, short) and skin tones. Faces are small at this distance.

**Loop (about 30 s):** Dev walks in → stops at the desk, the receptionist looks up ("Dev Arora checked in · booked 11:40") → walks to chair 3, turns, sits → beard trim with Rakesh, ring counts down → stands, walks back to the desk, pays ("₹300 PAID", total ₹6,800 → ₹7,100) → walks out. Neha comes in for a wallet top-up (not counted as earnings). Rahul walks in, checks in, **sits on the waiting sofa** (a real sit-down this time).

## 4. Technology
- **three.js** (installed from npm), bundled with esbuild into **one self-contained HTML file** with the 3D models inside, so it works offline and can be published as a link.
- Lighting: warm key light + soft shadows, a reflective environment for the brass and marble, a gentle glow on the mirror halos and pendants, filmic colour.
- Textures (marble, plaster, oak herringbone): drawn in code at no cost. **Optional:** Higgsfield-made tileable textures for more realism, quoted separately before spending.
- Phone performance target: smooth on a mid-range Android; graphics quality lowered automatically on weak phones; reduced-motion setting respected.
- **In the real app:** the same 3D scene runs inside the owner's Live tab (an embedded web view fed with live data from the app). `three` gets added to `salon-mobile/package.json` when the app is built.

## 5. Character models and licences (important)
- Source: the sample characters shipped with the three.js project (a Ready Player Me man, Mixamo's "Michelle" woman, and Mixamo's motion-captured walk/idle animations). They are the only rigged human models this environment can download.
- **Fine for this design prototype.** Before shipping to salons, licences must be confirmed (Mixamo: royalty-free; Ready Player Me sample avatar: to check) and recorded in `legal/third-party-licenses.json`; otherwise swap in a free CC0 pack (e.g. Quaternius) or purchased characters. The scene is built so models can be swapped without redoing the salon.

## 6. Honest limits
- A real-time 3D scene on a phone won't have every detail of an offline AI render (fewer leaves on plants, simpler fabric). It will match the layout, colours, materials and lighting of Image 2 closely and will be fully animated.
- Faces are the sample characters' faces; outfits and hair are changed per person.

## 7. Steps once confirmed
1. Install three.js and the build tools; set up `design-studies/live-floor-3d/`.
2. Build the room and furniture; screenshot against Image 2 and adjust.
3. Load and dress the characters; retarget the mocap walk/idle; author seated, working and typing poses.
4. Paths, timeline and the story loop; check that feet don't slide.
5. Connect the dashboard UI (labels, cards, tap-to-focus).
6. Check on phone size; publish; record in BUILD-SPEC 6.2; commit.
