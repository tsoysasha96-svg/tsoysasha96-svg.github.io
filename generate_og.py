"""Generates a 1200x630 OG/Twitter share image per post into og/<slug>.png.
Run after adding a new entry to posts.json. Skips slugs that already have
an image; pass --force to regenerate everything (e.g. after a redesign).
"""
import json, zlib, pathlib, random, sys
from PIL import Image, ImageDraw, ImageFont

root = pathlib.Path(__file__).resolve().parent
og_dir = root / "og"
og_dir.mkdir(exist_ok=True)

W, H = 1200, 630
FORCE = "--force" in sys.argv

PALETTES = [
    ("#6366f1", "#a855f7"),
    ("#0ea5e9", "#6366f1"),
    ("#f59e0b", "#ef4444"),
    ("#10b981", "#0ea5e9"),
    ("#ec4899", "#a855f7"),
    ("#14b8a6", "#22c55e"),
    ("#f97316", "#ec4899"),
    ("#8b5cf6", "#ec4899"),
]

FONT_BOLD = "C:/Windows/Fonts/arialbd.ttf"
FONT_REG = "C:/Windows/Fonts/arial.ttf"


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def palette_for(slug):
    idx = zlib.crc32(slug.encode("utf-8")) % len(PALETTES)
    c1, c2 = PALETTES[idx]
    return hex_to_rgb(c1), hex_to_rgb(c2)


def draw_gradient(draw, c1, c2):
    for y in range(H):
        t = y / H
        draw.line([(0, y), (W, y)], fill=lerp(c1, c2, t))


def texture_overlays(slug):
    rnd = random.Random(zlib.crc32((slug + "-tex").encode("utf-8")))
    for _ in range(7):
        cx, cy = rnd.randint(0, W), rnd.randint(0, H)
        r = rnd.randint(60, 220)
        op = rnd.randint(14, 30)
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(overlay).ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, op))
        yield overlay


def wrap_text(draw, text, font, max_width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def render_card(slug, title, category, out_path, tagline=None):
    c1, c2 = palette_for(slug)
    img = Image.new("RGB", (W, H), c1)
    draw_gradient(ImageDraw.Draw(img), c1, c2)
    img = img.convert("RGBA")
    for overlay in texture_overlays(slug):
        img = Image.alpha_composite(img, overlay)

    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(scrim)
    for y in range(int(H * 0.45), H):
        t = (y - H * 0.45) / (H * 0.55)
        sdraw.line([(0, y), (W, y)], fill=(0, 0, 0, int(t * 130)))
    img = Image.alpha_composite(img, scrim)
    draw = ImageDraw.Draw(img)

    draw.text((56, 44), "КодБлог", font=ImageFont.truetype(FONT_BOLD, 34), fill=(255, 255, 255, 255))

    if category:
        cat_font = ImageFont.truetype(FONT_BOLD, 26)
        pad_x, pad_y = 18, 10
        tw = draw.textlength(category, font=cat_font)
        bx0, by0 = 56, 100
        bx1, by1 = bx0 + tw + pad_x * 2, by0 + 26 + pad_y * 2
        badge = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(badge).rounded_rectangle([bx0, by0, bx1, by1], radius=18, fill=(255, 255, 255, 46))
        img = Image.alpha_composite(img, badge)
        draw = ImageDraw.Draw(img)
        draw.text((bx0 + pad_x, by0 + pad_y - 2), category, font=cat_font, fill=(255, 255, 255, 255))

    title_font = ImageFont.truetype(FONT_BOLD, 58)
    lines = wrap_text(draw, title, title_font, W - 56 * 2)[:4]
    line_h = 70
    y = H - 70 - line_h * len(lines)
    for line in lines:
        draw.text((58, y + 2), line, font=title_font, fill=(0, 0, 0, 90))
        draw.text((56, y), line, font=title_font, fill=(255, 255, 255, 255))
        y += line_h

    if tagline:
        draw.text((56, y + 6), tagline, font=ImageFont.truetype(FONT_REG, 30), fill=(255, 255, 255, 220))

    img.convert("RGB").save(out_path, "PNG", optimize=True)


def main():
    posts = json.loads((root / "posts.json").read_text(encoding="utf-8"))
    for p in posts:
        out = og_dir / f"{p['slug']}.png"
        if out.exists() and not FORCE:
            continue
        render_card(p["slug"], p["title"], p.get("category", ""), out)
        print("generated", out.name)

    default_out = og_dir / "default.png"
    if not default_out.exists() or FORCE:
        render_card(
            "kodblog-default",
            "Заметки о программировании и технологиях",
            "",
            default_out,
            tagline="Практические статьи для разработчиков — без воды",
        )
        print("generated default.png")


if __name__ == "__main__":
    main()
