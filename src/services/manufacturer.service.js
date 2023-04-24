const db = require('../models');
const { Manufacturer } = db;
const { Op } = require('sequelize');

const getManufacturers = async (manufacturerName) => {
  try {
    const manufacturers = await Manufacturer.findAll({
      where: { manufacturerName: { [Op.like]: `%${manufacturerName}%` } }
    });
    return { status: 200, data: manufacturers, message: 'Manufacturer retrieved.' };
  } catch (e) {
    return { status: 500, data: [], message: e.message };
  }
};

const getManufacturerHints = async (manufacturerName) => {
  try {
    const manufacturerHints = await Manufacturer.findAll({
      where: { manufacturerName: { [Op.like]: `%${manufacturerName}%` } }
    });
    return { status: 200, data: manufacturerHints, message: 'Manufacturer hints retrieved.' };
  } catch (e) {
    return { status: 500, data: [], message: e.message };
  }
};

module.exports = {
  getManufacturers,
  getManufacturerHints
};
