const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv').config({ path: `${__dirname}/./../../.env` });

const { S_DB_HOST, S_DB_USER, S_DB_PASSWORD, S_DB_NAME, S_DB_DIALECT } = process.env;

const config = {
  host: S_DB_HOST,
  dialect: S_DB_DIALECT,
  dialectOptions: {
    charset: 'utf8'
  },
  define: {
    timestamps: false
  },
  timezone: '+02:00',
  logging: false
};

const sequelize = new Sequelize(S_DB_NAME, S_DB_USER, S_DB_PASSWORD, config);

const db = {};
const models = [
  'User',
  'Category',
  'Manufacturer',
  'Product',
  'Attribute',
  'Price',
  'Cart',
  'CartItem',
  'Invoice',
  'InvoiceItem'
];

models.forEach((model) => {
  db[model] = require(`${__dirname}\\${model}.model.js`)(sequelize, DataTypes);
});

Object.keys(db).forEach((model) => {
  if (db[model].associate) {
    db[model].associate(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
