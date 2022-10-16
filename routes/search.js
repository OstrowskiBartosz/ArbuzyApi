var express = require('express');
var router = express.Router();
var con = require('./database_connection/databaseConnection.js');
var async = require('async');

router.use(express.json());

function pobierzAtrybuty(sql, callback) {
  con.query(sql, function (err, resultAtrybuty) {
    if (err) return callback(err);
    callback(null, resultAtrybuty);
  });
}

function czyPobranoAtrybuty(produkt, callback) {
  var wynikiAtrybuty = [];
  var sql =
    `
  SELECT a.atrybut, a.wartosc, a.typ
  FROM produkty p
  INNER JOIN atrybuty a ON p.id_produktu=a.id_produktu
  WHERE p.id_produktu = \'` +
    produkt +
    `\' and a.typ = 1;`;
  pobierzAtrybuty(sql, function (err, resultAtrybuty) {
    if (resultAtrybuty.length > 0) {
      for (var rowAtrybuty in resultAtrybuty) {
        wynikiAtrybuty.push({
          atrybut: resultAtrybuty[rowAtrybuty].atrybut,
          wartosc: resultAtrybuty[rowAtrybuty].wartosc,
          typ: resultAtrybuty[rowAtrybuty].typ
        });
      }
    }
    callback(null, wynikiAtrybuty);
  });
}

function czyPobraneDane(result, callback) {
  wyniki = new Object();
  var wynikiParametry = [];
  async.forEachOf(
    result,
    (value, key, callback) => {
      czyPobranoAtrybuty(value.id_produktu, function (err, resultAtrybuty) {
        wynikiAtrybuty = resultAtrybuty;
        wynikiParametry.push({
          nazwa_produktu: value.nazwa_produktu,
          id_produktu: value.id_produktu,
          nazwa_kategorii: value.nazwa_kategorii,
          cena_brutto: value.cena_brutto,
          producent: value.nazwa_producenta,
          opis_produktu: value.opis_produktu,
          zdjecie: value.wartosc,
          atrybuty: wynikiAtrybuty
        });
      });
      wyniki.produkty = wynikiParametry;
      callback();
    },
    (err) => {
      if (err) console.error(err.message);
      callback(null, wyniki);
    }
  );
}

function pobierzLiczbeProduktow(sql, callback) {
  con.query(sql, function (err, result) {
    if (err) return callback(err);
    callback(null, result);
  });
}

function czyPobranoLiczbeProduktow(zapytania, wyniki, callback) {
  async.forEachOf(
    zapytania,
    (value, key, callback) => {
      pobierzLiczbeProduktow(value, function (err, result) {
        wyniki.liczba_przedmiotow = result[0].liczba_przedmiotow;
        callback(null, wyniki);
      });
    },
    (err) => {
      if (err) console.error(err.message);
      callback(null, wyniki);
    }
  );
}

function pobierzFiltry(sql, callback) {
  con.query(sql, function (err, result) {
    if (err) return callback(err);
    callback(null, result);
  });
}

function czyPobranoFiltry(zapytania, wyniki, callback) {
  async.forEachOf(
    zapytania,
    (value, key, callback) => {
      var atrybuty = [];
      var grupyFiltrowania = [];
      var ostatniAtrybut = null;
      var licznik = 0,
        suma = 0;
      var AtrybutyObiekt = new Object();
      pobierzFiltry(value, function (err, result) {
        for (var row in result) {
          if (result[row].atrybut != ostatniAtrybut && licznik !== 0 && ostatniAtrybut != null) {
            AtrybutyObiekt.atrybut = ostatniAtrybut;
            AtrybutyObiekt.wartosci = atrybuty;
            AtrybutyObiekt.liczba_produktow = suma;
            grupyFiltrowania.push(AtrybutyObiekt);
            AtrybutyObiekt = new Object();
            suma = 0;
            atrybuty = [];
            atrybuty.push({
              wartosc: result[row].wartosc,
              id: result[row].id_atrybutu,
              liczba_produktow: result[row].liczba
            });
            suma = suma + result[row].liczba;
            ostatniAtrybut = result[row].atrybut;
            licznik = 1;
          } else {
            atrybuty.push({
              wartosc: result[row].wartosc,
              id: result[row].id_atrybutu,
              liczba_produktow: result[row].liczba
            });
            suma = suma + result[row].liczba;
            ostatniAtrybut = result[row].atrybut;
            licznik++;
          }
          if (row == result.length - 1) {
            AtrybutyObiekt.atrybut = ostatniAtrybut;
            AtrybutyObiekt.wartosci = atrybuty;
            AtrybutyObiekt.liczba_produktow = suma;
            grupyFiltrowania.push(AtrybutyObiekt);
          }
        }
        wyniki.filtry = grupyFiltrowania;
        callback(null, wyniki);
      });
    },
    (err) => {
      if (err) console.error(err.message);
      callback(null, wyniki);
    }
  );
}

