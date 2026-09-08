import { Kysely } from "kysely";
import { connectToDatabase } from "../src/database/database.js";
import { DatabaseError } from "../src/errors/database-error.js";

import { expect } from "@jest/globals";

describe("Test basic integration with Database", () => {

    test("Should return a Kysely instance for a valid connection URL", () => {
        const result = connectToDatabase("postgres://postgres:admin@localhost:5432/postgres");

        expect(result).toBeInstanceOf(Kysely);
    });

    test("Should throw a DatabaseError for an invalid connection URL", () => {
        expect(() => connectToDatabase("invalid_connection_url")).toThrow(DatabaseError);
    });

    test("Should throw a DatabaseError for an empty connection URL", () => {
        expect(() => connectToDatabase("")).toThrow(DatabaseError);
    });

});