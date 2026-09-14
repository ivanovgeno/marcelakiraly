'use strict';

(() => {
  const HQ_VERSION = '20260914hq2';
  const local = (name) => `assets/images/${name}?v=${HQ_VERSION}`;
  const spritePosition = ['0% 50%', '50% 50%', '100% 50%'];

  const addLiveGalleryStyles = () => {
    if (document.getElementById('live-gallery-styles')) return;
    const style = document.createElement('style');
    style.id = 'live-gallery-styles';
    style.textContent = `
      .home-photo-strip{padding:44px 0 88px;background:linear-gradient(180deg,#f7eff2 0%,#fffdfc 100%)}
      .home-photo-strip .hero-gallery{margin:0 auto!important}
      .home-photo-strip .hero-gallery-card{
        background-color:#f1e7eb!important;
        background-repeat:no-repeat!important;
        background-size:300% 100%!important;
        image-rendering:auto!important;
      }
      .inspiration-track{display:flex!important;width:300%!important}
      .inspiration-page{width:33.333333%!important;flex:0 0 33.333333%!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:22px!important}
      .inspiration-card{
        background-repeat:no-repeat!important;
        background-size:300% 100%!important;
        image-rendering:auto!important;
      }
      .inspiration-card::before{z-index:1!important;background:linear-gradient(180deg,rgba(255,255,255,.015),rgba(64,42,73,.035))!important}
      .profile-home-visual{
        background-image:url('${local('marcela-kiraly-hq.webp')}')!important;
        background-size:cover!important;
        background-position:center 28%!important;
        background-repeat:no-repeat!important;
      }
      @media(max-width:820px){.home-photo-strip{padding:28px 0 62px}}
      @media(max-width:720px){
        .inspiration-track{display:block!important;width:100%!important;transform:none!important}
        .inspiration-page{width:100%!important;display:grid!important;grid-template-columns:1fr!important;gap:16px!important;flex:0 0 auto!important}
        .inspiration-page+.inspiration-page{margin-top:16px!important}
      }
    `;
    document.head.appendChild(style);
  };

  const setSpriteCard = (element, sprite, column, label) => {
    element.classList.remove('is-placeholder');
    element.innerHTML = '';
    element.style.backgroundImage = `url("${local(sprite)}")`;
    element.style.backgroundPosition = spritePosition[column];
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundSize = '300% 100%';
    element.setAttribute('role', 'img');
    element.setAttribute('aria-label', label);
  };

  const setupHomepageGallery = () => {
    const hero = document.querySelector('.hero');
    const gallery = document.querySelector('.hero-gallery');
    if (!hero || !gallery) return;

    addLiveGalleryStyles();

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

    cards.slice(0, 3).forEach((card, index) => {
      setSpriteCard(card, 'home-sprite-hq.webp', index, labels[index]);
    });
  };

  const setupInspirationGallery = () => {
    const carousel = document.querySelector('.inspiration-carousel');
    if (!carousel) return;

    addLiveGalleryStyles();

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
    const rowSprites = [
      'inspiration-row-1-hq.webp',
      'inspiration-row-2-hq.webp',
      'inspiration-row-3-hq.webp'
    ];

    const track = carousel.querySelector('.inspiration-track');
    const controls = carousel.querySelector('.inspiration-controls');
    if (!track || !controls) return;

    track.innerHTML = '';
    const pageCount = 3;

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      const page = document.createElement('div');
      page.className = 'inspiration-page';

      for (let column = 0; column < 3; column += 1) {
        const absoluteIndex = pageIndex * 3 + column;
        const figure = document.createElement('figure');
        figure.className = 'inspiration-card';
        setSpriteCard(figure, rowSprites[pageIndex], column, labels[absoluteIndex]);
        page.appendChild(figure);
      }

      track.appendChild(page);
    }

    controls.innerHTML = `<button class="inspiration-arrow inspiration-prev" type="button" aria-label="Předchozí tři fotografie">←</button><div class="inspiration-dots" aria-hidden="true">${Array.from({length:pageCount},(_,i)=>`<span class="inspiration-dot${i===0?' is-active':''}"></span>`).join('')}</div><button class="inspiration-arrow inspiration-next" type="button" aria-label="Další tři fotografie">→</button>`;

    let currentPage = 0;
    const dots = [...controls.querySelectorAll('.inspiration-dot')];
    const prev = controls.querySelector('.inspiration-prev');
    const next = controls.querySelector('.inspiration-next');

    const render = () => {
      track.style.transform = `translateX(-${currentPage * (100 / pageCount)}%)`;
      dots.forEach((dot, index) => dot.classList.toggle('is-active', index === currentPage));
      prev.disabled = currentPage === 0;
      next.disabled = currentPage === pageCount - 1;
    };

    prev.addEventListener('click', () => { currentPage = Math.max(0, currentPage - 1); render(); });
    next.addEventListener('click', () => { currentPage = Math.min(pageCount - 1, currentPage + 1); render(); });
    render();
  };

  const useHighQualityPortrait = () => {
    document.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const filename = src.split('?')[0].split('/').pop();
      if (filename === 'marcela-kiraly.webp' || filename === 'portrait-constellations.webp' || filename === 'portrait-constellations-v2.jpg') {
        img.src = local('marcela-kiraly-hq.webp');
        img.removeAttribute('srcset');
      }
    });
  };

  setupHomepageGallery();
  setupInspirationGallery();
  useHighQualityPortrait();
})();
