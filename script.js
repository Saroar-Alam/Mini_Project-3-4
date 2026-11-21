// ===== Product Explorer =====
// MP3: DOM manipulation, events, array methods | MP4: fetch/async-await, states, localStorage

const API_URL = "https://dummyjson.com/products?limit=100";
const FAV_KEY = "pe_favorites";
const FILTER_KEY = "pe_filters";

// ---- DOM selectors ----
const grid = document.querySelector("#productGrid");
const statusBox = document.querySelector("#status");
const resultInfo = document.querySelector("#resultInfo");
const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const sortSelect = document.querySelector("#sortSelect");
const favToggle = document.querySelector("#favToggle");
const favCount = document.querySelector("#favCount");

// ---- App data ----
let products = [];                    // all products from API
let favorites = loadFavorites();      // array of product ids
let showFavOnly = false;

// ---- Local Storage (MP4) ----
function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch {
    return [];
  }
}
function saveFavorites() {
  localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
}
function saveFilters() {
  localStorage.setItem(FILTER_KEY, JSON.stringify({
    search: searchInput.value,
    category: categorySelect.value,
    sort: sortSelect.value,
    favOnly: showFavOnly
  }));
}
function restoreFilters() {
  try {
    const saved = JSON.parse(localStorage.getItem(FILTER_KEY));
    if (!saved) return;
    searchInput.value = saved.search || "";
    sortSelect.value = saved.sort || "default";
    showFavOnly = !!saved.favOnly;
    favToggle.setAttribute("aria-pressed", showFavOnly);
    // category is restored after the options are created (see fillCategories)
    categorySelect.dataset.saved = saved.category || "all";
  } catch { /* ignore broken data */ }
}

// ---- UI states (MP4) ----
function showLoading() {
  statusBox.className = "status";
  statusBox.innerHTML = '<div class="spinner"></div>Loading products...';
  grid.innerHTML = "";
  resultInfo.textContent = "";
}
function showError(message) {
  statusBox.className = "status error";
  statusBox.innerHTML = `<p>${message}</p><button id="retryBtn">Try again</button>`;
  document.querySelector("#retryBtn").addEventListener("click", init);
}
function showEmpty() {
  statusBox.className = "status";
  statusBox.textContent = showFavOnly && favorites.length === 0
    ? "No favorites yet. Tap the heart on a product to save it."
    : "No products match your search. Try a different word or category.";
}
function clearStatus() {
  statusBox.textContent = "";
}

// ---- API (MP4) ----
async function fetchProducts() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Server error: " + response.status);
  const data = await response.json();
  return data.products;
}

// ---- Rendering (MP3) ----
function fillCategories() {
  const categories = [...new Set(products.map(p => p.category))].sort();
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.replace(/-/g, " ");
    categorySelect.appendChild(option);
  });
  categorySelect.value = categorySelect.dataset.saved || "all";
  if (categorySelect.value === "") categorySelect.value = "all";
}

function getVisibleProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  let list = products.filter(p => {
    const matchText = p.title.toLowerCase().includes(term) ||
                      (p.brand || "").toLowerCase().includes(term);
    const matchCat = category === "all" || p.category === category;
    const matchFav = !showFavOnly || favorites.includes(p.id);
    return matchText && matchCat && matchFav;
  });

  if (sortSelect.value === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "rating") list.sort((a, b) => b.rating - a.rating);
  return list;
}

function render() {
  const list = getVisibleProducts();
  favCount.textContent = favorites.length;
  grid.innerHTML = "";

  if (list.length === 0) {
    resultInfo.textContent = "";
    showEmpty();
    return;
  }
  clearStatus();
  resultInfo.textContent = `Showing ${list.length} of ${products.length} products`;

  grid.innerHTML = list.map(p => {
    const isFav = favorites.includes(p.id);
    return `
      <article class="card">
        <button class="heart ${isFav ? "active" : ""}" data-id="${p.id}"
                aria-label="${isFav ? "Remove from" : "Add to"} favorites">${isFav ? "♥" : "♡"}</button>
        <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
        <div class="body">
          <h3>${p.title}</h3>
          <span class="cat">${p.category.replace(/-/g, " ")}</span>
          <div class="row">
            <span>$${p.price.toFixed(2)}</span>
            <span class="rating">★ ${p.rating.toFixed(1)}</span>
          </div>
        </div>
      </article>`;
  }).join("");
}

// ---- Event handling (MP3) ----
function toggleFavorite(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  favorites = favorites.includes(id)
    ? favorites.filter(favId => favId !== id)
    : [...favorites, id];
  saveFavorites();
  render();
}

grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".heart");
  if (btn) toggleFavorite(Number(btn.dataset.id));
});

searchInput.addEventListener("input", () => { saveFilters(); render(); });
categorySelect.addEventListener("change", () => { saveFilters(); render(); });
sortSelect.addEventListener("change", () => { saveFilters(); render(); });
favToggle.addEventListener("click", () => {
  showFavOnly = !showFavOnly;
  favToggle.setAttribute("aria-pressed", showFavOnly);
  saveFilters();
  render();
});

// ---- Start ----
async function init() {
  showLoading();
  restoreFilters();
  try {
    products = await fetchProducts();
    categorySelect.length = 1;   // keep only "All categories"
    fillCategories();
    render();
  } catch (error) {
    showError("Could not load products. Check your internet connection and try again.");
    console.error(error);
  }
}
init();
