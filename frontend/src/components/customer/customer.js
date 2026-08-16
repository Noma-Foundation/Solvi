import $ from "jquery";
import { Modal } from "bootstrap";

import { IComponentModel } from "../component-model.js";

import "./customer.css";

const STATUS_LABELS = {
    active: "Ativo",
    pending: "Pendente",
    inactive: "Inativo",
};

export class CustomerPageComponent extends IComponentModel {
    #rootSelector;
    #clientSelected;
    #clientsLenght;
    #clients;
    #addClientModal;
    #editClientModal;
    #nextClientId;

    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
        this.#clientSelected = null;
        this.#clientsLenght = 0;
        this.#clients = [];
        this.#nextClientId = 1;
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
                        <button type="button" class="btn button-font" id="delete-client-btn" disabled>Delete</button>
                        <button type="button" class="btn btn-primary customer-add-btn button-font" id="edit-client-btn" disabled>Edit</button>
                    </section>
                </main>
            </section>

            <div class="modal fade" id="add-client-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <form id="add-client-form">
                            <div class="modal-header">
                                <h5 class="modal-title">Novo cliente</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body d-flex flex-column gap-3">
                                <div class="form-group">
                                    <label for="add-client-name-input" class="form-label customer-field-label">Nome</label>
                                    <input type="text" class="form-control" id="add-client-name-input" required>
                                </div>
                                <div class="form-group">
                                    <label for="add-client-email-input" class="form-label customer-field-label">E-mail</label>
                                    <input type="email" class="form-control" id="add-client-email-input" required>
                                </div>
                                <p class="text-danger m-0" id="add-client-error" style="display: none;">Não foi possível criar o cliente.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary customer-add-btn button-font">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="edit-client-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <!-- Customer Editor -->
                        <form id="edit-client-form" class="">
                            <div class="modal-header">
                                <h5 class="modal-title">Editar cliente</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body d-flex flex-column gap-4">
                                <div class="form-group">
                                    <label for="edit-client-name-input" class="form-label customer-field-label">Nome</label>
                                    <input type="text" class="form-control" id="edit-client-name-input" required>
                                </div>

                                <section>
                                    <p class="customer-section-title">Status</p>
                                    <div class="row g-3">
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-status-input" class="form-label customer-field-label">Status</label>
                                            <select class="form-select" id="edit-client-status-input">
                                                <option value="active">Ativo</option>
                                                <option value="pending">Pendente</option>
                                                <option value="inactive">Inativo</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-status-label-input" class="form-label customer-field-label">Rótulo do status</label>
                                            <input type="text" class="form-control" id="edit-client-status-label-input">
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-aulas-input" class="form-label customer-field-label">Aulas</label>
                                            <input type="text" class="form-control" id="edit-client-aulas-input">
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-valor-pago-input" class="form-label customer-field-label">Valor pago</label>
                                            <input type="text" class="form-control" id="edit-client-valor-pago-input">
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <p class="customer-section-title">Contato</p>
                                    <div class="row g-3">
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-email-input" class="form-label customer-field-label">E-mail</label>
                                            <input type="email" class="form-control" id="edit-client-email-input" required>
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-telefone-input" class="form-label customer-field-label">Telefone</label>
                                            <input type="text" class="form-control" id="edit-client-telefone-input">
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-responsavel-input" class="form-label customer-field-label">Responsável</label>
                                            <input type="text" class="form-control" id="edit-client-responsavel-input">
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-cargo-input" class="form-label customer-field-label">Cargo</label>
                                            <input type="text" class="form-control" id="edit-client-cargo-input">
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-endereco-input" class="form-label customer-field-label">Endereço</label>
                                            <input type="text" class="form-control" id="edit-client-endereco-input">
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-cidade-input" class="form-label customer-field-label">Cidade / UF</label>
                                            <input type="text" class="form-control" id="edit-client-cidade-input">
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <p class="customer-section-title">Contrato</p>
                                    <div class="row g-3">
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-plano-input" class="form-label customer-field-label">Plano</label>
                                            <input type="text" class="form-control" id="edit-client-plano-input">
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-inicio-input" class="form-label customer-field-label">Início</label>
                                            <input type="text" class="form-control" id="edit-client-inicio-input">
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-renovacao-input" class="form-label customer-field-label">Renovação</label>
                                            <input type="text" class="form-control" id="edit-client-renovacao-input">
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="edit-client-documento-input" class="form-label customer-field-label">Documento</label>
                                            <input type="text" class="form-control" id="edit-client-documento-input">
                                        </div>
                                    </div>
                                </section>

