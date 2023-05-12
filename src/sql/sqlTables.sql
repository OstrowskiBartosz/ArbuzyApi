SET NAMES utf8;
drop database shop_db1;

create database shop_db1;

USE shop_db1;

CREATE TABLE users(
  userID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
  firstName VARCHAR(20) NOT NULL,
  lastName VARCHAR(30) NOT NULL,
  login VARCHAR(30) NOT NULL,
  password VARCHAR(60) NOT NULL,
  email VARCHAR(70) NOT NULL,
  cityName VARCHAR(50) NOT NULL,
  streetName VARCHAR(50) NOT NULL,
  ZIPCode VARCHAR(6) NOT NULL,
  userType TINYINT(1) NOT NULL,
  phoneNumber VARCHAR(9) NOT NULL,
  comment VARCHAR(500),
  VATNumber VARCHAR(10),
  companyName VARCHAR(100)
);

CREATE TABLE categories(
  categoryID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  categoryName VARCHAR(100) NOT NULL
);

CREATE TABLE manufacturers(
  manufacturerID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  manufacturerName VARCHAR(100) NOT NULL
);

CREATE TABLE products(
  productID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  categoryID INT NOT NULL,
  manufacturerID INT NOT NULL,
  quantity INT NOT NULL,
  productName VARCHAR(150) NOT NULL,
  description VARCHAR(5000) NOT NULL,
  dailyPromo BOOLEAN NOT NULL,
  weeklyPromo BOOLEAN NOT NULL,
  FOREIGN KEY (categoryID) REFERENCES categories(categoryID),
  FOREIGN KEY (manufacturerID) REFERENCES manufacturers(manufacturerID)
);

CREATE TABLE attributes(
  attributeID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  productID INT NOT NULL,
  property VARCHAR(80) NOT NULL,
  value VARCHAR(200) NOT NULL,
  type VARCHAR(10) NOT NULL,
  FOREIGN KEY (productID) REFERENCES products(productID)
);

CREATE TABLE prices(
  priceID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  productID INT NOT NULL,
  netPrice FLOAT(7,2) NOT NULL,
  grossPrice FLOAT(7,2) NOT NULL,
  taxPercentage INT NOT NULL,
  fromDate DATETIME,
  toDate DATETIME,
  FOREIGN KEY (productID) REFERENCES products(productID)
);

CREATE TABLE carts(
  cartID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  numberOfProducts INT NOT NULL,
  totalQuantityofProducts INT NOT NULL,
  totalPriceOfProducts FLOAT(7,2) NOT NULL,
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

CREATE TABLE cartItems(
  cartItemID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cartID INT NOT NULL,
  productID INT NOT NULL, 
  quantity INT NOT NULL,
  FOREIGN KEY (cartID) REFERENCES carts(cartID) ON DELETE CASCADE,
  FOREIGN KEY (productID) REFERENCES products(productID)
);

CREATE TABLE invoices(
  invoiceID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  invoiceDate DATETIME NOT NULL,
  netPrice FLOAT(7,2) NOT NULL,
  grossPrice FLOAT(7,2) NOT NULL,
  taxPercentage FLOAT(7,2) NOT NULL,
  status VARCHAR(100) NOT NULL,
  paymentMethod VARCHAR(50),
  name VARCHAR(50),
  cityName VARCHAR(50) NOT NULL,
  streetName VARCHAR(50) NOT NULL,
  ZIPCode VARCHAR(6) NOT NULL,
  VATNumber VARCHAR(20),
  companyName VARCHAR(100),
  CONSTRAINT CHK_PaymentMethod CHECK (paymentMethod='Credit card' OR paymentMethod='Cash' OR paymentMethod='Paypal' OR paymentMethod="PayU"),
  CONSTRAINT CHK_Status CHECK (status='Pending' OR status='Completed' OR status='Cancelled'),
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

CREATE TABLE InvoiceItems(
  invoiceItemID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  invoiceID INT NOT NULL,
  productID INT NOT NULL,
  productName VARCHAR(150) NOT NULL,
  netPrice FLOAT(7,2) NOT NULL,
  grossPrice FLOAT(7,2) NOT NULL,
  taxPercentage TINYINT NOT NULL,
  quantity TINYINT NOT NULL,
  FOREIGN KEY (invoiceID) REFERENCES invoices(invoiceID) ON DELETE CASCADE,
  FOREIGN KEY (productID) REFERENCES products(productID)
);
 
ALTER TABLE products CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE attributes CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE cartItems CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE categories CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;

