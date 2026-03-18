// ============================================================
// BASE URL - ერთ ადგილას, მარტივად შეიცვლება
// ============================================================
const BASE_URL = "https://railway.stepprojects.ge/api";
const AUTH_URL = "https://rentcar.stepprojects.ge/api"; // auth API

// ============================================================
// THEME TOGGLE - dark / light
// ============================================================
const themeBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");
const htmlEl = document.documentElement; // <html> ელემენტი

// localStorage-დან ვკითხულობთ შენახულ theme-ს (თუ მომხმარებელი ადრე ირჩია)
const savedTheme = localStorage.getItem("theme") || "light";
htmlEl.setAttribute("data-theme", savedTheme);
themeIcon.textContent = savedTheme === "dark" ? "☀️" : "🌙";

themeBtn.addEventListener("click", () => {
  // მიმდინარე theme-ს ვიღებთ და ვაბრუნებთ
  const current = htmlEl.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";

  htmlEl.setAttribute("data-theme", next); // html ატრიბუტი - CSS იყენებს
  themeIcon.textContent = next === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", next); // ვინახავთ - გვახსოვს გადატვირთვისას
});

// ============================================================
// BURGER MENU - მობილური ნავიგაცია
// ============================================================
const burgerBtn = document.getElementById("burgerBtn");
const mobileNav = document.getElementById("mobileNav");

burgerBtn.addEventListener("click", () => {
  mobileNav.classList.toggle("open"); // .open კლასი CSS-ში display:flex-ს ამატებს
});

// მობილური ლინკზე კლიკი - მენიუ იხურება
document.querySelectorAll(".mob-link").forEach((link) => {
  link.addEventListener("click", () => mobileNav.classList.remove("open"));
});

// ============================================================
// AUTH MODAL - modal-ის გახსნა/დახურვა
// ============================================================
const authModal = document.getElementById("authModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const openLoginBtn = document.getElementById("openLoginBtn");
const openRegBtn = document.getElementById("openRegisterBtn");
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// modal გახსნის ფუნქცია - რომელი ტაბი გამოჩნდეს
function openModal(tab = "login") {
  authModal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // სქროლი block-ავს modal ღიაა
  showTab(tab);
}

function closeModal() {
  authModal.classList.add("hidden");
  document.body.style.overflow = "";
}

// ტაბ გადამრთველი
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

openLoginBtn.addEventListener("click", () => openModal("login"));
openRegBtn && openRegBtn.addEventListener("click", () => openModal("register"));
closeModalBtn.addEventListener("click", closeModal);
tabLogin.addEventListener("click", () => showTab("login"));
tabRegister.addEventListener("click", () => showTab("register"));

// overlay-ზე კლიკი - modal იხურება
authModal.addEventListener("click", (e) => {
  if (e.target === authModal) closeModal();
});

// ============================================================
// AUTH STATE - logged in / guest UI
// ============================================================
const guestBtns = document.getElementById("guestBtns");
const userInfo = document.getElementById("userInfo");
const welcomeMsg = document.getElementById("welcomeMsg");
const logoutBtn = document.getElementById("logoutBtn");

// localStorage-ში თუ token შენახულია - შესულ მდგომარეობაში ვართ
function checkAuthState() {
  const token = localStorage.getItem("authToken");
  const name = localStorage.getItem("userName");

  if (token) {
    // შესული ვართ - user info ვაჩვენებთ
    guestBtns.classList.add("hidden");
    userInfo.classList.remove("hidden");
    welcomeMsg.textContent = `${name || "მომხმარებელი"}`;
  } else {
    // სტუმარი ვართ
    guestBtns.classList.remove("hidden");
    userInfo.classList.add("hidden");
  }
}

// გასვლა - token-ს ვშლით
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userName");
  checkAuthState();
});

// პირველადი შემოწმება
checkAuthState();

