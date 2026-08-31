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
ensureStylesheet('assets/css/legal-mobile-2026.css');

/* Reliable image set. */
const IMAGE_BASE='https://raw.githubusercontent.com/ivanovgeno/marcelakiraly/main/assets/images/';
const IMAGE_MAP={
  'hero-constellations.webp':'hero-constellations-v2.jpg',
  'constellation-system.webp':'constellation-system-v2.jpg',
  'constellation-space.webp':'constellation-space-v2.jpg',
  'constellation-landscape.webp':'constellation-landscape-v2.jpg',
  'portrait-constellations.webp':'portrait-constellations-v2.jpg',
  'constellation-bg.webp':'constellation-bg-v2.jpg',
  'hero-konstelace-temp.jpg':'hero-constellations-v2.jpg',
  'marcela-temp.jpg':'portrait-constellations-v2.jpg'
};
document.querySelectorAll('img').forEach(img=>{
  const src=img.getAttribute('src')||'';
  const clean=src.split('?')[0];
  const filename=clean.split('/').pop();
  const target=IMAGE_MAP[filename]||filename;
  if(filename&&(src.includes('assets/images/')||IMAGE_MAP[filename])){
    img.src=IMAGE_BASE+target+'?v=20260901a';
    img.addEventListener('error',()=>{
      if(img.dataset.imageFallback)return;
      img.dataset.imageFallback='true';
      img.src=IMAGE_BASE+'hero-konstelace-temp.jpg?v=20260901a';
    },{once:true});
  }
});

const imageStyle=document.createElement('style');
imageStyle.textContent=`
.visual-story:before{background-image:url('${IMAGE_BASE}constellation-bg-v2.jpg?v=20260901a')!important}
.cta-band{background:linear-gradient(90deg,rgba(76,52,89,.92),rgba(112,75,122,.80)),url('${IMAGE_BASE}constellation-bg-v2.jpg?v=20260901a') center/cover no-repeat!important}
.subhero:before{background:linear-gradient(180deg,rgba(253,249,247,.90),rgba(250,242,244,.78)),url('${IMAGE_BASE}constellation-bg-v2.jpg?v=20260901a') center/cover no-repeat!important}
`;
document.head.appendChild(imageStyle);

/* Social + legal footer on every page. Replace placeholders once final FB/IG URLs are supplied. */
const footer=document.querySelector('.site-footer,.inner-footer');
if(footer&&!footer.querySelector('.footer-extras')){
  const extras=document.createElement('div');
  extras.className='container footer-extras';
  extras.innerHTML=`
    <div class="footer-social" aria-label="Sociální sítě">
      <span class="footer-social-label">Sledujte mě</span>
      <a class="social-link" href="#" data-social-placeholder aria-disabled="true" aria-label="Facebook – odkaz bude doplněn" title="Facebook – doplnit finální odkaz">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 22v-8.6h2.9l.43-3.35H13.7V7.91c0-.97.27-1.63 1.66-1.63h1.78V3.29c-.31-.04-1.36-.13-2.59-.13-2.56 0-4.32 1.56-4.32 4.43v2.46H7.33v3.35h2.9V22h3.47Z"/></svg>
      </a>
      <a class="social-link" href="#" data-social-placeholder aria-disabled="true" aria-label="Instagram – odkaz bude doplněn" title="Instagram – doplnit finální odkaz">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm-.18 2A3.02 3.02 0 0 0 4 7.02v9.96A3.02 3.02 0 0 0 7.02 20h9.96A3.02 3.02 0 0 0 20 16.98V7.02A3.02 3.02 0 0 0 16.98 4H7.02Zm10.23 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>
      </a>
    </div>
    <nav class="footer-legal" aria-label="Právní informace">
      <a href="ochrana-osobnich-udaju.html">Ochrana osobních údajů</a>
      <a href="cookies.html">Cookies</a>
      <a href="marketingovy-souhlas.html">Marketingový souhlas</a>
      <a href="obchodni-podminky.html">Obchodní podmínky</a>
    </nav>
    <p class="footer-business-note">Provozovatel: Marcela Kiraly · IČO, sídlo, e-mail a telefon budou doplněny před ostrým spuštěním webu.</p>`;
  const bottom=footer.querySelector('.inner-footer-bottom,.footer-bottom');
  if(bottom)footer.insertBefore(extras,bottom);else footer.appendChild(extras);
}
document.querySelectorAll('[data-social-placeholder]').forEach(link=>link.addEventListener('click',event=>event.preventDefault()));

