const supertest = require('supertest');
const app = require('../../../app.js');
const { registerUser, mongooseConnection } = require('../../../tests/helpers');
const clearDatabase = require('../../../tests/clearDatabase');

jest.setTimeout(10000);

const agent = supertest.agent(app);

describe('Fees Endpoints', () => {
  let user;

  beforeAll(async () => {
    await mongooseConnection();
    user = await registerUser();
    await user.update({
      is_verified: true,
    });

    await agent.post('/api/v1/login').send({
      email: user.email,
      password: 'password',
    });
  });

  afterAll(async () => {
    await clearDatabase();
  });

  it('should show amount of dollars to get PRO status (100 for user without stripe customer id)', async () => {
    const res = await agent.get('/api/v1/fees');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('amount');
    expect(res.body.data.amount).toBe(100);
  });

  it('should show amount of dollars to get PRO status', async () => {
    await user.update({
      stripe_customer_id: 'test',
      stripe_card_id: 'test',
    });
    const res = await agent.get('/api/v1/fees');
    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(50);
  });

  it('should create a new charge and set PRO status', async () => {
    const res = await agent.put('/api/v1/fees').send({
      amount: 100,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(0);
    expect(res.body.data.user.is_pro).toBe(true);
  });
});
