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

  // Apply background color to shelf container area only, not whole page
  const shelfContainer = document.querySelector('.book-shelf-container');
  if (shelfContainer && settings.background) {
    shelfContainer.style.backgroundColor = settings.background;
    shelfContainer.style.borderRadius = '12px';
    shelfContainer.style.padding = '20px';
  }

  // Apply shelf color to the shelf board
  const shelf = document.querySelector('.book-shelf');
  if (shelf && settings.color) {
    shelf.style.borderTopColor = settings.color;
    document.documentElement.style.setProperty('--shelf-color', settings.color);
  }

  // Apply texture
  if (settings.texture && settings.texture !== "none") {
    if (shelf) {
      shelf.classList.remove('texture-wood', 'texture-glass', 'texture-stone', 'texture-marble', 'texture-metal', 'texture-brick');
      shelf.classList.add(`texture-${settings.texture}`);
    }
  } else if (shelf) {
    shelf.classList.remove('texture-wood', 'texture-glass', 'texture-stone', 'texture-marble', 'texture-metal', 'texture-brick');
  }

  // Apply decorations as bookends
  applyDecorations(settings.decorations);

  return settings;
}

// Apply decorations as bookends on the shelf
function applyDecorations(decorations) {
  const shelf = document.querySelector('.book-shelf');
  if (!shelf) return;

  // Remove existing bookends
  const existingBookends = shelf.querySelectorAll('.bookend');
  existingBookends.forEach(bookend => bookend.remove());

  // Get all book slots (not bookends)
  const bookSlots = Array.from(shelf.children).filter(child => !child.classList.contains('bookend'));

  // Add bookends based on selected decorations
  if (decorations && decorations.length > 0) {
    // Left bookend - insert at the very beginning
    if (decorations[0]) {
      const leftBookend = document.createElement('div');
      leftBookend.className = 'bookend bookend-left';
      leftBookend.innerHTML = `<i class="fas fa-${getDecorationIcon(decorations[0])}"></i>`;
      // Insert at the beginning of the shelf
      if (shelf.firstChild) {
        shelf.insertBefore(leftBookend, shelf.firstChild);
      } else {
        shelf.appendChild(leftBookend);
      }
    }

    // Right bookend (use second decoration or same as first) - append at the very end
    const rightDecor = decorations[1] || decorations[0];
    if (rightDecor) {
      const rightBookend = document.createElement('div');
      rightBookend.className = 'bookend bookend-right';
      rightBookend.innerHTML = `<i class="fas fa-${getDecorationIcon(rightDecor)}"></i>`;
      // Append at the end of the shelf
      shelf.appendChild(rightBookend);
    }
  }
}

// Get Font Awesome icon class for decoration
function getDecorationIcon(decor) {
  const iconMap = {
    'flag': 'flag',
    'airplane': 'plane',
    'bookmark': 'bookmark',
    'person': 'user',
    'frog': 'frog',
    'apple': 'apple-alt',
    'star': 'star',
    'heart': 'heart',
    'moon': 'moon',
    'sun': 'sun',
    'crown': 'crown',
    'gem': 'gem'
  };
  return iconMap[decor] || 'book';
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

  // Update current shelf in shelves array
  const currentShelfId = localStorage.getItem('currentShelfId');
  if (currentShelfId) {
    let shelves = JSON.parse(localStorage.getItem('shelves')) || [];
    const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
    if (shelfIndex !== -1) {
      shelves[shelfIndex].books = myShelf;
      localStorage.setItem('shelves', JSON.stringify(shelves));
    }
  }

  // Re-render shelf
  loadShelfBooks();
  
  // Re-apply settings to maintain decorations
  loadShelfSettings();

  // Show confirmation
  alert(`${book.title} has been added to your shelf!`);
}

// Add new shelf function
function addNewShelf() {
  const shelfName = prompt('Enter name for new shelf:');
  if (shelfName) {
    // Get existing shelves
    let shelves = JSON.parse(localStorage.getItem('shelves')) || [];
    
    // Add new shelf
    const newShelf = {
      id: Date.now(),
      name: shelfName,
      books: [],
      settings: {
        background: "#141414",
        texture: "none",
        color: "#8B4513",
        decorations: []
      }
    };
    
    shelves.push(newShelf);
    localStorage.setItem('shelves', JSON.stringify(shelves));
    
    // Update shelf list
    loadShelfList();
    alert(`Shelf "${shelfName}" created!`);
  }
}

// Load shelf list
function loadShelfList() {
  const shelfList = document.getElementById('shelf-list');
  if (!shelfList) return;

  let shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  
  // If no shelves exist, create default one
  if (shelves.length === 0) {
    shelves = [{
      id: 1,
      name: 'Custom Shelf #1',
      books: JSON.parse(localStorage.getItem('myShelf')) || [],
      settings: JSON.parse(localStorage.getItem('shelfSettings')) || {
        background: "#141414",
        texture: "none",
        color: "#8B4513",
        decorations: []
      }
    }];
    localStorage.setItem('shelves', JSON.stringify(shelves));
  }

  shelfList.innerHTML = '';
  shelves.forEach((shelf, index) => {
    const li = document.createElement('li');
    li.textContent = shelf.name;
    if (index === 0) li.classList.add('active');
    li.addEventListener('click', () => {
      document.querySelectorAll('#shelf-list li').forEach(item => item.classList.remove('active'));
      li.classList.add('active');
      switchToShelf(shelf.id);
    });
    shelfList.appendChild(li);
  });

  // Update current shelf name
  const currentShelfName = document.getElementById('current-shelf-name');
  if (currentShelfName && shelves.length > 0) {
    currentShelfName.textContent = shelves[0].name;
  }
}

// Switch to a different shelf
function switchToShelf(shelfId) {
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const shelf = shelves.find(s => s.id === shelfId);
  if (shelf) {
    // Update current shelf in localStorage
    localStorage.setItem('myShelf', JSON.stringify(shelf.books));
    localStorage.setItem('shelfSettings', JSON.stringify(shelf.settings));
    localStorage.setItem('currentShelfId', shelfId.toString());
    
    // Update display
    const currentShelfName = document.getElementById('current-shelf-name');
    if (currentShelfName) {
      currentShelfName.textContent = shelf.name;
    }
    
    // Reload shelf
    loadShelfBooks();
    loadShelfSettings();
  }
}

// Initialize shelf page
function initShelf() {
  // Load shelf list
  loadShelfList();
  
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

