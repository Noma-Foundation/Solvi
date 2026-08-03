import { html } from "../utils/html.js";

export function Notification() {
    return html`
        <section class="container">
            <div id="notification-page-container">
                <h2>Tickets</h2>
                <label for="ticket-price">Ticket Preço:</label>
                <input type="text" id="ticket-price">
                <label for="ticket-id">Ticket ID:</label>
                <input type="text" id="ticket-id"><br>
                <label for="ticket-description">Ticket Descrição:</label>
                <input type="text" id="ticket-description">
                <button id="add-ticket" class="btn">Add ticket</button>
                <ul id="notification-list-ul">
                </ul>
            </div>
        </section>

        <script>
            var notification_list_ul = document.getElementById("notification-list-ul")
            var add_ticket_btn = document.getElementById("add-ticket")
            var ticket_price_input = document.getElementById("ticket-price")
            var ticket_id_input = document.getElementById("ticket-id")
            var ticket_description_input = document.getElementById("ticket-description")

            async function add_tickets_to_list() { 
                const tickets = await window.pywebview.api.add_ticket();

                if (tickets) {
                    const msg = ticket_id_input.value + "|" + ticket_price_input.value + "|" + ticket_description_input.value;
                    const ticket_element = document.createElement("li");
                    ticket_element.textContent = msg;
                    notification_list_ul.appendChild(ticket_element);
                }
            }

            add_ticket_btn.addEventListener("click", () => {
                const ticket_price = ticket_price_input.value;
                const ticket_id = ticket_id_input.value;
                const ticket_description = ticket_description_input.value;
                
                window.pywebview.api.add_ticket(ticket_price, ticket_id, ticket_description);
                add_tickets_to_list();
            })
            
        </script>
    `;
}
