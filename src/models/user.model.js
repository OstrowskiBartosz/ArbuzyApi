module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      userID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      firstName: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
      login: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
      password: {
        type: DataTypes.STRING(60),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(70),
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
        allowNull: false,
        validate: {
          is: /^[0-9-]{6}$/i
        }
      },
      userType: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      phoneNumber: {
        type: DataTypes.STRING(9),
        allowNull: false,
        validate: {
          is: /^[0-9]{9}$/i
        }
      },
      comment: {
        type: DataTypes.STRING(500),
        allowNull: true
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
  return User;
};
