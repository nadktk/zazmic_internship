const supertest = require('supertest');
const app = require('../../../app.js');
const {
  registerUser,
  createArticle,
  mongooseConnection,
} = require('../../../tests/helpers');
const clearDatabase = require('../../../tests/clearDatabase');

jest.setTimeout(10000);

const agent = supertest.agent(app);

describe('Blog Endpoints', () => {
  let user;
  let article;

  beforeAll(async () => {
    await mongooseConnection();
    user = await registerUser();
    await user.update({
      is_verified: true,
    });

    article = await createArticle(user.id);

    await agent.post('/api/v1/login').send({
      email: user.email,
      password: 'password',
    });
  });

  afterAll(async () => {
    await clearDatabase();
  });

  it('should return list of articles', async () => {
    const res = await agent.get('/api/v1/blog');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return blog record by its ID', async () => {
    const res = await agent.get(`/api/v1/blog/${article.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.authorId).toBe(user.id);
  });

  it('should return 404 status when searching article by wrong ID', async () => {
    const res = await agent.get(`/api/v1/blog/${article.id + 1}`);
    expect(res.status).toBe(404);
  });

  it('should update article by ID', async () => {
    const res = await agent
      .put(`/api/v1/blog/${article.id}`)
      .field('title', 'test')
      .field('content', 'test')
      .field('publishedAt', '2019-10-15T09:00:00.000Z')
      .attach('picture', Buffer.from('test'), '/path/to/file.png');
    expect(res.status).toBe(200);
  });

  it('should return 404 status after try to update an article with wrong ID', async () => {
    const res = await agent
      .put(`/api/v1/blog/${article.id + 1}`)
      .field('title', 'test')
      .field('content', 'test')
      .field('publishedAt', '2019-10-10T09:00:00.000Z')
      .attach('picture', Buffer.from('test'), '/path/to/file.png');
    expect(res.status).toBe(404);
  });

  it('should post a new article', async () => {
    const res = await agent
      .post('/api/v1/blog/')
      .field('title', 'test')
      .field('content', 'test')
      .field('publishedAt', '2019-10-15T09:00:00.000Z')
      .attach('picture', Buffer.from('test'), '/path/to/file.png');
    expect(res.status).toBe(200);
    expect(res.body.data);
  });

  it('should delete article by ID', async () => {
    const res = await agent.delete(`/api/v1/blog/${article.id}`);
    expect(res.status).toBe(200);
  });

  it('should return 404 status after try to delete an article by wrong ID', async () => {
    const res = await agent.delete(`/api/v1/blog/${article.id}`);
    expect(res.status).toBe(404);
  });
});
