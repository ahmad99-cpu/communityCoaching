"""
Builds the Counter Picker's hero list and hero images from OpenDota (free, no key).
Run again when Valve adds a hero:  python scripts/build_hero_assets.py
Writes public/data/heroes.json and public/heroes/<slug>.webp (small, fast to load).
"""
import io, json, os, sys, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CDN = "https://cdn.cloudflare.steamstatic.com"
UA = {"User-Agent": "6slot-counter-picker"}

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()

stats = json.loads(get("https://api.opendota.com/api/heroStats"))
heroes = []
os.makedirs(os.path.join(ROOT, "public", "heroes"), exist_ok=True)
for h in sorted(stats, key=lambda x: x["localized_name"]):
    slug = h["name"].replace("npc_dota_hero_", "")
    heroes.append({
        "id": h["id"],
        "slug": slug,
        "name": h["localized_name"],
        "attr": h["primary_attr"],
        "attack": h["attack_type"],
        "roles": h["roles"],
    })
    out = os.path.join(ROOT, "public", "heroes", f"{slug}.webp")
    if os.path.exists(out):
        continue
    img = Image.open(io.BytesIO(get(CDN + h["img"].split("?")[0]))).convert("RGB")
    img = img.resize((192, 108), Image.LANCZOS)
    img.save(out, "WEBP", quality=82, method=6)
    print("image", slug)

os.makedirs(os.path.join(ROOT, "public", "data"), exist_ok=True)
with open(os.path.join(ROOT, "public", "data", "heroes.json"), "w", encoding="utf-8") as f:
    json.dump(heroes, f, separators=(",", ":"))
print(len(heroes), "heroes")
