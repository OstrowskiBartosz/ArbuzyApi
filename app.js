var express = require('express');
var path = require('path');
var logger = require('morgan');

var createError = require('http-errors');
var cors = require('cors');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var sessionRouter = require('./routes/session');
var searchRouter = require('./routes/search');
// var addToCartRouter = require("./routes/addtocart");
var CartRouter = require('./routes/cart');
// var cartQuantity = require("./routes/cartQuantity");
var profileOrders = require('./routes/profileOrders');
var invoice = require('./routes/invoice');
var product = require('./routes/product');
var buy = require('./routes/buy');
var summary = require('./routes/summary');
var deleteUser = require('./routes/deleteUser');
var updateUser = require('./routes/updateUser');

const searchHints = require('./routes/searchHints');

var app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    allowCredentials: true,
    credentials: true
  })
);

var Storeoptions = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'shop_db'
};
var sessionStore = new MySQLStore(Storeoptions);
app.use(
  session({
    key: 'user_sid',
    secret: 'idealpancake',
    store: sessionStore,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2,
      httpOnly: false
    }
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/session', sessionRouter);
app.use('/search', searchRouter);
app.use('/search', searchRouter);
// app.use('/addtocart', addToCartRouter);
app.use('/cart', CartRouter);
// app.use('/cartQuantity', cartQuantity);
app.use('/profileOrders', profileOrders);
app.use('/invoice', invoice);
app.use('/product', product);
app.use('/buy', buy);
app.use('/summary', summary);
app.use('/deleteUser', deleteUser);
app.use('/updateUser', updateUser);
app.use('/searchHints', searchHints);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
