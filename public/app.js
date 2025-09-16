const apiBase = '/api/posts';

const form = document.getElementById('post-form');
const inputId = document.getElementById('post-id');
const inputTitle = document.getElementById('title');
const inputDesc = document.getElementById('description');
const cancelBtn = document.getElementById('cancel-edit');
const postsEl = document.getElementById('posts');

async function fetchJSON(url, options) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

function renderPosts(posts) {
  if (!posts.length) {
    postsEl.innerHTML = '<p>Belum ada post. Tambahkan yang pertama!</p>';
    return;
  }
  postsEl.innerHTML = posts.map(p => `
    <article class="post">
      <div class="title">${escapeHtml(p.title)}</div>
      <div>${escapeHtml(p.description)}</div>
      <div class="meta">Dibuat: ${formatDate(p.created_at)} • Diperbarui: ${formatDate(p.updated_at)}</div>
      <div class="row">
        <button data-edit="${p.id}">Edit</button>
        <button class="danger" data-delete="${p.id}">Hapus</button>
      </div>
    </article>
  `).join('');
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(d) {
  try { return new Date(d).toLocaleString('id-ID'); } catch { return d; }
}

async function loadPosts() {
  try {
    const data = await fetchJSON(apiBase);
    renderPosts(data);
  } catch (e) {
    postsEl.innerHTML = '<p>Gagal memuat post. Pastikan server berjalan.</p>';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = { title: inputTitle.value.trim(), description: inputDesc.value.trim() };
  if (!payload.title || !payload.description) return;
  const id = inputId.value;
  try {
    if (id) {
      await fetchJSON(`${apiBase}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await fetchJSON(apiBase, { method: 'POST', body: JSON.stringify(payload) });
    }
    form.reset();
    inputId.value = '';
    cancelBtn.hidden = true;
    await loadPosts();
  } catch (e) { alert('Gagal menyimpan.'); }
});

cancelBtn.addEventListener('click', () => {
  form.reset();
  inputId.value = '';
  cancelBtn.hidden = true;
});

postsEl.addEventListener('click', async (e) => {
  const editId = e.target.getAttribute('data-edit');
  const deleteId = e.target.getAttribute('data-delete');
  if (editId) {
    try {
      const post = await fetchJSON(`${apiBase}/${editId}`);
      inputId.value = post.id;
      inputTitle.value = post.title;
      inputDesc.value = post.description;
      cancelBtn.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { alert('Gagal mengambil data.'); }
  }
  if (deleteId) {
    if (!confirm('Yakin hapus post ini?')) return;
    try {
      await fetchJSON(`${apiBase}/${deleteId}`, { method: 'DELETE' });
      await loadPosts();
    } catch { alert('Gagal menghapus.'); }
  }
});

loadPosts();


