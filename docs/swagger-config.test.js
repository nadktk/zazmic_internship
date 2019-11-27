const supertest = require('supertest');
const app = require('../app.js');

jest.setTimeout(10000);

const request = supertest(app);

describe('Get swagger docs', () => {
  it('should redirect to swagger docs page', async () => {
    const res = await request.get('/docs');
    expect(res.status).toBe(301);
  });
});
