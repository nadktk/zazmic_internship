module.exports = () => Date.now()
  .toString(32)
  .substr(-4)
  + Math.random()
    .toString(32)
    .substr(2);
