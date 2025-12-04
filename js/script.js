// Cache configuration - 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_KEY_PREFIX = 'bookify_cache_';
const CACHE_TIMESTAMP_PREFIX = 'bookify_cache_timestamp_';

// Cache helper functions
function getCachedData(category) {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + category);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_PREFIX + category);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        console.log(`Using cached data for ${category} (${Math.round(age / 1000 / 60)} minutes old)`);
        return JSON.parse(cached);
      } else {
        // Cache expired, remove it
        localStorage.removeItem(CACHE_KEY_PREFIX + category);
        localStorage.removeItem(CACHE_TIMESTAMP_PREFIX + category);
      }
    }
  } catch (err) {
    console.error('Error reading cache:', err);
  }
  return null;
}

function setCachedData(category, data) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + category, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_PREFIX + category, Date.now().toString());
  } catch (err) {
    console.error('Error saving cache:', err);
  }
}

// Show loading indicator for a category
function showLoadingIndicator(category) {
  const container = document.getElementById(category);
  if (container) {
    container.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading books...</div>';
    // Add loading class for styling
    container.classList.add('loading');
  }
}

// Hide loading indicator
function hideLoadingIndicator(category) {
  const container = document.getElementById(category);
  if (container) {
    container.classList.remove('loading');
  }
}

async function fetchGoogleBooks(query, maxResults = 15) {
  const url = `https://www.googleapis.com/books/v1/volumes`
    + `?q=${encodeURIComponent(query)}`
    + `&maxResults=${maxResults}`
    + `&orderBy=relevance`
    + `&printType=books`
    + `&langRestrict=en`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("Google API error:", err);
    return [];
  }
};

const bookData = {
  suggested: [],
  featured: [],
  fantasy: [],
  horror: [],
  romance: [],
  mystery: [],
  scifi: [],
  nonfiction: []
};

// Process and filter books for a category
function processBooksForCategory(rawBooks, category) {
  let books = rawBooks;

  // Only keep books with a valid image
  books = books.filter(b => b.volumeInfo.imageLinks?.thumbnail || b.volumeInfo.imageLinks?.smallThumbnail);

  // Deduplicate by title
  const seenTitles = new Set();
  books = books.filter(b => {
    if (!b.volumeInfo.title) return false; // Skip books without titles
    const title = b.volumeInfo.title.trim().toLowerCase();
    if (seenTitles.has(title)) return false;
    seenTitles.add(title);
    return true;
  });
  
  console.log(`${category}: ${books.length} after deduplication`);

  // Very loose filtering - just exclude obvious trash
  books = books.filter(b => {
    const info = b.volumeInfo;
    const title = (info.title || "").toLowerCase();
    
    // Only exclude the worst offenders and market books
    // Removed "guide" to stop blocking romance guides that are actual novels
    const blacklist = ["sparknotes", "cliffsnotes", "writer's market", "writers market", "summary"];
    
    const hasBlacklisted = blacklist.some(word => title.includes(word));
    
    // Just need a title and author
    const hasBasics = info.title && info.authors;
    
    // Debug for romance category
    if (category === 'romance' && (!hasBasics || hasBlacklisted)) {
      console.log(`Filtered out: "${info.title}" - hasBasics: ${hasBasics}, blacklisted: ${hasBlacklisted}`);
    }
    
    return !hasBlacklisted && hasBasics;
  });
  
  console.log(`${category}: ${books.length} after blacklist filter`);

  // Sort by actual popularity (ratings * average rating)
  books.sort((a, b) => {
    const ratingA = (a.volumeInfo.ratingsCount || 0) * (a.volumeInfo.averageRating || 0);
    const ratingB = (b.volumeInfo.ratingsCount || 0) * (b.volumeInfo.averageRating || 0);
    return ratingB - ratingA;
  });

  // Take top 20 after filtering and sorting
  books = books.slice(0, 20);

  return books.map(b => {
    const img = b.volumeInfo.imageLinks?.thumbnail || b.volumeInfo.imageLinks?.smallThumbnail;
    const authors = b.volumeInfo.authors || [];
    const categories = b.volumeInfo.categories || [];
    return {
      title: b.volumeInfo.title,
      img: img,
      authors: authors,
      author: authors.length > 0 ? authors[0] : "Unknown", // Single author for display
      genre: categories.length > 0 ? categories[0] : "Unspecified", // First category as genre
      categories: categories, // Keep all categories
      description: b.volumeInfo.description || "No description.",
      pageCount: b.volumeInfo.pageCount || null,
      id: b.id,
      volumeInfo: b.volumeInfo // Keep full volumeInfo for future use
    };
  });
}

// Load a single category (with caching and progressive rendering)
async function loadCategory(category, queryList) {
  // Show loading indicator
  showLoadingIndicator(category);
  
  // Check cache first
  const cached = getCachedData(category);
  if (cached) {
    bookData[category] = cached;
    renderCategory(category);
    hideLoadingIndicator(category);
    return;
  }
  
  // Fetch from API
  try {
    // Fetch all queries in parallel for speed
    const bookPromises = queryList.map(query => fetchGoogleBooks(query, 10));
    const bookResults = await Promise.all(bookPromises);
    
    // Combine all results
    const allBooks = bookResults.flat();
    
    // Process and filter
    const processedBooks = processBooksForCategory(allBooks, category);
    
    // Store in bookData
    bookData[category] = processedBooks;
    
    // Cache the results
    setCachedData(category, processedBooks);
    
    // Render immediately (progressive rendering)
    renderCategory(category);
    hideLoadingIndicator(category);
    
    // Update featured if this is the suggested category
    if (category === 'suggested' && processedBooks.length >= 2) {
      bookData.featured = processedBooks.slice(0, 2);
      renderFeaturedBooks();
    }
  } catch (err) {
    console.error(`Error loading category ${category}:`, err);
    hideLoadingIndicator(category);
    const container = document.getElementById(category);
    if (container) {
      container.innerHTML = '<div class="error-message">Failed to load books. Please try again later.</div>';
    }
  }
}

async function loadAllCategories() {
  const queries = {
    suggested: [
      "bestseller fiction 2024",
      "Colleen Hoover",
      "Rebecca Yarros",
      "popular novel 2023"
    ],
    fantasy: [
      "Patrick Rothfuss",
      "Rebecca Yarros Fourth Wing",
      "Brandon Sanderson",
      "epic fantasy bestseller"
    ],
    romance: [
      "Colleen Hoover",
      "Emily Henry",
      "Ali Hazelwood",
      "contemporary romance bestseller"
    ],
    mystery: [
      "Freida McFadden",
      "Ruth Ware",
      "Riley Sager",
      "psychological thriller bestseller"
    ],
    scifi: [
      "Pierce Brown",
      "Suzanne Collins",
      "Andy Weir",
      "dystopian bestseller"
    ],
    horror: [
      "Stephen King",
      "Grady Hendrix",
      "Riley Sager horror",
      "dark thriller bestseller"
    ],
    nonfiction: [
      "James Clear",
      "Michelle Obama",
      "Malcolm Gladwell",
      "self help bestseller"
    ]
  };

  // Load all categories in parallel for maximum speed
  const categoryPromises = Object.entries(queries).map(([category, queryList]) => 
    loadCategory(category, queryList)
  );
  
  // Wait for all categories to load (they render progressively as they complete)
  await Promise.all(categoryPromises);
  
  // Ensure featured is set if suggested loaded
  if (bookData.suggested.length >= 2 && bookData.featured.length === 0) {
    bookData.featured = bookData.suggested.slice(0, 2);
    renderFeaturedBooks();
  }
  
  // Re-enable infinite scroll for all categories
  initializeInfiniteScroll();
  
  // Rebuild search cache after all books are loaded
  buildBooksCache();
  
  // Fetch additional books for micro-genre generation in background
  fetchMicroGenreBooks();
}


