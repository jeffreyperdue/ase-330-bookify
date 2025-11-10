// User Menu JavaScript - Load user info and handle sign out

// Load user email on page load
function loadUserInfo() {
  const userEmail = localStorage.getItem('userEmail') || 'Guest';
  const userEmailElements = document.querySelectorAll('#user-email');
  
  userEmailElements.forEach(element => {
    if (element) {
      element.textContent = userEmail;
    }
  });
}

// Sign out function
function signOut() {
  // Clear user session data
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userEmail');
  
  // Optionally clear all data or keep shelf data
  // localStorage.clear(); // Uncomment if you want to clear everything
  
  // Redirect to login page
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

