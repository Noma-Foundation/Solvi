export const TASK_STATUSES = ["todo", "doing", "done"];

const STATUS_LABELS = {
    todo: "A Fazer",
    doing: "Em Andamento",
    done: "Concluído",
};

/**
 * Builds a task record from the backend's task data, mapping its snake_case
 * fields to the record shape the UI uses.
 *
 * @param {object} task - Task data returned by the backend.
 * @returns {object} - Task record ready to be stored and rendered.
 */
export function buildTaskRecord(task) {
    return {
        id: task.task_id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date,
        status: task.status,
    };
}

/**
 * Human-readable (pt-BR) label for a task's Kanban column.
 *
 * @param {String} status - Raw status ("todo" | "doing" | "done").
 * @returns {String} - The label to display.
 */
export function taskStatusLabel(status) {
    return STATUS_LABELS[status] ?? status;
}
