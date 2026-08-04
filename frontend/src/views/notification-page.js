import { html } from "../utils/html.js";

export function NotificationPage() {
    return html`
        <section class="container">
            <div id="notification-page-container" onload="refreshList()">
                <h2>Notifications</h2>
            </div>
        </section>
    `;
}