// Render a single category (used for progressive rendering)
function renderCategory(category) {
  if (category === 'featured') return;
  
  const container = document.getElementById(category);
  if (!container) return;

  const books = bookData[category];
  if (!books || books.length === 0) return;

  container.innerHTML = '';

  const bookElements = [];
  books.forEach(book => {
    const div = document.createElement("div");
    div.classList.add("book");
    div.innerHTML = `
      <img src="${book.img}" alt="${book.title}">
      <p>${book.title}</p>
    `;

    // Open detail page
    div.addEventListener("click", () => {
      localStorage.setItem("selectedBook", JSON.stringify(book));
      window.location.href = "book.html";
    });

    container.appendChild(div);
    bookElements.push({ element: div, book });
  });

  // Duplicate for infinite scroll
  bookElements.forEach(({ element, book }) => {
    const clone = element.cloneNode(true);
    clone.addEventListener("click", () => {
      localStorage.setItem("selectedBook", JSON.stringify(book));
      window.location.href = "book.html";
    });
    container.appendChild(clone);
  });
  
  // Re-initialize infinite scroll for this category
  initializeInfiniteScroll();
}

function renderAllBooks() {
  // Render featured
  renderFeaturedBooks();

  // Render all categories
  Object.keys(bookData).forEach(category => {
    if (category === 'featured') return;
    renderCategory(category);
  });

  // Re-enable infinite scroll behavior
  initializeInfiniteScroll();
}

// Render featured books in hero section
function renderFeaturedBooks() {
  if (bookData.featured && bookData.featured.length >= 2) {
    const featuredBook1 = document.getElementById('featured-book-1');
    const featuredBook2 = document.getElementById('featured-book-2');
    
    if (featuredBook1) {
      const book1 = bookData.featured[0];
      const img1 = featuredBook1.querySelector('.featured-book-image img');
      const title1 = featuredBook1.querySelector('.featured-book-title');
      
      if (img1) img1.src = book1.img || '';
      if (img1) img1.alt = book1.title || '';
      if (title1) title1.textContent = book1.title || '';
      
      // Remove old event listeners by cloning and replacing
      const newFeatured1 = featuredBook1.cloneNode(true);
      featuredBook1.parentNode.replaceChild(newFeatured1, featuredBook1);
      
      // Add click event to entire featured book card
      newFeatured1.addEventListener('click', () => {
        localStorage.setItem('selectedBook', JSON.stringify(book1));
        window.location.href = 'book.html';
      });
    }
    
    if (featuredBook2) {
      const book2 = bookData.featured[1];
      const img2 = featuredBook2.querySelector('.featured-book-image img');
      const title2 = featuredBook2.querySelector('.featured-book-title');
      
      if (img2) img2.src = book2.img || '';
      if (img2) img2.alt = book2.title || '';
      if (title2) title2.textContent = book2.title || '';
      
      // Remove old event listeners by cloning and replacing
      const newFeatured2 = featuredBook2.cloneNode(true);
      featuredBook2.parentNode.replaceChild(newFeatured2, featuredBook2);
      
      // Add click event to entire featured book card
      newFeatured2.addEventListener('click', () => {
        localStorage.setItem('selectedBook', JSON.stringify(book2));
        window.location.href = 'book.html';
      });
    }
  }
}

loadAllCategories();

// Infinite loop scroll functionality
function initializeInfiniteScroll() {
  document.querySelectorAll('.row-container').forEach(container => {
  const row = container.querySelector('.book-row');
  const leftBtn = container.querySelector('.scroll-left');
  const rightBtn = container.querySelector('.scroll-right');
  
  if (!row) return;
  
  // Store the width of one scroll increment
  const scrollAmount = 300;
  let isScrolling = false;
  let scrollTimeout;
  
  // Calculate original content width (half of total since we duplicated)
  function getOriginalContentWidth() {
    return row.scrollWidth / 2;
  }
  
  // Function to handle infinite loop scrolling (for manual/drag scrolling)
  function handleInfiniteScroll() {
    if (isScrolling) return;
    
    const scrollLeft = row.scrollLeft;
    const originalContentWidth = getOriginalContentWidth();
    
    // If scrolled past the original content (at the duplicates), jump back to start
    if (scrollLeft >= originalContentWidth) {
      isScrolling = true;
      // Instantly jump back (no smooth scroll for the jump)
      row.style.scrollBehavior = 'auto';
      row.scrollLeft = scrollLeft - originalContentWidth;
      // Re-enable smooth scrolling
      setTimeout(() => {
        row.style.scrollBehavior = 'smooth';
        isScrolling = false;
      }, 10);
    }
    // If scrolled to the left of start, jump to end of original content
    else if (scrollLeft <= 0) {
      isScrolling = true;
      row.style.scrollBehavior = 'auto';
      row.scrollLeft = originalContentWidth - scrollAmount;
      setTimeout(() => {
        row.style.scrollBehavior = 'smooth';
        isScrolling = false;
      }, 10);
    }
  }
  
  // Scroll right
  rightBtn.addEventListener('click', () => {
    if (isScrolling) return;
    isScrolling = true;
    
    const currentScroll = row.scrollLeft;
    const originalContentWidth = getOriginalContentWidth();
    
    // If near the end of duplicates, jump to start and continue
    if (currentScroll >= originalContentWidth - scrollAmount) {
      row.style.scrollBehavior = 'auto';
      row.scrollLeft = 0;
      setTimeout(() => {
        row.style.scrollBehavior = 'smooth';
        row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setTimeout(() => { isScrolling = false; }, 350);
      }, 10);
    } else {
      row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(() => { isScrolling = false; }, 350);
    }
  });
  
  // Scroll left
  leftBtn.addEventListener('click', () => {
    if (isScrolling) return;
    isScrolling = true;
    
    const currentScroll = row.scrollLeft;
    const originalContentWidth = getOriginalContentWidth();
    
    // If near the start, jump to end of original content and continue
    if (currentScroll <= scrollAmount) {
      row.style.scrollBehavior = 'auto';
      row.scrollLeft = originalContentWidth;
      setTimeout(() => {
        row.style.scrollBehavior = 'smooth';
        row.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        setTimeout(() => { isScrolling = false; }, 350);
      }, 10);
    } else {
      row.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setTimeout(() => { isScrolling = false; }, 350);
    }
  });
  
  // Handle scroll events for seamless looping (when user drags scrollbar or uses mouse wheel)
  row.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      handleInfiniteScroll();
    }, 100);
  });
  
  // Initialize scroll position to a small offset to allow scrolling left
  setTimeout(() => {
    row.scrollLeft = 1;
  }, 100);
  });
}