/* Voluntary direct-marketing consent on contact form. */
const form=document.querySelector('[data-contact-form]');
if(form&&!form.querySelector('.marketing-consent')){
  const submitField=form.querySelector('button[type="submit"]')?.closest('.field');
  const consent=document.createElement('div');
  consent.className='field full marketing-consent';
  consent.innerHTML=`<label><input type="checkbox" name="marketing_consent" value="yes"><span>Souhlasím se zasíláním občasných novinek a nabídek e-mailem. Souhlas je dobrovolný, není podmínkou poskytnutí služby a lze jej kdykoli odvolat. <a href="marketingovy-souhlas.html">Více o marketingovém souhlasu</a>.</span></label>`;
  const privacy=document.createElement('p');
  privacy.className='field full form-privacy-note';
  privacy.innerHTML='Odesláním formuláře berete na vědomí zpracování údajů potřebných k vyřízení vaší zprávy. Podrobnosti najdete v <a href="ochrana-osobnich-udaju.html">zásadách ochrany osobních údajů</a>.';
  if(submitField){form.insertBefore(consent,submitField);form.insertBefore(privacy,submitField)}else{form.append(consent,privacy)}
}

const header=document.querySelector('[data-header],.site-header');
const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('.mobile-menu');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=window.matchMedia('(pointer:fine)').matches;

if(header){
  const syncHeader=()=>header.classList.toggle('is-scrolled',window.scrollY>24);
  syncHeader();window.addEventListener('scroll',syncHeader,{passive:true});
}
if(toggle&&menu){
  const closeMenu=()=>{toggle.setAttribute('aria-expanded','false');menu.classList.remove('is-open');document.body.classList.remove('menu-open')};
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));menu.classList.toggle('is-open',!open);document.body.classList.toggle('menu-open',!open)});
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  window.addEventListener('resize',()=>{if(window.innerWidth>900)closeMenu()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
}

const reveals=document.querySelectorAll('.reveal');
if(!reduceMotion&&'IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.1,rootMargin:'0px 0px -24px'});
  reveals.forEach(el=>observer.observe(el));
}else reveals.forEach(el=>el.classList.add('is-visible'));

if(!reduceMotion&&finePointer){
  const transformable=['hero-photo-wrap','subhero-media','about-visual','method-art'];
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    const strength=Number(card.dataset.tiltStrength||7);
    card.addEventListener('pointermove',event=>{const rect=card.getBoundingClientRect();const px=(event.clientX-rect.left)/rect.width;const py=(event.clientY-rect.top)/rect.height;const ry=(px-.5)*strength*2;const rx=(.5-py)*strength*2;card.style.setProperty('--rx',`${rx}deg`);card.style.setProperty('--ry',`${ry}deg`);card.style.setProperty('--x',`${px*100}%`);card.style.setProperty('--y',`${py*100}%`);if(transformable.some(name=>card.classList.contains(name)))card.style.transform=`perspective(1200px) rotateX(${rx*.35}deg) rotateY(${ry*.35}deg)`});
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');if(transformable.some(name=>card.classList.contains(name)))card.style.transform=''})
  });
  document.querySelectorAll('.magnetic').forEach(button=>{button.addEventListener('pointermove',event=>{const rect=button.getBoundingClientRect();button.style.setProperty('--mx',`${(event.clientX-rect.left-rect.width/2)*.14}px`);button.style.setProperty('--my',`${(event.clientY-rect.top-rect.height/2)*.18}px`)});button.addEventListener('pointerleave',()=>{button.style.setProperty('--mx','0px');button.style.setProperty('--my','0px')})});
  const aura=document.querySelector('.cursor-aura');
  if(aura){let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y;window.addEventListener('pointermove',event=>{tx=event.clientX;ty=event.clientY;aura.style.opacity='1'},{passive:true});const tick=()=>{x+=(tx-x)*.12;y+=(ty-y)*.12;aura.style.left=`${x}px`;aura.style.top=`${y}px`;requestAnimationFrame(tick)};tick()}
}

if(form){
  form.addEventListener('submit',event=>{event.preventDefault();const status=form.querySelector('.form-status');if(status)status.textContent='Formulář je připravený. Po doplnění cílového e-mailu ho napojíme na reálné odesílání.'});
}
