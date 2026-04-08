/* ============================================================
   MAX KRATCOSKI — main.js
   ============================================================ */

/* ── NAV: scroll shrink + hamburger ─────────────────────────── */
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ── SCROLL ANIMATIONS ───────────────────────────────────────── */
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-anim]').forEach(el => animObserver.observe(el));

/* ── ACTIVE NAV DOT (if using side nav) ─────────────────────── */
const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.sidenav-dot').forEach(dot => {
        dot.classList.toggle('active', dot.dataset.section === entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ── GALLERY SYSTEM ──────────────────────────────────────────── */

/*
  To add a new card:
  1. Open assets/gallery-data.json
  2. Add a new object to the array following the existing format
  3. Save — that's it. No JS changes needed.

  Supported types:
    "craft"  — img (optional), meta array, desc
    "book"   — author, rating (1–5), desc
    "travel" — img (optional), meta array, desc

  Fields:
    id       — unique string, e.g. "my-new-book"
    type     — "craft" | "book" | "travel"
    tag      — label shown on card and in modal, e.g. "Reading · 2026"
    title    — card and modal title
    img      — path relative to site root, e.g. "assets/images/photo.jpg" — or null
    bg       — fallback hex color if no img, e.g. "#A8B8A0"
    meta     — array of short strings shown as pills, e.g. ["Cotton", "~2 hrs"]
    author   — (book only) author name
    rating   — (book only) integer 1–5
    desc     — one to three sentences shown in the modal
*/

const GALLERY_DATA_URL = 'assets/gallery-data.json';

function buildGalleryCard(item) {
  const card = document.createElement('div');
  card.className = 'gcard';
  card.setAttribute('data-anim', '');
  card.addEventListener('click', () => openModal(item));

  const imgHTML = item.img
    ? `<img src="${item.img}" alt="${item.title}" />`
    : '';

  card.innerHTML = `
    <div class="gcard-img" style="background:${item.bg}">
      ${imgHTML}
    </div>
    <div class="gcard-footer">
      <div class="gcard-tag">${item.tag}</div>
      <div class="gcard-name">${item.title}</div>
    </div>
  `;

  return card;
}

function buildModalHTML(item) {
  if (item.type === 'book') {
    const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
    const coverImg = (item.cover || item.img)
  ? `<img src="${item.cover || item.img}" alt="${item.title}" style="width:100%;height:auto;display:block;border-radius:5px;" />`
  : '';
    return `
      <div class="modal-book-layout">
        <div class="modal-book-cover" style="background:${item.bg}">${coverImg}</div>
        <div class="modal-book-info">
          <div class="modal-eyebrow">${item.tag}</div>
          <div class="modal-title">${item.title}</div>
          <div class="modal-author">${item.author}</div>
          <div class="modal-stars">${stars}</div>
          <div class="modal-desc">${item.desc}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-close" onclick="closeModal()">close</button>
      </div>
    `;
  }

  // craft and travel share the same layout
  const heroHTML = item.img
    ? `<img class="modal-hero-img" src="${item.img}" alt="${item.title}" />`
    : `<div class="modal-hero-placeholder" style="background:${item.bg}"></div>`;

  const metaHTML = (item.meta || [])
    .map(m => `<span class="modal-pill">${m}</span>`)
    .join('');

  return `
    ${heroHTML}
    <div class="modal-body">
      <div class="modal-eyebrow">${item.tag}</div>
      <div class="modal-title">${item.title}</div>
      ${metaHTML ? `<div class="modal-meta">${metaHTML}</div>` : ''}
      <div class="modal-desc">${item.desc}</div>
      <button class="modal-close" onclick="closeModal()">close</button>
    </div>
  `;
}

function openModal(item) {
  const modal = document.getElementById('gallery-modal');
  const overlay = document.getElementById('gallery-overlay');
  modal.innerHTML = buildModalHTML(item);
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('gallery-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// Close on overlay background click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('gallery-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Fetch data and build gallery
fetch(GALLERY_DATA_URL)
  .then(res => {
    if (!res.ok) throw new Error('Could not load gallery-data.json');
    return res.json();
  })
  .then(items => {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    items.forEach(item => {
      const card = buildGalleryCard(item);
      grid.appendChild(card);
      // observe new cards for scroll animation
      animObserver.observe(card);
    });
  })
  .catch(err => {
    console.warn('Gallery failed to load:', err.message);
  });
