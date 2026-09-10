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
ensureStylesheet('assets/css/centered-2026.css?v=20260909f');
ensureStylesheet('assets/css/legal-mobile-2026.css');
ensureStylesheet('assets/css/inspiration-gallery.css?v=20260909b');

const normalizeBrandText=(value='')=>value
  .replace(/Marcela Kiraly/g,'Marcela Király')
  .replace(/\bmyself connection\b/gi,'MY SELF CONNECTION')
  .replace(/\bmy\s+self\s+connection\b/gi,'MY SELF CONNECTION');

const heroTitle=document.querySelector('.hero-copy h1');
if(heroTitle) heroTitle.innerHTML='Pro chvíle,<br>kdy cítíte, že jedna<br>odpověď nestačí.';
const heroLead=document.querySelector('.hero-copy .lead');
if(heroLead) heroLead.textContent='Pochopte a přijměte svůj vlastní příběh. Konstelace pomáhají odhalit souvislosti, které běžně zůstávají skryté. V bezpečném prostoru hledáme nový pohled, větší lehkost a možnost změny.';

document.querySelectorAll('.hero-gallery-card').forEach((card,index)=>{
  card.innerHTML='';
  card.setAttribute('aria-label',`Místo pro budoucí fotografii z konstelace ${index+1}`);
  card.classList.add('is-placeholder');
});

const METHOD_SHORT=`
  <p class="eyebrow">MY SELF CONNECTION</p>
  <h2>Konstelační technika <em>MY SELF CONNECTION</em></h2>
  <p><strong>Jsem konstelátorka, která pracuje s klienty pomocí jedinečné konstelační metody MY SELF CONNECTION od renomované terapeutky a autorky Michaely Bartošové.</strong></p>
  <p>Konstelační technika <strong>MY SELF CONNECTION</strong> (spojení se sebou samým) v rámci konstelační práce představuje specifický přístup zaměřený na vnitřní integraci a obnovu kontaktu s vlastní podstatou.</p>
  <p><strong>Ladí na přítomnost a budoucnost.</strong></p>`;

const METHOD_FULL=METHOD_SHORT+`
  <p>Je navržena tak, aby sloužila jako vysoce efektivní nástroj pro každodenní život a rozhodování. Nastavení jasných, hmatatelných kroků v realitě.</p>
  <div class="method-warning"><h3>Pro koho tato metoda není vhodná?</h3><p>Pro lidi v akutní psychotické krizi, s těžkými psychiatrickými diagnózami nebo pod vlivem návykových látek.</p></div>`;

const path=location.pathname.split('/').pop()||'index.html';
if(path==='index.html' || path===''){
  const method=document.querySelector('.method-copy');
  if(method) method.innerHTML=METHOD_SHORT+'<a class="text-link" href="konstelace.html">Jak metoda funguje <i>↗</i></a>';
  const processTitle=document.querySelector('.process .section-heading h2');
  if(processTitle) processTitle.innerHTML='Tři kroky.<br><em>Bez tlaku na výkon.</em>';
  const aboutTitle=document.querySelector('.profile-home .profile-intro');
  if(aboutTitle) aboutTitle.innerHTML='Držím klientovi<br>bezpečný prostor';
}
if(path==='konstelace.html'){
  const method=document.querySelector('.dark-band .page-copy');
  if(method) method.innerHTML=METHOD_FULL+'<a class="btn btn-outline magnetic" href="kontakt.html"><span>Zeptat se na své téma</span><i>↗</i></a>';
}
if(path==='o-mne.html'){
  const lead=[...document.querySelectorAll('.page-copy .lead')].find(el=>/connection/i.test(el.textContent||''));
  if(lead){
    lead.innerHTML='Jmenuji se Marcela Király a při konstelační práci používám techniku <strong>MY SELF CONNECTION</strong>.';
  }
}

