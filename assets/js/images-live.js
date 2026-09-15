'use strict';

(() => {
  const HQ_VERSION = '20260914hq2';
  const local = (name) => `assets/images/${name}?v=${HQ_VERSION}`;

  const addLiveGalleryStyles = () => {
    if (document.getElementById('live-gallery-styles')) return;
    const style = document.createElement('style');
    style.id = 'live-gallery-styles';
    style.textContent = `
      .hero-gallery-card{
        background-color:#f1e7eb!important;
        image-rendering:auto!important;
      }
      .inspiration-track{display:flex!important;width:max-content!important;gap:16px!important;transform:none!important;transition:none!important}
      .inspiration-page{display:contents!important}
      .inspiration-card{image-rendering:auto!important}
      .inspiration-card::before{z-index:1!important;background:linear-gradient(180deg,rgba(255,255,255,.015),rgba(64,42,73,.035))!important}
      .profile-home-visual{
        background-image:url('${local('marcela-kiraly.webp')}')!important;
        background-size:cover!important;
        background-position:center 28%!important;
        background-repeat:no-repeat!important;
      }
      @media(max-width:720px){.inspiration-track{display:flex!important;width:max-content!important;gap:12px!important}}
    `;
    document.head.appendChild(style);
  };

  const setImageCard = (element, filename, label) => {
    element.classList.remove('is-placeholder');
    element.removeAttribute('role');
    element.removeAttribute('aria-label');
    element.style.removeProperty('background-image');
    element.innerHTML = `<img src="${local(filename)}" alt="${label}" loading="lazy" decoding="async">`;
  };

  const setupHomepageGallery = () => {
    const hero = document.querySelector('.hero');
    const gallery = document.querySelector('.hero-gallery');
    if (!hero || !gallery) return;

    addLiveGalleryStyles();

    const cards = [...gallery.querySelectorAll('.hero-gallery-card')];
    const images = [
      ['home-flowers.webp', 'Růžové květy při západu slunce'],
      ['home-crystal.webp', 'Křišťálová koule v protisvětle'],
      ['inspiration-02.webp', 'Strom v letní zeleni']
    ];

    cards.slice(0, 3).forEach((card, index) => {
      setImageCard(card, images[index][0], images[index][1]);
    });
  };

  const setupInspirationGallery = () => {
    const carousel = document.querySelector('.inspiration-carousel');
    if (!carousel) return;

    addLiveGalleryStyles();

    const images = [
      ['inspiration-01.webp', 'Zimní krajina se sluncem'],
      ['inspiration-02.webp', 'Strom v letní zeleni'],
      ['inspiration-03.webp', 'Klidná hladina jezera'],
      ['inspiration-04.webp', 'Výhled do zelených hor'],
      ['inspiration-06.webp', 'Lavička u vody při západu slunce'],
      ['inspiration-07.webp', 'Rozkvetlé bílé květy'],
      ['inspiration-08.webp', 'Zimní les se sluncem']
    ];

    const track = carousel.querySelector('.inspiration-track');
    const controls = carousel.querySelector('.inspiration-controls');
    if (!track || !controls) return;

    track.innerHTML = '';
    const originals = [];

    images.forEach(([filename, label]) => {
      const figure = document.createElement('figure');
      figure.className = 'inspiration-card';
      setImageCard(figure, filename, label);
      originals.push(figure);
      track.appendChild(figure);
    });

    originals.forEach((figure) => {
      const clone = figure.cloneNode(true);
      clone.dataset.loopClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    const arrowIcon = () => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
    controls.innerHTML = `<button class="inspiration-arrow inspiration-prev" type="button" aria-label="Předchozí fotografie">${arrowIcon()}</button><button class="inspiration-toggle" type="button" aria-label="Pozastavit automatické posouvání" aria-pressed="false"><span aria-hidden="true">Ⅱ</span></button><button class="inspiration-arrow inspiration-next" type="button" aria-label="Další fotografie">${arrowIcon()}</button>`;

    const prev = controls.querySelector('.inspiration-prev');
    const next = controls.querySelector('.inspiration-next');
    const toggle = controls.querySelector('.inspiration-toggle');
    const viewport = carousel.querySelector('.inspiration-viewport');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let pausedByUser = reducedMotion.matches;
    let pointerIsDown = false;
    let resumeAt = 0;
    let previousTime = 0;
    let frame = 0;

    if (pausedByUser) {
      toggle.setAttribute('aria-pressed', 'true');
      toggle.setAttribute('aria-label', 'Spustit automatické posouvání');
      toggle.querySelector('span').textContent = '▶';
    }

    const loopWidth = () => track.querySelector('[data-loop-clone]')?.offsetLeft - originals[0].offsetLeft || 0;
    const cardStep = () => {
      const style = getComputedStyle(track);
      return originals[0].getBoundingClientRect().width + (parseFloat(style.gap) || 0);
    };
    const normalize = () => {
      const width = loopWidth();
      if (!width) return;
      while (viewport.scrollLeft >= width) viewport.scrollLeft -= width;
      while (viewport.scrollLeft < 0) viewport.scrollLeft += width;
    };
    const move = (direction) => {
      resumeAt = performance.now() + 900;
      if (direction < 0 && viewport.scrollLeft < cardStep()) viewport.scrollLeft += loopWidth();
      viewport.scrollBy({ left: direction * cardStep(), behavior: 'smooth' });
      window.setTimeout(normalize, 700);
    };
    const tick = (time) => {
      if (previousTime && !pausedByUser && !pointerIsDown && time >= resumeAt && !document.hidden) {
        viewport.scrollLeft += Math.min(40, time - previousTime) * 34 / 1000;
        normalize();
      }
      previousTime = time;
      frame = requestAnimationFrame(tick);
    };

    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    toggle.addEventListener('click', () => {
      pausedByUser = !pausedByUser;
      toggle.setAttribute('aria-pressed', String(pausedByUser));
      toggle.setAttribute('aria-label', pausedByUser ? 'Spustit automatické posouvání' : 'Pozastavit automatické posouvání');
      toggle.querySelector('span').textContent = pausedByUser ? '▶' : 'Ⅱ';
    });
    viewport.addEventListener('pointerdown', () => { pointerIsDown = true; });
    const releasePointer = () => {
      normalize();
      pointerIsDown = false;
      resumeAt = performance.now() + 500;
    };
    window.addEventListener('pointerup', releasePointer, { passive: true });
    window.addEventListener('pointercancel', releasePointer, { passive: true });
    reducedMotion.addEventListener('change', (event) => {
      if (event.matches) pausedByUser = true;
    });
    carousel.dataset.autoplay = 'infinite';
    frame = requestAnimationFrame(tick);
    window.addEventListener('pagehide', () => cancelAnimationFrame(frame), { once: true });
  };

  const useAvailablePortrait = () => {
    document.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const filename = src.split('?')[0].split('/').pop();
      if (filename === 'marcela-kiraly.webp' || filename === 'portrait-constellations.webp' || filename === 'portrait-constellations-v2.jpg') {
        img.src = local('marcela-kiraly.webp');
        img.removeAttribute('srcset');
      }
    });
  };

  setupHomepageGallery();
  setupInspirationGallery();
  useAvailablePortrait();
})();
