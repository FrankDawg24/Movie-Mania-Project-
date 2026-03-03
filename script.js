document.addEventListener("load", () => {
  updateTask();
});
/**
 * Get the DOM elements for toggle button, sidebar, flex-box, searchbar, dbObjectFavList, and dbLastInput
 */

const toggleButton = document.getElementById("toggle-sidebar");
const sidebar = document.getElementById("sidebar");
const flexBox = document.getElementById("flex-box");
const searchbar = document.getElementById("search-bar");

/**
 * Check and initialize the local storage items for watchlist.
 */

const dbObjectFavList = "favMovieList";
if (localStorage.getItem(dbObjectFavList) == null) {
  localStorage.setItem(dbObjectFavList, JSON.stringify([]));
}

/**
 * Update the task counter with the current number of items in the watchlist.
 */
function updateTask() {
  const favCounter = document.getElementById("total-counter");
  const db = JSON.parse(localStorage.getItem(dbObjectFavList));
  if (favCounter.innerText != null) {
    favCounter.innerText = db.length;
  }
}

/**
 * Check if an ID is in a list of watchlists
 *
 * @param list The list of watchlists
 * @param id The ID to check
 * @return true if the ID is in the list, false otherwise
 */

function isFav(list, id) {
  let res = false;
  for (let i = 0; i < list.length; i++) {
    if (id == list[i]) {
      res = true;
    }
  }
  return res;
}

/**************************** Some Usefull Utility Function***************************** */

/**
 * It return truncated string greater then 50
 * @param {*} str
 * @param {*} n
 * @returns
 */
function truncate(str, n) {
  return str?.length > n ? str.substr(0, n - 1) + "..." : str;
}

/**
 * Generates a random character string starting
 * @returns {string} The generated string
 */
function generateOneCharString() {
  var possible = "abcdefghijklmnopqrstuvwxyz";
  return possible.charAt(Math.floor(Math.random() * possible.length));
}

/**
 * Function to toggle the sidebar and display the list of watchlist movies.
 * When the toggle button is clicked, the sidebar is shown or hidden and the list of watchlist movies is displayed.
 * The flexBox class is also toggled to adjust the layout of the page.
 *
 */
toggleButton.addEventListener("click", function () {
  showFavMovieList();
  sidebar.classList.toggle("show");
  flexBox.classList.toggle("shrink");
});

/**
 * @event toggleButton - feature  when clicked, triggers the event listener.
 * @function showFavMovieList - The function that is called when the toggle button is clicked. It selects the favorite movie option with the list of watchlist movies.
 * @element sidebar - feature that has the "show" class added or removed.
 * @element flexBox - feature that has the "shrink" class added or removed.
 */

flexBox.onscroll = function () {
  if (flexBox.scrollTop > searchbar.offsetTop) {
    searchbar.classList.add("fixed");
  } else {
    searchbar.classList.remove("fixed");
  }
};

/**
 * Fetching movies from API
 *
 * @param {string} url - The base URL for the API
 * @param {string} value - The value to append to the URL for filtering the results
 *
 * @returns {Promise} A promise that resolves to the JSON data of the movies
 */

const fetchMoviesFromApi = async (url, value) => {
  const response = await fetch(`${url + value}`);
  const movies = await response.json();
  return movies;
};

/**
 * showMovieList - function to show movie list based on search input
 *
 * @returns {void}
 *
 * This function first retrieves the data from local storage and then it fetches the movies data from API
 * using the fetchMoviesFromApi function. It maps over the movies data and creates the HTML template
 * for each movie. This HTML template is then added to the DOM.
 */

