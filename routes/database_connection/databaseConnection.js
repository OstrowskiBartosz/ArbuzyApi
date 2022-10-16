var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var session = require('express-session');

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'shop_db',
  charset: 'utf8_unicode_ci'
});

module.exports = con;
