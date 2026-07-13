/* Генерирует детерминированную абстрактную SVG-обложку по slug статьи
   и подбирает цвет/иконку категории для бейджей.
   Один и тот же slug/категория всегда даёт одинаковый результат. */
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

  var ICONS = {
    "Языки программирования": '<path d="M8 4l-6 8 6 8M16 4l6 8-6 8"/>',
    "Инструменты": '<path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-3-3z"/>',
    "AI и агенты": '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    "Основы и концепции": '<rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/>',
    "Карьера разработчика": '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    "Продуктивность": '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    "Веб-разработка": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><circle cx="6.5" cy="6.5" r=".6"/><circle cx="9" cy="6.5" r=".6"/>',
    "Базы данных": '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'
  };
  var DEFAULT_ICON = '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>';

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

  function paletteFor(str) {
    return PALETTES[hashStr(str) % PALETTES.length];
  }

  function buildSvg(slug, category, uid) {
    var h = hashStr(slug);
    var rand = mulberry32(h);
    var pair = paletteFor(slug);
    var angle = Math.floor(rand() * 360);
    var shapeCount = 4 + Math.floor(rand() * 3);
    var shapes = "";
    for (var i = 0; i < shapeCount; i++) {
      var cx = Math.floor(rand() * 400);
      var cy = Math.floor(rand() * 160);
      var r = 24 + Math.floor(rand() * 100);
      var op = (0.07 + rand() * 0.14).toFixed(2);
      var kind = rand();
      if (kind < 0.7) {
        shapes += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#ffffff" opacity="' + op + '" />';
      } else {
        var rot = Math.floor(rand() * 90);
        shapes +=
          '<rect x="' + (cx - r / 2) + '" y="' + (cy - r / 2) + '" width="' + r + '" height="' + r +
          '" rx="' + (r * 0.2).toFixed(1) + '" fill="#ffffff" opacity="' + op + '" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')" />';
      }
    }

    var iconPaths = ICONS[category] || DEFAULT_ICON;
    var iconBadge =
      '<g transform="translate(336,16)" opacity="0.9">' +
      '<circle cx="24" cy="24" r="24" fill="#000000" opacity="0.16" />' +
      '<g transform="translate(12,12)" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">' +
      iconPaths +
      "</g>" +
      "</g>";

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
      iconBadge +
      "</svg>"
    );
  }

  function render(root) {
    var scope = root || document;

    var covers = scope.querySelectorAll(".cover[data-slug]");
    for (var i = 0; i < covers.length; i++) {
      var el = covers[i];
      if (el.dataset.rendered) continue;
      el.innerHTML = buildSvg(el.dataset.slug, el.dataset.category || "", el.dataset.slug + "-" + i);
      el.dataset.rendered = "1";
    }

    var badges = scope.querySelectorAll(".badge[data-category]");
    for (var j = 0; j < badges.length; j++) {
      var b = badges[j];
      var color = paletteFor(b.dataset.category)[0];
      b.style.borderColor = color;
      b.style.color = color;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
  });

  return { render: render };
})();
