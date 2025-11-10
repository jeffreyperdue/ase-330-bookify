
📘 Bookify Digital Prototype Conversion Plan

Goal: Convert paper mockups (Shelf Page and Shelf Settings Page) into functional, static HTML/CSS/JS web pages that demonstrate layout, navigation, and interactivity for usability testing.


---

🧱 1. Project Setup

Folder structure:

bookify-prototype/
├── index.html              # Home redirect or Shelf Page
├── shelf.html              # Shelf Page (main user view)
├── shelf-settings.html     # Shelf customization page
├── /css/
│   ├── style.css
│   └── shelf.css
├── /js/
│   ├── main.js
│   └── shelf.js
└── /assets/
    ├── icons/              # SVG/PNG icons for user, search, add, decorations
    ├── covers/             # Sample book covers
    └── backgrounds/        # Optional shelf textures

Development tools:

Use VS Code Live Server or any local static server.

Frameworks/libraries: None required (pure HTML/CSS/JS).

Use Flexbox and CSS Grid for responsive layout.

Fonts: Inter, Roboto, or similar for readability.



---

🧩 2. Page 1 – Shelf Page (shelf.html)

Purpose

Main user interface showing current bookshelf, navigation, and recommended titles.

Page Structure

<header>
  <h1>Bookify</h1>
  <nav>
    <button class="nav-icon" id="home-btn"></button>
    <button class="nav-icon" id="shelf-btn" aria-current="page"></button>
    <button class="nav-icon" id="search-btn"></button>
    <button class="nav-icon" id="profile-btn"></button>
  </nav>
</header>

<aside>
  <section class="playlist-section">
    <h2>My Shelves</h2>
    <ul>
      <li>Custom Playlist #1</li>
    </ul>
  </section>

  <section class="recommendations">
    <h2>Recommended Books</h2>
    <ul>
      <li>All the Right Reasons</li>
      <li>Donda</li>
    </ul>
  </section>
</aside>

<main class="shelf-display">
  <div class="book-shelf">
    <div class="book-slot"></div>
    <div class="book-slot"></div>
    <div class="book-slot"></div>
  </div>
  <button class="add-book-btn">+</button>
</main>

CSS Layout Plan

Layout Grid:

Sidebar (20–25% width)

Main shelf area (flex container, centered)

Fixed header with icons.


Color & Style:

Neutral palette (white background, soft gray shelf)

Use box-shadow for subtle 3D “shelf” effect.


Book Slots:

.book-slot {
  width: 100px;
  height: 140px;
  background: #e3e3e3;
  border-radius: 6px;
}

Add Book Button: Circular, floating at bottom center:

.add-book-btn {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  border-radius: 50%;
  background-color: #4A7C59;
  color: white;
}


Basic Interactivity (JS)

On clicking “+”, open an alert or modal (e.g., “Add Book Coming Soon”).

On clicking a “Recommended Book”, simulate adding to shelf (append a div dynamically).



---

🎨 3. Page 2 – Shelf Settings (shelf-settings.html)

Purpose

Customization hub for a user’s bookshelf (background, texture, color, decorations).


Page Structure

<header>
  <h1>Bookify | Custom Playlist #1 | Settings</h1>
  <button id="profile-icon"></button>
</header>

<aside>
  <nav>
    <h2>Playlists</h2>
    <ul>
      <li>Custom Playlist #1</li>
    </ul>
  </nav>
</aside>

<main class="settings-content">
  <section class="settings-group">
    <h3>Background</h3>
    <input type="color" id="bg-picker" />
  </section>

  <section class="settings-group">
    <h3>Shelf Texture</h3>
    <div class="texture-options">
      <div class="texture" data-texture="wood"></div>
      <div class="texture" data-texture="glass"></div>
      <div class="texture" data-texture="stone"></div>
    </div>
  </section>

  <section class="settings-group">
    <h3>Decorations</h3>
    <div class="decoration-grid">
      <img src="assets/icons/decor1.png" alt="plant" />
      <img src="assets/icons/decor2.png" alt="lamp" />
      <img src="assets/icons/decor3.png" alt="poster" />
    </div>
  </section>
</main>

CSS Layout Plan

Two-column layout: sidebar for navigation, main for content.

Use grid for decoration icons:

.decoration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 1rem;
}

Keep whitespace and alignment clean for “aesthetic minimalism.”


Basic Interactivity (JS)

Clicking a texture or color preview should visually apply the change to a demo shelf element (in the DOM).

Example:

document.querySelectorAll('.texture').forEach(tex => {
  tex.addEventListener('click', e => {
    document.body.style.backgroundImage = `url('assets/backgrounds/${tex.dataset.texture}.jpg')`;
  });
});



---

🔄 4. Navigation Flow

From	To	Trigger

Shelf Page	Shelf Settings	Click “settings” or profile icon
Shelf Settings	Shelf Page	Browser back or “Bookify” logo
Home Page (future)	Shelf Page	After login simulation
Shelf Page	Add Book Modal	Click “+” button


Implementation:
Use simple <a href="shelf-settings.html"> links or JS window.location.href for transitions.


---

🧠 5. Accessibility & Usability

Include aria-labels for all icon-only buttons.

Ensure tab navigation works naturally.

Maintain color contrast ratio > 4.5:1.

Use tooltips or title attributes for unclear icons (like decorations).



---

⚙️ 6. Optional Enhancements (Stretch Goals)

Feature	Description	Implementation

Add-to-Shelf Animation	Animate new book sliding into shelf	CSS transition + JS append
Theme Preview	Live preview area on Settings page	Create div with .shelf-preview
Persistent Settings	Save selected colors in localStorage	JS localStorage.setItem
Responsive Layout	Adapt shelf grid for mobile	@media (max-width: 600px)



---

🧭 7. Development Roadmap

Phase	Task	Deliverable

1	Build HTML skeleton for both pages	Static structure completed
2	Apply layout & style with CSS grid/flexbox	Shelf visual + sidebar alignment
3	Add JS interactivity (navigation, simulated actions)	Buttons and dynamic updates
4	Test usability and responsiveness	Works smoothly at 1080p and mobile
5	Polish visuals (fonts, icons, shadows)	Final presentation prototype



---

✅ 8. Testing Checklist

[ ] All navigation links functional.

[ ] “Add Book” button triggers visible response.

[ ] Shelf Settings changes affect preview.

[ ] All images load from /assets/.

[ ] Layout remains consistent on different screen sizes.
