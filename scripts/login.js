// ============================================================
// login.js - შესვლა და რეგისტრაცია
// გვერდი: pages/login.html
// ============================================================
import { AUTH_URL, showMsg } from "./theme.js";

// --- TAB გადართვა ---
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

function showTab(tab) {
  if (tab === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
  } else {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
  }
}

tabLogin.addEventListener("click", () => showTab("login"));
tabRegister.addEventListener("click", () => showTab("register"));

document.getElementById("goToRegister").addEventListener("click", (e) => {
  e.preventDefault();
  showTab("register");
});

document.getElementById("goToLogin").addEventListener("click", (e) => {
  e.preventDefault();
  showTab("login");
});

// URL-ში ?tab=register - register ტაბი გაიხსნება
if (new URLSearchParams(window.location.search).get("tab") === "register") {
  showTab("register");
}

// --- REGISTER - POST /api/Users/register ---
document
  .getElementById("registerSubmitBtn")
  .addEventListener("click", async () => {
    const msgEl = document.getElementById("registerMsg");
    const firstName = document.getElementById("reg-name").value.trim();
    const lastName = document.getElementById("reg-surname").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    if (!firstName || !lastName || !email || !password) {
      showMsg(msgEl, "ყველა ველი შეავსეთ", "error");
      return;
    }

    if (password.length < 6) {
      showMsg(msgEl, "პაროლი მინ. 6 სიმბოლო", "error");
      return;
    }

    try {
      const resp = await fetch(`${AUTH_URL}/Users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phoneNumber: "",
          role: "User",
        }),
      });

      const text = await resp.text();

      if (resp.ok) {
        showMsg(msgEl, "რეგისტრაცია წარმატებულია! შედით ანგარიშში.", "success");
        setTimeout(() => showTab("login"), 1500);
      } else {
        showMsg(msgEl, text || "შეცდომა, სცადეთ თავიდან", "error");
      }
    } catch (err) {
      showMsg(msgEl, `კავშირის შეცდომა: ${err.message}`, "error");
    }
  });

// --- LOGIN - POST /api/Users/login ---
document
  .getElementById("loginSubmitBtn")
  .addEventListener("click", async () => {
    const msgEl = document.getElementById("loginMsg");
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
      showMsg(msgEl, "ელ-ფოსტა და პაროლი შეავსეთ", "error");
      return;
    }

    try {
      const resp = await fetch(`${AUTH_URL}/Users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          phoneNumber: "",
          firstName: "",
          lastName: "",
          role: "",
        }),
      });

      const data = await resp.json();

      if (resp.ok) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userName", data.firstName || email.split("@")[0]);
        showMsg(msgEl, "წარმატებით შეხვედით!", "success");
        setTimeout(() => {
          window.location.href = "../pages/index.html";
        }, 1000);
      } else {
        showMsg(msgEl, data.message || "არასწორი ელ-ფოსტა ან პაროლი", "error");
      }
    } catch (err) {
      showMsg(msgEl, `კავშირის შეცდომა: ${err.message}`, "error");
    }
  });
