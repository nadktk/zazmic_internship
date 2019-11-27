/* eslint-disable */
const { Strategy } = require('passport');
const faker = require('faker');

class MockFacebookStrategy extends Strategy {
  constructor(options, verify) {
    super();
    this.user = {
      id: faker.random.number(),
      name: {
        givenName: faker.name.firstName(),
        familyName: faker.name.lastName(),
      },
      _json: {
        email: faker.internet.email(),
      },
    };
    this.name = 'facebook';
    this.options = options;
    this.verify = verify;
  }

  authenticate(req) {
    if (!req.query.code) {
      return this.redirect('/');
    }
    this.verify(null, null, this.user, (err, user) => {
      if (err) {
        return this.fail(err);
      }
      return this.success(user);
    });
  }
}

module.exports = MockFacebookStrategy;
