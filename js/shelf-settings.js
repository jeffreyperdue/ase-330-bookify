// Shelf Settings JavaScript

// Store original settings for discard functionality
let originalSettings = null;
let hasUnsavedChanges = false;

// Load settings from localStorage
function loadSettings(shelfId = null) {
  let settings;
  
  // If shelfId is provided, load from that shelf's settings
  if (shelfId) {
    const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
    const shelf = shelves.find(s => s.id.toString() === shelfId.toString());
    if (shelf && shelf.settings) {
      settings = shelf.settings;
    } else {
      settings = {
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
      };
    }
  } else {
    // Load from current shelf or fallback to global shelfSettings
    const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
    const currentShelfId = localStorage.getItem('currentShelfId');
    
    if (currentShelfId && shelves.length > 0) {
      const currentShelf = shelves.find(s => s.id.toString() === currentShelfId);
      if (currentShelf && currentShelf.settings) {
        settings = currentShelf.settings;
      } else {
        settings = JSON.parse(localStorage.getItem('shelfSettings')) || {
          background: "#141414",
          texture: "none",
          color: "#8B4513",
          decorations: []
        };
      }
    } else {
      settings = JSON.parse(localStorage.getItem('shelfSettings')) || {
        background: "#141414",
        texture: "none",
        color: "#8B4513",
        decorations: []
      };
    }
  }

  // Store original settings for discard
  originalSettings = JSON.parse(JSON.stringify(settings));
  hasUnsavedChanges = false; // Reset when loading new settings

  // Set background settings
  const bgPicker = document.getElementById('bg-picker');
  if (bgPicker) {
    bgPicker.value = settings.background || '#141414';
  }
  
  // Set background type
  const bgType = settings.backgroundType || 'color';
  document.querySelectorAll('.bg-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.bgTab === bgType) {
      tab.classList.add('active');
    }
  });
  document.querySelectorAll('.bg-tab-content').forEach(content => {
    content.classList.remove('active');
    if (content.dataset.bgContent === bgType) {
      content.classList.add('active');
    }
  });
  
  // Load background image if exists
  if (settings.backgroundImage) {
    const bgImageInput = document.getElementById('bg-image-upload');
    const bgImagePreview = document.getElementById('bg-image-preview');
    const bgImageRemove = document.getElementById('bg-image-remove');
    if (bgImageInput && bgImagePreview) {
      bgImageInput.dataset.imageData = settings.backgroundImage;
      bgImagePreview.innerHTML = `<img src="${settings.backgroundImage}" alt="Background preview">`;
      if (bgImageRemove) bgImageRemove.style.display = 'block';
    }
  }
  
  // Load gradient if exists
  if (settings.backgroundGradient) {
    const grad = settings.backgroundGradient;
    const gradType = document.getElementById('gradient-type');
    const gradDirection = document.getElementById('gradient-direction');
    const gradColor1 = document.getElementById('gradient-color-1');
    const gradColor2 = document.getElementById('gradient-color-2');
    const gradColor3 = document.getElementById('gradient-color-3');
    
    if (gradType) gradType.value = grad.type || 'linear';
    if (gradDirection) gradDirection.value = grad.direction || 'to right';
    if (gradColor1) gradColor1.value = grad.colors[0] || '#141414';
    if (gradColor2) gradColor2.value = grad.colors[1] || '#2a2a2a';
    if (gradColor3 && grad.colors[2]) {
      gradColor3.value = grad.colors[2];
      gradColor3.dataset.use = 'true';
      document.getElementById('toggle-color-3').textContent = 'Remove';
    }
    updateGradientPreview();
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

  // Set selected decorations (handle new structure)
  document.querySelectorAll('.decoration-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  if (settings.decorations && Array.isArray(settings.decorations)) {
    settings.decorations.forEach((decor, index) => {
      if (typeof decor === 'string') {
        // Legacy format - just icon name
        const item = document.querySelector(`.decoration-item[data-decor="${decor}"][data-type="icon"]`);
        if (item) item.classList.add('selected');
      } else if (decor.type === 'icon') {
        // New format - icon type
        const item = document.querySelector(`.decoration-item[data-decor="${decor.value}"][data-type="icon"]`);
        if (item) item.classList.add('selected');
      } else if (decor.type === 'image' && decor.value) {
        // Image type
        const position = decor.position || (index === 0 ? 'left' : 'right');
        const input = document.getElementById(`bookend-image-upload-${position}`);
        const preview = document.getElementById(`bookend-image-preview-${position}`);
        if (input && preview) {
          input.dataset.imageData = decor.value;
          preview.innerHTML = `<img src="${decor.value}" alt="Bookend preview">`;
        }
      } else if (decor.type === 'text' && decor.value) {
        // Text type
        const position = decor.position || (index === 0 ? 'left' : 'right');
        const input = document.getElementById(`bookend-text-${position}`);
        const preview = document.getElementById(`text-preview-${position}`);
        if (input) {
          input.value = decor.value;
          if (preview) preview.textContent = decor.value;
        }
      } else if (decor.type === 'shape' && decor.value) {
        // Shape type
        const position = decor.position || (index === 0 ? 'left' : 'right');
        const select = document.getElementById(`bookend-shape-${position}`);
        if (select) select.value = decor.value;
      }
    });
  }
  
  // Load bookend background settings
  if (settings.bookendBackground) {
    const showBg = document.getElementById('bookend-show-background');
    const bgColor = document.getElementById('bookend-bg-color');
    const bgOpacity = document.getElementById('bookend-bg-opacity');
    const opacityValue = document.getElementById('bookend-opacity-value');
    
    if (showBg) showBg.checked = settings.bookendBackground.show !== false;
    if (bgColor) bgColor.value = settings.bookendBackground.color || '#654321';
    if (bgOpacity) {
      bgOpacity.value = Math.round((settings.bookendBackground.opacity || 1) * 100);
      if (opacityValue) opacityValue.textContent = bgOpacity.value;
    }
  }

  // Apply settings to preview
  updatePreview();

  return settings;
}

