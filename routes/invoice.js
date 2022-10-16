var express = require('express');
var router = express.Router();
var con = require('./database_connection/databaseConnection.js');
router.use(express.json());
var async = require('async');

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
  let zapytania = [];
  zapytania[0] = `SELECT * FROM Uzytkownicy WHERE login = \'` + uzytkownik + `\';`;
  czyZnalezionoUzytkownika(zapytania, wyniki, function (err, wyniki) {
    if (wyniki.length > 0) {
      var invoiceData = { error: true };
      let user = req.session.user;
      let invoiceID = req.body.invoiceID;
      var sql = "SELECT id_uzytkownika FROM uzytkownicy WHERE login = '" + user + "';";
      con.query(sql, function (err, result) {
        userID = result[0].id_uzytkownika;
        var sql =
          'SELECT data, wartosc_netto, wortosc_brutto, nazwa, ulica, miasto, kod_pocztowy, numer_nip, nazwa_firmy FROM faktury WHERE id_uzytkownika = ' +
          userID +
          ' AND id_faktury = ' +
          invoiceID +
          ' ORDER BY id_faktury DESC;';
        con.query(sql, function (err, result) {
          if (result.length > 0) {
            invoiceData = {
              ...invoiceData,
              error: false,
              invoiceID: req.body.invoiceID,
              invoiceDate: result[0].data,
              invoiceNetto: result[0].wartosc_netto,
              invoiceBrutto: result[0].wortosc_brutto,
              invoiceNazwa: result[0].nazwa,
              invoiceUlica: result[0].ulica,
              invoiceMiasto: result[0].miasto,
              invoiceKod: result[0].kod_pocztowy,
              invoiceNIP: result[0].numer_nip,
              invoiceFirma: result[0].nazwa_firmy
            };
            var sql =
              'SELECT pf.id_produktu, p.nazwa_producenta, k.nazwa_kategorii, pf.nazwa_produktu, pf.cena_netto, pf.cena_brutto, pf.procent_vat, pf.ilosc ' +
              'FROM ((pozycje_faktur pf ' +
              'INNER JOIN producenci p ON pf.id_producenta = p.id_producenta) ' +
              'INNER JOIN kategorie k ON pf.id_kategorii = k.id_kategorii) ' +
              'WHERE pf.id_faktury = ' +
              invoiceID;
            con.query(sql, function (err, result) {
              invoiceData = {
                ...invoiceData,
                produkty: result
              };
              res.send(JSON.stringify(invoiceData));
              res.end();
            });
          } else {
            res.send(JSON.stringify(invoiceData));
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