                                <div class="form-group">
                                    <label for="edit-client-notes-input" class="form-label customer-field-label">Observações</label>
                                    <textarea class="form-control" id="edit-client-notes-input" rows="3"></textarea>
                                </div>

                                <p class="text-danger m-0" id="edit-client-error" style="display: none;">Não foi possível salvar as alterações.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary customer-add-btn button-font">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        $(this.context).html(this.template);
        this.#addClientModal = new Modal(document.getElementById("add-client-modal"));
        this.#editClientModal = new Modal(document.getElementById("edit-client-modal"));
    }

    bindEvents() {
        $("#customer-list-ul").on("click", (event) => {
            const target = $(event.target).closest(".customer-list-item");
            if (!target.length) { return; }
            this.#switchClientSelected(target);
        });
        
        $("#add-client-btn").on("click", () => {
            $("#add-client-form")[0].reset();
            $("#add-client-error").hide();
            this.#addClientModal.show();
        });

        $("#add-client-form").on("submit", (event) => {
            event.preventDefault();
            this.#addClient();
        });

        $("#edit-client-btn").on("click", () => {
            const client = this.#getSelectedClient();
            if (!client) { return; }

            this.#fillEditForm(client);
            $("#edit-client-error").hide();
            this.#editClientModal.show();
        });

        $("#edit-client-status-input").on("change", (event) => {
            $("#edit-client-status-label-input").val(STATUS_LABELS[event.target.value] ?? "");
        });

        $("#edit-client-form").on("submit", (event) => {
            event.preventDefault();
            this.#editClient();
        });

        $("#delete-client-btn").on("click", () => {
            this.#deleteClient();
        });
    }

    #getSelectedClient() {
        if (this.#clientSelected === null) { return null; }
        return this.#clients.find((client) => client.id === this.#clientSelected) ?? null;
    }

    #switchClientSelected(target) {
        $("#customer-list-ul .customer-list-item").removeClass("active");
        target.addClass("active");
        this.#clientSelected = target.data("id");
        this.#renderClientDetail(this.#getSelectedClient());
        $("#edit-client-btn, #delete-client-btn").prop("disabled", false);
    }

    async #addClient() {
        const name = $("#add-client-name-input").val().trim();
        const email = $("#add-client-email-input").val().trim();

        if (!name || !email) { return; }

        $("#add-client-error").hide();

        try {
            const customer = await window.pywebview.api.add_client(name, email);

            const client = {
                id: this.#nextClientId++,
                name: customer.name,
                initials: this.#getInitials(customer.name),
                cidadeUf: "Cidade / UF",
                plano: "Plano",
                status: "pending",
                statusLabel: "Pendente",
                aulas: "-",
                valorPago: "-",
                email: customer.email,
                telefone: "-",
                responsavel: "-",
                cargo: "-",
                endereco: "-",
                inicio: "-",
                renovacao: "-",
                documento: "-",
                observacoes: "-",
            };

            this.#clients.push(client);
            $("#customer-list-ul").append(this.#listComponent(client));
            this.#clientsLenght++;

            this.#addClientModal.hide();
        } catch (error) {
            $("#add-client-error").show();
        }
    }

    #fillEditForm(client) {
        $("#edit-client-name-input").val(client.name);
        $("#edit-client-status-input").val(client.status);
        $("#edit-client-status-label-input").val(client.statusLabel);
        $("#edit-client-aulas-input").val(this.#toEditValue(client.aulas));
        $("#edit-client-valor-pago-input").val(this.#toEditValue(client.valorPago));
        $("#edit-client-email-input").val(client.email);
        $("#edit-client-telefone-input").val(this.#toEditValue(client.telefone));
        $("#edit-client-responsavel-input").val(this.#toEditValue(client.responsavel));
        $("#edit-client-cargo-input").val(this.#toEditValue(client.cargo));
        $("#edit-client-endereco-input").val(this.#toEditValue(client.endereco));
        $("#edit-client-cidade-input").val(this.#toEditValue(client.cidadeUf));
        $("#edit-client-plano-input").val(this.#toEditValue(client.plano));
        $("#edit-client-inicio-input").val(this.#toEditValue(client.inicio));
        $("#edit-client-renovacao-input").val(this.#toEditValue(client.renovacao));
        $("#edit-client-documento-input").val(this.#toEditValue(client.documento));
        $("#edit-client-notes-input").val(this.#toEditValue(client.observacoes));
    }

    #toEditValue(value) {
        return value === "-" ? "" : value;
    }

    #fromEditValue(value) {
        const trimmed = value.trim();
        return trimmed || "-";
    }

    #editClient() {
        const client = this.#getSelectedClient();
        if (!client) { return; }

        const name = $("#edit-client-name-input").val().trim();
        const email = $("#edit-client-email-input").val().trim();
        const status = $("#edit-client-status-input").val();

        if (!name || !email) { return; }

        client.name = name;
        client.email = email;
        client.initials = this.#getInitials(name);
        client.status = status;
        client.statusLabel = $("#edit-client-status-label-input").val().trim() || STATUS_LABELS[status];
        client.aulas = this.#fromEditValue($("#edit-client-aulas-input").val());
        client.valorPago = this.#fromEditValue($("#edit-client-valor-pago-input").val());
        client.telefone = this.#fromEditValue($("#edit-client-telefone-input").val());
        client.responsavel = this.#fromEditValue($("#edit-client-responsavel-input").val());
        client.cargo = this.#fromEditValue($("#edit-client-cargo-input").val());
        client.endereco = this.#fromEditValue($("#edit-client-endereco-input").val());
        client.cidadeUf = this.#fromEditValue($("#edit-client-cidade-input").val());
        client.plano = this.#fromEditValue($("#edit-client-plano-input").val());
        client.inicio = this.#fromEditValue($("#edit-client-inicio-input").val());
        client.renovacao = this.#fromEditValue($("#edit-client-renovacao-input").val());
        client.documento = this.#fromEditValue($("#edit-client-documento-input").val());
        client.observacoes = this.#fromEditValue($("#edit-client-notes-input").val());

        const listItem = $(`#customer-list-ul .customer-list-item[data-id="${client.id}"]`);
        listItem.find(".customer-avatar").text(client.initials);
        listItem.find(".customer-list-item-name").text(client.name);
        listItem.find(".customer-list-item-subtitle").text(`${client.cidadeUf} · ${client.plano}`);
        listItem.find(".customer-status-badge")
            .attr("class", `badge rounded-pill customer-status-badge status-${client.status}`)
            .text(client.statusLabel);

        this.#renderClientDetail(client);
        this.#editClientModal.hide();
    }

    #deleteClient() {
        const client = this.#getSelectedClient();
        if (!client) { return; }

        this.#clients = this.#clients.filter((item) => item.id !== client.id);
        $(`#customer-list-ul .customer-list-item[data-id="${client.id}"]`).remove();
        this.#clientsLenght--;
        this.#clientSelected = null;

        this.#resetClientDetail();
    }

    #resetClientDetail() {
        $("#edit-client-btn, #delete-client-btn").prop("disabled", true);

        $("#customer-detail-avatar").text("-");
        $("#customer-detail-name").text("Selecione um cliente");
        $("#customer-detail-status-badge").attr("class", "badge rounded-pill customer-status-badge").text("-");

        $("#customer-detail-status, #customer-detail-aulas, #customer-detail-valor-pago").text("-");
        $("#customer-detail-email, #customer-detail-telefone, #customer-detail-responsavel, #customer-detail-cargo, #customer-detail-endereco, #customer-detail-cidade").text("-");
        $("#customer-detail-plano, #customer-detail-inicio, #customer-detail-renovacao, #customer-detail-documento").text("-");
        $("#customer-detail-notes").text("-");
    }

    #getInitials(name) {
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("");
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

    #listComponent(client) {
        return /* html */ `
            <li class="customer-list-item d-flex align-items-center gap-2 p-2 rounded-3" data-id="${client.id}">
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
