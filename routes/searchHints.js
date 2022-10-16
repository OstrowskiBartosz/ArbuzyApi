var express = require('express');
var router = express.Router();
var sendQueryToDatabase = require('./database_connection/sendQueryToDatabase.js');
router.use(express.json());

const selectFromProducts = async (searchValue) => {
  let sqlQuery = `SELECT DISTINCT nazwa_produktu
                     FROM produkty 
                     WHERE nazwa_produktu LIKE '%${searchValue}%'`;
  const result = await sendQueryToDatabase(sqlQuery);
  return result;
};
const selectFromCategories = async (searchValue) => {
  let sqlQuery = `SELECT DISTINCT nazwa_kategorii
                     FROM kategorie
                     WHERE nazwa_kategorii LIKE '%${searchValue}%'`;
  const result = await sendQueryToDatabase(sqlQuery);
  return result;
};
const selectFromProducers = async (searchValue) => {
  let sqlQuery = `SELECT DISTINCT nazwa_producenta, id_producenta
                     FROM producenci
                     WHERE nazwa_producenta LIKE '%${searchValue}%'`;
  const result = await sendQueryToDatabase(sqlQuery);
  return result;
};

router.post('/', async (req, res, next) => {
  const searchValue = req.body.searchValue;
  const productsResults = await selectFromProducts(searchValue);
  const categoriesResults = await selectFromCategories(searchValue);
  const producersResults = await selectFromProducers(searchValue);
  let products = [];
  let categories = [];
  let producers = [];
  productsResults.forEach((product) => {
    products.push(product);
  });
  categoriesResults.forEach((category) => {
    categories.push(category);
  });
  producersResults.forEach((producer) => {
    producers.push(producer);
  });
  let responseObject = {
    products: products,
    categories: categories,
    producers: producers
  };
  res.send(JSON.stringify(responseObject, null, 3));
});

module.exports = router;
