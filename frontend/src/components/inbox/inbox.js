import $ from "jquery";

import { html } from "../../utils/html.js";
import { IComponentModel } from "../component-model.js";
import { eventBus } from "../../event-manager-singleton.js";
import {
    apiAvailable,
    escapeHtml,
    formatCurrency,
    parseApiResult,
} from "../../utils/api-helpers.js";

import "./inbox.css";

const STATUSES = ["Rascunho", "Enviado", "Mensalidade a pagar", "Mensalidade em atraso", "Mensalidade paga", "Aprovado", "Recusado", "Cancelado"];
const UFS = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
    "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

/**
 * Budget (orçamento) management page.
 * @implements {IComponentModel}
 */
export class BudgetManager extends IComponentModel {
    #rootSelector;
    #budgets = [];
    #icmsRates = {};
    #search = "";
    #sort = "date-desc";
    #editingId = null;
    #previousStatus = null;

    constructor(rootSelector = "#app-main-context") {
        super();
        this.#rootSelector = rootSelector;
        this.init();
    }

    buildTemplate() {
        const ufOptions = UFS.map((uf) => `<option value="${uf}">${uf}</option>`).join("");
        const statusOptions = STATUSES.map((s) => `<option value="${s}">${s}</option>`).join("");

        const template = html`
            <section class="inbox-page">
                <div class="inbox-page__header">
                    <div>
                        <h1 class="inbox-page__title">Orçamentos</h1>
                        <p class="inbox-page__subtitle">Crie e gerencie orçamentos com cálculo automático de ICMS.</p>
                    </div>
                    <button type="button" class="btn btn-primary" id="budget-new">Novo orçamento</button>
                </div>

                <div id="budget-api-unavailable" class="solvi-unavailable">
                    API indisponível. Abra o app via Solvi (pywebview).
                </div>

                <div class="budget-summary">
                    <span class="budget-summary__label">Total (Mensalidade paga + Aprovado)</span>
                    <strong id="budget-summary-total" class="budget-summary__value">R$ 0,00</strong>
                </div>

                <div class="inbox-page__toolbar">
                    <input type="search" id="budget-search" class="form-control" placeholder="Pesquisar cliente, número…">
                    <select id="budget-sort" class="form-select">
                        <option value="date-desc">Data (recente)</option>
                        <option value="date-asc">Data (antiga)</option>
                        <option value="client">Cliente</option>
                        <option value="total">Valor</option>
                        <option value="status">Status</option>
                    </select>
                </div>

                <div id="budget-list" class="budget-list"></div>

                <div id="budget-modal" class="budget-modal" hidden>
                    <div class="budget-modal__dialog">
                        <div class="budget-modal__header">
                            <h3 id="budget-modal-title">Novo orçamento</h3>
                            <button type="button" class="btn-close" id="budget-modal-close"></button>
                        </div>
                        <form id="budget-form" autocomplete="off">
                            <input type="hidden" id="budget-id">
                            <div class="budget-form-grid">
                                <div class="form-group">
                                    <label for="budget-number">Número</label>
                                    <input type="text" id="budget-number" class="form-control" placeholder="Auto">
                                </div>
                                <div class="form-group">
                                    <label for="budget-client">Cliente</label>
                                    <input type="text" id="budget-client" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="budget-state">Estado (UF)</label>
                                    <select id="budget-state" class="form-select" required>
                                        <option value="">Selecione</option>
                                        ${ufOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="budget-status">Status</label>
                                    <select id="budget-status" class="form-select">${statusOptions}</select>
                                </div>
                            </div>

                            <div class="budget-items-header">
                                <h4>Itens</h4>
                                <button type="button" class="btn btn-sm btn-outline-primary" id="budget-add-item">Adicionar item</button>
                            </div>
                            <div id="budget-items" class="budget-items"></div>

                            <div class="form-group">
                                <label for="budget-observations">Observações</label>
                                <textarea id="budget-observations" class="form-control" rows="2"></textarea>
                            </div>

                            <div class="budget-totals">
                                <div><span>Subtotal</span><strong id="budget-subtotal">R$ 0,00</strong></div>
                                <div><span>ICMS (<span id="budget-icms-rate">0</span>%)</span><strong id="budget-icms">R$ 0,00</strong></div>
                                <div class="budget-totals__total"><span>Total</span><strong id="budget-total">R$ 0,00</strong></div>
                            </div>

                            <p id="budget-form-error" class="budget-form__error"></p>
                            <div class="budget-form__actions">
                                <button type="button" class="btn btn-outline-secondary" id="budget-cancel">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        `;
        $(this.#rootSelector).html(template);
    }

    bindEvents() {
        $("#budget-search").on("input", (e) => {
            this.#search = e.target.value.toString().toLowerCase();
            this.#renderList();
        });
        $("#budget-sort").on("change", (e) => {
            this.#sort = e.target.value;
            this.#renderList();
        });
        $("#budget-new").on("click", () => this.#openModal());
        $("#budget-modal-close, #budget-cancel").on("click", () => this.#closeModal());
        $("#budget-modal").on("click", (e) => {
            if (e.target.id === "budget-modal") this.#closeModal();
        });
        $("#budget-add-item").on("click", () => this.#addItemRow());
        $("#budget-state, #budget-items").on("input change", () => this.#recalc());
        $("#budget-form").on("submit", async (e) => {
            e.preventDefault();
            await this.#save();
        });

        $("#budget-list").on("click", "[data-edit-budget]", (e) => {
            const id = $(e.currentTarget).attr("data-edit-budget");
            const budget = this.#budgets.find((b) => b.id === id);
            if (budget) this.#openModal(budget);
        });
        $("#budget-list").on("click", "[data-duplicate-budget]", async (e) => {
            await this.#duplicate($(e.currentTarget).attr("data-duplicate-budget"));
        });
        $("#budget-list").on("click", "[data-remove-budget]", async (e) => {
            await this.#remove($(e.currentTarget).attr("data-remove-budget"));
        });

        this.#load();
    }

    async #load() {
        if (!apiAvailable()) {
            $("#budget-api-unavailable").addClass("is-visible");
            this.#budgets = [];
            this.#renderList();
            return;
        }
        try {
            const [budgetsRaw, ratesRaw] = await Promise.all([
                window.pywebview.api.get_budgets(),
                window.pywebview.api.get_icms_rates(),
            ]);
            const budgets = parseApiResult(budgetsRaw);
            const rates = parseApiResult(ratesRaw);
            this.#budgets = Array.isArray(budgets) ? budgets : [];
            this.#icmsRates = rates && typeof rates === "object" ? rates : {};
            this.#renderList();
        } catch {
            $("#budget-api-unavailable").addClass("is-visible");
            this.#budgets = [];
            this.#renderList();
        }
    }

    #filtered() {
        let list = [...this.#budgets];
        if (this.#search) {
            list = list.filter((b) =>
                `${b.number} ${b.client} ${b.status}`.toLowerCase().includes(this.#search)
            );
        }
        list.sort((a, b) => {
            switch (this.#sort) {
                case "client":
                    return (a.client || "").localeCompare(b.client || "");
                case "total":
                    return (Number(b.total) || 0) - (Number(a.total) || 0);
                case "status":
                    return (a.status || "").localeCompare(b.status || "");
                case "date-asc":
                    return (a.createdAt || "").localeCompare(b.createdAt || "");
                default:
                    return (b.createdAt || "").localeCompare(a.createdAt || "");
            }
        });
        return list;
    }

    #renderSummary() {
        const relevantStatuses = ["Mensalidade paga", "Aprovado"];
        const total = this.#budgets
            .filter((b) => relevantStatuses.includes(b.status))
            .reduce((sum, b) => sum + (Number(b.total) || 0), 0);
        $("#budget-summary-total").text(formatCurrency(total));
    }

    #renderList() {
        this.#renderSummary();
        const list = this.#filtered();
        const $list = $("#budget-list");
        if (!list.length) {
            $list.html(`<div class="solvi-empty">Nenhum orçamento cadastrado.</div>`);
            return;
        }
        $list.html(list.map((b) => html`
            <article class="budget-card">
                <div class="budget-card__main">
                    <div class="budget-card__top">
                        <strong>${escapeHtml(b.number)}</strong>
                        <span class="budget-card__status status-${escapeHtml((b.status || "").toLowerCase())}">${escapeHtml(b.status)}</span>
                    </div>
                    <p class="budget-card__client">${escapeHtml(b.client)} · ${escapeHtml(b.state)}</p>
                    <p class="budget-card__total">${formatCurrency(b.total)}</p>
                    <p class="budget-card__meta">ICMS ${formatCurrency(b.icms)} · Atualizado ${escapeHtml((b.updatedAt || "").slice(0, 10))}</p>
                </div>
                <div class="budget-card__actions">
                    <button type="button" class="btn btn-sm btn-outline-primary" data-edit-budget="${escapeHtml(b.id)}">Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-duplicate-budget="${escapeHtml(b.id)}">Duplicar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-remove-budget="${escapeHtml(b.id)}">Excluir</button>
                </div>
            </article>
        `).join(""));
    }

    #openModal(budget = null) {
        this.#editingId = budget?.id || null;
        this.#previousStatus = budget?.status || null;
        $("#budget-modal-title").text(budget ? "Editar orçamento" : "Novo orçamento");
        $("#budget-id").val(budget?.id || "");
        $("#budget-number").val(budget?.number || "");
        $("#budget-client").val(budget?.client || "");
        $("#budget-state").val(budget?.state || "");
        $("#budget-status").val(budget?.status || "Rascunho");
        $("#budget-observations").val(budget?.observations || "");
        $("#budget-items").empty();
        const items = budget?.items?.length ? budget.items : [{ description: "", quantity: 1, unitPrice: 0 }];
        items.forEach((item) => this.#addItemRow(item));
        this.#recalc();
        $("#budget-form-error").text("").removeClass("is-visible");
        $("#budget-modal").prop("hidden", false);
    }

    #closeModal() {
        $("#budget-modal").prop("hidden", true);
        this.#editingId = null;
        this.#previousStatus = null;
    }

    #addItemRow(item = { description: "", quantity: 1, unitPrice: 0 }) {
        const row = html`
            <div class="budget-item-row">
                <input type="text" class="form-control item-desc" placeholder="Descrição" value="${escapeHtml(item.description || "")}">
                <input type="number" class="form-control item-qty" min="0" step="0.01" placeholder="Qtd" value="${escapeHtml(item.quantity ?? 1)}">
                <input type="number" class="form-control item-price" min="0" step="0.01" placeholder="Valor unit." value="${escapeHtml(item.unitPrice ?? 0)}">
                <button type="button" class="btn btn-outline-danger btn-sm item-remove" title="Remover">×</button>
            </div>
        `;
        const $row = $(row);
        $row.find(".item-remove").on("click", () => {
            $row.remove();
            this.#recalc();
        });
        $("#budget-items").append($row);
    }

    #collectItems() {
        const items = [];
        $("#budget-items .budget-item-row").each((_, el) => {
            const $el = $(el);
            items.push({
                description: $el.find(".item-desc").val()?.toString().trim() ?? "",
                quantity: Number($el.find(".item-qty").val()) || 0,
                unitPrice: Number($el.find(".item-price").val()) || 0,
            });
        });
        return items;
    }

