import { NotCompleted } from "../utils/not-completed.js";

export function CustomerPage() {
    return /* html*/ `
        <div class="customer-page">
            <aside class="customer-page__column customer-page__column--left" aria-label="customer-list">
                <input
                    type="text"
                    id="customer-search"
                    class="customer-page__search"
                    placeholder="Buscar cliente..."
                    aria-label="Buscar cliente"
                />
                <button type="button" id="customer-add-btn" class="customer-page__add-btn">
                    + Adicionar cliente
                </button>
                <ul id="customer-list" class="customer-page__list" role="listbox"></ul>
            </aside>
            <section class="customer-page__column customer-page__column--right" aria-label="customer-details">
                <div id="customer-details"></div>
            </section>
        </div>
    `;
}