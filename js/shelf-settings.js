// Shelf Settings JavaScript

// Store original settings for discard functionality
let originalSettings = null;

// Load settings from localStorage
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('shelfSettings')) || {
    background: "#141414",
    texture: "none",
    color: "#8B4513",
    decorations: []
  };

  // Store original settings for discard
  originalSettings = JSON.parse(JSON.stringify(settings));

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

// Get current settings from UI (without saving)
function getCurrentSettings() {
  return {
    background: document.getElementById('bg-picker').value,
    texture: document.querySelector('.texture-option.active')?.dataset.texture || 'none',
    color: document.getElementById('shelf-color-picker').value,
    decorations: Array.from(document.querySelectorAll('.decoration-item.selected'))
      .map(item => item.dataset.decor)
  };
}

// Save settings to localStorage
function saveSettingsToStorage() {
  const settings = getCurrentSettings();

  localStorage.setItem('shelfSettings', JSON.stringify(settings));
  
  // Also update current shelf in shelves array if it exists
  const currentShelfId = localStorage.getItem('currentShelfId');
  if (currentShelfId) {
    let shelves = JSON.parse(localStorage.getItem('shelves')) || [];
    const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
    if (shelfIndex !== -1) {
      shelves[shelfIndex].settings = settings;
      localStorage.setItem('shelves', JSON.stringify(shelves));
    }
  }
  
  // Update original settings to match saved settings
  originalSettings = JSON.parse(JSON.stringify(settings));
  
  return settings;
}

// Discard changes and revert to original settings
function discardSettings() {
  if (!originalSettings) return;
  
  // Restore original settings to UI
  const bgPicker = document.getElementById('bg-picker');
  if (bgPicker) {
    bgPicker.value = originalSettings.background;
  }

  const shelfColorPicker = document.getElementById('shelf-color-picker');
  if (shelfColorPicker) {
    shelfColorPicker.value = originalSettings.color;
  }

  // Restore texture
  document.querySelectorAll('.texture-option').forEach(option => {
    option.classList.remove('active');
    if (option.dataset.texture === originalSettings.texture) {
      option.classList.add('active');
    }
  });

  // Restore decorations
  document.querySelectorAll('.decoration-item').forEach(item => {
    item.classList.remove('selected');
    if (originalSettings.decorations && originalSettings.decorations.includes(item.dataset.decor)) {
      item.classList.add('selected');
    }
  });

  // Update preview
  updatePreview();
}

// Update preview with current settings
function updatePreview() {
  const settings = getCurrentSettings();

  const preview = document.getElementById('shelf-preview');
  if (!preview) return;

  // Apply background color to preview area only (not the page body)
  preview.style.backgroundColor = settings.background;

  // Apply shelf color
  preview.style.borderTopColor = settings.color;
  
  // Apply texture to preview if needed
  preview.classList.remove('texture-wood', 'texture-glass', 'texture-stone', 'texture-marble', 'texture-metal', 'texture-brick');
  if (settings.texture && settings.texture !== 'none') {
    preview.classList.add(`texture-${settings.texture}`);
  }

  // Clear preview completely
  preview.innerHTML = '';

  // Get books from current shelf
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  let myShelf = [];
  
  if (currentShelfId && shelves.length > 0) {
    const currentShelf = shelves.find(s => s.id.toString() === currentShelfId);
    if (currentShelf) {
      myShelf = currentShelf.books || [];
    }
  }

  // Add left bookend if decoration exists
  if (settings.decorations && settings.decorations.length > 0 && settings.decorations[0]) {
    const leftBookend = document.createElement('div');
    leftBookend.className = 'preview-bookend';
    leftBookend.innerHTML = `<i class="fas fa-${getDecorationIcon(settings.decorations[0])}"></i>`;
    leftBookend.style.cssText = 'width: 40px; height: 60px; background: #654321; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.5rem; flex-shrink: 0;';
    preview.appendChild(leftBookend);
  }

  // Add books in the middle
  if (myShelf.length === 0) {
    // Show empty preview slots
    for (let i = 0; i < 3; i++) {
      const bookDiv = document.createElement('div');
      bookDiv.className = 'preview-book';
      bookDiv.style.background = '#444';
      preview.appendChild(bookDiv);
    }
  } else {
    // Show first 2-3 books in preview
    const booksToShow = myShelf.slice(0, 3);
    booksToShow.forEach((book) => {
      const bookDiv = document.createElement('div');
      bookDiv.className = 'preview-book';
      
      const img = document.createElement('img');
      img.src = book.img || book.image || '';
      img.alt = book.title || '';
      
      bookDiv.appendChild(img);
      preview.appendChild(bookDiv);
    });
  }

  // Add right bookend at the end if decoration exists
  if (settings.decorations && settings.decorations.length > 0) {
    const rightDecor = settings.decorations[1] || settings.decorations[0];
    if (rightDecor) {
      const rightBookend = document.createElement('div');
      rightBookend.className = 'preview-bookend';
      rightBookend.innerHTML = `<i class="fas fa-${getDecorationIcon(rightDecor)}"></i>`;
      rightBookend.style.cssText = 'width: 40px; height: 60px; background: #654321; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.5rem; flex-shrink: 0;';
      preview.appendChild(rightBookend);
    }
  }
}

