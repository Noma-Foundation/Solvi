import { CalendarComponentPage } from "../components/calendar/calendar.js";

export function CalendarPage() {
    queueMicrotask(() => {
        new CalendarComponentPage();
    });
    return `<section class="calendar-page"></section>`;
}