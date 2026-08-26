"use strict";

// API search results are paired with these local pictures.
// The API supplies information, but artwork always comes from this project.
const localPosters = [
  "images/jjk.jpg",
  "images/Moriarty.jpg",
  "images/murakami.jpg",
  "images/Book.jpg",
  "images/AUDICIÓN.jpg",
  "images/under the oak tree novel.jpg",
  "images/A Time-Bound Wicked Woman Wishes for the Fall of the Empire.jpg",
  "images/The Locked Library Exclusive_ The Book That Broke the World by Mark Lawrence_ Front Dustcover Design.jpg",
];

const showGrid = document.querySelector("#show-grid");
const resultsMessage = document.querySelector("#results-message");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const filterButtons = document.querySelectorAll(".filter-button");

// State holds information that changes while the visitor uses the page.
const state = {
  shows: [],
  originalShows: [],
  activeFilter: "All",
};

// Load the starting, hardcoded catalogue from our own JSON file.
async function loadLocalCatalogue() {
  try {
    const response = await fetch("data.Json");

    if (!response.ok) {
      throw new Error("The local catalogue could not be loaded.");
    }

    const shows = await response.json();
    state.shows = shows;
    state.originalShows = shows;
    applyCurrentFilter();
  } catch (error) {
    showGrid.innerHTML = createEmptyState("Start a local server, then refresh this page.");
    resultsMessage.textContent = "The catalogue file could not be read.";
    console.error(error);
  }
}

// Turn one JavaScript show object into one HTML card.
function createShowCard(show) {
  const episodeText = show.type === "Movie"
    ? "Film"
    : show.episodes
      ? `${show.episodes} episodes`
      : show.status || "Series";
  const genreTags = show.genres
    .slice(0, 2)
    .map((genre) => `<span>${genre}</span>`)
    .join("");

  return `
    <article class="show-card">
      <div class="poster-wrapper">
        <img src="${show.image}" alt="${show.title} cover" loading="lazy" />
        <span class="type-label">${show.type}</span>
        <button class="save-button" type="button" aria-label="Add ${show.title} to my list" aria-pressed="false">
          <i class="fa-regular fa-bookmark"></i>
        </button>
        <span class="rating"><i class="fa-solid fa-star"></i> ${show.score}</span>
      </div>
      <div class="card-details">
        <h3 title="${show.title}">${show.title}</h3>
        <p class="show-meta">
          <span>${show.year || "Year unknown"}</span>
          <span class="dot"></span>
          <span>${episodeText}</span>
        </p>
        <div class="genre-list">${genreTags}</div>
      </div>
    </article>
  `;
}

function createEmptyState(message) {
  return `
    <div class="empty-state">
      <i class="fa-regular fa-face-frown-open"></i>
      <p>${message}</p>
    </div>
  `;
}

// Draw an array of shows on the page.
function renderShows(shows) {
  if (shows.length === 0) {
    showGrid.innerHTML = createEmptyState("No titles match this filter.");
    resultsMessage.textContent = "0 titles found";
    return;
  }

  showGrid.innerHTML = shows.map(createShowCard).join("");
  resultsMessage.textContent = `${shows.length} title${shows.length === 1 ? "" : "s"} found`;
}

function applyCurrentFilter() {
  const filteredShows = state.shows.filter((show) => {
    return state.activeFilter === "All" || show.type === state.activeFilter;
  });

  renderShows(filteredShows);
}

function setActiveFilter(filterName) {
  state.activeFilter = filterName;

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filterName);
  });

  applyCurrentFilter();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveFilter(button.dataset.filter));
});

document.querySelectorAll("[data-filter-link]").forEach((link) => {
  link.addEventListener("click", () => setActiveFilter(link.dataset.filterLink));
});

// Search TVMaze, a public series API. No API key is needed.
async function searchShows(query) {
  resultsMessage.textContent = `Searching for “${query}”...`;
  showGrid.innerHTML = "";

  try {
    const apiUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`The API returned status ${response.status}.`);
    }

    const result = await response.json();

    // Convert the API's property names into the shape expected by our cards.
    state.shows = result.slice(0, 8).map((item, index) => ({
      id: item.show.id,
      title: item.show.name,
      type: "Series",
      score: item.show.rating.average || "N/A",
      episodes: null,
      status: item.show.status,
      year: item.show.premiered ? item.show.premiered.slice(0, 4) : null,
      genres: item.show.genres.length ? item.show.genres : ["Television"],
      image: localPosters[index % localPosters.length],
    }));

    setActiveFilter("All");
    resultsMessage.textContent = `${state.shows.length} API result${state.shows.length === 1 ? "" : "s"} for “${query}”`;
  } catch (error) {
    // If the internet/API fails, search the original local catalogue instead.
    state.shows = state.originalShows.filter((show) => {
      return show.title.toLowerCase().includes(query.toLowerCase());
    });
    setActiveFilter("All");
    resultsMessage.textContent = "The API is unavailable, so local titles are shown instead.";
    console.error(error);
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();

  if (query === "") {
    state.shows = state.originalShows;
    setActiveFilter("All");
    resultsMessage.textContent = "Showing the full local catalogue.";
    return;
  }

  searchShows(query);
});

// Event delegation manages bookmarks on both local and new API cards.
showGrid.addEventListener("click", (event) => {
  const saveButton = event.target.closest(".save-button");

  if (!saveButton) return;

  const isSaved = saveButton.classList.toggle("saved");
  saveButton.setAttribute("aria-pressed", isSaved);
  saveButton.querySelector("i").className = isSaved
    ? "fa-solid fa-bookmark"
    : "fa-regular fa-bookmark";
});

document.querySelector(".theme-button").addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  document.querySelector(".theme-button i").className = isLight
    ? "fa-regular fa-sun"
    : "fa-regular fa-moon";
});

document.querySelector("#hero-save-button").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const isSaved = button.classList.toggle("saved");
  button.innerHTML = isSaved
    ? '<i class="fa-solid fa-check"></i> Saved'
    : '<i class="fa-regular fa-bookmark"></i> My list';
});

const continueList = document.querySelector(".continue-list");
document.querySelector(".scroll-left").addEventListener("click", () => {
  continueList.scrollBy({ left: -300, behavior: "smooth" });
});
document.querySelector(".scroll-right").addEventListener("click", () => {
  continueList.scrollBy({ left: 300, behavior: "smooth" });
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
loadLocalCatalogue();