// Get current settings from UI (without saving)
function getCurrentSettings() {
  try {
    // Get bookend decorations (left and right)
    const decorations = [];
    
    // Check for icon selections
    const selectedIcons = Array.from(document.querySelectorAll('.decoration-item.selected[data-type="icon"]'));
    if (selectedIcons.length > 0) {
      selectedIcons.forEach((item, index) => {
        if (index < 2) {
          decorations.push({
            type: 'icon',
            value: item.dataset.decor,
            position: index === 0 ? 'left' : 'right'
          });
        }
      });
    }
    
    // Check for image uploads
    const leftImageInput = document.getElementById('bookend-image-upload-left');
    const rightImageInput = document.getElementById('bookend-image-upload-right');
    if (leftImageInput && leftImageInput.dataset.imageData) {
      decorations[0] = {
        type: 'image',
        value: leftImageInput.dataset.imageData,
        position: 'left'
      };
    }
    if (rightImageInput && rightImageInput.dataset.imageData) {
      decorations[1] = decorations[1] || { position: 'right' };
      decorations[1] = {
        type: 'image',
        value: rightImageInput.dataset.imageData,
        position: 'right'
      };
    }
    
    // Check for text inputs
    const leftText = document.getElementById('bookend-text-left')?.value.trim();
    const rightText = document.getElementById('bookend-text-right')?.value.trim();
    if (leftText) {
      decorations[0] = {
        type: 'text',
        value: leftText,
        position: 'left'
      };
    }
    if (rightText) {
      decorations[1] = decorations[1] || { position: 'right' };
      decorations[1] = {
        type: 'text',
        value: rightText,
        position: 'right'
      };
    }
    
    // Check for shapes
    const leftShape = document.getElementById('bookend-shape-left')?.value;
    const rightShape = document.getElementById('bookend-shape-right')?.value;
    if (leftShape) {
      decorations[0] = {
        type: 'shape',
        value: leftShape,
        position: 'left'
      };
    }
    if (rightShape) {
      decorations[1] = decorations[1] || { position: 'right' };
      decorations[1] = {
        type: 'shape',
        value: rightShape,
        position: 'right'
      };
    }
    
    // Get bookend background settings
    const showBackground = document.getElementById('bookend-show-background')?.checked ?? true;
    const bgColor = document.getElementById('bookend-bg-color')?.value || '#654321';
    const bgOpacity = parseInt(document.getElementById('bookend-bg-opacity')?.value || '100');
    
    // Get background settings
    const activeBgTab = document.querySelector('.bg-tab.active')?.dataset.bgTab || 'color';
    const bgPicker = document.getElementById('bg-picker');
    let background = bgPicker ? bgPicker.value : '#141414';
    let backgroundType = 'color';
    let backgroundImage = null;
    let backgroundGradient = null;
    
    if (activeBgTab === 'image') {
      const bgImageInput = document.getElementById('bg-image-upload');
      if (bgImageInput && bgImageInput.dataset.imageData) {
        backgroundType = 'image';
        backgroundImage = bgImageInput.dataset.imageData;
      }
    } else if (activeBgTab === 'gradient') {
      backgroundType = 'gradient';
      const gradientType = document.getElementById('gradient-type')?.value || 'linear';
      const gradientDirection = document.getElementById('gradient-direction')?.value || 'to right';
      const color1 = document.getElementById('gradient-color-1')?.value || '#141414';
      const color2 = document.getElementById('gradient-color-2')?.value || '#2a2a2a';
      const color3 = document.getElementById('gradient-color-3')?.value;
      const useColor3 = document.getElementById('gradient-color-3')?.dataset.use === 'true';
      
      backgroundGradient = {
        type: gradientType,
        direction: gradientDirection,
        colors: useColor3 && color3 ? [color1, color2, color3] : [color1, color2]
      };
    }
    
    const textureOption = document.querySelector('.texture-option.active');
    const shelfColorPicker = document.getElementById('shelf-color-picker');
    
    return {
      background: background,
      backgroundType: backgroundType,
      backgroundImage: backgroundImage,
      backgroundGradient: backgroundGradient,
      texture: textureOption ? (textureOption.dataset.texture || 'none') : 'none',
      color: shelfColorPicker ? shelfColorPicker.value : '#8B4513',
      decorations: decorations,
      bookendBackground: {
        show: showBackground,
        color: bgColor,
        opacity: bgOpacity / 100
      }
    };
  } catch (error) {
    console.error('Error getting current settings:', error);
    // Return a safe default settings object
    return {
      background: '#141414',
      backgroundType: 'color',
      backgroundImage: null,
      backgroundGradient: null,
      texture: 'none',
      color: '#8B4513',
      decorations: [],
      bookendBackground: {
        show: true,
        color: '#654321',
        opacity: 1
      }
    };
  }
}