async function showMovieList() {
  const list = JSON.parse(localStorage.getItem(dbObjectFavList));
  const inputValue = document.getElementById("search-input").value;
  const url = "https://www.omdbapi.com/?apikey=7b6b319d&s=";
  const moviesData = await fetchMoviesFromApi(url, inputValue);
  let html = "";
  if (moviesData.Search) {
    html = moviesData.Search.map((element) => {
      return `
        
                 
                    <div class="card">
                    <div class="card-top"  onclick="showMovieDetails('${
                      element.imdbID
                    }', '${inputValue}')">
                        <div class="movie-poster" >
                        <img src="${
                          element.Poster == "N/A"
                            ? "./assets/backdrop.jpg"
                            : element.Poster
                        }" alt="">
                        </div>
                        <div class="movie-name">
                           ${element.Title}
                        </div>
                        <div class="movie-year">
                          (  ${element.Year})
            
                            <span class="button" onclick="showMovieDetails('${
                              element.imdbID
                            }', '${inputValue}')">Movie Info</span>
                         
                        </div>
                    </div>
                    <div class="card-bottom">
                        <div class="like">
        <Strong> Add to Watchlist: </Strong>
                        <i class="fa-solid fa-star ${
                          isFav(list, element.imdbID) ? "active" : ""
                        } " onclick="addRemoveToFavList('${
        element.imdbID
      }')"></i>
                        
                        </div>
                        <button class="trailer-btn" onclick="openTrailer('${element.Title}','${element.Year}')">&#9654; Watch Trailer</button>
                    </div>
                </div>
                    `;
    }).join("");
    document.getElementById("cards-holder").innerHTML = html;
  }
}

/**
 * addRemoveToFavList - function to add or remove a movie from the Watch list
 *
 * @param {string} id - The id of the movie to be added or removed
 *
 * This function first retrieves the data from local storage and then it checks if the provided movie id already exist in the watchlist list.
 * If it exists, it removes it from the list, otherwise it adds it to the list. It then updates the local storage and updates the UI.
 */

function addRemoveToFavList(id) {
  const detailsPageLikeBtn = document.getElementById("like-button");
  let db = JSON.parse(localStorage.getItem(dbObjectFavList));
  console.log("before: ", db);
  let ifExist = false;
  for (let i = 0; i < db.length; i++) {
    if (id == db[i]) {
      ifExist = true;
    }
  }
  if (ifExist) {
    db.splice(db.indexOf(id), 1);
  } else {
    db.push(id);
  }

  localStorage.setItem(dbObjectFavList, JSON.stringify(db));
  if (detailsPageLikeBtn != null) {
    detailsPageLikeBtn.innerHTML = isFav(db, id)
      ? "Remove From Watchlist"
      : "Add To Watchlist";
  }

  console.log("After:", db);
  showMovieList();
  showFavMovieList();
  updateTask();
}

/**
 * Show details for a specific movie
 * @async
 * @function
 * @param {string} itemId - The ID of the movie to show details for
 * @param {string} searchInput - The search input used to fetch the related movies
 */

