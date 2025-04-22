// Authentication gate
const user = localStorage.getItem("oubkluis_user");
const pass = localStorage.getItem("oubkluis_pass");
if (!user || !pass) {
  window.location.href = "index.html";
}

// Elements
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const togglePreview = document.getElementById("togglePreview");
const imageUpload = document.getElementById("imageUpload");
const imageGallery = document.getElementById("imageGallery");
const pageTitleInput = document.getElementById("pageTitle");
const logoutBtn = document.getElementById("logoutBtn");

// Load session
const savedContent = localStorage.getItem("oubkluis_currentContent") || "";
const savedTitle = localStorage.getItem("oubkluis_currentTitle") || "Untitled Page";
const savedImages = JSON.parse(localStorage.getItem("oubkluis_currentImages") || "[]");

editor.value = savedContent;
pageTitleInput.value = savedTitle;
renderPreview();
renderImageGallery(savedImages);

// Save content as user types
editor.addEventListener("input", () => {
  localStorage.setItem("oubkluis_currentContent", editor.value);
  renderPreview();
});

// Save title
pageTitleInput.addEventListener("input", () => {
  localStorage.setItem("oubkluis_currentTitle", pageTitleInput.value);
});

// Live Preview toggle
togglePreview.addEventListener("change", () => {
  preview.style.display = togglePreview.checked ? "block" : "none";
});

// Render Markdown
function renderPreview() {
  const raw = editor.value;
  preview.innerHTML = marked.parse(raw);
}

// Upload Images
imageUpload.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  const updated = [...savedImages];

  for (let file of files) {
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large (max 5MB).`);
      continue;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updated.push(reader.result);
      localStorage.setItem("oubkluis_currentImages", JSON.stringify(updated));
      renderImageGallery(updated);
    };
    reader.readAsDataURL(file);
  }
});

// Render uploaded images
function renderImageGallery(images) {
  imageGallery.innerHTML = "";
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.title = `Image ${i + 1}`;
    img.className = "gallery-thumb";
    imageGallery.appendChild(img);
  });
}

// Logout
logoutBtn.addEventListener("click", () => {
  if (confirm("Log out of Ouboets Writing App?")) {
    localStorage.removeItem("oubkluis_user");
    localStorage.removeItem("oubkluis_pass");
    window.location.href = "index.html";
  }
});
