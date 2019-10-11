const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const hashPassword = require('../utils/hash-password');

class User extends Model {}

User.init(
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
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
    as: 'article',
    foreignKey: 'authorId',
  });
};

module.exports = User;
