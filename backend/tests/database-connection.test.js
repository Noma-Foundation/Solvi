import { Kysely } from "kysely";
import { connectToDatabase } from "../src/database/database.js";

import { expect } from "@jest/globals";

describe("Test basic integration with Database", () => {

    test("Should return a Kysely instance for a valid connection URL", () => {
        const result = connectToDatabase("postgres://postgres:admin@localhost:5432/postgres");

        expect(result).toBeInstanceOf(Kysely);
    });

    test("Should return a DatabaseError for an invalid connection URL", () => {
        const result = connectToDatabase("invalid_connection_url");
        
        expect(result).toBeInstanceOf(Error);
    });

    test("Should return a DatabaseError for an empty connection URL", () => {
        const result = connectToDatabase("");

        expect(result).toBeInstanceOf(Error);
    });

});