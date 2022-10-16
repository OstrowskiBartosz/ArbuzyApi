var express = require('express');
var router = express.Router();
var con = require('./database_connection/databaseConnection.js');
var async = require('async');

router.use(express.json());

router.get('/', function (req, res, next) {
  let uzytkownik = req.session.user;
  var wyniki;
  sql =
    `
  SELECT * FROM uzytkownicy WHERE login = \'` +
    uzytkownik +
    `\';`;
  con.query(sql, function (err, result) {
    if (result.length > 0) {
      let id = result[0].id_uzytkownika;
      sql = `
      SELECT p.nazwa_produktu, pwk.id_produktu, c.cena_brutto, pwk.ilosc, pp.nazwa_producenta, u.imie, u.nazwisko, u.miasto_zamieszkania, u.ulica_zamieszkania, kod_pocztowy, nazwa_firmy
      from produkty_w_koszykach pwk
      INNER JOIN produkty p ON p.id_produktu = pwk.id_produktu
      INNER JOIN ceny c ON pwk.id_produktu=c.id_produktu
      INNER JOIN uzytkownicy u ON pwk.id_uzytkownika=u.id_uzytkownika
      INNER JOIN producenci pp ON p.id_producenta=pp.id_producenta
      where pwk.id_uzytkownika = ${id};`;
      con.query(sql, function (err, result) {
        var grupyProduktow = [];
        for (var row in result) {
          let ProduktObiekt = new Object();
          ProduktObiekt.nazwa_produktu = result[row].nazwa_produktu;
          ProduktObiekt.id_produktu = result[row].id_produktu;
          ProduktObiekt.cena = result[row].cena_brutto;
          ProduktObiekt.ilosc = result[row].ilosc;
          ProduktObiekt.producent = result[row].nazwa_producenta;
          grupyProduktow.push(ProduktObiekt);
        }
        let wyniki = new Object();
        wyniki.produkty = grupyProduktow;
        let DostawaObiekt = new Object();
        DostawaObiekt.imie = result[0].imie;
        DostawaObiekt.nazwisko = result[0].nazwisko;
        DostawaObiekt.miasto = result[0].miasto_zamieszkania;
        DostawaObiekt.ulica = result[0].ulica_zamieszkania;
        DostawaObiekt.kod = result[0].kod_pocztowy;
        DostawaObiekt.nazwa_firmy = result[0].nazwa_firmy;
        wyniki.dane_dostawy = DostawaObiekt;

        res.send(wyniki);
      });
    } else {
      res.send('Wystąpił błąd.');
      res.end();
    }
  });
});
module.exports = router;
