/* Генерирует детерминированную абстрактную SVG-обложку по slug статьи.
   Один и тот же slug всегда даёт одну и ту же картинку. */
window.KodBlogCovers = (function () {
  var PALETTES = [
    ["#6366f1", "#a855f7"],
    ["#0ea5e9", "#6366f1"],
    ["#f59e0b", "#ef4444"],
    ["#10b981", "#0ea5e9"],
    ["#ec4899", "#a855f7"],
    ["#14b8a6", "#22c55e"],
    ["#f97316", "#ec4899"],
    ["#8b5cf6", "#ec4899"]
  ];

  function hashStr(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildSvg(slug, uid) {
    var h = hashStr(slug);
    var rand = mulberry32(h);
    var pair = PALETTES[h % PALETTES.length];
    var angle = Math.floor(rand() * 360);
    var shapeCount = 4 + Math.floor(rand() * 3);
    var shapes = "";
    for (var i = 0; i < shapeCount; i++) {
      var cx = Math.floor(rand() * 400);
      var cy = Math.floor(rand() * 160);
      var r = 24 + Math.floor(rand() * 100);
      var op = (0.07 + rand() * 0.14).toFixed(2);
      shapes += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#ffffff" opacity="' + op + '" />';
    }
    var gid = "grad-" + uid;
    return (
      '<svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">' +
      "<defs>" +
      '<linearGradient id="' + gid + '" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(' + angle + ' 0.5 0.5)">' +
      '<stop offset="0%" stop-color="' + pair[0] + '" />' +
      '<stop offset="100%" stop-color="' + pair[1] + '" />' +
      "</linearGradient>" +
      "</defs>" +
      '<rect width="400" height="160" fill="url(#' + gid + ')" />' +
      shapes +
      "</svg>"
    );
  }

  function render(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll(".cover[data-slug]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.dataset.rendered) continue;
      el.innerHTML = buildSvg(el.dataset.slug, el.dataset.slug + "-" + i);
      el.dataset.rendered = "1";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
  });

  return { render: render };
})();
