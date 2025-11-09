const bookData = {
  suggested: [
    { title: "The Midnight Library", img: "https://covers.openlibrary.org/b/id/10556125-L.jpg" },
    { title: "Project Hail Mary", img: "https://covers.openlibrary.org/b/id/10958365-L.jpg" },
    { title: "The Song of Achilles", img: "https://covers.openlibrary.org/b/id/8275261-L.jpg" },
    { title: "Dune", img: "https://covers.openlibrary.org/b/id/8108694-L.jpg" },
    { title: "Circe", img: "https://covers.openlibrary.org/b/id/8942926-L.jpg" },
    { title: "The Silent Patient", img: "https://covers.openlibrary.org/b/id/8944288-L.jpg" },
    { title: "Addie LaRue", img: "https://covers.openlibrary.org/b/id/10317549-L.jpg" },
    { title: "A Man Called Ove", img: "https://covers.openlibrary.org/b/id/8228696-L.jpg" }
  ],
  fantasy: [
    { title: "A Court of Thorns and Roses", img: "https://covers.openlibrary.org/b/id/10194747-L.jpg" },
    { title: "The Hobbit", img: "https://covers.openlibrary.org/b/id/6979861-L.jpg" },
    { title: "Throne of Glass", img: "https://covers.openlibrary.org/b/id/8235115-L.jpg" },
    { title: "The Name of the Wind", img: "https://covers.openlibrary.org/b/id/240726-L.jpg" },
    { title: "Mistborn", img: "https://covers.openlibrary.org/b/id/8757278-L.jpg" },
    { title: "The Way of Kings", img: "https://covers.openlibrary.org/b/id/7630455-L.jpg" },
    { title: "Six of Crows", img: "https://covers.openlibrary.org/b/id/8375046-L.jpg" },
    { title: "The Priory of the Orange Tree", img: "https://covers.openlibrary.org/b/id/10050659-L.jpg" }
  ],
  horror: [
    { title: "It", img: "https://covers.openlibrary.org/b/id/10540315-L.jpg" },
    { title: "The Shining", img: "https://covers.openlibrary.org/b/id/11162659-L.jpg" },
    { title: "Mexican Gothic", img: "https://covers.openlibrary.org/b/id/10602427-L.jpg" },
    { title: "Bird Box", img: "https://covers.openlibrary.org/b/id/8393986-L.jpg" },
    { title: "Dracula", img: "https://covers.openlibrary.org/b/id/10995125-L.jpg" },
    { title: "Frankenstein", img: "https://covers.openlibrary.org/b/id/11281755-L.jpg" },
    { title: "Coraline", img: "https://covers.openlibrary.org/b/id/9445262-L.jpg" },
    { title: "The Haunting of Hill House", img: "https://covers.openlibrary.org/b/id/8142271-L.jpg" }
  ],
  romance: [
    { title: "Pride and Prejudice", img: "https://covers.openlibrary.org/b/id/8081536-L.jpg" },
    { title: "The Love Hypothesis", img: "https://covers.openlibrary.org/b/id/12687146-L.jpg" },
    { title: "Beach Read", img: "https://covers.openlibrary.org/b/id/10555174-L.jpg" },
    { title: "Twilight", img: "https://covers.openlibrary.org/b/id/7884866-L.jpg" },
    { title: "Me Before You", img: "https://covers.openlibrary.org/b/id/8317743-L.jpg" },
    { title: "The Notebook", img: "https://covers.openlibrary.org/b/id/8223056-L.jpg" },
    { title: "Red, White & Royal Blue", img: "https://covers.openlibrary.org/b/id/9876860-L.jpg" },
    { title: "To All the Boys I've Loved Before", img: "https://covers.openlibrary.org/b/id/8160827-L.jpg" }
  ],
  mystery: [
    { title: "Gone Girl", img: "https://covers.openlibrary.org/b/id/7884972-L.jpg" },
    { title: "The Girl with the Dragon Tattoo", img: "https://covers.openlibrary.org/b/id/8215263-L.jpg" },
    { title: "Big Little Lies", img: "https://covers.openlibrary.org/b/id/8317096-L.jpg" },
    { title: "In the Woods", img: "https://covers.openlibrary.org/b/id/7915984-L.jpg" },
    { title: "Sharp Objects", img: "https://covers.openlibrary.org/b/id/7916039-L.jpg" },
    { title: "The Da Vinci Code", img: "https://covers.openlibrary.org/b/id/8221255-L.jpg" },
    { title: "The Couple Next Door", img: "https://covers.openlibrary.org/b/id/8703735-L.jpg" },
    { title: "The Girl on the Train", img: "https://covers.openlibrary.org/b/id/8226763-L.jpg" }
  ],
  scifi: [
    { title: "Ender's Game", img: "https://covers.openlibrary.org/b/id/8231112-L.jpg" },
    { title: "Neuromancer", img: "https://covers.openlibrary.org/b/id/10935042-L.jpg" },
    { title: "Snow Crash", img: "https://covers.openlibrary.org/b/id/10538634-L.jpg" },
    { title: "Ready Player One", img: "https://covers.openlibrary.org/b/id/8160951-L.jpg" },
    { title: "The Martian", img: "https://covers.openlibrary.org/b/id/8281993-L.jpg" },
    { title: "Hyperion", img: "https://covers.openlibrary.org/b/id/10819545-L.jpg" },
    { title: "Children of Time", img: "https://covers.openlibrary.org/b/id/11235935-L.jpg" },
    { title: "Recursion", img: "https://covers.openlibrary.org/b/id/10226291-L.jpg" }
  ],
  nonfiction: [
    { title: "Educated", img: "https://covers.openlibrary.org/b/id/8955639-L.jpg" },
    { title: "Becoming", img: "https://covers.openlibrary.org/b/id/9131701-L.jpg" },
    { title: "Sapiens", img: "https://covers.openlibrary.org/b/id/8372423-L.jpg" },
    { title: "Atomic Habits", img: "https://covers.openlibrary.org/b/id/9870248-L.jpg" },
    { title: "The Power of Habit", img: "https://covers.openlibrary.org/b/id/8233309-L.jpg" },
    { title: "Can't Hurt Me", img: "https://covers.openlibrary.org/b/id/8719031-L.jpg" },
    { title: "Outliers", img: "https://covers.openlibrary.org/b/id/8232030-L.jpg" },
    { title: "Thinking, Fast and Slow", img: "https://covers.openlibrary.org/b/id/8319695-L.jpg" }
  ]
};