// ============================================================
// REGISTER - POST /api/Users/register
// body: { firstName, lastName, email, phoneNumber, password, role }
// ============================================================
document
  .getElementById("registerSubmitBtn")
  .addEventListener("click", async () => {
    const msgEl = document.getElementById("registerMsg");
    const firstName = document.getElementById("reg-name").value.trim();
    const lastName = document.getElementById("reg-surname").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    if (!firstName || !lastName || !email || !password) {
      showMsg(msgEl, "❌ ყველა ველი შეავსეთ", "error");
      return;
    }

    if (password.length < 6) {
      showMsg(msgEl, "❌ პაროლი მინ. 6 სიმბოლო", "error");
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

      // API text/plain აბრუნებს, არა JSON
      const text = await resp.text();

      if (resp.ok) {
        showMsg(msgEl, "რეგისტრაცია წარმატებულია! შედით ანგარიშში.", "success");
        setTimeout(() => showTab("login"), 1500);
      } else {
        showMsg(msgEl, `❌ ${text || "შეცდომა, სცადეთ თავიდან"}`, "error");
      }
    } catch (err) {
      showMsg(msgEl, `❌ კავშირის შეცდომა: ${err.message}`, "error");
    }
  });

// ============================================================
// LOGIN - POST /api/Users/login
// body: { email, password, phoneNumber, firstName, lastName, role }
// response: { token, firstName, lastName, email, phoneNumber, role }
// ============================================================
document
  .getElementById("loginSubmitBtn")
  .addEventListener("click", async () => {
    const msgEl = document.getElementById("loginMsg");
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
      showMsg(msgEl, "❌ ელ-ფოსტა და პაროლი შეავსეთ", "error");
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
        // token და სახელი ვინახავთ localStorage-ში
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userName", data.firstName || email.split("@")[0]);

        showMsg(msgEl, "წარმატებით შეხვედით!", "success");

        setTimeout(() => {
          closeModal();
          checkAuthState();
        }, 1000);
      } else {
        showMsg(
          msgEl,
          `❌ ${data.message || "არასწორი ელ-ფოსტა ან პაროლი"}`,
          "error",
        );
      }
    } catch (err) {
      showMsg(msgEl, `❌ კავშირის შეცდომა: ${err.message}`, "error");
    }
  });

// ============================================================
// STATIONS - GET
// ============================================================

