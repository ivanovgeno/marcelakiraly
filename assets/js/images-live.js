'use strict';

(() => {
  const local = (name) => `assets/images/${name}`;

  // Homepage: use the three real hero images already stored in the repository.
  const heroCards = [...document.querySelectorAll('.hero-gallery-card')];
  const heroImages = [
    ['hero-konstelace-1.jpg', 'Konstelace – fotografie 1'],
    ['hero-konstelace-2.jpg', 'Konstelace – fotografie 2'],
    ['hero-konstelace-3.jpg', 'Konstelace – fotografie 3']
  ];

  heroCards.forEach((card, index) => {
    const item = heroImages[index];
    if (!item) return;
    card.classList.remove('is-placeholder');
    card.innerHTML = `<img src="${local(item[0])}" alt="${item[1]}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async">`;
    card.setAttribute('aria-label', item[1]);
  });

  // main.js used to replace local images with raw GitHub placeholder files.
  // Put all regular site images back on stable relative URLs instead.
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
