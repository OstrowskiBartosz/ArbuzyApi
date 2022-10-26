const express = require('express');
const logger = require('morgan');
const path = require('path');
const createError = require('http-errors');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dotenv = require('dotenv').config({ path: `${__dirname}/.env` });

const userRouter = require('./src/routes/user.route');
const sessionRouter = require('./src/routes/session.route');
const productRouter = require('./src/routes/product.route');
const manufacturerRouter = require('./src/routes/manufacturer.route');
const categoryRouter = require('./src/routes/category.route');
const cartRouter = require('./src/routes/cart.route');
const cartItemRouter = require('./src/routes/cartItem.route');
const invoiceouter = require('./src/routes/invoice.route');

const app = express();

const db = require('./src/models');
db.sequelize
  .sync({})
  .then(() => {})
  .catch((err) => {});

app.use(cors({ origin: 'http://localhost:3000', allowCredentials: true, credentials: true }));

const Storeoptions = {
  host: process.env.DATABASE_HOST,
  user: process.env.USER_NAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NANE
};
const sessionStore = new MySQLStore(Storeoptions);

app.use(
  session({
    key: process.env.DATABASE_SESSION_KEY,
    secret: process.env.DATABASE_SESSION_SECRET,
    store: sessionStore,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2, httpOnly: false }
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRouter);
app.use('/session', sessionRouter);
app.use('/category', categoryRouter);
app.use('/manufacturer', manufacturerRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/cartItem', cartItemRouter);
app.use('/invoice', invoiceouter);

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
