module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.addColumn(
      'users',
      'is_verified',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      { transaction: t },
    ),
    queryInterface.addColumn(
      'users',
      'is_pro',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      { transaction: t },
    ),
    queryInterface.addColumn(
      'users',
      'stripe_customer_id',
      {
        type: Sequelize.STRING,
      },
      { transaction: t },
    ),
    queryInterface.addColumn(
      'users',
      'stripe_card_id',
      {
        type: Sequelize.STRING,
      },
      { transaction: t },
    ),
  ])),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => Promise.all([
    queryInterface.removeColumn('users', 'is_verified', { transaction: t }),
    queryInterface.removeColumn('users', 'is_pro', { transaction: t }),
    queryInterface.removeColumn('users', 'stripe_customer_id', {
      transaction: t,
    }),
    queryInterface.removeColumn('users', 'stripe_card_id', {
      transaction: t,
    }),
  ])),
};
