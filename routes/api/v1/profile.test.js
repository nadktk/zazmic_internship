const supertest = require('supertest');
const app = require('../../../app.js');
const { registerUser, createArticle } = require('../../../tests/helpers');
const clearDatabase = require('../../../tests/clearDatabase');

jest.setTimeout(10000);

const agent = supertest.agent(app);

describe('Profile Endpoints', () => {
  let user;

  beforeAll(async () => {
    user = await registerUser();
    await user.update({ is_verified: true });

    await agent.post('/api/v1/login').send({
      email: user.email,
      password: 'password',
    });
  });

  afterAll(async () => {
    await clearDatabase();
  });

  it('should update current user', async () => {
    const res = await agent.put('/api/v1/profile').send({
      firstName: 'test',
      lastName: 'test',
    });
    expect(res.status).toBe(200);
  });

  it('should update current user (add stripe card)', async () => {
    const res = await agent.put('/api/v1/profile/card').send({
      token: 'test',
    });
    expect(res.status).toBe(200);
  });

  it('should update current user (add picture)', async () => {
    const res = await agent
      .put('/api/v1/profile/picture')
      .attach('picture', Buffer.from('test'), '/path/to/file.png');
    expect(res.status).toBe(200);
  });

  it('should update current user (add picture)', async () => {
    const res = await agent
      .put('/api/v1/profile/picture')
      .attach('picture', Buffer.from('test'), '/path/to/file.png');
    expect(res.status).toBe(200);
  });

  it('should delete current user', async () => {
    const article = await createArticle(user.id);
    await article.update({ picture: 'tests/testFile' });

    const res = await agent.delete('/api/v1/profile');
    expect(res.status).toBe(200);
  });
});
