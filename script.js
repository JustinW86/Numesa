// Fixed login: username = Ouboet, password = Ouboet

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
  
    if (user === "Ouboet" && pass === "Ouboet") {
      localStorage.setItem("oubkluis_user", user);
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("loginMessage").textContent = "❌ Incorrect login.";
    }
  });
  