// სადგურების card-ებად ჩვენება
function showStations(list) {
  const div = document.querySelector(".stations");
  div.innerHTML = "";

  if (!list || list.length === 0) {
    div.innerHTML = "<p>სადგური ვერ მოიძებნა</p>";
    return;
  }

  list.forEach((station) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>${station.name}</h3>
      <p>სადგური №${station.stationNumber}</p>
    `;
    div.appendChild(card);
  });
}

// GET სადგურები
async function getStations() {
  try {
    const resp = await fetch(`${BASE_URL}/stations`);
    const data = await resp.json();
    showStations(data);
  } catch (err) {
    document.querySelector(".stations").innerHTML =
      `<p style="color:red;">შეცდომა: ${err.message}</p>`;
  }
}

getStations();

// სადგურების dropdown ძებნა
const stationInput = document.getElementById("stationFilter");
const stationDropdown = document.getElementById("stationDropdown");

stationInput.addEventListener("input", async () => {
  const kw = stationInput.value.trim().toLowerCase();

  if (kw.length < 2) {
    stationDropdown.style.display = "none";
    return;
  }

  try {
    const resp = await fetch(`${BASE_URL}/stations`);
    const data = await resp.json();

    const filtered = data.filter((s) => s.name.toLowerCase().includes(kw));
    stationDropdown.innerHTML = "";

    if (!filtered.length) {
      stationDropdown.style.display = "none";
      return;
    }

    filtered.forEach((station) => {
      const opt = document.createElement("p");
      opt.textContent = `${station.name} (№${station.stationNumber})`;
      opt.addEventListener("click", () => {
        showStations([station]);
        stationInput.value = station.name;
        stationDropdown.style.display = "none";
      });
      stationDropdown.appendChild(opt);
    });

    stationDropdown.style.display = "block";
  } catch {
    stationDropdown.style.display = "none";
  }
});

// ============================================================
// DEPARTURES - GET
// ============================================================

// გამგზავრებების ჩვენება
function showDepartures(list) {
  const div = document.querySelector(".departures");
  div.innerHTML = "";

  if (!list || list.length === 0) {
    div.innerHTML = "<p>გამგზავრება ვერ მოიძებნა</p>";
    return;
  }

  list.forEach((dep) => {
    // სათაური
    const depCard = document.createElement("div");
    depCard.classList.add("card");
    depCard.innerHTML = `
      <h3>${dep.source} → ${dep.destination}</h3>
      <p>${dep.date}</p>
    `;
    div.appendChild(depCard);

    // ამ გამგზავრების მატარებლები - ქვე-ბარათებად
    if (dep.trains?.length) {
      dep.trains.forEach((train) => {
        const tCard = document.createElement("div");
        tCard.classList.add("card", "trainCard");
        tCard.innerHTML = `
          <h4>მატ. #${train.number} — ${train.name}</h4>
          <p>გამგზ: ${train.departure} | ჩამ: ${train.arrive}</p>
        `;
        div.appendChild(tCard);
      });
    }
  });
}

// GET გამგზავრებები
async function getDepartures() {
  try {
    const resp = await fetch(`${BASE_URL}/departures`);
    const data = await resp.json();
    showDepartures(data);
  } catch (err) {
    document.querySelector(".departures").innerHTML =
      `<p style="color:red;">შეცდომა: ${err.message}</p>`;
  }
}

getDepartures();

// Dropdown ძებნა
const depInput = document.getElementById("departureFilter");
const depDropdown = document.getElementById("departureDropdown");

depInput.addEventListener("input", async () => {
  const kw = depInput.value.trim().toLowerCase();
  if (kw.length < 2) {
    depDropdown.style.display = "none";
    return;
  }

  try {
    const resp = await fetch(`${BASE_URL}/departures`);
    const data = await resp.json();
    const filtered = data.filter((d) =>
      d.destination.toLowerCase().includes(kw),
    );

    depDropdown.innerHTML = "";
    if (!filtered.length) {
      depDropdown.style.display = "none";
      return;
    }

    filtered.forEach((dep) => {
      const opt = document.createElement("p");
      opt.textContent = `${dep.source} → ${dep.destination} (${dep.date})`;
      opt.addEventListener("click", () => {
        showDepartures([dep]);
        depInput.value = opt.textContent;
        depDropdown.style.display = "none";
      });
      depDropdown.appendChild(opt);
    });

    depDropdown.style.display = "block";
  } catch {
    depDropdown.style.display = "none";
  }
});

// ფილტრის ღილაკი (search.png icon)
document
  .getElementById("filterDepartureBtn")
  .addEventListener("click", async () => {
    const kw = depInput.value.trim().toLowerCase();
    try {
      const resp = await fetch(`${BASE_URL}/departures`);
      const data = await resp.json();
      const filtered = kw
        ? data.filter((d) => d.destination.toLowerCase().includes(kw))
        : data;
      showDepartures(filtered);
      depDropdown.style.display = "none";
    } catch (err) {
      document.querySelector(".departures").innerHTML =
        `<p style="color:red;">შეცდომა: ${err.message}</p>`;
    }
  });

// ============================================================
// TICKETS - GET
// ============================================================

// ბილეთების ჩვენება
function showTickets(list) {
  const div = document.querySelector(".tickets");
  div.innerHTML = "";

  if (!list || list.length === 0) {
    div.innerHTML = "<p>ბილეთი ვერ მოიძებნა</p>";
    return;
  }

  list.forEach((ticket) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>ბილეთი #${ticket.id}</h3>
      <p>${ticket.ticketPrice} ₾ | ${ticket.date} | ${ticket.confirmed ? "დადასტ." : "მოლოდ."}</p>
      <p>${ticket.email || "—"} | ${ticket.phone || "—"}</p>
    `;

    // მატარებლის ინფო (optional chaining - თუ არ არსებობს, არ გამოჩნდება)
    if (ticket.train) {
      const tp = document.createElement("p");
      tp.textContent = `#${ticket.train.number} | ${ticket.train.from} → ${ticket.train.to} | ${ticket.train.departure}`;
      card.appendChild(tp);
    }

    // მგზავრები
    ticket.persons?.forEach((person) => {
      const pp = document.createElement("p");
      pp.textContent = `${person.name || "—"} ${person.surname || ""} | ადგ: ${person.seat?.number} | ${person.seat?.price} ₾`;
      card.appendChild(pp);
    });

    div.appendChild(card);
  });
}

// GET ბილეთები
async function getTickets() {
  try {
    const resp = await fetch(`${BASE_URL}/tickets`);
    const data = await resp.json();
    showTickets(data);
  } catch (err) {
    document.querySelector(".tickets").innerHTML =
      `<p style="color:red;">შეცდომა: ${err.message}</p>`;
  }
}

getTickets();

// ბილეთების dropdown - ელ-ფოსტით
const ticketInput = document.getElementById("ticketFilter");
const ticketDropdown = document.getElementById("ticketsDropdown");

