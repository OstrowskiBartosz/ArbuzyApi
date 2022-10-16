var express = require('express');
var router = express.Router();
var con = require('./database_connection/databaseConnection.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.use(express.json());

con.connect(function (err) {
  if (err) throw err;

  router.get('/', function (req, res, next) {
    let uzytkownik = req.session.user;
    var sql =
      `
    SELECT count(DISTINCT(pw.id_produktu)) as liczba
    FROM Uzytkownicy u
    INNER JOIN produkty_w_koszykach pw ON pw.id_uzytkownika=u.id_uzytkownika
    WHERE login = \'` +
      uzytkownik +
      `\';`;
    con.query(sql, function (err, result) {
      res.send(JSON.stringify(result[0].liczba));
    });
  });
  router.post('/', function (req, res, next) {
    let username = req.body.login;
    let email = req.body.email;
    var sql =
      "SELECT * FROM uzytkownicy WHERE login = '" + username + "' or adres_email = '" + email + "'";
    con.query(sql, function (err, result) {
      if (result.length > 0) {
        res.send('Dana nazwa użytkownika lub adres email już istnieje.');
      } else {
        var sql = `INSERT INTO uzytkownicy (login, adres_email, imie, nazwisko, telefon, nazwa_firmy, numer_nip, ulica_zamieszkania, miasto_zamieszkania, kod_pocztowy, typ_uzytkownika, haslo)
           VALUES (`;
        for (var propName in req.body) {
          if (
            req.body.hasOwnProperty(propName) &&
            req.body[propName] != '' &&
            propName != 'haslo'
          ) {
            sql = sql + "'" + req.body[propName] + "', ";
          }
          if (
            req.body.hasOwnProperty(propName) &&
            req.body[propName] == '' &&
            propName != 'haslo'
          ) {
            sql = sql + ' NULL, ';
          }
        }
        sql = sql + "'0',";
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(req.body['haslo'], salt, function (err, hash) {
            sql = sql + "'" + hash + "');";
            con.query(sql, function (err, result) {
              req.session.user = username;
              req.session.save();
              res.send('signedup');
              if (err) throw err;
            });
          });
        });
      }
    });
  });
});

module.exports = router;
