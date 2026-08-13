import { CalendarManager } from "../components/calendar/calendar.js";

export function CalendarPage() {
    queueMicrotask(() => {
        new CalendarManager("#app-main-context");
    });

    return `<section class="calendar-page"><p class="calendar-page__subtitle">Carregando calendário…</p></section>`;
}
