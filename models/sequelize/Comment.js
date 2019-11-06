const { Model, DataTypes } = require('sequelize');
const path = require('path');

const root = path.dirname(process.mainModule.filename);
const sequelize = require(path.join(root, 'database', 'db-mysql.js'));

class Comment extends Model {}

Comment.init(
  {
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    updatedAt: false,
  },
);

Comment.associate = (models) => {
  Comment.belongsTo(models.User, { as: 'author' });
  Comment.belongsTo(models.Article, { as: 'article' });
};

module.exports = Comment;
