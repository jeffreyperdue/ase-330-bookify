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
      rows: [{
        id: 1,
        books: []
      }],
      settings: {
        background: "#141414",
        backgroundType: "color",
        backgroundImage: null,
        backgroundGradient: null,
        texture: "none",
        color: "#8B4513",
        decorations: [],
        bookendBackground: {
          show: true,
          color: "#654321",
          opacity: 1
        }
      }
    }];
    localStorage.setItem('shelves', JSON.stringify(shelves));
    localStorage.setItem('currentShelfId', '1');
  } else {
    // Migrate all shelves to row-based structure
    shelves = shelves.map(shelf => migrateShelfToRows(shelf));
    localStorage.setItem('shelves', JSON.stringify(shelves));
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
  
  // If on settings page, reload settings for the new shelf
  if (typeof loadSettings === 'function' && typeof loadSlottedBooks === 'function') {
    // Reset temp book order when switching shelves to ensure all books are shown
    if (typeof window !== 'undefined') {
      window.tempBookOrder = null;
    }
    loadSettings(shelfId);
    loadSlottedBooks(); // This will now properly load all books from the new shelf
    // Mark that we've loaded new settings, so no unsaved changes
    if (typeof markSettingsAsSaved === 'function') {
      markSettingsAsSaved();
    }
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

// Migrate shelf to row-based structure if needed
function migrateShelfToRows(shelf) {
  // If shelf already has rows, return as is
  if (shelf.rows && Array.isArray(shelf.rows)) {
    return shelf;
  }
  
  // Migrate flat books array to rows
  const books = shelf.books || [];
  const rows = [];
  const booksPerRow = 5;
  
  // Distribute books into rows
  for (let i = 0; i < books.length; i += booksPerRow) {
    rows.push({
      id: rows.length + 1,
      books: books.slice(i, i + booksPerRow)
    });
  }
  
  // If no books, create one empty row
  if (rows.length === 0) {
    rows.push({
      id: 1,
      books: []
    });
  }
  
  shelf.rows = rows;
  // Keep books array for backward compatibility
  return shelf;
}

// Display books on shelf with row support
function displayBooks() {
  const bookShelf = document.getElementById('book-shelf');
  if (!bookShelf) return;
  
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  
  if (!currentShelfId || shelves.length === 0) {
    bookShelf.innerHTML = '<p style="color: #ccc; text-align: center; padding: 40px;">No shelf selected</p>';
    return;
  }
  
  const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
  if (shelfIndex === -1) {
    bookShelf.innerHTML = '<p style="color: #ccc; text-align: center; padding: 40px;">Shelf not found</p>';
    return;
  }
  
  // Migrate shelf if needed
  shelves[shelfIndex] = migrateShelfToRows(shelves[shelfIndex]);
  const currentShelf = shelves[shelfIndex];
  localStorage.setItem('shelves', JSON.stringify(shelves));
  
  const rows = currentShelf.rows || [];
  
  // Apply shelf settings
  const settings = currentShelf.settings || {};
  const background = settings.background || '#141414';
  const shelfColor = settings.color || '#8B4513';
  
  // Apply shelf color (border)
  bookShelf.style.borderTopColor = shelfColor;
  
  // Apply texture classes first
  bookShelf.classList.remove('texture-wood', 'texture-glass', 'texture-stone', 'texture-marble', 'texture-metal', 'texture-brick');
  
  // Apply background based on type
  bookShelf.style.backgroundImage = '';
  bookShelf.style.backgroundColor = '';
  
  const bgType = settings.backgroundType || 'color';
  
  if (bgType === 'image' && settings.backgroundImage) {
    // Background image
    bookShelf.style.backgroundImage = `url(${settings.backgroundImage})`;
    bookShelf.style.backgroundSize = 'cover';
    bookShelf.style.backgroundPosition = 'center';
    bookShelf.style.backgroundColor = background; // Fallback color
  } else if (bgType === 'gradient' && settings.backgroundGradient) {
    // Background gradient
    const grad = settings.backgroundGradient;
    let gradientString;
    if (grad.type === 'linear') {
      gradientString = `linear-gradient(${grad.direction}, ${grad.colors.join(', ')})`;
    } else {
      gradientString = `radial-gradient(circle, ${grad.colors.join(', ')})`;
    }
    bookShelf.style.backgroundImage = gradientString;
    bookShelf.style.backgroundColor = grad.colors[0]; // Fallback
  } else {
    // Solid color
    bookShelf.style.backgroundColor = background;
  }
  
  // Apply texture overlay if needed
  if (settings.texture && settings.texture !== 'none') {
    bookShelf.classList.add(`texture-${settings.texture}`);
  }
  
  bookShelf.innerHTML = '';
  
  // Display each row
  rows.forEach((row, rowIndex) => {
    const rowContainer = document.createElement('div');
    rowContainer.className = 'shelf-row';
    rowContainer.dataset.rowIndex = rowIndex;
    
    // Add delete row button for empty rows (only if row has no books and there are multiple rows)
    const books = row.books || [];
    const isEmptyRow = books.length === 0;
    const hasMultipleRows = rows.length > 1;
    
    // Show delete button on empty rows if there are multiple rows (can delete last row if there are others)
    if (isEmptyRow && hasMultipleRows) {
      const deleteRowBtn = document.createElement('button');
      deleteRowBtn.className = 'delete-row-btn';
      deleteRowBtn.innerHTML = '<i class="fas fa-trash"></i> Delete Row';
      deleteRowBtn.setAttribute('aria-label', 'Delete empty row');
      deleteRowBtn.title = 'Delete this empty row';
      deleteRowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirm('Delete this empty row?')) {
          deleteRow(rowIndex);
        }
      });
      rowContainer.appendChild(deleteRowBtn);
    }
    
    // Add left bookend if decoration exists (only on first row)
    if (rowIndex === 0) {
      const leftDecor = settings.decorations && settings.decorations.find(d => {
        if (typeof d === 'string') return true;
        return d.position === 'left' || (!d.position && settings.decorations.indexOf(d) === 0);
      });
      if (leftDecor) {
        const leftBookend = renderBookend(leftDecor, settings, 'left');
        if (leftBookend) {
          rowContainer.appendChild(leftBookend);
        }
      } else {
        // Empty space for alignment if no bookend
        const spacer = document.createElement('div');
        spacer.className = 'bookend-spacer';
        rowContainer.appendChild(spacer);
      }
    }
    
    // Add books in this row (books variable already defined above)
    if (books.length === 0) {
      // Show empty slots (up to 5)
      for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'book-slot empty';
        rowContainer.appendChild(slot);
      }
    } else {
      books.forEach((book, bookIndex) => {
        const slot = document.createElement('div');
        slot.className = 'book-slot has-book';
        slot.dataset.rowIndex = rowIndex;
        slot.dataset.bookIndex = bookIndex;
        
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
          removeBookFromShelf(rowIndex, bookIndex);
        });
        
        slot.appendChild(img);
        slot.appendChild(removeBtn);
        rowContainer.appendChild(slot);
      });
      
      // Add empty slots if row has less than 5 books
      for (let i = books.length; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'book-slot empty';
        rowContainer.appendChild(slot);
      }
    }
    
    // Add right bookend if decoration exists (only on first row)
    if (rowIndex === 0) {
      const rightDecor = settings.decorations && settings.decorations.find(d => {
        if (typeof d === 'string') return settings.decorations.indexOf(d) === 1 || (settings.decorations.length === 1 && settings.decorations.indexOf(d) === 0);
        return d.position === 'right' || (!d.position && settings.decorations.indexOf(d) === 1);
      }) || (settings.decorations && settings.decorations.length === 1 && typeof settings.decorations[0] === 'string' ? settings.decorations[0] : null);
      
      if (rightDecor) {
        const rightBookend = renderBookend(rightDecor, settings, 'right');
        if (rightBookend) {
          rowContainer.appendChild(rightBookend);
        }
      } else {
        // Empty space for alignment if no bookend
        const spacer = document.createElement('div');
        spacer.className = 'bookend-spacer';
        rowContainer.appendChild(spacer);
      }
    }
    
    bookShelf.appendChild(rowContainer);
  });
  
  // Sync with legacy myShelf for backward compatibility (flatten all books)
  const allBooks = rows.flatMap(row => row.books || []);
  localStorage.setItem('myShelf', JSON.stringify(allBooks));
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
    'gem': 'gem',
    'book': 'book',
    'fire': 'fire',
    'music': 'music',
    'tree': 'tree',
    'cat': 'cat',
    'dragon': 'dragon',
    'feather': 'feather',
    'magic': 'magic'
  };
  return iconMap[decor] || 'book';
}

