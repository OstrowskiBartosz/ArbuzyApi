const manufacturerService = require('../services/manufacturer.service');

const getManufacturers = async (req, res) => {
  try {
    const { manufacturerName } = req.params;
    if (!manufacturerName) return res.status(400).send(JSON.stringify({ message: 'No req data.' }));

    const manufacturer = await manufacturerService.getManufacturers(manufacturerName);
    const { status, data, message } = manufacturer;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ data: null, message: e.message }));
  }
};

const getManufacturerHints = async (req, res) => {
  try {
    const { manufacturerName } = req.params;
    if (!manufacturerName) return res.status(400).send(JSON.stringify({ message: 'No req data.' }));

    const manufacturerHints = await manufacturerService.getManufacturerHints(manufacturerName);
    const { status, data, message } = manufacturerHints;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ data: null, message: e.message }));
  }
};

module.exports = {
  getManufacturers,
  getManufacturerHints
};
