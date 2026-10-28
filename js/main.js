import { createBottle } from './bottle.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isPhone = () => matchMedia('(max-width: 767px)').matches;
const WA = '18687248356';
const PRICE = 10;
const PACKS = { 1: 'Single bottle', 6: 'Six pack', 12: 'Twelve pack', 24: 'Full case (24)' };
const money = (n) => 'TT$' + n.toLocaleString('en-TT');

/* ---------------- theme ---------------- */
const themeBtn = $('#themeBtn');
function paintThemeIcon() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeBtn.innerHTML = `<i class="ph-light ${dark ? 'ph-sun' : 'ph-moon'}"></i>`;
  $('meta[name="theme-color"]').content = dark ? '#0b1120' : '#eef3f2';
}
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('ms-theme', next); } catch (e) {}
  paintThemeIcon();
});
paintThemeIcon();

/* ---------------- smooth scroll ---------------- */
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);
let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function goTo(hash) {
  const el = $(hash);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: hash === '#top' ? 0 : -70, duration: 1.4 });
  else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const h = a.getAttribute('href');
  if (h.length < 2) return;
  e.preventDefault(); closeMenu(); goTo(h);
}));

/* ---------------- nav + mobile menu ---------------- */
const nav = $('.nav'), burger = $('#burger'), menu = $('#menu');
function closeMenu() {
  menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true');
  burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu');
  lenis && lenis.start();
}
burger.addEventListener('click', () => {
  const open = !menu.classList.contains('open');
  if (!open) return closeMenu();
  menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false');
  burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Close menu');
  lenis && lenis.stop();
});
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: (self) => nav.classList.toggle('hide', self.direction === 1 && self.scroll() > 500 && !menu.classList.contains('open')),
});