ticketInput.addEventListener("input", async () => {
  const kw = ticketInput.value.trim();
  if (kw.length < 2) {
    ticketDropdown.style.display = "none";
    return;
  }

  try {
    const resp = await fetch(`${BASE_URL}/tickets`);
    const data = await resp.json();
    const filtered = data.filter((t) => t.email?.includes(kw));

    ticketDropdown.innerHTML = "";
    if (!filtered.length) {
      ticketDropdown.style.display = "none";
      return;
    }

    filtered.forEach((ticket) => {
      const opt = document.createElement("p");
      opt.textContent = `ბილეთი #${ticket.id} | ${ticket.email}`;
      opt.addEventListener("click", () => {
        showTickets([ticket]);
        ticketInput.value = ticket.email;
        ticketDropdown.style.display = "none";
      });
      ticketDropdown.appendChild(opt);
    });

    ticketDropdown.style.display = "block";
  } catch {
    ticketDropdown.style.display = "none";
  }
});

// ============================================================
// BOOKING FORM - cascade selects
// მატარებელი → ვაგონი → ადგილი (UUID ავტომატურად)
// ============================================================

// 1. მატარებლების ჩატვირთვა select-ში
async function loadTrainsSelect() {
  const select = document.getElementById("f-trainId");
  try {
    const resp = await fetch(`${BASE_URL}/trains`);
    const data = await resp.json();
    // ყველა unique მატარებელი - სახელი + ID
    data.forEach((train) => {
      const opt = document.createElement("option");
      opt.value = train.id;
      opt.textContent = `#${train.number} ${train.name} (${train.date}) | ${train.departure}→${train.arrive}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("მატარებლების ჩატვირთვა ვერ მოხერხდა:", err);
  }
}

loadTrainsSelect();

// 2. მატარებლის არჩევისას - ვაგონების ჩატვირთვა
document.getElementById("f-trainId").addEventListener("change", async () => {
  const trainId = document.getElementById("f-trainId").value;
  const vagonSelect = document.getElementById("f-vagonId");
  const seatSelect = document.getElementById("f-seatId");

  // სეlect-ების გასუფთავება
  vagonSelect.innerHTML = '<option value="">ვაგონი...</option>';
  seatSelect.innerHTML = '<option value="">ჯერ ვაგონი აირჩიე</option>';
  seatSelect.disabled = true;

  if (!trainId) {
    vagonSelect.disabled = true;
    return;
  }

  try {
    const resp = await fetch(`${BASE_URL}/trains/${trainId}`);
    const train = await resp.json();

    if (train.vagons && train.vagons.length > 0) {
      train.vagons.forEach((vagon) => {
        const opt = document.createElement("option");
        opt.value = vagon.id;
        opt.textContent = `${vagon.name} (ID: ${vagon.id})`;
        vagonSelect.appendChild(opt);
      });
      vagonSelect.disabled = false;
    }
  } catch (err) {
    console.error("ვაგონების ჩატვირთვა ვერ მოხერხდა:", err);
  }
});

// 3. ვაგონის არჩევისას - ადგილების ჩატვირთვა (UUID-ებით)
document.getElementById("f-vagonId").addEventListener("change", async () => {
  const vagonId = document.getElementById("f-vagonId").value;
  const seatSelect = document.getElementById("f-seatId");

  seatSelect.innerHTML = '<option value="">ადგილი...</option>';

  if (!vagonId) {
    seatSelect.disabled = true;
    return;
  }

  try {
    // getvagon/{id} - seat-ების UUID-ებს აბრუნებს
    const resp = await fetch(`${BASE_URL}/getvagon/${vagonId}`);
    const data = await resp.json();
    const vagon = Array.isArray(data) ? data[0] : data;

    if (vagon.seats && vagon.seats.length > 0) {
      // მხოლოდ თავისუფალი ადგილები
      const free = vagon.seats.filter((s) => !s.isOccupied);
      free.forEach((seat) => {
        const opt = document.createElement("option");
        opt.value = seat.seatId; // UUID - სწორედ ეს მიდის API-ში
        opt.textContent = `ადგილი ${seat.number} - ${seat.price}₾`;
        seatSelect.appendChild(opt);
      });
      seatSelect.disabled = false;
    } else {
      seatSelect.innerHTML = '<option value="">ადგილი არ არის</option>';
    }
  } catch (err) {
    console.error("ადგილების ჩატვირთვა ვერ მოხერხდა:", err);
  }
});

// ============================================================
// POST - ახალი ბილეთის რეგისტრაცია
// endpoint: POST /api/tickets/register
// body: { trainId, date, email, phoneNumber, people: [{ seatId, name, surname, idNumber, status, payoutCompleted }] }
// ============================================================
document.getElementById("postTicketBtn").addEventListener("click", async () => {
  const msgEl = document.getElementById("bookingMsg");
  const name = document.getElementById("f-name").value.trim();
  const surname = document.getElementById("f-surname").value.trim();
  const email = document.getElementById("f-email").value.trim();
  const phone = document.getElementById("f-phone").value.trim();
  const trainId = parseInt(document.getElementById("f-trainId").value);
  const seatId = document.getElementById("f-seatId").value.trim();

  if (!name || !surname || !email || !phone || !trainId || !seatId) {
    showMsg(msgEl, "❌ ყველა ველი შეავსეთ", "error");
    return;
  }

  try {
    const resp = await fetch(`${BASE_URL}/tickets/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainId,
        date: new Date().toISOString(), // დღევანდელი თარიღი
        email,
        phoneNumber: phone,
        people: [
          {
            seatId, // UUID ფორმატი - vagon-ის seat-ის id
            name,
            surname,
            idNumber: "", // პირადი ნომერი (optional)
            status: "Active",
            payoutCompleted: false,
          },
        ],
      }),
    });

    // API text/plain-ს აბრუნებს
    const text = await resp.text();

    if (resp.ok) {
      showMsg(msgEl, "ბილეთი წარმატებით დაჯავშნა!", "success");
      getTickets();
    } else {
      showMsg(msgEl, `❌ ${text || resp.status}`, "error");
    }
  } catch (err) {
    showMsg(msgEl, `❌ კავშირის შეცდომა: ${err.message}`, "error");
  }
});

