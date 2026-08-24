import $ from "jquery";
import { Modal } from "bootstrap";

import { IComponentModel } from "../component-model.js";

import "./customer.css";

/**
 * Customer management page. Renders a master-detail layout (client list on the
 * left, selected client's details on the right) plus "add" and "edit" modals,
 * and keeps an in-memory client list in sync with the DOM.
 *
 * @extends IComponentModel
 */
export class CustomerPageComponent extends IComponentModel {
    /** @type {string|null} - ID of the currently selected client, or null when none is selected. */
    #clientSelected;
    /** @type {Map<string, object>} - All known clients, keyed by client ID. */
    #clients;
    /** @type {Map<string, JQuery>} - Cached jQuery reference to each client's `<li>` in the list, keyed by client ID. */
    #listItems;
    /** @type {Modal} - Bootstrap modal instance for creating a client. */
    #addClientModal;
    /** @type {Modal} - Bootstrap modal instance for editing the selected client. */
    #editClientModal;

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
        this.init();

        if (window.pywebview && window.pywebview.api) {
            this.#loadClients();
        } else {
            window.addEventListener("pywebviewready", () => this.#loadClients());
        }
    }

    /**
     * Builds the page markup (client list panel, detail panel, add/edit modals),
     * injects it into the DOM, and instantiates the Bootstrap modals. Called
     * once by {@link IComponentModel#init}.
     */
    buildTemplate() {
        this.template = /* html */ `
            <section class="customer-page d-flex h-100 w-100">
                <aside class="customer-list-panel d-flex flex-column gap-3 p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h3 class="m-0">Clients</h3>
                        </div>
                        <button type="button" class="btn btn-primary customer-add-btn button-font" id="add-client-btn">Add client</button>
                    </div>

                    <ul class="customer-list list-unstyled d-flex flex-column gap-1 m-0 overflow-auto" id="customer-list-ul">
                    </ul>
                </aside>

                <main class="customer-detail-panel flex-grow-1 p-4 overflow-auto d-flex flex-column gap-4">
                    <div class="d-flex align-items-center gap-3">
                        <span class="customer-avatar large d-flex align-items-center justify-content-center rounded-circle" id="customer-detail-avatar">-</span>
                        <div>
                            <h4 class="m-0" id="customer-detail-name">Select a client</h4>
                        </div>
                    </div>

                    <section>
                        <p class="customer-section-title">Contact</p>
                        <div class="card customer-info-card">
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Email</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-email">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Phone</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-phone">-</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <p class="customer-section-title">Details</p>
                        <div class="card customer-info-card">
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Document</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-document">-</p>
                            </div>
                            <div class="customer-info-field">
                                <p class="customer-field-label m-0">Date of birth</p>
                                <p class="customer-field-value m-0 fw-medium" id="customer-detail-date-of-birth">-</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <p class="customer-section-title">Remark</p>
                        <div class="card customer-info-card customer-notes">
                            <p class="m-0" id="customer-detail-remark">-</p>
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
                                <h5 class="modal-title">New client</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body d-flex flex-column gap-3">
                                <div class="form-group">
                                    <label for="add-client-name-input" class="form-label customer-field-label">Name</label>
                                    <input type="text" class="form-control" id="add-client-name-input" required>
                                </div>
                                <div class="form-group">
                                    <label for="add-client-email-input" class="form-label customer-field-label">Email</label>
                                    <input type="email" class="form-control" id="add-client-email-input">
                                </div>
                                <p class="text-danger m-0" id="add-client-error" style="display: none;">Could not create the client.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary customer-add-btn button-font">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="edit-client-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-scrollable">
                    <div class="modal-content">
                        <form id="edit-client-form">
                            <div class="modal-header">
                                <h5 class="modal-title">Edit client</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body d-flex flex-column gap-3">
                                <div class="form-group">
                                    <label for="edit-client-name-input" class="form-label customer-field-label">Name</label>
                                    <input type="text" class="form-control" id="edit-client-name-input" required>
                                </div>

                                <div class="row g-3">
                                    <div class="col-md-6 form-group">
                                        <label for="edit-client-email-input" class="form-label customer-field-label">Email</label>
                                        <input type="email" class="form-control" id="edit-client-email-input">
                                    </div>
                                    <div class="col-md-6 form-group">
                                        <label for="edit-client-phone-input" class="form-label customer-field-label">Phone</label>
                                        <input type="text" class="form-control" id="edit-client-phone-input">
                                    </div>
                                    <div class="col-md-6 form-group">
                                        <label for="edit-client-document-input" class="form-label customer-field-label">Document</label>
                                        <input type="text" class="form-control" id="edit-client-document-input">
                                    </div>
                                    <div class="col-md-6 form-group">
                                        <label for="edit-client-date-of-birth-input" class="form-label customer-field-label">Date of birth</label>
                                        <input type="date" class="form-control" id="edit-client-date-of-birth-input">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="edit-client-remark-input" class="form-label customer-field-label">Remark</label>
                                    <textarea class="form-control" id="edit-client-remark-input" rows="3"></textarea>
                                </div>

                                <!-- Error message -->
                                <p class="text-danger m-0" id="edit-client-error" style="display: none;">Could not save the changes.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary customer-add-btn button-font">Save</button>
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

    /**
     * Wires up all user interactions: selecting a client in the list, opening
     * the add/edit modals, submitting the add/edit forms, and deleting the
     * selected client. Called once by {@link IComponentModel#init}, after
     * {@link buildTemplate}.
     */
    bindEvents() {
        $("#customer-list-ul").on("click", (event) => {
            const target = $(event.target).closest(".customer-list-item");
            if (!target.length) { return; }
            this.#switchClientSelected(target.data("id"));
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

        $("#edit-client-form").on("submit", (event) => {
            event.preventDefault();
            this.#editClient();
        });

        $("#delete-client-btn").on("click", () => {
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
     * @param {string} clientId - ID of the client to select.
     */
    #switchClientSelected(clientId) {
        const previous = this.#getSelectedClient();
        if (previous) {
            this.#listItems.get(previous.id)?.removeClass("active");
        }

        this.#clientSelected = clientId;
        this.#listItems.get(clientId)?.addClass("active");

        this.#renderClientDetail(this.#getSelectedClient());
        $("#edit-client-btn").prop("disabled", false);
        $("#delete-client-btn").prop("disabled", false);
    }

    /**
     * Fetches every client from the backend and renders them into the list
     * panel. Called once during initialization, once the pywebview API is
     * ready. Failures are logged and leave the list empty.
     *
     * @async
     */
    async #loadClients() {
        try {
            const customers = await window.pywebview.api.get_clients();

            for (const customer of customers) {
                const client = this.#buildClientRecord(customer);
                this.#clients.set(client.id, client);

                const $listItem = $(this.#listComponent(client));
                this.#listItems.set(client.id, $listItem);
                $("#customer-list-ul").append($listItem);
            }
        } catch (error) {
            console.error("[ERROR] Failed to load clients.", error);
        }
    }

    /**
     * Builds a client record from the backend's customer data, mapping its
     * snake_case fields to the record shape the UI uses.
     *
     * @param {object} customer - Customer data returned by the backend.
     * @returns {object} - Client record ready to be stored and rendered.
     */
    #buildClientRecord(customer) {
        return {
            id: customer.client_id,
            name: customer.name,
            initials: this.#getInitials(customer.name),
            email: customer.email,
            phoneNumber: customer.phone_number,
            document: customer.document,
            dateOfBirth: customer.date_of_birth,
            remark: customer.remark,
        };
    }

    /**
     * Reads the add-client form, calls the backend API to create the client,
     * and on success builds a new client record, stores it, appends its list
     * item, and closes the modal. Shows an inline error and leaves the modal
     * open on failure.
     *
     * @async
     */
    async #addClient() {
        const name = $("#add-client-name-input").val().trim();
        if (!name) { return; }

        const email = $("#add-client-email-input").val().trim() || null;

        $("#add-client-error").hide();

        try {
            const customer = await window.pywebview.api.add_client(name, email);
            const client = this.#buildClientRecord(customer);

            this.#clients.set(client.id, client);

            const $listItem = $(this.#listComponent(client));
            this.#listItems.set(client.id, $listItem);
            $("#customer-list-ul").append($listItem);

            this.#addClientModal.hide();
        } catch (error) {
            $("#add-client-error").show();
        }
    }

    /**
     * Populates every field of the edit form with a client's current data.
     *
     * @param {object} client - The client whose data should fill the form.
     */
    #fillEditForm(client) {
        $("#edit-client-name-input").val(client.name ?? "");
        $("#edit-client-email-input").val(client.email ?? "");
        $("#edit-client-phone-input").val(client.phoneNumber ?? "");
        $("#edit-client-document-input").val(client.document ?? "");
        $("#edit-client-date-of-birth-input").val(client.dateOfBirth ?? "");
        $("#edit-client-remark-input").val(client.remark ?? "");
    }

    /**
     * Validates the edit form, persists its values to the backend for the
     * selected client, then updates its list item in place, re-renders the
     * detail panel, and closes the edit modal. No-ops if no client is
     * selected or the required name field is empty. Shows an inline error
     * and leaves the modal open on failure.
     *
     * @async
     */
    async #editClient() {
        const client = this.#getSelectedClient();
        if (!client) { return; }

        const name = $("#edit-client-name-input").val().trim();
        if (!name) { return; }

        const email = $("#edit-client-email-input").val().trim();
        const phoneNumber = $("#edit-client-phone-input").val().trim();
        const document_ = $("#edit-client-document-input").val().trim();
        const dateOfBirth = $("#edit-client-date-of-birth-input").val().trim() || null;
        const remark = $("#edit-client-remark-input").val().trim();

        $("#edit-client-error").hide();

        try {
            const customer = await window.pywebview.api.edit_client(
                client.id, name, email, phoneNumber, document_, dateOfBirth, remark
            );

            const updated = this.#buildClientRecord(customer);
            this.#clients.set(updated.id, updated);

            const $listItem = this.#listItems.get(updated.id);
            if ($listItem) {
                $listItem.find(".customer-avatar").text(updated.initials);
                $listItem.find(".customer-list-item-name").text(updated.name);
                $listItem.find(".customer-list-item-subtitle").text(this.#listSubtitle(updated));
            }

            this.#renderClientDetail(updated);
            this.#editClientModal.hide();
        } catch (error) {
            $("#edit-client-error").show();
        }
    }

    /**
     * Persists the removal of the selected client to the backend, then removes
     * it from the in-memory list and the DOM, clears the selection, and resets
     * the detail panel to its empty state. No-op if no client is selected.
     * Leaves the client in place on failure.
     *
     * @async
     */
    async #deleteClient() {
        const client = this.#getSelectedClient();
        if (!client) { return; }

        try {
            await window.pywebview.api.delete_client(client.id);

            this.#clients.delete(client.id);
            this.#listItems.get(client.id)?.remove();
            this.#listItems.delete(client.id);
            this.#clientSelected = null;

            this.#resetClientDetail();
        } catch (error) {
            console.error("Failed to delete client:", error);
        }
    }

    /**
     * Restores the detail panel to its placeholder state ("-" everywhere) and
     * disables the edit/delete buttons. Used when no client is selected.
     */
    #resetClientDetail() {
        $("#edit-client-btn").prop("disabled", true);
        $("#delete-client-btn").prop("disabled", true);

        $("#customer-detail-avatar").text("-");
        $("#customer-detail-name").text("Select a client");
        $("#customer-detail-email").text("-");
        $("#customer-detail-phone").text("-");
        $("#customer-detail-document").text("-");
        $("#customer-detail-date-of-birth").text("-");
        $("#customer-detail-remark").text("-");
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
     * Builds the subtitle shown under a client's name in the list and detail
     * panel: their email, falling back to phone number, or "-" if neither is set.
     *
     * @param {object} client - The client to derive a subtitle for.
     * @returns {String} - The subtitle text.
     */
    #listSubtitle(client) {
        return client.email || client.phoneNumber || "-";
    }

    /**
     * Renders a client's full data into the detail panel (avatar, name,
     * contact info, document/date of birth and remark). No-op when called
     * with no client.
     *
     * @param {object|null} client - The client to display, or null to skip rendering.
     */
    #renderClientDetail(client) {
        if (!client) { return; }

        $("#customer-detail-avatar").text(client.initials);
        $("#customer-detail-name").text(client.name);

        $("#customer-detail-email").text(client.email || "-");
        $("#customer-detail-phone").text(client.phoneNumber || "-");
        $("#customer-detail-document").text(client.document || "-");
        $("#customer-detail-date-of-birth").text(client.dateOfBirth || "-");
        $("#customer-detail-remark").text(client.remark || "-");
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
                    <span class="customer-list-item-subtitle text-truncate">${this.#listSubtitle(client)}</span>
                </span>
            </li>
        `;
    }

}
