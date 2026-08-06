import { CustomerManager } from "../components/customer/customer.js";

/**
 * Renders the customer page into the main context and wires interactions.
 * ContextManager injects the return value as HTML; we mount the manager after.
 */
export function CustomerPage() {
    queueMicrotask(() => {
        new CustomerManager("#app-main-context");
    });

    return `<section class="customer-page"><p class="customer-page__subtitle">Carregando clientes…</p></section>`;
}
