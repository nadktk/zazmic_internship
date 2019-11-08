const path = require('path');
const passportSocketIo = require('passport.socketio');
const redisAdapter = require('socket.io-redis');

const { infoLogger, errorLogger } = require(path.join(
  __dirname,
  '..',
  'logger',
  'logger.js',
));

module.exports = (io, sessionConfig) => {
  io.adapter(redisAdapter('redis://:pwd@localhost:6379'));

  // get user information from a socket.io connection
  io.use(
    passportSocketIo.authorize({
      key: sessionConfig.name,
      secret: sessionConfig.secret,
      store: sessionConfig.store,
      fail: (data, message, error, accept) => {
        accept();
      },
    }),
  );

  io.on('connection', (socket) => {
    // log connection
    infoLogger.log({
      label: 'socket.io',
      level: 'info',
      message: `User ${socket.request.user.id
        || 'anonymous'} connected to socket ${socket.id}`,
    });

    socket.on('error', (error) => {
      // log errors
      errorLogger.log({
        level: 'error',
        message: error.message,
        metadata: error,
      });
    });

    const isLoggedIn = socket.request.user.logged_in || false;

    socket.on('watch-comments', (articleId) => {
      socket.join(`room_${articleId}`, () => {
        // listen to comment-typing for authenticated users
        if (isLoggedIn) {
          socket.on('comment-typing', (artId) => {
            socket.broadcast.to(`room_${artId}`).emit('comment-typing', {
              action: 'create',
            });
          });
        }
      });
    });

    socket.on('unwatch-comments', (articleId) => {
      socket.removeAllListeners('comment-typing');
      socket.leave(`room_${articleId}`);
    });
  });
};
