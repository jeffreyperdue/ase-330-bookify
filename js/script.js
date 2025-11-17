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
    return {
      title: b.volumeInfo.title,
      img: img,
      authors: b.volumeInfo.authors || ["Unknown"],
      description: b.volumeInfo.description || "No description.",
      id: b.id
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
      
      if (img1) img1.src = book1.img;
      if (img1) img1.alt = book1.title;
      if (title1) title1.textContent = book1.title;
      
      // Add click event to entire featured book card
      featuredBook1.addEventListener('click', () => {
        localStorage.setItem('selectedBook', JSON.stringify(book1));
        window.location.href = 'book.html';
      });
    }
    
    if (featuredBook2) {
      const book2 = bookData.featured[1];
      const img2 = featuredBook2.querySelector('.featured-book-image img');
      const title2 = featuredBook2.querySelector('.featured-book-title');
      
      if (img2) img2.src = book2.img;
      if (img2) img2.alt = book2.title;
      if (title2) title2.textContent = book2.title;
      
      // Add click event to entire featured book card
      featuredBook2.addEventListener('click', () => {
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

// Genre filtering functionality
const sidebarButtons = document.querySelectorAll('.sidebar button');
const categories = document.querySelectorAll('.category');

let activeFilters = new Set(); // store selected filters

sidebarButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    // Toggle filter on/off
    if (activeFilters.has(filter)) {
      activeFilters.delete(filter);
      button.classList.remove('active');
    } else {
      // Clear all other active filters for single selection
      sidebarButtons.forEach(btn => btn.classList.remove('active'));
      activeFilters.clear();
      activeFilters.add(filter);
      button.classList.add('active');
    }

    // Update visible categories
    if (activeFilters.size === 0) {
      categories.forEach(cat => cat.style.display = 'block'); // show all if no filter
    } else {
      categories.forEach(cat => {
        // Get the book-row element and its ID
        const bookRow = cat.querySelector('.book-row');
        if (bookRow) {
          const categoryId = bookRow.id;
          // Match filter with category ID (handle scifi -> scifi mapping)
          if (activeFilters.has(categoryId)) {
            cat.style.display = 'block';
          } else {
            cat.style.display = 'none';
          }
        }
      });
    }
  });
});

// Search functionality
const searchIcon = document.querySelector('.right-section .fa-search');
if (searchIcon) {
  searchIcon.addEventListener('click', () => {
    const searchTerm = prompt('Enter book title to search:');
    if (searchTerm) {
      // Search through all books
      let foundBook = null;
      Object.keys(bookData).forEach(category => {
        bookData[category].forEach(book => {
          if (book.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            foundBook = book;
          }
        });
      });

      if (foundBook) {
        localStorage.setItem('selectedBook', JSON.stringify(foundBook));
        window.location.href = 'book.html';
      } else {
        alert(`No book found matching "${searchTerm}"`);
      }
    }
  });
}


