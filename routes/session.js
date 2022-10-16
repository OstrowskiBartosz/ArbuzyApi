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

router.get('/', (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    var username = req.session.user;

    req.session.regenerate(function (err) {
      req.session.user = username;
      req.session.save();
      res.send('logged');
      res.end();
    });
  } else {
    res.clearCookie('user_sid');
    res.send('not logged');
    res.end();
  }
});
module.exports = router;
