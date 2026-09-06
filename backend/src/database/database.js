import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import { DatabaseError } from "../errors/database-error.js";

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";

function connectToDatabase(databaseUrl) { 
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
        console.error("Error connecting to the database:", error); 
        return DatabaseError("Failed to connect to the database. Please check your connection settings.");
    }
}

export const db = connectToDatabase(DATABASE_URL);
