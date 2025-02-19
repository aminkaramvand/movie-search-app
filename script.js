const API_KEY = "0d6fb6888b251112cd86cfc53314a46f";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const overlay = document.querySelector(".overlay");

const searchForm = document.querySelector(".form-search");
const searchInput = document.querySelector(".search-input");
const movieContainer = document.querySelector(".movie-container");
const movieReview = document.querySelector(".column-right");
const sortingInput = document.querySelector(".sort-by");
const trailerContainer = document.querySelector(".trailer-container");
const popularMoviesButton = document.querySelector(".btn-popular");

let movies = [];
let curMovie;
let bookmarkedMovies = [];

const searchMovie = async function (e) {
  try {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    const res = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`
    );
    if (!res.ok) throw new Error("");

    const data = await res.json();

    if (data.results.length === 0)
      throw new Error(`Can't find your requested movie 😥`);
    movies = data.results;

    sortingInput.value = "most-popular";
    sortingMovies();

    displayResults();
  } catch (err) {
    console.error(err);
  }
};

const displayResults = function () {
  // Display sortinInput
  sortingInput.classList.remove("hidden");

  const markup = movies
    .map(
      (movie) => `
     <li class="movie">
      <a href="/#${movie.id}">
        <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${
        movie.title
      }" class="movie-img" />
        <div>
          <h4 class="movie-name">${movie.title}</h4>
          <p class="movie-date">${movie.release_date?.slice(0, 4)}</p>
          <p class="movie-rate">${
            movie.vote_average
          }⭐️rating <span>(voted by ${movie.vote_count})</span></p>
        </div>
      </a>
     </li>`
    )
    .join("");

  movieContainer.innerHTML = markup;
};

const displayMovieDetails = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    const [movieRespose, castCrewRespose, trailerRespose] = await Promise.all([
      fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`),
    ]);

    const [movie, castCrew, trailers] = await Promise.all([
      movieRespose.json(),
      castCrewRespose.json(),
      trailerRespose.json(),
    ]);

    curMovie = movie;

    const trailer = trailers.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    const casts = castCrew.cast.slice(0, 5);

    const director = castCrew.crew.find((person) => person.job === "Director")
      ? castCrew.crew.find((person) => person.job === "Director").name
      : null;

    const markup = `
          <button class="btn-watch-list">Watching list</button>
          ${
            movie.tagline
              ? `<p class="movie-tagline"><em>${movie.tagline}</em></p>`
              : ""
          }
         <div class="movie-review">
            <div class="movie-head">
           
              <img class="review-img" src="${
                IMAGE_BASE_URL + movie.poster_path
              }" alt="${movie.title}" />

            </div>
            <div class="review-data">
              <h3>${movie.title}</h3>
              ${
                movie.release_date
                  ? `<p class="movie-date">release: ${movie.release_date} </p>`
                  : ""
              }
              <p class="movie-rate">⭐️${movie.vote_average}</p>
              <p class="movie-time">${movie.runtime} min</p>
              <p class="genre">${movie.genres
                ?.map((gen) => gen.name)
                ?.join(", ")} </p>
              <p class="movie-lan">Lang: ${movie.original_language}-${
      movie.origin_country
    }
            ${
              movie.budget
                ? `<p class="movie-budget">budget: $${
                    movie.budget / 1000000
                  }million</p>`
                : ""
            }
              
            </div>
          </div>

          <div class="bookmark">
            <button class="btn-add-bookmark" data-movie-id="${
              movie.id
            }">Add to watching list</button>
          </div>

          <div class="movie-overview">
            ${
              casts.length !== 0
                ? `<p class="casts">Casts: ${casts
                    ?.map((cast) => cast.name)
                    .join(", ")}</p>`
                : ""
            }
          ${director ? `<p class="director">Director: ${director}</p>` : ""}
            <p class="overview">
             OVERVIEW: ${movie.overview}
            </p>
            <p class="trailer"${
              trailer
                ? `data-trailer-id="${trailer.key}">Click to watch movie trailer 🎬</p>`
                : `>Can't find trailer for this movie😥</p>`
            }
            ${
              movie.homepage
                ? `<a class="movie-homepage" href=" ${movie.homepage}" target="_blank">
             <i>Visit Movie's Homepage</i>
            </a>`
                : ""
            }
          </div>
    `;

    movieReview.innerHTML = markup;
  } catch (err) {
    console.error(err);
  }
};

async function getPopularMovies() {
  try {
    const res = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc`
    );
    const data = await res.json();
    movies = data.results;

    sortingInput.value = "most-popular";

    displayResults();
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

const sortingMovies = function (sortBy = "most-popular") {
  movies.sort((a, b) => {
    if (sortBy === "most-popular") return b.popularity - a.popularity;
    if (sortBy === "least-popular") return a.popularity - b.popularity;
    if (sortBy === "highest-rating") return b.vote_average - a.vote_average;
    if (sortBy === "lowest-rating") return a.vote_average - b.vote_average;
    if (sortBy === "release-asc")
      return new Date(b.release_date) - new Date(a.release_date);
    if (sortBy === "release-des")
      return new Date(a.release_date) - new Date(b.release_date);
    if (sortBy === "title-asc") return a.title.localeCompare(b.title);
    if (sortBy === "title-des") return b.title.localeCompare(a.title);
  });
};

