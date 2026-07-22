import '../components/ticket/ticket.js';
import { GetTickets } from '../../wailsjs/go/internal/OrderHub.js';

export function Home() {
    return (`
        <section class="container mt-4">
            <div id="tickets-container" class="d-flex flex-wrap gap-3">
                <p>Carregando tickets...</p>
            </div>
        </section>
    `);
}