// Genre filtering functionality with dynamic content refresh
const sidebarButtons = document.querySelectorAll('.sidebar button');
const categories = document.querySelectorAll('.category');

let currentGenreFilter = null; // Track current active genre

// Genre-specific queries for refreshing content
const genreRefreshQueries = {
  suggested: [
    "bestseller fiction 2024",
    "popular novel 2023",
    "award winning fiction",
    "trending books"
  ],
  fantasy: [
    "epic fantasy bestseller",
    "fantasy adventure",
    "magical fantasy",
    "young adult fantasy"
  ],
  horror: [
    "horror bestseller",
    "supernatural horror",
    "psychological horror",
    "gothic horror"
  ],
  romance: [
    "contemporary romance bestseller",
    "romantic fiction",
    "romance novel",
    "love story"
  ],
  mystery: [
    "mystery thriller bestseller",
    "detective novel",
    "crime fiction",
    "psychological thriller"
  ],
  scifi: [
    "science fiction bestseller",
    "sci-fi adventure",
    "dystopian fiction",
    "space opera"
  ],
  nonfiction: [
    "nonfiction bestseller",
    "memoir",
    "biography",
    "self help"
  ]
};

// Refresh hero section with genre-specific books
async function refreshHeroBooks(genre) {
  const queries = genreRefreshQueries[genre] || genreRefreshQueries.suggested;
  
  try {
    // Show loading state in hero
    const featuredBook1 = document.getElementById('featured-book-1');
    const featuredBook2 = document.getElementById('featured-book-2');
    if (featuredBook1) {
      const title1 = featuredBook1.querySelector('.featured-book-title');
      if (title1) title1.textContent = 'Loading...';
    }
    if (featuredBook2) {
      const title2 = featuredBook2.querySelector('.featured-book-title');
      if (title2) title2.textContent = 'Loading...';
    }
    
    // Fetch fresh books for hero
    const bookPromises = queries.slice(0, 2).map(query => fetchGoogleBooks(query, 5));
    const bookResults = await Promise.all(bookPromises);
    const allBooks = bookResults.flat();
    
    // Process books
    const processedBooks = processBooksForCategory(allBooks, genre);
    
    if (processedBooks.length >= 2) {
      // Update featured books
      bookData.featured = processedBooks.slice(0, 2);
      renderFeaturedBooks();
    } else if (processedBooks.length === 1) {
      // If only one book, use it and a book from the category
      bookData.featured = [processedBooks[0], bookData[genre]?.[0] || processedBooks[0]];
      renderFeaturedBooks();
    }
  } catch (err) {
    console.error('Error refreshing hero books:', err);
    // Fallback to category books
    if (bookData[genre] && bookData[genre].length >= 2) {
      bookData.featured = bookData[genre].slice(0, 2);
      renderFeaturedBooks();
    }
  }
}

// Refresh category carousels with genre-specific books
async function refreshCategoryCarousels(genre) {
  // If "suggested" is selected, show all categories (default view)
  if (genre === 'suggested') {
    categories.forEach(cat => {
      cat.style.display = 'block';
    });
    
    // Show all micro-genres
    const microGenreCategories = document.querySelectorAll('.micro-genre-category');
    microGenreCategories.forEach(microCat => {
      microCat.style.display = 'block';
    });
    return;
  }
  
  // Hide all categories first
  categories.forEach(cat => {
    cat.style.display = 'none';
  });
  
  // Show and refresh the selected genre category
  const targetCategory = document.querySelector(`#${genre}`);
  if (targetCategory) {
    const categorySection = targetCategory.closest('.category');
    if (categorySection) {
      categorySection.style.display = 'block';
      
      // Show loading
      showLoadingIndicator(genre);
      
      // Fetch fresh books (use cached if available, otherwise fetch)
      const cached = getCachedData(genre);
      if (cached && cached.length > 0) {
        bookData[genre] = cached;
        renderCategory(genre);
        hideLoadingIndicator(genre);
      } else {
        // Fetch fresh books
        const queries = genreRefreshQueries[genre] || [];
        try {
          const bookPromises = queries.map(query => fetchGoogleBooks(query, 10));
          const bookResults = await Promise.all(bookPromises);
          const allBooks = bookResults.flat();
          const processedBooks = processBooksForCategory(allBooks, genre);
          
          // Update bookData
          bookData[genre] = processedBooks;
          
          // Cache the results
          setCachedData(genre, processedBooks);
          
          // Render the category
          renderCategory(genre);
          hideLoadingIndicator(genre);
        } catch (err) {
          console.error(`Error refreshing ${genre} category:`, err);
          hideLoadingIndicator(genre);
        }
      }
    }
  }
  
  // Show related micro-genres that match the selected genre
  const microGenreCategories = document.querySelectorAll('.micro-genre-category');
  microGenreCategories.forEach(microCat => {
    const genreName = (microCat.dataset.microGenre || '').toLowerCase();
    const genreLower = genre.toLowerCase();
    
    // Show micro-genres that are related to the selected genre
    const isRelated = 
      genreName.includes(genreLower) || 
      (genre === 'fantasy' && (genreName.includes('fantasy') || genreName.includes('epic') || genreName.includes('magical') || genreName.includes('dragon'))) ||
      (genre === 'romance' && (genreName.includes('romance') || genreName.includes('romantic') || genreName.includes('love'))) ||
      (genre === 'horror' && (genreName.includes('horror') || genreName.includes('supernatural') || genreName.includes('dark'))) ||
      (genre === 'mystery' && (genreName.includes('mystery') || genreName.includes('thriller') || genreName.includes('crime') || genreName.includes('detective'))) ||
      (genre === 'scifi' && (genreName.includes('sci-fi') || genreName.includes('space') || genreName.includes('dystopian') || genreName.includes('science'))) ||
      (genre === 'nonfiction' && (genreName.includes('non-fiction') || genreName.includes('nonfiction') || genreName.includes('memoir') || genreName.includes('biography') || genreName.includes('self-help')));
    
    microCat.style.display = isRelated ? 'block' : 'none';
  });
}

// Reset to show all categories (default view)
function resetToDefaultView() {
  // Show all main categories
  categories.forEach(cat => {
    cat.style.display = 'block';
  });
  
  // Show all micro-genres
  const microGenreCategories = document.querySelectorAll('.micro-genre-category');
  microGenreCategories.forEach(microCat => {
    microCat.style.display = 'block';
  });
  
  // Restore original featured books
  if (bookData.suggested && bookData.suggested.length >= 2) {
    bookData.featured = bookData.suggested.slice(0, 2);
    renderFeaturedBooks();
  }
}

sidebarButtons.forEach(button => {
  button.addEventListener('click', async () => {
    const filter = button.dataset.filter;
    
    // Toggle filter on/off
    if (currentGenreFilter === filter) {
      // Deselect - return to default view
      currentGenreFilter = null;
      button.classList.remove('active');
      resetToDefaultView();
    } else {
      // Select new genre
      sidebarButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentGenreFilter = filter;
      
      // Refresh hero books
      await refreshHeroBooks(filter);
      
      // Refresh category carousels
      await refreshCategoryCarousels(filter);
    }
  });
});

