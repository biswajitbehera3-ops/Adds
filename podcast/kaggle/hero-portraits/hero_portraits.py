# Hero face portraits for the two podcast hosts, in the studio's Pixar-like 3D look (SDXL 1.0, OpenRAIL++-M).
# SDXL reads at most 77 tokens per text encoder: the character goes in `prompt`, the look in `prompt_2`.
import subprocess, time
t0 = time.time()
subprocess.run("pip install -q -U diffusers transformers accelerate", shell=True, timeout=900)
import torch
from diffusers import StableDiffusionXLPipeline, AutoencoderKL
from PIL import Image, ImageDraw
vae = AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", vae=vae,
       torch_dtype=torch.float16, variant="fp16", use_safetensors=True).to("cuda")
LOOK = ("Pixar-style 3D animated movie character, chest-up portrait, facing camera, warm lamp light, "
        "softly blurred dark wood room background, subsurface skin, expressive stylized face, high detail")
NEG = ("text, logo, brand, emblem, watermark, signature, photo, realistic, 2d, sketch, deformed, extra fingers, "
       "multiple people, cropped head, blurry, lowres, ugly")
HOSTS = {
  "genius": ("cartoon Indian man around 30, warm brown skin, thin long narrow face, big round black glasses, "
             "large expressive dark eyes, worried raised eyebrows, messy curly black hair sticking up, "
             "pen behind ear, white shirt, maroon tie, brown suspenders, khaki jacket"),
  "questioner": ("cartoon chubby Indian man around 30, warm brown skin, big round full face, smug half smile, "
                 "relaxed half-closed eyes, thick dark eyebrows, short goatee, beige baseball cap, "
                 "red and black track jacket without logos, white t-shirt"),
}
for name, desc in HOSTS.items():
    tiles = []
    for seed in [101, 102, 103, 104, 105, 106]:
        img = pipe(prompt=desc, prompt_2=LOOK, negative_prompt=NEG, width=896, height=1152, num_inference_steps=34,
                   guidance_scale=7.0, generator=torch.Generator("cuda").manual_seed(seed)).images[0]
        img.save(f"/kaggle/working/{name}_seed{seed}.png"); tiles.append((seed, img))
        print(f"{name} seed {seed}: {time.time()-t0:.0f}s", flush=True)
    tw, th = 448, 576
    sheet = Image.new("RGB", (tw * 3, (th + 30) * 2), "white"); d = ImageDraw.Draw(sheet)
    for i, (seed, img) in enumerate(tiles):
        x, y = (i % 3) * tw, (i // 3) * (th + 30)
        d.text((x + 8, y + 8), f"{name} option {i+1} (seed {seed})", fill="black")
        sheet.paste(img.resize((tw, th)), (x, y + 30))
    sheet.save(f"/kaggle/working/{name}_portraits.jpg", quality=92)
print(f"TOTAL {time.time()-t0:.0f}s")
