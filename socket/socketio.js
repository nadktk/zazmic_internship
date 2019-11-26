const passportSocketIo = require('passport.socketio');
const redisAdapter = require('socket.io-redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const { infoLogger, errorLogger } = require('../logger/logger');

const client = require('../database/redis-client');

const rateLimiter = new RateLimiterRedis({
  redis: client,
  keyPrefix: 'nadia:socket:rl',
  points: 10,
  duration: 1,
});

module.exports = (io, sessionConfig) => {
  io.adapter(redisAdapter(process.env.REDIS_URL));

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

    const ip = socket.handshake.headers['x-forwarded-for']
      || socket.request.connection.remoteAddress;

    socket.use(async (_, next) => {
      try {
        await rateLimiter.consume(ip);
        next();
      } catch (err) {
        next(new Error('Rate limit error'));
      }
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
