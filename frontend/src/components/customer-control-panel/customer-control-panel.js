import $ from "jquery";
import { Modal } from "bootstrap";

import { IComponentModel } from "../../../framework/interfaces/component-model.js";
import { eventBus } from "../../event-manager-singleton.js";
import { setButtonLoading, setContainerLoading } from "../../utils/loading-state.js";
import { buildClientRecord } from "../../utils/customer-record.js";

import "./customer-control-panel.css";

/**
 * Customer control panel. Renders the client list and the "add client" flow,
 * and publishes the active selection over the event bus so other components
 * (e.g. the detail panel) can react to it.
 *
 * @extends IComponentModel
 */
export class CustomerControlPanel extends IComponentModel {
    /** @type {string|null} - ID of the currently selected client, or null when none is selected. */
    #selectedClientId;
    /** @type {Map<string, object>} - All known clients, keyed by client ID. */
    #clients;
    /** @type {Map<string, JQuery>} - Cached jQuery reference to each client's `<li>` in the list, keyed by client ID. */
    #listItems;
    /** @type {Modal} - Bootstrap modal instance for creating a client. */
    #addClientModal;

    /**
     * @constructs {CustomerControlPanel}
     * @param {String} rootSelector - Selector of the element this component is rendered into.
     */
    constructor(rootSelector) {
        super();
        this.context = rootSelector;
        this.#selectedClientId = null;
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
     * Builds the panel markup (client list) and the add-client modal, injects
     * it into the DOM, and instantiates the Bootstrap modal. Called once by
     * {@link IComponentModel#init}.
     */
    buildTemplate() {
        this.template = /* html */ `
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
                                <button type="submit" class="btn btn-primary customer-add-btn button-font" id="add-client-save-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        $(this.context).html(this.template);
        this.#addClientModal = new Modal(document.getElementById("add-client-modal"));
    }

    /**
     * Wires up all user interactions: selecting a client in the list and
     * opening/submitting the add-client modal. Also listens for updates and
     * deletions published by other components so the list stays in sync.
     * Called once by {@link IComponentModel#init}, after {@link buildTemplate}.
     */
    bindEvents() {
        $("#customer-list-ul").on("click", (event) => {
            const target = $(event.target).closest(".customer-list-item");
            if (!target.length) { return; }
            this.#selectClient(target.data("id"));
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

        eventBus.subscribe("customer:updated", (client) => this.#applyClientUpdate(client));
        eventBus.subscribe("customer:deleted", ({ id }) => this.#removeClient(id));
    }

    /**
     * Marks a client as the active selection: toggles the "active" class on
     * the corresponding list items and publishes "customer:selected" so
     * other components can render the new selection.
     *
     * @param {string} clientId - ID of the client to select.
     */
    #selectClient(clientId) {
        if (this.#selectedClientId) {
            this.#listItems.get(this.#selectedClientId)?.removeClass("active");
        }

        this.#selectedClientId = clientId;
        this.#listItems.get(clientId)?.addClass("active");

        eventBus.publishAsync("customer:selected", this.#clients.get(clientId));
    }

    /**
     * Fetches every client from the backend and renders them into the list
     * panel. Called once during initialization, once the pywebview API is
     * ready. Failures are logged and leave the list empty.
     *
     * @async
     */
    async #loadClients() {
        const $listPanel = $(".customer-list-panel");
        setContainerLoading($listPanel, true);

        try {
            const customers = await window.pywebview.api.get_clients();

            for (const customer of customers) {
                this.#appendClient(buildClientRecord(customer));
            }
        } catch (error) {
            console.error("[ERROR] Failed to load clients.", error);
        } finally {
            setContainerLoading($listPanel, false);
        }
    }

    /**
     * Reads the add-client form, calls the backend API to create the client,
     * and on success appends its list item and closes the modal. Shows an
     * inline error and leaves the modal open on failure.
     *
     * @async
     */
    async #addClient() {
        const name = $("#add-client-name-input").val().trim();
        if (!name) { return; }

        const email = $("#add-client-email-input").val().trim() || null;

        $("#add-client-error").hide();

        const $saveBtn = $("#add-client-save-btn");
        setButtonLoading($saveBtn, true);

        try {
            const customer = await window.pywebview.api.add_client(name, email);
            this.#appendClient(buildClientRecord(customer));
            this.#addClientModal.hide();
        } catch (error) {
            $("#add-client-error").show();
        } finally {
            setButtonLoading($saveBtn, false);
        }
    }

    /**
     * Stores a client record and appends its row to the list panel.
     *
     * @param {object} client - The client record to add.
     */
    #appendClient(client) {
        this.#clients.set(client.id, client);

        const $listItem = $(this.#listComponent(client));
        this.#listItems.set(client.id, $listItem);
        $("#customer-list-ul").append($listItem);
    }

    /**
     * Applies an updated client record (published by another component after
     * an edit) to the cached client map and its list row.
     *
     * @param {object} client - The updated client record.
     */
    #applyClientUpdate(client) {
        this.#clients.set(client.id, client);

        const $listItem = this.#listItems.get(client.id);
        if ($listItem) {
            $listItem.find(".customer-avatar").text(client.initials);
            $listItem.find(".customer-list-item-name").text(client.name);
            $listItem.find(".customer-list-item-subtitle").text(this.#listSubtitle(client));
        }
    }

    /**
     * Removes a client (deleted by another component) from the cached client
     * map, its list row, and clears the selection if it was the active one.
     *
     * @param {string} clientId - ID of the client to remove.
     */
    #removeClient(clientId) {
        this.#clients.delete(clientId);
        this.#listItems.get(clientId)?.remove();
        this.#listItems.delete(clientId);

        if (this.#selectedClientId === clientId) {
            this.#selectedClientId = null;
        }
    }

    /**
     * Builds the subtitle shown under a client's name in the list: their
     * email, falling back to phone number, or "-" if neither is set.
     *
     * @param {object} client - The client to derive a subtitle for.
     * @returns {String} - The subtitle text.
     */
    #listSubtitle(client) {
        return client.email || client.phoneNumber || "-";
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
