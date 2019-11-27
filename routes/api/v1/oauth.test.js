const supertest = require('supertest');
const app = require('../../../app.js');
const clearDatabase = require('../../../tests/clearDatabase');

jest.setTimeout(10000);

const request = supertest(app);

describe('Oauth Endpoints', () => {
  afterAll(async () => {
    await clearDatabase();
  });

  it('should login / register user via Gopogle', async () => {
    const res = await request
      .post('/api/v1/oauth/google/callback')
      .query({ code: 'test' });
    expect(res.status).toBe(200);
  });

  it('should login / register user via Facebook', async () => {
    const res = await request
      .post('/api/v1/oauth/facebook/callback')
      .query({ code: 'test' });
    expect(res.status).toBe(200);
  });
});
