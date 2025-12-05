// User Menu JavaScript - Load user info and handle sign out

// Load user email on page load
function loadUserInfo() {
  const userEmail = localStorage.getItem('userEmail') || 'Guest';

  // Load personal user data from localStorage
  const userDataKey = `userData-${userEmail}`;
  let userData = JSON.parse(localStorage.getItem(userDataKey)) || {
    email: userEmail,
    name: "New User",
    bio: "No bio yet...",
  };

  // Save back (ensures structure exists)
  localStorage.setItem(userDataKey, JSON.stringify(userData));

  // Update UI
  const userEmailElements = document.querySelectorAll('#user-email');
  userEmailElements.forEach(el => el.textContent = userData.email);

  const nameEl = document.getElementById("account-name");
  const bioEl = document.getElementById("account-bio");

  if (nameEl) nameEl.textContent = userData.name;
  if (bioEl) bioEl.textContent = userData.bio;
}

function saveAccountChanges() {
  const userEmail = localStorage.getItem('userEmail');
  const userDataKey = `userData-${userEmail}`;

  let userData = JSON.parse(localStorage.getItem(userDataKey)) || {};

  userData.name = document.getElementById("account-name-input").value;
  userData.bio = document.getElementById("account-bio-input").value;

  localStorage.setItem(userDataKey, JSON.stringify(userData));

  alert("Profile updated!");
}


// Sign out function
function signOut() {
  // DO NOT delete userData-email files
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userEmail');

  window.location.href = 'index.html';
}


// Initialize user info when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadUserInfo);
} else {
  loadUserInfo();
}

// Make signOut available globally
window.signOut = signOut;

