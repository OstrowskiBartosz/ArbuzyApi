module.exports = (sequelize, DataTypes) => {
  const Price = sequelize.define(
    'Price',
    {
      priceID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      productID: {
        type: DataTypes.INTEGER,
        references: {
          model: 'products',
          key: 'productID'
        }
      },
      netPrice: {
        type: DataTypes.FLOAT(7, 2),
        allowNull: false
      },
      grossPrice: {
        type: DataTypes.FLOAT(7, 2),
        allowNull: false
      },
      taxPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fromDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      toDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      }
    },
    {
      timestamps: false
    }
  );

  Price.associate = (models) => {
    Price.belongsTo(models.Product, { foreignKey: 'productID' });
    models.Product.hasMany(Price, { foreignKey: 'productID' });
  };

  return Price;
};
