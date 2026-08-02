import { html } from "../utils/html.js";

export function Notification() {
    return html`
        <section class="container">
            <div id="notification-page-container">
                <h2>Notifications</h2>
                <ul id="notification-list-ul">
                </ul>
            </div>
        </section>

        <script>
            var notification_list_ul = document.getElementById("notification-list-ul")
            
            async function add_tickets_to_list() { 
                const tickets = await window.pywebview.api.get_tickets();

                for (const ticket of tickets) {
                    const ticket_element = document.createElement("li");
                    ticket_element.textContent = ticket.ticket_name;
                    notification_list_ul.appendChild(ticket_element);
                }
            }

            add_tickets_to_list().then(() => {
                console.log("Tickets fetched successfully.");
            }).catch((error) => {
                console.log("Failed to fetch tickets: " + error);
            });
        </script>
    `;
}
