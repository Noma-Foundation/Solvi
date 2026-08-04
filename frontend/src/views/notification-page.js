import { html } from "../utils/html.js";

export function NotificationPage() {
    return html`
        <section class="container">
            <div id="notification-page-container" onload="refreshList()">
                <h2>Notifications</h2>

                <label for="ticket-description">Description</label>
                <input id="ticket-description" placeholder="Description" />

                <label for="ticket-price">Price</label>
                <input id="ticket-price" placeholder="Price" type="number" step="0.01" />

                <button id="add-ticket-button" type="button" onclick="addTicket()">Adicionar Ticket</button>

                <ul id="notification-list-ul"></ul>
            </div>
        </section>

        <script>
        async function refreshList() {
            const json = await window.pywebview.api.get_tickets();
            const tickets = JSON.parse(json || '[]');
            const ul = document.getElementById('notification-list-ul');
            ul.innerHTML = '';
            tickets.forEach(t => {
            const li = document.createElement('li');
            li.textContent = t.id + ' - ' + (t.description || '') + ' - $' + (t.price === undefined ? '0.0' : t.price);
            ul.appendChild(li);
            });
        }

        async function addTicket() {
            const desc = document.getElementById('ticket-description').value;
            const priceVal = document.getElementById('ticket-price').value;
            const price = priceVal === '' ? null : Number(priceVal);

            await window.pywebview.api.add_ticket(desc, price);
            await refreshList();

            document.getElementById('ticket-description').value = '';
            document.getElementById('ticket-price').value = '';
        }

        if (window.pywebview && window.pywebview.api && typeof window.pywebview.api.get_tickets === 'function') {
            refreshList();
        } else {
            document.addEventListener('DOMContentLoaded', refreshList);
            setTimeout(refreshList, 200);
        }

        window.refreshList = refreshList;
        window.addTicket = addTicket;
    </script>
    `;
}
