import { BudgetManager } from "../components/inbox/inbox.js";

export function InboxPage() {
    queueMicrotask(() => {
        new BudgetManager("#app-main-context");
    });

    return `<section class="inbox-page"><p class="inbox-page__subtitle">Carregando orçamentos…</p></section>`;
}
