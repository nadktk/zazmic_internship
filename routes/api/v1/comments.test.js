const supertest = require('supertest');
const app = require('../../../app.js');
const {
  registerUser,
  createArticle,
  createComment,
} = require('../../../tests/helpers');
const clearDatabase = require('../../../tests/clearDatabase');

jest.setTimeout(10000);

const agent = supertest.agent(app);

describe('Comments Endpoints', () => {
  // let user1; let user2; let article; let comment1; let
  //   comment2;

  // beforeAll(async () => {
  //   user1 = await registerUser();
  //   await user1.update({
  //     is_verified: true,
  //   });

  //   user2 = await registerUser();

  //   article = await createArticle(user1.id);

  //   await agent.post('/api/v1/login').send({
  //     email: user1.email,
  //     password: 'password',
  //   });

  //   comment2 = await createComment(user2.id, article.id);
  // });

  // afterAll(async () => {
  //   await clearDatabase();
  // });

  it('should return list of comments by artcile ID', async () => {
    const res = await agent.get(`/api/v1/blog/${article.id}/comments`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should post a new comment and return its details', async () => {
    const res = await agent
      .post(`/api/v1/blog/${article.id}/comments`)
      .send({ content: 'test' });
    expect(res.status).toBe(200);
    expect(typeof res.body.data).toBe('object');
    comment1 = res.body.data;
  });

  it('should delete a comment', async () => {
    const res = await agent.delete(
      `/api/v1/blog/${article.id}/comments/${comment1.id}`,
    );
    expect(res.status).toBe(200);
  });

  it('should return 404 status for wrong comment ID', async () => {
    const res = await agent.delete(
      `/api/v1/blog/${article.id}/comments/${comment1.id + 1}`,
    );
    expect(res.status).toBe(404);
  });

  it("should return 403 status after try to delete another user's comment", async () => {
    const res = await agent.delete(
      `/api/v1/blog/${article.id}/comments/${comment2.id}`,
    );
    expect(res.status).toBe(403);
  });
});
