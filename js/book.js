// Get selected book from localStorage
const book = JSON.parse(localStorage.getItem('selectedBook'));

// If there's a book, display it
if (book) {
  document.getElementById('bookTitle').textContent = book.title;
  document.getElementById('bookImage').src = book.img || book.image || '';
  document.getElementById('bookAuthor').textContent = `Author: ${book.author || 'Unknown'}`;
  document.getElementById('bookGenre').textContent = `Genre: ${book.genre || 'Unspecified'}`;
  document.getElementById('bookDescription').textContent =
    book.description ||
    "A captivating story that draws you into its world. This book keeps you thinking long after the final page.";
  
  // Display which shelves the book is in
  displayBookShelves();
} else {
  document.querySelector('.book-detail-container').innerHTML = `
    <p style="text-align:center; font-size:1.5rem; margin-top:100px;">
      No book selected. Please return to <a href="home.html" style="color:#a00;">Home</a>.
    </p>
  `;
}

// Display which shelves the book is currently in
function displayBookShelves() {
  const bookInfo = document.querySelector('.book-info');
  if (!bookInfo || !book) return;
  
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const shelvesWithBook = shelves.filter(shelf => {
    const books = shelf.books || [];
    return books.some(b => b.title === book.title);
  });
  
  // Check if shelves display already exists
  let shelvesDisplay = document.getElementById('book-shelves-display');
  if (!shelvesDisplay) {
    shelvesDisplay = document.createElement('div');
    shelvesDisplay.id = 'book-shelves-display';
    shelvesDisplay.style.marginTop = '20px';
    shelvesDisplay.style.padding = '15px';
    shelvesDisplay.style.backgroundColor = '#181818';
    shelvesDisplay.style.borderRadius = '8px';
    shelvesDisplay.style.border = '1px solid #333';
    
    const shelvesTitle = document.createElement('p');
    shelvesTitle.style.margin = '0 0 10px 0';
    shelvesTitle.style.color = '#fff';
    shelvesTitle.style.fontWeight = '600';
    shelvesTitle.textContent = 'On Shelves:';
    shelvesDisplay.appendChild(shelvesTitle);
    
    const shelvesList = document.createElement('div');
    shelvesList.id = 'book-shelves-list';
    shelvesList.style.display = 'flex';
    shelvesList.style.flexWrap = 'wrap';
    shelvesList.style.gap = '8px';
    shelvesDisplay.appendChild(shelvesList);
    
    // Insert before the add button
    const addButton = document.querySelector('.add-shelf-btn');
    if (addButton) {
      bookInfo.insertBefore(shelvesDisplay, addButton);
    } else {
      bookInfo.appendChild(shelvesDisplay);
    }
  }
  
  const shelvesList = document.getElementById('book-shelves-list');
  shelvesList.innerHTML = '';
  
  if (shelvesWithBook.length === 0) {
    const noShelves = document.createElement('span');
    noShelves.style.color = '#999';
    noShelves.style.fontSize = '0.9rem';
    noShelves.textContent = 'Not on any shelf';
    shelvesList.appendChild(noShelves);
  } else {
    shelvesWithBook.forEach(shelf => {
      const shelfBadge = document.createElement('span');
      shelfBadge.style.display = 'inline-block';
      shelfBadge.style.padding = '6px 12px';
      shelfBadge.style.backgroundColor = '#e50914';
      shelfBadge.style.color = '#fff';
      shelfBadge.style.borderRadius = '20px';
      shelfBadge.style.fontSize = '0.9rem';
      shelfBadge.style.fontWeight = '500';
      shelfBadge.textContent = shelf.name;
      shelvesList.appendChild(shelfBadge);
    });
  }
}

