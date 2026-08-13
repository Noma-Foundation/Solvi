import $ from "jquery";

<<<<<<< HEAD
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
    #editingCustomerId;
    #customers = [];

    constructor(rootSelector = "#app-main-context") {
        super();
        this.#rootSelector = rootSelector;
        this.#formId = "#customer-form";
        this.#gridId = "#customer-grid";
        this.#errorId = "#customer-form-error";
        this.#unavailableId = "#customer-api-unavailable";
        this.#editingCustomerId = null;
=======
import { IComponentModel } from "../component-model.js";

import "./customer.css";

const MOCK_CUSTOMERS = [
    {
        initials: "ST",
        name: "Solvi Tecnologia LTDA",
        subtitle: "São Paulo / SP · Enterprise",
        status: "ativo",
    },
    {
        initials: "MV",
        name: "Mercado Vila Nova",
        subtitle: "Campinas / SP · Profissional",
        status: "ativo",
        active: true,
        detail: {
            document: "Empresa (PJ) · 09.887.221/0001-33",
            stats: [
                { label: "Status", value: "Ativo" },
                { label: "Aulas", value: "612" },
                { label: "Valor pago", value: "R$ 1.120" },
            ],
            contact: [
                { label: "E-mail", value: "financeiro@vilanova.com" },
                { label: "Telefone", value: "(11) 94422-1180" },
                { label: "Responsável", value: "Carlos Menezes" },
                { label: "Cargo", value: "Sócio" },
                { label: "Endereço", value: "Rua das Palmeiras, 214" },
                { label: "Cidade / UF", value: "Campinas / SP" },
            ],
            contract: [
                { label: "Plano", value: "Profissional" },
                { label: "Início", value: "12/07/2025" },
                { label: "Renovação", value: "12/07/2026" },
                { label: "Documento", value: "09.887.221/0001-33" },
            ],
            notes: "Prefere contato por WhatsApp. Entregas concentradas no início de semana.",
        },
    },
    {
        initials: "JP",
        name: "Juliana Prado",
        subtitle: "Rio de Janeiro / RJ · Essencial",
        status: "ativo",
    },
];

const STATUS_LABEL = {
    ACTIVE: "ACTIVE",
    PENDING: "PENDING",
    INACTIVE: "INACTIVE",
};

export class CustomerPageComponent extends IComponentModel {
    #rootSelector;

    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
>>>>>>> 21505cc3fae8f2e2fe015b74e2bb23f1cdba8a88
        this.init();
    }

    buildTemplate() {
<<<<<<< HEAD
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
                        <label for="customer-cpf">CPF</label>
                        <input type="text" id="customer-cpf" name="cpf" placeholder="000.000.000-00">
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
                        <button type="submit" class="btn btn-primary" id="customer-submit-button">Adicionar cliente</button>
                        <button type="button" class="btn btn-outline-secondary" id="customer-cancel-edit" hidden>Cancelar edição</button>
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

        $(this.#gridId).on("click", "[data-edit-id]", (e) => {
            const id = $(e.currentTarget).attr("data-edit-id");
            if (!id) return;
            this.#openEdit(id);
        });

        $("#customer-cancel-edit").on("click", () => this.#resetForm());

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
            this.#customers = [];
            this.#renderCards([]);
            return;
        }

        try {
            const raw = await window.pywebview.api.get_customers();
            const customers = parseApiResult(raw);
            this.#customers = Array.isArray(customers) ? customers : [];
            this.#renderCards(this.#customers);
        } catch {
            this.#showUnavailable();
            this.#customers = [];
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
            const cpf = escapeHtml(c.cpf || "—");
            const cep = escapeHtml(c.cep || "—");
            const address = escapeHtml(c.address || "—");
            const description = escapeHtml(c.description || "—");

            return html`
                <article class="card" data-customer-id="${id}">
                    <div class="card-header">
                        <p class="h5">${name}</p>
                    </div>
                    <div class="card-body">
                        <p><span class="label">Telefone:</span> ${phone}</p>
                        <p><span class="label">E-mail:</span> ${email}</p>
                        <p><span class="label">CPF:</span> ${cpf}</p>
                        <p><span class="label">CEP:</span> ${cep}</p>
                        <p><span class="label">Endereço:</span> ${address}</p>
                        <p><span class="label">Descrição:</span> ${description}</p>
                    </div>
                    <div class="card-footer">
                        <button type="button" class="btn btn-edit" data-edit-id="${id}">Editar</button>
                        <button type="button" class="btn btn-remove" data-remove-id="${id}">Remover</button>
                    </div>
                </article>
            `;
        }).join("");

        $grid.html(cards);
    }

    #resetForm() {
        this.#editingCustomerId = null;
        $(this.#formId)[0].reset();
        $("#customer-submit-button").text("Adicionar cliente");
        $("#customer-cancel-edit").prop("hidden", true);
        this.#hideFormError();
    }

    #openEdit(customerId) {
        if (!this.#apiAvailable()) {
            this.#showUnavailable();
            return;
        }

        const customer = this.#findCustomerById(customerId);
        if (!customer) return;

        this.#editingCustomerId = customerId;
        $("#customer-name").val(customer.name || "");
        $("#customer-phone").val(customer.phone || "");
        $("#customer-cpf").val(customer.cpf || "");
        $("#customer-email").val(customer.email || "");
        $("#customer-cep").val(customer.cep || "");
        $("#customer-address").val(customer.address || "");
        $("#customer-description").val(customer.description || "");
        $("#customer-submit-button").text("Salvar edição");
        $("#customer-cancel-edit").prop("hidden", false);
        this.#hideFormError();
    }

    #findCustomerById(customerId) {
        return this.#customers.find((customer) => String(customer.id) === String(customerId));
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
        const cpf = $("#customer-cpf").val()?.toString().trim() ?? "";
        const email = $("#customer-email").val()?.toString().trim() ?? "";
        const description = $("#customer-description").val()?.toString().trim() ?? "";
        const cep = $("#customer-cep").val()?.toString().trim() ?? "";
        const address = $("#customer-address").val()?.toString().trim() ?? "";

        if (!name) {
            this.#showFormError("Informe o nome do cliente.");
            return;
        }

        try {
            if (this.#editingCustomerId) {
                const raw = await window.pywebview.api.update_customer(
                    this.#editingCustomerId,
                    name,
                    phone,
                    email,
                    description,
                    cep,
                    address,
                    cpf,
                );
                const result = parseApiResult(raw);
                if (!result || result.error || result.ok === false) {
                    this.#showFormError(result?.error || "Não foi possível editar o cliente.");
                    return;
                }
                eventBus.publishAsync("customer:updated", result);
                this.#resetForm();
                await this.#loadCustomers();
                return;
            }

            const raw = await window.pywebview.api.add_customer(
                name, phone, email, description, cep, address, cpf
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
            this.#showFormError(this.#editingCustomerId ? "Erro ao editar cliente." : "Erro ao adicionar cliente.");
            eventBus.publishAsync("system:error", { message: this.#editingCustomerId ? "Erro ao editar cliente." : "Erro ao adicionar cliente." });
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
=======
        const selected = MOCK_CUSTOMERS.find(c => c.active) ?? MOCK_CUSTOMERS[0];

        this.template = /* html */ `
            <section class="customer-page d-flex h-100 w-100">
                <aside class="customer-list-panel d-flex flex-column gap-3 p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h3 class="m-0">Clientes</h3>
                        </div>
                        <button type="button" class="btn btn-primary customer-add-btn button-font" id="add-client-btn">Adicionar</button>
                    </div>

                    <input type="text" class="form-control customer-search-input" placeholder="Buscar por nome, CNPJ ou cidade">

                    <ul class="customer-list list-unstyled d-flex flex-column gap-1 m-0 overflow-auto">
                        ${MOCK_CUSTOMERS.map(customer => this.#buildListItem(customer, customer === selected)).join("")}
                    </ul>
                </aside>

                <main class="customer-detail-panel flex-grow-1 p-4 overflow-auto d-flex flex-column gap-4">
                    ${this.#buildDetail(selected)}
                </main>
            </section>
        `;

        $(this.context).html(this.template);
    }

    bindEvents() {
        const addClientBtn = $("#add-client-btn").on("click", () => { 
            console.log("Append client");
        });    
    }

    #buildListItem(customer, isActive) {
        return /* html */ `
            <li class="customer-list-item d-flex align-items-center gap-2 p-2 rounded-3${isActive ? " active" : ""}">
                <span class="customer-avatar d-flex align-items-center justify-content-center rounded-circle">${customer.initials}</span>
                <span class="d-flex flex-column flex-grow-1 min-width-0">
                    <span class="customer-list-item-name text-truncate fw-semibold">${customer.name}</span>
                    <span class="customer-list-item-subtitle text-truncate">${customer.subtitle}</span>
                </span>
                <span class="badge rounded-pill customer-status-badge status-${customer.status}">${STATUS_LABEL[customer.status]}</span>
            </li>
        `;
    }

    #buildDetail(customer) {
        const detail = customer.detail;

        return /* html */ `
            <div class="d-flex gap-3">
                ${detail.stats.map(stat => /* html */ `
                    <div class="customer-stat-card card border-0 flex-fill p-3">
                        <p class="customer-field-label m-0">${stat.label}</p>
                        <p class="customer-stat-value m-0 fw-semibold">${stat.value}</p>
                    </div>
                `).join("")}
            </div>

            <section>
                <p class="customer-section-title">Contato</p>
                <div class="card customer-info-card">
                    ${this.#buildInfoGrid(detail.contact)}
                </div>
            </section>

            <section>
                <p class="customer-section-title">Contrato</p>
                <div class="card customer-info-card">
                    ${this.#buildInfoGrid(detail.contract)}
                </div>
            </section>

            <section>
                <p class="customer-section-title">Observações</p>
                <div class="card customer-info-card customer-notes">
                    <p class="m-0">${detail.notes}</p>
                </div>
            </section>

            <section>
                <button type="button" class="btn button-font">Delete</button>
                <button type="button" class="btn btn-primary customer-add-btn button-font" id="add-client-btn">Edit</button>
            </section>
        `;
    }

    #buildInfoGrid(fields) {
        return fields.map(field => /* html */ `
            <div class="customer-info-field">
                <p class="customer-field-label m-0">${field.label}</p>
                <p class="customer-field-value m-0 fw-medium">${field.value}</p>
            </div>
        `).join("");
    }

>>>>>>> 21505cc3fae8f2e2fe015b74e2bb23f1cdba8a88
}
