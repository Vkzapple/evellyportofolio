# Evelly CMS — Admin Dashboard

Dashboard personal untuk mengelola konten portfolio (Projects, Awards, Experiences, Writings) **tanpa backend & tanpa biaya hosting**. Pengganti Strapi Cloud.

## Cara kerja

- Semua konten disimpan sebagai file JSON statis di folder `/data`:
  - `data/projects.json`
  - `data/awards.json`
  - `data/experiences.json`
  - `data/writings.json`
- Gambar project disimpan di `/assets/projects/`.
- Dashboard ini (100% static HTML/JS) mengedit file-file tersebut lewat **GitHub Contents API** — setiap "Simpan & Publish" = 1 commit ke branch `main`.
- Cloudflare Pages / Vercel / Netlify otomatis redeploy setiap ada commit, jadi perubahan langsung tayang beberapa detik kemudian.

```
Dashboard (admin/) ──commit──▶ GitHub repo ──auto deploy──▶ evekz.pages.dev
```

## Cara pakai

1. Buka `https://<domain-kamu>/admin/` (atau `admin/index.html` lokal).
2. Login pakai **GitHub Personal Access Token**:
   - GitHub → Settings → Developer settings → **Fine-grained personal access tokens** → Generate new token
   - Repository access: pilih repo `evellyportofolio` saja
   - Permissions → Repository permissions → **Contents: Read and write**
   - Set expiration sesuai selera (bisa 1 tahun).
3. Token bisa disimpan di browser (localStorage) biar nggak perlu login ulang. **Jangan pakai fitur ini di komputer umum.**
4. Pilih tab (Projects / Awards / Experiences / Writings), lalu tambah / edit / hapus / reorder item.
5. Klik **Simpan & Publish** → perubahan di-commit → site auto-redeploy.

## Keamanan

- Halaman admin ini aman untuk di-deploy publik: tanpa token GitHub yang valid (dengan izin push ke repo kamu), tidak ada yang bisa mengubah apa pun.
- `robots.txt` sudah `Disallow: /admin/` supaya tidak diindex.
- Token hanya tersimpan di browser kamu sendiri, tidak pernah dikirim ke server lain selain `api.github.com`.

## Catatan developer

- Skema field tiap collection didefinisikan di `admin/admin.js` pada objek `COLLECTIONS` — mau menambah field baru cukup edit di situ.
- Frontend (`script.js`) membaca `data/*.json`, tidak lagi memanggil Strapi.
- Folder `portfolio-cms/` (Strapi lama) sudah tidak dipakai dan boleh dihapus.