const displayMovieTrailer = function (button) {
  const key = button.dataset.trailerId;
  console.log(key);
  if (!key) return;
  console.log(trailerContainer);
  trailerContainer.innerHTML = `
       <div class="trailer-popup">
            <button class="close-trailer">❌</button>
            <iframe 
                src="https://www.youtube.com/embed/${key}" 
                frameborder="0" allow="fullscreen">
            </iframe>
        </div>
    `;
  overlay.classList.remove("hidden");
};

const closeMovieTrailer = function () {
  overlay.classList.add("hidden");
  trailerContainer.innerHTML = "";
};

// displaying Bookmark
const displayBookmark = function () {
  const markup = generateBookmarkMarkup();

  movieReview.innerHTML = markup;
};

const generateBookmarkMarkup = function () {
  return `
      <div class="bookmark-inform">
        <h3>Movies In Your List</h3>
        <p>#️⃣${bookmarkedMovies.length} movies</p>
      </div>
      <hr/>
      <ul class="bookmark-list">
      ${bookmarkedMovies
        .map(
          (movie, i) =>
            `
        <li class="bookmark-movie">
         <button class="btn-remove-bookmark" data-movie-id="${
           movie.id
         }">&times;</button>
          <a href="/#${movie.id}">
            <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${
              movie.title
            }" class="bookmark-img" />
           <div class="movie-inform">
             <h4 class="movie-name">${movie.title}</h4>
             <div class="movie-rate-inform">
               <p class="movie-rate">${movie.vote_average}⭐️</p>
             </div>
           </div>
          </a>
        </li>`
        )
        .join("")}
      </ul>
  `;
};

const updateBookmark = function () {
  const newMarkup = generateBookmarkMarkup();
  const newDOM = document.createRange().createContextualFragment(newMarkup);
  const newElements = Array.from(newDOM.querySelectorAll("*"));
  const curElements = Array.from(movieReview.querySelectorAll("*"));

  newElements.forEach((newEl, i) => {
    const curEl = curElements.at(i);

    if (
      !newEl.isEqualNode(curEl) &&
      newEl.firstChild?.nodeValue.trim() !== ""
    ) {
      curEl.textContent = newEl.textContent;
    }

    if (!newEl.isEqualNode(curEl)) {
      Array.from(newEl?.attributes).forEach((attr) =>
        curEl.setAttribute(attr.name, attr.value)
      );
    }
  });
};

const clearHash = function () {
  const scrollY = window.scrollY;
  window.location.hash = "";
  window.scrollTo(0, scrollY);
};
const addToBookmark = function () {
  if (bookmarkedMovies.find((movie) => movie.id === curMovie.id)) return;
  bookmarkedMovies.push(curMovie);
  displayBookmark();
  saveToStorage();
  clearHash();
};

const removeFromBookmark = function (id, parent) {
  bookmarkedMovies = bookmarkedMovies.filter((movie) => movie.id !== id);
  parent.remove();
  updateBookmark();
  saveToStorage();
};

searchForm.addEventListener("submit", searchMovie);

popularMoviesButton.addEventListener("click", getPopularMovies);

window.addEventListener("hashchange", displayMovieDetails);

window.addEventListener("load", function () {
  displayBookmark();
  displayMovieDetails();
});

sortingInput.addEventListener("change", function (e) {
  sortingMovies(e.target.value);
  displayResults();
});

movieReview.addEventListener("click", function (e) {
  const watchListButton = e.target.closest(".btn-watch-list");
  if (!watchListButton) return;
  displayBookmark();
  clearHash();
});
movieReview.addEventListener("click", function (e) {
  const trailerButton = e.target.closest(".trailer");
  if (!trailerButton) return;
  displayMovieTrailer(trailerButton);
});

// Click on close button in trailer container
trailerContainer.addEventListener("click", function (e) {
  const close = e.target.closest(".close-trailer");

  if (close) closeMovieTrailer();
});

overlay.addEventListener("click", closeMovieTrailer);

// BOOKMARK
movieReview.addEventListener("click", function (e) {
  const addBookmarkButton = e.target.closest(".btn-add-bookmark");
  if (!addBookmarkButton) return;
  addToBookmark();
});

movieReview.addEventListener("click", function (e) {
  const removeBookmarkButton = e.target.closest(".btn-remove-bookmark");
  if (!removeBookmarkButton) return;
  removeFromBookmark(
    +removeBookmarkButton.dataset.movieId,
    removeBookmarkButton.parentElement
  );
});

const saveToStorage = function () {
  localStorage.setItem("bookmark", JSON.stringify(bookmarkedMovies));
};

const loadFromStorage = function () {
  bookmarkedMovies = JSON.parse(localStorage.getItem("bookmark"))
    ? JSON.parse(localStorage.getItem("bookmark"))
    : [];
};

loadFromStorage();
