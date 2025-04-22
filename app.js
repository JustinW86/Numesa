function logout() {
    localStorage.removeItem("oubkluis_logged_in");
    window.location.href = "index.html";
  }
  
  function toggleTheme() {
    document.body.classList.toggle("dark-mode");
  }
  
  function loadProjects() {
    return JSON.parse(localStorage.getItem("oubkluis_projects")) || [];
  }
  
  function saveProjects(projects) {
    localStorage.setItem("oubkluis_projects", JSON.stringify(projects));
  }
  
  function renderProjects() {
    const projects = loadProjects();
    const list = document.getElementById("projectList");
    list.innerHTML = "";
    projects.forEach((proj, i) => {
      const div = document.createElement("div");
      div.className = "project-entry";
      div.innerHTML = `
        <strong>${proj.name}</strong>
        <button onclick="selectProject(${i})">Open</button>
        <button class="danger" onclick="deleteProject(${i})">🗑️</button>
      `;
      list.appendChild(div);
    });
  }
  
  function createProject() {
    const name = document.getElementById("projectName").value.trim();
    if (!name) return alert("Enter a name");
    const projects = loadProjects();
    projects.push({ name, pages: [] });
    saveProjects(projects);
    renderProjects();
  }
  
  function renameProject() {
    const i = parseInt(localStorage.getItem("oubkluis_selected_project"));
    const projects = loadProjects();
    const newName = prompt("Rename project:", projects[i].name);
    if (newName) {
      projects[i].name = newName.trim();
      saveProjects(projects);
      renderProjects();
    }
  }
  
  function deleteProject(i) {
    const projects = loadProjects();
    if (confirm("Delete project?")) {
      projects.splice(i, 1);
      saveProjects(projects);
      renderProjects();
    }
  }
  
  function selectProject(i) {
    localStorage.setItem("oubkluis_selected_project", i);
    renderPages();
  }
  
  function renderPages() {
    const i = parseInt(localStorage.getItem("oubkluis_selected_project"));
    const projects = loadProjects();
    const pages = projects[i].pages || [];
    document.getElementById("projectHeader").textContent = `Project: ${projects[i].name}`;
    const list = document.getElementById("pageList");
    list.innerHTML = "";
    pages.forEach((page, j) => {
      const div = document.createElement("div");
      div.className = "page-entry";
      div.innerHTML = `
        ${page.title}
        <button onclick="openPage(${j})">📝 Edit</button>
        <button class="danger" onclick="deletePage(${j})">🗑️</button>
      `;
      list.appendChild(div);
    });
  }
  
  function createPage() {
    const i = parseInt(localStorage.getItem("oubkluis_selected_project"));
    const name = document.getElementById("pageName").value.trim();
    if (!name) return;
    const projects = loadProjects();
    projects[i].pages.push({ title: name, content: "", images: [], lastEdited: new Date().toLocaleString() });
    saveProjects(projects);
    renderPages();
  }
  
  function renamePage() {
    const i = parseInt(localStorage.getItem("oubkluis_selected_project"));
    const projects = loadProjects();
    const pages = projects[i].pages;
    const oldName = prompt("Enter page name to rename:");
    const page = pages.find(p => p.title === oldName);
    if (page) {
      const newName = prompt("New name:", page.title);
      if (newName) {
        page.title = newName.trim();
        saveProjects(projects);
        renderPages();
      }
    }
  }
  
  function deletePage(j) {
    const i = parseInt(localStorage.getItem("oubkluis_selected_project"));
    const projects = loadProjects();
    if (confirm("Delete this page?")) {
      projects[i].pages.splice(j, 1);
      saveProjects(projects);
      renderPages();
    }
  }
  
  function openPage(j) {
    localStorage.setItem("oubkluis_selected_page", j);
    window.location.href = "editor.html";
  }
  
  function backupProjects() {
    const data = localStorage.getItem("oubkluis_projects");
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "oubkluis_backup.json";
    a.click();
  }
  
  function importProjects() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (Array.isArray(data)) {
            saveProjects(data);
            renderProjects();
          }
        } catch {
          alert("Import failed.");
        }
      };
      reader.readAsText(input.files[0]);
    };
    input.click();
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("oubkluis_logged_in")) {
      window.location.href = "index.html";
    }
    renderProjects();
    if (localStorage.getItem("oubkluis_selected_project")) {
      renderPages();
    }
  });
  