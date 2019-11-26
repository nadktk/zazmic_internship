const http = require('http');
const socketio = require('socket.io');
const socketioInit = require('./socket/socketio');
const sessionConfig = require('./config/sessionConfig');
const app = require('./app');

//  databases
const dbMysql = require('./database/db-mysql');
const dbMongo = require('./database/db-mongo');

// logger
const { infoLogger, errorLogger } = require('./logger/logger');

// socketio
const server = http.createServer(app);
const io = socketio(server);

socketioInit(io, sessionConfig);
app.locals.io = io;

const port = process.env.PORT;

// connect databases and start server
const startServer = async () => {
  await dbMongo.connect().catch((err) => {
    throw new Error(`Unable to connect to MongoDB database (${err.message})`);
  });

  await dbMysql.authenticate().catch((err) => {
    throw new Error(`Unable to connect to MySQL database (${err.message})`);
  });

  infoLogger.log({
    label: 'mysql',
    level: 'info',
    message: 'Connected to MySQL',
  });

  server.listen(port, () => {
    infoLogger.log({
      label: 'server',
      level: 'info',
      message: `Server is running on port ${port}`,
    });
  });
};

startServer().catch((err) => {
  errorLogger.log({
    level: 'error',
    message: err.message,
    metadata: err.stack,
  });
  errorLogger.end(() => process.exit(1));
});
