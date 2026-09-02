/**
 * ============================================================================
 * Site behavior: renders content.js into the page, handles nav, scroll
 * animations, and the Formspree contact form submission.
 * No layout/text edits belong in this file — edit content.js instead.
 * ============================================================================
 */

// Minimal inline icon set used by service cards. Keys map to SITE_CONTENT.services.items[].icon
const ICONS = {
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15M12 21v-9a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v9M4 21h16M8 8h.01M8 12h.01M8 16h.01M16 12h.01M16 16h.01"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10M12 20V4M20 20v-7"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2h9l5 5v15H6V2z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>',
};

document.addEventListener('DOMContentLoaded', () => {
  renderContent();
  initHeaderScroll();
  initMobileNav();
  initSmoothScrollActiveLink();
  initScrollReveal();
  initContactForm();
});

function renderContent() {
  const c = window.SITE_CONTENT;
  if (!c) return;

  // Brand / nav
  document.title = c.site.companyName;
  setText('brand-name', c.site.companyName);
  setText('footer-brand', c.footer.companyName);
  setText('footer-tagline', c.footer.tagline);
  setText('footer-copyright', `© ${c.footer.year} ${c.footer.companyName}. ${c.footer.copyrightText}`);

  const navLinks = document.getElementById('nav-links');
  navLinks.innerHTML = c.nav.map(item =>
    `<li><a href="${item.target}" data-target="${item.target}">${item.label}</a></li>`
  ).join('');

  // Hero
  setText('hero-company-name', c.site.companyName);
  setText('hero-tagline', c.site.tagline);
  setText('hero-subtext', c.site.heroSubtext);
  const cta = document.getElementById('hero-cta');
  cta.textContent = c.site.ctaText;
  cta.setAttribute('href', c.site.ctaTarget);

  // About
  setText('about-heading', c.about.heading);
  document.getElementById('about-paragraphs').innerHTML =
    c.about.paragraphs.map(p => `<p class="reveal">${p}</p>`).join('');
  document.getElementById('about-stats').innerHTML =
    c.about.stats.map(s => `
      <div class="stat reveal">
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>`).join('');

  // Services
  setText('services-heading', c.services.heading);
  setText('services-subheading', c.services.subheading);
  document.getElementById('services-grid').innerHTML =
    c.services.items.map(item => `
      <div class="service-card reveal">
        <div class="service-icon">${ICONS[item.icon] || ICONS.file}</div>
        <h3 class="service-title">${item.title}</h3>
        <p class="service-description">${item.description}</p>
      </div>`).join('');

  // Contact
  setText('contact-heading', c.contact.heading);
  setText('contact-subheading', c.contact.subheading);
  document.getElementById('contact-address').innerHTML =
    [c.contact.address.line1, c.contact.address.line2, c.contact.address.line3]
      .filter(Boolean).join('<br>');

  const phoneEl = document.getElementById('contact-phone');
  phoneEl.textContent = c.contact.phone;
  phoneEl.href = `tel:${c.contact.phone.replace(/[^\d+]/g, '')}`;

  // Email is optional — hide the row on the page until content.js has one
  document.getElementById('contact-email-item').hidden = !c.contact.email;
  document.getElementById('footer-email').hidden = !c.contact.email;
  if (c.contact.email) {
    const emailEl = document.getElementById('contact-email');
    emailEl.textContent = c.contact.email;
    emailEl.href = `mailto:${c.contact.email}`;

    const footerEmail = document.getElementById('footer-email');
    footerEmail.textContent = c.contact.email;
    footerEmail.href = `mailto:${c.contact.email}`;
  }

  const footerPhone = document.getElementById('footer-phone');
  footerPhone.textContent = c.contact.phone;
  footerPhone.href = `tel:${c.contact.phone.replace(/[^\d+]/g, '')}`;

  if (c.contact.showMap && c.contact.mapEmbedUrl) {
    document.getElementById('contact-map-wrap').hidden = false;
    document.getElementById('contact-map').src = c.contact.mapEmbedUrl;
  }

  // Form endpoint
  document.getElementById('contact-form').setAttribute('action', c.contact.formEndpoint);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function initHeaderScroll() {
  const header = document.getElementById('site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initSmoothScrollActiveLink() {
  const links = Array.from(document.querySelectorAll('#nav-links a'));
  const sections = links
    .map(link => document.querySelector(link.getAttribute('data-target')))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = `#${entry.target.id}`;
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('data-target') === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => observer.observe(item));
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const endpoint = form.getAttribute('action');
    if (!endpoint || endpoint.includes('YOUR_FORM_ID')) {
      status.textContent = 'Form is not yet configured — set your Formspree endpoint in content.js.';
      status.className = 'form-status error';
      return;
    }

    submitBtn.disabled = true;
    status.textContent = 'Sending...';
    status.className = 'form-status';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });

      if (response.ok) {
        status.textContent = 'Thank you — your message has been sent.';
        status.className = 'form-status success';
        form.reset();
      } else {
        status.textContent = 'Something went wrong. Please try again or email us directly.';
        status.className = 'form-status error';
      }
    } catch (err) {
      status.textContent = 'Network error. Please try again or email us directly.';
      status.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
    }
  });
}
