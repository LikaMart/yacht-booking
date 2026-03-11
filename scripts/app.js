// --- Stations ---
function showStations(list) {
  const stationsDiv = document.querySelector(".stations");
  stationsDiv.innerHTML = "";
  if (!list || list.length === 0) {
    stationsDiv.innerHTML = "<p>No stations found</p>";
    return;
  }
  list.forEach((station) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const stationName = document.createElement("h3");
    stationName.textContent = station.name;

    const stationNumber = document.createElement("p");
    stationNumber.textContent = `Station Number: ${station.stationNumber}`;

    card.append(stationName, stationNumber);
    stationsDiv.appendChild(card);
  });
}

fetch("https://railway.stepprojects.ge/api/stations")
  .then((resp) => resp.json())
  .then((data) => showStations(data))
  .catch((err) => {
    document.querySelector(".stations").innerHTML =
      `<p style="color:red;">Failed to load stations: ${err.message}</p>`;
  });

  const stationInput = document.getElementById("stationFilter");
const stationDropdown = document.getElementById("stationDropdown");

stationInput.addEventListener("input", () => {
  const keyword = stationInput.value.trim();
  if (keyword.length < 2) {
    stationDropdown.style.display = "none";
    return;
  }

  fetch("https://railway.stepprojects.ge/api/stations")
    .then((resp) => resp.json())
    .then((data) => {
      stationDropdown.innerHTML = "";
      const filtered = data.filter(st => st.name.includes(keyword));
      if (filtered.length === 0) {
        stationDropdown.style.display = "none";
        return;
      }
      filtered.forEach((station) => {
        const option = document.createElement("p");
        option.textContent = `${station.name} (№${station.stationNumber})`;
        option.addEventListener("click", () => {
          showStations([station]); // არჩეული station card‑ად გამოჩნდება
          stationDropdown.style.display = "none";
          stationInput.value = option.textContent;
        });
        stationDropdown.appendChild(option);
      });
      stationDropdown.style.display = "block";
    })
    .catch((err) => {
      console.error("Station dropdown error:", err);
      stationDropdown.style.display = "none";
    });
});


// --- Departures ---
function showDepartures(list) {
  const departuresDiv = document.querySelector(".departures");
  departuresDiv.innerHTML = "";
  if (!list || list.length === 0) {
    departuresDiv.innerHTML = "<p>No departures found</p>";
    return;
  }

  list.forEach((departure) => {
    // მთავარი ინფორმაცია (source, destination, date)
    const depHeader = document.createElement("div");
    depHeader.classList.add("card");
    depHeader.innerHTML = `
      <h3>${departure.source} → ${departure.destination}</h3>
      <p>Date: ${departure.date}</p>
    `;
    departuresDiv.appendChild(depHeader);

    // შიგნით არსებული მატარებლები
    if (departure.trains && departure.trains.length > 0) {
      departure.trains.forEach((train) => {
        const trainCard = document.createElement("div");
        trainCard.classList.add("card", "trainCard");
        trainCard.innerHTML = `
          <h4>Train #${train.number} - ${train.name}</h4>
          <p>From ${train.from} → ${train.to}</p>
          <p>Departure: ${train.departure} | Arrive: ${train.arrive}</p>
        `;
        departuresDiv.appendChild(trainCard);
      });
    }
  });
}
fetch("https://railway.stepprojects.ge/api/departures")
  .then((resp) => resp.json())
  .then((data) => showDepartures(data))
  .catch((err) => {
    document.querySelector(".departures").innerHTML =
      `<p style="color:red;">Failed to load departures: ${err.message}</p>`;
  });

  // --- Dropdown for Departures ---
const departureInput = document.getElementById("departureFilter");
const departureDropdown = document.getElementById("departureDropdown");