// Render bookend based on decoration type
function renderBookend(decor, settings, position) {
  if (!decor) return null;
  
  const bookend = document.createElement('div');
  bookend.className = `bookend bookend-${position}`;
  
  // Apply background settings
  const bgSettings = settings.bookendBackground || { show: true, color: '#654321', opacity: 1 };
  if (bgSettings.show) {
    bookend.style.backgroundColor = bgSettings.color || '#654321';
    bookend.style.opacity = bgSettings.opacity || 1;
  } else {
    bookend.style.backgroundColor = 'transparent';
  }
  
  // Render based on type
  if (typeof decor === 'string') {
    // Legacy format - icon
    bookend.innerHTML = `<i class="fas fa-${getDecorationIcon(decor)}"></i>`;
  } else if (decor.type === 'icon') {
    bookend.innerHTML = `<i class="fas fa-${getDecorationIcon(decor.value)}"></i>`;
  } else if (decor.type === 'image' && decor.value) {
    bookend.innerHTML = `<img src="${decor.value}" alt="Bookend" style="width: 100%; height: 100%; object-fit: contain;">`;
  } else if (decor.type === 'text' && decor.value) {
    bookend.innerHTML = `<span style="font-size: 2rem; font-weight: 700;">${decor.value}</span>`;
  } else if (decor.type === 'shape' && decor.value) {
    const shapeClass = `shape-${decor.value}`;
    bookend.classList.add(shapeClass);
    bookend.innerHTML = ''; // Shape is rendered via CSS
  }
  
  return bookend;
}

