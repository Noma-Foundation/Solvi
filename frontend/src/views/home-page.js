import {DashboardComponent} from "../components/dashboard/dashboard.js";

export function HomePage() {
    queueMicrotask(() => {
        new DashboardComponent();
    });
    return /* html */ `<section class="dashboard-page"></section>`;
}
