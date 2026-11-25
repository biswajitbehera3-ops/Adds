# New female host: an ORIGINAL character (no real person's face used as input; text-only, no IP-Adapter).
# Style brief from the user's mood photos: long wavy chestnut hair, warm look, polished; tall slim confident stance.
# Model: DreamShaper XL (SDXL fine-tune, good at realistic 3D-animation renders); falls back to SDXL base.
import subprocess, time
t0 = time.time()
subprocess.run("pip install -q -U diffusers transformers accelerate", shell=True, timeout=900)
import torch
from diffusers import StableDiffusionXLPipeline, AutoencoderKL
from PIL import Image, ImageDraw
vae = AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
try:
    pipe = StableDiffusionXLPipeline.from_pretrained("Lykon/dreamshaper-xl-1-0", vae=vae, torch_dtype=torch.float16, variant="fp16")
    MODEL = "dreamshaper-xl"
except Exception as e:
    print("fallback to SDXL base:", e)
    pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", vae=vae, torch_dtype=torch.float16,
                                                     variant="fp16", use_safetensors=True)
    MODEL = "sdxl-base"
pipe = pipe.to("cuda")
# Each prompt must stay under CLIP's 77-token limit (v1 lost the outfits to truncation). Style + outfit come first.
STYLE = "3d animated movie character, pixar disney style render, stylized realistic, soft studio light, plain light grey background"
FACE = "young Indian woman, warm brown skin, big brown eyes, soft smile, long wavy chestnut hair"
NEG = ("photo, photograph, real person, photorealistic skin pores, 2d, anime, sketch, deformed, extra fingers, bad hands, "
       "multiple people, text, watermark, nsfw, cleavage, cropped head, cropped feet, close-up")
SHOTS = {
    "full_cargo": (f"{STYLE}, full body shot head to toe, {FACE}, black sleeveless collared shirt, khaki cargo trousers, white heels, "
                   "hands in pockets, standing", 832, 1216),
    "full_blazer": (f"{STYLE}, full body shot head to toe, {FACE}, beige oversized blazer, white top, light blue wide jeans, "
                    "white sneakers, standing", 832, 1216),
    "portrait": (f"{STYLE}, head and shoulders portrait, {FACE}, beige blazer, white top, thin gold necklace", 896, 1152),
}
tiles = []
for name, (p, w, h) in SHOTS.items():
    for seed in [101, 102, 103, 104]:
        img = pipe(prompt=p, negative_prompt=NEG, width=w, height=h, num_inference_steps=36, guidance_scale=6.5,
                   generator=torch.Generator("cuda").manual_seed(seed)).images[0]
        img.save(f"/kaggle/working/host_{name}_seed{seed}.png")
        tiles.append((f"{name} seed {seed}", img)); print(len(tiles), f"{time.time()-t0:.0f}s", flush=True)
tw, th = 320, 460
sheet = Image.new("RGB", (tw * 4, (th + 28) * 3), "white"); d = ImageDraw.Draw(sheet)
for i, (lab, img) in enumerate(tiles):
    x, y = (i % 4) * tw, (i // 4) * (th + 28)
    sheet.paste(img.resize((tw, th)), (x, y + 28)); d.text((x + 4, y + 6), lab, fill="black")
sheet.save("/kaggle/working/host_woman_all.jpg", quality=90)
print("done", MODEL, f"{time.time()-t0:.0f}s")
