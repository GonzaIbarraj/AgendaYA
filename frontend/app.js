// Lógica del Frontend Mínimo con almacenamiento local de usuarios

const usersDb = [
  { email: "pepelopez@gmail.com", password: "ClaveValida123!", name: "Pepe López" }
];

document.addEventListener("DOMContentLoaded", () => {
  const registerView = document.getElementById("register-view");
  const loginView = document.getElementById("login-view");
  const dashboardView = document.getElementById("dashboard-view");

  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");

  const registerError = document.getElementById("register-error");
  const registerSuccess = document.getElementById("register-success");
  const loginError = document.getElementById("login-error");

  const gotoLogin = document.getElementById("goto-login");
  const gotoRegister = document.getElementById("goto-register");
  const logoutBtn = document.getElementById("logout-btn");
  const welcomeTitle = document.getElementById("welcome-title");

  // Navegación entre vistas
  gotoLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    showView("login");
  });

  gotoRegister?.addEventListener("click", (e) => {
    e.preventDefault();
    showView("register");
  });

  logoutBtn?.addEventListener("click", () => {
    showView("login");
  });

  function showView(viewName) {
    registerView.classList.add("hidden");
    loginView.classList.add("hidden");
    dashboardView.classList.add("hidden");

    registerError.classList.add("hidden");
    registerSuccess.classList.add("hidden");
    loginError.classList.add("hidden");

    if (viewName === "register") registerView.classList.remove("hidden");
    if (viewName === "login") loginView.classList.remove("hidden");
    if (viewName === "dashboard") dashboardView.classList.remove("hidden");
  }

  // Manejo de Registro
  registerForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    registerError.classList.add("hidden");
    registerSuccess.classList.add("hidden");

    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-confirm-password").value;

    if (!email || !password || !confirmPassword) {
      showError(registerError, "Por favor complete todos los campos obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      showError(registerError, "Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      showError(registerError, "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    const existingUser = usersDb.find((u) => u.email === email);
    if (existingUser) {
      showError(registerError, "Este correo ya está registrado");
      return;
    }

    usersDb.push({ email, password, name: email.split("@")[0] });
    registerSuccess.textContent = "Registro completado exitosamente. Por favor inicia sesión.";
    registerSuccess.classList.remove("hidden");
    registerForm.reset();
  });

  // Manejo de Login
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    loginError.classList.add("hidden");

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const user = usersDb.find((u) => u.email === email && u.password === password);

    if (!user) {
      showError(loginError, "Usuario o contraseña incorrectos");
      return;
    }

    welcomeTitle.textContent = `Bienvenido, ${user.name || "Usuario"}`;
    showView("dashboard");
    loginForm.reset();
  });

  function showError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
  }
});
