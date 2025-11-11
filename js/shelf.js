// Shelf Management JavaScript

// Load shelf list in sidebar
function loadShelfList() {
  // Try both shelf-list (shelf.html) and playlist-list (shelf-settings.html)
  const shelfList = document.getElementById('shelf-list') || document.getElementById('playlist-list');
  if (!shelfList) return;

  let shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  
  // If no shelves exist, create default shelf
  if (shelves.length === 0) {
    shelves = [{
      id: 1,
      name: 'Custom Shelf #1',
      books: [],
      settings: {
        background: "#141414",
        texture: "none",
        color: "#8B4513",
        decorations: []
      }
    }];
    localStorage.setItem('shelves', JSON.stringify(shelves));
    localStorage.setItem('currentShelfId', '1');
  }

  shelfList.innerHTML = '';
  
  const currentShelfId = localStorage.getItem('currentShelfId') || shelves[0].id.toString();
  
  shelves.forEach(shelf => {
    const li = document.createElement('li');
    li.textContent = shelf.name;
    li.dataset.shelfId = shelf.id;
    
    if (shelf.id.toString() === currentShelfId) {
      li.classList.add('active');
    }
    
    li.addEventListener('click', () => {
      switchToShelf(shelf.id);
    });
    
    shelfList.appendChild(li);
  });
}

// Switch to a different shelf
function switchToShelf(shelfId) {
  localStorage.setItem('currentShelfId', shelfId.toString());
  
  // Update active shelf in sidebar (handle both shelf-list and playlist-list)
  document.querySelectorAll('#shelf-list li, #playlist-list li').forEach(li => {
    li.classList.remove('active');
    if (li.dataset.shelfId === shelfId.toString()) {
      li.classList.add('active');
    }
  });
  
  // Reload shelf display (only if on shelf page)
  if (document.getElementById('book-shelf')) {
    displayBooks();
  }
  updateShelfName();
  
  // If on settings page, reload settings
  if (typeof loadSettings === 'function' && typeof loadSlottedBooks === 'function') {
    loadSettings();
    loadSlottedBooks();
  }
}

// Update current shelf name in header
function updateShelfName() {
  const currentShelfName = document.getElementById('current-shelf-name');
  if (!currentShelfName) return;
  
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  
  if (currentShelfId && shelves.length > 0) {
    const currentShelf = shelves.find(s => s.id.toString() === currentShelfId);
    if (currentShelf) {
      currentShelfName.textContent = currentShelf.name;
    }
  }
}

// Add new shelf
function addNewShelf() {
  const shelfName = prompt('Enter shelf name:');
  if (!shelfName || shelfName.trim() === '') return;
  
  let shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  
  // Find next available ID
  const maxId = shelves.length > 0 ? Math.max(...shelves.map(s => s.id)) : 0;
  const newShelf = {
    id: maxId + 1,
    name: shelfName.trim(),
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
  
  // Switch to new shelf
  switchToShelf(newShelf.id);
  
  // Reload shelf list
  loadShelfList();
}

// Display books on shelf
function displayBooks() {
  const bookShelf = document.getElementById('book-shelf');
  if (!bookShelf) return;
  
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  
  if (!currentShelfId || shelves.length === 0) {
    bookShelf.innerHTML = '<p style="color: #ccc; text-align: center; padding: 40px;">No shelf selected</p>';
    return;
  }
  
  const currentShelf = shelves.find(s => s.id.toString() === currentShelfId);
  if (!currentShelf) {
    bookShelf.innerHTML = '<p style="color: #ccc; text-align: center; padding: 40px;">Shelf not found</p>';
    return;
  }
  
  const books = currentShelf.books || [];
  
  // Apply shelf settings
  const settings = currentShelf.settings || {};
  bookShelf.style.backgroundColor = settings.background || '#141414';
  bookShelf.style.borderTopColor = settings.color || '#8B4513';
  
  // Apply texture
  bookShelf.classList.remove('texture-wood', 'texture-glass', 'texture-stone', 'texture-marble', 'texture-metal', 'texture-brick');
  if (settings.texture && settings.texture !== 'none') {
    bookShelf.classList.add(`texture-${settings.texture}`);
  }
  
  bookShelf.innerHTML = '';
  
  // Add left bookend if decoration exists
  if (settings.decorations && settings.decorations.length > 0 && settings.decorations[0]) {
    const leftBookend = document.createElement('div');
    leftBookend.className = 'bookend bookend-left';
    leftBookend.innerHTML = `<i class="fas fa-${getDecorationIcon(settings.decorations[0])}"></i>`;
    bookShelf.appendChild(leftBookend);
  }
  
  // Add books
  if (books.length === 0) {
    // Show empty slots
    for (let i = 0; i < 5; i++) {
      const slot = document.createElement('div');
      slot.className = 'book-slot empty';
      bookShelf.appendChild(slot);
    }
  } else {
    books.forEach((book, index) => {
      const slot = document.createElement('div');
      slot.className = 'book-slot has-book';
      
      const img = document.createElement('img');
      img.src = book.img || book.image || '';
      img.alt = book.title || '';
      
      // Click to view book
      slot.addEventListener('click', () => {
        localStorage.setItem('selectedBook', JSON.stringify(book));
        window.location.href = 'book.html';
      });
      
      // Add remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-book-btn';
      removeBtn.innerHTML = '×';
      removeBtn.setAttribute('aria-label', `Remove ${book.title}`);
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeBookFromShelf(index);
      });
      
      slot.appendChild(img);
      slot.appendChild(removeBtn);
      bookShelf.appendChild(slot);
    });
  }
  
  // Add right bookend if decoration exists
  if (settings.decorations && settings.decorations.length > 0) {
    const rightDecor = settings.decorations[1] || settings.decorations[0];
    if (rightDecor) {
      const rightBookend = document.createElement('div');
      rightBookend.className = 'bookend bookend-right';
      rightBookend.innerHTML = `<i class="fas fa-${getDecorationIcon(rightDecor)}"></i>`;
      bookShelf.appendChild(rightBookend);
    }
  }
  
  // Sync with legacy myShelf for backward compatibility
  localStorage.setItem('myShelf', JSON.stringify(books));
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

