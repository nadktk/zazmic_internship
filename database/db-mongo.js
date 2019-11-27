const mongoose = require('mongoose');

const { infoLogger, errorLogger, queryLogger } = require('../logger/logger');

const mongoUrl = process.env.MONGO_URL;

class Database {
  static async connect() {
    // set mongoose query logger
    mongoose.set('debug', (collectionName, method, query) => {
      queryLogger.log({
        label: 'mongodb',
        level: 'info',
        message: `Executed ${collectionName}.${method}: ${JSON.stringify(
          query,
        )}`,
      });
    });

    mongoose.connection.on('connected', () => {
      infoLogger.log({
        label: 'mongodb',
        level: 'info',
        message: 'Connected to MongoDB',
      });
    });

    mongoose.connection.on('error', (err) => {
      errorLogger.log({
        level: 'error',
        message: `Mongoose error: ${err.message}`,
        metadata: err,
      });
    });

    mongoose.connection.on('disconnected', () => {
      infoLogger.log({
        label: 'mongodb',
        level: 'info',
        message: 'Disconnected from MongoDB',
      });
    });

    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      replicaSet: 'mentorship-shard-0',
    });
  }
}

module.exports = Database;
