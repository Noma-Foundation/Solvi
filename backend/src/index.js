import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";

app.get("/api/clients", (c) => { 
    let test_client_object = {
        ok: true, 
        message: "Hello, World!"
    }

    return c.json(test_client_object);
});

serve({
    fetch: app.fetch,
    port: 3000,
});

console.log('Server running on http://localhost:3000');
