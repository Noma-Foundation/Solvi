import { testClient } from "hono/testing";
import bcrypt from "bcryptjs";
import { app } from "../src/index.js";
import { db } from "../src/database/database.js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("JWT Authentication Tests", () => {
    const client = testClient(app);
    let executeQuery;

    beforeEach(async () => {
        const passwordHash = await bcrypt.hash("correct-password", 4);
        executeQuery = vi.spyOn(db, "executeQuery").mockResolvedValue({
            rows: [{ USERNAME: "test-user", PASSWORD: passwordHash }],
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("should authenticate valid credentials", async () => {
        const response = await client.login.auth.$post({
            json: {
                username: "test-user",
                password: "correct-password",
            },
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.ok).toBe(true);
        expect(body.message).toBe("Logged in");
        expect(body.token).toBeUndefined();
        expect(response.headers.get("set-cookie")).toEqual(expect.stringContaining("solvi_auth="));
        expect(response.headers.get("set-cookie")).toEqual(expect.stringContaining("HttpOnly"));
        expect(response.headers.get("set-cookie")).toEqual(expect.stringContaining("SameSite=Lax"));
        expect(response.headers.get("set-cookie")).toEqual(expect.stringContaining("Max-Age=3600"));
        expect(executeQuery).toHaveBeenCalledOnce();
    });

    test("should reject an invalid password", async () => {
        const response = await client.login.auth.$post({
            json: {
                username: "test-user",
                password: "wrong-password",
            },
        });
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({ ok: false, message: "Invalid credentials" });
    });

    test("should reject missing credentials", async () => {
        const response = await client.login.auth.$post();
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({
            ok: false,
            message: "Username and password are required",
        });
        expect(executeQuery).not.toHaveBeenCalled();
    });
});