// ========== MICRO-GENRE BOOK FETCHING ==========

// Additional diverse queries for micro-genre generation
const microGenreQueries = [
  // Diverse fiction
  "bestseller fiction 2023", "bestseller fiction 2024", "award winning fiction",
  "literary fiction", "contemporary fiction", "historical fiction",
  // Romance variations
  "contemporary romance", "historical romance", "paranormal romance",
  "romantic comedy", "second chance romance", "enemies to lovers romance",
  // Fantasy variations
  "epic fantasy", "urban fantasy", "young adult fantasy", "dark fantasy",
  "magical realism", "fairy tale retellings",
  // Thriller/Mystery variations
  "psychological thriller", "domestic thriller", "legal thriller",
  "spy thriller", "crime fiction", "detective novels",
  // Horror variations
  "supernatural horror", "psychological horror", "gothic horror",
  "paranormal fiction", "ghost stories",
  // Sci-Fi variations
  "space opera", "dystopian fiction", "cyberpunk", "time travel",
  "alternate history", "scientific fiction",
  // Non-fiction variations
  "memoir", "biography", "self help", "business books",
  "history books", "science books", "philosophy books",
  // Popular authors (diverse)
  "Taylor Jenkins Reid", "Sally Rooney", "Madeline Miller", "Celeste Ng",
  "Zadie Smith", "Donna Tartt", "Kazuo Ishiguro", "Maggie O'Farrell",
  "Tana French", "Gillian Flynn", "Paula Hawkins", "Liane Moriarty"
];

// Fetch additional books for micro-genre generation
async function fetchMicroGenreBooks() {
  const cacheKey = 'micro_genre_books';
  const cacheTimestampKey = 'micro_genre_books_timestamp';
  const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days (micro-genres don't need frequent updates)
  
  // Check cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    const timestamp = localStorage.getItem(cacheTimestampKey);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        console.log(`Using cached micro-genre books (${Math.round(age / 1000 / 60 / 60)} hours old)`);
        const cachedBooks = JSON.parse(cached);
        // Generate micro-genres with cached books
        setTimeout(() => {
          generateMicroGenres();
        }, 100);
        return;
      }
    }
  } catch (err) {
    console.error('Error reading micro-genre cache:', err);
  }
  
  // Fetch in background - don't block UI
  console.log('Fetching additional books for micro-genre generation...');
  
  // Shuffle queries for variety, then take a subset
  const shuffledQueries = [...microGenreQueries].sort(() => Math.random() - 0.5);
  const queriesToFetch = shuffledQueries.slice(0, 50); // Fetch from 50 diverse queries
  
  // Fetch in batches to avoid rate limiting
  const batchSize = 5;
  const delayBetweenBatches = 500; // 500ms delay between batches
  const allMicroGenreBooks = [];
  
  for (let i = 0; i < queriesToFetch.length; i += batchSize) {
    const batch = queriesToFetch.slice(i, i + batchSize);
    
    try {
      // Fetch batch in parallel
      const batchPromises = batch.map(query => fetchGoogleBooks(query, 10));
      const batchResults = await Promise.all(batchPromises);
      
      // Flatten and add to collection
      const flatResults = batchResults.flat();
      allMicroGenreBooks.push(...flatResults);
      
      // Small delay between batches to be respectful to API
      if (i + batchSize < queriesToFetch.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    } catch (err) {
      console.error(`Error fetching batch ${i / batchSize + 1}:`, err);
      // Continue with next batch even if one fails
    }
  }
  
  // Process and cache the books
  const processedBooks = processMicroGenreBooks(allMicroGenreBooks);
  
  // Cache the results
  try {
    localStorage.setItem(cacheKey, JSON.stringify(processedBooks));
    localStorage.setItem(cacheTimestampKey, Date.now().toString());
    console.log(`Cached ${processedBooks.length} micro-genre books`);
    
    // Generate micro-genres with the new books
    setTimeout(() => {
      generateMicroGenres();
    }, 500);
  } catch (err) {
    console.error('Error caching micro-genre books:', err);
  }
}

// Process books for micro-genre generation (similar to processBooksForCategory but less strict)
function processMicroGenreBooks(rawBooks) {
  let books = rawBooks;
  
  // Only keep books with valid image
  books = books.filter(b => b.volumeInfo?.imageLinks?.thumbnail || b.volumeInfo?.imageLinks?.smallThumbnail);
  
  // Deduplicate by title
  const seenTitles = new Set();
  books = books.filter(b => {
    if (!b.volumeInfo?.title) return false;
    const title = b.volumeInfo.title.trim().toLowerCase();
    if (seenTitles.has(title)) return false;
    seenTitles.add(title);
    return true;
  });
  
  // Basic filtering - only exclude obvious trash
  books = books.filter(b => {
    const info = b.volumeInfo || {};
    const title = (info.title || "").toLowerCase();
    const blacklist = ["sparknotes", "cliffsnotes", "writer's market", "writers market"];
    return !blacklist.some(word => title.includes(word)) && info.title && info.authors;
  });
  
  // Sort by popularity
  books.sort((a, b) => {
    const ratingA = ((a.volumeInfo?.ratingsCount || 0) * (a.volumeInfo?.averageRating || 0));
    const ratingB = ((b.volumeInfo?.ratingsCount || 0) * (b.volumeInfo?.averageRating || 0));
    return ratingB - ratingA;
  });
  
  // Process into our format
  return books.map(b => {
    const img = b.volumeInfo?.imageLinks?.thumbnail || b.volumeInfo?.imageLinks?.smallThumbnail;
    const authors = b.volumeInfo?.authors || [];
    const categories = b.volumeInfo?.categories || [];
    return {
      title: b.volumeInfo?.title,
      img: img,
      authors: authors,
      author: authors.length > 0 ? authors[0] : "Unknown",
      genre: categories.length > 0 ? categories[0] : "Unspecified",
      categories: categories,
      description: b.volumeInfo?.description || "No description.",
      pageCount: b.volumeInfo?.pageCount || null,
      id: b.id,
      volumeInfo: b.volumeInfo,
      isMicroGenreBook: true // Flag to distinguish from main category books
    };
  });
}

// ========== NETFLIX-STYLE MICRO-GENRE SYSTEM ==========

// Micro-genre patterns and descriptors
const microGenrePatterns = {
  mood: {
    dark: ['dark', 'gritty', 'brutal', 'violent', 'disturbing', 'chilling', 'haunting', 'sinister'],
    light: ['light', 'feel-good', 'heartwarming', 'uplifting', 'charming', 'sweet', 'funny', 'humorous'],
    emotional: ['emotional', 'heartbreaking', 'tear-jerker', 'touching', 'poignant', 'moving'],
    intense: ['intense', 'gripping', 'suspenseful', 'thrilling', 'edge-of-your-seat', 'pulse-pounding']
  },
  setting: {
    contemporary: ['contemporary', 'modern', 'present-day', 'current', 'today'],
    historical: ['historical', 'medieval', 'victorian', 'ancient', 'period', 'era'],
    fantasy: ['fantasy', 'magical', 'enchanted', 'mythical', 'epic', 'legendary'],
    dystopian: ['dystopian', 'post-apocalyptic', 'futuristic', 'sci-fi', 'cyberpunk']
  },
  tone: {
    psychological: ['psychological', 'mind-bending', 'twist', 'unreliable narrator'],
    romantic: ['romantic', 'love story', 'romance', 'passionate', 'steamy'],
    action: ['action', 'adventure', 'fast-paced', 'high-stakes', 'battle'],
    mystery: ['mystery', 'whodunit', 'investigation', 'detective', 'suspense']
  },
  popularity: {
    bestselling: ['bestseller', 'bestselling', '#1', 'new york times', 'popular'],
    award: ['award-winning', 'prize-winning', 'acclaimed', 'critically acclaimed']
  }
};

