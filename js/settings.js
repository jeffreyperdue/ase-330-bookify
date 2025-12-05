// SETTINGS.JS

// Load saved theme
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");

  // Apply previous setting
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    }
  });
});

// Redirect function for user dropdown
function goToSettings() {
  window.location.href = "settings.html";
}

/* -----------------------
   CHANGE EMAIL
------------------------ */

function openEmailChange() {
  document.getElementById("email-modal").classList.remove("hidden");
}

function closeEmailChange() {
  document.getElementById("email-modal").classList.add("hidden");
}

// Save New Email
function saveEmail() {
  const newEmail = document.getElementById("new-email").value.trim();

  if (!newEmail) {
    alert("Please enter a valid email.");
    return;
  }

  localStorage.setItem("userEmail", newEmail);

  alert("Email updated!");
  closeEmailChange();
  location.reload();
}

/* -----------------------
   DELETE ACCOUNT
------------------------ */

function deleteAccount() {
  const confirmDelete = confirm(
    "Are you sure you want to permanently delete your account? This cannot be undone."
  );

  if (confirmDelete) {
    localStorage.clear();
    window.location.href = "index.html";
  }
}

function openEmailModal() {
  document.getElementById("email-modal").classList.remove("hidden");
}

function closeEmailModal() {
  document.getElementById("email-modal").classList.add("hidden");
}

function saveEmail() {
  const newEmail = document.getElementById("new-email").value.trim();
  if (!newEmail) return;

  // Save the email
  localStorage.setItem("userEmail", newEmail);

  // Update header dropdown
  const emailElements = document.querySelectorAll("#user-email");
  emailElements.forEach(el => el.textContent = newEmail);

  closeEmailModal();
}

