// ================================================================
// Evelly CMS — personal dashboard untuk mengelola konten portfolio
// Konsep: konten disimpan sebagai file JSON di repo GitHub.
// Dashboard ini edit file tsb via GitHub Contents API, lalu
// Cloudflare Pages / Vercel / Netlify auto-redeploy dari commit.
// 100% static — tidak butuh server/backend berbayar.
// ================================================================

const OWNER = "Vkzapple";
const REPO = "evellyportofolio";
const BRANCH = "main";
const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

// ---------- schema tiap collection ----------
const COLLECTIONS = {
  projects: {
    title: "Projects",
    file: "data/projects.json",
    itemLabel: item => item.title,
    itemSub: item => `${item.category || "-"} · ${(item.tech_stack || []).slice(0, 4).join(", ")}`,
    fields: [
      { key: "title", label: "Judul Project", type: "text", required: true },
      { key: "description", label: "Deskripsi", type: "textarea", required: true },
      { key: "category", label: "Kategori", type: "select", options: ["Web", "AI", "IoT", "UI/UX", "Mobile", "Game", "Other"] },
      { key: "tech_stack", label: "Tech Stack (pisahkan dengan koma)", type: "tags" },
      { key: "github_url", label: "GitHub URL", type: "text" },
      { key: "demo_url", label: "Live Demo URL", type: "text" },
      { key: "featured", label: "Catatan (mis. 'Prototype available upon request')", type: "text" },
      { key: "image", label: "Thumbnail", type: "image" },
    ],
  },
  awards: {
    title: "Awards",
    file: "data/awards.json",
    itemLabel: item => item.title,
    itemSub: item => `${item.organization || "-"} · ${item.date || item.award_date || ""}`,
    fields: [
      { key: "title", label: "Judul Award", type: "text", required: true },
      { key: "organization", label: "Penyelenggara", type: "text" },
      { key: "date", label: "Tanggal (teks, mis. 'February 2026')", type: "text", required: true },
      { key: "award_date", label: "Tanggal (untuk sorting)", type: "date", required: true },
    ],
  },
  experiences: {
    title: "Experiences",
    file: "data/experiences.json",
    itemLabel: item => item.title,
    itemSub: item => item.date || "",
    fields: [
      { key: "title", label: "Judul (mis. 'AWS Back-End Academy @ DBS Foundation')", type: "text", required: true },
      { key: "date", label: "Periode (mis. 'July 2025 - August 2025')", type: "text", required: true },
    ],
  },
  writings: {
    title: "Writings",
    file: "data/writings.json",
    itemLabel: item => item.title,
    itemSub: item => item.link || "",
    fields: [
      { key: "title", label: "Judul Tulisan", type: "text", required: true },
      { key: "description", label: "Deskripsi", type: "textarea", required: true },
      { key: "link", label: "Link file PDF (mis. 'sigema_wm.pdf') atau URL", type: "text" },
    ],
  },
};

// ---------- state ----------
let token = null;
let activeTab = "projects";
// cache per collection: { items: [...], sha: "..." }
const cache = {};
// gambar baru yang dipilih di modal (belum diupload)
let pendingImage = null;
let editingIndex = null; // null = tambah baru

// ---------- helpers ----------
const $ = id => document.getElementById(id);

function toast(msg, isError = false) {
  const el = $("toast");
  el.textContent = msg;
  el.className = el.className.replace(/border-(red|green)-500\/50/g, "");
  el.classList.remove("hidden");
  el.classList.add(isError ? "border-red-500/50" : "border-green-500/50");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add("hidden"), 3500);
}

function ghHeaders() {
  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
  };
}

