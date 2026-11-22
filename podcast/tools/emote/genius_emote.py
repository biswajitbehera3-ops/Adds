"""Drive expressions on the locked Genius image with LivePortrait (no retraining, identity stays exact).

usage:
  python genius_emote.py calib  <lp_repo> <img> <out_dir>
  python genius_emote.py stills <lp_repo> <img> <out_dir>
  python genius_emote.py video  <lp_repo> <img> <out_dir> <env.json>
"""
import sys, os, json, math
import numpy as np, cv2, torch

MODE, LP, IMG, OUT = sys.argv[1:5]
sys.path.insert(0, LP); os.chdir(LP)
from src.config.inference_config import InferenceConfig
from src.config.crop_config import CropConfig
from src.live_portrait_pipeline import LivePortraitPipeline
from src.utils.camera import get_rotation_matrix
from src.utils.crop import prepare_paste_back, paste_back
from src.utils.retargeting_utils import calc_eye_close_ratio, calc_lip_close_ratio

os.makedirs(OUT, exist_ok=True)
inf = InferenceConfig(flag_force_cpu=True, flag_use_half_precision=False)
crop = CropConfig(flag_force_cpu=True, scale=2.3)
pipe = LivePortraitPipeline(inf, crop)
W = pipe.live_portrait_wrapper

img = cv2.cvtColor(cv2.imread(IMG), cv2.COLOR_BGR2RGB)
ci = pipe.cropper.crop_source_image(img, pipe.cropper.crop_cfg)
assert ci is not None, "no face detected"
I_s = W.prepare_source(ci["img_crop_256x256"])
lmk = ci["lmk_crop"]
mask = prepare_paste_back(inf.mask_crop, ci["M_c2o"], dsize=(img.shape[1], img.shape[0]))
info = W.get_kp_info(I_s)
f_s = W.extract_feature_3d(I_s)
x_s = W.transform_keypoint(info)
R_s = get_rotation_matrix(info["pitch"], info["yaw"], info["roll"])
EYE0 = float(calc_eye_close_ratio(lmk[None]).mean())
LIP0 = float(calc_lip_close_ratio(lmk[None])[0][0])
print("source eye/lip ratio", EYE0, LIP0)

KEYS = ["pitch", "yaw", "roll", "smile", "wink", "brow", "pout", "purse", "grin", "open", "gx", "gy", "eye", "z", "mx", "my"]


@torch.no_grad()
def render(p):
    g = lambda k: float(p.get(k, 0.0))
    d = info["exp"].clone()
    gx, gy = g("gx"), g("gy")
    if gx or gy:
        if gx > 0: d[0, 11, 0] += gx * 0.0007; d[0, 15, 0] += gx * 0.001
        else:      d[0, 11, 0] += gx * 0.001;  d[0, 15, 0] += gx * 0.0007
        d[0, 11, 1] += gy * -0.001; d[0, 15, 1] += gy * -0.001
        b = -gy / 2.
        d[0, 11, 1] += b * -0.001; d[0, 13, 1] += b * 0.0003; d[0, 15, 1] += b * -0.001; d[0, 16, 1] += b * 0.0003
    s = g("smile")
    if s:
        d[0, 20, 1] += s * -0.01; d[0, 14, 1] += s * -0.02; d[0, 17, 1] += s * 0.0065; d[0, 17, 2] += s * 0.003
        d[0, 13, 1] += s * -0.00275; d[0, 16, 1] += s * -0.00275; d[0, 3, 1] += s * -0.0035; d[0, 7, 1] += s * -0.0035
    w = g("wink")
    if w:
        d[0, 11, 1] += w * 0.001; d[0, 13, 1] += w * -0.0003; d[0, 17, 0] += w * 0.0003; d[0, 17, 1] += w * 0.0003; d[0, 3, 1] += w * -0.0003
    e = g("brow")
    if e > 0:
        d[0, 1, 1] += e * 0.001; d[0, 2, 1] += e * -0.001
    elif e < 0:
        d[0, 1, 0] += e * -0.001; d[0, 2, 0] += e * 0.001; d[0, 1, 1] += e * 0.0003; d[0, 2, 1] += e * -0.0003
    d[0, 19, 0] += g("pout")
    v = g("purse"); d[0, 14, 1] += v * 0.001; d[0, 3, 1] += v * -0.0005; d[0, 7, 1] += v * -0.0005; d[0, 17, 2] += v * -0.0005
    v = g("grin");  d[0, 20, 2] += v * -0.001; d[0, 20, 1] += v * -0.001; d[0, 14, 1] += v * -0.001
    v = g("open");  d[0, 19, 1] += v * 0.001; d[0, 19, 2] += v * 0.0001; d[0, 17, 1] += v * -0.0001
    d[0, 5, 0] += -g("mx"); d[0, 5, 1] += g("my")
    R_d = get_rotation_matrix(info["pitch"] + g("pitch"), info["yaw"] + g("yaw"), info["roll"] + g("roll"))
    R = (R_d @ R_s.permute(0, 2, 1)) @ R_s
    z = 1.0 + g("z")
    x_d = z * info["scale"] * (info["kp"] @ R + d) + info["t"]
    if "eye" in p:  # target eyes-open ratio (squint / wide)
        r = W.calc_combined_eye_ratio([[max(0.0, EYE0 + g("eye"))]], lmk)
        x_d = x_d + W.retarget_eye(x_s, r)
    x_d = W.stitching(x_s, x_d)
    out = W.parse_output(W.warp_decode(f_s, x_s, x_d)["out"])[0]
    return paste_back(out, ci["M_c2o"], img, mask)


