const { Model, DataTypes } = require('sequelize');
const path = require('path');

const root = path.dirname(process.mainModule.filename);
const sequelize = require(path.join(root, 'utils', 'database'));

class Article extends Model {}

Article.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
  },
);

Article.associate = (models) => {
  Article.belongsTo(models.User, { as: 'author' });
};

module.exports = Article;