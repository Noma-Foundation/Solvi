import '../components/ticket/ticket.js';
import { GetTickets } from '../../wailsjs/go/internal/OrderHub.js';

export function Home() {
    setTimeout(async () => {
        const container = document.getElementById('tickets-container');
        if (!container) return;

        try {
            let tickets = null;
            let retries = 5;
            while (retries > 0) {
                try {
                    tickets = await GetTickets();
                    break;
                } catch (e) {
                    if (e === "database not connected") {
                        retries--;
                        if (retries === 0) throw e;
                        await new Promise(res => setTimeout(res, 800));
                    } else {
                        throw e;
                    }
                }
            }

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
            <div id="tickets-container" class="d-flex flex-wrap gap-3">
                <p>Carregando tickets...</p>
            </div>
        </section>
    `);
}