/**
 * This function is used to return an HTML object containing a “not completed” message,
 * This message will be displayed to the user if the content is incomplete. It is part of the Solvi Management System's error handling mechanism.
 * 
 * @returns {string} return HTML object
 */
export function NotCompleted() {
    return `
        <div class="container text-center py-5">
            <h3 class="text-danger text-center">This content is not completed yet.</h3>
            <p class="text-danger text-center">Please try again later.</p>
        </div>
    `;
}