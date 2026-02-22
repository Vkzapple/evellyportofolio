// ================= MATRIX EFFECT =================
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

// ================= TYPING EFFECT =================
const typingTarget = document.getElementById("typing-text");
if (typingTarget) {
  const sentences = [
    "I'm obsessed with learning and exploring new technologies 🤖",
    "I love bringing ideas to life 💡",
    "Passionate about AI, IoT, Cyber Security, and Web Development",
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

// ================= PROJECTS FROM STRAPI =================
const projectsContainer = document.getElementById("projects-container");

if (projectsContainer) {
  fetch("http://localhost:1337/api/projects?populate=*")
    .then(res => res.json())
    .then(data => {

      data.data.forEach(project => {

        // ===== DESCRIPTION (Rich Text Fix) =====
        const descriptionText = Array.isArray(project.description)
          ? project.description
              .map(block =>
                block.children?.map(child => child.text).join("")
              )
              .join(" ")
          : "";

        // ===== TECH STACK =====
        const techStackHTML = project.tech_stack
          ? `<span class="bg-neutral-800 px-3 py-1 rounded-lg text-sm">
               ${project.tech_stack}
             </span>`
          : "";

        // ===== THUMBNAIL (Strapi v5 array) =====
        const imageUrl = Array.isArray(project.thumbnail) && project.thumbnail.length > 0
          ? `http://localhost:1337${project.thumbnail[0].url}`
          : "";

        projectsContainer.innerHTML += `
          <div class="project-card bg-neutral-900 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition"
               data-category="${project.category || ''}">

            ${imageUrl ? `
              <img src="${imageUrl}" 
                   alt="${project.title}" 
                   class="w-full h-48 object-cover" />
            ` : ""}

            <div class="p-6">
              <h2 class="text-xl font-semibold mb-3">${project.title}</h2>

              <p class="text-gray-300 text-sm mb-4">
                ${descriptionText}
              </p>

              <div class="flex flex-wrap gap-2">
                ${techStackHTML}
              </div>
            </div>
          </div>
        `;
      });

      setupFilter();
    })
    .catch(err => console.error("Fetch error:", err));
}

// ================= FILTER =================
function setupFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter").toLowerCase();

      document.querySelectorAll(".filter-btn")
        .forEach(btn => btn.classList.remove("ring-2", "ring-blue-400"));

      button.classList.add("ring-2", "ring-blue-400");

      document.querySelectorAll(".project-card")
        .forEach(card => {
          const categories = card
            .getAttribute("data-category")
            ?.toLowerCase()
            .split(" ") || [];

          if (filter === "all" || categories.includes(filter)) {
            card.classList.remove("hidden");
          } else {
            card.classList.add("hidden");
          }
        });
    });
  });
}
// ================= EXPERIENCE =================
const experienceContainer = document.getElementById("experience-container");

if (experienceContainer) {
  fetch("http://localhost:1337/api/experiences?sort=createdAt:desc")
    .then(res => res.json())
    .then(data => {

      data.data.forEach(exp => {
        experienceContainer.innerHTML += `
          <div>
            <h3 class="font-semibold">${exp.title}</h3>
            <p class="text-gray-400 text-sm">
              ${exp.start_date || ""} - ${exp.is_current ? "Present" : exp.end_date || ""}
            </p>
          </div>
        `;
      });
    });
}

// ================= AWARDS =================
const awardsContainer = document.getElementById("awards-container");

if (awardsContainer) {
  fetch("http://localhost:1337/api/awards?sort[0]=award_date:desc")
    .then(res => res.json())
    .then(data => {

      data.data.forEach(award => {
        awardsContainer.innerHTML += `
          <div>
            <h3 class="font-semibold">${award.title}</h3>
            <p class="text-gray-400 text-sm">${award.date}</p>
          </div>
        `;
      });
    });
}