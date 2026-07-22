import '../components/ticket/ticket.js';
import { GetTickets } from '../../wailsjs/go/internal/OrderHub.js';

export function Home() {
    // Como a chamada para o banco de dados via Wails é assíncrona,
    // usamos setTimeout para rodar após o HTML base ser injetado.
    setTimeout(async () => {
        const container = document.getElementById('tickets-container');
        if (!container) return;

        try {
            const tickets = await GetTickets();
            if (!tickets || tickets.length === 0) {
                container.innerHTML = '<p class="text-muted">Nenhum ticket encontrado no banco de dados.</p>';
                return;
            }

            const ticketsHtml = tickets.map(t =>
                `<ticket-card ticket-id="${t.id}" client="${t.client}" budget="${t.budget}" address="${t.address}" description="${t.desc}"></ticket-card>`
            ).join('');

            container.innerHTML = ticketsHtml;
        } catch (err) {
            console.error(err);
            container.innerHTML = `<p class="text-danger">Erro ao carregar tickets do banco: ${err}</p>`;
        }
    }, 0);

    return (`
        <section class="container mt-4">
            <h1>Home Page</h1>
            <h4 class="mt-4 mb-3">Últimos Tickets</h4>
            <div id="tickets-container" class="d-flex flex-wrap gap-3">
                <p>Carregando tickets...</p>
            </div>
        </section>
    `);
}