// Save settings to localStorage
function saveSettingsToStorage() {
  try {
    const settings = getCurrentSettings();
    
    // Check size of settings object (approximate)
    const settingsString = JSON.stringify(settings);
    const sizeInMB = new Blob([settingsString]).size / (1024 * 1024);
    
    // Warn if settings are getting large (over 2MB)
    if (sizeInMB > 2) {
      console.warn(`Settings size: ${sizeInMB.toFixed(2)}MB - may be close to localStorage limit`);
    }

    // Try to save to shelfSettings
    try {
      localStorage.setItem('shelfSettings', settingsString);
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        throw new Error('Storage quota exceeded. The image file is too large. Please try a smaller image or remove other data.');
      }
      throw e;
    }
    
    // Also update current shelf in shelves array if it exists
    const currentShelfId = localStorage.getItem('currentShelfId');
    if (currentShelfId) {
      let shelves = JSON.parse(localStorage.getItem('shelves')) || [];
      const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
      if (shelfIndex !== -1) {
        shelves[shelfIndex].settings = settings;
        
        // Try to save shelves array
        try {
          const shelvesString = JSON.stringify(shelves);
          localStorage.setItem('shelves', shelvesString);
        } catch (e) {
          if (e.name === 'QuotaExceededError' || e.code === 22) {
            throw new Error('Storage quota exceeded. The image file is too large. Please try a smaller image or remove other data.');
          }
          throw e;
        }
      }
    }
    
    // Update original settings to match saved settings
    originalSettings = JSON.parse(JSON.stringify(settings));
    hasUnsavedChanges = false; // Reset after saving
    
    return settings;
  } catch (error) {
    console.error('Error saving settings to storage:', error);
    throw error; // Re-throw to be caught by caller
  }
}

// Discard changes and revert to original settings
function discardSettings() {
  if (!originalSettings) return;
  
  // Use loadSettings to restore all settings properly
  // This ensures all UI elements are properly restored
  const tempOriginal = originalSettings;
  originalSettings = null; // Temporarily clear to allow loadSettings to work
  loadSettings(); // This will restore all settings including new ones
  originalSettings = tempOriginal; // Restore for change tracking

  // Update preview
  updatePreview();
  
  // Initialize gradient preview if needed
  if (document.querySelector('.bg-tab.active')?.dataset.bgTab === 'gradient') {
    updateGradientPreview();
  }
  
  checkForUnsavedChanges();
}

// Check if there are unsaved changes
function checkForUnsavedChanges() {
  try {
    if (!originalSettings) {
      hasUnsavedChanges = false;
      return;
    }
    
    const current = getCurrentSettings();
    hasUnsavedChanges = JSON.stringify(current) !== JSON.stringify(originalSettings);
  } catch (error) {
    console.error('Error checking for unsaved changes:', error);
    // If there's an error, assume there are unsaved changes to be safe
    hasUnsavedChanges = true;
  }
}

// Mark settings as saved (used when switching shelves)
function markSettingsAsSaved() {
  hasUnsavedChanges = false;
  if (originalSettings) {
    // Update originalSettings to current to prevent false warnings
    originalSettings = JSON.parse(JSON.stringify(getCurrentSettings()));
  }
}

// Update gradient preview
function updateGradientPreview() {
  const preview = document.getElementById('gradient-preview');
  if (!preview) return;
  
  const gradientType = document.getElementById('gradient-type')?.value || 'linear';
  const gradientDirection = document.getElementById('gradient-direction')?.value || 'to right';
  const color1 = document.getElementById('gradient-color-1')?.value || '#141414';
  const color2 = document.getElementById('gradient-color-2')?.value || '#2a2a2a';
  const color3 = document.getElementById('gradient-color-3')?.value;
  const useColor3 = document.getElementById('gradient-color-3')?.dataset.use === 'true';
  
  let gradientString;
  if (gradientType === 'linear') {
    const colors = useColor3 && color3 ? `${color1}, ${color2}, ${color3}` : `${color1}, ${color2}`;
    gradientString = `linear-gradient(${gradientDirection}, ${colors})`;
  } else {
    const colors = useColor3 && color3 ? `${color1}, ${color2}, ${color3}` : `${color1}, ${color2}`;
    gradientString = `radial-gradient(circle, ${colors})`;
  }
  
  preview.style.background = gradientString;
}

