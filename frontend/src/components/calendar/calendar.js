import $ from "jquery";
import { Modal } from "bootstrap";

import { IComponentModel } from "../../../framework/interfaces/component-model.js";
import { setButtonLoading } from "../../utils/loading-state.js";
import { buildTaskRecord, taskStatusLabel, TASK_STATUSES } from "../../utils/task-record.js";
import { formatFullDatePtBr } from "../../utils/notification-record.js";

import searchIcon from "../../assets/search_icon.svg";

import "./calendar.css";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/**
 * Calendar page. Shows a month grid of personal tasks and, once a day is
 * selected, a Kanban board (A Fazer / Em Andamento / Concluído) scoped to
 * that day, owning the create/edit/delete/move flows for its tasks.
 *
 * @extends IComponentModel
 */
export class CalendarComponentPage extends IComponentModel {
    /** @type {Map<string, object>} - All known tasks, keyed by task ID. */
    #tasks;
    /** @type {number} - Year of the month currently displayed in the grid. */
    #viewYear;
    /** @type {number} - Month (0-11) currently displayed in the grid. */
    #viewMonth;
    /** @type {string|null} - ISO date ("YYYY-MM-DD") of the day whose Kanban board is open, or null. */
    #selectedDate;
    /** @type {Modal} - Bootstrap modal instance shared by the create and edit flows. */
    #taskModal;
    /** @type {string|null} - ID of the task being edited, or null when the modal is in "create" mode. */
    #editingTaskId;
    /** @type {string} - Current title filter applied to the open day's Kanban board. */
    #kanbanSearchQuery;

    /**
     * @constructs {CalendarComponentPage}
     * @param {String} [rootSelector="#app-main-context"] - Selector of the element this component is rendered into.
     */
    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
        this.#tasks = new Map();

        const today = new Date();
        this.#viewYear = today.getFullYear();
        this.#viewMonth = today.getMonth();
        this.#selectedDate = null;
        this.#editingTaskId = null;
        this.#kanbanSearchQuery = "";
        this.init();

        if (window.pywebview && window.pywebview.api) {
            this.#loadTasks();
        } else {
            window.addEventListener("pywebviewready", () => this.#loadTasks());
        }
    }

    /**
     * Builds the page shell (month navigation, weekday header, grid mount
     * point, Kanban section) and the shared create/edit task modal, injects
     * it into the DOM, and instantiates the Bootstrap modal. Called once by
     * {@link IComponentModel#init}.
     */
    buildTemplate() {
        this.template = /* html */ `
            <div class="container-fluid">
                <header class="p-3 pb-2 d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div>
                        <h3 class="mb-1">Calendário</h3>
                        <p class="text-secondary mb-0">Gerencie suas tarefas pessoais por dia.</p>
                    </div>
                    <div class="input-group search-input" style="max-width: 280px;">
                        <button class="btn btn-outline-secondary" type="button">
                            <img src="${searchIcon}" alt="Search" width="16" height="16">
                        </button>
                        <input type="text" class="form-control" id="calendar-search-input" placeholder="Pesquisar..." aria-label="Search tasks...">
                    </div>
                </header>

                <section class="px-3 pb-2 d-flex align-items-center gap-2">
                    <button type="button" class="btn btn-outline-secondary btn-sm" id="calendar-prev-month" aria-label="Mês anterior">‹</button>
                    <span class="calendar-month-label" id="calendar-month-label"></span>
                    <button type="button" class="btn btn-outline-secondary btn-sm" id="calendar-next-month" aria-label="Próximo mês">›</button>
                    <button type="button" class="btn btn-outline-primary btn-sm ms-2" id="calendar-today-btn">Hoje</button>
                </section>

                <section class="px-3 pb-3">
                    <div class="calendar-weekday-row">
                        ${WEEKDAY_LABELS.map((label) => `<div class="calendar-weekday">${label}</div>`).join("")}
                    </div>
                    <div class="calendar-grid" id="calendar-grid"></div>
                </section>

                <section class="px-3 pb-4" id="calendar-kanban-section" hidden>
                    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <h5 class="mb-0" id="calendar-kanban-title"></h5>
                        <button type="button" class="btn btn-primary btn-sm btn-new-budget" id="calendar-add-task-btn">Nova tarefa</button>
                    </div>
                    <div class="calendar-kanban-board" id="calendar-kanban-board"></div>
                </section>
            </div>

            ${this.#taskFormModal()}
        `;

        $(this.context).html(this.template);
        this.#taskModal = new Modal(document.getElementById("task-modal"));
    }

