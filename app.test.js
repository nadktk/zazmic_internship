const supertest = require('supertest');
const app = require('./app.js');

jest.setTimeout(10000);

const request = supertest(app);

describe('Get frontend files', () => {
  it('should get frontend files', async () => {
    const res = await request.get('/articles');
    expect(res.status).toBe(200);
  });
});
