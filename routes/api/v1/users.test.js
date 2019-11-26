/* eslint-disable */
const supertest = require('supertest');
const app = require('../../../app.js');
const { registerUser, createArticle } = require('../../../tests/helpers');
const clearDatabase = require('../../../tests/clearDatabase');

jest.setTimeout(10000);

const request = supertest(app);

describe('Users Endpoints', () => {
  // let user1;
  // let user2;
  // let after;
  // const userArticles = [];
  // const n = 5;

  // beforeAll(async () => {
  //   user1 = await registerUser();
  //   user2 = await registerUser();
  //   for (let i = 0; i < n + 1; i++) {
  //     const article = await createArticle(user1.id);
  //     userArticles.push(article);
  //   }
  //   await request.get(`/api/v1/blog/${userArticles[0].id}`);
  //   await request.get(`/api/v1/blog/${userArticles[1].id}`);
  // });

  // afterAll(async () => {
  //   await clearDatabase();
  // });

  it('should return list of users', async () => {
    const res = await request.get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[1]).toHaveProperty('viewsCount');
  });

  it('should return a user by ID', async () => {
    const res = await request.get(`/api/v1/users/${user2.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Object.keys(res.body.data)).toHaveLength(11);
  });

  it('should return user not found', async () => {
    const res = await request.get(`/api/v1/users/${user2.id + 1}`);
    expect(res.status).toBe(404);
  });

  it("should return list of user's articles", async () => {
    const res = await request.get(`/api/v1/users/${user1.id}/blog`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(n);
    after = `${res.body.data[n - 1].publishedAt}_${res.body.data[n - 1].id}`;
  });

  it("should return list of user's articles for second page", async () => {
    const res = await request.get(
      `/api/v1/users/${user1.id}/blog?after=${after}`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});
