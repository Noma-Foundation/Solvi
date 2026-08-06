import { NotificationManager } from "../components/notification/notification.js";

export function NotificationPage() {
    queueMicrotask(() => {
        new NotificationManager("#app-main-context");
    });

    return `<section class="notification-page"><p class="notification-page__subtitle">Carregando notificações…</p></section>`;
}
