import $ from "jquery";

import { IComponentModel } from "../../../framework/interfaces/component-model.js";
import { contextManager } from "../../utils/context-manager.js";
import { buildMovementRecord, formatCurrency } from "../../utils/movement-record.js";
import { buildNotificationRecord, formatFullDatePtBr, formatNotificationTimestamp } from "../../utils/notification-record.js";

import searchIcon from "../../assets/search_icon.svg";

import "./dashboard.css";

const PERSON_ICON = /* html */ `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="4"></circle>
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6"></path>
    </svg>
`;
const TRENDING_UP_ICON = /* html */ `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 17 9 11 13 15 21 7"></polyline>
        <polyline points="14 7 21 7 21 14"></polyline>
    </svg>
`;
const TRENDING_DOWN_ICON = /* html */ `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 7 9 13 13 9 21 17"></polyline>
        <polyline points="14 17 21 17 21 10"></polyline>
    </svg>
`;

/**
 * Dashboard (home) page. Shows a greeting, three monthly stat cards
 * (active clients, income, expense — each with a vs.-last-month trend),
 * today's confirmed movements with a running balance, and a preview of the
 * most recent notifications.
 *
 * @extends IComponentModel
 */
export class DashboardComponentPage extends IComponentModel {
    /** @type {object[]} - Today's movement records, as returned by the dashboard summary. */
    #todayMovements;
    /** @type {number} - Net balance (income - expense) of today's confirmed movements. */
    #todayBalance;
    /** @type {string} - Current search box value, used to filter today's movements. */
    #searchQuery;

    /**
     * @constructs {DashboardComponentPage}
     * @param {String} [rootSelector="#app-main-context"] - Selector of the element this component is rendered into.
     */
    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
        this.#todayMovements = [];
        this.#todayBalance = 0;
        this.#searchQuery = "";
        this.init();

        if (window.pywebview && window.pywebview.api) {
            this.#loadDashboard();
        } else {
            window.addEventListener("pywebviewready", () => this.#loadDashboard());
        }
    }

    /**
     * Builds the page shell (greeting, stat cards, today's movements panel,
     * notifications preview panel) and injects it into the DOM. Called once
     * by {@link IComponentModel#init}.
     */
    buildTemplate() {
        this.template = /* html */ `
            <div class="container-fluid">
                <header class="p-3 pb-2 d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div>
                        <h3 class="mb-1" id="dashboard-greeting">Olá</h3>
                        <p class="text-secondary mb-0">${formatFullDatePtBr(new Date())}</p>
                    </div>
                    <div class="input-group search-input" style="max-width: 280px;">
                        <button class="btn btn-outline-secondary" type="button">
                            <img src="${searchIcon}" alt="Search" width="16" height="16">
                        </button>
                        <input type="text" class="form-control" id="dashboard-search-input" placeholder="Pesquisar..." aria-label="Search today's movements...">
                    </div>
                </header>

                <section class="px-3 pb-3">
                    <div class="dashboard-stats-row">
                        <div class="dashboard-stat-card">
                            <span class="dashboard-stat-icon dashboard-stat-icon--clients">${PERSON_ICON}</span>
                            <p class="dashboard-stat-label mb-1">Clientes Ativos</p>
                            <p class="dashboard-stat-value mb-1" id="dashboard-clients-value">-</p>
                            <p class="dashboard-stat-trend mb-0" id="dashboard-clients-trend"></p>
                        </div>
                        <div class="dashboard-stat-card">
                            <span class="dashboard-stat-icon dashboard-stat-icon--income">${TRENDING_UP_ICON}</span>
                            <p class="dashboard-stat-label mb-1">Entrada</p>
                            <p class="dashboard-stat-value mb-1" id="dashboard-income-value">-</p>
                            <p class="dashboard-stat-trend mb-0" id="dashboard-income-trend"></p>
                        </div>
                        <div class="dashboard-stat-card">
                            <span class="dashboard-stat-icon dashboard-stat-icon--expense">${TRENDING_DOWN_ICON}</span>
                            <p class="dashboard-stat-label mb-1">Saída</p>
                            <p class="dashboard-stat-value mb-1" id="dashboard-expense-value">-</p>
                            <p class="dashboard-stat-trend mb-0" id="dashboard-expense-trend"></p>
                        </div>
                    </div>
                </section>

                <section class="px-3 pb-3 d-flex gap-3 flex-wrap align-items-start">
                    <div class="dashboard-panel flex-grow-1" style="min-width: 320px;">
                        <p class="dashboard-panel-title mb-3">Movimentações</p>
                        <div id="dashboard-today-movements"></div>
                    </div>

                    <div class="dashboard-panel" style="min-width: 280px; max-width: 320px;">
                        <p class="dashboard-panel-title mb-3">Notificações</p>
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <span class="dashboard-tab dashboard-tab--active">Recentes</span>
                            <a href="#" class="dashboard-tab-link" id="dashboard-view-all-notifications">Ver todas ↗</a>
                        </div>
                        <div id="dashboard-notifications"></div>
                    </div>
                </section>
            </div>
        `;

        $(this.context).html(this.template);
    }

    /**
     * Wires up the today's-movements search filter and the "Ver todas" link
     * to the full Notifications page. Called once by {@link IComponentModel#init},
     * after {@link buildTemplate}.
     */
    bindEvents() {
        $("#dashboard-search-input").on("input", (event) => {
            this.#searchQuery = event.target.value;
            this.#renderTodayMovements();
        });

        $("#dashboard-view-all-notifications").on("click", (event) => {
            event.preventDefault();
            contextManager.show("notification");
        });
    }

