import $ from "jquery";

import { html } from "../../utils/html.js";
import { IComponentModel } from "../component-model.js";
import { eventBus } from "../../event-manager-singleton.js";
import { contextManager } from "../../utils/context-manager.js";
import { apiAvailable, escapeHtml, parseApiResult } from "../../utils/api-helpers.js";

import notificationIcon from "../../assets/icons/aside/notifications.svg";

import "./notification-bell.css";

/**
 * Header notification bell with unread badge and recent dropdown.
 * @implements {IComponentModel}
 */
export class NotificationBell extends IComponentModel {
    #headerId;
    #items = [];

    constructor() {
        super();
        this.#headerId = "#app-header";
        this.init();
    }

    buildTemplate() {
        const template = html`
            <div class="notification-bell" id="notification-bell">
                <button type="button" id="notification-bell-btn" class="btn btn-primary rounded-3 notification-bell__btn" aria-label="Notificações">
                    <img src="${notificationIcon}" alt="Notificações" />
                    <span id="notification-bell-badge" class="notification-bell__badge" hidden>0</span>
                </button>
                <div id="notification-bell-dropdown" class="notification-bell__dropdown" hidden>
                    <div class="notification-bell__header">
                        <strong>Notificações</strong>
                        <button type="button" class="btn btn-link btn-sm p-0" id="notification-bell-all">Ver todas</button>
                    </div>
                    <ul id="notification-bell-list" class="notification-bell__list"></ul>
                </div>
            </div>
        `;
        $(this.#headerId).append(template);
    }

    bindEvents() {
        $("#notification-bell-btn").on("click", (e) => {
            e.stopPropagation();
            const $drop = $("#notification-bell-dropdown");
            $drop.prop("hidden", !$drop.prop("hidden"));
        });

        $("#notification-bell-all").on("click", () => {
            $("#notification-bell-dropdown").prop("hidden", true);
            contextManager.show("notification");
        });

        $(document).on("click.notificationBell", (e) => {
            if (!$(e.target).closest("#notification-bell").length) {
                $("#notification-bell-dropdown").prop("hidden", true);
            }
        });

        eventBus.subscribe("notifications:changed", () => {
            this.#load();
        });

        this.#load();
    }

    async #load() {
        if (!apiAvailable()) {
            this.#render([]);
            return;
        }
        try {
            const raw = await window.pywebview.api.get_notifications();
            const items = parseApiResult(raw);
            this.#items = Array.isArray(items) ? items : [];
            this.#render(this.#items);
        } catch {
            this.#render([]);
        }
    }

    #render(items) {
        const unread = items.filter((n) => !n.read).length;
        const $badge = $("#notification-bell-badge");
        if (unread > 0) {
            $badge.text(unread > 99 ? "99+" : String(unread)).prop("hidden", false);
        } else {
            $badge.prop("hidden", true);
        }

        const recent = items.slice(0, 5);
        const $list = $("#notification-bell-list");
        if (!recent.length) {
            $list.html(`<li class="notification-bell__empty">Nenhuma notificação</li>`);
            return;
        }

        $list.html(recent.map((n) => {
            const unreadClass = n.read ? "" : "is-unread";
            return html`
                <li class="notification-bell__item ${unreadClass}">
                    <span class="notification-bell__item-title">${escapeHtml(n.title)}</span>
                    <span class="notification-bell__item-meta">${escapeHtml(n.date)} ${escapeHtml(n.time)}</span>
                </li>
            `;
        }).join(""));
    }
}
