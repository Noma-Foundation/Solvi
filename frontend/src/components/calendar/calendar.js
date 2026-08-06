import $ from "jquery";

import { html } from "../../utils/html.js";
import { IComponentModel } from "../component-model.js";
import { eventBus } from "../../event-manager-singleton.js";
import { apiAvailable, escapeHtml, parseApiResult } from "../../utils/api-helpers.js";

import "./calendar.css";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/**
 * Monthly calendar with per-day task CRUD.
 * @implements {IComponentModel}
 */
export class CalendarManager extends IComponentModel {
    #rootSelector;
    #tasks = [];
    #viewYear;
    #viewMonth;
    #selectedDate = "";
    #editingId = null;

    constructor(rootSelector = "#app-main-context") {
        super();
        this.#rootSelector = rootSelector;
        const now = new Date();
        this.#viewYear = now.getFullYear();
        this.#viewMonth = now.getMonth();
        this.init();
    }

    buildTemplate() {
        const template = html`
            <section class="calendar-page">
                <div class="calendar-page__header">
                    <div>
                        <h1 class="calendar-page__title">Calendário</h1>
                        <p class="calendar-page__subtitle">Gerencie suas tarefas pessoais por dia.</p>
                    </div>
                    <div class="calendar-nav">
                        <button type="button" class="btn btn-outline-secondary btn-sm" id="calendar-prev">‹</button>
                        <h2 id="calendar-month-label" class="calendar-nav__label"></h2>
                        <button type="button" class="btn btn-outline-secondary btn-sm" id="calendar-next">›</button>
                        <button type="button" class="btn btn-outline-primary btn-sm" id="calendar-today">Hoje</button>
                    </div>
                </div>

                <div id="calendar-api-unavailable" class="solvi-unavailable">
                    API indisponível. Abra o app via Solvi (pywebview).
                </div>

                <div class="calendar-weekdays">
                    ${WEEKDAYS.map((d) => `<div>${d}</div>`).join("")}
                </div>
                <div id="calendar-grid" class="calendar-grid"></div>

                <div id="calendar-modal" class="calendar-modal" hidden>
                    <div class="calendar-modal__dialog">
                        <div class="calendar-modal__header">
                            <h3 id="calendar-modal-title">Tarefas</h3>
                            <button type="button" class="btn-close" id="calendar-modal-close" aria-label="Fechar"></button>
                        </div>
                        <div id="calendar-task-list" class="calendar-task-list"></div>
                        <form id="calendar-task-form" class="calendar-task-form" autocomplete="off">
                            <input type="hidden" id="calendar-task-id">
                            <div class="form-group">
                                <label for="calendar-task-title">Título</label>
                                <input type="text" id="calendar-task-title" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="calendar-task-desc">Descrição</label>
                                <textarea id="calendar-task-desc" class="form-control" rows="2"></textarea>
                            </div>
                            <div class="calendar-task-form__row">
                                <div class="form-group">
                                    <label for="calendar-task-date">Data</label>
                                    <input type="date" id="calendar-task-date" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="calendar-task-time">Horário</label>
                                    <input type="time" id="calendar-task-time" class="form-control">
                                </div>
                            </div>
                            <p id="calendar-form-error" class="calendar-form__error"></p>
                            <div class="calendar-task-form__actions">
                                <button type="button" class="btn btn-outline-secondary" id="calendar-form-cancel">Cancelar edição</button>
                                <button type="submit" class="btn btn-primary" id="calendar-form-submit">Adicionar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        `;
        $(this.#rootSelector).html(template);
    }

    bindEvents() {
        $("#calendar-prev").on("click", () => {
            this.#viewMonth -= 1;
            if (this.#viewMonth < 0) {
                this.#viewMonth = 11;
                this.#viewYear -= 1;
            }
            this.#renderGrid();
        });
        $("#calendar-next").on("click", () => {
            this.#viewMonth += 1;
            if (this.#viewMonth > 11) {
                this.#viewMonth = 0;
                this.#viewYear += 1;
            }
            this.#renderGrid();
        });
        $("#calendar-today").on("click", () => {
            const now = new Date();
            this.#viewYear = now.getFullYear();
            this.#viewMonth = now.getMonth();
            this.#renderGrid();
        });

        $("#calendar-grid").on("click", "[data-date]", (e) => {
            const date = $(e.currentTarget).attr("data-date");
            this.#openDay(date);
        });

        $("#calendar-modal-close").on("click", () => this.#closeModal());
        $("#calendar-modal").on("click", (e) => {
            if (e.target.id === "calendar-modal") this.#closeModal();
        });
        $("#calendar-form-cancel").on("click", () => this.#resetForm());
        $("#calendar-task-form").on("submit", async (e) => {
            e.preventDefault();
            await this.#saveTask();
        });

        $("#calendar-task-list").on("click", "[data-edit-task]", (e) => {
            const id = $(e.currentTarget).attr("data-edit-task");
            const task = this.#tasks.find((t) => t.id === id);
            if (task) this.#fillForm(task);
        });
        $("#calendar-task-list").on("click", "[data-remove-task]", async (e) => {
            const id = $(e.currentTarget).attr("data-remove-task");
            await this.#removeTask(id);
        });

        $("#calendar-form-cancel").hide();
        this.#load();
    }

    async #load() {
        if (!apiAvailable()) {
            $("#calendar-api-unavailable").addClass("is-visible");
            this.#tasks = [];
            this.#renderGrid();
            return;
        }
        try {
            const raw = await window.pywebview.api.get_calendar_tasks();
            const tasks = parseApiResult(raw);
            this.#tasks = Array.isArray(tasks) ? tasks : [];
            this.#renderGrid();
            if (this.#selectedDate) this.#renderDayTasks();
        } catch {
            $("#calendar-api-unavailable").addClass("is-visible");
            this.#tasks = [];
            this.#renderGrid();
        }
    }

    #tasksForDate(date) {
        return this.#tasks.filter((t) => t.date === date);
    }

    #renderGrid() {
        $("#calendar-month-label").text(`${MONTHS[this.#viewMonth]} ${this.#viewYear}`);
        const first = new Date(this.#viewYear, this.#viewMonth, 1);
        const startPad = first.getDay();
        const daysInMonth = new Date(this.#viewYear, this.#viewMonth + 1, 0).getDate();
        const today = new Date();
        const todayStr = this.#fmtDate(today);

        const cells = [];
        for (let i = 0; i < startPad; i++) {
            cells.push(`<div class="calendar-cell is-empty"></div>`);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = this.#fmtDate(new Date(this.#viewYear, this.#viewMonth, day));
            const count = this.#tasksForDate(date).length;
            const isToday = date === todayStr ? "is-today" : "";
            cells.push(html`
                <button type="button" class="calendar-cell ${isToday}" data-date="${date}">
                    <span class="calendar-cell__day">${day}</span>
                    ${count ? `<span class="calendar-cell__badge">${count}</span>` : ""}
                </button>
            `);
        }
        $("#calendar-grid").html(cells.join(""));
    }

    #fmtDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }

    #openDay(date) {
        this.#selectedDate = date;
        this.#resetForm();
        $("#calendar-task-date").val(date);
        $("#calendar-modal-title").text(`Tarefas · ${date}`);
        $("#calendar-modal").prop("hidden", false);
        this.#renderDayTasks();
    }

    #closeModal() {
        $("#calendar-modal").prop("hidden", true);
        this.#selectedDate = "";
        this.#resetForm();
    }

    #renderDayTasks() {
        const tasks = this.#tasksForDate(this.#selectedDate);
        const $list = $("#calendar-task-list");
        if (!tasks.length) {
            $list.html(`<div class="solvi-empty">Nenhuma tarefa neste dia.</div>`);
            return;
        }
        $list.html(tasks.map((t) => html`
            <article class="calendar-task">
                <div>
                    <strong>${escapeHtml(t.title)}</strong>
                    ${t.time ? `<span class="calendar-task__time">${escapeHtml(t.time)}</span>` : ""}
                    <p>${escapeHtml(t.description || "")}</p>
                </div>
                <div class="calendar-task__actions">
                    <button type="button" class="btn btn-sm btn-outline-primary" data-edit-task="${escapeHtml(t.id)}">Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-remove-task="${escapeHtml(t.id)}">Remover</button>
                </div>
            </article>
        `).join(""));
    }