    #recalc() {
        const state = $("#budget-state").val()?.toString().toUpperCase() ?? "";
        const rate = Number(this.#icmsRates[state] || 0);
        const items = this.#collectItems();
        const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        const icms = subtotal * (rate / 100);
        const total = subtotal + icms;
        $("#budget-icms-rate").text(rate.toFixed(1));
        $("#budget-subtotal").text(formatCurrency(subtotal));
        $("#budget-icms").text(formatCurrency(icms));
        $("#budget-total").text(formatCurrency(total));
    }

    async #save() {
        $("#budget-form-error").text("").removeClass("is-visible");
        if (!apiAvailable()) {
            $("#budget-form-error").text("API indisponível.").addClass("is-visible");
            return;
        }
        const number = $("#budget-number").val()?.toString().trim() ?? "";
        const client = $("#budget-client").val()?.toString().trim() ?? "";
        const state = $("#budget-state").val()?.toString().trim() ?? "";
        const status = $("#budget-status").val()?.toString().trim() ?? "Rascunho";
        const observations = $("#budget-observations").val()?.toString().trim() ?? "";
        const items = this.#collectItems();

        if (!client || !state) {
            $("#budget-form-error").text("Cliente e estado são obrigatórios.").addClass("is-visible");
            return;
        }

        try {
            const itemsJson = JSON.stringify(items);
            let raw;
            if (this.#editingId) {
                raw = await window.pywebview.api.update_budget(
                    this.#editingId, number, client, state, itemsJson, observations, status
                );
            } else {
                raw = await window.pywebview.api.add_budget(
                    number, client, state, itemsJson, observations, status
                );
            }
            const result = parseApiResult(raw);
            if (!result || result.error || result.ok === false) {
                $("#budget-form-error").text(result?.error || "Falha ao salvar.").addClass("is-visible");
                return;
            }

            if (this.#editingId) {
                eventBus.publishAsync("budget:updated", result);
                if (this.#previousStatus && this.#previousStatus !== result.status) {
                    eventBus.publishAsync("budget:status-changed", result);
                }
            } else {
                eventBus.publishAsync("budget:created", result);
                if (result.status === "Aprovado") {
                    eventBus.publishAsync("budget:status-changed", result);
                }
            }

            this.#closeModal();
            await this.#load();
        } catch {
            $("#budget-form-error").text("Erro ao salvar orçamento.").addClass("is-visible");
            eventBus.publishAsync("system:error", { message: "Erro ao salvar orçamento." });
        }
    }

    async #duplicate(id) {
        if (!apiAvailable() || !id) return;
        try {
            const raw = await window.pywebview.api.duplicate_budget(id);
            const result = parseApiResult(raw);
            if (result && !result.error) {
                eventBus.publishAsync("budget:created", result);
                await this.#load();
            }
        } catch {
            eventBus.publishAsync("system:error", { message: "Erro ao duplicar orçamento." });
        }
    }

    async #remove(id) {
        if (!apiAvailable() || !id) return;
        if (!confirm("Excluir este orçamento?")) return;
        try {
            const raw = await window.pywebview.api.remove_budget(id);
            const result = parseApiResult(raw);
            if (result?.ok !== false) await this.#load();
        } catch {
            eventBus.publishAsync("system:error", { message: "Erro ao excluir orçamento." });
        }
    }
}
