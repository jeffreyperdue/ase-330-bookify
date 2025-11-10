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
} else {
  document.querySelector('.book-detail-container').innerHTML = `
    <p style="text-align:center; font-size:1.5rem; margin-top:100px;">
      No book selected. Please return to <a href="home.html" style="color:#a00;">Home</a>.
    </p>
  `;
}

// Functional "Add to MyShelf" button
document.querySelector('.add-shelf-btn').addEventListener('click', () => {
  if (!book) {
    alert('No book selected');
    return;
  }
  
  // Get existing shelf or initialize empty array
  let myShelf = JSON.parse(localStorage.getItem('myShelf')) || [];
  
  // Check if book is already on shelf (prevent duplicates)
  const existingBook = myShelf.find(b => b.title === book.title);
  if (existingBook) {
    alert(`${book.title} is already on your shelf!`);
    return;
  }
  
  // Add book to shelf
  myShelf.push(book);
  localStorage.setItem('myShelf', JSON.stringify(myShelf));
  
  // Show confirmation and redirect to shelf page
  alert(`${book.title} has been added to your shelf!`);
  window.location.href = 'shelf.html';
});
