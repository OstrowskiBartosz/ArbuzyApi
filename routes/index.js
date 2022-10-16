var express = require('express');
var router = express.Router();
var con = require('./database_connection/databaseConnection.js');
router.use(express.json());

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function (req, res, next) {
  var produkty = { error: true };
  var sql =
    'SELECT produkty.id_produktu, produkty.nazwa_produktu, producenci.nazwa_producenta, atrybuty.wartosc, ceny.cena_brutto ' +
    'FROM (SELECT * FROM produkty ORDER BY rand() LIMIT 6) produkty ' +
    'LEFT JOIN atrybuty ON produkty.id_produktu = atrybuty.id_produktu AND atrybuty.typ=2 ' +
    'LEFT JOIN producenci ON produkty.id_producenta = producenci.id_producenta ' +
    'LEFT JOIN ceny ON produkty.id_produktu = ceny.id_produktu;';
  con.query(sql, function (err, result) {
    produkty = {
      ...produkty,
      error: false,
      polecane: result
    };
    var sql =
      'SELECT p.id_produktu, p.nazwa_produktu, pp.nazwa_producenta, c.cena_brutto, a.wartosc, sum(pf.ilosc) as sprzedanych ' +
      'FROM ((((pozycje_faktur pf ' +
      'INNER JOIN produkty p ON pf.id_produktu = p.id_produktu) ' +
      'INNER JOIN ceny c ON pf.id_produktu = c.id_produktu) ' +
      'INNER JOIN producenci pp ON pf.id_producenta = pp.id_producenta) ' +
      'INNER JOIN atrybuty a ON pf.id_produktu = a.id_produktu AND typ = 2) ' +
      'GROUP BY pf.id_produktu ' +
      'ORDER BY sum(pf.ilosc) DESC ' +
      'LIMIT 6;';
    con.query(sql, function (err, result) {
      produkty = {
        ...produkty,
        kupowane: result
      };
      res.send(JSON.stringify(produkty));
      res.end();
    });
  });
});

module.exports = router;
