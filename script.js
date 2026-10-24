// =====================================================================
//  evellyCom — front-end (classic script, tanpa import/fetch)
//  Konten sudah diprerender oleh tools/build.js dari data/*.json.
//  File ini hanya menangani animasi & interaksi.
// =====================================================================

// ================= MATRIX EFFECT =================
(function matrixEffect() {
  const canvas = document.getElementById("matrixCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const letters = "EVELLY".split("");
  const fontSize = 18;

  let columns = 0;
  let drops = [];
  let timer = null;

  function resize() {
    canvas.width = canvas.offsetWidth || 1;
    canvas.height = canvas.offsetHeight || 1;
    columns = Math.max(1, Math.floor(canvas.width / fontSize));
    // posisi awal diacak (boleh negatif) supaya hujan huruf tidak jatuh serempak
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -40));
  }

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = letters[Math.floor(Math.random() * letters.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      // begitu lewat bawah kanvas langsung mulai lagi dari atas -> loop terus
      if (drops[i] * fontSize > canvas.height) drops[i] = 0;
      drops[i]++;
    }
  }

  function start() {
    if (timer !== null) return;
    timer = setInterval(draw, 50);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  resize();
  start();

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
    }, 150);
  });

  // hemat CPU saat tab tidak aktif, lalu lanjut lagi saat kembali
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
})();

// ================= TYPING EFFECT =================
(function typingEffect() {
  const typingTarget = document.getElementById("typing-text");
  if (!typingTarget) return;

  const sentences = [
    "I'm obsessed with learning and exploring new technologies",
    "I love bringing ideas to life",
    "Passionate about AI, Data Science, IoT, and Web Development",
  ];

  let sentenceIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentSentence = sentences[sentenceIndex];
    typingTarget.textContent = isDeleting
      ? currentSentence.substring(0, charIndex--)
      : currentSentence.substring(0, charIndex++);

    if (!isDeleting && charIndex === currentSentence.length + 1) {
      isDeleting = true;
      setTimeout(type, 1500);
      return;
    }
    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      sentenceIndex = (sentenceIndex + 1) % sentences.length;
    }
    setTimeout(type, isDeleting ? 50 : 100);
  }

  type();
})();

// ================= MOBILE MENU =================
(function mobileMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (!menuToggle || !mobileMenu) return;

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    mobileMenu.classList.toggle("flex");
  });
})();

// ================= FILTER PROJECT =================
(function projectFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  if (!filterButtons.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter").toLowerCase();

      filterButtons.forEach((btn) => btn.classList.remove("ring-2", "ring-blue-400"));
      button.classList.add("ring-2", "ring-blue-400");

      document.querySelectorAll(".project-card").forEach((card) => {
        const categories = card.getAttribute("data-category")?.toLowerCase().split(/[\s,]+/) || [];
        card.classList.toggle("hidden", filter !== "all" && !categories.includes(filter));
      });
    });
  });
})();

// ================= AWARDS FADE-IN =================
(function awardsReveal() {
  const items = document.querySelectorAll(".award-item");
  if (!items.length) return;

  items.forEach((el) => el.classList.add("opacity-0", "translate-y-2"));

  requestAnimationFrame(() => {
    items.forEach((el, i) => {
      setTimeout(() => el.classList.remove("opacity-0", "translate-y-2"), i * 60);
    });
  });
})();
