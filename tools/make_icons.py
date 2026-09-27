"""Generate Clean Label Checker icons (leaf + check motif) with Pillow."""
from PIL import Image, ImageDraw
import os
OUT = os.path.join(os.path.dirname(__file__), "..", "icons")
def icon(size):
    S = 512  # draw large then downsample for anti-aliasing
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([16, 16, S - 16, S - 16], radius=110, fill=(46, 125, 50, 255))
    # leaf: intersection of two circles (lens shape), tilted by drawing as polygon approximation
    import math
    cx, cy, r = S / 2, S / 2, 190
    pts = []
    a, h = 200, 120  # half-length and half-width of a pointed leaf
    for i in range(-100, 101, 2):
        x = a * i / 100
        pts.append((cx + x, cy - h * (1 - (x / a) ** 2) ** 0.8))
    for i in range(100, -101, -2):
        x = a * i / 100
        pts.append((cx + x, cy + h * (1 - (x / a) ** 2) ** 0.8))
    # rotate -40 degrees
    t = math.radians(-40)
    rot = [(cx + (x - cx) * math.cos(t) - (y - cy) * math.sin(t), cy + (x - cx) * math.sin(t) + (y - cy) * math.cos(t)) for x, y in pts]
    d.polygon(rot, fill=(232, 245, 214, 255))
    # check mark
    w = 46 if size >= 32 else 60
    d.line([(165, 262), (232, 330), (355, 192)], fill=(46, 125, 50, 255), width=w, joint="curve")
    for p in [(165, 262), (355, 192)]:
        d.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=(46, 125, 50, 255))
    return im.resize((size, size), Image.LANCZOS)
os.makedirs(OUT, exist_ok=True)
for s in (16, 32, 48, 128):
    icon(s).save(os.path.join(OUT, f"icon-{s}.png"))
    print("icon", s)
