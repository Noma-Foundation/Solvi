import $ from "jquery";
import { Modal } from "bootstrap";

import { IComponentModel } from "../../../framework/interfaces/component-model.js";
import { setButtonLoading, setContainerLoading } from "../../utils/loading-state.js";
import { buildClientRecord } from "../../utils/customer-record.js";
import {
    buildMovementRecord,
    formatCurrency,
    formatMovementDate,
    formatMovementSequence,
    movementSign,
    movementStatusClass,
    movementStatusLabel,
} from "../../utils/movement-record.js";

import searchIcon from "../../assets/search_icon.svg";

import "./movement.css";

/**
 * Movement page. Lists every income/expense entry as a card and owns the
 * create/edit/delete flows and the title search filter for them.
 *
 * @extends IComponentModel
 */
export class InboxComponentPage extends IComponentModel {
    /** @type {Map<string, object>} - All known movements, keyed by movement ID. */
    #movements;
    /** @type {Map<string, JQuery>} - Cached jQuery reference to each movement's card, keyed by movement ID. */
    #cardElements;
    /** @type {Map<string, object>} - All known clients, keyed by client ID, used for the modal's client picker and the card's client label. */
    #clients;
    /** @type {Modal} - Bootstrap modal instance shared by the create and edit flows. */
    #movementModal;
    /** @type {string|null} - ID of the movement being edited, or null when the modal is in "create" mode. */
    #editingMovementId;

    /**
     * @constructs {InboxComponentPage}
     * @param {String} [rootSelector="#app-main-context"] - Selector of the element this component is rendered into.
     */
    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
        this.#movements = new Map();
        this.#cardElements = new Map();
        this.#clients = new Map();
        this.#editingMovementId = null;
        this.init();

        if (window.pywebview && window.pywebview.api) {
            this.#loadInitialData();
        } else {
            window.addEventListener("pywebviewready", () => this.#loadInitialData());
        }
    }

