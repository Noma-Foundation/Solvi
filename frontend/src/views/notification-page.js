import { html } from "../utils/html.js";


export function Notification() {
    return html`
        <section class="container mt-4">
            <div id="notification-page-container">
                <h2>Notifications</h2>
            </div>
            <div id="notification-list">
                <ul id="notification-list-ul" class="list-group list-group-flush "></ul>
            </div>
        </section>

        <script>
            const notification_list_ul = document.getElementById("notification-list-ul")
            
            async function add_tickets_to_list() { 
                const tickets = await window.pywebview.api.get_tickets();
                console.log(tickets);
                tickets.forEach(ticket => {
                    notification_list_ul.appendChild(document.createElement("li").textContent = ticket.ticket_name);
                });
            }
            add_tickets_to_list();
        </script>
    `;
}
