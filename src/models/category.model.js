module.exports = (sequelize, DataTypes) => {
  const category = sequelize.define(
    'Category',
    {
      categoryID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      categoryName: {
        type: DataTypes.STRING(100),
        allowNull: false
      }
    },
    {
      timestamps: false
    }
  );

  return category;
};
