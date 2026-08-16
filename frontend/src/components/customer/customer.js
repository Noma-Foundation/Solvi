import $ from "jquery";
import { Modal } from "bootstrap";

import { IComponentModel } from "../component-model.js";

import "./customer.css";

const STATUS_LABELS = {
    active: "Ativo",
    pending: "Pendente",
    inactive: "Inativo",
};

/**
 * Customer management page. Renders a master-detail layout (client list on the
 * left, selected client's details on the right) plus "add" and "edit" modals,
 * and keeps an in-memory client list in sync with the DOM.
 *
 * @extends IComponentModel
 */
export class CustomerPageComponent extends IComponentModel {
    /** @type {number|null} - ID of the currently selected client, or null when none is selected. */
    #clientSelected;
    /** @type {Map<number, object>} - All known clients, keyed by client ID. */
    #clients;
    /** @type {Map<number, JQuery>} - Cached jQuery reference to each client's `<li>` in the list, keyed by client ID. */
    #listItems;
    /** @type {Modal} - Bootstrap modal instance for creating a client. */
    #addClientModal;
    /** @type {Modal} - Bootstrap modal instance for editing the selected client. */
    #editClientModal;
    /** @type {number} - Auto-incrementing ID assigned to the next client created client-side. */
    #nextClientId;
    /** @type {object} - Cache of jQuery-wrapped static DOM elements, populated once by {@link #cacheDom}. */
    #dom;

