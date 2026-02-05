const request = require('supertest');
const app = require('../index');

// Mock the database connection to prevent actual connection attempts
jest.mock('../db', () => jest.fn());

describe('Health Check API', () => {
  it('should return 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: 'ok', message: 'Server is running' });
  });

  it('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/api/non-existent');
    expect(res.statusCode).toEqual(404);
  });
});
