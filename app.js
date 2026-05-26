if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("SW registered"))
    .catch(err => console.log("SW error:", err));
}
let comics = JSON.parse(localStorage.getItem('comics')) || [];
let currentTab = 'all';

function saveComics() {
  localStorage.setItem('comics', JSON.stringify(comics));
}

function setTab(tab) {
  currentTab = tab;
  renderComics();
}

function updateStats() {
  document.getElementById('stat-total').innerText = comics.length;
  document.getElementById('stat-wishlist').innerText = comics.filter(c => c.wishlist).length;
  document.getElementById('stat-read').innerText = comics.filter(c => c.status === 'Olvasott').length;
}

// HOZZÁADÁS
function addComic() {

  const title = document.getElementById('title').value.trim();
  const publisher = document.getElementById('publisher').value.trim();
  const status = document.getElementById('status').value;
  const wishlist = document.getElementById('wishlist').checked;
  const file = document.getElementById('cover').files[0];

  if (!title) {
    alert("Adj meg címet!");
    return;
  }

  function add(cover) {

    comics.push({
      title,
      publisher,
      status,
      wishlist,
      cover: cover || '',
      createdAt: Date.now()
    });

    saveComics();
    renderComics();

    document.getElementById('title').value = '';
    document.getElementById('publisher').value = '';
    document.getElementById('wishlist').checked = false;
    document.getElementById('cover').value = '';
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = e => add(e.target.result);
    reader.readAsDataURL(file);
  } else {
    add('');
  }
}

// TÖRLÉS
function deleteComic(i) {
  comics.splice(i, 1);
  saveComics();
  renderComics();
}

// OLVASOTT
function toggleRead(i) {
  comics[i].status =
    comics[i].status === 'Olvasott'
      ? 'Nem olvasott'
      : 'Olvasott';

  saveComics();
  renderComics();
}

// SZERKESZTÉS
function editComic(i) {
  const newTitle = prompt("Új cím:", comics[i].title);
  if (newTitle) comics[i].title = newTitle;
  saveComics();
  renderComics();
}

// RENDEZÉS
function sortComics(list) {

  const sort = document.getElementById('sort').value;

  if (sort === 'az') return list.sort((a,b) => a.title.localeCompare(b.title));
  if (sort === 'za') return list.sort((a,b) => b.title.localeCompare(a.title));
  if (sort === 'old') return list.sort((a,b) => a.createdAt - b.createdAt);
  return list.sort((a,b) => b.createdAt - a.createdAt);
}

// RENDER
function renderComics() {

  const list = document.getElementById('comic-list');
  list.innerHTML = '';

  const search = document.getElementById('search').value.toLowerCase();

  let filtered = comics;

  if (search) {
    filtered = filtered.filter(c => c.title.toLowerCase().includes(search));
  }

  if (currentTab === 'wishlist') {
    filtered = filtered.filter(c => c.wishlist);
  }

  if (currentTab === 'read') {
    filtered = filtered.filter(c => c.status === 'Olvasott');
  }

  filtered = sortComics(filtered);

  filtered.forEach((comic, i) => {

    const card = document.createElement('div');
    card.className = 'card';

    const cover = comic.cover
      ? `<img src="${comic.cover}">`
      : `<div style="height:260px;display:flex;align-items:center;justify-content:center;background:#333;">Nincs borító</div>`;

    card.innerHTML = `
      ${cover}
      <div class="card-body">
        <h3>${comic.title}</h3>
        <div class="small">${comic.publisher || ''}</div>
        <div class="small">${comic.status}</div>
        <div class="small">Wishlist: ${comic.wishlist ? 'Igen' : 'Nem'}</div>

        <button onclick="toggleRead(${i})">Olvasott váltás</button>
        <button onclick="editComic(${i})">Szerkesztés</button>
        <button onclick="deleteComic(${i})">Törlés</button>
      </div>
    `;

    list.appendChild(card);
  });

  updateStats();
}

// indulás
renderComics();