def save(name, rgb):
    cv2.imwrite(f"{OUT}/{name}.jpg", cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 93])


# ---- expression presets (tuned by eye on this character) ----
E = {
    "neutral": {},
    "laugh":   {"smile": 1.5, "grin": 12, "open": 95, "eye": -0.32, "brow": 10, "pitch": -6, "roll": 4},
    "shock":   {"brow": 34, "eye": 0.22, "open": 115, "purse": 8, "pitch": -7, "z": 0.05},
    "sad":     {"brow": -30, "smile": -0.45, "purse": -12, "eye": -0.2, "gy": -16, "pitch": 9, "roll": -4},
    "cry":     {"brow": -38, "smile": -0.5, "purse": -18, "open": 35, "eye": -0.26, "gy": -12, "pitch": 11, "roll": -6},
    "think":   {"gx": 20, "gy": 24, "purse": 12, "pout": 0.06, "brow": 16, "yaw": 14, "roll": 6, "pitch": -4},
    "eureka":  {"smile": 1.5, "grin": 10, "open": 60, "brow": 34, "eye": 0.12, "pitch": -8, "z": 0.04},
    "angry":   {"brow": -40, "purse": 14, "smile": -0.4, "eye": -0.16, "pitch": 6, "grin": 6},
    "smug":    {"smile": 0.8, "wink": 20, "brow": 14, "yaw": -16, "roll": -7, "pitch": 3, "gx": -12},
    "scared":  {"brow": 28, "eye": 0.18, "smile": -0.4, "grin": 14, "open": 30, "pitch": 8, "z": -0.04},
    "talk":    {"open": 60, "smile": 0.4, "brow": 8},
    "turn_L":  {"yaw": -28}, "turn_R": {"yaw": 28}, "look_up": {"pitch": -16}, "look_down": {"pitch": 14},
}

if MODE == "calib":
    tests = [("base", {})] + [(f"{k}_{'p' if v > 0 else 'n'}", {k: v}) for k, v in [
        ("smile", 1.3), ("smile", -0.3), ("brow", 25), ("brow", -25), ("open", 100), ("purse", 12), ("purse", -15),
        ("grin", 12), ("eye", -0.2), ("eye", 0.15), ("gx", 25), ("gy", 25), ("gy", -25), ("wink", 25), ("yaw", 25), ("pitch", 12)]]
    for n, p in tests:
        save("calib_" + n, render(p)); print(n)
elif MODE == "stills":
    for n, p in E.items():
        save("exp_" + n, render(p)); print(n)
elif MODE == "video":
    envj = json.load(open(sys.argv[5])); fps = envj["fps"]; env = envj["env"]; N = len(env) + fps // 2
    # emotion timeline (frame, preset) — matches the 5 voice lines
    TL = json.loads(os.environ.get("TL", "[]")) or [[0, "laugh"], [70, "shock"], [118, "sad"], [175, "cry"], [212, "think"], [253, "eureka"], [N, "eureka"]]
    def preset_at(f):
        for (a, pa), (b, pb) in zip(TL, TL[1:]):
            if a <= f < b:
                t = min(1.0, (f - a) / 8.0); t = 0.5 - 0.5 * math.cos(math.pi * t)  # 8-frame ease into each emotion
                prev = E[TL[max(0, TL.index([a, pa]) - 1)][1]] if a > 0 else E[pa]
                return {k: (1 - t) * prev.get(k, 0) + t * E[pa].get(k, 0) for k in set(prev) | set(E[pa])}
        return dict(E[TL[-1][1]])
    vw = cv2.VideoWriter(f"{OUT}/emote_silent.mp4", cv2.VideoWriter_fourcc(*"mp4v"), fps, (img.shape[1], img.shape[0]))
    for f in range(N):
        p = preset_at(f)
        a = env[f] if f < len(env) else 0.0
        base_open = p.get("open", 0.0)
        p["open"] = base_open * 0.35 + a * 75 + (-20 if a < 0.05 else 0)  # voice drives the jaw, emotion sets the floor
        p["pitch"] = p.get("pitch", 0) + 1.2 * math.sin(f / fps * 2.1) - a * 2.0  # breathing + emphasis nods
        p["yaw"] = p.get("yaw", 0) + 1.5 * math.sin(f / fps * 1.3)
        if f % 75 in (0, 1, 2) and "eye" not in p:  # natural blink ~every 3s
            p["eye"] = -EYE0
        vw.write(cv2.cvtColor(render(p), cv2.COLOR_RGB2BGR))
        if f % 25 == 0: print("frame", f, "/", N, flush=True)
    vw.release()