// Create and show shelf selection modal
function showShelfSelectionModal() {
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  
  // If only one shelf, add directly without modal
  if (shelves.length <= 1) {
    addBookToShelf(shelves[0]?.id || 1);
    return;
  }
  
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'shelf-selection-modal';
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
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background-color: #181818;
    border: 2px solid #333;
    border-radius: 12px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  `;
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Select Shelf';
  modalTitle.style.cssText = `
    color: #fff;
    margin: 0 0 20px 0;
    font-size: 1.8rem;
    font-weight: 700;
  `;
  modalContent.appendChild(modalTitle);
  
  const shelvesList = document.createElement('div');
  shelvesList.id = 'modal-shelves-list';
  shelvesList.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  `;
  
  shelves.forEach(shelf => {
    const shelfItem = document.createElement('button');
    shelfItem.textContent = shelf.name;
    shelfItem.style.cssText = `
      padding: 15px 20px;
      background-color: #2a2a2a;
      color: #fff;
      border: 2px solid #444;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      text-align: left;
      transition: all 0.3s ease;
    `;
    
    shelfItem.addEventListener('mouseenter', () => {
      shelfItem.style.borderColor = '#e50914';
      shelfItem.style.backgroundColor = '#333';
    });
    
    shelfItem.addEventListener('mouseleave', () => {
      shelfItem.style.borderColor = '#444';
      shelfItem.style.backgroundColor = '#2a2a2a';
    });
    
    shelfItem.addEventListener('click', () => {
      addBookToShelf(shelf.id);
      document.body.removeChild(modalOverlay);
    });
    
    shelvesList.appendChild(shelfItem);
  });
  
  modalContent.appendChild(shelvesList);
  
  // Cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `
    width: 100%;
    padding: 12px;
    background-color: #2a2a2a;
    color: #ccc;
    border: 2px solid #444;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
  `;
  
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.backgroundColor = '#333';
    cancelBtn.style.borderColor = '#666';
  });
  
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.backgroundColor = '#2a2a2a';
    cancelBtn.style.borderColor = '#444';
  });
  
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  modalContent.appendChild(cancelBtn);
  modalOverlay.appendChild(modalContent);
  
  // Close on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      document.body.removeChild(modalOverlay);
    }
  });
  
  document.body.appendChild(modalOverlay);
}

// Migrate shelf to row-based structure (helper function, same as in shelf.js)
function migrateShelfToRows(shelf) {
  if (shelf.rows && Array.isArray(shelf.rows)) {
    return shelf;
  }
  
  const books = shelf.books || [];
  const rows = [];
  const booksPerRow = 5;
  
  for (let i = 0; i < books.length; i += booksPerRow) {
    rows.push({
      id: rows.length + 1,
      books: books.slice(i, i + booksPerRow)
    });
  }
  
  if (rows.length === 0) {
    rows.push({
      id: 1,
      books: []
    });
  }
  
  shelf.rows = rows;
  return shelf;
}

// Add book to a specific shelf (row-based)
function addBookToShelf(shelfId) {
  if (!book) {
    alert('No book selected');
    return;
  }
  
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
    shelfId = 1;
  }
  
  const shelfIndex = shelves.findIndex(s => s.id === shelfId);
  if (shelfIndex === -1) {
    alert('Shelf not found');
    return;
  }
  
  // Migrate shelf if needed
  shelves[shelfIndex] = migrateShelfToRows(shelves[shelfIndex]);
  const shelf = shelves[shelfIndex];
  const rows = shelf.rows || [];
  
  // Flatten all books to check for duplicates
  const allBooks = rows.flatMap(row => row.books || []);
  const existingBook = allBooks.find(b => b.title === book.title);
  if (existingBook) {
    alert(`${book.title} is already on "${shelf.name}"!`);
    return;
  }
  
  // Find first row with space (less than 5 books)
  let targetRow = rows.find(row => (row.books || []).length < 5);
  
  // If no row has space, create a new row (if under max)
  if (!targetRow) {
    if (rows.length >= 10) {
      alert(`Cannot add more books. Maximum of 10 rows with 5 books each (50 total) reached.`);
      return;
    }
    
    const newRowId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    targetRow = {
      id: newRowId,
      books: []
    };
    rows.push(targetRow);
  }
  
  // Add book to target row
  targetRow.books.push(book);
  shelf.rows = rows;
  
  // Sync books array for backward compatibility
  const updatedAllBooks = rows.flatMap(row => row.books || []);
  shelf.books = updatedAllBooks;
  
  shelves[shelfIndex] = shelf;
  localStorage.setItem('shelves', JSON.stringify(shelves));
  
  // Sync with legacy myShelf if this is the current shelf
  const currentShelfId = localStorage.getItem('currentShelfId');
  if (currentShelfId && currentShelfId.toString() === shelfId.toString()) {
    localStorage.setItem('myShelf', JSON.stringify(updatedAllBooks));
  }
  
  // Show confirmation
  alert(`${book.title} has been added to "${shelf.name}"!`);
  
  // Update shelves display
  displayBookShelves();
}

// Functional "Add to MyShelf" button
document.querySelector('.add-shelf-btn').addEventListener('click', () => {
  if (!book) {
    alert('No book selected');
    return;
  }
  
  showShelfSelectionModal();
});
