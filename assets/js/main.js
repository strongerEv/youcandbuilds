/* =========================================================
   Youcanbuild — interaksi halaman utama
   ========================================================= */

// Ganti dengan nomor WhatsApp bisnis (format internasional, tanpa "+")
const WA_NUMBER = "6285177421890";
const WA_MESSAGE = "Halo Youcanbuild, saya ingin konsultasi pembuatan website/aplikasi.";

document.addEventListener("DOMContentLoaded", () => {
  setupWhatsAppLinks();
  setupNavbar();
  setupHeroSlider();
  setupDesignFilter();
  setupGallery();
  setupReveal();
  document.getElementById("year").textContent = new Date().getFullYear();
});

function setupWhatsAppLinks() {
  if (!WA_NUMBER) return;
  document.querySelectorAll(".js-wa").forEach((a) => {
    // data-wa berisi pesan khusus, misalnya dari kartu hasil karya
    const text = a.dataset.wa || WA_MESSAGE;
    a.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });
}

/* ---------- Navbar ---------- */
function setupNavbar() {
  const navbar = document.getElementById("navbar");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  const dropdown = menu.querySelector(".navbar__dropdown");
  const dropdownBtn = dropdown.querySelector(".navbar__dropdown-btn");

  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));

  dropdownBtn.addEventListener("click", () => {
    const open = dropdown.classList.toggle("is-open");
    dropdownBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove("is-open");
  });

  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  const onScroll = () => navbar.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Tandai tab aktif sesuai section yang sedang terlihat
  const links = [...menu.querySelectorAll(":scope > a[href^='#']")];
  const sections = links.map((l) => document.querySelector(l.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));
}

/* ---------- Hero slider: otomatis + geser manual ---------- */
function setupHeroSlider() {
  const slider = document.getElementById("heroSlider");
  const track = slider.querySelector(".slider__track");
  const slides = [...track.children];
  const dotsWrap = document.getElementById("heroDots");
  const counter = document.getElementById("heroCount");
  const total = slides.length;
  const INTERVAL = 5000;
  let index = 0;
  let timer = null;

  const pad = (n) => String(n).padStart(2, "0");

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.className = "slider__dot";
    dot.setAttribute("aria-label", `Ke slide ${i + 1}`);
    dot.addEventListener("click", () => { goTo(i); restart(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(i) {
    index = (i + total) % total;
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, n) => d.classList.toggle("is-active", n === index));
    slides.forEach((s, n) => s.setAttribute("aria-hidden", String(n !== index)));
    counter.textContent = `${pad(index + 1)} / ${pad(total)}`;
  }
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  function start() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stop();
    timer = setInterval(next, INTERVAL);
  }
  function stop() { clearInterval(timer); timer = null; }
  function restart() { start(); }

  slider.querySelector(".slider__arrow--next").addEventListener("click", () => { next(); restart(); });
  slider.querySelector(".slider__arrow--prev").addEventListener("click", () => { prev(); restart(); });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  slider.tabIndex = 0;
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { next(); restart(); }
    if (e.key === "ArrowLeft") { prev(); restart(); }
  });

  // Geser manual: sentuh (HP) maupun drag mouse (desktop)
  let startX = 0;
  let deltaX = 0;
  let dragging = false;

  slider.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".slider__arrow")) return;
    dragging = true;
    startX = e.clientX;
    deltaX = 0;
    slider.classList.add("is-dragging");
    slider.setPointerCapture(e.pointerId);
    stop();
  });
  slider.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    deltaX = e.clientX - startX;
    // efek "karet" di slide pertama/terakhir
    const atEdge = (index === 0 && deltaX > 0) || (index === total - 1 && deltaX < 0);
    const offset = atEdge ? deltaX * 0.35 : deltaX;
    track.style.transform = `translateX(calc(${-index * 100}% + ${offset}px))`;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    slider.classList.remove("is-dragging");
    const threshold = slider.offsetWidth * 0.12;
    if (deltaX < -threshold) next();
    else if (deltaX > threshold) prev();
    else goTo(index);
    start();
  };
  slider.addEventListener("pointerup", endDrag);
  slider.addEventListener("pointercancel", endDrag);

  goTo(0);
  start();
}

/* ---------- Filter koleksi desain ---------- */
function setupDesignFilter() {
  const chips = document.querySelectorAll("#designFilter .chip");
  const cards = document.querySelectorAll("#designGrid .design");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.toggle("is-active", c === chip));
      const f = chip.dataset.filter;
      cards.forEach((card) => card.classList.toggle("is-hidden", f !== "all" && card.dataset.cat !== f));
    })
  );
}

/* ---------- Galeri tampilan proyek (lightbox) ---------- */
function setupGallery() {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lbImg");
  const title = document.getElementById("lbTitle");
  const count = document.getElementById("lbCount");
  const thumbs = document.getElementById("lbThumbs");
  let images = [];
  let index = 0;
  let lastFocus = null;

  function show(i) {
    index = (i + images.length) % images.length;
    img.src = images[index];
    img.alt = `${title.textContent} — tampilan ${index + 1}`;
    count.textContent = `${index + 1} / ${images.length}`;
    [...thumbs.children].forEach((t, n) => t.classList.toggle("is-active", n === index));
  }

  function open(trigger) {
    const slug = trigger.dataset.gallery;
    const total = Number(trigger.dataset.count) || 1;
    images = Array.from({ length: total }, (_, i) => `assets/img/karya/${slug}-${i + 1}.webp`);
    title.textContent = trigger.dataset.title;
    thumbs.innerHTML = "";
    images.forEach((src, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Tampilan ${i + 1}`);
      b.innerHTML = `<img src="${src}" alt="" loading="lazy" />`;
      b.addEventListener("click", () => show(i));
      thumbs.appendChild(b);
    });
    box.querySelectorAll(".lightbox__nav").forEach((n) => (n.hidden = images.length < 2));
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.classList.add("no-scroll");
    show(0);
    box.querySelector(".lightbox__close").focus();
  }

  function close() {
    box.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll(".js-gallery").forEach((el) => el.addEventListener("click", () => open(el)));
  box.querySelector(".lightbox__close").addEventListener("click", close);
  box.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(index - 1));
  box.querySelector(".lightbox__nav--next").addEventListener("click", () => show(index + 1));
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(index + 1);
    if (e.key === "ArrowLeft") show(index - 1);
  });

  // geser di HP
  let startX = 0;
  img.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  img.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
  });
}

/* ---------- Animasi muncul saat scroll ---------- */
function setupReveal() {
  const items = document.querySelectorAll(".section__head, .card, .stats, .about__text, .about__media, .cta");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add("is-visible");
          io.unobserve(el);
          // lepas kelas animasi agar efek hover kartu kembali normal
          setTimeout(() => el.classList.remove("reveal", "is-visible"), 700);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
}
