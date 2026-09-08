import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import { DatabaseError } from "../errors/database-error.js";

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";


/**
 * Connects to the database using the provided database Postgres URL and returns a Kysely instance.
 * 
 * @param {String} databaseUrl 
 * 
 * @returns {Kysely} A Kysely instance connected to the specified database.
 * @returns {DatabaseError} If there is an error connecting to the database, returns a DatabaseError with a message indicating the failure. 
 */
export function connectToDatabase(databaseUrl) {
    const regexSyntax = /^postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;

    if (!regexSyntax.test(databaseUrl)) {
        throw new DatabaseError("Invalid database URL syntax. Please provide a valid Postgres connection string.");
    }

    try {
        const dialect = new PostgresDialect({
            pool: new Pool({ 
                connectionString: databaseUrl,
            })
        });

        const db = new Kysely({
            dialect: dialect
        });
        
        return db; 
    } catch(error) {
        throw new DatabaseError("Failed to connect to the database. Please check your connection settings.");
    }
}

export const db = connectToDatabase(DATABASE_URL);
