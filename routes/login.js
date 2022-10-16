var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
var con = require('./database_connection/databaseConnection.js');
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.post('/', function (req, res, next) {
  let username = req.body.login;
  let password = req.body.haslo;

  if (username && password) {
    var sql = "SELECT * FROM uzytkownicy WHERE login = '" + username + "';";
    con.query(sql, function (err, result) {
      if (result.length > 0) {
        if (bcrypt.compareSync(password, result[0].haslo)) {
          req.session.user = username;
          req.session.save();
          res.send('logged');
        } else {
          res.send('Niepoprawny użytkownik i/lub hasło!');
        }
      } else {
        res.send('Niepoprawny użytkownik i/lub hasło!');
      }
      res.end();
    });
  } else {
    res.send('Wprowadz poprawna nazwe uzytkownika i haslo!');
    res.end();
  }
});

module.exports = router;