/* ---------------- entry reveals ---------------- */
const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
$$('.fade-up').forEach((el, i) => { el.style.transitionDelay = (0.35 + i * 0.1) + 's'; io.observe(el); });
if (!reduce) {
  gsap.utils.toArray('.sec-title, .graph-head, .shop-panel > *, .pan-intro, .steps li, .partner, .final-copy, .foot-grid > div').forEach((el) => {
    gsap.from(el, { y: 50, opacity: 0, filter: 'blur(8px)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  ScrollTrigger.batch('.cell', {
    start: 'top 88%',
    onEnter: (els) => gsap.from(els, { y: 60, scale: 0.96, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }),
    once: true,
  });
  gsap.from('.shop-visual', { scale: 0.9, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.shop', start: 'top 75%' } });
  gsap.to('.hero-frame img', { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.final-bg img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ---------------- manifesto word scrub ---------------- */
const manifesto = $('#manifesto');
const words = [];
[...manifesto.childNodes].forEach((n) => {
  if (n.nodeType !== 3) { words.push(n); n.classList.add('w'); return; }
  const frag = document.createDocumentFragment();
  n.textContent.split(/(\s+)/).forEach((t) => {
    if (!t) return;
    if (/^\s+$/.test(t)) { frag.append(' '); return; }
    const s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.append(s); words.push(s);
  });
  n.replaceWith(frag);
});
ScrollTrigger.create({
  trigger: manifesto, start: 'top 80%', end: 'bottom 45%', scrub: true,
  onUpdate: (self) => {
    const lit = Math.round(self.progress * words.length);
    words.forEach((w, i) => { w.style.opacity = i < lit ? 1 : 0.14; });
  },
});

/* ---------------- spring vs RO graph ---------------- */
const lines = $$('.g-line').map((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return p; });
const numS = $('#numSpring'), numR = $('#numRo');
const g = { p: 0 };
const graphTl = gsap.timeline({
  defaults: { ease: 'none' },
  onUpdate: () => {
    numS.textContent = Math.round(g.p * 100);
    const ro = 100 - g.p * 90;
    numR.textContent = g.p >= 0.999 ? '<10' : Math.round(ro);
  },
})
  .to(lines, { strokeDashoffset: 0, duration: 1 }, 0)
  .to(g, { p: 1, duration: 1 }, 0)
  .to('.g-area', { opacity: 1, duration: 0.3 }, 0.6)
  .to('.g-dot', { scale: 1, duration: 0.15, stagger: 0.05 }, 0.88);
const mm = gsap.matchMedia();
mm.add('(min-width: 768px)', () => {
  ScrollTrigger.create({ trigger: '.graph-pin', start: 'center center', end: '+=110%', pin: true, scrub: 0.6, animation: graphTl });
});
mm.add('(max-width: 767px)', () => {
  ScrollTrigger.create({ trigger: '.graph-card', start: 'top 80%', end: 'bottom 55%', scrub: 0.6, animation: graphTl });
});

/* ---------------- lab counters ---------------- */
$$('.big[data-count]').forEach((el) => {
  const target = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
  const o = { v: 0 };
  ScrollTrigger.create({
    trigger: el, start: 'top 90%', once: true,
    onEnter: () => gsap.to(o, { v: target, duration: reduce ? 0 : 1.6, ease: 'expo.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } }),
  });
});
ScrollTrigger.create({ trigger: '.ph-scale', start: 'top 92%', once: true, onEnter: () => gsap.to('.ph-mark', { scale: 1, duration: 0.8, ease: 'back.out(2)', delay: 0.4 }) });

/* ---------------- horizontal pan (desktop only; phones get native swipe) ---------------- */
mm.add('(min-width: 768px)', () => {
  if (reduce) return;
  const track = $('#panTrack');
  const dist = () => track.scrollWidth - innerWidth;
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.pan', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
});

/* ---------------- 3D bottle director ---------------- */
const canvas = $('#bottle3d');
const shopImg = $('#shopBottle');
shopImg.classList.add('photo');
let bottle = null;
const heroMedia = $('.hero-media'), story = $('.story');
const st = { blend: 0, story: 0 };
ScrollTrigger.create({ trigger: story, start: 'top bottom', end: 'top top', scrub: true, onUpdate: (s) => { st.blend = s.progress; } });
ScrollTrigger.create({ trigger: story, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (s) => { st.story = s.progress; } });

const steps = $$('.step'), bar = $('.story-progress span');
const ease = (t) => t * t * (3 - 2 * t);
function worldFromRect(r) {
  const vh = 2 * 13 * Math.tan((15 * Math.PI) / 180), vw = vh * (innerWidth / innerHeight);
  return {
    x: ((r.left + r.width / 2) / innerWidth - 0.5) * vw,
    y: -((r.top + r.height / 2) / innerHeight - 0.5) * vh,
    s: (r.height / innerHeight) * vh / 4.4 * (isPhone() ? 0.66 : 0.92),
  };
}
function direct() {
  requestAnimationFrame(direct);
  const p = st.story;
  steps.forEach((el, i) => {
    const local = p * 3 - i;
    let o = local < 0 ? 0 : local < 0.18 ? local / 0.18 : local < 0.82 ? 1 : local < 1 ? (1 - local) / 0.18 : 0;
    if (i === 2 && local >= 0.82) o = 1;       // keep last fact up until the next section covers it
    if (i === 0 && local < 0 && st.blend > 0.9) o = (st.blend - 0.9) * 10;
    el.style.opacity = o;
    el.style.translate = `0 ${(1 - o) * 24}px`;
  });
  bar.style.transform = `scaleX(${p})`;
  if (!bottle) return;
  const live = story.getBoundingClientRect().bottom > 0;
  bottle.setActive(live);
  if (!live) return;
  const a = worldFromRect(heroMedia.getBoundingClientRect());
  const phone = isPhone();
  const vh = 2 * 13 * Math.tan((15 * Math.PI) / 180);
  const center = phone ? { x: 0, y: vh * 0.14, s: 0.98 } : { x: 0, y: -0.05, s: 1.2 };
  const b = ease(st.blend);
  const sway = phone ? 0 : Math.cos(Math.min(Math.max(p * 3 - 0.5, 0), 2) * Math.PI) * 0.9 * Math.min(1, p * 6);
  const s = bottle.state;
  s.x = a.x + (center.x + sway - a.x) * b;
  s.y = a.y + (center.y - a.y) * b;
  s.s = a.s + (center.s - a.s) * b;
  // a full turn between facts, easing to a front-facing stop on each one
  const q = Math.min(Math.max(p * 3 - 0.5, 0), 2), k = Math.floor(q);
  s.ry = -0.2 * (1 - b) + Math.PI * 2 * (k + ease(ease(q - k)));
  s.rz = (1 - b) * 0.06;
  s.shadow = 0.25 + b * 0.75;
}
direct();

createBottle(canvas).then((api) => {
  bottle = api;
  canvas.classList.add('on');
  const url = api.snapshot(600, 900);
  shopImg.src = url; shopImg.classList.remove('photo');
  productImg = url; renderCart();
}).catch((err) => {
  console.warn('3D bottle unavailable', err);
  canvas.remove();
});

/* ---------------- shop + cart ---------------- */
let productImg = 'img/splash.webp';
let cart = [];
try { cart = JSON.parse(localStorage.getItem('ms-cart') || '[]'); } catch (e) { cart = []; }
const save = () => { try { localStorage.setItem('ms-cart', JSON.stringify(cart)); } catch (e) {} };
let qty = 1;
const qtyOut = $('#qty'), lineTotal = $('#lineTotal');
const pack = () => +$('input[name="pack"]:checked').value;
function updateBuy() { qtyOut.textContent = qty; lineTotal.textContent = money(pack() * PRICE * qty); }
$('#qtyMinus').addEventListener('click', () => { qty = Math.max(1, qty - 1); updateBuy(); });
$('#qtyPlus').addEventListener('click', () => { qty = Math.min(50, qty + 1); updateBuy(); });
$$('input[name="pack"]').forEach((r) => r.addEventListener('change', updateBuy));
updateBuy();

const toast = $('#toast');
let toastT;
function say(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2400); }

$('#addBtn').addEventListener('click', () => {
  const k = pack();
  const hit = cart.find((l) => l.pack === k);
  hit ? (hit.qty += qty) : cart.push({ pack: k, qty });
  save(); renderCart();
  const cb = $('#cartBtn'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump');
  say(`${qty} × ${PACKS[k]} added`);
  qty = 1; updateBuy();
});

const linesEl = $('#lines'), emptyEl = $('#empty'), footEl = $('#cartFoot');
const total = () => cart.reduce((t, l) => t + l.pack * PRICE * l.qty, 0);
const bottles = () => cart.reduce((t, l) => t + l.pack * l.qty, 0);
function renderCart() {
  $('#cartCount').textContent = bottles();
  const has = cart.length > 0;
  emptyEl.hidden = has; footEl.hidden = !has; linesEl.hidden = !has;
  linesEl.innerHTML = cart.map((l, i) => `
    <li class="line">
      <div class="line-img"><img src="${productImg}" alt=""></div>
      <div><b>${PACKS[l.pack]}</b><small>${l.pack * l.qty} bottles, 500ml</small>
        <div class="line-ctrl"><button data-dec="${i}" aria-label="Fewer"><i class="ph-light ph-minus"></i></button><span>${l.qty}</span><button data-inc="${i}" aria-label="More"><i class="ph-light ph-plus"></i></button></div></div>
      <div class="line-price">${money(l.pack * PRICE * l.qty)}<button class="line-remove" data-rm="${i}">Remove</button></div>
    </li>`).join('');
  $('#subtotal').textContent = money(total());
  $('#checkoutTotal').textContent = money(total());
}
linesEl.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.inc) cart[+b.dataset.inc].qty++;
  if (b.dataset.dec) { const l = cart[+b.dataset.dec]; l.qty--; if (l.qty < 1) cart.splice(+b.dataset.dec, 1); }
  if (b.dataset.rm) cart.splice(+b.dataset.rm, 1);
  save(); renderCart();
});
renderCart();

/* drawer */
const drawer = $('#drawer'), scrim = $('#scrim');
const views = { cart: $('#viewCart'), checkout: $('#viewCheckout'), done: $('#viewDone') };
function show(v) {
  Object.entries(views).forEach(([k, el]) => { el.hidden = k !== v; });
  $('#drawerTitle').textContent = v === 'checkout' ? 'Checkout' : v === 'done' ? 'Thank you' : 'Your cart';
}
function openDrawer(v = 'cart') {
  show(v); drawer.classList.add('open'); scrim.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
  lenis && lenis.stop(); document.body.style.overflow = 'hidden';
  setTimeout(() => $('#closeDrawer').focus(), 300);
}
function closeDrawer() {
  drawer.classList.remove('open'); scrim.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
  lenis && lenis.start(); document.body.style.overflow = '';
}
$('#cartBtn').addEventListener('click', () => openDrawer());
$('#closeDrawer').addEventListener('click', closeDrawer);
scrim.addEventListener('click', closeDrawer);
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDrawer(); closeMenu(); } });
$$('[data-close]').forEach((b) => b.addEventListener('click', () => { closeDrawer(); goTo('#shop'); }));
$('#toCheckout').addEventListener('click', () => show('checkout'));
$('#backToCart').addEventListener('click', () => show('cart'));

// swipe the phone sheet down to close
let y0 = null;
drawer.addEventListener('touchstart', (e) => { if (e.target.closest('.drawer-head, .drawer-grip')) y0 = e.touches[0].clientY; }, { passive: true });
drawer.addEventListener('touchend', (e) => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 70) closeDrawer(); y0 = null; }, { passive: true });

/* checkout */
const form = $('#viewCheckout');
const addrField = $('#addrField');
form.addEventListener('change', (e) => {
  if (e.target.name === 'ship') addrField.hidden = e.target.value !== 'Delivery';
  if (e.target.name === 'pay') $('#payNote').textContent = e.target.value === 'Cash on delivery'
    ? 'Pay the driver in cash when your water arrives.'
    : 'Secure card checkout goes live at launch. For this demo, your order is sent on WhatsApp.';
});
form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('bad'));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const need = ['fName', 'fPhone'];
  if (data.get('ship') === 'Delivery') need.push('fAddr');
  let ok = true;
  need.forEach((id) => {
    const el = $('#' + id);
    const bad = id === 'fPhone' ? el.value.replace(/\D/g, '').length < 7 : !el.value.trim();
    el.closest('.field').classList.toggle('bad', bad);
    if (bad && ok) { el.focus(); ok = false; }
  });
  if (!ok) return;
  const msg = [
    'New Maracas Springs order',
    ...cart.map((l) => `- ${l.qty} x ${PACKS[l.pack]} (${l.pack * l.qty} bottles) = ${money(l.pack * PRICE * l.qty)}`),
    `Total: ${money(total())} for ${bottles()} bottles`,
    `Name: ${data.get('name')}`,
    `Phone: ${data.get('phone')}`,
    `${data.get('ship')}${data.get('ship') === 'Delivery' ? ': ' + data.get('addr') : ''}`,
    `Payment: ${data.get('pay')}`,
  ].join('\n');
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  cart = []; save(); renderCart(); form.reset(); addrField.hidden = false;
  show('done');
});

addEventListener('load', () => ScrollTrigger.refresh());
