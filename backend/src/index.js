import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

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
