import $ from "jquery";

import { html } from "../../utils/html.js";
import { IComponentModel } from "../component-model.js";
import { eventBus } from "../../event-manager-singleton.js";
import { escapeHtml, parseApiResult } from "../../utils/api-helpers.js";

import "./customer.css";

/**
 * Interactive customer spreadsheet page (cards + local JSON via pywebview API).
 * @implements {IComponentModel}
 */
export class CustomerManager extends IComponentModel {
    #rootSelector;
    #formId;
    #gridId;
    #errorId;
    #unavailableId;

    constructor(rootSelector = "#app-main-context") {
        super();
        this.#rootSelector = rootSelector;
        this.#formId = "#customer-form";
        this.#gridId = "#customer-grid";
        this.#errorId = "#customer-form-error";
        this.#unavailableId = "#customer-api-unavailable";
        this.init();
    }

    buildTemplate() {
        const template = html`
            <section class="customer-page">
                <h1 class="customer-page__title">Clientes</h1>
                <p class="customer-page__subtitle">Adicione e remova clientes salvos localmente.</p>

                <div id="customer-api-unavailable" class="customer-unavailable">
                    API indisponível. Abra o app via Solvi (pywebview) para salvar clientes.
                </div>

                <form id="customer-form" class="customer-form" autocomplete="off">
                    <div class="form-group">
                        <label for="customer-name">Nome</label>
                        <input type="text" id="customer-name" name="name" required placeholder="Nome do cliente">
                    </div>
                    <div class="form-group">
                        <label for="customer-phone">Telefone</label>
                        <input type="text" id="customer-phone" name="phone" placeholder="Telefone">
                    </div>
                    <div class="form-group">
                        <label for="customer-email">E-mail</label>
                        <input type="email" id="customer-email" name="email" placeholder="email@exemplo.com">
                    </div>
                    <div class="form-group">
                        <label for="customer-cep">CEP</label>
                        <input type="text" id="customer-cep" name="cep" placeholder="00000-000">
                    </div>
                    <div class="form-group form-group--full">
                        <label for="customer-address">Endereço</label>
                        <input type="text" id="customer-address" name="address" placeholder="Endereço completo">
                    </div>
                    <div class="form-group form-group--full">
                        <label for="customer-description">Descrição</label>
                        <textarea id="customer-description" name="description" placeholder="Observações sobre o cliente"></textarea>
                    </div>
                    <div class="customer-form__actions">
                        <button type="submit" class="btn btn-primary">Adicionar cliente</button>
                        <p id="customer-form-error" class="customer-form__error">Informe o nome do cliente.</p>
                    </div>
                </form>

                <div id="customer-grid" class="customer-grid" aria-live="polite"></div>
            </section>
        `;

        $(this.#rootSelector).html(template);
    }

    bindEvents() {
        $(this.#formId).on("submit", async (e) => {
            e.preventDefault();
            await this.#handleAdd();
        });

        $(this.#gridId).on("click", "[data-remove-id]", async (e) => {
            const id = $(e.currentTarget).attr("data-remove-id");
            if (!id) return;
            await this.#handleRemove(id);
        });

        this.#loadCustomers();
    }

    #apiAvailable() {
        return Boolean(window.pywebview && window.pywebview.api);
    }

    #showUnavailable() {
        $(this.#unavailableId).addClass("is-visible");
    }

    #hideFormError() {
        $(this.#errorId).removeClass("is-visible");
    }

    #showFormError(message) {
        $(this.#errorId).text(message).addClass("is-visible");
    }

    async #loadCustomers() {
        if (!this.#apiAvailable()) {
            this.#showUnavailable();
            this.#renderCards([]);
            return;
        }

        try {
            const raw = await window.pywebview.api.get_customers();
            const customers = parseApiResult(raw);
            this.#renderCards(Array.isArray(customers) ? customers : []);
        } catch {
            this.#showUnavailable();
            this.#renderCards([]);
        }
    }

    #renderCards(customers) {
        const $grid = $(this.#gridId);

        if (!customers.length) {
            $grid.html(`<div class="customer-empty">Nenhum cliente cadastrado ainda.</div>`);
            return;
        }

        const cards = customers.map((c) => {
            const id = escapeHtml(c.id);
            const name = escapeHtml(c.name);
            const phone = escapeHtml(c.phone || "—");
            const email = escapeHtml(c.email || "—");
            const cep = escapeHtml(c.cep || "—");
            const address = escapeHtml(c.address || "—");
            const description = escapeHtml(c.description || "—");

            return html`
                <article class="card customer-card" data-customer-id="${id}">
                    <div class="card-header">
                        <p class="h5">${name}</p>
                    </div>
                    <div class="card-body">
                        <p><span class="label">Telefone:</span> ${phone}</p>
                        <p><span class="label">E-mail:</span> ${email}</p>
                        <p><span class="label">CEP:</span> ${cep}</p>
                        <p><span class="label">Endereço:</span> ${address}</p>
                        <p><span class="label">Descrição:</span> ${description}</p>
                    </div>
                    <div class="card-footer">
                        <button type="button" class="btn btn-remove" data-remove-id="${id}">Remover</button>
                    </div>
                </article>
            `;
        }).join("");

        $grid.html(cards);
    }

    async #handleAdd() {
        this.#hideFormError();

        if (!this.#apiAvailable()) {
            this.#showUnavailable();
            this.#showFormError("API indisponível.");
            return;
        }

        const name = $("#customer-name").val()?.toString().trim() ?? "";
        const phone = $("#customer-phone").val()?.toString().trim() ?? "";
        const email = $("#customer-email").val()?.toString().trim() ?? "";
        const description = $("#customer-description").val()?.toString().trim() ?? "";
        const cep = $("#customer-cep").val()?.toString().trim() ?? "";
        const address = $("#customer-address").val()?.toString().trim() ?? "";

        if (!name) {
            this.#showFormError("Informe o nome do cliente.");
            return;
        }

        try {
            const raw = await window.pywebview.api.add_customer(
                name, phone, email, description, cep, address
            );
            const result = parseApiResult(raw);

            if (!result || result.error) {
                this.#showFormError(result?.error || "Não foi possível adicionar o cliente.");
                return;
            }

            eventBus.publishAsync("customer:created", result);
            $(this.#formId)[0].reset();
            await this.#loadCustomers();
        } catch {
            this.#showFormError("Erro ao adicionar cliente.");
            eventBus.publishAsync("system:error", { message: "Erro ao adicionar cliente." });
        }
    }

    async #handleRemove(customerId) {
        if (!this.#apiAvailable()) {
            this.#showUnavailable();
            return;
        }

        try {
            const raw = await window.pywebview.api.remove_customer(customerId);
            const result = parseApiResult(raw);
            if (result?.ok) {
                eventBus.publishAsync("customer:removed", { id: customerId });
                await this.#loadCustomers();
            }
        } catch {
            this.#showFormError("Erro ao remover cliente.");
            eventBus.publishAsync("system:error", { message: "Erro ao remover cliente." });
        }
    }
}