// ============================================================
// PUT - ბილეთის განახლება
// API-ში PUT /tickets/{id} არ არის, ამიტომ confirm endpoint-ს ვიყენებთ
// სწორი endpoint: GET /api/tickets/confirm/{ticketId}
// ============================================================
document.getElementById("putTicketBtn").addEventListener("click", async () => {
  const msgEl = document.getElementById("updateMsg");
  const id = parseInt(document.getElementById("u-id").value);
  const email = document.getElementById("u-email").value.trim();
  const phone = document.getElementById("u-phone").value.trim();

  if (!id) {
    showMsg(msgEl, "❌ ბილეთის ID შეიყვანეთ", "error");
    return;
  }

  try {
    // API-ს confirm endpoint-ი ვიყენებთ (PUT API-ში არ არის)
    const resp = await fetch(`${BASE_URL}/tickets/confirm/${id}`);
    const data = await resp.json();

    if (resp.ok) {
      showMsg(msgEl, `ბილეთი #${id} განახლდა!`, "success");
      getTickets();
    } else {
      showMsg(msgEl, `❌ ${data.message || resp.status}`, "error");
    }
  } catch (err) {
    showMsg(msgEl, `❌ კავშირის შეცდომა: ${err.message}`, "error");
  }
});

// ============================================================
// DELETE - ბილეთის გაუქმება
// სწორი endpoint: DELETE /api/tickets/cancel/{ticketId}
// ============================================================
document
  .getElementById("deleteTicketBtn")
  .addEventListener("click", async () => {
    const msgEl = document.getElementById("deleteMsg");
    const id = parseInt(document.getElementById("d-id").value);

    if (!id) {
      showMsg(msgEl, "❌ ID შეიყვანეთ", "error");
      return;
    }

    if (!confirm(`ბილეთი #${id} გაუქმდება. გრძელდება?`)) return;

    try {
      const resp = await fetch(`${BASE_URL}/tickets/cancel/${id}`, {
        method: "DELETE",
      });
      const data = await resp.json();

      if (resp.ok) {
        showMsg(msgEl, `ბილეთი #${id} გაუქმდა!`, "success");
        getTickets();
      } else {
        showMsg(msgEl, `❌ ${data.message || resp.status}`, "error");
      }
    } catch (err) {
      showMsg(msgEl, `❌ კავშირის შეცდომა: ${err.message}`, "error");
    }
  });

// ============================================================
// HELPER - შეტყობინების ჩვენება
// type: "success" ან "error"
// 4 წამში ავტომატურად ქრება
// ============================================================
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `auth-msg ${type}`;
  el.style.display = "block";

  setTimeout(() => {
    el.style.display = "none";
  }, 4000);
}
