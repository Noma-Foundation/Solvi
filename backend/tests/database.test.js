import { Kysely } from "kysely";
import { connectToDatabase } from "../src/database/database.js";

import { expect } from "@jest/globals";

describe("Test basic integration with Database", () => {

    test("Should return a Kysely instance for a valid connection URL", () => {
        const result = connectToDatabase("postgres://postgres:admin@localhost:5432/postgres");

        expect(result).toBeInstanceOf(Kysely);
    });

});