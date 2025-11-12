const bookData = {
  suggested: [
    { title: "The Midnight Library", img: "https://covers.openlibrary.org/b/id/10556125-L.jpg" },
    { title: "Project Hail Mary", img: "https://covers.openlibrary.org/b/id/10958365-L.jpg" },
    { title: "The Song of Achilles", img: "https://covers.openlibrary.org/b/id/8275261-L.jpg" },
    { title: "Dune", img: "https://covers.openlibrary.org/b/id/8108694-L.jpg" },
    { title: "Circe", img: "https://covers.openlibrary.org/b/id/8942926-L.jpg" },
    { title: "The Silent Patient", img: "https://covers.openlibrary.org/b/id/8944288-L.jpg" },
    { title: "Addie LaRue", img: "https://covers.openlibrary.org/b/id/10317549-L.jpg" },
    { title: "A Man Called Ove", img: "https://covers.openlibrary.org/b/id/8228696-L.jpg" }
  ],
  featured: [
    { title: "The Midnight Library", img: "https://covers.openlibrary.org/b/id/10556125-L.jpg" },
    { title: "Project Hail Mary", img: "https://covers.openlibrary.org/b/id/10958365-L.jpg" }
  ],
  fantasy: [
    { title: "A Court of Thorns and Roses", img: "https://covers.openlibrary.org/b/id/10194747-L.jpg" },
    { title: "The Hobbit", img: "https://covers.openlibrary.org/b/id/6979861-L.jpg" },
    { title: "Throne of Glass", img: "https://covers.openlibrary.org/b/id/8235115-L.jpg" },
    { title: "The Name of the Wind", img: "https://covers.openlibrary.org/b/id/240726-L.jpg" },
    { title: "Mistborn", img: "https://covers.openlibrary.org/b/id/8757278-L.jpg" },
    { title: "The Way of Kings", img: "https://covers.openlibrary.org/b/id/7630455-L.jpg" },
    { title: "Six of Crows", img: "https://covers.openlibrary.org/b/id/8375046-L.jpg" },
    { title: "The Priory of the Orange Tree", img: "https://covers.openlibrary.org/b/id/10050659-L.jpg" }
  ],
  horror: [
    { title: "It", img: "https://covers.openlibrary.org/b/id/10540315-L.jpg" },
    { title: "The Shining", img: "https://covers.openlibrary.org/b/id/11162659-L.jpg" },
    { title: "Mexican Gothic", img: "https://covers.openlibrary.org/b/id/10602427-L.jpg" },
    { title: "Bird Box", img: "https://covers.openlibrary.org/b/id/8393986-L.jpg" },
    { title: "Dracula", img: "https://covers.openlibrary.org/b/id/10995125-L.jpg" },
    { title: "Frankenstein", img: "https://covers.openlibrary.org/b/id/11281755-L.jpg" },
    { title: "Coraline", img: "https://covers.openlibrary.org/b/id/9445262-L.jpg" },
    { title: "The Haunting of Hill House", img: "https://covers.openlibrary.org/b/id/8142271-L.jpg" }
  ],
  romance: [
    { title: "Pride and Prejudice", img: "https://covers.openlibrary.org/b/id/8081536-L.jpg" },
    { title: "The Love Hypothesis", img: "https://covers.openlibrary.org/b/id/12687146-L.jpg" },
    { title: "Beach Read", img: "https://covers.openlibrary.org/b/id/10555174-L.jpg" },
    { title: "Twilight", img: "https://covers.openlibrary.org/b/id/7884866-L.jpg" },
    { title: "Me Before You", img: "https://covers.openlibrary.org/b/id/8317743-L.jpg" },
    { title: "The Notebook", img: "https://covers.openlibrary.org/b/id/8223056-L.jpg" },
    { title: "Red, White & Royal Blue", img: "https://covers.openlibrary.org/b/id/9876860-L.jpg" },
    { title: "To All the Boys I've Loved Before", img: "https://covers.openlibrary.org/b/id/8160827-L.jpg" }
  ],
  mystery: [
    { title: "Gone Girl", img: "https://covers.openlibrary.org/b/id/7884972-L.jpg" },
    { title: "The Girl with the Dragon Tattoo", img: "https://covers.openlibrary.org/b/id/8215263-L.jpg" },
    { title: "Big Little Lies", img: "https://covers.openlibrary.org/b/id/8317096-L.jpg" },
    { title: "In the Woods", img: "https://covers.openlibrary.org/b/id/7915984-L.jpg" },
    { title: "Sharp Objects", img: "https://covers.openlibrary.org/b/id/7916039-L.jpg" },
    { title: "The Da Vinci Code", img: "https://covers.openlibrary.org/b/id/8221255-L.jpg" },
    { title: "The Couple Next Door", img: "https://covers.openlibrary.org/b/id/8703735-L.jpg" },
    { title: "The Girl on the Train", img: "https://covers.openlibrary.org/b/id/8226763-L.jpg" }
  ],
  scifi: [
    { title: "Ender's Game", img: "https://covers.openlibrary.org/b/id/8231112-L.jpg" },
    { title: "Neuromancer", img: "https://covers.openlibrary.org/b/id/10935042-L.jpg" },
    { title: "Snow Crash", img: "https://covers.openlibrary.org/b/id/10538634-L.jpg" },
    { title: "Ready Player One", img: "https://covers.openlibrary.org/b/id/8160951-L.jpg" },
    { title: "The Martian", img: "https://covers.openlibrary.org/b/id/8281993-L.jpg" },
    { title: "Hyperion", img: "https://covers.openlibrary.org/b/id/10819545-L.jpg" },
    { title: "Children of Time", img: "https://covers.openlibrary.org/b/id/11235935-L.jpg" },
    { title: "Recursion", img: "https://covers.openlibrary.org/b/id/10226291-L.jpg" }
  ],
  nonfiction: [
    { title: "Educated", img: "https://covers.openlibrary.org/b/id/8955639-L.jpg" },
    { title: "Becoming", img: "https://covers.openlibrary.org/b/id/9131701-L.jpg" },
    { title: "Sapiens", img: "https://covers.openlibrary.org/b/id/8372423-L.jpg" },
    { title: "Atomic Habits", img: "https://covers.openlibrary.org/b/id/9870248-L.jpg" },
    { title: "The Power of Habit", img: "https://covers.openlibrary.org/b/id/8233309-L.jpg" },
    { title: "Can't Hurt Me", img: "https://covers.openlibrary.org/b/id/8719031-L.jpg" },
    { title: "Outliers", img: "https://covers.openlibrary.org/b/id/8232030-L.jpg" },
    { title: "Thinking, Fast and Slow", img: "https://covers.openlibrary.org/b/id/8319695-L.jpg" }
  ]
};

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

// Render books with infinite loop support
Object.keys(bookData).forEach(category => {
  // Skip featured category as it's handled separately
  if (category === 'featured') return;
  
  const container = document.getElementById(category);
  if (container) {
    // Clear container first
    container.innerHTML = '';
    
    // Create original books
    const books = [];
    bookData[category].forEach(book => {
      const div = document.createElement("div");
      div.classList.add("book");
      div.innerHTML = `
        <img src="${book.img}" alt="${book.title}">
        <p>${book.title}</p>
      `;

      // Add click event
      div.addEventListener('click', () => {
        localStorage.setItem('selectedBook', JSON.stringify(book));
        window.location.href = 'book.html';
      });

      container.appendChild(div);
      books.push({ element: div, book: book });
    });
    
    // Duplicate books for infinite loop (add at the end)
    books.forEach(({ element, book }) => {
      const clone = element.cloneNode(true);
      // Re-add click event to clone
      clone.addEventListener('click', () => {
        localStorage.setItem('selectedBook', JSON.stringify(book));
        window.location.href = 'book.html';
      });
      container.appendChild(clone);
    });
  }
});

// Render featured books
renderFeaturedBooks();

// Infinite loop scroll functionality
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