async function showMovieDetails(itemId, searchInput) {
  console.log("searchInput:...............", searchInput);
  const list = JSON.parse(localStorage.getItem(dbObjectFavList));
  flexBox.scrollTo({ top: 0, behavior: "smooth" });
  const url = "https://www.omdbapi.com/?apikey=7b6b319d&i=";
  const searchUrl = "https://www.omdbapi.com/?apikey=7b6b319d&s=";
  const movieList = await fetchMoviesFromApi(searchUrl, searchInput);
  console.log("movieslist:..........", movieList);
  let html = "";
  const movieDetails = await fetchMoviesFromApi(url, itemId);
  if (movieDetails) {
    html = `
                <div class="container remove-top-margin">
        
                    <div class="header hide">
                        <div class="title">
                            Let's watch Something New
                        </div>
                    </div>
                    <div class="fixed" id="search-bar">
                        <div class="icon">
                            <i class="fa-solid fa-search "></i>
                        </div>
                        <div class="new-search-input">
                            <form onkeyup="showMovieList()">
                                <input id="search-input" type="text" placeholder="Search Movie Title.." />
                            </form>
                        </div>
                    </div>
                </div>
                <div class="item-details">
                <div class="item-details-left">
                <img src="${
                  movieDetails.Poster == "N/A"
                    ? "./assets/backdrop.jpg"
                    : movieDetails.Poster
                }" alt="">
            </div>
            <div class="item-details-right">
                <div class="item-name">
                    <strong>Movie Name: </strong>
                    <span class="item-text">
                    ${movieDetails.Title}
                    </span>
                 </div>
                <div class="movie-category">
                    <strong>Genre: </strong>
                    <span class="item-text">
                    ${movieDetails.Genre}
                    </span>
                </div>
                <div class="movie-info">
                    <strong>Actors: </strong>
                    <span class="item-text">
                    ${movieDetails.Actors}
                    </span>
                </div>

                <div class="movie-info">
                <strong>Directors: </strong>
                <span class="item-text">
                ${movieDetails.Director}
                </span>
            </div>
                <div class="movie-plot">
                    <strong>Plot: </strong>
                    <span class="item-text">
                    ${movieDetails.Plot}
                    </span>
                </div>
                <div class="movie-rating">
                    <strong>Ratings: </strong>
                    <span class="item-text"> 
                    ${movieDetails.Ratings[0].Value}
                  
                    </span>
                    <div id="like-button" onclick="addRemoveToFavList('${
                      movieDetails.imdbID
                    }')"> 
                     ${
                       isFav(list, movieDetails.imdbID)
                         ? "Remove From Watchlist"
                         : "Add To Watchlist"
                     } </div>
                    <button class="trailer-btn trailer-btn-details" onclick="openTrailer('${movieDetails.Title}','${movieDetails.Year}')">&#9654; Watch Trailer</button>
                </div>
            </div>
        </div> 
                <div class="card-name">
                Related Items
            </div>
            <div id="cards-holder" class=" remove-top-margin ">`;
  }
  if (movieList.Search) {
    html += movieList.Search.map((element) => {
      return `       
                    <div class="card">
                        <div class="card-top"  onclick="showMovieDetails('${
                          element.imdbID
                        }', '${searchInput}')">
                            <div class="movie-poster" >
                            <img src="${
                              element.Poster == "N/A"
                                ? "./assets/backdrop.jpg"
                                : element.Poster
                            }" alt="">
                            </div>
                            <div class="movie-name">
                                ${element.Title}
                            </div>
                            <div class="movie-year">
                                ${element.Year}
                                <span class="button" onclick="showMovieDetails('${
                                  element.imdbID
                                }', '${searchInput}')">Movie Info</span>
                            </div>
                        </div>
                        <div class="card-bottom">
                        <div class="like">
        <Strong> Add to Watchlist: </Strong>
                        <i class="fa-solid fa-star ${
                          isFav(list, element.imdbID) ? "active" : ""
                        } " onclick="addRemoveToFavList('${
        element.imdbID
      }')"></i>
                        
                        </div>
                        <button class="trailer-btn" onclick="openTrailer('${element.Title}','${element.Year}')">&#9654; Watch Trailer</button>
                    </div>
                    </div>
                `;
    }).join("");
  }

  html = html + "</div>";

  document.getElementById("flex-box").innerHTML = html;
}

/**
        
        This function is used to show all the movies which are added to the watchlist.
        
        @function
        
        @async
        
        @returns {string} html - This returns html which is used to show the watchlist movies.
        
        @throws {Error} If there is no movie selected to add to the watcglist, then it will show "Nothing To Show....."
        
        @example
        
        showFavMovieList()
        */
