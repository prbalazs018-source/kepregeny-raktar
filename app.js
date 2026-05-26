let comics = [];

// BETÖLTÉS FIREBASE-BŐL
async function loadComics() {

  const snapshot = await window.firestore.getDocs(window.comicsRef);

  comics = [];

  snapshot.forEach(docSnap => {
    comics.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderComics();
}

// HOZZÁADÁS
async function addComic() {

  const title = document.getElementById('title').value;
  const publisher = document.getElementById('publisher').value;
  const status = document.getElementById('status').value;
  const wishlist = document.getElementById('wishlist').checked;
  const file = document.getElementById('cover').files[0];

  function saveToCloud(cover) {

    window.firestore.addDoc(window.comicsRef, {
      title,
      publisher,
      status,
      wishlist,
      cover: cover || ""
    });

    loadComics();
  }

  if (file) {

    const reader = new FileReader();

    reader.onload = e => saveToCloud(e.target.result);
    reader.readAsDataURL(file);

  } else {
    saveToCloud("");
  }
}

// TÖRLÉS
async function deleteComic(id) {
  await window.firestore.deleteDoc(window.firestore.doc(window.db, "comics", id));
  loadComics();
}

// OLVASOTT
async function toggleRead(comic) {

  await window.firestore.updateDoc(
    window.firestore.doc(window.db, "comics", comic.id),
    {
      status: comic.status === "Olvasott" ? "Nem olvasott" : "Olvasott"
    }
  );

  loadComics();
}

// SZERKESZTÉS
async function editComic(comic) {

  const newTitle = prompt("Új cím:", comic.title);

  if (newTitle) {
    await window.firestore.updateDoc(
      window.firestore.doc(window.db, "comics", comic.id),
      { title: newTitle }
    );
  }

  loadComics();
}

// RENDER
function renderComics() {

  const list = document.getElementById('comic-list');
  const search = document.getElementById('search').value?.toLowerCase() || "";

  list.innerHTML = "";

  comics
    .filter(c => c.title.toLowerCase().includes(search))
    .forEach(comic => {

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        ${comic.cover ? `<img src="${comic.cover}">` : ""}
        <h3>${comic.title}</h3>
        <p>${comic.publisher || ""}</p>
        <p>${comic.status}</p>
        <p>Wishlist: ${comic.wishlist ? "Igen" : "Nem"}</p>

        <button onclick='toggleRead(${JSON.stringify(comic)})'>Olvasott</button>
        <button onclick='editComic(${JSON.stringify(comic)})'>Szerkesztés</button>
        <button onclick='deleteComic("${comic.id}")'>Törlés</button>
      `;

      list.appendChild(card);
    });
}

// indulás
loadComics();
