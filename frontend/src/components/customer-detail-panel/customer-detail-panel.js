import $ from "jquery";
import { Modal } from "bootstrap";

import { IComponentModel } from "../../../framework/interfaces/component-model.js";
import { eventBus } from "../../event-manager-singleton.js";
import { setButtonLoading } from "../../utils/loading-state.js";
import { buildClientRecord } from "../../utils/customer-record.js";

import "./customer-detail-panel.css";

/**
 * Customer detail panel. Displays the client currently selected in the
 * control panel (received over the event bus) and owns the edit/delete
 * flows for it.
 *
 * @extends IComponentModel
 */
export class CustomerDetailPanel extends IComponentModel {
    /** @type {object|null} - The client currently rendered in the panel, or null when none is selected. */
    #currentClient;
    /** @type {Modal} - Bootstrap modal instance for editing the selected client. */
    #editClientModal;

    /**
     * @constructs {CustomerDetailPanel}
     * @param {String} rootSelector - Selector of the element this component is rendered into.
     */
    constructor(rootSelector) {
        super();
        this.context = rootSelector;
        this.#currentClient = null;
        this.init();
    }

    /**
     * Builds the panel markup (detail fields, edit/delete buttons) and the
     * edit-client modal, injects it into the DOM, and instantiates the
     * Bootstrap modal. Called once by {@link IComponentModel#init}.
     */
    buildTemplate() {
        this.template = /* html */ `
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

                                <p class="text-danger m-0" id="edit-client-error" style="display: none;">Could not save the changes.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary customer-add-btn button-font" id="edit-client-save-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        $(this.context).html(this.template);
        this.#editClientModal = new Modal(document.getElementById("edit-client-modal"));
    }

    /**
     * Listens for the selection published by the control panel, and wires up
     * the edit/delete buttons and the edit-client form. Called once by
     * {@link IComponentModel#init}, after {@link buildTemplate}.
     */
    bindEvents() {
        eventBus.subscribe("customer:selected", (client) => this.#selectClient(client));

        $("#edit-client-btn").on("click", () => {
            if (!this.#currentClient) { return; }

            this.#fillEditForm(this.#currentClient);
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
     * Renders a newly selected client into the detail panel and enables the
     * edit/delete buttons.
     *
     * @param {object} client - The client to display.
     */
    #selectClient(client) {
        this.#currentClient = client;
        this.#renderClientDetail(client);

        $("#edit-client-btn").prop("disabled", false);
        $("#delete-client-btn").prop("disabled", false);
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
     * selected client, then re-renders the detail panel, closes the edit
     * modal, and publishes "customer:updated" so other components (e.g. the
     * control panel's list row) can sync. No-ops if no client is selected or
     * the required name field is empty. Shows an inline error and leaves the
     * modal open on failure.
     *
     * @async
     */
    async #editClient() {
        if (!this.#currentClient) { return; }

        const name = $("#edit-client-name-input").val().trim();
        if (!name) { return; }

        const email = $("#edit-client-email-input").val().trim();
        const phoneNumber = $("#edit-client-phone-input").val().trim();
        const document_ = $("#edit-client-document-input").val().trim();
        const dateOfBirth = $("#edit-client-date-of-birth-input").val().trim() || null;
        const remark = $("#edit-client-remark-input").val().trim();

        $("#edit-client-error").hide();

        const $saveBtn = $("#edit-client-save-btn");
        setButtonLoading($saveBtn, true);

        try {
            const customer = await window.pywebview.api.edit_client(
                this.#currentClient.id, name, email, phoneNumber, document_, dateOfBirth, remark
            );

            const updated = buildClientRecord(customer);
            this.#currentClient = updated;

            this.#renderClientDetail(updated);
            this.#editClientModal.hide();

            eventBus.publishAsync("customer:updated", updated);
        } catch (error) {
            $("#edit-client-error").show();
        } finally {
            setButtonLoading($saveBtn, false);
        }
    }

    /**
     * Persists the removal of the selected client to the backend, then
     * resets the detail panel to its empty state and publishes
     * "customer:deleted" so other components (e.g. the control panel's list)
     * can sync. No-op if no client is selected. Leaves the client in place on
     * failure.
     *
     * @async
     */
    async #deleteClient() {
        if (!this.#currentClient) { return; }

        const clientId = this.#currentClient.id;
        const $deleteBtn = $("#delete-client-btn");
        setButtonLoading($deleteBtn, true);

        try {
            await window.pywebview.api.delete_client(clientId);

            this.#currentClient = null;

            // resetClientDetail() disables this button as part of clearing the
            // selection, so restore the loading state first to avoid re-enabling it.
            setButtonLoading($deleteBtn, false);
            this.#resetClientDetail();

            eventBus.publishAsync("customer:deleted", { id: clientId });
        } catch (error) {
            console.error("Failed to delete client:", error);
            setButtonLoading($deleteBtn, false);
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

}
