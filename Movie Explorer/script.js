// --- CONFIGURATION ---
const API_KEY = "YOUR_OMDB_API_KEY"; // 👈 Replace with your actual OMDb API Key
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;
const DEFAULT_SEARCH = "popular"; // Initial search term for popular/random movies

// --- DOM ELEMENTS ---
const searchInput = document.getElementById("searchInput");
const movieGrid = document.getElementById("movieGrid");
const statusMessage = document.getElementById("statusMessage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const paginationContainer = document.getElementById("pagination");

// --- STATE MANAGEMENT ---
let currentPage = 1;
let currentSearchTerm = DEFAULT_SEARCH;
let totalResults = 0;
const resultsPerPage = 10; // OMDb returns 10 results per page

// --- UTILITY FUNCTIONS ---

/**
 * @function debounce
 * @description Limits how often a function can run (e.g., for search input).
 * @param {function} func - The function to be debounced.
 * @param {number} delay - The delay in milliseconds.
 * @returns {function} The debounced function.
 */
const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

/**
 * @function throttle
 * @description Limits how often a function can run over a period of time (e.g., for pagination).
 * @param {function} func - The function to be throttled.
 * @param {number} limit - The time limit in milliseconds.
 * @returns {function} The throttled function.
 */
const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};

/**
 * @function showMessage
 * @description Displays status messages (loading, error, no results).
 * @param {string} message - The text content to display.
 * @param {boolean} isLoading - If true, adds a loading spinner class.
 */
const showMessage = (message, isLoading = false) => {
    movieGrid.innerHTML = "";
    paginationContainer.classList.add("hidden");
    statusMessage.classList.remove("hidden");
    statusMessage.textContent = message;

    if (isLoading) {
        statusMessage.classList.add("loading-spinner");
    } else {
        statusMessage.classList.remove("loading-spinner");
    }
};

/**
 * @function renderMovieCard
 * @description Creates the HTML structure for a single movie card.
 * @param {object} movie - Movie object from the OMDb API.
 * @returns {string} The HTML string for the movie card.
 */
const renderMovieCard = (movie) => {
    const poster = movie.Poster && movie.Poster !== "N/A" 
        ? movie.Poster 
        : 'https://via.placeholder.com/300x450?text=No+Poster';
    
    return `
        <div class="movie-card">
            <img src="${poster}" alt="${movie.Title} Poster">
            <div class="movie-info">
                <div>
                    <h3>${movie.Title}</h3>
                    <p><strong>Year:</strong> ${movie.Year}</p>
                </div>
                <p><strong>Type:</strong> ${movie.Type}</p>
            </div>
        </div>
    `;
};

/**
 * @function updatePaginationUI
 * @description Updates the text and button states for pagination controls.
 */
const updatePaginationUI = () => {
    const totalPages = Math.ceil(totalResults / resultsPerPage);

    // Show/Hide Pagination container
    if (totalResults > 0) {
        paginationContainer.classList.remove("hidden");
    } else {
        paginationContainer.classList.add("hidden");
    }

    pageInfo.textContent = `Page ${currentPage} of ${totalPages > 0 ? totalPages : 1}`;
    
    // Disable/Enable buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
};


// --- CORE FETCHING LOGIC ---

/**
 * @function fetchMovies
 * @description Handles the API call and rendering of results.
 * @param {string} searchTerm - The movie title to search for.
 * @param {number} page - The page number to fetch.
 */
const fetchMovies = async (searchTerm, page) => {
    showMessage("Loading movies...", true);

    const url = `${API_URL}&s=${searchTerm}&page=${page}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.Response === "True") {
            // Update state
            currentSearchTerm = searchTerm;
            currentPage = page;
            totalResults = parseInt(data.totalResults, 10);
            
            // Render results
            statusMessage.classList.add("hidden");
            movieGrid.innerHTML = data.Search.map(renderMovieCard).join("");
            updatePaginationUI();
        } else {
            // Handle "Movie not found!" or other API errors
            totalResults = 0;
            updatePaginationUI();
            showMessage(`No results found for "${searchTerm}". Please try a different search.`, false);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        totalResults = 0;
        updatePaginationUI();
        showMessage("An error occurred while fetching data. Please try again.", false);
    }
};

// --- EVENT HANDLERS ---

/**
 * @function handleSearch
 * @description Gets input value and triggers a new search from page 1.
 */
const handleSearch = () => {
    const term = searchInput.value.trim();
    if (term) {
        fetchMovies(term, 1);
    } else {
        // If search box is cleared, revert to initial popular movies
        fetchMovies(DEFAULT_SEARCH, 1);
    }
};

/**
 * @function handlePagination
 * @description Handles page changes (Previous/Next)
 * @param {number} direction - 1 for Next, -1 for Previous.
 */
const handlePagination = (direction) => {
    const newPage = currentPage + direction;
    const totalPages = Math.ceil(totalResults / resultsPerPage);

    if (newPage >= 1 && newPage <= totalPages) {
        fetchMovies(currentSearchTerm, newPage);
    }
};


// --- INITIALIZATION AND LISTENERS ---

// 1. Initial Load: Fetch popular movies
document.addEventListener("DOMContentLoaded", () => {
    fetchMovies(DEFAULT_SEARCH, 1);
});

// 2. Search Debouncing: Apply debouncing to the search input
const debouncedSearch = debounce(handleSearch, 500); // 500ms delay
searchInput.addEventListener("input", debouncedSearch);

// 3. Pagination Throttling: Apply throttling to the pagination buttons
const throttledPrev = throttle(() => handlePagination(-1), 500); // 500ms throttle
const throttledNext = throttle(() => handlePagination(1), 500); // 500ms throttle

prevBtn.addEventListener("click", throttledPrev);
nextBtn.addEventListener("click", throttledNext);