// Extract keywords from book metadata
function extractBookKeywords(book) {
  const keywords = {
    categories: [],
    description: [],
    title: []
  };
  
  // Extract from categories
  if (book.categories && Array.isArray(book.categories)) {
    keywords.categories = book.categories.map(cat => cat.toLowerCase());
  }
  
  // Extract from description
  if (book.description) {
    const descLower = book.description.toLowerCase();
    // Find mood words
    Object.keys(microGenrePatterns.mood).forEach(mood => {
      microGenrePatterns.mood[mood].forEach(word => {
        if (descLower.includes(word)) {
          keywords.description.push(mood);
        }
      });
    });
    // Find setting words
    Object.keys(microGenrePatterns.setting).forEach(setting => {
      microGenrePatterns.setting[setting].forEach(word => {
        if (descLower.includes(word)) {
          keywords.description.push(setting);
        }
      });
    });
    // Find tone words
    Object.keys(microGenrePatterns.tone).forEach(tone => {
      microGenrePatterns.tone[tone].forEach(word => {
        if (descLower.includes(word)) {
          keywords.description.push(tone);
        }
      });
    });
  }
  
  // Extract from title
  if (book.title) {
    const titleLower = book.title.toLowerCase();
    Object.keys(microGenrePatterns.setting).forEach(setting => {
      microGenrePatterns.setting[setting].forEach(word => {
        if (titleLower.includes(word)) {
          keywords.title.push(setting);
        }
      });
    });
  }
  
  // Check for popularity indicators
  if (book.description) {
    const descLower = book.description.toLowerCase();
    Object.keys(microGenrePatterns.popularity).forEach(pop => {
      microGenrePatterns.popularity[pop].forEach(word => {
        if (descLower.includes(word)) {
          keywords.description.push(pop);
        }
      });
    });
  }
  
  return keywords;
}