    /**
     * Wires up month navigation, day selection, the search filter, the
     * create/edit task form, and the per-card edit/delete/move actions.
     * Called once by {@link IComponentModel#init}, after {@link buildTemplate}.
     */
    bindEvents() {
        $("#calendar-prev-month").on("click", () => this.#shiftMonth(-1));
        $("#calendar-next-month").on("click", () => this.#shiftMonth(1));
        $("#calendar-today-btn").on("click", () => this.#goToToday());

        $("#calendar-grid").on("click", (event) => {
            const $cell = $(event.target).closest(".calendar-day");
            if (!$cell.length) { return; }
            this.#selectDate($cell.data("date"));
        });

        $("#calendar-add-task-btn").on("click", () => this.#openCreateModal());

        $("#task-form").on("submit", (event) => {
            event.preventDefault();
            this.#saveTask();
        });

        $("#calendar-kanban-board").on("click", (event) => {
            const $card = $(event.target).closest(".task-card");
            if (!$card.length) { return; }
            const taskId = $card.data("id");

            if ($(event.target).closest(".btn-task-edit").length) {
                this.#openEditModal(taskId);
            } else if ($(event.target).closest(".btn-task-delete").length) {
                this.#deleteTask(taskId);
            } else if ($(event.target).closest(".btn-task-move-prev").length) {
                this.#moveTaskStatus(taskId, -1);
            } else if ($(event.target).closest(".btn-task-move-next").length) {
                this.#moveTaskStatus(taskId, 1);
            }
        });

        $("#calendar-search-input").on("input", (event) => {
            this.#kanbanSearchQuery = event.target.value;
            this.#renderKanban();
        });
    }

    /**
     * Fetches every task from the backend and renders the month grid and,
     * if a day is selected, its Kanban board. Called once during
     * initialization, once the pywebview API is ready. Failures are logged
     * and leave the calendar empty.
     *
     * @async
     */
    async #loadTasks() {
        try {
            const tasks = await window.pywebview.api.get_tasks();
            for (const task of tasks) {
                this.#tasks.set(task.task_id, buildTaskRecord(task));
            }
            this.#renderGrid();
            this.#renderKanban();
        } catch (error) {
            console.error("[ERROR] Failed to load tasks.", error);
        }
    }

    /**
     * Moves the displayed month forward/backward and re-renders the grid.
     *
     * @param {number} offset - -1 for the previous month, 1 for the next.
     */
    #shiftMonth(offset) {
        this.#viewMonth += offset;
        if (this.#viewMonth < 0) {
            this.#viewMonth = 11;
            this.#viewYear -= 1;
        } else if (this.#viewMonth > 11) {
            this.#viewMonth = 0;
            this.#viewYear += 1;
        }
        this.#renderGrid();
    }

    /**
     * Jumps the grid back to the current month and opens today's Kanban board.
     */
    #goToToday() {
        const today = new Date();
        this.#viewYear = today.getFullYear();
        this.#viewMonth = today.getMonth();
        this.#renderGrid();
        this.#selectDate(this.#isoDate(today));
    }

    /**
     * Selects a day: re-renders the grid (to move the highlight) and opens
     * its Kanban board.
     *
     * @param {string} isoDate - ISO date ("YYYY-MM-DD") of the day to select.
     */
    #selectDate(isoDate) {
        this.#selectedDate = isoDate;
        this.#renderGrid();
        this.#renderKanban();
    }