departureInput.addEventListener("input", () => {
  const keyword = departureInput.value.trim();
  if (keyword.length < 2) {
    departureDropdown.style.display = "none";
    return;
  }

  fetch(`https://railway.stepprojects.ge/api/departures?destination=${keyword}`)
    .then((resp) => resp.json())
    .then((data) => {
      departureDropdown.innerHTML = "";
      if (!data || data.length === 0) {
        departureDropdown.style.display = "none";
        return;
      }
      data.forEach((dep) => {
        const option = document.createElement("p");
        option.textContent = `${dep.source} → ${dep.destination} (${dep.date})`;
        option.addEventListener("click", () => {
          showDepartures([dep]); // არჩეული მონაცემის card‑ად ჩვენება
          departureDropdown.style.display = "none";
          departureInput.value = option.textContent;
        });
        departureDropdown.appendChild(option);
      });
      departureDropdown.style.display = "block";
    })
    .catch((err) => {
      console.error("Dropdown error:", err);
      departureDropdown.style.display = "none";
    });
});

document.getElementById("filterDepartureBtn").addEventListener("click", () => {
  const keyword = document.getElementById("departureFilter").value.trim();
  fetch(`https://railway.stepprojects.ge/api/departures?destination=${keyword}`)
    .then((resp) => resp.json())
    .then((data) => showDepartures(data))
    .catch((err) => {
      document.querySelector(".departures").innerHTML =
        `<p style="color:red;">Failed to filter departures: ${err.message}</p>`;
    });
});








// --- Tickets ---
function showTickets(list) {
  const ticketsDiv = document.querySelector(".tickets");
  ticketsDiv.innerHTML = "";
  if (!list || list.length === 0) {
    ticketsDiv.innerHTML = "<p>No tickets found</p>";
    return;
  }

  list.forEach((ticket) => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Ticket info
    const ticketId = document.createElement("h3");
    ticketId.textContent = `Ticket #${ticket.id}`;

    const ticketInfo = document.createElement("p");
    ticketInfo.textContent = `Price: ${ticket.ticketPrice} ₾ | Date: ${ticket.date} | Confirmed: ${ticket.confirmed}`;

    const contactInfo = document.createElement("p");
    contactInfo.textContent = `Email: ${ticket.email || "N/A"} | Phone: ${ticket.phone || "N/A"}`;

    // Train info
    const trainInfo = document.createElement("p");
    trainInfo.textContent = `Train #${ticket.train.number} - ${ticket.train.name} | From ${ticket.train.from} → ${ticket.train.to} | Departure: ${ticket.train.departure} | Arrive: ${ticket.train.arrive}`;

    card.append(ticketId, ticketInfo, contactInfo, trainInfo);

    // Persons info
    if (ticket.persons && ticket.persons.length > 0) {
      ticket.persons.forEach((person) => {
        const personInfo = document.createElement("p");
        personInfo.textContent = `Passenger: ${person.name || "N/A"} ${person.surname || ""} | Seat: ${person.seat.number} | Seat Price: ${person.seat.price} ₾ | Status: ${person.status}`;
        card.appendChild(personInfo);
      });
    }

    ticketsDiv.appendChild(card);
  });
}

fetch("https://railway.stepprojects.ge/api/tickets")
  .then((resp) => resp.json())
  .then((data) => showTickets(data))
  .catch((err) => {
    document.querySelector(".tickets").innerHTML =
      `<p style="color:red;">Failed to load tickets: ${err.message}</p>`;
  });

  const ticketsInput = document.createElement("input");
ticketsInput.id = "ticketFilter";
ticketsInput.placeholder = "Search ticket by email...";
document.querySelector(".tickets").before(ticketsInput);

const ticketsDropdown = document.createElement("div");
ticketsDropdown.id = "ticketsDropdown";
ticketsDropdown.classList.add("dropdown");
document.querySelector(".tickets").before(ticketsDropdown);

ticketsInput.addEventListener("input", () => {
  const keyword = ticketsInput.value.trim();
  if (keyword.length < 2) {
    ticketsDropdown.style.display = "none";
    return;
  }

  fetch("https://railway.stepprojects.ge/api/tickets")
    .then((resp) => resp.json())
    .then((data) => {
      ticketsDropdown.innerHTML = "";
      const filtered = data.filter(ticket => ticket.email && ticket.email.includes(keyword));
      if (filtered.length === 0) {
        ticketsDropdown.style.display = "none";
        return;
      }
      filtered.forEach((ticket) => {
        const option = document.createElement("p");
        option.textContent = `Ticket #${ticket.id} | ${ticket.email}`;
        option.addEventListener("click", () => {
          showTickets([ticket]); // არჩეული ticket card‑ად გამოჩნდება
          ticketsDropdown.style.display = "none";
          ticketsInput.value = option.textContent;
        });
        ticketsDropdown.appendChild(option);
      });
      ticketsDropdown.style.display = "block";
    })
    .catch((err) => {
      console.error("Tickets dropdown error:", err);
      ticketsDropdown.style.display = "none";
    });
});

