import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';

import { db } from './database/database.js';
import { generateJWT } from './jwt/jwt.js';

const app = new Hono();

app.use("*", cors());
app.use("*", async (c, next) => {
    try {
        await next();
    } catch (err) {
        console.error(err);
        return c.json({ ok: false, message: "Internal Server Error" }, 500);
    }
});

app.get("/api/auth/login", async (c) => { 

});

serve({
    fetch: app.fetch,
    port: 3000,
});

console.log('Server running on http://localhost:3000');
