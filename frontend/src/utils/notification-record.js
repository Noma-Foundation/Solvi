const STATUS_LABELS = {
    success: "Sucesso",
    info: "Informação",
    warning: "Aviso",
    error: "Erro",
};

const STATUS_CLASSES = {
    success: "status-label--correct",
    info: "status-label--info",
    warning: "status-label--warning",
    error: "status-label--error",
};

/**
 * Builds a notification record from the backend's notification data, mapping
 * its snake_case fields to the record shape the UI uses.
 *
 * @param {object} notification - Notification data returned by the backend.
 * @returns {object} - Notification record ready to be stored and rendered.
 */
export function buildNotificationRecord(notification) {
    return {
        id: notification.notification_id,
        referenceId: notification.reference_id,
        category: notification.category,
        status: notification.status,
        title: notification.title,
        message: notification.message,
        isRead: notification.is_read,
        createAt: notification.create_at,
    };
}

/**
 * Human-readable (pt-BR) label for a notification's status badge.
 *
 * @param {String} status - Raw status ("success" | "info" | "warning" | "error").
 * @returns {String} - The label to display.
 */
export function notificationStatusLabel(status) {
    return STATUS_LABELS[status] ?? status;
}

/**
 * CSS modifier class for a notification's status badge.
 *
 * @param {String} status - Raw status ("success" | "info" | "warning" | "error").
 * @returns {String} - The class to apply to the status badge.
 */
export function notificationStatusClass(status) {
    return STATUS_CLASSES[status] ?? "status-label--warning";
}

/**
 * Formats a Date as a full pt-BR date string with a capitalized weekday
 * (e.g. "Quinta-feira, 20 de agosto de 2026").
 *
 * @param {Date} date - The date to format.
 * @returns {String} - The formatted date.
 */
export function formatFullDatePtBr(date) {
    const formatted = date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Formats an ISO datetime string as "YYYY-MM-DD . HH:MM:SS".
 *
 * @param {String|null} isoDate - ISO datetime returned by the backend.
 * @returns {String} - The formatted timestamp, "-" when isoDate is missing.
 */
export function formatNotificationTimestamp(isoDate) {
    if (!isoDate) { return "-"; }
    const [datePart, timePart] = isoDate.split("T");
    return `${datePart} . ${(timePart ?? "").slice(0, 8)}`;
}
