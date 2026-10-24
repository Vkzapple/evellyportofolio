// =====================================================================
//  GRENVIS/evellyCom — shared renderers
//  Dipakai oleh DUA sisi:
//   1. tools/build.js  -> prerender HTML statis (SSG) supaya crawler
//                         yang tidak menjalankan JS tetap melihat konten.
//   2. script.js       -> hydrate di browser setelah fetch JSON.
//  Satu sumber template = tidak ada markup ganda / drift.
// =====================================================================

export const SITE_URL = "https://evekz.pages.dev";

export const PERSON = {
  name: "Evelly Khanzania Putri",
  givenName: "Evelly",
  additionalName: "Khanzania",
  familyName: "Putri",
  alternateName: ["Evelly", "Evell", "Eve", "Epel", "EvellyKz"],
  email: "evellykhnz@gmail.com",
  description:
    "Evelly Khanzania Putri is an Indonesian software engineering student at SMKN 1 Jakarta and a fullstack developer working across artificial intelligence, computer vision, IoT, and web engineering. She builds real-time AI pipelines, ESP32-based IoT systems, and full-stack web applications, and has won national robotics and hackathon competitions.",
  jobTitle: "Fullstack Developer, AI & IoT Engineer",
  addressLocality: "Jakarta",
  addressCountry: "ID",
  school: "SMKN 1 Jakarta",
  sameAs: [
    "https://github.com/Vkzapple",
    "https://www.linkedin.com/in/evelly-khanzania/",
    "https://www.instagram.com/evellkz",
  ],
  knowsAbout: [
    "Artificial Intelligence",
    "Computer Vision",
    "Machine Learning",
    "Internet of Things",
    "Embedded Systems",
    "ESP32",
    "MQTT",
    "Full-Stack Web Development",
    "Node.js",
    "React",
    "Next.js",
    "PostgreSQL",
    "C# (.NET)",
    "Kotlin (Android)",
  ],
};

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// ---------------------------------------------------------------------
//  PROJECTS
// ---------------------------------------------------------------------
export function projectCards(projects = []) {
  return projects
    .map((project) => {
      const imageUrl = project.image || null;
      const descriptionText = project.description || "";

      let techStackHTML = "";
      const techRaw = project.tech_stack;
      if (Array.isArray(techRaw)) {
        techStackHTML = techRaw
          .map((t) => `<span class="bg-neutral-800 px-3 py-1 rounded-lg text-xs">${esc(t)}</span>`)
          .join("");
      } else if (typeof techRaw === "string" && techRaw.trim()) {
        techStackHTML = techRaw
          .split(",")
          .map((t) => `<span class="bg-neutral-800 px-3 py-1 rounded-lg text-xs">${esc(t.trim())}</span>`)
          .join("");
      }

      const category = project.category || "Other";
      const featuredText = project.featured
        ? `<p class="text-gray-400 italic text-xs mb-4">${esc(project.featured)}</p>`
        : "";

      const demoLink = project.demo_url
        ? `<a href="${esc(project.demo_url)}" target="_blank" rel="noopener"
     class="flex items-center gap-2 text-xs px-4 py-2
            bg-green-500/10 text-green-400
            border border-green-500/30
            rounded-lg hover:bg-green-500/20 transition">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
    Live Demo
  </a>`
        : "";

      const githubLink = project.github_url
        ? `<a href="${esc(project.github_url)}" target="_blank" rel="noopener"
     class="flex items-center gap-2 text-xs px-4 py-2
            bg-neutral-800 text-white
            border border-neutral-700
            rounded-lg hover:bg-neutral-700 transition">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23A11.52 11.52 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
    </svg>
    Source Code
  </a>`
        : "";

      return `<div class="project-card bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-green-500/40 transition duration-300 group" data-category="${esc(category)}">
  ${imageUrl
          ? `<div class="relative overflow-hidden h-48 bg-neutral-800">
    <img src="${esc(imageUrl)}" alt="${esc(project.title)}" loading="lazy" decoding="async"
         class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
         onerror="this.parentElement.classList.add('hidden')" />
  </div>`
          : ""}
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-3">${esc(project.title)}</h2>
    <p class="text-gray-300 text-sm mb-4">${esc(descriptionText)}</p>
    ${featuredText}
    <div class="flex flex-wrap gap-2 mb-6">${techStackHTML}</div>
    <div class="flex gap-3">${demoLink}${githubLink}</div>
  </div>
</div>`;
    })
    .join("\n");
}

// ---------------------------------------------------------------------
//  EXPERIENCES
// ---------------------------------------------------------------------
export function experiencesBlock(experiences = []) {
  const items = experiences
    .map(
      (exp) => `<div>
  <h3 class="font-semibold">${esc(exp.title)}</h3>
  <p class="text-gray-400 text-sm">${esc(exp.date)}</p>
</div>`
    )
    .join("\n");

  return `<h2 class="text-2xl font-bold mb-6">Experiences</h2>
<div class="space-y-4">
${items}
</div>`;
}

// ---------------------------------------------------------------------
//  AWARDS
// ---------------------------------------------------------------------
export function sortedAwards(awards = []) {
  return awards
    .slice()
    .sort((a, b) => String(b.award_date || "").localeCompare(String(a.award_date || "")));
}

