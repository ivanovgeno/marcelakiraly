'use strict';

(() => {
  const local = (name) => `assets/images/${name}`;

  const addHomepageGalleryStyles = () => {
    if (document.getElementById('home-photo-strip-styles')) return;
    const style = document.createElement('style');
    style.id = 'home-photo-strip-styles';
    style.textContent = `
      .home-photo-strip{padding:44px 0 88px;background:linear-gradient(180deg,#f7eff2 0%,#fffdfc 100%)}
      .home-photo-strip .hero-gallery{margin:0 auto!important}
      .home-photo-strip .hero-gallery-card{background:#f1e7eb}
      @media(max-width:820px){.home-photo-strip{padding:28px 0 62px}}
    `;
    document.head.appendChild(style);
  };

  const setupHomepageGallery = async () => {
    const hero = document.querySelector('.hero');
    const gallery = document.querySelector('.hero-gallery');
    if (!hero || !gallery) return;

    addHomepageGalleryStyles();

    if (!gallery.closest('.home-photo-strip')) {
      const section = document.createElement('section');
      section.className = 'home-photo-strip';
      section.setAttribute('aria-label', 'Fotografie inspirace');
      const container = document.createElement('div');
      container.className = 'container';
      gallery.remove();
      container.appendChild(gallery);
      section.appendChild(container);
      hero.insertAdjacentElement('afterend', section);
    }

    const cards = [...gallery.querySelectorAll('.hero-gallery-card')];
    const labels = [
      'Slunce mezi stromy v lese',
      'Růžové květy při západu slunce',
      'Křišťálová koule v protisvětle'
    ];

    try {
      const urls = Array.from({ length: 7 }, (_, i) => `assets/data/home-gallery-${i + 1}.txt?v=20260914`);
      const parts = await Promise.all(urls.map(async (url) => {
        const response = await fetch(url, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`Galerie: ${response.status}`);
        return response.text();
      }));
      const data = JSON.parse(parts.join(''));
      const images = [data.forest, data.flowers, data.crystal];

      cards.forEach((card, index) => {
        const base64 = images[index];
        if (!base64) return;
        card.classList.remove('is-placeholder');
        card.innerHTML = `<img src="data:image/webp;base64,${base64}" alt="${labels[index]}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async">`;
        card.setAttribute('aria-label', labels[index]);
      });
    } catch (error) {
      const fallbacks = ['hero-konstelace-1.jpg', 'hero-konstelace-2.jpg', 'hero-konstelace-3.jpg'];
      cards.forEach((card, index) => {
        card.classList.remove('is-placeholder');
        card.innerHTML = `<img src="${local(fallbacks[index])}" alt="${labels[index]}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async">`;
        card.setAttribute('aria-label', labels[index]);
      });
    }
  };

  const setupInspirationGallery = async () => {
    const carousel = document.querySelector('.inspiration-carousel');
    if (!carousel) return;

    try {
      const urls = Array.from({ length: 8 }, (_, i) => `assets/data/inspiration-gallery-${i + 1}.txt?v=20260914b`);
      const parts = await Promise.all(urls.map(async (url) => {
        const response = await fetch(url, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`Inspirace: ${response.status}`);
        return response.text();
      }));
      const data = JSON.parse(parts.join(''));
      if (!Array.isArray(data.images) || data.images.length < 9) return;

      const labels = [
        'Zimní krajina se sluncem',
        'Strom v letní zeleni',
        'Klidná hladina jezera',
        'Výhled do zelených hor',
        'Lesní potok',
        'Lavička u vody při západu slunce',
        'Květy při západu slunce',
        'Rozkvetlé bílé květy',
        'Zimní les se sluncem'
      ];
      const track = carousel.querySelector('.inspiration-track');
      const controls = carousel.querySelector('.inspiration-controls');
      if (!track || !controls) return;

      track.innerHTML = '';
      for (let pageIndex = 0; pageIndex < 3; pageIndex += 1) {
        const page = document.createElement('div');
        page.className = 'inspiration-page';
        data.images.slice(pageIndex * 3, pageIndex * 3 + 3).forEach((base64, itemIndex) => {
          const absoluteIndex = pageIndex * 3 + itemIndex;
          const figure = document.createElement('figure');
          figure.className = 'inspiration-card';
          const label = labels[absoluteIndex] || 'Inspirace';
          figure.innerHTML = `<img src="data:image/webp;base64,${base64}" alt="${label}" loading="lazy" decoding="async">`;
          page.appendChild(figure);
        });
        track.appendChild(page);
      }

      controls.innerHTML = '<button class="inspiration-arrow inspiration-prev" type="button" aria-label="Předchozí tři fotografie">←</button><div class="inspiration-dots" aria-hidden="true"><span class="inspiration-dot is-active"></span><span class="inspiration-dot"></span><span class="inspiration-dot"></span></div><button class="inspiration-arrow inspiration-next" type="button" aria-label="Další tři fotografie">→</button>';
      let page = 0;
      const dots = [...controls.querySelectorAll('.inspiration-dot')];
      const prev = controls.querySelector('.inspiration-prev');
      const next = controls.querySelector('.inspiration-next');
      const render = () => {
        track.style.transform = `translateX(-${page * (100 / 3)}%)`;
        dots.forEach((dot, index) => dot.classList.toggle('is-active', index === page));
        prev.disabled = page === 0;
        next.disabled = page === 2;
      };
      prev.addEventListener('click', () => { page = Math.max(0, page - 1); render(); });
      next.addEventListener('click', () => { page = Math.min(2, page + 1); render(); });
      render();
    } catch (error) {
      // Původní prázdné karty zůstanou jako bezpečný fallback.
    }
  };

  setupHomepageGallery();
  setupInspirationGallery();

  const reverseMap = {
    'hero-constellations-v2.jpg': 'hero-constellations.webp',
    'constellation-system-v2.jpg': 'constellation-system.webp',
    'constellation-space-v2.jpg': 'constellation-space.webp',
    'constellation-landscape-v2.jpg': 'constellation-landscape.webp',
    'portrait-constellations-v2.jpg': 'portrait-constellations.webp',
    'constellation-bg-v2.jpg': 'constellation-bg.webp'
  };

  document.querySelectorAll('img').forEach((img) => {
    if (img.closest('.hero-gallery')) return;
    const src = img.getAttribute('src') || '';
    const filename = src.split('?')[0].split('/').pop();
    if (!filename) return;

    if (reverseMap[filename]) {
      img.src = local(reverseMap[filename]);
    } else if (src.includes('raw.githubusercontent.com/ivanovgeno/marcelakiraly/')) {
      img.src = local(filename);
    }

    img.addEventListener('error', () => {
      if (img.dataset.localFallback) return;
      img.dataset.localFallback = 'true';
      img.src = local('hero-konstelace-temp.jpg');
    }, { once: true });
  });
})();
