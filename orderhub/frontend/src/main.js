import "./style.css";
import "./app.css";

import { OpenSettings } from "../wailsjs/go/main/App";

const ticketsData = [];

// Implement this in a Ticket Class
function renderTickets() {
    const container = document.querySelector(".tickets-container");
    const template = document.getElementById("ticket-template");

    if (!template) {
        console.error("Template not found");
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

    console.log("Tickets rendered");
}

// Change in future to open the real settings window
// Not working yet
// Remove this function
window.openSettings = function () {
    OpenSettings().then((result) => {
        console.log("Settings opened");
    });
};

document.addEventListener("DOMContentLoaded", renderTickets);
