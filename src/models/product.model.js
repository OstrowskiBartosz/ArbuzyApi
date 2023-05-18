module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      productID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      categoryID: {
        type: DataTypes.INTEGER,
        references: {
          model: 'categories',
          key: 'categoryID'
        }
      },
      manufacturerID: {
        type: DataTypes.INTEGER,
        references: {
          model: 'manufacturers',
          key: 'manufacturerID'
        }
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      productName: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING(5000),
        allowNull: false
      },
      promotionName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      promotionDiscount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      }
    },
    {
      timestamps: false
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, { as: 'Category', foreignKey: 'categoryID' });
    models.Category.hasMany(Product, { as: 'Product', foreignKey: 'categoryID' });

    Product.belongsTo(models.Manufacturer, { as: 'Manufacturer', foreignKey: 'manufacturerID' });
    models.Manufacturer.hasMany(Product, { as: 'Product', foreignKey: 'manufacturerID' });
  };

  return Product;
};
