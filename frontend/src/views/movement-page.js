import { InboxComponentPage } from "../components/movement/movement.js";

export function InboxPage() {
    queueMicrotask(() => {
        new InboxComponentPage();
    });
    return `<section class="inbox-page"></section>`;
}