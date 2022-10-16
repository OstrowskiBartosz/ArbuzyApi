var express = require('express');
var router = express.Router();
var con = require('./database_connection/databaseConnection.js');
router.use(express.json());

router.post('/', function (req, res, next) {
  let user = req.session.user;
  var sql =
    'UPDATE uzytkownicy ' +
    'SET ulica_zamieszkania = "' +
    req.body.ulica +
    '", miasto_zamieszkania = "' +
    req.body.miasto +
    '", kod_pocztowy = "' +
    req.body.kod +
    '"';
  if (req.body.imie) {
    sql = sql + ', imie = "' + req.body.imie + '"';
  }
  if (req.body.nazwisko) {
    sql = sql + ', nazwisko = "' + req.body.nazwisko + '"';
  }
  if (req.body.firma) {
    sql = sql + ', nazwa_firmy = "' + req.body.firma + '"';
  }
  if (req.body.nip) {
    sql = sql + ', numer_nip = "' + req.body.nip + '"';
  }
  sql = sql + ' WHERE login = "' + user + '";';

  con.query(sql, function (err, result) {
    if (err) {
      res.send(err);
      res.end();
    } else {
      res.send(result);
      res.end();
    }
  });
});

module.exports = router;