if(document.body){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    if(node.parentElement?.closest('script,style')) return;
    const normalized=normalizeBrandText(node.nodeValue||'');
    if(normalized!==node.nodeValue) node.nodeValue=normalized;
  });
}
document.title=normalizeBrandText(document.title);
document.querySelectorAll('meta[content]').forEach(meta=>meta.setAttribute('content',normalizeBrandText(meta.getAttribute('content')||'')));
document.querySelectorAll('[aria-label],[title],[alt]').forEach(el=>['aria-label','title','alt'].forEach(attr=>{if(el.hasAttribute(attr))el.setAttribute(attr,normalizeBrandText(el.getAttribute(attr)||''))}));

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
  if(img.closest('.hero-gallery')) return;
  const src=img.getAttribute('src')||'';
  const clean=src.split('?')[0];
  const filename=clean.split('/').pop();
  const target=IMAGE_MAP[filename]||filename;
  if(filename&&(src.includes('assets/images/')||IMAGE_MAP[filename])){
    img.src=IMAGE_BASE+target+'?v=20260909f';
    img.addEventListener('error',()=>{if(img.dataset.imageFallback)return;img.dataset.imageFallback='true';img.src=IMAGE_BASE+'hero-konstelace-temp.jpg?v=20260909f'},{once:true});
  }
});

const imageStyle=document.createElement('style');
imageStyle.textContent=`
.hero-gallery-card.is-placeholder{
  min-height:360px!important;
  background:linear-gradient(145deg,rgba(255,255,255,.38),rgba(231,214,228,.52))!important;
  border:1px solid rgba(116,78,127,.18)!important;
  box-shadow:0 22px 50px rgba(78,52,88,.08)!important;
}
.hero-gallery-card.is-placeholder::before{
  content:"";
  position:absolute;
  inset:0;
  background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.55),transparent 55%);
  pointer-events:none;
}
.method-warning{margin-top:20px;padding:0;border:0;border-radius:0;background:transparent!important;color:inherit!important;box-shadow:none!important}
.method-warning h3{margin:0 0 10px;color:inherit!important;font-size:1.15rem}
.method-warning p{margin:0;color:inherit!important}
.visual-story:before{background-image:url('${IMAGE_BASE}constellation-bg-v2.jpg?v=20260909f')!important}
.cta-band{background:linear-gradient(90deg,rgba(76,52,89,.92),rgba(112,75,122,.80)),url('${IMAGE_BASE}constellation-bg-v2.jpg?v=20260909f') center/cover no-repeat!important}
.subhero:before{background:linear-gradient(180deg,rgba(253,249,247,.90),rgba(250,242,244,.78)),url('${IMAGE_BASE}constellation-bg-v2.jpg?v=20260909f') center/cover no-repeat!important}
`;
document.head.appendChild(imageStyle);

const inspirationGrid=document.querySelector('.inspiration-grid');
if(inspirationGrid&&!inspirationGrid.closest('.inspiration-carousel')){
  const cards=[...inspirationGrid.children];
  const carousel=document.createElement('div');
  carousel.className='inspiration-carousel';
  carousel.setAttribute('aria-label','Carousel inspiračních fotografií');
  const viewport=document.createElement('div');
  viewport.className='inspiration-viewport';
  const track=document.createElement('div');
  track.className='inspiration-track';
  const page1=document.createElement('div');
  page1.className='inspiration-page';
  const page2=document.createElement('div');
  page2.className='inspiration-page';
  cards.slice(0,3).forEach(card=>page1.appendChild(card));
  cards.slice(3,6).forEach(card=>page2.appendChild(card));
  track.append(page1,page2);
  viewport.appendChild(track);
  const controls=document.createElement('div');
  controls.className='inspiration-controls';
  controls.innerHTML='<button class="inspiration-arrow inspiration-prev" type="button" aria-label="Předchozí tři fotografie">←</button><div class="inspiration-dots" aria-hidden="true"><span class="inspiration-dot is-active"></span><span class="inspiration-dot"></span></div><button class="inspiration-arrow inspiration-next" type="button" aria-label="Další tři fotografie">→</button>';
  carousel.append(viewport,controls);
  inspirationGrid.replaceWith(carousel);
  let page=0;
  const dots=[...controls.querySelectorAll('.inspiration-dot')];
  const render=()=>{
    track.style.transform=`translateX(-${page*50}%)`;
    dots.forEach((dot,index)=>dot.classList.toggle('is-active',index===page));
    controls.querySelector('.inspiration-prev').disabled=page===0;
    controls.querySelector('.inspiration-next').disabled=page===1;
  };
  controls.querySelector('.inspiration-prev').addEventListener('click',()=>{page=0;render()});
  controls.querySelector('.inspiration-next').addEventListener('click',()=>{page=1;render()});
  render();
}

