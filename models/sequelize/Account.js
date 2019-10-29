const { Model, DataTypes } = require('sequelize');
const path = require('path');

const root = path.dirname(process.mainModule.filename);
const sequelize = require(path.join(root, 'database', 'db-mysql.js'));

class Account extends Model {}

Account.init(
  {
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    providerUserId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
  },
);

Account.associate = (models) => {
  Account.belongsTo(models.User, { as: 'user' });
};

module.exports = Account;