// Remove book from current shelf (row-based)
function removeBookFromShelf(rowIndex, bookIndex) {
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  
  if (!currentShelfId || shelves.length === 0) return;
  
  const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
  if (shelfIndex === -1) return;
  
  const currentShelf = migrateShelfToRows(shelves[shelfIndex]);
  const rows = currentShelf.rows || [];
  
  if (rowIndex >= 0 && rowIndex < rows.length) {
    const row = rows[rowIndex];
    const books = row.books || [];
    
    if (bookIndex >= 0 && bookIndex < books.length) {
      const bookTitle = books[bookIndex].title;
      if (confirm(`Remove "${bookTitle}" from "${currentShelf.name}"?`)) {
        books.splice(bookIndex, 1);
        row.books = books;
        
        // Remove empty rows (except if it's the last row)
        if (books.length === 0 && rows.length > 1) {
          rows.splice(rowIndex, 1);
        }
        
        currentShelf.rows = rows;
        
        // Sync books array for backward compatibility
        const allBooks = rows.flatMap(r => r.books || []);
        currentShelf.books = allBooks;
        
        shelves[shelfIndex] = currentShelf;
        localStorage.setItem('shelves', JSON.stringify(shelves));
        
        // Sync with legacy myShelf
        localStorage.setItem('myShelf', JSON.stringify(allBooks));
        
        // Reload display
        displayBooks();
      }
    }
  }
}

// Delete an empty row from current shelf
function deleteRow(rowIndex) {
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  
  if (!currentShelfId || shelves.length === 0) {
    alert('No shelf selected');
    return;
  }
  
  const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
  if (shelfIndex === -1) {
    alert('Shelf not found');
    return;
  }
  
  const currentShelf = migrateShelfToRows(shelves[shelfIndex]);
  const rows = currentShelf.rows || [];
  
  if (rowIndex < 0 || rowIndex >= rows.length) {
    alert('Invalid row index');
    return;
  }
  
  const row = rows[rowIndex];
  const books = row.books || [];
  
  // Only allow deletion of empty rows
  if (books.length > 0) {
    alert('Cannot delete a row that contains books. Please remove all books first.');
    return;
  }
  
  // Don't allow deletion if it's the last row
  if (rowIndex === rows.length - 1 && rows.length === 1) {
    alert('Cannot delete the last row. A shelf must have at least one row.');
    return;
  }
  
  // Remove the row
  rows.splice(rowIndex, 1);
  currentShelf.rows = rows;
  
  // Sync books array for backward compatibility
  const allBooks = rows.flatMap(r => r.books || []);
  currentShelf.books = allBooks;
  
  shelves[shelfIndex] = currentShelf;
  localStorage.setItem('shelves', JSON.stringify(shelves));
  
  // Sync with legacy myShelf
  localStorage.setItem('myShelf', JSON.stringify(allBooks));
  
  // Reload display
  displayBooks();
}

// Add new row to current shelf
function addRowToShelf() {
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  
  if (!currentShelfId || shelves.length === 0) {
    alert('No shelf selected');
    return;
  }
  
  const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
  if (shelfIndex === -1) {
    alert('Shelf not found');
    return;
  }
  
  const currentShelf = migrateShelfToRows(shelves[shelfIndex]);
  const rows = currentShelf.rows || [];
  
  // Check max rows limit
  if (rows.length >= 10) {
    alert('Maximum of 10 rows allowed per shelf (5 books per row)');
    return;
  }
  
  // Add new empty row
  const newRowId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
  rows.push({
    id: newRowId,
    books: []
  });
  
  currentShelf.rows = rows;
  shelves[shelfIndex] = currentShelf;
  localStorage.setItem('shelves', JSON.stringify(shelves));
  
  // Reload display
  displayBooks();
}

