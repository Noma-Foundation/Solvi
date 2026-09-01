const STATUS_LABELS = {
    pending: "Pendente",
    confirmed: "Confirmado",
    canceled: "Cancelado",
};

const STATUS_CLASSES = {
    pending: "status-label--warning",
    confirmed: "status-label--correct",
    canceled: "status-label--error",
};

/**
 * Builds a movement record from the backend's movement data, mapping its
 * snake_case fields to the record shape the UI uses. Shared by every
 * component that creates, loads, or edits movements so they stay in sync.
 *
 * @param {object} movement - Movement data returned by the backend.
 * @returns {object} - Movement record ready to be stored and rendered.
 */
export function buildMovementRecord(movement) {
    return {
        id: movement.movement_id,
        clientId: movement.client_id,
        sequenceNumber: movement.sequence_number,
        serialNumber: movement.serial_number,
        type: movement.type,
        status: movement.status,
        title: movement.title,
        location: movement.location,
        amount: movement.amount,
        taxRate: movement.tax_rate,
        taxAmount: movement.tax_amount,
        updateAt: movement.update_at,
    };
}

/**
 * Human-readable (pt-BR) label for a movement's status.
 *
 * @param {String} status - Raw status ("pending" | "confirmed" | "canceled").
 * @returns {String} - The label to display.
 */
export function movementStatusLabel(status) {
    return STATUS_LABELS[status] ?? status;
}

/**
 * CSS modifier class for a movement's status badge.
 *
 * @param {String} status - Raw status ("pending" | "confirmed" | "canceled").
 * @returns {String} - The class to apply to the status badge.
 */
export function movementStatusClass(status) {
    return STATUS_CLASSES[status] ?? "status-label--warning";
}

/**
 * The "+"/"-" sign shown next to a movement's amount, based on its type.
 *
 * @param {String} type - Movement type ("income" | "expense").
 * @returns {String} - "+" for income, "-" for expense.
 */
export function movementSign(type) {
    return type === "expense" ? "-" : "+";
}

/**
 * Pads a movement's sequence number into the display id shown on its card
 * (e.g. 1 -> "0001").
 *
 * @param {Number} sequenceNumber - The movement's per-tenant sequence number.
 * @returns {String} - The zero-padded display id.
 */
export function formatMovementSequence(sequenceNumber) {
    return String(sequenceNumber ?? 0).padStart(4, "0");
}

/**
 * Formats a numeric amount as a pt-BR decimal string (e.g. 1234.5 -> "1.234,50").
 *
 * @param {Number|null} value - The amount to format.
 * @returns {String} - The formatted amount, "0,00" when value is null/undefined.
 */
export function formatCurrency(value) {
    const amount = Number(value) || 0;
    return amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Formats an ISO datetime string as a plain date (YYYY-MM-DD).
 *
 * @param {String|null} isoDate - ISO datetime returned by the backend.
 * @returns {String} - The date portion, or "-" when isoDate is missing.
 */
export function formatMovementDate(isoDate) {
    if (!isoDate) { return "-"; }
    return isoDate.slice(0, 10);
}
