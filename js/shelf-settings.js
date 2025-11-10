// Shelf Settings JavaScript

// Load settings from localStorage
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('shelfSettings')) || {
    background: "#141414",
    texture: "none",
    color: "#8B4513",
    decorations: []
  };

  // Set background color picker
  const bgPicker = document.getElementById('bg-picker');
  if (bgPicker) {
    bgPicker.value = settings.background;
  }

  // Set shelf color picker
  const shelfColorPicker = document.getElementById('shelf-color-picker');
  if (shelfColorPicker) {
    shelfColorPicker.value = settings.color;
  }

  // Set active texture
  document.querySelectorAll('.texture-option').forEach(option => {
    option.classList.remove('active');
    if (option.dataset.texture === settings.texture) {
      option.classList.add('active');
    }
  });

  // Set selected decorations
  document.querySelectorAll('.decoration-item').forEach(item => {
    item.classList.remove('selected');
    if (settings.decorations && settings.decorations.includes(item.dataset.decor)) {
      item.classList.add('selected');
    }
  });

  // Apply settings to preview
  updatePreview();

  return settings;
}

// Save settings to localStorage
function saveSettings() {
  const settings = {
    background: document.getElementById('bg-picker').value,
    texture: document.querySelector('.texture-option.active')?.dataset.texture || 'none',
    color: document.getElementById('shelf-color-picker').value,
    decorations: Array.from(document.querySelectorAll('.decoration-item.selected'))
      .map(item => item.dataset.decor)
  };

  localStorage.setItem('shelfSettings', JSON.stringify(settings));
  return settings;
}

// Update preview with current settings
function updatePreview() {
  const settings = {
    background: document.getElementById('bg-picker').value,
    texture: document.querySelector('.texture-option.active')?.dataset.texture || 'none',
    color: document.getElementById('shelf-color-picker').value,
    decorations: Array.from(document.querySelectorAll('.decoration-item.selected'))
      .map(item => item.dataset.decor)
  };

  const preview = document.getElementById('shelf-preview');
  if (!preview) return;

  // Apply background color to preview area only (not the page body)
  preview.style.backgroundColor = settings.background;

  // Apply shelf color
  preview.style.borderTopColor = settings.color;
  
  // Apply texture to preview if needed
  preview.classList.remove('texture-wood', 'texture-glass', 'texture-stone');
  if (settings.texture && settings.texture !== 'none') {
    preview.classList.add(`texture-${settings.texture}`);
  }

  // Load books for preview
  const myShelf = JSON.parse(localStorage.getItem('myShelf')) || [];
  preview.innerHTML = '';

  if (myShelf.length === 0) {
    // Show empty preview slots
    for (let i = 0; i < 3; i++) {
      const bookDiv = document.createElement('div');
      bookDiv.className = 'preview-book';
      bookDiv.style.background = '#444';
      preview.appendChild(bookDiv);
    }
  } else {
    // Show first 3-4 books in preview
    myShelf.slice(0, 4).forEach(book => {
      const bookDiv = document.createElement('div');
      bookDiv.className = 'preview-book';
      
      const img = document.createElement('img');
      img.src = book.img || book.image || '';
      img.alt = book.title || '';
      
      bookDiv.appendChild(img);
      preview.appendChild(bookDiv);
    });
  }
}

// Load and display slotted books
function loadSlottedBooks() {
  const slottedBooksList = document.getElementById('slotted-books-list');
  if (!slottedBooksList) return;

  const myShelf = JSON.parse(localStorage.getItem('myShelf')) || [];
  
  slottedBooksList.innerHTML = '';

  if (myShelf.length === 0) {
    slottedBooksList.innerHTML = '<p style="color: #ccc;">No books on your shelf yet.</p>';
    return;
  }

  myShelf.forEach((book, index) => {
    const bookItem = document.createElement('div');
    bookItem.className = 'slotted-book-item';
    
    const img = document.createElement('img');
    img.src = book.img || book.image || '';
    img.alt = book.title || '';
    img.title = book.title || '';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.setAttribute('aria-label', `Remove ${book.title}`);
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeBookFromShelf(index);
    });
    
    bookItem.appendChild(img);
    bookItem.appendChild(removeBtn);
    
    // Click to view book
    bookItem.addEventListener('click', () => {
      localStorage.setItem('selectedBook', JSON.stringify(book));
      window.location.href = 'book.html';
    });
    
    slottedBooksList.appendChild(bookItem);
  });
}

// Remove book from shelf
function removeBookFromShelf(index) {
  const myShelf = JSON.parse(localStorage.getItem('myShelf')) || [];
  
  if (index >= 0 && index < myShelf.length) {
    const bookTitle = myShelf[index].title;
    if (confirm(`Remove "${bookTitle}" from your shelf?`)) {
      myShelf.splice(index, 1);
      localStorage.setItem('myShelf', JSON.stringify(myShelf));
      
      // Reload slotted books and preview
      loadSlottedBooks();
      updatePreview();
    }
  }
}

// Initialize settings page
function initSettings() {
  // Load existing settings
  const settings = loadSettings();

  // Load slotted books
  loadSlottedBooks();

  // Initialize preview with loaded settings
  updatePreview();

  // Background color picker
  const bgPicker = document.getElementById('bg-picker');
  if (bgPicker) {
    bgPicker.addEventListener('input', () => {
      saveSettings();
      updatePreview();
    });
  }

  // Shelf color picker
  const shelfColorPicker = document.getElementById('shelf-color-picker');
  if (shelfColorPicker) {
    shelfColorPicker.addEventListener('input', () => {
      saveSettings();
      updatePreview();
    });
  }

  // Texture options
  document.querySelectorAll('.texture-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.texture-option').forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      saveSettings();
      updatePreview();
    });
  });

  // Decoration items
  document.querySelectorAll('.decoration-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('selected');
      saveSettings();
      updatePreview();
    });
  });
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSettings);
} else {
  initSettings();
}

