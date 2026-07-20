"""Regenerates feed.xml (RSS 2.0) from posts.json. Run after every new post."""
import json, pathlib
from datetime import datetime, timezone
from xml.sax.saxutils import escape

root = pathlib.Path(__file__).resolve().parent
SITE = "https://tsoysasha96-svg.github.io"

posts = json.loads((root / "posts.json").read_text(encoding="utf-8"))
posts = sorted(posts, key=lambda p: p["date"], reverse=True)

items = []
for p in posts:
    d = datetime.strptime(p["date"], "%Y-%m-%d").replace(hour=10, tzinfo=timezone.utc)
    pub_date = d.strftime("%a, %d %b %Y %H:%M:%S %z")
    url = f"{SITE}/posts/{p['slug']}.html"
    items.append(f"""  <item>
    <title>{escape(p['title'])}</title>
    <link>{url}</link>
    <guid>{url}</guid>
    <pubDate>{pub_date}</pubDate>
    <category>{escape(p.get('category', ''))}</category>
    <description>{escape(p['excerpt'])}</description>
  </item>""")

feed = f"""<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>КодБлог</title>
  <link>{SITE}/</link>
  <atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Практические статьи о программировании, инструментах разработчика и технологиях.</description>
  <language>ru</language>
{chr(10).join(items)}
</channel>
</rss>
"""

(root / "feed.xml").write_text(feed, encoding="utf-8")
print(f"feed.xml written with {len(posts)} items")
