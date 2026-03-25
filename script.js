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
// ================= PROJECTS =================

const projectsContainer = document.getElementById("projects-container");

if (projectsContainer) {

  fetch("https://sublime-apparel-d693b92524.strapiapp.com/api/projects?populate=*")
    .then(res => res.json())
    .then(data => {

      projectsContainer.innerHTML = "";

      data.data.forEach(item => {

        const project = item;

        // ---------- IMAGE ----------
        const imageUrl =
          project.thumbnail && project.thumbnail.length > 0
            ? `https://sublime-apparel-d693b92524.strapiapp.com${project.thumbnail[0].url}`
            : null;

        // ---------- DESCRIPTION (Rich Text Safe) ----------
        let descriptionText = "";

        if (Array.isArray(project.description)) {
          descriptionText = project.description
            .map(block =>
              block.children
                ?.map(child => child.text)
                .join("")
            )
            .join(" ");
        } else if (typeof project.description === "string") {
          descriptionText = project.description;
        }

        // ---------- TECH STACK ----------
        let techStackHTML = "";

        if (Array.isArray(project.tech_stack)) {
          techStackHTML = project.tech_stack
            .map(tech => `
              <span class="bg-neutral-800 px-3 py-1 rounded-lg text-xs">
                ${tech}
              </span>
            `)
            .join("");
        } else if (typeof project.tech_stack === "string") {
          techStackHTML = `
            <span class="bg-neutral-800 px-3 py-1 rounded-lg text-xs">
              ${project.tech_stack}
            </span>
          `;
        }

        // ---------- CARD ----------
        projectsContainer.innerHTML += `
          <div class="project-card bg-neutral-900 rounded-2xl overflow-hidden 
                      border border-neutral-800 hover:border-green-500/40 
                      transition duration-300 group">

            ${imageUrl ? `
              <div class="relative overflow-hidden">
                <img src="${imageUrl}" 
                     alt="${project.title}" 
                     class="w-full h-48 object-cover 
                            group-hover:scale-105 transition duration-500" />
              </div>
            ` : ""}

            <div class="p-6">

              <h2 class="text-xl font-semibold mb-3">
                ${project.title}
              </h2>

              <p class="text-gray-300 text-sm mb-4">
                ${descriptionText}
              </p>

              <div class="flex flex-wrap gap-2 mb-6">
                ${techStackHTML}
              </div>

              <div class="flex gap-3">

                ${project.demo_url ? `
                  <a href="${project.demo_url}" target="_blank"
                     class="flex items-center gap-2 text-xs px-4 py-2 
                            bg-green-500/10 text-green-400 
                            border border-green-500/30 
                            rounded-lg hover:bg-green-500/20 transition">
                    <i data-lucide="external-link" class="w-4 h-4"></i>
                    Live Demo
                  </a>
                ` : ""}

                ${project.github_url ? `
                  <a href="${project.github_url}" target="_blank"
                     class="flex items-center gap-2 text-xs px-4 py-2 
                            bg-neutral-800 text-white 
                            border border-neutral-700 
                            rounded-lg hover:bg-neutral-700 transition">
                    <i data-lucide="github" class="w-4 h-4"></i>
                    Source Code
                  </a>
                ` : ""}

              </div>

            </div>
          </div>
        `;
      });

      // Re-init lucide icons
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }

    })
    .catch(err => console.error("Project fetch error:", err));
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
  fetch("https://sublime-apparel-d693b92524.strapiapp.com/api/experiences?sort=createdAt:desc")
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
const awardsContainer = document.getElementById("awards-container`");

if (awardsContainer) {
  fetch("https://sublime-apparel-d693b92524.strapiapp.com/api/awards?sort[0]=award_date:desc")
    .then(res => res.json())
    .then(data => {
      awardsContainer.innerHTML = "";

      data.data.forEach(award => {
        awardsContainer.innerHTML += `
          <div class="opacity-0 translate-y-2 transition duration-500 award-item">
            <h3 class="font-semibold">${award.title}</h3>
            <p class="text-gray-400 text-sm">${award.date}</p>
          </div>
        `;
      });

      // ✨ Animate masuk
      setTimeout(() => {
        document.querySelectorAll(".award-item").forEach((el, i) => {
          setTimeout(() => {
            el.classList.remove("opacity-0", "translate-y-2");
          }, i * 100);
        });
      }, 100);
    })
    .catch(err => {
      console.error(err);

      // fallback kalau error
      awardsContainer.innerHTML = `
        <p class="text-gray-500 text-sm">Failed to load awards.</p>
      `;
    });
}
// ================= SKILLS =================
const skillsContainer = document.getElementById("skills-container");

if (skillsContainer) {
  fetch("http://localhost:1337/api/skills?sort[0]=order:asc")
    .then(res => res.json())
    .then(data => {

      skillsContainer.innerHTML = "";

      data.data.forEach((skill, index) => {

        skillsContainer.innerHTML += `
          <div class="group bg-neutral-900 rounded-xl p-6 text-center 
                      transform transition duration-300 
                      hover:scale-105 hover:bg-neutral-800
                      hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]
                      animate-fade-in"
               style="animation-delay: ${index * 100}ms">

            <div class="text-4xl mb-3">
              ${getSkillIcon(skill.name)}
            </div>

            <p class="text-sm font-medium text-gray-300 group-hover:text-white transition">
              ${skill.name}
            </p>
          </div>
        `;
      });
    });
}

// Icon mapping
function getSkillIcon(name) {
  const icons = {
    "HTML": "🌐",
    "CSS": "🎨",
    "JavaScript": "🟨",
    "Tailwind": "💨",
    "Node.js": "🟢",
    "Strapi": "🚀",
    "Python": "🐍",
    "TensorFlow": "🧠",
    "ESP32": "📡",
    "Git": "🔧",
    "PostgreSQL": "🐘"
  };

  return icons[name] || "💻";
}