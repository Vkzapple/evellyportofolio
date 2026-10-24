# evellyCom — portfolio Evelly Khanzania Putri

Situs statis (HTML + vanilla JS) untuk portfolio, proyek, tulisan, dan pencapaian.
Konten dikelola lewat CMS statis di `/admin` yang menulis ke `data/*.json`,
lalu **diprerender** menjadi HTML + JSON-LD agar terbaca mesin pencari dan
crawler AI yang tidak menjalankan JavaScript.

Live: https://evekz.pages.dev

## Menjalankan

```bash
npm install        # sekali saja (tailwindcss)
npm run build      # prerender HTML + JSON-LD, lalu compile Tailwind
npm run check      # validasi hasil build
npm run serve      # http://localhost:4173
```

Butuh Node.js 18+.

## Alur konten

```
/admin  ──commit──▶  GitHub (data/*.json + assets/)  ──▶  Cloudflare Pages
                                                             │
                                                    npm run build
                                                             ▼
                                          HTML statis + JSON-LD + tailwind.css
```

1. Edit konten di `/admin` → **Simpan & Publish** (commit ke GitHub).
2. Cloudflare Pages menjalankan `npm run build` (set sebagai build command).
3. Hasil prerender tayang. `script.js` tetap menghidrasi ulang dari JSON di browser,
   jadi perubahan langsung terlihat tanpa menunggu build.

## Struktur

| Path | Isi |
|---|---|
| `index.html` | Halaman utama (hero, capabilities, experiences, awards) |
| `projects.html` | Daftar proyek + filter kategori |
| `writings.html` | Karya tulis & publikasi |
| `about.html` | Profil |
| `script.js` | Matrix canvas, typing effect, menu mobile, filter, hidrasi data |
| `assets/render.js` | Template HTML + generator schema.org (dipakai browser & build) |
| `assets/tailwind.src.css` → `assets/tailwind.css` | Sumber & hasil compile Tailwind (tanpa CDN) |
| `tools/build.js` | Prerender SSG |
| `tools/check.js` | Pemeriksaan canonical / og:url / JSON-LD / isi prerender |
| `data/*.json` | Sumber konten (dikelola CMS) |
| `admin/` | Dashboard CMS (GitHub Contents API, tanpa backend) |

## SEO

- `<link rel="canonical">` di setiap halaman, `og:url` per halaman.
- JSON-LD `@graph`: `Person` (+ `award`, `hasOccupation`, `subjectOf`, `knowsAbout`,
  `sameAs`) + `WebSite` + `ProfilePage`/`CollectionPage`, dibangun dari data CMS.
- Konten CMS ada di HTML mentah (bukan hanya hasil `fetch`), jadi terbaca tanpa JS.
- Tailwind dikompilasi lokal; tidak ada CDN runtime.

## Mengubah isi halaman statis

Hero, capabilities, dan teks profil masih ditulis manual di HTML.
`assets/render.js` menangani bagian yang berasal dari CMS (projects, experiences,
awards, writings) — ubah template di sana, bukan di dua tempat.
