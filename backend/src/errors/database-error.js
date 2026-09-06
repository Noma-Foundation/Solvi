
/**
 * Custom error class for database-related errors.
 */
export class DatabaseError extends Error { 

    constructor(message) {
        super(message);
        this.name = "DatabaseError";
    }

} 