/* ==========
  Shared helpers
========== */
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function setAriaCurrentForNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  const allLinks = $all('a[data-nav]');
  allLinks.forEach(a => a.removeAttribute("aria-current"));

  // Match either exact page or (index.html for root)
  allLinks.forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;
    const hrefPage = href.split("#")[0];
    if (hrefPage === "" && path === "index.html") a.setAttribute("aria-current", "page");
    if (hrefPage === path) a.setAttribute("aria-current", "page");
  });
}

function initMobileMenu() {
  const btn = $("#mobileToggle");
  const panel = $("#mobilePanel");
  if (!btn || !panel) return;

  btn.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu after click
  $all("#mobilePanel a").forEach(a => {
    a.addEventListener("click", () => {
      panel.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  });
}

function initThemeToggle() {
  const btn = $("#themeToggle");
  if (!btn) return;

  const saved = localStorage.getItem("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

/* ==========
  Home page scrollspy (for in-page anchors like #about)
========== */
function initSectionScrollSpy() {
  const spyRoot = document.body;
  const sections = $all("main .section[id]");
  if (!sections.length) return;

  const map = new Map();
  $all('a[href^="#"]').forEach(a => {
    const id = a.getAttribute("href").slice(1);
    if (id) map.set(id, a);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      // Optional: highlight the matching in-page link (only if on index)
      map.forEach(link => link.classList.remove("active"));
      const link = map.get(id);
      if (link) link.classList.add("active");
    });
  }, { root: null, threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}

/* ==========
  Project page: auto TOC + TOC scrollspy
  Add: <aside class="toc" data-toc></aside> and headings inside <article>
========== */
function initAutoTOC() {
  const toc = $('[data-toc]');
  const article = $("article");
  if (!toc || !article) return;

  const headings = $all("h2[id]", article); // only top-level sections
  if (!headings.length) return;

  toc.innerHTML = `
    <h3>On this page</h3>
    <nav aria-label="Table of contents">
      ${headings.map(h => {
        const level = h.tagName.toLowerCase();
        const indent = level === "h3" ? 'style="margin-left:12px"' : "";
        return `<a ${indent} href="#${h.id}">${h.textContent}</a>`;
      }).join("")}
    </nav>
  `;

  const links = $all("a", toc);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
    });
  }, { threshold: 0.4 });

  headings.forEach(h => obs.observe(h));
}

/* ==========
  Back-to-top button
========== */
function initBackToTop() {
  const btn = $("#backToTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 700);
  });

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ==========
  Proto slider (Prototyping gallery)
========== */
function initProtoSlider() {
  const carousels = $all(".proto-carousel");
  if (!carousels.length) return;

  carousels.forEach(carousel => {
    const windowEl = carousel.querySelector(".proto-slider-window");
    const prev = carousel.querySelector(".proto-nav.prev");
    const next = carousel.querySelector(".proto-nav.next");
    if (!windowEl || !prev || !next) return;

    const step = () => windowEl.clientWidth * 0.95;
    prev.addEventListener("click", () => windowEl.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => windowEl.scrollBy({ left: step(), behavior: "smooth" }));
  });
}

/* ==========
  Run
========== */
document.addEventListener("DOMContentLoaded", () => {
  setAriaCurrentForNav();
  initMobileMenu();
  initThemeToggle();
  initSectionScrollSpy();
  initAutoTOC();
  initBackToTop();
   initProtoSlider();
});
