import { testClient } from 'hono/testing';
import { app } from '../src/index.js';

import { describe, test } from 'vitest';

describe('JWT Authentication Tests', () => { 

    const client = testClient(app);

    test("Get /home endpoint should return 200 OK", async () => { 

    });

});