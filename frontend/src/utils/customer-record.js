/**
 * Derives up to two uppercase initials from a client's full name, used for
 * the avatar bubble (e.g. "Ana Silva" -> "AS").
 *
 * @param {String} name - Full name to derive initials from.
 * @returns {String} - Up to two uppercase initials.
 */
function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
}

/**
 * Builds a client record from the backend's customer data, mapping its
 * snake_case fields to the record shape the UI uses. Shared by every
 * component that creates, loads, or edits clients so they stay in sync.
 *
 * @param {object} customer - Customer data returned by the backend.
 * @returns {object} - Client record ready to be stored and rendered.
 */
export function buildClientRecord(customer) {
    return {
        id: customer.client_id,
        name: customer.name,
        initials: getInitials(customer.name),
        email: customer.email,
        phoneNumber: customer.phone_number,
        document: customer.document,
        dateOfBirth: customer.date_of_birth,
        remark: customer.remark,
    };
}
