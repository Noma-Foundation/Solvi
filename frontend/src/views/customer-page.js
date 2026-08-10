import { html } from "../utils/html.js";
import { NotCompleted } from "../utils/not-completed.js";

export function CustomerPage() {
    return html`
        <div class="customer-page">
            <h1>Customer Page</h1>
            ${NotCompleted()}
        </div>
    `;
}