// UTF-8 safe base64
function b64encode(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}
function b64decode(b64) {
  return new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, "")), c => c.charCodeAt(0)));
}

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ---------- GitHub API ----------
async function ghGetFile(path) {
  const res = await fetch(`${API}/${path}?ref=${BRANCH}`, { headers: ghHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${path} gagal (HTTP ${res.status})`);
  return res.json();
}

async function ghPutFile(path, contentB64, message, sha = null) {
  const body = { message, content: contentB64, branch: BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(`${API}/${path}`, {
    method: "PUT",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `PUT ${path} gagal (HTTP ${res.status})`);
  }
  return res.json();
}

async function loadCollection(name, force = false) {
  if (cache[name] && !force) return cache[name];
  const conf = COLLECTIONS[name];
  const file = await ghGetFile(conf.file);
  if (!file) {
    cache[name] = { items: [], sha: null };
  } else {
    let content;
    if (file.content) {
      content = b64decode(file.content);
    } else {
      // file >1MB: content kosong, ambil via download_url
      content = await fetch(file.download_url).then(r => r.text());
    }
    cache[name] = { items: JSON.parse(content), sha: file.sha };
  }
  return cache[name];
}

async function saveCollection(name, message) {
  const conf = COLLECTIONS[name];
  const col = cache[name];
  const json = JSON.stringify(col.items, null, 2) + "\n";
  const result = await ghPutFile(conf.file, b64encode(json), message, col.sha);
  col.sha = result.content.sha;
}

// ---------- AUTH ----------
async function tryLogin(tok) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, {
    headers: { "Authorization": `Bearer ${tok}`, "Accept": "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error("Token tidak valid atau tidak punya akses ke repo.");
  const repo = await res.json();
  if (!repo.permissions || !repo.permissions.push) {
    throw new Error("Token valid tapi tidak punya izin push (Contents: Read and write).");
  }
  return repo;
}

async function initSession(tok, remember) {
  const repo = await tryLogin(tok);
  token = tok;
  if (remember) localStorage.setItem("evelly_cms_token", tok);
  $("repo-badge").textContent = `${repo.full_name} @ ${BRANCH}`;
  $("login-screen").classList.add("hidden");
  $("dashboard").classList.remove("hidden");
  await switchTab("projects");
}

$("login-btn").addEventListener("click", async () => {
  const tok = $("token-input").value.trim();
  const errEl = $("login-error");
  errEl.classList.add("hidden");
  if (!tok) { errEl.textContent = "Isi token dulu ya."; errEl.classList.remove("hidden"); return; }
  $("login-btn").textContent = "Memeriksa token...";
  try {
    await initSession(tok, $("remember-token").checked);
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove("hidden");
  } finally {
    $("login-btn").textContent = "Masuk Dashboard";
  }
});

$("token-input").addEventListener("keydown", e => { if (e.key === "Enter") $("login-btn").click(); });

$("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("evelly_cms_token");
  location.reload();
});

// auto-login kalau token tersimpan
(async () => {
  const saved = localStorage.getItem("evelly_cms_token");
  if (saved) {
    try { await initSession(saved, true); }
    catch { localStorage.removeItem("evelly_cms_token"); }
  }
})();

// ---------- TABS & LIST ----------
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

async function switchTab(name) {
  activeTab = name;
  document.querySelectorAll(".tab-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === name));
  $("section-title").textContent = COLLECTIONS[name].title;
  $("item-list").innerHTML = `<p class="text-gray-500 text-sm py-6 text-center animate-pulse">Loading...</p>`;
  try {
    await loadCollection(name);
    renderList();
  } catch (e) {
    $("item-list").innerHTML = `<p class="text-red-400 text-sm py-6 text-center">${e.message}</p>`;
  }
}

function renderList() {
  const conf = COLLECTIONS[activeTab];
  const items = cache[activeTab].items;
  const list = $("item-list");
  list.innerHTML = "";
  $("empty-msg").classList.toggle("hidden", items.length > 0);

  items.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-green-500/30 transition";
    row.innerHTML = `
      ${item.image ? `<img src="../${item.image}" class="w-14 h-10 object-cover rounded-lg border border-neutral-800 shrink-0" onerror="this.style.display='none'" />` : ""}
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm truncate">${conf.itemLabel(item) || "(tanpa judul)"}</p>
        <p class="text-gray-500 text-xs truncate">${conf.itemSub(item)}</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button class="btn btn-gray move-up" title="Naik" ${i === 0 ? "disabled" : ""}>↑</button>
        <button class="btn btn-gray move-down" title="Turun" ${i === items.length - 1 ? "disabled" : ""}>↓</button>
        <button class="btn btn-gray edit-btn">Edit</button>
        <button class="btn btn-red del-btn">Hapus</button>
      </div>
    `;
    row.querySelector(".edit-btn").addEventListener("click", () => openModal(i));
    row.querySelector(".del-btn").addEventListener("click", () => deleteItem(i));
    row.querySelector(".move-up").addEventListener("click", () => moveItem(i, -1));
    row.querySelector(".move-down").addEventListener("click", () => moveItem(i, 1));
    list.appendChild(row);
  });
}

async function moveItem(i, dir) {
  const items = cache[activeTab].items;
  const j = i + dir;
  if (j < 0 || j >= items.length) return;
  [items[i], items[j]] = [items[j], items[i]];
  renderList();
  await persist(`Reorder ${activeTab}`);
}

async function deleteItem(i) {
  const conf = COLLECTIONS[activeTab];
  const item = cache[activeTab].items[i];
  if (!confirm(`Hapus "${conf.itemLabel(item)}"?`)) return;
  cache[activeTab].items.splice(i, 1);
  renderList();
  await persist(`Delete ${activeTab}: ${conf.itemLabel(item)}`);
}

// ---------- MODAL / FORM ----------
$("add-btn").addEventListener("click", () => openModal(null));
$("modal-close").addEventListener("click", closeModal);
$("modal-cancel").addEventListener("click", closeModal);

function openModal(index) {
  editingIndex = index;
  pendingImage = null;
  const conf = COLLECTIONS[activeTab];
  const item = index !== null ? cache[activeTab].items[index] : {};
  $("modal-title").textContent = index !== null
    ? `Edit ${conf.title.slice(0, -1)}`
    : `Tambah ${conf.title.slice(0, -1)} Baru`;

  const form = $("modal-form");
  form.innerHTML = "";
  conf.fields.forEach(f => {
    const wrap = document.createElement("div");
    const val = item[f.key] ?? "";
    let inputHTML;
    if (f.type === "textarea") {
      inputHTML = `<textarea data-key="${f.key}" rows="4">${escapeHTML(val)}</textarea>`;
    } else if (f.type === "select") {
      inputHTML = `<select data-key="${f.key}">${f.options.map(o =>
        `<option value="${o}" ${o === val ? "selected" : ""}>${o}</option>`).join("")}</select>`;
    } else if (f.type === "tags") {
      const joined = Array.isArray(val) ? val.join(", ") : val;
      inputHTML = `<input type="text" data-key="${f.key}" data-type="tags" value="${escapeHTML(joined)}" />`;
    } else if (f.type === "date") {
      inputHTML = `<input type="date" data-key="${f.key}" value="${escapeHTML(val)}" />`;
    } else if (f.type === "image") {
      inputHTML = `
        <div class="space-y-2">
          ${val ? `<img src="../${val}" class="h-28 rounded-lg object-cover border border-neutral-800" onerror="this.style.display='none'" />` : ""}
          <input type="file" accept="image/*" data-key="${f.key}" data-type="image"
                 class="!p-2 file:mr-3 file:btn file:btn-gray file:border-0" />
          <p class="text-xs text-gray-500">Kosongkan kalau tidak mau ganti gambar.</p>
        </div>`;
    } else {
      inputHTML = `<input type="text" data-key="${f.key}" value="${escapeHTML(val)}" />`;
    }
    wrap.innerHTML = `<label class="text-xs text-gray-400 block mb-1.5">${f.label}${f.required ? ' <span class="text-red-400">*</span>' : ""}</label>${inputHTML}`;
    form.appendChild(wrap);
  });

  // listener file input
  form.querySelectorAll('input[data-type="image"]').forEach(inp => {
    inp.addEventListener("change", () => { pendingImage = inp.files[0] || null; });
  });

  $("modal").classList.remove("hidden");
}

function closeModal() {
  $("modal").classList.add("hidden");
  editingIndex = null;
  pendingImage = null;
}

function escapeHTML(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

$("modal-save").addEventListener("click", async () => {
  const conf = COLLECTIONS[activeTab];
  const form = $("modal-form");
  const item = editingIndex !== null ? { ...cache[activeTab].items[editingIndex] } : {};

  // kumpulkan nilai form
  for (const f of conf.fields) {
    if (f.type === "image") continue; // dihandle terpisah
    const el = form.querySelector(`[data-key="${f.key}"]`);
    let val = el.value.trim();
    if (f.type === "tags") {
      item[f.key] = val ? val.split(",").map(s => s.trim()).filter(Boolean) : [];
      continue;
    }
    if (f.required && !val) {
      toast(`"${f.label}" wajib diisi.`, true);
      return;
    }
    item[f.key] = val || null;
  }

  // id otomatis
  if (!item.id) {
    item.id = slugify(item.title || "") || `${activeTab}-${Date.now()}`;
    // pastikan unik
    const ids = new Set(cache[activeTab].items.map(x => x.id));
    let base = item.id, n = 2;
    while (ids.has(item.id)) item.id = `${base}-${n++}`;
  }

  const saveBtn = $("modal-save");
  saveBtn.disabled = true;
  saveBtn.textContent = "Menyimpan...";
  setStatus("Menyimpan perubahan...");

  try {
    // upload gambar baru dulu (kalau ada)
    if (pendingImage) {
      const ext = "." + (pendingImage.name.split(".").pop() || "png").toLowerCase();
      const path = `assets/projects/${item.id}${ext}`;
      const b64 = await fileToBase64(pendingImage);
      // cek file lama untuk dapat sha (replace)
      const existing = await ghGetFile(path);
      await ghPutFile(path, b64, `Upload image: ${path}`, existing ? existing.sha : null);
      item.image = path;
    }

    if (editingIndex !== null) cache[activeTab].items[editingIndex] = item;
    else cache[activeTab].items.push(item);

    await persist(`${editingIndex !== null ? "Update" : "Add"} ${activeTab}: ${conf.itemLabel(item)}`);
    renderList();
    closeModal();
  } catch (e) {
    toast(e.message, true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "💾 Simpan & Publish";
  }
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- SAVE ke GitHub ----------
async function persist(message) {
  setStatus("Commit ke GitHub...");
  try {
    await saveCollection(activeTab, message);
    setStatus("✅ Tersimpan — site akan auto-redeploy");
    toast("Perubahan tersimpan & di-commit ke GitHub!");
  } catch (e) {
    // konflik sha → reload lalu minta ulang
    if (/sha|conflict|409|422/i.test(e.message)) {
      await loadCollection(activeTab, true);
      renderList();
      setStatus("");
      toast("Data di repo berubah, list di-refresh. Coba simpan lagi.", true);
    } else {
      setStatus("");
      toast("Gagal menyimpan: " + e.message, true);
    }
    throw e;
  }
}

function setStatus(msg) {
  $("save-status").textContent = msg;
}
