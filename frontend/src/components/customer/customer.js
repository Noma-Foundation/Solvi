import $ from "jquery";

import { IComponentModel } from "../component-model.js";

import "./customer.css";

export class CustomerPageComponent extends IComponentModel {
    #rootSelector;
    #clientSelected;
    #clientsLenght;
    #clients;

    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
        this.#clientSelected = null;
        this.#clientsLenght = 0;
        this.#clients = [];
        this.init();
    }

    buildTemplate() {
        this.template = /* html */ `
            <section class="customer-page d-flex h-100 w-100">
                <aside class="customer-list-panel d-flex flex-column gap-3 p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h3 class="m-0">Clientes</h3>
                        </div>
                        <button type="button" class="btn btn-primary customer-add-btn button-font" id="add-client-btn">Add client</button>
                    </div>

                    <input type="text" class="form-control customer-search-input" placeholder="Search by name...">

                    <ul class="customer-list list-unstyled d-flex flex-column gap-1 m-0 overflow-auto" id="customer-list-ul">
                    </ul>
                </aside>

                <main class="customer-detail-panel flex-grow-1 p-4 overflow-auto d-flex flex-column gap-4">
                    <div class="d-flex align-items-center gap-3">
                        <span class="customer-avatar large d-flex align-items-center justify-content-center rounded-circle" id="customer-detail-avatar">-</span>
                        <div>
                            <h4 class="m-0" id="customer-detail-name">Selecione um cliente</h4>
                            <span class="badge rounded-pill customer-status-badge" id="customer-detail-status-badge">-</span>
                        </div>
                    </div>

                    <div class="d-flex gap-3">
                        <div class="customer-stat-card card border-0 flex-fill p-3">
                            <p class="customer-field-label m-0">Status</p>
                            <p class="customer-stat-value m-0 fw-semibold" id="customer-detail-status">-</p>
                        </div>
                        <div class="customer-stat-card card border-0 flex-fill p-3">
                            <p class="customer-field-label m-0">Aulas</p>
                            <p class="customer-stat-value m-0 fw-semibold" id="customer-detail-aulas">-</p>
                        </div>
                        <div class="customer-stat-card card border-0 flex-fill p-3">
                            <p class="customer-field-label m-0">Valor pago</p>
                            <p class="customer-stat-value m-0 fw-semibold" id="customer-detail-valor-pago">-</p>
                        </div>
                    </div>

                    <section>
                        <p class="customer-section-title">Contato</p>
                        <div class="card customer-info-card">
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">E-mail</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-email">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Telefone</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-telefone">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Responsável</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-responsavel">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Cargo</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-cargo">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Endereço</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-endereco">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Cidade / UF</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-cidade">-</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <p class="customer-section-title">Contrato</p>
                        <div class="card customer-info-card">
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Plano</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-plano">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Início</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-inicio">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Renovação</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-renovacao">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Documento</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-documento">-</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <p class="customer-section-title">Observações</p>
                        <div class="card customer-info-card customer-notes">
                            <p class="m-0" id="customer-detail-notes">-</p>
                        </div>
                    </section>

                    <section class="d-flex justify-content-end align-items-center gap-3 p-0">
                        <button type="button" class="btn button-font" id="delete-client-btn">Delete</button>
                        <button type="button" class="btn btn-primary customer-add-btn button-font" id="edit-client-btn">Edit</button>
                    </section>
                </main>
            </section>
        `;

        $(this.context).html(this.template);
    }

    bindEvents() {
        $("#customer-list-ul").on("click", (event) => {
            const target = $(event.target).closest(".customer-list-item");
            if (!target.length) { return; }
            this.#switchClientSelected(target);
        });
        
        $("#add-client-btn").on("click", () => {
            this.#addClient();
        });

        $("#edit-client-btn").on("click", () => {
            console.log("Edit client");
        });

        $("#delete-client-btn").on("click", () => {
            console.log("Delete client");
        });
    }

    #switchClientSelected(target) {
        $("#customer-list-ul .customer-list-item").removeClass("active");
        target.addClass("active");
        this.#clientSelected = target.data("index");
        this.#renderClientDetail(this.#clients[this.#clientSelected]);
    }

    #addClient() {
        const client = {
            name: "Nome do cliente",
            initials: "CL",
            cidadeUf: "Cidade / UF",
            plano: "Plano",
            status: "pending",
            statusLabel: "Pendente",
            aulas: "-",
            valorPago: "-",
            email: "-",
            telefone: "-",
            responsavel: "-",
            cargo: "-",
            endereco: "-",
            inicio: "-",
            renovacao: "-",
            documento: "-",
            observacoes: "-",
        };
        const index = this.#clientsLenght;
        this.#clients.push(client);
        $("#customer-list-ul").append(this.#listComponent(client, index));
        this.#clientsLenght++;
    }

    #renderClientDetail(client) {
        if (!client) { return; }

        $("#customer-detail-avatar").text(client.initials);
        $("#customer-detail-name").text(client.name);
        $("#customer-detail-status-badge")
            .attr("class", `badge rounded-pill customer-status-badge status-${client.status}`)
            .text(client.statusLabel);

        $("#customer-detail-status").text(client.statusLabel);
        $("#customer-detail-aulas").text(client.aulas);
        $("#customer-detail-valor-pago").text(client.valorPago);

        $("#customer-detail-email").text(client.email);
        $("#customer-detail-telefone").text(client.telefone);
        $("#customer-detail-responsavel").text(client.responsavel);
        $("#customer-detail-cargo").text(client.cargo);
        $("#customer-detail-endereco").text(client.endereco);
        $("#customer-detail-cidade").text(client.cidadeUf);

        $("#customer-detail-plano").text(client.plano);
        $("#customer-detail-inicio").text(client.inicio);
        $("#customer-detail-renovacao").text(client.renovacao);
        $("#customer-detail-documento").text(client.documento);

        $("#customer-detail-notes").text(client.observacoes);
    }

    #listComponent(client, index) {
        return /* html */ `
            <li class="customer-list-item d-flex align-items-center gap-2 p-2 rounded-3" data-index="${index}">
                <span class="customer-avatar d-flex align-items-center justify-content-center rounded-circle">${client.initials}</span>
                <span class="d-flex flex-column flex-grow-1 min-width-0">
                    <span class="customer-list-item-name text-truncate fw-semibold">${client.name}</span>
                    <span class="customer-list-item-subtitle text-truncate">${client.cidadeUf} · ${client.plano}</span>
                </span>
                <span class="badge rounded-pill customer-status-badge status-${client.status}">${client.statusLabel}</span>
            </li>
        `;
    }

}
