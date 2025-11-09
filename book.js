// Get the saved book data from localStorage
const book = JSON.parse(localStorage.getItem('selectedBook'));

if (book) {
  document.getElementById('bookImage').src = book.image;
  document.getElementById('bookTitle').textContent = book.title;
  document.getElementById('bookAuthor').textContent = book.author || "Unknown Author";
  document.getElementById('bookDescription').textContent = book.description || "No description available.";
} else {
  document.querySelector('.book-info').innerHTML = "<p>Book details not found.</p>";
}
