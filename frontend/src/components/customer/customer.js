import $ from "jquery";

import { IComponentModel } from "../component-model.js";

import "./customer.css";

export class CustomerPageComponent extends IComponentModel {
    #rootSelector;

    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
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

                    <ul class="customer-list list-unstyled d-flex flex-column gap-1 m-0 overflow-auto">
                        <li class="customer-list-item d-flex align-items-center gap-2 p-2 rounded-3 active">
                            <span class="customer-avatar d-flex align-items-center justify-content-center rounded-circle">CL</span>
                            <span class="d-flex flex-column flex-grow-1 min-width-0">
                                <span class="customer-list-item-name text-truncate fw-semibold">Nome do cliente</span>
                                <span class="customer-list-item-subtitle text-truncate">Cidade / UF · Plano</span>
                            </span>
                            <span class="badge rounded-pill customer-status-badge status-ativo">ACTIVE</span>
                        </li>
                    </ul>
                </aside>

                <main class="customer-detail-panel flex-grow-1 p-4 overflow-auto d-flex flex-column gap-4">
                    <div class="d-flex gap-3">
                        <div class="customer-stat-card card border-0 flex-fill p-3">
                            <p class="customer-field-label m-0">Status</p>
                            <p class="customer-stat-value m-0 fw-semibold">-</p>
                        </div>
                        <div class="customer-stat-card card border-0 flex-fill p-3">
                            <p class="customer-field-label m-0">Aulas</p>
                            <p class="customer-stat-value m-0 fw-semibold">-</p>
                        </div>
                        <div class="customer-stat-card card border-0 flex-fill p-3">
                            <p class="customer-field-label m-0">Valor pago</p>
                            <p class="customer-stat-value m-0 fw-semibold">-</p>
                        </div>
                    </div>

                    <section>
                        <p class="customer-section-title">Contato</p>
                        <div class="card customer-info-card">
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">E-mail</p>
                                <p class="customer-field-value m-0 fw-medium">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Telefone</p>
                                <p class="customer-field-value m-0 fw-medium">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Responsável</p>
                                <p class="customer-field-value m-0 fw-medium">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Cargo</p>
                                <p class="customer-field-value m-0 fw-medium">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Endereço</p>
                                <p class="customer-field-value m-0 fw-medium">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Cidade / UF</p>
                                <p class="customer-field-value m-0 fw-medium">-</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <p class="customer-section-title">Contrato</p>
                        <div class="card customer-info-card">
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Plano</p>
                                <p class="customer-field-value m-0 fw-medium">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Início</p>
                                <p class="customer-field-value m-0 fw-medium">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Renovação</p>
                                <p class="customer-field-value m-0 fw-medium">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Documento</p>
                                <p class="customer-field-value m-0 fw-medium">-</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <p class="customer-section-title">Observações</p>
                        <div class="card customer-info-card customer-notes">
                            <p class="m-0">-</p>
                        </div>
                    </section>

                    <section>
                        <button type="button" class="btn button-font" id="delete-client-btn">Delete</button>
                        <button type="button" class="btn btn-primary customer-add-btn button-font" id="edit-client-btn">Edit</button>
                    </section>
                </main>
            </section>
        `;

        $(this.context).html(this.template);
    }

    bindEvents() {
        $("#add-client-btn").on("click", () => {
            console.log("Append client");
        });

        $("#edit-client-btn").on("click", () => {
            console.log("Edit client");
        });

        $("#delete-client-btn").on("click", () => {
            console.log("Delete client");
        });
    }

}
