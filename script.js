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
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
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
const STRAPI_BASE = "https://sublime-apparel-d693b92524.strapiapp.com";
const projectsContainer = document.getElementById("projects-container");

if (projectsContainer) {
  // Kosongkan HTML statis dulu sebelum fetch
  projectsContainer.innerHTML = `
    <div class="col-span-full flex justify-center items-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-400 text-sm">Loading projects...</p>
      </div>
    </div>
  `;

  fetch(`${STRAPI_BASE}/api/projects?populate=*`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      projectsContainer.innerHTML = "";

      if (!data.data || data.data.length === 0) {
        projectsContainer.innerHTML = `<p class="text-gray-400 col-span-full text-center">No projects found.</p>`;
        return;
      }

      data.data.forEach(project => {
        // ---------- IMAGE ----------
        // Strapi v5 populate=* returns thumbnail as array of media objects
        let imageUrl = null;
        if (Array.isArray(project.thumbnail) && project.thumbnail.length > 0) {
          const thumb = project.thumbnail[0];
          // url bisa absolute atau relative
          imageUrl = thumb.url?.startsWith("http")
            ? thumb.url
            : `${STRAPI_BASE}${thumb.url}`;
        } else if (project.thumbnail?.url) {
          imageUrl = project.thumbnail.url.startsWith("http")
            ? project.thumbnail.url
            : `${STRAPI_BASE}${project.thumbnail.url}`;
        }

        // ---------- DESCRIPTION ----------
        let descriptionText = "";
        if (Array.isArray(project.description)) {
          descriptionText = project.description
            .map(block => block.children?.map(c => c.text).join("") || "")
            .join(" ");
        } else if (typeof project.description === "string") {
          descriptionText = project.description;
        }

        // ---------- TECH STACK ----------
        let techStackHTML = "";
        const techRaw = project.tech_stack;
        if (Array.isArray(techRaw)) {
          techStackHTML = techRaw
            .map(t => `<span class="bg-neutral-800 px-3 py-1 rounded-lg text-xs">${t}</span>`)
            .join("");
        } else if (typeof techRaw === "string" && techRaw.trim()) {
          techStackHTML = techRaw.split(",")
            .map(t => `<span class="bg-neutral-800 px-3 py-1 rounded-lg text-xs">${t.trim()}</span>`)
            .join("");
        }

        // ---------- CATEGORY ----------
        const category = project.category || "Other";

        // ---------- FEATURED TEXT ----------
        const featuredText = project.featured
          ? `<p class="text-gray-400 italic text-xs mb-4">${project.featured}</p>`
          : "";

        // ---------- CARD ----------
        const card = document.createElement("div");
        card.className = "project-card bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-green-500/40 transition duration-300 group";
        card.setAttribute("data-category", category);

        card.innerHTML = `
          ${imageUrl ? `
            <div class="relative overflow-hidden h-48 bg-neutral-800">
              <img src="${imageUrl}"
                   alt="${project.title}"
                   class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                   onerror="this.parentElement.classList.add('hidden')" />
            </div>
          ` : ""}
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-3">${project.title}</h2>
            <p class="text-gray-300 text-sm mb-4">${descriptionText}</p>
            ${featuredText}
            <div class="flex flex-wrap gap-2 mb-6">${techStackHTML}</div>
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
        `;

        projectsContainer.appendChild(card);
      });

      // Re-init lucide SETELAH semua card dirender
      if (typeof lucide !== "undefined") lucide.createIcons();

      // Setup filter SETELAH cards ada di DOM
      setupFilter();
    })
    .catch(err => {
      console.error("Project fetch error:", err);
      projectsContainer.innerHTML = `
        <p class="text-gray-400 col-span-full text-center py-10">
          Failed to load projects. Please try again later.
        </p>
      `;
    });
} else {
  // Halaman lain yang tidak punya projects-container, tetap setup filter kalau ada static cards
  setupFilter();
}

// ================= FILTER =================
function setupFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  if (!filterButtons.length) return;

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter").toLowerCase();

      document.querySelectorAll(".filter-btn")
        .forEach(btn => btn.classList.remove("ring-2", "ring-blue-400"));
      button.classList.add("ring-2", "ring-blue-400");

      document.querySelectorAll(".project-card").forEach(card => {
        const categories = card.getAttribute("data-category")
          ?.toLowerCase().split(/[\s,]+/) || [];

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
  fetch(`${STRAPI_BASE}/api/experiences?sort=createdAt:desc`)
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
    })
    .catch(err => console.error("Experience fetch error:", err));
}

// ================= AWARDS =================
// FIX: ada typo backtick di selector aslinya: "awards-container`"
const awardsContainer = document.getElementById("awards-container");

if (awardsContainer) {
  fetch(`${STRAPI_BASE}/api/awards?sort[0]=award_date:desc`)
    .then(res => res.json())
    .then(data => {
      awardsContainer.innerHTML = "";

      data.data.forEach(award => {
        awardsContainer.innerHTML += `
          <div class="opacity-0 translate-y-2 transition duration-500 award-item">
            <h3 class="font-semibold">${award.title}</h3>
            <p class="text-gray-400 text-sm">${award.date || award.award_date || ""}</p>
          </div>
        `;
      });

      setTimeout(() => {
        document.querySelectorAll(".award-item").forEach((el, i) => {
          setTimeout(() => el.classList.remove("opacity-0", "translate-y-2"), i * 100);
        });
      }, 100);
    })
    .catch(err => {
      console.error("Awards fetch error:", err);
      awardsContainer.innerHTML = `<p class="text-gray-500 text-sm">Failed to load awards.</p>`;
    });
}

// ================= SKILLS =================
const skillsContainer = document.getElementById("skills-container");

if (skillsContainer) {
  // FIX: ganti localhost ke Strapi cloud URL
  fetch(`${STRAPI_BASE}/api/skills?sort[0]=order:asc`)
    .then(res => res.json())
    .then(data => {
      skillsContainer.innerHTML = "";

      data.data.forEach((skill, index) => {
        skillsContainer.innerHTML += `
          <div class="group bg-neutral-900 rounded-xl p-6 text-center
                      transform transition duration-300
                      hover:scale-105 hover:bg-neutral-800
                      hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]"
               style="animation-delay: ${index * 100}ms">
            <div class="text-4xl mb-3">${getSkillIcon(skill.name)}</div>
            <p class="text-sm font-medium text-gray-300 group-hover:text-white transition">
              ${skill.name}
            </p>
          </div>
        `;
      });
    })
    .catch(err => console.error("Skills fetch error:", err));
}

function getSkillIcon(name) {
  const icons = {
    "HTML": "🌐", "CSS": "🎨", "JavaScript": "🟨", "Tailwind": "💨",
    "Node.js": "🟢", "Strapi": "🚀", "Python": "🐍", "TensorFlow": "🧠",
    "ESP32": "📡", "Git": "🔧", "PostgreSQL": "🐘"
  };
  return icons[name] || "💻";
}