// --- Trains ---
function showTrains(list) {
  const trainsDiv = document.querySelector(".trains");
  trainsDiv.innerHTML = "";
  if (!list || list.length === 0) {
    trainsDiv.innerHTML = "<p>No trains found</p>";
    return;
  }

  list.forEach((train) => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Train info
    const trainHeader = document.createElement("h3");
    trainHeader.textContent = `Train #${train.number} - ${train.name}`;

    const trainRoute = document.createElement("p");
    trainRoute.textContent = `From ${train.from} → ${train.to}`;

    const trainTime = document.createElement("p");
    trainTime.textContent = `Departure: ${train.departure} | Arrive: ${train.arrive}`;

    const trainDate = document.createElement("p");
    trainDate.textContent = `Date: ${train.date}`;

    card.append(trainHeader, trainRoute, trainTime, trainDate);

    // Vagons info
    if (train.vagons && train.vagons.length > 0) {
      train.vagons.forEach((vagon) => {
        const vagonInfo = document.createElement("p");
        vagonInfo.textContent = `Vagon #${vagon.id} - ${vagon.name}`;
        card.appendChild(vagonInfo);
      });
    }

    trainsDiv.appendChild(card);
  });
}
fetch("https://railway.stepprojects.ge/api/trains")
  .then((resp) => resp.json())
  .then((data) => showTrains(data))
  .catch((err) => {
    document.querySelector(".trains").innerHTML =
      `<p style="color:red;">Failed to load trains: ${err.message}</p>`;
  });

// --- Vagons ---
function showVagons(list) {
  const vagonsDiv = document.querySelector(".vagons");
  vagonsDiv.innerHTML = "";
  if (!list || list.length === 0) {
    vagonsDiv.innerHTML = "<p>No vagons found</p>";
    return;
  }
  list.forEach((vagon) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>Vagon #${vagon.id}</h3>
      <p>Type: ${vagon.type || "N/A"} | Seats: ${vagon.seats || "N/A"}</p>
    `;
    vagonsDiv.appendChild(card);
  });
}

fetch("https://railway.stepprojects.ge/api/vagons")
  .then((resp) => resp.json())
  .then((data) => showVagons(data))
  .catch((err) => {
    document.querySelector(".vagons").innerHTML =
      `<p style="color:red;">Failed to load vagons: ${err.message}</p>`;
  });

// --- Seat Example ---
function showSeat(seat) {
  const seatDiv = document.querySelector(".seat");
  seatDiv.innerHTML = `
    <h3>Seat #${seat.id}</h3>
    <p>Status: ${seat.status || "N/A"}</p>
  `;
}

fetch("https://railway.stepprojects.ge/api/seat/1") // მაგალითი seatId=1
  .then((resp) => resp.json())
  .then((data) => showSeat(data))
  .catch((err) => {
    document.querySelector(".seat").innerHTML =
      `<p style="color:red;">Failed to load seat: ${err.message}</p>`;
  });

// --- Ticket Status & Confirm Example ---
function checkTicketStatus(ticketId) {
  fetch(`https://railway.stepprojects.ge/api/tickets/checkstatus/${ticketId}`)
    .then((resp) => resp.json())
    .then((data) => {
      alert(`Ticket ${ticketId} status: ${data.status}`);
    })
    .catch((err) => console.error("Status error:", err));
}

function confirmTicket(ticketId) {
  fetch(`https://railway.stepprojects.ge/api/tickets/confirm/${ticketId}`)
    .then((resp) => resp.json())
    .then((data) => {
      alert(`Ticket ${ticketId} confirmed: ${data.confirmation}`);
    })
    .catch((err) => console.error("Confirm error:", err));
}


