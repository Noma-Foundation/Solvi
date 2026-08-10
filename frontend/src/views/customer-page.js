import { NotCompleted } from "../utils/not-completed.js";

export function CustomerPage() {
    return `
        <div class="customer-page">
            <h1>Customer Page</h1>
            ${NotCompleted()}
        </div>
    `;
}