    #fillForm(task) {
        this.#editingId = task.id;
        $("#calendar-task-id").val(task.id);
        $("#calendar-task-title").val(task.title || "");
        $("#calendar-task-desc").val(task.description || "");
        $("#calendar-task-date").val(task.date || this.#selectedDate);
        $("#calendar-task-time").val(task.time || "");
        $("#calendar-form-submit").text("Salvar");
        $("#calendar-form-cancel").show();
    }

    #resetForm() {
        this.#editingId = null;
        $("#calendar-task-form")[0]?.reset();
        $("#calendar-task-id").val("");
        $("#calendar-task-date").val(this.#selectedDate);
        $("#calendar-form-submit").text("Adicionar");
        $("#calendar-form-cancel").hide();
        $("#calendar-form-error").text("").removeClass("is-visible");
    }

    async #saveTask() {
        $("#calendar-form-error").text("").removeClass("is-visible");
        if (!apiAvailable()) {
            $("#calendar-form-error").text("API indisponível.").addClass("is-visible");
            return;
        }
        const title = $("#calendar-task-title").val()?.toString().trim() ?? "";
        const description = $("#calendar-task-desc").val()?.toString().trim() ?? "";
        const date = $("#calendar-task-date").val()?.toString().trim() ?? "";
        const time = $("#calendar-task-time").val()?.toString().trim() ?? "";
        if (!title || !date) {
            $("#calendar-form-error").text("Título e data são obrigatórios.").addClass("is-visible");
            return;
        }

        try {
            let raw;
            if (this.#editingId) {
                raw = await window.pywebview.api.update_calendar_task(
                    this.#editingId, title, description, date, time
                );
            } else {
                raw = await window.pywebview.api.add_calendar_task(title, description, date, time);
            }
            const result = parseApiResult(raw);
            if (!result || result.error || result.ok === false) {
                $("#calendar-form-error").text(result?.error || "Falha ao salvar.").addClass("is-visible");
                return;
            }
            eventBus.publishAsync(
                this.#editingId ? "calendar:task-updated" : "calendar:task-added",
                result
            );
            this.#selectedDate = date;
            this.#resetForm();
            await this.#load();
        } catch {
            $("#calendar-form-error").text("Erro ao salvar tarefa.").addClass("is-visible");
            eventBus.publishAsync("system:error", { message: "Erro ao salvar tarefa." });
        }
    }

    async #removeTask(id) {
        if (!apiAvailable() || !id) return;
        try {
            const raw = await window.pywebview.api.remove_calendar_task(id);
            const result = parseApiResult(raw);
            if (result?.ok === false) return;
            eventBus.publishAsync("calendar:task-removed", { id });
            await this.#load();
        } catch {
            eventBus.publishAsync("system:error", { message: "Erro ao remover tarefa." });
        }
    }
}
