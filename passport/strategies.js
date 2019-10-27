/* eslint-disable no-underscore-dangle */
const path = require('path');

const root = path.dirname(process.mainModule.filename);
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook');
const bcrypt = require('bcryptjs');

const dbMysql = require(path.join(root, 'database', 'db-mysql.js'));

const { User, Account } = require(path.join(root, 'models', 'sequelize'));

const { infoLogger } = require(path.join(
  __dirname,
  '..',
  'logger',
  'logger.js',
));

/**
 * Local Strategy
 */

exports.localStrategy = new LocalStrategy(
  {
    usernameField: 'email',
  },
  async (username, password, done) => {
    try {
      // MySQL operations: find user by email
      const userByEmail = await User.unscoped().findOne({
        where: { email: username },
        raw: true,
      });
      if (
        userByEmail
        && (await bcrypt.compare(password, userByEmail.password))
      ) {
        delete userByEmail.password;
        done(null, userByEmail);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err);
    }
  },
);

/**
 * Google Strategy
 */

const findOrRegisterUser = async (provider, providerUserData, done) => {
  //
  const user = await User.findOne({
    where: { email: providerUserData.email },
    raw: true,
  });

  if (!user) {
    // create new user, create connection
    const newUser = {
      email: providerUserData.email,
      firstName: providerUserData.firstName,
      lastName: providerUserData.lastName,
      password: Math.random()
        .toString(36)
        .slice(2),
    };

    // transaction for user and connection creation
    let transaction;
    let createdUser;
    try {
      transaction = await dbMysql.transaction();
      createdUser = await User.create(newUser, {
        transaction,
      });
      // save connection
      await Account.create(
        {
          provider,
          userId: createdUser.id,
          providerUserId: providerUserData.id,
        },
        { transaction },
      );
      await transaction.commit();

      // logging success registration
      infoLogger.log({
        level: 'info',
        message: `User ${createdUser.id} was successfully registered`,
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw err;
    }
    done(null, createdUser);
  } else {
    await Account.findOrCreate({
      where: {
        provider,
        providerUserId: providerUserData.id,
      },
      defaults: {
        provider,
        providerUserId: providerUserData.id,
        userId: user.id,
      },
    });
    done(null, user);
  }
};

const googleOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
};

exports.googleStrategy = new GoogleStrategy(
  googleOptions,
  async (accessToken, refreshToken, profile, done) => {
    const providerUserData = {
      id: profile.id,
      firstName: profile._json.given_name,
      lastName: profile._json.family_name,
      email: profile._json.email,
    };

    findOrRegisterUser('google', providerUserData, done).catch((err) => done(err));
  },
);

/**
 * Facebook Strategy
 */

const facebookOptions = {
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'email', 'name'],
};

exports.facebookStrategy = new FacebookStrategy(
  facebookOptions,
  async (accessToken, refreshToken, profile, done) => {
    const providerUserData = {
      id: profile.id,
      firstName: profile._json.first_name,
      lastName: profile._json.last_name,
      email: profile._json.email,
    };

    findOrRegisterUser('facebook', providerUserData, done).catch((err) => done(err));
  },
);
