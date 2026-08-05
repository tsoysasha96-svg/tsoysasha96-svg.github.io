"""Fetches a real photo per blog post from Pexels and saves a cropped cover
image into covers/<slug>.jpg. Skips slugs that already have a cover file;
pass --force to regenerate everything. Requires pexels_key.txt (gitignored)
in this directory — same free API key as the kodblog-shorts video pipeline.
"""
import io
import json
import pathlib
import sys
import urllib.parse
import urllib.request
import zlib

from PIL import Image

root = pathlib.Path(__file__).resolve().parent
covers_dir = root / "covers"
covers_dir.mkdir(exist_ok=True)

FORCE = "--force" in sys.argv
API_URL = "https://api.pexels.com/v1/search"
API_KEY = (root / "pexels_key.txt").read_text(encoding="utf-8").strip()

OUT_W, OUT_H = 1200, 500

# English search queries per category — Pexels search works much better in English
# than Russian. Same idea as kodblog-shorts/pexels_background.py.
CATEGORY_QUERY = {
    "Языки программирования": "programming code screen",
    "Инструменты": "developer tools workspace desk",
    "Основы и концепции": "computer science technology abstract",
    "Карьера разработчика": "software developer working office",
    "AI и агенты": "artificial intelligence technology",
    "Продуктивность": "focus productivity work desk",
    "Веб-разработка": "web design website code",
    "Базы данных": "database server technology",
}
DEFAULT_QUERY = "programming technology"


def _get_json(url, headers):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _get_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": "python-requests/2.32"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def cover_crop(img, w, h):
    src_ratio = img.width / img.height
    dst_ratio = w / h
    if src_ratio > dst_ratio:
        new_h, new_w = h, round(h * src_ratio)
    else:
        new_w, new_h = w, round(w / src_ratio)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    x0, y0 = (new_w - w) // 2, (new_h - h) // 2
    return img.crop((x0, y0, x0 + w, y0 + h))


def fetch_for(slug, category):
    query = CATEGORY_QUERY.get(category, DEFAULT_QUERY)
    seed = zlib.crc32(slug.encode("utf-8"))
    headers = {"Authorization": API_KEY, "User-Agent": "python-requests/2.32"}
    params = urllib.parse.urlencode(
        {"query": query, "orientation": "landscape", "size": "large", "per_page": 6}
    )
    data = _get_json(f"{API_URL}?{params}", headers)
    photos = data.get("photos", [])
    if not photos:
        raise RuntimeError(f"Pexels: no results for {query!r}")
    photo = photos[seed % len(photos)]
    img_bytes = _get_bytes(photo["src"]["large2x"])
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    return cover_crop(img, OUT_W, OUT_H)


def main():
    posts = json.loads((root / "posts.json").read_text(encoding="utf-8"))
    for p in posts:
        out = covers_dir / f"{p['slug']}.jpg"
        if out.exists() and not FORCE:
            continue
        img = fetch_for(p["slug"], p.get("category", ""))
        img.save(out, "JPEG", quality=85, optimize=True)
        print("generated", out.name)


if __name__ == "__main__":
    main()
