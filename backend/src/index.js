import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { setCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';
import { sql } from 'kysely';
import { pathToFileURL } from 'node:url';

import { db } from './database/database.js';
import { generateJWT } from './jwt/jwt.js';

export const app = new Hono();

app.use("*", cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use("*", async (c, next) => {
    try {
        await next();
    } catch (err) {
        console.error(err);
        return c.json({ ok: false, message: "Internal Server Error" }, 500);
    }
});

app.post("/login/auth", async (c) => {
    const credentials = await c.req.json().catch(() => null);
    const username = credentials?.username;
    const password = credentials?.password;

    if (typeof username !== "string" || typeof password !== "string") {
        return c.json({ ok: false, message: "Username and password are required" }, 400);
    }

    const result = await db.executeQuery(sql`
        SELECT USERNAME, PASSWORD
        FROM EMPLOYEE
        WHERE USERNAME = ${username}
        LIMIT 1;
    `.compile(db));
    const employee = result.rows?.[0];

    if (!employee || !(await bcrypt.compare(password, employee.password ?? employee.PASSWORD))) {
        return c.json({ ok: false, message: "Invalid credentials" }, 401);
    }

    const now = Math.floor(Date.now() / 1000);
    const token = await generateJWT({
        sub: employee.username ?? employee.USERNAME,
        iat: now,
        exp: now + 60 * 60,
    }, process.env.JWT_SECRET || "development-secret");

    setCookie(c, "solvi_auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
        maxAge: 60 * 60,
    });

    return c.json({
        ok: true,
        message: "Logged in",
    });
});

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    serve({
        fetch: app.fetch,
        port: 3000,
    });

    console.log('Server running on http://localhost:3000');
}