    /**
     * @constructs {CustomerPageComponent}
     * @param {String} [rootSelector="#app-main-context"] - Selector of the element this component is rendered into.
     */
    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
        this.#clientSelected = null;
        this.#clients = new Map();
        this.#listItems = new Map();
        this.#nextClientId = 1;
        this.init();
    }

    /**
     * Builds the page markup (client list panel, detail panel, add/edit modals),
     * injects it into the DOM, caches element references, and instantiates the
     * Bootstrap modals. Called once by {@link IComponentModel#init}.
     */
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
        this.#cacheDom();
        this.#addClientModal = new Modal(document.getElementById("add-client-modal"));
        this.#editClientModal = new Modal(document.getElementById("edit-client-modal"));
    }

    /**
     * Resolves and caches every static DOM element the component reads or
     * writes repeatedly (detail fields, form inputs, buttons), so later
     * operations reuse the jQuery wrappers instead of re-querying the DOM.
     * Must run after the template has been injected into the page.
     */
    #cacheDom() {
        this.#dom = {
            listUl: $("#customer-list-ul"),
            addClientBtn: $("#add-client-btn"),
            addClientForm: $("#add-client-form"),
            addClientError: $("#add-client-error"),
            addClientNameInput: $("#add-client-name-input"),
            addClientEmailInput: $("#add-client-email-input"),
            editClientBtn: $("#edit-client-btn"),
            deleteClientBtn: $("#delete-client-btn"),
            editClientForm: $("#edit-client-form"),
            editClientError: $("#edit-client-error"),
            detail: {
                avatar: $("#customer-detail-avatar"),
                name: $("#customer-detail-name"),
                statusBadge: $("#customer-detail-status-badge"),
                status: $("#customer-detail-status"),
                aulas: $("#customer-detail-aulas"),
                valorPago: $("#customer-detail-valor-pago"),
                email: $("#customer-detail-email"),
                telefone: $("#customer-detail-telefone"),
                responsavel: $("#customer-detail-responsavel"),
                cargo: $("#customer-detail-cargo"),
                endereco: $("#customer-detail-endereco"),
                cidade: $("#customer-detail-cidade"),
                plano: $("#customer-detail-plano"),
                inicio: $("#customer-detail-inicio"),
                renovacao: $("#customer-detail-renovacao"),
                documento: $("#customer-detail-documento"),
                notes: $("#customer-detail-notes"),
            },
            edit: {
                name: $("#edit-client-name-input"),
                status: $("#edit-client-status-input"),
                statusLabel: $("#edit-client-status-label-input"),
                aulas: $("#edit-client-aulas-input"),
                valorPago: $("#edit-client-valor-pago-input"),
                email: $("#edit-client-email-input"),
                telefone: $("#edit-client-telefone-input"),
                responsavel: $("#edit-client-responsavel-input"),
                cargo: $("#edit-client-cargo-input"),
                endereco: $("#edit-client-endereco-input"),
                cidade: $("#edit-client-cidade-input"),
                plano: $("#edit-client-plano-input"),
                inicio: $("#edit-client-inicio-input"),
                renovacao: $("#edit-client-renovacao-input"),
                documento: $("#edit-client-documento-input"),
                notes: $("#edit-client-notes-input"),
            },
        };
    }

    /**
     * Wires up all user interactions: selecting a client in the list, opening
     * the add/edit modals, submitting the add/edit forms, syncing the status
     * label when the status dropdown changes, and deleting the selected client.
     * Called once by {@link IComponentModel#init}, after {@link buildTemplate}.
     */
    bindEvents() {
        const dom = this.#dom;

        dom.listUl.on("click", (event) => {
            const target = $(event.target).closest(".customer-list-item");
            if (!target.length) { return; }
            this.#switchClientSelected(target.data("id"));
        });

        dom.addClientBtn.on("click", () => {
            dom.addClientForm[0].reset();
            dom.addClientError.hide();
            this.#addClientModal.show();
        });

        dom.addClientForm.on("submit", (event) => {
            event.preventDefault();
            this.#addClient();
        });

        dom.editClientBtn.on("click", () => {
            const client = this.#getSelectedClient();
            if (!client) { return; }

            this.#fillEditForm(client);
            dom.editClientError.hide();
            this.#editClientModal.show();
        });

        dom.edit.status.on("change", (event) => {
            dom.edit.statusLabel.val(STATUS_LABELS[event.target.value] ?? "");
        });

        dom.editClientForm.on("submit", (event) => {
            event.preventDefault();
            this.#editClient();
        });

        dom.deleteClientBtn.on("click", () => {
            this.#deleteClient();
        });
    }

    /**
     * Looks up the currently selected client.
     *
     * @returns {object|null} - The selected client, or null if none is selected.
     */
    #getSelectedClient() {
        if (this.#clientSelected === null) { return null; }
        return this.#clients.get(this.#clientSelected) ?? null;
    }

    /**
     * Marks a client as the active selection: toggles the "active" class on the
     * corresponding list items, re-renders the detail panel for the new
     * selection, and enables the edit/delete buttons.
     *
     * @param {number} clientId - ID of the client to select.
     */
    #switchClientSelected(clientId) {
        const previous = this.#getSelectedClient();
        if (previous) {
            this.#listItems.get(previous.id)?.removeClass("active");
        }

        this.#clientSelected = clientId;
        this.#listItems.get(clientId)?.addClass("active");

        this.#renderClientDetail(this.#getSelectedClient());
        this.#dom.editClientBtn.prop("disabled", false);
        this.#dom.deleteClientBtn.prop("disabled", false);
    }

    /**
     * Reads the add-client form, calls the backend API to create the client,
     * and on success builds a new client record (with placeholder defaults for
     * fields the API doesn't return), stores it, appends its list item, and
     * closes the modal. Shows an inline error and leaves the modal open on failure.
     *
     * @async
     */
    async #addClient() {
        const name = this.#dom.addClientNameInput.val().trim();
        const email = this.#dom.addClientEmailInput.val().trim();

        if (!name || !email) { return; }

        this.#dom.addClientError.hide();

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

            this.#clients.set(client.id, client);

            const $listItem = $(this.#listComponent(client));
            this.#listItems.set(client.id, $listItem);
            this.#dom.listUl.append($listItem);

            this.#addClientModal.hide();
        } catch (error) {
            this.#dom.addClientError.show();
        }
    }

    /**
     * Populates every field of the edit form with a client's current data.
     *
     * @param {object} client - The client whose data should fill the form.
     */
    #fillEditForm(client) {
        const edit = this.#dom.edit;
        edit.name.val(client.name);
        edit.status.val(client.status);
        edit.statusLabel.val(client.statusLabel);
        edit.aulas.val(this.#toEditValue(client.aulas));
        edit.valorPago.val(this.#toEditValue(client.valorPago));
        edit.email.val(client.email);
        edit.telefone.val(this.#toEditValue(client.telefone));
        edit.responsavel.val(this.#toEditValue(client.responsavel));
        edit.cargo.val(this.#toEditValue(client.cargo));
        edit.endereco.val(this.#toEditValue(client.endereco));
        edit.cidade.val(this.#toEditValue(client.cidadeUf));
        edit.plano.val(this.#toEditValue(client.plano));
        edit.inicio.val(this.#toEditValue(client.inicio));
        edit.renovacao.val(this.#toEditValue(client.renovacao));
        edit.documento.val(this.#toEditValue(client.documento));
        edit.notes.val(this.#toEditValue(client.observacoes));
    }

    /**
     * Converts a stored client value into what an edit form input should show:
     * the placeholder "-" used for empty fields is displayed as an empty input.
     *
     * @param {String} value - Stored value (e.g. "-" or an actual value).
     * @returns {String} - Value ready to be placed in a form input.
     */
    #toEditValue(value) {
        return value === "-" ? "" : value;
    }

    /**
     * Converts a raw form input value back into the stored representation:
     * trims it, and falls back to the "-" placeholder when left blank.
     *
     * @param {String} value - Raw value read from a form input.
     * @returns {String} - Value ready to be stored on the client record.
     */
    #fromEditValue(value) {
        const trimmed = value.trim();
        return trimmed || "-";
    }

    /**
     * Validates and applies the edit form's values to the selected client,
     * updates its list item in place, re-renders the detail panel, and closes
     * the edit modal. No-ops if no client is selected or required fields
     * (name, e-mail) are empty.
     */
    #editClient() {
        const client = this.#getSelectedClient();
        if (!client) { return; }

        const edit = this.#dom.edit;
        const name = edit.name.val().trim();
        const email = edit.email.val().trim();
        const status = edit.status.val();

        if (!name || !email) { return; }

        client.name = name;
        client.email = email;
        client.initials = this.#getInitials(name);
        client.status = status;
        client.statusLabel = edit.statusLabel.val().trim() || STATUS_LABELS[status];
        client.aulas = this.#fromEditValue(edit.aulas.val());
        client.valorPago = this.#fromEditValue(edit.valorPago.val());
        client.telefone = this.#fromEditValue(edit.telefone.val());
        client.responsavel = this.#fromEditValue(edit.responsavel.val());
        client.cargo = this.#fromEditValue(edit.cargo.val());
        client.endereco = this.#fromEditValue(edit.endereco.val());
        client.cidadeUf = this.#fromEditValue(edit.cidade.val());
        client.plano = this.#fromEditValue(edit.plano.val());
        client.inicio = this.#fromEditValue(edit.inicio.val());
        client.renovacao = this.#fromEditValue(edit.renovacao.val());
        client.documento = this.#fromEditValue(edit.documento.val());
        client.observacoes = this.#fromEditValue(edit.notes.val());

        const $listItem = this.#listItems.get(client.id);
        if ($listItem) {
            $listItem.find(".customer-avatar").text(client.initials);
            $listItem.find(".customer-list-item-name").text(client.name);
            $listItem.find(".customer-list-item-subtitle").text(`${client.cidadeUf} · ${client.plano}`);
            $listItem.find(".customer-status-badge")
                .attr("class", `badge rounded-pill customer-status-badge status-${client.status}`)
                .text(client.statusLabel);
        }

        this.#renderClientDetail(client);
        this.#editClientModal.hide();
    }

    /**
     * Removes the selected client from the in-memory list and the DOM, clears
     * the selection, and resets the detail panel to its empty state. No-op if
     * no client is selected.
     */
    #deleteClient() {
        const client = this.#getSelectedClient();
        if (!client) { return; }

        this.#clients.delete(client.id);
        this.#listItems.get(client.id)?.remove();
        this.#listItems.delete(client.id);
        this.#clientSelected = null;

        this.#resetClientDetail();
    }

    /**
     * Restores the detail panel to its placeholder state ("-" everywhere) and
     * disables the edit/delete buttons. Used when no client is selected.
     */
    #resetClientDetail() {
        this.#dom.editClientBtn.prop("disabled", true);
        this.#dom.deleteClientBtn.prop("disabled", true);

        const detail = this.#dom.detail;
        detail.avatar.text("-");
        detail.name.text("Selecione um cliente");
        detail.statusBadge.attr("class", "badge rounded-pill customer-status-badge").text("-");

        detail.status.text("-");
        detail.aulas.text("-");
        detail.valorPago.text("-");
        detail.email.text("-");
        detail.telefone.text("-");
        detail.responsavel.text("-");
        detail.cargo.text("-");
        detail.endereco.text("-");
        detail.cidade.text("-");
        detail.plano.text("-");
        detail.inicio.text("-");
        detail.renovacao.text("-");
        detail.documento.text("-");
        detail.notes.text("-");
    }

    /**
     * Derives up to two uppercase initials from a client's full name, used for
     * the avatar bubble (e.g. "Ana Silva" -> "AS").
     *
     * @param {String} name - Full name to derive initials from.
     * @returns {String} - Up to two uppercase initials.
     */
    #getInitials(name) {
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("");
    }

    /**
     * Renders a client's full data into the detail panel (avatar, name, status
     * badge, stats, contact info, contract info and notes). No-op when called
     * with no client.
     *
     * @param {object|null} client - The client to display, or null to skip rendering.
     */
    #renderClientDetail(client) {
        if (!client) { return; }

        const detail = this.#dom.detail;
        detail.avatar.text(client.initials);
        detail.name.text(client.name);
        detail.statusBadge
            .attr("class", `badge rounded-pill customer-status-badge status-${client.status}`)
            .text(client.statusLabel);

        detail.status.text(client.statusLabel);
        detail.aulas.text(client.aulas);
        detail.valorPago.text(client.valorPago);

        detail.email.text(client.email);
        detail.telefone.text(client.telefone);
        detail.responsavel.text(client.responsavel);
        detail.cargo.text(client.cargo);
        detail.endereco.text(client.endereco);
        detail.cidade.text(client.cidadeUf);

        detail.plano.text(client.plano);
        detail.inicio.text(client.inicio);
        detail.renovacao.text(client.renovacao);
        detail.documento.text(client.documento);

        detail.notes.text(client.observacoes);
    }

    /**
     * Builds the HTML markup for a client's row in the list panel.
     *
     * @param {object} client - The client to render a list item for.
     * @returns {String} - HTML markup for the client's `<li>` list item.
     */
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
