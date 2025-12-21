const canvas = document.getElementById("matrixCanvas");
if (canvas) {
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

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);

  window.addEventListener("resize", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  });
}

const typingTarget = document.getElementById("typing-text");
if (typingTarget) {
  const sentences = [
    "I'm obsessed with learning and exploring new technologies🤖",
    "I love bringing ideas to life 💡",
    "Passionate about AI, IoT, Cyber Security, and Web Development",
  ];
  let sentenceIndex = 0;
  let charIndex = 0;
  let currentSentence = "";
  let isDeleting = false;

  function typeEffect() {
    currentSentence = sentences[sentenceIndex];

    if (isDeleting) {
      typingTarget.textContent = currentSentence.substring(0, charIndex--);
    } else {
      typingTarget.textContent = currentSentence.substring(0, charIndex++);
    }

    if (!isDeleting && charIndex === currentSentence.length + 1) {
      isDeleting = true;
      setTimeout(typeEffect, 1500);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      sentenceIndex = (sentenceIndex + 1) % sentences.length;
    }

    const speed = isDeleting ? 50 : 100;
    setTimeout(typeEffect, speed);
  }

  typeEffect();
}

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    mobileMenu.classList.toggle("flex");
    mobileMenu.classList.add("transition", "duration-300");
  });
}

    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.getAttribute("data-filter").toLowerCase();

        filterButtons.forEach((btn) =>
          btn.classList.remove("ring-2", "ring-blue-400")
        );
        button.classList.add("ring-2", "ring-blue-400");

        projectCards.forEach((card) => {
          const categories = card
            .getAttribute("data-category")
            .toLowerCase()
            .split(" ");
          if (filter === "all" || categories.includes(filter)) {
            card.classList.remove("hidden");
          } else {
            card.classList.add("hidden");
          }
        });
      });
    });