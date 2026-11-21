# Product Explorer (CSE-2340 MP3-MP4)

An interactive product browser built with HTML, CSS and JavaScript.
Data comes from the free DummyJSON API (no API key needed): https://dummyjson.com/products

## Features
- Search by name/brand, filter by category, sort by price or rating
- Favorites (heart button) saved in localStorage, plus saved search/filter settings
- Loading, error (with retry) and empty states

## Requirement mapping
| Requirement | Where |
|---|---|
| DOM manipulation (MP3) | `render()`, `fillCategories()`, `document.querySelector` |
| Events + array methods (MP3) | `addEventListener`, `map`, `filter`, `find`, `forEach`, `sort` |
| fetch + async/await + states (MP4) | `fetchProducts()`, `init()`, `showLoading/showError/showEmpty` |
| localStorage (MP4) | `saveFavorites()`, `loadFavorites()`, `saveFilters()` |

## Run
Open `index.html` in a browser (internet required for the API).
