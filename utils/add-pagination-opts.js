/* eslint-disable no-param-reassign */
const { Op } = require('sequelize');

module.exports = (opts, after) => {
  const [publAt] = after.split('_');
  opts.where = {
    publishedAt: {
      [Op.lt]: publAt,
    },
  };
};
