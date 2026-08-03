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
            async function refreshList() {
                const api = window.pywebview && window.pywebview.api;
                if (!api) return;
                const ticketsJson = await api.get_tickets();
                const tickets = JSON.parse(ticketsJson || '[]');
                const ul = document.getElementById('notification-list-ul');
                ul.innerHTML = '';
                tickets.forEach(t => {
                    const li = document.createElement('li');
                    li.textContent = `${t.id} - ${t.description} ${t.price !== undefined ? '- $' + t.price : ''}`;
                    ul.appendChild(li);
                });
            }

            document.addEventListener('DOMContentLoaded', () => {
                const btn = document.getElementById('add-ticket-button');
                btn.addEventListener('click', async () => {
                    const desc = document.getElementById('ticket-description').value;
                    const priceVal = document.getElementById('ticket-price').value;
                    const price = priceVal === '' ? null : Number(priceVal);
                    await window.pywebview.api.add_ticket(desc, price);
                    await refreshList();
                });

                refreshList();
            });
        </script>
    `;
}
