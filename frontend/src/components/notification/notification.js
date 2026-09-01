import $ from "jquery";

import { IComponentModel } from "../../../framework/interfaces/component-model.js";
import {
    buildNotificationRecord,
    formatFullDatePtBr,
    formatNotificationTimestamp,
    notificationStatusClass,
    notificationStatusLabel,
} from "../../utils/notification-record.js";

import searchIcon from "../../assets/search_icon.svg";

import "./notification.css";

/**
 * Notification center. Lists every internal notification recorded by the
 * system (client/movement/task changes, birthday reminders, ...) and owns
 * the search/category/status/sort filters plus the mark-as-read and delete
 * actions for them.
 *
 * @extends IComponentModel
 */
export class NotificationComponentPage extends IComponentModel {
    /** @type {Map<string, object>} - All known notifications, keyed by notification ID. */
    #notifications;
    /** @type {string} - Current search box value. */
    #searchQuery;
    /** @type {string} - Current category filter ("" means every category). */
    #categoryFilter;
    /** @type {string} - Current status filter ("" means every status). */
    #statusFilter;
    /** @type {"newest"|"oldest"} - Current sort order. */
    #sortOrder;
    /** @type {boolean} - Whether the logged-in employee can delete notifications. */
    #isTeamLeader;

    /**
     * @constructs {NotificationComponentPage}
     * @param {String} [rootSelector="#app-main-context"] - Selector of the element this component is rendered into.
     */
    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
        this.#notifications = new Map();
        this.#searchQuery = "";
        this.#categoryFilter = "";
        this.#statusFilter = "";
        this.#sortOrder = "newest";
        this.#isTeamLeader = false;
        this.init();

        if (window.pywebview && window.pywebview.api) {
            this.#loadInitialData();
        } else {
            window.addEventListener("pywebviewready", () => this.#loadInitialData());
        }
    }

