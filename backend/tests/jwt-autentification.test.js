import { testClient } from 'hono/testing';
import { app } from '../src/index.js';
import { describe, test, expect } from 'vitest';

describe('JWT Authentication Tests', () => { 

    const client = testClient(app);

    test("Get initial endpoint should return 200 OK", async () => { 
        const request = await client.login.auth.$post();

        expect(request.status).toBe(200);
    });

    test("Test endpoint with correct return", async () => { 
        const request = await client.login.auth.$post();
        const body = await request.json();

        expect(request.ok).toBeTruthy();
        expect(request.status).toBe(200);
        expect(body).toEqual({
            ok: true,
            message: "Logged in"
        }); 
    });

    test("Should reject invalid credentials", async () => { 
        const request = await client.login.auth.$post({
            json: { 
                username: "invalid",
                password: "invalid"
            },
        });  
    });

});