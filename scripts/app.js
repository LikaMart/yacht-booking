// სადგურები
fetch("https://railway.stepprojects.ge/api/stations")
  .then((response) => response.json())
  .then((data) => {
    console.log("stations:", data);
  })
  .catch((error) => console.error("Error:", error));

// მარშრუტები
fetch("https://railway.stepprojects.ge/api/departures")
  .then((res) => res.json())
  .then((data) => console.log("Departures:", data));

// ბილეთები
fetch("https://railway.stepprojects.ge/api/tickets")
  .then((res) => res.json())
  .then((data) => console.log("Tickets:", data));
