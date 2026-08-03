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
            async function add_tickets_to_list() {
                try {
                    const ticketsJson = await window.pywebview.api.get_tickets();
                    const tickets = JSON.parse(ticketsJson || '[]');

                    const notification_list_ul = document.getElementById("notification-list-ul");
                    if (!notification_list_ul) return;

                    tickets.forEach(ticket => {
                        const ticket_element = document.createElement("li");
                        ticket_element.textContent = ticket.ticket_name || "";
                        notification_list_ul.appendChild(ticket_element);
                    });
                } catch (error) {
                    console.log("Failed to fetch tickets: " + error);
                }
            }

            // call once to populate list
            add_tickets_to_list();
        </script>
    `;
}