export function awardsBlock(awards = []) {
  return sortedAwards(awards)
    .map(
      (award) => `<div class="transition duration-500 award-item">
  <h3 class="font-semibold">${esc(award.title)}</h3>
  <p class="text-gray-400 text-sm">${esc(award.date || award.award_date || "")}</p>
</div>`
    )
    .join("\n");
}

// ---------------------------------------------------------------------
//  WRITINGS
// ---------------------------------------------------------------------
export function writingCards(writings = []) {
  return writings
    .map(
      (w) => `<div class="bg-neutral-900 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition">
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-2">${esc(w.title)}</h2>
    <p class="text-gray-300 text-sm mb-4">${esc(w.description)}</p>
    ${w.link
          ? `<a href="${esc(w.link)}" target="_blank" rel="noopener" class="text-blue-400 underline text-sm">
      Baca Selengkapnya →
    </a>`
          : ""}
  </div>
</div>`
    )
    .join("\n");
}

// ---------------------------------------------------------------------
//  JSON-LD  (dibangun dari data CMS yang sama)
// ---------------------------------------------------------------------
const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function monthNum(word) {
  return MONTHS[String(word || "").toLowerCase()] || null;
}

function isoDate(month, year) {
  if (!year) return undefined;
  const m = month ? String(month).padStart(2, "0") : "01";
  return `${year}-${m}`;
}

/** "August 2026 - Present" -> { startDate: "2026-08", endDate: undefined } */
export function parsePeriod(text) {
  const raw = String(text || "").trim();
  if (!raw) return {};

  const parts = raw.split(/\s*[-–—]\s*/).map((s) => s.trim()).filter(Boolean);
  const pick = (str) => {
    const m = str.match(/([A-Za-z]+)?\s*(\d{4})/);
    if (!m) return null;
    return { month: monthNum(m[1]), year: Number(m[2]) };
  };

  const start = parts[0] ? pick(parts[0]) : null;
  const end = parts[1] ? pick(parts[1]) : null;
  const endIsPresent = /present|now|sekarang/i.test(parts[1] || "");

  const startDate = start ? isoDate(start.month, start.year) : undefined;
  let endDate;
  if (end) endDate = isoDate(end.month, end.year);
  else if (endIsPresent) endDate = undefined;
  else if (parts.length === 1) endDate = startDate; // event satu titik waktu

  return { startDate, endDate };
}

export function buildSchema({ url, pageType, pageName, projects = [], awards = [], experiences = [] }) {
  const personId = `${SITE_URL}/#person`;
  const websiteId = `${SITE_URL}/#website`;
  const pageId = `${url}#webpage`;

  const person = {
    "@type": "Person",
    "@id": personId,
    name: PERSON.name,
    givenName: PERSON.givenName,
    additionalName: PERSON.additionalName,
    familyName: PERSON.familyName,
    alternateName: PERSON.alternateName,
    url: `${SITE_URL}/`,
    mainEntityOfPage: { "@id": pageId },
    image: `${SITE_URL}/assets/epel.png`,
    description: PERSON.description,
    jobTitle: PERSON.jobTitle,
    email: `mailto:${PERSON.email}`,
    nationality: { "@type": "Country", name: "Indonesia" },
    address: {
      "@type": "PostalAddress",
      addressLocality: PERSON.addressLocality,
      addressCountry: PERSON.addressCountry,
    },
    alumniOf: { "@type": "EducationalOrganization", name: PERSON.school },
    knowsAbout: PERSON.knowsAbout,
    knowsLanguage: ["id", "en"],
    sameAs: PERSON.sameAs,
  };

  if (experiences.length) {
    person.hasOccupation = experiences.map((exp) => {
      const { startDate, endDate } = parsePeriod(exp.date);
      const role = { "@type": "Role", roleName: exp.title };
      if (startDate) role.startDate = startDate;
      if (endDate) role.endDate = endDate;
      return role;
    });
  }

  if (awards.length) {
    person.award = sortedAwards(awards).map((award) => {
      const item = { "@type": "Award", name: award.title };
      if (award.award_date) item.dateCreated = award.award_date;
      if (award.organization) item.creator = { "@type": "Organization", name: award.organization };
      return item;
    });
  }

  if (projects.length) {
    person.subjectOf = projects.map((p) => {
      const work = {
        "@type": "CreativeWork",
        name: p.title,
        description: p.description || undefined,
        url: p.demo_url || p.github_url || `${SITE_URL}/projects.html`,
        creator: { "@id": personId },
      };
      if (Array.isArray(p.tech_stack) && p.tech_stack.length) {
        work.keywords = p.tech_stack.join(", ");
      }
      if (p.github_url) work.sameAs = [p.github_url];
      return work;
    });
  }

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: `${SITE_URL}/`,
    name: "Evelly Khanzania Putri — Portfolio",
    description: PERSON.description,
    inLanguage: "en",
    publisher: { "@id": personId },
  };

  const webpage = {
    "@type": pageType,
    "@id": pageId,
    url,
    name: pageName,
    isPartOf: { "@id": websiteId },
    about: { "@id": personId },
    inLanguage: "en",
    primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/assets/epel.png` },
  };

  if (pageType === "ProfilePage") webpage.mainEntity = { "@id": personId };

  return {
    "@context": "https://schema.org",
    "@graph": [person, website, webpage],
  };
}
