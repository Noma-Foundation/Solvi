import { testClient } from 'hono/testing';
import { describe, test, expect } from 'vitest';
import { app } from '../src/index.js';

describe("Test basic integration with Database", () => { 

    const client = testClient(app);
    
    test("Should return OK for the database connection", async () => { 
    });

});