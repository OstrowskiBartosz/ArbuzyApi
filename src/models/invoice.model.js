module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define(
    'Invoice',
    {
      invoiceID: {
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
      invoiceDate: {
        type: DataTypes.STRING(150),
        allowNull: false
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
      paymentMethod: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          customValidator(value) {
            if (
              value !== 'Credit card' &&
              value !== 'Cash' &&
              value !== 'Paypal' &&
              value !== 'PayU'
            ) {
              throw new Error('paymentMethod can only be one of four predefined values');
            }
          }
        }
      },
      status: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          customValidator(value) {
            if (value !== 'Pending' && value !== 'Completed' && value !== 'Cancelled') {
              throw new Error('status can only be one of three predefined values');
            }
          }
        }
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      cityName: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      streetName: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      ZIPCode: {
        type: DataTypes.STRING(6),
        allowNull: false
      },
      VATNumber: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      companyName: {
        type: DataTypes.STRING(100),
        allowNull: true
      }
    },
    {
      timestamps: false
    }
  );

  Invoice.associate = (models) => {
    Invoice.belongsTo(models.User, { foreignKey: 'userID' });
    models.User.hasMany(Invoice, { foreignKey: 'userID' });
  };

  return Invoice;
};
