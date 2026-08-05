import { html } from "./html.js";

export function NotCompleted() {
    return html`
        <div class="container text-center py-5">
            <h3 class="text-danger text-center">This content is not completed yet.</h3>
            <p class="text-danger text-center">Please try again later.</p>
        </div>
    `;
}