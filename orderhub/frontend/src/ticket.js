
export class TicketManager {
    constructor() {
        this.ticketsData = [];
    }

    renderTickets() {
        const container = document.querySelector(".tickets-container");
        const template = document.getElementById("ticket-template");

        if (!template) {
            console.error("Template not found");
            return;
        }

        this.ticketsData.forEach((data) => {
            const clone = template.content.cloneNode(true);
            clone.querySelector(".ticket-title").textContent = data.title;
            clone.querySelector(".ticket-description").textContent = data.description;
            clone.querySelector(".ticket-simulation").textContent = data.simulation;
            clone.querySelector(".ticket-date").textContent = data.date;
            container.appendChild(clone);
        });

        console.log("Tickets rendered");
    }

}