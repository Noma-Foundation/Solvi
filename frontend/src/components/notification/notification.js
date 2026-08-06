import $ from "jquery";

import { html } from "../../utils/html.js";
import { IComponentModel } from "../component-model.js";
import { eventBus } from "../../event-manager-singleton.js";
import { apiAvailable, escapeHtml, parseApiResult } from "../../utils/api-helpers.js";

import "./notification.css";

/**
 * Central de notificações.
 * @implements {IComponentModel}
 */
export class NotificationManager extends IComponentModel {
    #rootSelector;
    #items = [];
    #search = "";
    #category = "all";
    #status = "all";
    #sort = "date-desc";

    constructor(rootSelector = "#app-main-context") {
        super();
        this.#rootSelector = rootSelector;
        this.init();
    }

    buildTemplate() {
        const template = html`
            <section class="notification-page">
                <div class="notification-page__header">
                    <div>
                        <h1 class="notification-page__title">Notificações</h1>
                        <p class="notification-page__subtitle">
                            Central de alertas do sistema.
                            <span id="notification-unread-count"></span>
                        </p>
                    </div>
                    <div class="notification-page__actions">
                        <button type="button" class="btn btn-outline-secondary btn-sm" id="notification-mark-all">Marcar todas como lidas</button>
                        <button type="button" class="btn btn-outline-danger btn-sm" id="notification-clear-all">Excluir todas</button>
                    </div>
                </div>

                <div id="notification-api-unavailable" class="solvi-unavailable">
                    API indisponível. Abra o app via Solvi (pywebview).
                </div>

                <div class="notification-page__toolbar">
                    <input type="search" id="notification-search" class="form-control" placeholder="Pesquisar…">
                    <select id="notification-filter-category" class="form-select">
                        <option value="all">Todas categorias</option>
                        <option value="cliente">Cliente</option>
                        <option value="orcamento">Orçamento</option>
                        <option value="calendario">Calendário</option>
                        <option value="sistema">Sistema</option>
                    </select>
                    <select id="notification-filter-status" class="form-select">
                        <option value="all">Todos status</option>
                        <option value="unread">Não lidas</option>
                        <option value="read">Lidas</option>
                    </select>
                    <select id="notification-sort" class="form-select">
                        <option value="date-desc">Mais recentes</option>
                        <option value="date-asc">Mais antigas</option>
                    </select>
                </div>

                <div id="notification-list" class="notification-list" aria-live="polite"></div>
            </section>
        `;
        $(this.#rootSelector).html(template);
    }

    bindEvents() {
        $("#notification-search").on("input", (e) => {
            this.#search = e.target.value.toString().toLowerCase();
            this.#render();
        });
        $("#notification-filter-category").on("change", (e) => {
            this.#category = e.target.value;
            this.#render();
        });
        $("#notification-filter-status").on("change", (e) => {
            this.#status = e.target.value;
            this.#render();
        });
        $("#notification-sort").on("change", (e) => {
            this.#sort = e.target.value;
            this.#render();
        });
        $("#notification-mark-all").on("click", () => this.#markAll());
        $("#notification-clear-all").on("click", () => this.#clearAll());

        $("#notification-list").on("click", "[data-mark-read]", async (e) => {
            const id = $(e.currentTarget).attr("data-mark-read");
            await this.#markRead(id);
        });
        $("#notification-list").on("click", "[data-remove-notification]", async (e) => {
            const id = $(e.currentTarget).attr("data-remove-notification");
            await this.#remove(id);
        });

        eventBus.subscribe("notifications:changed", () => this.#load());
        this.#load();
    }

    async #load() {
        if (!apiAvailable()) {
            $("#notification-api-unavailable").addClass("is-visible");
            this.#items = [];
            this.#render();
            return;
        }
        try {
            const raw = await window.pywebview.api.get_notifications();
            const items = parseApiResult(raw);
            this.#items = Array.isArray(items) ? items : [];
            this.#render();
        } catch {
            $("#notification-api-unavailable").addClass("is-visible");
            this.#items = [];
            this.#render();
        }
    }

    #filtered() {
        let list = [...this.#items];
        if (this.#search) {
            list = list.filter((n) =>
                `${n.title} ${n.description} ${n.category}`.toLowerCase().includes(this.#search)
            );
        }
        if (this.#category !== "all") {
            list = list.filter((n) => n.category === this.#category);
        }
        if (this.#status === "unread") list = list.filter((n) => !n.read);
        if (this.#status === "read") list = list.filter((n) => n.read);

        list.sort((a, b) => {
            const da = `${a.date || ""}T${a.time || "00:00:00"}`;
            const db = `${b.date || ""}T${b.time || "00:00:00"}`;
            return this.#sort === "date-asc" ? da.localeCompare(db) : db.localeCompare(da);
        });
        return list;
    }

    #render() {
        const unread = this.#items.filter((n) => !n.read).length;
        $("#notification-unread-count").text(
            unread ? `(${unread} não lida${unread > 1 ? "s" : ""})` : ""
        );

        const list = this.#filtered();
        const $list = $("#notification-list");
        if (!list.length) {
            $list.html(`<div class="solvi-empty">Nenhuma notificação encontrada.</div>`);
            return;
        }

        $list.html(list.map((n) => {
            const levelClass = {
                Informação: "level-info",
                Aviso: "level-warn",
                Erro: "level-error",
                Sucesso: "level-success",
            }[n.level] || "level-info";

            return html`
                <article class="notification-card ${n.read ? "" : "is-unread"}">
                    <div class="notification-card__main">
                        <div class="notification-card__top">
                            <span class="notification-card__level ${levelClass}">${escapeHtml(n.level)}</span>
                            <span class="notification-card__category">${escapeHtml(n.category)}</span>
                        </div>
                        <h2 class="notification-card__title">${escapeHtml(n.title)}</h2>
                        <p class="notification-card__desc">${escapeHtml(n.description || "")}</p>
                        <p class="notification-card__meta">${escapeHtml(n.date)} · ${escapeHtml(n.time)}</p>
                    </div>
                    <div class="notification-card__actions">
                        ${n.read ? "" : `<button type="button" class="btn btn-sm btn-outline-primary" data-mark-read="${escapeHtml(n.id)}">Marcar como lida</button>`}
                        <button type="button" class="btn btn-sm btn-outline-danger" data-remove-notification="${escapeHtml(n.id)}">Excluir</button>
                    </div>
                </article>
            `;
        }).join(""));
    }

    async #markRead(id) {
        if (!apiAvailable() || !id) return;
        try {
            await window.pywebview.api.mark_notification_read(id);
            eventBus.publishAsync("notifications:changed", {});
        } catch {
            eventBus.publishAsync("system:error", { message: "Falha ao marcar notificação." });
        }
    }

    async #markAll() {
        if (!apiAvailable()) return;
        try {
            await window.pywebview.api.mark_all_notifications_read();
            eventBus.publishAsync("notifications:changed", {});
        } catch {
            eventBus.publishAsync("system:error", { message: "Falha ao marcar notificações." });
        }
    }

    async #remove(id) {
        if (!apiAvailable() || !id) return;
        try {
            await window.pywebview.api.remove_notification(id);
            eventBus.publishAsync("notifications:changed", {});
        } catch {
            eventBus.publishAsync("system:error", { message: "Falha ao excluir notificação." });
        }
    }

    async #clearAll() {
        if (!apiAvailable()) return;
        if (!confirm("Excluir todas as notificações?")) return;
        try {
            await window.pywebview.api.clear_notifications();
            eventBus.publishAsync("notifications:changed", {});
        } catch {
            eventBus.publishAsync("system:error", { message: "Falha ao limpar notificações." });
        }
    }
}
