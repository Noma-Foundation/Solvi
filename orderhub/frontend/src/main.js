import "./settings.css";
import "./style.css";
import "./app.css";

import { OpenSettings } from "../wailsjs/go/main/App";

// Test tickets
const ticketsData = [];

function renderTickets() {
  const container = document.querySelector(".tickets-container");
  const template = document.getElementById("ticket-template");

  if (!template) {
    console.error("Template não encontrado");
    return;
  }

  ticketsData.forEach((data) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".ticket-title").textContent = data.title;
    clone.querySelector(".ticket-description").textContent = data.description;
    clone.querySelector(".ticket-simulation").textContent = data.simulation;
    clone.querySelector(".ticket-date").textContent = data.date;
    container.appendChild(clone);
  });

  console.log("Tickets renderizados");
}

window.openSettings = function () {
  OpenSettings().then((result) => {
    console.log("Settings opened");
  });
};

// Renderizar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", renderTickets);
