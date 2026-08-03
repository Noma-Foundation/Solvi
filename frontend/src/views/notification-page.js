import { html } from "../utils/html.js";

export function Notification() {
    return html`
        <section class="container">
            <div id="notification-page-container">
                <h2>Notifications</h2>
                <div style="margin-bottom:12px;display:flex;gap:8px;align-items:center">
                    <input id="ticket-description" placeholder="Description" style="flex:1;padding:6px" />
                    <input id="ticket-price" placeholder="Price" type="number" step="0.01" style="width:120px;padding:6px" />
                    <button id="add-ticket-button" type="button">Add</button>
                </div>
                <ul id="notification-list-ul">
                </ul>
            </div>
        </section>

        <script>
            async function fetchAndRenderTickets() {
                try {
                    const api = window.pywebview && window.pywebview.api;
                    if (!api) return;

                    let ticketsJson = '[]';
                    if (typeof api.get_ticket === 'function') {
                        ticketsJson = await api.get_ticket();
                    } else if (typeof api.get_tickets === 'function') {
                        ticketsJson = await api.get_tickets();
                    }

                    const tickets = JSON.parse(ticketsJson || '[]');
                    const notification_list_ul = document.getElementById("notification-list-ul");
                    if (!notification_list_ul) return;
                    notification_list_ul.innerHTML = '';

                    tickets.forEach(ticket => {
                        const ticket_element = document.createElement("li");
                        ticket_element.textContent = ticket.description;
                        ticket_element.dataset.ticketId = ticket.id || '';
                        notification_list_ul.appendChild(ticket_element);
                    });
                } catch (error) {
                    console.log('Failed to fetch tickets: ' + error);
                }
            }

            async function addTicket() {
                try {
                    const descInput = document.getElementById('ticket-description');
                    const priceInput = document.getElementById('ticket-price');
                    const description = descInput.value.trim();
                    const price = priceInput.value ? Number(priceInput.value) : 0.0;
                    if (!description) return;

                    const api = window.pywebview && window.pywebview.api;
                    if (!api || typeof api.add_ticket !== 'function') return;

                    // call backend; add_ticket returns the created ticket as JSON
                    const createdJson = await api.add_ticket(JSON.stringify({ description: description, price: price }));
                    const created = JSON.parse(createdJson || '{}');
                    if (created && created.id) {
                        // refresh from backend to ensure DB was updated
                        await fetchAndRenderTickets();

                        // clear inputs
                        descInput.value = '';
                        priceInput.value = '';
                    } else {
                        console.log('Failed to create ticket');
                    }
                } catch (err) {
                    console.log('Add ticket error: ' + err);
                }
            }

            document.addEventListener('DOMContentLoaded', () => {
                const addButton = document.getElementById('add-ticket-button');
                if (addButton) addButton.addEventListener('click', addTicket);
                fetchAndRenderTickets();
            });
        </script>
    `;
}
