"""Génère les icônes Expo (iOS + Android) et l'écran de démarrage pour l'app CONSO."""
import os
import subprocess

OUT = os.path.join(os.path.dirname(__file__), "assets", "images")
SRC = os.path.join(os.path.dirname(__file__), "svg")
os.makedirs(OUT, exist_ok=True)
os.makedirs(SRC, exist_ok=True)

LIGHT = dict(
    bg_top="#FBBF24", bg_bot="#F97316",
    body="#FFFFFF", dark="#1E293B", tire="#1E293B", rim="#CBD5E1",
    light="#FDE68A", engine="#94A3B8", text="#1E293B", speed="#FFFFFF",
)
DARK = dict(
    bg_top="#1E293B", bg_bot="#0F172A",
    body="#F8FAFC", dark="#334155", tire="#475569", rim="#E2E8F0",
    light="#FBBF24", engine="#94A3B8", text="#FB923C", speed="#FB923C",
)
# Monochrome : blanc = visible, noir = transparent (converti ensuite)
MONO = dict(
    bg_top="#000000", bg_bot="#000000",
    body="#FFFFFF", dark="#FFFFFF", tire="#FFFFFF", rim="#000000",
    light="#000000", engine="#FFFFFF", text="#FFFFFF", speed="#FFFFFF",
    wheel_gap='stroke="#000000" stroke-width="12"',
    seat_gap='stroke="#000000" stroke-width="9"',
)


def scooter(c):
    """Scooter vu de profil, tourné vers la droite (repère local ~ 95..585 x 20..365)."""
    return f"""
  <!-- roues -->
  <circle cx="230" cy="300" r="65" fill="{c['tire']}" {c.get('wheel_gap', '')}/>
  <circle cx="230" cy="300" r="34" fill="{c['rim']}"/>
  <circle cx="230" cy="300" r="10" fill="{c['tire']}"/>
  <circle cx="520" cy="300" r="65" fill="{c['tire']}" {c.get('wheel_gap', '')}/>
  <circle cx="520" cy="300" r="34" fill="{c['rim']}"/>
  <!-- fourche (partie visible sous le garde-boue) -->
  <line x1="512" y1="215" x2="520" y2="300" stroke="{c['dark']}" stroke-width="14" stroke-linecap="round"/>
  <circle cx="520" cy="300" r="10" fill="{c['tire']}"/>
  <!-- bloc moteur -->
  <path d="M282 255 L350 255 L338 292 C330 300 300 302 290 292 Z" fill="{c['engine']}"/>
  <!-- carrosserie arrière avec passage de roue -->
  <path d="M100 205 C112 172 175 172 200 176 L345 184 C362 200 364 240 348 262
           L302 262 C292 232 262 216 230 216 C196 216 166 236 158 262 L140 262
           C114 250 96 228 100 205 Z" fill="{c['body']}"/>
  <!-- selle -->
  <path d="M150 182 C160 156 205 154 245 157 L333 164 C350 167 354 180 345 190 L158 188 Z"
        fill="{c['dark']}" {c.get('seat_gap', '')}/>
  <!-- plancher -->
  <rect x="320" y="248" width="135" height="22" rx="11" fill="{c['dark']}"/>
  <!-- tablier avant -->
  <path d="M408 270 L452 132 C460 106 480 92 506 92 L534 95 C556 99 563 118 555 140
           L532 208 C514 226 490 240 478 256 L468 270 Z" fill="{c['body']}"/>
  <!-- garde-boue avant -->
  <path d="M466 266 C484 230 556 226 580 258 L570 266 C548 242 494 244 478 270 Z"
        fill="{c['body']}"/>
  <!-- guidon et rétroviseur -->
  <path d="M506 94 L498 62 L452 52" fill="none" stroke="{c['dark']}" stroke-width="16"
        stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="494" y1="60" x2="507" y2="30" stroke="{c['dark']}" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="511" cy="24" rx="17" ry="10" fill="{c['dark']}"/>
  <!-- phare et feu arrière -->
  <ellipse cx="536" cy="122" rx="11" ry="17" fill="{c['light']}"
           transform="rotate(18 536 122)"/>
  <ellipse cx="108" cy="204" rx="9" ry="13" fill="{c['light']}"/>
"""


