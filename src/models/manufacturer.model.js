module.exports = (sequelize, DataTypes) => {
  const Manufacturer = sequelize.define(
    'Manufacturer',
    {
      manufacturerID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      manufacturerName: {
        type: DataTypes.STRING(100),
        allowNull: false
      }
    },
    {
      timestamps: false
    }
  );
  return Manufacturer;
};
