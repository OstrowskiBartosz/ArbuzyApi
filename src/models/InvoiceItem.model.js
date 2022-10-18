module.exports = (sequelize, DataTypes) => {
  const InvoiceItem = sequelize.define(
    'InvoiceItem',
    {
      invoiceItemID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      invoiceID: {
        type: DataTypes.INTEGER,
        references: {
          model: 'invoices',
          key: 'invoiceID'
        }
      },
      productID: {
        type: DataTypes.INTEGER,
        references: {
          model: 'products',
          key: 'productID'
        }
      },
      productName: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      netPrice: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      grossPrice: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      taxPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.STRING(10),
        allowNull: false
      }
    },
    {
      timestamps: false
    }
  );

  InvoiceItem.associate = (models) => {
    InvoiceItem.belongsTo(models.Invoice, { foreignKey: 'InvoiceID' });
    models.Invoice.hasMany(InvoiceItem, { foreignKey: 'InvoiceID' });

    InvoiceItem.belongsTo(models.Product, { foreignKey: 'productID' });
    models.Product.hasMany(InvoiceItem, { foreignKey: 'productID' });
  };
  return InvoiceItem;
};
