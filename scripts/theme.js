// ============================================================
// theme.js - საერთო ფუნქციები ყველა გვერდისთვის
// theme toggle, burger menu, auth state check
// ============================================================

const BASE_URL = "https://railway.stepprojects.ge/api";
const AUTH_URL = "https://rentcar.stepprojects.ge/api";

// --- THEME TOGGLE ---
const themeBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
htmlEl.setAttribute("data-theme", savedTheme);
themeIcon.textContent = savedTheme === "dark" ? "☀️" : "🌙";

themeBtn.addEventListener("click", () => {
  const current = htmlEl.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  htmlEl.setAttribute("data-theme", next);
  themeIcon.textContent = next === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", next);
});

// --- BURGER MENU ---
const burgerBtn = document.getElementById("burgerBtn");
const mobileNav = document.getElementById("mobileNav");

burgerBtn.addEventListener("click", () => {
  mobileNav.classList.toggle("open");
});

document.querySelectorAll(".mob-link").forEach((link) => {
  link.addEventListener("click", () => mobileNav.classList.remove("open"));
});

// --- AUTH STATE (გვერდებზე სადაც userInfo/guestBtns არის) ---
function checkAuthState() {
  const token = localStorage.getItem("authToken");
  const name = localStorage.getItem("userName");
  const userInfo = document.getElementById("userInfo");
  const guestBtns = document.getElementById("guestBtns");
  const welcomeMsg = document.getElementById("welcomeMsg");

  if (!userInfo) return; // 404 გვერდზე არ არის

  if (token) {
    userInfo.classList.remove("hidden");
    if (guestBtns) guestBtns.classList.add("hidden");
    if (welcomeMsg) welcomeMsg.textContent = name || "მომხმარებელი";
  } else {
    userInfo.classList.add("hidden");
    if (guestBtns) guestBtns.classList.remove("hidden");
  }
}

checkAuthState();

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    window.location.href = "../pages/index.html";
  });
}

// --- HELPER: შეტყობინება ---
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `auth-msg ${type}`;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 4000);
}

export { BASE_URL, AUTH_URL, showMsg };
