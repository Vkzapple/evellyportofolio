// =====================================================================
//  evellyCom — front-end
//  Konten sudah diprerender oleh tools/build.js (SSG), script ini hanya
//  menghidrasi ulang dari data/*.json supaya perubahan CMS langsung
//  tampil tanpa menunggu build.
// =====================================================================

import {
  projectCards,
  experiencesBlock,
  awardsBlock,
  writingCards,
} from "./assets/render.js";

// ================= MATRIX EFFECT =================
const canvas = document.getElementById("matrixCanvas");
if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const letters = "EVELLY".split("");
  const fontSize = 18;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = letters[Math.floor(Math.random() * letters.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  const timer = setInterval(draw, 50);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(timer);
  });

  window.addEventListener("resize", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  });
}

// ================= TYPING EFFECT =================
const typingTarget = document.getElementById("typing-text");
if (typingTarget) {
  const sentences = [
    "I'm obsessed with learning and exploring new technologies",
    "I love bringing ideas to life",
    "Passionate about AI, Data Science, IoT, and Web Development",
  ];

  let sentenceIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentSentence = sentences[sentenceIndex];
    typingTarget.textContent = isDeleting
      ? currentSentence.substring(0, charIndex--)
      : currentSentence.substring(0, charIndex++);

    if (!isDeleting && charIndex === currentSentence.length + 1) {
      isDeleting = true;
      setTimeout(typeEffect, 1500);
      return;
    }
    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      sentenceIndex = (sentenceIndex + 1) % sentences.length;
    }
    setTimeout(typeEffect, isDeleting ? 50 : 100);
  }

  typeEffect();
}

// ================= MOBILE MENU =================
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    mobileMenu.classList.toggle("flex");
  });
}

// ================= CMS DATA =================
const DATA_BASE = "data";

async function loadJson(file) {
  const res = await fetch(`${DATA_BASE}/${file}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Isi container dengan hasil render.
 * Kalau fetch gagal dan container sudah berisi hasil prerender, konten
 * statis dibiarkan apa adanya (tidak dihapus).
 */
function renderInto(el, html) {
  if (!el) return;
  el.innerHTML = html;
  el.dataset.hydrated = "true";
}

function handleError(el, message, error) {
  console.error(message, error);
  if (!el || el.dataset.hydrated === "true" || el.children.length > 0) return;
  el.innerHTML = `<p class="text-gray-500 text-sm text-center">${message}</p>`;
}

// ---------- Projects ----------
const projectsContainer = document.getElementById("projects-container");
if (projectsContainer) {
  loadJson("projects.json")
    .then((projects) => {
      renderInto(projectsContainer, projectCards(projects));
      if (!projects || projects.length === 0) {
        projectsContainer.innerHTML =
          `<p class="text-gray-400 col-span-full text-center">No projects found.</p>`;
      }
    })
    .catch((err) =>
      handleError(projectsContainer, "Failed to load projects. Please try again later.", err)
    );
}

// ---------- Experiences ----------
const experienceContainer = document.getElementById("experience-container");
if (experienceContainer) {
  loadJson("experiences.json")
    .then((experiences) => renderInto(experienceContainer, experiencesBlock(experiences)))
    .catch((err) => handleError(experienceContainer, "Failed to load experiences.", err));
}

// ---------- Awards ----------
const awardsContainer = document.getElementById("awards-container");
if (awardsContainer) {
  loadJson("awards.json")
    .then((awards) => {
      renderInto(awardsContainer, awardsBlock(awards));
      revealAwards(awardsContainer);
    })
    .catch((err) => handleError(awardsContainer, "Failed to load awards.", err));
}

function revealAwards(container) {
  const items = container.querySelectorAll(".award-item");
  items.forEach((el) => el.classList.add("opacity-0", "translate-y-2"));
  requestAnimationFrame(() => {
    items.forEach((el, i) => {
      setTimeout(() => el.classList.remove("opacity-0", "translate-y-2"), i * 60);
    });
  });
}

// ---------- Writings ----------
const writingsContainer = document.getElementById("writings-container");
if (writingsContainer) {
  loadJson("writings.json")
    .then((writings) => renderInto(writingsContainer, writingCards(writings)))
    .catch((err) => handleError(writingsContainer, "Failed to load writings.", err));
}

// ================= FILTER =================
// Tombol filter statis di HTML, jadi cukup di-bind sekali.
// Kartu hasil prerender maupun hasil hydrate punya class .project-card.
function setupFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  if (!filterButtons.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter").toLowerCase();

      document
        .querySelectorAll(".filter-btn")
        .forEach((btn) => btn.classList.remove("ring-2", "ring-blue-400"));
      button.classList.add("ring-2", "ring-blue-400");

      document.querySelectorAll(".project-card").forEach((card) => {
        const categories = card.getAttribute("data-category")?.toLowerCase().split(/[\s,]+/) || [];
        card.classList.toggle("hidden", filter !== "all" && !categories.includes(filter));
      });
    });
  });
}

setupFilter();
