import { DashboardComponentPage } from "../components/dashboard/dashboard.js";

export function HomePage() {
    queueMicrotask(() => {
        new DashboardComponentPage();
    });
    return `<section class="dashboard-page"></section>`;
}
