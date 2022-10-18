module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    'Cart',
    {
      cartID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      userID: {
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'userID'
        }
      },
      numberOfProducts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      totalQuantityofProducts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      totalPriceOfProducts: {
        type: DataTypes.FLOAT(7, 2),
        defaultValue: 0,
        allowNull: false
      }
    },
    {
      timestamps: false
    }
  );

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, { foreignKey: 'userID', onDelete: 'CASCADE' });
    models.User.hasOne(Cart, { foreignKey: 'userID' });
  };
  return Cart;
};
