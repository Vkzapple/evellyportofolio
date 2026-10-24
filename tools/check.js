#!/usr/bin/env node
// =====================================================================
//  Pemeriksaan hasil build: JSON-LD valid, canonical/og:url benar,
//  dan konten CMS benar-benar ada di HTML statis (bukan cuma di JSON).
//  Jalankan:  npm run check
// =====================================================================

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://evekz.pages.dev";

const PAGES = [
  { file: "index.html", url: `${SITE}/`, mustContain: ["Evelly Khanzania Putri", "Experiences", "Awards"] },
  { file: "about.html", url: `${SITE}/about.html`, mustContain: ["Evelly Khanzania Putri"] },
  { file: "projects.html", url: `${SITE}/projects.html`, mustContain: ["project-card", "FABRIX AI", "SIGEMA"] },
  { file: "writings.html", url: `${SITE}/writings.html`, mustContain: ["Baca Selengkapnya"] },
];

let failed = 0;
const ok = (msg) => console.log(`  PASS  ${msg}`);
const bad = (msg) => {
  failed++;
  console.log(`  FAIL  ${msg}`);
};

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

for (const page of PAGES) {
  console.log(`\n${page.file}`);
  const html = await readFile(path.join(ROOT, page.file), "utf8");

  // --- canonical ---
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!canonical) bad("canonical tidak ada");
  else if (canonical[1] !== page.url) bad(`canonical salah: ${canonical[1]} (harus ${page.url})`);
  else ok(`canonical -> ${canonical[1]}`);

  // --- og:url ---
  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/);
  if (!ogUrl) bad("og:url tidak ada");
  else if (ogUrl[1] !== page.url) bad(`og:url salah: ${ogUrl[1]} (harus ${page.url})`);
  else ok(`og:url -> ${ogUrl[1]}`);

  // --- JSON-LD ---
  const ld = html.match(/<script type="application\/ld\+json" data-build="schema">([\s\S]*?)<\/script>/);
  if (!ld) {
    bad("blok JSON-LD tidak ada");
  } else if (!ld[1].trim()) {
    bad("JSON-LD kosong (belum di-build?)");
  } else {
    try {
      const schema = JSON.parse(ld[1]);
      const graph = schema["@graph"] || [];
      const person = graph.find((n) => n["@type"] === "Person");
      if (!person) bad("node Person tidak ada di @graph");
      else ok(`JSON-LD valid — ${graph.length} node, Person.award=${(person.award || []).length}, Person.subjectOf=${(person.subjectOf || []).length}`);
    } catch (e) {
      bad(`JSON-LD bukan JSON valid: ${e.message}`);
    }
  }

  // --- prerender markers sudah terisi ---
  const openMarkers = (html.match(/<!-- build:[a-z]+:start -->/g) || []).length;
  const emptyMarkers = (html.match(/<!-- build:[a-z]+:start -->\s*<!-- build:[a-z]+:end -->/g) || []).length;
  if (emptyMarkers > 0) bad(`${emptyMarkers} marker build masih kosong`);
  else ok(`${openMarkers} marker prerender terisi`);

  // --- konten kunci ada di HTML mentah ---
  for (const needle of page.mustContain) {
    if (html.includes(needle)) ok(`mengandung "${needle}"`);
    else bad(`tidak mengandung "${needle}"`);
  }

  // --- tidak ada CDN Tailwind / script mati ---
  if (html.includes("cdn.tailwindcss.com")) bad("masih memuat Tailwind CDN");
  else ok("tanpa Tailwind CDN");
  if (html.includes("three.min.js")) bad("masih memuat three.js");
  else ok("tanpa three.js");

  const words = visibleText(html).split(" ").length;
  console.log(`  INFO  ${words} kata terlihat tanpa JavaScript`);
}

console.log("");
if (failed) {
  console.log(`${failed} pemeriksaan GAGAL`);
  process.exit(1);
}
console.log("Semua pemeriksaan lulus.");