// Remove book from current shelf
function removeBookFromShelf(index) {
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  
  if (!currentShelfId || shelves.length === 0) return;
  
  const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
  if (shelfIndex === -1) return;
  
  const currentShelf = shelves[shelfIndex];
  const books = currentShelf.books || [];
  
  if (index >= 0 && index < books.length) {
    const bookTitle = books[index].title;
    if (confirm(`Remove "${bookTitle}" from "${currentShelf.name}"?`)) {
      books.splice(index, 1);
      currentShelf.books = books;
      shelves[shelfIndex] = currentShelf;
      localStorage.setItem('shelves', JSON.stringify(shelves));
      
      // Sync with legacy myShelf
      localStorage.setItem('myShelf', JSON.stringify(books));
      
      // Reload display
      displayBooks();
    }
  }
}

// Initialize shelf page
function initShelf() {
  // Ensure shelves array exists
  let shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  if (shelves.length === 0) {
    shelves = [{
      id: 1,
      name: 'Custom Shelf #1',
      books: [],
      settings: {
        background: "#141414",
        texture: "none",
        color: "#8B4513",
        decorations: []
      }
    }];
    localStorage.setItem('shelves', JSON.stringify(shelves));
    localStorage.setItem('currentShelfId', '1');
  }
  
  // Set current shelf if not set
  if (!localStorage.getItem('currentShelfId')) {
    localStorage.setItem('currentShelfId', shelves[0].id.toString());
  }
  
  // Load shelf list
  loadShelfList();
  
  // Display books
  displayBooks();
  
  // Update shelf name
  updateShelfName();
  
  // Load recommended books
  loadRecommendedBooks();
}

// Load recommended books
function loadRecommendedBooks() {
  const recommendedList = document.getElementById('recommended-list');
  if (!recommendedList) return;
  
  // Get book data from script.js (if available)
  if (typeof bookData !== 'undefined' && bookData.suggested) {
    const suggested = bookData.suggested || [];
    recommendedList.innerHTML = '';
    
    if (suggested.length === 0) {
      recommendedList.innerHTML = '<li style="color: #999; font-size: 0.9rem;">No recommendations available</li>';
      return;
    }
    
    suggested.slice(0, 5).forEach(book => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${book.img}" alt="${book.title}">
        <span>${book.title}</span>
      `;
      li.addEventListener('click', () => {
        localStorage.setItem('selectedBook', JSON.stringify(book));
        window.location.href = 'book.html';
      });
      recommendedList.appendChild(li);
    });
  } else {
    // Fallback if bookData is not available
    recommendedList.innerHTML = '<li style="color: #999; font-size: 0.9rem;">Loading recommendations...</li>';
  }
}

// Make functions available globally
window.loadShelfList = loadShelfList;
window.addNewShelf = addNewShelf;
window.switchToShelf = switchToShelf;
window.removeBookFromShelf = removeBookFromShelf;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShelf);
} else {
  initShelf();
}

