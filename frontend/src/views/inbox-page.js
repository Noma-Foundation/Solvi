import { InboxComponentPage } from "../components/inbox/inbox";

export function InboxPage() {
    queueMicrotask(() => {
        new InboxComponentPage();
    });
    return `<section class="inbox-page"></section>`;
}