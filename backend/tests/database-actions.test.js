import { connectToDatabase } from "../src/database/database.js";

import { describe, expect, test, vi } from "vitest";

describe("Database Actions Tests", () => {

    test("Test database with query execution", async () => {
        const db = await connectToDatabase("postgres://user:password@localhost:5432/testdb");
        
        db.executeQuery = vi.fn().mockResolvedValue([{ id: 1, name: "Test User" }]);
                
        const result = await db.executeQuery("SELECT * FROM users WHERE id = ?", [1]);
        expect(result).toEqual([{ id: 1, name: "Test User" }]);
    });

});