    /**
     * Loads clients then movements, one after the other. The pywebview
     * bridge runs each JS-to-Python call on its own thread against a single
     * shared database session, which is not thread-safe — firing both calls
     * concurrently can corrupt that shared session's transaction state, so
     * they must be sequenced rather than started in parallel.
     *
     * @async
     */
    async #loadInitialData() {
        await this.#loadClients();
        await this.#loadMovements();
    }

    /**
     * Builds the page shell (toolbar, card list mount point) and the shared
     * create/edit modal, injects it into the DOM, and instantiates the
     * Bootstrap modal. Called once by {@link IComponentModel#init}.
     */
    buildTemplate() {
        this.template = /* html */ `
            <div class="container-fluid">
                <header class="p-3 pb-2">
                    <h3 class="mb-1">Movement</h3>
                    <p class="text-secondary mb-0">Create and organize your business's income and expense figures.</p>
                </header>

                <section class="px-3 pb-3 py-2">
                    <div class="d-flex align-items-center gap-3 flex-wrap">
                        <div class="input-group search-input" style="max-width: 280px;">
                            <button class="btn btn-outline-secondary" type="button">
                                <img src="${searchIcon}" alt="Search" width="16" height="16">
                            </button>
                            <input type="text" class="form-control" id="movement-search-input" placeholder="Pesquisar..." aria-label="Search movement...">
                        </div>

                        <button class="btn btn-primary btn-new-budget ms-auto" id="add-movement">New Movement</button>
                    </div>
                </section>

                <div class="px-3 pb-3 py-2 d-flex flex-column gap-2" id="card-list"></div>
            </div>

            ${this.#movementFormModal()}
        `;

        $(this.context).html(this.template);
        this.#movementModal = new Modal(document.getElementById("movement-modal"));
    }

    /**
     * Wires up all user interactions: opening the create modal, submitting
     * the create/edit form, the per-card edit/delete buttons, and the title
     * search filter. Called once by {@link IComponentModel#init}, after
     * {@link buildTemplate}.
     */
    bindEvents() {
        $("#add-movement").on("click", () => {
            this.#openCreateModal();
        });

        $("#movement-form").on("submit", (event) => {
            event.preventDefault();
            this.#saveMovement();
        });

        $("#card-list").on("click", (event) => {
            const $card = $(event.target).closest(".movement-card");
            if (!$card.length) { return; }

            const movementId = $card.data("id");
            if ($(event.target).closest(".btn-movement-edit").length) {
                this.#openEditModal(movementId);
            } else if ($(event.target).closest(".btn-movement-delete").length) {
                this.#deleteMovement(movementId);
            }
        });

        $("#movement-search-input").on("input", (event) => {
            this.#filterCards(event.target.value);
        });
    }

    /**
     * Fetches every movement from the backend and renders them into the card
     * list. Called once during initialization, once the pywebview API is
     * ready. Failures are logged and leave the list empty.
     *
     * @async
     */
    async #loadMovements() {
        const $cardList = $("#card-list");
        setContainerLoading($cardList, true);

        try {
            const movements = await window.pywebview.api.get_movements();
            for (const movement of movements) {
                this.#appendMovement(buildMovementRecord(movement));
            }
        } catch (error) {
            console.error("[ERROR] Failed to load movements.", error);
        } finally {
            setContainerLoading($cardList, false);
        }
    }

    /**
     * Fetches every client from the backend so the modal's client picker and
     * the cards' client labels can resolve a client ID to a name. Called once
     * during initialization, once the pywebview API is ready. Failures are
     * logged and leave the picker with no clients.
     *
     * @async
     */
    async #loadClients() {
        try {
            const clients = await window.pywebview.api.get_clients();
            for (const client of clients) {
                this.#clients.set(client.client_id, buildClientRecord(client));
            }
            this.#renderClientOptions();

            // Movements may have finished loading (and rendering their cards)
            // before the client list came back, so re-render every card now
            // that client names can actually be resolved.
            for (const movement of this.#movements.values()) {
                this.#updateMovement(movement);
            }
        } catch (error) {
            console.error("[ERROR] Failed to load clients.", error);
        }
    }

    /**
     * Rebuilds the modal's client `<select>` options from the cached client
     * map, preserving whichever client is currently selected.
     */
    #renderClientOptions() {
        const $select = $("#movement-client-input");
        const currentValue = $select.val();

        $select.empty().append('<option value="">Nenhum cliente</option>');
        for (const client of this.#clients.values()) {
            $select.append(`<option value="${client.id}">${client.name}</option>`);
        }

        $select.val(currentValue || "");
    }

    /**
     * Resets the shared modal to its "create" state (blank form) and shows it.
     */
    #openCreateModal() {
        this.#editingMovementId = null;

        $("#movement-modal-title").text("New Movement");
        $("#movement-form")[0].reset();
        $("#movement-error").hide();

        this.#movementModal.show();
    }

    /**
     * Fills the shared modal with a movement's current data and shows it in
     * "edit" state. No-op if the movement isn't known.
     *
     * @param {string} movementId - ID of the movement to edit.
     */
    #openEditModal(movementId) {
        const movement = this.#movements.get(movementId);
        if (!movement) { return; }

        this.#editingMovementId = movementId;

        $("#movement-modal-title").text("Edit Movement");
        $("#movement-error").hide();

        $("#movement-type-input").val(movement.type);
        $("#movement-status-input").val(movement.status);
        $("#movement-title-input").val(movement.title);
        $("#movement-amount-input").val(movement.amount);
        $("#movement-tax-rate-input").val(movement.taxRate ?? "");
        $("#movement-location-input").val(movement.location ?? "");
        $("#movement-client-input").val(movement.clientId ?? "");
        $("#movement-serial-input").val(movement.serialNumber ?? "");

        this.#movementModal.show();
    }

    /**
     * Validates the create/edit form and persists it to the backend: creates
     * a new movement, or updates the one being edited, depending on
     * {@link #editingMovementId}. On success, syncs the card list and closes
     * the modal. Shows an inline error and leaves the modal open on failure.
     *
     * @async
     */
    async #saveMovement() {
        const type = $("#movement-type-input").val();
        const status = $("#movement-status-input").val();
        const title = $("#movement-title-input").val().trim();
        const amount = parseFloat($("#movement-amount-input").val());
        if (!title || Number.isNaN(amount)) { return; }

        const taxRateInput = $("#movement-tax-rate-input").val().trim();
        const taxRate = taxRateInput ? parseFloat(taxRateInput) : null;
        const location = $("#movement-location-input").val().trim() || null;
        const clientId = $("#movement-client-input").val() || null;
        const serialNumber = $("#movement-serial-input").val().trim() || null;

        $("#movement-error").hide();

        const $saveBtn = $("#movement-save-btn");
        setButtonLoading($saveBtn, true);

        try {
            if (this.#editingMovementId) {
                const movement = await window.pywebview.api.edit_movement(
                    this.#editingMovementId, type, title, amount, location, clientId, taxRate, status, serialNumber
                );
                this.#updateMovement(buildMovementRecord(movement));
            } else {
                const movement = await window.pywebview.api.add_movement(
                    type, title, amount, location, clientId, taxRate, status, serialNumber
                );
                this.#appendMovement(buildMovementRecord(movement));
            }

            this.#movementModal.hide();
        } catch (error) {
            console.error("[ERROR] Failed to save movement.", error);
            $("#movement-error").show();
        } finally {
            setButtonLoading($saveBtn, false);
        }
    }

    /**
     * Persists the removal of a movement to the backend, then removes its
     * card from the list on success.
     *
     * @async
     * @param {string} movementId - ID of the movement to delete.
     */
    async #deleteMovement(movementId) {
        try {
            await window.pywebview.api.delete_movement(movementId);
            this.#removeMovement(movementId);
        } catch (error) {
            console.error("[ERROR] Failed to delete movement.", error);
        }
    }

    /**
     * Stores a movement record and appends its card to the list.
     *
     * @param {object} movement - The movement record to add.
     */
    #appendMovement(movement) {
        this.#movements.set(movement.id, movement);

        const $card = $(this.#movementCard(movement));
        this.#cardElements.set(movement.id, $card);
        $("#card-list").append($card);
    }

    /**
     * Applies an updated movement record to the cached map and re-renders its
     * card in place.
     *
     * @param {object} movement - The updated movement record.
     */
    #updateMovement(movement) {
        this.#movements.set(movement.id, movement);

        const $oldCard = this.#cardElements.get(movement.id);
        if ($oldCard) {
            const $newCard = $(this.#movementCard(movement));
            $oldCard.replaceWith($newCard);
            this.#cardElements.set(movement.id, $newCard);
        }
    }

    /**
     * Removes a movement from the cached map and its card from the list.
     *
     * @param {string} movementId - ID of the movement to remove.
     */
    #removeMovement(movementId) {
        this.#movements.delete(movementId);
        this.#cardElements.get(movementId)?.remove();
        this.#cardElements.delete(movementId);
    }

    /**
     * Shows only the cards whose title matches the given query (case
     * insensitive, substring match); an empty query shows every card.
     *
     * @param {string} query - The search box's current value.
     */
    #filterCards(query) {
        const normalizedQuery = query.trim().toLowerCase();

        for (const [id, movement] of this.#movements) {
            const matches = !normalizedQuery || movement.title.toLowerCase().includes(normalizedQuery);
            this.#cardElements.get(id)?.toggle(matches);
        }
    }

    /**
     * Builds the HTML markup for the shared create/edit modal.
     *
     * @returns {String} - HTML markup for the modal.
     */
    #movementFormModal() {
        return /* html */ `
            <div class="modal fade" id="movement-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <form id="movement-form">
                            <div class="modal-header">
                                <h5 class="modal-title" id="movement-modal-title">New Movement</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body d-flex flex-column gap-3">
                                <div class="row g-3">
                                    <div class="col-md-6 form-group">
                                        <label for="movement-type-input" class="form-label">Type</label>
                                        <select class="form-select" id="movement-type-input">
                                            <option value="income">Entrada</option>
                                            <option value="expense">Saída</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 form-group">
                                        <label for="movement-status-input" class="form-label">Status</label>
                                        <select class="form-select" id="movement-status-input">
                                            <option value="pending">Pendente</option>
                                            <option value="confirmed">Confirmado</option>
                                            <option value="canceled">Cancelado</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="movement-title-input" class="form-label">Description</label>
                                    <input type="text" class="form-control" id="movement-title-input" required>
                                </div>

                                <div class="row g-3">
                                    <div class="col-md-6 form-group">
                                        <label for="movement-amount-input" class="form-label">Amount (R$)</label>
                                        <input type="number" step="0.01" min="0" class="form-control" id="movement-amount-input" required>
                                    </div>
                                    <div class="col-md-6 form-group">
                                        <label for="movement-tax-rate-input" class="form-label">ICMS (%)</label>
                                        <input type="number" step="0.01" min="0" class="form-control" id="movement-tax-rate-input">
                                    </div>
                                </div>

                                <div class="row g-3">
                                    <div class="col-md-6 form-group">
                                        <label for="movement-location-input" class="form-label">Location</label>
                                        <input type="text" class="form-control" id="movement-location-input">
                                    </div>
                                    <div class="col-md-6 form-group">
                                        <label for="movement-serial-input" class="form-label">Serial number</label>
                                        <input type="text" class="form-control" id="movement-serial-input">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="movement-client-input" class="form-label">Client</label>
                                    <select class="form-select" id="movement-client-input">
                                        <option value="">Nenhum cliente</option>
                                    </select>
                                </div>

                                <p class="text-danger m-0" id="movement-error" style="display: none;">Could not save the movement.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary customer-add-btn button-font" id="movement-save-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Builds the HTML markup for a movement's card in the list.
     *
     * @param {object} movement - The movement to render a card for.
     * @returns {String} - HTML markup for the movement's card.
     */
    #movementCard(movement) {
        const sign = movementSign(movement.type);
        const priceClass = movement.type === "expense" ? "movement-card__price--expense" : "movement-card__price--income";
        const client = movement.clientId ? this.#clients.get(movement.clientId) : null;

        return /* html */ `
            <section class="movement-card" aria-label="Movement ${formatMovementSequence(movement.sequenceNumber)}" data-id="${movement.id}">
                <div class="d-flex flex-column gap-2">
                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="movement-card__id">${formatMovementSequence(movement.sequenceNumber)}</span>
                            <span class="status-label ${movementStatusClass(movement.status)}">${movementStatusLabel(movement.status)}</span>
                        </div>
                        <p class="mb-0 text-wrap">
                            ${movement.title}${movement.location ? ` <span class="movement-card__location">· ${movement.location}</span>` : ""}
                        </p>
                        <p class="movement-card__meta mb-0">
                            ${client ? `Cliente: ${client.name}` : "Sem cliente vinculado"}${movement.serialNumber ? ` · N/S ${movement.serialNumber}` : ""}
                        </p>
                    </div>

                    <div>
                        <p class="movement-card__price ${priceClass} mb-0">${sign} R$ <span>${formatCurrency(movement.amount)}</span></p>
                        <p class="movement-card__meta">
                            ICMS R$${formatCurrency(movement.taxAmount)} · Atualizado
                            <time datetime="${movement.updateAt ?? ""}">${formatMovementDate(movement.updateAt)}</time>
                        </p>
                    </div>
                </div>

                <div class="d-flex flex-column gap-2">
                    <button type="button" class="btn btn-outline-secondary btn-sm btn-movement-edit">Editar</button>
                    <button type="button" class="btn btn-outline-danger btn-sm btn-movement-delete">Excluir</button>
                </div>
            </section>
        `;
    }

}
