const { Transform } = require('stream');

const resize = () => new Transform({
  transform: (chunk, enc, done) => {
    done(null, chunk);
  },
});

module.exports = () => ({
  resize,
});