function pobierzKategoriee(sql, callback) {
  con.query(sql, function (err, result) {
    if (err) return callback(err);
    callback(null, result);
  });
}

function czyPobranoKategorie(zapytania, wyniki, callback) {
  async.forEachOf(
    zapytania,
    (value, key, callback) => {
      var grupyKategorii = [];
      var KategorieObiekt = new Object();
      pobierzKategoriee(value, function (err, result) {
        for (var row in result) {
          KategorieObiekt.nazwa_kategorii = result[row].nazwa_kategorii;
          KategorieObiekt.id_kategorii = result[row].id_kategorii;
          KategorieObiekt.liczba_produktow = result[row].liczba;
          grupyKategorii.push(KategorieObiekt);
          KategorieObiekt = new Object();
        }
        wyniki.kategorie = grupyKategorii;
        callback(null, wyniki);
      });
    },
    (err) => {
      if (err) console.error(err.message);
      callback(null, wyniki);
    }
  );
}

function pobierzProducentow(sql, callback) {
  con.query(sql, function (err, result) {
    if (err) return callback(err);
    callback(null, result);
  });
}

function czyPobranoProducentow(zapytania, wyniki, callback) {
  async.forEachOf(
    zapytania,
    (value, key, callback) => {
      var grupyproducentow = [];
      var ProducenciObiekt = new Object();
      pobierzProducentow(value, function (err, result) {
        for (var row in result) {
          ProducenciObiekt.nazwa_producenta = result[row].nazwa_producenta;
          ProducenciObiekt.id_producenta = result[row].id_producenta;
          ProducenciObiekt.liczba_produktow = result[row].liczba;
          grupyproducentow.push(ProducenciObiekt);
          ProducenciObiekt = new Object();
        }
        wyniki.producenci = grupyproducentow;
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
  let nazwa_produktu = req.body.nazwa_produktu;
  let kategoria = req.body.kategoria;
  let link = req.body.link;

  var filterString = `AND (`;

  var LinkSplit = decodeURIComponent(link).replace(/\+/g, ' ').split('&');
  LinkSplit.forEach((element) => {
    if (element.includes('g_k')) {
      filterString =
        filterString +
        ` OR k.id_kategorii LIKE \'` +
        element.substring(element.indexOf('g_k') + 3, element.indexOf('=')) +
        `\'`;
    } else if (element.includes('g_p')) {
      filterString =
        filterString +
        ` OR pp.id_producenta LIKE \'` +
        element.substring(element.indexOf('g_p') + 3, element.indexOf('=')) +
        `\'`;
    } else if (element.includes('w_f')) {
      filterString =
        filterString +
        ` OR a.atrybut LIKE \'` +
        element.substring(element.indexOf('m_f') + 3, element.indexOf('_w_f')) +
        `\' AND a.wartosc LIKE \'` +
        element.substring(element.indexOf('w_f') + 3, element.indexOf('=')) +
        `\'`;
    } else if (element.includes('g_f')) {
      filterString =
        filterString +
        ` OR a.atrybut LIKE \'` +
        element.substring(element.indexOf('g_f') + 3, element.indexOf('=')) +
        `\'`;
    }
  });
  var filterString = filterString + ` )`;
  if (filterString.length === 7) {
    filterString = filterString.replace('AND ( )', '');
  } else {
    filterString = filterString.replace(' OR ', '');
  }

  if (nazwa_produktu.length === 0) nazwa_produktu = ' ';

  if (kategoria === 'Wszędzie') kategoria = '';

  let strona = req.body.strona;
  let limit = req.body.limit;
  let sort = req.body.sort;
  let querysort;

  switch (sort) {
    case 'cena malejąco':
      querysort = 'ORDER BY cena_brutto DESC';
      break;
    case 'cena rosnąco':
      querysort = 'ORDER BY cena_brutto ASC';
      break;
    case 'nazwa produktu A-Z':
      querysort = 'ORDER BY nazwa_produktu ASC';
      break;
    case 'nazwa produktu Z-A':
      querysort = 'ORDER BY nazwa_produktu DESC';
      break;
    default:
      querysort = '';
  }

  if (nazwa_produktu && strona && limit) {
    let offset = limit * strona - limit;
    var zapytania = [];
    zapytania[0] =
      `
    SELECT DISTINCT nazwa_produktu, id_produktu, nazwa_kategorii, cena_brutto, nazwa_producenta, wartosc from (
      SELECT p.nazwa_produktu, p.id_produktu, k.nazwa_kategorii, c.cena_brutto, pp.nazwa_producenta, 
      (SELECT at.wartosc 
        FROM atrybuty at
        WHERE at.typ = 2
        AND at.id_produktu = p.id_produktu
      ) AS wartosc
      FROM produkty p
      INNER JOIN ceny c ON p.id_produktu=c.id_produktu
      INNER JOIN kategorie k ON p.id_kategorii=k.id_kategorii
      INNER JOIN producenci pp ON p.id_producenta=pp.id_producenta
      LEFT JOIN atrybuty a ON p.id_produktu=a.id_produktu
      WHERE nazwa_produktu like \'%` +
      nazwa_produktu +
      `%\'
      AND k.nazwa_kategorii like \'%` +
      kategoria +
      `%\'
      ` +
      filterString +
      `) AS x
    ${querysort} 
    LIMIT ` +
      limit +
      ` OFFSET ` +
      offset +
      `;`;
    con.query(zapytania[0], (err, result) => {
      czyPobraneDane(result, function (err, wyniki) {
        zapytania[0] =
          `
        SELECT count(DISTINCT(p.id_produktu)) as liczba_przedmiotow
        FROM produkty p
        INNER JOIN atrybuty a ON p.id_produktu=a.id_produktu
        INNER JOIN ceny c ON p.id_produktu=c.id_produktu
        INNER JOIN kategorie k ON p.id_kategorii=k.id_kategorii
        INNER JOIN producenci pp ON p.id_producenta=pp.id_producenta
        WHERE nazwa_produktu like \'%` +
          nazwa_produktu +
          `%\'
        AND k.nazwa_kategorii like \'%` +
          kategoria +
          `%\'
        ${filterString};`;
        czyPobranoLiczbeProduktow(zapytania, wyniki, function (err, wyniki) {
          zapytania[0] =
            `
          SELECT a.id_atrybutu, a.atrybut, a.wartosc, a.typ, count(a.wartosc) as liczba
          FROM produkty p
          INNER JOIN atrybuty a ON p.id_produktu=a.id_produktu
          INNER JOIN kategorie k ON p.id_kategorii=k.id_kategorii
          INNER JOIN producenci pp ON p.id_producenta=pp.id_producenta
          WHERE nazwa_produktu like \'%` +
            nazwa_produktu +
            `%\' and a.typ != 2 and a.typ != 3
          AND k.nazwa_kategorii like \'%` +
            kategoria +
            `%\'
          ${filterString} 
          GROUP BY a.wartosc
          ORDER BY a.atrybut;`;
          czyPobranoFiltry(zapytania, wyniki, function (err, wyniki) {
            zapytania[0] =
              `
            SELECT k.id_kategorii, k.nazwa_kategorii, count(p.nazwa_produktu) as liczba
            FROM produkty p
            INNER JOIN kategorie k ON p.id_kategorii=k.id_kategorii
            WHERE nazwa_produktu like \'%` +
              nazwa_produktu +
              `%\'
            AND k.nazwa_kategorii like \'%` +
              kategoria +
              `%\'
            GROUP BY nazwa_kategorii;`;
            czyPobranoKategorie(zapytania, wyniki, function (err, wyniki) {
              zapytania[0] =
                `
              SELECT pp.id_producenta, pp.nazwa_producenta, count(p.nazwa_produktu) as liczba
              FROM produkty p
              INNER JOIN producenci pp ON p.id_producenta=pp.id_producenta
              INNER JOIN kategorie k ON p.id_kategorii=k.id_kategorii 
              WHERE nazwa_produktu like \'%` +
                nazwa_produktu +
                `%\'
              AND k.nazwa_kategorii like \'%` +
                kategoria +
                `%\'
              GROUP BY nazwa_producenta;`;
              czyPobranoProducentow(zapytania, wyniki, function (err, wyniki) {
                res.send(JSON.stringify(wyniki, null, 3));
                res.end();
              });
            });
          });
        });
      });
    });
  } else {
    res.send('wyslij poprawne dane.');
    res.end();
  }
});
module.exports = router;