    /**
     * Formats a Date as an ISO date string ("YYYY-MM-DD") using its local
     * calendar fields (never UTC, so the result matches what the user sees).
     *
     * @param {Date} date - The date to format.
     * @returns {String} - The ISO date string.
     */
    #isoDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    /**
     * Renders the month label and the day grid for {@link #viewYear}/{@link #viewMonth},
     * including the today/selected highlights and a per-day task-count badge.
     */
    #renderGrid() {
        $("#calendar-month-label").text(`${MONTH_LABELS[this.#viewMonth]} ${this.#viewYear}`);

        const firstDay = new Date(this.#viewYear, this.#viewMonth, 1);
        const daysInMonth = new Date(this.#viewYear, this.#viewMonth + 1, 0).getDate();
        const leadingBlanks = firstDay.getDay();
        const todayIso = this.#isoDate(new Date());

        let html = "";
        for (let i = 0; i < leadingBlanks; i++) {
            html += '<div class="calendar-day calendar-day--empty"></div>';
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const iso = `${this.#viewYear}-${String(this.#viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const taskCount = [...this.#tasks.values()].filter((task) => task.dueDate === iso).length;

            const classes = ["calendar-day"];
            if (iso === todayIso) { classes.push("calendar-day--today"); }
            if (iso === this.#selectedDate) { classes.push("calendar-day--selected"); }

            html += /* html */ `
                <div class="${classes.join(" ")}" data-date="${iso}" role="button" tabindex="0">
                    <span class="calendar-day__number">${day}</span>
                    ${taskCount ? `<span class="calendar-day__badge">${taskCount}</span>` : ""}
                </div>
            `;
        }

        $("#calendar-grid").html(html);
    }

    /**
     * Renders the Kanban board for {@link #selectedDate}, applying the
     * current search filter. Hides the whole section when no day is selected.
     */
    #renderKanban() {
        if (!this.#selectedDate) {
            $("#calendar-kanban-section").attr("hidden", true);
            return;
        }
        $("#calendar-kanban-section").removeAttr("hidden");

        const [year, month, day] = this.#selectedDate.split("-").map(Number);
        $("#calendar-kanban-title").text(formatFullDatePtBr(new Date(year, month - 1, day)));

        const query = this.#kanbanSearchQuery.trim().toLowerCase();
        let dayTasks = [...this.#tasks.values()].filter((task) => task.dueDate === this.#selectedDate);
        if (query) {
            dayTasks = dayTasks.filter((task) => task.title.toLowerCase().includes(query));
        }

        const columnsHtml = TASK_STATUSES.map((status) => {
            const columnTasks = dayTasks.filter((task) => task.status === status);
            return /* html */ `
                <div class="kanban-column">
                    <p class="kanban-column__title">${taskStatusLabel(status)} <span class="kanban-column__count">${columnTasks.length}</span></p>
                    <div class="kanban-column__list">
                        ${columnTasks.map((task) => this.#taskCard(task)).join("") || '<p class="kanban-empty">Nenhuma tarefa</p>'}
                    </div>
                </div>
            `;
        }).join("");

        $("#calendar-kanban-board").html(columnsHtml);
    }

    /**
     * Builds the HTML markup for a task's card in the Kanban board.
     *
     * @param {object} task - The task to render a card for.
     * @returns {String} - HTML markup for the task's card.
     */
    #taskCard(task) {
        const statusIndex = TASK_STATUSES.indexOf(task.status);
        const canMovePrev = statusIndex > 0;
        const canMoveNext = statusIndex < TASK_STATUSES.length - 1;

        return /* html */ `
            <div class="task-card" data-id="${task.id}">
                <p class="task-card__title mb-1">${task.title}</p>
                ${task.description ? `<p class="task-card__description mb-2">${task.description}</p>` : ""}
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex gap-1">
                        <button type="button" class="btn btn-outline-secondary btn-sm btn-task-move-prev" ${canMovePrev ? "" : "disabled"} aria-label="Mover para trás">‹</button>
                        <button type="button" class="btn btn-outline-secondary btn-sm btn-task-move-next" ${canMoveNext ? "" : "disabled"} aria-label="Mover para frente">›</button>
                    </div>
                    <div class="d-flex gap-1">
                        <button type="button" class="btn btn-outline-secondary btn-sm btn-task-edit">Editar</button>
                        <button type="button" class="btn btn-outline-danger btn-sm btn-task-delete">Excluir</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Resets the shared modal to its "create" state, pre-filling the date
     * with the currently open day (or today, if none is open), and shows it.
     */
    #openCreateModal() {
        this.#editingTaskId = null;

        $("#task-modal-title").text("Nova tarefa");
        $("#task-form")[0].reset();
        $("#task-error").hide();
        $("#task-date-input").val(this.#selectedDate ?? this.#isoDate(new Date()));

        this.#taskModal.show();
    }

    /**
     * Fills the shared modal with a task's current data and shows it in
     * "edit" state. No-op if the task isn't known.
     *
     * @param {string} taskId - ID of the task to edit.
     */
    #openEditModal(taskId) {
        const task = this.#tasks.get(taskId);
        if (!task) { return; }

        this.#editingTaskId = taskId;

        $("#task-modal-title").text("Editar tarefa");
        $("#task-error").hide();
        $("#task-title-input").val(task.title);
        $("#task-description-input").val(task.description ?? "");
        $("#task-date-input").val(task.dueDate);
        $("#task-status-input").val(task.status);

        this.#taskModal.show();
    }

    /**
     * Validates the create/edit form and persists it to the backend: creates
     * a new task, or updates the one being edited, depending on
     * {@link #editingTaskId}. On success, re-renders the grid and Kanban
     * board and closes the modal. Shows an inline error and leaves the modal
     * open on failure.
     *
     * @async
     */
    async #saveTask() {
        const title = $("#task-title-input").val().trim();
        const dueDate = $("#task-date-input").val();
        if (!title || !dueDate) { return; }

        const description = $("#task-description-input").val().trim() || null;
        const status = $("#task-status-input").val();

        $("#task-error").hide();
        const $saveBtn = $("#task-save-btn");
        setButtonLoading($saveBtn, true);

        try {
            const task = this.#editingTaskId
                ? await window.pywebview.api.edit_task(this.#editingTaskId, title, description, dueDate, status)
                : await window.pywebview.api.add_task(title, dueDate, description, status);

            this.#tasks.set(task.task_id, buildTaskRecord(task));
            this.#taskModal.hide();
            this.#renderGrid();
            this.#renderKanban();
        } catch (error) {
            console.error("[ERROR] Failed to save task.", error);
            $("#task-error").show();
        } finally {
            setButtonLoading($saveBtn, false);
        }
    }

    /**
     * Persists the removal of a task to the backend, then re-renders the
     * grid and Kanban board on success.
     *
     * @async
     * @param {string} taskId - ID of the task to delete.
     */
    async #deleteTask(taskId) {
        try {
            await window.pywebview.api.delete_task(taskId);
            this.#tasks.delete(taskId);
            this.#renderGrid();
            this.#renderKanban();
        } catch (error) {
            console.error("[ERROR] Failed to delete task.", error);
        }
    }

    /**
     * Moves a task one Kanban column left/right and persists the new status.
     * No-op at the edges of the board (there's nowhere to move the task to).
     *
     * @async
     * @param {string} taskId - ID of the task to move.
     * @param {number} direction - -1 to move left (backward), 1 to move right (forward).
     */
    async #moveTaskStatus(taskId, direction) {
        const task = this.#tasks.get(taskId);
        if (!task) { return; }

        const newIndex = TASK_STATUSES.indexOf(task.status) + direction;
        if (newIndex < 0 || newIndex >= TASK_STATUSES.length) { return; }

        try {
            const updated = await window.pywebview.api.edit_task(taskId, null, null, null, TASK_STATUSES[newIndex]);
            this.#tasks.set(taskId, buildTaskRecord(updated));
            this.#renderKanban();
        } catch (error) {
            console.error("[ERROR] Failed to move task.", error);
        }
    }

    /**
     * Builds the HTML markup for the shared create/edit task modal.
     *
     * @returns {String} - HTML markup for the modal.
     */
    #taskFormModal() {
        return /* html */ `
            <div class="modal fade" id="task-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <form id="task-form">
                            <div class="modal-header">
                                <h5 class="modal-title" id="task-modal-title">Nova tarefa</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body d-flex flex-column gap-3">
                                <div class="form-group">
                                    <label for="task-title-input" class="form-label">Título</label>
                                    <input type="text" class="form-control" id="task-title-input" required>
                                </div>

                                <div class="row g-3">
                                    <div class="col-md-6 form-group">
                                        <label for="task-date-input" class="form-label">Data</label>
                                        <input type="date" class="form-control" id="task-date-input" required>
                                    </div>
                                    <div class="col-md-6 form-group">
                                        <label for="task-status-input" class="form-label">Status</label>
                                        <select class="form-select" id="task-status-input">
                                            <option value="todo">A Fazer</option>
                                            <option value="doing">Em Andamento</option>
                                            <option value="done">Concluído</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="task-description-input" class="form-label">Descrição</label>
                                    <textarea class="form-control" id="task-description-input" rows="3"></textarea>
                                </div>

                                <p class="text-danger m-0" id="task-error" style="display: none;">Could not save the task.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary customer-add-btn button-font" id="task-save-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

}
