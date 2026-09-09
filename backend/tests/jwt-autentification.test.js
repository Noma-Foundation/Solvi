import { testClient } from 'hono/testing';
import { app } from '../src/index.js';
import { db } from '../src/database/database.js';

import { describe, test, expect, vi } from 'vitest';

describe('JWT Authentication Tests', () => { 

    const client = testClient(app);

    test("Get initial endpoint should return 200 OK", async () => { 
        const request = await client.login.auth.$get({
            query: { q: "Login" }
        });
        
        expect(request.status).toBe(200);
    });

    test("Test endpoint with database correct query", () => { 
        db.executeQuery = vi.fn().mockReturnValue();
    });

});