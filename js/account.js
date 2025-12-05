let currentField = "";
let currentEmail = localStorage.getItem("userEmail") || "Unknown";

// Load all info on page load
document.addEventListener("DOMContentLoaded", () => {
  loadAccountData();
});

// Load name, bio, email
function loadAccountData() {
  document.getElementById("display-email").textContent = currentEmail;

  const userKey = `userData_${currentEmail}`;
  const stored = JSON.parse(localStorage.getItem(userKey)) || {};

  document.getElementById("display-name").textContent = stored.name || "No name set";
  document.getElementById("display-bio").textContent = stored.bio || "No bio set";
}

// Start editing name OR bio
function editField(field) {
  currentField = field;

  const input = document.getElementById("edit-input");
  const textarea = document.getElementById("edit-textarea");
  const editSection = document.getElementById("edit-section");
  const editTitle = document.getElementById("edit-title");

  const stored = JSON.parse(localStorage.getItem(`userData_${currentEmail}`)) || {};

  editSection.classList.remove("hidden");

  if (field === "name") {
    editTitle.textContent = "Edit Name";
    input.value = stored.name || "";
    input.style.display = "block";
    textarea.style.display = "none";
  } 
  else if (field === "bio") {
    editTitle.textContent = "Edit Bio";
    textarea.value = stored.bio || "";
    input.style.display = "none";
    textarea.style.display = "block";
  }
}

// Save changes
function saveChanges() {
  const input = document.getElementById("edit-input");
  const textarea = document.getElementById("edit-textarea");

  const userKey = `userData_${currentEmail}`;
  const stored = JSON.parse(localStorage.getItem(userKey)) || {};

  if (currentField === "name") {
    stored.name = input.value;
  }
  else if (currentField === "bio") {
    stored.bio = textarea.value;
  }

  localStorage.setItem(userKey, JSON.stringify(stored));

  loadAccountData();
  cancelEdit();
}

// Cancel editing
function cancelEdit() {
  document.getElementById("edit-section").classList.add("hidden");
}

function goToSettings() {
  window.location.href = "settings.html";
}
