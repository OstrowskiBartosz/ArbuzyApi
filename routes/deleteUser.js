var express = require('express');
var router = express.Router();
var con = require('./database_connection/databaseConnection.js');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cookieParser());

router.post('/', (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    let user = req.session.user;
    var sql = "SELECT id_uzytkownika FROM uzytkownicy WHERE login = '" + user + "';";
    con.query(sql, function (err, result) {
      userID = result[0].id_uzytkownika;
      var sql = "UPDATE faktury SET id_uzytkownika=1 WHERE id_uzytkownika = '" + userID + "';";
      con.query(sql, function (err, result) {
        var sql = "DELETE FROM uzytkownicy WHERE login = '" + user + "';";
        con.query(sql, function (err, result) {
          res.clearCookie('user_sid');
          req.session.destroy();
          res.send('loggedout');
          res.end();
        });
      });
    });
  } else {
    res.send('wtf?');
    res.end();
  }
});
module.exports = router;
