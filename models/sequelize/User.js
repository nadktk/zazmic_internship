const { Model, DataTypes } = require('sequelize');

const sequelize = require('../../database/db-mysql');

const hashPassword = require('../../utils/hash-password');

class User extends Model {}

User.init(
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    picture: {
      type: DataTypes.TEXT,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_pro: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
    },
    stripe_card_id: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    underscored: true,
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    hooks: {
      beforeCreate: hashPassword,
      beforeUpdate: hashPassword,
    },
  },
);

User.associate = (models) => {
  User.hasMany(models.Article, {
    as: 'articles',
    foreignKey: 'authorId',
  });
  User.hasMany(models.Account, {
    as: 'connections',
    foreignKey: 'userId',
  });
  User.hasMany(models.Comment, {
    as: 'comments',
    foreignKey: 'authorId',
  });
};

module.exports = User;
