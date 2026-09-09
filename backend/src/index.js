import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';

import { db } from './database/database.js';
import { generateJWT } from './jwt/jwt.js';

export const app = new Hono();

app.use("*", cors());
app.use("*", async (c, next) => {
    try {
        await next();
    } catch (err) {
        console.error(err);
        return c.json({ ok: false, message: "Internal Server Error" }, 500);
    }
});

app.get("/login/auth", async (c) => {
    const query = db.executeQuery("SELECT USERNAME, PASSWORD FROM EMPLOYEE;");
    
    return c.json({
        ok: true, 
        message: "Logged in"
    });
});

serve({
    fetch: app.fetch,
    port: 3000,
});

console.log('Server running on http://localhost:3000');
