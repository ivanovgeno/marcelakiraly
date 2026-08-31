'use strict';

const ensureStylesheet=(href)=>{
  if(!document.querySelector(`link[href="${href}"]`)){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    document.head.appendChild(link);
  }
};
ensureStylesheet('assets/css/typography-cs.css');
ensureStylesheet('assets/css/constellation-2026.css');
ensureStylesheet('assets/css/centered-2026.css');

/*
 * Robust image loading.
 * The site can be previewed from GitHub Pages, a custom domain or another path.
 * Absolute raw GitHub URLs prevent relative /assets paths from breaking.
 */
const IMAGE_BASE='https://raw.githubusercontent.com/ivanovgeno/marcelakiraly/main/assets/images/';
document.querySelectorAll('img[src^="assets/images/"]').forEach(img=>{
  const original=img.getAttribute('src');
  const filename=original.split('/').pop();
  img.src=IMAGE_BASE+encodeURIComponent(filename);
  img.addEventListener('error',()=>{
    if(img.dataset.imageFallback) return;
    img.dataset.imageFallback='true';
    img.src=IMAGE_BASE+'hero-konstelace-temp.jpg';
  },{once:true});
});

const header=document.querySelector('[data-header], .site-header');
const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('.mobile-menu');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=window.matchMedia('(pointer:fine)').matches;

if(header){
  const syncHeader=()=>header.classList.toggle('is-scrolled',window.scrollY>24);
  syncHeader();
  window.addEventListener('scroll',syncHeader,{passive:true});
}

if(toggle&&menu){
  const closeMenu=()=>{
    toggle.setAttribute('aria-expanded','false');
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };
  toggle.addEventListener('click',()=>{
    const open=toggle.getAttribute('aria-expanded')==='true';
    toggle.setAttribute('aria-expanded',String(!open));
    menu.classList.toggle('is-open',!open);
    document.body.classList.toggle('menu-open',!open);
  });
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  window.addEventListener('resize',()=>{if(window.innerWidth>820)closeMenu()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
}

const reveals=document.querySelectorAll('.reveal');
if(!reduceMotion&&'IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -35px'});
  reveals.forEach(el=>observer.observe(el));
}else{
  reveals.forEach(el=>el.classList.add('is-visible'));
}

if(!reduceMotion&&finePointer){
  const transformable=['hero-photo-wrap','subhero-media','about-visual','method-art'];
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    const strength=Number(card.dataset.tiltStrength||7);
    const onMove=event=>{
      const rect=card.getBoundingClientRect();
      const px=(event.clientX-rect.left)/rect.width;
      const py=(event.clientY-rect.top)/rect.height;
      const ry=(px-.5)*strength*2;
      const rx=(.5-py)*strength*2;
      card.style.setProperty('--rx',`${rx}deg`);
      card.style.setProperty('--ry',`${ry}deg`);
      card.style.setProperty('--x',`${px*100}%`);
      card.style.setProperty('--y',`${py*100}%`);
      if(transformable.some(name=>card.classList.contains(name))){
        card.style.transform=`perspective(1200px) rotateX(${rx*.35}deg) rotateY(${ry*.35}deg)`;
      }
    };
    const reset=()=>{
      card.style.setProperty('--rx','0deg');
      card.style.setProperty('--ry','0deg');
      if(transformable.some(name=>card.classList.contains(name))) card.style.transform='';
    };
    card.addEventListener('pointermove',onMove);
    card.addEventListener('pointerleave',reset);
  });

  document.querySelectorAll('.magnetic').forEach(button=>{
    button.addEventListener('pointermove',event=>{
      const rect=button.getBoundingClientRect();
      const x=(event.clientX-rect.left-rect.width/2)*.14;
      const y=(event.clientY-rect.top-rect.height/2)*.18;
      button.style.setProperty('--mx',`${x}px`);
      button.style.setProperty('--my',`${y}px`);
    });
    button.addEventListener('pointerleave',()=>{
      button.style.setProperty('--mx','0px');
      button.style.setProperty('--my','0px');
    });
  });

  const aura=document.querySelector('.cursor-aura');
  if(aura){
    let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y;
    window.addEventListener('pointermove',event=>{tx=event.clientX;ty=event.clientY;aura.style.opacity='1'},{passive:true});
    const tick=()=>{
      x+=(tx-x)*.12;
      y+=(ty-y)*.12;
      aura.style.left=`${x}px`;
      aura.style.top=`${y}px`;
      requestAnimationFrame(tick);
    };
    tick();
  }
}

const form=document.querySelector('[data-contact-form]');
if(form){
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const status=form.querySelector('.form-status');
    if(status) status.textContent='Formulář je připravený. Po doplnění cílového e-mailu ho napojíme na reálné odesílání.';
  });
}
