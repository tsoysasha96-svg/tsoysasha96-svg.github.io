/* Общие интерактивные штуки для всех страниц: переключатель темы,
   полоса прогресса чтения на статьях, плавное появление карточек при скролле. */
(function () {
  "use strict";

  var STORAGE_KEY = "kodblog-theme";
  var root = document.documentElement;

  function currentTheme() {
    if (root.dataset.theme === "light" || root.dataset.theme === "dark") return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  function buildThemeToggle() {
    var nav = document.querySelector(".site-header nav");
    if (!nav || nav.querySelector(".theme-toggle")) return;

    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    applyTheme(saved === "light" || saved === "dark" ? saved : currentTheme());

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    btn.setAttribute("aria-label", "Переключить тему");
    btn.innerHTML =
      '<svg class="icon-sun" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
      '<svg class="icon-moon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    btn.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
    nav.appendChild(btn);
  }

  function buildProgressBar() {
    var article = document.querySelector("article.post");
    if (!article) return;

    var bar = document.createElement("div");
    bar.className = "reading-progress";
    var fill = document.createElement("div");
    fill.className = "reading-progress__fill";
    bar.appendChild(fill);
    document.body.appendChild(bar);

    function update() {
      var total = article.offsetHeight - window.innerHeight;
      var scrolled = window.scrollY - article.offsetTop;
      var pct = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
      fill.style.width = pct + "%";
    }
    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function reveal(root) {
    var scope = root || document;
    var items = scope.querySelectorAll(".post-card:not(.reveal-done), .related-card:not(.reveal-done)");
    if (!items.length) return;

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("reveal-done", "reveal-visible"); });
      return;
    }

    items.forEach(function (el) { el.classList.add("reveal", "reveal-done"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildThemeToggle();
    buildProgressBar();
    reveal();
  });

  window.KodBlogEnhance = { reveal: reveal };
})();
