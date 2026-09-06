import { testClient } from 'hono/testing';
import { app } from '../src/index.js';

describe("Test basic integration with Hono", () => { 

    const client = testClient(app);
    
    test("Should return 200 OK for the root endpoint", async () => { 
        const response = await client.home.$get({
            query: { message: "Hello, World" },
        });

        expect(response.status).toBe(200); 
    });

});
