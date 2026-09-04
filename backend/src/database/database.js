import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";

function connectToDatabase(databaseUrl) { 
    const dialect = new PostgresDialect({
        pool: new Pool({ 
            database: databaseUrl,
        })
    })

    const db = new Kysely({
        dialect: dialect
    });
    return db; 
}

export const db = connectToDatabase(DATABASE_URL);
