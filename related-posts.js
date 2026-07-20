(function () {
  const container = document.getElementById('related-posts');
  const cover = document.querySelector('.cover--hero');
  if (!container || !cover) return;

  const slug = cover.dataset.slug;
  const category = cover.dataset.category;

  fetch('../posts.json')
    .then(r => r.json())
    .then(posts => {
      const others = posts.filter(p => p.slug !== slug);
      const sameCategory = others.filter(p => p.category === category);
      const rest = others.filter(p => p.category !== category);
      const picked = sameCategory.concat(rest).slice(0, 3);
      if (!picked.length) return;

      container.innerHTML = '<h2>Похожие статьи</h2>' + picked.map(p => `
        <a class="related-card" href="${p.slug}.html">
          <span class="badge" data-category="${p.category || ''}">${p.category || 'Статья'}</span>
          <h3>${p.title}</h3>
        </a>
      `).join('');
    })
    .catch(() => {});
})();
