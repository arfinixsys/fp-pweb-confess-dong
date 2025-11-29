const request = require('supertest');
const app = require('../src/app');

describe('GET /api/v1/messages', () => {
  test('responds with JSON containing success:true and data array', async () => {
    const res = await request(app).get('/api/v1/messages');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
