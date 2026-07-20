<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>
<xsl:template match="/rss/channel">
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title><xsl:value-of select="title"/> — RSS</title>
<style>
  :root { --bg:#0f1115; --bg-card:#171a21; --text:#e6e8eb; --text-dim:#9aa1ac; --accent:#5b9dff; --border:#262a33; --max-width:780px; }
  @media (prefers-color-scheme: light) {
    :root { --bg:#fafafa; --bg-card:#ffffff; --text:#16181d; --text-dim:#5b6270; --accent:#2563eb; --border:#e6e8eb; }
  }
  * { box-sizing: border-box; }
  body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; background:var(--bg); color:var(--text); line-height:1.6; }
  .wrap { max-width:var(--max-width); margin:0 auto; padding:40px 16px 64px; }
  a.home { color:var(--accent); text-decoration:none; font-size:0.9rem; }
  h1 { font-size:1.6rem; margin:14px 0 4px; }
  .lead { color:var(--text-dim); margin-top:0; }
  .notice { background:var(--bg-card); border:1px solid var(--border); border-radius:10px; padding:14px 16px; font-size:0.88rem; color:var(--text-dim); margin:20px 0 32px; }
  .notice code { background:var(--bg); border:1px solid var(--border); padding:1px 5px; border-radius:4px; }
  .item { border-bottom:1px solid var(--border); padding:20px 0; }
  .item:last-child { border-bottom:none; }
  .item h2 { font-size:1.1rem; margin:0 0 6px; }
  .item h2 a { color:var(--text); text-decoration:none; }
  .item h2 a:hover { color:var(--accent); }
  .meta { font-size:0.8rem; color:var(--text-dim); margin-bottom:8px; }
  .item p { margin:0; color:var(--text-dim); font-size:0.94rem; }
</style>
</head>
<body>
<div class="wrap">
  <a class="home" href="{link}">← На сайт КодБлог</a>
  <h1><xsl:value-of select="title"/></h1>
  <p class="lead"><xsl:value-of select="description"/></p>
  <div class="notice">
    Это RSS-лента, открытая напрямую в браузере. Чтобы получать новые статьи автоматически, добавьте адрес <code>feed.xml</code> в RSS-читалку (Feedly, Inoreader и т.п.).
  </div>
  <xsl:for-each select="item">
  <div class="item">
    <h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
    <div class="meta"><xsl:value-of select="category"/> · <xsl:value-of select="pubDate"/></div>
    <p><xsl:value-of select="description"/></p>
  </div>
  </xsl:for-each>
</div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
