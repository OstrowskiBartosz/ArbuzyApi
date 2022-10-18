module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define(
    'CartItem',
    {
      cartItemID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      cartID: {
        type: DataTypes.INTEGER,
        references: {
          model: 'carts',
          key: 'cartID'
        }
      },
      productID: {
        type: DataTypes.INTEGER,
        references: {
          model: 'products',
          key: 'productID'
        }
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    },
    {
      timestamps: false
    }
  );

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart, { foreignKey: 'cartID' });
    models.Cart.hasMany(CartItem, { foreignKey: 'cartID' });

    CartItem.belongsTo(models.Product, { foreignKey: 'productID' });
    models.Product.hasMany(CartItem, { foreignKey: 'productID' });
  };
  return CartItem;
};