// Load and display slotted books
function loadSlottedBooks() {
  const slottedBooksList = document.getElementById('slotted-books-list');
  if (!slottedBooksList) return;

  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  
  if (!currentShelfId || shelves.length === 0) {
    slottedBooksList.innerHTML = '<p style="color: #ccc;">No shelf selected.</p>';
    return;
  }
  
  const currentShelf = shelves.find(s => s.id.toString() === currentShelfId);
  if (!currentShelf) {
    slottedBooksList.innerHTML = '<p style="color: #ccc;">Shelf not found.</p>';
    return;
  }
  
  const myShelf = currentShelf.books || [];
  
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
  
  // Update current shelf name in settings
  const currentShelfNameSettings = document.getElementById('current-shelf-name-settings');
  if (currentShelfNameSettings) {
    currentShelfNameSettings.textContent = currentShelf.name;
  }
}

// Get Font Awesome icon class for decoration (shared with shelf.js)
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

// Remove book from shelf
function removeBookFromShelf(index) {
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  
  if (!currentShelfId || shelves.length === 0) return;
  
  const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
  if (shelfIndex === -1) return;
  
  const currentShelf = shelves[shelfIndex];
  const myShelf = currentShelf.books || [];
  
  if (index >= 0 && index < myShelf.length) {
    const bookTitle = myShelf[index].title;
    if (confirm(`Remove "${bookTitle}" from "${currentShelf.name}"?`)) {
      myShelf.splice(index, 1);
      currentShelf.books = myShelf;
      shelves[shelfIndex] = currentShelf;
      localStorage.setItem('shelves', JSON.stringify(shelves));
      
      // Sync with legacy myShelf
      localStorage.setItem('myShelf', JSON.stringify(myShelf));
      
      // Reload slotted books and preview
      loadSlottedBooks();
      updatePreview();
    }
  }
}

// Initialize settings page
function initSettings() {
  // Load shelf list if on settings page (for consistency)
  if (typeof loadShelfList === 'function') {
    loadShelfList();
  }

  // Load existing settings
  const settings = loadSettings();

  // Load slotted books
  loadSlottedBooks();

  // Initialize preview with loaded settings
  updatePreview();

  // Background color picker - update preview only (don't save yet)
  const bgPicker = document.getElementById('bg-picker');
  if (bgPicker) {
    bgPicker.addEventListener('input', () => {
      updatePreview();
    });
  }

  // Shelf color picker - update preview only (don't save yet)
  const shelfColorPicker = document.getElementById('shelf-color-picker');
  if (shelfColorPicker) {
    shelfColorPicker.addEventListener('input', () => {
      updatePreview();
    });
  }

  // Texture options - update preview only (don't save yet)
  document.querySelectorAll('.texture-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.texture-option').forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      updatePreview();
    });
  });

  // Decoration items - allow multiple selections (up to 2 for bookends) - update preview only
  document.querySelectorAll('.decoration-item').forEach(item => {
    item.addEventListener('click', () => {
      const selectedCount = document.querySelectorAll('.decoration-item.selected').length;
      
      if (item.classList.contains('selected')) {
        // Deselect if already selected
        item.classList.remove('selected');
      } else {
        // Select if less than 2 are selected (for left and right bookends)
        if (selectedCount < 2) {
          item.classList.add('selected');
        } else {
          alert('You can only select up to 2 decorations (for left and right bookends)');
          return;
        }
      }
      
      updatePreview();
    });
  });

  // Save button - save settings and redirect to shelf
  const saveBtn = document.getElementById('save-settings-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveSettingsToStorage();
      alert('Settings saved successfully!');
      window.location.href = 'shelf.html';
    });
  }

  // Discard button - revert to original settings
  const discardBtn = document.getElementById('discard-settings-btn');
  if (discardBtn) {
    discardBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to discard all changes?')) {
        discardSettings();
      }
    });
  }
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSettings);
} else {
  initSettings();
}

