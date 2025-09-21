
const request = require('supertest');
const mongoose = require('mongoose');
jest.spyOn(mongoose, 'connect').mockImplementation(() => Promise.resolve());
const app = require('../server');

describe('Sample API Test', () => {
  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
  });
});
