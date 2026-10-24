#!/usr/bin/env node
// =====================================================================
//  SSG / prerender build untuk evellyCom
//  Sumber data: data/*.json (dikelola lewat /admin CMS)
//  Output: HTML statis + JSON-LD yang disuntikkan ke halaman
//
//  Jalankan:  npm run build
//  Marker yang diganti ada di HTML:
//     <!-- build:projects:start --> ... <!-- build:projects:end -->
//     <script type="application/ld+json" data-build="schema"> ... </script>
// =====================================================================

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SITE_URL,
  buildSchema,
  projectCards,
  experiencesBlock,
  awardsBlock,
  writingCards,
} from "../assets/render.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const readJson = async (file) =>
  JSON.parse(await readFile(path.join(ROOT, "data", file), "utf8"));

const readHtml = (file) => readFile(path.join(ROOT, file), "utf8");
const writeHtml = (file, html) => writeFile(path.join(ROOT, file), html, "utf8");

/** Ganti isi di antara dua marker HTML comment. */
function injectSection(html, name, content) {
  const start = `<!-- build:${name}:start -->`;
  const end = `<!-- build:${name}:end -->`;
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  if (from === -1 || to === -1 || to < from) {
    throw new Error(`Marker "${name}" tidak ditemukan di HTML.`);
  }
  return html.slice(0, from + start.length) + "\n" + content + "\n" + html.slice(to);
}

/** Ganti blok JSON-LD yang punya atribut data-build="schema". */
function injectSchema(html, schema) {
  const re = /(<script type="application\/ld\+json" data-build="schema">)[\s\S]*?(<\/script>)/;
  if (!re.test(html)) {
    throw new Error('Blok <script type="application/ld+json" data-build="schema"> tidak ditemukan.');
  }
  // Escape "<" supaya aman di dalam <script>
  const json = JSON.stringify(schema, null, 2).replace(/</g, "\\u003c");
  return html.replace(re, (_m, open, close) => `${open}\n${json}\n${close}`);
}

async function main() {
  const [projects, awards, experiences, writings] = await Promise.all([
    readJson("projects.json"),
    readJson("awards.json"),
    readJson("experiences.json"),
    readJson("writings.json"),
  ]);

  const cards = projectCards(projects);
  const exps = experiencesBlock(experiences);
  const awds = awardsBlock(awards);
  const writes = writingCards(writings);

  const pages = [
    {
      file: "index.html",
      url: `${SITE_URL}/`,
      pageType: "ProfilePage",
      pageName: "Evelly Khanzania Putri — Fullstack Developer, AI & IoT",
      sections: { experience: exps, awards: awds },
    },
    {
      file: "projects.html",
      url: `${SITE_URL}/projects.html`,
      pageType: "CollectionPage",
      pageName: "Projects — Evelly Khanzania Putri",
      sections: { projects: cards },
    },
    {
      file: "writings.html",
      url: `${SITE_URL}/writings.html`,
      pageType: "CollectionPage",
      pageName: "Writings — Evelly Khanzania Putri",
      sections: { writings: writes },
    },
    {
      file: "about.html",
      url: `${SITE_URL}/about.html`,
      pageType: "ProfilePage",
      pageName: "About — Evelly Khanzania Putri",
      sections: {},
    },
  ];

  const report = [];

  for (const page of pages) {
    let html = await readHtml(page.file);

    for (const [name, content] of Object.entries(page.sections)) {
      html = injectSection(html, name, content);
    }

    const schema = buildSchema({
      url: page.url,
      pageType: page.pageType,
      pageName: page.pageName,
      projects,
      awards,
      experiences,
    });
    html = injectSchema(html, schema);

    await writeHtml(page.file, html);
    report.push(`${page.file.padEnd(15)} ${String(html.length).padStart(7)} bytes  ${Object.keys(page.sections).join(", ") || "schema only"}`);
  }

  console.log("SSG build selesai:");
  console.log(`  projects   : ${projects.length}`);
  console.log(`  experiences: ${experiences.length}`);
  console.log(`  awards     : ${awards.length}`);
  console.log(`  writings   : ${writings.length}`);
  console.log("");
  report.forEach((line) => console.log("  " + line));
}

main().catch((err) => {
  console.error("Build gagal:", err.message);
  process.exit(1);
});
