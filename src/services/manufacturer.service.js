const db = require('../models');
const { Manufacturer } = db;
const { Op } = require('sequelize');

const getManufacturers = async (manufacturerName) => {
  try {
    const manufacturer = await Manufacturer.findAll({
      where: { manufacturerName: { [Op.like]: `%${manufacturerName}%` } }
    });
    return { status: 200, data: manufacturer, message: 'Manufacturer retrieved.' };
  } catch (e) {
    return { status: 500, data: [], message: e.message };
  }
};

module.exports = {
  getManufacturers
};
