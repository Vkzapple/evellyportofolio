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
    "I'm obsessed with learning and exploring new technologies",
    "I love bringing ideas to lif",
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

// ================= PROJECTS =================
// Content sekarang dikelola lewat dashboard CMS (folder /admin) dan disimpan
// sebagai file JSON statis di folder /data — tidak perlu Strapi lagi.
const DATA_BASE = "data";
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

  fetch(`${DATA_BASE}/projects.json`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(projects => {
      projectsContainer.innerHTML = "";

      if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = `<p class="text-gray-400 col-span-full text-center">No projects found.</p>`;
        return;
      }

      projects.forEach(project => {
        // ---------- IMAGE ----------
        const imageUrl = project.image || null;

        // ---------- DESCRIPTION ----------
        const descriptionText = project.description || "";

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
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
    Live Demo
  </a>
` : ""}
${project.github_url ? `
  <a href="${project.github_url}" target="_blank"
     class="flex items-center gap-2 text-xs px-4 py-2
            bg-neutral-800 text-white
            border border-neutral-700
            rounded-lg hover:bg-neutral-700 transition">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23A11.52 11.52 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
    </svg>
    Source Code
  </a>
` : ""}
            </div>
          </div>
        `;

        projectsContainer.appendChild(card);
      });

      if (typeof lucide !== "undefined") lucide.createIcons();

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
  fetch(`${DATA_BASE}/experiences.json`)
    .then(res => res.json())
    .then(experiences => {
      experienceContainer.innerHTML = `
        <h2 class="text-2xl font-bold mb-6">Experiences</h2>
        <div class="space-y-4">
          ${experiences.map(exp => `
            <div>
              <h3 class="font-semibold">${exp.title}</h3>
              <p class="text-gray-400 text-sm">${exp.date}</p>
            </div>
          `).join("")}
        </div>
      `;
    })
    .catch(err => {
      console.error("Experience fetch error:", err);
      experienceContainer.innerHTML = `<p class="text-gray-500 text-sm">Failed to load experiences.</p>`;
    });
}

// ================= AWARDS =================
const awardsContainer = document.getElementById("awards-container");

if (awardsContainer) {
  fetch(`${DATA_BASE}/awards.json`)
    .then(res => res.json())
    .then(awards => {
      awardsContainer.innerHTML = "";

      // urutkan terbaru dulu berdasarkan award_date
      awards
        .slice()
        .sort((a, b) => (b.award_date || "").localeCompare(a.award_date || ""))
        .forEach(award => {
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

// ================= WRITINGS =================
const writingsContainer = document.getElementById("writings-container");

if (writingsContainer) {
  fetch(`${DATA_BASE}/writings.json`)
    .then(res => res.json())
    .then(writings => {
      writingsContainer.innerHTML = "";

      writings.forEach(w => {
        writingsContainer.innerHTML += `
          <div class="bg-neutral-900 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition">
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-2">${w.title}</h2>
              <p class="text-gray-300 text-sm mb-4">${w.description}</p>
              ${w.link ? `
                <a href="${w.link}" target="_blank" class="text-blue-400 underline text-sm">
                  Baca Selengkapnya →
                </a>
              ` : ""}
            </div>
          </div>
        `;
      });
    })
    .catch(err => {
      console.error("Writings fetch error:", err);
      writingsContainer.innerHTML = `<p class="text-gray-500 text-sm col-span-full text-center">Failed to load writings.</p>`;
    });
}

// ================= SKILLS =================
const skillsContainer = document.getElementById("skills-container");

if (skillsContainer) {
  fetch(`${DATA_BASE}/skills.json`)
    .then(res => res.json())
    .then(skills => {
      skillsContainer.innerHTML = "";

      skills.forEach((skill, index) => {
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