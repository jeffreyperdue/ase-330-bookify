// Get selected book from localStorage
let book = JSON.parse(localStorage.getItem('selectedBook'));

// If book doesn't have author/genre, try to fetch from Google Books API
async function enrichBookData(book) {
  if (book.id && (!book.author || book.author === 'Unknown' || !book.genre || book.genre === 'Unspecified')) {
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${book.id}`);
      const data = await response.json();
      if (data.volumeInfo) {
        const authors = data.volumeInfo.authors || [];
        const categories = data.volumeInfo.categories || [];
        book.author = authors.length > 0 ? authors[0] : "Unknown";
        book.genre = categories.length > 0 ? categories[0] : "Unspecified";
        book.authors = authors;
        book.categories = categories;
        book.pageCount = data.volumeInfo.pageCount || book.pageCount || null;
        if (!book.description && data.volumeInfo.description) {
          book.description = data.volumeInfo.description;
        }
        // Update localStorage with enriched data
        localStorage.setItem('selectedBook', JSON.stringify(book));
      }
    } catch (err) {
      console.error('Error enriching book data:', err);
    }
  }
  return book;
}

// If there's a book, display it
if (book) {
  // Enrich book data if needed
  enrichBookData(book).then(enrichedBook => {
    book = enrichedBook;
    displayBook();
  });
} else {
  document.querySelector('.book-detail-container').innerHTML = `
    <p style="text-align:center; font-size:1.5rem; margin-top:100px;">
      No book selected. Please return to <a href="home.html" style="color:#a00;">Home</a>.
    </p>
  `;
}

function displayBook() {
  document.getElementById('bookTitle').textContent = book.title;
  document.getElementById('bookImage').src = book.img || book.image || '';
  document.getElementById('bookAuthor').textContent = `Author: ${book.author || 'Unknown'}`;
  document.getElementById('bookGenre').textContent = `Genre: ${book.genre || 'Unspecified'}`;
  document.getElementById('bookDescription').textContent =
    book.description ||
    "A captivating story that draws you into its world. This book keeps you thinking long after the final page.";
  
  // Display which shelves the book is in
  displayBookShelves();
  
  // Initialize tabs
  initializeTabs();
  
  // Initialize star rating system
  initializeStarRating();
  
  // Initialize review system
  initializeReviewSystem();
  
  // Load user-specific data (rating, review, notes, finished date)
  loadUserBookData();
}

// Display which shelves the book is currently in
function displayBookShelves() {
  if (!book) return;
  
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const shelvesWithBook = shelves.filter(shelf => {
    const books = shelf.books || [];
    return books.some(b => b.title === book.title);
  });
  
  // Get or create shelves display
  let shelvesDisplay = document.getElementById('book-shelves-display');
  if (!shelvesDisplay) {
    shelvesDisplay = document.createElement('div');
    shelvesDisplay.id = 'book-shelves-display';
    shelvesDisplay.className = 'book-shelves-display';
    
    const shelvesTitle = document.createElement('p');
    shelvesTitle.textContent = 'On Shelves:';
    shelvesTitle.style.margin = '0 0 10px 0';
    shelvesTitle.style.color = '#fff';
    shelvesTitle.style.fontWeight = '600';
    shelvesDisplay.appendChild(shelvesTitle);
    
    const shelvesList = document.createElement('div');
    shelvesList.id = 'book-shelves-list';
    shelvesList.style.display = 'flex';
    shelvesList.style.flexWrap = 'wrap';
    shelvesList.style.gap = '8px';
    shelvesDisplay.appendChild(shelvesList);
    
    // Insert after the add button
    const addButton = document.querySelector('.add-shelf-btn');
    if (addButton && addButton.parentNode) {
      addButton.parentNode.insertBefore(shelvesDisplay, addButton.nextSibling);
    }
  }
  
  const shelvesList = document.getElementById('book-shelves-list');
  if (!shelvesList) return;
  
  shelvesList.innerHTML = '';
  
  if (shelvesWithBook.length === 0) {
    shelvesDisplay.style.display = 'none';
  } else {
    shelvesDisplay.style.display = 'block';
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

// ========== USER BOOK DATA MANAGEMENT ==========

// Get user-specific book data key
function getUserBookDataKey() {
  const userId = localStorage.getItem('currentUser') || 'default';
  const bookId = book?.id || book?.title || 'unknown';
  return `bookData_${userId}_${bookId}`;
}

// Load user-specific book data (rating, review, notes, finished date)
function loadUserBookData() {
  if (!book) return;
  
  const dataKey = getUserBookDataKey();
  const userData = JSON.parse(localStorage.getItem(dataKey)) || {};
  
  // Load rating
  if (userData.rating !== undefined) {
    currentSavedRating = userData.rating;
    setRating(userData.rating, false); // false = don't save (already loaded)
  }
  
  // Load review
  if (userData.review) {
    showReviewDisplay(userData.review);
  } else {
    showReviewEdit();
  }
  
  // Load finished date
  if (userData.finishedDate) {
    document.getElementById('finishedCheckbox').checked = true;
    document.getElementById('finishedDateContainer').style.display = 'block';
    document.getElementById('finishedDate').value = userData.finishedDate;
    document.getElementById('finishedDateDisplay').textContent = `Finished on: ${new Date(userData.finishedDate).toLocaleDateString()}`;
  }
  
  // Load notes
  if (userData.notes && Array.isArray(userData.notes)) {
    renderNotes(userData.notes);
  } else {
    renderNotes([]);
  }
}

// Save user-specific book data
function saveUserBookData() {
  if (!book) return;
  
  const dataKey = getUserBookDataKey();
  const currentData = JSON.parse(localStorage.getItem(dataKey)) || {};
  
  // Get current values
  const rating = parseFloat(document.getElementById('ratingValue').dataset.rating || 0);
  const review = document.getElementById('bookReview').value;
  const finishedDate = document.getElementById('finishedCheckbox').checked 
    ? document.getElementById('finishedDate').value 
    : null;
  const notes = JSON.parse(document.getElementById('notesList').dataset.notes || '[]');
  
  const userData = {
    ...currentData,
    rating: rating > 0 ? rating : undefined,
    review: review || undefined,
    finishedDate: finishedDate || undefined,
    notes: notes.length > 0 ? notes : undefined
  };
  
  // Remove undefined values
  Object.keys(userData).forEach(key => {
    if (userData[key] === undefined) {
      delete userData[key];
    }
  });
  
  localStorage.setItem(dataKey, JSON.stringify(userData));
}

// ========== TAB SYSTEM ==========

function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      // Remove active class from all buttons and panels
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));
      
      // Add active class to clicked button and corresponding panel
      button.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
}

// ========== STAR RATING SYSTEM (5 stars with half-star support) ==========

let currentSavedRating = 0;
let hoverRating = 0;

function setRating(rating, save = true) {
  const stars = document.querySelectorAll('.star');
  const ratingValue = document.getElementById('ratingValue');
  
  if (!stars || stars.length === 0) return;
  
  // Clear all states
  stars.forEach(star => {
    star.classList.remove('active', 'half');
    star.textContent = '☆';
    star.style.color = '#666';
  });
  
  // Set active stars based on rating
  stars.forEach(star => {
    const halfRating = parseFloat(star.dataset.half);
    const fullRating = parseFloat(star.dataset.full);
    
    if (rating >= fullRating) {
      // Full star - completely filled
      star.classList.add('active');
      star.textContent = '★';
      star.style.color = '#ffd700';
    } else if (rating >= halfRating) {
      // Half star - keep empty star visible, pseudo-elements will overlay
      star.classList.add('half');
      star.textContent = '☆';
      star.style.color = 'transparent';
    }
  });
  
  // Update rating text
  if (rating > 0) {
    ratingValue.textContent = `${rating} / 5.0 stars`;
    ratingValue.dataset.rating = rating;
    if (save) {
      currentSavedRating = rating;
    }
  } else {
    ratingValue.textContent = 'Not rated';
    ratingValue.dataset.rating = '0';
    if (save) {
      currentSavedRating = 0;
    }
  }
  
  if (save) {
    saveUserBookData();
  }
}

// Initialize star rating after DOM is ready
function initializeStarRating() {
  const stars = document.querySelectorAll('.star');
  const starRatingContainer = document.getElementById('starRating');
  
  if (!stars || stars.length === 0) return;
  
  stars.forEach(star => {
    // Click handler - determine if left or right half was clicked
    star.addEventListener('click', (e) => {
      const rect = star.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const starWidth = rect.width;
      const halfRating = parseFloat(star.dataset.half);
      const fullRating = parseFloat(star.dataset.full);
      const starNum = parseInt(star.dataset.star);
      
      let selectedRating;
      if (clickX < starWidth / 2) {
        // Left half - half star
        selectedRating = halfRating;
      } else {
        // Right half - full star
        selectedRating = fullRating;
      }
      
      setRating(selectedRating, true);
    });
    
    // Hover handler - preview rating
    star.addEventListener('mousemove', (e) => {
      const rect = star.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const starWidth = rect.width;
      const halfRating = parseFloat(star.dataset.half);
      const fullRating = parseFloat(star.dataset.full);
      const starNum = parseInt(star.dataset.star);
      
      // Determine hover rating based on mouse position
      let previewRating;
      if (mouseX < starWidth / 2) {
        previewRating = halfRating;
      } else {
        previewRating = fullRating;
      }
      
      // All previous stars should be full
      stars.forEach(s => {
        const sNum = parseInt(s.dataset.star);
        const sFull = parseFloat(s.dataset.full);
        if (sNum < starNum) {
          previewRating = Math.max(previewRating, sFull);
        }
      });
      
      hoverRating = previewRating;
      setRating(hoverRating, false);
    });
  });
  
  // Reset on mouse leave
  if (starRatingContainer) {
    starRatingContainer.addEventListener('mouseleave', () => {
      setRating(currentSavedRating, false);
      hoverRating = 0;
    });
  }
}

// ========== REVIEW SYSTEM ==========

function showReviewDisplay(reviewText) {
  const reviewDisplay = document.getElementById('reviewDisplay');
  const reviewEdit = document.getElementById('reviewEdit');
  const reviewTextEl = document.getElementById('reviewText');
  const editBtn = document.getElementById('editReviewBtn');
  
  if (reviewDisplay && reviewEdit && reviewTextEl) {
    reviewTextEl.textContent = reviewText;
    reviewDisplay.style.display = 'block';
    reviewEdit.style.display = 'none';
    if (editBtn) editBtn.style.display = 'block';
  }
}

function showReviewEdit() {
  const reviewDisplay = document.getElementById('reviewDisplay');
  const reviewEdit = document.getElementById('reviewEdit');
  const editBtn = document.getElementById('editReviewBtn');
  const cancelBtn = document.getElementById('cancelReviewBtn');
  const dataKey = getUserBookDataKey();
  const userData = JSON.parse(localStorage.getItem(dataKey)) || {};
  
  if (reviewDisplay && reviewEdit) {
    reviewDisplay.style.display = 'none';
    reviewEdit.style.display = 'block';
    if (editBtn) editBtn.style.display = 'none';
    // Show cancel button only if there's an existing review
    if (cancelBtn) {
      cancelBtn.style.display = userData.review ? 'inline-block' : 'none';
    }
    // Load existing review or clear
    if (userData.review) {
      document.getElementById('bookReview').value = userData.review;
    } else {
      document.getElementById('bookReview').value = '';
    }
    document.getElementById('bookReview').focus();
  }
}

// Initialize review system
function initializeReviewSystem() {
  const saveBtn = document.getElementById('saveReviewBtn');
  const editBtn = document.getElementById('editReviewBtn');
  const cancelBtn = document.getElementById('cancelReviewBtn');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const reviewText = document.getElementById('bookReview').value.trim();
      if (reviewText) {
        saveUserBookData();
        showReviewDisplay(reviewText);
        alert('Review saved!');
      } else {
        alert('Please enter a review before saving.');
      }
    });
  }
  
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      showReviewEdit();
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      const dataKey = getUserBookDataKey();
      const userData = JSON.parse(localStorage.getItem(dataKey)) || {};
      if (userData.review) {
        showReviewDisplay(userData.review);
      } else {
        document.getElementById('bookReview').value = '';
        cancelBtn.style.display = 'none';
      }
    });
  }
}

// ========== FINISHED DATE SYSTEM ==========

document.getElementById('finishedCheckbox').addEventListener('change', (e) => {
  const container = document.getElementById('finishedDateContainer');
  const display = document.getElementById('finishedDateDisplay');
  
  if (e.target.checked) {
    container.style.display = 'block';
    // Set default to today
    if (!document.getElementById('finishedDate').value) {
      document.getElementById('finishedDate').value = new Date().toISOString().split('T')[0];
    }
  } else {
    container.style.display = 'none';
    display.textContent = '';
    document.getElementById('finishedDate').value = '';
    saveUserBookData();
  }
});

document.getElementById('saveFinishedBtn').addEventListener('click', () => {
  const date = document.getElementById('finishedDate').value;
  if (date) {
    document.getElementById('finishedDateDisplay').textContent = `Finished on: ${new Date(date).toLocaleDateString()}`;
    saveUserBookData();
    alert('Finished date saved!');
  } else {
    alert('Please select a date');
  }
});

// ========== PAGE NOTES SYSTEM ==========

function renderNotes(notes) {
  const notesList = document.getElementById('notesList');
  if (!notesList) return;
  
  notesList.innerHTML = '';
  notesList.dataset.notes = JSON.stringify(notes);
  
  if (!notes || notes.length === 0) {
    notesList.innerHTML = '<p style="color: #999; font-style: italic;">No notes yet. Add your first note above!</p>';
    return;
  }
  
  // Sort notes by page number
  const sortedNotes = [...notes].sort((a, b) => a.page - b.page);
  
  sortedNotes.forEach((note, displayIndex) => {
    // Find original index in unsorted array
    const originalIndex = notes.findIndex(n => n.page === note.page && n.text === note.text && n.date === note.date);
    const noteIndex = originalIndex >= 0 ? originalIndex : displayIndex;
    
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.innerHTML = `
      <div class="note-item-header">
        <span class="note-page-number">Page ${note.page}</span>
        <button class="delete-note-btn" data-index="${noteIndex}" title="Delete note">×</button>
      </div>
      <div class="note-content">${note.text}</div>
    `;
    
    // Delete button handler
    noteItem.querySelector('.delete-note-btn').addEventListener('click', () => {
      deleteNote(noteIndex);
    });
    
    notesList.appendChild(noteItem);
  });
}

function deleteNote(index) {
  const notesList = document.getElementById('notesList');
  if (!notesList) return;
  
  const notes = JSON.parse(notesList.dataset.notes || '[]');
  if (index >= 0 && index < notes.length) {
    notes.splice(index, 1);
    renderNotes(notes);
    saveUserBookData();
  }
}

document.getElementById('addNoteBtn').addEventListener('click', () => {
  const pageNumber = parseInt(document.getElementById('notePageNumber').value);
  const noteText = document.getElementById('noteText').value.trim();
  
  if (!pageNumber || pageNumber < 1) {
    alert('Please enter a valid page number');
    return;
  }
  
  if (!noteText) {
    alert('Please enter a note');
    return;
  }
  
  const notesList = document.getElementById('notesList');
  const notes = JSON.parse(notesList.dataset.notes || '[]');
  
  notes.push({
    page: pageNumber,
    text: noteText,
    date: new Date().toISOString()
  });
  
  renderNotes(notes);
  saveUserBookData();
  
  // Clear inputs
  document.getElementById('notePageNumber').value = '';
  document.getElementById('noteText').value = '';
  
  alert('Note added!');
});
