const invoiceService = require('../services/invoice.service');

const getInvoice = async (req, res) => {
  try {
    const { login: session } = req.session;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));
    const { invoiceID } = req.params;
    if (!invoiceID) return res.status(400).send(JSON.stringify({ message: 'No req data.' }));

    const invoice = await invoiceService.getInvoice(session, invoiceID);
    const { status, data, message } = invoice;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { login: session } = req.session;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));
    const { invoiceID } = req.params;
    if (!invoiceID) return res.status(400).send(JSON.stringify({ message: 'No req data.' }));

    const invoice = await invoiceService.updateInvoice(session, invoiceID);
    const { status, data, message } = invoice;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

const getInvoices = async (req, res) => {
  try {
    const { login: session } = req.session;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));

    const invoice = await invoiceService.getInvoices(session);
    const { status, data, message } = invoice;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

const postInvoice = async (req, res) => {
  try {
    const { login: session } = req.session;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));

    const invoice = await invoiceService.postInvoice(session);
    const { status, data, message } = invoice;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

module.exports = {
  updateInvoice,
  getInvoice,
  getInvoices,
  postInvoice
};
