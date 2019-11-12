const { Model, DataTypes } = require('sequelize');
const path = require('path');

const root = path.dirname(process.mainModule.filename);
const sequelize = require(path.join(root, 'database', 'db-mysql.js'));
const hashPassword = require(path.join(root, 'utils', 'hash-password'));

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
