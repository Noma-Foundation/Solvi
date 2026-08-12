import $ from "jquery";

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
        this.init();
    }

    buildTemplate() {
        const selected = MOCK_CUSTOMERS.find(c => c.active) ?? MOCK_CUSTOMERS[0];

        this.template = /* html */ `
            <section class="customer-page d-flex h-100 w-100">
                <aside class="customer-list-panel d-flex flex-column gap-3 p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h3 class="m-0">Clientes</h3>
                        </div>
                        <button type="button" class="btn btn-primary customer-add-btn" id="add-client-btn">Adicionar</button>
                    </div>

                    <input type="text" class="form-control customer-search-input" placeholder="Buscar por nome, CNPJ ou cidade">

                    <p class="customer-count m-0">${MOCK_CUSTOMERS.length} de ${MOCK_CUSTOMERS.length} clientes</p>

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

}
