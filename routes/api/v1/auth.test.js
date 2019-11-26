const supertest = require('supertest');
const app = require('../../../app.js');

jest.setTimeout(10000);

const request = supertest(app);

describe('Auth Endpoints', () => {
  it('should register user', async () => {
    const res = await request.post('/api/v1/registration').send({
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      password: 'password',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.is_verified).toBe(false);
  });

  // time is up
});
