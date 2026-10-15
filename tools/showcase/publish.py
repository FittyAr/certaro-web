"""Turn the raw captures into the site assets: WebP slides, thumbnails and the social card.

    python publish.py RAW_DIR SITE_ROOT

It also refreshes the release data (js/releases.js and the version shown by the site) from
../Certaro/CHANGELOG.md through tools/changelog/sync.py, so a publish never leaves the site on an
old version.
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SLIDES = {
    "panel": "01-panel",
    "movimientos": "02-movimientos",
    "kanban": "03-kanban",
    "palette": "04-palette",
    "panel-light": "05-panel-claro",
}
BOLD = r"C:\Windows\Fonts\consolab.ttf"
REGULAR = r"C:\Windows\Fonts\consola.ttf"


def gradient(size: int) -> Image.Image:
    a, b = (0xFF, 0xB8, 0x6C), (0x22, 0xD3, 0xEE)
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            px[x, y] = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
    return img


def mark(size: int) -> Image.Image:
    """The brand mark (gradient rounded square with a C), as in assets/certaro-logo.svg."""
    s = size * 4
    mask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 24 / 128), fill=255)
    out = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    out.paste(gradient(s), (0, 0), mask)
    ImageDraw.Draw(out).text((s / 2, s * 0.54), "C", font=ImageFont.truetype(BOLD, int(s * 0.62)), fill=(10, 10, 13), anchor="mm")
    return out.resize((size, size), Image.LANCZOS)


def social(panel: Image.Image) -> Image.Image:
    w, h = 1200, 630
    glow = Image.new("RGB", (w, h), (10, 10, 13))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-250, -320, 600, 260], fill=(60, 42, 22))
    gd.ellipse([700, 380, 1400, 900], fill=(10, 45, 52))
    bg = glow.filter(ImageFilter.GaussianBlur(120))
    d = ImageDraw.Draw(bg)
    icon = mark(88)
    bg.paste(icon, (56, 56), icon)
    d.text((164, 100), "certaro", font=ImageFont.truetype(BOLD, 40), fill=(245, 245, 247), anchor="lm")
    d.text((56, 230), "Tu operación,", font=ImageFont.truetype(BOLD, 68), fill=(245, 245, 247))
    d.text((56, 310), "bajo control.", font=ImageFont.truetype(BOLD, 68), fill=(255, 184, 108))
    f = ImageFont.truetype(REGULAR, 23)
    for i, line in enumerate(["ERP modular: obras, finanzas,", "compras, inventario, ventas,", "personal y fiscalidad."]):
        d.text((56, 425 + i * 34), line, font=f, fill=(155, 160, 179))
    d.text((56, 566), "certaro.fitty.ar", font=ImageFont.truetype(BOLD, 26), fill=(34, 211, 238))
    shot = panel.convert("RGB").resize((580, 363), Image.LANCZOS)
    card = Image.new("RGB", (shot.width + 4, shot.height + 4), (42, 46, 66))
    card.paste(shot, (2, 2))
    mask = Image.new("L", card.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, card.width - 1, card.height - 1], radius=14, fill=255)
    x, y = w - card.width - 48, 134
    shadow = Image.new("RGBA", (card.width + 120, card.height + 120), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([60, 76, 60 + card.width, 76 + card.height], radius=14, fill=(0, 0, 0, 170))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    bg.paste(shadow, (x - 60, y - 60), shadow)
    bg.paste(card, (x, y), mask)
    return bg


def main(raw: Path, site: Path) -> None:
    screens = site / "assets" / "screens"
    screens.mkdir(parents=True, exist_ok=True)
    for src, dst in SLIDES.items():
        img = Image.open(raw / f"{src}.png").convert("RGB")
        assert img.size == (1600, 1000), img.size
        img.save(screens / f"{dst}.webp", "WEBP", quality=82, method=6)
        img.resize((320, 200), Image.LANCZOS).save(screens / f"{dst}-thumb.webp", "WEBP", quality=80, method=6)
    mark(256).save(site / "assets" / "icon.png")
    social(Image.open(raw / "panel.png")).save(site / "assets" / "social.png", optimize=True)
    subprocess.run([sys.executable, str(site / "tools" / "changelog" / "sync.py")], check=True)


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