    /**
     * Loads the current employee's profile then the notifications, one after
     * the other. The pywebview bridge runs each JS-to-Python call on its own
     * thread against a single shared database session, which is not
     * thread-safe — firing both calls concurrently can corrupt that shared
     * session's transaction state, so they must be sequenced.
     *
     * @async
     */
    async #loadInitialData() {
        await this.#loadCurrentEmployee();
        await this.#loadNotifications();
    }

    /**
     * Builds the page shell (header, filter bar, list mount point), injects
     * it into the DOM. Called once by {@link IComponentModel#init}.
     */
    buildTemplate() {
        this.template = /* html */ `
            <div class="container-fluid">
                <header class="p-3 pb-2">
                    <h3 class="mb-1">Notificações</h3>
                    <p class="text-secondary mb-0">${formatFullDatePtBr(new Date())}</p>
                </header>

                <section class="px-3 pb-2">
                    <p class="mb-0">
                        <strong>Central de alerta do sistema.</strong>
                        <span class="notification-unread-count" id="notification-unread-count"></span>
                    </p>
                </section>

                <section class="px-3 pb-3">
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <div class="input-group search-input" style="max-width: 280px;">
                            <button class="btn btn-outline-secondary" type="button">
                                <img src="${searchIcon}" alt="Search" width="16" height="16">
                            </button>
                            <input type="text" class="form-control" id="notification-search-input" placeholder="Pesquisar..." aria-label="Search notifications...">
                        </div>

                        <select class="form-select" id="notification-category-filter" style="max-width: 180px;">
                            <option value="">Todas categorias</option>
                        </select>

                        <select class="form-select" id="notification-status-filter" style="max-width: 160px;">
                            <option value="">Todos status</option>
                            <option value="success">Sucesso</option>
                            <option value="info">Informação</option>
                            <option value="warning">Aviso</option>
                            <option value="error">Erro</option>
                        </select>

                        <select class="form-select" id="notification-sort" style="max-width: 160px;">
                            <option value="newest">Mais recentes</option>
                            <option value="oldest">Mais antigas</option>
                        </select>
                    </div>
                </section>

                <p class="text-danger px-3 mb-2" id="notification-error" style="display: none;"></p>

                <div class="px-3 pb-3 d-flex flex-column gap-2" id="notification-list"></div>
            </div>
        `;

        $(this.context).html(this.template);
    }

    /**
     * Wires up the filter bar and the per-card mark-as-read/delete actions.
     * Called once by {@link IComponentModel#init}, after {@link buildTemplate}.
     */
    bindEvents() {
        $("#notification-search-input").on("input", (event) => {
            this.#searchQuery = event.target.value;
            this.#render();
        });

        $("#notification-category-filter").on("change", (event) => {
            this.#categoryFilter = event.target.value;
            this.#render();
        });

        $("#notification-status-filter").on("change", (event) => {
            this.#statusFilter = event.target.value;
            this.#render();
        });

        $("#notification-sort").on("change", (event) => {
            this.#sortOrder = event.target.value;
            this.#render();
        });

        $("#notification-list").on("click", (event) => {
            const $card = $(event.target).closest(".notification-card");
            if (!$card.length) { return; }

            const notificationId = $card.data("id");
            if ($(event.target).closest(".btn-notification-read").length) {
                this.#markRead(notificationId);
            } else if ($(event.target).closest(".btn-notification-delete").length) {
                this.#deleteNotification(notificationId);
            }
        });
    }

    /**
     * Fetches every notification from the backend and renders them into the
     * list. Called once during initialization, once the pywebview API is
     * ready. Failures are logged and leave the list empty.
     *
     * @async
     */
    async #loadNotifications() {
        try {
            const notifications = await window.pywebview.api.get_notifications();
            for (const notification of notifications) {
                this.#notifications.set(notification.notification_id, buildNotificationRecord(notification));
            }
            this.#renderCategoryOptions();
            this.#render();
        } catch (error) {
            console.error("[ERROR] Failed to load notifications.", error);
        }
    }

    /**
     * Fetches the logged-in employee's profile to know whether they're a
     * team leader (only team leaders may delete notifications). Failures are
     * logged and leave the delete action hidden, the safe default.
     *
     * @async
     */
    async #loadCurrentEmployee() {
        try {
            const employee = await window.pywebview.api.get_current_employee();
            this.#isTeamLeader = Boolean(employee.is_team_leader);
        } catch (error) {
            console.error("[ERROR] Failed to load the current employee's profile.", error);
        }
    }

    /**
     * Persists a notification as read, then re-renders the list.
     *
     * @async
     * @param {string} notificationId - ID of the notification to mark as read.
     */
    async #markRead(notificationId) {
        this.#hideError();
        try {
            const notification = await window.pywebview.api.mark_notification_read(notificationId);
            this.#notifications.set(notificationId, buildNotificationRecord(notification));
            this.#render();
        } catch (error) {
            console.error("[ERROR] Failed to mark notification as read.", error);
            this.#showError("Não foi possível marcar a notificação como lida.");
        }
    }

    /**
     * Persists the removal of a notification, then re-renders the list.
     * Only team leaders are allowed to delete notifications — the button is
     * hidden for everyone else, but the backend enforces this regardless, so
     * a stale or tampered client still gets a clear error instead of a
     * silent failure.
     *
     * @async
     * @param {string} notificationId - ID of the notification to delete.
     */
    async #deleteNotification(notificationId) {
        this.#hideError();
        try {
            await window.pywebview.api.delete_notification(notificationId);
            this.#notifications.delete(notificationId);
            this.#renderCategoryOptions();
            this.#render();
        } catch (error) {
            console.error("[ERROR] Failed to delete notification.", error);
            this.#showError("Apenas um líder de equipe pode excluir notificações.");
        }
    }

    /**
     * Shows an error message above the notification list.
     *
     * @param {string} message - The message to display.
     */
    #showError(message) {
        $("#notification-error").text(message).show();
    }

    /**
     * Hides the error message above the notification list.
     */
    #hideError() {
        $("#notification-error").hide();
    }

    /**
     * Rebuilds the category filter's options from the distinct categories
     * present in the cached notifications, preserving the current selection.
     */
    #renderCategoryOptions() {
        const categories = [...new Set([...this.#notifications.values()].map((n) => n.category))].sort();
        const $select = $("#notification-category-filter");
        const currentValue = $select.val();

        $select.empty().append('<option value="">Todas categorias</option>');
        for (const category of categories) {
            $select.append(`<option value="${category}">${category}</option>`);
        }
        $select.val(currentValue || "");
    }

    /**
     * Applies the current search/category/status filters and sort order to
     * the cached notifications, then re-renders the list and unread count.
     */
    #render() {
        const query = this.#searchQuery.trim().toLowerCase();
        let list = [...this.#notifications.values()];

        if (query) {
            list = list.filter((n) => n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query));
        }
        if (this.#categoryFilter) {
            list = list.filter((n) => n.category === this.#categoryFilter);
        }
        if (this.#statusFilter) {
            list = list.filter((n) => n.status === this.#statusFilter);
        }

        list.sort((a, b) => {
            const diff = new Date(a.createAt) - new Date(b.createAt);
            return this.#sortOrder === "oldest" ? diff : -diff;
        });

        $("#notification-list").html(list.map((notification) => this.#notificationCard(notification)).join(""));

        const unreadCount = [...this.#notifications.values()].filter((n) => !n.isRead).length;
        $("#notification-unread-count").text(
            unreadCount > 0 ? `(${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""})` : ""
        );
    }

    /**
     * Builds the HTML markup for a notification's card in the list.
     *
     * @param {object} notification - The notification to render a card for.
     * @returns {String} - HTML markup for the notification's card.
     */
    #notificationCard(notification) {
        return /* html */ `
            <section class="notification-card ${notification.isRead ? "" : "notification-card--unread"}" data-id="${notification.id}">
                <div class="d-flex flex-column gap-1 flex-grow-1 min-width-0">
                    <div class="d-flex align-items-center gap-2">
                        <span class="status-label ${notificationStatusClass(notification.status)}">${notificationStatusLabel(notification.status)}</span>
                        <span class="notification-category">${notification.category.toUpperCase()}</span>
                    </div>
                    <p class="notification-title mb-0">${notification.title}</p>
                    <p class="notification-message mb-0">${notification.message}</p>
                    <p class="notification-timestamp mb-0">${formatNotificationTimestamp(notification.createAt)}</p>
                </div>

                <div class="d-flex flex-column gap-2">
                    ${notification.isRead ? "" : '<button type="button" class="btn btn-outline-primary btn-sm btn-notification-read">Marcar como lida</button>'}
                    ${this.#isTeamLeader ? '<button type="button" class="btn btn-outline-danger btn-sm btn-notification-delete">Excluir</button>' : ""}
                </div>
            </section>
        `;
    }

}
