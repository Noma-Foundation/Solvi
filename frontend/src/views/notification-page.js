import { html } from "../utils/html.js";

export function Notification() {
    return html`
        <section class="container">
            <div id="notification-page-container">
                <h2>Notifications</h2>

                <label for="ticket-description">Description</label>
                <input id="ticket-description" placeholder="Description" />

                <label for="ticket-price">Price</label>
                <input id="ticket-price" placeholder="Price" type="number" step="0.01" />

                <button id="add-ticket-button" type="button">Adicionar Ticket</button>

                <ul id="notification-list-ul"></ul>
            </div>
        </section>

        <script>
        window.refreshList = async function() {
            if (!(window.pywebview && window.pywebview.api && typeof window.pywebview.api.get_tickets === 'function')) return;
            const ticketsJson = await window.pywebview.api.get_tickets();
            const tickets = JSON.parse(ticketsJson || '[]');
            const ul = document.getElementById('notification-list-ul');
            if (!ul) return;
            ul.innerHTML = '';
            tickets.forEach(function(t) {
            const li = document.createElement('li');
            li.textContent = String(t.id) + ' - ' + (t.description || '') + (t.price !== undefined ? ' - $' + t.price : '');
            ul.appendChild(li);
            });
        };

        window.addTicketHandler = async function() {
            const descEl = document.getElementById('ticket-description');
            const priceEl = document.getElementById('ticket-price');
            const desc = descEl ? descEl.value : '';
            const priceVal = priceEl ? priceEl.value : '';
            const price = priceVal === '' ? null : Number(priceVal);

            if (window.pywebview && window.pywebview.api && typeof window.pywebview.api.add_ticket === 'function') {
                await window.pywebview.api.add_ticket(desc, price);
            }

            await window.refreshList();

            if (descEl) descEl.value = '';
            if (priceEl) priceEl.value = '';
        };

        (function initWhenReady() {
            const iv = setInterval(function() {
            const btn = document.getElementById('add-ticket-button');
            const ul = document.getElementById('notification-list-ul');

            if (btn && !btn.onclick) {
                btn.onclick = window.addTicketHandler; // fallback simples
            }

            // se tudo pronto (API + UL), atualiza lista e para o polling
            if (window.pywebview && window.pywebview.api && typeof window.pywebview.api.get_tickets === 'function' && ul) {
                clearInterval(iv);
                window.refreshList();
            }
            }, 100);
        })();
        </script>
    `;
}