// Update preview with current settings
function updatePreview() {
  const settings = getCurrentSettings();

  const preview = document.getElementById('shelf-preview');
  if (!preview) return;

  // Apply shelf color (border)
  preview.style.borderTopColor = settings.color;
  
  // Apply texture classes first
  preview.classList.remove('texture-wood', 'texture-glass', 'texture-stone', 'texture-marble', 'texture-metal', 'texture-brick');
  
  // Apply background based on type
  preview.style.backgroundImage = '';
  preview.style.backgroundColor = '';
  
  if (settings.backgroundType === 'image' && settings.backgroundImage) {
    // Background image
    preview.style.backgroundImage = `url(${settings.backgroundImage})`;
    preview.style.backgroundSize = 'cover';
    preview.style.backgroundPosition = 'center';
    preview.style.backgroundColor = settings.background; // Fallback color
  } else if (settings.backgroundType === 'gradient' && settings.backgroundGradient) {
    // Background gradient
    const grad = settings.backgroundGradient;
    let gradientString;
    if (grad.type === 'linear') {
      gradientString = `linear-gradient(${grad.direction}, ${grad.colors.join(', ')})`;
    } else {
      gradientString = `radial-gradient(circle, ${grad.colors.join(', ')})`;
    }
    preview.style.backgroundImage = gradientString;
    preview.style.backgroundColor = grad.colors[0]; // Fallback
  } else {
    // Solid color
    preview.style.backgroundColor = settings.background;
  }
  
  // Apply texture overlay if needed
  if (settings.texture && settings.texture !== 'none') {
    preview.classList.add(`texture-${settings.texture}`);
  }

  // Clear preview completely
  preview.innerHTML = '';

  // Get books from current shelf (flatten from rows)
  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  let myShelf = [];
  
  if (currentShelfId && shelves.length > 0) {
    const currentShelf = shelves.find(s => s.id.toString() === currentShelfId);
    if (currentShelf) {
      // Get books from rows if available, otherwise from books array
      if (currentShelf.rows && Array.isArray(currentShelf.rows)) {
        myShelf = currentShelf.rows.flatMap(row => row.books || []);
      } else {
        myShelf = currentShelf.books || [];
      }
    }
  }

  // Add left bookend if decoration exists
  const leftDecor = settings.decorations && settings.decorations.find(d => {
    if (typeof d === 'string') return true;
    return d.position === 'left' || (!d.position && settings.decorations.indexOf(d) === 0);
  });
  if (leftDecor) {
    const leftBookend = renderBookend(leftDecor, settings, 'left');
    if (leftBookend) {
      leftBookend.style.cssText += 'width: 40px; height: 60px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.5rem; flex-shrink: 0;';
      preview.appendChild(leftBookend);
    }
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
  const rightDecor = settings.decorations && settings.decorations.find(d => {
    if (typeof d === 'string') return settings.decorations.indexOf(d) === 1 || (settings.decorations.length === 1 && settings.decorations.indexOf(d) === 0);
    return d.position === 'right' || (!d.position && settings.decorations.indexOf(d) === 1);
  }) || (settings.decorations && settings.decorations.length === 1 && typeof settings.decorations[0] === 'string' ? settings.decorations[0] : null);
  
  if (rightDecor) {
    const rightBookend = renderBookend(rightDecor, settings, 'right');
    if (rightBookend) {
      rightBookend.style.cssText += 'width: 40px; height: 60px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.5rem; flex-shrink: 0;';
      preview.appendChild(rightBookend);
    }
  }
}

// Store temporary book order for drag and drop (not saved until Save Changes)
let tempBookOrder = null;

// Make tempBookOrder accessible globally for shelf switching
window.tempBookOrder = tempBookOrder;

// Migrate shelf to row-based structure if needed (helper)
function migrateShelfToRowsForSettings(shelf) {
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

// Load and display slotted books with drag and drop support
function loadSlottedBooks() {
  const slottedBooksList = document.getElementById('slotted-books-list');
  if (!slottedBooksList) return;

  const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
  const currentShelfId = localStorage.getItem('currentShelfId');
  
  if (!currentShelfId || shelves.length === 0) {
    slottedBooksList.innerHTML = '<p style="color: #ccc;">No shelf selected.</p>';
    return;
  }
  
  const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
  if (shelfIndex === -1) {
    slottedBooksList.innerHTML = '<p style="color: #ccc;">Shelf not found.</p>';
    return;
  }
  
  // Migrate shelf if needed
  shelves[shelfIndex] = migrateShelfToRowsForSettings(shelves[shelfIndex]);
  const currentShelf = shelves[shelfIndex];
  
  // Flatten all books from all rows for display
  const allBooks = (currentShelf.rows || []).flatMap(row => row.books || []);
  
  // Always reset temp order when loading books (ensures all books are shown)
  // This fixes the issue where only 1 book shows when there are multiple
  tempBookOrder = allBooks.map((book, index) => ({ book, originalIndex: index }));
  window.tempBookOrder = tempBookOrder;
  
  slottedBooksList.innerHTML = '';

  if (tempBookOrder.length === 0) {
    slottedBooksList.innerHTML = '<p style="color: #ccc;">No books on your shelf yet.</p>';
    return;
  }
  
  // Use the container
  const container = slottedBooksList;
  
  // Track drag state at module level (shared across all items)
  let draggedItemIndex = null;
  let draggedElement = null;
  let dragOffset = { x: 0, y: 0 };
  let isDragging = false;
  let hasDragged = false;

  // Helper function to handle drop
  function handleDrop(targetIndex, isSwap = false) {
    if (draggedItemIndex === null || draggedItemIndex === targetIndex || !tempBookOrder) {
      return false;
    }
    
    if (isSwap) {
      // Swap positions
      const temp = tempBookOrder[draggedItemIndex];
      tempBookOrder[draggedItemIndex] = tempBookOrder[targetIndex];
      tempBookOrder[targetIndex] = temp;
    } else {
      // Insert at position
      const [movedItem] = tempBookOrder.splice(draggedItemIndex, 1);
      const newIndex = draggedItemIndex < targetIndex ? targetIndex - 1 : targetIndex;
      tempBookOrder.splice(newIndex, 0, movedItem);
    }
    
    window.tempBookOrder = tempBookOrder;
    loadSlottedBooks();
    checkForUnsavedChanges();
    return true;
  }

  // Global mouse event handlers for drag and drop
  function handleMouseMove(e) {
    if (!isDragging || !draggedElement) return;
    
    e.preventDefault();
    hasDragged = true;
    
    // Update dragged element position
    draggedElement.style.position = 'fixed';
    draggedElement.style.zIndex = '1000';
    draggedElement.style.pointerEvents = 'none';
    draggedElement.style.left = (e.clientX - dragOffset.x) + 'px';
    draggedElement.style.top = (e.clientY - dragOffset.y) + 'px';
    
    // Find element under cursor
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    if (!elementBelow) return;
    
    // Check if over a book item (for swap)
    const bookItem = elementBelow.closest('.slotted-book-item');
    if (bookItem && bookItem !== draggedElement) {
      const targetIndex = parseInt(bookItem.dataset.bookIndex);
      if (targetIndex !== draggedItemIndex) {
        // Remove swap-target from all items
        document.querySelectorAll('.slotted-book-item').forEach(item => {
          item.classList.remove('swap-target');
        });
        bookItem.classList.add('swap-target');
      }
    } else {
      // Remove swap-target from all items
      document.querySelectorAll('.slotted-book-item').forEach(item => {
        item.classList.remove('swap-target');
      });
    }
    
    // Check if over a drop zone (for insert)
    const dropZone = elementBelow.closest('.drop-zone');
    if (dropZone) {
      document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('drop-zone-active');
      });
      dropZone.classList.add('drop-zone-active');
    } else {
      document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('drop-zone-active');
      });
    }
  }

  function handleMouseUp(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    isDragging = false;
    
    if (!draggedElement) {
      resetDrag();
      return;
    }
    
    // Temporarily hide the dragged element to see what's underneath
    const originalDisplay = draggedElement.style.display;
    draggedElement.style.display = 'none';
    
    // Find element under cursor (now that dragged element is hidden)
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    
    // Restore dragged element display
    draggedElement.style.display = originalDisplay;
    
    if (!elementBelow) {
      resetDrag();
      return;
    }
    
    // Check if dropped on a book item (swap)
    const bookItem = elementBelow.closest('.slotted-book-item');
    if (bookItem && bookItem !== draggedElement) {
      const targetIndex = parseInt(bookItem.dataset.bookIndex);
      if (!isNaN(targetIndex) && targetIndex !== draggedItemIndex) {
        handleDrop(targetIndex, true);
        resetDrag();
        return;
      }
    }
    
    // Check if dropped on a drop zone (insert)
    const dropZone = elementBelow.closest('.drop-zone');
    if (dropZone) {
      const targetIndex = parseInt(dropZone.dataset.insertIndex);
      if (!isNaN(targetIndex) && targetIndex !== draggedItemIndex) {
        handleDrop(targetIndex, false);
        resetDrag();
        return;
      }
    }
    
    // Dropped elsewhere - reset
    resetDrag();
  }

  function resetDrag() {
    if (draggedElement) {
      draggedElement.style.position = '';
      draggedElement.style.zIndex = '';
      draggedElement.style.pointerEvents = '';
      draggedElement.style.left = '';
      draggedElement.style.top = '';
      draggedElement.classList.remove('dragging');
    }
    
    // Hide drop zones
    document.querySelectorAll('.drop-zone').forEach(zone => {
      zone.classList.remove('drop-zone-active');
      zone.style.display = 'none';
    });
    
    // Remove swap targets
    document.querySelectorAll('.slotted-book-item').forEach(item => {
      item.classList.remove('swap-target');
    });
    
    container.classList.remove('dragging-active');
    
    draggedItemIndex = null;
    draggedElement = null;
    dragOffset = { x: 0, y: 0 };
    
    // Remove global listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }

  // Create all book items first
  const bookItems = tempBookOrder.map((item, displayIndex) => {
    const book = item.book;
    const bookItem = document.createElement('div');
    bookItem.className = 'slotted-book-item';
    bookItem.dataset.bookIndex = displayIndex;
    
    const img = document.createElement('img');
    img.src = book.img || book.image || '';
    img.alt = book.title || '';
    img.title = book.title || '';
    img.draggable = false;
    img.style.pointerEvents = 'none';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.setAttribute('aria-label', `Remove ${book.title}`);
    removeBtn.style.pointerEvents = 'auto';
    
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (tempBookOrder) {
        tempBookOrder.splice(displayIndex, 1);
        loadSlottedBooks();
        checkForUnsavedChanges();
      }
    });
    
    bookItem.appendChild(img);
    bookItem.appendChild(removeBtn);
    
    // Mouse-based drag handlers
    bookItem.addEventListener('mousedown', function(e) {
      // Don't start drag if clicking remove button
      if (e.target.classList.contains('remove-btn')) {
        return;
      }
      
      isDragging = true;
      hasDragged = false;
      draggedItemIndex = displayIndex;
      draggedElement = this;
      
      // Calculate offset from mouse to element
      const rect = this.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      
      // Add dragging class
      this.classList.add('dragging');
      
      // Show drop zones
      document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.style.display = 'flex';
        zone.style.minHeight = '60px';
      });
      
      // Prevent wrapping
      container.classList.add('dragging-active');
      
      // Add global mouse listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      e.preventDefault();
    });
    
    // Click handler - only navigate if no drag occurred
    bookItem.addEventListener('click', function(e) {
      if (!e.target.classList.contains('remove-btn') && !hasDragged) {
        localStorage.setItem('selectedBook', JSON.stringify(book));
        window.location.href = 'book.html';
      }
      hasDragged = false;
    });
    
    return { bookItem, displayIndex, book };
  });

  // Add drop zones and book items to container
  bookItems.forEach(({ bookItem, displayIndex, book }, idx) => {
    // Add drop zone before this item (except before first)
    if (idx > 0) {
      const dropZone = document.createElement('div');
      dropZone.className = 'drop-zone';
      dropZone.dataset.insertIndex = displayIndex;
      container.appendChild(dropZone);
    }
    
    container.appendChild(bookItem);
  });
  
  // Add drop zone after last item
  if (bookItems.length > 0) {
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.dataset.insertIndex = tempBookOrder.length;
    container.appendChild(dropZone);
  }
  
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

