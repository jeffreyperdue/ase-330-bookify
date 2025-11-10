// Book data (same structure as script.js for recommended books)
// In a real app, this would be imported or shared
const bookData = {
  suggested: [
    { title: "The Midnight Library", img: "https://covers.openlibrary.org/b/id/10556125-L.jpg" },
    { title: "Project Hail Mary", img: "https://covers.openlibrary.org/b/id/10958365-L.jpg" },
    { title: "The Song of Achilles", img: "https://covers.openlibrary.org/b/id/8275261-L.jpg" },
    { title: "Dune", img: "https://covers.openlibrary.org/b/id/8108694-L.jpg" },
    { title: "Circe", img: "https://covers.openlibrary.org/b/id/8942926-L.jpg" },
    { title: "The Silent Patient", img: "https://covers.openlibrary.org/b/id/8944288-L.jpg" }
  ],
  fantasy: [
    { title: "A Court of Thorns and Roses", img: "https://covers.openlibrary.org/b/id/10194747-L.jpg" },
    { title: "The Hobbit", img: "https://covers.openlibrary.org/b/id/6979861-L.jpg" },
    { title: "Throne of Glass", img: "https://covers.openlibrary.org/b/id/8235115-L.jpg" }
  ],
  romance: [
    { title: "Pride and Prejudice", img: "https://covers.openlibrary.org/b/id/8081536-L.jpg" },
    { title: "The Love Hypothesis", img: "https://covers.openlibrary.org/b/id/12687146-L.jpg" },
    { title: "Beach Read", img: "https://covers.openlibrary.org/b/id/10555174-L.jpg" }
  ]
};

// Load shelf settings and apply them
function loadShelfSettings() {
  const settings = JSON.parse(localStorage.getItem('shelfSettings')) || {
    background: "#141414",
    texture: "none",
    color: "#8B4513",
    decorations: []
  };

  // Apply background color
  if (settings.background) {
    document.body.style.backgroundColor = settings.background;
  }

  // Apply shelf color to the shelf board
  const shelf = document.querySelector('.book-shelf');
  if (shelf && settings.color) {
    shelf.style.borderTopColor = settings.color;
    // Also update the ::before pseudo-element color if possible
    // We'll use a CSS variable for this
    document.documentElement.style.setProperty('--shelf-color', settings.color);
  }

  // Apply texture (if textures are implemented)
  if (settings.texture && settings.texture !== "none") {
    // Remove existing texture classes
    if (shelf) {
      shelf.classList.remove('texture-wood', 'texture-glass', 'texture-stone');
      shelf.classList.add(`texture-${settings.texture}`);
    }
  } else if (shelf) {
    // Remove all texture classes if none selected
    shelf.classList.remove('texture-wood', 'texture-glass', 'texture-stone');
  }

  return settings;
}

// Load books from localStorage and render on shelf
function loadShelfBooks() {
  const myShelf = JSON.parse(localStorage.getItem('myShelf')) || [];
  const shelfContainer = document.getElementById('book-shelf');
  
  if (!shelfContainer) return;

  // Clear existing content
  shelfContainer.innerHTML = '';

  // Render books
  if (myShelf.length === 0) {
    // Show empty slots if no books
    for (let i = 0; i < 6; i++) {
      const slot = document.createElement('div');
      slot.className = 'book-slot empty';
      shelfContainer.appendChild(slot);
    }
  } else {
    // Render actual books
    myShelf.forEach(book => {
      const slot = document.createElement('div');
      slot.className = 'book-slot has-book';
      
      const img = document.createElement('img');
      img.src = book.img || book.image || '';
      img.alt = book.title || 'Book cover';
      img.title = book.title || '';
      
      // Click to view book details
      img.addEventListener('click', () => {
        localStorage.setItem('selectedBook', JSON.stringify(book));
        window.location.href = 'book.html';
      });
      
      slot.appendChild(img);
      shelfContainer.appendChild(slot);
    });

    // Add empty slots if less than 6 books
    const remainingSlots = 6 - myShelf.length;
    for (let i = 0; i < remainingSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'book-slot empty';
      shelfContainer.appendChild(slot);
    }
  }
}

// Load and render recommended books
function loadRecommendedBooks() {
  const recommendedList = document.getElementById('recommended-list');
  if (!recommendedList) return;

  // Get recommended books from suggested category
  const recommended = bookData.suggested.slice(0, 4); // Show first 4 recommended books

  recommendedList.innerHTML = '';

  recommended.forEach(book => {
    const li = document.createElement('li');
    
    const img = document.createElement('img');
    img.src = book.img;
    img.alt = book.title;
    
    const span = document.createElement('span');
    span.textContent = book.title;
    
    li.appendChild(img);
    li.appendChild(span);
    
    // Click to add book to shelf
    li.addEventListener('click', () => {
      addBookToShelf(book);
    });
    
    recommendedList.appendChild(li);
  });
}

// Add book to shelf
function addBookToShelf(book) {
  if (!book) return;

  // Get existing shelf
  let myShelf = JSON.parse(localStorage.getItem('myShelf')) || [];

  // Check if book is already on shelf
  const existingBook = myShelf.find(b => b.title === book.title);
  if (existingBook) {
    alert(`${book.title} is already on your shelf!`);
    return;
  }

  // Add book to shelf
  myShelf.push(book);
  localStorage.setItem('myShelf', JSON.stringify(myShelf));

  // Re-render shelf
  loadShelfBooks();

  // Show confirmation
  alert(`${book.title} has been added to your shelf!`);
}

// Initialize shelf page
function initShelf() {
  // Load and render shelf books first (creates the shelf element)
  loadShelfBooks();

  // Then load and apply settings (settings need the shelf element to exist)
  loadShelfSettings();

  // Load and render recommended books
  loadRecommendedBooks();
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShelf);
} else {
  initShelf();
}