// Generate micro-genre name for a book
function generateMicroGenreName(book, keywords, existingCategories = new Set()) {
  const parts = [];
  const descLower = (book.description || '').toLowerCase();
  const titleLower = (book.title || '').toLowerCase();
  const categoriesLower = (book.categories || []).map(c => c.toLowerCase());
  
  // Determine primary genre from categories
  let primaryGenre = null;
  if (categoriesLower.some(c => c.includes('romance'))) {
    primaryGenre = 'Romance';
  } else if (categoriesLower.some(c => c.includes('thriller') || c.includes('suspense'))) {
    primaryGenre = 'Thriller';
  } else if (categoriesLower.some(c => c.includes('fantasy'))) {
    primaryGenre = 'Fantasy';
  } else if (categoriesLower.some(c => c.includes('horror'))) {
    primaryGenre = 'Horror';
  } else if (categoriesLower.some(c => c.includes('science fiction') || c.includes('sci-fi'))) {
    primaryGenre = 'Sci-Fi';
  } else if (categoriesLower.some(c => c.includes('mystery'))) {
    primaryGenre = 'Mystery';
  } else if (categoriesLower.some(c => c.includes('fiction'))) {
    primaryGenre = 'Fiction';
  }
  
  // Add popularity descriptor
  if (descLower.includes('bestseller') || descLower.includes('#1') || descLower.includes('new york times')) {
    parts.push('Bestselling');
  } else if (descLower.includes('award-winning') || descLower.includes('acclaimed')) {
    parts.push('Award-Winning');
  }
  
  // Add mood descriptor (only if it adds value)
  if (descLower.includes('dark') || descLower.includes('gritty') || descLower.includes('brutal')) {
    parts.push('Dark');
  } else if (descLower.includes('heartwarming') || descLower.includes('feel-good') || descLower.includes('uplifting')) {
    parts.push('Feel-Good');
  } else if (descLower.includes('emotional') || descLower.includes('heartbreaking') || descLower.includes('tear-jerker')) {
    parts.push('Emotional');
  } else if (descLower.includes('intense') || descLower.includes('gripping') || descLower.includes('suspenseful')) {
    parts.push('Intense');
  }
  
  // Add specific tone/genre modifiers
  if (descLower.includes('psychological') || descLower.includes('mind-bending')) {
    parts.push('Psychological');
  }
  
  // Add setting/time period
  if (descLower.includes('contemporary') || descLower.includes('modern') || categoriesLower.some(c => c.includes('contemporary'))) {
    parts.push('Contemporary');
  } else if (descLower.includes('historical') || categoriesLower.some(c => c.includes('historical'))) {
    parts.push('Historical');
  } else if (descLower.includes('epic') || titleLower.includes('epic')) {
    parts.push('Epic');
  } else if (descLower.includes('dystopian') || descLower.includes('post-apocalyptic')) {
    parts.push('Dystopian');
  }
  
  // Add primary genre
  if (primaryGenre) {
    // Avoid duplication
    if (!parts.some(p => p.toLowerCase().includes(primaryGenre.toLowerCase()))) {
      parts.push(primaryGenre);
    }
  }
  
  // Fallback: create more specific names based on source category
  if (parts.length === 0) {
    if (book.sourceCategory) {
      const categoryMap = {
        'fantasy': descLower.includes('young adult') ? 'Young Adult Fantasy' : 'Epic Fantasy',
        'romance': descLower.includes('contemporary') ? 'Contemporary Romance' : 'Romantic Fiction',
        'mystery': 'Crime & Mystery',
        'horror': 'Supernatural Horror',
        'scifi': 'Space Sci-Fi',
        'nonfiction': 'Non-Fiction Reads',
        'suggested': 'Bestselling Fiction'
      };
      const fallback = categoryMap[book.sourceCategory] || 'Popular Reads';
      // Split into parts for consistency
      parts.push(...fallback.split(' '));
    } else if (book.genre && book.genre !== 'Unspecified') {
      // Make genre more specific
      if (book.genre.toLowerCase().includes('fiction')) {
        parts.push('Literary Fiction');
      } else {
        parts.push(book.genre);
      }
    } else {
      parts.push('Popular Reads');
    }
  }
  
  // Create readable name
  let genreName = parts.join(' ');
  
  // Make more creative and specific combinations
  // If we have multiple descriptors, create more interesting combinations
  if (parts.length >= 3) {
    // Reorder for better flow: Mood + Setting + Genre
    const moodParts = parts.filter(p => ['Dark', 'Feel-Good', 'Emotional', 'Intense', 'Bestselling', 'Award-Winning'].includes(p));
    const settingParts = parts.filter(p => ['Contemporary', 'Historical', 'Epic', 'Dystopian'].includes(p));
    const genreParts = parts.filter(p => !moodParts.includes(p) && !settingParts.includes(p));
    
    const reordered = [...moodParts, ...settingParts, ...genreParts];
    genreName = reordered.join(' ');
  }
  
  // Add creative suffixes and make more specific
  if (genreName.includes('Thriller')) {
    if (descLower.includes('serial killer') || descLower.includes('murder')) {
      genreName = genreName.replace('Thriller', 'Crime Thrillers');
    } else if (descLower.includes('spy') || descLower.includes('espionage')) {
      genreName = genreName.replace('Thriller', 'Spy Thrillers');
    } else {
      genreName = genreName.replace('Thriller', 'Thrillers');
    }
  }
  
  if (genreName.includes('Romance')) {
    if (descLower.includes('enemies to lovers') || descLower.includes('rival')) {
      genreName = genreName.replace('Romance', 'Enemies-to-Lovers Romance');
    } else if (descLower.includes('second chance') || descLower.includes('reunion')) {
      genreName = genreName.replace('Romance', 'Second-Chance Romance');
    } else if (descLower.includes('steamy') || descLower.includes('passionate') || descLower.includes('spicy')) {
      genreName = genreName.replace('Romance', 'Steamy Romance');
    } else if (descLower.includes('sweet') || descLower.includes('clean')) {
      genreName = genreName.replace('Romance', 'Sweet Romance');
    }
  }
  
  if (genreName.includes('Fantasy')) {
    if (descLower.includes('dragon') || titleLower.includes('dragon')) {
      genreName = genreName.replace('Fantasy', 'Dragon Fantasy');
    } else if (descLower.includes('magic') || descLower.includes('wizard') || descLower.includes('witch')) {
      genreName = genreName.replace('Fantasy', 'Magical Fantasy');
    } else if (descLower.includes('epic') || descLower.includes('quest')) {
      genreName = genreName.replace('Fantasy', 'Epic Fantasy');
    } else {
      genreName = genreName.replace('Fantasy', 'Fantasy Adventures');
    }
  }
  
  if (genreName.includes('Mystery')) {
    if (descLower.includes('detective') || descLower.includes('investigator')) {
      genreName = genreName.replace('Mystery', 'Detective Mysteries');
    } else if (descLower.includes('cozy') || descLower.includes('amateur sleuth')) {
      genreName = genreName.replace('Mystery', 'Cozy Mysteries');
    } else {
      genreName = genreName.replace('Mystery', 'Mystery Novels');
    }
  }
  
  if (genreName.includes('Horror')) {
    if (descLower.includes('supernatural') || descLower.includes('ghost') || descLower.includes('paranormal')) {
      genreName = genreName.replace('Horror', 'Supernatural Horror');
    } else if (descLower.includes('psychological') || descLower.includes('mind')) {
      genreName = genreName.replace('Horror', 'Psychological Horror');
    } else {
      genreName = genreName.replace('Horror', 'Horror Stories');
    }
  }
  
  if (genreName.includes('Sci-Fi')) {
    if (descLower.includes('space') || descLower.includes('alien') || descLower.includes('planet')) {
      genreName = genreName.replace('Sci-Fi', 'Space Sci-Fi');
    } else if (descLower.includes('dystopian') || descLower.includes('dystopia')) {
      genreName = genreName.replace('Sci-Fi', 'Dystopian Sci-Fi');
    } else {
      genreName = genreName.replace('Sci-Fi', 'Sci-Fi Adventures');
    }
  }
  
  // Add creative descriptors for Fiction
  if (genreName.includes('Fiction') && !genreName.includes('Science Fiction')) {
    if (descLower.includes('family saga') || descLower.includes('generation')) {
      genreName = genreName.replace('Fiction', 'Family Sagas');
    } else if (descLower.includes('coming of age') || descLower.includes('young adult')) {
      genreName = genreName.replace('Fiction', 'Coming-of-Age Stories');
    } else if (descLower.includes('literary')) {
      genreName = genreName.replace('Fiction', 'Literary Fiction');
    }
  }
  
  // For Non-Fiction, make more specific
  if (genreName.includes('Non-Fiction') || genreName.includes('Nonfiction')) {
    if (descLower.includes('self-help') || descLower.includes('self help') || descLower.includes('personal development')) {
      genreName = 'Self-Help & Personal Development';
    } else if (descLower.includes('biography') || descLower.includes('memoir') || descLower.includes('autobiography')) {
      genreName = 'Biographies & Memoirs';
    } else if (descLower.includes('business') || descLower.includes('entrepreneur')) {
      genreName = 'Business & Entrepreneurship';
    } else if (descLower.includes('history') || descLower.includes('historical')) {
      genreName = 'Historical Non-Fiction';
    } else {
      genreName = 'Non-Fiction Reads';
    }
  }
  
  // Remove "Books" suffix if it makes it too generic, but keep for some cases
  if (genreName.endsWith(' Books') && parts.length >= 2) {
    // Keep "Books" only for very generic categories
    if (!['Popular Books', 'Fiction Books'].includes(genreName)) {
      genreName = genreName.replace(' Books', '');
    }
  }
  
  return genreName;
}

// Get existing category names from the page
function getExistingCategoryNames() {
  const existingCategories = new Set();
  
  // Get from sidebar buttons
  document.querySelectorAll('.sidebar button').forEach(button => {
    const filter = button.dataset.filter;
    const categoryMap = {
      'suggested': 'Suggested',
      'fantasy': 'Fantasy',
      'horror': 'Horror',
      'romance': 'Romance',
      'mystery': 'Mystery',
      'scifi': 'Sci-Fi',
      'nonfiction': 'Non-Fiction'
    };
    if (categoryMap[filter]) {
      existingCategories.add(categoryMap[filter].toLowerCase());
    }
  });
  
  // Get from category headings
  document.querySelectorAll('.category h2').forEach(heading => {
    const text = heading.textContent.trim().toLowerCase();
    // Extract first word (main category name)
    const firstWord = text.split(' ')[0];
    existingCategories.add(firstWord);
    // Also check for common variations
    if (text.includes('sci-fi') || text.includes('scifi')) {
      existingCategories.add('sci-fi');
      existingCategories.add('science fiction');
    }
    if (text.includes('non-fiction') || text.includes('nonfiction')) {
      existingCategories.add('non-fiction');
      existingCategories.add('nonfiction');
    }
  });
  
  return existingCategories;
}