// Remove book from shelf (handled in loadSlottedBooks now, but keep for compatibility)
function removeBookFromShelf(index) {
  // This is now handled in loadSlottedBooks via the remove button
  // But we keep this for any external calls
  if (tempBookOrder && index >= 0 && index < tempBookOrder.length) {
    const bookTitle = tempBookOrder[index].book.title;
    if (confirm(`Remove "${bookTitle}" from shelf?`)) {
      tempBookOrder.splice(index, 1);
      loadSlottedBooks();
      updatePreview();
      checkForUnsavedChanges();
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

  // Reset temp book order when loading settings
  tempBookOrder = null;
  window.tempBookOrder = null;

  // Load slotted books
  loadSlottedBooks();

  // Initialize preview with loaded settings
  updatePreview();
  
  // Initialize gradient preview if gradient tab is active
  if (document.querySelector('.bg-tab.active')?.dataset.bgTab === 'gradient') {
    updateGradientPreview();
  }

  // Background type tabs
  document.querySelectorAll('.bg-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.bgTab;
      
      // Update active tab
      document.querySelectorAll('.bg-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      document.querySelectorAll('.bg-tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.dataset.bgContent === tabName) {
          content.classList.add('active');
        }
      });
      
      updatePreview();
      checkForUnsavedChanges();
    });
  });

  // Background color picker - update preview only (don't save yet)
  const bgPicker = document.getElementById('bg-picker');
  if (bgPicker) {
    bgPicker.addEventListener('input', () => {
      updatePreview();
      checkForUnsavedChanges();
    });
  }

  // Background image upload
  const bgImageInput = document.getElementById('bg-image-upload');
  const bgImagePreview = document.getElementById('bg-image-preview');
  const bgImageRemove = document.getElementById('bg-image-remove');
  
  if (bgImageInput && bgImagePreview) {
    bgImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Check file size (warn if over 2MB)
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 2) {
          if (!confirm(`Warning: This image is ${fileSizeMB.toFixed(2)}MB. Large images may cause storage issues. Do you want to continue?`)) {
            bgImageInput.value = '';
            return;
          }
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            let base64 = event.target.result;
            
            // Compress image if it's too large (over 1MB as base64)
            const base64SizeMB = new Blob([base64]).size / (1024 * 1024);
            if (base64SizeMB > 1) {
              // Compress the image
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Resize if too large (max 1920px on longest side)
                const maxDimension = 1920;
                if (width > maxDimension || height > maxDimension) {
                  if (width > height) {
                    height = (height / width) * maxDimension;
                    width = maxDimension;
                  } else {
                    width = (width / height) * maxDimension;
                    height = maxDimension;
                  }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with quality compression
                base64 = canvas.toDataURL('image/jpeg', 0.7);
                
                bgImageInput.dataset.imageData = base64;
                bgImagePreview.innerHTML = `<img src="${base64}" alt="Background preview">`;
                if (bgImageRemove) bgImageRemove.style.display = 'block';
                updatePreview();
                checkForUnsavedChanges();
                
                // Ensure save button remains clickable
                const saveBtn = document.getElementById('save-settings-btn');
                if (saveBtn) {
                  saveBtn.style.pointerEvents = 'auto';
                  saveBtn.style.cursor = 'pointer';
                  saveBtn.disabled = false;
                }
              };
              img.onerror = () => {
                alert('Error loading image. Please try a different image.');
                bgImageInput.value = '';
              };
              img.src = base64;
            } else {
              bgImageInput.dataset.imageData = base64;
              bgImagePreview.innerHTML = `<img src="${base64}" alt="Background preview">`;
              if (bgImageRemove) bgImageRemove.style.display = 'block';
              updatePreview();
              checkForUnsavedChanges();
              
              // Ensure save button remains clickable
              const saveBtn = document.getElementById('save-settings-btn');
              if (saveBtn) {
                saveBtn.style.pointerEvents = 'auto';
                saveBtn.style.cursor = 'pointer';
                saveBtn.disabled = false;
              }
            }
          } catch (error) {
            console.error('Error processing background image upload:', error);
            alert('Error processing image. Please try again.');
          }
        };
        reader.onerror = () => {
          console.error('Error reading file');
          alert('Error reading image file. Please try again.');
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  if (bgImageRemove) {
    bgImageRemove.addEventListener('click', () => {
      if (bgImageInput) {
        bgImageInput.value = '';
        bgImageInput.dataset.imageData = '';
      }
      if (bgImagePreview) bgImagePreview.innerHTML = '';
      bgImageRemove.style.display = 'none';
      updatePreview();
      checkForUnsavedChanges();
    });
  }

  // Gradient controls
  const gradientType = document.getElementById('gradient-type');
  const gradientDirection = document.getElementById('gradient-direction');
  const gradientColor1 = document.getElementById('gradient-color-1');
  const gradientColor2 = document.getElementById('gradient-color-2');
  const gradientColor3 = document.getElementById('gradient-color-3');
  const toggleColor3 = document.getElementById('toggle-color-3');
  
  [gradientType, gradientDirection, gradientColor1, gradientColor2, gradientColor3].forEach(control => {
    if (control) {
      control.addEventListener('input', () => {
        updateGradientPreview();
        updatePreview();
        checkForUnsavedChanges();
      });
    }
  });
  
  if (toggleColor3 && gradientColor3) {
    toggleColor3.addEventListener('click', () => {
      const currentlyUsing = gradientColor3.dataset.use === 'true';
      if (currentlyUsing) {
        gradientColor3.dataset.use = 'false';
        toggleColor3.textContent = 'Use';
        gradientColor3.value = '';
      } else {
        gradientColor3.dataset.use = 'true';
        toggleColor3.textContent = 'Remove';
        if (!gradientColor3.value) gradientColor3.value = '#000000';
      }
      updateGradientPreview();
      updatePreview();
      checkForUnsavedChanges();
    });
  }

  // Shelf color picker - update preview only (don't save yet)
  const shelfColorPicker = document.getElementById('shelf-color-picker');
  if (shelfColorPicker) {
    shelfColorPicker.addEventListener('input', () => {
      updatePreview();
      checkForUnsavedChanges();
    });
  }

  // Texture options - update preview only (don't save yet)
  document.querySelectorAll('.texture-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.texture-option').forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      updatePreview();
      checkForUnsavedChanges();
    });
  });

  // Bookend type tabs
  document.querySelectorAll('.bookend-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Update active tab
      document.querySelectorAll('.bookend-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      document.querySelectorAll('.bookend-tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.dataset.content === tabName) {
          content.classList.add('active');
        }
      });
    });
  });

  // Icon decoration items - allow multiple selections (up to 2 for bookends)
  document.querySelectorAll('.decoration-item[data-type="icon"]').forEach(item => {
    item.addEventListener('click', () => {
      const selectedCount = document.querySelectorAll('.decoration-item.selected[data-type="icon"]').length;
      
      if (item.classList.contains('selected')) {
        item.classList.remove('selected');
      } else {
        if (selectedCount < 2) {
          item.classList.add('selected');
        } else {
          alert('You can only select up to 2 icons (for left and right bookends)');
          return;
        }
      }
      
      // Clear other types when selecting icons
      document.getElementById('bookend-text-left').value = '';
      document.getElementById('bookend-text-right').value = '';
      document.getElementById('bookend-shape-left').value = '';
      document.getElementById('bookend-shape-right').value = '';
      document.getElementById('bookend-image-upload-left').value = '';
      document.getElementById('bookend-image-upload-right').value = '';
      document.getElementById('bookend-image-upload-left').dataset.imageData = '';
      document.getElementById('bookend-image-upload-right').dataset.imageData = '';
      document.getElementById('bookend-image-preview-left').innerHTML = '';
      document.getElementById('bookend-image-preview-right').innerHTML = '';
      
      updatePreview();
      checkForUnsavedChanges();
    });
  });

  // Image upload handlers
  ['left', 'right'].forEach(position => {
    const input = document.getElementById(`bookend-image-upload-${position}`);
    const preview = document.getElementById(`bookend-image-preview-${position}`);
    
    if (input && preview) {
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          // Check file size (warn if over 2MB)
          const fileSizeMB = file.size / (1024 * 1024);
          if (fileSizeMB > 2) {
            if (!confirm(`Warning: This image is ${fileSizeMB.toFixed(2)}MB. Large images may cause storage issues. Do you want to continue?`)) {
              input.value = '';
              return;
            }
          }
          
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              let base64 = event.target.result;
              
              // Compress image if it's too large (over 1MB as base64)
              const base64SizeMB = new Blob([base64]).size / (1024 * 1024);
              if (base64SizeMB > 1) {
                // Compress the image
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  let width = img.width;
                  let height = img.height;
                  
                  // Resize if too large (max 800px on longest side for bookends)
                  const maxDimension = 800;
                  if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                      height = (height / width) * maxDimension;
                      width = maxDimension;
                    } else {
                      width = (width / height) * maxDimension;
                      height = maxDimension;
                    }
                  }
                  
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, width, height);
                  
                  // Convert to base64 with quality compression
                  base64 = canvas.toDataURL('image/jpeg', 0.7);
                  
                  input.dataset.imageData = base64;
                  preview.innerHTML = `<img src="${base64}" alt="Bookend preview">`;
                  
                  // Clear other types
                  document.querySelectorAll('.decoration-item.selected[data-type="icon"]').forEach(item => item.classList.remove('selected'));
                  const textInput = document.getElementById(`bookend-text-${position}`);
                  const shapeInput = document.getElementById(`bookend-shape-${position}`);
                  if (textInput) textInput.value = '';
                  if (shapeInput) shapeInput.value = '';
                  
                  updatePreview();
                  checkForUnsavedChanges();
                  
                  // Ensure save button remains clickable
                  const saveBtn = document.getElementById('save-settings-btn');
                  if (saveBtn) {
                    saveBtn.style.pointerEvents = 'auto';
                    saveBtn.style.cursor = 'pointer';
                    saveBtn.disabled = false;
                  }
                };
                img.onerror = () => {
                  alert('Error loading image. Please try a different image.');
                  input.value = '';
                };
                img.src = base64;
              } else {
                input.dataset.imageData = base64;
                preview.innerHTML = `<img src="${base64}" alt="Bookend preview">`;
                
                // Clear other types
                document.querySelectorAll('.decoration-item.selected[data-type="icon"]').forEach(item => item.classList.remove('selected'));
                const textInput = document.getElementById(`bookend-text-${position}`);
                const shapeInput = document.getElementById(`bookend-shape-${position}`);
                if (textInput) textInput.value = '';
                if (shapeInput) shapeInput.value = '';
                
                updatePreview();
                checkForUnsavedChanges();
                
                // Ensure save button remains clickable
                const saveBtn = document.getElementById('save-settings-btn');
                if (saveBtn) {
                  saveBtn.style.pointerEvents = 'auto';
                  saveBtn.style.cursor = 'pointer';
                  saveBtn.disabled = false;
                }
              }
            } catch (error) {
              console.error('Error processing image upload:', error);
              alert('Error processing image. Please try again.');
            }
          };
          reader.onerror = () => {
            console.error('Error reading file');
            alert('Error reading image file. Please try again.');
          };
          reader.readAsDataURL(file);
        }
      });
    }
  });

  // Text input handlers
  ['left', 'right'].forEach(position => {
    const input = document.getElementById(`bookend-text-${position}`);
    const preview = document.getElementById(`text-preview-${position}`);
    
    if (input && preview) {
      input.addEventListener('input', () => {
        preview.textContent = input.value || '';
        
        // Clear other types for this position
        if (input.value.trim()) {
          document.querySelectorAll('.decoration-item.selected[data-type="icon"]').forEach(item => {
            if ((position === 'left' && Array.from(document.querySelectorAll('.decoration-item.selected[data-type="icon"]')).indexOf(item) === 0) ||
                (position === 'right' && Array.from(document.querySelectorAll('.decoration-item.selected[data-type="icon"]')).indexOf(item) === 1)) {
              item.classList.remove('selected');
            }
          });
          document.getElementById(`bookend-image-upload-${position}`).value = '';
          document.getElementById(`bookend-image-upload-${position}`).dataset.imageData = '';
          document.getElementById(`bookend-image-preview-${position}`).innerHTML = '';
          document.getElementById(`bookend-shape-${position}`).value = '';
        }
        
        updatePreview();
        checkForUnsavedChanges();
      });
    }
  });

  // Shape select handlers
  ['left', 'right'].forEach(position => {
    const select = document.getElementById(`bookend-shape-${position}`);
    
    if (select) {
      select.addEventListener('change', () => {
        // Clear other types for this position
        if (select.value) {
          document.querySelectorAll('.decoration-item.selected[data-type="icon"]').forEach(item => {
            if ((position === 'left' && Array.from(document.querySelectorAll('.decoration-item.selected[data-type="icon"]')).indexOf(item) === 0) ||
                (position === 'right' && Array.from(document.querySelectorAll('.decoration-item.selected[data-type="icon"]')).indexOf(item) === 1)) {
              item.classList.remove('selected');
            }
          });
          document.getElementById(`bookend-image-upload-${position}`).value = '';
          document.getElementById(`bookend-image-upload-${position}`).dataset.imageData = '';
          document.getElementById(`bookend-image-preview-${position}`).innerHTML = '';
          document.getElementById(`bookend-text-${position}`).value = '';
          document.getElementById(`text-preview-${position}`).textContent = '';
        }
        
        updatePreview();
        checkForUnsavedChanges();
      });
    }
  });

  // Bookend background settings
  const showBgCheckbox = document.getElementById('bookend-show-background');
  const bgColorPicker = document.getElementById('bookend-bg-color');
  const bgOpacitySlider = document.getElementById('bookend-bg-opacity');
  const opacityValue = document.getElementById('bookend-opacity-value');
  
  if (showBgCheckbox) {
    showBgCheckbox.addEventListener('change', () => {
      updatePreview();
      checkForUnsavedChanges();
    });
  }
  
  if (bgColorPicker) {
    bgColorPicker.addEventListener('input', () => {
      updatePreview();
      checkForUnsavedChanges();
    });
  }
  
  if (bgOpacitySlider && opacityValue) {
    bgOpacitySlider.addEventListener('input', () => {
      opacityValue.textContent = bgOpacitySlider.value;
      updatePreview();
      checkForUnsavedChanges();
    });
  }

  // Save button - save settings and redirect to shelf
  const saveBtn = document.getElementById('save-settings-btn');
  if (saveBtn) {
    // Ensure button is always clickable
    saveBtn.style.pointerEvents = 'auto';
    saveBtn.style.cursor = 'pointer';
    saveBtn.disabled = false;
    
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        // Save book order if it was rearranged
        if (tempBookOrder !== null && tempBookOrder.length > 0) {
          const shelves = JSON.parse(localStorage.getItem('shelves')) || [];
          const currentShelfId = localStorage.getItem('currentShelfId');
          
          if (currentShelfId && shelves.length > 0) {
            const shelfIndex = shelves.findIndex(s => s.id.toString() === currentShelfId);
            if (shelfIndex !== -1) {
              const currentShelf = migrateShelfToRowsForSettings(shelves[shelfIndex]);
              
              // Reorder books based on tempBookOrder
              const reorderedBooks = tempBookOrder.map(item => item.book);
              
              // Redistribute into rows (5 books per row)
              const rows = [];
              const booksPerRow = 5;
              
              for (let i = 0; i < reorderedBooks.length; i += booksPerRow) {
                rows.push({
                  id: rows.length + 1,
                  books: reorderedBooks.slice(i, i + booksPerRow)
                });
              }
              
              // If no books, keep at least one empty row
              if (rows.length === 0) {
                rows.push({
                  id: 1,
                  books: []
                });
              }
              
              currentShelf.rows = rows;
              currentShelf.books = reorderedBooks; // Sync for backward compatibility
              shelves[shelfIndex] = currentShelf;
              localStorage.setItem('shelves', JSON.stringify(shelves));
              
              // Sync with legacy myShelf
              localStorage.setItem('myShelf', JSON.stringify(reorderedBooks));
            }
          }
          
          // Reset temp order
          tempBookOrder = null;
          window.tempBookOrder = null;
        }
        
        saveSettingsToStorage();
        alert('Settings saved successfully!');
        window.location.href = 'shelf.html';
      } catch (error) {
        console.error('Error saving settings:', error);
        // Provide more specific error message
        let errorMessage = 'Error saving settings. Please try again.';
        if (error.message && error.message.includes('quota')) {
          errorMessage = error.message;
        } else if (error.name === 'QuotaExceededError' || error.code === 22) {
          errorMessage = 'Storage quota exceeded. The image file is too large. Please try a smaller image (under 1MB recommended) or remove other data from your browser storage.';
        }
        alert(errorMessage);
      }
    });
  }

  // Discard button - revert to original settings
  const discardBtn = document.getElementById('discard-settings-btn');
  if (discardBtn) {
    discardBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to discard all changes?')) {
        discardSettings();
        // Reset temp book order
        tempBookOrder = null;
        window.tempBookOrder = null;
        loadSlottedBooks();
        hasUnsavedChanges = false;
      }
    });
  }

  // Warn before leaving page with unsaved changes
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires returnValue
      return ''; // Some browsers require return
    }
  });

  // Intercept internal navigation (header links, etc.)
  document.querySelectorAll('header a, nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (hasUnsavedChanges) {
        if (!confirm('You have unsaved changes. Are you sure you want to leave? Your changes will be lost.')) {
          e.preventDefault();
          return false;
        }
      }
    });
  });
}

// Make markSettingsAsSaved available globally
window.markSettingsAsSaved = markSettingsAsSaved;

// Run when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSettings);
} else {
  initSettings();
}

