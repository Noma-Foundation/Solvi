import { html } from "../utils/html.js";


export function Notification() {
    return html`
        <section class="container mt-4">
            <div id="notification-page-container">
                <h2>Notifications</h2>
            </div>
            <div id="notification-list">
                <ul id="notification-list-ul" class="list-group list-group-flush ">
                </ul>
            </div>
        </section>

        <script>
            console.log("[CHANGE PAGE] Notification Page");
        </script>
    `;
}