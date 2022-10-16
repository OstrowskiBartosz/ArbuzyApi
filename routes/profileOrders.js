var express = require('express');
var router = express.Router();
var con = require('./database_connection/databaseConnection.js');
router.use(express.json());
var async = require('async');

function getUserId(user, res) {
  return new Promise(function (resolve, reject) {
    var sql = "SELECT id_uzytkownika FROM uzytkownicy WHERE login = '" + user + "';";
    con.query(sql, function (err, result) {
      resolve(result[0].id_uzytkownika);
    });
  });
}

function pobierzUzytkownikow(sql, callback) {
  con.query(sql, function (err, result) {
    if (err) return callback(err);
    callback(null, result);
  });
}

function czyZnalezionoUzytkownika(zapytania, wyniki, callback) {
  async.forEachOf(
    zapytania,
    (value, key, callback) => {
      pobierzUzytkownikow(value, function (err, result) {
        wyniki = result;
        callback(null, wyniki);
      });
    },
    (err) => {
      if (err) console.error(err.message);
      callback(null, wyniki);
    }
  );
}

router.post('/', function (req, res, next) {
  let uzytkownik = req.session.user;
  let wyniki;
  var zapytania = [];
  zapytania[0] = `SELECT * FROM Uzytkownicy WHERE login = \'` + uzytkownik + `\';`;
  czyZnalezionoUzytkownika(zapytania, wyniki, function (err, wyniki) {
    if (wyniki.length > 0) {
      var userData = { error: true };
      let user = req.session.user;
      var sql =
        "SELECT id_uzytkownika, imie, nazwisko, miasto_zamieszkania, ulica_zamieszkania, kod_pocztowy, telefon, numer_nip, nazwa_firmy FROM uzytkownicy WHERE login = '" +
        user +
        "';";
      con.query(sql, function (err, result) {
        userID = result[0].id_uzytkownika;
        userData = {
          ...userData,
          user: result
        };
        var sql =
          "SELECT * FROM faktury WHERE id_uzytkownika = '" + userID + "' ORDER BY id_faktury DESC;";
        con.query(sql, function (err, result) {
          if (result.length > 0) {
            userData = {
              ...userData,
              invoice: result
            };
            res.send(JSON.stringify(userData));
            res.end();
          } else {
            res.send(JSON.stringify(userData));
            res.end();
          }
        });
      });
    } else {
      res.send('Wystąpił błąd.');
      res.end();
    }
  });
});

module.exports = router;