def artwork(c, with_speed=True):
    """Scooter + mot CONSO, dans un repère 1024x1024 (contenu ~ y 170..840)."""
    speed = ""
    if with_speed:
        speed = "".join(
            f'<line x1="{x1}" y1="{y}" x2="{x1 + w}" y2="{y}" stroke="{c["speed"]}" '
            f'stroke-width="22" stroke-linecap="round" opacity=".75"/>'
            for x1, y, w in [(85, 330, 85), (60, 400, 110), (85, 470, 85)]
        )
    return f"""
  {speed}
  <g transform="translate(70 174) scale(1.3)">{scooter(c)}</g>
  <text x="512" y="842" text-anchor="middle" font-family="Inter" font-weight="900"
        font-size="186" letter-spacing="10" fill="{c['text']}">CONSO</text>
"""


def svg(content, bg=None, scale=1.0):
    defs, background = "", ""
    if bg:
        defs = f"""<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="{bg[0]}"/><stop offset="1" stop-color="{bg[1]}"/>
</linearGradient></defs>"""
        background = '<rect width="1024" height="1024" fill="url(#g)"/>'
    # mise à l'échelle autour du centre visuel du contenu (512, 506)
    tf = f"translate(512 506) scale({scale}) translate(-512 -506)"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
{defs}{background}
<g transform="{tf}">{content}</g>
</svg>"""


def render(name, svg_text):
    p = os.path.join(SRC, name.replace(".png", ".svg"))
    with open(p, "w") as f:
        f.write(svg_text)
    out = os.path.join(OUT, name)
    subprocess.run(["rsvg-convert", "-w", "1024", "-h", "1024", p, "-o", out], check=True)
    return out


def magick(*args):
    subprocess.run(["convert", *args], check=True)


# ---------- iOS (opaque, plein cadre) ----------
icon = render("icon.png", svg(artwork(LIGHT), bg=(LIGHT["bg_top"], LIGHT["bg_bot"]), scale=0.92))
magick(icon, "-alpha", "off", icon)  # iOS refuse toute transparence
dark = render("ios-dark.png", svg(artwork(DARK), bg=(DARK["bg_top"], DARK["bg_bot"]), scale=0.92))
magick(dark, "-alpha", "off", dark)
tint_src = render("_tint_src.png", svg(artwork(MONO), bg=("#000000", "#000000"), scale=0.92))
magick(tint_src, "-alpha", "off", "-colorspace", "gray", os.path.join(OUT, "ios-tinted.png"))
os.remove(tint_src)

# ---------- Android adaptive (contenu dans la zone sûre : 66/108 du cadre) ----------
SAFE = 0.64
render("android-icon-foreground.png", svg(artwork(LIGHT), scale=SAFE))
render("android-icon-background.png",
       svg("", bg=(LIGHT["bg_top"], LIGHT["bg_bot"])))
mono_src = render("_mono_src.png", svg(artwork(MONO), scale=SAFE))
magick(mono_src, "-background", "black", "-alpha", "remove", "-colorspace", "gray",
       "-alpha", "copy", "-fill", "white", "-colorize", "100",
       os.path.join(OUT, "android-icon-monochrome.png"))
os.remove(mono_src)

# ---------- Splash (fond transparent) ----------
render("splash-icon.png", svg(artwork(LIGHT, with_speed=False), scale=0.62))
render("splash-icon-dark.png", svg(artwork(DARK, with_speed=False), scale=0.62))

# ---------- Favicon web ----------
magick(icon, "-resize", "48x48", os.path.join(OUT, "favicon.png"))

print("OK")
for f in sorted(os.listdir(OUT)):
    print(f)