    /**
     * Loads the current employee's profile (for the greeting) then the
     * dashboard summary, one after the other. The pywebview bridge runs each
     * JS-to-Python call on its own thread against a single shared database
     * session, which is not thread-safe — firing both calls concurrently can
     * corrupt that shared session's transaction state, so they must be
     * sequenced. Failures are logged and leave the dashboard in its loading
     * placeholder state.
     *
     * @async
     */
    async #loadDashboard() {
        try {
            const employee = await window.pywebview.api.get_current_employee();
            this.#renderGreeting(employee);

            const summary = await window.pywebview.api.get_dashboard_summary();
            this.#renderSummary(summary);
        } catch (error) {
            console.error("[ERROR] Failed to load the dashboard.", error);
        }
    }

    /**
     * Renders the time-of-day greeting with the employee's name.
     *
     * @param {object} employee - The logged-in employee's profile.
     */
    #renderGreeting(employee) {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
        const name = employee?.name;
        $("#dashboard-greeting").text(name ? `${greeting}, ${name}` : greeting);
    }

    /**
     * Renders the stat cards, today's movements panel, and the notifications
     * preview from the dashboard summary payload.
     *
     * @param {object} summary - The dashboard summary returned by the backend.
     */
    #renderSummary(summary) {
        $("#dashboard-clients-value").text(summary.active_clients_count);
        $("#dashboard-clients-trend").html(this.#trendMarkup(summary.active_clients_change_percent));

        $("#dashboard-income-value").text(`R$ ${formatCurrency(summary.income_amount)}`);
        $("#dashboard-income-trend").html(this.#trendMarkup(summary.income_change_percent));

        $("#dashboard-expense-value").text(`R$ ${formatCurrency(summary.expense_amount)}`);
        $("#dashboard-expense-trend").html(this.#trendMarkup(summary.expense_change_percent));

        this.#todayMovements = summary.today_movements.map(buildMovementRecord);
        this.#todayBalance = summary.today_balance;
        this.#renderTodayMovements();

        this.#renderNotifications(summary.recent_notifications.map(buildNotificationRecord));
    }

    /**
     * Builds the trend line under a stat card's value: an up/down arrow and
     * percentage, colored by direction, or a fallback when there's nothing
     * to compare against (no data for last month).
     *
     * @param {number|null} percent - Percent change vs. last month, or null.
     * @returns {String} - HTML markup for the trend line.
     */
    #trendMarkup(percent) {
        if (percent === null || percent === undefined) {
            return '<span class="text-secondary">Sem dados do mês passado</span>';
        }
        const isUp = percent >= 0;
        const cls = isUp ? "dashboard-trend--up" : "dashboard-trend--down";
        const arrow = isUp ? "↑" : "↓";
        return `<span class="${cls}">${arrow} ${Math.abs(percent)}%</span> vs. mês passado`;
    }

    /**
     * Renders today's confirmed movements (filtered by the search box) and
     * the running balance row.
     */
    #renderTodayMovements() {
        const query = this.#searchQuery.trim().toLowerCase();
        const filtered = query
            ? this.#todayMovements.filter((movement) => movement.title.toLowerCase().includes(query))
            : this.#todayMovements;

        const rowsHtml = filtered.map((movement) => {
            const sign = movement.type === "expense" ? "-" : "+";
            const cls = movement.type === "expense" ? "dashboard-amount--expense" : "dashboard-amount--income";
            return /* html */ `
                <div class="dashboard-movement-row d-flex justify-content-between align-items-center">
                    <span>${movement.title}</span>
                    <span class="${cls}">${sign} R$${formatCurrency(movement.amount)}</span>
                </div>
            `;
        }).join("");

        const balanceSign = this.#todayBalance < 0 ? "-" : "";
        const balanceHtml = /* html */ `
            <div class="dashboard-movement-row dashboard-movement-row--balance d-flex justify-content-between align-items-center">
                <strong>Saldo</strong>
                <strong>${balanceSign}R$ ${formatCurrency(Math.abs(this.#todayBalance))}</strong>
            </div>
        `;

        $("#dashboard-today-movements").html(
            (rowsHtml || '<p class="text-secondary mb-0">Nenhuma movimentação hoje.</p>') +
            (this.#todayMovements.length ? balanceHtml : "")
        );
    }

    /**
     * Renders the notifications preview list (most recent first, unread ones
     * marked with a dot).
     *
     * @param {object[]} notifications - Notification records to preview.
     */
    #renderNotifications(notifications) {
        const html = notifications.map((notification) => {
            const timestamp = formatNotificationTimestamp(notification.createAt).split(" . ")[1] ?? "";
            return /* html */ `
                <div class="dashboard-notification-row d-flex justify-content-between align-items-start gap-2">
                    <p class="mb-0">
                        ${notification.isRead ? "" : '<span class="dashboard-unread-dot"></span>'}
                        ${notification.title}
                    </p>
                    <span class="dashboard-notification-time">${timestamp}</span>
                </div>
            `;
        }).join("");

        $("#dashboard-notifications").html(html || '<p class="text-secondary mb-0">Nenhuma notificação.</p>');
    }

}