// Check if a micro-genre name conflicts with existing categories
function conflictsWithExisting(genreName, existingCategories) {
  const genreLower = genreName.toLowerCase().trim();
  
  // Direct matches
  if (existingCategories.has(genreLower)) {
    return true;
  }
  
  // Check against known existing category patterns
  const existingPatterns = [
    'suggested', 'fantasy', 'horror', 'romance', 'mystery', 
    'sci-fi', 'scifi', 'science fiction', 'non-fiction', 'nonfiction', 'non fiction'
  ];
  
  for (const pattern of existingPatterns) {
    // If the genre name starts with or is just the pattern, it's a duplicate
    if (genreLower === pattern || genreLower.startsWith(pattern + ' ') || genreLower === pattern + 's') {
      return true;
    }
    // If it's just the pattern with common suffixes
    if (genreLower === pattern + ' books' || 
        genreLower === pattern + ' reads' ||
        genreLower === pattern + ' stories' ||
        genreLower === pattern + ' worlds' ||
        genreLower === pattern + ' adventures' ||
        genreLower === pattern + ' thrillers') {
      return true;
    }
  }
  
  // Check for partial word matches that would be too similar
  const genreWords = genreLower.split(/\s+/).filter(w => w.length > 2);
  for (const existing of existingCategories) {
    const existingWords = existing.split(/\s+/).filter(w => w.length > 2);
    
    // If it's a single-word match with a common genre word, likely duplicate
    if (genreWords.length === 1 && existingWords.length === 1 && genreWords[0] === existingWords[0]) {
      return true;
    }
    
    // If all significant words of existing are in new genre (and new genre isn't much longer)
    if (existingWords.length > 0 && existingWords.length <= genreWords.length) {
      const significantMatches = existingWords.filter(word => 
        genreWords.includes(word) || 
        genreWords.some(gw => gw.includes(word) || word.includes(gw))
      );
      // If most words match and it's not significantly more specific, it's a duplicate
      if (significantMatches.length === existingWords.length && genreWords.length - existingWords.length <= 2) {
        return true;
      }
    }
  }
  
  return false;
}

// Generate micro-genres from all loaded books
function generateMicroGenres() {
  // Collect all books from all categories
  const allBooks = [];
  Object.keys(bookData).forEach(category => {
    if (category !== 'featured' && Array.isArray(bookData[category])) {
      bookData[category].forEach(book => {
        // Add source category for reference
        book.sourceCategory = category;
        allBooks.push(book);
      });
    }
  });
  
  // Add micro-genre books if available
  try {
    const microGenreBooks = JSON.parse(localStorage.getItem('micro_genre_books') || '[]');
    microGenreBooks.forEach(book => {
      // Only add if not already in allBooks (avoid duplicates)
      const isDuplicate = allBooks.some(b => 
        (b.id && book.id && b.id === book.id) || 
        (b.title && book.title && b.title.toLowerCase() === book.title.toLowerCase())
      );
      if (!isDuplicate) {
        book.sourceCategory = 'micro-genre';
        allBooks.push(book);
      }
    });
    console.log(`Added ${microGenreBooks.length} micro-genre books to pool`);
  } catch (err) {
    console.error('Error loading micro-genre books:', err);
  }
  
  if (allBooks.length === 0) {
    console.log('No books available for micro-genre generation');
    return;
  }
  
  // Get existing category names to avoid duplicates
  const existingCategories = getExistingCategoryNames();
  
  // Group books by micro-genre
  const microGenres = {};
  
  allBooks.forEach(book => {
    const keywords = extractBookKeywords(book);
    const genreName = generateMicroGenreName(book, keywords, existingCategories);
    
    // Skip if it conflicts with existing categories
    if (conflictsWithExisting(genreName, existingCategories)) {
      return;
    }
    
    if (!microGenres[genreName]) {
      microGenres[genreName] = [];
    }
    
    // Add book with its micro-genre info
    book.microGenre = genreName;
    book.microGenreKeywords = keywords;
    microGenres[genreName].push(book);
  });
  
  // Filter out micro-genres with too few books (need at least 4 to be displayed)
  const validMicroGenres = {};
  Object.keys(microGenres).forEach(genreName => {
    if (microGenres[genreName].length >= 4) {
      validMicroGenres[genreName] = microGenres[genreName];
    }
  });
  
  // Convert to array
  const allValidGenres = Object.entries(validMicroGenres);
  
  if (allValidGenres.length === 0) {
    console.log('No valid micro-genres generated');
    return;
  }
  
  console.log(`Total valid micro-genres available: ${allValidGenres.length}`, allValidGenres.map(([name]) => name));
  
  // Enhanced shuffle with better randomness
  function shuffleArray(array) {
    const shuffled = [...array];
    // Use Date.now() as additional entropy
    const entropy = Date.now() + Math.random() * 1000;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Combine multiple random sources for better distribution
      const random1 = Math.random();
      const random2 = (entropy + i) % 1;
      const combinedRandom = (random1 + random2) / 2;
      const j = Math.floor(combinedRandom * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Shuffle all valid genres multiple times for better randomization
  let shuffledGenres = allValidGenres;
  for (let i = 0; i < 5; i++) {
    shuffledGenres = shuffleArray(shuffledGenres);
  }
  
  // Determine how many to show (random between 6-10, or all if fewer)
  const maxToShow = Math.min(10, shuffledGenres.length);
  const minToShow = Math.min(6, shuffledGenres.length);
  const numToShow = minToShow + Math.floor(Math.random() * (maxToShow - minToShow + 1));
  
  // Use a more diverse selection strategy
  // Instead of taking consecutive items, sample from different parts
  const selectedGenres = [];
  const usedIndices = new Set();
  
  // First, randomly pick indices to ensure diversity
  while (selectedGenres.length < numToShow && usedIndices.size < shuffledGenres.length) {
    let attempts = 0;
    let index;
    
    // Try to find an unused index
    do {
      index = Math.floor(Math.random() * shuffledGenres.length);
      attempts++;
    } while (usedIndices.has(index) && attempts < 100);
    
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      selectedGenres.push(shuffledGenres[index]);
    } else {
      // If we can't find unused, break to avoid infinite loop
      break;
    }
  }
  
  // Final shuffle of selected genres for presentation order
  const finalSelection = shuffleArray(selectedGenres);
  
  // Render micro-genre categories
  renderMicroGenres(finalSelection);
  
  console.log(`Selected ${finalSelection.length} random micro-genres from ${allValidGenres.length} available (${allBooks.length} total books analyzed):`, finalSelection.map(([name]) => name));
}

// Render micro-genre categories on the page
function renderMicroGenres(microGenres) {
  const main = document.querySelector('main');
  if (!main) return;
  
  // Create a container for micro-genres (insert after existing categories)
  let microGenresContainer = document.getElementById('micro-genres-container');
  if (!microGenresContainer) {
    microGenresContainer = document.createElement('div');
    microGenresContainer.id = 'micro-genres-container';
    main.appendChild(microGenresContainer);
  }
  
  microGenresContainer.innerHTML = '';
  
  microGenres.forEach(([genreName, books]) => {
    // Create category section
    const categorySection = document.createElement('section');
    categorySection.className = 'category micro-genre-category';
    categorySection.dataset.microGenre = genreName.toLowerCase().replace(/\s+/g, '-');
    
    // Create heading
    const heading = document.createElement('h2');
    const words = genreName.split(' ');
    if (words.length > 1) {
      heading.innerHTML = `<span>${words[0]}</span> <span>${words.slice(1).join(' ')}</span>`;
    } else {
      heading.innerHTML = `<span>${genreName}</span>`;
    }
    categorySection.appendChild(heading);
    
    // Create row container
    const rowContainer = document.createElement('div');
    rowContainer.className = 'row-container';
    
    const scrollLeft = document.createElement('button');
    scrollLeft.className = 'scroll-left';
    scrollLeft.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    const bookRow = document.createElement('div');
    bookRow.className = 'book-row';
    bookRow.id = `micro-genre-${genreName.toLowerCase().replace(/\s+/g, '-')}`;
    
    const scrollRight = document.createElement('button');
    scrollRight.className = 'scroll-right';
    scrollRight.innerHTML = '<i class="fas fa-chevron-right"></i>';
    
    rowContainer.appendChild(scrollLeft);
    rowContainer.appendChild(bookRow);
    rowContainer.appendChild(scrollRight);
    
    categorySection.appendChild(rowContainer);
    microGenresContainer.appendChild(categorySection);
    
    // Render books in this micro-genre
    renderMicroGenreBooks(bookRow.id, books);
  });
  
  // Re-initialize infinite scroll for new categories
  setTimeout(() => {
    initializeInfiniteScroll();
  }, 100);
}

// Render books for a specific micro-genre
function renderMicroGenreBooks(containerId, books) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  const bookElements = [];
  
  books.forEach(book => {
    const div = document.createElement('div');
    div.className = 'book';
    div.innerHTML = `
      <img src="${book.img}" alt="${book.title}">
      <p>${book.title}</p>
    `;
    
    div.addEventListener('click', () => {
      localStorage.setItem('selectedBook', JSON.stringify(book));
      window.location.href = 'book.html';
    });
    
    container.appendChild(div);
    bookElements.push({ element: div, book });
  });
  
  // Duplicate for infinite scroll
  bookElements.forEach(({ element, book }) => {
    const clone = element.cloneNode(true);
    clone.addEventListener('click', () => {
      localStorage.setItem('selectedBook', JSON.stringify(book));
      window.location.href = 'book.html';
    });
    container.appendChild(clone);
  });
}

