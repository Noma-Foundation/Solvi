import { NotificationComponentPage } from "../components/notification/notification.js";

export function NotificationPage() {
    queueMicrotask(() => {
        new NotificationComponentPage();
    });
    return `<section class="notification-page"></section>`;
}