// Render books
Object.keys(bookData).forEach(category => {
  const container = document.getElementById(category);
  if (container) {
    bookData[category].forEach(book => {
      const div = document.createElement("div");
      div.classList.add("book");
      div.innerHTML = `
        <img src="${book.img}" alt="${book.title}">
        <p>${book.title}</p>
      `;

      // 👇 Add click event here
      div.addEventListener('click', () => {
        localStorage.setItem('selectedBook', JSON.stringify(book));
        window.location.href = 'book.html';
      });

      container.appendChild(div);
    });
  }
});


// Scroll functionality
document.querySelectorAll('.row-container').forEach(container => {
  const row = container.querySelector('.book-row');
  const leftBtn = container.querySelector('.scroll-left');
  const rightBtn = container.querySelector('.scroll-right');

  leftBtn.addEventListener('click', () => {
    row.scrollBy({ left: -300, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    row.scrollBy({ left: 300, behavior: 'smooth' });
  });
});

const sidebarButtons = document.querySelectorAll('.sidebar button');
const categories = document.querySelectorAll('.category');

let activeFilters = new Set(); // store selected filters

sidebarButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    // Toggle filter on/off
    if (activeFilters.has(filter)) {
      activeFilters.delete(filter);
      button.classList.remove('active');
    } else {
      activeFilters.add(filter);
      button.classList.add('active');
    }

    // Update visible categories
    if (activeFilters.size === 0) {
      categories.forEach(cat => cat.style.display = 'block'); // show all if no filter
    } else {
      categories.forEach(cat => {
        activeFilters.has(cat.id) ? cat.style.display = 'block' : cat.style.display = 'none';
      });
    }
  });
});

// Example: inside your book row creation
bookData[category].forEach(book => {
  const bookDiv = document.createElement('div');
  bookDiv.classList.add('book');
  bookDiv.innerHTML = `
    <img src="${book.img}" alt="${book.title}">
    <p>${book.title}</p>
  `;


  // 👇 Add this event listener
  bookDiv.addEventListener('click', () => {
    localStorage.setItem('selectedBook', JSON.stringify(book));
    window.location.href = 'book.html';
  });

  row.appendChild(bookDiv);
});