async function showFavMovieList() {
  let favList = JSON.parse(localStorage.getItem(dbObjectFavList));
  let url = "https://www.omdbapi.com/?apikey=7b6b319d&i=";
  let html = "";

  if (favList.length == 0) {
    html = `<div class="fav-item adding"> <h1> 
                Add to your list..</h1> </div>`;
  } else {
    for (let i = 0; i < favList.length; i++) {
      const favmovieList = await fetchMoviesFromApi(url, favList[i]);
      if (favmovieList) {
        let element = favmovieList;
        html += `
                        <div class="fav-item">
        
                      
                        <div class="fav-item-photo"  onclick="showMovieDetails('${
                          element.imdbID
                        }','arjun')">
                        <img src="${
                          element.Poster == "N/A"
                            ? "./assets/backdrop.jpg"
                            : element.Poster
                        }" alt="">
                        </div>
                        <div class="fav-item-details">
                            <div class="fav-item-name">
                                <strong>Name: </strong>
                                <span class="fav-item-text">
                                ${truncate(element.Title, 20)}
                                </span>
                            </div>
                            <div id="fav-like-button" onclick="addRemoveToFavList('${
                              element.imdbID
                            }')">
                                Remove
                            </div>
        
                        </div>
        
                    </div>               
                        `;
      }
    }
  }
  document.getElementById("fav").innerHTML = html;
}

updateTask();

/* ============================================================
   TRAILER ENGINE
   Uses the OMDB imdbID to fetch the real YouTube trailer ID
   via the Anthropic Claude API — no YouTube API key needed.
   ============================================================ */

(function () {
  // ── Inject styles ──────────────────────────────────────────
  var s = document.createElement("style");
  s.textContent = [
    ".trailer-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:8px;padding:8px 0;background:#e63946;color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;font-family:inherit;transition:background .2s,transform .15s;}",
    ".trailer-btn:hover{background:#c1121f;transform:translateY(-1px);}",
    ".trailer-btn-details{margin-top:12px;font-size:14px;padding:11px 0;}",
    "#mm-trailer-modal{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);backdrop-filter:blur(14px);align-items:center;justify-content:center;padding:20px;}",
    "#mm-trailer-modal.open{display:flex;animation:mmFade .25s ease;}",
    "@keyframes mmFade{from{opacity:0}to{opacity:1}}",
    ".mm-tm-box{width:100%;max-width:880px;animation:mmSlide .3s ease;}",
    "@keyframes mmSlide{from{transform:translateY(22px);opacity:0}to{transform:translateY(0);opacity:1}}",
    ".mm-tm-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:12px;}",
    ".mm-tm-title{color:#fff;font-size:20px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:78%;font-family:inherit;}",
    ".mm-tm-close{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);color:#fff;padding:7px 18px;border-radius:4px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;font-family:inherit;flex-shrink:0;transition:background .2s;}",
    ".mm-tm-close:hover{background:rgba(255,255,255,.2);}",
    ".mm-tm-video{position:relative;width:100%;aspect-ratio:16/9;background:#0a0a0a;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,.1);}",
    ".mm-tm-video iframe{position:absolute;inset:0;width:100%;height:100%;border:none;}",
    ".mm-tm-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:rgba(255,255,255,.5);font-size:13px;font-family:inherit;letter-spacing:.04em;}",
    ".mm-tm-error{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:rgba(255,255,255,.6);font-size:14px;font-family:inherit;text-align:center;padding:20px;}",
    ".mm-tm-error a{color:#e63946;text-decoration:none;font-weight:700;padding:10px 20px;border:2px solid #e63946;border-radius:4px;transition:background .2s;}",
    ".mm-tm-error a:hover{background:#e63946;color:#fff;}",
    ".mm-tm-spinner{width:38px;height:38px;border:3px solid rgba(255,255,255,.1);border-top-color:#e63946;border-radius:50%;animation:mmSpin .75s linear infinite;}",
    "@keyframes mmSpin{to{transform:rotate(360deg)}}",
  ].join("");
  document.head.appendChild(s);

  // ── Build modal ────────────────────────────────────────────
  var modal = document.createElement("div");
  modal.id = "mm-trailer-modal";
  modal.innerHTML =
    '<div class="mm-tm-box">' +
      '<div class="mm-tm-header">' +
        '<div class="mm-tm-title" id="mm-tm-title"></div>' +
        '<button class="mm-tm-close" id="mm-tm-close">&#10005; Close</button>' +
      "</div>" +
      '<div class="mm-tm-video" id="mm-tm-video">' +
        '<div class="mm-tm-loading" id="mm-tm-loading">' +
          '<div class="mm-tm-spinner"></div>' +
          "<span>Finding trailer&hellip;</span>" +
        "</div>" +
        '<div class="mm-tm-error" id="mm-tm-error">' +
          "<span>Couldn&#39;t load the trailer in this window.</span>" +
          '<a id="mm-yt-link" href="#" target="_blank" rel="noopener">&#9654; Watch on YouTube</a>' +
        "</div>" +
      "</div>" +
    "</div>";
  document.body.appendChild(modal);

  function closeModal() {
    modal.classList.remove("open");
    var iframe = document.getElementById("mm-tm-iframe");
    if (iframe) iframe.remove();
    document.getElementById("mm-tm-loading").style.display = "flex";
    document.getElementById("mm-tm-error").style.display = "none";
  }

  document
    .getElementById("mm-tm-close")
    .addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
})();