// ========== LIVE SEARCH FUNCTIONALITY ==========

let searchTimeout;
let allBooksCache = []; // Cache all books for faster searching

// Build cache of all books
function buildBooksCache() {
  allBooksCache = [];
  Object.keys(bookData).forEach(category => {
    if (bookData[category] && Array.isArray(bookData[category])) {
      bookData[category].forEach(book => {
        // Ensure author property is set
        if (!book.author || book.author === 'Unknown') {
          if (book.authors && Array.isArray(book.authors) && book.authors.length > 0) {
            book.author = book.authors[0];
          }
        }
        
        // Deduplicate by book ID or title
        const existing = allBooksCache.find(b => 
          (b.id && book.id && b.id === book.id) || 
          (b.title && book.title && b.title.toLowerCase() === book.title.toLowerCase())
        );
        if (!existing) {
          allBooksCache.push(book);
        }
      });
    }
  });
  console.log(`Search cache built: ${allBooksCache.length} books`);
}

// Search books from Google Books API
async function searchBooksFromAPI(query) {
  if (!query || query.length < 2) return [];
  
  try {
    const results = await fetchGoogleBooks(query, 20);
    return results.map(b => {
      const img = b.volumeInfo.imageLinks?.thumbnail || b.volumeInfo.imageLinks?.smallThumbnail;
      const authors = b.volumeInfo.authors || [];
      const categories = b.volumeInfo.categories || [];
      return {
        title: b.volumeInfo.title,
        img: img,
        authors: authors,
        author: authors.length > 0 ? authors[0] : "Unknown",
        genre: categories.length > 0 ? categories[0] : "Unspecified",
        categories: categories,
        description: b.volumeInfo.description || "No description.",
        pageCount: b.volumeInfo.pageCount || null,
        id: b.id,
        volumeInfo: b.volumeInfo
      };
    });
  } catch (err) {
    console.error('Error searching books:', err);
    return [];
  }
}

// Filter books from cache
function filterBooksFromCache(query) {
  if (!query || query.length < 1) return [];
  
  const lowerQuery = query.toLowerCase();
  return allBooksCache.filter(book => {
    const titleMatch = book.title?.toLowerCase().includes(lowerQuery);
    const authorMatch = book.author?.toLowerCase().includes(lowerQuery) ||
                       (book.authors && book.authors.some(a => a.toLowerCase().includes(lowerQuery)));
    const genreMatch = book.genre?.toLowerCase().includes(lowerQuery);
    return titleMatch || authorMatch || genreMatch;
  });
}

// Render search results
function renderSearchResults(books) {
  const resultsContainer = document.getElementById('searchResults');
  
  if (books.length === 0) {
    resultsContainer.innerHTML = '<div class="search-no-results">No books found</div>';
    resultsContainer.classList.add('active');
    return;
  }
  
  resultsContainer.innerHTML = '';
  
  books.slice(0, 10).forEach(book => { // Limit to 10 results
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    
    const description = book.description 
      ? (book.description.length > 100 ? book.description.substring(0, 100) + '...' : book.description)
      : 'No description available';
    
    // Get author name - check multiple sources
    let authorName = 'Unknown Author';
    if (book.author && book.author !== 'Unknown') {
      authorName = book.author;
    } else if (book.authors && Array.isArray(book.authors) && book.authors.length > 0) {
      authorName = book.authors[0];
    } else if (book.volumeInfo && book.volumeInfo.authors && book.volumeInfo.authors.length > 0) {
      authorName = book.volumeInfo.authors[0];
    }
    
    resultItem.innerHTML = `
      <img src="${book.img || ''}" alt="${book.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'90\'%3E%3Crect fill=\'%23333\' width=\'60\' height=\'90\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\' font-size=\'10\'%3ENo Image%3C/text%3E%3C/svg%3E'">
      <div class="search-result-info">
        <div class="search-result-title">${book.title}</div>
        <div class="search-result-author">${authorName}</div>
        <div class="search-result-description">${description}</div>
      </div>
    `;
    
    resultItem.addEventListener('click', () => {
      // Ensure book object has author property set before saving
      if (!book.author || book.author === 'Unknown') {
        if (book.authors && book.authors.length > 0) {
          book.author = book.authors[0];
        } else if (book.volumeInfo && book.volumeInfo.authors && book.volumeInfo.authors.length > 0) {
          book.author = book.volumeInfo.authors[0];
          book.authors = book.volumeInfo.authors;
        }
      }
      localStorage.setItem('selectedBook', JSON.stringify(book));
      window.location.href = 'book.html';
    });
    
    resultsContainer.appendChild(resultItem);
  });
  
  resultsContainer.classList.add('active');
}

// Handle search input
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

if (searchInput) {
  // Build cache when page loads (after initial load)
  setTimeout(() => {
    buildBooksCache();
  }, 3000); // Wait for books to load
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length === 0) {
      searchResults.classList.remove('active');
      return;
    }
    
    // Show loading state
    searchResults.innerHTML = '<div class="search-no-results">Searching...</div>';
    searchResults.classList.add('active');
    
    // Debounce search
    searchTimeout = setTimeout(async () => {
      // First, search in cached books (instant)
      const cachedResults = filterBooksFromCache(query);
      
      if (cachedResults.length > 0) {
        renderSearchResults(cachedResults);
      } else {
        // If no cached results, search API
        const apiResults = await searchBooksFromAPI(query);
        renderSearchResults(apiResults);
      }
    }, 300); // 300ms debounce
  });
  
  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('active');
    }
  });
  
  // Close on escape key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchResults.classList.remove('active');
      searchInput.blur();
    }
  });
}