// Show modal to choose between adding a row or adding a book
function showAddRowOrBookModal() {
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  
  if (!currentShelfId || shelves.length === 0) {
    window.location.href = 'home.html';
    return;
  }
  
  const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
  if (shelfIndex === -1) {
    window.location.href = 'home.html';
    return;
  }
  
  const currentShelf = migrateShelfToRows(shelves[shelfIndex]);
  const rows = currentShelf.rows || [];
  const canAddRow = rows.length < 10;
  
  // Create modal
  const modalOverlay = document.createElement('div');
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background-color: #181818;
    border: 2px solid #333;
    border-radius: 12px;
    padding: 30px;
    max-width: 400px;
    width: 90%;
  `;
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Add to Shelf';
  modalTitle.style.cssText = `
    color: #fff;
    margin: 0 0 20px 0;
    font-size: 1.8rem;
    font-weight: 700;
  `;
  modalContent.appendChild(modalTitle);
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 15px;
  `;
  
  // Add Book button
  const addBookBtn = document.createElement('button');
  addBookBtn.textContent = 'Add Book from Library';
  addBookBtn.style.cssText = `
    padding: 15px 20px;
    background-color: #e50914;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
  `;
  addBookBtn.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
    window.location.href = 'home.html';
  });
  addBookBtn.addEventListener('mouseenter', () => {
    addBookBtn.style.backgroundColor = '#f40612';
  });
  addBookBtn.addEventListener('mouseleave', () => {
    addBookBtn.style.backgroundColor = '#e50914';
  });
  buttonContainer.appendChild(addBookBtn);
  
  // Add Row button
  const addRowBtn = document.createElement('button');
  addRowBtn.textContent = canAddRow ? `Add New Row (${rows.length}/10, 5 books/row)` : 'Maximum Rows Reached';
  addRowBtn.style.cssText = `
    padding: 15px 20px;
    background-color: ${canAddRow ? '#2a2a2a' : '#1a1a1a'};
    color: ${canAddRow ? '#fff' : '#666'};
    border: 2px solid ${canAddRow ? '#444' : '#333'};
    border-radius: 8px;
    cursor: ${canAddRow ? 'pointer' : 'not-allowed'};
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
  `;
  if (canAddRow) {
    addRowBtn.addEventListener('click', () => {
      document.body.removeChild(modalOverlay);
      addRowToShelf();
    });
    addRowBtn.addEventListener('mouseenter', () => {
      addRowBtn.style.borderColor = '#e50914';
      addRowBtn.style.backgroundColor = '#333';
    });
    addRowBtn.addEventListener('mouseleave', () => {
      addRowBtn.style.borderColor = '#444';
      addRowBtn.style.backgroundColor = '#2a2a2a';
    });
  }
  buttonContainer.appendChild(addRowBtn);
  
  // Cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `
    padding: 12px 20px;
    background-color: #2a2a2a;
    color: #ccc;
    border: 2px solid #444;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-top: 10px;
  `;
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.backgroundColor = '#333';
    cancelBtn.style.borderColor = '#666';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.backgroundColor = '#2a2a2a';
    cancelBtn.style.borderColor = '#444';
  });
  buttonContainer.appendChild(cancelBtn);
  
  modalContent.appendChild(buttonContainer);
  modalOverlay.appendChild(modalContent);
  
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      document.body.removeChild(modalOverlay);
    }
  });
  
  document.body.appendChild(modalOverlay);
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
      rows: [{
        id: 1,
        books: []
      }],
      settings: {
        background: "#141414",
        backgroundType: "color",
        backgroundImage: null,
        backgroundGradient: null,
        texture: "none",
        color: "#8B4513",
        decorations: [],
        bookendBackground: {
          show: true,
          color: "#654321",
          opacity: 1
        }
      }
    }];
    localStorage.setItem('shelves', JSON.stringify(shelves));
    localStorage.setItem('currentShelfId', '1');
  } else {
    // Migrate all shelves to row-based structure
    shelves = shelves.map(shelf => migrateShelfToRows(shelf));
    localStorage.setItem('shelves', JSON.stringify(shelves));
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
window.showAddRowOrBookModal = showAddRowOrBookModal;
window.addRowToShelf = addRowToShelf;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShelf);
} else {
  initShelf();
}

