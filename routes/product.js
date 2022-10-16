var express = require('express');
var router = express.Router();
var con = require('./database_connection/databaseConnection.js');
router.use(express.json());

router.post('/', function (req, res, next) {
  var productData = { error: true };
  let productID = req.body.productID;
  var sql =
    'SELECT p.id_produktu, p.id_kategorii, ka.nazwa_kategorii, p.id_producenta, pr.nazwa_producenta, p.nazwa_produktu, p.opis_produktu ' +
    'FROM ((produkty p ' +
    'INNER JOIN kategorie ka ON p.id_kategorii = ka.id_kategorii) ' +
    'INNER JOIN producenci pr ON p.id_producenta = pr.id_producenta) ' +
    'WHERE id_produktu = ' +
    productID +
    ';';
  con.query(sql, function (err, result) {
    if (result.length > 0) {
      productData = {
        ...productData,
        error: false,
        productID: req.body.productID,
        produktIDKategorii: result[0].id_kategorii,
        productNazwaKategorii: result[0].nazwa_kategorii,
        produktIDProducenta: result[0].id_producenta,
        productNazwaProducenta: result[0].nazwa_producenta,
        productNazwa: result[0].nazwa_produktu,
        productOpis: result[0].opis_produktu
      };
      var sql =
        'SELECT atrybut, wartosc, typ ' +
        'FROM atrybuty ' +
        'WHERE id_produktu = ' +
        productID +
        ' AND (typ = 2 OR typ = 3) ' +
        'ORDER BY typ asc;';
      con.query(sql, function (err, result) {
        productData = {
          ...productData,
          zdjecia: result
        };
        var sql =
          'SELECT atrybut, wartosc, typ ' +
          'FROM atrybuty ' +
          'WHERE id_produktu = ' +
          productID +
          ' AND (typ = 1);';
        con.query(sql, function (err, result) {
          productData = {
            ...productData,
            atrybutMain: result
          };
          var sql =
            'SELECT atrybut, wartosc, typ ' +
            'FROM atrybuty ' +
            'WHERE id_produktu = ' +
            productID +
            ' AND (typ = 0);';
          con.query(sql, function (err, result) {
            productData = {
              ...productData,
              atrybutSub: result
            };
            var sql =
              'SELECT cena_netto, cena_brutto, procentvat, od, do ' +
              'FROM ceny ' +
              'WHERE id_produktu = ' +
              productID +
              ';';
            con.query(sql, function (err, result) {
              productData = {
                ...productData,
                ceny: result
              };
              res.send(JSON.stringify(productData));
              res.end();
            });
          });
        });
      });
    } else {
      res.send(JSON.stringify(productData));
      res.end();
    }
  });
});

module.exports = router;
