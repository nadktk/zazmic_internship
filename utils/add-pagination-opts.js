/* eslint-disable no-param-reassign */
const { Op } = require('sequelize');

module.exports = (opts, after) => {
  const [publAt, id] = after.split('_');
  opts.where = {
    ...opts.where,
    [Op.or]: [
      {
        publishedAt: {
          [Op.lt]: publAt,
        },
      },
      {
        publishedAt: publAt,
        id: { [Op.lt]: id },
      },
    ],
  };
};