const footer=document.querySelector('.site-footer,.inner-footer');
if(footer&&!footer.querySelector('.footer-extras')){
  const extras=document.createElement('div');
  extras.className='container footer-extras';
  extras.innerHTML=`<div class="footer-social" aria-label="Sociální sítě"><span class="footer-social-label">Sledujte mě</span><a class="social-link" href="#" data-social-placeholder aria-disabled="true" aria-label="Facebook – odkaz bude doplněn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 22v-8.6h2.9l.43-3.35H13.7V7.91c0-.97.27-1.63 1.66-1.63h1.78V3.29c-.31-.04-1.36-.13-2.59-.13-2.56 0-4.32 1.56-4.32 4.43v2.46H7.33v3.35h2.9V22h3.47Z"/></svg></a><a class="social-link" href="#" data-social-placeholder aria-disabled="true" aria-label="Instagram – odkaz bude doplněn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm-.18 2A3.02 3.02 0 0 0 4 7.02v9.96A3.02 3.02 0 0 0 7.02 20h9.96A3.02 3.02 0 0 0 20 16.98V7.02A3.02 3.02 0 0 0 16.98 4H7.02Zm10.23 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg></a></div><nav class="footer-legal" aria-label="Právní informace"><a href="ochrana-osobnich-udaju.html">Ochrana osobních údajů</a><a href="cookies.html">Cookies</a><a href="marketingovy-souhlas.html">Marketingový souhlas</a><a href="obchodni-podminky.html">Obchodní podmínky</a></nav><p class="footer-business-note">Provozovatel: Marcela Király · IČO, sídlo, e-mail a telefon budou doplněny před ostrým spuštěním webu.</p>`;
  const bottom=footer.querySelector('.inner-footer-bottom,.footer-bottom');
  if(bottom) footer.insertBefore(extras,bottom); else footer.appendChild(extras);
}
document.querySelectorAll('[data-social-placeholder]').forEach(link=>link.addEventListener('click',event=>event.preventDefault()));

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
if(header){const syncHeader=()=>header.classList.toggle('is-scrolled',window.scrollY>24);syncHeader();window.addEventListener('scroll',syncHeader,{passive:true})}
if(toggle&&menu){const closeMenu=()=>{toggle.setAttribute('aria-expanded','false');menu.classList.remove('is-open');document.body.classList.remove('menu-open')};toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));menu.classList.toggle('is-open',!open);document.body.classList.toggle('menu-open',!open)});menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));window.addEventListener('resize',()=>{if(window.innerWidth>900)closeMenu()});document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()})}
const reveals=document.querySelectorAll('.reveal');if(!reduceMotion&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.1,rootMargin:'0px 0px -24px'});reveals.forEach(el=>observer.observe(el))}else reveals.forEach(el=>el.classList.add('is-visible'));
if(!reduceMotion&&finePointer){document.querySelectorAll('.magnetic').forEach(button=>{button.addEventListener('pointermove',event=>{const rect=button.getBoundingClientRect();button.style.setProperty('--mx',`${(event.clientX-rect.left-rect.width/2)*.14}px`);button.style.setProperty('--my',`${(event.clientY-rect.top-rect.height/2)*.18}px`)});button.addEventListener('pointerleave',()=>{button.style.setProperty('--mx','0px');button.style.setProperty('--my','0px')})})}
if(form){form.addEventListener('submit',event=>{event.preventDefault();const status=form.querySelector('.form-status');if(status)status.textContent='Formulář je připravený. Po doplnění cílového e-mailu ho napojíme na reálné odesílání.'})}