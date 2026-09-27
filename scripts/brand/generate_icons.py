import json
import os
import re
import shutil
import subprocess
import tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BRAND = os.path.join(ROOT, "assets", "brand")
IMAGES = os.path.join(ROOT, "assets", "images")
ICONS = os.path.join(IMAGES, "app-icons")

DEFAULT = "graphite"
ICON_SCALE = 0.84
ADAPTIVE_SCALE = 0.6


def load_geometry():
    with open(os.path.join(BRAND, "logo.svg")) as handle:
        paths = re.findall(r'<path d="([^"]+)"', handle.read())
    bar, body, arc = paths
    return bar, body, arc


BAR, BODY, ARC = load_geometry()

with open(os.path.join(BRAND, "app-icon-palettes.json")) as handle:
    PALETTES = json.load(handle)


def asset_folder(name):
    return re.sub(r"[A-Z]", lambda match: f"-{match.group(0).lower()}", name)


def glyph(paint):
    return (
        f'<path d="{BAR}" fill="{paint}"/><path d="{BODY}" fill="{paint}"/>'
        f'<path d="{ARC}" stroke="{paint}" stroke-width="60" stroke-linecap="round" fill="none"/>'
    )


def svg(background, gradient, scale, palette, shadow=None, gloss=0.42, show_glyph=True):
    layers = ['<rect width="828" height="828" fill="url(#bg)"/>'] if background else []
    body = f'<g filter="url(#shadow)">{glyph("url(#g)")}</g>' if shadow else glyph("url(#g)")
    if gloss:
        body += glyph("url(#gloss)")
    if not show_glyph:
        body = ""
    shadow_filter = (
        f'<filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">'
        f'<feDropShadow dx="0" dy="14" stdDeviation="22" flood-color="{shadow}"/></filter>'
        if shadow
        else ""
    )
    bg = palette["background"]
    return f"""<svg width="1024" height="1024" viewBox="0 0 828 828" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="828" gradientUnits="userSpaceOnUse"><stop stop-color="{bg['from']}"/><stop offset="1" stop-color="{bg['to']}"/></linearGradient>
<linearGradient id="g" x1="116" y1="116" x2="712" y2="712" gradientUnits="userSpaceOnUse"><stop stop-color="{gradient['from']}"/><stop offset="1" stop-color="{gradient['to']}"/></linearGradient>
<linearGradient id="gloss" x1="0" y1="116" x2="0" y2="712" gradientUnits="userSpaceOnUse"><stop stop-color="#FFFFFF" stop-opacity="{gloss}"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
{shadow_filter}
</defs>
{''.join(layers)}
<g transform="translate(414 414) scale({scale}) translate(-414 -414)">{body}</g>
</svg>"""


def render(markup, out, size=1024, opaque=False):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as handle:
        handle.write(markup)
    subprocess.run(["rsvg-convert", "-w", str(size), "-h", str(size), handle.name, "-o", out], check=True)
    os.unlink(handle.name)
    if opaque:
        subprocess.run(["magick", out, "-alpha", "off", out], check=True)


def rounded(src, out, size):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        mask = os.path.join(tmp, "mask.png")
        radius = round(1024 * 0.2237)
        subprocess.run(
            ["magick", "-size", "1024x1024", "xc:none", "-fill", "white", "-draw",
             f"roundrectangle 0,0 1023,1023 {radius},{radius}", mask],
            check=True,
        )
        subprocess.run(
            ["magick", src, "(", mask, "-alpha", "extract", ")", "-alpha", "off", "-compose", "CopyOpacity",
             "-composite", "-resize", f"{size}x{size}", out],
            check=True,
        )


def main():
    for name, palette in PALETTES.items():
        folder = os.path.join(ICONS, asset_folder(name))
        tinted = {"from": "#FFFFFF", "to": "#A3A3A3"}
        render(svg(True, palette["glyph"], ICON_SCALE, palette, palette["shadow"]),
               os.path.join(folder, "ios-light.png"), opaque=True)
        render(svg(False, palette["glyphDark"], ICON_SCALE, palette, gloss=0.25), os.path.join(folder, "ios-dark.png"))
        render(svg(False, tinted, ICON_SCALE, palette, gloss=0), os.path.join(folder, "ios-tinted.png"))
        render(svg(True, palette["glyph"], ADAPTIVE_SCALE, palette, palette["shadow"]),
               os.path.join(folder, "android-foreground.png"), opaque=True)
        rounded(os.path.join(folder, "ios-light.png"), os.path.join(ICONS, "thumbnails", f"{asset_folder(name)}.png"), 180)

    palette = PALETTES[DEFAULT]
    default = os.path.join(ICONS, DEFAULT)
    shutil.copy(os.path.join(default, "ios-light.png"), os.path.join(IMAGES, "icon.png"))
    shutil.copy(os.path.join(default, "ios-dark.png"), os.path.join(IMAGES, "icon-dark.png"))
    shutil.copy(os.path.join(default, "ios-tinted.png"), os.path.join(IMAGES, "icon-tinted.png"))
    render(svg(False, palette["glyph"], ADAPTIVE_SCALE, palette, palette["shadow"]),
           os.path.join(IMAGES, "android-icon-foreground.png"))
    render(svg(True, palette["glyph"], 1, palette, show_glyph=False),
           os.path.join(IMAGES, "android-icon-background.png"), opaque=True)
    render(svg(False, {"from": "#FFFFFF", "to": "#FFFFFF"}, ADAPTIVE_SCALE, palette, gloss=0),
           os.path.join(IMAGES, "android-icon-monochrome.png"))
    rounded(os.path.join(default, "ios-light.png"), os.path.join(ROOT, "docs", "assets", "logo.png"), 256)
    shutil.rmtree(default)


if __name__ == "__main__":
    main()