/**
 * Fetches the real YouTube trailer video ID for a movie using
 * the Claude AI API, then embeds it directly.
 *
 * @param {string} title - Movie title (passed from card HTML)
 * @param {string} year  - Release year  (passed from card HTML)
 */
async function openTrailer(title, year) {
  var modal   = document.getElementById("mm-trailer-modal");
  var loading = document.getElementById("mm-tm-loading");
  var errBox  = document.getElementById("mm-tm-error");
  var ytLink  = document.getElementById("mm-yt-link");

  // Reset state
  document.getElementById("mm-tm-title").textContent =
    title + (year ? " (" + year + ")" : "");
  loading.style.display = "flex";
  errBox.style.display  = "none";
  var old = document.getElementById("mm-tm-iframe");
  if (old) old.remove();
  modal.classList.add("open");

  // Fallback YouTube search URL (used if AI lookup fails)
  var fallbackUrl =
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(title + " " + (year || "") + " official trailer");
  ytLink.href = fallbackUrl;

  try {
    // Ask Claude for the real YouTube trailer video ID
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content:
              'Return ONLY the 11-character YouTube video ID of the official trailer for the movie "' +
              title +
              '" (' +
              (year || "unknown year") +
              '). No explanation, no punctuation, just the ID. Example: dQw4w9WgXcQ',
          },
        ],
      }),
    });

    var data = await res.json();
    var videoId = "";
    if (data.content && data.content[0] && data.content[0].text) {
      // Strip any whitespace/punctuation — we only want the raw ID
      videoId = data.content[0].text.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    }

    // Validate: YouTube IDs are exactly 11 chars
    if (videoId && videoId.length === 11) {
      ytLink.href = "https://www.youtube.com/watch?v=" + videoId;

      var iframe = document.createElement("iframe");
      iframe.id  = "mm-tm-iframe";
      iframe.src =
        "https://www.youtube.com/embed/" +
        videoId +
        "?autoplay=1&rel=0&modestbranding=1";
      iframe.allow = "autoplay; encrypted-media; fullscreen";
      iframe.allowFullscreen = true;

      iframe.onload = function () {
        loading.style.display = "none";
      };

      // Safety timeout — if iframe stalls, show fallback link
      var timeout = setTimeout(function () {
        loading.style.display = "none";
      }, 8000);

      iframe.onload = function () {
        clearTimeout(timeout);
        loading.style.display = "none";
      };

      document.getElementById("mm-tm-video").appendChild(iframe);
    } else {
      throw new Error("No valid video ID returned");
    }
  } catch (err) {
    console.warn("Trailer lookup failed:", err);
    loading.style.display = "none";
    errBox.style.display  = "flex";
  }
}

/*** End Code***/
