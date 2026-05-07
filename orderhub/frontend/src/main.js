import "./settings.css";
import "./style.css";
import "./app.css";

// Test tickets
const ticketsData = [
  {
    title: "João Silva",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
    simulation: "R$1840,38",
    date: "01/05/2026",
  },
  {
    title: "Maria Santos",
    description:
      "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae.",
    simulation: "R$2500,00",
    date: "05/05/2026",
  },
  {
    title: "Pedro Oliveira",
    description: "Preciso de 2 câmeras e uma central de alarme",
    simulation: "R$780,89",
  },
  {
    title: "Ana Souza",
    description: "Preciso de 2 faxinheiras para a limpeza em minha casa",
    simulation: "R$45.000,00",
    date: "14/03/2026",
  },
  {
    title: "Jeff",
    description: "Estou precisando de 6 pães para meu café da manhã",
    simulation: "R$14,99",
    date: "28/01/2026",
  },
];

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

// Renderizar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", renderTickets);
