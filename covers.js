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

  // Цвета "токенов" — та же палитра, что в подсветке кода на видео (VS Code Dark+),
  // чтобы обложка сайта и код-карточка в Shorts выглядели одной семьёй.
  var SEG_COLORS = ["#e6e8eb", "#e6e8eb", "#c586c0", "#dcdcaa", "#ce9178", "#6a9955", "#b5cea8"];

  function buildCodeWindow(rand) {
    var x0 = 24, y0 = 24, w = 300, h = 112, rx = 14;
    var lineY = y0 + 44;
    var lineH = 18;
    var numLines = 4;
    var lines = "";
    var lastX = x0 + 20, lastY = y0 + 30;

    for (var li = 0; li < numLines; li++) {
      var curX = x0 + 20 + (li % 3 === 2 ? 16 : 0);
      var segCount = 2 + Math.floor(rand() * 2);
      for (var s = 0; s < segCount; s++) {
        var segW = 16 + Math.floor(rand() * 42);
        var color = SEG_COLORS[Math.floor(rand() * SEG_COLORS.length)];
        var op = s === 0 ? 0.9 : 0.62;
        lines +=
          '<rect x="' + curX + '" y="' + (lineY - 9) + '" width="' + segW + '" height="8" rx="3" ' +
          'fill="' + color + '" opacity="' + op.toFixed(2) + '"/>';
        curX += segW + 7;
      }
      lastX = curX;
      lastY = lineY;
      lineY += lineH;
    }

    var cursor = REDUCE_MOTION
      ? '<rect x="' + lastX + '" y="' + (lastY - 9) + '" width="3" height="9" fill="#e6e8eb" opacity="0.8"/>'
      : '<rect x="' + lastX + '" y="' + (lastY - 9) + '" width="3" height="9" fill="#e6e8eb">' +
        '<animate attributeName="opacity" values="0.9;0;0.9" dur="1s" repeatCount="indefinite"/></rect>';

    return (
      '<g>' +
      '<rect x="' + (x0 + 5) + '" y="' + (y0 + 6) + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="#000000" opacity="0.18"/>' +
      '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="#12141c" opacity="0.72" stroke="#ffffff" stroke-opacity="0.1"/>' +
      '<circle cx="' + (x0 + 18) + '" cy="' + (y0 + 16) + '" r="4" fill="#ef6a5e"/>' +
      '<circle cx="' + (x0 + 32) + '" cy="' + (y0 + 16) + '" r="4" fill="#f5bf4f"/>' +
      '<circle cx="' + (x0 + 46) + '" cy="' + (y0 + 16) + '" r="4" fill="#61c554"/>' +
      lines + cursor +
      '</g>'
    );
  }

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

  var REDUCE_MOTION = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

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

      var driftTag = "";
      if (!REDUCE_MOTION && i === 0) {
        var dur = (11 + rand() * 6).toFixed(1);
        var dx = (10 + rand() * 18).toFixed(0);
        var dy = (8 + rand() * 14).toFixed(0);
        driftTag =
          '<animateTransform attributeName="transform" type="translate" additive="sum" ' +
          'values="0,0; ' + dx + ',' + dy + '; 0,0" dur="' + dur + 's" repeatCount="indefinite" />';
      }

      if (kind < 0.7) {
        shapes += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#ffffff" opacity="' + op + '">' + driftTag + '</circle>';
      } else {
        var rot = Math.floor(rand() * 90);
        shapes +=
          '<rect x="' + (cx - r / 2) + '" y="' + (cy - r / 2) + '" width="' + r + '" height="' + r +
          '" rx="' + (r * 0.2).toFixed(1) + '" fill="#ffffff" opacity="' + op + '" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')">' + driftTag + '</rect>';
      }
    }

    var iconPaths = ICONS[category] || DEFAULT_ICON;

    var wx = 250 + Math.floor(rand() * 90);
    var wy = 40 + Math.floor(rand() * 60);
    var watermarkPulse = REDUCE_MOTION
      ? ""
      : '<animateTransform attributeName="transform" type="scale" additive="sum" ' +
        'values="1;1.06;1" dur="' + (9 + rand() * 4).toFixed(1) + 's" repeatCount="indefinite" />';
    var watermark =
      '<g transform="translate(' + wx + ',' + wy + ') scale(4.2) translate(-12,-12)" opacity="0.14">' +
      '<g stroke="#ffffff" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      iconPaths + watermarkPulse +
      "</g></g>";

    var iconBadge =
      '<g transform="translate(336,16)" opacity="0.9">' +
      '<circle cx="24" cy="24" r="24" fill="#000000" opacity="0.16" />' +
      '<g transform="translate(12,12)" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">' +
      iconPaths +
      "</g>" +
      "</g>";

    var codeWindow = buildCodeWindow(rand);

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
      watermark +
      shapes +
      codeWindow +
      iconBadge +
      "</svg>"
    );
  }

  function renderFallback(el, i) {
    el.innerHTML = buildSvg(el.dataset.slug, el.dataset.category || "", el.dataset.slug + "-" + i);
    el.dataset.rendered = "1";
  }

  function render(root) {
    var scope = root || document;

    var covers = scope.querySelectorAll(".cover[data-slug]");
    for (var i = 0; i < covers.length; i++) {
      (function (el, i) {
        if (el.dataset.rendered) return;
        el.dataset.rendered = "1";

        var img = document.createElement("img");
        img.alt = "";
        img.onerror = function () { renderFallback(el, i); };
        img.src = "/covers/" + el.dataset.slug + ".jpg";
        el.appendChild(img);
      })(covers[i], i);
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
