module.exports = (sequelize, DataTypes) => {
  const Attribute = sequelize.define(
    'Attribute',
    {
      attributeID: {
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
      property: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      value: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      type: {
        type: DataTypes.STRING(10),
        allowNull: false
      }
    },
    {
      timestamps: false
    }
  );

  Attribute.associate = (models) => {
    Attribute.belongsTo(models.Product, { as: 'Product', foreignKey: 'productID' });
    models.Product.hasMany(Attribute, { as: 'va', foreignKey: 'productID' });

    Attribute.belongsTo(models.Product, { as: 'Attributes', foreignKey: 'productID' });
    models.Product.hasMany(Attribute, { as: 'Attributes', foreignKey: 'productID' });

    Attribute.hasMany(Attribute, { as: 'values', foreignKey: 'attributeID' });
    Attribute.belongsTo(Attribute, { foreignKey: 'attributeID' });
  };

  return Attribute;
};
