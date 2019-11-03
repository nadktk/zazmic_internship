module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.addColumn(
      'articles',
      'picture',
      {
        type: Sequelize.STRING,
      },
      { transaction: t },
    ),
    queryInterface.addColumn(
      'users',
      'picture',
      {
        type: Sequelize.STRING,
      },
      { transaction: t },
    ),
  ])),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.removeColumn('articles', 'picture', { transaction: t }),
    queryInterface.removeColumn('users', 'picture', { transaction: t }),
  ])),
};
