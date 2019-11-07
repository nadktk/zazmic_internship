/* eslint-disable no-param-reassign */
const { Op } = require('sequelize');

module.exports = (opts, after) => {
  const [publAt, id] = after.split('_');
  opts.where = {
    id: {
      [Op.lt]: id,
    },
    publishedAt: {
      [Op.lt]: publAt,
    },
  };
};
